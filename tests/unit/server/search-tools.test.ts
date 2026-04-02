import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerSearchTools } from '../../../src/server/search-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('search-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers search_learning_content tool', () => {
    registerSearchTools(server as any, ctx);
    expect(server.tools.has('search_learning_content')).toBe(true);
  });

  describe('search_learning_content', () => {
    const makeSearchResult = (
      chunks: Array<{ id: string }>,
      topics: Array<{ id: string }> = []
    ) => ({
      query: 'arrays',
      normalizedQuery: 'arrays',
      tokens: ['arrays'],
      limit: 10,
      filters: {},
      counts: {
        topics: topics.length,
        chunks: chunks.length,
        total: topics.length + chunks.length,
      },
      results: [
        ...topics.map(t => ({
          ...t,
          resultType: 'topic' as const,
          title: 'T',
          subject: 'CS',
          matchScore: 1,
          highlightTerms: [],
          createdAt: '1970-01-01T00:00:00.000Z',
          updatedAt: '1970-01-01T00:00:00.000Z',
        })),
        ...chunks.map(c => ({
          ...c,
          resultType: 'chunk' as const,
          title: 'C',
          subject: 'CS',
          matchScore: 1,
          highlightTerms: [],
          createdAt: '1970-01-01T00:00:00.000Z',
          updatedAt: '1970-01-01T00:00:00.000Z',
        })),
      ],
    });

    it('returns results with workflow_hint when chunks found', async () => {
      ctx.searchLearningContent = vi
        .fn()
        .mockResolvedValue(makeSearchResult([{ id: 'c1' }, { id: 'c2' }]));
      registerSearchTools(server as any, ctx);
      const handler = server.tools.get('search_learning_content')!.handler;

      const result = await handler({ query: 'arrays', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.message).toContain('Found');
      expect(parsed.workflow_hint).toBeDefined();
      expect(parsed.workflow_hint.action).toBe('REQUIRED_FOR_RECALL');
      expect(parsed.workflow_hint.suggested_chunk_ids).toEqual(['c1', 'c2']);
    });

    it('returns no results message when empty', async () => {
      ctx.searchLearningContent = vi.fn().mockResolvedValue(makeSearchResult([], []));
      registerSearchTools(server as any, ctx);
      const handler = server.tools.get('search_learning_content')!.handler;

      const result = await handler({ query: 'nonexistent', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.message).toContain('No matching');
    });

    it('returns no workflow_hint when only topic results', async () => {
      ctx.searchLearningContent = vi.fn().mockResolvedValue(makeSearchResult([], [{ id: 't1' }]));
      registerSearchTools(server as any, ctx);
      const handler = server.tools.get('search_learning_content')!.handler;

      const result = await handler({ query: 'topics', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.workflow_hint).toBeUndefined();
    });

    it('returns database error when ctx throws', async () => {
      ctx.searchLearningContent = vi.fn().mockRejectedValue(new Error('search failed'));
      registerSearchTools(server as any, ctx);
      const handler = server.tools.get('search_learning_content')!.handler;

      const result = await handler({ query: 'test', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toContain('search failed');
    });

    it('returns error for query too short', async () => {
      registerSearchTools(server as any, ctx);
      const handler = server.tools.get('search_learning_content')!.handler;

      const result = await handler({ query: 'a' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });

    it('returns error for missing query', async () => {
      registerSearchTools(server as any, ctx);
      const handler = server.tools.get('search_learning_content')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });
  });
});
