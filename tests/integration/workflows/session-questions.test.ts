import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { DrizzleSessionRepository } from '../../../src/adapters/drizzle/session-repository.js';
import { DrizzleSessionQuestionRepository } from '../../../src/adapters/drizzle/session-question-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('session question workflows', () => {
  let ctx: AppContext;
  let sessionRepo: DrizzleSessionRepository;
  let questionRepo: DrizzleSessionQuestionRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    const db = getSql();
    sessionRepo = new DrizzleSessionRepository(db);
    questionRepo = new DrizzleSessionQuestionRepository(db);
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopicAndChunks(topicId: string, chunkIds: string[], now: number) {
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

    for (const cId of chunkIds) {
      await db.insert(learningChunks).values({
        id: cId,
        topicId,
        title: `Chunk ${cId}`,
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
        content: 'Test content',
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  /** Create an active session with an in_progress chunk and return session + chunk IDs. */
  async function seedSessionWithInProgressChunk(): Promise<{
    sessionId: string;
    sessionChunkId: string;
    chunkId: string;
  }> {
    const now = Date.now();
    await seedTopicAndChunks('t1', ['c1'], now);

    const sessionResult = await ctx.createSession({
      chunkIds: ['c1'],
      mode: 'learning',
    });
    if (!sessionResult.success) throw new Error('Failed to create session');

    const sessionId = sessionResult.data.sessionId;
    const chunks = await ctx.getSessionChunks(sessionId);
    const sc = chunks[0]!;

    // Mark chunk in_progress
    await sessionRepo.updateSessionChunk(sc.id, { status: 'in_progress' });

    return { sessionId, sessionChunkId: sc.id, chunkId: 'c1' };
  }

  it('creates questions for a session', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();

    const result = await ctx.createSessionQuestions({
      sessionId,
      questions: [
        { promptText: 'What is 2+2?', chunkIds: [chunkId] },
        { promptText: 'Explain addition', chunkIds: [chunkId] },
      ],
    });

    expect(result.status).toBe('created');
    if (result.status !== 'created') throw new Error('Expected created');
    expect(result.sessionId).toBe(sessionId);
    expect(result.questionIds).toHaveLength(2);

    // Verify persisted via adapter
    const questions = await questionRepo.getQuestionsForSession(sessionId);
    expect(questions).toHaveLength(2);
    expect(questions[0]!.promptText).toBe('What is 2+2?');
    expect(questions[1]!.promptText).toBe('Explain addition');
    expect(questions[0]!.questionIndex).toBe(1);
    expect(questions[1]!.questionIndex).toBe(2);
    expect(questions[0]!.status).toBe('pending');
  });

  it('rejects duplicate question creation for the same chunk', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();

    await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'Q1', chunkIds: [chunkId] }],
    });

    const duplicateResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'Q2', chunkIds: [chunkId] }],
    });
    expect(duplicateResult.status).toBe('error');
    if (duplicateResult.status !== 'error') throw new Error('Expected error');
    expect(duplicateResult.message).toContain('already has');
  });

  it('submits answer via session question flow — retry then pass', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();

    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'What is 2+2?', chunkIds: [chunkId] }],
    });
    if (createResult.status !== 'created') throw new Error('Expected created');
    const questionId = createResult.questionIds[0]!;

    // First attempt — fail → retry
    const retryResult = await ctx.submitAnswer({
      question: 'What is 2+2?',
      response: 'Wrong answer',
      passed: false,
      feedback: 'Incorrect',
      timeSpentMs: 3000,
      sessionQuestionId: questionId,
    });
    expect(retryResult.status).toBe('retry');

    // Verify attempt persisted
    const attempts = await questionRepo.getAttemptsForQuestion(questionId);
    expect(attempts).toHaveLength(1);
    expect(attempts[0]!.attemptNumber).toBe(1);
    expect(attempts[0]!.passed).toBe(false);

    // Second attempt — pass → recorded with SR update
    const recordedResult = await ctx.submitAnswer({
      question: 'What is 2+2?',
      response: '4',
      passed: true,
      feedback: 'Correct',
      timeSpentMs: 2000,
      sessionQuestionId: questionId,
    });
    expect(recordedResult.status).toBe('recorded');
    if (recordedResult.status !== 'recorded') throw new Error('Expected recorded');
    expect(recordedResult.quality).toBe(3); // second attempt pass
    expect(recordedResult.review_update?.next_review_date).not.toBe('');
  });

  it('getQuestionById returns null for nonexistent ID', async () => {
    const result = await questionRepo.getQuestionById('nonexistent');
    expect(result).toBeNull();
  });

  it('updateQuestionStatus changes status', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();
    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'Q', chunkIds: [chunkId] }],
    });
    if (createResult.status !== 'created') throw new Error('Expected created');
    const questionId = createResult.questionIds[0]!;

    await questionRepo.updateQuestionStatus(questionId, 'answered');
    const updated = await questionRepo.getQuestionById(questionId);
    expect(updated!.status).toBe('answered');
  });

  it('getAllAttemptsForSession returns ordered attempts across questions', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();
    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [
        { promptText: 'Q1', chunkIds: [chunkId] },
        { promptText: 'Q2', chunkIds: [chunkId] },
      ],
    });
    if (createResult.status !== 'created') throw new Error('Expected created');
    const [q1Id, q2Id] = createResult.questionIds;

    // Submit answers for both questions (first attempt pass for each)
    await ctx.submitAnswer({
      question: 'Q1',
      response: 'A1',
      passed: true,
      feedback: 'OK',
      timeSpentMs: 1000,
      sessionQuestionId: q1Id,
    });
    await ctx.submitAnswer({
      question: 'Q2',
      response: 'A2',
      passed: true,
      feedback: 'OK',
      timeSpentMs: 1000,
      sessionQuestionId: q2Id,
    });

    const allAttempts = await questionRepo.getAllAttemptsForSession(sessionId);
    expect(allAttempts.length).toBeGreaterThanOrEqual(2);
    // Verify ordering: grouped by question, ordered by attempt_number
    for (let i = 1; i < allAttempts.length; i++) {
      const prev = allAttempts[i - 1]!;
      const curr = allAttempts[i]!;
      if (prev.sessionQuestionId === curr.sessionQuestionId) {
        expect(prev.attemptNumber).toBeLessThanOrEqual(curr.attemptNumber);
      }
    }
  });

  it('getAllAttemptsForSession returns empty array when no questions exist', async () => {
    const { sessionId } = await seedSessionWithInProgressChunk();
    const attempts = await questionRepo.getAllAttemptsForSession(sessionId);
    expect(attempts).toEqual([]);
  });
});
