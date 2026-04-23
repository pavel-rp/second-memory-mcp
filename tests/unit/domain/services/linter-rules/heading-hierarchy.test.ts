import { describe, it, expect } from 'vitest';
import {
  headingHierarchyRule,
  HEADING_HIERARCHY_RULE_NAME,
  tagToLevel,
} from '../../../../../src/domain/services/linter-rules/heading-hierarchy.js';
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
  };
}

describe('tier1a.heading-hierarchy', () => {
  it('returns no findings for null content', () => {
    expect(headingHierarchyRule.run(makeChunk(null))).toEqual([]);
  });

  it('returns no findings for empty content', () => {
    expect(headingHierarchyRule.run(makeChunk(''))).toEqual([]);
  });

  it('returns no findings for prose without headings', () => {
    expect(headingHierarchyRule.run(makeChunk('Just prose.'))).toEqual([]);
  });

  it('passes monotone H1 → H2 → H3 progression', () => {
    const content = '# A\n\n## B\n\n### C\n';
    expect(headingHierarchyRule.run(makeChunk(content))).toEqual([]);
  });

  it('passes repeated headings at the same level', () => {
    const content = '# A\n\n## B\n\n## B2\n\n### C\n';
    expect(headingHierarchyRule.run(makeChunk(content))).toEqual([]);
  });

  it('passes a chunk that starts at H3 (no preceding level)', () => {
    const content = '### C\n\n#### D\n';
    expect(headingHierarchyRule.run(makeChunk(content))).toEqual([]);
  });

  it('rejects H1 → H3 skip', () => {
    const content = '# A\n\n### C\n';
    const findings = headingHierarchyRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(HEADING_HIERARCHY_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].category).toBe('structural');
    expect(findings[0].chunkId).toBe('chunk-1');
    expect(findings[0].detail).toContain('H1');
    expect(findings[0].detail).toContain('H3');
  });

  it('rejects H2 → H4 skip', () => {
    const content = '## A\n\n#### D\n';
    const findings = headingHierarchyRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].detail).toContain('H2');
    expect(findings[0].detail).toContain('H4');
  });

  it('allows going backwards (H3 → H2)', () => {
    const content = '# A\n\n## B\n\n### C\n\n## B2\n';
    expect(headingHierarchyRule.run(makeChunk(content))).toEqual([]);
  });

  it('emits one finding per skip', () => {
    const content = '# A\n\n### C\n\n## B\n\n#### D\n';
    const findings = headingHierarchyRule.run(makeChunk(content));
    expect(findings.length).toBeGreaterThanOrEqual(2);
    for (const f of findings) {
      expect(f.rule).toBe(HEADING_HIERARCHY_RULE_NAME);
      expect(f.severity).toBe('blocking');
    }
  });

  it('is deterministic across repeated calls', () => {
    const content = '# A\n\n### C\n';
    const first = headingHierarchyRule.run(makeChunk(content));
    const second = headingHierarchyRule.run(makeChunk(content));
    expect(first).toEqual(second);
  });
});

describe('tagToLevel', () => {
  it('returns the digit for valid h1..h6 tags', () => {
    for (let level = 1; level <= 6; level++) {
      expect(tagToLevel(`h${level}`)).toBe(level);
    }
  });

  it('returns null when the tag length is not 2', () => {
    expect(tagToLevel('h10')).toBeNull();
    expect(tagToLevel('h')).toBeNull();
    expect(tagToLevel('')).toBeNull();
  });

  it('returns null when the first character is not "h"', () => {
    expect(tagToLevel('p1')).toBeNull();
    expect(tagToLevel('d2')).toBeNull();
  });

  it('returns null for heading levels outside 1..6', () => {
    expect(tagToLevel('h7')).toBeNull();
    expect(tagToLevel('h0')).toBeNull();
  });

  it('returns null when the second character is not a digit', () => {
    expect(tagToLevel('hx')).toBeNull();
  });
});
