import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, withTx } from '../db/operations.js';
import {
  learningChunks,
  learningTopics,
  type LearningChunkRow,
  type LearningTopicRow,
} from '../db/schema.js';
import { encodeJsonArray } from '../db/operations.js';
import type {
  TopicCreationInput,
  TopicCreationResult,
  TopicWithChunks,
} from '../types/topic-creation.js';
import { VALIDATION_CONSTANTS } from '../constants/validation.js';
import { logger } from '../utils/logger.js';

/**
 * Safely parse JSON array with error handling
 */
function parseJsonArraySafely(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.warn('Failed to parse JSON array:', error);
    return [];
  }
}

/**
 * Topic Creation Service
 * Handles creation of topics with multiple chunks in atomic transactions
 */
export class TopicCreationService {
  /**
   * Create a topic with multiple chunks in a single atomic transaction
   */
  async createTopicWithChunks(input: TopicCreationInput): Promise<TopicCreationResult> {
    try {
      // Validate input
      const validationResult = this.validateInput(input);
      if (!validationResult.valid) {
        const errorMessage = validationResult.error ?? 'Invalid topic input';
        return {
          success: false,
          error: {
            type: 'validation',
            message: errorMessage,
            retryable: false,
          },
        };
      }

      // Create topic and chunks in transaction
      const result = withTx(tx => {
        // Create topic
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

        tx.insert(learningTopics).values(topic).run();

        // Create chunks
        const createdChunks: LearningChunkRow[] = [];
        for (const chunkDef of input.chunks) {
          const chunk: LearningChunkRow = {
            id: chunkDef.id,
            topicId: topicId,
            title: chunkDef.title,
            subject: input.subject,
            difficulty: chunkDef.difficulty,
            nextReviewAt: now, // Review immediately for new chunks
            easeFactor: 2.5, // Initial ease factor
            repetitions: 0,
            lastReviewedAt: null,
            estimatedDuration: chunkDef.estimatedDuration,
            chunkType: chunkDef.chunkType,
            prerequisitesJson: encodeJsonArray(chunkDef.prerequisites),
            tagsJson: encodeJsonArray(chunkDef.tags),
            content: chunkDef.content || null,
            contentVersion: chunkDef.content ? 1 : null,
            contentUpdatedAt: chunkDef.content ? now : null,
            createdAt: now,
            updatedAt: now,
          };

          tx.insert(learningChunks).values(chunk).run();
          createdChunks.push(chunk);
        }

        return {
          topic,
          chunks: createdChunks,
        };
      });

      // Convert to response format
      const topicWithChunks: TopicWithChunks = {
        topicId: result.topic.id,
        topicTitle: result.topic.title,
        topicDescription: input.topicDescription || '',
        subject: result.topic.subject,
        chunks: result.chunks.map((chunk, index) => ({
          id: chunk.id,
          title: chunk.title,
          content: chunk.content || '', // Persist actual content
          difficulty: chunk.difficulty,
          prerequisites: parseJsonArraySafely(chunk.prerequisitesJson),
          estimatedDuration: chunk.estimatedDuration,
          order: index + 1, // Set proper order based on array index
          tags: parseJsonArraySafely(chunk.tagsJson),
          chunkType: chunk.chunkType as 'new' | 'review' | 'remediation',
        })),
        createdAt: result.topic.createdAt,
        updatedAt: result.topic.updatedAt,
        // Include persisted summary content
        topicSummary: result.topic.summary || undefined,
      };

      return {
        success: true,
        topic: topicWithChunks,
      };
    } catch (error) {
      logger.error('Topic creation failed:', error);
      return {
        success: false,
        error: {
          type: 'database',
          message: error instanceof Error ? error.message : 'Unknown database error',
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
      const topic = db.select().from(learningTopics).where(eq(learningTopics.id, topicId)).get();

      if (!topic) {
        return null;
      }

      // Get chunks
      const chunks = db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.topicId, topicId))
        .all();

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
          prerequisites: parseJsonArraySafely(chunk.prerequisitesJson),
          estimatedDuration: chunk.estimatedDuration,
          order: 0, // Order inferred from creation sequence or array index
          tags: parseJsonArraySafely(chunk.tagsJson),
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
  /**
   * Update topic metadata (title only)
   */
  async updateTopic(
    topicId: string,
    updates: { title?: string }
  ): Promise<{
    success: boolean;
    topic?: LearningTopicRow;
    error?: {
      type: 'validation' | 'not_found' | 'database';
      message: string;
      field?: string;
    };
  }> {
    try {
      const db = getSql();

      // Check if topic exists
      const currentTopic = db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, topicId))
        .get();
      if (!currentTopic) {
        return {
          success: false,
          error: {
            type: 'not_found',
            message: `Topic with id "${topicId}" not found`,
          },
        };
      }

      // Validate updates
      if (updates.title !== undefined) {
        if (!updates.title || updates.title.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
          return {
            success: false,
            error: {
              type: 'validation',
              message: `Title must be between 1 and ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`,
              field: 'title',
            },
          };
        }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        updatedAt: Date.now(),
      };

      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }

      // Update topic
      const res = db
        .update(learningTopics)
        .set(updateData)
        .where(eq(learningTopics.id, topicId))
        .run();

      if (res.changes === 0) {
        return {
          success: false,
          error: {
            type: 'database',
            message: 'Failed to update topic',
          },
        };
      }

      // Return updated topic
      const updatedTopic = db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, topicId))
        .get();
      return {
        success: true,
        topic: updatedTopic || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'database',
          message: error instanceof Error ? error.message : 'Unknown database error',
        },
      };
    }
  }

  /**
   * Update topic summary with versioning
   */
  async updateTopicSummary(
    topicId: string,
    summary: string
  ): Promise<{
    success: boolean;
    topic?: LearningTopicRow;
    error?: {
      type: 'validation' | 'not_found' | 'database';
      message: string;
      field?: string;
    };
  }> {
    try {
      const db = getSql();

      // Check if topic exists
      const currentTopic = db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, topicId))
        .get();
      if (!currentTopic) {
        return {
          success: false,
          error: {
            type: 'not_found',
            message: `Topic with id "${topicId}" not found`,
          },
        };
      }

      // Validate summary length
      if (summary.length > VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: `Summary cannot exceed ${VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE} characters`,
            field: 'summary',
          },
        };
      }

      if (summary.length < VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Summary cannot be empty',
            field: 'summary',
          },
        };
      }

      const now = Date.now();
      const newVersion = (currentTopic.summaryVersion || 1) + 1;

      // Update topic with new summary and versioning
      const res = db
        .update(learningTopics)
        .set({
          summary,
          summaryVersion: newVersion,
          summaryUpdatedAt: now,
          updatedAt: now,
        })
        .where(eq(learningTopics.id, topicId))
        .run();

      if (res.changes === 0) {
        return {
          success: false,
          error: {
            type: 'database',
            message: 'Failed to update topic summary',
          },
        };
      }

      // Return updated topic
      const updatedTopic = db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, topicId))
        .get();
      return {
        success: true,
        topic: updatedTopic || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'database',
          message: error instanceof Error ? error.message : 'Unknown database error',
        },
      };
    }
  }

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
