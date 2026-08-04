import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { ensureSchema } from '../../../src/infrastructure/db/migrate.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningSessions,
  sessionQuestions,
  sessionQuestionAttempts,
} from '../../../src/infrastructure/db/schema.js';

/**
 * NEU-844 / SC-11 — migration 0024 applied to a table that already holds attempt
 * rows. `tests/helpers/db-setup.ts` always builds the schema from scratch, so no
 * other test ever exercises the ALTER-onto-populated-table path.
 *
 * The fixture reproduces pre-0024 state by dropping the three constraints, the
 * four columns and 0024's row from drizzle's migration tracker, then re-applies
 * the real migration through `ensureSchema()`. The DROPs live only here — the
 * migration file itself stays purely additive (SC-2).
 *
 * Own file because it mutates schema state; `vitest.integration.config.ts` sets
 * `fileParallelism: false`, so nothing runs alongside it.
 */

/** `when` of the 0024 journal entry — drizzle writes it verbatim as `created_at`. */
const MIGRATION_0024_WHEN = 1774270000000;

const ATTEMPT_ID = 'populated-attempt-1';

describe('migration 0024 on a populated session_question_attempts table (integration)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  /** Every column `session_question_attempts` had before 0024. */
  const originalColumns = {
    id: sessionQuestionAttempts.id,
    sessionQuestionId: sessionQuestionAttempts.sessionQuestionId,
    attemptNumber: sessionQuestionAttempts.attemptNumber,
    response: sessionQuestionAttempts.response,
    passed: sessionQuestionAttempts.passed,
    feedback: sessionQuestionAttempts.feedback,
    quality: sessionQuestionAttempts.quality,
    agentQuality: sessionQuestionAttempts.agentQuality,
    questionType: sessionQuestionAttempts.questionType,
    timeSpentMs: sessionQuestionAttempts.timeSpentMs,
    createdAt: sessionQuestionAttempts.createdAt,
  };

  async function seedPopulatedAttempt() {
    const db = getSql();
    const now = 1_700_000_000_000;

    await db.insert(learningSessions).values({
      id: 'sess-populated',
      topicId: null,
      chunkIds: ['pc1'],
      mode: 'learning',
      estimatedDuration: 30,
      status: 'active',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(sessionQuestions).values({
      id: 'sq-populated',
      sessionId: 'sess-populated',
      questionIndex: 1,
      promptText: 'A question recorded before 0024 existed',
      status: 'answered',
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(sessionQuestionAttempts).values({
      id: ATTEMPT_ID,
      sessionQuestionId: 'sq-populated',
      attemptNumber: 1,
      response: 'A pre-0024 answer',
      passed: true,
      feedback: 'Recorded before the snapshot columns existed.',
      quality: 4,
      agentQuality: 3,
      questionType: 'recall',
      timeSpentMs: 4321,
      createdAt: now,
      snapshotBand: null,
      snapshotPredictedRecall: null,
      snapshotIntervalDays: null,
      snapshotDaysOverdue: null,
    });
  }

  /** Undo 0024 with raw SQL so `ensureSchema()` has to re-apply it for real. */
  async function revertTo0023() {
    const db = getSql();
    await db.execute(
      sql`ALTER TABLE "session_question_attempts" DROP CONSTRAINT "chk_snapshot_band"`
    );
    await db.execute(
      sql`ALTER TABLE "session_question_attempts" DROP CONSTRAINT "chk_snapshot_predicted_recall"`
    );
    await db.execute(
      sql`ALTER TABLE "session_question_attempts" DROP CONSTRAINT "chk_snapshot_days_overdue"`
    );
    await db.execute(sql`ALTER TABLE "session_question_attempts" DROP COLUMN "snapshot_band"`);
    await db.execute(
      sql`ALTER TABLE "session_question_attempts" DROP COLUMN "snapshot_predicted_recall"`
    );
    await db.execute(
      sql`ALTER TABLE "session_question_attempts" DROP COLUMN "snapshot_interval_days"`
    );
    await db.execute(
      sql`ALTER TABLE "session_question_attempts" DROP COLUMN "snapshot_days_overdue"`
    );
    await db.execute(
      sql`DELETE FROM drizzle."__drizzle_migrations" WHERE created_at = ${MIGRATION_0024_WHEN}`
    );
  }

  it('applies cleanly, preserves every original column and leaves the new ones NULL', async () => {
    const db = getSql();
    await seedPopulatedAttempt();

    const [before] = await db
      .select(originalColumns)
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, ATTEMPT_ID));
    expect(before).toBeDefined();

    await revertTo0023();

    // The pre-0024 row is still there, and the four columns are genuinely gone.
    const [afterRevert] = await db
      .select(originalColumns)
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, ATTEMPT_ID));
    expect(afterRevert).toEqual(before);

    // The real migration, applied to a table that already holds rows.
    await expect(ensureSchema()).resolves.toBeUndefined();

    const [afterMigrate] = await db
      .select(originalColumns)
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, ATTEMPT_ID));
    expect(afterMigrate).toEqual(before);

    const [withSnapshot] = await db
      .select()
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, ATTEMPT_ID));
    expect(withSnapshot?.snapshotBand).toBeNull();
    expect(withSnapshot?.snapshotPredictedRecall).toBeNull();
    expect(withSnapshot?.snapshotIntervalDays).toBeNull();
    expect(withSnapshot?.snapshotDaysOverdue).toBeNull();

    // The re-applied migration brought the CHECK constraints back with it.
    await expect(
      db
        .update(sessionQuestionAttempts)
        .set({ snapshotBand: 'not_a_band' })
        .where(eq(sessionQuestionAttempts.id, ATTEMPT_ID))
    ).rejects.toThrow();
  });
});
