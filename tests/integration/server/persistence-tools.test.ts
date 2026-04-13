import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerPersistenceTools } from '../../../src/server/persistence-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import crypto from 'node:crypto';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('persistence-tools', () => {
  let server: CaptureServer;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerPersistenceTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  it('registers all persistence tools', () => {
    expect(server.tools.has('list_learning_items')).toBe(true);
    expect(server.tools.has('create_topic_with_chunks')).toBe(true);
    expect(server.tools.has('create_learning_item')).toBe(true);
    expect(server.tools.has('update_chunk_content')).toBe(true);
    expect(server.tools.has('update_chunk_metadata')).toBe(true);
    expect(server.tools.has('update_chunk')).toBe(true);
    expect(server.tools.has('delete_chunk')).toBe(true);
    expect(server.tools.has('update_topic')).toBe(true);
    expect(server.tools.has('update_topic_summary')).toBe(true);
    expect(server.tools.has('batch_fetch_topics_minimal')).toBe(true);
    expect(server.tools.has('batch_fetch_chunks_minimal')).toBe(true);
  });

  describe('list_learning_items', () => {
    it('returns empty list when no items exist', async () => {
      const handler = server.tools.get('list_learning_items')!.handler;
      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data.length).toBe(0);
    });
  });

  describe('create_learning_item', () => {
    it('creates a learning item successfully', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        title: 'Test Item',
        subject: 'Math',
        difficulty: 5,
        estimated_duration: 15,
        content: 'Test content here',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBeDefined();
      expect(parsed.data.topic_id).toBeDefined();
      expect(parsed.data.created_at).toBeDefined();
    });
  });

  describe('create_topic_with_chunks', () => {
    it('creates a topic with chunks', async () => {
      const handler = server.tools.get('create_topic_with_chunks')!.handler;
      const result = await handler({
        topic_title: 'Test Topic',
        topic_description: 'A test topic',
        subject: 'Science',
        topic_summary: 'Science topic summary for integration test',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Chunk 1',
            content:
              'Detailed explanation of the first fundamental science concept covered in this topic. This chunk provides the theoretical background and practical applications needed to build a solid foundation for understanding more advanced material in later chunks.',
            difficulty: 3,
            estimated_duration: 10,
            order: 1,
            condensed_summary: 'Key takeaway from chunk 1.',
          },
          {
            id: crypto.randomUUID(),
            title: 'Chunk 2',
            content:
              'Comprehensive coverage of the second science concept building on the foundations from chunk 1. This includes additional examples, connections to related concepts, and exercises to reinforce understanding. Mastery of this material is essential for progressing further.',
            difficulty: 4,
            estimated_duration: 10,
            order: 2,
            condensed_summary: 'Key takeaway from chunk 2.',
          },
        ],
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.topic_id).toBeDefined();
      expect(parsed.data.chunk_ids).toBeDefined();
      expect(parsed.data.created_at).toBeDefined();
    });
  });

  describe('batch_fetch_topics_minimal', () => {
    it('returns empty array when no topics exist', async () => {
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;
      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.topics).toEqual([]);
    });
  });

  describe('batch_fetch_chunks_minimal', () => {
    it('returns empty array when no chunks exist', async () => {
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;
      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunks).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('update_chunk_content returns toolError for nonexistent chunk', async () => {
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

    it('delete_chunk returns toolError for nonexistent chunk', async () => {
      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunk_id: 'nonexistent', context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });
  });
});
