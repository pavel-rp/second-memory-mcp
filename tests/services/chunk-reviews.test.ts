import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { processReviewResult } from '../../src/services/chunk-reviews.js';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks } from '../../src/db/schema.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

describe('chunk-reviews service', () => {
  let dbFile: string;
  const topicId = 'topic-1';
  const chunkId = 'chunk-1';

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();

    const db = getSql();
    const now = Date.now();

    db.insert(learningTopics)
      .values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      })
      .run();

    db.insert(learningChunks)
      .values({
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
      })
      .run();
  });

  afterEach(async () => {
    await resetDatabase();
    for (const suffix of ['', '-shm', '-wal']) {
      const f = `${dbFile}${suffix}`;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  describe('processReviewResult', () => {
    it('updates chunk with good quality review', async () => {
      const result = await processReviewResult(chunkId, 4, {});
      expect(result.chunk).toBeDefined();
      expect(result.chunk.repetitions).toBeGreaterThan(1);
      expect(result.isLeech).toBe(false);
    });

    it('updates chunk with poor quality review', async () => {
      const result = await processReviewResult(chunkId, 1, {});
      expect(result.chunk).toBeDefined();
      expect(result.chunk.repetitions).toBe(0);
    });

    it('throws for nonexistent chunk', async () => {
      await expect(processReviewResult('nonexistent', 4, {})).rejects.toThrow(
        'Learning item not found'
      );
    });

    it('accepts optional parameters', async () => {
      const result = await processReviewResult(chunkId, 4, {
        timeSpentMs: 30000,
        consecutiveFailures: 0,
        daysOverdue: 2,
      });
      expect(result.chunk).toBeDefined();
    });
  });
});
