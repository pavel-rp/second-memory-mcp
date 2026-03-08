import { eq, and, gte, lt, isNotNull } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  learningChunks,
  learningSessions,
  sessionChunks,
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

    const rows = await this.db
      .select({
        startTime: learningSessions.startTime,
        qualityScoresJson: sessionChunks.qualityScoresJson,
        chunkType: learningChunks.chunkType,
        tagsJson: learningChunks.tagsJson,
        topicTitle: learningTopics.title,
      })
      .from(sessionChunks)
      .innerJoin(learningSessions, eq(sessionChunks.sessionId, learningSessions.id))
      .innerJoin(learningChunks, eq(sessionChunks.chunkId, learningChunks.id))
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
      .where(
        and(
          isNotNull(sessionChunks.qualityScoresJson),
          gte(learningSessions.startTime, fromMs),
          lt(learningSessions.startTime, toMs)
        )
      );

    const entries: PersistedReviewEntry[] = [];

    for (const row of rows) {
      const scores = row.qualityScoresJson;
      if (!scores || scores.length === 0) continue;

      const date = new Date(row.startTime).toISOString().split('T')[0];
      const isNew = row.chunkType === 'new';
      const topic = row.topicTitle ?? '(unknown)';
      const tags = row.tagsJson ?? [];

      // A single session_chunk can have multiple quality scores (e.g. retries within a session),
      // so each score becomes its own PersistedReviewEntry.
      for (const quality of scores) {
        entries.push({ date, quality, isNew, topic, tags });
      }
    }

    return entries;
  }
}
