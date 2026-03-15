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
import type { ChunkAttempt } from '../../../src/domain/types/session.js';
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
            attemptsJson: null,
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
            attemptsJson: null,
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

  // VC-02: Second attempt pass → quality 3
  it('returns recorded with quality 3 on second attempt pass', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined })],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
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
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined })],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
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
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined })],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
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
            attemptsJson: null,
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
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined })],
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

  // VC-07: Re-queued chunk starts a new presentation (per-presentation attempt counting)
  it('allows new attempts on re-queued chunk (new presentation)', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [
              makeAttempt({ passed: false, quality: undefined }),
              makeAttempt({ passed: false, quality: 1 }),
            ],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.attempt).toBe(1); // attempt 1 of new presentation
    expect(result.quality).toBe(5); // first-attempt pass
  });

  // VC-08: Attempt persisted in attemptsJson
  it('persists attempt data in attemptsJson', async () => {
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

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        attemptsJson: [
          expect.objectContaining({
            question: 'What is closure?',
            response: 'A function that captures scope',
            passed: true,
            feedback: 'Correct explanation',
            quality: 5,
            time_spent_ms: 8000,
          }),
        ],
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
            attemptsJson: null,
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
            attemptsJson: null,
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
    expect(typeof result.review_update.next_review_date).toBe('string');
    expect(typeof result.review_update.interval_days).toBe('number');
    expect(typeof result.review_update.ease_factor).toBe('number');
    expect(typeof result.review_update.is_leech).toBe('boolean');
  });

  // VC-08: timeSpentMs accumulated across attempts
  it('accumulates timeSpentMs across attempts', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined, time_spent_ms: 3000 })],
            timeSpentMs: 3000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: true, timeSpentMs: 4000 }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        timeSpentMs: 7000, // 3000 + 4000
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
            attemptsJson: null,
          }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    // updateSessionChunk called without status change (retry keeps in_progress)
    const call = (deps.sessions.updateSessionChunk as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe('sc-1');
    expect(call[1]).not.toHaveProperty('status');
    expect(call[1]).toHaveProperty('attemptsJson');
    expect(call[1]).toHaveProperty('timeSpentMs');
  });

  // VC-08: Attempt appended to existing attemptsJson on second attempt
  it('appends second attempt to existing attemptsJson', async () => {
    const firstAttempt = makeAttempt({ passed: false, quality: undefined, time_spent_ms: 2000 });
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [firstAttempt],
            timeSpentMs: 2000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(
      makeInput({ question: 'Q2', response: 'A2', passed: true, timeSpentMs: 3000 }),
      deps
    );

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        attemptsJson: [
          firstAttempt,
          expect.objectContaining({
            question: 'Q2',
            response: 'A2',
            passed: true,
            quality: 3,
            time_spent_ms: 3000,
          }),
        ],
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
            attemptsJson: null,
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

  // SR failure still persists the chunk update (attempt + qualityScoresJson)
  it('persists chunk update even when SR fails', async () => {
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
      reviewPersistence: {
        getChunk: vi.fn().mockResolvedValue(undefined),
      },
    });

    await submitAnswer(makeInput({ passed: true }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        status: 'completed',
        qualityScoresJson: [5],
      })
    );
  });

  // qualityScoresJson is persisted with derived quality
  it('persists qualityScoresJson on completion', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: null,
            qualityScoresJson: null,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: true }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        qualityScoresJson: [5],
      })
    );
  });

  // qualityScoresJson appends to existing scores
  it('appends to existing qualityScoresJson', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined })],
            qualityScoresJson: [2],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: true }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({
        qualityScoresJson: [2, 3],
      })
    );
  });

  // Grind loop: 3rd presentation (6 total attempts) still re-queues
  it('re-queues chunk on 3rd presentation (6 total attempts)', async () => {
    // 5 prior attempts → attemptNumber=2 of 3rd presentation
    // After submission: 6 total → presentationCount=3 ≤ MAX_RETRIES=3 → re-queue
    const priorAttempts = Array.from({ length: 5 }, (_, i) =>
      makeAttempt({ passed: false, quality: i % 2 === 0 ? undefined : 1 })
    );
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: priorAttempts, // 5 existing → this is attempt 2 of 3rd presentation
            timeSpentMs: 15000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    // 6 total attempts → presentationCount = 3 ≤ MAX_RETRIES → re-queue
    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'pending' })
    );
  });

  // Grind loop: 4th presentation (8 total attempts) force-completes
  it('force-completes chunk after exhausting retries (8 total attempts)', async () => {
    // 7 existing attempts = attempt 1 of 4th presentation already failed; this is attempt 2
    const priorAttempts = Array.from({ length: 7 }, (_, i) =>
      makeAttempt({ passed: false, quality: i % 2 === 0 ? undefined : 1 })
    );
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: priorAttempts,
            timeSpentMs: 35000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: false }), deps);

    // 8 total attempts → presentationCount = 4 > MAX_RETRIES = 3 → force-complete
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
    const priorAttempts = Array.from({ length: 7 }, (_, i) =>
      makeAttempt({ passed: false, quality: i % 2 === 0 ? undefined : 1 })
    );
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: priorAttempts,
            timeSpentMs: 35000,
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    expect(deps.reviewPersistence.getChunk).toHaveBeenCalledWith('c1');
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalled();
  });

  // Grind loop: 1st presentation double fail still re-queues (regression guard)
  it('re-queues on 1st presentation double fail (existing behavior)', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [makeAttempt({ passed: false, quality: undefined })],
          }),
          makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
        ]),
      },
    });

    await submitAnswer(makeInput({ passed: false }), deps);

    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'pending' })
    );
  });

  // Empty attemptsJson array treated as no attempts (same as null)
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

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5); // first attempt, passed
    expect(result.attempt).toBe(1);
  });
});

// ── Session Question Flow Tests ─────────────────────────────────

function makeQuestion(overrides?: Partial<SessionQuestion>): SessionQuestion {
  return {
    id: 'sq-1',
    sessionChunkId: 'sc-1',
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
      { sessionChunkId: 'sc-1', questions: [{ promptText: 'Q1' }, { promptText: 'Q2' }] },
      deps
    );

    expect(result.sessionChunkId).toBe('sc-1');
    expect(result.questionIds).toEqual(['sq-1', 'sq-2']);
  });

  it('throws when session chunk not found', async () => {
    const deps = makeQuestionDeps({
      sessions: { getSessionChunkById: vi.fn().mockResolvedValue(null) },
    });

    await expect(
      createSessionQuestions(
        { sessionChunkId: 'sc-missing', questions: [{ promptText: 'Q1' }] },
        deps
      )
    ).rejects.toThrow('not found');
  });

  it('throws when session chunk is not in_progress', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getSessionChunkById: vi
          .fn()
          .mockResolvedValue(makeSessionChunk({ id: 'sc-1', status: 'pending' })),
      },
    });

    await expect(
      createSessionQuestions({ sessionChunkId: 'sc-1', questions: [{ promptText: 'Q1' }] }, deps)
    ).rejects.toThrow('in_progress');
  });

  it('throws when sessionQuestions port is not configured', async () => {
    const deps = makeQuestionDeps();
    deps.sessionQuestions = undefined;

    await expect(
      createSessionQuestions({ sessionChunkId: 'sc-1', questions: [{ promptText: 'Q1' }] }, deps)
    ).rejects.toThrow('not configured');
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
    expect(deps.sessionQuestions!.createAttempt).toHaveBeenCalledWith(
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
        getQuestionsForChunk: vi.fn().mockResolvedValue(
          // After updateQuestionStatus is called, this returns answered
          allQuestions.map(q => ({ ...q, status: 'answered' }))
        ),
        getAllAttemptsForChunk: vi.fn().mockResolvedValue([makeQuestionAttempt({ quality: 5 })]),
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
        getQuestionsForChunk: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getAllAttemptsForChunk: vi
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
        getQuestionsForChunk: vi
          .fn()
          .mockResolvedValue([
            makeQuestion({ id: 'sq-1', status: 'answered' }),
            makeQuestion({ id: 'sq-2', status: 'pending' }),
          ]),
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
        getQuestionsForChunk: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getAllAttemptsForChunk: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ quality: 5, timeSpentMs: 3000 })]),
      },
    });

    const result = await submitAnswer(makeInput({ passed: true, sessionQuestionId: 'sq-1' }), deps);

    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.review_update.next_review_date).not.toBe('');
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalled();
    expect(deps.sessions.updateSessionChunk).toHaveBeenCalledWith(
      'sc-1',
      expect.objectContaining({ status: 'completed' })
    );
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

  it('falls through to legacy flow when session_question_id is absent', async () => {
    const deps = makeQuestionDeps();

    const result = await submitAnswer(makeInput({ passed: true }), deps);

    // Legacy flow: should look for in_progress chunk via getSessionChunks
    expect(result.status).toBe('recorded');
    if (result.status !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5);
    // sessionQuestions methods should NOT have been called
    expect(deps.sessionQuestions!.getQuestionById).not.toHaveBeenCalled();
  });

  it('returns error when SR persistence fails', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getQuestionsForChunk: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getAllAttemptsForChunk: vi
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
});
