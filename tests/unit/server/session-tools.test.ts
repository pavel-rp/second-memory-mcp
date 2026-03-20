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

  it('registers session_status tool', () => {
    registerSessionTools(server as any, ctx);
    expect(server.tools.has('session_status')).toBe(true);
  });

  it('old tools are not registered', () => {
    registerSessionTools(server as any, ctx);
    expect(server.tools.has('session_progress')).toBe(false);
    expect(server.tools.has('session_workflow')).toBe(false);
    expect(server.tools.has('session_completion')).toBe(false);
  });

  describe('session_status', () => {
    it('returns status with session_id', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
      expect(parsed.chunks_completed).toBe(1);
      expect(parsed.chunks_remaining).toBe(0);
      expect(parsed.overall_progress).toBeDefined();
      expect(parsed.average_quality).toBeDefined();
      expect(parsed.time_elapsed_ms).toBeDefined();
      expect(parsed.should_complete).toBeDefined();
      expect(parsed.reason).toBeDefined();
      expect(parsed.recommendation).toBeDefined();
    });

    it('returns not_found error when session not found by id', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({ session_id: 's-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
      expect(parsed.error.message).toContain('not found');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns error when convertSessionToInput returns null', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
      expect(parsed.error.message).toContain('Failed to convert');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error for empty session_id', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({ session_id: '' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error for missing session_id', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error when session data is invalid', async () => {
      const invalidInput = {
        ...makeSessionInput(),
        chunks: [], // empty chunks fails validation
      };
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(invalidInput);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns retryable error for infrastructure failures', async () => {
      ctx.getSessionById = vi.fn().mockRejectedValue(new Error('db error'));
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_status')!.handler;

      const result = await handler({ session_id: 's1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
      expect(parsed.error.message).toContain('db error');
      expect(parsed.error.retryable).toBe(true);
    });
  });
});
