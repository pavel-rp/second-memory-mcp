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
import { createChunk, listChunks, listChunksAsLearningItems } from "../../src/services/chunks.js";
import { LearningItemSchema } from "../../src/types/recommendations.js";

function ensureSchema() {
	const db = getDb();
	db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		summary TEXT,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS learning_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		summary TEXT,
		difficulty INTEGER NOT NULL,
		next_review_at INTEGER NOT NULL,
		ease_factor REAL NOT NULL,
		repetitions INTEGER NOT NULL,
		last_reviewed_at INTEGER,
		estimated_duration INTEGER NOT NULL,
		chunk_type TEXT NOT NULL,
		prerequisites_json TEXT,
		tags_json TEXT,
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
			INSERT INTO learning_topics (id, title, subject, summary, created_at, updated_at)
			VALUES ('topic-1', 'Algorithm Fundamentals', 'CS', 'Core algorithms and data structures', ${now}, ${now})
		`);

		// Create chunk linked to the topic
		await createChunk({
			id: "chunk-1",
			topicId: "topic-1",
			title: "Two Sum Problem",
			subject: "CS",
			summary: "Find two numbers in array that add up to target",
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
		expect(items[0].topicSummary).toBe("Core algorithms and data structures");
		expect(items[0].summary).toBe("Find two numbers in array that add up to target");
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
		// Test valid item with summary fields
		const validItem = {
			id: "test-chunk",
			title: "Test Chunk",
			subject: "CS",
			summary: "Test chunk summary",
			difficulty: 5,
			nextReviewDate: "2024-01-01",
			easeFactor: 2.5,
			repetitions: 1,
			estimatedDuration: 20,
			chunkType: "new" as const,
			topicId: "topic-1", // Valid non-empty string
			topicTitle: "Test Topic",
			topicSummary: "Test topic summary",
		};

		expect(() => LearningItemSchema.parse(validItem)).not.toThrow();

		// Test invalid empty topicId
		const invalidItem = {
			...validItem,
			topicId: "", // Invalid empty string
		};

		expect(() => LearningItemSchema.parse(invalidItem)).toThrow();

		// Test invalid empty summary
		const invalidSummaryItem = {
			...validItem,
			summary: "", // Invalid empty string
		};

		expect(() => LearningItemSchema.parse(invalidSummaryItem)).toThrow();

		// Test optional fields work
		const itemWithoutOptionalFields = {
			...validItem,
			summary: undefined,
			topicId: undefined,
			topicTitle: undefined,
			topicSummary: undefined,
		};

		expect(() => LearningItemSchema.parse(itemWithoutOptionalFields)).not.toThrow();
	});
});
