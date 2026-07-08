import { z } from 'zod';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

export const CalculateNextReviewInputShape = {
  quality: z
    .number()
    .min(0)
    .max(5)
    .describe(
      'SM-2 quality score 0-5. 0-2 = failed recall (resets interval), ' +
        '3 = correct with difficulty, 4-5 = confident correct. ' +
        "Do NOT hardcode or guess — derive from the learner's actual response."
    ),
  repetitions: z.number().int().min(0).describe('Number of successful repetitions completed'),
  ease_factor: z.number().min(1.3).describe('Current ease factor for the learning item'),
  interval: z.number().int().min(0).describe('Current review interval in days'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const CalculateNextReviewInputSchema = z
  .object(CalculateNextReviewInputShape)
  .transform(toCamelCaseKeys);

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
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const CalculatePriorityScoreInputSchema = z
  .object(CalculatePriorityScoreInputShape)
  .transform(toCamelCaseKeys);

export const CalculateNextReviewAdvancedInputShape = {
  quality: z
    .number()
    .min(0)
    .max(5)
    .describe(
      'SM-2 quality score 0-5. 0-2 = failed recall (resets interval), ' +
        '3 = correct with difficulty, 4-5 = confident correct. ' +
        "Do NOT hardcode or guess — derive from the learner's actual response."
    ),
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
  total_attempts: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Lifetime count of graded attempts on this item. Gates leech flagging: an ' +
        'item is not flagged a leech until it has been attempted at least ' +
        'leechFailureThreshold times, even at the consecutive-failure threshold. ' +
        'Omit (defaults to 0) to keep the leech gate closed.'
    ),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const CalculateNextReviewAdvancedInputSchema = z
  .object(CalculateNextReviewAdvancedInputShape)
  .transform(toCamelCaseKeys);

const RankCandidateShape = {
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

export const RankCandidatesInputShape = {
  candidates: z
    .array(z.object(RankCandidateShape))
    .describe('Learning items to rank for review priority'),
  timebox_minutes: z
    .number()
    .int()
    .optional()
    .describe('Optional timebox limit for the review session (minutes)'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const RankCandidatesInputSchema = z
  .object(RankCandidatesInputShape)
  .transform(toCamelCaseKeys);

export const GetLeechesInputShape = {
  subject_filter: z.string().optional().describe('Optional subject filter for leech items'),
  limit: z.number().int().positive().optional().describe('Maximum number of leech items to return'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const GetLeechesInputSchema = z.object(GetLeechesInputShape).transform(toCamelCaseKeys);

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
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const ResolveLeechInputSchema = z.object(ResolveLeechInputShape).transform(toCamelCaseKeys);
