import { z } from 'zod';

// Session mode types
export type SessionMode = 'scaffolding' | 'learning' | 'retrieval' | 'review';

// Chunk attempt record
export type ChunkAttempt = {
  timestamp: string; // ISO timestamp
  quality?: number; // 0-5 quality rating
  time_spent_ms: number;
  completed: boolean;
};

// Session chunk progress
export type SessionChunk = {
  chunk_id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  attempts: ChunkAttempt[];
  quality_scores: number[]; // 0-5 quality ratings
  time_spent_ms: number;
};

// Main session input data
export type SessionInput = {
  session_id: string;
  mode: SessionMode;
  start_time: string; // ISO timestamp
  current_time?: string; // ISO timestamp (defaults to now)
  chunks: SessionChunk[];
  context?: Record<string, unknown>; // optional session metadata
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

// Workflow phase information
export type WorkflowPhase = {
  current_phase: string;
  next_phase?: string;
  phase_progress: number; // 0-1 progress within current phase
  guidance: string; // next step instructions
  can_advance: boolean;
};

// Session completion status
export type CompletionStatus = {
  is_complete: boolean;
  completion_reason: string;
  quality_threshold_met: boolean;
  time_threshold_met: boolean;
  chunk_threshold_met: boolean;
  recommendation: 'continue' | 'complete' | 'break';
};

// Zod schemas for runtime validation

export const SessionModeSchema = z.enum(['scaffolding', 'learning', 'retrieval', 'review']);

export const ChunkAttemptSchema = z.object({
  timestamp: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/,
      'Timestamp must be in ISO format'
    ),
  quality: z.number().min(0).max(5).optional(),
  time_spent_ms: z.number().min(0),
  completed: z.boolean(),
});

export const SessionChunkSchema = z.object({
  chunk_id: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']),
  attempts: z.array(ChunkAttemptSchema),
  quality_scores: z.array(z.number().min(0).max(5)),
  time_spent_ms: z.number().min(0),
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
});

export const SessionProgressSchema = z.object({
  session_id: z.string().min(1),
  overall_progress: z.number().min(0).max(1),
  chunks_completed: z.number().min(0),
  total_chunks: z.number().min(0),
  average_quality: z.number().min(0).max(5),
  time_elapsed_ms: z.number().min(0),
  estimated_time_remaining_ms: z.number().min(0).optional(),
});

export const WorkflowPhaseSchema = z.object({
  current_phase: z.string().min(1),
  next_phase: z.string().min(1).optional(),
  phase_progress: z.number().min(0).max(1),
  guidance: z.string().min(1),
  can_advance: z.boolean(),
});

export const CompletionStatusSchema = z.object({
  is_complete: z.boolean(),
  completion_reason: z.string().min(1),
  quality_threshold_met: z.boolean(),
  time_threshold_met: z.boolean(),
  chunk_threshold_met: z.boolean(),
  recommendation: z.enum(['continue', 'complete', 'break']),
});

// Batch update types and schemas

export type BatchOperation = {
  chunkId: string;
  title?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  attempts?: ChunkAttempt[];
  qualityScores?: number[];
  timeSpentMs?: number;
};

export type BatchUpdateInput = {
  sessionId: string;
  operations: BatchOperation[];
};

export const BatchOperationSchema = z.object({
  chunkId: z.string().min(1),
  title: z.string().min(1).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  attempts: z.array(ChunkAttemptSchema).optional(),
  qualityScores: z.array(z.number().min(0).max(5)).optional(),
  timeSpentMs: z.number().min(0).optional(),
});

export const BatchUpdateInputSchema = z.object({
  sessionId: z.string().min(1),
  operations: z.array(BatchOperationSchema).min(1).max(50),
});
