import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { clearAllTables } from '../../src/db/client.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics } from '../../src/db/schema.js';

describe('migration script', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('ensureSchema is idempotent', async () => {
    // Running ensureSchema again should not throw
    await ensureSchema();
  });

  it('clearAllTables truncates data', async () => {
    const db = getSql();
    const now = Date.now();
    await db.insert(learningTopics).values({
      id: 't1',
      title: 'Algo',
      subject: 'CS',
      createdAt: now,
      updatedAt: now,
    });

    const before = await db.select().from(learningTopics);
    expect(before.length).toBe(1);

    await clearAllTables();

    const after = await db.select().from(learningTopics);
    expect(after.length).toBe(0);
  });
});
