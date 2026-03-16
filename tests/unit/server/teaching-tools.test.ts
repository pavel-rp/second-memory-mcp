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
      chunk_id: 'c1',
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

  it('submit_answer returns orchestration result as JSON on success', async () => {
    const submitResult = {
      status: 'recorded',
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
    };
    ctx.submitAnswer = vi.fn().mockResolvedValue(submitResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      question: 'What is X?',
      response: 'X is Y',
      passed: true,
      feedback: 'Correct',
      time_spent_ms: 5000,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('recorded');
    expect(parsed.quality).toBe(5);
    expect(parsed.chunk_id).toBe('c1');
    expect(parsed.next.status).toBe('teach');
  });

  it('submit_answer maps snake_case input to camelCase', async () => {
    ctx.submitAnswer = vi.fn().mockResolvedValue({ status: 'retry', attempt: 1 });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    await handler({
      question: 'Q',
      response: 'A',
      passed: false,
      feedback: 'Wrong',
      time_spent_ms: 3000,
    });

    expect(ctx.submitAnswer).toHaveBeenCalledWith({
      question: 'Q',
      response: 'A',
      passed: false,
      feedback: 'Wrong',
      timeSpentMs: 3000,
    });
  });

  it('submit_answer returns validation error for invalid input', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      question: '', // min(1) violation
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
      question: 'Q',
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
      time_available: 20,
      mode: 'review',
    });

    expect(ctx.startLearning).toHaveBeenCalledWith({
      subjectFilter: 'Math',
      timeAvailable: 20,
      mode: 'review',
    });
  });

  it('start_learning returns validation error for invalid input', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    const result = await handler({ mode: 'invalid_mode' });
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
      sessionChunkId: 'sc-1',
      questionIds: ['sq-1', 'sq-2'],
    };
    ctx.createSessionQuestions = vi.fn().mockResolvedValue(createResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_chunk_id: 'sc-1',
      questions: [{ prompt_text: 'What is X?' }, { prompt_text: 'Explain Y' }],
    });
    const parsed = parseResult(result);

    expect(parsed.session_chunk_id).toBe('sc-1');
    expect(parsed.question_ids).toEqual(['sq-1', 'sq-2']);
  });

  it('create_session_questions maps snake_case input to camelCase', async () => {
    ctx.createSessionQuestions = vi
      .fn()
      .mockResolvedValue({ status: 'created', sessionChunkId: 'sc-1', questionIds: ['sq-1'] });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    await handler({
      session_chunk_id: 'sc-1',
      questions: [{ prompt_text: 'What is X?' }],
    });

    expect(ctx.createSessionQuestions).toHaveBeenCalledWith({
      sessionChunkId: 'sc-1',
      questions: [{ promptText: 'What is X?' }],
    });
  });

  it('create_session_questions returns validation error for invalid input', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_chunk_id: '', // min(1) violation
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
      session_chunk_id: 'sc-1',
      questions: [{ prompt_text: 'Q' }],
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
      session_chunk_id: 'sc-1',
      questions: [{ prompt_text: 'Q' }],
    });
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('DB connection lost');
    expect(parsed.error.retryable).toBe(true);
  });

  it('submit_answer accepts optional session_question_id', async () => {
    ctx.submitAnswer = vi.fn().mockResolvedValue({
      status: 'retry',
      attempt: 1,
      chunk_id: 'c1',
      message: 'Try again',
      feedback: 'Wrong',
    });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    await handler({
      question: 'Q',
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
});
