import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { rubricForQuality, rubricAllClaimedNoSpans } from '../../helpers/grading.js';
import type { RubricGradingPayload } from '../../../src/domain/algorithms/grade-mapper.js';
import type { LeechResolution } from '../../../src/orchestration/review-workflows.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';

/**
 * NEU-930 — DR-M09 leech-trigger-provenance control (OUT-2) and the OUT-3
 * re-presentation-shortfall verification.
 *
 * OUT-2: the persisted `consecutive_failures` leech counter is gated on the C4
 * deterministic mapper grade (NEU-928/929), never a raw agent pass/fail. A bare
 * self-reported pass with no justifying evidence is scored a FAILURE by the
 * mapper and advances the counter (it cannot silently suppress remediation),
 * while an evidenced mapper-pass does not advance it. N genuine mapper-derived
 * failures reach the leech/remediation trigger.
 *
 * OUT-3: none of the live `resolve_leech` resolutions changes how a flagged
 * leech's content is presented — a verification recorded as a routed finding
 * (docs/findings/NEU-930-leech-representation-shortfall.md), not a feature.
 */
describe('leech-trigger provenance + resolve_leech presentation invariance (integration)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopicAndChunk(
    topicId: string,
    chunkId: string,
    overrides: Partial<{
      chunkType: 'new' | 'review' | 'remediation';
      consecutiveFailures: number;
    }> = {}
  ) {
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
      consecutiveFailures: overrides.consecutiveFailures ?? 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: overrides.chunkType ?? 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: `Content for ${chunkId}`,
      contentVersion: null,
      contentUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Run one single-chunk assessment session, grading it with a rubric payload. */
  async function assessChunkOnce(chunkId: string, grading: RubricGradingPayload): Promise<string> {
    const sessionResult = await ctx.createSession({ mode: 'assessment', chunkIds: [chunkId] });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Failed to create assessment session');
    const sessionId = sessionResult.data.sessionId;

    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: `Assess: ${chunkId}`, chunkIds: [chunkId] }],
    });
    if (createResult.action !== 'created') throw new Error('Expected created');

    const step = await ctx.getNextTeachingStep();
    if (step.action !== 'teach') throw new Error(`Expected teach, got ${step.action}`);
    expect(step.session_question_id).toBeDefined();

    const answer = await ctx.submitAnswer({
      response: 'Learner answer',
      grading,
      questionType: 'recall',
      feedback: 'graded',
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

  // ── OUT-2: leech-trigger provenance (mapper-gated counter) ─────────────────

  it('a falsely-passed self-report (no justifying spans) is scored a failure and advances the counter', async () => {
    await seedTopicAndChunk('t-false-pass', 'cf1');

    // The agent claims every rubric criterion true but supplies NO justifying
    // spans. A raw agent pass/fail would record this as a PASS; the deterministic
    // mapper credits nothing → quality 0 → failure. The counter advances.
    await assessChunkOnce('cf1', rubricAllClaimedNoSpans());

    const row = await getChunkRow('cf1');
    expect(row.consecutiveFailures).toBe(1);
    expect(row.chunkType).toBe('review');
  });

  it('an evidenced mapper-pass does NOT advance the counter — the mapper owns the decision', async () => {
    await seedTopicAndChunk('t-real-pass', 'cf1');

    // First a genuine mapper-derived failure lifts the counter.
    await assessChunkOnce('cf1', rubricForQuality(1));
    expect((await getChunkRow('cf1')).consecutiveFailures).toBe(1);

    // Same "all criteria claimed" surface as the false pass above, but WITH
    // justifying spans → mapper quality 5 → pass. The counter resets, proving the
    // pass/fail decision that gates the counter is the mapper's, not a raw report.
    await assessChunkOnce('cf1', rubricForQuality(5));
    const row = await getChunkRow('cf1');
    expect(row.consecutiveFailures).toBe(0);
    expect(row.chunkType).toBe('review');
  });

  it('N genuine mapper-derived failures reach the leech/remediation trigger; a false pass among them cannot suppress it', async () => {
    await seedTopicAndChunk('t-trigger', 'cf1');

    // Build a real evidence base (leechFailureThreshold=6): three evidenced passes.
    await assessChunkOnce('cf1', rubricForQuality(5));
    await assessChunkOnce('cf1', rubricForQuality(5));
    await assessChunkOnce('cf1', rubricForQuality(5));
    expect((await getChunkRow('cf1')).chunkType).toBe('review');

    // Two genuine failures.
    await assessChunkOnce('cf1', rubricForQuality(1));
    await assessChunkOnce('cf1', rubricForQuality(1));
    const beforeTrigger = await getChunkRow('cf1');
    expect(beforeTrigger.consecutiveFailures).toBe(2);
    expect(beforeTrigger.chunkType).toBe('review');

    // The sixth attempt is an over-validated false pass (claims all criteria, no
    // spans). It is scored a FAILURE by the mapper — it does not reset the run —
    // so both gates (consecutive_failures=3, total_attempts=6) are reached.
    const finalSessionId = await assessChunkOnce('cf1', rubricAllClaimedNoSpans());
    const row = await getChunkRow('cf1');
    expect(row.consecutiveFailures).toBe(3);
    expect(row.chunkType).toBe('remediation');

    const result = await ctx.recommendRemediation(finalSessionId);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(`Expected success: ${result.error.message}`);
    const weak = result.data.weakChunks.find(w => w.chunkId === 'cf1');
    expect(weak).toBeDefined();
    expect(weak!.leech).toBe(true);
    expect(weak!.reasonCode).toBe('LEECH_THRESHOLD');
  });

  // ── OUT-3: resolve_leech never changes how content is presented ────────────

  const resolutions: LeechResolution[] = ['reset_progress', 'archive', 'mark_reviewed'];

  it.each(resolutions)(
    'resolve_leech "%s" leaves the presented content (content + title) byte-identical',
    async resolution => {
      const chunkId = `res-${resolution}`;
      await seedTopicAndChunk(`t-${resolution}`, chunkId, {
        chunkType: 'remediation',
        consecutiveFailures: 3,
      });

      const before = await getChunkRow(chunkId);
      expect(before.chunkType).toBe('remediation');

      const resolved = await ctx.resolveLeech(chunkId, resolution);
      expect(resolved.success).toBe(true);
      if (!resolved.success) throw new Error(`resolveLeech failed: ${resolved.error.message}`);

      const after = await getChunkRow(chunkId);
      // The presentation-changing / reformulation action (DR-M09 behavior 1) is
      // ABSENT: no resolution rewrites the content the learner sees.
      expect(after.content).toBe(before.content);
      expect(after.title).toBe(before.title);
      // The flag is cleared (leech resolved), confirming the resolution ran.
      expect(after.chunkType).toBe('review');
      expect(after.consecutiveFailures).toBe(0);
    }
  );
});
