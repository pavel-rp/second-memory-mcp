import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getNextTeachingStep,
  startLearning,
  type TeachingDeps,
  type StartLearningDeps,
} from '../../../src/orchestration/teaching-workflows.js';
import * as sessionWorkflows from '../../../src/orchestration/session-workflows.js';
import * as recommendationWorkflows from '../../../src/orchestration/recommendation-workflows.js';
import type {
  LearningSession,
  SessionChunk,
  SessionQuestion,
  SessionQuestionAttempt,
} from '../../../src/domain/types/entities.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import type { HistoricalFeedback } from '../../../src/domain/types/session.js';
import type { TopicRecommendationOutput } from '../../../src/domain/types/recommendations.js';
import type { SessionQuestionRepository } from '../../../src/ports/session-question-repository.js';
import { serviceOk, serviceFail } from '../../../src/domain/types/service-result.js';
import {
  stubSessionRepository,
  stubChunkRepository,
  stubReviewPersistence,
  stubSessionQuestionRepository,
  stubNotesRepository,
} from '../../helpers/stub-ports.js';
import type { NotesRepository } from '../../../src/ports/notes-repository.js';
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
    timeSpentMs: 0,
    createdAt: NOW,
    updatedAt: NOW,
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
    contentStatus: 'final',
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

/**
 * Mock normalized questions + attempts on a SessionQuestionRepository.
 * Replaces what was previously inline `attemptsJson` on SessionChunk objects.
 *
 * Each entry in `data` maps a session-chunk ID to a list of attempts.
 * Attempts are grouped into questions (max 2 attempts per question).
 */
function mockQuestionsAndAttempts(
  sqRepo: SessionQuestionRepository,
  data: { scId: string; attempts: { passed: boolean; quality?: number | null }[] }[]
) {
  const allQuestions: SessionQuestion[] = [];
  const allAttempts: SessionQuestionAttempt[] = [];
  for (const chunk of data) {
    for (let i = 0; i < chunk.attempts.length; i += 2) {
      const q: SessionQuestion = {
        id: `sq-${chunk.scId}-${Math.floor(i / 2)}`,
        sessionChunkId: chunk.scId,
        questionIndex: Math.floor(i / 2) + 1,
        promptText: 'test question',
        status: 'answered',
        createdAt: NOW,
        updatedAt: NOW,
      };
      allQuestions.push(q);

      for (let j = i; j < Math.min(i + 2, chunk.attempts.length); j++) {
        const a: SessionQuestionAttempt = {
          id: `sqa-${chunk.scId}-${j}`,
          sessionQuestionId: q.id,
          attemptNumber: (j - i + 1) as 1 | 2,
          response: 'test response',
          passed: chunk.attempts[j]!.passed,
          feedback: 'test feedback',
          quality: chunk.attempts[j]!.quality ?? (chunk.attempts[j]!.passed ? 5 : 1),
          timeSpentMs: 1000,
          createdAt: NOW,
        };
        allAttempts.push(a);
      }
    }
  }
  vi.mocked(sqRepo.getQuestionsForChunks).mockResolvedValue(allQuestions);
  vi.mocked(sqRepo.getAllAttemptsForChunks).mockResolvedValue(allAttempts);
}

function makeDeps(overrides?: {
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
  sessionQuestions?: SessionQuestionRepository;
  notes?: NotesRepository;
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
    sessionQuestions: overrides?.sessionQuestions ?? stubSessionQuestionRepository(),
    notes: overrides?.notes,
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
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });
    // No attempts mocked — default stub returns empty arrays

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('blocked');
    expect(result).toHaveProperty('current_chunk_id', 'c1');
  });

  // VC-03: Gating — in_progress chunk WITH attempts → does NOT block
  it('does not block when in_progress chunk has attempts', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    expect(result).toHaveProperty('chunk_id', 'c2');
    expect(result).toHaveProperty('session_chunk_id', 'sc-2');
  });

  // VC-02, VC-04: Fresh pending → learning mode with hydrated instruction
  it('returns teach with learning mode for fresh pending chunk', async () => {
    const deps = makeDeps();

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.mode).toBe('learning');
    expect(result.chunk_id).toBe('c1');
    expect(result.session_chunk_id).toBe('sc-1');
    expect(result.instruction).toBeTruthy();
    expect(result.instruction.length).toBeGreaterThan(0);
    expect(result.drill_format).toBe('explanation');
  });

  // VC-02, VC-05: Fresh pending prioritized over re-queued failure (interleaving)
  it('prioritizes fresh pending over re-queued failure', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
          }), // re-queued failure (has failed attempt)
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }), // fresh
        ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: false }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_id).toBe('c2');
    expect(result.mode).toBe('learning'); // fresh → learning mode
  });

  // chunkIsRequeuedFailure returns false when last question has no attempts
  it('treats chunk as fresh when last question has no attempts', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' })]),
      },
      sessionQuestions: sqRepo,
    });
    // Question exists but has no attempts → chunkHasAttempts=false, chunkIsRequeuedFailure=false
    const questionWithNoAttempts: SessionQuestion = {
      id: 'sq-orphan',
      sessionChunkId: 'sc-1',
      questionIndex: 1,
      promptText: 'test',
      status: 'pending',
      createdAt: NOW,
      updatedAt: NOW,
    };
    vi.mocked(sqRepo.getQuestionsForChunks).mockResolvedValue([questionWithNoAttempts]);
    vi.mocked(sqRepo.getAllAttemptsForChunks).mockResolvedValue([]);

    const result = await getNextTeachingStep(deps);

    // Chunk is treated as fresh (learning mode) since question has no attempts
    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.mode).toBe('learning');
  });

  // VC-04: Re-queued chunk uses retrieval mode
  it('uses retrieval mode for re-queued chunk', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: false }] }]);

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
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: true }] },
      { scId: 'sc-2', attempts: [{ passed: false }, { passed: true }] },
    ]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(1);
  });

  // VC-06: Summary counts computed correctly
  it('computes summary counts correctly with mixed outcomes', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
          }),
          makeSessionChunk({
            id: 'sc-3',
            chunkId: 'c3',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: true }] }, // first try
      { scId: 'sc-2', attempts: [{ passed: true }] }, // first try
      { scId: 'sc-3', attempts: [{ passed: false }, { passed: false }, { passed: true }] }, // needed retry
    ]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(3);
    expect(result.summary.passed_first_try).toBe(2);
    expect(result.summary.needed_retry).toBe(1);
  });

  // Summary: exhausted_retries counted when no attempt passed
  it('counts exhausted_retries when all attempts failed', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'completed' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'completed' }),
          ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: true }] },
      { scId: 'sc-2', attempts: [{ passed: false }, { passed: false }] }, // all failed
    ]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.exhausted_retries).toBe(1);
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
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          makeSessionChunk({ id: 'sc-3', chunkId: 'c3', status: 'pending' }),
        ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.chunk_index).toBe(2); // 1-based, c2 is at index 1
    expect(result.total_chunks).toBe(3);
  });

  // No pending, some in_progress → blocked (not complete)
  it('returns blocked when no pending but some in_progress remain', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'in_progress',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: true }] },
      { scId: 'sc-2', attempts: [{ passed: true }] },
    ]);

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

  // Notes surfaced in teach_next when chunk has notes
  it('includes notes array when chunk has notes attached', async () => {
    const deps = makeDeps({
      notes: stubNotesRepository({
        getNotesForChunkIds: vi.fn().mockResolvedValue([
          {
            id: 'n1',
            noteType: 'insight',
            content: 'Derived proof',
            author: 'agent',
            createdAt: NOW,
          },
          {
            id: 'n2',
            noteType: 'confusion',
            content: 'Index confusion',
            author: 'user',
            createdAt: NOW - 1000,
          },
        ]),
      }),
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.notes).toHaveLength(2);
    expect(result.notes![0]).toEqual({
      id: 'n1',
      note_type: 'insight',
      content: 'Derived proof',
      author: 'agent',
      created_at: NOW,
    });
  });

  // Notes omitted when chunk has no notes
  it('omits notes when chunk has no notes', async () => {
    const deps = makeDeps({
      notes: stubNotesRepository({
        getNotesForChunkIds: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.notes).toBeUndefined();
  });

  // Notes omitted when notes port is not provided
  it('omits notes when notes port is undefined', async () => {
    const deps = makeDeps(); // no notes override

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.notes).toBeUndefined();
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

  // Branch: empty questions (no attempts) treated same as null
  it('treats no attempts as blocked for in_progress chunk', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });
    // Default stub returns empty arrays — no questions/attempts

    const result = await getNextTeachingStep(deps);

    // Empty = no attempts → gating blocks
    expect(result.status).toBe('blocked');
    expect(result).toHaveProperty('current_chunk_id', 'c1');
  });

  // Branch: completed chunk with no attempts in summary
  it('handles completed chunks with no attempts in summary', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    // sc-1 has no attempts, sc-2 has a passed attempt
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-2', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(0);
  });

  // Branch: completed chunk where all attempts failed (no pass) — counts as exhausted
  it('counts single-presentation all-fail as exhausted_retries', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: false }, { passed: false }] },
    ]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(0);
    expect(result.summary.exhausted_retries).toBe(1);
  });

  // Grind loop: exhausted_retries counted for force-completed chunks
  it('counts exhausted_retries for force-completed chunks at retry cap', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    const exhaustedAttempts = Array.from({ length: 8 }, () => ({ passed: false }));
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: exhaustedAttempts }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.exhausted_retries).toBe(1);
    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(0);
  });

  // Grind loop: summary with mixed outcomes (passed, retried, exhausted)
  it('computes summary correctly with passed, retried, and exhausted chunks', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const exhaustedAttempts = Array.from({ length: 8 }, () => ({ passed: false }));
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          // Passed first try
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          // Needed retry (failed then passed)
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
          }),
          // Exhausted retries (all failed, reached retry cap)
          makeSessionChunk({
            id: 'sc-3',
            chunkId: 'c3',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: true }] },
      { scId: 'sc-2', attempts: [{ passed: false }, { passed: false }, { passed: true }] },
      { scId: 'sc-3', attempts: exhaustedAttempts },
    ]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.total).toBe(3);
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(1);
    expect(result.summary.exhausted_retries).toBe(1);
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

  // Re-queued detection with failed attempts in normalized tables
  it('treats chunk with failed attempts as re-queued failure', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: false }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    expect(result.mode).toBe('retrieval'); // re-queued → retrieval
    expect(result.chunk_id).toBe('c1');
  });

  // Chunk with passed attempts treated as non-requeued in summary
  it('treats chunk with passed attempts as passed in summary', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(1);
  });

  // Summary with mixed legacy + modern attempts (passed + retry)
  it('computes summary correctly with mixed first-try and retry', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
          makeSessionChunk({
            id: 'sc-2',
            chunkId: 'c2',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [
      { scId: 'sc-1', attempts: [{ passed: true }] },
      { scId: 'sc-2', attempts: [{ passed: false }, { passed: true }] },
    ]);

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
    const sqRepo = stubSessionQuestionRepository();
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
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-3', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    // c1 < c2 lexicographically, so c1 comes first
    expect(result.chunk_id).toBe('c1');
  });

  // Ordering: unknown chunks with different createdAt sort by createdAt
  it('sorts unknown chunks by createdAt before chunkId tie-breaker', async () => {
    const sqRepo = stubSessionQuestionRepository();
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
          }),
        ]),
      },
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-3', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('teach');
    if (result.status !== 'teach') throw new Error('Expected teach');
    // c2 has earlier createdAt (NOW) so comes first, despite c1 < c2 lexicographically
    expect(result.chunk_id).toBe('c2');
  });

  // Completed chunk with no questions/attempts — summary counts 0 for it
  it('treats completed chunk with no attempts as neither passed nor retried', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
        ]),
      },
    });
    // No attempts mocked — default stub returns empty

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(0);
  });

  // Attempt without passed field defaults to false in normalized data
  it('treats attempt without passed as not passed in summary', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'completed',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: false }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Expected complete');
    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(0);
  });

  it('includes content_status in teach response', async () => {
    const deps = makeDeps({
      chunks: {
        getWithContent: vi.fn().mockResolvedValue(makeChunkData({ contentStatus: 'draft' })),
      },
    });

    const result = await getNextTeachingStep(deps);
    expect(result.status).toBe('teach');
    if (result.status === 'teach') {
      expect(result.content_status).toBe('draft');
    }
  });

  // Edge case: pending chunk with passed attempts is neither fresh nor requeued
  it('returns error for inconsistent state when pending chunk has passed attempts', async () => {
    const sqRepo = stubSessionQuestionRepository();
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'pending',
          }),
        ]),
      },
      sessionQuestions: sqRepo,
    });
    mockQuestionsAndAttempts(sqRepo, [{ scId: 'sc-1', attempts: [{ passed: true }] }]);

    const result = await getNextTeachingStep(deps);

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message');
    expect((result as { message: string }).message).toContain('inconsistent state');
    expect((result as { message: string }).message).toContain('1 pending chunk(s)');
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
    contentStatus: 'final',
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

function makeRecommendationOutput(
  overrides?: Partial<TopicRecommendationOutput>
): TopicRecommendationOutput {
  return {
    recommendations: [
      {
        topicId: 'topic-1',
        topicTitle: 'Topic 1',
        urgencyScore: 0.5,
        urgencyReason: '1 chunk overdue (max 1 day)',
        dueChunkIds: ['c1'],
        dueChunkCount: 1,
        totalChunkCount: 3,
        estimatedDuration: 10,
        hasNewChunks: false,
      },
    ],
    totalDueTopics: 1,
    totalDueChunks: 1,
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
    reviewPersistence: stubReviewPersistence(),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    sessionQuestions: stubSessionQuestionRepository(),
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

  it('returns nothing_due when no due chunks exist', async () => {
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue({
      recommendations: [],
      totalDueTopics: 0,
      totalDueChunks: 0,
    });
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('nothing_due');
  });

  it('returns nothing_due with subject hint when subject_filter used and no items', async () => {
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue({
      recommendations: [],
      totalDueTopics: 0,
      totalDueChunks: 0,
    });
    const deps = makeStartLearningDeps();

    const result = await startLearning({ subjectFilter: 'Math' }, deps);

    expect(result.status).toBe('nothing_due');
    expect((result as { message: string }).message).toContain('Math');
  });

  it('returns nothing_due when no recommendations are available', async () => {
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue({
      recommendations: [],
      totalDueTopics: 0,
      totalDueChunks: 0,
    });
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

  it('auto-detects mode as learning when topic has new chunks', async () => {
    vi.spyOn(recommendationWorkflows, 'generateRecommendations').mockResolvedValue(
      makeRecommendationOutput({
        recommendations: [
          {
            topicId: 'topic-1',
            topicTitle: 'New Topic',
            urgencyScore: 0.3,
            urgencyReason: '2 chunks ready to learn',
            dueChunkIds: ['c1'],
            dueChunkCount: 1,
            totalChunkCount: 3,
            estimatedDuration: 10,
            hasNewChunks: true,
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

  it('returns started with sessionId, totalChunks, firstChunk on success', async () => {
    const deps = makeStartLearningDeps();

    const result = await startLearning({}, deps);

    expect(result.status).toBe('started');
    if (result.status !== 'started') throw new Error('Expected started');
    expect(result.session_id).toBe('new-sess');
    expect(result.total_chunks).toBe(1);
    expect(result.estimated_duration).toBe(10);
    expect(result.first_chunk).toBeDefined();
    expect(result.first_chunk.status).toBe('teach');
    expect(result.recommendation_summary).toContain('Topic 1');
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

  it('passes subject_filter to generateRecommendations', async () => {
    const deps = makeStartLearningDeps();

    await startLearning({ subjectFilter: 'Math' }, deps);

    expect(recommendationWorkflows.generateRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({ subjectFilter: 'Math' }),
      expect.anything(),
      expect.any(Date)
    );
  });
});
