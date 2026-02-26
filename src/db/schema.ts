import { sqliteTable, text, integer, real, index, check } from 'drizzle-orm/sqlite-core';
import { sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

// Tables
export const learningTopics = sqliteTable('learning_topics', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  summary: text('summary'), // client-provided topic summary content
  summaryVersion: integer('summary_version', { mode: 'number' }).default(1), // versioning for summary content
  summaryUpdatedAt: integer('summary_updated_at', { mode: 'number' }), // epoch ms, when summary was last updated
  createdAt: integer('created_at', { mode: 'number' }).notNull(), // epoch ms
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(), // epoch ms
});

export const learningChunks = sqliteTable(
  'learning_chunks',
  {
    id: text('id').primaryKey().notNull(),
    topicId: text('topic_id')
      .notNull()
      .references(() => learningTopics.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    subject: text('subject').notNull(),
    difficulty: integer('difficulty', { mode: 'number' }).notNull(),
    nextReviewAt: integer('next_review_at', { mode: 'number' }).notNull(), // epoch ms
    easeFactor: real('ease_factor').notNull(),
    repetitions: integer('repetitions', { mode: 'number' }).notNull(),
    lastReviewedAt: integer('last_reviewed_at', { mode: 'number' }), // epoch ms, optional
    estimatedDuration: integer('estimated_duration', { mode: 'number' }).notNull(), // minutes
    intervalDays: integer('interval_days', { mode: 'number' }), // days until next review (from last SM-2 calculation)
    chunkType: text('chunk_type').notNull(), // CHECK('new','review','remediation') — enforced at DB level
    prerequisitesJson: text('prerequisites_json'), // JSON string array — see encodeJsonArray/decodeJsonArray in db/operations.ts
    tagsJson: text('tags_json'), // JSON string array — see encodeJsonArray/decodeJsonArray in db/operations.ts
    content: text('content'), // client-provided chunk content
    contentVersion: integer('content_version', { mode: 'number' }).default(1), // versioning for content
    contentUpdatedAt: integer('content_updated_at', { mode: 'number' }), // epoch ms, when content was last updated
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  table => [
    index('idx_learning_chunks_next_review_at').on(table.nextReviewAt),
    check('chk_chunk_type', sql`${table.chunkType} IN ('new', 'review', 'remediation')`),
  ]
);

export const learningSessions = sqliteTable(
  'learning_sessions',
  {
    id: text('id').primaryKey().notNull(),
    topicId: text('topic_id').references(() => learningTopics.id, { onDelete: 'set null' }),
    chunkIds: text('chunk_ids'), // JSON array of chunk IDs — see encodeJsonArray/decodeJsonArray in db/operations.ts
    mode: text('mode').notNull(), // CHECK('scaffolding','learning','retrieval','review') — enforced at DB level
    estimatedDuration: integer('estimated_duration', { mode: 'number' }), // minutes
    status: text('status').notNull().default('active'), // CHECK('active','completed') — enforced at DB level
    startTime: integer('start_time', { mode: 'number' }).notNull(), // epoch ms
    endTime: integer('end_time', { mode: 'number' }), // epoch ms, set on completion
    feedback: text('feedback'), // optional completion feedback
    createdAt: integer('created_at', { mode: 'number' }).notNull(), // epoch ms
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(), // epoch ms
  },
  table => [
    index('idx_learning_sessions_status').on(table.status),
    index('idx_learning_sessions_topic_id').on(table.topicId),
    index('idx_learning_sessions_created_at').on(table.createdAt),
    check(
      'chk_session_mode',
      sql`${table.mode} IN ('scaffolding', 'learning', 'retrieval', 'review')`
    ),
    check('chk_session_status', sql`${table.status} IN ('active', 'completed')`),
  ]
);

export const sessionChunks = sqliteTable(
  'session_chunks',
  {
    id: text('id').primaryKey().notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => learningSessions.id, { onDelete: 'cascade' }),
    chunkId: text('chunk_id')
      .notNull()
      .references(() => learningChunks.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'), // CHECK('pending','in_progress','completed') — enforced at DB level
    attemptsJson: text('attempts_json'), // JSON array of ChunkAttempt objects — see encodeJsonArray/decodeJsonArray in db/operations.ts
    qualityScoresJson: text('quality_scores_json'), // JSON array of quality scores (0-5) — see encodeJsonArray/decodeJsonArray in db/operations.ts
    timeSpentMs: integer('time_spent_ms', { mode: 'number' }).notNull().default(0),
    createdAt: integer('created_at', { mode: 'number' }).notNull(), // epoch ms
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(), // epoch ms
  },
  table => [
    index('idx_session_chunks_session_id').on(table.sessionId),
    index('idx_session_chunks_status').on(table.status),
    check(
      'chk_session_chunk_status',
      sql`${table.status} IN ('pending', 'in_progress', 'completed')`
    ),
  ]
);

// Types
export type LearningTopicRow = InferSelectModel<typeof learningTopics>;
export type NewLearningTopicRow = InferInsertModel<typeof learningTopics>;

export type LearningChunkRow = InferSelectModel<typeof learningChunks>;
export type NewLearningChunkRow = InferInsertModel<typeof learningChunks>;

// New session management types
export type LearningSessionRow = InferSelectModel<typeof learningSessions>;
export type NewLearningSessionRow = InferInsertModel<typeof learningSessions>;

export type SessionChunkRow = InferSelectModel<typeof sessionChunks>;
export type NewSessionChunkRow = InferInsertModel<typeof sessionChunks>;
