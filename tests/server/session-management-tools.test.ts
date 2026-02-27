import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { registerSessionManagementTools } from '../../src/server/session-management-tools.js';
import { getSql } from '../../src/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../src/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

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

describe('Integration: Session Management Tools', () => {
  let server: CaptureServer;
  let createSessionTool: { spec: any; handler: Function };
  let getActiveSessionTool: { spec: any; handler: Function };
  let getSessionTool: { spec: any; handler: Function };
  let completeSessionTool: { spec: any; handler: Function };
  let batchUpdateChunksTool: { spec: any; handler: Function };

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();

    server = new CaptureServer();
    registerSessionManagementTools(server as any);

    createSessionTool = server.tools.get('create_session')!;
    getActiveSessionTool = server.tools.get('get_active_session')!;
    getSessionTool = server.tools.get('get_session')!;
    completeSessionTool = server.tools.get('complete_session')!;
    batchUpdateChunksTool = server.tools.get('batch_update_session_chunks')!;

    expect(createSessionTool).toBeDefined();
    expect(getActiveSessionTool).toBeDefined();
    expect(getSessionTool).toBeDefined();
    expect(completeSessionTool).toBeDefined();
    expect(batchUpdateChunksTool).toBeDefined();
  });
  afterAll(teardownTestDb);

  it('should create a session successfully', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'chunk1',
      topicId: uniqueId,
      title: 'Test Chunk 1',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: null,
      tagsJson: null,
      content: 'Test content 1',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'chunk2',
      topicId: uniqueId,
      title: 'Test Chunk 2',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: null,
      tagsJson: null,
      content: 'Test content 2',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await createSessionTool.handler({
      topicId: uniqueId,
      chunkIds: ['chunk1', 'chunk2'],
      mode: 'learning',
      estimatedDuration: 30,
    });

    const parsed = parseToolResult(result);
    expect(parsed.sessionId).toBeDefined();
    expect(parsed.status).toBe('created');
    expect(parsed.message).toContain('Session created successfully');

    const [session] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, parsed.sessionId));
    expect(session).toBeDefined();
    expect(session?.mode).toBe('learning');
    expect(session?.status).toBe('active');
    expect(session?.topicId).toBe(uniqueId);
  });

  it('should get active session correctly', async () => {
    const now = Date.now();
    const db = getSql();

    const sessionId = `session-${now}`;
    await db.insert(learningSessions).values({
      id: sessionId,
      topicId: null,
      chunkIds: ['chunk1'],
      mode: 'learning',
      estimatedDuration: 30,
      status: 'active',
      startTime: now,
      endTime: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await getActiveSessionTool.handler({});

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('found');
    expect(parsed.session).toBeDefined();
    expect(parsed.session.session_id).toBe(sessionId);
    expect(parsed.session.mode).toBe('learning');
  });

  it('should return not_found when no active session exists', async () => {
    const result = await getActiveSessionTool.handler({});

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('not_found');
    expect(parsed.session).toBeNull();
  });

  it('should get session by ID correctly', async () => {
    const now = Date.now();
    const db = getSql();

    const sessionId = `session-${now}`;
    await db.insert(learningSessions).values({
      id: sessionId,
      topicId: null,
      chunkIds: ['chunk1'],
      mode: 'review',
      estimatedDuration: 20,
      status: 'active',
      startTime: now,
      endTime: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await getSessionTool.handler({
      sessionId: sessionId,
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('found');
    expect(parsed.session).toBeDefined();
    expect(parsed.session.session_id).toBe(sessionId);
    expect(parsed.session.mode).toBe('review');
  });

  it('should return not_found for non-existent session', async () => {
    const result = await getSessionTool.handler({
      sessionId: 'nonexistent-session',
    });

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('not_found');
    expect(parsed.session).toBeNull();
  });

  it('should complete a session successfully', async () => {
    const now = Date.now();
    const db = getSql();

    const sessionId = `session-${now}`;
    await db.insert(learningSessions).values({
      id: sessionId,
      topicId: null,
      chunkIds: ['chunk1'],
      mode: 'learning',
      estimatedDuration: 30,
      status: 'active',
      startTime: now,
      endTime: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await completeSessionTool.handler({
      sessionId: sessionId,
      feedback: 'Great session!',
    });

    const parsed = parseToolResult(result);
    expect(parsed.sessionId).toBe(sessionId);
    expect(parsed.status).toBe('completed');
    expect(parsed.message).toContain('Session completed successfully');
    expect(parsed.finalMetrics).toBeDefined();
    expect(parsed.finalMetrics.duration).toBeGreaterThan(0);

    const [session] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(session?.status).toBe('completed');
    expect(session?.endTime).toBeDefined();
    expect(session?.feedback).toBe('Great session!');
  });

  it('should handle session completion without feedback', async () => {
    const now = Date.now();
    const db = getSql();

    const sessionId = `session-${now}`;
    await db.insert(learningSessions).values({
      id: sessionId,
      topicId: null,
      chunkIds: ['chunk1'],
      mode: 'learning',
      estimatedDuration: 30,
      status: 'active',
      startTime: now,
      endTime: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await completeSessionTool.handler({
      sessionId: sessionId,
    });

    const parsed = parseToolResult(result);
    expect(parsed.sessionId).toBe(sessionId);
    expect(parsed.status).toBe('completed');
    expect(parsed.message).toContain('Session completed successfully');

    const [session] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(session?.status).toBe('completed');
    expect(session?.endTime).toBeDefined();
    expect(session?.feedback).toBeNull();
  });

  it('should handle completion of non-existent session', async () => {
    const result = await completeSessionTool.handler({
      sessionId: 'nonexistent-session',
      feedback: 'Test feedback',
    });

    const parsed = parseToolResult(result);
    expect(parsed.message).toContain('Session nonexistent-session not found');
  });

  it('should handle invalid input gracefully', async () => {
    const result1 = await createSessionTool.handler({
      mode: 'invalid_mode',
    });

    const parsed1 = parseToolResult(result1);
    expect(parsed1.error).toBeDefined();

    const result2 = await createSessionTool.handler({
      mode: 'learning',
      estimatedDuration: 500,
    });

    const parsed2 = parseToolResult(result2);
    expect(parsed2.error).toBeDefined();

    const result3 = await completeSessionTool.handler({});

    const parsed3 = parseToolResult(result3);
    expect(parsed3.error).toBeDefined();
  });

  it('should work with session chunks', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    await db.insert(learningTopics).values({
      id: uniqueId,
      title: 'Test Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    const chunkId = `chunk-${now}`;
    await db.insert(learningChunks).values({
      id: chunkId,
      topicId: uniqueId,
      title: 'Test Chunk',
      subject: 'CS',
      difficulty: 5,
      nextReviewAt: now + 86400000,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: [],
      content: 'Test content',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const createResult = await createSessionTool.handler({
      topicId: uniqueId,
      chunkIds: [chunkId],
      mode: 'learning',
      estimatedDuration: 30,
    });

    const createParsed = parseToolResult(createResult);
    const sessionId = createParsed.sessionId;

    await db.insert(sessionChunks).values({
      id: `session-chunk-${now}`,
      sessionId: sessionId,
      chunkId: chunkId,
      status: 'completed',
      attemptsJson: [
        {
          timestamp: new Date(now).toISOString(),
          quality: 5,
          time_spent_ms: 3000,
          completed: true,
        },
      ],
      qualityScoresJson: [5],
      timeSpentMs: 3000,
      createdAt: now,
      updatedAt: now,
    });

    const getResult = await getSessionTool.handler({
      sessionId: sessionId,
    });

    const getParsed = parseToolResult(getResult);
    expect(getParsed.status).toBe('found');
    expect(getParsed.session.chunks).toHaveLength(2);
    const completedChunk = getParsed.session.chunks.find(
      (chunk: any) => chunk.status === 'completed'
    );
    expect(completedChunk).toBeDefined();
    expect(completedChunk!.chunk_id).toBe(chunkId);
    expect(completedChunk!.status).toBe('completed');
    expect(completedChunk!.quality_scores).toEqual([5]);
  });

  it('should handle session lifecycle correctly', async () => {
    const now = Date.now();
    const db = getSql();

    const session1Id = `session-${now}`;
    await db.insert(learningSessions).values({
      id: session1Id,
      topicId: null,
      chunkIds: null,
      mode: 'learning',
      estimatedDuration: 30,
      status: 'active',
      startTime: now,
      endTime: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    });

    const result1 = await getActiveSessionTool.handler({});
    const parsed1 = parseToolResult(result1);
    expect(parsed1.status).toBe('found');
    expect(parsed1.session.session_id).toBe(session1Id);
    expect(parsed1.session.mode).toBe('learning');

    const completeResult = await completeSessionTool.handler({
      sessionId: session1Id,
      feedback: 'Great session!',
    });
    const completeParsed = parseToolResult(completeResult);
    expect(completeParsed.status).toBe('completed');

    const result2 = await getActiveSessionTool.handler({});
    const parsed2 = parseToolResult(result2);
    expect(parsed2.status).toBe('not_found');

    const session2Id = `session-${now + 1000}`;
    await db.insert(learningSessions).values({
      id: session2Id,
      topicId: null,
      chunkIds: null,
      mode: 'review',
      estimatedDuration: 20,
      status: 'active',
      startTime: now + 1000,
      endTime: null,
      feedback: null,
      createdAt: now + 1000,
      updatedAt: now + 1000,
    });

    const result3 = await getActiveSessionTool.handler({});
    const parsed3 = parseToolResult(result3);
    expect(parsed3.status).toBe('found');
    expect(parsed3.session.session_id).toBe(session2Id);
    expect(parsed3.session.mode).toBe('review');
  });

  it('should batch create and update session chunks atomically', async () => {
    const now = Date.now();
    const db = getSql();
    const topicId = `topic-${now}`;

    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Batch Topic',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'bchunk1',
      topicId,
      title: 'Batch Chunk 1',
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: null,
      tagsJson: null,
      content: 'c1',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'bchunk2',
      topicId,
      title: 'Batch Chunk 2',
      subject: 'CS',
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 10,
      chunkType: 'new',
      prerequisitesJson: null,
      tagsJson: null,
      content: 'c2',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const createOut = await createSessionTool.handler({
      topicId,
      chunkIds: ['bchunk1'],
      mode: 'learning',
      estimatedDuration: 25,
    });
    const created = parseToolResult(createOut);
    const sessionId = created.sessionId;

    const batchOut = await batchUpdateChunksTool.handler({
      sessionId,
      operations: [
        {
          chunkId: 'bchunk1',
          status: 'completed',
          attempts: [
            {
              timestamp: new Date(now).toISOString(),
              quality: 4,
              time_spent_ms: 60000,
              completed: true,
            },
          ],
          qualityScores: [4],
          timeSpentMs: 60000,
        },
        {
          chunkId: 'bchunk2',
          status: 'pending',
          attempts: [],
          qualityScores: [],
          timeSpentMs: 0,
        },
      ],
    });

    const batchParsed = parseToolResult(batchOut);
    expect(batchParsed.status).toBe('ok');
    expect(batchParsed.created).toBe(1);
    expect(batchParsed.updated).toBe(1);
    expect(batchParsed.unchanged).toBe(0);
    expect(batchParsed.affectedChunkIds.sort()).toEqual(['bchunk1', 'bchunk2']);

    const [session] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId));
    expect(session).toBeDefined();

    const sChunks = await db
      .select()
      .from(sessionChunks)
      .where(eq(sessionChunks.sessionId, sessionId));
    expect(sChunks.length).toBe(2);

    const c1 = sChunks.find(c => c.chunkId === 'bchunk1')!;
    const c2 = sChunks.find(c => c.chunkId === 'bchunk2')!;
    expect(c1.status).toBe('completed');
    expect(c2.status).toBe('pending');
  });

  it('should reject batch update with invalid chunk IDs', async () => {
    const createOut = await createSessionTool.handler({
      mode: 'learning',
      estimatedDuration: 25,
    });
    const created = parseToolResult(createOut);
    const sessionId = created.sessionId;

    const batchOut = await batchUpdateChunksTool.handler({
      sessionId,
      operations: [{ chunkId: 'does-not-exist', status: 'pending' }],
    });

    const batchParsed = parseToolResult(batchOut);
    expect(batchParsed.error.message).toMatch(/Invalid chunk IDs provided/);
  });

  it('should reject creating second active session via MCP tool', async () => {
    const result1 = await createSessionTool.handler({ mode: 'learning', estimatedDuration: 30 });
    const parsed1 = parseToolResult(result1);
    expect(parsed1.status).toBe('created');

    const result2 = await createSessionTool.handler({ mode: 'review', estimatedDuration: 30 });
    const parsed2 = parseToolResult(result2);
    expect(parsed2.message).toContain('Active session already exists');
  });
});
