import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { applyBatchSessionChunkOperations } from '../../../../src/domain/services/session-analyzer.js';
import {
  persistBatchSessionChunkOperations,
  getSessionWithChunks,
} from '../../../../src/services/sessions.js';
import { getSql } from '../../../../src/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../../../src/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../../helpers/db-setup.js';

describe('Service: applyBatchSessionChunkOperations', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('creates and updates chunks with correct counts', async () => {
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

    const { chunks } = await getSessionWithChunks(sessionId);
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
    const result = await applyBatchSessionChunkOperations({
      sessionId,
      operations,
      activeSessionExists: true,
      persistFn: args =>
        persistBatchSessionChunkOperations({
          ...args,
          existingChunks: chunks,
        }),
    });

    expect(result.created).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.unchanged).toBe(0);
    expect(result.affectedChunkIds.sort()).toEqual(['c1', 'c2']);
  });

  it('throws when session does not exist', async () => {
    await expect(
      applyBatchSessionChunkOperations({
        sessionId: 'nonexistent',
        operations: [{ chunkId: 'c1', status: 'pending' }],
        activeSessionExists: false,
        persistFn: async () => ({ created: 0, updated: 0, unchanged: 0, affectedChunkIds: [] }),
      })
    ).rejects.toThrow(/No active session found/);
  });
});
