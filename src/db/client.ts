import Database from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3';
import path from 'node:path';

let dbInstance: BetterSqlite3Database | undefined;
let initialized = false;

function resolveDbPath(): string {
  const envPath = process.env.SM_DB_PATH && String(process.env.SM_DB_PATH).trim();
  const resolvedPath =
    envPath && envPath.length > 0 ? path.resolve(envPath) : path.resolve('./second-memory.db');

  // CRITICAL SAFETY CHECK: Prevent tests from using production database
  // Check if we're in a test environment (vitest sets NODE_ENV or process.argv contains vitest)
  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    process.argv.some(arg => arg.includes('vitest') || arg.includes('test'));

  if (isTestEnv && resolvedPath.endsWith('second-memory.db')) {
    throw new Error(
      "FATAL: Tests attempted to use production database 'second-memory.db'. " +
        'This is prevented to protect production data. ' +
        'Tests must set SM_DB_PATH to a temporary database file.'
    );
  }

  return resolvedPath;
}

function applyPragmas(db: BetterSqlite3Database): void {
  // Minimal but effective SQLite config for single-user local DB
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
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
  const { resetDrizzle } = await import('./operations.js');
  resetDrizzle();
}

export function clearAllTables(): void {
  const db = getDb();
  // Clear tables in correct order to avoid foreign key violations
  db.exec(`
  		DELETE FROM session_chunks;
		DELETE FROM learning_sessions;
		DELETE FROM learning_chunks;
		DELETE FROM learning_topics;
	`);
}
