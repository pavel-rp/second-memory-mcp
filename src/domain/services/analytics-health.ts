/**
 * Scheduler-health retention analytics (NEU-845) — pure domain computation.
 *
 * Answers "does the scheduler actually work?" from the per-attempt scheduling
 * snapshots NEU-844 persists. The headline is **true retention**: the
 * first-attempt pass rate over scored questions whose snapshot recorded the
 * `established` band. The `attempt_number = 2` pivot-hint retry never
 * contributes to that figure — the hint destroys the retrieval event — but it
 * does feed the secondary **eventual-pass rate** over the same denominator.
 *
 * Zero I/O, no clock, no imports outside `src/domain/`. Never throws on any
 * input, including an empty array, null snapshot fields, `NaN`, `Infinity` and
 * negative values.
 */

// ── Named constants (binding — see 01_spec.md "Named Constants") ────────────

/**
 * Minimum observations before a rate is printed at all.
 *
 * Below ~20 observations a binomial pass rate has a ±20pp-plus confidence
 * half-width: it reads authoritative and means nothing. 20 is small enough that
 * real bands populate within weeks of the NEU-844 cutover, large enough that a
 * printed rate is not noise. `computeSchedulerHealth` accepts an optional
 * `minSampleSize` override so unit fixtures stay small; the tool always uses
 * this constant.
 */
export const MIN_SAMPLE_SIZE = 20;

/**
 * Lower edges of the interval bands: `1-6d`, `7-20d`, `21-59d`, `60d+`.
 *
 * 21d is Anki's canonical young/mature boundary, which keeps this table
 * comparable to the reference implementation; 7d separates within-week from
 * multi-week scheduling; 60d isolates the long tail where scheduler error
 * compounds. Established intervals are integers >= 1, so `1` is the floor edge.
 */
export const INTERVAL_BAND_EDGES_DAYS = [1, 7, 21, 60] as const;

/**
 * Lower edges of the days-overdue bands: `on_time`, `1-2d`, `3-6d`, `7d+`.
 *
 * `snapshot_days_overdue` is fractional and clamped at 0, so sub-day lateness is
 * same-review-day noise and belongs in `on_time`; `1-2d` is mild slippage,
 * `3-6d` within-the-week, `7d+` materially lapsed.
 */
export const OVERDUE_BAND_EDGES_DAYS = [1, 3, 7] as const;

/** Fixed emission order of the interval breakdown. Index-aligned to `INTERVAL_BAND_EDGES_DAYS`. */
export const INTERVAL_BAND_KEYS = ['1-6d', '7-20d', '21-59d', '60d+'] as const;

/**
 * Fixed emission order of the days-overdue breakdown. The first key covers
 * everything below `OVERDUE_BAND_EDGES_DAYS[0]`, so this list is one longer than
 * the edge list.
 */
export const OVERDUE_BAND_KEYS = ['on_time', '1-2d', '3-6d', '7d+'] as const;

/**
 * Fixed emission order of the teaching-tier breakdown — the four
 * `chk_teaching_approach` values plus `unknown` for a null or unresolvable
 * approach (including a question mapped to more than one chunk).
 */
export const TEACHING_TIER_KEYS = [
  'recall',
  'cued_recall',
  'reteach',
  'scaffold',
  'unknown',
] as const;

/** Decimal places every emitted rate is rounded to. */
const RATE_DECIMAL_PLACES = 4;

// ── Types ──────────────────────────────────────────────────────────────────

export type IntervalBandKey = (typeof INTERVAL_BAND_KEYS)[number];
export type OverdueBandKey = (typeof OVERDUE_BAND_KEYS)[number];
export type TeachingTierKey = (typeof TEACHING_TIER_KEYS)[number];

/**
 * One scored question, represented by its `attempt_number = 1` row.
 *
 * Field-identical to the `FirstAttemptObservation` port row by design, so the
 * orchestration passes rows straight through with no re-map.
 */
export type RetentionObservation = {
  sessionQuestionId: string;
  /** `passed` on the `attempt_number = 1` row. The only input to true retention. */
  firstAttemptPassed: boolean;
  /** Passed on attempt 1 **or** the attempt-2 pivot-hint retry. */
  eventualPassed: boolean;
  /** `'established'` | `'fresh'` | `null`. `null` means uncovered — no snapshot was recorded. */
  snapshotBand: string | null;
  /**
   * NEU-846 extension seam. This module **never reads this field**: the
   * calibration observation set (`snapshotPredictedRecall !== null`) belongs to
   * NEU-846, which slots `computeCalibration(observations)` in additively over
   * the same array. Present here only so no port or adapter change is needed then.
   */
  snapshotPredictedRecall: number | null;
  /** The chunk's `intervalDays` verbatim at answer time. */
  snapshotIntervalDays: number | null;
  /** `classifyChunk`'s `daysOverdue`, clamped at 0. Fractional days. */
  snapshotDaysOverdue: number | null;
  /** The mapped `session_chunks.teaching_approach`, or `null` when absent/ambiguous. */
  teachingApproach: string | null;
};

/**
 * One reusable cell shape, used by the headline, the fresh figure and every
 * breakdown cell. Counts are always present; only the rates suppress.
 */
export type RetentionCell = {
  key: string;
  /** First-attempt count in this cell. */
  sampleSize: number;
  /** First attempts that passed. */
  retained: number;
  /** `retained / sampleSize`, or `null` when suppressed. */
  trueRetentionRate: number | null;
  /** Passed on attempt 1 or 2. */
  eventualPassed: number;
  /** `eventualPassed / sampleSize`, or `null` when suppressed. */
  eventualPassRate: number | null;
  /** `true` exactly when the rates are suppressed. */
  belowMinSample: boolean;
};

export type RetentionCoverage = {
  totalFirstAttempts: number;
  coveredFirstAttempts: number;
  uncoveredFirstAttempts: number;
  /** `coveredFirstAttempts / totalFirstAttempts`, or `0` when there are no rows. Never `NaN`. */
  coverageRatio: number;
  establishedFirstAttempts: number;
  freshFirstAttempts: number;
};

export type SchedulerHealthReport = {
  minSampleSize: number;
  bandDefinitions: {
    intervalBandEdgesDays: number[];
    daysOverdueBandEdgesDays: number[];
  };
  coverage: RetentionCoverage;
  /** THE HEADLINE — the `established` population. */
  trueRetention: RetentionCell;
  /** The `fresh` band, reported separately and never folded into the headline. */
  freshBandRetention: RetentionCell;
  breakdowns: {
    byTeachingTier: RetentionCell[];
    byIntervalBand: RetentionCell[];
    byDaysOverdueBand: RetentionCell[];
  };
};

export type ComputeSchedulerHealthOptions = {
  /** Defaults to `MIN_SAMPLE_SIZE`. Exists so unit fixtures can stay small. */
  minSampleSize?: number;
};

// ── Internals ──────────────────────────────────────────────────────────────

/** Running tally a cell is built from. */
type CellTally = { sampleSize: number; retained: number; eventualPassed: number };

function emptyTally(): CellTally {
  return { sampleSize: 0, retained: 0, eventualPassed: 0 };
}

function addToTally(tally: CellTally, observation: RetentionObservation): void {
  tally.sampleSize += 1;
  if (observation.firstAttemptPassed) tally.retained += 1;
  if (observation.eventualPassed) tally.eventualPassed += 1;
}

/** Round a ratio to `RATE_DECIMAL_PLACES`. Inputs are already finite and in `[0, 1]`. */
function roundRate(value: number): number {
  const factor = 10 ** RATE_DECIMAL_PLACES;
  return Math.round(value * factor) / factor;
}

/**
 * Build a cell from a tally.
 *
 * Rates are suppressed to `null` — and `belowMinSample` set — exactly when
 * `sampleSize < minSampleSize`, and unconditionally when `sampleSize === 0` so a
 * caller-supplied `minSampleSize: 0` can never produce `0/0 = NaN`. Counts always
 * survive suppression so a consumer can still aggregate honestly.
 */
function buildCell(key: string, tally: CellTally, minSampleSize: number): RetentionCell {
  const suppressed = tally.sampleSize === 0 || tally.sampleSize < minSampleSize;
  return {
    key,
    sampleSize: tally.sampleSize,
    retained: tally.retained,
    trueRetentionRate: suppressed ? null : roundRate(tally.retained / tally.sampleSize),
    eventualPassed: tally.eventualPassed,
    eventualPassRate: suppressed ? null : roundRate(tally.eventualPassed / tally.sampleSize),
    belowMinSample: suppressed,
  };
}

/**
 * Half-open `[edge, next_edge)` banding: the lowest key covers everything below
 * `edges[1]` (interval) or below `edges[0]` (overdue, whose first key `on_time`
 * sits beneath the first edge), and the highest key is unbounded above.
 *
 * `keys.length` is either `edges.length` (interval — key `i` starts at `edges[i]`)
 * or `edges.length + 1` (overdue — key `0` is the below-first-edge bucket).
 * A null, `NaN`, `±Infinity` or below-domain value falls into the lowest key, so
 * every observation lands in exactly one band on each axis and the
 * `Σ band.sampleSize === headline.sampleSize` invariant always holds.
 */
function bandFor<K extends string>(
  value: number | null,
  edges: readonly number[],
  keys: readonly K[]
): K {
  const lowest = keys[0];
  if (typeof value !== 'number' || !Number.isFinite(value)) return lowest;

  // Offset 0 when there is one key per edge (key i starts at edges[i]);
  // offset 1 when a below-first-edge bucket precedes the edges.
  const offset = keys.length - edges.length;
  let index = 0;
  for (let i = 0; i < edges.length; i += 1) {
    if (value >= edges[i]) index = i + offset;
  }
  return keys[index] ?? lowest;
}

function intervalBandFor(value: number | null): IntervalBandKey {
  return bandFor<IntervalBandKey>(value, INTERVAL_BAND_EDGES_DAYS, INTERVAL_BAND_KEYS);
}

function overdueBandFor(value: number | null): OverdueBandKey {
  return bandFor<OverdueBandKey>(value, OVERDUE_BAND_EDGES_DAYS, OVERDUE_BAND_KEYS);
}

/** Map a persisted teaching approach to its tier key. Null/unrecognized → `unknown`. */
function teachingTierFor(approach: string | null): TeachingTierKey {
  const match = TEACHING_TIER_KEYS.find(key => key === approach);
  return match ?? 'unknown';
}

/** Add an observation to the tally its key names, creating the tally on first sight. */
function tallyInto<K extends string>(
  map: Map<K, CellTally>,
  key: K,
  observation: RetentionObservation
): void {
  const existing = map.get(key);
  if (existing) {
    addToTally(existing, observation);
    return;
  }
  const created = emptyTally();
  addToTally(created, observation);
  map.set(key, created);
}

/** Build the fixed-order cell array for one breakdown axis, including empty bands. */
function buildBreakdown<K extends string>(
  keys: readonly K[],
  tallies: Map<K, CellTally>,
  minSampleSize: number
): RetentionCell[] {
  return keys.map(key => buildCell(key, tallies.get(key) ?? emptyTally(), minSampleSize));
}

// ── Core function ──────────────────────────────────────────────────────────

/**
 * Compute the scheduler-health report over one observation per scored question.
 *
 * Population membership is decided on `snapshotBand` alone — a raw
 * `snapshotIntervalDays > 0` comparison appears nowhere in this module, because
 * `classifyChunk` returns exactly `1.0` for both the fresh band and an on-time
 * established review, which is precisely why NEU-844 stores the band separately.
 *
 * Breakdowns are computed over the **established population only**; the fresh
 * band is reported solely as `freshBandRetention`, and uncovered rows
 * (`snapshotBand === null`) enter only the coverage denominator and no rate.
 * Overdueness is a breakdown axis and never an exclusion.
 */
export function computeSchedulerHealth(
  observations: readonly RetentionObservation[],
  options?: ComputeSchedulerHealthOptions
): SchedulerHealthReport {
  const minSampleSize = options?.minSampleSize ?? MIN_SAMPLE_SIZE;

  const established = emptyTally();
  const fresh = emptyTally();
  let uncoveredCount = 0;

  const byTier = new Map<TeachingTierKey, CellTally>();
  const byInterval = new Map<IntervalBandKey, CellTally>();
  const byOverdue = new Map<OverdueBandKey, CellTally>();

  for (const observation of observations) {
    if (observation.snapshotBand === 'established') {
      addToTally(established, observation);
      tallyInto(byTier, teachingTierFor(observation.teachingApproach), observation);
      tallyInto(byInterval, intervalBandFor(observation.snapshotIntervalDays), observation);
      tallyInto(byOverdue, overdueBandFor(observation.snapshotDaysOverdue), observation);
    } else if (observation.snapshotBand === 'fresh') {
      addToTally(fresh, observation);
    } else {
      // Uncovered (or an unrecognized band): coverage denominator only, no rate anywhere.
      uncoveredCount += 1;
    }
  }

  const totalFirstAttempts = observations.length;
  const coveredFirstAttempts = totalFirstAttempts - uncoveredCount;

  return {
    minSampleSize,
    bandDefinitions: {
      intervalBandEdgesDays: [...INTERVAL_BAND_EDGES_DAYS],
      daysOverdueBandEdgesDays: [...OVERDUE_BAND_EDGES_DAYS],
    },
    coverage: {
      totalFirstAttempts,
      coveredFirstAttempts,
      uncoveredFirstAttempts: uncoveredCount,
      // Zero rows must still return a complete, well-formed payload — never NaN.
      coverageRatio:
        totalFirstAttempts === 0 ? 0 : roundRate(coveredFirstAttempts / totalFirstAttempts),
      establishedFirstAttempts: established.sampleSize,
      freshFirstAttempts: fresh.sampleSize,
    },
    trueRetention: buildCell('established', established, minSampleSize),
    freshBandRetention: buildCell('fresh', fresh, minSampleSize),
    breakdowns: {
      byTeachingTier: buildBreakdown(TEACHING_TIER_KEYS, byTier, minSampleSize),
      byIntervalBand: buildBreakdown(INTERVAL_BAND_KEYS, byInterval, minSampleSize),
      byDaysOverdueBand: buildBreakdown(OVERDUE_BAND_KEYS, byOverdue, minSampleSize),
    },
  };
}
