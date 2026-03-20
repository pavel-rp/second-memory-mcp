// Hardcoded default values for spaced repetition algorithm configuration
// Based on learning science research — no I/O, no process.env reads

import type { AlgorithmConfig } from './algorithm.js';

export const DEFAULT_ALGORITHM_CONFIG: AlgorithmConfig = {
  minimumEaseFactor: 1.3,
  initialIntervalDays: 1,
  secondIntervalDays: 6,
  easeDeltaGood: 0.1,
  easeDeltaHard: -0.02,
  easePenaltyFailure: -0.2,
  priorityWeights: {
    urgency: 0.6,
    ease: 0.15,
    repetitions: 0.1,
    difficulty: 0.15,
  },
  lapsePenalty: -0.15,
  maxConsecutiveLapses: 3,
  leechFailureThreshold: 6,
  leechConsecutiveFailures: 3,
  leechEasePenaltyAdjustment: -0.05,
  minLeechEasePenalty: -0.25,
  dailyCaps: {
    maxNew: 20,
    maxReviews: 200,
  },
  tagWeights: {},
  sessionConfig: {
    qualityThreshold: 4.0,
    timeThresholdMs: 90 * 60 * 1000, // 90 minutes
    completionThreshold: 0.8, // 80%
    maxTimeMs: 120 * 60 * 1000, // 2 hours
  },
  recommendationConfig: {
    cognitiveLoad: {
      defaultMax: 20,
      easyThreshold: 8,
      hardThreshold: 15,
      perMinuteFactor: 0.5,
    },
    sessionComposition: {
      maxNewDefault: 3,
      shortSessionMinutes: 15,
      maxNewShort: 1,
      longSessionMinutes: 45,
      maxNewLong: 5,
      interleaveStrategy: 'easy-medium-hard',
    },
    conversation: {
      enableEncouragement: true,
      enableProgressUpdates: true,
      verbosity: 'medium',
    },
  },
  maxDependencyDepth: 5,
};
