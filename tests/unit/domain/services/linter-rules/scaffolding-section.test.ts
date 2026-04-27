import { describe, it, expect } from 'vitest';
import {
  scaffoldingSectionRule,
  SCAFFOLDING_SECTION_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/scaffolding-section.js';
import { SCAFFOLDING_SECTION_HEADINGS } from '../../../../../src/shared/linter/section-thresholds.js';
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

describe('tier1b.scaffolding-section', () => {
  describe('rule metadata', () => {
    it('is a chunk-scope, tier1b, non-blocking-eligible rule emitting warnings', () => {
      expect(scaffoldingSectionRule.name).toBe(SCAFFOLDING_SECTION_RULE_NAME);
      expect(scaffoldingSectionRule.scope).toBe('chunk');
      expect(scaffoldingSectionRule.tier).toBe('tier1b');
      expect(scaffoldingSectionRule.blockingEligible).toBe(false);
    });
  });

  describe('null/empty content', () => {
    it('returns no findings for null content', () => {
      expect(scaffoldingSectionRule.run(makeChunk(null))).toEqual([]);
    });

    it('returns no findings for empty content', () => {
      expect(scaffoldingSectionRule.run(makeChunk(''))).toEqual([]);
    });
  });

  describe('heading matches', () => {
    it.each(SCAFFOLDING_SECTION_HEADINGS)('fires on exact-match "## %s"', heading => {
      const content = `Some intro text.\n\n## ${heading}\n\nBody.`;
      const findings = scaffoldingSectionRule.run(makeChunk(content));
      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        chunkId: 'chunk-1',
        rule: SCAFFOLDING_SECTION_RULE_NAME,
        severity: 'warning',
        category: 'scaffolding_section',
      });
      expect(findings[0].detail).toContain(heading);
    });

    it('tolerates trailing whitespace on the heading line', () => {
      const content = '## Practice Problems   \n\nText.';
      expect(scaffoldingSectionRule.run(makeChunk(content))).toHaveLength(1);
    });

    it('does not fire on case-mismatched headings', () => {
      const content = '## practice problems\n\nText.';
      expect(scaffoldingSectionRule.run(makeChunk(content))).toEqual([]);
    });

    it('does not fire on H3 (`###`) variants', () => {
      const content = '### Practice Problems\n\nText.';
      expect(scaffoldingSectionRule.run(makeChunk(content))).toEqual([]);
    });

    it('does not fire on heading text that is a superset of the allowlist entry', () => {
      const content = '## Practice Problems and Examples\n\nText.';
      expect(scaffoldingSectionRule.run(makeChunk(content))).toEqual([]);
    });

    it('emits one finding per matched heading in source order', () => {
      const content = '## Summary\n\nA.\n\n## Practice Problems\n\nB.\n\n## Exercises\n\nC.';
      const findings = scaffoldingSectionRule.run(makeChunk(content));
      expect(findings.map(f => f.detail)).toEqual([
        'Scaffolding section heading: "## Summary"',
        'Scaffolding section heading: "## Practice Problems"',
        'Scaffolding section heading: "## Exercises"',
      ]);
    });
  });
});
