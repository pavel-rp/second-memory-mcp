-- Drop legacy tables that are no longer used.
-- These may not exist in all databases, so DROP IF EXISTS is used.
DROP TABLE IF EXISTS `review_schedule`;--> statement-breakpoint
DROP TABLE IF EXISTS `session_logs`;--> statement-breakpoint
DROP TABLE IF EXISTS `performance_analytics`;--> statement-breakpoint
DROP TABLE IF EXISTS `friction_metrics`;
