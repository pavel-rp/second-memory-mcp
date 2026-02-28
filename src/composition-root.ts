import { getSql } from './infrastructure/db/operations.js';
import { DrizzleChunkRepository } from './adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from './adapters/drizzle/topic-repository.js';
import { DrizzleSessionRepository } from './adapters/drizzle/session-repository.js';
import { DrizzleSearchAdapter } from './adapters/drizzle/search-adapter.js';
import { DrizzleChunkIdLookupAdapter } from './adapters/drizzle/chunk-id-lookup-adapter.js';
import { DrizzlePrerequisiteMasteryAdapter } from './adapters/drizzle/prerequisite-mastery-adapter.js';
import { DrizzleReviewPersistenceAdapter } from './adapters/drizzle/review-persistence-adapter.js';
import { DrizzleUnitOfWorkAdapter } from './adapters/drizzle/unit-of-work-adapter.js';

import type {
  ChunkRepository,
  ListChunksFilter,
  ChunkContentResult,
} from './ports/chunk-repository.js';
import type { TopicRepository } from './ports/topic-repository.js';
import type {
  SessionRepository,
  CreateSessionChunkInput,
  ChunkValidationResult,
} from './ports/session-repository.js';
import type { SearchPort } from './ports/search-port.js';
import type { ChunkIdLookupPort } from './ports/chunk-id-lookup-port.js';
import type { PrerequisiteMasteryPort } from './ports/prerequisite-mastery-port.js';
import type { ReviewPersistencePort, ReviewResultData } from './ports/review-persistence-port.js';
import type { UnitOfWorkPort } from './ports/unit-of-work-port.js';
import type {
  LearningItem,
  PaginatedLearningItemsResponse,
  RecommendationInput,
  RecommendationOutput,
} from './domain/types/recommendations.js';
import type { SessionInput, HistoricalFeedback, BatchOperation } from './domain/types/session.js';
import type { SearchLearningContentInput, SearchResultSet } from './domain/types/search-tools.js';
import type { ServiceResult } from './domain/types/service-result.js';
import type {
  LearningChunkRow,
  LearningSessionRow,
  SessionChunkRow,
} from './infrastructure/db/schema.js';

import * as chunkWorkflows from './orchestration/chunk-workflows.js';
import * as topicWorkflows from './orchestration/topic-workflows.js';
import * as reviewWorkflows from './orchestration/review-workflows.js';
import * as sessionWorkflows from './orchestration/session-workflows.js';
import * as recommendationWorkflows from './orchestration/recommendation-workflows.js';
import * as searchWorkflows from './orchestration/search-workflows.js';
import * as queryWorkflows from './orchestration/query-workflows.js';

import { mapChunkRowToLearningItem } from './shared/chunk-mapping.js';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from './domain/algorithms/sr-calculator.js';
import { computeDailyKpis, computeWindowRollup } from './domain/services/analytics-calculator.js';
import {
  calculateSessionProgress,
  determineNextPhase,
  checkSessionCompletion,
  validateSessionContext,
  applyBatchSessionChunkOperations,
} from './domain/services/session-analyzer.js';
import { ConversationManager } from './tools/conversation-manager.js';
import { RecommendationEngine } from './domain/services/recommendation-engine.js';
import { PrerequisiteValidator } from './domain/services/prerequisite-validator.js';

/** Ports — injectable for testing */
export interface AppPorts {
  chunks: ChunkRepository;
  topics: TopicRepository;
  sessions: SessionRepository;
  search: SearchPort;
  chunkIdLookup: ChunkIdLookupPort;
  prerequisiteMastery: PrerequisiteMasteryPort;
  reviewPersistence: ReviewPersistencePort;
  unitOfWork: UnitOfWorkPort;
}

/** Pre-wired orchestration functions grouped by concern */
export interface AppContext {
  // Chunk orchestration
  createChunkWithTopic: (
    input: Parameters<typeof chunkWorkflows.createChunkWithTopic>[0]
  ) => Promise<ServiceResult<LearningChunkRow>>;
  updateChunkContent: (
    id: string,
    input: { content: string; resetProgress?: boolean }
  ) => Promise<chunkWorkflows.ChunkUpdateResult>;
  updateChunkContentWithAutoReset: (
    id: string,
    input: { content: string }
  ) => Promise<chunkWorkflows.ChunkUpdateResult>;
  updateChunkMetadata: (
    id: string,
    input: {
      title?: string;
      difficulty?: number;
      prerequisites?: string[];
      tags?: string[];
      estimatedDuration?: number;
    }
  ) => Promise<chunkWorkflows.ChunkUpdateResult>;
  updateChunkWithProgressReset: (
    id: string,
    input: {
      content?: string;
      title?: string;
      difficulty?: number;
      prerequisites?: string[];
      tags?: string[];
      estimatedDuration?: number;
      forceReset?: boolean;
    }
  ) => Promise<chunkWorkflows.ChunkUpdateResult>;
  deleteChunk: (id: string) => Promise<chunkWorkflows.DeleteChunkResult>;

  // Topic orchestration
  createTopicWithChunks: (
    input: topicWorkflows.TopicCreationInput
  ) => Promise<topicWorkflows.TopicCreationResult>;
  updateTopicMetadata: (
    topicId: string,
    input: { title?: string; subject?: string }
  ) => Promise<topicWorkflows.TopicUpdateResult>;
  updateTopicSummary: (
    topicId: string,
    summary: string
  ) => Promise<topicWorkflows.TopicUpdateResult>;

  // Review orchestration
  processReviewResult: (
    itemId: string,
    quality: number,
    options: { timeSpentMs?: number; consecutiveFailures?: number; daysOverdue?: number }
  ) => Promise<ServiceResult<ReviewResultData>>;

  // Session orchestration
  createSession: (input: {
    topicId?: string;
    chunkIds?: string[];
    mode: string;
    estimatedDuration?: number;
  }) => Promise<ServiceResult<{ sessionId: string }>>;
  completeSession: (
    sessionId: string,
    feedback: string | undefined
  ) => Promise<ServiceResult<void>>;
  getSessionById: (sessionId: string) => Promise<LearningSessionRow | null>;
  getActiveSession: () => Promise<LearningSessionRow | null>;
  getSessionWithChunks: (
    sessionId: string
  ) => Promise<{ session: LearningSessionRow | null; chunks: SessionChunkRow[] }>;
  convertSessionToInput: (
    sessionId: string,
    options?: { includeHistoricalFeedback?: boolean; historicalFeedbackLimit?: number }
  ) => Promise<SessionInput | null>;
  getHistoricalFeedback: (
    chunkIds: string[],
    options?: { limit?: number; excludeSessionId?: string }
  ) => Promise<HistoricalFeedback[]>;
  batchUpdateSessionChunks: (
    sessionId: string,
    operations: BatchOperation[]
  ) => Promise<ServiceResult<{ created: number; updated: number; unchanged: number }>>;
  createSessionChunk: (input: CreateSessionChunkInput) => Promise<SessionChunkRow>;
  validateChunkIds: (chunkIds: string[]) => Promise<ChunkValidationResult>;
  getSessionChunks: (sessionId: string) => Promise<SessionChunkRow[]>;
  resolveSessionChunkDependencies: (
    chunkIds: string[]
  ) => Promise<{ resolvedChunkIds: string[]; addedPrerequisites: string[]; message: string }>;

  // Recommendation orchestration
  generateRecommendations: (input: RecommendationInput) => Promise<RecommendationOutput>;

  // Search orchestration
  searchLearningContent: (input: SearchLearningContentInput) => Promise<SearchResultSet>;

  // Query orchestration
  listChunksAsLearningItems: (filter?: ListChunksFilter) => Promise<LearningItem[]>;
  listChunksWithContent: (filter?: {
    subjectFilter?: string;
    dueOnly?: boolean;
    includeContent?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedLearningItemsResponse>;
  getChunkContent: (id: string) => Promise<ChunkContentResult | null>;
  getChunkWithContent: (
    id: string
  ) => Promise<(LearningChunkRow & { topicTitle?: string | null }) | null>;
  batchFetchTopicsMinimal: (options?: {
    subject?: string;
    limit?: number;
  }) => Promise<Awaited<ReturnType<TopicRepository['batchFetchMinimal']>>>;
  batchFetchChunksMinimal: (options?: {
    topicId?: string;
    subject?: string;
    dueOnly?: boolean;
    limit?: number;
  }) => Promise<Awaited<ReturnType<ChunkRepository['batchFetchMinimal']>>>;
  getTopicSummary: (
    topicId: string
  ) => Promise<Awaited<ReturnType<TopicRepository['getSummaryById']>>>;

  // Shared utilities
  mapChunkRowToLearningItem: typeof mapChunkRowToLearningItem;

  // Domain — pure functions, no I/O
  calculateNextReview: typeof calculateNextReview;
  calculatePriorityScore: typeof calculatePriorityScore;
  calculateNextReviewAdvanced: typeof calculateNextReviewAdvanced;
  rankCandidates: typeof rankCandidatesWithConstraints;
  computeDailyKpis: typeof computeDailyKpis;
  computeWindowRollup: typeof computeWindowRollup;
  calculateSessionProgress: typeof calculateSessionProgress;
  determineNextPhase: typeof determineNextPhase;
  checkSessionCompletion: typeof checkSessionCompletion;
  validateSessionContext: typeof validateSessionContext;
  applyBatchSessionChunkOperations: typeof applyBatchSessionChunkOperations;
  createConversationManager: () => ConversationManager;
}

/** Create the default production ports wired to the Drizzle/PostgreSQL adapters. */
function createProductionPorts(): AppPorts {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    sessions: new DrizzleSessionRepository(db),
    search: new DrizzleSearchAdapter(db),
    chunkIdLookup: new DrizzleChunkIdLookupAdapter(db),
    prerequisiteMastery: new DrizzlePrerequisiteMasteryAdapter(db),
    reviewPersistence: new DrizzleReviewPersistenceAdapter(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
  };
}

/**
 * Composition root — the only module that knows about concrete adapter classes.
 * Accepts optional port overrides for testing.
 * Invoked exactly once at startup by the transport layer.
 */
export function createAppContext(overrides?: Partial<AppPorts>): AppContext {
  const ports: AppPorts = { ...createProductionPorts(), ...overrides };

  const chunkDeps: chunkWorkflows.ChunkDeps = {
    chunks: ports.chunks,
    topics: ports.topics,
    unitOfWork: ports.unitOfWork,
  };
  const topicDeps: topicWorkflows.TopicDeps = {
    topics: ports.topics,
    chunks: ports.chunks,
    unitOfWork: ports.unitOfWork,
  };
  const reviewDeps: reviewWorkflows.ReviewDeps = {
    reviewPersistence: ports.reviewPersistence,
  };
  const sessionDeps: sessionWorkflows.SessionDeps = {
    sessions: ports.sessions,
    chunks: ports.chunks,
  };
  const recommendationDeps: recommendationWorkflows.RecommendationDeps = {
    chunks: ports.chunks,
    mastery: ports.prerequisiteMastery,
    chunkIdLookup: ports.chunkIdLookup,
  };
  const queryDeps: queryWorkflows.QueryDeps = {
    chunks: ports.chunks,
    topics: ports.topics,
  };

  // Build the recommendation engine for the conversation manager
  const chunkLookupFn = async (id: string): Promise<LearningItem | undefined> => {
    const row = await ports.chunks.getWithContent(id);
    return row ? (mapChunkRowToLearningItem(row) as LearningItem) : undefined;
  };
  const prerequisiteValidator = new PrerequisiteValidator({
    referenceValidator: {
      validateChunkPrerequisites: async (_chunkId: string, prerequisites: string[]) => {
        const existing = await ports.chunkIdLookup.getExistingIdsByIds(prerequisites);
        const invalidReferences = prerequisites.filter(id => !existing.has(id));
        return { isValid: invalidReferences.length === 0, invalidReferences };
      },
    },
    masteryService: {
      checkItemMastery: (id: string) => ports.prerequisiteMastery.checkItemMastery(id),
    },
  });
  const createRecommendationEngine = () =>
    new RecommendationEngine({ chunkLookupFn, prerequisiteValidator });

  const ctx: AppContext = {
    // Chunk orchestration
    createChunkWithTopic: input => chunkWorkflows.createChunkWithTopic(input, chunkDeps),
    updateChunkContent: (id, input) => chunkWorkflows.updateChunkContent(id, input, chunkDeps),
    updateChunkContentWithAutoReset: (id, input) =>
      chunkWorkflows.updateChunkContentWithAutoReset(id, input, chunkDeps),
    updateChunkMetadata: (id, input) => chunkWorkflows.updateChunkMetadata(id, input, chunkDeps),
    updateChunkWithProgressReset: (id, input) =>
      chunkWorkflows.updateChunkWithProgressReset(id, input, chunkDeps),
    deleteChunk: id => chunkWorkflows.deleteChunk(id, chunkDeps),

    // Topic orchestration
    createTopicWithChunks: input => topicWorkflows.createTopicWithChunks(input, topicDeps),
    updateTopicMetadata: (id, input) => topicWorkflows.updateTopicMetadata(id, input, topicDeps),
    updateTopicSummary: (id, summary) => topicWorkflows.updateTopicSummary(id, summary, topicDeps),

    // Review orchestration
    processReviewResult: (itemId, quality, options) =>
      reviewWorkflows.processReviewResult(itemId, quality, options, reviewDeps),

    // Session orchestration
    createSession: input => sessionWorkflows.createSession(input, sessionDeps),
    completeSession: (sessionId, feedback) =>
      sessionWorkflows.completeSession(sessionId, feedback, sessionDeps),
    getSessionById: sessionId => sessionWorkflows.getSessionById(sessionId, sessionDeps),
    getActiveSession: () => sessionWorkflows.getActiveSession(sessionDeps),
    getSessionWithChunks: sessionId =>
      sessionWorkflows.getSessionWithChunks(sessionId, sessionDeps),
    convertSessionToInput: (sessionId, options) =>
      sessionWorkflows.convertSessionToSessionInput(sessionId, options, sessionDeps),
    getHistoricalFeedback: (chunkIds, options) =>
      sessionWorkflows.getHistoricalFeedback(chunkIds, options, sessionDeps),
    batchUpdateSessionChunks: (sessionId, operations) =>
      sessionWorkflows.batchUpdateSessionChunks(sessionId, operations, sessionDeps),
    createSessionChunk: input => sessionWorkflows.createSessionChunk(input, sessionDeps),
    validateChunkIds: chunkIds => sessionWorkflows.validateChunkIds(chunkIds, sessionDeps),
    getSessionChunks: sessionId => sessionWorkflows.getSessionChunks(sessionId, sessionDeps),
    resolveSessionChunkDependencies: chunkIds =>
      sessionWorkflows.resolveSessionChunkDependencies(
        chunkIds,
        sessionDeps as sessionWorkflows.SessionDeps & { chunks: ChunkRepository }
      ),

    // Recommendation orchestration
    generateRecommendations: input =>
      recommendationWorkflows.generateRecommendations(input, recommendationDeps),

    // Search orchestration
    searchLearningContent: input =>
      searchWorkflows.searchLearningContent(input, { search: ports.search }),

    // Query orchestration
    listChunksAsLearningItems: filter =>
      queryWorkflows.listChunksAsLearningItems(filter, queryDeps),
    listChunksWithContent: filter => queryWorkflows.listChunksWithContent(filter, queryDeps),
    getChunkContent: id => queryWorkflows.getChunkContent(id, queryDeps),
    getChunkWithContent: id => queryWorkflows.getChunkWithContent(id, queryDeps),
    batchFetchTopicsMinimal: options => queryWorkflows.batchFetchTopicsMinimal(options, queryDeps),
    batchFetchChunksMinimal: options => queryWorkflows.batchFetchChunksMinimal(options, queryDeps),
    getTopicSummary: topicId => queryWorkflows.getTopicSummary(topicId, queryDeps),

    // Shared utilities
    mapChunkRowToLearningItem,

    // Domain — pure functions
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
    createConversationManager: () => new ConversationManager(createRecommendationEngine()),
  };

  return Object.freeze(ctx);
}
