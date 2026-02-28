import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { processReviewResult } from '../../src/services/chunk-reviews.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

describe('chunk-reviews service', () => {
  const topicId = 'topic-1';
  const chunkId = 'chunk-1';

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();

    const db = getSql();
    const now = Date.now();

    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: chunkId,
      topicId,
      title: 'Test Chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 1,
      estimatedDuration: 15,
      chunkType: 'review',
      createdAt: now,
      updatedAt: now,
    });
  });
  afterAll(teardownTestDb);

  describe('processReviewResult', () => {
    it('updates chunk with good quality review', async () => {
      const result = await processReviewResult(chunkId, 4, {});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chunk).toBeDefined();
        expect(result.data.chunk.repetitions).toBeGreaterThan(1);
        expect(result.data.isLeech).toBe(false);
      }
    });

    it('updates chunk with poor quality review', async () => {
      const result = await processReviewResult(chunkId, 1, {});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chunk).toBeDefined();
        expect(result.data.chunk.repetitions).toBe(0);
      }
    });

    it('returns error for nonexistent chunk', async () => {
      const result = await processReviewResult('nonexistent', 4, {});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('not_found');
        expect(result.error.message).toContain('Learning item not found');
      }
    });

    it('accepts optional parameters', async () => {
      const result = await processReviewResult(chunkId, 4, {
        timeSpentMs: 30000,
        consecutiveFailures: 0,
        daysOverdue: 2,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chunk).toBeDefined();
      }
    });
  });
});
