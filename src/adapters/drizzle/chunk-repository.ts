import { and, asc, eq, gte, inArray, lt, lte, ne, sql } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  learningChunks,
  learningTopics,
  type LearningChunkRow,
} from '../../infrastructure/db/schema.js';
import type { LearningChunk, NewLearningChunk } from '../../domain/types/entities.js';
import {
  ValidatorReportSchema,
  type ValidatorReport,
} from '../../domain/types/validator-report.js';
import { getRequestLogger } from '../../shared/logger.js';
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
  consecutiveFailures: learningChunks.consecutiveFailures,
  lastReviewedAt: learningChunks.lastReviewedAt,
  estimatedDuration: learningChunks.estimatedDuration,
  intervalDays: learningChunks.intervalDays,
  chunkType: learningChunks.chunkType,
  prerequisitesJson: learningChunks.prerequisitesJson,
  tagsJson: learningChunks.tagsJson,
  contentStatus: learningChunks.contentStatus,
  condensedSummary: learningChunks.condensedSummary,
  knowledgeType: learningChunks.knowledgeType,
  orderIndex: learningChunks.orderIndex,
  createdAt: learningChunks.createdAt,
  updatedAt: learningChunks.updatedAt,
  topicTitle: learningTopics.title,
};

const CHUNK_CONTENT_COLUMNS = {
  content: learningChunks.content,
  contentVersion: learningChunks.contentVersion,
  contentUpdatedAt: learningChunks.contentUpdatedAt,
};

/** The chunkType value that represents a leech (remediation) item. */
const LEECH_CHUNK_TYPE = 'remediation';

type ChunkFilterOptions = {
  topicId?: string;
  subject?: string;
  subjectFilter?: string;
  dueOnly?: boolean;
  isLeech?: boolean;
  excludeDraft?: boolean;
  chunkIds?: string[];
};

function buildChunkWhereClause(options: ChunkFilterOptions) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (options.topicId) conditions.push(eq(learningChunks.topicId, options.topicId));
  const subj = options.subject || options.subjectFilter;
  if (subj) conditions.push(eq(learningChunks.subject, subj));
  if (options.dueOnly) conditions.push(lte(learningChunks.nextReviewAt, Date.now()));
  if (options.isLeech === true) conditions.push(eq(learningChunks.chunkType, LEECH_CHUNK_TYPE));
  if (options.isLeech === false) conditions.push(ne(learningChunks.chunkType, LEECH_CHUNK_TYPE));
  if (options.excludeDraft) conditions.push(ne(learningChunks.contentStatus, 'draft'));
  if (options.chunkIds && options.chunkIds.length > 0)
    conditions.push(inArray(learningChunks.id, options.chunkIds));
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

  async writeValidatorReport(chunkId: string, report: ValidatorReport): Promise<number> {
    const res = await this.db
      .update(learningChunks)
      .set({ validatorReport: report })
      .where(eq(learningChunks.id, chunkId));
    return res.rowCount ?? 0;
  }

  async getValidatorReport(chunkId: string): Promise<ValidatorReport | null> {
    const [row] = await this.db
      .select({ validatorReport: learningChunks.validatorReport })
      .from(learningChunks)
      .where(eq(learningChunks.id, chunkId));
    if (!row || row.validatorReport == null) return null;
    const parsed = ValidatorReportSchema.safeParse(row.validatorReport);
    if (!parsed.success) {
      getRequestLogger().warn(
        `validator_report for chunk ${chunkId} failed schema validation: ${parsed.error.message}`
      );
      return null;
    }
    return parsed.data;
  }

  async mergeValidatorReport(
    chunkId: string,
    partial: Partial<Omit<ValidatorReport, 'updated_at'>>,
    updatedAt: string
  ): Promise<number> {
    // Atomic single-statement merge using Postgres JSONB `||` (shallow merge).
    // Replaces whole tier keys present in `partial`, preserves untouched
    // sections, sets `updated_at`. Avoids the read-then-write race that an
    // application-level merge would introduce when concurrent callers update
    // different tiers (e.g. NEU-617 writing tier1b while NEU-620 writes tier2).
    const overlay = { ...partial, updated_at: updatedAt };
    const res = await this.db
      .update(learningChunks)
      .set({
        validatorReport: sql`COALESCE(${learningChunks.validatorReport}, '{}'::jsonb) || ${JSON.stringify(overlay)}::jsonb`,
      })
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
        knowledgeType: learningChunks.knowledgeType,
        condensedSummary: learningChunks.condensedSummary,
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
    query = query.orderBy(learningChunks.nextReviewAt, learningChunks.id) as typeof query;
    if (filter.limit && filter.limit > 0) query = query.limit(filter.limit);
    return await query;
  }

  async countByTopicIds(
    topicIds: string[],
    opts?: { excludeDraft?: boolean }
  ): Promise<Map<string, number>> {
    if (topicIds.length === 0) return new Map();
    const conditions = [inArray(learningChunks.topicId, topicIds)];
    if (opts?.excludeDraft) conditions.push(ne(learningChunks.contentStatus, 'draft'));
    const rows = await this.db
      .select({
        topicId: learningChunks.topicId,
        count: sql<number>`count(*)`,
      })
      .from(learningChunks)
      .where(and(...conditions))
      .groupBy(learningChunks.topicId);
    const result = new Map<string, number>();
    for (const row of rows) {
      result.set(row.topicId, Number(row.count));
    }
    return result;
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
    query = query.orderBy(learningChunks.nextReviewAt, learningChunks.id) as typeof query;
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
    excludeDraft?: boolean;
    chunkIds?: string[];
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
        contentStatus: learningChunks.contentStatus,
        orderIndex: learningChunks.orderIndex,
        createdAt: learningChunks.createdAt,
        updatedAt: learningChunks.updatedAt,
      })
      .from(learningChunks)
      .$dynamic();
    if (whereClause) query = query.where(whereClause);
    query = query.orderBy(learningChunks.nextReviewAt, learningChunks.id) as typeof query;
    if (options?.limit && options.limit > 0) query = query.limit(options.limit);
    return await query;
  }

  async getPrerequisiteContext(
    topicId: string,
    beforeOrderIndex: number
  ): Promise<Array<{ id: string; title: string; condensedSummary: string | null }>> {
    return await this.db
      .select({
        id: learningChunks.id,
        title: learningChunks.title,
        condensedSummary: learningChunks.condensedSummary,
      })
      .from(learningChunks)
      .where(
        and(eq(learningChunks.topicId, topicId), lt(learningChunks.orderIndex, beforeOrderIndex))
      )
      .orderBy(asc(learningChunks.orderIndex), asc(learningChunks.id))
      .limit(20);
  }

  async getMaxOrderIndex(topicId: string): Promise<number> {
    // A non-grouped aggregate with COALESCE always returns exactly one row with
    // a non-null `max`, so the row is asserted rather than optional-chained
    // (avoids an uncoverable defensive branch).
    const [row] = await this.db
      .select({ max: sql<number>`COALESCE(MAX(${learningChunks.orderIndex}), 0)` })
      .from(learningChunks)
      .where(eq(learningChunks.topicId, topicId));
    return Number((row as { max: number }).max);
  }

  async shiftOrderIndexesAtOrAbove(
    topicId: string,
    fromOrder: number,
    now: number
  ): Promise<number> {
    const res = await this.db
      .update(learningChunks)
      .set({ orderIndex: sql`${learningChunks.orderIndex} + 1`, updatedAt: now })
      .where(and(eq(learningChunks.topicId, topicId), gte(learningChunks.orderIndex, fromOrder)));
    return res.rowCount ?? 0;
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
