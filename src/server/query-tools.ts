import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  ListLearningItemsInputSchema,
  ListLearningItemsInputShape,
  BatchFetchTopicsMinimalInputSchema,
  BatchFetchTopicsMinimalInputShape,
  BatchFetchChunksMinimalInputSchema,
  BatchFetchChunksMinimalInputShape,
} from '../domain/types/persistence-tools.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { ZodError } from 'zod';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerQueryTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_learning_items',
    {
      title: 'List Learning Items',
      description:
        'Fetch learning items from the database via services layer. For topic-level recommendations ranked by urgency, use what_to_learn_today instead.',
      inputSchema: ListLearningItemsInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { subjectFilter, dueOnly, limit, isLeech } =
          ListLearningItemsInputSchema.parse(rawInput);
        const items = await ctx.listChunksAsLearningItems({
          subjectFilter,
          dueOnly,
          limit,
          isLeech,
        });
        return toolJson(toSnakeCase(items));
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          return toolError(`Failed to list learning items: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        return toolError(`Failed to list learning items: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'batch_fetch_topics_minimal',
    {
      title: 'Batch Fetch Topics (Minimal Metadata)',
      description:
        'Fetch topics with minimal metadata (IDs, title, subject, timestamps only). Efficient for listing and selection workflows.',
      inputSchema: BatchFetchTopicsMinimalInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { subjectFilter, limit } = BatchFetchTopicsMinimalInputSchema.parse(rawInput);
        const topics = await ctx.batchFetchTopicsMinimal({ subject: subjectFilter, limit });
        return toolJson(
          toSnakeCase({
            success: true,
            topics,
            count: topics.length,
            message: `Retrieved ${topics.length} topic${topics.length === 1 ? '' : 's'}`,
          })
        );
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          return toolError(`Failed to fetch topics: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        return toolError(`Failed to fetch topics: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'batch_fetch_chunks_minimal',
    {
      title: 'Batch Fetch Chunks (Minimal Metadata)',
      description:
        'Fetch chunks with minimal metadata (IDs, title, subject, difficulty, duration, type, timestamps only). ' +
        'Efficient for listing and selection workflows. ' +
        'IMPORTANT: For recall/review practice, after fetching chunk IDs, you MUST create a session with ' +
        'create_session({ mode: "retrieval" or "review", chunk_ids: [...] }) before teaching.',
      inputSchema: BatchFetchChunksMinimalInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const { topicId, subjectFilter, dueOnly, limit, isLeech } =
          BatchFetchChunksMinimalInputSchema.parse(rawInput);
        const chunks = await ctx.batchFetchChunksMinimal({
          topicId,
          subject: subjectFilter,
          dueOnly,
          limit,
          isLeech,
        });
        const chunkIds = chunks.map((c: { id: string }) => c.id);
        return toolJson(
          toSnakeCase({
            success: true,
            chunks,
            count: chunks.length,
            message: `Retrieved ${chunks.length} chunk${chunks.length === 1 ? '' : 's'}`,
            workflowHint:
              chunks.length > 0
                ? {
                    action: 'REQUIRED_FOR_RECALL',
                    instruction:
                      'For recall/review/retrieval practice: You MUST call create_session with mode "retrieval" or "review" ' +
                      'and include these chunk IDs before teaching. This loads historical feedback.',
                    chunkIds,
                    nextStep: `create_session({ mode: "retrieval", chunk_ids: ${JSON.stringify(chunkIds)} })`,
                  }
                : undefined,
          })
        );
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          return toolError(`Failed to fetch chunks: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        return toolError(`Failed to fetch chunks: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
