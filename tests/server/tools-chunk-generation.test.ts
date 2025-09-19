import { describe, it, expect, beforeEach } from "vitest";
import { registerServerTools } from "../../src/server/tools.js";

interface ToolHandler {
	(args: any): Promise<{ content: Array<{ type: string; text: string }> }>;
}

interface ServerTool {
	name: string;
	spec: {
		title: string;
		description: string;
		inputSchema: any;
	};
	handler: ToolHandler;
}

class CapturingServer {
	public tools: Map<string, ServerTool> = new Map();

	registerTool(name: string, spec: any, handler: ToolHandler) {
		this.tools.set(name, { name, spec, handler });
	}

	getTool(name: string): ServerTool | undefined {
		return this.tools.get(name);
	}
}

describe("Enhanced chunk_generation_prompt tool", () => {
	let server: CapturingServer;
	let tool: ServerTool;

	beforeEach(() => {
		server = new CapturingServer();
		registerServerTools(server as any);
		tool = server.getTool("chunk_generation_prompt")!;
	});

	it("should register the chunk_generation_prompt tool", () => {
		expect(tool).toBeDefined();
		expect(tool.name).toBe("chunk_generation_prompt");
		expect(tool.spec.title).toBe("Generate Chunk Set with Instructions");
	});

	it("should provide comprehensive instructions for guided workflow context", async () => {
		const result = await tool.handler({
			topicTitle: "React Fundamentals",
			topicDescription: "Learn React basics",
			workflowContext: "guided"
		});

		expect(result.content).toHaveLength(1);
		expect(result.content[0].type).toBe("text");

		const instructions = result.content[0].text;

		// Check for key instruction components
		expect(instructions).toContain("# Chunk Generation Instructions");
		expect(instructions).toContain("Step-by-Step Guide");
		expect(instructions).toContain("React Fundamentals");
		expect(instructions).toContain("5-9 scaffolded learning chunks");
		expect(instructions).toContain("create_topic_with_chunks");
		expect(instructions).toContain("guided learning session");
		expect(instructions).toContain("You are generating the content using your reasoning");
	});

	it("should provide appropriate instructions for explicit workflow context", async () => {
		const result = await tool.handler({
			topicTitle: "JavaScript Basics",
			topicDescription: "Learn JS fundamentals",
			workflowContext: "explicit"
		});

		expect(result.content).toHaveLength(1);

		const instructions = result.content[0].text;

		// Check for explicit context messaging
		expect(instructions).toContain("explicit chunk generation request");
		expect(instructions).toContain("JavaScript Basics");
		expect(instructions).not.toContain("guided learning session");
	});

	it("should handle missing workflow context gracefully", async () => {
		const result = await tool.handler({
			topicTitle: "Python Programming",
			topicDescription: "Learn Python basics"
			// No workflowContext provided
		});

		expect(result.content).toHaveLength(1);

		const instructions = result.content[0].text;

		// Should still provide comprehensive instructions
		expect(instructions).toContain("Python Programming");
		expect(instructions).toContain("Step-by-Step Guide");
		expect(instructions).toContain("create_topic_with_chunks");
	});

	it("should include proper JSON schema format in instructions", async () => {
		const result = await tool.handler({
			topicTitle: "Data Structures",
			workflowContext: "guided"
		});

		const instructions = result.content[0].text;

		// Check for JSON schema components
		expect(instructions).toMatch(/```json/);
		expect(instructions).toContain('"id": "unique-chunk-id"');
		expect(instructions).toContain('"title": "Descriptive Chunk Title"');
		expect(instructions).toContain('"difficulty": 1-10');
		expect(instructions).toContain('"prerequisites": ["prerequisite-chunk-titles"]');
		expect(instructions).toContain('"estimatedDuration": 15');
		expect(instructions).toContain('"chunkType": "new"');
	});

	it("should include base prompt for reference", async () => {
		const result = await tool.handler({
			topicTitle: "Machine Learning",
			topicDescription: "ML fundamentals",
			existingChunkTitles: ["Intro to ML"],
			workflowContext: "explicit"
		});

		const instructions = result.content[0].text;

		// Should reference the base prompt
		expect(instructions).toContain("Base Prompt for Reference:");
		// The base prompt should be included in the instructions
		expect(instructions.length).toBeGreaterThan(1000); // Comprehensive instructions
	});

	it("should provide next actions guidance", async () => {
		const result = await tool.handler({
			topicTitle: "Web Development",
			topicDescription: "Full stack web dev",
			workflowContext: "guided"
		});

		const instructions = result.content[0].text;

		// Check for next actions section
		expect(instructions).toContain("Next Actions:");
		expect(instructions).toContain("Generate your chunk definitions");
		expect(instructions).toContain('topicTitle: "Web Development"');
		expect(instructions).toContain('topicDescription: "Full stack web dev"');
		expect(instructions).toContain("subject: [infer appropriate subject]");
		expect(instructions).toContain("chunks: [your generated chunk array]");
	});

	it("should handle optional parameters correctly", async () => {
		// Test with minimal parameters
		const result = await tool.handler({
			topicTitle: "Algorithms"
		});

		expect(result.content).toHaveLength(1);

		const instructions = result.content[0].text;

		expect(instructions).toContain("Algorithms");
		expect(instructions).toContain('topicDescription: "Learn Algorithms through structured lessons"');
	});

	it("should maintain instruction format consistency", async () => {
		const result = await tool.handler({
			topicTitle: "Database Design",
			topicDescription: "Learn database principles",
			workflowContext: "guided"
		});

		const instructions = result.content[0].text;

		// Check for consistent structure
		const sections = [
			"# Chunk Generation Instructions",
			"## Step-by-Step Guide",
			"## Base Prompt for Reference:",
			"## Workflow Integration:",
			"## Next Actions:"
		];

		sections.forEach(section => {
			expect(instructions).toContain(section);
		});
	});
});