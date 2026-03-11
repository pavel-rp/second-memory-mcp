import type { SessionRepository } from '../ports/session-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { SessionChunk } from '../domain/types/entities.js';
import type { ChunkAttempt } from '../domain/types/session.js';
import type { TeachNextResponse } from '../domain/types/teaching.js';
import type { DrillFormat, PromptFeedbackEntry } from '../shared/prompts/prompt-pack.js';
import { promptPack } from '../shared/prompts/prompt-pack.js';

export type TeachingDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
};

/**
 * Get the next teaching step for the active learning session.
 *
 * Flow:
 * 1. Get active session
 * 2. Get session chunks
 * 3. Validate gating (refuse if in_progress chunk has no attempts)
 * 4. Select next chunk (re-queued failures → fresh pending → complete)
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

  // 2. Get session chunks
  const sessionChunks = await deps.sessions.getSessionChunks(session.id);
  if (sessionChunks.length === 0) {
    return {
      status: 'error',
      message: 'Session has no chunks.',
    };
  }

  // 3. Gating: refuse if any in_progress chunk has no recorded attempts
  const inProgressChunk = sessionChunks.find(sc => sc.status === 'in_progress');
  if (inProgressChunk && !hasAttempts(inProgressChunk)) {
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

  const selected = requeued[0] ?? freshPending[0];

  if (!selected) {
    // No candidates — check if all completed
    const allCompleted = sessionChunks.every(sc => sc.status === 'completed');
    if (allCompleted) {
      return buildCompleteResponse(sessionChunks);
    }
    // Some in_progress remain — blocked
    const blockedChunk = sessionChunks.find(sc => sc.status === 'in_progress');
    return {
      status: 'blocked',
      message: 'Complete the current chunk before advancing.',
      current_chunk_id: blockedChunk?.chunkId ?? '',
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
    { excludeSessionId: session.id }
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

function hasAttempts(sc: SessionChunk): boolean {
  return Array.isArray(sc.attemptsJson) && sc.attemptsJson.length > 0;
}

function isRequeuedFailure(sc: SessionChunk): boolean {
  if (!hasAttempts(sc)) return false;
  const attempts = sc.attemptsJson as ChunkAttempt[];
  const lastAttempt = attempts[attempts.length - 1];
  return !lastAttempt.passed;
}

function buildCompleteResponse(sessionChunks: SessionChunk[]): TeachNextResponse {
  const total = sessionChunks.length;
  let passedFirstTry = 0;
  let neededRetry = 0;

  for (const sc of sessionChunks) {
    const attempts = sc.attemptsJson ?? [];
    if (attempts.length === 0) continue;
    if (attempts.length === 1 && attempts[0].passed) {
      passedFirstTry++;
    } else if (attempts.some(a => a.passed)) {
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
