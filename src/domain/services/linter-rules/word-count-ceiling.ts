import { WORD_COUNT_CEILING } from '../../../shared/linter/section-thresholds.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';
import { countWords } from './word-count.js';

export const WORD_COUNT_CEILING_RULE_NAME = 'tier1b.word-count-ceiling';

/**
 * Word-count-ceiling heuristic (NEU-617): chunks above 1500 words are flagged
 * as potentially over-stuffed. No knowledge-type carve-out — long-form
 * content of any kind is worth a closer look. Ships warning-only; OOD-gated
 * for promotion via NEU-627.
 */
function runWordCountCeiling(chunk: ChunkLintInput): LinterFinding[] {
  if (!chunk.content) return [];
  const wordCount = countWords(chunk.content);
  if (wordCount <= WORD_COUNT_CEILING) return [];

  return [
    {
      chunkId: chunk.chunkId,
      rule: WORD_COUNT_CEILING_RULE_NAME,
      severity: 'warning',
      category: 'word_count_ceiling',
      detail: `Chunk has ${wordCount} words (ceiling: ${WORD_COUNT_CEILING})`,
    },
  ];
}

export const wordCountCeilingRule = {
  name: WORD_COUNT_CEILING_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  run: runWordCountCeiling,
} satisfies LinterRule;
