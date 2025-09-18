import Database from "better-sqlite3";
import type { Database as BetterSqlite3Database } from "better-sqlite3";
import path from "node:path";

let dbInstance: BetterSqlite3Database | undefined;
let initialized = false;

function resolveDbPath(): string {
	const envPath = process.env.SM_DB_PATH && String(process.env.SM_DB_PATH).trim();
	return envPath && envPath.length > 0 ? path.resolve(envPath) : path.resolve("./second-memory.db");
}

function applyPragmas(db: BetterSqlite3Database): void {
	// Minimal but effective SQLite config for single-user local DB
	db.pragma("journal_mode = WAL");
	db.pragma("synchronous = NORMAL");
	db.pragma("foreign_keys = ON");
}

export function getDb(): BetterSqlite3Database {
	if (!dbInstance) {
		const filePath = resolveDbPath();
		dbInstance = new Database(filePath, { fileMustExist: false });
	}
	if (!initialized) {
		applyPragmas(dbInstance);
		initialized = true;
	}
	return dbInstance;
}

export async function resetDatabase(): Promise<void> {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = undefined;
		initialized = false;
	}
	// Also reset drizzle singleton
	const { resetDrizzle } = await import("./operations.js");
	resetDrizzle();
}

export function clearAllTables(): void {
	const db = getDb();
	// Clear tables in correct order to avoid foreign key violations
	db.exec(`
		DELETE FROM friction_metrics;
		DELETE FROM review_schedule;
		DELETE FROM learning_chunks;
		DELETE FROM learning_topics;
		DELETE FROM session_logs;
		DELETE FROM performance_analytics;
	`);
}
