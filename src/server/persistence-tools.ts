import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import crypto from "node:crypto";
import { listChunksAsLearningItems, mapChunkRowToLearningItem } from "../services/chunks.js";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";

export function registerPersistenceTools(server: McpServer): void {
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
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "create_topic_with_chunks",
                {
                        title: "Create Topic with Chunks",
                        description:
                                "Create a new learning topic with multiple scaffolded chunks in a single atomic operation. This is the primary tool for guided learning workflows.",
                        inputSchema: {
                                topicTitle: z
                                        .string()
                                        .min(1, "Topic title cannot be empty")
                                        .max(
                                                VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
                                                `Topic title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
                                        )
                                        .describe("Title of the learning topic"),
                                topicDescription: z
                                        .string()
                                        .max(1000, "Topic description cannot exceed 1000 characters")
                                        .optional()
                                        .describe("Description of the learning topic"),
                                subject: z
                                        .string()
                                        .min(1, "Subject cannot be empty")
                                        .max(
                                                VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH,
                                                `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`
                                        )
                                        .describe("Subject/category of the learning topic"),
                                topicSummary: z
                                        .string()
                                        .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, "Topic summary cannot be empty if provided")
                                        .max(VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE, `Topic summary cannot exceed ${VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE} characters`)
                                        .optional()
                                        .describe("Summary content for the learning topic"),
                                chunks: z
                                        .array(
                                                z.object({
                                                        id: z.string().min(1, "Chunk ID cannot be empty"),
                                                        title: z
                                                                .string()
                                                                .min(1, "Chunk title cannot be empty")
                                                                .max(
                                                                        VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
                                                                        `Chunk title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
                                                                ),
                                                        content: z.string().min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, "Chunk content cannot be empty").max(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE, `Chunk content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`),
                                                        difficulty: z
                                                                .number()
                                                                .int("Difficulty must be an integer")
                                                                .min(
                                                                        VALIDATION_CONSTANTS.MIN_DIFFICULTY,
                                                                        `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
                                                                )
                                                                .max(
                                                                        VALIDATION_CONSTANTS.MAX_DIFFICULTY,
                                                                        `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
                                                                ),
                                                        prerequisites: z.array(z.string()).default([]),
                                                        estimatedDuration: z
                                                                .number()
                                                                .int("Estimated duration must be an integer")
                                                                .min(1, "Estimated duration must be at least 1 minute")
                                                                .max(120, "Estimated duration cannot exceed 120 minutes"),
                                                        order: z.number().int().min(1, "Order must be at least 1"),
                                                        tags: z.array(z.string()).default([]),
                                                        chunkType: z
                                                                .enum(["new", "review", "remediation"], {
                                                                        errorMap: () => ({
                                                                                message: "Chunk type must be one of: new, review, remediation",
                                                                        }),
                                                                })
                                                                .default("new"),
                                                })
                                        )
                                        .min(1, "At least one chunk is required")
                                        .max(20, "Maximum 20 chunks per topic")
                                        .describe("Array of chunk definitions for the topic"),
                                userPreferences: z
                                        .object({
                                                preferredDifficulty: z
                                                        .number()
                                                        .int()
                                                        .min(VALIDATION_CONSTANTS.MIN_DIFFICULTY)
                                                        .max(VALIDATION_CONSTANTS.MAX_DIFFICULTY)
                                                        .optional(),
                                                learningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]).optional(),
                                                maxChunkDuration: z.number().int().min(1).max(120).optional(),
                                                includePrerequisites: z.boolean().optional(),
                                        })
                                        .optional()
                                        .describe("User learning preferences"),
                        },
                },
                async (input: {
                        topicTitle: string;
                        topicDescription?: string;
                        subject: string;
                        topicSummary?: string;
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
                                        topicSummary: input.topicSummary,
                                        chunks: input.chunks,
                                        userPreferences: input.userPreferences,
                                });

                                if (result.success && result.topic) {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        topic: result.topic,
                                                                        message: `Successfully created topic "${input.topicTitle}" with ${result.topic.chunks.length} chunks`,
                                                                }),
                                                        },
                                                ],
                                        };
                                } else {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: false,
                                                                        error: result.error,
                                                                        message: `Failed to create topic "${input.topicTitle}": ${result.error?.message || "Unknown error"}`,
                                                                }),
                                                        },
                                                ],
                                        };
                                }
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: false,
                                                                error: {
                                                                        type: "system",
                                                                        message: errorMsg,
                                                                        retryable: true,
                                                                },
                                                                message: `System error while creating topic "${input.topicTitle}": ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "create_learning_item",
                {
                        title: "Create Learning Item",
                        description:
                                "Create a single learning item with automatic topic management. Simpler alternative to create_topic_with_chunks for individual items.",
                        inputSchema: {
                                title: z
                                        .string()
                                        .min(1, "Title cannot be empty")
                                        .max(
                                                VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
                                                `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
                                        )
                                        .describe("Title of the learning item"),
                                content: z
                                        .string()
                                        .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, "Content cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE, `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`)
                                        .describe("Content or description of the learning item"),
                                subject: z
                                        .string()
                                        .min(1, "Subject cannot be empty")
                                        .max(
                                                VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH,
                                                `Subject cannot exceed ${VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH} characters`
                                        )
                                        .describe("Subject/category of the learning item"),
                                difficulty: z
                                        .number()
                                        .int("Difficulty must be an integer")
                                        .min(
                                                VALIDATION_CONSTANTS.MIN_DIFFICULTY,
                                                `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
                                        )
                                        .max(
                                                VALIDATION_CONSTANTS.MAX_DIFFICULTY,
                                                `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
                                        )
                                        .describe("Difficulty level from 1-10"),
                                estimatedDuration: z
                                        .number()
                                        .int("Estimated duration must be an integer")
                                        .min(1, "Estimated duration must be at least 1 minute")
                                        .max(120, "Estimated duration cannot exceed 120 minutes")
                                        .describe("Estimated study duration in minutes"),
                                prerequisites: z.array(z.string()).default([]).describe("Prerequisites for this item"),
                                tags: z.array(z.string()).default([]).describe("Tags for categorization"),
                                topicTitle: z.string().optional().describe("Topic title (will be created if doesn't exist)"),
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
                                        topicId: "",
                                        title: input.title,
                                        subject: input.subject,
                                        difficulty: input.difficulty,
                                        nextReviewAt: now,
                                        easeFactor: 2.5,
                                        repetitions: 0,
                                        estimatedDuration: input.estimatedDuration,
                                        chunkType: "new" as const,
                                        prerequisites: input.prerequisites,
                                        tags: input.tags,
                                        content: input.content,
                                        contentVersion: 1,
                                        contentUpdatedAt: now,
                                        createdAt: now,
                                        updatedAt: now,
                                        topicTitle: input.topicTitle || `Topic: ${input.subject} - ${input.title}`,
                                });

                                const learningItem = mapChunkRowToLearningItem(chunk);

                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: true,
                                                                item: learningItem,
                                                                message: `Successfully created learning item "${input.title}"`,
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
                                                                message: `Failed to create learning item "${input.title}": ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );
}
