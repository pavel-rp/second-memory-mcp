import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerSessionProgressTools } from '../../../src/server/session-progress-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('session-progress-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 3 session progress tools', () => {
    registerSessionProgressTools(server as any, ctx);
    expect(server.tools.has('create_session_chunk')).toBe(true);
    expect(server.tools.has('batch_update_session_chunks')).toBe(true);
    expect(server.tools.has('get_historical_feedback')).toBe(true);
  });

  // ---------------------------------------------------------------
  // create_session_chunk
  // ---------------------------------------------------------------
  describe('create_session_chunk', () => {
    it('creates session chunk on success', async () => {
      ctx.createSessionChunk = vi.fn().mockResolvedValue({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'c1',
      });
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('create_session_chunk')!.handler;

      const result = await handler({
        session_id: 's1',
        chunk_id: 'c1',
        status: 'pending',
        time_spent_ms: 0,
      });
      const parsed = parseResult(result);

      expect(parsed.session_chunk_id).toBe('sc1');
      expect(parsed.status).toBe('created');
    });

    it('maps attempts correctly', async () => {
      const mockFn = vi.fn().mockResolvedValue({ id: 'sc1' });
      ctx.createSessionChunk = mockFn;
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('create_session_chunk')!.handler;

      await handler({
        session_id: 's1',
        chunk_id: 'c1',
        attempts: [{ timestamp: 1000000, quality: 4, time_spent_ms: 5000, completed: true }],
        quality_scores: [4],
        time_spent_ms: 5000,
      });

      const call = mockFn.mock.calls[0][0];
      expect(call.attemptsJson[0].timestamp).toBeDefined();
      expect(call.attemptsJson[0].quality).toBe(4);
      expect(call.qualityScoresJson).toEqual([4]);
    });

    it('returns database error when ctx throws', async () => {
      ctx.createSessionChunk = vi.fn().mockRejectedValue(new Error('insert failed'));
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('create_session_chunk')!.handler;

      const result = await handler({
        session_id: 's1',
        chunk_id: 'c1',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns error for missing session_id', async () => {
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('create_session_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });

    it('returns error for missing chunk_id', async () => {
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('create_session_chunk')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // batch_update_session_chunks
  // ---------------------------------------------------------------
  describe('batch_update_session_chunks', () => {
    it('batch updates session chunks on success', async () => {
      ctx.validateChunkIds = vi.fn().mockResolvedValue({ valid: true, invalidIds: [] });
      ctx.getSessionWithChunks = vi.fn().mockResolvedValue({
        session: { id: 's1', status: 'active' },
        chunks: [],
      });
      ctx.batchUpdateSessionChunks = vi.fn().mockResolvedValue({
        success: true,
        data: { created: 1, updated: 0, unchanged: 0 },
      });
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('batch_update_session_chunks')!.handler;

      const result = await handler({
        session_id: 's1',
        operations: [
          { chunk_id: 'c1', status: 'completed', time_spent_ms: 5000, quality_scores: [4] },
        ],
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.created).toBe(1);
      expect(parsed.affected_chunk_ids).toEqual(['c1']);
    });

    it('returns error for invalid chunk IDs', async () => {
      ctx.validateChunkIds = vi.fn().mockResolvedValue({
        valid: false,
        invalidIds: ['c-bad'],
      });
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('batch_update_session_chunks')!.handler;

      const result = await handler({
        session_id: 's1',
        operations: [{ chunk_id: 'c-bad' }],
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.message).toContain('c-bad');
    });

    it('returns database error when ctx throws', async () => {
      ctx.validateChunkIds = vi.fn().mockRejectedValue(new Error('timeout'));
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('batch_update_session_chunks')!.handler;

      const result = await handler({
        session_id: 's1',
        operations: [{ chunk_id: 'c1' }],
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns error for missing session_id', async () => {
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('batch_update_session_chunks')!.handler;

      const result = await handler({ operations: [{ chunk_id: 'c1' }] });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });

    it('returns error for empty operations', async () => {
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('batch_update_session_chunks')!.handler;

      const result = await handler({ session_id: 's1', operations: [] });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // get_historical_feedback
  // ---------------------------------------------------------------
  describe('get_historical_feedback', () => {
    it('returns feedback entries', async () => {
      const mockFeedback = [
        { sessionId: 's-old', feedback: 'Found arrays hard', chunkIds: ['c1'] },
      ];
      ctx.getHistoricalFeedback = vi.fn().mockResolvedValue(mockFeedback);
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('get_historical_feedback')!.handler;

      const result = await handler({ chunk_ids: ['c1'] });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.feedback_count).toBe(1);
      expect(parsed.feedback).toHaveLength(1);
      expect(parsed.hint).toContain('Pay special attention');
    });

    it('returns empty feedback', async () => {
      ctx.getHistoricalFeedback = vi.fn().mockResolvedValue([]);
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('get_historical_feedback')!.handler;

      const result = await handler({ chunk_ids: ['c1'] });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.feedback_count).toBe(0);
      expect(parsed.hint).toContain('No previous feedback');
    });

    it('returns database error when ctx throws', async () => {
      ctx.getHistoricalFeedback = vi.fn().mockRejectedValue(new Error('query failed'));
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('get_historical_feedback')!.handler;

      const result = await handler({ chunk_ids: ['c1'] });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns error for empty chunk_ids array', async () => {
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('get_historical_feedback')!.handler;

      const result = await handler({ chunk_ids: [] });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });

    it('returns error for missing chunk_ids', async () => {
      registerSessionProgressTools(server as any, ctx);
      const handler = server.tools.get('get_historical_feedback')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });
});
