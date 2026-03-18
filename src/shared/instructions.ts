/**
 * MCP server instructions — sent in the initialize response so agents
 * know how to orchestrate this server's tools without reading prompts first.
 */
export const SERVER_INSTRUCTIONS = `\
Second Memory is a spaced-repetition learning server. Follow these workflows:

TEACHING FLOW (start_learning → submit_answer loop)
1. Call start_learning to create a session and get the first chunk's teaching instruction. If status is "nothing_due" or "error", surface the message and stop.
2. Present the instruction to the learner and collect their response.
3. Call submit_answer with the question, response, pass/fail judgment, feedback, and time_spent_ms.
4. If the result says "retry", ask the learner to try again and re-call submit_answer.
5. If "recorded", check next.status: "teach" → present the instruction and repeat from step 3. "blocked" or "error" → surface the message and stop.
6. When next.status is "complete", call complete_session with the session_id from start_learning and optional feedback.

ROLLING SESSION FLOW (manual chunk-by-chunk control)
1. Call create_session with mode: "learning" and no chunk_ids to open an empty session.
2. Call create_session_chunk with the session_id, chunk_id, and status: "in_progress" to add and activate the chunk.
3. Call get_chunk_content with the chunk_id to retrieve the chunk, then teach it.
4. Call submit_answer with the question, response, pass/fail judgment, feedback, and time_spent_ms. If result says "retry", ask the learner to try again and re-call submit_answer until it returns "recorded". After "recorded", check the next field: if next.status is "teach", go to step 3 for that chunk (it is already in_progress — do not call create_session_chunk). If next.status is "blocked" or "error", surface the message to the learner and stop. Only loop back to step 2 when next.status is "complete" or no chunk is currently in_progress.
5. Repeat steps 2–4 for each chunk the learner selects.
6. Call complete_session with the session_id from step 1 and optional feedback when the learner is done.

CONTENT CREATION
1. Use the scaffolding prompt to plan a topic (5-9 chunks).
2. Use the chunk_generation prompt to produce chunk content.
3. Call create_topic_with_chunks to persist the topic and all chunks in one operation.

TOOL DISAMBIGUATION
- start_learning vs create_session: start_learning is the one-call convenience (recommendations + session + first chunk). Use create_session only when you need manual control over chunk_ids or modes.
- session_workflow vs session_progress vs session_completion: session_workflow = what phase next, session_progress = metrics only, session_completion = should-I-end-now check.
- submit_answer vs record_review_result: Use submit_answer during teaching sessions (server derives quality). Use record_review_result only for direct review recording outside a session.

OPERATIONAL CONSTRAINTS
- Never fabricate scores or call record_review_result during a teaching session — use submit_answer.
- Never skip drills; the server decides when a chunk is mastered.
- Do not manually hydrate prompt templates; call prompts through the MCP protocol.
- The interval_days value in review responses is SM-2-derived — always read it from the response, never hardcode.`;
