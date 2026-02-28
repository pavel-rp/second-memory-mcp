import type { LearningSessionRow, SessionChunkRow } from '../db/schema.js';
import type { SessionInput, HistoricalFeedback, BatchOperation } from '../domain/types/session.js';

/** Input for creating a session. */
export type CreateSessionInput = {
  id: string;
  topicId?: string;
  chunkIds?: string[];
  mode: string;
  estimatedDuration?: number;
  startTime: number;
  createdAt: number;
  updatedAt: number;
};

/** Input for updating a session. */
export type UpdateSessionInput = Partial<
  Pick<LearningSessionRow, 'status' | 'endTime' | 'feedback' | 'updatedAt'>
>;

/** Input for creating a session chunk. */
export type CreateSessionChunkInput = {
  id: string;
  sessionId: string;
  chunkId: string;
  status?: string;
  createdAt: number;
  updatedAt: number;
};

/** Input for updating a session chunk. */
export type UpdateSessionChunkInput = Partial<
  Pick<
    SessionChunkRow,
    'status' | 'attemptsJson' | 'qualityScoresJson' | 'timeSpentMs' | 'updatedAt'
  >
>;

/** Result of chunk ID validation. */
export type ChunkValidationResult = {
  valid: boolean;
  invalidIds: string[];
  validIds: string[];
};

/** Result of batch session chunk operations. */
export type BatchSessionChunkResult = {
  created: number;
  updated: number;
  unchanged: number;
  affectedChunkIds: string[];
};

/**
 * Port interface for session data access.
 * Adapters implement this to provide session and session-chunk lifecycle operations.
 */
export interface SessionRepository {
  createSession(input: CreateSessionInput): Promise<void>;
  getSessionById(id: string): Promise<LearningSessionRow | null>;
  getActiveSession(): Promise<LearningSessionRow | null>;
  updateSession(id: string, changes: UpdateSessionInput): Promise<number>;
  completeSession(id: string, feedback?: string): Promise<number>;
  deleteSession(id: string): Promise<number>;
  listSessions(options?: {
    status?: 'active' | 'completed';
    limit?: number;
  }): Promise<LearningSessionRow[]>;

  createSessionChunk(input: CreateSessionChunkInput): Promise<SessionChunkRow>;
  getSessionChunks(sessionId: string): Promise<SessionChunkRow[]>;
  getSessionChunkById(id: string): Promise<SessionChunkRow | null>;
  updateSessionChunk(id: string, changes: UpdateSessionChunkInput): Promise<number>;
  deleteSessionChunk(id: string): Promise<number>;
  batchCreateSessionChunks(inputs: CreateSessionChunkInput[]): Promise<void>;

  getSessionWithChunks(sessionId: string): Promise<{
    session: LearningSessionRow | null;
    chunks: SessionChunkRow[];
  }>;
  convertSessionToSessionInput(
    sessionId: string,
    options?: {
      includeHistoricalFeedback?: boolean;
      historicalFeedbackLimit?: number;
    }
  ): Promise<SessionInput | null>;
  getHistoricalFeedbackForChunks(
    chunkIds: string[],
    options?: { limit?: number; excludeSessionId?: string }
  ): Promise<HistoricalFeedback[]>;
  persistBatchSessionChunkOperations(args: {
    sessionId: string;
    operations: BatchOperation[];
    existingChunks: SessionChunkRow[];
  }): Promise<BatchSessionChunkResult>;
  validateChunkIds(chunkIds: string[]): Promise<ChunkValidationResult>;
}
