import { describe, it, expect, vi } from 'vitest';
import {
  updateChunkContent,
  updateChunkContentWithAutoReset,
  updateChunkMetadata,
  updateChunkWithProgressReset,
  deleteChunk,
  createChunkWithTopic,
  type ChunkDeps,
} from '../../../src/orchestration/chunk-workflows.js';
import type { ChunkRepository } from '../../../src/ports/chunk-repository.js';
import type { TopicRepository } from '../../../src/ports/topic-repository.js';
import type { UnitOfWorkPort, TransactionPorts } from '../../../src/ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';
import type { LearningChunk, NewLearningChunk } from '../../../src/domain/types/entities.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function stubChunk(overrides?: Partial<LearningChunk>): LearningChunk {
  return {
    id: 'chunk-1',
    topicId: 'topic-1',
    title: 'Test Chunk',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 3,
    lastReviewedAt: NOW - 86_400_000,
    estimatedDuration: 15,
    intervalDays: 7,
    chunkType: 'review',
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Original content here for testing',
    contentVersion: 2,
    contentUpdatedAt: NOW - 100_000,
    createdAt: NOW - 1_000_000,
    updatedAt: NOW - 100_000,
    ...overrides,
  };
}

function stubDeps(options?: { embedding?: EmbeddingPort }): ChunkDeps {
  const txPorts: TransactionPorts = {
    chunks: {
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(1),
    } as unknown as ChunkRepository,
    topics: {} as unknown as TopicRepository,
    sessions: {} as any,
  };
  return {
    chunks: {
      getById: vi.fn().mockResolvedValue(stubChunk()),
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue(undefined),
      saveContentEmbedding: vi.fn().mockResolvedValue(1),
      findDependents: vi.fn().mockResolvedValue([]),
    } as unknown as ChunkRepository,
    topics: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(undefined),
    } as unknown as TopicRepository,
    unitOfWork: {
      execute: vi.fn(async (cb: (ports: TransactionPorts) => Promise<unknown>) => cb(txPorts)),
    } as unknown as UnitOfWorkPort,
    maxDependencyDepth: 5,
    ...(options?.embedding ? { embedding: options.embedding } : {}),
  };
}

// ── updateChunkContent ──────────────────────────────────────────

describe('updateChunkContent', () => {
  it('updates content and increments version on happy path', async () => {
    const deps = stubDeps();
    const updated = stubChunk({ content: 'New content', contentVersion: 3 });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk()) // current
      .mockResolvedValueOnce(updated); // after update

    const result = await updateChunkContent('chunk-1', { content: 'New content' }, deps);

    expect(result.success).toBe(true);
    expect(result.chunk?.content).toBe('New content');
    expect(result.progressReset).toBe(false);
    // Stale embedding cleared before update
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledWith('chunk-1', null);
  });

  it('returns not_found when chunk does not exist', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await updateChunkContent('missing', { content: 'x' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });

  it('resets progress when resetProgress is true', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ repetitions: 0, easeFactor: 2.5 }));

    const result = await updateChunkContent(
      'chunk-1',
      { content: 'New', resetProgress: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ repetitions: 0, easeFactor: 2.5 })
    );
  });

  it('re-embeds content when embedding port is present', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ content: 'New' }));

    const result = await updateChunkContent('chunk-1', { content: 'New' }, deps);

    expect(result.success).toBe(true);
    // Cleared stale, then saved new
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledWith('chunk-1', null);
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledWith('chunk-1', [0.1, 0.2]);
  });

  it('succeeds when embedding generation fails (fail-open)', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockRejectedValue(new Error('provider down')),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ content: 'New' }));

    const result = await updateChunkContent('chunk-1', { content: 'New' }, deps);

    expect(result.success).toBe(true);
  });

  it('skips saveContentEmbedding when embedText returns null', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue(null),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ content: 'New' }));

    const result = await updateChunkContent('chunk-1', { content: 'New' }, deps);

    expect(result.success).toBe(true);
    // Called once with null (stale clear), never with a vector
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledWith('chunk-1', null);
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledTimes(1);
  });

  it('returns database error when update returns 0 rows', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(stubChunk());
    (deps.chunks.update as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const result = await updateChunkContent('chunk-1', { content: 'New' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
  });

  it('returns database error when getById throws', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db crash'));

    const result = await updateChunkContent('chunk-1', { content: 'New' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
  });
});

// ── updateChunkContentWithAutoReset ─────────────────────────────

describe('updateChunkContentWithAutoReset', () => {
  it('resets progress when content changes significantly', async () => {
    const deps = stubDeps();
    const current = stubChunk({ content: 'Completely different original content for this chunk' });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(
        stubChunk({ content: 'Brand new totally rewritten content here', repetitions: 0 })
      );

    const result = await updateChunkContentWithAutoReset(
      'chunk-1',
      { content: 'Brand new totally rewritten content here' },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ repetitions: 0, easeFactor: 2.5 })
    );
  });

  it('does not reset when content change is minor', async () => {
    const deps = stubDeps();
    const current = stubChunk({ content: 'Original content here for testing' });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(stubChunk({ content: 'Original content here for testing.' }));

    const result = await updateChunkContentWithAutoReset(
      'chunk-1',
      { content: 'Original content here for testing.' },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(false);
  });

  it('does not reset when current content is null', async () => {
    const deps = stubDeps();
    const current = stubChunk({ content: null });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(stubChunk({ content: 'New content' }));

    const result = await updateChunkContentWithAutoReset(
      'chunk-1',
      { content: 'New content' },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(false);
  });
});

// ── updateChunkMetadata ─────────────────────────────────────────

describe('updateChunkMetadata', () => {
  it('updates title only', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ title: 'New Title' }));

    const result = await updateChunkMetadata('chunk-1', { title: 'New Title' }, deps);

    expect(result.success).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ title: 'New Title' })
    );
  });

  it('updates multiple metadata fields at once', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ difficulty: 8, tagsJson: ['math'] }));

    const result = await updateChunkMetadata(
      'chunk-1',
      { difficulty: 8, tags: ['math'], prerequisites: ['prereq-1'] },
      deps
    );

    expect(result.success).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({
        difficulty: 8,
        tagsJson: ['math'],
        prerequisitesJson: ['prereq-1'],
      })
    );
  });

  it('updates estimatedDuration', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ estimatedDuration: 30 }));

    const result = await updateChunkMetadata('chunk-1', { estimatedDuration: 30 }, deps);

    expect(result.success).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ estimatedDuration: 30 })
    );
  });
});

// ── updateChunkWithProgressReset ────────────────────────────────

describe('updateChunkWithProgressReset', () => {
  it('resets progress when forceReset is true', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ repetitions: 0 }));

    const result = await updateChunkWithProgressReset(
      'chunk-1',
      { title: 'Same title', forceReset: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ repetitions: 0, easeFactor: 2.5 })
    );
  });

  it('auto-detects significant content change and resets', async () => {
    const deps = stubDeps();
    const current = stubChunk({ content: 'Completely different original content for this chunk' });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(stubChunk({ repetitions: 0 }));

    const result = await updateChunkWithProgressReset(
      'chunk-1',
      { content: 'Brand new totally rewritten content here' },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(true);
  });

  it('does not reset when content change is minor and no forceReset', async () => {
    const deps = stubDeps();
    const current = stubChunk({ content: 'Original content here for testing' });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(stubChunk());

    const result = await updateChunkWithProgressReset(
      'chunk-1',
      { content: 'Original content here for testing.' },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.progressReset).toBe(false);
  });

  it('updates metadata fields alongside content', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk());

    const result = await updateChunkWithProgressReset(
      'chunk-1',
      { title: 'New', difficulty: 7, tags: ['a'], prerequisites: ['b'], estimatedDuration: 20 },
      deps
    );

    expect(result.success).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({
        title: 'New',
        difficulty: 7,
        tagsJson: ['a'],
        prerequisitesJson: ['b'],
        estimatedDuration: 20,
      })
    );
  });
});

// ── deleteChunk ─────────────────────────────────────────────────

describe('deleteChunk', () => {
  it('deletes chunk with no dependents', async () => {
    const deps = stubDeps();
    (deps.chunks.findDependents as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await deleteChunk('chunk-1', deps);

    expect(result.success).toBe(true);
    expect(result.chunk?.id).toBe('chunk-1');
    expect(result.removedDependencies).toEqual([]);
  });

  it('cleans up prerequisites from dependent chunks', async () => {
    const deps = stubDeps();
    const dependent = stubChunk({
      id: 'dep-1',
      title: 'Dependent',
      prerequisitesJson: ['chunk-1', 'other-prereq'],
    });
    (deps.chunks.findDependents as ReturnType<typeof vi.fn>).mockResolvedValue([dependent]);

    const result = await deleteChunk('chunk-1', deps);

    expect(result.success).toBe(true);
    expect(result.removedDependencies).toHaveLength(1);
    expect(result.removedDependencies![0].chunkId).toBe('dep-1');
    expect(result.removedDependencies![0].removedPrerequisites).toEqual(['chunk-1']);
    expect(result.removedDependencies![0].remainingPrerequisites).toEqual(['other-prereq']);
  });

  it('returns not_found when chunk does not exist', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await deleteChunk('missing', deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });

  it('returns database error when transaction throws', async () => {
    const deps = stubDeps();
    (deps.unitOfWork.execute as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('tx failed'));

    const result = await deleteChunk('chunk-1', deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
    expect(result.error?.retryable).toBe(true);
  });

  it('skips dependents whose prerequisites do not include the deleted chunk', async () => {
    const deps = stubDeps();
    const dependent = stubChunk({
      id: 'dep-1',
      title: 'Unrelated',
      prerequisitesJson: ['other-prereq'],
    });
    (deps.chunks.findDependents as ReturnType<typeof vi.fn>).mockResolvedValue([dependent]);

    const result = await deleteChunk('chunk-1', deps);

    expect(result.success).toBe(true);
    // No cleanup needed — remaining equals previous
    expect(result.removedDependencies).toEqual([]);
  });
});

// ── createChunkWithTopic ────────────────────────────────────────

describe('createChunkWithTopic', () => {
  const baseInput: NewLearningChunk & { topicTitle?: string } = {
    id: 'new-chunk',
    topicId: 'existing-topic',
    title: 'New Chunk',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 0,
    estimatedDuration: 10,
    chunkType: 'new',
    content: 'Some content',
    createdAt: NOW,
    updatedAt: NOW,
  };

  it('creates chunk with existing topicId', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('new-chunk');
    }
    expect(deps.chunks.create).toHaveBeenCalledOnce();
    expect(deps.topics.list).not.toHaveBeenCalled();
  });

  it('finds existing topic by title when topicTitle provided without topicId', async () => {
    const deps = stubDeps();
    const existingTopic = { id: 'found-topic', title: 'React', subject: 'CS' };
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([existingTopic]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    const input = { ...baseInput, topicId: '', topicTitle: 'React' };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(true);
    expect(deps.topics.list).toHaveBeenCalledOnce();
    expect(deps.topics.create).not.toHaveBeenCalled();
    // Should use found topic's ID
    expect(deps.chunks.create).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: 'found-topic' })
    );
  });

  it('creates new topic when topicTitle provided but no match found', async () => {
    const deps = stubDeps();
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    const input = { ...baseInput, topicId: '', topicTitle: 'New Topic' };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(true);
    expect(deps.topics.create).toHaveBeenCalledOnce();
  });

  it('generates embedding when embedding port is present', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk', content: 'Some content' })
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
    expect(embedding.embedText).toHaveBeenCalledWith('Some content');
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledWith('new-chunk', [0.1, 0.2]);
  });

  it('succeeds when embedding fails (fail-open)', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockRejectedValue(new Error('provider down')),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
  });

  it('succeeds when saveContentEmbedding returns 0 rows', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk', content: 'Some content' })
    );
    (deps.chunks.saveContentEmbedding as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledWith('new-chunk', [0.1, 0.2]);
  });

  it('skips embedding when content is null', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn(),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = stubDeps({ embedding });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk', content: null })
    );
    const input = { ...baseInput, content: undefined };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(true);
    expect(embedding.embedText).not.toHaveBeenCalled();
  });

  it('returns database error when chunk create fails (getById returns undefined)', async () => {
    const deps = stubDeps();
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
    }
  });

  it('returns database error when create throws', async () => {
    const deps = stubDeps();
    (deps.chunks.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('constraint violation')
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
    }
  });
});
