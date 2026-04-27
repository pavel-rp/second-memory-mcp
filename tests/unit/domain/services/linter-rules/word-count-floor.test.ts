import { describe, it, expect } from 'vitest';
import {
  wordCountFloorRule,
  WORD_COUNT_FLOOR_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/word-count-floor.js';
import { WORD_COUNT_FLOOR } from '../../../../../src/shared/linter/section-thresholds.js';
import type { ChunkLintInput } from '../../../../../src/domain/services/chunk-linter.js';
import type { KnowledgeType } from '../../../../../src/domain/types/entities.js';

function makeChunk(
  content: string | null,
  knowledgeType: KnowledgeType | null = null
): ChunkLintInput {
  return {
    chunkId: 'chunk-1',
    title: 'Test',
    content,
    chunkType: 'concept',
    condensedSummary: null,
    prerequisites: [],
    tags: [],
    difficulty: 3,
    estimatedDuration: 10,
    knowledgeType,
  };
}

function wordsOf(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i + 1}`).join(' ');
}

describe('tier1b.word-count-floor', () => {
  describe('rule metadata', () => {
    it('is a chunk-scope, tier1b, non-blocking-eligible rule emitting warnings', () => {
      expect(wordCountFloorRule.name).toBe(WORD_COUNT_FLOOR_RULE_NAME);
      expect(wordCountFloorRule.scope).toBe('chunk');
      expect(wordCountFloorRule.tier).toBe('tier1b');
      expect(wordCountFloorRule.blockingEligible).toBe(false);
    });
  });

  describe('null/empty content', () => {
    it('returns no findings for null content', () => {
      expect(wordCountFloorRule.run(makeChunk(null))).toEqual([]);
    });

    it('returns no findings for empty content', () => {
      expect(wordCountFloorRule.run(makeChunk(''))).toEqual([]);
    });

    it('returns no findings for whitespace-only content', () => {
      expect(wordCountFloorRule.run(makeChunk('   \n  '))).toEqual([]);
    });
  });

  describe('threshold boundary', () => {
    it(`fires at ${WORD_COUNT_FLOOR - 1} words (one below floor)`, () => {
      const findings = wordCountFloorRule.run(makeChunk(wordsOf(WORD_COUNT_FLOOR - 1), 'concept'));
      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        chunkId: 'chunk-1',
        rule: WORD_COUNT_FLOOR_RULE_NAME,
        severity: 'warning',
        category: 'word_count_floor',
      });
      expect(findings[0].detail).toBe(
        `Chunk has ${WORD_COUNT_FLOOR - 1} words (floor: ${WORD_COUNT_FLOOR})`
      );
    });

    it(`does not fire at exactly ${WORD_COUNT_FLOOR} words`, () => {
      expect(wordCountFloorRule.run(makeChunk(wordsOf(WORD_COUNT_FLOOR), 'concept'))).toEqual([]);
    });

    it('does not fire on long content', () => {
      expect(wordCountFloorRule.run(makeChunk(wordsOf(WORD_COUNT_FLOOR + 200), 'concept'))).toEqual(
        []
      );
    });
  });

  describe('knowledgeType carve-out', () => {
    it('does not fire for fact-typed chunks regardless of word count', () => {
      expect(wordCountFloorRule.run(makeChunk(wordsOf(50), 'fact'))).toEqual([]);
    });

    it('fires for null-typed chunks below the floor', () => {
      expect(wordCountFloorRule.run(makeChunk(wordsOf(50), null))).toHaveLength(1);
    });

    it('fires for procedure-typed chunks below the floor', () => {
      expect(wordCountFloorRule.run(makeChunk(wordsOf(50), 'procedure'))).toHaveLength(1);
    });

    it('fires for principle-typed chunks below the floor', () => {
      expect(wordCountFloorRule.run(makeChunk(wordsOf(50), 'principle'))).toHaveLength(1);
    });
  });
});
