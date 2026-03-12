import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getServerInfo } from '../shared/version.js';
import { toolJson } from './tool-helpers.js';

export function registerServerInfoTools(server: McpServer): void {
  server.registerTool(
    'get_server_info',
    {
      title: 'Get Server Info',
      description: 'Returns server name, version, and build time',
    },
    () => {
      const info = getServerInfo();
      return toolJson({
        name: info.name,
        version: info.version,
        build_time: info.buildTime,
      });
    }
  );
}
