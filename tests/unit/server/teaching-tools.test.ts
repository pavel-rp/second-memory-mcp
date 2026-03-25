import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerTeachingTools } from '../../../src/server/teaching-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('teaching-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers teach_next tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('teach_next')).toBe(true);
  });

  it('returns orchestration result as JSON on success', async () => {
    const teachResult = {
      status: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      chunk_index: 1,
      total_chunks: 3,
      mode: 'learning',
      instruction: 'Teach this concept...',
      drill_format: 'explanation',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('teach');
    expect(parsed.chunk_id).toBe('c1');
    expect(parsed.instruction).toBe('Teach this concept...');
  });

  it('includes content_status in teach_next response', async () => {
    const teachResult = {
      status: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      chunk_index: 1,
      total_chunks: 3,
      mode: 'learning',
      instruction: 'Teach this concept...',
      drill_format: 'explanation',
      content_status: 'draft',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('teach');
    expect(parsed.content_status).toBe('draft');
  });

  it('teach_next includes workflow_hint on teach status', async () => {
    const teachResult = {
      status: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      chunk_index: 1,
      total_chunks: 3,
      mode: 'learning',
      instruction: 'Teach this concept...',
      drill_format: 'explanation',
      content_status: 'active',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.workflow_hint).toBeDefined();
    expect(parsed.workflow_hint.action).toBe('USE_INLINE_SUBMIT');
    expect(parsed.workflow_hint.session_id).toBe('sess-1');
    expect(parsed.workflow_hint.chunk_id).toBe('c1');
    expect(parsed.workflow_hint.mode).toBe('learning');
    expect(parsed.workflow_hint.instruction).toContain('submit_answer');
    expect(parsed.workflow_hint.instruction).toContain('prompt_text');
    expect(parsed.workflow_hint.next_step).toContain('submit_answer');
    expect(parsed.workflow_hint.next_step).toContain('prompt_text');
  });

  it('teach_next workflow_hint uses retrieval instruction for retrieval mode', async () => {
    const teachResult = {
      status: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-2',
      chunk_index: 1,
      total_chunks: 2,
      mode: 'retrieval',
      instruction: 'Review this concept...',
      drill_format: 'explanation',
      content_status: 'active',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.workflow_hint.mode).toBe('retrieval');
    expect(parsed.workflow_hint.instruction).toContain('For retrieval mode');
    expect(parsed.workflow_hint.instruction).toContain('1 targeted recall question');
  });

  it('teach_next omits workflow_hint on blocked status', async () => {
    const blockedResult = {
      status: 'blocked',
      message: 'Chunk not ready',
      current_chunk_id: 'c1',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(blockedResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('blocked');
    expect(parsed.workflow_hint).toBeUndefined();
  });

  it('teach_next omits workflow_hint on complete status', async () => {
    const completeResult = {
      status: 'complete',
      message: 'Session done',
      summary: { total: 3, passed_first_try: 2, needed_retry: 1, exhausted_retries: 0 },
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(completeResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('complete');
    expect(parsed.workflow_hint).toBeUndefined();
  });

  it('teach_next omits workflow_hint on error status', async () => {
    const errorResult = {
      status: 'error',
      message: 'No active session',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(errorResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.workflow_hint).toBeUndefined();
  });

  it('returns structured error when orchestration throws', async () => {
    ctx.getNextTeachingStep = vi.fn().mockRejectedValue(new Error('DB connection lost'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('DB connection lost');
    expect(parsed.error.retryable).toBe(true);
  });

  it('registers submit_answer tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('submit_answer')).toBe(true);
  });

  it('submit_answer returns orchestration result as JSON on success (inline path)', async () => {
    const submitResult = {
      status: 'recorded',
      session_question_id: 'sq-1',
      attempt: 1,
      passed: true,
      quality: 5,
      chunk_id: 'c1',
      review_update: {
        next_review_date: '2026-03-12',
        interval_days: 1,
        ease_factor: 2.6,
        is_leech: false,
      },
      next: { status: 'teach', chunk_id: 'c2' },
      reflect: 'test reflect prompt',
    };
    ctx.submitAnswer = vi.fn().mockResolvedValue(submitResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'What is X?',
      chunk_ids: ['c1'],
      response: 'X is Y',
      passed: true,
      feedback: 'Correct',
      time_spent_ms: 5000,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('recorded');
    expect(parsed.session_question_id).toBe('sq-1');
    expect(parsed.quality).toBe(5);
    expect(parsed.chunk_id).toBe('c1');
    expect(parsed.next.status).toBe('teach');
  });

  it('submit_answer maps snake_case inline input to camelCase', async () => {
    ctx.submitAnswer = vi.fn().mockResolvedValue({ status: 'retry', attempt: 1 });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    await handler({
      prompt_text: 'Q',
      chunk_ids: ['c1'],
      response: 'A',
      passed: false,
      feedback: 'Wrong',
      time_spent_ms: 3000,
    });

    expect(ctx.submitAnswer).toHaveBeenCalledWith({
      promptText: 'Q',
      chunkIds: ['c1'],
      response: 'A',
      passed: false,
      feedback: 'Wrong',
      timeSpentMs: 3000,
    });
  });

  it('submit_answer returns validation error when neither inline nor retry fields provided', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      // Neither prompt_text+chunk_ids nor session_question_id
      response: 'A',
      passed: true,
      feedback: 'OK',
      time_spent_ms: 1000,
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
  });

  it('submit_answer returns structured error when orchestration throws', async () => {
    ctx.submitAnswer = vi.fn().mockRejectedValue(new Error('Session expired'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'Q',
      chunk_ids: ['c1'],
      response: 'A',
      passed: true,
      feedback: 'OK',
      time_spent_ms: 1000,
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('Session expired');
    expect(parsed.error.retryable).toBe(true);
  });

  // ── start_learning ──────────────────────────────────────────────

  it('registers start_learning tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('start_learning')).toBe(true);
  });

  it('start_learning returns toolJson result on success', async () => {
    const startResult = {
      status: 'started',
      session_id: 'sess-1',
      mode: 'review',
      total_chunks: 3,
      estimated_duration: 15,
      first_chunk: { status: 'teach', chunk_id: 'c1' },
      recommendation_summary: 'Review overdue items',
    };
    ctx.startLearning = vi.fn().mockResolvedValue(startResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('started');
    expect(parsed.session_id).toBe('sess-1');
    expect(parsed.first_chunk.status).toBe('teach');
  });

  it('start_learning maps snake_case input to camelCase', async () => {
    ctx.startLearning = vi.fn().mockResolvedValue({ status: 'nothing_due', message: 'None' });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    await handler({
      subject_filter: 'Math',
    });

    expect(ctx.startLearning).toHaveBeenCalledWith({
      subjectFilter: 'Math',
    });
  });

  it('start_learning returns validation error for invalid input', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    const result = await handler({ subject_filter: 42 });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
  });

  it('start_learning returns session error when orchestration throws', async () => {
    ctx.startLearning = vi.fn().mockRejectedValue(new Error('DB timeout'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('DB timeout');
    expect(parsed.error.retryable).toBe(true);
  });

  // ── create_session_questions ──────────────────────────────────

  it('registers create_session_questions tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('create_session_questions')).toBe(true);
  });

  it('create_session_questions returns orchestration result on success', async () => {
    const createResult = {
      status: 'created',
      sessionId: 'sess-1',
      questionIds: ['sq-1', 'sq-2'],
    };
    ctx.createSessionQuestions = vi.fn().mockResolvedValue(createResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_id: 'sess-1',
      questions: [
        { prompt_text: 'What is X?', chunk_ids: ['c1'] },
        { prompt_text: 'Explain Y', chunk_ids: ['c1'] },
      ],
    });
    const parsed = parseResult(result);

    expect(parsed.session_id).toBe('sess-1');
    expect(parsed.question_ids).toEqual(['sq-1', 'sq-2']);
  });

  it('create_session_questions maps snake_case input to camelCase', async () => {
    ctx.createSessionQuestions = vi
      .fn()
      .mockResolvedValue({ status: 'created', sessionId: 'sess-1', questionIds: ['sq-1'] });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    await handler({
      session_id: 'sess-1',
      questions: [{ prompt_text: 'What is X?', chunk_ids: ['c1'] }],
    });

    expect(ctx.createSessionQuestions).toHaveBeenCalledWith({
      sessionId: 'sess-1',
      questions: [{ promptText: 'What is X?', chunkIds: ['c1'] }],
    });
  });

  it('create_session_questions returns validation error for invalid input', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_id: '', // min(1) violation
      questions: [],
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
  });

  it('create_session_questions returns non-retryable error for expected failures', async () => {
    ctx.createSessionQuestions = vi
      .fn()
      .mockResolvedValue({ status: 'error', message: 'Session chunk sc-1 not found.' });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_id: 'sess-1',
      questions: [{ prompt_text: 'Q', chunk_ids: ['c1'] }],
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('not found');
    expect(parsed.error.retryable).toBe(false);
  });

  it('create_session_questions returns retryable error for unexpected throws', async () => {
    ctx.createSessionQuestions = vi.fn().mockRejectedValue(new Error('DB connection lost'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_id: 'sess-1',
      questions: [{ prompt_text: 'Q', chunk_ids: ['c1'] }],
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('DB connection lost');
    expect(parsed.error.retryable).toBe(true);
  });

  it('submit_answer accepts session_question_id for retry path', async () => {
    ctx.submitAnswer = vi.fn().mockResolvedValue({
      status: 'retry',
      session_question_id: 'sq-1',
      attempt: 1,
      chunk_id: 'c1',
      message: 'Try again',
      feedback: 'Wrong',
    });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    await handler({
      response: 'A',
      passed: false,
      feedback: 'Wrong',
      time_spent_ms: 3000,
      session_question_id: 'sq-1',
    });

    expect(ctx.submitAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionQuestionId: 'sq-1',
      })
    );
  });

  it('submit_answer rejects when both inline and retry fields provided', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'Q',
      chunk_ids: ['c1'],
      session_question_id: 'sq-1',
      response: 'A',
      passed: true,
      feedback: 'OK',
      time_spent_ms: 1000,
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
  });

  it('submit_answer rejects partial inline (prompt_text without chunk_ids)', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'Q',
      response: 'A',
      passed: true,
      feedback: 'OK',
      time_spent_ms: 1000,
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
  });
});
