import { ensureSchema } from '../../src/infrastructure/db/migrate.js';
import { clearAllTables, resetDatabase } from '../../src/infrastructure/db/client.js';

let schemaInitialized = false;

/**
 * Idempotent schema setup — calls ensureSchema() once per test process.
 */
export async function setupTestDb(): Promise<void> {
  if (schemaInitialized) return;
  await ensureSchema();
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
