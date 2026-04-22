import {
  pgTable,
  text,
  integer,
  smallint,
  bigint,
  real,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  check,
  vector,
} from 'drizzle-orm/pg-core';
import { sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import type { ValidatorReport } from '../../domain/types/validator-report.js';
// Tables
export const learningTopics = pgTable(
  'learning_topics',
  {
    id: text('id').primaryKey().notNull(),
    title: text('title').notNull(),
    subject: text('subject').notNull(),
    summary: text('summary'), // client-provided topic summary content
    summaryVersion: integer('summary_version').default(1), // versioning for summary content
    summaryUpdatedAt: bigint('summary_updated_at', { mode: 'number' }), // epoch ms, when summary was last updated
    summaryEmbedding: vector('summary_embedding', { dimensions: 1536 }), // pgvector: summary text embedding
    dependencyGraphType: text('dependency_graph_type').$type<
      'linear_chain' | 'convergent' | 'divergent' | 'single_root'
    >(), // CHECK — enforced at DB level
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(), // epoch ms
  },
  table => [
    index('idx_learning_topics_summary_embedding').using(
      'hnsw',
      table.summaryEmbedding.op('vector_cosine_ops')
    ),
    check(
      'chk_dependency_graph_type',
      sql`${table.dependencyGraphType} IN ('linear_chain', 'convergent', 'divergent', 'single_root')`
    ),
  ]
);

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
    contentEmbedding: vector('content_embedding', { dimensions: 1536 }), // pgvector: content text embedding
    contentStatus: text('content_status').notNull().default('final').$type<'draft' | 'final'>(), // CHECK('draft','final') — enforced at DB level
    condensedSummary: text('condensed_summary'), // short distillation of key takeaway (2-4 sentences)
    knowledgeType: text('knowledge_type').$type<'fact' | 'concept' | 'procedure' | 'principle'>(), // CHECK — enforced at DB level
    validatorReport: jsonb('validator_report').$type<ValidatorReport>(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  },
  table => [
    index('idx_learning_chunks_next_review_at').on(table.nextReviewAt),
    index('idx_learning_chunks_prerequisites_json').using('gin', table.prerequisitesJson),
    index('idx_learning_chunks_content_embedding').using(
      'hnsw',
      table.contentEmbedding.op('vector_cosine_ops')
    ),
    check('chk_chunk_type', sql`${table.chunkType} IN ('new', 'review', 'remediation')`),
    check('chk_content_status', sql`${table.contentStatus} IN ('draft', 'final')`),
    check(
      'chk_knowledge_type',
      sql`${table.knowledgeType} IN ('fact', 'concept', 'procedure', 'principle')`
    ),
  ]
);

export const learningSessions = pgTable(
  'learning_sessions',
  {
    id: text('id').primaryKey().notNull(),
    topicId: text('topic_id').references(() => learningTopics.id, { onDelete: 'set null' }),
    chunkIds: jsonb('chunk_ids').$type<string[]>(),
    mode: text('mode').notNull(), // CHECK('scaffolding','learning','retrieval','review','assessment') — enforced at DB level
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
      sql`${table.mode} IN ('scaffolding', 'learning', 'retrieval', 'review', 'assessment')`
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
    teachingApproach: text('teaching_approach'),
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
    check(
      'chk_teaching_approach',
      sql`${table.teachingApproach} IN ('recall', 'cued_recall', 'reteach', 'scaffold')`
    ),
  ]
);

export const sessionQuestions = pgTable(
  'session_questions',
  {
    id: text('id').primaryKey().notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => learningSessions.id, { onDelete: 'cascade' }),
    questionIndex: integer('question_index').notNull(), // 1-based position (session-scoped)
    promptText: text('prompt_text').notNull(), // the drill question
    status: text('status').notNull().default('pending'), // CHECK('pending','answered','skipped')
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(), // epoch ms
  },
  table => [
    index('idx_session_questions_session_id').on(table.sessionId),
    uniqueIndex('uq_session_questions_session_index').on(table.sessionId, table.questionIndex),
    check(
      'chk_session_question_status',
      sql`${table.status} IN ('pending', 'answered', 'skipped')`
    ),
  ]
);

export const sessionQuestionChunks = pgTable(
  'session_question_chunks',
  {
    id: text('id').primaryKey().notNull(),
    sessionQuestionId: text('session_question_id')
      .notNull()
      .references(() => sessionQuestions.id, { onDelete: 'cascade' }),
    chunkId: text('chunk_id')
      .notNull()
      .references(() => learningChunks.id, { onDelete: 'cascade' }),
  },
  table => [
    uniqueIndex('uq_session_question_chunks').on(table.sessionQuestionId, table.chunkId),
    index('idx_sqc_session_question_id').on(table.sessionQuestionId),
    index('idx_sqc_chunk_id').on(table.chunkId),
  ]
);

export const sessionQuestionAttempts = pgTable(
  'session_question_attempts',
  {
    id: text('id').primaryKey().notNull(),
    sessionQuestionId: text('session_question_id')
      .notNull()
      .references(() => sessionQuestions.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull(), // 1 or 2
    response: text('response').notNull(),
    passed: boolean('passed').notNull(),
    feedback: text('feedback').notNull(),
    quality: integer('quality'), // nullable — null for historical data; teaching: agent-provided, assessment: server-derived (pass=5, fail=1)
    agentQuality: smallint('agent_quality'), // agent-provided quality 0–5 (nullable for historical data)
    questionType: text('question_type'), // 'recall' | 'explain_apply' | 'analyze_create' (nullable for historical data)
    timeSpentMs: integer('time_spent_ms').notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
  },
  table => [
    index('idx_session_question_attempts_session_question_id').on(table.sessionQuestionId),
    index('idx_sqa_question_created_at').on(table.sessionQuestionId, table.createdAt.desc()),
    uniqueIndex('uq_session_question_attempts_question_number').on(
      table.sessionQuestionId,
      table.attemptNumber
    ),
    check('chk_attempt_number', sql`${table.attemptNumber} IN (1, 2)`),
    check('chk_agent_quality', sql`${table.agentQuality} BETWEEN 0 AND 5`),
    check(
      'chk_question_type',
      sql`${table.questionType} IN ('recall', 'explain_apply', 'analyze_create')`
    ),
  ]
);

// Notes are immutable: deleted and re-added, never updated in place — no updatedAt column.
export const notes = pgTable(
  'notes',
  {
    id: text('id').primaryKey().notNull(),
    targetType: text('target_type').notNull(), // 'chunk' | 'topic' | 'session'
    targetId: text('target_id').notNull(),
    noteType: text('note_type').notNull(), // 'insight' | 'confusion' | 'connection' | 'deeper_exploration'
    content: text('content').notNull(),
    author: text('author').notNull(), // 'agent' | 'user'
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
  },
  /* v8 ignore next 10 -- Drizzle index/check definitions; executed internally, not reachable from app code */
  table => [
    index('idx_notes_target').on(table.targetType, table.targetId),
    index('idx_notes_created_at').on(table.createdAt),
    check('chk_note_target_type', sql`${table.targetType} IN ('chunk', 'topic', 'session')`),
    check(
      'chk_note_type',
      sql`${table.noteType} IN ('insight', 'confusion', 'connection', 'deeper_exploration')`
    ),
    check('chk_note_author', sql`${table.author} IN ('agent', 'user')`),
  ]
);

export const contextTokens = pgTable(
  'context_tokens',
  {
    id: text('id').primaryKey().notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(), // epoch ms
    expiresAt: bigint('expires_at', { mode: 'number' }).notNull(), // epoch ms
  },
  /* v8 ignore next 3 -- Drizzle index definitions; executed internally, not reachable from app code */
  table => [index('idx_context_tokens_expires_at').on(table.expiresAt)]
);

// Types
export type ContextTokenRow = InferSelectModel<typeof contextTokens>;
export type NewContextTokenRow = InferInsertModel<typeof contextTokens>;

export type NoteRow = InferSelectModel<typeof notes>;
export type NewNoteRow = InferInsertModel<typeof notes>;

export type NewLearningTopicRow = InferInsertModel<typeof learningTopics>;

export type LearningChunkRow = InferSelectModel<typeof learningChunks>;
export type NewLearningChunkRow = InferInsertModel<typeof learningChunks>;

export type NewLearningSessionRow = InferInsertModel<typeof learningSessions>;

export type NewSessionChunkRow = InferInsertModel<typeof sessionChunks>;

export type NewSessionQuestionRow = InferInsertModel<typeof sessionQuestions>;

export type NewSessionQuestionChunkRow = InferInsertModel<typeof sessionQuestionChunks>;

export type NewSessionQuestionAttemptRow = InferInsertModel<typeof sessionQuestionAttempts>;
