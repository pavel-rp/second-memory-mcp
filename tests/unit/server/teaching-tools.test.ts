import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerTeachingTools } from '../../../src/server/teaching-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';
import { rubricForQuality } from '../../helpers/grading.js';

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
      action: 'teach',
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

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('teach');
    expect(parsed.data.chunk_id).toBe('c1');
    expect(parsed.data.instruction).toBe('Teach this concept...');
  });

  it('includes content_status in teach_next response', async () => {
    const teachResult = {
      action: 'teach',
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

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('teach');
    expect(parsed.data.content_status).toBe('draft');
  });

  it('teach_next includes workflow_hint on teach action', async () => {
    const teachResult = {
      action: 'teach',
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

    expect(parsed.status).toBe('ok');
    expect(parsed.data.workflow_hint).toBeDefined();
    expect(parsed.data.workflow_hint.action).toBe('USE_INLINE_SUBMIT');
    expect(parsed.data.workflow_hint.session_id).toBe('sess-1');
    expect(parsed.data.workflow_hint.chunk_id).toBe('c1');
    expect(parsed.data.workflow_hint.mode).toBe('learning');
    expect(parsed.data.workflow_hint.instruction).toContain('submit_answer');
    expect(parsed.data.workflow_hint.instruction).toContain('prompt_text');
    expect(parsed.data.workflow_hint.next_step).toContain('submit_answer');
    expect(parsed.data.workflow_hint.next_step).toContain('prompt_text');
  });

  it('teach_next workflow_hint uses tier-specific instruction for cued_recall approach', async () => {
    const teachResult = {
      action: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-2',
      chunk_index: 1,
      total_chunks: 2,
      mode: 'retrieval',
      instruction: 'Review this concept...',
      drill_format: 'explanation',
      content_status: 'active',
      teaching_approach: 'cued_recall',
      dominant_tier: 'cued_recall',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.workflow_hint.mode).toBe('retrieval');
    expect(parsed.data.workflow_hint.dominant_tier).toBe('cued_recall');
    expect(parsed.data.workflow_hint.instruction).toContain('graduated hints');
    expect(parsed.data.workflow_hint.instruction).toContain('Recall and Explain/Apply');
  });

  it('teach_next workflow_hint uses scaffold-specific guardrails', async () => {
    const teachResult = {
      action: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      chunk_index: 1,
      total_chunks: 1,
      mode: 'learning',
      instruction: 'Rebuild this concept...',
      drill_format: 'multiple_choice',
      content_status: 'final',
      teaching_approach: 'scaffold',
      dominant_tier: 'scaffold',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.workflow_hint.instruction).toContain('recognition questions');
    expect(parsed.data.workflow_hint.instruction).toContain('min 1 recognition + 1 Recall');
  });

  it('teach_next workflow_hint uses reteach-specific guardrails', async () => {
    const teachResult = {
      action: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      chunk_index: 1,
      total_chunks: 1,
      mode: 'learning',
      instruction: 'Reteach this concept...',
      drill_format: 'open_ended',
      content_status: 'final',
      teaching_approach: 'reteach',
      dominant_tier: 'reteach',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.workflow_hint.instruction).toContain('recall probe first');
    expect(parsed.data.workflow_hint.instruction).toContain('retrieval check');
    expect(parsed.data.workflow_hint.instruction).toContain('Level 1 only');
  });

  it('teach_next workflow_hint uses assessment-specific hint when mode is assessment', async () => {
    const teachResult = {
      action: 'teach',
      session_id: 'sess-1',
      chunk_id: 'c1',
      session_chunk_id: 'sc-1',
      chunk_index: 1,
      total_chunks: 2,
      mode: 'assessment',
      instruction: 'What is the relationship between A and B?',
      drill_format: 'open_ended',
      content_status: 'final',
      session_question_id: 'sq-42',
      assessment_chunk_ids: ['c1', 'c2'],
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.workflow_hint).toBeDefined();
    expect(parsed.data.workflow_hint.action).toBe('USE_SESSION_QUESTION_ID');
    expect(parsed.data.workflow_hint.mode).toBe('assessment');
    expect(parsed.data.workflow_hint.session_question_id).toBe('sq-42');
    expect(parsed.data.workflow_hint.instruction).toContain('verbatim');
    expect(parsed.data.workflow_hint.instruction).toContain('No retries');
    expect(parsed.data.workflow_hint.next_step).toContain('session_question_id');
    expect(parsed.data.workflow_hint.next_step).toContain('sq-42');
    expect(parsed.data.session_question_id).toBe('sq-42');
    expect(parsed.data.assessment_chunk_ids).toEqual(['c1', 'c2']);
  });

  it('teach_next omits workflow_hint on blocked action', async () => {
    const blockedResult = {
      action: 'blocked',
      message: 'Chunk not ready',
      current_chunk_id: 'c1',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(blockedResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('blocked');
    expect(parsed.data.workflow_hint).toBeUndefined();
  });

  it('teach_next omits workflow_hint on complete action', async () => {
    const completeResult = {
      action: 'complete',
      message: 'Session done',
      summary: { total: 3, passed_first_try: 2, needed_retry: 1, exhausted_retries: 0 },
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(completeResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('complete');
    expect(parsed.data.workflow_hint).toBeUndefined();
  });

  it('teach_next omits workflow_hint on error action', async () => {
    const errorResult = {
      action: 'error',
      message: 'No active session',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(errorResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('error');
    expect(parsed.data.workflow_hint).toBeUndefined();
  });

  it('returns structured error when orchestration throws', async () => {
    ctx.getNextTeachingStep = vi.fn().mockRejectedValue(new Error('DB connection lost'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('internal');
    expect(parsed.error.message).toContain('DB connection lost');
    expect(parsed.error.retryable).toBe(true);
  });

  it('registers submit_answer tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('submit_answer')).toBe(true);
  });

  it('submit_answer returns orchestration result as JSON on success (inline path)', async () => {
    const submitResult = {
      action: 'recorded',
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
    };
    ctx.submitAnswer = vi.fn().mockResolvedValue(submitResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'What is X?',
      chunk_ids: ['c1'],
      response: 'X is Y',
      grading: rubricForQuality(5),
      question_type: 'recall',
      feedback: 'Correct',
      time_spent_ms: 5000,
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('recorded');
    expect(parsed.data.session_question_id).toBe('sq-1');
    expect(parsed.data.quality).toBe(5);
    expect(parsed.data.chunk_id).toBe('c1');
  });

  it('submit_answer maps snake_case inline input to camelCase', async () => {
    ctx.submitAnswer = vi.fn().mockResolvedValue({ action: 'retry', attempt: 1 });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    await handler({
      prompt_text: 'Q',
      chunk_ids: ['c1'],
      response: 'A',
      grading: rubricForQuality(2),
      question_type: 'recall',
      feedback: 'Wrong',
      time_spent_ms: 3000,
      context_token: 'ctx-test',
    });

    expect(ctx.submitAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        promptText: 'Q',
        chunkIds: ['c1'],
        response: 'A',
        grading: rubricForQuality(2),
        questionType: 'recall',
        feedback: 'Wrong',
        timeSpentMs: 3000,
      })
    );
  });

  it('submit_answer returns validation error when neither inline nor retry fields provided', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      // Neither prompt_text+chunk_ids nor session_question_id
      response: 'A',
      grading: rubricForQuality(5),
      question_type: 'recall',
      feedback: 'OK',
      time_spent_ms: 1000,
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
  });

  it('submit_answer returns validation error for whitespace-only feedback', async () => {
    ctx.submitAnswer = vi.fn();
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'What is X?',
      chunk_ids: ['c1'],
      response: 'X is Y',
      grading: rubricForQuality(5),
      question_type: 'recall',
      feedback: '   ',
      time_spent_ms: 1000,
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
    expect(ctx.submitAnswer).not.toHaveBeenCalled();
  });

  it('submit_answer returns structured error when orchestration throws', async () => {
    ctx.submitAnswer = vi.fn().mockRejectedValue(new Error('Session expired'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'Q',
      chunk_ids: ['c1'],
      response: 'A',
      grading: rubricForQuality(5),
      question_type: 'recall',
      feedback: 'OK',
      time_spent_ms: 1000,
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('internal');
    expect(parsed.error.message).toContain('Session expired');
    expect(parsed.error.retryable).toBe(true);
  });

  // ── start_learning ──────────────────────────────────────────────

  it('registers start_learning tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('start_learning')).toBe(true);
  });

  it('start_learning returns toolData result on success', async () => {
    const startResult = {
      action: 'started',
      session_id: 'sess-1',
      mode: 'review',
      total_chunks: 3,
      estimated_duration: 15,
      first_chunk: { action: 'teach', chunk_id: 'c1' },
      recommendation_summary: 'Review overdue items',
    };
    ctx.startLearning = vi.fn().mockResolvedValue(startResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    const result = await handler({ context_token: 'ctx-test' });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('started');
    expect(parsed.data.session_id).toBe('sess-1');
    expect(parsed.data.first_chunk.action).toBe('teach');
  });

  it('start_learning maps snake_case input to camelCase', async () => {
    ctx.startLearning = vi.fn().mockResolvedValue({ action: 'nothing_due', message: 'None' });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    await handler({
      subject_filter: 'Math',
      context_token: 'ctx-test',
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

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
  });

  it('start_learning returns session error when orchestration throws', async () => {
    ctx.startLearning = vi.fn().mockRejectedValue(new Error('DB timeout'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('start_learning')!.handler;

    const result = await handler({ context_token: 'ctx-test' });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('internal');
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
      action: 'created',
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
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.session_id).toBe('sess-1');
    expect(parsed.data.question_ids).toEqual(['sq-1', 'sq-2']);
  });

  it('create_session_questions maps snake_case input to camelCase', async () => {
    ctx.createSessionQuestions = vi
      .fn()
      .mockResolvedValue({ action: 'created', sessionId: 'sess-1', questionIds: ['sq-1'] });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    await handler({
      session_id: 'sess-1',
      questions: [{ prompt_text: 'What is X?', chunk_ids: ['c1'] }],
      context_token: 'ctx-test',
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

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
  });

  it('create_session_questions returns non-retryable error for expected failures', async () => {
    ctx.createSessionQuestions = vi
      .fn()
      .mockResolvedValue({ action: 'error', message: 'Session chunk sc-1 not found.' });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('create_session_questions')!.handler;

    const result = await handler({
      session_id: 'sess-1',
      questions: [{ prompt_text: 'Q', chunk_ids: ['c1'] }],
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('internal');
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
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('internal');
    expect(parsed.error.message).toContain('DB connection lost');
    expect(parsed.error.retryable).toBe(true);
  });

  it('submit_answer accepts session_question_id for retry path', async () => {
    ctx.submitAnswer = vi.fn().mockResolvedValue({
      action: 'retry',
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
      grading: rubricForQuality(1),
      question_type: 'recall',
      feedback: 'Wrong',
      time_spent_ms: 3000,
      session_question_id: 'sq-1',
      context_token: 'ctx-test',
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
      grading: rubricForQuality(5),
      question_type: 'recall',
      feedback: 'OK',
      time_spent_ms: 1000,
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
  });

  it('teach_next inputSchema advertises context_token field', () => {
    registerTeachingTools(server as any, ctx);
    const spec = server.tools.get('teach_next')!.spec;
    expect(spec.inputSchema).toHaveProperty('context_token');
  });

  it('submit_answer rejects partial inline (prompt_text without chunk_ids)', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('submit_answer')!.handler;

    const result = await handler({
      prompt_text: 'Q',
      response: 'A',
      grading: rubricForQuality(5),
      question_type: 'recall',
      feedback: 'OK',
      time_spent_ms: 1000,
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
  });

  // ── revise_grade ─────────────────────────────────────────────

  it('registers revise_grade tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('revise_grade')).toBe(true);
  });

  it('revise_grade returns orchestration result as JSON on success', async () => {
    ctx.reviseGrade = vi.fn().mockResolvedValue({
      action: 'revised',
      revised_attempt: {
        attempt_id: 'a1',
        session_question_id: 'q1',
        attempt_number: 1,
        original_quality: 2,
        new_quality: 4,
        original_passed: false,
        new_passed: true,
      },
      revision_id: 'rev1',
      reason: 'agent_misread_prompt',
      roadblock_cancelled: false,
      note_id: 'n1',
    });
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('revise_grade')!.handler;

    const result = await handler({
      session_question_id: 'q1',
      grading: rubricForQuality(4),
      new_feedback: 'corrected',
      reason: 'agent_misread_prompt',
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.action).toBe('revised');
    expect(parsed.data.revision_id).toBe('rev1');
  });

  it('revise_grade returns validation error on bad input (invalid reason)', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('revise_grade')!.handler;

    const result = await handler({
      session_question_id: 'q1',
      grading: rubricForQuality(4),
      new_feedback: 'corrected',
      reason: 'not_a_real_reason',
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
  });

  it('revise_grade returns validation error on a grading payload missing a criterion', async () => {
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('revise_grade')!.handler;

    const result = await handler({
      session_question_id: 'q1',
      // criteria object is missing complexity_stated → Zod rejection (fail loudly).
      grading: {
        criteria: {
          correct_recurrence: true,
          correct_base_case: true,
          correct_iteration_order: true,
        },
        justifying_spans: {},
      },
      new_feedback: 'corrected',
      reason: 'other',
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
  });

  it('revise_grade returns validation error for whitespace-only new_feedback', async () => {
    ctx.reviseGrade = vi.fn();
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('revise_grade')!.handler;

    const result = await handler({
      session_question_id: 'q1',
      grading: rubricForQuality(4),
      new_feedback: '   ',
      reason: 'other',
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('validation');
    expect(parsed.error.retryable).toBe(false);
    expect(ctx.reviseGrade).not.toHaveBeenCalled();
  });

  it('revise_grade returns session error when orchestration throws', async () => {
    ctx.reviseGrade = vi.fn().mockRejectedValue(new Error('DB connection lost'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('revise_grade')!.handler;

    const result = await handler({
      session_question_id: 'q1',
      grading: rubricForQuality(4),
      new_feedback: 'corrected',
      reason: 'other',
      context_token: 'ctx-test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('error');
    expect(parsed.error.type).toBe('internal');
    expect(parsed.error.retryable).toBe(true);
  });
});
