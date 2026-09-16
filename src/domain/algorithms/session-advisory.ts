/**
 * Pure single shared advisory resolver (NEU-848, active-time basis NEU-1016,
 * fatigue rescoped to the current sitting + quality-only by NEU-1020).
 *
 * The one and only producer of within-session stopping guidance. Both
 * `session-analyzer.ts` (`session_status`) and `teaching-workflows.ts`
 * (`teach_next` / `submit_answer`) call this resolver rather than computing
 * their own stopping heuristics, so the two surfaces can never diverge.
 *
 * At most one advisory is ever returned. `fatigue` — a relative, quality-only
 * trend computed by `fatigue-trend.ts` over the current sitting's last
 * `fatigueWindowSize` answers — takes precedence over `active_time_ceiling`
 * when both would apply, since a fatigued learner needs the break framed as
 * fatigue even if they also happen to be past the ceiling. `active_time_ceiling`
 * fires on the current sitting's *active* learning time only (`active-time.ts`'s
 * gap-based computation) — never on wall-clock elapsed time — so a learner
 * returning from an idle gap or a multi-day break is never told to take a
 * break they haven't earned.
 *
 * No I/O, never throws.
 */

import { computeFatigueTrend } from './fatigue-trend.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type SessionAdvisoryKind = 'fatigue' | 'active_time_ceiling';

export type SessionAdvisory = {
  kind: SessionAdvisoryKind;
  /** Learner-facing explanation for the advisory. */
  reason: string;
};

export type SessionAdvisoryInput = {
  /**
   * Attempt-shaped records; validated defensively by `computeFatigueTrend`.
   * NEU-1020: the caller MUST already scope this population to the current
   * sitting (`active-time.ts`'s gap-based sitting boundary) — this resolver
   * does no sitting-scoping of its own, it only windows within whatever it
   * is given.
   */
  attempts: unknown;
  /** The current sitting's active learning time, in ms (gap-based, never wall-clock). */
  activeTimeMs: number | null | undefined;
  /** The configured sitting active-time ceiling, in ms. */
  activeTimeCeilingMs: number | null | undefined;
  /** The last-N-answers fatigue window size (NEU-1020), forwarded to `computeFatigueTrend`. */
  fatigueWindowSize: number;
};

// ── Core function ────────────────────────────────────────────────────────

/**
 * Resolve at most one stopping advisory for the current session state.
 *
 * Totally defensive: a non-finite or absent `activeTimeMs`/`activeTimeCeilingMs`
 * never fires the ceiling, and a malformed `attempts` population never fires
 * fatigue (see `computeFatigueTrend`). Never throws.
 */
export function resolveSessionAdvisory(input: SessionAdvisoryInput): SessionAdvisory | null {
  const trend = computeFatigueTrend(input.attempts, input.fatigueWindowSize);
  if (trend.fatigued) {
    return {
      kind: 'fatigue',
      // NEU-1043: latency is no longer an input to this module (see the file
      // header) — the old wording claimed a latency signal this resolver no
      // longer observes. Scoped to "this sitting" rather than "this session"
      // to match the fatigue trend's own sitting-scoped basis.
      reason: 'Answer quality is falling in this sitting — consider a break.',
    };
  }

  const { activeTimeMs, activeTimeCeilingMs } = input;
  const ceilingReached =
    typeof activeTimeMs === 'number' &&
    Number.isFinite(activeTimeMs) &&
    typeof activeTimeCeilingMs === 'number' &&
    Number.isFinite(activeTimeCeilingMs) &&
    activeTimeMs >= activeTimeCeilingMs;

  if (ceilingReached) {
    const activeMinutes = Math.round(activeTimeMs / 60_000);
    const ceilingMinutes = Math.round(activeTimeCeilingMs / 60_000);
    return {
      kind: 'active_time_ceiling',
      reason:
        `This sitting's active learning time (${activeMinutes} min) has reached the configured ` +
        `ceiling (${ceilingMinutes} min). Take a break to maintain effectiveness.`,
    };
  }

  return null;
}
