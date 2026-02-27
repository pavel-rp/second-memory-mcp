import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import crypto from 'node:crypto';
import {
  createSession,
  getActiveSession,
  completeSession,
  getSessionById,
  convertSessionToSessionInput,
  type CreateSessionInput,
} from '../services/sessions.js';
import {
  CreateSessionToolInputSchema,
  CompleteSessionInputSchema,
  GetSessionInputSchema,
  CreateSessionResultSchema,
  GetActiveSessionResultSchema,
  CompleteSessionResultSchema,
} from '../types/session-management-tools.js';
import { logger } from '../utils/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';
import { resolveSessionChunkDependencies } from './session-dependency-resolver.js';

export function registerSessionLifecycleTools(server: McpServer): void {
  server.registerTool(
    'create_session',
    {
      title: 'Create Learning Session',
      description:
        'Create a new learning session with specific parameters for structured learning. ' +
        'REQUIRED for recall/review/retrieval practice - you MUST create a session before teaching. ' +
        'Use mode "retrieval" for recall practice, "review" for spaced review sessions. ' +
        'After creation, call get_active_session to retrieve historical feedback from past sessions ' +
        'showing what the learner found difficult previously.',
      inputSchema: CreateSessionToolInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = CreateSessionToolInputSchema.parse(input);
        const now = Date.now();
        const sessionId = crypto.randomUUID();

        // Resolve dependencies and include prerequisites if chunkIds are provided
        let finalChunkIds = validatedInput.chunkIds;
        let dependencyMessage = '';

        if (validatedInput.chunkIds && validatedInput.chunkIds.length > 0) {
          const resolution = await resolveSessionChunkDependencies(validatedInput.chunkIds);
          finalChunkIds = resolution.resolvedChunkIds;
          dependencyMessage = resolution.message;

          if (resolution.addedPrerequisites.length > 0) {
            logger.info(
              `Session ${sessionId}: Added ${resolution.addedPrerequisites.length} prerequisites: ${resolution.addedPrerequisites.join(', ')}`
            );
          }
        }

        const sessionInput: CreateSessionInput = {
          id: sessionId,
          topicId: validatedInput.topicId,
          chunkIds: finalChunkIds,
          mode: validatedInput.mode,
          estimatedDuration: validatedInput.estimatedDuration,
          startTime: now,
          createdAt: now,
          updatedAt: now,
        };

        await createSession(sessionInput);

        const chunkInfo =
          finalChunkIds && finalChunkIds.length > 0
            ? ` and ${finalChunkIds.length} chunks initialized`
            : '';

        const result = CreateSessionResultSchema.parse({
          sessionId,
          status: 'created' as const,
          message: `Session created successfully with mode: ${validatedInput.mode}${chunkInfo}${dependencyMessage}`,
        });

        logger.info(`Created session ${sessionId} with mode ${validatedInput.mode}`);
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to create session:', error);
        return toolError(`Failed to create session: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'get_active_session',
    {
      title: 'Get Active Session',
      description:
        'Retrieve the current active learning session to continue where you left off. ' +
        'For review and retrieval sessions, historical feedback from past sessions is automatically included ' +
        'to help inform teaching strategy based on previously reported difficulties.',
      inputSchema: z.object({}).shape, // No input required
    },
    async () => {
      try {
        const activeSession = await getActiveSession();

        if (!activeSession) {
          const result = GetActiveSessionResultSchema.parse({
            session: null,
            status: 'not_found' as const,
          });
          return toolJson(result);
        }

        // Include historical feedback for review/retrieval sessions
        const includeHistoricalFeedback =
          activeSession.mode === 'review' || activeSession.mode === 'retrieval';

        // Convert database session to SessionInput format (includes chunks)
        const sessionInput = await convertSessionToSessionInput(activeSession.id, {
          includeHistoricalFeedback,
          historicalFeedbackLimit: 5,
        });

        if (!sessionInput) {
          const result = GetActiveSessionResultSchema.parse({
            session: null,
            status: 'not_found' as const,
          });
          return toolJson(result);
        }

        const result = GetActiveSessionResultSchema.parse({
          session: sessionInput,
          status: 'found' as const,
        });

        logger.info(`Retrieved active session ${activeSession.id}`);
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to get active session:', error);
        return toolError(`Failed to get active session: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'get_session',
    {
      title: 'Get Session by ID',
      description:
        'Retrieve a specific learning session by its ID. ' +
        'For review and retrieval sessions, historical feedback from past sessions is automatically included ' +
        'to help inform teaching strategy based on previously reported difficulties.',
      inputSchema: GetSessionInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = GetSessionInputSchema.parse(input);

        if (!validatedInput.sessionId) {
          throw new Error('Session ID is required');
        }

        const session = await getSessionById(validatedInput.sessionId);

        if (!session) {
          const result = GetActiveSessionResultSchema.parse({
            session: null,
            status: 'not_found' as const,
          });
          return toolJson(result);
        }

        // Include historical feedback for review/retrieval sessions
        const includeHistoricalFeedback = session.mode === 'review' || session.mode === 'retrieval';

        // Convert database session to SessionInput format (includes chunks)
        const sessionInput = await convertSessionToSessionInput(validatedInput.sessionId, {
          includeHistoricalFeedback,
          historicalFeedbackLimit: 5,
        });

        if (!sessionInput) {
          const result = GetActiveSessionResultSchema.parse({
            session: null,
            status: 'not_found' as const,
          });
          return toolJson(result);
        }

        const result = GetActiveSessionResultSchema.parse({
          session: sessionInput,
          status: 'found' as const,
        });

        logger.info(`Retrieved session ${validatedInput.sessionId}`);
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to get session:', error);
        return toolError(`Failed to get session: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'complete_session',
    {
      title: 'Complete Learning Session',
      description:
        'Complete a learning session with optional feedback and final metrics. ' +
        'Feedback should describe what was difficult and what was easy, with specific focus on pain points ' +
        'and areas where the user struggled. This enables the system to provide better guidance in future sessions.',
      inputSchema: CompleteSessionInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = CompleteSessionInputSchema.parse(input);

        // Get session data before completion to calculate metrics
        const session = await getSessionById(validatedInput.sessionId);
        if (!session) {
          throw new Error(`Session ${validatedInput.sessionId} not found`);
        }

        if (session.status === 'completed') {
          return toolJson({
            success: false,
            error: {
              type: 'already_completed',
              message: 'Session is already completed',
            },
          });
        }

        // Complete the session
        const changes = await completeSession(validatedInput.sessionId, validatedInput.feedback);

        if (changes === 0) {
          throw new Error(`Failed to complete session ${validatedInput.sessionId}`);
        }

        // Get updated session data after completion to calculate metrics
        const updatedSession = await getSessionById(validatedInput.sessionId);
        if (!updatedSession) {
          throw new Error(`Session ${validatedInput.sessionId} not found after completion`);
        }

        // Calculate final metrics from completed session data
        const duration = updatedSession.endTime
          ? updatedSession.endTime - updatedSession.startTime
          : 0;

        // Calculate actual metrics from session chunks
        const sessionInput = await convertSessionToSessionInput(validatedInput.sessionId);
        let chunksCompleted = 0;
        let averageQuality = 0;

        if (sessionInput) {
          chunksCompleted = sessionInput.chunks.filter(
            chunk => chunk.status === 'completed'
          ).length;

          // Calculate average quality from all attempts across all chunks
          const allAttempts = sessionInput.chunks.flatMap(chunk => chunk.attempts);
          if (allAttempts.length > 0) {
            const totalQuality = allAttempts.reduce(
              (sum, attempt) => sum + (attempt.quality ?? 0),
              0
            );
            averageQuality = totalQuality / allAttempts.length;
          }
        }

        const result = CompleteSessionResultSchema.parse({
          sessionId: validatedInput.sessionId,
          status: 'completed' as const,
          finalMetrics: {
            duration,
            chunksCompleted,
            averageQuality,
          },
          message: `Session completed successfully${validatedInput.feedback ? ' with feedback' : ''}`,
        });

        logger.info(
          `Completed session ${validatedInput.sessionId} with feedback: ${validatedInput.feedback || 'none'}`
        );
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Failed to complete session:', error);
        return toolError(`Failed to complete session: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
