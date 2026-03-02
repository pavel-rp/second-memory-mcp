import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { learningTopics } from '../../infrastructure/db/schema.js';
import type { LearningTopic, NewLearningTopic } from '../../domain/types/entities.js';
import { serviceOk, serviceFail, type ServiceResult } from '../../domain/types/service-result.js';
import type { TopicRepository, TopicMinimalMetadata } from '../../ports/topic-repository.js';

export class DrizzleTopicRepository implements TopicRepository {
  constructor(private db: SqlDb = getSql()) {}

  async create(input: NewLearningTopic): Promise<ServiceResult<void>> {
    try {
      await this.db.insert(learningTopics).values(input);
      return serviceOk();
    } catch {
      return serviceFail({ type: 'database', message: 'Failed to create topic' });
    }
  }

  async getById(id: string): Promise<LearningTopic | undefined> {
    const [row] = await this.db.select().from(learningTopics).where(eq(learningTopics.id, id));
    return row ?? undefined;
  }

  async getSummaryById(topicId: string): Promise<LearningTopic | undefined> {
    const [row] = await this.db
      .select({
        id: learningTopics.id,
        title: learningTopics.title,
        subject: learningTopics.subject,
        summary: learningTopics.summary,
        summaryVersion: learningTopics.summaryVersion,
        summaryUpdatedAt: learningTopics.summaryUpdatedAt,
        createdAt: learningTopics.createdAt,
        updatedAt: learningTopics.updatedAt,
      })
      .from(learningTopics)
      .where(eq(learningTopics.id, topicId));
    return row ?? undefined;
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
    try {
      if (Object.keys(changes).length === 0) {
        return serviceFail({ type: 'validation', message: 'No changes provided' });
      }
      const res = await this.db
        .update(learningTopics)
        .set(changes)
        .where(eq(learningTopics.id, id));
      const count = res.rowCount ?? 0;
      if (count === 0) {
        const [exists] = await this.db
          .select({ id: learningTopics.id })
          .from(learningTopics)
          .where(eq(learningTopics.id, id));
        if (exists) return serviceOk({ changesApplied: 0 });
        return serviceFail({ type: 'not_found', message: `Topic with id "${id}" not found` });
      }
      return serviceOk({ changesApplied: count });
    } catch {
      return serviceFail({ type: 'database', message: 'Failed to update topic' });
    }
  }

  async saveSummaryEmbedding(topicId: string, vector: number[] | null): Promise<number> {
    const res = await this.db
      .update(learningTopics)
      .set({ summaryEmbedding: vector })
      .where(eq(learningTopics.id, topicId));
    return res.rowCount ?? 0;
  }

  async delete(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
    try {
      const res = await this.db.delete(learningTopics).where(eq(learningTopics.id, id));
      const count = res.rowCount ?? 0;
      if (count === 0) {
        return serviceFail({ type: 'not_found', message: `Topic with id "${id}" not found` });
      }
      return serviceOk({ deleted: true });
    } catch {
      return serviceFail({ type: 'database', message: 'Failed to delete topic' });
    }
  }

  async list(): Promise<LearningTopic[]> {
    return this.db.select().from(learningTopics);
  }

  async batchFetchMinimal(options?: {
    subject?: string;
    limit?: number;
  }): Promise<TopicMinimalMetadata[]> {
    let query = this.db
      .select({
        id: learningTopics.id,
        title: learningTopics.title,
        subject: learningTopics.subject,
        createdAt: learningTopics.createdAt,
        updatedAt: learningTopics.updatedAt,
      })
      .from(learningTopics);
    if (options?.subject) {
      query = query.where(eq(learningTopics.subject, options.subject)) as typeof query;
    }
    if (options?.limit && options.limit > 0) {
      return query.limit(options.limit);
    }
    return query;
  }
}
