import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { desc, eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { rubricForQuality, rubricAllClaimedNoSpans } from '../../helpers/grading.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { sessionQuestionAttempts } from '../../../src/infrastructure/db/schema.js';

/**
 * NEU-928 — the persisted grade at every grade-writing site (teaching mode,
 * assessment mode, revise_grade) is derived by the deterministic mapper. No
 * agent-supplied raw quality/pass survives: an adversarial payload that claims
 * every criterion true but supplies NO justifying spans is schema-valid yet maps
 * to quality 0 (fail-closed) — a bare high self-report can never certify a pass.
 */
describe('rubric-anchored grading cutover — all grade-writing sites (integration)', () => {
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
      topicSummary: `Topic ${id} for grading cutover tests`,
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

  async function latestAttempt() {
    const db = getSql();
    const [row] = await db
      .select()
      .from(sessionQuestionAttempts)
      .orderBy(desc(sessionQuestionAttempts.createdAt))
      .limit(1);
    return row;
  }

  it('teaching mode: an unevidenced rubric fails closed to a mapper-derived quality 0', async () => {
    await seedTopic('t-teach', ['tc1']);
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['tc1'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const teach = await ctx.getNextTeachingStep();
    if (teach.action !== 'teach') throw new Error(`Expected teach, got ${teach.action}`);

    const result = await ctx.submitAnswer({
      promptText: 'What is the recurrence?',
      chunkIds: ['tc1'],
      response: 'I think it is obviously correct.',
      grading: rubricAllClaimedNoSpans(),
      questionType: 'recall',
      feedback: 'No evidence supplied.',
      timeSpentMs: 4000,
    });

    // quality 0 < 3 → fail → first-attempt retry (the attempt is still persisted).
    expect(result.action).toBe('retry');

    const attempt = await latestAttempt();
    expect(attempt?.quality).toBe(0); // mapper-derived, fail-closed
    expect(attempt?.agentQuality).toBe(0); // no raw high self-report persisted
    expect(attempt?.passed).toBe(false); // a bare self-report cannot certify a pass
  });

  it('assessment mode: an unevidenced rubric fails closed with full 0–5 granularity preserved', async () => {
    await seedTopic('t-assess', ['ac1', 'ac2']);
    const sessionResult = await ctx.createSession({ mode: 'assessment', chunkIds: ['ac1', 'ac2'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const createResult = await ctx.createSessionQuestions({
      sessionId: sessionResult.data.sessionId,
      questions: [{ promptText: 'Evaluate ac1+ac2', chunkIds: ['ac1', 'ac2'] }],
    });
    if (createResult.action !== 'created') throw new Error('Expected created');

    const step = await ctx.getNextTeachingStep();
    if (step.action !== 'teach') throw new Error(`Expected teach, got ${step.action}`);

    const result = await ctx.submitAnswer({
      response: 'Trust me, all correct.',
      grading: rubricAllClaimedNoSpans(),
      questionType: 'analyze_create',
      feedback: 'No evidence supplied.',
      timeSpentMs: 6000,
      sessionQuestionId: step.session_question_id!,
    });

    expect(result.action).toBe('recorded');
    if (result.action !== 'recorded') throw new Error('Expected recorded');
    // No binary 4/2 collapse — the fail-closed mapper value 0 is persisted verbatim.
    expect(result.quality).toBe(0);
    expect(result.passed).toBe(false);

    const attempt = await latestAttempt();
    expect(attempt?.quality).toBe(0);
    expect(attempt?.agentQuality).toBe(0);
    expect(attempt?.passed).toBe(false);
  });

  it('revise_grade: the corrected grade resolves through the mapper — no raw newQuality persists', async () => {
    await seedTopic('t-revise', ['rc1']);
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['rc1'] });
    if (!sessionResult.success) throw new Error('session creation failed');

    const teach = await ctx.getNextTeachingStep();
    if (teach.action !== 'teach') throw new Error(`Expected teach, got ${teach.action}`);

    // Seed a genuine pass (rubric maps to 4).
    const submit = await ctx.submitAnswer({
      promptText: 'Derive the recurrence',
      chunkIds: ['rc1'],
      response: 'dp[i] = max(dp[i-1], dp[i-2] + v[i]); base dp[0]=0, dp[1]=v[1]; i ascending',
      grading: rubricForQuality(4),
      questionType: 'recall',
      feedback: 'Correct.',
      timeSpentMs: 5000,
    });
    if (submit.action !== 'recorded') throw new Error(`Expected recorded, got ${submit.action}`);
    const sessionQuestionId = submit.session_question_id;

    const before = await latestAttempt();
    expect(before?.quality).toBe(4);
    expect(before?.passed).toBe(true);
    const attemptId = before!.id;

    // Revise with an adversarial, unevidenced payload. If a raw newQuality path
    // survived, a high value could slip through; instead the mapper fails closed to 0.
    const revised = await ctx.reviseGrade({
      sessionQuestionId,
      grading: rubricAllClaimedNoSpans(),
      newFeedback: 'On reflection there was no real evidence.',
      reason: 'agent_misjudged_correctness',
    });
    expect(revised.action).toBe('revised');
    if (revised.action !== 'revised') throw new Error('Expected revised');
    expect(revised.revised_attempt.new_quality).toBe(0);
    expect(revised.revised_attempt.new_passed).toBe(false);

    const db = getSql();
    const [live] = await db
      .select()
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, attemptId));
    // The live attempt row now holds the mapper-derived 0, not a raw agent number.
    expect(live?.quality).toBe(0);
    expect(live?.agentQuality).toBe(0);
    expect(live?.passed).toBe(false);
  });
});
