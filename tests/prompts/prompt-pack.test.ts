import { describe, it, expect } from "vitest";
import { promptPack } from "../../src/prompts/prompt-pack.js";

describe("promptPack", () => {
	it("returns workflow guidance with tool names", () => {
		const text = promptPack.getPrompt("workflow_guidance", {});
		expect(text).toContain("calculate_next_review");
		expect(text).toContain("calculate_priority_score");
		expect(text).toContain("Notion MCP");
	});

	it("learning prompt includes chunk metadata", () => {
		const text = promptPack.getPrompt("learning", { chunkNumber: 2, totalChunks: 5, chunkTitle: "Intro", drillFormat: "open_ended" });
		expect(text).toContain("(2/5)");
		expect(text).toContain("Intro");
	});

	it("retrieval and review prompts include key constraints", () => {
		const r = promptPack.getPrompt("retrieval", { chunkTitle: "X", masteryLevel: 3 });
		expect(r).toContain("two-attempt");
		const v = promptPack.getPrompt("review", { lastReviewed: "2025-01-01", masteryLevel: 2, previousAttempts: 1, weakAreas: "y" });
		expect(v).toContain("LAST REVIEWED");
	});

	it("chunk generation prompt lists required fields", () => {
		const text = promptPack.getPrompt("chunk_generation", { topicTitle: "Graphs", topicDescription: "Basics", existingChunkTitles: ["Intro"] });
		expect(text).toContain("Produce 5–9 proposed chunks");
		expect(text).toContain("title");
		expect(text).toContain("order");
		expect(text).toContain("content");
		expect(text).toContain("prerequisites");
	});

	it("chunk management prompt mentions operation and resulting chunks", () => {
		const text = promptPack.getPrompt("chunk_management", { operation: "merge", managedChunk: { title: "Intro" }, intent: "deduplicate" });
		expect(text).toContain("OPERATION: merge");
		expect(text).toContain("TARGET CHUNK: Intro");
		expect(text).toContain("resulting chunk(s)");
	});
});


