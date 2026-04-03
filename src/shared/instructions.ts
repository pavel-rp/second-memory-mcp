/**
 * MCP server instructions — sent in the initialize response so agents
 * know how to orchestrate this server's tools without reading prompts first.
 */
export const SERVER_INSTRUCTIONS = `\
Second Memory is a spaced-repetition learning server. Follow these workflows:

TEACHING FLOW (start_learning → submit_answer loop)
1. Call start_learning. If status is "nothing_due"/"error", surface message and stop. If "started"/"resumed", check first_chunk.status: "teach" → present instruction and collect response; "blocked"/"error" → surface and stop.
2. Call submit_answer with prompt_text, chunk_ids, response, pass/fail, feedback, time_spent_ms.
3. On "retry", ask learner to try again and re-call submit_answer with session_question_id from the response.
4. On "recorded", call teach_next to get the next action: "teach" → present instruction, repeat from step 2. "complete" → go to step 5. "blocked"/"error" → stop.
5. On "complete", call complete_session with session_id and optional feedback.

ROLLING SESSION FLOW (manual chunk-by-chunk control)
1. Call create_session with mode: "learning" and no chunk_ids to open an empty session.
2. Call create_session_chunk with the session_id, chunk_id, and status: "in_progress" to add and activate the chunk.
3. Call get_chunk_content with the chunk_id to retrieve the chunk, then teach it.
4. Call submit_answer with prompt_text, chunk_ids, response, pass/fail judgment, feedback, and time_spent_ms. If result says "retry", ask the learner to try again and re-call submit_answer with session_question_id from the response until it returns "recorded". After "recorded", call teach_next to advance: if status is "teach", go to step 3 for that chunk (it is already in_progress — do not call create_session_chunk). If status is "blocked" or "error", surface the message to the learner and stop. Only loop back to step 2 when status is "complete" or no chunk is currently in_progress.
5. Repeat steps 2–4 for each chunk the learner selects.
6. Call complete_session with the session_id from step 1 and optional feedback when the learner is done.

CONTENT CREATION
1. Use the scaffolding prompt to plan a topic (2-7 chunks).
2. Use the chunk_generation prompt to produce chunk content.
3. Call create_topic_with_chunks to persist the topic and all chunks in one operation.

ASSESSMENT FLOW (cross-chunk topic evaluation)
1. Call create_session with mode: "assessment" and chunk_ids listing ALL chunks to evaluate.
2. Call create_session_questions with session_id and questions — each question has chunk_ids (1+) indicating which chunks it evaluates. Questions can span multiple chunks for cross-concept evaluation.
3. Call teach_next — returns the next unanswered question (no teaching instruction, just the question text).
4. Call submit_answer with session_question_id, response, pass/fail, feedback, time_spent_ms. Assessment uses single attempt: pass → quality 5, fail → quality 1. No retry. SR updates fan out to ALL mapped chunks per question.
5. Repeat steps 3-4 until teach_next returns status "complete".
6. Call complete_session with session_id and optional feedback.

ASSESSMENT-FIRST SCAFFOLDING
Before creating a topic: search existing content, then assess the learner — absence from DB does not mean ignorance. Create only for confirmed gaps.

TOOL DISAMBIGUATION
- start_learning vs create_session: start_learning is the one-call convenience. Use create_session only for manual control over chunk_ids or modes.
- session_status: session metrics and completion checks. Returns progress, quality, and a continue/complete/break recommendation.
- submit_answer is the sole path for recording review data. The server derives quality from the learner's response.

OPERATIONAL CONSTRAINTS
- Never fabricate scores — always use submit_answer, which lets the server derive quality.
- Never skip drills; the server decides when a chunk is mastered.
- Do not manually hydrate prompt templates; call prompts through the MCP protocol.
- The interval_days value in review responses is SM-2-derived — always read it from the response, never hardcode.
- The response field in submit_answer must be the learner's exact words — never paraphrase, sanitize, or censor. Use feedback for your assessment.

TEACHING CONTENT INTEGRITY
All content items provided by the server must be presented to the learner before they are referenced in any question.
Your context window is not the learner's knowledge — do not ask about content the learner has not yet seen.
Confirm that each item was explicitly shown to the learner before using it in a question or follow-up.

QUESTION QUALITY
You are responsible for asking high-quality questions using the three-level taxonomy:
- Level 1 (Recall): "What is...?" / "List the steps..." — factual retrieval
- Level 2 (Explain/Apply): "In your own words, why...?" / "Given this scenario..." — understanding and transfer
- Level 3 (Analyze/Create): "What would break if...?" / "Design a solution..." — synthesis and evaluation
Use the quality rubric (0–5) with scaffolding ceilings to assess answers fairly. If you provided hints, cap quality at the ceiling (1 hint → max 3, 2+ hints → max 2). Target quality 3–4 as the healthy range.`;

/**
 * Compressed workflow summary for init_agent_context.
 * Leads with what_to_learn_today flow instead of start_learning.
 */
export const WORKFLOW_SUMMARY =
  'TEACHING: what_to_learn_today \u2192 present ranked options to learner \u2192 create_session with chosen ' +
  "topic's due_chunk_ids \u2192 teach_next \u2192 submit_answer loop \u2192 complete_session. Quick-start " +
  '(skips topic selection): start_learning (auto-picks most urgent). CONTENT: search_learning_content ' +
  '\u2192 create_topic_with_chunks. ASSESSMENT: create_session(assessment) \u2192 create_session_questions ' +
  '\u2192 submit_answer. Always search for existing content before creating. Absence from DB does not ' +
  'mean ignorance \u2014 assess the learner first.';
