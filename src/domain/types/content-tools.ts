import { z } from 'zod';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

export const GetChunkContentInputShape = {
  chunk_id: z
    .string()
    .min(1, 'Chunk ID cannot be empty')
    .describe('ID of the chunk to retrieve content for'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const GetChunkContentInputSchema = z
  .object(GetChunkContentInputShape)
  .transform(toCamelCaseKeys);

export const GetTopicSummaryInputShape = {
  topic_id: z
    .string()
    .min(1, 'Topic ID cannot be empty')
    .describe('ID of the topic to retrieve summary for'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const GetTopicSummaryInputSchema = z
  .object(GetTopicSummaryInputShape)
  .transform(toCamelCaseKeys);

export const ListItemsWithContentInputShape = {
  subject_filter: z.string().optional().describe('Filter by subject/category'),
  due_only: z.boolean().optional().describe('Only return items due for review'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Maximum number of items to return (1-100)'),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe('Number of items to skip for pagination'),
  include_content: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Whether to include content fields (content, contentVersion, contentUpdatedAt) in the response'
    ),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const ListItemsWithContentInputSchema = z
  .object(ListItemsWithContentInputShape)
  .transform(toCamelCaseKeys);
