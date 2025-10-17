import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

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

export const learningChunks = sqliteTable('learning_chunks', {
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
  chunkType: text('chunk_type').notNull(), // "new" | "review" | "remediation"
  prerequisitesJson: text('prerequisites_json'), // JSON string array
  tagsJson: text('tags_json'), // JSON string array
  content: text('content'), // client-provided chunk content
  contentVersion: integer('content_version', { mode: 'number' }).default(1), // versioning for content
  contentUpdatedAt: integer('content_updated_at', { mode: 'number' }), // epoch ms, when content was last updated
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

export const reviewSchedule = sqliteTable('review_schedule', {
  id: text('id').primaryKey().notNull(),
  chunkId: text('chunk_id')
    .notNull()
    .references(() => learningChunks.id, { onDelete: 'cascade' }),
  nextReviewAt: integer('next_review_at', { mode: 'number' }).notNull(),
  intervalDays: integer('interval_days', { mode: 'number' }).notNull(),
  repetitions: integer('repetitions', { mode: 'number' }).notNull(),
  easeFactor: real('ease_factor').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

export const learningSessions = sqliteTable('learning_sessions', {
  id: text('id').primaryKey().notNull(),
  topicId: text('topic_id').references(() => learningTopics.id, { onDelete: 'set null' }),
  chunkIds: text('chunk_ids'), // JSON array of chunk IDs
  mode: text('mode').notNull(), // 'scaffolding' | 'learning' | 'retrieval' | 'review'
  estimatedDuration: integer('estimated_duration', { mode: 'number' }), // minutes
  status: text('status').notNull().default('active'), // 'active' | 'completed'
  startTime: integer('start_time', { mode: 'number' }).notNull(), // epoch ms
  endTime: integer('end_time', { mode: 'number' }), // epoch ms, set on completion
  feedback: text('feedback'), // optional completion feedback
  createdAt: integer('created_at', { mode: 'number' }).notNull(), // epoch ms
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(), // epoch ms
});

export const sessionChunks = sqliteTable('session_chunks', {
  id: text('id').primaryKey().notNull(),
  sessionId: text('session_id')
    .notNull()
    .references(() => learningSessions.id, { onDelete: 'cascade' }),
  chunkId: text('chunk_id')
    .notNull()
    .references(() => learningChunks.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed'
  attemptsJson: text('attempts_json'), // JSON array of ChunkAttempt objects
  qualityScoresJson: text('quality_scores_json'), // JSON array of quality scores (0-5)
  timeSpentMs: integer('time_spent_ms', { mode: 'number' }).notNull().default(0),
  createdAt: integer('created_at', { mode: 'number' }).notNull(), // epoch ms
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(), // epoch ms
});

// Legacy tables (to be removed in migration)

// Types
export type LearningTopicRow = InferSelectModel<typeof learningTopics>;
export type NewLearningTopicRow = InferInsertModel<typeof learningTopics>;

export type LearningChunkRow = InferSelectModel<typeof learningChunks>;
export type NewLearningChunkRow = InferInsertModel<typeof learningChunks>;

export type ReviewScheduleRow = InferSelectModel<typeof reviewSchedule>;
export type NewReviewScheduleRow = InferInsertModel<typeof reviewSchedule>;

// New session management types
export type LearningSessionRow = InferSelectModel<typeof learningSessions>;
export type NewLearningSessionRow = InferInsertModel<typeof learningSessions>;

export type SessionChunkRow = InferSelectModel<typeof sessionChunks>;
export type NewSessionChunkRow = InferInsertModel<typeof sessionChunks>;
