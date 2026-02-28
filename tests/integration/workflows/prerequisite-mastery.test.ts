import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { DrizzlePrerequisiteMasteryAdapter } from '../../../src/adapters/drizzle/prerequisite-mastery-adapter.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import crypto from 'node:crypto';

describe('PrerequisiteMasteryService', () => {
  let service: DrizzlePrerequisiteMasteryAdapter;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    service = new DrizzlePrerequisiteMasteryAdapter(getSql());
  });
  afterAll(teardownTestDb);

  async function seedChunk(
    id: string,
    overrides: {
      easeFactor?: number;
      repetitions?: number;
      lastReviewedAt?: number | null;
    } = {}
  ) {
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

    await db.insert(learningChunks).values({
      id,
      topicId,
      title: 'Test Chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: overrides.easeFactor ?? 2.5,
      repetitions: overrides.repetitions ?? 0,
      lastReviewedAt: overrides.lastReviewedAt ?? null,
      estimatedDuration: 15,
      chunkType: 'new',
      createdAt: now,
      updatedAt: now,
    });
  }

  describe('checkItemMastery', () => {
    it('returns not mastered for nonexistent item', async () => {
      const result = await service.checkItemMastery('nonexistent');
      expect(result.isMastered).toBe(false);
      expect(result.attemptCount).toBe(0);
    });

    it('returns not mastered for zero-repetition chunk', async () => {
      await seedChunk('never-reviewed', { repetitions: 0 });
      const result = await service.checkItemMastery('never-reviewed');
      expect(result.isMastered).toBe(false);
      expect(result.attemptCount).toBe(0);
    });

    it('returns mastered for well-practiced recent chunk', async () => {
      await seedChunk('mastered', {
        easeFactor: 3.0,
        repetitions: 5,
        lastReviewedAt: Date.now() - 86400000, // 1 day ago
      });
      const result = await service.checkItemMastery('mastered');
      expect(result.isMastered).toBe(true);
    });
  });

  describe('checkMultipleItemsMastery', () => {
    it('returns map of mastery statuses', async () => {
      await seedChunk('item-a', { repetitions: 0 });
      const results = await service.checkMultipleItemsMastery(['item-a', 'nonexistent']);
      expect(results.size).toBe(2);
      expect(results.get('item-a')!.isMastered).toBe(false);
      expect(results.get('nonexistent')!.isMastered).toBe(false);
    });
  });
});
