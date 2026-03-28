import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { DrizzleSessionRepository } from '../../../src/adapters/drizzle/session-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('sessions service', () => {
  let ctx: AppContext;
  let sessionRepo: DrizzleSessionRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    sessionRepo = new DrizzleSessionRepository(getSql());
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedTopicAndChunks(topicId: string, chunkIds: string[], now: number) {
    const db = getSql();
    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Test Topic',
      subject: 'Math',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    for (const cId of chunkIds) {
      await db.insert(learningChunks).values({
        id: cId,
        topicId,
        title: `Chunk ${cId}`,
        subject: 'Math',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: [],
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  it('creates, reads, updates, and deletes a session', async () => {
    const now = Date.now();
    await seedTopicAndChunks('t1', ['c1', 'c2'], now);

    // Use low-level repo for direct CRUD (createSession on ctx returns ServiceResult)
    await sessionRepo.createSession({
      id: 's1',
      topicId: 't1',
      chunkIds: ['c1', 'c2'],
      mode: 'learning',
      estimatedDuration: 30,
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });
    const fetched = await ctx.getSessionById('s1');
    expect(fetched?.id).toBe('s1');
    expect(fetched?.mode).toBe('learning');
    expect(fetched?.status).toBe('active');

    const updated = await sessionRepo.updateSession('s1', {
      status: 'completed',
      endTime: now + 1800000,
      updatedAt: now + 1,
    });
    expect(updated).toBe(1);

    const completed = await ctx.getSessionById('s1');
    expect(completed?.status).toBe('completed');
    expect(Number(completed?.endTime)).toBe(now + 1800000);

    const removed = await sessionRepo.deleteSession('s1');
    expect(removed).toBe(1);

    const notFound = await ctx.getSessionById('s1');
    expect(notFound).toBeNull();
  });

  it('prevents creating second active session', async () => {
    const now = Date.now();

    await sessionRepo.createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    // The ctx.createSession returns ServiceResult instead of throwing
    const result = await ctx.createSession({
      mode: 'review',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Active session');
    }

    const active = await ctx.getActiveSession();
    expect(active?.id).toBe('s1');
  });

  it('manages active sessions correctly', async () => {
    const now = Date.now();

    await sessionRepo.createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    const active = await ctx.getActiveSession();
    expect(active?.id).toBe('s1');

    await ctx.completeSession('s1', 'Great session!');

    const noActive = await ctx.getActiveSession();
    expect(noActive).toBeNull();

    await sessionRepo.createSession({
      id: 's2',
      mode: 'review',
      startTime: now + 1000,
      createdAt: now + 1000,
      updatedAt: now + 1000,
    });

    const newActive = await ctx.getActiveSession();
    expect(newActive?.id).toBe('s2');

    await ctx.completeSession('s2', undefined);

    const finalCheck = await ctx.getActiveSession();
    expect(finalCheck).toBeNull();
  });

  it('creates and manages session chunks', async () => {
    const now = Date.now();
    await seedTopicAndChunks(`topic-${now}`, ['c1', 'c2'], now);

    await sessionRepo.createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.createSessionChunk({
      id: 'sc1',
      sessionId: 's1',
      chunkId: 'c1',
      status: 'pending',
      timeSpentMs: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.createSessionChunk({
      id: 'sc2',
      sessionId: 's1',
      chunkId: 'c2',
      status: 'in_progress',
      timeSpentMs: 5000,
      createdAt: now,
      updatedAt: now,
    });

    const chunks = await ctx.getSessionChunks('s1');
    expect(chunks.length).toBe(2);
    expect(chunks[0].status).toBe('pending');
    expect(chunks[1].status).toBe('in_progress');

    const chunk = await sessionRepo.getSessionChunkById('sc1');
    expect(chunk?.chunkId).toBe('c1');
    expect(chunk?.status).toBe('pending');

    const updatedCount = await sessionRepo.updateSessionChunk('sc1', {
      status: 'completed',
      timeSpentMs: 10000,
      updatedAt: now + 1,
    });
    expect(updatedCount).toBe(1);

    const updatedChunk = await sessionRepo.getSessionChunkById('sc1');
    expect(updatedChunk?.status).toBe('completed');
    expect(updatedChunk?.timeSpentMs).toBe(10000);

    const deleted = await sessionRepo.deleteSessionChunk('sc1');
    expect(deleted).toBe(1);

    const remainingChunks = await ctx.getSessionChunks('s1');
    expect(remainingChunks.length).toBe(1);
  });

  it('handles error scenarios gracefully', async () => {
    const notFound = await ctx.getSessionById('nonexistent');
    expect(notFound).toBeNull();

    const updateResult = await sessionRepo.updateSession('nonexistent', {
      status: 'completed',
      updatedAt: Date.now(),
    });
    expect(updateResult).toBe(0);

    const completeResult = await sessionRepo.completeSession('nonexistent');
    expect(completeResult).toBe(0);

    const deleteResult = await sessionRepo.deleteSession('nonexistent');
    expect(deleteResult).toBe(0);

    const chunks = await ctx.getSessionChunks('nonexistent');
    expect(chunks.length).toBe(0);

    const sessionInput = await ctx.convertSessionToInput('nonexistent');
    expect(sessionInput).toBeNull();
  });

  describe('Enhanced Session Creation with Automatic Chunk Creation', () => {
    it('should create session with automatic chunk creation when chunkIds provided', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1', 'chunk2'], now);

      await sessionRepo.createSession({
        id: 'session1',
        topicId: 'topic1',
        chunkIds: ['chunk1', 'chunk2'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      const session = await ctx.getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      const sessionChunks = await ctx.getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(2);
      const chunkIds = sessionChunks.map(c => c.chunkId);
      expect(chunkIds).toContain('chunk1');
      expect(chunkIds).toContain('chunk2');
      for (const chunk of sessionChunks) {
        expect(chunk.status).toBe('pending');
      }
    });

    it('should reject session creation with invalid chunk IDs', async () => {
      const result = await ctx.createSession({
        chunkIds: ['nonexistent1', 'nonexistent2'],
        mode: 'learning',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('nonexistent1');
      }
    });

    it('should create session without chunks when chunkIds not provided', async () => {
      const now = Date.now();

      await sessionRepo.createSession({
        id: 'session1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      const session = await ctx.getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      const sessionChunks = await ctx.getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(0);
    });

    it('should create session with empty chunkIds array', async () => {
      const now = Date.now();

      await sessionRepo.createSession({
        id: 'session1',
        chunkIds: [],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      const session = await ctx.getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      const sessionChunks = await ctx.getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(0);
    });

    it('should handle mixed valid and invalid chunk IDs', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1'], now);

      const result = await ctx.createSession({
        chunkIds: ['chunk1', 'nonexistent'],
        mode: 'learning',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('nonexistent');
      }
    });

    it('should preserve chunk insertion order when fetching session chunks', async () => {
      const now = Date.now();
      const orderedChunkIds = ['c-first', 'c-middle', 'c-last'];
      await seedTopicAndChunks('topic-order', orderedChunkIds, now);

      const input: import('../../../src/ports/session-repository.js').CreateSessionInput = {
        id: 'session-order',
        topicId: 'topic-order',
        chunkIds: orderedChunkIds,
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };
      await sessionRepo.createSession(input);

      const chunks = await sessionRepo.getSessionChunks('session-order');
      expect(chunks.map(c => c.chunkId)).toEqual(orderedChunkIds);
    });

    it('should preserve insertion order for single-chunk session (index=0, no offset)', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-single', ['c-only'], now);

      const input: import('../../../src/ports/session-repository.js').CreateSessionInput = {
        id: 'session-single',
        topicId: 'topic-single',
        chunkIds: ['c-only'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };
      await sessionRepo.createSession(input);

      const chunks = await sessionRepo.getSessionChunks('session-single');
      expect(chunks.map(c => c.chunkId)).toEqual(['c-only']);
    });
  });

  describe('validateChunkIds', () => {
    it('should return valid result for empty chunk IDs array', async () => {
      const result = await ctx.validateChunkIds([]);

      expect(result.valid).toBe(true);
      expect(result.validIds).toEqual([]);
      expect(result.invalidIds).toEqual([]);
    });

    it('should return valid result for null/undefined chunk IDs', async () => {
      const result1 = await ctx.validateChunkIds(null as any);
      const result2 = await ctx.validateChunkIds(undefined as any);

      expect(result1.valid).toBe(true);
      expect(result1.validIds).toEqual([]);
      expect(result1.invalidIds).toEqual([]);

      expect(result2.valid).toBe(true);
      expect(result2.validIds).toEqual([]);
      expect(result2.invalidIds).toEqual([]);
    });

    it('should validate existing chunk IDs successfully', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1', 'chunk2'], now);

      const result = await ctx.validateChunkIds(['chunk1', 'chunk2']);

      expect(result.valid).toBe(true);
      expect(result.validIds).toEqual(['chunk1', 'chunk2']);
      expect(result.invalidIds).toEqual([]);
    });

    it('should identify invalid chunk IDs', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1'], now);

      const result = await ctx.validateChunkIds(['chunk1', 'nonexistent1', 'nonexistent2']);

      expect(result.valid).toBe(false);
      expect(result.validIds).toEqual(['chunk1']);
      expect(result.invalidIds).toEqual(['nonexistent1', 'nonexistent2']);
    });

    it('should handle mixed valid and invalid chunk IDs', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1', 'chunk3'], now);

      const result = await ctx.validateChunkIds(['chunk1', 'nonexistent', 'chunk3']);

      expect(result.valid).toBe(false);
      expect(result.validIds).toEqual(['chunk1', 'chunk3']);
      expect(result.invalidIds).toEqual(['nonexistent']);
    });

    it('should handle all invalid chunk IDs', async () => {
      const result = await ctx.validateChunkIds(['nonexistent1', 'nonexistent2', 'nonexistent3']);

      expect(result.valid).toBe(false);
      expect(result.validIds).toEqual([]);
      expect(result.invalidIds).toEqual(['nonexistent1', 'nonexistent2', 'nonexistent3']);
    });

    it('should handle duplicate chunk IDs correctly', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1'], now);

      const result = await ctx.validateChunkIds(['chunk1', 'chunk1', 'chunk1']);

      expect(result.valid).toBe(true);
      expect(result.validIds).toEqual(['chunk1', 'chunk1', 'chunk1']);
      expect(result.invalidIds).toEqual([]);
    });

    it('should handle large numbers of chunk IDs efficiently', async () => {
      const now = Date.now();
      const db = getSql();

      await db.insert(learningTopics).values({
        id: 'topic1',
        title: 'Test Topic',
        subject: 'Math',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const chunkIds: string[] = [];
      for (let i = 1; i <= 50; i++) {
        const chunkId = `chunk${i}`;
        chunkIds.push(chunkId);
        await db.insert(learningChunks).values({
          id: chunkId,
          topicId: 'topic1',
          title: `Test Chunk ${i}`,
          subject: 'Math',
          difficulty: 5,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 0,
          lastReviewedAt: null,
          estimatedDuration: 10,
          chunkType: 'new',
          prerequisitesJson: [],
          tagsJson: [],
          content: null,
          contentVersion: null,
          contentUpdatedAt: null,
          createdAt: now,
          updatedAt: now,
        });
      }

      const result = await ctx.validateChunkIds(chunkIds);

      expect(result.valid).toBe(true);
      expect(result.validIds).toEqual(chunkIds);
      expect(result.invalidIds).toEqual([]);
    });
  });

  describe('TF-2: getHistoricalFeedback fallback', () => {
    it('returns no feedback when session has null chunkIds even if session_chunks exist', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1'], now);

      // Session created without chunkIds — the adapter only checks session.chunkIds,
      // not the session_chunks table, so no feedback is returned.
      await sessionRepo.createSession({
        id: 's1',
        topicId: 't1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.createSessionChunk({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'c1',
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      await ctx.completeSession('s1', 'Found chunk 1 difficult');

      const feedback = await ctx.getHistoricalFeedback(['c1']);
      expect(feedback.length).toBe(0);
    });

    it('returns feedback via fast path when session has populated chunkIds', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1'], now);

      await sessionRepo.createSession({
        id: 's1',
        topicId: 't1',
        chunkIds: ['c1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.completeSession('s1', 'Good session');

      const feedback = await ctx.getHistoricalFeedback(['c1']);
      expect(feedback.length).toBe(1);
      expect(feedback[0].feedback).toBe('Good session');
    });

    it('returns empty when session has null chunkIds and no session_chunks', async () => {
      const now = Date.now();

      await sessionRepo.createSession({
        id: 's1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.completeSession('s1', 'Some feedback');

      const feedback = await ctx.getHistoricalFeedback(['c1']);
      expect(feedback.length).toBe(0);
    });

    it('returns empty when chunks do not overlap with query', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1', 'c2'], now);

      await sessionRepo.createSession({
        id: 's1',
        topicId: 't1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.createSessionChunk({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'c1',
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      await ctx.completeSession('s1', 'Feedback about c1');

      const feedback = await ctx.getHistoricalFeedback(['c2']);
      expect(feedback.length).toBe(0);
    });
  });
});
