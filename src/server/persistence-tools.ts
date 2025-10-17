import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import crypto from 'node:crypto';
import {
  listChunksAsLearningItems,
  mapChunkRowToLearningItem,
  deleteChunk,
  batchFetchChunksMinimal,
} from '../services/chunks.js';
import { batchFetchTopicsMinimal } from '../services/topics.js';
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

export function registerPersistenceTools(server: McpServer): void {
  server.registerTool(
    'list_learning_items_sqlite',
    {
      title: 'List Learning Items (SQLite)',
      description:
        'LEGACY two-step approach: Fetch learning items from local SQLite database via services layer. For single-call convenience, use what_to_learn_today with fetchFromDatabase: true instead, which automatically fetches and generates recommendations in one call.',
      inputSchema: ListLearningItemsInputShape,
    },
    async (rawInput: unknown) => {
      const { subjectFilter, dueOnly, limit }: ListLearningItemsInput =
        ListLearningItemsInputSchema.parse(rawInput);
      try {
        const items = await listChunksAsLearningItems({ subject: subjectFilter, dueOnly, limit });
        return { content: [{ type: 'text', text: JSON.stringify(items) }] };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return { content: [{ type: 'text', text: JSON.stringify({ error: errorMsg }) }] };
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
        const { topicCreationService } = await import('../services/topic-creation.js');

        const result = await topicCreationService.createTopicWithChunks({
          topicTitle: input.topicTitle,
          topicDescription: input.topicDescription,
          subject: input.subject,
          topicSummary: input.topicSummary,
          chunks: input.chunks,
          userPreferences: input.userPreferences,
        });

        if (result.success && result.topic) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  topic: result.topic,
                  message: `Successfully created topic "${input.topicTitle}" with ${result.topic.chunks.length} chunks`,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: result.error,
                  message: `Failed to create topic "${input.topicTitle}": ${result.error?.message || 'Unknown error'}`,
                }),
              },
            ],
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while creating topic "${input.topicTitle}": ${errorMsg}`,
              }),
            },
          ],
        };
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
        const { createChunkWithTopic } = await import('../services/chunks.js');

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

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                item: learningItem,
                message: `Successfully created learning item "${input.title}"`,
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
                error: {
                  type: 'database',
                  message: errorMsg,
                  retryable: true,
                },
                message: `Failed to create learning item "${input.title}": ${errorMsg}`,
              }),
            },
          ],
        };
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
        const { updateChunkContent } = await import('../services/chunks.js');

        const result = await updateChunkContent(input.chunkId, {
          content: input.content,
          resetProgress: input.resetProgress,
        });

        if (result.success && result.chunk) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  chunk: result.chunk,
                  progressReset: result.progressReset,
                  message: `Successfully updated content for chunk "${result.chunk.title}"`,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: result.error,
                  message: `Failed to update chunk content: ${result.error?.message || 'Unknown error'}`,
                }),
              },
            ],
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while updating chunk content: ${errorMsg}`,
              }),
            },
          ],
        };
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
        const { updateChunkMetadata } = await import('../services/chunks.js');

        const result = await updateChunkMetadata(input.chunkId, {
          title: input.title,
          difficulty: input.difficulty,
          prerequisites: input.prerequisites,
          tags: input.tags,
          estimatedDuration: input.estimatedDuration,
        });

        if (result.success && result.chunk) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  chunk: result.chunk,
                  message: `Successfully updated metadata for chunk "${result.chunk.title}"`,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: result.error,
                  message: `Failed to update chunk metadata: ${result.error?.message || 'Unknown error'}`,
                }),
              },
            ],
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while updating chunk metadata: ${errorMsg}`,
              }),
            },
          ],
        };
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
        const { updateChunkWithProgressReset } = await import('../services/chunks.js');

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
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  chunk: result.chunk,
                  progressReset: result.progressReset,
                  message: `Successfully updated chunk "${result.chunk.title}"${result.progressReset ? ' (progress reset)' : ''}`,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: result.error,
                  message: `Failed to update chunk: ${result.error?.message || 'Unknown error'}`,
                }),
              },
            ],
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while updating chunk: ${errorMsg}`,
              }),
            },
          ],
        };
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

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  chunk: result.chunk,
                  removedDependencies: result.removedDependencies ?? [],
                  message: messageParts.join(' '),
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
                success: false,
                error: result.error,
                message: result.error?.message || `Failed to delete chunk "${chunkId}"`,
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
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while deleting chunk: ${errorMsg}`,
              }),
            },
          ],
        };
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
        const { topicCreationService } = await import('../services/topic-creation.js');

        const result = await topicCreationService.updateTopic(input.topicId, {
          title: input.title,
        });

        if (result.success && result.topic) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  topic: result.topic,
                  message: `Successfully updated topic "${result.topic.title}"`,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: result.error,
                  message: `Failed to update topic: ${result.error?.message || 'Unknown error'}`,
                }),
              },
            ],
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while updating topic: ${errorMsg}`,
              }),
            },
          ],
        };
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
        const { topicCreationService } = await import('../services/topic-creation.js');

        const result = await topicCreationService.updateTopicSummary(input.topicId, input.summary);

        if (result.success && result.topic) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  topic: result.topic,
                  message: `Successfully updated summary for topic "${result.topic.title}"`,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: result.error,
                  message: `Failed to update topic summary: ${result.error?.message || 'Unknown error'}`,
                }),
              },
            ],
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  type: 'system',
                  message: errorMsg,
                  retryable: true,
                },
                message: `System error while updating topic summary: ${errorMsg}`,
              }),
            },
          ],
        };
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
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                topics,
                count: topics.length,
                message: `Retrieved ${topics.length} topic${topics.length === 1 ? '' : 's'}`,
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
                error: {
                  type: 'database',
                  message: errorMsg,
                  retryable: true,
                },
                message: `Failed to fetch topics: ${errorMsg}`,
              }),
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    'batch_fetch_chunks_minimal',
    {
      title: 'Batch Fetch Chunks (Minimal Metadata)',
      description:
        'Fetch chunks with minimal metadata (IDs, title, subject, difficulty, duration, type, timestamps only). Efficient for listing and selection workflows.',
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
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                chunks,
                count: chunks.length,
                message: `Retrieved ${chunks.length} chunk${chunks.length === 1 ? '' : 's'}`,
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
                error: {
                  type: 'database',
                  message: errorMsg,
                  retryable: true,
                },
                message: `Failed to fetch chunks: ${errorMsg}`,
              }),
            },
          ],
        };
      }
    }
  );
}
