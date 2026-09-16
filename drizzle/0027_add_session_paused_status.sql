-- NEU-1018: add a `paused` session status and a nullable pause timestamp.
-- Additive: no backfill, no destructive change to any existing row.
ALTER TABLE "learning_sessions" DROP CONSTRAINT IF EXISTS "chk_session_status";
ALTER TABLE "learning_sessions" ADD CONSTRAINT "chk_session_status" CHECK ("learning_sessions"."status" IN ('active', 'completed', 'paused'));
ALTER TABLE "learning_sessions" ADD COLUMN IF NOT EXISTS "paused_at" bigint;
