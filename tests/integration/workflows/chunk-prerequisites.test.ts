import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { DrizzleChunkIdLookupAdapter } from '../../../src/adapters/drizzle/chunk-id-lookup-adapter.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { PrerequisiteReferenceValidator } from '../../../src/domain/services/prerequisite-reference-validator.js';
import crypto from 'node:crypto';

const NOW_MS = new Date('2025-06-15T12:00:00Z').getTime();

describe('chunk-prerequisites service', () => {
  let chunkIdLookup: DrizzleChunkIdLookupAdapter;
  let validator: PrerequisiteReferenceValidator;

  beforeAll(async () => {
    await setupTestDb();
    chunkIdLookup = new DrizzleChunkIdLookupAdapter(getSql());
    validator = new PrerequisiteReferenceValidator(
      (ids: string[]) => chunkIdLookup.getExistingIdsByIds(ids),
      () => chunkIdLookup.getAllIds(),
      () => NOW_MS
    );
  });
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

  describe('getExistingIdsByIds', () => {
    it('returns empty set for empty input', async () => {
      const result = await chunkIdLookup.getExistingIdsByIds([]);
      expect(result.size).toBe(0);
    });

    it('returns matching chunk IDs', async () => {
      await seedChunks(['c1', 'c2', 'c3']);
      const result = await chunkIdLookup.getExistingIdsByIds(['c1', 'c3', 'nonexistent']);
      expect(result.has('c1')).toBe(true);
      expect(result.has('c3')).toBe(true);
      expect(result.has('nonexistent')).toBe(false);
    });
  });

  describe('getAllIds', () => {
    it('returns empty set when no chunks exist', async () => {
      const result = await chunkIdLookup.getAllIds();
      expect(result.size).toBe(0);
    });

    it('returns all chunk IDs', async () => {
      await seedChunks(['a', 'b', 'c']);
      const result = await chunkIdLookup.getAllIds();
      expect(result.size).toBe(3);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
      expect(result.has('c')).toBe(true);
    });
  });

  describe('prerequisiteReferenceValidator', () => {
    it('validates against real database', async () => {
      await seedChunks(['real-chunk']);
      validator.clearCache();
      const result = await validator.validatePrerequisiteReferences(['real-chunk', 'fake-chunk']);
      expect(result.validReferences).toContain('real-chunk');
      expect(result.invalidReferences).toContain('fake-chunk');
    });
  });
});
