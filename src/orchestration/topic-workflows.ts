import crypto from 'node:crypto';
import type { TopicRepository } from '../ports/topic-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { UnitOfWorkPort } from '../ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../ports/embedding-port.js';
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
import { VALIDATION_CONSTANTS } from '../shared/constants/validation.js';
import { extractErrorMessage } from '../shared/errors.js';
import { getRequestLogger } from '../shared/logger.js';

export type TopicDeps = {
  topics: TopicRepository;
  chunks: ChunkRepository;
  unitOfWork: UnitOfWorkPort;
  embedding?: EmbeddingPort;
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
  const report = canonicalEmptyReport(updatedAtIso);
  if (tier1a.length > 0) report.tier1a = tier1a;
  if (tier1b.length > 0) report.tier1b = tier1b;
  return report;
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
        // `validatorReport` is written by the dedicated `writeValidatorReport`
        // method below (single source of truth) — do not include it in the
        // insert payload to avoid a redundant UPDATE round-trip.
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
          createdAt: chunkCreatedAt,
          updatedAt: now,
        };
        await ports.chunks.create(chunkRow);
        const reportRowCount = await ports.chunks.writeValidatorReport(
          chunkDef.id,
          validatorReport
        );
        if (reportRowCount !== 1) {
          throw new Error(
            `validator_report write affected ${reportRowCount} rows for chunk ${chunkDef.id}`
          );
        }
        // Reflect the persisted state in the in-memory copy returned to callers.
        chunkRow.validatorReport = validatorReport;
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

    return {
      success: true,
      topic: toTopicWithChunks(result.topic, result.chunks, input.topicDescription),
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
