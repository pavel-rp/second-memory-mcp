import { describe, it, expect, vi } from 'vitest';
import { submitAnswer, type TeachingDeps } from '../../../src/orchestration/teaching-workflows.js';
import type {
  LearningSession,
  SessionChunk,
  LearningChunk,
} from '../../../src/domain/types/entities.js';
import type { ChunkAttempt } from '../../../src/domain/types/session.js';
import type { SubmitAnswerInput } from '../../../src/domain/types/teaching.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import {
  stubSessionRepository,
  stubChunkRepository,
  stubReviewPersistence,
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
            attemptsJson: [makeAttempt({ passed: false, quality: 0 })],
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
            attemptsJson: [makeAttempt({ passed: false, quality: 0 })],
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
            attemptsJson: [makeAttempt({ passed: false, quality: 0 })],
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
            attemptsJson: [makeAttempt({ passed: false, quality: 0 })],
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

  // VC-07: Third attempt rejected
  it('rejects third attempt with error', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi.fn().mockResolvedValue([
          makeSessionChunk({
            id: 'sc-1',
            chunkId: 'c1',
            status: 'in_progress',
            attemptsJson: [
              makeAttempt({ passed: false, quality: 0 }),
              makeAttempt({ passed: false, quality: 1 }),
            ],
          }),
        ]),
      },
    });

    const result = await submitAnswer(makeInput(), deps);

    expect(result.status).toBe('error');
    expect((result as { message: string }).message).toContain('Max 2 attempts');
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
            attemptsJson: [makeAttempt({ passed: false, quality: 0, time_spent_ms: 3000 })],
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
    const firstAttempt = makeAttempt({ passed: false, quality: 0, time_spent_ms: 2000 });
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
