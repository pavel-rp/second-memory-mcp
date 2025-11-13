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
        'Search existing learning topics and chunks by title to avoid duplicate content creation.',
      inputSchema: SearchLearningContentInputShape,
    },
    async (rawInput: unknown) => {
      try {
        const input: SearchLearningContentInput = SearchLearningContentInputSchema.parse(rawInput);
        const result = await searchLearningContent(input);

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
