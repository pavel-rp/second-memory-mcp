import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getPool } from './client.js';
import { getSql, bulkInsert } from './operations.js';
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
    await bulkInsert<NewLearningTopicRow>(data.learning_topics, async chunk => {
      await db.insert(learningTopics).values(chunk);
    });
    topics = data.learning_topics.length;
  }

  if (Array.isArray(data.learning_chunks)) {
    const mapped: NewLearningChunkRow[] = data.learning_chunks.map(chunk => {
      const { prerequisites, tags, ...chunkWithoutLists } = chunk;
      return {
        ...chunkWithoutLists,
        prerequisitesJson: prerequisites ?? null,
        tagsJson: tags ?? null,
      };
    });
    await bulkInsert<NewLearningChunkRow>(mapped, async chunk => {
      await db.insert(learningChunks).values(chunk);
    });
    chunks = mapped.length;
  }

  if (Array.isArray(data.learning_sessions)) {
    await bulkInsert<NewLearningSessionRow>(data.learning_sessions, async chunk => {
      await db.insert(learningSessions).values(chunk);
    });
    sessions = data.learning_sessions.length;
  }

  if (Array.isArray(data.session_chunks)) {
    await bulkInsert<NewSessionChunkRow>(data.session_chunks, async chunk => {
      await db.insert(sessionChunks).values(chunk);
    });
    sessionChunkCount = data.session_chunks.length;
  }

  return { topics, chunks, sessions, sessionChunks: sessionChunkCount };
}

async function main() {
  await ensureSchema();
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
