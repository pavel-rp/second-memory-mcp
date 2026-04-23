import { describe, it, expect } from 'vitest';
import {
  createTier1aRules,
  codeFenceBalanceRule,
  tableStructureRule,
  headingHierarchyRule,
  detailsNestingRule,
  duplicateH1Rule,
} from '../../../../../src/domain/services/linter-rules/index.js';

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
