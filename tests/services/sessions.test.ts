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
  type CreateSessionInput,
  type CreateSessionChunkInput,
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

  it('converts session to SessionInput format', async () => {
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

    // Create a session with chunks
    const sessionInput: CreateSessionInput = {
      id: 's1',
      topicId: 't1',
      chunkIds: ['c1'],
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    };
    await createSession(sessionInput);

    const chunk1: CreateSessionChunkInput = {
      id: 'sc1',
      sessionId: 's1',
      chunkId: 'c1',
      status: 'completed',
      attemptsJson: JSON.stringify([
        {
          timestamp: new Date(now).toISOString(),
          quality: 5,
          time_spent_ms: 3000,
          completed: true,
        },
      ]),
      qualityScoresJson: JSON.stringify([5]),
      timeSpentMs: 3000,
      createdAt: now,
      updatedAt: now,
    };

    await createSessionChunk(chunk1);

    // Convert to SessionInput format
    const sessionInputFormat = await convertSessionToSessionInput('s1');
    expect(sessionInputFormat).not.toBeNull();
    expect(sessionInputFormat?.session_id).toBe('s1');
    expect(sessionInputFormat?.mode).toBe('learning');
    expect(sessionInputFormat?.chunks.length).toBe(1);
    expect(sessionInputFormat?.chunks[0].chunk_id).toBe('c1');
    expect(sessionInputFormat?.chunks[0].status).toBe('completed');
    expect(sessionInputFormat?.chunks[0].attempts.length).toBe(1);
    expect(sessionInputFormat?.chunks[0].quality_scores).toEqual([5]);
  });

  it('handles batch operations', async () => {
    const now = Date.now();
    const db = getDb();

    // Create required foreign key references using raw SQL
    db.prepare(
      `
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`
    ).run('t1', 'Test Topic', 'Math', null, null, null, now, now);

    db.prepare(
      `
			INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
    ).run(
      'c1',
      't1',
      'Chunk 1',
      'Math',
      5,
      now,
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
      't1',
      'Chunk 2',
      'Math',
      5,
      now,
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
      'c3',
      't1',
      'Chunk 3',
      'Math',
      5,
      now,
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

    // Create a session
    const sessionInput: CreateSessionInput = {
      id: 's1',
      topicId: 't1',
      chunkIds: ['c1', 'c2'],
      mode: 'learning',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    };
    await createSession(sessionInput);

    // Create multiple chunks in batch
    const chunks: CreateSessionChunkInput[] = [
      {
        id: 'sc1',
        sessionId: 's1',
        chunkId: 'c1',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'sc2',
        sessionId: 's1',
        chunkId: 'c2',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'sc3',
        sessionId: 's1',
        chunkId: 'c3',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await batchCreateSessionChunks(chunks);

    const sessionChunks = await getSessionChunks('s1');
    expect(sessionChunks.length).toBe(3);
    expect(sessionChunks.every(chunk => chunk.status === 'pending')).toBe(true);
  });

  it('lists sessions with filters', async () => {
    const now = Date.now();

    // Create multiple sessions
    const sessions: NewLearningSessionRow[] = [
      {
        id: 's1',
        mode: 'learning',
        status: 'active',
        startTime: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 's2',
        mode: 'review',
        status: 'active',
        startTime: now + 1000,
        createdAt: now + 1000,
        updatedAt: now + 1000,
      },
      {
        id: 's3',
        mode: 'learning',
        status: 'completed',
        startTime: now + 2000,
        createdAt: now + 2000,
        updatedAt: now + 2000,
      },
    ];

    const db = getDb();
    for (const session of sessions) {
      db.prepare(
        `
				INSERT INTO learning_sessions (id, topic_id, chunk_ids, mode, estimated_duration, status, start_time, end_time, feedback, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`
      ).run(
        session.id,
        session.topicId,
        session.chunkIds,
        session.mode,
        session.estimatedDuration,
        session.status,
        session.startTime,
        session.endTime,
        session.feedback,
        session.createdAt,
        session.updatedAt
      );
    }

    // Test listing all sessions
    const allSessions = await listSessions();
    expect(allSessions.length).toBe(3);

    // Test filtering by status
    const activeSessions = await listSessions({ status: 'active' });
    expect(activeSessions.length).toBe(2);
    expect(activeSessions.every(s => s.status === 'active')).toBe(true);

    const completedSessions = await listSessions({ status: 'completed' });
    expect(completedSessions.length).toBe(1);
    expect(completedSessions[0].status).toBe('completed');

    // Test limiting results
    const limitedSessions = await listSessions({ limit: 2 });
    expect(limitedSessions.length).toBe(2);
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

  it('maintains data integrity with foreign key constraints', async () => {
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

    // Create a session
    const sessionInput: CreateSessionInput = {
      id: 's1',
      topicId: 't1',
      chunkIds: ['c1'],
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
      createdAt: now,
      updatedAt: now,
    };

    await createSessionChunk(chunk1);

    // Verify chunk exists
    const chunks = await getSessionChunks('s1');
    expect(chunks.length).toBe(1);

    // Delete session - should cascade delete chunks
    await deleteSession('s1');

    // Verify chunks are deleted
    const chunksAfterDelete = await getSessionChunks('s1');
    expect(chunksAfterDelete.length).toBe(0);
  });
});
