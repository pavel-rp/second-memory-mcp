import type {
  SessionQuestion,
  SessionQuestionAttempt,
  SessionQuestionAttemptRevision,
  SessionQuestionAttemptRevisionReason,
  SessionQuestionStatus,
} from '../domain/types/entities.js';
import type { QuestionType } from '../domain/types/teaching.js';

/** Input for creating a question attempt. */
export type CreateQuestionAttemptInput = {
  id: string;
  sessionQuestionId: string;
  attemptNumber: 1 | 2;
  response: string;
  passed: boolean;
  feedback: string;
  quality: number | null;
  agentQuality: number | null;
  questionType: QuestionType | null;
  timeSpentMs: number;
  createdAt: number;
};

/**
 * Snapshot of an attempt's grading fields, captured before a revise_grade call
 * mutates them. Stored verbatim in the revisions table for audit.
 */
export type AttemptGradeSnapshot = {
  quality: number | null;
  agentQuality: number | null;
  passed: boolean;
  feedback: string;
};

/** Input for revising an existing attempt's grade in place. */
export type ReviseAttemptInput = {
  revisionId: string;
  attemptId: string;
  original: AttemptGradeSnapshot;
  next: AttemptGradeSnapshot;
  reason: SessionQuestionAttemptRevisionReason;
  revisedAt: number;
};

/**
 * Port interface for session question data access.
 * Questions are session-scoped (sessionId FK) with chunk mapping via junction table.
 */
export interface SessionQuestionRepository {
  createQuestions(
    sessionId: string,
    questions: { promptText: string; chunkIds: string[] }[],
    startIndex?: number
  ): Promise<SessionQuestion[]>;

  getQuestionsForSession(sessionId: string): Promise<SessionQuestion[]>;

  getChunkIdsForQuestion(questionId: string): Promise<string[]>;

  /** Batch: get chunk IDs for multiple questions in one query. Returns questionId → chunkId[]. */
  getChunkIdsForQuestions(questionIds: string[]): Promise<Map<string, string[]>>;

  getQuestionById(id: string): Promise<SessionQuestion | null>;

  updateQuestionStatus(id: string, status: SessionQuestionStatus): Promise<number>;

  createAttempt(input: CreateQuestionAttemptInput): Promise<SessionQuestionAttempt>;

  getAttemptsForQuestion(sessionQuestionId: string): Promise<SessionQuestionAttempt[]>;

  /** Get all attempts for a session (questions → attempts). */
  getAllAttemptsForSession(sessionId: string): Promise<SessionQuestionAttempt[]>;

  /**
   * Get the minimum quality score from prior attempts targeting any of the given chunkIds in a session.
   * Optionally exclude a specific question (for retry path — don't count the question being retried).
   * Returns undefined when there are no prior attempts (or no non-null qualities).
   */
  getMinPriorQuality(
    sessionId: string,
    chunkIds: string[],
    excludeQuestionId?: string
  ): Promise<number | undefined>;

  /**
   * Revise the grade fields of an existing attempt in place and atomically
   * append a revision row preserving the original values verbatim. Used by the
   * `revise_grade` MCP tool. Returns the persisted revision row.
   */
  reviseAttempt(input: ReviseAttemptInput): Promise<SessionQuestionAttemptRevision>;

  /**
   * Get all revisions for an attempt, ordered by `revisedAt` ascending. The
   * orchestration uses the latest entry to detect idempotent re-revisions.
   */
  getRevisionsForAttempt(attemptId: string): Promise<SessionQuestionAttemptRevision[]>;
}
