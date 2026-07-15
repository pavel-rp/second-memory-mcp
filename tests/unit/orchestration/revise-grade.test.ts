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
import { rubricForQuality, rubricAllClaimedNoSpans } from '../../helpers/grading.js';

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

// Rubric mapping to quality 4 (recurrence + base + iteration order).
const baseInput: ReviseGradeInput = {
  sessionQuestionId: 'q1',
  grading: rubricForQuality(4),
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

  it('derives new_passed=false from a mapper quality < 3', async () => {
    const deps = happyDeps();
    // Rubric mapping to quality 2 (recurrence only) → non-pass.
    const result = await reviseGrade({ ...baseInput, grading: rubricForQuality(2) }, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.new_quality).toBe(2);
    expect(result.revised_attempt.new_passed).toBe(false);
  });

  it('derives new_passed=true from a mapper quality >= 3 (no agent override)', async () => {
    const deps = happyDeps();
    // Rubric mapping to quality 5 (all four criteria) → pass, deterministically.
    const result = await reviseGrade({ ...baseInput, grading: rubricForQuality(5) }, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.new_quality).toBe(5);
    expect(result.revised_attempt.new_passed).toBe(true);
  });

  it('reports roadblock_cancelled=true when revision lifts a roadblock', async () => {
    // Pre-revision attempt q=1 (followups[1]=3 required, 0 completed) → roadblocked.
    // After reviseAttempt mock, getAllAttemptsForSession returns a high-quality
    // attempt → no longer roadblocked → cancellation flag set.
    const lowAttempt = makeAttempt({ quality: 1, agentQuality: 1 });
    const highAttempt = makeAttempt({ quality: 5, agentQuality: 5, passed: true });
    const sessionQuestionsStub = stubSessionQuestionRepository({
      getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
      getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
      getAttemptsForQuestion: vi.fn().mockResolvedValue([lowAttempt]),
      getAllAttemptsForSession: vi
        .fn<(sid: string) => Promise<SessionQuestionAttempt[]>>()
        .mockResolvedValueOnce([lowAttempt]) // pre-revision roadblock check
        .mockResolvedValue([highAttempt]), // post-revision roadblock check
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
      getAllAttemptsForSession: vi.fn().mockResolvedValue([goodAttempt]),
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

  it('selects the in-progress chunk when the question links multiple session chunks', async () => {
    // Multi-chunk (assessment-mode style) question linked to chunks cA (pending) and cB (in_progress).
    // Auto-note must target cB — the chunk the learner is currently in.
    const sessionChunkA = makeSessionChunk({
      id: 'sc-a',
      chunkId: 'cA',
      status: 'pending',
    });
    const sessionChunkB = makeSessionChunk({
      id: 'sc-b',
      chunkId: 'cB',
      status: 'in_progress',
    });
    const notes = stubNotesRepository();
    const deps: ReviseGradeDeps = {
      sessions: stubSessionRepository({
        getActiveSession: vi.fn().mockResolvedValue(makeSession()),
        getSessionChunks: vi.fn().mockResolvedValue([sessionChunkA, sessionChunkB]),
      }),
      sessionQuestions: stubSessionQuestionRepository({
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue(['cA', 'cB']),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([makeAttempt()]),
        getRevisionsForAttempt: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion()]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['q1', ['cA', 'cB']]])),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([]),
        reviseAttempt: vi.fn().mockResolvedValue(makeRevision()),
      }),
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      notes,
    };
    const result = await reviseGrade(baseInput, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    const createNoteMock = notes.createNote as ReturnType<typeof vi.fn>;
    expect(createNoteMock).toHaveBeenCalledTimes(1);
    expect(createNoteMock.mock.calls[0]?.[0]?.targetId).toBe('cB');
  });

  it('falls back to the first session chunk when none are in-progress', async () => {
    // Edge case: question is linked to a single pending chunk (e.g. session
    // hasn't advanced yet). The earlier completed-chunk guard ensures the
    // fallback is safe; the auto-note targets that chunk.
    const sessionChunkPending = makeSessionChunk({ chunkId: 'c1', status: 'pending' });
    const notes = stubNotesRepository();
    const deps: ReviseGradeDeps = {
      sessions: stubSessionRepository({
        getActiveSession: vi.fn().mockResolvedValue(makeSession()),
        getSessionChunks: vi.fn().mockResolvedValue([sessionChunkPending]),
      }),
      sessionQuestions: stubSessionQuestionRepository({
        getQuestionById: vi.fn().mockResolvedValue(makeQuestion()),
        getChunkIdsForQuestion: vi.fn().mockResolvedValue(['c1']),
        getAttemptsForQuestion: vi.fn().mockResolvedValue([makeAttempt()]),
        getRevisionsForAttempt: vi.fn().mockResolvedValue([]),
        getQuestionsForSession: vi.fn().mockResolvedValue([makeQuestion()]),
        getChunkIdsForQuestions: vi.fn().mockResolvedValue(new Map([['q1', ['c1']]])),
        getAllAttemptsForSession: vi.fn().mockResolvedValue([]),
        reviseAttempt: vi.fn().mockResolvedValue(makeRevision()),
      }),
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      notes,
    };
    const result = await reviseGrade(baseInput, deps);
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    const createNoteMock = notes.createNote as ReturnType<typeof vi.fn>;
    expect(createNoteMock.mock.calls[0]?.[0]?.targetId).toBe('c1');
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

// NEU-929 (OUT-5): a bare learner rebuttal — persuasive `new_feedback` text with
// no NEW rubric-anchored evidence — can never flip a grade upward. An upgrade
// requires a new payload the deterministic mapper credits higher; the rebuttal
// prose is never an input to the grade.
describe('reviseGrade — rebuttal-invariance (NEU-929)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const BARE_REBUTTAL =
    'You graded me far too harshly. I am absolutely certain my answer deserves full marks — please raise it to a 5.';

  it('a bare rebuttal carrying no new rubric evidence produces zero upward flips', async () => {
    // Original attempt quality is 2 (makeAttempt default). A bare rebuttal re-submits
    // the SAME rubric evidence (maps to 2) with only persuasive new feedback text.
    const deps = happyDeps();
    const result = await reviseGrade(
      {
        sessionQuestionId: 'q1',
        grading: rubricForQuality(2),
        newFeedback: BARE_REBUTTAL,
        reason: 'learner_provided_clarification',
      },
      deps
    );
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.original_quality).toBe(2);
    expect(result.revised_attempt.new_quality).toBe(2);
    expect(result.revised_attempt.new_passed).toBe(false);
    // Explicit no-upward-flip property.
    expect(result.revised_attempt.new_quality ?? 0).toBeLessThanOrEqual(
      result.revised_attempt.original_quality ?? 0
    );
  });

  it('an unevidenced adversarial payload with a strong rebuttal fails closed', async () => {
    const deps = happyDeps();
    const result = await reviseGrade(
      {
        sessionQuestionId: 'q1',
        grading: rubricAllClaimedNoSpans(),
        newFeedback: BARE_REBUTTAL,
        reason: 'learner_provided_clarification',
      },
      deps
    );
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.new_quality).toBe(0);
    expect(result.revised_attempt.new_passed).toBe(false);
  });

  it('the rebuttal feedback text has zero influence on the derived quality', async () => {
    // Identical rubric payload, two very different persuasive feedback strings →
    // identical mapper-derived quality. The prose is not an input to the grade.
    const mild = await reviseGrade(
      {
        sessionQuestionId: 'q1',
        grading: rubricForQuality(2),
        newFeedback: 'Minor clarifying note.',
        reason: 'other',
      },
      happyDeps()
    );
    const persuasive = await reviseGrade(
      {
        sessionQuestionId: 'q1',
        grading: rubricForQuality(2),
        newFeedback: BARE_REBUTTAL.repeat(3),
        reason: 'other',
      },
      happyDeps()
    );
    if (mild.action !== 'revised' || persuasive.action !== 'revised') {
      throw new Error('expected both revisions to succeed');
    }
    expect(persuasive.revised_attempt.new_quality).toBe(mild.revised_attempt.new_quality);
    expect(persuasive.revised_attempt.new_quality).toBe(2);
  });

  it('an upgrade requires a new rubric-anchored payload the mapper credits higher', async () => {
    // Only a genuinely better-evidenced payload lifts the grade, and the lift is
    // driven by the mapper (rubricForQuality(4)), not by any rebuttal text.
    const deps = happyDeps();
    const result = await reviseGrade(
      {
        sessionQuestionId: 'q1',
        grading: rubricForQuality(4),
        newFeedback: 'On review the recurrence, base case, and iteration order were all evidenced.',
        reason: 'agent_misjudged_correctness',
      },
      deps
    );
    if (result.action !== 'revised') throw new Error(`expected revised, got ${result.action}`);
    expect(result.revised_attempt.original_quality).toBe(2);
    expect(result.revised_attempt.new_quality).toBe(4);
    expect(result.revised_attempt.new_passed).toBe(true);
  });
});
