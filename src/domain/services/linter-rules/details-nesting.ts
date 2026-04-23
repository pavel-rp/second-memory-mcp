import { getMarkdownIt } from './markdown-it-instance.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const DETAILS_NESTING_RULE_NAME = 'tier1a.details-nesting';
export const DETAILS_MAX_DEPTH = 3;

/**
 * Count `<details>` nesting depth from the given text fragment, updating the
 * running `depth` and `maxDepth`. Mutates the `state` object in place so the
 * caller can aggregate across multiple token fragments.
 *
 * A fresh `RegExp` is constructed per call — module-level `g`-flagged regexes
 * carry `lastIndex` state and would leak between calls if an exception ever
 * interrupted the exec loop.
 */
function scanFragment(text: string, state: { depth: number; maxDepth: number }): void {
  const tagRe = /<details\b[^>]*>|<\/details\s*>/gi;
  let match: RegExpExecArray | null = tagRe.exec(text);
  while (match !== null) {
    if (match[0].startsWith('</')) {
      if (state.depth > 0) state.depth--;
    } else {
      state.depth++;
      if (state.depth > state.maxDepth) state.maxDepth = state.depth;
    }
    match = tagRe.exec(text);
  }
}

function runDetailsNesting(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  // Walk markdown-it tokens so that `<details>` occurrences inside fenced
  // code blocks (where they are literal text, not HTML) are ignored. Only
  // HTML-emitting token types are scanned: `html_block` at the block level
  // and `html_inline` inside inline token children.
  const tokens = getMarkdownIt().parse(content, {});
  const state = { depth: 0, maxDepth: 0 };

  for (const token of tokens) {
    if (token.type === 'html_block') {
      scanFragment(token.content, state);
    } else if (token.type === 'inline' && token.children) {
      for (const child of token.children) {
        if (child.type === 'html_inline') {
          scanFragment(child.content, state);
        }
      }
    }
  }

  if (state.maxDepth > DETAILS_MAX_DEPTH) {
    return [
      {
        chunkId: chunk.chunkId,
        rule: DETAILS_NESTING_RULE_NAME,
        severity: 'blocking',
        category: 'structural',
        detail: `<details> nesting depth ${state.maxDepth} exceeds limit of ${DETAILS_MAX_DEPTH}`,
      },
    ];
  }

  return [];
}

export const detailsNestingRule = {
  name: DETAILS_NESTING_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1a',
  run: runDetailsNesting,
} satisfies LinterRule;
