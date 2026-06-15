import { eq, and, gte, lt, isNotNull, sql } from 'drizzle-orm';
import { z } from 'zod';
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
import type {
  ReviewPersistencePort,
  GetWeakAreasOptions,
  WeakAreaResult,
} from '../../ports/review-persistence-port.js';
import { toIsoTimestamp } from '../../shared/date-helpers.js';
import { timedQuery } from './timed-query.js';

const weakAreaRowSchema = z.object({
  chunk_id: z.string(),
  chunk_title: z.string(),
  topic_title: z.string(),
  low_count: z.coerce.number(),
  recent_attempts: z.coerce.number(),
  avg_recent_quality: z.coerce.number(),
});

export class DrizzleReviewPersistenceAdapter implements ReviewPersistencePort {
  constructor(private db: SqlDb = getSql()) {}

  async getChunk(id: string): Promise<LearningChunk | undefined> {
    return timedQuery('reviewPersistence.getChunk', async () => {
      const [row] = await this.db.select().from(learningChunks).where(eq(learningChunks.id, id));
      return row;
    });
  }

  async persistReviewUpdate(
    chunkId: string,
    updates: Partial<
      Pick<
        LearningChunk,
        | 'easeFactor'
        | 'repetitions'
        | 'consecutiveFailures'
        | 'intervalDays'
        | 'nextReviewAt'
        | 'chunkType'
        | 'lastReviewedAt'
        | 'updatedAt'
      >
    >
  ): Promise<number> {
    return timedQuery('reviewPersistence.persistReviewUpdate', async () => {
      const res = await this.db
        .update(learningChunks)
        .set(updates)
        .where(eq(learningChunks.id, chunkId));
      return res.rowCount ?? 0;
    });
  }

  async getReviewsByDateRange(from: Date, to: Date): Promise<PersistedReviewEntry[]> {
    return timedQuery('reviewPersistence.getReviewsByDateRange', async () => {
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
        date: toIsoTimestamp(row.startTime),
        quality: row.quality as number,
        isNew: row.chunkType === 'new',
        topic: row.topicTitle ?? '(unknown)',
        tags: row.tagsJson ?? [],
      }));
    });
  }

  async getWeakAreas(options?: GetWeakAreasOptions): Promise<WeakAreaResult[]> {
    return timedQuery('reviewPersistence.getWeakAreas', async () => {
      const qualityThreshold = options?.qualityThreshold ?? 2;
      const minLowCount = options?.minLowCount ?? 2;
      const lookbackCount = options?.lookbackCount ?? 3;
      const limit = options?.limit ?? 5;

      const query = sql`
      WITH ranked_attempts AS (
        SELECT
          sqc.chunk_id,
          sqa.quality,
          ROW_NUMBER() OVER (PARTITION BY sqc.chunk_id ORDER BY sqa.created_at DESC, sqa.id DESC) AS rn
        FROM session_question_attempts sqa
        INNER JOIN session_question_chunks sqc
          ON sqa.session_question_id = sqc.session_question_id
        WHERE sqa.quality IS NOT NULL
      ),
      last_n AS (
        SELECT chunk_id, quality
        FROM ranked_attempts
        WHERE rn <= ${lookbackCount}
      ),
      weak AS (
        SELECT
          chunk_id,
          COUNT(*) FILTER (WHERE quality <= ${qualityThreshold}) AS low_count,
          COUNT(*) AS recent_attempts,
          AVG(quality)::real AS avg_recent_quality
        FROM last_n
        GROUP BY chunk_id
        HAVING COUNT(*) FILTER (WHERE quality <= ${qualityThreshold}) >= ${minLowCount}
      )
      SELECT
        w.chunk_id,
        lc.title AS chunk_title,
        COALESCE(lt.title, '(unknown)') AS topic_title,
        w.low_count,
        w.recent_attempts,
        w.avg_recent_quality
      FROM weak w
      INNER JOIN learning_chunks lc ON w.chunk_id = lc.id
      LEFT JOIN learning_topics lt ON lc.topic_id = lt.id
      ORDER BY w.avg_recent_quality ASC, lc.ease_factor ASC, w.chunk_id ASC
      LIMIT ${limit}
    `;

      const result = await this.db.execute(query);
      return result.rows.map(row => {
        const parsed = weakAreaRowSchema.parse(row);
        return {
          chunkId: parsed.chunk_id,
          chunkTitle: parsed.chunk_title,
          topicTitle: parsed.topic_title,
          lowCount: parsed.low_count,
          recentAttempts: parsed.recent_attempts,
          avgRecentQuality: parsed.avg_recent_quality,
        };
      });
    });
  }
}
