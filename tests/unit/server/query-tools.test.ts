import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerQueryTools } from '../../../src/server/query-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('query-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 3 query tools', () => {
    registerQueryTools(server as any, ctx);
    expect(server.tools.has('list_learning_items')).toBe(true);
    expect(server.tools.has('batch_fetch_topics_minimal')).toBe(true);
    expect(server.tools.has('batch_fetch_chunks_minimal')).toBe(true);
  });

  // ---------------------------------------------------------------
  // list_learning_items
  // ---------------------------------------------------------------
  describe('list_learning_items', () => {
    it('returns items on success', async () => {
      const mockItems = [
        { id: 'c1', title: 'Arrays', subject: 'CS' },
        { id: 'c2', title: 'Lists', subject: 'CS' },
      ];
      ctx.listChunksAsLearningItems = vi.fn().mockResolvedValue(mockItems);
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('list_learning_items')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('c1');
    });

    it('passes snake_case filters as camelCase to ctx', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.listChunksAsLearningItems = mockFn;
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('list_learning_items')!.handler;

      await handler({ subject_filter: 'Math', due_only: true, limit: 10 });

      expect(mockFn).toHaveBeenCalledWith({
        subjectFilter: 'Math',
        dueOnly: true,
        limit: 10,
      });
    });

    it('passes is_leech filter through as camelCase', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.listChunksAsLearningItems = mockFn;
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('list_learning_items')!.handler;

      await handler({ is_leech: true });

      expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ isLeech: true }));
    });

    it('passes is_leech: false to exclude leeches', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.listChunksAsLearningItems = mockFn;
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('list_learning_items')!.handler;

      await handler({ is_leech: false });

      expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ isLeech: false }));
    });

    it('returns database error when ctx throws', async () => {
      ctx.listChunksAsLearningItems = vi.fn().mockRejectedValue(new Error('connection refused'));
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('list_learning_items')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('connection refused');
    });
  });

  // ---------------------------------------------------------------
  // batch_fetch_topics_minimal
  // ---------------------------------------------------------------
  describe('batch_fetch_topics_minimal', () => {
    it('returns topics on success', async () => {
      const mockTopics = [{ id: 't1', title: 'DS', subject: 'CS' }];
      ctx.batchFetchTopicsMinimal = vi.fn().mockResolvedValue(mockTopics);
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.topics).toHaveLength(1);
      expect(parsed.count).toBe(1);
      expect(parsed.message).toContain('1 topic');
    });

    it('passes filter to ctx', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.batchFetchTopicsMinimal = mockFn;
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;

      await handler({ subject_filter: 'Math', limit: 5 });

      expect(mockFn).toHaveBeenCalledWith({ subject: 'Math', limit: 5 });
    });

    it('returns empty results', async () => {
      ctx.batchFetchTopicsMinimal = vi.fn().mockResolvedValue([]);
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.topics).toHaveLength(0);
      expect(parsed.count).toBe(0);
    });

    it('returns database error when ctx throws', async () => {
      ctx.batchFetchTopicsMinimal = vi.fn().mockRejectedValue(new Error('timeout'));
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });
  });

  // ---------------------------------------------------------------
  // batch_fetch_chunks_minimal
  // ---------------------------------------------------------------
  describe('batch_fetch_chunks_minimal', () => {
    it('returns chunks with workflow_hint when chunks found', async () => {
      const mockChunks = [
        { id: 'c1', title: 'Arrays' },
        { id: 'c2', title: 'Lists' },
      ];
      ctx.batchFetchChunksMinimal = vi.fn().mockResolvedValue(mockChunks);
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunks).toHaveLength(2);
      expect(parsed.count).toBe(2);
      expect(parsed.workflow_hint).toBeDefined();
      expect(parsed.workflow_hint.action).toBe('REQUIRED_FOR_RECALL');
      expect(parsed.workflow_hint.chunk_ids).toEqual(['c1', 'c2']);
    });

    it('returns singular message when exactly 1 chunk found', async () => {
      ctx.batchFetchChunksMinimal = vi.fn().mockResolvedValue([{ id: 'c1', title: 'Arrays' }]);
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.count).toBe(1);
      expect(parsed.message).toBe('Retrieved 1 chunk');
      expect(parsed.message).not.toContain('chunks');
    });

    it('returns no workflow_hint when empty', async () => {
      ctx.batchFetchChunksMinimal = vi.fn().mockResolvedValue([]);
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunks).toHaveLength(0);
      expect(parsed.workflow_hint).toBeUndefined();
    });

    it('passes all filter fields to ctx', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.batchFetchChunksMinimal = mockFn;
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;

      await handler({ topic_id: 't1', subject_filter: 'CS', due_only: true, limit: 20 });

      expect(mockFn).toHaveBeenCalledWith({
        topicId: 't1',
        subject: 'CS',
        dueOnly: true,
        limit: 20,
      });
    });

    it('passes is_leech filter through as camelCase', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.batchFetchChunksMinimal = mockFn;
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;

      await handler({ is_leech: true });

      expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ isLeech: true }));
    });

    it('returns database error when ctx throws', async () => {
      ctx.batchFetchChunksMinimal = vi.fn().mockRejectedValue(new Error('pool exhausted'));
      registerQueryTools(server as any, ctx);
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('pool exhausted');
    });
  });
});
