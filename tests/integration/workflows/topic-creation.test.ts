import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import type { TopicCreationInput } from '../../../src/orchestration/topic-workflows.js';

describe('topic creation service', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('createTopicWithChunks', () => {
    it('should create topic with multiple chunks successfully', async () => {
      const request: TopicCreationInput = {
        topicTitle: 'Test Topic',
        topicDescription: 'A test topic for learning',
        subject: 'Computer Science',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Introduction to Topic',
            content: 'This is the introduction content',
            difficulty: 3,
            prerequisites: [],
            estimatedDuration: 15,

            tags: ['intro'],
            chunkType: 'new',
          },
          {
            id: crypto.randomUUID(),
            title: 'Advanced Concepts',
            content: 'This is the advanced content',
            difficulty: 7,
            prerequisites: ['Introduction to Topic'],
            estimatedDuration: 30,

            tags: ['advanced'],
            chunkType: 'new',
          },
        ],
      };

      const result = await ctx.createTopicWithChunks(request);

      expect(result.success).toBe(true);
      expect(result.topic).toBeDefined();
      expect(result.topic?.topicTitle).toBe('Test Topic');
      expect(result.topic?.subject).toBe('Computer Science');
      expect(result.topic?.chunks).toHaveLength(2);
      expect(result.topic?.chunks[0].title).toBe('Introduction to Topic');
      expect(result.topic?.chunks[1].title).toBe('Advanced Concepts');
    });

    it('should handle empty chunks array', async () => {
      const request: TopicCreationInput = {
        topicTitle: 'Empty Topic',
        topicDescription: 'A topic with no chunks',
        subject: 'Test',
        chunks: [],
      };

      const result = await ctx.createTopicWithChunks(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('At least one chunk is required');
    });

    it('should validate chunk requirements', async () => {
      const request: TopicCreationInput = {
        topicTitle: 'Invalid Topic',
        topicDescription: 'A topic with invalid chunks',
        subject: 'Test',
        chunks: [
          {
            id: '',
            title: '',
            content: '',
            difficulty: 0,
            prerequisites: [],
            estimatedDuration: 0,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await ctx.createTopicWithChunks(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle database transaction rollback on error', async () => {
      // Create a request with invalid data that will cause a database error
      const request: TopicCreationInput = {
        topicTitle: 'x'.repeat(1000), // Exceeds max length
        topicDescription: 'Test description',
        subject: 'Test',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Valid Chunk',
            content: 'Valid content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 20,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await ctx.createTopicWithChunks(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Verify no data was persisted
      const db = getSql();
      const topics = await db.select().from(learningTopics);
      const chunks = await db.select().from(learningChunks);

      expect(topics).toHaveLength(0);
      expect(chunks).toHaveLength(0);
    });

    it('should apply user preferences correctly', async () => {
      const request: TopicCreationInput = {
        topicTitle: 'Preference Test Topic',
        topicDescription: 'Testing user preferences',
        subject: 'Test',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 4,
            prerequisites: ['Basic knowledge'],
            estimatedDuration: 20,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await ctx.createTopicWithChunks(request);

      expect(result.success).toBe(true);
      expect(result.topic).toBeDefined();
    });
  });

  describe('atomicity and consistency', () => {
    it('should maintain referential integrity', async () => {
      const request: TopicCreationInput = {
        topicTitle: 'Integrity Test',
        topicDescription: 'Testing referential integrity',
        subject: 'Test',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await ctx.createTopicWithChunks(request);

      expect(result.success).toBe(true);

      // Verify foreign key relationships
      const db = getSql();
      const chunks = await db.select().from(learningChunks);
      const topics = await db.select().from(learningTopics);

      expect(topics).toHaveLength(1);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].topicId).toBe(topics[0].id);
    });

    it('should handle concurrent topic creation', async () => {
      const requests = [
        {
          topicTitle: 'Concurrent Topic 1',
          topicDescription: 'First concurrent topic',
          subject: 'Test',
          chunks: [
            {
              id: crypto.randomUUID(),
              title: 'Chunk 1',
              content: 'Content 1',
              difficulty: 3,
              prerequisites: [],
              estimatedDuration: 10,

              tags: [],
              chunkType: 'new' as const,
            },
          ],
        },
        {
          topicTitle: 'Concurrent Topic 2',
          topicDescription: 'Second concurrent topic',
          subject: 'Test',
          chunks: [
            {
              id: crypto.randomUUID(),
              title: 'Chunk 2',
              content: 'Content 2',
              difficulty: 4,
              prerequisites: [],
              estimatedDuration: 15,

              tags: [],
              chunkType: 'new' as const,
            },
          ],
        },
      ];

      const results = await Promise.all(
        requests.map(request => ctx.createTopicWithChunks(request))
      );

      // Both should succeed
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);

      // Verify both topics were created
      const db = getSql();
      const topics = await db.select().from(learningTopics);
      const chunks = await db.select().from(learningChunks);

      expect(topics).toHaveLength(2);
      expect(chunks).toHaveLength(2);
    });
  });

  describe('Topic Update Functions', () => {
    it('should update topic title successfully', async () => {
      // Create a topic first
      const createInput: TopicCreationInput = {
        topicTitle: 'Original Topic',
        subject: 'Test Subject',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      expect(createResult.success).toBe(true);
      expect(createResult.topic).toBeDefined();

      const topicId = createResult.topic!.topicId;

      // Update the topic
      const updateResult = await ctx.updateTopicMetadata(topicId, {
        title: 'Updated Topic Title',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.topic).toBeDefined();
      expect(updateResult.topic?.title).toBe('Updated Topic Title');
      expect(updateResult.topic?.updatedAt).toBeGreaterThan(createResult.topic!.createdAt);
    });

    it('should return error for non-existent topic', async () => {
      const result = await ctx.updateTopicMetadata('non-existent-id', {
        title: 'New Title',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
      expect(result.error?.message).toContain('not found');
    });

    it('should validate title length constraints', async () => {
      // Create a topic first
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Test Subject',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // Test empty title
      const emptyResult = await ctx.updateTopicMetadata(topicId, {
        title: '',
      });

      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error?.type).toBe('validation');
      expect(emptyResult.error?.field).toBe('title');

      // Test overly long title
      const longTitle = 'a'.repeat(201); // Over MAX_TITLE_LENGTH
      const longResult = await ctx.updateTopicMetadata(topicId, {
        title: longTitle,
      });

      expect(longResult.success).toBe(false);
      expect(longResult.error?.type).toBe('validation');
      expect(longResult.error?.field).toBe('title');
    });

    it('should update subject successfully', async () => {
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Math',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      const updateResult = await ctx.updateTopicMetadata(topicId, {
        subject: 'Science',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.topic?.subject).toBe('Science');
    });

    it('should validate subject length constraints', async () => {
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Math',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // Test empty subject
      const emptyResult = await ctx.updateTopicMetadata(topicId, {
        subject: '',
      });

      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error?.type).toBe('validation');
      expect(emptyResult.error?.field).toBe('subject');

      // Test overly long subject
      const longSubject = 'a'.repeat(101); // Over MAX_SUBJECT_LENGTH (100)
      const longResult = await ctx.updateTopicMetadata(topicId, {
        subject: longSubject,
      });

      expect(longResult.success).toBe(false);
      expect(longResult.error?.type).toBe('validation');
      expect(longResult.error?.field).toBe('subject');
    });

    it('should preserve subject when only title is updated', async () => {
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Math',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      const updateResult = await ctx.updateTopicMetadata(topicId, {
        title: 'Updated Title Only',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.topic?.title).toBe('Updated Title Only');
      expect(updateResult.topic?.subject).toBe('Math');
    });

    it('should update topic summary with versioning', async () => {
      // Create a topic first
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Test Subject',
        topicSummary: 'Original summary',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      expect(createResult.success).toBe(true);
      const topicId = createResult.topic!.topicId;

      // Update the summary
      const newSummary =
        'This is an updated summary with more detailed information about the topic.';
      const updateResult = await ctx.updateTopicSummary(topicId, newSummary);

      expect(updateResult.success).toBe(true);
      expect(updateResult.topic).toBeDefined();
      expect(updateResult.topic?.summary).toBe(newSummary);
      expect(updateResult.topic?.summaryVersion).toBe(2); // Should increment from 1
      expect(updateResult.topic?.summaryUpdatedAt).toBeGreaterThanOrEqual(
        createResult.topic!.createdAt
      );
    });

    it('should validate summary length constraints', async () => {
      // Create a topic first
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Test Subject',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // Test empty summary
      const emptyResult = await ctx.updateTopicSummary(topicId, '');

      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error?.type).toBe('validation');
      expect(emptyResult.error?.field).toBe('summary');

      // Test overly long summary
      const longSummary = 'a'.repeat(5001); // Over MAX_SUMMARY_SIZE
      const longResult = await ctx.updateTopicSummary(topicId, longSummary);

      expect(longResult.success).toBe(false);
      expect(longResult.error?.type).toBe('validation');
      expect(longResult.error?.field).toBe('summary');
    });

    it('should return error for summary update on non-existent topic', async () => {
      const result = await ctx.updateTopicSummary('non-existent-id', 'New summary');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
      expect(result.error?.message).toContain('not found');
    });

    it('should handle summary versioning correctly with multiple updates', async () => {
      // Create a topic first
      const createInput: TopicCreationInput = {
        topicTitle: 'Test Topic',
        subject: 'Test Subject',
        topicSummary: 'Original summary',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Test Chunk',
            content: 'Test content',
            difficulty: 5,
            prerequisites: [],
            estimatedDuration: 15,

            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await ctx.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // First update
      const firstUpdate = await ctx.updateTopicSummary(topicId, 'First updated summary');
      expect(firstUpdate.success).toBe(true);
      expect(firstUpdate.topic?.summaryVersion).toBe(2);

      // Second update
      const secondUpdate = await ctx.updateTopicSummary(topicId, 'Second updated summary');
      expect(secondUpdate.success).toBe(true);
      expect(secondUpdate.topic?.summaryVersion).toBe(3);
      expect(secondUpdate.topic?.summary).toBe('Second updated summary');
    });
  });
});
