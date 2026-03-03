import { z } from 'zod';

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

const ReviewEntryShape = {
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .describe('Review date in YYYY-MM-DD format'),
  quality: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .default(0)
    .describe('Quality score for the review (0-5)'),
  is_new: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether this entry represents a new learning item'),
  topic: z.string().optional().describe('Optional topic label for the review'),
  tags: z
    .array(z.string())
    .optional()
    .default([])
    .describe('Optional tags associated with the review'),
} as const;

export const ReviewEntrySchema = z.object(ReviewEntryShape);

const AnalyticsInputShape = {
  entries: z.array(ReviewEntrySchema).describe('Review entries used to compute analytics'),
} as const;

export const AnalyticsInputSchema = z.object(AnalyticsInputShape);

const WindowSpecShape = {
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .describe('Window start date (YYYY-MM-DD)'),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .describe('Window end date (YYYY-MM-DD)'),
} as const;

export const WindowSpecSchema = z.object(WindowSpecShape);

export const AnalyticsDailyInputShape = {
  entries: z.array(ReviewEntrySchema).describe('Review entries for a single day'),
} as const;

export const AnalyticsDailyInputSchema = z.object(AnalyticsDailyInputShape);
export type AnalyticsDailyInput = z.infer<typeof AnalyticsDailyInputSchema>;

export const AnalyticsWindowInputShape = {
  entries: z.array(ReviewEntrySchema).describe('Review entries across the requested window'),
  window: WindowSpecSchema.describe('Date range window to analyze'),
  include_breakdowns: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include topic/tag breakdowns in the analytics output'),
} as const;

export const AnalyticsWindowInputSchema = z.object(AnalyticsWindowInputShape);
export type AnalyticsWindowInput = z.infer<typeof AnalyticsWindowInputSchema>;

export const DailyKpisSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
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
  breakdowns: z
    .object({
      by_topic: z
        .record(
          z.string(),
          z.object({
            reviews_completed: z.number().min(0),
            average_quality: z.number().min(0).max(5),
          })
        )
        .optional(),
      by_tag: z
        .record(
          z.string(),
          z.object({
            reviews_completed: z.number().min(0),
            average_quality: z.number().min(0).max(5),
          })
        )
        .optional(),
    })
    .optional(),
});
