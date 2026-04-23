import { describe, it, expect } from 'vitest';
import {
  tableStructureRule,
  TABLE_STRUCTURE_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/table-structure.js';
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

describe('tier1a.table-structure', () => {
  it('returns no findings for null content', () => {
    expect(tableStructureRule.run(makeChunk(null))).toEqual([]);
  });

  it('returns no findings for empty content', () => {
    expect(tableStructureRule.run(makeChunk(''))).toEqual([]);
  });

  it('returns no findings for prose without tables', () => {
    expect(
      tableStructureRule.run(makeChunk('# Hello\n\nSome paragraph text with no pipes.'))
    ).toEqual([]);
  });

  it('passes a well-formed 2-column GFM table', () => {
    const content = ['| A | B |', '| - | - |', '| 1 | 2 |', '| 3 | 4 |'].join('\n');
    expect(tableStructureRule.run(makeChunk(content))).toEqual([]);
  });

  it('rejects a table whose body row has fewer cells than the header', () => {
    const content = ['| A | B | C |', '| - | - | - |', '| 1 | 2 |'].join('\n');
    const findings = tableStructureRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(TABLE_STRUCTURE_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].category).toBe('structural');
    expect(findings[0].chunkId).toBe('chunk-1');
    expect(findings[0].detail).toMatch(/cells?/);
  });

  it('rejects table-like content with no separator row', () => {
    const content = ['| A | B |', '| 1 | 2 |', '| 3 | 4 |'].join('\n');
    const findings = tableStructureRule.run(makeChunk(content));
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe(TABLE_STRUCTURE_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].detail).toMatch(/separator|did not parse/i);
  });

  it('passes a single pipe inside prose (not table-like)', () => {
    const content = 'Some text a | b that is not a table.';
    expect(tableStructureRule.run(makeChunk(content))).toEqual([]);
  });

  it('emits one finding per broken table', () => {
    const content = [
      '| A | B | C |',
      '| - | - | - |',
      '| 1 | 2 |',
      '',
      '| X | Y | Z |',
      '| - | - | - |',
      '| 9 |',
    ].join('\n');
    const findings = tableStructureRule.run(makeChunk(content));
    expect(findings.length).toBeGreaterThanOrEqual(2);
    for (const f of findings) {
      expect(f.rule).toBe(TABLE_STRUCTURE_RULE_NAME);
      expect(f.severity).toBe('blocking');
    }
  });

  it('is deterministic across repeated calls', () => {
    const content = ['| A | B |', '| 1 | 2 |'].join('\n');
    const first = tableStructureRule.run(makeChunk(content));
    const second = tableStructureRule.run(makeChunk(content));
    expect(first).toEqual(second);
  });
});
