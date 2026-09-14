/**
 * Held-out adversarial grading fixture (NEU-929, OUT-5 / charter C007; domain-neutral since NEU-1009).
 *
 * A CI product-code oracle (NOT a throwaway EXP-* experiment fixture) of hard
 * grading cases, mirroring the EXP-03 / DR-M06 rubric oracle. Cases span the
 * question types Second Memory actually teaches — factual recall, conceptual
 * explanation, a non-programming question, and a DP question that does not ask
 * for every criterion — so no case needs invented evidence. Two classes:
 *
 *  - `known_incorrect` — wrong or unevidenced answers a faithful (or an
 *    over-lenient / argued-into) grader might encode. The correct verdict is a
 *    NON-PASS. A `false accept` is any such case the deterministic `grade mapper`
 *    resolves to a pass (quality >= 3). The over-validation guard measures the
 *    aggregate false-accept rate over this subset and fails the build when it
 *    exceeds the configured `overValidationCeiling`.
 *  - `valid_unusual` — genuinely-correct but unconventional answers whose
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

// Verbatim justifying spans, grouped by the question type they answer.
const SPAN = {
  // Factual recall — "What is the capital of Australia?"
  recall: 'The capital of Australia is Canberra',
  // Conceptual explanation — "Why does ice float on water?"
  conceptClaim: 'ice floats because it is less dense than liquid water',
  conceptCoverage: 'when water freezes, hydrogen bonds lock the molecules into an open lattice',
  conceptReasoning:
    'an object less dense than the liquid displaces its weight before fully sinking',
  conceptPrecision: 'about 0.92 g/cm³ for ice versus 1.00 g/cm³ for water',
  // Non-programming — "What triggered the First World War, and why did it spread?"
  historyClaim: 'the assassination of Archduke Franz Ferdinand in 1914 triggered it',
  historyCoverage: 'the alliance system pulled the great powers in one after another',
  // DP question that asks for the recurrence and base case, not for complexity.
  dpRecurrence: 'best[i] = max(best[i-1], best[i-2] + a[i]) built bottom-up',
  dpBaseCase: 'seed the two virtual predecessors best[-1] = best[-2] = 0',
  dpOrder: 'fill i from 0 up to n so both predecessors are already known',
} as const;

const ALL_FALSE = {
  core_correctness: false,
  completeness: false,
  reasoning_validity: false,
  precision: false,
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
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: true,
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
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: true,
      },
      justifying_spans: {
        core_correctness: '   ',
        completeness: '\t',
        reasoning_validity: '  ',
        precision: '\n',
      },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-03-recall-overclaim-no-span',
    caseClass: 'known_incorrect',
    description:
      'Factual recall: core correctness claimed without a span (over-claim); everything else false.',
    payload: {
      criteria: { ...ALL_FALSE, core_correctness: true },
      justifying_spans: {},
    },
    expectedVerdict: 'fail',
    rebuttal: 'I clearly named the capital, please regrade.',
  },
  {
    id: 'ki-04-history-overclaim-coverage-evidenced',
    caseClass: 'known_incorrect',
    description:
      'Non-programming: central claim over-claimed (no span, uncredited) but the spread is genuinely covered → q1.',
    payload: {
      criteria: { ...ALL_FALSE, core_correctness: true, completeness: true },
      justifying_spans: { completeness: SPAN.historyCoverage },
    },
    expectedVerdict: 'fail',
  },
  // ── known-incorrect: partial credit that stays below the pass threshold ──
  {
    id: 'ki-05-concept-precision-only',
    caseClass: 'known_incorrect',
    description:
      'Conceptual explanation: the densities are quoted correctly but the central explanation is wrong → q1.',
    payload: {
      criteria: { ...ALL_FALSE, precision: true },
      justifying_spans: { precision: SPAN.conceptPrecision },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-06-history-coverage-only',
    caseClass: 'known_incorrect',
    description: 'Non-programming: the spread is covered but the trigger is wrong/absent → q1.',
    payload: {
      criteria: { ...ALL_FALSE, completeness: true },
      justifying_spans: { completeness: SPAN.historyCoverage },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-07-concept-reasoning-only',
    caseClass: 'known_incorrect',
    description: 'Conceptual explanation: a valid buoyancy argument applied to a wrong claim → q1.',
    payload: {
      criteria: { ...ALL_FALSE, reasoning_validity: true },
      justifying_spans: { reasoning_validity: SPAN.conceptReasoning },
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'ki-08-concept-coverage-and-reasoning-no-claim',
    caseClass: 'known_incorrect',
    description:
      'Conceptual explanation: lattice and buoyancy covered but the central claim is wrong → q2 (marginal fail).',
    payload: {
      criteria: { ...ALL_FALSE, completeness: true, reasoning_validity: true },
      justifying_spans: {
        completeness: SPAN.conceptCoverage,
        reasoning_validity: SPAN.conceptReasoning,
      },
    },
    expectedVerdict: 'fail',
    rebuttal: 'Two of the four criteria are satisfied, that should be a passing 3.',
  },
  {
    id: 'ki-09-dp-base-and-order-no-recurrence',
    caseClass: 'known_incorrect',
    description:
      'DP question: base case and fill order right but the recurrence itself is wrong → q2 (marginal fail).',
    payload: {
      criteria: { ...ALL_FALSE, completeness: true, reasoning_validity: true },
      justifying_spans: {
        completeness: SPAN.dpBaseCase,
        reasoning_validity: SPAN.dpOrder,
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
    id: 'vu-01-recall-no-reasoning-asked',
    caseClass: 'valid_unusual',
    description:
      'Factual recall: a one-line correct answer. No reasoning or extra precision was asked for, so the correct answer itself satisfies both — never penalized for the omission → q5.',
    payload: {
      criteria: {
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: true,
      },
      justifying_spans: {
        core_correctness: SPAN.recall,
        completeness: SPAN.recall,
        reasoning_validity: SPAN.recall,
        precision: SPAN.recall,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-02-concept-fully-evidenced',
    caseClass: 'valid_unusual',
    description: 'Conceptual explanation: all four criteria genuinely evidenced → q5.',
    payload: {
      criteria: {
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: true,
      },
      justifying_spans: {
        core_correctness: SPAN.conceptClaim,
        completeness: SPAN.conceptCoverage,
        reasoning_validity: SPAN.conceptReasoning,
        precision: SPAN.conceptPrecision,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-03-history-minimal-complete',
    caseClass: 'valid_unusual',
    description: 'Non-programming: correct trigger and spread, nothing extra → q3 (marginal pass).',
    payload: {
      criteria: { ...ALL_FALSE, core_correctness: true, completeness: true },
      justifying_spans: {
        core_correctness: SPAN.historyClaim,
        completeness: SPAN.historyCoverage,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-04-dp-no-complexity-asked',
    caseClass: 'valid_unusual',
    description:
      'DP question that never asked for complexity: correct bottom-up recurrence, base case and fill order, with no complexity stated → q4.',
    payload: {
      criteria: {
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: false,
      },
      justifying_spans: {
        core_correctness: SPAN.dpRecurrence,
        completeness: SPAN.dpBaseCase,
        reasoning_validity: SPAN.dpOrder,
      },
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'vu-05-concept-unusual-framing',
    caseClass: 'valid_unusual',
    description:
      'Conceptual explanation argued from buoyancy with exact densities, lattice mechanism left implicit → q4.',
    payload: {
      criteria: {
        core_correctness: true,
        completeness: false,
        reasoning_validity: true,
        precision: true,
      },
      justifying_spans: {
        core_correctness: SPAN.conceptClaim,
        reasoning_validity: SPAN.conceptReasoning,
        precision: SPAN.conceptPrecision,
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
