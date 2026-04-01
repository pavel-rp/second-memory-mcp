import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createAppContext, type AppContext } from '../../src/composition-root.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

function generateLargeContent(sizeInKB: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const charsPerKB = 1024;
  const totalChars = sizeInKB * charsPerKB;
  let content = '';

  for (let i = 0; i < totalChars; i++) {
    content += chars[Math.floor(Math.random() * chars.length)];
  }

  return content;
}

describe('Performance: Content Retrieval', () => {
  let ctx: AppContext;
  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  afterAll(teardownTestDb);

  it('should handle 10+ items with content efficiently', async () => {
    const now = Date.now();
    const db = getSql();
    const itemCount = 15;
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Performance Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 1; i <= itemCount; i++) {
      const content = generateLargeContent(1);
      await db.insert(learningChunks).values({
        id: `chunk-${now}-${i}`,
        topicId: uniqueId,
        title: `Performance Test Chunk ${i}`,
        subject: 'CS',
        difficulty: (i % 10) + 1,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 20,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: ['performance'],
        content: content,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    const startTime = performance.now();
    const result = await ctx.listChunksWithContent({ includeContent: true });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(result.items).toHaveLength(itemCount);
    expect(result.pagination.total).toBe(itemCount);
    expect(result.pagination.has_more).toBe(false);

    for (const item of result.items) {
      expect(item.content).toBeDefined();
      expect(item.contentVersion).toBe(1);
      expect(item.contentUpdatedAt).toBe(new Date(now).toISOString());
    }

    expect(responseTime).toBeLessThan(1000);

    console.log(`Retrieved ${itemCount} items with content in ${responseTime.toFixed(2)}ms`);
  });

  it('should handle large content efficiently', async () => {
    const now = Date.now();
    const db = getSql();
    const itemCount = 5;
    const contentSizeKB = 10;
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Large Content Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 1; i <= itemCount; i++) {
      const content = generateLargeContent(contentSizeKB);
      await db.insert(learningChunks).values({
        id: `chunk-${now}-${i}`,
        topicId: uniqueId,
        title: `Large Content Chunk ${i}`,
        subject: 'CS',
        difficulty: (i % 10) + 1,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 20,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: ['large-content'],
        content: content,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    const startTime = performance.now();
    const result = await ctx.listChunksWithContent({ includeContent: true });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(result.items).toHaveLength(itemCount);
    expect(result.pagination.total).toBe(itemCount);

    for (const item of result.items) {
      expect(item.content).toBeDefined();
      expect(item.content!.length).toBeGreaterThan(contentSizeKB * 1024 * 0.9);
    }

    expect(responseTime).toBeLessThan(2000);

    console.log(
      `Retrieved ${itemCount} items with ${contentSizeKB}KB content each in ${responseTime.toFixed(2)}ms`
    );
  });

  it('should handle pagination efficiently with large datasets', async () => {
    const now = Date.now();
    const db = getSql();
    const totalItems = 50;
    const pageSize = 10;
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Pagination Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 1; i <= totalItems; i++) {
      const content = generateLargeContent(0.5);
      await db.insert(learningChunks).values({
        id: `chunk-${now}-${i}`,
        topicId: uniqueId,
        title: `Pagination Test Chunk ${i}`,
        subject: 'CS',
        difficulty: (i % 10) + 1,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 20,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: ['pagination'],
        content: content,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    const startTime = performance.now();

    const page1 = await ctx.listChunksWithContent({
      includeContent: true,
      limit: pageSize,
      offset: 0,
    });

    const page3 = await ctx.listChunksWithContent({
      includeContent: true,
      limit: pageSize,
      offset: pageSize * 2,
    });

    const lastPage = await ctx.listChunksWithContent({
      includeContent: true,
      limit: pageSize,
      offset: pageSize * 4,
    });

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(page1.items).toHaveLength(pageSize);
    expect(page1.pagination.total).toBe(totalItems);
    expect(page1.pagination.has_more).toBe(true);
    expect(page1.pagination.offset).toBe(0);

    expect(page3.items).toHaveLength(pageSize);
    expect(page3.pagination.has_more).toBe(true);
    expect(page3.pagination.offset).toBe(pageSize * 2);

    expect(lastPage.items).toHaveLength(pageSize);
    expect(lastPage.pagination.has_more).toBe(false);
    expect(lastPage.pagination.offset).toBe(pageSize * 4);

    expect(totalTime).toBeLessThan(1500);

    console.log(`Pagination test with ${totalItems} items completed in ${totalTime.toFixed(2)}ms`);
  });

  it('should handle mixed content scenarios efficiently', async () => {
    const now = Date.now();
    const db = getSql();
    const itemCount = 20;
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Mixed Content Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 1; i <= itemCount; i++) {
      const hasContent = i % 3 !== 0;
      const content = hasContent ? generateLargeContent(2) : null;
      const contentVersion = hasContent ? 1 : null;
      const contentUpdatedAt = hasContent ? now : null;

      await db.insert(learningChunks).values({
        id: `chunk-${now}-${i}`,
        topicId: uniqueId,
        title: `Mixed Content Chunk ${i}`,
        subject: 'CS',
        difficulty: (i % 10) + 1,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 20,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: ['mixed'],
        content: content,
        contentVersion: contentVersion,
        contentUpdatedAt: contentUpdatedAt,
        createdAt: now,
        updatedAt: now,
      });
    }

    const startTime = performance.now();
    const result = await ctx.listChunksWithContent({ includeContent: true });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(result.items).toHaveLength(itemCount);
    expect(result.pagination.total).toBe(itemCount);

    let itemsWithContent = 0;
    let itemsWithoutContent = 0;

    for (const item of result.items) {
      if (item.content) {
        itemsWithContent++;
        expect(item.contentVersion).toBeDefined();
        expect(item.contentUpdatedAt).toBeDefined();
      } else {
        itemsWithoutContent++;
        expect(item.contentVersion).toBeUndefined();
        expect(item.contentUpdatedAt).toBeUndefined();
      }
    }

    expect(itemsWithContent).toBeGreaterThan(0);
    expect(itemsWithoutContent).toBeGreaterThan(0);

    expect(responseTime).toBeLessThan(1000);

    console.log(
      `Mixed content test with ${itemCount} items (${itemsWithContent} with content, ${itemsWithoutContent} without) completed in ${responseTime.toFixed(2)}ms`
    );
  });
});
