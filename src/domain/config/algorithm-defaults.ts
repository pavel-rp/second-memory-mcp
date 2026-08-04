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
  lapseSavingsCoefficient: 0.2,
  maxConsecutiveLapses: 3,
  leechFailureThreshold: 6,
  leechConsecutiveFailures: 3,
  leechEasePenaltyAdjustment: -0.05,
  minLeechEasePenalty: -0.25,
  dailyCaps: {
    // ENGINEERING DEFAULT, not evidence-derived (NEU-848 pedagogy audit found no
    // anchoring evidence for these caps).
    maxNew: 20,
    maxReviews: 200,
  },
  tagWeights: {},
  sessionConfig: {
    qualityThreshold: 4.0,
    // 90 minutes — ENGINEERING DEFAULT, not evidence-derived (NEU-848 pedagogy
    // audit found no anchoring evidence). No longer the break trigger — NEU-848
    // replaced that with the measured fatigue advisory (`resolveSessionAdvisory`).
    // Remains the minimum-practice-time input to the surviving
    // `qualityMet && timeMet` -> 'complete' completion heuristic.
    timeThresholdMs: 90 * 60 * 1000,
    completionThreshold: 0.8, // 80%
    // 2 hours — ENGINEERING DEFAULT, not evidence-derived (NEU-848 pedagogy audit
    // found no anchoring evidence). Remains the hard ceiling backstop, now
    // surfaced both through `session_status` and in-band as a recurring
    // `time_ceiling` stopping advisory.
    maxTimeMs: 120 * 60 * 1000,
  },
  recommendationConfig: {
    conversation: {
      enableEncouragement: true,
      enableProgressUpdates: true,
      verbosity: 'medium',
    },
    recencyWindowMs: 172_800_000, // 48 hours
  },
  maxDependencyDepth: 5,
  weakAreaEaseThreshold: 2.5,
  roadblockFollowups: { 0: 3, 1: 3, 2: 2, 3: 1, 4: 1, 5: 0 },
  overValidationCeiling: 0.1, // NEU-929 / MM-T5 — provisional false-accept ceiling
  durabilityPosteriorBar: 0.9, // NEU-931 / MM-T8 — provisional prerequisite durability bar
};
