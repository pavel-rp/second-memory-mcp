import { getMarkdownIt } from './markdown-it-instance.js';
import {
  BULLET_DOMINANCE_PARAGRAPH_FLOOR,
  BULLET_DOMINANCE_RATIO,
} from '../../../shared/linter/section-thresholds.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const BULLET_DOMINANT_RULE_NAME = 'tier1b.bullet-dominant';

/**
 * Bullet-dominant heuristic (NEU-617): chunks where bullet/numbered-list
 * paragraphs make up more than 70% of all paragraphs (above a 3-paragraph
 * floor) are flagged as bullet-heavy. The depth counter ensures paragraphs
 * inside nested lists count once (at their own paragraph depth) rather than
 * being multiplied by enclosing list opens.
 */
function runBulletDominant(chunk: ChunkLintInput): LinterFinding[] {
  if (!chunk.content) return [];
  const tokens = getMarkdownIt().parse(chunk.content, {});

  let listDepth = 0;
  let paragraphCount = 0;
  let bulletParagraphCount = 0;
  for (const token of tokens) {
    switch (token.type) {
      case 'bullet_list_open':
      case 'ordered_list_open':
        listDepth++;
        break;
      case 'bullet_list_close':
      case 'ordered_list_close':
        if (listDepth > 0) listDepth--;
        break;
      case 'paragraph_open':
        // markdown-it emits paragraph_open for tight list items too — list
        // tightness is a renderer concern, not a token-stream one — so
        // listDepth > 0 reliably identifies list paragraphs in either mode.
        paragraphCount++;
        if (listDepth > 0) bulletParagraphCount++;
        break;
    }
  }

  if (paragraphCount < BULLET_DOMINANCE_PARAGRAPH_FLOOR) return [];
  const ratio = bulletParagraphCount / paragraphCount;
  if (ratio <= BULLET_DOMINANCE_RATIO) return [];

  return [
    {
      chunkId: chunk.chunkId,
      rule: BULLET_DOMINANT_RULE_NAME,
      severity: 'warning',
      category: 'bullet_dominance',
      detail: `${bulletParagraphCount}/${paragraphCount} paragraphs are bullets (ratio ${ratio.toFixed(2)} > ${BULLET_DOMINANCE_RATIO})`,
    },
  ];
}

export const bulletDominantRule = {
  name: BULLET_DOMINANT_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  run: runBulletDominant,
} satisfies LinterRule;
