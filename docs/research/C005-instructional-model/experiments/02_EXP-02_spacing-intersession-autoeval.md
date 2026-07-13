# EXP-02 — M04 Spacing: same-session criterion advance (automated-eval)

- **Task:** NEU-924 · **Decision:** DR-M04 (spacing) · **Conflict:** C2 (HIGH · non-downgradable · learning-critical) · **Threshold shapes touched:** MM-T1 (K non-massed), MM-T2 (S separated sessions)
- **Vehicle:** automated-eval · **Evidence class of every result: 5 `[automated-eval]`** — never external-user/expert/market validation
- **Executed:** 2026-07-13 · **Status: provisional evidence attachment. Settles nothing; flips no status; resolves no conflict; modifies no source file.**

## 1. Contested point and why it is materially inconclusive

DR-M04 requires the spaced-criterion counter to advance **at most once per session, across separated sessions**. Reconciliation verdict (register §5 M04): **GAP** — but that verdict is a **static source read**, and this corpus has already twice caught static audit claims being stale on live re-verification (F-M01-6/F-M10-5 `repetitions>0`; F-M09-5 "dead code" — both corrected in `../reconciliation/00_conflict-register.md` §3). The materially inconclusive residual: *does the live criterion counter, exercised dynamically, actually advance multiple times at a single instant with no session separation enforced anywhere in its contract?* This sits on the C2 axis (silent-adoption-of-contradicted-behavior risk: shipping DR-M04 against an unverified characterization of the code it must control).

**Vehicle selection (smallest sufficient).** The counter lives in a pure function (`calculateNextReview`) — a deterministic oracle over the live function is smaller and higher-precision than AI review, and no MCP-workflow or paper/WoZ run adds fidelity (the contested behavior is exactly this computation). Creator dogfooding is not required for a code-behavior fact.

## 2. Fidelity limitation (explicit)

- Exercises the **domain calculator** (`src/domain/algorithms/sr-calculator.ts`), not the orchestration path: in production one chunk receives one SR update per chunk-completion (reconciliation L-facts). What this eval establishes is that the counting contract itself carries **no session identity and no inter-session gate** — any same-day/same-instant repeated invocation advances the counter. The DB-coupled aggregation path was **not** exercised (that half is EXP-01's AI-review subject, M03).
- Class-5 structural bound: the oracle tests only what it encodes; a green result does not establish product correctness, only the encoded compatibility facts.
- n/a to DP-transfer: nothing here measures whether spacing improves DP learning (INC-I1 untouched).

## 3. Case set — `ECS-2 v1.0` (frozen 2026-07-13 before first run; any change = new version + rerun)

| Case | Input | Oracle (expected) |
| --- | --- | --- |
| ECS-2-01 | q=4 success from `{reps:0, ease:2.5, interval:0}` at fixed instant T | `repetitions === 1` |
| ECS-2-02 | q=4 success from ECS-2-01 output, same instant T | `repetitions === 2` (advances again, same instant) |
| ECS-2-03 | q=4 success from ECS-2-02 output, same instant T | `repetitions === 3` (no inter-session gate) |
| ECS-2-04 | q=3 ("hard") success, fresh state, instant T | `repetitions === 1` |
| ECS-2-05 | q=3 success chained, same instant T | `repetitions === 2` |
| ECS-2-06 | CONTROL: q=2 failure from `{reps:3, interval:10}` | `repetitions === 0` (counter is live, not inert — guards oracle validity) |

Structural observation recorded alongside (not an oracle case): the input/output contract of `calculateNextReview` is exactly `{quality, repetitions, easeFactor, interval}` → `{interval, repetitions, easeFactor, nextReview}` — **no session identifier exists anywhere in the signal path**.

## 4. Fixture (verbatim, reproducible)

Runner: `pnpm exec tsx <script>` from the repo root. SUT imported live and unmodified.

```ts
// EXP-02 · ECS-2 v1.0 (frozen 2026-07-13, before first run)
import { calculateNextReview } from '../../src/domain/algorithms/sr-calculator.ts';
import { DEFAULT_ALGORITHM_CONFIG } from '../../src/domain/config/algorithm-defaults.ts';

const cfg = DEFAULT_ALGORITHM_CONFIG;
const now = new Date('2026-07-13T10:00:00Z'); // single fixed instant = one session/day

type S = { repetitions: number; easeFactor: number; interval: number };
const step = (s: S, quality: number) =>
  calculateNextReview({ quality, ...s }, cfg, now);

const checks: { id: string; oracle: string; actual: unknown; pass: boolean }[] = [];
const assert = (id: string, oracle: string, actual: unknown, pass: boolean) =>
  checks.push({ id, oracle, actual, pass });

// Chain A: three same-instant successes (q=4), each output fed back in.
const a1 = step({ repetitions: 0, easeFactor: 2.5, interval: 0 }, 4);
const a2 = step(a1, 4);
const a3 = step(a2, 4);
assert('ECS-2-01', 'repetitions === 1 after 1st same-day success', a1.repetitions, a1.repetitions === 1);
assert('ECS-2-02', 'repetitions === 2 after 2nd same-day success (counter advanced again, same instant)', a2.repetitions, a2.repetitions === 2);
assert('ECS-2-03', 'repetitions === 3 after 3rd same-day success (no inter-session gate)', a3.repetitions, a3.repetitions === 3);

// Chain B: q=3 ("hard") success also advances same-instant.
const b1 = step({ repetitions: 0, easeFactor: 2.5, interval: 0 }, 3);
const b2 = step(b1, 3);
assert('ECS-2-04', 'q=3 same-day success advances counter to 1', b1.repetitions, b1.repetitions === 1);
assert('ECS-2-05', 'q=3 second same-day success advances counter to 2', b2.repetitions, b2.repetitions === 2);

// Control: failure resets (distinguishes advance from mere mutation).
const c1 = step({ repetitions: 3, easeFactor: 2.5, interval: 10 }, 2);
assert('ECS-2-06', 'CONTROL: q=2 failure sets repetitions to 0 (counter is live, not inert)', c1.repetitions, c1.repetitions === 0);

const ioKeys = { input: ['quality', 'repetitions', 'easeFactor', 'interval'], output: Object.keys(a1) };
const passCount = checks.filter((c) => c.pass).length;
console.log(JSON.stringify({ experiment: 'EXP-02', caseSet: 'ECS-2 v1.0', checks, passCount, total: checks.length, ioKeys }, null, 2));
```

## 5. Recorded configuration (`ENV`) + clean-context evidence (`CCR`)

| Field | Value |
| --- | --- |
| SUT baseline (CCR-1) | commit `bc77bc6` (origin/develop head at execution; SUT files unmodified) |
| Input snapshot (CCR-2) | all inputs embedded in the frozen script; snapshot hash = config digest |
| Isolated runs (CCR-3) | RUN-1, RUN-2 — two separately-spawned OS processes, no shared state |
| Caches (CCR-4) | fresh Node process per run; SUT is a pure function (no cache layer) |
| Config digest (CCR-5) | sha256(`exp02-spacing.ts`) = `30131f23e1f369e9…` |
| Seed status (CCR-6) | fully deterministic — no LLM, no sampling; SUT fuzz parameter at its deterministic `NEUTRAL_FUZZ` default. `GRADER-VAR` n/a |
| Prior-output isolation (CCR-7) | runs write independent outputs; neither run reads the other's; oracle comparison computed within each run |
| Runtime | Node v24.14.1 · tsx ^4.21.0 (via `pnpm exec`) · TypeScript ^5.9.3 · Windows 10 Pro 10.0.19045 |

## 6. Results (read from process output, never fabricated)

| Case | Oracle | RUN-1 actual | RUN-2 actual | Pass |
| --- | --- | --- | --- | --- |
| ECS-2-01 | reps = 1 | 1 | 1 | ✔✔ |
| ECS-2-02 | reps = 2 | 2 | 2 | ✔✔ |
| ECS-2-03 | reps = 3 | 3 | 3 | ✔✔ |
| ECS-2-04 | reps = 1 | 1 | 1 | ✔✔ |
| ECS-2-05 | reps = 2 | 2 | 2 | ✔✔ |
| ECS-2-06 | reps = 0 | 0 | 0 | ✔✔ |

**6/6 oracle-met, ×2 identical isolated runs.** Structural observation confirmed both runs: I/O contract carries no session field.

## 7. Result statement (class 5 `[automated-eval]`) — finding `F-EXP-02`

The live criterion counter advances on **every same-instant successful invocation** — three advances at a single timestamp — and its entire I/O contract carries **no session identity**, so the DR-M04 inter-session gate (advance ≤ once per session, MM-T2 shape) has **no enforcement point in the live signal path**. The C2 GAP verdict for M04 is now **dynamically confirmed** (not merely statically read), closing the stale-audit-claim residual for this decision.

**What this does *not* establish:** anything about spacing's effect on DP learning (INC-I1 open); any MM-T1/T2 *value* (bands unchanged); product correctness beyond the encoded oracle. Attached to DR-M04 / ledger §EXP; decision stays `provisional`, C2 stays `unresolved` · non-downgradable.

## 8. Self-check

- Versioned frozen case set; explicit per-case oracle; CONTROL case guards oracle validity. **PASS.**
- ENV + CCR-1…7 recorded; ≥2 isolated repeats, identical. **PASS.**
- Results read from process output; SUT unmodified; no value invented; nothing settled. **PASS.**
