import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics } from '../../src/infrastructure/db/schema.js';

describe.skipIf(!process.env.EMBEDDING_PROVIDER)(
  'createChunkWithTopic with real embeddings',
  () => {
    let ctx: AppContext;

    beforeAll(async () => {
      await setupTestDb();
      ctx = createAppContext();
    });
    beforeEach(cleanupTestDb);
    afterAll(teardownTestDb);

    it('generates embedding vector when creating a chunk', async () => {
      const db = getSql();
      const now = Date.now();

      // Seed a topic
      const topicId = 'emb-chunk-topic-1';
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Machine Learning Basics',
        summary: 'Introduction to ML concepts',
        subject: 'AI',
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.createChunkWithTopic({
        id: crypto.randomUUID(),
        topicId,
        title: 'Gradient Descent',
        subject: 'AI',
        content: 'Gradient descent is an optimization algorithm used to minimize the loss function',
        difficulty: 6,
        estimatedDuration: 10,
        chunkType: 'new',
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        createdAt: now,
        updatedAt: now,
      });

      expect(result.success).toBe(true);
    });
  }
);
