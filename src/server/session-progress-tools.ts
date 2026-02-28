import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import crypto from 'node:crypto';
import {
  createSessionChunk,
  getHistoricalFeedbackForChunks,
  validateChunkIds,
  getSessionWithChunks,
  persistBatchSessionChunkOperations,
  type CreateSessionChunkInput,
} from '../services/sessions.js';
import { BatchUpdateInputSchema } from '../domain/types/session.js';
import { CreateSessionChunkToolInputSchema } from '../domain/types/session-management-tools.js';
import { logger } from '../shared/logger.js';
import { applyBatchSessionChunkOperations } from '../domain/services/session-analyzer.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerSessionProgressTools(server: McpServer): void {
  // Create session chunk tool
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
          time_spent_ms: a.timeSpentMs,
          completed: a.completed,
        }));

        const createSessionChunkInput: CreateSessionChunkInput = {
          id: crypto.randomUUID(),
          sessionId: validatedInput.sessionId,
          chunkId: validatedInput.chunkId,
          status: validatedInput.status,
          attemptsJson: mappedAttempts ?? undefined,
          qualityScoresJson: validatedInput.qualityScores ?? undefined,
          timeSpentMs: validatedInput.timeSpentMs,
          createdAt: now,
          updatedAt: now,
        };

        const sessionChunk = await createSessionChunk(createSessionChunkInput);

        const result = {
          sessionChunkId: sessionChunk.id,
          status: 'created' as const,
          message: 'Session chunk created successfully',
        };

        logger.info(
          `Created session chunk ${sessionChunk.id} for session ${validatedInput.sessionId}`
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

  // Batch update session chunks tool
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
        const opChunkIds = Array.from(new Set(validatedInput.operations.map(op => op.chunkId)));
        const validation = await validateChunkIds(opChunkIds);
        if (!validation.isValid) {
          throw new Error(`Invalid chunk IDs provided: ${validation.errors.join(', ')}`);
        }

        // Fetch session and existing chunks
        const { session, chunks } = await getSessionWithChunks(validatedInput.sessionId);

        const result = await applyBatchSessionChunkOperations({
          sessionId: validatedInput.sessionId,
          operations: validatedInput.operations,
          activeSessionExists: session?.status === 'active',
          persistFn: args =>
            persistBatchSessionChunkOperations({
              ...args,
              existingChunks: chunks,
            }),
        });

        const response = {
          status: 'ok' as const,
          ...result,
        };

        logger.info(
          `Batch update for session ${validatedInput.sessionId}: created=${result.created}, updated=${result.updated}, unchanged=${result.unchanged}`
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

  // Historical feedback retrieval tool
  const GetHistoricalFeedbackInputSchema = z.object({
    chunkIds: z.array(z.string().min(1)).min(1).max(50),
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

        const feedback = await getHistoricalFeedbackForChunks(validatedInput.chunkIds, {
          limit: validatedInput.limit ?? 5,
        });

        const result = {
          status: 'ok' as const,
          feedbackCount: feedback.length,
          feedback,
          hint:
            feedback.length > 0
              ? 'Pay special attention to reported difficulties when teaching these chunks.'
              : 'No previous feedback found for these chunks.',
        };

        logger.info(
          `Retrieved ${feedback.length} historical feedback entries for ${validatedInput.chunkIds.length} chunks`
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
