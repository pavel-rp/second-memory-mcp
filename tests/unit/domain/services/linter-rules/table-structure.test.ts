import { describe, it, expect } from 'vitest';
import {
  tableStructureRule,
  TABLE_STRUCTURE_RULE_NAME,
  countTableCells,
  isPipeRow,
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

  it('rejects malformed table-like content without outer pipes (3+ cells)', () => {
    // Three-column outer-less rows are detected as table-like; with no
    // separator row, markdown-it rejects them as a table → heuristic fires.
    const content = 'A | B | C\nD | E | F\n';
    const findings = tableStructureRule.run(makeChunk(content));
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings[0].rule).toBe(TABLE_STRUCTURE_RULE_NAME);
    expect(findings[0].severity).toBe('blocking');
  });

  it('does not flag prose with a single interior pipe on consecutive lines', () => {
    // Two-cell outer-less rows are too weak a signal — common in prose.
    const content = 'Some text a | b more prose.\nOther text c | d again.\n';
    expect(tableStructureRule.run(makeChunk(content))).toEqual([]);
  });

  it('does not flag bullet list items that contain a pipe', () => {
    const content = ['- option A | option B first', '- option C | option D second'].join('\n');
    expect(tableStructureRule.run(makeChunk(content))).toEqual([]);
  });

  it('rejects malformed table-like content appearing after a valid table', () => {
    // A chunk with one valid table followed by a broken table-like block
    // must still flag the broken block, not just skip the heuristic.
    const content = [
      '| A | B |',
      '| - | - |',
      '| 1 | 2 |',
      '',
      'Some prose.',
      '',
      '| X | Y |',
      '| 3 | 4 |',
    ].join('\n');
    const findings = tableStructureRule.run(makeChunk(content));
    expect(findings.some(f => f.detail.toLowerCase().includes('did not parse'))).toBe(true);
  });

  it('does not flag pipe usage inside fenced code blocks', () => {
    const content = ['```bash', 'ls | grep foo', 'cat file | sort', '```'].join('\n');
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

describe('countTableCells', () => {
  it('counts cells for rows with outer pipes', () => {
    expect(countTableCells('| A | B | C |')).toBe(3);
  });

  it('counts cells for rows without outer pipes', () => {
    expect(countTableCells('A | B | C')).toBe(3);
  });

  it('treats escaped pipes as content, not delimiters', () => {
    expect(countTableCells('| a \\| b | c |')).toBe(2);
  });

  it('returns 0 when the line is only outer pipes', () => {
    expect(countTableCells('||')).toBe(0);
    expect(countTableCells('|')).toBe(0);
  });

  it('returns 0 for an empty line', () => {
    expect(countTableCells('')).toBe(0);
  });
});

describe('isPipeRow', () => {
  it('returns true for rows with outer pipes', () => {
    expect(isPipeRow('| A | B |')).toBe(true);
    expect(isPipeRow('|A|B|')).toBe(true);
  });

  it('returns false for an empty or whitespace-only line', () => {
    expect(isPipeRow('')).toBe(false);
    expect(isPipeRow('   ')).toBe(false);
  });

  it('returns false for a blockquote line', () => {
    expect(isPipeRow('> A | B | C')).toBe(false);
  });

  it('returns false for a line with no pipes', () => {
    expect(isPipeRow('plain text')).toBe(false);
  });

  it('returns false when a single pipe sits at the start or end', () => {
    expect(isPipeRow('|foo')).toBe(false);
    expect(isPipeRow('foo|')).toBe(false);
  });

  it('returns false for prose with a single interior pipe and no outer pipe', () => {
    expect(isPipeRow('prose a | b more prose')).toBe(false);
    expect(isPipeRow('func(a: int | str)')).toBe(false);
  });

  it('returns false for bullet/ordered list items with pipes', () => {
    expect(isPipeRow('- option A | option B')).toBe(false);
    expect(isPipeRow('* item | value')).toBe(false);
    expect(isPipeRow('1. step | detail')).toBe(false);
  });

  it('returns false for headings with pipes', () => {
    expect(isPipeRow('# heading | with pipe')).toBe(false);
  });

  it('returns true for a 3+ cell row without outer pipes', () => {
    expect(isPipeRow('A | B | C')).toBe(true);
  });
});
