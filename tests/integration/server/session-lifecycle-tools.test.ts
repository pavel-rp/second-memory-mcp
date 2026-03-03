import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerSessionLifecycleTools } from '../../../src/server/session-lifecycle-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';

import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('session-lifecycle-tools', () => {
  let server: CaptureServer;
  const now = Date.now();

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerSessionLifecycleTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  it('registers all 4 session lifecycle tools', () => {
    expect(server.tools.has('create_session')).toBe(true);
    expect(server.tools.has('get_active_session')).toBe(true);
    expect(server.tools.has('get_session')).toBe(true);
    expect(server.tools.has('complete_session')).toBe(true);
  });

  describe('create_session', () => {
    it('creates session with mode only', async () => {
      const handler = server.tools.get('create_session')!.handler;
      const result = await handler({ mode: 'learning' });
      const parsed = parseResult(result);
      expect(parsed.session_id).toBeDefined();
      expect(parsed.status).toBe('created');
      expect(parsed.message).toContain('learning');
    });

    it('creates session with chunkIds and resolves dependencies', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-s',
        title: 'Session Topic',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-s1',
        topicId: 'topic-s',
        title: 'Chunk 1',
        subject: 'Test',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });

      const handler = server.tools.get('create_session')!.handler;
      const result = await handler({
        mode: 'retrieval',
        chunk_ids: ['chunk-s1'],
        topic_id: 'topic-s',
      });
      const parsed = parseResult(result);
      expect(parsed.session_id).toBeDefined();
      expect(parsed.status).toBe('created');
    });
  });

  describe('get_active_session', () => {
    it('returns not_found when no active session', async () => {
      const handler = server.tools.get('get_active_session')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.status).toBe('not_found');
      expect(parsed.session).toBeNull();
    });

    it('returns active session after creation', async () => {
      const createHandler = server.tools.get('create_session')!.handler;
      await createHandler({ mode: 'learning' });

      const handler = server.tools.get('get_active_session')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.status).toBe('found');
      expect(parsed.session).toBeDefined();
    });
  });

  describe('get_session', () => {
    it('returns not_found for nonexistent session', async () => {
      const handler = server.tools.get('get_session')!.handler;
      const result = await handler({ session_id: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('not_found');
    });

    it('returns session by ID', async () => {
      const createHandler = server.tools.get('create_session')!.handler;
      const createResult = await createHandler({ mode: 'learning' });
      const sessionId = parseResult(createResult).session_id;

      const handler = server.tools.get('get_session')!.handler;
      const result = await handler({ session_id: sessionId });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('found');
      expect(parsed.session).toBeDefined();
    });
  });

  describe('complete_session', () => {
    it('completes an active session', async () => {
      const createHandler = server.tools.get('create_session')!.handler;
      const createResult = await createHandler({ mode: 'learning' });
      const sessionId = parseResult(createResult).session_id;

      const handler = server.tools.get('complete_session')!.handler;
      const result = await handler({ session_id: sessionId, feedback: 'Great session!' });
      const parsed = parseResult(result);
      expect(parsed.session_id).toBe(sessionId);
      expect(parsed.status).toBe('completed');
      expect(parsed.message).toContain('with feedback');
    });

    it('returns error for already completed session', async () => {
      const createHandler = server.tools.get('create_session')!.handler;
      const createResult = await createHandler({ mode: 'learning' });
      const sessionId = parseResult(createResult).session_id;

      const completeHandler = server.tools.get('complete_session')!.handler;
      await completeHandler({ session_id: sessionId });

      const result = await completeHandler({ session_id: sessionId });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('returns error for nonexistent session', async () => {
      const handler = server.tools.get('complete_session')!.handler;
      const result = await handler({ session_id: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });
  });
});
