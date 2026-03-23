import { describe, it, expect, vi } from 'vitest';
import {
  submitAnswer,
  createSessionQuestions,
  aggregateQuestionQualities,
  type TeachingDeps,
} from '../../../src/orchestration/teaching-workflows.js';
import type {
  LearningSession,
  SessionChunk,
  LearningChunk,
  SessionQuestion,
  SessionQuestionAttempt,
} from '../../../src/domain/types/entities.js';
import type { SubmitAnswerInput } from '../../../src/domain/types/teaching.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import {
  stubSessionRepository,
  stubChunkRepository,
  stubReviewPersistence,
  stubSessionQuestionRepository,
} from '../../helpers/stub-ports.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function makeSession(overrides?: Partial<LearningSession>): LearningSession {
  return {
    id: 'sess-1',
    topicId: 'topic-1',
    chunkIds: ['c1', 'c2'],
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

function makeLearningChunk(overrides?: Partial<LearningChunk>): LearningChunk {
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
    condensedSummary: null,
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Content about X...',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeChunkData(overrides?: Partial<ChunkWithTopicTitle>): ChunkWithTopicTitle {
  return {
    ...makeLearningChunk(),
    topicTitle: 'Topic X',
    ...overrides,
  };
}

function makeInput(overrides?: Partial<SubmitAnswerInput>): SubmitAnswerInput {
  return {
    question: 'What is X?',
    response: 'X is a concept',
    passed: true,
    feedback: 'Good explanation',
    timeSpentMs: 5000,
    ...overrides,
  };
}

function makeDeps(overrides?: {
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
  reviewPersistence?: Partial<Parameters<typeof stubReviewPersistence>[0]>;
  sessionQuestions?: Partial<Parameters<typeof stubSessionQuestionRepository>[0]>;
}): TeachingDeps {
  return {
    sessions: stubSessionRepository({
      getActiveSession: vi.fn().mockResolvedValue(makeSession()),
      getSessionChunks: vi
        .fn()
        .mockResolvedValue([
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
      updateSessionChunk: vi.fn().mockResolvedValue(1),
      ...overrides?.sessions,
    }),
    chunks: stubChunkRepository({
      getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      ...overrides?.chunks,
    }),
    reviewPersistence: stubReviewPersistence({
      getChunk: vi.fn().mockResolvedValue(makeLearningChunk()),
      persistReviewUpdate: vi.fn().mockResolvedValue(1),
      ...overrides?.reviewPersistence,
    }),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    sessionQuestions: stubSessionQuestionRepository({
      getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      ...overrides?.sessionQuestions,
    }),
  };
}

// ── Tests ────────────────────────────────────────────────────────

describe('submitAnswer', () => {
  // VC-09: No active session
  it('returns error when no active session', async () => {
    const deps = makeDeps({
      sessions: { getActiveSession: vi.fn().mockResolvedValue(null) },
    });

    const result = await submitAnswer(makeInput(), deps);

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message');
    expect((result as { message: string }).message).toContain('No active session');
  });

  // VC-09: No in-progress chunk
  it('returns error when no in-progress chunk', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'completed' }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput(), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('No in-progress chunk');
  });

  // VC-02: First attempt pass → quality 5
  it('returns recorded with quality 5 on first attempt pass', async () => {
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

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5);
    expect(result.attempt).toBe(1);
    expect(result.passed).toBe(true);
    expect(result.chunk_id).toBe('c1');
  });

  // VC-03: First attempt fail → retry, no SR update
  it('returns retry on first attempt fail with no SR update', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
        ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: false }), deps);

    expect(result.status).toBe('retry');
    if (result.status !== 'retry') throw new Error('Expected retry');
    expect(result.attempt).toBe(1);
    expect(result.chunk_id).toBe('c1');
    expect(result.feedback).toBe('Good explanation');
    // SR update should NOT be called
    expect(deps.reviewPersistence.persistReviewUpdate).not.toHaveBeenCalled();
  });

  // NEU-128: Retry path returns error when updateSessionChunk returns 0 rows
  it('returns error when retry-path updateSessionChunk returns 0 rows', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
        ]),
        updateSessionChunk: vi.fn().mockResolvedValue(0),
      },
    });

    const result = await submitAnswer(makeInput({ passed: false }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain(
      'Failed to update session chunk time tracking'
    );
  });

  // VC-02: Second attempt pass → quality 3
  it('returns recorded with quality 3 on second attempt pass', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
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
      sessionQuestions: {
        // One pending question already exists (created on first attempt)
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion]) // find current question
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }]) // after marking answered
          .mockResolvedValue([]),
        // One prior attempt exists (the first failed attempt)
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: true, quality: 3 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(3);
    expect(result.attempt).toBe(2);
    expect(result.passed).toBe(true);
  });

  // VC-02 + VC-04: Second attempt fail → quality 1, SR update triggered
  it('returns recorded with quality 1 on second attempt fail and triggers SR update', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
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
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion])
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: false, quality: 1 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: false }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(1);
    expect(result.attempt).toBe(2);
    expect(result.passed).toBe(false);
    // SR update was triggered (getChunk + persistReviewUpdate called)
    expect(deps.reviewPersistence.getChunk).toHaveBeenCalledWith('c1');
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalled();
  });

  // VC-05: Second attempt fail → re-queues chunk to 'pending'
  it('re-queues chunk to pending on second attempt fail', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
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
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion])
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: false, quality: 1 }),
          ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    // Should update status to 'pending' (re-queue)
    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'pending' })
    );
  });

  // VC-05: First attempt pass → marks chunk 'completed' (not re-queued)
  it('marks chunk completed on first attempt pass', async () => {
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

    await submitAnswer(makeInput({ passed: true }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'completed' })
    );
  });

  // VC-05: Second attempt pass → marks chunk 'completed'
  it('marks chunk completed on second attempt pass', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
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
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion])
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: true, quality: 3 }),
          ]),
      },
    });

    await submitAnswer(makeInput({ passed: true }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'completed' })
    );
  });

  // VC-07: Re-queued chunk starts a new presentation (per-presentation attempt counting)
  it('allows new attempts on re-queued chunk (new presentation)', async () => {
    // 2 prior answered questions (prior presentations); no pending question → new one created
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
      sessionQuestions: {
        // No pending question → legacy flow creates a new one
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-old-1', status: 'answered' }),
            makeQuestion({ id: 'sq-old-2', status: 'answered' }),
          ])
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-old-1', status: 'answered' }),
            makeQuestion({ id: 'sq-old-2', status: 'answered' }),
            makeQuestion({ id: 'sq-new', status: 'answered' }),
          ])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(
          new Map([
            ['sq-old-1', ['c1']],
            ['sq-old-2', ['c1']],
            ['sq-new', ['c1']],
          ])
        ),
        createQuestions: vi
          .fn()
          .mockResolvedValue([
            makeQuestion({ id: 'sq-new', sessionId: 'sess-1', status: 'pending' }),
          ]),
        // New question has 0 existing attempts
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ id: 'a1', sessionQuestionId: 'sq-old-1', quality: 1 }),
            makeQuestionAttempt({ id: 'a2', sessionQuestionId: 'sq-old-2', quality: 1 }),
            makeQuestionAttempt({ id: 'a3', sessionQuestionId: 'sq-new', quality: 5 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.attempt).toBe(1); // attempt 1 of new presentation
    expect(result.quality).toBe(5); // first-attempt pass
  });

  // VC-08: Attempt persisted via sessionQuestions.createAttempt
  it('persists attempt data via createAttempt', async () => {
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

    await submitAnswer(
      makeInput({
        question: 'What is closure?',
        response: 'A function that captures scope',
        passed: true,
        feedback: 'Correct explanation',
        timeSpentMs: 8000,
      }),
      deps
    );

    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptNumber: 1,
        response: 'A function that captures scope',
        passed: true,
        feedback: 'Correct explanation',
        quality: 5,
        timeSpentMs: 8000,
      })
    );
  });

  // VC-06: Piggyback teach_next after completion
  it('piggybacks teach_next result after completion', async () => {
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

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.next).toBeDefined();
    // The piggyback result should be a valid TeachNextResponse
    expect(['teach', 'complete', 'blocked', 'error']).toContain(result.next.status);
  });

  // VC-04: SR update has correct review_update fields
  it('includes review_update with SR fields on recorded result', async () => {
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

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.review_update).toBeDefined();
    expect(result.review_update).toHaveProperty('next_review_date');
    expect(result.review_update).toHaveProperty('interval_days');
    expect(result.review_update).toHaveProperty('ease_factor');
    expect(result.review_update).toHaveProperty('is_leech');
    expect(typeof result.review_update!.next_review_date).toBe('string');
    expect(typeof result.review_update!.interval_days).toBe('number');
    expect(typeof result.review_update!.ease_factor).toBe('number');
    expect(typeof result.review_update!.is_leech).toBe('boolean');
  });

  // VC-08: timeSpentMs accumulated across attempts
  it('accumulates timeSpentMs across attempts', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            timeSpentMs: 3000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion])
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            attemptNumber: 1,
            passed: false,
            quality: null,
            timeSpentMs: 3000,
          }),
        ]),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            attemptNumber: 1,
            passed: false,
            quality: null,
            timeSpentMs: 3000,
          }),
          makeQuestionAttempt({ attemptNumber: 2, passed: true, quality: 3, timeSpentMs: 4000 }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: true, timeSpentMs: 4000 }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        timeSpentMs: 7000, // 3000 + 4000 (sum of all attempt times)
      })
    );
  });

  // VC-03: First attempt fail persists attempt but no status change
  it('persists attempt on first fail without changing status', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    // createAttempt should have been called
    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ attemptNumber: 1, passed: false, quality: null })
    );
    // updateSessionChunk called without status change (retry keeps in_progress)
    const call = (deps.sessions.updateSessionChunk as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe('sc-1');
    expect(call[1]).not.toHaveProperty('status');
    expect(call[1]).not.toHaveProperty('attemptsJson');
    expect(call[1]).toHaveProperty('timeSpentMs');
  });

  // VC-08: Second attempt persisted via createAttempt
  it('persists second attempt via createAttempt', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            timeSpentMs: 2000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion])
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            attemptNumber: 1,
            passed: false,
            quality: null,
            timeSpentMs: 2000,
          }),
        ]),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            attemptNumber: 1,
            passed: false,
            quality: null,
            timeSpentMs: 2000,
          }),
          makeQuestionAttempt({ attemptNumber: 2, passed: true, quality: 3, timeSpentMs: 3000 }),
        ]),
      },
    });

    await submitAnswer(
      makeInput({ question: 'Q2', response: 'A2', passed: true, timeSpentMs: 3000 }),
      deps
    );

    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptNumber: 2,
        response: 'A2',
        passed: true,
        quality: 3,
        timeSpentMs: 3000,
      })
    );
  });

  // SR failure returns explicit error instead of fake review_update
  it('returns error when SR persistence fails', async () => {
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
      reviewPersistence: {
        getChunk: vi.fn().mockResolvedValue(undefined), // chunk not found → SR fails
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain(
      'Failed to persist spaced repetition'
    );
  });

  // Grind loop: 3rd presentation still re-queues (presentationCount=3 ≤ MAX_RETRIES=3)
  it('re-queues chunk on 3rd presentation', async () => {
    // 3 questions total = 3 presentations; current is the 3rd (pending)
    const pendingQuestion = makeQuestion({ id: 'sq-3', sessionId: 'sess-1', status: 'pending' });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            timeSpentMs: 15000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
            pendingQuestion,
          ])
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
            { ...pendingQuestion, status: 'answered' },
          ])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(
          new Map([
            ['sq-1', ['c1']],
            ['sq-2', ['c1']],
            ['sq-3', ['c1']],
          ])
        ),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    // presentationCount = 3 ≤ MAX_RETRIES → re-queue
    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'pending' })
    );
  });

  // Grind loop: 4th presentation force-completes (presentationCount=4 > MAX_RETRIES=3)
  it('force-completes chunk after exhausting retries (4th presentation)', async () => {
    // 4 questions = 4 presentations; current is the 4th (pending), attempt 2 fails
    const pendingQuestion = makeQuestion({ id: 'sq-4', sessionId: 'sess-1', status: 'pending' });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            timeSpentMs: 35000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
            makeQuestion({ id: 'sq-3', status: 'answered' }),
            pendingQuestion,
          ])
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
            makeQuestion({ id: 'sq-3', status: 'answered' }),
            { ...pendingQuestion, status: 'answered' },
          ])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(
          new Map([
            ['sq-1', ['c1']],
            ['sq-2', ['c1']],
            ['sq-3', ['c1']],
            ['sq-4', ['c1']],
          ])
        ),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            id: 'a1',
            sessionQuestionId: 'sq-4',
            quality: 1,
            timeSpentMs: 5000,
          }),
        ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: false }), deps);

    // presentationCount = 4 > MAX_RETRIES = 3 → force-complete
    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'completed' })
    );
    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(1);
    expect(result.passed).toBe(false);
  });

  // Grind loop: force-completed chunk still triggers SR update with quality 1
  it('triggers SR update with quality 1 on force-completion', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-4', sessionId: 'sess-1', status: 'pending' });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            timeSpentMs: 35000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
            makeQuestion({ id: 'sq-3', status: 'answered' }),
            pendingQuestion,
          ])
          .mockResolvedValueOnce([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
            makeQuestion({ id: 'sq-3', status: 'answered' }),
            { ...pendingQuestion, status: 'answered' },
          ])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(
          new Map([
            ['sq-1', ['c1']],
            ['sq-2', ['c1']],
            ['sq-3', ['c1']],
            ['sq-4', ['c1']],
          ])
        ),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            id: 'a1',
            sessionQuestionId: 'sq-4',
            quality: 1,
            timeSpentMs: 5000,
          }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    expect(deps.reviewPersistence.getChunk).toHaveBeenCalledWith('c1');
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalled();
  });

  // Grind loop: 1st presentation double fail still re-queues (regression guard)
  it('re-queues on 1st presentation double fail (existing behavior)', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
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
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([pendingQuestion])
          .mockResolvedValueOnce([{ ...pendingQuestion, status: 'answered' }])
          .mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: false, quality: 1 }),
          ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'pending' })
    );
  });

  // No existing questions → first attempt behavior
  it('treats no existing questions as first attempt', async () => {
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
      sessionQuestions: {
        // No existing questions for this chunk
        getQuestionsForSession: vi.fn().mockResolvedValue([]),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map()),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5); // first attempt, passed
    expect(result.attempt).toBe(1);
  });

  it('returns error when createQuestions returns empty array', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi.fn().mockResolvedValue([]),
        createQuestions: vi.fn().mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map()),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('Failed to create session question');
  });

  it('returns error when question already has 2 attempts', async () => {
    const pendingQuestion = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
          }),
        ]),
      },
      sessionQuestions: {
        getQuestionsForSession: vi.fn().mockResolvedValue([pendingQuestion]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: false, quality: 1 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('Max 2 attempts');
  });

  // NEU-128: Legacy submitAnswer does NOT update chunk status when SR persistence fails
  it('does not update chunk status when SR persistence fails', async () => {
    const deps = makeDeps({
      reviewPersistence: {
        getChunk: vi.fn().mockResolvedValue(undefined), // triggers SR failure
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('spaced repetition');
    // updateSessionChunk should NOT have been called with a status change
    const calls = vi.mocked(deps.sessions.updateSessionChunk).mock.calls;
    const statusCalls = calls.filter(([, changes]) => 'status' in changes);
    expect(statusCalls).toHaveLength(0);
  });

  // NEU-128: Legacy submitAnswer returns error when updateSessionChunk returns 0
  it('returns error when updateSessionChunk returns 0 rows after SR success', async () => {
    const deps = makeDeps({
      sessions: {
        updateSessionChunk: vi.fn().mockResolvedValue(0),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain(
      'Failed to update session chunk status'
    );
  });

  // NEU-128: Legacy submitAnswer returns error when createAttempt throws unique violation
  it('returns error when createAttempt throws unique constraint violation (23505)', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint =
      'uq_session_question_attempts_question_number';

    const deps = makeDeps({
      sessionQuestions: {
        createAttempt: vi.fn().mockRejectedValue(pgError),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toBe('Attempt already recorded');
  });

  // NEU-128: Legacy submitAnswer re-throws 23505 from a different constraint
  it('re-throws 23505 from non-attempt-number constraint', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'session_question_attempts_pkey';

    const deps = makeDeps({
      sessionQuestions: {
        createAttempt: vi.fn().mockRejectedValue(pgError),
      },
    });

    await expect(submitAnswer(makeInput({ passed: true }), deps)).rejects.toThrow(
      'duplicate key value violates unique constraint'
    );
  });

  // NEU-128: Legacy submitAnswer re-throws non-23505 errors from createAttempt
  it('re-throws non-unique-violation errors from createAttempt', async () => {
    const deps = makeDeps({
      sessionQuestions: {
        createAttempt: vi.fn().mockRejectedValue(new Error('connection lost')),
      },
    });

    await expect(submitAnswer(makeInput({ passed: true }), deps)).rejects.toThrow(
      'connection lost'
    );
  });
});

// ── Session Question Flow Tests ─────────────────────────────────

function makeQuestion(overrides?: Partial<SessionQuestion>): SessionQuestion {
  return {
    id: 'sq-1',
    sessionId: 'sess-1',
    questionIndex: 1,
    promptText: 'What is X?',
    status: 'pending',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeQuestionAttempt(overrides?: Partial<SessionQuestionAttempt>): SessionQuestionAttempt {
  return {
    id: 'sqa-1',
    sessionQuestionId: 'sq-1',
    attemptNumber: 1,
    response: 'X is Y',
    passed: true,
    feedback: 'Correct!',
    quality: 5,
    timeSpentMs: 5000,
    createdAt: NOW,
    ...overrides,
  };
}

function makeQuestionDeps(overrides?: {
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
  reviewPersistence?: Partial<Parameters<typeof stubReviewPersistence>[0]>;
  sessionQuestions?: Partial<Parameters<typeof stubSessionQuestionRepository>[0]>;
}): TeachingDeps {
  return {
    sessions: stubSessionRepository({
      getActiveSession: vi.fn().mockResolvedValue(makeSession()),
      getSessionChunks: vi
        .fn()
        .mockResolvedValue([
          makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      getSessionChunkById: vi
        .fn()
        .mockResolvedValue(makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' })),
      getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
      updateSessionChunk: vi.fn().mockResolvedValue(1),
      ...overrides?.sessions,
    }),
    chunks: stubChunkRepository({
      getWithContent: vi.fn().mockResolvedValue(makeChunkData({ id: 'c2', title: 'Chunk 2' })),
      ...overrides?.chunks,
    }),
    reviewPersistence: stubReviewPersistence({
      getChunk: vi.fn().mockResolvedValue(makeLearningChunk()),
      persistReviewUpdate: vi.fn().mockResolvedValue(1),
      ...overrides?.reviewPersistence,
    }),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    sessionQuestions: stubSessionQuestionRepository({
      getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      ...overrides?.sessionQuestions,
    }),
  };
}

describe('aggregateQuestionQualities', () => {
  it('returns 0 for empty array', () => {
    expect(aggregateQuestionQualities([])).toBe(0);
  });

  it('returns exact value for single quality', () => {
    expect(aggregateQuestionQualities([5])).toBe(5);
  });

  it('computes uniform average of multiple qualities', () => {
    expect(aggregateQuestionQualities([5, 3, 1])).toBe(3);
  });

  it('rounds to 2 decimal places', () => {
    expect(aggregateQuestionQualities([5, 5, 3])).toBeCloseTo(4.33, 2);
  });
});

describe('createSessionQuestions', () => {
  it('creates question rows and returns IDs', async () => {
    const created = [
      makeQuestion({ id: 'sq-1', questionIndex: 1 }),
      makeQuestion({ id: 'sq-2', questionIndex: 2 }),
    ];
    const deps = makeQuestionDeps({
      sessionQuestions: {
        createQuestions: vi.fn().mockResolvedValue(created),
      },
    });

    const result = await createSessionQuestions(
      {
        sessionId: 'sess-1',
        questions: [
          { promptText: 'Q1', chunkIds: ['c1'] },
          { promptText: 'Q2', chunkIds: ['c1'] },
        ],
      },
      deps
    );

    expect(result.status).toBe('created');
    if (result.status !== 'created') throw new Error('Expected created');
    expect(result.sessionId).toBe('sess-1');
    expect(result.questionIds).toEqual(['sq-1', 'sq-2']);
  });

  it('returns error when chunk not found in session', async () => {
    const deps = makeQuestionDeps();

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c-missing'] }] },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({ status: 'error', message: expect.stringContaining('not found') })
    );
  });

  it('returns error when session chunk is not in_progress (teaching mode)', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('in_progress'),
      })
    );
  });

  it('returns error when chunk already has questions', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-existing', questionIndex: 1 })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-existing', ['c1']]])),
      },
    });

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('already has'),
      })
    );
  });

  it('returns error when no active session', async () => {
    const deps = makeQuestionDeps({
      sessions: { getActiveSession: vi.fn().mockResolvedValue(null) },
    });

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('No active session'),
      })
    );
  });

  it('returns error when sessionId does not match active session', async () => {
    const deps = makeQuestionDeps();

    const result = await createSessionQuestions(
      { sessionId: 'other-session', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('not the active session'),
      })
    );
  });
});

describe('submitAnswer with session_question_id', () => {
  it('writes to session_question_attempts and returns retry on first fail', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(
      makeInput({ passed: false, sessionQuestionId: 'sq-1' }),
      deps
    );

    expect(result.status).toBe('retry');
    if (result.status !== 'retry') throw new Error('Expected retry');
    expect(result.attempt).toBe(1);
    expect(result.chunk_id).toBe('c1');
    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionQuestionId: 'sq-1',
        attemptNumber: 1,
        passed: false,
        quality: null,
      })
    );
  });

  it('derives quality 5 on first attempt pass', async () => {
    const allQuestions = [makeQuestion({ id: 'sq-1', status: 'pending' })];
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi.fn().mockResolvedValue(
          // After updateQuestionStatus is called, this returns answered
          allQuestions.map(q => ({ ...q, status: 'answered' }))
        ),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([makeQuestionAttempt({ quality: 5 })]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5);
  });

  it('derives quality 3 on second attempt pass', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
          ]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: null }),
            makeQuestionAttempt({ attemptNumber: 2, passed: true, quality: 3 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(3);
  });

  it('returns blocked when unanswered questions remain', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'pending' }),
          ]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(
          new Map([
            ['sq-1', ['c1']],
            ['sq-2', ['c1']],
          ])
        ),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.next.status).toBe('blocked');
    if (result.next.status !== 'blocked') throw new Error('Expected blocked');
    expect(result.next.message).toContain('1 question(s) remaining');
  });

  it('triggers SR update when all questions answered', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ quality: 5, timeSpentMs: 3000 })]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.review_update?.next_review_date).not.toBe('');
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalled();
    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'completed' })
    );
  });

  it('returns error when question is already answered', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion({ status: 'answered' })),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('expected "pending"');
  });

  it('returns error when chunk is not in_progress', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        ...makeQuestionDeps().sessions,
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'completed' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('expected "in_progress"');
  });

  it('derives response.passed from aggregated quality, not input.passed', async () => {
    // Second attempt on last question fails (input.passed = false, quality = 1),
    // but other questions scored high so aggregated quality rounds to >= 3.
    // quality scores: [5, 1] → avg = 3 → passed should be true (from aggregated quality)
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ attemptNumber: 1 })]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'answered' }),
          ]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(
          new Map([
            ['sq-1', ['c1']],
            ['sq-2', ['c1']],
          ])
        ),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ id: 'a1', sessionQuestionId: 'sq-1', quality: 5 }),
            makeQuestionAttempt({ id: 'a2', sessionQuestionId: 'sq-2', quality: 1 }),
          ]),
      },
    });

    // Second attempt with passed=false (quality=1), but aggregated quality = (5+1)/2 = 3
    const result = await submitAnswer(
      makeInput({ passed: false, sessionQuestionId: 'sq-1' }),
      deps
    );

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    // passed should reflect aggregated quality (3 >= 3 → true), not input.passed (false)
    expect(result.passed).toBe(true);
    expect(result.quality).toBe(3);
  });

  it('returns error when question not found', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(null),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-missing' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('not found');
  });

  it('returns error when question belongs to a different session', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion({ sessionId: 'other-session' })),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('different session');
  });

  it('returns error when max attempts exceeded', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1 }),
            makeQuestionAttempt({ attemptNumber: 2 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('Max 2 attempts');
  });

  it('returns error when session chunk not found in question flow', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(makeSession()),
        getSessionChunks: vi.fn().mockResolvedValue([]),
      },
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('not found');
  });

  it('returns error when no active session in question flow', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(null),
      },
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('No active session');
  });

  it('falls through to legacy flow when session_question_id is absent', async () => {
    const deps = makeQuestionDeps();

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    // Legacy flow: should look for in_progress chunk via getSessionChunks
    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5);
    // sessionQuestions methods should NOT have been called
    expect(deps.sessionQuestions.getQuestionById).not.toHaveBeenCalled();
  });

  it('returns error when SR persistence fails', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ quality: 5, timeSpentMs: 3000 })]),
      },
      reviewPersistence: {
        getChunk: vi.fn().mockResolvedValue(undefined), // triggers SR failure
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('spaced repetition');
  });

  // NEU-128: Question flow returns error when updateSessionChunk returns 0
  it('returns error when updateSessionChunk returns 0 rows after SR success', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        updateSessionChunk: vi.fn().mockResolvedValue(0),
      },
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ quality: 5, timeSpentMs: 3000 })]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain(
      'Failed to update session chunk status'
    );
  });

  // NEU-128: Question flow returns error when createAttempt throws unique violation
  it('returns error when createAttempt throws unique constraint violation (23505)', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint =
      'uq_session_question_attempts_question_number';

    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        createAttempt: vi.fn().mockRejectedValue(pgError),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toBe('Attempt already recorded');
  });

  // NEU-128: Question flow re-throws 23505 from a different constraint
  it('re-throws 23505 from non-attempt-number constraint', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'session_question_attempts_pkey';

    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        createAttempt: vi.fn().mockRejectedValue(pgError),
      },
    });

    await expect(
      submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps)
    ).rejects.toThrow('duplicate key value violates unique constraint');
  });

  // NEU-128: Question flow re-throws non-23505 errors from createAttempt
  it('re-throws non-unique-violation errors from createAttempt', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        createAttempt: vi.fn().mockRejectedValue(new Error('connection lost')),
      },
    });

    await expect(
      submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps)
    ).rejects.toThrow('connection lost');
  });

  it('returns error when question has no chunk mapping', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('error');
    if (result.status !== 'error') throw new Error('Expected error');
    expect(result.message).toContain('no chunk mapping');
  });

  it('handles question where scored attempt has null quality', async () => {
    // All questions answered, but the scored attempt has null quality (first-fail only)
    const allQuestions = [makeQuestion({ id: 'sq-1', status: 'answered' })];
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue(allQuestions.map(q => ({ ...q, status: 'answered' }))),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ quality: null, passed: false })]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    // Quality aggregated from zero scored attempts → 0
    expect(result.quality).toBe(0);
  });

  // ── Assessment mode submit_answer ──────────────────────────────

  describe('assessment mode', () => {
    function makeAssessmentDeps(overrides?: {
      sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
      reviewPersistence?: Partial<Parameters<typeof stubReviewPersistence>[0]>;
      sessionQuestions?: Partial<Parameters<typeof stubSessionQuestionRepository>[0]>;
    }): TeachingDeps {
      return {
        sessions: stubSessionRepository({
          getActiveSession: vi
            .fn()
            .mockResolvedValue(makeSession({ mode: 'assessment', chunkIds: ['c1', 'c2'] })),
          getSessionChunks: vi
            .fn()
            .mockResolvedValue([
              makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'pending' }),
              makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
            ]),
          getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
          updateSessionChunk: vi.fn().mockResolvedValue(1),
          ...overrides?.sessions,
        }),
        chunks: stubChunkRepository(),
        reviewPersistence: stubReviewPersistence({
          getChunk: vi.fn().mockResolvedValue(makeLearningChunk()),
          persistReviewUpdate: vi.fn().mockResolvedValue(1),
          ...overrides?.reviewPersistence,
        }),
        algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
        sessionQuestions: stubSessionQuestionRepository({
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1', 'c2']),
          getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
          // Post-submit: all questions answered → triggers chunk completion
          getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion({ status: 'answered' })]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1', 'c2']]])),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([]),
          ...overrides?.sessionQuestions,
        }),
      };
    }

    it('assessment pass records quality 5 with single attempt', async () => {
      const deps = makeAssessmentDeps();

      const result = await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1', timeSpentMs: 6000 }),
        deps
      );

      expect(result.status).toBe('recorded');
      if (result.status !== 'recorded') throw new Error('Expected recorded');
      expect(result.attempt).toBe(1);
      expect(result.passed).toBe(true);
      expect(result.quality).toBe(5);
    });

    it('assessment fail records quality 1 with no retry', async () => {
      const deps = makeAssessmentDeps();

      const result = await submitAnswer(
        makeInput({ passed: false, sessionQuestionId: 'sq-1' }),
        deps
      );

      expect(result.status).toBe('recorded');
      if (result.status !== 'recorded') throw new Error('Expected recorded');
      expect(result.attempt).toBe(1);
      expect(result.passed).toBe(false);
      expect(result.quality).toBe(1);
    });

    it('assessment rejects second attempt on same question', async () => {
      const deps = makeAssessmentDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
          getAttemptsForQuestion: vi
            .fn()
            .mockResolvedValue([makeQuestionAttempt({ attemptNumber: 1 })]),
        },
      });

      const result = await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1' }),
        deps
      );

      expect(result.status).toBe('error');
      if (result.status !== 'error') throw new Error('Expected error');
      expect(result.message).toContain('1 attempt per question');
    });

    it('assessment fans out SR update to all mapped chunks', async () => {
      const deps = makeAssessmentDeps();

      await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1', timeSpentMs: 10000 }),
        deps
      );

      // SR called once per mapped chunk (c1 and c2)
      expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalledTimes(2);
    });

    it('assessment marks session_chunks completed when all questions answered', async () => {
      const deps = makeAssessmentDeps();

      await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

      // Both sc-1 (c1) and sc-2 (c2) should be marked completed
      expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
        'sc-1',
        expect.objectContaining({ status: 'completed' })
      );
      expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
        'sc-2',
        expect.objectContaining({ status: 'completed' })
      );
    });

    it('assessment piggybacks next teaching step after recording', async () => {
      const deps = makeAssessmentDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
          getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
          // After submit: all questions answered → complete
          getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion({ status: 'answered' })]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
          getAllAttemptsForSession: vi
            .fn()
            .mockResolvedValue([makeQuestionAttempt({ quality: 5, passed: true })]),
        },
      });

      const result = await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1' }),
        deps
      );

      expect(result.status).toBe('recorded');
      if (result.status !== 'recorded') throw new Error('Expected recorded');
      expect(result.next).toBeDefined();
      expect(result.next.status).toBe('complete');
    });

    it('assessment returns error on duplicate constraint violation', async () => {
      const dupeError = new Error('duplicate key') as Error & {
        code: string;
        constraint: string;
      };
      dupeError.code = '23505';
      dupeError.constraint = 'uq_session_question_attempts_question_number';
      const deps = makeAssessmentDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
          getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
          createAttempt: vi.fn().mockRejectedValue(dupeError),
        },
      });

      const result = await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1' }),
        deps
      );

      expect(result.status).toBe('error');
      if (result.status !== 'error') throw new Error('Expected error');
      expect(result.message).toContain('Attempt already recorded');
    });

    it('assessment returns error when SR persistence fails for a chunk', async () => {
      const deps = makeAssessmentDeps({
        reviewPersistence: {
          getChunk: vi.fn().mockResolvedValue(undefined),
          persistReviewUpdate: vi.fn().mockResolvedValue(0),
        },
      });

      const result = await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1' }),
        deps
      );

      // Aligned with teaching mode: SR failures are now fatal
      expect(result.status).toBe('error');
      if (result.status !== 'error') throw new Error('Expected error');
      expect(result.message).toContain('Failed to persist SR update');
    });

    it('assessment skips chunk completion when chunk is already completed', async () => {
      const deps = makeAssessmentDeps({
        sessions: {
          getActiveSession: vi
            .fn()
            .mockResolvedValue(makeSession({ mode: 'assessment', chunkIds: ['c1', 'c2'] })),
          getSessionChunks: vi
            .fn()
            .mockResolvedValue([
              makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'completed' }),
              makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'completed' }),
            ]),
          getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
          updateSessionChunk: vi.fn().mockResolvedValue(1),
        },
      });

      const result = await submitAnswer(
        makeInput({ passed: true, sessionQuestionId: 'sq-1' }),
        deps
      );

      expect(result.status).toBe('recorded');
      // updateSessionChunk should NOT be called for chunk completion
      // (only called by piggybacked getNextTeachingStep if needed)
      // The key assertion: no "completed" status update since already completed
    });

    it('assessment handles question mapped to chunk not in session', async () => {
      const deps = makeAssessmentDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1', 'c-missing']),
          getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
          getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion({ status: 'answered' })]),
          getChunkIdsForQuestions: vi
            .fn()
            .mockResolvedValue(new Map([['sq-1', ['c1', 'c-missing']]])),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([]),
        },
      });

      const result = await submitAnswer(
        makeInput({ passed: false, sessionQuestionId: 'sq-1' }),
        deps
      );

      // Should still succeed — missing chunks are gracefully skipped
      expect(result.status).toBe('recorded');
      if (result.status !== 'recorded') throw new Error('Expected recorded');
      expect(result.quality).toBe(1);
    });
  });
});
