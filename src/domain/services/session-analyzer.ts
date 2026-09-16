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
import type { FatigueAttempt } from '../algorithms/fatigue-trend.js';
import type { SessionAdvisory } from '../algorithms/session-advisory.js';
import { resolveSessionAdvisory } from '../algorithms/session-advisory.js';
import { computeActiveTime, findSittingBoundaryTimestamp } from '../algorithms/active-time.js';

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
 * Flatten `sessionData.chunks[].attempts[]` into the shared fatigue
 * resolver's attempt shape.
 *
 * `convertSessionToSessionInput` (`src/adapters/drizzle/session-repository.ts:192-284`)
 * attaches a multi-chunk (assessment) question's attempts to *every* chunk
 * it maps to, so a naive flatten would count the same attempt more than
 * once and skew the trend. `ChunkAttempt` carries no attempt id, so
 * de-duplication uses the composite key `timestamp + question + response`:
 * the same underlying attempt reattached to a second chunk carries the same
 * timestamp, question text, and response text every time, while two
 * genuinely distinct attempts essentially never collide on all three at
 * once. Quality maps through as `attempt.quality ?? null` — `quality` is
 * omitted for unscored retry attempts, and the resolver treats `null` as
 * "not scored" rather than a real 0.
 */
function toDeduplicatedFatigueAttempts(chunks: SessionChunk[]): FatigueAttempt[] {
  const seen = new Set<string>();
  const attempts: FatigueAttempt[] = [];

  for (const chunk of chunks) {
    for (const attempt of chunk.attempts) {
      const dedupeKey = `${attempt.timestamp} ${attempt.question} ${attempt.response}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      attempts.push({
        timestamp: new Date(attempt.timestamp).getTime(),
        quality: attempt.quality ?? null,
      });
    }
  }

  return attempts;
}

/**
 * Flatten `sessionData.chunks[].attempts[]` into raw epoch-ms timestamps for
 * the sitting active-time computation (NEU-1016). Unlike
 * `toDeduplicatedFatigueAttempts`, exact duplicates (the same underlying
 * attempt reattached to multiple chunks in a multi-chunk assessment question)
 * are harmless here — a duplicate timestamp inserts a zero-length gap that
 * contributes nothing to `computeActiveTime`'s sum — so no dedup key is
 * needed.
 */
function toAttemptTimestamps(chunks: SessionChunk[]): number[] {
  return chunks.flatMap(chunk =>
    chunk.attempts.map(attempt => new Date(attempt.timestamp).getTime())
  );
}

/**
 * Calculate session progress metrics from session input data.
 *
 * `activeTimeMs` (NEU-1020) is optional: when the caller supplies it (the
 * current sitting's gap-based active time — `active-time.ts`), the pace
 * estimate (`estimated_time_remaining_ms`) is computed from it instead of
 * wall-clock `time_elapsed_ms`. When omitted, the estimate falls back to the
 * prior wall-clock pace calculation (used by direct callers that have no
 * active-time figure). `time_elapsed_ms` itself always stays wall-clock and
 * is always reported, regardless of which basis drove the estimate.
 */
export function calculateSessionProgress(
  sessionData: SessionInput,
  now: Date,
  activeTimeMs?: number
): SessionProgress {
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

  // Estimate remaining time based on current pace. NEU-1020: when the caller
  // supplies the sitting's active time, pace is derived from it rather than
  // wall-clock elapsed time; otherwise fall back to the wall-clock estimate.
  let estimatedTimeRemainingMs: number | undefined;
  if (chunksCompleted > 0 && totalChunks > chunksCompleted) {
    const remainingChunks = totalChunks - chunksCompleted;
    if (typeof activeTimeMs === 'number') {
      estimatedTimeRemainingMs = Math.round((activeTimeMs / chunksCompleted) * remainingChunks);
    } else if (timeElapsedMs > 0) {
      const averageTimePerChunk = timeElapsedMs / chunksCompleted;
      estimatedTimeRemainingMs = Math.round(averageTimePerChunk * remainingChunks);
    }
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
    chunkMet: boolean;
  },
  advisory: SessionAdvisory | null,
  activeTimeMs: number
): { shouldComplete: boolean; reason: string; recommendation: 'continue' | 'complete' | 'break' } {
  // NEU-1043 (restoring pre-NEU-1016 precedence): a resolved advisory always wins
  // over the quality/chunk-completion branches below. Before NEU-1020 removed the
  // wall-clock `maxTimeExceeded` check, that check ran first and forced `break`
  // even when quality+chunk thresholds were also met — a fatigued or over-ceiling
  // learner should be told to stop rather than congratulated. `resolveSessionAdvisory`
  // already resolves at most one advisory (fatigue takes precedence over the
  // ceiling), so any non-null advisory here is the one signal to relay, checked
  // before either completion branch.
  if (advisory) {
    return {
      shouldComplete: true,
      reason: advisory.reason,
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
  // NEU-1020: rebased on the current sitting's active time (gap-based, never
  // wall-clock) rather than `progress.time_elapsed_ms`, so a session resumed
  // after a multi-day idle gap is judged on real learning time, not on how
  // long the arc has been open.
  if (progress.overall_progress < 0.3 && activeTimeMs < 30 * 60 * 1000) {
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
  const config = algorithmConfig.sessionConfig;

  // NEU-1016/NEU-1020: the sitting's active time AND boundary — gap-based
  // over this session's recorded teach-event timestamps merged with its
  // attempt timestamps. Never wall-clock elapsed time, and nothing is
  // credited after the last event: a `session_status` call made hours after
  // the last event adds no active time of its own (this function never
  // appends "now" to the series). Computed BEFORE `calculateSessionProgress`
  // so the sitting-based pace estimate can use it, and before
  // `evaluateCompletionCriteria` so the beginning-branch check can use it too.
  const mergedTimestamps = [
    ...toAttemptTimestamps(sessionData.chunks),
    ...(sessionData.teach_event_timestamps ?? []),
  ];
  const activeTimeMs = computeActiveTime({
    timestamps: mergedTimestamps,
    idleCutoffMs: config.idleCutoffMs,
  }).activeTimeMs;
  const sittingBoundary = findSittingBoundaryTimestamp({
    timestamps: mergedTimestamps,
    idleCutoffMs: config.idleCutoffMs,
  });

  const progress = calculateSessionProgress(sessionData, now, activeTimeMs);

  // NEU-1020: fatigue is judged on the current sitting only — filter the
  // deduplicated attempt population to timestamp >= the sitting boundary
  // before handing it to the shared resolver, and thread the configured
  // fatigue window size through.
  const dedupedAttempts = toDeduplicatedFatigueAttempts(sessionData.chunks);
  const sittingAttempts =
    sittingBoundary === null
      ? dedupedAttempts
      : dedupedAttempts.filter(a => a.timestamp >= sittingBoundary);

  const advisory = resolveSessionAdvisory({
    attempts: sittingAttempts,
    activeTimeMs,
    activeTimeCeilingMs: config.activeTimeCeilingMs,
    fatigueWindowSize: config.fatigueWindowSize,
  });

  const { shouldComplete, reason, recommendation } = evaluateCompletionCriteria(
    progress,
    {
      qualityMet: progress.average_quality >= config.qualityThreshold,
      chunkMet: progress.overall_progress >= config.completionThreshold,
    },
    advisory,
    activeTimeMs
  );

  return {
    sessionId: progress.session_id,
    chunksCompleted: progress.chunks_completed,
    chunksRemaining: progress.total_chunks - progress.chunks_completed,
    overallProgress: progress.overall_progress,
    averageQuality: progress.average_quality,
    timeElapsedMs: progress.time_elapsed_ms,
    shouldComplete,
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
