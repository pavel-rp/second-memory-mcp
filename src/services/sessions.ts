import { eq, desc, inArray } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql } from '../db/operations.js';
import {
  learningSessions,
  sessionChunks,
  learningChunks,
  type LearningSessionRow,
  type SessionChunkRow,
  type NewLearningSessionRow,
  type NewSessionChunkRow,
  type LearningChunkRow,
} from '../db/schema.js';
import { SessionInput, SessionMode, HistoricalFeedback } from '../types/session.js';
import { logger } from '../utils/logger.js';

// Input types for session operations
export type CreateSessionInput = {
  id: string;
  topicId?: string;
  chunkIds?: string[];
  mode: SessionMode;
  estimatedDuration?: number;
  startTime: number; // epoch ms
  createdAt: number;
  updatedAt: number;
};

export type UpdateSessionInput = {
  status?: 'active' | 'completed';
  endTime?: number; // epoch ms
  feedback?: string;
  updatedAt: number;
};

export type CreateSessionChunkInput = {
  id: string;
  sessionId: string;
  chunkId: string;
  status?: 'pending' | 'in_progress' | 'completed';
  attemptsJson?: string; // JSON string of ChunkAttempt[]
  qualityScoresJson?: string; // JSON string of number[]
  timeSpentMs?: number;
  createdAt: number;
  updatedAt: number;
};

export type UpdateSessionChunkInput = {
  status?: 'pending' | 'in_progress' | 'completed';
  attemptsJson?: string;
  qualityScoresJson?: string;
  timeSpentMs?: number;
  updatedAt: number;
};

// Chunk validation types
export type ChunkValidationResult = {
  isValid: boolean;
  validChunkIds: string[];
  invalidChunkIds: string[];
  errors: string[];
};

// Chunk validation function
export async function validateChunkIds(chunkIds: string[]): Promise<ChunkValidationResult> {
  if (!chunkIds || chunkIds.length === 0) {
    return {
      isValid: true,
      validChunkIds: [],
      invalidChunkIds: [],
      errors: [],
    };
  }

  const db = getSql();

  try {
    // Query database for existing chunk IDs
    const existingChunks = await db
      .select({ id: learningChunks.id })
      .from(learningChunks)
      .where(inArray(learningChunks.id, chunkIds))
      .all();

    const existingIds = new Set(existingChunks.map(chunk => chunk.id));
    const validChunkIds: string[] = [];
    const invalidChunkIds: string[] = [];
    const errors: string[] = [];

    // Categorize chunk IDs
    for (const chunkId of chunkIds) {
      if (existingIds.has(chunkId)) {
        validChunkIds.push(chunkId);
      } else {
        invalidChunkIds.push(chunkId);
        errors.push(`Chunk '${chunkId}' not found in learning content`);
      }
    }

    return {
      isValid: invalidChunkIds.length === 0,
      validChunkIds,
      invalidChunkIds,
      errors,
    };
  } catch (error) {
    logger.error('Failed to validate chunk IDs:', error);
    return {
      isValid: false,
      validChunkIds: [],
      invalidChunkIds: chunkIds,
      errors: ['Failed to validate chunk IDs due to database error'],
    };
  }
}

// Session service functions
export async function createSession(input: CreateSessionInput): Promise<void> {
  const db = getSql();

  // Check for existing active session
  const existingActive = await getActiveSession();
  if (existingActive) {
    throw new Error(
      'Active session already exists. Please complete the current session before creating a new one.'
    );
  }

  // Validate chunk IDs if provided
  if (input.chunkIds && input.chunkIds.length > 0) {
    const validation = await validateChunkIds(input.chunkIds);
    if (!validation.isValid) {
      const errorMessage = `Invalid chunk IDs provided: ${validation.errors.join(', ')}. Please verify the chunk IDs or use list_chunks to see available chunks.`;
      throw new Error(errorMessage);
    }
  }

  const sessionData: NewLearningSessionRow = {
    id: input.id,
    topicId: input.topicId || null,
    chunkIds: input.chunkIds ? JSON.stringify(input.chunkIds) : null,
    mode: input.mode,
    estimatedDuration: input.estimatedDuration || null,
    status: 'active',
    startTime: input.startTime,
    endTime: null,
    feedback: null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };

  await db.insert(learningSessions).values(sessionData).run();
  logger.info(`Created session ${input.id} with mode ${input.mode}`);

  // Automatically create session chunks if chunkIds provided
  if (input.chunkIds && input.chunkIds.length > 0) {
    const sessionChunkInputs: CreateSessionChunkInput[] = input.chunkIds.map(chunkId => ({
      id: crypto.randomUUID(),
      sessionId: input.id,
      chunkId: chunkId,
      status: 'pending',
      attemptsJson: undefined,
      qualityScoresJson: undefined,
      timeSpentMs: 0,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }));

    await batchCreateSessionChunks(sessionChunkInputs);
    logger.info(`Created ${sessionChunkInputs.length} session chunks for session ${input.id}`);
  }
}

export async function getSessionById(id: string): Promise<LearningSessionRow | null> {
  const db = getSql();
  return db.select().from(learningSessions).where(eq(learningSessions.id, id)).get() || null;
}

export async function getActiveSession(): Promise<LearningSessionRow | null> {
  const db = getSql();
  return (
    db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.status, 'active'))
      .orderBy(desc(learningSessions.createdAt))
      .get() || null
  );
}

export async function updateSession(id: string, changes: UpdateSessionInput): Promise<number> {
  const db = getSql();
  const res = db.update(learningSessions).set(changes).where(eq(learningSessions.id, id)).run();
  return res.changes ?? 0;
}

export async function completeSession(id: string, feedback?: string): Promise<number> {
  const now = Date.now();
  const changes: UpdateSessionInput = {
    status: 'completed',
    endTime: now,
    feedback: feedback || undefined,
    updatedAt: now,
  };

  const result = await updateSession(id, changes);
  if (result > 0) {
    logger.info(`Completed session ${id} with feedback: ${feedback || 'none'}`);
  }
  return result;
}

export async function deleteSession(id: string): Promise<number> {
  const db = getSql();
  const res = db.delete(learningSessions).where(eq(learningSessions.id, id)).run();
  return res.changes ?? 0;
}

// Session chunk functions
export async function createSessionChunk(
  input: CreateSessionChunkInput
): Promise<NewSessionChunkRow> {
  const db = getSql();
  const chunkData: NewSessionChunkRow = {
    id: input.id,
    sessionId: input.sessionId,
    chunkId: input.chunkId,
    status: input.status || 'pending',
    attemptsJson: input.attemptsJson || null,
    qualityScoresJson: input.qualityScoresJson || null,
    timeSpentMs: input.timeSpentMs || 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };

  await db.insert(sessionChunks).values(chunkData).run();
  logger.info(`Created session chunk ${input.id} for session ${input.sessionId}`);
  return chunkData;
}

export async function getSessionChunks(sessionId: string): Promise<SessionChunkRow[]> {
  const db = getSql();
  return db.select().from(sessionChunks).where(eq(sessionChunks.sessionId, sessionId)).all();
}

export async function getSessionChunkById(id: string): Promise<SessionChunkRow | null> {
  const db = getSql();
  return db.select().from(sessionChunks).where(eq(sessionChunks.id, id)).get() || null;
}

export async function updateSessionChunk(
  id: string,
  changes: UpdateSessionChunkInput
): Promise<number> {
  const db = getSql();
  const res = db.update(sessionChunks).set(changes).where(eq(sessionChunks.id, id)).run();
  return res.changes ?? 0;
}

export async function deleteSessionChunk(id: string): Promise<number> {
  const db = getSql();
  const res = db.delete(sessionChunks).where(eq(sessionChunks.id, id)).run();
  return res.changes ?? 0;
}

// Utility functions for session state management
export async function getSessionWithChunks(sessionId: string): Promise<{
  session: LearningSessionRow | null;
  chunks: SessionChunkRow[];
}> {
  const session = await getSessionById(sessionId);
  const chunks = await getSessionChunks(sessionId);
  return { session, chunks };
}

/**
 * Convert a database session to SessionInput format.
 *
 * @param sessionId - The session ID to convert
 * @param options - Optional configuration
 * @param options.includeHistoricalFeedback - Include feedback from past sessions on same chunks
 * @param options.historicalFeedbackLimit - Max number of historical feedback entries (default: 5)
 */
export async function convertSessionToSessionInput(
  sessionId: string,
  options?: {
    includeHistoricalFeedback?: boolean;
    historicalFeedbackLimit?: number;
  }
): Promise<SessionInput | null> {
  const { session, chunks } = await getSessionWithChunks(sessionId);

  if (!session) {
    return null;
  }

  // Get chunk details for titles
  const chunkIds = chunks.map(c => c.chunkId);
  let chunkDetails: LearningChunkRow[] = [];
  if (chunkIds.length > 0) {
    chunkDetails = await getSql()
      .select()
      .from(learningChunks)
      .where(inArray(learningChunks.id, chunkIds))
      .all();
  }

  const chunkMap = new Map(chunkDetails.map(c => [c.id, c]));

  // Convert database chunks to SessionInput format
  const sessionChunksData: SessionInput['chunks'] = chunks.map(chunk => {
    let attempts: SessionInput['chunks'][0]['attempts'] = [];
    let qualityScores: number[] = [];

    try {
      if (chunk.attemptsJson) {
        const rawAttempts = JSON.parse(chunk.attemptsJson) as Array<{
          timestamp: string | number;
          quality: number;
          timeSpentMs?: number; // camelCase from create_session_chunk tool
          time_spent_ms?: number; // snake_case from legacy data
          completed: boolean;
        }>;
        // Convert attempts to proper format (standardize on snake_case for SessionInput)
        attempts = rawAttempts.map(attempt => ({
          timestamp:
            typeof attempt.timestamp === 'number'
              ? new Date(attempt.timestamp).toISOString()
              : attempt.timestamp,
          quality: attempt.quality,
          time_spent_ms: attempt.timeSpentMs ?? attempt.time_spent_ms ?? 0,
          completed: attempt.completed,
        }));
      }
      if (chunk.qualityScoresJson) {
        qualityScores = JSON.parse(chunk.qualityScoresJson);
      }
    } catch (error) {
      logger.error(`Failed to parse JSON for session chunk ${chunk.id}:`, error);
    }

    const chunkDetail = chunkMap.get(chunk.chunkId);
    const title = chunkDetail?.title || `Chunk ${chunk.chunkId}`;

    return {
      chunk_id: chunk.chunkId,
      title: title,
      status: chunk.status as 'pending' | 'in_progress' | 'completed',
      attempts,
      quality_scores: qualityScores,
      time_spent_ms: chunk.timeSpentMs,
    };
  });

  // Fetch historical feedback for review/retrieval sessions if requested
  let historicalFeedback: HistoricalFeedback[] | undefined;
  if (options?.includeHistoricalFeedback && chunkIds.length > 0) {
    historicalFeedback = await getHistoricalFeedbackForChunks(chunkIds, {
      limit: options.historicalFeedbackLimit ?? 5,
      excludeSessionId: sessionId,
    });
    // Only include if there's actual feedback
    if (historicalFeedback.length === 0) {
      historicalFeedback = undefined;
    }
  }

  return {
    session_id: session.id,
    mode: session.mode as SessionMode,
    start_time: new Date(session.startTime).toISOString(),
    chunks: sessionChunksData,
    feedback: session.feedback || undefined,
    historical_feedback: historicalFeedback,
  };
}

// Batch operations
export async function batchCreateSessionChunks(inputs: CreateSessionChunkInput[]): Promise<void> {
  const db = getSql();

  for (const input of inputs) {
    const chunkData: NewSessionChunkRow = {
      id: input.id,
      sessionId: input.sessionId,
      chunkId: input.chunkId,
      status: input.status || 'pending',
      attemptsJson: input.attemptsJson || null,
      qualityScoresJson: input.qualityScoresJson || null,
      timeSpentMs: input.timeSpentMs || 0,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };

    await db.insert(sessionChunks).values(chunkData).run();
  }

  logger.info(`Created ${inputs.length} session chunks for session ${inputs[0]?.sessionId}`);
}

export async function listSessions(options?: {
  status?: 'active' | 'completed';
  limit?: number;
}): Promise<LearningSessionRow[]> {
  const db = getSql();

  let query = db.select().from(learningSessions);

  if (options?.status) {
    query = query.where(eq(learningSessions.status, options.status)) as typeof query;
  }

  query = query.orderBy(desc(learningSessions.createdAt)) as typeof query;

  if (options?.limit && options.limit > 0) {
    return query.limit(options.limit).all();
  }

  return query.all();
}

/**
 * Fetch historical feedback from completed sessions that covered specific chunks.
 * This enables the AI to consider past struggles and successes during reviews.
 *
 * @param chunkIds - Array of chunk IDs to find related feedback for
 * @param options - Optional configuration for filtering
 * @returns Array of historical feedback entries, sorted by most recent first
 */
export async function getHistoricalFeedbackForChunks(
  chunkIds: string[],
  options?: {
    limit?: number;
    excludeSessionId?: string; // Exclude current session from results
  }
): Promise<HistoricalFeedback[]> {
  if (!chunkIds || chunkIds.length === 0) {
    return [];
  }

  const db = getSql();

  try {
    // Find completed sessions that have feedback and involved any of the specified chunks
    const completedSessions = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.status, 'completed'))
      .orderBy(desc(learningSessions.endTime))
      .all();

    const feedbackEntries: HistoricalFeedback[] = [];
    const chunkIdSet = new Set(chunkIds);

    for (const session of completedSessions) {
      // Skip current session if specified
      if (options?.excludeSessionId && session.id === options.excludeSessionId) {
        continue;
      }

      // Skip sessions without feedback
      if (!session.feedback || session.feedback.trim() === '') {
        continue;
      }

      // Parse session chunk IDs and check for overlap
      let sessionChunkIds: string[] = [];
      if (session.chunkIds) {
        try {
          sessionChunkIds = JSON.parse(session.chunkIds) as string[];
        } catch {
          logger.warn(`Failed to parse chunk IDs for session ${session.id}`);
          continue;
        }
      }

      // Find overlapping chunks
      const overlappingChunks = sessionChunkIds.filter(id => chunkIdSet.has(id));

      if (overlappingChunks.length > 0) {
        feedbackEntries.push({
          session_id: session.id,
          session_mode: session.mode as SessionMode,
          completed_at: session.endTime
            ? new Date(session.endTime).toISOString()
            : new Date(session.updatedAt).toISOString(),
          feedback: session.feedback.trim(),
          chunk_ids: overlappingChunks,
        });
      }

      // Apply limit if specified
      if (options?.limit && feedbackEntries.length >= options.limit) {
        break;
      }
    }

    return feedbackEntries;
  } catch (error) {
    logger.error('Failed to fetch historical feedback:', error);
    return [];
  }
}
