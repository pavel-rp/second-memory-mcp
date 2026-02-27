import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerContentTools } from '../../src/server/content-tools.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks } from '../../src/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseToolResult(out: any): any {
  const text = out?.content?.[0]?.text;
  try {
    return JSON.parse(text);
  } catch {
    return out;
  }
}

describe('Integration: list_items_with_content', () => {
  let server: CaptureServer;
  let tool: { spec: any; handler: Function };

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerContentTools(server as any);
    tool = server.tools.get('list_items_with_content')!;
    expect(tool).toBeDefined();
  });
  afterAll(teardownTestDb);

  it('should return items with content when includeContent is true', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Algorithm Fundamentals',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: `chunk-${now}`,
      topicId: uniqueId,
      title: 'Two Sum Problem',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewedAt: now,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: ['arrays'],
      tagsJson: ['leetcode'],
      content: 'This is the content for Two Sum problem',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await tool.handler({
      includeContent: true,
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].content).toBe('This is the content for Two Sum problem');
    expect(parsed.items[0].contentVersion).toBe(1);
    expect(parsed.items[0].contentUpdatedAt).toBe(now);
    expect(parsed.contentIncluded).toBe(true);
    expect(parsed.pagination.total).toBe(1);
    expect(parsed.pagination.hasMore).toBe(false);
  });

  it('should exclude content fields when includeContent is false', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Algorithm Fundamentals',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: `chunk-${now}`,
      topicId: uniqueId,
      title: 'Two Sum Problem',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewedAt: now,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: ['arrays'],
      tagsJson: ['leetcode'],
      content: 'This is the content for Two Sum problem',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await tool.handler({
      includeContent: false,
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].content).toBeUndefined();
    expect(parsed.items[0].contentVersion).toBeUndefined();
    expect(parsed.items[0].contentUpdatedAt).toBeUndefined();
    expect(parsed.items[0].title).toBe('Two Sum Problem');
    expect(parsed.contentIncluded).toBe(false);
  });

  it('should handle pagination correctly', async () => {
    const now = Date.now();
    const db = getSql();
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

    for (let i = 1; i <= 5; i++) {
      await db.insert(learningChunks).values({
        id: `chunk-${now}-${i}`,
        topicId: uniqueId,
        title: `Chunk ${i}`,
        subject: 'CS',
        difficulty: i,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 20,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        content: `Content for chunk ${i}`,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    const result1 = await tool.handler({
      includeContent: true,
      limit: 2,
      offset: 0,
    });

    const parsed1 = parseToolResult(result1);
    expect(parsed1.success).toBe(true);
    expect(parsed1.items).toHaveLength(2);
    expect(parsed1.pagination.total).toBe(5);
    expect(parsed1.pagination.hasMore).toBe(true);
    expect(parsed1.pagination.offset).toBe(0);
    expect(parsed1.pagination.limit).toBe(2);

    const result2 = await tool.handler({
      includeContent: true,
      limit: 2,
      offset: 2,
    });

    const parsed2 = parseToolResult(result2);
    expect(parsed2.success).toBe(true);
    expect(parsed2.items).toHaveLength(2);
    expect(parsed2.pagination.hasMore).toBe(true);
    expect(parsed2.pagination.offset).toBe(2);

    const result3 = await tool.handler({
      includeContent: true,
      limit: 2,
      offset: 4,
    });

    const parsed3 = parseToolResult(result3);
    expect(parsed3.success).toBe(true);
    expect(parsed3.items).toHaveLength(1);
    expect(parsed3.pagination.hasMore).toBe(false);
    expect(parsed3.pagination.offset).toBe(4);
  });

  it('should filter by subject correctly', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Subject Filter Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: `chunk-${now}-1`,
      topicId: uniqueId,
      title: 'CS Chunk',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: 'CS content',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: `chunk-${now}-2`,
      topicId: uniqueId,
      title: 'Math Chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: 'Math content',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await tool.handler({
      includeContent: true,
      subjectFilter: 'CS',
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].subject).toBe('CS');
    expect(parsed.items[0].title).toBe('CS Chunk');
    expect(parsed.items[0].content).toBe('CS content');
  });

  it('should handle dueOnly filter correctly', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Due Filter Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: `chunk-${now}-1`,
      topicId: uniqueId,
      title: 'Due Chunk',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now - 86400000,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: 'Due content',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: `chunk-${now}-2`,
      topicId: uniqueId,
      title: 'Not Due Chunk',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: 'Not due content',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await tool.handler({
      includeContent: true,
      dueOnly: true,
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].title).toBe('Due Chunk');
    expect(parsed.items[0].content).toBe('Due content');
  });

  it('should return empty results when no data exists', async () => {
    const result = await tool.handler({
      includeContent: true,
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.items).toHaveLength(0);
    expect(parsed.pagination.total).toBe(0);
  });
});
