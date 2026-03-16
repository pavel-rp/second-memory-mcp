import type {
  SessionQuestion,
  SessionQuestionAttempt,
  SessionQuestionStatus,
} from '../domain/types/entities.js';

/** Input for creating a question attempt. */
export type CreateQuestionAttemptInput = {
  id: string;
  sessionQuestionId: string;
  attemptNumber: 1 | 2;
  response: string;
  passed: boolean;
  feedback: string;
  quality: number | null;
  timeSpentMs: number;
  createdAt: number;
};

/**
 * Port interface for session question data access.
 * Keeps question-specific CRUD separate from the existing SessionRepository.
 */
export interface SessionQuestionRepository {
  createQuestions(
    sessionChunkId: string,
    questions: { promptText: string }[],
    startIndex?: number
  ): Promise<SessionQuestion[]>;

  getQuestionsForChunk(sessionChunkId: string): Promise<SessionQuestion[]>;

  getQuestionById(id: string): Promise<SessionQuestion | null>;

  updateQuestionStatus(id: string, status: SessionQuestionStatus): Promise<number>;

  createAttempt(input: CreateQuestionAttemptInput): Promise<SessionQuestionAttempt>;

  getAttemptsForQuestion(sessionQuestionId: string): Promise<SessionQuestionAttempt[]>;

  getAllAttemptsForChunk(sessionChunkId: string): Promise<SessionQuestionAttempt[]>;

  /** Batch: get all questions for multiple chunks in one query. */
  getQuestionsForChunks(sessionChunkIds: string[]): Promise<SessionQuestion[]>;

  /** Batch: get all attempts for multiple chunks (via their questions) in one query. */
  getAllAttemptsForChunks(sessionChunkIds: string[]): Promise<SessionQuestionAttempt[]>;
}
