import { describe, it, expect } from 'vitest';
import {
  computeDailyKpis,
  computeWindowRollup,
} from '../../../../src/domain/services/analytics-calculator.js';
import type {
  ReviewEntry,
  AnalyticsInput,
  WindowSpec,
} from '../../../../src/domain/types/analytics.js';

describe('computeDailyKpis', () => {
  it('returns empty day for no entries', () => {
    const result = computeDailyKpis([]);
    expect(result).toEqual({
      date: '',
      reviews_completed: 0,
      average_quality: 0,
      new_chunks_learned: 0,
    });
  });

  it('calculates correct KPIs for single day', () => {
    const entries: ReviewEntry[] = [
      { date: '2024-01-01', quality: 4, isNew: true },
      { date: '2024-01-01', quality: 3, isNew: false },
      { date: '2024-01-01', quality: 5, isNew: true },
    ];

    const result = computeDailyKpis(entries);
    expect(result.date).toBe('2024-01-01');
    expect(result.reviews_completed).toBe(3);
    expect(result.average_quality).toBe(4); // (4+3+5)/3 = 4
    expect(result.new_chunks_learned).toBe(2);
  });

  it('handles missing quality values (defaults to 0)', () => {
    const entries: ReviewEntry[] = [
      { date: '2024-01-01' }, // no quality, isNew
      { date: '2024-01-01', quality: 5 },
    ];

    const result = computeDailyKpis(entries);
    expect(result.reviews_completed).toBe(2);
    expect(result.average_quality).toBe(2.5); // (0+5)/2 = 2.5
    expect(result.new_chunks_learned).toBe(0); // both default to false
  });

  it('clamps quality values to 0-5 range', () => {
    const entries: ReviewEntry[] = [
      { date: '2024-01-01', quality: -1 },
      { date: '2024-01-01', quality: 10 },
      { date: '2024-01-01', quality: 2.5 },
    ];

    const result = computeDailyKpis(entries);
    expect(result.average_quality).toBe(2.5); // (0+5+2.5)/3 = 2.5
  });

  it('handles invalid quality values (NaN, Infinity)', () => {
    const entries: ReviewEntry[] = [
      { date: '2024-01-01', quality: NaN },
      { date: '2024-01-01', quality: Infinity },
      { date: '2024-01-01', quality: 3 },
    ];

    const result = computeDailyKpis(entries);
    expect(result.average_quality).toBe(1); // (0+0+3)/3 = 1
  });

  it('rounds average quality to 2 decimal places', () => {
    const entries: ReviewEntry[] = [
      { date: '2024-01-01', quality: 3.333 },
      { date: '2024-01-01', quality: 3.333 },
      { date: '2024-01-01', quality: 3.334 },
    ];

    const result = computeDailyKpis(entries);
    expect(result.average_quality).toBe(3.33); // Should be rounded
  });
});

describe('computeWindowRollup', () => {
  it('returns empty result for invalid date range', () => {
    const input: AnalyticsInput = { entries: [] };
    const window: WindowSpec = { start: '2024-01-05', end: '2024-01-01' }; // Invalid range

    const result = computeWindowRollup(input, window);
    expect(result.days).toEqual([]);
    expect(result.total).toEqual({
      reviews_completed: 0,
      average_quality: 0,
      new_chunks_learned: 0,
      streak_days: 0,
    });
  });

  it('includes all dates in range, even with no entries', () => {
    const input: AnalyticsInput = {
      entries: [{ date: '2024-01-02', quality: 4, isNew: true }],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-03' };

    const result = computeWindowRollup(input, window);
    expect(result.days).toHaveLength(3);
    expect(result.days[0]).toEqual({
      date: '2024-01-01',
      reviews_completed: 0,
      average_quality: 0,
      new_chunks_learned: 0,
      streak_days: 0,
    });
    expect(result.days[1]).toEqual({
      date: '2024-01-02',
      reviews_completed: 1,
      average_quality: 4,
      new_chunks_learned: 1,
      streak_days: 1,
    });
    expect(result.days[2]).toEqual({
      date: '2024-01-03',
      reviews_completed: 0,
      average_quality: 0,
      new_chunks_learned: 0,
      streak_days: 0, // Streak broken
    });
  });

  it('calculates correct streak days', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2024-01-01', quality: 3 },
        { date: '2024-01-02', quality: 4 },
        // Skip day 3 - breaks streak
        { date: '2024-01-04', quality: 5 },
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-04' };

    const result = computeWindowRollup(input, window);
    expect(result.days[0].streak_days).toBe(1); // Day 1: 1 day streak
    expect(result.days[1].streak_days).toBe(2); // Day 2: 2 day streak
    expect(result.days[2].streak_days).toBe(0); // Day 3: no reviews, streak broken
    expect(result.days[3].streak_days).toBe(1); // Day 4: new 1 day streak
    expect(result.total.streak_days).toBe(1); // Final streak is 1 day
  });

  it('calculates correct totals', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2024-01-01', quality: 2, isNew: true },
        { date: '2024-01-01', quality: 4, isNew: false },
        { date: '2024-01-02', quality: 5, isNew: true },
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-02' };

    const result = computeWindowRollup(input, window);
    expect(result.total).toEqual({
      reviews_completed: 3,
      average_quality: 3.67, // (2+4+5)/3 = 3.67 rounded
      new_chunks_learned: 2,
      streak_days: 2,
    });
  });

  it('filters out malformed entries', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: 'invalid-date', quality: 3 },
        { date: '2024-01-01', quality: 4 },
        { date: '', quality: 2 },
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window);
    expect(result.days[0].reviews_completed).toBe(1); // Only valid entry counted
    expect(result.total.reviews_completed).toBe(1);
  });

  it('includes topic breakdowns when requested', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2024-01-01', quality: 3, topic: 'math' },
        { date: '2024-01-01', quality: 5, topic: 'math' },
        { date: '2024-01-01', quality: 2, topic: 'science' },
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window, { includeBreakdowns: true });
    expect(result.breakdowns?.by_topic).toEqual({
      math: { reviews_completed: 2, average_quality: 4 }, // (3+5)/2 = 4
      science: { reviews_completed: 1, average_quality: 2 },
    });
  });

  it('includes tag breakdowns when requested', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2024-01-01', quality: 4, tags: ['algebra', 'basic'] },
        { date: '2024-01-01', quality: 2, tags: ['algebra'] },
        { date: '2024-01-01', quality: 5, tags: ['geometry'] },
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window, { includeBreakdowns: true });
    expect(result.breakdowns?.by_tag).toEqual({
      algebra: { reviews_completed: 2, average_quality: 3 }, // (4+2)/2 = 3
      basic: { reviews_completed: 1, average_quality: 4 },
      geometry: { reviews_completed: 1, average_quality: 5 },
    });
  });

  it('omits breakdowns when not requested', () => {
    const input: AnalyticsInput = {
      entries: [{ date: '2024-01-01', quality: 3, topic: 'math', tags: ['algebra'] }],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window);
    expect(result.breakdowns).toBeUndefined();
  });

  it('handles empty breakdowns gracefully', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2024-01-01', quality: 3 }, // No topic or tags
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window, { includeBreakdowns: true });
    expect(result.breakdowns).toBeUndefined(); // Should be omitted when empty
  });

  it('returns empty for invalid start date string', () => {
    const input: AnalyticsInput = { entries: [] };
    const window: WindowSpec = { start: 'not-a-date', end: '2024-01-01' };

    const result = computeWindowRollup(input, window);
    expect(result.days).toEqual([]);
    expect(result.total.reviews_completed).toBe(0);
  });

  it('returns empty for invalid end date string', () => {
    const input: AnalyticsInput = { entries: [] };
    const window: WindowSpec = { start: '2024-01-01', end: 'bad' };

    const result = computeWindowRollup(input, window);
    expect(result.days).toEqual([]);
  });

  it('handles entries with tags as non-array (defaults to empty)', () => {
    const input: AnalyticsInput = {
      entries: [{ date: '2024-01-01', quality: 3, tags: null as unknown as string[] }],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window, { includeBreakdowns: true });
    // No tags → no tag breakdowns
    expect(result.breakdowns).toBeUndefined();
  });

  it('handles edge case: single day window', () => {
    const input: AnalyticsInput = {
      entries: [{ date: '2024-01-01', quality: 4, isNew: true }],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-01' };

    const result = computeWindowRollup(input, window);
    expect(result.days).toHaveLength(1);
    expect(result.days[0]).toEqual({
      date: '2024-01-01',
      reviews_completed: 1,
      average_quality: 4,
      new_chunks_learned: 1,
      streak_days: 1,
    });
    expect(result.total).toEqual({
      reviews_completed: 1,
      average_quality: 4,
      new_chunks_learned: 1,
      streak_days: 1,
    });
  });

  it('handles entries outside window range', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2023-12-31', quality: 1 }, // Before window
        { date: '2024-01-01', quality: 4 }, // In window
        { date: '2024-01-03', quality: 5 }, // After window
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-02' };

    const result = computeWindowRollup(input, window);
    expect(result.days).toHaveLength(2);
    expect(result.total.reviews_completed).toBe(1); // Only the in-window entry
    expect(result.total.average_quality).toBe(4); // Only in-window quality, not (1+4+5)/3
  });

  it('excludes out-of-window entries from breakdowns', () => {
    const input: AnalyticsInput = {
      entries: [
        { date: '2023-12-31', quality: 2, topic: 'history', tags: ['ancient'] }, // Before window
        { date: '2024-01-01', quality: 4, topic: 'math', tags: ['algebra'] }, // In window
        { date: '2024-01-01', quality: 3, topic: 'math', tags: ['geometry'] }, // In window
        { date: '2024-01-03', quality: 5, topic: 'science', tags: ['physics'] }, // After window
      ],
    };
    const window: WindowSpec = { start: '2024-01-01', end: '2024-01-02' };

    const result = computeWindowRollup(input, window, { includeBreakdowns: true });
    // Only in-window topics/tags should appear
    expect(result.breakdowns?.by_topic).toEqual({
      math: { reviews_completed: 2, average_quality: 3.5 },
    });
    expect(result.breakdowns?.by_tag).toEqual({
      algebra: { reviews_completed: 1, average_quality: 4 },
      geometry: { reviews_completed: 1, average_quality: 3 },
    });
    // Out-of-window topics/tags must not appear
    expect(result.breakdowns?.by_topic).not.toHaveProperty('history');
    expect(result.breakdowns?.by_topic).not.toHaveProperty('science');
    expect(result.breakdowns?.by_tag).not.toHaveProperty('ancient');
    expect(result.breakdowns?.by_tag).not.toHaveProperty('physics');
  });
});
