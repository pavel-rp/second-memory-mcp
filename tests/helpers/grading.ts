import type { RubricGradingPayload } from '../../src/domain/algorithms/grade-mapper.js';

/**
 * Build a rubric-anchored grading payload that the deterministic mapper resolves
 * to exactly `quality` (0–5). Weights: core_correctness 2, completeness 1,
 * reasoning_validity 1, precision 1. Each credited criterion carries a non-empty
 * verbatim justifying span so it counts.
 *
 * Reachable target selections (sum = quality):
 *   0 → none · 1 → completeness · 2 → core_correctness ·
 *   3 → core_correctness+completeness · 4 → +reasoning_validity · 5 → all four
 */
export function rubricForQuality(quality: number): RubricGradingPayload {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error(`rubricForQuality: quality must be an integer 0–5, got ${quality}`);
  }
  const credited: Record<keyof RubricGradingPayload['criteria'], boolean> = {
    core_correctness: false,
    completeness: false,
    reasoning_validity: false,
    precision: false,
  };
  const selections: Record<number, (keyof RubricGradingPayload['criteria'])[]> = {
    0: [],
    1: ['completeness'],
    2: ['core_correctness'],
    3: ['core_correctness', 'completeness'],
    4: ['core_correctness', 'completeness', 'reasoning_validity'],
    5: ['core_correctness', 'completeness', 'reasoning_validity', 'precision'],
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
      core_correctness: true,
      completeness: true,
      reasoning_validity: true,
      precision: true,
    },
    justifying_spans: {},
  };
}
