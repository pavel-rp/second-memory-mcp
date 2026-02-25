CREATE TABLE `learning_chunks` (
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
	FOREIGN KEY (`topic_id`) REFERENCES `learning_topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_learning_chunks_next_review_at` ON `learning_chunks` (`next_review_at`);--> statement-breakpoint
CREATE TABLE `learning_sessions` (
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
	FOREIGN KEY (`topic_id`) REFERENCES `learning_topics`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_status` ON `learning_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_topic_id` ON `learning_sessions` (`topic_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_created_at` ON `learning_sessions` (`created_at`);--> statement-breakpoint
CREATE TABLE `learning_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subject` text NOT NULL,
	`summary` text,
	`summary_version` integer DEFAULT 1,
	`summary_updated_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session_chunks` (
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
	FOREIGN KEY (`chunk_id`) REFERENCES `learning_chunks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_session_chunks_session_id` ON `session_chunks` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_session_chunks_status` ON `session_chunks` (`status`);