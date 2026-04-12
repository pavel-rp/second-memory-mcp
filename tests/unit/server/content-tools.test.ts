import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerContentTools } from '../../../src/server/content-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('content-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 3 content tools', () => {
    registerContentTools(server as any, ctx);
    expect(server.tools.has('get_chunk_content')).toBe(true);
    expect(server.tools.has('get_topic_summary')).toBe(true);
    expect(server.tools.has('list_items_with_content')).toBe(true);
  });

  // ---------------------------------------------------------------
  // get_chunk_content
  // ---------------------------------------------------------------
  describe('get_chunk_content', () => {
    it('returns chunk content on success', async () => {
      ctx.getChunkContent = vi.fn().mockResolvedValue({
        content: '# Linked Lists\nA linked list is…',
        contentVersion: 3,
        contentUpdatedAt: new Date('2025-06-10T10:00:00Z').getTime(),
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_chunk_content')!.handler;

      const result = await handler({ chunk_id: 'chunk-abc', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('chunk-abc');
      expect(parsed.data.content).toBe('# Linked Lists\nA linked list is…');
      expect(parsed.data.content_version).toBe(3);
      expect(parsed.data.content_updated_at).toBe('2025-06-10T10:00:00.000Z');
      expect(parsed.data.session_reminder).toContain('session');
      expect(parsed.data.message).toContain('chunk-abc');
    });

    it('omits content_updated_at when null', async () => {
      ctx.getChunkContent = vi.fn().mockResolvedValue({
        content: 'Some content',
        contentVersion: 1,
        contentUpdatedAt: null,
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_chunk_content')!.handler;

      const result = await handler({ chunk_id: 'chunk-no-date', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.content_updated_at).toBeUndefined();
    });

    it('returns not_found error when chunk does not exist', async () => {
      ctx.getChunkContent = vi.fn().mockResolvedValue(null);
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_chunk_content')!.handler;

      const result = await handler({ chunk_id: 'nonexistent', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns database error when context method throws', async () => {
      ctx.getChunkContent = vi.fn().mockRejectedValue(new Error('connection reset'));
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_chunk_content')!.handler;

      const result = await handler({ chunk_id: 'chunk-err', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('connection reset');
    });

    it('throws ZodError for missing chunk_id', async () => {
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_chunk_content')!.handler;

      await expect(handler({})).rejects.toThrow();
    });

    it('throws ZodError for empty chunk_id', async () => {
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_chunk_content')!.handler;

      await expect(handler({ chunk_id: '' })).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // get_topic_summary
  // ---------------------------------------------------------------
  describe('get_topic_summary', () => {
    it('returns topic summary on success', async () => {
      ctx.getTopicSummary = vi.fn().mockResolvedValue({
        title: 'Data Structures',
        subject: 'Computer Science',
        summary: 'Overview of common data structures',
        summaryVersion: 2,
        summaryUpdatedAt: new Date('2025-07-01T08:00:00Z'),
        createdAt: new Date('2025-06-01T00:00:00Z'),
        updatedAt: new Date('2025-07-01T08:00:00Z'),
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_topic_summary')!.handler;

      const result = await handler({ topic_id: 'topic-xyz', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.topic_id).toBe('topic-xyz');
      expect(parsed.data.title).toBe('Data Structures');
      expect(parsed.data.subject).toBe('Computer Science');
      expect(parsed.data.summary).toBe('Overview of common data structures');
      expect(parsed.data.summary_version).toBe(2);
      expect(parsed.data.summary_updated_at).toBe('2025-07-01T08:00:00.000Z');
      expect(parsed.data.created_at).toBe('2025-06-01T00:00:00.000Z');
      expect(parsed.data.updated_at).toBe('2025-07-01T08:00:00.000Z');
      expect(parsed.data.session_reminder).toContain('batch_fetch_chunks_minimal');
      expect(parsed.data.message).toContain('Data Structures');
    });

    it('returns null summary_updated_at when not set', async () => {
      ctx.getTopicSummary = vi.fn().mockResolvedValue({
        title: 'Algorithms',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: new Date('2025-06-01T00:00:00Z').getTime(),
        updatedAt: new Date('2025-06-01T00:00:00Z').getTime(),
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_topic_summary')!.handler;

      const result = await handler({ topic_id: 'topic-no-summary', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.summary_updated_at).toBeNull();
      expect(parsed.data.created_at).toBe('2025-06-01T00:00:00.000Z');
    });

    it('returns error when topic not found', async () => {
      ctx.getTopicSummary = vi.fn().mockResolvedValue(null);
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_topic_summary')!.handler;

      const result = await handler({ topic_id: 'missing-topic', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toBe('Topic not found');
    });

    it('returns database error when context method throws', async () => {
      ctx.getTopicSummary = vi.fn().mockRejectedValue(new Error('timeout'));
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_topic_summary')!.handler;

      const result = await handler({ topic_id: 'topic-err', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('timeout');
    });

    it('throws ZodError for missing topic_id', async () => {
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_topic_summary')!.handler;

      await expect(handler({})).rejects.toThrow();
    });

    it('throws ZodError for empty topic_id', async () => {
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('get_topic_summary')!.handler;

      await expect(handler({ topic_id: '' })).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // list_items_with_content
  // ---------------------------------------------------------------
  describe('list_items_with_content', () => {
    const mockListResult = {
      items: [
        {
          id: 'item-1',
          title: 'Arrays',
          content: 'Array content here',
          contentVersion: 1,
        },
      ],
      pagination: { total: 1, offset: 0, limit: 100 },
    };

    it('returns items with default offset/limit', async () => {
      ctx.listChunksWithContent = vi.fn().mockResolvedValue(mockListResult);
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.items).toHaveLength(1);
      expect(parsed.data.count).toBe(1);
      expect(parsed.data.filter.offset).toBe(0);
      expect(parsed.data.filter.limit).toBe(100);
      expect(parsed.data.content_included).toBe(true);
      expect(parsed.data.pagination).toEqual({ total: 1, offset: 0, limit: 100 });
    });

    it('passes filters through to context in camelCase', async () => {
      const mockFn = vi.fn().mockResolvedValue({ items: [], pagination: {} });
      ctx.listChunksWithContent = mockFn;
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      await handler({
        subject_filter: 'Math',
        due_only: true,
        include_content: false,
        limit: 50,
        offset: 10,
        context_token: 'ctx-test',
      });

      expect(mockFn).toHaveBeenCalledWith({
        subjectFilter: 'Math',
        dueOnly: true,
        includeContent: false,
        limit: 50,
        offset: 10,
      });
    });

    it('returns empty items list when no results', async () => {
      ctx.listChunksWithContent = vi.fn().mockResolvedValue({
        items: [],
        pagination: { total: 0, offset: 0, limit: 100 },
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.items).toHaveLength(0);
      expect(parsed.data.count).toBe(0);
    });

    it('message includes "with content" when include_content is true', async () => {
      ctx.listChunksWithContent = vi.fn().mockResolvedValue(mockListResult);
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({ include_content: true, context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.data.message).toContain('with content');
    });

    it('message does not include "with content" when include_content is false', async () => {
      ctx.listChunksWithContent = vi.fn().mockResolvedValue({
        items: [],
        pagination: {},
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({ include_content: false, context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.data.message).not.toContain('with content');
    });

    it('returns database error when context method throws', async () => {
      ctx.listChunksWithContent = vi.fn().mockRejectedValue(new Error('pool exhausted'));
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('pool exhausted');
    });

    it('applies subject_filter as null in response when not provided', async () => {
      ctx.listChunksWithContent = vi.fn().mockResolvedValue({
        items: [],
        pagination: {},
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.data.filter.subject).toBeNull();
      expect(parsed.data.filter.due_only).toBe(false);
    });

    it('reflects provided subject_filter and due_only in response', async () => {
      ctx.listChunksWithContent = vi.fn().mockResolvedValue({
        items: [],
        pagination: {},
      });
      registerContentTools(server as any, ctx);
      const handler = server.tools.get('list_items_with_content')!.handler;

      const result = await handler({
        subject_filter: 'Physics',
        due_only: true,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.data.filter.subject).toBe('Physics');
      expect(parsed.data.filter.due_only).toBe(true);
    });
  });
});
