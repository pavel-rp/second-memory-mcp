import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../src/composition-root.js';
import { withLearnerAuthContext } from '../../src/shared/learner-context.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

/**
 * NEU-1015 — DB-backed learner-isolation suite (hard ship-gate per this repo's
 * CLAUDE.md rule on DB-mutating/scoping paths: unit tests with stubbed ports
 * cannot prove cross-learner scoping at the real SQL predicate).
 *
 * Exercises the real composition root + the real `DrizzleSessionRepository`
 * against a real Postgres instance — the only way to prove the `learner_key`
 * predicate (the enforcement point in `src/adapters/drizzle/session-repository.ts`)
 * actually isolates rows, rather than merely that the right argument was passed
 * to a stub.
 *
 * A "request" for one learner is simulated by wrapping calls in
 * `withLearnerAuthContext(rawSub, fn)` — the exact `AsyncLocalStorage` context
 * `jwt-middleware.ts` establishes per real HTTP request. A call made with no
 * wrapper at all reproduces the stdio path (no learner-auth context exists,
 * so `composition-root.ts` resolves the fixed `STDIO_PLACEHOLDER_LEARNER_KEY`).
 */
describe('learner session isolation (NEU-1015)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  const LEARNER_A = 'learner-a-sub';
  const LEARNER_B = 'learner-b-sub';

  async function seedTopicAndChunk(topicId: string, chunkId: string, now: number) {
    const db = getSql();
    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(learningChunks).values({
      id: chunkId,
      topicId,
      title: 'Test Chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: null,
      contentVersion: null,
      contentUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ── Schema ──────────────────────────────────────────────────────

  it('learning_sessions.learner_key exists as a NOT NULL column (NEU-1019)', async () => {
    const db = getSql();
    const result = await db.execute<{ is_nullable: string; data_type: string }>(sql`
      SELECT is_nullable, data_type FROM information_schema.columns
      WHERE table_name = 'learning_sessions' AND column_name = 'learner_key'
    `);
    expect(result.rows).toHaveLength(1);
    // NEU-1019 backfills every pre-existing row and enforces NOT NULL —
    // superseding NEU-1015's original nullable-by-design shape.
    expect(result.rows[0]?.is_nullable).toBe('NO');
    expect(result.rows[0]?.data_type).toBe('text');
  });

  // ── create_session / start_learning / get_active_session ───────

  it('two learners each get their own active session, invisible to the other', async () => {
    const createdA = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(createdA.success).toBe(true);

    // Learner B is not blocked by A's active session — proves creation is scoped.
    const createdB = await withLearnerAuthContext(LEARNER_B, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(createdB.success).toBe(true);

    const activeA = await withLearnerAuthContext(LEARNER_A, () => ctx.getActiveSession());
    const activeB = await withLearnerAuthContext(LEARNER_B, () => ctx.getActiveSession());
    expect(activeA?.id).not.toBeUndefined();
    expect(activeB?.id).not.toBeUndefined();
    expect(activeA?.id).not.toBe(activeB?.id);

    // A creating a second session now conflicts with A's OWN active session —
    // proves A's session is visible to A (not merely that B is isolated).
    const secondA = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(secondA.success).toBe(false);
  });

  // ── get_session / session_status / complete_session by the other's id ──

  it('get_session, session_status, and complete_session refuse the other learner id (not found)', async () => {
    const created = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(created.success).toBe(true);
    if (!created.success) throw new Error('setup failed');
    const sessionIdA = created.data.sessionId;

    // Sanity: the owner can read their own session (get_session / session_status).
    const ownRead = await withLearnerAuthContext(LEARNER_A, () => ctx.getSessionById(sessionIdA));
    expect(ownRead?.id).toBe(sessionIdA);

    // The other learner sees nothing (get_session / session_status backing call).
    const crossRead = await withLearnerAuthContext(LEARNER_B, () => ctx.getSessionById(sessionIdA));
    expect(crossRead).toBeNull();

    // complete_session reports not-found rather than completing the other learner's session.
    const crossComplete = await withLearnerAuthContext(LEARNER_B, () =>
      ctx.completeSession(sessionIdA, 'hijacked')
    );
    expect(crossComplete.success).toBe(false);
    if (!crossComplete.success) {
      expect(crossComplete.error.type).toBe('not_found');
    }

    // The session is unaffected — still active and unowned by the attacker.
    const stillActive = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.getSessionById(sessionIdA)
    );
    expect(stillActive?.status).toBe('active');
  });

  // ── batch_update_session_chunks by the other's id ────────────────

  it('batch_update_session_chunks refuses the other learner id and touches no chunk', async () => {
    const now = Date.now();
    await seedTopicAndChunk('topic-iso', 'chunk-iso', now);

    const created = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning', chunkIds: ['chunk-iso'] })
    );
    expect(created.success).toBe(true);
    if (!created.success) throw new Error('setup failed');
    const sessionIdA = created.data.sessionId;

    const chunksBefore = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.getSessionChunks(sessionIdA)
    );
    expect(chunksBefore).toHaveLength(1);
    expect(chunksBefore[0]?.status).toBe('pending');

    const crossUpdate = await withLearnerAuthContext(LEARNER_B, () =>
      ctx.batchUpdateSessionChunks(sessionIdA, [
        { chunkId: 'chunk-iso', status: 'completed', timeSpentMs: 99999 },
      ])
    );
    expect(crossUpdate.success).toBe(false);
    if (!crossUpdate.success) {
      expect(crossUpdate.error.type).toBe('not_found');
    }

    // No chunk was read or written by the attacker's call.
    const chunksAfter = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.getSessionChunks(sessionIdA)
    );
    expect(chunksAfter).toHaveLength(1);
    expect(chunksAfter[0]?.status).toBe('pending');
    expect(chunksAfter[0]?.timeSpentMs).toBe(0);

    // The other learner's own (unrelated) lookup by the same raw id sees nothing.
    const crossChunks = await withLearnerAuthContext(LEARNER_B, () =>
      ctx.getSessionChunks(sessionIdA)
    );
    expect(crossChunks).toHaveLength(0);
  });

  // ── session-input / remediation lookups by the other's id ───────

  it('convertSessionToInput and recommendRemediation leak nothing to the other learner id', async () => {
    const created = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(created.success).toBe(true);
    if (!created.success) throw new Error('setup failed');
    const sessionIdA = created.data.sessionId;

    const crossInput = await withLearnerAuthContext(LEARNER_B, () =>
      ctx.convertSessionToInput(sessionIdA)
    );
    expect(crossInput).toBeNull();

    const crossRemediation = await withLearnerAuthContext(LEARNER_B, () =>
      ctx.recommendRemediation(sessionIdA)
    );
    expect(crossRemediation.success).toBe(false);
    if (!crossRemediation.success) {
      expect(crossRemediation.error.type).toBe('not_found');
    }

    // The owner's own read still works — the refusal is learner-scoped, not global.
    const ownInput = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.convertSessionToInput(sessionIdA)
    );
    expect(ownInput?.session_id).toBe(sessionIdA);
  });

  // ── teach_next / submit_answer only ever touch the caller's own session ──

  it('teach_next reports no active session for a learner who has none, even while another learner does', async () => {
    const created = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(created.success).toBe(true);

    const stepForB = await withLearnerAuthContext(LEARNER_B, () => ctx.getNextTeachingStep());
    expect(stepForB.action).toBe('error');
    if (stepForB.action === 'error') {
      expect(stepForB.message).toContain('No active session');
    }
  });

  // ── azp-only / sub-less token principal: refused before any lookup ──

  describe('a principal with no sub is refused before any session is read or written', () => {
    it('ServiceResult-returning entry points fail closed (validation error, nothing created)', async () => {
      const result = await withLearnerAuthContext(undefined, () =>
        ctx.createSession({ mode: 'learning' })
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('validation');
      }

      // Nothing was created — no session exists for any learner afterward.
      const activeA = await withLearnerAuthContext(LEARNER_A, () => ctx.getActiveSession());
      expect(activeA).toBeNull();
    });

    it('raw-returning entry points throw rather than performing any lookup', () => {
      // NEU-1015: `ctx.getSessionById`/`ctx.getActiveSession` are plain (non-`async`) arrow
      // functions that call `resolveLearnerKeyOrThrow()` as an argument expression — a refusal
      // throws *synchronously*, before any Promise is ever returned. `withLearnerAuthContext`
      // (a thin `AsyncLocalStorage.run` wrapper) propagates that synchronous throw unchanged, so
      // this asserts a synchronous throw (`toThrow`), not a rejected Promise (`.rejects.toThrow`)
      // — the server tool layer's own try/catch (CLAUDE.md's documented convention) catches
      // both forms identically, so this is a source behavior detail, not a defect.
      expect(() => withLearnerAuthContext(undefined, () => ctx.getSessionById('whatever'))).toThrow(
        /sub/i
      );
      expect(() => withLearnerAuthContext(undefined, () => ctx.getActiveSession())).toThrow(/sub/i);
    });
  });

  // ── stdio path uses the fixed placeholder, isolated from token-transport learners ──

  it('a stdio-created session (no learner-auth context) is invisible to a token-transport learner and vice versa', async () => {
    // No withLearnerAuthContext wrapper at all — reproduces the stdio path.
    const stdioCreated = await ctx.createSession({ mode: 'learning' });
    expect(stdioCreated.success).toBe(true);

    const seenByTokenLearner = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.getActiveSession()
    );
    expect(seenByTokenLearner).toBeNull();

    const tokenCreated = await withLearnerAuthContext(LEARNER_A, () =>
      ctx.createSession({ mode: 'learning' })
    );
    expect(tokenCreated.success).toBe(true);

    // The stdio caller (still no context) does not see the token-transport learner's session.
    const seenByStdio = await ctx.getActiveSession();
    expect(seenByStdio?.status).toBe('active');
    if (!tokenCreated.success) throw new Error('setup failed');
    expect(seenByStdio?.id).not.toBe(tokenCreated.data.sessionId);

    // A second stdio call resolves the SAME fixed placeholder key, so it sees the
    // first stdio-created session as its own active session (mutually visible to stdio).
    if (!stdioCreated.success) throw new Error('setup failed');
    expect(seenByStdio?.id).toBe(stdioCreated.data.sessionId);
  });
});
