import { describe, it, expect, vi } from 'vitest';
import {
  processReviewResult,
  type ReviewDeps,
} from '../../../src/orchestration/review-workflows.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';
import { stubReviewPersistence } from '../../helpers/stub-ports.js';

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
    consecutiveFailures: 0,
    lastReviewedAt: NOW - 86_400_000,
    estimatedDuration: 15,
    intervalDays: 7,
    chunkType: 'review',
    contentStatus: 'final',
    condensedSummary: null,
    knowledgeType: null,
    validatorReport: null,
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
    reviewPersistence: stubReviewPersistence({
      getChunk: vi.fn().mockResolvedValue(stubChunk()),
      persistReviewUpdate: vi.fn().mockResolvedValue(1),
    }),
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

  it('increments the persisted consecutive-failure counter on a failing review', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ consecutiveFailures: 1 }))
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 1, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.consecutiveFailures).toBe(2);
      expect(result.data.isLeech).toBe(false);
    }
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({ consecutiveFailures: 2, chunkType: 'review' })
    );
  });

  it('resets the consecutive-failure counter to 0 on a passing review', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ consecutiveFailures: 2 }))
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.consecutiveFailures).toBe(0);
    }
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({ consecutiveFailures: 0 })
    );
  });

  it('flags a leech and marks chunk_type=remediation when the count reaches the threshold', async () => {
    // Default leechConsecutiveFailures is 3 — stored 2 plus this failure makes 3.
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ consecutiveFailures: 2, chunkType: 'review' }))
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 0, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.consecutiveFailures).toBe(3);
      expect(result.data.isLeech).toBe(true);
      expect(result.data.updated.chunkType).toBe('remediation');
    }
    expect(deps.reviewPersistence.persistReviewUpdate).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({ chunkType: 'remediation', consecutiveFailures: 3 })
    );
  });

  it('does not downgrade an existing remediation chunk on a non-leech review', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ chunkType: 'remediation', consecutiveFailures: 1 }))
      .mockResolvedValueOnce(stubChunk());

    // Passing review: not a fresh leech, but the chunk must stay 'remediation'.
    const result = await processReviewResult('item-1', 5, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.consecutiveFailures).toBe(0);
      expect(result.data.isLeech).toBe(false);
      expect(result.data.updated.chunkType).toBe('remediation');
    }
  });

  it('keeps chunk_type=review for a non-leech update on a new chunk', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ chunkType: 'new', consecutiveFailures: 0 }))
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updated.chunkType).toBe('review');
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

  it('returns database error when post-update fetch returns undefined', async () => {
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
    // With lastReviewedAt = null, the function falls back to createdAt for interval calculation
    const deps = stubDeps();
    const chunk = stubChunk({ lastReviewedAt: null, createdAt: NOW - 172_800_000 });
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(chunk)
      .mockResolvedValueOnce(stubChunk());

    const result = await processReviewResult('item-1', 4, {}, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      // The interval should be derived from createdAt (2 days ago), not 0
      expect(result.data.updated.intervalDays).toBeGreaterThan(0);
      expect(result.data.updated.nextReviewAt).toBeGreaterThan(NOW);
    }
  });

  it('passes daysOverdue to SR calculator and it affects the result', async () => {
    const deps = stubDeps();
    (deps.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk());

    const withOverdue = await processReviewResult('item-1', 4, { daysOverdue: 5 }, deps);

    const deps2 = stubDeps();
    (deps2.reviewPersistence.getChunk as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk())
      .mockResolvedValueOnce(stubChunk());

    const withoutOverdue = await processReviewResult('item-1', 4, { daysOverdue: 0 }, deps2);

    expect(withOverdue.success).toBe(true);
    expect(withoutOverdue.success).toBe(true);
    if (withOverdue.success && withoutOverdue.success) {
      // daysOverdue affects the SR calculation — intervals should differ
      expect(withOverdue.data.updated.intervalDays).not.toBe(
        withoutOverdue.data.updated.intervalDays
      );
    }
  });
});
