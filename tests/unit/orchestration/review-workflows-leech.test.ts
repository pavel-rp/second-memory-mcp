import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getLeeches, resolveLeech } from '../../../src/orchestration/review-workflows.js';
import type { LeechDeps } from '../../../src/orchestration/review-workflows.js';
import type { ChunkRepository, ChunkMinimalMetadata } from '../../../src/ports/chunk-repository.js';
import type { ReviewPersistencePort } from '../../../src/ports/review-persistence-port.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';

function makeMockDeps(overrides?: {
  batchFetchMinimal?: ChunkRepository['batchFetchMinimal'];
  getChunk?: ReviewPersistencePort['getChunk'];
  persistReviewUpdate?: ReviewPersistencePort['persistReviewUpdate'];
}): LeechDeps {
  return {
    chunks: {
      batchFetchMinimal: overrides?.batchFetchMinimal ?? vi.fn().mockResolvedValue([]),
    } as unknown as ChunkRepository,
    reviewPersistence: {
      getChunk: overrides?.getChunk ?? vi.fn().mockResolvedValue(undefined),
      persistReviewUpdate: overrides?.persistReviewUpdate ?? vi.fn().mockResolvedValue(1),
    } as unknown as ReviewPersistencePort,
  };
}

const NOW = 1_700_000_000_000;

function makeLeechChunk(overrides?: Partial<LearningChunk>): LearningChunk {
  return {
    id: 'chunk-leech-1',
    topicId: 'topic-1',
    title: 'Leech Item',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 1.3,
    repetitions: 8,
    lastReviewedAt: NOW - 86400000,
    estimatedDuration: 10,
    intervalDays: 1,
    chunkType: 'remediation',
    prerequisitesJson: null,
    tagsJson: null,
    content: null,
    contentVersion: null,
    contentUpdatedAt: null,
    createdAt: NOW - 86400000 * 30,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeMinimalMetadata(overrides?: Partial<ChunkMinimalMetadata>): ChunkMinimalMetadata {
  return {
    id: 'chunk-leech-1',
    title: 'Leech Item',
    subject: 'CS',
    difficulty: 5,
    chunkType: 'remediation',
    topicId: 'topic-1',
    nextReviewAt: NOW,
    easeFactor: 1.3,
    repetitions: 8,
    intervalDays: 1,
    lastReviewedAt: NOW - 86400000,
    prerequisitesJson: null,
    tagsJson: null,
    createdAt: NOW - 86400000 * 30,
    updatedAt: NOW,
    ...overrides,
  };
}

// ---------------------------------------------------------------
// getLeeches
// ---------------------------------------------------------------
describe('getLeeches', () => {
  it('delegates to batchFetchMinimal with isLeech: true', async () => {
    const mockFetch = vi.fn().mockResolvedValue([makeMinimalMetadata()]);
    const deps = makeMockDeps({ batchFetchMinimal: mockFetch });

    const result = await getLeeches({ subjectFilter: 'CS', limit: 10 }, deps);

    expect(mockFetch).toHaveBeenCalledWith({
      subject: 'CS',
      limit: 10,
      isLeech: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('chunk-leech-1');
  });

  it('passes undefined subject when no subjectFilter', async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const deps = makeMockDeps({ batchFetchMinimal: mockFetch });

    await getLeeches({}, deps);

    expect(mockFetch).toHaveBeenCalledWith({
      subject: undefined,
      limit: undefined,
      isLeech: true,
    });
  });

  it('returns empty array when no leeches', async () => {
    const deps = makeMockDeps({ batchFetchMinimal: vi.fn().mockResolvedValue([]) });
    const result = await getLeeches({}, deps);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------
// resolveLeech
// ---------------------------------------------------------------
describe('resolveLeech', () => {
  let deps: LeechDeps;
  let mockPersist: Mock<ReviewPersistencePort['persistReviewUpdate']>;

  beforeEach(() => {
    mockPersist = vi.fn<ReviewPersistencePort['persistReviewUpdate']>().mockResolvedValue(1);
    deps = makeMockDeps({
      getChunk: vi.fn().mockResolvedValue(makeLeechChunk()),
      persistReviewUpdate: mockPersist,
    });
  });

  // --- not found ---
  it('returns not_found when chunk does not exist', async () => {
    deps = makeMockDeps({ getChunk: vi.fn().mockResolvedValue(undefined) });
    const result = await resolveLeech('missing-id', 'reset_progress', deps);

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.type).toBe('not_found');
  });

  // --- not a leech ---
  it('returns validation error when chunk is not a leech', async () => {
    deps = makeMockDeps({
      getChunk: vi.fn().mockResolvedValue(makeLeechChunk({ chunkType: 'review' })),
    });
    const result = await resolveLeech('chunk-1', 'reset_progress', deps);

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.type).toBe('validation');
    expect(result.success === false && result.error.message).toContain('not a leech');
  });

  // --- reset_progress ---
  it('reset_progress resets SR fields and sets chunkType to review', async () => {
    const result = await resolveLeech('chunk-leech-1', 'reset_progress', deps);

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      chunkId: 'chunk-leech-1',
      resolution: 'reset_progress',
    });

    expect(mockPersist).toHaveBeenCalledWith(
      'chunk-leech-1',
      expect.objectContaining({
        easeFactor: 2.5,
        repetitions: 0,
        intervalDays: null,
        chunkType: 'review',
        lastReviewedAt: null,
      })
    );
    const updateArg = mockPersist.mock.calls[0][1];
    expect(updateArg.nextReviewAt).toBeTypeOf('number');
    expect(updateArg.updatedAt).toBeTypeOf('number');
  });

  // --- archive ---
  it('archive sets nextReviewAt ~100 years in the future', async () => {
    const result = await resolveLeech('chunk-leech-1', 'archive', deps);

    expect(result.success).toBe(true);
    expect(mockPersist).toHaveBeenCalledWith(
      'chunk-leech-1',
      expect.objectContaining({ chunkType: 'review' })
    );
    const updateArg = mockPersist.mock.calls[0][1];
    // ~100 years ≈ 3.15576e12 ms
    const hundredYearsMs = 100 * 365.25 * 24 * 60 * 60 * 1000;
    expect(updateArg.nextReviewAt).toBeGreaterThan(Date.now() + hundredYearsMs - 60_000);
  });

  // --- mark_reviewed ---
  it('mark_reviewed only clears chunkType without resetting SR fields', async () => {
    const result = await resolveLeech('chunk-leech-1', 'mark_reviewed', deps);

    expect(result.success).toBe(true);
    expect(mockPersist).toHaveBeenCalledWith(
      'chunk-leech-1',
      expect.objectContaining({ chunkType: 'review' })
    );
    const updateArg = mockPersist.mock.calls[0][1];
    // Should NOT have SR reset fields
    expect(updateArg.easeFactor).toBeUndefined();
    expect(updateArg.repetitions).toBeUndefined();
    expect(updateArg.intervalDays).toBeUndefined();
    expect(updateArg.nextReviewAt).toBeUndefined();
  });

  // --- zero rows updated ---
  it('returns database error when persistReviewUpdate affects 0 rows', async () => {
    deps = makeMockDeps({
      getChunk: vi.fn().mockResolvedValue(makeLeechChunk()),
      persistReviewUpdate: vi.fn().mockResolvedValue(0),
    });

    const result = await resolveLeech('chunk-leech-1', 'reset_progress', deps);

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.type).toBe('database');
    expect(result.success === false && result.error.message).toContain('0 rows');
  });

  // --- database error ---
  it('returns database error when persistReviewUpdate throws', async () => {
    deps = makeMockDeps({
      getChunk: vi.fn().mockResolvedValue(makeLeechChunk()),
      persistReviewUpdate: vi.fn().mockRejectedValue(new Error('deadlock')),
    });

    const result = await resolveLeech('chunk-leech-1', 'reset_progress', deps);

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.type).toBe('database');
    expect(result.success === false && result.error.message).toContain('deadlock');
  });

  it('returns database error when getChunk throws', async () => {
    deps = makeMockDeps({
      getChunk: vi.fn().mockRejectedValue(new Error('connection lost')),
    });

    const result = await resolveLeech('chunk-leech-1', 'archive', deps);

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.type).toBe('database');
    expect(result.success === false && result.error.message).toContain('connection lost');
  });
});
