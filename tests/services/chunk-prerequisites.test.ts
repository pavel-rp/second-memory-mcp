import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getExistingChunkIdsByIds,
  getAllChunkIds,
  prerequisiteReferenceValidator,
} from '../../src/services/chunk-prerequisites.js';
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

describe('chunk-prerequisites service', () => {
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

  function seedChunks(ids: string[]) {
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

    for (const id of ids) {
      db.insert(learningChunks)
        .values({
          id,
          topicId,
          title: `Chunk ${id}`,
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 15,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }
  }

  describe('getExistingChunkIdsByIds', () => {
    it('returns empty set for empty input', () => {
      const result = getExistingChunkIdsByIds([]);
      expect(result.size).toBe(0);
    });

    it('returns matching chunk IDs', () => {
      seedChunks(['c1', 'c2', 'c3']);
      const result = getExistingChunkIdsByIds(['c1', 'c3', 'nonexistent']);
      expect(result.has('c1')).toBe(true);
      expect(result.has('c3')).toBe(true);
      expect(result.has('nonexistent')).toBe(false);
    });
  });

  describe('getAllChunkIds', () => {
    it('returns empty set when no chunks exist', () => {
      const result = getAllChunkIds();
      expect(result.size).toBe(0);
    });

    it('returns all chunk IDs', () => {
      seedChunks(['a', 'b', 'c']);
      const result = getAllChunkIds();
      expect(result.size).toBe(3);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
      expect(result.has('c')).toBe(true);
    });
  });

  describe('prerequisiteReferenceValidator singleton', () => {
    it('validates against real database', () => {
      seedChunks(['real-chunk']);
      prerequisiteReferenceValidator.clearCache();
      const result = prerequisiteReferenceValidator.validatePrerequisiteReferences([
        'real-chunk',
        'fake-chunk',
      ]);
      expect(result.validReferences).toContain('real-chunk');
      expect(result.invalidReferences).toContain('fake-chunk');
    });
  });
});
