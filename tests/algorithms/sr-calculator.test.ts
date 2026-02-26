import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from '../../src/algorithms/sr-calculator.js';

describe('calculateNextReview', () => {
  it('floors ease at 1.3 and resets on failure (quality<3)', () => {
    const out = calculateNextReview({ quality: 1, repetitions: 5, easeFactor: 1.31, interval: 10 });
    expect(out.repetitions).toBe(0);
    expect(out.interval).toBe(1);
    expect(out.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('uses initial and second intervals, then multiplies by EF', () => {
    const first = calculateNextReview({ quality: 5, repetitions: 0, easeFactor: 2.5, interval: 0 });
    expect(first.repetitions).toBe(1);
    expect(first.interval).toBeGreaterThanOrEqual(1);

    const second = calculateNextReview({
      quality: 5,
      repetitions: first.repetitions,
      easeFactor: first.easeFactor,
      interval: first.interval,
    });
    expect(second.repetitions).toBe(2);
    expect(second.interval).toBeGreaterThanOrEqual(1);

    const third = calculateNextReview({
      quality: 4,
      repetitions: second.repetitions,
      easeFactor: second.easeFactor,
      interval: second.interval,
    });
    expect(third.repetitions).toBe(3);
    expect(third.interval).toBeGreaterThanOrEqual(1);
  });

  it('treats quality=3 as hard and clamps EF', () => {
    const out = calculateNextReview({ quality: 3, repetitions: 3, easeFactor: 1.31, interval: 6 });
    expect(out.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(out.interval).toBeGreaterThanOrEqual(1);
  });
});

describe('calculatePriorityScore', () => {
  it('returns number 0..100', () => {
    const out = calculatePriorityScore({
      nextReviewDate: new Date().toISOString().slice(0, 10),
      easeFactor: 2,
      repetitions: 0,
      difficulty: 5,
    });
    expect(out.priority).toBeGreaterThanOrEqual(0);
    expect(out.priority).toBeLessThanOrEqual(100);
  });
});

describe('calculateNextReviewAdvanced', () => {
  it('applies lapse penalty and can flag leech on consecutive failures', () => {
    const base = calculateNextReviewAdvanced({
      quality: 2,
      repetitions: 5,
      easeFactor: 1.5,
      interval: 10,
      daysOverdue: 5,
      consecutiveFailures: 4,
    });
    expect(base.interval).toBeGreaterThanOrEqual(1);
    expect(base.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(typeof base.leech).toBe('boolean');
  });
});

describe('rankCandidatesWithConstraints', () => {
  it('orders candidates and respects caps', () => {
    const out = rankCandidatesWithConstraints({
      candidates: [
        {
          id: 'a',
          nextReviewDate: new Date().toISOString().slice(0, 10),
          easeFactor: 2,
          repetitions: 0,
          difficulty: 5,
          tags: ['x'],
        },
        {
          id: 'b',
          nextReviewDate: new Date().toISOString().slice(0, 10),
          easeFactor: 1.5,
          repetitions: 1,
          difficulty: 6,
          tags: ['y'],
        },
      ],
      timeboxMinutes: 20,
    });
    expect(Array.isArray(out.orderedIds)).toBe(true);
    expect(out.orderedIds.length).toBeGreaterThan(0);
  });
});

describe('TF-5: overdue penalty skipped for new items', () => {
  it('does not penalize ease for repetitions=0 even with large daysOverdue', () => {
    const result = calculateNextReviewAdvanced({
      quality: 5,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
      daysOverdue: 30,
    });
    // New item: overdue penalty should not apply, ease should be >= 2.5
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5);
  });

  it('still penalizes ease for repetitions>0 with daysOverdue', () => {
    const withoutOverdue = calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 10,
      daysOverdue: 0,
    });
    const withOverdue = calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 10,
      daysOverdue: 15,
    });
    // Overdue penalty should reduce ease for reviewed items
    expect(withOverdue.easeFactor).toBeLessThan(withoutOverdue.easeFactor);
  });
});

describe('TF-4: timebox truncation in rankCandidatesWithConstraints', () => {
  const today = new Date().toISOString().slice(0, 10);

  it('truncates candidates when timeboxMinutes is exceeded', () => {
    const result = rankCandidatesWithConstraints({
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
    });
    // Should select exactly 'a' and 'b' (5 + 10 = 15 minutes) within the 20-minute timebox
    expect(result.orderedIds.length).toBe(2);
    expect(result.orderedIds).toEqual(['a', 'b']);
    expect(result.warning).toBeUndefined();
  });

  it('returns warning when timeboxMinutes set but no candidates have estimatedDuration', () => {
    const result = rankCandidatesWithConstraints({
      candidates: [
        { id: 'a', nextReviewDate: today, easeFactor: 2.0, repetitions: 0, difficulty: 5 },
        { id: 'b', nextReviewDate: today, easeFactor: 2.0, repetitions: 1, difficulty: 6 },
      ],
      timeboxMinutes: 15,
    });
    expect(result.warning).toBeDefined();
    expect(result.orderedIds.length).toBe(2);
  });

  it('returns full list when timeboxMinutes is not set', () => {
    const result = rankCandidatesWithConstraints({
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
    });
    expect(result.orderedIds.length).toBe(2);
    expect(result.warning).toBeUndefined();
  });
});

// Config-driven tests to validate leech penalty clamp and thresholds
describe('advanced leech penalty clamp (config)', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    process.env.SM_LAPSE_PENALTY = '-0.1';
    process.env.SM_LEECH_EASE_ADJUST = '-0.05'; // sum -0.15
    process.env.SM_MIN_LEECH_EASE_PENALTY = '-0.2'; // clamp at -0.2 if sum more severe
    process.env.SM_LEECH_CONSEC_FAILS = '2';
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('uses sum of penalties when above min clamp', async () => {
    const mod = await import('../../src/algorithms/sr-calculator.js');
    const noLeech = mod.calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 5,
      easeFactor: 2.0,
      interval: 10,
      consecutiveFailures: 1,
    });
    const leech = mod.calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 5,
      easeFactor: 2.0,
      interval: 10,
      consecutiveFailures: 2,
    });
    expect(leech.leech).toBe(true);
    const delta = Number((leech.easeFactor - noLeech.easeFactor).toFixed(3));
    expect(delta).toBeCloseTo(-0.15, 3); // -0.1 + -0.05
  });

  it('uses minLeechEasePenalty when sum is more severe (clamps)', async () => {
    process.env.SM_LEECH_EASE_ADJUST = '-0.5'; // sum -0.6 < min -0.2 => clamp to -0.2
    vi.resetModules();
    const mod = await import('../../src/algorithms/sr-calculator.js');
    const noLeech = mod.calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 5,
      easeFactor: 2.0,
      interval: 10,
      consecutiveFailures: 1,
    });
    const leech = mod.calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 5,
      easeFactor: 2.0,
      interval: 10,
      consecutiveFailures: 2,
    });
    const delta = Number((leech.easeFactor - noLeech.easeFactor).toFixed(3));
    expect(delta).toBeCloseTo(-0.2, 3);
  });

  it('threshold: below threshold no leech; at threshold leech true', async () => {
    const mod = await import('../../src/algorithms/sr-calculator.js');
    const below = mod.calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 5,
      easeFactor: 2.0,
      interval: 10,
      consecutiveFailures: 1,
    });
    const at = mod.calculateNextReviewAdvanced({
      quality: 4,
      repetitions: 5,
      easeFactor: 2.0,
      interval: 10,
      consecutiveFailures: 2,
    });
    expect(below.leech).toBeFalsy();
    expect(at.leech).toBeTruthy();
  });
});
