import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import {
  getExistingChunkIdsByIds,
  getAllChunkIds,
  prerequisiteReferenceValidator,
} from '../../src/services/chunk-prerequisites.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import crypto from 'node:crypto';

describe('chunk-prerequisites service', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedChunks(ids: string[]) {
    const db = getSql();
    const now = Date.now();
    const topicId = crypto.randomUUID();

    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });

    for (const id of ids) {
      await db.insert(learningChunks).values({
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
      });
    }
  }

  describe('getExistingChunkIdsByIds', () => {
    it('returns empty set for empty input', async () => {
      const result = await getExistingChunkIdsByIds([]);
      expect(result.size).toBe(0);
    });

    it('returns matching chunk IDs', async () => {
      await seedChunks(['c1', 'c2', 'c3']);
      const result = await getExistingChunkIdsByIds(['c1', 'c3', 'nonexistent']);
      expect(result.has('c1')).toBe(true);
      expect(result.has('c3')).toBe(true);
      expect(result.has('nonexistent')).toBe(false);
    });
  });

  describe('getAllChunkIds', () => {
    it('returns empty set when no chunks exist', async () => {
      const result = await getAllChunkIds();
      expect(result.size).toBe(0);
    });

    it('returns all chunk IDs', async () => {
      await seedChunks(['a', 'b', 'c']);
      const result = await getAllChunkIds();
      expect(result.size).toBe(3);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
      expect(result.has('c')).toBe(true);
    });
  });

  describe('prerequisiteReferenceValidator singleton', () => {
    it('validates against real database', async () => {
      await seedChunks(['real-chunk']);
      prerequisiteReferenceValidator.clearCache();
      const result = await prerequisiteReferenceValidator.validatePrerequisiteReferences([
        'real-chunk',
        'fake-chunk',
      ]);
      expect(result.validReferences).toContain('real-chunk');
      expect(result.invalidReferences).toContain('fake-chunk');
    });
  });
});
