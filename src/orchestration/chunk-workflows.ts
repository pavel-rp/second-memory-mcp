import crypto from 'node:crypto';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { TopicRepository } from '../ports/topic-repository.js';
import type { UnitOfWorkPort } from '../ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../ports/embedding-port.js';
import type { LearningChunk, NewLearningChunk } from '../domain/types/entities.js';
import type { ServiceResult, ServiceError } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { hasSignificantContentChange } from '../shared/content-similarity.js';
import { extractErrorMessage } from '../shared/errors.js';
import { dependencyResolver } from '../domain/algorithms/dependency-resolver.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';
import type { LearningItem } from '../domain/types/recommendations.js';
import { logger } from '../shared/logger.js';

export type ChunkDeps = {
  chunks: ChunkRepository;
  topics: TopicRepository;
  unitOfWork: UnitOfWorkPort;
  embedding?: EmbeddingPort;
};

export type ChunkUpdateResult = {
  success: boolean;
  chunk?: LearningChunk;
  progressReset?: boolean;
  error?: ServiceError;
};

export type ChunkDependencyCleanup = {
  chunkId: string;
  chunkTitle: string;
  removedPrerequisites: string[];
  previousPrerequisites: string[];
  remainingPrerequisites: string[];
};

export type DeleteChunkResult = {
  success: boolean;
  chunk?: LearningChunk;
  removedDependencies?: ChunkDependencyCleanup[];
  error?: ServiceError;
};

async function updateChunkFields(
  id: string,
  buildFields: (
    current: LearningChunk,
    now: number
  ) => { fields: Record<string, unknown>; progressReset?: boolean },
  deps: { chunks: ChunkRepository; embedding?: EmbeddingPort }
): Promise<ChunkUpdateResult> {
  try {
    const current = await deps.chunks.getById(id);
    if (!current) {
      return {
        success: false,
        error: { type: 'not_found', message: `Chunk with id "${id}" not found` },
      };
    }
    const now = Date.now();
    const { fields, progressReset } = buildFields(current, now);

    // When content changes, clear stale embedding first — if re-embedding fails,
    // we prefer no embedding over a misleading one from old content.
    if (typeof fields.content === 'string') {
      fields.contentEmbedding = null;
      if (deps.embedding) {
        try {
          const vector = await deps.embedding.embedText(fields.content as string);
          if (vector) fields.contentEmbedding = vector;
        } catch (err) {
          logger.warn('Embedding generation failed for chunk content:', err);
        }
      }
    }

    const rowCount = await deps.chunks.update(
      id,
      fields as Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>
    );
    if (rowCount === 0) {
      return { success: false, error: { type: 'database', message: 'Failed to update chunk' } };
    }
    const updated = await deps.chunks.getById(id);
    return { success: true, chunk: updated, progressReset };
  } catch (error) {
    return { success: false, error: { type: 'database', message: extractErrorMessage(error) } };
  }
}

// --- Public workflows ---

export async function updateChunkContent(
  id: string,
  input: { content: string; resetProgress?: boolean },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (current, now) => {
      const fields: Record<string, unknown> = {
        content: input.content,
        contentVersion: (current.contentVersion || 1) + 1,
        contentUpdatedAt: now,
        updatedAt: now,
      };
      const progressReset = input.resetProgress || false;
      if (progressReset) {
        fields.repetitions = 0;
        fields.easeFactor = 2.5;
        fields.nextReviewAt = now;
        fields.lastReviewedAt = null;
      }
      return { fields, progressReset };
    },
    deps
  );
}

export async function updateChunkContentWithAutoReset(
  id: string,
  input: { content: string },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (current, now) => {
      const fields: Record<string, unknown> = {
        content: input.content,
        contentVersion: (current.contentVersion || 1) + 1,
        contentUpdatedAt: now,
        updatedAt: now,
      };
      let progressReset = false;
      if (current.content && hasSignificantContentChange(current.content, input.content)) {
        fields.repetitions = 0;
        fields.easeFactor = 2.5;
        fields.nextReviewAt = now;
        fields.lastReviewedAt = null;
        progressReset = true;
      }
      return { fields, progressReset };
    },
    deps
  );
}

export async function updateChunkMetadata(
  id: string,
  input: {
    title?: string;
    difficulty?: number;
    prerequisites?: string[];
    tags?: string[];
    estimatedDuration?: number;
  },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (_current, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      if (input.title !== undefined) fields.title = input.title;
      if (input.difficulty !== undefined) fields.difficulty = input.difficulty;
      if (input.estimatedDuration !== undefined) fields.estimatedDuration = input.estimatedDuration;
      if (input.prerequisites !== undefined) fields.prerequisitesJson = input.prerequisites;
      if (input.tags !== undefined) fields.tagsJson = input.tags;
      return { fields };
    },
    deps
  );
}

export async function updateChunkWithProgressReset(
  id: string,
  input: {
    content?: string;
    title?: string;
    difficulty?: number;
    prerequisites?: string[];
    tags?: string[];
    estimatedDuration?: number;
    forceReset?: boolean;
  },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (current, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      if (input.content !== undefined) {
        fields.content = input.content;
        fields.contentVersion = (current.contentVersion || 1) + 1;
        fields.contentUpdatedAt = now;
      }
      if (input.title !== undefined) fields.title = input.title;
      if (input.difficulty !== undefined) fields.difficulty = input.difficulty;
      if (input.estimatedDuration !== undefined) fields.estimatedDuration = input.estimatedDuration;
      if (input.prerequisites !== undefined) fields.prerequisitesJson = input.prerequisites;
      if (input.tags !== undefined) fields.tagsJson = input.tags;

      let shouldReset = input.forceReset || false;
      if (
        input.content &&
        current.content &&
        hasSignificantContentChange(current.content, input.content)
      ) {
        shouldReset = true;
      }
      if (shouldReset) {
        fields.repetitions = 0;
        fields.easeFactor = 2.5;
        fields.nextReviewAt = now;
        fields.lastReviewedAt = null;
      }
      return { fields, progressReset: shouldReset };
    },
    deps
  );
}

export async function deleteChunk(id: string, deps: ChunkDeps): Promise<DeleteChunkResult> {
  try {
    const chunkToDelete = await deps.chunks.getById(id);
    if (!chunkToDelete) {
      return {
        success: false,
        error: { type: 'not_found', message: `Chunk with id "${id}" not found`, retryable: false },
      };
    }

    const dependentRows = await deps.chunks.findDependents(id);
    const dependentIds = dependentRows.map(r => r.id);

    // Resolve deletion order via dependency resolver
    let orderedIds = dependentIds;
    if (dependentRows.length > 0) {
      const items = dependentRows.map(r => mapChunkRowToLearningItem(r) as LearningItem);
      const resolution = await dependencyResolver.resolveDependencies(items, dependentIds);
      if (resolution.isValid && resolution.resolvedChain.length > 0) {
        orderedIds = resolution.resolvedChain.filter((cid: string) => dependentIds.includes(cid));
      }
    }

    const dependentMap = new Map(dependentRows.map(r => [r.id, r]));
    const cleanups: ChunkDependencyCleanup[] = [];

    await deps.unitOfWork.execute(async ports => {
      const now = Date.now();
      for (const depId of orderedIds) {
        const dep = dependentMap.get(depId);
        if (!dep) continue;
        const prereqs = dep.prerequisitesJson ?? [];
        const remaining = prereqs.filter(pid => pid !== id);
        if (remaining.length === prereqs.length) continue;
        await ports.chunks.update(depId, {
          prerequisitesJson: remaining,
          updatedAt: now,
        } as Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>);
        cleanups.push({
          chunkId: depId,
          chunkTitle: dep.title,
          removedPrerequisites: [id],
          previousPrerequisites: prereqs,
          remainingPrerequisites: remaining,
        });
      }
      const deleted = await ports.chunks.delete(id);
      if (deleted === 0) throw new Error('Failed to delete chunk from database');
    });

    return { success: true, chunk: chunkToDelete, removedDependencies: cleanups };
  } catch (error) {
    return {
      success: false,
      error: { type: 'database', message: extractErrorMessage(error), retryable: true },
    };
  }
}

export async function createChunkWithTopic(
  input: NewLearningChunk & { topicTitle?: string },
  deps: ChunkDeps
): Promise<ServiceResult<LearningChunk>> {
  try {
    let topicId = input.topicId;

    if (input.topicTitle && !topicId) {
      // Find existing topic by title+subject or create one
      const topics = await deps.topics.list();
      const existing = topics.find(
        t => t.title === input.topicTitle && t.subject === input.subject
      );
      if (existing) {
        topicId = existing.id;
      } else {
        topicId = crypto.randomUUID();
        const now = Date.now();
        await deps.topics.create({
          id: topicId,
          title: input.topicTitle,
          subject: input.subject,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await deps.chunks.create({ ...input, topicId });
    const created = await deps.chunks.getById(input.id);
    if (!created) {
      return serviceFail({
        type: 'database',
        message: `Failed to create chunk with id: ${input.id}`,
      });
    }

    // Generate embedding for chunk content (best-effort, outside transaction)
    const returnChunk = created;
    if (created.content && deps.embedding) {
      try {
        const vector = await deps.embedding.embedText(created.content);
        if (vector) {
          // contentEmbedding is infrastructure-only (not on domain type), cast required
          const rowCount = await deps.chunks.update(
            created.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { contentEmbedding: vector } as any
          );
          if (rowCount === 0) {
            logger.warn(`Failed to save content embedding for chunk ${created.id}`);
          }
        }
      } catch (err) {
        logger.warn('Embedding generation failed for new chunk:', err);
      }
    }

    return serviceOk(returnChunk);
  } catch (error) {
    return serviceFail({ type: 'database', message: extractErrorMessage(error) });
  }
}
