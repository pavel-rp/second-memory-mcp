import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerQueryTools } from '../../../src/server/query-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseResult(out: any): any {
  return JSON.parse(out?.content?.[0]?.text);
}

describe('query-tools', () => {
  let server: CaptureServer;
  const now = Date.now();

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerQueryTools(server as any, createAppContext());
  });
  afterAll(teardownTestDb);

  it('registers all 3 query tools', () => {
    expect(server.tools.has('list_learning_items')).toBe(true);
    expect(server.tools.has('batch_fetch_topics_minimal')).toBe(true);
    expect(server.tools.has('batch_fetch_chunks_minimal')).toBe(true);
  });

  async function seedData() {
    const db = getSql();
    await db.insert(learningTopics).values([
      { id: 'topic-1', title: 'Algebra', subject: 'Math', createdAt: now, updatedAt: now },
      { id: 'topic-2', title: 'Physics', subject: 'Science', createdAt: now, updatedAt: now },
    ]);
    await db.insert(learningChunks).values([
      {
        id: 'chunk-1',
        topicId: 'topic-1',
        title: 'Equations',
        subject: 'Math',
        difficulty: 3,
        nextReviewAt: now - 1000,
        easeFactor: 2.5,
        repetitions: 1,
        estimatedDuration: 10,
        chunkType: 'review',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'chunk-2',
        topicId: 'topic-2',
        title: 'Forces',
        subject: 'Science',
        difficulty: 5,
        nextReviewAt: now + 86400000,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 15,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  describe('list_learning_items', () => {
    it('returns empty list when no items', async () => {
      const handler = server.tools.get('list_learning_items')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });

    it('returns all items when no filters', async () => {
      await seedData();
      const handler = server.tools.get('list_learning_items')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.length).toBe(2);
    });

    it('filters by subject', async () => {
      await seedData();
      const handler = server.tools.get('list_learning_items')!.handler;
      const result = await handler({ subjectFilter: 'Math' });
      const parsed = parseResult(result);
      expect(parsed.length).toBe(1);
      expect(parsed[0].subject).toBe('Math');
    });
  });

  describe('batch_fetch_topics_minimal', () => {
    it('returns empty list when no topics', async () => {
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.topics.length).toBe(0);
      expect(parsed.count).toBe(0);
    });

    it('returns all topics', async () => {
      await seedData();
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.count).toBe(2);
    });

    it('filters by subject', async () => {
      await seedData();
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;
      const result = await handler({ subjectFilter: 'Science' });
      const parsed = parseResult(result);
      expect(parsed.count).toBe(1);
      expect(parsed.topics[0].subject).toBe('Science');
    });

    it('message uses singular for 1 topic', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'solo',
        title: 'Solo',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.message).toBe('Retrieved 1 topic');
    });
  });

  describe('batch_fetch_chunks_minimal', () => {
    it('returns empty list with no workflowHint when no chunks', async () => {
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.count).toBe(0);
      expect(parsed.workflowHint).toBeUndefined();
    });

    it('returns chunks with workflowHint when chunks exist', async () => {
      await seedData();
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.count).toBe(2);
      expect(parsed.workflowHint).toBeDefined();
      expect(parsed.workflowHint.action).toBe('REQUIRED_FOR_RECALL');
      expect(parsed.workflowHint.chunkIds).toHaveLength(2);
    });

    it('filters by topicId', async () => {
      await seedData();
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;
      const result = await handler({ topicId: 'topic-1' });
      const parsed = parseResult(result);
      expect(parsed.count).toBe(1);
    });
  });
});
