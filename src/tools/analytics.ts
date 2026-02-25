import type {
  ReviewEntry,
  AnalyticsInput,
  WindowSpec,
  DailyKpis,
  AnalyticsOutput,
} from '../types/analytics.js';

type StatsBucket = { reviews: number; qualities: number[] };

function accumulateStat(statsMap: Map<string, StatsBucket>, key: string, quality: number): void {
  const existing = statsMap.get(key);
  if (existing) {
    existing.reviews++;
    existing.qualities.push(quality);
  } else {
    statsMap.set(key, { reviews: 1, qualities: [quality] });
  }
}

function statsToBreakdown(
  statsMap: Map<string, StatsBucket>
): Record<string, { reviews_completed: number; average_quality: number }> {
  const result: Record<string, { reviews_completed: number; average_quality: number }> = {};
  for (const [key, stats] of statsMap) {
    const avgQuality =
      stats.qualities.length > 0
        ? stats.qualities.reduce((sum, q) => sum + q, 0) / stats.qualities.length
        : 0;
    result[key] = {
      reviews_completed: stats.reviews,
      average_quality: Math.round(avgQuality * 100) / 100,
    };
  }
  return result;
}

// Helper function to clamp quality values to valid range
function clampQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 0;
  return Math.max(0, Math.min(5, quality));
}

// Helper function to validate and parse date strings
function parseDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Helper function to format date as ISO string
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to get all dates in a range
function getDateRange(start: string, end: string): string[] {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Clean and validate review entries
function cleanEntries(entries: ReviewEntry[]): ReviewEntry[] {
  return entries
    .filter(entry => {
      // Filter out entries with invalid dates
      const date = parseDate(entry.date);
      return date !== null;
    })
    .map(entry => ({
      ...entry,
      quality: clampQuality(entry.quality ?? 0),
      isNew: Boolean(entry.isNew),
      tags: Array.isArray(entry.tags) ? entry.tags : [],
    }));
}

// Group entries by date
function groupEntriesByDate(entries: ReviewEntry[]): Map<string, ReviewEntry[]> {
  const grouped = new Map<string, ReviewEntry[]>();

  for (const entry of entries) {
    const date = entry.date;
    const existing = grouped.get(date);
    if (existing) {
      existing.push(entry);
    } else {
      grouped.set(date, [entry]);
    }
  }

  return grouped;
}

// Calculate streak days from daily KPIs
function calculateStreak(dailyKpis: DailyKpis[]): number {
  if (dailyKpis.length === 0) return 0;

  // Sort by date descending to find current streak
  const sorted = [...dailyKpis].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const day of sorted) {
    if (day.reviews_completed > 0) {
      streak++;
    } else {
      break; // Streak is broken
    }
  }

  return streak;
}

/**
 * Compute daily KPIs for a single day from review entries
 */
export function computeDailyKpis(entries: ReviewEntry[]): DailyKpis {
  if (entries.length === 0) {
    // Return empty day - date will be set by caller
    return {
      date: '',
      reviews_completed: 0,
      average_quality: 0,
      new_chunks_learned: 0,
    };
  }

  const cleanedEntries = cleanEntries(entries);
  const date = cleanedEntries[0]?.date || '';

  // Count reviews and new chunks
  const reviews_completed = cleanedEntries.length;
  const new_chunks_learned = cleanedEntries.filter(entry => entry.isNew).length;

  // Calculate average quality
  const qualityValues = cleanedEntries.map(entry => entry.quality || 0);
  const average_quality =
    qualityValues.length > 0
      ? qualityValues.reduce((sum, q) => sum + q, 0) / qualityValues.length
      : 0;

  return {
    date,
    reviews_completed,
    average_quality: Math.round(average_quality * 100) / 100, // Round to 2 decimal places
    new_chunks_learned,
  };
}

/**
 * Compute analytics for a window of dates with optional breakdowns
 */
export function computeWindowRollup(
  input: AnalyticsInput,
  window: WindowSpec,
  options: { includeBreakdowns?: boolean } = {}
): AnalyticsOutput {
  const cleanedEntries = cleanEntries(input.entries);
  const dateRange = getDateRange(window.start, window.end);

  if (dateRange.length === 0) {
    return {
      days: [],
      total: {
        reviews_completed: 0,
        average_quality: 0,
        new_chunks_learned: 0,
        streak_days: 0,
      },
    };
  }

  // Group entries by date
  const entriesByDate = groupEntriesByDate(cleanedEntries);

  // Calculate daily KPIs for each date in the window
  const dailyKpis: DailyKpis[] = dateRange.map(date => {
    const dayEntries = entriesByDate.get(date) || [];
    const kpis = computeDailyKpis(dayEntries);
    return { ...kpis, date };
  });

  // Calculate streak for each day
  for (let i = 0; i < dailyKpis.length; i++) {
    const dayKpis = dailyKpis.slice(0, i + 1);
    dailyKpis[i].streak_days = calculateStreak(dayKpis);
  }

  // Calculate totals
  const totalReviews = dailyKpis.reduce((sum, day) => sum + day.reviews_completed, 0);
  const totalNewChunks = dailyKpis.reduce((sum, day) => sum + day.new_chunks_learned, 0);
  const totalStreak = dailyKpis.length > 0 ? dailyKpis[dailyKpis.length - 1].streak_days || 0 : 0;

  // Calculate overall average quality
  const allQualityValues = cleanedEntries.map(entry => entry.quality || 0);
  const overallAverageQuality =
    allQualityValues.length > 0
      ? allQualityValues.reduce((sum, q) => sum + q, 0) / allQualityValues.length
      : 0;

  const result: AnalyticsOutput = {
    days: dailyKpis,
    total: {
      reviews_completed: totalReviews,
      average_quality: Math.round(overallAverageQuality * 100) / 100,
      new_chunks_learned: totalNewChunks,
      streak_days: totalStreak,
    },
  };

  // Add breakdowns if requested
  if (options.includeBreakdowns) {
    const breakdowns: NonNullable<AnalyticsOutput['breakdowns']> = {};

    // Topic breakdown
    const topicStats = new Map<string, StatsBucket>();
    for (const entry of cleanedEntries) {
      if (entry.topic) {
        accumulateStat(topicStats, entry.topic, entry.quality || 0);
      }
    }

    // Tag breakdown
    const tagStats = new Map<string, StatsBucket>();
    for (const entry of cleanedEntries) {
      for (const tag of entry.tags || []) {
        accumulateStat(tagStats, tag, entry.quality || 0);
      }
    }

    const by_topic = statsToBreakdown(topicStats);
    const by_tag = statsToBreakdown(tagStats);

    if (Object.keys(by_topic).length > 0) {
      breakdowns.by_topic = by_topic;
    }

    if (Object.keys(by_tag).length > 0) {
      breakdowns.by_tag = by_tag;
    }

    if (Object.keys(breakdowns).length > 0) {
      result.breakdowns = breakdowns;
    }
  }

  return result;
}
