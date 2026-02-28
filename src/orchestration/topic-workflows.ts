import crypto from 'node:crypto';
import type { TopicRepository } from '../ports/topic-repository.js';
import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { UnitOfWorkPort } from '../ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../ports/embedding-port.js';
import type { LearningChunkRow, LearningTopicRow } from '../infrastructure/db/schema.js';
import type { ServiceError } from '../domain/types/service-result.js';
import { VALIDATION_CONSTANTS } from '../shared/constants/validation.js';
import { extractErrorMessage } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

export type TopicDeps = {
  topics: TopicRepository;
  chunks: ChunkRepository;
  unitOfWork: UnitOfWorkPort;
  embedding?: EmbeddingPort;
};

export type TopicUpdateResult = {
  success: boolean;
  topic?: LearningTopicRow;
  error?: ServiceError;
};

export type TopicWithChunks = {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  topicSummary?: string;
  subject: string;
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
  }>;
  createdAt: number;
  updatedAt: number;
};

export type TopicCreationInput = {
  topicTitle: string;
  subject: string;
  topicDescription?: string;
  topicSummary?: string;
  chunks: Array<{
    id: string;
    title: string;
    content?: string;
    difficulty: number;
    estimatedDuration: number;
    prerequisites?: string[];
    tags?: string[];
    chunkType: string;
  }>;
};

export type TopicCreationResult = {
  success: boolean;
  topic?: TopicWithChunks;
  error?: { type: 'validation' | 'database' | 'generation'; message: string; retryable: boolean };
};

// --- Topic creation ---

function validateTopicCreationInput(
  input: TopicCreationInput
): { valid: true } | { valid: false; error: string } {
  if (!input.topicTitle || input.topicTitle.length > 200)
    return { valid: false, error: 'Invalid topic title' };
  if (!input.subject || input.subject.length > 100)
    return { valid: false, error: 'Invalid subject' };
  if (!input.chunks || input.chunks.length === 0)
    return { valid: false, error: 'At least one chunk is required' };
  if (input.chunks.length > 20) return { valid: false, error: 'Maximum 20 chunks per topic' };
  for (const chunk of input.chunks) {
    if (!chunk.title || chunk.title.length > 200)
      return { valid: false, error: 'Invalid chunk title' };
    if (chunk.difficulty < 1 || chunk.difficulty > 10)
      return { valid: false, error: 'Invalid chunk difficulty' };
    if (chunk.estimatedDuration < 1 || chunk.estimatedDuration > 120)
      return { valid: false, error: 'Invalid chunk duration' };
  }
  return { valid: true };
}

function toTopicWithChunks(
  topic: LearningTopicRow,
  chunks: LearningChunkRow[],
  description?: string
): TopicWithChunks {
  return {
    topicId: topic.id,
    topicTitle: topic.title,
    topicDescription: description || '',
    topicSummary: topic.summary || undefined,
    subject: topic.subject,
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
    })),
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

export async function createTopicWithChunks(
  input: TopicCreationInput,
  deps: TopicDeps
): Promise<TopicCreationResult> {
  const validation = validateTopicCreationInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: { type: 'validation', message: validation.error, retryable: false },
    };
  }

  try {
    const result = await deps.unitOfWork.execute(async ports => {
      const topicId = crypto.randomUUID();
      const now = Date.now();
      const topic: LearningTopicRow = {
        id: topicId,
        title: input.topicTitle,
        subject: input.subject,
        summary: input.topicSummary || null,
        summaryVersion: input.topicSummary ? 1 : null,
        summaryUpdatedAt: input.topicSummary ? now : null,
        summaryEmbedding: null,
        createdAt: now,
        updatedAt: now,
      };
      await ports.topics.create(topic);

      const createdChunks: LearningChunkRow[] = [];
      for (const chunkDef of input.chunks) {
        const chunkRow: LearningChunkRow = {
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
          contentEmbedding: null,
          createdAt: now,
          updatedAt: now,
        };
        await ports.chunks.create(chunkRow);
        createdChunks.push(chunkRow);
      }

      return { topic, chunks: createdChunks };
    });

    // Fire-and-forget embedding generation — failures don't break writes
    if (deps.embedding?.isAvailable()) {
      try {
        await generateTopicEmbeddings(result.topic, result.chunks, deps);
      } catch (err) {
        logger.warn('Embedding generation failed for new topic:', err);
      }
    }

    return {
      success: true,
      topic: toTopicWithChunks(result.topic, result.chunks, input.topicDescription),
    };
  } catch (error) {
    logger.error('Failed to create topic with chunks:', error);
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

    // Embed the new summary if embedding is available
    let summaryEmbedding: number[] | null = null;
    if (deps.embedding?.isAvailable()) {
      try {
        summaryEmbedding = await deps.embedding.embedText(summary);
      } catch (err) {
        logger.warn('Embedding generation failed for topic summary:', err);
      }
    }

    const result = await deps.topics.update(topicId, {
      summary,
      summaryVersion: newVersion,
      summaryUpdatedAt: now,
      summaryEmbedding: summaryEmbedding,
      updatedAt: now,
    });

    if (!result.success) return { success: false, error: result.error };

    const updated = await deps.topics.getById(topicId);
    return { success: true, topic: updated };
  } catch (error) {
    return { success: false, error: { type: 'database', message: extractErrorMessage(error) } };
  }
}

// --- Embedding helpers ---

async function generateTopicEmbeddings(
  topic: LearningTopicRow,
  chunks: LearningChunkRow[],
  deps: TopicDeps
): Promise<void> {
  const embedding = deps.embedding;
  if (!embedding?.isAvailable()) return;

  // Embed topic summary
  if (topic.summary) {
    const summaryVector = await embedding.embedText(topic.summary);
    if (summaryVector) {
      await deps.topics.update(topic.id, {
        summaryEmbedding: summaryVector,
        updatedAt: Date.now(),
      });
    }
  }

  // Batch-embed chunk contents
  const chunksWithContent = chunks.filter(c => c.content);
  if (chunksWithContent.length === 0) return;

  const texts = chunksWithContent.map(c => c.content!);
  const vectors = await embedding.embedTexts(texts);
  const now = Date.now();
  for (let i = 0; i < chunksWithContent.length; i++) {
    if (vectors[i]) {
      await deps.chunks.update(chunksWithContent[i].id, {
        contentEmbedding: vectors[i],
        updatedAt: now,
      });
    }
  }
}
