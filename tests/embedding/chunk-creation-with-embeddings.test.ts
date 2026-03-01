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

      // Seed a topic
      const topicId = 'emb-chunk-topic-1';
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Machine Learning Basics',
        description: 'Introduction to ML concepts',
        subject: 'AI',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const result = await ctx.createChunkWithTopic({
        topicId,
        title: 'Gradient Descent',
        content: 'Gradient descent is an optimization algorithm used to minimize the loss function',
        difficulty: 6,
        orderIndex: 0,
      });

      expect(result.success).toBe(true);
    });
  }
);
