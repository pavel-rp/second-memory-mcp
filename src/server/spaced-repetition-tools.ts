import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from '../algorithms/sr-calculator.js';
import {
  RecommendationInputSchema,
  RecommendationInputShape,
  type RecommendationInput,
} from '../types/recommendations.js';
import { mapChunkRowToLearningItem, listChunksAsLearningItems } from '../services/chunk-queries.js';
import { processReviewResult } from '../services/chunk-reviews.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';
import { createRecommendationEngine } from './shared-instances.js';
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
} from '../types/spaced-repetition-tools.js';

export function registerSpacedRepetitionTools(server: McpServer): void {
  server.registerTool(
    'calculate_next_review',
    {
      title: 'Calculate Next Review',
      description:
        'SM-2 style scheduler: returns next interval/repetitions/ease_factor/next_review',
      inputSchema: CalculateNextReviewInputShape,
    },
    async (rawInput: unknown) => {
      const { quality, repetitions, ease_factor, interval }: CalculateNextReviewInput =
        CalculateNextReviewInputSchema.parse(rawInput);
      const {
        interval: outInterval,
        repetitions: outReps,
        easeFactor,
        nextReview,
      } = calculateNextReview({
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
      const {
        next_review_date,
        ease_factor,
        repetitions,
        difficulty,
      }: CalculatePriorityScoreInput = CalculatePriorityScoreInputSchema.parse(rawInput);
      const { priority } = calculatePriorityScore({
        nextReviewDate: next_review_date,
        easeFactor: ease_factor,
        repetitions,
        difficulty,
      });
      return toolJson({ priority });
    }
  );

  server.registerTool(
    'calculate_next_review_advanced',
    {
      title: 'Calculate Next Review (Advanced)',
      description: 'Advanced scheduler with lapses/leech handling',
      inputSchema: CalculateNextReviewAdvancedInputShape,
    },
    async (rawInput: unknown) => {
      const {
        quality,
        repetitions,
        ease_factor,
        interval,
        days_overdue,
        consecutive_failures,
      }: CalculateNextReviewAdvancedInput = CalculateNextReviewAdvancedInputSchema.parse(rawInput);
      const out = calculateNextReviewAdvanced({
        quality,
        repetitions,
        easeFactor: ease_factor,
        interval,
        daysOverdue: days_overdue,
        consecutiveFailures: consecutive_failures,
      });
      return toolJson(out);
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
      const { candidates, timeboxMinutes }: RankCandidatesInput =
        RankCandidatesInputSchema.parse(rawInput);
      const mapped = candidates.map(c => ({
        id: c.id,
        nextReviewDate: c.next_review_date,
        easeFactor: c.ease_factor,
        repetitions: c.repetitions,
        difficulty: c.difficulty,
        tags: c.tags,
      }));
      const out = rankCandidatesWithConstraints({
        candidates: mapped,
        timeboxMinutes,
      });
      return toolJson(out);
    }
  );

  server.registerTool(
    'what_to_learn_today',
    {
      title: 'Get Learning Recommendations',
      description:
        "Generate intelligent learning recommendations based on spaced repetition priorities, available time, and preferences. RECOMMENDED: Use fetchFromDatabase: true to automatically fetch and recommend in one call - this is the primary and most convenient pattern. FILTERS: subjectFilter, dueOnly, and limit apply only when fetchFromDatabase: true. EXAMPLES: (1) Single-call pattern: {fetchFromDatabase: true, subjectFilter: 'Math', dueOnly: true} fetches due Math items and generates recommendations. (2) Legacy pattern: {learningItems: [...]} uses pre-fetched items (filters are ignored in this mode). Supports both guided 'teach me' mode and explicit parameter mode. The tool provides fast, local-first recommendations without external dependencies.",
      inputSchema: RecommendationInputShape,
    },
    async (input: unknown) => {
      try {
        const parsedInput: RecommendationInput = RecommendationInputSchema.parse(input);

        // Self-fetch mode: fetch from database
        let itemsToProcess = parsedInput.learningItems;
        if (parsedInput.fetchFromDatabase) {
          try {
            itemsToProcess = await listChunksAsLearningItems({
              subject: parsedInput.subjectFilter,
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
        const result = await createRecommendationEngine().generateRecommendations({
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
      const input: RecordReviewResultInput = RecordReviewResultInputSchema.parse(rawInput);
      try {
        const result = await processReviewResult(input.itemId, input.quality, {
          timeSpentMs: input.timeSpentMs,
          consecutiveFailures: input.consecutiveFailures,
          daysOverdue: input.daysOverdue,
        });

        const learningItem = mapChunkRowToLearningItem(result.chunk);

        return toolJson({
          success: true,
          item: learningItem,
          isLeech: result.isLeech,
          message: result.isLeech
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
