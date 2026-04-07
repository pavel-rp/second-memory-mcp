import { describe, it, expect, vi } from 'vitest';
import {
  buildLearnerContext,
  type LearnerContextDeps,
} from '../../../src/orchestration/learner-context-workflows.js';
import type { ChunkMinimalMetadata } from '../../../src/ports/chunk-repository.js';
import type { TopicMinimalMetadata } from '../../../src/ports/topic-repository.js';
import type { LearningSession, SessionChunk } from '../../../src/domain/types/entities.js';
import type { PersistedReviewEntry } from '../../../src/domain/types/analytics.js';
import type { WeakAreaResult } from '../../../src/ports/review-persistence-port.js';
import {
  stubChunkRepository,
  stubTopicRepository,
  stubSessionRepository,
  stubReviewPersistence,
} from '../../helpers/stub-ports.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

const NOW = new Date('2025-06-15T12:00:00Z');
const NOW_MS = NOW.getTime();
const MS_PER_DAY = 86_400_000;
const TODAY_START_MS = new Date('2025-06-15T00:00:00Z').getTime();

function makeChunkMinimal(overrides?: Partial<ChunkMinimalMetadata>): ChunkMinimalMetadata {
  return {
    id: 'c1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    chunkType: 'review',
    topicId: 'topic-1',
    nextReviewAt: TODAY_START_MS - MS_PER_DAY,
    easeFactor: 2.5,
    repetitions: 3,
    intervalDays: 7,
    lastReviewedAt: NOW_MS - 2 * MS_PER_DAY,
    prerequisitesJson: null,
    tagsJson: null,
    contentStatus: 'final',
    createdAt: NOW_MS - 30 * MS_PER_DAY,
    updatedAt: NOW_MS,
    ...overrides,
  };
}

function makeTopic(overrides?: Partial<TopicMinimalMetadata>): TopicMinimalMetadata {
  return {
    id: 'topic-1',
    title: 'Test Topic',
    subject: 'CS',
    createdAt: NOW_MS - 30 * MS_PER_DAY,
    updatedAt: NOW_MS,
    ...overrides,
  };
}

function makeSession(overrides?: Partial<LearningSession>): LearningSession {
  return {
    id: 'sess-1',
    topicId: null,
    chunkIds: null,
    mode: 'learning',
    estimatedDuration: null,
    status: 'completed',
    startTime: NOW_MS - 3_600_000,
    endTime: NOW_MS - 1_800_000,
    feedback: 'Good session overall',
    createdAt: NOW_MS - 3_600_000,
    updatedAt: NOW_MS - 1_800_000,
    ...overrides,
  };
}

function makeSessionChunk(overrides?: Partial<SessionChunk>): SessionChunk {
  return {
    id: 'sc-1',
    sessionId: 'sess-1',
    chunkId: 'c1',
    status: 'completed',
    timeSpentMs: 5000,
    createdAt: NOW_MS,
    updatedAt: NOW_MS,
    ...overrides,
  };
}

function makeReview(overrides?: Partial<PersistedReviewEntry>): PersistedReviewEntry {
  return {
    date: '2025-06-15T10:00:00Z',
    quality: 4,
    isNew: false,
    topic: 'Test Topic',
    tags: [],
    ...overrides,
  };
}

function makeWeakArea(overrides?: Partial<WeakAreaResult>): WeakAreaResult {
  return {
    chunkId: 'c-weak-1',
    chunkTitle: 'Weak Chunk',
    topicTitle: 'Weak Topic',
    lowCount: 2,
    recentAttempts: 3,
    avgRecentQuality: 1.7,
    ...overrides,
  };
}

function makeDeps(overrides?: {
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
  topics?: Partial<Parameters<typeof stubTopicRepository>[0]>;
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  reviewPersistence?: Partial<Parameters<typeof stubReviewPersistence>[0]>;
}): LearnerContextDeps {
  return {
    chunks: stubChunkRepository(overrides?.chunks),
    topics: stubTopicRepository(overrides?.topics),
    sessions: stubSessionRepository(overrides?.sessions),
    reviewPersistence: stubReviewPersistence(overrides?.reviewPersistence),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  };
}

describe('buildLearnerContext', () => {
  it('returns all fields with correct types and values when ports return data', async () => {
    // c1 is overdue (nextReviewAt before today), c2 is due today
    const allChunks = [
      makeChunkMinimal({
        id: 'c1',
        topicId: 'topic-1',
        subject: 'CS',
        easeFactor: 2.5,
        nextReviewAt: TODAY_START_MS - MS_PER_DAY,
      }),
      makeChunkMinimal({
        id: 'c2',
        topicId: 'topic-2',
        subject: 'Math',
        easeFactor: 2.8,
        nextReviewAt: TODAY_START_MS + 3_600_000,
      }),
    ];
    const topics = [
      makeTopic({ id: 'topic-1', title: 'Topic A' }),
      makeTopic({ id: 'topic-2', title: 'Topic B' }),
    ];
    const session = makeSession();
    const sessionChunks = [
      makeSessionChunk({ status: 'completed' }),
      makeSessionChunk({ id: 'sc-2', status: 'completed' }),
    ];
    const reviews = [makeReview({ date: '2025-06-15T10:00:00Z' })];

    const batchFetchMinimal = vi.fn().mockResolvedValue(allChunks);

    const deps = makeDeps({
      chunks: { batchFetchMinimal },
      topics: { batchFetchMinimal: vi.fn().mockResolvedValue(topics) },
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(null),
        listSessions: vi.fn().mockResolvedValue([session]),
        getSessionChunks: vi.fn().mockResolvedValue(sessionChunks),
      },
      reviewPersistence: {
        getWeakAreas: vi.fn().mockResolvedValue([]),
        getReviewsByDateRange: vi.fn().mockResolvedValue(reviews),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.totalTopics).toBe(2);
    expect(result.totalChunks).toBe(2);
    expect(result.dueToday).toBe(1);
    expect(result.overdue).toBe(1);
    expect(result.overdueTopics).toHaveLength(1);
    expect(result.overdueTopics[0]).toEqual({
      title: 'Topic A',
      daysOverdue: 1,
      chunkCount: 1,
    });
    expect(result.recentSubjects).toEqual(['CS', 'Math']);
    expect(result.recentSessionSummary).toEqual({
      lastSessionDate: new Date(session.startTime).toISOString(),
      mode: 'learning',
      chunksReviewed: 2,
      averageQuality: 0,
      feedbackExcerpt: 'Good session overall',
    });
    expect(result.streakDays).toBe(1);
    expect(result.leechCount).toBe(0);
    expect(result.activeSession).toBeNull();
  });

  it('cold start: returns zeros and empty arrays when DB is empty', async () => {
    const deps = makeDeps();
    const result = await buildLearnerContext(deps, NOW);

    expect(result.totalTopics).toBe(0);
    expect(result.totalChunks).toBe(0);
    expect(result.dueToday).toBe(0);
    expect(result.overdue).toBe(0);
    expect(result.overdueTopics).toEqual([]);
    expect(result.recentSubjects).toEqual([]);
    expect(result.recentSessionSummary).toBeNull();
    expect(result.flaggedWeakAreas).toEqual([]);
    expect(result.streakDays).toBe(0);
    expect(result.leechCount).toBe(0);
    expect(result.activeSession).toBeNull();
  });

  it('recentSessionSummary is null when no completed sessions exist', async () => {
    const deps = makeDeps({
      sessions: { listSessions: vi.fn().mockResolvedValue([]) },
    });
    const result = await buildLearnerContext(deps, NOW);

    expect(result.recentSessionSummary).toBeNull();
  });

  it('recentSessionSummary.feedbackExcerpt is truncated to 200 chars', async () => {
    const longFeedback = 'A'.repeat(300);
    const session = makeSession({ feedback: longFeedback });

    const deps = makeDeps({
      sessions: {
        listSessions: vi.fn().mockResolvedValue([session]),
        getSessionChunks: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.recentSessionSummary!.feedbackExcerpt).toHaveLength(200);
    expect(result.recentSessionSummary!.feedbackExcerpt).toBe('A'.repeat(200));
  });

  it('recentSessionSummary.feedbackExcerpt is null when feedback is null', async () => {
    const session = makeSession({ feedback: null });

    const deps = makeDeps({
      sessions: {
        listSessions: vi.fn().mockResolvedValue([session]),
        getSessionChunks: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.recentSessionSummary!.feedbackExcerpt).toBeNull();
  });

  it('flaggedWeakAreas is empty when both signals return nothing', async () => {
    const deps = makeDeps({
      reviewPersistence: { getWeakAreas: vi.fn().mockResolvedValue([]) },
    });
    const result = await buildLearnerContext(deps, NOW);

    expect(result.flaggedWeakAreas).toEqual([]);
  });

  it('leechCount is 0 when no remediation chunks exist', async () => {
    const deps = makeDeps();
    const result = await buildLearnerContext(deps, NOW);

    expect(result.leechCount).toBe(0);
  });

  it('leechCount counts remediation chunks from allChunks', async () => {
    const allChunks = [
      makeChunkMinimal({ id: 'c1', chunkType: 'review' }),
      makeChunkMinimal({ id: 'c2', chunkType: 'remediation' }),
      makeChunkMinimal({ id: 'c3', chunkType: 'remediation' }),
      makeChunkMinimal({ id: 'c4', chunkType: 'new' }),
    ];

    const deps = makeDeps({
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(allChunks) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.leechCount).toBe(2);
  });

  it('streakDays counts consecutive non-zero review days ending today', async () => {
    const reviews = [
      makeReview({ date: '2025-06-15T10:00:00Z' }),
      makeReview({ date: '2025-06-14T09:00:00Z' }),
      makeReview({ date: '2025-06-13T08:00:00Z' }),
      // gap on 2025-06-12
      makeReview({ date: '2025-06-11T07:00:00Z' }),
    ];

    const deps = makeDeps({
      reviewPersistence: {
        getReviewsByDateRange: vi.fn().mockResolvedValue(reviews),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.streakDays).toBe(3);
  });

  it('streakDays is 0 when no reviews today', async () => {
    const reviews = [
      makeReview({ date: '2025-06-14T10:00:00Z' }),
      makeReview({ date: '2025-06-13T10:00:00Z' }),
    ];

    const deps = makeDeps({
      reviewPersistence: {
        getReviewsByDateRange: vi.fn().mockResolvedValue(reviews),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.streakDays).toBe(0);
  });

  it('flaggedWeakAreas deduplicates by chunkId when both signals flag the same chunk', async () => {
    const allChunks = [
      makeChunkMinimal({
        id: 'c-shared',
        topicId: 'topic-1',
        title: 'Shared Chunk',
        easeFactor: 2.0,
      }),
    ];
    const topics = [makeTopic({ id: 'topic-1', title: 'Topic A' })];
    const qualityWeak = [
      makeWeakArea({ chunkId: 'c-shared', chunkTitle: 'Shared Chunk', topicTitle: 'Topic A' }),
    ];

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(allChunks),
      },
      topics: { batchFetchMinimal: vi.fn().mockResolvedValue(topics) },
      reviewPersistence: { getWeakAreas: vi.fn().mockResolvedValue(qualityWeak) },
    });

    const result = await buildLearnerContext(deps, NOW);

    // Should have only 1 entry, not 2 (deduplicated)
    expect(result.flaggedWeakAreas).toHaveLength(1);
    expect(result.flaggedWeakAreas[0]!.chunk).toBe('Shared Chunk');
  });

  it('overdueTopics caps at 5', async () => {
    const topics: TopicMinimalMetadata[] = [];
    const overdueChunks: ChunkMinimalMetadata[] = [];
    for (let i = 0; i < 8; i++) {
      topics.push(makeTopic({ id: `topic-${i}`, title: `Topic ${i}` }));
      overdueChunks.push(
        makeChunkMinimal({
          id: `c-${i}`,
          topicId: `topic-${i}`,
          nextReviewAt: TODAY_START_MS - (i + 1) * MS_PER_DAY,
        })
      );
    }

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(overdueChunks),
      },
      topics: { batchFetchMinimal: vi.fn().mockResolvedValue(topics) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.overdueTopics).toHaveLength(5);
  });

  it('flaggedWeakAreas caps at 5', async () => {
    const chunks: ChunkMinimalMetadata[] = [];
    const topics: TopicMinimalMetadata[] = [];
    for (let i = 0; i < 8; i++) {
      chunks.push(
        makeChunkMinimal({
          id: `c-${i}`,
          topicId: `topic-${i}`,
          easeFactor: 1.5,
        })
      );
      topics.push(makeTopic({ id: `topic-${i}`, title: `Topic ${i}` }));
    }

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(chunks),
      },
      topics: { batchFetchMinimal: vi.fn().mockResolvedValue(topics) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.flaggedWeakAreas).toHaveLength(5);
  });

  it('recentSubjects caps at 5 and deduplicates', async () => {
    const dueChunks: ChunkMinimalMetadata[] = [];
    for (let i = 0; i < 10; i++) {
      dueChunks.push(
        makeChunkMinimal({
          id: `c-${i}`,
          subject: `Subject ${i % 7}`,
          nextReviewAt: TODAY_START_MS + 1000,
        })
      );
    }

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(dueChunks),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.recentSubjects).toHaveLength(5);
    expect(new Set(result.recentSubjects).size).toBe(5);
  });

  it('recentSubjects skips chunks with empty subject', async () => {
    const allChunks = [
      makeChunkMinimal({ id: 'c1', subject: '', nextReviewAt: TODAY_START_MS + 1000 }),
      makeChunkMinimal({ id: 'c2', subject: 'Math', nextReviewAt: TODAY_START_MS + 1000 }),
    ];

    const deps = makeDeps({
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(allChunks) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.recentSubjects).toEqual(['Math']);
  });

  it('activeSession maps correctly when present', async () => {
    const activeSession = makeSession({
      id: 'sess-active',
      mode: 'review',
      status: 'active',
      startTime: NOW_MS - 600_000,
    });

    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(activeSession),
        listSessions: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.activeSession).toEqual({
      id: 'sess-active',
      mode: 'review',
      startedAt: new Date(activeSession.startTime).toISOString(),
    });
  });

  it('activeSession returns null when no active session', async () => {
    const deps = makeDeps({
      sessions: { getActiveSession: vi.fn().mockResolvedValue(null) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.activeSession).toBeNull();
  });

  it('dueToday counts only chunks due today, not overdue from previous days', async () => {
    const allChunks = [
      // Overdue (before today start)
      makeChunkMinimal({ id: 'c-overdue', nextReviewAt: TODAY_START_MS - MS_PER_DAY }),
      // Due today (between today start and tomorrow start)
      makeChunkMinimal({ id: 'c-today-1', nextReviewAt: TODAY_START_MS + 1000 }),
      makeChunkMinimal({ id: 'c-today-2', nextReviewAt: TODAY_START_MS + 3_600_000 }),
      // Future (not due yet)
      makeChunkMinimal({ id: 'c-future', nextReviewAt: TODAY_START_MS + 2 * MS_PER_DAY }),
    ];

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(allChunks),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.dueToday).toBe(2);
    expect(result.overdue).toBe(1);
  });

  it('overdueTopics sorts by days overdue descending', async () => {
    const topics = [
      makeTopic({ id: 'topic-a', title: 'Old Topic' }),
      makeTopic({ id: 'topic-b', title: 'Recent Topic' }),
    ];
    const overdueChunks = [
      makeChunkMinimal({
        id: 'c1',
        topicId: 'topic-a',
        nextReviewAt: TODAY_START_MS - 5 * MS_PER_DAY,
      }),
      makeChunkMinimal({
        id: 'c2',
        topicId: 'topic-b',
        nextReviewAt: TODAY_START_MS - 1 * MS_PER_DAY,
      }),
    ];

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(overdueChunks),
      },
      topics: { batchFetchMinimal: vi.fn().mockResolvedValue(topics) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.overdueTopics[0]!.title).toBe('Old Topic');
    expect(result.overdueTopics[0]!.daysOverdue).toBe(5);
    expect(result.overdueTopics[1]!.title).toBe('Recent Topic');
    expect(result.overdueTopics[1]!.daysOverdue).toBe(1);
  });

  it('all port queries are called exactly once', async () => {
    const batchFetchChunks = vi.fn().mockResolvedValue([]);
    const batchFetchTopics = vi.fn().mockResolvedValue([]);
    const getActiveSession = vi.fn().mockResolvedValue(null);
    const listSessions = vi.fn().mockResolvedValue([]);
    const getWeakAreas = vi.fn().mockResolvedValue([]);
    const getReviewsByDateRange = vi.fn().mockResolvedValue([]);

    const deps = makeDeps({
      chunks: { batchFetchMinimal: batchFetchChunks },
      topics: { batchFetchMinimal: batchFetchTopics },
      sessions: { getActiveSession, listSessions },
      reviewPersistence: { getWeakAreas, getReviewsByDateRange },
    });

    await buildLearnerContext(deps, NOW);

    // batchFetchMinimal called once: all chunks (leech count derived in-memory)
    expect(batchFetchChunks).toHaveBeenCalledTimes(1);
    expect(batchFetchTopics).toHaveBeenCalledTimes(1);
    expect(getActiveSession).toHaveBeenCalledTimes(1);
    expect(listSessions).toHaveBeenCalledTimes(1);
    expect(getWeakAreas).toHaveBeenCalledTimes(1);
    expect(getReviewsByDateRange).toHaveBeenCalledTimes(1);
  });

  it('flaggedWeakAreas includes both ease-factor and quality signals', async () => {
    const lowEaseChunk = makeChunkMinimal({
      id: 'c-ease',
      topicId: 'topic-1',
      title: 'Low Ease Chunk',
      easeFactor: 1.8,
    });
    const topics = [makeTopic({ id: 'topic-1', title: 'Topic A' })];
    const qualityWeak = [
      makeWeakArea({
        chunkId: 'c-quality',
        chunkTitle: 'Quality Weak',
        topicTitle: 'Topic B',
        lowCount: 2,
        recentAttempts: 3,
      }),
    ];

    const deps = makeDeps({
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue([lowEaseChunk]),
      },
      topics: { batchFetchMinimal: vi.fn().mockResolvedValue(topics) },
      reviewPersistence: { getWeakAreas: vi.fn().mockResolvedValue(qualityWeak) },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.flaggedWeakAreas).toHaveLength(2);
    const easeArea = result.flaggedWeakAreas.find(a => a.chunk === 'Low Ease Chunk');
    const qualityArea = result.flaggedWeakAreas.find(a => a.chunk === 'Quality Weak');
    expect(easeArea!.reason).toContain('Ease factor 1.80');
    expect(qualityArea!.reason).toContain('2 of last 3 reviews');
  });

  it('recentSessionSummary counts only completed session chunks', async () => {
    const session = makeSession();
    const sessionChunks = [
      makeSessionChunk({ id: 'sc-1', status: 'completed' }),
      makeSessionChunk({ id: 'sc-2', status: 'in_progress' }),
      makeSessionChunk({ id: 'sc-3', status: 'pending' }),
      makeSessionChunk({ id: 'sc-4', status: 'completed' }),
    ];

    const deps = makeDeps({
      sessions: {
        listSessions: vi.fn().mockResolvedValue([session]),
        getSessionChunks: vi.fn().mockResolvedValue(sessionChunks),
      },
    });

    const result = await buildLearnerContext(deps, NOW);

    expect(result.recentSessionSummary!.chunksReviewed).toBe(2);
  });
});
