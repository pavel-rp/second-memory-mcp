import { ensureSchema } from '../../src/infrastructure/db/migrate.js';
import { clearAllTables, resetDatabase, getPool } from '../../src/infrastructure/db/client.js';

let schemaInitialized = false;

/**
 * Drop all tables and the drizzle migrations tracker so ensureSchema()
 * can re-apply migrations cleanly. Serialized via an advisory lock so
 * concurrent vitest workers don't race.
 */
async function dropAndMigrate(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Serialize across workers — only one process drops + migrates at a time
    await client.query('SELECT pg_advisory_lock(12345)');
    try {
      // Check if another worker already migrated (table exists and is current)
      const { rows } = await client.query(`
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'learning_chunks'
      `);
      if (rows.length === 0) {
        // Tables don't exist yet — drop all public tables and the drizzle
        // migration journal so migrations re-run from scratch. Extensions
        // (e.g. pgvector) are preserved since they require superuser to recreate.
        await client.query(`
          DO $$ DECLARE r RECORD;
          BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
          END $$
        `);
        await client.query('DROP TABLE IF EXISTS drizzle."__drizzle_migrations"');
        await ensureSchema();
      } else {
        // Tables exist — just ensure migrations are up to date
        await ensureSchema();
      }
    } finally {
      await client.query('SELECT pg_advisory_unlock(12345)');
    }
  } finally {
    client.release();
  }
}

/**
 * Idempotent schema setup — calls ensureSchema() once per test process.
 * Drops stale tables first to avoid conflicts with outdated schema state.
 */
export async function setupTestDb(): Promise<void> {
  if (schemaInitialized) return;
  await dropAndMigrate();
  schemaInitialized = true;
}

/**
 * Truncate all tables between tests.
 */
export async function cleanupTestDb(): Promise<void> {
  await clearAllTables();
}

/**
 * Close pool and reset singletons — call in afterAll.
 */
export async function teardownTestDb(): Promise<void> {
  schemaInitialized = false;
  await resetDatabase();
}
