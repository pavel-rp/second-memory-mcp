import { describe, it, expect, vi } from 'vitest';
import {
  listChunksAsLearningItems,
  listChunksWithContent,
  getChunkContent,
  getChunkWithContent,
  batchFetchChunksMinimal,
  batchFetchTopicsMinimal,
  getTopicSummary,
  type QueryDeps,
} from '../../../src/orchestration/query-workflows.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';
import { stubChunkRepository, stubTopicRepository } from '../../helpers/stub-ports.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function stubChunkRow(
  overrides?: Partial<LearningChunk & { topicTitle?: string | null }>
): ChunkWithTopicTitle {
  return {
    id: 'c1',
    topicId: 'topic-1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 2,
    lastReviewedAt: NOW - 86_400_000,
    estimatedDuration: 10,
    intervalDays: 7,
    chunkType: 'review',
    contentStatus: 'final',
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Some content',
    contentVersion: 1,
    contentUpdatedAt: NOW,
    createdAt: NOW - 1_000_000,
    updatedAt: NOW,
    topicTitle: 'Test Topic',
    ...overrides,
  };
}

function stubDeps(): QueryDeps {
  return {
    chunks: stubChunkRepository({
      list: vi.fn().mockResolvedValue([stubChunkRow()]),
      listWithContent: vi.fn().mockResolvedValue({
        items: [],
        pagination: { total: 0, limit: 20, offset: 0, has_more: false },
      }),
      getContent: vi
        .fn()
        .mockResolvedValue({ id: 'c1', content: 'text', contentVersion: 1, contentUpdatedAt: NOW }),
      getWithContent: vi.fn().mockResolvedValue(stubChunkRow()),
      batchFetchMinimal: vi.fn().mockResolvedValue([]),
    }),
    topics: stubTopicRepository({
      batchFetchMinimal: vi.fn().mockResolvedValue([]),
      getSummaryById: vi.fn().mockResolvedValue(undefined),
    }),
  };
}

// ── listChunksAsLearningItems ───────────────────────────────────

describe('listChunksAsLearningItems', () => {
  it('maps chunk rows to learning items', async () => {
    const deps = stubDeps();

    const result = await listChunksAsLearningItems(undefined, deps);

    expect(deps.chunks.list).toHaveBeenCalledWith(undefined);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
    expect(result[0].title).toBe('Chunk 1');
    expect(result[0].chunkType).toBe('review');
  });

  it('passes filter through to chunks.list', async () => {
    const deps = stubDeps();
    const filter = { subjectFilter: 'Math', dueOnly: true, limit: 10 };

    await listChunksAsLearningItems(filter, deps);

    expect(deps.chunks.list).toHaveBeenCalledWith(filter);
  });

  it('returns empty array when no chunks found', async () => {
    const deps = stubDeps();
    (deps.chunks.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await listChunksAsLearningItems(undefined, deps);

    expect(result).toEqual([]);
  });
});

// ── listChunksWithContent ───────────────────────────────────────

describe('listChunksWithContent', () => {
  it('delegates to chunks.listWithContent', async () => {
    const deps = stubDeps();

    const result = await listChunksWithContent(undefined, deps);

    expect(deps.chunks.listWithContent).toHaveBeenCalledWith(undefined);
    expect(result.pagination).toBeDefined();
  });

  it('passes filter through', async () => {
    const deps = stubDeps();
    const filter = { subjectFilter: 'CS', limit: 5, offset: 10 };

    await listChunksWithContent(filter, deps);

    expect(deps.chunks.listWithContent).toHaveBeenCalledWith(filter);
  });
});

// ── getChunkContent ─────────────────────────────────────────────

describe('getChunkContent', () => {
  it('delegates to chunks.getContent', async () => {
    const deps = stubDeps();

    const result = await getChunkContent('c1', deps);

    expect(deps.chunks.getContent).toHaveBeenCalledWith('c1');
    expect(result?.id).toBe('c1');
    expect(result?.content).toBe('text');
  });

  it('returns null when chunk not found', async () => {
    const deps = stubDeps();
    (deps.chunks.getContent as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await getChunkContent('missing', deps);

    expect(result).toBeNull();
  });
});

// ── getChunkWithContent ─────────────────────────────────────────

describe('getChunkWithContent', () => {
  it('delegates to chunks.getWithContent', async () => {
    const deps = stubDeps();

    const result = await getChunkWithContent('c1', deps);

    expect(deps.chunks.getWithContent).toHaveBeenCalledWith('c1');
    expect(result?.id).toBe('c1');
  });

  it('returns null when chunk not found', async () => {
    const deps = stubDeps();
    (deps.chunks.getWithContent as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await getChunkWithContent('missing', deps);

    expect(result).toBeNull();
  });
});

// ── batchFetchChunksMinimal ─────────────────────────────────────

describe('batchFetchChunksMinimal', () => {
  it('delegates to chunks.batchFetchMinimal', async () => {
    const deps = stubDeps();

    await batchFetchChunksMinimal(undefined, deps);

    expect(deps.chunks.batchFetchMinimal).toHaveBeenCalledWith(undefined);
  });

  it('passes options through', async () => {
    const deps = stubDeps();
    const options = { topicId: 't1', dueOnly: true, limit: 5 };

    await batchFetchChunksMinimal(options, deps);

    expect(deps.chunks.batchFetchMinimal).toHaveBeenCalledWith(options);
  });
});

// ── batchFetchTopicsMinimal ─────────────────────────────────────

describe('batchFetchTopicsMinimal', () => {
  it('delegates to topics.batchFetchMinimal', async () => {
    const deps = stubDeps();

    await batchFetchTopicsMinimal(undefined, deps);

    expect(deps.topics.batchFetchMinimal).toHaveBeenCalledWith(undefined);
  });

  it('passes options through', async () => {
    const deps = stubDeps();
    const options = { subject: 'Math', limit: 10 };

    await batchFetchTopicsMinimal(options, deps);

    expect(deps.topics.batchFetchMinimal).toHaveBeenCalledWith(options);
  });
});

// ── getTopicSummary ─────────────────────────────────────────────

describe('getTopicSummary', () => {
  it('delegates to topics.getSummaryById', async () => {
    const deps = stubDeps();

    await getTopicSummary('topic-1', deps);

    expect(deps.topics.getSummaryById).toHaveBeenCalledWith('topic-1');
  });

  it('returns undefined when topic not found', async () => {
    const deps = stubDeps();

    const result = await getTopicSummary('missing', deps);

    expect(result).toBeUndefined();
  });
});
