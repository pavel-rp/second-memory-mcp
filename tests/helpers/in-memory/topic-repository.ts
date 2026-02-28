import type {
  TopicRepository,
  TopicMinimalMetadata,
  TopicWithSummary,
} from '../../../src/ports/topic-repository.js';
import type {
  LearningTopicRow,
  NewLearningTopicRow,
} from '../../../src/infrastructure/db/schema.js';
import type { ServiceResult } from '../../../src/domain/types/service-result.js';
import { serviceOk, serviceFail } from '../../../src/domain/types/service-result.js';

export class InMemoryTopicRepository implements TopicRepository {
  private topics = new Map<string, LearningTopicRow>();

  seed(row: LearningTopicRow): void {
    this.topics.set(row.id, row);
  }

  getStore(): Map<string, LearningTopicRow> {
    return this.topics;
  }

  clear(): void {
    this.topics.clear();
  }

  async create(input: NewLearningTopicRow): Promise<ServiceResult<void>> {
    const row: LearningTopicRow = {
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

  async getById(id: string): Promise<LearningTopicRow | undefined> {
    return this.topics.get(id);
  }

  async getSummaryById(topicId: string): Promise<TopicWithSummary | undefined> {
    const row = this.topics.get(topicId);
    if (!row) return undefined;
    return row as TopicWithSummary;
  }

  async update(
    id: string,
    changes: Partial<Pick<NewLearningTopicRow, 'title' | 'subject' | 'updatedAt'>>
  ): Promise<ServiceResult<{ changesApplied: number }>> {
    const existing = this.topics.get(id);
    if (!existing) return serviceFail({ type: 'not_found', message: `Topic ${id} not found` });
    this.topics.set(id, { ...existing, ...changes } as LearningTopicRow);
    return serviceOk({ changesApplied: 1 });
  }

  async delete(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
    const deleted = this.topics.delete(id);
    return serviceOk({ deleted });
  }

  async list(): Promise<LearningTopicRow[]> {
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
