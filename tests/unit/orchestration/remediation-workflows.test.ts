import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recommendRemediation,
  type RemediationDeps,
} from '../../../src/orchestration/remediation-workflows.js';
import {
  stubSessionRepository,
  stubChunkRepository,
  stubNotesRepository,
} from '../../helpers/stub-ports.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';
import type { LearningSession } from '../../../src/domain/types/entities.js';
import type { SessionInput } from '../../../src/domain/types/session.js';
import type { ChunkMinimalMetadata } from '../../../src/ports/chunk-repository.js';

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

vi.mock('../../../src/shared/logger.js', () => ({
  logEvent: vi.fn(),
  getRequestLogger: () => mockLogger,
}));

const NOW = new Date('2026-05-22T12:00:00Z');

function stubSession(overrides?: Partial<LearningSession>): LearningSession {
  return {
    id: 'sess-1',
    topicId: 'topic-1',
    chunkIds: ['c1', 'c2', 'c3'],
    mode: 'assessment',
    estimatedDuration: 30,
    status: 'completed',
    startTime: NOW.getTime() - 3600_000,
    endTime: NOW.getTime(),
    feedback: null,
    createdAt: NOW.getTime() - 3600_000,
    updatedAt: NOW.getTime(),
    ...overrides,
  };
}

function stubSessionInput(overrides?: Partial<SessionInput>): SessionInput {
  return {
    session_id: 'sess-1',
    mode: 'assessment',
    start_time: '2026-05-22T11:00:00Z',
    chunks: [
      {
        chunk_id: 'c1',
        session_chunk_id: 'sc1',
        title: 'Chunk 1',
        status: 'completed',
        attempts: [
          {
            timestamp: '2026-05-22T11:05:00Z',
            question: 'Q1',
            response: 'A1',
            passed: true,
            feedback: 'Good',
            quality: 4,
            time_spent_ms: 30000,
          },
        ],
        quality_scores: [4],
        time_spent_ms: 30000,
        ease_factor: 2.5,
        repetitions: 3,
        estimated_duration: 10,
        chunk_type: 'review',
      },
      {
        chunk_id: 'c2',
        session_chunk_id: 'sc2',
        title: 'Chunk 2',
        status: 'completed',
        attempts: [
          {
            timestamp: '2026-05-22T11:10:00Z',
            question: 'Q2',
            response: 'A2',
            passed: false,
            feedback: 'Wrong',
            quality: 1,
            time_spent_ms: 45000,
          },
        ],
        quality_scores: [1],
        time_spent_ms: 45000,
        ease_factor: 2.0,
        repetitions: 1,
        estimated_duration: 15,
        chunk_type: 'review',
      },
      {
        chunk_id: 'c3',
        session_chunk_id: 'sc3',
        title: 'Chunk 3',
        status: 'completed',
        attempts: [
          {
            timestamp: '2026-05-22T11:15:00Z',
            question: 'Q3',
            response: 'A3',
            passed: true,
            feedback: 'Good',
            quality: 5,
            time_spent_ms: 20000,
          },
        ],
        quality_scores: [5],
        time_spent_ms: 20000,
        ease_factor: 2.8,
        repetitions: 5,
        estimated_duration: 10,
        chunk_type: 'review',
      },
    ],
    ...overrides,
  };
}

function stubChunkMeta(overrides?: Partial<ChunkMinimalMetadata>): ChunkMinimalMetadata {
  return {
    orderIndex: 1,
    id: 'c1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    chunkType: 'review',
    topicId: 'topic-1',
    nextReviewAt: NOW.getTime(),
    easeFactor: 2.5,
    repetitions: 3,
    intervalDays: 7,
    lastReviewedAt: NOW.getTime() - 86400_000,
    prerequisitesJson: null,
    tagsJson: null,
    contentStatus: 'final',
    createdAt: NOW.getTime() - 86400_000 * 30,
    updatedAt: NOW.getTime(),
    ...overrides,
  };
}

function makeDeps(overrides?: {
  sessions?: Partial<RemediationDeps['sessions']>;
  chunks?: Partial<RemediationDeps['chunks']>;
  notes?: Partial<RemediationDeps['notes']>;
}): RemediationDeps {
  return {
    sessions: stubSessionRepository(overrides?.sessions),
    chunks: stubChunkRepository(overrides?.chunks),
    notes: stubNotesRepository(overrides?.notes),
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  };
}

describe('recommendRemediation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns database error when port throws unexpectedly', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockRejectedValue(new Error('connection reset')),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toContain('connection reset');
      expect(result.error.retryable).toBe(true);
    }
  });

  it('handles non-Error thrown values in catch block', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockRejectedValue('string error'),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toBe('string error');
    }
  });

  it('handles session with no chunks', async () => {
    const emptyInput = stubSessionInput({ chunks: [] });

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(emptyInput),
      },
      chunks: {
        list: vi.fn().mockResolvedValue([]),
        countByTopicIds: vi.fn().mockResolvedValue(new Map()),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weakChunks).toHaveLength(0);
      expect(result.data.recommendedNextSession.reasonCode).toBe('NEW_MATERIAL');
    }
  });

  it('returns not_found when session does not exist', async () => {
    const deps = makeDeps({
      sessions: { getSessionById: vi.fn().mockResolvedValue(null) },
    });

    const result = await recommendRemediation('no-such-session', deps, NOW);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
      expect(result.error.message).toContain('no-such-session');
    }
  });

  it('returns validation error when session is not completed', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession({ status: 'active' })),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
      expect(result.error.message).toContain('not completed');
    }
  });

  it('returns clean plan when all chunks passed', async () => {
    const cleanInput = stubSessionInput({
      chunks: [
        {
          chunk_id: 'c1',
          session_chunk_id: 'sc1',
          title: 'Chunk 1',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:05:00Z',
              question: 'Q',
              response: 'A',
              passed: true,
              feedback: 'Good',
              quality: 5,
              time_spent_ms: 20000,
            },
          ],
          quality_scores: [5],
          time_spent_ms: 20000,
          estimated_duration: 10,
        },
      ],
    });

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(cleanInput),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue([stubChunkMeta()]),
        list: vi.fn().mockResolvedValue([]),
        countByTopicIds: vi.fn().mockResolvedValue(new Map()),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weakChunks).toHaveLength(0);
      expect(result.data.recommendedNextSession.reasonCode).toBe('NEW_MATERIAL');
      expect(result.data.gapNotesWritten).toHaveLength(0);
    }
    expect(deps.notes.createNote).not.toHaveBeenCalled();
  });

  it('identifies directly-failed chunks with WEAK_AFTER_ASSESSMENT reason', async () => {
    const input = stubSessionInput();
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', easeFactor: 2.5, chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', easeFactor: 2.0, chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', easeFactor: 2.8, chunkType: 'review' }),
    ];

    let noteCounter = 0;
    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas),
      },
      notes: {
        createNote: vi.fn().mockImplementation(async () => {
          noteCounter++;
          return { id: `note-${noteCounter}`, createdAt: NOW.toISOString() };
        }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weakChunks).toHaveLength(1);
      expect(result.data.weakChunks[0].chunkId).toBe('c2');
      expect(result.data.weakChunks[0].reasonCode).toBe('WEAK_AFTER_ASSESSMENT');
      expect(result.data.weakChunks[0].leech).toBe(false);
      expect(result.data.gapNotesWritten).toHaveLength(1);
      expect(result.data.gapNotesWritten[0].chunkId).toBe('c2');
    }
  });

  it('identifies leeches with LEECH_THRESHOLD reason and sets mode to scaffolding', async () => {
    const input = stubSessionInput();
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'remediation', easeFactor: 1.5 }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas),
      },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      const leech = result.data.weakChunks.find(w => w.chunkId === 'c2');
      expect(leech).toBeDefined();
      expect(leech!.reasonCode).toBe('LEECH_THRESHOLD');
      expect(leech!.leech).toBe(true);
      expect(result.data.recommendedNextSession.mode).toBe('scaffolding');
    }
  });

  it('includes weak prerequisites with PREREQ_LOW_EASE reason', async () => {
    const input = stubSessionInput();
    const sessionChunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review', prerequisitesJson: ['prereq-1', 'prereq-2'] }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];
    const prereqMetas = [
      stubChunkMeta({ id: 'prereq-1', easeFactor: 1.8 }),
      stubChunkMeta({ id: 'prereq-2', easeFactor: 2.8 }),
    ];

    const batchFetchMinimal = vi
      .fn()
      .mockResolvedValueOnce(sessionChunkMetas)
      .mockResolvedValueOnce(prereqMetas);

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prerequisiteChunksToRevisit).toHaveLength(1);
      expect(result.data.prerequisiteChunksToRevisit[0].chunkId).toBe('prereq-1');
      expect(result.data.prerequisiteChunksToRevisit[0].reasonCode).toBe('PREREQ_LOW_EASE');
      expect(result.data.prerequisiteChunksToRevisit[0].easeFactor).toBe(1.8);
    }
  });

  it('excludes prerequisites with high ease factor', async () => {
    const input = stubSessionInput();
    const sessionChunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review', prerequisitesJson: ['prereq-strong'] }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];
    const prereqMetas = [stubChunkMeta({ id: 'prereq-strong', easeFactor: 2.8 })];

    const batchFetchMinimal = vi
      .fn()
      .mockResolvedValueOnce(sessionChunkMetas)
      .mockResolvedValueOnce(prereqMetas);

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prerequisiteChunksToRevisit).toHaveLength(0);
    }
  });

  it('computes SR schedule delta: demoted only for chunks with prior reps', async () => {
    const input = stubSessionInput({
      chunks: [
        {
          chunk_id: 'c1',
          session_chunk_id: 'sc1',
          title: 'Chunk 1',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:05:00Z',
              question: 'Q1',
              response: 'A1',
              passed: true,
              feedback: 'Good',
              quality: 4,
              time_spent_ms: 30000,
            },
          ],
          quality_scores: [4],
          time_spent_ms: 30000,
          repetitions: 3,
          estimated_duration: 10,
        },
        {
          chunk_id: 'c2',
          session_chunk_id: 'sc2',
          title: 'Chunk 2 (failed, has reps)',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:10:00Z',
              question: 'Q2',
              response: 'A2',
              passed: false,
              feedback: 'Wrong',
              quality: 1,
              time_spent_ms: 45000,
            },
          ],
          quality_scores: [1],
          time_spent_ms: 45000,
          repetitions: 2,
          estimated_duration: 15,
        },
        {
          chunk_id: 'c3',
          session_chunk_id: 'sc3',
          title: 'Chunk 3 (failed, new)',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:15:00Z',
              question: 'Q3',
              response: 'A3',
              passed: false,
              feedback: 'Wrong',
              quality: 1,
              time_spent_ms: 20000,
            },
          ],
          quality_scores: [1],
          time_spent_ms: 20000,
          repetitions: 0,
          estimated_duration: 10,
        },
      ],
    });
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas) },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.srScheduleDelta.chunksRescheduledSooner).toBe(2);
      expect(result.data.srScheduleDelta.chunksDemoted).toBe(1);
    }
  });

  it('logs remediation_plan_generated event', async () => {
    const { logEvent } = await import('../../../src/shared/logger.js');
    const input = stubSessionInput();
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas) },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    await recommendRemediation('sess-1', deps, NOW);

    expect(logEvent).toHaveBeenCalledWith(
      'recommendRemediation',
      'remediation_plan_generated',
      expect.objectContaining({ sessionId: 'sess-1' })
    );
  });

  it('writes gap notes only for directly-failed chunks', async () => {
    const input = stubSessionInput();
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    let noteCounter = 0;
    const createNote = vi.fn().mockImplementation(async () => {
      noteCounter++;
      return { id: `note-${noteCounter}`, createdAt: NOW.toISOString() };
    });

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas) },
      notes: { createNote },
    });

    await recommendRemediation('sess-1', deps, NOW);

    expect(createNote).toHaveBeenCalledTimes(1);
    expect(createNote).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: 'chunk',
        targetId: 'c2',
        noteType: 'gap',
        author: 'agent',
      })
    );
  });

  it('logs warning when gap note write fails', async () => {
    const input = stubSessionInput();
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas) },
      notes: {
        createNote: vi.fn().mockRejectedValue(new Error('DB write failed')),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gapNotesWritten).toHaveLength(0);
    }
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('gap note writes failed'));
  });

  it('sets mode to review when no leeches are present', async () => {
    const input = stubSessionInput();
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas) },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recommendedNextSession.mode).toBe('review');
    }
  });

  it('uses default duration when session chunk has no estimated_duration', async () => {
    const input = stubSessionInput({
      chunks: [
        {
          chunk_id: 'c1',
          session_chunk_id: 'sc1',
          title: 'Chunk 1',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:05:00Z',
              question: 'Q',
              response: 'A',
              passed: false,
              feedback: 'Wrong',
              quality: 1,
              time_spent_ms: 20000,
            },
          ],
          quality_scores: [1],
          time_spent_ms: 20000,
        },
      ],
    });

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue([stubChunkMeta({ id: 'c1' })]),
      },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recommendedNextSession.estimatedDurationMinutes).toBe(10);
    }
  });

  it('includes non-failed session leeches in weak chunks', async () => {
    const input = stubSessionInput({
      chunks: [
        {
          chunk_id: 'c1',
          session_chunk_id: 'sc1',
          title: 'Chunk 1',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:05:00Z',
              question: 'Q',
              response: 'A',
              passed: true,
              feedback: 'Good',
              quality: 4,
              time_spent_ms: 20000,
            },
          ],
          quality_scores: [4],
          time_spent_ms: 20000,
          estimated_duration: 10,
          chunk_type: 'remediation',
        },
        {
          chunk_id: 'c2',
          session_chunk_id: 'sc2',
          title: 'Chunk 2',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:10:00Z',
              question: 'Q2',
              response: 'A2',
              passed: false,
              feedback: 'Wrong',
              quality: 1,
              time_spent_ms: 30000,
            },
          ],
          quality_scores: [1],
          time_spent_ms: 30000,
          estimated_duration: 15,
          chunk_type: 'review',
        },
      ],
    });

    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'remediation', easeFactor: 1.4 }),
      stubChunkMeta({ id: 'c2', chunkType: 'review', easeFactor: 2.0 }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession({ chunkIds: ['c1', 'c2'] })),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: { batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas) },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weakChunks).toHaveLength(2);
      const leechEntry = result.data.weakChunks.find(w => w.chunkId === 'c1');
      expect(leechEntry).toBeDefined();
      expect(leechEntry!.reasonCode).toBe('LEECH_THRESHOLD');
      expect(leechEntry!.leech).toBe(true);
    }
  });

  it('returns not_found when convertSessionToSessionInput returns null', async () => {
    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(null),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
      expect(result.error.message).toContain('unavailable');
    }
  });

  it('returns new-material recommendation with due chunks when clean pass', async () => {
    const cleanInput = stubSessionInput({
      chunks: [
        {
          chunk_id: 'c1',
          session_chunk_id: 'sc1',
          title: 'Chunk 1',
          status: 'completed',
          attempts: [
            {
              timestamp: '2026-05-22T11:05:00Z',
              question: 'Q',
              response: 'A',
              passed: true,
              feedback: 'Good',
              quality: 5,
              time_spent_ms: 20000,
            },
          ],
          quality_scores: [5],
          time_spent_ms: 20000,
          estimated_duration: 10,
        },
      ],
    });

    const dueChunk = {
      ...stubChunkMeta({
        id: 'new-c1',
        topicId: 'topic-2',
        nextReviewAt: NOW.getTime() - 86400_000,
        lastReviewedAt: null,
      }),
      topicTitle: 'New Topic',
    };

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(cleanInput),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue([stubChunkMeta()]),
        list: vi.fn().mockResolvedValue([dueChunk]),
        countByTopicIds: vi.fn().mockResolvedValue(new Map([['topic-2', 5]])),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weakChunks).toHaveLength(0);
      expect(result.data.recommendedNextSession.reasonCode).toBe('NEW_MATERIAL');
      expect(result.data.recommendedNextSession.mode).toBe('learning');
      expect(result.data.recommendedNextSession.topicId).toBe('topic-2');
      expect(result.data.recommendedNextSession.chunkIds).toContain('new-c1');
    }
  });

  it('skips failed chunk when batchFetchMinimal does not return its metadata', async () => {
    const input = stubSessionInput();
    // Return metadata for c1 and c3 but NOT c2 (the failed chunk)
    const chunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(chunkMetas),
        list: vi.fn().mockResolvedValue([]),
        countByTopicIds: vi.fn().mockResolvedValue(new Map()),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      // c2 was failed but had no metadata — skipped
      expect(result.data.weakChunks).toHaveLength(0);
      expect(result.data.recommendedNextSession.reasonCode).toBe('NEW_MATERIAL');
    }
  });

  it('skips prerequisites that are already in the session', async () => {
    // c2 is failed, has prerequisite c1 which IS in the session
    const input = stubSessionInput();
    const sessionChunkMetas = [
      stubChunkMeta({ id: 'c1', chunkType: 'review' }),
      stubChunkMeta({ id: 'c2', chunkType: 'review', prerequisitesJson: ['c1'] }),
      stubChunkMeta({ id: 'c3', chunkType: 'review' }),
    ];

    const deps = makeDeps({
      sessions: {
        getSessionById: vi.fn().mockResolvedValue(stubSession()),
        convertSessionToSessionInput: vi.fn().mockResolvedValue(input),
      },
      chunks: {
        batchFetchMinimal: vi.fn().mockResolvedValue(sessionChunkMetas),
      },
      notes: {
        createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: NOW.toISOString() }),
      },
    });

    const result = await recommendRemediation('sess-1', deps, NOW);

    expect(result.success).toBe(true);
    if (result.success) {
      // c1 is a prereq of c2 but c1 is already in the session — should not appear in prerequisites
      expect(result.data.prerequisiteChunksToRevisit).toHaveLength(0);
      // batchFetchMinimal should only be called once (for session chunks, NOT for prereqs)
      expect(deps.chunks.batchFetchMinimal).toHaveBeenCalledTimes(1);
    }
  });
});
