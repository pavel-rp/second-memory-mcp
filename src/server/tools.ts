import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { calculateNextReview, calculatePriorityScore, calculateNextReviewAdvanced, rankCandidatesWithConstraints } from "../tools/sr-calculator.js";
import { promptPack } from "../prompts/prompt-pack.js";
import { getSchemas } from "../resources/notion-schemas.js";

type ChunkGenerationToolArgs = {
	topicTitle: string;
	topicDescription?: string;
	existingChunkTitles?: string[];
};

type ChunkManagementToolArgs = {
	operation?: "update" | "merge" | "split" | "retire";
	managedChunk?: { title: string; order?: number; content?: string; prerequisites?: string };
	intent?: string;
};

type AdvancedNextArgs = {
	quality: number;
	repetitions: number;
	ease_factor: number;
	interval: number;
	days_overdue?: number;
	consecutive_failures?: number;
};

type RankCandidatesArgs = {
	candidates: Array<{
		id: string;
		next_review_date: string;
		ease_factor: number;
		repetitions: number;
		difficulty: number;
		tags?: string[];
	}>;
	timeboxMinutes?: number;
};

export function registerServerTools(server: McpServer): void {
	server.registerTool(
		"calculate_next_review",
		{
			title: "Calculate Next Review",
			description:
				"SM-2 style scheduler: returns next interval/repetitions/ease_factor/next_review",
			inputSchema: {
				quality: z.number().min(0).max(5),
				repetitions: z.number().int().min(0),
				ease_factor: z.number().min(1.3),
				interval: z.number().int().min(0),
			},
		},
		async ({ quality, repetitions, ease_factor, interval }: { quality: number; repetitions: number; ease_factor: number; interval: number }) => {
			const { interval: outInterval, repetitions: outReps, easeFactor, nextReview } =
				calculateNextReview({
					quality,
					repetitions,
					easeFactor: ease_factor,
					interval,
				});

			const result = {
				interval: outInterval,
				repetitions: outReps,
				ease_factor: Number(easeFactor.toFixed(3)),
				next_review: nextReview,
			};
			return { content: [{ type: "text", text: JSON.stringify(result) }] };
		}
	);

	server.registerTool(
		"calculate_priority_score",
		{
			title: "Calculate Priority Score",
			description:
				"Rank review priority using next_review_date, ease_factor, repetitions, difficulty",
			inputSchema: {
				next_review_date: z.string().describe("ISO date string"),
				ease_factor: z.number().min(1.3),
				repetitions: z.number().int().min(0),
				difficulty: z.number().int().min(1).max(10),
			},
		},
		async ({ next_review_date, ease_factor, repetitions, difficulty }: { next_review_date: string; ease_factor: number; repetitions: number; difficulty: number }) => {
			const { priority } = calculatePriorityScore({
				nextReviewDate: next_review_date,
				easeFactor: ease_factor,
				repetitions,
				difficulty,
			});
			return { content: [{ type: "text", text: JSON.stringify({ priority }) }] };
		}
	);

	// Advanced calculators
	server.registerTool(
		"calculate_next_review_advanced",
		{
			title: "Calculate Next Review (Advanced)",
			description: "Advanced scheduler with lapses/leech handling",
			inputSchema: {
				quality: z.number().min(0).max(5),
				repetitions: z.number().int().min(0),
				ease_factor: z.number().min(1.3),
				interval: z.number().int().min(0),
				days_overdue: z.number().int().min(0).optional(),
				consecutive_failures: z.number().int().min(0).optional(),
			},
		},
		async ({ quality, repetitions, ease_factor, interval, days_overdue, consecutive_failures }: AdvancedNextArgs) => {
			const out = calculateNextReviewAdvanced({
				quality,
				repetitions,
				easeFactor: ease_factor,
				interval,
				daysOverdue: days_overdue,
				consecutiveFailures: consecutive_failures,
			});
			return { content: [{ type: "text", text: JSON.stringify(out) }] };
		}
	);

	server.registerTool(
		"rank_candidates",
		{
			title: "Rank Candidates",
			description: "Rank learning items using priority, tag weights, and daily caps",
			inputSchema: {
				candidates: z.array(z.object({
					id: z.string(),
					next_review_date: z.string(),
					ease_factor: z.number().min(1.3),
					repetitions: z.number().int().min(0),
					difficulty: z.number().int().min(1).max(10),
					tags: z.array(z.string()).optional(),
				})),
				timeboxMinutes: z.number().int().optional(),
			},
		},
		async ({ candidates, timeboxMinutes }: RankCandidatesArgs) => {
			const mapped = candidates.map((c) => ({
				id: c.id,
				nextReviewDate: c.next_review_date,
				easeFactor: c.ease_factor,
				repetitions: c.repetitions,
				difficulty: c.difficulty,
				tags: c.tags,
			}));
			const out = rankCandidatesWithConstraints({ candidates: mapped, timeboxMinutes });
			return { content: [{ type: "text", text: JSON.stringify(out) }] };
		}
	);

	// Prompt-generating tools (for clients that don't support prompts capability)
	server.registerTool(
		"scaffolding_prompt",
		{
			title: "Generate Scaffolding Prompt",
			description: "Produce scaffolding plan guidance text",
			inputSchema: { problem: z.string().describe("Learning problem statement") },
		},
		async ({ problem }: { problem: string }) => {
			const text = promptPack.getPrompt("scaffolding", { problem });
			return { content: [{ type: "text", text }] };
		}
	);

	server.registerTool(
		"learning_prompt",
		{
			title: "Generate Learning Prompt",
			description: "Produce chunk learning guidance text",
			inputSchema: {
				chunkNumber: z.number().int().optional(),
				totalChunks: z.number().int().optional(),
				chunkTitle: z.string().optional(),
				chunkContent: z.string().optional(),
				prerequisites: z.string().optional(),
				drillFormat: z.string().optional(),
			},
		},
		async (args: Record<string, unknown>) => {
			const text = promptPack.getPrompt("learning", args as any);
			return { content: [{ type: "text", text }] };
		}
	);

	server.registerTool(
		"retrieval_prompt",
		{
			title: "Generate Retrieval Prompt",
			description: "Produce retrieval practice drill text",
			inputSchema: {
				chunkTitle: z.string().optional(),
				drillFormat: z.string().optional(),
				masteryLevel: z.number().int().optional(),
			},
		},
		async (args: Record<string, unknown>) => {
			const text = promptPack.getPrompt("retrieval", args as any);
			return { content: [{ type: "text", text }] };
		}
	);

	server.registerTool(
		"review_prompt",
		{
			title: "Generate Review Prompt",
			description: "Produce spaced review session guidance text",
			inputSchema: {
				lastReviewed: z.string().optional(),
				masteryLevel: z.number().int().optional(),
				previousAttempts: z.number().int().optional(),
				weakAreas: z.string().optional(),
			},
		},
		async (args: Record<string, unknown>) => {
			const text = promptPack.getPrompt("review", args as any);
			return { content: [{ type: "text", text }] };
		}
	);

	server.registerTool(
		"workflow_guidance_prompt",
		{
			title: "Generate Workflow Guidance Prompt",
			description: "Produce end-to-end orchestration guidance text",
		},
		async () => {
			const text = promptPack.getPrompt("workflow_guidance", {});
			return { content: [{ type: "text", text }] };
		}
	);

	// New: Chunk prompts
	server.registerTool(
		"chunk_generation_prompt",
		{
			title: "Generate Chunk Set",
			description: "Produce chunk proposals (titles, order, content summary, prerequisites)",
			inputSchema: {
				topicTitle: z.string().describe("Topic title"),
				topicDescription: z.string().optional(),
				existingChunkTitles: z.array(z.string()).optional(),
			},
		},
		async (args: ChunkGenerationToolArgs) => {
			const text = promptPack.getPrompt("chunk_generation", args);
			return { content: [{ type: "text", text }] };
		}
	);

	server.registerTool(
		"chunk_management_prompt",
		{
			title: "Manage Chunk(s)",
			description: "Propose updates/merges/splits/retirements with rationale",
			inputSchema: {
				operation: z.enum(["update", "merge", "split", "retire"]).optional(),
				managedChunk: z
					.object({
						title: z.string(),
						order: z.number().int().optional(),
						content: z.string().optional(),
						prerequisites: z.string().optional(),
					})
					.optional(),
				intent: z.string().optional(),
			},
		},
		async (args: ChunkManagementToolArgs) => {
			const text = promptPack.getPrompt("chunk_management", args);
			return { content: [{ type: "text", text }] };
		}
	);

	// Resource fallback: expose Notion schemas as a tool for broad client compatibility
	server.registerTool(
		"notion_schemas",
		{
			title: "Get Notion Schemas",
			description: "Return versioned Notion schemas and usage notes",
		},
		async () => {
			const payload = getSchemas();
			return { content: [{ type: "text", text: JSON.stringify(payload) }] };
		}
	);
}


