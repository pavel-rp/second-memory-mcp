-- Migration: Restructure session_questions from session_chunk FK to session FK + junction table.
-- Also adds 'assessment' to session mode check constraint.

-- 1. Add session_id column (nullable initially) with FK to learning_sessions
ALTER TABLE session_questions ADD COLUMN session_id TEXT REFERENCES learning_sessions(id) ON DELETE CASCADE;

-- 2. Create session_question_chunks junction table
CREATE TABLE session_question_chunks (
  id TEXT PRIMARY KEY NOT NULL,
  session_question_id TEXT NOT NULL REFERENCES session_questions(id) ON DELETE CASCADE,
  chunk_id TEXT NOT NULL REFERENCES learning_chunks(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_session_question_chunks ON session_question_chunks(session_question_id, chunk_id);
CREATE INDEX idx_sqc_session_question_id ON session_question_chunks(session_question_id);
CREATE INDEX idx_sqc_chunk_id ON session_question_chunks(chunk_id);

-- 2b. Guard: delete orphaned session_questions whose session_chunk no longer exists
DELETE FROM session_questions WHERE session_chunk_id NOT IN (SELECT id FROM session_chunks);

-- 3. Backfill session_id from session_chunks via existing session_chunk_id FK
UPDATE session_questions sq
SET session_id = sc.session_id
FROM session_chunks sc
WHERE sq.session_chunk_id = sc.id;

-- 4. Backfill junction table from existing session_chunk_id → session_chunks.chunk_id
INSERT INTO session_question_chunks (id, session_question_id, chunk_id)
SELECT gen_random_uuid()::text, sq.id, sc.chunk_id
FROM session_questions sq
JOIN session_chunks sc ON sq.session_chunk_id = sc.id;

-- 5. Make session_id NOT NULL via NOT VALID check constraint pattern.
--    In PG 12+ the validated constraint makes SET NOT NULL metadata-only.
--    Within a transactional migration the lock benefit is moot, but preserves the pattern.
ALTER TABLE session_questions ADD CONSTRAINT session_id_not_null CHECK (session_id IS NOT NULL) NOT VALID;
ALTER TABLE session_questions VALIDATE CONSTRAINT session_id_not_null;
ALTER TABLE session_questions ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE session_questions DROP CONSTRAINT session_id_not_null;

-- 6. Drop old unique index, secondary index, and session_chunk_id column
DROP INDEX IF EXISTS uq_session_questions_chunk_index;
DROP INDEX IF EXISTS idx_session_questions_session_chunk_id;
ALTER TABLE session_questions DROP COLUMN session_chunk_id;

-- 6b. Renumber question_index to be session-scoped (previously chunk-scoped, may have
--      duplicate indices within a session when multiple chunks each start at 1).
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY session_id ORDER BY question_index, created_at, id
  ) AS new_index
  FROM session_questions
)
UPDATE session_questions
SET question_index = ranked.new_index
FROM ranked
WHERE session_questions.id = ranked.id;

-- 7. Add new index and unique constraint (question_index is now session-scoped)
CREATE INDEX idx_session_questions_session_id ON session_questions(session_id);
CREATE UNIQUE INDEX uq_session_questions_session_index ON session_questions(session_id, question_index);

-- 8. Update session mode check constraint to include 'assessment'
-- Drizzle runs each migration file in a transaction, so the brief window between
-- DROP CONSTRAINT and ADD CONSTRAINT is safe.
ALTER TABLE learning_sessions DROP CONSTRAINT chk_session_mode;
ALTER TABLE learning_sessions ADD CONSTRAINT chk_session_mode CHECK (mode IN ('scaffolding', 'learning', 'retrieval', 'review', 'assessment'));
