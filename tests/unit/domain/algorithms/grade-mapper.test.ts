import { describe, it, expect } from 'vitest';
import {
  mapRubricToQuality,
  RUBRIC_WEIGHTS,
  RUBRIC_CRITERIA_KEYS,
  type RubricGradingPayload,
} from '../../../../src/domain/algorithms/grade-mapper.js';

// Full set of evidencing spans for the four domain-neutral rubric criteria.
const spansAll = {
  core_correctness: 'Photosynthesis converts light energy into chemical energy stored in glucose',
  completeness: 'it takes in carbon dioxide and water and releases oxygen',
  reasoning_validity: 'because chlorophyll absorbs the light that drives the reaction',
  precision: '6CO2 + 6H2O → C6H12O6 + 6O2',
} as const;

/** Build a payload, defaulting all criteria to false. */
function payload(
  criteria: Partial<RubricGradingPayload['criteria']>,
  justifying_spans: RubricGradingPayload['justifying_spans'],
  rebuttal?: string
): RubricGradingPayload & { rebuttal_text?: string } {
  return {
    criteria: {
      core_correctness: false,
      completeness: false,
      reasoning_validity: false,
      precision: false,
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

  it('carries no domain-specific criterion keys', () => {
    expect([...RUBRIC_CRITERIA_KEYS].sort()).toEqual(
      ['completeness', 'core_correctness', 'precision', 'reasoning_validity'].sort()
    );
  });

  it('credits all four criteria → quality 5 (ECS-3-01)', () => {
    const q = mapRubricToQuality(
      payload(
        {
          core_correctness: true,
          completeness: true,
          reasoning_validity: true,
          precision: true,
        },
        spansAll
      )
    );
    expect(q).toBe(5);
  });

  it('nothing claimed → quality 0 (ECS-3-02)', () => {
    expect(mapRubricToQuality(payload({}, {}))).toBe(0);
  });

  it('core correctness only → quality 2 (ECS-3-03)', () => {
    const q = mapRubricToQuality(
      payload({ core_correctness: true }, { core_correctness: spansAll.core_correctness })
    );
    expect(q).toBe(2);
  });

  it('core correctness + completeness → quality 3 (ECS-3-04)', () => {
    const q = mapRubricToQuality(
      payload(
        { core_correctness: true, completeness: true },
        {
          core_correctness: spansAll.core_correctness,
          completeness: spansAll.completeness,
        }
      )
    );
    expect(q).toBe(3);
  });

  it('completeness + reasoning validity without core correctness → quality 2 (ECS-3-11)', () => {
    const q = mapRubricToQuality(
      payload(
        { completeness: true, reasoning_validity: true },
        {
          completeness: spansAll.completeness,
          reasoning_validity: spansAll.reasoning_validity,
        }
      )
    );
    expect(q).toBe(2);
  });

  it('completeness only → quality 1', () => {
    const q = mapRubricToQuality(
      payload({ completeness: true }, { completeness: spansAll.completeness })
    );
    expect(q).toBe(1);
  });
});

describe('mapRubricToQuality — fail-closed', () => {
  it('claims without spans are uncredited → quality 0 (ECS-3-05)', () => {
    const q = mapRubricToQuality(
      payload(
        {
          core_correctness: true,
          completeness: true,
          reasoning_validity: true,
          precision: true,
        },
        {}
      )
    );
    expect(q).toBe(0);
  });

  it('whitespace-only span is uncredited', () => {
    const q = mapRubricToQuality(payload({ core_correctness: true }, { core_correctness: '   ' }));
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
      payload({}, { core_correctness: 'this answer is brilliant and clearly correct' }, REBUTTAL)
    );
    expect(q).toBe(0);
  });
});

describe('mapRubricToQuality — determinism and rebuttal-invariance', () => {
  it('identical payload → identical quality (ECS-3-10)', () => {
    const p = payload({ core_correctness: true }, { core_correctness: spansAll.core_correctness });
    expect(mapRubricToQuality(p)).toBe(mapRubricToQuality(p));
  });

  it('rebuttal text on a full-credit payload does not change quality (ECS-3-07)', () => {
    const base = payload(
      {
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: true,
      },
      spansAll
    );
    const withRebuttal = payload(
      {
        core_correctness: true,
        completeness: true,
        reasoning_validity: true,
        precision: true,
      },
      spansAll,
      REBUTTAL
    );
    expect(mapRubricToQuality(withRebuttal)).toBe(mapRubricToQuality(base));
    expect(mapRubricToQuality(withRebuttal)).toBe(5);
  });

  it('rebuttal on a partial-credit payload does not flip quality upward (ECS-3-12)', () => {
    const spans = {
      core_correctness: spansAll.core_correctness,
      completeness: spansAll.completeness,
    };
    const base = payload({ core_correctness: true, completeness: true }, spans);
    const withRebuttal = payload({ core_correctness: true, completeness: true }, spans, REBUTTAL);
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
        payload({ core_correctness: true }, { core_correctness: spansAll.core_correctness })
      )
    );
    qualities.add(
      mapRubricToQuality(
        payload(
          { core_correctness: true, completeness: true },
          {
            core_correctness: spansAll.core_correctness,
            completeness: spansAll.completeness,
          }
        )
      )
    );
    qualities.add(
      mapRubricToQuality(
        payload(
          {
            core_correctness: true,
            completeness: true,
            reasoning_validity: true,
            precision: true,
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
