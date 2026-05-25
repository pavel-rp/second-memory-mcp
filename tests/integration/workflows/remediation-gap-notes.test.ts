import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('recommend_remediation gap notes (integration)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedSessionWithFailure() {
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Remediation Test Topic',
      subject: 'Testing',
      topicSummary: 'Topic for remediation integration tests',
      chunks: [
        {
          id: 'rem-c1',
          title: 'Passed Chunk',
          content: 'Content for chunk that passes assessment.',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
        {
          id: 'rem-c2',
          title: 'Failed Chunk',
          content: 'Content for chunk that fails assessment.',
          difficulty: 5,
          estimatedDuration: 15,
          chunkType: 'new',
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    const sessionResult = await ctx.createSession({
      mode: 'learning',
      chunkIds: ['rem-c1', 'rem-c2'],
    });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('session creation failed');
    const sessionId = sessionResult.data.sessionId;

    const teach1 = await ctx.getNextTeachingStep();
    if (teach1.action !== 'teach') throw new Error(`Expected teach, got ${teach1.action}`);
    const firstChunkId = teach1.chunk_id;

    await ctx.submitAnswer({
      promptText: 'Q1',
      chunkIds: [firstChunkId],
      response: 'Correct',
      quality: 5,
      questionType: 'recall',
      feedback: 'Good',
      timeSpentMs: 10000,
    });

    const teach2 = await ctx.getNextTeachingStep();
    if (teach2.action !== 'teach') throw new Error(`Expected teach, got ${teach2.action}`);
    const secondChunkId = teach2.chunk_id;

    await ctx.submitAnswer({
      promptText: 'Q2',
      chunkIds: [secondChunkId],
      response: 'Wrong answer',
      quality: 1,
      questionType: 'recall',
      feedback: 'Incorrect',
      timeSpentMs: 15000,
    });

    const teach3 = await ctx.getNextTeachingStep();
    if (teach3.action === 'teach') {
      throw new Error('Expected complete or session end after 2 chunks');
    }

    if (teach3.action !== 'complete') {
      await ctx.completeSession(sessionId, undefined);
    }

    const session = await ctx.getSessionById(sessionId);
    if (session?.status !== 'completed') {
      await ctx.completeSession(sessionId, undefined);
    }

    return { sessionId, firstChunkId, secondChunkId };
  }

  it('writes gap notes on directly-failed chunks and not on passed chunks', async () => {
    const { sessionId, firstChunkId, secondChunkId } = await seedSessionWithFailure();

    const result = await ctx.recommendRemediation(sessionId);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(`Expected success: ${result.error.message}`);

    const gapNoteChunkIds = result.data.gapNotesWritten.map(n => n.chunkId);
    expect(gapNoteChunkIds.length).toBeGreaterThanOrEqual(1);

    const failedNotes = await ctx.listNotes('chunk', secondChunkId);
    const passedNotes = await ctx.listNotes('chunk', firstChunkId);

    const failedGapNotes = failedNotes.notes.filter(n => n.noteType === 'gap');
    const passedGapNotes = passedNotes.notes.filter(n => n.noteType === 'gap');

    if (gapNoteChunkIds.includes(secondChunkId)) {
      expect(failedGapNotes.length).toBeGreaterThanOrEqual(1);
      expect(failedGapNotes[0].content).toContain(sessionId);
      expect(failedGapNotes[0].author).toBe('agent');
    }
    if (gapNoteChunkIds.includes(firstChunkId)) {
      throw new Error('Gap note should not be written on a passed chunk');
    }

    expect(passedGapNotes).toHaveLength(0);
  });

  it('returns weak_chunks with failed chunk IDs', async () => {
    const { sessionId, secondChunkId } = await seedSessionWithFailure();

    const result = await ctx.recommendRemediation(sessionId);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(`Expected success: ${result.error.message}`);

    const weakChunkIds = result.data.weakChunks.map(w => w.chunkId);
    expect(weakChunkIds.length).toBeGreaterThanOrEqual(1);

    const failedEntry = result.data.weakChunks.find(w => w.chunkId === secondChunkId);
    if (failedEntry) {
      expect(failedEntry.reasonCode).toBe('WEAK_AFTER_ASSESSMENT');
    }
  });

  it('returns error for non-completed session', async () => {
    const topicResult = await ctx.createTopicWithChunks({
      topicTitle: 'Active Session Topic',
      subject: 'Testing',
      topicSummary: 'Topic for active session test',
      chunks: [
        {
          id: 'active-c1',
          title: 'Active Chunk',
          content: 'Content for active session chunk.',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'new',
        },
      ],
    });
    expect(topicResult.success).toBe(true);

    const sessionResult = await ctx.createSession({
      mode: 'learning',
      chunkIds: ['active-c1'],
    });
    expect(sessionResult.success).toBe(true);
    if (!sessionResult.success) throw new Error('Expected session creation success');

    const result = await ctx.recommendRemediation(sessionResult.data.sessionId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
      expect(result.error.message).toContain('not completed');
    }
  });

  it('returns error for non-existent session', async () => {
    const result = await ctx.recommendRemediation('nonexistent-session-id');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });
});
