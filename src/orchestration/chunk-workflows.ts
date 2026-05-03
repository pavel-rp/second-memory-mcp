import crypto from 'node:crypto';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { TopicRepository } from '../ports/topic-repository.js';
import type { UnitOfWorkPort } from '../ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../ports/embedding-port.js';
import type { ContentClassifierPort } from '../ports/content-classifier-port.js';
import type { LearningChunk, NewLearningChunk } from '../domain/types/entities.js';
import type { ServiceResult, ServiceError } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { hasSignificantContentChange } from '../shared/content-similarity.js';
import { extractErrorMessage } from '../shared/errors.js';
import { DependencyResolver } from '../domain/algorithms/dependency-resolver.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';
import type { LearningItem } from '../domain/types/recommendations.js';
import { getRequestLogger, logEvent } from '../shared/logger.js';
import type { LinterFinding, LinterRule, TopicLintInput } from '../domain/services/chunk-linter.js';
import type { VerdictFieldName } from '../domain/types/classifier.js';
import {
  runTier1Audit,
  runTier2AuditPostCommit,
  buildSingleChunkValidatorReport,
  type Tier2BlockingHit,
  type Tier2CircuitBreakerHandle,
} from './audit-pipeline.js';

const CHUNK_PLUMBING_FIELDS = new Set([
  'updatedAt',
  'contentVersion',
  'contentUpdatedAt',
  'contentStatus',
  'easeFactor',
  'repetitions',
  'nextReviewAt',
  'lastReviewedAt',
]);

const CHUNK_FIELD_ALIASES: Record<string, string> = {
  tagsJson: 'tags',
  prerequisitesJson: 'prerequisites',
};

function toEventFieldName(key: string): string {
  return CHUNK_FIELD_ALIASES[key] ?? key;
}

export type ChunkDeps = {
  chunks: ChunkRepository;
  topics: TopicRepository;
  unitOfWork: UnitOfWorkPort;
  embedding?: EmbeddingPort;
  /** Tier 2 content classifier (NEU-619). Wired in NEU-620 for topic creation; NEU-686 extends to all chunk-content write paths. */
  classifier?: ContentClassifierPort;
  maxDependencyDepth: number;
  /**
   * Mirrors `CLASSIFIER_ENABLE`. When `true` AND `classifier` is present, the
   * Tier 2 classifier runs on every audit-eligible chunk-content write path
   * (NEU-686). Defaults to `false` so test fixtures and unconfigured runs keep
   * the previous behavior.
   */
  enableClassifier?: boolean;
  /**
   * NEU-621/NEU-686: per-field allowlist of verdict fields that, when scored at
   * or below the soft-warn threshold, will reject the chunk write and trigger
   * a compensating reverse-UPDATE (update paths) or chunk + auto-topic delete
   * (creation path). Empty/absent = soft-warn only.
   */
  blockingFields?: ReadonlySet<VerdictFieldName>;
  /**
   * NEU-621/NEU-686: optional circuit-breaker that may shrink the effective
   * `blockingFields` set when a field's recent rejection rate exceeds the
   * rolling-mean + 2σ threshold. Absent in tests and in environments where
   * the breaker is disabled.
   */
  tier2CircuitBreaker?: Tier2CircuitBreakerHandle;
  /**
   * NEU-686: Tier 1 linter rules. Wired identically to `topicDeps.linterRules`
   * by the composition root so chunk and topic write paths run the same suite.
   * Empty/absent = no Tier 1 audit.
   */
  linterRules?: LinterRule[];
};

export type ChunkUpdateResult = {
  success: boolean;
  chunk?: LearningChunk;
  progressReset?: boolean;
  error?: ServiceError;
  /**
   * Tier 2 (classifier) warning findings. Populated post-commit by NEU-686
   * only when the classifier ran on an update path and at least one verdict
   * field scored ≤ the soft-warn threshold. Absent when the classifier was
   * not configured, was disabled, failed, or produced no low-score fields.
   * Only fields outside the effective `blockingFields` set surface here as
   * warnings — fields inside that set route through the blocking branch and
   * never appear here on a successful update.
   */
  tier2Findings?: LinterFinding[];
};

/**
 * NEU-686: data captured before a chunk content/metadata update so the
 * orchestration can roll back to the pre-update row state when Tier 2 rejects
 * post-commit. Captures every column the three audited update entry points
 * may mutate — content + SR-state for `updateChunkContent` /
 * `updateChunkContentWithAutoReset` (lines 535-573 / 575-593), plus metadata
 * (`title`, `difficulty`, `estimatedDuration`, `prerequisitesJson`,
 * `tagsJson`) that `updateChunkWithProgressReset` (lines 619-657) writes.
 * Captured only when an audit path is set AND `enableClassifier && classifier
 * && blockingFields.size > 0` — when blocking cannot fire, no allocation
 * happens. `updatedAt` is intentionally NOT in the snapshot: it always
 * advances on every write.
 */
type PreUpdateSnapshot = {
  content: string | null;
  contentVersion: number | null;
  contentUpdatedAt: number | null;
  contentStatus: LearningChunk['contentStatus'];
  condensedSummary: string | null;
  repetitions: number;
  easeFactor: number;
  nextReviewAt: number;
  lastReviewedAt: number | null;
  // NEU-686 audit fix: metadata fields restored on rollback for
  // `updateChunkWithProgressReset` (the only audited entry point that mutates
  // them). For the content-only update entry points these still match the
  // pre-update row state — capturing them is harmless plumbing.
  title: string;
  difficulty: number;
  estimatedDuration: number;
  prerequisitesJson: string[] | null;
  tagsJson: string[] | null;
};

function captureSnapshot(chunk: LearningChunk): PreUpdateSnapshot {
  return {
    content: chunk.content,
    contentVersion: chunk.contentVersion,
    contentUpdatedAt: chunk.contentUpdatedAt,
    contentStatus: chunk.contentStatus,
    condensedSummary: chunk.condensedSummary,
    repetitions: chunk.repetitions,
    easeFactor: chunk.easeFactor,
    nextReviewAt: chunk.nextReviewAt,
    lastReviewedAt: chunk.lastReviewedAt,
    title: chunk.title,
    difficulty: chunk.difficulty,
    estimatedDuration: chunk.estimatedDuration,
    prerequisitesJson: chunk.prerequisitesJson,
    tagsJson: chunk.tagsJson,
  };
}

/**
 * NEU-672 hard gate (mirrors `topic-workflows.ts` helper of the same name):
 * cap rationale length before persisting to the indefinitely-retained
 * `infrastructure.operation_event_log`. Rationales may quote user-supplied
 * chunk content verbatim, so an unbounded persisted value would store
 * unbounded PII. Full rationale still flows through the synchronous
 * `error.findings[].detail` response — only the persisted event payload is
 * clipped. Duplicated rather than imported from `topic-workflows.ts` to
 * avoid coupling two orchestration modules together.
 */
const RATIONALE_PERSIST_MAX_CHARS = 256;
const RATIONALE_TRUNCATION_MARKER = '…[truncated]';

function truncateRationaleForEvent(rationale: string): string {
  if (rationale.length <= RATIONALE_PERSIST_MAX_CHARS) return rationale;
  return rationale.slice(0, RATIONALE_PERSIST_MAX_CHARS) + RATIONALE_TRUNCATION_MARKER;
}

/**
 * NEU-686: discriminator string identifying the orchestration entry point
 * that emitted a `classifier.tier2_blocked` event. Lets downstream telemetry
 * split rejections by surface (create-topic, create-chunk, the three update
 * paths). Mirrored on `topic-workflows.ts` for `create_topic_with_chunks`.
 */
type AuditPath =
  | 'create_topic_with_chunks'
  | 'create_chunk_with_topic'
  | 'update_chunk_content'
  | 'update_chunk_content_with_auto_reset'
  | 'update_chunk_with_progress_reset';

export type ChunkDependencyCleanup = {
  chunkId: string;
  chunkTitle: string;
  removedPrerequisites: string[];
  previousPrerequisites: string[];
  remainingPrerequisites: string[];
};

export type DeleteChunkResult = {
  success: boolean;
  chunk?: LearningChunk;
  removedDependencies?: ChunkDependencyCleanup[];
  error?: ServiceError;
};

/**
 * Build a `TopicLintInput` for a single-chunk update. Loads minimal topic
 * context (best-effort) so Tier 1 rules that read `topicTitle`/`topicSummary`
 * have data; falls back to safe defaults when the topic load fails. The
 * proposed `ChunkLintInput` reflects what would be persisted: every field
 * either comes from the proposed update map or, when absent, from the
 * pre-update chunk.
 */
async function buildUpdateLintInput(
  current: LearningChunk,
  fields: Record<string, unknown>,
  topics: TopicRepository
): Promise<TopicLintInput> {
  let topicTitle = '';
  let topicSummary = '';
  let subject = current.subject;
  try {
    const topic = await topics.getById(current.topicId);
    if (topic) {
      topicTitle = topic.title;
      topicSummary = topic.summary ?? '';
      subject = topic.subject;
    }
  } catch (err) {
    getRequestLogger().warn(`Failed to load topic ${current.topicId} for chunk audit:`, err);
  }

  const hasContentField = 'content' in fields;
  const proposedContent = hasContentField ? (fields.content as string | null) : current.content;
  const proposedTitle = (fields.title as string | undefined) ?? current.title;
  const proposedDifficulty = (fields.difficulty as number | undefined) ?? current.difficulty;
  const proposedEstimatedDuration =
    (fields.estimatedDuration as number | undefined) ?? current.estimatedDuration;
  const proposedPrerequisites =
    (fields.prerequisitesJson as string[] | null | undefined) ?? current.prerequisitesJson ?? [];
  const proposedTags = (fields.tagsJson as string[] | null | undefined) ?? current.tagsJson ?? [];
  const hasCondensedSummaryField = 'condensedSummary' in fields;
  const proposedCondensedSummary = hasCondensedSummaryField
    ? (fields.condensedSummary as string | null)
    : current.condensedSummary;

  return {
    // For update paths the real `topicId` is known; pass it so any topic-scoped
    // Tier 1 rule keys/diagnostics work. The `TopicLintInput` JSDoc empty-string
    // exception applies only to pre-persist create-path lints.
    topicId: current.topicId,
    topicTitle,
    subject,
    topicSummary,
    chunks: [
      {
        chunkId: current.id,
        title: proposedTitle,
        content: proposedContent,
        chunkType: current.chunkType,
        condensedSummary: proposedCondensedSummary,
        prerequisites: proposedPrerequisites,
        tags: proposedTags,
        difficulty: proposedDifficulty,
        estimatedDuration: proposedEstimatedDuration,
        knowledgeType: current.knowledgeType,
      },
    ],
  };
}

async function updateChunkFields(
  id: string,
  buildFields: (
    current: LearningChunk,
    now: number
  ) => { fields: Record<string, unknown>; progressReset?: boolean },
  deps: ChunkDeps,
  auditPath?: AuditPath
): Promise<ChunkUpdateResult> {
  try {
    const current = await deps.chunks.getById(id);
    if (!current) {
      return {
        success: false,
        error: { type: 'not_found', message: `Chunk with id "${id}" not found` },
      };
    }
    const now = Date.now();
    const { fields, progressReset } = buildFields(current, now);

    // ─── Tier 1 pre-persist audit ─────────────────────────────────────
    // Runs only when an audit path is supplied (i.e. one of the three
    // content-touching update entry points; `update_chunk_metadata` skips).
    // Tier 1a blocking returns immediately with no DB mutation and no
    // embedding clear — the persisted row stays exactly as it was.
    let tier1Findings: LinterFinding[] = [];
    let tier1RuleMeta: Awaited<ReturnType<typeof runTier1Audit>>['ruleMetaByName'] | undefined;
    let snapshot: PreUpdateSnapshot | null = null;

    if (auditPath !== undefined && deps.linterRules && deps.linterRules.length > 0) {
      const lintInput = await buildUpdateLintInput(current, fields, deps.topics);
      const tier1 = runTier1Audit(lintInput, deps.linterRules);
      tier1Findings = tier1.findings;
      tier1RuleMeta = tier1.ruleMetaByName;

      if (tier1.blocking) {
        const blockingCount = tier1Findings.filter(f => f.severity === 'blocking').length;
        return {
          success: false,
          error: {
            type: 'content_quality',
            message: `Chunk update blocked for chunk ${id} by ${blockingCount} content-quality finding${blockingCount === 1 ? '' : 's'}`,
            findings: tier1Findings,
            retryable: false,
          },
        };
      }
    }

    // Capture snapshot BEFORE any DB mutation so the reverse-UPDATE on a
    // post-commit Tier 2 block restores byte-identical state. Skipped when
    // blocking can't fire — no allocation in the common case.
    if (
      auditPath !== undefined &&
      deps.enableClassifier === true &&
      deps.classifier !== undefined &&
      deps.blockingFields !== undefined &&
      deps.blockingFields.size > 0
    ) {
      snapshot = captureSnapshot(current);
    }

    // ─── Persist (existing flow) ─────────────────────────────────────
    // When content changes, clear stale embedding before updating content —
    // if re-embedding fails, we prefer no embedding over a misleading one.
    if (typeof fields.content === 'string') {
      await deps.chunks.saveContentEmbedding(id, null);
    }

    const rowCount = await deps.chunks.update(
      id,
      fields as Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>
    );

    // Best-effort re-embedding after content update
    if (typeof fields.content === 'string' && deps.embedding) {
      try {
        const vector = await deps.embedding.embedText(fields.content as string);
        if (vector) {
          await deps.chunks.saveContentEmbedding(id, vector);
        }
      } catch (err) {
        getRequestLogger().warn('Embedding generation failed for chunk content:', err);
      }
    }
    if (rowCount === 0) {
      return { success: false, error: { type: 'database', message: 'Failed to update chunk' } };
    }

    // ─── Merge Tier 1 sections into validator_report ─────────────────
    // Section-merge so any prior `tier2` findings on the row are preserved
    // (Postgres `||` shallow-merge in the Drizzle adapter). Wrapped in
    // try/catch + warn log so a merge failure does not poison a successful
    // chunk update — `validator_report` staleness is recoverable.
    if (auditPath !== undefined && tier1RuleMeta !== undefined) {
      try {
        const isoNow = new Date(now).toISOString();
        const report = buildSingleChunkValidatorReport(
          current.id,
          tier1Findings,
          tier1RuleMeta,
          isoNow
        );
        const partial: { tier1a?: unknown; tier1b?: unknown } = {};
        if (report.tier1a !== undefined) partial.tier1a = report.tier1a;
        if (report.tier1b !== undefined) partial.tier1b = report.tier1b;
        await deps.chunks.mergeValidatorReport(id, partial, isoNow);
      } catch (err) {
        getRequestLogger().warn(`Tier 1 validator-report merge failed for chunk ${id}:`, err);
      }
    }

    const updated = await deps.chunks.getById(id);
    if (!updated) {
      // Concurrent delete between the UPDATE and this reload — the row no
      // longer exists. Surface as a retryable database error rather than
      // returning `{ success: true, chunk: undefined }` (which the server
      // tool layer's `if (result.success && result.chunk)` guard hides
      // behind an opaque "Unknown error" instead of the actual
      // concurrent-delete signal).
      return {
        success: false,
        error: {
          type: 'database',
          message: `Chunk ${id} disappeared between update and reload (concurrent delete?)`,
          retryable: true,
        },
      };
    }
    const fieldsChanged = Object.keys(fields)
      .filter(k => !CHUNK_PLUMBING_FIELDS.has(k))
      .map(toEventFieldName);
    // Skip emission when only plumbing (updatedAt, SR state, etc.) changed —
    // emitting `chunk_updated` with an empty `fieldsChanged` is ambiguous
    // noise for downstream consumers.
    if (fieldsChanged.length > 0) {
      try {
        logEvent('updateChunk', 'chunk_updated', { chunkId: id, fieldsChanged });
      } catch {
        // A broken event logger must not poison a successful commit.
      }
    }

    // ─── Tier 2 post-commit audit ────────────────────────────────────
    // Mirrors `topic-workflows.ts:298-315`: classifier runs OUTSIDE the
    // unit-of-work (no UoW here for updates) so a ~2 s p95 LLM call cannot
    // poison a successful row write. Defensive try/catch absorbs adapter bugs.
    let tier2Findings: LinterFinding[] | undefined;
    let tier2BlockingHits: Tier2BlockingHit[] = [];
    if (
      auditPath !== undefined &&
      deps.enableClassifier === true &&
      deps.classifier !== undefined
    ) {
      try {
        const passResult = await runTier2AuditPostCommit({
          topicId: current.topicId,
          chunks: [updated],
          classifier: deps.classifier,
          chunksRepo: deps.chunks,
          blockingFields: deps.blockingFields ?? new Set(),
          tier2CircuitBreaker: deps.tier2CircuitBreaker,
        });
        tier2Findings = passResult.findings;
        tier2BlockingHits = passResult.blockingHits;
        /* c8 ignore start -- defensive: `runTier2AuditPostCommit` absorbs
           every classifier/breaker failure it knows about. This catch is
           belt-and-braces — the public-API contract is fail-open. */
      } catch (err) {
        getRequestLogger().warn('Tier 2 classifier pass failed for chunk update:', err);
      }
      /* c8 ignore stop */
    }

    if (tier2BlockingHits.length > 0) {
      // Reverse-UPDATE the snapshot fields. The snapshot-capture gate
      // (`enableClassifier && classifier && blockingFields.size > 0`) is a
      // strict superset of the gate that produces `blockingHits` — empty
      // `blockingFields` cannot yield blocking hits inside
      // `runTier2AuditPostCommit`. The null-check below is defensive: if a
      // future refactor de-couples those gates, we'd rather fail safely than
      // attempt an undefined-fields update.
      let rollbackFailed = false;
      let rollbackErrorMessage: string | undefined;
      /* c8 ignore start -- defensive guard: the snapshot-capture gate
         (`enableClassifier && classifier && blockingFields.size > 0`) is a
         strict superset of the gate that produces `blockingHits`, so this
         branch is unreachable under valid inputs. Kept as a logic-error
         tripwire for future refactors. */
      if (snapshot === null) {
        rollbackFailed = true;
        rollbackErrorMessage = 'snapshot was not captured (logic error)';
        getRequestLogger().warn(
          `Tier 2 block: cannot reverse update for chunk ${id} — snapshot missing`
        );
      } else {
        /* c8 ignore stop */
        try {
          const reverseRowCount = await deps.chunks.update(
            id,
            snapshot as Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>
          );
          if (reverseRowCount === 0) {
            rollbackFailed = true;
            rollbackErrorMessage = 'reverse-update affected 0 rows (chunk missing?)';
            getRequestLogger().warn(`Tier 2 block: reverse-update affected 0 rows for chunk ${id}`);
          } else if (deps.embedding) {
            // Embedding-consistency on rollback. Two cases:
            //  - snapshot.content is a string → re-embed the restored content
            //    so the row's vector matches.
            //  - snapshot.content is null but the original update wrote a new
            //    string (the update path cleared + re-embedded against the
            //    NEW content) → clear the now-stale vector. Without this, the
            //    row would carry `content = null` plus a vector pointing at
            //    the rejected content.
            if (typeof snapshot.content === 'string') {
              try {
                const vector = await deps.embedding.embedText(snapshot.content);
                if (vector) {
                  const saveRowCount = await deps.chunks.saveContentEmbedding(id, vector);
                  if (saveRowCount === 0) {
                    getRequestLogger().warn(
                      `Tier 2 block: saveContentEmbedding affected 0 rows for chunk ${id} (chunk missing?)`
                    );
                  }
                }
              } catch (err) {
                getRequestLogger().warn(
                  `Tier 2 block: re-embedding restored content failed for chunk ${id}:`,
                  err
                );
              }
            } else if (typeof fields.content === 'string') {
              try {
                const saveRowCount = await deps.chunks.saveContentEmbedding(id, null);
                if (saveRowCount === 0) {
                  getRequestLogger().warn(
                    `Tier 2 block: saveContentEmbedding affected 0 rows for chunk ${id} (chunk missing?)`
                  );
                }
              } catch (err) {
                getRequestLogger().warn(
                  `Tier 2 block: clearing stale embedding failed for chunk ${id}:`,
                  err
                );
              }
            }
          }
        } catch (err) {
          rollbackFailed = true;
          rollbackErrorMessage = extractErrorMessage(err);
          getRequestLogger().warn(`Tier 2 block: reverse-update threw for chunk ${id}:`, err);
        }
      }

      // Emit one event per hit regardless of rollback outcome — the rejection
      // happened, the rollback is a separate concern.
      for (const hit of tier2BlockingHits) {
        try {
          logEvent('updateChunk', 'classifier.tier2_blocked', {
            chunk_id: hit.chunkId,
            field: hit.field,
            score: hit.score,
            rationale: truncateRationaleForEvent(hit.rationale),
            audit_path: auditPath,
          });
        } catch {
          // A broken event logger must not change the response.
        }
      }

      if (rollbackFailed) {
        // Every code path that sets rollbackFailed=true also assigns
        // rollbackErrorMessage; the `?? 'unknown'` fallback is a defensive
        // guard against a future refactor that misses one.
        /* c8 ignore start */
        const reason = rollbackErrorMessage ?? 'unknown';
        /* c8 ignore stop */
        return {
          success: false,
          error: {
            type: 'database',
            message: `Tier 2 classifier rejected update but rollback failed for chunk ${id} (${reason}). Manual cleanup may be required.`,
            retryable: true,
          },
        };
      }

      const first = tier2BlockingHits[0];
      const summary = `Tier 2 classifier rejected update: chunk ${first.chunkId} field ${first.field} scored ${first.score} (${first.rationale})${tier2BlockingHits.length > 1 ? ` — and ${tier2BlockingHits.length - 1} other field(s)` : ''}.`;
      const blockingFindings: LinterFinding[] = tier2BlockingHits.map(h => ({
        chunkId: h.chunkId,
        rule: `classifier.${h.field}`,
        severity: 'blocking',
        category: 'tier2',
        detail: h.rationale,
      }));
      // tier2Findings is undefined only if `runTier2AuditPostCommit` threw;
      // its outer try/catch swallows that and `tier2BlockingHits` stays empty,
      // so we wouldn't enter this branch. The `?? []` is defensive.
      /* c8 ignore next */
      const mergedFindings: LinterFinding[] = [...blockingFindings, ...(tier2Findings ?? [])];
      return {
        success: false,
        error: {
          type: 'content_quality',
          message: summary,
          retryable: false,
          findings: mergedFindings,
        },
      };
    }

    const result: ChunkUpdateResult = { success: true, chunk: updated, progressReset };
    if (tier2Findings && tier2Findings.length > 0) {
      result.tier2Findings = tier2Findings;
    }
    return result;
  } catch (error) {
    return { success: false, error: { type: 'database', message: extractErrorMessage(error) } };
  }
}

// --- Public workflows ---

export async function updateChunkContent(
  id: string,
  input: { content: string; resetProgress?: boolean; condensedSummary?: string },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (current, now) => {
      const fields: Record<string, unknown> = {
        content: input.content,
        contentVersion: (current.contentVersion || 1) + 1,
        contentUpdatedAt: now,
        contentStatus: 'final',
        updatedAt: now,
      };
      if (input.condensedSummary !== undefined) {
        fields.condensedSummary = input.condensedSummary;
      }
      const progressReset = input.resetProgress || false;
      if (progressReset) {
        fields.repetitions = 0;
        fields.easeFactor = 2.5;
        fields.nextReviewAt = now;
        fields.lastReviewedAt = null;
      }
      return { fields, progressReset };
    },
    deps,
    'update_chunk_content'
  );
}

export async function updateChunkContentWithAutoReset(
  id: string,
  input: { content: string },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (current, now) => {
      const fields: Record<string, unknown> = {
        content: input.content,
        contentVersion: (current.contentVersion || 1) + 1,
        contentUpdatedAt: now,
        contentStatus: 'final',
        updatedAt: now,
      };
      let progressReset = false;
      if (current.content && hasSignificantContentChange(current.content, input.content)) {
        fields.repetitions = 0;
        fields.easeFactor = 2.5;
        fields.nextReviewAt = now;
        fields.lastReviewedAt = null;
        progressReset = true;
      }
      return { fields, progressReset };
    },
    deps,
    'update_chunk_content_with_auto_reset'
  );
}

export async function updateChunkMetadata(
  id: string,
  input: {
    title?: string;
    difficulty?: number;
    prerequisites?: string[];
    tags?: string[];
    estimatedDuration?: number;
  },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (_current, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      if (input.title !== undefined) fields.title = input.title;
      if (input.difficulty !== undefined) fields.difficulty = input.difficulty;
      if (input.estimatedDuration !== undefined) fields.estimatedDuration = input.estimatedDuration;
      if (input.prerequisites !== undefined) fields.prerequisitesJson = input.prerequisites;
      if (input.tags !== undefined) fields.tagsJson = input.tags;
      return { fields };
    },
    deps
  );
}

export async function updateChunkWithProgressReset(
  id: string,
  input: {
    content?: string;
    title?: string;
    difficulty?: number;
    prerequisites?: string[];
    tags?: string[];
    estimatedDuration?: number;
    forceReset?: boolean;
  },
  deps: ChunkDeps
): Promise<ChunkUpdateResult> {
  return updateChunkFields(
    id,
    (current, now) => {
      const fields: Record<string, unknown> = { updatedAt: now };
      if (input.content !== undefined) {
        fields.content = input.content;
        fields.contentVersion = (current.contentVersion || 1) + 1;
        fields.contentUpdatedAt = now;
        fields.contentStatus = 'final';
      }
      if (input.title !== undefined) fields.title = input.title;
      if (input.difficulty !== undefined) fields.difficulty = input.difficulty;
      if (input.estimatedDuration !== undefined) fields.estimatedDuration = input.estimatedDuration;
      if (input.prerequisites !== undefined) fields.prerequisitesJson = input.prerequisites;
      if (input.tags !== undefined) fields.tagsJson = input.tags;

      let shouldReset = input.forceReset || false;
      if (
        input.content &&
        current.content &&
        hasSignificantContentChange(current.content, input.content)
      ) {
        shouldReset = true;
      }
      if (shouldReset) {
        fields.repetitions = 0;
        fields.easeFactor = 2.5;
        fields.nextReviewAt = now;
        fields.lastReviewedAt = null;
      }
      return { fields, progressReset: shouldReset };
    },
    deps,
    // The audit chain runs even when `input.content === undefined` (metadata-
    // only call through this entry point). That's intentional: Tier 1 rules
    // also check tags, prerequisites, and titles, so a metadata edit through
    // `update_chunk` should still be audited. `update_chunk_metadata` (the
    // dedicated metadata path) skips the audit; `update_chunk` opts in.
    'update_chunk_with_progress_reset'
  );
}

export async function deleteChunk(id: string, deps: ChunkDeps): Promise<DeleteChunkResult> {
  try {
    const chunkToDelete = await deps.chunks.getById(id);
    if (!chunkToDelete) {
      return {
        success: false,
        error: { type: 'not_found', message: `Chunk with id "${id}" not found`, retryable: false },
      };
    }

    const dependentRows = await deps.chunks.findDependents(id);
    const dependentIds = dependentRows.map(r => r.id);

    // Resolve deletion order via dependency resolver
    let orderedIds = dependentIds;
    if (dependentRows.length > 0) {
      const items = dependentRows.map(r => mapChunkRowToLearningItem(r) as LearningItem);
      const resolver = new DependencyResolver(deps.maxDependencyDepth);
      const resolution = resolver.resolveDependencies(items, dependentIds);
      if (resolution.isValid && resolution.resolvedChain.length > 0) {
        orderedIds = resolution.resolvedChain.filter((cid: string) => dependentIds.includes(cid));
      }
    }

    const dependentMap = new Map(dependentRows.map(r => [r.id, r]));
    const cleanups: ChunkDependencyCleanup[] = [];

    await deps.unitOfWork.execute(async ports => {
      const now = Date.now();
      for (const depId of orderedIds) {
        const dep = dependentMap.get(depId);
        // dependentMap is built from the same `dependentRows` array that
        // produces `orderedIds`, so every id has a matching entry. The
        // continue is a logic-error tripwire (no public-API path can hit it).
        /* c8 ignore start */
        if (!dep) continue;
        /* c8 ignore stop */
        const prereqs = dep.prerequisitesJson ?? [];
        const remaining = prereqs.filter(pid => pid !== id);
        if (remaining.length === prereqs.length) continue;
        await ports.chunks.update(depId, {
          prerequisitesJson: remaining,
          updatedAt: now,
        } as Partial<Omit<NewLearningChunk, 'id' | 'topicId' | 'createdAt'>>);
        cleanups.push({
          chunkId: depId,
          chunkTitle: dep.title,
          removedPrerequisites: [id],
          previousPrerequisites: prereqs,
          remainingPrerequisites: remaining,
        });
      }
      const deleted = await ports.chunks.delete(id);
      if (deleted === 0) throw new Error('Failed to delete chunk from database');
    });

    try {
      logEvent('deleteChunk', 'chunk_deleted', {
        chunkId: id,
        topicId: chunkToDelete.topicId,
        title: chunkToDelete.title,
      });
    } catch {
      // A broken event logger must not poison a successful commit.
    }

    return { success: true, chunk: chunkToDelete, removedDependencies: cleanups };
  } catch (error) {
    return {
      success: false,
      error: { type: 'database', message: extractErrorMessage(error), retryable: true },
    };
  }
}

export type CreateChunkResult = {
  chunk: LearningChunk;
  /**
   * NEU-686: Tier 2 (classifier) warning findings populated post-commit when
   * the classifier ran on `createChunkWithTopic` and at least one verdict
   * field scored ≤ the soft-warn threshold. Absent on the no-classifier path.
   * Only fields outside `blockingFields` surface here as warnings.
   */
  tier2Findings?: LinterFinding[];
};

export async function createChunkWithTopic(
  input: NewLearningChunk & { topicTitle?: string },
  deps: ChunkDeps
): Promise<ServiceResult<CreateChunkResult>> {
  const auditPath: AuditPath = 'create_chunk_with_topic';
  try {
    // ─── Tier 1 pre-persist audit ─────────────────────────────────────
    // Resolves topic context for the lint input (read-only) without yet
    // creating the topic. For an existing `input.topicId` we fetch the topic;
    // for an auto-create branch (`topicTitle && !topicId`) we use the input
    // values directly. On Tier 1a block we return immediately — no topic is
    // auto-created and no chunk is inserted, so the DB state is untouched.
    let lintTopicTitle = '';
    let lintTopicSummary = '';
    let lintSubject = input.subject;
    if (input.topicId) {
      try {
        const topic = await deps.topics.getById(input.topicId);
        if (topic) {
          lintTopicTitle = topic.title;
          lintTopicSummary = topic.summary ?? '';
          lintSubject = topic.subject;
        }
      } catch (err) {
        getRequestLogger().warn(`Failed to load topic ${input.topicId} for chunk audit:`, err);
      }
    } else if (input.topicTitle) {
      lintTopicTitle = input.topicTitle;
    }

    let tier1Findings: LinterFinding[] = [];
    let tier1RuleMeta: Awaited<ReturnType<typeof runTier1Audit>>['ruleMetaByName'] | undefined;
    if (deps.linterRules && deps.linterRules.length > 0) {
      const lintInput: TopicLintInput = {
        // When `input.topicId` is supplied (caller picked an existing topic)
        // pass it so topic-scoped Tier 1 rules see the real id; the empty
        // string only applies to the auto-create branch where the topic UUID
        // is allocated downstream of the lint.
        topicId: input.topicId || '',
        topicTitle: lintTopicTitle,
        subject: lintSubject,
        topicSummary: lintTopicSummary,
        chunks: [
          {
            chunkId: input.id,
            title: input.title,
            content: input.content ?? null,
            chunkType: input.chunkType,
            condensedSummary: input.condensedSummary ?? null,
            prerequisites: input.prerequisitesJson ?? [],
            tags: input.tagsJson ?? [],
            difficulty: input.difficulty,
            estimatedDuration: input.estimatedDuration,
            knowledgeType: input.knowledgeType ?? null,
          },
        ],
      };
      const tier1 = runTier1Audit(lintInput, deps.linterRules);
      tier1Findings = tier1.findings;
      tier1RuleMeta = tier1.ruleMetaByName;
      if (tier1.blocking) {
        const blockingCount = tier1Findings.filter(f => f.severity === 'blocking').length;
        return serviceFail({
          type: 'content_quality',
          message: `Chunk creation blocked for chunk ${input.id} by ${blockingCount} content-quality finding${blockingCount === 1 ? '' : 's'}`,
          findings: tier1Findings,
          retryable: false,
        });
      }
    }

    // ─── Topic resolution + chunk insert (existing flow + audit report) ──
    let topicId = input.topicId;
    let autoCreatedTopic: { id: string; title: string } | null = null;

    if (input.topicTitle && !topicId) {
      // Find existing topic by title+subject or create one
      const topics = await deps.topics.list();
      const existing = topics.find(
        t => t.title === input.topicTitle && t.subject === input.subject
      );
      if (existing) {
        topicId = existing.id;
      } else {
        topicId = crypto.randomUUID();
        const now = Date.now();
        await deps.topics.create({
          id: topicId,
          title: input.topicTitle,
          subject: input.subject,
          createdAt: now,
          updatedAt: now,
        });
        autoCreatedTopic = { id: topicId, title: input.topicTitle };
      }
    }

    const { topicTitle: _tt, ...chunkInput } = input;
    void _tt; // stripped before persistence — topicTitle is a helper-only field
    // Anchor the Tier 1 validator-report timestamp to the chunk's persisted
    // `updatedAt` so audit and row timestamps line up — mirrors the update
    // path which uses `new Date(now).toISOString()` where `now` is the same
    // value written to the row.
    const isoNow = new Date(input.updatedAt).toISOString();
    const validatorReport =
      tier1RuleMeta !== undefined
        ? buildSingleChunkValidatorReport(input.id, tier1Findings, tier1RuleMeta, isoNow)
        : undefined;
    await deps.chunks.create({
      ...chunkInput,
      topicId,
      ...(validatorReport !== undefined ? { validatorReport } : {}),
    });
    const created = await deps.chunks.getById(input.id);
    if (!created) {
      return serviceFail({
        type: 'database',
        message: `Failed to create chunk with id: ${input.id}`,
      });
    }

    // Wrap each emission in its own try/catch so a failure on the optional
    // auto-created-topic event can't suppress the required chunk_created event.
    if (autoCreatedTopic) {
      try {
        logEvent('createTopic', 'topic_created', {
          topicId: autoCreatedTopic.id,
          title: autoCreatedTopic.title,
          chunkCount: 1,
        });
      } catch {
        // A broken event logger must not poison a successful commit.
      }
    }
    try {
      logEvent('createChunk', 'chunk_created', {
        chunkId: created.id,
        topicId: created.topicId,
        title: created.title,
      });
    } catch {
      // A broken event logger must not poison a successful commit.
    }

    // Generate embedding for chunk content (best-effort, outside transaction)
    if (created.content && deps.embedding) {
      try {
        const vector = await deps.embedding.embedText(created.content);
        if (vector) {
          const rowCount = await deps.chunks.saveContentEmbedding(created.id, vector);
          if (rowCount === 0) {
            getRequestLogger().warn(`Failed to save content embedding for chunk ${created.id}`);
          }
        }
      } catch (err) {
        getRequestLogger().warn('Embedding generation failed for new chunk:', err);
      }
    }

    // ─── Tier 2 post-commit audit ────────────────────────────────────
    // Same fail-open contract as the update path: a throw inside the
    // classifier or the breaker must not poison a successful chunk write.
    let tier2Findings: LinterFinding[] | undefined;
    let tier2BlockingHits: Tier2BlockingHit[] = [];
    if (deps.enableClassifier === true && deps.classifier !== undefined) {
      try {
        const passResult = await runTier2AuditPostCommit({
          topicId: created.topicId,
          chunks: [created],
          classifier: deps.classifier,
          chunksRepo: deps.chunks,
          blockingFields: deps.blockingFields ?? new Set(),
          tier2CircuitBreaker: deps.tier2CircuitBreaker,
        });
        tier2Findings = passResult.findings;
        tier2BlockingHits = passResult.blockingHits;
        /* c8 ignore start -- defensive: `runTier2AuditPostCommit` already
           absorbs every classifier/breaker failure mode it knows about
           (Promise.allSettled around classifyChunk; try/catch around
           breaker.applyTo). This catch is belt-and-braces for a future
           helper that forgets to swallow. */
      } catch (err) {
        getRequestLogger().warn('Tier 2 classifier pass failed for new chunk:', err);
      }
      /* c8 ignore stop */
    }

    if (tier2BlockingHits.length > 0) {
      // Rollback: delete the chunk first; if the topic was auto-created in
      // this call, delete it too (mirrors `topic-workflows.ts` topic-rollback).
      // A topic that already existed (or was matched by title+subject) is
      // never deleted on Tier 2 block — only the row this call created.
      let rollbackFailed = false;
      let rollbackErrorMessage: string | undefined;
      try {
        const chunkRowCount = await deps.chunks.delete(created.id);
        if (chunkRowCount === 0) {
          rollbackFailed = true;
          rollbackErrorMessage = `chunk delete affected 0 rows for ${created.id}`;
          getRequestLogger().warn(`Tier 2 block: chunk delete affected 0 rows for ${created.id}`);
        }
      } catch (err) {
        rollbackFailed = true;
        rollbackErrorMessage = `chunk delete threw: ${extractErrorMessage(err)}`;
        getRequestLogger().warn(`Tier 2 block: chunk delete threw for ${created.id}:`, err);
      }
      if (!rollbackFailed && autoCreatedTopic !== null) {
        try {
          const topicResult = await deps.topics.delete(autoCreatedTopic.id);
          if (!topicResult.success) {
            rollbackFailed = true;
            rollbackErrorMessage = `topic delete failed for ${autoCreatedTopic.id}: ${topicResult.error?.message ?? 'unknown'}`;
            getRequestLogger().warn(
              `Tier 2 block: topic delete failed for ${autoCreatedTopic.id}: ${topicResult.error?.message ?? 'unknown'}`
            );
          }
        } catch (err) {
          rollbackFailed = true;
          rollbackErrorMessage = `topic delete threw: ${extractErrorMessage(err)}`;
          getRequestLogger().warn(
            `Tier 2 block: topic delete threw for ${autoCreatedTopic.id}:`,
            err
          );
        }
      }

      // Emit one event per hit regardless of rollback outcome — the rejection
      // happened, the rollback is a separate concern.
      for (const hit of tier2BlockingHits) {
        try {
          logEvent('createChunk', 'classifier.tier2_blocked', {
            chunk_id: hit.chunkId,
            field: hit.field,
            score: hit.score,
            rationale: truncateRationaleForEvent(hit.rationale),
            audit_path: auditPath,
          });
        } catch {
          // A broken event logger must not change the response.
        }
      }

      if (rollbackFailed) {
        // Same defensive fallback as the update path — every code path that
        // sets rollbackFailed=true also assigns rollbackErrorMessage.
        /* c8 ignore start */
        const reason = rollbackErrorMessage ?? 'unknown';
        /* c8 ignore stop */
        return serviceFail({
          type: 'database',
          message: `Tier 2 classifier rejected chunk ${created.id} but rollback failed (${reason}). Manual cleanup may be required.`,
          retryable: true,
        });
      }

      const first = tier2BlockingHits[0];
      const summary = `Tier 2 classifier rejected creation: chunk ${first.chunkId} field ${first.field} scored ${first.score} (${first.rationale})${tier2BlockingHits.length > 1 ? ` — and ${tier2BlockingHits.length - 1} other field(s)` : ''}.`;
      const blockingFindings: LinterFinding[] = tier2BlockingHits.map(h => ({
        chunkId: h.chunkId,
        rule: `classifier.${h.field}`,
        severity: 'blocking',
        category: 'tier2',
        detail: h.rationale,
      }));
      // Same defensive `?? []` as the update path — tier2Findings is undefined
      // only on a runTier2AuditPostCommit throw, which would also leave
      // tier2BlockingHits empty.
      /* c8 ignore next */
      const mergedFindings: LinterFinding[] = [...blockingFindings, ...(tier2Findings ?? [])];
      return serviceFail({
        type: 'content_quality',
        message: summary,
        retryable: false,
        findings: mergedFindings,
      });
    }

    if (tier2Findings && tier2Findings.length > 0) {
      return serviceOk({ chunk: created, tier2Findings });
    }
    return serviceOk({ chunk: created });
  } catch (error) {
    return serviceFail({ type: 'database', message: extractErrorMessage(error) });
  }
}
