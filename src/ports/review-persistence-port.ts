import type { LearningChunkRow } from '../db/schema.js';

/** Data returned after persisting a review result. */
export type ReviewResultData = {
  previous: {
    easeFactor: number;
    repetitions: number;
    intervalDays: number | null;
    nextReviewAt: number;
    chunkType: string;
  };
  updated: {
    easeFactor: number;
    repetitions: number;
    intervalDays: number;
    nextReviewAt: number;
    chunkType: string;
    lastReviewedAt: number;
  };
  quality: number;
  isLapse: boolean;
  consecutiveFailures: number;
  isLeech: boolean;
};

/**
 * Port interface for persisting review results.
 * Decouples the processReviewResult orchestration from Drizzle.
 */
export interface ReviewPersistencePort {
  getChunk(id: string): Promise<LearningChunkRow | undefined>;
  persistReviewUpdate(
    chunkId: string,
    updates: Partial<
      Pick<
        LearningChunkRow,
        | 'easeFactor'
        | 'repetitions'
        | 'intervalDays'
        | 'nextReviewAt'
        | 'chunkType'
        | 'lastReviewedAt'
        | 'updatedAt'
      >
    >
  ): Promise<number>;
}
