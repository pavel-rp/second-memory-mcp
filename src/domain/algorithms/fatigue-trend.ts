/**
 * Pure within-session fatigue trend (NEU-848).
 *
 * Computes a *relative* trend across two windows of a single session's
 * attempts — never an absolute latency cutoff. Agent-reported
 * `time_spent_ms` is not reliable in absolute terms (agents pace
 * themselves, batch tool calls, idle mid-thought, etc.), but its
 * *direction of change within one session* is a usable signal: if the same
 * agent's answers are taking relatively longer while scoring relatively
 * worse, that is fatigue regardless of what the raw numbers mean in
 * isolation. This module never compares one session's latency to another
 * session's, or to any fixed millisecond threshold.
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
  /** Reported time spent on the attempt, in ms. */
  latencyMs: number;
};

export type FatigueTrendResult = {
  fatigued: boolean;
  /** Count of attempts that survived filtering and were actually sampled. */
  sampledCount: number;
  /**
   * `(laterMeanLatency - earlierMeanLatency) / earlierMeanLatency`.
   * `null` when the earlier window's mean latency is `0` (a ratio would be
   * undefined or infinite) or when the result is silent.
   */
  latencyDeltaRatio: number | null;
  /** `laterMeanQuality - earlierMeanQuality`. `null` only when silent. */
  qualityDelta: number | null;
};

// ── Constants ──────────────────────────────────────────────────────────────
// All four constants below are DELIBERATELY NOT config knobs. They encode a
// judgment about what "enough signal" and "a real trend, not noise" mean,
// not a per-deployment tuning parameter — see NEU-848.

/**
 * Fewer than this many valid attempts and the earlier/later split has too
 * little signal per window to mean anything. DELIBERATELY NOT a config knob.
 */
const MINIMUM_ATTEMPTS = 6;

/**
 * Fraction of the ordered, valid attempts assigned to the earlier window;
 * the remainder forms the later window. DELIBERATELY NOT a config knob — an
 * uneven split biases one window's mean toward outliers.
 */
const WINDOW_SPLIT_RATIO = 0.5;

/**
 * The later window's mean latency must exceed the earlier window's by at
 * least this fraction before it counts as "rising". Guards against a single
 * slow attempt tipping the mean. DELIBERATELY NOT a config knob.
 */
const LATENCY_RISE_MARGIN = 0.2;

/**
 * The later window's mean quality must fall by at least this many points
 * (quality is graded 0-5) before it counts as "falling". DELIBERATELY NOT a
 * config knob.
 */
const QUALITY_FALL_MARGIN = 0.5;

const SILENT_RESULT: FatigueTrendResult = {
  fatigued: false,
  sampledCount: 0,
  latencyDeltaRatio: null,
  qualityDelta: null,
};

// ── Guards ─────────────────────────────────────────────────────────────────

/** True only for a record with a finite timestamp, finite non-negative latency, and a finite quality. */
function isSampledAttempt(value: unknown): value is FatigueAttempt {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<FatigueAttempt>;
  return (
    typeof candidate.timestamp === 'number' &&
    Number.isFinite(candidate.timestamp) &&
    typeof candidate.latencyMs === 'number' &&
    Number.isFinite(candidate.latencyMs) &&
    candidate.latencyMs >= 0 &&
    typeof candidate.quality === 'number' &&
    Number.isFinite(candidate.quality)
  );
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// ── Core function ────────────────────────────────────────────────────────

/**
 * Compute the within-session fatigue trend over an attempt population.
 *
 * Totally defensive: a non-array, `null`, or `undefined` input, an
 * under-populated or malformed attempt list, or a session below the
 * minimum sample size all resolve to the same silent result. Never throws.
 */
export function computeFatigueTrend(attempts: unknown): FatigueTrendResult {
  if (!Array.isArray(attempts)) return SILENT_RESULT;

  const survivors = attempts.filter(isSampledAttempt);
  if (survivors.length < MINIMUM_ATTEMPTS) return SILENT_RESULT;

  // Callers do NOT supply chronological order — both DB adapters order by
  // (sessionQuestionId, attemptNumber), not by time. Sort by timestamp
  // itself so the verdict cannot depend on caller ordering.
  const ordered = [...survivors].sort((a, b) => a.timestamp - b.timestamp);

  const splitIndex = Math.floor(ordered.length * WINDOW_SPLIT_RATIO);
  const earlier = ordered.slice(0, splitIndex);
  const later = ordered.slice(splitIndex);

  const earlierMeanLatency = mean(earlier.map(a => a.latencyMs));
  const laterMeanLatency = mean(later.map(a => a.latencyMs));
  const earlierMeanQuality = mean(earlier.map(a => a.quality as number));
  const laterMeanQuality = mean(later.map(a => a.quality as number));

  const latencyDeltaRatio =
    earlierMeanLatency > 0 ? (laterMeanLatency - earlierMeanLatency) / earlierMeanLatency : null;
  const qualityDelta = laterMeanQuality - earlierMeanQuality;

  const latencyRose = latencyDeltaRatio !== null && latencyDeltaRatio >= LATENCY_RISE_MARGIN;
  const qualityFell = qualityDelta <= -QUALITY_FALL_MARGIN;

  return {
    fatigued: latencyRose && qualityFell,
    sampledCount: ordered.length,
    latencyDeltaRatio,
    qualityDelta,
  };
}
