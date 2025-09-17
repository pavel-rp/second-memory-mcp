import fs from "node:fs";
import path from "node:path";
import { getDb } from "./client.js";
import { getSql, bulkInsert, encodeJsonArray } from "./operations.js";
import {
	learningTopics,
	learningChunks,
	reviewSchedule,
	sessionLogs,
	performanceAnalytics,
	NewLearningTopicRow,
	NewLearningChunkRow,
	NewReviewScheduleRow,
	NewSessionLogRow,
	NewPerformanceAnalyticsRow,
} from "./schema.js";

function ensureSchema() {
	const db = getDb();
	// Minimal table creation matching schema definitions
	db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
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
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS review_schedule (
		id TEXT PRIMARY KEY NOT NULL,
		chunk_id TEXT NOT NULL,
		next_review_at INTEGER NOT NULL,
		interval_days INTEGER NOT NULL,
		repetitions INTEGER NOT NULL,
		ease_factor REAL NOT NULL,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(chunk_id) REFERENCES learning_chunks(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS session_logs (
		id TEXT PRIMARY KEY NOT NULL,
		date INTEGER NOT NULL,
		duration INTEGER NOT NULL,
		items_completed INTEGER NOT NULL,
		average_quality REAL NOT NULL,
		cognitive_load REAL NOT NULL,
		created_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS performance_analytics (
		id TEXT PRIMARY KEY NOT NULL,
		date INTEGER NOT NULL,
		topic TEXT,
		metrics_json TEXT NOT NULL,
		created_at INTEGER NOT NULL
	);
	`);
}

function readJson(pathOrEnv?: string) {
	const src = pathOrEnv || process.env.MIGRATE_SOURCE || "./notion-export.json";
	const full = path.resolve(src);
	const raw = fs.readFileSync(full, "utf-8");
	return JSON.parse(raw);
}

async function importData(data: any) {
	const db = getSql();
	let topics = 0, chunks = 0, schedules = 0, logs = 0, analytics = 0;

	if (Array.isArray(data.learning_topics)) {
		await bulkInsert<NewLearningTopicRow>(data.learning_topics as NewLearningTopicRow[], (chunk) => {
			return db.insert(learningTopics).values(chunk).run();
		});
		topics = data.learning_topics.length;
	}

	if (Array.isArray(data.learning_chunks)) {
		const mapped: NewLearningChunkRow[] = (data.learning_chunks as any[]).map((c) => ({
			...c,
			prerequisitesJson: encodeJsonArray(c.prerequisites),
			tagsJson: encodeJsonArray(c.tags),
		}));
		await bulkInsert<NewLearningChunkRow>(mapped, (chunk) => db.insert(learningChunks).values(chunk).run());
		chunks = mapped.length;
	}

	if (Array.isArray(data.review_schedule)) {
		await bulkInsert<NewReviewScheduleRow>(data.review_schedule as NewReviewScheduleRow[], (chunk) =>
			db.insert(reviewSchedule).values(chunk).run()
		);
		schedules = data.review_schedule.length;
	}

	if (Array.isArray(data.session_logs)) {
		await bulkInsert<NewSessionLogRow>(data.session_logs as NewSessionLogRow[], (chunk) =>
			db.insert(sessionLogs).values(chunk).run()
		);
		logs = data.session_logs.length;
	}

	if (Array.isArray(data.performance_analytics)) {
		await bulkInsert<NewPerformanceAnalyticsRow>(data.performance_analytics as NewPerformanceAnalyticsRow[], (chunk) =>
			db.insert(performanceAnalytics).values(chunk).run()
		);
		analytics = data.performance_analytics.length;
	}

	return { topics, chunks, schedules, logs, analytics };
}

async function main() {
	ensureSchema();
	const src = process.argv[2];
	const data = readJson(src);
	const summary = await importData(data);
	// eslint-disable-next-line no-console
	console.log(JSON.stringify({ status: "ok", summary }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((err) => {
		// eslint-disable-next-line no-console
		console.error("Migration failed:", err);
		process.exit(1);
	});
}
