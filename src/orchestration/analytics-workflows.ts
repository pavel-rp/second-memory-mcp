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
import {
  computeCalibration,
  type CalibrationReport,
} from '../domain/services/analytics-calibration.js';

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
  /**
   * Predicted-vs-observed calibration (NEU-846). Always an object, never `null`
   * — at zero observations it is a complete payload with suppressed rates.
   */
  calibration: CalibrationReport;
};

/**
 * Compose the scheduler-health report: one port read, two pure computations.
 *
 * The port row type and the domain observation types are field-identical by
 * design, so the rows pass straight through with no re-map — and calibration
 * scores the *same* already-fetched array, so it costs no second round-trip and
 * needs no port method of its own. `now` is injected (the composition root
 * supplies `new Date()`) so this workflow never reads a clock of its own and the
 * domain never sees one at all.
 */
export async function computeSchedulerHealthAnalytics(
  deps: AnalyticsDeps,
  now: Date
): Promise<SchedulerHealthAnalytics> {
  const observations = await deps.reviewPersistence.getFirstAttemptObservations();

  return {
    ...computeSchedulerHealth(observations),
    generatedAt: now.toISOString(),
    calibration: computeCalibration(observations),
  };
}
