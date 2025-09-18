import { drizzle } from "drizzle-orm/better-sqlite3";
import type { InferInsertModel } from "drizzle-orm";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { getDb } from "./client.js";

// Drizzle DB singleton
let drizzleDb: ReturnType<typeof drizzle> | undefined;
function getDrizzle() {
	if (!drizzleDb) {
		// better-sqlite3 connection is created by client
		drizzleDb = drizzle(getDb());
	}
	return drizzleDb;
}

export function resetDrizzle(): void {
	drizzleDb = undefined;
}

// Transaction helper
export type SqlDb = ReturnType<typeof drizzle>;
export type SqlTx = Parameters<SqlDb["transaction"]>[0] extends (tx: infer P) => any ? P : never;

export function withTx<T>(fn: (tx: SqlTx) => T): T {
	const db = getDrizzle();
	return db.transaction((tx) => fn(tx));
}

// Bulk insert helper (chunked)
export async function bulkInsert<Row>(
	rows: Row[],
	insertChunk: (chunk: Row[]) => Promise<unknown> | unknown,
	chunkSize: number = 500
): Promise<void> {
	for (let i = 0; i < rows.length; i += chunkSize) {
		const chunk = rows.slice(i, i + chunkSize);
		await insertChunk(chunk);
	}
}

// JSON helpers for array columns persisted as TEXT
export function encodeJsonArray(values?: string[] | null): string | null {
	if (!values || values.length === 0) return null;
	return JSON.stringify(values);
}

export function decodeJsonArray<T = string>(json?: string | null): T[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as T[]) : [];
	} catch {
		return [];
	}
}

// Expose drizzle accessor for services
export function getSql() {
	return getDrizzle();
}
