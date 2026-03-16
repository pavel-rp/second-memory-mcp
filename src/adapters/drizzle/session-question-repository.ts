import { asc, eq, inArray } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  sessionQuestions,
  sessionQuestionAttempts,
  type NewSessionQuestionRow,
  type NewSessionQuestionAttemptRow,
} from '../../infrastructure/db/schema.js';
import type {
  SessionQuestion,
  SessionQuestionAttempt,
  SessionQuestionStatus,
} from '../../domain/types/entities.js';
import type {
  SessionQuestionRepository,
  CreateQuestionAttemptInput,
} from '../../ports/session-question-repository.js';

export class DrizzleSessionQuestionRepository implements SessionQuestionRepository {
  constructor(private db: SqlDb = getSql()) {}

  async createQuestions(
    sessionChunkId: string,
    questions: { promptText: string }[]
  ): Promise<SessionQuestion[]> {
    const now = Date.now();
    const rows: NewSessionQuestionRow[] = questions.map((q, i) => ({
      id: crypto.randomUUID(),
      sessionChunkId,
      questionIndex: i + 1,
      promptText: q.promptText,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }));
    await this.db.insert(sessionQuestions).values(rows);
    return rows as SessionQuestion[];
  }

  async getQuestionsForChunk(sessionChunkId: string): Promise<SessionQuestion[]> {
    return (await this.db
      .select()
      .from(sessionQuestions)
      .where(eq(sessionQuestions.sessionChunkId, sessionChunkId))
      .orderBy(asc(sessionQuestions.questionIndex))) as SessionQuestion[];
  }

  async getQuestionById(id: string): Promise<SessionQuestion | null> {
    const [row] = await this.db.select().from(sessionQuestions).where(eq(sessionQuestions.id, id));
    return (row as SessionQuestion | undefined) ?? null;
  }

  async updateQuestionStatus(id: string, status: SessionQuestionStatus): Promise<number> {
    const res = await this.db
      .update(sessionQuestions)
      .set({ status, updatedAt: Date.now() })
      .where(eq(sessionQuestions.id, id));
    return res.rowCount ?? 0;
  }

  async createAttempt(input: CreateQuestionAttemptInput): Promise<SessionQuestionAttempt> {
    const row: NewSessionQuestionAttemptRow = {
      id: input.id,
      sessionQuestionId: input.sessionQuestionId,
      attemptNumber: input.attemptNumber,
      response: input.response,
      passed: input.passed,
      feedback: input.feedback,
      quality: input.quality,
      timeSpentMs: input.timeSpentMs,
      createdAt: input.createdAt,
    };
    await this.db.insert(sessionQuestionAttempts).values(row);
    return row as SessionQuestionAttempt;
  }

  async getAttemptsForQuestion(sessionQuestionId: string): Promise<SessionQuestionAttempt[]> {
    return (await this.db
      .select()
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestionId))
      .orderBy(asc(sessionQuestionAttempts.attemptNumber))) as SessionQuestionAttempt[];
  }

  async getAllAttemptsForChunk(sessionChunkId: string): Promise<SessionQuestionAttempt[]> {
    const questions = await this.getQuestionsForChunk(sessionChunkId);
    if (questions.length === 0) return [];
    const questionIds = questions.map(q => q.id);
    return (await this.db
      .select()
      .from(sessionQuestionAttempts)
      .where(inArray(sessionQuestionAttempts.sessionQuestionId, questionIds))
      .orderBy(
        asc(sessionQuestionAttempts.sessionQuestionId),
        asc(sessionQuestionAttempts.attemptNumber)
      )) as SessionQuestionAttempt[];
  }
}
