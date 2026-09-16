/**
 * Pure gap-based sitting active-time computation (NEU-1016).
 *
 * Computes the current sitting's active learning time from a series of
 * server-recorded, learner-driven event timestamps (`teach_next` +
 * `submit_answer` epoch-ms moments — never `session_status` polling, never
 * wall-clock session duration, never self-reported `time_spent_ms`).
 *
 * A "sitting" is the maximal run of the most-recent events whose consecutive
 * gaps are all strictly under the idle cutoff. A gap at or above the idle
 * cutoff ends the current sitting and starts a new one at zero active time —
 * the gap itself, and every timestamp before it, contribute nothing to the
 * returned active time. Nothing is credited after the last event: this
 * function never extrapolates to "now", so a caller polling long after the
 * last event sees no additional active time accrue.
 *
 * No I/O, never throws.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ActiveTimeInput = {
  /** Epoch-ms event timestamps. Callers do NOT guarantee order or dedup. */
  timestamps: unknown;
  /** Gap size (ms) at or above which a gap ends the sitting and starts a new one. */
  idleCutoffMs: number;
};

export type ActiveTimeResult = {
  /** The current (most recent) sitting's active time, in ms. Zero for 0-1 valid timestamps. */
  activeTimeMs: number;
  /** Count of timestamps that survived filtering and were actually sampled. */
  sampledCount: number;
};

const SILENT_RESULT: ActiveTimeResult = { activeTimeMs: 0, sampledCount: 0 };

// ── Guards ─────────────────────────────────────────────────────────────────

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

// ── Core function ────────────────────────────────────────────────────────

/**
 * Compute the current sitting's active time over an event-timestamp population.
 *
 * Totally defensive: a non-array, `null`, or `undefined` `timestamps` input,
 * an all-malformed population, or a non-finite/non-positive `idleCutoffMs`
 * all resolve to zero active time. Never throws.
 */
export function computeActiveTime(input: ActiveTimeInput): ActiveTimeResult {
  const { timestamps, idleCutoffMs } = input;

  if (!Array.isArray(timestamps)) return SILENT_RESULT;
  if (!Number.isFinite(idleCutoffMs) || idleCutoffMs <= 0) return SILENT_RESULT;

  const survivors = timestamps.filter(isFiniteTimestamp);
  if (survivors.length === 0) return SILENT_RESULT;

  // Callers do NOT supply chronological order — sort so the result cannot
  // depend on caller ordering (mirrors fatigue-trend.ts's own discipline).
  const ordered = [...survivors].sort((a, b) => a - b);

  let activeTimeMs = 0;
  for (let i = 1; i < ordered.length; i++) {
    const gap = ordered[i] - ordered[i - 1];
    if (gap >= idleCutoffMs) {
      // Gap at/above the idle cutoff: a new sitting starts here. Active time
      // accrued so far belonged to the PRIOR sitting — discard it.
      activeTimeMs = 0;
    } else {
      activeTimeMs += gap;
    }
  }

  return { activeTimeMs, sampledCount: ordered.length };
}
