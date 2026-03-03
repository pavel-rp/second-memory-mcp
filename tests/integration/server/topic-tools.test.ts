import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerTopicTools } from '../../../src/server/topic-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics } from '../../../src/infrastructure/db/schema.js';

import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('topic-tools', () => {
  let server: CaptureServer;
  const now = Date.now();

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerTopicTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  it('registers all 3 topic tools', () => {
    expect(server.tools.has('create_topic_with_chunks')).toBe(true);
    expect(server.tools.has('update_topic')).toBe(true);
    expect(server.tools.has('update_topic_summary')).toBe(true);
  });

  describe('create_topic_with_chunks', () => {
    it('creates topic with chunks successfully', async () => {
      const handler = server.tools.get('create_topic_with_chunks')!.handler;
      const result = await handler({
        topic_title: 'Algebra Basics',
        topic_description: 'Fundamental algebra concepts',
        subject: 'Math',
        chunks: [
          {
            id: 'c1',
            title: 'Variables',
            content: 'Learn about variables',
            difficulty: 2,
            estimated_duration: 10,
            order: 1,
          },
          {
            id: 'c2',
            title: 'Equations',
            content: 'Learn about equations',
            difficulty: 3,
            estimated_duration: 15,
            order: 2,
          },
        ],
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.topic).toBeDefined();
      expect(parsed.message).toContain('Algebra Basics');
    });
  });

  describe('update_topic', () => {
    it('updates topic title', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-1',
        title: 'Original',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });

      const handler = server.tools.get('update_topic')!.handler;
      const result = await handler({ topic_id: 'topic-1', title: 'Updated Title' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.topic.title).toBe('Updated Title');
    });

    it('returns error for nonexistent topic', async () => {
      const handler = server.tools.get('update_topic')!.handler;
      const result = await handler({ topic_id: 'nonexistent', title: 'Foo' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('rejects empty title via Zod validation', async () => {
      const handler = server.tools.get('update_topic')!.handler;
      await expect(handler({ topic_id: 'topic-v', title: '' })).rejects.toThrow();
    });
  });

  describe('update_topic_summary', () => {
    it('updates summary with versioning', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-s',
        title: 'Summary Test',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });

      const handler = server.tools.get('update_topic_summary')!.handler;
      const result = await handler({ topic_id: 'topic-s', summary: 'A great summary' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.topic.summary).toBe('A great summary');
      expect(parsed.topic.summaryVersion).toBe(2);
    });

    it('returns error for nonexistent topic', async () => {
      const handler = server.tools.get('update_topic_summary')!.handler;
      const result = await handler({ topic_id: 'nonexistent', summary: 'test' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('rejects empty summary via Zod validation', async () => {
      const handler = server.tools.get('update_topic_summary')!.handler;
      await expect(handler({ topic_id: 'topic-se', summary: '' })).rejects.toThrow();
    });
  });
});
