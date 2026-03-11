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
});
