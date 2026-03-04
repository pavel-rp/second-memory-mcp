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
 */
export async function ensureSchema(): Promise<void> {
  const pool = getPool();
  const drizzleDb = drizzle(pool);
  const migrationsFolder = resolveMigrationsDir();
  await migrate(drizzleDb, { migrationsFolder });
}

/* v8 ignore start */
const currentFile = new URL(import.meta.url).pathname;
const argFile = process.argv[1];
const isMainModule = currentFile === argFile || currentFile.endsWith(argFile.replace(/\\/g, '/'));

if (isMainModule) {
  ensureSchema()
    .then(() => logger.info('Schema applied.'))
    .catch(err => {
      logger.error('Migration failed:', err);
      process.exit(1);
    });
}
