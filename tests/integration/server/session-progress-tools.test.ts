import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerSessionProgressTools } from '../../../src/server/session-progress-tools.js';
import { registerSessionLifecycleTools } from '../../../src/server/session-lifecycle-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';

import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('session-progress-tools', () => {
  let server: CaptureServer;
  const now = Date.now();

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    const ctx = createAppContext({ embedding: undefined });
    registerSessionLifecycleTools(server as any, ctx);
    registerSessionProgressTools(server as any, ctx);
  });
  afterAll(teardownTestDb);

  it('registers all 3 session progress tools', () => {
    expect(server.tools.has('create_session_chunk')).toBe(true);
    expect(server.tools.has('batch_update_session_chunks')).toBe(true);
    expect(server.tools.has('get_historical_feedback')).toBe(true);
  });

  async function createSessionWithChunk() {
    const db = getSql();
    await db.insert(learningTopics).values({
      id: 'topic-p',
      title: 'Progress Topic',
      subject: 'Test',
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(learningChunks).values({
      id: 'chunk-p1',
      topicId: 'topic-p',
      title: 'Progress Chunk',
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

    const createHandler = server.tools.get('create_session')!.handler;
    const createResult = await createHandler({
      mode: 'learning',
      chunk_ids: ['chunk-p1'],
      topic_id: 'topic-p',
    });
    return parseResult(createResult).session_id;
  }

  describe('create_session_chunk', () => {
    it('creates session chunk successfully', async () => {
      const sessionId = await createSessionWithChunk();

      const handler = server.tools.get('create_session_chunk')!.handler;
      const result = await handler({
        session_id: sessionId,
        chunk_id: 'chunk-p1',
        status: 'in_progress',
      });
      const parsed = parseResult(result);
      expect(parsed.session_chunk_id).toBeDefined();
      expect(parsed.status).toBe('created');
    });

    it('creates session chunk with attempts', async () => {
      const sessionId = await createSessionWithChunk();

      const handler = server.tools.get('create_session_chunk')!.handler;
      const result = await handler({
        session_id: sessionId,
        chunk_id: 'chunk-p1',
        status: 'completed',
        attempts: [
          {
            timestamp: now,
            question: 'Test question',
            response: 'Test response',
            passed: true,
            feedback: 'Test feedback',
            quality: 4,
            time_spent_ms: 5000,
          },
        ],
        quality_scores: [4],
        time_spent_ms: 5000,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('created');
    });
  });

  describe('get_historical_feedback', () => {
    it('returns empty feedback for chunks with no history', async () => {
      const handler = server.tools.get('get_historical_feedback')!.handler;
      const result = await handler({ chunk_ids: ['chunk-p1'] });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.feedback_count).toBe(0);
      expect(parsed.hint).toContain('No previous feedback');
    });

    it('returns feedback from completed sessions', async () => {
      // Create and complete a session with feedback
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-fb',
        title: 'Feedback',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-fb',
        topicId: 'topic-fb',
        title: 'Feedback Chunk',
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

      const createHandler = server.tools.get('create_session')!.handler;
      const createResult = await createHandler({
        mode: 'learning',
        chunk_ids: ['chunk-fb'],
      });
      const sessionId = parseResult(createResult).session_id;

      const completeHandler = server.tools.get('complete_session')!.handler;
      await completeHandler({ session_id: sessionId, feedback: 'Found algebra hard' });

      const handler = server.tools.get('get_historical_feedback')!.handler;
      const result = await handler({ chunk_ids: ['chunk-fb'] });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.feedback_count).toBeGreaterThanOrEqual(1);
      expect(parsed.hint).toContain('Pay special attention');
    });
  });
});
