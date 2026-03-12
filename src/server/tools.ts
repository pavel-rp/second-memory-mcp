import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { registerAnalyticsTools } from './analytics-tools.js';
import { registerSessionTools } from './session-tools.js';
import { registerSessionManagementTools } from './session-management-tools.js';
import { registerSpacedRepetitionTools } from './spaced-repetition-tools.js';
import { registerPersistenceTools } from './persistence-tools.js';
import { registerContentTools } from './content-tools.js';
import { registerSearchTools } from './search-tools.js';
import { registerTeachingTools } from './teaching-tools.js';
import { registerServerInfoTools } from './server-info-tools.js';

export function registerServerTools(server: McpServer, ctx: AppContext): void {
  registerSpacedRepetitionTools(server, ctx);
  registerAnalyticsTools(server, ctx);
  registerSessionTools(server, ctx);
  registerSessionManagementTools(server, ctx);
  registerPersistenceTools(server, ctx);
  registerContentTools(server, ctx);
  registerSearchTools(server, ctx);
  registerTeachingTools(server, ctx);
  registerServerInfoTools(server);
}
