import { getMarkdownIt } from './markdown-it-instance.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const HEADING_HIERARCHY_RULE_NAME = 'tier1a.heading-hierarchy';

function tagToLevel(tag: string): number | null {
  if (tag.length !== 2 || tag[0] !== 'h') return null;
  const digit = Number(tag[1]);
  return Number.isFinite(digit) && digit >= 1 && digit <= 6 ? digit : null;
}

function runHeadingHierarchy(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  const findings: LinterFinding[] = [];
  const tokens = getMarkdownIt().parse(content, {});

  let prevLevel: number | null = null;
  for (const token of tokens) {
    if (token.type !== 'heading_open') continue;
    const level = tagToLevel(token.tag);
    if (level === null) continue;
    if (prevLevel !== null && level > prevLevel + 1) {
      findings.push({
        chunkId: chunk.chunkId,
        rule: HEADING_HIERARCHY_RULE_NAME,
        severity: 'blocking',
        category: 'structural',
        detail: `Heading hierarchy skip: H${prevLevel} → H${level} (missing H${prevLevel + 1})`,
      });
    }
    prevLevel = level;
  }

  return findings;
}

export const headingHierarchyRule = {
  name: HEADING_HIERARCHY_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1a',
  run: runHeadingHierarchy,
} satisfies LinterRule;
