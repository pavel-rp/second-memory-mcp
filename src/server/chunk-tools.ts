import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import crypto from 'node:crypto';
import type { NewLearningChunk } from '../domain/types/entities.js';
import {
  CreateLearningItemInputSchema,
  CreateLearningItemInputShape,
  type CreateLearningItemInput,
  UpdateChunkContentInputSchema,
  UpdateChunkContentInputShape,
  type UpdateChunkContentInput,
  UpdateChunkMetadataInputSchema,
  UpdateChunkMetadataInputShape,
  type UpdateChunkMetadataInput,
  UpdateChunkInputSchema,
  UpdateChunkInputShape,
  type UpdateChunkInput,
  DeleteChunkInputSchema,
  DeleteChunkInputShape,
  type DeleteChunkInput,
} from '../domain/types/persistence-tools.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerChunkTools(server: McpServer, ctx: AppContext): void {
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

        const result = await ctx.createChunkWithTopic({
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
          prerequisitesJson: input.prerequisites ?? null,
          tagsJson: input.tags ?? null,
          content: input.content,
          contentVersion: 1,
          contentUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
          topicTitle: input.topicTitle || `Topic: ${input.subject} - ${input.title}`,
        } as NewLearningChunk & { topicTitle?: string });

        if (!result.success) {
          return toolError(
            `Failed to create learning item "${input.title}": ${result.error.message}`,
            {
              type: result.error.type,
              message: result.error.message,
            }
          );
        }

        const learningItem = ctx.mapChunkRowToLearningItem(result.data);

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
        const result = await ctx.updateChunkContent(input.chunkId, {
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
          return toolError(
            `Failed to update chunk content: ${result.error?.message || 'Unknown error'}`,
            {
              type: result.error?.type || 'database',
              message: result.error?.message || 'Unknown error',
            }
          );
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
        const result = await ctx.updateChunkMetadata(input.chunkId, {
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
          return toolError(
            `Failed to update chunk metadata: ${result.error?.message || 'Unknown error'}`,
            {
              type: result.error?.type || 'database',
              message: result.error?.message || 'Unknown error',
            }
          );
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
        const result = await ctx.updateChunkWithProgressReset(input.chunkId, {
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
          return toolError(`Failed to update chunk: ${result.error?.message || 'Unknown error'}`, {
            type: result.error?.type || 'database',
            message: result.error?.message || 'Unknown error',
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
        const result = await ctx.deleteChunk(chunkId);

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

        return toolError(result.error?.message || `Failed to delete chunk "${chunkId}"`, {
          type: result.error?.type || 'database',
          message: result.error?.message || `Failed to delete chunk "${chunkId}"`,
          retryable: result.error?.retryable,
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
}
