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
export function createMockAppContext(): AppContext {
  const pureFunctions: Partial<AppContext> = {
    // Shared utilities
    mapChunkRowToLearningItem,

    // Domain — pure functions (config pre-bound via closures)
    calculateNextReview: input => calculateNextReview(input, DEFAULT_ALGORITHM_CONFIG),
    calculatePriorityScore: input => calculatePriorityScore(input, DEFAULT_ALGORITHM_CONFIG),
    calculateNextReviewAdvanced: input =>
      calculateNextReviewAdvanced(input, DEFAULT_ALGORITHM_CONFIG),
    rankCandidates: input => rankCandidatesWithConstraints(input, DEFAULT_ALGORITHM_CONFIG),
    computeDailyKpis,
    computeWindowRollup,
    calculateSessionProgress,
    determineNextPhase,
    checkSessionCompletion: data => checkSessionCompletion(data, DEFAULT_ALGORITHM_CONFIG),
    validateSessionContext,
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
