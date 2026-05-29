import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';

import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { LearningItemSchema } from '../../../src/domain/types/recommendations.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('chunks service', () => {
  let ctx: AppContext;
  let chunkRepo: DrizzleChunkRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    chunkRepo = new DrizzleChunkRepository(getSql());
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function insertChunkDirect(input: {
    id: string;
    topicId: string;
    title: string;
    subject: string;
    difficulty: number;
    nextReviewAt: number;
    easeFactor: number;
    repetitions: number;
    lastReviewedAt?: number | null;
    estimatedDuration: number;
    chunkType: string;
    prerequisites?: string[];
    tags?: string[];
    content?: string | null;
    contentVersion?: number | null;
    contentUpdatedAt?: number | null;
    createdAt: number;
    updatedAt: number;
  }) {
    const db = getSql();
    await db.insert(learningChunks).values({
      id: input.id,
      topicId: input.topicId,
      title: input.title,
      subject: input.subject,
      difficulty: input.difficulty,
      nextReviewAt: input.nextReviewAt,
      easeFactor: input.easeFactor,
      repetitions: input.repetitions,
      lastReviewedAt: input.lastReviewedAt ?? null,
      estimatedDuration: input.estimatedDuration,
      chunkType: input.chunkType,
      prerequisitesJson: input.prerequisites ?? null,
      tagsJson: input.tags ?? null,
      content: input.content ?? null,
      contentVersion: input.contentVersion ?? null,
      contentUpdatedAt: input.contentUpdatedAt ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  it('creates and lists chunks, maps to LearningItem', async () => {
    const now = Date.now();
    const db = getSql();

    // Create a topic first
    await db.insert(learningTopics).values({
      id: 't1',
      title: 'Algorithm Fundamentals',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await insertChunkDirect({
      id: 'c1',
      topicId: 't1',
      title: 'Two Sum',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewedAt: now,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisites: ['arrays'],
      tags: ['leetcode'],
      createdAt: now,
      updatedAt: now,
    });

    const rows = await chunkRepo.list({ subjectFilter: 'CS' });
    expect(rows.length).toBe(1);

    const items = await ctx.listChunksAsLearningItems({ subjectFilter: 'CS' });
    expect(items[0].title).toBe('Two Sum');
    expect(items[0].subject).toBe('CS');
    expect(items[0].chunkType).toBe('new');
  });

  it('includes topic information when topic exists', async () => {
    const now = Date.now();
    const db = getSql();

    await db.insert(learningTopics).values({
      id: 'topic-1',
      title: 'Algorithm Fundamentals',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await insertChunkDirect({
      id: 'chunk-1',
      topicId: 'topic-1',
      title: 'Two Sum Problem',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewedAt: now,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisites: ['arrays'],
      tags: ['leetcode'],
      createdAt: now,
      updatedAt: now,
    });

    const items = await ctx.listChunksAsLearningItems();
    expect(items).toHaveLength(1);
    expect(items[0].topicId).toBe('topic-1');
    expect(items[0].topicTitle).toBe('Algorithm Fundamentals');
  });

  it('handles orphaned chunks without topic', async () => {
    const now = Date.now();
    const db = getSql();

    await db.insert(learningTopics).values({
      id: 'orphan-topic',
      title: 'Orphan Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await insertChunkDirect({
      id: 'orphan-chunk',
      topicId: 'orphan-topic',
      title: 'Orphaned Chunk',
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 0,
      estimatedDuration: 15,
      chunkType: 'new',
      createdAt: now,
      updatedAt: now,
    });

    const items = await ctx.listChunksAsLearningItems();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('orphan-chunk');
    expect(items[0].topicId).toBe('orphan-topic');
    expect(items[0].topicTitle).toBe('Orphan Topic');
  });

  it('validates topic fields with Zod schema', async () => {
    const validItem = {
      id: 'test-chunk',
      title: 'Test Chunk',
      subject: 'CS',
      difficulty: 5,
      next_review_date: '2024-01-01T00:00:00.000Z',
      ease_factor: 2.5,
      repetitions: 1,
      estimated_duration: 20,
      chunk_type: 'new' as const,
      topic_id: 'topic-1',
      topic_title: 'Test Topic',
    };

    expect(() => LearningItemSchema.parse(validItem)).not.toThrow();

    const invalidItem = {
      ...validItem,
      topic_id: '',
    };

    expect(() => LearningItemSchema.parse(invalidItem)).toThrow();

    const itemWithoutTopic = {
      ...validItem,
      topic_id: undefined,
      topic_title: undefined,
    };

    expect(() => LearningItemSchema.parse(itemWithoutTopic)).not.toThrow();
  });

  it('deletes chunks and removes prerequisite references', async () => {
    const now = Date.now();
    const db = getSql();

    await db.insert(learningTopics).values({
      id: 'topic-alpha',
      title: 'Alpha Topic',
      subject: 'Math',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningTopics).values({
      id: 'topic-beta',
      title: 'Beta Topic',
      subject: 'Math',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await insertChunkDirect({
      id: 'chunk-a',
      topicId: 'topic-alpha',
      title: 'Chunk A',
      subject: 'Math',
      difficulty: 4,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 1,
      estimatedDuration: 10,
      chunkType: 'new',
      createdAt: now,
      updatedAt: now,
    });

    await insertChunkDirect({
      id: 'chunk-b',
      topicId: 'topic-alpha',
      title: 'Chunk B',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      estimatedDuration: 15,
      chunkType: 'new',
      prerequisites: ['chunk-a', 'chunk-c'],
      createdAt: now,
      updatedAt: now,
    });

    const deleteResult = await ctx.deleteChunk('chunk-a');
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.chunk?.id).toBe('chunk-a');
    expect(deleteResult.removedDependencies).toEqual([
      {
        chunkId: 'chunk-b',
        chunkTitle: 'Chunk B',
        removedPrerequisites: ['chunk-a'],
        previousPrerequisites: ['chunk-a', 'chunk-c'],
        remainingPrerequisites: ['chunk-c'],
      },
    ]);

    const remainingChunks = await chunkRepo.list();
    expect(remainingChunks.find(chunk => chunk.id === 'chunk-a')).toBeUndefined();
    const chunkB = remainingChunks.find(chunk => chunk.id === 'chunk-b');
    expect(chunkB).toBeDefined();
    if (!chunkB) {
      throw new Error('Expected chunk-b to remain after deleting chunk-a');
    }
    const updatedPrereqs = chunkB.prerequisitesJson ?? [];
    expect(updatedPrereqs).toEqual(['chunk-c']);
  });

  it('returns validation error when deleting unknown chunk', async () => {
    const result = await ctx.deleteChunk('missing-chunk-id');
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });

  it('updateChunkContent auto-sets contentStatus to final', async () => {
    const now = Date.now();
    const db = getSql();

    await db.insert(learningTopics).values({
      id: 'topic-status',
      title: 'Status Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await insertChunkDirect({
      id: 'chunk-status',
      topicId: 'topic-status',
      title: 'Draft Chunk',
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      estimatedDuration: 10,
      chunkType: 'new',
      content: 'Placeholder',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Manually set to draft via direct DB update
    const { eq } = await import('drizzle-orm');
    await db
      .update(learningChunks)
      .set({ contentStatus: 'draft' })
      .where(eq(learningChunks.id, 'chunk-status'));

    // Verify it's draft
    const [beforeRow] = await db
      .select()
      .from(learningChunks)
      .where(eq(learningChunks.id, 'chunk-status'));
    expect(beforeRow.contentStatus).toBe('draft');

    // Update content via workflow
    const result = await ctx.updateChunkContent('chunk-status', {
      content: 'Finalized content',
    });

    expect(result.success).toBe(true);

    // Verify auto-set to final
    const [afterRow] = await db
      .select()
      .from(learningChunks)
      .where(eq(learningChunks.id, 'chunk-status'));
    expect(afterRow.contentStatus).toBe('final');
  });

  it('batch fetches chunks with minimal metadata', async () => {
    const now = Date.now();
    const db = getSql();

    await db.insert(learningTopics).values({
      id: 't1',
      title: 'Topic 1',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningTopics).values({
      id: 't2',
      title: 'Topic 2',
      subject: 'Math',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    const chunks = [
      {
        id: 'c1',
        topicId: 't1',
        title: 'Array Basics',
        subject: 'CS',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new' as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'c2',
        topicId: 't1',
        title: 'Hash Tables',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 1,
        estimatedDuration: 20,
        chunkType: 'review' as const,
        createdAt: now + 1,
        updatedAt: now + 1,
      },
      {
        id: 'c3',
        topicId: 't2',
        title: 'Calculus',
        subject: 'Math',
        difficulty: 7,
        nextReviewAt: now + 172800000,
        easeFactor: 2.5,
        repetitions: 2,
        estimatedDuration: 30,
        chunkType: 'review' as const,
        createdAt: now + 2,
        updatedAt: now + 2,
      },
    ];

    for (const chunk of chunks) {
      await insertChunkDirect(chunk);
    }

    const allChunks = await ctx.batchFetchChunksMinimal();
    expect(allChunks.length).toBe(3);
    expect(allChunks[0]).toHaveProperty('id');
    expect(allChunks[0]).toHaveProperty('topicId');
    expect(allChunks[0]).toHaveProperty('title');
    expect(allChunks[0]).toHaveProperty('subject');
    expect(allChunks[0]).toHaveProperty('difficulty');
    expect(allChunks[0]).toHaveProperty('estimatedDuration');
    expect(allChunks[0]).toHaveProperty('chunkType');
    expect(allChunks[0]).toHaveProperty('nextReviewAt');
    expect(allChunks[0]).toHaveProperty('createdAt');
    expect(allChunks[0]).toHaveProperty('updatedAt');
    expect(allChunks[0]).not.toHaveProperty('content');
    expect(allChunks[0]).toHaveProperty('prerequisitesJson');
    expect(allChunks[0]).toHaveProperty('tagsJson');

    const topic1Chunks = await ctx.batchFetchChunksMinimal({ topicId: 't1' });
    expect(topic1Chunks.length).toBe(2);
    expect(topic1Chunks.every(c => c.topicId === 't1')).toBe(true);

    const csChunks = await ctx.batchFetchChunksMinimal({ subject: 'CS' });
    expect(csChunks.length).toBe(2);
    expect(csChunks.every(c => c.subject === 'CS')).toBe(true);

    const dueChunks = await ctx.batchFetchChunksMinimal({ dueOnly: true });
    expect(dueChunks.length).toBe(1);
    expect(dueChunks[0].id).toBe('c1');

    const limitedChunks = await ctx.batchFetchChunksMinimal({ limit: 2 });
    expect(limitedChunks.length).toBe(2);

    const filteredChunks = await ctx.batchFetchChunksMinimal({ subject: 'CS', limit: 1 });
    expect(filteredChunks.length).toBe(1);
    expect(filteredChunks[0].subject).toBe('CS');
  });
});

describe('Chunk Update Functions', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function insertChunkDirect(input: {
    id: string;
    topicId: string;
    title: string;
    subject: string;
    difficulty: number;
    nextReviewAt: number;
    easeFactor: number;
    repetitions: number;
    lastReviewedAt?: number | null;
    estimatedDuration: number;
    chunkType: string;
    prerequisites?: string[];
    tags?: string[];
    content?: string | null;
    contentVersion?: number | null;
    contentUpdatedAt?: number | null;
    createdAt: number;
    updatedAt: number;
  }) {
    const db = getSql();
    await db.insert(learningChunks).values({
      id: input.id,
      topicId: input.topicId,
      title: input.title,
      subject: input.subject,
      difficulty: input.difficulty,
      nextReviewAt: input.nextReviewAt,
      easeFactor: input.easeFactor,
      repetitions: input.repetitions,
      lastReviewedAt: input.lastReviewedAt ?? null,
      estimatedDuration: input.estimatedDuration,
      chunkType: input.chunkType,
      prerequisitesJson: input.prerequisites ?? null,
      tagsJson: input.tags ?? null,
      content: input.content ?? null,
      contentVersion: input.contentVersion ?? null,
      contentUpdatedAt: input.contentUpdatedAt ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  describe('updateChunkContent', () => {
    it('should update chunk content with versioning', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Test Subject',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 2,
        estimatedDuration: 15,
        chunkType: 'new',
        content: 'Original content',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkContent(chunkId, {
        content: 'Updated content',
      });

      expect(result.success).toBe(true);
      expect(result.chunk).toBeDefined();
      expect(result.chunk?.content).toBe('Updated content');
      expect(result.chunk?.contentVersion).toBe(2);
      expect(result.chunk?.contentUpdatedAt).toBeGreaterThanOrEqual(now);
      expect(result.progressReset).toBe(false);
    });

    it('should reset progress when requested', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Test Subject',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 3.0,
        repetitions: 5,
        lastReviewedAt: now - 3600000,
        estimatedDuration: 15,
        chunkType: 'review',
        content: 'Original content',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkContent(chunkId, {
        content: 'Updated content',
        resetProgress: true,
      });

      expect(result.success).toBe(true);
      expect(result.chunk).toBeDefined();
      expect(result.chunk?.repetitions).toBe(0);
      expect(result.chunk?.easeFactor).toBe(2.5);
      expect(result.chunk?.lastReviewedAt).toBeNull();
      expect(result.progressReset).toBe(true);
    });

    it('should return error for non-existent chunk', async () => {
      const result = await ctx.updateChunkContent('non-existent-id', {
        content: 'New content',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
      expect(result.error?.message).toContain('not found');
    });
  });

  describe('updateChunkMetadata', () => {
    it('should update chunk metadata fields', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Original Title',
        subject: 'Test Subject',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new',
        prerequisites: ['prereq1'],
        tags: ['tag1'],
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkMetadata(chunkId, {
        title: 'Updated Title',
        difficulty: 7,
        prerequisites: ['prereq1', 'prereq2'],
        tags: ['tag1', 'tag2', 'tag3'],
        estimatedDuration: 25,
      });

      expect(result.success).toBe(true);
      expect(result.chunk).toBeDefined();
      expect(result.chunk?.title).toBe('Updated Title');
      expect(result.chunk?.difficulty).toBe(7);
      expect(result.chunk?.estimatedDuration).toBe(25);
      expect(result.chunk?.updatedAt).toBeGreaterThan(now);
    });

    it('should handle partial updates', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Original Title',
        subject: 'Test Subject',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkMetadata(chunkId, {
        title: 'Updated Title Only',
      });

      expect(result.success).toBe(true);
      expect(result.chunk?.title).toBe('Updated Title Only');
      expect(result.chunk?.difficulty).toBe(3);
    });

    it('should return error for non-existent chunk', async () => {
      const result = await ctx.updateChunkMetadata('non-existent-id', {
        title: 'New Title',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('updateChunkWithProgressReset', () => {
    it('should automatically reset progress for significant content changes', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Test Subject',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 3.0,
        repetitions: 5,
        lastReviewedAt: now - 3600000,
        estimatedDuration: 15,
        chunkType: 'review',
        content: 'Short content',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const longContent =
        'This is a much longer content that represents a significant change from the original short content. '.repeat(
          10
        );

      const result = await ctx.updateChunkWithProgressReset(chunkId, {
        content: longContent,
      });

      expect(result.success).toBe(true);
      expect(result.progressReset).toBe(true);
      expect(result.chunk?.repetitions).toBe(0);
      expect(result.chunk?.easeFactor).toBe(2.5);
      expect(result.chunk?.lastReviewedAt).toBeNull();
    });

    it('should preserve progress for minor content changes', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Test Subject',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 3.0,
        repetitions: 5,
        lastReviewedAt: now - 3600000,
        estimatedDuration: 15,
        chunkType: 'review',
        content: 'Original content with some details',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkWithProgressReset(chunkId, {
        content: 'Original content with some details fixed',
      });

      expect(result.success).toBe(true);
      expect(result.progressReset).toBe(false);
      expect(result.chunk?.repetitions).toBe(5);
      expect(result.chunk?.easeFactor).toBe(3.0);
    });

    it('should reset progress for same-length but different content (issue fix)', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Test Subject',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 3.0,
        repetitions: 5,
        lastReviewedAt: now - 3600000,
        estimatedDuration: 15,
        chunkType: 'review',
        content: 'Learn about TypeScript basics',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkWithProgressReset(chunkId, {
        content: 'Study Python advanced topics',
      });

      expect(result.success).toBe(true);
      expect(result.progressReset).toBe(true);
      expect(result.chunk?.repetitions).toBe(0);
      expect(result.chunk?.easeFactor).toBe(2.5);
      expect(result.chunk?.lastReviewedAt).toBeNull();
    });

    it('should force reset when requested', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Test Chunk',
        subject: 'Test Subject',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 3.0,
        repetitions: 5,
        lastReviewedAt: now - 3600000,
        estimatedDuration: 15,
        chunkType: 'review',
        content: 'Original content',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkWithProgressReset(chunkId, {
        title: 'Updated Title',
        forceReset: true,
      });

      expect(result.success).toBe(true);
      expect(result.progressReset).toBe(true);
      expect(result.chunk?.repetitions).toBe(0);
      expect(result.chunk?.easeFactor).toBe(2.5);
    });

    it('should update multiple fields simultaneously', async () => {
      const chunkId = crypto.randomUUID();
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Test Subject',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertChunkDirect({
        id: chunkId,
        topicId,
        title: 'Original Title',
        subject: 'Test Subject',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new',
        content: 'Original content',
        prerequisites: ['prereq1'],
        tags: ['tag1'],
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.updateChunkWithProgressReset(chunkId, {
        content: 'Updated content',
        title: 'Updated Title',
        difficulty: 7,
        prerequisites: ['prereq1', 'prereq2'],
        tags: ['tag1', 'tag2'],
        estimatedDuration: 25,
      });

      expect(result.success).toBe(true);
      expect(result.chunk?.content).toBe('Updated content');
      expect(result.chunk?.title).toBe('Updated Title');
      expect(result.chunk?.difficulty).toBe(7);
      expect(result.chunk?.estimatedDuration).toBe(25);
      expect(result.chunk?.contentVersion).toBe(2);
    });

    it('should return error for non-existent chunk', async () => {
      const result = await ctx.updateChunkWithProgressReset('non-existent-id', {
        content: 'New content',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });
});

describe('Content Inclusion Functions', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  describe('mapChunkRowToLearningItem with includeContent', () => {
    it('should map chunk row with content fields', async () => {
      const now = Date.now();
      const mockRow = {
        id: 'test-chunk',
        topicId: 'test-topic',
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 1,
        consecutiveFailures: 0,
        lastReviewedAt: now,
        estimatedDuration: 20,
        intervalDays: null,
        chunkType: 'new',
        contentStatus: 'final' as const,
        condensedSummary: null,
        knowledgeType: null,
        prerequisitesJson: ['arrays'],
        tagsJson: ['test'],
        content: 'This is test content',
        contentVersion: 1,
        contentUpdatedAt: now,
        contentEmbedding: null,
        createdAt: now,
        updatedAt: now,
        topicTitle: 'Test Topic',
      };

      const result = ctx.mapChunkRowToLearningItem(mockRow, { includeContent: true }) as any;

      expect(result.id).toBe('test-chunk');
      expect(result.title).toBe('Test Chunk');
      expect(result.content).toBe('This is test content');
      expect(result.contentVersion).toBe(1);
      expect(result.contentUpdatedAt).toBe(new Date(now).toISOString());
      expect(result.prerequisites).toEqual(['arrays']);
      expect(result.tags).toEqual(['test']);
    });

    it('should handle null content fields gracefully', async () => {
      const now = Date.now();
      const mockRow = {
        id: 'test-chunk',
        topicId: 'test-topic',
        title: 'Test Chunk',
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 1,
        consecutiveFailures: 0,
        lastReviewedAt: now,
        estimatedDuration: 20,
        intervalDays: null,
        chunkType: 'new',
        contentStatus: 'final' as const,
        condensedSummary: null,
        knowledgeType: null,
        prerequisitesJson: [],
        tagsJson: [],
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        contentEmbedding: null,
        createdAt: now,
        updatedAt: now,
        topicTitle: 'Test Topic',
      };

      const result = ctx.mapChunkRowToLearningItem(mockRow, { includeContent: true }) as any;

      expect(result.id).toBe('test-chunk');
      expect(result.title).toBe('Test Chunk');
      expect(result.content).toBeUndefined();
      expect(result.contentVersion).toBeUndefined();
      expect(result.contentUpdatedAt).toBeUndefined();
      expect(result.topicId).toBe('test-topic');
      expect(result.topicTitle).toBe('Test Topic');
    });
  });

  describe('listChunksWithContent', () => {
    it('should include content fields when includeContent is true', async () => {
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

      const result = await ctx.listChunksWithContent({ includeContent: true });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].content).toBe('This is the content for Two Sum problem');
      expect(result.items[0].contentVersion).toBe(1);
      expect(result.items[0].contentUpdatedAt).toBe(new Date(now).toISOString());
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.has_more).toBe(false);
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

      const result = await ctx.listChunksWithContent({ includeContent: false });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].content).toBeUndefined();
      expect(result.items[0].contentVersion).toBeUndefined();
      expect(result.items[0].contentUpdatedAt).toBeUndefined();
      expect(result.items[0].title).toBe('Two Sum Problem');
      expect(result.pagination.total).toBe(1);
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

      const result1 = await ctx.listChunksWithContent({
        includeContent: true,
        limit: 2,
        offset: 0,
      });
      expect(result1.items).toHaveLength(2);
      expect(result1.pagination.total).toBe(5);
      expect(result1.pagination.has_more).toBe(true);
      expect(result1.pagination.offset).toBe(0);
      expect(result1.pagination.limit).toBe(2);

      const result2 = await ctx.listChunksWithContent({
        includeContent: true,
        limit: 2,
        offset: 2,
      });
      expect(result2.items).toHaveLength(2);
      expect(result2.pagination.has_more).toBe(true);
      expect(result2.pagination.offset).toBe(2);

      const result3 = await ctx.listChunksWithContent({
        includeContent: true,
        limit: 2,
        offset: 4,
      });
      expect(result3.items).toHaveLength(1);
      expect(result3.pagination.has_more).toBe(false);
      expect(result3.pagination.offset).toBe(4);
    });
  });
});
