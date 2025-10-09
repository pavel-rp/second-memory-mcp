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
		expect(stub.tools).toContain("calculate_next_review_advanced");
		expect(stub.tools).toContain("rank_candidates");
		// Analytics tools
		expect(stub.tools).toContain("analytics_daily");
		expect(stub.tools).toContain("analytics_window");
		// Session management tools
		expect(stub.tools).toContain("session_progress");
		expect(stub.tools).toContain("session_workflow");
		expect(stub.tools).toContain("session_completion");
		expect(stub.tools).toContain("scaffolding_prompt");
		expect(stub.tools).toContain("learning_prompt");
		expect(stub.tools).toContain("retrieval_prompt");
		expect(stub.tools).toContain("review_prompt");
		expect(stub.tools).toContain("workflow_guidance_prompt");
                // New chunk tools
                expect(stub.tools).toContain("chunk_generation_prompt");
                expect(stub.tools).toContain("chunk_management_prompt");
                expect(stub.tools).toContain("delete_chunk");
		// Learning recommendation tools
		expect(stub.tools).toContain("what_to_learn_today");
		expect(stub.tools).toContain("guided_learning_conversation");
	});
});


