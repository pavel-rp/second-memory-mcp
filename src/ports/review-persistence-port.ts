import type { LearningChunk } from '../domain/types/entities.js';
import type { PersistedReviewEntry } from '../domain/types/analytics.js';

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
  getChunk(id: string): Promise<LearningChunk | undefined>;
  persistReviewUpdate(
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
  ): Promise<number>;
  /** Fetch reviews in the half-open range [from, to). */
  getReviewsByDateRange(from: Date, to: Date): Promise<PersistedReviewEntry[]>;
}
