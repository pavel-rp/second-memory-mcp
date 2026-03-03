import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  RecommendationInputSchema,
  RecommendationInputShape,
  type RecommendationInput,
} from '../domain/types/recommendations.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';
import {
  CalculateNextReviewInputSchema,
  CalculateNextReviewInputShape,
  type CalculateNextReviewInput,
  CalculatePriorityScoreInputSchema,
  CalculatePriorityScoreInputShape,
  type CalculatePriorityScoreInput,
  CalculateNextReviewAdvancedInputSchema,
  CalculateNextReviewAdvancedInputShape,
  type CalculateNextReviewAdvancedInput,
  RankCandidatesInputSchema,
  RankCandidatesInputShape,
  type RankCandidatesInput,
  RecordReviewResultInputSchema,
  RecordReviewResultInputShape,
  type RecordReviewResultInput,
} from '../domain/types/spaced-repetition-tools.js';

export function registerSpacedRepetitionTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'calculate_next_review',
    {
      title: 'Calculate Next Review',
      description:
        'SM-2 style scheduler: returns next interval/repetitions/ease_factor/next_review',
      inputSchema: CalculateNextReviewInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { quality, repetitions, ease_factor, interval }: CalculateNextReviewInput =
          CalculateNextReviewInputSchema.parse(rawInput);
        const {
          interval: outInterval,
          repetitions: outReps,
          easeFactor,
          nextReview,
        } = ctx.calculateNextReview({
          quality,
          repetitions,
          easeFactor: ease_factor,
          interval,
        });

        const result = {
          interval: outInterval,
          repetitions: outReps,
          ease_factor: Number(easeFactor.toFixed(3)),
          next_review: nextReview,
        };
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to calculate next review: ${msg}`, {
          type: 'computation',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'calculate_priority_score',
    {
      title: 'Calculate Priority Score',
      description:
        'Rank review priority using next_review_date, ease_factor, repetitions, difficulty',
      inputSchema: CalculatePriorityScoreInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const {
          next_review_date,
          ease_factor,
          repetitions,
          difficulty,
        }: CalculatePriorityScoreInput = CalculatePriorityScoreInputSchema.parse(rawInput);
        const { priority } = ctx.calculatePriorityScore({
          nextReviewDate: next_review_date,
          easeFactor: ease_factor,
          repetitions,
          difficulty,
        });
        return toolJson({ priority });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to calculate priority score: ${msg}`, {
          type: 'computation',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'calculate_next_review_advanced',
    {
      title: 'Calculate Next Review (Advanced)',
      description:
        'Advanced scheduler with lapses/leech handling. Returns { interval, repetitions, ease_factor, next_review, leech }.',
      inputSchema: CalculateNextReviewAdvancedInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const {
          quality,
          repetitions,
          ease_factor,
          interval,
          days_overdue,
          consecutive_failures,
        }: CalculateNextReviewAdvancedInput =
          CalculateNextReviewAdvancedInputSchema.parse(rawInput);
        const {
          interval: outInterval,
          repetitions: outReps,
          easeFactor,
          nextReview,
          leech,
        } = ctx.calculateNextReviewAdvanced({
          quality,
          repetitions,
          easeFactor: ease_factor,
          interval,
          daysOverdue: days_overdue,
          consecutiveFailures: consecutive_failures,
        });

        const result = {
          interval: outInterval,
          repetitions: outReps,
          ease_factor: Number(easeFactor.toFixed(3)),
          next_review: nextReview,
          leech,
        };
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to calculate advanced review: ${msg}`, {
          type: 'computation',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'rank_candidates',
    {
      title: 'Rank Candidates',
      description: 'Rank learning items using priority, tag weights, and daily caps',
      inputSchema: RankCandidatesInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { candidates, timebox_minutes }: RankCandidatesInput =
          RankCandidatesInputSchema.parse(rawInput);
        const mapped = candidates.map(c => ({
          id: c.id,
          nextReviewDate: c.next_review_date,
          easeFactor: c.ease_factor,
          repetitions: c.repetitions,
          difficulty: c.difficulty,
          tags: c.tags,
          estimatedDuration: c.estimated_duration,
        }));
        const out = ctx.rankCandidates({
          candidates: mapped,
          timeboxMinutes: timebox_minutes,
        });
        return toolJson(out);
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to rank candidates: ${msg}`, {
          type: 'computation',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'what_to_learn_today',
    {
      title: 'Get Learning Recommendations',
      description:
        "Generate intelligent learning recommendations based on spaced repetition priorities, available time, and preferences. RECOMMENDED: Use fetch_from_database: true to automatically fetch and recommend in one call - this is the primary and most convenient pattern. FILTERS: subject_filter, due_only, and limit apply only when fetch_from_database: true. EXAMPLES: (1) Single-call pattern: {fetch_from_database: true, subject_filter: 'Math', due_only: true} fetches due Math items and generates recommendations. (2) Legacy pattern: {learning_items: [...]} uses pre-fetched items (filters are ignored in this mode). Supports both guided 'teach me' mode and explicit parameter mode. The tool provides fast, local-first recommendations without external dependencies.",
      inputSchema: RecommendationInputShape,
    },
    async (input: unknown) => {
      try {
        const parsed = RecommendationInputSchema.parse(input);

        // Map snake_case MCP input to camelCase internal type
        const parsedInput: RecommendationInput = {
          mode: parsed.mode,
          timeAvailable: parsed.time_available,
          subjectPreference: parsed.subject_preference,
          learningItems: parsed.learning_items?.map(item => ({
            id: item.id,
            title: item.title,
            subject: item.subject,
            difficulty: item.difficulty,
            nextReviewDate: item.next_review_date,
            easeFactor: item.ease_factor,
            repetitions: item.repetitions,
            lastReviewed: item.last_reviewed,
            estimatedDuration: item.estimated_duration,
            chunkType: item.chunk_type,
            prerequisites: item.prerequisites,
            tags: item.tags,
            topicId: item.topic_id,
            topicTitle: item.topic_title,
          })),
          fetchFromDatabase: parsed.fetch_from_database,
          subjectFilter: parsed.subject_filter,
          dueOnly: parsed.due_only,
          limit: parsed.limit,
          constraints: parsed.constraints
            ? {
                maxDuration: parsed.constraints.max_duration,
                maxCognitiveLoad: parsed.constraints.max_cognitive_load,
                maxNewItems: parsed.constraints.max_new_items,
                subjectFilter: parsed.constraints.subject_filter,
                excludeIds: parsed.constraints.exclude_ids,
              }
            : undefined,
          userHistory: parsed.user_history
            ? {
                recentSessions: parsed.user_history.recent_sessions.map(s => ({
                  date: s.date,
                  duration: s.duration,
                  itemsCompleted: s.items_completed,
                  averageQuality: s.average_quality,
                  cognitiveLoad: s.cognitive_load,
                })),
                patterns: {
                  averageSessionDuration: parsed.user_history.patterns.average_session_duration,
                  preferredDifficulty: parsed.user_history.patterns.preferred_difficulty,
                  successRate: parsed.user_history.patterns.success_rate,
                  fatigueThreshold: parsed.user_history.patterns.fatigue_threshold,
                  subjectPreferences: parsed.user_history.patterns.subject_preferences,
                  optimalSessionTime: parsed.user_history.patterns.optimal_session_time,
                },
              }
            : undefined,
          sessionContext: parsed.session_context
            ? {
                currentSessionId: parsed.session_context.current_session_id,
                activeItems: parsed.session_context.active_items,
                sessionStartTime: parsed.session_context.session_start_time,
                lastActivity: parsed.session_context.last_activity,
                userPreferences: parsed.session_context.user_preferences,
                currentRecommendations: parsed.session_context.current_recommendations?.map(r => ({
                  item: {
                    id: r.item.id,
                    title: r.item.title,
                    subject: r.item.subject,
                    difficulty: r.item.difficulty,
                    nextReviewDate: r.item.next_review_date,
                    easeFactor: r.item.ease_factor,
                    repetitions: r.item.repetitions,
                    lastReviewed: r.item.last_reviewed,
                    estimatedDuration: r.item.estimated_duration,
                    chunkType: r.item.chunk_type,
                    prerequisites: r.item.prerequisites,
                    tags: r.item.tags,
                    topicId: r.item.topic_id,
                    topicTitle: r.item.topic_title,
                  },
                  priority: r.priority,
                  reason: r.reason,
                  order: r.order,
                  cognitiveLoad: r.cognitive_load,
                })),
                currentItemIndex: parsed.session_context.current_item_index,
              }
            : undefined,
        };

        // Self-fetch mode: fetch from database
        let itemsToProcess = parsedInput.learningItems;
        if (parsedInput.fetchFromDatabase) {
          try {
            itemsToProcess = await ctx.listChunksAsLearningItems({
              subjectFilter: parsedInput.subjectFilter,
              dueOnly: parsedInput.dueOnly,
              limit: parsedInput.limit,
            });
          } catch (dbError) {
            const msg = extractErrorMessage(dbError);
            return toolError(`Failed to fetch learning items from database: ${msg}`, {
              type: 'database',
              message: msg,
              retryable: true,
            });
          }
        }

        // Generate recommendations with fetched or provided items
        const result = await ctx.generateRecommendations({
          ...parsedInput,
          learningItems: itemsToProcess ?? [],
        });
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to generate recommendations: ${msg}`, {
          type: 'recommendation',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'record_review_result',
    {
      title: 'Record Review Result',
      description:
        'Record study results with SM-2 algorithm integration and leech detection. Updates ease factor, repetitions, and next review date.',
      inputSchema: RecordReviewResultInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const input: RecordReviewResultInput = RecordReviewResultInputSchema.parse(rawInput);
        const result = await ctx.processReviewResult(input.item_id, input.quality, {
          timeSpentMs: input.time_spent_ms,
          consecutiveFailures: input.consecutive_failures,
          daysOverdue: input.days_overdue,
        });

        if (!result.success) {
          return toolError(`Failed to record review result: ${result.error.message}`, {
            type: result.error.type,
            message: result.error.message,
            retryable: result.error.type === 'database',
          });
        }

        // Fetch updated chunk to return as learning item
        const updatedChunk = await ctx.getChunkWithContent(input.item_id);
        const learningItem = updatedChunk ? ctx.mapChunkRowToLearningItem(updatedChunk) : undefined;

        return toolJson({
          success: true,
          item: learningItem,
          is_leech: result.data.isLeech,
          message: result.data.isLeech
            ? 'Item marked as leech due to consecutive failures'
            : 'Review result recorded successfully',
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to record review result: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
