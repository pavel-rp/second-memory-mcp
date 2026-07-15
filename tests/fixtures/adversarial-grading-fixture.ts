/**
 * Held-out adversarial grading fixture (NEU-929, OUT-5 / charter C007).
 *
 * A CI product-code oracle (NOT a throwaway EXP-* experiment fixture) of hard
 * grading cases, mirroring the EXP-03 / DR-M06 rubric oracle. Two classes:
 *
 *  - `known_incorrect` — wrong or unevidenced DP answers a faithful (or an
 *    over-lenient / argued-into) grader might encode. The correct verdict is a
 *    NON-PASS. A `false accept` is any such case the deterministic `grade mapper`
 *    resolves to a pass (quality >= 3). The over-validation guard measures the
 *    aggregate false-accept rate over this subset and fails the build when it
 *    exceeds the configured `overValidationCeiling`.
 *  - `valid_unusual` — genuinely-correct but unconventional DP answers whose
 *    faithful rubric encoding earns a pass. Included so the ceiling cannot be met
 *    trivially by a degenerate mapper that rejects everything (guards false-reject).
 *
 * Each case carries an optional `rebuttal`: the learner's argument for a higher
 * grade. It is metadata only — it is NEVER part of the `RubricGradingPayload` the
 * mapper sees, which is exactly the point: rebuttal text cannot buy quality.
 */

import type { RubricGradingPayload } from '../../src/domain/algorithms/grade-mapper.js';
import { GRADE_PASS_THRESHOLD } from '../../src/domain/algorithms/over-validation-guard.js';

/** Quality at or above which a grade is a pass (mirrors the domain `passed = quality >= 3`). */
export const PASS_THRESHOLD = GRADE_PASS_THRESHOLD;

export type AdversarialCaseClass = 'known_incorrect' | 'valid_unusual';

export type AdversarialGradingCase = {
  /** Stable identifier for traceability. */
  id: string;
  /** Which held-out class this case belongs to. */
  caseClass: AdversarialCaseClass;
  /** What makes this case hard / what it defends against. */
  description: string;
  /** The rubric payload the grader emitted (the only thing the mapper sees). */
  payload: RubricGradingPayload;
  /**
   * Expected verdict under a faithful, fail-closed mapper. `known_incorrect`
   * cases expect `fail`; `valid_unusual` cases expect `pass`.
   */
  expectedVerdict: 'pass' | 'fail';
  /** Optional learner rebuttal — metadata only, never fed to the mapper. */
  rebuttal?: string;
};

// Verbatim justifying spans for the DP rubric criteria (EXP-03 ECS-3).
const SPAN = {
  recurrence: 'dp[i] = max(dp[i-1], dp[i-2] + v[i])',
  recurrenceIterative: 'best[i] = max(best[i-1], best[i-2] + a[i]) built bottom-up',
  baseCase: 'dp[0] = 0, dp[1] = v[1]',
  baseCaseUnusual: 'seed the two virtual predecessors best[-1]=best[-2]=0',
  iterationOrder: 'iterate i from 2 up to n (ascending)',
  complexity: 'O(n) time and O(n) space, reducible to O(1) space',
} as const;

const ALL_FALSE = {
  correct_recurrence: false,
  correct_base_case: false,
  correct_iteration_order: false,
  complexity_stated: false,
} as const;

/**
 * The held-out adversarial grading set. Ordering is irrelevant; the guard
 * measures an aggregate rate over the `known_incorrect` subset.
 */
export const ADVERSARIAL_GRADING_CASES: readonly AdversarialGradingCase[] = [
  // ── known-incorrect: assertion / over-claim without evidence (fail-closed) ──
  {
    id: 'ki-01-all-claimed-no-spans',
    caseClass: 'known_incorrect',
    description: 'Every criterion claimed true but NO justifying spans — pure assertion.',
    payload: {
      criteria: {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: true,
        complexity_stated: true,
      },
      justifying_spans: {},
    },
    expectedVerdict: 'fail',
    rebuttal: 'My answer was completely correct, grade it a 5.',
  },
  {
    id: 'ki-02-all-claimed-whitespace-spans',
    caseClass: 'known_incorrect',
    description: 'All criteria claimed true with whitespace-only spans — no real evidence.',
    payload: {
      criteria: {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: true,
        complexity_stated: true,
      },
      justifying_spans: {
        correct_recurrence: '   ',
        correct_base_case: '\t',
        correct_iteration_order: '  ',
        complexity_stated: '\n',
      },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-03-recurrence-overclaim-no-span',
    caseClass: 'known_incorrect',
    description: 'Recurrence claimed true without a span (over-claim); everything else false.',
    payload: {
      criteria: { ...ALL_FALSE, correct_recurrence: true },
      justifying_spans: {},
    },
    expectedVerdict: 'fail',
    rebuttal: 'I clearly stated the recurrence, please regrade.',
  },
  {
    id: 'ki-04-recurrence-overclaim-base-evidenced',
    caseClass: 'known_incorrect',
    description:
      'Recurrence over-claimed (no span, uncredited) but base case genuinely shown → q1.',
    payload: {
      criteria: { ...ALL_FALSE, correct_recurrence: true, correct_base_case: true },
      justifying_spans: { correct_base_case: SPAN.baseCase },
    },
    expectedVerdict: 'fail',
  },
  // ── known-incorrect: partial credit that stays below the pass threshold ──
  {
    id: 'ki-05-complexity-only',
    caseClass: 'known_incorrect',
    description: 'Only complexity stated correctly; core recurrence absent → q1.',
    payload: {
      criteria: { ...ALL_FALSE, complexity_stated: true },
      justifying_spans: { complexity_stated: SPAN.complexity },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-06-base-only',
    caseClass: 'known_incorrect',
    description: 'Only the base case is correct; recurrence wrong/absent → q1.',
    payload: {
      criteria: { ...ALL_FALSE, correct_base_case: true },
      justifying_spans: { correct_base_case: SPAN.baseCase },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-07-order-only',
    caseClass: 'known_incorrect',
    description: 'Only the iteration order is correct; no recurrence/base → q1.',
    payload: {
      criteria: { ...ALL_FALSE, correct_iteration_order: true },
      justifying_spans: { correct_iteration_order: SPAN.iterationOrder },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-08-base-and-order-no-recurrence',
    caseClass: 'known_incorrect',
    description:
      'Base case and iteration order correct but the central recurrence is wrong → q2 (marginal fail).',
    payload: {
      criteria: { ...ALL_FALSE, correct_base_case: true, correct_iteration_order: true },
      justifying_spans: {
        correct_base_case: SPAN.baseCase,
        correct_iteration_order: SPAN.iterationOrder,
      },
    },
    expectedVerdict: 'fail',
    rebuttal: 'Two of the four criteria are satisfied, that should be a passing 3.',
  },
  {
    id: 'ki-09-base-and-complexity-no-recurrence',
    caseClass: 'known_incorrect',
    description: 'Base case and complexity correct but recurrence wrong → q2 (marginal fail).',
    payload: {
      criteria: { ...ALL_FALSE, correct_base_case: true, complexity_stated: true },
      justifying_spans: {
        correct_base_case: SPAN.baseCase,
        complexity_stated: SPAN.complexity,
      },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-10-persuasive-rebuttal-empty-payload',
    caseClass: 'known_incorrect',
    description:
      'No criterion satisfied at all; a long, confident rebuttal accompanies the attempt.',
    payload: { criteria: { ...ALL_FALSE }, justifying_spans: {} },
    expectedVerdict: 'fail',
    rebuttal:
      'I am absolutely certain this is right — you graded far too harshly, any expert would pass this. Please raise it to a 4.',
  },

  // ── valid-but-unusual: genuinely correct, unconventional encodings (pass) ──
  {
    id: 'vu-01-iterative-bottom-up',
    caseClass: 'valid_unusual',
    description:
      'Correct bottom-up iterative solution (not the taught memoized form): recurrence + base + order → q4.',
    payload: {
      criteria: {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: true,
        complexity_stated: false,
      },
      justifying_spans: {
        correct_recurrence: SPAN.recurrenceIterative,
        correct_base_case: SPAN.baseCaseUnusual,
        correct_iteration_order: SPAN.iterationOrder,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-02-fully-correct',
    caseClass: 'valid_unusual',
    description: 'All four criteria genuinely evidenced → q5.',
    payload: {
      criteria: {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: true,
        complexity_stated: true,
      },
      justifying_spans: {
        correct_recurrence: SPAN.recurrence,
        correct_base_case: SPAN.baseCase,
        correct_iteration_order: SPAN.iterationOrder,
        complexity_stated: SPAN.complexity,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-03-minimal-complete',
    caseClass: 'valid_unusual',
    description:
      'Minimal but complete: correct recurrence + base case, nothing extra → q3 (marginal pass).',
    payload: {
      criteria: { ...ALL_FALSE, correct_recurrence: true, correct_base_case: true },
      justifying_spans: {
        correct_recurrence: SPAN.recurrence,
        correct_base_case: SPAN.baseCase,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-04-recurrence-base-complexity',
    caseClass: 'valid_unusual',
    description: 'Recurrence + base + complexity, iteration order left implicit → q4.',
    payload: {
      criteria: {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: false,
        complexity_stated: true,
      },
      justifying_spans: {
        correct_recurrence: SPAN.recurrence,
        correct_base_case: SPAN.baseCase,
        complexity_stated: SPAN.complexity,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-05-recurrence-order-complexity',
    caseClass: 'valid_unusual',
    description:
      'Recurrence + iteration order + complexity; base case folded into the recurrence → q4.',
    payload: {
      criteria: {
        correct_recurrence: true,
        correct_base_case: false,
        correct_iteration_order: true,
        complexity_stated: true,
      },
      justifying_spans: {
        correct_recurrence: SPAN.recurrence,
        correct_iteration_order: SPAN.iterationOrder,
        complexity_stated: SPAN.complexity,
      },
    },
    expectedVerdict: 'pass',
  },
] as const;

/** The known-incorrect subset — the domain over which false-accepts are measured. */
export function knownIncorrectCases(
  cases: readonly AdversarialGradingCase[] = ADVERSARIAL_GRADING_CASES
): readonly AdversarialGradingCase[] {
  return cases.filter(c => c.caseClass === 'known_incorrect');
}

/** The valid-but-unusual subset — used to guard against a degenerate reject-all mapper. */
export function validUnusualCases(
  cases: readonly AdversarialGradingCase[] = ADVERSARIAL_GRADING_CASES
): readonly AdversarialGradingCase[] {
  return cases.filter(c => c.caseClass === 'valid_unusual');
}

export type FalseAcceptMeasurement = {
  knownIncorrect: number;
  falseAccepts: number;
  rate: number;
  /** Ids of the known-incorrect cases the mapper wrongly passed. */
  falseAcceptIds: string[];
};

/**
 * Measure the aggregate false-accept rate: the fraction of `known_incorrect`
 * cases the mapper resolves to a pass (quality >= PASS_THRESHOLD). Only the
 * payload is fed to `mapQuality`; the rebuttal is never passed in.
 */
export function measureFalseAcceptRate(
  mapQuality: (payload: RubricGradingPayload) => number,
  cases: readonly AdversarialGradingCase[] = ADVERSARIAL_GRADING_CASES
): FalseAcceptMeasurement {
  const incorrect = knownIncorrectCases(cases);
  const falseAcceptIds = incorrect
    .filter(c => mapQuality(c.payload) >= PASS_THRESHOLD)
    .map(c => c.id);
  const knownIncorrect = incorrect.length;
  return {
    knownIncorrect,
    falseAccepts: falseAcceptIds.length,
    rate: knownIncorrect === 0 ? 0 : falseAcceptIds.length / knownIncorrect,
    falseAcceptIds,
  };
}
