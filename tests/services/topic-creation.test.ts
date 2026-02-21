import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let hasBinding = true;
try {
  const Database = require('better-sqlite3');
  const testDb = new Database(':memory:');
  testDb.close();
} catch {
  hasBinding = false;
}

// Force tests to run in CI environment only if bindings are actually available
if (process.env.CI && process.env.FORCE_SQLITE_TESTS) {
  // Double-check that bindings actually work
  try {
    const Database = require('better-sqlite3');
    const testDb = new Database(':memory:');
    testDb.close();
    hasBinding = true;
  } catch {
    hasBinding = false;
    console.warn('CI environment detected but SQLite bindings not available');
  }
}

import { getDb, resetDatabase } from '../../src/db/client.js';
import { topicCreationService } from '../../src/services/topic-creation.js';
import { TopicCreationInput, UserPreferences } from '../../src/types/topic-creation.js';

function ensureSchema() {
  const db = getDb();
  db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		summary TEXT,
		summary_version INTEGER,
		summary_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS learning_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		difficulty INTEGER NOT NULL,
		next_review_at INTEGER NOT NULL,
		ease_factor REAL NOT NULL,
		repetitions INTEGER NOT NULL,
		last_reviewed_at INTEGER,
		estimated_duration INTEGER NOT NULL,
		interval_days INTEGER,
		chunk_type TEXT NOT NULL CHECK(chunk_type IN ('new', 'review', 'remediation')),
		prerequisites_json TEXT,
		tags_json TEXT,
		content TEXT,
		content_version INTEGER,
		content_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS friction_metrics (
		id TEXT PRIMARY KEY NOT NULL,
		chunk_id TEXT NOT NULL,
		user_id TEXT,
		failed_attempts INTEGER NOT NULL DEFAULT 0,
		average_time_spent INTEGER NOT NULL DEFAULT 0,
		error_patterns_json TEXT,
		last_struggle_date INTEGER NOT NULL,
		friction_score REAL NOT NULL DEFAULT 0,
		consecutive_failures INTEGER NOT NULL DEFAULT 0,
		total_attempts INTEGER NOT NULL DEFAULT 0,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(chunk_id) REFERENCES learning_chunks(id) ON DELETE CASCADE
	);
	`);
}

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

(hasBinding ? describe : describe.skip)('topic creation service', () => {
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase(); // Reset singleton to pick up new path
    ensureSchema();
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

  describe('topicCreationService.createTopicWithChunks', () => {
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
            order: 1,
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
            order: 2,
            tags: ['advanced'],
            chunkType: 'new',
          },
        ],
      };

      const result = await topicCreationService.createTopicWithChunks(request);

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

      const result = await topicCreationService.createTopicWithChunks(request);

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
            order: 0,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await topicCreationService.createTopicWithChunks(request);

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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await topicCreationService.createTopicWithChunks(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Verify no data was persisted
      const db = getDb();
      const topics = db.prepare('SELECT * FROM learning_topics').all() as any[];
      const chunks = db.prepare('SELECT * FROM learning_chunks').all() as any[];

      expect(topics).toHaveLength(0);
      expect(chunks).toHaveLength(0);
    });

    it('should apply user preferences correctly', async () => {
      const userPreferences: UserPreferences = {
        preferredDifficulty: 6,
        learningStyle: 'visual',
        maxChunkDuration: 25,
        includePrerequisites: true,
      };

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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
        userPreferences,
      };

      const result = await topicCreationService.createTopicWithChunks(request);

      expect(result.success).toBe(true);
      expect(result.topic).toBeDefined();
      // User preferences are applied during chunk generation, not validation
      // This test ensures the service accepts preferences without error
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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const result = await topicCreationService.createTopicWithChunks(request);

      expect(result.success).toBe(true);

      // Verify foreign key relationships
      const db = getDb();
      const chunks = db.prepare('SELECT * FROM learning_chunks').all() as any[];
      const topics = db.prepare('SELECT * FROM learning_topics').all() as any[];

      expect(topics).toHaveLength(1);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].topic_id).toBe(topics[0].id);
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
              order: 1,
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
              order: 1,
              tags: [],
              chunkType: 'new' as const,
            },
          ],
        },
      ];

      const results = await Promise.all(
        requests.map(request => topicCreationService.createTopicWithChunks(request))
      );

      // Both should succeed
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);

      // Verify both topics were created
      const db = getDb();
      const topics = db.prepare('SELECT * FROM learning_topics').all() as any[];
      const chunks = db.prepare('SELECT * FROM learning_chunks').all() as any[];

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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await topicCreationService.createTopicWithChunks(createInput);
      expect(createResult.success).toBe(true);
      expect(createResult.topic).toBeDefined();

      const topicId = createResult.topic!.topicId;

      // Update the topic
      const updateResult = await topicCreationService.updateTopic(topicId, {
        title: 'Updated Topic Title',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.topic).toBeDefined();
      expect(updateResult.topic?.title).toBe('Updated Topic Title');
      expect(updateResult.topic?.updatedAt).toBeGreaterThan(createResult.topic!.createdAt);
    });

    it('should return error for non-existent topic', async () => {
      const result = await topicCreationService.updateTopic('non-existent-id', {
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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await topicCreationService.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // Test empty title
      const emptyResult = await topicCreationService.updateTopic(topicId, {
        title: '',
      });

      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error?.type).toBe('validation');
      expect(emptyResult.error?.field).toBe('title');

      // Test overly long title
      const longTitle = 'a'.repeat(201); // Over MAX_TITLE_LENGTH
      const longResult = await topicCreationService.updateTopic(topicId, {
        title: longTitle,
      });

      expect(longResult.success).toBe(false);
      expect(longResult.error?.type).toBe('validation');
      expect(longResult.error?.field).toBe('title');
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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await topicCreationService.createTopicWithChunks(createInput);
      expect(createResult.success).toBe(true);
      const topicId = createResult.topic!.topicId;

      // Update the summary
      const newSummary =
        'This is an updated summary with more detailed information about the topic.';
      const updateResult = await topicCreationService.updateTopicSummary(topicId, newSummary);

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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await topicCreationService.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // Test empty summary
      const emptyResult = await topicCreationService.updateTopicSummary(topicId, '');

      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error?.type).toBe('validation');
      expect(emptyResult.error?.field).toBe('summary');

      // Test overly long summary
      const longSummary = 'a'.repeat(5001); // Over MAX_SUMMARY_SIZE
      const longResult = await topicCreationService.updateTopicSummary(topicId, longSummary);

      expect(longResult.success).toBe(false);
      expect(longResult.error?.type).toBe('validation');
      expect(longResult.error?.field).toBe('summary');
    });

    it('should return error for summary update on non-existent topic', async () => {
      const result = await topicCreationService.updateTopicSummary(
        'non-existent-id',
        'New summary'
      );

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
            order: 1,
            tags: [],
            chunkType: 'new',
          },
        ],
      };

      const createResult = await topicCreationService.createTopicWithChunks(createInput);
      const topicId = createResult.topic!.topicId;

      // First update
      const firstUpdate = await topicCreationService.updateTopicSummary(
        topicId,
        'First updated summary'
      );
      expect(firstUpdate.success).toBe(true);
      expect(firstUpdate.topic?.summaryVersion).toBe(2);

      // Second update
      const secondUpdate = await topicCreationService.updateTopicSummary(
        topicId,
        'Second updated summary'
      );
      expect(secondUpdate.success).toBe(true);
      expect(secondUpdate.topic?.summaryVersion).toBe(3);
      expect(secondUpdate.topic?.summary).toBe('Second updated summary');
    });
  });
});
