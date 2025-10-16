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

// Force tests to run in CI environment
if (process.env.CI && process.env.FORCE_SQLITE_TESTS) {
	hasBinding = true;
}

import { resetDatabase } from "../../src/db/client.js";
import { ensureSchema } from "../../src/db/migrate.js";
import { getChunkContent, getChunkWithContent, createChunk } from "../../src/services/chunks.js";
import { topicCreationService } from "../../src/services/topic-creation.js";
import { validateContent, sanitizeContent } from "../../src/utils/content-validation.js";
import { getSql } from "../../src/db/operations.js";
import { learningTopics, learningChunks } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

function tmpDbPath() {
	return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

describe("Content Persistence", () => {
	const skipTests = !hasBinding;
	let dbFile: string;

	beforeEach(async () => {
		if (skipTests) return;
		dbFile = tmpDbPath();
		process.env.SM_DB_PATH = dbFile;
		await resetDatabase(); // Reset singleton to pick up new path
		ensureSchema();
	});

	afterEach(async () => {
		if (skipTests) return;
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

	describe("Content Validation", () => {
		it("should validate chunk content size", () => {
			if (skipTests) return;

			const validContent = "This is valid chunk content with examples and explanations.";
			const result = validateContent(validContent, "chunk");
			expect(result.success).toBe(true);
			expect(result.sanitizedContent).toBe(validContent);
		});

		it("should reject content that is too short", () => {
			if (skipTests) return;

			const shortContent = "";
			const result = validateContent(shortContent, "chunk");
			expect(result.success).toBe(false);
			expect(result.error).toContain("non-empty string");
		});

		it("should reject content that is too long", () => {
			if (skipTests) return;

			// Create content that exceeds MAX_CONTENT_SIZE (50000 chars)
			const longContent = "a".repeat(50001);
			const result = validateContent(longContent, "chunk");
			expect(result.success).toBe(false);
			expect(result.error).toContain("cannot exceed");
		});

		it("should reject content with script tags", () => {
			if (skipTests) return;

			const maliciousContent = "<script>alert('hack')</script>Valid content here";
			const result = validateContent(maliciousContent, "chunk");
			expect(result.success).toBe(false);
			expect(result.error).toContain("script tags");
		});

		it("should sanitize content properly", () => {
			if (skipTests) return;

			const unsafeContent = "<script>alert('test')</script>Safe content with <b>bold</b> text";
			const sanitized = sanitizeContent(unsafeContent);
			expect(sanitized).not.toContain("<script>");
			expect(sanitized).toContain("Safe content");
		});

		it("should validate summary content with smaller size limit", () => {
			if (skipTests) return;

			const validSummary = "This is a valid topic summary.";
			const result = validateContent(validSummary, "summary");
			expect(result.success).toBe(true);

			// Create summary that exceeds MAX_SUMMARY_SIZE (5000 chars)
			const longSummary = "a".repeat(5001);
			const longResult = validateContent(longSummary, "summary");
			expect(longResult.success).toBe(false);
			expect(longResult.error).toContain("Topic summary");
		});
	});

	describe("Chunk Content Persistence", () => {
		it("should persist chunk content during creation", async () => {
			if (skipTests) return;

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const content = "This is test chunk content with examples and explanations.";
			const now = Date.now();

			// Create a topic first
			const db = getSql();
			db.insert(learningTopics).values({
				id: topicId,
				title: "Test Topic",
				subject: "Testing",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Create chunk with content
			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				estimatedDuration: 15,
				chunkType: "new",
				prerequisites: [],
				tags: [],
				content,
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			// Verify content was persisted
			const chunk = db.select().from(learningChunks).where(eq(learningChunks.id, chunkId)).get();
			expect(chunk).toBeDefined();
			expect(chunk?.content).toBe(content);
			expect(chunk?.contentVersion).toBe(1);
			expect(chunk?.contentUpdatedAt).toBe(now);
		});

		it("should retrieve chunk content by ID", async () => {
			if (skipTests) return;

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const content = "Test content for retrieval";
			const now = Date.now();

			// Create topic and chunk with content
			const db = getSql();
			db.insert(learningTopics).values({
				id: topicId,
				title: "Test Topic",
				subject: "Testing",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			db.insert(learningChunks).values({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				lastReviewedAt: null,
				estimatedDuration: 15,
				chunkType: "new",
				prerequisitesJson: "[]",
				tagsJson: "[]",
				content,
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Retrieve content
			const retrievedContent = await getChunkContent(chunkId);
			expect(retrievedContent).toBeDefined();
			expect(retrievedContent?.content).toBe(content);
			expect(retrievedContent?.contentVersion).toBe(1);
			expect(retrievedContent?.contentUpdatedAt).toBe(now);
		});

		it("should return null for non-existent chunk", async () => {
			if (skipTests) return;

			const nonExistentId = crypto.randomUUID();
			const result = await getChunkContent(nonExistentId);
			expect(result).toBeNull();
		});

		it("should retrieve chunk with all content fields", async () => {
			if (skipTests) return;

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const content = "Full chunk content with metadata";
			const now = Date.now();

			// Create topic and chunk
			const db = getSql();
			db.insert(learningTopics).values({
				id: topicId,
				title: "Test Topic",
				subject: "Testing",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			db.insert(learningChunks).values({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				lastReviewedAt: null,
				estimatedDuration: 15,
				chunkType: "new",
				prerequisitesJson: "[]",
				tagsJson: "[]",
				content,
				contentVersion: 1,
				contentUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Retrieve chunk with content
			const fullChunk = await getChunkWithContent(chunkId);
			expect(fullChunk).toBeDefined();
			expect(fullChunk?.content).toBe(content);
			expect(fullChunk?.contentVersion).toBe(1);
			expect(fullChunk?.title).toBe("Test Chunk");
			expect(fullChunk?.topicTitle).toBe("Test Topic");
		});
	});

	describe("Topic Summary Persistence", () => {
		it("should persist topic summary during creation", async () => {
			if (skipTests) return;

			const summary = "This is a comprehensive topic summary explaining the key learning objectives.";
			const result = await topicCreationService.createTopicWithChunks({
				topicTitle: "Test Topic with Summary",
				topicDescription: "A test topic",
				subject: "Testing",
				topicSummary: summary,
				chunks: [
					{
						id: crypto.randomUUID(),
						title: "Test Chunk",
						content: "Test chunk content",
						difficulty: 5,
						prerequisites: [],
						estimatedDuration: 15,
						order: 1,
						tags: [],
						chunkType: "new" as const,
					},
				],
			});

			expect(result.success).toBe(true);
			expect(result.topic?.topicSummary).toBe(summary);

			// Verify in database
			const db = getSql();
			const topic = db.select().from(learningTopics).where(eq(learningTopics.id, result.topic!.topicId)).get();
			expect(topic?.summary).toBe(summary);
			expect(topic?.summaryVersion).toBe(1);
			expect(topic?.summaryUpdatedAt).toBeTypeOf("number");
		});

		it("should handle topic creation without summary", async () => {
			if (skipTests) return;

			const result = await topicCreationService.createTopicWithChunks({
				topicTitle: "Test Topic without Summary",
				topicDescription: "A test topic",
				subject: "Testing",
				// No topicSummary provided
				chunks: [
					{
						id: crypto.randomUUID(),
						title: "Test Chunk",
						content: "Test chunk content",
						difficulty: 5,
						prerequisites: [],
						estimatedDuration: 15,
						order: 1,
						tags: [],
						chunkType: "new" as const,
					},
				],
			});

			expect(result.success).toBe(true);
			expect(result.topic?.topicSummary).toBeUndefined();

			// Verify in database
			const db = getSql();
			const topic = db.select().from(learningTopics).where(eq(learningTopics.id, result.topic!.topicId)).get();
			expect(topic?.summary).toBeNull();
			expect(topic?.summaryVersion).toBeNull();
			expect(topic?.summaryUpdatedAt).toBeNull();
		});
	});

	describe("Content Error Handling", () => {
		it("should handle chunk creation with null content gracefully", async () => {
			if (skipTests) return;

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();

			// Create topic first
			const db = getSql();
			db.insert(learningTopics).values({
				id: topicId,
				title: "Test Topic",
				subject: "Testing",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Create chunk without content
			await createChunk({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				estimatedDuration: 15,
				chunkType: "new",
				prerequisites: [],
				tags: [],
				// No content provided
				createdAt: now,
				updatedAt: now,
			});

			// Verify chunk was created with null content
			const chunk = db.select().from(learningChunks).where(eq(learningChunks.id, chunkId)).get();
			expect(chunk).toBeDefined();
			expect(chunk?.content).toBeNull();
			expect(chunk?.contentVersion).toBeNull();
			expect(chunk?.contentUpdatedAt).toBeNull();
		});

		it("should handle content retrieval for chunk without content", async () => {
			if (skipTests) return;

			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			const now = Date.now();

			// Create topic and chunk without content
			const db = getSql();
			db.insert(learningTopics).values({
				id: topicId,
				title: "Test Topic",
				subject: "Testing",
				summary: null,
				summaryVersion: null,
				summaryUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			db.insert(learningChunks).values({
				id: chunkId,
				topicId,
				title: "Test Chunk",
				subject: "Testing",
				difficulty: 5,
				nextReviewAt: now,
				easeFactor: 2.5,
				repetitions: 0,
				lastReviewedAt: null,
				estimatedDuration: 15,
				chunkType: "new",
				prerequisitesJson: "[]",
				tagsJson: "[]",
				content: null,
				contentVersion: null,
				contentUpdatedAt: null,
				createdAt: now,
				updatedAt: now,
			}).run();

			// Retrieve content (should return object with null content)
			const retrievedContent = await getChunkContent(chunkId);
			expect(retrievedContent).toBeDefined();
			expect(retrievedContent?.content).toBeNull();
			expect(retrievedContent?.contentVersion).toBeNull();
			expect(retrievedContent?.contentUpdatedAt).toBeNull();
		});
	});
});