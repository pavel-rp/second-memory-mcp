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

  it('registers all 6 spaced repetition tools', () => {
    registerSpacedRepetitionTools(server as any, ctx);
    expect(server.tools.has('calculate_next_review')).toBe(true);
    expect(server.tools.has('calculate_priority_score')).toBe(true);
    expect(server.tools.has('calculate_next_review_advanced')).toBe(true);
    expect(server.tools.has('rank_candidates')).toBe(true);
    expect(server.tools.has('what_to_learn_today')).toBe(true);
    expect(server.tools.has('record_review_result')).toBe(true);
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
      });
      const parsed = parseResult(result);
      expect(parsed.interval).toBeGreaterThan(0);
      expect(parsed.repetitions).toBe(2);
      expect(parsed.ease_factor).toBeGreaterThan(0);
      expect(parsed.next_review).toBeDefined();
    });

    it('resets repetitions for quality < 3', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 1,
        repetitions: 5,
        ease_factor: 2.5,
        interval: 10,
      });
      const parsed = parseResult(result);
      expect(parsed.repetitions).toBe(0);
      expect(parsed.interval).toBe(1);
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
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
      expect(parsed.error.message).toContain('overflow');
    });

    it('returns computation error for missing required fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
    });

    it('returns computation error for ease_factor below minimum', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({ quality: 3, repetitions: 0, ease_factor: 1.0, interval: 1 });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
    });

    it('returns computation error for quality out of range', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({ quality: 6, repetitions: 0, ease_factor: 2.5, interval: 1 });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
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
      });
      const parsed = parseResult(result);
      expect(typeof parsed.priority).toBe('number');
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
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
      expect(parsed.error.message).toContain('NaN result');
    });

    it('returns computation error for missing fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_priority_score')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
    });

    it('returns computation error for difficulty out of range', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_priority_score')!.handler;
      const result = await handler({
        next_review_date: '2025-01-01',
        ease_factor: 2.5,
        repetitions: 0,
        difficulty: 11,
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
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
      });
      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('interval');
      expect(parsed).toHaveProperty('ease_factor');
      expect(parsed).toHaveProperty('next_review');
      expect(parsed).toHaveProperty('leech');
      // snake_case output, not camelCase
      expect(parsed).not.toHaveProperty('easeFactor');
      expect(parsed).not.toHaveProperty('nextReview');
    });

    it('works without optional fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;
      const result = await handler({
        quality: 4,
        repetitions: 2,
        ease_factor: 2.5,
        interval: 6,
      });
      const parsed = parseResult(result);
      expect(parsed.interval).toBeGreaterThan(0);
      expect(typeof parsed.ease_factor).toBe('number');
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
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
      expect(parsed.error.message).toContain('division by zero');
    });

    it('returns computation error for missing required fields', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
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
      });
      const parsed = parseResult(result);
      expect(parsed.orderedIds).toBeDefined();
      expect(Array.isArray(parsed.orderedIds)).toBe(true);
    });

    it('handles empty candidates array', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;
      const result = await handler({ candidates: [] });
      const parsed = parseResult(result);
      expect(parsed.orderedIds).toEqual([]);
    });

    it('returns computation error when context throws', async () => {
      ctx.rankCandidates = vi.fn().mockImplementation(() => {
        throw new Error('ranking failed');
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;

      const result = await handler({ candidates: [validCandidate] });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
      expect(parsed.error.message).toContain('ranking failed');
    });

    it('returns computation error for missing candidates field', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('rank_candidates')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
    });
  });

  // ---------------------------------------------------------------
  // what_to_learn_today
  // ---------------------------------------------------------------
  describe('what_to_learn_today', () => {
    const mockRecommendationOutput = {
      recommendations: [],
      sessionSummary: {
        totalItems: 0,
        totalDuration: 0,
        totalCognitiveLoad: 0,
        newItems: 0,
        reviewItems: 0,
        remediationItems: 0,
        subjects: [],
      },
      estimatedDuration: 0,
      rationale: 'No items available',
    };

    const validLearningItem = {
      id: 'chunk-1',
      title: 'Arrays',
      subject: 'CS',
      difficulty: 5,
      next_review_date: '2025-06-15',
      ease_factor: 2.5,
      repetitions: 1,
      estimated_duration: 10,
      chunk_type: 'review' as const,
    };

    it('generates recommendations with provided learning_items', async () => {
      ctx.generateRecommendations = vi.fn().mockResolvedValue(mockRecommendationOutput);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({
        learning_items: [validLearningItem],
      });
      const parsed = parseResult(result);

      expect(parsed.recommendations).toBeDefined();
      expect(parsed.rationale).toBe('No items available');
      expect(ctx.generateRecommendations).toHaveBeenCalledTimes(1);
    });

    it('fetches from database when fetch_from_database is true', async () => {
      const mockItems = [
        {
          id: 'db-1',
          title: 'Linked Lists',
          subject: 'CS',
          difficulty: 3,
          nextReviewDate: '2025-06-10',
          easeFactor: 2.5,
          repetitions: 2,
          estimatedDuration: 15,
          chunkType: 'review' as const,
        },
      ];
      ctx.listChunksAsLearningItems = vi.fn().mockResolvedValue(mockItems);
      ctx.generateRecommendations = vi.fn().mockResolvedValue(mockRecommendationOutput);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({
        fetch_from_database: true,
        subject_filter: 'CS',
        due_only: true,
        limit: 50,
      });
      const parsed = parseResult(result);

      expect(parsed.recommendations).toBeDefined();
      expect(ctx.listChunksAsLearningItems).toHaveBeenCalledWith({
        subjectFilter: 'CS',
        dueOnly: true,
        limit: 50,
      });
    });

    it('returns database error when listChunksAsLearningItems throws', async () => {
      ctx.listChunksAsLearningItems = vi.fn().mockRejectedValue(new Error('connection refused'));
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({ fetch_from_database: true });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('connection refused');
    });

    it('returns recommendation error when generateRecommendations throws', async () => {
      ctx.generateRecommendations = vi.fn().mockRejectedValue(new Error('engine crash'));
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({
        learning_items: [validLearningItem],
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('recommendation');
      expect(parsed.error.message).toContain('engine crash');
    });

    it('passes constraints through in camelCase', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockRecommendationOutput);
      ctx.generateRecommendations = mockGenerate;
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      await handler({
        learning_items: [validLearningItem],
        constraints: {
          max_duration: 30,
          max_cognitive_load: 7,
          max_new_items: 3,
          subject_filter: 'Math',
          exclude_ids: ['skip-1'],
        },
      });

      const call = mockGenerate.mock.calls[0][0];
      expect(call.constraints).toEqual({
        maxDuration: 30,
        maxCognitiveLoad: 7,
        maxNewItems: 3,
        subjectFilter: 'Math',
        excludeIds: ['skip-1'],
      });
    });

    it('passes user_history through in camelCase', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockRecommendationOutput);
      ctx.generateRecommendations = mockGenerate;
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      await handler({
        learning_items: [validLearningItem],
        user_history: {
          recent_sessions: [
            {
              date: '2025-06-14',
              duration: 30,
              items_completed: 5,
              average_quality: 4.0,
              cognitive_load: 6,
            },
          ],
          patterns: {
            average_session_duration: 25,
            preferred_difficulty: 5,
            success_rate: 0.8,
            fatigue_threshold: 8,
            subject_preferences: { CS: 0.9, Math: 0.7 },
            optimal_session_time: '09:00',
          },
        },
      });

      const call = mockGenerate.mock.calls[0][0];
      expect(call.userHistory.recentSessions[0].itemsCompleted).toBe(5);
      expect(call.userHistory.recentSessions[0].averageQuality).toBe(4.0);
      expect(call.userHistory.patterns.averageSessionDuration).toBe(25);
      expect(call.userHistory.patterns.preferredDifficulty).toBe(5);
      expect(call.userHistory.patterns.successRate).toBe(0.8);
      expect(call.userHistory.patterns.fatigueThreshold).toBe(8);
      expect(call.userHistory.patterns.subjectPreferences).toEqual({ CS: 0.9, Math: 0.7 });
      expect(call.userHistory.patterns.optimalSessionTime).toBe('09:00');
    });

    it('passes session_context through in camelCase', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockRecommendationOutput);
      ctx.generateRecommendations = mockGenerate;
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      await handler({
        learning_items: [validLearningItem],
        session_context: {
          current_session_id: 'sess-1',
          active_items: ['item-a'],
          session_start_time: 1000,
          last_activity: 2000,
          user_preferences: { theme: 'dark' },
          current_item_index: 2,
          current_recommendations: [
            {
              item: validLearningItem,
              priority: 10,
              reason: 'overdue',
              order: 1,
              cognitive_load: 5,
            },
          ],
        },
      });

      const call = mockGenerate.mock.calls[0][0];
      expect(call.sessionContext.currentSessionId).toBe('sess-1');
      expect(call.sessionContext.activeItems).toEqual(['item-a']);
      expect(call.sessionContext.sessionStartTime).toBe(1000);
      expect(call.sessionContext.lastActivity).toBe(2000);
      expect(call.sessionContext.currentItemIndex).toBe(2);
      expect(call.sessionContext.currentRecommendations[0].cognitiveLoad).toBe(5);
    });

    it('returns recommendation error when both fetch_from_database and learning_items provided', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({
        fetch_from_database: true,
        learning_items: [validLearningItem],
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('recommendation');
    });

    it('returns recommendation error when neither fetch_from_database nor learning_items provided', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      const result = await handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('recommendation');
    });

    it('uses empty array when fetchFromDatabase resolves and no items in DB', async () => {
      ctx.listChunksAsLearningItems = vi.fn().mockResolvedValue([]);
      ctx.generateRecommendations = vi.fn().mockResolvedValue(mockRecommendationOutput);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('what_to_learn_today')!.handler;

      await handler({ fetch_from_database: true });

      expect(ctx.generateRecommendations).toHaveBeenCalledWith(
        expect.objectContaining({ learningItems: [] })
      );
    });
  });

  // ---------------------------------------------------------------
  // record_review_result
  // ---------------------------------------------------------------
  describe('record_review_result', () => {
    it('returns success with updated learning item', async () => {
      ctx.processReviewResult = vi.fn().mockResolvedValue({
        success: true,
        data: { isLeech: false },
      });
      const mockChunk = {
        id: 'chunk-1',
        topicId: 'topic-1',
        title: 'Arrays',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: new Date('2025-06-20').getTime(),
        easeFactor: 2.6,
        repetitions: 3,
        lastReviewedAt: null,
        estimatedDuration: 10,
        intervalDays: 6,
        chunkType: 'review',
        prerequisitesJson: null,
        tagsJson: ['ds'],
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        topicTitle: 'Data Structures',
      };
      ctx.getChunkWithContent = vi.fn().mockResolvedValue(mockChunk);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;

      const result = await handler({
        item_id: 'chunk-1',
        quality: 4,
        time_spent_ms: 5000,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.is_leech).toBe(false);
      expect(parsed.item).toBeDefined();
      expect(parsed.item.id).toBe('chunk-1');
      expect(parsed.item.nextReviewDate).toBe('2025-06-20');
      expect(parsed.item.easeFactor).toBe(2.6);
      expect(typeof parsed.message).toBe('string');
    });

    it('returns leech message when item is a leech', async () => {
      ctx.processReviewResult = vi.fn().mockResolvedValue({
        success: true,
        data: { isLeech: true },
      });
      ctx.getChunkWithContent = vi.fn().mockResolvedValue(null);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;

      const result = await handler({
        item_id: 'chunk-leech',
        quality: 1,
        consecutive_failures: 5,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.is_leech).toBe(true);
      expect(parsed.item).toBeUndefined();
      expect(typeof parsed.message).toBe('string');
    });

    it('returns error when processReviewResult reports failure', async () => {
      ctx.processReviewResult = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;

      const result = await handler({
        item_id: 'missing-chunk',
        quality: 3,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
      expect(parsed.error.message).toBe('Chunk not found');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns retryable error when processReviewResult reports database failure', async () => {
      ctx.processReviewResult = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'database', message: 'deadlock detected' },
      });
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;

      const result = await handler({
        item_id: 'chunk-db',
        quality: 3,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });

    it('returns database error when processReviewResult throws', async () => {
      ctx.processReviewResult = vi.fn().mockRejectedValue(new Error('connection lost'));
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;

      const result = await handler({
        item_id: 'chunk-throw',
        quality: 3,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('connection lost');
    });

    it('passes optional fields through to context in camelCase', async () => {
      const mockProcess = vi.fn().mockResolvedValue({
        success: true,
        data: { isLeech: false },
      });
      ctx.processReviewResult = mockProcess;
      ctx.getChunkWithContent = vi.fn().mockResolvedValue(null);
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;

      await handler({
        item_id: 'chunk-1',
        quality: 4,
        time_spent_ms: 12000,
        consecutive_failures: 2,
        days_overdue: 3,
      });

      expect(mockProcess).toHaveBeenCalledWith('chunk-1', 4, {
        timeSpentMs: 12000,
        consecutiveFailures: 2,
        daysOverdue: 3,
      });
    });

    it('returns database error for missing item_id', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;
      const result = await handler({ quality: 3 });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });

    it('returns database error for empty item_id', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;
      const result = await handler({ item_id: '', quality: 3 });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });

    it('returns database error for quality out of range', async () => {
      registerSpacedRepetitionTools(server as any, ctx);
      const handler = server.tools.get('record_review_result')!.handler;
      const result = await handler({ item_id: 'chunk-1', quality: 6 });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });
  });
});
