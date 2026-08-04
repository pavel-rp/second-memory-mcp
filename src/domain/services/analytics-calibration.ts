/**
 * Predicted-vs-observed calibration analytics (NEU-846) — pure domain computation.
 *
 * Answers "is the scheduler's recall prediction any good?" by scoring
 * `classifyChunk`'s FSRS power-law estimate — persisted per attempt by NEU-844 as
 * `snapshot_predicted_recall` — against what actually happened on the first
 * attempt. The headline is **log-loss**, a proper scoring rule defined
 * per-observation and therefore meaningful at the tens of observations this
 * dataset has; **RMSE-bins** ships alongside as the FSRS-benchmark comparison
 * axis, and a signed **calibration gap** rides both so the direction of the
 * error (over- vs under-confident) is visible.
 *
 * Two structural rules, neither of them a filter written here:
 *
 * 1. **First attempt.** The adapter's SQL already fixes the row set at
 *    `attempt_number = 1` and folds the attempt-2 pivot-hint retry into
 *    `eventualPassed` alone. This module reads `firstAttemptPassed` and
 *    **never reads `eventualPassed`** — no attempt-number filter exists here.
 * 2. **Membership is exactly `snapshotPredictedRecall !== null`.** NEU-844 stores
 *    `predicted_recall = NULL` on the fresh band because there R = 1.0 is
 *    definitional, not measured, and uncovered rows have no snapshot at all. So
 *    the fresh band *cannot* enter the observation set. Both exclusions are
 *    counted in `coverage`, making the exclusion visible rather than silent.
 *
 * Zero I/O, no clock, no imports outside `src/domain/`. Never throws on any
 * input, including an empty array, an all-excluded array, and `NaN`, `±Infinity`
 * or out-of-domain predictions.
 */

import { MIN_SAMPLE_SIZE } from './analytics-health.js';

// ── Named constants (binding — see 01_spec.md) ──────────────────────────────

/**
 * Clamp applied to a prediction before it enters a logarithm:
 * `p̂ = min(max(p, ε), 1 − ε)`.
 *
 * Load-bearing, not defensive. `classifyChunk` returns *exactly* `1.0` whenever
 * `daysOverdue = 0` — every early or on-time review of an established chunk — so
 * `p = 1.0` is the single most likely stored prediction, and an unclamped
 * `ln(1 − 1.0)` on a first-attempt failure there would be `−Infinity`. `1e-6`
 * bounds one surprising failure at ~13.8 nats instead of infinity while staying
 * numerically negligible for every non-degenerate prediction. It rides the
 * response so the figure is reproducible.
 */
export const LOG_LOSS_EPSILON = 1e-6;

/**
 * Lower edges of the ten uniform calibration bins.
 *
 * Half-open `[edge, next)` throughout, with the **top bin closed at 1.0** so the
 * `p = 1.0` mass always lands rather than being dropped off the end. Uniform
 * edges are an engineering default for the current data volume, not an
 * evidence-derived choice; they are emitted on the response so a later revision
 * is a visible contract change.
 */
export const CALIBRATION_BIN_EDGES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] as const;

/** Fixed emission order of the bin array. Index-aligned to `CALIBRATION_BIN_EDGES`. */
export const CALIBRATION_BIN_KEYS = [
  '0.0-0.1',
  '0.1-0.2',
  '0.2-0.3',
  '0.3-0.4',
  '0.4-0.5',
  '0.5-0.6',
  '0.6-0.7',
  '0.7-0.8',
  '0.8-0.9',
  '0.9-1.0',
] as const;

/** Decimal places every emitted rate and metric is rounded to. Mirrors `analytics-health.ts`. */
const METRIC_DECIMAL_PLACES = 4;

// ── Types ──────────────────────────────────────────────────────────────────

export type CalibrationBinKey = (typeof CALIBRATION_BIN_KEYS)[number];

/**
 * The fields this module consumes off one scored question's first-attempt row.
 *
 * Deliberately narrower than `RetentionObservation` / `FirstAttemptObservation`:
 * both satisfy it structurally, so the orchestration passes the array straight
 * through with no re-map, while `eventualPassed` is absent from the consumed set
 * by construction — this module is incapable of reading it.
 */
export type CalibrationObservation = {
  /** Identity only; never an input to any figure. Present so the port row satisfies this type. */
  readonly sessionQuestionId: string;
  /** `passed` on the `attempt_number = 1` row — the only outcome calibration scores. */
  readonly firstAttemptPassed: boolean;
  /** `'established'` | `'fresh'` | `null`. Used only to attribute an exclusion. */
  readonly snapshotBand: string | null;
  /** The persisted power-law estimate. `null` (fresh or uncovered) excludes the row. */
  readonly snapshotPredictedRecall: number | null;
};

/**
 * The metric fields shared by the overall block and every bin.
 *
 * Counts are always present. The three rates are `null` — and `belowMinSample`
 * `true` — exactly when the block's `sampleSize` is `0` or below
 * `minSampleSize`, mirroring `buildCell` in `analytics-health.ts`.
 */
export type CalibrationFigure = {
  /** Observations with a non-null prediction in this block. */
  sampleSize: number;
  /** Of those, how many passed on the first attempt. */
  observedPassed: number;
  /** `observedPassed / sampleSize`, or `null` when suppressed. */
  observedPassRate: number | null;
  /** Mean of the raw (unclamped) predictions, or `null` when suppressed. */
  meanPredictedRecall: number | null;
  /** `meanPredictedRecall − observedPassRate`; positive = overconfident. `null` when suppressed. */
  calibrationGap: number | null;
  /** `true` exactly when the rates are suppressed. */
  belowMinSample: boolean;
};

/** One `[edge, next)` bucket of predictions. Emitted even when empty. */
export type CalibrationBin = CalibrationFigure & {
  key: CalibrationBinKey;
};

/** The whole observation set scored as one block. */
export type CalibrationOverall = CalibrationFigure & {
  /** THE HEADLINE — `−(1/N)·Σ[y·ln(p̂) + (1−y)·ln(1−p̂)]`, nats. `null` when suppressed. */
  logLoss: number | null;
  /** Secondary — `sqrt(Σ_b n_b·(meanPredicted_b − observedRate_b)² / N)` over non-empty bins. */
  rmseBins: number | null;
};

/** How much of the first-attempt population the calibration set could actually cover. */
export type CalibrationCoverage = {
  /** Every first-attempt row handed in, scored or not. */
  totalFirstAttempts: number;
  /** Rows with a usable prediction — the calibration denominator. */
  calibrationObservations: number;
  /** Excluded: `snapshotBand === 'fresh'`, where R = 1.0 is definitional and never stored. */
  excludedFreshBand: number;
  /** Excluded: no usable prediction and not the fresh band (uncovered or out-of-domain). */
  excludedUncovered: number;
  /** `calibrationObservations / totalFirstAttempts`, or `0` when there are no rows. Never `NaN`. */
  coverageRatio: number;
};

export type CalibrationReport = {
  minSampleSize: number;
  /** `CALIBRATION_BIN_EDGES` verbatim, so the bucketing is reproducible by a consumer. */
  binEdges: number[];
  /** `LOG_LOSS_EPSILON` verbatim, so `logLoss` is reproducible by a consumer. */
  logLossEpsilon: number;
  coverage: CalibrationCoverage;
  overall: CalibrationOverall;
  /** All ten bins, in fixed order, including empty ones. */
  bins: CalibrationBin[];
};

export type ComputeCalibrationOptions = {
  /** Defaults to `MIN_SAMPLE_SIZE`. Exists so unit fixtures can stay small. */
  minSampleSize?: number;
};

// ── Internals ──────────────────────────────────────────────────────────────

/** Running tally a figure is built from. `predictedSum` accumulates the raw, unclamped `p`. */
type FigureTally = { sampleSize: number; observedPassed: number; predictedSum: number };

function emptyTally(): FigureTally {
  return { sampleSize: 0, observedPassed: 0, predictedSum: 0 };
}

function addToTally(tally: FigureTally, prediction: number, passed: boolean): void {
  tally.sampleSize += 1;
  tally.predictedSum += prediction;
  if (passed) tally.observedPassed += 1;
}

/**
 * Round an emitted metric to `METRIC_DECIMAL_PLACES`. Inputs are already finite.
 *
 * `calibrationGap` is signed, so a perfectly calibrated block whose floating-point
 * residue is a hair below zero would otherwise emit `-0`. Normalizing it to `0`
 * keeps "perfectly calibrated" a single value rather than two.
 */
function roundMetric(value: number): number {
  const factor = 10 ** METRIC_DECIMAL_PLACES;
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded;
}

/**
 * Normalize a persisted prediction, consistent with `finiteOrNull` in
 * `scheduling-snapshot.ts` plus the `(0, 1]` domain its CHECK constraint admits.
 *
 * `null`, `NaN`, `±Infinity` and out-of-domain values (`<= 0`, `> 1`) are all
 * treated as **absent** — the row is excluded and counted, never coerced into a
 * bin where a garbage value could masquerade as a prediction.
 */
function predictionOrNull(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value > 0 && value <= 1 ? value : null;
}

/**
 * Index of the half-open `[edge, next)` bin a prediction lands in.
 *
 * Callers pass a value already normalized into `(0, 1]`, so the scan always
 * matches at least `edges[0] = 0`; `p = 1.0` matches every edge and therefore
 * lands in the last bin, which is closed at 1.0 rather than half-open.
 */
function binIndexFor(prediction: number): number {
  let index = 0;
  for (let i = 0; i < CALIBRATION_BIN_EDGES.length; i += 1) {
    if (prediction >= CALIBRATION_BIN_EDGES[i]) index = i;
  }
  return index;
}

/**
 * One observation's contribution to the log-loss sum, in nats.
 *
 * The clamp applies to the logarithm only — the raw `p` is what feeds
 * `meanPredictedRecall`, the gap and the binning, so the reported mean is never
 * distorted by a numerical guard.
 */
function logLossTerm(prediction: number, passed: boolean): number {
  const clamped = Math.min(Math.max(prediction, LOG_LOSS_EPSILON), 1 - LOG_LOSS_EPSILON);
  return passed ? -Math.log(clamped) : -Math.log(1 - clamped);
}

/**
 * `sqrt(Σ_b n_b·(meanPredicted_b − observedRate_b)² / N)` over non-empty bins.
 *
 * Weighted by each bin's own size but divided by the **overall** N, so empty
 * bins contribute nothing and the statistic stays comparable to the FSRS
 * benchmark's definition.
 */
function rmseOverBins(tallies: readonly FigureTally[], totalSampleSize: number): number {
  let weighted = 0;
  for (const tally of tallies) {
    if (tally.sampleSize === 0) continue;
    const gap = (tally.predictedSum - tally.observedPassed) / tally.sampleSize;
    weighted += tally.sampleSize * gap * gap;
  }
  return Math.sqrt(weighted / totalSampleSize);
}

/** `true` when a block's rates must be suppressed. `sampleSize === 0` suppresses unconditionally. */
function isSuppressed(sampleSize: number, minSampleSize: number): boolean {
  return sampleSize === 0 || sampleSize < minSampleSize;
}

/** Build the shared metric fields from a tally, applying the suppression rule. */
function buildFigure(tally: FigureTally, minSampleSize: number): CalibrationFigure {
  const suppressed = isSuppressed(tally.sampleSize, minSampleSize);
  return {
    sampleSize: tally.sampleSize,
    observedPassed: tally.observedPassed,
    observedPassRate: suppressed ? null : roundMetric(tally.observedPassed / tally.sampleSize),
    meanPredictedRecall: suppressed ? null : roundMetric(tally.predictedSum / tally.sampleSize),
    calibrationGap: suppressed
      ? null
      : roundMetric((tally.predictedSum - tally.observedPassed) / tally.sampleSize),
    belowMinSample: suppressed,
  };
}

// ── Core function ──────────────────────────────────────────────────────────

/**
 * Score the scheduler's persisted recall predictions against first-attempt
 * outcomes, over the same observation array the retention report consumes.
 *
 * Total over every input: an empty array and an array in which every row is
 * excluded both return a complete, well-formed payload — zero counts, `null`
 * metrics, `belowMinSample: true`, `coverageRatio: 0` (never `NaN`), and all ten
 * bins present. `Σ bins[i].sampleSize === overall.sampleSize` holds always.
 */
export function computeCalibration(
  observations: readonly CalibrationObservation[],
  options?: ComputeCalibrationOptions
): CalibrationReport {
  const minSampleSize = options?.minSampleSize ?? MIN_SAMPLE_SIZE;

  const overallTally = emptyTally();
  const binTallies = CALIBRATION_BIN_KEYS.map(() => emptyTally());
  let logLossSum = 0;
  let excludedFreshBand = 0;
  let excludedUncovered = 0;

  for (const observation of observations) {
    const prediction = predictionOrNull(observation.snapshotPredictedRecall);
    if (prediction === null) {
      // Structural exclusion — counted so it is visible, never silently dropped.
      if (observation.snapshotBand === 'fresh') excludedFreshBand += 1;
      else excludedUncovered += 1;
      continue;
    }

    const passed = observation.firstAttemptPassed === true;
    addToTally(overallTally, prediction, passed);
    addToTally(binTallies[binIndexFor(prediction)], prediction, passed);
    logLossSum += logLossTerm(prediction, passed);
  }

  const totalFirstAttempts = observations.length;
  const sampleSize = overallTally.sampleSize;
  const suppressed = isSuppressed(sampleSize, minSampleSize);

  return {
    minSampleSize,
    binEdges: [...CALIBRATION_BIN_EDGES],
    logLossEpsilon: LOG_LOSS_EPSILON,
    coverage: {
      totalFirstAttempts,
      calibrationObservations: sampleSize,
      excludedFreshBand,
      excludedUncovered,
      // Zero rows must still return a complete, well-formed payload — never NaN.
      coverageRatio: totalFirstAttempts === 0 ? 0 : roundMetric(sampleSize / totalFirstAttempts),
    },
    overall: {
      ...buildFigure(overallTally, minSampleSize),
      logLoss: suppressed ? null : roundMetric(logLossSum / sampleSize),
      rmseBins: suppressed ? null : roundMetric(rmseOverBins(binTallies, sampleSize)),
    },
    bins: CALIBRATION_BIN_KEYS.map((key, index) => ({
      key,
      ...buildFigure(binTallies[index], minSampleSize),
    })),
  };
}
