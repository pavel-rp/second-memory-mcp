import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  GetChunkContentInputSchema,
  GetChunkContentInputShape,
  GetTopicSummaryInputSchema,
  GetTopicSummaryInputShape,
  ListItemsWithContentInputSchema,
  ListItemsWithContentInputShape,
} from '../domain/types/content-tools.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { toIsoTimestamp } from '../shared/date-helpers.js';
import { withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

export function registerContentTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'get_chunk_content',
    {
      title: 'Get Chunk Content',
      description:
        'Retrieve the content of a specific learning chunk by ID. ' +
        'WARNING: For recall/review/retrieval practice, do NOT use this tool directly. ' +
        'First create a session with create_session(mode: "retrieval" or "review", chunkIds: [...]) ' +
        'to load historical feedback about learner difficulties. Only use this tool for ' +
        'content inspection or scaffolding new material.',
      inputSchema: GetChunkContentInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('get_chunk_content', async () => {
        const input = GetChunkContentInputSchema.parse(rawInput);

        try {
          const chunkContent = await ctx.getChunkContent(input.chunkId);

          if (!chunkContent) {
            return toolError(`No chunk found with ID: ${input.chunkId}`, {
              type: 'not_found',
              message: 'Chunk not found',
            });
          }

          return toolData(
            toSnakeCase({
              chunkId: input.chunkId,
              content: chunkContent.content,
              contentVersion: chunkContent.contentVersion,
              contentUpdatedAt: chunkContent.contentUpdatedAt
                ? toIsoTimestamp(chunkContent.contentUpdatedAt)
                : undefined,
              knowledgeType: chunkContent.knowledgeType,
              message: `Successfully retrieved content for chunk: ${input.chunkId}`,
              sessionReminder:
                'If conducting recall/review: Ensure you have created a session first ' +
                'to access historical feedback about learner difficulties.',
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to retrieve chunk content: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'get_topic_summary',
    {
      title: 'Get Topic Summary',
      description:
        'Retrieve the summary content of a specific learning topic by ID. ' +
        'WARNING: For recall/review/retrieval practice, do NOT use this tool directly. ' +
        "First use batch_fetch_chunks_minimal to get the topic's chunk IDs, then create a session " +
        'with create_session(mode: "retrieval" or "review", chunkIds: [...]) to load historical feedback.',
      inputSchema: GetTopicSummaryInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('get_topic_summary', async () => {
        const input = GetTopicSummaryInputSchema.parse(rawInput);

        try {
          const topicResult = await ctx.getTopicSummary(input.topicId);

          if (!topicResult) {
            return toolError(`No topic found with ID: ${input.topicId}`, {
              type: 'not_found',
              message: 'Topic not found',
            });
          }

          return toolData(
            toSnakeCase({
              topicId: input.topicId,
              title: topicResult.title,
              subject: topicResult.subject,
              summary: topicResult.summary,
              summaryVersion: topicResult.summaryVersion,
              dependencyGraphType: topicResult.dependencyGraphType,
              summaryUpdatedAt: topicResult.summaryUpdatedAt
                ? toIsoTimestamp(topicResult.summaryUpdatedAt)
                : null,
              createdAt: toIsoTimestamp(topicResult.createdAt),
              updatedAt: toIsoTimestamp(topicResult.updatedAt),
              message: `Successfully retrieved topic summary: ${topicResult.title}`,
              sessionReminder:
                'If conducting recall/review: Use batch_fetch_chunks_minimal(topic_id) to get chunk IDs, ' +
                'then create_session(mode: "retrieval", chunk_ids: [...]) to load historical feedback.',
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to retrieve topic summary: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'list_items_with_content',
    {
      title: 'List Learning Items with Content',
      description:
        'Retrieve learning items with their content. Supports filtering by subject and due status. Returns paginated results with content fields when include_content is true.',
      inputSchema: ListItemsWithContentInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('list_items_with_content', async () => {
        const input = ListItemsWithContentInputSchema.parse(rawInput);
        const { subjectFilter, dueOnly, limit, offset, includeContent } = input;

        const resolvedOffset = offset ?? 0;
        const resolvedLimit = limit ?? 100;

        try {
          const result = await ctx.listChunksWithContent({
            subjectFilter,
            dueOnly,
            includeContent,
            limit: resolvedLimit,
            offset: resolvedOffset,
          });

          return toolData(
            toSnakeCase({
              items: result.items,
              count: result.items.length,
              pagination: result.pagination,
              contentIncluded: includeContent,
              filter: {
                subject: subjectFilter ?? null,
                dueOnly: dueOnly ?? false,
                limit: resolvedLimit,
                offset: resolvedOffset,
              },
              message: `Successfully retrieved ${result.items.length} learning items${
                includeContent ? ' with content' : ''
              }`,
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to retrieve learning items: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );
}
