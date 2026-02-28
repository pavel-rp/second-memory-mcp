import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';
import {
  chunkLookupFn,
  sharedValidator,
  createRecommendationEngine,
} from '../../src/server/shared-instances.js';

describe('server/shared-instances', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  const now = Date.now();

  describe('chunkLookupFn', () => {
    it('returns mapped learning item for existing chunk', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-1',
        title: 'Test',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-1',
        topicId: 'topic-1',
        title: 'Chunk 1',
        subject: 'Math',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });

      const item = await chunkLookupFn('chunk-1');
      expect(item).toBeDefined();
      expect(item!.id).toBe('chunk-1');
    });

    it('returns undefined for non-existent chunk', async () => {
      const item = await chunkLookupFn('nonexistent');
      expect(item).toBeUndefined();
    });
  });

  describe('sharedValidator', () => {
    it('is a PrerequisiteValidator instance', () => {
      expect(sharedValidator).toBeDefined();
      expect(typeof sharedValidator.validatePrerequisites).toBe('function');
    });
  });

  describe('createRecommendationEngine', () => {
    it('returns a new RecommendationEngine instance', () => {
      const engine = createRecommendationEngine();
      expect(engine).toBeDefined();
    });

    it('returns a different instance on each call', () => {
      const engine1 = createRecommendationEngine();
      const engine2 = createRecommendationEngine();
      expect(engine1).not.toBe(engine2);
    });
  });
});
