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
  type ClassifierPrompt,
  type VerdictFieldName,
} from '../domain/types/classifier.js';
import {
  CLASSIFIER_PROMPT_VERSION,
  PERSISTED_TIER2_FIELD_NAMES,
  buildClassifierPrompt,
  toPersistedTier2,
} from '../shared/prompts/classifier-prompts.js';
import { renderClassifierUserPayload } from '../domain/services/render-classifier-prompt.js';
import { VALIDATION_CONSTANTS } from '../shared/constants/validation.js';
import { extractErrorMessage } from '../shared/errors.js';
import { getRequestLogger, logEvent } from '../shared/logger.js';

export type TopicDeps = {
  topics: TopicRepository;
  chunks: ChunkRepository;
  unitOfWork: UnitOfWorkPort;
  embedding?: EmbeddingPort;
  /** Tier 2 content classifier (NEU-619). Invoked post-commit by NEU-620. */
  classifier?: ContentClassifierPort;
  /**
   * Mirrors `CLASSIFIER_ENABLE_AT_CREATE`. When `true` AND `classifier` is
   * present, NEU-620 runs the classifier after the topic-creation transaction
   * commits. Defaults to `false` so test fixtures and unconfigured runs keep
   * the previous behavior.
   */
  enableClassifierAtCreate?: boolean;
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
   * produced no low-score fields. These findings never escalate to blocking.
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

/**
 * Build the per-chunk `validator_report` payload from the suite-wide findings.
 * Routes findings into `tier1a`/`tier1b` sections by looking up each finding's
 * rule name in `ruleTierByName`. Findings whose rule isn't in the map are
 * dropped (defensive — would only happen if a rule emitted with an unknown
 * name). Empty buckets are omitted; the returned object always carries
 * `updated_at`, even when no findings exist (canonical empty).
 */
function buildValidatorReport(
  chunkId: string,
  allFindings: readonly LinterFinding[],
  ruleTierByName: ReadonlyMap<string, LinterRuleTier>,
  updatedAtIso: string
): ValidatorReport {
  const tier1a: LinterFinding[] = [];
  const tier1b: LinterFinding[] = [];
  for (const finding of allFindings) {
    if (finding.chunkId !== chunkId) continue;
    const tier = ruleTierByName.get(finding.rule);
    if (tier === 'tier1a') {
      tier1a.push(finding);
    } else if (tier === 'tier1b') {
      tier1b.push(finding);
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
    })),
  };
  const lintResult = runLinterSuite(deps.linterRules ?? [], topicLintInput, {
    onRuleError: (ruleName, error) => {
      getRequestLogger().warn(
        `Linter rule "${ruleName}" threw — treating as zero findings:`,
        error
      );
    },
  });
  if (lintResult.blocking) {
    const blockingCount = lintResult.findings.filter(f => f.severity === 'blocking').length;
    return {
      success: false,
      error: {
        type: 'content_quality',
        message: `Topic creation blocked by ${blockingCount} content-quality finding${blockingCount === 1 ? '' : 's'}`,
        findings: lintResult.findings,
        retryable: false,
      },
    };
  }

  // Build a rule-name → tier map once so per-chunk grouping below is O(1).
  // Findings carry only `rule: string`, not the rule definition itself
  // (see chunk-linter.ts), so we look up the tier here.
  const ruleTierByName = new Map<string, LinterRuleTier>();
  for (const rule of deps.linterRules ?? []) {
    ruleTierByName.set(rule.name, rule.tier);
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
        const validatorReport = buildValidatorReport(
          chunkDef.id,
          lintResult.findings,
          ruleTierByName,
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
    // breaking the fail-open contract. NEU-621 owns the blocking-mode flip;
    // `CLASSIFIER_BLOCKING_MODE` has no effect in this ticket by design.
    let tier2Findings: LinterFinding[] | undefined;
    if (deps.classifier && deps.enableClassifierAtCreate === true) {
      try {
        tier2Findings = await classifyChunksSoftWarn(
          result.topic.id,
          result.chunks,
          deps.classifier,
          deps.chunks
        );
      } catch (err) {
        // Defensive: port contract is fail-open, but a bugged adapter must not
        // poison creation.
        getRequestLogger().warn('Tier 2 classifier pass failed for new topic:', err);
      }
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
    return { success: true, topic: updated };
  } catch (error) {
    return { success: false, error: { type: 'database', message: extractErrorMessage(error) } };
  }
}

// --- Tier 2 classifier helpers (NEU-620) ---

/**
 * Low-score threshold for emitting a Tier 2 warning finding. Hardcoded to 2 per
 * the NEU-620 spec — anything with `score <= 2` surfaces; never blocks.
 */
const TIER2_LOW_SCORE_THRESHOLD = 2;

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
 * creation. Returns the aggregated Tier 2 warning findings.
 */
async function classifyChunksSoftWarn(
  topicId: string,
  chunks: readonly LearningChunk[],
  classifier: ContentClassifierPort,
  chunksRepo: ChunkRepository
): Promise<LinterFinding[]> {
  // The classifier prompt is chunk-independent (rubric + few-shots only), so
  // build it once for the whole fan-out instead of re-rendering the ~3 KB
  // string per chunk.
  const prompt = buildClassifierPrompt();
  // `allSettled` (not `all`) so one chunk's unexpected rejection does not
  // discard already-computed findings from its siblings. `classifyChunk`
  // already absorbs every failure mode it knows about; this is belt-and-
  // suspenders for future helper edits.
  const results = await Promise.allSettled(
    chunks.map(chunk => classifyChunk(topicId, chunk, prompt, classifier, chunksRepo))
  );
  const findings: LinterFinding[] = [];
  for (let i = 0; i < results.length; i += 1) {
    const outcome = results[i];
    if (outcome.status === 'fulfilled') {
      for (const finding of outcome.value) findings.push(finding);
    } else {
      getRequestLogger().warn(
        `Tier 2 classifier pass rejected for chunk ${chunks[i].id}:`,
        outcome.reason
      );
    }
  }
  return findings;
}

async function classifyChunk(
  topicId: string,
  chunk: LearningChunk,
  prompt: ClassifierPrompt,
  classifier: ContentClassifierPort,
  chunksRepo: ChunkRepository
): Promise<LinterFinding[]> {
  // Skip classification on chunks with no content — nothing meaningful to grade.
  if (!chunk.content) return [];

  const startedAt = Date.now();
  const input = toClassifierInput(chunk);
  // Render once: identical string is sent to the model and persisted in the
  // verdict event for post-hoc debugging.
  const renderedUserPrompt = renderClassifierUserPayload(input, prompt.userPrompt);

  let verdict: ChunkClassifierVerdict;
  try {
    verdict = await classifier.classify(input, prompt);
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
          rendered_user_prompt: renderedUserPrompt,
        },
        durationMs
      );
    } catch {
      // A broken event logger must not poison the post-commit phase.
    }
    return [];
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
        rendered_user_prompt: renderedUserPrompt,
      },
      durationMs
    );
  } catch {
    // A broken event logger must not poison the post-commit phase.
  }

  if (allNull) {
    getRequestLogger().warn(`Classifier returned all-null verdict for chunk ${chunk.id}`);
    return [];
  }

  // Build warning findings for every field whose score falls below the threshold.
  const findings: LinterFinding[] = [];
  for (const field of VERDICT_FIELDS) {
    const value = verdict[field];
    if (value === null) continue;
    if (value.score > TIER2_LOW_SCORE_THRESHOLD) continue;
    findings.push({
      chunkId: chunk.id,
      rule: `classifier.${PERSISTED_TIER2_FIELD_NAMES[field as VerdictFieldName]}`,
      severity: 'warning',
      category: 'tier2',
      detail: value.rationale,
    });
  }
  return findings;
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
