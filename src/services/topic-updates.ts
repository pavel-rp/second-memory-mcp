import { eq } from 'drizzle-orm';
import { getSql } from '../db/operations.js';
import { learningChunks, learningTopics, type LearningTopicRow } from '../db/schema.js';
import { VALIDATION_CONSTANTS } from '../shared/constants/validation.js';
import { extractErrorMessage } from '../shared/errors.js';

export type TopicUpdateResult = {
  success: boolean;
  topic?: LearningTopicRow;
  error?: {
    type: 'validation' | 'not_found' | 'database';
    message: string;
    field?: string;
  };
};

type ValidateAndBuildFields = (
  currentTopic: LearningTopicRow
) => { error: TopicUpdateResult['error'] } | { data: Record<string, unknown> };

/**
 * Shared helper that encapsulates the check-validate-update-refetch-catch
 * pattern used by all topic update operations.
 */
async function updateTopicFields(
  topicId: string,
  validateAndBuild: ValidateAndBuildFields
): Promise<TopicUpdateResult> {
  try {
    const db = getSql();

    // Check if topic exists
    const [currentTopic] = await db
      .select()
      .from(learningTopics)
      .where(eq(learningTopics.id, topicId));
    if (!currentTopic) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Topic with id "${topicId}" not found`,
        },
      };
    }

    // Validate input and build update data
    const result = validateAndBuild(currentTopic);
    if ('error' in result) {
      return { success: false, error: result.error };
    }

    // Execute update
    const res = await db
      .update(learningTopics)
      .set(result.data)
      .where(eq(learningTopics.id, topicId));

    if (res.rowCount === 0) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to update topic',
        },
      };
    }

    // Re-fetch and return updated topic
    const [updatedTopic] = await db
      .select()
      .from(learningTopics)
      .where(eq(learningTopics.id, topicId));
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
 * Update topic metadata (title and subject)
 */
export async function updateTopicMetadata(
  topicId: string,
  updates: { title?: string; subject?: string }
): Promise<TopicUpdateResult> {
  const result = await updateTopicFields(topicId, () => {
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
        return {
          error: {
            type: 'validation',
            message: `Title must be between 1 and ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`,
            field: 'title',
          },
        };
      }
    }

    if (updates.subject !== undefined) {
      if (!updates.subject || updates.subject.length > VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH) {
        return {
          error: {
            type: 'validation',
            message: `Subject must be between 1 and ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`,
            field: 'subject',
          },
        };
      }
    }

    const data: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.title !== undefined) {
      data.title = updates.title;
    }
    if (updates.subject !== undefined) {
      data.subject = updates.subject;
    }
    return { data };
  });

  // Cascade subject change to child chunks
  if (result.success && updates.subject !== undefined) {
    try {
      const db = getSql();
      await db
        .update(learningChunks)
        .set({ subject: updates.subject, updatedAt: Date.now() })
        .where(eq(learningChunks.topicId, topicId));
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'database',
          message: `Topic updated but failed to cascade subject to chunks: ${extractErrorMessage(error)}`,
        },
      };
    }
  }

  return result;
}

/**
 * Update topic summary with versioning
 */
export async function updateTopicSummary(
  topicId: string,
  summary: string
): Promise<TopicUpdateResult> {
  return updateTopicFields(topicId, currentTopic => {
    if (summary.length > VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE) {
      return {
        error: {
          type: 'validation',
          message: `Summary cannot exceed ${VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE} characters`,
          field: 'summary',
        },
      };
    }

    if (summary.length < VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH) {
      return {
        error: {
          type: 'validation',
          message: 'Summary cannot be empty',
          field: 'summary',
        },
      };
    }

    const now = Date.now();
    const newVersion = (currentTopic.summaryVersion || 1) + 1;
    return {
      data: {
        summary,
        summaryVersion: newVersion,
        summaryUpdatedAt: now,
        updatedAt: now,
      },
    };
  });
}
