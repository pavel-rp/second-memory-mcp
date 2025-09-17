import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Tables
export const learningTopics = sqliteTable("learning_topics", {
	id: text("id").primaryKey().notNull(),
	title: text("title").notNull(),
	subject: text("subject").notNull(),
	createdAt: integer("created_at", { mode: "number" }).notNull(), // epoch ms
	updatedAt: integer("updated_at", { mode: "number" }).notNull(), // epoch ms
});

export const learningChunks = sqliteTable("learning_chunks", {
	id: text("id").primaryKey().notNull(),
	topicId: text("topic_id").notNull().references(() => learningTopics.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	subject: text("subject").notNull(),
	difficulty: integer("difficulty", { mode: "number" }).notNull(),
	nextReviewAt: integer("next_review_at", { mode: "number" }).notNull(), // epoch ms
	easeFactor: real("ease_factor").notNull(),
	repetitions: integer("repetitions", { mode: "number" }).notNull(),
	lastReviewedAt: integer("last_reviewed_at", { mode: "number" }), // epoch ms, optional
	estimatedDuration: integer("estimated_duration", { mode: "number" }).notNull(), // minutes
	chunkType: text("chunk_type").notNull(), // "new" | "review" | "remediation"
	prerequisitesJson: text("prerequisites_json"), // JSON string array
	tagsJson: text("tags_json"), // JSON string array
	createdAt: integer("created_at", { mode: "number" }).notNull(),
	updatedAt: integer("updated_at", { mode: "number" }).notNull(),
});

export const reviewSchedule = sqliteTable("review_schedule", {
	id: text("id").primaryKey().notNull(),
	chunkId: text("chunk_id").notNull().references(() => learningChunks.id, { onDelete: "cascade" }),
	nextReviewAt: integer("next_review_at", { mode: "number" }).notNull(),
	intervalDays: integer("interval_days", { mode: "number" }).notNull(),
	repetitions: integer("repetitions", { mode: "number" }).notNull(),
	easeFactor: real("ease_factor").notNull(),
	createdAt: integer("created_at", { mode: "number" }).notNull(),
	updatedAt: integer("updated_at", { mode: "number" }).notNull(),
});

export const sessionLogs = sqliteTable("session_logs", {
	id: text("id").primaryKey().notNull(),
	date: integer("date", { mode: "number" }).notNull(), // epoch ms (day)
	duration: integer("duration", { mode: "number" }).notNull(), // minutes
	itemsCompleted: integer("items_completed", { mode: "number" }).notNull(),
	averageQuality: real("average_quality").notNull(), // 0-5
	cognitiveLoad: real("cognitive_load").notNull(),
	createdAt: integer("created_at", { mode: "number" }).notNull(),
});

export const performanceAnalytics = sqliteTable("performance_analytics", {
	id: text("id").primaryKey().notNull(),
	date: integer("date", { mode: "number" }).notNull(), // epoch ms (day)
	topic: text("topic"),
	metricsJson: text("metrics_json").notNull(), // JSON blob for KPIs
	createdAt: integer("created_at", { mode: "number" }).notNull(),
});

// Types
export type LearningTopicRow = InferSelectModel<typeof learningTopics>;
export type NewLearningTopicRow = InferInsertModel<typeof learningTopics>;

export type LearningChunkRow = InferSelectModel<typeof learningChunks>;
export type NewLearningChunkRow = InferInsertModel<typeof learningChunks>;

export type ReviewScheduleRow = InferSelectModel<typeof reviewSchedule>;
export type NewReviewScheduleRow = InferInsertModel<typeof reviewSchedule>;

export type SessionLogRow = InferSelectModel<typeof sessionLogs>;
export type NewSessionLogRow = InferInsertModel<typeof sessionLogs>;

export type PerformanceAnalyticsRow = InferSelectModel<typeof performanceAnalytics>;
export type NewPerformanceAnalyticsRow = InferInsertModel<typeof performanceAnalytics>;
