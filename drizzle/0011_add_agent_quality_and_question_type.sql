ALTER TABLE "session_question_attempts" ADD COLUMN "agent_quality" smallint;
ALTER TABLE "session_question_attempts" ADD COLUMN "question_type" text;
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_agent_quality" CHECK ("agent_quality" BETWEEN 0 AND 5);
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_question_type" CHECK ("question_type" IN ('recall', 'explain_apply', 'analyze_create'));
