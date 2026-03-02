import type { TopicRepository, TopicMinimalMetadata } from '../../../src/ports/topic-repository.js';
import type { LearningTopic, NewLearningTopic } from '../../../src/domain/types/entities.js';
import type { ServiceResult } from '../../../src/domain/types/service-result.js';
import { serviceOk, serviceFail } from '../../../src/domain/types/service-result.js';

export class InMemoryTopicRepository implements TopicRepository {
  private topics = new Map<string, LearningTopic>();

  seed(row: LearningTopic): void {
    this.topics.set(row.id, row);
  }

  getStore(): Map<string, LearningTopic> {
    return this.topics;
  }

  clear(): void {
    this.topics.clear();
  }

  async create(input: NewLearningTopic): Promise<ServiceResult<void>> {
    const row: LearningTopic = {
      id: input.id,
      title: input.title,
      subject: input.subject,
      summary: input.summary ?? null,
      summaryVersion: input.summaryVersion ?? null,
      summaryUpdatedAt: input.summaryUpdatedAt ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
    this.topics.set(row.id, row);
    return serviceOk(undefined);
  }

  async getById(id: string): Promise<LearningTopic | undefined> {
    return this.topics.get(id);
  }

  async getSummaryById(topicId: string): Promise<LearningTopic | undefined> {
    return this.topics.get(topicId);
  }

  async update(
    id: string,
    changes: Partial<
      Pick<
        NewLearningTopic,
        'title' | 'subject' | 'summary' | 'summaryVersion' | 'summaryUpdatedAt' | 'updatedAt'
      >
    >
  ): Promise<ServiceResult<{ changesApplied: number }>> {
    const existing = this.topics.get(id);
    if (!existing) return serviceFail({ type: 'not_found', message: `Topic ${id} not found` });
    this.topics.set(id, { ...existing, ...changes } as LearningTopic);
    return serviceOk({ changesApplied: 1 });
  }

  async saveSummaryEmbedding(_topicId: string, _vector: number[] | null): Promise<number> {
    // In-memory store does not track embeddings; just confirm the topic exists.
    return this.topics.has(_topicId) ? 1 : 0;
  }

  async delete(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
    const deleted = this.topics.delete(id);
    return serviceOk({ deleted });
  }

  async list(): Promise<LearningTopic[]> {
    return [...this.topics.values()];
  }

  async batchFetchMinimal(options?: {
    subject?: string;
    limit?: number;
  }): Promise<TopicMinimalMetadata[]> {
    let rows = [...this.topics.values()];
    if (options?.subject) rows = rows.filter(r => r.subject === options.subject);
    if (options?.limit) rows = rows.slice(0, options.limit);
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
