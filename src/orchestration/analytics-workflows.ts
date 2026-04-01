import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type {
  ReviewEntry,
  PersistedReviewEntry,
  DailyKpis,
  AnalyticsOutput,
} from '../domain/types/analytics.js';
import { computeDailyKpis, computeWindowRollup } from '../domain/services/analytics-calculator.js';

export type AnalyticsDeps = {
  reviewPersistence: ReviewPersistencePort;
};

function toReviewEntry(p: PersistedReviewEntry): ReviewEntry {
  return { date: p.date, quality: p.quality, isNew: p.isNew, topic: p.topic, tags: p.tags };
}

export async function computeDailyAnalytics(date: string, deps: AnalyticsDeps): Promise<DailyKpis> {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const nextDay = new Date(dayStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const persisted = await deps.reviewPersistence.getReviewsByDateRange(dayStart, nextDay);
  const entries = persisted.map(toReviewEntry);

  const result = computeDailyKpis(entries);
  return { ...result, date: `${date}T00:00:00.000Z` };
}

export async function computeWindowAnalytics(
  from: string,
  to: string,
  options: { includeBreakdowns?: boolean },
  deps: AnalyticsDeps
): Promise<AnalyticsOutput> {
  const rangeStart = new Date(`${from}T00:00:00.000Z`);
  const dayAfterEnd = new Date(`${to}T00:00:00.000Z`);
  dayAfterEnd.setUTCDate(dayAfterEnd.getUTCDate() + 1);

  const persisted = await deps.reviewPersistence.getReviewsByDateRange(rangeStart, dayAfterEnd);
  const entries = persisted.map(toReviewEntry);

  return computeWindowRollup(
    { entries },
    { start: from, end: to },
    { includeBreakdowns: options.includeBreakdowns }
  );
}
