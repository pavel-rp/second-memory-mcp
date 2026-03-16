-- Data migration: attempts_json → session_questions + session_question_attempts
-- Migrates historical attemptsJson blobs from session_chunks into the normalized
-- session_questions + session_question_attempts tables added in Phase A (NEU-110).
--
-- Idempotent: skips session_chunks that already have rows in session_questions.
-- Handles legacy JSON with `completed` instead of `passed`.
-- Groups attempts into pairs (max 2 per presentation = 1 session_question).

DO $$
DECLARE
  chunk_row RECORD;
  attempt JSONB;
  attempt_idx INTEGER;
  question_id TEXT;
  pair_index INTEGER;
  attempt_in_pair INTEGER;
  now_ms BIGINT;
  passed_val BOOLEAN;
  quality_val INTEGER;
  prev_question_id TEXT;
BEGIN
  now_ms := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;

  FOR chunk_row IN
    SELECT sc.id, sc.attempts_json
    FROM session_chunks sc
    WHERE sc.attempts_json IS NOT NULL
      AND sc.attempts_json != '[]'::jsonb
      AND NOT EXISTS (
        SELECT 1 FROM session_questions sq WHERE sq.session_chunk_id = sc.id
      )
  LOOP
    attempt_idx := 0;
    prev_question_id := NULL;

    FOR attempt IN SELECT value FROM jsonb_array_elements(chunk_row.attempts_json) AS value
    LOOP
      pair_index := attempt_idx / 2;
      attempt_in_pair := (attempt_idx % 2) + 1; -- 1 or 2

      -- Create question row for the first attempt in each pair
      IF attempt_in_pair = 1 THEN
        question_id := gen_random_uuid()::TEXT;
        INSERT INTO session_questions (id, session_chunk_id, question_index, prompt_text, status, created_at, updated_at)
        VALUES (
          question_id,
          chunk_row.id,
          pair_index + 1,
          COALESCE(attempt->>'question', '[migrated]'),
          'answered',
          now_ms,
          now_ms
        );
        prev_question_id := question_id;
      ELSE
        -- Second attempt in pair reuses the question created above
        question_id := prev_question_id;
      END IF;

      -- Resolve passed with legacy `completed` fallback
      passed_val := COALESCE(
        (attempt->>'passed')::BOOLEAN,
        (attempt->>'completed')::BOOLEAN,
        FALSE
      );

      -- Resolve quality (nullable)
      quality_val := (attempt->>'quality')::INTEGER;

      INSERT INTO session_question_attempts (id, session_question_id, attempt_number, response, passed, feedback, quality, time_spent_ms, created_at)
      VALUES (
        gen_random_uuid()::TEXT,
        question_id,
        attempt_in_pair,
        COALESCE(attempt->>'response', ''),
        passed_val,
        COALESCE(attempt->>'feedback', ''),
        quality_val,
        COALESCE((attempt->>'time_spent_ms')::INTEGER, 0),
        now_ms
      );

      attempt_idx := attempt_idx + 1;
    END LOOP;
  END LOOP;
END $$;
