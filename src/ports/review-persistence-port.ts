import type { LearningChunk } from '../domain/types/entities.js';
import type { PersistedReviewEntry } from '../domain/types/analytics.js';

/** Options for identifying weak areas based on recent review quality. */
export type GetWeakAreasOptions = {
  /** Quality score at or below which an attempt is considered "low". Default: 2 */
  qualityThreshold?: number;
  /** Minimum number of low-quality attempts within the lookback window to flag a chunk. Default: 2 */
  minLowCount?: number;
  /** Number of most recent attempts per chunk to examine. Default: 3 */
  lookbackCount?: number;
  /** Maximum number of weak areas to return. Default: 5 */
  limit?: number;
};

/** A chunk identified as a weak area based on recent low-quality reviews. */
export type WeakAreaResult = {
  chunkId: string;
  chunkTitle: string;
  topicTitle: string;
  lowCount: number;
  recentAttempts: number;
  avgRecentQuality: number;
};

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
        | 'consecutiveFailures'
        | 'intervalDays'
        | 'nextReviewAt'
        | 'chunkType'
        | 'lastReviewedAt'
        | 'updatedAt'
      >
    >
  ): Promise<number>;
  /**
   * Count the graded attempts recorded against a chunk over its lifetime.
   * This is the evidence base that gates leech flagging: a chunk cannot be
   * branded a leech before it has been attempted a minimum number of times.
   * Only attempts with a non-null quality are counted (ungraded attempts carry
   * no signal), mirroring the weak-area derivation.
   */
  countAttempts(chunkId: string): Promise<number>;
  /**
   * Batched per-chunk graded-attempt outcome counts, the multi-observation
   * review history that feeds the NEU-931 durability gate's retrievability
   * posterior. For each requested chunk id, returns the number of graded
   * attempts (quality NOT NULL) that passed (quality >= GRADE_PASS_THRESHOLD)
   * vs. failed. Chunks with no graded attempts are omitted from the map, which
   * the caller treats as an empty history (fail-closed). Attempts join to
   * chunks through session_question_chunks, matching countAttempts/getWeakAreas.
   */
  getReviewObservations(
    chunkIds: string[]
  ): Promise<Map<string, { successes: number; failures: number }>>;
  /** Fetch reviews in the half-open range [from, to). */
  getReviewsByDateRange(from: Date, to: Date): Promise<PersistedReviewEntry[]>;
  /** Identify chunks where the learner is struggling based on recent low-quality reviews. */
  getWeakAreas(options?: GetWeakAreasOptions): Promise<WeakAreaResult[]>;
}
