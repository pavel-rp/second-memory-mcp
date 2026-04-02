import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { z } from 'zod';
import crypto from 'node:crypto';
import type { BatchOperation } from '../domain/types/session.js';
import { BatchUpdateInputSchema, BatchUpdateInputShape } from '../domain/types/session.js';
import { toCamelCaseKeys, toSnakeCase } from '../shared/case-convert.js';
import {
  CreateSessionChunkToolInputShape,
  CreateSessionChunkToolInputSchema,
} from '../domain/types/session-management-tools.js';
import { getRequestLogger, withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerSessionProgressTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_session_chunk',
    {
      title: 'Create Session Chunk',
      description:
        'Create a new session chunk to track learning progress for a specific chunk within a session',
      inputSchema: CreateSessionChunkToolInputShape,
    },
    async (input: unknown) =>
      withRequestContext('create_session_chunk', async () => {
        try {
          const validatedInput = CreateSessionChunkToolInputSchema.parse(input);
          const now = Date.now();

          const sessionChunk = await ctx.createSessionChunk({
            id: crypto.randomUUID(),
            sessionId: validatedInput.sessionId,
            chunkId: validatedInput.chunkId,
            status: validatedInput.status,
            timeSpentMs: validatedInput.timeSpentMs,
            createdAt: now,
            updatedAt: now,
          });

          getRequestLogger().info(
            `Created session chunk ${sessionChunk.id} for session ${validatedInput.sessionId}`
          );
          return toolJson(
            toSnakeCase({
              sessionChunkId: sessionChunk.id,
              status: 'created' as const,
              message: 'Session chunk created successfully',
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          getRequestLogger().error('Failed to create session chunk:', error);
          return toolError(`Failed to create session chunk: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'batch_update_session_chunks',
    {
      title: 'Batch Update Session Chunks',
      description: 'Create or update multiple session chunks atomically within the active session',
      inputSchema: BatchUpdateInputShape,
    },
    async (input: unknown) =>
      withRequestContext('batch_update_session_chunks', async () => {
        try {
          const validatedInput = BatchUpdateInputSchema.parse(input);

          // Validate chunk IDs exist in learning content
          const opChunkIds = Array.from(new Set(validatedInput.operations.map(op => op.chunkId)));
          const validation = await ctx.validateChunkIds(opChunkIds);
          if (!validation.valid) {
            throw new Error(`Invalid chunk IDs provided: ${validation.invalidIds.join(', ')}`);
          }

          // Fetch session and existing chunks
          const { session } = await ctx.getSessionWithChunks(validatedInput.sessionId);

          const result = await ctx.applyBatchSessionChunkOperations({
            sessionId: validatedInput.sessionId,
            // Type assertion: CamelCaseKeys doesn't reflect rawKeys at the type level,
            // but toCamelCaseKeysExcept preserves attempts' snake_case keys at runtime.
            operations: validatedInput.operations as unknown as BatchOperation[],
            activeSessionExists: session?.status === 'active',
            persistFn: async args => {
              // Use the batch update orchestration with the existing chunks
              const batchResult = await ctx.batchUpdateSessionChunks(
                validatedInput.sessionId,
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

          if (!result.success) {
            return toolError(`Failed to batch update session chunks: ${result.error.message}`, {
              type: result.error.type,
              message: result.error.message,
            });
          }

          getRequestLogger().info(
            `Batch update for session ${validatedInput.sessionId}: created=${result.data.created}, updated=${result.data.updated}, unchanged=${result.data.unchanged}`
          );
          return toolJson(
            toSnakeCase({
              status: 'ok' as const,
              ...result.data,
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          getRequestLogger().error('Failed to batch update session chunks:', error);
          return toolError(`Failed to batch update session chunks: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  const GetHistoricalFeedbackInputShape = {
    chunk_ids: z.array(z.string().min(1)).min(1).max(50),
    limit: z.number().min(1).max(20).default(5).optional(),
    context_token: z
      .string()
      .min(1)
      .describe(
        'Token returned by init_agent_context. Required on every call. ' +
          'Call init_agent_context at the start of every conversation to obtain this token.'
      ),
  } as const;

  const GetHistoricalFeedbackInputSchema = z
    .object(GetHistoricalFeedbackInputShape)
    .transform(toCamelCaseKeys);

  server.registerTool(
    'get_historical_feedback',
    {
      title: 'Get Historical Feedback for Chunks',
      description:
        'Retrieve feedback from past completed sessions that covered specific chunks. ' +
        'This helps inform teaching strategy during reviews by surfacing previously reported ' +
        'difficulties, pain points, and successes. Use this to adapt your approach based on ' +
        'what the learner struggled with or found easy in the past.',
      inputSchema: GetHistoricalFeedbackInputShape,
    },
    async (input: unknown) =>
      withRequestContext('get_historical_feedback', async () => {
        try {
          const validatedInput = GetHistoricalFeedbackInputSchema.parse(input);

          const feedback = await ctx.getHistoricalFeedback(validatedInput.chunkIds, {
            limit: validatedInput.limit ?? 5,
          });

          getRequestLogger().info(
            `Retrieved ${feedback.length} historical feedback entries for ${validatedInput.chunkIds.length} chunks`
          );
          return toolJson(
            toSnakeCase({
              status: 'ok' as const,
              feedbackCount: feedback.length,
              feedback,
              hint:
                feedback.length > 0
                  ? 'Pay special attention to reported difficulties when teaching these chunks.'
                  : 'No previous feedback found for these chunks.',
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          getRequestLogger().error('Failed to get historical feedback:', error);
          return toolError(`Failed to get historical feedback: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );
}
