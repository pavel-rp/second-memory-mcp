import { describe, it, expect } from 'vitest';
import {
  RULE_INTENT,
  applyEligibilityToRules,
  validateRuleIntentParity,
  type RuleIntentName,
} from '../../../../src/shared/linter/rule-intent.js';

describe('RULE_INTENT', () => {
  it('declares every Tier 1a rule intent as intendedBlocking: true', () => {
    const tier1aKeys = Object.keys(RULE_INTENT).filter(k => k.startsWith('tier1a.'));
    expect(tier1aKeys).toEqual([
      'tier1a.code-fence-balance',
      'tier1a.table-structure',
      'tier1a.heading-hierarchy',
      'tier1a.details-nesting',
      'tier1a.duplicate-h1',
    ]);
    for (const k of tier1aKeys) {
      expect(RULE_INTENT[k as RuleIntentName].intendedBlocking).toBe(true);
    }
  });

  it('declares every Tier 1b rule intent as intendedBlocking: false', () => {
    const tier1bKeys = Object.keys(RULE_INTENT).filter(k => k.startsWith('tier1b.'));
    expect(tier1bKeys).toEqual([
      'tier1b.phantom-chapter',
      'tier1b.scaffolding-section',
      'tier1b.bullet-dominant',
      'tier1b.word-count-floor',
      'tier1b.word-count-ceiling',
      'tier1b.phantom-prerequisite',
    ]);
    for (const k of tier1bKeys) {
      expect(RULE_INTENT[k as RuleIntentName].intendedBlocking).toBe(false);
    }
  });

  it('is readonly at the type level — TS rejects mutation at compile time', () => {
    // `as const satisfies Record<string, RuleIntent>` gives RULE_INTENT a
    // deeply-readonly type; attempting to reassign a key would fail type
    // check. At runtime the object is not `Object.freeze()`d — we rely on
    // the type system for the guarantee, which is sufficient for internal
    // callers and produces a precise key union via `keyof typeof`.
    const keys = Object.keys(RULE_INTENT);
    expect(keys.length).toBe(11);
  });
});

describe('applyEligibilityToRules', () => {
  const tier1aRule = {
    name: 'tier1a.code-fence-balance',
    tier: 'tier1a' as const,
    blockingEligible: true,
  };
  const tier1bRule = {
    name: 'tier1b.phantom-chapter',
    tier: 'tier1b' as const,
    blockingEligible: false,
  };

  it('flips Tier 1b blockingEligible when report says eligible', () => {
    const out = applyEligibilityToRules(
      [tier1aRule, tier1bRule],
      [{ ruleId: 'tier1b.phantom-chapter', blockingEligible: true }]
    );
    expect(out[0]).toBe(tier1aRule); // Tier 1a unchanged by reference.
    expect(out[1]).not.toBe(tier1bRule); // Tier 1b returned as a new object.
    expect(out[1].blockingEligible).toBe(true);
  });

  it('defaults Tier 1b to false when no report exists', () => {
    const withEligible = { ...tier1bRule, blockingEligible: true };
    const out = applyEligibilityToRules([withEligible], []);
    expect(out[0].blockingEligible).toBe(false);
  });

  it('never flips Tier 1a even if a stray report names a Tier 1a rule', () => {
    const out = applyEligibilityToRules(
      [tier1aRule],
      [{ ruleId: 'tier1a.code-fence-balance', blockingEligible: false }]
    );
    expect(out[0]).toBe(tier1aRule);
    expect(out[0].blockingEligible).toBe(true);
  });

  it('is idempotent — running twice against the same reports yields equal rules', () => {
    const reports = [{ ruleId: 'tier1b.phantom-chapter', blockingEligible: true }];
    const first = applyEligibilityToRules([tier1bRule], reports);
    const second = applyEligibilityToRules(first, reports);
    expect(second[0].blockingEligible).toBe(true);
    // Same-reference optimization: after the first pass already set the
    // flag, the second pass returns the same object by reference.
    expect(second[0]).toBe(first[0]);
  });
});

describe('validateRuleIntentParity', () => {
  it('returns no violations when every registered rule has a matching Tier 1a intent', () => {
    const violations = validateRuleIntentParity([
      'tier1a.code-fence-balance',
      'tier1a.table-structure',
      'tier1a.heading-hierarchy',
      'tier1a.details-nesting',
      'tier1a.duplicate-h1',
    ]);
    expect(violations).toEqual([]);
  });

  it('flags a registered rule with no RULE_INTENT entry', () => {
    const violations = validateRuleIntentParity(['tier1a.code-fence-balance', 'ghost.rule']);
    const ghostViolations = violations.filter(v => v.includes('ghost.rule'));
    expect(ghostViolations).toHaveLength(1);
    expect(ghostViolations[0]).toContain('no RULE_INTENT entry');
  });

  it('allows Tier 1b intents to exist without a corresponding registered rule', () => {
    // Tier 1b rules are declared in RULE_INTENT ahead of implementation — the
    // parity check must not complain about their absence from the registry.
    const violations = validateRuleIntentParity(['tier1a.code-fence-balance']);
    // Only the missing tier1a intents would violate.
    expect(violations.every(v => !v.includes('tier1b.'))).toBe(true);
  });

  it('flags a non-Tier-1b RULE_INTENT entry that has no registered rule', () => {
    // Tier 1a rules must be both declared AND registered — if we pass an
    // empty registry, every tier1a.* entry in RULE_INTENT becomes a violation.
    const violations = validateRuleIntentParity([]);
    const tier1aViolations = violations.filter(v => v.includes('tier1a.'));
    expect(tier1aViolations).toHaveLength(5);
  });
});
