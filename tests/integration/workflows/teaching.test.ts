import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

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
});
