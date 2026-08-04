/**
 * Pure single shared advisory resolver (NEU-848).
 *
 * The one and only producer of within-session stopping guidance. Both
 * `session-analyzer.ts` (`session_status`) and `teaching-workflows.ts`
 * (`teach_next` / `submit_answer`) call this resolver rather than computing
 * their own stopping heuristics, so the two surfaces can never diverge.
 *
 * At most one advisory is ever returned. `fatigue` — a relative, within-
 * session trend computed by `fatigue-trend.ts` — takes precedence over
 * `time_ceiling` when both would apply, since a fatigued learner needs the
 * break framed as fatigue even if they also happen to be past the clock.
 *
 * No I/O, never throws.
 */

import { computeFatigueTrend } from './fatigue-trend.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type SessionAdvisoryKind = 'fatigue' | 'time_ceiling';

export type SessionAdvisory = {
  kind: SessionAdvisoryKind;
  /** Learner-facing explanation for the advisory. */
  reason: string;
};

export type SessionAdvisoryInput = {
  /** Attempt-shaped records; validated defensively by `computeFatigueTrend`. */
  attempts: unknown;
  elapsedMs: number | null | undefined;
  maxTimeMs: number | null | undefined;
};

// ── Core function ────────────────────────────────────────────────────────

/**
 * Resolve at most one stopping advisory for the current session state.
 *
 * Totally defensive: a non-finite or absent `elapsedMs`/`maxTimeMs` never
 * fires the time ceiling, and a malformed `attempts` population never
 * fires fatigue (see `computeFatigueTrend`). Never throws.
 */
export function resolveSessionAdvisory(input: SessionAdvisoryInput): SessionAdvisory | null {
  const trend = computeFatigueTrend(input.attempts);
  if (trend.fatigued) {
    return {
      kind: 'fatigue',
      reason:
        'Response latency is rising and answer quality is slipping within this session — consider a break.',
    };
  }

  const { elapsedMs, maxTimeMs } = input;
  const ceilingReached =
    typeof elapsedMs === 'number' &&
    Number.isFinite(elapsedMs) &&
    typeof maxTimeMs === 'number' &&
    Number.isFinite(maxTimeMs) &&
    elapsedMs >= maxTimeMs;

  if (ceilingReached) {
    return {
      kind: 'time_ceiling',
      reason: 'Maximum session time reached. Take a break to maintain effectiveness.',
    };
  }

  return null;
}
