import { eq, and, gte, lt, isNotNull, inArray, sql } from 'drizzle-orm';
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
  FirstAttemptObservation,
} from '../../ports/review-persistence-port.js';
import { toIsoTimestamp } from '../../shared/date-helpers.js';
import { GRADE_PASS_THRESHOLD } from '../../domain/algorithms/over-validation-guard.js';

const reviewObservationRowSchema = z.object({
  chunk_id: z.string(),
  successes: z.coerce.number(),
  failures: z.coerce.number(),
});

const weakAreaRowSchema = z.object({
  chunk_id: z.string(),
  chunk_title: z.string(),
  topic_title: z.string(),
  low_count: z.coerce.number(),
  recent_attempts: z.coerce.number(),
  avg_recent_quality: z.coerce.number(),
});

// The pg driver hands back real booleans for boolean columns but strings for
// several numeric types, hence z.boolean() for the two flags (z.coerce.boolean()
// would turn the string "false" into true) and z.coerce.number() for the
// numeric snapshot columns. `.nullable()` short-circuits before coercion, so a
// NULL column never becomes 0.
const firstAttemptObservationRowSchema = z.object({
  session_question_id: z.string(),
  first_attempt_passed: z.boolean(),
  eventual_passed: z.boolean(),
  snapshot_band: z.string().nullable(),
  snapshot_predicted_recall: z.coerce.number().nullable(),
  snapshot_interval_days: z.coerce.number().nullable(),
  snapshot_days_overdue: z.coerce.number().nullable(),
  teaching_approach: z.string().nullable(),
});

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
        | 'consecutiveFailures'
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

  async countAttempts(chunkId: string): Promise<number> {
    // Lifetime graded-attempt count for a chunk: attempts join to chunks through
    // session_question_chunks (a question may map to several chunks). Only graded
    // attempts (quality NOT NULL) count as evidence, matching getWeakAreas.
    const [row] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestionChunks,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestionChunks.sessionQuestionId)
      )
      .where(
        and(eq(sessionQuestionChunks.chunkId, chunkId), isNotNull(sessionQuestionAttempts.quality))
      );
    return Number(row?.count ?? 0);
  }

  async getReviewObservations(
    chunkIds: string[]
  ): Promise<Map<string, { successes: number; failures: number }>> {
    const result = new Map<string, { successes: number; failures: number }>();
    if (chunkIds.length === 0) return result;

    // Per-chunk graded-attempt outcome counts (multi-observation history for the
    // NEU-931 durability gate). Only graded attempts (quality NOT NULL) count as
    // evidence, matching countAttempts/getWeakAreas. pass = quality >= threshold.
    const rows = await this.db
      .select({
        chunk_id: sessionQuestionChunks.chunkId,
        successes: sql<number>`count(*) filter (where ${sessionQuestionAttempts.quality} >= ${GRADE_PASS_THRESHOLD})`,
        failures: sql<number>`count(*) filter (where ${sessionQuestionAttempts.quality} < ${GRADE_PASS_THRESHOLD})`,
      })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestionChunks,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestionChunks.sessionQuestionId)
      )
      .where(
        and(
          inArray(sessionQuestionChunks.chunkId, chunkIds),
          isNotNull(sessionQuestionAttempts.quality)
        )
      )
      .groupBy(sessionQuestionChunks.chunkId);

    for (const row of rows) {
      const parsed = reviewObservationRowSchema.parse(row);
      result.set(parsed.chunk_id, {
        successes: parsed.successes,
        failures: parsed.failures,
      });
    }
    return result;
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
      date: toIsoTimestamp(row.startTime),
      quality: row.quality as number,
      isNew: row.chunkType === 'new',
      topic: row.topicTitle ?? '(unknown)',
      tags: row.tagsJson ?? [],
    }));
  }

  async getWeakAreas(options?: GetWeakAreasOptions): Promise<WeakAreaResult[]> {
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
  }

  async getFirstAttemptObservations(): Promise<FirstAttemptObservation[]> {
    // One row per scored question over all history (NEU-845). Three CTEs:
    //
    //  first_attempts — the attempt_number = 1 row, unique per question via
    //    uq_session_question_attempts_question_number. Carries the four NEU-844
    //    snapshot columns. Deliberately NOT filtered on snapshot_band: uncovered
    //    rows are the coverage denominator.
    //  retry — the attempt_number = 2 pivot-hint row, also unique per question.
    //    LEFT JOINed, so a question with no retry is unaffected.
    //  tier — the question's teaching approach, aggregated by question id. The
    //    two-column join to session_chunks (session_id AND chunk_id) can fan out
    //    because session_chunks has no unique index on that pair, and a question
    //    may map to several chunks; grouping collapses both. The approach is
    //    emitted only when the question maps to exactly one distinct chunk that
    //    resolves to exactly one distinct non-null approach — otherwise there is
    //    no single tier and the column is NULL. COUNT(DISTINCT ...) ignores
    //    NULLs, so a missing or null approach yields 0 and falls to NULL too.
    const query = sql`
      WITH first_attempts AS (
        SELECT
          sqa.session_question_id,
          sqa.passed,
          sqa.snapshot_band,
          sqa.snapshot_predicted_recall,
          sqa.snapshot_interval_days,
          sqa.snapshot_days_overdue
        FROM session_question_attempts sqa
        WHERE sqa.attempt_number = 1
      ),
      retry AS (
        SELECT
          sqa.session_question_id,
          sqa.passed
        FROM session_question_attempts sqa
        WHERE sqa.attempt_number = 2
      ),
      tier AS (
        SELECT
          sq.id AS session_question_id,
          CASE
            WHEN COUNT(DISTINCT sqc.chunk_id) = 1
             AND COUNT(DISTINCT sc.teaching_approach) = 1
            THEN MIN(sc.teaching_approach)
            ELSE NULL
          END AS teaching_approach
        FROM session_questions sq
        INNER JOIN session_question_chunks sqc
          ON sqc.session_question_id = sq.id
        LEFT JOIN session_chunks sc
          ON sc.session_id = sq.session_id
         AND sc.chunk_id = sqc.chunk_id
        GROUP BY sq.id
      )
      SELECT
        fa.session_question_id,
        fa.passed AS first_attempt_passed,
        (fa.passed OR COALESCE(r.passed, FALSE)) AS eventual_passed,
        fa.snapshot_band,
        fa.snapshot_predicted_recall,
        fa.snapshot_interval_days,
        fa.snapshot_days_overdue,
        t.teaching_approach
      FROM first_attempts fa
      LEFT JOIN retry r ON r.session_question_id = fa.session_question_id
      LEFT JOIN tier t ON t.session_question_id = fa.session_question_id
      ORDER BY fa.session_question_id
    `;

    const result = await this.db.execute(query);
    return result.rows.map(row => {
      const parsed = firstAttemptObservationRowSchema.parse(row);
      return {
        sessionQuestionId: parsed.session_question_id,
        firstAttemptPassed: parsed.first_attempt_passed,
        eventualPassed: parsed.eventual_passed,
        snapshotBand: parsed.snapshot_band,
        snapshotPredictedRecall: parsed.snapshot_predicted_recall,
        snapshotIntervalDays: parsed.snapshot_interval_days,
        snapshotDaysOverdue: parsed.snapshot_days_overdue,
        teachingApproach: parsed.teaching_approach,
      };
    });
  }
}
