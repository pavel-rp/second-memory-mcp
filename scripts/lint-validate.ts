#!/usr/bin/env tsx
/**
 * `pnpm lint:validate` (NEU-627).
 *
 * For every registered linter rule, this script:
 *   1. Loads the rule's labelled corpus from
 *      `infrastructure.linter_validation_corpus`.
 *   2. Resolves each labelled chunk's content from `learning_chunks`.
 *   3. Runs the rule against each chunk in isolation; counts whether the
 *      rule flagged the chunk vs. the expected verdict.
 *   4. Computes precision / recall / F1 on the held-out split (and
 *      precision on adversarial-negative).
 *   5. Upserts an `infrastructure.linter_rule_validation_report` row with
 *      the metrics, the corpus counts, and the derived
 *      `blocking_eligible` flag.
 *   6. Prints a one-line-per-rule summary table.
 *
 * Exit code: `1` if (a) any rule whose `RULE_INTENT[id].intendedBlocking`
 * is `true` has `blocking_eligible: false` (declared intent diverges from
 * measured eligibility), or (b) the registered rule set drifts from
 * `RULE_INTENT` (missing intent for a registered rule, or a non-Tier-1b
 * intent entry that is not registered). Otherwise `0`.
 *
 * Chunks listed in the corpus but absent from `learning_chunks` are
 * skipped with a stderr warning and excluded from the metric counts.
 */

import 'dotenv/config';
import { inArray } from 'drizzle-orm';
import { getSql } from '../src/infrastructure/db/operations.js';
import { getPool } from '../src/infrastructure/db/client.js';
import { learningChunks } from '../src/infrastructure/db/schema.js';
import { DrizzleLinterValidationRepository } from '../src/adapters/drizzle/linter-validation-repository.js';
import type {
  CorpusEntry,
  LinterValidationRepository,
  RuleValidationReport,
} from '../src/ports/linter-validation-repository.js';
import { createTier1aRules } from '../src/domain/services/linter-rules/index.js';
import {
  type ChunkLintInput,
  type LinterFinding,
  type LinterRule,
  type TopicLintInput,
} from '../src/domain/services/chunk-linter.js';
import { RULE_INTENT, validateRuleIntentParity } from '../src/shared/linter/rule-intent.js';
import {
  DEFAULT_ELIGIBILITY_THRESHOLDS,
  THRESHOLDS_VERSION,
  computeMetrics,
  evaluateEligibility,
  explainEligibilityMiss,
  type EligibilityCounts,
  type EligibilityMetrics,
} from '../src/domain/services/linter-validation/calculator.js';
import { logger } from '../src/shared/logger.js';

/**
 * Standard binary-classification F1 = harmonic mean of precision and recall.
 * Returns `null` when either component is unmeasured; returns `0` (not
 * `NaN`) when both are zero so the value persists cleanly into a `REAL`
 * column.
 */
function harmonicMean(p: number | null, r: number | null): number | null {
  if (p === null || r === null) return null;
  return p + r === 0 ? 0 : (2 * p * r) / (p + r);
}

/**
 * Build a single-chunk `TopicLintInput` so a topic-scope rule can still be
 * evaluated against an isolated chunk corpus entry. The topic envelope is
 * a minimal stub — corpus labels are per-chunk, never per-topic.
 */
function chunkToTopicEnvelope(chunk: ChunkLintInput): TopicLintInput {
  return {
    topicId: '',
    topicTitle: 'lint-validate harness',
    subject: 'lint-validate',
    topicSummary: '',
    chunks: [chunk],
  };
}

function rowToChunkLintInput(row: typeof learningChunks.$inferSelect): ChunkLintInput {
  return {
    chunkId: row.id,
    title: row.title,
    content: row.content,
    chunkType: row.chunkType,
    condensedSummary: row.condensedSummary,
    prerequisites: row.prerequisitesJson ?? [],
    tags: row.tagsJson ?? [],
    difficulty: row.difficulty,
    estimatedDuration: row.estimatedDuration,
    knowledgeType: row.knowledgeType,
  };
}

/**
 * Returns whether `rule` produced any finding for `chunk`. Fails open on
 * rule exceptions — logs the failure with rule + chunk IDs and treats the
 * chunk as unflagged, mirroring `runLinterSuite.safeRun` in
 * `src/domain/services/chunk-linter.ts`. Without this, a single throwing
 * rule would abort the CLI before other rules' reports were persisted.
 */
function ruleFlagsChunk(rule: LinterRule, chunk: ChunkLintInput): boolean {
  try {
    const findings: LinterFinding[] =
      rule.scope === 'chunk' ? rule.run(chunk) : rule.run(chunkToTopicEnvelope(chunk));
    return findings.length > 0;
  } catch (error) {
    logger.warn(
      `lint-validate: rule "${rule.name}" threw for chunk "${chunk.chunkId}" — treating as unflagged:`,
      error
    );
    return false;
  }
}

type SplitObservations = {
  expected: boolean[];
  observed: boolean[];
};

type RuleEvaluation = {
  ruleId: string;
  metrics: EligibilityMetrics;
  f1HeldOut: number | null;
  counts: EligibilityCounts;
  blockingEligible: boolean;
};

/**
 * Evaluate one rule against the labeled corpus. Resolves all corpus chunks in
 * one batched fetch, then partitions observations by split and computes the
 * eligibility metrics.
 */
export async function evaluateRule(
  rule: LinterRule,
  entries: readonly CorpusEntry[]
): Promise<RuleEvaluation> {
  const splitMap = new Map<string, SplitObservations>();
  function ensure(split: string): SplitObservations {
    let obs = splitMap.get(split);
    if (!obs) {
      obs = { expected: [], observed: [] };
      splitMap.set(split, obs);
    }
    return obs;
  }

  if (entries.length > 0) {
    const db = getSql();
    const chunkIds = Array.from(new Set(entries.map(e => e.chunkId)));
    const rows = await db
      .select()
      .from(learningChunks)
      .where(inArray(learningChunks.id, chunkIds));
    const rowById = new Map(rows.map(r => [r.id, rowToChunkLintInput(r)]));

    for (const entry of entries) {
      const chunkInput = rowById.get(entry.chunkId);
      if (!chunkInput) {
        logger.warn(
          `lint-validate: skipping (rule="${rule.name}", chunk="${entry.chunkId}", split="${entry.split}") — chunk not present in learning_chunks`
        );
        continue;
      }
      const obs = ensure(entry.split);
      obs.expected.push(entry.expectedVerdict === 'should_flag');
      obs.observed.push(ruleFlagsChunk(rule, chunkInput));
    }
  }

  const heldOut = splitMap.get('held_out');
  const adversarial = splitMap.get('adversarial_negative');

  const heldOutMetrics = heldOut ? computeMetrics(heldOut.expected, heldOut.observed) : null;
  const advMetrics = adversarial
    ? computeMetrics(adversarial.expected, adversarial.observed)
    : null;

  const metrics: EligibilityMetrics = {
    precisionHeldOut: heldOutMetrics ? heldOutMetrics.precision : null,
    recallHeldOut: heldOutMetrics ? heldOutMetrics.recall : null,
    precisionAdversarial: advMetrics ? advMetrics.precision : null,
  };
  const counts: EligibilityCounts = {
    heldOutCount: heldOut?.expected.length ?? 0,
    adversarialCount: adversarial?.expected.length ?? 0,
  };
  // Tier 1a rules are eligible by construction (parser-level structural
  // checks, zero false positives on well-formed input). Skip the OOD
  // threshold gate for them so the CI step does not require a labelled
  // corpus for rules that don't need one.
  const blockingEligible =
    rule.tier === 'tier1a' ? true : evaluateEligibility(metrics, counts);
  const f1HeldOut = harmonicMean(metrics.precisionHeldOut, metrics.recallHeldOut);

  return { ruleId: rule.name, metrics, f1HeldOut, counts, blockingEligible };
}

function formatMetric(v: number | null): string {
  return v === null ? '   —' : v.toFixed(3);
}

function logSummary(evaluations: readonly RuleEvaluation[]): void {
  // Print to stdout (logger goes to stderr); the table is the operator-facing
  // signal. Each line is a single rule with its measured metrics + decision.
  process.stdout.write(
    'rule_id                          | held_out (P/R/F1) | adv_p   | held_out_n | adv_n | eligible\n'
  );
  process.stdout.write(
    '---------------------------------|-------------------|---------|------------|-------|---------\n'
  );
  for (const ev of evaluations) {
    const line = [
      ev.ruleId.padEnd(33),
      `${formatMetric(ev.metrics.precisionHeldOut)}/${formatMetric(ev.metrics.recallHeldOut)}/${formatMetric(ev.f1HeldOut)}`.padEnd(19),
      formatMetric(ev.metrics.precisionAdversarial).padEnd(8),
      String(ev.counts.heldOutCount).padEnd(11),
      String(ev.counts.adversarialCount).padEnd(6),
      String(ev.blockingEligible),
    ].join('| ');
    process.stdout.write(line + '\n');
  }
}

export async function runValidate(
  rules: readonly LinterRule[] = createTier1aRules(),
  repo?: LinterValidationRepository
): Promise<{ exitCode: number; evaluations: RuleEvaluation[] }> {
  const repository = repo ?? new DrizzleLinterValidationRepository(getSql());
  const evaluations: RuleEvaluation[] = [];
  const computedAt = new Date();

  for (const rule of rules) {
    const entries = await repository.listCorpusByRule(rule.name);
    const evaluation = await evaluateRule(rule, entries);

    const report: RuleValidationReport = {
      ruleId: rule.name,
      computedAt,
      precisionHeldOut: evaluation.metrics.precisionHeldOut,
      recallHeldOut: evaluation.metrics.recallHeldOut,
      f1HeldOut: evaluation.f1HeldOut,
      precisionAdversarial: evaluation.metrics.precisionAdversarial,
      heldOutCount: evaluation.counts.heldOutCount,
      adversarialCount: evaluation.counts.adversarialCount,
      blockingEligible: evaluation.blockingEligible,
      thresholdsVersion: THRESHOLDS_VERSION,
    };
    await repository.upsertReport(report);
    evaluations.push(evaluation);
  }

  logSummary(evaluations);

  let exitCode = 0;

  // Registry-vs-intent parity uses the canonical registered rule set rather
  // than the `rules` argument, so partial rule lists supplied by tests do not
  // trigger spurious "non-registered" violations. In CI this is effectively
  // the same set (`runValidate()` defaults to `createTier1aRules()`).
  const parityViolations = validateRuleIntentParity(createTier1aRules().map(r => r.name));
  if (parityViolations.length > 0) {
    for (const violation of parityViolations) {
      logger.error(`lint-validate: rule intent parity — ${violation}`);
    }
    exitCode = 1;
  }

  const intentLookup = RULE_INTENT as Readonly<Record<string, { intendedBlocking: boolean }>>;
  for (const ev of evaluations) {
    const intent = intentLookup[ev.ruleId];
    if (!intent) continue; // Composition-root parity check covers this; do not double-fail here.
    if (intent.intendedBlocking && !ev.blockingEligible) {
      exitCode = 1;
      const reasons = explainEligibilityMiss(
        ev.metrics,
        ev.counts,
        DEFAULT_ELIGIBILITY_THRESHOLDS
      );
      logger.error(
        `lint-validate: rule "${ev.ruleId}" intends to block but is not eligible — ${reasons.join('; ') || 'no thresholds met'}`
      );
    }
  }

  return { exitCode, evaluations };
}

/* v8 ignore start */
const currentFile = new URL(import.meta.url).pathname;
const argFile = process.argv[1];
const isMainModule =
  Boolean(argFile) &&
  (currentFile === argFile || currentFile.endsWith(argFile.replace(/\\/g, '/')));

if (isMainModule) {
  (async () => {
    let pool: ReturnType<typeof getPool> | undefined;
    try {
      pool = getPool();
      const { exitCode } = await runValidate();
      process.exitCode = exitCode;
    } catch (err) {
      logger.error('lint-validate: failed:', err);
      process.exitCode = 1;
    } finally {
      try {
        await pool?.end();
      } catch (err) {
        logger.error('lint-validate: failed to close pool:', err);
        process.exitCode ||= 1;
      }
    }
  })();
}
/* v8 ignore stop */
