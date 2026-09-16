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
  /**
   * NEU-1015: the learner-isolation key. On token transports this is the
   * verified token's raw, non-empty `payload.sub`; on stdio it is the fixed
   * `STDIO_PLACEHOLDER_LEARNER_KEY` (stdio is slated for deprecation and is
   * not per-learner scoped). `null` is reserved for the pre-NEU-1015 legacy
   * row shape; composition-root never resolves it to `null` — a sub-less
   * token principal is refused before this input is ever constructed.
   */
  learnerKey: string | null;
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
  Pick<SessionChunk, 'status' | 'teachingApproach' | 'timeSpentMs' | 'updatedAt'>
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
  /**
   * NEU-1015 enforcement point: the only place a `learner_key` predicate is
   * written for an id-based session lookup. `learnerKey` is required — every
   * caller either has a resolved key (token `sub` or the stdio placeholder) or
   * was refused before reaching here.
   */
  getSessionById(id: string, learnerKey: string | null): Promise<LearningSession | null>;
  /**
   * NEU-1015 enforcement point: the only place a `learner_key` predicate is
   * written for the active-session lookup.
   */
  getActiveSession(learnerKey: string | null): Promise<LearningSession | null>;
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

  /**
   * Re-verifies ownership via the now-scoped `getSessionById` internally
   * (NEU-1015) rather than writing a second `learner_key` predicate here.
   */
  getSessionWithChunks(
    sessionId: string,
    learnerKey: string | null
  ): Promise<{
    session: LearningSession | null;
    chunks: SessionChunk[];
  }>;
  /**
   * Re-verifies ownership via the now-scoped `getSessionById` internally
   * (NEU-1015) rather than writing a second `learner_key` predicate here.
   */
  convertSessionToSessionInput(
    sessionId: string,
    learnerKey: string | null,
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
