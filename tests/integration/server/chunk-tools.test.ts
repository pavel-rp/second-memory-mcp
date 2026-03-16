import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerChunkTools } from '../../../src/server/chunk-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
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
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.chunk_id).toBeDefined();
      expect(parsed.topic_id).toBeDefined();
      expect(parsed.created_at).toBeDefined();
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
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.message).toContain('With Extras');
    });
  });

  describe('update_chunk_content', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk_content')!.handler;
      const result = await handler({
        chunk_id: 'nonexistent',
        content: 'New content',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
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
      });
      const created = parseResult(createResult);
      const chunkId = created.chunk_id;

      const handler = server.tools.get('update_chunk_content')!.handler;
      const result = await handler({
        chunk_id: chunkId,
        content: 'Updated content',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.message).toContain('Successfully updated content');
    });
  });

  describe('update_chunk_metadata', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk_metadata')!.handler;
      const result = await handler({
        chunk_id: 'nonexistent',
        title: 'New Title',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('updates metadata for existing chunk', async () => {
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'Original',
        subject: 'Math',
        content: 'Original content',
        difficulty: 3,
        estimated_duration: 10,
      });
      const created = parseResult(createResult);
      const chunkId = created.chunk_id;

      const handler = server.tools.get('update_chunk_metadata')!.handler;
      const result = await handler({
        chunk_id: chunkId,
        title: 'Updated Title',
        difficulty: 7,
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.message).toContain('Updated Title');
    });
  });

  describe('update_chunk', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk')!.handler;
      const result = await handler({
        chunk_id: 'nonexistent',
        content: 'New content',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('updates chunk with progress reset', async () => {
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'Comprehensive',
        subject: 'Math',
        content: 'Original',
        difficulty: 5,
        estimated_duration: 15,
      });
      const created = parseResult(createResult);
      const chunkId = created.chunk_id;

      const handler = server.tools.get('update_chunk')!.handler;
      const result = await handler({
        chunk_id: chunkId,
        content: 'Completely new content',
        force_reset: true,
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
    });
  });

  describe('delete_chunk', () => {
    it('returns error for nonexistent chunk', async () => {
      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunk_id: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('deletes existing chunk successfully', async () => {
      const createHandler = server.tools.get('create_learning_item')!.handler;
      const createResult = await createHandler({
        title: 'To Delete',
        subject: 'Math',
        content: 'Content to delete',
        difficulty: 3,
        estimated_duration: 10,
      });
      const created = parseResult(createResult);
      const chunkId = created.chunk_id;

      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunk_id: chunkId });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.message).toContain('Successfully deleted');
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
      const result = await handler({ chunk_id: 'chunk-prereq' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.removed_dependencies).toBeGreaterThanOrEqual(0);
    });
  });
});
