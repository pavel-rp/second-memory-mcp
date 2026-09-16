import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getPool } from './client.js';
import { logger } from '../../shared/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the path to the drizzle migrations directory.
 * In production the compiled entry point lives at dist/src/db/migrate.js,
 * so we walk up to the project root and look for drizzle/.
 */
function resolveMigrationsDir(): string {
  // Walk up from __dirname until we find a directory containing drizzle/
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'drizzle');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  // Fallback: relative to project root (cwd)
  const fallback = path.resolve('drizzle');
  if (fs.existsSync(fallback)) {
    logger.warn(`Migrations dir not found relative to module; falling back to cwd: ${fallback}`);
    return fallback;
  }
  throw new Error(
    `Could not find drizzle migrations directory. Searched up from ${__dirname} and cwd ${process.cwd()}`
  );
}

/**
 * Public entry point for server bootstrap — runs Drizzle Kit migrations.
 */
export async function initializeDatabase(): Promise<void> {
  await ensureSchema();
}

/**
 * Apply all pending Drizzle Kit migrations.
 *
 * NEU-1019: migration 0028 backfills unkeyed `learning_sessions` rows from the
 * configured `OWNER_LEARNER_KEY` setting, then enforces `learner_key NOT NULL`.
 * SQL migration files can't read `process.env` directly, and Drizzle's
 * node-postgres migrator runs every pending migration's statements together
 * inside one `session.transaction()` call — when `drizzle()` is constructed
 * with a `pg.Pool`, that transaction checks out its own fresh connection via
 * `pool.connect()`, so a value set on a *different* connection beforehand
 * would not be visible inside it. To keep the value visible where 0028 reads
 * it (`current_setting('app.owner_learner_key', true)`), this checks out one
 * dedicated client, sets the setting on it (session-scoped, not `SET LOCAL`,
 * so it survives from before `BEGIN` into the migrator's own later
 * transaction), and passes that *same* client — not the pool — to `drizzle()`,
 * so the migrator reuses it for the whole batch instead of opening a new one.
 */
export async function ensureSchema(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const ownerLearnerKey = (process.env.OWNER_LEARNER_KEY ?? '').trim();
    await client.query('select set_config($1, $2, false)', [
      'app.owner_learner_key',
      ownerLearnerKey,
    ]);
    const drizzleDb = drizzle(client);
    const migrationsFolder = resolveMigrationsDir();
    await migrate(drizzleDb, { migrationsFolder });
  } finally {
    client.release();
  }
}

/* v8 ignore start */
const currentFile = new URL(import.meta.url).pathname;
const argFile = process.argv[1];
const isMainModule = currentFile === argFile || currentFile.endsWith(argFile.replace(/\\/g, '/'));

if (isMainModule) {
  (async () => {
    let pool: ReturnType<typeof getPool> | undefined;
    try {
      pool = getPool();
      await ensureSchema();
      logger.info('Schema applied.');
    } catch (err) {
      logger.error('Migration failed:', err);
      process.exitCode = 1;
    } finally {
      try {
        await pool?.end();
      } catch (err) {
        logger.error('Failed to close database pool:', err);
        process.exitCode ||= 1;
      }
    }
  })();
}
