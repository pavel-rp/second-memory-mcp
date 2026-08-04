import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { desc, eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { rubricForQuality } from '../../helpers/grading.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningChunks,
  sessionQuestionAttempts,
  type NewSessionQuestionAttemptRow,
} from '../../../src/infrastructure/db/schema.js';
import { classifyChunk } from '../../../src/domain/algorithms/classify-chunk.js';
import { MS_PER_DAY } from '../../../src/shared/constants/time.js';

/**
 * NEU-844 — every scored attempt persists the answering chunk's pre-review
 * scheduling snapshot. The four columns are the frozen downstream contract for
 * NEU-845 (true retention) and NEU-846 (calibration), so these tests read the
 * raw Drizzle row rather than any projection: `SessionQuestionAttempt` is
 * deliberately not extended (D5).
 */
describe('attempt scheduling snapshot (integration)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopic(id: string, chunkIds: string[]) {
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: `Topic ${id}`,
      subject: 'DP',
      topicSummary: `Topic ${id} for scheduling snapshot tests`,
      chunks: chunkIds.map((cid, i) => ({
        id: cid,
        title: `Chunk ${cid}`,
        content: `Content for chunk ${cid}.`,
        difficulty: 5,
        estimatedDuration: 10,
        order: i + 1,
        chunkType: 'new' as const,
      })),
    });
    expect(topicResult.success).toBe(true);
  }

  /**
   * Force a chunk's SR state directly. Applied *after* `teach_next` so nothing
   * on the teaching path can overwrite it before the answer is scored.
   */
  async function setChunkSchedulingState(
    chunkId: string,
    state: { intervalDays: number | null; daysOverdue: number }
  ) {
    await getSql()
      .update(learningChunks)
      .set({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: state.intervalDays,
        nextReviewAt: Date.now() - state.daysOverdue * MS_PER_DAY,
      })
      .where(eq(learningChunks.id, chunkId));
  }

  async function latestAttempt() {
    const [row] = await getSql()
      .select()
      .from(sessionQuestionAttempts)
      .orderBy(desc(sessionQuestionAttempts.createdAt))
      .limit(1);
    return row;
  }

  // SC-8
  it('persists an established-band snapshot for an overdue chunk with a real interval', async () => {
    await seedTopic('t-established', ['ec1']);
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['ec1'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const teach = await ctx.getNextTeachingStep();
    if (teach.action !== 'teach') throw new Error(`Expected teach, got ${teach.action}`);

    await setChunkSchedulingState('ec1', { intervalDays: 10, daysOverdue: 5 });

    const result = await ctx.submitAnswer({
      promptText: 'Derive the recurrence',
      chunkIds: ['ec1'],
      response: 'dp[i] = max(dp[i-1], dp[i-2] + v[i]); base dp[0]=0, dp[1]=v[1]; i ascending',
      grading: rubricForQuality(4),
      questionType: 'recall',
      feedback: 'Correct.',
      timeSpentMs: 5000,
    });
    expect(result.action).toBe('recorded');

    const attempt = await latestAttempt();
    expect(attempt?.snapshotBand).toBe('established');
    expect(attempt?.snapshotIntervalDays).toBe(10);

    const daysOverdue = attempt?.snapshotDaysOverdue ?? null;
    const predictedRecall = attempt?.snapshotPredictedRecall ?? null;
    if (daysOverdue === null || predictedRecall === null) {
      throw new Error('Expected a fully populated established-band snapshot');
    }
    expect(daysOverdue).toBeCloseTo(5, 2);
    expect(predictedRecall).toBeGreaterThan(0);
    expect(predictedRecall).toBeLessThan(1);

    // The persisted value is exactly what classifyChunk computes for that state —
    // the power law has one home and the snapshot delegates to it.
    const expectedRecall = classifyChunk(
      { easeFactor: 2.5, repetitions: 3, nextReviewAt: 0, intervalDays: 10 },
      new Date(daysOverdue * MS_PER_DAY)
    ).estimatedRetrievability;
    expect(predictedRecall).toBeCloseTo(expectedRecall, 5);
  });

  // SC-9
  it('persists a fresh-band snapshot with a NULL predicted recall for a null-interval chunk', async () => {
    await seedTopic('t-fresh', ['fc1']);
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['fc1'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const teach = await ctx.getNextTeachingStep();
    if (teach.action !== 'teach') throw new Error(`Expected teach, got ${teach.action}`);

    await setChunkSchedulingState('fc1', { intervalDays: null, daysOverdue: 3 });

    const result = await ctx.submitAnswer({
      promptText: 'Derive the recurrence',
      chunkIds: ['fc1'],
      response: 'dp[i] = max(dp[i-1], dp[i-2] + v[i]); base dp[0]=0, dp[1]=v[1]; i ascending',
      grading: rubricForQuality(4),
      questionType: 'recall',
      feedback: 'Correct.',
      timeSpentMs: 5000,
    });
    expect(result.action).toBe('recorded');

    const attempt = await latestAttempt();
    expect(attempt?.snapshotBand).toBe('fresh');
    // No synthetic 1.0 can enter a calibration mean (D2).
    expect(attempt?.snapshotPredictedRecall).toBeNull();
    expect(attempt?.snapshotIntervalDays).toBeNull();
    // daysOverdue is well-defined on the fresh band too and is still captured.
    expect(attempt?.snapshotDaysOverdue).toBeCloseTo(3, 2);
  });

  // SC-10
  it('accepts an attempt row that omits all four snapshot columns and reads them back NULL', async () => {
    await seedTopic('t-uncovered', ['uc1']);
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['uc1'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const teach = await ctx.getNextTeachingStep();
    if (teach.action !== 'teach') throw new Error(`Expected teach, got ${teach.action}`);

    const createResult = await ctx.createSessionQuestions({
      sessionId: sessionResult.data.sessionId,
      questions: [{ promptText: 'Legacy question', chunkIds: ['uc1'] }],
    });
    if (createResult.action !== 'created') throw new Error('Expected created');
    const questionId = createResult.questionIds[0];
    if (questionId === undefined) throw new Error('Expected a created question id');

    // A pre-cutover shaped row: no snapshot columns supplied at all.
    const legacyRow: NewSessionQuestionAttemptRow = {
      id: 'legacy-attempt-1',
      sessionQuestionId: questionId,
      attemptNumber: 1,
      response: 'A pre-cutover answer',
      passed: true,
      feedback: 'Recorded before NEU-844 landed.',
      quality: 4,
      agentQuality: 4,
      questionType: 'recall',
      timeSpentMs: 1234,
      createdAt: Date.now(),
    };
    await getSql().insert(sessionQuestionAttempts).values(legacyRow);

    const [stored] = await getSql()
      .select()
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, 'legacy-attempt-1'));

    expect(stored?.quality).toBe(4);
    expect(stored?.snapshotBand).toBeNull();
    expect(stored?.snapshotPredictedRecall).toBeNull();
    expect(stored?.snapshotIntervalDays).toBeNull();
    expect(stored?.snapshotDaysOverdue).toBeNull();
  });

  // D4
  it('leaves the snapshot NULL for a multi-chunk assessment attempt', async () => {
    await seedTopic('t-multi', ['mc1', 'mc2']);
    const sessionResult = await ctx.createSession({ mode: 'assessment', chunkIds: ['mc1', 'mc2'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const createResult = await ctx.createSessionQuestions({
      sessionId: sessionResult.data.sessionId,
      questions: [{ promptText: 'Evaluate mc1 + mc2', chunkIds: ['mc1', 'mc2'] }],
    });
    if (createResult.action !== 'created') throw new Error('Expected created');

    const step = await ctx.getNextTeachingStep();
    if (step.action !== 'teach') throw new Error(`Expected teach, got ${step.action}`);
    const sessionQuestionId = step.session_question_id;
    if (sessionQuestionId === undefined) throw new Error('Expected a session_question_id');

    // Both chunks are established, with *different* SR states — attributing
    // either one to the single attempt row would corrupt calibration.
    await setChunkSchedulingState('mc1', { intervalDays: 10, daysOverdue: 5 });
    await setChunkSchedulingState('mc2', { intervalDays: 40, daysOverdue: 1 });

    const result = await ctx.submitAnswer({
      response: 'Both follow the same recurrence.',
      grading: rubricForQuality(4),
      questionType: 'analyze_create',
      feedback: 'Correct.',
      timeSpentMs: 6000,
      sessionQuestionId,
    });
    expect(result.action).toBe('recorded');

    const attempt = await latestAttempt();
    expect(attempt?.snapshotBand).toBeNull();
    expect(attempt?.snapshotPredictedRecall).toBeNull();
    expect(attempt?.snapshotIntervalDays).toBeNull();
    expect(attempt?.snapshotDaysOverdue).toBeNull();
  });
});
