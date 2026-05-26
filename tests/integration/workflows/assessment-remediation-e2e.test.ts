import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setEventLogger } from '../../../src/shared/logger.js';
import type pino from 'pino';

describe('assessment → gap-notes → remediation e2e (integration)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopicAndChunks(
    topicId: string,
    chunks: Array<{
      id: string;
      chunkType?: 'new' | 'review' | 'remediation';
      easeFactor?: number;
      prerequisitesJson?: string[];
    }>
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

    for (const chunk of chunks) {
      await db.insert(learningChunks).values({
        id: chunk.id,
        topicId,
        title: `Chunk ${chunk.id}`,
        subject: 'Testing',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: chunk.easeFactor ?? 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 10,
        chunkType: chunk.chunkType ?? 'new',
        prerequisitesJson: chunk.prerequisitesJson ?? [],
        tagsJson: [],
        content: `Content for ${chunk.id}`,
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async function runAssessmentFlow(
    chunkIds: string[],
    grades: Map<string, boolean>
  ): Promise<string> {
    const sessionResult = await ctx.createSession({
      mode: 'assessment',
      chunkIds,
    });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Failed to create assessment session');
    const sessionId = sessionResult.data.sessionId;

    const questions = chunkIds.map(cId => ({
      promptText: `Assess: ${cId}`,
      chunkIds: [cId],
    }));
    const createResult = await ctx.createSessionQuestions({ sessionId, questions });
    expect(createResult.action).toBe('created');
    if (createResult.action !== 'created') throw new Error('Expected created');

    for (let i = 0; i < chunkIds.length; i++) {
      const step = await ctx.getNextTeachingStep();
      if (step.action !== 'teach')
        throw new Error(`Expected teach at step ${i}, got ${step.action}`);

      expect(step.session_question_id).toBeDefined();
      const questionChunkId = step.assessment_chunk_ids?.[0];
      const shouldPass = questionChunkId ? (grades.get(questionChunkId) ?? true) : true;

      const answer = await ctx.submitAnswer({
        response: shouldPass ? 'Correct answer' : 'Wrong answer',
        quality: shouldPass ? 5 : 1,
        questionType: 'recall',
        feedback: shouldPass ? 'Good' : 'Incorrect',
        timeSpentMs: 5000,
        sessionQuestionId: step.session_question_id!,
      });
      expect(answer.action).toBe('recorded');
    }

    const completeStep = await ctx.getNextTeachingStep();
    expect(completeStep.action).toBe('complete');

    const session = await ctx.getSessionById(sessionId);
    if (session?.status !== 'completed') {
      await ctx.completeSession(sessionId, undefined);
    }

    return sessionId;
  }

  it('mixed grades: weak chunks only for failed, gap notes on failed, recommends review mode', async () => {
    const captured: Array<Record<string, unknown>> = [];
    const fakeLogger = {
      info: (obj: Record<string, unknown>) => {
        captured.push(obj);
      },
    } as unknown as pino.Logger;
    setEventLogger(fakeLogger);

    try {
      await seedTopicAndChunks('t-mixed', [
        { id: 'cm1' },
        { id: 'cm2' },
        { id: 'cm3' },
        { id: 'cm4' },
      ]);

      const grades = new Map([
        ['cm1', true],
        ['cm2', true],
        ['cm3', true],
        ['cm4', false],
      ]);
      const sessionId = await runAssessmentFlow(['cm1', 'cm2', 'cm3', 'cm4'], grades);

      const result = await ctx.recommendRemediation(sessionId);
      expect(result.success).toBe(true);
      if (!result.success) throw new Error(`Expected success: ${result.error.message}`);

      const plan = result.data;

      expect(plan.weakChunks).toHaveLength(1);
      expect(plan.weakChunks[0].chunkId).toBe('cm4');
      expect(plan.weakChunks[0].reasonCode).toBe('WEAK_AFTER_ASSESSMENT');
      expect(plan.weakChunks[0].leech).toBe(false);

      expect(plan.gapNotesWritten).toHaveLength(1);
      expect(plan.gapNotesWritten[0].chunkId).toBe('cm4');

      const failedNotes = await ctx.listNotes('chunk', 'cm4');
      const gapNotes = failedNotes.notes.filter(n => n.noteType === 'gap');
      expect(gapNotes).toHaveLength(1);
      expect(gapNotes[0].author).toBe('agent');

      for (const passedId of ['cm1', 'cm2', 'cm3']) {
        const notes = await ctx.listNotes('chunk', passedId);
        const gaps = notes.notes.filter(n => n.noteType === 'gap');
        expect(gaps).toHaveLength(0);
      }

      expect(plan.recommendedNextSession.mode).toBe('review');

      const events = captured.filter(e => e.event === 'remediation_plan_generated');
      expect(events).toHaveLength(1);
      const eventData = events[0].data as Record<string, unknown>;
      expect(eventData.sessionId).toBe(sessionId);
      expect(eventData.weakChunkCount).toBe(1);
    } finally {
      setEventLogger(null);
    }
  });

  it('failure-heavy with leech: surfaces leech + failed chunks, scaffolding mode, prerequisite surfacing', async () => {
    await seedTopicAndChunks('t-leech', [
      { id: 'cl1', prerequisitesJson: ['clp1'] },
      { id: 'cl2', chunkType: 'remediation' },
      { id: 'cl3', prerequisitesJson: ['clp2'] },
      { id: 'clp1', easeFactor: 1.5 },
      { id: 'clp2', easeFactor: 1.8 },
    ]);

    // Include cl2 (leech) in the session but create questions only for cl1 and cl3.
    // The SR update during submitAnswer resets chunkType; skipping cl2's question
    // preserves its chunkType='remediation' so the leech detection path is exercised.
    const sessionResult = await ctx.createSession({
      mode: 'assessment',
      chunkIds: ['cl1', 'cl2', 'cl3'],
    });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Failed to create assessment session');
    const sessionId = sessionResult.data.sessionId;

    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [
        { promptText: 'Assess: cl1', chunkIds: ['cl1'] },
        { promptText: 'Assess: cl3', chunkIds: ['cl3'] },
      ],
    });
    expect(createResult.action).toBe('created');
    if (createResult.action !== 'created') throw new Error('Expected created');

    for (let i = 0; i < 2; i++) {
      const step = await ctx.getNextTeachingStep();
      if (step.action !== 'teach')
        throw new Error(`Expected teach at step ${i}, got ${step.action}`);

      expect(step.session_question_id).toBeDefined();
      const answer = await ctx.submitAnswer({
        response: 'Wrong answer',
        quality: 1,
        questionType: 'recall',
        feedback: 'Incorrect',
        timeSpentMs: 5000,
        sessionQuestionId: step.session_question_id!,
      });
      expect(answer.action).toBe('recorded');
    }

    const completeStep = await ctx.getNextTeachingStep();
    expect(completeStep.action).toBe('complete');

    const session = await ctx.getSessionById(sessionId);
    if (session?.status !== 'completed') {
      await ctx.completeSession(sessionId, undefined);
    }

    const result = await ctx.recommendRemediation(sessionId);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(`Expected success: ${result.error.message}`);

    const plan = result.data;

    expect(plan.weakChunks).toHaveLength(3);

    const cl1Weak = plan.weakChunks.find(w => w.chunkId === 'cl1')!;
    expect(cl1Weak.reasonCode).toBe('WEAK_AFTER_ASSESSMENT');
    expect(cl1Weak.leech).toBe(false);

    const cl2Weak = plan.weakChunks.find(w => w.chunkId === 'cl2')!;
    expect(cl2Weak.reasonCode).toBe('LEECH_THRESHOLD');
    expect(cl2Weak.leech).toBe(true);

    const cl3Weak = plan.weakChunks.find(w => w.chunkId === 'cl3')!;
    expect(cl3Weak.reasonCode).toBe('WEAK_AFTER_ASSESSMENT');
    expect(cl3Weak.leech).toBe(false);

    expect(plan.recommendedNextSession.mode).toBe('scaffolding');

    const prereqIds = plan.prerequisiteChunksToRevisit.map(p => p.chunkId).sort();
    expect(prereqIds).toEqual(['clp1', 'clp2']);
    for (const prereq of plan.prerequisiteChunksToRevisit) {
      expect(prereq.reasonCode).toBe('PREREQ_LOW_EASE');
      expect(prereq.easeFactor).toBeLessThan(2.5);
    }
  });

  it('perfect score: empty weak chunks, no gap notes, recommends learning mode', async () => {
    await seedTopicAndChunks('t-perfect', [{ id: 'cp1' }, { id: 'cp2' }, { id: 'cp3' }]);

    const grades = new Map([
      ['cp1', true],
      ['cp2', true],
      ['cp3', true],
    ]);
    const sessionId = await runAssessmentFlow(['cp1', 'cp2', 'cp3'], grades);

    const result = await ctx.recommendRemediation(sessionId);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(`Expected success: ${result.error.message}`);

    const plan = result.data;

    expect(plan.weakChunks).toHaveLength(0);
    expect(plan.gapNotesWritten).toHaveLength(0);
    expect(plan.recommendedNextSession.mode).toBe('learning');
  });
});
