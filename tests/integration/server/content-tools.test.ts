import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerContentTools } from '../../../src/server/content-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

describe('Integration: list_items_with_content', () => {
  let server: CaptureServer;
  let tool: { spec: any; handler: Function };

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerContentTools(server as any, createAppContext({ embedding: undefined }));
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
      include_content: true,
      context_token: 'ctx-test',
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.items).toHaveLength(1);
    expect(parsed.data.items[0].content).toBe('This is the content for Two Sum problem');
    expect(parsed.data.items[0].content_version).toBe(1);
    expect(parsed.data.items[0].content_updated_at).toBe(new Date(now).toISOString());
    expect(parsed.data.content_included).toBe(true);
    expect(parsed.data.pagination.total).toBe(1);
    expect(parsed.data.pagination.has_more).toBe(false);
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
      include_content: false,
      context_token: 'ctx-test',
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.items).toHaveLength(1);
    expect(parsed.data.items[0].content).toBeUndefined();
    expect(parsed.data.items[0].content_version).toBeUndefined();
    expect(parsed.data.items[0].content_updated_at).toBeUndefined();
    expect(parsed.data.items[0].title).toBe('Two Sum Problem');
    expect(parsed.data.content_included).toBe(false);
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
      include_content: true,
      limit: 2,
      offset: 0,
      context_token: 'ctx-test',
    });

    const parsed1 = parseToolResult(result1);
    expect(parsed1.status).toBe('ok');
    expect(parsed1.data.items).toHaveLength(2);
    expect(parsed1.data.pagination.total).toBe(5);
    expect(parsed1.data.pagination.has_more).toBe(true);
    expect(parsed1.data.pagination.offset).toBe(0);
    expect(parsed1.data.pagination.limit).toBe(2);

    const result2 = await tool.handler({
      include_content: true,
      limit: 2,
      offset: 2,
      context_token: 'ctx-test',
    });

    const parsed2 = parseToolResult(result2);
    expect(parsed2.status).toBe('ok');
    expect(parsed2.data.items).toHaveLength(2);
    expect(parsed2.data.pagination.has_more).toBe(true);
    expect(parsed2.data.pagination.offset).toBe(2);

    const result3 = await tool.handler({
      include_content: true,
      limit: 2,
      offset: 4,
      context_token: 'ctx-test',
    });

    const parsed3 = parseToolResult(result3);
    expect(parsed3.status).toBe('ok');
    expect(parsed3.data.items).toHaveLength(1);
    expect(parsed3.data.pagination.has_more).toBe(false);
    expect(parsed3.data.pagination.offset).toBe(4);
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
      include_content: true,
      subject_filter: 'CS',
      context_token: 'ctx-test',
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.items).toHaveLength(1);
    expect(parsed.data.items[0].subject).toBe('CS');
    expect(parsed.data.items[0].title).toBe('CS Chunk');
    expect(parsed.data.items[0].content).toBe('CS content');
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
      include_content: true,
      due_only: true,
      context_token: 'ctx-test',
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.items).toHaveLength(1);
    expect(parsed.data.items[0].title).toBe('Due Chunk');
    expect(parsed.data.items[0].content).toBe('Due content');
  });

  it('should return empty results when no data exists', async () => {
    const result = await tool.handler({
      include_content: true,
      context_token: 'ctx-test',
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.items).toHaveLength(0);
    expect(parsed.data.pagination.total).toBe(0);
  });
});

describe('Integration: get_chunk_content', () => {
  let server: CaptureServer;
  let handler: Function;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerContentTools(server as any, createAppContext({ embedding: undefined }));
    handler = server.tools.get('get_chunk_content')!.handler;
  });
  afterAll(teardownTestDb);

  async function insertChunk(id: string, condensedSummary: string | null): Promise<void> {
    const now = Date.now();
    const db = getSql();
    const topicId = `topic-${id}`;
    await db.insert(learningTopics).values({
      id: topicId,
      title: `Topic ${id}`,
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(learningChunks).values({
      id,
      topicId,
      title: `Chunk ${id}`,
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      estimatedDuration: 10,
      chunkType: 'new',
      content: 'Body',
      contentVersion: 1,
      contentUpdatedAt: now,
      condensedSummary,
      createdAt: now,
      updatedAt: now,
    });
  }

  it('returns condensed_summary when the chunk has one (NEU-772)', async () => {
    await insertChunk('lc772-with-summary', 'TCP uses a three-way handshake.');
    const result = await handler({ chunk_id: 'lc772-with-summary', context_token: 'ctx-test' });
    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.condensed_summary).toBe('TCP uses a three-way handshake.');
  });

  it('returns condensed_summary: null when the chunk has none (NEU-772)', async () => {
    await insertChunk('lc772-no-summary', null);
    const result = await handler({ chunk_id: 'lc772-no-summary', context_token: 'ctx-test' });
    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('ok');
    expect(parsed.data.condensed_summary).toBeNull();
  });
});
