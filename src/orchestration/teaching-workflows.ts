import type { SessionRepository } from '../ports/session-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { PrerequisiteMasteryPort } from '../ports/prerequisite-mastery-port.js';
import type { ChunkIdLookupPort } from '../ports/chunk-id-lookup-port.js';
import type { SessionQuestionRepository } from '../ports/session-question-repository.js';
import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type { LearningSession, SessionChunk } from '../domain/types/entities.js';
import type {
  TeachNextResponse,
  SubmitAnswerInput,
  SubmitAnswerResult,
  StartLearningInput,
  StartLearningResult,
  CreateSessionQuestionsInput,
  CreateSessionQuestionsResult,
} from '../domain/types/teaching.js';
import type { SessionQuestion, SessionQuestionAttempt } from '../domain/types/entities.js';
import crypto from 'node:crypto';
import type { DrillFormat, PromptFeedbackEntry } from '../shared/prompts/prompt-pack.js';
import { promptPack } from '../shared/prompts/prompt-pack.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';
import {
  DEFAULT_RECOMMENDATION_CANDIDATE_LIMIT,
  type LearningItem,
} from '../domain/types/recommendations.js';
import * as reviewWorkflows from './review-workflows.js';
import * as sessionWorkflows from './session-workflows.js';
import * as recommendationWorkflows from './recommendation-workflows.js';

/** Max re-presentations after the initial presentation. Each presentation allows up to 2 attempts, so 3 = up to 4 total presentations / 8 total attempts. */
const MAX_RETRIES = 3;

export type TeachingDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
  sessionQuestions: SessionQuestionRepository;
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

  // 2b. Batch-prefetch questions + attempts for all chunks (one query each)
  const chunkIds = sessionChunks.map(sc => sc.id);
  const [allQuestions, allAttempts] = await Promise.all([
    deps.sessionQuestions.getQuestionsForChunks(chunkIds),
    deps.sessionQuestions.getAllAttemptsForChunks(chunkIds),
  ]);

  // Build lookup maps: chunkId → questions, questionId → attempts
  const questionsByChunk = new Map<string, SessionQuestion[]>();
  for (const q of allQuestions) {
    const list = questionsByChunk.get(q.sessionChunkId) ?? [];
    list.push(q);
    questionsByChunk.set(q.sessionChunkId, list);
  }
  const attemptsByQuestion = new Map<string, SessionQuestionAttempt[]>();
  for (const a of allAttempts) {
    const list = attemptsByQuestion.get(a.sessionQuestionId) ?? [];
    list.push(a);
    attemptsByQuestion.set(a.sessionQuestionId, list);
  }

  /** Check if a chunk has any recorded attempts (via normalized tables). */
  const chunkHasAttempts = (scId: string): boolean => {
    const questions = questionsByChunk.get(scId) ?? [];
    if (questions.length === 0) return false;
    // Has attempts if any question has at least one attempt
    return questions.some(q => (attemptsByQuestion.get(q.id) ?? []).length > 0);
  };

  /** Check if a chunk is a re-queued failure (last attempt was a failure). */
  const chunkIsRequeuedFailure = (scId: string): boolean => {
    const questions = questionsByChunk.get(scId) ?? [];
    if (questions.length === 0) return false;
    // Explicitly find the question with the highest questionIndex (don't assume ordering)
    const lastQuestion = questions.reduce((max, q) =>
      q.questionIndex > max.questionIndex ? q : max
    );
    const attempts = attemptsByQuestion.get(lastQuestion.id) ?? [];
    if (attempts.length === 0) return false;
    // Find the attempt with the highest attemptNumber
    const lastAttempt = attempts.reduce((max, a) =>
      a.attemptNumber > max.attemptNumber ? a : max
    );
    return !lastAttempt.passed;
  };

  // 3. Gating: refuse if any in_progress chunk has no recorded attempts
  const inProgressChunk = sessionChunks.find(
    sc => sc.status === 'in_progress' && !chunkHasAttempts(sc.id)
  );
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
  const requeued = pendingChunks.filter(sc => chunkIsRequeuedFailure(sc.id));
  // Fresh pending: pending chunks with no prior attempts
  const freshPending = pendingChunks.filter(sc => !chunkHasAttempts(sc.id));

  const selected = freshPending[0] ?? requeued[0];

  if (!selected) {
    // No candidates — check if all completed
    const allCompleted = sessionChunks.every(sc => sc.status === 'completed');
    if (allCompleted) {
      return buildCompleteResponse(sessionChunks, questionsByChunk, attemptsByQuestion);
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
  const isRequeued = chunkHasAttempts(selected.id);
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
    session_chunk_id: selected.id,
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
 * 3. Auto-create or find current session_question for this presentation
 * 4. Count existing attempts on that question → reject if >= 2
 * 5. Derive quality, persist attempt to session_question_attempts
 * 6. If attempt 1 failed → retry
 * 7. If completed → SR update, mark completed/re-queued, piggyback teach_next
 */
export async function submitAnswer(
  input: SubmitAnswerInput,
  deps: TeachingDeps
): Promise<SubmitAnswerResult> {
  // Branch: if session_question_id is provided, use the new explicit questions flow
  if (input.sessionQuestionId) {
    return submitAnswerForQuestion(input, input.sessionQuestionId, deps);
  }

  // Legacy flow: auto-create session_question, write to session_question_attempts
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

  // 3. Find or create the current session_question for this presentation.
  //    Each presentation gets one question. Look for a pending question first;
  //    if none exists, create one.
  const existingQuestions = await deps.sessionQuestions.getQuestionsForChunk(inProgressChunk.id);
  let currentQuestion = existingQuestions.find(q => q.status === 'pending');

  if (!currentQuestion) {
    // All existing questions are answered/skipped — this is a new presentation.
    const newQuestionIndex = existingQuestions.length + 1;
    const created = await deps.sessionQuestions.createQuestions(
      inProgressChunk.id,
      [{ promptText: input.question }],
      newQuestionIndex
    );
    if (!created[0]) {
      return { status: 'error', message: 'Failed to create session question.' };
    }
    currentQuestion = created[0];
  }

  // 4. Count existing attempts on this question
  const existingAttempts = await deps.sessionQuestions.getAttemptsForQuestion(currentQuestion.id);
  if (existingAttempts.length >= 2) {
    return {
      status: 'error',
      message: `Max 2 attempts per chunk presentation. Chunk ${inProgressChunk.chunkId} already has ${existingAttempts.length} attempts in this presentation.`,
    };
  }

  const attemptNumber = (existingAttempts.length + 1) as 1 | 2;

  // 5. Derive quality and persist attempt
  const quality = deriveQuality(attemptNumber, input.passed);

  try {
    await deps.sessionQuestions.createAttempt({
      id: crypto.randomUUID(),
      sessionQuestionId: currentQuestion.id,
      attemptNumber,
      response: input.response,
      passed: input.passed,
      feedback: input.feedback,
      quality,
      timeSpentMs: input.timeSpentMs,
      createdAt: Date.now(),
    });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as { code: string }).code === '23505' &&
      'constraint' in err &&
      (err as { constraint: string }).constraint === 'uq_session_question_attempts_question_number'
    ) {
      return { status: 'error', message: 'Attempt already recorded' };
    }
    throw err;
  }

  // Count total attempts across all questions for this chunk (for re-queue logic)
  const [allChunkQuestions, allChunkAttempts] = await Promise.all([
    deps.sessionQuestions.getQuestionsForChunk(inProgressChunk.id),
    deps.sessionQuestions.getAllAttemptsForChunk(inProgressChunk.id),
  ]);
  // Use only the sum of attempt times — do NOT add inProgressChunk.timeSpentMs,
  // which already includes prior attempt times from the retry-path update.
  const accumulatedTimeMs = allChunkAttempts.reduce((sum, a) => sum + a.timeSpentMs, 0);

  // 6. First attempt failed → retry (no SR update)
  if (quality === null) {
    const retryUpdatedRows = await deps.sessions.updateSessionChunk(inProgressChunk.id, {
      timeSpentMs: accumulatedTimeMs,
      updatedAt: Date.now(),
    });
    if (retryUpdatedRows === 0) {
      return {
        status: 'error',
        message: 'Failed to update session chunk time tracking',
      };
    }

    return {
      status: 'retry',
      attempt: attemptNumber,
      chunk_id: inProgressChunk.chunkId,
      message: 'Incorrect. Try again.',
      feedback: input.feedback,
    };
  }

  // Mark question as answered
  await deps.sessionQuestions.updateQuestionStatus(currentQuestion.id, 'answered');

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

  // Determine chunk status: re-queue on attempt-2 failure, unless retries exhausted
  let newStatus: 'completed' | 'pending';
  if (attemptNumber === 2 && !input.passed) {
    // Each question = one presentation, so count questions
    const presentationCount = allChunkQuestions.length;
    newStatus = presentationCount > MAX_RETRIES ? 'completed' : 'pending';
  } else {
    newStatus = 'completed';
  }

  // If SR persistence failed, surface this explicitly
  if (!reviewResult.success) {
    return {
      status: 'error',
      message: 'Failed to persist spaced repetition review result.',
    };
  }

  const updatedRows = await deps.sessions.updateSessionChunk(inProgressChunk.id, {
    status: newStatus,
    timeSpentMs: accumulatedTimeMs,
    updatedAt: Date.now(),
  });
  if (updatedRows === 0) {
    return {
      status: 'error',
      message: 'Failed to update session chunk status',
    };
  }

  // Piggyback teach_next only when SR persistence succeeded
  const nextTeachStep = await getNextTeachingStep(deps);

  // Build review_update from SR result (now guaranteed successful)
  const reviewUpdate = {
    next_review_date: new Date(reviewResult.data.updated.nextReviewAt).toISOString().split('T')[0],
    interval_days: reviewResult.data.updated.intervalDays,
    ease_factor: reviewResult.data.updated.easeFactor,
    is_leech: reviewResult.data.isLeech,
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

// ── create_session_questions ─────────────────────────────────────

/**
 * Create explicit questions for a session chunk.
 * Validates the chunk exists and is in_progress.
 */
export async function createSessionQuestions(
  input: CreateSessionQuestionsInput,
  deps: TeachingDeps
): Promise<CreateSessionQuestionsResult> {
  // Validate active session exists and chunk belongs to it
  const session = await deps.sessions.getActiveSession();
  if (!session) {
    return { status: 'error', message: 'No active session. Call create_session first.' };
  }

  const sessionChunk = await deps.sessions.getSessionChunkById(input.sessionChunkId);
  if (!sessionChunk) {
    return { status: 'error', message: `Session chunk ${input.sessionChunkId} not found.` };
  }

  if (sessionChunk.sessionId !== session.id) {
    return {
      status: 'error',
      message: `Session chunk ${input.sessionChunkId} does not belong to the active session.`,
    };
  }

  if (sessionChunk.status !== 'in_progress') {
    return {
      status: 'error',
      message: `Session chunk ${input.sessionChunkId} is "${sessionChunk.status}", expected "in_progress".`,
    };
  }

  // Guard: reject if questions already exist for this chunk
  const existing = await deps.sessionQuestions.getQuestionsForChunk(input.sessionChunkId);
  if (existing.length > 0) {
    return {
      status: 'error',
      message: `Session chunk ${input.sessionChunkId} already has ${existing.length} question(s). Cannot create duplicates.`,
    };
  }

  const created = await deps.sessionQuestions.createQuestions(
    input.sessionChunkId,
    input.questions
  );

  return {
    status: 'created' as const,
    sessionChunkId: input.sessionChunkId,
    questionIds: created.map(q => q.id),
  };
}

// ── Quality aggregation ─────────────────────────────────────────

/**
 * Compute weighted-average quality from per-question quality scores.
 * Uses uniform weights (all questions weigh the same).
 */
export function aggregateQuestionQualities(qualities: number[]): number {
  if (qualities.length === 0) return 0;
  const sum = qualities.reduce((acc, q) => acc + q, 0);
  return Math.round((sum / qualities.length) * 100) / 100;
}

// ── submit_answer with session_question_id flow ─────────────────

/**
 * New-flow submit_answer when session_question_id is provided.
 * Writes to session_question_attempts, derives quality per question.
 * When all questions for a chunk are answered, aggregates quality and triggers SR update.
 */
async function submitAnswerForQuestion(
  input: SubmitAnswerInput,
  sessionQuestionId: string,
  deps: TeachingDeps
): Promise<SubmitAnswerResult> {
  // 1. Look up the question
  const question = await deps.sessionQuestions.getQuestionById(sessionQuestionId);
  if (!question) {
    return { status: 'error', message: `Session question ${sessionQuestionId} not found.` };
  }

  // 1b. Guard: question must still be answerable
  if (question.status !== 'pending') {
    return {
      status: 'error',
      message: `Question ${sessionQuestionId} is "${question.status}", expected "pending".`,
    };
  }

  // 2. Get active session and verify scoping
  const session = await deps.sessions.getActiveSession();
  if (!session) {
    return { status: 'error', message: 'No active session. Call create_session first.' };
  }

  // 3. Look up the session chunk
  const sessionChunk = await deps.sessions.getSessionChunkById(question.sessionChunkId);
  if (!sessionChunk) {
    return { status: 'error', message: `Session chunk ${question.sessionChunkId} not found.` };
  }

  // 3a. Guard: chunk must belong to the active session
  if (sessionChunk.sessionId !== session.id) {
    return {
      status: 'error',
      message: `Question ${sessionQuestionId} belongs to a different session.`,
    };
  }

  // 3b. Guard: chunk must still be in_progress
  if (sessionChunk.status !== 'in_progress') {
    return {
      status: 'error',
      message: `Session chunk ${question.sessionChunkId} is "${sessionChunk.status}", expected "in_progress".`,
    };
  }

  // 4. Count existing attempts for this question
  const existingAttempts = await deps.sessionQuestions.getAttemptsForQuestion(sessionQuestionId);
  if (existingAttempts.length >= 2) {
    return {
      status: 'error',
      message: `Max 2 attempts per question. Question ${sessionQuestionId} already has ${existingAttempts.length} attempts.`,
    };
  }

  const attemptNumber = (existingAttempts.length + 1) as 1 | 2;
  const quality = deriveQuality(attemptNumber, input.passed);

  // 5. Persist attempt
  try {
    await deps.sessionQuestions.createAttempt({
      id: crypto.randomUUID(),
      sessionQuestionId,
      attemptNumber,
      response: input.response,
      passed: input.passed,
      feedback: input.feedback,
      quality,
      timeSpentMs: input.timeSpentMs,
      createdAt: Date.now(),
    });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as { code: string }).code === '23505' &&
      'constraint' in err &&
      (err as { constraint: string }).constraint === 'uq_session_question_attempts_question_number'
    ) {
      return { status: 'error', message: 'Attempt already recorded' };
    }
    throw err;
  }

  // 6. Update question status
  if (quality !== null) {
    await deps.sessionQuestions.updateQuestionStatus(sessionQuestionId, 'answered');
  }

  // 7. First attempt failed → retry
  if (quality === null) {
    return {
      status: 'retry',
      attempt: attemptNumber,
      chunk_id: sessionChunk.chunkId,
      message: 'Incorrect. Try again.',
      feedback: input.feedback,
    };
  }

  // 8. Check if all questions for this chunk are answered
  const allQuestions = await deps.sessionQuestions.getQuestionsForChunk(question.sessionChunkId);
  const unanswered = allQuestions.filter(q => q.status === 'pending');

  if (unanswered.length > 0) {
    // More questions remain — return recorded but no SR update yet (review_update omitted)
    return {
      status: 'recorded',
      attempt: attemptNumber,
      passed: input.passed,
      quality,
      chunk_id: sessionChunk.chunkId,
      next: {
        status: 'blocked',
        message: `${unanswered.length} question(s) remaining for this chunk.`,
        current_chunk_id: sessionChunk.chunkId,
      },
    };
  }

  // 9. All questions answered — aggregate quality
  const allAttempts = await deps.sessionQuestions.getAllAttemptsForChunk(question.sessionChunkId);
  const perQuestionQualities: number[] = [];
  for (const q of allQuestions) {
    const qAttempts = allAttempts.filter(a => a.sessionQuestionId === q.id);
    // Take the quality from the first scored attempt (earliest with a non-null quality)
    const scoredAttempt = qAttempts.find(a => a.quality !== null);
    if (scoredAttempt?.quality !== null && scoredAttempt?.quality !== undefined) {
      perQuestionQualities.push(scoredAttempt.quality);
    }
  }

  const aggregatedQuality = aggregateQuestionQualities(perQuestionQualities);

  // 10. SR update with aggregated quality
  const reviewDeps: reviewWorkflows.ReviewDeps = {
    reviewPersistence: deps.reviewPersistence,
    algorithmConfig: deps.algorithmConfig,
  };

  // Use only the sum of attempt times — sessionChunk.timeSpentMs may already
  // include prior attempt times, so adding it would double-count.
  const accumulatedTimeMs = allAttempts.reduce((sum, a) => sum + a.timeSpentMs, 0);

  const reviewResult = await reviewWorkflows.processReviewResult(
    sessionChunk.chunkId,
    Math.round(aggregatedQuality),
    { timeSpentMs: accumulatedTimeMs },
    reviewDeps
  );

  if (!reviewResult.success) {
    return {
      status: 'error',
      message: 'Failed to persist spaced repetition review result.',
    };
  }

  // 11. Mark chunk completed (only after SR persistence succeeds)
  const updatedRows = await deps.sessions.updateSessionChunk(sessionChunk.id, {
    status: 'completed',
    timeSpentMs: accumulatedTimeMs,
    updatedAt: Date.now(),
  });
  if (updatedRows === 0) {
    return {
      status: 'error',
      message: 'Failed to update session chunk status',
    };
  }

  const nextTeachStep = await getNextTeachingStep(deps);

  return {
    status: 'recorded',
    attempt: attemptNumber,
    passed: Math.round(aggregatedQuality) >= 3,
    quality: Math.round(aggregatedQuality),
    chunk_id: sessionChunk.chunkId,
    review_update: {
      next_review_date: new Date(reviewResult.data.updated.nextReviewAt)
        .toISOString()
        .split('T')[0],
      interval_days: reviewResult.data.updated.intervalDays,
      ease_factor: reviewResult.data.updated.easeFactor,
      is_leech: reviewResult.data.isLeech,
    },
    next: nextTeachStep,
  };
}

function buildCompleteResponse(
  sessionChunks: SessionChunk[],
  questionsByChunk: Map<string, SessionQuestion[]>,
  attemptsByQuestion: Map<string, SessionQuestionAttempt[]>
): TeachNextResponse {
  const total = sessionChunks.length;
  let passedFirstTry = 0;
  let neededRetry = 0;
  let exhaustedRetries = 0;

  for (const sc of sessionChunks) {
    const questions = questionsByChunk.get(sc.id) ?? [];
    const allAttempts = questions.flatMap(q => attemptsByQuestion.get(q.id) ?? []);
    if (allAttempts.length === 0) continue;

    if (allAttempts.length === 1 && (allAttempts[0] as SessionQuestionAttempt).passed) {
      passedFirstTry++;
    } else if (allAttempts.some(a => a.passed)) {
      neededRetry++;
    } else {
      exhaustedRetries++;
    }
  }

  return {
    status: 'complete',
    message: 'All chunks completed. Session finished.',
    summary: {
      total,
      passed_first_try: passedFirstTry,
      needed_retry: neededRetry,
      exhausted_retries: exhaustedRetries,
    },
  };
}

// ── start_learning ──────────────────────────────────────────────

export type StartLearningDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
  mastery: PrerequisiteMasteryPort;
  chunkIdLookup: ChunkIdLookupPort;
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
  sessionQuestions: SessionQuestionRepository;
  maxDependencyDepth: number;
};

/**
 * Convenience workflow: check for active session → recommend → create session → teach first chunk.
 * Collapses what_to_learn_today + create_session + teach_next into one call.
 */
export async function startLearning(
  input: StartLearningInput,
  deps: StartLearningDeps
): Promise<StartLearningResult> {
  // 1. Check for active session
  const sessionDeps: sessionWorkflows.SessionDeps = {
    sessions: deps.sessions,
    chunks: deps.chunks,
    maxDependencyDepth: deps.maxDependencyDepth,
  };
  const activeSession = await sessionWorkflows.getActiveSession(sessionDeps);
  if (activeSession) {
    return {
      status: 'error',
      message: 'An active session already exists. Complete or end it before starting a new one.',
    };
  }

  // 2. Fetch learning items from DB
  const rows = await deps.chunks.list({
    dueOnly: true,
    limit: DEFAULT_RECOMMENDATION_CANDIDATE_LIMIT,
    subjectFilter: input.subjectFilter,
    isLeech: false,
  });
  const items = rows.map(r => mapChunkRowToLearningItem(r) as LearningItem);

  if (items.length === 0) {
    return {
      status: 'nothing_due',
      message: input.subjectFilter
        ? `No items due for review in subject "${input.subjectFilter}".`
        : 'No items due for review. Add new content or wait for items to become due.',
    };
  }

  // 3. Generate recommendations
  const recDeps: recommendationWorkflows.RecommendationDeps = {
    chunks: deps.chunks,
    mastery: deps.mastery,
    chunkIdLookup: deps.chunkIdLookup,
    algorithmConfig: deps.algorithmConfig,
  };
  const now = new Date();
  const recommendations = await recommendationWorkflows.generateRecommendations(
    {
      learningItems: items,
      timeAvailable: input.timeAvailable,
      subjectFilter: input.subjectFilter,
    },
    recDeps,
    now
  );

  if (recommendations.recommendations.length === 0) {
    return {
      status: 'nothing_due',
      message: 'No recommendations available. All items may be up to date.',
    };
  }

  // 4. Extract chunk IDs (already dependency-resolved and ordered by RecommendationEngine)
  const resolvedChunkIds = recommendations.recommendations.map(r => r.item.id);

  // 5. Auto-detect mode if not specified
  const mode = input.mode ?? inferMode(recommendations.recommendations.map(r => r.item));

  // 6. Create session
  const sessionResult = await sessionWorkflows.createSession(
    {
      chunkIds: resolvedChunkIds,
      mode,
      estimatedDuration: recommendations.estimatedDuration,
    },
    sessionDeps
  );

  if (!sessionResult.success) {
    return {
      status: 'error',
      message: `Failed to create session: ${sessionResult.error.message}`,
    };
  }

  // 7. Get first teaching step
  const teachingDeps: TeachingDeps = {
    sessions: deps.sessions,
    chunks: deps.chunks,
    reviewPersistence: deps.reviewPersistence,
    algorithmConfig: deps.algorithmConfig,
    sessionQuestions: deps.sessionQuestions,
  };
  const firstChunk = await getNextTeachingStep(teachingDeps);

  // 8. Return combined result
  return {
    status: 'started',
    session_id: sessionResult.data.sessionId,
    mode,
    total_chunks: resolvedChunkIds.length,
    estimated_duration: recommendations.estimatedDuration,
    first_chunk: firstChunk,
    recommendation_summary: recommendations.rationale,
  };
}

function inferMode(items: LearningItem[]): 'learning' | 'review' {
  const hasReviewItems = items.some(
    item => item.chunkType === 'review' || item.chunkType === 'remediation'
  );
  return hasReviewItems ? 'review' : 'learning';
}
