import { and, eq, lte, ne, sql } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  learningChunks,
  learningTopics,
  type LearningChunkRow,
} from '../../infrastructure/db/schema.js';
import type { LearningChunk, NewLearningChunk } from '../../domain/types/entities.js';
import type {
  ChunkRepository,
  ChunkContentResult,
  ChunkMinimalMetadata,
  ChunkDependentRow,
  ChunkWithTopicTitle,
  ListChunksFilter,
  ListChunksWithContentFilter,
} from '../../ports/chunk-repository.js';
import type { PaginatedLearningItemsResponse } from '../../domain/types/recommendations.js';
import { mapChunkRowToLearningItem } from '../../shared/chunk-mapping.js';

const CHUNK_COLUMNS_WITH_TOPIC = {
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
  createdAt: learningChunks.createdAt,
  updatedAt: learningChunks.updatedAt,
  topicTitle: learningTopics.title,
};

const CHUNK_CONTENT_COLUMNS = {
  content: learningChunks.content,
  contentVersion: learningChunks.contentVersion,
  contentUpdatedAt: learningChunks.contentUpdatedAt,
};

type ChunkFilterOptions = {
  topicId?: string;
  subject?: string;
  subjectFilter?: string;
  dueOnly?: boolean;
  isLeech?: boolean;
};

function buildChunkWhereClause(options: ChunkFilterOptions) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (options.topicId) conditions.push(eq(learningChunks.topicId, options.topicId));
  const subj = options.subject || options.subjectFilter;
  if (subj) conditions.push(eq(learningChunks.subject, subj));
  if (options.dueOnly) conditions.push(lte(learningChunks.nextReviewAt, Date.now()));
  if (options.isLeech === true) conditions.push(eq(learningChunks.chunkType, 'remediation'));
  if (options.isLeech === false) conditions.push(ne(learningChunks.chunkType, 'remediation'));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

type ChunkListRowWithContent = Omit<LearningChunkRow, 'contentEmbedding'> & {
  contentEmbedding?: number[] | null;
  topicTitle?: string | null;
  content?: string | null;
  contentVersion?: number | null;
  contentUpdatedAt?: number | null;
};

export class DrizzleChunkRepository implements ChunkRepository {
  constructor(private db: SqlDb = getSql()) {}

  async create(input: NewLearningChunk): Promise<void> {
    await this.db.insert(learningChunks).values(input);
  }

  async getById(id: string): Promise<LearningChunk | undefined> {
    const [row] = await this.db.select().from(learningChunks).where(eq(learningChunks.id, id));
    return row;
  }

  async update(
    id: string,
    changes: Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>
  ): Promise<number> {
    const res = await this.db.update(learningChunks).set(changes).where(eq(learningChunks.id, id));
    return res.rowCount ?? 0;
  }

  async saveContentEmbedding(chunkId: string, vector: number[] | null): Promise<number> {
    const res = await this.db
      .update(learningChunks)
      .set({ contentEmbedding: vector })
      .where(eq(learningChunks.id, chunkId));
    return res.rowCount ?? 0;
  }

  async delete(id: string): Promise<number> {
    const res = await this.db.delete(learningChunks).where(eq(learningChunks.id, id));
    return res.rowCount ?? 0;
  }

  async getContent(id: string): Promise<ChunkContentResult | null> {
    const [result] = await this.db
      .select({
        id: learningChunks.id,
        content: learningChunks.content,
        contentVersion: learningChunks.contentVersion,
        contentUpdatedAt: learningChunks.contentUpdatedAt,
      })
      .from(learningChunks)
      .where(eq(learningChunks.id, id));
    return result || null;
  }

  async getWithContent(id: string): Promise<ChunkWithTopicTitle | null> {
    const [result] = await this.db
      .select({ ...CHUNK_COLUMNS_WITH_TOPIC, ...CHUNK_CONTENT_COLUMNS })
      .from(learningChunks)
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
      .where(eq(learningChunks.id, id));
    return result || null;
  }

  async list(filter: ListChunksFilter = {}): Promise<ChunkWithTopicTitle[]> {
    const whereClause = buildChunkWhereClause(filter);
    let query = this.db
      .select({ ...CHUNK_COLUMNS_WITH_TOPIC, ...CHUNK_CONTENT_COLUMNS })
      .from(learningChunks)
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
      .$dynamic();
    if (whereClause) query = query.where(whereClause);
    if (filter.limit && filter.limit > 0) query = query.limit(filter.limit);
    return await query;
  }

  async listWithContent(
    filter: ListChunksWithContentFilter = {}
  ): Promise<PaginatedLearningItemsResponse> {
    const whereClause = buildChunkWhereClause(filter);
    const columns = filter.includeContent
      ? { ...CHUNK_COLUMNS_WITH_TOPIC, ...CHUNK_CONTENT_COLUMNS }
      : CHUNK_COLUMNS_WITH_TOPIC;
    const baseQuery = this.db
      .select(columns)
      .from(learningChunks)
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id));

    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(learningChunks)
      .$dynamic();
    const [countRow] = whereClause ? await countQuery.where(whereClause) : await countQuery;
    const totalCount = Number(countRow?.count) || 0;

    const offset = filter.offset || 0;
    const limit = filter.limit || 100;

    let query = baseQuery.$dynamic();
    if (whereClause) query = query.where(whereClause);
    const rows = await query.offset(offset).limit(limit);

    const items = rows.map(row =>
      mapChunkRowToLearningItem(row as ChunkListRowWithContent, {
        includeContent: filter.includeContent,
      })
    );

    return {
      items,
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + items.length < totalCount,
      },
    };
  }

  async batchFetchMinimal(options?: {
    topicId?: string;
    subject?: string;
    dueOnly?: boolean;
    limit?: number;
    isLeech?: boolean;
  }): Promise<ChunkMinimalMetadata[]> {
    const whereClause = buildChunkWhereClause(options ?? {});
    let query = this.db
      .select({
        id: learningChunks.id,
        topicId: learningChunks.topicId,
        title: learningChunks.title,
        subject: learningChunks.subject,
        difficulty: learningChunks.difficulty,
        estimatedDuration: learningChunks.estimatedDuration,
        chunkType: learningChunks.chunkType,
        nextReviewAt: learningChunks.nextReviewAt,
        easeFactor: learningChunks.easeFactor,
        repetitions: learningChunks.repetitions,
        intervalDays: learningChunks.intervalDays,
        lastReviewedAt: learningChunks.lastReviewedAt,
        prerequisitesJson: learningChunks.prerequisitesJson,
        tagsJson: learningChunks.tagsJson,
        createdAt: learningChunks.createdAt,
        updatedAt: learningChunks.updatedAt,
      })
      .from(learningChunks)
      .$dynamic();
    if (whereClause) query = query.where(whereClause);
    if (options?.limit && options.limit > 0) query = query.limit(options.limit);
    return await query;
  }

  async findDependents(chunkId: string): Promise<ChunkDependentRow[]> {
    return await this.db
      .select({ ...CHUNK_COLUMNS_WITH_TOPIC, ...CHUNK_CONTENT_COLUMNS })
      .from(learningChunks)
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
      .where(
        sql`
          ${learningChunks.id} != ${chunkId}
          AND ${learningChunks.prerequisitesJson} IS NOT NULL
          AND ${learningChunks.prerequisitesJson}::jsonb @> to_jsonb(ARRAY[${chunkId}]::text[])
        `
      );
  }
}
