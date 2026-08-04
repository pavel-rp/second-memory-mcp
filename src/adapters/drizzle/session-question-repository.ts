import { and, asc, eq, inArray, min, ne } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  sessionQuestions,
  sessionQuestionChunks,
  sessionQuestionAttempts,
  sessionQuestionAttemptRevisions,
  type NewSessionQuestionRow,
  type NewSessionQuestionChunkRow,
  type NewSessionQuestionAttemptRow,
  type NewSessionQuestionAttemptRevisionRow,
  type SessionQuestionAttemptRevisionRow,
} from '../../infrastructure/db/schema.js';
import type {
  SessionQuestion,
  SessionQuestionAttempt,
  SessionQuestionAttemptRevision,
  SessionQuestionAttemptRevisionReason,
  SessionQuestionStatus,
} from '../../domain/types/entities.js';
import type {
  SessionQuestionRepository,
  CreateQuestionAttemptInput,
  ReviseAttemptInput,
} from '../../ports/session-question-repository.js';

function mapRevisionRow(row: SessionQuestionAttemptRevisionRow): SessionQuestionAttemptRevision {
  return {
    id: row.id,
    attemptId: row.attemptId,
    originalQuality: row.originalQuality,
    originalAgentQuality: row.originalAgentQuality,
    originalPassed: row.originalPassed,
    originalFeedback: row.originalFeedback,
    newQuality: row.newQuality,
    newAgentQuality: row.newAgentQuality,
    newPassed: row.newPassed,
    newFeedback: row.newFeedback,
    reason: row.reason as SessionQuestionAttemptRevisionReason,
    revisedAt: row.revisedAt,
  };
}

export class DrizzleSessionQuestionRepository implements SessionQuestionRepository {
  constructor(private db: SqlDb = getSql()) {}

  async createQuestions(
    sessionId: string,
    questions: { promptText: string; chunkIds: string[] }[],
    startIndex?: number
  ): Promise<SessionQuestion[]> {
    const now = Date.now();
    const base = startIndex ?? 1;
    const questionRows: NewSessionQuestionRow[] = questions.map((q, i) => ({
      id: crypto.randomUUID(),
      sessionId,
      questionIndex: base + i,
      promptText: q.promptText,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }));
    // Insert junction rows for each question → chunk mapping
    const junctionRows: NewSessionQuestionChunkRow[] = [];
    questions.forEach((q, i) => {
      const questionId = questionRows[i]?.id;
      if (!questionId) return;
      for (const chunkId of q.chunkIds) {
        junctionRows.push({
          id: crypto.randomUUID(),
          sessionQuestionId: questionId,
          chunkId,
        });
      }
    });

    // Atomic: question rows + junction rows in a single transaction
    await this.db.transaction(async tx => {
      await tx.insert(sessionQuestions).values(questionRows);
      if (junctionRows.length > 0) {
        await tx.insert(sessionQuestionChunks).values(junctionRows);
      }
    });

    return questionRows as SessionQuestion[];
  }

  async getQuestionsForSession(sessionId: string): Promise<SessionQuestion[]> {
    return (await this.db
      .select()
      .from(sessionQuestions)
      .where(eq(sessionQuestions.sessionId, sessionId))
      .orderBy(asc(sessionQuestions.questionIndex))) as SessionQuestion[];
  }

  async getChunkIdsForQuestion(questionId: string): Promise<string[]> {
    const rows = await this.db
      .select({ chunkId: sessionQuestionChunks.chunkId })
      .from(sessionQuestionChunks)
      .where(eq(sessionQuestionChunks.sessionQuestionId, questionId));
    return rows.map(r => r.chunkId);
  }

  async getChunkIdsForQuestions(questionIds: string[]): Promise<Map<string, string[]>> {
    if (questionIds.length === 0) return new Map();
    const rows = await this.db
      .select({
        sessionQuestionId: sessionQuestionChunks.sessionQuestionId,
        chunkId: sessionQuestionChunks.chunkId,
      })
      .from(sessionQuestionChunks)
      .where(inArray(sessionQuestionChunks.sessionQuestionId, questionIds));

    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.sessionQuestionId) ?? [];
      list.push(row.chunkId);
      map.set(row.sessionQuestionId, list);
    }
    return map;
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
      agentQuality: input.agentQuality,
      questionType: input.questionType,
      timeSpentMs: input.timeSpentMs,
      createdAt: input.createdAt,
      snapshotBand: input.snapshotBand,
      snapshotPredictedRecall: input.snapshotPredictedRecall,
      snapshotIntervalDays: input.snapshotIntervalDays,
      snapshotDaysOverdue: input.snapshotDaysOverdue,
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

  async getAllAttemptsForSession(sessionId: string): Promise<SessionQuestionAttempt[]> {
    return (await this.db
      .select({
        id: sessionQuestionAttempts.id,
        sessionQuestionId: sessionQuestionAttempts.sessionQuestionId,
        attemptNumber: sessionQuestionAttempts.attemptNumber,
        response: sessionQuestionAttempts.response,
        passed: sessionQuestionAttempts.passed,
        feedback: sessionQuestionAttempts.feedback,
        quality: sessionQuestionAttempts.quality,
        agentQuality: sessionQuestionAttempts.agentQuality,
        questionType: sessionQuestionAttempts.questionType,
        timeSpentMs: sessionQuestionAttempts.timeSpentMs,
        createdAt: sessionQuestionAttempts.createdAt,
      })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestions,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestions.id)
      )
      .where(eq(sessionQuestions.sessionId, sessionId))
      .orderBy(
        asc(sessionQuestionAttempts.sessionQuestionId),
        asc(sessionQuestionAttempts.attemptNumber)
      )) as SessionQuestionAttempt[];
  }

  async reviseAttempt(input: ReviseAttemptInput): Promise<SessionQuestionAttemptRevision> {
    const revisionRow: NewSessionQuestionAttemptRevisionRow = {
      id: input.revisionId,
      attemptId: input.attemptId,
      originalQuality: input.original.quality,
      originalAgentQuality: input.original.agentQuality,
      originalPassed: input.original.passed,
      originalFeedback: input.original.feedback,
      newQuality: input.next.quality,
      newAgentQuality: input.next.agentQuality,
      newPassed: input.next.passed,
      newFeedback: input.next.feedback,
      reason: input.reason,
      revisedAt: input.revisedAt,
    };

    await this.db.transaction(async tx => {
      await tx
        .update(sessionQuestionAttempts)
        .set({
          quality: input.next.quality,
          agentQuality: input.next.agentQuality,
          passed: input.next.passed,
          feedback: input.next.feedback,
        })
        .where(eq(sessionQuestionAttempts.id, input.attemptId));
      await tx.insert(sessionQuestionAttemptRevisions).values(revisionRow);
    });

    return mapRevisionRow(revisionRow as SessionQuestionAttemptRevisionRow);
  }

  async getRevisionsForAttempt(attemptId: string): Promise<SessionQuestionAttemptRevision[]> {
    const rows = await this.db
      .select()
      .from(sessionQuestionAttemptRevisions)
      .where(eq(sessionQuestionAttemptRevisions.attemptId, attemptId))
      .orderBy(asc(sessionQuestionAttemptRevisions.revisedAt));
    return rows.map(mapRevisionRow);
  }

  async getMinPriorQuality(
    sessionId: string,
    chunkIds: string[],
    excludeQuestionId?: string
  ): Promise<number | undefined> {
    if (chunkIds.length === 0) return undefined;

    const conditions = [
      eq(sessionQuestions.sessionId, sessionId),
      inArray(sessionQuestionChunks.chunkId, chunkIds),
    ];
    if (excludeQuestionId) {
      conditions.push(ne(sessionQuestions.id, excludeQuestionId));
    }

    const [row] = await this.db
      .select({ minQuality: min(sessionQuestionAttempts.quality) })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestions,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestions.id)
      )
      .innerJoin(
        sessionQuestionChunks,
        eq(sessionQuestionChunks.sessionQuestionId, sessionQuestions.id)
      )
      .where(and(...conditions));

    return row?.minQuality ?? undefined;
  }
}
