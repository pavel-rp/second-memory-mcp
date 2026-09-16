/**
 * Pure within-sitting fatigue trend (NEU-848; rescoped to quality-only,
 * sitting-scoped, window-configurable by NEU-1020).
 *
 * Computes a *relative* quality trend across two windows of the LAST
 * `windowSize` entries of a caller-supplied attempt population — the caller
 * is responsible for pre-scoping that population to the current sitting
 * (`active-time.ts`'s gap-based sitting boundary). Self-reported latency is
 * dropped entirely as an input: agent-reported `time_spent_ms` is not a
 * reliable fatigue signal (agents pace themselves, batch tool calls, idle
 * mid-thought, etc.), so this module now judges fatigue on quality alone.
 * This module never compares one sitting's quality to another sitting's, or
 * to any fixed absolute threshold — only the relative earlier/later split
 * within the windowed population.
 *
 * No I/O, never throws.
 */

// ── Types ──────────────────────────────────────────────────────────────────

/** A single scored attempt, shaped for trend analysis only. */
export type FatigueAttempt = {
  /** Epoch ms the attempt was recorded at. Callers do NOT guarantee order. */
  timestamp: number;
  /** SM-2 style 0-5 grading quality. `null` for an unscored retry attempt. */
  quality: number | null;
};

export type FatigueTrendResult = {
  fatigued: boolean;
  /** Count of attempts that survived filtering and were actually sampled. */
  sampledCount: number;
  /** `laterMeanQuality - earlierMeanQuality`. `null` only when silent. */
  qualityDelta: number | null;
};

// ── Constants ──────────────────────────────────────────────────────────────
// Both constants below are DELIBERATELY NOT config knobs. They encode a
// judgment about what "a real trend, not noise" means, not a per-deployment
// tuning parameter — see NEU-848. `windowSize` (below, a function parameter)
// IS the configurable knob — see NEU-1020.

/**
 * Fraction of the windowed, valid attempts assigned to the earlier window;
 * the remainder forms the later window. DELIBERATELY NOT a config knob — an
 * uneven split biases one window's mean toward outliers.
 */
const WINDOW_SPLIT_RATIO = 0.5;

/**
 * The later window's mean quality must fall by at least this many points
 * (quality is graded 0-5) before it counts as "falling". DELIBERATELY NOT a
 * config knob.
 */
const QUALITY_FALL_MARGIN = 0.5;

const SILENT_RESULT: FatigueTrendResult = {
  fatigued: false,
  sampledCount: 0,
  qualityDelta: null,
};

/** Provisional default fatigue window (last N answers) — NEU-1020; 5-8 is the stated tuning band. */
export const DEFAULT_FATIGUE_WINDOW_SIZE = 6;

// ── Guards ─────────────────────────────────────────────────────────────────

/** True only for a record with a finite timestamp and a finite quality. */
function isSampledAttempt(value: unknown): value is FatigueAttempt {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<FatigueAttempt>;
  return (
    typeof candidate.timestamp === 'number' &&
    Number.isFinite(candidate.timestamp) &&
    typeof candidate.quality === 'number' &&
    Number.isFinite(candidate.quality)
  );
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// ── Core function ────────────────────────────────────────────────────────

/**
 * Compute the within-sitting, quality-only fatigue trend over an attempt
 * population already scoped by the caller to the current sitting.
 *
 * Takes the last `windowSize` timestamp-ordered survivors of `attempts` (not
 * the whole population) before splitting earlier/later halves for the
 * quality-only comparison — this is what lets an already sitting-scoped
 * population combine correctly with a last-N window: the caller scopes to
 * the current sitting, this function windows to the last N within it.
 *
 * Totally defensive: a non-array, `null`, or `undefined` input, an
 * under-populated or malformed attempt list, or a population below
 * `windowSize` all resolve to the same silent result. Never throws.
 */
export function computeFatigueTrend(
  attempts: unknown,
  windowSize: number = DEFAULT_FATIGUE_WINDOW_SIZE
): FatigueTrendResult {
  if (!Array.isArray(attempts)) return SILENT_RESULT;
  if (!Number.isFinite(windowSize) || windowSize <= 0) return SILENT_RESULT;

  const survivors = attempts.filter(isSampledAttempt);
  if (survivors.length < windowSize) return SILENT_RESULT;

  // Callers do NOT supply chronological order — both DB adapters order by
  // (sessionQuestionId, attemptNumber), not by time. Sort by timestamp
  // itself so the verdict cannot depend on caller ordering.
  const ordered = [...survivors].sort((a, b) => a.timestamp - b.timestamp);

  // Last `windowSize` (most recent by timestamp) survivors only.
  const windowed = ordered.slice(ordered.length - windowSize);

  const splitIndex = Math.floor(windowed.length * WINDOW_SPLIT_RATIO);
  const earlier = windowed.slice(0, splitIndex);
  const later = windowed.slice(splitIndex);

  const earlierMeanQuality = mean(earlier.map(a => a.quality as number));
  const laterMeanQuality = mean(later.map(a => a.quality as number));

  const qualityDelta = laterMeanQuality - earlierMeanQuality;
  const qualityFell = qualityDelta <= -QUALITY_FALL_MARGIN;

  return {
    fatigued: qualityFell,
    sampledCount: windowed.length,
    qualityDelta,
  };
}
