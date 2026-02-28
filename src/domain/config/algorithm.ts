// Configuration for spaced repetition algorithms
// Simple typed config with environment overrides (no secrets)

import { clamp } from '../../shared/math.js';

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
  // Recommendation-specific configuration (env-driven)
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
  };
  // Prerequisite validation configuration
  prerequisiteConfig: {
    mastery: {
      minimumQualityScore: number; // minimum average quality score for mastery (0-5)
      requiredAttempts: number; // minimum successful attempts required
      recencyDays: number; // max age in days for attempts to be considered recent
      successRate: number; // minimum success rate required (0-1)
    };
    validation: {
      strictValidation: boolean; // fail on any invalid prerequisite references
      maxDependencyDepth: number; // max depth for dependency graph traversal
      enableCaching: boolean; // cache mastery status results for performance
      cacheExpiryMs: number; // cache expiry time in milliseconds
    };
  };
};

function parseNumber(envValue: string | undefined, fallback: number): number {
  if (envValue == null || envValue.trim() === '') return fallback;
  const parsed = Number(envValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseRecord(envValue: string | undefined): Record<string, number> {
  // Expect JSON like {"tagA":1.2,"tagB":0.8}
  if (!envValue) return {};
  try {
    const raw: unknown = JSON.parse(envValue);
    if (typeof raw !== 'object' || raw === null) return {};
    const obj = raw as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj)) {
      let n: number | undefined;
      if (typeof v === 'number') {
        n = v;
      } else if (typeof v === 'string') {
        const parsed = Number(v);
        if (Number.isFinite(parsed)) n = parsed;
      }
      if (n !== undefined && Number.isFinite(n)) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

function parseBoolean(envValue: string | undefined, fallback: boolean): boolean {
  if (envValue == null || envValue.trim() === '') return fallback;
  const v = envValue.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
  return fallback;
}

const minimumEaseFactor = Math.max(parseNumber(process.env.SM_MIN_EASE_FACTOR, 1.3), 1.3);

export const algorithmConfig: AlgorithmConfig = {
  minimumEaseFactor,
  initialIntervalDays: parseNumber(process.env.SM_INITIAL_INTERVAL_DAYS, 1),
  secondIntervalDays: parseNumber(process.env.SM_SECOND_INTERVAL_DAYS, 6),
  easeDeltaGood: parseNumber(process.env.SM_EASE_DELTA_GOOD, 0.1),
  easeDeltaHard: parseNumber(process.env.SM_EASE_DELTA_HARD, -0.02),
  easePenaltyFailure: parseNumber(process.env.SM_EASE_PENALTY_FAILURE, -0.2),
  priorityWeights: {
    urgency: parseNumber(process.env.SM_PRIORITY_W_URGENCY, 0.6),
    ease: parseNumber(process.env.SM_PRIORITY_W_EASE, 0.15),
    repetitions: parseNumber(process.env.SM_PRIORITY_W_REPS, 0.1),
    difficulty: parseNumber(process.env.SM_PRIORITY_W_DIFF, 0.15),
  },
  lapsePenalty: parseNumber(process.env.SM_LAPSE_PENALTY, -0.15),
  maxConsecutiveLapses: parseNumber(process.env.SM_MAX_CONSEC_LAPSES, 3),
  leechFailureThreshold: parseNumber(process.env.SM_LEECH_FAIL_THRESHOLD, 6),
  leechConsecutiveFailures: parseNumber(process.env.SM_LEECH_CONSEC_FAILS, 3),
  leechEasePenaltyAdjustment: parseNumber(process.env.SM_LEECH_EASE_ADJUST, -0.05),
  minLeechEasePenalty: parseNumber(process.env.SM_MIN_LEECH_EASE_PENALTY, -0.25),
  dailyCaps: {
    maxNew: parseNumber(process.env.SM_DAILY_CAP_NEW, 20),
    maxReviews: parseNumber(process.env.SM_DAILY_CAP_REVIEWS, 200),
  },
  tagWeights: parseRecord(process.env.SM_TAG_WEIGHTS),
  sessionConfig: {
    qualityThreshold: parseNumber(process.env.SM_SESSION_QUALITY_THRESHOLD, 4.0),
    timeThresholdMs: parseNumber(process.env.SM_SESSION_TIME_THRESHOLD_MS, 90 * 60 * 1000), // 90 minutes
    completionThreshold: parseNumber(process.env.SM_SESSION_COMPLETION_THRESHOLD, 0.8), // 80%
    maxTimeMs: parseNumber(process.env.SM_SESSION_MAX_TIME_MS, 120 * 60 * 1000), // 2 hours
  },
  recommendationConfig: {
    cognitiveLoad: {
      defaultMax: parseNumber(process.env.SM_REC_MAX_COG_LOAD_DEFAULT, 20),
      easyThreshold: parseNumber(process.env.SM_REC_COG_EASY_THRESHOLD, 8),
      hardThreshold: parseNumber(process.env.SM_REC_COG_HARD_THRESHOLD, 15),
      perMinuteFactor: parseNumber(process.env.SM_REC_COG_PER_MIN_FACTOR, 0.5),
    },
    sessionComposition: {
      maxNewDefault: parseNumber(process.env.SM_REC_MAX_NEW_DEFAULT, 3),
      shortSessionMinutes: parseNumber(process.env.SM_REC_SHORT_SESSION_MIN, 15),
      maxNewShort: parseNumber(process.env.SM_REC_MAX_NEW_SHORT, 1),
      longSessionMinutes: parseNumber(process.env.SM_REC_LONG_SESSION_MIN, 45),
      maxNewLong: parseNumber(process.env.SM_REC_MAX_NEW_LONG, 5),
      interleaveStrategy:
        (process.env.SM_REC_INTERLEAVE_STRATEGY as 'easy-medium-hard' | 'balanced') ||
        'easy-medium-hard',
    },
    conversation: {
      enableEncouragement: parseBoolean(process.env.SM_REC_CONVO_ENCOURAGEMENT, true),
      enableProgressUpdates: parseBoolean(process.env.SM_REC_CONVO_PROGRESS, true),
      verbosity: (process.env.SM_REC_CONVO_VERBOSITY as 'low' | 'medium' | 'high') || 'medium',
    },
  },
  prerequisiteConfig: {
    mastery: {
      minimumQualityScore: parseNumber(process.env.SM_PREREQ_MIN_QUALITY, 4.0),
      requiredAttempts: parseNumber(process.env.SM_PREREQ_REQUIRED_ATTEMPTS, 2),
      recencyDays: parseNumber(process.env.SM_PREREQ_RECENCY_DAYS, 30),
      successRate: parseNumber(process.env.SM_PREREQ_SUCCESS_RATE, 0.8),
    },
    validation: {
      strictValidation: parseBoolean(process.env.SM_PREREQ_STRICT_VALIDATION, false),
      maxDependencyDepth: parseNumber(process.env.SM_PREREQ_MAX_DEPTH, 5),
      enableCaching: parseBoolean(process.env.SM_PREREQ_ENABLE_CACHE, true),
      cacheExpiryMs: parseNumber(process.env.SM_PREREQ_CACHE_EXPIRY_MS, 5 * 60 * 1000), // 5 minutes default
    },
  },
};

export function clampEaseFactor(easeFactor: number): number {
  return clamp(easeFactor, algorithmConfig.minimumEaseFactor, Infinity);
}
