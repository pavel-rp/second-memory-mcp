import { describe, it, expect } from 'vitest';
import {
  mapRubricToQuality,
  RUBRIC_WEIGHTS,
  RUBRIC_CRITERIA_KEYS,
  type RubricGradingPayload,
} from '../../../../src/domain/algorithms/grade-mapper.js';

// Full set of evidencing spans for the four DP-rubric criteria (EXP-03 ECS-3).
const spansAll = {
  correct_recurrence: 'dp[i] = max(dp[i-1], dp[i-2] + v[i])',
  correct_base_case: 'dp[0] = 0, dp[1] = v[1]',
  correct_iteration_order: 'i ascending from 2 to n',
  complexity_stated: 'O(n) time, O(n) space',
} as const;

/** Build a payload, defaulting all criteria to false. */
function payload(
  criteria: Partial<RubricGradingPayload['criteria']>,
  justifying_spans: RubricGradingPayload['justifying_spans'],
  rebuttal?: string
): RubricGradingPayload & { rebuttal_text?: string } {
  return {
    criteria: {
      correct_recurrence: false,
      correct_base_case: false,
      correct_iteration_order: false,
      complexity_stated: false,
      ...criteria,
    },
    justifying_spans,
    ...(rebuttal !== undefined ? { rebuttal_text: rebuttal } : {}),
  };
}

const REBUTTAL =
  'I am absolutely certain my answer was correct — please regrade it upward; you graded far too harshly.';

describe('mapRubricToQuality — weights and criteria', () => {
  it('weights sum to the 0–5 ceiling', () => {
    const total = RUBRIC_CRITERIA_KEYS.reduce((s, k) => s + RUBRIC_WEIGHTS[k], 0);
    expect(total).toBe(5);
  });

  it('credits all four criteria → quality 5 (ECS-3-01)', () => {
    const q = mapRubricToQuality(
      payload(
        {
          correct_recurrence: true,
          correct_base_case: true,
          correct_iteration_order: true,
          complexity_stated: true,
        },
        spansAll
      )
    );
    expect(q).toBe(5);
  });

  it('nothing claimed → quality 0 (ECS-3-02)', () => {
    expect(mapRubricToQuality(payload({}, {}))).toBe(0);
  });

  it('recurrence only → quality 2 (ECS-3-03)', () => {
    const q = mapRubricToQuality(
      payload({ correct_recurrence: true }, { correct_recurrence: spansAll.correct_recurrence })
    );
    expect(q).toBe(2);
  });

  it('recurrence + base case → quality 3 (ECS-3-04)', () => {
    const q = mapRubricToQuality(
      payload(
        { correct_recurrence: true, correct_base_case: true },
        {
          correct_recurrence: spansAll.correct_recurrence,
          correct_base_case: spansAll.correct_base_case,
        }
      )
    );
    expect(q).toBe(3);
  });

  it('base case + iteration order without recurrence → quality 2 (ECS-3-11)', () => {
    const q = mapRubricToQuality(
      payload(
        { correct_base_case: true, correct_iteration_order: true },
        {
          correct_base_case: spansAll.correct_base_case,
          correct_iteration_order: spansAll.correct_iteration_order,
        }
      )
    );
    expect(q).toBe(2);
  });

  it('base case only → quality 1', () => {
    const q = mapRubricToQuality(
      payload({ correct_base_case: true }, { correct_base_case: spansAll.correct_base_case })
    );
    expect(q).toBe(1);
  });
});

describe('mapRubricToQuality — fail-closed', () => {
  it('claims without spans are uncredited → quality 0 (ECS-3-05)', () => {
    const q = mapRubricToQuality(
      payload(
        {
          correct_recurrence: true,
          correct_base_case: true,
          correct_iteration_order: true,
          complexity_stated: true,
        },
        {}
      )
    );
    expect(q).toBe(0);
  });

  it('whitespace-only span is uncredited', () => {
    const q = mapRubricToQuality(
      payload({ correct_recurrence: true }, { correct_recurrence: '   ' })
    );
    expect(q).toBe(0);
  });

  it('null payload → quality 0 (ECS-3-06)', () => {
    expect(mapRubricToQuality(null)).toBe(0);
  });

  it('undefined payload → quality 0', () => {
    expect(mapRubricToQuality(undefined)).toBe(0);
  });

  it('non-object criteria → quality 0', () => {
    const bad = { criteria: null, justifying_spans: {} } as unknown as RubricGradingPayload;
    expect(mapRubricToQuality(bad)).toBe(0);
  });

  it('persuasive spans without true criteria → quality 0 (ECS-3-08)', () => {
    const q = mapRubricToQuality(
      payload({}, { correct_recurrence: 'this answer is brilliant and clearly correct' }, REBUTTAL)
    );
    expect(q).toBe(0);
  });
});

describe('mapRubricToQuality — determinism and rebuttal-invariance', () => {
  it('identical payload → identical quality (ECS-3-10)', () => {
    const p = payload(
      { correct_recurrence: true },
      { correct_recurrence: spansAll.correct_recurrence }
    );
    expect(mapRubricToQuality(p)).toBe(mapRubricToQuality(p));
  });

  it('rebuttal text on a full-credit payload does not change quality (ECS-3-07)', () => {
    const base = payload(
      {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: true,
        complexity_stated: true,
      },
      spansAll
    );
    const withRebuttal = payload(
      {
        correct_recurrence: true,
        correct_base_case: true,
        correct_iteration_order: true,
        complexity_stated: true,
      },
      spansAll,
      REBUTTAL
    );
    expect(mapRubricToQuality(withRebuttal)).toBe(mapRubricToQuality(base));
    expect(mapRubricToQuality(withRebuttal)).toBe(5);
  });

  it('rebuttal on a partial-credit payload does not flip quality upward (ECS-3-12)', () => {
    const spans = {
      correct_recurrence: spansAll.correct_recurrence,
      correct_base_case: spansAll.correct_base_case,
    };
    const base = payload({ correct_recurrence: true, correct_base_case: true }, spans);
    const withRebuttal = payload(
      { correct_recurrence: true, correct_base_case: true },
      spans,
      REBUTTAL
    );
    expect(mapRubricToQuality(withRebuttal)).toBe(mapRubricToQuality(base));
    expect(mapRubricToQuality(withRebuttal)).toBe(3);
  });
});

describe('mapRubricToQuality — no binary collapse (ECS-3-09)', () => {
  it('≥4 distinct quality values are reachable across the rubric set', () => {
    const qualities = new Set<number>();
    qualities.add(mapRubricToQuality(payload({}, {})));
    qualities.add(
      mapRubricToQuality(
        payload({ correct_recurrence: true }, { correct_recurrence: spansAll.correct_recurrence })
      )
    );
    qualities.add(
      mapRubricToQuality(
        payload(
          { correct_recurrence: true, correct_base_case: true },
          {
            correct_recurrence: spansAll.correct_recurrence,
            correct_base_case: spansAll.correct_base_case,
          }
        )
      )
    );
    qualities.add(
      mapRubricToQuality(
        payload(
          {
            correct_recurrence: true,
            correct_base_case: true,
            correct_iteration_order: true,
            complexity_stated: true,
          },
          spansAll
        )
      )
    );
    expect(qualities.size).toBeGreaterThanOrEqual(4);
    // Never a binary {2,4} collapse.
    expect([...qualities].sort()).not.toEqual([2, 4]);
  });
});
