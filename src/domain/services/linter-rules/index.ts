/**
 * Linter rule registry. Tier 1a structural-hygiene rules (NEU-628) ship blocking
 * from day 1. Tier 1b heuristic rules (NEU-616 onward) ship warning-only and may
 * be promoted to blocking by the OOD validation harness (NEU-627) on a per-rule
 * basis. Both factories are consumed by the composition root, which composes the
 * combined rule list and threads `applyEligibilityToRules` over it.
 */

import type { LinterRule } from '../chunk-linter.js';
import { codeFenceBalanceRule } from './code-fence-balance.js';
import { tableStructureRule } from './table-structure.js';
import { headingHierarchyRule } from './heading-hierarchy.js';
import { detailsNestingRule } from './details-nesting.js';
import { duplicateH1Rule } from './duplicate-h1.js';
import { phantomPrerequisiteRule } from './phantom-prerequisite.js';
import { phantomChapterRule } from './phantom-chapter.js';
import { scaffoldingSectionRule } from './scaffolding-section.js';
import { bulletDominantRule } from './bullet-dominant.js';
import { wordCountFloorRule } from './word-count-floor.js';
import { wordCountCeilingRule } from './word-count-ceiling.js';

export {
  codeFenceBalanceRule,
  tableStructureRule,
  headingHierarchyRule,
  detailsNestingRule,
  duplicateH1Rule,
  phantomPrerequisiteRule,
  phantomChapterRule,
  scaffoldingSectionRule,
  bulletDominantRule,
  wordCountFloorRule,
  wordCountCeilingRule,
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

export function createTier1bRules(): LinterRule[] {
  return [
    phantomPrerequisiteRule,
    phantomChapterRule,
    scaffoldingSectionRule,
    bulletDominantRule,
    wordCountFloorRule,
    wordCountCeilingRule,
  ];
}
