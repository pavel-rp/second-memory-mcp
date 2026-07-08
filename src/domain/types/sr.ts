export type NextReviewInput = {
  quality: number; // 0..5
  repetitions: number; // >=0
  easeFactor: number; // >=1.3
  interval: number; // days
};

export type NextReviewOutput = {
  interval: number; // days
  repetitions: number;
  easeFactor: number; // floored at 1.3
  nextReview: string; // ISO date (YYYY-MM-DD)
};

export type PriorityInput = {
  nextReviewDate: string; // ISO date
  easeFactor: number;
  repetitions: number;
  difficulty: number; // 1..10
};

export type PriorityOutput = { priority: number };

// Advanced
export type AdvancedNextReviewInput = NextReviewInput & {
  daysOverdue?: number; // days overdue beyond scheduled date (>0)
  consecutiveFailures?: number; // recent consecutive failures
  // Lifetime graded attempts for this chunk. Gates leech flagging behind a
  // minimum evidence base (config.leechFailureThreshold): a chunk cannot be
  // branded a leech before it has been attempted enough times. Injected by the
  // orchestration layer (fetched via an adapter) to keep the calculator pure.
  // Absent → 0 → the evidence gate stays closed and no leech is flagged.
  totalAttempts?: number;
};

export type AdvancedNextReviewOutput = NextReviewOutput & {
  leech?: boolean;
};

/**
 * Internal camelCase representation of a rank candidate.
 * The canonical Zod schema (snake_case) lives in spaced-repetition-tools.ts;
 * conversion from snake_case to camelCase happens in the server tool layer.
 */
export type InternalRankCandidate = {
  id: string;
  nextReviewDate: string; // ISO date
  easeFactor: number;
  repetitions: number;
  difficulty: number; // 1..10
  tags?: string[];
  estimatedDuration?: number; // minutes
};

export type RankInput = {
  candidates: InternalRankCandidate[];
  timeboxMinutes?: number;
};

export type RankedItem = {
  id: string;
  priority: number;
  reason: string;
  order: number;
  cognitiveLoad: number;
};

export type RankSummary = {
  totalCandidates: number;
  selectedCount: number;
  totalDuration: number;
  timeboxApplied: boolean;
};

export type RankOutput = {
  orderedIds: string[];
  ranked: RankedItem[];
  summary: RankSummary;
  warning?: string;
};
