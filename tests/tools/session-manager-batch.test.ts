import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applyBatchSessionChunkOperations } from '../../src/tools/session-manager.js';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { getSql } from '../../src/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

describe('Service: applyBatchSessionChunkOperations', () => {
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();
  });

  afterEach(async () => {
    await resetDatabase();
    if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
    if (fs.existsSync(`${dbFile}-shm`)) fs.unlinkSync(`${dbFile}-shm`);
    if (fs.existsSync(`${dbFile}-wal`)) fs.unlinkSync(`${dbFile}-wal`);
  });

  it('creates and updates chunks with correct counts', async () => {
    const now = Date.now();
    const db = getSql();
    const topicId = `topic-${now}`;

    db.insert(learningTopics)
      .values({
        id: topicId,
        title: 'Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    db.insert(learningChunks)
      .values({
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
      })
      .run();

    db.insert(learningChunks)
      .values({
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
      })
      .run();

    const sessionId = `s-${now}`;
    db.insert(learningSessions)
      .values({
        id: sessionId,
        topicId: topicId,
        chunkIds: JSON.stringify(['c1']),
        mode: 'learning',
        estimatedDuration: 20,
        status: 'active',
        startTime: now,
        endTime: null,
        feedback: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Initialize one chunk
    db.insert(sessionChunks)
      .values({
        id: `sc-${now}`,
        sessionId,
        chunkId: 'c1',
        status: 'pending',
        attemptsJson: null,
        qualityScoresJson: null,
        timeSpentMs: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const result = await applyBatchSessionChunkOperations({
      sessionId,
      operations: [
        {
          chunkId: 'c1',
          status: 'completed',
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
        { chunkId: 'c2', status: 'pending', attempts: [], qualityScores: [], timeSpentMs: 0 },
      ],
    });

    expect(result.created).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.unchanged).toBe(0);
    expect(result.affectedChunkIds.sort()).toEqual(['c1', 'c2']);
  });

  it('rolls back on invalid chunk IDs', async () => {
    const now = Date.now();
    const db = getSql();
    const topicId = `topic-${now}`;

    db.insert(learningTopics)
      .values({
        id: topicId,
        title: 'Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const sessionId = `s-${now}`;
    db.insert(learningSessions)
      .values({
        id: sessionId,
        topicId: topicId,
        chunkIds: JSON.stringify([]),
        mode: 'learning',
        estimatedDuration: 20,
        status: 'active',
        startTime: now,
        endTime: null,
        feedback: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    await expect(
      applyBatchSessionChunkOperations({
        sessionId,
        operations: [{ chunkId: 'does-not-exist', status: 'pending' }],
      })
    ).rejects.toThrow(/Invalid chunk IDs provided/);

    const count = db
      .select({ c: sessionChunks.id })
      .from(sessionChunks)
      .where(eq(sessionChunks.sessionId, sessionId))
      .all().length;
    expect(count).toBe(0);
  });
});
