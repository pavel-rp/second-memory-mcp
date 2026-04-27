import { describe, it, expect } from 'vitest';
import {
  phantomChapterRule,
  PHANTOM_CHAPTER_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/phantom-chapter.js';
import {
  PHANTOM_CHAPTER_BOLD_MIN,
  PHANTOM_CHAPTER_H2_MIN,
  PHANTOM_CHAPTER_H3_MIN,
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

function buildContent(h2: number, h3: number, bold: number): string {
  const parts: string[] = [];
  for (let i = 0; i < h2; i++) parts.push(`## Section ${i + 1}\n\nText.`);
  for (let i = 0; i < h3; i++) parts.push(`### Sub ${i + 1}\n\nText.`);
  for (let i = 0; i < bold; i++) parts.push(`**bold ${i + 1}**`);
  return parts.join('\n\n');
}

describe('tier1b.phantom-chapter', () => {
  describe('rule metadata', () => {
    it('is a chunk-scope, tier1b, non-blocking-eligible rule emitting warnings', () => {
      expect(phantomChapterRule.name).toBe(PHANTOM_CHAPTER_RULE_NAME);
      expect(phantomChapterRule.scope).toBe('chunk');
      expect(phantomChapterRule.tier).toBe('tier1b');
      expect(phantomChapterRule.blockingEligible).toBe(false);
    });
  });

  describe('null/empty content', () => {
    it('returns no findings for null content', () => {
      expect(phantomChapterRule.run(makeChunk(null))).toEqual([]);
    });

    it('returns no findings for empty content', () => {
      expect(phantomChapterRule.run(makeChunk(''))).toEqual([]);
    });
  });

  describe('threshold boundaries', () => {
    it('fires when all three counts are exactly at minimum (>= semantics)', () => {
      const content = buildContent(
        PHANTOM_CHAPTER_H2_MIN,
        PHANTOM_CHAPTER_H3_MIN,
        PHANTOM_CHAPTER_BOLD_MIN
      );
      expect(phantomChapterRule.run(makeChunk(content))).toHaveLength(1);
    });

    it('does not fire when h2 is one below the minimum', () => {
      const content = buildContent(
        PHANTOM_CHAPTER_H2_MIN - 1,
        PHANTOM_CHAPTER_H3_MIN + 5,
        PHANTOM_CHAPTER_BOLD_MIN + 5
      );
      expect(phantomChapterRule.run(makeChunk(content))).toEqual([]);
    });

    it('does not fire when h3 is one below the minimum', () => {
      const content = buildContent(
        PHANTOM_CHAPTER_H2_MIN + 5,
        PHANTOM_CHAPTER_H3_MIN - 1,
        PHANTOM_CHAPTER_BOLD_MIN + 5
      );
      expect(phantomChapterRule.run(makeChunk(content))).toEqual([]);
    });

    it('does not fire when bold count is one below the minimum', () => {
      const content = buildContent(
        PHANTOM_CHAPTER_H2_MIN + 5,
        PHANTOM_CHAPTER_H3_MIN + 5,
        PHANTOM_CHAPTER_BOLD_MIN - 1
      );
      expect(phantomChapterRule.run(makeChunk(content))).toEqual([]);
    });

    it('fires once when all three counts are above minimum', () => {
      const content = buildContent(9, 4, 12);
      const findings = phantomChapterRule.run(makeChunk(content));
      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        chunkId: 'chunk-1',
        rule: PHANTOM_CHAPTER_RULE_NAME,
        severity: 'warning',
        category: 'phantom_chapter',
      });
      expect(findings[0].detail).toBe('Likely phantom chapter: H2=9, H3=4, bold=12');
    });

    it('ignores headings other than h2/h3 (h4-h6 do not contribute to counts)', () => {
      // 3 H2 + 3 H3 + 6 bold would fire; replacing H3s with H4s should suppress.
      const parts: string[] = [];
      for (let i = 0; i < PHANTOM_CHAPTER_H2_MIN; i++) parts.push(`## Section ${i + 1}\n\nText.`);
      for (let i = 0; i < PHANTOM_CHAPTER_H3_MIN; i++) parts.push(`#### Sub ${i + 1}\n\nText.`);
      for (let i = 0; i < PHANTOM_CHAPTER_BOLD_MIN; i++) parts.push(`**bold ${i + 1}**`);
      expect(phantomChapterRule.run(makeChunk(parts.join('\n\n')))).toEqual([]);
    });
  });
});
