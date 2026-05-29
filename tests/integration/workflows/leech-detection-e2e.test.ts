import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';

/**
 * NEU-740 — proves leech detection is reachable through the real MCP tool flow.
 *
 * Unlike assessment-remediation-e2e.test.ts, NO chunk is seeded with
 * chunk_type='remediation'. The chunk starts as 'new' and only becomes a leech
 * because repeated failing reviews drive the persisted consecutive_failures
 * counter past the threshold (default 3).
 */
describe('leech detection via the MCP tool flow (integration)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopicAndChunk(topicId: string, chunkId: string) {
    const db = getSql();
    const now = Date.now();
    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
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
      title: `Chunk ${chunkId}`,
      subject: 'Testing',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new', // NOT seeded as a leech
      prerequisitesJson: [],
      tagsJson: [],
      content: `Content for ${chunkId}`,
      contentVersion: null,
      contentUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Run one single-chunk assessment session and grade it pass/fail. Returns the session id. */
  async function assessChunkOnce(chunkId: string, pass: boolean): Promise<string> {
    const sessionResult = await ctx.createSession({ mode: 'assessment', chunkIds: [chunkId] });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Failed to create assessment session');
    const sessionId = sessionResult.data.sessionId;

    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: `Assess: ${chunkId}`, chunkIds: [chunkId] }],
    });
    expect(createResult.action).toBe('created');
    if (createResult.action !== 'created') throw new Error('Expected created');

    const step = await ctx.getNextTeachingStep();
    if (step.action !== 'teach') throw new Error(`Expected teach, got ${step.action}`);
    expect(step.session_question_id).toBeDefined();

    const answer = await ctx.submitAnswer({
      response: pass ? 'Correct answer' : 'Wrong answer',
      quality: pass ? 5 : 1,
      questionType: 'recall',
      feedback: pass ? 'Good' : 'Incorrect',
      timeSpentMs: 5000,
      sessionQuestionId: step.session_question_id!,
    });
    expect(answer.action).toBe('recorded');

    const completeStep = await ctx.getNextTeachingStep();
    expect(completeStep.action).toBe('complete');

    const session = await ctx.getSessionById(sessionId);
    if (session?.status !== 'completed') {
      await ctx.completeSession(sessionId, undefined);
    }
    return sessionId;
  }

  async function getChunkRow(chunkId: string) {
    const db = getSql();
    const [row] = await db.select().from(learningChunks).where(eq(learningChunks.id, chunkId));
    return row;
  }

  it('counter rises with each failure and is not a leech below the threshold', async () => {
    await seedTopicAndChunk('t-rise', 'cf1');

    await assessChunkOnce('cf1', false);
    expect((await getChunkRow('cf1')).consecutiveFailures).toBe(1);

    await assessChunkOnce('cf1', false);
    const afterTwo = await getChunkRow('cf1');
    expect(afterTwo.consecutiveFailures).toBe(2);
    // Two failures is below the default threshold of 3 — still not a leech.
    expect(afterTwo.chunkType).toBe('review');
  });

  it('three consecutive failures flip the chunk to a leech and recommend scaffolding', async () => {
    await seedTopicAndChunk('t-leech', 'cf1');

    await assessChunkOnce('cf1', false);
    await assessChunkOnce('cf1', false);
    const thirdSessionId = await assessChunkOnce('cf1', false);

    // The counter reached the threshold and the chunk became a leech — produced
    // entirely by the tool flow, with no direct chunk_type seed.
    const row = await getChunkRow('cf1');
    expect(row.consecutiveFailures).toBe(3);
    expect(row.chunkType).toBe('remediation');

    const result = await ctx.recommendRemediation(thirdSessionId);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(`Expected success: ${result.error.message}`);

    const weak = result.data.weakChunks.find(w => w.chunkId === 'cf1');
    expect(weak).toBeDefined();
    expect(weak!.leech).toBe(true);
    expect(weak!.reasonCode).toBe('LEECH_THRESHOLD');
    expect(result.data.recommendedNextSession.mode).toBe('scaffolding');
  });

  it('a passing review resets the counter but the chunk stays remediation until resolved', async () => {
    await seedTopicAndChunk('t-recover', 'cf1');

    await assessChunkOnce('cf1', false);
    await assessChunkOnce('cf1', false);
    await assessChunkOnce('cf1', false);
    expect((await getChunkRow('cf1')).chunkType).toBe('remediation');

    await assessChunkOnce('cf1', true);

    const row = await getChunkRow('cf1');
    expect(row.consecutiveFailures).toBe(0); // reset by the passing review
    expect(row.chunkType).toBe('remediation'); // leech is NOT auto-cleared

    // Explicit resolution returns it to 'review' and clears the counter.
    const resolved = await ctx.resolveLeech('cf1', 'mark_reviewed');
    expect(resolved.success).toBe(true);
    const afterResolve = await getChunkRow('cf1');
    expect(afterResolve.chunkType).toBe('review');
    expect(afterResolve.consecutiveFailures).toBe(0);
  });
});
