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
  batchCreateSessionChunks,
  listSessions,
  validateChunkIds,
  getHistoricalFeedbackForChunks,
  type CreateSessionInput,
  type CreateSessionChunkInput,
  type ChunkValidationResult,
} from '../../src/services/sessions.js';
import { NewLearningSessionRow } from '../../src/db/schema.js';

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
		chunk_type TEXT NOT NULL,
		prerequisites_json TEXT,
		tags_json TEXT,
		content TEXT,
		content_version INTEGER DEFAULT 1,
		content_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS learning_sessions (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT,
		chunk_ids TEXT,
		mode TEXT NOT NULL,
		estimated_duration INTEGER,
		status TEXT NOT NULL DEFAULT 'active',
		start_time INTEGER NOT NULL,
		end_time INTEGER,
		feedback TEXT,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE SET NULL
	);
	CREATE TABLE IF NOT EXISTS session_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		session_id TEXT NOT NULL,
		chunk_id TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending',
		attempts_json TEXT,
		quality_scores_json TEXT,
		time_spent_ms INTEGER NOT NULL DEFAULT 0,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
		FOREIGN KEY(chunk_id) REFERENCES learning_chunks(id) ON DELETE CASCADE
	);
	`);
}

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

(hasBinding ? describe : describe.skip)('sessions service', () => {
  let dbFile: string;

  beforeEach(() => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
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

  it('creates, reads, updates, and deletes a session', async () => {
    const now = Date.now();

    // Create required foreign key references first
    const db = getDb();
    await db
      .prepare(
        `
			INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?)
		`
      )
      .run('t1', 'Test Topic', 'Math', now, now);

    await db
      .prepare(
        `
			INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
      )
      .run('c1', 't1', 'Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

    await db
      .prepare(
        `
			INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
      )
      .run('c2', 't1', 'Chunk 2', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

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
      endTime: now + 1800000, // 30 minutes later
      updatedAt: now + 1,
    });
    expect(updated).toBe(1);

    const completed = await getSessionById('s1');
    expect(completed?.status).toBe('completed');
    expect(completed?.endTime).toBe(now + 1800000);

    const removed = await deleteSession('s1');
    expect(removed).toBe(1);

    const notFound = await getSessionById('s1');
    expect(notFound).toBeNull();
  });

  it('prevents creating second active session', async () => {
    const now = Date.now();

    // Create first session
    await createSession({
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    });

    // Attempt to create second session should throw
    await expect(async () => {
      await createSession({
        id: 's2',
        mode: 'review',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      });
    }).rejects.toThrow('Active session already exists');

    // Verify only one session exists
    const active = await getActiveSession();
    expect(active?.id).toBe('s1');
  });

  it('manages active sessions correctly', async () => {
    const now = Date.now();

    // Create first session
    const session1: CreateSessionInput = {
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    };

    await createSession(session1);

    // Should return the active session
    const active = await getActiveSession();
    expect(active?.id).toBe('s1');

    // Complete the first session
    await completeSession('s1', 'Great session!');

    // Should return null when no active sessions
    const noActive = await getActiveSession();
    expect(noActive).toBeNull();

    // Now create second session (more recent)
    const session2: CreateSessionInput = {
      id: 's2',
      mode: 'review',
      startTime: now + 1000,
      createdAt: now + 1000,
      updatedAt: now + 1000,
    };

    await createSession(session2);

    // Should return the new active session
    const newActive = await getActiveSession();
    expect(newActive?.id).toBe('s2');

    // Complete the second session
    await completeSession('s2');

    // Should return null when no active sessions
    const finalCheck = await getActiveSession();
    expect(finalCheck).toBeNull();
  });

  it('creates and manages session chunks', async () => {
    const now = Date.now();
    const db = getDb();

    // Create a topic and chunks first
    const topicId = `topic-${now}`;
    db.prepare(
      `
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`
    ).run(topicId, 'Test Topic', 'CS', null, null, null, now, now);

    // Create learning chunks that session chunks will reference
    db.prepare(
      `
			INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
    ).run(
      'c1',
      topicId,
      'Test Chunk 1',
      'CS',
      5,
      now + 86400000,
      2.5,
      0,
      null,
      10,
      'new',
      null,
      null,
      null,
      null,
      null,
      now,
      now
    );

    db.prepare(
      `
			INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
    ).run(
      'c2',
      topicId,
      'Test Chunk 2',
      'CS',
      3,
      now + 86400000,
      2.5,
      0,
      null,
      15,
      'new',
      null,
      null,
      null,
      null,
      null,
      now,
      now
    );

    // Create a session first
    const sessionInput: CreateSessionInput = {
      id: 's1',
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    };
    await createSession(sessionInput);

    // Create session chunks
    const chunk1: CreateSessionChunkInput = {
      id: 'sc1',
      sessionId: 's1',
      chunkId: 'c1',
      status: 'pending',
      attemptsJson: JSON.stringify([]),
      qualityScoresJson: JSON.stringify([]),
      timeSpentMs: 0,
      createdAt: now,
      updatedAt: now,
    };

    const chunk2: CreateSessionChunkInput = {
      id: 'sc2',
      sessionId: 's1',
      chunkId: 'c2',
      status: 'in_progress',
      attemptsJson: JSON.stringify([
        {
          timestamp: new Date(now).toISOString(),
          quality: 4,
          time_spent_ms: 5000,
          completed: true,
        },
      ]),
      qualityScoresJson: JSON.stringify([4]),
      timeSpentMs: 5000,
      createdAt: now,
      updatedAt: now,
    };

    await createSessionChunk(chunk1);
    await createSessionChunk(chunk2);

    // Test getting session chunks
    const chunks = await getSessionChunks('s1');
    expect(chunks.length).toBe(2);
    expect(chunks[0].status).toBe('pending');
    expect(chunks[1].status).toBe('in_progress');

    // Test getting individual chunk
    const chunk = await getSessionChunkById('sc1');
    expect(chunk?.chunkId).toBe('c1');
    expect(chunk?.status).toBe('pending');

    // Test updating chunk
    const updated = await updateSessionChunk('sc1', {
      status: 'completed',
      timeSpentMs: 10000,
      updatedAt: now + 1,
    });
    expect(updated).toBe(1);

    const updatedChunk = await getSessionChunkById('sc1');
    expect(updatedChunk?.status).toBe('completed');
    expect(updatedChunk?.timeSpentMs).toBe(10000);

    // Test deleting chunk
    const deleted = await deleteSessionChunk('sc1');
    expect(deleted).toBe(1);

    const remainingChunks = await getSessionChunks('s1');
    expect(remainingChunks.length).toBe(1);
  });

  it('handles error scenarios gracefully', async () => {
    // Test getting non-existent session
    const notFound = await getSessionById('nonexistent');
    expect(notFound).toBeNull();

    // Test updating non-existent session
    const updateResult = await updateSession('nonexistent', {
      status: 'completed',
      updatedAt: Date.now(),
    });
    expect(updateResult).toBe(0);

    // Test completing non-existent session
    const completeResult = await completeSession('nonexistent');
    expect(completeResult).toBe(0);

    // Test deleting non-existent session
    const deleteResult = await deleteSession('nonexistent');
    expect(deleteResult).toBe(0);

    // Test getting chunks for non-existent session
    const chunks = await getSessionChunks('nonexistent');
    expect(chunks.length).toBe(0);

    // Test converting non-existent session
    const sessionInput = await convertSessionToSessionInput('nonexistent');
    expect(sessionInput).toBeNull();
  });

  describe('Enhanced Session Creation with Automatic Chunk Creation', () => {
    beforeEach(async () => {
      await resetDatabase();
      ensureSchema();
    });

    it('should create session with automatic chunk creation when chunkIds provided', async () => {
      const db = getDb();
      const now = Date.now();

      // Create test topic and chunks
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk2', 'topic1', 'Test Chunk 2', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

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

      // Verify session was created
      const session = await getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      // Verify session chunks were created automatically
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

      // Verify session was created
      const session = await getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      // Verify no session chunks were created
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

      // Verify session was created
      const session = await getSessionById('session1');
      expect(session).toBeDefined();
      expect(session?.mode).toBe('learning');

      // Verify no session chunks were created
      const sessionChunks = await getSessionChunks('session1');
      expect(sessionChunks).toHaveLength(0);
    });

    it('should handle mixed valid and invalid chunk IDs', async () => {
      const db = getDb();
      const now = Date.now();

      // Create test topic and one chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

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
    beforeEach(async () => {
      await resetDatabase();
      ensureSchema();
    });

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
      const db = getDb();
      const now = Date.now();

      // Create test topic first
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      // Create test chunks
      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk2', 'topic1', 'Test Chunk 2', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      const result = await validateChunkIds(['chunk1', 'chunk2']);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual(['chunk1', 'chunk2']);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should identify invalid chunk IDs', async () => {
      const db = getDb();
      const now = Date.now();

      // Create test topic first
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      // Create only one test chunk
      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

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
      const db = getDb();
      const now = Date.now();

      // Create test topic first
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      // Create some test chunks
      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk3', 'topic1', 'Test Chunk 3', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

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
      const db = getDb();
      const now = Date.now();

      // Create test topic first
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      // Create one test chunk
      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      const result = await validateChunkIds(['chunk1', 'chunk1', 'chunk1']);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual(['chunk1', 'chunk1', 'chunk1']);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      // Close the database to simulate a database error
      const db = getDb();
      db.close();

      const result = await validateChunkIds(['chunk1']);

      expect(result.isValid).toBe(false);
      expect(result.validChunkIds).toEqual([]);
      expect(result.invalidChunkIds).toEqual(['chunk1']);
      expect(result.errors).toEqual(['Failed to validate chunk IDs due to database error']);
    });

    it('should handle large numbers of chunk IDs efficiently', async () => {
      const db = getDb();
      const now = Date.now();

      // Create test topic first
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      // Create 50 test chunks
      const insertStmt = db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      const chunkIds = [];
      for (let i = 1; i <= 50; i++) {
        const chunkId = `chunk${i}`;
        chunkIds.push(chunkId);
        insertStmt.run(
          chunkId,
          'topic1',
          `Test Chunk ${i}`,
          'Math',
          5,
          now,
          2.5,
          0,
          10,
          'new',
          now,
          now
        );
      }

      const result = await validateChunkIds(chunkIds);

      expect(result.isValid).toBe(true);
      expect(result.validChunkIds).toEqual(chunkIds);
      expect(result.invalidChunkIds).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe('getHistoricalFeedbackForChunks', () => {
    beforeEach(async () => {
      await resetDatabase();
      ensureSchema();
    });

    it('should return empty array for empty chunkIds array', async () => {
      const result = await getHistoricalFeedbackForChunks([]);
      expect(result).toEqual([]);
    });

    it('should return empty array for null chunkIds', async () => {
      const result = await getHistoricalFeedbackForChunks(null as any);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined chunkIds', async () => {
      const result = await getHistoricalFeedbackForChunks(undefined as any);
      expect(result).toEqual([]);
    });

    it('should return feedback from completed session with matching chunks', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a completed session with feedback
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'completed',
        now - 3600000,
        now,
        'Great progress on chunk1!',
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(1);
      expect(result[0].session_id).toBe('session1');
      expect(result[0].session_mode).toBe('learning');
      expect(result[0].feedback).toBe('Great progress on chunk1!');
      expect(result[0].chunk_ids).toEqual(['chunk1']);
    });

    it('should return empty array when session has feedback but no chunk overlap', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunks
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk2', 'topic1', 'Test Chunk 2', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a completed session with feedback for chunk2
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk2']),
        'learning',
        'completed',
        now - 3600000,
        now,
        'Great progress on chunk2!',
        now - 3600000,
        now
      );

      // Query for chunk1 which is not in session1
      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(0);
    });

    it('should return multiple sessions with overlapping chunks and respect limit', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create 3 completed sessions with feedback
      for (let i = 1; i <= 3; i++) {
        db.prepare(
          `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          `session${i}`,
          'topic1',
          JSON.stringify(['chunk1']),
          'review',
          'completed',
          now - (4 - i) * 3600000,
          now - (3 - i) * 3600000,
          `Feedback for session ${i}`,
          now - (4 - i) * 3600000,
          now - (3 - i) * 3600000
        );
      }

      // Query without limit
      const allResults = await getHistoricalFeedbackForChunks(['chunk1']);
      expect(allResults).toHaveLength(3);

      // Query with limit
      const limitedResults = await getHistoricalFeedbackForChunks(['chunk1'], { limit: 2 });
      expect(limitedResults).toHaveLength(2);
      // Should return most recent first (session3 has the latest endTime)
      expect(limitedResults[0].session_id).toBe('session3');
      expect(limitedResults[1].session_id).toBe('session2');
    });

    it('should exclude session via excludeSessionId option', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create 2 completed sessions
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'completed',
        now - 3600000,
        now - 1800000,
        'Feedback 1',
        now - 3600000,
        now - 1800000
      );

      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session2',
        'topic1',
        JSON.stringify(['chunk1']),
        'review',
        'completed',
        now - 1000000,
        now,
        'Feedback 2',
        now - 1000000,
        now
      );

      // Query excluding session2
      const result = await getHistoricalFeedbackForChunks(['chunk1'], {
        excludeSessionId: 'session2',
      });

      expect(result).toHaveLength(1);
      expect(result[0].session_id).toBe('session1');
    });

    it('should skip sessions with empty feedback', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with empty string feedback
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'completed',
        now - 3600000,
        now,
        '',
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(0);
    });

    it('should skip sessions with whitespace-only feedback', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with whitespace-only feedback
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'completed',
        now - 3600000,
        now,
        '   \t\n  ',
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(0);
    });

    it('should skip sessions with null feedback', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with null feedback
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'completed',
        now - 3600000,
        now,
        null,
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(0);
    });

    it('should skip sessions with invalid JSON in chunkIds field', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with invalid JSON in chunkIds
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        'invalid-json{{{',
        'learning',
        'completed',
        now - 3600000,
        now,
        'Feedback for session',
        now - 3600000,
        now
      );

      // Create a valid session to ensure the function continues
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session2',
        'topic1',
        JSON.stringify(['chunk1']),
        'review',
        'completed',
        now - 1800000,
        now - 900000,
        'Valid feedback',
        now - 1800000,
        now - 900000
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      // Should skip the invalid session and return the valid one
      expect(result).toHaveLength(1);
      expect(result[0].session_id).toBe('session2');
    });

    it('should handle database error gracefully and return empty array', async () => {
      const db = getDb();
      db.close();

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toEqual([]);
    });

    it('should fall back to updatedAt when endTime is null', async () => {
      const db = getDb();
      const now = Date.now();
      const updatedAt = now - 600000;

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with null endTime
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'completed',
        now - 3600000,
        null,
        'Feedback with no endTime',
        now - 3600000,
        updatedAt
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(1);
      expect(result[0].completed_at).toBe(new Date(updatedAt).toISOString());
    });

    it('should only return feedback from completed sessions', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create an active session with feedback
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1']),
        'learning',
        'active',
        now - 3600000,
        null,
        'In-progress feedback',
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      expect(result).toHaveLength(0);
    });

    it('should return only overlapping chunks in chunk_ids', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and multiple chunks
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      for (let i = 1; i <= 4; i++) {
        db.prepare(
          `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          `chunk${i}`,
          'topic1',
          `Test Chunk ${i}`,
          'Math',
          5,
          now,
          2.5,
          0,
          10,
          'new',
          now,
          now
        );
      }

      // Create a session with chunk1, chunk2, chunk3
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify(['chunk1', 'chunk2', 'chunk3']),
        'learning',
        'completed',
        now - 3600000,
        now,
        'Feedback for multiple chunks',
        now - 3600000,
        now
      );

      // Query for chunk2 and chunk4
      const result = await getHistoricalFeedbackForChunks(['chunk2', 'chunk4']);

      expect(result).toHaveLength(1);
      // Should only include chunk2 as the overlap
      expect(result[0].chunk_ids).toEqual(['chunk2']);
    });

    it('should handle sessions with null chunkIds field', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with null chunkIds
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        null,
        'learning',
        'completed',
        now - 3600000,
        now,
        'Feedback with no chunks',
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      // Session with null chunkIds should have no overlap
      expect(result).toHaveLength(0);
    });

    it('should handle sessions with empty chunkIds array', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create a session with empty chunkIds array
      db.prepare(
        `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'session1',
        'topic1',
        JSON.stringify([]),
        'learning',
        'completed',
        now - 3600000,
        now,
        'Feedback with empty chunks',
        now - 3600000,
        now
      );

      const result = await getHistoricalFeedbackForChunks(['chunk1']);

      // Session with empty chunkIds array should have no overlap
      expect(result).toHaveLength(0);
    });

    it('should combine limit and excludeSessionId options', async () => {
      const db = getDb();
      const now = Date.now();

      // Create topic and chunk
      db.prepare(
        `INSERT INTO learning_topics (id, title, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run('topic1', 'Test Topic', 'Math', now, now);

      db.prepare(
        `INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run('chunk1', 'topic1', 'Test Chunk 1', 'Math', 5, now, 2.5, 0, 10, 'new', now, now);

      // Create 4 completed sessions
      for (let i = 1; i <= 4; i++) {
        db.prepare(
          `INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, status, start_time, end_time, feedback, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          `session${i}`,
          'topic1',
          JSON.stringify(['chunk1']),
          'review',
          'completed',
          now - (5 - i) * 3600000,
          now - (4 - i) * 3600000,
          `Feedback ${i}`,
          now - (5 - i) * 3600000,
          now - (4 - i) * 3600000
        );
      }

      // Query with limit=2 and exclude session3 (the second most recent)
      const result = await getHistoricalFeedbackForChunks(['chunk1'], {
        limit: 2,
        excludeSessionId: 'session3',
      });

      expect(result).toHaveLength(2);
      // Should have session4 (most recent) and session2 (skipping session3)
      expect(result[0].session_id).toBe('session4');
      expect(result[1].session_id).toBe('session2');
    });
  });
});
