import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { getSql } from '../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
} from '../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

describe('db/schema', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  const now = Date.now();

  describe('learningTopics', () => {
    it('inserts and retrieves a topic', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-1',
        title: 'Algebra',
        subject: 'Math',
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db.select().from(learningTopics).where(eq(learningTopics.id, 'topic-1'));
      expect(row.title).toBe('Algebra');
      expect(row.subject).toBe('Math');
    });

    it('applies default summaryVersion of 1', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-def',
        title: 'Defaults',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, 'topic-def'));
      expect(row.summaryVersion).toBe(1);
    });

    it('allows nullable summary fields', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-null',
        title: 'Nullable',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db
        .select()
        .from(learningTopics)
        .where(eq(learningTopics.id, 'topic-null'));
      expect(row.summary).toBeNull();
      expect(row.summaryUpdatedAt).toBeNull();
    });
  });

  describe('learningChunks', () => {
    it('inserts a chunk with foreign key to topic', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-fk',
        title: 'FK Test',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-1',
        topicId: 'topic-fk',
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
      const [row] = await db.select().from(learningChunks).where(eq(learningChunks.id, 'chunk-1'));
      expect(row.topicId).toBe('topic-fk');
      expect(row.difficulty).toBe(3);
      expect(row.chunkType).toBe('new');
    });

    it('cascades delete from topic to chunks', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-cascade',
        title: 'Cascade',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-cascade',
        topicId: 'topic-cascade',
        title: 'Will be deleted',
        subject: 'Test',
        difficulty: 1,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 5,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });
      await db.delete(learningTopics).where(eq(learningTopics.id, 'topic-cascade'));
      const chunks = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.topicId, 'topic-cascade'));
      expect(chunks.length).toBe(0);
    });

    it('stores JSONB prerequisites and tags', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-json',
        title: 'JSON',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-json',
        topicId: 'topic-json',
        title: 'JSON Chunk',
        subject: 'Test',
        difficulty: 2,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisitesJson: ['prereq-1', 'prereq-2'],
        tagsJson: ['tag-a', 'tag-b'],
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, 'chunk-json'));
      expect(row.prerequisitesJson).toEqual(['prereq-1', 'prereq-2']);
      expect(row.tagsJson).toEqual(['tag-a', 'tag-b']);
    });
  });

  describe('learningSessions', () => {
    it('inserts a session with default status', async () => {
      const db = getSql();
      await db.insert(learningSessions).values({
        id: 'session-1',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db
        .select()
        .from(learningSessions)
        .where(eq(learningSessions.id, 'session-1'));
      expect(row.status).toBe('active');
    });

    it('allows nullable topicId', async () => {
      const db = getSql();
      await db.insert(learningSessions).values({
        id: 'session-no-topic',
        mode: 'review',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db
        .select()
        .from(learningSessions)
        .where(eq(learningSessions.id, 'session-no-topic'));
      expect(row.topicId).toBeNull();
    });
  });

  describe('sessionChunks', () => {
    it('inserts session chunk with cascade from session and chunk', async () => {
      const db = getSql();
      // Setup parent records
      await db.insert(learningTopics).values({
        id: 'topic-sc',
        title: 'SC',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-sc',
        topicId: 'topic-sc',
        title: 'SC Chunk',
        subject: 'Test',
        difficulty: 1,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 5,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningSessions).values({
        id: 'session-sc',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(sessionChunks).values({
        id: 'sc-1',
        sessionId: 'session-sc',
        chunkId: 'chunk-sc',
        createdAt: now,
        updatedAt: now,
      });
      const [row] = await db.select().from(sessionChunks).where(eq(sessionChunks.id, 'sc-1'));
      expect(row.status).toBe('pending');
      expect(row.timeSpentMs).toBe(0);
    });

    it('cascades delete from session to session chunks', async () => {
      const db = getSql();
      await db.insert(learningTopics).values({
        id: 'topic-sc2',
        title: 'SC2',
        subject: 'Test',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningChunks).values({
        id: 'chunk-sc2',
        topicId: 'topic-sc2',
        title: 'SC2 Chunk',
        subject: 'Test',
        difficulty: 1,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 5,
        chunkType: 'new',
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(learningSessions).values({
        id: 'session-sc2',
        mode: 'learning',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(sessionChunks).values({
        id: 'sc-2',
        sessionId: 'session-sc2',
        chunkId: 'chunk-sc2',
        createdAt: now,
        updatedAt: now,
      });
      await db.delete(learningSessions).where(eq(learningSessions.id, 'session-sc2'));
      const rows = await db
        .select()
        .from(sessionChunks)
        .where(eq(sessionChunks.sessionId, 'session-sc2'));
      expect(rows.length).toBe(0);
    });
  });
});
