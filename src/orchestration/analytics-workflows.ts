import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { ReviewEntry, DailyKpis, AnalyticsOutput } from '../domain/types/analytics.js';
import { computeDailyKpis, computeWindowRollup } from '../domain/services/analytics-calculator.js';

export type AnalyticsDeps = {
  reviewPersistence: ReviewPersistencePort;
};

export async function computeDailyAnalytics(date: string, deps: AnalyticsDeps): Promise<DailyKpis> {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const persisted = await deps.reviewPersistence.getReviewsByDateRange(dayStart, dayEnd);

  const entries: ReviewEntry[] = persisted.map(p => ({
    date: p.date,
    quality: p.quality,
    isNew: p.isNew,
    topic: p.topic,
    tags: p.tags,
  }));

  const result = computeDailyKpis(entries);
  return { ...result, date };
}

export async function computeWindowAnalytics(
  from: string,
  to: string,
  options: { includeBreakdowns?: boolean },
  deps: AnalyticsDeps
): Promise<AnalyticsOutput> {
  const rangeStart = new Date(`${from}T00:00:00.000Z`);
  const rangeEnd = new Date(`${to}T23:59:59.999Z`);

  const persisted = await deps.reviewPersistence.getReviewsByDateRange(rangeStart, rangeEnd);

  const entries: ReviewEntry[] = persisted.map(p => ({
    date: p.date,
    quality: p.quality,
    isNew: p.isNew,
    topic: p.topic,
    tags: p.tags,
  }));

  return computeWindowRollup(
    { entries },
    { start: from, end: to },
    { includeBreakdowns: options.includeBreakdowns }
  );
}
