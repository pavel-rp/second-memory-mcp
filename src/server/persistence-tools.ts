import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerChunkTools } from './chunk-tools.js';
import { registerTopicTools } from './topic-tools.js';
import { registerQueryTools } from './query-tools.js';

/**
 * Registers all persistence MCP tools by delegating to focused sub-modules.
 */
export function registerPersistenceTools(server: McpServer): void {
  registerChunkTools(server);
  registerTopicTools(server);
  registerQueryTools(server);
}
