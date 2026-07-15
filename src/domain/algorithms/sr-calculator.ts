import type { AlgorithmConfig } from '../config/algorithm.js';
import { clampEaseFactor } from '../config/algorithm.js';
import { MS_PER_DAY } from '../../shared/constants/time.js';
import type {
  NextReviewInput,
  NextReviewOutput,
  PriorityInput,
  PriorityOutput,
  AdvancedNextReviewInput,
  AdvancedNextReviewOutput,
  RankInput,
  RankOutput,
  RankedItem,
} from '../types/sr.js';

function toStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

/**
 * Fraction of the interval used as the half-width of the fuzz window — a few
 * percent, matching Anki's spirit. Not a rollout knob (charter decision: no new
 * config/env): a fixed domain constant that keeps the calculator pure.
 */
const INTERVAL_FUZZ_RATIO = 0.05;

/**
 * Neutral fuzz value. Maps to the centre of the fuzz window, i.e. the unfuzzed
 * interval, so callers that do not inject randomness get deterministic output.
 */
export const NEUTRAL_FUZZ = 0.5;

/**
 * Apply an Anki-style randomized window to a computed interval so that chunks
 * introduced together stop co-landing on identical review dates forever. The
 * window half-width is a few percent of the interval, scaled to its length,
 * with a minimum spread of ±1 day once the interval is fuzzable — integer-day
 * intervals cannot de-clump with a sub-day window. A 1-day (or shorter)
 * interval is never fuzzed, and the result never drops below 1 day.
 *
 * Purity: `random` is an injected value in [0, 1) (the real source is wired at
 * the orchestration/composition boundary — never `Math.random()` in the domain).
 * `NEUTRAL_FUZZ` (0.5) returns the interval unchanged.
 */
export function applyIntervalFuzz(interval: number, random: number): number {
  const base = Math.max(1, Math.floor(interval));
  // Never fuzz a 1-day interval: preserves the hard 1-day floor (Anki does the
  // same — sub-2-day intervals carry no spread).
  if (base < 2) {
    return base;
  }
  // Clamp the injected value into [0, 1) so an out-of-range input can never
  // push the result outside the intended window. Domain never throws.
  const r = Math.min(0.999999, Math.max(0, random));
  const spread = Math.max(1, Math.round(base * INTERVAL_FUZZ_RATIO));
  const min = Math.max(1, base - spread);
  const max = base + spread;
  const windowSize = max - min + 1;
  return min + Math.floor(r * windowSize);
}

/**
 * Post-lapse savings floor (NEU-927). On a graded failure the recomputed
 * interval is bounded below by `coefficient × prior_interval` (the prior
 * interval proxies prior stability, per `classify-chunk.ts:50-51` and the
 * EXP-04 oracle) and never dropped below 1 day. A well-established chunk thus
 * returns for spaced recovery rather than a first-exposure reset.
 */
function lapseSavingsFloorDays(priorInterval: number, config: AlgorithmConfig): number {
  return Math.max(1, Math.round(config.lapseSavingsCoefficient * priorInterval));
}

/**
 * Clamp a post-lapse interval into `[floor, priorInterval]` (NEU-927). Applied
 * AFTER `applyIntervalFuzz` so fuzz's downward spread cannot push the result
 * below the savings floor, and after any advanced-path reduction so no lapse
 * branch escapes the floor. When the prior interval is below the floor
 * (degenerate/never-established prior — e.g. a null or 0 prior interval), the
 * bound would ask to floor above the prior it is also bounded by, so the result
 * is exactly 1 day. Pure and deterministic.
 */
export function clampLapseInterval(
  interval: number,
  priorInterval: number,
  config: AlgorithmConfig
): number {
  const floor = lapseSavingsFloorDays(priorInterval, config);
  if (priorInterval < floor) {
    return 1;
  }
  return Math.min(priorInterval, Math.max(floor, interval));
}

export function calculateNextReview(
  input: NextReviewInput,
  config: AlgorithmConfig,
  now: Date,
  random: number = NEUTRAL_FUZZ
): NextReviewOutput {
  const quality = Math.max(0, Math.min(5, Math.floor(input.quality)));
  const prevRepetitions = Math.max(0, Math.floor(input.repetitions));
  const prevEase = clampEaseFactor(
    Number.isFinite(input.easeFactor) ? input.easeFactor : config.minimumEaseFactor,
    config.minimumEaseFactor
  );
  const prevInterval = Math.max(0, Math.floor(input.interval));

  let nextRepetitions = prevRepetitions;
  let nextEase = prevEase;
  let nextInterval = prevInterval;

  if (quality < 3) {
    // Failure: reset reps to 0 and penalize ease, but preserve accumulated
    // learning by flooring the interval (NEU-927) instead of an unconditional
    // reset to 1 day. A well-established chunk returns at the savings floor
    // (`coefficient × prior_interval`) for spaced recovery; a degenerate/
    // never-established prior (below the floor) retries tomorrow.
    nextRepetitions = 0;
    const floor = lapseSavingsFloorDays(prevInterval, config);
    nextInterval = prevInterval < floor ? 1 : floor;
    nextEase = clampEaseFactor(prevEase + config.easePenaltyFailure, config.minimumEaseFactor);
  } else {
    // Success path
    nextRepetitions = prevRepetitions + 1;
    if (nextRepetitions === 1) {
      nextInterval = Math.max(1, Math.floor(config.initialIntervalDays));
    } else if (nextRepetitions === 2) {
      nextInterval = Math.max(1, Math.floor(config.secondIntervalDays));
    } else {
      nextInterval = Math.max(1, Math.floor(prevInterval * nextEase));
    }

    if (quality >= 4) {
      nextEase = clampEaseFactor(prevEase + config.easeDeltaGood, config.minimumEaseFactor);
    } else {
      // quality === 3 treated as hard
      nextEase = clampEaseFactor(prevEase + config.easeDeltaHard, config.minimumEaseFactor);
    }
  }

  // Spread same-day-introduced chunks apart. Applied last so the fuzz reflects
  // the final interval; the 1-day floor (failure/first-review) is preserved.
  nextInterval = applyIntervalFuzz(nextInterval, random);

  if (quality < 3) {
    // Clamp AFTER fuzz (NEU-927) so fuzz's downward spread cannot push the
    // post-lapse interval below the savings floor (or above the prior interval).
    nextInterval = clampLapseInterval(nextInterval, prevInterval, config);
  }

  const today = toStartOfDay(now);
  const nextDate = addDays(today, nextInterval);
  return {
    interval: nextInterval,
    repetitions: nextRepetitions,
    easeFactor: nextEase,
    nextReview: isoDate(nextDate),
  };
}

export function calculatePriorityScore(
  input: PriorityInput,
  config: AlgorithmConfig,
  now: Date
): PriorityOutput {
  const normalizedNow = toStartOfDay(now);
  const parsedReview = new Date(input.nextReviewDate);
  const normalizedReview = isNaN(parsedReview.getTime()) ? normalizedNow : parsedReview;
  const daysUntil = Math.max(
    -365,
    Math.min(
      365,
      Math.floor((toStartOfDay(normalizedReview).getTime() - normalizedNow.getTime()) / MS_PER_DAY)
    )
  );

  const ease = clampEaseFactor(input.easeFactor, config.minimumEaseFactor);
  const reps = Math.max(0, Math.floor(input.repetitions));
  const difficulty = Math.max(1, Math.min(10, Math.floor(input.difficulty)));

  // Compute a normalized urgency: overdue => high, far future => low
  // Map daysUntil into [0, 1] where overdue (<=0) => 1, 7 days => ~0.125
  const urgency = 1 / (1 + Math.max(0, daysUntil));

  // Inverse ease: lower EF -> higher priority
  const inverseEase = 1 / ease; // EF min 1.3, so bounded

  // Repetition novelty: fewer repetitions => higher priority
  const novelty = 1 / (1 + reps);

  // Difficulty scale to [0.1, 1]
  const difficultyNorm = 0.1 + (difficulty - 1) * (0.9 / 9);

  const w = config.priorityWeights;
  let score =
    w.urgency * urgency +
    w.ease * inverseEase +
    w.repetitions * novelty +
    w.difficulty * difficultyNorm;

  // Clamp to [0, 1] and scale to 0..100 for readability
  score = Math.max(0, Math.min(1, score)) * 100;

  return { priority: Math.round(score) };
}

// Advanced next review with lapses/leech handling
export function calculateNextReviewAdvanced(
  input: AdvancedNextReviewInput,
  config: AlgorithmConfig,
  now: Date,
  random: number = NEUTRAL_FUZZ
): AdvancedNextReviewOutput {
  // The base interval is already fuzzed; the overdue/lapse adjustments below
  // operate on it, and the common de-clumping path (not overdue, no reset)
  // returns it unchanged so same-day chunks still drift apart.
  const base = calculateNextReview(input, config, now, random);
  let ease = base.easeFactor;
  let interval = base.interval;
  let reps = base.repetitions;
  let leech = false;

  const overdue = Math.max(0, Math.floor(input.daysOverdue ?? 0));
  const consecutiveFailures = Math.max(0, Math.floor(input.consecutiveFailures ?? 0));
  const totalAttempts = Math.max(0, Math.floor(input.totalAttempts ?? 0));
  // Prior interval proxies prior stability for the post-lapse savings floor
  // (NEU-927); mirrors the normalization in calculateNextReview.
  const priorInterval = Math.max(0, Math.floor(input.interval));
  const isLapse = Math.max(0, Math.min(5, Math.floor(input.quality))) < 3;

  if (overdue > 0 && input.repetitions > 0) {
    // Apply lapse penalty to ease
    ease = clampEaseFactor(ease + config.lapsePenalty, config.minimumEaseFactor);
    // Pull interval closer if heavily overdue
    interval = Math.max(1, Math.floor(interval * (1 - Math.min(0.5, overdue / 30))));
  }

  if (consecutiveFailures >= config.maxConsecutiveLapses) {
    // Harsher reset: reduce repetitions to 0 and shorten interval
    reps = 0;
    interval = Math.max(1, Math.floor(interval * 0.5));
  }

  if (isLapse) {
    // Re-apply the savings floor (NEU-927) so the advanced-path reductions above
    // (overdue pull-in, harsher reset) cannot escape the floor. Idempotent with
    // the clamp already applied inside calculateNextReview.
    interval = clampLapseInterval(interval, priorInterval, config);
  }

  // Leech flagging requires a minimum evidence base: a chunk cannot be branded a
  // leech before it has accumulated `leechFailureThreshold` lifetime attempts, in
  // addition to the `leechConsecutiveFailures` run. Without this floor a new-and-
  // hard chunk was flagged on its first three attempts — far more aggressive than
  // Anki's lifetime standard. `totalAttempts` defaults to 0, so an unknown/absent
  // evidence base keeps the gate closed (never flags).
  if (
    totalAttempts >= config.leechFailureThreshold &&
    consecutiveFailures >= config.leechConsecutiveFailures
  ) {
    leech = true;
    // stronger ease penalty for leeches using configured adjustments
    ease = clampEaseFactor(
      ease +
        Math.max(
          config.lapsePenalty + config.leechEasePenaltyAdjustment,
          config.minLeechEasePenalty
        ),
      config.minimumEaseFactor
    );
  }

  const next = addDays(toStartOfDay(now), interval);
  return {
    ...base,
    repetitions: reps,
    easeFactor: ease,
    interval,
    nextReview: isoDate(next),
    leech,
  };
}

// Rank with tag weights and caps
export function rankCandidatesWithConstraints(
  input: RankInput,
  config: AlgorithmConfig,
  now: Date
): RankOutput {
  const candidateMap = new Map(input.candidates.map(c => [c.id, c]));

  // Score each candidate using existing priority, then adjust by tag weights
  const nowIso = isoDate(toStartOfDay(now));
  const scored = input.candidates.map(c => {
    const { priority } = calculatePriorityScore(
      {
        nextReviewDate: c.nextReviewDate || nowIso,
        easeFactor: c.easeFactor,
        repetitions: c.repetitions,
        difficulty: c.difficulty,
      },
      config,
      now
    );
    const tags = Array.isArray(c.tags) ? c.tags : [];
    const weight = tags.length ? Math.max(...tags.map(t => config.tagWeights[t] ?? 1)) : 1;
    return { id: c.id, score: priority * weight, tags };
  });

  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  // Apply daily caps (simplified: assume all are reviews)
  const maxReviews = Math.max(0, Math.floor(config.dailyCaps.maxReviews));
  const capped = scored.slice(0, maxReviews > 0 ? maxReviews : scored.length);

  // Helper to build enriched output from a list of selected scored items
  const buildOutput = (
    selected: typeof capped,
    opts: { warning?: string; timeboxApplied: boolean; totalDuration: number }
  ): RankOutput => {
    const ranked: RankedItem[] = selected.map((s, idx) => {
      const candidate = candidateMap.get(s.id);
      const duration = candidate?.estimatedDuration ?? 0;
      return {
        id: s.id,
        priority: s.score,
        reason:
          s.score >= 70
            ? 'high priority — overdue or low ease'
            : s.score >= 40
              ? 'medium priority — approaching review date'
              : 'low priority — well ahead of schedule',
        order: idx + 1,
        cognitiveLoad: Math.min(10, Math.ceil((candidate?.difficulty ?? 5) * (duration / 10 || 1))),
      };
    });

    return {
      orderedIds: selected.map(s => s.id),
      ranked,
      summary: {
        totalCandidates: input.candidates.length,
        selectedCount: selected.length,
        totalDuration: opts.totalDuration,
        timeboxApplied: opts.timeboxApplied,
      },
      ...(opts.warning ? { warning: opts.warning } : {}),
    };
  };

  // Apply timebox truncation if requested
  if (input.timeboxMinutes != null && input.timeboxMinutes > 0) {
    if (capped.length === 0) {
      return buildOutput([], { timeboxApplied: true, totalDuration: 0 });
    }

    const hasDurations = capped.some(s => candidateMap.get(s.id)?.estimatedDuration != null);

    if (!hasDurations) {
      const totalDuration = capped.reduce(
        (sum, s) => sum + (candidateMap.get(s.id)?.estimatedDuration ?? 0),
        0
      );
      return buildOutput(capped, {
        warning:
          'timeboxMinutes was set but no candidates have estimatedDuration — timebox not applied',
        timeboxApplied: false,
        totalDuration,
      });
    }

    // Fallback duration (in minutes) for candidates missing estimatedDuration when
    // at least one candidate has an explicit duration set.
    const DEFAULT_DURATION = 10;
    const budget = input.timeboxMinutes;
    // Slack tolerance: 10% of budget or 5 minutes, whichever is smaller
    const slack = Math.min(budget * 0.1, 5);
    let accumulated = 0;
    const truncated: typeof capped = [];

    for (const s of capped) {
      const duration = candidateMap.get(s.id)?.estimatedDuration ?? DEFAULT_DURATION;
      if (accumulated + duration > budget + slack && truncated.length > 0) break;
      accumulated += duration;
      truncated.push(s);
    }

    return buildOutput(truncated, { timeboxApplied: true, totalDuration: accumulated });
  }

  const totalDuration = capped.reduce(
    (sum, s) => sum + (candidateMap.get(s.id)?.estimatedDuration ?? 0),
    0
  );
  return buildOutput(capped, { timeboxApplied: false, totalDuration });
}
