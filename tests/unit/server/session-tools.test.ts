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
      title: 'Arrays',
      status: 'completed' as const,
      attempts: [
        { timestamp: '2025-06-15T10:05:00Z', quality: 4, time_spent_ms: 5000, completed: true },
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

  it('registers all 4 session tools', () => {
    registerSessionTools(server as any, ctx);
    expect(server.tools.has('session_progress')).toBe(true);
    expect(server.tools.has('session_workflow')).toBe(true);
    expect(server.tools.has('session_completion')).toBe(true);
    expect(server.tools.has('guided_learning_conversation')).toBe(true);
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

    it('returns error when neither input provided', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('session_completion')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // guided_learning_conversation
  // ---------------------------------------------------------------
  describe('guided_learning_conversation', () => {
    it('conducts learning session on happy path', async () => {
      const mockResult = {
        message: 'Let me help you learn arrays.',
        needsInput: true,
        suggestedInputs: ['arrays', 'lists'],
      };
      const mockConductor = { conductLearningSession: vi.fn().mockResolvedValue(mockResult) };
      ctx.createConversationManager = vi.fn().mockReturnValue(mockConductor);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('guided_learning_conversation')!.handler;

      const result = await handler({
        intent: 'start_learning',
        user_input: 'teach me arrays',
        session_state: { currentSessionId: 's1' },
      });
      const parsed = parseResult(result);

      expect(parsed.message).toBe('Let me help you learn arrays.');
      expect(parsed.needs_input).toBe(true);
    });

    it('maps snake_case input to camelCase for conductor', async () => {
      const mockConductor = {
        conductLearningSession: vi.fn().mockResolvedValue({ message: 'ok', needsInput: false }),
      };
      ctx.createConversationManager = vi.fn().mockReturnValue(mockConductor);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('guided_learning_conversation')!.handler;

      await handler({
        intent: 'continue',
        user_input: 'next topic',
        session_state: { key: 'value' },
      });

      const call = mockConductor.conductLearningSession.mock.calls[0][0];
      expect(call.userInput).toBe('next topic');
      expect(call.sessionState).toEqual({ key: 'value' });
    });

    it('returns error when conductor throws', async () => {
      const mockConductor = {
        conductLearningSession: vi.fn().mockRejectedValue(new Error('conductor crash')),
      };
      ctx.createConversationManager = vi.fn().mockReturnValue(mockConductor);
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('guided_learning_conversation')!.handler;

      const result = await handler({ intent: 'start' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
      expect(parsed.error.message).toContain('conductor crash');
    });

    it('returns error for missing intent', async () => {
      registerSessionTools(server as any, ctx);
      const handler = server.tools.get('guided_learning_conversation')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('session');
    });
  });
});
