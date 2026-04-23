import { getMarkdownIt } from './markdown-it-instance.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const DUPLICATE_H1_RULE_NAME = 'tier1a.duplicate-h1';

function runDuplicateH1(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  const tokens = getMarkdownIt().parse(content, {});
  let h1Count = 0;
  for (const token of tokens) {
    if (token.type === 'heading_open' && token.tag === 'h1') {
      h1Count++;
      if (h1Count > 1) break;
    }
  }

  if (h1Count > 1) {
    return [
      {
        chunkId: chunk.chunkId,
        rule: DUPLICATE_H1_RULE_NAME,
        severity: 'blocking',
        category: 'structural',
        detail: 'Duplicate H1 in chunk body (at most one H1 allowed)',
      },
    ];
  }

  return [];
}

export const duplicateH1Rule = {
  name: DUPLICATE_H1_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1a',
  run: runDuplicateH1,
} satisfies LinterRule;
