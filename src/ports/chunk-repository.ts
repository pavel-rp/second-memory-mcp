import type { LearningChunk, NewLearningChunk } from '../domain/types/entities.js';
import type {
  ContentStatus,
  PaginatedLearningItemsResponse,
} from '../domain/types/recommendations.js';

/** Filter options for listing chunks. */
export type ListChunksFilter = {
  subjectFilter?: string;
  dueOnly?: boolean;
  limit?: number;
  offset?: number;
  includeContent?: boolean;
  isLeech?: boolean;
  excludeDraft?: boolean;
};

/** Filter options for listing chunks with content (paginated). */
export type ListChunksWithContentFilter = {
  subjectFilter?: string;
  dueOnly?: boolean;
  includeContent?: boolean;
  limit?: number;
  offset?: number;
  isLeech?: boolean;
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
  contentStatus: ContentStatus;
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

/** Extended chunk with topic title. Optionally includes contentEmbedding (large vector, excluded by default). */
export type ChunkWithTopicTitle = LearningChunk & {
  contentEmbedding?: number[] | null;
  topicTitle?: string | null;
};

/** Chunk dependent row: alias for ChunkWithTopicTitle (LearningChunk already includes content fields). */
export type ChunkDependentRow = ChunkWithTopicTitle;

/**
 * Port interface for chunk data access.
 * Adapters implement this to provide CRUD and query operations on learning chunks.
 */
export interface ChunkRepository {
  create(input: NewLearningChunk): Promise<void>;
  getById(id: string): Promise<LearningChunk | undefined>;
  update(
    id: string,
    changes: Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>
  ): Promise<number>;
  /** Persist or clear a chunk's content embedding (infrastructure-only column). */
  saveContentEmbedding(chunkId: string, vector: number[] | null): Promise<number>;
  delete(id: string): Promise<number>;
  getContent(id: string): Promise<ChunkContentResult | null>;
  getWithContent(id: string): Promise<ChunkWithTopicTitle | null>;
  list(filter?: ListChunksFilter): Promise<ChunkWithTopicTitle[]>;
  listWithContent(filter?: ListChunksWithContentFilter): Promise<PaginatedLearningItemsResponse>;
  countByTopicIds(
    topicIds: string[],
    opts?: { excludeDraft?: boolean }
  ): Promise<Map<string, number>>;
  batchFetchMinimal(options?: {
    topicId?: string;
    subject?: string;
    dueOnly?: boolean;
    limit?: number;
    isLeech?: boolean;
    excludeDraft?: boolean;
  }): Promise<ChunkMinimalMetadata[]>;
  findDependents(chunkId: string): Promise<ChunkDependentRow[]>;
}
