import type { SessionRepository } from '../ports/session-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type { LearningSession, SessionChunk } from '../domain/types/entities.js';
import type {
  TeachNextResponse,
  SubmitAnswerInput,
  SubmitAnswerResult,
} from '../domain/types/teaching.js';
import type { ChunkAttempt } from '../domain/types/session.js';
import type { DrillFormat, PromptFeedbackEntry } from '../shared/prompts/prompt-pack.js';
import { promptPack } from '../shared/prompts/prompt-pack.js';
import * as reviewWorkflows from './review-workflows.js';

export type TeachingDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
};

/**
 * Get the next teaching step for the active learning session.
 *
 * Flow:
 * 1. Get active session
 * 2. Get session chunks
 * 3. Validate gating (refuse if in_progress chunk has no attempts)
 * 4. Select next chunk (fresh pending → re-queued failures → complete)
 * 5. Fetch chunk data from DB
 * 6. Determine mode (learning vs retrieval)
 * 7. Fetch historical feedback
 * 8. Hydrate PromptPack and mark chunk in_progress
 */
export async function getNextTeachingStep(deps: TeachingDeps): Promise<TeachNextResponse> {
  // 1. Get active session
  const session = await deps.sessions.getActiveSession();
  if (!session) {
    return {
      status: 'error',
      message: 'No active session. Call create_session first.',
    };
  }

  // 2. Get session chunks, ordered by session's chunkIds (pedagogical sequence)
  const rawChunks = await deps.sessions.getSessionChunks(session.id);
  if (rawChunks.length === 0) {
    return {
      status: 'error',
      message: 'Session has no chunks.',
    };
  }
  const sessionChunks = orderBySessionChunkIds(rawChunks, session.chunkIds);

  // 3. Gating: refuse if any in_progress chunk has no recorded attempts
  const inProgressChunk = sessionChunks.find(sc => sc.status === 'in_progress' && !hasAttempts(sc));
  if (inProgressChunk) {
    return {
      status: 'blocked',
      message: 'Complete the current chunk before advancing.',
      current_chunk_id: inProgressChunk.chunkId,
    };
  }

  // 4. Select next chunk
  const pendingChunks = sessionChunks.filter(sc => sc.status === 'pending');

  // Re-queued failures: pending chunks that have previous failed attempts
  const requeued = pendingChunks.filter(sc => isRequeuedFailure(sc));
  // Fresh pending: pending chunks with no prior attempts
  const freshPending = pendingChunks.filter(sc => !hasAttempts(sc));

  const selected = freshPending[0] ?? requeued[0];

  if (!selected) {
    // No candidates — check if all completed
    const allCompleted = sessionChunks.every(sc => sc.status === 'completed');
    if (allCompleted) {
      return buildCompleteResponse(sessionChunks);
    }
    // Some in_progress remain — blocked on that chunk
    const blockedChunk = sessionChunks.find(sc => sc.status === 'in_progress');
    if (blockedChunk) {
      return {
        status: 'blocked',
        message: 'Complete the current chunk before advancing.',
        current_chunk_id: blockedChunk.chunkId,
      };
    }

    // Inconsistent state: pending chunks exist but none are selectable and none are in_progress
    return {
      status: 'error',
      message: `Session is in an inconsistent state: pending chunks cannot be advanced. Pending chunk ids: ${pendingChunks.map(sc => sc.chunkId).join(', ')}.`,
    };
  }

  // 5. Fetch chunk data from DB
  const chunkData = await deps.chunks.getWithContent(selected.chunkId);
  if (!chunkData) {
    return {
      status: 'error',
      message: `Chunk ${selected.chunkId} not found in database.`,
    };
  }

  // 6. Determine mode
  const isRequeued = hasAttempts(selected);
  const mode: 'learning' | 'retrieval' = isRequeued ? 'retrieval' : 'learning';
  const drillFormat: DrillFormat = mode === 'retrieval' ? 'open_ended' : 'explanation';

  // 7. Fetch historical feedback
  const historicalFeedback = await deps.sessions.getHistoricalFeedbackForChunks(
    [selected.chunkId],
    { excludeSessionId: session.id, limit: 5 }
  );

  const previousSessionFeedback: PromptFeedbackEntry[] = historicalFeedback.map(hf => ({
    sessionMode: hf.session_mode,
    completedAt: hf.completed_at,
    feedback: hf.feedback,
  }));

  // 8. Hydrate PromptPack
  const promptName = mode === 'learning' ? 'learning' : 'retrieval';
  const chunkIndex = sessionChunks.findIndex(sc => sc.id === selected.id) + 1;

  const instruction = promptPack.getPrompt(promptName, {
    chunkNumber: chunkIndex,
    totalChunks: sessionChunks.length,
    chunkTitle: chunkData.title,
    chunkContent: chunkData.content ?? undefined,
    prerequisites: chunkData.prerequisitesJson?.join(', '),
    drillFormat,
    masteryLevel: chunkData.repetitions > 0 ? Math.min(chunkData.repetitions, 5) : undefined,
    subject: chunkData.subject,
    previousSessionFeedback:
      previousSessionFeedback.length > 0 ? previousSessionFeedback : undefined,
  });

  // Mark chunk as in_progress
  await deps.sessions.updateSessionChunk(selected.id, { status: 'in_progress' });

  const previousFeedbackStrings = historicalFeedback.map(hf => hf.feedback);

  return {
    status: 'teach',
    chunk_id: selected.chunkId,
    chunk_index: chunkIndex,
    total_chunks: sessionChunks.length,
    mode,
    instruction,
    drill_format: drillFormat,
    ...(previousFeedbackStrings.length > 0 && { previous_feedback: previousFeedbackStrings }),
  };
}

// ── Helpers ──────────────────────────────────────────────────────

/** Sort session chunks to match the session's chunkIds order (pedagogical sequence). */
function orderBySessionChunkIds(
  chunks: SessionChunk[],
  chunkIds: LearningSession['chunkIds']
): SessionChunk[] {
  if (!chunkIds || chunkIds.length === 0) {
    return [...chunks].sort((a, b) => a.createdAt - b.createdAt);
  }
  const indexMap = new Map(chunkIds.map((id, i) => [id, i]));
  return [...chunks].sort((a, b) => {
    const ai = indexMap.get(a.chunkId) ?? Number.MAX_SAFE_INTEGER;
    const bi = indexMap.get(b.chunkId) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    // Tie-breaker for chunks not in chunkIds: sort by createdAt, then chunkId
    const timeDiff = a.createdAt - b.createdAt;
    return timeDiff !== 0 ? timeDiff : a.chunkId.localeCompare(b.chunkId);
  });
}

function hasAttempts(sc: SessionChunk): boolean {
  return Array.isArray(sc.attemptsJson) && sc.attemptsJson.length > 0;
}

/** Resolve `passed` with legacy `completed` fallback for raw DB attempts. */
function attemptPassed(attempt: unknown): boolean {
  if (attempt === null || typeof attempt !== 'object') return false;
  const obj = attempt as Record<string, unknown>;
  if ('passed' in obj) return Boolean(obj.passed);
  // Legacy rows may have `completed` instead of `passed`
  if ('completed' in obj) return Boolean(obj.completed);
  return false;
}

function isRequeuedFailure(sc: SessionChunk): boolean {
  if (!hasAttempts(sc)) return false;
  const attempts = sc.attemptsJson as unknown[];
  const lastAttempt = attempts[attempts.length - 1];
  return !attemptPassed(lastAttempt);
}

// ── submit_answer ────────────────────────────────────────────────

/**
 * Deterministic quality derivation — no agent discretion.
 * Returns null when no quality should be recorded yet (first-attempt failure → retry).
 */
function deriveQuality(attemptNumber: 1 | 2, passed: boolean): number | null {
  if (attemptNumber === 1 && passed) return 5;
  if (attemptNumber === 1 && !passed) return null;
  if (passed) return 3;
  return 1;
}

/**
 * Submit the learner's answer for the current in-progress chunk.
 *
 * Flow:
 * 1. Get active session → error if none
 * 2. Find in-progress chunk → error if none
 * 3. Count existing attempts → reject if >= 2
 * 4. Derive quality from attempt number + passed
 * 5. Build ChunkAttempt, append to attemptsJson
 * 6. If attempt 1 failed → persist, return retry
 * 7. If completed → SR update, mark completed/re-queued, piggyback teach_next
 */
export async function submitAnswer(
  input: SubmitAnswerInput,
  deps: TeachingDeps
): Promise<SubmitAnswerResult> {
  // 1. Get active session
  const session = await deps.sessions.getActiveSession();
  if (!session) {
    return { status: 'error', message: 'No active session. Call create_session first.' };
  }

  // 2. Find the in-progress chunk
  const sessionChunks = await deps.sessions.getSessionChunks(session.id);
  const inProgressChunk = sessionChunks.find(sc => sc.status === 'in_progress');
  if (!inProgressChunk) {
    return { status: 'error', message: 'No in-progress chunk. Call teach_next first.' };
  }

  // 3. Count existing attempts
  const existingAttempts = inProgressChunk.attemptsJson ?? [];
  const attemptNumber = existingAttempts.length + 1;

  if (attemptNumber > 2) {
    return {
      status: 'error',
      message: `Max 2 attempts per chunk presentation. Chunk ${inProgressChunk.chunkId} already has ${existingAttempts.length} attempts.`,
    };
  }

  // 4. Derive quality (attemptNumber is guaranteed 1 or 2 after the > 2 guard)
  const quality = deriveQuality(attemptNumber as 1 | 2, input.passed);

  // 5. Build attempt record
  const attempt: ChunkAttempt = {
    timestamp: new Date().toISOString(),
    question: input.question,
    response: input.response,
    passed: input.passed,
    feedback: input.feedback,
    quality: quality ?? 0,
    time_spent_ms: input.timeSpentMs,
  };

  const updatedAttempts = [...existingAttempts, attempt];
  const accumulatedTimeMs = inProgressChunk.timeSpentMs + input.timeSpentMs;

  // 6. First attempt failed → retry (no SR update)
  if (quality === null) {
    await deps.sessions.updateSessionChunk(inProgressChunk.id, {
      attemptsJson: updatedAttempts,
      timeSpentMs: accumulatedTimeMs,
      updatedAt: Date.now(),
    });

    return {
      status: 'retry',
      attempt: attemptNumber,
      chunk_id: inProgressChunk.chunkId,
      message: 'Incorrect. Try again.',
      feedback: input.feedback,
    };
  }

  // 7. Completed (attempt 1 pass, or attempt 2 pass/fail)
  const reviewDeps: reviewWorkflows.ReviewDeps = {
    reviewPersistence: deps.reviewPersistence,
    algorithmConfig: deps.algorithmConfig,
  };

  const reviewResult = await reviewWorkflows.processReviewResult(
    inProgressChunk.chunkId,
    quality,
    { timeSpentMs: accumulatedTimeMs },
    reviewDeps
  );

  // Determine chunk status: re-queue on attempt-2 failure, otherwise completed
  const newStatus = attemptNumber === 2 && !input.passed ? 'pending' : 'completed';

  await deps.sessions.updateSessionChunk(inProgressChunk.id, {
    status: newStatus,
    attemptsJson: updatedAttempts,
    timeSpentMs: accumulatedTimeMs,
    updatedAt: Date.now(),
  });

  // Piggyback teach_next
  const nextTeachStep = await getNextTeachingStep(deps);

  // Build review_update from SR result
  const reviewUpdate = reviewResult.success
    ? {
        next_review_date: new Date(reviewResult.data.updated.nextReviewAt)
          .toISOString()
          .split('T')[0],
        interval_days: reviewResult.data.updated.intervalDays,
        ease_factor: reviewResult.data.updated.easeFactor,
        is_leech: reviewResult.data.isLeech,
      }
    : {
        next_review_date: '',
        interval_days: 0,
        ease_factor: 0,
        is_leech: false,
      };

  return {
    status: 'recorded',
    attempt: attemptNumber,
    passed: input.passed,
    quality,
    chunk_id: inProgressChunk.chunkId,
    review_update: reviewUpdate,
    next: nextTeachStep,
  };
}

function buildCompleteResponse(sessionChunks: SessionChunk[]): TeachNextResponse {
  const total = sessionChunks.length;
  let passedFirstTry = 0;
  let neededRetry = 0;

  for (const sc of sessionChunks) {
    const attempts = sc.attemptsJson ?? [];
    if (attempts.length === 0) continue;
    if (attempts.length === 1 && attemptPassed(attempts[0])) {
      passedFirstTry++;
    } else if (attempts.some(a => attemptPassed(a))) {
      neededRetry++;
    }
  }

  return {
    status: 'complete',
    message: 'All chunks completed. Session finished.',
    summary: {
      total,
      passed_first_try: passedFirstTry,
      needed_retry: neededRetry,
    },
  };
}
