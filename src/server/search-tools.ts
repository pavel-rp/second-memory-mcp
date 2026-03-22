import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  SearchLearningContentInputSchema,
  SearchLearningContentInputShape,
  type SearchLearningContentInput,
} from '../domain/types/search-tools.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerSearchTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'search_learning_content',
    {
      title: 'Search Learning Content',
      description:
        'Search existing learning topics and chunks. Supports three modes: ' +
        '"keyword" (default) — title/content text matching; ' +
        '"semantic" — cosine similarity on embeddings (requires configured embedding provider); ' +
        '"hybrid" — weighted combination of keyword + semantic. ' +
        'IMPORTANT: For recall, review, or retrieval practice, you MUST create a session using create_session ' +
        'with the chunk IDs before proceeding. This enables tracking of historical feedback about what the ' +
        'learner found difficult in previous sessions. ' +
        'NOTE: A not-found result means "not tracked by Second Memory," not "the learner does not know this." ' +
        'Always assess the learner before concluding there is a gap.',
      inputSchema: SearchLearningContentInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const input: SearchLearningContentInput = SearchLearningContentInputSchema.parse(rawInput);
        const result = await ctx.searchLearningContent(input);

        const chunkResults = result.results.filter(item => item.resultType === 'chunk');
        const hasChunks = chunkResults.length > 0;
        const chunkIds = chunkResults.map(c => c.id);

        return toolJson({
          success: true,
          message:
            result.counts.total > 0
              ? `Found ${result.counts.total} matching items.`
              : 'No matching topics or chunks were found.',
          ...result,
          workflow_hint: hasChunks
            ? {
                action: 'REQUIRED_FOR_RECALL',
                instruction:
                  'For recall/review/retrieval practice: You MUST call create_session with mode "retrieval" or "review" ' +
                  'and include the chunk IDs before teaching. This loads historical feedback from past sessions ' +
                  'showing what the learner struggled with previously.',
                suggested_chunk_ids: chunkIds,
                next_step: `create_session({ mode: "retrieval", chunk_ids: ${JSON.stringify(chunkIds)} })`,
              }
            : undefined,
        });
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to search learning content: ${msg}`, {
          type: 'database',
          message: msg,
        });
      }
    }
  );
}
