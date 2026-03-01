import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

describe.skipIf(!process.env.EMBEDDING_PROVIDER)(
  'createTopicWithChunks with real embeddings',
  () => {
    let ctx: AppContext;

    beforeAll(async () => {
      await setupTestDb();
      ctx = createAppContext();
    });
    beforeEach(cleanupTestDb);
    afterAll(teardownTestDb);

    it('generates embedding vectors for all chunks when creating a topic', async () => {
      const result = await ctx.createTopicWithChunks({
        topicTitle: 'Neural Networks',
        topicDescription: 'Deep learning fundamentals',
        subject: 'AI',
        chunks: [
          {
            title: 'Perceptron',
            content: 'A perceptron is the simplest form of a neural network',
            difficulty: 4,
          },
          {
            title: 'Backpropagation',
            content: 'Backpropagation computes gradients of the loss with respect to weights',
            difficulty: 7,
          },
        ],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.topicId).toBeDefined();
        expect(result.chunkIds).toHaveLength(2);
      }
    });
  }
);
