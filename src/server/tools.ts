import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import crypto from "node:crypto";
import { calculateNextReview, calculatePriorityScore, calculateNextReviewAdvanced, rankCandidatesWithConstraints } from "../tools/sr-calculator.js";
import { computeDailyKpis, computeWindowRollup } from "../tools/analytics.js";
import { calculateSessionProgress, determineNextPhase, checkSessionCompletion, validateSessionContext } from "../tools/session-manager.js";
import { RecommendationEngine } from "../tools/recommendation-engine.js";
import { ConversationManager } from "../tools/conversation-manager.js";
import { SessionInputSchema } from "../types/session.js";
import { SubjectPreferenceSchema, RecommendationModeSchema, LearningItemSchema, SessionHistorySchema, SessionConstraintsSchema } from "../types/recommendations.js";
import { promptPack } from "../prompts/prompt-pack.js";
import { generateOrchestrationGuidance } from "../tools/orchestration-helper.js";
import { listChunksAsLearningItems, mapChunkRowToLearningItem, processReviewResult } from "../services/chunks.js";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";

type ChunkGenerationToolArgs = {
	topicTitle: string;
	topicDescription?: string;
	existingChunkTitles?: string[];
	workflowContext?: 'guided' | 'explicit';
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

// Use the existing SessionInputSchema from types to maintain consistency
const sessionToolInputSchema = SessionInputSchema.shape;

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

	// Analytics tools
	server.registerTool(
		"analytics_daily",
		{
			title: "Calculate Daily KPIs",
			description: "Compute daily analytics KPIs from review entries for a single day",
			inputSchema: {
				entries: z.array(z.object({
					date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
					quality: z.number().min(0).max(5).optional().default(0),
					isNew: z.boolean().optional().default(false),
					topic: z.string().optional(),
					tags: z.array(z.string()).optional().default([]),
				})),
			},
		},
		async ({ entries }: { entries: Array<{date: string; quality?: number; isNew?: boolean; topic?: string; tags?: string[]}> }) => {
			try {
				const result = computeDailyKpis(entries);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"analytics_window",
		{
			title: "Calculate Window Analytics",
			description: "Compute analytics for a date range with optional topic/tag breakdowns",
			inputSchema: {
				entries: z.array(z.object({
					date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
					quality: z.number().min(0).max(5).optional().default(0),
					isNew: z.boolean().optional().default(false),
					topic: z.string().optional(),
					tags: z.array(z.string()).optional().default([]),
				})),
				window: z.object({
					start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
					end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
				}),
				includeBreakdowns: z.boolean().optional().default(false),
			},
		},
		async ({ entries, window, includeBreakdowns }: {
			entries: Array<{date: string; quality?: number; isNew?: boolean; topic?: string; tags?: string[]}>;
			window: { start: string; end: string };
			includeBreakdowns?: boolean;
		}) => {
			try {
				const result = computeWindowRollup(
					{ entries },
					window,
					{ includeBreakdowns }
				);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	// Session management tools
	server.registerTool(
		"session_progress",
		{
			title: "Calculate Session Progress",
			description: "Compute session progress metrics including completion percentages and quality averages",
			inputSchema: sessionToolInputSchema,
		},
		async (sessionData: any) => {
			try {
				const validatedSession = validateSessionContext(sessionData);
				const result = calculateSessionProgress(validatedSession);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"session_workflow",
		{
			title: "Determine Session Workflow Phase",
			description: "Analyze session state and provide workflow guidance for next learning phase",
			inputSchema: sessionToolInputSchema,
		},
		async (sessionData: any) => {
			try {
				const validatedSession = validateSessionContext(sessionData);
				const result = determineNextPhase(validatedSession);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"session_completion",
		{
			title: "Check Session Completion",
			description: "Analyze session metrics to determine if session should be completed",
			inputSchema: sessionToolInputSchema,
		},
		async (sessionData: any) => {
			try {
				const validatedSession = validateSessionContext(sessionData);
				const result = checkSessionCompletion(validatedSession);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
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
			title: "Generate Chunk Set with Instructions",
			description: "Provide comprehensive step-by-step instructions for generating scaffolded learning chunks with workflow integration",
			inputSchema: {
				topicTitle: z.string().describe("Topic title"),
				topicDescription: z.string().optional(),
				existingChunkTitles: z.array(z.string()).optional(),
				workflowContext: z.enum(['guided', 'explicit']).optional().describe("Workflow context: guided for conversation flow, explicit for direct requests"),
			},
		},
		async (args: ChunkGenerationToolArgs) => {
			// Get the base prompt for chunk generation
			const basePrompt = promptPack.getPrompt("chunk_generation", args);

			// Create comprehensive instructions with workflow integration
			const instructions = `# Chunk Generation Instructions

## Step-by-Step Guide

1. **Use your reasoning capabilities** to analyze the topic: "${args.topicTitle}"
2. **Generate 5-9 scaffolded learning chunks** following these guidelines:
   - Break down complex concepts into digestible pieces
   - Ensure logical progression from basic to advanced
   - Include prerequisite relationships between chunks
   - Estimate appropriate difficulty levels (1-10)
   - Set realistic duration estimates (5-30 minutes per chunk)

3. **Follow the structured format** shown in the prompt below
4. **Create chunks using this exact schema**:
   \`\`\`json
   {
     "id": "unique-chunk-id",
     "title": "Descriptive Chunk Title",
     "content": "Learning content description",
     "difficulty": 5,
     "prerequisites": ["prerequisite-chunk-titles"],
     "estimatedDuration": 15,
     "order": 1,
     "tags": ["relevant", "tags"],
     "chunkType": "new"
   }
   \`\`\`

5. **After generating chunks**, use the \`create_topic_with_chunks\` tool with your generated chunks

## Base Prompt for Reference:
${basePrompt}

## Workflow Integration:
${args.workflowContext === 'guided'
	? '- This is part of a guided learning session\n- Follow up by calling create_topic_with_chunks with your generated chunks\n- The system will handle the rest of the workflow automatically'
	: '- This is an explicit chunk generation request\n- Generate chunks according to the topic requirements\n- Use create_topic_with_chunks tool when ready to persist the topic'
}

## Next Actions:
1. Generate your chunk definitions using the guidance above
2. Call \`create_topic_with_chunks\` tool with:
   - topicTitle: "${args.topicTitle}"
   - topicDescription: "${args.topicDescription || `Learn ${args.topicTitle} through structured lessons`}"
   - subject: [infer appropriate subject]
   - chunks: [your generated chunk array]

Remember: You are generating the content using your reasoning - the server only provides this guidance structure.`;

			return { content: [{ type: "text", text: instructions }] };
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

	// SQLite-backed data fetcher
	server.registerTool(
		"list_learning_items_sqlite",
		{
			title: "List Learning Items (SQLite)",
			description: "Fetch learning items from local SQLite database via services layer.",
			inputSchema: {
				subject: z.string().optional(),
				dueOnly: z.boolean().optional(),
				limit: z.number().int().optional(),
			},
		},
		async ({ subject, dueOnly, limit }: { subject?: string; dueOnly?: boolean; limit?: number }) => {
			try {
				const items = await listChunksAsLearningItems({ subject, dueOnly, limit });
				return { content: [{ type: "text", text: JSON.stringify(items) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	// Learning recommendation tools
	server.registerTool(
		"what_to_learn_today",
		{
			title: "Get Learning Recommendations",
			description: "Generate intelligent learning recommendations based on spaced repetition priorities, available time, and preferences. CRITICAL WORKFLOW: This tool requires learningItems data from the SQLite database. STEPS: 1) Use list_learning_items_sqlite to fetch learning items from the local database 2) Pass those items to this tool's learningItems parameter 3) Receive personalized recommendations. The tool provides fast, local-first recommendations without external dependencies. If learningItems array is empty, this tool will provide orchestration guidance. Supports both guided 'teach me' mode and explicit parameter mode.",
			inputSchema: {
				mode: RecommendationModeSchema.optional(),
				timeAvailable: z.number().min(0).optional(),
				subjectPreference: SubjectPreferenceSchema.optional(),
				learningItems: z.array(LearningItemSchema),
				userHistory: SessionHistorySchema.optional(),
				sessionContext: z.any().optional(),
				constraints: SessionConstraintsSchema.optional(),
			},
		},
		async (input: any) => {
			try {
				const engine = new RecommendationEngine();
				const result = engine.generateRecommendations(input);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"guided_learning_conversation",
		{
			title: "Guided Learning Conversation",
			description: "Conduct a conversational 'teach me' session with zero friction. Handles session guidance, clarifying questions, and learning orchestration.",
			inputSchema: {
				intent: z.string().min(1),
				context: z.any().optional(),
				userInput: z.string().optional(),
				sessionState: z.any().optional(),
			},
		},
		async (input: any) => {
			try {
				const conversationManager = new ConversationManager();
				const result = await conversationManager.conductLearningSession(input);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	// Orchestration workflow tool
	server.registerTool(
		"orchestrate_learning_workflow",
		{
			title: "Orchestrate Learning Workflow",
			description: "Provides step-by-step guidance for SQLite-based learning workflows. Use this when you need instructions on how to use list_learning_items_sqlite and recommendation tools together for optimal learning sessions.",
			inputSchema: {
				mode: z.enum(['guided', 'explicit']).optional(),
				context: z.object({
					currentStep: z.number().optional(),
					errorMessage: z.string().optional(),
				}).optional(),
			},
		},
		async (input: { mode?: 'guided' | 'explicit'; context?: { currentStep?: number; errorMessage?: string } }) => {
			try {
				const result = generateOrchestrationGuidance(input);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);


	// Write endpoints - Record Review Result
	server.registerTool(
		"record_review_result",
		{
			title: "Record Review Result",
			description: "Record study results with SM-2 algorithm integration and leech detection. Updates ease factor, repetitions, and next review date.",
			inputSchema: {
				itemId: z.string()
					.min(1, "Item ID cannot be empty")
					.describe("ID of the learning item"),
				quality: z.number()
					.min(VALIDATION_CONSTANTS.MIN_QUALITY_SCORE, `Quality score must be at least ${VALIDATION_CONSTANTS.MIN_QUALITY_SCORE}`)
					.max(VALIDATION_CONSTANTS.MAX_QUALITY_SCORE, `Quality score cannot exceed ${VALIDATION_CONSTANTS.MAX_QUALITY_SCORE}`)
					.describe("Quality score from 0-5"),
				timeSpentMs: z.number()
					.int("Time spent must be an integer")
					.min(0, "Time spent cannot be negative")
					.optional()
					.default(0)
					.describe("Time spent studying in milliseconds"),
				consecutiveFailures: z.number()
					.int("Consecutive failures must be an integer")
					.min(0, "Consecutive failures cannot be negative")
					.optional()
					.default(0)
					.describe("Number of consecutive failures"),
				daysOverdue: z.number()
					.int("Days overdue must be an integer")
					.min(0, "Days overdue cannot be negative")
					.optional()
					.default(0)
					.describe("Number of days overdue")
			},
		},
		async (input: {
			itemId: string;
			quality: number;
			timeSpentMs?: number;
			consecutiveFailures?: number;
			daysOverdue?: number;
		}) => {
			try {
				// Process the review result
				const result = await processReviewResult(input.itemId, input.quality, {
					timeSpentMs: input.timeSpentMs,
					consecutiveFailures: input.consecutiveFailures,
					daysOverdue: input.daysOverdue
				});
				
				// Convert to LearningItem format for response
				const learningItem = mapChunkRowToLearningItem(result.chunk);
				
				return { 
					content: [{ 
						type: "text", 
						text: JSON.stringify({ 
							success: true, 
							item: learningItem,
							isLeech: result.isLeech,
							message: result.isLeech ? "Item marked as leech due to consecutive failures" : "Review result recorded successfully"
						}) 
					}] 
				};
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { 
					content: [{ 
						type: "text", 
						text: JSON.stringify({ 
							success: false, 
							error: {
								type: "database",
								message: errorMsg,
								retryable: true
							}
						}) 
					}] 
				};
			}
		}
	);
	// New: Topic + Chunks Creation Tool
	server.registerTool(
		"create_topic_with_chunks",
		{
			title: "Create Topic with Chunks",
			description: "Create a new learning topic with multiple scaffolded chunks in a single atomic operation. This is the primary tool for guided learning workflows.",
			inputSchema: {
				topicTitle: z.string()
					.min(1, "Topic title cannot be empty")
					.max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, `Topic title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`)
					.describe("Title of the learning topic"),
				topicDescription: z.string()
					.max(1000, "Topic description cannot exceed 1000 characters")
					.optional()
					.describe("Description of the learning topic"),
				subject: z.string()
					.min(1, "Subject cannot be empty")
					.max(VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH, `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`)
					.describe("Subject/category of the learning topic"),
				chunks: z.array(z.object({
					id: z.string().min(1, "Chunk ID cannot be empty"),
					title: z.string()
						.min(1, "Chunk title cannot be empty")
						.max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, `Chunk title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`),
					content: z.string().min(1, "Chunk content cannot be empty"),
					difficulty: z.number()
						.int("Difficulty must be an integer")
						.min(VALIDATION_CONSTANTS.MIN_DIFFICULTY, `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`)
						.max(VALIDATION_CONSTANTS.MAX_DIFFICULTY, `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`),
					prerequisites: z.array(z.string()).default([]),
					estimatedDuration: z.number()
						.int("Estimated duration must be an integer")
						.min(1, "Estimated duration must be at least 1 minute")
						.max(120, "Estimated duration cannot exceed 120 minutes"),
					order: z.number().int().min(1, "Order must be at least 1"),
					tags: z.array(z.string()).default([]),
					chunkType: z.enum(["new", "review", "remediation"], {
						errorMap: () => ({ message: "Chunk type must be one of: new, review, remediation" })
					}).default("new")
				}))
				.min(1, "At least one chunk is required")
				.max(20, "Maximum 20 chunks per topic")
				.describe("Array of chunk definitions for the topic"),
				userPreferences: z.object({
					preferredDifficulty: z.number()
						.int()
						.min(VALIDATION_CONSTANTS.MIN_DIFFICULTY)
						.max(VALIDATION_CONSTANTS.MAX_DIFFICULTY)
						.optional(),
					learningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]).optional(),
					maxChunkDuration: z.number().int().min(1).max(120).optional(),
					includePrerequisites: z.boolean().optional()
				}).optional()
				.describe("User learning preferences")
			},
		},
		async (input: {
			topicTitle: string;
			topicDescription?: string;
			subject: string;
			chunks: Array<{
				id: string;
				title: string;
				content: string;
				difficulty: number;
				prerequisites: string[];
				estimatedDuration: number;
				order: number;
				tags: string[];
				chunkType: "new" | "review" | "remediation";
			}>;
			userPreferences?: {
				preferredDifficulty?: number;
				learningStyle?: "visual" | "auditory" | "kinesthetic" | "reading";
				maxChunkDuration?: number;
				includePrerequisites?: boolean;
			};
		}) => {
			try {
				const { topicCreationService } = await import("../services/topic-creation.js");
				
				const result = await topicCreationService.createTopicWithChunks({
					topicTitle: input.topicTitle,
					topicDescription: input.topicDescription,
					subject: input.subject,
					chunks: input.chunks,
					userPreferences: input.userPreferences
				});

				if (result.success && result.topic) {
					return { 
						content: [{ 
							type: "text", 
							text: JSON.stringify({ 
								success: true, 
								topic: result.topic,
								message: `Successfully created topic "${input.topicTitle}" with ${result.topic.chunks.length} chunks`
							}) 
						}] 
					};
				} else {
					return { 
						content: [{ 
							type: "text", 
							text: JSON.stringify({ 
								success: false, 
								error: result.error,
								message: `Failed to create topic "${input.topicTitle}": ${result.error?.message || "Unknown error"}`
							}) 
						}] 
					};
				}
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return { 
					content: [{ 
						type: "text", 
						text: JSON.stringify({ 
							success: false, 
							error: {
								type: "system",
								message: errorMsg,
								retryable: true
							},
							message: `System error while creating topic "${input.topicTitle}": ${errorMsg}`
						}) 
					}] 
				};
			}
		}
	);


	// Basic Learning Item Creation Tool
	server.registerTool(
		"create_learning_item",
		{
			title: "Create Learning Item",
			description: "Create a single learning item with automatic topic management. Simpler alternative to create_topic_with_chunks for individual items.",
			inputSchema: {
				title: z.string()
					.min(1, "Title cannot be empty")
					.max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`)
					.describe("Title of the learning item"),
				content: z.string()
					.min(1, "Content cannot be empty")
					.describe("Content or description of the learning item"),
				subject: z.string()
					.min(1, "Subject cannot be empty")
					.max(VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH, `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`)
					.describe("Subject/category of the learning item"),
				difficulty: z.number()
					.int("Difficulty must be an integer")
					.min(VALIDATION_CONSTANTS.MIN_DIFFICULTY, `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`)
					.max(VALIDATION_CONSTANTS.MAX_DIFFICULTY, `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`)
					.describe("Difficulty level from 1-10"),
				estimatedDuration: z.number()
					.int("Estimated duration must be an integer")
					.min(1, "Estimated duration must be at least 1 minute")
					.max(120, "Estimated duration cannot exceed 120 minutes")
					.describe("Estimated study duration in minutes"),
				prerequisites: z.array(z.string()).default([]).describe("Prerequisites for this item"),
				tags: z.array(z.string()).default([]).describe("Tags for categorization"),
				topicTitle: z.string().optional().describe("Topic title (will be created if doesn't exist)")
			},
		},
		async (input: {
			title: string;
			content: string;
			subject: string;
			difficulty: number;
			estimatedDuration: number;
			prerequisites: string[];
			tags: string[];
			topicTitle?: string;
		}) => {
			try {
				const { createChunkWithTopic } = await import("../services/chunks.js");

				const now = Date.now();
				const chunkId = crypto.randomUUID();

				const chunk = await createChunkWithTopic({
					id: chunkId,
					topicId: "", // Will be set by createChunkWithTopic
					title: input.title,
					subject: input.subject,
					difficulty: input.difficulty,
					nextReviewAt: now, // Available for immediate review
					easeFactor: 2.5, // Default SM-2 ease factor
					repetitions: 0, // New item
					estimatedDuration: input.estimatedDuration,
					chunkType: "new" as const,
					prerequisites: input.prerequisites,
					tags: input.tags,
					createdAt: now,
					updatedAt: now,
					topicTitle: input.topicTitle || `Topic: ${input.title}`
				});

				// Convert to LearningItem format for response
				const learningItem = mapChunkRowToLearningItem(chunk);

				return {
					content: [{
						type: "text",
						text: JSON.stringify({
							success: true,
							item: learningItem,
							message: `Successfully created learning item "${input.title}"`
						})
					}]
				};
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
				return {
					content: [{
						type: "text",
						text: JSON.stringify({
							success: false,
							error: {
								type: "database",
								message: errorMsg,
								retryable: true
							},
							message: `Failed to create learning item "${input.title}": ${errorMsg}`
						})
					}]
				};
			}
		}
	);
}


