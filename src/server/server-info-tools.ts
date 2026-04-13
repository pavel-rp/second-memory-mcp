import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getServerInfo } from '../shared/version.js';
import { withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

export function registerServerInfoTools(server: McpServer): void {
  server.registerTool(
    'get_server_info',
    {
      title: 'Get Server Info',
      description: 'Returns server name, version, and build time',
      inputSchema: z.object({}).shape,
    },
    async () =>
      withRequestContext('get_server_info', async () => {
        try {
          const info = getServerInfo();
          return toolData({
            name: info.name,
            version: info.version,
            build_time: info.buildTime,
          });
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to get server info: ${msg}`, {
            type: 'computation',
            message: msg,
          });
        }
      })
  );
}
