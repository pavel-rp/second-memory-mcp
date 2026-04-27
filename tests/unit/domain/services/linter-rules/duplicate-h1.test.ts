import { describe, it, expect } from 'vitest';
import {
  duplicateH1Rule,
  DUPLICATE_H1_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/duplicate-h1.js';
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

describe('tier1a.duplicate-h1', () => {
  it('returns no findings for null content', () => {
    expect(duplicateH1Rule.run(makeChunk(null))).toEqual([]);
  });

  it('returns no findings for empty content', () => {
    expect(duplicateH1Rule.run(makeChunk(''))).toEqual([]);
  });

  it('passes a chunk with zero H1 headings', () => {
    const content = '## B\n\n### C\n';
    expect(duplicateH1Rule.run(makeChunk(content))).toEqual([]);
  });

  it('passes a chunk with exactly one H1', () => {
    const content = '# Title\n\n## Section\n\nBody.\n';
    expect(duplicateH1Rule.run(makeChunk(content))).toEqual([]);
  });

  it('rejects a chunk with two H1 headings', () => {
    const content = '# First\n\nBody.\n\n# Second\n\nMore body.\n';
    const findings = duplicateH1Rule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(DUPLICATE_H1_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].category).toBe('structural');
    expect(findings[0].chunkId).toBe('chunk-1');
    expect(findings[0].detail).toMatch(/duplicate|H1/i);
  });

  it('also detects setext-style H1 (underline with =)', () => {
    const content = 'Title\n=====\n\nBody.\n\n# Second\n\nMore.\n';
    const findings = duplicateH1Rule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(DUPLICATE_H1_RULE_NAME);
  });

  it('emits exactly one finding even with three H1 headings', () => {
    const content = '# A\n# B\n# C\n';
    const findings = duplicateH1Rule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
  });

  it('is deterministic across repeated calls', () => {
    const content = '# A\n\n# B\n';
    const first = duplicateH1Rule.run(makeChunk(content));
    const second = duplicateH1Rule.run(makeChunk(content));
    expect(first).toEqual(second);
  });
});
