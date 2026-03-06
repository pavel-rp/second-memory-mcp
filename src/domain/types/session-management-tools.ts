import { z } from 'zod';
import { SessionModeSchema, SessionInputSchema } from './session.js';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

// Input schemas for session management tools

export const CreateSessionToolInputShape = {
  topic_id: z.string().optional(),
  chunk_ids: z.array(z.string()).optional(),
  mode: SessionModeSchema,
  estimated_duration: z.number().min(1).max(480).optional(), // 1-480 minutes
} as const;

export const CreateSessionToolInputSchema = z
  .object(CreateSessionToolInputShape)
  .transform(toCamelCaseKeys);

export const CompleteSessionInputShape = {
  session_id: z.string().min(1),
  feedback: z.string().optional(),
} as const;

export const CompleteSessionInputSchema = z
  .object(CompleteSessionInputShape)
  .transform(toCamelCaseKeys);

export const GetSessionByIdInputShape = {
  session_id: z.string().min(1),
} as const;

export const GetSessionByIdInputSchema = z
  .object(GetSessionByIdInputShape)
  .transform(toCamelCaseKeys);

export const CreateSessionChunkToolInputShape = {
  session_id: z.string().min(1),
  chunk_id: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  attempts: z
    .array(
      z.object({
        timestamp: z.number(),
        quality: z.number().min(0).max(5).optional(),
        time_spent_ms: z.number().min(0),
        completed: z.boolean(),
      })
    )
    .optional(),
  quality_scores: z.array(z.number().min(0).max(5)).optional(),
  time_spent_ms: z.number().min(0).default(0),
} as const;

export const CreateSessionChunkToolInputSchema = z
  .object(CreateSessionChunkToolInputShape)
  .transform(toCamelCaseKeys);

// Result schemas for session management tools

export const CreateSessionResultSchema = z.object({
  session_id: z.string(),
  status: z.literal('created'),
  message: z.string(),
});
export type CreateSessionResult = z.infer<typeof CreateSessionResultSchema>;

export const GetActiveSessionResultSchema = z.object({
  session: SessionInputSchema.nullable(),
  status: z.enum(['found', 'not_found']),
});
export type GetActiveSessionResult = z.infer<typeof GetActiveSessionResultSchema>;

export const CompleteSessionResultSchema = z.object({
  session_id: z.string(),
  status: z.literal('completed'),
  final_metrics: z.object({
    duration: z.number(),
    chunks_completed: z.number(),
    average_quality: z.number(),
  }),
  message: z.string(),
});
export type CompleteSessionResult = z.infer<typeof CompleteSessionResultSchema>;
