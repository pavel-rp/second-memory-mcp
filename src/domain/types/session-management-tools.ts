import { z } from 'zod';
import { SessionModeSchema, SessionInputSchema } from './session.js';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

// Input schemas for session management tools

export const SessionStatusInputShape = {
  session_id: z.string().min(1),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const SessionStatusInputSchema = z
  .object(SessionStatusInputShape)
  .transform(toCamelCaseKeys);

export const CreateSessionToolInputShape = {
  topic_id: z.string().optional(),
  chunk_ids: z.array(z.string()).optional(),
  mode: SessionModeSchema.describe(
    "Session mode: 'scaffolding' = guided intro to new material, " +
      "'learning' = active study of new chunks, " +
      "'retrieval' = spaced recall practice, " +
      "'review' = revisit previously learned material, " +
      "'assessment' = cross-chunk topic-level evaluation (requires chunk_ids). " +
      "Use 'learning' if unsure."
  ),
  estimated_duration: z.number().min(1).max(480).optional(), // 1-480 minutes
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const CreateSessionToolInputSchema = z
  .object(CreateSessionToolInputShape)
  .transform(toCamelCaseKeys);

export const CompleteSessionInputShape = {
  session_id: z.string().min(1),
  feedback: z.string().optional(),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const CompleteSessionInputSchema = z
  .object(CompleteSessionInputShape)
  .transform(toCamelCaseKeys);

export const GetSessionByIdInputShape = {
  session_id: z.string().min(1),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const GetSessionByIdInputSchema = z
  .object(GetSessionByIdInputShape)
  .transform(toCamelCaseKeys);

export const CreateSessionChunkToolInputShape = {
  session_id: z.string().min(1),
  chunk_id: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  time_spent_ms: z.number().min(0).default(0),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
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

export const GetActiveSessionResultSchema = z.object({
  session: SessionInputSchema.nullable(),
  status: z.enum(['found', 'not_found']),
});

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
