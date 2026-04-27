import { describe, it, expect } from 'vitest';
import {
  bulletDominantRule,
  BULLET_DOMINANT_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/bullet-dominant.js';
import {
  BULLET_DOMINANCE_PARAGRAPH_FLOOR,
  BULLET_DOMINANCE_RATIO,
} from '../../../../../src/shared/linter/section-thresholds.js';
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

function listOf(n: number): string {
  return Array.from({ length: n }, (_, i) => `- bullet ${i + 1}`).join('\n');
}

function paragraphsOf(n: number): string {
  return Array.from({ length: n }, (_, i) => `Paragraph ${i + 1}.`).join('\n\n');
}

describe('tier1b.bullet-dominant', () => {
  describe('rule metadata', () => {
    it('is a chunk-scope, tier1b, non-blocking-eligible rule emitting warnings', () => {
      expect(bulletDominantRule.name).toBe(BULLET_DOMINANT_RULE_NAME);
      expect(bulletDominantRule.scope).toBe('chunk');
      expect(bulletDominantRule.tier).toBe('tier1b');
      expect(bulletDominantRule.blockingEligible).toBe(false);
    });
  });

  describe('null/empty content', () => {
    it('returns no findings for null content', () => {
      expect(bulletDominantRule.run(makeChunk(null))).toEqual([]);
    });

    it('returns no findings for empty content', () => {
      expect(bulletDominantRule.run(makeChunk(''))).toEqual([]);
    });

    it('returns no findings when content has no paragraphs', () => {
      expect(bulletDominantRule.run(makeChunk('   '))).toEqual([]);
    });
  });

  describe('paragraph floor', () => {
    it(`does not fire when paragraph count is below the floor (${BULLET_DOMINANCE_PARAGRAPH_FLOOR})`, () => {
      const content = `${listOf(BULLET_DOMINANCE_PARAGRAPH_FLOOR - 1)}`;
      expect(bulletDominantRule.run(makeChunk(content))).toEqual([]);
    });

    it('does not fire when chunk is short prose with one bullet', () => {
      const content = 'Intro paragraph.\n\n- single bullet';
      expect(bulletDominantRule.run(makeChunk(content))).toEqual([]);
    });
  });

  describe('ratio boundary', () => {
    it(`does not fire when ratio equals exactly ${BULLET_DOMINANCE_RATIO} (strict greater-than)`, () => {
      // 7 bullets + 3 prose paragraphs = ratio 0.7 exactly.
      const content = `${listOf(7)}\n\n${paragraphsOf(3)}`;
      expect(bulletDominantRule.run(makeChunk(content))).toEqual([]);
    });

    it('fires when ratio is just above the threshold', () => {
      // 8 bullets + 3 prose paragraphs = ratio 8/11 ≈ 0.727 > 0.7.
      const content = `${listOf(8)}\n\n${paragraphsOf(3)}`;
      const findings = bulletDominantRule.run(makeChunk(content));
      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        chunkId: 'chunk-1',
        rule: BULLET_DOMINANT_RULE_NAME,
        severity: 'warning',
        category: 'bullet_dominance',
      });
      expect(findings[0].detail).toContain('8/11 paragraphs are bullets');
    });

    it('fires when content is mostly bullets (rsa-foundations-style)', () => {
      // 61 bullets + 14 prose paragraphs = ratio ~0.81.
      const content = `${listOf(61)}\n\n${paragraphsOf(14)}`;
      const findings = bulletDominantRule.run(makeChunk(content));
      expect(findings).toHaveLength(1);
    });
  });

  describe('ordered lists and nesting', () => {
    it('treats ordered-list items as bullet paragraphs', () => {
      const content = `1. one\n2. two\n3. three\n4. four\n\n${paragraphsOf(1)}`;
      const findings = bulletDominantRule.run(makeChunk(content));
      expect(findings).toHaveLength(1);
    });

    it('does not double-count paragraphs inside nested lists', () => {
      // 1 outer bullet with a nested list of 1 bullet + 4 prose paragraphs.
      // Total paragraphs = 6 (2 list-items + 4 prose); bullets = 2; ratio = 1/3 ≈ 0.33.
      const content = '- outer\n  - inner\n\n' + paragraphsOf(4);
      expect(bulletDominantRule.run(makeChunk(content))).toEqual([]);
    });
  });
});
