/**
 * Declared intent for every linter rule that exists or is planned (NEU-627).
 *
 * `intendedBlocking: true` means the maintainers believe the rule should,
 * once validated, block topic creation on a positive finding. `intendedBlocking:
 * false` means the rule is expected to stay warning-only for now.
 *
 * The OOD validation harness (`pnpm lint:validate`) compares each rule's
 * declared intent against the measured `blocking_eligible` flag in
 * `linter_rule_validation_report` and fails CI when they diverge — a rule that
 * intends to block but has not met the precision/recall thresholds cannot
 * silently ship as non-blocking.
 *
 * Tier 1a rule IDs correspond to the five structural-hygiene rules shipped
 * under NEU-628. Tier 1b rule IDs are the six heuristic rules described in
 * the NEU-617 spec; those rules do not yet exist as code, but their IDs are
 * declared here so the composition-root parity check can flag any future
 * registration mismatch immediately.
 */

export type RuleIntent = {
  intendedBlocking: boolean;
};

// `as const satisfies` preserves the literal key union (so `RuleIntentName`
// resolves to the six Tier 1a + six Tier 1b IDs rather than collapsing to
// `string`) while still validating each value against `RuleIntent`. A plain
// `Readonly<Record<string, RuleIntent>>` annotation would erase the keys.
export const RULE_INTENT = {
  // Tier 1a — structural rules, blocking from day one (NEU-628).
  'tier1a.code-fence-balance': { intendedBlocking: true },
  'tier1a.table-structure': { intendedBlocking: true },
  'tier1a.heading-hierarchy': { intendedBlocking: true },
  'tier1a.details-nesting': { intendedBlocking: true },
  'tier1a.duplicate-h1': { intendedBlocking: true },

  // Tier 1b — heuristic rules staged through the OOD harness (NEU-617).
  // Declared here ahead of the rule implementations so that when NEU-617
  // registers them, the composition-root parity check catches drift on the
  // same commit that introduces the rule.
  'tier1b.phantom-chapter': { intendedBlocking: false },
  'tier1b.scaffolding-section': { intendedBlocking: false },
  'tier1b.bullet-dominant': { intendedBlocking: false },
  'tier1b.word-count-floor': { intendedBlocking: false },
  'tier1b.word-count-ceiling': { intendedBlocking: false },
  'tier1b.phantom-prerequisite': { intendedBlocking: false },

  // Tier 1b — topic-level metadata rules (NEU-618).
  'tier1b.title-specificity': { intendedBlocking: false },
  'tier1b.difficulty-progression': { intendedBlocking: false },
} as const satisfies Record<string, RuleIntent>;

export type RuleIntentName = keyof typeof RULE_INTENT;

/**
 * Minimal shape needed from a rule or a report to apply eligibility — avoids
 * coupling this pure helper to the full `LinterRule` / `RuleValidationReport`
 * types so it can be unit-tested in isolation.
 */
type RuleLike = {
  name: string;
  tier: 'tier1a' | 'tier1b';
  blockingEligible: boolean;
};
type ReportLike = {
  ruleId: string;
  blockingEligible: boolean;
};

/**
 * Pure helper: returns a new array of rules where each Tier 1b rule's
 * `blockingEligible` is set from the corresponding report (defaulting to
 * `false` when no report exists). Tier 1a rules pass through unchanged — they
 * are eligible by construction and the report table does not govern them.
 *
 * Callers pass the full rule object shape so the return type matches; generic
 * `R extends RuleLike` preserves the rule's extra fields (e.g. `scope`, `run`)
 * without the helper needing to know about them.
 */
export function applyEligibilityToRules<R extends RuleLike>(
  rules: readonly R[],
  reports: readonly ReportLike[]
): R[] {
  const reportByRuleId = new Map<string, ReportLike>();
  for (const r of reports) reportByRuleId.set(r.ruleId, r);

  return rules.map(rule => {
    if (rule.tier === 'tier1a') return rule;
    const report = reportByRuleId.get(rule.name);
    const blockingEligible = report?.blockingEligible ?? false;
    if (blockingEligible === rule.blockingEligible) return rule;
    return { ...rule, blockingEligible };
  });
}

/**
 * Startup parity check — asserts that every registered rule has an entry in
 * `RULE_INTENT` (so the harness knows the rule's intended behavior) and that
 * every non-Tier-1b `RULE_INTENT` entry refers to a rule that is actually
 * registered. Tier 1b entries may reference not-yet-registered rules (they
 * are declared ahead of implementation) and are excluded from the reverse
 * direction of the check.
 *
 * Returns an array of human-readable violation messages — empty when
 * everything aligns. Callers decide whether a violation is fatal (composition
 * root logs and continues; unit tests assert empty).
 */
export function validateRuleIntentParity(registeredRuleNames: readonly string[]): string[] {
  const violations: string[] = [];
  const registered = new Set(registeredRuleNames);

  for (const ruleName of registeredRuleNames) {
    if (!(ruleName in RULE_INTENT)) {
      violations.push(
        `Rule "${ruleName}" is registered but has no RULE_INTENT entry — add one to src/shared/linter/rule-intent.ts`
      );
    }
  }

  for (const intentKey of Object.keys(RULE_INTENT)) {
    if (intentKey.startsWith('tier1b.')) continue; // Allowed to be ahead of implementation.
    if (!registered.has(intentKey)) {
      violations.push(
        `RULE_INTENT entry "${intentKey}" points to a non-Tier-1b rule that is not registered`
      );
    }
  }

  return violations;
}
