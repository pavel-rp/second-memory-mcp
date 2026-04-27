import { SCAFFOLDING_SECTION_HEADINGS } from '../../../shared/linter/section-thresholds.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const SCAFFOLDING_SECTION_RULE_NAME = 'tier1b.scaffolding-section';

/**
 * Pre-built case-sensitive matcher: `^## (Practice Problems|Exercises|Summary)\s*$`
 * with the `m` flag so each line is anchored independently. Built once at
 * module load — the allowlist is a const.
 */
const HEADING_MATCHER = new RegExp(
  `^## (${SCAFFOLDING_SECTION_HEADINGS.map(escapeRegExp).join('|')})\\s*$`,
  'gm'
);

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scaffolding-section heuristic (NEU-617): chunks containing a top-level
 * scaffolding heading (`## Practice Problems`, `## Exercises`, `## Summary`)
 * conflate scaffolding with content. Derived from 38 known E5 chunks; narrow
 * by design. Each matched heading produces one finding in source-line order.
 */
function runScaffoldingSection(chunk: ChunkLintInput): LinterFinding[] {
  if (!chunk.content) return [];
  const findings: LinterFinding[] = [];
  // `matchAll` over a /m global regex yields matches in source order; reset
  // is not required since we exhaust the iterator within this single call.
  for (const match of chunk.content.matchAll(HEADING_MATCHER)) {
    findings.push({
      chunkId: chunk.chunkId,
      rule: SCAFFOLDING_SECTION_RULE_NAME,
      severity: 'warning',
      category: 'scaffolding_section',
      detail: `Scaffolding section heading: "## ${match[1]}"`,
    });
  }
  return findings;
}

export const scaffoldingSectionRule = {
  name: SCAFFOLDING_SECTION_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  run: runScaffoldingSection,
} satisfies LinterRule;
