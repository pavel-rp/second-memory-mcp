import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: vi.fn(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })),
  logEvent: vi.fn(),
}));

import { reviseGrade } from '../../../src/orchestration/teaching-workflows.js';
import type { ReviseGradeDeps } from '../../../src/orchestration/teaching-workflows.js';
import type {
  LearningSession,
  SessionChunk,
  SessionQuestion,
  SessionQuestionAttempt,
  SessionQuestionAttemptRevision,
} from '../../../src/domain/types/entities.js';
import type { ReviseGradeInput } from '../../../src/domain/types/teaching.js';
import {
  stubSessionRepository,
  stubSessionQuestionRepository,
  stubNotesRepository,
} from '../../helpers/stub-ports.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

const NOW = 1_700_000_000_000;

function makeSession(overrides?: Partial<LearningSession>): LearningSession {
  return {
    id: 'sess-1',
    topicId: 'topic-1',
    chunkIds: ['c1'],
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
    status: 'in_progress',
    teachingApproach: null,
    timeSpentMs: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeQuestion(overrides?: Partial<SessionQuestion>): SessionQuestion {
  return {
    id: 'q1',
    sessionId: 'sess-1',
    questionIndex: 1,
    promptText: 'p1',
    status: 'pending',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeAttempt(overrides?: Partial<SessionQuestionAttempt>): SessionQuestionAttempt {
  return {
    id: 'a1',
    sessionQuestionId: 'q1',
    attemptNumber: 1,
    response: 'r',
    passed: false,
    feedback: 'wrong',
    quality: 2,
    agentQuality: 2,
    questionType: 'recall',
    timeSpentMs: 1000,
    createdAt: NOW,
    ...overrides,
  };
}

function makeRevision(
  overrides?: Partial<SessionQuestionAttemptRevision>
): SessionQuestionAttemptRevision {
  return {
    id: 'rev1',
    attemptId: 'a1',
    originalQuality: 2,
    originalAgentQuality: 2,
    originalPassed: false,
    originalFeedback: 'wrong',
    newQuality: 4,
    newAgentQuality: 4,
    newPassed: true,
    newFeedback: 'corrected',
    reason: 'agent_misread_prompt',
    revisedAt: NOW,
    ...overrides,
  };
}

type HappyDepsOverrides = {
  session?: LearningSession | null;
  sessionChunks?: SessionChunk[];
  question?: SessionQuestion | null;
  chunkIds?: string[];
  attempts?: SessionQuestionAttempt[];
  priorRevisions?: SessionQuestionAttemptRevision[];
  withNotes?: boolean;
  notesOverride?: ReturnType<typeof stubNotesRepository>;
};

function happyDeps(overrides?: HappyDepsOverrides): ReviseGradeDeps {
  const o = overrides ?? {};
  const session = 'session' in o ? o.session : makeSession();
  const question = 'question' in o ? o.question : makeQuestion();
  const sessions = stubSessionRepository({
    getActiveSession: vi.fn().mockResolvedValue(session),
    getSessionChunks: vi.fn().mockResolvedValue(o.sessionChunks ?? [makeSessionChunk()]),
  });
  const sessionQuestions = stubSessionQuestionRepository({
    getQuestionById: vi.fn().mockResolvedValue(question),
    getChunkIdsForQuestion: vi.fn().mockResolvedValue(o.chunkIds ?? ['c1']),
    getAttemptsForQuestion: vi.fn().mockResolvedValue(o.attempts ?? [makeAttempt()]),
    getRevisionsForAttempt: vi.fn().mockResolvedValue(o.priorRevisions ?? []),
    getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion()]),
    getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['q1', ['c1']]])),
    reviseAttempt: vi.fn().mockResolvedValue(makeRevision()),
  });
  const notes = o.withNotes === false ? undefined : (o.notesOverride ?? stubNotesRepository());
  return {
    sessions,
    sessionQuestions,
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    notes,
  };
}

const baseInput: ReviseGradeInput = {
  sessionQuestionId: 'q1',
  newQuality: 4,
  newFeedback: 'corrected',
  reason: 'agent_misread_prompt',
};

describe('reviseGrade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns session_not_active when no active session', async () => {
    const deps = happyDeps({ session: null });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('session_not_active');
    expect(deps.sessionQuestions.reviseAttempt).not.toHaveBeenCalled();
  });

  it('returns session_not_active when session status is not active', async () => {
    const deps = happyDeps({ session: makeSession({ status: 'completed' }) });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('session_not_active');
  });

  it('returns question_not_found when question is null', async () => {
    const deps = happyDeps({ question: null });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('question_not_found');
  });

  it('returns question_not_found when question belongs to another session', async () => {
    const deps = happyDeps({ question: makeQuestion({ sessionId: 'other-session' }) });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('question_not_found');
  });

  it('returns question_not_found when no chunk linkage exists', async () => {
    const deps = happyDeps({ chunkIds: [], sessionChunks: [] });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('question_not_found');
  });

  it('returns chunk_already_finalized when the chunk has been completed', async () => {
    const deps = happyDeps({
      sessionChunks: [makeSessionChunk({ status: 'completed' })],
    });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('chunk_already_finalized');
    expect(deps.sessionQuestions.reviseAttempt).not.toHaveBeenCalled();
  });

  it('returns attempt_not_found when no attempt has been recorded', async () => {
    const deps = happyDeps({ attempts: [] });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('attempt_not_found');
  });

  it('returns noop_already_revised when an identical revision exists', async () => {
    const matching = makeRevision({
      newQuality: 4,
      newAgentQuality: 4,
      newPassed: true,
      newFeedback: 'corrected',
      reason: 'agent_misread_prompt',
    });
    const deps = happyDeps({ priorRevisions: [matching] });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('noop_already_revised');
    if (result.action !== 'noop_already_revised') throw new Error('unreachable');
    expect(result.revision_id).toBe(matching.id);
    expect(deps.sessionQuestions.reviseAttempt).not.toHaveBeenCalled();
  });

  it('persists the revision and returns success on the happy path', async () => {
    const deps = happyDeps();
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('revised');
    if (result.action !== 'revised') throw new Error('unreachable');
    expect(result.revised_attempt.attempt_id).toBe('a1');
    expect(result.revised_attempt.new_quality).toBe(4);
    expect(result.revised_attempt.original_quality).toBe(2);
    expect(result.revised_attempt.new_passed).toBe(true);
    expect(result.reason).toBe('agent_misread_prompt');
    expect(deps.sessionQuestions.reviseAttempt).toHaveBeenCalledTimes(1);
    expect(deps.notes!.createNote).toHaveBeenCalledTimes(1);
    expect(result.note_id).toBe('note-stub');
  });

  it('defaults new_passed to (newQuality >= 3) when omitted', async () => {
    const deps = happyDeps();
    const result = await reviseGrade({ ...baseInput, newQuality: 2 }, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.new_passed).toBe(false);
  });

  it('respects an explicit new_passed override', async () => {
    const deps = happyDeps();
    const result = await reviseGrade({ ...baseInput, newQuality: 5, newPassed: false }, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.new_passed).toBe(false);
  });

  it('reports roadblock_cancelled=true when revision lifts a roadblock', async () => {
    // attempt at quality 2 triggers a roadblock (followups[2]=2). After revising to 4 (followups[4]=1)
    // the gate still has remaining=1 so we need to also have a qualifying followup.
    // Simpler: pre-revision attempt q=1 (followups=3 required, 0 completed) => roadblocked.
    // Post-revision via reviseAttempt mock — we simulate the post-state by having
    // getAttemptsForQuestion return a high-quality attempt on the second call.
    const lowAttempt = makeAttempt({ quality: 1, agentQuality: 1 });
    const highAttempt = makeAttempt({ quality: 5, agentQuality: 5, passed: true });
    const sessionQuestionsStub = stubSessionQuestionRepository({
      getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
      getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      getAttemptsForQuestion: vi
        .fn<(qid: string) => Promise<SessionQuestionAttempt[]>>()
        .mockResolvedValueOnce([lowAttempt]) // step 4: load latest
        .mockResolvedValueOnce([lowAttempt]) // step 7: pre-revision roadblock check
        .mockResolvedValue([highAttempt]), // step 9: post-revision roadblock check
      getRevisionsForAttempt: vi.fn().mockResolvedValue([]),
      getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion()]),
      getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['q1', ['c1']]])),
      reviseAttempt: vi.fn().mockResolvedValue(makeRevision()),
    });
    const deps: ReviseGradeDeps = {
      sessions: stubSessionRepository({
        getActiveSession: vi.fn().mockResolvedValue(makeSession()),
        getSessionChunks: vi.fn().mockResolvedValue([makeSessionChunk()]),
      }),
      sessionQuestions: sessionQuestionsStub,
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      notes: stubNotesRepository(),
    };
    const result = await reviseGrade(baseInput, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.roadblock_cancelled).toBe(true);
  });

  it('reports roadblock_cancelled=false when no roadblock existed before', async () => {
    // Pre-revision attempt is q=5: followups[5]=0 → no roadblock. After revision to q=4,
    // followups[4]=1 may or may not gate, but cancellation flag requires was→wasNot.
    const goodAttempt = makeAttempt({ quality: 5, agentQuality: 5, passed: true });
    const sessionQuestionsStub = stubSessionQuestionRepository({
      getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
      getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      getAttemptsForQuestion: vi.fn().mockResolvedValue([goodAttempt]),
      getRevisionsForAttempt: vi.fn().mockResolvedValue([]),
      getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion()]),
      getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['q1', ['c1']]])),
      reviseAttempt: vi.fn().mockResolvedValue(makeRevision()),
    });
    const deps: ReviseGradeDeps = {
      sessions: stubSessionRepository({
        getActiveSession: vi.fn().mockResolvedValue(makeSession()),
        getSessionChunks: vi.fn().mockResolvedValue([makeSessionChunk()]),
      }),
      sessionQuestions: sessionQuestionsStub,
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      notes: stubNotesRepository(),
    };
    const result = await reviseGrade(baseInput, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.roadblock_cancelled).toBe(false);
  });

  it('skips note creation when notes dep is absent and returns empty note_id', async () => {
    const deps = happyDeps({ withNotes: false });
    const result = await reviseGrade(baseInput, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.note_id).toBe('');
  });

  it('does not fail when auto-note creation throws', async () => {
    const failingNotes = stubNotesRepository({
      createNote: vi.fn().mockRejectedValue(new Error('db down')),
    });
    const deps = happyDeps({ notesOverride: failingNotes });
    const result = await reviseGrade(baseInput, deps);
    expect(result.action).toBe('revised');
    if (result.action !== 'revised') throw new Error('unreachable');
    expect(result.note_id).toBe('');
  });
});
