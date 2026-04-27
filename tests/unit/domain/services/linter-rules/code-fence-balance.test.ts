import { describe, it, expect } from 'vitest';
import {
  codeFenceBalanceRule,
  CODE_FENCE_BALANCE_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/code-fence-balance.js';
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

describe('tier1a.code-fence-balance', () => {
  it('returns no findings for null content', () => {
    expect(codeFenceBalanceRule.run(makeChunk(null))).toEqual([]);
  });

  it('returns no findings for empty content', () => {
    expect(codeFenceBalanceRule.run(makeChunk(''))).toEqual([]);
  });

  it('returns no findings for prose without fences', () => {
    expect(codeFenceBalanceRule.run(makeChunk('# Hello\n\nSome paragraph text.'))).toEqual([]);
  });

  it('passes a balanced labeled fence on the allowlist', () => {
    const content = '```typescript\nconst x = 1;\n```\n';
    expect(codeFenceBalanceRule.run(makeChunk(content))).toEqual([]);
  });

  it('passes a balanced unlabeled fence', () => {
    const content = '```\nplain code\n```\n';
    expect(codeFenceBalanceRule.run(makeChunk(content))).toEqual([]);
  });

  it('passes multiple balanced fences with mixed languages', () => {
    const content = [
      '```typescript',
      'const x = 1;',
      '```',
      '',
      'Some prose.',
      '',
      '```python',
      'print("hi")',
      '```',
    ].join('\n');
    expect(codeFenceBalanceRule.run(makeChunk(content))).toEqual([]);
  });

  it('rejects an unbalanced fence (odd delimiter count)', () => {
    const content = '```typescript\nconst x = 1;\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].category).toBe('structural');
    expect(findings[0].chunkId).toBe('chunk-1');
    expect(findings[0].detail).toMatch(/unbalanced|odd/i);
  });

  it('rejects a fence with an unknown language tag', () => {
    const content = '```jsno\nconst x = 1;\n```\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].detail).toContain('jsno');
  });

  it('emits one finding per unknown-language fence', () => {
    const content = ['```fakelang1', 'a', '```', '', '```fakelang2', 'b', '```'].join('\n');
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(2);
    for (const f of findings) {
      expect(f.rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
      expect(f.severity).toBe('blocking');
    }
  });

  it('detects unbalanced tilde fences', () => {
    const content = '~~~python\nprint("x")\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
  });

  it('passes a balanced tilde fence', () => {
    const content = '~~~python\nprint("x")\n~~~\n';
    expect(codeFenceBalanceRule.run(makeChunk(content))).toEqual([]);
  });

  it('detects unbalanced fences nested inside a blockquote', () => {
    const content = '> ```typescript\n> const x = 1;\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
  });

  it('rejects when opening ``` fence is "closed" by ~~~ (marker mismatch)', () => {
    // Per CommonMark, closing fence must use the same marker as the opener.
    // ``` ... ~~~ leaves the ``` unclosed and absorbs the tilde line as content.
    const content = '```typescript\nconst x = 1;\n~~~\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
    expect(findings[0].detail).toContain('```');
  });

  it('rejects when opening ~~~ fence is "closed" by ```', () => {
    const content = '~~~python\nprint("x")\n```\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].detail).toContain('~~~');
  });

  it('rejects when closing fence is shorter than opening', () => {
    // Per CommonMark, closing fence length must be >= opening length.
    // Opening with 4 backticks cannot be closed by 3 backticks.
    const content = '````typescript\nconst x = 1;\n```\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
  });

  it('passes when closing fence is longer than opening (>= opening length)', () => {
    const content = '```typescript\nconst x = 1;\n````\n';
    expect(codeFenceBalanceRule.run(makeChunk(content))).toEqual([]);
  });

  it('does not treat a fence-marker line with info text as a close (CommonMark)', () => {
    // Per CommonMark, a closing fence must have no info string. A line that
    // looks like an opener inside an open fence is literal content. The real
    // close is the final bare ``` line — this chunk is balanced.
    const content = '```typescript\n// Example: ```python inside\n```\n';
    expect(codeFenceBalanceRule.run(makeChunk(content))).toEqual([]);
  });

  it('still detects an actually unclosed fence even when info-text lines appear', () => {
    const content = '```typescript\n// trailing info-text line below\n```python more\n';
    const findings = codeFenceBalanceRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(CODE_FENCE_BALANCE_RULE_NAME);
  });

  it('is deterministic across repeated calls', () => {
    const content = '```bogus\nx\n```\n';
    const first = codeFenceBalanceRule.run(makeChunk(content));
    const second = codeFenceBalanceRule.run(makeChunk(content));
    expect(first).toEqual(second);
  });
});
