import { vi } from 'vitest';
import type { ChunkRepository } from '../../src/ports/chunk-repository.js';
import type { TopicRepository } from '../../src/ports/topic-repository.js';
import type { SessionRepository } from '../../src/ports/session-repository.js';
import type { SessionQuestionRepository } from '../../src/ports/session-question-repository.js';
import type { ReviewPersistencePort } from '../../src/ports/review-persistence-port.js';
import type { UnitOfWorkPort, TransactionPorts } from '../../src/ports/unit-of-work-port.js';
import type { PrerequisiteMasteryPort } from '../../src/ports/prerequisite-mastery-port.js';
import type { ChunkIdLookupPort } from '../../src/ports/chunk-id-lookup-port.js';
import type { SearchPort } from '../../src/ports/search-port.js';
import type { EmbeddingPort } from '../../src/ports/embedding-port.js';

// ── ChunkRepository ─────────────────────────────────────────────

export function stubChunkRepository(overrides?: Partial<ChunkRepository>): ChunkRepository {
  return {
    create: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(1),
    saveContentEmbedding: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(1),
    getContent: vi.fn().mockResolvedValue(null),
    getWithContent: vi.fn().mockResolvedValue(null),
    list: vi.fn().mockResolvedValue([]),
    listWithContent: vi.fn().mockResolvedValue({
      items: [],
      pagination: { total: 0, limit: 20, offset: 0, has_more: false },
    }),
    batchFetchMinimal: vi.fn().mockResolvedValue([]),
    findDependents: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

// ── TopicRepository ─────────────────────────────────────────────

export function stubTopicRepository(overrides?: Partial<TopicRepository>): TopicRepository {
  return {
    create: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    getById: vi.fn().mockResolvedValue(undefined),
    getSummaryById: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
    saveSummaryEmbedding: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue({ success: true, data: { deleted: true } }),
    list: vi.fn().mockResolvedValue([]),
    batchFetchMinimal: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

// ── SessionRepository ───────────────────────────────────────────

export function stubSessionRepository(overrides?: Partial<SessionRepository>): SessionRepository {
  return {
    createSession: vi.fn().mockResolvedValue(undefined),
    getSessionById: vi.fn().mockResolvedValue(null),
    getActiveSession: vi.fn().mockResolvedValue(null),
    updateSession: vi.fn().mockResolvedValue(1),
    completeSession: vi.fn().mockResolvedValue(1),
    deleteSession: vi.fn().mockResolvedValue(1),
    listSessions: vi.fn().mockResolvedValue([]),
    createSessionChunk: vi.fn().mockResolvedValue({
      id: 'sc-stub',
      sessionId: 'sess-stub',
      chunkId: 'c-stub',
      status: 'pending',
      timeSpentMs: 0,
      createdAt: 0,
      updatedAt: 0,
    }),
    getSessionChunks: vi.fn().mockResolvedValue([]),
    getSessionChunkById: vi.fn().mockResolvedValue(null),
    updateSessionChunk: vi.fn().mockResolvedValue(1),
    deleteSessionChunk: vi.fn().mockResolvedValue(1),
    batchCreateSessionChunks: vi.fn().mockResolvedValue(undefined),
    getSessionWithChunks: vi.fn().mockResolvedValue({
      session: null,
      chunks: [],
    }),
    convertSessionToSessionInput: vi.fn().mockResolvedValue(null),
    getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
    persistBatchSessionChunkOperations: vi.fn().mockResolvedValue({
      created: 0,
      updated: 0,
      unchanged: 0,
      affectedChunkIds: [],
    }),
    validateChunkIds: vi.fn().mockResolvedValue({
      valid: true,
      invalidIds: [],
      validIds: [],
    }),
    ...overrides,
  };
}

// ── ReviewPersistencePort ───────────────────────────────────────

export function stubReviewPersistence(
  overrides?: Partial<ReviewPersistencePort>
): ReviewPersistencePort {
  return {
    getChunk: vi.fn().mockResolvedValue(undefined),
    persistReviewUpdate: vi.fn().mockResolvedValue(1),
    getReviewsByDateRange: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

// ── UnitOfWorkPort ──────────────────────────────────────────────

export function stubUnitOfWork(
  overrides?: Partial<UnitOfWorkPort>,
  txPorts?: TransactionPorts
): UnitOfWorkPort {
  const ports: TransactionPorts = txPorts ?? {
    chunks: stubChunkRepository(),
    topics: stubTopicRepository(),
    sessions: stubSessionRepository(),
  };
  const execute: UnitOfWorkPort['execute'] = vi.fn(async cb => cb(ports));
  return {
    execute,
    ...overrides,
  };
}

// ── PrerequisiteMasteryPort ─────────────────────────────────────

export function stubPrerequisiteMastery(
  overrides?: Partial<PrerequisiteMasteryPort>
): PrerequisiteMasteryPort {
  return {
    checkItemMastery: vi.fn().mockResolvedValue({
      itemId: '',
      isMastered: true,
      averageQuality: 4,
      attemptCount: 3,
      daysSinceLastReview: 1,
      successRate: 0.9,
    }),
    checkMultipleItemsMastery: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  };
}

// ── ChunkIdLookupPort ───────────────────────────────────────────

export function stubChunkIdLookup(overrides?: Partial<ChunkIdLookupPort>): ChunkIdLookupPort {
  return {
    getExistingIdsByIds: vi.fn().mockResolvedValue(new Set<string>()),
    getAllIds: vi.fn().mockResolvedValue(new Set<string>()),
    ...overrides,
  };
}

// ── SearchPort ──────────────────────────────────────────────────

export function stubSearchPort(overrides?: Partial<SearchPort>): SearchPort {
  return {
    searchByQuery: vi.fn().mockResolvedValue({
      query: '',
      normalizedQuery: '',
      tokens: [],
      limit: 10,
      filters: {},
      counts: { topics: 0, chunks: 0, total: 0 },
      results: [],
    }),
    searchByVector: vi.fn().mockResolvedValue({
      query: '',
      normalizedQuery: '',
      tokens: [],
      limit: 10,
      filters: {},
      counts: { topics: 0, chunks: 0, total: 0 },
      results: [],
    }),
    ...overrides,
  };
}

// ── EmbeddingPort ───────────────────────────────────────────────

export function stubEmbeddingPort(overrides?: Partial<EmbeddingPort>): EmbeddingPort {
  return {
    embedText: vi.fn().mockResolvedValue(null),
    embedTexts: vi.fn().mockResolvedValue([]),
    getDimensions: vi.fn().mockReturnValue(256),
    ...overrides,
  };
}

// ── SessionQuestionRepository ──────────────────────────────────

export function stubSessionQuestionRepository(
  overrides?: Partial<SessionQuestionRepository>
): SessionQuestionRepository {
  return {
    createQuestions: vi.fn().mockResolvedValue([
      {
        id: 'sq-stub',
        sessionChunkId: 'sc-stub',
        questionIndex: 1,
        promptText: '',
        status: 'pending',
        createdAt: 0,
        updatedAt: 0,
      },
    ]),
    getQuestionsForChunk: vi.fn().mockResolvedValue([]),
    getQuestionById: vi.fn().mockResolvedValue(null),
    updateQuestionStatus: vi.fn().mockResolvedValue(1),
    createAttempt: vi.fn().mockResolvedValue({
      id: 'sqa-stub',
      sessionQuestionId: 'sq-stub',
      attemptNumber: 1,
      response: '',
      passed: false,
      feedback: '',
      quality: null,
      timeSpentMs: 0,
      createdAt: 0,
    }),
    getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
    getAllAttemptsForChunk: vi.fn().mockResolvedValue([]),
    getQuestionsForChunks: vi.fn().mockResolvedValue([]),
    getAllAttemptsForChunks: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}
