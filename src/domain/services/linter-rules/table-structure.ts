import { getMarkdownIt } from './markdown-it-instance.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const TABLE_STRUCTURE_RULE_NAME = 'tier1a.table-structure';

/**
 * Count cell segments in a single source line from a GFM table by counting
 * unescaped pipes. One leading `|` and one trailing `|` are stripped first
 * so they don't inflate the count — per GFM, outer pipes are optional but
 * never cell delimiters.
 *
 * Example:
 *   `| A | B | C |` → "A | B | C" → 3 cells
 *   `A | B | C`     → 3 cells
 *   `| 1 | 2 |`     → "1 | 2"     → 2 cells
 *   `| a \| b | c |` → "a \| b | c" → 2 cells (escaped pipe not a delimiter)
 */
export function countTableCells(line: string): number {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  if (trimmed.length === 0) return 0;
  let count = 1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '|' && (i === 0 || trimmed[i - 1] !== '\\')) count++;
  }
  return count;
}

/** Skips block-level markdown prefixes (list items, headings) that are not table rows. */
const BLOCK_PREFIX_RE = /^(?:[-*+][ \t]|\d+[.)][ \t]|#{1,6}[ \t])/;

/**
 * A "pipe row" is a non-blank, non-blockquote, non-list, non-heading line
 * that matches the shape of a GFM table row. Tight criteria reduce false
 * positives on prose containing incidental pipes:
 *
 *   - Line must have outer pipes (starts or ends with unescaped `|`), OR
 *   - Line must have ≥ 3 cells (≥ 2 interior unescaped pipes).
 *
 * A bare `A | B` without outer pipes is too weak a signal — it matches
 * ordinary prose, bullet continuation, and inline type annotations. The
 * cost of missing a 2-cell outer-less malformed table is lower than the
 * cost of rejecting legitimate prose.
 */
export function isPipeRow(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('>')) return false;
  if (BLOCK_PREFIX_RE.test(trimmed)) return false;
  const cells = countTableCells(trimmed);
  if (cells < 2) return false;
  const hasOuter = trimmed.startsWith('|') || trimmed.endsWith('|');
  return hasOuter || cells >= 3;
}

function runTableStructure(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  const findings: LinterFinding[] = [];
  const tokens = getMarkdownIt().parse(content, {});
  const lines = content.split('\n');

  // Collect every line index claimed by a parsed table or a code block (fenced
  // or indented). Pipes inside these ranges are not table-like content for
  // the unparsed-table heuristic below.
  const coveredLines = new Set<number>();
  let tableIndex = 0;
  for (const token of tokens) {
    if (token.type === 'table_open') {
      tableIndex++;
      const map = token.map;
      if (!map) continue;
      const [startLine, endLine] = map;
      for (let i = startLine; i < endLine; i++) coveredLines.add(i);
      const tableLines = lines.slice(startLine, endLine);
      if (tableLines.length < 2) continue;

      // `markdown-it` pads missing cells against the header count when
      // emitting `td_open` tokens, so we inspect the source lines directly
      // for cell-count consistency — that's the spec's literal requirement.
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
    } else if (token.type === 'fence' || token.type === 'code_block') {
      const map = token.map;
      if (!map) continue;
      const [startLine, endLine] = map;
      for (let i = startLine; i < endLine; i++) coveredLines.add(i);
    }
  }

  // Heuristic: consecutive pipe-rows outside parsed tables and code blocks
  // indicate an attempted GFM table that failed to parse (missing separator
  // row, malformed delimiters). Runs regardless of whether the chunk
  // contains other valid tables, and covers tables written with or without
  // outer pipes per GFM semantics.
  let consecutivePipeRows = 0;
  let heuristicReported = false;
  for (let i = 0; i < lines.length; i++) {
    if (coveredLines.has(i)) {
      consecutivePipeRows = 0;
      continue;
    }
    if (isPipeRow(lines[i])) {
      consecutivePipeRows++;
      if (consecutivePipeRows >= 2 && !heuristicReported) {
        findings.push({
          chunkId: chunk.chunkId,
          rule: TABLE_STRUCTURE_RULE_NAME,
          severity: 'blocking',
          category: 'structural',
          detail:
            'Table-like content did not parse as a valid GFM table (missing separator row or malformed delimiters)',
        });
        heuristicReported = true;
      }
    } else {
      consecutivePipeRows = 0;
    }
  }

  return findings;
}

export const tableStructureRule = {
  name: TABLE_STRUCTURE_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1a',
  blockingEligible: true,
  run: runTableStructure,
} satisfies LinterRule;
