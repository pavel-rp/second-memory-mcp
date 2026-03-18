import type {
  SessionInput,
  SessionChunk,
  SessionProgress,
  SessionStatus,
  BatchOperation,
} from '../types/session.js';
import { SessionInputSchema } from '../types/session.js';
import type { AlgorithmConfig } from '../config/algorithm.js';
import type { ServiceResult } from '../types/service-result.js';
import { serviceOk, serviceFail } from '../types/service-result.js';
import { clamp, roundTo } from '../../shared/math.js';

// Helper function to parse ISO timestamp
function parseTimestamp(timestamp: string, fallback: Date): Date {
  const parsed = new Date(timestamp);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}

// Helper function to clamp quality values to valid range
function clampQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 0;
  return clamp(quality, 0, 5);
}

// Helper function to calculate time elapsed between timestamps
function calculateTimeElapsed(startTime: string, now: Date, currentTime?: string): number {
  const start = parseTimestamp(startTime, now);
  const current = currentTime ? parseTimestamp(currentTime, now) : now;
  return Math.max(0, current.getTime() - start.getTime());
}

// Helper function to validate and clean session chunks
// Legacy normalization (completed → passed, missing fields) is handled by ChunkAttemptSchema
function cleanSessionChunks(chunks: SessionChunk[]): SessionChunk[] {
  return chunks.map(chunk => ({
    ...chunk,
    attempts: chunk.attempts.map(attempt => ({
      ...attempt,
      quality: clampQuality(attempt.quality ?? 0),
      time_spent_ms: Math.max(0, attempt.time_spent_ms || 0),
    })),
    quality_scores: chunk.quality_scores.map(score => clampQuality(score)),
    time_spent_ms: Math.max(0, chunk.time_spent_ms || 0),
  }));
}

/**
 * Calculate session progress metrics from session input data
 */
export function calculateSessionProgress(sessionData: SessionInput, now: Date): SessionProgress {
  const cleanedChunks = cleanSessionChunks(sessionData.chunks);

  // Basic counts
  const totalChunks = cleanedChunks.length;
  const chunksCompleted = cleanedChunks.filter(chunk => chunk.status === 'completed').length;

  // Calculate overall progress
  const overallProgress = totalChunks > 0 ? chunksCompleted / totalChunks : 0;

  // Calculate average quality from all quality scores
  const allQualityScores = cleanedChunks.flatMap(chunk => chunk.quality_scores);
  const averageQuality =
    allQualityScores.length > 0
      ? allQualityScores.reduce((sum, score) => sum + score, 0) / allQualityScores.length
      : 0;

  // Calculate time elapsed
  const timeElapsedMs = calculateTimeElapsed(sessionData.start_time, now, sessionData.current_time);

  // Estimate remaining time based on current pace
  let estimatedTimeRemainingMs: number | undefined;
  if (chunksCompleted > 0 && totalChunks > chunksCompleted && timeElapsedMs > 0) {
    const averageTimePerChunk = timeElapsedMs / chunksCompleted;
    const remainingChunks = totalChunks - chunksCompleted;
    estimatedTimeRemainingMs = Math.round(averageTimePerChunk * remainingChunks);
  }

  return {
    session_id: sessionData.session_id,
    overall_progress: roundTo(overallProgress, 2),
    chunks_completed: chunksCompleted,
    total_chunks: totalChunks,
    average_quality: roundTo(averageQuality, 2),
    time_elapsed_ms: timeElapsedMs,
    estimated_time_remaining_ms: estimatedTimeRemainingMs,
  };
}

function evaluateCompletionCriteria(
  progress: SessionProgress,
  thresholds: {
    qualityMet: boolean;
    timeMet: boolean;
    chunkMet: boolean;
    maxTimeExceeded: boolean;
  }
): { shouldComplete: boolean; reason: string; recommendation: 'continue' | 'complete' | 'break' } {
  if (thresholds.maxTimeExceeded) {
    return {
      shouldComplete: true,
      reason: 'Maximum session time reached (2 hours). Take a break to maintain effectiveness.',
      recommendation: 'break',
    };
  }
  if (thresholds.qualityMet && thresholds.chunkMet) {
    return {
      shouldComplete: true,
      reason: 'Learning goals achieved with high quality performance.',
      recommendation: 'complete',
    };
  }
  if (thresholds.chunkMet) {
    return {
      shouldComplete: true,
      reason: 'Session objectives completed successfully.',
      recommendation: 'complete',
    };
  }
  if (thresholds.qualityMet && thresholds.timeMet) {
    return {
      shouldComplete: true,
      reason: 'High quality performance achieved with sufficient practice time.',
      recommendation: 'complete',
    };
  }
  if (thresholds.timeMet && progress.overall_progress >= 0.5) {
    return {
      shouldComplete: true,
      reason: 'Good progress made in extended session. Consider taking a break.',
      recommendation: 'break',
    };
  }
  if (progress.overall_progress < 0.3 && progress.time_elapsed_ms < 30 * 60 * 1000) {
    return {
      shouldComplete: false,
      reason: 'Session just beginning. Continue with current learning phase.',
      recommendation: 'continue',
    };
  }
  return {
    shouldComplete: false,
    reason: 'Session progressing normally. Continue with learning objectives.',
    recommendation: 'continue',
  };
}

/**
 * Get unified session status: progress metrics + completion evaluation
 */
export function getSessionStatus(
  sessionData: SessionInput,
  algorithmConfig: AlgorithmConfig,
  now: Date
): SessionStatus {
  const progress = calculateSessionProgress(sessionData, now);
  const config = algorithmConfig.sessionConfig;

  const { shouldComplete, reason, recommendation } = evaluateCompletionCriteria(progress, {
    qualityMet: progress.average_quality >= config.qualityThreshold,
    timeMet: progress.time_elapsed_ms >= config.timeThresholdMs,
    chunkMet: progress.overall_progress >= config.completionThreshold,
    maxTimeExceeded: progress.time_elapsed_ms >= config.maxTimeMs,
  });

  return {
    chunks_completed: progress.chunks_completed,
    chunks_remaining: progress.total_chunks - progress.chunks_completed,
    overall_progress: progress.overall_progress,
    average_quality: progress.average_quality,
    time_elapsed_ms: progress.time_elapsed_ms,
    should_complete: shouldComplete,
    reason,
    recommendation,
  };
}

/**
 * Validate and normalize session context data
 */
export function validateSessionContext(context: unknown, now: Date): ServiceResult<SessionInput> {
  // Use Zod to validate and parse the input
  const result = SessionInputSchema.safeParse(context);

  if (!result.success) {
    // Extract meaningful error information
    const errorMessages = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join('; ');

    return serviceFail({
      type: 'validation',
      message: `Invalid session context: ${errorMessages}`,
    });
  }

  const validatedData = result.data;

  // Apply defaults and normalization
  const normalizedData: SessionInput = {
    ...validatedData,
    current_time: validatedData.current_time || now.toISOString(),
    chunks: cleanSessionChunks(validatedData.chunks),
    context: validatedData.context || {},
  };

  // Additional business logic validation
  if (normalizedData.chunks.length === 0) {
    return serviceFail({ type: 'validation', message: 'Session must contain at least one chunk' });
  }

  // Validate time consistency
  const startTime = parseTimestamp(normalizedData.start_time, now);
  const currentTime = parseTimestamp(normalizedData.current_time || '', now);

  if (currentTime < startTime) {
    return serviceFail({ type: 'validation', message: 'Current time cannot be before start time' });
  }

  return serviceOk(normalizedData);
}

/**
 * Apply batch session chunk operations atomically.
 * Caller is responsible for validating chunk IDs, fetching session data,
 * and providing the persistence function.
 */
export async function applyBatchSessionChunkOperations(args: {
  sessionId: string;
  operations: BatchOperation[];
  maxOps?: number;
  activeSessionExists: boolean;
  persistFn: (args: { sessionId: string; operations: BatchOperation[] }) => Promise<{
    created: number;
    updated: number;
    unchanged: number;
    affectedChunkIds: string[];
  }>;
}): Promise<
  ServiceResult<{ created: number; updated: number; unchanged: number; affectedChunkIds: string[] }>
> {
  const { sessionId, operations, maxOps = 50, activeSessionExists, persistFn } = args;

  if (operations.length > maxOps) {
    return serviceFail({
      type: 'validation',
      message: `Too many operations: max ${maxOps} operations allowed`,
    });
  }

  if (!activeSessionExists) {
    return serviceFail({
      type: 'not_found',
      message: 'No active session found. Create a session first.',
    });
  }

  try {
    return serviceOk(await persistFn({ sessionId, operations }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Persistence operation failed';
    return serviceFail({ type: 'database', message });
  }
}
