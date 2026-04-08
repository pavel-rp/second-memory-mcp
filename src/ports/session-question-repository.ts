import type {
  SessionQuestion,
  SessionQuestionAttempt,
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
   * Get prior attempts for questions targeting any of the given chunkIds in a session.
   * Optionally exclude a specific question (for retry path — don't count the question being retried).
   */
  getPriorAttemptsForChunks(
    sessionId: string,
    chunkIds: string[],
    excludeQuestionId?: string
  ): Promise<SessionQuestionAttempt[]>;
}
