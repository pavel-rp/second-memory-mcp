import { describe, it, beforeEach, afterEach, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

let hasBinding = true;
try {
	const Database = require("better-sqlite3");
	new Database(":memory:");
} catch {
	hasBinding = false;
}

import { getDb, resetDatabase } from "../../src/db/client.js";
import { decodeJsonArray } from "../../src/db/operations.js";
import { createChunk, listChunks, listChunksAsLearningItems, deleteChunk, batchFetchChunksMinimal } from "../../src/services/chunks.js";
import { LearningItemSchema } from "../../src/types/recommendations.js";

function ensureSchema() {
	const db = getDb();
	db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		summary TEXT,
		summary_version INTEGER,
		summary_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS learning_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		difficulty INTEGER NOT NULL,
		next_review_at INTEGER NOT NULL,
		ease_factor REAL NOT NULL,
		repetitions INTEGER NOT NULL,
		last_reviewed_at INTEGER,
		estimated_duration INTEGER NOT NULL,
		chunk_type TEXT NOT NULL,
		prerequisites_json TEXT,
		tags_json TEXT,
		content TEXT,
		content_version INTEGER,
		content_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	`);
}

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
		const db = getDb();

		// Create a topic first
		db.exec(`
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES ('topic-1', 'Algorithm Fundamentals', 'CS', NULL, NULL, NULL, ${now}, ${now})
		`);

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

		// Create chunk with non-existent topicId
		await createChunk({
			id: "orphan-chunk",
			topicId: "non-existent-topic",
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

		const items = await listChunksAsLearningItems();
		expect(items).toHaveLength(1);
		expect(items[0].id).toBe("orphan-chunk");
		expect(items[0].topicId).toBeUndefined();
		expect(items[0].topicTitle).toBeUndefined();
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

		it("should force reset when requested", async () => {
			const { updateChunkWithProgressReset } = await import("../../src/services/chunks.js");

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();

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
