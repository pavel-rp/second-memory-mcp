export type PromptName =
	| "scaffolding"
	| "learning"
	| "retrieval"
	| "review"
	| "workflow_guidance"
	| "chunk_generation"
	| "chunk_management";

export type DrillFormat =
	| "multiple_choice"
	| "open_ended"
	| "coding_problem"
	| "explanation"
	| "application";

export type PromptContext = {
	// Common
	problem?: string;

	// Learning context
	chunkNumber?: number;
	totalChunks?: number;
	chunkTitle?: string;
	chunkContent?: string;
	prerequisites?: string;
	drillFormat?: DrillFormat;

	// Review context
	masteryLevel?: number; // 0..5
	lastReviewed?: string; // ISO date string
	previousAttempts?: number;
	weakAreas?: string;

	// Chunk generation context
	topicTitle?: string;
	topicDescription?: string;
	existingChunkTitles?: string[];

	// Chunk management context
	operation?: "update" | "merge" | "split" | "retire";
	managedChunk?: { title: string; order?: number; content?: string; prerequisites?: string };
	intent?: string;
};

/**
 * PromptPack centralizes standardized prompt strings used by the MCP server.
 * Prompts are concise, research-aligned, and explicitly instruct the model to
 * use a separate Notion MCP layer for any persistence (no database writes from this server).
 */
export class PromptPack {
	getPrompt(name: PromptName, context: PromptContext = {}): string {
		switch (name) {
			case "scaffolding":
				return this.getScaffoldingPrompt(context);
			case "learning":
				return this.getLearningPrompt(context);
			case "retrieval":
				return this.getRetrievalPrompt(context);
			case "review":
				return this.getReviewPrompt(context);
			case "workflow_guidance":
				return this.getWorkflowGuidancePrompt();
			case "chunk_generation":
				return this.getChunkGenerationPrompt(context);
			case "chunk_management":
				return this.getChunkManagementPrompt(context);
		}
	}

	private getScaffoldingPrompt(context: PromptContext): string {
		const problem = context.problem ?? "<problem not provided>";
		return [
			"You are an expert tutor applying evidence-based learning.",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using provided schemas.",
			"Objective: Analyze the learning challenge and create an optimal scaffolding plan.",
			"",
			`PROBLEM: ${problem}`,
			"",
			"Produce:",
			"1) HIGH-LEVEL OVERVIEW: key concepts and components",
			"2) CHUNK BREAKDOWN: 5–9 logically ordered, digestible chunks",
			"3) PREREQUISITE MAPPING: what must be mastered before each chunk",
			"4) DIFFICULTY ASSESSMENT: overall difficulty (1–10)",
			"5) ESTIMATED TIMELINE: realistic progression",
			"",
			"Constraints:",
			"- Manage cognitive load; prefer concrete examples before abstractions",
			"- Keep explanations concise and supportive",
		].join("\n");
	}

	private getLearningPrompt(context: PromptContext): string {
		const chunkNumber = context.chunkNumber ?? 1;
		const totalChunks = context.totalChunks ?? 1;
		const chunkTitle = context.chunkTitle ?? "<untitled chunk>";
		const chunkContent = context.chunkContent ?? "<content not provided>";
		const prerequisites = context.prerequisites ?? "verified or N/A";
		const drillFormat = context.drillFormat ?? "open_ended";

		return [
			"You are teaching with cognitive load awareness and scaffolding.",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using provided schemas.",
			"",
			`CURRENT CHUNK (${chunkNumber}/${totalChunks}): "${chunkTitle}"`,
			`Focus: ${chunkContent}`,
			`Prerequisites verified: ${prerequisites}`,
			"",
			"Approach:",
			"1) Present the core concept using simple, concrete examples",
			"2) Build understanding gradually with scaffolded explanations",
			"3) Use analogies or visual descriptions if helpful",
			"4) Check for understanding before moving on",
			`5) End with a retrieval check using format: ${drillFormat}`,
			"",
			"Style: concise, supportive, and precise.",
		].join("\n");
	}

	private getRetrievalPrompt(context: PromptContext): string {
		const chunkTitle = context.chunkTitle ?? "<untitled chunk>";
		const drillFormat = context.drillFormat ?? "open_ended";
		const mastery = context.masteryLevel ?? 2;

		return [
			"You are generating a retrieval practice drill.",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using provided schemas.",
			"",
			`CHUNK: "${chunkTitle}"`,
			`FORMAT: ${drillFormat}`,
			`TARGET MASTERY: ${mastery}/5`,
			"",
			"Requirements:",
			"- Test core understanding, not rote memorization",
			"- Enforce a two-attempt policy before revealing answers",
			"- Provide immediate, constructive feedback",
			"- Include a near-transfer application if appropriate",
		].join("\n");
	}

	private getReviewPrompt(context: PromptContext): string {
		const lastReviewed = context.lastReviewed ?? "<unknown>";
		const mastery = context.masteryLevel ?? 2;
		const previousAttempts = context.previousAttempts ?? 0;
		const weakAreas = context.weakAreas ?? "focus foundational gaps";

		return [
			"You are conducting a spaced review session.",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using provided schemas.",
			"",
			`LAST REVIEWED: ${lastReviewed}`,
			`CURRENT MASTERY: ${mastery}/5`,
			`PREVIOUS ATTEMPTS: ${previousAttempts}`,
			`FOCUS AREAS: ${weakAreas}`,
			"",
			"Plan:",
			"1) Quick recall check (no re-teaching)",
			"2) If successful: brief reinforcement + harder application",
			"3) If failed: targeted re-explanation + practice drill (two-attempt policy)",
			"4) Use interleaving with related concepts when helpful",
			"5) End with confidence assessment",
		].join("\n");
	}

	private getWorkflowGuidancePrompt(): string {
		return [
			"WORKFLOW GUIDANCE (stateless MCP server)",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using the provided schemas.",
			"",
			"End-to-end flow:",
			"1) Intake problem → request 'scaffolding' prompt (produce 5–9 chunks)",
			"2) For each chunk → request 'learning' prompt → conduct retrieval",
			"3) Retrieval checks enforce a two-attempt policy with immediate feedback",
			"4) After retrieval → call tools to schedule next review:",
			"   - calculate_next_review(quality, repetitions, ease_factor, interval) → { interval, repetitions, ease_factor, next_review }",
			"   - calculate_priority_score(next_review_date, ease_factor, repetitions, difficulty) → { priority }",
			"5) Persist topic/chunk/schedule/analytics/logs via Notion MCP only (never direct Notion API from this server)",
			"6) Use 'review' prompt during scheduled sessions; apply interleaving when helpful",
			"",
			"Scope boundaries:",
			"- This server is stateless; no session storage, no external network I/O",
			"- Only exposes prompts/resources/tools via MCP capabilities",
			"",
			"Style and pedagogy:",
			"- Manage cognitive load; use concrete → abstract progression",
			"- Keep explanations concise, supportive, and precise",
		].join("\n");
	}

	private getChunkGenerationPrompt(context: PromptContext): string {
		const topicTitle = context.topicTitle ?? "<topic not provided>";
		const topicDescription = context.topicDescription ?? "<description not provided>";
		const existing = Array.isArray(context.existingChunkTitles) ? context.existingChunkTitles : [];
		const existingList = existing.length > 0 ? `Existing chunk titles: ${existing.join(", ")}` : "No existing chunk titles provided.";

		return [
			"You are assisting with chunk generation for a learning topic.",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using provided schemas.",
			"",
			`TOPIC: ${topicTitle}`,
			`DESCRIPTION: ${topicDescription}`,
			existingList,
			"",
			"Produce 5–9 proposed chunks, each including:",
			"- title",
			"- order (1..n)",
			"- content (2–3 sentence summary)",
			"- prerequisites (bulleted list or concise text)",
			"",
			"Constraints:",
			"- Avoid duplication with existing titles",
			"- Manage cognitive load; keep chunks digestible",
			"- Reference 'Learning Chunks' fields as per schemas",
		].join("\n");
	}

	private getChunkManagementPrompt(context: PromptContext): string {
		const op = context.operation ?? "update";
		const chunk = context.managedChunk ?? { title: "<untitled>" };
		const intent = context.intent ?? "<intent not provided>";

		return [
			"You are assisting with chunk maintenance (update/merge/split/retire).",
			"Do not write to databases from this server. Use a separate Notion MCP layer for persistence using provided schemas.",
			"",
			`OPERATION: ${op}`,
			`TARGET CHUNK: ${chunk.title}`,
			chunk.order != null ? `ORDER: ${chunk.order}` : undefined,
			chunk.content ? `CONTENT (current): ${chunk.content}` : undefined,
			chunk.prerequisites ? `PREREQUISITES (current): ${chunk.prerequisites}` : undefined,
			`INTENT: ${intent}`,
			"",
			"Output a proposed result with:",
			"- resulting chunk(s) with title, order, content summary, prerequisites",
			"- brief rationale for the change",
			"- explicit mapping of any splits/merges",
		].filter(Boolean).join("\n");
	}
}

export const promptPack = new PromptPack();


