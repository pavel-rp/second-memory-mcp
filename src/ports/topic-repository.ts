import type { LearningTopic, NewLearningTopic } from '../domain/types/entities.js';
import type { ServiceResult } from '../domain/types/service-result.js';

/** Minimal topic metadata for batch fetch. */
export type TopicMinimalMetadata = {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Port interface for topic data access.
 * Adapters implement this to provide CRUD and query operations on learning topics.
 */
export interface TopicRepository {
  create(input: NewLearningTopic): Promise<ServiceResult<void>>;
  getById(id: string): Promise<LearningTopic | undefined>;
  getSummaryById(topicId: string): Promise<LearningTopic | undefined>;
  update(
    id: string,
    changes: Partial<
      Pick<
        NewLearningTopic,
        'title' | 'subject' | 'summary' | 'summaryVersion' | 'summaryUpdatedAt' | 'updatedAt'
      >
    >
  ): Promise<ServiceResult<{ changesApplied: number }>>;
  /** Persist or clear a topic's summary embedding (infrastructure-only column). */
  saveSummaryEmbedding(topicId: string, vector: number[] | null): Promise<number>;
  delete(id: string): Promise<ServiceResult<{ deleted: boolean }>>;
  list(): Promise<LearningTopic[]>;
  batchFetchMinimal(options?: {
    subject?: string;
    limit?: number;
  }): Promise<TopicMinimalMetadata[]>;
}
