import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks } from '../../src/db/schema.js';
import {
  createSession,
  getSessionById,
  getActiveSession,
  updateSession,
  completeSession,
  deleteSession,
  createSessionChunk,
  getSessionChunks,
  getSessionChunkById,
  updateSessionChunk,
  deleteSessionChunk,
  convertSessionToSessionInput,
  validateChunkIds,
  getHistoricalFeedbackForChunks,
  type CreateSessionInput,
  type CreateSessionChunkInput,
} from '../../src/services/sessions.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

describe('sessions service', () => {
  beforeAll(setupTestDb);
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

    const sessionInput: CreateSessionInput = {
      id: 's1',
      topicId: 't1',
      chunkIds: ['c1', 'c2'],
      mode: 'learning',
      estimatedDuration: 30,
      startTime: now,
      createdAt: now,
      updatedAt: now,
    };

    await createSession(sessionInput);
    const fetched = await getSessionById('s1');
    expect(fetched?.id).toBe('s1');
    expect(fetched?.mode).toBe('learning');
    expect(fetched?.status).toBe('active');

    const updated = await updateSession('s1', {
      status: 'completed',
      endTime: now + 1800000,
      updatedAt: now + 1,
    });
    expect(updated).toBe(1);

    const completed = await getSessionById('s1');
    expect(completed?.status).toBe('completed');
    expect(Number(completed?.endTime)).toBe(now + 1800000);

    const removed = await deleteSession('s1');
    expect(removed).toBe(1);

    const notFound = await getSessionById('s1');
    expect(notFound).toBeNull();
  });

  it('prevents creating second active session', async () => {
    const now = Date.now();

    await createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    await expect(async () => {
      await createSession({
        id: 's2',
        mode: 'review',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
    }).rejects.toThrow('Active session already exists');

    const active = await getActiveSession();
    expect(active?.id).toBe('s1');
  });

  it('manages active sessions correctly', async () => {
    const now = Date.now();

    await createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    const active = await getActiveSession();
    expect(active?.id).toBe('s1');

    await completeSession('s1', 'Great session!');

    const noActive = await getActiveSession();
    expect(noActive).toBeNull();

    await createSession({
      id: 's2',
      mode: 'review',
      startTime: now + 1000,
      createdAt: now + 1000,
      updatedAt: now + 1000,
    });

    const newActive = await getActiveSession();
    expect(newActive?.id).toBe('s2');

    await completeSession('s2');

    const finalCheck = await getActiveSession();
    expect(finalCheck).toBeNull();
  });

  it('creates and manages session chunks', async () => {
    const now = Date.now();
    await seedTopicAndChunks(`topic-${now}`, ['c1', 'c2'], now);

    await createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    const chunk1: CreateSessionChunkInput = {
      id: 'sc1',
      sessionId: 's1',
      chunkId: 'c1',
      status: 'pending',
      attemptsJson: [],
      qualityScoresJson: [],
      timeSpentMs: 0,
      createdAt: now,
      updatedAt: now,
    };

    const chunk2: CreateSessionChunkInput = {
      id: 'sc2',
      sessionId: 's1',
      chunkId: 'c2',
      status: 'in_progress',
      attemptsJson: [
        {
          timestamp: new Date(now).toISOString(),
          quality: 4,
          time_spent_ms: 5000,
          completed: true,
        },
      ],
      qualityScoresJson: [4],
      timeSpentMs: 5000,
      createdAt: now,
      updatedAt: now,
    };

    await createSessionChunk(chunk1);
    await createSessionChunk(chunk2);

    const chunks = await getSessionChunks('s1');
    expect(chunks.length).toBe(2);
    expect(chunks[0].status).toBe('pending');
    expect(chunks[1].status).toBe('in_progress');

    const chunk = await getSessionChunkById('sc1');
    expect(chunk?.chunkId).toBe('c1');
    expect(chunk?.status).toBe('pending');

    const updated = await updateSessionChunk('sc1', {
      status: 'completed',
      timeSpentMs: 10000,
      updatedAt: now + 1,
    });
    expect(updated).toBe(1);

    const updatedChunk = await getSessionChunkById('sc1');
    expect(updatedChunk?.status).toBe('completed');
    expect(updatedChunk?.timeSpentMs).toBe(10000);

    const deleted = await deleteSessionChunk('sc1');
    expect(deleted).toBe(1);

    const remainingChunks = await getSessionChunks('s1');
    expect(remainingChunks.length).toBe(1);
  });

  it('handles error scenarios gracefully', async () => {
    const notFound = await getSessionById('nonexistent');
    expect(notFound).toBeNull();

    const updateResult = await updateSession('nonexistent', {
      status: 'completed',
      updatedAt: Date.now(),
    });
    expect(updateResult).toBe(0);

    const completeResult = await completeSession('nonexistent');
    expect(completeResult).toBe(0);

    const deleteResult = await deleteSession('nonexistent');
    expect(deleteResult).toBe(0);

    const chunks = await getSessionChunks('nonexistent');
    expect(chunks.length).toBe(0);

    const sessionInput = await convertSessionToSessionInput('nonexistent');
    expect(sessionInput).toBeNull();
  });

  describe('Enhanced Session Creation with Automatic Chunk Creation', () => {
    it('should create session with automatic chunk creation when chunkIds provided', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1', 'chunk2'], now);

      const sessionInput: CreateSessionInput = {
        id: 'session1',
        topicId: 'topic1',
        chunkIds: ['chunk1', 'chunk2'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };

      await createSession(sessionInput);

      const session = await getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      const sessionChunks = await getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(2);
      expect(sessionChunks[0].chunkId).toBe('chunk1');
      expect(sessionChunks[0].status).toBe('pending');
      expect(sessionChunks[1].chunkId).toBe('chunk2');
      expect(sessionChunks[1].status).toBe('pending');
    });

    it('should reject session creation with invalid chunk IDs', async () => {
      const now = Date.now();

      const sessionInput: CreateSessionInput = {
        id: 'session1',
        chunkIds: ['nonexistent1', 'nonexistent2'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };

      await expect(createSession(sessionInput)).rejects.toThrow(
        "Invalid chunk IDs provided: Chunk 'nonexistent1' not found in learning content, Chunk 'nonexistent2' not found in learning content. Please verify the chunk IDs or use list_chunks to see available chunks."
      );
    });

    it('should create session without chunks when chunkIds not provided', async () => {
      const now = Date.now();

      const sessionInput: CreateSessionInput = {
        id: 'session1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };

      await createSession(sessionInput);

      const session = await getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      const sessionChunks = await getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(0);
    });

    it('should create session with empty chunkIds array', async () => {
      const now = Date.now();

      const sessionInput: CreateSessionInput = {
        id: 'session1',
        chunkIds: [],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };

      await createSession(sessionInput);

      const session = await getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      const sessionChunks = await getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(0);
    });

    it('should handle mixed valid and invalid chunk IDs', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1'], now);

      const sessionInput: CreateSessionInput = {
        id: 'session1',
        chunkIds: ['chunk1', 'nonexistent'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      };

      await expect(createSession(sessionInput)).rejects.toThrow(
        "Invalid chunk IDs provided: Chunk 'nonexistent' not found in learning content. Please verify the chunk IDs or use list_chunks to see available chunks."
      );
    });
  });

  describe('validateChunkIds', () => {
    it('should return valid result for empty chunk IDs array', async () => {
      const result = await validateChunkIds([]);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual([]);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should return valid result for null/undefined chunk IDs', async () => {
      const result1 = await validateChunkIds(null as any);
      const result2 = await validateChunkIds(undefined as any);

      expect(result1.isValid).toBe(true);
      expect(result1.validChunkIds).toEqual([]);
      expect(result1.invalidChunkIds).toEqual([]);
      expect(result1.errors).toEqual([]);

      expect(result2.isValid).toBe(true);
      expect(result2.validChunkIds).toEqual([]);
      expect(result2.invalidChunkIds).toEqual([]);
      expect(result2.errors).toEqual([]);
    });

    it('should validate existing chunk IDs successfully', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1', 'chunk2'], now);

      const result = await validateChunkIds(['chunk1', 'chunk2']);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual(['chunk1', 'chunk2']);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should identify invalid chunk IDs', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1'], now);

      const result = await validateChunkIds(['chunk1', 'nonexistent1', 'nonexistent2']);

      expect(result.isValid).toBe(false);
      expect(result.validChunkIds).toEqual(['chunk1']);
      expect(result.invalidChunkIds).toEqual(['nonexistent1', 'nonexistent2']);
      expect(result.errors).toEqual([
        "Chunk 'nonexistent1' not found in learning content",
        "Chunk 'nonexistent2' not found in learning content",
      ]);
    });

    it('should handle mixed valid and invalid chunk IDs', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1', 'chunk3'], now);

      const result = await validateChunkIds(['chunk1', 'nonexistent', 'chunk3']);

      expect(result.isValid).toBe(false);
      expect(result.validChunkIds).toEqual(['chunk1', 'chunk3']);
      expect(result.invalidChunkIds).toEqual(['nonexistent']);
      expect(result.errors).toEqual(["Chunk 'nonexistent' not found in learning content"]);
    });

    it('should handle all invalid chunk IDs', async () => {
      const result = await validateChunkIds(['nonexistent1', 'nonexistent2', 'nonexistent3']);

      expect(result.isValid).toBe(false);
      expect(result.validChunkIds).toEqual([]);
      expect(result.invalidChunkIds).toEqual(['nonexistent1', 'nonexistent2', 'nonexistent3']);
      expect(result.errors).toEqual([
        "Chunk 'nonexistent1' not found in learning content",
        "Chunk 'nonexistent2' not found in learning content",
        "Chunk 'nonexistent3' not found in learning content",
      ]);
    });

    it('should handle duplicate chunk IDs correctly', async () => {
      const now = Date.now();
      await seedTopicAndChunks('topic1', ['chunk1'], now);

      const result = await validateChunkIds(['chunk1', 'chunk1', 'chunk1']);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual(['chunk1', 'chunk1', 'chunk1']);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
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

      const result = await validateChunkIds(chunkIds);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual(chunkIds);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe('TF-2: getHistoricalFeedbackForChunks fallback', () => {
    it('returns feedback when session has null chunkIds but session_chunks exist', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1'], now);

      await createSession({
        id: 's1',
        topicId: 't1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await createSessionChunk({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'c1',
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      await completeSession('s1', 'Found chunk 1 difficult');

      const feedback = await getHistoricalFeedbackForChunks(['c1']);
      expect(feedback.length).toBe(1);
      expect(feedback[0].feedback).toBe('Found chunk 1 difficult');
      expect(feedback[0].chunk_ids).toContain('c1');
    });

    it('returns feedback via fast path when session has populated chunkIds', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1'], now);

      await createSession({
        id: 's1',
        topicId: 't1',
        chunkIds: ['c1'],
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await completeSession('s1', 'Good session');

      const feedback = await getHistoricalFeedbackForChunks(['c1']);
      expect(feedback.length).toBe(1);
      expect(feedback[0].feedback).toBe('Good session');
    });

    it('returns empty when session has null chunkIds and no session_chunks', async () => {
      const now = Date.now();

      await createSession({
        id: 's1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await completeSession('s1', 'Some feedback');

      const feedback = await getHistoricalFeedbackForChunks(['c1']);
      expect(feedback.length).toBe(0);
    });

    it('returns empty when chunks do not overlap with query', async () => {
      const now = Date.now();
      await seedTopicAndChunks('t1', ['c1', 'c2'], now);

      await createSession({
        id: 's1',
        topicId: 't1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });

      await createSessionChunk({
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'c1',
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      await completeSession('s1', 'Feedback about c1');

      const feedback = await getHistoricalFeedbackForChunks(['c2']);
      expect(feedback.length).toBe(0);
    });
  });
});
