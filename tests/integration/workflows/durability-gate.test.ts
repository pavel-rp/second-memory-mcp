import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { rubricForQuality } from '../../helpers/grading.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  sessionQuestionAttempts,
  sessionQuestionChunks,
} from '../../../src/infrastructure/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * NEU-931 durability gate — DB-backed ship-gate.
 *
 * A prerequisite with a single successful (persisted) review does NOT unlock
 * its dependent: the retrievability-posterior after one success (2/3 ≈ 0.667)
 * stays below the 0.90 durability bar, so the gate fails closed and re-inserts
 * the prerequisite ahead of the dependent. This is the exact regression DR-M10
 * pins — the former `repetitions > 0` / R ≥ 0.5 rule would have unlocked here.
 */
describe('durability gate — single-success prerequisite stays locked (NEU-931)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('does not unlock a dependent when its prerequisite has only one successful review', async () => {
    // Topic with foundation A and dependent B (B requires A).
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Durability Gate Test',
      subject: 'Testing',
      topicSummary: 'Single-success prerequisite must stay locked',
      chunks: [
        {
          id: 'dur-a',
          title: 'Foundation A',
          content: 'This is the foundation concept A.',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
        {
          id: 'dur-b',
          title: 'Dependent B (requires A)',
          content: 'Building on concept A.',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
          prerequisites: ['dur-a'],
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    // Give A exactly ONE successful graded attempt via the real submit flow.
    const sessionA = await ctx.createSession({ mode: 'learning', chunkIds: ['dur-a'] });
    expect(sessionA.success).toBe(true);
    if (!sessionA.success) throw new Error('Expected session A creation to succeed');

    const teachA = await ctx.getNextTeachingStep();
    expect(teachA.action).toBe('teach');
    if (teachA.action !== 'teach') throw new Error('Expected teach');
    expect(teachA.chunk_id).toBe('dur-a');

    const submitA = await ctx.submitAnswer({
      promptText: 'What is Foundation A?',
      chunkIds: ['dur-a'],
      response: 'The foundation concept A.',
      grading: rubricForQuality(5),
      questionType: 'recall',
      feedback: 'Correct',
      timeSpentMs: 3000,
    });
    expect(submitA.action).toBe('recorded');

    // Confirm the single successful observation is persisted for A.
    const observations = await getSql()
      .select({ quality: sessionQuestionAttempts.quality })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestionChunks,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestionChunks.sessionQuestionId)
      )
      .where(eq(sessionQuestionChunks.chunkId, 'dur-a'));
    const passed = observations.filter(o => (o.quality ?? 0) >= 3);
    expect(passed.length).toBe(1);

    // Close session A so a fresh session can become active.
    await ctx.completeSession(sessionA.data.sessionId, undefined);

    // New session with ONLY the dependent B. The gate must fail closed: A's
    // single-success posterior is below the bar, so B stays locked and A is
    // re-served as a stale prerequisite ahead of B.
    const sessionB = await ctx.createSession({ mode: 'learning', chunkIds: ['dur-b'] });
    expect(sessionB.success).toBe(true);

    const teachB = await ctx.getNextTeachingStep();
    expect(teachB.action).toBe('teach');
    if (teachB.action !== 'teach') throw new Error('Expected teach');

    // Dependent B is NOT served first — the under-durable prerequisite A is.
    expect(teachB.chunk_id).toBe('dur-a');
    expect(teachB.prerequisite_reteach_needed).toEqual(['dur-a']);
  });
});
