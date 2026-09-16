import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { ensureSchema } from '../../../src/infrastructure/db/migrate.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningSessions } from '../../../src/infrastructure/db/schema.js';

/**
 * NEU-1019 — migration 0028 backfills every unkeyed `learning_sessions` row
 * from the configured `OWNER_LEARNER_KEY` setting, then enforces
 * `learner_key NOT NULL`. `tests/helpers/db-setup.ts` always builds the
 * schema from scratch (an empty table has zero unkeyed rows, so 0028 applies
 * trivially without `OWNER_LEARNER_KEY`), so this file reproduces a
 * pre-0028, populated state per test — dropping the NOT NULL constraint and
 * deleting 0028's own tracker row — to exercise the backfill/refusal logic
 * for real.
 *
 * Own file because it mutates schema state and the live `OWNER_LEARNER_KEY`
 * environment variable; `vitest.integration.config.ts` sets
 * `fileParallelism: false`, so nothing runs alongside it.
 */

/** `when` of the 0028 journal entry — drizzle writes it verbatim as `created_at`. */
const MIGRATION_0028_WHEN = 1774310000000;

describe('migration 0028 — backfill and enforce learner_key NOT NULL (integration)', () => {
  const originalOwnerKey = process.env.OWNER_LEARNER_KEY;

  beforeAll(async () => {
    await setupTestDb();
  });
  beforeEach(cleanupTestDb);
  afterEach(() => {
    if (originalOwnerKey === undefined) {
      delete process.env.OWNER_LEARNER_KEY;
    } else {
      process.env.OWNER_LEARNER_KEY = originalOwnerKey;
    }
  });
  afterAll(teardownTestDb);

  /**
   * Undo 0028 with raw SQL so `ensureSchema()` has to re-apply it for real:
   * drop the NOT NULL constraint it added, and delete its tracking row (and
   * any later ones, per the same >= watermark reasoning as the 0024 revert
   * helper) so the migrator's global "last migration" watermark doesn't
   * silently skip re-applying it.
   */
  async function revertTo0027() {
    const db = getSql();
    await db.execute(sql`ALTER TABLE "learning_sessions" ALTER COLUMN "learner_key" DROP NOT NULL`);
    await db.execute(
      sql`DELETE FROM drizzle."__drizzle_migrations" WHERE created_at >= ${MIGRATION_0028_WHEN}`
    );
  }

  /** Raw insert bypassing the (currently NOT NULL-typed) drizzle schema — legal only while the live column is nullable, i.e. after `revertTo0027()`. */
  async function insertUnkeyedSession(id: string, now: number) {
    const db = getSql();
    await db.execute(sql`
      INSERT INTO "learning_sessions" (id, mode, status, start_time, created_at, updated_at, learner_key)
      VALUES (${id}, 'learning', 'active', ${now}, ${now}, ${now}, NULL)
    `);
  }

  async function insertKeyedSession(id: string, learnerKey: string, now: number) {
    const db = getSql();
    await db.insert(learningSessions).values({
      id,
      learnerKey,
      mode: 'learning',
      status: 'active',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  it('backfills unkeyed rows from OWNER_LEARNER_KEY, enforces NOT NULL, and leaves already-keyed rows unchanged', async () => {
    const now = Date.now();
    await revertTo0027();
    await insertUnkeyedSession('sess-unkeyed-1', now);
    await insertKeyedSession('sess-keyed-1', 'existing-learner', now);

    process.env.OWNER_LEARNER_KEY = 'owner-key-1';
    await expect(ensureSchema()).resolves.toBeUndefined();

    const db = getSql();
    const [backfilled] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, 'sess-unkeyed-1'));
    expect(backfilled?.learnerKey).toBe('owner-key-1');

    const [untouched] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, 'sess-keyed-1'));
    expect(untouched?.learnerKey).toBe('existing-learner');

    // NOT NULL is now enforced at the DB level — a raw null insert fails.
    await expect(
      db.execute(sql`
        INSERT INTO "learning_sessions" (id, mode, status, start_time, created_at, updated_at, learner_key)
        VALUES ('sess-should-fail-1', 'learning', 'active', ${now}, ${now}, ${now}, NULL)
      `)
    ).rejects.toThrow();
  });

  it('is idempotent — re-running the migrate step after 0028 has already applied changes nothing', async () => {
    // setupTestDb() already applied every migration, including 0028, against
    // a fresh empty table — re-running is a genuine no-op re-apply.
    await expect(ensureSchema()).resolves.toBeUndefined();
    await expect(ensureSchema()).resolves.toBeUndefined();
  });

  it('refuses — changing zero rows and leaving the column nullable — when unkeyed rows exist and OWNER_LEARNER_KEY is unset or blank', async () => {
    const now = Date.now();
    await revertTo0027();
    await insertUnkeyedSession('sess-unkeyed-2', now);

    delete process.env.OWNER_LEARNER_KEY;
    await expect(ensureSchema()).rejects.toThrow(/OWNER_LEARNER_KEY/);

    const db = getSql();
    const [row] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, 'sess-unkeyed-2'));
    expect(row?.learnerKey).toBeNull();

    // The column's nullability itself is unchanged — another null insert still succeeds.
    await expect(insertUnkeyedSession('sess-unkeyed-2b', now)).resolves.toBeUndefined();

    // Whitespace-only counts as blank, not a real value.
    process.env.OWNER_LEARNER_KEY = '   ';
    await expect(ensureSchema()).rejects.toThrow(/OWNER_LEARNER_KEY/);

    const [stillUnkeyed] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, 'sess-unkeyed-2'));
    expect(stillUnkeyed?.learnerKey).toBeNull();

    // An explicit empty string is also blank — distinct branch from "unset"
    // (deleted env var) and "whitespace-only", per the early-return-guard
    // convention: cover every guard input, not just one nullish case.
    process.env.OWNER_LEARNER_KEY = '';
    await expect(ensureSchema()).rejects.toThrow(/OWNER_LEARNER_KEY/);

    const [stillUnkeyedEmpty] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, 'sess-unkeyed-2'));
    expect(stillUnkeyedEmpty?.learnerKey).toBeNull();
  });

  it('backfills with the exact untrimmed value when OWNER_LEARNER_KEY is non-blank but whitespace-padded (NEU-1043)', async () => {
    // NEU-1043: trim decides blank vs. non-blank only — the value actually
    // written must be the raw, untrimmed string, not the trimmed one.
    const now = Date.now();
    await revertTo0027();
    await insertUnkeyedSession('sess-unkeyed-padded', now);

    process.env.OWNER_LEARNER_KEY = '  owner-key-3  ';
    await expect(ensureSchema()).resolves.toBeUndefined();

    const db = getSql();
    const [backfilled] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, 'sess-unkeyed-padded'));
    expect(backfilled?.learnerKey).toBe('  owner-key-3  ');
  });

  it('succeeds without OWNER_LEARNER_KEY set when no unkeyed rows exist', async () => {
    delete process.env.OWNER_LEARNER_KEY;
    await revertTo0027();
    await insertKeyedSession('sess-keyed-2', 'already-has-a-key', Date.now());

    await expect(ensureSchema()).resolves.toBeUndefined();

    // NOT NULL is enforced even though the backfill never ran.
    const db = getSql();
    await expect(
      db.execute(sql`
        INSERT INTO "learning_sessions" (id, mode, status, start_time, created_at, updated_at, learner_key)
        VALUES ('sess-should-fail-2', 'learning', 'active', ${Date.now()}, ${Date.now()}, ${Date.now()}, NULL)
      `)
    ).rejects.toThrow();
  });
});
