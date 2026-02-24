import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import crypto from 'node:crypto';
import {
  createSession,
  getActiveSession,
  completeSession,
  getSessionById,
  convertSessionToSessionInput,
  createSessionChunk,
  getHistoricalFeedbackForChunks,
  validateChunkIds,
  getSessionWithChunks,
  persistBatchSessionChunkOperations,
  type CreateSessionInput,
  type CreateSessionChunkInput,
} from '../services/sessions.js';
import { SessionModeSchema, SessionInputSchema, BatchUpdateInputSchema } from '../types/session.js';
import { logger } from '../utils/logger.js';
import { applyBatchSessionChunkOperations } from '../tools/session-manager.js';
import { dependencyResolver } from '../algorithms/dependency-resolver.js';
import { getChunk } from '../services/chunks.js';
import { mapChunkRowToLearningItem } from '../services/chunk-queries.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

// Input schemas for session management tools
const CreateSessionInputSchema = z.object({
  topicId: z.string().optional(),
  chunkIds: z.array(z.string()).optional(),
  mode: SessionModeSchema,
  estimatedDuration: z.number().min(1).max(480).optional(), // 1-480 minutes
});

const CompleteSessionInputSchema = z.object({
  sessionId: z.string().min(1),
  feedback: z.string().optional(),
});

const GetSessionInputSchema = z.object({
  sessionId: z.string().min(1).optional(), // Optional for get_active_session
});

const CreateSessionChunkInputSchema = z.object({
  sessionId: z.string().min(1),
  chunkId: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  attempts: z
    .array(
      z.object({
        timestamp: z.number(),
        quality: z.number().min(0).max(5).optional(),
        timeSpentMs: z.number().min(0),
        completed: z.boolean(),
      })
    )
    .optional(),
  qualityScores: z.array(z.number().min(0).max(5)).optional(),
  timeSpentMs: z.number().min(0).default(0),
});

// Return type schemas
const CreateSessionResultSchema = z.object({
  sessionId: z.string(),
  status: z.literal('created'),
  message: z.string(),
});

const GetActiveSessionResultSchema = z.object({
  session: SessionInputSchema.nullable(),
  status: z.enum(['found', 'not_found']),
});

const CompleteSessionResultSchema = z.object({
  sessionId: z.string(),
  status: z.literal('completed'),
  finalMetrics: z.object({
    duration: z.number(),
    chunksCompleted: z.number(),
    averageQuality: z.number(),
  }),
  message: z.string(),
});

/**
 * Helper function to resolve dependencies and include prerequisites for session chunks
 * @param chunkIds Array of chunk IDs to resolve dependencies for
 * @returns Resolved topological order including original chunk IDs and any existing prerequisites
 */
async function resolveSessionChunkDependencies(chunkIds: string[]): Promise<{
  resolvedChunkIds: string[];
  addedPrerequisites: string[];
  message: string;
}> {
  if (!chunkIds || chunkIds.length === 0) {
    return {
      resolvedChunkIds: [],
      addedPrerequisites: [],
      message: '',
    };
  }

  const inputChunkSet = new Set(chunkIds);
  const chunkMap = new Map<string, ReturnType<typeof mapChunkRowToLearningItem>>();
  const missingPrerequisites: string[] = [];
  const missingRequestedChunks: string[] = [];
  const queue: string[] = [...chunkIds];
  const visited = new Set<string>();

  try {
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      let item = chunkMap.get(currentId);
      if (!item) {
        const chunkRow = await getChunk(currentId);
        if (!chunkRow) {
          if (inputChunkSet.has(currentId)) {
            missingRequestedChunks.push(currentId);
          } else {
            missingPrerequisites.push(currentId);
          }
          logger.warn(
            `Skipping chunk ${currentId} while resolving session dependencies - not found in database`
          );
          continue;
        }
        item = mapChunkRowToLearningItem(chunkRow);
        chunkMap.set(currentId, item);
      }

      const prerequisites = item.prerequisites || [];
      for (const prereqId of prerequisites) {
        if (!visited.has(prereqId)) {
          queue.push(prereqId);
        }
      }
    }

    if (missingRequestedChunks.length > 0) {
      logger.warn(
        `Cannot resolve dependencies for missing requested chunks: ${missingRequestedChunks.join(', ')}`
      );
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        message: '',
      };
    }

    const relevantItems = Array.from(chunkMap.entries())
      .filter(([id]) => visited.has(id))
      .map(([, item]) => item);

    if (relevantItems.length === 0) {
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        message: '',
      };
    }

    // Resolve dependencies for selected chunks
    const resolution = await dependencyResolver.resolveDependencies(relevantItems, chunkIds);

    if (!resolution.isValid) {
      logger.warn('Dependency resolution failed for session chunks:', resolution.errors.join(', '));
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        message: '',
      };
    }

    const existingResolvedChain = resolution.resolvedChain.filter(id => chunkMap.has(id));
    const chunkIdSet = new Set(chunkIds);
    const addedPrerequisites = existingResolvedChain.filter(id => !chunkIdSet.has(id));

    const messageParts: string[] = [];
    if (addedPrerequisites.length > 0) {
      messageParts.push(
        `Automatically included ${addedPrerequisites.length} prerequisite${addedPrerequisites.length > 1 ? 's' : ''} to ensure proper learning progression.`
      );
    }

    if (missingPrerequisites.length > 0) {
      messageParts.push(
        `Skipped ${missingPrerequisites.length} missing prerequisite${missingPrerequisites.length > 1 ? 's' : ''}: ${missingPrerequisites.join(', ')}.`
      );
      logger.warn(
        `Skipped missing prerequisite chunks during session dependency resolution: ${missingPrerequisites.join(', ')}`
      );
    }

    const message = messageParts.length > 0 ? ` ${messageParts.join(' ')}` : '';

    return {
      resolvedChunkIds: existingResolvedChain,
      addedPrerequisites,
      message,
    };
  } catch (error) {
    logger.error('Error resolving session chunk dependencies:', error);
    return {
      resolvedChunkIds: chunkIds,
      addedPrerequisites: [],
      message: '',
    };
  }
}

/**
 * Registers session management MCP tools for creating, tracking, and completing learning sessions.
 *
 * This function registers the following tools:
 * - create_session: Create a new learning session with specific parameters
 * - get_active_session: Retrieve the most recently created active session
 * - complete_session: Mark a session as completed with optional feedback
 * - create_session_chunk: Create session chunks to track learning progress
 *
 * @param server - The MCP server instance to register tools with
 */
export function registerSessionManagementTools(server: McpServer): void {
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
      inputSchema: CreateSessionInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = CreateSessionInputSchema.parse(input);
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

  // Create session chunk tool
  server.registerTool(
    'create_session_chunk',
    {
      title: 'Create Session Chunk',
      description:
        'Create a new session chunk to track learning progress for a specific chunk within a session',
      inputSchema: CreateSessionChunkInputSchema.shape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = CreateSessionChunkInputSchema.parse(input);
        const now = Date.now();

        const createSessionChunkInput: CreateSessionChunkInput = {
          id: crypto.randomUUID(),
          sessionId: validatedInput.sessionId,
          chunkId: validatedInput.chunkId,
          status: validatedInput.status,
          attemptsJson: validatedInput.attempts
            ? JSON.stringify(validatedInput.attempts)
            : undefined,
          qualityScoresJson: validatedInput.qualityScores
            ? JSON.stringify(validatedInput.qualityScores)
            : undefined,
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

        const result = applyBatchSessionChunkOperations({
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
