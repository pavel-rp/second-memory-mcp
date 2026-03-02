import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { learningChunks } from '../../infrastructure/db/schema.js';
import type { LearningChunk } from '../../domain/types/entities.js';
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
}
