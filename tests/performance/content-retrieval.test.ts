import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listChunksWithContent } from '../../src/services/chunk-queries.js';
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
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase(); // Reset singleton to pick up new path
    ensureSchema();
  });

  afterEach(async () => {
    await resetDatabase(); // Close database connection
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
    if (fs.existsSync(`${dbFile}-shm`)) {
      fs.unlinkSync(`${dbFile}-shm`);
    }
    if (fs.existsSync(`${dbFile}-wal`)) {
      fs.unlinkSync(`${dbFile}-wal`);
    }
  });

  it('should handle 10+ items with content efficiently', async () => {
    const now = Date.now();
    const db = getSql();
    const itemCount = 15;
    const uniqueId = `topic-${now}-${Math.random()}`;

    // Create a topic first
    db.insert(learningTopics)
      .values({
        id: uniqueId,
        title: 'Performance Test Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Create multiple chunks with content
    for (let i = 1; i <= itemCount; i++) {
      const content = generateLargeContent(1); // 1KB content per item
      db.insert(learningChunks)
        .values({
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
          prerequisitesJson: JSON.stringify([]),
          tagsJson: JSON.stringify(['performance']),
          content: content,
          contentVersion: 1,
          contentUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    const startTime = performance.now();
    const result = await listChunksWithContent({ includeContent: true });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(result.items).toHaveLength(itemCount);
    expect(result.pagination.total).toBe(itemCount);
    expect(result.pagination.hasMore).toBe(false);

    // Verify all items have content
    for (const item of result.items) {
      expect(item.content).toBeDefined();
      expect(item.contentVersion).toBe(1);
      expect(item.contentUpdatedAt).toBe(now);
    }

    // Performance assertion: should complete within reasonable time
    // For 15 items with 1KB content each, should be well under 1 second
    expect(responseTime).toBeLessThan(1000); // 1 second

    console.log(`Retrieved ${itemCount} items with content in ${responseTime.toFixed(2)}ms`);
  });

  it('should handle large content efficiently', async () => {
    const now = Date.now();
    const db = getSql();
    const itemCount = 5;
    const contentSizeKB = 10; // 10KB per item
    const uniqueId = `topic-${now}-${Math.random()}`;

    // Create a topic first
    db.insert(learningTopics)
      .values({
        id: uniqueId,
        title: 'Large Content Test Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Create chunks with large content
    for (let i = 1; i <= itemCount; i++) {
      const content = generateLargeContent(contentSizeKB);
      db.insert(learningChunks)
        .values({
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
          prerequisitesJson: JSON.stringify([]),
          tagsJson: JSON.stringify(['large-content']),
          content: content,
          contentVersion: 1,
          contentUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    const startTime = performance.now();
    const result = await listChunksWithContent({ includeContent: true });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(result.items).toHaveLength(itemCount);
    expect(result.pagination.total).toBe(itemCount);

    // Verify content size
    for (const item of result.items) {
      expect(item.content).toBeDefined();
      expect(item.content!.length).toBeGreaterThan(contentSizeKB * 1024 * 0.9); // Allow some variance
    }

    // Performance assertion: should handle large content efficiently
    expect(responseTime).toBeLessThan(2000); // 2 seconds for 50KB total content

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

    // Create a topic first
    db.insert(learningTopics)
      .values({
        id: uniqueId,
        title: 'Pagination Test Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Create many chunks
    for (let i = 1; i <= totalItems; i++) {
      const content = generateLargeContent(0.5); // 0.5KB content per item
      db.insert(learningChunks)
        .values({
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
          prerequisitesJson: JSON.stringify([]),
          tagsJson: JSON.stringify(['pagination']),
          content: content,
          contentVersion: 1,
          contentUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    // Test pagination performance
    const startTime = performance.now();

    // Test first page
    const page1 = await listChunksWithContent({
      includeContent: true,
      limit: pageSize,
      offset: 0,
    });

    // Test middle page
    const page3 = await listChunksWithContent({
      includeContent: true,
      limit: pageSize,
      offset: pageSize * 2,
    });

    // Test last page
    const lastPage = await listChunksWithContent({
      includeContent: true,
      limit: pageSize,
      offset: pageSize * 4,
    });

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Verify pagination results
    expect(page1.items).toHaveLength(pageSize);
    expect(page1.pagination.total).toBe(totalItems);
    expect(page1.pagination.hasMore).toBe(true);
    expect(page1.pagination.offset).toBe(0);

    expect(page3.items).toHaveLength(pageSize);
    expect(page3.pagination.hasMore).toBe(true);
    expect(page3.pagination.offset).toBe(pageSize * 2);

    expect(lastPage.items).toHaveLength(pageSize);
    expect(lastPage.pagination.hasMore).toBe(false);
    expect(lastPage.pagination.offset).toBe(pageSize * 4);

    // Performance assertion: pagination should be efficient
    expect(totalTime).toBeLessThan(1500); // 1.5 seconds for 3 paginated queries

    console.log(`Pagination test with ${totalItems} items completed in ${totalTime.toFixed(2)}ms`);
  });

  it('should handle mixed content scenarios efficiently', async () => {
    const now = Date.now();
    const db = getSql();
    const itemCount = 20;
    const uniqueId = `topic-${now}-${Math.random()}`;

    // Create a topic first
    db.insert(learningTopics)
      .values({
        id: uniqueId,
        title: 'Mixed Content Test Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Create chunks with mixed content scenarios
    for (let i = 1; i <= itemCount; i++) {
      const hasContent = i % 3 !== 0; // Every 3rd item has no content
      const content = hasContent ? generateLargeContent(2) : null;
      const contentVersion = hasContent ? 1 : null;
      const contentUpdatedAt = hasContent ? now : null;

      db.insert(learningChunks)
        .values({
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
          prerequisitesJson: JSON.stringify([]),
          tagsJson: JSON.stringify(['mixed']),
          content: content,
          contentVersion: contentVersion,
          contentUpdatedAt: contentUpdatedAt,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    const startTime = performance.now();
    const result = await listChunksWithContent({ includeContent: true });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(result.items).toHaveLength(itemCount);
    expect(result.pagination.total).toBe(itemCount);

    // Verify mixed content handling
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

    // Performance assertion: should handle mixed scenarios efficiently
    expect(responseTime).toBeLessThan(1000); // 1 second

    console.log(
      `Mixed content test with ${itemCount} items (${itemsWithContent} with content, ${itemsWithoutContent} without) completed in ${responseTime.toFixed(2)}ms`
    );
  });
});
