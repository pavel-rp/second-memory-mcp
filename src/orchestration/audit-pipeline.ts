/**
 * Shared audit-pipeline helpers — Tier 1 (linter) + Tier 2 (classifier post-commit).
 *
 * Layering: depends only on `domain/`, `ports/`, `shared/`, and the sibling
 * `tier2-circuit-breaker.ts`. No `adapters/`, no `infrastructure/` (beyond
 * `shared/logger.ts`), no `server/`.
 */

import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { ContentClassifierPort } from '../ports/content-classifier-port.js';
import type { LearningChunk } from '../domain/types/entities.js';
import {
  runLinterSuite,
  type LinterFinding,
  type LinterRule,
  type LinterRuleTier,
  type TopicLintInput,
} from '../domain/services/chunk-linter.js';
import { canonicalEmptyReport, type ValidatorReport } from '../domain/types/validator-report.js';
import {
  VERDICT_FIELDS,
  type ChunkClassifierInput,
  type ChunkClassifierVerdict,
  type PerFieldClassifierPrompts,
  type VerdictFieldName,
} from '../domain/types/classifier.js';
import {
  CLASSIFIER_PROMPT_VERSION,
  PERSISTED_TIER2_FIELD_NAMES,
  buildClassifierPrompt,
  toPersistedTier2,
  type PersistedTier2FieldName,
} from '../shared/prompts/classifier-prompts.js';
import { renderClassifierUserPayload } from '../domain/services/render-classifier-prompt.js';
import { getRequestLogger, logEvent } from '../shared/logger.js';
import { BLOCKING_THRESHOLD as TIER2_LOW_SCORE_THRESHOLD } from '../domain/config/classifier.js';

import type { Tier2CircuitBreakerHandle } from './tier2-circuit-breaker.js';

export { TIER2_LOW_SCORE_THRESHOLD };
export type { Tier2CircuitBreakerHandle };

// ─────────────────────────────────────────────────────────────────
// Tier 1 types
// ─────────────────────────────────────────────────────────────────

/**
 * Per-finding shape persisted under `validator_report.tier1b`. Extends the
 * in-memory `LinterFinding` with the owning rule's `blockingEligible` flag,
 * renamed to `blocking_eligible` for snake_case DB convention. This makes
 * every stored Tier 1b finding self-describing — downstream analytics can
 * answer "why was this warning and not blocking?" without re-joining against
 * the rule registry or the eligibility report.
 */
export type Tier1bFindingEntry = LinterFinding & { blocking_eligible: boolean };

export type RuleMeta = { tier: LinterRuleTier; blockingEligible: boolean };

// ─────────────────────────────────────────────────────────────────
// Tier 2 types
// ─────────────────────────────────────────────────────────────────

/**
 * NEU-621: a single (chunk, field) pair where the verdict score crossed the
 * blocking threshold. Aggregated by `classifyChunksSoftWarn` and returned to
 * the orchestration entry point so the caller can roll back the just-persisted
 * row and emit one `classifier.tier2_blocked` event per hit.
 */
export type Tier2BlockingHit = {
  chunkId: string;
  /** snake_case verdict-field name — matches keys in `validator_report.tier2`. */
  field: PersistedTier2FieldName;
  score: number;
  rationale: string;
};

export type ClassifierPassResult = {
  findings: LinterFinding[];
  blockingHits: Tier2BlockingHit[];
};

// ─────────────────────────────────────────────────────────────────
// Tier 1: linter suite + per-chunk validator-report shaping
// ─────────────────────────────────────────────────────────────────

/**
 * Run the Tier 1 linter suite and pre-build the rule-name → metadata map.
 *
 * Wraps `runLinterSuite` with the same `onRuleError` callback the previous
 * in-line implementation in `topic-workflows.ts` used (warn-log via
 * `getRequestLogger()`). Log output is unchanged. The returned
 * `ruleMetaByName` map is consumed by `buildSingleChunkValidatorReport`.
 */
export function runTier1Audit(
  input: TopicLintInput,
  rules: LinterRule[]
): { findings: LinterFinding[]; blocking: boolean; ruleMetaByName: ReadonlyMap<string, RuleMeta> } {
  const lintResult = runLinterSuite(rules, input, {
    onRuleError: (ruleName, error) => {
      getRequestLogger().warn(
        `Linter rule "${ruleName}" threw — treating as zero findings:`,
        error
      );
    },
  });
  const ruleMetaByName = new Map<string, RuleMeta>();
  for (const rule of rules) {
    ruleMetaByName.set(rule.name, { tier: rule.tier, blockingEligible: rule.blockingEligible });
  }
  return { findings: lintResult.findings, blocking: lintResult.blocking, ruleMetaByName };
}

/**
 * Build the per-chunk `validator_report` payload from the suite-wide findings.
 * Routes findings into `tier1a`/`tier1b` sections by looking up each finding's
 * rule name in `ruleMetaByName`. Tier 1b entries carry a per-finding
 * `blocking_eligible` flag so the stored report records the eligibility
 * decision that was in effect at persist time. Findings whose rule isn't in
 * the map are dropped (defensive — would only happen if a rule emitted with
 * an unknown name). Empty buckets are omitted; the returned object always
 * carries `updated_at`, even when no findings exist (canonical empty).
 */
export function buildSingleChunkValidatorReport(
  chunkId: string,
  allFindings: readonly LinterFinding[],
  ruleMetaByName: ReadonlyMap<string, RuleMeta>,
  updatedAtIso: string
): ValidatorReport {
  const tier1a: LinterFinding[] = [];
  const tier1b: Tier1bFindingEntry[] = [];
  for (const finding of allFindings) {
    if (finding.chunkId !== chunkId) continue;
    const meta = ruleMetaByName.get(finding.rule);
    if (meta?.tier === 'tier1a') {
      tier1a.push(finding);
    } else if (meta?.tier === 'tier1b') {
      tier1b.push({ ...finding, blocking_eligible: meta.blockingEligible });
    } else {
      // Defensive: a rule emitted a finding tagged with a rule name absent
      // from the registered rules map. Drop it from persistence and warn —
      // matches the fail-open + log-to-stderr convention.
      getRequestLogger().warn(
        `Validator finding from unknown rule "${finding.rule}" — dropped from validator_report for chunk ${chunkId}`
      );
    }
  }
  return {
    ...canonicalEmptyReport(updatedAtIso),
    ...(tier1a.length > 0 ? { tier1a } : {}),
    ...(tier1b.length > 0 ? { tier1b } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────
// Tier 2: classifier post-commit pass
// ─────────────────────────────────────────────────────────────────

/**
 * Run the Tier 2 classifier post-commit fan-out. Resolves the effective
 * blocking-fields set through the optional circuit-breaker, then delegates
 * to `classifyChunksSoftWarn`. Returns warning findings + blocking hits;
 * rollback / event emission is the caller's responsibility (the rejection
 * branch is creation- vs. update-specific).
 *
 * **Fail-open contract on the breaker:** when `tier2CircuitBreaker.applyTo`
 * throws, the call is logged at warn-level and the input `blockingFields`
 * set is used unchanged — see `tier2-circuit-breaker.ts`. This mirrors the
 * pre-extraction inline behavior in `topic-workflows.ts`.
 *
 * **Post-commit only.** Callers must invoke this outside their unit-of-work
 * transaction — the classifier has ~2 s p95 latency and any throw inside a
 * UoW would roll back the persisted row, breaking the fail-open contract.
 */
export async function runTier2AuditPostCommit(args: {
  topicId: string;
  chunks: readonly LearningChunk[];
  classifier: ContentClassifierPort;
  chunksRepo: ChunkRepository;
  blockingFields: ReadonlySet<VerdictFieldName>;
  tier2CircuitBreaker?: Tier2CircuitBreakerHandle;
}): Promise<ClassifierPassResult> {
  // Resolve the effective blocking set through the optional circuit-breaker.
  // The breaker may shrink the configured set when recent rejection rates
  // are anomalous; on its own error path it returns the input unchanged.
  let effectiveBlocking: ReadonlySet<VerdictFieldName> = args.blockingFields;
  if (effectiveBlocking.size > 0 && args.tier2CircuitBreaker !== undefined) {
    try {
      effectiveBlocking = await args.tier2CircuitBreaker.applyTo(effectiveBlocking);
    } catch (err) {
      getRequestLogger().warn(
        'Tier 2 circuit-breaker raised while applying — leaving blockingFields unchanged:',
        err
      );
    }
  }
  return classifyChunksSoftWarn(
    args.topicId,
    args.chunks,
    args.classifier,
    args.chunksRepo,
    effectiveBlocking
  );
}

// ─────────────────────────────────────────────────────────────────
// Internal helpers (not exported — `runTier2AuditPostCommit` is the surface)
// ─────────────────────────────────────────────────────────────────

/**
 * Build the `ChunkClassifierInput` snapshot from a persisted `LearningChunk`.
 * Chunks with no content are skipped by the caller so this helper assumes a
 * non-null content string.
 */
function toClassifierInput(chunk: LearningChunk): ChunkClassifierInput {
  return {
    chunkId: chunk.id,
    title: chunk.title,
    content: chunk.content ?? '',
    chunkType: chunk.chunkType,
    tags: chunk.tagsJson ?? [],
    prerequisites: chunk.prerequisitesJson ?? [],
  };
}

/** True when every verdict field is null — i.e. the adapter returned `emptyVerdict()`. */
function isAllNullVerdict(verdict: ChunkClassifierVerdict): boolean {
  for (const field of VERDICT_FIELDS) {
    if (verdict[field] !== null) return false;
  }
  return true;
}

/**
 * Fan out classification across all created chunks. Each chunk is independent:
 * a throw in one classify() does not stop the others; a failure never blocks
 * creation. Returns the aggregated Tier 2 warning findings and any blocking
 * hits accumulated under the `effectiveBlocking` allowlist (NEU-621).
 */
async function classifyChunksSoftWarn(
  topicId: string,
  chunks: readonly LearningChunk[],
  classifier: ContentClassifierPort,
  chunksRepo: ChunkRepository,
  effectiveBlocking: ReadonlySet<VerdictFieldName>
): Promise<ClassifierPassResult> {
  // The classifier prompt map is chunk-independent (rubric + few-shots only),
  // so build it once for the whole fan-out instead of re-rendering per chunk.
  // NEU-660: returns one ClassifierPrompt per VerdictFieldName instead of one
  // shared prompt — see classifier-prompts.ts.
  const prompts = buildClassifierPrompt();
  // `allSettled` (not `all`) so one chunk's unexpected rejection does not
  // discard already-computed findings from its siblings. `classifyChunk`
  // already absorbs every failure mode it knows about; this is belt-and-
  // suspenders for future helper edits.
  const results = await Promise.allSettled(
    chunks.map(chunk =>
      classifyChunk(topicId, chunk, prompts, classifier, chunksRepo, effectiveBlocking)
    )
  );
  const findings: LinterFinding[] = [];
  const blockingHits: Tier2BlockingHit[] = [];
  for (let i = 0; i < results.length; i += 1) {
    const outcome = results[i];
    if (outcome.status === 'fulfilled') {
      for (const finding of outcome.value.findings) findings.push(finding);
      for (const hit of outcome.value.blockingHits) blockingHits.push(hit);
    } else {
      getRequestLogger().warn(
        `Tier 2 classifier pass rejected for chunk ${chunks[i].id}:`,
        outcome.reason
      );
    }
  }
  return { findings, blockingHits };
}

async function classifyChunk(
  topicId: string,
  chunk: LearningChunk,
  prompts: PerFieldClassifierPrompts,
  classifier: ContentClassifierPort,
  chunksRepo: ChunkRepository,
  effectiveBlocking: ReadonlySet<VerdictFieldName>
): Promise<ClassifierPassResult> {
  // Skip classification on chunks with no content — nothing meaningful to grade.
  if (!chunk.content) return { findings: [], blockingHits: [] };

  const startedAt = Date.now();
  const input = toClassifierInput(chunk);
  // NEU-660: store the chunk payload once and per-field user-prompt prefixes
  // separately. Earlier drafts repeated `renderClassifierUserPayload(...)` per
  // field, which copied the full chunk content (≤MAX_CONTENT_SIZE = 8 KB) into
  // every event payload — a ~6× JSONB write-volume regression. Splitting the
  // event payload preserves the per-field debugging surface (snake-cased keys
  // joinable with `classifier.field_parse_failed` /
  // `classifier.classify_aggregate_failed`) at 1/6 the size.
  //
  // With an empty `userPrompt`, `renderClassifierUserPayload` returns
  // `'\n\n--- CHUNK ---\n...'` — two leading newlines from the empty prefix
  // and the blank-line separator. This is intentional: prepending any
  // per-field `userPrompt` (string ending without a trailing newline)
  // reconstructs the exact bytes the adapter sends to the model, so the
  // event log is fully lossless for `prefix + chunk_payload` reconstruction.
  const renderedChunkPayload = renderClassifierUserPayload(input, '');
  const renderedUserPromptPrefixes: Record<string, string> = {};
  for (const field of VERDICT_FIELDS) {
    renderedUserPromptPrefixes[PERSISTED_TIER2_FIELD_NAMES[field]] = prompts[field].userPrompt;
  }

  let verdict: ChunkClassifierVerdict;
  try {
    verdict = await classifier.classify(input, prompts);
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    // Port contract is fail-open, but defend against a bugged adapter.
    getRequestLogger().warn(`Classifier threw for chunk ${chunk.id}:`, err);
    try {
      logEvent(
        'classifyChunk',
        'classifier.classify_threw',
        {
          chunk_id: chunk.id,
          error_class: err instanceof Error ? err.constructor.name : typeof err,
          error_message: err instanceof Error ? err.message : String(err),
          duration_ms: durationMs,
          // Include the prompt the model would have seen — for "why did this
          // chunk's classify call throw?" debugging the prompt is the context.
          // Chunk payload is stored once; per-field user-prompt prefixes are
          // stored in a separate map (see comment at top of classifyChunk).
          rendered_chunk_payload: renderedChunkPayload,
          rendered_user_prompt_prefixes: renderedUserPromptPrefixes,
        },
        durationMs
      );
    } catch {
      // A broken event logger must not poison the post-commit phase.
    }
    return { findings: [], blockingHits: [] };
  }

  const durationMs = Date.now() - startedAt;

  // `failed_fields` uses the snake_case keys so downstream log aggregation can
  // join verdict events with `classifier.field_parse_failed` and
  // `classifier.classify_aggregate_failed`.
  const failedFields: string[] = [];
  for (const field of VERDICT_FIELDS) {
    if (verdict[field] === null) failedFields.push(PERSISTED_TIER2_FIELD_NAMES[field]);
  }
  const scores: Record<string, number | null> = {};
  for (const field of VERDICT_FIELDS) {
    scores[PERSISTED_TIER2_FIELD_NAMES[field]] = verdict[field]?.score ?? null;
  }

  // Persist before emitting the verdict event so `persisted` reflects the
  // actual write outcome. All-null verdicts skip persistence and report
  // `persisted: false` — same log shape so debugging that case stays uniform.
  const allNull = isAllNullVerdict(verdict);
  let persisted = false;
  if (!allNull) {
    const classifiedAtIso = new Date().toISOString();
    const persistedTier2 = toPersistedTier2(verdict, classifiedAtIso);
    try {
      const rowCount = await chunksRepo.mergeValidatorReport(
        chunk.id,
        { tier2: persistedTier2 },
        classifiedAtIso
      );
      persisted = rowCount > 0;
      if (rowCount === 0) {
        // Chunk may have been deleted between commit and classification; not a
        // blocking condition.
        getRequestLogger().warn(
          `mergeValidatorReport affected 0 rows for chunk ${chunk.id} (chunk missing?)`
        );
      }
    } catch (err) {
      getRequestLogger().warn(`Persisting tier2 verdict failed for chunk ${chunk.id}:`, err);
    }
  }

  try {
    logEvent(
      'classifyChunk',
      'classifier.chunk_verdict',
      {
        chunk_id: chunk.id,
        topic_id: topicId,
        prompt_version: CLASSIFIER_PROMPT_VERSION,
        duration_ms: durationMs,
        scores,
        failed_fields: failedFields,
        persisted,
        rendered_chunk_payload: renderedChunkPayload,
        rendered_user_prompt_prefixes: renderedUserPromptPrefixes,
      },
      durationMs
    );
  } catch {
    // A broken event logger must not poison the post-commit phase.
  }

  if (allNull) {
    getRequestLogger().warn(`Classifier returned all-null verdict for chunk ${chunk.id}`);
    return { findings: [], blockingHits: [] };
  }

  // Build findings for every field whose score falls below the threshold.
  // NEU-672: a field is EITHER a warning OR a blocking hit, never both. Fields
  // in `effectiveBlocking` route to `blockingHits` (severity 'blocking' on the
  // rollback response); fields outside the set route to `findings` (severity
  // 'warning' on the success response or merged into the rollback response
  // alongside the blocking hits). This invariant prevents `error.findings`
  // from carrying the same `(chunkId, rule)` pair with conflicting severities.
  const findings: LinterFinding[] = [];
  const blockingHits: Tier2BlockingHit[] = [];
  for (const field of VERDICT_FIELDS) {
    const value = verdict[field];
    if (value === null) continue;
    if (value.score > TIER2_LOW_SCORE_THRESHOLD) continue;
    const persistedFieldName = PERSISTED_TIER2_FIELD_NAMES[field];
    if (effectiveBlocking.has(field)) {
      blockingHits.push({
        chunkId: chunk.id,
        field: persistedFieldName,
        score: value.score,
        rationale: value.rationale,
      });
      continue;
    }
    findings.push({
      chunkId: chunk.id,
      rule: `classifier.${persistedFieldName}`,
      severity: 'warning',
      category: 'tier2',
      detail: value.rationale,
    });
  }
  return { findings, blockingHits };
}
