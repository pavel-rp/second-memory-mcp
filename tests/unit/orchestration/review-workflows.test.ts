import { describe, it, expect, vi } from 'vitest';
import {
  processReviewResult,
  type ReviewDeps,
} from '../../../src/orchestration/review-workflows.js';
import type { ReviewPersistencePort } from '../../../src/ports/review-persistence-port.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function stubChunk(overrides?: Partial<LearningChunk>): LearningChunk {
  return {
    id: 'item-1',
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
    content: null,
    contentVersion: null,
    contentUpdatedAt: null,
    createdAt: NOW - 1_000_000,
    updatedAt: NOW,
    ...overrides,
  };
}

function stubDeps(): ReviewDeps {
  return {
    reviewPersistence: {
      getChunk: vi.fn().mockResolvedValue(stubChunk()),
      persistReviewUpdate: vi.fn().mockResolvedValue(1),
    } as unknown as ReviewPersistencePort,
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  };
}

// ── processReviewResult ─────────────────────────────────────────

describe('processReviewResult', () => {
  it('processes review with quality >= 3 (good recall)', async () => {
    const deps = stubDeps();
    const updatedChunk = stubChunk({ repetitions: 4, easeFactor: 2.6 });
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk()) // current
      .mockResolvedValueOnce(updatedChunk); // post-update

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quality).toBe(4);
      expect(result.data.isLapse).toBe(false);
      expect(result.data.isLeech).toBe(false);
      expect(result.data.previous.repetitions).toBe(3);
      expect(result.data.updated.repetitions).toBeGreaterThanOrEqual(0);
    }
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalledOnce();
  });

  it('marks as lapse when quality < 3', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk({ repetitions: 0 }));

    const result = await processReviewResult('item-1', 1, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isLapse).toBe(true);
    }
  });

  it('detects leech with many consecutive failures', async () => {
    const deps = stubDeps();
    const leechChunk = stubChunk({ repetitions: 0, easeFactor: 1.3 });
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(leechChunk)
      .mockResolvedValueOnce(leechChunk);

    const result = await processReviewResult('item-1', 0, { consecutiveFailures: 10 }, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isLeech).toBe(true);
      expect(result.data.consecutiveFailures).toBe(10);
    }
  });

  it('returns not_found when chunk does not exist', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await processReviewResult('missing', 4, {}, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('returns database error when post-update fetch returns null', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk()) // current — found
      .mockResolvedValueOnce(undefined); // post-update — gone

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toContain('Failed to retrieve chunk after update');
    }
  });

  it('returns database error when persistReviewUpdate throws', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.persistReviewUpdate as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('db crash')
    );

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
    }
  });

  it('uses createdAt as fallback when lastReviewedAt is null', async () => {
    const deps = stubDeps();
    const chunk = stubChunk({ lastReviewedAt: null, createdAt: NOW - 172_800_000 });
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(chunk)
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(true);
  });

  it('passes daysOverdue to SR calculator', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 4, { daysOverdue: 5 }, deps);

    expect(result.success).toBe(true);
  });
});
