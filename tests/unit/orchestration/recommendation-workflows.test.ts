import { describe, it, expect, vi } from 'vitest';
import {
  generateRecommendations,
  type RecommendationDeps,
} from '../../../src/orchestration/recommendation-workflows.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import { stubChunkRepository } from '../../helpers/stub-ports.js';

const NOW = new Date('2025-06-15T12:00:00Z');
const NOW_MS = NOW.getTime();
const MS_PER_DAY = 86_400_000;

function stubChunkRow(overrides?: Partial<ChunkWithTopicTitle>): ChunkWithTopicTitle {
  return {
    id: 'c1',
    topicId: 'topic-1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW_MS - MS_PER_DAY,
    easeFactor: 2.5,
    repetitions: 2,
    lastReviewedAt: NOW_MS - 2 * MS_PER_DAY,
    estimatedDuration: 10,
    intervalDays: 7,
    chunkType: 'review',
    contentStatus: 'final',
    condensedSummary: null,
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Content',
    contentVersion: 1,
    contentUpdatedAt: NOW_MS,
    createdAt: NOW_MS - 30 * MS_PER_DAY,
    updatedAt: NOW_MS,
    topicTitle: 'Test Topic',
    ...overrides,
  };
}

function makeDeps(
  overrides?: Partial<Parameters<typeof stubChunkRepository>[0]>
): RecommendationDeps {
  return {
    chunks: stubChunkRepository(overrides),
  };
}

describe('generateRecommendations', () => {
  it('returns empty when no due chunks exist', async () => {
    const deps = makeDeps({ list: vi.fn().mockResolvedValue([]) });
    const result = await generateRecommendations({}, deps, NOW);

    expect(result.recommendations).toEqual([]);
    expect(result.totalDueTopics).toBe(0);
    expect(result.totalDueChunks).toBe(0);
  });

  it('returns topic-level recommendations for due chunks', async () => {
    const dueChunks = [
      stubChunkRow({ id: 'c1', topicId: 'topic-1', topicTitle: 'Topic A' }),
      stubChunkRow({ id: 'c2', topicId: 'topic-1', topicTitle: 'Topic A' }),
      stubChunkRow({ id: 'c3', topicId: 'topic-2', topicTitle: 'Topic B' }),
    ];
    const topicCounts = new Map([
      ['topic-1', 3], // 3 total chunks in topic-1
      ['topic-2', 2], // 2 total chunks in topic-2
    ]);

    const deps = makeDeps({
      list: vi.fn().mockResolvedValue(dueChunks),
      countByTopicIds: vi.fn().mockResolvedValue(topicCounts),
    });

    const result = await generateRecommendations({}, deps, NOW);

    expect(result.recommendations).toHaveLength(2);
    expect(result.totalDueTopics).toBe(2);
    expect(result.totalDueChunks).toBe(3);

    const topicA = result.recommendations.find(r => r.topicId === 'topic-1')!;
    expect(topicA.dueChunkCount).toBe(2);
    expect(topicA.totalChunkCount).toBe(3); // 3 chunks in topic-1
  });

  it('passes subject_filter to list query', async () => {
    const deps = makeDeps({ list: vi.fn().mockResolvedValue([]) });
    await generateRecommendations({ subjectFilter: 'Math' }, deps, NOW);

    expect(deps.chunks.list).toHaveBeenCalledWith(
      expect.objectContaining({ subjectFilter: 'Math' })
    );
  });

  it('excludes drafts and leeches from due chunk query', async () => {
    const deps = makeDeps({ list: vi.fn().mockResolvedValue([]) });
    await generateRecommendations({}, deps, NOW);

    expect(deps.chunks.list).toHaveBeenCalledWith(
      expect.objectContaining({
        dueOnly: true,
        isLeech: false,
        excludeDraft: true,
      })
    );
  });

  it('respects limit parameter', async () => {
    const chunks = Array.from({ length: 5 }, (_, i) =>
      stubChunkRow({ id: `c${i}`, topicId: `topic-${i}`, topicTitle: `Topic ${i}` })
    );
    const deps = makeDeps({
      list: vi.fn().mockResolvedValue(chunks),
      countByTopicIds: vi.fn().mockResolvedValue(new Map()),
    });

    const result = await generateRecommendations({ limit: 2 }, deps, NOW);

    expect(result.recommendations).toHaveLength(2);
    expect(result.totalDueTopics).toBe(5); // total still counts all
  });

  it('falls back to chunk title when topicTitle is null', async () => {
    const chunks = [
      stubChunkRow({ id: 'c1', topicId: 'topic-1', topicTitle: null, title: 'Fallback Title' }),
    ];
    const deps = makeDeps({
      list: vi.fn().mockResolvedValue(chunks),
      countByTopicIds: vi.fn().mockResolvedValue(new Map([['topic-1', 1]])),
    });

    const result = await generateRecommendations({}, deps, NOW);

    expect(result.recommendations[0]!.topicTitle).toBe('Fallback Title');
  });
});
