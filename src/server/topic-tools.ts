import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  CreateTopicWithChunksInputSchema,
  CreateTopicWithChunksInputShape,
  type CreateTopicWithChunksInput,
  UpdateTopicInputSchema,
  UpdateTopicInputShape,
  type UpdateTopicInput,
  UpdateTopicSummaryInputSchema,
  UpdateTopicSummaryInputShape,
  type UpdateTopicSummaryInput,
} from '../domain/types/persistence-tools.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerTopicTools(server: McpServer, ctx: AppContext): void {
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
        const result = await ctx.createTopicWithChunks({
          topicTitle: input.topic_title,
          topicDescription: input.topic_description,
          subject: input.subject,
          topicSummary: input.topic_summary,
          chunks: input.chunks.map(c => ({
            id: c.id,
            title: c.title,
            content: c.content,
            difficulty: c.difficulty,
            estimatedDuration: c.estimated_duration,
            prerequisites: c.prerequisites,
            tags: c.tags,
            chunkType: c.chunk_type,
            order: c.order,
          })),
        });

        if (result.success && result.topic) {
          return toolJson({
            success: true,
            topic: result.topic,
            message: `Successfully created topic "${input.topic_title}" with ${result.topic.chunks.length} chunks`,
          });
        } else {
          return toolError(
            `Failed to create topic "${input.topic_title}": ${result.error?.message || 'Unknown error'}`,
            {
              type: result.error?.type || 'database',
              message: result.error?.message || 'Unknown error',
              retryable: result.error?.retryable,
            }
          );
        }
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`System error while creating topic "${input.topic_title}": ${msg}`, {
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
        'Update topic metadata (title and subject). Use update_topic_summary to update topic content.',
      inputSchema: UpdateTopicInputShape,
    },
    async (rawInput: unknown) => {
      const input: UpdateTopicInput = UpdateTopicInputSchema.parse(rawInput);
      try {
        const result = await ctx.updateTopicMetadata(input.topic_id, {
          title: input.title,
          subject: input.subject,
        });

        if (result.success && result.topic) {
          return toolJson({
            success: true,
            topic: result.topic,
            message: `Successfully updated topic "${result.topic.title}"`,
          });
        } else {
          return toolError(`Failed to update topic: ${result.error?.message || 'Unknown error'}`, {
            type: result.error?.type || 'database',
            message: result.error?.message || 'Unknown error',
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
        const result = await ctx.updateTopicSummary(input.topic_id, input.summary);

        if (result.success && result.topic) {
          return toolJson({
            success: true,
            topic: result.topic,
            message: `Successfully updated summary for topic "${result.topic.title}"`,
          });
        } else {
          return toolError(
            `Failed to update topic summary: ${result.error?.message || 'Unknown error'}`,
            {
              type: result.error?.type || 'database',
              message: result.error?.message || 'Unknown error',
            }
          );
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
}
