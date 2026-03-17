/**
 * MCP server instructions — sent in the initialize response so agents
 * know how to orchestrate this server's tools without reading prompts first.
 */
export const SERVER_INSTRUCTIONS = `\
Second Memory is a spaced-repetition learning server. Follow these workflows:

TEACHING FLOW
1. Call start_learning to get the next chunk and session context.
2. Present the chunk content to the learner, then call submit_answer with their response.
3. The server scores the answer. If the result says "retry", ask the learner to try again and resubmit. If "recorded", move on.
4. Call start_learning again for the next chunk. Repeat until the session is complete.

ROLLING SESSION FLOW
1. Call create_session with mode: "learning" and no chunk_ids to open an empty session.
2. Call create_session_chunk with the session_id, chunk_id, and status: "in_progress" to add and activate the chunk.
3. Call get_chunk_content with the chunk_id to retrieve the chunk, then teach it.
4. Call submit_answer with the learner's response. If result says "retry", ask the learner to try again and re-call submit_answer until it returns "recorded". After "recorded", check the next field: if next.status is "teach", go to step 3 for that chunk (it is already in_progress — do not call create_session_chunk). If next.status is "blocked" or "error", surface the message to the learner and stop. Only loop back to step 2 when next.status is "complete" or no chunk is currently in_progress.
5. Repeat steps 2–4 for each chunk the learner selects.
6. Call complete_session with the session_id from step 1 and optional feedback when the learner is done.

CONTENT CREATION
1. Use the scaffolding prompt to plan a topic (5-9 chunks).
2. Use the chunk_generation prompt to produce chunk content.
3. Call create_topic_with_chunks to persist the topic and all chunks in one operation.

RULES
- Never fabricate scores or call record_review_result during a teaching session — use submit_answer.
- Never skip drills; the server decides when a chunk is mastered.
- Do not manually hydrate prompt templates; call prompts through the MCP protocol.`;
