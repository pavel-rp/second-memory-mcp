import type { AppContext } from '../../src/composition-root.js';
import type { DailyKpis, AnalyticsOutput } from '../../src/domain/types/analytics.js';
import { mapChunkRowToLearningItem } from '../../src/shared/chunk-mapping.js';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from '../../src/domain/algorithms/sr-calculator.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../src/domain/config/algorithm-defaults.js';
import {
  getSessionStatus,
  validateSessionContext,
  applyBatchSessionChunkOperations,
} from '../../src/domain/services/session-analyzer.js';

/**
 * Builds a mock AppContext that provides all pure domain functions
 * without requiring DATABASE_URL or any external services.
 * Uses a Proxy so any new AppContext methods automatically throw
 * instead of silently being undefined.
 */
export function createMockAppContext(
  now: Date = new Date('2025-06-15T12:00:00Z'),
  overrides: Partial<AppContext> = {}
): AppContext {
  const pureFunctions: Partial<AppContext> = {
    // Shared utilities
    mapChunkRowToLearningItem,

    // Domain — pure functions (config pre-bound via closures)
    calculateNextReview: input => calculateNextReview(input, DEFAULT_ALGORITHM_CONFIG, now),
    calculatePriorityScore: input => calculatePriorityScore(input, DEFAULT_ALGORITHM_CONFIG, now),
    calculateNextReviewAdvanced: input =>
      calculateNextReviewAdvanced(input, DEFAULT_ALGORITHM_CONFIG, now),
    rankCandidates: input => rankCandidatesWithConstraints(input, DEFAULT_ALGORITHM_CONFIG, now),
    getSessionStatus: data => getSessionStatus(data, DEFAULT_ALGORITHM_CONFIG, now),
    validateSessionContext: context => validateSessionContext(context, now),
    applyBatchSessionChunkOperations,

    // Analytics — async stubs returning empty results (override with vi.fn() in individual tests)
    computeDailyAnalytics: async (date: string): Promise<DailyKpis> => ({
      date,
      reviews_completed: 0,
      average_quality: 0,
      new_chunks_learned: 0,
    }),
    computeWindowAnalytics: async (): Promise<AnalyticsOutput> => ({
      days: [],
      total: { reviews_completed: 0, average_quality: 0, new_chunks_learned: 0, streak_days: 0 },
    }),

    // Context token stub (override with vi.fn() for specific token values or error cases)
    createContextToken: async () => 'ctx-test-token-stub',

    ...overrides,
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
