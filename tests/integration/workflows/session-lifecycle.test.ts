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
    });

    const createParsed = parseToolResult(createResult);
    expect(createParsed.status).toBe('created');
    expect(createParsed.session_id).toBeDefined();
    const sessionId = createParsed.session_id;

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

    const getActiveResult = await getActiveSessionTool.handler({});
    const getActiveParsed = parseToolResult(getActiveResult);
    expect(getActiveParsed.status).toBe('found');
    expect(getActiveParsed.session.session_id).toBe(sessionId);

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
    });

    const sessionProgressTool = server.tools.get('session_progress');
    expect(sessionProgressTool).toBeDefined();
    if (!sessionProgressTool) throw new Error('session_progress tool not found');

    const progressResult = await sessionProgressTool.handler({
      session_id: sessionId,
    });
    const progressParsed = parseToolResult(progressResult);
    expect(progressParsed.session_id).toBe(sessionId);
    expect(progressParsed.overall_progress).toBeDefined();
    expect(progressParsed.chunks_completed).toBeGreaterThanOrEqual(0);
    expect(progressParsed.total_chunks).toBeGreaterThan(0);
    expect(progressParsed.average_quality).toBeDefined();
    expect(progressParsed.time_elapsed_ms).toBeDefined();

    const sessionWorkflowTool = server.tools.get('session_workflow');
    expect(sessionWorkflowTool).toBeDefined();
    if (!sessionWorkflowTool) throw new Error('session_workflow tool not found');

    const workflowResult = await sessionWorkflowTool.handler({
      session_id: sessionId,
    });
    const workflowParsed = parseToolResult(workflowResult);
    expect(workflowParsed.current_phase).toBeDefined();
    expect(workflowParsed.phase_progress).toBeDefined();
    expect(workflowParsed.guidance).toBeDefined();
    expect(typeof workflowParsed.can_advance).toBe('boolean');

    const completeSessionTool = server.tools.get('complete_session');
    expect(completeSessionTool).toBeDefined();
    if (!completeSessionTool) throw new Error('complete_session tool not found');

    const completeResult = await completeSessionTool.handler({
      session_id: sessionId,
      feedback: 'Great session! Learned a lot about the topic.',
    });
    const completeParsed = parseToolResult(completeResult);
    expect(completeParsed.status).toBe('completed');
    expect(completeParsed.session_id).toBe(sessionId);

    const [completedSessionInDb] = await getSql()
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(completedSessionInDb?.status).toBe('completed');
    expect(completedSessionInDb?.feedback).toBe('Great session! Learned a lot about the topic.');
    expect(completedSessionInDb?.endTime).toBeDefined();

    const getActiveAfterCompleteResult = await getActiveSessionTool.handler({});
    const getActiveAfterCompleteParsed = parseToolResult(getActiveAfterCompleteResult);
    expect(getActiveAfterCompleteParsed.status).toBe('not_found');
    expect(getActiveAfterCompleteParsed.session).toBeNull();

    const sessionCompletionTool = server.tools.get('session_completion');
    expect(sessionCompletionTool).toBeDefined();
    if (!sessionCompletionTool) throw new Error('session_completion tool not found');

    const completionResult = await sessionCompletionTool.handler({
      session_id: sessionId,
    });
    const completionParsed = parseToolResult(completionResult);
    expect(completionParsed.is_complete).toBeDefined();
    expect(completionParsed.completion_reason).toBeDefined();
    expect(completionParsed.recommendation).toBeDefined();
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
    });
    const session1Id = parseToolResult(session1Result).session_id;

    await completeSessionTool.handler({
      session_id: session1Id,
      feedback: 'Completed math learning',
    });

    const session2Result = await createSessionTool.handler({
      topic_id: topicId2,
      chunk_ids: [chunkId2],
      mode: 'review',
      estimated_duration: 20,
    });
    const session2Id = parseToolResult(session2Result).session_id;

    const activeResult = await getActiveSessionTool.handler({});
    const activeParsed = parseToolResult(activeResult);
    expect(activeParsed.status).toBe('found');
    expect(activeParsed.session.session_id).toBe(session2Id);

    await completeSessionTool.handler({
      session_id: session2Id,
      feedback: 'Completed science review',
    });

    const activeAfterCompleteResult = await getActiveSessionTool.handler({});
    const activeAfterCompleteParsed = parseToolResult(activeAfterCompleteResult);
    expect(activeAfterCompleteParsed.status).toBe('not_found');
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
    });

    const createParsed = parseToolResult(createResult);
    expect(createParsed.status).toBe('created');
    expect(createParsed.message).toContain('2 chunks initialized');
    const sessionId = createParsed.session_id;

    const getActiveSessionTool = server.tools.get('get_active_session');
    expect(getActiveSessionTool).toBeDefined();
    if (!getActiveSessionTool) throw new Error('get_active_session tool not found');

    const getActiveResult = await getActiveSessionTool.handler({});
    const getActiveParsed = parseToolResult(getActiveResult);
    expect(getActiveParsed.status).toBe('found');
    expect(getActiveParsed.session.session_id).toBe(sessionId);

    expect(getActiveParsed.session.chunks).toHaveLength(2);
    const chunkIds = getActiveParsed.session.chunks.map((c: { chunk_id: string }) => c.chunk_id);
    expect(chunkIds).toContain(chunkId1);
    expect(chunkIds).toContain(chunkId2);
    for (const chunk of getActiveParsed.session.chunks) {
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
    });
    const sessionId = parseToolResult(createResult).session_id;

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
    });

    const sessionProgressTool = server.tools.get('session_progress');
    const sessionWorkflowTool = server.tools.get('session_workflow');
    const sessionCompletionTool = server.tools.get('session_completion');

    expect(sessionProgressTool).toBeDefined();
    expect(sessionWorkflowTool).toBeDefined();
    expect(sessionCompletionTool).toBeDefined();

    if (!sessionProgressTool || !sessionWorkflowTool || !sessionCompletionTool) {
      throw new Error('Required session analysis tools not found');
    }

    const progressWithIdResult = await sessionProgressTool.handler({
      session_id: sessionId,
    });
    const progressWithIdParsed = parseToolResult(progressWithIdResult);
    expect(progressWithIdParsed.session_id).toBe(sessionId);

    const sessionInput = {
      session_id: sessionId,
      mode: 'learning' as const,
      start_time: new Date(now).toISOString(),
      current_time: new Date(now + 10000).toISOString(),
      chunks: [
        {
          chunk_id: chunkId,
          session_chunk_id: 'sc-integration-1',
          title: 'Test Chunk',
          status: 'completed' as const,
          attempts: [
            {
              timestamp: new Date(now + 1000).toISOString(),
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
        },
      ],
      context: { topicId: topicId },
    };

    const progressWithInputResult = await sessionProgressTool.handler({
      session_data: sessionInput,
    });
    const progressWithInputParsed = parseToolResult(progressWithInputResult);
    expect(progressWithInputParsed.session_id).toBe(sessionId);

    const workflowWithInputResult = await sessionWorkflowTool.handler({
      session_data: sessionInput,
    });
    const workflowWithInputParsed = parseToolResult(workflowWithInputResult);
    expect(workflowWithInputParsed.current_phase).toBeDefined();
    expect(workflowWithInputParsed.phase_progress).toBeDefined();
    expect(workflowWithInputParsed.guidance).toBeDefined();
    expect(typeof workflowWithInputParsed.can_advance).toBe('boolean');

    const completionWithInputResult = await sessionCompletionTool.handler({
      session_data: sessionInput,
    });
    const completionWithInputParsed = parseToolResult(completionWithInputResult);
    expect(completionWithInputParsed.is_complete).toBeDefined();
    expect(completionWithInputParsed.completion_reason).toBeDefined();
    expect(completionWithInputParsed.recommendation).toBeDefined();
  });
});
