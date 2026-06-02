import crypto from 'node:crypto';
import type { TopicRepository } from '../ports/topic-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { UnitOfWorkPort } from '../ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../ports/embedding-port.js';
import type { ContentClassifierPort } from '../ports/content-classifier-port.js';
import type {
  LearningChunk,
  LearningTopic,
  KnowledgeType,
  DependencyGraphType,
} from '../domain/types/entities.js';
import type { ContentStatus } from '../domain/types/recommendations.js';
import type { ServiceError } from '../domain/types/service-result.js';
import type { LinterFinding, LinterRule, TopicLintInput } from '../domain/services/chunk-linter.js';
import type { VerdictFieldName } from '../domain/types/classifier.js';
import { VALIDATION_CONSTANTS } from '../shared/constants/validation.js';
import { extractErrorMessage } from '../shared/errors.js';
import { getRequestLogger, logEvent } from '../shared/logger.js';

import {
  runTier1Audit,
  runTier2AuditPostCommit,
  buildSingleChunkValidatorReport,
  type Tier2BlockingHit,
  type Tier2CircuitBreakerHandle,
} from './audit-pipeline.js';

export type TopicDeps = {
  topics: TopicRepository;
  chunks: ChunkRepository;
  unitOfWork: UnitOfWorkPort;
  embedding?: EmbeddingPort;
  /** Tier 2 content classifier (NEU-619). Invoked post-commit by NEU-620. */
  classifier?: ContentClassifierPort;
  /**
   * Mirrors `CLASSIFIER_ENABLE`. When `true` AND `classifier` is present,
   * the Tier 2 classifier runs on every audit-eligible write path (post-
   * commit on creation today; NEU-680 extends to update paths). Defaults
   * to `false` so test fixtures and unconfigured runs keep the previous
   * behavior.
   */
  enableClassifier?: boolean;
  /**
   * NEU-621: per-field allowlist of verdict fields that, when scored at or
   * below the soft-warn threshold, will reject topic creation and roll back
   * the just-persisted topic. Empty/absent = soft-warn only (the NEU-620
   * default).
   */
  blockingFields?: ReadonlySet<VerdictFieldName>;
  /**
   * NEU-621: optional circuit-breaker that may shrink the effective
   * `blockingFields` set when a field's recent rejection rate exceeds the
   * rolling-mean + 2σ threshold. Absent in tests and in environments where
   * the breaker is disabled.
   */
  tier2CircuitBreaker?: Tier2CircuitBreakerHandle;
  linterRules?: LinterRule[];
};

export type TopicUpdateResult = {
  success: boolean;
  topic?: LearningTopic;
  error?: ServiceError;
};

export type TopicWithChunks = {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  topicSummary?: string;
  subject: string;
  dependencyGraphType: DependencyGraphType | null;
  chunks: Array<{
    id: string;
    title: string;
    content: string;
    difficulty: number;
    estimatedDuration: number;
    order: number;
    prerequisites: string[];
    tags: string[];
    chunkType: string;
    contentStatus: ContentStatus;
    condensedSummary: string | null;
    knowledgeType: KnowledgeType | null;
  }>;
  createdAt: number;
  updatedAt: number;
  /**
   * Tier 2 (classifier) warning findings. Populated post-commit by NEU-620
   * only when the classifier ran and at least one verdict field scored ≤ 2.
   * Absent when the classifier was not configured, was disabled, failed, or
   * produced no low-score fields. Only fields outside the effective NEU-621
   * `blockingFields` set surface here as warnings — fields inside that set
   * route through the blocking branch instead and never appear here on a
   * successful create.
   */
  tier2Findings?: LinterFinding[];
};

export type TopicCreationInput = {
  topicTitle: string;
  subject: string;
  topicDescription?: string;
  topicSummary: string;
  dependencyGraphType?: DependencyGraphType;
  chunks: Array<{
    id: string;
    title: string;
    content?: string;
    difficulty: number;
    estimatedDuration: number;
    prerequisites?: string[];
    tags?: string[];
    chunkType: string;
    contentStatus?: ContentStatus;
    condensedSummary?: string;
    knowledgeType?: KnowledgeType;
  }>;
};

export type TopicCreationResult = {
  success: boolean;
  topic?: TopicWithChunks;
  error?: {
    type: 'validation' | 'database' | 'generation' | 'content_quality';
    message: string;
    retryable: boolean;
    findings?: LinterFinding[];
  };
};

// --- Topic creation ---

function toTopicWithChunks(
  topic: LearningTopic,
  chunks: LearningChunk[],
  description?: string
): TopicWithChunks {
  return {
    topicId: topic.id,
    topicTitle: topic.title,
    topicDescription: description || '',
    topicSummary: topic.summary || undefined,
    subject: topic.subject,
    dependencyGraphType: topic.dependencyGraphType,
    chunks: chunks.map((c, i) => ({
      id: c.id,
      title: c.title,
      content: c.content || '',
      difficulty: c.difficulty,
      estimatedDuration: c.estimatedDuration,
      order: i + 1,
      prerequisites: c.prerequisitesJson ?? [],
      tags: c.tagsJson ?? [],
      chunkType: c.chunkType,
      contentStatus: c.contentStatus,
      condensedSummary: c.condensedSummary,
      knowledgeType: c.knowledgeType,
    })),
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

export async function createTopicWithChunks(
  input: TopicCreationInput,
  deps: TopicDeps
): Promise<TopicCreationResult> {
  const topicLintInput: TopicLintInput = {
    topicId: '',
    topicTitle: input.topicTitle,
    subject: input.subject,
    topicSummary: input.topicSummary,
    chunks: input.chunks.map(c => ({
      chunkId: c.id,
      title: c.title,
      content: c.content ?? null,
      chunkType: c.chunkType,
      condensedSummary: c.condensedSummary ?? null,
      prerequisites: c.prerequisites ?? [],
      tags: c.tags ?? [],
      difficulty: c.difficulty,
      estimatedDuration: c.estimatedDuration,
      knowledgeType: c.knowledgeType ?? null,
    })),
  };
  const {
    findings: lintFindings,
    blocking: lintBlocking,
    ruleMetaByName,
  } = runTier1Audit(topicLintInput, deps.linterRules ?? []);
  if (lintBlocking) {
    const blockingCount = lintFindings.filter(f => f.severity === 'blocking').length;
    return {
      success: false,
      error: {
        type: 'content_quality',
        message: `Topic creation blocked by ${blockingCount} content-quality finding${blockingCount === 1 ? '' : 's'}`,
        findings: lintFindings,
        // NEU-752: content_quality rejections are retryable — a corrected payload
        // passes the same deterministic audit, so signal agents to fix-and-retry.
        retryable: true,
      },
    };
  }

  try {
    const result = await deps.unitOfWork.execute(async ports => {
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const topic: LearningTopic = {
        id: topicId,
        title: input.topicTitle,
        subject: input.subject,
        summary: input.topicSummary,
        summaryVersion: 1,
        summaryUpdatedAt: now,
        dependencyGraphType: input.dependencyGraphType ?? null,
        createdAt: now,
        updatedAt: now,
      };
      await ports.topics.create(topic);

      const createdChunks: LearningChunk[] = [];
      for (let i = 0; i < input.chunks.length; i++) {
        const chunkDef = input.chunks[i];
        const chunkCreatedAt = now + i; // monotonic ordering within batch
        const validatorReport = buildSingleChunkValidatorReport(
          chunkDef.id,
          lintFindings,
          ruleMetaByName,
          nowIso
        );
        const chunkRow: LearningChunk = {
          id: chunkDef.id,
          topicId,
          title: chunkDef.title,
          subject: input.subject,
          difficulty: chunkDef.difficulty,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          consecutiveFailures: 0,
          lastReviewedAt: null,
          estimatedDuration: chunkDef.estimatedDuration,
          intervalDays: null,
          chunkType: chunkDef.chunkType,
          prerequisitesJson: chunkDef.prerequisites ?? null,
          tagsJson: chunkDef.tags ?? null,
          content: chunkDef.content || null,
          contentVersion: chunkDef.content ? 1 : null,
          contentUpdatedAt: chunkDef.content ? now : null,
          contentStatus: chunkDef.contentStatus ?? 'final',
          condensedSummary: chunkDef.condensedSummary ?? null,
          knowledgeType: chunkDef.knowledgeType ?? null,
          validatorReport,
          createdAt: chunkCreatedAt,
          updatedAt: now,
        };
        await ports.chunks.create(chunkRow);
        createdChunks.push(chunkRow);
      }

      return { topic, chunks: createdChunks };
    });

    try {
      logEvent('createTopic', 'topic_created', {
        topicId: result.topic.id,
        title: result.topic.title,
        chunkCount: result.chunks.length,
      });
    } catch {
      // A broken event logger must not poison a successful commit.
    }

    // Best-effort embedding generation — runs outside the transaction intentionally.
    // Awaited so embeddings are ready before returning, but failures are caught and
    // do not invalidate the topic/chunk data. Embeddings will be regenerated on the
    // next content update.
    if (deps.embedding) {
      try {
        await generateTopicEmbeddings(result.topic, result.chunks, deps);
      } catch (err) {
        getRequestLogger().warn('Embedding generation failed for new topic:', err);
      }
    }

    // Best-effort Tier 2 (classifier) pass — runs outside the transaction for
    // the same reason embeddings do: the external LLM call has ~2 s p95 latency
    // and any throw inside `unitOfWork.execute` would roll back topic creation,
    // breaking the fail-open contract. NEU-621 adds an opt-in per-field
    // blocking branch: if any verdict field in `deps.blockingFields` scores at
    // or below the soft-warn threshold, the just-persisted topic is rolled back
    // and a typed validation error is returned.
    let tier2Findings: LinterFinding[] | undefined;
    let tier2BlockingHits: Tier2BlockingHit[] = [];
    if (deps.classifier && deps.enableClassifier === true) {
      try {
        const passResult = await runTier2AuditPostCommit({
          topicId: result.topic.id,
          chunks: result.chunks,
          classifier: deps.classifier,
          chunksRepo: deps.chunks,
          blockingFields: deps.blockingFields ?? new Set(),
          tier2CircuitBreaker: deps.tier2CircuitBreaker,
        });
        tier2Findings = passResult.findings;
        tier2BlockingHits = passResult.blockingHits;
      } catch (err) {
        // Defensive: port contract is fail-open, but a bugged adapter must not
        // poison creation.
        getRequestLogger().warn('Tier 2 classifier pass failed for new topic:', err);
      }
    }

    if (tier2BlockingHits.length > 0) {
      // Roll back the just-persisted topic — NEU-621 contract is "creation
      // rejected" when any blocking-eligible field falls below threshold.
      // Rollback failure is reported as a retryable database error so the
      // client/operator knows the persisted topic was NOT cleaned up;
      // returning the non-retryable rejection in that case would leave the
      // DB inconsistent with the externally observed outcome and silently
      // accumulate orphaned rows on retry.
      let rollbackFailed = false;
      let rollbackErrorMessage: string | undefined;
      try {
        const deleteResult = await deps.topics.delete(result.topic.id);
        if (!deleteResult.success) {
          rollbackFailed = true;
          rollbackErrorMessage = deleteResult.error?.message ?? 'unknown';
          getRequestLogger().warn(
            `Tier 2 block: rollback delete failed for topic ${result.topic.id}: ${rollbackErrorMessage}`
          );
        }
      } catch (err) {
        rollbackFailed = true;
        rollbackErrorMessage = extractErrorMessage(err);
        getRequestLogger().warn(
          `Tier 2 block: rollback delete threw for topic ${result.topic.id}:`,
          err
        );
      }
      for (const hit of tier2BlockingHits) {
        try {
          logEvent('createTopicWithChunks', 'classifier.tier2_blocked', {
            topic_id: result.topic.id,
            chunk_id: hit.chunkId,
            field: hit.field,
            score: hit.score,
            rationale: truncateRationaleForEvent(hit.rationale),
            // NEU-686: discriminator string identifying which orchestration
            // entry point emitted the block — uniform across all five
            // chunk-content write paths so downstream telemetry can split
            // rejections by surface.
            audit_path: 'create_topic_with_chunks',
          });
        } catch {
          // Defensive: a broken event logger must not change the response.
        }
      }
      if (rollbackFailed) {
        return {
          success: false,
          error: {
            type: 'database',
            message: `Tier 2 classifier rejected creation but rollback failed for topic ${result.topic.id} (${rollbackErrorMessage ?? 'unknown'}). Manual cleanup may be required.`,
            retryable: true,
          },
        };
      }
      const first = tier2BlockingHits[0];
      const summary = `Tier 2 classifier rejected creation: chunk ${first.chunkId} field ${first.field} scored ${first.score} (${first.rationale})${tier2BlockingHits.length > 1 ? ` — and ${tier2BlockingHits.length - 1} other field(s)` : ''}.`;
      // `content_quality` (not `validation`) so the server layer surfaces
      // the per-field findings to the caller — see src/server/topic-tools.ts
      // where `findings` is only included when `errorType === 'content_quality'`.
      // NEU-672: warning-tier `tier2Findings` accumulated for the same topic
      // are surfaced alongside the blocking ones so the caller sees the full
      // picture. `severity` distinguishes blocking from warning.
      const blockingFindings: LinterFinding[] = tier2BlockingHits.map(h => ({
        chunkId: h.chunkId,
        rule: `classifier.${h.field}`,
        severity: 'blocking',
        category: 'tier2',
        detail: h.rationale,
      }));
      const mergedFindings: LinterFinding[] = [...blockingFindings, ...(tier2Findings ?? [])];
      return {
        success: false,
        error: {
          type: 'content_quality',
          message: summary,
          // NEU-752: content_quality rejections are retryable (corrected payload can succeed).
          retryable: true,
          findings: mergedFindings,
        },
      };
    }

    const topicWithChunks = toTopicWithChunks(result.topic, result.chunks, input.topicDescription);
    if (tier2Findings && tier2Findings.length > 0) {
      topicWithChunks.tier2Findings = tier2Findings;
    }
    return {
      success: true,
      topic: topicWithChunks,
    };
  } catch (error) {
    getRequestLogger().error('Failed to create topic with chunks:', error);
    return {
      success: false,
      error: { type: 'database', message: extractErrorMessage(error), retryable: true },
    };
  }
}

// --- Topic updates ---

export async function updateTopicMetadata(
  topicId: string,
  updates: { title?: string; subject?: string },
  deps: TopicDeps
): Promise<TopicUpdateResult> {
  try {
    const current = await deps.topics.getById(topicId);
    if (!current) {
      return {
        success: false,
        error: { type: 'not_found', message: `Topic with id "${topicId}" not found` },
      };
    }

    if (
      updates.title !== undefined &&
      (!updates.title || updates.title.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH)
    ) {
      return {
        success: false,
        error: { type: 'validation', message: 'Invalid topic title', field: 'title' },
      };
    }
    if (
      updates.subject !== undefined &&
      (!updates.subject || updates.subject.length > VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH)
    ) {
      return {
        success: false,
        error: { type: 'validation', message: 'Invalid subject', field: 'subject' },
      };
    }

    const data: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.subject !== undefined) data.subject = updates.subject;

    // Wrap topic update + subject cascade in a transaction for atomicity
    if (updates.subject !== undefined) {
      const newSubject = updates.subject;
      await deps.unitOfWork.execute(async ports => {
        const result = await ports.topics.update(
          topicId,
          data as Parameters<TopicRepository['update']>[1]
        );
        if (!result.success) throw new Error(result.error?.message ?? 'Topic update failed');

        const allChunks = await ports.chunks.list({ subjectFilter: current.subject });
        const topicChunks = allChunks.filter(c => c.topicId === topicId);
        const now = Date.now();
        for (const chunk of topicChunks) {
          await ports.chunks.update(chunk.id, { subject: newSubject, updatedAt: now });
        }
      });
    } else {
      const result = await deps.topics.update(
        topicId,
        data as Parameters<TopicRepository['update']>[1]
      );
      if (!result.success) return { success: false, error: result.error };
    }

    const updated = await deps.topics.getById(topicId);
    const fieldsChanged: string[] = [];
    if (updates.title !== undefined) fieldsChanged.push('title');
    if (updates.subject !== undefined) fieldsChanged.push('subject');
    // Skip emission when the caller specified no user-facing field — emitting
    // `topic_updated` with an empty `fieldsChanged` is ambiguous noise for
    // downstream consumers. `fieldsChanged` reflects user intent (which fields
    // the caller asked to change), not an actual DB diff.
    if (fieldsChanged.length > 0) {
      try {
        logEvent('updateTopic', 'topic_updated', { topicId, fieldsChanged });
      } catch {
        // A broken event logger must not poison a successful commit.
      }
    }
    return { success: true, topic: updated };
  } catch (error) {
    return { success: false, error: { type: 'database', message: extractErrorMessage(error) } };
  }
}

export async function updateTopicSummary(
  topicId: string,
  summary: string,
  deps: TopicDeps
): Promise<TopicUpdateResult> {
  try {
    const current = await deps.topics.getById(topicId);
    if (!current) {
      return {
        success: false,
        error: { type: 'not_found', message: `Topic with id "${topicId}" not found` },
      };
    }

    if (summary.length > VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Summary cannot exceed 5000 characters',
          field: 'summary',
        },
      };
    }
    if (summary.length < VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH) {
      return {
        success: false,
        error: { type: 'validation', message: 'Summary cannot be empty', field: 'summary' },
      };
    }

    const now = Date.now();
    const newVersion = (current.summaryVersion ?? 1) + 1;

    // Clear stale embedding before updating summary — if re-embedding fails,
    // we prefer no embedding over a misleading one from old summary content.
    await deps.topics.saveSummaryEmbedding(topicId, null);

    const result = await deps.topics.update(topicId, {
      summary,
      summaryVersion: newVersion,
      summaryUpdatedAt: now,
      updatedAt: now,
    });

    // Best-effort re-embedding after summary update
    if (deps.embedding) {
      try {
        const vector = await deps.embedding.embedText(summary);
        if (vector) {
          await deps.topics.saveSummaryEmbedding(topicId, vector);
        }
      } catch (err) {
        getRequestLogger().warn('Embedding generation failed for topic summary:', err);
      }
    }

    if (!result.success) return { success: false, error: result.error };

    const updated = await deps.topics.getById(topicId);
    try {
      logEvent('updateTopic', 'topic_updated', { topicId, fieldsChanged: ['summary'] });
    } catch {
      // A broken event logger must not poison a successful commit.
    }
    return { success: true, topic: updated };
  } catch (error) {
    return { success: false, error: { type: 'database', message: extractErrorMessage(error) } };
  }
}

// --- Rollback event payload helper (NEU-672) ---

/**
 * NEU-672 hard gate: cap rationale length before persisting to the
 * indefinitely-retained `infrastructure.operation_event_log`. Rationales may
 * quote user-supplied chunk content verbatim, so an unbounded persisted value
 * would store unbounded PII. Full rationale still flows through the
 * synchronous `error.findings[].detail` response — only the persisted event
 * payload is clipped.
 */
const RATIONALE_PERSIST_MAX_CHARS = 256;
const RATIONALE_TRUNCATION_MARKER = '…[truncated]';

function truncateRationaleForEvent(rationale: string): string {
  if (rationale.length <= RATIONALE_PERSIST_MAX_CHARS) return rationale;
  return rationale.slice(0, RATIONALE_PERSIST_MAX_CHARS) + RATIONALE_TRUNCATION_MARKER;
}

// --- Embedding helpers ---

async function generateTopicEmbeddings(
  topic: LearningTopic,
  chunks: LearningChunk[],
  deps: TopicDeps
): Promise<void> {
  const embedding = deps.embedding;
  if (!embedding) return;

  // Embed topic summary
  if (topic.summary) {
    const summaryVector = await embedding.embedText(topic.summary);
    if (summaryVector) {
      const rowCount = await deps.topics.saveSummaryEmbedding(topic.id, summaryVector);
      if (rowCount === 0) {
        getRequestLogger().warn(`Failed to save summary embedding for topic ${topic.id}`);
      }
    }
  }

  // Batch-embed chunk contents
  const chunksWithContent = chunks.filter((c): c is typeof c & { content: string } => !!c.content);
  if (chunksWithContent.length === 0) return;

  const texts = chunksWithContent.map(c => c.content);
  const vectors = await embedding.embedTexts(texts);
  await Promise.all(
    chunksWithContent.map(async (chunk, i) => {
      const vector = vectors[i];
      if (!vector) return;
      const result = await deps.chunks.saveContentEmbedding(chunk.id, vector);
      if (result === 0) {
        getRequestLogger().warn(`Failed to save content embedding for chunk ${chunk.id}`);
      }
    })
  );
}
