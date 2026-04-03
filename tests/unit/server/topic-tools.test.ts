import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerTopicTools } from '../../../src/server/topic-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('topic-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 3 topic tools', () => {
    registerTopicTools(server as any, ctx);
    expect(server.tools.has('create_topic_with_chunks')).toBe(true);
    expect(server.tools.has('update_topic')).toBe(true);
    expect(server.tools.has('update_topic_summary')).toBe(true);
  });

  // ---------------------------------------------------------------
  // create_topic_with_chunks
  // ---------------------------------------------------------------
  describe('create_topic_with_chunks', () => {
    const validInput = {
      topic_title: 'Data Structures',
      subject: 'CS',
      topic_summary: 'Overview of fundamental data structures in computer science',
      chunks: [
        {
          id: 'c1',
          title: 'Arrays',
          content:
            'Arrays are contiguous memory blocks used for storing elements of the same type. They provide O(1) random access by index and are the foundation of many higher-level data structures. Understanding arrays is essential for algorithm design.',
          difficulty: 3,
          estimated_duration: 10,
          order: 1,
          condensed_summary: 'Arrays store elements in contiguous memory blocks.',
        },
        {
          id: 'c2',
          title: 'Linked Lists',
          content:
            'Linked lists are dynamic data structures where each element (node) contains a value and a pointer to the next node. Unlike arrays, they allow efficient insertion and deletion at any position without shifting elements, but sacrifice random access performance.',
          difficulty: 4,
          estimated_duration: 10,
          order: 2,
          condensed_summary: 'Linked lists use nodes with pointers for dynamic insertion.',
        },
      ],
      context_token: 'ctx-test',
    };

    it('returns success when ctx returns success', async () => {
      ctx.createTopicWithChunks = vi.fn().mockResolvedValue({
        success: true,
        topic: {
          topicId: 't1',
          topicTitle: 'Data Structures',
          chunks: [{ id: 'c1' }],
          createdAt: Date.now(),
        },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.topic_id).toBe('t1');
      expect(parsed.chunk_ids).toEqual(['c1']);
      expect(parsed.message).toContain('Data Structures');
    });

    it('maps snake_case chunk fields to camelCase for ctx', async () => {
      const mockFn = vi.fn().mockResolvedValue({
        success: true,
        topic: { topicId: 't1', topicTitle: 'T', chunks: [], createdAt: Date.now() },
      });
      ctx.createTopicWithChunks = mockFn;
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await handler({
        topic_title: 'T',
        subject: 'CS',
        topic_summary: 'Topic summary for camelCase mapping test',
        chunks: [
          {
            id: 'c1',
            title: 'A',
            content:
              'Content for the chunk about arrays and data structures. Arrays provide constant-time access to elements by index and are stored in contiguous memory blocks. They are the most fundamental data structure in computer science and form the basis of many algorithms.',
            difficulty: 3,
            estimated_duration: 15,
            order: 1,
            chunk_type: 'review',
            prerequisites: ['c0'],
            tags: ['ds'],
            condensed_summary: 'Arrays and data structures overview.',
          },
          {
            id: 'c2',
            title: 'B',
            content:
              'Linked lists are composed of nodes where each node holds a value and a reference to the next node. They excel at insertion and deletion operations but lack the random access capability of arrays. Singly and doubly linked variants exist for different use cases.',
            difficulty: 4,
            estimated_duration: 10,
            order: 2,
            condensed_summary: 'Linked lists use node-based storage.',
          },
        ],
        context_token: 'ctx-test',
      });

      const call = mockFn.mock.calls[0][0];
      expect(call.chunks[0].estimatedDuration).toBe(15);
      expect(call.chunks[0].chunkType).toBe('review');
      expect(call.chunks[0].prerequisites).toEqual(['c0']);
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.createTopicWithChunks = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'database', message: 'duplicate title' },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('duplicate title');
    });

    it('returns system error when ctx throws', async () => {
      ctx.createTopicWithChunks = vi.fn().mockRejectedValue(new Error('connection lost'));
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('connection lost');
    });

    it('throws ZodError for missing required fields', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await expect(handler({})).rejects.toThrow();
    });

    it('throws ZodError for empty chunks array', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await expect(
        handler({ topic_title: 'T', subject: 'CS', topic_summary: 'Summary', chunks: [] })
      ).rejects.toThrow();
    });

    it('throws ZodError for single chunk (minimum is 2)', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await expect(
        handler({
          ...validInput,
          chunks: [validInput.chunks[0]],
          context_token: 'ctx-test',
        })
      ).rejects.toThrow('At least 2 chunks are required');
    });

    it('throws ZodError for more than 7 chunks', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const eightChunks = Array.from({ length: 8 }, (_, i) => ({
        ...validInput.chunks[0],
        id: `c${i + 1}`,
        order: i + 1,
      }));

      await expect(
        handler({
          ...validInput,
          chunks: eightChunks,
          context_token: 'ctx-test',
        })
      ).rejects.toThrow('Maximum 7 chunks per topic');
    });

    it('throws ZodError for invalid content_status in chunk', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await expect(
        handler({
          topic_title: 'T',
          subject: 'CS',
          topic_summary: 'Summary for content status test',
          chunks: [
            {
              id: 'c1',
              title: 'A',
              content:
                'Content that covers arrays and their role in computer science. Arrays provide constant-time element access by index and are stored contiguously in memory. They are foundational to many algorithms and higher-level data structures used in practice.',
              difficulty: 3,
              estimated_duration: 10,
              order: 1,
              content_status: 'invalid',
              condensed_summary: 'Summary for validation test.',
            },
            {
              id: 'c2',
              title: 'B',
              content:
                'Linked lists are dynamic structures composed of nodes with values and next-pointers. They allow efficient insertion and deletion without shifting elements like arrays require. Both singly and doubly linked variants exist for different performance trade-offs.',
              difficulty: 4,
              estimated_duration: 10,
              order: 2,
              content_status: 'invalid',
              condensed_summary: 'Linked lists overview.',
            },
          ],
        })
      ).rejects.toThrow('Content status must be one of: draft, final');
    });

    it('passes dependency_graph_type and knowledge_type through to ctx', async () => {
      const mockFn = vi.fn().mockResolvedValue({
        success: true,
        topic: { topicId: 't1', topicTitle: 'T', chunks: [], createdAt: Date.now() },
      });
      ctx.createTopicWithChunks = mockFn;
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await handler({
        ...validInput,
        dependency_graph_type: 'convergent',
        chunks: [
          { ...validInput.chunks[0], knowledge_type: 'concept' },
          { ...validInput.chunks[1], knowledge_type: 'procedure' },
        ],
      });

      const call = mockFn.mock.calls[0][0];
      expect(call.dependencyGraphType).toBe('convergent');
      expect(call.chunks[0].knowledgeType).toBe('concept');
      expect(call.chunks[1].knowledgeType).toBe('procedure');
    });

    it('succeeds without dependency_graph_type and knowledge_type (optional)', async () => {
      ctx.createTopicWithChunks = vi.fn().mockResolvedValue({
        success: true,
        topic: { topicId: 't1', topicTitle: 'T', chunks: [], createdAt: Date.now() },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
    });

    it('throws ZodError for invalid knowledge_type', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await expect(
        handler({
          ...validInput,
          chunks: [{ ...validInput.chunks[0], knowledge_type: 'banana' }, validInput.chunks[1]],
        })
      ).rejects.toThrow('Knowledge type must be one of: fact, concept, procedure, principle');
    });

    it('throws ZodError for invalid dependency_graph_type', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      await expect(
        handler({
          ...validInput,
          dependency_graph_type: 'invalid',
        })
      ).rejects.toThrow(
        'Dependency graph type must be one of: linear_chain, convergent, divergent, single_root'
      );
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.createTopicWithChunks = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.createTopicWithChunks = vi.fn().mockResolvedValue({
        success: false,
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('create_topic_with_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });
  });

  // ---------------------------------------------------------------
  // update_topic
  // ---------------------------------------------------------------
  describe('update_topic', () => {
    it('returns success when ctx returns success', async () => {
      ctx.updateTopicMetadata = vi.fn().mockResolvedValue({
        success: true,
        topic: { id: 't1', title: 'Updated Title', updatedAt: Date.now() },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      const result = await handler({
        topic_id: 't1',
        title: 'Updated Title',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.topic_id).toBe('t1');
      expect(parsed.updated_at).toBeDefined();
      expect(parsed.message).toContain('Updated Title');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateTopicMetadata = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Topic not found' },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      const result = await handler({ topic_id: 't-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateTopicMetadata = vi.fn().mockRejectedValue(new Error('deadlock'));
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      const result = await handler({ topic_id: 't1', title: 'X', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('throws ZodError for missing topic_id', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      await expect(handler({})).rejects.toThrow();
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.updateTopicMetadata = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      const result = await handler({ topic_id: 't1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.updateTopicMetadata = vi.fn().mockResolvedValue({
        success: false,
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      const result = await handler({ topic_id: 't1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });
  });

  // ---------------------------------------------------------------
  // update_topic_summary
  // ---------------------------------------------------------------
  describe('update_topic_summary', () => {
    it('returns success when ctx returns success', async () => {
      ctx.updateTopicSummary = vi.fn().mockResolvedValue({
        success: true,
        topic: { id: 't1', title: 'DS', summaryVersion: 2, updatedAt: Date.now() },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't1',
        summary: 'Updated summary content for the topic about data structures.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.topic_id).toBe('t1');
      expect(parsed.summary_version).toBe(2);
      expect(parsed.message).toContain('DS');
    });

    it('includes consistency_reminder in success response', async () => {
      ctx.updateTopicSummary = vi.fn().mockResolvedValue({
        success: true,
        topic: { id: 't1', title: 'DS', summaryVersion: 2, updatedAt: Date.now() },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't1',
        summary: 'Updated summary content for the topic about data structures.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeDefined();
      expect(parsed.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.consistency_reminder.instruction).toContain('summary');
      expect(parsed.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.consistency_reminder.checklist.length).toBe(4);
    });

    it('does not include consistency_reminder in error response', async () => {
      ctx.updateTopicSummary = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Topic not found' },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't-missing',
        summary: 'Summary content that is long enough to pass validation checks.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateTopicSummary = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Topic not found' },
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't-missing',
        summary: 'Summary content that is long enough to pass validation checks.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateTopicSummary = vi.fn().mockRejectedValue(new Error('timeout'));
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't1',
        summary: 'Summary content that is long enough to pass validation checks.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('throws ZodError for missing required fields', async () => {
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      await expect(handler({})).rejects.toThrow();
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.updateTopicSummary = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't1',
        summary: 'Summary content that is long enough to pass validation checks.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.updateTopicSummary = vi.fn().mockResolvedValue({
        success: false,
      });
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic_summary')!.handler;

      const result = await handler({
        topic_id: 't1',
        summary: 'Summary content that is long enough to pass validation checks.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });
  });
});
