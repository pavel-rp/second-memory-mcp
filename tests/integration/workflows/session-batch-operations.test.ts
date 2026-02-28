import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('Integration: batch session chunk operations', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('creates and updates chunks with correct counts via AppContext', async () => {
    const ctx = createAppContext();
    const now = Date.now();
    const db = getSql();
    const topicId = `topic-${now}`;

    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'c1',
      topicId,
      title: 'C1',
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: null,
      tagsJson: null,
      content: 'x',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'c2',
      topicId,
      title: 'C2',
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: null,
      tagsJson: null,
      content: 'y',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const sessionId = `s-${now}`;
    await db.insert(learningSessions).values({
      id: sessionId,
      topicId: topicId,
      chunkIds: ['c1'],
      mode: 'learning',
      estimatedDuration: 20,
      status: 'active',
      startTime: now,
      endTime: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(sessionChunks).values({
      id: `sc-${now}`,
      sessionId,
      chunkId: 'c1',
      status: 'pending',
      attemptsJson: null,
      qualityScoresJson: null,
      timeSpentMs: 0,
      createdAt: now,
      updatedAt: now,
    });

    const operations = [
      {
        chunkId: 'c1',
        status: 'completed' as const,
        attempts: [
          {
            timestamp: new Date(now).toISOString(),
            quality: 5,
            time_spent_ms: 1000,
            completed: true,
          },
        ],
        qualityScores: [5],
        timeSpentMs: 1000,
      },
      {
        chunkId: 'c2',
        status: 'pending' as const,
        attempts: [],
        qualityScores: [],
        timeSpentMs: 0,
      },
    ];

    const result = await ctx.batchUpdateSessionChunks(sessionId, operations);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.created).toBe(1);
      expect(result.data.updated).toBe(1);
      expect(result.data.unchanged).toBe(0);
    }
  });

  it('returns error when session does not exist', async () => {
    const ctx = createAppContext();
    const result = await ctx.batchUpdateSessionChunks('nonexistent', [
      { chunkId: 'c1', status: 'pending' },
    ]);
    expect(result.success).toBe(false);
  });
});
