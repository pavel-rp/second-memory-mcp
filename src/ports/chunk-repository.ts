import type { LearningChunk, NewLearningChunk, KnowledgeType } from '../domain/types/entities.js';
import type {
  ContentStatus,
  PaginatedLearningItemsResponse,
} from '../domain/types/recommendations.js';
import type { ValidatorReport } from '../domain/types/validator-report.js';

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
  knowledgeType: KnowledgeType | null;
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
    chunkIds?: string[];
  }): Promise<ChunkMinimalMetadata[]>;
  findDependents(chunkId: string): Promise<ChunkDependentRow[]>;
  getPrerequisiteContext(
    topicId: string,
    beforeCreatedAt: number
  ): Promise<Array<{ id: string; title: string; condensedSummary: string | null }>>;
  /**
   * Overwrite the full `validator_report` JSONB column for a chunk. Returns
   * the affected row count. Intended for overwrite use (e.g. re-running the
   * full validator suite against an existing chunk); the create path inlines
   * the report in the initial `INSERT`.
   */
  writeValidatorReport(chunkId: string, report: ValidatorReport): Promise<number>;
  /**
   * Section-merge `partial` into the existing `validator_report` for a chunk.
   * Tier values present in `partial` (and not `undefined`) replace whole tier
   * sections; untouched sections are preserved; `updated_at` is refreshed.
   * Returns the affected row count. Intended for downstream consumers that
   * own a single tier (e.g. NEU-620's classifier wiring populating `tier2`).
   *
   * Concurrency: implementations MUST perform the merge atomically (single
   * statement or row-locked transaction) so concurrent calls writing to
   * different tiers do not lose updates. The Drizzle adapter uses Postgres
   * `||` JSONB shallow-merge to satisfy this. App-level read-then-write is
   * not safe.
   *
   * Value constraints: tier payloads must be JSON-serializable. `undefined`
   * is skipped (matches SQL `||`); explicit `null` persists as JSON null.
   * `updated_at` is owned by the `updatedAt` parameter and excluded from
   * `partial` at the type level — any value passed in `partial` would be
   * overwritten.
   */
  mergeValidatorReport(
    chunkId: string,
    partial: Partial<Omit<ValidatorReport, 'updated_at'>>,
    updatedAt: string
  ): Promise<number>;
  /**
   * Read the raw `validator_report` for a chunk.
   *
   * Returns the stored JSONB as-is (no reshaping, no defaults). Returns `null`
   * when the chunk does not exist OR the column is null. If the stored value
   * fails `ValidatorReportSchema` parsing (unlikely but possible if written by
   * older code), the adapter returns `null` and logs a warning — callers get a
   * simple "no report available" signal rather than a throw.
   *
   * Consumed by NEU-620's integration tests to read back what the classifier
   * wrote, and by NEU-612's future nightly watchdog.
   */
  getValidatorReport(chunkId: string): Promise<ValidatorReport | null>;
}
