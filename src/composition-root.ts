import { getSql } from './infrastructure/db/operations.js';
import { DrizzleChunkRepository } from './adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from './adapters/drizzle/topic-repository.js';
import { DrizzleSessionRepository } from './adapters/drizzle/session-repository.js';
import { DrizzleSearchAdapter } from './adapters/drizzle/search-adapter.js';
import { DrizzleChunkIdLookupAdapter } from './adapters/drizzle/chunk-id-lookup-adapter.js';
import { DrizzlePrerequisiteMasteryAdapter } from './adapters/drizzle/prerequisite-mastery-adapter.js';
import { DrizzleReviewPersistenceAdapter } from './adapters/drizzle/review-persistence-adapter.js';
import { DrizzleUnitOfWorkAdapter } from './adapters/drizzle/unit-of-work-adapter.js';
import { DrizzleSessionQuestionRepository } from './adapters/drizzle/session-question-repository.js';
import { DrizzleNotesRepository } from './adapters/drizzle/notes-repository.js';
import { LangChainEmbeddingAdapter } from './adapters/langchain/embedding-adapter.js';
import { resolveAlgorithmConfig } from './config/resolve-algorithm-config.js';
import { resolveEmbeddingConfig } from './config/resolve-embedding-config.js';

import type { EmbeddingPort } from './ports/embedding-port.js';
import type {
  ChunkRepository,
  ListChunksFilter,
  ChunkContentResult,
  ChunkWithTopicTitle,
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
import type { ChunkMinimalMetadata } from './ports/chunk-repository.js';
import type { ReviewPersistencePort, ReviewResultData } from './ports/review-persistence-port.js';
import type { UnitOfWorkPort } from './ports/unit-of-work-port.js';
import type { SessionQuestionRepository } from './ports/session-question-repository.js';
import type { NotesRepository } from './ports/notes-repository.js';
import type {
  LearningItem,
  PaginatedLearningItemsResponse,
  RecommendationInput,
  TopicRecommendationOutput,
} from './domain/types/recommendations.js';
import type { SessionInput, HistoricalFeedback, BatchOperation } from './domain/types/session.js';
import type { SearchLearningContentInput, SearchResultSet } from './domain/types/search-tools.js';
import type { ServiceResult } from './domain/types/service-result.js';
import type {
  TeachNextResponse,
  SubmitAnswerInput,
  SubmitAnswerResult,
  StartLearningInput,
  StartLearningResult,
  CreateSessionQuestionsInput,
  CreateSessionQuestionsResult,
} from './domain/types/teaching.js';
import type { LearningChunk, LearningSession, SessionChunk } from './domain/types/entities.js';
import type {
  NoteCreated,
  NoteListResult,
  NoteDeleted,
  NoteTargetType,
} from './domain/types/notes-tools.js';
import type { CreateNoteInput } from './ports/notes-repository.js';

import * as chunkWorkflows from './orchestration/chunk-workflows.js';
import * as topicWorkflows from './orchestration/topic-workflows.js';
import * as reviewWorkflows from './orchestration/review-workflows.js';
import * as sessionWorkflows from './orchestration/session-workflows.js';
import * as recommendationWorkflows from './orchestration/recommendation-workflows.js';
import * as searchWorkflows from './orchestration/search-workflows.js';
import * as queryWorkflows from './orchestration/query-workflows.js';
import * as analyticsWorkflows from './orchestration/analytics-workflows.js';
import * as teachingWorkflows from './orchestration/teaching-workflows.js';
import * as notesWorkflows from './orchestration/notes-workflows.js';

import { mapChunkRowToLearningItem } from './shared/chunk-mapping.js';
import {
  calculateNextReview,
  calculatePriorityScore,
  calculateNextReviewAdvanced,
  rankCandidatesWithConstraints,
} from './domain/algorithms/sr-calculator.js';
import {
  calculateSessionProgress,
  getSessionStatus,
  validateSessionContext,
  applyBatchSessionChunkOperations,
} from './domain/services/session-analyzer.js';
import type {
  NextReviewInput,
  NextReviewOutput,
  PriorityInput,
  PriorityOutput,
  AdvancedNextReviewInput,
  AdvancedNextReviewOutput,
  RankInput,
  RankOutput,
} from './domain/types/sr.js';
import type { SessionProgress, SessionStatus } from './domain/types/session.js';
import type { DailyKpis, AnalyticsOutput } from './domain/types/analytics.js';

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
  sessionQuestions: SessionQuestionRepository;
  notes: NotesRepository;
  embedding?: EmbeddingPort;
}

/** Pre-wired orchestration functions grouped by concern */
export interface AppContext {
  // Chunk orchestration
  createChunkWithTopic: (
    input: Parameters<typeof chunkWorkflows.createChunkWithTopic>[0]
  ) => Promise<ServiceResult<LearningChunk>>;
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

  // Leech orchestration
  getLeeches: (options: {
    subjectFilter?: string;
    limit?: number;
  }) => Promise<ChunkMinimalMetadata[]>;
  resolveLeech: (
    chunkId: string,
    resolution: reviewWorkflows.LeechResolution
  ) => Promise<ServiceResult<{ chunkId: string; resolution: reviewWorkflows.LeechResolution }>>;

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
  getSessionById: (sessionId: string) => Promise<LearningSession | null>;
  getActiveSession: () => Promise<LearningSession | null>;
  getSessionWithChunks: (
    sessionId: string
  ) => Promise<{ session: LearningSession | null; chunks: SessionChunk[] }>;
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
  createSessionChunk: (input: CreateSessionChunkInput) => Promise<SessionChunk>;
  validateChunkIds: (chunkIds: string[]) => Promise<ChunkValidationResult>;
  getSessionChunks: (sessionId: string) => Promise<SessionChunk[]>;
  resolveSessionChunkDependencies: (chunkIds: string[]) => Promise<{
    resolvedChunkIds: string[];
    addedPrerequisites: string[];
    skippedMasteredPrerequisites: string[];
    message: string;
  }>;

  // Teaching orchestration
  getNextTeachingStep: () => Promise<TeachNextResponse>;
  submitAnswer: (input: SubmitAnswerInput) => Promise<SubmitAnswerResult>;
  startLearning: (input: StartLearningInput) => Promise<StartLearningResult>;
  createSessionQuestions: (
    input: CreateSessionQuestionsInput
  ) => Promise<CreateSessionQuestionsResult>;

  // Notes orchestration
  createNote: (input: CreateNoteInput) => Promise<NoteCreated>;
  listNotes: (targetType: NoteTargetType, targetId: string) => Promise<NoteListResult>;
  deleteNote: (noteId: string) => Promise<NoteDeleted>;

  // Recommendation orchestration
  generateRecommendations: (input: RecommendationInput) => Promise<TopicRecommendationOutput>;

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
  getChunkWithContent: (id: string) => Promise<ChunkWithTopicTitle | null>;
  batchFetchTopicsMinimal: (options?: {
    subject?: string;
    limit?: number;
  }) => Promise<Awaited<ReturnType<TopicRepository['batchFetchMinimal']>>>;
  batchFetchChunksMinimal: (options?: {
    topicId?: string;
    subject?: string;
    dueOnly?: boolean;
    limit?: number;
    isLeech?: boolean;
  }) => Promise<Awaited<ReturnType<ChunkRepository['batchFetchMinimal']>>>;
  getTopicSummary: (
    topicId: string
  ) => Promise<Awaited<ReturnType<TopicRepository['getSummaryById']>>>;

  // Shared utilities
  mapChunkRowToLearningItem: typeof mapChunkRowToLearningItem;

  // Domain — pure functions, no I/O (config pre-bound via closures)
  calculateNextReview: (input: NextReviewInput) => NextReviewOutput;
  calculatePriorityScore: (input: PriorityInput) => PriorityOutput;
  calculateNextReviewAdvanced: (input: AdvancedNextReviewInput) => AdvancedNextReviewOutput;
  rankCandidates: (input: RankInput) => RankOutput;
  computeDailyAnalytics: (date: string) => Promise<DailyKpis>;
  computeWindowAnalytics: (
    from: string,
    to: string,
    options: { includeBreakdowns?: boolean }
  ) => Promise<AnalyticsOutput>;
  calculateSessionProgress: (sessionData: SessionInput) => SessionProgress;
  getSessionStatus: (sessionData: SessionInput) => SessionStatus;
  validateSessionContext: (context: unknown) => ServiceResult<SessionInput>;
  applyBatchSessionChunkOperations: typeof applyBatchSessionChunkOperations;
}

/** Create the default production ports wired to the Drizzle/PostgreSQL adapters. */
function createProductionPorts(vectorSimilarityThreshold?: number): AppPorts {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    sessions: new DrizzleSessionRepository(db),
    search: new DrizzleSearchAdapter(db, vectorSimilarityThreshold),
    chunkIdLookup: new DrizzleChunkIdLookupAdapter(db),
    prerequisiteMastery: new DrizzlePrerequisiteMasteryAdapter(db),
    reviewPersistence: new DrizzleReviewPersistenceAdapter(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    sessionQuestions: new DrizzleSessionQuestionRepository(db),
    notes: new DrizzleNotesRepository(db),
  };
}

/**
 * Composition root — the only module that knows about concrete adapter classes.
 * Accepts optional port overrides for testing.
 * Invoked exactly once at startup by the transport layer.
 */
export function createAppContext(overrides?: Partial<AppPorts>): AppContext {
  const algorithmConfig = resolveAlgorithmConfig();
  const resolvedEmbedding = resolveEmbeddingConfig();

  const ports: AppPorts = {
    ...createProductionPorts(resolvedEmbedding.vectorSimilarityThreshold),
    ...overrides,
  };

  // Create embedding adapter if not overridden and provider is configured.
  // Initialization is lazy — happens on first embedText call.
  // Using 'in' check so that { embedding: undefined } explicitly opts out.
  if (!('embedding' in (overrides ?? {})) && resolvedEmbedding.embedding.provider) {
    ports.embedding = new LangChainEmbeddingAdapter(resolvedEmbedding.embedding);
  }

  const chunkDeps: chunkWorkflows.ChunkDeps = {
    chunks: ports.chunks,
    topics: ports.topics,
    unitOfWork: ports.unitOfWork,
    embedding: ports.embedding,
    maxDependencyDepth: algorithmConfig.prerequisiteConfig.validation.maxDependencyDepth,
  };
  const topicDeps: topicWorkflows.TopicDeps = {
    topics: ports.topics,
    chunks: ports.chunks,
    unitOfWork: ports.unitOfWork,
    embedding: ports.embedding,
  };
  const reviewDeps: reviewWorkflows.ReviewDeps = {
    reviewPersistence: ports.reviewPersistence,
    algorithmConfig,
  };
  const leechDeps: reviewWorkflows.LeechDeps = {
    chunks: ports.chunks,
    reviewPersistence: ports.reviewPersistence,
  };
  const sessionDeps: sessionWorkflows.SessionDeps = {
    sessions: ports.sessions,
    chunks: ports.chunks,
    maxDependencyDepth: algorithmConfig.prerequisiteConfig.validation.maxDependencyDepth,
  };
  const recommendationDeps: recommendationWorkflows.RecommendationDeps = {
    chunks: ports.chunks,
  };
  const queryDeps: queryWorkflows.QueryDeps = {
    chunks: ports.chunks,
    topics: ports.topics,
  };
  const analyticsDeps: analyticsWorkflows.AnalyticsDeps = {
    reviewPersistence: ports.reviewPersistence,
  };
  const teachingDeps: teachingWorkflows.TeachingDeps = {
    sessions: ports.sessions,
    chunks: ports.chunks,
    reviewPersistence: ports.reviewPersistence,
    algorithmConfig,
    sessionQuestions: ports.sessionQuestions,
    notes: ports.notes,
  };
  const startLearningDeps: teachingWorkflows.StartLearningDeps = {
    sessions: ports.sessions,
    chunks: ports.chunks,
    reviewPersistence: ports.reviewPersistence,
    algorithmConfig,
    sessionQuestions: ports.sessionQuestions,
    notes: ports.notes,
  };

  const notesDeps: notesWorkflows.NotesDeps = {
    notes: ports.notes,
  };

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

    // Leech orchestration
    getLeeches: options => reviewWorkflows.getLeeches(options, leechDeps),
    resolveLeech: (chunkId, resolution) =>
      reviewWorkflows.resolveLeech(chunkId, resolution, leechDeps),

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
      sessionWorkflows.resolveSessionChunkDependencies(chunkIds, sessionDeps),

    // Teaching orchestration
    getNextTeachingStep: () => teachingWorkflows.getNextTeachingStep(teachingDeps),
    submitAnswer: input => teachingWorkflows.submitAnswer(input, teachingDeps),
    startLearning: input => teachingWorkflows.startLearning(input, startLearningDeps),
    createSessionQuestions: input => teachingWorkflows.createSessionQuestions(input, teachingDeps),

    // Notes orchestration
    createNote: input => notesWorkflows.createNote(input, notesDeps),
    listNotes: (targetType, targetId) => notesWorkflows.listNotes(targetType, targetId, notesDeps),
    deleteNote: noteId => notesWorkflows.deleteNote(noteId, notesDeps),

    // Recommendation orchestration
    generateRecommendations: input =>
      recommendationWorkflows.generateRecommendations(input, recommendationDeps, new Date()),

    // Search orchestration
    searchLearningContent: input =>
      searchWorkflows.searchLearningContent(input, {
        search: ports.search,
        embedding: ports.embedding,
        hybridKeywordWeight: resolvedEmbedding.hybridKeywordWeight,
        hybridSemanticWeight: resolvedEmbedding.hybridSemanticWeight,
      }),

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

    // Domain — pure functions (config pre-bound)
    calculateNextReview: input => calculateNextReview(input, algorithmConfig, new Date()),
    calculatePriorityScore: input => calculatePriorityScore(input, algorithmConfig, new Date()),
    calculateNextReviewAdvanced: input =>
      calculateNextReviewAdvanced(input, algorithmConfig, new Date()),
    rankCandidates: input => rankCandidatesWithConstraints(input, algorithmConfig, new Date()),
    computeDailyAnalytics: date => analyticsWorkflows.computeDailyAnalytics(date, analyticsDeps),
    computeWindowAnalytics: (from, to, options) =>
      analyticsWorkflows.computeWindowAnalytics(from, to, options, analyticsDeps),
    calculateSessionProgress: sessionData => calculateSessionProgress(sessionData, new Date()),
    getSessionStatus: sessionData => getSessionStatus(sessionData, algorithmConfig, new Date()),
    validateSessionContext: context => validateSessionContext(context, new Date()),
    applyBatchSessionChunkOperations,
  };

  return Object.freeze(ctx);
}
