import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../../src/infrastructure/db/schema.js';
import { STDIO_PLACEHOLDER_LEARNER_KEY } from '../../../src/shared/learner-context.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

/**
 * NEU-1042: DB-backed concurrency tests proving the pause/resume/complete transitions are
 * atomic. Two real concurrent tool-handler invocations are fired via `Promise.all` against the
 * same Postgres connection pool, so the actual CAS-guarded UPDATE statements (and, for the
 * unique-index test, the actual INSERT) race for real — this cannot be proven by unit tests
 * against stubbed ports (CLAUDE.md integration-test rule).
 */
describe('Integration: Session atomicity (NEU-1042)', () => {
  let server: CaptureServer;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer() as any;
    registerServerTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  async function insertTopic(id: string, title: string) {
    const now = Date.now();
    await getSql()
      .insert(learningTopics)
      .values({ id, title, subject: 'Math', createdAt: now, updatedAt: now });
  }

  async function insertChunk(id: string, topicId: string) {
    const now = Date.now();
    await getSql()
      .insert(learningChunks)
      .values({
        id,
        topicId,
        title: `Chunk ${id}`,
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: now - 1000,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });
  }

  async function activeSessionCount(): Promise<number> {
    const rows = await getSql()
      .select()
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.status, 'active'),
          eq(learningSessions.learnerKey, STDIO_PLACEHOLDER_LEARNER_KEY)
        )
      );
    return rows.length;
  }

  it('two concurrent topic-switch create_session calls: exactly one active session results, the loser is a structured conflict', async () => {
    await insertTopic('topic-1', 'Topic 1');
    await insertTopic('topic-2', 'Topic 2');
    await insertTopic('topic-3', 'Topic 3');

    const createSessionTool = server.tools.get('create_session');
    if (!createSessionTool) throw new Error('create_session tool not found');

    // One active session on topic-1.
    const initial = parseToolResult(
      await createSessionTool.handler({
        topic_id: 'topic-1',
        mode: 'learning',
        context_token: 'ctx-test',
      })
    );
    expect(initial.data.action).toBe('created');

    // Two concurrent switches to two *different* topics both race to pause the same active
    // session before creating their own.
    const [resultA, resultB] = await Promise.all([
      createSessionTool.handler({
        topic_id: 'topic-2',
        mode: 'learning',
        context_token: 'ctx-test',
      }),
      createSessionTool.handler({
        topic_id: 'topic-3',
        mode: 'learning',
        context_token: 'ctx-test',
      }),
    ]);
    const parsedA = parseToolResult(resultA);
    const parsedB = parseToolResult(resultB);

    const outcomes = [parsedA, parsedB];
    const created = outcomes.filter(o => o.status === 'ok' && o.data.action === 'created');
    const conflicts = outcomes.filter(o => o.status === 'error');

    expect(created).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].error.type).toBe('conflict');

    // Never a raw database/internal error for this race.
    expect(conflicts[0].error.type).not.toBe('internal');

    expect(await activeSessionCount()).toBe(1);
  });

  it('two concurrent resumes of the same paused session: exactly one succeeds and no duplicate session_chunks rows result', async () => {
    await insertTopic('topic-a', 'Topic A');
    await insertChunk('chunk-a1', 'topic-a');
    await insertChunk('chunk-a2', 'topic-a');

    const createSessionTool = server.tools.get('create_session');
    const startLearningTool = server.tools.get('start_learning');
    if (!createSessionTool) throw new Error('create_session tool not found');
    if (!startLearningTool) throw new Error('start_learning tool not found');

    const created = parseToolResult(
      await createSessionTool.handler({
        topic_id: 'topic-a',
        chunk_ids: ['chunk-a1', 'chunk-a2'],
        mode: 'learning',
        context_token: 'ctx-test',
      })
    );
    expect(created.data.action).toBe('created');
    const sessionId: string = created.data.session_id;

    // Set the session aside as paused (session-1042 test setup only — not itself under test).
    const pausedAt = Date.now();
    await getSql()
      .update(learningSessions)
      .set({ status: 'paused', pausedAt, updatedAt: pausedAt })
      .where(eq(learningSessions.id, sessionId));

    // Two concurrent explicit-topic resumes of the same paused session, with no active session
    // in the way, race on the CAS-guarded paused -> active flip.
    const [resultA, resultB] = await Promise.all([
      startLearningTool.handler({ topic_id: 'topic-a', context_token: 'ctx-test' }),
      startLearningTool.handler({ topic_id: 'topic-a', context_token: 'ctx-test' }),
    ]);
    const parsedA = parseToolResult(resultA);
    const parsedB = parseToolResult(resultB);

    const actions = [parsedA.data.action, parsedB.data.action].sort();
    expect(actions).toEqual(['error', 'resumed']);

    expect(await activeSessionCount()).toBe(1);

    const chunkRows = await getSql()
      .select()
      .from(sessionChunks)
      .where(eq(sessionChunks.sessionId, sessionId));
    const pairs = chunkRows.map(r => `${r.sessionId}:${r.chunkId}`);
    expect(new Set(pairs).size).toBe(pairs.length); // no duplicate (session_id, chunk_id) rows
  });

  it('a Postgres unique-violation on the partial active-session index maps to a structured conflict, not a database error', async () => {
    await insertTopic('topic-x', 'Topic X');

    const createSessionTool = server.tools.get('create_session');
    if (!createSessionTool) throw new Error('create_session tool not found');

    // No active session exists yet for either call, so both bypass the pause-CAS branch
    // entirely and race directly on the insert — the only way to exercise the unique index
    // itself (rather than the CAS guard that normally prevents reaching it).
    const [resultA, resultB] = await Promise.all([
      createSessionTool.handler({
        topic_id: 'topic-x',
        mode: 'learning',
        context_token: 'ctx-test',
      }),
      createSessionTool.handler({
        topic_id: 'topic-x',
        mode: 'learning',
        context_token: 'ctx-test',
      }),
    ]);
    const parsedA = parseToolResult(resultA);
    const parsedB = parseToolResult(resultB);

    const outcomes = [parsedA, parsedB];
    const created = outcomes.filter(o => o.status === 'ok' && o.data.action === 'created');
    const conflicts = outcomes.filter(o => o.status === 'error');

    expect(created).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].error.type).toBe('conflict');
    expect(conflicts[0].error.type).not.toBe('internal');

    expect(await activeSessionCount()).toBe(1);
  });

  it('a CAS mismatch on completeSession reports the existing conflict shape (zero-row branch)', async () => {
    await insertTopic('topic-z', 'Topic Z');

    const createSessionTool = server.tools.get('create_session');
    const completeSessionTool = server.tools.get('complete_session');
    if (!createSessionTool) throw new Error('create_session tool not found');
    if (!completeSessionTool) throw new Error('complete_session tool not found');

    const created = parseToolResult(
      await createSessionTool.handler({
        topic_id: 'topic-z',
        mode: 'learning',
        context_token: 'ctx-test',
      })
    );
    const sessionId: string = created.data.session_id;

    // Pause it out from under complete_session so the CAS guard (expectedStatus: 'active')
    // observes a mismatch — this is the zero-row / CAS-mismatch branch CLAUDE.md requires
    // explicit coverage for, distinct from the concurrent-race scenarios above.
    const pausedAt = Date.now();
    await getSql()
      .update(learningSessions)
      .set({ status: 'paused', pausedAt, updatedAt: pausedAt })
      .where(eq(learningSessions.id, sessionId));

    const result = parseToolResult(
      await completeSessionTool.handler({ session_id: sessionId, context_token: 'ctx-test' })
    );

    expect(result.status).toBe('error');
    expect(result.error.type).toBe('conflict');

    const [row] = await getSql()
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(row?.status).toBe('paused'); // unchanged — the CAS guard prevented the write
  });
});
