import { getMarkdownIt } from './markdown-it-instance.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const TABLE_STRUCTURE_RULE_NAME = 'tier1a.table-structure';

/**
 * Count cell segments in a single source line from a GFM table by counting
 * unescaped pipes. A leading `|` and trailing `|` are stripped first — they
 * bound the row rather than delimit cells.
 *
 * Example:
 *   `| A | B | C |` → "A | B | C" → 3 cells
 *   `| 1 | 2 |`     → "1 | 2"     → 2 cells
 *   `| a \| b | c |` → "a \| b | c" → 2 cells (escaped pipe not a delimiter)
 */
function countTableCells(line: string): number {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  if (trimmed.length === 0) return 0;
  let count = 1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '|' && (i === 0 || trimmed[i - 1] !== '\\')) count++;
  }
  return count;
}

function runTableStructure(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  const findings: LinterFinding[] = [];
  const tokens = getMarkdownIt().parse(content, {});
  const lines = content.split('\n');

  let tableOpenCount = 0;
  let tableIndex = 0;
  for (const token of tokens) {
    if (token.type !== 'table_open') continue;
    tableOpenCount++;
    tableIndex++;
    const map = token.map;
    if (!map) continue;

    const [startLine, endLine] = map;
    const tableLines = lines.slice(startLine, endLine);
    if (tableLines.length < 2) continue;

    // Body rows start at index 2 (0 = header, 1 = separator). `markdown-it`
    // pads missing cells against the header count when emitting `td_open`
    // tokens, so we inspect the source lines directly for cell-count
    // consistency — that's the spec's literal requirement.
    const headerCells = countTableCells(tableLines[0]);
    for (let i = 2; i < tableLines.length; i++) {
      const bodyCells = countTableCells(tableLines[i]);
      if (bodyCells !== headerCells) {
        findings.push({
          chunkId: chunk.chunkId,
          rule: TABLE_STRUCTURE_RULE_NAME,
          severity: 'blocking',
          category: 'structural',
          detail: `Table #${tableIndex}: body row has ${bodyCells} cells, header has ${headerCells}`,
        });
        break;
      }
    }
  }

  // Heuristic: content that looks like a table (two or more lines bounded
  // by pipes) but produced no `table_open` token means GFM rejected it —
  // typically due to a missing/malformed separator row.
  if (tableOpenCount === 0) {
    const pipeRowMatches = content.match(/^[ \t]*\|.+\|[ \t]*$/gm) ?? [];
    if (pipeRowMatches.length >= 2) {
      findings.push({
        chunkId: chunk.chunkId,
        rule: TABLE_STRUCTURE_RULE_NAME,
        severity: 'blocking',
        category: 'structural',
        detail:
          'Table-like content did not parse as a valid GFM table (missing separator row or malformed delimiters)',
      });
    }
  }

  return findings;
}

export const tableStructureRule = {
  name: TABLE_STRUCTURE_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1a',
  run: runTableStructure,
} satisfies LinterRule;
