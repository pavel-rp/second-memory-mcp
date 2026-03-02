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

/** Topic row with optional summary fields. */
export type TopicWithSummary = LearningTopic & {
  summary?: string | null;
  summaryVersion?: number | null;
  summaryUpdatedAt?: number | null;
};

/**
 * Port interface for topic data access.
 * Adapters implement this to provide CRUD and query operations on learning topics.
 */
export interface TopicRepository {
  create(input: NewLearningTopic): Promise<ServiceResult<void>>;
  getById(id: string): Promise<LearningTopic | undefined>;
  getSummaryById(topicId: string): Promise<TopicWithSummary | undefined>;
  update(
    id: string,
    changes: Partial<
      Pick<
        NewLearningTopic,
        | 'title'
        | 'subject'
        | 'summary'
        | 'summaryVersion'
        | 'summaryUpdatedAt'
        | 'summaryEmbedding'
        | 'updatedAt'
      >
    >
  ): Promise<ServiceResult<{ changesApplied: number }>>;
  delete(id: string): Promise<ServiceResult<{ deleted: boolean }>>;
  list(): Promise<LearningTopic[]>;
  batchFetchMinimal(options?: {
    subject?: string;
    limit?: number;
  }): Promise<TopicMinimalMetadata[]>;
}
