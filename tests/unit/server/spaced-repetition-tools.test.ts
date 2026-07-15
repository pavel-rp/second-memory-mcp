import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerSpacedRepetitionTools } from '../../../src/server/spaced-repetition-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('spaced-repetition-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 7 spaced repetition tools', () => {
    registerSpacedRepetitionTools(server as any, ctx);
    expect(server.tools.has('calculate_next_review')).toBe(true);
    expect(server.tools.has('calculate_priority_score')).toBe(true);
    expect(server.tools.has('calculate_next_review_advanced')).toBe(true);
    expect(server.tools.has('rank_candidates')).toBe(true);
    expect(server.tools.has('what_to_learn_today')).toBe(true);
    expect(server.tools.has('get_leeches')).toBe(true);
    expect(server.tools.has('resolve_leech')).toBe(true);
  });

  // ---------------------------------------------------------------
  // calculate_next_review
  // ---------------------------------------------------------------
  describe('calculate_next_review', () => {
    it('returns next review schedule for quality >= 3', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 4,
        repetitions: 1,
        ease_factor: 2.5,
        interval: 1,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.interval).toBeGreaterThan(0);
      expect(parsed.data.repetitions).toBe(2);
      expect(parsed.data.ease_factor).toBeGreaterThan(0);
      expect(parsed.data.next_review).toBeDefined();
    });

    it('resets repetitions for quality < 3', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 1,
        repetitions: 5,
        ease_factor: 2.5,
        interval: 10,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.repetitions).toBe(0);
      // NEU-927: savings floor = round(0.2 × prior interval 10) = 2, not a 1d reset.
      expect(parsed.data.interval).toBe(2);
    });

    it('returns computation error when context throws', async () => {
      ctx.calculateNextReview = vi.fn().mockImplementation(() => {
        throw new Error('overflow');
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;

      const result = await handler({
        quality: 4,
        repetitions: 1,
        ease_factor: 2.5,
        interval: 1,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('overflow');
    });

    it('returns computation error for missing required fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });

    it('returns computation error for ease_factor below minimum', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 3,
        repetitions: 0,
        ease_factor: 1.0,
        interval: 1,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });

    it('returns computation error for quality out of range', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 6,
        repetitions: 0,
        ease_factor: 2.5,
        interval: 1,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });
  });

  // ---------------------------------------------------------------
  // calculate_priority_score
  // ---------------------------------------------------------------
  describe('calculate_priority_score', () => {
    it('returns a numeric priority score', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_priority_score')!.handler;
      const result = await handler({
        next_review_date: '2025-01-01',
        ease_factor: 2.5,
        repetitions: 3,
        difficulty: 5,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(typeof parsed.data.priority).toBe('number');
    });

    it('returns computation error when context throws', async () => {
      ctx.calculatePriorityScore = vi.fn().mockImplementation(() => {
        throw new Error('NaN result');
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_priority_score')!.handler;

      const result = await handler({
        next_review_date: '2025-01-01',
        ease_factor: 2.5,
        repetitions: 3,
        difficulty: 5,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('NaN result');
    });

    it('returns computation error for missing fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_priority_score')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });

    it('returns computation error for difficulty out of range', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_priority_score')!.handler;
      const result = await handler({
        next_review_date: '2025-01-01',
        ease_factor: 2.5,
        repetitions: 0,
        difficulty: 11,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });
  });

  // ---------------------------------------------------------------
  // calculate_next_review_advanced
  // ---------------------------------------------------------------
  describe('calculate_next_review_advanced', () => {
    it('returns advanced review data with leech flag', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;
      const result = await handler({
        quality: 1,
        repetitions: 5,
        ease_factor: 1.5,
        interval: 1,
        days_overdue: 0,
        consecutive_failures: 5,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data).toHaveProperty('interval');
      expect(parsed.data).toHaveProperty('ease_factor');
      expect(parsed.data).toHaveProperty('next_review');
      expect(parsed.data).toHaveProperty('leech');
      // snake_case output, not camelCase
      expect(parsed.data).not.toHaveProperty('easeFactor');
      expect(parsed.data).not.toHaveProperty('nextReview');
    });

    it('works without optional fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;
      const result = await handler({
        quality: 4,
        repetitions: 2,
        ease_factor: 2.5,
        interval: 6,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.interval).toBeGreaterThan(0);
      expect(typeof parsed.data.ease_factor).toBe('number');
    });

    it('returns computation error when context throws', async () => {
      ctx.calculateNextReviewAdvanced = vi.fn().mockImplementation(() => {
        throw new Error('division by zero');
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;

      const result = await handler({
        quality: 3,
        repetitions: 0,
        ease_factor: 2.5,
        interval: 1,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('division by zero');
    });

    it('returns computation error for missing required fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });
  });

  // ---------------------------------------------------------------
  // rank_candidates
  // ---------------------------------------------------------------
  describe('rank_candidates', () => {
    const validCandidate = {
      id: 'a',
      next_review_date: '2025-01-01',
      ease_factor: 2.5,
      repetitions: 1,
      difficulty: 5,
      tags: ['math'],
    };

    it('ranks candidates and returns orderedIds', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;
      const result = await handler({
        candidates: [
          validCandidate,
          {
            id: 'b',
            next_review_date: '2025-06-01',
            ease_factor: 3.0,
            repetitions: 10,
            difficulty: 2,
            tags: ['science'],
          },
        ],
        timebox_minutes: 60,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.ordered_ids).toBeDefined();
      expect(Array.isArray(parsed.data.ordered_ids)).toBe(true);
    });

    it('handles empty candidates array', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;
      const result = await handler({ candidates: [], context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.ordered_ids).toEqual([]);
    });

    it('returns computation error when context throws', async () => {
      ctx.rankCandidates = vi.fn().mockImplementation(() => {
        throw new Error('ranking failed');
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;

      const result = await handler({ candidates: [validCandidate], context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('ranking failed');
    });

    it('returns computation error for missing candidates field', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });
  });

  // ---------------------------------------------------------------
  // what_to_learn_today
  // ---------------------------------------------------------------
  describe('what_to_learn_today', () => {
    const mockTopicOutput = {
      recommendations: [
        {
          topicId: 'topic-1',
          topicTitle: 'Segment Trees',
          urgencyScore: 0.87,
          urgencyReason: '3 chunks overdue (max 5 days)',
          recommendationType: 'overdue_review' as const,
          dueChunkIds: ['c1', 'c2', 'c3'],
          dueChunkCount: 3,
          totalChunkCount: 8,
          estimatedDuration: 15,
          hasNewChunks: false,
        },
      ],
      totalDueTopics: 1,
      totalDueChunks: 3,
    };

    it('returns topic-level recommendations', async () => {
      ctx.generateRecommendations = vi.fn().mockResolvedValue(mockTopicOutput);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.recommendations).toHaveLength(1);
      expect(parsed.data.recommendations[0].topic_id).toBe('topic-1');
      expect(parsed.data.recommendations[0].urgency_score).toBe(0.87);
      expect(parsed.data.total_due_topics).toBe(1);
      expect(parsed.data.total_due_chunks).toBe(3);
    });

    it('passes subject_filter and limit to generateRecommendations', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockTopicOutput);
      ctx.generateRecommendations = mockGenerate;
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      await handler({ subject_filter: 'Math', limit: 5, context_token: 'ctx-test' });

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectFilter: 'Math',
          limit: 5,
        })
      );
    });

    it('returns recommendation error when generateRecommendations throws', async () => {
      ctx.generateRecommendations = vi.fn().mockRejectedValue(new Error('engine crash'));
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('engine crash');
    });

    it('accepts empty input (all optional)', async () => {
      ctx.generateRecommendations = vi.fn().mockResolvedValue(mockTopicOutput);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.recommendations).toBeDefined();
    });
  });

  // ---------------------------------------------------------------
  // get_leeches
  // ---------------------------------------------------------------
  describe('get_leeches', () => {
    it('returns leeches with count and message', async () => {
      const mockLeeches = [
        { id: 'l1', title: 'Leech A', subject: 'CS' },
        { id: 'l2', title: 'Leech B', subject: 'CS' },
      ];
      ctx.getLeeches = vi.fn().mockResolvedValue(mockLeeches);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('get_leeches')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.leeches).toHaveLength(2);
      expect(parsed.data.count).toBe(2);
      expect(parsed.data.message).toContain('2 leech items');
    });

    it('returns singular message for exactly 1 leech', async () => {
      ctx.getLeeches = vi.fn().mockResolvedValue([{ id: 'l1', title: 'Leech', subject: 'CS' }]);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('get_leeches')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.count).toBe(1);
      expect(parsed.data.message).toContain('1 leech item');
      expect(parsed.data.message).not.toContain('items');
    });

    it('returns empty message when no leeches', async () => {
      ctx.getLeeches = vi.fn().mockResolvedValue([]);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('get_leeches')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.leeches).toHaveLength(0);
      expect(parsed.data.count).toBe(0);
      expect(parsed.data.message).toContain('No leech items');
    });

    it('passes subject_filter and limit through as camelCase', async () => {
      const mockFn = vi.fn().mockResolvedValue([]);
      ctx.getLeeches = mockFn;
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('get_leeches')!.handler;

      await handler({ subject_filter: 'Math', limit: 5, context_token: 'ctx-test' });

      expect(mockFn).toHaveBeenCalledWith({ subjectFilter: 'Math', limit: 5 });
    });

    it('returns validation error for invalid input types', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('get_leeches')!.handler;

      const result = await handler({ limit: 'not-a-number' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns database error when ctx.getLeeches throws', async () => {
      ctx.getLeeches = vi.fn().mockRejectedValue(new Error('timeout'));
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('get_leeches')!.handler;

      const result = await handler({ context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('timeout');
    });
  });

  // ---------------------------------------------------------------
  // resolve_leech
  // ---------------------------------------------------------------
  describe('resolve_leech', () => {
    it('returns success with chunk_id and resolution', async () => {
      ctx.resolveLeech = vi.fn().mockResolvedValue({
        success: true,
        data: { chunkId: 'l1', resolution: 'reset_progress' },
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({
        chunk_id: 'l1',
        resolution: 'reset_progress',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('l1');
      expect(parsed.data.resolution).toBe('reset_progress');
      expect(parsed.data.message).toContain('reset_progress');
    });

    it('returns error when resolveLeech reports not_found', async () => {
      ctx.resolveLeech = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found: missing' },
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({
        chunk_id: 'missing',
        resolution: 'archive',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
      expect(parsed.error.message).toContain('not found');
    });

    it('returns error when resolveLeech reports validation failure', async () => {
      ctx.resolveLeech = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'validation', message: 'not a leech' },
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        resolution: 'mark_reviewed',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('validation');
    });

    it('returns database error when ctx.resolveLeech throws', async () => {
      ctx.resolveLeech = vi.fn().mockRejectedValue(new Error('connection reset'));
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({
        chunk_id: 'l1',
        resolution: 'archive',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('connection reset');
    });

    it('returns validation error for missing chunk_id', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({ resolution: 'archive' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error for empty chunk_id', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({ chunk_id: '', resolution: 'archive' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error for invalid resolution value', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('resolve_leech')!.handler;

      const result = await handler({ chunk_id: 'l1', resolution: 'invalid' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });
  });
});
