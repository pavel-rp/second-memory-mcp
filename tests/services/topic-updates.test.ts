import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import { getSql } from '../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../src/infrastructure/db/schema.js';
import { eq } from 'drizzle-orm';
import { updateTopicMetadata, updateTopicSummary } from '../../src/services/topic-updates.js';
import { VALIDATION_CONSTANTS } from '../../src/shared/constants/validation.js';

describe('services/topic-updates', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  const now = Date.now();

  async function insertTopic(id: string, title = 'Test Topic', subject = 'Math') {
    const db = getSql();
    await db.insert(learningTopics).values({
      id,
      title,
      subject,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function insertChunk(id: string, topicId: string, subject = 'Math') {
    const db = getSql();
    await db.insert(learningChunks).values({
      id,
      topicId,
      title: 'Chunk',
      subject,
      difficulty: 3,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      estimatedDuration: 10,
      chunkType: 'new',
      createdAt: now,
      updatedAt: now,
    });
  }

  describe('updateTopicMetadata', () => {
    it('updates title only', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', { title: 'New Title' });
      expect(result.success).toBe(true);
      expect(result.topic?.title).toBe('New Title');
      expect(result.topic?.subject).toBe('Math');
    });

    it('updates subject only', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', { subject: 'Physics' });
      expect(result.success).toBe(true);
      expect(result.topic?.subject).toBe('Physics');
    });

    it('updates both title and subject', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', {
        title: 'Updated',
        subject: 'Science',
      });
      expect(result.success).toBe(true);
      expect(result.topic?.title).toBe('Updated');
      expect(result.topic?.subject).toBe('Science');
    });

    it('cascades subject change to child chunks', async () => {
      await insertTopic('t1');
      await insertChunk('c1', 't1', 'Math');
      await insertChunk('c2', 't1', 'Math');

      const result = await updateTopicMetadata('t1', { subject: 'Physics' });
      expect(result.success).toBe(true);

      const db = getSql();
      const chunks = await db.select().from(learningChunks).where(eq(learningChunks.topicId, 't1'));
      expect(chunks.every(c => c.subject === 'Physics')).toBe(true);
    });

    it('rejects empty title', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', { title: '' });
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('title');
    });

    it('rejects title exceeding max length', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', {
        title: 'x'.repeat(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH + 1),
      });
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('rejects empty subject', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', { subject: '' });
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('subject');
    });

    it('rejects subject exceeding max length', async () => {
      await insertTopic('t1');
      const result = await updateTopicMetadata('t1', {
        subject: 'x'.repeat(VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH + 1),
      });
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('returns not_found for non-existent topic', async () => {
      const result = await updateTopicMetadata('nonexistent', { title: 'Foo' });
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('updateTopicSummary', () => {
    it('updates summary and increments version', async () => {
      await insertTopic('t1');
      const result = await updateTopicSummary('t1', 'A great summary');
      expect(result.success).toBe(true);
      expect(result.topic?.summary).toBe('A great summary');
      expect(result.topic?.summaryVersion).toBe(2);
      expect(result.topic?.summaryUpdatedAt).toBeGreaterThan(0);
    });

    it('increments version on each update', async () => {
      await insertTopic('t1');
      await updateTopicSummary('t1', 'Version 2');
      const result = await updateTopicSummary('t1', 'Version 3');
      expect(result.success).toBe(true);
      expect(result.topic?.summaryVersion).toBe(3);
    });

    it('rejects empty summary', async () => {
      await insertTopic('t1');
      const result = await updateTopicSummary('t1', '');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('summary');
    });

    it('rejects summary exceeding max size', async () => {
      await insertTopic('t1');
      const result = await updateTopicSummary(
        't1',
        'x'.repeat(VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE + 1)
      );
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('returns not_found for non-existent topic', async () => {
      const result = await updateTopicSummary('nonexistent', 'summary');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });
});
