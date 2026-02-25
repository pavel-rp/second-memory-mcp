import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listDueReviews } from '../../src/services/reviews.js';
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

describe('reviews service', () => {
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();
  });

  afterEach(async () => {
    await resetDatabase();
    for (const suffix of ['', '-shm', '-wal']) {
      const f = `${dbFile}${suffix}`;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  describe('listDueReviews', () => {
    it('returns empty array when no chunks exist', async () => {
      const result = await listDueReviews();
      expect(result).toEqual([]);
    });

    it('returns chunks due for review', async () => {
      const db = getSql();
      const now = Date.now();
      const topicId = crypto.randomUUID();

      db.insert(learningTopics)
        .values({
          id: topicId,
          title: 'Test Topic',
          subject: 'Math',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Due chunk (nextReviewAt in the past)
      db.insert(learningChunks)
        .values({
          id: 'due-chunk',
          topicId,
          title: 'Due Chunk',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now - 86400000,
          easeFactor: 2.5,
          repetitions: 1,
          estimatedDuration: 15,
          chunkType: 'review',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Not due chunk (nextReviewAt in the future)
      db.insert(learningChunks)
        .values({
          id: 'future-chunk',
          topicId,
          title: 'Future Chunk',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now + 86400000 * 7,
          easeFactor: 2.5,
          repetitions: 1,
          estimatedDuration: 15,
          chunkType: 'review',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const result = await listDueReviews(now);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('due-chunk');
    });
  });
});
