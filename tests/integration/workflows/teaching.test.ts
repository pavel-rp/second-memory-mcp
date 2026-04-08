import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningChunks, sessionQuestionAttempts } from '../../../src/infrastructure/db/schema.js';
import { eq, desc } from 'drizzle-orm';

describe('teaching workflows (composition-root wiring)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('getNextTeachingStep returns error when no active session', async () => {
    const result = await ctx.getNextTeachingStep();

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message', 'No active session. Call create_session first.');
  });

  it('startLearning returns nothing_due when no chunks exist', async () => {
    const result = await ctx.startLearning({});

    expect(result.status).toBe('nothing_due');
  });

  it('teach_next inserts stale prerequisite before dependent chunk and serves it first', async () => {
    const MS_PER_DAY = 86_400_000;

    // Create topic with chunks A and B, where B depends on A
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Stale Prereq Test',
      subject: 'Testing',
      topicSummary: 'Testing stale prerequisite insertion',
      chunks: [
        {
          id: 'stale-a',
          title: 'Foundation Concept A',
          content: 'This is the foundation concept...',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
        {
          id: 'stale-b',
          title: 'Advanced Concept B (depends on A)',
          content: 'Building on concept A...',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
          prerequisites: ['stale-a'],
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    // Mark chunk A as "learned in the past" with heavily decayed R
    // Set intervalDays > 0, repetitions > 0, and nextReviewAt far in the past
    const db = getSql();
    const pastReview = Date.now() - 300 * MS_PER_DAY;
    await db
      .update(learningChunks)
      .set({
        repetitions: 3,
        easeFactor: 2.5,
        intervalDays: 10,
        nextReviewAt: pastReview, // 300 days overdue on 10-day interval → R ≈ 0.37
        lastReviewedAt: pastReview - 10 * MS_PER_DAY,
      })
      .where(eq(learningChunks.id, 'stale-a'));

    // Create a session with ONLY chunk B (the dependent)
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['stale-b'] });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Expected success');

    // Call teach_next — should detect that chunk A is stale and insert it
    const teachResult = await ctx.getNextTeachingStep();
    expect(teachResult.status).toBe('teach');
    if (teachResult.status !== 'teach') throw new Error('Expected teach');

    // Should serve chunk A (the stale prerequisite) first
    expect(teachResult.chunk_id).toBe('stale-a');
    expect(teachResult.prerequisite_reteach_needed).toEqual(['stale-a']);
    expect(teachResult.instruction).toContain('prerequisite is being revisited');

    // Submit answer for A to advance
    const submitA = await ctx.submitAnswer({
      promptText: 'What is Foundation Concept A?',
      chunkIds: ['stale-a'],
      response: 'This is the foundation concept.',
      passed: true,
      quality: 5,
      questionType: 'recall',
      feedback: 'Correct',
      timeSpentMs: 3000,
    });
    expect(submitA.status).toBe('recorded');

    // Call teach_next again — should now serve chunk B
    const nextResult = await ctx.getNextTeachingStep();
    expect(nextResult.status).toBe('teach');
    if (nextResult.status !== 'teach') throw new Error('Expected teach');
    expect(nextResult.chunk_id).toBe('stale-b');
  });

  it('teach_next includes prerequisite_context for mid-topic chunk', async () => {
    // Create topic with 2 chunks: first has condensedSummary, second does not
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Segment Trees',
      subject: 'Algorithms',
      topicSummary: 'A data structure for range queries',
      chunks: [
        {
          id: 'seg-1',
          title: 'Structure',
          content: 'Segment trees use a 1-indexed array of size 4n...',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
          condensedSummary: '1-indexed array of size 4n, leaves map to original elements.',
        },
        {
          id: 'seg-2',
          title: 'Build',
          content: 'Building the tree is done recursively...',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    // Start a session — recommendation engine should pick both chunks
    const startResult = await ctx.startLearning({ subjectFilter: 'Algorithms' });
    expect(startResult.status).toBe('started');
    if (startResult.status !== 'started') throw new Error('Expected started');

    // The first chunk should be served first — submit an answer to advance
    const firstChunk = startResult.first_chunk;
    expect(firstChunk.status).toBe('teach');
    if (firstChunk.status !== 'teach') throw new Error('Expected teach');
    expect(firstChunk.chunk_id).toBe('seg-1');

    const submitResult = await ctx.submitAnswer({
      promptText: 'What is the structure?',
      chunkIds: ['seg-1'],
      response: '1-indexed array of size 4n',
      passed: true,
      quality: 5,
      questionType: 'recall',
      feedback: 'Correct',
      timeSpentMs: 5000,
    });
    expect(submitResult.status).toBe('recorded');
    if (submitResult.status !== 'recorded') throw new Error('Expected recorded');
    expect(submitResult.session_question_id).toBeDefined();

    // Call teach_next explicitly to get the next chunk
    const nextResult = await ctx.getNextTeachingStep();
    if (nextResult.status !== 'teach') throw new Error('Expected teach for next');
    expect(nextResult.prerequisite_context).toBeDefined();
    expect(nextResult.prerequisite_context).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chunk_id: 'seg-1',
          title: 'Structure',
          condensed_summary: '1-indexed array of size 4n, leaves map to original elements.',
        }),
      ])
    );
  });

  it('caps quality on subsequent answer after low score on same chunk', async () => {
    // Create topic with a single chunk
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Quality Cap Test',
      subject: 'Testing',
      topicSummary: 'Testing quality cap',
      chunks: [
        {
          id: 'cap-c1',
          title: 'Cap Concept',
          content: 'A concept to test quality capping.',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    // Create session and submit a quality-1 answer
    const sessionResult = await ctx.createSession({ mode: 'learning', chunkIds: ['cap-c1'] });
    expect(sessionResult.success).toBe(true);

    const firstTeach = await ctx.getNextTeachingStep();
    expect(firstTeach.status).toBe('teach');

    // First answer: quality 1 (fail), then retry with quality 2 to complete the question
    const submit1 = await ctx.submitAnswer({
      promptText: 'What is the cap concept?',
      chunkIds: ['cap-c1'],
      response: 'Wrong answer',
      passed: false,
      quality: 1,
      questionType: 'recall',
      feedback: 'Incorrect',
      timeSpentMs: 3000,
    });
    expect(submit1.status).toBe('retry');
    if (submit1.status !== 'retry') throw new Error('Expected retry');

    // Retry: answer correctly with quality 2
    const submit1retry = await ctx.submitAnswer({
      sessionQuestionId: submit1.session_question_id,
      promptText: 'What is the cap concept?',
      chunkIds: ['cap-c1'],
      response: 'Correct on retry',
      passed: true,
      quality: 2,
      questionType: 'recall',
      feedback: 'Got it on second try',
      timeSpentMs: 3000,
    });
    expect(submit1retry.status).toBe('recorded');

    // Submit a quality-5 answer on the same chunk directly (without calling teach_next
    // which would complete the chunk). The cap should apply based on prior quality-1.
    const submit2 = await ctx.submitAnswer({
      promptText: 'Explain the cap concept in detail',
      chunkIds: ['cap-c1'],
      response: 'Perfect detailed answer',
      passed: true,
      quality: 5,
      questionType: 'explain_apply',
      feedback: 'Perfect recall',
      timeSpentMs: 5000,
    });
    expect(submit2.status).toBe('recorded');

    // Verify the stored attempt has capped quality=3 and agentQuality=5
    const db = getSql();
    const [lastAttempt] = await db
      .select({
        quality: sessionQuestionAttempts.quality,
        agentQuality: sessionQuestionAttempts.agentQuality,
      })
      .from(sessionQuestionAttempts)
      .orderBy(desc(sessionQuestionAttempts.createdAt))
      .limit(1);

    expect(lastAttempt).toBeDefined();
    expect(lastAttempt!.quality).toBe(3);
    expect(lastAttempt!.agentQuality).toBe(5);
  });
});
