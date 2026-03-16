-- Phase B: Drop legacy attempts_json and quality_scores_json columns
-- All reads/writes now use normalized session_questions + session_question_attempts tables.
ALTER TABLE session_chunks DROP COLUMN IF EXISTS attempts_json;
ALTER TABLE session_chunks DROP COLUMN IF EXISTS quality_scores_json;
