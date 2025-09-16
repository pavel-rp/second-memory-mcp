import { describe, it, expect } from "vitest";
import { registerServerTools } from "../../src/server/tools.js";

class StubServer {
	public tools: string[] = [];
	registerTool(name: string, _spec: unknown, _handler: unknown) {
		this.tools.push(name);
	}
}

describe("registerServerTools", () => {
	it("registers calculators and prompt tools", () => {
		const stub = new StubServer() as any;
		registerServerTools(stub);
		expect(stub.tools).toContain("calculate_next_review");
		expect(stub.tools).toContain("calculate_priority_score");
		expect(stub.tools).toContain("scaffolding_prompt");
		expect(stub.tools).toContain("learning_prompt");
		expect(stub.tools).toContain("retrieval_prompt");
		expect(stub.tools).toContain("review_prompt");
		expect(stub.tools).toContain("workflow_guidance_prompt");
		expect(stub.tools).toContain("notion_schemas");
		// New chunk tools
		expect(stub.tools).toContain("chunk_generation_prompt");
		expect(stub.tools).toContain("chunk_management_prompt");
	});
});


