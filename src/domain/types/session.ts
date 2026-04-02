import { z } from 'zod';
import { toCamelCaseKeys, toCamelCaseKeysExcept } from '../../shared/case-convert.js';

// Session mode types
export type SessionMode = 'scaffolding' | 'learning' | 'retrieval' | 'review' | 'assessment';

// Chunk attempt record
export type ChunkAttempt = {
  timestamp: string; // ISO timestamp
  question: string; // the drill question asked
  response: string; // the learner's answer
  passed: boolean; // agent's pass/fail judgment
  feedback: string; // agent's explanation of why right/wrong
  quality?: number; // 0-5 quality rating; omitted for unscored retry attempts
  time_spent_ms: number;
};

// Session chunk progress
export type SessionChunk = {
  chunk_id: string;
  session_chunk_id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  attempts: ChunkAttempt[];
  /** @deprecated Deprecated for new writes; will be removed once analytics derives quality from attempts[].quality. */
  quality_scores: number[]; // 0-5 quality ratings
  time_spent_ms: number;
  // Optional SM-2 metadata from learning_chunks (populated by convertSessionToSessionInput)
  repetitions?: number;
  ease_factor?: number;
  next_review_date?: string; // ISO 8601 timestamp
  subject?: string;
  difficulty?: number; // 1-10
  estimated_duration?: number; // minutes
  chunk_type?: 'new' | 'review' | 'remediation';
};

// Historical feedback from previous sessions on same chunks
export type HistoricalFeedback = {
  session_id: string;
  session_mode: SessionMode;
  completed_at: string; // ISO timestamp
  feedback: string;
  chunk_ids: string[]; // which chunks this feedback relates to
};

// Main session input data
export type SessionInput = {
  session_id: string;
  mode: SessionMode;
  start_time: string; // ISO timestamp
  current_time?: string; // ISO timestamp (defaults to now)
  chunks: SessionChunk[];
  context?: Record<string, unknown>; // optional session metadata
  feedback?: string; // current session feedback (if completed)
  historical_feedback?: HistoricalFeedback[]; // feedback from past sessions on same chunks
};

// Session progress output
export type SessionProgress = {
  session_id: string;
  overall_progress: number; // 0-1 completion percentage
  chunks_completed: number;
  total_chunks: number;
  average_quality: number; // 0-5
  time_elapsed_ms: number;
  estimated_time_remaining_ms?: number;
};

// Unified session status (replaces WorkflowPhase + CompletionStatus)
export type SessionStatus = {
  sessionId: string;
  chunksCompleted: number;
  chunksRemaining: number;
  overallProgress: number; // 0-1
  averageQuality: number; // 0-5
  timeElapsedMs: number;
  shouldComplete: boolean;
  reason: string;
  recommendation: 'continue' | 'complete' | 'break';
};

// Zod schemas for runtime validation

export const SessionModeSchema = z.enum([
  'scaffolding',
  'learning',
  'retrieval',
  'review',
  'assessment',
]);

// Normalize legacy attempts: map `completed` → `passed`, default missing fields
function normalizeLegacyAttempt(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data;
  const d = data as Record<string, unknown>;
  if ('completed' in d && !('passed' in d)) {
    const { completed, ...rest } = d;
    return { ...rest, passed: completed };
  }
  return d;
}

export const ChunkAttemptSchema = z.preprocess(
  normalizeLegacyAttempt,
  z.object({
    timestamp: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/,
        'Timestamp must be in ISO format'
      ),
    question: z.string().default(''),
    response: z.string().default(''),
    passed: z.boolean().default(false),
    feedback: z.string().default(''),
    quality: z.number().min(0).max(5).optional(),
    time_spent_ms: z.number().min(0),
  })
);

export const SessionChunkSchema = z.object({
  chunk_id: z.string().min(1),
  session_chunk_id: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']),
  attempts: z.array(ChunkAttemptSchema),
  quality_scores: z.array(z.number().min(0).max(5)),
  time_spent_ms: z.number().min(0),
  repetitions: z.number().int().min(0).optional(),
  ease_factor: z.number().min(1.3).optional(),
  next_review_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/, 'Must be ISO 8601 timestamp')
    .optional(),
  subject: z.string().optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
  estimated_duration: z.number().min(0).optional(),
  chunk_type: z.enum(['new', 'review', 'remediation']).optional(),
});

const HistoricalFeedbackSchema = z.object({
  session_id: z.string().min(1),
  session_mode: SessionModeSchema,
  completed_at: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/,
      'Completed at must be in ISO format'
    ),
  feedback: z.string().min(1),
  chunk_ids: z.array(z.string().min(1)),
});

export const SessionInputSchema = z.object({
  session_id: z.string().min(1),
  mode: SessionModeSchema,
  start_time: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/,
      'Start time must be in ISO format'
    ),
  current_time: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/,
      'Current time must be in ISO format'
    )
    .optional(),
  chunks: z.array(SessionChunkSchema),
  context: z.record(z.unknown()).optional(),
  feedback: z.string().optional(),
  historical_feedback: z.array(HistoricalFeedbackSchema).optional(),
});

// Batch update types and schemas

export type BatchOperation = {
  chunkId: string;
  title?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  timeSpentMs?: number;
};

const BatchOperationShape = {
  chunk_id: z.string().min(1),
  title: z.string().min(1).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  time_spent_ms: z.number().min(0).optional(),
} as const;

const BatchOperationSchema = z.object(BatchOperationShape).transform(toCamelCaseKeys);

export const BatchUpdateInputShape = {
  session_id: z.string().min(1),
  operations: z.array(z.object(BatchOperationShape)).min(1).max(50),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const BatchUpdateInputSchema = z
  .object({
    ...BatchUpdateInputShape,
    operations: z.array(BatchOperationSchema).min(1).max(50),
  })
  .transform(toCamelCaseKeysExcept(new Set(['operations'])));
