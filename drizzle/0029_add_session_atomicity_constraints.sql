-- NEU-1042: DB-level backstop for the CAS-guarded pause/resume/complete transitions.
-- At most one 'active' learning_sessions row per learner_key, and no duplicate
-- (session_id, chunk_id) rows in session_chunks. Follows the DO $$ ... $$
-- cleanup-then-constrain shape of 0027/0028.

-- Cleanup 1: for each learner_key with more than one 'active' row, keep the most
-- recently created row active and pause the rest (status='paused', paused_at =
-- migration time). Ties on created_at are broken by the highest id so the choice
-- is deterministic.
DO $$
DECLARE
  migration_time bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
BEGIN
  UPDATE "learning_sessions" ls
  SET "status" = 'paused', "paused_at" = migration_time
  WHERE ls."status" = 'active'
    AND ls."id" NOT IN (
      SELECT DISTINCT ON (learner_key) id
      FROM "learning_sessions"
      WHERE status = 'active'
      ORDER BY learner_key, created_at DESC, id DESC
    );
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_learning_sessions_active_learner_key" ON "learning_sessions" ("learner_key") WHERE "status" = 'active';
--> statement-breakpoint
-- Cleanup 2: for each (session_id, chunk_id) pair with duplicates, keep the row with
-- the most-advanced status (completed > in_progress > pending), tie-broken by
-- earliest created_at then lowest id; delete the rest.
DO $$
BEGIN
  DELETE FROM "session_chunks" sc
  WHERE sc."id" NOT IN (
    SELECT DISTINCT ON (session_id, chunk_id) id
    FROM "session_chunks"
    ORDER BY
      session_id,
      chunk_id,
      CASE status
        WHEN 'completed' THEN 3
        WHEN 'in_progress' THEN 2
        WHEN 'pending' THEN 1
        ELSE 0
      END DESC,
      created_at ASC,
      id ASC
  );
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_session_chunks_session_chunk" ON "session_chunks" ("session_id", "chunk_id");
