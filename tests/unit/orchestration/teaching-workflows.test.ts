import { describe, it, expect, vi } from 'vitest';
import {
  getNextTeachingStep,
  type TeachingDeps,
} from '../../../src/orchestration/teaching-workflows.js';
import type { LearningSession, SessionChunk } from '../../../src/domain/types/entities.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import type { ChunkAttempt, HistoricalFeedback } from '../../../src/domain/types/session.js';
import { stubSessionRepository, stubChunkRepository } from '../../helpers/stub-ports.js';

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

  // VC-02, VC-05: Re-queued failure prioritized over fresh pending
  it('prioritizes re-queued failure over fresh pending', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }), // fresh
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'pending',
            attemptsJson: [makeAttempt({ passed: false })], // re-queued failure
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
    expect(result.chunk_id).toBe('c2');
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

  // Ordering: fallback when session.chunkIds is null
  it('preserves DB order when session.chunkIds is null', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession({ chunkIds: null })),
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c1');
  });
});
