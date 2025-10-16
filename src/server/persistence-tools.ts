import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import crypto from "node:crypto";
import { listChunksAsLearningItems, mapChunkRowToLearningItem, deleteChunk, batchFetchChunksMinimal } from "../services/chunks.js";
import { batchFetchTopicsMinimal } from "../services/topics.js";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";

const deleteChunkInputSchema = z.object({
        chunkId: z.string().min(1, "Chunk ID cannot be empty").describe("ID of the chunk to delete"),
});

export function registerPersistenceTools(server: McpServer): void {
        server.registerTool(
                "list_learning_items_sqlite",
                {
                        title: "List Learning Items (SQLite)",
                        description: "LEGACY two-step approach: Fetch learning items from local SQLite database via services layer. For single-call convenience, use what_to_learn_today with fetchFromDatabase: true instead, which automatically fetches and generates recommendations in one call.",
                        inputSchema: {
                                subjectFilter: z.string().optional(),
                                dueOnly: z.boolean().optional(),
                                limit: z.number().int().optional(),
                        },
                },
                async ({ subjectFilter, dueOnly, limit }: { subjectFilter?: string; dueOnly?: boolean; limit?: number }) => {
                        try {
                                const items = await listChunksAsLearningItems({ subject: subjectFilter, dueOnly, limit });
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

        server.registerTool(
                "update_chunk_content",
                {
                        title: "Update Chunk Content",
                        description: "Update the content of an existing learning chunk with versioning and optional progress reset",
                        inputSchema: {
                                chunkId: z.string().min(1, "Chunk ID cannot be empty").describe("ID of the chunk to update"),
                                content: z.string()
                                        .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, "Content cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE, `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`)
                                        .describe("New content for the chunk"),
                                resetProgress: z.boolean().optional().describe("Whether to reset spaced repetition progress"),
                        },
                },
                async (input: { chunkId: string; content: string; resetProgress?: boolean }) => {
                        try {
                                const { updateChunkContent } = await import("../services/chunks.js");

                                const result = await updateChunkContent(input.chunkId, {
                                        content: input.content,
                                        resetProgress: input.resetProgress,
                                });

                                if (result.success && result.chunk) {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        chunk: result.chunk,
                                                                        progressReset: result.progressReset,
                                                                        message: `Successfully updated content for chunk "${result.chunk.title}"`,
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
                                                                        message: `Failed to update chunk content: ${result.error?.message || "Unknown error"}`,
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
                                                                message: `System error while updating chunk content: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "update_chunk_metadata",
                {
                        title: "Update Chunk Metadata",
                        description: "Update metadata fields of an existing learning chunk (title, difficulty, prerequisites, tags, duration)",
                        inputSchema: {
                                chunkId: z.string().min(1, "Chunk ID cannot be empty").describe("ID of the chunk to update"),
                                title: z.string()
                                        .min(1, "Title cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`)
                                        .optional()
                                        .describe("New title for the chunk"),
                                difficulty: z.number()
                                        .int("Difficulty must be an integer")
                                        .min(VALIDATION_CONSTANTS.MIN_DIFFICULTY, `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`)
                                        .max(VALIDATION_CONSTANTS.MAX_DIFFICULTY, `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`)
                                        .optional()
                                        .describe("New difficulty level (1-10)"),
                                prerequisites: z.array(z.string()).optional().describe("New prerequisites array"),
                                tags: z.array(z.string()).optional().describe("New tags array"),
                                estimatedDuration: z.number()
                                        .int("Estimated duration must be an integer")
                                        .min(1, "Estimated duration must be at least 1 minute")
                                        .max(120, "Estimated duration cannot exceed 120 minutes")
                                        .optional()
                                        .describe("New estimated study duration in minutes"),
                        },
                },
                async (input: {
                        chunkId: string;
                        title?: string;
                        difficulty?: number;
                        prerequisites?: string[];
                        tags?: string[];
                        estimatedDuration?: number;
                }) => {
                        try {
                                const { updateChunkMetadata } = await import("../services/chunks.js");

                                const result = await updateChunkMetadata(input.chunkId, {
                                        title: input.title,
                                        difficulty: input.difficulty,
                                        prerequisites: input.prerequisites,
                                        tags: input.tags,
                                        estimatedDuration: input.estimatedDuration,
                                });

                                if (result.success && result.chunk) {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        chunk: result.chunk,
                                                                        message: `Successfully updated metadata for chunk "${result.chunk.title}"`,
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
                                                                        message: `Failed to update chunk metadata: ${result.error?.message || "Unknown error"}`,
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
                                                                message: `System error while updating chunk metadata: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "update_chunk",
                {
                        title: "Update Chunk",
                        description: "Comprehensive chunk update with automatic progress reset based on content changes",
                        inputSchema: {
                                chunkId: z.string().min(1, "Chunk ID cannot be empty").describe("ID of the chunk to update"),
                                content: z.string()
                                        .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, "Content cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE, `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`)
                                        .optional()
                                        .describe("New content for the chunk"),
                                title: z.string()
                                        .min(1, "Title cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`)
                                        .optional()
                                        .describe("New title for the chunk"),
                                difficulty: z.number()
                                        .int("Difficulty must be an integer")
                                        .min(VALIDATION_CONSTANTS.MIN_DIFFICULTY, `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`)
                                        .max(VALIDATION_CONSTANTS.MAX_DIFFICULTY, `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`)
                                        .optional()
                                        .describe("New difficulty level (1-10)"),
                                prerequisites: z.array(z.string()).optional().describe("New prerequisites array"),
                                tags: z.array(z.string()).optional().describe("New tags array"),
                                estimatedDuration: z.number()
                                        .int("Estimated duration must be an integer")
                                        .min(1, "Estimated duration must be at least 1 minute")
                                        .max(120, "Estimated duration cannot exceed 120 minutes")
                                        .optional()
                                        .describe("New estimated study duration in minutes"),
                                forceReset: z.boolean().optional().describe("Force reset of spaced repetition progress"),
                        },
                },
                async (input: {
                        chunkId: string;
                        content?: string;
                        title?: string;
                        difficulty?: number;
                        prerequisites?: string[];
                        tags?: string[];
                        estimatedDuration?: number;
                        forceReset?: boolean;
                }) => {
                        try {
                                const { updateChunkWithProgressReset } = await import("../services/chunks.js");

                                const result = await updateChunkWithProgressReset(input.chunkId, {
                                        content: input.content,
                                        title: input.title,
                                        difficulty: input.difficulty,
                                        prerequisites: input.prerequisites,
                                        tags: input.tags,
                                        estimatedDuration: input.estimatedDuration,
                                        forceReset: input.forceReset,
                                });

                                if (result.success && result.chunk) {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        chunk: result.chunk,
                                                                        progressReset: result.progressReset,
                                                                        message: `Successfully updated chunk "${result.chunk.title}"${result.progressReset ? " (progress reset)" : ""}`,
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
                                                                        message: `Failed to update chunk: ${result.error?.message || "Unknown error"}`,
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
                                                                message: `System error while updating chunk: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "delete_chunk",
                {
                        title: "Delete Chunk",
                        description:
                                "Delete a learning chunk and automatically clean up prerequisite references from dependent chunks.",
                        inputSchema: deleteChunkInputSchema.shape,
                },
                async ({ chunkId }: { chunkId: string }) => {
                        try {
                                const result = await deleteChunk(chunkId);

                                if (result.success) {
                                        const removedCount = result.removedDependencies?.length ?? 0;
                                        const chunkTitle = result.chunk?.title ?? chunkId;
                                        const messageParts = [
                                                `Successfully deleted chunk "${chunkTitle}"`,
                                        ];

                                        if (removedCount > 0) {
                                                messageParts.push(
                                                        `Removed prerequisite references from ${removedCount} dependent chunk${removedCount === 1 ? "" : "s"}.`
                                                );
                                        }

                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        chunk: result.chunk,
                                                                        removedDependencies: result.removedDependencies ?? [],
                                                                        message: messageParts.join(" "),
                                                                }),
                                                        },
                                                ],
                                        };
                                }

                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: false,
                                                                error: result.error,
                                                                message: result.error?.message || `Failed to delete chunk "${chunkId}"`,
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
                                                                        type: "system",
                                                                        message: errorMsg,
                                                                        retryable: true,
                                                                },
                                                                message: `System error while deleting chunk: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "update_topic",
                {
                        title: "Update Topic",
                        description: "Update topic metadata (title only). Use update_topic_summary to update topic content.",
                        inputSchema: {
                                topicId: z.string().min(1, "Topic ID cannot be empty").describe("ID of the topic to update"),
                                title: z.string()
                                        .min(1, "Title cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`)
                                        .optional()
                                        .describe("New title for the topic"),
                        },
                },
                async (input: { topicId: string; title?: string }) => {
                        try {
                                const { topicCreationService } = await import("../services/topic-creation.js");

                                const result = await topicCreationService.updateTopic(input.topicId, {
                                        title: input.title,
                                });

                                if (result.success && result.topic) {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        topic: result.topic,
                                                                        message: `Successfully updated topic "${result.topic.title}"`,
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
                                                                        message: `Failed to update topic: ${result.error?.message || "Unknown error"}`,
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
                                                                message: `System error while updating topic: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "update_topic_summary",
                {
                        title: "Update Topic Summary",
                        description: "Update topic summary content with versioning",
                        inputSchema: {
                                topicId: z.string().min(1, "Topic ID cannot be empty").describe("ID of the topic to update"),
                                summary: z.string()
                                        .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, "Summary cannot be empty")
                                        .max(VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE, `Summary cannot exceed ${VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE} characters`)
                                        .describe("New summary content for the topic"),
                        },
                },
                async (input: { topicId: string; summary: string }) => {
                        try {
                                const { topicCreationService } = await import("../services/topic-creation.js");

                                const result = await topicCreationService.updateTopicSummary(input.topicId, input.summary);

                                if (result.success && result.topic) {
                                        return {
                                                content: [
                                                        {
                                                                type: "text",
                                                                text: JSON.stringify({
                                                                        success: true,
                                                                        topic: result.topic,
                                                                        message: `Successfully updated summary for topic "${result.topic.title}"`,
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
                                                                        message: `Failed to update topic summary: ${result.error?.message || "Unknown error"}`,
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
                                                                message: `System error while updating topic summary: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "batch_fetch_topics_minimal",
                {
                        title: "Batch Fetch Topics (Minimal Metadata)",
                        description: "Fetch topics with minimal metadata (IDs, title, subject, timestamps only). Efficient for listing and selection workflows.",
                        inputSchema: {
                                subjectFilter: z.string().optional().describe("Filter by subject/category"),
                                limit: z.number().int().positive().optional().describe("Maximum number of topics to return"),
                        },
                },
                async ({ subjectFilter, limit }: { subjectFilter?: string; limit?: number }) => {
                        try {
                                const topics = await batchFetchTopicsMinimal({ subject: subjectFilter, limit });
                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: true,
                                                                topics,
                                                                count: topics.length,
                                                                message: `Retrieved ${topics.length} topic${topics.length === 1 ? "" : "s"}`,
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
                                                                message: `Failed to fetch topics: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );

        server.registerTool(
                "batch_fetch_chunks_minimal",
                {
                        title: "Batch Fetch Chunks (Minimal Metadata)",
                        description: "Fetch chunks with minimal metadata (IDs, title, subject, difficulty, duration, type, timestamps only). Efficient for listing and selection workflows.",
                        inputSchema: {
                                topicId: z.string().optional().describe("Filter by topic ID"),
                                subjectFilter: z.string().optional().describe("Filter by subject/category"),
                                dueOnly: z.boolean().optional().describe("Only return chunks due for review"),
                                limit: z.number().int().positive().optional().describe("Maximum number of chunks to return"),
                        },
                },
                async ({ topicId, subjectFilter, dueOnly, limit }: { topicId?: string; subjectFilter?: string; dueOnly?: boolean; limit?: number }) => {
                        try {
                                const chunks = await batchFetchChunksMinimal({ topicId, subject: subjectFilter, dueOnly, limit });
                                return {
                                        content: [
                                                {
                                                        type: "text",
                                                        text: JSON.stringify({
                                                                success: true,
                                                                chunks,
                                                                count: chunks.length,
                                                                message: `Retrieved ${chunks.length} chunk${chunks.length === 1 ? "" : "s"}`,
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
                                                                message: `Failed to fetch chunks: ${errorMsg}`,
                                                        }),
                                                },
                                        ],
                                };
                        }
                }
        );
}
