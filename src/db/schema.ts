import { pgTable, text, integer, bigint, real, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import type { ChunkAttempt } from '../types/session.js';

// Tables
export const learningTopics = pgTable('learning_topics', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  summary: text('summary'), // client-provided topic summary content
  summaryVersion: integer('summary_version').default(1), // versioning for summary content
  summaryUpdatedAt: bigint('summary_updated_at', { mode: 'number' }), // epoch ms, when summary was last updated
  createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(), // epoch ms
});

export const learningChunks = pgTable(
  'learning_chunks',
  {
    id: text('id').primaryKey().notNull(),
    topicId: text('topic_id')
      .notNull()
      .references(() => learningTopics.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    subject: text('subject').notNull(),
    difficulty: integer('difficulty').notNull(),
    nextReviewAt: bigint('next_review_at', { mode: 'number' }).notNull(), // epoch ms
    easeFactor: real('ease_factor').notNull(),
    repetitions: integer('repetitions').notNull(),
    lastReviewedAt: bigint('last_reviewed_at', { mode: 'number' }), // epoch ms, optional
    estimatedDuration: integer('estimated_duration').notNull(), // minutes
    intervalDays: integer('interval_days'), // days until next review (from last SM-2 calculation)
    chunkType: text('chunk_type').notNull(), // CHECK('new','review','remediation') — enforced at DB level
    prerequisitesJson: jsonb('prerequisites_json').$type<string[]>(),
    tagsJson: jsonb('tags_json').$type<string[]>(),
    content: text('content'), // client-provided chunk content
    contentVersion: integer('content_version').default(1), // versioning for content
    contentUpdatedAt: bigint('content_updated_at', { mode: 'number' }), // epoch ms, when content was last updated
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  },
  table => [
    index('idx_learning_chunks_next_review_at').on(table.nextReviewAt),
    index('idx_learning_chunks_prerequisites_json').using('gin', table.prerequisitesJson),
    check('chk_chunk_type', sql`${table.chunkType} IN ('new', 'review', 'remediation')`),
  ]
);

export const learningSessions = pgTable(
  'learning_sessions',
  {
    id: text('id').primaryKey().notNull(),
    topicId: text('topic_id').references(() => learningTopics.id, { onDelete: 'set null' }),
    chunkIds: jsonb('chunk_ids').$type<string[]>(),
    mode: text('mode').notNull(), // CHECK('scaffolding','learning','retrieval','review') — enforced at DB level
    estimatedDuration: integer('estimated_duration'), // minutes
    status: text('status').notNull().default('active'), // CHECK('active','completed') — enforced at DB level
    startTime: bigint('start_time', { mode: 'number' }).notNull(), // epoch ms
    endTime: bigint('end_time', { mode: 'number' }), // epoch ms, set on completion
    feedback: text('feedback'), // optional completion feedback
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(), // epoch ms
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

export const sessionChunks = pgTable(
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
    attemptsJson: jsonb('attempts_json').$type<ChunkAttempt[]>(),
    qualityScoresJson: jsonb('quality_scores_json').$type<number[]>(),
    timeSpentMs: integer('time_spent_ms').notNull().default(0),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(), // epoch ms
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
