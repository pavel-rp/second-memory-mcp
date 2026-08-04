import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type {
  ReviewEntry,
  PersistedReviewEntry,
  DailyKpis,
  AnalyticsOutput,
} from '../domain/types/analytics.js';
import { computeDailyKpis, computeWindowRollup } from '../domain/services/analytics-calculator.js';
import {
  computeSchedulerHealth,
  type SchedulerHealthReport,
} from '../domain/services/analytics-health.js';

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

/** The pure scheduler-health report plus the two orchestration-owned fields. */
export type SchedulerHealthAnalytics = SchedulerHealthReport & {
  /** Stamped from the injected clock — the domain stays clock-free. */
  generatedAt: string;
  /** NEU-846 extension seam. Always present, always null here. */
  calibration: null;
};

/**
 * Compose the scheduler-health report: one port read, one pure computation.
 *
 * The port row type and the domain observation type are field-identical by
 * design, so the rows pass straight through with no re-map. `now` is injected
 * (the composition root supplies `new Date()`) so this workflow never reads a
 * clock of its own and the domain never sees one at all.
 *
 * NEU-846 extends this by adding `computeCalibration(observations)` over the
 * *same* observation array and assigning it to `calibration` — no new port
 * method, no second round-trip, no change to any response key already here.
 */
export async function computeSchedulerHealthAnalytics(
  deps: AnalyticsDeps,
  now: Date
): Promise<SchedulerHealthAnalytics> {
  const observations = await deps.reviewPersistence.getFirstAttemptObservations();

  return {
    ...computeSchedulerHealth(observations),
    generatedAt: now.toISOString(),
    calibration: null,
  };
}
