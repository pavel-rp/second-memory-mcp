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

  it('appends questions to a chunk that already has questions', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();

    const first = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'Q1', chunkIds: [chunkId] }],
    });
    expect(first.status).toBe('created');

    const second = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'Q2', chunkIds: [chunkId] }],
    });
    expect(second.status).toBe('created');
    if (second.status !== 'created') throw new Error('Expected created');

    // Verify all questions persisted with continuous indices
    const questions = await questionRepo.getQuestionsForSession(sessionId);
    expect(questions).toHaveLength(2);
    expect(questions[0]!.questionIndex).toBe(1);
    expect(questions[1]!.questionIndex).toBe(2);
    expect(questions[0]!.promptText).toBe('Q1');
    expect(questions[1]!.promptText).toBe('Q2');
  });

  it('append flow: create 2 questions, answer 1, append 1, answer remaining, teach_next completes with aggregated quality', async () => {
    const { sessionId, chunkId } = await seedSessionWithInProgressChunk();

    // 1. Create initial 2 questions
    const create1 = await ctx.createSessionQuestions({
      sessionId,
      questions: [
        { promptText: 'Q1', chunkIds: [chunkId] },
        { promptText: 'Q2', chunkIds: [chunkId] },
      ],
    });
    if (create1.status !== 'created') throw new Error('Expected created');
    const [q1Id, q2Id] = create1.questionIds;

    // 2. Answer Q1 (pass)
    const a1 = await ctx.submitAnswer({
      response: 'Answer 1',
      quality: 5,
      questionType: 'recall',
      feedback: 'Good',
      timeSpentMs: 2000,
      sessionQuestionId: q1Id,
    });
    expect(a1.status).toBe('recorded');
    if (a1.status !== 'recorded') throw new Error('Expected recorded');
    // NEU-347: submit_answer never returns review_update (deferred to teach_next)
    expect(a1.review_update).toBeUndefined();

    // 3. Append Q3
    const create2 = await ctx.createSessionQuestions({
      sessionId,
      questions: [{ promptText: 'Q3', chunkIds: [chunkId] }],
    });
    if (create2.status !== 'created') throw new Error('Expected created');
    const q3Id = create2.questionIds[0]!;

    // Verify continuous index
    const questions = await questionRepo.getQuestionsForSession(sessionId);
    expect(questions).toHaveLength(3);
    expect(questions[2]!.questionIndex).toBe(3);

    // 4. Answer Q2 (pass)
    const a2 = await ctx.submitAnswer({
      response: 'Answer 2',
      quality: 4,
      questionType: 'explain_apply',
      feedback: 'Good',
      timeSpentMs: 2000,
      sessionQuestionId: q2Id,
    });
    expect(a2.status).toBe('recorded');
    if (a2.status !== 'recorded') throw new Error('Expected recorded');

    // 5. Answer Q3 (pass) — chunk stays in_progress
    const a3 = await ctx.submitAnswer({
      response: 'Answer 3',
      quality: 5,
      questionType: 'recall',
      feedback: 'Good',
      timeSpentMs: 2000,
      sessionQuestionId: q3Id,
    });
    expect(a3.status).toBe('recorded');
    if (a3.status !== 'recorded') throw new Error('Expected recorded');
    expect(a3.quality).toBe(5); // agent-provided quality
    expect(a3.review_update).toBeUndefined();

    // 6. teach_next completes the chunk with aggregated quality and returns review_update
    const nextStep = await ctx.getNextTeachingStep();
    expect(nextStep.status).toBe('complete');
    if (nextStep.status !== 'complete') throw new Error('Expected complete');
    expect(nextStep.review_update).toBeDefined();
    expect(nextStep.review_update?.next_review_date).not.toBe('');
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
      response: 'Wrong answer',
      quality: 1,
      questionType: 'recall',
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

    // Second attempt — pass → recorded (no SR update — deferred to teach_next)
    const recordedResult = await ctx.submitAnswer({
      response: '4',
      quality: 3,
      questionType: 'recall',
      feedback: 'Correct',
      timeSpentMs: 2000,
      sessionQuestionId: questionId,
    });
    expect(recordedResult.status).toBe('recorded');
    if (recordedResult.status !== 'recorded') throw new Error('Expected recorded');
    expect(recordedResult.quality).toBe(3); // agent-provided quality
    // NEU-347: review_update deferred to teach_next
    expect(recordedResult.review_update).toBeUndefined();
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
      response: 'A1',
      quality: 5,
      questionType: 'recall',
      feedback: 'OK',
      timeSpentMs: 1000,
      sessionQuestionId: q1Id,
    });
    await ctx.submitAnswer({
      response: 'A2',
      quality: 4,
      questionType: 'recall',
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

  // ── NEU-347: Multi-question probing ──────────────────────────

  it('multi-question probing: 3 inline submit_answers, then teach_next completes with aggregated quality', async () => {
    const now = Date.now();
    await seedTopicAndChunks('t1', ['c1', 'c2'], now);

    const sessionResult = await ctx.createSession({
      chunkIds: ['c1', 'c2'],
      mode: 'learning',
    });
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    // teach_next selects c1 and marks it in_progress
    const step1 = await ctx.getNextTeachingStep();
    expect(step1.status).toBe('teach');
    if (step1.status !== 'teach') throw new Error('Expected teach');
    expect(step1.chunk_id).toBe('c1');

    // Submit 3 inline questions for c1 (recall → explain → analyze)
    const q1 = await ctx.submitAnswer({
      promptText: 'Recall: What is c1?',
      chunkIds: ['c1'],
      response: 'c1 is a concept',
      quality: 5,
      questionType: 'recall',
      feedback: 'Basic recall correct',
      timeSpentMs: 3000,
    });
    expect(q1.status).toBe('recorded');
    if (q1.status !== 'recorded') throw new Error('Expected recorded');
    expect(q1.review_update).toBeUndefined(); // chunk NOT completed yet

    const q2 = await ctx.submitAnswer({
      promptText: 'Explain: Why is c1 important?',
      chunkIds: ['c1'],
      response: 'c1 matters because...',
      quality: 4,
      questionType: 'explain_apply',
      feedback: 'Good explanation',
      timeSpentMs: 5000,
    });
    expect(q2.status).toBe('recorded');
    if (q2.status !== 'recorded') throw new Error('Expected recorded');
    expect(q2.review_update).toBeUndefined();

    const q3 = await ctx.submitAnswer({
      promptText: 'Analyze: How does c1 relate to c2?',
      chunkIds: ['c1'],
      response: 'c1 and c2 connect through...',
      quality: 1,
      questionType: 'analyze_create',
      feedback: 'Incomplete analysis',
      timeSpentMs: 7000,
    });
    // First attempt fail → retry
    expect(q3.status).toBe('retry');

    // Retry the analysis question
    if (q3.status !== 'retry') throw new Error('Expected retry');
    const q3Retry = await ctx.submitAnswer({
      sessionQuestionId: q3.session_question_id,
      response: 'c1 and c2 connect through shared principles...',
      quality: 3,
      questionType: 'analyze_create',
      feedback: 'Better analysis',
      timeSpentMs: 4000,
    });
    expect(q3Retry.status).toBe('recorded');
    if (q3Retry.status !== 'recorded') throw new Error('Expected recorded');
    expect(q3Retry.quality).toBe(3); // agent-provided quality
    expect(q3Retry.review_update).toBeUndefined();

    // teach_next: completes c1 with aggregated quality, advances to c2
    const step2 = await ctx.getNextTeachingStep();
    expect(step2.status).toBe('teach');
    if (step2.status !== 'teach') throw new Error('Expected teach');
    expect(step2.chunk_id).toBe('c2');
    expect(step2.review_update).toBeDefined();
    expect(step2.review_update?.next_review_date).toBeDefined();

    // Verify c1 was marked completed
    const chunks = await ctx.getSessionChunks(sessionId);
    const c1Chunk = chunks.find(sc => sc.chunkId === 'c1');
    expect(c1Chunk?.status).toBe('completed');
  });

  it('single-question backward compat: submit 1 answer, teach_next completes', async () => {
    const now = Date.now();
    await seedTopicAndChunks('t1', ['c1', 'c2'], now);

    const sessionResult = await ctx.createSession({
      chunkIds: ['c1', 'c2'],
      mode: 'learning',
    });
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    // teach_next selects c1
    const step1 = await ctx.getNextTeachingStep();
    expect(step1.status).toBe('teach');
    if (step1.status !== 'teach') throw new Error('Expected teach');

    // Single inline submit_answer
    const result = await ctx.submitAnswer({
      promptText: 'What is c1?',
      chunkIds: ['c1'],
      response: 'c1 is...',
      quality: 5,
      questionType: 'recall',
      feedback: 'Correct',
      timeSpentMs: 5000,
    });
    expect(result.status).toBe('recorded');

    // teach_next completes c1 and advances to c2
    const step2 = await ctx.getNextTeachingStep();
    expect(step2.status).toBe('teach');
    if (step2.status !== 'teach') throw new Error('Expected teach');
    expect(step2.chunk_id).toBe('c2');
    expect(step2.review_update).toBeDefined();

    const chunks = await ctx.getSessionChunks(sessionId);
    const c1Chunk = chunks.find(sc => sc.chunkId === 'c1');
    expect(c1Chunk?.status).toBe('completed');
  });

  // ── Assessment mode integration ──────────────────────────────

  it('full assessment flow: create session, add cross-chunk questions, submit answers, verify completion', async () => {
    const now = Date.now();
    await seedTopicAndChunks('t1', ['c1', 'c2', 'c3'], now);

    // 1. Create assessment session
    const sessionResult = await ctx.createSession({
      chunkIds: ['c1', 'c2', 'c3'],
      mode: 'assessment',
    });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Failed to create session');
    const sessionId = sessionResult.data.sessionId;

    // 2. teach_next should block — no questions yet
    const blockedStep = await ctx.getNextTeachingStep();
    expect(blockedStep.status).toBe('blocked');

    // 3. Create cross-chunk questions (each maps to 2 chunks)
    const createResult = await ctx.createSessionQuestions({
      sessionId,
      questions: [
        { promptText: 'How do A and B relate?', chunkIds: ['c1', 'c2'] },
        { promptText: 'Compare B and C', chunkIds: ['c2', 'c3'] },
      ],
    });
    expect(createResult.status).toBe('created');
    if (createResult.status !== 'created') throw new Error('Expected created');
    const [q1Id, q2Id] = createResult.questionIds;

    // 4. teach_next should return first question
    const firstStep = await ctx.getNextTeachingStep();
    expect(firstStep.status).toBe('teach');
    if (firstStep.status !== 'teach') throw new Error('Expected teach');
    expect(firstStep.session_id).toBe(sessionId);
    expect(firstStep.instruction).toBe('How do A and B relate?');
    expect(firstStep.mode).toBe('assessment');
    expect(firstStep.drill_format).toBe('open_ended');

    // 5. Submit answer for first question (pass)
    const answer1 = await ctx.submitAnswer({
      response: 'They are related through X',
      quality: 5,
      questionType: 'analyze_create',
      feedback: 'Good',
      timeSpentMs: 8000,
      sessionQuestionId: q1Id,
    });
    expect(answer1.status).toBe('recorded');
    if (answer1.status !== 'recorded') throw new Error('Expected recorded');
    expect(answer1.quality).toBe(5); // assessment: passed → quality 5
    expect(answer1.attempt).toBe(1);

    // 6. Submit answer for second question (fail)
    const answer2 = await ctx.submitAnswer({
      response: 'I do not know',
      quality: 1,
      questionType: 'analyze_create',
      feedback: 'Incorrect',
      timeSpentMs: 5000,
      sessionQuestionId: q2Id,
    });
    expect(answer2.status).toBe('recorded');
    if (answer2.status !== 'recorded') throw new Error('Expected recorded');
    expect(answer2.quality).toBe(1); // assessment: failed → quality 1

    // 7. Verify session chunks are marked completed
    const chunks = await ctx.getSessionChunks(sessionId);
    for (const sc of chunks) {
      expect(sc.status).toBe('completed');
    }

    // 8. Verify junction table: each question maps to 2 chunks
    const q1Chunks = await questionRepo.getChunkIdsForQuestion(q1Id!);
    expect(q1Chunks.sort()).toEqual(['c1', 'c2']);
    const q2Chunks = await questionRepo.getChunkIdsForQuestion(q2Id!);
    expect(q2Chunks.sort()).toEqual(['c2', 'c3']);

    // 9. Verify attempts persisted (1 each, no retry in assessment)
    const allAttempts = await questionRepo.getAllAttemptsForSession(sessionId);
    expect(allAttempts).toHaveLength(2);
    expect(allAttempts[0]!.attemptNumber).toBe(1);
    expect(allAttempts[1]!.attemptNumber).toBe(1);
  });
});
