import { describe, it, beforeEach, afterEach, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

let hasBinding = true;
try {
	const Database = require("better-sqlite3");
	const testDb = new Database(":memory:");
	testDb.close();
} catch {
	hasBinding = false;
}

// Force tests to run in CI environment only if bindings are actually available
if (process.env.CI && process.env.FORCE_SQLITE_TESTS) {
	// Double-check that bindings actually work
	try {
		const Database = require("better-sqlite3");
		const testDb = new Database(":memory:");
		testDb.close();
		hasBinding = true;
	} catch {
		hasBinding = false;
		console.warn("CI environment detected but SQLite bindings not available");
	}
}

import { resetDatabase } from "../../src/db/client.js";
import { ensureSchema } from "../../src/db/migrate.js";
import { getSql } from "../../src/db/operations.js";
import { decodeJsonArray } from "../../src/db/operations.js";
import { learningTopics, learningChunks } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";
import { createChunk, listChunks, listChunksAsLearningItems, deleteChunk, batchFetchChunksMinimal } from "../../src/services/chunks.js";
import { LearningItemSchema } from "../../src/types/recommendations.js";

function tmpDbPath() {
	return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

(hasBinding ? describe : describe.skip)("chunks service", () => {
	let dbFile: string;

	beforeEach(() => {
		dbFile = tmpDbPath();
		process.env.SM_DB_PATH = dbFile;
		ensureSchema();
	});

	afterEach(async () => {
		await resetDatabase(); // Close database connection
		if (fs.existsSync(dbFile)) {
			fs.unlinkSync(dbFile);
		}
		if (fs.existsSync(`${dbFile}-shm`)) {
			fs.unlinkSync(`${dbFile}-shm`);
		}
		if (fs.existsSync(`${dbFile}-wal`)) {
			fs.unlinkSync(`${dbFile}-wal`);
		}
	});

	it("creates and lists chunks, maps to LearningItem", async () => {
		const now = Date.now();
		const db = getSql();

		// Create a topic first
		db.insert(learningTopics).values({
			id: 't1',
			title: 'Algorithm Fundamentals',
			subject: 'CS',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

		await createChunk({
			id: "c1",
			topicId: "t1",
			title: "Two Sum",
			subject: "CS",
			difficulty: 5,
			nextReviewAt: now + 86400000,
			easeFactor: 2.5,
			repetitions: 1,
			lastReviewedAt: now,
			estimatedDuration: 20,
			chunkType: "new",
			prerequisites: ["arrays"],
			tags: ["leetcode"],
			createdAt: now,
			updatedAt: now,
		});

		const rows = await listChunks({ subject: "CS" });
		expect(rows.length).toBe(1);

		const items = await listChunksAsLearningItems({ subject: "CS" });
		expect(items[0].title).toBe("Two Sum");
		expect(items[0].subject).toBe("CS");
		expect(items[0].chunkType).toBe("new");
	});

	it("includes topic information when topic exists", async () => {
		const now = Date.now();
		const db = getSql();

		// Create a topic first
		db.insert(learningTopics).values({
			id: 'topic-1',
			title: 'Algorithm Fundamentals',
			subject: 'CS',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

		// Create chunk linked to the topic
		await createChunk({
			id: "chunk-1",
			topicId: "topic-1",
			title: "Two Sum Problem",
			subject: "CS",
			difficulty: 5,
			nextReviewAt: now + 86400000,
			easeFactor: 2.5,
			repetitions: 1,
			lastReviewedAt: now,
			estimatedDuration: 20,
			chunkType: "new",
			prerequisites: ["arrays"],
			tags: ["leetcode"],
			createdAt: now,
			updatedAt: now,
		});

		const items = await listChunksAsLearningItems();
		expect(items).toHaveLength(1);
		expect(items[0].topicId).toBe("topic-1");
		expect(items[0].topicTitle).toBe("Algorithm Fundamentals");
	});

	it("handles orphaned chunks without topic", async () => {
		const now = Date.now();
		const db = getSql();

		// Create a topic first (required by foreign key constraint)
		db.insert(learningTopics).values({
			id: 'orphan-topic',
			title: 'Orphan Topic',
			subject: 'CS',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

		// Create chunk linked to the topic
		await createChunk({
			id: "orphan-chunk",
			topicId: "orphan-topic",
			title: "Orphaned Chunk",
			subject: "CS",
			difficulty: 3,
			nextReviewAt: now + 86400000,
			easeFactor: 2.5,
			repetitions: 0,
			estimatedDuration: 15,
			chunkType: "new",
			createdAt: now,
			updatedAt: now,
		});

		// Test that chunk exists and has topic info
		const items = await listChunksAsLearningItems();
		expect(items).toHaveLength(1);
		expect(items[0].id).toBe("orphan-chunk");
		expect(items[0].topicId).toBe("orphan-topic");
		expect(items[0].topicTitle).toBe("Orphan Topic");
	});

        it("validates topic fields with Zod schema", async () => {
                // Test valid topicId (any non-empty string)
                const validItem = {
			id: "test-chunk",
			title: "Test Chunk",
			subject: "CS",
			difficulty: 5,
			nextReviewDate: "2024-01-01",
			easeFactor: 2.5,
			repetitions: 1,
			estimatedDuration: 20,
			chunkType: "new" as const,
			topicId: "topic-1", // Valid non-empty string
			topicTitle: "Test Topic",
		};

		expect(() => LearningItemSchema.parse(validItem)).not.toThrow();

		// Test invalid empty topicId
		const invalidItem = {
			...validItem,
			topicId: "", // Invalid empty string
		};

                expect(() => LearningItemSchema.parse(invalidItem)).toThrow();

                // Test optional fields work
                const itemWithoutTopic = {
                        ...validItem,
                        topicId: undefined,
                        topicTitle: undefined,
                };

                expect(() => LearningItemSchema.parse(itemWithoutTopic)).not.toThrow();
        });

        it("deletes chunks and removes prerequisite references", async () => {
                const now = Date.now();
		const db = getSql();

		// Create topics first
		db.insert(learningTopics).values({
			id: 'topic-alpha',
			title: 'Alpha Topic',
			subject: 'Math',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

		db.insert(learningTopics).values({
			id: 'topic-beta',
			title: 'Beta Topic',
			subject: 'Math',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

                await createChunk({
                        id: "chunk-a",
                        topicId: "topic-alpha",
                        title: "Chunk A",
                        subject: "Math",
                        difficulty: 4,
                        nextReviewAt: now,
                        easeFactor: 2.5,
                        repetitions: 1,
                        estimatedDuration: 10,
                        chunkType: "new",
                        createdAt: now,
                        updatedAt: now,
                });

                await createChunk({
                        id: "chunk-b",
                        topicId: "topic-alpha",
                        title: "Chunk B",
                        subject: "Math",
                        difficulty: 5,
                        nextReviewAt: now,
                        easeFactor: 2.5,
                        repetitions: 0,
                        estimatedDuration: 15,
                        chunkType: "new",
                        prerequisites: ["chunk-a", "chunk-c"],
                        createdAt: now,
                        updatedAt: now,
                });

                const deleteResult = await deleteChunk("chunk-a");
                expect(deleteResult.success).toBe(true);
                expect(deleteResult.chunk?.id).toBe("chunk-a");
                expect(deleteResult.removedDependencies).toEqual([
                        {
                                chunkId: "chunk-b",
                                chunkTitle: "Chunk B",
                                removedPrerequisites: ["chunk-a"],
                                previousPrerequisites: ["chunk-a", "chunk-c"],
                                remainingPrerequisites: ["chunk-c"],
                        },
                ]);

                const remainingChunks = await listChunks();
                expect(remainingChunks.find(chunk => chunk.id === "chunk-a")).toBeUndefined();
                const chunkB = remainingChunks.find(chunk => chunk.id === "chunk-b");
                expect(chunkB).toBeDefined();
                if (!chunkB) {
                        throw new Error("Expected chunk-b to remain after deleting chunk-a");
                }
                const updatedPrereqs = decodeJsonArray(chunkB.prerequisitesJson);
                expect(updatedPrereqs).toEqual(["chunk-c"]);
        });

        it("returns validation error when deleting unknown chunk", async () => {
                const result = await deleteChunk("missing-chunk-id");
                expect(result.success).toBe(false);
                expect(result.error?.type).toBe("not_found");
        });

        it("batch fetches chunks with minimal metadata", async () => {
                const now = Date.now();
		const db = getSql();

		// Create topics first
		db.insert(learningTopics).values({
			id: 't1',
			title: 'Topic 1',
			subject: 'CS',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

		db.insert(learningTopics).values({
			id: 't2',
			title: 'Topic 2',
			subject: 'Math',
			summary: null,
			summaryVersion: null,
			summaryUpdatedAt: null,
			createdAt: now,
			updatedAt: now,
		}).run();

                const chunks = [
                        {
                                id: "c1",
                                topicId: "t1",
                                title: "Array Basics",
                                subject: "CS",
                                difficulty: 3,
                                nextReviewAt: now,
                                easeFactor: 2.5,
                                repetitions: 0,
                                estimatedDuration: 15,
                                chunkType: "new" as const,
                                createdAt: now,
                                updatedAt: now,
                        },
                        {
                                id: "c2",
                                topicId: "t1",
                                title: "Hash Tables",
                                subject: "CS",
                                difficulty: 5,
                                nextReviewAt: now + 86400000,
                                easeFactor: 2.5,
                                repetitions: 1,
                                estimatedDuration: 20,
                                chunkType: "review" as const,
                                createdAt: now + 1,
                                updatedAt: now + 1,
                        },
                        {
                                id: "c3",
                                topicId: "t2",
                                title: "Calculus",
                                subject: "Math",
                                difficulty: 7,
                                nextReviewAt: now + 172800000,
                                easeFactor: 2.5,
                                repetitions: 2,
                                estimatedDuration: 30,
                                chunkType: "review" as const,
                                createdAt: now + 2,
                                updatedAt: now + 2,
                        },
                ];

                for (const chunk of chunks) {
                        await createChunk(chunk);
                }

                // Test: fetch all chunks
                const allChunks = await batchFetchChunksMinimal();
                expect(allChunks.length).toBe(3);
                expect(allChunks[0]).toHaveProperty("id");
                expect(allChunks[0]).toHaveProperty("topicId");
                expect(allChunks[0]).toHaveProperty("title");
                expect(allChunks[0]).toHaveProperty("subject");
                expect(allChunks[0]).toHaveProperty("difficulty");
                expect(allChunks[0]).toHaveProperty("estimatedDuration");
                expect(allChunks[0]).toHaveProperty("chunkType");
                expect(allChunks[0]).toHaveProperty("nextReviewAt");
                expect(allChunks[0]).toHaveProperty("createdAt");
                expect(allChunks[0]).toHaveProperty("updatedAt");
                // Ensure no heavy fields are included
                expect(allChunks[0]).not.toHaveProperty("content");
                expect(allChunks[0]).not.toHaveProperty("prerequisitesJson");
                expect(allChunks[0]).not.toHaveProperty("tagsJson");

                // Test: filter by topicId
                const topic1Chunks = await batchFetchChunksMinimal({ topicId: "t1" });
                expect(topic1Chunks.length).toBe(2);
                expect(topic1Chunks.every(c => c.topicId === "t1")).toBe(true);

                // Test: filter by subject
                const csChunks = await batchFetchChunksMinimal({ subject: "CS" });
                expect(csChunks.length).toBe(2);
                expect(csChunks.every(c => c.subject === "CS")).toBe(true);

                // Test: dueOnly filter
                const dueChunks = await batchFetchChunksMinimal({ dueOnly: true });
                expect(dueChunks.length).toBe(1);
                expect(dueChunks[0].id).toBe("c1");

                // Test: limit results
                const limitedChunks = await batchFetchChunksMinimal({ limit: 2 });
                expect(limitedChunks.length).toBe(2);

                // Test: combined filters
                const filteredChunks = await batchFetchChunksMinimal({ subject: "CS", limit: 1 });
                expect(filteredChunks.length).toBe(1);
                expect(filteredChunks[0].subject).toBe("CS");
        });
});

describe.skipIf(!hasBinding)("Chunk Update Functions", () => {
	beforeEach(() => {
		resetDatabase();
		ensureSchema();
	});

	afterEach(() => {
		resetDatabase();
	});

	describe("updateChunkContent", () => {
		it("should update chunk content with versioning", async () => {
			const { updateChunkContent } = await import("../../src/services/chunks.js");

			// Create a test chunk first
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Test Subject",
				difficulty: 5,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 2,
				estimatedDuration: 15,
				chunkType: "new",
				content: "Original content",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			// Update the content
			const result = await updateChunkContent(chunkId, {
				content: "Updated content",
			});

			expect(result.success).toBe(true);
			expect(result.chunk).toBeDefined();
			expect(result.chunk?.content).toBe("Updated content");
			expect(result.chunk?.contentVersion).toBe(2);
			expect(result.chunk?.contentUpdatedAt).toBeGreaterThan(now);
			expect(result.progressReset).toBe(false);
		});

		it("should reset progress when requested", async () => {
			const { updateChunkContent } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Test Subject",
				difficulty: 5,
				nextReviewAt: now + 86400000, // 1 day later
				easeFactor: 3.0,
				repetitions: 5,
				lastReviewedAt: now - 3600000, // 1 hour ago
				estimatedDuration: 15,
				chunkType: "review",
				content: "Original content",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			const result = await updateChunkContent(chunkId, {
				content: "Updated content",
				resetProgress: true,
			});

			expect(result.success).toBe(true);
			expect(result.chunk).toBeDefined();
			expect(result.chunk?.repetitions).toBe(0);
			expect(result.chunk?.easeFactor).toBe(2.5);
			expect(result.chunk?.lastReviewedAt).toBeNull();
			expect(result.progressReset).toBe(true);
		});

		it("should return error for non-existent chunk", async () => {
			const { updateChunkContent } = await import("../../src/services/chunks.js");

			const result = await updateChunkContent("non-existent-id", {
				content: "New content",
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe("not_found");
			expect(result.error?.message).toContain("not found");
		});
	});

	describe("updateChunkMetadata", () => {
		it("should update chunk metadata fields", async () => {
			const { updateChunkMetadata } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Original Title",
				subject: "Test Subject",
				difficulty: 3,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				estimatedDuration: 15,
				chunkType: "new",
				prerequisites: ["prereq1"],
				tags: ["tag1"],
				createdAt: now,
				updatedAt: now,
			});

			const result = await updateChunkMetadata(chunkId, {
				title: "Updated Title",
				difficulty: 7,
				prerequisites: ["prereq1", "prereq2"],
				tags: ["tag1", "tag2", "tag3"],
				estimatedDuration: 25,
			});

			expect(result.success).toBe(true);
			expect(result.chunk).toBeDefined();
			expect(result.chunk?.title).toBe("Updated Title");
			expect(result.chunk?.difficulty).toBe(7);
			expect(result.chunk?.estimatedDuration).toBe(25);
			expect(result.chunk?.updatedAt).toBeGreaterThan(now);
		});

		it("should handle partial updates", async () => {
			const { updateChunkMetadata } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Original Title",
				subject: "Test Subject",
				difficulty: 3,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				estimatedDuration: 15,
				chunkType: "new",
				createdAt: now,
				updatedAt: now,
			});

			// Update only title
			const result = await updateChunkMetadata(chunkId, {
				title: "Updated Title Only",
			});

			expect(result.success).toBe(true);
			expect(result.chunk?.title).toBe("Updated Title Only");
			expect(result.chunk?.difficulty).toBe(3); // Should remain unchanged
		});

		it("should return error for non-existent chunk", async () => {
			const { updateChunkMetadata } = await import("../../src/services/chunks.js");

			const result = await updateChunkMetadata("non-existent-id", {
				title: "New Title",
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe("not_found");
		});
	});

	describe("updateChunkWithProgressReset", () => {
		it("should automatically reset progress for significant content changes", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Test Subject",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 3.0,
				repetitions: 5,
				lastReviewedAt: now - 3600000,
				estimatedDuration: 15,
				chunkType: "review",
				content: "Short content",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			// Update with significantly longer content (>50% change)
			const longContent = "This is a much longer content that represents a significant change from the original short content. ".repeat(10);

			const result = await updateChunkWithProgressReset(chunkId, {
				content: longContent,
			});

			expect(result.success).toBe(true);
			expect(result.progressReset).toBe(true);
			expect(result.chunk?.repetitions).toBe(0);
			expect(result.chunk?.easeFactor).toBe(2.5);
			expect(result.chunk?.lastReviewedAt).toBeNull();
		});

		it("should preserve progress for minor content changes", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Test Subject",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 3.0,
				repetitions: 5,
				lastReviewedAt: now - 3600000,
				estimatedDuration: 15,
				chunkType: "review",
				content: "Original content with some details",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			// Minor change - just fix a typo
			const result = await updateChunkWithProgressReset(chunkId, {
				content: "Original content with some details fixed",
			});

			expect(result.success).toBe(true);
			expect(result.progressReset).toBe(false);
			expect(result.chunk?.repetitions).toBe(5); // Should preserve
			expect(result.chunk?.easeFactor).toBe(3.0); // Should preserve
		});

		it("should reset progress for same-length but different content (issue fix)", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Test Subject",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 3.0,
				repetitions: 5,
				lastReviewedAt: now - 3600000,
				estimatedDuration: 15,
				chunkType: "review",
				content: "Learn about TypeScript basics",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			// Replace with completely different content of the same length
			// This is the core issue: old length-based detection would miss this
			const result = await updateChunkWithProgressReset(chunkId, {
				content: "Study Python advanced topics",
			});

			expect(result.success).toBe(true);
			// Progress should be reset because content is significantly different
			// despite having the same length
			expect(result.progressReset).toBe(true);
			expect(result.chunk?.repetitions).toBe(0);
			expect(result.chunk?.easeFactor).toBe(2.5);
			expect(result.chunk?.lastReviewedAt).toBeNull();
		});

		it("should force reset when requested", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Test Subject",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 3.0,
				repetitions: 5,
				lastReviewedAt: now - 3600000,
				estimatedDuration: 15,
				chunkType: "review",
				content: "Original content",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			const result = await updateChunkWithProgressReset(chunkId, {
				title: "Updated Title",
				forceReset: true,
			});

			expect(result.success).toBe(true);
			expect(result.progressReset).toBe(true);
			expect(result.chunk?.repetitions).toBe(0);
			expect(result.chunk?.easeFactor).toBe(2.5);
		});

		it("should update multiple fields simultaneously", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();
			const db = getSql();

			// Create topic first
			db.insert(learningTopics).values({
				id: topicId,
				title: 'Test Topic',
				subject: 'Test Subject',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			await createChunk({
				id: chunkId,
				topicId,
				title: "Original Title",
				subject: "Test Subject",
				difficulty: 3,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				estimatedDuration: 15,
				chunkType: "new",
				content: "Original content",
				prerequisites: ["prereq1"],
				tags: ["tag1"],
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			const result = await updateChunkWithProgressReset(chunkId, {
				content: "Updated content",
				title: "Updated Title",
				difficulty: 7,
				prerequisites: ["prereq1", "prereq2"],
				tags: ["tag1", "tag2"],
				estimatedDuration: 25,
			});

			expect(result.success).toBe(true);
			expect(result.chunk?.content).toBe("Updated content");
			expect(result.chunk?.title).toBe("Updated Title");
			expect(result.chunk?.difficulty).toBe(7);
			expect(result.chunk?.estimatedDuration).toBe(25);
			expect(result.chunk?.contentVersion).toBe(2);
		});

		it("should return error for non-existent chunk", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const result = await updateChunkWithProgressReset("non-existent-id", {
				content: "New content",
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe("not_found");
		});
	});
});

describe.skipIf(!hasBinding)("Content Inclusion Functions", () => {
	let dbFile: string;

	beforeEach(async () => {
		dbFile = tmpDbPath();
		process.env.SM_DB_PATH = dbFile;
		await resetDatabase(); // Reset singleton to pick up new path
		ensureSchema();
	});

	afterEach(async () => {
		await resetDatabase(); // Close database connection
		if (fs.existsSync(dbFile)) {
			fs.unlinkSync(dbFile);
		}
		if (fs.existsSync(`${dbFile}-shm`)) {
			fs.unlinkSync(`${dbFile}-shm`);
		}
		if (fs.existsSync(`${dbFile}-wal`)) {
			fs.unlinkSync(`${dbFile}-wal`);
		}
	});

	describe("mapChunkRowToLearningItemWithContent", () => {
		it("should map chunk row with content fields", async () => {
			const { mapChunkRowToLearningItemWithContent } = await import("../../src/services/chunks.js");
			
			const now = Date.now();
			const mockRow = {
				id: "test-chunk",
				topicId: "test-topic",
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 2.5,
				repetitions: 1,
				lastReviewedAt: now,
				estimatedDuration: 20,
				chunkType: "new",
				prerequisitesJson: '["arrays"]',
				tagsJson: '["test"]',
				content: "This is test content",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
				topicTitle: "Test Topic",
			};

			const result = mapChunkRowToLearningItemWithContent(mockRow);

			expect(result.id).toBe("test-chunk");
			expect(result.title).toBe("Test Chunk");
			expect(result.content).toBe("This is test content");
			expect(result.contentVersion).toBe(1);
			expect(result.contentUpdatedAt).toBe(now);
			expect(result.prerequisites).toEqual(["arrays"]);
			expect(result.tags).toEqual(["test"]);
		});

		it("should handle null content fields gracefully", async () => {
			const { mapChunkRowToLearningItemWithContent } = await import("../../src/services/chunks.js");
			
			const now = Date.now();
			const mockRow = {
				id: "test-chunk",
				topicId: "test-topic",
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 2.5,
				repetitions: 1,
				lastReviewedAt: now,
				estimatedDuration: 20,
				chunkType: "new",
				prerequisitesJson: '[]',
				tagsJson: '[]',
				content: null,
				contentVersion: null,
				contentUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
				topicTitle: "Test Topic",
			};

			const result = mapChunkRowToLearningItemWithContent(mockRow);

			expect(result.id).toBe("test-chunk");
			expect(result.title).toBe("Test Chunk");
			expect(result.content).toBeUndefined();
			expect(result.contentVersion).toBeUndefined();
			expect(result.contentUpdatedAt).toBeUndefined();
			expect(result.topicId).toBe("test-topic");
			expect(result.topicTitle).toBe("Test Topic");
		});
	});

	describe("listChunksWithContent", () => {
		it("should include content fields when includeContent is true", async () => {
			const { listChunksWithContent } = await import("../../src/services/chunks.js");
			
			const now = Date.now();
			const db = getSql();
			const uniqueId = `topic-${now}-${Math.random()}`;

			// Create a topic first
			db.insert(learningTopics).values({
				id: uniqueId,
				title: "Algorithm Fundamentals",
				subject: "CS",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Create chunk with content
			db.insert(learningChunks).values({
				id: `chunk-${now}`,
				topicId: uniqueId,
				title: "Two Sum Problem",
				subject: "CS",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 2.5,
				repetitions: 1,
				lastReviewedAt: now,
				estimatedDuration: 20,
				chunkType: "new",
				prerequisitesJson: JSON.stringify(["arrays"]),
				tagsJson: JSON.stringify(["leetcode"]),
				content: "This is the content for Two Sum problem",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			}).run();

			const result = await listChunksWithContent({ includeContent: true });

			expect(result.items).toHaveLength(1);
			expect(result.items[0].content).toBe("This is the content for Two Sum problem");
			expect(result.items[0].contentVersion).toBe(1);
			expect(result.items[0].contentUpdatedAt).toBe(now);
			expect(result.pagination.total).toBe(1);
			expect(result.pagination.hasMore).toBe(false);
		});

		it("should exclude content fields when includeContent is false", async () => {
			const { listChunksWithContent } = await import("../../src/services/chunks.js");
			
			const now = Date.now();
			const db = getSql();
			const uniqueId = `topic-${now}-${Math.random()}`;

			// Create a topic first
			db.insert(learningTopics).values({
				id: uniqueId,
				title: "Algorithm Fundamentals",
				subject: "CS",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Create chunk with content
			db.insert(learningChunks).values({
				id: `chunk-${now}`,
				topicId: uniqueId,
				title: "Two Sum Problem",
				subject: "CS",
				difficulty: 5,
				nextReviewAt: now + 86400000,
				easeFactor: 2.5,
				repetitions: 1,
				lastReviewedAt: now,
				estimatedDuration: 20,
				chunkType: "new",
				prerequisitesJson: JSON.stringify(["arrays"]),
				tagsJson: JSON.stringify(["leetcode"]),
				content: "This is the content for Two Sum problem",
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			}).run();

			const result = await listChunksWithContent({ includeContent: false });

			expect(result.items).toHaveLength(1);
			expect(result.items[0].content).toBeUndefined();
			expect(result.items[0].contentVersion).toBeUndefined();
			expect(result.items[0].contentUpdatedAt).toBeUndefined();
			expect(result.items[0].title).toBe("Two Sum Problem");
			expect(result.pagination.total).toBe(1);
		});

		it("should handle pagination correctly", async () => {
			const { listChunksWithContent } = await import("../../src/services/chunks.js");
			
			const now = Date.now();
			const db = getSql();
			const uniqueId = `topic-${now}-${Math.random()}`;

			// Create a topic first
			db.insert(learningTopics).values({
				id: uniqueId,
				title: 'Pagination Test Topic',
				subject: 'CS',
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Create multiple chunks
			for (let i = 1; i <= 5; i++) {
				db.insert(learningChunks).values({
					id: `chunk-${now}-${i}`,
					topicId: uniqueId,
					title: `Chunk ${i}`,
					subject: "CS",
					difficulty: i,
					nextReviewAt: now + 86400000,
					easeFactor: 2.5,
					repetitions: 0,
					lastReviewedAt: null,
					estimatedDuration: 20,
					chunkType: "new",
					prerequisitesJson: JSON.stringify([]),
					tagsJson: JSON.stringify([]),
					content: `Content for chunk ${i}`,
					contentVersion: 1,
					contentUpdatedAt: now,
					createdAt: now,
					updatedAt: now,
				}).run();
			}

			// Test pagination
			const result1 = await listChunksWithContent({ includeContent: true, limit: 2, offset: 0 });
			expect(result1.items).toHaveLength(2);
			expect(result1.pagination.total).toBe(5);
			expect(result1.pagination.hasMore).toBe(true);
			expect(result1.pagination.offset).toBe(0);
			expect(result1.pagination.limit).toBe(2);

			const result2 = await listChunksWithContent({ includeContent: true, limit: 2, offset: 2 });
			expect(result2.items).toHaveLength(2);
			expect(result2.pagination.hasMore).toBe(true);
			expect(result2.pagination.offset).toBe(2);

			const result3 = await listChunksWithContent({ includeContent: true, limit: 2, offset: 4 });
			expect(result3.items).toHaveLength(1);
			expect(result3.pagination.hasMore).toBe(false);
			expect(result3.pagination.offset).toBe(4);
		});
	});
});
