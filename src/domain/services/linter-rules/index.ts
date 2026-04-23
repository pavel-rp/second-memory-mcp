/**
 * Tier 1a structural-hygiene rules (NEU-628). Content-independent
 * parser-level checks that block `create_topic_with_chunks` before any DB
 * write. Registered into `topicDeps.linterRules` by the composition root.
 */

import type { LinterRule } from '../chunk-linter.js';
import { codeFenceBalanceRule } from './code-fence-balance.js';
import { tableStructureRule } from './table-structure.js';
import { headingHierarchyRule } from './heading-hierarchy.js';
import { detailsNestingRule } from './details-nesting.js';
import { duplicateH1Rule } from './duplicate-h1.js';

export {
  codeFenceBalanceRule,
  tableStructureRule,
  headingHierarchyRule,
  detailsNestingRule,
  duplicateH1Rule,
};

export function createTier1aRules(): LinterRule[] {
  return [
    codeFenceBalanceRule,
    tableStructureRule,
    headingHierarchyRule,
    detailsNestingRule,
    duplicateH1Rule,
  ];
}
