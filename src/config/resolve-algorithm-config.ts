// Composition root layer: reads process.env and merges with domain defaults
// This is the only place algorithm config touches environment variables

import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../domain/config/algorithm-defaults.js';
import {
  parseNumber,
  parseBoolean,
  parseRecord,
  parseEnum,
  parseIntegerWithMinimum,
} from '../shared/env-parsing.js';
import { logger } from '../shared/logger.js';

export function resolveAlgorithmConfig(
  env: Record<string, string | undefined> = process.env
): AlgorithmConfig {
  const minimumEaseFactor = Math.max(
    parseNumber(env.SM_MIN_EASE_FACTOR, DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor),
    DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor
  );

  return {
    minimumEaseFactor,
    initialIntervalDays: parseNumber(
      env.SM_INITIAL_INTERVAL_DAYS,
      DEFAULT_ALGORITHM_CONFIG.initialIntervalDays
    ),
    secondIntervalDays: parseNumber(
      env.SM_SECOND_INTERVAL_DAYS,
      DEFAULT_ALGORITHM_CONFIG.secondIntervalDays
    ),
    easeDeltaGood: parseNumber(env.SM_EASE_DELTA_GOOD, DEFAULT_ALGORITHM_CONFIG.easeDeltaGood),
    easeDeltaHard: parseNumber(env.SM_EASE_DELTA_HARD, DEFAULT_ALGORITHM_CONFIG.easeDeltaHard),
    easePenaltyFailure: parseNumber(
      env.SM_EASE_PENALTY_FAILURE,
      DEFAULT_ALGORITHM_CONFIG.easePenaltyFailure
    ),
    priorityWeights: {
      urgency: parseNumber(
        env.SM_PRIORITY_W_URGENCY,
        DEFAULT_ALGORITHM_CONFIG.priorityWeights.urgency
      ),
      ease: parseNumber(env.SM_PRIORITY_W_EASE, DEFAULT_ALGORITHM_CONFIG.priorityWeights.ease),
      repetitions: parseNumber(
        env.SM_PRIORITY_W_REPS,
        DEFAULT_ALGORITHM_CONFIG.priorityWeights.repetitions
      ),
      difficulty: parseNumber(
        env.SM_PRIORITY_W_DIFF,
        DEFAULT_ALGORITHM_CONFIG.priorityWeights.difficulty
      ),
    },
    lapsePenalty: parseNumber(env.SM_LAPSE_PENALTY, DEFAULT_ALGORITHM_CONFIG.lapsePenalty),
    lapseSavingsCoefficient: parseNumber(
      env.SM_LAPSE_SAVINGS_COEFFICIENT,
      DEFAULT_ALGORITHM_CONFIG.lapseSavingsCoefficient
    ),
    maxConsecutiveLapses: parseNumber(
      env.SM_MAX_CONSEC_LAPSES,
      DEFAULT_ALGORITHM_CONFIG.maxConsecutiveLapses
    ),
    leechFailureThreshold: parseNumber(
      env.SM_LEECH_FAIL_THRESHOLD,
      DEFAULT_ALGORITHM_CONFIG.leechFailureThreshold
    ),
    leechConsecutiveFailures: parseNumber(
      env.SM_LEECH_CONSEC_FAILS,
      DEFAULT_ALGORITHM_CONFIG.leechConsecutiveFailures
    ),
    leechEasePenaltyAdjustment: parseNumber(
      env.SM_LEECH_EASE_ADJUST,
      DEFAULT_ALGORITHM_CONFIG.leechEasePenaltyAdjustment
    ),
    minLeechEasePenalty: parseNumber(
      env.SM_MIN_LEECH_EASE_PENALTY,
      DEFAULT_ALGORITHM_CONFIG.minLeechEasePenalty
    ),
    dailyCaps: {
      // ENGINEERING DEFAULT, not evidence-derived (NEU-848 pedagogy audit found no
      // anchoring evidence for this cap).
      maxNew: parseNumber(env.SM_DAILY_CAP_NEW, DEFAULT_ALGORITHM_CONFIG.dailyCaps.maxNew),
      // ENGINEERING DEFAULT, not evidence-derived (NEU-848 pedagogy audit found no
      // anchoring evidence for this cap).
      maxReviews: parseNumber(
        env.SM_DAILY_CAP_REVIEWS,
        DEFAULT_ALGORITHM_CONFIG.dailyCaps.maxReviews
      ),
    },
    tagWeights: parseRecord(env.SM_TAG_WEIGHTS),
    sessionConfig: {
      qualityThreshold: parseNumber(
        env.SM_SESSION_QUALITY_THRESHOLD,
        DEFAULT_ALGORITHM_CONFIG.sessionConfig.qualityThreshold
      ),
      completionThreshold: parseNumber(
        env.SM_SESSION_COMPLETION_THRESHOLD,
        DEFAULT_ALGORITHM_CONFIG.sessionConfig.completionThreshold
      ),
      // PROVISIONAL DEFAULT, not evidence-derived (NEU-1016). Gap size (ms)
      // at/above which a sitting ends and a new one starts at zero active time.
      idleCutoffMs: parseNumber(
        env.SM_SESSION_IDLE_CUTOFF_MS,
        DEFAULT_ALGORITHM_CONFIG.sessionConfig.idleCutoffMs
      ),
      // PROVISIONAL DEFAULT, not evidence-derived (NEU-1016). Replaces the old
      // wall-clock session-time ceiling backstop; fires the `active_time_ceiling`
      // stopping advisory once the sitting's gap-based active time reaches this
      // value, surfaced both through `session_status` and in-band.
      activeTimeCeilingMs: parseNumber(
        env.SM_SESSION_ACTIVE_TIME_CEILING_MS,
        DEFAULT_ALGORITHM_CONFIG.sessionConfig.activeTimeCeilingMs
      ),
      // PROVISIONAL DEFAULT, not evidence-derived (NEU-1020; 5-8 is the stated
      // tuning band). Last-N-answers fatigue window, within the current sitting.
      // NEU-1043: parsed with a minimum of 2 — `computeFatigueTrend` silently
      // no-ops below that, so a misconfigured `0`/`1`/fractional value should
      // clamp up to the smallest workable window rather than reach the guard.
      fatigueWindowSize: parseIntegerWithMinimum(
        env.SM_SESSION_FATIGUE_WINDOW_SIZE,
        DEFAULT_ALGORITHM_CONFIG.sessionConfig.fatigueWindowSize,
        2
      ),
    },
    recommendationConfig: {
      conversation: {
        enableEncouragement: parseBoolean(
          env.SM_REC_CONVO_ENCOURAGEMENT,
          DEFAULT_ALGORITHM_CONFIG.recommendationConfig.conversation.enableEncouragement
        ),
        enableProgressUpdates: parseBoolean(
          env.SM_REC_CONVO_PROGRESS,
          DEFAULT_ALGORITHM_CONFIG.recommendationConfig.conversation.enableProgressUpdates
        ),
        verbosity: parseEnum(
          env.SM_REC_CONVO_VERBOSITY,
          ['low', 'medium', 'high'] as const,
          DEFAULT_ALGORITHM_CONFIG.recommendationConfig.conversation.verbosity
        ),
      },
      recencyWindowMs: parseNumber(
        env.SM_REC_RECENCY_WINDOW_MS,
        DEFAULT_ALGORITHM_CONFIG.recommendationConfig.recencyWindowMs
      ),
    },
    maxDependencyDepth: parseNumber(
      env.SM_PREREQ_MAX_DEPTH,
      DEFAULT_ALGORITHM_CONFIG.maxDependencyDepth
    ),
    weakAreaEaseThreshold: (() => {
      const parsed = parseNumber(
        env.SM_WEAK_AREA_EASE_THRESHOLD,
        DEFAULT_ALGORITHM_CONFIG.weakAreaEaseThreshold
      );
      if (parsed < minimumEaseFactor) {
        logger.warn(
          `weakAreaEaseThreshold (${parsed}) clamped to minimumEaseFactor (${minimumEaseFactor})`
        );
      }
      return Math.max(parsed, minimumEaseFactor);
    })(),
    roadblockFollowups: DEFAULT_ALGORITHM_CONFIG.roadblockFollowups,
    overValidationCeiling: parseNumber(
      env.SM_OVER_VALIDATION_CEILING,
      DEFAULT_ALGORITHM_CONFIG.overValidationCeiling
    ),
    durabilityPosteriorBar: parseNumber(
      env.SM_DURABILITY_POSTERIOR_BAR,
      DEFAULT_ALGORITHM_CONFIG.durabilityPosteriorBar
    ),
  };
}
