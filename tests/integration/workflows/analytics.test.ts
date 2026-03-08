import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('analytics workflows', () => {
  let ctx: AppContext;
  const topicId = 'topic-analytics';
  const chunkId = 'chunk-analytics';
  const sessionId = 'session-analytics';
  const sessionChunkId = 'sc-analytics';

  // 2026-01-15 12:00:00 UTC
  const reviewTime = new Date('2026-01-15T12:00:00.000Z').getTime();

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });

  beforeEach(async () => {
    await cleanupTestDb();

    const db = getSql();
    const now = Date.now();

    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Algebra',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: chunkId,
      topicId,
      title: 'Quadratic Formula',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 1,
      estimatedDuration: 15,
      chunkType: 'new',
      tagsJson: ['algebra', 'equations'],
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningSessions).values({
      id: sessionId,
      topicId,
      mode: 'review',
      status: 'completed',
      startTime: reviewTime,
      endTime: reviewTime + 600_000,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(sessionChunks).values({
      id: sessionChunkId,
      sessionId,
      chunkId,
      status: 'completed',
      qualityScoresJson: [4, 5],
      timeSpentMs: 30000,
      createdAt: now,
      updatedAt: now,
    });
  });

  afterAll(teardownTestDb);

  describe('computeDailyAnalytics', () => {
    it('returns KPIs for a day with reviews', async () => {
      const result = await ctx.computeDailyAnalytics('2026-01-15');

      expect(result.date).toBe('2026-01-15');
      expect(result.reviews_completed).toBe(2); // two quality scores
      expect(result.new_chunks_learned).toBe(2); // chunkType is 'new'
      expect(result.average_quality).toBe(4.5);
    });

    it('returns zero KPIs for a day with no reviews', async () => {
      const result = await ctx.computeDailyAnalytics('2026-01-16');

      expect(result.date).toBe('2026-01-16');
      expect(result.reviews_completed).toBe(0);
      expect(result.average_quality).toBe(0);
    });
  });

  describe('computeWindowAnalytics', () => {
    it('returns window analytics with breakdowns', async () => {
      const result = await ctx.computeWindowAnalytics('2026-01-15', '2026-01-15', {
        includeBreakdowns: true,
      });

      expect(result.total.reviews_completed).toBe(2);
      expect(result.days).toHaveLength(1);
      expect(result.breakdowns?.by_topic?.Algebra).toBeDefined();
      expect(result.breakdowns?.by_tag?.algebra).toBeDefined();
    });

    it('returns empty results for range with no reviews', async () => {
      const result = await ctx.computeWindowAnalytics('2026-02-01', '2026-02-03', {
        includeBreakdowns: false,
      });

      expect(result.total.reviews_completed).toBe(0);
      expect(result.days).toHaveLength(3);
    });

    it('uses exclusive upper bound correctly', async () => {
      // Session is at 2026-01-15T12:00 — querying 01-14 to 01-14 should find nothing
      const result = await ctx.computeWindowAnalytics('2026-01-14', '2026-01-14', {});
      expect(result.total.reviews_completed).toBe(0);
    });
  });
});
