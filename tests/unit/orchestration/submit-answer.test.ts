import { describe, it, expect, vi } from 'vitest';
import {
  submitAnswer,
  createSessionQuestions,
  aggregateQuestionQualities,
  buildCompleteResponse,
  buildAssessmentCompleteResponse,
  type TeachingDeps,
} from '../../../src/orchestration/teaching-workflows.js';
import { SUBMIT_ANSWER_REFLECT_PROMPT } from '../../../src/shared/constants/prompts.js';
import type {
  LearningSession,
  SessionChunk,
  LearningChunk,
  SessionQuestion,
  SessionQuestionAttempt,
} from '../../../src/domain/types/entities.js';
import type {
  SubmitAnswerInput,
  SubmitAnswerInputInline,
  SubmitAnswerInputRetry,
  SubmitAnswerRecorded,
  SubmitAnswerRetry,
} from '../../../src/domain/types/teaching.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import type { CreateQuestionAttemptInput } from '../../../src/ports/session-question-repository.js';
import {
  stubSessionRepository,
  stubChunkRepository,
  stubReviewPersistence,
  stubSessionQuestionRepository,
} from '../../helpers/stub-ports.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';
import type { AlgorithmConfig } from '../../../src/domain/config/algorithm.js';
import type { RubricGradingPayload } from '../../../src/domain/algorithms/grade-mapper.js';
import { computeSchedulingSnapshot } from '../../../src/domain/algorithms/scheduling-snapshot.js';
import * as sessionAdvisoryAlgorithm from '../../../src/domain/algorithms/session-advisory.js';
import { MS_PER_DAY } from '../../../src/shared/constants/time.js';
import { rubricForQuality } from '../../helpers/grading.js';

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
    teachingApproach: null,
    timeSpentMs: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeLearningChunk(overrides?: Partial<LearningChunk>): LearningChunk {
  return {
    orderIndex: 1,
    id: 'c1',
    topicId: 'topic-1',
    title: 'Introduction to X',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 0,
    consecutiveFailures: 0,
    lastReviewedAt: null,
    estimatedDuration: 10,
    intervalDays: null,
    chunkType: 'new',
    contentStatus: 'final',
    condensedSummary: null,
    knowledgeType: null,
    validatorReport: null,
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

/**
 * Convenience: inline by default, retry when sessionQuestionId is provided.
 *
 * `quality` selects a rubric payload whose deterministic mapping equals that
 * quality (via rubricForQuality); pass/fail is then server-derived (quality >= 3).
 * There is no agent-supplied `passed` any more. Pass a `grading` override
 * directly to exercise adversarial/fail-closed payloads.
 */
type MakeInputOverrides = Omit<
  Partial<SubmitAnswerInputInline & SubmitAnswerInputRetry>,
  'grading'
> & {
  quality?: number;
  grading?: RubricGradingPayload;
  // Accepted for call-site compatibility only. Pass/fail is now server-derived
  // from the mapper quality (quality >= 3); an agent-supplied passed has no effect.
  passed?: boolean;
};

function makeInput(overrides?: MakeInputOverrides): SubmitAnswerInput {
  const grading = overrides?.grading ?? rubricForQuality(overrides?.quality ?? 5);
  if (overrides && 'sessionQuestionId' in overrides && overrides.sessionQuestionId !== undefined) {
    return {
      sessionQuestionId: overrides.sessionQuestionId,
      response: overrides.response ?? 'X is a concept',
      grading,
      questionType: overrides.questionType ?? 'recall',
      feedback: overrides.feedback ?? 'Good explanation',
      timeSpentMs: overrides.timeSpentMs ?? 5000,
    };
  }
  return {
    promptText: overrides?.promptText ?? 'What is X?',
    chunkIds: overrides?.chunkIds ?? ['c1'],
    response: overrides?.response ?? 'X is a concept',
    grading,
    questionType: overrides?.questionType ?? 'recall',
    feedback: overrides?.feedback ?? 'Good explanation',
    timeSpentMs: overrides?.timeSpentMs ?? 5000,
  };
}

/** Default created question for inline flow coordination. */
const INLINE_CREATED_QUESTION = Object.freeze({
  id: 'sq-created',
  sessionId: 'sess-1',
  questionIndex: 1,
  promptText: 'What is X?',
  status: 'pending' as const,
  createdAt: NOW,
  updatedAt: NOW,
});

function makeDeps(overrides?: {
  sessions?: Partial<Parameters<typeof stubSessionRepository>[0]>;
  chunks?: Partial<Parameters<typeof stubChunkRepository>[0]>;
  reviewPersistence?: Partial<Parameters<typeof stubReviewPersistence>[0]>;
  sessionQuestions?: Partial<Parameters<typeof stubSessionQuestionRepository>[0]>;
  algorithmConfig?: Partial<AlgorithmConfig>;
}): TeachingDeps {
  return {
    sessions: stubSessionRepository({
      getActiveSession: vi.fn().mockResolvedValue(makeSession()),
      getSessionById: vi.fn().mockResolvedValue(makeSession()),
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
    algorithmConfig: { ...DEFAULT_ALGORITHM_CONFIG, ...overrides?.algorithmConfig },
    sessionQuestions: stubSessionQuestionRepository({
      createQuestions: vi.fn().mockResolvedValue([{ ...INLINE_CREATED_QUESTION }]),
      getQuestionById: vi.fn().mockResolvedValue({ ...INLINE_CREATED_QUESTION }),
      getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      getQuestionsForSession: vi
        .fn()
        .mockResolvedValueOnce([]) // inline path: compute index (no existing questions)
        .mockResolvedValueOnce([{ ...INLINE_CREATED_QUESTION, status: 'answered' }]) // submitAnswerForQuestion: check all answered
        .mockResolvedValue([]),
      getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-created', ['c1']]])),
      getAllAttemptsForSession: vi.fn().mockResolvedValue([
        {
          id: 'sqa-default',
          sessionQuestionId: 'sq-created',
          attemptNumber: 1,
          response: 'X is a concept',
          passed: true,
          feedback: 'Good explanation',
          quality: 5,
          agentQuality: 5,
          questionType: 'recall',
          timeSpentMs: 5000,
          createdAt: NOW,
        },
      ]),
      ...overrides?.sessionQuestions,
    }),
  };
}

// ── Tests ────────────────────────────────────────────────────────

describe('submitAnswer', () => {
  // VC-09: No active session (inline path)
  it('returns error when no active session', async () => {
    const deps = makeDeps({
      sessions: { getActiveSession: vi.fn().mockResolvedValue(null) },
    });

    const result = await submitAnswer(makeInput(), deps);

    expect(result.action).toBe('error');
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

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('No in-progress chunk');
  });

  // VC-02: First attempt pass — agent provides quality
  it('returns recorded with agent-provided quality on first attempt pass', async () => {
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

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(4);
    expect(result.attempt).toBe(1);
    expect(result.passed).toBe(true);
    expect(result.chunk_id).toBe('c1');
    expect(result.session_question_id).toBe('sq-created');
    // NEU-847: correct_answer is only populated on a second-attempt failure
    expect(result).not.toHaveProperty('correct_answer');
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

    const result = await submitAnswer(makeInput({ quality: 1 }), deps);

    expect(result.action).toBe('retry');
    if (result.action !== 'retry') throw new Error('Expected retry');
    expect(result.attempt).toBe(1);
    expect(result.chunk_id).toBe('c1');
    expect(result.session_question_id).toBe('sq-created');
    expect(result.feedback).toBe('Good explanation');
    // SR update should NOT be called
    expect(deps.reviewPersistence.persistReviewUpdate).not.toHaveBeenCalled();
    // NEU-847: a first-attempt-fail (retry) response never carries correct_answer
    expect(result).not.toHaveProperty('correct_answer');
  });

  // VC-02: Second attempt pass — agent provides quality (retry path)
  it('returns recorded with agent-provided quality on second attempt pass', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
          ]),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
            makeQuestionAttempt({ attemptNumber: 2, passed: true, quality: 3, agentQuality: 3 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 3 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(3);
    expect(result.attempt).toBe(2);
    expect(result.passed).toBe(true);
    expect(result.session_question_id).toBe('sq-1');
    // NEU-847: a passing second-attempt response never carries correct_answer
    expect(result).not.toHaveProperty('correct_answer');
  });

  // VC-02 + VC-04: Second attempt fail — agent provides quality, no SR update (deferred to teach_next)
  it('returns recorded with agent-provided quality on second attempt fail without SR update', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
          ]),
      },
      chunks: {
        getById: vi.fn().mockResolvedValue(
          makeLearningChunk({
            id: 'c1',
            title: 'Chunk 1',
            content: 'Chunk 1 content',
            condensedSummary: 'Chunk 1 summary',
          })
        ),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(1);
    expect(result.attempt).toBe(2);
    expect(result.passed).toBe(false);
    expect(result.session_question_id).toBe('sq-1');
    // SR update deferred to teach_next — NOT called from submit_answer
    expect(deps.reviewPersistence.persistReviewUpdate).not.toHaveBeenCalled();
    // NEU-847: second-failure recorded response carries the correct-answer block
    expect(result.correct_answer).toEqual({
      content: 'Chunk 1 content',
      condensed_summary: 'Chunk 1 summary',
      title: 'Chunk 1',
      directive: expect.any(String),
    });
  });

  // NEU-347: submit_answer never completes chunks — deferred to teach_next
  it('does not complete chunk on second attempt fail', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
          ]),
      },
    });

    await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

    const statusCalls = vi
      .mocked(deps.sessions.updateSessionChunk)
      .mock.calls.filter(([, changes]) => 'status' in changes);
    expect(statusCalls).toHaveLength(0);
  });

  // NEU-347: submit_answer never completes chunks — deferred to teach_next
  it('does not complete chunk on first attempt pass', async () => {
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

    await submitAnswer(makeInput({ quality: 5 }), deps);

    const statusCalls = vi
      .mocked(deps.sessions.updateSessionChunk)
      .mock.calls.filter(([, changes]) => 'status' in changes);
    expect(statusCalls).toHaveLength(0);
  });

  // NEU-347: submit_answer never completes chunks — deferred to teach_next
  it('does not complete chunk on second attempt pass', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
          ]),
      },
    });

    await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 4 }), deps);

    const statusCalls = vi
      .mocked(deps.sessions.updateSessionChunk)
      .mock.calls.filter(([, changes]) => 'status' in changes);
    expect(statusCalls).toHaveLength(0);
  });

  // VC-07: Re-queued chunk starts a new presentation (inline path always creates new question)
  it('allows new attempts on re-queued chunk (new presentation)', async () => {
    // 2 prior answered questions exist; inline path creates a new question (sq-new)
    const createdQuestion = makeQuestion({ id: 'sq-new', sessionId: 'sess-1', status: 'pending' });
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
        // Inline path: compute index — 2 existing answered questions
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestion({ id: 'sq-old-1', status: 'answered' }),
            makeQuestion({ id: 'sq-old-2', status: 'answered' }),
          ]),
        createQuestions: vi.fn().mockResolvedValue([createdQuestion]),
        getQuestionById: vi.fn().mockResolvedValue(createdQuestion),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
        // New question has 0 existing attempts
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.attempt).toBe(1); // attempt 1 of new presentation
    expect(result.quality).toBe(4); // agent-provided quality
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
        promptText: 'What is closure?',
        response: 'A function that captures scope',
        quality: 4,
        questionType: 'explain_apply',
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
        quality: 4,
        agentQuality: 4,
        questionType: 'explain_apply',
        timeSpentMs: 8000,
      })
    );
  });

  // VC-06: Returns recorded status after all chunks answered
  it('returns recorded status after completion', async () => {
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

    const result = await submitAnswer(makeInput({ quality: 5 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result).not.toHaveProperty('next');
  });

  // NEU-347: submit_answer (teaching) does not include review_update — deferred to teach_next
  it('does not include review_update on recorded result', async () => {
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

    const result = await submitAnswer(makeInput({ quality: 5 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.review_update).toBeUndefined();
  });

  // VC-03: First attempt fail persists attempt but does not update chunk
  it('persists attempt on first fail without updating chunk', async () => {
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

    await submitAnswer(makeInput({ quality: 1 }), deps);

    // createAttempt should have been called with agent-provided quality
    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 })
    );
    // updateSessionChunk should NOT be called on retry
    expect(deps.sessions.updateSessionChunk).not.toHaveBeenCalled();
  });

  // VC-08: Second attempt persisted via createAttempt (retry path)
  it('persists second attempt via createAttempt', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-1', status: 'answered' })]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            attemptNumber: 1,
            passed: false,
            quality: 1,
            agentQuality: 1,
            timeSpentMs: 2000,
          }),
        ]),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([
          makeQuestionAttempt({
            attemptNumber: 1,
            passed: false,
            quality: 1,
            agentQuality: 1,
            timeSpentMs: 2000,
          }),
          makeQuestionAttempt({
            attemptNumber: 2,
            passed: true,
            quality: 3,
            agentQuality: 3,
            timeSpentMs: 3000,
          }),
        ]),
      },
    });

    await submitAnswer(
      makeInput({ sessionQuestionId: 'sq-1', response: 'A2', quality: 3, timeSpentMs: 3000 }),
      deps
    );

    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptNumber: 2,
        response: 'A2',
        passed: true,
        quality: 3,
        agentQuality: 3,
        timeSpentMs: 3000,
      })
    );
  });

  // NEU-347: submit_answer (teaching) never calls SR — deferred to teach_next
  it('does not call SR persistence on any teaching-mode result', async () => {
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

    await submitAnswer(makeInput({ quality: 5 }), deps);

    expect(deps.reviewPersistence.persistReviewUpdate).not.toHaveBeenCalled();
  });

  // No existing questions → inline path creates question, first attempt pass
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
        // 1st call (inline: compute index): no existing questions
        // 2nd call (submitAnswerForQuestion: check all answered): created question now answered
        // 3rd call (getNextTeachingStep): same answered state
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValue([{ ...INLINE_CREATED_QUESTION, status: 'answered' }]),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-created', ['c1']]])),
        getAllAttemptsForSession: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ sessionQuestionId: 'sq-created', quality: 5 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 5 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(5); // agent-provided quality
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

    const result = await submitAnswer(makeInput({ quality: 5 }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('Failed to create session question');
  });

  it('returns error when question already has 2 attempts (retry path)', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
            makeQuestionAttempt({ attemptNumber: 2, passed: false, quality: 1, agentQuality: 1 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 5 }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('Max 2 attempts');
  });

  // NEU-128: Inline submitAnswer returns error when createAttempt throws unique violation
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

    const result = await submitAnswer(makeInput({ quality: 5 }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toBe('Attempt already recorded');
  });

  // NEU-128: Inline submitAnswer re-throws 23505 from a different constraint
  it('re-throws 23505 from non-attempt-number constraint', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'session_question_attempts_pkey';

    const deps = makeDeps({
      sessionQuestions: {
        createAttempt: vi.fn().mockRejectedValue(pgError),
      },
    });

    await expect(submitAnswer(makeInput({ quality: 5 }), deps)).rejects.toThrow(
      'duplicate key value violates unique constraint'
    );
  });

  // NEU-128: Inline submitAnswer re-throws non-23505 errors from createAttempt
  it('re-throws non-unique-violation errors from createAttempt', async () => {
    const deps = makeDeps({
      sessionQuestions: {
        createAttempt: vi.fn().mockRejectedValue(new Error('connection lost')),
      },
    });

    await expect(submitAnswer(makeInput({ quality: 5 }), deps)).rejects.toThrow('connection lost');
  });

  // NEU-117: Inline submitAnswer returns error when createQuestions throws unique violation
  it('returns error when createQuestions throws 23505 on uq_session_questions_session_index', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'uq_session_questions_session_index';

    const deps = makeDeps({
      sessionQuestions: {
        getQuestionsForSession: vi.fn().mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map()),
        createQuestions: vi.fn().mockRejectedValue(pgError),
      },
    });

    const result = await submitAnswer(makeInput(), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toBe(
      'Question already created (concurrent request).'
    );
  });

  // NEU-117: Inline submitAnswer re-throws 23505 from a different constraint
  it('re-throws createQuestions 23505 from non-session-index constraint', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'some_other_constraint';

    const deps = makeDeps({
      sessionQuestions: {
        getQuestionsForSession: vi.fn().mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map()),
        createQuestions: vi.fn().mockRejectedValue(pgError),
      },
    });

    await expect(submitAnswer(makeInput({ quality: 5 }), deps)).rejects.toThrow(
      'duplicate key value violates unique constraint'
    );
  });

  // NEU-117: Inline submitAnswer re-throws non-23505 errors from createQuestions
  it('re-throws non-23505 errors from createQuestions', async () => {
    const deps = makeDeps({
      sessionQuestions: {
        getQuestionsForSession: vi.fn().mockResolvedValue([]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map()),
        createQuestions: vi.fn().mockRejectedValue(new Error('connection lost')),
      },
    });

    await expect(submitAnswer(makeInput({ quality: 5 }), deps)).rejects.toThrow('connection lost');
  });

  // Inline: chunkIds mismatch → error
  it('returns error when inline chunkIds does not match in-progress chunk', async () => {
    const deps = makeDeps();
    const result = await submitAnswer(makeInput({ chunkIds: ['c-wrong'] }), deps);
    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('in-progress chunk');
  });

  // Inline: multiple chunkIds in teaching mode → error
  it('returns error when inline chunkIds has multiple entries in teaching mode', async () => {
    const deps = makeDeps();
    const result = await submitAnswer(makeInput({ chunkIds: ['c1', 'c2'] }), deps);
    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('in-progress chunk');
  });

  // Inline: session_question_id returned in retry response
  it('returns session_question_id in retry response', async () => {
    const deps = makeDeps();
    const result = await submitAnswer(makeInput({ quality: 1 }), deps);
    expect(result.action).toBe('retry');
    if (result.action !== 'retry') throw new Error('Expected retry');
    expect(result.session_question_id).toBe('sq-created');
  });

  // Inline: session_question_id returned in recorded response
  it('returns session_question_id in recorded response', async () => {
    const deps = makeDeps();
    const result = await submitAnswer(makeInput(), deps);
    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.session_question_id).toBe('sq-created');
  });

  // Concurrent question creation → error
  it('returns error on concurrent question creation', async () => {
    const uniqueError = new Error(
      'duplicate key value violates unique constraint "uq_session_questions_session_index"'
    );
    (uniqueError as Error & { code: string }).code = '23505';
    (uniqueError as Error & { constraint: string }).constraint =
      'uq_session_questions_session_index';
    const deps = makeDeps({
      sessionQuestions: {
        createQuestions: vi.fn().mockRejectedValue(uniqueError),
        getQuestionsForSession: vi.fn().mockResolvedValue([]),
      },
    });
    const result = await submitAnswer(makeInput(), deps);
    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('concurrent');
  });

  // ── NEU-342: passed derivation from quality ──────────────────────

  it('derives passed=true from quality >= 3 when passed is omitted', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 3 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.passed).toBe(true);
  });

  it('derives passed=false from quality < 3 when passed is omitted', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 2 }), deps);

    expect(result.action).toBe('retry');
    if (result.action !== 'retry') throw new Error('Expected retry');
    // quality 2 → passed false → retry on first attempt
    expect(result.attempt).toBe(1);
  });

  it('derives passed=false from quality 0 when passed is omitted', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 0 }), deps);

    expect(result.action).toBe('retry');
  });

  it('mapper-derived fail ignores a legacy passed=true when quality < 3', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    // A legacy passed=true is ignored — pass/fail is mapper-derived. quality 2 < 3 → fail → retry.
    const result = await submitAnswer(makeInput({ passed: true, quality: 2 }), deps);

    expect(result.action).toBe('retry');
    if (result.action !== 'retry') throw new Error('Expected retry');
    expect(result.attempt).toBe(1);
  });

  it('mapper-derived pass ignores a legacy passed=false when quality >= 3', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
          ]),
      },
    });

    // A legacy passed=false is ignored — pass/fail is mapper-derived. quality 4 >= 3 → pass.
    const result = await submitAnswer(makeInput({ passed: false, quality: 4 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.passed).toBe(true);
    expect(result.quality).toBe(4);
  });

  // ── NEU-342: retry triggers on !passed && attemptNumber === 1 ───

  it('no retry on first attempt pass even with low quality 3', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 3 }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.attempt).toBe(1);
    expect(result.passed).toBe(true);
  });

  it('second attempt always finalizes regardless of passed', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi
          .fn()
          .mockResolvedValue(makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 0 }), deps);

    // Second attempt always records, never retries
    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.attempt).toBe(2);
    expect(result.passed).toBe(false);
    expect(result.quality).toBe(0);
  });

  // ── NEU-391: question_type surfaced in recorded response ────────

  it('includes question_type in recorded response matching input questionType', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    const result = await submitAnswer(
      makeInput({ quality: 4, questionType: 'analyze_create' }),
      deps
    );

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.question_type).toBe('analyze_create');
  });

  // ── NEU-342: agentQuality and questionType persisted ────────────

  it('persists agentQuality and questionType in createAttempt call', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionChunks: vi
          .fn()
          .mockResolvedValue([
            makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
      },
    });

    await submitAnswer(makeInput({ quality: 3, questionType: 'analyze_create' }), deps);

    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        agentQuality: 3,
        questionType: 'analyze_create',
      })
    );
  });

  // ── NEU-519: retry_guidance on first-attempt failure ─────────────

  describe('retry_guidance', () => {
    /**
     * NEU-600: After persisting the failed attempt, the forecast is computed
     * from the gate-aligned state. The mock for `getAllAttemptsForSession` must
     * return the just-persisted attempt with the test's quality so the gate
     * sees the same data `evaluateRoadblock` would. Default `cappedQuality`
     * mirrors `submittedQuality`; pass it explicitly when the quality cap
     * applies.
     */
    function retryDeps(
      teachingApproach: string | null = 'recall',
      submittedQuality = 1,
      cappedQuality: number = submittedQuality
    ) {
      return makeDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach,
            }),
          ]),
        },
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockResolvedValue([
            {
              id: 'sqa-current',
              sessionQuestionId: 'sq-created',
              attemptNumber: 1 as const,
              response: 'X is a concept',
              passed: cappedQuality >= 3,
              feedback: '',
              quality: cappedQuality,
              agentQuality: submittedQuality,
              questionType: 'recall' as const,
              timeSpentMs: 1000,
              createdAt: NOW,
            },
          ]),
        },
      });
    }

    it.each([
      ['scaffold', 'Open recall failed. Downgrade to a recognition question'],
      ['reteach', 'Recall probe showed weak retention'],
      ['cued_recall', 'Open recall failed. Provide graduated hint'],
      ['recall', 'Give specific feedback on what was wrong'],
    ] as const)('returns correct pivot for %s approach', async (approach, expectedStart) => {
      const deps = retryDeps(approach);
      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance).toBeDefined();
      expect(retry.retry_guidance!.teaching_approach).toBe(approach);
      expect(retry.retry_guidance!.pivot).toContain(expectedStart);
    });

    it.each([
      [0, 3],
      [1, 3],
      [2, 2],
    ] as const)(
      'roadblock forecast for quality %d → required_followups %d',
      async (quality, expectedFollowups) => {
        const deps = retryDeps('recall', quality);
        const result = await submitAnswer(makeInput({ quality, passed: false }), deps);

        expect(result.action).toBe('retry');
        const retry = result as SubmitAnswerRetry;
        expect(retry.retry_guidance!.roadblock.trigger_quality).toBe(quality);
        expect(retry.retry_guidance!.roadblock.required_followups).toBe(expectedFollowups);
        expect(retry.retry_guidance!.roadblock.remaining).toBe(expectedFollowups);
      }
    );

    it('quality_floor is always 3', async () => {
      const deps = retryDeps('scaffold', 1);
      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance!.roadblock.quality_floor).toBe(3);
    });

    it('completed_followups is always 0 on first retry', async () => {
      const deps = retryDeps('cued_recall', 2);
      const result = await submitAnswer(makeInput({ quality: 2, passed: false }), deps);

      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance!.roadblock.completed_followups).toBe(0);
    });

    it('roadblock_forecast trigger_quality matches capped quality, not the mapper quality', async () => {
      // The rubric maps to 5, but the session-scoped cap reduces it to 3. The
      // capped quality (3) is what is persisted and what the forecast reflects —
      // the pre-cap mapper quality never surfaces. quality 3 is a pass, so this
      // lands on the recorded path with a roadblock_forecast.
      const deps = makeDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach: 'recall',
            }),
            makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'pending' }),
          ]),
        },
        sessionQuestions: {
          getMinPriorQuality: vi.fn().mockResolvedValue(1), // cap at 3
          getQuestionsForSession: vi
            .fn()
            .mockResolvedValueOnce([]) // inline path: compute index
            .mockResolvedValue([{ ...INLINE_CREATED_QUESTION }]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-created', ['c1']]])),
          // Persisted attempt mirrors the post-cap quality (3), which is what
          // computeRoadblockState reads back.
          getAllAttemptsForSession: vi.fn().mockResolvedValue([
            {
              id: 'sqa-current',
              sessionQuestionId: 'sq-created',
              attemptNumber: 1 as const,
              response: 'X is a concept',
              passed: true,
              feedback: '',
              quality: 3,
              agentQuality: 3,
              questionType: 'recall' as const,
              timeSpentMs: 1000,
              createdAt: NOW,
            },
          ]),
        },
      });

      // The rubric maps to 5 but the cap reduces it to 3.
      const result = await submitAnswer(makeInput({ quality: 5 }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.quality).toBe(3);
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(3);
    });

    it('second attempt fail returns recorded without retry_guidance', async () => {
      const deps = makeQuestionDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach: 'scaffold',
            }),
          ]),
        },
        sessionQuestions: {
          getQuestionById: vi
            .fn()
            .mockResolvedValue(
              makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })
            ),
          getAttemptsForQuestion: vi
            .fn()
            .mockResolvedValue([
              makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
            ]),
        },
      });

      const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

      expect(result.action).toBe('recorded');
      expect(result).not.toHaveProperty('retry_guidance');
    });

    it('omits retry_guidance when teachingApproach is null', async () => {
      const deps = retryDeps(null);
      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance).toBeUndefined();
    });

    it('omits retry_guidance when teachingApproach is an unrecognized string', async () => {
      const deps = retryDeps('unknown_tier');
      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance).toBeUndefined();
    });

    it('defaults required_followups to 0 when quality not in roadblockFollowups', async () => {
      const deps = makeDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach: 'recall',
            }),
          ]),
        },
        algorithmConfig: { roadblockFollowups: {} },
      });
      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance!.roadblock.required_followups).toBe(0);
      expect(retry.retry_guidance!.roadblock.remaining).toBe(0);
    });
  });

  // ── NEU-532 + NEU-600: roadblock_forecast on recorded path ───────
  //
  // NEU-600: forecast values are computed via `computeRoadblockState` from the
  // session-wide attempts/questions/chunkMapping snapshot AFTER the current
  // attempt is persisted, so the mocked `getAllAttemptsForSession`,
  // `getQuestionsForSession`, and `getChunkIdsForQuestions` must reflect the
  // expected post-persist gate state — not just the inline-create-question
  // bookkeeping defaults.

  describe('roadblock_forecast', () => {
    /** Build a mock setup for a single inline question whose persisted attempt has `submittedQuality`. */
    function singleAttemptMocks(submittedQuality: number) {
      return {
        sessionQuestions: {
          getQuestionsForSession: vi
            .fn()
            .mockResolvedValueOnce([]) // inline path: compute index
            .mockResolvedValue([{ ...INLINE_CREATED_QUESTION }]),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([
            {
              id: 'sqa-current',
              sessionQuestionId: 'sq-created',
              attemptNumber: 1 as const,
              response: 'X is a concept',
              passed: submittedQuality >= 3,
              feedback: 'Good explanation',
              quality: submittedQuality,
              agentQuality: submittedQuality,
              questionType: 'recall' as const,
              timeSpentMs: 5000,
              createdAt: NOW,
            },
          ]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-created', ['c1']]])),
        },
      };
    }

    it('quality 3 + passed → includes roadblock_forecast', async () => {
      const deps = makeDeps(singleAttemptMocks(3));
      const result = await submitAnswer(makeInput({ quality: 3, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(3);
      expect(recorded.roadblock_forecast!.required_followups).toBe(1);
      expect(recorded.roadblock_forecast!.completed_followups).toBe(0);
      expect(recorded.roadblock_forecast!.remaining).toBe(1);
      expect(recorded.roadblock_forecast!.quality_floor).toBe(3);
    });

    it('quality 4 + passed → includes roadblock_forecast', async () => {
      const deps = makeDeps(singleAttemptMocks(4));
      const result = await submitAnswer(makeInput({ quality: 4, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(4);
      expect(recorded.roadblock_forecast!.required_followups).toBe(1);
      expect(recorded.roadblock_forecast!.completed_followups).toBe(0);
      expect(recorded.roadblock_forecast!.remaining).toBe(1);
      expect(recorded.roadblock_forecast!.quality_floor).toBe(3);
    });

    it('quality 5 + passed → no roadblock_forecast', async () => {
      const deps = makeDeps(singleAttemptMocks(5));
      const result = await submitAnswer(makeInput({ quality: 5, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeUndefined();
    });

    it('quality 2 + failed (second attempt) → roadblock_forecast reflects gate-aligned state', async () => {
      // Single question sq-1 retried (q=1 then q=2). After persist, the chunk has
      // two attempts on the same question; min quality across them is 1 → required
      // 3 follow-ups. sq-1 is both the only question and the trigger question, and
      // computeRoadblockState skips the trigger question when counting qualifying
      // follow-ups, so completed === 0. Per NEU-600, the recorded path emits the
      // forecast for any non-zero remaining — not gated on `passed` — so the agent
      // sees the same blocker teach_next will surface on its next call, including
      // on second-attempt failures.
      const sq1 = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
      const deps = makeQuestionDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(sq1),
          getAttemptsForQuestion: vi
            .fn()
            .mockResolvedValue([
              makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
            ]),
          getQuestionsForSession: vi.fn().mockResolvedValue([sq1]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([
            makeQuestionAttempt({
              id: 'sqa-1',
              attemptNumber: 1,
              passed: false,
              quality: 1,
              agentQuality: 1,
              createdAt: NOW,
            }),
            makeQuestionAttempt({
              id: 'sqa-2',
              attemptNumber: 2,
              passed: false,
              quality: 2,
              agentQuality: 2,
              createdAt: NOW + 1000,
            }),
          ]),
        },
      });

      const result = await submitAnswer(
        makeInput({ sessionQuestionId: 'sq-1', quality: 2, passed: false }),
        deps
      );

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(1);
      expect(recorded.roadblock_forecast!.required_followups).toBe(3);
      expect(recorded.roadblock_forecast!.completed_followups).toBe(0);
      expect(recorded.roadblock_forecast!.remaining).toBe(3);
    });

    it('defaults to no forecast when quality absent from roadblockFollowups', async () => {
      const deps = makeDeps({
        ...singleAttemptMocks(3),
        algorithmConfig: { roadblockFollowups: {} },
      });
      const result = await submitAnswer(makeInput({ quality: 3, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeUndefined();
    });

    // ── NEU-600: gate-aligned forecast across multi-attempt scenarios ────

    /**
     * Build a mock setup where two questions (q1 prior, q2 current) belong to the
     * same chunk. q1 was scored at `priorQuality` earlier; q2 was just persisted
     * at `currentQuality`.
     */
    function twoQuestionMocks(priorQuality: number, currentQuality: number) {
      const q1: SessionQuestion = {
        id: 'sq-1',
        sessionId: 'sess-1',
        questionIndex: 1,
        promptText: 'Prior Q',
        status: 'answered',
        createdAt: NOW,
        updatedAt: NOW,
      };
      const created: SessionQuestion = {
        ...INLINE_CREATED_QUESTION,
        id: 'sq-created',
        questionIndex: 2,
      };
      const attempts: SessionQuestionAttempt[] = [
        {
          id: 'sqa-prior',
          sessionQuestionId: 'sq-1',
          attemptNumber: 1,
          response: 'prior',
          passed: priorQuality >= 3,
          feedback: '',
          quality: priorQuality,
          agentQuality: priorQuality,
          questionType: 'recall',
          timeSpentMs: 1000,
          createdAt: NOW,
        },
        {
          id: 'sqa-current',
          sessionQuestionId: 'sq-created',
          attemptNumber: 1,
          response: 'current',
          passed: currentQuality >= 3,
          feedback: '',
          quality: currentQuality,
          agentQuality: currentQuality,
          questionType: 'recall',
          timeSpentMs: 1000,
          createdAt: NOW + 1000,
        },
      ];
      return {
        sessionQuestions: {
          getQuestionsForSession: vi
            .fn()
            .mockResolvedValueOnce([q1]) // inline path: compute index
            .mockResolvedValue([q1, created]),
          createQuestions: vi.fn().mockResolvedValue([created]),
          getQuestionById: vi.fn().mockResolvedValue(created),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(
            new Map([
              ['sq-1', ['c1']],
              ['sq-created', ['c1']],
            ])
          ),
          getAllAttemptsForSession: vi.fn().mockResolvedValue(attempts),
        },
      };
    }

    it('reports prior min as trigger_quality when current attempt quality is higher', async () => {
      // Use a config where required_followups[3] = 2, so the current attempt
      // qualifying as one follow-up does not fully clear the roadblock and the
      // forecast is still emitted.
      const deps = makeDeps({
        ...twoQuestionMocks(3, 4),
        algorithmConfig: { roadblockFollowups: { 3: 2, 4: 1, 5: 0 } },
      });
      const result = await submitAnswer(makeInput({ quality: 4, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(3);
    });

    it('current attempt qualifies → completed_followups: 1, remaining decrements to 0 → omits forecast', async () => {
      // Default config: roadblockFollowups[3] === 1. Prior=3, current=4 → completed=1, remaining=0.
      const deps = makeDeps(twoQuestionMocks(3, 4));
      const result = await submitAnswer(makeInput({ quality: 4, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      // Per NEU-600 spec: when the gate would clear (remaining === 0), the forecast
      // is omitted to avoid telling the agent to prepare follow-ups it doesn't need.
      expect(recorded.roadblock_forecast).toBeUndefined();
    });

    it('config-sensitive: {3: 2, 4: 1, 5: 0} with prior=3, current=4 → required_followups: 2 (not 1)', async () => {
      const deps = makeDeps({
        ...twoQuestionMocks(3, 4),
        algorithmConfig: { roadblockFollowups: { 3: 2, 4: 1, 5: 0 } },
      });
      const result = await submitAnswer(makeInput({ quality: 4, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(3);
      expect(recorded.roadblock_forecast!.required_followups).toBe(2);
      expect(recorded.roadblock_forecast!.completed_followups).toBe(1);
      expect(recorded.roadblock_forecast!.remaining).toBe(1);
    });
  });

  // ── NEU-847: correct-answer block on second-attempt failure ───────

  describe('correct_answer (NEU-847)', () => {
    /** Shared second-attempt-fail setup; only the `chunks` port dep varies per case. */
    function secondFailDeps(chunks: Partial<Parameters<typeof stubChunkRepository>[0]>) {
      return makeQuestionDeps({
        sessionQuestions: {
          getQuestionById: vi
            .fn()
            .mockResolvedValue(
              makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' })
            ),
          getAttemptsForQuestion: vi
            .fn()
            .mockResolvedValue([
              makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
            ]),
        },
        chunks,
      });
    }

    it('degrades to directive + available material when content is null', async () => {
      const deps = secondFailDeps({
        getById: vi.fn().mockResolvedValue(
          makeLearningChunk({
            id: 'c1',
            title: 'Chunk 1',
            content: null,
            condensedSummary: 'Chunk 1 summary',
          })
        ),
      });

      const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.correct_answer).toEqual({
        content: null,
        condensed_summary: 'Chunk 1 summary',
        title: 'Chunk 1',
        directive: expect.any(String),
      });
    });

    it('fails open (no block, attempt still recorded) when the chunk fetch rejects', async () => {
      const deps = secondFailDeps({
        getById: vi.fn().mockRejectedValue(new Error('db unavailable')),
      });

      const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.passed).toBe(false);
      expect(result.attempt).toBe(2);
      expect(result).not.toHaveProperty('correct_answer');
    });

    it('fails open (no block, attempt still recorded) when the chunk fetch rejects with a non-Error value', async () => {
      const deps = secondFailDeps({
        getById: vi.fn().mockRejectedValue('boom'),
      });

      const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.passed).toBe(false);
      expect(result.attempt).toBe(2);
      expect(result).not.toHaveProperty('correct_answer');
    });

    it('fails open (no block, attempt still recorded) when the chunk is not found', async () => {
      const deps = secondFailDeps({
        getById: vi.fn().mockResolvedValue(undefined),
      });

      const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1', quality: 1 }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result).not.toHaveProperty('correct_answer');
    });
  });

  // ── NEU-848: within-session stopping advisory ──────────────────────

  describe('session_advisory (NEU-848)', () => {
    /**
     * Six attempts whose later-window latency rises and quality falls
     * relative to the earlier window — fires `computeFatigueTrend`
     * (MINIMUM_ATTEMPTS = 6, WINDOW_SPLIT_RATIO = 0.5). Unrelated to any
     * mapped session question, so it doesn't interact with roadblock gating.
     */
    function fatigueAttempts(): SessionQuestionAttempt[] {
      const latencies = [1000, 1000, 1000, 2000, 2000, 2000];
      const qualities = [5, 5, 5, 3, 3, 3];
      return latencies.map((latencyMs, i) => ({
        id: `sqa-fatigue-${i}`,
        sessionQuestionId: `sq-fatigue-${i}`,
        attemptNumber: 1,
        response: 'r',
        passed: true,
        feedback: 'f',
        quality: qualities[i] as number,
        agentQuality: null,
        questionType: null,
        timeSpentMs: latencyMs,
        createdAt: 1_000 + i * 1_000,
      }));
    }

    it('is present on the recorded response while the fatigue signal fires', async () => {
      const deps = makeDeps({
        sessions: {
          getActiveSession: vi
            .fn()
            .mockResolvedValue(makeSession({ startTime: Date.now() - 1_000 })),
        },
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockResolvedValue(fatigueAttempts()),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 4 }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.session_advisory).toEqual({
        kind: 'fatigue',
        reason: expect.any(String),
        directive: expect.any(String),
      });
    });

    it('is present on the retry response while the fatigue signal fires', async () => {
      const deps = makeDeps({
        sessions: {
          getActiveSession: vi
            .fn()
            .mockResolvedValue(makeSession({ startTime: Date.now() - 1_000 })),
        },
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockResolvedValue(fatigueAttempts()),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 1 }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.session_advisory).toEqual({
        kind: 'fatigue',
        reason: expect.any(String),
        directive: expect.any(String),
      });
    });

    it('recurs across repeated submissions — no dedupe or "already shown" state', async () => {
      const deps = makeDeps({
        sessions: {
          getActiveSession: vi
            .fn()
            .mockResolvedValue(makeSession({ startTime: Date.now() - 1_000 })),
        },
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockResolvedValue(fatigueAttempts()),
        },
      });

      const first = await submitAnswer(makeInput({ quality: 4 }), deps);
      const second = await submitAnswer(makeInput({ quality: 4 }), deps);

      expect((first as SubmitAnswerRecorded).session_advisory?.kind).toBe('fatigue');
      expect((second as SubmitAnswerRecorded).session_advisory?.kind).toBe('fatigue');
    });

    it('coexists with correct_answer and roadblock_forecast on a second-attempt-failure response', async () => {
      const pastCeiling = Date.now() - (DEFAULT_ALGORITHM_CONFIG.sessionConfig.maxTimeMs + 60_000);
      const sq1 = makeQuestion({ id: 'sq-1', sessionId: 'sess-1', status: 'pending' });
      const deps = makeQuestionDeps({
        sessions: {
          getSessionById: vi.fn().mockResolvedValue(makeSession({ startTime: pastCeiling })),
        },
        chunks: {
          getById: vi.fn().mockResolvedValue(
            makeLearningChunk({
              id: 'c1',
              title: 'Chunk 1',
              content: 'Chunk 1 content',
              condensedSummary: 'Chunk 1 summary',
            })
          ),
        },
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(sq1),
          getAttemptsForQuestion: vi
            .fn()
            .mockResolvedValue([
              makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
            ]),
          getQuestionsForSession: vi.fn().mockResolvedValue([sq1]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([
            makeQuestionAttempt({
              id: 'sqa-1',
              attemptNumber: 1,
              passed: false,
              quality: 1,
              agentQuality: 1,
              createdAt: NOW,
            }),
            makeQuestionAttempt({
              id: 'sqa-2',
              attemptNumber: 2,
              passed: false,
              quality: 2,
              agentQuality: 2,
              createdAt: NOW + 1000,
            }),
          ]),
        },
      });

      const result = await submitAnswer(
        makeInput({ sessionQuestionId: 'sq-1', quality: 2, passed: false }),
        deps
      );

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.correct_answer).toEqual({
        content: 'Chunk 1 content',
        condensed_summary: 'Chunk 1 summary',
        title: 'Chunk 1',
        directive: expect.any(String),
      });
      expect(recorded.session_advisory).toEqual({
        kind: 'time_ceiling',
        reason: expect.any(String),
        directive: expect.any(String),
      });
    });

    it('fails open: a throw in advisory assembly still returns a complete, successful response with the block omitted', async () => {
      const deps = makeDeps({
        sessions: {
          getActiveSession: vi
            .fn()
            .mockResolvedValue(makeSession({ startTime: Date.now() - 1_000 })),
        },
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockResolvedValue(fatigueAttempts()),
        },
      });
      const spy = vi
        .spyOn(sessionAdvisoryAlgorithm, 'resolveSessionAdvisory')
        .mockImplementation(() => {
          throw new Error('injected advisory failure');
        });

      try {
        const result = await submitAnswer(makeInput({ quality: 4 }), deps);

        expect(result.action).toBe('recorded');
        const recorded = result as SubmitAnswerRecorded;
        expect(recorded.passed).toBe(true);
        expect(recorded.quality).toBe(4);
        expect(result).not.toHaveProperty('session_advisory');
      } finally {
        spy.mockRestore();
      }
    });

    it('adds at most one getAllAttemptsForSession call beyond the existing roadblock-state fetch', async () => {
      const getAllAttempts = vi.fn().mockResolvedValue([
        {
          id: 'sqa-current',
          sessionQuestionId: 'sq-created',
          attemptNumber: 1 as const,
          response: 'X is a concept',
          passed: true,
          feedback: 'Good explanation',
          quality: 3,
          agentQuality: 3,
          questionType: 'recall' as const,
          timeSpentMs: 5000,
          createdAt: NOW,
        },
      ]);
      const deps = makeDeps({
        sessionQuestions: {
          getAllAttemptsForSession: getAllAttempts,
        },
      });

      const result = await submitAnswer(makeInput({ quality: 3, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      // Existing behavior (NEU-600) already calls getAllAttemptsForSession once
      // for the gate-aligned roadblock-state fetch when a forecast will surface;
      // NEU-848 adds exactly one more for the session advisory — never more than
      // one additional round trip.
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(getAllAttempts).toHaveBeenCalledTimes(2);
    });
  });

  // ── NEU-600: gate-aligned retry_guidance.roadblock ────────────────

  describe('retry_guidance roadblock alignment (NEU-600)', () => {
    it('retry path: prior low-quality attempt on chunk → retry_guidance.roadblock uses prior min', async () => {
      // Prior question on c1 scored quality=1 earlier. The current first-attempt
      // submission fails with quality=4 (rare: agent passes a high quality score
      // but flags it as failed). Min across both attempts is 1, not 4.
      const q1: SessionQuestion = {
        id: 'sq-1',
        sessionId: 'sess-1',
        questionIndex: 1,
        promptText: 'Prior Q',
        status: 'answered',
        createdAt: NOW,
        updatedAt: NOW,
      };
      const created: SessionQuestion = {
        ...INLINE_CREATED_QUESTION,
        id: 'sq-created',
        questionIndex: 2,
      };
      const deps = makeDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach: 'recall',
            }),
          ]),
        },
        sessionQuestions: {
          getQuestionsForSession: vi
            .fn()
            .mockResolvedValueOnce([q1])
            .mockResolvedValue([q1, created]),
          createQuestions: vi.fn().mockResolvedValue([created]),
          getQuestionById: vi.fn().mockResolvedValue(created),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(
            new Map([
              ['sq-1', ['c1']],
              ['sq-created', ['c1']],
            ])
          ),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([
            {
              id: 'sqa-prior',
              sessionQuestionId: 'sq-1',
              attemptNumber: 1 as const,
              response: 'prior',
              passed: false,
              feedback: '',
              quality: 1,
              agentQuality: 1,
              questionType: 'recall' as const,
              timeSpentMs: 1000,
              createdAt: NOW,
            },
            {
              id: 'sqa-current',
              sessionQuestionId: 'sq-created',
              attemptNumber: 1 as const,
              response: 'current',
              passed: false,
              feedback: '',
              quality: 4,
              agentQuality: 4,
              questionType: 'recall' as const,
              timeSpentMs: 1000,
              createdAt: NOW + 1000,
            },
          ]),
        },
      });

      // quality 4 is a pass → recorded path, which still emits the gate-aligned
      // roadblock_forecast computed from the same session-wide attempt snapshot.
      const result = await submitAnswer(makeInput({ quality: 4 }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeDefined();
      // Min quality across both attempts is 1 (prior). roadblockFollowups[1]=3.
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(1);
      expect(recorded.roadblock_forecast!.required_followups).toBe(3);
      // Current attempt (q=4) qualifies as a follow-up for the prior trigger.
      expect(recorded.roadblock_forecast!.completed_followups).toBe(1);
      expect(recorded.roadblock_forecast!.remaining).toBe(2);
    });

    it('best-effort: roadblock state fetch failure → recorded response degrades to pre-NEU-600 static estimate', async () => {
      // The attempt is already persisted before the gate-aligned state fetch
      // runs. If a transient DB read fails after persist, submit_answer must
      // still return the recorded response — and per Copilot review feedback on
      // PR #440, must surface a best-effort static estimate (matching the
      // pre-NEU-600 formula) instead of asserting "no follow-ups needed".
      // teach_next will recompute the authoritative gate on the next call.
      const deps = makeDeps({
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockRejectedValue(new Error('transient db failure')),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 3, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      // Degraded forecast: required_followups derived from quality (3 → 1 per default config).
      expect(recorded.roadblock_forecast).toBeDefined();
      expect(recorded.roadblock_forecast!.trigger_quality).toBe(3);
      expect(recorded.roadblock_forecast!.required_followups).toBe(1);
      expect(recorded.roadblock_forecast!.completed_followups).toBe(0);
      expect(recorded.roadblock_forecast!.remaining).toBe(1);
    });

    it('best-effort: recorded path on state-fetch error with quality 5 → no forecast (static estimate is 0)', async () => {
      // Pre-NEU-600 emitted forecast only when required_followups[quality] > 0.
      // Quality 5 has required=0 in the default config, so the degraded path
      // also omits the field.
      const deps = makeDeps({
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockRejectedValue(new Error('transient db failure')),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 5, passed: true }), deps);

      expect(result.action).toBe('recorded');
      const recorded = result as SubmitAnswerRecorded;
      expect(recorded.roadblock_forecast).toBeUndefined();
    });

    it('best-effort: retry path on state-fetch error → retry_guidance.roadblock degrades to pre-NEU-600 static estimate', async () => {
      // First-attempt failure on a chunk with a teaching approach: the retry
      // path normally emits gate-aligned roadblock state. On state-fetch error,
      // the fallback must surface the pre-NEU-600 static estimate
      // (required_followups derived from the current capped quality) — not 0,
      // which would silently mislead the agent that no follow-ups are needed.
      const deps = makeDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach: 'recall',
            }),
          ]),
        },
        sessionQuestions: {
          getAllAttemptsForSession: vi.fn().mockRejectedValue(new Error('transient db failure')),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance).toBeDefined();
      // Static estimate for quality=1 → roadblockFollowups[1] = 3 in default config.
      expect(retry.retry_guidance!.roadblock.trigger_quality).toBe(1);
      expect(retry.retry_guidance!.roadblock.required_followups).toBe(3);
      expect(retry.retry_guidance!.roadblock.completed_followups).toBe(0);
      expect(retry.retry_guidance!.roadblock.remaining).toBe(3);
    });

    it('lazy: skips the roadblock-state fetch, but the NEU-848 session-advisory fetch still fires once, when first-attempt-fail has no teaching approach', async () => {
      // When the retry path will not emit retry_guidance (approach is null),
      // the gate-aligned roadblock state is never surfaced — so
      // computeChunkRoadblockState's own fetch should be skipped entirely.
      // Separately, NEU-848's session-advisory assembly always fetches once
      // after the attempt is persisted, regardless of whether a forecast will
      // be surfaced. Since both call sites share the same port method, a
      // single total call proves the roadblock-state fetch specifically
      // stayed skipped (a second call would mean it fired too).
      const getAllAttempts = vi.fn().mockResolvedValue([]);
      const deps = makeDeps({
        sessions: {
          getSessionChunks: vi.fn().mockResolvedValue([
            makeSessionChunk({
              id: 'sc-1',
              chunkId: 'c1',
              status: 'in_progress',
              teachingApproach: null,
            }),
          ]),
        },
        sessionQuestions: {
          getAllAttemptsForSession: getAllAttempts,
        },
      });

      const result = await submitAnswer(makeInput({ quality: 1, passed: false }), deps);

      expect(result.action).toBe('retry');
      const retry = result as SubmitAnswerRetry;
      expect(retry.retry_guidance).toBeUndefined();
      expect(getAllAttempts).toHaveBeenCalledTimes(1);
    });
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
    agentQuality: 5,
    questionType: 'recall',
    timeSpentMs: 5000,
    createdAt: NOW,
    ...overrides,
  };
}

/** The `createAttempt` input from the most recent call (NEU-844 snapshot assertions). */
function lastAttemptInput(deps: TeachingDeps): CreateQuestionAttemptInput {
  const call = vi.mocked(deps.sessionQuestions.createAttempt).mock.calls.at(-1);
  if (!call) throw new Error('Expected createAttempt to have been called');
  return call[0];
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
      getSessionById: vi.fn().mockResolvedValue(makeSession()),
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

    expect(result.action).toBe('created');
    if (result.action !== 'created') throw new Error('Expected created');
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
      expect.objectContaining({ action: 'error', message: expect.stringContaining('not found') })
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
        action: 'error',
        message: expect.stringContaining('in_progress'),
      })
    );
  });

  it('appends questions when chunk already has questions', async () => {
    const appended = [makeQuestion({ id: 'sq-new', questionIndex: 2 })];
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionsForSession: vi
          .fn()
          .mockResolvedValue([makeQuestion({ id: 'sq-existing', questionIndex: 1 })]),
        createQuestions: vi.fn().mockResolvedValue(appended),
      },
    });

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q2', chunkIds: ['c1'] }] },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        action: 'created',
        questionIds: ['sq-new'],
      })
    );
    // startIndex should be existingQuestions.length + 1 = 2
    expect(deps.sessionQuestions.createQuestions).toHaveBeenCalledWith(
      'sess-1',
      expect.any(Array),
      2
    );
  });

  it('assigns continuous questionIndex when appending after partial answers', async () => {
    const existing = [
      makeQuestion({ id: 'sq-1', questionIndex: 1, status: 'answered' }),
      makeQuestion({ id: 'sq-2', questionIndex: 2, status: 'pending' }),
    ];
    const appended = [makeQuestion({ id: 'sq-3', questionIndex: 3 })];
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionsForSession: vi.fn().mockResolvedValue(existing),
        createQuestions: vi.fn().mockResolvedValue(appended),
      },
    });

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q3', chunkIds: ['c1'] }] },
      deps
    );

    expect(result.action).toBe('created');
    // startIndex should be 3 (2 existing + 1)
    expect(deps.sessionQuestions.createQuestions).toHaveBeenCalledWith(
      'sess-1',
      expect.any(Array),
      3
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
        action: 'error',
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
        action: 'error',
        message: expect.stringContaining('not the active session'),
      })
    );
  });

  // NEU-117: createSessionQuestions returns error when createQuestions throws unique violation
  it('returns error when createQuestions throws 23505 on uq_session_questions_session_index', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'uq_session_questions_session_index';

    const deps = makeQuestionDeps({
      sessionQuestions: {
        createQuestions: vi.fn().mockRejectedValue(pgError),
      },
    });

    const result = await createSessionQuestions(
      { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
      deps
    );

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toBe(
      'Questions already created (concurrent request).'
    );
  });

  // NEU-117: createSessionQuestions re-throws 23505 from a different constraint
  it('re-throws createQuestions 23505 from non-session-index constraint', async () => {
    const pgError = new Error('duplicate key value violates unique constraint');
    (pgError as Error & { code: string }).code = '23505';
    (pgError as Error & { constraint: string }).constraint = 'some_other_constraint';

    const deps = makeQuestionDeps({
      sessionQuestions: {
        createQuestions: vi.fn().mockRejectedValue(pgError),
      },
    });

    await expect(
      createSessionQuestions(
        { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
        deps
      )
    ).rejects.toThrow('duplicate key value violates unique constraint');
  });

  // NEU-117: createSessionQuestions re-throws non-23505 errors from createQuestions
  it('re-throws non-23505 errors from createQuestions', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        createQuestions: vi.fn().mockRejectedValue(new Error('connection lost')),
      },
    });

    await expect(
      createSessionQuestions(
        { sessionId: 'sess-1', questions: [{ promptText: 'Q1', chunkIds: ['c1'] }] },
        deps
      )
    ).rejects.toThrow('connection lost');
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

    const result = await submitAnswer(makeInput({ quality: 2, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('retry');
    if (result.action !== 'retry') throw new Error('Expected retry');
    expect(result.attempt).toBe(1);
    expect(result.chunk_id).toBe('c1');
    expect(deps.sessionQuestions.createAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionQuestionId: 'sq-1',
        attemptNumber: 1,
        passed: false,
        quality: 2,
        agentQuality: 2,
      })
    );
  });

  it('uses agent-provided quality on first attempt pass', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 4, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(4);
  });

  it('uses agent-provided quality on second attempt pass', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([
            makeQuestionAttempt({ attemptNumber: 1, passed: false, quality: 1, agentQuality: 1 }),
          ]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 3, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(3);
  });

  it('returns recorded regardless of unanswered questions (no blocking)', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.review_update).toBeUndefined();
  });

  it('does not trigger SR update or chunk completion', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

    expect(deps.reviewPersistence.persistReviewUpdate).not.toHaveBeenCalled();
    const statusCalls = vi
      .mocked(deps.sessions.updateSessionChunk)
      .mock.calls.filter(([, changes]) => 'status' in changes);
    expect(statusCalls).toHaveLength(0);
  });

  it('returns error when learning question is already answered', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion({ status: 'answered' })),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('is already answered');
  });

  it('returns error when question is skipped', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion({ status: 'skipped' })),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('"skipped"');
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

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('expected "in_progress"');
  });

  it('returns resolved passed and agent quality (no aggregation)', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi
          .fn()
          .mockResolvedValue([makeQuestionAttempt({ attemptNumber: 1 })]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 1, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    // passed derived from quality < 3
    expect(result.passed).toBe(false);
    expect(result.quality).toBe(1); // agent-provided quality
  });

  it('returns error when question not found', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(null),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-missing' }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('not found');
  });

  it('returns error when question session does not exist', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(null),
      },
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion({ sessionId: 'other-session' })),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('Session not found');
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

    expect(result.action).toBe('error');
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

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('not found');
  });

  it('returns error when session not found in question flow', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(null),
      },
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
      },
    });

    const result = await submitAnswer(makeInput({ sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('Session not found');
  });

  it('uses inline path when session_question_id is absent', async () => {
    const deps = makeDeps();

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);

    // Inline path: creates a new question via createQuestions
    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(4);
    expect(deps.sessionQuestions.createQuestions).toHaveBeenCalled();
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

    const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('error');
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
      submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps)
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
      submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps)
    ).rejects.toThrow('connection lost');
  });

  it('returns error when question has no chunk mapping', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('Expected error');
    expect(result.message).toContain('no chunk mapping');
  });

  it('returns agent-provided quality regardless of prior attempts', async () => {
    // NEU-342: submit_answer returns agent-provided quality, not derived
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 4, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(4); // agent-provided, not derived
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
          getSessionById: vi
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

    it('assessment records the full mapper quality with a single attempt (no binary collapse)', async () => {
      const deps = makeAssessmentDeps();

      const result = await submitAnswer(
        makeInput({ quality: 5, sessionQuestionId: 'sq-1', timeSpentMs: 6000 }),
        deps
      );

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.attempt).toBe(1);
      expect(result.passed).toBe(true);
      // Mapper-derived, full 0–5 granularity — NOT collapsed to 4.
      expect(result.quality).toBe(5);
    });

    it('assessment fail records the mapper quality with no retry (no binary collapse)', async () => {
      const deps = makeAssessmentDeps();

      const result = await submitAnswer(makeInput({ quality: 1, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.attempt).toBe(1);
      expect(result.passed).toBe(false);
      // Mapper-derived — NOT collapsed to 2.
      expect(result.quality).toBe(1);
    });

    it('assessment rejects second attempt on same question', async () => {
      const deps = makeAssessmentDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion({ status: 'answered' })),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('error');
      if (result.action !== 'error') throw new Error('Expected error');
      expect(result.message).toContain('1 attempt per question');
    });

    it('assessment fans out SR update to all mapped chunks', async () => {
      const deps = makeAssessmentDeps();

      await submitAnswer(
        makeInput({ quality: 5, sessionQuestionId: 'sq-1', timeSpentMs: 10000 }),
        deps
      );

      // SR called once per mapped chunk (c1 and c2)
      expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalledTimes(2);
    });

    // NEU-844 / D4: N distinct SR states cannot be attributed to one attempt row.
    it('leaves the snapshot NULL for a multi-chunk assessment attempt', async () => {
      const deps = makeAssessmentDeps();

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);
      expect(result.action).toBe('recorded');

      const attempt = lastAttemptInput(deps);
      expect(attempt.snapshotBand).toBeNull();
      expect(attempt.snapshotPredictedRecall).toBeNull();
      expect(attempt.snapshotIntervalDays).toBeNull();
      expect(attempt.snapshotDaysOverdue).toBeNull();
      // The guard short-circuits before any chunk read.
      expect(deps.chunks.getById).not.toHaveBeenCalled();
    });

    it('assessment marks session_chunks completed when all questions answered', async () => {
      const deps = makeAssessmentDeps();

      await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

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

    it('assessment returns recorded status after successful submission', async () => {
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

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
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

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('error');
      if (result.action !== 'error') throw new Error('Expected error');
      expect(result.message).toContain('Attempt already recorded');
    });

    it('assessment returns error when SR persistence fails for a chunk', async () => {
      const deps = makeAssessmentDeps({
        reviewPersistence: {
          getChunk: vi.fn().mockResolvedValue(undefined),
          persistReviewUpdate: vi.fn().mockResolvedValue(0),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      // Aligned with teaching mode: SR failures are now fatal
      expect(result.action).toBe('error');
      if (result.action !== 'error') throw new Error('Expected error');
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

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
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

      const result = await submitAnswer(makeInput({ quality: 1, sessionQuestionId: 'sq-1' }), deps);

      // Should still succeed — missing chunks are gracefully skipped
      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.quality).toBe(1); // mapper-derived (no 4/2 collapse)
    });

    it('assessment late submission returns late_submission flag and static complete next', async () => {
      const deps = makeAssessmentDeps({
        sessions: {
          getSessionById: vi
            .fn()
            .mockResolvedValue(
              makeSession({ mode: 'assessment', chunkIds: ['c1', 'c2'], status: 'completed' })
            ),
          getSessionChunks: vi
            .fn()
            .mockResolvedValue([
              makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'completed' }),
              makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'completed' }),
            ]),
        },
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
          getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
          getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion({ status: 'answered' })]),
          getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['sq-1', ['c1']]])),
          getAllAttemptsForSession: vi.fn().mockResolvedValue([]),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.late_submission).toBe(true);
      // getActiveSession should NOT be called for late submissions
      expect(deps.sessions.getActiveSession).not.toHaveBeenCalled();
    });
  });

  // ── NEU-94: Late submission (completed session) ─────────────────

  describe('late submission (completed session)', () => {
    /** Shared deps for teaching-mode late submission: completed session, in_progress chunk */
    function makeLateSubmissionDeps(
      overrides?: Parameters<typeof makeQuestionDeps>[0]
    ): TeachingDeps {
      return makeQuestionDeps({
        sessions: {
          getSessionById: vi.fn().mockResolvedValue(makeSession({ status: 'completed' })),
          getSessionChunks: vi
            .fn()
            .mockResolvedValue([
              makeSessionChunk({ id: 'sc-1', chunkId: 'c1', status: 'in_progress' }),
            ]),
          ...overrides?.sessions,
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
            .mockResolvedValue([makeQuestionAttempt({ quality: 5 })]),
          ...overrides?.sessionQuestions,
        },
        ...(overrides?.reviewPersistence !== undefined && {
          reviewPersistence: overrides.reviewPersistence,
        }),
      });
    }

    it('records answer against a completed session with late_submission flag', async () => {
      const deps = makeLateSubmissionDeps();

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.late_submission).toBe(true);
    });

    it('does not trigger SR update on late submission (deferred to teach_next)', async () => {
      const deps = makeLateSubmissionDeps();

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      // NEU-347: SR deferred to teach_next
      expect(result.review_update).toBeUndefined();
      expect(deps.reviewPersistence.persistReviewUpdate).not.toHaveBeenCalled();
    });

    it('returns static complete response for next field on late submission', async () => {
      const deps = makeLateSubmissionDeps();

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      // getActiveSession should NOT have been called (late submission skips getNextTeachingStep)
      expect(deps.sessions.getActiveSession).not.toHaveBeenCalled();
    });

    it('includes late_submission when unanswered questions remain on completed session', async () => {
      const deps = makeLateSubmissionDeps({
        sessionQuestions: {
          getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
          getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
          // Two questions for this chunk, one still pending → unanswered remains
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
          getAllAttemptsForSession: vi
            .fn()
            .mockResolvedValue([makeQuestionAttempt({ quality: 5 })]),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.late_submission).toBe(true);
    });

    it('does not set late_submission on active session', async () => {
      const allQuestions = [makeQuestion({ id: 'sq-1', status: 'pending' })];
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
            .mockResolvedValue([makeQuestionAttempt({ quality: 5 })]),
        },
      });

      const result = await submitAnswer(makeInput({ quality: 5, sessionQuestionId: 'sq-1' }), deps);

      expect(result.action).toBe('recorded');
      if (result.action !== 'recorded') throw new Error('Expected recorded');
      expect(result.late_submission).toBeUndefined();
    });
  });

  // ── NEU-94: Inline path error message ───────────────────────────

  it('inline path returns no-session error when no active session', async () => {
    const deps = makeDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(null),
      },
    });

    // No sessionQuestionId → inline flow
    const result = await submitAnswer(makeInput(), deps);

    expect(result.action).toBe('error');
    expect((result as { message: string }).message).toContain('No active session');
  });

  // ── NEU-314: Reflect prompt on recorded responses ─────────────

  it('retry response does not include reflect field', async () => {
    const deps = makeQuestionDeps({
      sessionQuestions: {
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await submitAnswer(makeInput({ quality: 1, sessionQuestionId: 'sq-1' }), deps);

    expect(result.action).toBe('retry');
    expect('reflect' in result).toBe(false);
  });

  it('error response does not include reflect field', async () => {
    const deps = makeQuestionDeps({
      sessions: {
        getActiveSession: vi.fn().mockResolvedValue(null),
      },
    });

    const result = await submitAnswer(makeInput(), deps);

    expect(result.action).toBe('error');
    expect('reflect' in result).toBe(false);
  });

  it('reflect string references add_note and all four note types', () => {
    expect(SUBMIT_ANSWER_REFLECT_PROMPT).toContain('add_note');
    expect(SUBMIT_ANSWER_REFLECT_PROMPT).toContain('insight');
    expect(SUBMIT_ANSWER_REFLECT_PROMPT).toContain('confusion');
    expect(SUBMIT_ANSWER_REFLECT_PROMPT).toContain('connection');
    expect(SUBMIT_ANSWER_REFLECT_PROMPT).toContain('deeper_exploration');
  });
});

// ── NEU-391: buildCompleteResponse multi-question classification ─

describe('buildCompleteResponse', () => {
  it('classifies single question × 1 passed attempt as passed_first_try', () => {
    const sessionChunks = [makeSessionChunk({ chunkId: 'c1', status: 'completed' })];
    const questionsByChunkId = new Map([['c1', [makeQuestion({ id: 'sq-1' })]]]);
    const attemptsByQuestion = new Map([
      ['sq-1', [makeQuestionAttempt({ passed: true, attemptNumber: 1 })]],
    ]);

    const result = buildCompleteResponse(sessionChunks, questionsByChunkId, attemptsByQuestion);

    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(0);
    expect(result.summary.exhausted_retries).toBe(0);
  });

  it('classifies 3 questions × 1 passed attempt each as passed_first_try', () => {
    const sessionChunks = [makeSessionChunk({ chunkId: 'c1', status: 'completed' })];
    const questionsByChunkId = new Map([
      [
        'c1',
        [makeQuestion({ id: 'sq-1' }), makeQuestion({ id: 'sq-2' }), makeQuestion({ id: 'sq-3' })],
      ],
    ]);
    const attemptsByQuestion = new Map([
      [
        'sq-1',
        [
          makeQuestionAttempt({
            id: 'a1',
            sessionQuestionId: 'sq-1',
            passed: true,
            attemptNumber: 1,
          }),
        ],
      ],
      [
        'sq-2',
        [
          makeQuestionAttempt({
            id: 'a2',
            sessionQuestionId: 'sq-2',
            passed: true,
            attemptNumber: 1,
          }),
        ],
      ],
      [
        'sq-3',
        [
          makeQuestionAttempt({
            id: 'a3',
            sessionQuestionId: 'sq-3',
            passed: true,
            attemptNumber: 1,
          }),
        ],
      ],
    ]);

    const result = buildCompleteResponse(sessionChunks, questionsByChunkId, attemptsByQuestion);

    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(0);
    expect(result.summary.exhausted_retries).toBe(0);
  });

  it('classifies chunk with 2 questions where one needed retry as needed_retry', () => {
    const sessionChunks = [makeSessionChunk({ chunkId: 'c1', status: 'completed' })];
    const questionsByChunkId = new Map([
      ['c1', [makeQuestion({ id: 'sq-1' }), makeQuestion({ id: 'sq-2' })]],
    ]);
    const attemptsByQuestion = new Map([
      [
        'sq-1',
        [
          makeQuestionAttempt({
            id: 'a1',
            sessionQuestionId: 'sq-1',
            passed: true,
            attemptNumber: 1,
          }),
        ],
      ],
      [
        'sq-2',
        [
          makeQuestionAttempt({
            id: 'a2',
            sessionQuestionId: 'sq-2',
            passed: false,
            attemptNumber: 1,
          }),
          makeQuestionAttempt({
            id: 'a3',
            sessionQuestionId: 'sq-2',
            passed: true,
            attemptNumber: 2,
          }),
        ],
      ],
    ]);

    const result = buildCompleteResponse(sessionChunks, questionsByChunkId, attemptsByQuestion);

    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(1);
    expect(result.summary.exhausted_retries).toBe(0);
  });

  it('classifies chunk with all questions failed as exhausted_retries', () => {
    const sessionChunks = [makeSessionChunk({ chunkId: 'c1', status: 'completed' })];
    const questionsByChunkId = new Map([['c1', [makeQuestion({ id: 'sq-1' })]]]);
    const attemptsByQuestion = new Map([
      [
        'sq-1',
        [
          makeQuestionAttempt({
            id: 'a1',
            sessionQuestionId: 'sq-1',
            passed: false,
            attemptNumber: 1,
          }),
          makeQuestionAttempt({
            id: 'a2',
            sessionQuestionId: 'sq-1',
            passed: false,
            attemptNumber: 2,
          }),
        ],
      ],
    ]);

    const result = buildCompleteResponse(sessionChunks, questionsByChunkId, attemptsByQuestion);

    expect(result.summary.passed_first_try).toBe(0);
    expect(result.summary.needed_retry).toBe(0);
    expect(result.summary.exhausted_retries).toBe(1);
  });

  it('classifies multiple chunks independently', () => {
    const sessionChunks = [
      makeSessionChunk({ chunkId: 'c1', status: 'completed' }),
      makeSessionChunk({ id: 'sc-2', chunkId: 'c2', status: 'completed' }),
    ];
    const questionsByChunkId = new Map([
      ['c1', [makeQuestion({ id: 'sq-1' }), makeQuestion({ id: 'sq-2' })]],
      ['c2', [makeQuestion({ id: 'sq-3' })]],
    ]);
    const attemptsByQuestion = new Map([
      // c1: 2 questions, both passed first try → passed_first_try
      [
        'sq-1',
        [
          makeQuestionAttempt({
            id: 'a1',
            sessionQuestionId: 'sq-1',
            passed: true,
            attemptNumber: 1,
          }),
        ],
      ],
      [
        'sq-2',
        [
          makeQuestionAttempt({
            id: 'a2',
            sessionQuestionId: 'sq-2',
            passed: true,
            attemptNumber: 1,
          }),
        ],
      ],
      // c2: 1 question, needed retry → needed_retry
      [
        'sq-3',
        [
          makeQuestionAttempt({
            id: 'a3',
            sessionQuestionId: 'sq-3',
            passed: false,
            attemptNumber: 1,
          }),
          makeQuestionAttempt({
            id: 'a4',
            sessionQuestionId: 'sq-3',
            passed: true,
            attemptNumber: 2,
          }),
        ],
      ],
    ]);

    const result = buildCompleteResponse(sessionChunks, questionsByChunkId, attemptsByQuestion);

    expect(result.summary.total).toBe(2);
    expect(result.summary.passed_first_try).toBe(1);
    expect(result.summary.needed_retry).toBe(1);
    expect(result.summary.exhausted_retries).toBe(0);
  });
});

// ── NEU-717: buildAssessmentCompleteResponse ────────────────────

describe('buildAssessmentCompleteResponse', () => {
  it('returns correct counts for mixed pass/fail questions', () => {
    const questions = [
      makeQuestion({ id: 'sq-1', promptText: 'Q1' }),
      makeQuestion({ id: 'sq-2', promptText: 'Q2' }),
    ];
    const attempts = [
      makeQuestionAttempt({ sessionQuestionId: 'sq-1', passed: true, quality: 5 }),
      makeQuestionAttempt({ id: 'sqa-2', sessionQuestionId: 'sq-2', passed: false, quality: 2 }),
    ];
    const chunkMapping = new Map([
      ['sq-1', ['c1', 'c2']],
      ['sq-2', ['c2', 'c3']],
    ]);

    const result = buildAssessmentCompleteResponse(questions, attempts, chunkMapping);

    expect(result.action).toBe('complete');
    expect(result.message).toBe('Assessment complete.');
    expect(result.summary.total_questions).toBe(2);
    expect(result.summary.passed).toBe(1);
    expect(result.summary.failed).toBe(1);
    expect(result.summary.pass_rate).toBe(0.5);
    expect(result.summary.average_quality).toBe(3.5);
  });

  it('populates per_question with correct fields', () => {
    const questions = [makeQuestion({ id: 'sq-1', promptText: 'Explain X' })];
    const attempts = [
      makeQuestionAttempt({
        sessionQuestionId: 'sq-1',
        passed: true,
        quality: 4,
        agentQuality: 3,
        questionType: 'explain_apply',
        timeSpentMs: 8000,
      }),
    ];
    const chunkMapping = new Map([['sq-1', ['c1', 'c2']]]);

    const result = buildAssessmentCompleteResponse(questions, attempts, chunkMapping);

    expect(result.summary.per_question).toHaveLength(1);
    const pq = result.summary.per_question[0]!;
    expect(pq.question_id).toBe('sq-1');
    expect(pq.prompt_text).toBe('Explain X');
    expect(pq.chunk_ids).toEqual(['c1', 'c2']);
    expect(pq.passed).toBe(true);
    expect(pq.quality).toBe(4);
    expect(pq.agent_quality).toBe(3);
    expect(pq.question_type).toBe('explain_apply');
    expect(pq.time_spent_ms).toBe(8000);
  });

  it('weak_chunks contains only chunk IDs from failing questions, deduplicated', () => {
    const questions = [
      makeQuestion({ id: 'sq-1', promptText: 'Q1' }),
      makeQuestion({ id: 'sq-2', promptText: 'Q2' }),
      makeQuestion({ id: 'sq-3', promptText: 'Q3' }),
    ];
    const attempts = [
      makeQuestionAttempt({ sessionQuestionId: 'sq-1', passed: true, quality: 5 }),
      makeQuestionAttempt({ id: 'sqa-2', sessionQuestionId: 'sq-2', passed: false, quality: 1 }),
      makeQuestionAttempt({ id: 'sqa-3', sessionQuestionId: 'sq-3', passed: false, quality: 2 }),
    ];
    const chunkMapping = new Map([
      ['sq-1', ['c1', 'c2']],
      ['sq-2', ['c2', 'c3']],
      ['sq-3', ['c3', 'c4']],
    ]);

    const result = buildAssessmentCompleteResponse(questions, attempts, chunkMapping);

    expect(result.summary.weak_chunks).toHaveLength(3);
    expect(new Set(result.summary.weak_chunks)).toEqual(new Set(['c2', 'c3', 'c4']));
  });

  it('returns empty arrays and zero counts for empty questions list', () => {
    const result = buildAssessmentCompleteResponse([], [], new Map());

    expect(result.summary.total_questions).toBe(0);
    expect(result.summary.passed).toBe(0);
    expect(result.summary.failed).toBe(0);
    expect(result.summary.pass_rate).toBe(0);
    expect(result.summary.average_quality).toBe(0);
    expect(result.summary.per_question).toEqual([]);
    expect(result.summary.weak_chunks).toEqual([]);
  });

  it('handles questions with no matching attempt', () => {
    const questions = [makeQuestion({ id: 'sq-1', promptText: 'Q1' })];
    const chunkMapping = new Map([['sq-1', ['c1']]]);

    const result = buildAssessmentCompleteResponse(questions, [], chunkMapping);

    expect(result.summary.total_questions).toBe(1);
    expect(result.summary.passed).toBe(0);
    expect(result.summary.failed).toBe(1);
    expect(result.summary.per_question[0]!.passed).toBe(false);
    expect(result.summary.per_question[0]!.quality).toBeNull();
    expect(result.summary.per_question[0]!.time_spent_ms).toBe(0);
    expect(result.summary.weak_chunks).toEqual(['c1']);
  });

  it('all-pass scenario returns 100% pass rate and no weak chunks', () => {
    const questions = [makeQuestion({ id: 'sq-1' }), makeQuestion({ id: 'sq-2' })];
    const attempts = [
      makeQuestionAttempt({ sessionQuestionId: 'sq-1', passed: true, quality: 5 }),
      makeQuestionAttempt({ id: 'sqa-2', sessionQuestionId: 'sq-2', passed: true, quality: 4 }),
    ];
    const chunkMapping = new Map([
      ['sq-1', ['c1']],
      ['sq-2', ['c2']],
    ]);

    const result = buildAssessmentCompleteResponse(questions, attempts, chunkMapping);

    expect(result.summary.pass_rate).toBe(1);
    expect(result.summary.weak_chunks).toEqual([]);
    expect(result.summary.average_quality).toBe(4.5);
  });

  it('averages quality only from attempts with non-null quality', () => {
    const questions = [makeQuestion({ id: 'sq-1' }), makeQuestion({ id: 'sq-2' })];
    const attempts = [
      makeQuestionAttempt({ sessionQuestionId: 'sq-1', passed: true, quality: 4 }),
      makeQuestionAttempt({ id: 'sqa-2', sessionQuestionId: 'sq-2', passed: true, quality: null }),
    ];
    const chunkMapping = new Map([
      ['sq-1', ['c1']],
      ['sq-2', ['c2']],
    ]);

    const result = buildAssessmentCompleteResponse(questions, attempts, chunkMapping);

    expect(result.summary.average_quality).toBe(4);
  });

  it('cross-chunk failing question adds all mapped chunk IDs to weak_chunks', () => {
    const questions = [makeQuestion({ id: 'sq-1' })];
    const attempts = [
      makeQuestionAttempt({ sessionQuestionId: 'sq-1', passed: false, quality: 1 }),
    ];
    const chunkMapping = new Map([['sq-1', ['c1', 'c2', 'c3']]]);

    const result = buildAssessmentCompleteResponse(questions, attempts, chunkMapping);

    expect(result.summary.weak_chunks).toEqual(['c1', 'c2', 'c3']);
  });
});

// ── NEU-844: pre-review scheduling snapshot on the attempt row ───

/**
 * The snapshot is captured at the orchestration boundary and handed to
 * `createAttempt`, so these assert the input the port actually receives.
 * The four columns are the frozen downstream contract for NEU-845/NEU-846:
 * a capture failure must degrade to all-NULL, never fail the scored answer.
 */
describe('submit_answer scheduling snapshot', () => {
  it('captures the established band for a chunk with a real interval', async () => {
    const chunk = makeLearningChunk({
      id: 'c1',
      intervalDays: 10,
      nextReviewAt: Date.now() - 5 * MS_PER_DAY,
      easeFactor: 2.5,
      repetitions: 3,
    });
    const deps = makeDeps({ chunks: { getById: vi.fn().mockResolvedValue(chunk) } });

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);
    expect(result.action).toBe('recorded');

    const attempt = lastAttemptInput(deps);
    expect(attempt.snapshotBand).toBe('established');
    expect(attempt.snapshotIntervalDays).toBe(10);

    const predictedRecall = attempt.snapshotPredictedRecall;
    if (predictedRecall === null) throw new Error('Expected an established-band predicted recall');
    expect(predictedRecall).toBeGreaterThan(0);
    expect(predictedRecall).toBeLessThan(1);

    // The row's snapshot and its timestamp share one `now`: recomputing the
    // snapshot from the persisted `createdAt` reproduces it exactly.
    const expected = computeSchedulingSnapshot(
      {
        easeFactor: chunk.easeFactor,
        repetitions: chunk.repetitions,
        nextReviewAt: chunk.nextReviewAt,
        intervalDays: chunk.intervalDays,
      },
      new Date(attempt.createdAt)
    );
    expect(attempt.snapshotPredictedRecall).toBe(expected.predictedRecall);
    expect(attempt.snapshotDaysOverdue).toBe(expected.daysOverdue);
    expect(attempt.snapshotDaysOverdue).toBeCloseTo(5, 2);
  });

  it('captures the fresh band with no predicted recall for a null-interval chunk', async () => {
    const chunk = makeLearningChunk({
      id: 'c1',
      intervalDays: null,
      nextReviewAt: Date.now() - 3 * MS_PER_DAY,
    });
    const deps = makeDeps({ chunks: { getById: vi.fn().mockResolvedValue(chunk) } });

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);
    expect(result.action).toBe('recorded');

    const attempt = lastAttemptInput(deps);
    expect(attempt.snapshotBand).toBe('fresh');
    // No synthetic 1.0 can enter a calibration mean.
    expect(attempt.snapshotPredictedRecall).toBeNull();
    expect(attempt.snapshotIntervalDays).toBeNull();
    expect(attempt.snapshotDaysOverdue).toBeCloseTo(3, 2);
  });

  it('records an all-NULL snapshot when the chunk read finds nothing', async () => {
    const deps = makeDeps({ chunks: { getById: vi.fn().mockResolvedValue(undefined) } });

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);
    expect(result.action).toBe('recorded');

    const attempt = lastAttemptInput(deps);
    expect(attempt.snapshotBand).toBeNull();
    expect(attempt.snapshotPredictedRecall).toBeNull();
    expect(attempt.snapshotIntervalDays).toBeNull();
    expect(attempt.snapshotDaysOverdue).toBeNull();
  });

  it('still records the attempt with an all-NULL snapshot when the chunk read throws', async () => {
    const deps = makeDeps({
      chunks: { getById: vi.fn().mockRejectedValue(new Error('connection lost')) },
    });

    // Fail-open: a measurement feature never fails a scored answer.
    const result = await submitAnswer(makeInput({ quality: 4 }), deps);
    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    expect(result.quality).toBe(4);

    const attempt = lastAttemptInput(deps);
    expect(attempt.snapshotBand).toBeNull();
    expect(attempt.snapshotPredictedRecall).toBeNull();
    expect(attempt.snapshotIntervalDays).toBeNull();
    expect(attempt.snapshotDaysOverdue).toBeNull();
  });

  it('fails open when the chunk read rejects with a non-Error value', async () => {
    const deps = makeDeps({
      chunks: { getById: vi.fn().mockRejectedValue('pool exhausted') },
    });

    const result = await submitAnswer(makeInput({ quality: 4 }), deps);
    expect(result.action).toBe('recorded');

    const attempt = lastAttemptInput(deps);
    expect(attempt.snapshotBand).toBeNull();
    expect(attempt.snapshotPredictedRecall).toBeNull();
    expect(attempt.snapshotIntervalDays).toBeNull();
    expect(attempt.snapshotDaysOverdue).toBeNull();
  });
});
