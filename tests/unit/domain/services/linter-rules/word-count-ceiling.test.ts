import { describe, it, expect } from 'vitest';
import {
  wordCountCeilingRule,
  WORD_COUNT_CEILING_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/word-count-ceiling.js';
import { WORD_COUNT_CEILING } from '../../../../../src/shared/linter/section-thresholds.js';
import type { ChunkLintInput } from '../../../../../src/domain/services/chunk-linter.js';

function makeChunk(content: string | null): ChunkLintInput {
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
    knowledgeType: null,
  };
}

function wordsOf(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i + 1}`).join(' ');
}

describe('tier1b.word-count-ceiling', () => {
  describe('rule metadata', () => {
    it('is a chunk-scope, tier1b, non-blocking-eligible rule emitting warnings', () => {
      expect(wordCountCeilingRule.name).toBe(WORD_COUNT_CEILING_RULE_NAME);
      expect(wordCountCeilingRule.scope).toBe('chunk');
      expect(wordCountCeilingRule.tier).toBe('tier1b');
      expect(wordCountCeilingRule.blockingEligible).toBe(false);
    });
  });

  describe('null/empty content', () => {
    it('returns no findings for null content', () => {
      expect(wordCountCeilingRule.run(makeChunk(null))).toEqual([]);
    });

    it('returns no findings for empty content', () => {
      expect(wordCountCeilingRule.run(makeChunk(''))).toEqual([]);
    });
  });

  describe('threshold boundary', () => {
    it(`does not fire at exactly ${WORD_COUNT_CEILING} words`, () => {
      expect(wordCountCeilingRule.run(makeChunk(wordsOf(WORD_COUNT_CEILING)))).toEqual([]);
    });

    it(`fires at ${WORD_COUNT_CEILING + 1} words (one above ceiling)`, () => {
      const findings = wordCountCeilingRule.run(makeChunk(wordsOf(WORD_COUNT_CEILING + 1)));
      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        chunkId: 'chunk-1',
        rule: WORD_COUNT_CEILING_RULE_NAME,
        severity: 'warning',
        category: 'word_count_ceiling',
      });
      expect(findings[0].detail).toBe(
        `Chunk has ${WORD_COUNT_CEILING + 1} words (ceiling: ${WORD_COUNT_CEILING})`
      );
    });

    it('does not fire on short content', () => {
      expect(wordCountCeilingRule.run(makeChunk(wordsOf(100)))).toEqual([]);
    });
  });
});
