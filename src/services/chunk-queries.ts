import { and, eq, lte, sql } from 'drizzle-orm';
import { getSql, decodeJsonArray } from '../db/operations.js';
import { learningChunks, learningTopics, type LearningChunkRow } from '../db/schema.js';
import type {
  LearningItem,
  LearningItemWithContent,
  PaginatedLearningItemsResponse,
} from '../types/recommendations.js';

export type ListChunksFilter = {
  subject?: string;
  dueOnly?: boolean;
  limit?: number;
};

type ChunkFilterOptions = Pick<ListChunksFilter, 'subject' | 'dueOnly'> & {
  topicId?: string;
};

function buildChunkWhereClause(options: ChunkFilterOptions) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (options.topicId) conditions.push(eq(learningChunks.topicId, options.topicId));
  if (options.subject) conditions.push(eq(learningChunks.subject, options.subject));
  if (options.dueOnly) conditions.push(lte(learningChunks.nextReviewAt, Date.now()));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function toIsoDate(epochMs: number): string {
  const d = new Date(epochMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type ChunkListRow = LearningChunkRow & { topicTitle?: string | null };

type ChunkListRowWithContent = ChunkListRow & {
  content?: string | null;
  contentVersion?: number | null;
  contentUpdatedAt?: number | null;
};

export function mapChunkRowToLearningItem(row: ChunkListRow): LearningItem {
  const rawChunkType = row.chunkType;
  const chunkType: LearningItem['chunkType'] =
    rawChunkType === 'review' || rawChunkType === 'remediation' ? rawChunkType : 'new';
  const topicTitle = row.topicTitle ?? null;

  // Create the base LearningItem
  const learningItem: LearningItem = {
    id: row.id,
    title: row.title,
    subject: row.subject,
    difficulty: row.difficulty,
    nextReviewDate: toIsoDate(row.nextReviewAt),
    easeFactor: row.easeFactor,
    repetitions: row.repetitions,
    lastReviewed: row.lastReviewedAt ? toIsoDate(row.lastReviewedAt) : undefined,
    estimatedDuration: row.estimatedDuration,
    chunkType,
    prerequisites: decodeJsonArray(row.prerequisitesJson),
    tags: decodeJsonArray(row.tagsJson),
    topicId: topicTitle !== null ? row.topicId : undefined, // Only include if topic actually exists
    topicTitle: topicTitle ?? undefined,
  };

  return learningItem;
}

export function mapChunkRowToLearningItemWithContent(
  row: ChunkListRowWithContent
): LearningItemWithContent {
  // Start with the base mapping
  const baseItem = mapChunkRowToLearningItem(row);

  // Add content fields if they exist
  const contentItem: LearningItemWithContent = {
    ...baseItem,
    content: row.content ?? undefined,
    contentVersion: row.contentVersion ?? undefined,
    contentUpdatedAt: row.contentUpdatedAt ?? undefined,
  };

  return contentItem;
}

export async function listChunks(filter: ListChunksFilter = {}) {
  const db = getSql();
  const whereClause = buildChunkWhereClause(filter);

  let query = db
    .select({
      id: learningChunks.id,
      topicId: learningChunks.topicId,
      title: learningChunks.title,
      subject: learningChunks.subject,
      difficulty: learningChunks.difficulty,
      nextReviewAt: learningChunks.nextReviewAt,
      easeFactor: learningChunks.easeFactor,
      repetitions: learningChunks.repetitions,
      lastReviewedAt: learningChunks.lastReviewedAt,
      estimatedDuration: learningChunks.estimatedDuration,
      intervalDays: learningChunks.intervalDays,
      chunkType: learningChunks.chunkType,
      prerequisitesJson: learningChunks.prerequisitesJson,
      tagsJson: learningChunks.tagsJson,
      content: learningChunks.content,
      contentVersion: learningChunks.contentVersion,
      contentUpdatedAt: learningChunks.contentUpdatedAt,
      createdAt: learningChunks.createdAt,
      updatedAt: learningChunks.updatedAt,
      topicTitle: learningTopics.title,
    })
    .from(learningChunks)
    .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
    .$dynamic();

  if (whereClause) query = query.where(whereClause);
  if (filter.limit && filter.limit > 0) query = query.limit(filter.limit);

  return query.all();
}

export async function listChunksAsLearningItems(
  filter: ListChunksFilter = {}
): Promise<LearningItem[]> {
  const rows = await listChunks(filter);
  return rows.map(mapChunkRowToLearningItem);
}

export type ListChunksWithContentFilter = ListChunksFilter & {
  /**
   * Whether to include content fields in the response.
   * Content is expensive to retrieve and not included by default.
   * Set to true to explicitly include content fields.
   */
  includeContent?: boolean;
  /**
   * Offset for pagination (number of items to skip)
   */
  offset?: number;
};

export async function listChunksWithContent(
  filter: ListChunksWithContentFilter = { includeContent: false }
): Promise<PaginatedLearningItemsResponse> {
  const db = getSql();
  const whereClause = buildChunkWhereClause(filter);

  // Build base query including all fields
  const baseQuery = db
    .select({
      id: learningChunks.id,
      topicId: learningChunks.topicId,
      title: learningChunks.title,
      subject: learningChunks.subject,
      difficulty: learningChunks.difficulty,
      nextReviewAt: learningChunks.nextReviewAt,
      easeFactor: learningChunks.easeFactor,
      repetitions: learningChunks.repetitions,
      lastReviewedAt: learningChunks.lastReviewedAt,
      estimatedDuration: learningChunks.estimatedDuration,
      intervalDays: learningChunks.intervalDays,
      chunkType: learningChunks.chunkType,
      prerequisitesJson: learningChunks.prerequisitesJson,
      tagsJson: learningChunks.tagsJson,
      ...(filter.includeContent && {
        content: learningChunks.content,
        contentVersion: learningChunks.contentVersion,
        contentUpdatedAt: learningChunks.contentUpdatedAt,
      }),
      createdAt: learningChunks.createdAt,
      updatedAt: learningChunks.updatedAt,
      topicTitle: learningTopics.title,
    })
    .from(learningChunks)
    .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id));

  // Get total count for pagination
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(learningChunks)
    .$dynamic();
  const totalCount = (whereClause ? countQuery.where(whereClause) : countQuery).get()?.count || 0;

  // Apply pagination and conditions
  const offset = filter.offset || 0;
  const limit = filter.limit || 100; // Default limit

  let query = baseQuery.$dynamic();
  if (whereClause) query = query.where(whereClause);
  const rows = query.offset(offset).limit(limit).all();

  const items = rows.map(row => {
    if (filter.includeContent) {
      return mapChunkRowToLearningItemWithContent(row as ChunkListRowWithContent);
    } else {
      return mapChunkRowToLearningItem(row as ChunkListRow);
    }
  });

  return {
    items,
    pagination: {
      total: totalCount,
      limit,
      offset,
      hasMore: offset + items.length < totalCount,
    },
  };
}

// Batch fetch with minimal metadata
export type ChunkMinimalMetadata = {
  id: string;
  topicId: string;
  title: string;
  subject: string;
  difficulty: number;
  estimatedDuration: number;
  chunkType: string;
  nextReviewAt: number;
  createdAt: number;
  updatedAt: number;
};

export async function batchFetchChunksMinimal(options?: {
  topicId?: string;
  subject?: string;
  dueOnly?: boolean;
  limit?: number;
}): Promise<ChunkMinimalMetadata[]> {
  const db = getSql();
  const whereClause = buildChunkWhereClause(options ?? {});

  let query = db
    .select({
      id: learningChunks.id,
      topicId: learningChunks.topicId,
      title: learningChunks.title,
      subject: learningChunks.subject,
      difficulty: learningChunks.difficulty,
      estimatedDuration: learningChunks.estimatedDuration,
      chunkType: learningChunks.chunkType,
      nextReviewAt: learningChunks.nextReviewAt,
      createdAt: learningChunks.createdAt,
      updatedAt: learningChunks.updatedAt,
    })
    .from(learningChunks)
    .$dynamic();

  if (whereClause) query = query.where(whereClause);
  if (options?.limit && options.limit > 0) query = query.limit(options.limit);

  return query.all();
}
