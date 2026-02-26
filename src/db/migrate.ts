import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import type { Database as BetterSqlite3Database } from 'better-sqlite3';
import { getDb } from './client.js';
import { getSql, bulkInsert, encodeJsonArray } from './operations.js';
import { logger } from '../utils/logger.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
  NewLearningTopicRow,
  NewLearningChunkRow,
  NewLearningSessionRow,
  NewSessionChunkRow,
} from './schema.js';

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
  ensureSchema();
}

/**
 * The core tables that migration 0000 creates.
 * If these exist without a Drizzle journal, the database predates Drizzle Kit.
 */
const CORE_TABLES = ['learning_topics', 'learning_chunks', 'learning_sessions', 'session_chunks'];

/**
 * Check if a SQLite table exists in the database.
 */
function tableExists(db: BetterSqlite3Database, name: string): boolean {
  const row = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name) as
    | { 1: number }
    | undefined;
  return row !== undefined;
}

/**
 * For databases that predate Drizzle Kit: if core tables already exist but the
 * __drizzle_migrations journal does not, create the journal and mark migration
 * 0000 as already applied so Drizzle won't attempt to re-create existing tables.
 */
function seedJournalForExistingDatabase(db: BetterSqlite3Database, migrationsFolder: string): void {
  const hasJournal = tableExists(db, '__drizzle_migrations');
  if (hasJournal) return;

  const hasCoreTable = CORE_TABLES.some(t => tableExists(db, t));
  if (!hasCoreTable) return;

  logger.info('Existing database detected without Drizzle journal — seeding migration history');

  // Read the journal to find migration 0000 metadata
  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8')) as {
    entries: { idx: number; tag: string; when: number }[];
  };
  const firstEntry = journal.entries.find(e => e.idx === 0);
  if (!firstEntry) {
    throw new Error('Could not find migration 0000 in drizzle journal');
  }

  // Create the journal table with the same schema Drizzle uses internally
  db.exec(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER
    );
  `);

  // Read the migration SQL to compute the hash Drizzle expects
  const migrationSql = fs.readFileSync(
    path.join(migrationsFolder, `${firstEntry.tag}.sql`),
    'utf-8'
  );

  // Drizzle uses sha256 of the migration SQL content as the hash
  const hash = crypto.createHash('sha256').update(migrationSql).digest('hex');

  db.prepare('INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (?, ?)').run(
    hash,
    firstEntry.when
  );

  logger.info(`Marked migration 0000 (${firstEntry.tag}) as already applied`);
}

/**
 * Apply all pending Drizzle Kit migrations.
 */
export function ensureSchema(): void {
  const db = getDb();
  const drizzleDb = drizzle(db);
  const migrationsFolder = resolveMigrationsDir();
  seedJournalForExistingDatabase(db, migrationsFolder);
  migrate(drizzleDb, { migrationsFolder });
}

type RawLearningChunk = Omit<NewLearningChunkRow, 'prerequisitesJson' | 'tagsJson'> & {
  prerequisites?: string[] | null;
  tags?: string[] | null;
};

type MigrationData = {
  learning_topics?: NewLearningTopicRow[];
  learning_chunks?: RawLearningChunk[];
  learning_sessions?: NewLearningSessionRow[];
  session_chunks?: NewSessionChunkRow[];
};

function readJson(pathOrEnv?: string): MigrationData {
  const src = pathOrEnv || process.env.MIGRATE_SOURCE || './learning-import.json';
  const full = path.resolve(src);
  const raw = fs.readFileSync(full, 'utf-8');
  return JSON.parse(raw) as MigrationData;
}

async function importData(data: MigrationData) {
  const db = getSql();
  let topics = 0,
    chunks = 0,
    sessions = 0,
    sessionChunkCount = 0;

  if (Array.isArray(data.learning_topics)) {
    await bulkInsert<NewLearningTopicRow>(data.learning_topics, chunk => {
      return db.insert(learningTopics).values(chunk).run();
    });
    topics = data.learning_topics.length;
  }

  if (Array.isArray(data.learning_chunks)) {
    const mapped: NewLearningChunkRow[] = data.learning_chunks.map(chunk => {
      const { prerequisites, tags, ...chunkWithoutLists } = chunk;
      return {
        ...chunkWithoutLists,
        prerequisitesJson: encodeJsonArray(prerequisites ?? undefined),
        tagsJson: encodeJsonArray(tags ?? undefined),
      };
    });
    await bulkInsert<NewLearningChunkRow>(mapped, chunk =>
      db.insert(learningChunks).values(chunk).run()
    );
    chunks = mapped.length;
  }

  if (Array.isArray(data.learning_sessions)) {
    await bulkInsert<NewLearningSessionRow>(data.learning_sessions, chunk =>
      db.insert(learningSessions).values(chunk).run()
    );
    sessions = data.learning_sessions.length;
  }

  if (Array.isArray(data.session_chunks)) {
    await bulkInsert<NewSessionChunkRow>(data.session_chunks, chunk =>
      db.insert(sessionChunks).values(chunk).run()
    );
    sessionChunkCount = data.session_chunks.length;
  }

  return { topics, chunks, sessions, sessionChunks: sessionChunkCount };
}

async function main() {
  ensureSchema();
  const src = process.argv[2];
  const data = readJson(src);
  const summary = await importData(data);
  logger.info(JSON.stringify({ status: 'ok', summary }, null, 2));
}

// Check if this script is being run directly (not imported)
const currentFile = new URL(import.meta.url).pathname;
const argFile = process.argv[1];
const isMainModule = currentFile === argFile || currentFile.endsWith(argFile.replace(/\\/g, '/'));

if (isMainModule) {
  main().catch(err => {
    logger.error('Migration failed:', err);
    process.exit(1);
  });
}
