import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  sessionEvents,
  learningTopics,
  learningChunks,
} from '../../../src/infrastructure/db/schema.js';
import { DrizzleSessionRepository } from '../../../src/adapters/drizzle/session-repository.js';
import { computeActiveTime } from '../../../src/domain/algorithms/active-time.js';

const MIN = 60_000;
const IDLE_CUTOFF_MS = 10 * MIN;

/**
 * NEU-1016 — proves the persisted `teach_next` event timestamp and the
 * gap-based sitting active-time computation actually round-trip through real
 * Postgres. Unit tests (`active-time.test.ts`) cover the pure computation in
 * isolation; this suite proves the write path (`recordSessionEvent`, wired
 * into `getNextTeachingStep`) and the read path (`getSessionEventTimestamps`,
 * `convertSessionToSessionInput`) actually persist and read back correctly —
 * neither is provable with a stubbed-port unit test.
 */
describe('session active time (integration)', () => {
  let ctx: AppContext;
  let sessionRepo: DrizzleSessionRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    sessionRepo = new DrizzleSessionRepository(getSql());
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopicAndChunk(topicId: string, chunkId: string, now: number) {
    const db = getSql();
    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Active Time Topic',
      subject: 'Testing',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(learningChunks).values({
      id: chunkId,
      topicId,
      title: 'Chunk',
      subject: 'Testing',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: 'Test content',
      contentVersion: null,
      contentUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  it('teach_next persists a session_event timestamp that round-trips through Postgres', async () => {
    const now = Date.now();
    await seedTopicAndChunk('at-t1', 'at-c1', now);

    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['at-c1'] });
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    const teachResult = await ctx.getNextTeachingStep();
    expect(teachResult.action).toBe('teach');

    const rows = await getSql()
      .select()
      .from(sessionEvents)
      .where(eq(sessionEvents.sessionId, sessionId));

    expect(rows.length).toBe(1);
    expect(typeof rows[0]?.createdAt).toBe('number');
    expect(rows[0]?.createdAt).toBeGreaterThanOrEqual(now);
  });

  it('a second teach_next call persists a second event, and the merged series sums correctly', async () => {
    const now = Date.now();
    await seedTopicAndChunk('at-t2', 'at-c2', now);

    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['at-c2'] });
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    await ctx.getNextTeachingStep();
    await ctx.getNextTeachingStep();

    const persisted = await sessionRepo.getSessionEventTimestamps(sessionId);
    expect(persisted.length).toBe(2);
    // Both calls happen well within the idle cutoff of each other — active
    // time is the (small, sub-cutoff) gap between the two real timestamps.
    const { activeTimeMs } = computeActiveTime({
      timestamps: persisted,
      idleCutoffMs: IDLE_CUTOFF_MS,
    });
    expect(activeTimeMs).toBeGreaterThanOrEqual(0);
    expect(activeTimeMs).toBeLessThan(IDLE_CUTOFF_MS);
  });

  it('the sitting computation over persisted timestamps sums sub-cutoff gaps and zeroes at the idle cutoff', async () => {
    const now = Date.now();
    await seedTopicAndChunk('at-t3', 'at-c3', now);

    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['at-c3'] });
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    // Directly seed a controlled event-timestamp series (no real sleeps):
    // gap1 = 5min (sub-cutoff, counts); gap2 = exactly the idle cutoff (resets
    // the sitting to zero); gap3 = 3min (sub-cutoff, counts).
    await sessionRepo.recordSessionEvent(sessionId, now);
    await sessionRepo.recordSessionEvent(sessionId, now + 5 * MIN);
    await sessionRepo.recordSessionEvent(sessionId, now + 5 * MIN + IDLE_CUTOFF_MS);
    await sessionRepo.recordSessionEvent(sessionId, now + 5 * MIN + IDLE_CUTOFF_MS + 3 * MIN);

    const persisted = await sessionRepo.getSessionEventTimestamps(sessionId);
    expect(persisted.length).toBe(4);

    const { activeTimeMs } = computeActiveTime({
      timestamps: persisted,
      idleCutoffMs: IDLE_CUTOFF_MS,
    });
    expect(activeTimeMs).toBe(3 * MIN);
  });

  it('session_status credits no additional active time for a call made long after the last event', async () => {
    const now = Date.now();
    await seedTopicAndChunk('at-t4', 'at-c4', now);

    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['at-c4'] });
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    // Two events, 5 min apart (sub-cutoff), both several hours in the past —
    // this function must never extrapolate active time up to "now".
    const threeHoursAgo = now - 3 * 60 * MIN;
    await sessionRepo.recordSessionEvent(sessionId, threeHoursAgo);
    await sessionRepo.recordSessionEvent(sessionId, threeHoursAgo + 5 * MIN);

    const sessionInput = await ctx.convertSessionToInput(sessionId);
    if (!sessionInput) throw new Error('Failed to convert session to input');
    expect(sessionInput.teach_event_timestamps?.length).toBe(2);

    const validated = ctx.validateSessionContext(sessionInput);
    if (!validated.success) throw new Error('Failed to validate session context');
    // teach_event_timestamps must survive Zod validation (not silently stripped).
    expect(validated.data.teach_event_timestamps?.length).toBe(2);

    const status = ctx.getSessionStatus(validated.data);

    // Well under the 45-minute default ceiling and no fatigue signal (too few
    // attempts) — no break recommendation from the active-time reminder.
    expect(status.recommendation).not.toBe('break');
  });
});
