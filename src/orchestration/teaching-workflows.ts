import type { SessionRepository } from '../ports/session-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { SessionQuestionRepository } from '../ports/session-question-repository.js';
import type { NotesRepository } from '../ports/notes-repository.js';
import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type { LearningSession, SessionChunk } from '../domain/types/entities.js';
import type { SessionMode } from '../domain/types/session.js';
import type {
  TeachNextResponse,
  TeachNextComplete,
  PrerequisiteContextItem,
  ReviewUpdate,
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
import { getRequestLogger, logEvent } from '../shared/logger.js';
import * as reviewWorkflows from './review-workflows.js';
import * as sessionWorkflows from './session-workflows.js';
import * as recommendationWorkflows from './recommendation-workflows.js';
import { SUBMIT_ANSWER_REFLECT_PROMPT } from '../shared/constants/prompts.js';
import { isPgUniqueViolation } from '../shared/errors.js';
import { classifyChunk, type ClassifyChunkInput } from '../domain/algorithms/classify-chunk.js';
import {
  computeTopicProfile,
  type TopicChunkInput,
} from '../domain/algorithms/compute-topic-profile.js';
import {
  resolveStalePrerequisites,
  type PrerequisiteChunkMeta,
} from '../domain/algorithms/resolve-stale-prerequisites.js';

/** Lookup helper — returns empty array when key is absent from a Map<string, T[]>. */
function mapGetList<T>(map: Map<string, T[]>, key: string): T[] {
  return map.get(key) ?? [];
}

export type TeachingDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
  sessionQuestions: SessionQuestionRepository;
  notes?: NotesRepository;
};

/**
 * Get the next teaching step for the active learning session.
 *
 * Flow:
 * 1. Get active session
 * 2. Get session chunks
 * 3. Validate gating (refuse if in_progress chunk has no attempts)
 * 3b. Complete in-progress chunk with recorded attempts (aggregate quality, SR update, mark completed)
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
  let sessionChunks = orderBySessionChunkIds(rawChunks, session.chunkIds);

  // Assessment mode: return next unanswered question sequentially (no teaching instruction)
  if (session.mode === 'assessment') {
    return getNextAssessmentStep(session, sessionChunks, deps);
  }

  // 2b. Batch-prefetch questions + attempts for the session + junction mapping
  const [allQuestions, allAttempts] = await Promise.all([
    deps.sessionQuestions.getQuestionsForSession(session.id),
    deps.sessionQuestions.getAllAttemptsForSession(session.id),
  ]);

  // Fetch junction mapping: questionId → chunkId[]
  const questionIds = allQuestions.map(q => q.id);
  const chunkMapping =
    questionIds.length > 0
      ? await deps.sessionQuestions.getChunkIdsForQuestions(questionIds)
      : new Map<string, string[]>();

  // Build lookup maps: chunkId (learning chunk ID) → questions, questionId → attempts
  const questionsByChunkId = new Map<string, SessionQuestion[]>();
  for (const q of allQuestions) {
    const mappedChunkIds = mapGetList(chunkMapping, q.id);
    for (const cid of mappedChunkIds) {
      const list = mapGetList(questionsByChunkId, cid);
      list.push(q);
      questionsByChunkId.set(cid, list);
    }
  }
  const attemptsByQuestion = new Map<string, SessionQuestionAttempt[]>();
  for (const a of allAttempts) {
    const list = mapGetList(attemptsByQuestion, a.sessionQuestionId);
    list.push(a);
    attemptsByQuestion.set(a.sessionQuestionId, list);
  }

  /** Check if a chunk has any recorded attempts (via junction-based resolution). */
  const chunkHasAttempts = (sc: SessionChunk): boolean => {
    const questions = mapGetList(questionsByChunkId, sc.chunkId);
    if (questions.length === 0) return false;
    return questions.some(q => mapGetList(attemptsByQuestion, q.id).length > 0);
  };

  /** Check if a chunk is a re-queued failure (last attempt was a failure). */
  const chunkIsRequeuedFailure = (sc: SessionChunk): boolean => {
    const questions = mapGetList(questionsByChunkId, sc.chunkId);
    if (questions.length === 0) return false;
    const lastQuestion = questions.reduce((max, q) =>
      q.questionIndex > max.questionIndex ? q : max
    );
    const attempts = mapGetList(attemptsByQuestion, lastQuestion.id);
    if (attempts.length === 0) return false;
    const lastAttempt = attempts.reduce((max, a) =>
      a.attemptNumber > max.attemptNumber ? a : max
    );
    return !lastAttempt.passed;
  };

  // 3. Gating: refuse if any in_progress chunk has no recorded attempts
  const inProgressChunk = sessionChunks.find(
    sc => sc.status === 'in_progress' && !chunkHasAttempts(sc)
  );
  if (inProgressChunk) {
    return {
      status: 'blocked',
      message:
        'No questions submitted for the current chunk. Use submit_answer with prompt_text and chunk_ids to ask at least one question before advancing.',
      current_chunk_id: inProgressChunk.chunkId,
    };
  }

  // 3b. Complete in-progress chunk that has recorded attempts
  let completedChunkReviewUpdate: ReviewUpdate | undefined;
  const completableChunk = sessionChunks.find(
    sc => sc.status === 'in_progress' && chunkHasAttempts(sc)
  );
  if (completableChunk) {
    const chunkQuestions = mapGetList(questionsByChunkId, completableChunk.chunkId);
    const perQuestionQualities: number[] = [];
    let accumulatedTimeMs = 0;

    // Use the final attempt's quality for each question.
    // Questions with no scored attempt (e.g. teach_next called mid-retry) are excluded.
    for (const q of chunkQuestions) {
      const qAttempts = mapGetList(attemptsByQuestion, q.id);
      accumulatedTimeMs += qAttempts.reduce((sum, a) => sum + a.timeSpentMs, 0);
      const lastAttempt = qAttempts[qAttempts.length - 1];
      if (lastAttempt?.quality !== null && lastAttempt?.quality !== undefined) {
        perQuestionQualities.push(lastAttempt.quality);
      }
    }

    // Optimistic lock: claim the chunk by setting status='completed' only if still 'in_progress'.
    // If 0 rows updated, a concurrent call already completed it — skip SR to avoid double-update.
    const claimedRows = await deps.sessions.updateSessionChunk(
      completableChunk.id,
      { status: 'completed', timeSpentMs: accumulatedTimeMs, updatedAt: Date.now() },
      'in_progress'
    );
    // Always update local state — the chunk is completed regardless of which concurrent caller won.
    completableChunk.status = 'completed';

    if (claimedRows === 0) {
      getRequestLogger().warn(
        `Chunk ${completableChunk.chunkId} already completed by concurrent call — skipping SR`
      );
    } else {
      const aggregatedQuality = aggregateQuestionQualities(perQuestionQualities);

      const reviewDeps: reviewWorkflows.ReviewDeps = {
        reviewPersistence: deps.reviewPersistence,
        algorithmConfig: deps.algorithmConfig,
      };

      const reviewResult = await reviewWorkflows.processReviewResult(
        completableChunk.chunkId,
        Math.round(aggregatedQuality),
        { timeSpentMs: accumulatedTimeMs },
        reviewDeps
      );

      if (reviewResult.success) {
        completedChunkReviewUpdate = {
          next_review_date: new Date(reviewResult.data.updated.nextReviewAt)
            .toISOString()
            .split('T')[0] as string,
          interval_days: reviewResult.data.updated.intervalDays,
          ease_factor: reviewResult.data.updated.easeFactor,
          is_leech: reviewResult.data.isLeech,
        };
        logEvent('submitAnswer', 'chunk_completed', {
          sessionId: session.id,
          chunkId: completableChunk.chunkId,
          finalQuality: aggregatedQuality,
        });
        logEvent('submitAnswer', 'sr_updated', {
          chunkId: completableChunk.chunkId,
          easeFactor: reviewResult.data.updated.easeFactor,
          interval: reviewResult.data.updated.intervalDays,
          nextReviewDate: new Date(reviewResult.data.updated.nextReviewAt)
            .toISOString()
            .split('T')[0],
        });
      } else {
        getRequestLogger().error(
          `SR update failed for chunk ${completableChunk.chunkId} — chunk already marked completed`
        );
      }
    }
  }

  // 4. Select next chunk
  const pendingChunks = sessionChunks.filter(sc => sc.status === 'pending');

  // Re-queued failures: pending chunks that have previous failed attempts
  const requeued = pendingChunks.filter(sc => chunkIsRequeuedFailure(sc));
  // Fresh pending: pending chunks with no prior attempts
  const freshPending = pendingChunks.filter(sc => !chunkHasAttempts(sc));

  let selected = freshPending[0] ?? requeued[0];

  if (!selected) {
    // No candidates — check if all completed
    const allCompleted = sessionChunks.every(sc => sc.status === 'completed');
    if (allCompleted) {
      logEvent('teachNext', 'session_complete', {
        sessionId: session.id,
        chunksCompleted: sessionChunks.length,
        totalChunks: sessionChunks.length,
      });
      const completeResponse = buildCompleteResponse(
        sessionChunks,
        questionsByChunkId,
        attemptsByQuestion
      );
      if (completedChunkReviewUpdate) {
        return { ...completeResponse, review_update: completedChunkReviewUpdate };
      }
      return completeResponse;
    }
    // Some in_progress remain — blocked on that chunk (has attempts but unanswered questions)
    const blockedChunk = sessionChunks.find(sc => sc.status === 'in_progress');
    if (blockedChunk) {
      return {
        status: 'blocked',
        message:
          'Current chunk has unanswered questions. Use submit_answer to answer remaining questions before advancing.',
        current_chunk_id: blockedChunk.chunkId,
      };
    }

    // Inconsistent state: pending chunks exist but none are selectable and none are in_progress
    return {
      status: 'error',
      message: `Session is in an inconsistent state: ${pendingChunks.length} pending chunk(s) cannot be advanced.`,
    };
  }

  // 5. Fetch chunk data from DB
  let chunkData = await deps.chunks.getWithContent(selected.chunkId);
  if (!chunkData) {
    return {
      status: 'error',
      message: `Chunk ${selected.chunkId} not found in database.`,
    };
  }

  // 5b. Prerequisite staleness check — fail-open
  let stalePrereqIds: string[] = [];
  try {
    const prereqIds = chunkData.prerequisitesJson ?? [];
    if (prereqIds.length > 0) {
      // Collect prerequisite metadata level-by-level up to maxDependencyDepth
      const maxDepth = deps.algorithmConfig.maxDependencyDepth;
      const metadataMap = new Map<string, PrerequisiteChunkMeta>();
      let frontier = [...prereqIds];

      // Matches resolver's walk(depth=1..maxDepth) — both process exactly maxDepth levels
      for (let level = 0; level < maxDepth && frontier.length > 0; level++) {
        const unknownIds = frontier.filter(id => !metadataMap.has(id));
        if (unknownIds.length === 0) break;

        const fetched = await deps.chunks.batchFetchMinimal({ chunkIds: unknownIds });
        const nextFrontier: string[] = [];
        for (const c of fetched) {
          metadataMap.set(c.id, {
            easeFactor: c.easeFactor,
            repetitions: c.repetitions,
            nextReviewAt: c.nextReviewAt,
            intervalDays: c.intervalDays,
            prerequisiteIds: c.prerequisitesJson ?? [],
          });
          nextFrontier.push(...(c.prerequisitesJson ?? []));
        }
        frontier = nextFrontier;
      }

      const sessionChunkIdSet = new Set(sessionChunks.map(sc => sc.chunkId));
      const result = resolveStalePrerequisites({
        chunkMetadata: metadataMap,
        targetPrerequisiteIds: prereqIds,
        sessionChunkIds: sessionChunkIdSet,
        maxDepth,
        now: new Date(),
      });

      stalePrereqIds = result.stalePrereqIds;

      if (result.circularDetected) {
        getRequestLogger().warn(
          { targetPrerequisiteIds: prereqIds },
          'Circular dependency detected in prerequisite graph'
        );
      }
      if (result.depthCapReached) {
        getRequestLogger().warn(
          { maxDepth, targetPrerequisiteIds: prereqIds },
          'Prerequisite depth cap reached — deeper prerequisites were not evaluated'
        );
      }

      if (stalePrereqIds.length > 0) {
        const originalChunkId = selected.chunkId;
        // Create pending session chunks for each stale prerequisite
        const nowMs = Date.now();
        const newSessionChunks = stalePrereqIds.map((chunkId, i) => ({
          id: crypto.randomUUID(),
          sessionId: session.id,
          chunkId,
          status: 'pending',
          timeSpentMs: 0,
          createdAt: nowMs + i,
          updatedAt: nowMs + i,
        }));
        await deps.sessions.batchCreateSessionChunks(newSessionChunks);

        // Update session chunkIds ordering: insert stale prereqs before the dependent chunk
        const currentChunkIds = session.chunkIds ?? sessionChunks.map(sc => sc.chunkId);
        const dependentIdx = currentChunkIds.indexOf(selected.chunkId);
        const updatedChunkIds = [...currentChunkIds];
        const insertAt = dependentIdx >= 0 ? dependentIdx : updatedChunkIds.length;
        updatedChunkIds.splice(insertAt, 0, ...stalePrereqIds);
        await deps.sessions.updateSession(session.id, {
          chunkIds: updatedChunkIds,
          updatedAt: nowMs,
        });

        // Redirect: serve the first stale prerequisite instead
        const firstNewSc = newSessionChunks[0];
        selected = {
          id: firstNewSc.id,
          sessionId: firstNewSc.sessionId,
          chunkId: firstNewSc.chunkId,
          status: firstNewSc.status,
          timeSpentMs: firstNewSc.timeSpentMs,
          createdAt: firstNewSc.createdAt,
          updatedAt: firstNewSc.updatedAt,
        };

        // Re-fetch sessionChunks and reorder by updated chunkIds for correct chunk_index
        sessionChunks = orderBySessionChunkIds(
          await deps.sessions.getSessionChunks(session.id),
          updatedChunkIds
        );

        // Re-fetch chunk data for the new selection
        const newChunkData = await deps.chunks.getWithContent(selected.chunkId);
        if (!newChunkData) {
          return {
            status: 'error',
            message: `Stale prerequisite chunk ${selected.chunkId} not found in database.`,
          };
        }
        chunkData = newChunkData;

        logEvent('teachNext', 'stale_prereqs_inserted', {
          sessionId: session.id,
          dependentChunkId: originalChunkId,
          stalePrereqIds,
          count: stalePrereqIds.length,
        });
      }
    }
  } catch (err) {
    stalePrereqIds = [];
    getRequestLogger().error(
      { err },
      'Prerequisite staleness check failed — proceeding with original chunk'
    );
  }

  // 6. Determine mode
  const isRequeued = chunkHasAttempts(selected);
  const mode: 'learning' | 'retrieval' = isRequeued ? 'retrieval' : 'learning';
  const drillFormat: DrillFormat = mode === 'retrieval' ? 'open_ended' : 'explanation';

  // 7. Fetch prerequisite context, historical feedback, notes, and topic chunks (parallel)
  const [prerequisiteRows, historicalFeedback, chunkNotes, topicChunksMinimal] = await Promise.all([
    deps.chunks.getPrerequisiteContext(chunkData.topicId, chunkData.createdAt),
    deps.sessions.getHistoricalFeedbackForChunks([selected.chunkId], {
      excludeSessionId: session.id,
      limit: 5,
    }),
    deps.notes?.getNotesForChunkIds([selected.chunkId]) ?? Promise.resolve([]),
    deps.chunks.batchFetchMinimal({ topicId: chunkData.topicId }),
  ]);
  const prerequisiteContext: PrerequisiteContextItem[] = prerequisiteRows.map(r => ({
    chunk_id: r.id,
    title: r.title,
    condensed_summary: r.condensedSummary,
  }));

  const previousSessionFeedback: PromptFeedbackEntry[] = historicalFeedback.map(hf => ({
    sessionMode: hf.session_mode,
    completedAt: hf.completed_at,
    feedback: hf.feedback,
  }));

  // 7b. Classify current chunk (retrievability + tier assignment)
  const now = new Date();
  const classifyInput: ClassifyChunkInput = {
    easeFactor: chunkData.easeFactor,
    repetitions: chunkData.repetitions,
    nextReviewAt: chunkData.nextReviewAt,
    intervalDays: chunkData.intervalDays,
  };
  const teachingDecision = classifyChunk(classifyInput, now);

  // Override drill_format based on tier (scaffold uses recognition, others keep mode-based)
  const tierDrillFormat: DrillFormat =
    teachingDecision.teachingApproach === 'scaffold'
      ? 'multiple_choice'
      : teachingDecision.teachingApproach === 'reteach' ||
          teachingDecision.teachingApproach === 'cued_recall'
        ? 'open_ended'
        : drillFormat;

  // 7c. Compute topic-level staleness profile
  const topicChunkInputs: TopicChunkInput[] = topicChunksMinimal.map(c => ({
    id: c.id,
    easeFactor: c.easeFactor,
    repetitions: c.repetitions,
    nextReviewAt: c.nextReviewAt,
    intervalDays: c.intervalDays,
  }));
  // Build prerequisite map from chunk metadata (scoped to this topic)
  const topicPrerequisites = new Map<string, string[]>();
  for (const c of topicChunksMinimal) {
    if (c.prerequisitesJson && c.prerequisitesJson.length > 0) {
      topicPrerequisites.set(c.id, c.prerequisitesJson);
    }
  }
  const topicProfile = computeTopicProfile(
    chunkData.topicId,
    topicChunkInputs,
    topicPrerequisites,
    now
  );

  // 7d. Determine is_first_chunk_in_topic from session state
  // A chunk is "first in topic" if no other chunk from the same topic has been
  // completed or is currently in_progress within this session.
  const topicChunkIdSet = new Set(topicChunksMinimal.map(c => c.id));
  const isFirstChunkInTopic = !sessionChunks.some(
    sc =>
      sc.chunkId !== selected.chunkId &&
      topicChunkIdSet.has(sc.chunkId) &&
      (sc.status === 'completed' || sc.status === 'in_progress')
  );

  // 8. Hydrate PromptPack — tier-branched instruction
  const chunkIndex = sessionChunks.findIndex(sc => sc.id === selected.id) + 1;

  const promptContext = {
    chunkNumber: chunkIndex,
    totalChunks: sessionChunks.length,
    chunkTitle: chunkData.title,
    chunkContent: chunkData.content ?? undefined,
    prerequisites: chunkData.prerequisitesJson?.join(', '),
    drillFormat: tierDrillFormat,
    masteryLevel: chunkData.repetitions > 0 ? Math.min(chunkData.repetitions, 5) : undefined,
    subject: chunkData.subject,
    previousSessionFeedback:
      previousSessionFeedback.length > 0 ? previousSessionFeedback : undefined,
  };

  // Use tier-branched instruction instead of mode-based prompt selection
  let instruction = promptPack.getTierInstruction(teachingDecision.teachingApproach, promptContext);

  // Prepend topic orientation when needed and this is the first chunk in the topic
  if (topicProfile.needsTopicOrientation && isFirstChunkInTopic) {
    instruction =
      promptPack.getTopicOrientationInstruction(chunkData.topicTitle ?? chunkData.title) +
      instruction;
  }

  // Prepend prerequisite reteach context when stale prereqs were inserted
  if (stalePrereqIds.length > 0) {
    instruction =
      'This prerequisite is being revisited because its retrievability has decayed below the cued-recall threshold. Focus on rebuilding the foundation before advancing to dependent material.\n\n' +
      instruction;
  }

  // Mark chunk as in_progress
  await deps.sessions.updateSessionChunk(selected.id, { status: 'in_progress' });

  const reason = isRequeued ? 'requeued_failure' : 'fresh_pending';
  logEvent('teachNext', 'next_chunk_selected', {
    sessionId: session.id,
    chunkId: selected.chunkId,
    chunkTitle: chunkData.title,
    reason,
    teachingApproach: teachingDecision.teachingApproach,
  });

  const previousFeedbackStrings = historicalFeedback.map(hf => hf.feedback);

  return {
    status: 'teach',
    session_id: session.id,
    chunk_id: selected.chunkId,
    session_chunk_id: selected.id,
    chunk_index: chunkIndex,
    total_chunks: sessionChunks.length,
    mode,
    instruction,
    drill_format: tierDrillFormat,
    content_status: chunkData.contentStatus,
    ...(prerequisiteContext.length > 0 && { prerequisite_context: prerequisiteContext }),
    ...(previousFeedbackStrings.length > 0 && { previous_feedback: previousFeedbackStrings }),
    ...(chunkNotes.length > 0 && {
      notes: chunkNotes.map(n => ({
        id: n.id,
        note_type: n.noteType,
        content: n.content,
        author: n.author,
        created_at: n.createdAt,
      })),
    }),
    ...(completedChunkReviewUpdate && { review_update: completedChunkReviewUpdate }),
    // NEU-313: prerequisite reteach IDs when stale prereqs were inserted
    ...(stalePrereqIds.length > 0 && { prerequisite_reteach_needed: stalePrereqIds }),
    // NEU-312: per-chunk retrievability + tier assignment
    teaching_approach: teachingDecision.teachingApproach,
    estimated_retrievability: teachingDecision.estimatedRetrievability,
    days_overdue: teachingDecision.daysOverdue,
    reteach_compression: teachingDecision.reteachCompression,
    storage_strength_estimate: teachingDecision.storageStrengthEstimate,
    // NEU-312: topic-level staleness context
    topic_staleness_profile: topicProfile,
    is_first_chunk_in_topic: isFirstChunkInTopic,
    dominant_tier: topicProfile.dominantTier,
  };
}

// ── Assessment mode ─────────────────────────────────────────────

/**
 * Assessment mode: return the next unanswered question in questionIndex order.
 * No teaching instruction — just the question and its mapped chunk IDs.
 */
async function getNextAssessmentStep(
  session: LearningSession,
  sessionChunks: SessionChunk[],
  deps: TeachingDeps
): Promise<TeachNextResponse> {
  const [allQuestions, allAttempts] = await Promise.all([
    deps.sessionQuestions.getQuestionsForSession(session.id),
    deps.sessionQuestions.getAllAttemptsForSession(session.id),
  ]);

  if (allQuestions.length === 0) {
    // sessionChunks guaranteed non-empty by caller's length check
    return {
      status: 'blocked',
      message:
        'Assessment session has no questions. Call create_session_questions to add questions.',
      current_chunk_id: (sessionChunks[0] as SessionChunk).chunkId,
    };
  }

  // Batch-fetch chunk mappings — allQuestions.length > 0 guarantees non-empty IDs
  const questionIds = allQuestions.map(q => q.id);
  const chunkMapping = await deps.sessionQuestions.getChunkIdsForQuestions(questionIds);

  // Find next unanswered question (ordered by questionIndex)
  const sorted = [...allQuestions].sort((a, b) => a.questionIndex - b.questionIndex);
  const nextQuestion = sorted.find(q => q.status === 'pending');

  if (!nextQuestion) {
    // All questions answered — build complete response
    const questionsByChunkId = new Map<string, SessionQuestion[]>();
    for (const q of allQuestions) {
      for (const cid of mapGetList(chunkMapping, q.id)) {
        const list = mapGetList(questionsByChunkId, cid);
        list.push(q);
        questionsByChunkId.set(cid, list);
      }
    }

    const attemptsByQuestion = new Map<string, SessionQuestionAttempt[]>();
    for (const a of allAttempts) {
      const list = mapGetList(attemptsByQuestion, a.sessionQuestionId);
      list.push(a);
      attemptsByQuestion.set(a.sessionQuestionId, list);
    }

    return buildCompleteResponse(sessionChunks, questionsByChunkId, attemptsByQuestion);
  }

  // Use pre-fetched chunk mapping for this question
  const questionChunkIds = mapGetList(chunkMapping, nextQuestion.id);

  // Return the question without teaching instruction
  // sessionChunks guaranteed non-empty by caller's length check
  const firstChunk = sessionChunks[0] as SessionChunk;
  const primaryChunkId = questionChunkIds[0] ?? firstChunk.chunkId;
  const matchedSessionChunk = sessionChunks.find(sc => sc.chunkId === primaryChunkId);

  // Fetch actual content_status for the primary chunk
  const chunkMeta = await deps.chunks.getById(primaryChunkId);

  return {
    status: 'teach',
    session_id: session.id,
    chunk_id: primaryChunkId,
    session_chunk_id: matchedSessionChunk?.id ?? firstChunk.id,
    chunk_index: nextQuestion.questionIndex,
    total_chunks: allQuestions.length,
    mode: 'assessment',
    instruction: nextQuestion.promptText,
    drill_format: 'open_ended',
    content_status: chunkMeta?.contentStatus ?? 'final',
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
 * Submit the learner's answer for the current in-progress chunk.
 *
 * Two input paths (discriminated union):
 * - Inline: `promptText` + `chunkIds` → atomically creates a SessionQuestion, then records the first attempt.
 * - Retry: `sessionQuestionId` → records a subsequent attempt on an existing question.
 *
 * Quality is agent-provided (0–5). `passed` is derived from quality >= 3 when omitted.
 */
export async function submitAnswer(
  input: SubmitAnswerInput,
  deps: TeachingDeps
): Promise<SubmitAnswerResult> {
  // Retry path: delegate directly to submitAnswerForQuestion, which resolves
  // the session via the question's own sessionId. This intentionally skips the
  // active-session check, allowing retries on questions from completed sessions
  // (late submissions) and avoiding redundant validation already performed by
  // the inline path that created the question.
  if ('sessionQuestionId' in input) {
    return submitAnswerForQuestion(input, input.sessionQuestionId, deps);
  }

  // Inline path: create the question, then delegate
  // 1. Get active session
  const session = await deps.sessions.getActiveSession();
  if (!session) {
    return {
      status: 'error',
      message:
        'No active session. It may have auto-completed or not been created yet. Start a new session to continue.',
    };
  }

  // 2. Find the in-progress chunk
  const sessionChunks = await deps.sessions.getSessionChunks(session.id);
  const inProgressChunk = sessionChunks.find(sc => sc.status === 'in_progress');
  if (!inProgressChunk) {
    return { status: 'error', message: 'No in-progress chunk. Call teach_next first.' };
  }

  // 3. Validate chunkIds: teaching mode requires exactly 1 ID matching the in-progress chunk
  if (input.chunkIds.length !== 1 || input.chunkIds[0] !== inProgressChunk.chunkId) {
    return {
      status: 'error',
      message: `In teaching mode, chunk_ids must contain exactly the in-progress chunk: ["${inProgressChunk.chunkId}"].`,
    };
  }

  // 4. Compute questionIndex = existing session questions count + 1
  const allSessionQuestions = await deps.sessionQuestions.getQuestionsForSession(session.id);
  const newQuestionIndex = allSessionQuestions.length + 1;

  // 5. Atomically create the question
  let created;
  try {
    created = await deps.sessionQuestions.createQuestions(
      session.id,
      [{ promptText: input.promptText, chunkIds: input.chunkIds }],
      newQuestionIndex
    );
  } catch (err: unknown) {
    if (isPgUniqueViolation(err, 'uq_session_questions_session_index')) {
      return { status: 'error', message: 'Question already created (concurrent request).' };
    }
    throw err;
  }
  if (!created[0]) {
    return { status: 'error', message: 'Failed to create session question.' };
  }

  // 6. Delegate to shared explicit questions flow
  return submitAnswerForQuestion(input, created[0].id, deps);
}

// ── create_session_questions ─────────────────────────────────────

/**
 * Create explicit questions for a session.
 * Validates the session exists, is active, and chunk_ids are valid per mode.
 */
export async function createSessionQuestions(
  input: CreateSessionQuestionsInput,
  deps: TeachingDeps
): Promise<CreateSessionQuestionsResult> {
  // Validate active session exists
  const session = await deps.sessions.getActiveSession();
  if (!session) {
    return { status: 'error', message: 'No active session. Call create_session first.' };
  }

  if (session.id !== input.sessionId) {
    return {
      status: 'error',
      message: `Session ${input.sessionId} is not the active session.`,
    };
  }

  // Fetch session chunks and existing questions for validation
  const sessionChunks = await deps.sessions.getSessionChunks(session.id);
  const sessionChunkMap = new Map(sessionChunks.map(sc => [sc.chunkId, sc]));
  const existingQuestions = await deps.sessionQuestions.getQuestionsForSession(session.id);

  // Validate all chunk_ids across all questions exist in the session
  const allChunkIds = new Set(input.questions.flatMap(q => q.chunkIds));
  for (const chunkId of allChunkIds) {
    if (!sessionChunkMap.has(chunkId)) {
      return { status: 'error', message: `Chunk ${chunkId} not found in session.` };
    }
  }

  const isTeachingMode = session.mode !== 'assessment';
  if (isTeachingMode) {
    // Teaching mode: each question must have exactly 1 chunk_id, chunk must be in_progress
    for (const q of input.questions) {
      if (q.chunkIds.length !== 1) {
        return {
          status: 'error',
          message: `Teaching mode requires exactly 1 chunk_id per question, got ${q.chunkIds.length}.`,
        };
      }
      const chunkId = q.chunkIds[0] as string; // length === 1 guaranteed by check above
      const sc = sessionChunkMap.get(chunkId);
      if (sc && sc.status !== 'in_progress') {
        return {
          status: 'error',
          message: `Session chunk for ${q.chunkIds[0]} is "${sc.status}", expected "in_progress".`,
        };
      }
    }
  }

  // Compute startIndex: session-scoped, so use existing question count + 1
  const startIndex = existingQuestions.length + 1;

  let created;
  try {
    created = await deps.sessionQuestions.createQuestions(
      input.sessionId,
      input.questions,
      startIndex
    );
  } catch (err: unknown) {
    if (isPgUniqueViolation(err, 'uq_session_questions_session_index')) {
      return { status: 'error', message: 'Questions already created (concurrent request).' };
    }
    throw err;
  }

  return {
    status: 'created' as const,
    sessionId: input.sessionId,
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
 * Records an attempt for a session question (inline or retry path).
 * Writes to session_question_attempts, derives quality per question.
 * Chunk completion and SR update are deferred to getNextTeachingStep.
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

  // 2. Look up the session that owns this question (not just the active one)
  const session = await deps.sessions.getSessionById(question.sessionId);
  if (!session) {
    return { status: 'error', message: 'Session not found for this question.' };
  }

  // 3. Resolve chunk(s) via junction
  const questionChunkIds = await deps.sessionQuestions.getChunkIdsForQuestion(sessionQuestionId);
  if (questionChunkIds.length === 0) {
    return {
      status: 'error',
      message: `Question ${sessionQuestionId} has no chunk mapping.`,
    };
  }

  const sessionChunks = await deps.sessions.getSessionChunks(session.id);

  // Assessment mode: single attempt, fan-out SR to all mapped chunks
  if (session.mode === 'assessment') {
    return submitAnswerForAssessmentQuestion(
      input,
      question,
      session,
      sessionQuestionId,
      questionChunkIds,
      sessionChunks,
      deps
    );
  }

  // Teaching mode
  const isLateSubmission = session.status === 'completed';

  // Find the single mapped session chunk
  const primaryChunkId = questionChunkIds[0] as string;
  const sessionChunk = sessionChunks.find(sc => sc.chunkId === primaryChunkId);
  if (!sessionChunk) {
    return { status: 'error', message: `Session chunk for ${primaryChunkId} not found.` };
  }

  // 3b. Guard: chunk must still be in_progress.
  // Late submissions are fine here — auto-complete only triggers when ALL chunks are completed,
  // so a late submission's target chunk is always still in_progress.
  if (sessionChunk.status !== 'in_progress') {
    return {
      status: 'error',
      message: `Session chunk for ${primaryChunkId} is "${sessionChunk.status}", expected "in_progress".`,
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

  // Derive passed from quality when omitted; explicit passed overrides quality-based derivation
  // (e.g. passed=true + quality=2 is valid — agent has discretion over the pass/fail judgment)
  const passed = input.passed ?? input.quality >= 3;
  const quality = input.quality;

  // 5. Persist attempt
  try {
    await deps.sessionQuestions.createAttempt({
      id: crypto.randomUUID(),
      sessionQuestionId,
      attemptNumber,
      response: input.response,
      passed,
      feedback: input.feedback,
      quality,
      agentQuality: input.quality,
      questionType: input.questionType,
      timeSpentMs: input.timeSpentMs,
      createdAt: Date.now(),
    });
  } catch (err: unknown) {
    if (isPgUniqueViolation(err, 'uq_session_question_attempts_question_number')) {
      return { status: 'error', message: 'Attempt already recorded' };
    }
    throw err;
  }

  logEvent('submitAnswer', 'answer_recorded', {
    sessionId: session.id,
    chunkId: primaryChunkId,
    passed,
    quality,
    attemptNumber,
  });

  // 6. Update question status when passed
  if (passed) {
    await deps.sessionQuestions.updateQuestionStatus(sessionQuestionId, 'answered');
  }

  // 7. First attempt failed → retry
  if (!passed && attemptNumber === 1) {
    return {
      status: 'retry',
      session_question_id: sessionQuestionId,
      attempt: attemptNumber,
      chunk_id: primaryChunkId,
      message: 'Incorrect. Try again.',
      feedback: input.feedback,
    };
  }

  // 8. Second attempt or passed → recorded. If second attempt failed, still mark answered.
  if (!passed && attemptNumber === 2) {
    await deps.sessionQuestions.updateQuestionStatus(sessionQuestionId, 'answered');
  }

  // Chunk stays in_progress; SR + completion are handled by teach_next.
  return {
    status: 'recorded',
    session_question_id: sessionQuestionId,
    attempt: attemptNumber,
    passed,
    quality,
    question_type: input.questionType,
    chunk_id: primaryChunkId,
    ...(isLateSubmission && { late_submission: true }),
    reflect: SUBMIT_ANSWER_REFLECT_PROMPT,
  };
}

// ── Assessment mode submit_answer ───────────────────────────────

/**
 * Assessment mode submit_answer: single attempt per question, SR fan-out to all mapped chunks.
 * Pass → quality 5, fail → quality 1 (no retry).
 */
async function submitAnswerForAssessmentQuestion(
  input: SubmitAnswerInput,
  question: SessionQuestion,
  session: LearningSession,
  sessionQuestionId: string,
  questionChunkIds: string[],
  sessionChunks: SessionChunk[],
  deps: TeachingDeps
): Promise<SubmitAnswerResult> {
  // Assessment: max 1 attempt per question
  const existingAttempts = await deps.sessionQuestions.getAttemptsForQuestion(sessionQuestionId);
  if (existingAttempts.length >= 1) {
    return {
      status: 'error',
      message: `Assessment allows 1 attempt per question. Question ${sessionQuestionId} already answered.`,
    };
  }

  // Assessment: derive passed, then override quality to 5/1 for SR.
  // Agent-provided quality is preserved separately in agentQuality for analytics.
  const passed = input.passed ?? input.quality >= 3;
  const quality = passed ? 5 : 1;

  try {
    await deps.sessionQuestions.createAttempt({
      id: crypto.randomUUID(),
      sessionQuestionId,
      attemptNumber: 1,
      response: input.response,
      passed,
      feedback: input.feedback,
      quality,
      agentQuality: input.quality,
      questionType: input.questionType,
      timeSpentMs: input.timeSpentMs,
      createdAt: Date.now(),
    });
  } catch (err: unknown) {
    if (isPgUniqueViolation(err, 'uq_session_question_attempts_question_number')) {
      return { status: 'error', message: 'Attempt already recorded' };
    }
    throw err;
  }

  await deps.sessionQuestions.updateQuestionStatus(sessionQuestionId, 'answered');

  // Fan out SR update to ALL mapped chunks
  const reviewDeps: reviewWorkflows.ReviewDeps = {
    reviewPersistence: deps.reviewPersistence,
    algorithmConfig: deps.algorithmConfig,
  };

  const reviewResults = await Promise.all(
    questionChunkIds.map(chunkId =>
      reviewWorkflows.processReviewResult(
        chunkId,
        quality,
        { timeSpentMs: Math.round(input.timeSpentMs / questionChunkIds.length) },
        reviewDeps
      )
    )
  );

  // Align with teaching mode: surface SR persistence failures
  const srFailures = reviewResults.filter(r => !r.success);
  if (srFailures.length > 0) {
    return {
      status: 'error',
      message: `Failed to persist SR update for ${srFailures.length} of ${questionChunkIds.length} chunk(s).`,
    };
  }

  // Build review_update from the primary chunk's SR result
  const primaryReview = reviewResults[0];
  const reviewUpdate =
    primaryReview && primaryReview.success
      ? {
          next_review_date: new Date(primaryReview.data.updated.nextReviewAt)
            .toISOString()
            .split('T')[0],
          interval_days: primaryReview.data.updated.intervalDays,
          ease_factor: primaryReview.data.updated.easeFactor,
          is_leech: primaryReview.data.isLeech,
        }
      : undefined;

  // Mark session_chunks as completed when all their mapped questions are answered
  const allSessionQuestions = await deps.sessionQuestions.getQuestionsForSession(session.id);
  const allQIds = allSessionQuestions.map(q => q.id);
  const allChunkMapping = await deps.sessionQuestions.getChunkIdsForQuestions(allQIds);

  for (const chunkId of questionChunkIds) {
    const questionsForChunk = allSessionQuestions.filter(q => {
      const mapped = mapGetList(allChunkMapping, q.id);
      return mapped.includes(chunkId);
    });
    const allAnswered = questionsForChunk.every(q => q.status !== 'pending');
    if (allAnswered) {
      const sc = sessionChunks.find(s => s.chunkId === chunkId);
      if (sc && sc.status !== 'completed') {
        await deps.sessions.updateSessionChunk(sc.id, {
          status: 'completed',
          updatedAt: Date.now(),
        });
      }
    }
  }

  const isLateSubmission = session.status === 'completed';

  return {
    status: 'recorded',
    session_question_id: sessionQuestionId,
    attempt: 1,
    passed,
    quality,
    question_type: input.questionType,
    chunk_id: questionChunkIds[0] as string,
    review_update: reviewUpdate,
    ...(isLateSubmission && { late_submission: true }),
    reflect: SUBMIT_ANSWER_REFLECT_PROMPT,
  };
}

// Summary is chunk-centric: total = number of chunks, not questions.
// A cross-chunk question (Q→[C1,C2]) that passes counts as "passed" for both C1 and C2,
// which is intentional — each chunk's mastery is assessed by its mapped questions.
export function buildCompleteResponse(
  sessionChunks: SessionChunk[],
  questionsByChunkId: Map<string, SessionQuestion[]>,
  attemptsByQuestion: Map<string, SessionQuestionAttempt[]>
): TeachNextComplete {
  const total = sessionChunks.length;
  let passedFirstTry = 0;
  let neededRetry = 0;
  let exhaustedRetries = 0;

  for (const sc of sessionChunks) {
    const questions = mapGetList(questionsByChunkId, sc.chunkId);
    const allAttempts = questions.flatMap(q => mapGetList(attemptsByQuestion, q.id));
    if (allAttempts.length === 0) continue;

    // Per-question first-attempt check: each question must have exactly 1 attempt that passed.
    const allPassedFirstTry = questions.every(q => {
      const attempts = mapGetList(attemptsByQuestion, q.id);
      return attempts.length === 1 && (attempts[0] as SessionQuestionAttempt).passed;
    });

    if (allPassedFirstTry) {
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
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
  sessionQuestions: SessionQuestionRepository;
  notes?: NotesRepository;
};

/**
 * Quick-start: check for active session → pick highest-urgency topic → create single-topic session → teach first chunk.
 */
export async function startLearning(
  input: StartLearningInput,
  deps: StartLearningDeps
): Promise<StartLearningResult> {
  // 1. Check for active session
  const sessionDeps: sessionWorkflows.SessionDeps = {
    sessions: deps.sessions,
    chunks: deps.chunks,
    maxDependencyDepth: 0, // not used for session creation from explicit chunkIds
  };
  const activeSession = await sessionWorkflows.getActiveSession(sessionDeps);
  if (activeSession) {
    // Check if all session chunks are completed (or session is empty)
    const sessionChunks = await deps.sessions.getSessionChunks(activeSession.id);
    const allCompleted =
      sessionChunks.length === 0 || sessionChunks.every(sc => sc.status === 'completed');

    if (allCompleted) {
      // Auto-complete the finished session, then fall through to start a fresh one
      const completeResult = await sessionWorkflows.completeSession(
        activeSession.id,
        undefined,
        sessionDeps
      );
      if (!completeResult.success) {
        getRequestLogger().error(
          `Failed to auto-complete session ${activeSession.id}: ${completeResult.error.message}`
        );
        return {
          status: 'error',
          message: 'Failed to auto-complete finished session. Please try again.',
        };
      }
    } else {
      // Resume the active session — get the next teaching step
      const teachingDeps: TeachingDeps = {
        sessions: deps.sessions,
        chunks: deps.chunks,
        reviewPersistence: deps.reviewPersistence,
        algorithmConfig: deps.algorithmConfig,
        sessionQuestions: deps.sessionQuestions,
        notes: deps.notes,
      };
      const firstChunk = await getNextTeachingStep(teachingDeps);
      logEvent('startLearning', 'session_resumed', { sessionId: activeSession.id });
      return {
        status: 'resumed' as const,
        session_id: activeSession.id,
        mode: activeSession.mode as SessionMode,
        total_chunks: sessionChunks.length,
        first_chunk: firstChunk,
      };
    }
  }

  // 2. Get topic-level recommendations
  const recDeps: recommendationWorkflows.RecommendationDeps = {
    chunks: deps.chunks,
    algorithmConfig: deps.algorithmConfig,
  };
  const now = new Date();
  const recommendations = await recommendationWorkflows.generateRecommendations(
    { subjectFilter: input.subjectFilter, limit: 1 },
    recDeps,
    now
  );

  if (recommendations.recommendations.length === 0) {
    return {
      status: 'nothing_due',
      message: input.subjectFilter
        ? `No items due for review in subject "${input.subjectFilter}".`
        : 'No items due for review. Add new content or wait for items to become due.',
    };
  }

  // 3. Pick highest-urgency topic
  const topRec = recommendations.recommendations[0];
  const chunkIds = topRec.dueChunkIds;
  const mode: 'learning' | 'review' = topRec.hasNewChunks ? 'learning' : 'review';

  // 4. Create session
  const sessionResult = await sessionWorkflows.createSession(
    {
      chunkIds,
      mode,
      estimatedDuration: topRec.estimatedDuration,
    },
    sessionDeps
  );

  if (!sessionResult.success) {
    return {
      status: 'error',
      message: `Failed to create session: ${sessionResult.error.message}`,
    };
  }

  // 5. Get first teaching step
  const teachingDeps: TeachingDeps = {
    sessions: deps.sessions,
    chunks: deps.chunks,
    reviewPersistence: deps.reviewPersistence,
    algorithmConfig: deps.algorithmConfig,
    sessionQuestions: deps.sessionQuestions,
    notes: deps.notes,
  };
  const firstChunk = await getNextTeachingStep(teachingDeps);

  logEvent('startLearning', 'session_started', {
    sessionId: sessionResult.data.sessionId,
    mode,
    chunkCount: chunkIds.length,
  });

  // 6. Return combined result
  return {
    status: 'started',
    session_id: sessionResult.data.sessionId,
    mode,
    total_chunks: chunkIds.length,
    estimated_duration: topRec.estimatedDuration,
    first_chunk: firstChunk,
    recommendation_summary: `Picked topic "${topRec.topicTitle}" (urgency ${topRec.urgencyScore}): ${topRec.urgencyReason}`,
  };
}
