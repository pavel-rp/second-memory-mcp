import fs from 'node:fs';
import path from 'node:path';
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

function checkColumnExists(
  db: { prepare(sql: string): { all(): Array<{ name: string; [key: string]: unknown }> } },
  tableName: string,
  columnName: string
): boolean {
  const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return result.some(col => col.name === columnName);
}

export function ensureSchema() {
  const db = getDb();
  // Minimal table creation matching schema definitions
  db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		summary TEXT,
		summary_version INTEGER DEFAULT 1,
		summary_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS learning_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		difficulty INTEGER NOT NULL,
		next_review_at INTEGER NOT NULL,
		ease_factor REAL NOT NULL,
		repetitions INTEGER NOT NULL,
		last_reviewed_at INTEGER,
		estimated_duration INTEGER NOT NULL,
		chunk_type TEXT NOT NULL CHECK(chunk_type IN ('new', 'review', 'remediation')),
		interval_days INTEGER,
		prerequisites_json TEXT,
		tags_json TEXT,
		content TEXT,
		content_version INTEGER DEFAULT 1,
		content_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS learning_sessions (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT,
		chunk_ids TEXT,
		mode TEXT NOT NULL CHECK(mode IN ('scaffolding', 'learning', 'retrieval', 'review')),
		estimated_duration INTEGER,
		status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed')),
		start_time INTEGER NOT NULL,
		end_time INTEGER,
		feedback TEXT,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE SET NULL
	);
	CREATE TABLE IF NOT EXISTS session_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		session_id TEXT NOT NULL,
		chunk_id TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
		attempts_json TEXT,
		quality_scores_json TEXT,
		time_spent_ms INTEGER NOT NULL DEFAULT 0,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
		FOREIGN KEY(chunk_id) REFERENCES learning_chunks(id) ON DELETE CASCADE
	);
	
	-- Indexes for performance
	CREATE INDEX IF NOT EXISTS idx_learning_chunks_next_review_at ON learning_chunks(next_review_at);
	CREATE INDEX IF NOT EXISTS idx_learning_sessions_status ON learning_sessions(status);
	CREATE INDEX IF NOT EXISTS idx_learning_sessions_topic_id ON learning_sessions(topic_id);
	CREATE INDEX IF NOT EXISTS idx_learning_sessions_created_at ON learning_sessions(created_at DESC);
	CREATE INDEX IF NOT EXISTS idx_session_chunks_session_id ON session_chunks(session_id);
	CREATE INDEX IF NOT EXISTS idx_session_chunks_status ON session_chunks(status);
	`);

  // Add content fields to existing tables if they don't exist (migration for content persistence)
  try {
    // Add content fields to learning_topics
    if (!checkColumnExists(db, 'learning_topics', 'summary')) {
      db.exec('ALTER TABLE learning_topics ADD COLUMN summary TEXT');
      logger.info('Added summary column to learning_topics table');
    }
    if (!checkColumnExists(db, 'learning_topics', 'summary_version')) {
      db.exec('ALTER TABLE learning_topics ADD COLUMN summary_version INTEGER DEFAULT 1');
      logger.info('Added summary_version column to learning_topics table');
    }
    if (!checkColumnExists(db, 'learning_topics', 'summary_updated_at')) {
      db.exec('ALTER TABLE learning_topics ADD COLUMN summary_updated_at INTEGER');
      logger.info('Added summary_updated_at column to learning_topics table');
    }

    // Add content fields to learning_chunks
    if (!checkColumnExists(db, 'learning_chunks', 'content')) {
      db.exec('ALTER TABLE learning_chunks ADD COLUMN content TEXT');
      logger.info('Added content column to learning_chunks table');
    }
    if (!checkColumnExists(db, 'learning_chunks', 'content_version')) {
      db.exec('ALTER TABLE learning_chunks ADD COLUMN content_version INTEGER DEFAULT 1');
      logger.info('Added content_version column to learning_chunks table');
    }
    if (!checkColumnExists(db, 'learning_chunks', 'content_updated_at')) {
      db.exec('ALTER TABLE learning_chunks ADD COLUMN content_updated_at INTEGER');
      logger.info('Added content_updated_at column to learning_chunks table');
    }
  } catch (error) {
    logger.error('Content fields migration failed:', error);
    throw new Error(
      `Content persistence migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Add interval_days column to learning_chunks (consolidation from review_schedule)
  try {
    if (!checkColumnExists(db, 'learning_chunks', 'interval_days')) {
      db.exec('ALTER TABLE learning_chunks ADD COLUMN interval_days INTEGER');
      logger.info('Added interval_days column to learning_chunks table');
    }
  } catch (error) {
    logger.error('interval_days migration failed:', error);
    throw new Error(
      `interval_days migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Remove legacy tables (migration cleanup)
  try {
    db.exec(`
		DROP TABLE IF EXISTS review_schedule;
		DROP TABLE IF EXISTS session_logs;
		DROP TABLE IF EXISTS performance_analytics;
		DROP TABLE IF EXISTS friction_metrics;
		`);
    logger.info(
      'Removed legacy tables: review_schedule, session_logs, performance_analytics, friction_metrics'
    );
  } catch (error) {
    logger.error('Legacy table cleanup failed:', error);
    throw new Error(
      `Legacy cleanup migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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
