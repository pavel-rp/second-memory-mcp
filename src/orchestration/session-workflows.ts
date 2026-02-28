import crypto from 'node:crypto';
import type { SessionRepository, CreateSessionInput } from '../ports/session-repository.js';
import type { SessionInput, HistoricalFeedback, BatchOperation } from '../domain/types/session.js';
import type { LearningSessionRow, SessionChunkRow } from '../infrastructure/db/schema.js';
import type { ServiceResult } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';

export type SessionDeps = {
  sessions: SessionRepository;
};

export async function createSession(
  input: {
    topicId?: string;
    chunkIds?: string[];
    mode: string;
    estimatedDuration?: number;
  },
  deps: SessionDeps
): Promise<ServiceResult<{ sessionId: string }>> {
  try {
    const activeSession = await deps.sessions.getActiveSession();
    if (activeSession) {
      return serviceFail({
        type: 'conflict',
        message:
          'Active session already exists. Please complete the current session before creating a new one.',
      });
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
    };

    await deps.sessions.createSession(sessionInput);
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
  deps: SessionDeps
): Promise<ServiceResult<void>> {
  try {
    const session = await deps.sessions.getSessionById(sessionId);
    if (!session) {
      return serviceFail({ type: 'not_found', message: `Session ${sessionId} not found` });
    }
    await deps.sessions.completeSession(sessionId, feedback);
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
  deps: SessionDeps
): Promise<{ session: LearningSessionRow | null; chunks: SessionChunkRow[] }> {
  return deps.sessions.getSessionWithChunks(sessionId);
}

export async function convertSessionToSessionInput(
  sessionId: string,
  options: { includeHistoricalFeedback?: boolean; historicalFeedbackLimit?: number } | undefined,
  deps: SessionDeps
): Promise<SessionInput | null> {
  return deps.sessions.convertSessionToSessionInput(sessionId, options);
}

export async function getHistoricalFeedback(
  chunkIds: string[],
  options: { limit?: number; excludeSessionId?: string } | undefined,
  deps: SessionDeps
): Promise<HistoricalFeedback[]> {
  return deps.sessions.getHistoricalFeedbackForChunks(chunkIds, options);
}

export async function batchUpdateSessionChunks(
  sessionId: string,
  operations: BatchOperation[],
  deps: SessionDeps
): Promise<ServiceResult<{ created: number; updated: number; unchanged: number }>> {
  try {
    const session = await deps.sessions.getSessionById(sessionId);
    if (!session) {
      return serviceFail({ type: 'not_found', message: `Session ${sessionId} not found` });
    }

    const existingChunks = await deps.sessions.getSessionChunks(sessionId);
    const result = await deps.sessions.persistBatchSessionChunkOperations({
      sessionId,
      operations,
      existingChunks,
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
