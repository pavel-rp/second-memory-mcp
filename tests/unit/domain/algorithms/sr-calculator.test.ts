import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from '../../../../src/domain/algorithms/sr-calculator.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import { resolveAlgorithmConfig } from '../../../../src/config/resolve-algorithm-config.js';

const NOW = new Date('2025-06-15T12:00:00.000Z');
const TODAY = NOW.toISOString().slice(0, 10);

describe('calculateNextReview', () => {
  it('floors ease at 1.3 and resets on failure (quality<3)', () => {
    const out = calculateNextReview(
      { quality: 1, repetitions: 5, easeFactor: 1.31, interval: 10 },
      DEFAULT_ALGORITHM_CONFIG,
      NOW
    );
    expect(out.repetitions).toBe(0);
    expect(out.interval).toBe(1);
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

// Config-driven tests to validate leech penalty clamp and thresholds
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
      },
      config,
      NOW
    );
    expect(below.leech).toBeFalsy();
    expect(at.leech).toBeTruthy();
  });
});
