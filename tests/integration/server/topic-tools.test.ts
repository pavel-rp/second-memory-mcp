import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerTopicTools } from '../../../src/server/topic-tools.js';
import { registerContentTools } from '../../../src/server/content-tools.js';
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
    const ctx = createAppContext({ embedding: undefined });
    registerTopicTools(server as any, ctx);
    registerContentTools(server as any, ctx);
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
        topic_summary: 'Introduction to fundamental algebra concepts',
        chunks: [
          {
            id: 'c1',
            title: 'Variables',
            content:
              'Variables are symbols that represent unknown or changeable values in mathematical expressions and equations. They form the foundation of algebra and allow us to express general relationships and patterns. Understanding variables is the first step toward solving equations.',
            difficulty: 2,
            estimated_duration: 10,
            order: 1,
            condensed_summary: 'Variables represent unknown values.',
          },
          {
            id: 'c2',
            title: 'Equations',
            content:
              'Equations are mathematical statements that assert the equality of two expressions connected by an equals sign. Solving equations involves finding the values of variables that make the statement true. This skill is fundamental to all areas of mathematics and science.',
            difficulty: 3,
            estimated_duration: 15,
            order: 2,
            condensed_summary: 'Equations express equality between expressions.',
          },
        ],
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.topic_id).toBeDefined();
      expect(parsed.data.chunk_ids).toBeDefined();
      expect(parsed.data.message).toContain('Algebra Basics');
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
      const result = await handler({
        topic_id: 'topic-1',
        title: 'Updated Title',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.topic_id).toBe('topic-1');
      expect(parsed.data.updated_at).toBeDefined();
    });

    it('returns error for nonexistent topic', async () => {
      const handler = server.tools.get('update_topic')!.handler;
      const result = await handler({
        topic_id: 'nonexistent',
        title: 'Foo',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });

    it('rejects empty title via Zod validation', async () => {
      const handler = server.tools.get('update_topic')!.handler;
      await expect(
        handler({ topic_id: 'topic-v', title: '', context_token: 'ctx-test' })
      ).rejects.toThrow();
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
      const result = await handler({
        topic_id: 'topic-s',
        summary: 'A great summary',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.topic_id).toBe('topic-s');
      expect(parsed.data.summary_version).toBe(2);
      expect(parsed.data.updated_at).toBeDefined();
    });

    it('returns error for nonexistent topic', async () => {
      const handler = server.tools.get('update_topic_summary')!.handler;
      const result = await handler({
        topic_id: 'nonexistent',
        summary: 'test',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });

    it('rejects empty summary via Zod validation', async () => {
      const handler = server.tools.get('update_topic_summary')!.handler;
      await expect(
        handler({ topic_id: 'topic-se', summary: '', context_token: 'ctx-test' })
      ).rejects.toThrow();
    });
  });

  describe('knowledge_type and dependency_graph_type round-trip', () => {
    it('persists and retrieves both fields', async () => {
      const createHandler = server.tools.get('create_topic_with_chunks')!.handler;
      const createResult = await createHandler({
        topic_title: 'Graph Theory',
        subject: 'Math',
        topic_summary: 'Introduction to graph theory concepts and algorithms',
        dependency_graph_type: 'convergent',
        chunks: [
          {
            id: 'gt-c1',
            title: 'Vertices and Edges',
            content:
              'A graph is composed of vertices (nodes) and edges (connections). Vertices represent entities while edges represent relationships between them. This fundamental model appears throughout computer science, mathematics, and network analysis.',
            difficulty: 2,
            estimated_duration: 10,
            order: 1,
            knowledge_type: 'concept',
            condensed_summary: 'Graphs are vertices connected by edges.',
          },
          {
            id: 'gt-c2',
            title: 'BFS Algorithm',
            content:
              'Breadth-first search (BFS) is a graph traversal algorithm that visits all neighbors at the current depth before moving deeper. It uses a queue data structure and guarantees finding the shortest path in unweighted graphs. BFS runs in O(V+E) time complexity.',
            difficulty: 4,
            estimated_duration: 15,
            order: 2,
            knowledge_type: 'procedure',
            condensed_summary: 'BFS explores graphs level-by-level using a queue.',
          },
        ],
        context_token: 'ctx-test',
      });
      const created = parseResult(createResult);
      expect(created.status).toBe('ok');

      // Retrieve topic summary — should include dependency_graph_type
      const topicHandler = server.tools.get('get_topic_summary')!.handler;
      const topicResult = await topicHandler({
        topic_id: created.data.topic_id,
        context_token: 'ctx-test',
      });
      const topic = parseResult(topicResult);
      expect(topic.data.dependency_graph_type).toBe('convergent');

      // Retrieve chunk content — should include knowledge_type
      const chunkHandler = server.tools.get('get_chunk_content')!.handler;
      const chunk1Result = await chunkHandler({
        chunk_id: 'gt-c1',
        context_token: 'ctx-test',
      });
      const chunk1 = parseResult(chunk1Result);
      expect(chunk1.data.knowledge_type).toBe('concept');

      const chunk2Result = await chunkHandler({
        chunk_id: 'gt-c2',
        context_token: 'ctx-test',
      });
      const chunk2 = parseResult(chunk2Result);
      expect(chunk2.data.knowledge_type).toBe('procedure');
    });

    it('stores null when fields are omitted (backward compatible)', async () => {
      const createHandler = server.tools.get('create_topic_with_chunks')!.handler;
      const createResult = await createHandler({
        topic_title: 'Basic Algebra',
        subject: 'Math',
        topic_summary: 'Fundamental algebra concepts for beginners',
        chunks: [
          {
            id: 'ba-c1',
            title: 'Variables',
            content:
              'Variables are symbols representing unknown values in mathematical expressions. They allow us to write general formulas and solve equations. Understanding variables is the first step in learning algebra.',
            difficulty: 2,
            estimated_duration: 10,
            order: 1,
            condensed_summary: 'Variables represent unknown values.',
          },
          {
            id: 'ba-c2',
            title: 'Equations',
            content:
              'Equations are mathematical statements that assert the equality of two expressions connected by an equals sign. Solving an equation means finding variable values that satisfy the equality. Linear equations are the simplest form with one unknown variable.',
            difficulty: 3,
            estimated_duration: 10,
            order: 2,
            condensed_summary: 'Equations express equality between expressions.',
          },
        ],
        context_token: 'ctx-test',
      });
      const created = parseResult(createResult);
      expect(created.status).toBe('ok');

      // Topic should have null dependency_graph_type
      const topicHandler = server.tools.get('get_topic_summary')!.handler;
      const topicResult = await topicHandler({
        topic_id: created.data.topic_id,
        context_token: 'ctx-test',
      });
      const topic = parseResult(topicResult);
      expect(topic.data.dependency_graph_type).toBeNull();

      // Chunk should have null knowledge_type
      const chunkHandler = server.tools.get('get_chunk_content')!.handler;
      const chunkResult = await chunkHandler({
        chunk_id: 'ba-c1',
        context_token: 'ctx-test',
      });
      const chunk = parseResult(chunkResult);
      expect(chunk.data.knowledge_type).toBeNull();
    });
  });
});
