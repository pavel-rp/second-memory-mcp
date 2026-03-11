import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getNextTeachingStep,
  startLearning,
  type TeachingDeps,
  type StartLearningDeps,
} from '../../../src/orchestration/teaching-workflows.js';
import * as sessionWorkflows from '../../../src/orchestration/session-workflows.js';
import * as recommendationWorkflows from '../../../src/orchestration/recommendation-workflows.js';
import type { LearningSession, SessionChunk } from '../../../src/domain/types/entities.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import type { ChunkAttempt, HistoricalFeedback } from '../../../src/domain/types/session.js';
import type { RecommendationOutput } from '../../../src/domain/types/recommendations.js';
import { serviceOk, serviceFail } from '../../../src/domain/types/service-result.js';
import {
  stubSessionRepository,
  stubChunkRepository,
  stubReviewPersistence,
  stubPrerequisiteMastery,
  stubChunkIdLookup,
} from '../../helpers/stub-ports.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function makeSession(overrides?: Partial<LearningSession>): LearningSession {
  return {
    id: 'sess-1',
    topicId: 'topic-1',
    chunkIds: ['c1', 'c2', 'c3'],
    mode: 'learning',
    estimatedDuration: 30,
    status: 'active',
    startTime: NOW,
    endTime: null,
    feedback: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeSessionChunk(overrides?: Partial<SessionChunk>): SessionChunk {
  return {
    id: 'sc-1',
    sessionId: 'sess-1',
    chunkId: 'c1',
    status: 'pending',
    attemptsJson: null,
    qualityScoresJson: null,
    timeSpentMs: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeAttempt(overrides?: Partial<ChunkAttempt>): ChunkAttempt {
  return {
    timestamp: '2026-03-10T10:00:00Z',
    question: 'What is X?',
    response: 'X is Y',
    passed: true,
    feedback: 'Correct!',
    quality: 4,
    time_spent_ms: 5000,
    ...overrides,
  };
}

function makeChunkData(overrides?: Partial<ChunkWithTopicTitle>): ChunkWithTopicTitle {
  return {
    id: 'c1',
    topicId: 'topic-1',
    title: 'Introduction to X',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 0,
    lastReviewedAt: null,
    estimatedDuration: 10,
    intervalDays: null,
    chunkType: 'new',
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Content about X...',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    topicTitle: 'Topic X',
    ...overrides,
  };
}

function makeDeps(overrides?: {
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
}): TeachingDeps {
  return {
    sessions: stubSessionRepository({
      getActiveSession: vi.fn().mockResolvedValue(makeSession()),
      getSessionChunks: vi
        .fn()
        .mockResolvedValue([
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          makeSessionChunk({ id: 'sc-3', chunkId: 'c3', status: 'pending' }),
        ]),
      getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
      updateSessionChunk: vi.fn().mockResolvedValue(1),
      ...overrides?.sessions,
    }),
    chunks: stubChunkRepository({
      getWithContent: vi.fn().mockResolvedValue(makeChunkData()),
      ...overrides?.chunks,
    }),
    reviewPersistence: stubReviewPersistence(),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  };
}

// ── Tests ────────────────────────────────────────────────────────

describe('getNextTeachingStep', () => {
  // VC-07: No active session
  it('returns error when no active session', async () => {
    const deps = makeDeps({
      sessions: { getActiveSession: vi.fn().mockResolvedValue(null) },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message');
    expect((result as { message: string }).message).toContain('No active session');
  });

  // VC-07: Empty session (no chunks)
  it('returns error when session has no chunks', async () => {
    const deps = makeDeps({
      sessions: { getSessionChunks: vi.fn().mockResolvedValue([]) },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('no chunks');
  });

  // VC-03: Gating — in_progress chunk with no attempts → blocked
  it('returns blocked when in_progress chunk has no attempts', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: null,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('blocked');
    expect(result).toHaveProperty('current_chunk_id', 'c1');
  });

  // VC-03: Gating — in_progress chunk WITH attempts → does NOT block
  it('does not block when in_progress chunk has attempts', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: true })],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    expect(result).toHaveProperty('chunk_id', 'c2');
  });

  // VC-02, VC-04: Fresh pending → learning mode with hydrated instruction
  it('returns teach with learning mode for fresh pending chunk', async () => {
    const deps = makeDeps();

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.mode).toBe('learning');
    expect(result.chunk_id).toBe('c1');
    expect(result.instruction).toBeTruthy();
    expect(result.instruction.length).toBeGreaterThan(0);
    expect(result.drill_format).toBe('explanation');
  });

  // VC-02, VC-05: Fresh pending prioritized over re-queued failure (interleaving)
  it('prioritizes fresh pending over re-queued failure', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
            attemptsJson: [makeAttempt({ passed: false })], // re-queued failure
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }), // fresh
        ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c2');
    expect(result.mode).toBe('learning'); // fresh → learning mode
  });

  // VC-04: Re-queued chunk uses retrieval mode
  it('uses retrieval mode for re-queued chunk', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
            attemptsJson: [makeAttempt({ passed: false })],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.mode).toBe('retrieval');
    expect(result.drill_format).toBe('open_ended');
  });

  // VC-05: Historical feedback included
  it('includes previous feedback from historical sessions', async () => {
    const historicalFeedback: HistoricalFeedback[] = [
      {
        session_id: 'prev-sess',
        session_mode: 'retrieval',
        completed_at: '2026-03-09T10:00:00Z',
        feedback: 'Struggled with the concept of closures',
        chunk_ids: ['c1'],
      },
    ];

    const deps = makeDeps({
      sessions: {
        getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue(historicalFeedback),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.previous_feedback).toEqual(['Struggled with the concept of closures']);
  });

  // Historical feedback fetched with bounded limit
  it('passes limit to getHistoricalFeedbackForChunks', async () => {
    const deps = makeDeps();

    await getNextTeachingStep(deps);

    expect(deps.sessions.getHistoricalFeedbackForChunks).toHaveBeenCalledWith(['c1'], {
      excludeSessionId: 'sess-1',
      limit: 5,
    });
  });

  // VC-06: All chunks completed → complete signal
  it('returns complete when all chunks are completed', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [makeAttempt({ passed: true })],
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
            attemptsJson: [makeAttempt({ passed: false }), makeAttempt({ passed: true })],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(1);
  });

  // VC-06: Summary counts computed correctly
  it('computes summary counts correctly with mixed outcomes', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [makeAttempt({ passed: true })], // first try
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
            attemptsJson: [makeAttempt({ passed: true })], // first try
          }),
          makeSessionChunk({
            id: 'sc-3',
            chunkId: 'c3',
            status: 'completed',
            attemptsJson: [
              makeAttempt({ passed: false }),
              makeAttempt({ passed: false }),
              makeAttempt({ passed: true }),
            ], // needed retry
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(3);
    expect(result.summary.passed_first_try).toBe(2);
    expect(result.summary.needed_retry).toBe(1);
  });

  // VC-07: Chunk not found in DB → error
  it('returns error when chunk not found in database', async () => {
    const deps = makeDeps({
      chunks: { getWithContent: vi.fn().mockResolvedValue(null) },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('not found');
  });

  // VC-08: Chunk marked as in_progress
  it('marks selected chunk as in_progress', async () => {
    const deps = makeDeps();

    await getNextTeachingStep(deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith('sc-1', {
      status: 'in_progress',
    });
  });

  // VC-08: PromptPack hydration — instruction includes chunk title
  it('hydrates instruction with chunk title and content', async () => {
    const deps = makeDeps({
      chunks: {
        getWithContent: vi
          .fn()
          .mockResolvedValue(
            makeChunkData({ title: 'Closures in JavaScript', content: 'A closure captures...' })
          ),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.instruction).toContain('Closures in JavaScript');
  });

  // VC-02: chunk_index and total_chunks correct
  it('returns correct chunk_index and total_chunks', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [makeAttempt()],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          makeSessionChunk({ id: 'sc-3', chunkId: 'c3', status: 'pending' }),
        ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_index).toBe(2); // 1-based, c2 is at index 1
    expect(result.total_chunks).toBe(3);
  });

  // No pending, some in_progress → blocked (not complete)
  it('returns blocked when no pending but some in_progress remain', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [makeAttempt()],
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: true })],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('blocked');
    expect(result).toHaveProperty('current_chunk_id', 'c2');
  });

  // No previous_feedback when no historical feedback exists
  it('omits previous_feedback when no historical feedback exists', async () => {
    const deps = makeDeps();

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.previous_feedback).toBeUndefined();
  });

  // Branch: null content handled gracefully
  it('handles chunk with null content', async () => {
    const deps = makeDeps({
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ content: null })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.instruction).toBeTruthy();
  });

  // Branch: prerequisites populated in prompt
  it('passes prerequisites to prompt when present', async () => {
    const deps = makeDeps({
      chunks: {
        getWithContent: vi
          .fn()
          .mockResolvedValue(makeChunkData({ prerequisitesJson: ['Arrays', 'Loops'] })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.instruction).toContain('Arrays, Loops');
  });

  // Branch: mastery level from repetitions > 0
  it('includes mastery level when chunk has repetitions', async () => {
    const deps = makeDeps({
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ repetitions: 3 })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    // Mastery level is used in retrieval prompt; for learning mode it's still passed
    expect(result.instruction).toBeTruthy();
  });

  // Branch: empty attemptsJson array treated same as null
  it('treats empty attemptsJson array as no attempts', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    // Empty array = no attempts → gating blocks
    expect(result.status).toBe('blocked');
    expect(result).toHaveProperty('current_chunk_id', 'c1');
  });

  // Branch: completed chunk with no attempts in summary
  it('handles completed chunks with no attempts in summary', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: null,
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
            attemptsJson: [makeAttempt({ passed: true })],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(0);
  });

  // Branch: completed chunk where all attempts failed (no pass)
  it('counts chunks where no attempt passed as neither first_try nor retry', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [makeAttempt({ passed: false }), makeAttempt({ passed: false })],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(0);
  });

  // Ordering: selects first pending by session.chunkIds order, not DB row order
  it('selects chunks in session.chunkIds order regardless of DB order', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: ['c2', 'c1', 'c3'] })),
        // DB returns c1 first, but session order says c2 first
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
            makeSessionChunk({ id: 'sc-3', chunkId: 'c3', status: 'pending' }),
          ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c2'); // c2 first per session order
    expect(result.chunk_index).toBe(1); // 1-based position in ordered list
  });

  // Legacy: re-queued detection with `completed` instead of `passed`
  it('treats legacy completed:false attempt as re-queued failure', async () => {
    const legacyAttempt = {
      timestamp: '2026-03-10T10:00:00Z',
      question: 'What is X?',
      response: 'X is Y',
      completed: false,
      feedback: 'Wrong',
      quality: 2,
      time_spent_ms: 5000,
    };
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
            attemptsJson: [legacyAttempt as unknown as ChunkAttempt],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.mode).toBe('retrieval'); // re-queued → retrieval
    expect(result.chunk_id).toBe('c1');
  });

  // Legacy: completed:true not treated as re-queued failure
  it('treats legacy completed:true attempt as passed (not re-queued)', async () => {
    const legacyPassedAttempt = {
      timestamp: '2026-03-10T10:00:00Z',
      question: 'What is X?',
      response: 'X is Y',
      completed: true,
      feedback: 'Correct!',
      quality: 4,
      time_spent_ms: 5000,
    };
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          // Only chunk is completed with a passed legacy attempt
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [legacyPassedAttempt as unknown as ChunkAttempt],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(1);
  });

  // Legacy: buildCompleteResponse with mixed legacy + modern attempts
  it('computes summary correctly with legacy completed field', async () => {
    const legacyPassedAttempt = {
      timestamp: '2026-03-10T10:00:00Z',
      question: 'Q1',
      response: 'A1',
      completed: true,
      feedback: 'OK',
      quality: 4,
      time_spent_ms: 3000,
    };
    const legacyFailedAttempt = {
      timestamp: '2026-03-10T10:01:00Z',
      question: 'Q2',
      response: 'A2',
      completed: false,
      feedback: 'Wrong',
      quality: 1,
      time_spent_ms: 2000,
    };
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [legacyPassedAttempt as unknown as ChunkAttempt],
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
            attemptsJson: [
              legacyFailedAttempt as unknown as ChunkAttempt,
              makeAttempt({ passed: true }),
            ],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(1);
  });

  // Ordering: fallback sort by createdAt when session.chunkIds is null
  it('sorts by createdAt when session.chunkIds is null', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: null })),
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'pending',
            createdAt: NOW + 1000,
          }),
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending', createdAt: NOW }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c1');
  });

  // Ordering: fallback sort by createdAt when session.chunkIds is empty array
  it('sorts by createdAt when session.chunkIds is empty array', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: [] })),
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'pending',
            createdAt: NOW + 1000,
          }),
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending', createdAt: NOW }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c1');
  });

  // Ordering: chunks not in chunkIds map sort to end
  it('sorts unknown chunks to end when not in session.chunkIds', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: ['c2'] })),
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c2');
  });

  // Ordering: tie-breaker by chunkId when unknown chunks share createdAt
  it('breaks ties by chunkId when unknown chunks have same createdAt', async () => {
    const deps = makeDeps({
      sessions: {
        // chunkIds only contains c3 — c1 and c2 are unknown, both pending with same createdAt
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: ['c3'] })),
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending', createdAt: NOW }),
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending', createdAt: NOW }),
          makeSessionChunk({
            id: 'sc-3',
            chunkId: 'c3',
            status: 'completed',
            attemptsJson: [makeAttempt()],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    // c1 < c2 lexicographically, so c1 comes first
    expect(result.chunk_id).toBe('c1');
  });

  // Ordering: unknown chunks with different createdAt sort by createdAt
  it('sorts unknown chunks by createdAt before chunkId tie-breaker', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: ['c3'] })),
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending', createdAt: NOW }),
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
            createdAt: NOW + 1000,
          }),
          makeSessionChunk({
            id: 'sc-3',
            chunkId: 'c3',
            status: 'completed',
            attemptsJson: [makeAttempt()],
          }),
        ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    // c2 has earlier createdAt (NOW) so comes first, despite c1 < c2 lexicographically
    expect(result.chunk_id).toBe('c2');
  });

  // attemptPassed: null attempt handled defensively
  it('treats null attempt in attemptsJson as not passed', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [null as unknown as ChunkAttempt],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(0);
  });

  // attemptPassed: returns false for attempt with neither passed nor completed
  it('treats attempt without passed or completed as not passed in summary', async () => {
    const bareAttempt = {
      timestamp: '2026-03-10T10:00:00Z',
      question: 'Q',
      response: 'A',
      feedback: 'Noted',
      quality: 3,
      time_spent_ms: 1000,
    };
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
            attemptsJson: [bareAttempt as unknown as ChunkAttempt],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(0);
  });

  // Edge case: pending chunk with passed attempts is neither fresh nor requeued
  it('returns error for inconsistent state when pending chunk has passed attempts', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
            attemptsJson: [makeAttempt({ passed: true })],
          }),
        ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message');
    expect((result as { message: string }).message).toContain('inconsistent state');
    expect((result as { message: string }).message).toContain('c1');
  });
});

// ── startLearning ─────────────────────────────────────────────────

function makeChunkListRow(overrides?: Partial<ChunkWithTopicTitle>): ChunkWithTopicTitle {
  return {
    id: 'c1',
    topicId: 'topic-1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 1,
    lastReviewedAt: NOW - 86400000,
    estimatedDuration: 10,
    intervalDays: 1,
    chunkType: 'review',
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Content...',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    topicTitle: 'Topic 1',
    ...overrides,
  };
}

function makeRecommendationOutput(overrides?: Partial<RecommendationOutput>): RecommendationOutput {
  return {
    recommendations: [
      {
        item: {
          id: 'c1',
          title: 'Chunk 1',
          subject: 'CS',
          difficulty: 5,
          nextReviewDate: '2026-03-10',
          easeFactor: 2.5,
          repetitions: 1,
          estimatedDuration: 10,
          chunkType: 'review',
        },
        priority: 10,
        reason: 'overdue',
        order: 1,
        cognitiveLoad: 3,
      },
    ],
    sessionSummary: {
      totalItems: 1,
      totalDuration: 10,
      totalCognitiveLoad: 3,
      newItems: 0,
      reviewItems: 1,
      remediationItems: 0,
      subjects: ['CS'],
    },
    estimatedDuration: 10,
    rationale: 'Review overdue items',
    ...overrides,
  };
}

function makeStartLearningDeps(overrides?: {
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
}): StartLearningDeps {
  return {
    sessions: stubSessionRepository({
      // For getNextTeachingStep (called after session creation)
      getActiveSession: vi.fn().mockResolvedValue(makeSession({ id: 'new-sess' })),
      getSessionChunks: vi
        .fn()
        .mockResolvedValue([
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending', sessionId: 'new-sess' }),
        ]),
      getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
      updateSessionChunk: vi.fn().mockResolvedValue(1),
      ...overrides?.sessions,
    }),
    chunks: stubChunkRepository({
      list: vi.fn().mockResolvedValue([makeChunkListRow()]),
      getWithContent: vi.fn().mockResolvedValue(makeChunkData()),
      ...overrides?.chunks,
    }),
    mastery: stubPrerequisiteMastery(),
    chunkIdLookup: stubChunkIdLookup(),
    reviewPersistence: stubReviewPersistence(),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    maxDependencyDepth: 5,
  };
}

describe('startLearning', () => {
  beforeEach(() => {
    vi.spyOn(sessionWorkflows, 'getActiveSession').mockResolvedValue(null);
    vi.spyOn(sessionWorkflows, 'createSession').mockResolvedValue(
      serviceOk({ sessionId: 'new-sess' })
    );
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue(
      makeRecommendationOutput()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns error when an active session already exists', async () => {
    vi.spyOn(sessionWorkflows, 'getActiveSession').mockResolvedValue(makeSession());
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('active session already exists');
  });

  it('returns nothing_due when DB has no chunks', async () => {
    const deps = makeStartLearningDeps({
      chunks: { list: vi.fn().mockResolvedValue([]) },
    });

    const result = await startLearning({}, deps);

    expect(result.status).toBe('nothing_due');
  });

  it('returns nothing_due with subject hint when subject_filter used and no items', async () => {
    const deps = makeStartLearningDeps({
      chunks: { list: vi.fn().mockResolvedValue([]) },
    });

    const result = await startLearning({ subjectFilter: 'Math' }, deps);

    expect(result.status).toBe('nothing_due');
    expect((result as { message: string }).message).toContain('Math');
  });

  it('returns nothing_due when no recommendations are available', async () => {
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue(
      makeRecommendationOutput({ recommendations: [] })
    );
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('nothing_due');
  });

  it('auto-detects mode as review when due review items exist', async () => {
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('started');
    if (result.status !== 'started') throw new Error('Expected started');
    expect(result.mode).toBe('review');
  });

  it('auto-detects mode as learning when only new content is available', async () => {
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue(
      makeRecommendationOutput({
        recommendations: [
          {
            item: {
              id: 'c1',
              title: 'New Chunk',
              subject: 'CS',
              difficulty: 3,
              nextReviewDate: '2026-03-15',
              easeFactor: 2.5,
              repetitions: 0,
              estimatedDuration: 10,
              chunkType: 'new',
            },
            priority: 5,
            reason: 'new content',
            order: 1,
            cognitiveLoad: 2,
          },
        ],
      })
    );
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('started');
    if (result.status !== 'started') throw new Error('Expected started');
    expect(result.mode).toBe('learning');
  });

  it('uses explicitly provided mode when specified', async () => {
    const deps = makeStartLearningDeps();

    const result = await startLearning({ mode: 'learning' }, deps);

    expect(result.status).toBe('started');
    if (result.status !== 'started') throw new Error('Expected started');
    expect(result.mode).toBe('learning');
  });

  it('returns started with sessionId, totalChunks, firstChunk on success', async () => {
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('started');
    if (result.status !== 'started') throw new Error('Expected started');
    expect(result.session_id).toBe('new-sess');
    expect(result.total_chunks).toBe(1);
    expect(result.estimated_duration_minutes).toBe(10);
    expect(result.first_chunk).toBeDefined();
    expect(result.first_chunk.status).toBe('teach');
    expect(result.recommendation_summary).toBe('Review overdue items');
  });

  it('returns error when session creation fails', async () => {
    vi.spyOn(sessionWorkflows, 'createSession').mockResolvedValue(
      serviceFail({ type: 'conflict', message: 'Race condition' })
    );
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('Race condition');
  });

  it('passes subject_filter to chunks.list', async () => {
    const deps = makeStartLearningDeps();

    await startLearning({ subjectFilter: 'Math' }, deps);

    expect(deps.chunks.list).toHaveBeenCalledWith(
      expect.objectContaining({ subjectFilter: 'Math' })
    );
  });

  it('passes time_available_minutes to generateRecommendations', async () => {
    const deps = makeStartLearningDeps();

    await startLearning({ timeAvailableMinutes: 15 }, deps);

    expect(recommendationWorkflows.generateRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({ timeAvailable: 15 }),
      expect.anything(),
      expect.any(Date)
    );
  });
});
