import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { z } from 'zod';
import crypto from 'node:crypto';
import { BatchUpdateInputSchema } from '../domain/types/session.js';
import { CreateSessionChunkToolInputSchema } from '../domain/types/session-management-tools.js';
import { logger } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerSessionProgressTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_session_chunk',
    {
      title: 'Create Session Chunk',
      description:
        'Create a new session chunk to track learning progress for a specific chunk within a session',
      inputSchema: CreateSessionChunkToolInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = CreateSessionChunkToolInputSchema.parse(input);
        const now = Date.now();

        const mappedAttempts = validatedInput.attempts?.map(a => ({
          timestamp: new Date(a.timestamp).toISOString(),
          quality: a.quality,
          time_spent_ms: a.time_spent_ms,
          completed: a.completed,
        }));

        const sessionChunk = await ctx.createSessionChunk({
          id: crypto.randomUUID(),
          sessionId: validatedInput.session_id,
          chunkId: validatedInput.chunk_id,
          status: validatedInput.status,
          attemptsJson: mappedAttempts ?? undefined,
          qualityScoresJson: validatedInput.quality_scores ?? undefined,
          timeSpentMs: validatedInput.time_spent_ms,
          createdAt: now,
          updatedAt: now,
        });

        const result = {
          session_chunk_id: sessionChunk.id,
          status: 'created' as const,
          message: 'Session chunk created successfully',
        };

        logger.info(
          `Created session chunk ${sessionChunk.id} for session ${validatedInput.session_id}`
        );
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to create session chunk:', error);
        return toolError(`Failed to create session chunk: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'batch_update_session_chunks',
    {
      title: 'Batch Update Session Chunks',
      description: 'Create or update multiple session chunks atomically within the active session',
      inputSchema: BatchUpdateInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = BatchUpdateInputSchema.parse(input);

        // Validate chunk IDs exist in learning content
        const opChunkIds = Array.from(new Set(validatedInput.operations.map(op => op.chunk_id)));
        const validation = await ctx.validateChunkIds(opChunkIds);
        if (!validation.valid) {
          throw new Error(`Invalid chunk IDs provided: ${validation.invalidIds.join(', ')}`);
        }

        // Fetch session and existing chunks
        const { session } = await ctx.getSessionWithChunks(validatedInput.session_id);

        const result = await ctx.applyBatchSessionChunkOperations({
          sessionId: validatedInput.session_id,
          operations: validatedInput.operations.map(op => ({
            chunkId: op.chunk_id,
            title: op.title,
            status: op.status,
            attempts: op.attempts,
            qualityScores: op.quality_scores,
            timeSpentMs: op.time_spent_ms,
          })),
          activeSessionExists: session?.status === 'active',
          persistFn: async args => {
            // Use the batch update orchestration with the existing chunks
            const batchResult = await ctx.batchUpdateSessionChunks(
              validatedInput.session_id,
              args.operations
            );
            if (!batchResult.success) {
              throw new Error(batchResult.error.message);
            }
            return {
              ...batchResult.data,
              affectedChunkIds: args.operations.map(op => op.chunkId),
            };
          },
        });

        const response = {
          status: 'ok' as const,
          ...result,
        };

        logger.info(
          `Batch update for session ${validatedInput.session_id}: created=${result.created}, updated=${result.updated}, unchanged=${result.unchanged}`
        );
        return toolJson(response);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to batch update session chunks:', error);
        return toolError(`Failed to batch update session chunks: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  const GetHistoricalFeedbackInputSchema = z.object({
    chunk_ids: z.array(z.string().min(1)).min(1).max(50),
    limit: z.number().min(1).max(20).default(5).optional(),
  });

  server.registerTool(
    'get_historical_feedback',
    {
      title: 'Get Historical Feedback for Chunks',
      description:
        'Retrieve feedback from past completed sessions that covered specific chunks. ' +
        'This helps inform teaching strategy during reviews by surfacing previously reported ' +
        'difficulties, pain points, and successes. Use this to adapt your approach based on ' +
        'what the learner struggled with or found easy in the past.',
      inputSchema: GetHistoricalFeedbackInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = GetHistoricalFeedbackInputSchema.parse(input);

        const feedback = await ctx.getHistoricalFeedback(validatedInput.chunk_ids, {
          limit: validatedInput.limit ?? 5,
        });

        const result = {
          status: 'ok' as const,
          feedback_count: feedback.length,
          feedback,
          hint:
            feedback.length > 0
              ? 'Pay special attention to reported difficulties when teaching these chunks.'
              : 'No previous feedback found for these chunks.',
        };

        logger.info(
          `Retrieved ${feedback.length} historical feedback entries for ${validatedInput.chunk_ids.length} chunks`
        );
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to get historical feedback:', error);
        return toolError(`Failed to get historical feedback: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
