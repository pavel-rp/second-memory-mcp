import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import crypto from 'node:crypto';
import {
  deleteChunk,
  createChunkWithTopic,
  updateChunkContent,
  updateChunkMetadata,
  updateChunkWithProgressReset,
} from '../services/chunks.js';
import {
  listChunksAsLearningItems,
  mapChunkRowToLearningItem,
  batchFetchChunksMinimal,
} from '../services/chunk-queries.js';
import { batchFetchTopicsMinimal } from '../services/topics.js';
import { topicCreationService } from '../services/topic-creation.js';
import {
  BatchFetchChunksMinimalInputSchema,
  BatchFetchChunksMinimalInputShape,
  type BatchFetchChunksMinimalInput,
  BatchFetchTopicsMinimalInputSchema,
  BatchFetchTopicsMinimalInputShape,
  type BatchFetchTopicsMinimalInput,
  CreateLearningItemInputSchema,
  CreateLearningItemInputShape,
  type CreateLearningItemInput,
  CreateTopicWithChunksInputSchema,
  CreateTopicWithChunksInputShape,
  type CreateTopicWithChunksInput,
  DeleteChunkInputSchema,
  DeleteChunkInputShape,
  type DeleteChunkInput,
  ListLearningItemsInputSchema,
  ListLearningItemsInputShape,
  type ListLearningItemsInput,
  UpdateChunkContentInputSchema,
  UpdateChunkContentInputShape,
  type UpdateChunkContentInput,
  UpdateChunkInputSchema,
  UpdateChunkInputShape,
  type UpdateChunkInput,
  UpdateChunkMetadataInputSchema,
  UpdateChunkMetadataInputShape,
  type UpdateChunkMetadataInput,
  UpdateTopicInputSchema,
  UpdateTopicInputShape,
  type UpdateTopicInput,
  UpdateTopicSummaryInputSchema,
  UpdateTopicSummaryInputShape,
  type UpdateTopicSummaryInput,
} from '../types/persistence-tools.js';
import { extractErrorMessage, toolError, toolJson, toolOk } from './tool-helpers.js';

export function registerPersistenceTools(server: McpServer): void {
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
    'create_topic_with_chunks',
    {
      title: 'Create Topic with Chunks',
      description:
        'Create a new learning topic with multiple scaffolded chunks in a single atomic operation. This is the primary tool for guided learning workflows.',
      inputSchema: CreateTopicWithChunksInputShape,
    },
    async (rawInput: unknown) => {
      const input: CreateTopicWithChunksInput = CreateTopicWithChunksInputSchema.parse(rawInput);
      try {
        const result = await topicCreationService.createTopicWithChunks({
          topicTitle: input.topicTitle,
          topicDescription: input.topicDescription,
          subject: input.subject,
          topicSummary: input.topicSummary,
          chunks: input.chunks,
          userPreferences: input.userPreferences,
        });

        if (result.success && result.topic) {
          return toolJson({
            success: true,
            topic: result.topic,
            message: `Successfully created topic "${input.topicTitle}" with ${result.topic.chunks.length} chunks`,
          });
        } else {
          return toolJson({
            success: false,
            error: result.error,
            message: `Failed to create topic "${input.topicTitle}": ${result.error?.message || 'Unknown error'}`,
          });
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while creating topic "${input.topicTitle}": ${msg}`, {
          type: 'system',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'create_learning_item',
    {
      title: 'Create Learning Item',
      description:
        'Create a single learning item with automatic topic management. Simpler alternative to create_topic_with_chunks for individual items.',
      inputSchema: CreateLearningItemInputShape,
    },
    async (rawInput: unknown) => {
      const input: CreateLearningItemInput = CreateLearningItemInputSchema.parse(rawInput);
      try {
        const now = Date.now();
        const chunkId = crypto.randomUUID();

        const chunk = await createChunkWithTopic({
          id: chunkId,
          topicId: '',
          title: input.title,
          subject: input.subject,
          difficulty: input.difficulty,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: input.estimatedDuration,
          chunkType: 'new' as const,
          prerequisites: input.prerequisites,
          tags: input.tags,
          content: input.content,
          contentVersion: 1,
          contentUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
          topicTitle: input.topicTitle || `Topic: ${input.subject} - ${input.title}`,
        });

        const learningItem = mapChunkRowToLearningItem(chunk);

        return toolJson({
          success: true,
          item: learningItem,
          message: `Successfully created learning item "${input.title}"`,
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to create learning item "${input.title}": ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'update_chunk_content',
    {
      title: 'Update Chunk Content',
      description:
        'Update the content of an existing learning chunk with versioning and optional progress reset',
      inputSchema: UpdateChunkContentInputShape,
    },
    async (rawInput: unknown) => {
      const input: UpdateChunkContentInput = UpdateChunkContentInputSchema.parse(rawInput);
      try {
        const result = await updateChunkContent(input.chunkId, {
          content: input.content,
          resetProgress: input.resetProgress,
        });

        if (result.success && result.chunk) {
          return toolJson({
            success: true,
            chunk: result.chunk,
            progressReset: result.progressReset,
            message: `Successfully updated content for chunk "${result.chunk.title}"`,
          });
        } else {
          return toolJson({
            success: false,
            error: result.error,
            message: `Failed to update chunk content: ${result.error?.message || 'Unknown error'}`,
          });
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while updating chunk content: ${msg}`, {
          type: 'system',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'update_chunk_metadata',
    {
      title: 'Update Chunk Metadata',
      description:
        'Update metadata fields of an existing learning chunk (title, difficulty, prerequisites, tags, duration)',
      inputSchema: UpdateChunkMetadataInputShape,
    },
    async (rawInput: unknown) => {
      const input: UpdateChunkMetadataInput = UpdateChunkMetadataInputSchema.parse(rawInput);
      try {
        const result = await updateChunkMetadata(input.chunkId, {
          title: input.title,
          difficulty: input.difficulty,
          prerequisites: input.prerequisites,
          tags: input.tags,
          estimatedDuration: input.estimatedDuration,
        });

        if (result.success && result.chunk) {
          return toolJson({
            success: true,
            chunk: result.chunk,
            message: `Successfully updated metadata for chunk "${result.chunk.title}"`,
          });
        } else {
          return toolJson({
            success: false,
            error: result.error,
            message: `Failed to update chunk metadata: ${result.error?.message || 'Unknown error'}`,
          });
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while updating chunk metadata: ${msg}`, {
          type: 'system',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'update_chunk',
    {
      title: 'Update Chunk',
      description:
        'Comprehensive chunk update with automatic progress reset based on content changes',
      inputSchema: UpdateChunkInputShape,
    },
    async (rawInput: unknown) => {
      const input: UpdateChunkInput = UpdateChunkInputSchema.parse(rawInput);
      try {
        const result = await updateChunkWithProgressReset(input.chunkId, {
          content: input.content,
          title: input.title,
          difficulty: input.difficulty,
          prerequisites: input.prerequisites,
          tags: input.tags,
          estimatedDuration: input.estimatedDuration,
          forceReset: input.forceReset,
        });

        if (result.success && result.chunk) {
          return toolJson({
            success: true,
            chunk: result.chunk,
            progressReset: result.progressReset,
            message: `Successfully updated chunk "${result.chunk.title}"${result.progressReset ? ' (progress reset)' : ''}`,
          });
        } else {
          return toolJson({
            success: false,
            error: result.error,
            message: `Failed to update chunk: ${result.error?.message || 'Unknown error'}`,
          });
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while updating chunk: ${msg}`, {
          type: 'system',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'delete_chunk',
    {
      title: 'Delete Chunk',
      description:
        'Delete a learning chunk and automatically clean up prerequisite references from dependent chunks.',
      inputSchema: DeleteChunkInputShape,
    },
    async (rawInput: unknown) => {
      const { chunkId }: DeleteChunkInput = DeleteChunkInputSchema.parse(rawInput);
      try {
        const result = await deleteChunk(chunkId);

        if (result.success) {
          const removedCount = result.removedDependencies?.length ?? 0;
          const chunkTitle = result.chunk?.title ?? chunkId;
          const messageParts = [`Successfully deleted chunk "${chunkTitle}"`];

          if (removedCount > 0) {
            messageParts.push(
              `Removed prerequisite references from ${removedCount} dependent chunk${removedCount === 1 ? '' : 's'}.`
            );
          }

          return toolJson({
            success: true,
            chunk: result.chunk,
            removedDependencies: result.removedDependencies ?? [],
            message: messageParts.join(' '),
          });
        }

        return toolJson({
          success: false,
          error: result.error,
          message: result.error?.message || `Failed to delete chunk "${chunkId}"`,
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while deleting chunk: ${msg}`, {
          type: 'system',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'update_topic',
    {
      title: 'Update Topic',
      description:
        'Update topic metadata (title only). Use update_topic_summary to update topic content.',
      inputSchema: UpdateTopicInputShape,
    },
    async (rawInput: unknown) => {
      const input: UpdateTopicInput = UpdateTopicInputSchema.parse(rawInput);
      try {
        const result = await topicCreationService.updateTopic(input.topicId, {
          title: input.title,
        });

        if (result.success && result.topic) {
          return toolJson({
            success: true,
            topic: result.topic,
            message: `Successfully updated topic "${result.topic.title}"`,
          });
        } else {
          return toolJson({
            success: false,
            error: result.error,
            message: `Failed to update topic: ${result.error?.message || 'Unknown error'}`,
          });
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while updating topic: ${msg}`, {
          type: 'system',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'update_topic_summary',
    {
      title: 'Update Topic Summary',
      description: 'Update topic summary content with versioning',
      inputSchema: UpdateTopicSummaryInputShape,
    },
    async (rawInput: unknown) => {
      const input: UpdateTopicSummaryInput = UpdateTopicSummaryInputSchema.parse(rawInput);
      try {
        const result = await topicCreationService.updateTopicSummary(input.topicId, input.summary);

        if (result.success && result.topic) {
          return toolJson({
            success: true,
            topic: result.topic,
            message: `Successfully updated summary for topic "${result.topic.title}"`,
          });
        } else {
          return toolJson({
            success: false,
            error: result.error,
            message: `Failed to update topic summary: ${result.error?.message || 'Unknown error'}`,
          });
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while updating topic summary: ${msg}`, {
          type: 'system',
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
