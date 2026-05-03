import { describe, it, expect } from 'vitest';
import {
  createTier1aRules,
  createTier1bRules,
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
  titleSpecificityRule,
  difficultyProgressionRule,
} from '../../../../../src/domain/services/linter-rules/index.js';
import { RULE_INTENT } from '../../../../../src/shared/linter/rule-intent.js';

describe('createTier1aRules', () => {
  it('returns all five Tier 1a rules', () => {
    const rules = createTier1aRules();
    expect(rules).toHaveLength(5);
    expect(rules).toEqual([
      codeFenceBalanceRule,
      tableStructureRule,
      headingHierarchyRule,
      detailsNestingRule,
      duplicateH1Rule,
    ]);
  });

  it('returns rules all tagged as chunk-scope, tier1a', () => {
    for (const rule of createTier1aRules()) {
      expect(rule.scope).toBe('chunk');
      expect(rule.tier).toBe('tier1a');
    }
  });

  it('returns a fresh array on each call', () => {
    const a = createTier1aRules();
    const b = createTier1aRules();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('createTier1bRules', () => {
  it('returns all eight Tier 1b rules in registration order', () => {
    const rules = createTier1bRules();
    expect(rules).toEqual([
      phantomPrerequisiteRule,
      phantomChapterRule,
      scaffoldingSectionRule,
      bulletDominantRule,
      wordCountFloorRule,
      wordCountCeilingRule,
      titleSpecificityRule,
      difficultyProgressionRule,
    ]);
  });

  it('returns rules all tagged as tier1b, blockingEligible: false', () => {
    for (const rule of createTier1bRules()) {
      expect(rule.tier).toBe('tier1b');
      expect(rule.blockingEligible).toBe(false);
    }
  });

  it('returns rules whose names exactly match the declared Tier 1b RULE_INTENT entries', () => {
    const registeredNames = new Set(createTier1bRules().map(r => r.name));
    const declaredTier1bNames = new Set(
      Object.keys(RULE_INTENT).filter(k => k.startsWith('tier1b.'))
    );
    expect(registeredNames).toEqual(declaredTier1bNames);
  });

  it('returns a fresh array on each call', () => {
    const a = createTier1bRules();
    const b = createTier1bRules();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
