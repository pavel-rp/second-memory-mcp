import type { LearningSession, SessionChunk } from '../domain/types/entities.js';
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
  Pick<LearningSession, 'status' | 'endTime' | 'feedback' | 'updatedAt' | 'chunkIds'>
>;

/** Input for creating a session chunk. */
export type CreateSessionChunkInput = {
  id: string;
  sessionId: string;
  chunkId: string;
  status?: string;
  timeSpentMs?: number;
  createdAt: number;
  updatedAt: number;
};

/** Input for updating a session chunk. */
export type UpdateSessionChunkInput = Partial<
  Pick<SessionChunk, 'status' | 'timeSpentMs' | 'updatedAt'>
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
  getSessionById(id: string): Promise<LearningSession | null>;
  getActiveSession(): Promise<LearningSession | null>;
  updateSession(id: string, changes: UpdateSessionInput): Promise<number>;
  completeSession(id: string, feedback?: string): Promise<number>;
  deleteSession(id: string): Promise<number>;
  listSessions(options?: {
    status?: 'active' | 'completed';
    limit?: number;
  }): Promise<LearningSession[]>;

  createSessionChunk(input: CreateSessionChunkInput): Promise<SessionChunk>;
  getSessionChunks(sessionId: string): Promise<SessionChunk[]>;
  getSessionChunkById(id: string): Promise<SessionChunk | null>;
  updateSessionChunk(
    id: string,
    changes: UpdateSessionChunkInput,
    expectedStatus?: 'pending' | 'in_progress' | 'completed'
  ): Promise<number>;
  deleteSessionChunk(id: string): Promise<number>;
  batchCreateSessionChunks(inputs: CreateSessionChunkInput[]): Promise<void>;

  getSessionWithChunks(sessionId: string): Promise<{
    session: LearningSession | null;
    chunks: SessionChunk[];
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
    existingChunks: SessionChunk[];
  }): Promise<BatchSessionChunkResult>;
  validateChunkIds(chunkIds: string[]): Promise<ChunkValidationResult>;
}
