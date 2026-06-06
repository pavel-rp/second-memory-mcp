import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: vi.fn(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })),
  logEvent: vi.fn(),
}));

import {
  reorderChunks,
  createChunkWithTopic,
  type ChunkDeps,
} from '../../../src/orchestration/chunk-workflows.js';
import {
  stubChunkRepository,
  stubTopicRepository,
  stubSessionRepository,
  stubUnitOfWork,
} from '../../helpers/stub-ports.js';
import type { ChunkMinimalMetadata } from '../../../src/ports/chunk-repository.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';

const NOW = 1_700_000_000_000;

function makeMeta(
  id: string,
  orderIndex: number,
  prerequisites: string[] = []
): ChunkMinimalMetadata {
  return {
    id,
    title: id,
    subject: 'CS',
    difficulty: 5,
    chunkType: 'new',
    topicId: 'topic-1',
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 0,
    intervalDays: null,
    lastReviewedAt: null,
    prerequisitesJson: prerequisites.length > 0 ? prerequisites : null,
    tagsJson: null,
    contentStatus: 'final',
    orderIndex,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function makeChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'new-chunk',
    topicId: 'topic-1',
    title: 'New',
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
    prerequisitesJson: null,
    tagsJson: null,
    content: 'content',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    contentStatus: 'final',
    condensedSummary: null,
    knowledgeType: null,
    orderIndex: 1,
    validatorReport: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe('reorderChunks', () => {
  function makeDeps(topicChunks: ChunkMinimalMetadata[]) {
    const txUpdate = vi.fn().mockResolvedValue(1);
    const txPorts = {
      chunks: stubChunkRepository({ update: txUpdate }),
      topics: stubTopicRepository(),
      sessions: stubSessionRepository(),
    };
    const deps: ChunkDeps = {
      chunks: stubChunkRepository({
        batchFetchMinimal: vi.fn().mockResolvedValue(topicChunks),
      }),
      topics: stubTopicRepository(),
      unitOfWork: stubUnitOfWork(undefined, txPorts),
      maxDependencyDepth: 5,
    };
    return { deps, txUpdate };
  }

  it('persists a valid reorder as order_index 1..N', async () => {
    const { deps, txUpdate } = makeDeps([makeMeta('a', 1), makeMeta('b', 2), makeMeta('c', 3)]);

    const result = await reorderChunks('topic-1', ['c', 'a', 'b'], deps);

    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(result.orderedChunkIds).toEqual(['c', 'a', 'b']);
    expect(txUpdate).toHaveBeenCalledTimes(3);
    expect(txUpdate).toHaveBeenNthCalledWith(1, 'c', {
      orderIndex: 1,
      updatedAt: expect.any(Number),
    });
    expect(txUpdate).toHaveBeenNthCalledWith(2, 'a', {
      orderIndex: 2,
      updatedAt: expect.any(Number),
    });
    expect(txUpdate).toHaveBeenNthCalledWith(3, 'b', {
      orderIndex: 3,
      updatedAt: expect.any(Number),
    });
  });

  it('touches only order_index and updatedAt (never spaced-repetition state)', async () => {
    const { deps, txUpdate } = makeDeps([makeMeta('a', 1), makeMeta('b', 2)]);

    await reorderChunks('topic-1', ['b', 'a'], deps);

    for (const call of txUpdate.mock.calls) {
      expect(Object.keys(call[1]).sort()).toEqual(['orderIndex', 'updatedAt']);
    }
  });

  it('rejects an incomplete set with content_quality + findings and mutates nothing', async () => {
    const { deps, txUpdate } = makeDeps([makeMeta('a', 1), makeMeta('b', 2), makeMeta('c', 3)]);

    const result = await reorderChunks('topic-1', ['a', 'b'], deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect((result.error?.findings as unknown[]).length).toBeGreaterThan(0);
    expect(result.error?.retryable).toBe(true);
    expect(txUpdate).not.toHaveBeenCalled();
  });

  it('rejects an order that violates a prerequisite and mutates nothing', async () => {
    const { deps, txUpdate } = makeDeps([makeMeta('a', 1), makeMeta('b', 2, ['a'])]);

    const result = await reorderChunks('topic-1', ['b', 'a'], deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(
      (result.error?.findings as Array<{ rule: string }>).some(
        f => f.rule === 'order.prerequisite_violation'
      )
    ).toBe(true);
    expect(txUpdate).not.toHaveBeenCalled();
  });

  it('returns not_found when the topic has no chunks', async () => {
    const { deps } = makeDeps([]);
    const result = await reorderChunks('topic-x', ['a'], deps);
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });

  it('rolls back (database error) if a chunk disappears mid-transaction', async () => {
    const txUpdate = vi.fn().mockResolvedValue(0); // concurrent delete → 0 rows
    const txPorts = {
      chunks: stubChunkRepository({ update: txUpdate }),
      topics: stubTopicRepository(),
      sessions: stubSessionRepository(),
    };
    const deps: ChunkDeps = {
      chunks: stubChunkRepository({
        batchFetchMinimal: vi.fn().mockResolvedValue([makeMeta('a', 1), makeMeta('b', 2)]),
      }),
      topics: stubTopicRepository(),
      unitOfWork: stubUnitOfWork(undefined, txPorts),
      maxDependencyDepth: 5,
    };

    const result = await reorderChunks('topic-1', ['a', 'b'], deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
    expect(result.error?.retryable).toBe(true);
  });
});

describe('createChunkWithTopic order placement', () => {
  function makeDeps(opts: {
    existing?: ChunkMinimalMetadata[];
    maxOrder?: number;
    created?: LearningChunk;
  }) {
    const shift = vi.fn().mockResolvedValue(1);
    const create = vi.fn().mockResolvedValue(undefined);
    const deps: ChunkDeps = {
      chunks: stubChunkRepository({
        batchFetchMinimal: vi.fn().mockResolvedValue(opts.existing ?? []),
        getMaxOrderIndex: vi.fn().mockResolvedValue(opts.maxOrder ?? 0),
        shiftOrderIndexesAtOrAbove: shift,
        create,
        getById: vi.fn().mockResolvedValue(opts.created ?? makeChunk()),
      }),
      topics: stubTopicRepository({
        getById: vi
          .fn()
          .mockResolvedValue({ id: 'topic-1', title: 'T', subject: 'CS', summary: null }),
      }),
      unitOfWork: stubUnitOfWork(),
      maxDependencyDepth: 5,
      // no linterRules / classifier → audit chain skipped
    };
    return { deps, shift, create };
  }

  const baseInput = {
    id: 'new-chunk',
    topicId: 'topic-1',
    title: 'New',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 0,
    estimatedDuration: 10,
    chunkType: 'new' as const,
    content: 'content',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    contentStatus: 'final' as const,
    createdAt: NOW,
    updatedAt: NOW,
  };

  it('appends at max+1 when no order is given', async () => {
    const { deps, create, shift } = makeDeps({ maxOrder: 3 });
    const result = await createChunkWithTopic({ ...baseInput }, deps);
    expect(result.success).toBe(true);
    expect(shift).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ orderIndex: 4 }));
  });

  it('inserts at the requested position and shifts peers', async () => {
    const { deps, create, shift } = makeDeps({
      existing: [makeMeta('a', 1), makeMeta('b', 2), makeMeta('c', 3)],
    });
    const result = await createChunkWithTopic({ ...baseInput, order: 2 }, deps);
    expect(result.success).toBe(true);
    expect(shift).toHaveBeenCalledWith('topic-1', 2, expect.any(Number));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ orderIndex: 2 }));
  });

  it('clamps an out-of-range order to the end (append, no shift)', async () => {
    const { deps, create, shift } = makeDeps({
      existing: [makeMeta('a', 1), makeMeta('b', 2), makeMeta('c', 3)],
    });
    const result = await createChunkWithTopic({ ...baseInput, order: 99 }, deps);
    expect(result.success).toBe(true);
    expect(shift).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ orderIndex: 4 }));
  });

  it('rejects when the requested order is at or before a prerequisite', async () => {
    const { deps, create, shift } = makeDeps({
      existing: [makeMeta('p', 1), makeMeta('q', 2)],
    });
    const result = await createChunkWithTopic(
      { ...baseInput, order: 1, prerequisitesJson: ['p'] },
      deps
    );
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.type).toBe('content_quality');
    expect(create).not.toHaveBeenCalled();
    expect(shift).not.toHaveBeenCalled();
  });
});
