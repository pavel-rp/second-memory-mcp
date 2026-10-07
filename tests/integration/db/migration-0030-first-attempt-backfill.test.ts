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
 * NEU-1054 — migration 0030 backfills `actual_prompt_text` on legacy first
 * attempts from `session_questions.prompt_text` (attempt 1 always answers the
 * original question), while legacy retries stay unknown. 0030 is re-runnable
 * (IF NOT EXISTS), so deleting its tracker row makes `ensureSchema()` replay it
 * against the populated rows inserted here.
 */

/** `when` of the 0030 journal entry — drizzle writes it verbatim as `created_at`. */
const MIGRATION_0030_WHEN = 1791369631897;

describe('migration 0030 — backfill first-attempt actual_prompt_text (integration)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function forget0030() {
    await getSql().execute(
      sql`DELETE FROM drizzle."__drizzle_migrations" WHERE created_at >= ${MIGRATION_0030_WHEN}`
    );
  }

  async function insertQuestion(sessionId: string, id: string, index: number, prompt: string) {
    const now = Date.now();
    await getSql().insert(sessionQuestions).values({
      id,
      sessionId,
      questionIndex: index,
      promptText: prompt,
      status: 'answered',
      createdAt: now,
      updatedAt: now,
    });
  }

  async function insertAttempt(
    id: string,
    sessionQuestionId: string,
    attemptNumber: number,
    actualPromptText: string | null
  ) {
    await getSql()
      .insert(sessionQuestionAttempts)
      .values({
        id,
        sessionQuestionId,
        attemptNumber,
        actualPromptText,
        response: 'learner words',
        passed: attemptNumber === 2,
        feedback: 'feedback',
        timeSpentMs: 1000,
        createdAt: Date.now(),
      });
  }

  async function promptOf(attemptId: string) {
    const [row] = await getSql()
      .select({ prompt: sessionQuestionAttempts.actualPromptText })
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, attemptId));
    return row?.prompt;
  }

  it('fills legacy first attempts from the original question and leaves retries and captured rows unchanged', async () => {
    const now = Date.now();
    await getSql().insert(learningSessions).values({
      id: 'sess-0030',
      learnerKey: 'learner-0030',
      mode: 'learning',
      status: 'active',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });
    await insertQuestion('sess-0030', 'q-legacy', 1, 'Original legacy question?');
    await insertQuestion('sess-0030', 'q-captured', 2, 'Original captured question?');
    await insertAttempt('a-legacy-1', 'q-legacy', 1, null);
    await insertAttempt('a-legacy-2', 'q-legacy', 2, null);
    await insertAttempt('a-captured-1', 'q-captured', 1, 'Already captured wording?');

    await forget0030();
    await expect(ensureSchema()).resolves.toBeUndefined();

    expect(await promptOf('a-legacy-1')).toBe('Original legacy question?');
    expect(await promptOf('a-legacy-2')).toBeNull();
    expect(await promptOf('a-captured-1')).toBe('Already captured wording?');
  });

  it('is idempotent — replaying 0030 again changes nothing', async () => {
    await forget0030();
    await expect(ensureSchema()).resolves.toBeUndefined();
    await forget0030();
    await expect(ensureSchema()).resolves.toBeUndefined();
  });
});
