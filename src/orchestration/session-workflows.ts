import crypto from 'node:crypto';
import type {
  SessionRepository,
  CreateSessionInput,
  CreateSessionChunkInput,
  ChunkValidationResult,
} from '../ports/session-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { SessionInput, HistoricalFeedback, BatchOperation } from '../domain/types/session.js';
import type { LearningItem } from '../domain/types/recommendations.js';
import type { LearningSession, SessionChunk } from '../domain/types/entities.js';
import type { ServiceResult } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { DependencyResolver } from '../domain/algorithms/dependency-resolver.js';
import {
  classifyChunk,
  RECALL_THRESHOLD,
  type ClassifyChunkInput,
} from '../domain/algorithms/classify-chunk.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';
import { getRequestLogger, logEvent } from '../shared/logger.js';
import { isPgUniqueViolation } from '../shared/errors.js';

export type SessionDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
  maxDependencyDepth: number;
};

/**
 * NEU-1018: resolve the single topic a set of chunk ids span, or `null` when they span zero,
 * two or more distinct topics — the "ambiguous / no-topic" bucket.
 */
async function resolveChunkTopicId(
  chunkIds: string[],
  deps: Pick<SessionDeps, 'chunks'>
): Promise<string | null> {
  if (chunkIds.length === 0) return null;
  const topicIds = new Set<string>();
  for (const chunkId of chunkIds) {
    const chunk = await deps.chunks.getById(chunkId);
    if (chunk) topicIds.add(chunk.topicId);
  }
  return topicIds.size === 1 ? ((topicIds.values().next().value as string) ?? null) : null;
}

/**
 * NEU-1018: resolve an active session's own single topic — its persisted `topicId` if set,
 * else the single topic its `session_chunks` span, else `null` (the "no-topic bucket": no
 * single topic can be determined, so any topic switch pauses it).
 */
export async function resolveActiveSessionTopicId(
  session: Pick<LearningSession, 'id' | 'topicId'>,
  deps: SessionDeps
): Promise<string | null> {
  if (session.topicId) return session.topicId;
  const sessionChunks = await deps.sessions.getSessionChunks(session.id);
  return resolveChunkTopicId(
    sessionChunks.map(sc => sc.chunkId),
    deps
  );
}

/**
 * NEU-1018: resolve a `create_session` request's own single topic — the explicit `topicId` if
 * given, else the single topic its `chunkIds` span, else `null` (no `topicId` and no/ambiguous
 * `chunkIds` — the same "no-topic bucket" `resolveActiveSessionTopicId` returns for a session).
 */
export async function resolveRequestTopicId(
  input: { topicId?: string; chunkIds?: string[] },
  deps: SessionDeps
): Promise<string | null> {
  if (input.topicId) return input.topicId;
  return resolveChunkTopicId(input.chunkIds ?? [], deps);
}

/**
 * NEU-1021: find the learner's most recently paused session whose *resolved* topic
 * (via `resolveActiveSessionTopicId` — never a bare `topic_id` column check) matches the
 * requested scope: a real topic id, or `null` for the no-topic bucket. `getPausedSessions`
 * already orders most-recently-paused first, so the first match wins.
 */
export async function findMostRecentlyPausedSession(
  learnerKey: string | null,
  requestedTopicId: string | null,
  deps: SessionDeps
): Promise<LearningSession | null> {
  const pausedSessions = await deps.sessions.getPausedSessions(learnerKey);
  for (const session of pausedSessions) {
    const resolvedTopicId = await resolveActiveSessionTopicId(session, deps);
    if (resolvedTopicId === requestedTopicId) {
      return session;
    }
  }
  return null;
}

/**
 * NEU-1021: recompute a paused session's `session_chunks` against the current review
 * schedule. `completed` rows are never touched. Non-completed rows no longer due (per the
 * same canonical due/draft/leech filter `generateRecommendations` uses, scoped to the
 * session's own existing chunk ids) are removed — their attempt history lives on
 * `session_question_attempts`/`session_questions`, keyed off the chunk id, not the
 * `session_chunks` row, so it survives the removal. For a real `topicId`, chunks newly due
 * in that topic and not already present are admitted as `pending`. The no-topic bucket
 * (`topicId === null`) has no single topic to source additions from, so it only ever sheds
 * chunks that fell out of due — it never gains new ones.
 */
export async function recomputePausedSessionChunks(
  session: Pick<LearningSession, 'id'>,
  topicId: string | null,
  deps: SessionDeps
): Promise<void> {
  const existingChunks = await deps.sessions.getSessionChunks(session.id);
  const existingChunkIds = new Set(existingChunks.map(sc => sc.chunkId));
  const nonCompleted = existingChunks.filter(sc => sc.status !== 'completed');

  if (nonCompleted.length > 0) {
    const stillDue = await deps.chunks.list({
      dueOnly: true,
      excludeDraft: true,
      isLeech: false,
      chunkIds: nonCompleted.map(sc => sc.chunkId),
    });
    const stillDueIds = new Set(stillDue.map(c => c.id));
    for (const sc of nonCompleted) {
      if (!stillDueIds.has(sc.chunkId)) {
        await deps.sessions.deleteSessionChunk(sc.id);
      }
    }
  }

  if (topicId !== null) {
    const dueInTopic = await deps.chunks.list({
      topicId,
      dueOnly: true,
      excludeDraft: true,
      isLeech: false,
    });
    const now = Date.now();
    let index = 0;
    for (const chunk of dueInTopic) {
      if (existingChunkIds.has(chunk.id)) continue;
      await deps.sessions.createSessionChunk({
        id: crypto.randomUUID(),
        sessionId: session.id,
        chunkId: chunk.id,
        status: 'pending',
        createdAt: now + index,
        updatedAt: now + index,
      });
      index++;
    }
  }
}

export async function createSession(
  input: {
    topicId?: string;
    chunkIds?: string[];
    mode: string;
    estimatedDuration?: number;
  },
  learnerKey: string | null,
  deps: SessionDeps
): Promise<ServiceResult<{ sessionId: string }>> {
  try {
    // Assessment mode requires non-empty chunk_ids
    if (input.mode === 'assessment') {
      if (!input.chunkIds || input.chunkIds.length === 0) {
        return serviceFail({
          type: 'validation',
          message: 'Assessment mode requires non-empty chunk_ids.',
        });
      }
    }

    if (input.chunkIds && input.chunkIds.length > 0) {
      const validation = await deps.sessions.validateChunkIds(input.chunkIds);
      if (!validation.valid) {
        return serviceFail({
          type: 'validation',
          message: `Invalid chunk IDs: ${validation.invalidIds.join(', ')}`,
        });
      }
    }

    const activeSession = await deps.sessions.getActiveSession(learnerKey);
    if (activeSession) {
      const activeSessionChunks = await deps.sessions.getSessionChunks(activeSession.id);
      // NEU-1018: unlike startLearning's always-populated sessions, create_session legitimately
      // creates sessions with zero chunks (the ROLLING SESSION FLOW pattern — chunks are added
      // one at a time via create_session_chunk afterward). Treating a fresh, empty session as
      // "all completed" would silently auto-complete it instead of running the pause/reject
      // check below, so only a non-empty, fully-completed chunk set counts here.
      const allCompleted =
        activeSessionChunks.length > 0 &&
        activeSessionChunks.every(sc => sc.status === 'completed');

      if (allCompleted) {
        // NEU-1018: a fully completed active session auto-completes rather than pausing or
        // blocking the new session's creation — same rule as startLearning's.
        const completeResult = await completeSession(activeSession.id, undefined, learnerKey, deps);
        if (!completeResult.success) {
          // NEU-1033: completeSession() reports a concurrently-vanished/changed session as a
          // structured conflict (mirroring the pause branch's row-count check) — preserve that
          // shape rather than flattening it into a generic database error.
          if (completeResult.error.type === 'conflict') {
            return serviceFail(completeResult.error);
          }
          return serviceFail({
            type: 'database',
            message: `Failed to auto-complete finished session: ${completeResult.error.message}`,
          });
        }
      } else {
        // NEU-1018: a same-topic (or same no-topic-bucket) request is rejected so the caller
        // resumes via start_learning; any genuinely different topic pauses the active session
        // (chunk progress intact) and proceeds to create the requested one — never a rejection.
        const [requestTopicId, activeTopicId] = await Promise.all([
          resolveRequestTopicId({ topicId: input.topicId, chunkIds: input.chunkIds }, deps),
          resolveActiveSessionTopicId(activeSession, deps),
        ]);
        const isSameTopic =
          (requestTopicId !== null && requestTopicId === activeTopicId) ||
          (requestTopicId === null && activeTopicId === null);

        if (isSameTopic) {
          return serviceFail({
            type: 'conflict',
            message:
              'Active session already exists for this topic. Call start_learning to resume it.',
            findings: {
              code: 'active_session_exists_same_topic',
              session_id: activeSession.id,
              topic_id: activeSession.topicId,
              mode: activeSession.mode,
              started_at: activeSession.startTime,
            },
          });
        }

        const pausedAt = Date.now();
        const pausedRowCount = await deps.sessions.updateSession(
          activeSession.id,
          {
            status: 'paused',
            pausedAt,
            updatedAt: pausedAt,
          },
          'active'
        );
        if (pausedRowCount === 0) {
          return serviceFail({
            type: 'conflict',
            message:
              'Active session changed concurrently and could not be paused; no new session was created.',
            findings: {
              code: 'active_session_concurrently_modified',
              session_id: activeSession.id,
            },
          });
        }
        logEvent('createSession', 'session_paused', {
          sessionId: activeSession.id,
          requestedTopicId: input.topicId,
        });
      }
    }

    const now = Date.now();
    const sessionId = crypto.randomUUID();
    const sessionInput: CreateSessionInput = {
      id: sessionId,
      topicId: input.topicId,
      chunkIds: input.chunkIds,
      mode: input.mode,
      estimatedDuration: input.estimatedDuration,
      startTime: now,
      createdAt: now,
      updatedAt: now,
      learnerKey,
    };

    try {
      await deps.sessions.createSession(sessionInput);
    } catch (insertError) {
      // NEU-1042: the partial unique index (`learning_sessions_active_per_learner_key`) is the
      // DB-level backstop for the CAS-guarded pause above — any caller that bypasses the CAS
      // path (or a race the CAS path itself can't observe, e.g. this insert racing a
      // concurrent createSession) still surfaces as a structured conflict, never a generic
      // `database` error.
      if (isPgUniqueViolation(insertError, 'uq_learning_sessions_active_learner_key')) {
        return serviceFail({
          type: 'conflict',
          message: 'An active session already exists for this learner; could not create a new one.',
          findings: { code: 'active_session_exists_concurrently' },
        });
      }
      throw insertError;
    }
    logEvent('createSession', 'session_created', {
      sessionId,
      mode: input.mode,
      requestedChunkCount: input.chunkIds?.length ?? 0,
    });
    return serviceOk({ sessionId });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: error instanceof Error ? error.message : 'Failed to create session',
    });
  }
}

export async function completeSession(
  sessionId: string,
  feedback: string | undefined,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<ServiceResult<void>> {
  try {
    const session = await deps.sessions.getSessionById(sessionId, learnerKey);
    if (!session) {
      return serviceFail({ type: 'not_found', message: `Session ${sessionId} not found` });
    }
    // NEU-1042: complete is an active -> completed transition, mirroring pause's
    // active -> paused and resume's paused -> active — the CAS guard requires 'active' rather
    // than echoing back whatever status was just read (which would make the guard tautological
    // and unable to ever detect a race). Completing an already-paused session is out of scope
    // for this transition and now correctly reports the existing conflict shape instead of
    // silently succeeding, per CI DISTILL feedback on this PR reconciling the earlier
    // verify-spec finding, which was itself mistaken.
    const completedRowCount = await deps.sessions.completeSession(sessionId, feedback, 'active');
    if (completedRowCount === 0) {
      // NEU-1033: the session existed at the read above but the write itself affected zero
      // rows — it changed concurrently between the read and the write. Report a structured
      // conflict rather than silently claiming success, mirroring createSession's pause-branch
      // row-count check.
      return serviceFail({
        type: 'conflict',
        message: 'Session changed concurrently and could not be completed.',
        findings: { code: 'active_session_concurrently_modified', session_id: sessionId },
      });
    }
    logEvent('completeSession', 'session_completed', { sessionId });
    return serviceOk();
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: error instanceof Error ? error.message : 'Failed to complete session',
    });
  }
}

export async function getSessionWithChunks(
  sessionId: string,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<{ session: LearningSession | null; chunks: SessionChunk[] }> {
  return deps.sessions.getSessionWithChunks(sessionId, learnerKey);
}

export async function convertSessionToSessionInput(
  sessionId: string,
  options: { includeHistoricalFeedback?: boolean; historicalFeedbackLimit?: number } | undefined,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<SessionInput | null> {
  return deps.sessions.convertSessionToSessionInput(sessionId, learnerKey, options);
}

export async function getHistoricalFeedback(
  chunkIds: string[],
  options: { limit?: number; excludeSessionId?: string } | undefined,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<HistoricalFeedback[]> {
  return deps.sessions.getHistoricalFeedbackForChunks(chunkIds, learnerKey, options);
}

export async function batchUpdateSessionChunks(
  sessionId: string,
  operations: BatchOperation[],
  learnerKey: string | null,
  deps: SessionDeps
): Promise<ServiceResult<{ created: number; updated: number; unchanged: number }>> {
  try {
    const session = await deps.sessions.getSessionById(sessionId, learnerKey);
    if (!session) {
      return serviceFail({ type: 'not_found', message: `Session ${sessionId} not found` });
    }

    const existingChunks = await deps.sessions.getSessionChunks(sessionId);
    const result = await deps.sessions.persistBatchSessionChunkOperations({
      sessionId,
      operations,
      existingChunks,
    });

    logEvent('batchUpdateSessionChunks', 'chunks_updated', {
      sessionId,
      createdCount: result.created,
      updatedCount: result.updated,
      unchangedCount: result.unchanged,
    });
    return serviceOk({
      created: result.created,
      updated: result.updated,
      unchanged: result.unchanged,
    });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: error instanceof Error ? error.message : 'Failed to batch update session chunks',
    });
  }
}

export async function getSessionById(
  sessionId: string,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<LearningSession | null> {
  return deps.sessions.getSessionById(sessionId, learnerKey);
}

export async function getActiveSession(
  learnerKey: string | null,
  deps: SessionDeps
): Promise<LearningSession | null> {
  return deps.sessions.getActiveSession(learnerKey);
}

/**
 * NEU-1044: verify the target session belongs to the calling learner (via the
 * already-scoped `getSessionById`) before inserting a `session_chunks` row —
 * mirrors the `getSessionById`-then-fail pattern `batchUpdateSessionChunks`
 * already uses, so a caller can no longer insert a chunk into any session by
 * guessing/observing its id.
 */
export async function createSessionChunk(
  input: CreateSessionChunkInput,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<ServiceResult<SessionChunk>> {
  try {
    const session = await deps.sessions.getSessionById(input.sessionId, learnerKey);
    if (!session) {
      return serviceFail({ type: 'not_found', message: `Session ${input.sessionId} not found` });
    }
    const chunk = await deps.sessions.createSessionChunk(input);
    return serviceOk(chunk);
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: error instanceof Error ? error.message : 'Failed to create session chunk',
    });
  }
}

export async function validateChunkIds(
  chunkIds: string[],
  deps: SessionDeps
): Promise<ChunkValidationResult> {
  return deps.sessions.validateChunkIds(chunkIds);
}

/**
 * NEU-1015: `sessionId` here is a raw, caller-supplied id (the `ctx.getSessionChunks`
 * entry point), not necessarily downstream of an already-scoped lookup in the same
 * request — re-verify ownership via the now-scoped `getSessionById` first, so a
 * not-found is reported (and no chunk read) before any chunk data is returned.
 */
export async function getSessionChunks(
  sessionId: string,
  learnerKey: string | null,
  deps: SessionDeps
): Promise<SessionChunk[]> {
  const session = await deps.sessions.getSessionById(sessionId, learnerKey);
  if (!session) return [];
  return deps.sessions.getSessionChunks(sessionId);
}

export async function resolveSessionChunkDependencies(
  chunkIds: string[],
  deps: SessionDeps
): Promise<{
  resolvedChunkIds: string[];
  addedPrerequisites: string[];
  skippedMasteredPrerequisites: string[];
  message: string;
  estimatedDuration: number;
}> {
  if (!chunkIds || chunkIds.length === 0) {
    return {
      resolvedChunkIds: [],
      addedPrerequisites: [],
      skippedMasteredPrerequisites: [],
      message: '',
      estimatedDuration: 0,
    };
  }

  const inputChunkSet = new Set(chunkIds);
  const chunkMap = new Map<string, LearningItem>();
  // Retrievability inputs preserved per chunk — LearningItem drops the epoch
  // nextReviewAt and intervalDays that classifyChunk needs (NEU-840).
  const classifyInputByChunk = new Map<string, ClassifyChunkInput>();
  const missingPrerequisites: string[] = [];
  const missingRequestedChunks: string[] = [];
  const queue: string[] = [...chunkIds];
  const visited = new Set<string>();

  try {
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;
      visited.add(currentId);

      let item = chunkMap.get(currentId);
      if (!item) {
        const chunkRow = await deps.chunks.getById(currentId);
        if (!chunkRow) {
          if (inputChunkSet.has(currentId)) {
            missingRequestedChunks.push(currentId);
          } else {
            missingPrerequisites.push(currentId);
          }
          getRequestLogger().warn(
            `Skipping chunk ${currentId} while resolving session dependencies - not found in database`
          );
          continue;
        }
        item = mapChunkRowToLearningItem(chunkRow) as LearningItem;
        chunkMap.set(currentId, item);
        classifyInputByChunk.set(currentId, {
          easeFactor: chunkRow.easeFactor,
          repetitions: chunkRow.repetitions,
          nextReviewAt: chunkRow.nextReviewAt,
          intervalDays: chunkRow.intervalDays,
        });
      }

      const prerequisites = item.prerequisites || [];
      for (const prereqId of prerequisites) {
        if (!visited.has(prereqId)) queue.push(prereqId);
      }
    }

    if (missingRequestedChunks.length > 0) {
      getRequestLogger().warn(
        `Cannot resolve dependencies for missing requested chunks: ${missingRequestedChunks.join(', ')}`
      );
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        skippedMasteredPrerequisites: [],
        message: '',
        estimatedDuration: 0,
      };
    }

    const relevantItems = Array.from(chunkMap.entries())
      .filter(([id]) => visited.has(id))
      .map(([, item]) => item);

    if (relevantItems.length === 0) {
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        skippedMasteredPrerequisites: [],
        message: '',
        estimatedDuration: 0,
      };
    }

    const resolver = new DependencyResolver(deps.maxDependencyDepth);
    const resolution = resolver.resolveDependencies(relevantItems, chunkIds);

    if (!resolution.isValid) {
      getRequestLogger().warn(
        'Dependency resolution failed for session chunks:',
        resolution.errors.join(', ')
      );
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        skippedMasteredPrerequisites: [],
        message: '',
        estimatedDuration: 0,
      };
    }

    const existingResolvedChain = resolution.resolvedChain.filter((id: string) => chunkMap.has(id));
    const chunkIdSet = new Set(chunkIds);
    const allAddedPrerequisites = existingResolvedChain.filter((id: string) => !chunkIdSet.has(id));

    // Partition auto-added prerequisites into mastered and non-mastered.
    // Mastery is a compound gate: a prerequisite is skipped only when it has
    // been successfully reviewed at least once (repetitions > 0) AND its
    // estimated retrievability is still at/above the recall tier (R >= 0.7).
    // classifyChunk scores never-reviewed chunks as R = 1.0, so the
    // repetitions guard is what keeps fresh prerequisites in the session; a
    // once-reviewed prerequisite whose memory has decayed below 0.7 re-enters
    // (NEU-840).
    const now = new Date();
    const skippedMasteredPrerequisites: string[] = [];
    const addedPrerequisites: string[] = [];
    for (const id of allAddedPrerequisites) {
      const item = chunkMap.get(id);
      const classifyInput = classifyInputByChunk.get(id);
      const isMastered =
        item !== undefined &&
        item.repetitions > 0 &&
        classifyInput !== undefined &&
        classifyChunk(classifyInput, now).estimatedRetrievability >= RECALL_THRESHOLD;
      if (isMastered) {
        skippedMasteredPrerequisites.push(id);
      } else {
        addedPrerequisites.push(id);
      }
    }

    // Remove mastered auto-added prerequisites from the resolved chain
    const masteredSet = new Set(skippedMasteredPrerequisites);
    const filteredResolvedChain = existingResolvedChain.filter(
      (id: string) => !masteredSet.has(id)
    );

    const messageParts: string[] = [];
    if (addedPrerequisites.length > 0) {
      messageParts.push(
        `Automatically included ${addedPrerequisites.length} prerequisite${addedPrerequisites.length > 1 ? 's' : ''} to ensure proper learning progression.`
      );
    }
    if (skippedMasteredPrerequisites.length > 0) {
      const titles = skippedMasteredPrerequisites
        .map(id => chunkMap.get(id)?.title ?? id)
        .join(', ');
      messageParts.push(
        `Skipped ${skippedMasteredPrerequisites.length} mastered prerequisite${skippedMasteredPrerequisites.length > 1 ? 's' : ''} (${titles}).`
      );
    }
    if (missingPrerequisites.length > 0) {
      messageParts.push(
        `Skipped ${missingPrerequisites.length} missing prerequisite${missingPrerequisites.length > 1 ? 's' : ''}: ${missingPrerequisites.join(', ')}.`
      );
      getRequestLogger().warn(
        `Skipped missing prerequisite chunks during session dependency resolution: ${missingPrerequisites.join(', ')}`
      );
    }

    const message = messageParts.length > 0 ? ` ${messageParts.join(' ')}` : '';
    // Recompute estimatedDuration from the resolved chain (includes injected prerequisites)
    // All IDs in filteredResolvedChain are guaranteed to exist in chunkMap
    const estimatedDuration = filteredResolvedChain.reduce(
      (sum, id) => sum + (chunkMap.get(id) as LearningItem).estimatedDuration,
      0
    );
    return {
      resolvedChunkIds: filteredResolvedChain,
      addedPrerequisites,
      skippedMasteredPrerequisites,
      message,
      estimatedDuration,
    };
  } catch (error) {
    getRequestLogger().error('Error resolving session chunk dependencies:', error);
    return {
      resolvedChunkIds: chunkIds,
      addedPrerequisites: [],
      skippedMasteredPrerequisites: [],
      message: '',
      estimatedDuration: 0,
    };
  }
}
