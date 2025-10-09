import { and, eq, lte } from "drizzle-orm";
import crypto from "node:crypto";
import { getSql, withTx, decodeJsonArray, encodeJsonArray } from "../db/operations.js";
import { learningChunks, learningTopics, type LearningChunkRow } from "../db/schema.js";
import type { LearningItem } from "../types/recommendations.js";
import { calculateNextReviewAdvanced } from "../tools/sr-calculator.js";
import { scheduleReview } from "./reviews.js";
import { prerequisiteReferenceValidator } from "../tools/prerequisite-reference-validator.js";

export type CreateChunkInput = {
	id: string;
	topicId: string;
	title: string;
	subject: string;
	difficulty: number;
	nextReviewAt: number;
	easeFactor: number;
	repetitions: number;
	lastReviewedAt?: number;
	estimatedDuration: number;
	chunkType: "new" | "review" | "remediation";
	prerequisites?: string[];
	tags?: string[];
	createdAt: number;
	updatedAt: number;
	// Content persistence fields
	content?: string;
	contentVersion?: number;
	contentUpdatedAt?: number;
};

export async function createChunk(input: CreateChunkInput): Promise<void> {
	const db = getSql();
	await db.insert(learningChunks).values({
		...input,
		prerequisitesJson: encodeJsonArray(input.prerequisites),
		tagsJson: encodeJsonArray(input.tags),
		content: input.content || null,
		contentVersion: input.content ? (input.contentVersion || 1) : null,
		contentUpdatedAt: input.content ? (input.contentUpdatedAt || Date.now()) : null,
	}).run();
}

export async function getChunk(id: string) {
	const db = getSql();
	const row = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
	return row;
}

export type ListChunksFilter = {
	subject?: string;
	dueOnly?: boolean;
	limit?: number;
};

export async function listChunks(filter: ListChunksFilter = {}) {
	const db = getSql();
	const now = Date.now();
	const conditions: ReturnType<typeof eq>[] = [];
	if (filter.subject) conditions.push(eq(learningChunks.subject, filter.subject));
	if (filter.dueOnly) conditions.push(lte(learningChunks.nextReviewAt, now));

	const baseQuery = db.select({
		id: learningChunks.id,
		topicId: learningChunks.topicId,
		title: learningChunks.title,
		subject: learningChunks.subject,
		difficulty: learningChunks.difficulty,
		nextReviewAt: learningChunks.nextReviewAt,
		easeFactor: learningChunks.easeFactor,
		repetitions: learningChunks.repetitions,
		lastReviewedAt: learningChunks.lastReviewedAt,
		estimatedDuration: learningChunks.estimatedDuration,
		chunkType: learningChunks.chunkType,
		prerequisitesJson: learningChunks.prerequisitesJson,
		tagsJson: learningChunks.tagsJson,
		content: learningChunks.content,
		contentVersion: learningChunks.contentVersion,
		contentUpdatedAt: learningChunks.contentUpdatedAt,
		createdAt: learningChunks.createdAt,
		updatedAt: learningChunks.updatedAt,
		topicTitle: learningTopics.title,
	})
	.from(learningChunks)
	.leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id));

	if (conditions.length > 0) {
		const query = baseQuery.where(and(...conditions));
		if (filter.limit && filter.limit > 0) {
			return query.limit(filter.limit).all();
		}
		return query.all();
	}

	if (filter.limit && filter.limit > 0) {
		return baseQuery.limit(filter.limit).all();
	}

	return baseQuery.all();
}

function toIsoDate(epochMs: number): string {
	const d = new Date(epochMs);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

type ChunkListRow = LearningChunkRow & { topicTitle?: string | null };

export function mapChunkRowToLearningItem(row: ChunkListRow): LearningItem {
        const rawChunkType = row.chunkType;
        const chunkType: LearningItem["chunkType"] = rawChunkType === "review" || rawChunkType === "remediation"
                ? rawChunkType
                : "new";
        const topicTitle = row.topicTitle ?? null;

        // Create the base LearningItem
        const learningItem: LearningItem = {
                id: row.id,
                title: row.title,
                subject: row.subject,
                difficulty: row.difficulty,
                nextReviewDate: toIsoDate(row.nextReviewAt),
                easeFactor: row.easeFactor,
                repetitions: row.repetitions,
                lastReviewed: row.lastReviewedAt ? toIsoDate(row.lastReviewedAt) : undefined,
                estimatedDuration: row.estimatedDuration,
                chunkType,
                prerequisites: decodeJsonArray(row.prerequisitesJson),
                tags: decodeJsonArray(row.tagsJson),
                topicId: topicTitle !== null ? row.topicId : undefined, // Only include if topic actually exists
                topicTitle: topicTitle ?? undefined,
        };

        return learningItem;
}

export async function listChunksAsLearningItems(filter: ListChunksFilter = {}): Promise<LearningItem[]> {
	const rows = await listChunks(filter);
	return rows.map(mapChunkRowToLearningItem);
}

export async function updateChunk(id: string, changes: Partial<Omit<CreateChunkInput, "id" | "topicId" | "createdAt">>): Promise<number> {
	const db = getSql();
	const updatePayload: Record<string, unknown> = { ...changes };
	
	// Handle JSON fields - remove original fields to avoid conflicts
	if (changes.prerequisites) {
		updatePayload.prerequisitesJson = encodeJsonArray(changes.prerequisites);
		delete updatePayload.prerequisites;
	}
	if (changes.tags) {
		updatePayload.tagsJson = encodeJsonArray(changes.tags);
		delete updatePayload.tags;
	}
	
	// Handle nullable lastReviewedAt field explicitly
	if (changes.lastReviewedAt !== undefined) {
		updatePayload.lastReviewedAt = changes.lastReviewedAt;
	}
	
	const res = db.update(learningChunks).set(updatePayload).where(eq(learningChunks.id, id)).run();
	return res.changes ?? 0;
}

// Enhanced update functions for content and metadata management

export type UpdateChunkContentInput = {
	content: string;
	resetProgress?: boolean;
};

export type UpdateChunkContentResult = {
	success: boolean;
	chunk?: LearningChunkRow;
	progressReset?: boolean;
	error?: {
		type: "validation" | "not_found" | "database";
		message: string;
		field?: string;
	};
};

export async function updateChunkContent(id: string, input: UpdateChunkContentInput): Promise<UpdateChunkContentResult> {
	const db = getSql();

	try {
		// Get current chunk
		const currentChunk = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
		if (!currentChunk) {
			return {
				success: false,
				error: {
					type: "not_found",
					message: `Chunk with id "${id}" not found`,
				},
			};
		}

		const now = Date.now();
		const newVersion = (currentChunk.contentVersion || 1) + 1;

		// Prepare update data
		const updateData: Record<string, unknown> = {
			content: input.content,
			contentVersion: newVersion,
			contentUpdatedAt: now,
			updatedAt: now,
		};

		// Handle progress reset if requested
		if (input.resetProgress) {
			updateData.repetitions = 0;
			updateData.easeFactor = 2.5;
			updateData.nextReviewAt = now;
			updateData.lastReviewedAt = null;
		}

		// Update chunk
		const res = db.update(learningChunks).set(updateData).where(eq(learningChunks.id, id)).run();

		if (res.changes === 0) {
			return {
				success: false,
				error: {
					type: "database",
					message: "Failed to update chunk content",
				},
			};
		}

		// Return updated chunk
		const updatedChunk = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
		return {
			success: true,
			chunk: updatedChunk || undefined,
			progressReset: input.resetProgress || false,
		};

	} catch (error) {
		return {
			success: false,
			error: {
				type: "database",
				message: error instanceof Error ? error.message : "Unknown database error",
			},
		};
	}
}

export type UpdateChunkMetadataInput = {
	title?: string;
	difficulty?: number;
	prerequisites?: string[];
	tags?: string[];
	estimatedDuration?: number;
};

export type UpdateChunkMetadataResult = {
	success: boolean;
	chunk?: LearningChunkRow;
	error?: {
		type: "validation" | "not_found" | "database";
		message: string;
		field?: string;
	};
};

export async function updateChunkMetadata(id: string, input: UpdateChunkMetadataInput): Promise<UpdateChunkMetadataResult> {
	const db = getSql();

	try {
		// Check if chunk exists
		const currentChunk = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
		if (!currentChunk) {
			return {
				success: false,
				error: {
					type: "not_found",
					message: `Chunk with id "${id}" not found`,
				},
			};
		}

		// Prepare update data
		const updateData: Record<string, unknown> = {
			updatedAt: Date.now(),
		};

		// Update individual fields
		if (input.title !== undefined) {
			updateData.title = input.title;
		}
		if (input.difficulty !== undefined) {
			updateData.difficulty = input.difficulty;
		}
		if (input.estimatedDuration !== undefined) {
			updateData.estimatedDuration = input.estimatedDuration;
		}
		if (input.prerequisites !== undefined) {
			updateData.prerequisitesJson = encodeJsonArray(input.prerequisites);
		}
		if (input.tags !== undefined) {
			updateData.tagsJson = encodeJsonArray(input.tags);
		}

		// Update chunk
		const res = db.update(learningChunks).set(updateData).where(eq(learningChunks.id, id)).run();

		if (res.changes === 0) {
			return {
				success: false,
				error: {
					type: "database",
					message: "Failed to update chunk metadata",
				},
			};
		}

		// Return updated chunk
		const updatedChunk = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
		return {
			success: true,
			chunk: updatedChunk || undefined,
		};

	} catch (error) {
		return {
			success: false,
			error: {
				type: "database",
				message: error instanceof Error ? error.message : "Unknown database error",
			},
		};
	}
}

export type UpdateChunkWithProgressResetInput = {
	content?: string;
	title?: string;
	difficulty?: number;
	prerequisites?: string[];
	tags?: string[];
	estimatedDuration?: number;
	forceReset?: boolean;
};

export type UpdateChunkWithProgressResetResult = {
	success: boolean;
	chunk?: LearningChunkRow;
	progressReset?: boolean;
	error?: {
		type: "validation" | "not_found" | "database";
		message: string;
		field?: string;
	};
};

export async function updateChunkWithProgressReset(id: string, input: UpdateChunkWithProgressResetInput): Promise<UpdateChunkWithProgressResetResult> {
	const db = getSql();

	try {
		// Get current chunk
		const currentChunk = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
		if (!currentChunk) {
			return {
				success: false,
				error: {
					type: "not_found",
					message: `Chunk with id "${id}" not found`,
				},
			};
		}

		const now = Date.now();
		let shouldResetProgress = input.forceReset || false;

		// Check if content has changed significantly (simple heuristic)
		if (input.content && currentChunk.content) {
			const currentLength = currentChunk.content.length;
			const newLength = input.content.length;
			const contentChange = Math.abs(newLength - currentLength) / Math.max(currentLength, 1);

			// Reset if content changed by more than 50%
			if (contentChange > 0.5) {
				shouldResetProgress = true;
			}
		}

		// Prepare update data
		const updateData: Record<string, unknown> = {
			updatedAt: now,
		};

		// Update fields
		if (input.content !== undefined) {
			updateData.content = input.content;
			updateData.contentVersion = (currentChunk.contentVersion || 1) + 1;
			updateData.contentUpdatedAt = now;
		}
		if (input.title !== undefined) {
			updateData.title = input.title;
		}
		if (input.difficulty !== undefined) {
			updateData.difficulty = input.difficulty;
		}
		if (input.estimatedDuration !== undefined) {
			updateData.estimatedDuration = input.estimatedDuration;
		}
		if (input.prerequisites !== undefined) {
			updateData.prerequisitesJson = encodeJsonArray(input.prerequisites);
		}
		if (input.tags !== undefined) {
			updateData.tagsJson = encodeJsonArray(input.tags);
		}

		// Reset progress if needed
		if (shouldResetProgress) {
			updateData.repetitions = 0;
			updateData.easeFactor = 2.5;
			updateData.nextReviewAt = now;
			updateData.lastReviewedAt = null;
		}

		// Update chunk
		const res = db.update(learningChunks).set(updateData).where(eq(learningChunks.id, id)).run();

		if (res.changes === 0) {
			return {
				success: false,
				error: {
					type: "database",
					message: "Failed to update chunk",
				},
			};
		}

		// Return updated chunk
		const updatedChunk = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
		return {
			success: true,
			chunk: updatedChunk || undefined,
			progressReset: shouldResetProgress,
		};

	} catch (error) {
		return {
			success: false,
			error: {
				type: "database",
				message: error instanceof Error ? error.message : "Unknown database error",
			},
		};
	}
}

export type ChunkDependencyCleanup = {
        chunkId: string;
        chunkTitle: string;
        removedPrerequisites: string[];
        previousPrerequisites: string[];
        remainingPrerequisites: string[];
};

export type DeleteChunkResult = {
        success: boolean;
        chunk?: LearningChunkRow;
        removedDependencies?: ChunkDependencyCleanup[];
        error?: {
                type: "not_found" | "database";
                message: string;
                retryable?: boolean;
        };
};

export async function deleteChunk(id: string): Promise<DeleteChunkResult> {
        const db = getSql();

        try {
                const chunkToDelete = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();

                if (!chunkToDelete) {
                        return {
                                success: false,
                                error: {
                                        type: "not_found",
                                        message: `Chunk with id "${id}" not found`,
                                        retryable: false,
                                },
                        };
                }

                const dependencyUpdates = withTx<ChunkDependencyCleanup[]>((tx) => {
                        const updates: ChunkDependencyCleanup[] = [];
                        const now = Date.now();

                        const candidateChunks = tx
                                .select({
                                        id: learningChunks.id,
                                        title: learningChunks.title,
                                        prerequisitesJson: learningChunks.prerequisitesJson,
                                })
                                .from(learningChunks)
                                .all();

                        for (const candidate of candidateChunks) {
                                if (candidate.id === id) {
                                        continue;
                                }

                                const prerequisites = decodeJsonArray(candidate.prerequisitesJson);
                                if (prerequisites.length === 0) {
                                        continue;
                                }

                                const remaining = prerequisites.filter((prereqId) => prereqId !== id);
                                if (remaining.length === prerequisites.length) {
                                        continue;
                                }

                                const removedPrerequisites = prerequisites.filter((prereqId) => prereqId === id);
                                const removedCount = removedPrerequisites.length;
                                tx.update(learningChunks)
                                        .set({
                                                prerequisitesJson: encodeJsonArray(remaining),
                                                updatedAt: now,
                                        })
                                        .where(eq(learningChunks.id, candidate.id))
                                        .run();

                                updates.push({
                                        chunkId: candidate.id,
                                        chunkTitle: candidate.title,
                                        removedPrerequisites,
                                        previousPrerequisites: prerequisites,
                                        remainingPrerequisites: remaining,
                                });
                        }

                        const deleteResult = tx.delete(learningChunks).where(eq(learningChunks.id, id)).run();
                        if ((deleteResult.changes ?? 0) === 0) {
                                throw new Error("FAILED_TO_DELETE_CHUNK");
                        }

                        return updates;
                });

                prerequisiteReferenceValidator.clearCache();

                return {
                        success: true,
                        chunk: chunkToDelete,
                        removedDependencies: dependencyUpdates,
                };
        } catch (error) {
                return {
                        success: false,
                        error: {
                                type: "database",
                                message: error instanceof Error ? error.message : "Unknown database error",
                                retryable: true,
                        },
                };
        }
}

// Enhanced createChunk with auto-topic creation
export async function createChunkWithTopic(input: CreateChunkInput & { topicTitle?: string }): Promise<LearningChunkRow> {
	const db = getSql();
	
	// If topicTitle is provided but topicId is not, find existing topic or create a new one
	let finalTopicId = input.topicId;
	if (input.topicTitle && !finalTopicId) {
		// Check if topic already exists with the same title and subject
		const existingTopic = db.select()
			.from(learningTopics)
			.where(and(
				eq(learningTopics.title, input.topicTitle),
				eq(learningTopics.subject, input.subject)
			))
			.get();
		
		if (existingTopic) {
			finalTopicId = existingTopic.id;
		} else {
			// Create new topic
			finalTopicId = crypto.randomUUID();
			const now = Date.now();
			await db.insert(learningTopics).values({
				id: finalTopicId,
				title: input.topicTitle,
				subject: input.subject,
				createdAt: now,
				updatedAt: now,
			}).run();
		}
	}
	
	// Create the chunk
	await db.insert(learningChunks).values({
		...input,
		topicId: finalTopicId,
		prerequisitesJson: encodeJsonArray(input.prerequisites),
		tagsJson: encodeJsonArray(input.tags),
	}).run();
	
	// Return the created chunk
	const createdChunk = db.select().from(learningChunks).where(eq(learningChunks.id, input.id)).get();
	if (!createdChunk) {
		throw new Error(`Failed to create chunk with id: ${input.id}`);
	}
	
	return createdChunk;
}

// Content retrieval functions

export type ChunkContentResult = {
	content: string | null;
	contentVersion: number | null;
	contentUpdatedAt: number | null;
};

export async function getChunkContent(id: string): Promise<ChunkContentResult | null> {
	const db = getSql();
	const result = db.select({
		content: learningChunks.content,
		contentVersion: learningChunks.contentVersion,
		contentUpdatedAt: learningChunks.contentUpdatedAt,
	}).from(learningChunks).where(eq(learningChunks.id, id)).get();

	return result || null;
}

export async function getChunkWithContent(id: string): Promise<(LearningChunkRow & { topicTitle?: string | null }) | null> {
	const db = getSql();
	const result = db.select({
		id: learningChunks.id,
		topicId: learningChunks.topicId,
		title: learningChunks.title,
		subject: learningChunks.subject,
		difficulty: learningChunks.difficulty,
		nextReviewAt: learningChunks.nextReviewAt,
		easeFactor: learningChunks.easeFactor,
		repetitions: learningChunks.repetitions,
		lastReviewedAt: learningChunks.lastReviewedAt,
		estimatedDuration: learningChunks.estimatedDuration,
		chunkType: learningChunks.chunkType,
		prerequisitesJson: learningChunks.prerequisitesJson,
		tagsJson: learningChunks.tagsJson,
		content: learningChunks.content,
		contentVersion: learningChunks.contentVersion,
		contentUpdatedAt: learningChunks.contentUpdatedAt,
		createdAt: learningChunks.createdAt,
		updatedAt: learningChunks.updatedAt,
		topicTitle: learningTopics.title,
	})
	.from(learningChunks)
	.leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id))
	.where(eq(learningChunks.id, id))
	.get();

	return result || null;
}

export type ListChunksWithContentFilter = ListChunksFilter & {
	/**
	 * Whether to include content fields in the response.
	 * Content is expensive to retrieve and not included by default.
	 * Set to true to explicitly include content fields.
	 */
	includeContent?: boolean;
};

export async function listChunksWithContent(filter: ListChunksWithContentFilter = { includeContent: false }): Promise<LearningItem[]> {
	const db = getSql();
	const now = Date.now();
	const conditions: ReturnType<typeof eq>[] = [];

	if (filter.subject) conditions.push(eq(learningChunks.subject, filter.subject));
	if (filter.dueOnly) conditions.push(lte(learningChunks.nextReviewAt, now));

	// Build base query including all fields
	const baseQuery = db.select({
		id: learningChunks.id,
		topicId: learningChunks.topicId,
		title: learningChunks.title,
		subject: learningChunks.subject,
		difficulty: learningChunks.difficulty,
		nextReviewAt: learningChunks.nextReviewAt,
		easeFactor: learningChunks.easeFactor,
		repetitions: learningChunks.repetitions,
		lastReviewedAt: learningChunks.lastReviewedAt,
		estimatedDuration: learningChunks.estimatedDuration,
		chunkType: learningChunks.chunkType,
		prerequisitesJson: learningChunks.prerequisitesJson,
		tagsJson: learningChunks.tagsJson,
		...(filter.includeContent && {
			content: learningChunks.content,
			contentVersion: learningChunks.contentVersion,
			contentUpdatedAt: learningChunks.contentUpdatedAt,
		}),
		createdAt: learningChunks.createdAt,
		updatedAt: learningChunks.updatedAt,
		topicTitle: learningTopics.title,
	})
	.from(learningChunks)
	.leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id));

	if (conditions.length > 0) {
		const query = baseQuery.where(and(...conditions));
		if (filter.limit && filter.limit > 0) {
			const rows = query.limit(filter.limit).all();
			return rows.map(row => mapChunkRowToLearningItem(row as ChunkListRow));
		}
		const rows = query.all();
		return rows.map(row => mapChunkRowToLearningItem(row as ChunkListRow));
	}

	if (filter.limit && filter.limit > 0) {
		const rows = baseQuery.limit(filter.limit).all();
		return rows.map(row => mapChunkRowToLearningItem(row as ChunkListRow));
	}

	const rows = baseQuery.all();
	return rows.map(row => mapChunkRowToLearningItem(row as ChunkListRow));
}

// Process review result with SM-2 calculations
export async function processReviewResult(
	itemId: string, 
	quality: number, 
	options: {
		timeSpentMs?: number;
		consecutiveFailures?: number;
		daysOverdue?: number;
	}
): Promise<{ chunk: LearningChunkRow; isLeech: boolean }> {
	const db = getSql();
	
	// Get current chunk data
	const currentChunk = db.select().from(learningChunks).where(eq(learningChunks.id, itemId)).get();
	if (!currentChunk) {
		throw new Error(`Learning item not found: ${itemId}`);
	}
	
	// Calculate new SM-2 values
	const lastReviewedAt = currentChunk.lastReviewedAt || currentChunk.createdAt;
	const intervalDays = Math.floor((Date.now() - lastReviewedAt) / (1000 * 60 * 60 * 24)) || 1;
	
	const sm2Result = calculateNextReviewAdvanced({
		quality,
		repetitions: currentChunk.repetitions,
		easeFactor: currentChunk.easeFactor,
		interval: intervalDays,
		daysOverdue: options.daysOverdue || 0,
		consecutiveFailures: options.consecutiveFailures || 0
	});
	
	// Update chunk with new values
	const now = Date.now();
	const updateData = {
		easeFactor: sm2Result.easeFactor,
		repetitions: sm2Result.repetitions,
		nextReviewAt: new Date(sm2Result.nextReview).getTime(),
		lastReviewedAt: now,
		updatedAt: now
	};
	
	await db.update(learningChunks)
		.set(updateData)
		.where(eq(learningChunks.id, itemId))
		.run();
	
	// Create review schedule entry
	await scheduleReview({
		id: crypto.randomUUID(),
		chunkId: itemId,
		nextReviewAt: new Date(sm2Result.nextReview).getTime(),
		intervalDays: sm2Result.interval,
		repetitions: sm2Result.repetitions,
		easeFactor: sm2Result.easeFactor,
		createdAt: now,
		updatedAt: now
	});
	
	// Return updated chunk with leech information
	const updatedChunk = db.select().from(learningChunks).where(eq(learningChunks.id, itemId)).get();
	if (!updatedChunk) {
		throw new Error(`Failed to update chunk: ${itemId}`);
	}
	
	return {
		chunk: updatedChunk,
		isLeech: sm2Result.leech || false
	};
}
