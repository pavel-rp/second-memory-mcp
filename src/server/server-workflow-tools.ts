import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SERVER_INSTRUCTIONS } from '../shared/instructions.js';
import { toolJson } from './tool-helpers.js';

export function registerServerWorkflowTools(server: McpServer): void {
  server.registerTool(
    'get_server_workflow',
    {
      title: 'Get Server Workflow',
      description:
        'Returns the complete workflow guide for this server. ' +
        'Call this before starting any learning session if you are unsure how the tools fit together.',
      inputSchema: z.object({}).shape,
    },
    () => toolJson({ workflow: SERVER_INSTRUCTIONS })
  );
}
