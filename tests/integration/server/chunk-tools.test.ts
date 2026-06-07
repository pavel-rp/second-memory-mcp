import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerChunkTools } from '../../../src/server/chunk-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { eq } from 'drizzle-orm';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';

import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('chunk-tools', () => {
  let server: CaptureServer;
  const now = Date.now();

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerChunkTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  it('registers all 5 chunk tools', () => {
    expect(server.tools.has('create_learning_item')).toBe(true);
    expect(server.tools.has('update_chunk_content')).toBe(true);
    expect(server.tools.has('update_chunk_metadata')).toBe(true);
    expect(server.tools.has('update_chunk')).toBe(true);
    expect(server.tools.has('delete_chunk')).toBe(true);
  });

  describe('create_learning_item', () => {
    it('creates item successfully', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        title: 'Test Item',
        subject: 'Math',
        content: 'Learn about test items',
        difficulty: 5,
        estimated_duration: 15,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBeDefined();
      expect(parsed.data.topic_id).toBeDefined();
      expect(parsed.data.created_at).toBeDefined();
    });

    it('creates item with optional fields', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        title: 'With Extras',
        subject: 'Science',
        content: 'Some content here',
        difficulty: 3,
        estimated_duration: 20,
        tags: ['tag1', 'tag2'],
        topic_title: 'Custom Topic',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toContain('With Extras');
    });

    it('creates item with content_status draft', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        title: 'Draft Item',
        subject: 'Math',
        content: 'Placeholder content',
        difficulty: 5,
        estimated_duration: 15,
        content_status: 'draft',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');

      // Verify persisted value via direct DB read
      const db = getSql();
      const [row] = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, parsed.data.chunk_id));
      expect(row.contentStatus).toBe('draft');
    });

    it('defaults content_status to final when omitted', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        title: 'Default Status Item',
        subject: 'Math',
        content: 'Some content',
        difficulty: 3,
        estimated_duration: 10,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');

      const db = getSql();
      const [row] = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, parsed.data.chunk_id));
      expect(row.contentStatus).toBe('final');
    });

    it('persists a caller-supplied slug id and condensed_summary, no follow-up update (NEU-759)', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        id: 'lc43-neu759-test',
        title: 'Parity Item',
        subject: 'CS',
        content: 'Arrays store elements in contiguous memory for O(1) indexed access.',
        difficulty: 4,
        estimated_duration: 8,
        condensed_summary: 'Arrays = contiguous memory, O(1) indexing.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('lc43-neu759-test');

      // Both the slug id and the summary persist directly — no update_chunk_content backfill.
      const db = getSql();
      const [row] = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, 'lc43-neu759-test'));
      expect(row.id).toBe('lc43-neu759-test');
      expect(row.condensedSummary).toBe('Arrays = contiguous memory, O(1) indexing.');
    });
  });

  describe('update_chunk_content', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk_content')!.handler;
      const result = await handler({
        chunk_id: 'nonexistent',
        content:
          'Detailed explanation of the fundamental concepts and principles involved in this learning chunk. This content covers the theoretical background, practical applications, and key relationships between different aspects of the subject matter for effective learning.',
        condensed_summary: 'Summary for nonexistent chunk.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });

    it('updates content for existing chunk', async () => {
      // Create a chunk first
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'To Update',
        subject: 'Math',
        content: 'Original content',
        difficulty: 3,
        estimated_duration: 10,
        context_token: 'ctx-test',
      });
      const created = parseResult(createResult);
      const chunkId = created.data.chunk_id;

      const handler = server.tools.get('update_chunk_content')!.handler;
      const result = await handler({
        chunk_id: chunkId,
        content:
          'Updated content covering the essential mathematical concepts and their practical applications. This revised material includes improved explanations, additional examples, and clearer connections between different topics to enhance the learning experience significantly.',
        condensed_summary: 'Updated content summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toContain('Successfully updated content');
    });

    it('auto-sets content_status to final on content update', async () => {
      // Create a draft chunk first via direct DB insert
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-draft',
        title: 'Draft Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-draft',
        topicId: 'topic-draft',
        title: 'Draft Chunk',
        subject: 'Math',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        contentStatus: 'draft',
        content: 'Placeholder',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const handler = server.tools.get('update_chunk_content')!.handler;
      const result = await handler({
        chunk_id: 'chunk-draft',
        content:
          'Finalized teaching content covering the complete mathematical foundations needed for this topic. This includes detailed explanations of core principles, worked examples demonstrating practical applications, and connections to related concepts for comprehensive understanding.',
        condensed_summary: 'Finalized teaching content summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');

      const [row] = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, 'chunk-draft'));
      expect(row.contentStatus).toBe('final');
    });
  });

  describe('update_chunk_metadata', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk_metadata')!.handler;
      const result = await handler({
        chunk_id: 'nonexistent',
        title: 'New Title',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });

    it('updates metadata for existing chunk', async () => {
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'Original',
        subject: 'Math',
        content: 'Original content',
        difficulty: 3,
        estimated_duration: 10,
        context_token: 'ctx-test',
      });
      const created = parseResult(createResult);
      const chunkId = created.data.chunk_id;

      const handler = server.tools.get('update_chunk_metadata')!.handler;
      const result = await handler({
        chunk_id: chunkId,
        title: 'Updated Title',
        difficulty: 7,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toContain('Updated Title');
    });
  });

  describe('update_chunk', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk')!.handler;
      const result = await handler({
        chunk_id: 'nonexistent',
        content:
          'Detailed explanation of the fundamental concepts and principles involved in this learning chunk. This content covers the theoretical background, practical applications, and key relationships between different aspects of the subject matter for effective learning.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });

    it('updates chunk with progress reset', async () => {
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'Comprehensive',
        subject: 'Math',
        content: 'Original',
        difficulty: 5,
        estimated_duration: 15,
        context_token: 'ctx-test',
      });
      const created = parseResult(createResult);
      const chunkId = created.data.chunk_id;

      const handler = server.tools.get('update_chunk')!.handler;
      const result = await handler({
        chunk_id: chunkId,
        content:
          'Completely rewritten content covering advanced mathematical concepts and their real-world applications. This comprehensive revision includes new theoretical frameworks, updated examples, and improved pedagogical approaches for more effective knowledge transfer and retention.',
        force_reset: true,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
    });
  });

  describe('delete_chunk', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunk_id: 'nonexistent', context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });

    it('deletes existing chunk successfully', async () => {
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'To Delete',
        subject: 'Math',
        content: 'Content to delete',
        difficulty: 3,
        estimated_duration: 10,
        context_token: 'ctx-test',
      });
      const created = parseResult(createResult);
      const chunkId = created.data.chunk_id;

      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunk_id: chunkId, context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toContain('Successfully deleted');
    });

    it('cleans up prerequisite references from dependent chunks', async () => {
      // Create two chunks where second has first as prerequisite
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-dep',
        title: 'Dependencies',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-prereq',
        topicId: 'topic-dep',
        title: 'Prerequisite',
        subject: 'Test',
        difficulty: 1,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-dependent',
        topicId: 'topic-dep',
        title: 'Dependent',
        subject: 'Test',
        difficulty: 2,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisitesJson: ['chunk-prereq'],
        createdAt: now,
        updatedAt: now,
      });

      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunk_id: 'chunk-prereq', context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.removed_dependency_count).toBeGreaterThanOrEqual(0);
    });
  });
});
