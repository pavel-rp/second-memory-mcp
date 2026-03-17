import 'dotenv/config';
import pg from 'pg';
import { sql } from 'drizzle-orm';
let poolInstance: pg.Pool | undefined;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim().length === 0) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Example: DATABASE_URL=postgresql://user:pass@localhost:5432/second_memory'
    );
  }

  // CRITICAL SAFETY CHECK: Prevent tests from using production database
  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    process.argv.some(arg => arg.includes('vitest')) ||
    !!process.env.VITEST;

  if (isTestEnv) {
    // Extract database name from connection string
    const dbName = new URL(url).pathname.replace('/', '');
    if (!dbName.includes('_test')) {
      throw new Error(
        `FATAL: Tests attempted to use database '${dbName}' which does not contain '_test'. ` +
          'This is prevented to protect production data. ' +
          'Tests must use a database with "_test" in its name.'
      );
    }
  }

  return url;
}

export function getPool(): pg.Pool {
  if (!poolInstance) {
    const connectionString = getDatabaseUrl();
    poolInstance = new pg.Pool({ connectionString });
  }
  return poolInstance;
}

export async function resetDatabase(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = undefined;
  }
  // Also reset drizzle singleton
  const { resetDrizzle } = await import('./operations.js');
  resetDrizzle();
}

export async function clearAllTables(): Promise<void> {
  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    process.argv.some(arg => arg.includes('vitest')) ||
    !!process.env.VITEST;

  if (!isTestEnv) {
    throw new Error('clearAllTables can only be called in a test environment');
  }

  const { getSql } = await import('./operations.js');
  const db = getSql();
  await db.execute(
    sql`TRUNCATE notes, session_question_attempts, session_questions, session_chunks, learning_sessions, learning_chunks, learning_topics CASCADE`
  );
}
