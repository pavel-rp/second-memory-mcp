-- NEU-676: revise_grade primitive — preserve original attempt values when an
-- agent overwrites its own prior grade. The "live" `session_question_attempts`
-- row is updated in place so the existing SRS aggregation reads the corrected
-- value transparently; this table captures the original verbatim plus the
-- revision metadata for audit.

CREATE TABLE "session_question_attempt_revisions" (
        "id" text PRIMARY KEY NOT NULL,
        "attempt_id" text NOT NULL REFERENCES "session_question_attempts"("id") ON DELETE CASCADE,
        "original_quality" integer,
        "original_agent_quality" smallint,
        "original_passed" boolean NOT NULL,
        "original_feedback" text NOT NULL,
        "new_quality" integer,
        "new_agent_quality" smallint,
        "new_passed" boolean NOT NULL,
        "new_feedback" text NOT NULL,
        "reason" text NOT NULL,
        "revised_at" bigint NOT NULL,
        CONSTRAINT "chk_revision_reason" CHECK ("reason" IN (
                'agent_misread_prompt',
                'agent_misjudged_correctness',
                'agent_applied_wrong_rubric',
                'learner_provided_clarification',
                'other'
        )),
        CONSTRAINT "chk_revision_original_agent_quality" CHECK ("original_agent_quality" IS NULL OR "original_agent_quality" BETWEEN 0 AND 5),
        CONSTRAINT "chk_revision_new_agent_quality" CHECK ("new_agent_quality" IS NULL OR "new_agent_quality" BETWEEN 0 AND 5)
);

CREATE INDEX "idx_sqar_attempt_id" ON "session_question_attempt_revisions" ("attempt_id");
CREATE INDEX "idx_sqar_revised_at" ON "session_question_attempt_revisions" ("revised_at");
