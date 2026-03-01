import type { AppContext } from '../../src/composition-root.js';
import { mapChunkRowToLearningItem } from '../../src/shared/chunk-mapping.js';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from '../../src/domain/algorithms/sr-calculator.js';
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

const notAvailable = () => {
  throw new Error('Not available in unit tests — use integration tier');
};

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

    // Domain — pure functions (the real implementations)
    calculateNextReview,
    calculatePriorityScore,
    calculateNextReviewAdvanced,
    rankCandidates: rankCandidatesWithConstraints,
    computeDailyKpis,
    computeWindowRollup,
    calculateSessionProgress,
    determineNextPhase,
    checkSessionCompletion,
    validateSessionContext,
    applyBatchSessionChunkOperations,
  };

  return new Proxy(pureFunctions as AppContext, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return notAvailable;
    },
  });
}
