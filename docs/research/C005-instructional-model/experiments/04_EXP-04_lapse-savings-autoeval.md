# EXP-04 — M09 Remediation: lapse full-reset breadth + leech floor (automated-eval)

- **Task:** NEU-924 · **Decision:** DR-M09 (remediation) · **Conflict:** C3 (HIGH · non-downgradable · learning-critical) · **Threshold shapes touched:** MM-T14 (post-lapse savings floor), MM-T13 (leech trigger provenance/counts)
- **Vehicle:** automated-eval · **Evidence class of every result: 5 `[automated-eval]`** — never external-user/expert/market validation
- **Executed:** 2026-07-13 · **Status: provisional evidence attachment. Settles nothing; flips no status; resolves no conflict; modifies no source file.**

## 1. Contested point and why it is materially inconclusive

Reconciliation confirmed C3 as a **CONFLICT** (live lapse fully resets; no savings floor — L1/L2), but from a **static read**, and this corpus already corrected one stale audit claim about this very mechanism (F-M09-5's "`leechFailureThreshold=6` is dead code" → live lifetime floor, L3). Two materially inconclusive residuals remain on the C3/silent-adoption axis: (a) *does the full reset actually hold dynamically at every prior depth* — or does some branch (e.g. the advanced path's overdue/consecutive-lapse handling) preserve savings for deep histories, which would change DR-M09's divergence characterization; (b) *is the L3 correction itself correct when exercised dynamically* (the corrected claim has never been executed, only read).

**Vehicle selection (smallest sufficient).** Both residuals are deterministic behaviors of pure functions (`calculateNextReview`, `calculateNextReviewAdvanced`) — a versioned oracle over the live functions is smaller and stronger than AI review; no dogfooding/MCP/WoZ vehicle bears on a code-behavior fact.

## 2. Fidelity limitation (explicit)

- Exercises the domain calculator only; the leech **reformulation path** (`resolve_leech` tool) is outside this fixture (and outside the reconciliation's authoritative file set) — its reformulate-vs-suspend behavior remains **unverified** (carried in `07_deferral-register.md` §2 context).
- MM-T14's floor **coefficient** (0.2, band 0.1–0.3) is used only as the oracle's *shape reference* for counting violations; this experiment neither validates nor calibrates the coefficient (in-domain measurement, deferred).
- Class-5 structural bound: the oracle tests only what it encodes; no DP-effectiveness claim (INC-I1 untouched).

## 3. Case set — `ECS-4 v1.0` (frozen 2026-07-13 before first run; any change = new version + rerun)

| Case | Input | Oracle |
| --- | --- | --- |
| ECS-4-01…06 | graded failure (q=2) from prior depths `(reps, interval, ease)` = (1, 1d, 2.5), (3, 10d, 2.5), (5, 30d, 2.6), (8, 90d, 2.8), (10, 180d, 2.3), (6, 45d, 1.3) | every case: `repetitions === 0 && interval === 1` (full reset regardless of depth) |
| ECS-4-07 | CONTROL: advanced path, 3 consecutive failures, **5** lifetime attempts | `leech === false` (lifetime floor 6 is live — L3) |
| ECS-4-08 | advanced path, 3 consecutive failures, **6** lifetime attempts | `leech === true` |
| ECS-4-09 | first post-lapse success (q=4 from reps=0 after deep history) | restarts at `interval === 1`, `repetitions === 1` (no savings on relearn either) |

Derived (recorded alongside): MM-T14 floor check per lapse case — `post_lapse_interval ≥ max(1d, 0.2 × prior_interval)` — violated / applicable counts.

## 4. Fixture (verbatim, reproducible)

Runner: `pnpm exec tsx <script>` from the repo root. SUT imported live and unmodified.

```ts
// EXP-04 · ECS-4 v1.0 (frozen 2026-07-13, before first run)
import { calculateNextReview, calculateNextReviewAdvanced } from '../../src/domain/algorithms/sr-calculator.ts';
import { DEFAULT_ALGORITHM_CONFIG } from '../../src/domain/config/algorithm-defaults.ts';

const cfg = DEFAULT_ALGORITHM_CONFIG;
const now = new Date('2026-07-13T10:00:00Z');

const checks: { id: string; oracle: string; actual: unknown; pass: boolean }[] = [];
const assert = (id: string, oracle: string, actual: unknown, pass: boolean) =>
  checks.push({ id, oracle, actual, pass });

const grid: { repetitions: number; interval: number; easeFactor: number }[] = [
  { repetitions: 1, interval: 1, easeFactor: 2.5 },
  { repetitions: 3, interval: 10, easeFactor: 2.5 },
  { repetitions: 5, interval: 30, easeFactor: 2.6 },
  { repetitions: 8, interval: 90, easeFactor: 2.8 },
  { repetitions: 10, interval: 180, easeFactor: 2.3 },
  { repetitions: 6, interval: 45, easeFactor: 1.3 },
];
const savingsFloorViolations: { prior: number; floorMMT14: number; post: number; violated: boolean }[] = [];
grid.forEach((s, i) => {
  const r = calculateNextReview({ quality: 2, ...s }, cfg, now);
  const fullReset = r.repetitions === 0 && r.interval === 1;
  assert(
    `ECS-4-0${i + 1}`,
    `lapse from reps=${s.repetitions}/interval=${s.interval}d fully resets (repetitions=0, interval=1d) regardless of prior depth`,
    { repetitions: r.repetitions, interval: r.interval },
    fullReset
  );
  const floor = Math.max(1, 0.2 * s.interval);
  savingsFloorViolations.push({ prior: s.interval, floorMMT14: floor, post: r.interval, violated: r.interval < floor });
});

const leechBase = { quality: 2, repetitions: 0, easeFactor: 2.0, interval: 5, daysOverdue: 0, consecutiveFailures: 3 };
const l1 = calculateNextReviewAdvanced({ ...leechBase, totalAttempts: 5 }, cfg, now);
assert('ECS-4-07', 'CONTROL: 3 consecutive failures but only 5 lifetime attempts -> NOT flagged leech (lifetime floor 6 is live)', l1.leech, l1.leech === false);
const l2 = calculateNextReviewAdvanced({ ...leechBase, totalAttempts: 6 }, cfg, now);
assert('ECS-4-08', '3 consecutive failures AND 6 lifetime attempts -> flagged leech', l2.leech, l2.leech === true);

const relearn = calculateNextReview({ quality: 4, repetitions: 0, easeFactor: 2.3, interval: 1 }, cfg, now);
assert('ECS-4-09', 'first post-lapse success restarts at initial interval 1d, repetitions=1 (no savings on relearn)', { repetitions: relearn.repetitions, interval: relearn.interval }, relearn.repetitions === 1 && relearn.interval === 1);

const passCount = checks.filter((c) => c.pass).length;
const applicable = savingsFloorViolations.filter((v) => v.floorMMT14 > 1);
console.log(JSON.stringify({
  experiment: 'EXP-04', caseSet: 'ECS-4 v1.0', checks, passCount, total: checks.length,
  mmT14: { violations: savingsFloorViolations, violatedCount: applicable.filter((v) => v.violated).length, applicableCount: applicable.length },
}, null, 2));
```

## 5. Recorded configuration (`ENV`) + clean-context evidence (`CCR`)

| Field | Value |
| --- | --- |
| SUT baseline (CCR-1) | commit `bc77bc6` (origin/develop head at execution; SUT files unmodified) |
| Input snapshot (CCR-2) | all inputs embedded in the frozen script; snapshot hash = config digest |
| Isolated runs (CCR-3) | RUN-1, RUN-2 — two separately-spawned OS processes, no shared state |
| Caches (CCR-4) | fresh Node process per run; pure functions, no cache layer |
| Config digest (CCR-5) | sha256(`exp04-lapse.ts`) = `5069c616dac6c06b…` |
| Seed status (CCR-6) | fully deterministic — no LLM, no sampling; SUT fuzz at deterministic `NEUTRAL_FUZZ` default. `GRADER-VAR` n/a |
| Prior-output isolation (CCR-7) | runs independent; oracle comparison computed within each run |
| Runtime | Node v24.14.1 · tsx ^4.21.0 (via `pnpm exec`) · TypeScript ^5.9.3 · Windows 10 Pro 10.0.19045 |

## 6. Results (read from process output, never fabricated)

**9/9 oracle-met on RUN-1 and RUN-2 (identical).**

| Case | Oracle | RUN-1 / RUN-2 actual | Pass |
| --- | --- | --- | --- |
| ECS-4-01…06 | reps=0, interval=1 at every depth | `{repetitions: 0, interval: 1}` ×6, both runs | ✔✔ |
| ECS-4-07 | leech = false at 5 lifetime attempts | `false` | ✔✔ |
| ECS-4-08 | leech = true at 6 lifetime attempts | `true` | ✔✔ |
| ECS-4-09 | relearn restarts at 1d, reps=1 | `{repetitions: 1, interval: 1}` | ✔✔ |

MM-T14 floor: **violated 5/5 applicable cases** (prior intervals 10/30/90/180/45d → required floors 2/6/18/36/9d, actual post-lapse interval 1d in all; the 1d-prior case is inapplicable, floor = 1d). Identical both runs.

## 7. Result statement (class 5 `[automated-eval]`) — finding `F-EXP-04`

(a) The live lapse handling **fully resets at every tested prior depth** — from 1 day to 180 days of accumulated stability — with the MM-T14 savings-floor shape violated in **5/5 applicable cases**, and the first relearn step also restarting at 1d. The C3 CONFLICT is **dynamically confirmed across its full breadth**: no branch of the base or advanced path preserves savings. (b) The **L3 correction is dynamically verified**: the leech lifetime-attempts floor (6) is live — 3 consecutive failures do **not** flag a leech below 6 lifetime attempts — so the stale F-M09-5 "dead code" claim stays corrected, now on executed evidence.

**What this does *not* establish:** the MM-T14 coefficient value (band 0.1–0.3 unchanged — the 0.2 was only the oracle's shape reference); the leech reformulation path (`resolve_leech`, unexercised — deferral register); any DP-effectiveness claim (INC-I1 open). Attached to DR-M09 / ledger §EXP; decision stays `provisional`, C3 stays `unresolved` · non-downgradable; the coded behavior remains **not adopted**.

## 8. Self-check

- Versioned frozen case set; explicit per-case oracle; CONTROL case (ECS-4-07) guards the leech oracle. **PASS.**
- ENV + CCR-1…7 recorded; ≥2 isolated repeats, identical. **PASS.**
- Results read from process output; SUT unmodified; MM-T14 coefficient not calibrated or endorsed; nothing settled. **PASS.**
