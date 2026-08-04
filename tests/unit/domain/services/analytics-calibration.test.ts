import { describe, it, expect } from 'vitest';
import {
  computeCalibration,
  CALIBRATION_BIN_EDGES,
  CALIBRATION_BIN_KEYS,
  LOG_LOSS_EPSILON,
  type CalibrationBin,
  type CalibrationReport,
} from '../../../../src/domain/services/analytics-calibration.js';
import {
  MIN_SAMPLE_SIZE,
  type RetentionObservation,
} from '../../../../src/domain/services/analytics-health.js';

/**
 * Properly-typed observation factory — no `as any`.
 *
 * The factory builds a `RetentionObservation`, i.e. the exact row the port
 * returns and the workflow passes straight through, which is why
 * `computeCalibration` accepts it with no re-map. `eventualPassed` is present on
 * every fixture precisely so the SC-4 deep-equality pair can flip it.
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

/** `n` established observations sharing one prediction, the first `passed` of which pass. */
function group(
  prefix: string,
  prediction: number,
  total: number,
  passed: number
): RetentionObservation[] {
  return Array.from({ length: total }, (_unused, index) =>
    makeObservation({
      sessionQuestionId: `${prefix}-${index}`,
      snapshotPredictedRecall: prediction,
      firstAttemptPassed: index < passed,
      // Deliberately the OPPOSITE of the first attempt, so any accidental read
      // of this field would visibly corrupt every figure below.
      eventualPassed: index >= passed,
    })
  );
}

/**
 * The SC-1 / SC-3 fixture — 10 observations, perfectly calibrated by construction:
 *
 *   5 @ p = 0.8 → 4 pass, 1 fail   (observed 0.8, predicted 0.8)
 *   5 @ p = 0.4 → 2 pass, 3 fail   (observed 0.4, predicted 0.4)
 *
 * Hand-computed log-loss:
 *   −(1/10)·[4·ln0.8 + 1·ln0.2 + 2·ln0.4 + 3·ln0.6]
 * = −(1/10)·(−0.8925742 − 1.6094379 − 1.8325815 − 1.5324769)
 * = 0.5867  (4 dp)
 */
function calibratedFixture(): RetentionObservation[] {
  return [...group('cal-hi', 0.8, 5, 4), ...group('cal-lo', 0.4, 5, 2)];
}

/**
 * The SC-2 fixture — 10 observations, uniformly overconfident by 0.3:
 *
 *   5 @ p = 0.9 → 3 pass (observed 0.6, gap +0.3) → bin `0.9-1.0`
 *   5 @ p = 0.5 → 1 pass (observed 0.2, gap +0.3) → bin `0.5-0.6`
 *
 * Hand-computed rmseBins = sqrt((5·0.3² + 5·0.3²)/10) = sqrt(0.9/10) = 0.3.
 * Hand-computed logLoss  = −(1/10)·[3·ln0.9 + 2·ln0.1 + 5·ln0.5] = 0.8387.
 */
function overconfidentFixture(): RetentionObservation[] {
  return [...group('over-hi', 0.9, 5, 3), ...group('over-lo', 0.5, 5, 1)];
}

/** Total sample size across the bin array — the SC-9 sum invariant. */
function sumBinSampleSizes(bins: CalibrationBin[]): number {
  return bins.reduce((total, bin) => total + bin.sampleSize, 0);
}

function binFor(report: CalibrationReport, key: string): CalibrationBin {
  const bin = report.bins.find(candidate => candidate.key === key);
  expect(bin).toBeDefined();
  return bin as CalibrationBin;
}

describe('computeCalibration — log-loss (SC-1)', () => {
  it('returns the hand-computed log-loss over a known fixture', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 1 });
    expect(report.overall.logLoss).toBe(0.5867);
  });

  it('returns the hand-computed log-loss over the overconfident fixture', () => {
    const report = computeCalibration(overconfidentFixture(), { minSampleSize: 1 });
    expect(report.overall.logLoss).toBe(0.8387);
  });

  it('emits the epsilon it clamped with, so the figure is reproducible', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 1 });
    expect(report.logLossEpsilon).toBe(LOG_LOSS_EPSILON);
    expect(LOG_LOSS_EPSILON).toBe(1e-6);
  });
});

describe('computeCalibration — rmseBins and the calibration gap (SC-2, SC-3)', () => {
  it('scores a perfectly calibrated fixture at zero gap and zero rmse', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 1 });

    expect(report.overall.sampleSize).toBe(10);
    expect(report.overall.observedPassed).toBe(6);
    expect(report.overall.observedPassRate).toBe(0.6);
    expect(report.overall.meanPredictedRecall).toBe(0.6);
    expect(report.overall.calibrationGap).toBe(0);
    expect(report.overall.rmseBins).toBe(0);
    expect(report.overall.belowMinSample).toBe(false);
  });

  it('reports zero gap on each populated bin of the calibrated fixture', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 1 });

    expect(binFor(report, '0.8-0.9')).toEqual({
      key: '0.8-0.9',
      sampleSize: 5,
      observedPassed: 4,
      observedPassRate: 0.8,
      meanPredictedRecall: 0.8,
      calibrationGap: 0,
      belowMinSample: false,
    });
    expect(binFor(report, '0.4-0.5')).toEqual({
      key: '0.4-0.5',
      sampleSize: 5,
      observedPassed: 2,
      observedPassRate: 0.4,
      meanPredictedRecall: 0.4,
      calibrationGap: 0,
      belowMinSample: false,
    });
  });

  it('returns the hand-computed non-zero rmse and a signed positive gap when overconfident', () => {
    const report = computeCalibration(overconfidentFixture(), { minSampleSize: 1 });

    expect(report.overall.observedPassRate).toBe(0.4);
    expect(report.overall.meanPredictedRecall).toBe(0.7);
    // Positive = the scheduler predicted more recall than it observed.
    expect(report.overall.calibrationGap).toBe(0.3);
    expect(report.overall.rmseBins).toBe(0.3);
    expect(binFor(report, '0.9-1.0').calibrationGap).toBe(0.3);
    expect(binFor(report, '0.5-0.6').calibrationGap).toBe(0.3);
  });

  it('reports a signed negative gap when the scheduler is underconfident', () => {
    // 5 @ p = 0.5, all of which pass: predicted 0.5 vs observed 1.0.
    const report = computeCalibration(group('under', 0.5, 5, 5), { minSampleSize: 1 });

    expect(report.overall.calibrationGap).toBe(-0.5);
    expect(report.overall.rmseBins).toBe(0.5);
  });
});

describe('computeCalibration — eventualPassed is provably never read (SC-4)', () => {
  it('returns a deep-equal payload when every eventualPassed flag is flipped', () => {
    const base = calibratedFixture();
    const flipped = calibratedFixture().map(observation => ({
      ...observation,
      eventualPassed: !observation.eventualPassed,
    }));

    expect(computeCalibration(flipped, { minSampleSize: 1 })).toEqual(
      computeCalibration(base, { minSampleSize: 1 })
    );
  });

  it('counts a first-attempt failure rescued by the pivot-hint retry as a failure', () => {
    const report = computeCalibration(
      [
        makeObservation({
          sessionQuestionId: 'sq-rescued',
          snapshotPredictedRecall: 0.5,
          firstAttemptPassed: false,
          eventualPassed: true,
        }),
      ],
      { minSampleSize: 1 }
    );

    expect(report.overall.sampleSize).toBe(1);
    expect(report.overall.observedPassed).toBe(0);
    expect(report.overall.observedPassRate).toBe(0);
  });
});

describe('computeCalibration — exclusion is structural (SC-5)', () => {
  it('leaves overall and bins deep-equal when fresh and uncovered rows are added', () => {
    const base = calibratedFixture();
    const withExcluded = [
      ...calibratedFixture(),
      makeObservation({
        sessionQuestionId: 'fresh-0',
        snapshotBand: 'fresh',
        snapshotPredictedRecall: null,
        firstAttemptPassed: false,
      }),
      makeObservation({
        sessionQuestionId: 'fresh-1',
        snapshotBand: 'fresh',
        snapshotPredictedRecall: null,
        firstAttemptPassed: true,
      }),
      makeObservation({
        sessionQuestionId: 'uncovered-0',
        snapshotBand: null,
        snapshotPredictedRecall: null,
        firstAttemptPassed: false,
      }),
    ];

    const baseReport = computeCalibration(base, { minSampleSize: 1 });
    const excludedReport = computeCalibration(withExcluded, { minSampleSize: 1 });

    expect(excludedReport.overall).toEqual(baseReport.overall);
    expect(excludedReport.bins).toEqual(baseReport.bins);

    expect(baseReport.coverage).toEqual({
      totalFirstAttempts: 10,
      calibrationObservations: 10,
      excludedFreshBand: 0,
      excludedUncovered: 0,
      coverageRatio: 1,
    });
    expect(excludedReport.coverage).toEqual({
      totalFirstAttempts: 13,
      calibrationObservations: 10,
      excludedFreshBand: 2,
      excludedUncovered: 1,
      coverageRatio: 0.7692,
    });
  });

  it('returns a complete suppressed payload when every row is excluded', () => {
    const report = computeCalibration(
      [
        makeObservation({
          sessionQuestionId: 'f-0',
          snapshotBand: 'fresh',
          snapshotPredictedRecall: null,
        }),
        makeObservation({
          sessionQuestionId: 'u-0',
          snapshotBand: null,
          snapshotPredictedRecall: null,
        }),
      ],
      { minSampleSize: 1 }
    );

    expect(report.overall).toEqual({
      sampleSize: 0,
      observedPassed: 0,
      observedPassRate: null,
      meanPredictedRecall: null,
      calibrationGap: null,
      belowMinSample: true,
      logLoss: null,
      rmseBins: null,
    });
    expect(report.coverage).toEqual({
      totalFirstAttempts: 2,
      calibrationObservations: 0,
      excludedFreshBand: 1,
      excludedUncovered: 1,
      coverageRatio: 0,
    });
    expect(report.bins).toHaveLength(CALIBRATION_BIN_KEYS.length);
    expect(sumBinSampleSizes(report.bins)).toBe(0);
  });
});

describe('computeCalibration — coverage (SC-6)', () => {
  it('reports all five coverage fields over a mixed population', () => {
    const report = computeCalibration(
      [
        makeObservation({ sessionQuestionId: 'm-0', snapshotPredictedRecall: 0.9 }),
        makeObservation({ sessionQuestionId: 'm-1', snapshotPredictedRecall: 0.7 }),
        makeObservation({ sessionQuestionId: 'm-2', snapshotPredictedRecall: 0.5 }),
        makeObservation({
          sessionQuestionId: 'm-3',
          snapshotBand: 'fresh',
          snapshotPredictedRecall: null,
        }),
        makeObservation({
          sessionQuestionId: 'm-4',
          snapshotBand: 'fresh',
          snapshotPredictedRecall: null,
        }),
        makeObservation({
          sessionQuestionId: 'm-5',
          snapshotBand: null,
          snapshotPredictedRecall: null,
        }),
      ],
      { minSampleSize: 1 }
    );

    expect(report.coverage).toEqual({
      totalFirstAttempts: 6,
      calibrationObservations: 3,
      excludedFreshBand: 2,
      excludedUncovered: 1,
      coverageRatio: 0.5,
    });
  });

  it('reports a coverage ratio of 0 rather than NaN for the empty array', () => {
    const report = computeCalibration([]);

    expect(report.coverage.coverageRatio).toBe(0);
    expect(Number.isNaN(report.coverage.coverageRatio)).toBe(false);
  });

  it('attributes an established row with an unusable prediction to excludedUncovered', () => {
    const report = computeCalibration([
      makeObservation({
        sessionQuestionId: 'bad-0',
        snapshotBand: 'established',
        snapshotPredictedRecall: null,
      }),
    ]);

    expect(report.coverage.excludedUncovered).toBe(1);
    expect(report.coverage.excludedFreshBand).toBe(0);
  });
});

describe('computeCalibration — per-bin honesty (SC-7)', () => {
  it('carries key, sampleSize, observedPassed and belowMinSample on every bin', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 1 });

    for (const bin of report.bins) {
      expect(typeof bin.key).toBe('string');
      expect(typeof bin.sampleSize).toBe('number');
      expect(typeof bin.observedPassed).toBe('number');
      expect(typeof bin.belowMinSample).toBe('boolean');
    }
  });

  it('suppresses a bin below the minimum while keeping its counts', () => {
    // 5 observations per bin, minimum 6 → both populated bins suppress.
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 6 });
    const thin = binFor(report, '0.8-0.9');

    expect(thin.sampleSize).toBe(5);
    expect(thin.observedPassed).toBe(4);
    expect(thin.observedPassRate).toBeNull();
    expect(thin.meanPredictedRecall).toBeNull();
    expect(thin.calibrationGap).toBeNull();
    expect(thin.belowMinSample).toBe(true);
  });

  it('suppresses an empty bin unconditionally, even at minSampleSize 0', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 0 });
    const empty = binFor(report, '0.0-0.1');

    expect(empty.sampleSize).toBe(0);
    expect(empty.observedPassed).toBe(0);
    expect(empty.observedPassRate).toBeNull();
    expect(empty.meanPredictedRecall).toBeNull();
    expect(empty.calibrationGap).toBeNull();
    expect(empty.belowMinSample).toBe(true);
    // A populated bin still reports at minSampleSize 0 — the guard is 0/0, not a floor.
    expect(binFor(report, '0.8-0.9').observedPassRate).toBe(0.8);
  });

  it('suppresses the overall block unconditionally at minSampleSize 0 with no rows', () => {
    const report = computeCalibration([], { minSampleSize: 0 });

    expect(report.overall.belowMinSample).toBe(true);
    expect(report.overall.observedPassRate).toBeNull();
    expect(report.overall.logLoss).toBeNull();
    expect(report.overall.rmseBins).toBeNull();
    expect(Number.isNaN(report.overall.sampleSize)).toBe(false);
  });
});

describe('computeCalibration — default suppression (SC-8)', () => {
  it('suppresses every overall metric below the default minimum sample size', () => {
    const report = computeCalibration(calibratedFixture());

    expect(report.minSampleSize).toBe(MIN_SAMPLE_SIZE);
    expect(report.overall.sampleSize).toBe(10);
    expect(report.overall.observedPassed).toBe(6);
    expect(report.overall.observedPassRate).toBeNull();
    expect(report.overall.meanPredictedRecall).toBeNull();
    expect(report.overall.calibrationGap).toBeNull();
    expect(report.overall.logLoss).toBeNull();
    expect(report.overall.rmseBins).toBeNull();
    expect(report.overall.belowMinSample).toBe(true);
  });

  it('reports once the default minimum is met', () => {
    const report = computeCalibration(group('big', 0.8, MIN_SAMPLE_SIZE, MIN_SAMPLE_SIZE));

    expect(report.overall.sampleSize).toBe(MIN_SAMPLE_SIZE);
    expect(report.overall.belowMinSample).toBe(false);
    expect(report.overall.observedPassRate).toBe(1);
    expect(report.overall.meanPredictedRecall).toBe(0.8);
    expect(report.overall.calibrationGap).toBe(-0.2);
  });
});

describe('computeCalibration — bin order and the sum invariant (SC-9)', () => {
  it('emits all ten bins in fixed order for an empty input', () => {
    const report = computeCalibration([]);

    expect(report.bins.map(bin => bin.key)).toEqual([...CALIBRATION_BIN_KEYS]);
    expect(report.binEdges).toEqual([...CALIBRATION_BIN_EDGES]);
  });

  it('emits all ten bins in fixed order for a populated input', () => {
    const report = computeCalibration(calibratedFixture(), { minSampleSize: 1 });

    expect(report.bins.map(bin => bin.key)).toEqual([...CALIBRATION_BIN_KEYS]);
  });

  it('keeps the bin sample sizes summing to the overall sample size', () => {
    const fixtures: RetentionObservation[][] = [
      [],
      calibratedFixture(),
      overconfidentFixture(),
      [
        ...calibratedFixture(),
        makeObservation({ sessionQuestionId: 'x-0', snapshotPredictedRecall: 1 }),
        makeObservation({ sessionQuestionId: 'x-1', snapshotPredictedRecall: 0.05 }),
        makeObservation({
          sessionQuestionId: 'x-2',
          snapshotBand: 'fresh',
          snapshotPredictedRecall: null,
        }),
      ],
    ];

    for (const fixture of fixtures) {
      const report = computeCalibration(fixture, { minSampleSize: 1 });
      expect(sumBinSampleSizes(report.bins)).toBe(report.overall.sampleSize);
    }
  });

  it('places a prediction on a bin edge in the upper bin', () => {
    const report = computeCalibration(
      [
        makeObservation({ sessionQuestionId: 'edge-0', snapshotPredictedRecall: 0.7 }),
        makeObservation({ sessionQuestionId: 'edge-1', snapshotPredictedRecall: 0.6999 }),
      ],
      { minSampleSize: 1 }
    );

    expect(binFor(report, '0.7-0.8').sampleSize).toBe(1);
    expect(binFor(report, '0.6-0.7').sampleSize).toBe(1);
  });
});

describe('computeCalibration — totality and the epsilon clamp (SC-10)', () => {
  it('returns a complete well-formed payload for the empty array', () => {
    const report = computeCalibration([]);

    expect(report.minSampleSize).toBe(MIN_SAMPLE_SIZE);
    expect(report.logLossEpsilon).toBe(LOG_LOSS_EPSILON);
    expect(report.coverage).toEqual({
      totalFirstAttempts: 0,
      calibrationObservations: 0,
      excludedFreshBand: 0,
      excludedUncovered: 0,
      coverageRatio: 0,
    });
    expect(report.overall).toEqual({
      sampleSize: 0,
      observedPassed: 0,
      observedPassRate: null,
      meanPredictedRecall: null,
      calibrationGap: null,
      belowMinSample: true,
      logLoss: null,
      rmseBins: null,
    });
    expect(report.bins).toHaveLength(10);
  });

  it('lands a passing p = 1.0 in the top bin at a near-zero log-loss', () => {
    const report = computeCalibration(
      [
        makeObservation({
          sessionQuestionId: 'perfect-pass',
          snapshotPredictedRecall: 1,
          firstAttemptPassed: true,
        }),
      ],
      { minSampleSize: 1 }
    );

    // The top bin is closed at 1.0, so the p = 1.0 mass is never dropped.
    expect(binFor(report, '0.9-1.0').sampleSize).toBe(1);
    expect(report.overall.sampleSize).toBe(1);
    expect(report.overall.logLoss).toBe(0);
    expect(report.overall.meanPredictedRecall).toBe(1);
  });

  it('bounds a failing p = 1.0 at the hand-computed −ln(1e-6) instead of Infinity', () => {
    const report = computeCalibration(
      [
        makeObservation({
          sessionQuestionId: 'perfect-fail',
          snapshotPredictedRecall: 1,
          firstAttemptPassed: false,
        }),
      ],
      { minSampleSize: 1 }
    );

    expect(report.overall.logLoss).toBe(13.8155);
    expect(Number.isFinite(report.overall.logLoss)).toBe(true);
    expect(report.overall.observedPassRate).toBe(0);
    expect(report.overall.calibrationGap).toBe(1);
  });

  const degenerateCases: [string, number][] = [
    ['NaN', Number.NaN],
    ['positive Infinity', Number.POSITIVE_INFINITY],
    ['negative Infinity', Number.NEGATIVE_INFINITY],
    ['zero', 0],
    ['negative', -0.5],
    ['above one', 1.5],
  ];

  it.each(degenerateCases)('treats a %s prediction as absent', (_label, prediction) => {
    const report = computeCalibration(
      [
        makeObservation({
          sessionQuestionId: 'degenerate',
          snapshotBand: 'established',
          snapshotPredictedRecall: prediction,
        }),
      ],
      { minSampleSize: 1 }
    );

    expect(report.overall.sampleSize).toBe(0);
    expect(report.overall.observedPassRate).toBeNull();
    expect(report.overall.logLoss).toBeNull();
    expect(report.overall.rmseBins).toBeNull();
    expect(report.coverage.calibrationObservations).toBe(0);
    expect(report.coverage.excludedUncovered).toBe(1);
    expect(sumBinSampleSizes(report.bins)).toBe(0);
  });

  it('never throws on a pathological mixed batch', () => {
    const pathological = [
      makeObservation({ sessionQuestionId: 'p-0', snapshotPredictedRecall: Number.NaN }),
      makeObservation({
        sessionQuestionId: 'p-1',
        snapshotPredictedRecall: Number.POSITIVE_INFINITY,
      }),
      makeObservation({ sessionQuestionId: 'p-2', snapshotPredictedRecall: 1 }),
      makeObservation({
        sessionQuestionId: 'p-3',
        snapshotPredictedRecall: Number.MIN_VALUE,
        firstAttemptPassed: false,
      }),
      makeObservation({
        sessionQuestionId: 'p-4',
        snapshotBand: 'fresh',
        snapshotPredictedRecall: null,
      }),
    ];

    expect(() => computeCalibration(pathological, { minSampleSize: 1 })).not.toThrow();

    const report = computeCalibration(pathological, { minSampleSize: 1 });
    expect(report.overall.sampleSize).toBe(2);
    expect(Number.isFinite(report.overall.logLoss)).toBe(true);
    expect(Number.isFinite(report.overall.rmseBins)).toBe(true);
  });
});
