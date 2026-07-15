/**
 * Rubric-anchored deterministic grade mapper (DR-M08 / MM-T3–T6, EXP-03 oracle).
 *
 * The final 0–5 quality signal is NOT emitted by the grading agent's free
 * judgement. Instead the agent returns a structured, rubric-anchored payload —
 * per-criterion booleans plus the verbatim span(s) of the learner's answer that
 * justify each criterion — and this pure, non-LLM mapper derives the 0–5 quality
 * deterministically from that payload.
 *
 * Rubric (illustrative DP rubric per EXP-03 `ECS-3`, weights sum to 5):
 *   correct_recurrence       (weight 2)
 *   correct_base_case        (weight 1)
 *   correct_iteration_order  (weight 1)
 *   complexity_stated        (weight 1)
 *
 * A criterion is **credited** iff its boolean is `true` AND a non-empty verbatim
 * justifying span accompanies it. A claimed-true criterion without an evidencing
 * span is uncredited (fail-closed): assertion alone cannot buy quality. A
 * malformed or `null` payload maps to 0 (fail-closed to a non-pass).
 *
 * The rubric-criterion keys are snake_case domain identifiers (mirroring the
 * EXP-03 oracle and the snake_case `REVISE_GRADE_REASONS` domain vocabulary), not
 * transport field names — the payload flows through the tool-schema boundary
 * unchanged, so no snake_case↔camelCase conversion applies to these keys.
 *
 * Pure domain function: never throws, has zero I/O, and returns a computed value.
 */

/** The rubric criteria evaluated for a graded answer. All four are required. */
export type RubricCriteria = {
  correct_recurrence: boolean;
  correct_base_case: boolean;
  correct_iteration_order: boolean;
  complexity_stated: boolean;
};

/**
 * The rubric-anchored grading payload the agent supplies for every graded
 * attempt. `justifying_spans` carries the verbatim span of the learner's answer
 * that evidences each claimed criterion; a criterion without a span is uncredited.
 */
export type RubricGradingPayload = {
  criteria: RubricCriteria;
  justifying_spans: Partial<Record<keyof RubricCriteria, string>>;
};

/** Per-criterion weights; sum to the 0–5 quality ceiling. */
export const RUBRIC_WEIGHTS: Record<keyof RubricCriteria, number> = {
  correct_recurrence: 2,
  correct_base_case: 1,
  correct_iteration_order: 1,
  complexity_stated: 1,
} as const;

/** The ordered rubric-criterion keys. */
export const RUBRIC_CRITERIA_KEYS = Object.keys(RUBRIC_WEIGHTS) as (keyof RubricCriteria)[];

/**
 * Derive the 0–5 quality from a rubric-anchored grading payload, deterministically.
 *
 * Fail-closed contract:
 *   - `null`/non-object payload           → 0
 *   - missing/non-object `criteria`       → 0
 *   - criterion claimed true, no span     → uncredited (contributes 0)
 *   - criterion false                     → uncredited (contributes 0)
 *
 * The same payload always maps to the same quality (no randomness, no LLM), and
 * text outside `criteria`/`justifying_spans` (e.g. a learner rebuttal) can never
 * change the output.
 */
export function mapRubricToQuality(payload: RubricGradingPayload | null | undefined): number {
  if (payload === null || typeof payload !== 'object') {
    return 0; // fail-closed
  }
  const criteria = (payload as RubricGradingPayload).criteria;
  if (criteria === null || typeof criteria !== 'object') {
    return 0; // fail-closed
  }
  const spans = (payload as RubricGradingPayload).justifying_spans;

  let score = 0;
  for (const key of RUBRIC_CRITERIA_KEYS) {
    const claimed = criteria[key] === true;
    const span = spans?.[key];
    const credited = claimed && typeof span === 'string' && span.trim().length > 0;
    if (credited) {
      score += RUBRIC_WEIGHTS[key];
    }
  }
  return score;
}
