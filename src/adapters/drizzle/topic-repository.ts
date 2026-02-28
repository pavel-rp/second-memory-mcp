import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  learningTopics,
  type LearningTopicRow,
  type NewLearningTopicRow,
} from '../../infrastructure/db/schema.js';
import { serviceOk, serviceFail, type ServiceResult } from '../../domain/types/service-result.js';
import type {
  TopicRepository,
  TopicMinimalMetadata,
  TopicWithSummary,
} from '../../ports/topic-repository.js';

export class DrizzleTopicRepository implements TopicRepository {
  constructor(private db: SqlDb = getSql()) {}

  async create(input: NewLearningTopicRow): Promise<ServiceResult<void>> {
    try {
      await this.db.insert(learningTopics).values(input);
      return serviceOk();
    } catch {
      return serviceFail({ type: 'database', message: 'Failed to create topic' });
    }
  }

  async getById(id: string): Promise<LearningTopicRow | undefined> {
    const [row] = await this.db.select().from(learningTopics).where(eq(learningTopics.id, id));
    return row ?? undefined;
  }

  async getSummaryById(topicId: string): Promise<TopicWithSummary | undefined> {
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
        NewLearningTopicRow,
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

  async list(): Promise<LearningTopicRow[]> {
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
