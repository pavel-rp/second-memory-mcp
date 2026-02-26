PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_learning_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`title` text NOT NULL,
	`subject` text NOT NULL,
	`difficulty` integer NOT NULL,
	`next_review_at` integer NOT NULL,
	`ease_factor` real NOT NULL,
	`repetitions` integer NOT NULL,
	`last_reviewed_at` integer,
	`estimated_duration` integer NOT NULL,
	`interval_days` integer,
	`chunk_type` text NOT NULL,
	`prerequisites_json` text,
	`tags_json` text,
	`content` text,
	`content_version` integer DEFAULT 1,
	`content_updated_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `learning_topics`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chk_chunk_type" CHECK("__new_learning_chunks"."chunk_type" IN ('new', 'review', 'remediation'))
);
--> statement-breakpoint
INSERT INTO `__new_learning_chunks`("id", "topic_id", "title", "subject", "difficulty", "next_review_at", "ease_factor", "repetitions", "last_reviewed_at", "estimated_duration", "interval_days", "chunk_type", "prerequisites_json", "tags_json", "content", "content_version", "content_updated_at", "created_at", "updated_at") SELECT "id", "topic_id", "title", "subject", "difficulty", "next_review_at", "ease_factor", "repetitions", "last_reviewed_at", "estimated_duration", "interval_days", "chunk_type", "prerequisites_json", "tags_json", "content", "content_version", "content_updated_at", "created_at", "updated_at" FROM `learning_chunks`;--> statement-breakpoint
DROP TABLE `learning_chunks`;--> statement-breakpoint
ALTER TABLE `__new_learning_chunks` RENAME TO `learning_chunks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_learning_chunks_next_review_at` ON `learning_chunks` (`next_review_at`);--> statement-breakpoint
CREATE TABLE `__new_learning_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text,
	`chunk_ids` text,
	`mode` text NOT NULL,
	`estimated_duration` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`feedback` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `learning_topics`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "chk_session_mode" CHECK("__new_learning_sessions"."mode" IN ('scaffolding', 'learning', 'retrieval', 'review')),
	CONSTRAINT "chk_session_status" CHECK("__new_learning_sessions"."status" IN ('active', 'completed'))
);
--> statement-breakpoint
INSERT INTO `__new_learning_sessions`("id", "topic_id", "chunk_ids", "mode", "estimated_duration", "status", "start_time", "end_time", "feedback", "created_at", "updated_at") SELECT "id", "topic_id", "chunk_ids", "mode", "estimated_duration", "status", "start_time", "end_time", "feedback", "created_at", "updated_at" FROM `learning_sessions`;--> statement-breakpoint
DROP TABLE `learning_sessions`;--> statement-breakpoint
ALTER TABLE `__new_learning_sessions` RENAME TO `learning_sessions`;--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_status` ON `learning_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_topic_id` ON `learning_sessions` (`topic_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_created_at` ON `learning_sessions` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_session_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`chunk_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts_json` text,
	`quality_scores_json` text,
	`time_spent_ms` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `learning_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chunk_id`) REFERENCES `learning_chunks`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chk_session_chunk_status" CHECK("__new_session_chunks"."status" IN ('pending', 'in_progress', 'completed'))
);
--> statement-breakpoint
INSERT INTO `__new_session_chunks`("id", "session_id", "chunk_id", "status", "attempts_json", "quality_scores_json", "time_spent_ms", "created_at", "updated_at") SELECT "id", "session_id", "chunk_id", "status", "attempts_json", "quality_scores_json", "time_spent_ms", "created_at", "updated_at" FROM `session_chunks`;--> statement-breakpoint
DROP TABLE `session_chunks`;--> statement-breakpoint
ALTER TABLE `__new_session_chunks` RENAME TO `session_chunks`;--> statement-breakpoint
CREATE INDEX `idx_session_chunks_session_id` ON `session_chunks` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_session_chunks_status` ON `session_chunks` (`status`);