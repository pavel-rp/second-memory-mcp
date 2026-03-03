import { describe, it, expect } from 'vitest';
import {
  ReviewEntrySchema,
  AnalyticsInputSchema,
  WindowSpecSchema,
  DailyKpisSchema,
  AnalyticsOutputSchema,
} from '../../../../src/domain/types/analytics.js';

describe('ReviewEntrySchema', () => {
  it('validates valid review entry', () => {
    const validEntry = {
      date: '2024-01-01',
      quality: 4,
      is_new: true,
      topic: 'mathematics',
      tags: ['algebra', 'basic'],
    };

    const result = ReviewEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validEntry);
    }
  });

  it('applies defaults for optional fields', () => {
    const minimalEntry = { date: '2024-01-01' };

    const result = ReviewEntrySchema.safeParse(minimalEntry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        date: '2024-01-01',
        quality: 0,
        is_new: false,
        tags: [],
      });
    }
  });

  it('validates date format', () => {
    const invalidDates = [
      '2024-1-1', // Missing leading zeros
      '24-01-01', // Wrong year format
      '2024/01/01', // Wrong separator
      'invalid', // Non-date string
      '', // Empty string
    ];

    for (const date of invalidDates) {
      const result = ReviewEntrySchema.safeParse({ date });
      expect(result.success).toBe(false);
    }
  });

  it('validates quality range', () => {
    const validQualities = [0, 1, 2.5, 3, 4, 5];
    const invalidQualities = [-1, 5.1, 10, NaN, Infinity];

    for (const quality of validQualities) {
      const result = ReviewEntrySchema.safeParse({ date: '2024-01-01', quality });
      expect(result.success).toBe(true);
    }

    for (const quality of invalidQualities) {
      const result = ReviewEntrySchema.safeParse({ date: '2024-01-01', quality });
      expect(result.success).toBe(false);
    }
  });

  it('validates tags as string array', () => {
    const validTags = [[], ['tag1'], ['tag1', 'tag2', 'tag3']];
    const invalidTags = ['string', 123, [1, 2, 3], [null, 'tag']];

    for (const tags of validTags) {
      const result = ReviewEntrySchema.safeParse({ date: '2024-01-01', tags });
      expect(result.success).toBe(true);
    }

    for (const tags of invalidTags) {
      const result = ReviewEntrySchema.safeParse({ date: '2024-01-01', tags });
      expect(result.success).toBe(false);
    }
  });
});

describe('AnalyticsInputSchema', () => {
  it('validates array of review entries', () => {
    const validInput = {
      entries: [
        { date: '2024-01-01', quality: 3 },
        { date: '2024-01-02', quality: 4, is_new: true },
      ],
    };

    const result = AnalyticsInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('validates empty entries array', () => {
    const emptyInput = { entries: [] };
    const result = AnalyticsInputSchema.safeParse(emptyInput);
    expect(result.success).toBe(true);
  });

  it('rejects invalid entries', () => {
    const invalidInput = {
      entries: [{ date: 'invalid-date', quality: 3 }],
    };

    const result = AnalyticsInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe('WindowSpecSchema', () => {
  it('validates valid date range', () => {
    const validWindow = {
      start: '2024-01-01',
      end: '2024-01-31',
    };

    const result = WindowSpecSchema.safeParse(validWindow);
    expect(result.success).toBe(true);
  });

  it('validates same start and end date', () => {
    const sameWindow = {
      start: '2024-01-01',
      end: '2024-01-01',
    };

    const result = WindowSpecSchema.safeParse(sameWindow);
    expect(result.success).toBe(true);
  });

  it('rejects invalid date formats', () => {
    const invalidWindows = [
      { start: '2024-1-1', end: '2024-01-31' },
      { start: '2024-01-01', end: 'invalid' },
      { start: '', end: '2024-01-01' },
    ];

    for (const window of invalidWindows) {
      const result = WindowSpecSchema.safeParse(window);
      expect(result.success).toBe(false);
    }
  });
});

describe('DailyKpisSchema', () => {
  it('validates complete daily KPIs', () => {
    const validKpis = {
      date: '2024-01-01',
      reviews_completed: 5,
      average_quality: 3.5,
      new_chunks_learned: 2,
      streak_days: 7,
    };

    const result = DailyKpisSchema.safeParse(validKpis);
    expect(result.success).toBe(true);
  });

  it('validates without optional streak_days', () => {
    const kpisWithoutStreak = {
      date: '2024-01-01',
      reviews_completed: 5,
      average_quality: 3.5,
      new_chunks_learned: 2,
    };

    const result = DailyKpisSchema.safeParse(kpisWithoutStreak);
    expect(result.success).toBe(true);
  });

  it('validates numeric constraints', () => {
    const invalidKpis = [
      { date: '2024-01-01', reviews_completed: -1, average_quality: 3, new_chunks_learned: 0 },
      { date: '2024-01-01', reviews_completed: 5, average_quality: 6, new_chunks_learned: 0 },
      { date: '2024-01-01', reviews_completed: 5, average_quality: 3, new_chunks_learned: -1 },
      {
        date: '2024-01-01',
        reviews_completed: 5,
        average_quality: 3,
        new_chunks_learned: 0,
        streak_days: -1,
      },
    ];

    for (const kpis of invalidKpis) {
      const result = DailyKpisSchema.safeParse(kpis);
      expect(result.success).toBe(false);
    }
  });
});

describe('AnalyticsOutputSchema', () => {
  it('validates complete analytics output', () => {
    const validOutput = {
      days: [
        {
          date: '2024-01-01',
          reviews_completed: 3,
          average_quality: 4,
          new_chunks_learned: 1,
          streak_days: 1,
        },
      ],
      total: {
        reviews_completed: 3,
        average_quality: 4,
        new_chunks_learned: 1,
        streak_days: 1,
      },
      breakdowns: {
        by_topic: {
          math: { reviews_completed: 2, average_quality: 4 },
        },
        by_tag: {
          algebra: { reviews_completed: 1, average_quality: 5 },
        },
      },
    };

    const result = AnalyticsOutputSchema.safeParse(validOutput);
    expect(result.success).toBe(true);
  });

  it('validates without optional breakdowns', () => {
    const outputWithoutBreakdowns = {
      days: [
        {
          date: '2024-01-01',
          reviews_completed: 3,
          average_quality: 4,
          new_chunks_learned: 1,
        },
      ],
      total: {
        reviews_completed: 3,
        average_quality: 4,
        new_chunks_learned: 1,
        streak_days: 1,
      },
    };

    const result = AnalyticsOutputSchema.safeParse(outputWithoutBreakdowns);
    expect(result.success).toBe(true);
  });

  it('validates empty days array', () => {
    const emptyOutput = {
      days: [],
      total: {
        reviews_completed: 0,
        average_quality: 0,
        new_chunks_learned: 0,
        streak_days: 0,
      },
    };

    const result = AnalyticsOutputSchema.safeParse(emptyOutput);
    expect(result.success).toBe(true);
  });

  it('validates partial breakdowns', () => {
    const partialBreakdowns = {
      days: [],
      total: {
        reviews_completed: 0,
        average_quality: 0,
        new_chunks_learned: 0,
        streak_days: 0,
      },
      breakdowns: {
        by_topic: {
          math: { reviews_completed: 1, average_quality: 3 },
        },
        // No by_tag breakdown
      },
    };

    const result = AnalyticsOutputSchema.safeParse(partialBreakdowns);
    expect(result.success).toBe(true);
  });

  it('rejects invalid breakdown structure', () => {
    const invalidBreakdowns = {
      days: [],
      total: {
        reviews_completed: 0,
        average_quality: 0,
        new_chunks_learned: 0,
        streak_days: 0,
      },
      breakdowns: {
        by_topic: {
          math: { reviews_completed: -1, average_quality: 3 }, // Invalid negative
        },
      },
    };

    const result = AnalyticsOutputSchema.safeParse(invalidBreakdowns);
    expect(result.success).toBe(false);
  });
});
