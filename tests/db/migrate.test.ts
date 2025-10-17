import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let hasBinding = true;
try {
  const Database = require('better-sqlite3');
  new Database(':memory:');
} catch {
  hasBinding = false;
}

// Force tests to run in CI environment
if (process.env.CI && process.env.FORCE_SQLITE_TESTS) {
  hasBinding = true;
}

import { getDb, resetDatabase } from '../../src/db/client.js';
import '../../src/db/migrate.js';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

(hasBinding ? describe : describe.skip)('migration script', () => {
  let dbFile: string;
  let jsonFile: string;

  beforeEach(() => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    jsonFile = path.resolve(`./tmp-data-${crypto.randomUUID()}.json`);
    const sample = {
      learning_topics: [
        { id: 't1', title: 'Algo', subject: 'CS', createdAt: Date.now(), updatedAt: Date.now() },
      ],
      learning_chunks: [],
      review_schedule: [],
      session_logs: [],
      performance_analytics: [],
    };
    fs.writeFileSync(jsonFile, JSON.stringify(sample), 'utf-8');
  });

  afterEach(async () => {
    await resetDatabase(); // Close database connection
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* Ignore cleanup errors */
    }
    try {
      fs.unlinkSync(`${dbFile}-shm`);
    } catch {
      /* Ignore cleanup errors */
    }
    try {
      fs.unlinkSync(`${dbFile}-wal`);
    } catch {
      /* Ignore cleanup errors */
    }
    try {
      fs.unlinkSync(jsonFile);
    } catch {
      /* Ignore cleanup errors */
    }
  });

  it('imports topics from JSON', async () => {
    const { default: child_process } = await import('node:child_process');
    await new Promise<void>((resolve, reject) => {
      const p = child_process.fork(
        path.resolve('./dist/src/db/migrate.js'),
        [joinIfRelative(jsonFile)],
        { env: { ...process.env, SM_DB_PATH: dbFile } }
      );
      p.on('exit', code => (code === 0 ? resolve() : reject(new Error(String(code)))));
    });

    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as cnt FROM learning_topics').get() as { cnt: number };
    expect(row.cnt).toBe(1);
  });
});

function joinIfRelative(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(p);
}
