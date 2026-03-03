import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  GetChunkContentInputSchema,
  GetChunkContentInputShape,
  type GetChunkContentInput,
  GetTopicSummaryInputSchema,
  GetTopicSummaryInputShape,
  type GetTopicSummaryInput,
  ListItemsWithContentInputSchema,
  ListItemsWithContentInputShape,
  type ListItemsWithContentInput,
} from '../domain/types/content-tools.js';
import { extractErrorMessage, toolError, toolOk } from './tool-helpers.js';

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
    async (rawInput: unknown) => {
      const input: GetChunkContentInput = GetChunkContentInputSchema.parse(rawInput);
      const chunkId = input.chunk_id;

      try {
        const chunkContent = await ctx.getChunkContent(chunkId);

        if (!chunkContent) {
          return toolError(`No chunk found with ID: ${chunkId}`, {
            type: 'not_found',
            message: 'Chunk not found',
          });
        }

        return toolOk(`Successfully retrieved content for chunk: ${chunkId}`, {
          chunkId,
          content: chunkContent.content,
          contentVersion: chunkContent.contentVersion,
          contentUpdatedAt: chunkContent.contentUpdatedAt,
          sessionReminder:
            'If conducting recall/review: Ensure you have created a session first ' +
            'to access historical feedback about learner difficulties.',
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to retrieve chunk content: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
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
    async (rawInput: unknown) => {
      const input: GetTopicSummaryInput = GetTopicSummaryInputSchema.parse(rawInput);
      const topicId = input.topic_id;

      try {
        const topicResult = await ctx.getTopicSummary(topicId);

        if (!topicResult) {
          return toolError(`No topic found with ID: ${topicId}`, {
            type: 'database',
            message: 'Topic not found',
          });
        }

        return toolOk(`Successfully retrieved topic summary: ${topicResult.title}`, {
          topicId,
          title: topicResult.title,
          subject: topicResult.subject,
          summary: topicResult.summary,
          summaryVersion: topicResult.summaryVersion,
          summaryUpdatedAt: topicResult.summaryUpdatedAt,
          createdAt: topicResult.createdAt,
          updatedAt: topicResult.updatedAt,
          sessionReminder:
            'If conducting recall/review: Use batch_fetch_chunks_minimal(topicId) to get chunk IDs, ' +
            'then create_session(mode: "retrieval", chunkIds: [...]) to load historical feedback.',
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to retrieve topic summary: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'list_items_with_content',
    {
      title: 'List Learning Items with Content',
      description:
        'Retrieve learning items with their content. Supports filtering by subject and due status. Returns paginated results with content fields when includeContent is true.',
      inputSchema: ListItemsWithContentInputShape,
    },
    async (rawInput: unknown) => {
      const input: ListItemsWithContentInput = ListItemsWithContentInputSchema.parse(rawInput);
      const { subject_filter, due_only, limit, offset, include_content } = input;

      const resolvedOffset = offset ?? 0;
      const resolvedLimit = limit ?? 100;

      try {
        const result = await ctx.listChunksWithContent({
          subjectFilter: subject_filter,
          dueOnly: due_only,
          includeContent: include_content,
          limit: resolvedLimit,
          offset: resolvedOffset,
        });

        return toolOk(
          `Successfully retrieved ${result.items.length} learning items${
            include_content ? ' with content' : ''
          }`,
          {
            items: result.items,
            count: result.items.length,
            pagination: result.pagination,
            contentIncluded: include_content,
            filter: {
              subject: subject_filter ?? null,
              dueOnly: due_only ?? false,
              limit: resolvedLimit,
              offset: resolvedOffset,
            },
          }
        );
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to retrieve learning items: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
