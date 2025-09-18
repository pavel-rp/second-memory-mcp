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

function ensureSchema() {
	const db = getDb();
	db.exec(`
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
});
