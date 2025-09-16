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
});


