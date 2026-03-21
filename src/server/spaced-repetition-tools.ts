import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  RecommendationInputSchema,
  RecommendationInputShape,
} from '../domain/types/recommendations.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { ZodError } from 'zod';
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
  GetLeechesInputSchema,
  GetLeechesInputShape,
  ResolveLeechInputSchema,
  ResolveLeechInputShape,
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
      title: 'Get Topic Recommendations',
      description:
        'Returns topic-level recommendations ranked by urgency. Each topic includes urgency_score, urgency_reason, due_chunk_ids, estimated_duration, and has_new_chunks. ' +
        'Canonical flow: (1) call this tool to get ranked topics, (2) present options to user, (3) user picks a topic, (4) call create_session with mode and the due_chunk_ids array. ' +
        'For quick-start without topic selection, use start_learning instead.',
      inputSchema: RecommendationInputShape,
    },
    async (input: unknown) => {
      try {
        const parsed = RecommendationInputSchema.parse(input);
        const result = await ctx.generateRecommendations(parsed);
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
        'Record study results with SM-2 algorithm integration and leech detection. Updates ease factor, repetitions, and next review date. ' +
        'Response includes the updated item (when available) with recalculated next_review_date and ease_factor. ' +
        'Always read scheduling values from the response — do not hardcode or carry over previous values.',
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

  server.registerTool(
    'get_leeches',
    {
      title: 'Get Leech Items',
      description:
        'List learning items flagged as leeches (chunkType=remediation) — items with repeated failures that need remediation. Use resolve_leech to act on them.',
      inputSchema: GetLeechesInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { subjectFilter, limit } = GetLeechesInputSchema.parse(rawInput);
        const leeches = await ctx.getLeeches({ subjectFilter, limit });
        return toolJson(
          toSnakeCase({
            success: true,
            leeches,
            count: leeches.length,
            message:
              leeches.length > 0
                ? `Found ${leeches.length} leech item${leeches.length === 1 ? '' : 's'}. Use resolve_leech to remediate.`
                : 'No leech items found.',
          })
        );
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          return toolError(`Failed to get leeches: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        return toolError(`Failed to get leeches: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'resolve_leech',
    {
      title: 'Resolve Leech Item',
      description:
        'Remediate a leech item. Resolutions: reset_progress (reset SR to fresh start), archive (move to far future — effectively remove from queue), mark_reviewed (clear leech flag, keep SR progress).',
      inputSchema: ResolveLeechInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { chunkId, resolution } = ResolveLeechInputSchema.parse(rawInput);
        const result = await ctx.resolveLeech(chunkId, resolution);

        if (!result.success) {
          return toolError(`Failed to resolve leech: ${result.error.message}`, {
            type: result.error.type,
            message: result.error.message,
            retryable: result.error.type === 'database',
          });
        }

        return toolJson(
          toSnakeCase({
            success: true,
            chunkId: result.data.chunkId,
            resolution: result.data.resolution,
            message: `Leech resolved with '${result.data.resolution}' strategy.`,
          })
        );
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          return toolError(`Failed to resolve leech: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        return toolError(`Failed to resolve leech: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
