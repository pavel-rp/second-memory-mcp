import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  SearchLearningContentInputSchema,
  SearchLearningContentInputShape,
  type SearchLearningContentInput,
} from '../types/search-tools.js';
import { searchLearningContent } from '../services/search.js';

export function registerSearchTools(server: McpServer): void {
  server.registerTool(
    'search_learning_content',
    {
      title: 'Search Learning Content',
      description:
        'Search existing learning topics and chunks by title to find content for review or avoid duplicates. ' +
        'IMPORTANT: For recall, review, or retrieval practice, you MUST create a session using create_session ' +
        'with the chunk IDs before proceeding. This enables tracking of historical feedback about what the ' +
        'learner found difficult in previous sessions.',
      inputSchema: SearchLearningContentInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const input: SearchLearningContentInput = SearchLearningContentInputSchema.parse(rawInput);
        const result = await searchLearningContent(input);

        // Extract chunk IDs from results (results contain both topics and chunks)
        const chunkResults = result.results.filter(item => item.resultType === 'chunk');
        const hasChunks = chunkResults.length > 0;
        const chunkIds = chunkResults.map(c => c.id);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message:
                  result.counts.total > 0
                    ? `Found ${result.counts.total} matching items.`
                    : 'No matching topics or chunks were found.',
                ...result,
                // Enforcement hint for recall/review workflows
                workflowHint: hasChunks
                  ? {
                      action: 'REQUIRED_FOR_RECALL',
                      instruction:
                        'For recall/review/retrieval practice: You MUST call create_session with mode "retrieval" or "review" ' +
                        'and include the chunk IDs before teaching. This loads historical feedback from past sessions ' +
                        'showing what the learner struggled with previously.',
                      suggestedChunkIds: chunkIds,
                      nextStep: `create_session({ mode: "retrieval", chunkIds: ${JSON.stringify(chunkIds)} })`,
                    }
                  : undefined,
              }),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'search_failed',
                message: `Failed to search learning content: ${errorMessage}`,
              }),
            },
          ],
        };
      }
    }
  );
}
