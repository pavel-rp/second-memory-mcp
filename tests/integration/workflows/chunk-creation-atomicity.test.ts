import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import {
  createChunkWithTopic,
  type ChunkDeps,
} from '../../../src/orchestration/chunk-workflows.js';

function topicDeps(): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    linterRules: [],
  };
}

function chunkDeps(): ChunkDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    maxDependencyDepth: 5,
  };
}

const SUBJECT = 'CS';

function seedTopicInput(chunkId: string): TopicCreationInput {
  return {
    topicTitle: 'NEU-771 Seed Topic',
    topicDescription: 'Seed topic for NEU-771 atomicity tests',
    subject: SUBJECT,
    topicSummary: 'Seed summary for NEU-771 atomicity tests.',
    chunks: [
      {
        id: chunkId,
        title: 'Seed Chunk',
        content: 'Seed chunk content body.',
        difficulty: 3,
        estimatedDuration: 10,
        prerequisites: [],
        tags: [],
        chunkType: 'new',
      },
    ],
  };
}

function twoChunkTopicInput(chunkIds: [string, string]): TopicCreationInput {
  return {
    topicTitle: 'NEU-771 Order Topic',
    topicDescription: 'Seed topic for NEU-771 order-shift test',
    subject: SUBJECT,
    topicSummary: 'Seed summary for NEU-771 order-shift test.',
    chunks: chunkIds.map((id, i) => ({
      id,
      title: `Order Chunk ${i + 1}`,
      content: `Order chunk ${i + 1} content body.`,
      difficulty: 3,
      estimatedDuration: 10,
      prerequisites: [],
      tags: [],
      chunkType: 'new' as const,
    })),
  };
}

// Build a `createChunkWithTopic` input on the auto-create path (topicTitle, no
// topicId). The explicit return type keeps the literal conformant without `as`.
function autoCreateInput(
  id: string,
  topicTitle: string,
  now: number
): Parameters<typeof createChunkWithTopic>[0] {
  return {
    id,
    // Empty topicId + topicTitle selects the auto-create path.
    topicId: '',
    topicTitle,
    title: 'Atomicity Chunk',
    subject: SUBJECT,
    difficulty: 4,
    nextReviewAt: now,
    easeFactor: 2.5,
    repetitions: 0,
    estimatedDuration: 5,
    chunkType: 'new',
    content: 'Atomicity chunk content body.',
    createdAt: now,
    updatedAt: now,
  };
}

describe('createChunkWithTopic atomicity (NEU-771)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('rolls back the auto-created topic when the chunk insert fails on a duplicate id', async () => {
    const db = getSql();

    // Seed an existing chunk whose primary key the new call will collide with.
    const dupId = 'neu-771-dup-chunk';
    const seed = await createTopicWithChunks(seedTopicInput(dupId), topicDeps());
    expect(seed.success).toBe(true);

    const newTopicTitle = 'NEU-771 Auto-Created Topic';
    const now = Date.now();
    const result = await createChunkWithTopic(
      autoCreateInput(dupId, newTopicTitle, now),
      chunkDeps()
    );

    // Deterministic PK collision → non-retryable conflict (NEU-772 mapping preserved).
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected a conflict failure');
    expect(result.error.type).toBe('conflict');
    expect(result.error.retryable).toBe(false);

    // NEU-771: the auto-created topic must NOT be orphaned by the failed insert.
    const orphanTopics = await db
      .select()
      .from(learningTopics)
      .where(and(eq(learningTopics.title, newTopicTitle), eq(learningTopics.subject, SUBJECT)));
    expect(orphanTopics).toHaveLength(0);
  });

  it('commits the auto-created topic and the chunk together on success', async () => {
    const db = getSql();

    const newTopicTitle = 'NEU-771 Happy Topic';
    const chunkId = crypto.randomUUID();
    const now = Date.now();
    const result = await createChunkWithTopic(
      autoCreateInput(chunkId, newTopicTitle, now),
      chunkDeps()
    );
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');

    const topics = await db
      .select()
      .from(learningTopics)
      .where(and(eq(learningTopics.title, newTopicTitle), eq(learningTopics.subject, SUBJECT)));
    expect(topics).toHaveLength(1);

    const chunkRows = await db.select().from(learningChunks).where(eq(learningChunks.id, chunkId));
    expect(chunkRows).toHaveLength(1);
    expect(chunkRows[0].topicId).toBe(topics[0].id);
    expect(result.data.chunk.topicId).toBe(topics[0].id);
  });

  it('shifts existing peers within the same transaction when an explicit order is given', async () => {
    const db = getSql();

    // Seed an existing topic with two chunks at order_index 1 and 2.
    const seed = await createTopicWithChunks(
      twoChunkTopicInput(['order-c1', 'order-c2']),
      topicDeps()
    );
    expect(seed.success).toBe(true);
    const topicId = seed.topic!.topicId;

    // Insert a new chunk at position 2 — the peer currently at 2 shifts to 3.
    const now = Date.now();
    const result = await createChunkWithTopic(
      {
        id: 'order-inserted',
        topicId,
        order: 2,
        title: 'Inserted Chunk',
        subject: SUBJECT,
        difficulty: 4,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 5,
        chunkType: 'new',
        content: 'Inserted chunk content body.',
        createdAt: now,
        updatedAt: now,
      },
      chunkDeps()
    );
    expect(result.success).toBe(true);

    const rows = await db.select().from(learningChunks).where(eq(learningChunks.topicId, topicId));
    const byId = new Map(rows.map(r => [r.id, r.orderIndex]));
    expect(byId.get('order-c1')).toBe(1);
    expect(byId.get('order-inserted')).toBe(2);
    expect(byId.get('order-c2')).toBe(3);
  });
});
