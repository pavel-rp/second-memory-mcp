import type {
	ReviewEntry,
	AnalyticsInput,
	WindowSpec,
	DailyKpis,
	AnalyticsOutput,
} from "../types/analytics.js";

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

// Helper function to calculate days between dates
function daysBetween(start: Date, end: Date): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor((end.getTime() - start.getTime()) / msPerDay);
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
		if (!grouped.has(date)) {
			grouped.set(date, []);
		}
		grouped.get(date)!.push(entry);
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
	const average_quality = qualityValues.length > 0
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
	const overallAverageQuality = allQualityValues.length > 0
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
		const topicStats = new Map<string, { reviews: number; qualities: number[] }>();
		for (const entry of cleanedEntries) {
			if (entry.topic) {
				if (!topicStats.has(entry.topic)) {
					topicStats.set(entry.topic, { reviews: 0, qualities: [] });
				}
				const stats = topicStats.get(entry.topic)!;
				stats.reviews++;
				stats.qualities.push(entry.quality || 0);
			}
		}

		const by_topic: Record<string, { reviews_completed: number; average_quality: number }> = {};
		for (const [topic, stats] of topicStats) {
			const avgQuality = stats.qualities.length > 0
				? stats.qualities.reduce((sum, q) => sum + q, 0) / stats.qualities.length
				: 0;
			by_topic[topic] = {
				reviews_completed: stats.reviews,
				average_quality: Math.round(avgQuality * 100) / 100,
			};
		}

		// Tag breakdown
		const tagStats = new Map<string, { reviews: number; qualities: number[] }>();
		for (const entry of cleanedEntries) {
			for (const tag of entry.tags || []) {
				if (!tagStats.has(tag)) {
					tagStats.set(tag, { reviews: 0, qualities: [] });
				}
				const stats = tagStats.get(tag)!;
				stats.reviews++;
				stats.qualities.push(entry.quality || 0);
			}
		}

		const by_tag: Record<string, { reviews_completed: number; average_quality: number }> = {};
		for (const [tag, stats] of tagStats) {
			const avgQuality = stats.qualities.length > 0
				? stats.qualities.reduce((sum, q) => sum + q, 0) / stats.qualities.length
				: 0;
			by_tag[tag] = {
				reviews_completed: stats.reviews,
				average_quality: Math.round(avgQuality * 100) / 100,
			};
		}

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