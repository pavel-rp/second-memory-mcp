import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { PrerequisiteMasteryService } from '../../src/services/prerequisite-mastery.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks } from '../../src/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import crypto from 'node:crypto';

describe('PrerequisiteMasteryService', () => {
  let service: PrerequisiteMasteryService;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    service = new PrerequisiteMasteryService();
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

  describe('criteria management', () => {
    it('returns current mastery criteria', () => {
      const criteria = service.getMasteryCriteria();
      expect(criteria).toHaveProperty('minimumQualityScore');
      expect(criteria).toHaveProperty('requiredAttempts');
      expect(criteria).toHaveProperty('recencyDays');
      expect(criteria).toHaveProperty('successRate');
    });

    it('updates mastery criteria', () => {
      service.updateMasteryCriteria({ minimumQualityScore: 4.5 });
      const criteria = service.getMasteryCriteria();
      expect(criteria.minimumQualityScore).toBe(4.5);
    });
  });

  describe('getMasteryBreakdown', () => {
    it('returns detailed breakdown for nonexistent item', async () => {
      const breakdown = await service.getMasteryBreakdown('nonexistent');
      expect(breakdown.isMastered).toBe(false);
      expect(breakdown.evaluations.qualityMet).toBe(false);
      expect(breakdown.evaluations.attemptsMet).toBe(false);
    });

    it('returns detailed breakdown for existing item', async () => {
      await seedChunk('item-1', { repetitions: 3, easeFactor: 2.5 });
      const breakdown = await service.getMasteryBreakdown('item-1');
      expect(breakdown.metrics).toHaveProperty('averageQuality');
      expect(breakdown.criteria).toHaveProperty('minimumQualityScore');
      expect(breakdown.evaluations).toHaveProperty('qualityMet');
    });
  });
});
