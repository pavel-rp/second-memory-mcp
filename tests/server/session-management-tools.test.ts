import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { registerSessionManagementTools } from '../../src/server/session-management-tools.js';
import { resetDatabase, getDb } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { getSql } from '../../src/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../src/db/schema.js';
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

describe('Integration: Session Management Tools', () => {
  let server: CaptureServer;
  let createSessionTool: { spec: any; handler: Function };
  let getActiveSessionTool: { spec: any; handler: Function };
  let getSessionTool: { spec: any; handler: Function };
  let completeSessionTool: { spec: any; handler: Function };
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase(); // Reset singleton to pick up new path
    ensureSchema();

    server = new CaptureServer();
    registerSessionManagementTools(server as any);

    createSessionTool = server.tools.get('create_session')!;
    getActiveSessionTool = server.tools.get('get_active_session')!;
    getSessionTool = server.tools.get('get_session')!;
    completeSessionTool = server.tools.get('complete_session')!;

    expect(createSessionTool).toBeDefined();
    expect(getActiveSessionTool).toBeDefined();
    expect(getSessionTool).toBeDefined();
    expect(completeSessionTool).toBeDefined();
  });

  afterEach(async () => {
    await resetDatabase(); // Close database connection
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

  it('should create a session successfully', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    // Create a topic first
    db.insert(learningTopics)
      .values({
        id: uniqueId,
        title: 'Test Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Create the chunks that will be referenced
    db.insert(learningChunks)
      .values({
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
      })
      .run();

    db.insert(learningChunks)
      .values({
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
      })
      .run();

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

    // Verify session was created in database
    const session = db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, parsed.sessionId))
      .get();
    expect(session).toBeDefined();
    expect(session?.mode).toBe('learning');
    expect(session?.status).toBe('active');
    expect(session?.topicId).toBe(uniqueId);
  });

  it('should get active session correctly', async () => {
    const now = Date.now();
    const db = getSql();

    // Create a session directly in database
    const sessionId = `session-${now}`;
    db.insert(learningSessions)
      .values({
        id: sessionId,
        topicId: null,
        chunkIds: JSON.stringify(['chunk1']),
        mode: 'learning',
        estimatedDuration: 30,
        status: 'active',
        startTime: now,
        endTime: null,
        feedback: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

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

    // Create a session directly in database
    const sessionId = `session-${now}`;
    db.insert(learningSessions)
      .values({
        id: sessionId,
        topicId: null,
        chunkIds: JSON.stringify(['chunk1']),
        mode: 'review',
        estimatedDuration: 20,
        status: 'active',
        startTime: now,
        endTime: null,
        feedback: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

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

    // Create a session directly in database
    const sessionId = `session-${now}`;
    db.insert(learningSessions)
      .values({
        id: sessionId,
        topicId: null,
        chunkIds: JSON.stringify(['chunk1']),
        mode: 'learning',
        estimatedDuration: 30,
        status: 'active',
        startTime: now,
        endTime: null,
        feedback: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Add a small delay to ensure duration > 0
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

    // Verify session was updated in database
    const session = db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId))
      .get();
    expect(session?.status).toBe('completed');
    expect(session?.endTime).toBeDefined();
    expect(session?.feedback).toBe('Great session!');
  });

  it('should handle session completion without feedback', async () => {
    const now = Date.now();
    const db = getSql();

    // Create a session directly in database
    const sessionId = `session-${now}`;
    db.insert(learningSessions)
      .values({
        id: sessionId,
        topicId: null,
        chunkIds: JSON.stringify(['chunk1']),
        mode: 'learning',
        estimatedDuration: 30,
        status: 'active',
        startTime: now,
        endTime: null,
        feedback: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Add a small delay to ensure duration > 0
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await completeSessionTool.handler({
      sessionId: sessionId,
    });

    const parsed = parseToolResult(result);
    expect(parsed.sessionId).toBe(sessionId);
    expect(parsed.status).toBe('completed');
    expect(parsed.message).toContain('Session completed successfully');

    // Verify session was updated in database
    const session = db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId))
      .get();
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
    expect(parsed.error).toContain('Session nonexistent-session not found');
  });

  it('should handle invalid input gracefully', async () => {
    // Test create_session with invalid mode
    const result1 = await createSessionTool.handler({
      mode: 'invalid_mode',
    });

    const parsed1 = parseToolResult(result1);
    expect(parsed1.error).toBeDefined();

    // Test create_session with invalid duration
    const result2 = await createSessionTool.handler({
      mode: 'learning',
      estimatedDuration: 500, // Too long
    });

    const parsed2 = parseToolResult(result2);
    expect(parsed2.error).toBeDefined();

    // Test complete_session without sessionId
    const result3 = await completeSessionTool.handler({});

    const parsed3 = parseToolResult(result3);
    expect(parsed3.error).toBeDefined();
  });

  it('should handle database errors gracefully', async () => {
    // Reset database and drop tables to cause a real database error
    await resetDatabase();

    // Drop the learning_sessions table to cause a foreign key constraint error
    const db = getDb();
    db.exec('DROP TABLE IF EXISTS learning_sessions');

    // This should cause a database error since the table doesn't exist
    const result = await createSessionTool.handler({
      mode: 'learning',
    });

    const parsed = parseToolResult(result);
    expect(parsed.error).toBeDefined();
  });

  it('should work with session chunks', async () => {
    const now = Date.now();
    const db = getSql();
    const uniqueId = `topic-${now}-${Math.random()}`;

    // Create a topic and chunk first
    db.insert(learningTopics)
      .values({
        id: uniqueId,
        title: 'Test Topic',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const chunkId = `chunk-${now}`;
    db.insert(learningChunks)
      .values({
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
        prerequisitesJson: JSON.stringify([]),
        tagsJson: JSON.stringify([]),
        content: 'Test content',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Create a session
    const createResult = await createSessionTool.handler({
      topicId: uniqueId,
      chunkIds: [chunkId],
      mode: 'learning',
      estimatedDuration: 30,
    });

    const createParsed = parseToolResult(createResult);
    const sessionId = createParsed.sessionId;

    // Add session chunks
    db.insert(sessionChunks)
      .values({
        id: `session-chunk-${now}`,
        sessionId: sessionId,
        chunkId: chunkId,
        status: 'completed',
        attemptsJson: JSON.stringify([
          {
            timestamp: new Date(now).toISOString(),
            quality: 5,
            time_spent_ms: 3000,
            completed: true,
          },
        ]),
        qualityScoresJson: JSON.stringify([5]),
        timeSpentMs: 3000,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Get the session and verify chunks are included
    const getResult = await getSessionTool.handler({
      sessionId: sessionId,
    });

    const getParsed = parseToolResult(getResult);
    expect(getParsed.status).toBe('found');
    expect(getParsed.session.chunks).toHaveLength(2);
    // Find the completed chunk (the one we manually added)
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

    // Create first session
    const session1Id = `session-${now}`;
    db.insert(learningSessions)
      .values({
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
      })
      .run();

    // Should return the active session
    const result1 = await getActiveSessionTool.handler({});
    const parsed1 = parseToolResult(result1);
    expect(parsed1.status).toBe('found');
    expect(parsed1.session.session_id).toBe(session1Id);
    expect(parsed1.session.mode).toBe('learning');

    // Complete the first session
    const completeResult = await completeSessionTool.handler({
      sessionId: session1Id,
      feedback: 'Great session!',
    });
    const completeParsed = parseToolResult(completeResult);
    expect(completeParsed.status).toBe('completed');

    // Should return not_found when no active sessions
    const result2 = await getActiveSessionTool.handler({});
    const parsed2 = parseToolResult(result2);
    expect(parsed2.status).toBe('not_found');

    // Now create second session
    const session2Id = `session-${now + 1000}`;
    db.insert(learningSessions)
      .values({
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
      })
      .run();

    // Should return the new active session
    const result3 = await getActiveSessionTool.handler({});
    const parsed3 = parseToolResult(result3);
    expect(parsed3.status).toBe('found');
    expect(parsed3.session.session_id).toBe(session2Id);
    expect(parsed3.session.mode).toBe('review');
  });

  it('should reject creating second active session via MCP tool', async () => {
    // Create first session
    const result1 = await createSessionTool.handler({ mode: 'learning', estimatedDuration: 30 });
    const parsed1 = parseToolResult(result1);
    expect(parsed1.status).toBe('created');

    // Attempt second session should return error
    const result2 = await createSessionTool.handler({ mode: 'review', estimatedDuration: 30 });
    const parsed2 = parseToolResult(result2);
    expect(parsed2.error).toContain('Active session already exists');
  });
});
