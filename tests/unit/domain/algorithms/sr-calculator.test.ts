import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
  applyIntervalFuzz,
  NEUTRAL_FUZZ,
} from '../../../../src/domain/algorithms/sr-calculator.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import { resolveAlgorithmConfig } from '../../../../src/config/resolve-algorithm-config.js';

const NOW = new Date('2025-06-15T12:00:00.000Z');
const TODAY = NOW.toISOString().slice(0, 10);

describe('calculateNextReview', () => {
  it('floors ease at 1.3, resets reps, and floors interval on failure (quality<3)', () => {
    const out = calculateNextReview(
      { quality: 1, repetitions: 5, easeFactor: 1.31, interval: 10 },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(out.repetitions).toBe(0);
    // NEU-927: savings floor = round(0.2 × prior interval 10) = 2, not a reset to 1d.
    expect(out.interval).toBe(2);
    expect(out.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('uses initial and second intervals, then multiplies by EF', () => {
    const first = calculateNextReview(
      { quality: 5, repetitions: 0, easeFactor: 2.5, interval: 0 },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(first.repetitions).toBe(1);
    expect(first.interval).toBeGreaterThanOrEqual(1);

    const second = calculateNextReview(
      {
        quality: 5,
        repetitions: first.repetitions,
        easeFactor: first.easeFactor,
        interval: first.interval,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(second.repetitions).toBe(2);
    expect(second.interval).toBeGreaterThanOrEqual(1);

    const third = calculateNextReview(
      {
        quality: 4,
        repetitions: second.repetitions,
        easeFactor: second.easeFactor,
        interval: second.interval,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(third.repetitions).toBe(3);
    expect(third.interval).toBeGreaterThanOrEqual(1);
  });

  it('treats quality=3 as hard and clamps EF', () => {
    const out = calculateNextReview(
      { quality: 3, repetitions: 3, easeFactor: 1.31, interval: 6 },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(out.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(out.interval).toBeGreaterThanOrEqual(1);
  });
});

describe('calculatePriorityScore', () => {
  it('returns number 0..100', () => {
    const out = calculatePriorityScore(
      {
        nextReviewDate: TODAY,
        easeFactor: 2,
        repetitions: 0,
        difficulty: 5,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(out.priority).toBeGreaterThanOrEqual(0);
    expect(out.priority).toBeLessThanOrEqual(100);
  });

  it('falls back to now when nextReviewDate is an invalid date string', () => {
    const out = calculatePriorityScore(
      {
        nextReviewDate: 'not-a-date',
        easeFactor: 2.5,
        repetitions: 5,
        difficulty: 5,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    // Should not throw, should return a valid priority
    expect(out.priority).toBeGreaterThanOrEqual(0);
    expect(out.priority).toBeLessThanOrEqual(100);
  });
});

describe('calculateNextReviewAdvanced', () => {
  it('applies lapse penalty and can flag leech on consecutive failures', () => {
    const base = calculateNextReviewAdvanced(
      {
        quality: 2,
        repetitions: 5,
        easeFactor: 1.5,
        interval: 10,
        daysOverdue: 5,
        consecutiveFailures: 4,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(base.interval).toBeGreaterThanOrEqual(1);
    expect(base.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(typeof base.leech).toBe('boolean');
  });
});

describe('rankCandidatesWithConstraints', () => {
  it('produces a low-priority reason for well-ahead items', () => {
    // Far-future review date → low score
    const out = rankCandidatesWithConstraints(
      {
        candidates: [
          {
            id: 'far-future',
            nextReviewDate: '2026-06-15',
            easeFactor: 2.5,
            repetitions: 10,
            difficulty: 1,
            estimatedDuration: 10,
          },
        ],
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(out.ranked.length).toBe(1);
    expect(out.ranked[0].reason).toContain('low priority');
  });

  it('orders candidates and respects caps', () => {
    const out = rankCandidatesWithConstraints(
      {
        candidates: [
          {
            id: 'a',
            nextReviewDate: TODAY,
            easeFactor: 2,
            repetitions: 0,
            difficulty: 5,
            tags: ['x'],
          },
          {
            id: 'b',
            nextReviewDate: TODAY,
            easeFactor: 1.5,
            repetitions: 1,
            difficulty: 6,
            tags: ['y'],
          },
        ],
        timeboxMinutes: 20,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(Array.isArray(out.orderedIds)).toBe(true);
    expect(out.orderedIds.length).toBeGreaterThan(0);
    expect(Array.isArray(out.ranked)).toBe(true);
    expect(out.ranked.length).toBe(out.orderedIds.length);
    expect(out.summary).toBeDefined();
    expect(out.summary.totalCandidates).toBe(2);
    expect(out.summary.selectedCount).toBe(out.orderedIds.length);
  });

  it('returns all candidates when maxReviews is zero', () => {
    const config = {
      ...DEFAULT_ALGORITHM_CONFIG,
      dailyCaps: { ...DEFAULT_ALGORITHM_CONFIG.dailyCaps, maxReviews: 0 },
    };
    const out = rankCandidatesWithConstraints(
      {
        candidates: [
          {
            id: 'a',
            nextReviewDate: TODAY,
            easeFactor: 2,
            repetitions: 0,
            difficulty: 5,
          },
        ],
      },
      config,
      NOW
    );
    expect(out.orderedIds).toEqual(['a']);
  });
});

describe('TF-5: overdue penalty skipped for new items', () => {
  it('does not penalize ease for repetitions=0 even with large daysOverdue', () => {
    const result = calculateNextReviewAdvanced(
      {
        quality: 5,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        daysOverdue: 30,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    // New item: overdue penalty should not apply, ease should be >= 2.5
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5);
  });

  it('still penalizes ease for repetitions>0 with daysOverdue', () => {
    const withoutOverdue = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 3,
        easeFactor: 2.5,
        interval: 10,
        daysOverdue: 0,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    const withOverdue = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 3,
        easeFactor: 2.5,
        interval: 10,
        daysOverdue: 15,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    // Overdue penalty should reduce ease for reviewed items
    expect(withOverdue.easeFactor).toBeLessThan(withoutOverdue.easeFactor);
  });
});

describe('TF-4: timebox truncation in rankCandidatesWithConstraints', () => {
  const today = TODAY;

  it('truncates candidates when timeboxMinutes is exceeded', () => {
    const result = rankCandidatesWithConstraints(
      {
        candidates: [
          {
            id: 'a',
            nextReviewDate: today,
            easeFactor: 1.5,
            repetitions: 0,
            difficulty: 8,
            estimatedDuration: 5,
          },
          {
            id: 'b',
            nextReviewDate: today,
            easeFactor: 1.5,
            repetitions: 0,
            difficulty: 7,
            estimatedDuration: 10,
          },
          {
            id: 'c',
            nextReviewDate: today,
            easeFactor: 2.5,
            repetitions: 5,
            difficulty: 3,
            estimatedDuration: 15,
          },
          {
            id: 'd',
            nextReviewDate: today,
            easeFactor: 2.5,
            repetitions: 5,
            difficulty: 2,
            estimatedDuration: 20,
          },
        ],
        timeboxMinutes: 20,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    // Should select exactly 'a' and 'b' (5 + 10 = 15 minutes) within the 20-minute timebox
    expect(result.orderedIds.length).toBe(2);
    expect(result.orderedIds).toEqual(['a', 'b']);
    expect(result.warning).toBeUndefined();
  });

  it('returns empty output when timeboxMinutes set but candidates list is empty', () => {
    const result = rankCandidatesWithConstraints(
      {
        candidates: [],
        timeboxMinutes: 15,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.orderedIds).toEqual([]);
    expect(result.ranked).toEqual([]);
    expect(result.summary.selectedCount).toBe(0);
    expect(result.summary.timeboxApplied).toBe(true);
    expect(result.summary.totalDuration).toBe(0);
  });

  it('returns warning when timeboxMinutes set but no candidates have estimatedDuration', () => {
    const result = rankCandidatesWithConstraints(
      {
        candidates: [
          { id: 'a', nextReviewDate: today, easeFactor: 2.0, repetitions: 0, difficulty: 5 },
          { id: 'b', nextReviewDate: today, easeFactor: 2.0, repetitions: 1, difficulty: 6 },
        ],
        timeboxMinutes: 15,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.warning).toBeDefined();
    expect(result.orderedIds.length).toBe(2);
  });

  it('returns full list when timeboxMinutes is not set', () => {
    const result = rankCandidatesWithConstraints(
      {
        candidates: [
          {
            id: 'a',
            nextReviewDate: today,
            easeFactor: 2.0,
            repetitions: 0,
            difficulty: 5,
            estimatedDuration: 10,
          },
          {
            id: 'b',
            nextReviewDate: today,
            easeFactor: 2.0,
            repetitions: 1,
            difficulty: 6,
            estimatedDuration: 10,
          },
        ],
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.orderedIds.length).toBe(2);
    expect(result.warning).toBeUndefined();
  });

  it('includes first candidate even when it alone exceeds timeboxMinutes', () => {
    const result = rankCandidatesWithConstraints(
      {
        timeboxMinutes: 5,
        candidates: [
          {
            id: 'a',
            nextReviewDate: today,
            easeFactor: 2.0,
            repetitions: 0,
            difficulty: 5,
            estimatedDuration: 10,
          },
          {
            id: 'b',
            nextReviewDate: today,
            easeFactor: 2.0,
            repetitions: 1,
            difficulty: 6,
            estimatedDuration: 10,
          },
        ],
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.orderedIds.length).toBe(1);
    expect(result.orderedIds[0]).toBe('a');
  });

  it('includes item within slack tolerance that would exceed bare budget', () => {
    // budget=20, slack=min(2, 5)=2, so effective limit is 22
    // item a: 18 min, accumulated=18; item b: 4 min, accumulated=22 <= 22 — included
    const result = rankCandidatesWithConstraints(
      {
        timeboxMinutes: 20,
        candidates: [
          {
            id: 'a',
            nextReviewDate: today,
            easeFactor: 1.5,
            repetitions: 0,
            difficulty: 8,
            estimatedDuration: 18,
          },
          {
            id: 'b',
            nextReviewDate: today,
            easeFactor: 1.5,
            repetitions: 0,
            difficulty: 7,
            estimatedDuration: 4,
          },
        ],
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    // Both items fit: 18 + 4 = 22 <= 20 + 2 (slack)
    expect(result.orderedIds.length).toBe(2);
    expect(result.summary.timeboxApplied).toBe(true);
    expect(result.summary.totalDuration).toBe(22);
  });

  it('returns ranked array with per-item details and summary', () => {
    const result = rankCandidatesWithConstraints(
      {
        candidates: [
          {
            id: 'a',
            nextReviewDate: today,
            easeFactor: 2.0,
            repetitions: 0,
            difficulty: 5,
            estimatedDuration: 10,
          },
          {
            id: 'b',
            nextReviewDate: today,
            easeFactor: 2.0,
            repetitions: 1,
            difficulty: 6,
            estimatedDuration: 15,
          },
        ],
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );

    // ranked array
    expect(Array.isArray(result.ranked)).toBe(true);
    expect(result.ranked.length).toBe(result.orderedIds.length);
    for (const item of result.ranked) {
      expect(item.id).toBeDefined();
      expect(typeof item.priority).toBe('number');
      expect(typeof item.reason).toBe('string');
      expect(item.reason.length).toBeGreaterThan(0);
      expect(typeof item.order).toBe('number');
      expect(typeof item.cognitiveLoad).toBe('number');
      expect(item.cognitiveLoad).toBeGreaterThan(0);
      expect(item.cognitiveLoad).toBeLessThanOrEqual(10);
    }
    // order is sequential
    expect(result.ranked.map(r => r.order)).toEqual([1, 2]);

    // summary
    expect(result.summary.totalCandidates).toBe(2);
    expect(result.summary.selectedCount).toBe(2);
    expect(result.summary.totalDuration).toBe(25);
    expect(result.summary.timeboxApplied).toBe(false);
  });
});

// Config-driven tests to validate leech penalty clamp and thresholds.
// `totalAttempts` is well above the default evidence floor (leechFailureThreshold
// = 6) on the leech-expecting calls so these tests isolate the consecutive-failure
// threshold and ease-penalty clamp — the NEU-839 evidence gate is covered below.
describe('advanced leech penalty clamp (config)', () => {
  const config = resolveAlgorithmConfig({
    SM_LAPSE_PENALTY: '-0.1',
    SM_LEECH_EASE_ADJUST: '-0.05',
    SM_MIN_LEECH_EASE_PENALTY: '-0.2',
    SM_LEECH_CONSEC_FAILS: '2',
  });

  it('uses sum of penalties when above min clamp', () => {
    const noLeech = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 5,
        easeFactor: 2.0,
        interval: 10,
        consecutiveFailures: 1,
        totalAttempts: 8,
      },
      config,
      NOW
    );
    const leech = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 5,
        easeFactor: 2.0,
        interval: 10,
        consecutiveFailures: 2,
        totalAttempts: 8,
      },
      config,
      NOW
    );
    expect(leech.leech).toBe(true);
    const delta = Number((leech.easeFactor - noLeech.easeFactor).toFixed(3));
    expect(delta).toBeCloseTo(-0.15, 3); // -0.1 + -0.05
  });

  it('uses minLeechEasePenalty when sum is more severe (clamps)', () => {
    const clampConfig = resolveAlgorithmConfig({
      SM_LAPSE_PENALTY: '-0.1',
      SM_LEECH_EASE_ADJUST: '-0.5', // sum -0.6 < min -0.2 => clamp to -0.2
      SM_MIN_LEECH_EASE_PENALTY: '-0.2',
      SM_LEECH_CONSEC_FAILS: '2',
    });
    const noLeech = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 5,
        easeFactor: 2.0,
        interval: 10,
        consecutiveFailures: 1,
        totalAttempts: 8,
      },
      clampConfig,
      NOW
    );
    const leech = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 5,
        easeFactor: 2.0,
        interval: 10,
        consecutiveFailures: 2,
        totalAttempts: 8,
      },
      clampConfig,
      NOW
    );
    const delta = Number((leech.easeFactor - noLeech.easeFactor).toFixed(3));
    expect(delta).toBeCloseTo(-0.2, 3);
  });

  it('threshold: below threshold no leech; at threshold leech true', () => {
    const below = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 5,
        easeFactor: 2.0,
        interval: 10,
        consecutiveFailures: 1,
        totalAttempts: 8,
      },
      config,
      NOW
    );
    const at = calculateNextReviewAdvanced(
      {
        quality: 4,
        repetitions: 5,
        easeFactor: 2.0,
        interval: 10,
        consecutiveFailures: 2,
        totalAttempts: 8,
      },
      config,
      NOW
    );
    expect(below.leech).toBeFalsy();
    expect(at.leech).toBeTruthy();
  });
});

// NEU-839: a chunk cannot be flagged a leech before a minimum evidence base of
// total lifetime attempts (config.leechFailureThreshold), even when the
// consecutive-failure threshold is met.
describe('leech minimum evidence base (NEU-839)', () => {
  // Default config: leechConsecutiveFailures = 3, leechFailureThreshold = 6.
  const leechInputAtConsecThreshold = (totalAttempts?: number) => ({
    quality: 1,
    repetitions: 0,
    easeFactor: 2.0,
    interval: 10,
    consecutiveFailures: 3,
    ...(totalAttempts === undefined ? {} : { totalAttempts }),
  });

  it('does not flag a leech at the consecutive threshold when total attempts are below the minimum', () => {
    const result = calculateNextReviewAdvanced(
      leechInputAtConsecThreshold(3), // 3 < leechFailureThreshold (6)
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.leech).toBe(false);
  });

  it('flags a leech when total attempts reach the minimum and consecutive failures hit the threshold', () => {
    const result = calculateNextReviewAdvanced(
      leechInputAtConsecThreshold(6), // 6 >= leechFailureThreshold (6)
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.leech).toBe(true);
  });

  it('does not flag a leech one attempt below the minimum', () => {
    const result = calculateNextReviewAdvanced(
      leechInputAtConsecThreshold(5), // 5 < 6
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.leech).toBe(false);
  });

  it('treats an absent total-attempts count as zero evidence (gate closed)', () => {
    const result = calculateNextReviewAdvanced(
      leechInputAtConsecThreshold(undefined),
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(result.leech).toBe(false);
  });

  it('honours a custom SM_LEECH_FAIL_THRESHOLD as the evidence floor', () => {
    const config = resolveAlgorithmConfig({ SM_LEECH_FAIL_THRESHOLD: '10' });
    const belowFloor = calculateNextReviewAdvanced(
      leechInputAtConsecThreshold(8), // 8 < 10
      config,
      NOW
    );
    const atFloor = calculateNextReviewAdvanced(
      leechInputAtConsecThreshold(10), // 10 >= 10
      config,
      NOW
    );
    expect(belowFloor.leech).toBe(false);
    expect(atFloor.leech).toBe(true);
  });
});

// NEU-838: interval fuzz so batch-taught chunks stop co-landing on the same date
describe('applyIntervalFuzz', () => {
  it('never fuzzes a 1-day interval — stays exactly 1 for any random', () => {
    for (const r of [0, 0.25, NEUTRAL_FUZZ, 0.75, 0.999]) {
      expect(applyIntervalFuzz(1, r)).toBe(1);
    }
  });

  it('never returns below 1 day for any interval/random combination', () => {
    for (const interval of [0, 1, 2, 3, 6, 10, 30, 100]) {
      for (const r of [0, NEUTRAL_FUZZ, 0.999]) {
        expect(applyIntervalFuzz(interval, r)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('returns the interval unchanged at the neutral centre', () => {
    for (const interval of [2, 6, 10, 25, 52, 100]) {
      expect(applyIntervalFuzz(interval, NEUTRAL_FUZZ)).toBe(interval);
    }
  });

  it('is deterministic for a fixed injected random value', () => {
    expect(applyIntervalFuzz(30, 0.123)).toBe(applyIntervalFuzz(30, 0.123));
  });

  it('spreads across a window scaled to interval length', () => {
    // 6-day interval → ±1 day window [5, 7]
    expect(applyIntervalFuzz(6, 0)).toBe(5);
    expect(applyIntervalFuzz(6, 0.999)).toBe(7);
    // 100-day interval → ±5% window [95, 105]
    expect(applyIntervalFuzz(100, 0)).toBe(95);
    expect(applyIntervalFuzz(100, 0.999)).toBe(105);
  });

  it('clamps out-of-range injected values into the window', () => {
    expect(applyIntervalFuzz(10, -1)).toBe(applyIntervalFuzz(10, 0));
    // max of the window is base + spread; an over-1 value can never exceed it
    expect(applyIntervalFuzz(10, 5)).toBeLessThanOrEqual(11);
    expect(applyIntervalFuzz(10, 5)).toBeGreaterThanOrEqual(9);
  });
});

describe('calculateNextReview interval fuzz (NEU-838)', () => {
  // reps>=2 success path → interval = prevInterval * ease, large enough to fuzz
  const fuzzableInput = { quality: 5, repetitions: 5, easeFactor: 2.5, interval: 20 };

  it('same state + different injected randoms → different next-review dates', () => {
    const low = calculateNextReview(fuzzableInput, DEFAULT_ALGORITHM_CONFIG, NOW, 0);
    const high = calculateNextReview(fuzzableInput, DEFAULT_ALGORITHM_CONFIG, NOW, 0.999);
    expect(low.interval).not.toBe(high.interval);
    expect(low.nextReview).not.toBe(high.nextReview);
  });

  it('keeps a degenerate sub-floor lapse at 1 day for any injected random', () => {
    // NEU-927: a never-established prior (interval 0, below the savings floor)
    // still retries at exactly 1 day, and fuzz cannot move it.
    const failInput = { quality: 1, repetitions: 5, easeFactor: 2.5, interval: 0 };
    for (const r of [0, NEUTRAL_FUZZ, 0.999]) {
      const out = calculateNextReview(failInput, DEFAULT_ALGORITHM_CONFIG, NOW, r);
      expect(out.interval).toBe(1);
    }
  });

  it('is deterministic for a fixed injected random value', () => {
    const a = calculateNextReview(fuzzableInput, DEFAULT_ALGORITHM_CONFIG, NOW, 0.37);
    const b = calculateNextReview(fuzzableInput, DEFAULT_ALGORITHM_CONFIG, NOW, 0.37);
    expect(a).toEqual(b);
  });

  it('defaults to the unfuzzed interval when no random is injected', () => {
    const neutral = calculateNextReview(fuzzableInput, DEFAULT_ALGORITHM_CONFIG, NOW, NEUTRAL_FUZZ);
    const defaulted = calculateNextReview(fuzzableInput, DEFAULT_ALGORITHM_CONFIG, NOW);
    expect(defaulted.interval).toBe(neutral.interval);
  });

  it('drifts same-day chunks apart through the advanced scheduler when not overdue', () => {
    const input = {
      quality: 5,
      repetitions: 5,
      easeFactor: 2.5,
      interval: 20,
      daysOverdue: 0,
      consecutiveFailures: 0,
    };
    const low = calculateNextReviewAdvanced(input, DEFAULT_ALGORITHM_CONFIG, NOW, 0);
    const high = calculateNextReviewAdvanced(input, DEFAULT_ALGORITHM_CONFIG, NOW, 0.999);
    expect(low.interval).not.toBe(high.interval);
  });
});

// NEU-927: post-lapse savings floor preserves accumulated learning instead of a
// first-exposure reset. floor = max(1, round(coefficient × prior interval)).
describe('post-lapse savings floor (NEU-927)', () => {
  const COEFF = DEFAULT_ALGORITHM_CONFIG.lapseSavingsCoefficient; // 0.2
  const floorFor = (priorInterval: number) => Math.max(1, Math.round(COEFF * priorInterval));

  it('bounds a high-prior-interval lapse within [floor, prior] and is not a 1d reset', () => {
    const priorInterval = 180;
    const out = calculateNextReview(
      { quality: 1, repetitions: 8, easeFactor: 2.5, interval: priorInterval },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(out.interval).toBeGreaterThanOrEqual(floorFor(priorInterval)); // >= 36
    expect(out.interval).toBeLessThanOrEqual(priorInterval); // <= 180
    expect(out.interval).not.toBe(1); // not a first-exposure reset
    expect(out.repetitions).toBe(0);
  });

  it('returns exactly 1 day for a degenerate sub-floor prior (never-established)', () => {
    for (const priorInterval of [0, 1, 2, 3]) {
      const out = calculateNextReview(
        { quality: 0, repetitions: 4, easeFactor: 2.5, interval: priorInterval },
        DEFAULT_ALGORITHM_CONFIG,
        NOW
      );
      // For interval 0 the prior is below the floor (degenerate → 1d); for 1–3
      // the floor is 1d and the interval cannot exceed the prior, so still 1d.
      expect(out.interval).toBe(1);
    }
  });

  it('holds the floor after fuzz — downward spread cannot push below it', () => {
    const priorInterval = 180;
    const floor = floorFor(priorInterval); // 36
    // r = 0 drives applyIntervalFuzz to the bottom of its window (below the floor).
    for (const r of [0, 0.001, NEUTRAL_FUZZ, 0.999]) {
      const out = calculateNextReview(
        { quality: 2, repetitions: 8, easeFactor: 2.5, interval: priorInterval },
        DEFAULT_ALGORITHM_CONFIG,
        NOW,
        r
      );
      expect(out.interval).toBeGreaterThanOrEqual(floor);
      expect(out.interval).toBeLessThanOrEqual(priorInterval);
    }
  });

  it('is monotonic in prior stability — higher prior floors to a longer-or-equal interval', () => {
    // Neutral fuzz keeps each result at its floor, isolating the mapping.
    const priors = [10, 30, 90, 180, 365];
    const results = priors.map(
      p =>
        calculateNextReview(
          { quality: 1, repetitions: 8, easeFactor: 2.5, interval: p },
          DEFAULT_ALGORITHM_CONFIG,
          NOW,
          NEUTRAL_FUZZ
        ).interval
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThanOrEqual(results[i - 1]);
    }
    // Each lands at its floor under neutral fuzz.
    expect(results).toEqual(priors.map(floorFor));
  });

  it('is deterministic for a fixed injected random value', () => {
    const input = { quality: 1, repetitions: 8, easeFactor: 2.5, interval: 200 };
    const a = calculateNextReview(input, DEFAULT_ALGORITHM_CONFIG, NOW, 0.37);
    const b = calculateNextReview(input, DEFAULT_ALGORITHM_CONFIG, NOW, 0.37);
    expect(a).toEqual(b);
  });

  it('honours a custom SM_LAPSE_SAVINGS_COEFFICIENT knob', () => {
    const config = resolveAlgorithmConfig({ SM_LAPSE_SAVINGS_COEFFICIENT: '0.3' });
    const out = calculateNextReview(
      { quality: 1, repetitions: 8, easeFactor: 2.5, interval: 100 },
      config,
      NOW,
      NEUTRAL_FUZZ
    );
    expect(out.interval).toBe(Math.round(0.3 * 100)); // 30
  });

  it('applies the floor on the advanced-path reset (overdue + harsher reset)', () => {
    const priorInterval = 180;
    const floor = floorFor(priorInterval); // 36
    // Heavy overdue pull-in plus a consecutive-failure harsher reset both shrink
    // the interval; the floor must still hold on the advanced path.
    const out = calculateNextReviewAdvanced(
      {
        quality: 1,
        repetitions: 8,
        easeFactor: 2.5,
        interval: priorInterval,
        daysOverdue: 60,
        consecutiveFailures: 5,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW,
      0
    );
    expect(out.interval).toBeGreaterThanOrEqual(floor);
    expect(out.interval).toBeLessThanOrEqual(priorInterval);
    expect(out.interval).not.toBe(1);
  });

  it('advanced path returns exactly 1 day for a degenerate prior lapse', () => {
    const out = calculateNextReviewAdvanced(
      {
        quality: 1,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        daysOverdue: 10,
        consecutiveFailures: 4,
      },
      DEFAULT_ALGORITHM_CONFIG,
      NOW,
      0
    );
    expect(out.interval).toBe(1);
  });
});
