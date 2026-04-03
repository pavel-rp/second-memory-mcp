import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import crypto from 'node:crypto';

describe('chunk-queries service', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedData() {
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
      id: 'chunk-1',
      topicId,
      title: 'Chunk One',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now - 86400000,
      easeFactor: 2.5,
      repetitions: 3,
      estimatedDuration: 15,
      chunkType: 'review',
      content: 'Test content',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { topicId };
  }

  describe('mapChunkRowToLearningItem', () => {
    it('maps chunk row to learning item', () => {
      const now = Date.now();
      const row = {
        id: 'test',
        topicId: 'topic-1',
        title: 'Test',
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 2,
        lastReviewedAt: now - 86400000,
        estimatedDuration: 15,
        intervalDays: 6,
        chunkType: 'review' as const,
        contentStatus: 'final' as const,
        condensedSummary: null,
        knowledgeType: null,
        prerequisitesJson: ['prereq-1'],
        tagsJson: ['math'],
        createdAt: now,
        updatedAt: now,
        topicTitle: 'My Topic',
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        contentEmbedding: null,
      };

      const item = ctx.mapChunkRowToLearningItem(row);
      expect(item.id).toBe('test');
      expect(item.title).toBe('Test');
      expect(item.chunkType).toBe('review');
      expect(item.prerequisites).toEqual(['prereq-1']);
      expect(item.tags).toEqual(['math']);
      expect(item.topicTitle).toBe('My Topic');
    });

    it('handles unknown chunkType as new', () => {
      const row = {
        id: 'test',
        topicId: 'topic-1',
        title: 'Test',
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: Date.now(),
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 15,
        intervalDays: 1,
        chunkType: 'unknown' as any,
        contentStatus: 'final' as const,
        condensedSummary: null,
        knowledgeType: null,
        prerequisitesJson: null,
        tagsJson: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        topicTitle: null,
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        contentEmbedding: null,
      };

      const item = ctx.mapChunkRowToLearningItem(row);
      expect(item.chunkType).toBe('new');
    });

    it('includes content when requested', () => {
      const now = Date.now();
      const row = {
        id: 'test',
        topicId: 'topic-1',
        title: 'Test',
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 15,
        intervalDays: 1,
        chunkType: 'new' as const,
        contentStatus: 'final' as const,
        condensedSummary: null,
        knowledgeType: null,
        prerequisitesJson: null,
        tagsJson: null,
        createdAt: now,
        updatedAt: now,
        topicTitle: null,
        content: 'My content',
        contentVersion: 2,
        contentUpdatedAt: now,
        contentEmbedding: null,
      };

      const item = ctx.mapChunkRowToLearningItem(row, { includeContent: true }) as any;
      expect(item.content).toBe('My content');
      expect(item.contentVersion).toBe(2);
    });
  });

  describe('listChunksAsLearningItems', () => {
    it('returns empty array when no chunks exist', async () => {
      const items = await ctx.listChunksAsLearningItems();
      expect(items).toEqual([]);
    });

    it('returns learning items from database', async () => {
      await seedData();
      const items = await ctx.listChunksAsLearningItems();
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('Chunk One');
    });

    it('filters by subject', async () => {
      await seedData();
      const mathItems = await ctx.listChunksAsLearningItems({ subjectFilter: 'Math' });
      expect(mathItems.length).toBe(1);

      const scienceItems = await ctx.listChunksAsLearningItems({ subjectFilter: 'Science' });
      expect(scienceItems.length).toBe(0);
    });
  });

  describe('batchFetchChunksMinimal', () => {
    it('returns empty array when no chunks exist', async () => {
      const chunks = await ctx.batchFetchChunksMinimal();
      expect(chunks).toEqual([]);
    });

    it('returns minimal metadata', async () => {
      await seedData();
      const chunks = await ctx.batchFetchChunksMinimal();
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toHaveProperty('id');
      expect(chunks[0]).toHaveProperty('title');
      expect(chunks[0]).toHaveProperty('difficulty');
    });

    it('filters by isLeech: true to return only remediation chunks', async () => {
      await seedData();
      const db = getSql();
      const now = Date.now();
      await db.insert(learningChunks).values({
        id: 'chunk-leech',
        topicId: (await ctx.batchFetchChunksMinimal())[0].topicId,
        title: 'Leech Chunk',
        subject: 'Math',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 1.3,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'remediation',
        createdAt: now,
        updatedAt: now,
      });

      const leeches = await ctx.batchFetchChunksMinimal({ isLeech: true });
      expect(leeches.length).toBe(1);
      expect(leeches[0].id).toBe('chunk-leech');
    });

    it('returns chunks ordered by nextReviewAt ASC, id ASC when limit applied', async () => {
      const db = getSql();
      const now = Date.now();
      const topicId = crypto.randomUUID();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Order Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });

      // Insert chunks with deliberately out-of-order nextReviewAt values
      const chunkValues = [
        { id: 'order-c', nextReviewAt: now + 3000 },
        { id: 'order-a', nextReviewAt: now + 1000 },
        { id: 'order-b', nextReviewAt: now + 2000 },
      ];
      await db.insert(learningChunks).values(
        chunkValues.map(c => ({
          id: c.id,
          topicId,
          title: `Chunk ${c.id}`,
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: c.nextReviewAt,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new' as const,
          createdAt: now,
          updatedAt: now,
        }))
      );

      const chunks = await ctx.batchFetchChunksMinimal({ limit: 2 });
      expect(chunks).toHaveLength(2);
      expect(chunks[0].id).toBe('order-a');
      expect(chunks[1].id).toBe('order-b');
    });

    it('returns earliest-due chunks when limit is smaller than total', async () => {
      const db = getSql();
      const now = Date.now();
      const topicId = crypto.randomUUID();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Due Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(learningChunks).values(
        [1, 2, 3, 4, 5].map(i => ({
          id: `due-${i}`,
          topicId,
          title: `Chunk ${i}`,
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now + i * 1000,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new' as const,
          createdAt: now,
          updatedAt: now,
        }))
      );

      const chunks = await ctx.batchFetchChunksMinimal({ limit: 3 });
      expect(chunks).toHaveLength(3);
      // Should get the 3 earliest-due, in order
      expect(chunks.map(c => c.id)).toEqual(['due-1', 'due-2', 'due-3']);
    });

    it('returns all chunks in deterministic order without limit', async () => {
      const db = getSql();
      const now = Date.now();
      const topicId = crypto.randomUUID();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'No Limit Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });

      // Same nextReviewAt — ties broken by id ASC
      await db.insert(learningChunks).values(
        ['z-chunk', 'a-chunk', 'm-chunk'].map(id => ({
          id,
          topicId,
          title: `Chunk ${id}`,
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new' as const,
          createdAt: now,
          updatedAt: now,
        }))
      );

      const chunks = await ctx.batchFetchChunksMinimal();
      expect(chunks.map(c => c.id)).toEqual(['a-chunk', 'm-chunk', 'z-chunk']);
    });

    it('filters by isLeech: false to exclude remediation chunks', async () => {
      await seedData();
      const db = getSql();
      const now = Date.now();
      const topicId = (await ctx.batchFetchChunksMinimal())[0].topicId;
      await db.insert(learningChunks).values({
        id: 'chunk-leech-2',
        topicId,
        title: 'Leech Chunk 2',
        subject: 'Math',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 1.3,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'remediation',
        createdAt: now,
        updatedAt: now,
      });

      const nonLeeches = await ctx.batchFetchChunksMinimal({ isLeech: false });
      expect(nonLeeches.every(c => c.chunkType !== 'remediation')).toBe(true);
      expect(nonLeeches.length).toBe(1);
      expect(nonLeeches[0].id).toBe('chunk-1');
    });
  });
});
