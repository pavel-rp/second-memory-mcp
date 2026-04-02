import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerSessionLifecycleTools } from '../../../src/server/session-lifecycle-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

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

describe('session-lifecycle-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 4 session lifecycle tools', () => {
    registerSessionLifecycleTools(server as any, ctx);
    expect(server.tools.has('create_session')).toBe(true);
    expect(server.tools.has('get_active_session')).toBe(true);
    expect(server.tools.has('get_session')).toBe(true);
    expect(server.tools.has('complete_session')).toBe(true);
  });

  // ---------------------------------------------------------------
  // create_session
  // ---------------------------------------------------------------
  describe('create_session', () => {
    it('creates session without chunks', async () => {
      ctx.createSession = vi.fn().mockResolvedValue({
        success: true,
        data: { sessionId: 's1' },
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({ mode: 'learning', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
      expect(parsed.status).toBe('created');
      expect(parsed.message).toContain('learning');
    });

    it('creates session with chunks after dependency resolution', async () => {
      ctx.resolveSessionChunkDependencies = vi.fn().mockResolvedValue({
        resolvedChunkIds: ['c0', 'c1'],
        addedPrerequisites: ['c0'],
        skippedMasteredPrerequisites: [],
        message: ' (1 prerequisite added)',
      });
      ctx.validateChunkIds = vi.fn().mockResolvedValue({ valid: true, invalidIds: [] });
      ctx.createSession = vi.fn().mockResolvedValue({
        success: true,
        data: { sessionId: 's1' },
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({
        mode: 'retrieval',
        chunk_ids: ['c1'],
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
      expect(parsed.message).toContain('2 chunks');
    });

    it('creates session and logs skipped mastered prerequisites', async () => {
      ctx.resolveSessionChunkDependencies = vi.fn().mockResolvedValue({
        resolvedChunkIds: ['c1'],
        addedPrerequisites: [],
        skippedMasteredPrerequisites: ['p1', 'p2'],
        message: ' Skipped 2 mastered prerequisites (Motivation, Structure).',
      });
      ctx.validateChunkIds = vi.fn().mockResolvedValue({ valid: true, invalidIds: [] });
      ctx.createSession = vi.fn().mockResolvedValue({
        success: true,
        data: { sessionId: 's1' },
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({
        mode: 'retrieval',
        chunk_ids: ['c1'],
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
      expect(parsed.message).toContain('Skipped 2 mastered prerequisites');
    });

    it('returns validation error for invalid chunk IDs', async () => {
      ctx.resolveSessionChunkDependencies = vi.fn().mockResolvedValue({
        resolvedChunkIds: ['c-bad'],
        addedPrerequisites: [],
        skippedMasteredPrerequisites: [],
        message: '',
      });
      ctx.validateChunkIds = vi.fn().mockResolvedValue({
        valid: false,
        invalidIds: ['c-bad'],
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({
        mode: 'learning',
        chunk_ids: ['c-bad'],
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.message).toContain('c-bad');
    });

    it('returns toolError when createSession fails', async () => {
      ctx.createSession = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'database', message: 'insert failed' },
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({ mode: 'learning', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });

    it('returns database error when ctx throws', async () => {
      ctx.createSession = vi.fn().mockRejectedValue(new Error('connection lost'));
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({ mode: 'learning', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns error for missing mode', async () => {
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('create_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // get_active_session
  // ---------------------------------------------------------------
  describe('get_active_session', () => {
    it('returns not_found when no active session', async () => {
      ctx.getActiveSession = vi.fn().mockResolvedValue(null);
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_active_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.session).toBeNull();
      expect(parsed.status).toBe('not_found');
    });

    it('returns found when active session exists', async () => {
      ctx.getActiveSession = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_active_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.session).not.toBeNull();
      expect(parsed.status).toBe('found');
    });

    it('returns not_found when convertSessionToInput returns null', async () => {
      ctx.getActiveSession = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_active_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.session).toBeNull();
      expect(parsed.status).toBe('not_found');
    });

    it('includes historical feedback for review mode', async () => {
      ctx.getActiveSession = vi.fn().mockResolvedValue({ id: 's1', mode: 'review' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_active_session')!.handler;

      await handler({});

      expect(ctx.convertSessionToInput).toHaveBeenCalledWith('s1', {
        includeHistoricalFeedback: true,
        historicalFeedbackLimit: 5,
      });
    });

    it('returns database error when ctx throws', async () => {
      ctx.getActiveSession = vi.fn().mockRejectedValue(new Error('db error'));
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_active_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });
  });

  // ---------------------------------------------------------------
  // get_session
  // ---------------------------------------------------------------
  describe('get_session', () => {
    it('returns found when session exists', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.session).not.toBeNull();
      expect(parsed.status).toBe('found');
    });

    it('returns not_found when session does not exist', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue(null);
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      const result = await handler({ session_id: 's-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.session).toBeNull();
      expect(parsed.status).toBe('not_found');
    });

    it('returns not_found when convertSessionToInput returns null', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'learning' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.session).toBeNull();
      expect(parsed.status).toBe('not_found');
    });

    it('includes historical feedback for retrieval mode', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({ id: 's1', mode: 'retrieval' });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(makeSessionInput());
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      await handler({ session_id: 's1', context_token: 'ctx-test' });

      expect(ctx.convertSessionToInput).toHaveBeenCalledWith('s1', {
        includeHistoricalFeedback: true,
        historicalFeedbackLimit: 5,
      });
    });

    it('returns database error when ctx throws', async () => {
      ctx.getSessionById = vi.fn().mockRejectedValue(new Error('timeout'));
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns validation error for missing session_id', async () => {
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error for empty session_id', async () => {
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('get_session')!.handler;

      const result = await handler({ session_id: '' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // complete_session
  // ---------------------------------------------------------------
  describe('complete_session', () => {
    it('completes session with metrics', async () => {
      const now = Date.now();
      ctx.getSessionById = vi
        .fn()
        .mockResolvedValueOnce({
          id: 's1',
          mode: 'learning',
          status: 'active',
          startTime: now - 60000,
          endTime: null,
        })
        .mockResolvedValueOnce({
          id: 's1',
          mode: 'learning',
          status: 'completed',
          startTime: now - 60000,
          endTime: now,
        });
      ctx.completeSession = vi.fn().mockResolvedValue({ success: true });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue({
        ...makeSessionInput(),
        chunks: [
          {
            chunk_id: 'c1',
            session_chunk_id: 'sc-1',
            title: 'Arrays',
            status: 'completed',
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
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({
        session_id: 's1',
        feedback: 'Great session',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.session_id).toBe('s1');
      expect(parsed.status).toBe('completed');
      expect(parsed.final_metrics.chunks_completed).toBe(1);
      expect(parsed.final_metrics.average_quality).toBe(4);
      expect(parsed.message).toContain('with feedback');
    });

    it('returns already_completed for completed session', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({
        id: 's1',
        mode: 'learning',
        status: 'completed',
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('already_completed');
    });

    it('returns error when session not found', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue(null);
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({ session_id: 's-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.message).toContain('not found');
    });

    it('returns error when completeSession fails', async () => {
      ctx.getSessionById = vi.fn().mockResolvedValue({
        id: 's1',
        mode: 'learning',
        status: 'active',
      });
      ctx.completeSession = vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'concurrent modification' },
      });
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.message).toContain('concurrent modification');
    });

    it('returns database error when ctx throws', async () => {
      ctx.getSessionById = vi.fn().mockRejectedValue(new Error('connection lost'));
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns error for missing session_id', async () => {
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });

    it('returns zero metrics when convertSessionToInput returns null after completion', async () => {
      const now = Date.now();
      ctx.getSessionById = vi
        .fn()
        .mockResolvedValueOnce({
          id: 's1',
          mode: 'learning',
          status: 'active',
          startTime: now - 60000,
          endTime: null,
        })
        .mockResolvedValueOnce({
          id: 's1',
          mode: 'learning',
          status: 'completed',
          startTime: now - 60000,
          endTime: now,
        });
      ctx.completeSession = vi.fn().mockResolvedValue({ success: true });
      ctx.convertSessionToInput = vi.fn().mockResolvedValue(null);
      registerSessionLifecycleTools(server as any, ctx);
      const handler = server.tools.get('complete_session')!.handler;

      const result = await handler({ session_id: 's1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('completed');
      expect(parsed.final_metrics.chunks_completed).toBe(0);
      expect(parsed.final_metrics.average_quality).toBe(0);
    });
  });
});
