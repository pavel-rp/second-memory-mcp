import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import * as reviewWorkflows from '../../../src/orchestration/review-workflows.js';
import { DrizzleReviewPersistenceAdapter } from '../../../src/adapters/drizzle/review-persistence-adapter.js';
import { resolveAlgorithmConfig } from '../../../src/config/resolve-algorithm-config.js';

describe('chunk-reviews service', () => {
  let ctx: AppContext;
  let reviewDeps: reviewWorkflows.ReviewDeps;
  const topicId = 'topic-1';
  const chunkId = 'chunk-1';

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    const db = getSql();
    reviewDeps = {
      reviewPersistence: new DrizzleReviewPersistenceAdapter(db),
      algorithmConfig: resolveAlgorithmConfig(),
    };
  });
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

  describe('getLeeches', () => {
    it('returns chunks with chunkType remediation', async () => {
      const db = getSql();
      const now = Date.now();
      await db.insert(learningChunks).values({
        id: 'chunk-leech',
        topicId,
        title: 'Leech Chunk',
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 1.3,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'remediation',
        createdAt: now,
        updatedAt: now,
      });

      const leeches = await ctx.getLeeches({});
      expect(leeches.length).toBe(1);
      expect(leeches[0].id).toBe('chunk-leech');
    });

    it('returns empty when no leeches exist', async () => {
      const leeches = await ctx.getLeeches({});
      expect(leeches.length).toBe(0);
    });
  });

  describe('resolveLeech', () => {
    it('resolves a leech chunk with reset_progress', async () => {
      const db = getSql();
      const now = Date.now();
      await db.insert(learningChunks).values({
        id: 'chunk-leech-resolve',
        topicId,
        title: 'Leech to Resolve',
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 1.3,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'remediation',
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.resolveLeech('chunk-leech-resolve', 'reset_progress');
      expect(result.success).toBe(true);
    });

    it('returns error for nonexistent chunk', async () => {
      const result = await ctx.resolveLeech('nonexistent', 'reset_progress');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('not_found');
      }
    });
  });

  describe('processReviewResult', () => {
    it('updates chunk with good quality review', async () => {
      const result = await reviewWorkflows.processReviewResult(chunkId, 4, {}, reviewDeps);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updated).toBeDefined();
        expect(result.data.updated.repetitions).toBeGreaterThan(1);
        expect(result.data.isLeech).toBe(false);
      }
    });

    it('updates chunk with poor quality review', async () => {
      const result = await reviewWorkflows.processReviewResult(chunkId, 1, {}, reviewDeps);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updated).toBeDefined();
        expect(result.data.updated.repetitions).toBe(0);
      }
    });

    it('returns error for nonexistent chunk', async () => {
      const result = await reviewWorkflows.processReviewResult('nonexistent', 4, {}, reviewDeps);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('not_found');
        expect(result.error.message).toContain('Learning item not found');
      }
    });

    it('accepts optional parameters', async () => {
      const result = await reviewWorkflows.processReviewResult(
        chunkId,
        4,
        {
          timeSpentMs: 30000,
          consecutiveFailures: 0,
          daysOverdue: 2,
        },
        reviewDeps
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updated).toBeDefined();
      }
    });
  });
});
