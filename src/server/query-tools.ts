import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listChunksAsLearningItems, batchFetchChunksMinimal } from '../services/chunk-queries.js';
import { batchFetchTopicsMinimal } from '../services/topics.js';
import {
  ListLearningItemsInputSchema,
  ListLearningItemsInputShape,
  type ListLearningItemsInput,
  BatchFetchTopicsMinimalInputSchema,
  BatchFetchTopicsMinimalInputShape,
  type BatchFetchTopicsMinimalInput,
  BatchFetchChunksMinimalInputSchema,
  BatchFetchChunksMinimalInputShape,
  type BatchFetchChunksMinimalInput,
} from '../domain/types/persistence-tools.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerQueryTools(server: McpServer): void {
  server.registerTool(
    'list_learning_items',
    {
      title: 'List Learning Items',
      description:
        'Fetch learning items from the database via services layer. For single-call convenience, use what_to_learn_today with fetchFromDatabase: true instead, which automatically fetches and generates recommendations in one call.',
      inputSchema: ListLearningItemsInputShape,
    },
    async (rawInput: unknown) => {
      const { subjectFilter, dueOnly, limit }: ListLearningItemsInput =
        ListLearningItemsInputSchema.parse(rawInput);
      try {
        const items = await listChunksAsLearningItems({ subject: subjectFilter, dueOnly, limit });
        return toolJson(items);
      } catch (error) {
        const msg = extractErrorMessage(error);
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
      const { subjectFilter, limit }: BatchFetchTopicsMinimalInput =
        BatchFetchTopicsMinimalInputSchema.parse(rawInput);
      try {
        const topics = await batchFetchTopicsMinimal({ subject: subjectFilter, limit });
        return toolJson({
          success: true,
          topics,
          count: topics.length,
          message: `Retrieved ${topics.length} topic${topics.length === 1 ? '' : 's'}`,
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
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
        'create_session({ mode: "retrieval" or "review", chunkIds: [...] }) before teaching.',
      inputSchema: BatchFetchChunksMinimalInputShape,
    },
    async (rawInput: unknown) => {
      const { topicId, subjectFilter, dueOnly, limit }: BatchFetchChunksMinimalInput =
        BatchFetchChunksMinimalInputSchema.parse(rawInput);
      try {
        const chunks = await batchFetchChunksMinimal({
          topicId,
          subject: subjectFilter,
          dueOnly,
          limit,
        });
        const chunkIds = chunks.map((c: { id: string }) => c.id);
        return toolJson({
          success: true,
          chunks,
          count: chunks.length,
          message: `Retrieved ${chunks.length} chunk${chunks.length === 1 ? '' : 's'}`,
          // Enforcement hint for recall/review workflows
          workflowHint:
            chunks.length > 0
              ? {
                  action: 'REQUIRED_FOR_RECALL',
                  instruction:
                    'For recall/review/retrieval practice: You MUST call create_session with mode "retrieval" or "review" ' +
                    'and include these chunk IDs before teaching. This loads historical feedback.',
                  chunkIds,
                  nextStep: `create_session({ mode: "retrieval", chunkIds: ${JSON.stringify(chunkIds)} })`,
                }
              : undefined,
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to fetch chunks: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
