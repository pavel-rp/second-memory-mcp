import { eq } from 'drizzle-orm';
import { getSql } from '../db/operations.js';
import { learningTopics } from '../db/schema.js';

export type CreateTopicInput = {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
};

export async function createTopic(input: CreateTopicInput): Promise<void> {
  const db = getSql();
  await db.insert(learningTopics).values(input).run();
}

export async function getTopicById(id: string) {
  const db = getSql();
  return db.select().from(learningTopics).where(eq(learningTopics.id, id)).get();
}

export async function listTopics(): Promise<
  Array<{
    id: string;
    title: string;
    subject: string;
    createdAt: number;
    updatedAt: number;
  }>
> {
  const db = getSql();
  return db.select().from(learningTopics).all();
}

export async function updateTopic(
  id: string,
  changes: Partial<Pick<CreateTopicInput, 'title' | 'subject' | 'updatedAt'>>
): Promise<number> {
  const db = getSql();
  const res = db.update(learningTopics).set(changes).where(eq(learningTopics.id, id)).run();
  return res.changes ?? 0;
}

export async function deleteTopic(id: string): Promise<number> {
  const db = getSql();
  const res = db.delete(learningTopics).where(eq(learningTopics.id, id)).run();
  return res.changes ?? 0;
}

// Batch fetch with minimal metadata
export type TopicMinimalMetadata = {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
};

export async function batchFetchTopicsMinimal(options?: {
  subject?: string;
  limit?: number;
}): Promise<TopicMinimalMetadata[]> {
  const db = getSql();

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
