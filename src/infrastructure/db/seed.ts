import fs from 'node:fs';
import path from 'node:path';
import { getPool } from './client.js';
import { getSql, bulkInsert } from './operations.js';
import { ensureSchema } from './migrate.js';
import { logger } from '../../shared/logger.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
  type NewLearningTopicRow,
  type NewLearningChunkRow,
  type NewLearningSessionRow,
  type NewSessionChunkRow,
} from './schema.js';

type RawLearningChunk = Omit<NewLearningChunkRow, 'prerequisitesJson' | 'tagsJson'> & {
  prerequisites?: string[] | null;
  tags?: string[] | null;
};

type SeedData = {
  learning_topics?: NewLearningTopicRow[];
  learning_chunks?: RawLearningChunk[];
  learning_sessions?: NewLearningSessionRow[];
  session_chunks?: NewSessionChunkRow[];
};

function readJson(pathOrEnv?: string): SeedData {
  const src = pathOrEnv || process.env.SEED_SOURCE || './seed.json';
  const full = path.resolve(src);
  const raw = fs.readFileSync(full, 'utf-8');
  return JSON.parse(raw) as SeedData;
}

async function importData(data: SeedData) {
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
  const pool = getPool();
  await pool.end();
}

main().catch(err => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
