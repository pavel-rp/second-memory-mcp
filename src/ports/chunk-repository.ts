import type { LearningChunkRow, NewLearningChunkRow } from '../db/schema.js';
import type { PaginatedLearningItemsResponse } from '../domain/types/recommendations.js';

/** Filter options for listing chunks. */
export type ListChunksFilter = {
  subjectFilter?: string;
  dueOnly?: boolean;
  limit?: number;
  offset?: number;
  includeContent?: boolean;
};

/** Filter options for listing chunks with content (paginated). */
export type ListChunksWithContentFilter = {
  subjectFilter?: string;
  limit?: number;
  offset?: number;
};

/** Minimal chunk metadata for batch fetch. */
export type ChunkMinimalMetadata = {
  id: string;
  title: string;
  subject: string;
  difficulty: number;
  chunkType: string;
  topicId: string;
  nextReviewAt: number;
  easeFactor: number;
  repetitions: number;
  intervalDays: number | null;
  lastReviewedAt: number | null;
  prerequisitesJson: string[] | null;
  tagsJson: string[] | null;
  createdAt: number;
  updatedAt: number;
};

/** Content-only result for a chunk. */
export type ChunkContentResult = {
  id: string;
  content: string | null;
  contentVersion: number | null;
  contentUpdatedAt: number | null;
};

/** Extended chunk row with topic title. */
export type ChunkWithTopicTitle = LearningChunkRow & {
  topicTitle?: string | null;
};

/**
 * Port interface for chunk data access.
 * Adapters implement this to provide CRUD and query operations on learning chunks.
 */
export interface ChunkRepository {
  create(input: NewLearningChunkRow): Promise<void>;
  getById(id: string): Promise<LearningChunkRow | undefined>;
  update(
    id: string,
    changes: Partial<Omit<NewLearningChunkRow, 'id' | 'topicId' | 'createdAt'>>
  ): Promise<number>;
  delete(id: string): Promise<number>;
  getContent(id: string): Promise<ChunkContentResult | null>;
  getWithContent(id: string): Promise<ChunkWithTopicTitle | null>;
  list(filter?: ListChunksFilter): Promise<ChunkWithTopicTitle[]>;
  listWithContent(filter?: ListChunksWithContentFilter): Promise<PaginatedLearningItemsResponse>;
  batchFetchMinimal(options?: {
    topicId?: string;
    subject?: string;
    dueOnly?: boolean;
    limit?: number;
  }): Promise<ChunkMinimalMetadata[]>;
  findDependents(chunkId: string): Promise<
    Array<
      LearningChunkRow & {
        topicTitle?: string | null;
        content?: string | null;
        contentVersion?: number | null;
        contentUpdatedAt?: number | null;
      }
    >
  >;
}
