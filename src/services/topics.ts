import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../db/operations.js';
import { learningTopics } from '../db/schema.js';
import { type ServiceResult, serviceOk, serviceFail } from '../types/service-result.js';

export type CreateTopicInput = {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
};

export async function createTopic(
  input: CreateTopicInput,
  db: SqlDb = getSql()
): Promise<ServiceResult<void>> {
  try {
    await db.insert(learningTopics).values(input).run();
    return serviceOk();
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: 'Failed to create topic',
    });
  }
}

export async function getTopicById(id: string, db: SqlDb = getSql()) {
  return db.select().from(learningTopics).where(eq(learningTopics.id, id)).get();
}

export async function listTopics(db: SqlDb = getSql()): Promise<
  Array<{
    id: string;
    title: string;
    subject: string;
    createdAt: number;
    updatedAt: number;
  }>
> {
  return db.select().from(learningTopics).all();
}

export async function getTopicSummaryById(topicId: string, db: SqlDb = getSql()) {
  return db
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
    .where(eq(learningTopics.id, topicId))
    .get();
}

export async function updateTopic(
  id: string,
  changes: Partial<Pick<CreateTopicInput, 'title' | 'subject' | 'updatedAt'>>,
  db: SqlDb = getSql()
): Promise<ServiceResult<{ changesApplied: number }>> {
  try {
    if (Object.keys(changes).length === 0) {
      return serviceFail({
        type: 'validation',
        message: 'No changes provided',
      });
    }

    const res = db.update(learningTopics).set(changes).where(eq(learningTopics.id, id)).run();
    const count = res.changes ?? 0;

    if (count === 0) {
      const exists = db
        .select({ id: learningTopics.id })
        .from(learningTopics)
        .where(eq(learningTopics.id, id))
        .get();

      if (exists) {
        return serviceOk({ changesApplied: 0 });
      }

      return serviceFail({
        type: 'not_found',
        message: `Topic with id "${id}" not found`,
      });
    }

    return serviceOk({ changesApplied: count });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: 'Failed to update topic',
    });
  }
}

export async function deleteTopic(
  id: string,
  db: SqlDb = getSql()
): Promise<ServiceResult<{ deleted: boolean }>> {
  try {
    const res = db.delete(learningTopics).where(eq(learningTopics.id, id)).run();
    const count = res.changes ?? 0;
    if (count === 0) {
      return serviceFail({
        type: 'not_found',
        message: `Topic with id "${id}" not found`,
      });
    }
    return serviceOk({ deleted: true });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: 'Failed to delete topic',
    });
  }
}

// Batch fetch with minimal metadata
export type TopicMinimalMetadata = {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
};

export async function batchFetchTopicsMinimal(
  options?: {
    subject?: string;
    limit?: number;
  },
  db: SqlDb = getSql()
): Promise<TopicMinimalMetadata[]> {
  let query = db
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
    return query.limit(options.limit).all();
  }

  return query.all();
}
