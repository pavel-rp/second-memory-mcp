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

CONTENT CREATION
1. Use the scaffolding prompt to plan a topic (5-9 chunks).
2. Use the chunk_generation prompt to produce chunk content.
3. Call create_topic_with_chunks to persist the topic and all chunks in one operation.

RULES
- Never fabricate scores or call record_review_result during a teaching session — use submit_answer.
- Never skip drills; the server decides when a chunk is mastered.
- Do not manually hydrate prompt templates; call prompts through the MCP protocol.`;
