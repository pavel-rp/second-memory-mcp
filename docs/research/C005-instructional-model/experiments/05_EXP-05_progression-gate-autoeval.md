# EXP-05 — M10 Progression: prerequisite-gate fail-open proof (automated-eval)

- **Task:** NEU-924 · **Decision:** DR-M10 (progression) · **Conflict:** C1 (HIGH · non-downgradable · learning-critical) · **Threshold shapes touched:** MM-T8 (durability bar ≥ 0.90 posterior)
- **Vehicle:** automated-eval · **Evidence class of every result: 5 `[automated-eval]`** — never external-user/expert/market validation
- **Executed:** 2026-07-13 · **Status: provisional evidence attachment. Settles nothing; flips no status; resolves no conflict; modifies no source file.**

## 1. Contested point and why it is materially inconclusive

C1 is the one conflict where a static characterization **already failed once**: the audit's `repetitions>0` unlock claim (F-M01-6/F-M10-5) was found **stale** by reconciliation, which re-characterized the live gate from source as retrievability-reteach at 0.5 with no fail-closed lock (L4/L5) — but that correction is itself a **static read**. The materially inconclusive residual on the C1/silent-adoption axis: *exercised dynamically, does a single-success (or even zero-review) prerequisite actually pass the live gate, where exactly does the live boundary sit, and does any lock signal exist in the gate's contract?* DR-M10's divergence characterization — and the control NEU-925 will package — depends on this being right the second time.

**Vehicle selection (smallest sufficient).** The gate is a pure-function pipeline (`classifyChunk` → `resolveStalePrerequisites`) — a deterministic oracle over the live functions decides all three questions with executed precision no AI review can match; no dogfooding/MCP/WoZ vehicle bears on a code-behavior fact.

## 2. Fidelity limitation (explicit)

- Exercises the **domain half** of the gate. The orchestration half — the dependent *still proceeding* after reteach insertion (`teaching-workflows.ts:407–468`, fact L5) — is cited as a class-2 static fact, not exercised here (DB-coupled). The dynamic contract check (ECS-5-07) shows the domain result carries **no lock/gate-decision field at all**, so no fail-closed behavior could exist downstream of it without a new signal.
- MM-T8's bar value (0.90, band 0.85–0.95) is used only as the oracle's *reference region*; this experiment neither validates nor calibrates it (in-domain calibration deferred).
- Class-5 structural bound; no DP-effectiveness claim (INC-I1 untouched).

## 3. Case set — `ECS-5 v1.0` (frozen 2026-07-13 before first run; any change = new version + rerun)

FSRS power-law used by the live code: `R(t) = (1 + (19/81) · t/S)^(-0.5)`, `t` = days overdue, `S` = interval.

| Case | Input | Oracle |
| --- | --- | --- |
| ECS-5-01 | single-success prerequisite, interval 1d, not yet due | **fail-open**: not stale, no reteach, dependent proceeds |
| ECS-5-02 | zero-review just-taught prerequisite (`intervalDays: null` → R forced 1.0) | **fail-open**: passes the gate |
| ECS-5-03 | 3d overdue on 1d interval → R ≈ 0.766 (below MM-T8 bar, above 0.5) | still passes the live gate |
| ECS-5-04 | 12d overdue on 1d interval → R ≈ 0.512 | still passes (boundary from above) |
| ECS-5-05 | 13d overdue on 1d interval → R ≈ 0.497 | reteach insertion fires — a reteach, **not a lock** (boundary from below) |
| ECS-5-06 | 1×-interval overdue (10d on 10d) | R ≈ 0.90 — the MM-T8 bar region; live gate takes no action anywhere in [0.5, 0.90) |
| ECS-5-07 | result contract | keys exactly `{circularDetected, depthCapReached, stalePrereqIds}` — no lock/gate-decision field exists |

## 4. Fixture (verbatim, reproducible)

Runner: `pnpm exec tsx <script>` from the repo root. SUT imported live and unmodified.

```ts
// EXP-05 · ECS-5 v1.0 (frozen 2026-07-13, before first run)
import { classifyChunk } from '../../src/domain/algorithms/classify-chunk.ts';
import {
  resolveStalePrerequisites,
  type PrerequisiteChunkMeta,
} from '../../src/domain/algorithms/resolve-stale-prerequisites.ts';

const now = new Date('2026-07-13T10:00:00Z');
const DAY = 86_400_000;

const checks: { id: string; oracle: string; actual: unknown; pass: boolean }[] = [];
const assert = (id: string, oracle: string, actual: unknown, pass: boolean) =>
  checks.push({ id, oracle, actual, pass });

const resolveOne = (meta: Omit<PrerequisiteChunkMeta, 'prerequisiteIds'>) =>
  resolveStalePrerequisites({
    chunkMetadata: new Map([['prereq', { ...meta, prerequisiteIds: [] }]]),
    targetPrerequisiteIds: ['prereq'],
    sessionChunkIds: new Set(),
    maxDepth: 5,
    now,
  });

const r01 = resolveOne({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() + DAY, intervalDays: 1 });
assert('ECS-5-01', 'FAIL-OPEN: single-success fresh prerequisite is NOT treated stale (no reteach, dependent proceeds)', r01.stalePrereqIds, r01.stalePrereqIds.length === 0);

const r02 = resolveOne({ easeFactor: 2.5, repetitions: 0, nextReviewAt: now.getTime(), intervalDays: null });
assert('ECS-5-02', 'FAIL-OPEN: never-reviewed just-taught prerequisite (R forced to 1.0) passes the gate', r02.stalePrereqIds, r02.stalePrereqIds.length === 0);

const c03 = classifyChunk({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() - 3 * DAY, intervalDays: 1 }, now);
const r03 = resolveOne({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() - 3 * DAY, intervalDays: 1 });
assert('ECS-5-03', 'prerequisite with retrievability < 0.90 (below MM-T8 bar) but >= 0.5 still passes the live gate', { R: c03.estimatedRetrievability, stale: r03.stalePrereqIds }, c03.estimatedRetrievability < 0.9 && c03.estimatedRetrievability >= 0.5 && r03.stalePrereqIds.length === 0);

const c04 = classifyChunk({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() - 12 * DAY, intervalDays: 1 }, now);
const r04 = resolveOne({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() - 12 * DAY, intervalDays: 1 });
assert('ECS-5-04', 'boundary: 12 days overdue on a 1d interval -> R just above 0.5 -> still passes', { R: c04.estimatedRetrievability, stale: r04.stalePrereqIds }, c04.estimatedRetrievability >= 0.5 && r04.stalePrereqIds.length === 0);
const c05 = classifyChunk({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() - 13 * DAY, intervalDays: 1 }, now);
const r05 = resolveOne({ easeFactor: 2.5, repetitions: 1, nextReviewAt: now.getTime() - 13 * DAY, intervalDays: 1 });
assert('ECS-5-05', 'boundary: 13 days overdue on a 1d interval -> R just below 0.5 -> reteach insertion fires (not a lock)', { R: c05.estimatedRetrievability, stale: r05.stalePrereqIds }, c05.estimatedRetrievability < 0.5 && r05.stalePrereqIds.length === 1);

const c06 = classifyChunk({ easeFactor: 2.5, repetitions: 3, nextReviewAt: now.getTime() - 10 * DAY, intervalDays: 10 }, now);
assert('ECS-5-06', 'R at 1x-interval overdue is ~0.90 (the MM-T8 bar region); live gate ignores everything until 0.5', c06.estimatedRetrievability, Math.abs(c06.estimatedRetrievability - 0.9) < 0.005);

const keys = Object.keys(r05).sort();
assert('ECS-5-07', "result shape is exactly {circularDetected, depthCapReached, stalePrereqIds} — no lock/gate-decision field exists", keys, keys.join(',') === 'circularDetected,depthCapReached,stalePrereqIds');

const passCount = checks.filter((c) => c.pass).length;
console.log(JSON.stringify({ experiment: 'EXP-05', caseSet: 'ECS-5 v1.0', checks, passCount, total: checks.length }, null, 2));
```

## 5. Recorded configuration (`ENV`) + clean-context evidence (`CCR`)

| Field | Value |
| --- | --- |
| SUT baseline (CCR-1) | commit `bc77bc6` (origin/develop head at execution; SUT files unmodified) |
| Input snapshot (CCR-2) | all inputs embedded in the frozen script; snapshot hash = config digest |
| Isolated runs (CCR-3) | RUN-1, RUN-2 — two separately-spawned OS processes, no shared state |
| Caches (CCR-4) | fresh Node process per run; pure functions, no cache layer |
| Config digest (CCR-5) | sha256(`exp05-gate.ts`) = `df7a93cd343d5b38…` |
| Seed status (CCR-6) | fully deterministic — no LLM, no sampling. `GRADER-VAR` n/a |
| Prior-output isolation (CCR-7) | runs independent; oracle comparison computed within each run |
| Runtime | Node v24.14.1 · tsx ^4.21.0 (via `pnpm exec`) · TypeScript ^5.9.3 · Windows 10 Pro 10.0.19045 |

## 6. Results (read from process output, never fabricated)

**7/7 oracle-met on RUN-1 and RUN-2 (identical).**

| Case | Oracle | RUN-1 / RUN-2 actual | Pass |
| --- | --- | --- | --- |
| ECS-5-01 | fail-open, single success | `stale: []` | ✔✔ |
| ECS-5-02 | fail-open, zero reviews | `stale: []` | ✔✔ |
| ECS-5-03 | passes below bar | R = 0.76613, `stale: []` | ✔✔ |
| ECS-5-04 | passes at R ≈ 0.512 | R = 0.51199, `stale: []` | ✔✔ |
| ECS-5-05 | reteach at R ≈ 0.497 | R = 0.49694, `stale: ['prereq']` | ✔✔ |
| ECS-5-06 | R ≈ 0.90 at 1× overdue | R = 0.9000 | ✔✔ |
| ECS-5-07 | no lock field in contract | `[circularDetected, depthCapReached, stalePrereqIds]` | ✔✔ |

## 7. Result statement (class 5 `[automated-eval]`) — finding `F-EXP-05`

Executed dynamically, the live prerequisite gate is **fail-open exactly as reconciliation re-characterized it**: a single-success — even a zero-review — prerequisite passes untouched (R forced to 1.0 while fresh); the only live boundary is retrievability 0.5 (reached ≈ 12.8× interval overdue), which triggers **reteach insertion, not a lock**; the entire region [0.5, 0.90) below the MM-T8 durability bar produces **no action**; and the gate's output contract contains **no lock or gate-decision field**. The C1 GAP verdict — including the correction of the stale `repetitions>0` audit claim — is now **verified on executed behavior**, the second and stronger re-verification of the one conflict whose characterization already proved unstable.

**What this does *not* establish:** the MM-T8 bar value (band 0.85–0.95 unchanged — 0.90 was only the oracle's reference region); the orchestration-level proceed-after-reteach (L5, class-2 static cite); any DP-progression effectiveness (INC-I1 open). Attached to DR-M10 / ledger §EXP; decision stays `provisional`, C1 stays `unresolved` · non-downgradable; the coded behavior remains **not adopted**.

## 8. Self-check

- Versioned frozen case set; explicit per-case oracle; boundary probed from both sides (ECS-5-04/05). **PASS.**
- ENV + CCR-1…7 recorded; ≥2 isolated repeats, identical. **PASS.**
- Results read from process output; SUT unmodified; MM-T8 value not calibrated or endorsed; nothing settled. **PASS.**
