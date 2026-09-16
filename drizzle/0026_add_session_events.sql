-- NEU-1016: one row per `teach_next` event, the server-side timestamp series the
-- gap-based sitting active-time computation merges with
-- `session_question_attempts.created_at` (submit_answer's own per-event timestamp).
-- Additive only — no destructive change to any existing table.
CREATE TABLE IF NOT EXISTS "session_events" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL REFERENCES "learning_sessions"("id") ON DELETE CASCADE,
	"created_at" bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_session_events_session_id" ON "session_events" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_session_events_created_at" ON "session_events" ("created_at");
