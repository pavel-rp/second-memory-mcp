import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
} from '../../../src/infrastructure/db/schema.js';
import crypto from 'node:crypto';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

describe('Integration: Complete Session Lifecycle', () => {
  let server: CaptureServer;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();

    server = new CaptureServer() as any;
    registerServerTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  it('should complete full session lifecycle: create → track progress → complete', async () => {
    const now = Date.now();
    const topicId = crypto.randomUUID();
    const chunkId1 = crypto.randomUUID();
    const chunkId2 = crypto.randomUUID();

    await getSql().insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });

    await getSql()
      .insert(learningChunks)
      .values([
        {
          id: chunkId1,
          topicId: topicId,
          title: 'Chunk 1',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: chunkId2,
          topicId: topicId,
          title: 'Chunk 2',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        },
      ]);

    const createSessionTool = server.tools.get('create_session');
    expect(createSessionTool).toBeDefined();
    if (!createSessionTool) throw new Error('create_session tool not found');

    const createResult = await createSessionTool.handler({
      topic_id: topicId,
      chunk_ids: [chunkId1, chunkId2],
      mode: 'learning',
      estimated_duration: 20,
      context_token: 'ctx-test',
    });

    const createParsed = parseToolResult(createResult);
    expect(createParsed.data.action).toBe('created');
    expect(createParsed.data.session_id).toBeDefined();
    const sessionId = createParsed.data.session_id;

    const [sessionInDb] = await getSql()
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(sessionInDb).toBeDefined();
    expect(sessionInDb?.topicId).toBe(topicId);
    expect(sessionInDb?.mode).toBe('learning');
    expect(sessionInDb?.status).toBe('active');

    const getActiveSessionTool = server.tools.get('get_active_session');
    expect(getActiveSessionTool).toBeDefined();
    if (!getActiveSessionTool) throw new Error('get_active_session tool not found');

    const getActiveResult = await getActiveSessionTool.handler({ context_token: 'test-token' });
    const getActiveParsed = parseToolResult(getActiveResult);
    expect(getActiveParsed.data.action).toBe('found');
    expect(getActiveParsed.data.session.session_id).toBe(sessionId);

    const createSessionChunkTool = server.tools.get('create_session_chunk');
    expect(createSessionChunkTool).toBeDefined();
    if (!createSessionChunkTool) throw new Error('create_session_chunk tool not found');

    await createSessionChunkTool.handler({
      session_id: sessionId,
      chunk_id: chunkId1,
      status: 'completed',
      attempts: [
        {
          timestamp: now + 1000,
          time_spent_ms: 5000,
          question: 'Test question',
          response: 'Test response',
          passed: true,
          feedback: 'Test feedback',
          quality: 4,
        },
      ],
      quality_scores: [4],
      time_spent_ms: 5000,
      context_token: 'ctx-test',
    });

    await createSessionChunkTool.handler({
      session_id: sessionId,
      chunk_id: chunkId2,
      status: 'in_progress',
      attempts: [
        {
          timestamp: now + 2000,
          time_spent_ms: 3000,
          quality: 1,
          question: 'Test question',
          response: 'Test response',
          passed: false,
          feedback: 'Test feedback',
        },
      ],
      time_spent_ms: 3000,
      context_token: 'ctx-test',
    });

    const sessionStatusTool = server.tools.get('session_status');
    expect(sessionStatusTool).toBeDefined();
    if (!sessionStatusTool) throw new Error('session_status tool not found');

    const statusResult = await sessionStatusTool.handler({
      session_id: sessionId,
      context_token: 'ctx-test',
    });
    const statusParsed = parseToolResult(statusResult);
    expect(statusParsed.data.overall_progress).toBeDefined();
    expect(statusParsed.data.chunks_completed).toBeGreaterThanOrEqual(0);
    expect(statusParsed.data.chunks_remaining).toBeDefined();
    expect(statusParsed.data.average_quality).toBeDefined();
    expect(statusParsed.data.time_elapsed_ms).toBeDefined();
    expect(statusParsed.data.should_complete).toBeDefined();
    expect(statusParsed.data.recommendation).toBeDefined();

    const completeSessionTool = server.tools.get('complete_session');
    expect(completeSessionTool).toBeDefined();
    if (!completeSessionTool) throw new Error('complete_session tool not found');

    const completeResult = await completeSessionTool.handler({
      session_id: sessionId,
      feedback: 'Great session! Learned a lot about the topic.',
      context_token: 'ctx-test',
    });
    const completeParsed = parseToolResult(completeResult);
    expect(completeParsed.data.action).toBe('completed');
    expect(completeParsed.data.session_id).toBe(sessionId);

    const [completedSessionInDb] = await getSql()
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(completedSessionInDb?.status).toBe('completed');
    expect(completedSessionInDb?.feedback).toBe('Great session! Learned a lot about the topic.');
    expect(completedSessionInDb?.endTime).toBeDefined();

    const getActiveAfterCompleteResult = await getActiveSessionTool.handler({
      context_token: 'test-token',
    });
    const getActiveAfterCompleteParsed = parseToolResult(getActiveAfterCompleteResult);
    expect(getActiveAfterCompleteParsed.data.action).toBe('not_found');
    expect(getActiveAfterCompleteParsed.data.session).toBeNull();

    const sessionStatusToolAfterComplete = server.tools.get('session_status');
    expect(sessionStatusToolAfterComplete).toBeDefined();
    if (!sessionStatusToolAfterComplete) throw new Error('session_status tool not found');

    const statusAfterResult = await sessionStatusToolAfterComplete.handler({
      session_id: sessionId,
      context_token: 'ctx-test',
    });
    const statusAfterParsed = parseToolResult(statusAfterResult);
    expect(statusAfterParsed.data.should_complete).toBeDefined();
    expect(statusAfterParsed.data.reason).toBeDefined();
    expect(statusAfterParsed.data.recommendation).toBeDefined();
  });

  it('should handle session lifecycle with multiple sessions', async () => {
    const now = Date.now();
    const topicId1 = crypto.randomUUID();
    const topicId2 = crypto.randomUUID();
    const chunkId1 = crypto.randomUUID();
    const chunkId2 = crypto.randomUUID();

    await getSql()
      .insert(learningTopics)
      .values([
        {
          id: topicId1,
          title: 'Topic 1',
          subject: 'Math',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: topicId2,
          title: 'Topic 2',
          subject: 'Science',
          createdAt: now,
          updatedAt: now,
        },
      ]);

    await getSql()
      .insert(learningChunks)
      .values([
        {
          id: chunkId1,
          topicId: topicId1,
          title: 'Math Chunk',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: chunkId2,
          topicId: topicId2,
          title: 'Science Chunk',
          subject: 'Science',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        },
      ]);

    const createSessionTool = server.tools.get('create_session');
    const getActiveSessionTool = server.tools.get('get_active_session');
    const completeSessionTool = server.tools.get('complete_session');

    expect(createSessionTool).toBeDefined();
    expect(getActiveSessionTool).toBeDefined();
    expect(completeSessionTool).toBeDefined();

    if (!createSessionTool || !getActiveSessionTool || !completeSessionTool) {
      throw new Error('Required tools not found');
    }

    const session1Result = await createSessionTool.handler({
      topic_id: topicId1,
      chunk_ids: [chunkId1],
      mode: 'learning',
      estimated_duration: 15,
      context_token: 'ctx-test',
    });
    const session1Id = parseToolResult(session1Result).data.session_id;

    await completeSessionTool.handler({
      session_id: session1Id,
      feedback: 'Completed math learning',
      context_token: 'ctx-test',
    });

    const session2Result = await createSessionTool.handler({
      topic_id: topicId2,
      chunk_ids: [chunkId2],
      mode: 'review',
      estimated_duration: 20,
      context_token: 'ctx-test',
    });
    const session2Id = parseToolResult(session2Result).data.session_id;

    const activeResult = await getActiveSessionTool.handler({ context_token: 'test-token' });
    const activeParsed = parseToolResult(activeResult);
    expect(activeParsed.data.action).toBe('found');
    expect(activeParsed.data.session.session_id).toBe(session2Id);

    await completeSessionTool.handler({
      session_id: session2Id,
      feedback: 'Completed science review',
      context_token: 'ctx-test',
    });

    const activeAfterCompleteResult = await getActiveSessionTool.handler({
      context_token: 'test-token',
    });
    const activeAfterCompleteParsed = parseToolResult(activeAfterCompleteResult);
    expect(activeAfterCompleteParsed.data.action).toBe('not_found');
  });

  it('should verify automatic session chunk creation integration', async () => {
    const now = Date.now();
    const topicId = crypto.randomUUID();
    const chunkId1 = crypto.randomUUID();
    const chunkId2 = crypto.randomUUID();

    await getSql().insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });

    await getSql()
      .insert(learningChunks)
      .values([
        {
          id: chunkId1,
          topicId: topicId,
          title: 'Chunk 1',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: chunkId2,
          topicId: topicId,
          title: 'Chunk 2',
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          estimatedDuration: 10,
          chunkType: 'new',
          createdAt: now,
          updatedAt: now,
        },
      ]);

    const createSessionTool = server.tools.get('create_session');
    expect(createSessionTool).toBeDefined();
    if (!createSessionTool) throw new Error('create_session tool not found');

    const createResult = await createSessionTool.handler({
      topic_id: topicId,
      chunk_ids: [chunkId1, chunkId2],
      mode: 'learning',
      estimated_duration: 20,
      context_token: 'ctx-test',
    });

    const createParsed = parseToolResult(createResult);
    expect(createParsed.data.action).toBe('created');
    expect(createParsed.data.message).toContain('2 chunks initialized');
    const sessionId = createParsed.data.session_id;

    const getActiveSessionTool = server.tools.get('get_active_session');
    expect(getActiveSessionTool).toBeDefined();
    if (!getActiveSessionTool) throw new Error('get_active_session tool not found');

    const getActiveResult = await getActiveSessionTool.handler({ context_token: 'test-token' });
    const getActiveParsed = parseToolResult(getActiveResult);
    expect(getActiveParsed.data.action).toBe('found');
    expect(getActiveParsed.data.session.session_id).toBe(sessionId);

    expect(getActiveParsed.data.session.chunks).toHaveLength(2);
    const chunkIds = getActiveParsed.data.session.chunks.map(
      (c: { chunk_id: string }) => c.chunk_id
    );
    expect(chunkIds).toContain(chunkId1);
    expect(chunkIds).toContain(chunkId2);
    for (const chunk of getActiveParsed.data.session.chunks) {
      expect(chunk.status).toBe('pending');
    }
  });

  it('should handle session lifecycle with backward compatibility (SessionInput)', async () => {
    const now = Date.now();
    const topicId = crypto.randomUUID();
    const chunkId = crypto.randomUUID();

    await getSql().insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });

    await getSql().insert(learningChunks).values({
      id: chunkId,
      topicId: topicId,
      title: 'Test Chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      estimatedDuration: 10,
      chunkType: 'new',
      createdAt: now,
      updatedAt: now,
    });

    const createSessionTool = server.tools.get('create_session');
    expect(createSessionTool).toBeDefined();
    if (!createSessionTool) throw new Error('create_session tool not found');
    const createResult = await createSessionTool.handler({
      topic_id: topicId,
      chunk_ids: [chunkId],
      mode: 'learning',
      estimated_duration: 15,
      context_token: 'ctx-test',
    });
    const sessionId = parseToolResult(createResult).data.session_id;

    const createSessionChunkTool = server.tools.get('create_session_chunk');
    expect(createSessionChunkTool).toBeDefined();
    if (!createSessionChunkTool) throw new Error('create_session_chunk tool not found');
    await createSessionChunkTool.handler({
      session_id: sessionId,
      chunk_id: chunkId,
      status: 'completed',
      attempts: [
        {
          timestamp: now + 1000,
          time_spent_ms: 5000,
          question: 'Test question',
          response: 'Test response',
          passed: true,
          feedback: 'Test feedback',
          quality: 4,
        },
      ],
      quality_scores: [4],
      time_spent_ms: 5000,
      context_token: 'ctx-test',
    });

    const sessionStatusTool = server.tools.get('session_status');
    expect(sessionStatusTool).toBeDefined();
    if (!sessionStatusTool) throw new Error('session_status tool not found');

    const statusWithIdResult = await sessionStatusTool.handler({
      session_id: sessionId,
      context_token: 'ctx-test',
    });
    const statusWithIdParsed = parseToolResult(statusWithIdResult);
    expect(statusWithIdParsed.data.chunks_completed).toBeDefined();
    expect(statusWithIdParsed.data.chunks_remaining).toBeDefined();
    expect(statusWithIdParsed.data.overall_progress).toBeDefined();
    expect(statusWithIdParsed.data.average_quality).toBeDefined();
    expect(statusWithIdParsed.data.should_complete).toBeDefined();
    expect(statusWithIdParsed.data.recommendation).toBeDefined();
  });
});
