import { describe, it, expect } from "vitest";
import { registerServerTools } from "../../src/server/tools.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

class StubServer {
	public tools: string[] = [];
	registerTool(name: string, _spec: unknown, _handler: unknown) {
		this.tools.push(name);
	}
}

describe("MCP Write Endpoints", () => {
	it("should register the create_learning_item tool", () => {
		const stub = new StubServer();
                registerServerTools(stub as unknown as McpServer);
		expect(stub.tools).toContain("create_learning_item");
	});

	it("should register the record_review_result tool", () => {
		const stub = new StubServer();
                registerServerTools(stub as unknown as McpServer);
		expect(stub.tools).toContain("record_review_result");
	});
});
