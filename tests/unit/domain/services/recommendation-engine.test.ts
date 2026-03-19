import { describe, it, expect } from 'vitest';
import {
  aggregateTopicRecommendations,
  type DueChunkInfo,
} from '../../../../src/domain/services/recommendation-engine.js';

const NOW = new Date('2025-06-15T12:00:00.000Z');
const NOW_MS = NOW.getTime();
const MS_PER_DAY = 86_400_000;

function makeDueChunk(overrides: Partial<DueChunkInfo> = {}): DueChunkInfo {
  return {
    id: overrides.id ?? 'c1',
    topicId: overrides.topicId ?? 'topic-1',
    topicTitle: overrides.topicTitle ?? 'Topic 1',
    nextReviewAt: overrides.nextReviewAt ?? NOW_MS - MS_PER_DAY,
    easeFactor: overrides.easeFactor ?? 2.5,
    estimatedDuration: overrides.estimatedDuration ?? 10,
    createdAt: overrides.createdAt ?? NOW_MS - 10 * MS_PER_DAY,
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
    });

    expect(result[0]!.topicId).toBe('topic-high');
    expect(result[0]!.urgencyScore).toBeGreaterThan(result[1]!.urgencyScore);
  });

  it('orders dueChunkIds by createdAt within topic', () => {
    const chunks = [
      makeDueChunk({ id: 'c-later', topicId: 't1', createdAt: NOW_MS - MS_PER_DAY }),
      makeDueChunk({ id: 'c-earlier', topicId: 't1', createdAt: NOW_MS - 5 * MS_PER_DAY }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
    });

    expect(result[0]!.dueChunkIds).toEqual(['c-earlier', 'c-later']);
  });

  it('computes estimatedMinutes from chunk durations', () => {
    const chunks = [
      makeDueChunk({ id: 'c1', topicId: 't1', estimatedDuration: 10 }),
      makeDueChunk({ id: 'c2', topicId: 't1', estimatedDuration: 7 }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
    });

    expect(result[0]!.estimatedMinutes).toBe(17); // 10 + 7
  });

  it('detects hasNewChunks when a chunk has never been rescheduled', () => {
    const createdAt = NOW_MS - MS_PER_DAY;
    const chunks = [
      makeDueChunk({
        id: 'c-new',
        topicId: 't1',
        nextReviewAt: createdAt, // same as createdAt = never rescheduled
        createdAt,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
    });

    expect(result[0]!.hasNewChunks).toBe(true);
  });

  it('sets hasNewChunks false when all chunks have been reviewed', () => {
    const chunks = [
      makeDueChunk({
        id: 'c1',
        topicId: 't1',
        nextReviewAt: NOW_MS - MS_PER_DAY, // rescheduled to a different time than createdAt
        createdAt: NOW_MS - 30 * MS_PER_DAY,
      }),
    ];
    const result = aggregateTopicRecommendations({
      dueChunks: chunks,
      topicChunkCounts: new Map(),
      limit: 10,
      now: NOW,
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
    });

    // Same score, sorted by title alphabetically
    expect(result[0]!.topicTitle).toBe('Alpha');
    expect(result[1]!.topicTitle).toBe('Bravo');
  });
});
