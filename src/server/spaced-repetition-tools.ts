import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
        calculateNextReview,
        calculatePriorityScore,
        calculateNextReviewAdvanced,
        rankCandidatesWithConstraints,
} from "../tools/sr-calculator.js";
import { RecommendationEngine } from "../tools/recommendation-engine.js";
import {
        RecommendationModeSchema,
        SubjectPreferenceSchema,
        LearningItemSchema,
        SessionHistorySchema,
        SessionConstraintsSchema,
        RecommendationInputSchema,
} from "../types/recommendations.js";
import { mapChunkRowToLearningItem, processReviewResult } from "../services/chunks.js";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";
import { AdvancedNextArgs, RankCandidatesArgs } from "./tool-helpers.js";

export function registerSpacedRepetitionTools(server: McpServer): void {
        server.registerTool(
                "calculate_next_review",
                {
                        title: "Calculate Next Review",
                        description: "SM-2 style scheduler: returns next interval/repetitions/ease_factor/next_review",
                        inputSchema: {
                                quality: z.number().min(0).max(5),
                                repetitions: z.number().int().min(0),
                                ease_factor: z.number().min(1.3),
                                interval: z.number().int().min(0),
                        },
                },
                async ({ quality, repetitions, ease_factor, interval }: { quality: number; repetitions: number; ease_factor: number; interval: number }) => {
                        const { interval: outInterval, repetitions: outReps, easeFactor, nextReview } = calculateNextReview({
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
                        description: "Rank review priority using next_review_date, ease_factor, repetitions, difficulty",
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
                                candidates: z.array(
                                        z.object({
                                                id: z.string(),
                                                next_review_date: z.string(),
                                                ease_factor: z.number().min(1.3),
                                                repetitions: z.number().int().min(0),
                                                difficulty: z.number().int().min(1).max(10),
                                                tags: z.array(z.string()).optional(),
                                        })
                                ),
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

        server.registerTool(
                "what_to_learn_today",
                {
                        title: "Get Learning Recommendations",
                        description:
                                "Generate intelligent learning recommendations based on spaced repetition priorities, available time, and preferences. CRITICAL WORKFLOW: This tool requires learningItems data from the SQLite database. STEPS: 1) Use list_learning_items_sqlite to fetch learning items from the local database 2) Pass those items to this tool's learningItems parameter 3) Receive personalized recommendations. The tool provides fast, local-first recommendations without external dependencies. If learningItems array is empty, this tool will provide orchestration guidance. Supports both guided 'teach me' mode and explicit parameter mode.",
                        inputSchema: {
                                mode: RecommendationModeSchema.optional(),
                                timeAvailable: z.number().min(0).optional(),
                                subjectPreference: SubjectPreferenceSchema.optional(),
                                learningItems: z.array(LearningItemSchema),
                                userHistory: SessionHistorySchema.optional(),
                                sessionContext: RecommendationInputSchema.shape.sessionContext,
                                constraints: SessionConstraintsSchema.optional(),
                        },
                },
                async (input: unknown) => {
                        try {
                                const parsedInput = RecommendationInputSchema.parse(input);
                                const engine = new RecommendationEngine();
                                const result = await engine.generateRecommendations(parsedInput);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "record_review_result",
                {
                        title: "Record Review Result",
                        description: "Record study results with SM-2 algorithm integration and leech detection. Updates ease factor, repetitions, and next review date.",
                        inputSchema: {
                                itemId: z
                                        .string()
                                        .min(1, "Item ID cannot be empty")
                                        .describe("ID of the learning item"),
                                quality: z
                                        .number()
                                        .min(
                                                VALIDATION_CONSTANTS.MIN_QUALITY_SCORE,
                                                `Quality score must be at least ${VALIDATION_CONSTANTS.MIN_QUALITY_SCORE}`
                                        )
                                        .max(
                                                VALIDATION_CONSTANTS.MAX_QUALITY_SCORE,
                                                `Quality score cannot exceed ${VALIDATION_CONSTANTS.MAX_QUALITY_SCORE}`
                                        )
                                        .describe("Quality score from 0-5"),
                                timeSpentMs: z
                                        .number()
                                        .int("Time spent must be an integer")
                                        .min(0, "Time spent cannot be negative")
                                        .optional()
                                        .default(0)
                                        .describe("Time spent studying in milliseconds"),
                                consecutiveFailures: z
                                        .number()
                                        .int("Consecutive failures must be an integer")
                                        .min(0, "Consecutive failures cannot be negative")
                                        .optional()
                                        .default(0)
                                        .describe("Number of consecutive failures"),
                                daysOverdue: z
                                        .number()
                                        .int("Days overdue must be an integer")
                                        .min(0, "Days overdue cannot be negative")
                                        .optional()
                                        .default(0)
                                        .describe("Number of days overdue"),
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
                                const result = await processReviewResult(input.itemId, input.quality, {
                                        timeSpentMs: input.timeSpentMs,
                                        consecutiveFailures: input.consecutiveFailures,
                                        daysOverdue: input.daysOverdue,
                                });

                                const learningItem = mapChunkRowToLearningItem(result.chunk);

                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: true,
                                                                item: learningItem,
                                                                isLeech: result.isLeech,
                                                                message: result.isLeech
                                                                        ? "Item marked as leech due to consecutive failures"
                                                                        : "Review result recorded successfully",
                                                        }),
                                                },
                                        ],
                                };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: false,
                                                                error: {
                                                                        type: "database",
                                                                        message: errorMsg,
                                                                        retryable: true,
                                                                },
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );
}
