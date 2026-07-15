import type { RubricGradingPayload } from '../../src/domain/algorithms/grade-mapper.js';

/**
 * Build a rubric-anchored grading payload that the deterministic mapper resolves
 * to exactly `quality` (0–5). Weights: correct_recurrence 2, correct_base_case 1,
 * correct_iteration_order 1, complexity_stated 1. Each credited criterion carries
 * a non-empty verbatim justifying span so it counts.
 *
 * Reachable target selections (sum = quality):
 *   0 → none · 1 → base · 2 → recurrence · 3 → recurrence+base ·
 *   4 → recurrence+base+order · 5 → all four
 */
export function rubricForQuality(quality: number): RubricGradingPayload {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error(`rubricForQuality: quality must be an integer 0–5, got ${quality}`);
  }
  const credited: Record<keyof RubricGradingPayload['criteria'], boolean> = {
    correct_recurrence: false,
    correct_base_case: false,
    correct_iteration_order: false,
    complexity_stated: false,
  };
  const selections: Record<number, (keyof RubricGradingPayload['criteria'])[]> = {
    0: [],
    1: ['correct_base_case'],
    2: ['correct_recurrence'],
    3: ['correct_recurrence', 'correct_base_case'],
    4: ['correct_recurrence', 'correct_base_case', 'correct_iteration_order'],
    5: ['correct_recurrence', 'correct_base_case', 'correct_iteration_order', 'complexity_stated'],
  };
  const spans: Partial<Record<keyof RubricGradingPayload['criteria'], string>> = {};
  for (const key of selections[quality]) {
    credited[key] = true;
    spans[key] = `evidence for ${key}`;
  }
  return { criteria: credited, justifying_spans: spans };
}

/**
 * An adversarial payload: every criterion is claimed true but NO justifying spans
 * are supplied. A well-formed schema accepts it (all criterion booleans present),
 * but the deterministic mapper credits nothing (fail-closed) → quality 0, non-pass.
 * Used to prove the grade is mapper-derived with no raw-quality path: a bare
 * high self-report cannot become a pass.
 */
export function rubricAllClaimedNoSpans(): RubricGradingPayload {
  return {
    criteria: {
      correct_recurrence: true,
      correct_base_case: true,
      correct_iteration_order: true,
      complexity_stated: true,
    },
    justifying_spans: {},
  };
}
