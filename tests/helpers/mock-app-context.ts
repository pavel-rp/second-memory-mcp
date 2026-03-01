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
 * DB-dependent methods throw if called.
 */
export function createMockAppContext(): AppContext {
  return {
    // Chunk orchestration — stubs
    createChunkWithTopic: notAvailable,
    updateChunkContent: notAvailable,
    updateChunkContentWithAutoReset: notAvailable,
    updateChunkMetadata: notAvailable,
    updateChunkWithProgressReset: notAvailable,
    deleteChunk: notAvailable,

    // Topic orchestration — stubs
    createTopicWithChunks: notAvailable,
    updateTopicMetadata: notAvailable,
    updateTopicSummary: notAvailable,

    // Review orchestration — stubs
    processReviewResult: notAvailable,

    // Session orchestration — stubs
    createSession: notAvailable,
    completeSession: notAvailable,
    getSessionById: notAvailable,
    getActiveSession: notAvailable,
    getSessionWithChunks: notAvailable,
    convertSessionToInput: notAvailable,
    getHistoricalFeedback: notAvailable,
    batchUpdateSessionChunks: notAvailable,
    createSessionChunk: notAvailable,
    validateChunkIds: notAvailable,
    getSessionChunks: notAvailable,
    resolveSessionChunkDependencies: notAvailable,

    // Recommendation orchestration — stub
    generateRecommendations: notAvailable,

    // Search orchestration — stub
    searchLearningContent: notAvailable,

    // Query orchestration — stubs
    listChunksAsLearningItems: notAvailable,
    listChunksWithContent: notAvailable,
    getChunkContent: notAvailable,
    getChunkWithContent: notAvailable,
    batchFetchTopicsMinimal: notAvailable,
    batchFetchChunksMinimal: notAvailable,
    getTopicSummary: notAvailable,

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
    createConversationManager: notAvailable,
  } as AppContext;
}
