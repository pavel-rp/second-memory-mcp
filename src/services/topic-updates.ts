import { eq } from 'drizzle-orm';
import { getSql } from '../db/operations.js';
import { learningTopics, type LearningTopicRow } from '../db/schema.js';
import { VALIDATION_CONSTANTS } from '../constants/validation.js';
import { extractErrorMessage } from '../utils/errors.js';

export type TopicUpdateResult = {
  success: boolean;
  topic?: LearningTopicRow;
  error?: {
    type: 'validation' | 'not_found' | 'database';
    message: string;
    field?: string;
  };
};

/**
 * Update topic metadata (title only)
 */
export async function updateTopicMetadata(
  topicId: string,
  updates: { title?: string }
): Promise<TopicUpdateResult> {
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
        message: extractErrorMessage(error),
      },
    };
  }
}

/**
 * Update topic summary with versioning
 */
export async function updateTopicSummary(
  topicId: string,
  summary: string
): Promise<TopicUpdateResult> {
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
        message: extractErrorMessage(error),
      },
    };
  }
}
