import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../../shared/constants/validation.js';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

export const CalculateNextReviewInputShape = {
  quality: z.number().min(0).max(5).describe('Quality score from the latest review (0-5)'),
  repetitions: z.number().int().min(0).describe('Number of successful repetitions completed'),
  ease_factor: z.number().min(1.3).describe('Current ease factor for the learning item'),
  interval: z.number().int().min(0).describe('Current review interval in days'),
} as const;

export const CalculateNextReviewInputSchema = z
  .object(CalculateNextReviewInputShape)
  .transform(toCamelCaseKeys);
export type CalculateNextReviewInput = z.infer<typeof CalculateNextReviewInputSchema>;

export const CalculatePriorityScoreInputShape = {
  next_review_date: z.string().describe('Upcoming review date in ISO format (YYYY-MM-DD)'),
  ease_factor: z.number().min(1.3).describe('Ease factor used for scheduling'),
  repetitions: z.number().int().min(0).describe('Total successful repetitions completed'),
  difficulty: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe('Difficulty rating for the learning item (1-10)'),
} as const;

export const CalculatePriorityScoreInputSchema = z
  .object(CalculatePriorityScoreInputShape)
  .transform(toCamelCaseKeys);
export type CalculatePriorityScoreInput = z.infer<typeof CalculatePriorityScoreInputSchema>;

export const CalculateNextReviewAdvancedInputShape = {
  quality: z.number().min(0).max(5).describe('Quality score from the latest review (0-5)'),
  repetitions: z.number().int().min(0).describe('Number of successful repetitions completed'),
  ease_factor: z.number().min(1.3).describe('Current ease factor for the learning item'),
  interval: z.number().int().min(0).describe('Current review interval in days'),
  days_overdue: z.number().int().min(0).optional().describe('Days past the scheduled review date'),
  consecutive_failures: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Number of consecutive failed reviews'),
} as const;

export const CalculateNextReviewAdvancedInputSchema = z
  .object(CalculateNextReviewAdvancedInputShape)
  .transform(toCamelCaseKeys);
export type CalculateNextReviewAdvancedInput = z.infer<
  typeof CalculateNextReviewAdvancedInputSchema
>;

export const RankCandidateShape = {
  id: z.string().describe('Unique identifier for the learning item'),
  next_review_date: z.string().describe('Scheduled review date in ISO format (YYYY-MM-DD)'),
  ease_factor: z.number().min(1.3).describe('Current ease factor for the learning item'),
  repetitions: z.number().int().min(0).describe('Total number of successful repetitions'),
  difficulty: z.number().int().min(1).max(10).describe('Difficulty rating (1-10)'),
  tags: z.array(z.string()).optional().describe('Optional tag metadata for the item'),
  estimated_duration: z
    .number()
    .int()
    .min(1)
    .max(120, 'Estimated duration cannot exceed 120 minutes')
    .optional()
    .describe('Estimated study duration in minutes'),
} as const;

export const RankCandidateSchema = z.object(RankCandidateShape).transform(toCamelCaseKeys);

export const RankCandidatesInputShape = {
  candidates: z.array(RankCandidateSchema).describe('Learning items to rank for review priority'),
  timebox_minutes: z
    .number()
    .int()
    .optional()
    .describe('Optional timebox limit for the review session (minutes)'),
} as const;

export const RankCandidatesInputSchema = z
  .object(RankCandidatesInputShape)
  .transform(toCamelCaseKeys);
export type RankCandidatesInput = z.infer<typeof RankCandidatesInputSchema>;

export const RecordReviewResultInputShape = {
  item_id: z
    .string()
    .min(1, 'Item ID cannot be empty')
    .describe('ID of the learning item being reviewed'),
  quality: z
    .number()
    .min(
      VALIDATION_CONSTANTS.MIN_QUALITY_SCORE,
      `Quality score must be at least ${VALIDATION_CONSTANTS.MIN_QUALITY_SCORE}`
    )
    .max(
      VALIDATION_CONSTANTS.MAX_QUALITY_SCORE,
      `Quality score cannot exceed ${VALIDATION_CONSTANTS.MAX_QUALITY_SCORE}`
    )
    .describe('Quality score from the review attempt (0-5)'),
  time_spent_ms: z
    .number()
    .int('Time spent must be an integer')
    .min(0, 'Time spent cannot be negative')
    .optional()
    .default(0)
    .describe('Time spent studying in milliseconds'),
  consecutive_failures: z
    .number()
    .int('Consecutive failures must be an integer')
    .min(0, 'Consecutive failures cannot be negative')
    .optional()
    .default(0)
    .describe('Number of consecutive failures for this item'),
  days_overdue: z
    .number()
    .int('Days overdue must be an integer')
    .min(0, 'Days overdue cannot be negative')
    .optional()
    .default(0)
    .describe('Days past the scheduled review date'),
} as const;

export const RecordReviewResultInputSchema = z
  .object(RecordReviewResultInputShape)
  .transform(toCamelCaseKeys);
export type RecordReviewResultInput = z.infer<typeof RecordReviewResultInputSchema>;

export const GetLeechesInputShape = {
  subject_filter: z.string().optional().describe('Optional subject filter for leech items'),
  limit: z.number().int().positive().optional().describe('Maximum number of leech items to return'),
} as const;

export const GetLeechesInputSchema = z.object(GetLeechesInputShape).transform(toCamelCaseKeys);
export type GetLeechesInput = z.infer<typeof GetLeechesInputSchema>;

export const ResolveLeechInputShape = {
  chunk_id: z
    .string()
    .min(1, 'Chunk ID cannot be empty')
    .describe('ID of the leech chunk to resolve'),
  resolution: z
    .enum(['reset_progress', 'archive', 'mark_reviewed'])
    .describe(
      'Resolution strategy: reset_progress resets SR progress, archive moves to far future, mark_reviewed clears leech flag only'
    ),
} as const;

export const ResolveLeechInputSchema = z.object(ResolveLeechInputShape).transform(toCamelCaseKeys);
export type ResolveLeechInput = z.infer<typeof ResolveLeechInputSchema>;
