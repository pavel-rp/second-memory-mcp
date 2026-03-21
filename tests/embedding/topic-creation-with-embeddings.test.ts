import crypto from 'node:crypto';
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
        topicSummary: 'Introduction to neural networks and deep learning fundamentals',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Perceptron',
            content: 'A perceptron is the simplest form of a neural network',
            difficulty: 4,
            estimatedDuration: 10,
            chunkType: 'new',
          },
          {
            id: crypto.randomUUID(),
            title: 'Backpropagation',
            content: 'Backpropagation computes gradients of the loss with respect to weights',
            difficulty: 7,
            estimatedDuration: 15,
            chunkType: 'new',
          },
        ],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.topic).toBeDefined();
        expect(result.topic!.chunks).toHaveLength(2);
      }
    });
  }
);
