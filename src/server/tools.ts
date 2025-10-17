import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAnalyticsTools } from "./analytics-tools.js";
import { registerSessionTools } from "./session-tools.js";
import { registerSessionManagementTools } from "./session-management-tools.js";
import { registerSpacedRepetitionTools } from "./spaced-repetition-tools.js";
import { registerPersistenceTools } from "./persistence-tools.js";
import { registerContentTools } from "./content-tools.js";

export function registerServerTools(server: McpServer): void {
  registerSpacedRepetitionTools(server);
  registerAnalyticsTools(server);
  registerSessionTools(server);
  registerSessionManagementTools(server);
  registerPersistenceTools(server);
  registerContentTools(server);
}
