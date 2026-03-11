import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { logger } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerTeachingTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'teach_next',
    {
      title: 'Teach Next Chunk',
      description:
        'Get the next teaching instruction for the active learning session. ' +
        'Automatically selects the next chunk, hydrates the appropriate prompt, ' +
        'and returns a structured teaching instruction. No input needed — reads the active session.',
      inputSchema: {},
    },
    async () => {
      try {
        const result = await ctx.getNextTeachingStep();
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('teach_next failed:', error);
        return toolError(`Failed to get next teaching step: ${msg}`, {
          type: 'session',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
