import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAnalyticsTools } from "./analytics-tools.js";
import { registerPromptTools } from "./prompt-tools.js";
import { registerSessionTools } from "./session-tools.js";
import { registerSpacedRepetitionTools } from "./spaced-repetition-tools.js";
import { registerPersistenceTools } from "./persistence-tools.js";

export function registerServerTools(server: McpServer): void {
  registerSpacedRepetitionTools(server);
  registerAnalyticsTools(server);
  registerSessionTools(server);
  registerPromptTools(server);
  registerPersistenceTools(server);
}
