import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';

describe.skipIf(!process.env.EMBEDDING_PROVIDER)(
  'searchLearningContent with real embeddings',
  () => {
    let ctx: AppContext;

    beforeAll(async () => {
      await setupTestDb();
      ctx = createAppContext();
    });
    beforeEach(cleanupTestDb);
    afterAll(teardownTestDb);

    it('performs semantic search on embedded chunks', async () => {
      const db = getSql();

      // Seed a topic and chunk with content
      const topicId = 'emb-search-topic-1';
      const chunkId = 'emb-search-chunk-1';
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'TypeScript Generics',
        description: 'Advanced TypeScript type parameters',
        subject: 'Programming',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await db.insert(learningChunks).values({
        id: chunkId,
        topicId,
        title: 'Generic Constraints',
        content:
          'Generic constraints in TypeScript allow you to restrict type parameters using extends keyword',
        difficulty: 5,
        orderIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nextReviewAt: Date.now(),
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        consecutiveFailures: 0,
      });

      const results = await ctx.searchLearningContent({
        query: 'TypeScript type constraints',
        mode: 'semantic',
        limit: 10,
      });

      expect(results).toBeDefined();
      expect(results.query).toBe('TypeScript type constraints');
    });
  }
);
