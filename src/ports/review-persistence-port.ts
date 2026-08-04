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

/**
 * One scored question's first attempt — the observation unit of the NEU-845
 * scheduler-health metrics. A question contributes exactly one of these, never
 * two: the `attempt_number = 2` pivot-hint retry is folded into `eventualPassed`
 * and never becomes its own observation.
 */
export type FirstAttemptObservation = {
  sessionQuestionId: string;
  /** `passed` on the `attempt_number = 1` row — the only input to true retention. */
  firstAttemptPassed: boolean;
  /** Passed on attempt 1 **or** on the attempt-2 pivot-hint retry. */
  eventualPassed: boolean;
  /** `'established'` | `'fresh'` | `null`. `null` means uncovered — no snapshot was recorded. */
  snapshotBand: string | null;
  /**
   * NEU-846 extension seam: carried so calibration needs no new port method,
   * no adapter change and no second round-trip. NEU-845 never reads it.
   */
  snapshotPredictedRecall: number | null;
  /** The chunk's `intervalDays` verbatim at answer time. */
  snapshotIntervalDays: number | null;
  /** `classifyChunk`'s `daysOverdue`, clamped at 0. Fractional days. */
  snapshotDaysOverdue: number | null;
  /** The mapped `session_chunks.teaching_approach`, or `null` when absent or ambiguous. */
  teachingApproach: string | null;
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
  /**
   * Every scored question's first attempt over all history — the observation set
   * the NEU-845 scheduler-health metrics are computed from.
   *
   * Guarantees **exactly one row per `session_question_id`**: the
   * `session_question_chunks` mapping is aggregated away rather than joined
   * through, so a question mapped to several chunks still yields a single row.
   *
   * `teachingApproach` is the question's single mapped `session_chunks`
   * teaching approach, and `null` whenever that is not unambiguous — the
   * question maps to more than one chunk, the mapped `session_chunks` row is
   * missing or carries a null approach, or duplicate rows disagree. There is no
   * single teaching tier in those cases, and the domain maps `null` to the
   * `unknown` tier.
   *
   * Rows whose `snapshotBand` is `null` (uncovered — pre-cutover, multi-chunk
   * assessment attempts, or a failed best-effort chunk read) are **returned**,
   * not filtered: they are the coverage denominator, and suppressing them would
   * make the reported coverage a lie. They contribute to no rate.
   */
  getFirstAttemptObservations(): Promise<FirstAttemptObservation[]>;
}
