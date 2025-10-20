import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { registerServerTools } from '../../src/server/tools.js';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks, learningSessions } from '../../src/db/schema.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseToolResult(out: any): any {
  const text = out?.content?.[0]?.text;
  try {
    return JSON.parse(text);
  } catch {
    return out;
  }
}

describe('Integration: Complete Session Lifecycle', () => {
  let server: CaptureServer;
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();

    server = new CaptureServer() as any;
    registerServerTools(server as any);
  });

  afterEach(async () => {
    await resetDatabase();
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
    if (fs.existsSync(`${dbFile}-shm`)) {
      fs.unlinkSync(`${dbFile}-shm`);
    }
    if (fs.existsSync(`${dbFile}-wal`)) {
      fs.unlinkSync(`${dbFile}-wal`);
    }
  });

  it('should complete full session lifecycle: create → track progress → complete', async () => {
    // Setup: Create test data
    const now = Date.now();
    const topicId = crypto.randomUUID();
    const chunkId1 = crypto.randomUUID();
    const chunkId2 = crypto.randomUUID();

    // Create topic and chunks
    await getSql()
      .insert(learningTopics)
      .values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      })
      .run();

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
      ])
      .run();

    // Step 1: Create a new session
    const createSessionTool = server.tools.get('create_session');
    expect(createSessionTool).toBeDefined();
    if (!createSessionTool) throw new Error('create_session tool not found');

    const createResult = await createSessionTool.handler({
      topicId: topicId,
      chunkIds: [chunkId1, chunkId2],
      mode: 'learning',
      estimatedDuration: 20,
    });

    const createParsed = parseToolResult(createResult);
    expect(createParsed.status).toBe('created');
    expect(createParsed.sessionId).toBeDefined();
    const sessionId = createParsed.sessionId;

    // Verify session was created in database
    const sessionInDb = await getSql()
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId))
      .get();
    expect(sessionInDb).toBeDefined();
    expect(sessionInDb?.topicId).toBe(topicId);
    expect(sessionInDb?.mode).toBe('learning');
    expect(sessionInDb?.status).toBe('active');

    // Step 2: Get the active session
    const getActiveSessionTool = server.tools.get('get_active_session');
    expect(getActiveSessionTool).toBeDefined();
    if (!getActiveSessionTool) throw new Error('get_active_session tool not found');

    const getActiveResult = await getActiveSessionTool.handler({});
    const getActiveParsed = parseToolResult(getActiveResult);
    expect(getActiveParsed.status).toBe('found');
    expect(getActiveParsed.session.session_id).toBe(sessionId);

    // Step 3: Create session chunks to simulate learning progress
    const createSessionChunkTool = server.tools.get('create_session_chunk');
    expect(createSessionChunkTool).toBeDefined();
    if (!createSessionChunkTool) throw new Error('create_session_chunk tool not found');

    // Create session chunk for chunk 1 (completed)
    await createSessionChunkTool.handler({
      sessionId: sessionId,
      chunkId: chunkId1,
      status: 'completed',
      attempts: [
        {
          timestamp: now + 1000,
          timeSpentMs: 5000,
          completed: true,
          quality: 4,
        },
      ],
      qualityScores: [4],
      timeSpentMs: 5000,
    });

    // Create session chunk for chunk 2 (in progress)
    await createSessionChunkTool.handler({
      sessionId: sessionId,
      chunkId: chunkId2,
      status: 'in_progress',
      attempts: [
        {
          timestamp: now + 2000,
          timeSpentMs: 3000,
          completed: false,
        },
      ],
      timeSpentMs: 3000,
    });

    // Step 4: Test session progress analysis
    const sessionProgressTool = server.tools.get('session_progress');
    expect(sessionProgressTool).toBeDefined();
    if (!sessionProgressTool) throw new Error('session_progress tool not found');

    const progressResult = await sessionProgressTool.handler({
      sessionId: sessionId,
    });
    const progressParsed = parseToolResult(progressResult);
    expect(progressParsed.session_id).toBe(sessionId);
    expect(progressParsed.overall_progress).toBeDefined();
    expect(progressParsed.chunks_completed).toBeGreaterThanOrEqual(0);
    expect(progressParsed.total_chunks).toBeGreaterThan(0);
    expect(progressParsed.average_quality).toBeDefined();
    expect(progressParsed.time_elapsed_ms).toBeDefined();

    // Step 5: Test session workflow analysis
    const sessionWorkflowTool = server.tools.get('session_workflow');
    expect(sessionWorkflowTool).toBeDefined();
    if (!sessionWorkflowTool) throw new Error('session_workflow tool not found');

    const workflowResult = await sessionWorkflowTool.handler({
      sessionId: sessionId,
    });
    const workflowParsed = parseToolResult(workflowResult);
    expect(workflowParsed.current_phase).toBeDefined();
    expect(workflowParsed.phase_progress).toBeDefined();
    expect(workflowParsed.guidance).toBeDefined();
    expect(typeof workflowParsed.can_advance).toBe('boolean');

    // Step 6: Complete the session
    const completeSessionTool = server.tools.get('complete_session');
    expect(completeSessionTool).toBeDefined();
    if (!completeSessionTool) throw new Error('complete_session tool not found');

    const completeResult = await completeSessionTool.handler({
      sessionId: sessionId,
      feedback: 'Great session! Learned a lot about the topic.',
    });
    const completeParsed = parseToolResult(completeResult);
    expect(completeParsed.status).toBe('completed');
    expect(completeParsed.sessionId).toBe(sessionId);

    // Verify session was completed in database
    const completedSessionInDb = await getSql()
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId))
      .get();
    expect(completedSessionInDb?.status).toBe('completed');
    expect(completedSessionInDb?.feedback).toBe('Great session! Learned a lot about the topic.');
    expect(completedSessionInDb?.endTime).toBeDefined();

    // Step 7: Verify no active session exists after completion
    const getActiveAfterCompleteResult = await getActiveSessionTool.handler({});
    const getActiveAfterCompleteParsed = parseToolResult(getActiveAfterCompleteResult);
    expect(getActiveAfterCompleteParsed.status).toBe('not_found');
    expect(getActiveAfterCompleteParsed.session).toBeNull();

    // Step 8: Test session completion analysis
    const sessionCompletionTool = server.tools.get('session_completion');
    expect(sessionCompletionTool).toBeDefined();
    if (!sessionCompletionTool) throw new Error('session_completion tool not found');

    const completionResult = await sessionCompletionTool.handler({
      sessionId: sessionId,
    });
    const completionParsed = parseToolResult(completionResult);
    expect(completionParsed.is_complete).toBeDefined();
    expect(completionParsed.completion_reason).toBeDefined();
    expect(completionParsed.recommendation).toBeDefined();
  });

  it('should handle session lifecycle with multiple sessions', async () => {
    // Setup: Create test data
    const now = Date.now();
    const topicId1 = crypto.randomUUID();
    const topicId2 = crypto.randomUUID();
    const chunkId1 = crypto.randomUUID();
    const chunkId2 = crypto.randomUUID();

    // Create topics and chunks
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
      ])
      .run();

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
      ])
      .run();

    const createSessionTool = server.tools.get('create_session');
    const getActiveSessionTool = server.tools.get('get_active_session');
    const completeSessionTool = server.tools.get('complete_session');

    expect(createSessionTool).toBeDefined();
    expect(getActiveSessionTool).toBeDefined();
    expect(completeSessionTool).toBeDefined();

    if (!createSessionTool || !getActiveSessionTool || !completeSessionTool) {
      throw new Error('Required tools not found');
    }

    // Create first session
    const session1Result = await createSessionTool.handler({
      topicId: topicId1,
      chunkIds: [chunkId1],
      mode: 'learning',
      estimatedDuration: 15,
    });
    const session1Id = parseToolResult(session1Result).sessionId;

    // Complete first session before creating second one
    await completeSessionTool.handler({
      sessionId: session1Id,
      feedback: 'Completed math learning',
    });

    // Create second session (should be the active one)
    const session2Result = await createSessionTool.handler({
      topicId: topicId2,
      chunkIds: [chunkId2],
      mode: 'review',
      estimatedDuration: 20,
    });
    const session2Id = parseToolResult(session2Result).sessionId;

    // Verify second session is active
    const activeResult = await getActiveSessionTool.handler({});
    const activeParsed = parseToolResult(activeResult);
    expect(activeParsed.status).toBe('found');
    expect(activeParsed.session.session_id).toBe(session2Id);

    // Complete second session
    await completeSessionTool.handler({
      sessionId: session2Id,
      feedback: 'Completed science review',
    });

    // Verify no active sessions remain
    const activeAfterCompleteResult = await getActiveSessionTool.handler({});
    const activeAfterCompleteParsed = parseToolResult(activeAfterCompleteResult);
    expect(activeAfterCompleteParsed.status).toBe('not_found');
  });

  it('should verify automatic session chunk creation integration', async () => {
    // Setup: Create test data
    const now = Date.now();
    const topicId = crypto.randomUUID();
    const chunkId1 = crypto.randomUUID();
    const chunkId2 = crypto.randomUUID();

    // Create topic and chunks
    await getSql()
      .insert(learningTopics)
      .values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      })
      .run();

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
      ])
      .run();

    // Create session with chunkIds - this should automatically create session chunks
    const createSessionTool = server.tools.get('create_session');
    expect(createSessionTool).toBeDefined();
    if (!createSessionTool) throw new Error('create_session tool not found');

    const createResult = await createSessionTool.handler({
      topicId: topicId,
      chunkIds: [chunkId1, chunkId2],
      mode: 'learning',
      estimatedDuration: 20,
    });

    const createParsed = parseToolResult(createResult);
    expect(createParsed.status).toBe('created');
    expect(createParsed.message).toContain('2 chunks initialized');
    const sessionId = createParsed.sessionId;

    // Verify session chunks were created automatically
    const getActiveSessionTool = server.tools.get('get_active_session');
    expect(getActiveSessionTool).toBeDefined();
    if (!getActiveSessionTool) throw new Error('get_active_session tool not found');

    const getActiveResult = await getActiveSessionTool.handler({});
    const getActiveParsed = parseToolResult(getActiveResult);
    expect(getActiveParsed.status).toBe('found');
    expect(getActiveParsed.session.session_id).toBe(sessionId);

    // Verify that session chunks were created automatically
    expect(getActiveParsed.session.chunks).toHaveLength(2);
    expect(getActiveParsed.session.chunks[0].chunk_id).toBe(chunkId1);
    expect(getActiveParsed.session.chunks[0].status).toBe('pending');
    expect(getActiveParsed.session.chunks[1].chunk_id).toBe(chunkId2);
    expect(getActiveParsed.session.chunks[1].status).toBe('pending');
  });

  it('should handle session lifecycle with backward compatibility (SessionInput)', async () => {
    // Setup: Create test data
    const now = Date.now();
    const topicId = crypto.randomUUID();
    const chunkId = crypto.randomUUID();

    await getSql()
      .insert(learningTopics)
      .values({
        id: topicId,
        title: 'Test Topic',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      })
      .run();

    await getSql()
      .insert(learningChunks)
      .values({
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
      })
      .run();

    // Create session
    const createSessionTool = server.tools.get('create_session');
    expect(createSessionTool).toBeDefined();
    if (!createSessionTool) throw new Error('create_session tool not found');
    const createResult = await createSessionTool.handler({
      topicId: topicId,
      chunkIds: [chunkId],
      mode: 'learning',
      estimatedDuration: 15,
    });
    const sessionId = parseToolResult(createResult).sessionId;

    // Create session chunk
    const createSessionChunkTool = server.tools.get('create_session_chunk');
    expect(createSessionChunkTool).toBeDefined();
    if (!createSessionChunkTool) throw new Error('create_session_chunk tool not found');
    await createSessionChunkTool.handler({
      sessionId: sessionId,
      chunkId: chunkId,
      status: 'completed',
      attempts: [
        {
          timestamp: now + 1000,
          timeSpentMs: 5000,
          completed: true,
          quality: 4,
        },
      ],
      qualityScores: [4],
      timeSpentMs: 5000,
    });

    // Test session analysis tools with both sessionId and SessionInput
    const sessionProgressTool = server.tools.get('session_progress');
    const sessionWorkflowTool = server.tools.get('session_workflow');
    const sessionCompletionTool = server.tools.get('session_completion');

    expect(sessionProgressTool).toBeDefined();
    expect(sessionWorkflowTool).toBeDefined();
    expect(sessionCompletionTool).toBeDefined();

    if (!sessionProgressTool || !sessionWorkflowTool || !sessionCompletionTool) {
      throw new Error('Required session analysis tools not found');
    }

    // Test with sessionId
    const progressWithIdResult = await sessionProgressTool.handler({
      sessionId: sessionId,
    });
    const progressWithIdParsed = parseToolResult(progressWithIdResult);
    expect(progressWithIdParsed.session_id).toBe(sessionId);

    // Test with SessionInput (backward compatibility)
    const sessionInput = {
      session_id: sessionId,
      mode: 'learning' as const,
      start_time: new Date(now).toISOString(),
      current_time: new Date(now + 10000).toISOString(),
      chunks: [
        {
          chunk_id: chunkId,
          title: 'Test Chunk',
          status: 'completed' as const,
          attempts: [
            {
              timestamp: new Date(now + 1000).toISOString(),
              time_spent_ms: 5000,
              completed: true,
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
      sessionData: sessionInput,
    });
    const progressWithInputParsed = parseToolResult(progressWithInputResult);
    expect(progressWithInputParsed.session_id).toBe(sessionId);

    // Test workflow with SessionInput
    const workflowWithInputResult = await sessionWorkflowTool.handler({
      sessionData: sessionInput,
    });
    const workflowWithInputParsed = parseToolResult(workflowWithInputResult);
    expect(workflowWithInputParsed.current_phase).toBeDefined();
    expect(workflowWithInputParsed.phase_progress).toBeDefined();
    expect(workflowWithInputParsed.guidance).toBeDefined();
    expect(typeof workflowWithInputParsed.can_advance).toBe('boolean');

    // Test completion with SessionInput
    const completionWithInputResult = await sessionCompletionTool.handler({
      sessionData: sessionInput,
    });
    const completionWithInputParsed = parseToolResult(completionWithInputResult);
    expect(completionWithInputParsed.is_complete).toBeDefined();
    expect(completionWithInputParsed.completion_reason).toBeDefined();
    expect(completionWithInputParsed.recommendation).toBeDefined();
  });
});
