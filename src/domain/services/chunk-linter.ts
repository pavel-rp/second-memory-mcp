import { getRequestLogger } from '../../shared/logger.js';

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
 * A rule whose `run()` throws is treated as contributing zero findings. The exception
 * is logged via `getRequestLogger().warn(...)` and the suite continues. This preserves
 * topic creation availability when a rule implementation is buggy — blocking rules only
 * block when they produce an explicit `severity: 'blocking'` finding, never by crashing.
 *
 * ## Zero I/O
 *
 * This module performs no network, filesystem, database, or timing calls beyond the
 * pure `try/catch` + logger.warn path. Rule implementations must follow the same rule
 * (ARCH-F4/F5 compliance).
 */

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
};

export type TopicLintInput = {
  /** Empty string during pre-persist create-path lints (topic UUID is allocated inside the transaction). */
  topicId: string;
  topicTitle: string;
  subject: string;
  topicSummary: string;
  chunks: ChunkLintInput[];
};

export type LinterRule =
  | {
      name: string;
      scope: 'chunk';
      run: (input: ChunkLintInput) => LinterFinding[];
    }
  | {
      name: string;
      scope: 'topic';
      run: (input: TopicLintInput) => LinterFinding[];
    };

export type LinterSuiteResult = {
  findings: LinterFinding[];
  blocking: boolean;
};

export function runLinterSuite(
  rules: readonly LinterRule[],
  input: TopicLintInput
): LinterSuiteResult {
  const findings: LinterFinding[] = [];

  for (const rule of rules) {
    if (rule.scope === 'chunk') {
      for (const chunk of input.chunks) {
        const produced = safeRun(() => rule.run(chunk), rule.name);
        for (const finding of produced) findings.push(finding);
      }
    } else {
      const produced = safeRun(() => rule.run(input), rule.name);
      for (const finding of produced) findings.push(finding);
    }
  }

  return {
    findings,
    blocking: findings.some(f => f.severity === 'blocking'),
  };
}

function safeRun(run: () => LinterFinding[], ruleName: string): LinterFinding[] {
  try {
    return run();
  } catch (error) {
    try {
      getRequestLogger().warn(
        `Linter rule "${ruleName}" threw — treating as zero findings:`,
        error
      );
    } catch {
      // Logger itself failed — preserve fail-open contract regardless.
    }
    return [];
  }
}
