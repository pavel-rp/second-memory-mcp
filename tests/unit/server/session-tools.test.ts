import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerSessionTools } from '../../../src/server/session-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

// Minimal valid SessionInput for the pure domain functions
const makeSessionInput = () => ({
  session_id: 's1',
  mode: 'learning' as const,
  start_time: '2025-06-15T10:00:00Z',
  chunks: [
    {
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      title: 'Arrays',
      status: 'completed' as const,
      attempts: [
        {
          timestamp: '2025-06-15T10:05:00Z',
          question: 'Test question',
          response: 'Test response',
          passed: true,
          feedback: 'Test feedback',
          quality: 4,
          time_spent_ms: 5000,
        },
      ],
      quality_scores: [4],
      time_spent_ms: 5000,
    },
  ],
});

describe('session-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 3 session tools', () => {
    registerSessionTools(server as any, ctx);
    expect(server.tools.has('session_progress')).toBe(true);
    expect(server.tools.has('session_workflow')).toBe(true);
    expect(server.tools.has('session_completion')).toBe(true);
  });

  // ---------------------------------------------------------------
  // session_progress
  // ---------------------------------------------------------------
  describe('session_progress', () => {
    it('computes progress with session_data', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({ session_data: makeSessionInput() });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
      expect(parsed.overall_progress).toBeDefined();
      expect(parsed.chunks_completed).toBe(1);
    });

    it('computes progress with session_id', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
    });

    it('returns error when session not found by id', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({ session_id: 's-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
      expect(parsed.error.message).toContain('not found');
    });

    it('returns error when convertSessionToInput returns null', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.message).toContain('Failed to convert');
    });

    it('returns validation error when session data is invalid', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({
        session_data: { ...makeSessionInput(), chunks: [] },
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns error when neither session_id nor session_data', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
    });

    it('returns error when ctx throws', async () => {
      ctx.getSessionById = vi.fn().mockRejectedValue(new Error('db error'));
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_progress')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.message).toContain('db error');
    });
  });

  // ---------------------------------------------------------------
  // session_workflow
  // ---------------------------------------------------------------
  describe('session_workflow', () => {
    it('determines workflow phase with session_data', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_workflow')!.handler;

      const result = await handler({ session_data: makeSessionInput() });
      const parsed = parseResult(result);

      expect(parsed.current_phase).toBeDefined();
      expect(parsed.guidance).toBeDefined();
    });

    it('determines workflow phase with session_id', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_workflow')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.current_phase).toBeDefined();
    });

    it('returns error when session not found', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_workflow')!.handler;

      const result = await handler({ session_id: 's-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
    });

    it('returns error when convertSessionToInput returns null', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_workflow')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });

    it('returns validation error when session data is invalid', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_workflow')!.handler;

      const result = await handler({
        session_data: { ...makeSessionInput(), chunks: [] },
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns error when neither input provided', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_workflow')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // session_completion
  // ---------------------------------------------------------------
  describe('session_completion', () => {
    it('checks completion with session_data', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({ session_data: makeSessionInput() });
      const parsed = parseResult(result);

      expect(parsed.is_complete).toBeDefined();
      expect(parsed.recommendation).toBeDefined();
    });

    it('checks completion with session_id', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.is_complete).toBeDefined();
    });

    it('returns error when session not found', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({ session_id: 's-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
    });

    it('returns error when convertSessionToInput returns null', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
    });

    it('returns validation error when session data is invalid', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({
        session_data: { ...makeSessionInput(), chunks: [] },
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns error when neither input provided', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });
});
