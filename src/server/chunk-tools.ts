import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import crypto from 'node:crypto';
import type { NewLearningChunk } from '../domain/types/entities.js';
import {
  CreateLearningItemInputSchema,
  CreateLearningItemInputShape,
  UpdateChunkContentInputSchema,
  UpdateChunkContentInputShape,
  UpdateChunkMetadataInputSchema,
  UpdateChunkMetadataInputShape,
  UpdateChunkInputSchema,
  UpdateChunkInputShape,
  DeleteChunkInputSchema,
  DeleteChunkInputShape,
} from '../domain/types/persistence-tools.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

function buildConsistencyReminder(topicId: string, context: 'created' | 'modified' = 'modified') {
  const instruction =
    context === 'created'
      ? 'A new chunk was added to this topic. If other chunks exist, verify topic-wide consistency.'
      : 'Content in this topic was just modified. Before moving on, verify topic-wide consistency.';

  return {
    topicId,
    action: 'CONSISTENCY_CHECK',
    instruction,
    checklist: [
      'Prerequisites: verify graph is correct — no orphans, no unintentional dead ends',
      'Cross-references: check if sibling chunks reference concepts from the affected chunk',
      'Topic summary: update if stale relative to this change',
      'Assumption mismatches: scan sibling chunks for difficulty/knowledge assumptions not covered by prerequisites',
      'Difficulty/duration coherence: verify the affected chunk fits the progression',
    ],
  };
}

export function registerChunkTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_learning_item',
    {
      title: 'Create Learning Item',
      description:
        'Create a single learning item with automatic topic management. Simpler alternative to create_topic_with_chunks for individual items.',
      inputSchema: CreateLearningItemInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('create_learning_item', async () => {
        const input = CreateLearningItemInputSchema.parse(rawInput);
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
            contentStatus: input.contentStatus,
            knowledgeType: input.knowledgeType ?? null,
            createdAt: now,
            updatedAt: now,
            topicTitle: input.topicTitle || `Topic: ${input.subject} - ${input.title}`,
          } as NewLearningChunk & { topicTitle?: string });

          if (!result.success) {
            const errorType = result.error.type;
            return toolError(
              `Failed to create learning item "${input.title}": ${result.error.message}`,
              {
                type: errorType,
                message: result.error.message,
                retryable: result.error.retryable,
                ...(errorType === 'content_quality'
                  ? { findings: toSnakeCase(result.error.findings ?? []) }
                  : {}),
              }
            );
          }

          const { chunk, tier2Findings } = result.data;
          return toolData(
            toSnakeCase({
              chunkId: chunk.id,
              topicId: chunk.topicId,
              createdAt: chunk.createdAt,
              // Tier 2 classifier warnings (NEU-686). Always present as an
              // array; empty when the classifier did not run or produced no
              // low-score fields. Never signals failure — creation always
              // succeeds when `result.success === true`.
              tier2Findings: tier2Findings ?? [],
              message: `Successfully created learning item "${input.title}"`,
              consistencyReminder: buildConsistencyReminder(chunk.topicId, 'created'),
            })
          );
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to create learning item "${input.title}": ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'update_chunk_content',
    {
      title: 'Update Chunk Content',
      description:
        'Update the content of an existing learning chunk with versioning and optional progress reset',
      inputSchema: UpdateChunkContentInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('update_chunk_content', async () => {
        const input = UpdateChunkContentInputSchema.parse(rawInput);
        try {
          const result = await ctx.updateChunkContent(input.chunkId, {
            content: input.content,
            resetProgress: input.resetProgress,
            condensedSummary: input.condensedSummary,
          });

          if (result.success && result.chunk) {
            return toolData(
              toSnakeCase({
                chunkId: result.chunk.id,
                contentVersion: result.chunk.contentVersion,
                progressReset: result.progressReset,
                updatedAt: result.chunk.updatedAt,
                // NEU-686: Tier 2 classifier warnings, mirroring topic-tools.
                tier2Findings: result.tier2Findings ?? [],
                message: `Successfully updated content for chunk "${result.chunk.title}"`,
                consistencyReminder: buildConsistencyReminder(result.chunk.topicId),
              })
            );
          } else {
            const errorType = result.error?.type || 'database';
            return toolError(
              `Failed to update chunk content: ${result.error?.message || 'Unknown error'}`,
              {
                type: errorType,
                message: result.error?.message || 'Unknown error',
                retryable: result.error?.retryable,
                ...(errorType === 'content_quality'
                  ? { findings: toSnakeCase(result.error?.findings ?? []) }
                  : {}),
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
      })
  );

  server.registerTool(
    'update_chunk_metadata',
    {
      title: 'Update Chunk Metadata',
      description:
        'Update metadata fields of an existing learning chunk (title, difficulty, prerequisites, tags, duration)',
      inputSchema: UpdateChunkMetadataInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('update_chunk_metadata', async () => {
        const input = UpdateChunkMetadataInputSchema.parse(rawInput);
        try {
          const result = await ctx.updateChunkMetadata(input.chunkId, {
            title: input.title,
            difficulty: input.difficulty,
            prerequisites: input.prerequisites,
            tags: input.tags,
            estimatedDuration: input.estimatedDuration,
          });

          if (result.success && result.chunk) {
            return toolData(
              toSnakeCase({
                chunkId: result.chunk.id,
                updatedAt: result.chunk.updatedAt,
                message: `Successfully updated metadata for chunk "${result.chunk.title}"`,
                consistencyReminder: buildConsistencyReminder(result.chunk.topicId),
              })
            );
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
      })
  );

  server.registerTool(
    'update_chunk',
    {
      title: 'Update Chunk',
      description:
        'Comprehensive chunk update with automatic progress reset based on content changes',
      inputSchema: UpdateChunkInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('update_chunk', async () => {
        const input = UpdateChunkInputSchema.parse(rawInput);
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
            return toolData(
              toSnakeCase({
                chunkId: result.chunk.id,
                contentVersion: result.chunk.contentVersion,
                progressReset: result.progressReset,
                updatedAt: result.chunk.updatedAt,
                // NEU-686: Tier 2 classifier warnings, mirroring topic-tools.
                tier2Findings: result.tier2Findings ?? [],
                message: `Successfully updated chunk "${result.chunk.title}"${result.progressReset ? ' (progress reset)' : ''}`,
                consistencyReminder: buildConsistencyReminder(result.chunk.topicId),
              })
            );
          } else {
            const errorType = result.error?.type || 'database';
            return toolError(
              `Failed to update chunk: ${result.error?.message || 'Unknown error'}`,
              {
                type: errorType,
                message: result.error?.message || 'Unknown error',
                retryable: result.error?.retryable,
                ...(errorType === 'content_quality'
                  ? { findings: toSnakeCase(result.error?.findings ?? []) }
                  : {}),
              }
            );
          }
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`System error while updating chunk: ${msg}`, {
            type: 'system',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'delete_chunk',
    {
      title: 'Delete Chunk',
      description:
        'Delete a learning chunk and automatically clean up prerequisite references from dependent chunks.',
      inputSchema: DeleteChunkInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('delete_chunk', async () => {
        const { chunkId } = DeleteChunkInputSchema.parse(rawInput);
        try {
          const result = await ctx.deleteChunk(chunkId);

          if (result.success) {
            const removedCount = result.removedDependencies?.length ?? 0;
            const chunkTitle = result.chunk?.title ?? chunkId;
            const topicId = result.chunk?.topicId;
            const messageParts = [`Successfully deleted chunk "${chunkTitle}"`];

            if (removedCount > 0) {
              messageParts.push(
                `Removed prerequisite references from ${removedCount} dependent chunk${removedCount === 1 ? '' : 's'}.`
              );
            }

            return toolData(
              toSnakeCase({
                chunkId: chunkId,
                removedDependencyCount: removedCount,
                message: messageParts.join(' '),
                ...(topicId ? { consistencyReminder: buildConsistencyReminder(topicId) } : {}),
              })
            );
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
      })
  );
}
