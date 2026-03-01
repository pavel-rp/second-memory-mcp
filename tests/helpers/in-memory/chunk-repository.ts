import type {
  ChunkRepository,
  ListChunksFilter,
  ListChunksWithContentFilter,
  ChunkContentResult,
  ChunkMinimalMetadata,
  ChunkWithTopicTitle,
} from '../../../src/ports/chunk-repository.js';
import type {
  LearningItem,
  LearningItemWithContent,
  PaginatedLearningItemsResponse,
} from '../../../src/domain/types/recommendations.js';
import type {
  LearningChunkRow,
  NewLearningChunkRow,
} from '../../../src/infrastructure/db/schema.js';

export class InMemoryChunkRepository implements ChunkRepository {
  private chunks = new Map<string, LearningChunkRow>();
  private topicTitles = new Map<string, string>(); // topicId → title

  /** Seed a chunk for testing. */
  seed(row: LearningChunkRow, topicTitle?: string): void {
    this.chunks.set(row.id, row);
    if (topicTitle) this.topicTitles.set(row.topicId, topicTitle);
  }

  /** Get raw store for assertions. */
  getStore(): Map<string, LearningChunkRow> {
    return this.chunks;
  }

  clear(): void {
    this.chunks.clear();
    this.topicTitles.clear();
  }

  async create(input: NewLearningChunkRow): Promise<void> {
    const row: LearningChunkRow = {
      id: input.id,
      topicId: input.topicId,
      title: input.title,
      subject: input.subject,
      difficulty: input.difficulty,
      nextReviewAt: input.nextReviewAt,
      easeFactor: input.easeFactor,
      repetitions: input.repetitions,
      lastReviewedAt: input.lastReviewedAt ?? null,
      estimatedDuration: input.estimatedDuration,
      intervalDays: input.intervalDays ?? null,
      chunkType: input.chunkType,
      prerequisitesJson: input.prerequisitesJson ?? null,
      tagsJson: input.tagsJson ?? null,
      content: input.content ?? null,
      contentVersion: input.contentVersion ?? null,
      contentUpdatedAt: input.contentUpdatedAt ?? null,
      contentEmbedding: input.contentEmbedding ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
    this.chunks.set(row.id, row);
  }

  async getById(id: string): Promise<LearningChunkRow | undefined> {
    return this.chunks.get(id);
  }

  async update(
    id: string,
    changes: Partial<Omit<NewLearningChunkRow, 'id' | 'topicId' | 'createdAt'>>
  ): Promise<number> {
    const existing = this.chunks.get(id);
    if (!existing) return 0;
    this.chunks.set(id, { ...existing, ...changes } as LearningChunkRow);
    return 1;
  }

  async delete(id: string): Promise<number> {
    return this.chunks.delete(id) ? 1 : 0;
  }

  async getContent(id: string): Promise<ChunkContentResult | null> {
    const row = this.chunks.get(id);
    if (!row) return null;
    return {
      id: row.id,
      content: row.content,
      contentVersion: row.contentVersion,
      contentUpdatedAt: row.contentUpdatedAt,
    };
  }

  async getWithContent(id: string): Promise<ChunkWithTopicTitle | null> {
    const row = this.chunks.get(id);
    if (!row) return null;
    return { ...row, topicTitle: this.topicTitles.get(row.topicId) ?? null };
  }

  async list(filter: ListChunksFilter = {}): Promise<ChunkWithTopicTitle[]> {
    let rows = [...this.chunks.values()];
    if (filter.subjectFilter) rows = rows.filter(r => r.subject === filter.subjectFilter);
    if (filter.dueOnly) rows = rows.filter(r => r.nextReviewAt <= Date.now());
    if (filter.offset) rows = rows.slice(filter.offset);
    if (filter.limit && filter.limit > 0) rows = rows.slice(0, filter.limit);
    return rows.map(r => ({ ...r, topicTitle: this.topicTitles.get(r.topicId) ?? null }));
  }

  async listWithContent(
    filter: ListChunksWithContentFilter = {}
  ): Promise<PaginatedLearningItemsResponse> {
    let rows = [...this.chunks.values()];
    if (filter.subjectFilter) rows = rows.filter(r => r.subject === filter.subjectFilter);
    const total = rows.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;
    rows = rows.slice(offset, offset + limit);
    const items: (LearningItem | LearningItemWithContent)[] = rows.map(r => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      difficulty: r.difficulty,
      nextReviewDate: new Date(r.nextReviewAt).toISOString().slice(0, 10),
      easeFactor: r.easeFactor,
      repetitions: r.repetitions,
      estimatedDuration: r.estimatedDuration,
      chunkType: r.chunkType as 'new' | 'review' | 'remediation',
      prerequisites: r.prerequisitesJson ?? [],
      tags: r.tagsJson ?? [],
      topicId: r.topicId,
      topicTitle: this.topicTitles.get(r.topicId),
      content: r.content ?? undefined,
      contentVersion: r.contentVersion ?? undefined,
      contentUpdatedAt: r.contentUpdatedAt ?? undefined,
    }));
    return {
      items,
      pagination: { total, limit, offset, hasMore: offset + items.length < total },
    };
  }

  async batchFetchMinimal(options?: {
    topicId?: string;
    subject?: string;
    dueOnly?: boolean;
    limit?: number;
  }): Promise<ChunkMinimalMetadata[]> {
    let rows = [...this.chunks.values()];
    if (options?.topicId) rows = rows.filter(r => r.topicId === options.topicId);
    if (options?.subject) rows = rows.filter(r => r.subject === options.subject);
    if (options?.dueOnly) rows = rows.filter(r => r.nextReviewAt <= Date.now());
    if (options?.limit) rows = rows.slice(0, options.limit);
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      difficulty: r.difficulty,
      chunkType: r.chunkType,
      topicId: r.topicId,
      nextReviewAt: r.nextReviewAt,
      easeFactor: r.easeFactor,
      repetitions: r.repetitions,
      intervalDays: r.intervalDays,
      lastReviewedAt: r.lastReviewedAt,
      prerequisitesJson: r.prerequisitesJson,
      tagsJson: r.tagsJson,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findDependents(chunkId: string): Promise<
    Array<
      Omit<LearningChunkRow, 'contentEmbedding'> & {
        contentEmbedding?: number[] | null;
        topicTitle?: string | null;
      }
    >
  > {
    return [...this.chunks.values()]
      .filter(r => r.prerequisitesJson?.includes(chunkId))
      .map(r => {
        const { contentEmbedding: _, ...rest } = r;
        return { ...rest, topicTitle: this.topicTitles.get(r.topicId) ?? null };
      });
  }
}
