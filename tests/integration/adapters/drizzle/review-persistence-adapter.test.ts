import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { getSql } from '../../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionQuestions,
  sessionQuestionChunks,
  sessionQuestionAttempts,
} from '../../../../src/infrastructure/db/schema.js';
import { DrizzleReviewPersistenceAdapter } from '../../../../src/adapters/drizzle/review-persistence-adapter.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../../helpers/db-setup.js';

describe('DrizzleReviewPersistenceAdapter.getWeakAreas (integration)', () => {
  let adapter: DrizzleReviewPersistenceAdapter;
  const db = getSql();
  const now = Date.now();

  beforeAll(async () => {
    await setupTestDb();
    adapter = new DrizzleReviewPersistenceAdapter(db);
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  // ── Seed helpers ─────────────────────────────────────────────

  async function seedTopic(id: string, title: string) {
    await db.insert(learningTopics).values({
      id,
      title,
      subject: 'Test',
      createdAt: now,
      updatedAt: now,
    });
  }

  async function seedChunk(id: string, topicId: string, title: string, easeFactor = 2.5) {
    await db.insert(learningChunks).values({
      id,
      topicId,
      title,
      subject: 'Test',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor,
      repetitions: 1,
      estimatedDuration: 5,
      chunkType: 'review',
      createdAt: now,
      updatedAt: now,
    });
  }

  async function seedSession(id: string) {
    await db.insert(learningSessions).values({
      id,
      mode: 'learning',
      status: 'completed',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function seedAttempt(
    id: string,
    sessionQuestionId: string,
    quality: number,
    createdAt: number,
    attemptNumber = 1
  ) {
    await db.insert(sessionQuestionAttempts).values({
      id,
      sessionQuestionId,
      attemptNumber,
      response: 'test',
      passed: quality >= 3,
      feedback: 'test',
      quality,
      timeSpentMs: 10000,
      createdAt,
    });
  }

  async function seedQuestionWithChunk(
    questionId: string,
    sessionId: string,
    chunkId: string,
    questionIndex: number
  ) {
    await db.insert(sessionQuestions).values({
      id: questionId,
      sessionId,
      questionIndex,
      promptText: 'Test question',
      status: 'answered',
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(sessionQuestionChunks).values({
      id: `sqc-${questionId}`,
      sessionQuestionId: questionId,
      chunkId,
    });
  }

  // ── Tests ────────────────────────────────────────────────────

  it('returns chunk with 2 of 3 recent attempts scoring <= 2', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Weak Chunk');
    await seedSession('s-1');

    // 3 questions → 3 attempts: quality 1, 2, 4 (most recent first)
    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedQuestionWithChunk('sq-3', 's-1', 'c-1', 3);
    await seedAttempt('a-1', 'sq-1', 4, now - 3000); // oldest
    await seedAttempt('a-2', 'sq-2', 1, now - 2000);
    await seedAttempt('a-3', 'sq-3', 2, now - 1000); // newest

    const results = await adapter.getWeakAreas();

    expect(results).toHaveLength(1);
    expect(results[0].chunkId).toBe('c-1');
    expect(results[0].chunkTitle).toBe('Weak Chunk');
    expect(results[0].topicTitle).toBe('Topic A');
    expect(results[0].lowCount).toBe(2);
    expect(results[0].recentAttempts).toBe(3);
  });

  it('excludes chunk with all recent attempts scoring >= 3', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Strong Chunk');
    await seedSession('s-1');

    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedQuestionWithChunk('sq-3', 's-1', 'c-1', 3);
    await seedAttempt('a-1', 'sq-1', 4, now - 3000);
    await seedAttempt('a-2', 'sq-2', 3, now - 2000);
    await seedAttempt('a-3', 'sq-3', 5, now - 1000);

    const results = await adapter.getWeakAreas();

    expect(results).toHaveLength(0);
  });

  it('evaluates chunk with fewer attempts than lookbackCount', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Few Attempts Chunk');
    await seedSession('s-1');

    // Only 2 attempts, both low quality
    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedAttempt('a-1', 'sq-1', 1, now - 2000);
    await seedAttempt('a-2', 'sq-2', 2, now - 1000);

    const results = await adapter.getWeakAreas();

    expect(results).toHaveLength(1);
    expect(results[0].recentAttempts).toBe(2);
    expect(results[0].lowCount).toBe(2);
  });

  it('returns empty results when no attempts exist', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'No Attempts');

    const results = await adapter.getWeakAreas();

    expect(results).toHaveLength(0);
  });

  it('respects custom qualityThreshold and limit', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Chunk 1');
    await seedChunk('c-2', 't-1', 'Chunk 2');
    await seedSession('s-1');

    // Chunk 1: quality scores 3, 3, 3 — not weak with default threshold (2)
    // but weak with threshold 3
    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedQuestionWithChunk('sq-3', 's-1', 'c-1', 3);
    await seedAttempt('a-1', 'sq-1', 3, now - 3000);
    await seedAttempt('a-2', 'sq-2', 3, now - 2000);
    await seedAttempt('a-3', 'sq-3', 3, now - 1000);

    // Chunk 2: quality scores 1, 1, 1
    await seedQuestionWithChunk('sq-4', 's-1', 'c-2', 4);
    await seedQuestionWithChunk('sq-5', 's-1', 'c-2', 5);
    await seedQuestionWithChunk('sq-6', 's-1', 'c-2', 6);
    await seedAttempt('a-4', 'sq-4', 1, now - 3000);
    await seedAttempt('a-5', 'sq-5', 1, now - 2000);
    await seedAttempt('a-6', 'sq-6', 1, now - 1000);

    // With threshold=3, both chunks are weak; limit=1 → only 1 returned
    const results = await adapter.getWeakAreas({
      qualityThreshold: 3,
      limit: 1,
    });

    expect(results).toHaveLength(1);
  });

  it('orders results by avgRecentQuality ASC then easeFactor ASC', async () => {
    await seedTopic('t-1', 'Topic A');
    // c-1: ease 2.0, will have avg quality ~1.67
    await seedChunk('c-1', 't-1', 'High ease weak', 2.0);
    // c-2: ease 1.5, will have avg quality ~1.67
    await seedChunk('c-2', 't-1', 'Low ease weak', 1.5);
    // c-3: ease 2.5, will have avg quality ~1.0
    await seedChunk('c-3', 't-1', 'Worst quality', 2.5);

    await seedSession('s-1');

    // c-1: quality 1, 2, 2 → avg 1.67
    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedQuestionWithChunk('sq-3', 's-1', 'c-1', 3);
    await seedAttempt('a-1', 'sq-1', 1, now - 3000);
    await seedAttempt('a-2', 'sq-2', 2, now - 2000);
    await seedAttempt('a-3', 'sq-3', 2, now - 1000);

    // c-2: quality 1, 2, 2 → avg 1.67 (same avg, lower ease)
    await seedQuestionWithChunk('sq-4', 's-1', 'c-2', 4);
    await seedQuestionWithChunk('sq-5', 's-1', 'c-2', 5);
    await seedQuestionWithChunk('sq-6', 's-1', 'c-2', 6);
    await seedAttempt('a-4', 'sq-4', 1, now - 3000);
    await seedAttempt('a-5', 'sq-5', 2, now - 2000);
    await seedAttempt('a-6', 'sq-6', 2, now - 1000);

    // c-3: quality 1, 1, 1 → avg 1.0 (worst)
    await seedQuestionWithChunk('sq-7', 's-1', 'c-3', 7);
    await seedQuestionWithChunk('sq-8', 's-1', 'c-3', 8);
    await seedQuestionWithChunk('sq-9', 's-1', 'c-3', 9);
    await seedAttempt('a-7', 'sq-7', 1, now - 3000);
    await seedAttempt('a-8', 'sq-8', 1, now - 2000);
    await seedAttempt('a-9', 'sq-9', 1, now - 1000);

    const results = await adapter.getWeakAreas();

    expect(results).toHaveLength(3);
    // First: c-3 (lowest avgRecentQuality = 1.0)
    expect(results[0].chunkId).toBe('c-3');
    // Second: c-2 (avg 1.67, ease 1.5 — lower ease)
    expect(results[1].chunkId).toBe('c-2');
    // Third: c-1 (avg 1.67, ease 2.0 — higher ease)
    expect(results[2].chunkId).toBe('c-1');
  });

  // ── countAttempts (NEU-839 leech evidence base) ──────────────

  it('counts every graded attempt mapped to a chunk across questions', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Chunk 1');
    await seedSession('s-1');

    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedQuestionWithChunk('sq-3', 's-1', 'c-1', 3);
    await seedAttempt('a-1', 'sq-1', 1, now - 3000);
    await seedAttempt('a-2', 'sq-2', 2, now - 2000);
    await seedAttempt('a-3', 'sq-3', 4, now - 1000);

    expect(await adapter.countAttempts('c-1')).toBe(3);
  });

  it('excludes ungraded (null-quality) attempts from the count', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Chunk 1');
    await seedSession('s-1');

    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-1', 2);
    await seedAttempt('a-1', 'sq-1', 3, now - 2000);
    // Ungraded attempt (quality NULL) carries no evidence and must not be counted.
    await db.insert(sessionQuestionAttempts).values({
      id: 'a-null',
      sessionQuestionId: 'sq-2',
      attemptNumber: 1,
      response: 'ungraded',
      passed: false,
      feedback: 'pending',
      quality: null,
      timeSpentMs: 1000,
      createdAt: now - 1000,
    });

    expect(await adapter.countAttempts('c-1')).toBe(1);
  });

  it('does not count attempts belonging to other chunks', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Chunk 1');
    await seedChunk('c-2', 't-1', 'Chunk 2');
    await seedSession('s-1');

    await seedQuestionWithChunk('sq-1', 's-1', 'c-1', 1);
    await seedQuestionWithChunk('sq-2', 's-1', 'c-2', 2);
    await seedAttempt('a-1', 'sq-1', 1, now - 2000);
    await seedAttempt('a-2', 'sq-2', 1, now - 1000);

    expect(await adapter.countAttempts('c-1')).toBe(1);
    expect(await adapter.countAttempts('c-2')).toBe(1);
  });

  it('returns 0 for a chunk with no recorded attempts', async () => {
    await seedTopic('t-1', 'Topic A');
    await seedChunk('c-1', 't-1', 'Untouched Chunk');

    expect(await adapter.countAttempts('c-1')).toBe(0);
  });
});
