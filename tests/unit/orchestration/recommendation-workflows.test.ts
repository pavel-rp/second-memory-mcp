import { describe, it, expect, vi } from 'vitest';
import {
  generateRecommendations,
  type RecommendationDeps,
} from '../../../src/orchestration/recommendation-workflows.js';
import type { ChunkRepository, ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';
import type { PrerequisiteMasteryPort } from '../../../src/ports/prerequisite-mastery-port.js';
import type { ChunkIdLookupPort } from '../../../src/ports/chunk-id-lookup-port.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';
import type {
  LearningItem,
  RecommendationInput,
} from '../../../src/domain/types/recommendations.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = new Date('2025-06-15T12:00:00Z');
const NOW_MS = NOW.getTime();

function stubChunkRow(
  overrides?: Partial<LearningChunk & { topicTitle?: string | null }>
): ChunkWithTopicTitle {
  return {
    id: 'c1',
    topicId: 'topic-1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW_MS - 86_400_000, // overdue
    easeFactor: 2.5,
    repetitions: 2,
    lastReviewedAt: NOW_MS - 172_800_000,
    estimatedDuration: 10,
    intervalDays: 7,
    chunkType: 'review',
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Content',
    contentVersion: 1,
    contentUpdatedAt: NOW_MS,
    createdAt: NOW_MS - 1_000_000,
    updatedAt: NOW_MS,
    topicTitle: 'Test Topic',
    ...overrides,
  };
}

function stubItem(overrides?: Partial<LearningItem>): LearningItem {
  return {
    id: 'c1',
    title: 'Chunk 1',
    subject: 'CS',
    difficulty: 5,
    nextReviewDate: '2025-06-14',
    easeFactor: 2.5,
    repetitions: 2,
    estimatedDuration: 10,
    chunkType: 'review',
    ...overrides,
  };
}

function stubDeps(): RecommendationDeps {
  return {
    chunks: {
      list: vi.fn().mockResolvedValue([stubChunkRow()]),
      getWithContent: vi.fn().mockResolvedValue(stubChunkRow()),
    } as unknown as ChunkRepository,
    mastery: {
      checkItemMastery: vi.fn().mockResolvedValue({ isMastered: true }),
      checkMultipleItemsMastery: vi.fn().mockResolvedValue(new Map()),
    } as unknown as PrerequisiteMasteryPort,
    chunkIdLookup: {
      getExistingIdsByIds: vi.fn().mockResolvedValue(new Set<string>()),
      getAllIds: vi.fn().mockResolvedValue(new Set<string>()),
    } as unknown as ChunkIdLookupPort,
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  };
}

// ── generateRecommendations ─────────────────────────────────────

describe('generateRecommendations', () => {
  it('uses provided learning items when available', async () => {
    const deps = stubDeps();
    const items = [stubItem()];
    const input: RecommendationInput = {
      mode: 'guided',
      learningItems: items,
    };

    const result = await generateRecommendations(input, deps, NOW);

    // Should NOT fetch from DB since items were provided
    expect(deps.chunks.list).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.recommendations).toBeDefined();
  });

  it('fetches items from DB when learningItems is empty', async () => {
    const deps = stubDeps();
    const input: RecommendationInput = {
      mode: 'guided',
      learningItems: [],
    };

    const result = await generateRecommendations(input, deps, NOW);

    expect(deps.chunks.list).toHaveBeenCalledWith(
      expect.objectContaining({ dueOnly: true, limit: 50 })
    );
    expect(result).toBeDefined();
  });

  it('fetches items from DB when learningItems is undefined', async () => {
    const deps = stubDeps();
    const input: RecommendationInput = {
      mode: 'guided',
    };

    const result = await generateRecommendations(input, deps, NOW);

    expect(deps.chunks.list).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('passes subjectFilter to DB query', async () => {
    const deps = stubDeps();
    const input: RecommendationInput = {
      mode: 'guided',
      learningItems: [],
      subjectFilter: 'Math',
    };

    await generateRecommendations(input, deps, NOW);

    expect(deps.chunks.list).toHaveBeenCalledWith(
      expect.objectContaining({ subjectFilter: 'Math' })
    );
  });

  it('respects dueOnly=false in input', async () => {
    const deps = stubDeps();
    const input: RecommendationInput = {
      mode: 'guided',
      learningItems: [],
      dueOnly: false,
    };

    await generateRecommendations(input, deps, NOW);

    expect(deps.chunks.list).toHaveBeenCalledWith(expect.objectContaining({ dueOnly: false }));
  });

  it('chunkLookupFn delegates to chunks.getWithContent', async () => {
    const deps = stubDeps();
    const items = [stubItem({ id: 'c1', prerequisites: ['c2'] })];
    const prereqRow = stubChunkRow({ id: 'c2' });
    (deps.chunks.getWithContent as ReturnType<typeof vi.fn>).mockResolvedValue(prereqRow);
    (deps.chunkIdLookup.getExistingIdsByIds as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Set(['c2'])
    );
    const input: RecommendationInput = {
      mode: 'guided',
      learningItems: items,
    };

    // This exercises the chunkLookupFn path inside the RecommendationEngine
    const result = await generateRecommendations(input, deps, NOW);

    expect(result).toBeDefined();
    // Verify that the recommendation engine delegated prerequisite resolution
    expect(deps.chunkIdLookup.getExistingIdsByIds).toHaveBeenCalled();
    expect(deps.chunks.getWithContent).toHaveBeenCalled();
  });
});
