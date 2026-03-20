import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../../shared/constants/validation.js';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

export const ListLearningItemsInputShape = {
  subject_filter: z.string().optional().describe('Optional subject filter for learning items'),
  due_only: z.boolean().optional().describe('Return only items due for review'),
  limit: z.number().int().optional().describe('Maximum number of learning items to return'),
  is_leech: z
    .boolean()
    .optional()
    .describe('Filter by leech status: true for leeches only, false to exclude leeches'),
} as const;

export const ListLearningItemsInputSchema = z
  .object(ListLearningItemsInputShape)
  .transform(toCamelCaseKeys);

const TopicChunkShape = {
  id: z.string().min(1, 'Chunk ID cannot be empty').describe('Chunk identifier'),
  title: z
    .string()
    .min(1, 'Chunk title cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
      `Chunk title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
    )
    .describe('Title for the learning chunk'),
  content: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, 'Chunk content cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_CONTENT_SIZE,
      `Chunk content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`
    )
    .describe('Detailed learning content for the chunk'),
  difficulty: z
    .number()
    .int('Difficulty must be an integer')
    .min(
      VALIDATION_CONSTANTS.MIN_DIFFICULTY,
      `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
    )
    .max(
      VALIDATION_CONSTANTS.MAX_DIFFICULTY,
      `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
    )
    .describe('Difficulty rating from 1-10'),
  prerequisites: z
    .array(z.string())
    .default([])
    .describe('Chunk identifiers that should be completed beforehand'),
  estimated_duration: z
    .number()
    .int('Estimated duration must be an integer')
    .min(1, 'Estimated duration must be at least 1 minute')
    .max(120, 'Estimated duration cannot exceed 120 minutes')
    .describe('Estimated time to study the chunk in minutes'),
  order: z
    .number()
    .int()
    .min(1, 'Order must be at least 1')
    .describe('Sequence order for the chunk'),
  tags: z.array(z.string()).default([]).describe('Tags for the chunk'),
  chunk_type: z
    .enum(['new', 'review', 'remediation'], {
      errorMap: () => ({
        message: 'Chunk type must be one of: new, review, remediation',
      }),
    })
    .default('new')
    .describe('Chunk classification'),
  content_status: z
    .enum(['draft', 'final'], {
      errorMap: () => ({
        message: 'Content status must be one of: draft, final',
      }),
    })
    .optional()
    .default('final')
    .describe(
      "Content readiness: 'draft' for placeholder content, 'final' for teaching-ready content"
    ),
} as const;

const TopicUserPreferencesShape = {
  preferred_difficulty: z
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.MIN_DIFFICULTY)
    .max(VALIDATION_CONSTANTS.MAX_DIFFICULTY)
    .optional()
    .describe('Preferred difficulty level'),
  learning_style: z
    .enum(['visual', 'auditory', 'kinesthetic', 'reading'])
    .optional()
    .describe('Preferred learning style'),
  max_chunk_duration: z
    .number()
    .int()
    .min(1)
    .max(120)
    .optional()
    .describe('Maximum chunk duration in minutes'),
  include_prerequisites: z.boolean().optional().describe('Whether to include prerequisite content'),
} as const;

export const CreateTopicWithChunksInputShape = {
  topic_title: z
    .string()
    .min(1, 'Topic title cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
      `Topic title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
    )
    .describe('Title of the learning topic'),
  topic_description: z
    .string()
    .max(1000, 'Topic description cannot exceed 1000 characters')
    .optional()
    .describe('Description of the learning topic'),
  subject: z
    .string()
    .min(1, 'Subject cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH,
      `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`
    )
    .describe('Subject or category for the topic'),
  topic_summary: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, 'Topic summary cannot be empty if provided')
    .max(
      VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE,
      `Topic summary cannot exceed ${VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE} characters`
    )
    .optional()
    .describe('Summary content for the topic'),
  chunks: z
    .array(z.object(TopicChunkShape))
    .min(1, 'At least one chunk is required')
    .max(20, 'Maximum 20 chunks per topic')
    .describe('Array of chunk definitions'),
  user_preferences: z
    .object(TopicUserPreferencesShape)
    .describe('Optional user preference overrides')
    .optional(),
} as const;

export const CreateTopicWithChunksInputSchema = z
  .object(CreateTopicWithChunksInputShape)
  .transform(toCamelCaseKeys);

export const CreateLearningItemInputShape = {
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
      `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
    )
    .describe('Title of the learning item'),
  content: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, 'Content cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_CONTENT_SIZE,
      `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`
    )
    .describe('Content or description of the learning item'),
  subject: z
    .string()
    .min(1, 'Subject cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH,
      `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`
    )
    .describe('Subject or category of the learning item'),
  difficulty: z
    .number()
    .int('Difficulty must be an integer')
    .min(
      VALIDATION_CONSTANTS.MIN_DIFFICULTY,
      `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
    )
    .max(
      VALIDATION_CONSTANTS.MAX_DIFFICULTY,
      `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
    )
    .describe('Difficulty level from 1-10'),
  estimated_duration: z
    .number()
    .int('Estimated duration must be an integer')
    .min(1, 'Estimated duration must be at least 1 minute')
    .max(120, 'Estimated duration cannot exceed 120 minutes')
    .describe('Estimated study duration in minutes'),
  prerequisites: z.array(z.string()).default([]).describe('Prerequisites for this learning item'),
  tags: z.array(z.string()).default([]).describe('Tags for categorization'),
  topic_title: z.string().optional().describe('Optional topic title; creates a topic if missing'),
  content_status: z
    .enum(['draft', 'final'], {
      errorMap: () => ({
        message: 'Content status must be one of: draft, final',
      }),
    })
    .optional()
    .default('final')
    .describe(
      "Content readiness: 'draft' for placeholder content, 'final' for teaching-ready content"
    ),
} as const;

export const CreateLearningItemInputSchema = z
  .object(CreateLearningItemInputShape)
  .transform(toCamelCaseKeys);

export const UpdateChunkContentInputShape = {
  chunk_id: z.string().min(1, 'Chunk ID cannot be empty').describe('ID of the chunk to update'),
  content: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, 'Content cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_CONTENT_SIZE,
      `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`
    )
    .describe('New content for the chunk'),
  reset_progress: z.boolean().optional().describe('Whether to reset spaced repetition progress'),
} as const;

export const UpdateChunkContentInputSchema = z
  .object(UpdateChunkContentInputShape)
  .transform(toCamelCaseKeys);

export const UpdateChunkMetadataInputShape = {
  chunk_id: z.string().min(1, 'Chunk ID cannot be empty').describe('ID of the chunk to update'),
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
      `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
    )
    .optional()
    .describe('New title for the chunk'),
  difficulty: z
    .number()
    .int('Difficulty must be an integer')
    .min(
      VALIDATION_CONSTANTS.MIN_DIFFICULTY,
      `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
    )
    .max(
      VALIDATION_CONSTANTS.MAX_DIFFICULTY,
      `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
    )
    .optional()
    .describe('Updated difficulty level'),
  prerequisites: z.array(z.string()).optional().describe('Updated prerequisites array'),
  tags: z.array(z.string()).optional().describe('Updated tag list'),
  estimated_duration: z
    .number()
    .int('Estimated duration must be an integer')
    .min(1, 'Estimated duration must be at least 1 minute')
    .max(120, 'Estimated duration cannot exceed 120 minutes')
    .optional()
    .describe('Updated estimated study duration'),
} as const;

export const UpdateChunkMetadataInputSchema = z
  .object(UpdateChunkMetadataInputShape)
  .transform(toCamelCaseKeys);

export const UpdateChunkInputShape = {
  chunk_id: z.string().min(1, 'Chunk ID cannot be empty').describe('ID of the chunk to update'),
  content: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, 'Content cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_CONTENT_SIZE,
      `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`
    )
    .optional()
    .describe('New content for the chunk'),
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
      `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
    )
    .optional()
    .describe('New title for the chunk'),
  difficulty: z
    .number()
    .int('Difficulty must be an integer')
    .min(
      VALIDATION_CONSTANTS.MIN_DIFFICULTY,
      `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
    )
    .max(
      VALIDATION_CONSTANTS.MAX_DIFFICULTY,
      `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
    )
    .optional()
    .describe('Updated difficulty level'),
  prerequisites: z.array(z.string()).optional().describe('Updated prerequisites array'),
  tags: z.array(z.string()).optional().describe('Updated tags array'),
  estimated_duration: z
    .number()
    .int('Estimated duration must be an integer')
    .min(1, 'Estimated duration must be at least 1 minute')
    .max(120, 'Estimated duration cannot exceed 120 minutes')
    .optional()
    .describe('Updated estimated study duration'),
  force_reset: z.boolean().optional().describe('Force reset of spaced repetition progress'),
} as const;

export const UpdateChunkInputSchema = z.object(UpdateChunkInputShape).transform(toCamelCaseKeys);

export const DeleteChunkInputShape = {
  chunk_id: z.string().min(1, 'Chunk ID cannot be empty').describe('ID of the chunk to delete'),
} as const;

export const DeleteChunkInputSchema = z.object(DeleteChunkInputShape).transform(toCamelCaseKeys);

export const UpdateTopicInputShape = {
  topic_id: z.string().min(1, 'Topic ID cannot be empty').describe('ID of the topic to update'),
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
      `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
    )
    .optional()
    .describe('New title for the topic'),
  subject: z
    .string()
    .min(1, 'Subject cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH,
      `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`
    )
    .optional()
    .describe('New subject for the topic'),
} as const;

export const UpdateTopicInputSchema = z.object(UpdateTopicInputShape).transform(toCamelCaseKeys);

export const UpdateTopicSummaryInputShape = {
  topic_id: z.string().min(1, 'Topic ID cannot be empty').describe('ID of the topic to update'),
  summary: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, 'Summary cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE,
      `Summary cannot exceed ${VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE} characters`
    )
    .describe('New summary content for the topic'),
} as const;

export const UpdateTopicSummaryInputSchema = z
  .object(UpdateTopicSummaryInputShape)
  .transform(toCamelCaseKeys);

export const BatchFetchTopicsMinimalInputShape = {
  subject_filter: z.string().optional().describe('Filter topics by subject'),
  limit: z.number().int().positive().optional().describe('Maximum number of topics to return'),
} as const;

export const BatchFetchTopicsMinimalInputSchema = z
  .object(BatchFetchTopicsMinimalInputShape)
  .transform(toCamelCaseKeys);

export const BatchFetchChunksMinimalInputShape = {
  topic_id: z.string().optional().describe('Filter chunks by topic ID'),
  subject_filter: z.string().optional().describe('Filter chunks by subject'),
  due_only: z.boolean().optional().describe('Return only chunks due for review'),
  limit: z.number().int().positive().optional().describe('Maximum number of chunks to return'),
  is_leech: z
    .boolean()
    .optional()
    .describe('Filter by leech status: true for leeches only, false to exclude leeches'),
} as const;

export const BatchFetchChunksMinimalInputSchema = z
  .object(BatchFetchChunksMinimalInputShape)
  .transform(toCamelCaseKeys);
