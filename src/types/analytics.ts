import { z } from "zod";

// Base review entry for analytics calculations
export type ReviewEntry = {
	date: string; // ISO YYYY-MM-DD
	quality?: number; // 0..5 (optional, defaults to 0)
	isNew?: boolean; // true for new chunks learned
	topic?: string; // optional topic categorization
	tags?: string[]; // optional tag categorization
};

// Input for analytics calculations
export type AnalyticsInput = {
	entries: ReviewEntry[];
};

// Window specification for multi-day analytics
export type WindowSpec = {
	start: string; // ISO YYYY-MM-DD
	end: string; // ISO YYYY-MM-DD
};

// Daily KPI metrics
export type DailyKpis = {
	date: string; // ISO YYYY-MM-DD
	reviews_completed: number;
	average_quality: number; // 0..5
	new_chunks_learned: number;
	streak_days?: number; // optional streak count
};

// Comprehensive analytics output
export type AnalyticsOutput = {
	days: DailyKpis[];
	total: {
		reviews_completed: number;
		average_quality: number; // 0..5
		new_chunks_learned: number;
		streak_days: number;
	};
	breakdowns?: {
		by_topic?: Record<string, { reviews_completed: number; average_quality: number }>;
		by_tag?: Record<string, { reviews_completed: number; average_quality: number }>;
	};
};

// Zod schemas for runtime validation

export const ReviewEntrySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	quality: z.number().min(0).max(5).optional().default(0),
	isNew: z.boolean().optional().default(false),
	topic: z.string().optional(),
	tags: z.array(z.string()).optional().default([]),
});

export const AnalyticsInputSchema = z.object({
	entries: z.array(ReviewEntrySchema),
});

export const WindowSpecSchema = z.object({
	start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
	end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
});

export const DailyKpisSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	reviews_completed: z.number().min(0),
	average_quality: z.number().min(0).max(5),
	new_chunks_learned: z.number().min(0),
	streak_days: z.number().min(0).optional(),
});

export const AnalyticsOutputSchema = z.object({
	days: z.array(DailyKpisSchema),
	total: z.object({
		reviews_completed: z.number().min(0),
		average_quality: z.number().min(0).max(5),
		new_chunks_learned: z.number().min(0),
		streak_days: z.number().min(0),
	}),
	breakdowns: z.object({
		by_topic: z.record(z.string(), z.object({
			reviews_completed: z.number().min(0),
			average_quality: z.number().min(0).max(5),
		})).optional(),
		by_tag: z.record(z.string(), z.object({
			reviews_completed: z.number().min(0),
			average_quality: z.number().min(0).max(5),
		})).optional(),
	}).optional(),
});