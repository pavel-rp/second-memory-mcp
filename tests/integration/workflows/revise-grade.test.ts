import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { rubricForQuality } from '../../helpers/grading.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  sessionChunks,
  sessionQuestionAttempts,
  sessionQuestionAttemptRevisions,
} from '../../../src/infrastructure/db/schema.js';

describe('revise_grade (integration)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedInProgressAttempt(initialQuality: number) {
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Revise Grade Topic',
      subject: 'Testing',
      topicSummary: 'Topic for revise_grade tests',
      chunks: [
        {
          id: 'rg-c1',
          title: 'Chunk A',
          content: 'Content for chunk A.',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['rg-c1'] });
    if (!sessionResult.success) throw new Error('Expected session creation success');

    const teachResult = await ctx.getNextTeachingStep();
    if (teachResult.action !== 'teach')
      throw new Error(`Expected teach, got ${teachResult.action}`);

    const submitResult = await ctx.submitAnswer({
      promptText: 'Question A',
      chunkIds: ['rg-c1'],
      response: 'Answer A',
      grading: rubricForQuality(initialQuality),
      questionType: 'recall',
      feedback: 'Original feedback',
      timeSpentMs: 1000,
    });
    // submit_answer returns either 'recorded' (quality >= 3) or 'retry' (quality < 3)
    // — both persist the attempt; we just need the session_question_id.
    if (submitResult.action !== 'recorded' && submitResult.action !== 'retry') {
      throw new Error(`Expected recorded or retry, got ${submitResult.action}`);
    }
    return {
      sessionId: sessionResult.data.sessionId,
      sessionQuestionId: submitResult.session_question_id,
    };
  }

  it('happy path — revises an in-progress chunk and persists revision row', async () => {
    const { sessionQuestionId } = await seedInProgressAttempt(2);

    const result = await ctx.reviseGrade({
      sessionQuestionId,
      grading: rubricForQuality(4),
      newFeedback: 'I misread the prompt; the answer was correct.',
      reason: 'agent_misread_prompt',
    });

    expect(result.action).toBe('revised');
    if (result.action !== 'revised') throw new Error('unreachable');
    expect(result.revised_attempt.original_quality).toBe(2);
    expect(result.revised_attempt.new_quality).toBe(4);
    expect(result.revised_attempt.new_passed).toBe(true);
    expect(result.note_id).not.toBe('');

    const db = getSql();

    // Live attempt row should now reflect the revised values
    const [liveAttempt] = await db
      .select()
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.id, result.revised_attempt.attempt_id));
    expect(liveAttempt?.quality).toBe(4);
    expect(liveAttempt?.agentQuality).toBe(4);
    expect(liveAttempt?.passed).toBe(true);
    expect(liveAttempt?.feedback).toBe('I misread the prompt; the answer was correct.');

    // Revision row should preserve the original verbatim
    const [revisionRow] = await db
      .select()
      .from(sessionQuestionAttemptRevisions)
      .where(eq(sessionQuestionAttemptRevisions.id, result.revision_id));
    expect(revisionRow?.originalQuality).toBe(2);
    expect(revisionRow?.originalFeedback).toBe('Original feedback');
    expect(revisionRow?.newQuality).toBe(4);
    expect(revisionRow?.reason).toBe('agent_misread_prompt');
  });

  it('rejects revision on an already-finalized chunk with chunk_already_finalized', async () => {
    const { sessionId, sessionQuestionId } = await seedInProgressAttempt(2);

    // Mark the session_chunk as completed to simulate a chunk that has been
    // SRS-finalized within the active session.
    const db = getSql();
    await db
      .update(sessionChunks)
      .set({ status: 'completed', updatedAt: Date.now() })
      .where(eq(sessionChunks.sessionId, sessionId));

    const result = await ctx.reviseGrade({
      sessionQuestionId,
      grading: rubricForQuality(4),
      newFeedback: 'attempting revision after finalization',
      reason: 'agent_misread_prompt',
    });

    expect(result.action).toBe('error');
    if (result.action !== 'error') throw new Error('unreachable');
    expect(result.error).toBe('chunk_already_finalized');

    // No revision row should have been written
    const revisions = await db.select().from(sessionQuestionAttemptRevisions);
    expect(revisions).toHaveLength(0);
  });

  it('returns noop_already_revised on idempotent re-call', async () => {
    const { sessionQuestionId } = await seedInProgressAttempt(2);

    const first = await ctx.reviseGrade({
      sessionQuestionId,
      grading: rubricForQuality(4),
      newFeedback: 'First revision',
      reason: 'agent_misread_prompt',
    });
    if (first.action !== 'revised') throw new Error(`expected revised, got ${first.action}`);

    const second = await ctx.reviseGrade({
      sessionQuestionId,
      grading: rubricForQuality(4),
      newFeedback: 'First revision',
      reason: 'agent_misread_prompt',
    });
    expect(second.action).toBe('noop_already_revised');
    if (second.action !== 'noop_already_revised') throw new Error('unreachable');
    expect(second.revision_id).toBe(first.revision_id);

    const db = getSql();
    const revisions = await db.select().from(sessionQuestionAttemptRevisions);
    expect(revisions).toHaveLength(1);
  });
});
