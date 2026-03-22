import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  CreateTopicWithChunksInputSchema,
  CreateTopicWithChunksInputShape,
  UpdateTopicInputSchema,
  UpdateTopicInputShape,
  UpdateTopicSummaryInputSchema,
  UpdateTopicSummaryInputShape,
} from '../domain/types/persistence-tools.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

function buildSummaryConsistencyReminder(topicId: string) {
  return {
    topicId,
    action: 'CONSISTENCY_CHECK' as const,
    instruction:
      'Topic summary was just updated. Before moving on, verify it accurately reflects the current chunks.',
    checklist: [
      'Chunk coverage: verify the summary mentions all chunks and omits none that still exist',
      'Prerequisite alignment: confirm the learning path described matches the actual prerequisite graph',
      'Difficulty progression: check that the described progression matches chunk difficulty values',
      'No phantom content: ensure the summary does not reference concepts or chunks that were removed',
    ],
  };
}

export function registerTopicTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_topic_with_chunks',
    {
      title: 'Create Topic with Chunks',
      description:
        'Create a new learning topic with multiple scaffolded chunks in a single atomic operation. This is the primary tool for guided learning workflows. ' +
        'Always call search_learning_content first to check for existing coverage. ' +
        'Absence from the database does not mean the learner lacks the knowledge — assess the learner before creating.',
      inputSchema: CreateTopicWithChunksInputShape,
    },
    async (rawInput: unknown) => {
      const input = CreateTopicWithChunksInputSchema.parse(rawInput);
      try {
        const result = await ctx.createTopicWithChunks({
          topicTitle: input.topicTitle,
          topicDescription: input.topicDescription,
          subject: input.subject,
          topicSummary: input.topicSummary,
          chunks: input.chunks,
        });

        if (result.success && result.topic) {
          return toolJson(
            toSnakeCase({
              success: true,
              topicId: result.topic.topicId,
              chunkIds: result.topic.chunks.map(c => c.id),
              createdAt: result.topic.createdAt,
              message: `Successfully created topic "${input.topicTitle}" with ${result.topic.chunks.length} chunks`,
            })
          );
        } else {
          return toolError(
            `Failed to create topic "${input.topicTitle}": ${result.error?.message || 'Unknown error'}`,
            {
              type: result.error?.type || 'database',
              message: result.error?.message || 'Unknown error',
              retryable: result.error?.retryable,
            }
          );
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
    'update_topic',
    {
      title: 'Update Topic',
      description:
        'Update topic metadata (title and subject). Use update_topic_summary to update topic content.',
      inputSchema: UpdateTopicInputShape,
    },
    async (rawInput: unknown) => {
      const input = UpdateTopicInputSchema.parse(rawInput);
      try {
        const result = await ctx.updateTopicMetadata(input.topicId, {
          title: input.title,
          subject: input.subject,
        });

        if (result.success && result.topic) {
          return toolJson(
            toSnakeCase({
              success: true,
              topicId: result.topic.id,
              updatedAt: result.topic.updatedAt,
              message: `Successfully updated topic "${result.topic.title}"`,
            })
          );
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
      const input = UpdateTopicSummaryInputSchema.parse(rawInput);
      try {
        const result = await ctx.updateTopicSummary(input.topicId, input.summary);

        if (result.success && result.topic) {
          return toolJson(
            toSnakeCase({
              success: true,
              topicId: result.topic.id,
              summaryVersion: result.topic.summaryVersion,
              updatedAt: result.topic.updatedAt,
              message: `Successfully updated summary for topic "${result.topic.title}"`,
              consistencyReminder: buildSummaryConsistencyReminder(result.topic.id),
            })
          );
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
