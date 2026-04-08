import { describe, it, expect } from 'vitest';
import {
  aggregateTopicRecommendations,
  classifyRecommendation,
  type DueChunkInfo,
} from '../../../../src/domain/services/recommendation-engine.js';

const NOW = new Date('2025-06-15T12:00:00.000Z');
const NOW_MS = NOW.getTime();
const MS_PER_DAY = 86_400_000;

const RECENCY_WINDOW_MS = 172_800_000; // 48h default

function makeDueChunk(overrides: Partial<DueChunkInfo> = {}): DueChunkInfo {
  return {
    id: 'c1',
    topicId: 'topic-1',
    topicTitle: 'Topic 1',
    nextReviewAt: NOW_MS - MS_PER_DAY,
    easeFactor: 2.5,
    estimatedDuration: 10,
    createdAt: NOW_MS - 10 * MS_PER_DAY,
    lastReviewedAt: null,
    ...overrides,
  };
}

describe('aggregateTopicRecommendations', () => {
  it('returns empty array for no due chunks', () => {
    const result = aggregateTopicRecommendations({
      dueChunks: [],
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });
    expect(result).toEqual([]);
  });

  it('groups chunks by topic and returns topic-level recommendations', () => {
    const chunks = [
      makeDueChunk({ id: 'c1', topicId: 'topic-1', topicTitle: 'Segment Trees' }),
      makeDueChunk({ id: 'c2', topicId: 'topic-1', topicTitle: 'Segment Trees' }),
      makeDueChunk({ id: 'c3', topicId: 'topic-2', topicTitle: 'Graph Theory' }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map([
        ['topic-1', 5],
        ['topic-2', 3],
      ]),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result).toHaveLength(2);
    const t1 = result.find(r => r.topicId === 'topic-1')!;
    expect(t1.topicTitle).toBe('Segment Trees');
    expect(t1.dueChunkCount).toBe(2);
    expect(t1.totalChunkCount).toBe(5);
    expect(t1.dueChunkIds).toEqual(['c1', 'c2']);

    const t2 = result.find(r => r.topicId === 'topic-2')!;
    expect(t2.dueChunkCount).toBe(1);
    expect(t2.totalChunkCount).toBe(3);
  });

  it('sorts topics by urgency score descending', () => {
    const chunks = [
      makeDueChunk({
        id: 'c1',
        topicId: 'topic-low',
        topicTitle: 'Low',
        nextReviewAt: NOW_MS, // not overdue
      }),
      makeDueChunk({
        id: 'c2',
        topicId: 'topic-high',
        topicTitle: 'High',
        nextReviewAt: NOW_MS - 10 * MS_PER_DAY, // 10 days overdue
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.topicId).toBe('topic-high');
    expect(result[0]!.urgencyScore).toBeGreaterThan(result[1]!.urgencyScore);
  });

  it('orders dueChunkIds topologically when chunks have prerequisites', () => {
    const ts = NOW_MS - 10 * MS_PER_DAY; // identical createdAt
    const chunks = [
      makeDueChunk({
        id: 'c-advanced',
        topicId: 't1',
        createdAt: ts,
        prerequisites: ['c-intermediate'],
      }),
      makeDueChunk({
        id: 'c-intermediate',
        topicId: 't1',
        createdAt: ts,
        prerequisites: ['c-basics'],
      }),
      makeDueChunk({ id: 'c-basics', topicId: 't1', createdAt: ts }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.dueChunkIds).toEqual(['c-basics', 'c-intermediate', 'c-advanced']);
  });

  it('falls back to createdAt sort when no prerequisites exist', () => {
    const chunks = [
      makeDueChunk({ id: 'c-newer', topicId: 't1', createdAt: NOW_MS - MS_PER_DAY }),
      makeDueChunk({ id: 'c-older', topicId: 't1', createdAt: NOW_MS - 5 * MS_PER_DAY }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.dueChunkIds).toEqual(['c-older', 'c-newer']);
  });

  it('handles prerequisites pointing outside the due set gracefully', () => {
    const ts = NOW_MS - 10 * MS_PER_DAY;
    const chunks = [
      makeDueChunk({ id: 'c-child', topicId: 't1', createdAt: ts, prerequisites: ['c-external'] }),
      makeDueChunk({ id: 'c-standalone', topicId: 't1', createdAt: ts }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    // External prerequisite is filtered out; both chunks should appear
    expect(result[0]!.dueChunkIds).toHaveLength(2);
    expect(result[0]!.dueChunkIds).toContain('c-child');
    expect(result[0]!.dueChunkIds).toContain('c-standalone');
  });

  it('falls back to createdAt sort on circular prerequisites', () => {
    const ts = NOW_MS - 10 * MS_PER_DAY;
    const chunks = [
      makeDueChunk({ id: 'c-a', topicId: 't1', createdAt: ts + 2, prerequisites: ['c-b'] }),
      makeDueChunk({ id: 'c-b', topicId: 't1', createdAt: ts + 1, prerequisites: ['c-a'] }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    // Cycle detected → falls back to createdAt order
    expect(result[0]!.dueChunkIds).toEqual(['c-b', 'c-a']);
  });

  it('computes estimatedDuration from chunk durations', () => {
    const chunks = [
      makeDueChunk({ id: 'c1', topicId: 't1', estimatedDuration: 10 }),
      makeDueChunk({ id: 'c2', topicId: 't1', estimatedDuration: 7 }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.estimatedDuration).toBe(17); // 10 + 7
  });

  it('detects hasNewChunks when a chunk has never been reviewed', () => {
    const createdAt = NOW_MS - MS_PER_DAY;
    const chunks = [
      makeDueChunk({
        id: 'c-new',
        topicId: 't1',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.hasNewChunks).toBe(true);
  });

  it('sets hasNewChunks false when all chunks have been reviewed', () => {
    const chunks = [
      makeDueChunk({
        id: 'c1',
        topicId: 't1',
        nextReviewAt: NOW_MS - MS_PER_DAY,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 10 * MS_PER_DAY,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.hasNewChunks).toBe(false);
  });

  it('respects the limit parameter', () => {
    const chunks = Array.from({ length: 5 }, (_, i) =>
      makeDueChunk({ id: `c${i}`, topicId: `t${i}`, topicTitle: `Topic ${i}` })
    );
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 3,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result).toHaveLength(3);
  });

  it('falls back to dueChunkCount when topicChunkCounts has no entry', () => {
    const chunks = [
      makeDueChunk({ id: 'c1', topicId: 't1' }),
      makeDueChunk({ id: 'c2', topicId: 't1' }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(), // no entry for t1
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.totalChunkCount).toBe(2); // falls back to due count
  });

  it('uses stable tiebreaker (topicTitle) when scores are equal', () => {
    const chunks = [
      makeDueChunk({ id: 'c1', topicId: 't-b', topicTitle: 'Bravo', nextReviewAt: NOW_MS }),
      makeDueChunk({ id: 'c2', topicId: 't-a', topicTitle: 'Alpha', nextReviewAt: NOW_MS }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    // Same score, sorted by title alphabetically
    expect(result[0]!.topicTitle).toBe('Alpha');
    expect(result[1]!.topicTitle).toBe('Bravo');
  });

  it('uses maxDependencyDepth from input, not ad-hoc Math.max', () => {
    // Build a chain with depth 3 and vary maxDependencyDepth
    const ts = NOW_MS - 10 * MS_PER_DAY;
    // Non-chronological createdAt so fallback order differs from toposorted order
    const chunks = [
      makeDueChunk({ id: 'c1', topicId: 't1', createdAt: ts + 3 }),
      makeDueChunk({ id: 'c2', topicId: 't1', createdAt: ts + 1, prerequisites: ['c1'] }),
      makeDueChunk({ id: 'c3', topicId: 't1', createdAt: ts + 2, prerequisites: ['c2'] }),
      makeDueChunk({ id: 'c4', topicId: 't1', createdAt: ts, prerequisites: ['c3'] }),
    ];

    // With maxDependencyDepth: 3 → chain depth 3 = maxDepth, should be valid → toposorted
    const resultDeep = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 3,
    });
    expect(resultDeep[0]!.dueChunkIds).toEqual(['c1', 'c2', 'c3', 'c4']);

    // With maxDependencyDepth: 2 → chain depth 3 > maxDepth → falls back to createdAt
    const resultShallow = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 2,
    });
    // Fallback to createdAt order (differs from toposorted order)
    expect(resultShallow[0]!.dueChunkIds).toEqual(['c4', 'c2', 'c3', 'c1']);
  });

  it('falls back to createdAt order on invalid resolution (circular deps)', () => {
    const ts = NOW_MS - 10 * MS_PER_DAY;
    const chunks = [
      makeDueChunk({ id: 'c-a', topicId: 't1', createdAt: ts + 2, prerequisites: ['c-b'] }),
      makeDueChunk({ id: 'c-b', topicId: 't1', createdAt: ts + 1, prerequisites: ['c-a'] }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    // Falls back to createdAt order
    expect(result[0]!.dueChunkIds).toEqual(['c-b', 'c-a']);
  });
});

describe('classifyRecommendation', () => {
  it('returns continue_learning when recent activity AND new chunks', () => {
    expect(classifyRecommendation(true, true, true)).toBe('continue_learning');
    expect(classifyRecommendation(true, true, false)).toBe('continue_learning');
  });

  it('returns overdue_review when has reviewed chunks but no recent activity', () => {
    expect(classifyRecommendation(false, false, true)).toBe('overdue_review');
    expect(classifyRecommendation(false, true, true)).toBe('overdue_review');
  });

  it('returns overdue_review when recent activity but no new chunks (all reviewed)', () => {
    expect(classifyRecommendation(true, false, true)).toBe('overdue_review');
  });

  it('returns new_material when only unstudied chunks and no recent activity', () => {
    expect(classifyRecommendation(false, true, false)).toBe('new_material');
  });

  it('returns new_material when no chunks of any kind (edge case)', () => {
    expect(classifyRecommendation(false, false, false)).toBe('new_material');
  });

  it('returns new_material when recent activity but no new or reviewed chunks (edge case)', () => {
    expect(classifyRecommendation(true, false, false)).toBe('new_material');
  });
});

describe('recommendation type classification in aggregation', () => {
  it('classifies topic with recent review + new chunks as continue_learning', () => {
    const createdAt = NOW_MS - MS_PER_DAY;
    const chunks = [
      // Reviewed chunk (recent)
      makeDueChunk({
        id: 'c-reviewed',
        topicId: 't1',
        nextReviewAt: NOW_MS - MS_PER_DAY,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 3_600_000, // 1 hour ago
      }),
      // New chunk (never reviewed)
      makeDueChunk({
        id: 'c-new',
        topicId: 't1',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map([['t1', 5]]),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.recommendationType).toBe('continue_learning');
  });

  it('classifies topic with due chunks and no recent activity as overdue_review', () => {
    const chunks = [
      makeDueChunk({
        id: 'c1',
        topicId: 't1',
        nextReviewAt: NOW_MS - 5 * MS_PER_DAY,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 10 * MS_PER_DAY, // 10 days ago, outside 48h window
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.recommendationType).toBe('overdue_review');
  });

  it('classifies topic with only new chunks and no recent activity as new_material', () => {
    const createdAt = NOW_MS - MS_PER_DAY;
    const chunks = [
      makeDueChunk({
        id: 'c-new',
        topicId: 't1',
        nextReviewAt: createdAt, // same as createdAt = new
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.recommendationType).toBe('new_material');
  });

  it('recency boost raises urgency score for continue_learning topics', () => {
    const createdAt = NOW_MS - MS_PER_DAY;
    // Topic with recent activity + new chunks
    const boostedChunks = [
      makeDueChunk({
        id: 'c1',
        topicId: 't-boosted',
        topicTitle: 'Boosted',
        nextReviewAt: NOW_MS - MS_PER_DAY,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 3_600_000, // 1 hour ago
      }),
      makeDueChunk({
        id: 'c2',
        topicId: 't-boosted',
        topicTitle: 'Boosted',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    // Same topic without recent activity
    const unboostedChunks = [
      makeDueChunk({
        id: 'c3',
        topicId: 't-unboosted',
        topicTitle: 'Unboosted',
        nextReviewAt: NOW_MS - MS_PER_DAY,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 10 * MS_PER_DAY,
      }),
      makeDueChunk({
        id: 'c4',
        topicId: 't-unboosted',
        topicTitle: 'Unboosted',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];

    const result = aggregateTopicRecommendations({
      dueChunks: [...boostedChunks, ...unboostedChunks],
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    const boosted = result.find(r => r.topicId === 't-boosted')!;
    const unboosted = result.find(r => r.topicId === 't-unboosted')!;
    expect(boosted.urgencyScore).toBeGreaterThan(unboosted.urgencyScore);
    expect(boosted.recommendationType).toBe('continue_learning');
  });

  it('continue_learning topic (0 overdue days) ranks above overdue_review (5-10 days)', () => {
    const createdAt = NOW_MS;
    // continue_learning: just reviewed, has new chunks, 0 overdue days
    const continueLearning = [
      makeDueChunk({
        id: 'c-cl-reviewed',
        topicId: 't-continue',
        topicTitle: 'Continue',
        nextReviewAt: NOW_MS, // due now, 0 overdue
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 3_600_000, // recent
      }),
      makeDueChunk({
        id: 'c-cl-new',
        topicId: 't-continue',
        topicTitle: 'Continue',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    // overdue_review: 7 days overdue, no recent activity
    const overdueReview = [
      makeDueChunk({
        id: 'c-or',
        topicId: 't-overdue',
        topicTitle: 'Overdue',
        nextReviewAt: NOW_MS - 7 * MS_PER_DAY,
        createdAt: NOW_MS - 60 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 14 * MS_PER_DAY,
      }),
    ];

    const result = aggregateTopicRecommendations({
      dueChunks: [...continueLearning, ...overdueReview],
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.topicId).toBe('t-continue');
    expect(result[0]!.recommendationType).toBe('continue_learning');
    expect(result[1]!.topicId).toBe('t-overdue');
    expect(result[1]!.recommendationType).toBe('overdue_review');
  });

  it('topic 150+ days overdue outranks continue_learning topic', () => {
    const createdAt = NOW_MS;
    // continue_learning topic
    const continueLearning = [
      makeDueChunk({
        id: 'c-cl',
        topicId: 't-continue',
        topicTitle: 'Continue',
        nextReviewAt: NOW_MS,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 3_600_000,
      }),
      makeDueChunk({
        id: 'c-new',
        topicId: 't-continue',
        topicTitle: 'Continue',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    // Extremely overdue topic (150 days)
    const extremeOverdue = [
      makeDueChunk({
        id: 'c-extreme',
        topicId: 't-extreme',
        topicTitle: 'Extreme',
        nextReviewAt: NOW_MS - 150 * MS_PER_DAY,
        createdAt: NOW_MS - 200 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 160 * MS_PER_DAY,
      }),
    ];

    const result = aggregateTopicRecommendations({
      dueChunks: [...continueLearning, ...extremeOverdue],
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.topicId).toBe('t-extreme');
    expect(result[0]!.recommendationType).toBe('overdue_review');
  });

  it('no recency boost when reviewed outside 48h window', () => {
    const createdAt = NOW_MS - MS_PER_DAY;
    const chunks = [
      makeDueChunk({
        id: 'c-reviewed',
        topicId: 't1',
        nextReviewAt: NOW_MS - MS_PER_DAY,
        createdAt: NOW_MS - 30 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 3 * MS_PER_DAY, // 3 days ago — outside 48h
      }),
      makeDueChunk({
        id: 'c-new',
        topicId: 't1',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    // Should NOT be continue_learning since outside recency window
    expect(result[0]!.recommendationType).not.toBe('continue_learning');
  });

  it('boosted score is clamped to 1.0', () => {
    const createdAt = NOW_MS;
    const chunks = [
      // Extremely overdue + recent → high base score + boost
      makeDueChunk({
        id: 'c1',
        topicId: 't1',
        nextReviewAt: NOW_MS - 100 * MS_PER_DAY,
        easeFactor: 1.3,
        createdAt: NOW_MS - 200 * MS_PER_DAY,
        lastReviewedAt: NOW_MS - 3_600_000,
      }),
      makeDueChunk({
        id: 'c2',
        topicId: 't1',
        nextReviewAt: createdAt,
        createdAt,
        lastReviewedAt: null,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
      recencyWindowMs: RECENCY_WINDOW_MS,
      maxDependencyDepth: 5,
    });

    expect(result[0]!.urgencyScore).toBeLessThanOrEqual(1);
  });
});
