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
import { dependencyResolver } from '../domain/algorithms/dependency-resolver.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';
import { logger } from '../shared/logger.js';

export type SessionDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
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
): Promise<{ session: LearningSession | null; chunks: SessionChunk[] }> {
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

export async function getSessionById(
  sessionId: string,
  deps: SessionDeps
): Promise<LearningSession | null> {
  return deps.sessions.getSessionById(sessionId);
}

export async function getActiveSession(deps: SessionDeps): Promise<LearningSession | null> {
  return deps.sessions.getActiveSession();
}

export async function createSessionChunk(
  input: CreateSessionChunkInput,
  deps: SessionDeps
): Promise<SessionChunk> {
  return deps.sessions.createSessionChunk(input);
}

export async function validateChunkIds(
  chunkIds: string[],
  deps: SessionDeps
): Promise<ChunkValidationResult> {
  return deps.sessions.validateChunkIds(chunkIds);
}

export async function getSessionChunks(
  sessionId: string,
  deps: SessionDeps
): Promise<SessionChunk[]> {
  return deps.sessions.getSessionChunks(sessionId);
}

export async function resolveSessionChunkDependencies(
  chunkIds: string[],
  deps: SessionDeps
): Promise<{
  resolvedChunkIds: string[];
  addedPrerequisites: string[];
  message: string;
}> {
  if (!chunkIds || chunkIds.length === 0) {
    return { resolvedChunkIds: [], addedPrerequisites: [], message: '' };
  }

  const inputChunkSet = new Set(chunkIds);
  const chunkMap = new Map<string, LearningItem>();
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
          logger.warn(
            `Skipping chunk ${currentId} while resolving session dependencies - not found in database`
          );
          continue;
        }
        item = mapChunkRowToLearningItem(chunkRow) as LearningItem;
        chunkMap.set(currentId, item);
      }

      const prerequisites = item.prerequisites || [];
      for (const prereqId of prerequisites) {
        if (!visited.has(prereqId)) queue.push(prereqId);
      }
    }

    if (missingRequestedChunks.length > 0) {
      logger.warn(
        `Cannot resolve dependencies for missing requested chunks: ${missingRequestedChunks.join(', ')}`
      );
      return { resolvedChunkIds: chunkIds, addedPrerequisites: [], message: '' };
    }

    const relevantItems = Array.from(chunkMap.entries())
      .filter(([id]) => visited.has(id))
      .map(([, item]) => item);

    if (relevantItems.length === 0) {
      return { resolvedChunkIds: chunkIds, addedPrerequisites: [], message: '' };
    }

    const resolution = await dependencyResolver.resolveDependencies(relevantItems, chunkIds);

    if (!resolution.isValid) {
      logger.warn('Dependency resolution failed for session chunks:', resolution.errors.join(', '));
      return { resolvedChunkIds: chunkIds, addedPrerequisites: [], message: '' };
    }

    const existingResolvedChain = resolution.resolvedChain.filter((id: string) => chunkMap.has(id));
    const chunkIdSet = new Set(chunkIds);
    const addedPrerequisites = existingResolvedChain.filter((id: string) => !chunkIdSet.has(id));

    const messageParts: string[] = [];
    if (addedPrerequisites.length > 0) {
      messageParts.push(
        `Automatically included ${addedPrerequisites.length} prerequisite${addedPrerequisites.length > 1 ? 's' : ''} to ensure proper learning progression.`
      );
    }
    if (missingPrerequisites.length > 0) {
      messageParts.push(
        `Skipped ${missingPrerequisites.length} missing prerequisite${missingPrerequisites.length > 1 ? 's' : ''}: ${missingPrerequisites.join(', ')}.`
      );
      logger.warn(
        `Skipped missing prerequisite chunks during session dependency resolution: ${missingPrerequisites.join(', ')}`
      );
    }

    const message = messageParts.length > 0 ? ` ${messageParts.join(' ')}` : '';
    return { resolvedChunkIds: existingResolvedChain, addedPrerequisites, message };
  } catch (error) {
    logger.error('Error resolving session chunk dependencies:', error);
    return { resolvedChunkIds: chunkIds, addedPrerequisites: [], message: '' };
  }
}
