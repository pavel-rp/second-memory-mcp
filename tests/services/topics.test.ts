import { describe, it, beforeEach, afterEach, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

let hasBinding = true;
try {
	const Database = require("better-sqlite3");
	// try opening an in-memory DB to ensure binding exists
	new Database(":memory:");
} catch {
	hasBinding = false;
}

// Force tests to run in CI environment
if (process.env.CI && process.env.FORCE_SQLITE_TESTS) {
	hasBinding = true;
}

import { getDb, resetDatabase } from "../../src/db/client.js";
import { createTopic, getTopicById, listTopics, updateTopic, deleteTopic, batchFetchTopicsMinimal } from "../../src/services/topics.js";

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
	`);
}

function tmpDbPath() {
	return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

(hasBinding ? describe : describe.skip)("topics service", () => {
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

	it("creates, reads, lists, updates, and deletes a topic", async () => {
		const now = Date.now();
		const topic = {
			id: "t1",
			title: "Algebra",
			subject: "Math",
			createdAt: now,
			updatedAt: now,
		};

		await createTopic(topic);
		const fetched = await getTopicById("t1");
		expect(fetched?.id).toBe("t1");

		const list = await listTopics();
		expect(list.length).toBe(1);

		const changed = await updateTopic("t1", { title: "Linear Algebra", updatedAt: now + 1 });
		expect(changed).toBe(1);

		const removed = await deleteTopic("t1");
		expect(removed).toBe(1);

		const empty = await listTopics();
		expect(empty.length).toBe(0);
	});

	it("batch fetches topics with minimal metadata", async () => {
		const now = Date.now();
		const topics = [
			{ id: "t1", title: "Algebra", subject: "Math", createdAt: now, updatedAt: now },
			{ id: "t2", title: "Calculus", subject: "Math", createdAt: now + 1, updatedAt: now + 1 },
			{ id: "t3", title: "Physics", subject: "Science", createdAt: now + 2, updatedAt: now + 2 },
		];

		for (const topic of topics) {
			await createTopic(topic);
		}

		// Test: fetch all topics
		const allTopics = await batchFetchTopicsMinimal();
		expect(allTopics.length).toBe(3);
		expect(allTopics[0]).toHaveProperty("id");
		expect(allTopics[0]).toHaveProperty("title");
		expect(allTopics[0]).toHaveProperty("subject");
		expect(allTopics[0]).toHaveProperty("createdAt");
		expect(allTopics[0]).toHaveProperty("updatedAt");
		// Ensure no heavy fields are included
		expect(allTopics[0]).not.toHaveProperty("summary");

		// Test: filter by subject
		const mathTopics = await batchFetchTopicsMinimal({ subject: "Math" });
		expect(mathTopics.length).toBe(2);
		expect(mathTopics.every(t => t.subject === "Math")).toBe(true);

		// Test: limit results
		const limitedTopics = await batchFetchTopicsMinimal({ limit: 2 });
		expect(limitedTopics.length).toBe(2);

		// Test: combined filter and limit
		const filteredLimited = await batchFetchTopicsMinimal({ subject: "Math", limit: 1 });
		expect(filteredLimited.length).toBe(1);
		expect(filteredLimited[0].subject).toBe("Math");
	});
});
