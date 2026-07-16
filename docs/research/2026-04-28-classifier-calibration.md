# Tier 2 Classifier Calibration — 2026-04-28

**Owner:** NEU-621
**Status:** Insufficient data — no field passes the gate; default `CLASSIFIER_BLOCKING_FIELDS` remains empty.

---

## Decision

| Field                          | Calibration n | OOD n | Calibration agreement | Calibration FP rate | OOD precision | Gate    | Decision                      |
| ------------------------------ | ------------- | ----- | --------------------- | ------------------- | ------------- | ------- | ----------------------------- |
| `rendering_clarity`            | —             | —     | —                     | —                   | —             | not run | **no-go (insufficient data)** |
| `vocabulary_appropriate`       | —             | —     | —                     | —                   | —             | not run | **no-go (insufficient data)** |
| `math_notation_rendering_risk` | —             | —     | —                     | —                   | —             | not run | **no-go (insufficient data)** |
| `definition_constructive`      | —             | —     | —                     | —                   | —             | not run | **no-go (insufficient data)** |
| `epistemic_consistency`        | —             | —     | —                     | —                   | —             | not run | **no-go (insufficient data)** |
| `overall_fit`                  | —             | —     | —                     | —                   | —             | not run | **no-go (insufficient data)** |

No field flips. Default `CLASSIFIER_BLOCKING_FIELDS` ships empty.

---

## Reason

The Tier 2 soft-warn pipeline (NEU-620) was wired into `createTopicWithChunks` immediately upstream of this ticket; at the time of this report the in-production soft-warn corpus is < 4 weeks old and contains far fewer than the 100-chunk minimum per field required by the calibration spec. Running the analysis on the available corpus would yield confidence intervals so wide that no per-field gate decision could be defended.

---

## Re-run criteria

Run a fresh calibration when **all** of these are true:

1. `CLASSIFIER_ENABLE_AT_CREATE=true` has been live in production for ≥ 4 weeks.
2. ≥ 100 chunks per candidate field in the soft-warn window have a non-null `validator_report.tier2` entry.
3. An OOD sample of ≥ 50 chunks drawn from a different topic-subject distribution than the calibration sample is available.

When the criteria hold, follow `docs/runbooks/classifier-blocking-activation.md` to draw samples, label, run `pnpm tsx scripts/classifier-calibration.ts`, and publish a new dated report. **One field per deploy.**

---

## What this ticket ships in lieu of a flip

NEU-621 still ships the activation infrastructure, gated behind an empty default:

- `CLASSIFIER_BLOCKING_FIELDS` env variable parsed by `resolve-classifier-config.ts` into `Set<VerdictFieldName>`. Empty/unset → soft-warn only (NEU-620 contract preserved).
- Per-field blocking branch in `createTopicWithChunks` post-commit Tier 2 pass: a low-score verdict on any field in `blockingFields` rejects creation with a typed `validation` error and rolls back the just-persisted topic via `TopicRepository.delete`.
- `classifier.tier2_blocked` event emitted to `infrastructure.operation_event_log` per blocking hit, carrying chunk id, field, score, rationale.
- In-process circuit-breaker (`src/orchestration/tier2-circuit-breaker.ts`) that auto-disables a field when its weekly rejection rate exceeds rolling-mean + 2σ. Emits `tier2.circuit_breaker_tripped` exactly once per (process, field). 60 s cache on the stats query, fail-open on DB error.
- Operator runbook at `docs/runbooks/classifier-blocking-activation.md`.

The infrastructure is dormant until an operator adds a field to `CLASSIFIER_BLOCKING_FIELDS` after a future calibration cycle passes.
