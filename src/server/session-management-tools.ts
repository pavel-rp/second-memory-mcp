import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { registerSessionLifecycleTools } from './session-lifecycle-tools.js';
import { registerSessionProgressTools } from './session-progress-tools.js';

/**
 * Registers all session management MCP tools by delegating to focused sub-modules.
 */
export function registerSessionManagementTools(server: McpServer, ctx: AppContext): void {
  registerSessionLifecycleTools(server, ctx);
  registerSessionProgressTools(server, ctx);
}
