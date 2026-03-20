import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';

import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('Content Persistence', () => {
  let ctx: AppContext;
  let chunkRepo: DrizzleChunkRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    chunkRepo = new DrizzleChunkRepository(getSql());
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  describe('Chunk Content Persistence', () => {
    it('should persist chunk content during creation', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const content = 'This is test chunk content with examples and explanations.';
      const now = Date.now();

      const db = getSql();
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Testing',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await chunkRepo.create({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        content,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const [chunk] = await db.select().from(learningChunks).where(eq(learningChunks.id, chunkId));
      expect(chunk).toBeDefined();
      expect(chunk?.content).toBe(content);
      expect(chunk?.contentVersion).toBe(1);
      expect(chunk?.contentUpdatedAt).toBe(now);
    });

    it('should retrieve chunk content by ID', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const content = 'Test content for retrieval';
      const now = Date.now();

      const db = getSql();
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Testing',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(learningChunks).values({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 15,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        content,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const retrievedContent = await ctx.getChunkContent(chunkId);
      expect(retrievedContent).toBeDefined();
      expect(retrievedContent?.content).toBe(content);
      expect(retrievedContent?.contentVersion).toBe(1);
      expect(retrievedContent?.contentUpdatedAt).toBe(now);
    });

    it('should return null for non-existent chunk', async () => {
      const nonExistentId = crypto.randomUUID();
      const result = await ctx.getChunkContent(nonExistentId);
      expect(result).toBeNull();
    });

    it('should retrieve chunk with all content fields', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const content = 'Full chunk content with metadata';
      const now = Date.now();

      const db = getSql();
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Testing',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(learningChunks).values({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 15,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        content,
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const fullChunk = await ctx.getChunkWithContent(chunkId);
      expect(fullChunk).toBeDefined();
      expect(fullChunk?.content).toBe(content);
      expect(fullChunk?.contentVersion).toBe(1);
      expect(fullChunk?.title).toBe('Test Chunk');
      expect(fullChunk?.topicTitle).toBe('Test Topic');
    });
  });

  describe('Topic Summary Persistence', () => {
    it('should persist topic summary during creation', async () => {
      const summary =
        'This is a comprehensive topic summary explaining the key learning objectives.';
      const result = await ctx.createTopicWithChunks({
        topicTitle: 'Test Topic with Summary',
        topicDescription: 'A test topic',
        subject: 'Testing',
        topicSummary: summary,
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test chunk content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new' as const,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.topic?.topicSummary).toBe(summary);

      const db = getSql();
      const [topic] = await db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, result.topic!.topicId));
      expect(topic?.summary).toBe(summary);
      expect(topic?.summaryVersion).toBe(1);
      expect(topic?.summaryUpdatedAt).toBeTypeOf('number');
    });

    it('should always persist summary since topic_summary is required', async () => {
      const result = await ctx.createTopicWithChunks({
        topicTitle: 'Test Topic with Required Summary',
        topicDescription: 'A test topic',
        subject: 'Testing',
        topicSummary: 'Every topic must have a summary for embeddings',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test chunk content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new' as const,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.topic?.topicSummary).toBe('Every topic must have a summary for embeddings');

      const db = getSql();
      const [topic] = await db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, result.topic!.topicId));
      expect(topic?.summary).toBe('Every topic must have a summary for embeddings');
      expect(topic?.summaryVersion).toBe(1);
      expect(topic?.summaryUpdatedAt).toBeTypeOf('number');
    });
  });

  describe('Content Error Handling', () => {
    it('should handle chunk creation with null content gracefully', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();

      const db = getSql();
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Testing',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await chunkRepo.create({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        createdAt: now,
        updatedAt: now,
      });

      const [chunk] = await db.select().from(learningChunks).where(eq(learningChunks.id, chunkId));
      expect(chunk).toBeDefined();
      expect(chunk?.content).toBeNull();
      expect(chunk?.contentVersion).toBe(1);
      expect(chunk?.contentUpdatedAt).toBeNull();
    });

    it('should handle content retrieval for chunk without content', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();

      const db = getSql();
      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Testing',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(learningChunks).values({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 15,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const retrievedContent = await ctx.getChunkContent(chunkId);
      expect(retrievedContent).toBeDefined();
      expect(retrievedContent?.content).toBeNull();
      expect(retrievedContent?.contentVersion).toBeNull();
      expect(retrievedContent?.contentUpdatedAt).toBeNull();
    });
  });
});
