import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  mapChunkRowToLearningItem,
  listChunksAsLearningItems,
  batchFetchChunksMinimal,
} from '../../src/services/chunk-queries.js';
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

describe('chunk-queries service', () => {
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

  function seedData() {
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

    db.insert(learningChunks)
      .values({
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
      })
      .run();

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
        prerequisitesJson: '["prereq-1"]',
        tagsJson: '["math"]',
        createdAt: now,
        updatedAt: now,
        topicTitle: 'My Topic',
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
      };

      const item = mapChunkRowToLearningItem(row);
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
        prerequisitesJson: null,
        tagsJson: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        topicTitle: null,
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
      };

      const item = mapChunkRowToLearningItem(row);
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
        prerequisitesJson: null,
        tagsJson: null,
        createdAt: now,
        updatedAt: now,
        topicTitle: null,
        content: 'My content',
        contentVersion: 2,
        contentUpdatedAt: now,
      };

      const item = mapChunkRowToLearningItem(row, { includeContent: true });
      expect(item.content).toBe('My content');
      expect(item.contentVersion).toBe(2);
    });
  });

  describe('listChunksAsLearningItems', () => {
    it('returns empty array when no chunks exist', async () => {
      const items = await listChunksAsLearningItems();
      expect(items).toEqual([]);
    });

    it('returns learning items from database', async () => {
      seedData();
      const items = await listChunksAsLearningItems();
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('Chunk One');
    });

    it('filters by subject', async () => {
      seedData();
      const mathItems = await listChunksAsLearningItems({ subject: 'Math' });
      expect(mathItems.length).toBe(1);

      const scienceItems = await listChunksAsLearningItems({ subject: 'Science' });
      expect(scienceItems.length).toBe(0);
    });
  });

  describe('batchFetchChunksMinimal', () => {
    it('returns empty array when no chunks exist', async () => {
      const chunks = await batchFetchChunksMinimal();
      expect(chunks).toEqual([]);
    });

    it('returns minimal metadata', async () => {
      seedData();
      const chunks = await batchFetchChunksMinimal();
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toHaveProperty('id');
      expect(chunks[0]).toHaveProperty('title');
      expect(chunks[0]).toHaveProperty('difficulty');
    });
  });
});
