import { and, eq } from "drizzle-orm";
import crypto from "node:crypto";
import { getSql, withTx } from "../db/operations.js";
import { learningChunks, learningTopics, type LearningChunkRow, type LearningTopicRow } from "../db/schema.js";
import { encodeJsonArray } from "../db/operations.js";
import { promptPack } from "../prompts/prompt-pack.js";
import type { 
	TopicCreationInput, 
	TopicCreationResult, 
	TopicWithChunks, 
	ChunkDefinition,
	UserPreferences 
} from "../types/topic-creation.js";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";

/**
 * Topic Creation Service
 * Handles creation of topics with multiple chunks in atomic transactions
 */
export class TopicCreationService {
	/**
	 * Create a topic with multiple chunks in a single atomic transaction
	 */
	async createTopicWithChunks(input: TopicCreationInput): Promise<TopicCreationResult> {
		try {
			// Validate input
			const validationResult = this.validateInput(input);
			if (!validationResult.valid) {
				return {
					success: false,
					error: {
						type: "validation",
						message: validationResult.error!,
						retryable: false
					}
				};
			}

			// Create topic and chunks in transaction
			const result = withTx((tx) => {
				// Create topic
				const topicId = crypto.randomUUID();
				const now = Date.now();
				
				const topic: LearningTopicRow = {
					id: topicId,
					title: input.topicTitle,
					subject: input.subject,
					createdAt: now,
					updatedAt: now
				};

				tx.insert(learningTopics).values(topic).run();

				// Create chunks
				const createdChunks: LearningChunkRow[] = [];
				for (const chunkDef of input.chunks) {
					const chunk: LearningChunkRow = {
						id: chunkDef.id,
						topicId: topicId,
						title: chunkDef.title,
						subject: input.subject,
						difficulty: chunkDef.difficulty,
						nextReviewAt: now, // Review immediately for new chunks
						easeFactor: 2.5, // Initial ease factor
						repetitions: 0,
						lastReviewedAt: null,
						estimatedDuration: chunkDef.estimatedDuration,
						chunkType: chunkDef.chunkType,
						prerequisitesJson: encodeJsonArray(chunkDef.prerequisites),
						tagsJson: encodeJsonArray(chunkDef.tags),
						createdAt: now,
						updatedAt: now
					};

					tx.insert(learningChunks).values(chunk).run();
					createdChunks.push(chunk);
				}

				return {
					topic,
					chunks: createdChunks
				};
			});

			// Convert to response format
			const topicWithChunks: TopicWithChunks = {
				topicId: result.topic.id,
				topicTitle: result.topic.title,
				topicDescription: input.topicDescription || "",
				subject: result.topic.subject,
				chunks: result.chunks.map(chunk => ({
					id: chunk.id,
					title: chunk.title,
					content: "", // Content will be generated separately
					difficulty: chunk.difficulty,
					prerequisites: chunk.prerequisitesJson ? JSON.parse(chunk.prerequisitesJson) : [],
					estimatedDuration: chunk.estimatedDuration,
					order: 0, // Will be set based on chunk order
					tags: chunk.tagsJson ? JSON.parse(chunk.tagsJson) : [],
					chunkType: chunk.chunkType as "new" | "review" | "remediation"
				})),
				createdAt: result.topic.createdAt,
				updatedAt: result.topic.updatedAt
			};

			return {
				success: true,
				topic: topicWithChunks
			};

		} catch (error) {
			console.error("Topic creation failed:", error);
			return {
				success: false,
				error: {
					type: "database",
					message: error instanceof Error ? error.message : "Unknown database error",
					retryable: true
				}
			};
		}
	}

	/**
	 * Generate chunks from topic content using AI prompts
	 */
	async generateChunksFromContent(
		topicTitle: string, 
		topicDescription: string, 
		subject: string,
		userPreferences?: UserPreferences
	): Promise<ChunkDefinition[]> {
		try {
			// Use existing chunk generation prompt
			const prompt = promptPack.getPrompt("chunk_generation", {
				topicTitle,
				topicDescription,
				existingChunkTitles: []
			});

			// For now, return a structured response that would come from AI
			// In a real implementation, this would call an AI service
			const chunks: ChunkDefinition[] = [
				{
					id: crypto.randomUUID(),
					title: `${topicTitle} - Overview`,
					content: `Introduction to ${topicTitle}. Understanding the basic concepts and context.`,
					difficulty: userPreferences?.preferredDifficulty || 3,
					prerequisites: [],
					estimatedDuration: userPreferences?.maxChunkDuration || 15,
					order: 1,
					tags: ["overview", "introduction"],
					chunkType: "new"
				},
				{
					id: crypto.randomUUID(),
					title: `${topicTitle} - Core Concepts`,
					content: `Deep dive into the core concepts of ${topicTitle}.`,
					difficulty: (userPreferences?.preferredDifficulty || 3) + 1,
					prerequisites: [`${topicTitle} - Overview`],
					estimatedDuration: userPreferences?.maxChunkDuration || 15,
					order: 2,
					tags: ["core", "concepts"],
					chunkType: "new"
				},
				{
					id: crypto.randomUUID(),
					title: `${topicTitle} - Applications`,
					content: `Practical applications and examples of ${topicTitle}.`,
					difficulty: (userPreferences?.preferredDifficulty || 3) + 2,
					prerequisites: [`${topicTitle} - Core Concepts`],
					estimatedDuration: userPreferences?.maxChunkDuration || 15,
					order: 3,
					tags: ["applications", "examples"],
					chunkType: "new"
				}
			];

			return chunks;

		} catch (error) {
			console.error("Chunk generation failed:", error);
			throw new Error(`Failed to generate chunks: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create topic with auto-generated chunks
	 */
	async createTopicWithGeneratedChunks(
		topicTitle: string,
		topicDescription: string,
		subject: string,
		userPreferences?: UserPreferences
	): Promise<TopicCreationResult> {
		try {
			// Generate chunks from content
			const chunks = await this.generateChunksFromContent(
				topicTitle,
				topicDescription,
				subject,
				userPreferences
			);

			// Create topic with generated chunks
			return await this.createTopicWithChunks({
				topicTitle,
				topicDescription,
				subject,
				chunks,
				userPreferences
			});

		} catch (error) {
			console.error("Topic creation with generated chunks failed:", error);
			return {
				success: false,
				error: {
					type: "generation",
					message: error instanceof Error ? error.message : "Failed to generate topic content",
					retryable: true
				}
			};
		}
	}

	/**
	 * Get topic with its chunks
	 */
	async getTopicWithChunks(topicId: string): Promise<TopicWithChunks | null> {
		try {
			const db = getSql();
			
			// Get topic
			const topic = db.select()
				.from(learningTopics)
				.where(eq(learningTopics.id, topicId))
				.get();

			if (!topic) {
				return null;
			}

			// Get chunks
			const chunks = db.select()
				.from(learningChunks)
				.where(eq(learningChunks.topicId, topicId))
				.all();

			return {
				topicId: topic.id,
				topicTitle: topic.title,
				topicDescription: "", // Not stored in current schema
				subject: topic.subject,
				chunks: chunks.map(chunk => ({
					id: chunk.id,
					title: chunk.title,
					content: "", // Content not stored in current schema
					difficulty: chunk.difficulty,
					prerequisites: chunk.prerequisitesJson ? JSON.parse(chunk.prerequisitesJson) : [],
					estimatedDuration: chunk.estimatedDuration,
					order: 0, // Order not stored in current schema
					tags: chunk.tagsJson ? JSON.parse(chunk.tagsJson) : [],
					chunkType: chunk.chunkType as "new" | "review" | "remediation"
				})),
				createdAt: topic.createdAt,
				updatedAt: topic.updatedAt
			};

		} catch (error) {
			console.error("Failed to get topic with chunks:", error);
			return null;
		}
	}

	/**
	 * Validate input for topic creation
	 */
	private validateInput(input: TopicCreationInput): { valid: boolean; error?: string } {
		// Validate topic title
		if (!input.topicTitle || input.topicTitle.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
			return { valid: false, error: "Invalid topic title" };
		}

		// Validate subject
		if (!input.subject || input.subject.length > VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH) {
			return { valid: false, error: "Invalid subject" };
		}

		// Validate chunks
		if (!input.chunks || input.chunks.length === 0) {
			return { valid: false, error: "At least one chunk is required" };
		}

		if (input.chunks.length > 20) {
			return { valid: false, error: "Maximum 20 chunks per topic" };
		}

		// Validate each chunk
		for (const chunk of input.chunks) {
			if (!chunk.title || chunk.title.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
				return { valid: false, error: "Invalid chunk title" };
			}

			if (chunk.difficulty < VALIDATION_CONSTANTS.MIN_DIFFICULTY || 
				chunk.difficulty > VALIDATION_CONSTANTS.MAX_DIFFICULTY) {
				return { valid: false, error: "Invalid chunk difficulty" };
			}

			if (chunk.estimatedDuration < 1 || chunk.estimatedDuration > 120) {
				return { valid: false, error: "Invalid chunk duration" };
			}
		}

		return { valid: true };
	}
}

// Export singleton instance
export const topicCreationService = new TopicCreationService();
