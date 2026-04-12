import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { ZodError } from 'zod';
import crypto from 'node:crypto';
import {
  CreateSessionToolInputShape,
  CreateSessionToolInputSchema,
  CompleteSessionInputShape,
  CompleteSessionInputSchema,
  GetSessionByIdInputShape,
  GetSessionByIdInputSchema,
  GetActiveSessionInputShape,
  GetActiveSessionInputSchema,
  CreateSessionResultSchema,
  CompleteSessionResultSchema,
} from '../domain/types/session-management-tools.js';
import type { SessionInput } from '../domain/types/session.js';
import { getRequestLogger, withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

/**
 * Filter a SessionInput to only include requested fields.
 * Supports top-level keys and dot-notation for chunk sub-fields.
 */
function filterSessionFields(session: SessionInput, fields: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = { session_id: session.session_id };
  const chunkFields = fields
    .filter(f => f.startsWith('chunks.'))
    .map(f => f.slice('chunks.'.length));

  for (const field of fields) {
    if (field.startsWith('chunks.')) continue; // handled below
    if (field === 'chunks') {
      result.chunks = session.chunks;
    } else if (Object.hasOwn(session, field)) {
      result[field] = (session as Record<string, unknown>)[field];
    }
  }

  if (chunkFields.length > 0 && !('chunks' in result)) {
    result.chunks = session.chunks.map(chunk => {
      const filtered: Record<string, unknown> = {};
      for (const cf of chunkFields) {
        if (Object.hasOwn(chunk, cf)) {
          filtered[cf] = (chunk as Record<string, unknown>)[cf];
        }
      }
      return filtered;
    });
  }

  return result;
}

export function registerSessionLifecycleTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_session',
    {
      title: 'Create Learning Session',
      description:
        'Create a new learning session with specific parameters for structured learning. ' +
        'REQUIRED for recall/review/retrieval practice — you MUST create a session before teaching. ' +
        'Use mode "retrieval" for recall practice, "review" for spaced review sessions. ' +
        'After creation, call get_active_session — for review and retrieval sessions, historical feedback from past sessions ' +
        'is automatically included showing what the learner found difficult previously. ' +
        'Use this for manual session setup when you need specific chunk_ids or modes. ' +
        'For the common case of "just start learning", prefer start_learning which handles ' +
        'recommendations, session creation, and first chunk in one call.',
      inputSchema: CreateSessionToolInputShape,
    },
    async (input: unknown) =>
      withRequestContext('create_session', async () => {
        try {
          const validatedInput = CreateSessionToolInputSchema.parse(input);
          const sessionId = crypto.randomUUID();

          // Resolve dependencies and include prerequisites if chunk_ids are provided
          let finalChunkIds = validatedInput.chunkIds;
          let dependencyMessage = '';

          // Assessment evaluates exactly the provided chunks — skip dependency resolution
          if (
            validatedInput.chunkIds &&
            validatedInput.chunkIds.length > 0 &&
            validatedInput.mode !== 'assessment'
          ) {
            const resolution = await ctx.resolveSessionChunkDependencies(validatedInput.chunkIds);
            finalChunkIds = resolution.resolvedChunkIds;
            dependencyMessage = resolution.message;

            if (resolution.addedPrerequisites.length > 0) {
              getRequestLogger().info(
                `Session ${sessionId}: Added ${resolution.addedPrerequisites.length} prerequisites: ${resolution.addedPrerequisites.join(', ')}`
              );
            }
            if (resolution.skippedMasteredPrerequisites.length > 0) {
              getRequestLogger().info(
                `Session ${sessionId}: Skipped ${resolution.skippedMasteredPrerequisites.length} mastered prerequisites: ${resolution.skippedMasteredPrerequisites.join(', ')}`
              );
            }
          }

          // Validate chunk IDs exist
          if (finalChunkIds && finalChunkIds.length > 0) {
            const validation = await ctx.validateChunkIds(finalChunkIds);
            if (!validation.valid) {
              return toolError(`Invalid chunk IDs: ${validation.invalidIds.join(', ')}`, {
                type: 'validation',
                message: `Invalid chunk IDs: ${validation.invalidIds.join(', ')}`,
              });
            }
          }

          const createResult = await ctx.createSession({
            topicId: validatedInput.topicId,
            chunkIds: finalChunkIds,
            mode: validatedInput.mode,
            estimatedDuration: validatedInput.estimatedDuration,
          });

          if (!createResult.success) {
            return toolError(`Failed to create session: ${createResult.error.message}`, {
              type: createResult.error.type,
              message: createResult.error.message,
            });
          }

          const chunkInfo =
            finalChunkIds && finalChunkIds.length > 0
              ? ` and ${finalChunkIds.length} chunks initialized`
              : '';

          const result = CreateSessionResultSchema.parse({
            session_id: createResult.data.sessionId,
            action: 'created' as const,
            message: `Session created successfully with mode: ${validatedInput.mode}${chunkInfo}${dependencyMessage}`,
          });

          getRequestLogger().info(
            `Created session ${createResult.data.sessionId} with mode ${validatedInput.mode}`
          );
          return toolData(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          if (error instanceof ZodError) {
            getRequestLogger().error('Invalid create_session input:', error);
            return toolError(`Failed to create session: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('Failed to create session:', error);
          return toolError(`Failed to create session: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'get_active_session',
    {
      title: 'Get Active Session',
      description:
        'Retrieve the current active learning session to continue where you left off. ' +
        'For review and retrieval sessions, historical feedback from past sessions is automatically included ' +
        'to help inform teaching strategy based on previously reported difficulties. ' +
        'Use the fields parameter to request only specific parts of the session (e.g. ["mode", "chunks.status"]).',
      inputSchema: GetActiveSessionInputShape,
    },
    async (input: unknown) =>
      withRequestContext('get_active_session', async () => {
        try {
          const validatedInput = GetActiveSessionInputSchema.parse(input);
          const activeSession = await ctx.getActiveSession();

          if (!activeSession) {
            return toolData({ session: null, action: 'not_found' as const });
          }

          const includeHistoricalFeedback =
            activeSession.mode === 'review' || activeSession.mode === 'retrieval';

          const sessionInput = await ctx.convertSessionToInput(activeSession.id, {
            includeHistoricalFeedback,
            historicalFeedbackLimit: 5,
          });

          if (!sessionInput) {
            return toolData({ session: null, action: 'not_found' as const });
          }

          const sessionData = validatedInput.fields
            ? filterSessionFields(sessionInput, validatedInput.fields)
            : sessionInput;

          getRequestLogger().info(`Retrieved active session ${activeSession.id}`);
          return toolData({ session: sessionData, action: 'found' as const });
        } catch (error) {
          const msg = extractErrorMessage(error);
          if (error instanceof ZodError) {
            getRequestLogger().error('Invalid get_active_session input:', error);
            return toolError(`Failed to get active session: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('Failed to get active session:', error);
          return toolError(`Failed to get active session: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'get_session',
    {
      title: 'Get Session by ID',
      description:
        'Retrieve a specific learning session by its ID. ' +
        'For review and retrieval sessions, historical feedback from past sessions is automatically included ' +
        'to help inform teaching strategy based on previously reported difficulties. ' +
        'Use the fields parameter to request only specific parts of the session (e.g. ["mode", "chunks.status"]).',
      inputSchema: GetSessionByIdInputShape,
    },
    async (input: unknown) =>
      withRequestContext('get_session', async () => {
        try {
          const validatedInput = GetSessionByIdInputSchema.parse(input);

          const session = await ctx.getSessionById(validatedInput.sessionId);

          if (!session) {
            return toolData({ session: null, action: 'not_found' as const });
          }

          const includeHistoricalFeedback =
            session.mode === 'review' || session.mode === 'retrieval';

          const sessionInput = await ctx.convertSessionToInput(validatedInput.sessionId, {
            includeHistoricalFeedback,
            historicalFeedbackLimit: 5,
          });

          if (!sessionInput) {
            return toolData({ session: null, action: 'not_found' as const });
          }

          const sessionData = validatedInput.fields
            ? filterSessionFields(sessionInput, validatedInput.fields)
            : sessionInput;

          getRequestLogger().info(`Retrieved session ${validatedInput.sessionId}`);
          return toolData({ session: sessionData, action: 'found' as const });
        } catch (error) {
          const msg = extractErrorMessage(error);
          if (error instanceof ZodError) {
            getRequestLogger().error('Invalid get_session input:', error);
            return toolError(`Failed to get session: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('Failed to get session:', error);
          return toolError(`Failed to get session: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'complete_session',
    {
      title: 'Complete Learning Session',
      description:
        'Complete a learning session with optional feedback and final metrics. ' +
        'Feedback should describe what was difficult and what was easy, with specific focus on pain points ' +
        'and areas where the user struggled. This enables the system to provide better guidance in future sessions.',
      inputSchema: CompleteSessionInputShape,
    },
    async (input: unknown) =>
      withRequestContext('complete_session', async () => {
        try {
          const validatedInput = CompleteSessionInputSchema.parse(input);

          const session = await ctx.getSessionById(validatedInput.sessionId);
          if (!session) {
            throw new Error(`Session ${validatedInput.sessionId} not found`);
          }

          if (session.status === 'completed') {
            return toolError('Session is already completed', {
              type: 'conflict',
              message: 'Session is already completed',
            });
          }

          const completeResult = await ctx.completeSession(
            validatedInput.sessionId,
            validatedInput.feedback
          );

          if (!completeResult.success) {
            throw new Error(
              `Failed to complete session ${validatedInput.sessionId}: ${completeResult.error.message}`
            );
          }

          const updatedSession = await ctx.getSessionById(validatedInput.sessionId);
          if (!updatedSession) {
            throw new Error(`Session ${validatedInput.sessionId} not found after completion`);
          }

          const duration = updatedSession.endTime
            ? updatedSession.endTime - updatedSession.startTime
            : 0;

          const sessionInput = await ctx.convertSessionToInput(validatedInput.sessionId);
          let chunksCompleted = 0;
          let averageQuality = 0;

          if (sessionInput) {
            chunksCompleted = sessionInput.chunks.filter(
              chunk => chunk.status === 'completed'
            ).length;

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
            session_id: validatedInput.sessionId,
            action: 'completed' as const,
            final_metrics: {
              duration,
              chunks_completed: chunksCompleted,
              average_quality: averageQuality,
            },
            message: `Session completed successfully${validatedInput.feedback ? ' with feedback' : ''}`,
          });

          getRequestLogger().info(
            `Completed session ${validatedInput.sessionId} with feedback: ${validatedInput.feedback || 'none'}`
          );
          return toolData(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          getRequestLogger().error('Failed to complete session:', error);
          return toolError(`Failed to complete session: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );
}
