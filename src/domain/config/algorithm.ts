// Configuration for spaced repetition algorithms
// Domain layer: type definition and clampEaseFactor only — no process.env reads

import { clamp } from '../../shared/math.js';
import { DEFAULT_ALGORITHM_CONFIG } from './algorithm-defaults.js';

export type AlgorithmConfig = {
  minimumEaseFactor: number; // floor for ease factor (>= 1.3)
  initialIntervalDays: number; // interval for the very first review (after first success)
  secondIntervalDays: number; // interval for the second successful review
  easeDeltaGood: number; // additive delta to EF when quality >= 4
  easeDeltaHard: number; // additive delta to EF when quality === 3
  easePenaltyFailure: number; // additive delta when quality < 3 (usually negative)
  priorityWeights: {
    urgency: number; // weight for time until next review
    ease: number; // weight for inverse ease
    repetitions: number; // weight for lower repetitions
    difficulty: number; // weight for difficulty
  };
  // Advanced parameters
  lapsePenalty: number; // additional EF delta applied when overdue
  // Fraction of the prior interval used as the post-lapse savings floor (NEU-927).
  // On a graded failure the recomputed interval is floored at
  // `coefficient × prior_interval` (prior interval proxies prior stability) so a
  // well-established chunk returns for spaced recovery instead of a first-exposure
  // reset. Provisional 0.2 (MM-T14 band 0.1–0.3); on by default.
  lapseSavingsCoefficient: number;
  maxConsecutiveLapses: number; // threshold for harsher reset
  leechFailureThreshold: number; // failures across window to consider leech
  leechConsecutiveFailures: number; // consecutive failures to consider leech
  leechEasePenaltyAdjustment: number; // extra negative delta applied when leech
  minLeechEasePenalty: number; // lower bound for leech penalty
  dailyCaps: { maxNew: number; maxReviews: number };
  tagWeights: Record<string, number>;
  // Session management parameters
  sessionConfig: {
    qualityThreshold: number; // 0-5 quality threshold for completion
    timeThresholdMs: number; // milliseconds for time-based completion
    completionThreshold: number; // 0-1 progress threshold for completion
    maxTimeMs: number; // maximum session time in milliseconds
  };
  // Recommendation-specific configuration
  recommendationConfig: {
    cognitiveLoad: {
      defaultMax: number; // default max cognitive load for a session
      easyThreshold: number; // threshold below which items are considered easy
      hardThreshold: number; // threshold above which items are considered hard
      perMinuteFactor: number; // heuristic factor to scale load with time
    };
    sessionComposition: {
      maxNewDefault: number; // default max new items if not specified
      shortSessionMinutes: number; // minutes threshold for short sessions
      maxNewShort: number; // max new items for short sessions
      longSessionMinutes: number; // minutes threshold for long sessions
      maxNewLong: number; // max new items for long sessions
      interleaveStrategy: 'easy-medium-hard' | 'balanced'; // strategy label
    };
    conversation: {
      enableEncouragement: boolean; // toggle encouragement messages
      enableProgressUpdates: boolean; // toggle progress updates
      verbosity: 'low' | 'medium' | 'high'; // guidance verbosity level
    };
    recencyWindowMs: number; // ms window for "recent" session activity boost (default 48h)
  };
  maxDependencyDepth: number; // max depth for dependency graph traversal
  weakAreaEaseThreshold: number; // ease factor below which a chunk is flagged as a weak area
  roadblockFollowups: Record<number, number>; // quality → required follow-up count for roadblock gate
};

export function clampEaseFactor(
  easeFactor: number,
  minimumEaseFactor: number = DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor
): number {
  return clamp(easeFactor, minimumEaseFactor, Infinity);
}
