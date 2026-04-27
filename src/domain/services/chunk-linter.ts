/**
 * Chunk linter framework — shared scaffolding for content-quality rules applied during
 * topic creation (and, in follow-up work, content updates).
 *
 * ## Determinism contract
 *
 * `runLinterSuite` aggregates findings in a deterministic traversal order:
 *   1. Rules are evaluated in the order they appear in the `rules` array (registration order).
 *   2. Within a `scope: 'chunk'` rule, the rule runs once per chunk in
 *      `TopicLintInput.chunks` array order.
 *   3. `scope: 'topic'` rules run exactly once per suite call with the full topic input.
 *
 * The returned `findings` array reflects (rule registration order) × (chunk order for
 * chunk-scope rules). Permuting the `rules` array will reorder the output; within a
 * fixed `rules` array, output is stable across calls with identical input.
 *
 * ## Fail-open on rule exceptions
 *
 * A rule whose `run()` throws is treated as contributing zero findings; the suite
 * continues. If the caller passes an `onRuleError` callback via `options`, it is
 * invoked with the rule name and the thrown error so the caller can log or emit
 * diagnostics — the domain module itself performs no I/O. A callback that throws
 * is swallowed to preserve the fail-open contract.
 *
 * ## Zero I/O
 *
 * This module performs no network, filesystem, database, timing, or logging calls.
 * Rule implementations must follow the same rule (ARCH-F4/F5 compliance).
 */

import type { KnowledgeType } from '../types/entities.js';

export type LinterSeverity = 'blocking' | 'warning';

export type LinterFinding = {
  chunkId: string;
  rule: string;
  severity: LinterSeverity;
  category: string;
  detail: string;
  suggestion?: string;
};

export type ChunkLintInput = {
  chunkId: string;
  title: string;
  content: string | null;
  chunkType: string;
  condensedSummary: string | null;
  prerequisites: string[];
  tags: string[];
  difficulty: number;
  estimatedDuration: number;
  /**
   * Knowledge-type classification when known. Consumed by the
   * `tier1b.word-count-floor` rule (NEU-617): `'fact'`-typed chunks are
   * exempt from the 300-word floor since facts are legitimately terse.
   * `null` when the author did not tag the chunk.
   */
  knowledgeType: KnowledgeType | null;
};

export type TopicLintInput = {
  /** Empty string during pre-persist create-path lints (topic UUID is allocated inside the transaction). */
  topicId: string;
  topicTitle: string;
  subject: string;
  topicSummary: string;
  chunks: ChunkLintInput[];
};

/**
 * Tier classifies the rule for `validator_report` persistence (NEU-629).
 *  - `tier1a` — structural blocking rules
 *  - `tier1b` — heuristic warning rules
 *
 * Tier 2 (classifier) is not produced by `runLinterSuite` and therefore has no
 * representation here.
 */
export type LinterRuleTier = 'tier1a' | 'tier1b';

/**
 * `blockingEligible` gates whether a rule's `severity: 'blocking'` findings
 * actually block topic creation. When `false`, the suite downgrades any
 * blocking finding from this rule to `severity: 'warning'` before aggregation.
 *
 * Tier 1a rules are eligible by construction — they are parser-level structural
 * checks with zero false positives on well-formed input. Tier 1b rules default
 * to ineligible; the OOD validation harness (NEU-627) promotes individual
 * rules to eligible once they clear precision/recall thresholds on a labeled
 * held-out and adversarial corpus.
 */
export type LinterRule =
  | {
      name: string;
      scope: 'chunk';
      tier: LinterRuleTier;
      blockingEligible: boolean;
      run: (input: ChunkLintInput) => LinterFinding[];
    }
  | {
      name: string;
      scope: 'topic';
      tier: LinterRuleTier;
      blockingEligible: boolean;
      run: (input: TopicLintInput) => LinterFinding[];
    };

export type LinterSuiteResult = {
  findings: LinterFinding[];
  blocking: boolean;
};

export type LinterSuiteOptions = {
  /** Invoked when a rule's `run()` throws. Lets callers plumb in logging/metrics from outside the domain layer. */
  onRuleError?: (ruleName: string, error: unknown) => void;
};

export function runLinterSuite(
  rules: readonly LinterRule[],
  input: TopicLintInput,
  options?: LinterSuiteOptions
): LinterSuiteResult {
  const findings: LinterFinding[] = [];
  const onRuleError = options?.onRuleError;

  for (const rule of rules) {
    if (rule.scope === 'chunk') {
      for (const chunk of input.chunks) {
        const produced = safeRun(() => rule.run(chunk), rule.name, onRuleError);
        for (const finding of produced) findings.push(applyEligibility(finding, rule));
      }
    } else {
      const produced = safeRun(() => rule.run(input), rule.name, onRuleError);
      for (const finding of produced) findings.push(applyEligibility(finding, rule));
    }
  }

  return {
    findings,
    blocking: findings.some(f => f.severity === 'blocking'),
  };
}

/**
 * Pure per-finding severity transform. When the emitting rule is not
 * blocking-eligible, any `severity: 'blocking'` finding is rewritten to
 * `severity: 'warning'`. All other fields are preserved unchanged. Eligible
 * rules pass findings through by reference.
 */
function applyEligibility(finding: LinterFinding, rule: LinterRule): LinterFinding {
  if (rule.blockingEligible) return finding;
  if (finding.severity !== 'blocking') return finding;
  return { ...finding, severity: 'warning' };
}

function safeRun(
  run: () => LinterFinding[],
  ruleName: string,
  onRuleError: LinterSuiteOptions['onRuleError']
): LinterFinding[] {
  try {
    return run();
  } catch (error) {
    if (onRuleError) {
      try {
        onRuleError(ruleName, error);
      } catch {
        // Callback itself failed — preserve fail-open contract regardless.
      }
    }
    return [];
  }
}
