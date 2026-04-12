ALTER TABLE session_chunks ADD COLUMN teaching_approach TEXT;
ALTER TABLE session_chunks ADD CONSTRAINT chk_teaching_approach CHECK (teaching_approach IN ('recall', 'cued_recall', 'reteach', 'scaffold'));
