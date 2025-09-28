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

	// Research context (optional)
	researchRequired?: boolean;
	searchEmphasis?: "current" | "comprehensive" | "authoritative";
	topicSearchTerms?: string[];
};

/**
 * PromptPack centralizes standardized prompt strings used by the MCP server.
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

	private getResearchPrefix(topic: string, searchType: "current" | "comprehensive" | "authoritative" = "comprehensive", additionalSearchTerms?: string[]): string {
		const searchQueries = this.getSearchQuerySuggestions(topic, additionalSearchTerms);
		const sourceGuidance = this.getSourceQualityGuidance();

		const currentYear = new Date().getFullYear();
		const searchFocus = {
			current: `recent information (${currentYear - 1}-${currentYear}) and latest best practices`,
			comprehensive: "multiple perspectives, solutions, and comprehensive coverage",
			authoritative: "official documentation, recognized experts, and peer-reviewed sources"
		}[searchType];

		return [
			"## RESEARCH FIRST",
			`Before generating any learning content, search the web for current information about ${topic}.`,
			"",
			"Search for:",
			...searchQueries.map(query => `- ${query}`),
			`- ${searchFocus}`,
			"",
			sourceGuidance,
			"",
			"If web search is unavailable, explicitly note this limitation and use best available knowledge with uncertainty markers.",
			""
		].join("\n");
	}

	private getSourceQualityGuidance(): string {
		return [
			"Prioritize:",
			"- Official documentation and authoritative sources",
			"- Peer-reviewed articles and established educational platforms",
			"- Recognized industry experts and thought leaders",
			"- Recent tutorials and guides from reputable sources",
			"",
			"When conflicting information is found:",
			"- Present multiple perspectives with noted trade-offs",
			"- Indicate areas of consensus vs. disagreement",
			"- Explicitly state limitations and uncertainties"
		].join("\n");
	}

	private getSearchQuerySuggestions(topic: string, additionalSearchTerms?: string[]): string[] {
		const currentYear = new Date().getFullYear();
		const baseQueries = [
			`"${topic}" best practices ${currentYear - 1} ${currentYear}`,
			`"${topic}" tutorial guide comprehensive`,
			`"${topic}" official documentation`,
			`"${topic}" examples real world applications`
		];

		// Add topic-specific search terms if provided
		if (additionalSearchTerms && additionalSearchTerms.length > 0) {
			return [...baseQueries, ...additionalSearchTerms.map(term => `"${topic}" ${term}`)];
		}

		return baseQueries;
	}

	private getScaffoldingPrompt(context: PromptContext): string {
		const problem = context.problem ?? "<problem not provided>";
		const searchEmphasis = context.searchEmphasis ?? "comprehensive";

		// Include research instructions if researchRequired is not explicitly false
		const includeResearch = context.researchRequired !== false;

		const researchSection = includeResearch
			? this.getResearchPrefix(problem, searchEmphasis, context.topicSearchTerms)
			: "";

		return [
			researchSection,
			"You are an expert tutor applying evidence-based learning.",
			"Objective: Analyze the learning challenge and create an optimal scaffolding plan.",
			"",
			`PROBLEM: ${problem}`,
			"",
			"Produce:",
			"1) HIGH-LEVEL OVERVIEW: key concepts and components",
			"2) CHUNK BREAKDOWN: a reasonable number of logically ordered, digestible chunks",
			"2.1) CHUNK ORDER: the order of the chunks should be based on the logical progression of the concepts",
			"2.2) CHUNK CONTENT: Each chunk should contain a single digestible concept following cognitive load theory principles.",
			"2.3) CHUNK NUMBER: the number of chunks should be based on the complexity of the concept. As a guideline: use 3–5 chunks for simple concepts, 5–8 for moderate complexity, and 8–12 for highly complex topics. Adjust as needed for optimal learning.",
			"3) PREREQUISITE MAPPING: what must be mastered before each chunk",
			"4) DIFFICULTY ASSESSMENT: overall difficulty (1–10)",
			"5) ESTIMATED TIMELINE: realistic progression",
			"",
			"Constraints:",
			"- Manage cognitive load; prefer concrete examples before abstractions",
			"- Keep explanations concise and supportive",
			"- Persist the result to this server once it's ready."
		].filter(Boolean).join("\n");
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
			"WORKFLOW GUIDANCE",
			"",
			"End-to-end flow:",
			"1) Research phase → Search web for current information about the learning topic",
			"   - Use authoritative sources, official documentation, and recent best practices",
			"   - Gather multiple perspectives and real-world examples",
			"   - Note any limitations if web search is unavailable",
			"2) Intake problem → request 'scaffolding' prompt (produce 5–9 chunks)",
			"3) For each chunk → request 'learning' prompt → conduct retrieval",
			"4) Retrieval checks enforce a two-attempt policy with immediate feedback",
			"5) After retrieval → call tools to schedule next review:",
			"   - calculate_next_review(quality, repetitions, ease_factor, interval) → { interval, repetitions, ease_factor, next_review }",
			"   - calculate_priority_score(next_review_date, ease_factor, repetitions, difficulty) → { priority }",
			"6) Persist topic/chunk/schedule/analytics/logs via this server's tools",
			"7) Use 'review' prompt during scheduled sessions; apply interleaving when helpful",
			"",
			"Research-enhanced learning:",
			"- Scaffolding and chunk generation prompts include web search instructions by default",
			"- Research ensures content is current, accurate, and comprehensive",
			"- Multiple sources provide balanced perspectives and best practices",
			"",
			"Scope boundaries:",
			"- Only exposes prompts/resources/tools via MCP capabilities",
			"- Web search performed by client using their own capabilities",
			"- Write the data to the server as soon as you produce new artifacts like chunks or schedules",
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
		const searchEmphasis = context.searchEmphasis ?? "current";

		// Include research instructions if researchRequired is not explicitly false
		const includeResearch = context.researchRequired !== false;

		const researchSection = includeResearch
			? this.getResearchPrefix(topicTitle, searchEmphasis, context.topicSearchTerms)
			: "";

		const constraints = [
			"- Avoid duplication with existing titles",
			"- Manage cognitive load; keep chunks digestible",
			"- Reference 'Learning Chunks' fields as per schemas"
		];

		// Only add research-based constraint if research is included
		if (includeResearch) {
			constraints.push("- Base chunks on current examples and best practices found through research");
		}

		return [
			researchSection,
			"You are assisting with chunk generation for a learning topic.",
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
			...constraints
		].filter(Boolean).join("\n");
	}

	private getChunkManagementPrompt(context: PromptContext): string {
		const op = context.operation ?? "update";
		const chunk = context.managedChunk ?? { title: "<untitled>" };
		const intent = context.intent ?? "<intent not provided>";

		return [
			"You are assisting with chunk maintenance (update/merge/split/retire).",
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


