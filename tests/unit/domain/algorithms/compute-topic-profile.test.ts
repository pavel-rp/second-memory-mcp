import { describe, it, expect } from 'vitest';
import {
  computeTopicProfile,
  type TopicChunkInput,
} from '../../../../src/domain/algorithms/compute-topic-profile.js';

const MS_PER_DAY = 86_400_000;
const NOW = new Date('2025-06-15T12:00:00.000Z');

/** Build a TopicChunkInput from human-readable fields. */
function makeChunk(opts: {
  id: string;
  easeFactor: number;
  repetitions: number;
  intervalDays: number | null;
  daysOverdue: number;
}): TopicChunkInput {
  return {
    id: opts.id,
    easeFactor: opts.easeFactor,
    repetitions: opts.repetitions,
    nextReviewAt: NOW.getTime() - opts.daysOverdue * MS_PER_DAY,
    intervalDays: opts.intervalDays,
  };
}

/** Shorthand for a fresh chunk (R ≈ 1.0, recall tier). */
function freshChunk(id: string): TopicChunkInput {
  return makeChunk({ id, easeFactor: 2.5, repetitions: 3, intervalDays: 10, daysOverdue: 2 });
}

/** Shorthand for a stale chunk (R < 0.30, scaffold tier). */
function staleChunk(id: string): TopicChunkInput {
  return makeChunk({ id, easeFactor: 2.5, repetitions: 3, intervalDays: 10, daysOverdue: 432 });
}

describe('computeTopicProfile', () => {
  describe('empty chunks', () => {
    it('returns neutral profile for a topic with no chunks', () => {
      const result = computeTopicProfile('empty', [], new Map(), NOW);

      expect(result.topicId).toBe('empty');
      expect(result.totalChunks).toBe(0);
      expect(result.dominantTier).toBe('recall');
      expect(result.medianRetrievability).toBe(0);
      expect(result.needsTopicOrientation).toBe(false);
      expect(result.prerequisiteChainBroken).toBe(false);
      expect(result.tierDistribution).toEqual({
        recall: 0,
        cued_recall: 0,
        reteach: 0,
        scaffold: 0,
      });
    });
  });

  describe('all-fresh topic', () => {
    it('returns recall dominant, no orientation, no broken prereqs for 6 fresh chunks', () => {
      const chunks = Array.from({ length: 6 }, (_, i) => freshChunk(`c${i + 1}`));
      const result = computeTopicProfile('topic-1', chunks, new Map(), NOW);

      expect(result.topicId).toBe('topic-1');
      expect(result.totalChunks).toBe(6);
      expect(result.dominantTier).toBe('recall');
      expect(result.needsTopicOrientation).toBe(false);
      expect(result.prerequisiteChainBroken).toBe(false);
      expect(result.tierDistribution.recall).toBe(6);
      expect(result.tierDistribution.scaffold).toBe(0);
      expect(result.tierDistribution.reteach).toBe(0);
      expect(result.tierDistribution.cued_recall).toBe(0);
      expect(result.medianRetrievability).toBeGreaterThan(0.7);
    });
  });

  describe('all-stale topic', () => {
    it('returns scaffold dominant and needs orientation for 5 stale chunks', () => {
      const chunks = Array.from({ length: 5 }, (_, i) => staleChunk(`c${i + 1}`));
      const result = computeTopicProfile('topic-2', chunks, new Map(), NOW);

      expect(result.totalChunks).toBe(5);
      expect(result.dominantTier).toBe('scaffold');
      expect(result.needsTopicOrientation).toBe(true);
      expect(result.tierDistribution.scaffold).toBe(5);
      expect(result.medianRetrievability).toBeLessThan(0.3);
    });
  });

  describe('mixed topic with broken prerequisite chain', () => {
    it('detects broken chain when chunk D depends on stale chunk C', () => {
      const chunks = [
        freshChunk('A'),
        freshChunk('B'),
        staleChunk('C'), // R < 0.50
        freshChunk('D'),
      ];
      const prerequisites = new Map([['D', ['C']]]);
      const result = computeTopicProfile('topic-3', chunks, prerequisites, NOW);

      expect(result.prerequisiteChainBroken).toBe(true);
    });
  });

  describe('single-chunk topic', () => {
    it('returns correct profile for a lone fresh chunk', () => {
      const chunks = [freshChunk('solo')];
      const result = computeTopicProfile('topic-4', chunks, new Map(), NOW);

      expect(result.totalChunks).toBe(1);
      expect(result.dominantTier).toBe('recall');
      expect(result.needsTopicOrientation).toBe(false);
      expect(result.prerequisiteChainBroken).toBe(false);
      expect(result.medianRetrievability).toBeGreaterThan(0.7);
    });

    it('returns correct profile for a lone stale chunk', () => {
      const chunks = [staleChunk('solo')];
      const result = computeTopicProfile('topic-5', chunks, new Map(), NOW);

      expect(result.totalChunks).toBe(1);
      expect(result.dominantTier).toBe('scaffold');
      expect(result.needsTopicOrientation).toBe(true);
      expect(result.medianRetrievability).toBeLessThan(0.3);
    });
  });

  describe('empty prerequisites map', () => {
    it('returns prerequisiteChainBroken = false', () => {
      const chunks = [staleChunk('A'), staleChunk('B')];
      const result = computeTopicProfile('topic-6', chunks, new Map(), NOW);

      expect(result.prerequisiteChainBroken).toBe(false);
    });
  });

  describe('median computation', () => {
    it('returns middle value for odd chunk count', () => {
      // 3 fresh chunks — all have similar high R
      const chunks = [freshChunk('c1'), freshChunk('c2'), freshChunk('c3')];
      const result = computeTopicProfile('topic-7', chunks, new Map(), NOW);

      // All fresh, R values are equal → median = that value
      expect(result.medianRetrievability).toBeGreaterThan(0.9);
    });

    it('returns average of two middle values for even chunk count', () => {
      // 2 fresh + 2 stale → median is average of middle two
      const chunks = [freshChunk('c1'), freshChunk('c2'), staleChunk('c3'), staleChunk('c4')];
      const result = computeTopicProfile('topic-8', chunks, new Map(), NOW);

      // Sorted Rs: [~0.30, ~0.30, ~0.98, ~0.98]
      // Median = average of 2nd and 3rd = (~0.30 + ~0.98) / 2 ≈ 0.64
      expect(result.medianRetrievability).toBeGreaterThan(0.3);
      expect(result.medianRetrievability).toBeLessThan(0.98);
    });
  });

  describe('tier tie-breaking', () => {
    it('more severe tier wins when two tiers share max count', () => {
      // 2 scaffold + 2 recall → scaffold wins (more severe)
      const chunks = [staleChunk('s1'), staleChunk('s2'), freshChunk('f1'), freshChunk('f2')];
      const result = computeTopicProfile('topic-9', chunks, new Map(), NOW);

      expect(result.tierDistribution.scaffold).toBe(2);
      expect(result.tierDistribution.recall).toBe(2);
      expect(result.dominantTier).toBe('scaffold');
    });
  });

  describe('prerequisite outside input set', () => {
    it('ignores prereq not in the chunk list without crashing', () => {
      const chunks = [freshChunk('A'), freshChunk('B')];
      const prerequisites = new Map([['A', ['MISSING_CHUNK']]]);
      const result = computeTopicProfile('topic-10', chunks, prerequisites, NOW);

      expect(result.prerequisiteChainBroken).toBe(false);
    });
  });

  describe('needsTopicOrientation threshold', () => {
    it('returns true when exactly 50% of chunks have R < 0.50', () => {
      // 2 fresh + 2 stale = exactly 50% stale
      const chunks = [freshChunk('f1'), freshChunk('f2'), staleChunk('s1'), staleChunk('s2')];
      const result = computeTopicProfile('topic-11', chunks, new Map(), NOW);

      expect(result.needsTopicOrientation).toBe(true);
    });

    it('returns false when less than 50% of chunks have R < 0.50', () => {
      // 3 fresh + 1 stale = 25% stale
      const chunks = [freshChunk('f1'), freshChunk('f2'), freshChunk('f3'), staleChunk('s1')];
      const result = computeTopicProfile('topic-12', chunks, new Map(), NOW);

      expect(result.needsTopicOrientation).toBe(false);
    });
  });
});
