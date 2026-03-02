import type {
  SessionInput,
  SessionChunk,
  SessionProgress,
  WorkflowPhase,
  CompletionStatus,
  BatchOperation,
} from '../types/session.js';
import { SessionInputSchema } from '../types/session.js';
import type { AlgorithmConfig } from '../config/algorithm.js';
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
function cleanSessionChunks(chunks: SessionChunk[]): SessionChunk[] {
  return chunks.map(chunk => ({
    ...chunk,
    attempts: chunk.attempts.map(attempt => ({
      ...attempt,
      quality: attempt.quality !== undefined ? clampQuality(attempt.quality) : undefined,
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

type PhaseInfo = {
  currentPhase: string;
  nextPhase?: string;
  phaseProgress: number;
  guidance: string;
  canAdvance: boolean;
};

function getScaffoldingPhase(progress: SessionProgress): PhaseInfo {
  if (progress.chunks_completed === 0) {
    return {
      currentPhase: 'problem_analysis',
      nextPhase: 'chunk_planning',
      phaseProgress: 0,
      guidance:
        'Begin by analyzing the learning problem and identifying key concepts to break down.',
      canAdvance: false,
    };
  }
  if (progress.overall_progress < 0.5) {
    return {
      currentPhase: 'chunk_planning',
      nextPhase: 'chunk_validation',
      phaseProgress: progress.overall_progress * 2,
      guidance:
        'Continue developing learning chunks. Ensure each chunk is digestible and has clear prerequisites.',
      canAdvance: progress.chunks_completed > 0,
    };
  }
  return {
    currentPhase: 'chunk_validation',
    phaseProgress: (progress.overall_progress - 0.5) * 2,
    guidance:
      'Review and validate the scaffolded chunks. Ensure proper sequence and cognitive load distribution.',
    canAdvance: progress.overall_progress >= 0.8,
  };
}

function getLearningPhase(progress: SessionProgress): PhaseInfo {
  if (progress.chunks_completed === 0) {
    return {
      currentPhase: 'prerequisite_check',
      nextPhase: 'content_presentation',
      phaseProgress: 0,
      guidance: 'Verify that prerequisite knowledge is in place before beginning new learning.',
      canAdvance: false,
    };
  }
  if (progress.overall_progress < 0.7) {
    return {
      currentPhase: 'content_presentation',
      nextPhase: 'comprehension_check',
      phaseProgress: progress.overall_progress / 0.7,
      guidance: 'Present learning content systematically. Build understanding step by step.',
      canAdvance: progress.average_quality >= 3,
    };
  }
  return {
    currentPhase: 'comprehension_check',
    phaseProgress: (progress.overall_progress - 0.7) / 0.3,
    guidance:
      'Verify comprehension through practice and assessment. Ensure solid understanding before proceeding.',
    canAdvance: progress.average_quality >= 4,
  };
}

function getRetrievalPhase(progress: SessionProgress): PhaseInfo {
  if (progress.chunks_completed === 0) {
    return {
      currentPhase: 'retrieval_setup',
      nextPhase: 'first_attempt',
      phaseProgress: 0,
      guidance:
        'Prepare for retrieval practice. Review the two-attempt policy and success criteria.',
      canAdvance: false,
    };
  }
  if (progress.overall_progress < 0.5) {
    return {
      currentPhase: 'first_attempt',
      nextPhase: 'second_attempt',
      phaseProgress: progress.overall_progress * 2,
      guidance:
        'Attempt to retrieve knowledge from memory. Take time to recall before checking answers.',
      canAdvance: true,
    };
  }
  return {
    currentPhase: 'second_attempt',
    phaseProgress: (progress.overall_progress - 0.5) * 2,
    guidance:
      'If first attempt was unsuccessful, try again with hints or cues. Focus on understanding gaps.',
    canAdvance: progress.average_quality >= 3,
  };
}

function getReviewPhase(progress: SessionProgress): PhaseInfo {
  if (progress.chunks_completed === 0) {
    return {
      currentPhase: 'review_preparation',
      nextPhase: 'spaced_review',
      phaseProgress: 0,
      guidance: 'Prepare for spaced review session. Check review priorities and schedule.',
      canAdvance: false,
    };
  }
  if (progress.overall_progress < 0.8) {
    return {
      currentPhase: 'spaced_review',
      nextPhase: 'consolidation',
      phaseProgress: progress.overall_progress / 0.8,
      guidance:
        'Review material using spaced intervals. Focus on challenging areas and weak points.',
      canAdvance: progress.average_quality >= 3.5,
    };
  }
  return {
    currentPhase: 'consolidation',
    phaseProgress: (progress.overall_progress - 0.8) / 0.2,
    guidance:
      'Consolidate learning through final review. Strengthen connections and long-term retention.',
    canAdvance: progress.average_quality >= 4,
  };
}

function getPhaseForMode(mode: string, progress: SessionProgress): PhaseInfo {
  switch (mode) {
    case 'scaffolding':
      return getScaffoldingPhase(progress);
    case 'learning':
      return getLearningPhase(progress);
    case 'retrieval':
      return getRetrievalPhase(progress);
    case 'review':
      return getReviewPhase(progress);
    default:
      return {
        currentPhase: 'unknown',
        phaseProgress: 0,
        guidance: 'Session analysis in progress...',
        canAdvance: false,
      };
  }
}

/**
 * Determine the next workflow phase and provide guidance
 */
export function determineNextPhase(sessionData: SessionInput, now: Date): WorkflowPhase {
  const progress = calculateSessionProgress(sessionData, now);
  const phase = getPhaseForMode(sessionData.mode, progress);

  return {
    current_phase: phase.currentPhase,
    next_phase: phase.nextPhase,
    phase_progress: Math.max(0, Math.min(1, phase.phaseProgress)),
    guidance: phase.guidance,
    can_advance: phase.canAdvance,
  };
}

function evaluateCompletionCriteria(
  progress: SessionProgress,
  workflow: WorkflowPhase,
  thresholds: {
    qualityMet: boolean;
    timeMet: boolean;
    chunkMet: boolean;
    maxTimeExceeded: boolean;
  }
): { isComplete: boolean; reason: string; recommendation: 'continue' | 'complete' | 'break' } {
  if (thresholds.maxTimeExceeded) {
    return {
      isComplete: true,
      reason: 'Maximum session time reached (2 hours). Take a break to maintain effectiveness.',
      recommendation: 'break',
    };
  }
  if (thresholds.qualityMet && thresholds.chunkMet) {
    return {
      isComplete: true,
      reason: 'Learning goals achieved with high quality performance.',
      recommendation: 'complete',
    };
  }
  if (thresholds.chunkMet) {
    return {
      isComplete: true,
      reason: 'Session objectives completed successfully.',
      recommendation: 'complete',
    };
  }
  if (thresholds.qualityMet && thresholds.timeMet) {
    return {
      isComplete: true,
      reason: 'High quality performance achieved with sufficient practice time.',
      recommendation: 'complete',
    };
  }
  if (thresholds.timeMet && progress.overall_progress >= 0.5) {
    return {
      isComplete: true,
      reason: 'Good progress made in extended session. Consider taking a break.',
      recommendation: 'break',
    };
  }
  if (progress.overall_progress < 0.3 && progress.time_elapsed_ms < 30 * 60 * 1000) {
    return {
      isComplete: false,
      reason: 'Session just beginning. Continue with current learning phase.',
      recommendation: 'continue',
    };
  }
  if (!workflow.can_advance && progress.average_quality < 3) {
    return {
      isComplete: false,
      reason: 'Current phase needs more work before advancing.',
      recommendation: 'continue',
    };
  }
  return {
    isComplete: false,
    reason: 'Session progressing normally. Continue with learning objectives.',
    recommendation: 'continue',
  };
}

/**
 * Check if session should be completed based on multiple criteria
 */
export function checkSessionCompletion(
  sessionData: SessionInput,
  algorithmConfig: AlgorithmConfig,
  now: Date
): CompletionStatus {
  const progress = calculateSessionProgress(sessionData, now);
  const workflow = determineNextPhase(sessionData, now);
  const config = algorithmConfig.sessionConfig;

  const qualityThresholdMet = progress.average_quality >= config.qualityThreshold;
  const timeThresholdMet = progress.time_elapsed_ms >= config.timeThresholdMs;
  const chunkThresholdMet = progress.overall_progress >= config.completionThreshold;

  const { isComplete, reason, recommendation } = evaluateCompletionCriteria(progress, workflow, {
    qualityMet: qualityThresholdMet,
    timeMet: timeThresholdMet,
    chunkMet: chunkThresholdMet,
    maxTimeExceeded: progress.time_elapsed_ms >= config.maxTimeMs,
  });

  return {
    is_complete: isComplete,
    completion_reason: reason,
    quality_threshold_met: qualityThresholdMet,
    time_threshold_met: timeThresholdMet,
    chunk_threshold_met: chunkThresholdMet,
    recommendation,
  };
}

/**
 * Validate and normalize session context data
 */
export function validateSessionContext(context: unknown, now: Date): SessionInput {
  // Use Zod to validate and parse the input
  const result = SessionInputSchema.safeParse(context);

  if (!result.success) {
    // Extract meaningful error information
    const errorMessages = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join('; ');

    throw new Error(`Invalid session context: ${errorMessages}`);
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
    throw new Error('Session must contain at least one chunk');
  }

  // Validate time consistency
  const startTime = parseTimestamp(normalizedData.start_time, now);
  const currentTime = parseTimestamp(normalizedData.current_time || '', now);

  if (currentTime < startTime) {
    throw new Error('Current time cannot be before start time');
  }

  return normalizedData;
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
}): Promise<{ created: number; updated: number; unchanged: number; affectedChunkIds: string[] }> {
  const { sessionId, operations, maxOps = 50, activeSessionExists, persistFn } = args;

  if (operations.length > maxOps) {
    throw new Error(`Too many operations: max ${maxOps} operations allowed`);
  }

  if (!activeSessionExists) {
    throw new Error('No active session found. Create a session first.');
  }

  return await persistFn({ sessionId, operations });
}
