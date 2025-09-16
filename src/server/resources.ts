import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSchemas } from "../resources/notion-schemas.js";

export function registerServerResources(server: McpServer): void {
	// Static resource exposing the Notion schemas payload
	server.registerResource(
		"notion_schemas",
		new ResourceTemplate("second-memory://notion-schemas", { list: undefined }),
		{
			title: "Notion Schemas",
			description:
				"Versioned JSON schemas and usage notes for topics, chunks, schedule, analytics, and session logs",
		},
		async (uri) => {
			const payload = getSchemas();
			return {
				contents: [
					{
						uri: uri.href,
						text: JSON.stringify(payload),
					},
				],
			};
		}
	);
}


