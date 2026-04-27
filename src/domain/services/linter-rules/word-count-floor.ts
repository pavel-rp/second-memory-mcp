import { WORD_COUNT_FLOOR } from '../../../shared/linter/section-thresholds.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';
import { countWords } from './word-count.js';

export const WORD_COUNT_FLOOR_RULE_NAME = 'tier1b.word-count-floor';

/**
 * Word-count-floor heuristic (NEU-617): chunks with fewer than 300 words are
 * flagged as potentially under-developed, except `knowledgeType === 'fact'`
 * — single-fact chunks (e.g. definitions, dates, formulas) are legitimately
 * terse. Threshold derived from the §Q7 retro audit, not from a held-out
 * corpus, so this rule ships warning-only and is OOD-gated for promotion via
 * NEU-627.
 */
function runWordCountFloor(chunk: ChunkLintInput): LinterFinding[] {
  if (!chunk.content) return [];
  if (chunk.knowledgeType === 'fact') return [];
  const wordCount = countWords(chunk.content);
  if (wordCount === 0 || wordCount >= WORD_COUNT_FLOOR) return [];

  return [
    {
      chunkId: chunk.chunkId,
      rule: WORD_COUNT_FLOOR_RULE_NAME,
      severity: 'warning',
      category: 'word_count_floor',
      detail: `Chunk has ${wordCount} words (floor: ${WORD_COUNT_FLOOR})`,
    },
  ];
}

export const wordCountFloorRule = {
  name: WORD_COUNT_FLOOR_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  run: runWordCountFloor,
} satisfies LinterRule;
