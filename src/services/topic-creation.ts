import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, withTx } from '../infrastructure/db/operations.js';
import {
  learningChunks,
  learningTopics,
  type LearningChunkRow,
  type LearningTopicRow,
} from '../infrastructure/db/schema.js';
import type {
  TopicCreationInput,
  TopicCreationResult,
  TopicWithChunks,
} from '../domain/types/topic-creation.js';
import { VALIDATION_CONSTANTS } from '../shared/constants/validation.js';
import { extractErrorMessage } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

/**
 * Topic Creation Service
 * Handles creation of topics with multiple chunks in atomic transactions
 */
export class TopicCreationService {
  /**
   * Create a topic with multiple chunks in a single atomic transaction
   */
  private toTopicWithChunks(
    topic: LearningTopicRow,
    chunks: LearningChunkRow[],
    description?: string
  ): TopicWithChunks {
    return {
      topicId: topic.id,
      topicTitle: topic.title,
      topicDescription: description || '',
      subject: topic.subject,
      chunks: chunks.map((chunk, index) => ({
        id: chunk.id,
        title: chunk.title,
        content: chunk.content || '',
        difficulty: chunk.difficulty,
        prerequisites: chunk.prerequisitesJson ?? [],
        estimatedDuration: chunk.estimatedDuration,
        order: index + 1,
        tags: chunk.tagsJson ?? [],
        chunkType: chunk.chunkType as 'new' | 'review' | 'remediation',
      })),
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      topicSummary: topic.summary || undefined,
    };
  }

  async createTopicWithChunks(input: TopicCreationInput): Promise<TopicCreationResult> {
    try {
      const validationResult = this.validateInput(input);
      if (!validationResult.valid) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: validationResult.error ?? 'Invalid topic input',
            retryable: false,
          },
        };
      }

      const result = await withTx(async tx => {
        const topicId = crypto.randomUUID();
        const now = Date.now();

        const topic: LearningTopicRow = {
          id: topicId,
          title: input.topicTitle,
          subject: input.subject,
          summary: input.topicSummary || null,
          summaryVersion: input.topicSummary ? 1 : null,
          summaryUpdatedAt: input.topicSummary ? now : null,
          createdAt: now,
          updatedAt: now,
        };
        await tx.insert(learningTopics).values(topic);

        const createdChunks: LearningChunkRow[] = [];
        for (const chunkDef of input.chunks) {
          const chunk: LearningChunkRow = {
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
            createdAt: now,
            updatedAt: now,
          };
          await tx.insert(learningChunks).values(chunk);
          createdChunks.push(chunk);
        }

        return { topic, chunks: createdChunks };
      });

      return {
        success: true,
        topic: this.toTopicWithChunks(result.topic, result.chunks, input.topicDescription),
      };
    } catch (error) {
      logger.error('Topic creation failed:', error);
      return {
        success: false,
        error: {
          type: 'database',
          message: extractErrorMessage(error),
          retryable: true,
        },
      };
    }
  }

  /**
   * Get topic with its chunks
   */
  async getTopicWithChunks(topicId: string): Promise<TopicWithChunks | null> {
    try {
      const db = getSql();

      // Get topic
      const [topic] = await db.select().from(learningTopics).where(eq(learningTopics.id, topicId));

      if (!topic) {
        return null;
      }

      // Get chunks
      const chunks = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.topicId, topicId));

      return {
        topicId: topic.id,
        topicTitle: topic.title,
        topicDescription: '', // Not stored in current schema
        subject: topic.subject,
        chunks: chunks.map(chunk => ({
          id: chunk.id,
          title: chunk.title,
          content: chunk.content || '', // Content persisted in schema, but may be null for legacy chunks
          difficulty: chunk.difficulty,
          prerequisites: chunk.prerequisitesJson ?? [],
          estimatedDuration: chunk.estimatedDuration,
          order: 0, // Order inferred from creation sequence or array index
          tags: chunk.tagsJson ?? [],
          chunkType: chunk.chunkType as 'new' | 'review' | 'remediation',
        })),
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      };
    } catch (error) {
      logger.error('Failed to get topic with chunks:', error);
      return null;
    }
  }

  /**
   * Validate input for topic creation
   */
  private validateInput(input: TopicCreationInput): { valid: boolean; error?: string } {
    // Validate topic title
    if (!input.topicTitle || input.topicTitle.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
      return { valid: false, error: 'Invalid topic title' };
    }

    // Validate subject
    if (!input.subject || input.subject.length > VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH) {
      return { valid: false, error: 'Invalid subject' };
    }

    // Validate chunks
    if (!input.chunks || input.chunks.length === 0) {
      return { valid: false, error: 'At least one chunk is required' };
    }

    if (input.chunks.length > 20) {
      return { valid: false, error: 'Maximum 20 chunks per topic' };
    }

    // Validate each chunk
    for (const chunk of input.chunks) {
      if (!chunk.title || chunk.title.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
        return { valid: false, error: 'Invalid chunk title' };
      }

      if (
        chunk.difficulty < VALIDATION_CONSTANTS.MIN_DIFFICULTY ||
        chunk.difficulty > VALIDATION_CONSTANTS.MAX_DIFFICULTY
      ) {
        return { valid: false, error: 'Invalid chunk difficulty' };
      }

      if (chunk.estimatedDuration < 1 || chunk.estimatedDuration > 120) {
        return { valid: false, error: 'Invalid chunk duration' };
      }
    }

    return { valid: true };
  }
}

// Export singleton instance
export const topicCreationService = new TopicCreationService();
