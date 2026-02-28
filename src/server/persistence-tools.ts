import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { registerChunkTools } from './chunk-tools.js';
import { registerTopicTools } from './topic-tools.js';
import { registerQueryTools } from './query-tools.js';

/**
 * Registers all persistence MCP tools by delegating to focused sub-modules.
 */
export function registerPersistenceTools(server: McpServer, ctx: AppContext): void {
  registerChunkTools(server, ctx);
  registerTopicTools(server, ctx);
  registerQueryTools(server, ctx);
}
