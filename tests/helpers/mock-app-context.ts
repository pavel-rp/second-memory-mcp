import type { AppContext } from '../../src/composition-root.js';
import { mapChunkRowToLearningItem } from '../../src/shared/chunk-mapping.js';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from '../../src/domain/algorithms/sr-calculator.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../src/domain/config/algorithm-defaults.js';
import {
  computeDailyKpis,
  computeWindowRollup,
} from '../../src/domain/services/analytics-calculator.js';
import {
  calculateSessionProgress,
  determineNextPhase,
  checkSessionCompletion,
  validateSessionContext,
  applyBatchSessionChunkOperations,
} from '../../src/domain/services/session-analyzer.js';

/**
 * Builds a mock AppContext that provides all pure domain functions
 * without requiring DATABASE_URL or any external services.
 * Uses a Proxy so any new AppContext methods automatically throw
 * instead of silently being undefined.
 */
export function createMockAppContext(now: Date = new Date('2025-06-15T12:00:00Z')): AppContext {
  const pureFunctions: Partial<AppContext> = {
    // Shared utilities
    mapChunkRowToLearningItem,

    // Domain — pure functions (config pre-bound via closures)
    calculateNextReview: input => calculateNextReview(input, DEFAULT_ALGORITHM_CONFIG, now),
    calculatePriorityScore: input => calculatePriorityScore(input, DEFAULT_ALGORITHM_CONFIG, now),
    calculateNextReviewAdvanced: input =>
      calculateNextReviewAdvanced(input, DEFAULT_ALGORITHM_CONFIG, now),
    rankCandidates: input => rankCandidatesWithConstraints(input, DEFAULT_ALGORITHM_CONFIG, now),
    computeDailyKpis,
    computeWindowRollup,
    calculateSessionProgress: data => calculateSessionProgress(data, now),
    determineNextPhase: data => determineNextPhase(data, now),
    checkSessionCompletion: data => checkSessionCompletion(data, DEFAULT_ALGORITHM_CONFIG, now),
    validateSessionContext: context => validateSessionContext(context, now),
    applyBatchSessionChunkOperations,
  };

  return new Proxy(pureFunctions as AppContext, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return () => {
        throw new Error(
          `AppContext.${String(prop)} not available in unit tests — use integration tier`
        );
      };
    },
  });
}
