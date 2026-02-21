import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
} from '../types/content-tools.js';
import {
  getChunkContent,
  listChunksWithContent,
  type ListChunksWithContentFilter,
} from '../services/chunks.js';
import { getTopicSummaryById } from '../services/topics.js';

export function registerContentTools(server: McpServer): void {
  // Tool for retrieving individual chunk content
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
      const { chunkId } = input;

      try {
        const chunkContent = await getChunkContent(chunkId);

        if (!chunkContent) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'Chunk not found',
                  message: `No chunk found with ID: ${chunkId}`,
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                chunkId,
                content: chunkContent.content,
                contentVersion: chunkContent.contentVersion,
                contentUpdatedAt: chunkContent.contentUpdatedAt,
                message: `Successfully retrieved content for chunk: ${chunkId}`,
                sessionReminder:
                  'If conducting recall/review: Ensure you have created a session first ' +
                  'to access historical feedback about learner difficulties.',
              }),
            },
          ],
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'retrieval_error',
                message: `Failed to retrieve chunk content: ${errorMsg}`,
              }),
            },
          ],
        };
      }
    }
  );

  // Tool for retrieving topic summary
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
      const { topicId } = input;

      try {
        const topicResult = await getTopicSummaryById(topicId);

        if (!topicResult) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'Topic not found',
                  message: `No topic found with ID: ${topicId}`,
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                topicId,
                title: topicResult.title,
                subject: topicResult.subject,
                summary: topicResult.summary,
                summaryVersion: topicResult.summaryVersion,
                summaryUpdatedAt: topicResult.summaryUpdatedAt,
                createdAt: topicResult.createdAt,
                updatedAt: topicResult.updatedAt,
                message: `Successfully retrieved topic summary: ${topicResult.title}`,
                sessionReminder:
                  'If conducting recall/review: Use batch_fetch_chunks_minimal(topicId) to get chunk IDs, ' +
                  'then create_session(mode: "retrieval", chunkIds: [...]) to load historical feedback.',
              }),
            },
          ],
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'retrieval_error',
                message: `Failed to retrieve topic summary: ${errorMsg}`,
              }),
            },
          ],
        };
      }
    }
  );

  // Tool for batch content retrieval
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
      const { subjectFilter, dueOnly, limit, offset, includeContent } = input;

      const resolvedOffset = offset ?? 0;
      const resolvedLimit = limit ?? 100;

      try {
        const filter: ListChunksWithContentFilter = {
          subject: subjectFilter,
          dueOnly,
          limit: resolvedLimit,
          offset: resolvedOffset,
          includeContent,
        };

        const result = await listChunksWithContent(filter);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
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
              }),
            },
          ],
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                items: [],
                count: 0,
                pagination: {
                  total: 0,
                  limit: resolvedLimit,
                  offset: resolvedOffset,
                  hasMore: false,
                },
                contentIncluded: includeContent,
                filter: {
                  subject: subjectFilter ?? null,
                  dueOnly: dueOnly ?? false,
                  limit: resolvedLimit,
                  offset: resolvedOffset,
                },
                message: 'No learning items available at this time.',
                warning: `Failed to retrieve learning items: ${errorMsg}`,
              }),
            },
          ],
        };
      }
    }
  );
}
