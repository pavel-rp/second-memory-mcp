import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  RecommendationInputSchema,
  RecommendationInputShape,
} from '../domain/types/recommendations.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';
import {
  CalculateNextReviewInputSchema,
  CalculateNextReviewInputShape,
  CalculatePriorityScoreInputSchema,
  CalculatePriorityScoreInputShape,
  CalculateNextReviewAdvancedInputSchema,
  CalculateNextReviewAdvancedInputShape,
  RankCandidatesInputSchema,
  RankCandidatesInputShape,
  RecordReviewResultInputSchema,
  RecordReviewResultInputShape,
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
        const { quality, repetitions, easeFactor, interval } =
          CalculateNextReviewInputSchema.parse(rawInput);
        const result = ctx.calculateNextReview({ quality, repetitions, easeFactor, interval });

        return toolJson(
          toSnakeCase({
            interval: result.interval,
            repetitions: result.repetitions,
            easeFactor: Number(result.easeFactor.toFixed(3)),
            nextReview: result.nextReview,
          })
        );
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
        const { nextReviewDate, easeFactor, repetitions, difficulty } =
          CalculatePriorityScoreInputSchema.parse(rawInput);
        const { priority } = ctx.calculatePriorityScore({
          nextReviewDate,
          easeFactor,
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
        const { quality, repetitions, easeFactor, interval, daysOverdue, consecutiveFailures } =
          CalculateNextReviewAdvancedInputSchema.parse(rawInput);
        const result = ctx.calculateNextReviewAdvanced({
          quality,
          repetitions,
          easeFactor,
          interval,
          daysOverdue,
          consecutiveFailures,
        });

        return toolJson(
          toSnakeCase({
            interval: result.interval,
            repetitions: result.repetitions,
            easeFactor: Number(result.easeFactor.toFixed(3)),
            nextReview: result.nextReview,
            leech: result.leech,
          })
        );
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
        const { candidates, timeboxMinutes } = RankCandidatesInputSchema.parse(rawInput);
        const out = ctx.rankCandidates({ candidates, timeboxMinutes });
        return toolJson(toSnakeCase(out));
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

        // Self-fetch mode: fetch from database
        let itemsToProcess = parsed.learningItems;
        if (parsed.fetchFromDatabase) {
          try {
            itemsToProcess = await ctx.listChunksAsLearningItems({
              subjectFilter: parsed.subjectFilter,
              dueOnly: parsed.dueOnly,
              limit: parsed.limit,
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
          ...parsed,
          learningItems: itemsToProcess ?? [],
        });
        return toolJson(toSnakeCase(result));
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
        const input = RecordReviewResultInputSchema.parse(rawInput);
        const result = await ctx.processReviewResult(input.itemId, input.quality, {
          timeSpentMs: input.timeSpentMs,
          consecutiveFailures: input.consecutiveFailures,
          daysOverdue: input.daysOverdue,
        });

        if (!result.success) {
          return toolError(`Failed to record review result: ${result.error.message}`, {
            type: result.error.type,
            message: result.error.message,
            retryable: result.error.type === 'database',
          });
        }

        // Fetch updated chunk to return as learning item
        const updatedChunk = await ctx.getChunkWithContent(input.itemId);
        const learningItem = updatedChunk ? ctx.mapChunkRowToLearningItem(updatedChunk) : undefined;

        return toolJson(
          toSnakeCase({
            success: true,
            item: learningItem,
            isLeech: result.data.isLeech,
            message: result.data.isLeech
              ? 'Item marked as leech due to consecutive failures'
              : 'Review result recorded successfully',
          })
        );
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
