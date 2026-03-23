import { eq, and, gte, lt, isNotNull } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  learningChunks,
  learningSessions,
  sessionQuestions,
  sessionQuestionChunks,
  sessionQuestionAttempts,
  learningTopics,
} from '../../infrastructure/db/schema.js';
import type { LearningChunk } from '../../domain/types/entities.js';
import type { PersistedReviewEntry } from '../../domain/types/analytics.js';
import type { ReviewPersistencePort } from '../../ports/review-persistence-port.js';

export class DrizzleReviewPersistenceAdapter implements ReviewPersistencePort {
  constructor(private db: SqlDb = getSql()) {}

  async getChunk(id: string): Promise<LearningChunk | undefined> {
    const [row] = await this.db.select().from(learningChunks).where(eq(learningChunks.id, id));
    return row;
  }

  async persistReviewUpdate(
    chunkId: string,
    updates: Partial<
      Pick<
        LearningChunk,
        | 'easeFactor'
        | 'repetitions'
        | 'intervalDays'
        | 'nextReviewAt'
        | 'chunkType'
        | 'lastReviewedAt'
        | 'updatedAt'
      >
    >
  ): Promise<number> {
    const res = await this.db
      .update(learningChunks)
      .set(updates)
      .where(eq(learningChunks.id, chunkId));
    return res.rowCount ?? 0;
  }

  async getReviewsByDateRange(from: Date, to: Date): Promise<PersistedReviewEntry[]> {
    const fromMs = from.getTime();
    const toMs = to.getTime();

    // Note: assessment questions with multiple chunk mappings produce one row per chunk.
    // This is intentional — each chunk gets its own analytics entry.
    const rows = await this.db
      .select({
        startTime: learningSessions.startTime,
        quality: sessionQuestionAttempts.quality,
        chunkType: learningChunks.chunkType,
        tagsJson: learningChunks.tagsJson,
        topicTitle: learningTopics.title,
      })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestions,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestions.id)
      )
      .innerJoin(
        sessionQuestionChunks,
        eq(sessionQuestions.id, sessionQuestionChunks.sessionQuestionId)
      )
      .innerJoin(learningSessions, eq(sessionQuestions.sessionId, learningSessions.id))
      .innerJoin(learningChunks, eq(sessionQuestionChunks.chunkId, learningChunks.id))
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
      .where(
        and(
          isNotNull(sessionQuestionAttempts.quality),
          gte(learningSessions.startTime, fromMs),
          lt(learningSessions.startTime, toMs)
        )
      );

    return rows.map(row => ({
      date: new Date(row.startTime).toISOString().split('T')[0] as string,
      quality: row.quality as number,
      isNew: row.chunkType === 'new',
      topic: row.topicTitle ?? '(unknown)',
      tags: row.tagsJson ?? [],
    }));
  }
}
