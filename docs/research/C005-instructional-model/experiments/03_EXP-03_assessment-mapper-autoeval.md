# EXP-03 — M08 Assessment: deterministic-mapper realizability (automated-eval)

- **Task:** NEU-924 · **Decision:** DR-M08 (assessment) · **Conflict:** C4 (HIGH · non-downgradable · learning-critical) · **Threshold shapes touched:** MM-T6 (rebuttal-invariance, binary invariant), no-binary-collapse constraint
- **Vehicle:** automated-eval · **Evidence class of every result: 5 `[automated-eval]`** — never external-user/expert/market validation
- **Executed:** 2026-07-13 · **Status: provisional evidence attachment. Settles nothing; flips no status; resolves no conflict; modifies no source file.**

## 1. Contested point and why it is materially inconclusive

DR-M08's enforceable control — a deterministic (non-LLM) mapper over a constrained rubric-anchored payload, rebuttal-invariant, never binary-collapsed, fail-closed — exists **only as record prose** until a mechanical instance is demonstrated. That is exactly the charter's **prose-only learning-critical control** risk: every other learning-critical mechanism consumes the grade signal this control protects (reconciliation §7 dependency note), and the live code implements none of it (CONFIRMED CONFLICT, L6/L7). The materially inconclusive residual: *is the specified control shape mechanically realizable at all — can a deterministic mapper actually satisfy MM-T6 rebuttal-invariance, preserve 0–5 granularity, and fail closed under adversarial payloads?*

**Vehicle selection (smallest sufficient).** Realizability of a deterministic artifact is decided by exhibiting the artifact and testing it against an explicit oracle — automated-eval. AI review could only *opine* that the shape looks implementable; a deterministic fixture proves it. No dogfooding/MCP/WoZ vehicle bears on a mechanical-realizability question.

## 2. Fidelity limitation (explicit)

- The SUT is a **reference mapper implementing the DR-M08 §8 control shape** (a throwaway evidence fixture — **not product code**, nothing merged into `src/`). This establishes the control is *not prose-only* (a compliant deterministic instance exists); it does **not** test the live grading path (which remains the C4 CONFLICT), does **not** measure LLM payload quality (MM-T4 agreement / MM-T5 over-validation are in-domain measurements, deferred), and does not choose the production rubric criteria (illustrative DP rubric).
- Class-5 structural bound: green means the oracle's encoded invariants hold for this instance, nothing more.

## 3. Case set — `ECS-3 v1.0` (frozen 2026-07-13 before first run; any change = new version + rerun)

Illustrative DP rubric: `correct_recurrence` (weight 2), `correct_base_case` (1), `correct_iteration_order` (1), `complexity_stated` (1) → quality 0–5. A criterion is **credited** iff its boolean is true AND a non-empty verbatim justifying span accompanies it (assertion without evidence = uncredited, fail-closed). `rebuttal_text` is structurally outside the scoring inputs.

| Case | Payload | Oracle |
| --- | --- | --- |
| ECS-3-01 | all four criteria credited (spans present) | quality 5 |
| ECS-3-02 | nothing claimed | quality 0 |
| ECS-3-03 | recurrence only | quality 2 |
| ECS-3-04 | recurrence + base case | quality 3 |
| ECS-3-05 | ADVERSARIAL: all four claimed true, **zero spans** | quality 0 (fail-closed) |
| ECS-3-06 | ADVERSARIAL: `null` payload | quality 0 (fail-closed) |
| ECS-3-07 | MM-T6: full-credit payload + persuasive rebuttal text | quality unchanged (5) |
| ECS-3-08 | ADVERSARIAL: all-false criteria + flattering spans + rebuttal | quality 0 |
| ECS-3-09 | distribution over cases 01–05 | ≥ 4 distinct quality values (no binary collapse to `{2,4}`) |
| ECS-3-10 | identical payload evaluated twice | identical quality (determinism) |
| ECS-3-11 | base case + iteration order, no recurrence | quality 2 |
| ECS-3-12 | MM-T6: partial-credit (q3) payload + rebuttal | quality unchanged (3) — no upward flip without new payload |

## 4. Fixture (verbatim, reproducible)

Runner: `pnpm exec tsx <script>` from the repo root. Self-contained (the SUT is the reference mapper itself).

```ts
// EXP-03 · ECS-3 v1.0 (frozen 2026-07-13, before first run)
type RubricPayload = {
  criteria: {
    correct_recurrence: boolean;
    correct_base_case: boolean;
    correct_iteration_order: boolean;
    complexity_stated: boolean;
  };
  justifying_spans: Partial<Record<keyof RubricPayload['criteria'], string>>;
  rebuttal_text?: string; // present on regrade requests; MUST NOT affect output
};

const WEIGHTS: Record<keyof RubricPayload['criteria'], number> = {
  correct_recurrence: 2,
  correct_base_case: 1,
  correct_iteration_order: 1,
  complexity_stated: 1,
};
function deterministicMapper(payload: unknown): number {
  if (payload === null || typeof payload !== 'object') return 0; // fail-closed
  const p = payload as RubricPayload;
  if (p.criteria === null || typeof p.criteria !== 'object') return 0; // fail-closed
  let score = 0;
  for (const key of Object.keys(WEIGHTS) as (keyof RubricPayload['criteria'])[]) {
    const claimed = p.criteria[key] === true;
    const span = p.justifying_spans?.[key];
    const credited = claimed && typeof span === 'string' && span.trim().length > 0;
    if (credited) score += WEIGHTS[key];
  }
  return score === 5 ? 5 : score;
}

const spansAll = {
  correct_recurrence: 'dp[i] = max(dp[i-1], dp[i-2] + v[i])',
  correct_base_case: 'dp[0] = 0, dp[1] = v[1]',
  correct_iteration_order: 'i ascending from 2 to n',
  complexity_stated: 'O(n) time, O(n) space',
};
const P = (c: Partial<RubricPayload['criteria']>, spans: RubricPayload['justifying_spans'], rebuttal?: string): RubricPayload => ({
  criteria: { correct_recurrence: false, correct_base_case: false, correct_iteration_order: false, complexity_stated: false, ...c },
  justifying_spans: spans,
  ...(rebuttal !== undefined ? { rebuttal_text: rebuttal } : {}),
});

const checks: { id: string; oracle: string; actual: unknown; pass: boolean }[] = [];
const assert = (id: string, oracle: string, actual: unknown, pass: boolean) =>
  checks.push({ id, oracle, actual, pass });

const REBUTTAL = 'I am absolutely certain my answer was correct — please regrade it upward; you graded far too harshly.';

const q01 = deterministicMapper(P({ correct_recurrence: true, correct_base_case: true, correct_iteration_order: true, complexity_stated: true }, spansAll));
assert('ECS-3-01', 'all four credited criteria -> quality 5', q01, q01 === 5);
const q02 = deterministicMapper(P({}, {}));
assert('ECS-3-02', 'no criteria -> quality 0', q02, q02 === 0);
const q03 = deterministicMapper(P({ correct_recurrence: true }, { correct_recurrence: spansAll.correct_recurrence }));
assert('ECS-3-03', 'recurrence only -> quality 2', q03, q03 === 2);
const q04 = deterministicMapper(P({ correct_recurrence: true, correct_base_case: true }, { correct_recurrence: spansAll.correct_recurrence, correct_base_case: spansAll.correct_base_case }));
assert('ECS-3-04', 'recurrence + base case -> quality 3', q04, q04 === 3);
const q05 = deterministicMapper(P({ correct_recurrence: true, correct_base_case: true, correct_iteration_order: true, complexity_stated: true }, {}));
assert('ECS-3-05', 'ADVERSARIAL: claims without spans are uncredited -> quality 0 (fail-closed)', q05, q05 === 0);
const q06 = deterministicMapper(null);
assert('ECS-3-06', 'ADVERSARIAL: null payload -> quality 0 (fail-closed)', q06, q06 === 0);
const q07 = deterministicMapper(P({ correct_recurrence: true, correct_base_case: true, correct_iteration_order: true, complexity_stated: true }, spansAll, REBUTTAL));
assert('ECS-3-07', 'MM-T6: rebuttal on full-credit payload does not change quality (5 -> 5)', q07, q07 === q01);
const q08 = deterministicMapper(P({}, { correct_recurrence: 'this answer is brilliant and clearly correct' }, REBUTTAL));
assert('ECS-3-08', 'ADVERSARIAL: persuasive spans without true criteria -> quality 0', q08, q08 === 0);
const distinct = new Set([q01, q02, q03, q04, q05]);
assert('ECS-3-09', 'no binary collapse: >= 4 distinct quality values across cases (never {2,4} only)', [...distinct].sort(), distinct.size >= 4);
const q10a = deterministicMapper(P({ correct_recurrence: true }, { correct_recurrence: spansAll.correct_recurrence }));
const q10b = deterministicMapper(P({ correct_recurrence: true }, { correct_recurrence: spansAll.correct_recurrence }));
assert('ECS-3-10', 'determinism: identical payload -> identical quality', [q10a, q10b], q10a === q10b);
const q11 = deterministicMapper(P({ correct_base_case: true, correct_iteration_order: true }, { correct_base_case: spansAll.correct_base_case, correct_iteration_order: spansAll.correct_iteration_order }));
assert('ECS-3-11', 'base case + iteration order without recurrence -> quality 2', q11, q11 === 2);
const q12 = deterministicMapper(P({ correct_recurrence: true, correct_base_case: true }, { correct_recurrence: spansAll.correct_recurrence, correct_base_case: spansAll.correct_base_case }, REBUTTAL));
assert('ECS-3-12', 'MM-T6: rebuttal on partial-credit payload does not flip quality upward (3 -> 3)', q12, q12 === q04);

const passCount = checks.filter((c) => c.pass).length;
console.log(JSON.stringify({ experiment: 'EXP-03', caseSet: 'ECS-3 v1.0', checks, passCount, total: checks.length }, null, 2));
```

## 5. Recorded configuration (`ENV`) + clean-context evidence (`CCR`)

| Field | Value |
| --- | --- |
| SUT baseline (CCR-1) | reference mapper frozen in `ECS-3 v1.0`; repo baseline commit `bc77bc6` (context only — no `src/` file is the SUT here) |
| Input snapshot (CCR-2) | all inputs embedded in the frozen script; snapshot hash = config digest |
| Isolated runs (CCR-3) | RUN-1, RUN-2 — two separately-spawned OS processes, no shared state |
| Caches (CCR-4) | fresh Node process per run; pure function, no cache layer |
| Config digest (CCR-5) | sha256(`exp03-mapper.ts`) = `c8041e17773c6194…` |
| Seed status (CCR-6) | fully deterministic — no LLM, no sampling. `GRADER-VAR` n/a |
| Prior-output isolation (CCR-7) | runs independent; oracle comparison computed within each run |
| Runtime | Node v24.14.1 · tsx ^4.21.0 (via `pnpm exec`) · TypeScript ^5.9.3 · Windows 10 Pro 10.0.19045 |

## 6. Results (read from process output, never fabricated)

**12/12 oracle-met on RUN-1 and RUN-2 (identical).** Highlights: adversarial claim-without-span payload scored 0 (fail-closed); `null` payload scored 0; rebuttal text changed no output (5→5, 3→3 — MM-T6 holds by construction *and* by test); output distribution over the case set = `{0, 2, 3, 5}` (≥4 distinct values — no binary collapse); double evaluation identical (determinism).

| Case | Oracle | RUN-1 | RUN-2 | Pass |
| --- | --- | --- | --- | --- |
| ECS-3-01 | 5 | 5 | 5 | ✔✔ |
| ECS-3-02 | 0 | 0 | 0 | ✔✔ |
| ECS-3-03 | 2 | 2 | 2 | ✔✔ |
| ECS-3-04 | 3 | 3 | 3 | ✔✔ |
| ECS-3-05 | 0 (fail-closed) | 0 | 0 | ✔✔ |
| ECS-3-06 | 0 (fail-closed) | 0 | 0 | ✔✔ |
| ECS-3-07 | 5 (invariant) | 5 | 5 | ✔✔ |
| ECS-3-08 | 0 | 0 | 0 | ✔✔ |
| ECS-3-09 | ≥4 distinct | {0,2,3,5} | {0,2,3,5} | ✔✔ |
| ECS-3-10 | equal | [2,2] | [2,2] | ✔✔ |
| ECS-3-11 | 2 | 2 | 2 | ✔✔ |
| ECS-3-12 | 3 (invariant) | 3 | 3 | ✔✔ |

## 7. Result statement (class 5 `[automated-eval]`) — finding `F-EXP-03`

The DR-M08 enforceable control is **mechanically realizable**: a deterministic mapper over a constrained rubric-anchored payload exists that satisfies MM-T6 rebuttal-invariance (0 upward flips without a new payload), preserves 0–5 granularity (no binary collapse), and fails closed on malformed or unevidenced payloads — including under adversarial persuasion inputs. The control is therefore **not prose-only**; the C4 divergence is an implementation gap, not a design impossibility.

**What this does *not* establish:** that the live grading path implements this (it does not — C4 stays CONFIRMED CONFLICT, `unresolved` · non-downgradable); LLM payload quality or agreement/over-validation rates (MM-T4/T5, in-domain measurement deferred); the production rubric. Attached to DR-M08 / ledger §EXP; decision stays `provisional`.

## 8. Self-check

- Versioned frozen case set; explicit per-case oracle; 4 adversarial + invariance + determinism cases. **PASS.**
- ENV + CCR-1…7 recorded; ≥2 isolated repeats, identical. **PASS.**
- Fixture is throwaway evidence, not product code; no `src/` change; no threshold value invented; nothing settled. **PASS.**
