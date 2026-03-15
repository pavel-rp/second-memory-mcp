import type { SessionQuestion, SessionQuestionAttempt } from '../domain/types/entities.js';

/** Input for creating a question attempt. */
export type CreateQuestionAttemptInput = {
  id: string;
  sessionQuestionId: string;
  attemptNumber: number;
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
    questions: { promptText: string }[]
  ): Promise<SessionQuestion[]>;

  getQuestionsForChunk(sessionChunkId: string): Promise<SessionQuestion[]>;

  getQuestionById(id: string): Promise<SessionQuestion | null>;

  updateQuestionStatus(id: string, status: string): Promise<number>;

  createAttempt(input: CreateQuestionAttemptInput): Promise<SessionQuestionAttempt>;

  getAttemptsForQuestion(sessionQuestionId: string): Promise<SessionQuestionAttempt[]>;

  getAllAttemptsForChunk(sessionChunkId: string): Promise<SessionQuestionAttempt[]>;
}
