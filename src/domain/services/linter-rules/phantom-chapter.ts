import { getMarkdownIt } from './markdown-it-instance.js';
import {
  PHANTOM_CHAPTER_BOLD_MIN,
  PHANTOM_CHAPTER_H2_MIN,
  PHANTOM_CHAPTER_H3_MIN,
} from '../../../shared/linter/section-thresholds.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const PHANTOM_CHAPTER_RULE_NAME = 'tier1b.phantom-chapter';

/**
 * Phantom-chapter heuristic (NEU-617): a chunk that resembles a fully-formed
 * "chapter" — many H2/H3 sections plus heavy bold emphasis — is suspicious
 * when delivered as a single learning unit. Threshold-engineered against
 * `rsa-foundations` (9 H2, 4 H3, 30+ bold), so it is fixture-overfit by
 * design and ships warning-only until OOD validation (NEU-627) clears it.
 */
function runPhantomChapter(chunk: ChunkLintInput): LinterFinding[] {
  if (!chunk.content) return [];
  const tokens = getMarkdownIt().parse(chunk.content, {});

  let h2Count = 0;
  let h3Count = 0;
  let boldCount = 0;
  for (const token of tokens) {
    if (token.type === 'heading_open') {
      if (token.tag === 'h2') h2Count++;
      else if (token.tag === 'h3') h3Count++;
      continue;
    }
    if (token.type !== 'inline' || token.children === null) continue;
    for (const child of token.children) {
      if (child.type === 'strong_open') boldCount++;
    }
  }

  if (
    h2Count < PHANTOM_CHAPTER_H2_MIN ||
    h3Count < PHANTOM_CHAPTER_H3_MIN ||
    boldCount < PHANTOM_CHAPTER_BOLD_MIN
  ) {
    return [];
  }

  return [
    {
      chunkId: chunk.chunkId,
      rule: PHANTOM_CHAPTER_RULE_NAME,
      severity: 'warning',
      category: 'phantom_chapter',
      detail: `Likely phantom chapter: H2=${h2Count}, H3=${h3Count}, bold=${boldCount}`,
    },
  ];
}

export const phantomChapterRule = {
  name: PHANTOM_CHAPTER_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  run: runPhantomChapter,
} satisfies LinterRule;
