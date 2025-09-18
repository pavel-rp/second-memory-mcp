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

import { getDb, resetDatabase } from "../../src/db/client.js";
import { createTopic, getTopicById, listTopics, updateTopic, deleteTopic } from "../../src/services/topics.js";

function ensureSchema() {
	const db = getDb();
	db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
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
});
