import { describe, it, expect, vi } from 'vitest';
import {
  computeDailyAnalytics,
  computeWindowAnalytics,
} from '../../../src/orchestration/analytics-workflows.js';
import type { AnalyticsDeps } from '../../../src/orchestration/analytics-workflows.js';
import type { PersistedReviewEntry } from '../../../src/domain/types/analytics.js';
import { stubReviewPersistence } from '../../helpers/stub-ports.js';

function makeDeps(overrides?: Partial<ReturnType<typeof stubReviewPersistence>>): AnalyticsDeps {
  return { reviewPersistence: stubReviewPersistence(overrides) };
}

const sampleEntries: PersistedReviewEntry[] = [
  { date: '2026-01-15', quality: 4, isNew: false, topic: 'math', tags: ['algebra'] },
  { date: '2026-01-15', quality: 5, isNew: true, topic: 'math', tags: ['algebra', 'basics'] },
  { date: '2026-01-15', quality: 3, isNew: false, topic: 'science', tags: ['physics'] },
];

describe('computeDailyAnalytics', () => {
  it('queries the port and returns daily KPIs', async () => {
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue(sampleEntries),
    });

    const result = await computeDailyAnalytics('2026-01-15', deps);

    expect(result.date).toBe('2026-01-15T00:00:00.000Z');
    expect(result.reviews_completed).toBe(3);
    expect(result.new_chunks_learned).toBe(1);
    expect(result.average_quality).toBeGreaterThan(0);
  });

  it('passes correct UTC date bounds to getReviewsByDateRange', async () => {
    const mock = vi.fn().mockResolvedValue([]);
    const deps = makeDeps({ getReviewsByDateRange: mock });

    await computeDailyAnalytics('2026-03-08', deps);

    const [from, to] = mock.mock.calls[0];
    expect(from).toEqual(new Date('2026-03-08T00:00:00.000Z'));
    expect(to).toEqual(new Date('2026-03-09T00:00:00.000Z'));
  });

  it('returns zero-value KPIs with correct date when no reviews exist', async () => {
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue([]),
    });

    const result = await computeDailyAnalytics('2026-01-15', deps);

    expect(result.date).toBe('2026-01-15T00:00:00.000Z');
    expect(result.reviews_completed).toBe(0);
    expect(result.average_quality).toBe(0);
    expect(result.new_chunks_learned).toBe(0);
  });

  it('overrides date from domain function with requested date', async () => {
    // Even if entries have a different date, the result should use the requested date
    const entries: PersistedReviewEntry[] = [
      { date: '2026-01-14', quality: 4, isNew: false, topic: 'math', tags: [] },
    ];
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue(entries),
    });

    const result = await computeDailyAnalytics('2026-01-15', deps);
    expect(result.date).toBe('2026-01-15T00:00:00.000Z');
  });

  it('maps PersistedReviewEntry fields correctly to ReviewEntry', async () => {
    const entries: PersistedReviewEntry[] = [
      { date: '2026-01-15', quality: 5, isNew: true, topic: 'history', tags: ['wwii', 'europe'] },
    ];
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue(entries),
    });

    const result = await computeDailyAnalytics('2026-01-15', deps);
    expect(result.reviews_completed).toBe(1);
    expect(result.new_chunks_learned).toBe(1);
    expect(result.average_quality).toBe(5);
  });
});

describe('computeWindowAnalytics', () => {
  it('returns window analytics with breakdowns enabled', async () => {
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue(sampleEntries),
    });

    const result = await computeWindowAnalytics(
      '2026-01-15',
      '2026-01-15',
      { includeBreakdowns: true },
      deps
    );

    expect(result.days).toHaveLength(1);
    expect(result.total.reviews_completed).toBe(3);
    expect(result.breakdowns).toBeDefined();
    expect(result.breakdowns?.by_topic?.math).toBeDefined();
    expect(result.breakdowns?.by_tag?.algebra).toBeDefined();
  });

  it('returns window analytics without breakdowns', async () => {
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue(sampleEntries),
    });

    const result = await computeWindowAnalytics(
      '2026-01-15',
      '2026-01-15',
      { includeBreakdowns: false },
      deps
    );

    expect(result.days).toHaveLength(1);
    expect(result.total.reviews_completed).toBe(3);
    expect(result.breakdowns).toBeUndefined();
  });

  it('returns zero-value output when no reviews exist', async () => {
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue([]),
    });

    const result = await computeWindowAnalytics(
      '2026-01-01',
      '2026-01-03',
      { includeBreakdowns: false },
      deps
    );

    expect(result.days).toHaveLength(3);
    expect(result.total.reviews_completed).toBe(0);
    expect(result.total.average_quality).toBe(0);
  });

  it('passes correct UTC date bounds to getReviewsByDateRange', async () => {
    const mock = vi.fn().mockResolvedValue([]);
    const deps = makeDeps({ getReviewsByDateRange: mock });

    await computeWindowAnalytics('2026-01-01', '2026-01-31', {}, deps);

    const [from, to] = mock.mock.calls[0];
    expect(from).toEqual(new Date('2026-01-01T00:00:00.000Z'));
    expect(to).toEqual(new Date('2026-02-01T00:00:00.000Z'));
  });

  it('handles multi-day ranges with entries on different days', async () => {
    const multiDayEntries: PersistedReviewEntry[] = [
      { date: '2026-01-01', quality: 4, isNew: false, topic: 'math', tags: [] },
      { date: '2026-01-02', quality: 5, isNew: true, topic: 'math', tags: [] },
      { date: '2026-01-02', quality: 3, isNew: false, topic: 'science', tags: [] },
    ];
    const deps = makeDeps({
      getReviewsByDateRange: vi.fn().mockResolvedValue(multiDayEntries),
    });

    const result = await computeWindowAnalytics(
      '2026-01-01',
      '2026-01-02',
      { includeBreakdowns: false },
      deps
    );

    expect(result.days).toHaveLength(2);
    expect(result.days[0].reviews_completed).toBe(1);
    expect(result.days[1].reviews_completed).toBe(2);
    expect(result.total.reviews_completed).toBe(3);
  });
});
