CREATE TABLE "session_question_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"session_question_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"response" text NOT NULL,
	"passed" boolean NOT NULL,
	"feedback" text NOT NULL,
	"quality" integer,
	"time_spent_ms" integer NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_chunk_id" text NOT NULL,
	"question_index" integer NOT NULL,
	"prompt_text" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "chk_session_question_status" CHECK ("session_questions"."status" IN ('pending', 'answered', 'skipped'))
);
--> statement-breakpoint
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "session_question_attempts_session_question_id_session_questions_id_fk" FOREIGN KEY ("session_question_id") REFERENCES "public"."session_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_session_chunk_id_session_chunks_id_fk" FOREIGN KEY ("session_chunk_id") REFERENCES "public"."session_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_session_question_attempts_session_question_id" ON "session_question_attempts" USING btree ("session_question_id");--> statement-breakpoint
CREATE INDEX "idx_session_questions_session_chunk_id" ON "session_questions" USING btree ("session_chunk_id");