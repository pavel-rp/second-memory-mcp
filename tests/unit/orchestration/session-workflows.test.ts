import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: vi.fn(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })),
  logEvent: vi.fn(),
}));

import {
  createSession,
  completeSession,
  getSessionWithChunks,
  convertSessionToSessionInput,
  getHistoricalFeedback,
  batchUpdateSessionChunks,
  getSessionById,
  getActiveSession,
  createSessionChunk,
  validateChunkIds,
  getSessionChunks,
  resolveSessionChunkDependencies,
  type SessionDeps,
} from '../../../src/orchestration/session-workflows.js';
import { logEvent } from '../../../src/shared/logger.js';
import type { LearningSession, LearningChunk } from '../../../src/domain/types/entities.js';
import { stubSessionRepository, stubChunkRepository } from '../../helpers/stub-ports.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function stubSession(overrides?: Partial<LearningSession>): LearningSession {
  return {
    id: 'sess-1',
    topicId: 'topic-1',
    chunkIds: ['c1'],
    mode: 'guided',
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

function stubChunk(overrides?: Partial<LearningChunk>): LearningChunk {
  return {
    id: 'c1',
    topicId: 'topic-1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 2,
    consecutiveFailures: 0,
    lastReviewedAt: NOW - 86_400_000,
    estimatedDuration: 10,
    intervalDays: 7,
    chunkType: 'review',
    contentStatus: 'final',
    condensedSummary: null,
    knowledgeType: null,
    validatorReport: null,
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Content',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    createdAt: NOW - 1_000_000,
    updatedAt: NOW,
    ...overrides,
  };
}

function stubDeps(): SessionDeps {
  return {
    sessions: stubSessionRepository({
      getActiveSession: vi.fn().mockResolvedValue(null),
      validateChunkIds: vi
        .fn()
        .mockResolvedValue({ valid: true, invalidIds: [], validIds: ['c1'] }),
      createSession: vi.fn().mockResolvedValue(undefined),
      getSessionById: vi.fn().mockResolvedValue(stubSession()),
      completeSession: vi.fn().mockResolvedValue(1),
      getSessionWithChunks: vi.fn().mockResolvedValue({ session: stubSession(), chunks: [] }),
      convertSessionToSessionInput: vi.fn().mockResolvedValue(null),
      getHistoricalFeedbackForChunks: vi.fn().mockResolvedValue([]),
      getSessionChunks: vi.fn().mockResolvedValue([]),
      persistBatchSessionChunkOperations: vi.fn().mockResolvedValue({
        created: 1,
        updated: 0,
        unchanged: 0,
        affectedChunkIds: ['c1'],
      }),
      createSessionChunk: vi.fn().mockResolvedValue({
        id: 'sc-1',
        sessionId: 'sess-1',
        chunkId: 'c1',
        status: 'pending',
        teachingApproach: null,
        timeSpentMs: 0,
        createdAt: NOW,
        updatedAt: NOW,
      }),
    }),
    chunks: stubChunkRepository({
      getById: vi.fn().mockResolvedValue(stubChunk()),
    }),
    maxDependencyDepth: 5,
  };
}

// ── createSession ───────────────────────────────────────────────

describe('createSession', () => {
  beforeEach(() => {
    vi.mocked(logEvent).mockClear();
  });

  it('creates session on happy path', async () => {
    const deps = stubDeps();

    const result = await createSession({ mode: 'guided', chunkIds: ['c1'] }, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sessionId).toBeDefined();
    }
    expect(deps.sessions.createSession).toHaveBeenCalledOnce();
  });

  it('returns conflict when active session exists', async () => {
    const deps = stubDeps();
    (deps.sessions.getActiveSession as ReturnType<typeof vi.fn>).mockResolvedValue(stubSession());

    const result = await createSession({ mode: 'guided' }, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('conflict');
    }
  });

  it('returns validation error for invalid chunk IDs', async () => {
    const deps = stubDeps();
    (deps.sessions.validateChunkIds as ReturnType<typeof vi.fn>).mockResolvedValue({
      valid: false,
      invalidIds: ['bad-id'],
      validIds: [],
    });

    const result = await createSession({ mode: 'guided', chunkIds: ['bad-id'] }, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
      expect(result.error.message).toContain('bad-id');
    }
  });

  it('skips chunk validation when no chunkIds provided', async () => {
    const deps = stubDeps();

    const result = await createSession({ mode: 'guided' }, deps);

    expect(result.success).toBe(true);
    expect(deps.sessions.validateChunkIds).not.toHaveBeenCalled();
  });

  it('skips chunk validation when chunkIds is empty', async () => {
    const deps = stubDeps();

    const result = await createSession({ mode: 'guided', chunkIds: [] }, deps);

    expect(result.success).toBe(true);
    expect(deps.sessions.validateChunkIds).not.toHaveBeenCalled();
  });

  it('returns database error when createSession throws', async () => {
    const deps = stubDeps();
    (deps.sessions.createSession as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('db error')
    );

    const result = await createSession({ mode: 'guided' }, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
    }
  });

  it('returns validation error for assessment mode with empty chunkIds', async () => {
    const deps = stubDeps();

    const result = await createSession({ mode: 'assessment', chunkIds: [] }, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
      expect(result.error.message).toContain('Assessment mode requires');
    }
  });

  it('returns validation error for assessment mode with no chunkIds', async () => {
    const deps = stubDeps();

    const result = await createSession({ mode: 'assessment' }, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
      expect(result.error.message).toContain('Assessment mode requires');
    }
  });

  it('returns fallback message when createSession throws a non-Error', async () => {
    const deps = stubDeps();
    (deps.sessions.createSession as ReturnType<typeof vi.fn>).mockRejectedValue('string error');

    const result = await createSession({ mode: 'guided' }, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toBe('Failed to create session');
    }
  });

  it('calls logEvent with session_created on success', async () => {
    const deps = stubDeps();

    const result = await createSession({ mode: 'guided', chunkIds: ['c1'] }, deps);

    expect(result.success).toBe(true);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith('createSession', 'session_created', {
      sessionId: expect.any(String),
      mode: 'guided',
      requestedChunkCount: 1,
    });
  });

  it('does not call logEvent when active session already exists', async () => {
    const deps = stubDeps();
    (deps.sessions.getActiveSession as ReturnType<typeof vi.fn>).mockResolvedValue(stubSession());

    await createSession({ mode: 'guided' }, deps);

    expect(logEvent).not.toHaveBeenCalled();
  });
});

// ── completeSession ─────────────────────────────────────────────

describe('completeSession', () => {
  beforeEach(() => {
    vi.mocked(logEvent).mockClear();
  });

  it('completes session on happy path', async () => {
    const deps = stubDeps();

    const result = await completeSession('sess-1', 'Good session', deps);

    expect(result.success).toBe(true);
    expect(deps.sessions.completeSession).toHaveBeenCalledWith('sess-1', 'Good session');
  });

  it('returns not_found when session does not exist', async () => {
    const deps = stubDeps();
    (deps.sessions.getSessionById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await completeSession('missing', undefined, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('returns database error when completeSession throws', async () => {
    const deps = stubDeps();
    (deps.sessions.completeSession as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('db error')
    );

    const result = await completeSession('sess-1', undefined, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
    }
  });

  it('returns fallback message when completeSession throws a non-Error', async () => {
    const deps = stubDeps();
    (deps.sessions.completeSession as ReturnType<typeof vi.fn>).mockRejectedValue('string error');

    const result = await completeSession('sess-1', undefined, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toBe('Failed to complete session');
    }
  });

  it('calls logEvent with session_completed on success', async () => {
    const deps = stubDeps();

    await completeSession('sess-1', 'Good session', deps);

    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith('completeSession', 'session_completed', {
      sessionId: 'sess-1',
    });
  });

  it('does not call logEvent when session is not found', async () => {
    const deps = stubDeps();
    (deps.sessions.getSessionById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await completeSession('missing', undefined, deps);

    expect(logEvent).not.toHaveBeenCalled();
  });
});

// ── batchUpdateSessionChunks ────────────────────────────────────

describe('batchUpdateSessionChunks', () => {
  beforeEach(() => {
    vi.mocked(logEvent).mockClear();
  });

  it('returns batch results on happy path', async () => {
    const deps = stubDeps();

    const result = await batchUpdateSessionChunks('sess-1', [{ chunkId: 'c1' }], deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.created).toBe(1);
    }
  });

  it('returns not_found when session does not exist', async () => {
    const deps = stubDeps();
    (deps.sessions.getSessionById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await batchUpdateSessionChunks('missing', [{ chunkId: 'c1' }], deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('returns database error when persist throws', async () => {
    const deps = stubDeps();
    (
      deps.sessions.persistBatchSessionChunkOperations as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('db error'));

    const result = await batchUpdateSessionChunks('sess-1', [{ chunkId: 'c1' }], deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
    }
  });

  it('returns fallback message when persist throws a non-Error', async () => {
    const deps = stubDeps();
    (
      deps.sessions.persistBatchSessionChunkOperations as ReturnType<typeof vi.fn>
    ).mockRejectedValue('string error');

    const result = await batchUpdateSessionChunks('sess-1', [{ chunkId: 'c1' }], deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toBe('Failed to batch update session chunks');
    }
  });

  it('calls logEvent with chunks_updated on success', async () => {
    const deps = stubDeps();

    await batchUpdateSessionChunks('sess-1', [{ chunkId: 'c1' }], deps);

    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith('batchUpdateSessionChunks', 'chunks_updated', {
      sessionId: 'sess-1',
      createdCount: 1,
      updatedCount: 0,
      unchangedCount: 0,
    });
  });

  it('does not call logEvent when session is not found', async () => {
    const deps = stubDeps();
    (deps.sessions.getSessionById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await batchUpdateSessionChunks('missing', [{ chunkId: 'c1' }], deps);

    expect(logEvent).not.toHaveBeenCalled();
  });
});

// ── Pass-through functions ──────────────────────────────────────

describe('pass-through delegations', () => {
  it('getSessionWithChunks delegates to sessions port', async () => {
    const deps = stubDeps();

    const result = await getSessionWithChunks('sess-1', deps);

    expect(deps.sessions.getSessionWithChunks).toHaveBeenCalledWith('sess-1');
    expect(result.session).toBeDefined();
  });

  it('convertSessionToSessionInput delegates with options', async () => {
    const deps = stubDeps();
    const options = { includeHistoricalFeedback: true, historicalFeedbackLimit: 5 };

    await convertSessionToSessionInput('sess-1', options, deps);

    expect(deps.sessions.convertSessionToSessionInput).toHaveBeenCalledWith('sess-1', options);
  });

  it('getHistoricalFeedback delegates with options', async () => {
    const deps = stubDeps();
    const options = { limit: 10, excludeSessionId: 'sess-2' };

    await getHistoricalFeedback(['c1'], options, deps);

    expect(deps.sessions.getHistoricalFeedbackForChunks).toHaveBeenCalledWith(['c1'], options);
  });

  it('getSessionById delegates to sessions port', async () => {
    const deps = stubDeps();

    const result = await getSessionById('sess-1', deps);

    expect(deps.sessions.getSessionById).toHaveBeenCalledWith('sess-1');
    expect(result).toBeDefined();
  });

  it('getActiveSession delegates to sessions port', async () => {
    const deps = stubDeps();

    await getActiveSession(deps);

    expect(deps.sessions.getActiveSession).toHaveBeenCalledOnce();
  });

  it('createSessionChunk delegates to sessions port', async () => {
    const deps = stubDeps();
    const input = {
      id: 'sc-1',
      sessionId: 'sess-1',
      chunkId: 'c1',
      createdAt: NOW,
      updatedAt: NOW,
    };

    const result = await createSessionChunk(input, deps);

    expect(deps.sessions.createSessionChunk).toHaveBeenCalledWith(input);
    expect(result.id).toBe('sc-1');
  });

  it('validateChunkIds delegates to sessions port', async () => {
    const deps = stubDeps();

    const result = await validateChunkIds(['c1'], deps);

    expect(deps.sessions.validateChunkIds).toHaveBeenCalledWith(['c1']);
    expect(result.valid).toBe(true);
  });

  it('getSessionChunks delegates to sessions port', async () => {
    const deps = stubDeps();

    await getSessionChunks('sess-1', deps);

    expect(deps.sessions.getSessionChunks).toHaveBeenCalledWith('sess-1');
  });
});

// ── resolveSessionChunkDependencies ─────────────────────────────

describe('resolveSessionChunkDependencies', () => {
  it('returns empty result for empty input', async () => {
    const deps = stubDeps();

    const result = await resolveSessionChunkDependencies([], deps);

    expect(result.resolvedChunkIds).toEqual([]);
    expect(result.addedPrerequisites).toEqual([]);
    expect(result.message).toBe('');
  });

  it('returns empty result when called with falsy value (runtime guard)', async () => {
    const deps = stubDeps();

    // Tests the `if (!chunkIds || ...)` guard — cannot happen in typed TS but protects JS callers
    const result = await resolveSessionChunkDependencies(null as unknown as string[], deps);

    expect(result.resolvedChunkIds).toEqual([]);
  });

  it('resolves single chunk with no prerequisites', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'c1', prerequisitesJson: null })
    );

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.resolvedChunkIds).toContain('c1');
    expect(result.addedPrerequisites).toEqual([]);
  });

  it('adds transitive prerequisites (non-mastered)', async () => {
    const deps = stubDeps();
    const c1 = stubChunk({ id: 'c1', prerequisitesJson: ['c2'] });
    const c2 = stubChunk({ id: 'c2', prerequisitesJson: null, repetitions: 0 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      if (id === 'c1') return c1;
      if (id === 'c2') return c2;
      return undefined;
    });

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.resolvedChunkIds).toContain('c1');
    expect(result.resolvedChunkIds).toContain('c2');
    expect(result.addedPrerequisites).toContain('c2');
    expect(result.message).toContain('prerequisite');
  });

  it('falls back to original chunkIds when requested chunk is missing', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await resolveSessionChunkDependencies(['missing'], deps);

    expect(result.resolvedChunkIds).toEqual(['missing']);
    expect(result.addedPrerequisites).toEqual([]);
  });

  it('skips missing prerequisite and includes warning in message', async () => {
    const deps = stubDeps();
    const c1 = stubChunk({ id: 'c1', prerequisitesJson: ['missing-prereq'] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      if (id === 'c1') return c1;
      return undefined;
    });

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.resolvedChunkIds).toContain('c1');
    expect(result.message).toContain('missing-prereq');
  });

  it('returns fallback when relevantItems is empty after filtering (falsy chunkId)', async () => {
    const deps = stubDeps();

    // Pass chunkId that is empty string — falsy so skipped by the `if (!currentId)` guard.
    // This leaves chunkMap empty, missingRequestedChunks empty, and relevantItems.length === 0.
    const result = await resolveSessionChunkDependencies([''], deps);

    expect(result.resolvedChunkIds).toEqual(['']);
    expect(result.addedPrerequisites).toEqual([]);
    expect(result.message).toBe('');
  });

  it('falls back to original chunkIds when dependency resolution is invalid (circular)', async () => {
    const deps = stubDeps();
    const c1 = stubChunk({ id: 'c1', prerequisitesJson: ['c2'] });
    const c2 = stubChunk({ id: 'c2', prerequisitesJson: ['c1'] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      if (id === 'c1') return c1;
      if (id === 'c2') return c2;
      return undefined;
    });

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.resolvedChunkIds).toEqual(['c1']);
    expect(result.addedPrerequisites).toEqual([]);
    expect(result.message).toBe('');
  });

  it('pluralizes message when multiple non-mastered prerequisites are added', async () => {
    const deps = stubDeps();
    // c1 depends on c2, c2 depends on c3 → 2 non-mastered prerequisites added
    const c1 = stubChunk({ id: 'c1', prerequisitesJson: ['c2'] });
    const c2 = stubChunk({ id: 'c2', prerequisitesJson: ['c3'], repetitions: 0 });
    const c3 = stubChunk({ id: 'c3', prerequisitesJson: null, repetitions: 0 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      if (id === 'c1') return c1;
      if (id === 'c2') return c2;
      if (id === 'c3') return c3;
      return undefined;
    });

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.addedPrerequisites).toContain('c2');
    expect(result.addedPrerequisites).toContain('c3');
    expect(result.message).toContain('prerequisites');
  });

  it('pluralizes message when multiple missing prerequisites are skipped', async () => {
    const deps = stubDeps();
    // c1 depends on missing-a and missing-b
    const c1 = stubChunk({ id: 'c1', prerequisitesJson: ['missing-a', 'missing-b'] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      if (id === 'c1') return c1;
      return undefined;
    });

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.message).toContain('missing-a');
    expect(result.message).toContain('missing-b');
    expect(result.message).toContain('prerequisites');
  });

  it('falls back to original chunkIds on error', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db crash'));

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.resolvedChunkIds).toEqual(['c1']);
    expect(result.addedPrerequisites).toEqual([]);
  });

  it('handles chunk with undefined prerequisites gracefully', async () => {
    const deps = stubDeps();
    // Chunk with no prerequisites field at all → mapChunkRowToLearningItem returns prerequisites: []
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'c1', prerequisitesJson: null })
    );

    const result = await resolveSessionChunkDependencies(['c1'], deps);

    expect(result.resolvedChunkIds).toContain('c1');
    expect(result.addedPrerequisites).toEqual([]);
  });

  // ── Mastery filtering ──────────────────────────────────────────

  it('skips all mastered auto-added prerequisites', async () => {
    const deps = stubDeps();
    // target depends on p1, p2, p3 — all mastered (repetitions > 0)
    const target = stubChunk({
      id: 'target',
      prerequisitesJson: ['p1', 'p2', 'p3'],
      repetitions: 0,
    });
    const p1 = stubChunk({
      id: 'p1',
      title: 'Motivation',
      prerequisitesJson: null,
      repetitions: 3,
    });
    const p2 = stubChunk({ id: 'p2', title: 'Structure', prerequisitesJson: null, repetitions: 1 });
    const p3 = stubChunk({ id: 'p3', title: 'Syntax', prerequisitesJson: null, repetitions: 5 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      const map: Record<string, ReturnType<typeof stubChunk>> = { target, p1, p2, p3 };
      return map[id];
    });

    const result = await resolveSessionChunkDependencies(['target'], deps);

    expect(result.resolvedChunkIds).toEqual(['target']);
    expect(result.addedPrerequisites).toEqual([]);
    expect(result.skippedMasteredPrerequisites).toEqual(expect.arrayContaining(['p1', 'p2', 'p3']));
    expect(result.skippedMasteredPrerequisites).toHaveLength(3);
    expect(result.message).toContain('Skipped 3 mastered prerequisites');
    expect(result.message).toContain('Motivation');
    expect(result.message).toContain('Structure');
  });

  it('keeps non-mastered prereqs and skips mastered ones (mixed mastery)', async () => {
    const deps = stubDeps();
    // target depends on p1 (mastered) and p2 (not mastered)
    const target = stubChunk({ id: 'target', prerequisitesJson: ['p1', 'p2'], repetitions: 0 });
    const p1 = stubChunk({ id: 'p1', title: 'Mastered', prerequisitesJson: null, repetitions: 2 });
    const p2 = stubChunk({ id: 'p2', title: 'New', prerequisitesJson: null, repetitions: 0 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      const map: Record<string, ReturnType<typeof stubChunk>> = { target, p1, p2 };
      return map[id];
    });

    const result = await resolveSessionChunkDependencies(['target'], deps);

    expect(result.resolvedChunkIds).toContain('p2');
    expect(result.resolvedChunkIds).toContain('target');
    expect(result.resolvedChunkIds).not.toContain('p1');
    expect(result.addedPrerequisites).toEqual(['p2']);
    expect(result.skippedMasteredPrerequisites).toEqual(['p1']);
    expect(result.message).toContain('1 prerequisite');
    expect(result.message).toContain('Skipped 1 mastered prerequisite');
  });

  it('never skips explicitly requested mastered chunks', async () => {
    const deps = stubDeps();
    // Both target and p1 are explicitly requested; p1 is mastered
    const target = stubChunk({ id: 'target', prerequisitesJson: ['p1'], repetitions: 0 });
    const p1 = stubChunk({ id: 'p1', prerequisitesJson: null, repetitions: 5 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      const map: Record<string, ReturnType<typeof stubChunk>> = { target, p1 };
      return map[id];
    });

    const result = await resolveSessionChunkDependencies(['target', 'p1'], deps);

    // p1 is explicitly requested → not auto-added → not filtered
    expect(result.resolvedChunkIds).toContain('p1');
    expect(result.resolvedChunkIds).toContain('target');
    expect(result.addedPrerequisites).toEqual([]);
    expect(result.skippedMasteredPrerequisites).toEqual([]);
  });

  it('keeps explicitly requested mastered target chunk', async () => {
    const deps = stubDeps();
    // Target itself is mastered but explicitly requested → never skipped
    const target = stubChunk({ id: 'target', prerequisitesJson: null, repetitions: 10 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(target);

    const result = await resolveSessionChunkDependencies(['target'], deps);

    expect(result.resolvedChunkIds).toEqual(['target']);
    expect(result.skippedMasteredPrerequisites).toEqual([]);
  });

  it('preserves topo order among remaining chunks after mastered prereq is skipped', async () => {
    const deps = stubDeps();
    // target depends on p1 (mastered), p1 depends on p2 (non-mastered)
    // After skipping p1, p2 should still appear before target
    const target = stubChunk({ id: 'target', prerequisitesJson: ['p1'], repetitions: 0 });
    const p1 = stubChunk({ id: 'p1', prerequisitesJson: ['p2'], repetitions: 3 });
    const p2 = stubChunk({ id: 'p2', prerequisitesJson: null, repetitions: 0 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      const map: Record<string, ReturnType<typeof stubChunk>> = { target, p1, p2 };
      return map[id];
    });

    const result = await resolveSessionChunkDependencies(['target'], deps);

    expect(result.resolvedChunkIds).toContain('p2');
    expect(result.resolvedChunkIds).toContain('target');
    expect(result.resolvedChunkIds).not.toContain('p1');
    expect(result.resolvedChunkIds.indexOf('p2')).toBeLessThan(
      result.resolvedChunkIds.indexOf('target')
    );
    expect(result.skippedMasteredPrerequisites).toEqual(['p1']);
    expect(result.addedPrerequisites).toEqual(['p2']);
  });

  it('returns skippedMasteredPrerequisites: [] on all fallback paths', async () => {
    const deps = stubDeps();

    // Empty input
    const empty = await resolveSessionChunkDependencies([], deps);
    expect(empty.skippedMasteredPrerequisites).toEqual([]);

    // Error path
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db crash'));
    const errResult = await resolveSessionChunkDependencies(['c1'], deps);
    expect(errResult.skippedMasteredPrerequisites).toEqual([]);
  });

  it('returns estimatedDuration summing durations of resolved chunks including prerequisites', async () => {
    const deps = stubDeps();
    const target = stubChunk({
      id: 'target',
      prerequisitesJson: ['prereq'],
      estimatedDuration: 10,
      repetitions: 0,
    });
    const prereq = stubChunk({
      id: 'prereq',
      prerequisitesJson: null,
      estimatedDuration: 5,
      repetitions: 0,
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) => {
      if (id === 'target') return target;
      if (id === 'prereq') return prereq;
      return undefined;
    });

    const result = await resolveSessionChunkDependencies(['target'], deps);

    expect(result.resolvedChunkIds).toContain('target');
    expect(result.resolvedChunkIds).toContain('prereq');
    expect(result.estimatedDuration).toBe(15); // 10 + 5
  });

  it('returns estimatedDuration: 0 on empty input', async () => {
    const deps = stubDeps();
    const result = await resolveSessionChunkDependencies([], deps);
    expect(result.estimatedDuration).toBe(0);
  });

  it('returns estimatedDuration: 0 on error fallback', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db crash'));
    const result = await resolveSessionChunkDependencies(['c1'], deps);
    expect(result.estimatedDuration).toBe(0);
  });
});
