import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { DrizzleSessionRepository } from '../../../src/adapters/drizzle/session-repository.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import * as sessionWorkflows from '../../../src/orchestration/session-workflows.js';
import type {
  CreateSessionInput,
  CreateSessionChunkInput,
} from '../../../src/ports/session-repository.js';
import type { BatchOperation } from '../../../src/domain/types/session.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  sessionQuestions,
  sessionQuestionChunks,
} from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import {
  STDIO_PLACEHOLDER_LEARNER_KEY,
  withLearnerAuthContext,
} from '../../../src/shared/learner-context.js';

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
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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

  it('rejects a second no-topic create_session call against a no-topic empty active session (NEU-1018)', async () => {
    // A session created with no topicId and no chunks (the ROLLING SESSION FLOW's "open an
    // empty session, add chunks one at a time" pattern) must NOT be silently auto-completed by
    // a second no-topic create_session call — zero chunks is not "all completed". Both sides
    // are in the "no-topic bucket", so this is the same-bucket conflict, not an auto-complete.
    const now = Date.now();

    await sessionRepo.createSession({
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await ctx.createSession({ mode: 'review' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('conflict');
      expect(result.error.findings).toMatchObject({
        code: 'active_session_exists_same_topic',
        session_id: 's1',
      });
    }
    const stillActive = await ctx.getSessionById('s1');
    expect(stillActive?.status).toBe('active');
  });

  it('pauses (not auto-completes) a no-topic empty active session when a different topic is requested (NEU-1018)', async () => {
    const now = Date.now();
    await seedTopicAndChunks('topic-x', ['cx1'], now);

    await sessionRepo.createSession({
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await ctx.createSession({ mode: 'learning', topicId: 'topic-x' });

    expect(result.success).toBe(true);
    const paused = await ctx.getSessionById('s1');
    expect(paused?.status).toBe('paused');
    expect(paused?.pausedAt).toEqual(expect.any(Number));
  });

  it('auto-completes a non-empty, fully-completed active session before creating a new one (NEU-1018)', async () => {
    const now = Date.now();
    await seedTopicAndChunks('topic-y', ['cy1'], now);

    await sessionRepo.createSession({
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
      id: 's1',
      topicId: 'topic-y',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.createSessionChunk({
      id: 'sc1',
      sessionId: 's1',
      chunkId: 'cy1',
      status: 'completed',
      timeSpentMs: 500,
      createdAt: now,
      updatedAt: now,
    });

    const result = await ctx.createSession({ mode: 'review' });

    expect(result.success).toBe(true);
    const completed = await ctx.getSessionById('s1');
    expect(completed?.status).toBe('completed');
    expect(completed?.pausedAt).toBeNull();
  });

  it('manages active sessions correctly', async () => {
    const now = Date.now();

    await sessionRepo.createSession({
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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

  describe('topic switching (NEU-1018)', () => {
    it('pauses the active session (status + paused_at persisted, chunks untouched) and creates the new one for a different topic', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['ca1'], now);
      await seedTopicAndChunks('topic-b', ['cb1'], now);

      await sessionRepo.createSession({
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 's1',
        topicId: 'topic-a',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.createSessionChunk({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'ca1',
        status: 'in_progress',
        timeSpentMs: 1234,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.createSession({ topicId: 'topic-b', mode: 'learning' });

      expect(result.success).toBe(true);

      const paused = await ctx.getSessionById('s1');
      expect(paused?.status).toBe('paused');
      expect(paused?.pausedAt).toEqual(expect.any(Number));

      // Chunk progress is untouched by pausing.
      const chunksAfterPause = await ctx.getSessionChunks('s1');
      expect(chunksAfterPause).toHaveLength(1);
      expect(chunksAfterPause[0]?.status).toBe('in_progress');
      expect(chunksAfterPause[0]?.timeSpentMs).toBe(1234);

      // A paused session is excluded from get_active_session.
      const active = await ctx.getActiveSession();
      expect(active?.id).not.toBe('s1');
      if (result.success) {
        expect(active?.id).toBe(result.data.sessionId);
      }
    });

    it('rejects a same-topic create_session request with the structured conflict, creating and pausing nothing', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['ca1'], now);

      await sessionRepo.createSession({
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 's1',
        topicId: 'topic-a',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.createSessionChunk({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'ca1',
        status: 'pending',
        timeSpentMs: 0,
        createdAt: now,
        updatedAt: now,
      });

      const result = await ctx.createSession({ topicId: 'topic-a', mode: 'learning' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('conflict');
        expect(result.error.findings).toMatchObject({
          code: 'active_session_exists_same_topic',
          session_id: 's1',
          topic_id: 'topic-a',
        });
      }

      // Nothing created, and s1 is still active (not paused).
      const stillActive = await ctx.getSessionById('s1');
      expect(stillActive?.status).toBe('active');
      expect(stillActive?.pausedAt).toBeNull();
      const active = await ctx.getActiveSession();
      expect(active?.id).toBe('s1');
    });

    it("pauses only the switching learner's session — a second learner's active session is untouched", async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['ca1'], now);
      await seedTopicAndChunks('topic-b', ['cb1'], now);
      const learner1 = 'learner-1';
      const learner2 = 'learner-2';
      const sessionDeps = {
        sessions: sessionRepo,
        chunks: new DrizzleChunkRepository(getSql()),
        maxDependencyDepth: 5,
      };

      await sessionWorkflows.createSession(
        { topicId: 'topic-a', mode: 'learning' },
        learner1,
        sessionDeps
      );
      const learner2Result = await sessionWorkflows.createSession(
        { topicId: 'topic-a', mode: 'learning' },
        learner2,
        sessionDeps
      );
      expect(learner2Result.success).toBe(true);

      // Learner 1 switches to topic-b — only learner 1's session pauses.
      const switchResult = await sessionWorkflows.createSession(
        { topicId: 'topic-b', mode: 'learning' },
        learner1,
        sessionDeps
      );
      expect(switchResult.success).toBe(true);

      const learner1Active = await sessionRepo.getActiveSession(learner1);
      const learner2Active = await sessionRepo.getActiveSession(learner2);
      expect(learner1Active?.topicId).toBe('topic-b');
      expect(learner2Active?.topicId).toBe('topic-a');
      expect(learner2Active?.status).toBe('active');
      expect(learner2Active?.pausedAt).toBeNull();
    });
  });

  it('creates and manages session chunks', async () => {
    const now = Date.now();
    await seedTopicAndChunks(`topic-${now}`, ['c1', 'c2'], now);

    await sessionRepo.createSession({
      learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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

      const input: CreateSessionInput = {
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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

    it('should roll back the session row when a chunk insert fails (NEU-773)', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-tx', ['tx-valid'], now);

      const input: CreateSessionInput = {
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 'session-tx-rollback',
        topicId: 'topic-tx',
        chunkIds: ['tx-valid', 'tx-nonexistent'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };
      // FK session_chunks.chunk_id → learning_chunks.id fails on the second insert
      await expect(sessionRepo.createSession(input)).rejects.toThrow();

      const session = await sessionRepo.getSessionById(
        'session-tx-rollback',
        STDIO_PLACEHOLDER_LEARNER_KEY
      );
      expect(session).toBeNull();

      const chunks = await sessionRepo.getSessionChunks('session-tx-rollback');
      expect(chunks).toHaveLength(0);
    });

    it('should commit session row and chunk rows together on success (NEU-773)', async () => {
      const now = Date.now();
      const chunkIds = ['tx-c1', 'tx-c2', 'tx-c3'];
      await seedTopicAndChunks('topic-tx-ok', chunkIds, now);

      const input: CreateSessionInput = {
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 'session-tx-ok',
        topicId: 'topic-tx-ok',
        chunkIds,
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };
      await sessionRepo.createSession(input);

      const session = await sessionRepo.getSessionById(
        'session-tx-ok',
        STDIO_PLACEHOLDER_LEARNER_KEY
      );
      expect(session?.id).toBe('session-tx-ok');
      expect(session?.status).toBe('active');

      const chunks = await sessionRepo.getSessionChunks('session-tx-ok');
      expect(chunks).toHaveLength(3);
      expect(chunks.map(c => c.chunkId)).toEqual(chunkIds);
      for (const [index, chunk] of chunks.entries()) {
        expect(chunk.status).toBe('pending');
        expect(Number(chunk.createdAt)).toBe(now + index);
      }
    });

    it('should preserve insertion order for single-chunk session (index=0, no offset)', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-single', ['c-only'], now);

      const input: CreateSessionInput = {
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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

  describe('NEU-376: same-timestamp ordering in batch chunk operations', () => {
    it('batchCreateSessionChunks preserves input order with identical timestamps', async () => {
      const now = Date.now();
      const chunkIds = ['bc-first', 'bc-second', 'bc-third'];
      await seedTopicAndChunks('topic-batch', chunkIds, now);

      await sessionRepo.createSession({
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 'session-batch',
        topicId: 'topic-batch',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      const inputs: CreateSessionChunkInput[] = chunkIds.map((chunkId, i) => ({
        id: `sc-batch-${i}`,
        sessionId: 'session-batch',
        chunkId,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }));

      await sessionRepo.batchCreateSessionChunks(inputs);

      const fetched = await sessionRepo.getSessionChunks('session-batch');
      expect(fetched.map(c => c.chunkId)).toEqual(chunkIds);
    });

    it('persistBatchSessionChunkOperations preserves operation order for new chunks', async () => {
      const now = Date.now();
      const chunkIds = ['pb-first', 'pb-second', 'pb-third'];
      await seedTopicAndChunks('topic-persist', chunkIds, now);

      await sessionRepo.createSession({
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 'session-persist',
        topicId: 'topic-persist',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      const operations: BatchOperation[] = chunkIds.map(chunkId => ({
        chunkId,
        status: 'pending' as const,
      }));

      const result = await sessionRepo.persistBatchSessionChunkOperations({
        sessionId: 'session-persist',
        operations,
        existingChunks: [],
      });

      expect(result.created).toBe(3);

      const fetched = await sessionRepo.getSessionChunks('session-persist');
      expect(fetched.map(c => c.chunkId)).toEqual(chunkIds);
    });

    it('persistBatchSessionChunkOperations only staggers new chunks, not updates', async () => {
      const now = Date.now();
      const chunkIds = ['mx-existing', 'mx-new1', 'mx-new2'];
      await seedTopicAndChunks('topic-mixed', chunkIds, now);

      await sessionRepo.createSession({
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
        id: 'session-mixed',
        topicId: 'topic-mixed',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      // Pre-create one chunk so it becomes an "existing" chunk for the batch operation
      await sessionRepo.createSessionChunk({
        id: 'sc-existing',
        sessionId: 'session-mixed',
        chunkId: 'mx-existing',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });

      const existingChunks = await sessionRepo.getSessionChunks('session-mixed');

      const operations: BatchOperation[] = [
        { chunkId: 'mx-existing', status: 'in_progress' },
        { chunkId: 'mx-new1', status: 'pending' },
        { chunkId: 'mx-new2', status: 'pending' },
      ];

      const result = await sessionRepo.persistBatchSessionChunkOperations({
        sessionId: 'session-mixed',
        operations,
        existingChunks,
      });

      expect(result.created).toBe(2);
      expect(result.updated).toBe(1);

      const fetched = await sessionRepo.getSessionChunks('session-mixed');
      // Existing chunk was first (lowest createdAt), new chunks follow in operation order
      expect(fetched.map(c => c.chunkId)).toEqual(['mx-existing', 'mx-new1', 'mx-new2']);
    });
  });

  describe('TF-2: getHistoricalFeedback fallback', () => {
    it('returns no feedback when session has null chunkIds even if session_chunks exist', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1'], now);

      // Session created without chunkIds — the adapter only checks session.chunkIds,
      // not the session_chunks table, so no feedback is returned.
      await sessionRepo.createSession({
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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
        learnerKey: STDIO_PLACEHOLDER_LEARNER_KEY,
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

  describe('resume with recompute (NEU-1021)', () => {
    it('recomputes a paused session against a shifted review schedule — sheds no-longer-due chunks (keeping their history), keeps completed chunks, admits newly-due chunks', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['a1', 'a2', 'a3'], now);
      const learner = 'learner-shift';

      await sessionRepo.createSession({
        learnerKey: learner,
        id: 'session-shift',
        topicId: 'topic-a',
        chunkIds: ['a1', 'a2'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      const chunksBefore = await sessionRepo.getSessionChunks('session-shift');
      const a1SessionChunk = chunksBefore.find(c => c.chunkId === 'a1');
      const a2SessionChunk = chunksBefore.find(c => c.chunkId === 'a2');
      expect(a1SessionChunk).toBeDefined();
      expect(a2SessionChunk).toBeDefined();
      await sessionRepo.updateSessionChunk(a1SessionChunk!.id, {
        status: 'completed',
        updatedAt: now,
      });

      // Question/attempt history on a2 (the chunk that will fall out of due) — keyed by
      // chunk id, not session_chunks id, so it must survive that row's removal.
      const db = getSql();
      await db.insert(sessionQuestions).values({
        id: 'sq-a2',
        sessionId: 'session-shift',
        questionIndex: 1,
        promptText: 'What is a2 about?',
        status: 'answered',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(sessionQuestionChunks).values({
        id: 'sqc-a2',
        sessionQuestionId: 'sq-a2',
        chunkId: 'a2',
      });

      // a2 falls out of due (shifted far into the future); a3 was never in the session
      // and is due (seedTopicAndChunks sets nextReviewAt = now, already <= Date.now()).
      await db
        .update(learningChunks)
        .set({ nextReviewAt: now + 10_000_000_000 })
        .where(eq(learningChunks.id, 'a2'));

      const pausedAt = now + 1000;
      await sessionRepo.updateSession('session-shift', {
        status: 'paused',
        pausedAt,
        updatedAt: pausedAt,
      });

      const result = await withLearnerAuthContext(learner, () =>
        ctx.startLearning({ topicId: 'topic-a' })
      );

      expect(result.action).toBe('resumed');
      if (result.action !== 'resumed') throw new Error('Expected resumed');
      expect(result.session_id).toBe('session-shift');

      const resumedSession = await sessionRepo.getSessionById('session-shift', learner);
      expect(resumedSession?.status).toBe('active');
      expect(resumedSession?.pausedAt).toBeNull();

      const finalChunks = await sessionRepo.getSessionChunks('session-shift');
      const finalChunkIds = finalChunks.map(c => c.chunkId);
      expect(finalChunkIds).toContain('a1');
      expect(finalChunkIds).not.toContain('a2');
      expect(finalChunkIds).toContain('a3');

      const a1Final = finalChunks.find(c => c.chunkId === 'a1');
      expect(a1Final?.status).toBe('completed');
      // a3 was admitted as 'pending' by recompute, but resume also calls
      // getNextTeachingStep (since the post-recompute count isn't zero), which selects
      // the next pending chunk and marks it 'in_progress' as part of hydrating the first
      // teaching step — the same behavior the pre-existing active-session-resume tail has.
      const a3Final = finalChunks.find(c => c.chunkId === 'a3');
      expect(a3Final?.status).toBe('in_progress');

      // a2's session_question_chunks history survives even though its session_chunks
      // row was removed — the junction keys off chunk id, not session_chunks id.
      const survivingJunction = await db
        .select()
        .from(sessionQuestionChunks)
        .where(eq(sessionQuestionChunks.chunkId, 'a2'));
      expect(survivingJunction).toHaveLength(1);
    });

    it('resumes a paused session that recomputes to zero chunks (AC6) — no stale chunk served, no error', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-empty', ['ze1'], now);
      const learner = 'learner-emptyrecompute';

      await sessionRepo.createSession({
        learnerKey: learner,
        id: 'session-empty-after-recompute',
        topicId: 'topic-empty',
        chunkIds: ['ze1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      // ze1 falls out of due before resume, and topic-empty has no other chunk to admit —
      // post-recompute session_chunks is empty, and ze1 was never completed.
      const db = getSql();
      await db
        .update(learningChunks)
        .set({ nextReviewAt: now + 10_000_000_000 })
        .where(eq(learningChunks.id, 'ze1'));

      await sessionRepo.updateSession('session-empty-after-recompute', {
        status: 'paused',
        pausedAt: now + 1000,
        updatedAt: now + 1000,
      });

      const result = await withLearnerAuthContext(learner, () =>
        ctx.startLearning({ topicId: 'topic-empty' })
      );

      expect(result.action).toBe('resumed');
      if (result.action !== 'resumed') throw new Error('Expected resumed');
      expect(result.session_id).toBe('session-empty-after-recompute');
      expect(result.total_chunks).toBe(0);
      expect(result.first_chunk.action).toBe('complete');

      const resumedSession = await sessionRepo.getSessionById(
        'session-empty-after-recompute',
        learner
      );
      expect(resumedSession?.status).toBe('active');

      const finalChunks = await sessionRepo.getSessionChunks('session-empty-after-recompute');
      expect(finalChunks).toHaveLength(0);
    });

    describe('no-topic bucket', () => {
      async function seedPausedNoTopicSession(learner: string, now: number): Promise<void> {
        await seedTopicAndChunks('topic-c', ['c1'], now);
        await seedTopicAndChunks('topic-d', ['d1'], now);
        await sessionRepo.createSession({
          learnerKey: learner,
          id: 'session-notopic',
          chunkIds: ['c1', 'd1'],
          mode: 'learning',
          startTime: now,
          createdAt: now,
          updatedAt: now,
        });
        const pausedAt = now + 1000;
        await sessionRepo.updateSession('session-notopic', {
          status: 'paused',
          pausedAt,
          updatedAt: pausedAt,
        });
      }

      it('start_learning(topic_id) for a different topic never resumes the no-topic bucket', async () => {
        const now = Date.now();
        const learner = 'learner-notopic-a';
        await seedPausedNoTopicSession(learner, now);
        await seedTopicAndChunks('topic-b', ['b1'], now);

        const result = await withLearnerAuthContext(learner, () =>
          ctx.startLearning({ topicId: 'topic-b' })
        );
        expect(result.action).toBe('started');

        const notopic = await sessionRepo.getSessionById('session-notopic', learner);
        expect(notopic?.status).toBe('paused');
      });

      it('auto-pick start_learning({}) never resumes the no-topic bucket', async () => {
        const now = Date.now();
        const learner = 'learner-notopic-b';
        await seedPausedNoTopicSession(learner, now);
        await seedTopicAndChunks('topic-b', ['b1'], now);

        const result = await withLearnerAuthContext(learner, () => ctx.startLearning({}));
        expect(result.action).toBe('started');

        const notopic = await sessionRepo.getSessionById('session-notopic', learner);
        expect(notopic?.status).toBe('paused');
      });

      it('start_learning(no_topic: true) resumes the no-topic bucket, admitting no new chunks', async () => {
        const now = Date.now();
        const learner = 'learner-notopic-c';
        await seedPausedNoTopicSession(learner, now);
        // A due chunk elsewhere in the DB — proves recompute never admits it into the
        // no-topic bucket (there is no single topic to source additions from).
        await seedTopicAndChunks('topic-e', ['e1'], now);

        const result = await withLearnerAuthContext(learner, () =>
          ctx.startLearning({ noTopic: true })
        );
        expect(result.action).toBe('resumed');
        if (result.action !== 'resumed') throw new Error('Expected resumed');
        expect(result.session_id).toBe('session-notopic');

        const resumed = await sessionRepo.getSessionById('session-notopic', learner);
        expect(resumed?.status).toBe('active');

        const finalChunks = await sessionRepo.getSessionChunks('session-notopic');
        const finalChunkIds = finalChunks.map(c => c.chunkId).sort();
        // c1 and d1 are still due (never shifted), so both are kept; e1 is never admitted.
        expect(finalChunkIds).toEqual(['c1', 'd1']);
      });

      it('start_learning(no_topic: true) with nothing paused returns nothing_due', async () => {
        const learner = 'learner-notopic-empty';
        const result = await withLearnerAuthContext(learner, () =>
          ctx.startLearning({ noTopic: true })
        );
        expect(result.action).toBe('nothing_due');
      });
    });

    it('auto-pick start_learning({}) resumes a paused session on the auto-picked (most urgent) topic (AC4)', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-auto', ['auto1'], now);
      const learner = 'learner-autopick';

      await sessionRepo.createSession({
        learnerKey: learner,
        id: 'session-auto-paused',
        topicId: 'topic-auto',
        chunkIds: ['auto1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await sessionRepo.updateSession('session-auto-paused', {
        status: 'paused',
        pausedAt: now + 1000,
        updatedAt: now + 1000,
      });

      // topic-auto is the only topic with a due chunk in the DB at this point, so
      // auto-pick unambiguously selects it.
      const result = await withLearnerAuthContext(learner, () => ctx.startLearning({}));

      expect(result.action).toBe('resumed');
      if (result.action !== 'resumed') throw new Error('Expected resumed');
      expect(result.session_id).toBe('session-auto-paused');

      const resumed = await sessionRepo.getSessionById('session-auto-paused', learner);
      expect(resumed?.status).toBe('active');
      expect(resumed?.pausedAt).toBeNull();
    });

    it('resumes the most recently paused session on a topic, leaving the earlier one paused', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['ma1', 'ma2'], now);
      const learner = 'learner-order';

      await sessionRepo.createSession({
        learnerKey: learner,
        id: 'session-older',
        topicId: 'topic-a',
        chunkIds: ['ma1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await sessionRepo.updateSession('session-older', {
        status: 'paused',
        pausedAt: now + 1000,
        updatedAt: now + 1000,
      });

      await sessionRepo.createSession({
        learnerKey: learner,
        id: 'session-newer',
        topicId: 'topic-a',
        chunkIds: ['ma2'],
        mode: 'learning',
        startTime: now + 2000,
        createdAt: now + 2000,
        updatedAt: now + 2000,
      });
      await sessionRepo.updateSession('session-newer', {
        status: 'paused',
        pausedAt: now + 3000,
        updatedAt: now + 3000,
      });

      const result = await withLearnerAuthContext(learner, () =>
        ctx.startLearning({ topicId: 'topic-a' })
      );

      expect(result.action).toBe('resumed');
      if (result.action !== 'resumed') throw new Error('Expected resumed');
      expect(result.session_id).toBe('session-newer');

      const older = await sessionRepo.getSessionById('session-older', learner);
      expect(older?.status).toBe('paused');
      const newer = await sessionRepo.getSessionById('session-newer', learner);
      expect(newer?.status).toBe('active');
    });

    it("never resumes another learner's paused session on the same topic", async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['ia1'], now);
      const learner1 = 'learner-iso-1';
      const learner2 = 'learner-iso-2';

      await sessionRepo.createSession({
        learnerKey: learner2,
        id: 'session-learner2',
        topicId: 'topic-a',
        chunkIds: ['ia1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await sessionRepo.updateSession('session-learner2', {
        status: 'paused',
        pausedAt: now + 1000,
        updatedAt: now + 1000,
      });

      const result = await withLearnerAuthContext(learner1, () =>
        ctx.startLearning({ topicId: 'topic-a' })
      );

      // Learner 1 gets a fresh/created session — never learner 2's paused one.
      expect(result.action).toBe('started');
      if (result.action !== 'started') throw new Error('Expected started');
      expect(result.session_id).not.toBe('session-learner2');

      const learner2Session = await sessionRepo.getSessionById('session-learner2', learner2);
      expect(learner2Session?.status).toBe('paused');
    });

    it('create_session is unaffected — still creates a new session for a topic with only paused sessions, and leaves them paused', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic-a', ['ra1'], now);
      const learner = 'learner-regress';

      await sessionRepo.createSession({
        learnerKey: learner,
        id: 'session-paused-regress',
        topicId: 'topic-a',
        chunkIds: ['ra1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await sessionRepo.updateSession('session-paused-regress', {
        status: 'paused',
        pausedAt: now + 1000,
        updatedAt: now + 1000,
      });

      const result = await withLearnerAuthContext(learner, () =>
        ctx.createSession({ topicId: 'topic-a', mode: 'learning' })
      );

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');
      expect(result.data.sessionId).not.toBe('session-paused-regress');

      const stillPaused = await sessionRepo.getSessionById('session-paused-regress', learner);
      expect(stillPaused?.status).toBe('paused');
    });
  });
});
