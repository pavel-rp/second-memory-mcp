import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSessionLifecycleTools } from './session-lifecycle-tools.js';
import { registerSessionProgressTools } from './session-progress-tools.js';

/**
 * Registers all session management MCP tools by delegating to focused sub-modules.
 */
export function registerSessionManagementTools(server: McpServer): void {
  registerSessionLifecycleTools(server);
  registerSessionProgressTools(server);
}
