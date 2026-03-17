import { eq, desc, asc, inArray } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, withTx, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  learningSessions,
  sessionChunks,
  learningChunks,
  sessionQuestions,
  sessionQuestionAttempts,
  type NewLearningSessionRow,
  type NewSessionChunkRow,
} from '../../infrastructure/db/schema.js';
import type { LearningSession, SessionChunk } from '../../domain/types/entities.js';
import type {
  SessionRepository,
  CreateSessionInput,
  UpdateSessionInput,
  CreateSessionChunkInput,
  UpdateSessionChunkInput,
  ChunkValidationResult,
  BatchSessionChunkResult,
} from '../../ports/session-repository.js';
import type {
  SessionInput,
  HistoricalFeedback,
  BatchOperation,
  ChunkAttempt,
} from '../../domain/types/session.js';
import { logger } from '../../shared/logger.js';

function toIsoDate(epochMs: number): string {
  const d = new Date(epochMs);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private db: SqlDb = getSql()) {}

  async createSession(input: CreateSessionInput): Promise<void> {
    const row: NewLearningSessionRow = {
      id: input.id,
      topicId: input.topicId || null,
      chunkIds: input.chunkIds || null,
      mode: input.mode,
      estimatedDuration: input.estimatedDuration || null,
      status: 'active',
      startTime: input.startTime,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
    await this.db.insert(learningSessions).values(row);

    // Auto-create session chunks
    if (input.chunkIds && input.chunkIds.length > 0) {
      const chunkRows: NewSessionChunkRow[] = input.chunkIds.map(chunkId => ({
        id: crypto.randomUUID(),
        sessionId: input.id,
        chunkId,
        status: 'pending',
        timeSpentMs: 0,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      }));
      await this.db.insert(sessionChunks).values(chunkRows);
    }
  }

  async getSessionById(id: string): Promise<LearningSession | null> {
    const [row] = await this.db.select().from(learningSessions).where(eq(learningSessions.id, id));
    return row || null;
  }

  async getActiveSession(): Promise<LearningSession | null> {
    const [row] = await this.db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.status, 'active'))
      .orderBy(desc(learningSessions.createdAt));
    return row || null;
  }

  async updateSession(id: string, changes: UpdateSessionInput): Promise<number> {
    const res = await this.db
      .update(learningSessions)
      .set(changes)
      .where(eq(learningSessions.id, id));
    return res.rowCount ?? 0;
  }

  async completeSession(id: string, feedback?: string): Promise<number> {
    const now = Date.now();
    return this.updateSession(id, {
      status: 'completed',
      endTime: now,
      feedback: feedback || null,
      updatedAt: now,
    });
  }

  async deleteSession(id: string): Promise<number> {
    const res = await this.db.delete(learningSessions).where(eq(learningSessions.id, id));
    return res.rowCount ?? 0;
  }

  async listSessions(options?: {
    status?: 'active' | 'completed';
    limit?: number;
  }): Promise<LearningSession[]> {
    let query = this.db.select().from(learningSessions);
    if (options?.status) {
      query = query.where(eq(learningSessions.status, options.status)) as typeof query;
    }
    query = query.orderBy(desc(learningSessions.createdAt)) as typeof query;
    if (options?.limit && options.limit > 0) {
      return await query.limit(options.limit);
    }
    return await query;
  }

  async createSessionChunk(input: CreateSessionChunkInput): Promise<SessionChunk> {
    const chunkData: NewSessionChunkRow = {
      id: input.id,
      sessionId: input.sessionId,
      chunkId: input.chunkId,
      status: input.status || 'pending',
      timeSpentMs: input.timeSpentMs ?? 0,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
    await this.db.insert(sessionChunks).values(chunkData);
    logger.info(`Created session chunk ${input.id} for session ${input.sessionId}`);
    return chunkData as SessionChunk;
  }

  async getSessionChunks(sessionId: string): Promise<SessionChunk[]> {
    return await this.db
      .select()
      .from(sessionChunks)
      .where(eq(sessionChunks.sessionId, sessionId))
      .orderBy(asc(sessionChunks.createdAt), asc(sessionChunks.id));
  }

  async getSessionChunkById(id: string): Promise<SessionChunk | null> {
    const [row] = await this.db.select().from(sessionChunks).where(eq(sessionChunks.id, id));
    return row || null;
  }

  async updateSessionChunk(id: string, changes: UpdateSessionChunkInput): Promise<number> {
    const res = await this.db.update(sessionChunks).set(changes).where(eq(sessionChunks.id, id));
    return res.rowCount ?? 0;
  }

  async deleteSessionChunk(id: string): Promise<number> {
    const res = await this.db.delete(sessionChunks).where(eq(sessionChunks.id, id));
    return res.rowCount ?? 0;
  }

  async batchCreateSessionChunks(inputs: CreateSessionChunkInput[]): Promise<void> {
    if (inputs.length === 0) return;
    const rows: NewSessionChunkRow[] = inputs.map(input => ({
      id: input.id,
      sessionId: input.sessionId,
      chunkId: input.chunkId,
      status: input.status || 'pending',
      timeSpentMs: input.timeSpentMs ?? 0,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }));
    await this.db.insert(sessionChunks).values(rows);
    logger.info(`Created ${inputs.length} session chunks for session ${inputs[0]?.sessionId}`);
  }

  async getSessionWithChunks(
    sessionId: string
  ): Promise<{ session: LearningSession | null; chunks: SessionChunk[] }> {
    const session = await this.getSessionById(sessionId);
    const chunks = session ? await this.getSessionChunks(sessionId) : [];
    return { session, chunks };
  }

  async convertSessionToSessionInput(
    sessionId: string,
    options?: { includeHistoricalFeedback?: boolean; historicalFeedbackLimit?: number }
  ): Promise<SessionInput | null> {
    const session = await this.getSessionById(sessionId);
    if (!session) return null;

    const sessionChunkRows = await this.getSessionChunks(sessionId);

    // Fetch chunk details for enrichment
    const chunkIds = sessionChunkRows.map(sc => sc.chunkId);
    const chunkDetails =
      chunkIds.length > 0
        ? await this.db.select().from(learningChunks).where(inArray(learningChunks.id, chunkIds))
        : [];
    const chunkMap = new Map(chunkDetails.map(c => [c.id, c]));

    // Fetch normalized questions + attempts for all session chunks
    const scIds = sessionChunkRows.map(sc => sc.id);
    const questionRows =
      scIds.length > 0
        ? await this.db
            .select()
            .from(sessionQuestions)
            .where(inArray(sessionQuestions.sessionChunkId, scIds))
            .orderBy(asc(sessionQuestions.sessionChunkId), asc(sessionQuestions.questionIndex))
        : [];
    const questionIds = questionRows.map(q => q.id);
    const attemptRows =
      questionIds.length > 0
        ? await this.db
            .select()
            .from(sessionQuestionAttempts)
            .where(inArray(sessionQuestionAttempts.sessionQuestionId, questionIds))
            .orderBy(
              asc(sessionQuestionAttempts.sessionQuestionId),
              asc(sessionQuestionAttempts.attemptNumber)
            )
        : [];

    // Build lookup maps
    const questionsByChunk = new Map<string, typeof questionRows>();
    for (const q of questionRows) {
      const list = questionsByChunk.get(q.sessionChunkId) ?? [];
      list.push(q);
      questionsByChunk.set(q.sessionChunkId, list);
    }
    const attemptsByQuestion = new Map<string, typeof attemptRows>();
    for (const a of attemptRows) {
      const list = attemptsByQuestion.get(a.sessionQuestionId) ?? [];
      list.push(a);
      attemptsByQuestion.set(a.sessionQuestionId, list);
    }

    const chunks = sessionChunkRows.map(sc => {
      const detail = chunkMap.get(sc.chunkId);
      const scQuestions = questionsByChunk.get(sc.id) ?? [];
      const attempts: ChunkAttempt[] = [];
      const qualityScores: number[] = [];

      for (const q of scQuestions) {
        const qAttempts = attemptsByQuestion.get(q.id) ?? [];
        for (const a of qAttempts) {
          attempts.push({
            timestamp: new Date(a.createdAt).toISOString(),
            question: q.promptText,
            response: a.response,
            passed: a.passed,
            feedback: a.feedback,
            quality: a.quality ?? undefined,
            time_spent_ms: a.timeSpentMs,
          });
          if (a.quality !== null) {
            qualityScores.push(a.quality);
          }
        }
      }

      return {
        chunk_id: sc.chunkId,
        session_chunk_id: sc.id,
        title: detail?.title || 'Unknown',
        status: sc.status as 'pending' | 'in_progress' | 'completed',
        attempts,
        quality_scores: qualityScores,
        time_spent_ms: sc.timeSpentMs,
        ...(detail && {
          repetitions: detail.repetitions,
          ease_factor: detail.easeFactor,
          next_review_date: toIsoDate(detail.nextReviewAt),
          subject: detail.subject,
          difficulty: detail.difficulty,
          estimated_duration: detail.estimatedDuration,
          chunk_type: detail.chunkType as 'new' | 'review' | 'remediation',
        }),
      };
    });

    let historical_feedback: HistoricalFeedback[] = [];
    if (options?.includeHistoricalFeedback) {
      historical_feedback = await this.getHistoricalFeedbackForChunks(chunkIds, {
        limit: options.historicalFeedbackLimit,
        excludeSessionId: sessionId,
      });
    }

    return {
      session_id: session.id,
      mode: session.mode as SessionInput['mode'],
      start_time: new Date(session.startTime).toISOString(),
      chunks,
      historical_feedback,
    };
  }

  async getHistoricalFeedbackForChunks(
    chunkIds: string[],
    options?: { limit?: number; excludeSessionId?: string }
  ): Promise<HistoricalFeedback[]> {
    if (chunkIds.length === 0) return [];

    const query = this.db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.status, 'completed'))
      .orderBy(desc(learningSessions.createdAt));

    const sessions = await (options?.limit ? query.limit(options.limit * 2) : query);

    const feedback: HistoricalFeedback[] = [];
    for (const session of sessions) {
      if (options?.excludeSessionId && session.id === options.excludeSessionId) continue;
      const sessionChunkIds = (session.chunkIds as string[]) || [];
      const overlap = sessionChunkIds.filter(id => chunkIds.includes(id));
      if (overlap.length === 0) continue;
      if (session.feedback) {
        feedback.push({
          session_id: session.id,
          feedback: session.feedback,
          session_mode: session.mode as HistoricalFeedback['session_mode'],
          completed_at: new Date(session.endTime || session.updatedAt).toISOString(),
          chunk_ids: overlap,
        });
      }
      if (options?.limit && feedback.length >= options.limit) break;
    }
    return feedback;
  }

  async persistBatchSessionChunkOperations(args: {
    sessionId: string;
    operations: BatchOperation[];
    existingChunks: SessionChunk[];
  }): Promise<BatchSessionChunkResult> {
    const { sessionId, operations, existingChunks } = args;
    const existingMap = new Map(existingChunks.map(c => [c.chunkId, c]));
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    const affectedChunkIds: string[] = [];
    const now = Date.now();

    await withTx(async tx => {
      for (const op of operations) {
        const existing = existingMap.get(op.chunkId);
        if (existing) {
          // Update existing
          const changes: Partial<SessionChunk> = { updatedAt: now };
          let hasChanges = false;
          if (op.status && op.status !== existing.status) {
            changes.status = op.status;
            hasChanges = true;
          }
          if (op.timeSpentMs !== undefined) {
            changes.timeSpentMs = op.timeSpentMs;
            hasChanges = true;
          }
          if (hasChanges) {
            await tx.update(sessionChunks).set(changes).where(eq(sessionChunks.id, existing.id));
            updated++;
            affectedChunkIds.push(op.chunkId);
          } else {
            unchanged++;
          }
        } else {
          // Create new
          const newChunk: NewSessionChunkRow = {
            id: crypto.randomUUID(),
            sessionId,
            chunkId: op.chunkId,
            status: op.status || 'pending',
            timeSpentMs: op.timeSpentMs || 0,
            createdAt: now,
            updatedAt: now,
          };
          await tx.insert(sessionChunks).values(newChunk);
          created++;
          affectedChunkIds.push(op.chunkId);
        }
      }
    });

    return { created, updated, unchanged, affectedChunkIds };
  }

  async validateChunkIds(chunkIds: string[]): Promise<ChunkValidationResult> {
    if (!chunkIds || chunkIds.length === 0) {
      return { valid: true, invalidIds: [], validIds: [] };
    }
    try {
      const existingChunks = await this.db
        .select({ id: learningChunks.id })
        .from(learningChunks)
        .where(inArray(learningChunks.id, chunkIds));
      const existingIds = new Set(existingChunks.map(c => c.id));
      const validIds: string[] = [];
      const invalidIds: string[] = [];
      for (const id of chunkIds) {
        if (existingIds.has(id)) validIds.push(id);
        else invalidIds.push(id);
      }
      return { valid: invalidIds.length === 0, invalidIds, validIds };
    } catch (error) {
      logger.error('Failed to validate chunk IDs:', error);
      return { valid: false, invalidIds: chunkIds, validIds: [] };
    }
  }
}
