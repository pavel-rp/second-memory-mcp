import { describe, it, expect } from 'vitest';
import {
  detailsNestingRule,
  DETAILS_NESTING_RULE_NAME,
  DETAILS_MAX_DEPTH,
} from '../../../../../src/domain/services/linter-rules/details-nesting.js';
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

describe('tier1a.details-nesting', () => {
  it('returns no findings for null content', () => {
    expect(detailsNestingRule.run(makeChunk(null))).toEqual([]);
  });

  it('returns no findings for empty content', () => {
    expect(detailsNestingRule.run(makeChunk(''))).toEqual([]);
  });

  it('returns no findings for content without <details>', () => {
    expect(detailsNestingRule.run(makeChunk('# Hi\n\nSome prose.'))).toEqual([]);
  });

  it('passes depth 1', () => {
    const content = '<details><summary>X</summary>Body</details>';
    expect(detailsNestingRule.run(makeChunk(content))).toEqual([]);
  });

  it('passes depth 3 (at the limit)', () => {
    const content =
      '<details><summary>1</summary>\n<details><summary>2</summary>\n<details><summary>3</summary>Body</details></details></details>';
    expect(detailsNestingRule.run(makeChunk(content))).toEqual([]);
  });

  it('rejects depth 4 (above the limit)', () => {
    const content =
      '<details><details><details><details>deep</details></details></details></details>';
    const findings = detailsNestingRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(DETAILS_NESTING_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].category).toBe('structural');
    expect(findings[0].chunkId).toBe('chunk-1');
    expect(findings[0].detail).toContain('4');
    expect(findings[0].detail).toContain(String(DETAILS_MAX_DEPTH));
  });

  it('rejects depth 5 and reports the max depth reached', () => {
    const content =
      '<details><details><details><details><details>x</details></details></details></details></details>';
    const findings = detailsNestingRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].detail).toContain('5');
  });

  it('ignores case in tag detection', () => {
    const content = '<DETAILS><Details><details><Details>x</details></details></details></DETAILS>';
    const findings = detailsNestingRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
  });

  it('ignores <details> tags inside fenced code blocks (literal text)', () => {
    const content = [
      '```html',
      '<details>',
      '  <details>',
      '    <details>',
      '      <details>text</details>',
      '    </details>',
      '  </details>',
      '</details>',
      '```',
    ].join('\n');
    expect(detailsNestingRule.run(makeChunk(content))).toEqual([]);
  });

  it('is deterministic across repeated calls', () => {
    const content = '<details><details><details><details>x</details></details></details></details>';
    const first = detailsNestingRule.run(makeChunk(content));
    const second = detailsNestingRule.run(makeChunk(content));
    expect(first).toEqual(second);
  });
});
