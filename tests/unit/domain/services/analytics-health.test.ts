import { describe, it, expect } from 'vitest';
import {
  computeSchedulerHealth,
  MIN_SAMPLE_SIZE,
  INTERVAL_BAND_EDGES_DAYS,
  OVERDUE_BAND_EDGES_DAYS,
  INTERVAL_BAND_KEYS,
  OVERDUE_BAND_KEYS,
  TEACHING_TIER_KEYS,
  type RetentionCell,
  type RetentionObservation,
} from '../../../../src/domain/services/analytics-health.js';

/**
 * Properly-typed observation factory — no `as any`. Defaults describe a healthy
 * established observation; each test overrides only the fields it exercises.
 */
function makeObservation(overrides: Partial<RetentionObservation> = {}): RetentionObservation {
  return {
    sessionQuestionId: 'sq-default',
    firstAttemptPassed: true,
    eventualPassed: true,
    snapshotBand: 'established',
    snapshotPredictedRecall: 0.9,
    snapshotIntervalDays: 10,
    snapshotDaysOverdue: 0,
    teachingApproach: 'recall',
    ...overrides,
  };
}

/** A cell that saw no observations: counts zero, rates suppressed, flag set. */
function emptyCell(key: string): RetentionCell {
  return {
    key,
    sampleSize: 0,
    retained: 0,
    trueRetentionRate: null,
    eventualPassed: 0,
    eventualPassRate: null,
    belowMinSample: true,
  };
}

/** Total sample size across a breakdown axis — the SC-4 sum invariant. */
function sumSampleSizes(cells: RetentionCell[]): number {
  return cells.reduce((total, cell) => total + cell.sampleSize, 0);
}

/**
 * The SC-1 fixture: eight established observations with a hand-computed
 * pass/fail distribution spread across every breakdown axis.
 *
 *  # | tier        | interval | overdue | first | eventual
 *  1 | recall      |        3 |     0   |  pass |  pass
 *  2 | recall      |        3 |     0   |  fail |  fail
 *  3 | recall      |       10 |     1.5 |  pass |  pass
 *  4 | cued_recall |       10 |     2   |  fail |  pass   (pivot-hint retry)
 *  5 | cued_recall |       25 |     4   |  pass |  pass
 *  6 | reteach     |       70 |    10   |  fail |  fail
 *  7 | scaffold    |       30 |     0.5 |  pass |  pass
 *  8 | (null tier) |        8 |     0   |  pass |  pass
 */
function sc1Observations(): RetentionObservation[] {
  return [
    makeObservation({
      sessionQuestionId: 'sq-1',
      teachingApproach: 'recall',
      snapshotIntervalDays: 3,
      snapshotDaysOverdue: 0,
      firstAttemptPassed: true,
      eventualPassed: true,
    }),
    makeObservation({
      sessionQuestionId: 'sq-2',
      teachingApproach: 'recall',
      snapshotIntervalDays: 3,
      snapshotDaysOverdue: 0,
      firstAttemptPassed: false,
      eventualPassed: false,
    }),
    makeObservation({
      sessionQuestionId: 'sq-3',
      teachingApproach: 'recall',
      snapshotIntervalDays: 10,
      snapshotDaysOverdue: 1.5,
      firstAttemptPassed: true,
      eventualPassed: true,
    }),
    makeObservation({
      sessionQuestionId: 'sq-4',
      teachingApproach: 'cued_recall',
      snapshotIntervalDays: 10,
      snapshotDaysOverdue: 2,
      firstAttemptPassed: false,
      eventualPassed: true,
    }),
    makeObservation({
      sessionQuestionId: 'sq-5',
      teachingApproach: 'cued_recall',
      snapshotIntervalDays: 25,
      snapshotDaysOverdue: 4,
      firstAttemptPassed: true,
      eventualPassed: true,
    }),
    makeObservation({
      sessionQuestionId: 'sq-6',
      teachingApproach: 'reteach',
      snapshotIntervalDays: 70,
      snapshotDaysOverdue: 10,
      firstAttemptPassed: false,
      eventualPassed: false,
    }),
    makeObservation({
      sessionQuestionId: 'sq-7',
      teachingApproach: 'scaffold',
      snapshotIntervalDays: 30,
      snapshotDaysOverdue: 0.5,
      firstAttemptPassed: true,
      eventualPassed: true,
    }),
    makeObservation({
      sessionQuestionId: 'sq-8',
      teachingApproach: null,
      snapshotIntervalDays: 8,
      snapshotDaysOverdue: 0,
      firstAttemptPassed: true,
      eventualPassed: true,
    }),
  ];
}

describe('analytics-health constants', () => {
  it('binds the spec values', () => {
    expect(MIN_SAMPLE_SIZE).toBe(20);
    expect([...INTERVAL_BAND_EDGES_DAYS]).toEqual([1, 7, 21, 60]);
    expect([...OVERDUE_BAND_EDGES_DAYS]).toEqual([1, 3, 7]);
  });

  it('binds the fixed breakdown key orders', () => {
    expect([...INTERVAL_BAND_KEYS]).toEqual(['1-6d', '7-20d', '21-59d', '60d+']);
    expect([...OVERDUE_BAND_KEYS]).toEqual(['on_time', '1-2d', '3-6d', '7d+']);
    expect([...TEACHING_TIER_KEYS]).toEqual([
      'recall',
      'cued_recall',
      'reteach',
      'scaffold',
      'unknown',
    ]);
  });
});

describe('computeSchedulerHealth — SC-1 hand-computed fixtures', () => {
  const report = computeSchedulerHealth(sc1Observations(), { minSampleSize: 1 });

  it('reports the hand-computed headline cell', () => {
    // 8 established first attempts. Passed on attempt 1: #1,3,5,7,8 = 5 → 5/8 = 0.625.
    // Passed on attempt 1 or 2: #1,3,4,5,7,8 = 6 → 6/8 = 0.75.
    expect(report.trueRetention).toEqual({
      key: 'established',
      sampleSize: 8,
      retained: 5,
      trueRetentionRate: 0.625,
      eventualPassed: 6,
      eventualPassRate: 0.75,
      belowMinSample: false,
    });
  });

  it('reports the hand-computed coverage block', () => {
    expect(report.coverage).toEqual({
      totalFirstAttempts: 8,
      coveredFirstAttempts: 8,
      uncoveredFirstAttempts: 0,
      coverageRatio: 1,
      establishedFirstAttempts: 8,
      freshFirstAttempts: 0,
    });
  });

  it('echoes the band definitions and the effective minimum sample size', () => {
    expect(report.minSampleSize).toBe(1);
    expect(report.bandDefinitions).toEqual({
      intervalBandEdgesDays: [1, 7, 21, 60],
      daysOverdueBandEdgesDays: [1, 3, 7],
    });
  });

  it('reports the teaching-tier breakdown in fixed order', () => {
    expect(report.breakdowns.byTeachingTier).toEqual([
      // #1,2,3 → 2 of 3 retained, 2 of 3 eventual (2/3 = 0.6667 at 4dp)
      {
        key: 'recall',
        sampleSize: 3,
        retained: 2,
        trueRetentionRate: 0.6667,
        eventualPassed: 2,
        eventualPassRate: 0.6667,
        belowMinSample: false,
      },
      // #4,5 → 1 of 2 retained, 2 of 2 eventual
      {
        key: 'cued_recall',
        sampleSize: 2,
        retained: 1,
        trueRetentionRate: 0.5,
        eventualPassed: 2,
        eventualPassRate: 1,
        belowMinSample: false,
      },
      // #6
      {
        key: 'reteach',
        sampleSize: 1,
        retained: 0,
        trueRetentionRate: 0,
        eventualPassed: 0,
        eventualPassRate: 0,
        belowMinSample: false,
      },
      // #7
      {
        key: 'scaffold',
        sampleSize: 1,
        retained: 1,
        trueRetentionRate: 1,
        eventualPassed: 1,
        eventualPassRate: 1,
        belowMinSample: false,
      },
      // #8 — a null approach maps to the `unknown` tier
      {
        key: 'unknown',
        sampleSize: 1,
        retained: 1,
        trueRetentionRate: 1,
        eventualPassed: 1,
        eventualPassRate: 1,
        belowMinSample: false,
      },
    ]);
  });

  it('reports the interval-band breakdown in fixed order', () => {
    expect(report.breakdowns.byIntervalBand).toEqual([
      // interval 3 → #1,2
      {
        key: '1-6d',
        sampleSize: 2,
        retained: 1,
        trueRetentionRate: 0.5,
        eventualPassed: 1,
        eventualPassRate: 0.5,
        belowMinSample: false,
      },
      // interval 10 → #3,4; interval 8 → #8
      {
        key: '7-20d',
        sampleSize: 3,
        retained: 2,
        trueRetentionRate: 0.6667,
        eventualPassed: 3,
        eventualPassRate: 1,
        belowMinSample: false,
      },
      // interval 25 → #5; interval 30 → #7
      {
        key: '21-59d',
        sampleSize: 2,
        retained: 2,
        trueRetentionRate: 1,
        eventualPassed: 2,
        eventualPassRate: 1,
        belowMinSample: false,
      },
      // interval 70 → #6
      {
        key: '60d+',
        sampleSize: 1,
        retained: 0,
        trueRetentionRate: 0,
        eventualPassed: 0,
        eventualPassRate: 0,
        belowMinSample: false,
      },
    ]);
  });

  it('reports the days-overdue breakdown in fixed order', () => {
    expect(report.breakdowns.byDaysOverdueBand).toEqual([
      // overdue 0 → #1,2,8; overdue 0.5 → #7
      {
        key: 'on_time',
        sampleSize: 4,
        retained: 3,
        trueRetentionRate: 0.75,
        eventualPassed: 3,
        eventualPassRate: 0.75,
        belowMinSample: false,
      },
      // overdue 1.5 → #3; overdue 2 → #4
      {
        key: '1-2d',
        sampleSize: 2,
        retained: 1,
        trueRetentionRate: 0.5,
        eventualPassed: 2,
        eventualPassRate: 1,
        belowMinSample: false,
      },
      // overdue 4 → #5
      {
        key: '3-6d',
        sampleSize: 1,
        retained: 1,
        trueRetentionRate: 1,
        eventualPassed: 1,
        eventualPassRate: 1,
        belowMinSample: false,
      },
      // overdue 10 → #6
      {
        key: '7d+',
        sampleSize: 1,
        retained: 0,
        trueRetentionRate: 0,
        eventualPassed: 0,
        eventualPassRate: 0,
        belowMinSample: false,
      },
    ]);
  });

  it('keeps every breakdown axis summing to the headline sample size', () => {
    expect(sumSampleSizes(report.breakdowns.byTeachingTier)).toBe(8);
    expect(sumSampleSizes(report.breakdowns.byIntervalBand)).toBe(8);
    expect(sumSampleSizes(report.breakdowns.byDaysOverdueBand)).toBe(8);
  });
});

describe('computeSchedulerHealth — SC-2 first-attempt semantics', () => {
  // Three questions passed outright, one failed both attempts.
  const base: RetentionObservation[] = [
    makeObservation({ sessionQuestionId: 'b-1' }),
    makeObservation({ sessionQuestionId: 'b-2' }),
    makeObservation({ sessionQuestionId: 'b-3' }),
    makeObservation({
      sessionQuestionId: 'b-4',
      firstAttemptPassed: false,
      eventualPassed: false,
    }),
  ];
  // The same set plus one question that failed attempt 1 and passed the pivot-hint retry.
  const withRetry: RetentionObservation[] = [
    ...base,
    makeObservation({
      sessionQuestionId: 'b-5',
      firstAttemptPassed: false,
      eventualPassed: true,
    }),
  ];

  const baseReport = computeSchedulerHealth(base, { minSampleSize: 1 });
  const retryReport = computeSchedulerHealth(withRetry, { minSampleSize: 1 });

  it('never lets the pivot-hint retry contribute to true retention', () => {
    expect(baseReport.trueRetention).toEqual({
      key: 'established',
      sampleSize: 4,
      retained: 3,
      trueRetentionRate: 0.75,
      eventualPassed: 3,
      eventualPassRate: 0.75,
      belowMinSample: false,
    });
    // The added question contributes retained 0 / eventualPassed 1.
    expect(retryReport.trueRetention).toEqual({
      key: 'established',
      sampleSize: 5,
      retained: 3,
      trueRetentionRate: 0.6,
      eventualPassed: 4,
      eventualPassRate: 0.8,
      belowMinSample: false,
    });
  });

  it('strictly lowers true retention and strictly raises the eventual-pass rate', () => {
    const baseTrue = baseReport.trueRetention.trueRetentionRate;
    const baseEventual = baseReport.trueRetention.eventualPassRate;
    expect(baseTrue).not.toBeNull();
    expect(baseEventual).not.toBeNull();
    expect(retryReport.trueRetention.trueRetentionRate).toBeLessThan(Number(baseTrue));
    expect(retryReport.trueRetention.eventualPassRate).toBeGreaterThan(Number(baseEventual));
  });
});

describe('computeSchedulerHealth — SC-3 fresh band is separated', () => {
  const freshFree = computeSchedulerHealth(sc1Observations(), { minSampleSize: 1 });
  const withFresh = computeSchedulerHealth(
    [
      ...sc1Observations(),
      // Fresh rows carry no predicted recall and a null or zero interval.
      makeObservation({
        sessionQuestionId: 'f-1',
        snapshotBand: 'fresh',
        snapshotPredictedRecall: null,
        snapshotIntervalDays: null,
        firstAttemptPassed: false,
        eventualPassed: false,
      }),
      makeObservation({
        sessionQuestionId: 'f-2',
        snapshotBand: 'fresh',
        snapshotPredictedRecall: null,
        snapshotIntervalDays: 0,
        firstAttemptPassed: true,
        eventualPassed: true,
      }),
      makeObservation({
        sessionQuestionId: 'f-3',
        snapshotBand: 'fresh',
        snapshotPredictedRecall: null,
        snapshotIntervalDays: null,
        firstAttemptPassed: true,
        eventualPassed: true,
      }),
    ],
    { minSampleSize: 1 }
  );

  it('leaves the headline and every breakdown cell untouched', () => {
    expect(withFresh.trueRetention).toEqual(freshFree.trueRetention);
    expect(withFresh.breakdowns).toEqual(freshFree.breakdowns);
  });

  it('reports the fresh band as its own cell with its own sample size', () => {
    expect(withFresh.freshBandRetention).toEqual({
      key: 'fresh',
      sampleSize: 3,
      retained: 2,
      trueRetentionRate: 0.6667,
      eventualPassed: 2,
      eventualPassRate: 0.6667,
      belowMinSample: false,
    });
    expect(withFresh.coverage.freshFirstAttempts).toBe(3);
  });

  it('counts fresh rows as covered but never as established', () => {
    expect(withFresh.coverage).toEqual({
      totalFirstAttempts: 11,
      coveredFirstAttempts: 11,
      uncoveredFirstAttempts: 0,
      coverageRatio: 1,
      establishedFirstAttempts: 8,
      freshFirstAttempts: 3,
    });
  });
});

describe('computeSchedulerHealth — SC-4 overdueness bands but never excludes', () => {
  const report = computeSchedulerHealth(
    [0, 0.5, 2, 5, 30].map((daysOverdue, index) =>
      makeObservation({
        sessionQuestionId: `o-${index}`,
        snapshotDaysOverdue: daysOverdue,
      })
    ),
    { minSampleSize: 1 }
  );

  it('counts every overdue attempt toward the headline', () => {
    expect(report.trueRetention.sampleSize).toBe(5);
    expect(report.trueRetention.retained).toBe(5);
    expect(report.trueRetention.trueRetentionRate).toBe(1);
  });

  it('lands 0, 0.5, 2, 5 and 30 days overdue in the right bands', () => {
    const sizes = report.breakdowns.byDaysOverdueBand.map(cell => ({
      key: cell.key,
      sampleSize: cell.sampleSize,
    }));
    expect(sizes).toEqual([
      { key: 'on_time', sampleSize: 2 },
      { key: '1-2d', sampleSize: 1 },
      { key: '3-6d', sampleSize: 1 },
      { key: '7d+', sampleSize: 1 },
    ]);
  });

  it('keeps the days-overdue sample sizes summing to the headline', () => {
    expect(sumSampleSizes(report.breakdowns.byDaysOverdueBand)).toBe(
      report.trueRetention.sampleSize
    );
  });
});

describe('computeSchedulerHealth — SC-5 honest thin data', () => {
  it('suppresses rates and keeps counts below the minimum sample size', () => {
    const report = computeSchedulerHealth([
      makeObservation({ sessionQuestionId: 't-1' }),
      makeObservation({
        sessionQuestionId: 't-2',
        firstAttemptPassed: false,
        eventualPassed: true,
      }),
    ]);

    expect(report.minSampleSize).toBe(MIN_SAMPLE_SIZE);
    expect(report.trueRetention).toEqual({
      key: 'established',
      sampleSize: 2,
      retained: 1,
      trueRetentionRate: null,
      eventualPassed: 2,
      eventualPassRate: null,
      belowMinSample: true,
    });
    expect(report.coverage).toEqual({
      totalFirstAttempts: 2,
      coveredFirstAttempts: 2,
      uncoveredFirstAttempts: 0,
      coverageRatio: 1,
      establishedFirstAttempts: 2,
      freshFirstAttempts: 0,
    });
    // Every breakdown cell suppresses too, and every count survives.
    for (const cell of report.breakdowns.byTeachingTier) {
      expect(cell.belowMinSample).toBe(true);
      expect(cell.trueRetentionRate).toBeNull();
      expect(cell.eventualPassRate).toBeNull();
      expect(typeof cell.sampleSize).toBe('number');
      expect(typeof cell.retained).toBe('number');
      expect(typeof cell.eventualPassed).toBe('number');
    }
  });

  it('prints the rate once the sample reaches the threshold exactly', () => {
    const atThreshold = Array.from({ length: 20 }, (_unused, index) =>
      makeObservation({
        sessionQuestionId: `n-${index}`,
        firstAttemptPassed: index < 15,
        eventualPassed: index < 18,
      })
    );
    expect(computeSchedulerHealth(atThreshold).trueRetention).toEqual({
      key: 'established',
      sampleSize: 20,
      retained: 15,
      trueRetentionRate: 0.75,
      eventualPassed: 18,
      eventualPassRate: 0.9,
      belowMinSample: false,
    });

    // One observation short of the threshold suppresses again.
    const justBelow = computeSchedulerHealth(atThreshold.slice(0, 19));
    expect(justBelow.trueRetention.belowMinSample).toBe(true);
    expect(justBelow.trueRetention.trueRetentionRate).toBeNull();
    expect(justBelow.trueRetention.eventualPassRate).toBeNull();
    expect(justBelow.trueRetention.sampleSize).toBe(19);
  });

  it('returns a complete well-formed payload for the zero-row case', () => {
    expect(computeSchedulerHealth([])).toEqual({
      minSampleSize: 20,
      bandDefinitions: {
        intervalBandEdgesDays: [1, 7, 21, 60],
        daysOverdueBandEdgesDays: [1, 3, 7],
      },
      coverage: {
        totalFirstAttempts: 0,
        coveredFirstAttempts: 0,
        uncoveredFirstAttempts: 0,
        coverageRatio: 0,
        establishedFirstAttempts: 0,
        freshFirstAttempts: 0,
      },
      trueRetention: emptyCell('established'),
      freshBandRetention: emptyCell('fresh'),
      breakdowns: {
        byTeachingTier: TEACHING_TIER_KEYS.map(key => emptyCell(key)),
        byIntervalBand: INTERVAL_BAND_KEYS.map(key => emptyCell(key)),
        byDaysOverdueBand: OVERDUE_BAND_KEYS.map(key => emptyCell(key)),
      },
    });
  });

  it('never divides by zero even when the caller passes minSampleSize 0', () => {
    const report = computeSchedulerHealth([], { minSampleSize: 0 });
    expect(report.trueRetention.trueRetentionRate).toBeNull();
    expect(report.trueRetention.eventualPassRate).toBeNull();
    expect(report.trueRetention.belowMinSample).toBe(true);
    expect(report.coverage.coverageRatio).toBe(0);
    for (const cell of report.breakdowns.byIntervalBand) {
      expect(cell.trueRetentionRate).toBeNull();
      expect(cell.eventualPassRate).toBeNull();
    }
  });
});

describe('computeSchedulerHealth — coverage guards', () => {
  const covered: RetentionObservation[] = [
    makeObservation({ sessionQuestionId: 'c-1' }),
    makeObservation({
      sessionQuestionId: 'c-2',
      firstAttemptPassed: false,
      eventualPassed: false,
    }),
  ];

  function uncovered(id: string, passed: boolean): RetentionObservation {
    return makeObservation({
      sessionQuestionId: id,
      snapshotBand: null,
      snapshotPredictedRecall: null,
      snapshotIntervalDays: null,
      snapshotDaysOverdue: null,
      firstAttemptPassed: passed,
      eventualPassed: passed,
    });
  }

  it('lets uncovered rows into the coverage denominator only', () => {
    const coveredOnly = computeSchedulerHealth(covered, { minSampleSize: 1 });
    const withUncovered = computeSchedulerHealth(
      [...covered, uncovered('u-1', false), uncovered('u-2', true)],
      { minSampleSize: 1 }
    );

    expect(withUncovered.trueRetention).toEqual(coveredOnly.trueRetention);
    expect(withUncovered.freshBandRetention).toEqual(coveredOnly.freshBandRetention);
    expect(withUncovered.breakdowns).toEqual(coveredOnly.breakdowns);
    expect(withUncovered.coverage).toEqual({
      totalFirstAttempts: 4,
      coveredFirstAttempts: 2,
      uncoveredFirstAttempts: 2,
      coverageRatio: 0.5,
      establishedFirstAttempts: 2,
      freshFirstAttempts: 0,
    });
  });

  it('treats an unrecognized band as uncovered rather than as the headline', () => {
    const report = computeSchedulerHealth(
      [makeObservation({ sessionQuestionId: 'x-1', snapshotBand: 'mystery' })],
      { minSampleSize: 1 }
    );
    expect(report.coverage.uncoveredFirstAttempts).toBe(1);
    expect(report.coverage.establishedFirstAttempts).toBe(0);
    expect(report.coverage.freshFirstAttempts).toBe(0);
    expect(report.trueRetention.sampleSize).toBe(0);
  });

  it('rounds the coverage ratio to four decimals and never returns NaN', () => {
    const report = computeSchedulerHealth([
      makeObservation({ sessionQuestionId: 'r-1' }),
      uncovered('r-2', false),
      uncovered('r-3', true),
    ]);
    expect(report.coverage.coverageRatio).toBe(0.3333);
  });
});

describe('computeSchedulerHealth — banding boundaries and D-4 fallbacks', () => {
  function intervalBandOf(intervalDays: number | null): string {
    const report = computeSchedulerHealth(
      [makeObservation({ sessionQuestionId: 'i-1', snapshotIntervalDays: intervalDays })],
      { minSampleSize: 1 }
    );
    const populated = report.breakdowns.byIntervalBand.filter(cell => cell.sampleSize === 1);
    expect(populated).toHaveLength(1);
    return populated[0].key;
  }

  function overdueBandOf(daysOverdue: number | null): string {
    const report = computeSchedulerHealth(
      [makeObservation({ sessionQuestionId: 'd-1', snapshotDaysOverdue: daysOverdue })],
      { minSampleSize: 1 }
    );
    const populated = report.breakdowns.byDaysOverdueBand.filter(cell => cell.sampleSize === 1);
    expect(populated).toHaveLength(1);
    return populated[0].key;
  }

  it('applies half-open [edge, next_edge) interval banding', () => {
    expect([1, 6, 7, 20, 21, 59, 60, 1000].map(intervalBandOf)).toEqual([
      '1-6d',
      '1-6d',
      '7-20d',
      '7-20d',
      '21-59d',
      '21-59d',
      '60d+',
      '60d+',
    ]);
  });

  it('applies half-open days-overdue banding', () => {
    expect([0, 0.5, 1, 2, 3, 5, 6.9, 7, 30].map(overdueBandOf)).toEqual([
      'on_time',
      'on_time',
      '1-2d',
      '1-2d',
      '3-6d',
      '3-6d',
      '3-6d',
      '7d+',
      '7d+',
    ]);
  });

  it('drops null, non-finite and out-of-domain intervals into the lowest band', () => {
    expect(intervalBandOf(null)).toBe('1-6d');
    expect(intervalBandOf(Number.NaN)).toBe('1-6d');
    expect(intervalBandOf(Number.POSITIVE_INFINITY)).toBe('1-6d');
    expect(intervalBandOf(Number.NEGATIVE_INFINITY)).toBe('1-6d');
    expect(intervalBandOf(0)).toBe('1-6d');
    expect(intervalBandOf(-5)).toBe('1-6d');
  });

  it('drops null, non-finite and negative overdue values into on_time', () => {
    expect(overdueBandOf(null)).toBe('on_time');
    expect(overdueBandOf(Number.NaN)).toBe('on_time');
    expect(overdueBandOf(Number.POSITIVE_INFINITY)).toBe('on_time');
    expect(overdueBandOf(Number.NEGATIVE_INFINITY)).toBe('on_time');
    expect(overdueBandOf(-3)).toBe('on_time');
  });

  it('never throws and keeps the sum invariant on pathological rows', () => {
    const report = computeSchedulerHealth(
      [
        makeObservation({
          sessionQuestionId: 'p-1',
          snapshotIntervalDays: null,
          snapshotDaysOverdue: null,
        }),
        makeObservation({
          sessionQuestionId: 'p-2',
          snapshotIntervalDays: Number.NaN,
          snapshotDaysOverdue: Number.NaN,
        }),
        makeObservation({
          sessionQuestionId: 'p-3',
          snapshotIntervalDays: -1,
          snapshotDaysOverdue: -1,
        }),
      ],
      { minSampleSize: 1 }
    );
    expect(report.trueRetention.sampleSize).toBe(3);
    expect(sumSampleSizes(report.breakdowns.byIntervalBand)).toBe(3);
    expect(sumSampleSizes(report.breakdowns.byDaysOverdueBand)).toBe(3);
    expect(sumSampleSizes(report.breakdowns.byTeachingTier)).toBe(3);
  });
});

describe('computeSchedulerHealth — teaching tier mapping', () => {
  it('maps null and unrecognized approaches to the unknown tier', () => {
    const report = computeSchedulerHealth(
      [
        makeObservation({ sessionQuestionId: 'tt-1', teachingApproach: null }),
        makeObservation({ sessionQuestionId: 'tt-2', teachingApproach: 'not_a_tier' }),
        makeObservation({ sessionQuestionId: 'tt-3', teachingApproach: '' }),
        makeObservation({ sessionQuestionId: 'tt-4', teachingApproach: 'scaffold' }),
      ],
      { minSampleSize: 1 }
    );
    const sizes = new Map(report.breakdowns.byTeachingTier.map(cell => [cell.key, cell.sampleSize]));
    expect(sizes.get('unknown')).toBe(3);
    expect(sizes.get('scaffold')).toBe(1);
    expect(sizes.get('recall')).toBe(0);
    expect(sizes.get('cued_recall')).toBe(0);
    expect(sizes.get('reteach')).toBe(0);
  });

  it('emits all five tier keys in fixed order even when empty', () => {
    const report = computeSchedulerHealth(
      [makeObservation({ sessionQuestionId: 'tt-5', teachingApproach: 'reteach' })],
      { minSampleSize: 1 }
    );
    expect(report.breakdowns.byTeachingTier.map(cell => cell.key)).toEqual([...TEACHING_TIER_KEYS]);
  });
});

describe('computeSchedulerHealth — the NEU-846 seam is inert', () => {
  it('ignores snapshotPredictedRecall entirely', () => {
    const withRecall = sc1Observations();
    const withoutRecall = sc1Observations().map(observation => ({
      ...observation,
      snapshotPredictedRecall: null,
    }));
    expect(computeSchedulerHealth(withoutRecall, { minSampleSize: 1 })).toEqual(
      computeSchedulerHealth(withRecall, { minSampleSize: 1 })
    );
  });
});
