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
};

export type AdvancedNextReviewOutput = NextReviewOutput & {
  leech?: boolean;
};

export type RankCandidate = {
  id: string;
  nextReviewDate: string; // ISO date
  easeFactor: number;
  repetitions: number;
  difficulty: number; // 1..10
  tags?: string[];
};

export type RankInput = {
  candidates: RankCandidate[];
  timeboxMinutes?: number;
};

export type RankOutput = { orderedIds: string[] };
