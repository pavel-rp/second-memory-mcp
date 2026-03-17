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
      chunks: [
        {
          id: 'c1',
          title: 'Arrays',
          content: 'Arrays are contiguous memory blocks used for storing elements.',
          difficulty: 3,
          estimated_duration: 10,
          order: 1,
        },
      ],
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
        chunks: [
          {
            id: 'c1',
            title: 'A',
            content: 'Content for the chunk about arrays and data structures.',
            difficulty: 3,
            estimated_duration: 15,
            order: 1,
            chunk_type: 'review',
            prerequisites: ['c0'],
            tags: ['ds'],
          },
        ],
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

      await expect(handler({ topic_title: 'T', subject: 'CS', chunks: [] })).rejects.toThrow();
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

      const result = await handler({ topic_id: 't1', title: 'Updated Title' });
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

      const result = await handler({ topic_id: 't-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateTopicMetadata = vi.fn().mockRejectedValue(new Error('deadlock'));
      registerTopicTools(server as any, ctx);
      const handler = server.tools.get('update_topic')!.handler;

      const result = await handler({ topic_id: 't1', title: 'X' });
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

      const result = await handler({ topic_id: 't1' });
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

      const result = await handler({ topic_id: 't1' });
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
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.topic_id).toBe('t1');
      expect(parsed.summary_version).toBe(2);
      expect(parsed.message).toContain('DS');
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
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });
  });
});
