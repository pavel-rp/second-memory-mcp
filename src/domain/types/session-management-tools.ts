import { z } from 'zod';
import { SessionModeSchema, SessionInputSchema } from './session.js';

// Input schemas for session management tools

export const CreateSessionToolInputShape = {
  topicId: z.string().optional(),
  chunkIds: z.array(z.string()).optional(),
  mode: SessionModeSchema,
  estimatedDuration: z.number().min(1).max(480).optional(), // 1-480 minutes
} as const;

export const CreateSessionToolInputSchema = z.object(CreateSessionToolInputShape);

export const CompleteSessionInputShape = {
  sessionId: z.string().min(1),
  feedback: z.string().optional(),
} as const;

export const CompleteSessionInputSchema = z.object(CompleteSessionInputShape);

export const GetSessionInputShape = {
  sessionId: z.string().min(1).optional(), // Optional for get_active_session
} as const;

export const GetSessionInputSchema = z.object(GetSessionInputShape);

export const CreateSessionChunkToolInputShape = {
  sessionId: z.string().min(1),
  chunkId: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  attempts: z
    .array(
      z.object({
        timestamp: z.number(),
        quality: z.number().min(0).max(5).optional(),
        timeSpentMs: z.number().min(0),
        completed: z.boolean(),
      })
    )
    .optional(),
  qualityScores: z.array(z.number().min(0).max(5)).optional(),
  timeSpentMs: z.number().min(0).default(0),
} as const;

export const CreateSessionChunkToolInputSchema = z.object(CreateSessionChunkToolInputShape);

// Result schemas for session management tools

export const CreateSessionResultSchema = z.object({
  sessionId: z.string(),
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
  sessionId: z.string(),
  status: z.literal('completed'),
  finalMetrics: z.object({
    duration: z.number(),
    chunksCompleted: z.number(),
    averageQuality: z.number(),
  }),
  message: z.string(),
});
export type CompleteSessionResult = z.infer<typeof CompleteSessionResultSchema>;
