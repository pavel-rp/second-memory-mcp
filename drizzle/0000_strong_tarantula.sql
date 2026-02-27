CREATE TABLE "learning_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"difficulty" integer NOT NULL,
	"next_review_at" bigint NOT NULL,
	"ease_factor" real NOT NULL,
	"repetitions" integer NOT NULL,
	"last_reviewed_at" bigint,
	"estimated_duration" integer NOT NULL,
	"interval_days" integer,
	"chunk_type" text NOT NULL,
	"prerequisites_json" jsonb,
	"tags_json" jsonb,
	"content" text,
	"content_version" integer DEFAULT 1,
	"content_updated_at" bigint,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "chk_chunk_type" CHECK ("learning_chunks"."chunk_type" IN ('new', 'review', 'remediation'))
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text,
	"chunk_ids" jsonb,
	"mode" text NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"start_time" bigint NOT NULL,
	"end_time" bigint,
	"feedback" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "chk_session_mode" CHECK ("learning_sessions"."mode" IN ('scaffolding', 'learning', 'retrieval', 'review')),
	CONSTRAINT "chk_session_status" CHECK ("learning_sessions"."status" IN ('active', 'completed'))
);
--> statement-breakpoint
CREATE TABLE "learning_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"summary" text,
	"summary_version" integer DEFAULT 1,
	"summary_updated_at" bigint,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"chunk_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts_json" jsonb,
	"quality_scores_json" jsonb,
	"time_spent_ms" integer DEFAULT 0 NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "chk_session_chunk_status" CHECK ("session_chunks"."status" IN ('pending', 'in_progress', 'completed'))
);
--> statement-breakpoint
ALTER TABLE "learning_chunks" ADD CONSTRAINT "learning_chunks_topic_id_learning_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."learning_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_topic_id_learning_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."learning_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_chunks" ADD CONSTRAINT "session_chunks_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_chunks" ADD CONSTRAINT "session_chunks_chunk_id_learning_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."learning_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_learning_chunks_next_review_at" ON "learning_chunks" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "idx_learning_chunks_prerequisites_json" ON "learning_chunks" USING gin ("prerequisites_json");--> statement-breakpoint
CREATE INDEX "idx_learning_sessions_status" ON "learning_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_learning_sessions_topic_id" ON "learning_sessions" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_learning_sessions_created_at" ON "learning_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_session_chunks_session_id" ON "session_chunks" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_session_chunks_status" ON "session_chunks" USING btree ("status");