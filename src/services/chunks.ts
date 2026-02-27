import { and, eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, type SqlDb } from '../db/operations.js';
import { learningChunks, learningTopics, type LearningChunkRow } from '../db/schema.js';
import { dependencyResolver } from '../algorithms/dependency-resolver.js';
import { hasSignificantContentChange } from '../utils/content-similarity.js';
import { extractErrorMessage } from '../utils/errors.js';
import { prerequisiteReferenceValidator } from './chunk-prerequisites.js';
import {
  CHUNK_COLUMNS_WITH_TOPIC,
  CHUNK_CONTENT_COLUMNS,
  mapChunkRowToLearningItem,
} from './chunk-queries.js';

export type ChunkOperationError = {
  type: 'validation' | 'not_found' | 'database';
  message: string;
  field?: string;
  retryable?: boolean;
};

export type CreateChunkInput = {
  id: string;
  topicId: string;
  title: string;
  subject: string;
  difficulty: number;
  nextReviewAt: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt?: number;
  estimatedDuration: number;
  chunkType: 'new' | 'review' | 'remediation';
  prerequisites?: string[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  // Content persistence fields
  content?: string;
  contentVersion?: number;
  contentUpdatedAt?: number;
};

export async function createChunk(input: CreateChunkInput, db: SqlDb = getSql()): Promise<void> {
  await db.insert(learningChunks).values({
    ...input,
    prerequisitesJson: input.prerequisites ?? null,
    tagsJson: input.tags ?? null,
    content: input.content || null,
    contentVersion: input.content ? input.contentVersion || 1 : null,
    contentUpdatedAt: input.content ? input.contentUpdatedAt || Date.now() : null,
  });
}

export async function getChunk(id: string, db: SqlDb = getSql()) {
  const [row] = await db.select().from(learningChunks).where(eq(learningChunks.id, id));
  return row;
}

export async function updateChunk(
  id: string,
  changes: Partial<Omit<CreateChunkInput, 'id' | 'topicId' | 'createdAt'>>,
  db: SqlDb = getSql()
): Promise<number> {
  const updatePayload: Record<string, unknown> = { ...changes };

  // Handle JSON fields - remove original fields to avoid conflicts
  if (changes.prerequisites) {
    updatePayload.prerequisitesJson = changes.prerequisites;
    delete updatePayload.prerequisites;
  }
  if (changes.tags) {
    updatePayload.tagsJson = changes.tags;
    delete updatePayload.tags;
  }

  // Handle nullable lastReviewedAt field explicitly
  if (changes.lastReviewedAt !== undefined) {
    updatePayload.lastReviewedAt = changes.lastReviewedAt;
  }

  const res = await db.update(learningChunks).set(updatePayload).where(eq(learningChunks.id, id));
  return res.rowCount ?? 0;
}

// Enhanced update functions for content and metadata management

export type UpdateChunkContentInput = {
  content: string;
  resetProgress?: boolean;
};

export type UpdateChunkContentResult = {
  success: boolean;
  chunk?: LearningChunkRow;
  progressReset?: boolean;
  error?: ChunkOperationError;
};

export type UpdateChunkMetadataInput = {
  title?: string;
  difficulty?: number;
  prerequisites?: string[];
  tags?: string[];
  estimatedDuration?: number;
};

export type UpdateChunkMetadataResult = {
  success: boolean;
  chunk?: LearningChunkRow;
  error?: ChunkOperationError;
};

export type UpdateChunkWithProgressResetInput = {
  content?: string;
  title?: string;
  difficulty?: number;
  prerequisites?: string[];
  tags?: string[];
  estimatedDuration?: number;
  forceReset?: boolean;
};

export type UpdateChunkWithProgressResetResult = {
  success: boolean;
  chunk?: LearningChunkRow;
  progressReset?: boolean;
  error?: ChunkOperationError;
};

// Shared fetch-validate-update-refetch helper for all chunk update functions

type ChunkUpdateResult = {
  success: boolean;
  chunk?: LearningChunkRow;
  progressReset?: boolean;
  error?: {
    type: 'validation' | 'not_found' | 'database';
    message: string;
    field?: string;
  };
};

type BuildFieldsFn = (
  currentChunk: LearningChunkRow,
  now: number
) => { fields: Record<string, unknown>; progressReset?: boolean };

async function updateChunkFields(
  id: string,
  buildFields: BuildFieldsFn,
  errorLabel: string,
  db: SqlDb
): Promise<ChunkUpdateResult> {
  try {
    const currentChunk = await getChunk(id, db);
    if (!currentChunk) {
      return {
        success: false,
        error: { type: 'not_found', message: `Chunk with id "${id}" not found` },
      };
    }

    const now = Date.now();
    const { fields, progressReset } = buildFields(currentChunk, now);

    const res = await db.update(learningChunks).set(fields).where(eq(learningChunks.id, id));
    if (res.rowCount === 0) {
      return {
        success: false,
        error: { type: 'database', message: `Failed to update chunk ${errorLabel}` },
      };
    }

    const updatedChunk = await getChunk(id, db);
    return {
      success: true,
      chunk: updatedChunk || undefined,
      progressReset,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'database',
        message: extractErrorMessage(error),
      },
    };
  }
}

function applyProgressReset(data: Record<string, unknown>, now: number): void {
  data.repetitions = 0;
  data.easeFactor = 2.5;
  data.nextReviewAt = now;
  data.lastReviewedAt = null;
}

function applyMetadataFields(
  data: Record<string, unknown>,
  input: {
    title?: string;
    difficulty?: number;
    estimatedDuration?: number;
    prerequisites?: string[];
    tags?: string[];
  }
): void {
  if (input.title !== undefined) data.title = input.title;
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.estimatedDuration !== undefined) data.estimatedDuration = input.estimatedDuration;
  if (input.prerequisites !== undefined) data.prerequisitesJson = input.prerequisites;
  if (input.tags !== undefined) data.tagsJson = input.tags;
}

function applyContentFields(
  data: Record<string, unknown>,
  content: string,
  currentChunk: LearningChunkRow,
  now: number
): void {
  data.content = content;
  data.contentVersion = (currentChunk.contentVersion || 1) + 1;
  data.contentUpdatedAt = now;
}

export async function updateChunkContent(
  id: string,
  input: UpdateChunkContentInput,
  db: SqlDb = getSql()
): Promise<UpdateChunkContentResult> {
  return updateChunkFields(
    id,
    (currentChunk, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      applyContentFields(fields, input.content, currentChunk, now);
      const progressReset = input.resetProgress || false;
      if (progressReset) applyProgressReset(fields, now);
      return { fields, progressReset };
    },
    'content',
    db
  );
}

export async function updateChunkMetadata(
  id: string,
  input: UpdateChunkMetadataInput,
  db: SqlDb = getSql()
): Promise<UpdateChunkMetadataResult> {
  return updateChunkFields(
    id,
    (_currentChunk, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      applyMetadataFields(fields, input);
      return { fields };
    },
    'metadata',
    db
  );
}

export async function updateChunkWithProgressReset(
  id: string,
  input: UpdateChunkWithProgressResetInput,
  db: SqlDb = getSql()
): Promise<UpdateChunkWithProgressResetResult> {
  return updateChunkFields(
    id,
    (currentChunk, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      if (input.content !== undefined) applyContentFields(fields, input.content, currentChunk, now);
      applyMetadataFields(fields, input);

      let shouldReset = input.forceReset || false;
      if (input.content && currentChunk.content) {
        if (hasSignificantContentChange(currentChunk.content, input.content, 0.5)) {
          shouldReset = true;
        }
      }
      if (shouldReset) applyProgressReset(fields, now);

      return { fields, progressReset: shouldReset };
    },
    'with progress reset',
    db
  );
}

export type ChunkDependencyCleanup = {
  chunkId: string;
  chunkTitle: string;
  removedPrerequisites: string[];
  previousPrerequisites: string[];
  remainingPrerequisites: string[];
};

export type DeleteChunkResult = {
  success: boolean;
  chunk?: LearningChunkRow;
  removedDependencies?: ChunkDependencyCleanup[];
  error?: ChunkOperationError;
};

async function findDependentChunks(id: string, db: SqlDb) {
  return await db
    .select({ ...CHUNK_COLUMNS_WITH_TOPIC, ...CHUNK_CONTENT_COLUMNS })
    .from(learningChunks)
    .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
    .where(
      sql`
        ${learningChunks.id} != ${id}
        AND ${learningChunks.prerequisitesJson} IS NOT NULL
        AND ${learningChunks.prerequisitesJson}::jsonb @> to_jsonb(ARRAY[${id}]::text[])::jsonb
      `
    );
}

type DependentRow = Awaited<ReturnType<typeof findDependentChunks>>[number];

async function resolveDeleteOrder(
  dependentRows: DependentRow[],
  dependentIds: string[]
): Promise<string[]> {
  if (dependentIds.length === 0) return dependentIds;

  const dependentItems = dependentRows.map(row => mapChunkRowToLearningItem(row));
  const resolution = await dependencyResolver.resolveDependencies(dependentItems, dependentIds);
  return resolution.isValid && resolution.resolvedChain.length > 0
    ? resolution.resolvedChain.filter(chunkId => dependentIds.includes(chunkId))
    : dependentIds;
}

export async function deleteChunk(id: string, db: SqlDb = getSql()): Promise<DeleteChunkResult> {
  try {
    const chunkToDelete = await getChunk(id, db);

    if (!chunkToDelete) {
      return {
        success: false,
        error: { type: 'not_found', message: `Chunk with id "${id}" not found`, retryable: false },
      };
    }

    const dependentRows = await findDependentChunks(id, db);
    const dependentIds = dependentRows.map(row => row.id);
    const orderedDependentIds = await resolveDeleteOrder(dependentRows, dependentIds);
    const dependentRowMap = new Map(dependentRows.map(row => [row.id, row]));

    const dependencyUpdates = await db.transaction(async tx => {
      const now = Date.now();
      const updates: ChunkDependencyCleanup[] = [];

      for (const dependentId of orderedDependentIds) {
        const candidate = dependentRowMap.get(dependentId);
        if (!candidate) continue;

        const prerequisites = candidate.prerequisitesJson ?? [];
        if (prerequisites.length === 0) continue;

        const remaining = prerequisites.filter(prereqId => prereqId !== id);
        if (remaining.length === prerequisites.length) continue;

        await tx
          .update(learningChunks)
          .set({ prerequisitesJson: remaining, updatedAt: now })
          .where(eq(learningChunks.id, candidate.id));

        updates.push({
          chunkId: candidate.id,
          chunkTitle: candidate.title,
          removedPrerequisites: prerequisites.filter(prereqId => prereqId === id),
          previousPrerequisites: prerequisites,
          remainingPrerequisites: remaining,
        });
      }

      const deleteResult = await tx.delete(learningChunks).where(eq(learningChunks.id, id));
      if ((deleteResult.rowCount ?? 0) === 0) {
        throw new Error('Failed to delete chunk from database');
      }

      return updates;
    });

    prerequisiteReferenceValidator.clearCache();

    return { success: true, chunk: chunkToDelete, removedDependencies: dependencyUpdates };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'database',
        message: extractErrorMessage(error),
        retryable: true,
      },
    };
  }
}

// Enhanced createChunk with auto-topic creation
export async function createChunkWithTopic(
  input: CreateChunkInput & { topicTitle?: string },
  db: SqlDb = getSql()
): Promise<LearningChunkRow> {
  // If topicTitle is provided but topicId is not, find existing topic or create a new one
  let finalTopicId = input.topicId;
  if (input.topicTitle && !finalTopicId) {
    // Check if topic already exists with the same title and subject
    const [existingTopic] = await db
      .select()
      .from(learningTopics)
      .where(
        and(eq(learningTopics.title, input.topicTitle), eq(learningTopics.subject, input.subject))
      );

    if (existingTopic) {
      finalTopicId = existingTopic.id;
    } else {
      // Create new topic
      finalTopicId = crypto.randomUUID();
      const now = Date.now();
      await db.insert(learningTopics).values({
        id: finalTopicId,
        title: input.topicTitle,
        subject: input.subject,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Create the chunk
  await db.insert(learningChunks).values({
    ...input,
    topicId: finalTopicId,
    prerequisitesJson: input.prerequisites ?? null,
    tagsJson: input.tags ?? null,
  });

  // Return the created chunk
  const createdChunk = await getChunk(input.id, db);
  if (!createdChunk) {
    throw new Error(`Failed to create chunk with id: ${input.id}`);
  }

  return createdChunk;
}

// Content retrieval functions

export type ChunkContentResult = {
  content: string | null;
  contentVersion: number | null;
  contentUpdatedAt: number | null;
};

export async function getChunkContent(
  id: string,
  db: SqlDb = getSql()
): Promise<ChunkContentResult | null> {
  const [result] = await db
    .select({
      content: learningChunks.content,
      contentVersion: learningChunks.contentVersion,
      contentUpdatedAt: learningChunks.contentUpdatedAt,
    })
    .from(learningChunks)
    .where(eq(learningChunks.id, id));

  return result || null;
}

export async function getChunkWithContent(
  id: string,
  db: SqlDb = getSql()
): Promise<(LearningChunkRow & { topicTitle?: string | null }) | null> {
  const [result] = await db
    .select({ ...CHUNK_COLUMNS_WITH_TOPIC, ...CHUNK_CONTENT_COLUMNS })
    .from(learningChunks)
    .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
    .where(eq(learningChunks.id, id));

  return result || null;
}
