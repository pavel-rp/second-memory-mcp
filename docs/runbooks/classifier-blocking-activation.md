# Tier 2 Classifier Blocking Activation — Operator Runbook

**Owner:** NEU-621 (hardening: NEU-672)
**Last updated:** 2026-05-01

This runbook describes how to safely activate `CLASSIFIER_BLOCKING_FIELDS` for one or more Tier 2 verdict fields. Blocking is opt-in per field and gated on two empirical thresholds — never flip a field without going through every step.

---

## 1. Pre-flight checks

Before considering any flip:

1. **Confirm soft-warn deployment** — `CLASSIFIER_ENABLE=true` has been live for ≥ 4 weeks. The soft-warn corpus is what calibration measures against.
2. **Verify the verdict-field name** is one of (snake_case, as it appears in `validator_report.tier2`):
   - `rendering_clarity`
   - `vocabulary_appropriate`
   - `math_notation_rendering_risk`
   - `definition_constructive`
   - `epistemic_consistency`
   - `overall_fit`
3. **Verify NEU-627 (Tier 1b)** has not flagged a related rule as ineligible — Tier 2 fields are independent of Tier 1b but operationally we never bulk-flip across tiers in the same release.

If any pre-flight check fails, stop. Do not proceed.

---

## 2. Draw calibration and OOD samples

Run the queries below from the `infrastructure` schema. They draw two non-overlapping samples per candidate field.

### 2a. Calibration sample (n ≥ 100)

Random sample from the soft-warn window, weighted to over-sample rare low-score fields so calibration of "should reject" is not dominated by clean chunks.

```sql
SELECT
  c.id AS chunk_id,
  c.title,
  c.content,
  c.validator_report->'tier2' AS tier2_verdict,
  e.timestamp AS classified_at
FROM learning_chunks c
JOIN infrastructure.operation_event_log e
  ON (e.data->>'chunk_id') = c.id
WHERE e.event = 'classifier.chunk_verdict'
  AND e.timestamp >= NOW() - INTERVAL '4 weeks'
  AND c.validator_report->'tier2'->>'<FIELD>' IS NOT NULL
ORDER BY (CASE WHEN (c.validator_report->'tier2'->'<FIELD>'->>'score')::int <= 2 THEN 0 ELSE 1 END), random()
LIMIT 120;
```

Replace `<FIELD>` with the snake-case verdict-field name.

### 2b. OOD sample (n ≥ 50)

Drawn from a different topic distribution than the calibration sample. The simplest approach is to filter calibration to one set of subjects and OOD to the complement; record which subjects you used in the calibration report.

```sql
SELECT
  c.id AS chunk_id,
  c.title,
  c.content,
  c.validator_report->'tier2' AS tier2_verdict
FROM learning_chunks c
WHERE c.validator_report->'tier2'->>'<FIELD>' IS NOT NULL
  AND c.subject NOT IN (<CALIBRATION_SUBJECTS>)
ORDER BY random()
LIMIT 60;
```

---

## 3. Label the samples

Single-rater labeling is acceptable for v1 (per NEU-621 spec).

For each sampled chunk, record the rater's expected verdict per candidate field:

- `should_reject` — classifier was correct to flag the field as low-quality.
- `clean` — classifier flagged a clean chunk (false positive).
- `missed` — classifier rated the field high but it actually has the defect (false negative; only meaningful for fields scored ≥ 3).

Save labels as `scripts/classifier-calibration/labels.csv` with columns:

```
chunk_id,field,split,expected_verdict,notes
```

Where `split` ∈ `{calibration, ood}`.

---

## 4. Compute precision/recall

Run the analysis script:

```
pnpm tsx scripts/classifier-calibration.ts
```

The script reads `scripts/classifier-calibration/labels.csv`, joins against `validator_report.tier2`, and prints a per-field markdown table with precision, recall, and F1 on each split. It also prints the gate decision per field.

---

## 5. Apply the gate

A field passes the gate iff **both**:

- **Calibration agreement ≥ 0.85** AND **calibration false-positive rate < 0.10**.
- **OOD precision ≥ 0.85**.

Record the per-field decision in a dated research document at `docs/research/YYYY-MM-DD-classifier-calibration.md`. The decision must be explicit: `flip` / `iterate` / `no-go`.

If insufficient data:

- The corpus is < 4 weeks old → wait.
- n < 100 calibration samples → wait or expand the corpus by enabling soft-warn on more topic creates.
- OOD distribution is too narrow → expand the sample.

In the "insufficient data" case, mark every field as `no-go (insufficient)` and do not change config.

---

## 6. Per-field flip procedure (when a field passes)

**One field per deploy.** Bulk-flipping multiple fields makes failure attribution much harder.

1. Add the snake-case field name to `CLASSIFIER_BLOCKING_FIELDS` in deployment config:

   ```
   CLASSIFIER_BLOCKING_FIELDS=rendering_clarity
   ```

2. Deploy. Watch:
   - Operation log for `classifier.tier2_blocked` events. Spike rate should match calibration FP rate. NEU-672: `data.rationale` is truncated to 256 characters with a `…[truncated]` suffix before persistence — full rationale flows through the synchronous `error.findings[].detail` response and is not stored in the long-retention event log.
   - Operation log for `tier2.circuit_breaker_tripped` events. Any trip means the breaker auto-disabled the field for that process — investigate before re-enabling.
3. Soak for ≥ 1 week. If rejection rate stays within calibration bounds, leave it. If rejection rate spikes, the breaker will disable in process; on the next deploy, remove the field from the env and run a fresh calibration cycle.

To activate a second field, repeat the cycle from Step 2 — re-draw calibration + OOD samples for the new field.

---

## 7. Circuit-breaker telemetry

The breaker emits events to `infrastructure.operation_event_log`:

- `tier2.circuit_breaker_tripped` — fired exactly once per (process, field) when a field's last-7-days `classifier.tier2_blocked` count exceeds rolling-mean + 2σ over the four prior 7-day windows. Includes `current_week_count`, `rolling_mean`, `sigma`.

Query for trips in the last 7 days:

```sql
SELECT
  data->>'field' AS field,
  COUNT(*) AS trip_count,
  MAX(timestamp) AS last_trip_at,
  AVG((data->>'current_week_count')::int) AS avg_current_week,
  AVG((data->>'rolling_mean')::float) AS avg_rolling_mean
FROM infrastructure.operation_event_log
WHERE event = 'tier2.circuit_breaker_tripped'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY data->>'field';
```

Trip events repeat per-process — a horizontally scaled deployment with N replicas can emit up to N trip events per field per restart cycle. This is intentional (in-memory state per process). For permanent disable, remove the field from `CLASSIFIER_BLOCKING_FIELDS` on the next deploy.

**Per-process-lifetime trip semantics (NEU-672):** the breaker's "exactly once" trip guarantee is _per-process-lifetime_, not per-deployment. After a process restart the breaker re-evaluates from scratch: previously tripped fields may trip again on the same calendar week's data and emit a fresh event. A horizontally scaled deployment with N replicas can therefore emit up to N trip events per field per restart cycle. The persistent disable path is removing the field from `CLASSIFIER_BLOCKING_FIELDS` on the next deploy, not relying on in-memory state.

The breaker emits a second event class for stats-query failures (NEU-672):

- `tier2.stats_query_failed` — fired when reading `infrastructure.operation_event_log` for the rolling-window count throws. Fail-open: the breaker returns its previously-tripped set unchanged; downstream creates proceed. Includes `error_class` (the throwing constructor name) and `error_message`. Alert on a non-zero rate of this event — it indicates the breaker is no longer observing fresh data.

---

## 7a. Startup-crash failure mode for invalid config (NEU-672)

`parseVerdictFieldList` validates `CLASSIFIER_BLOCKING_FIELDS` against the snake-case verdict-field allowlist. An unknown field name causes a synchronous throw out of `resolveClassifierConfig` → `createAppContext`, **before any structured logger is configured**. The process exits with a stack trace on stderr — there is no `mcp_request_log` row, no `operation_event_log` row, and no JSON-formatted log line.

Recovery:

1. Check stderr for the unknown-field name (the thrown error names the offender).
2. Compare against the allowlist in section 1 above (`rendering_clarity`, `vocabulary_appropriate`, `math_notation_rendering_risk`, `definition_constructive`, `epistemic_consistency`, `overall_fit`).
3. Correct the env var; redeploy.

---

## 8. Emergency disable

If a wrong flip causes a creation outage:

1. Set `CLASSIFIER_ENABLE=false` to halt all classifier-driven blocking immediately. Soft-warn is also disabled, but creates resume.
2. Deploy.
3. Investigate the calibration report for the offending field — re-run with a larger or more recent sample.
4. Once the cause is understood, re-enable soft-warn (`CLASSIFIER_ENABLE=true`) but keep the field out of `CLASSIFIER_BLOCKING_FIELDS` until a fresh calibration passes.
