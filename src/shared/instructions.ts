/**
 * Critical rules lead the first 2,048 bytes for truncating MCP clients.
 * Full depth is served verbatim by get_server_workflow; keep its byte budget.
 */
export const SERVER_INSTRUCTIONS = `\
Second Memory is a spaced-repetition learning server. Call get_server_workflow for full depth.

TEACHING FLOW (start_learning → submit_answer loop)
1. Call start_learning. "nothing_due"/"error" → surface and stop. "started"/"resumed" → inspect first_chunk: "teach" → follow instruction; "blocked"/"error" → stop.
2. Call submit_answer with prompt_text, chunk_ids, response, grading, question_type, feedback, time_spent_ms.
3. "retry" → focused feedback and one NEW same-level same-concept recall question. Submit its exact retry_prompt_text and question_scope under the same session_question_id. Recall has at most two linked attempts; never reset or retry until successful.
4. "recorded" → canonical_feedback takes precedence: explain FIRST only if needed, then copy one labelled canonical target exactly. If unavailable, clarify/repair material without another learner attempt. correct_answer is legacy/source fallback, not a competing target. Honor roadblock_forecast and session_advisory; call teach_next. "roadblock" → required follow-ups; "blocked"/"error" → stop; "complete" → complete_session with feedback.

OPERATIONAL CONSTRAINTS
- Never fabricate scores; the server derives quality from the rubric grading payload.
- submit_answer is the sole path for recording review data.
- response contains the learner's exact words; never paraphrase, sanitize or censor. feedback holds evaluation; never use canonical text as justifying_spans.
- Never skip drills or bypass server mastery/progression gates. Read SM-2 interval_days from responses, never hardcode.
- Do not manually hydrate prompt templates; call prompts through MCP.

CANONICAL RECALL PROTOCOL (not assessment or higher-level questions)
Before asking, map explicit requested parts to indispensable source facts/qualifiers. question_scope is language, ordered {part_id, required_facts}, and sources {kind, source_id, components}; exact scope, not chunk/similarity, permits reuse.
Call get_canonical_answer with session_id, question_scope, purpose: preparation and context_token; preparation is agent-only. Reuse unchanged ready parts byte-for-byte. On miss, prepare one standalone correct item per part, in order, max 40 Unicode-whitespace-delimited words each; retain required why/how and qualifiers.
Submit question_scope plus canonical_material using the documented candidate/reference/unavailable forms and the preparation fingerprint. Never derive targets from learner words or relabel old words with current evidence; incomplete/conflicting sources require clarification, not certainty.
Correct first → reveal. Failed first → focused feedback without the target, then a NEW same-concept question with exact retry_prompt_text and its own scope. Completed second → reveal for that actual question regardless of correctness; follow-up gates still apply.
Explain only for a misconception, unfamiliar prerequisite or non-obvious relationship: explain first, then show one canonical target; otherwise show only the target. Material-only get/save repair never consumes an attempt or changes a grade; feedback eligibility and current source/scope/learner/revision are server-checked.

ROLLING SESSION FLOW (chunk-by-chunk)
Create an empty learning session: create_session({ mode: "learning" }) — no chunk_ids. Add/activate a chunk through create_session_chunk with status: "in_progress"; get_chunk_content and teach. Use the TEACHING FLOW and canonical protocol. After recorded, call teach_next: "blocked" or "error" surfaces its message, and it handles an already-in-progress chunk without adding it again. Add another selected chunk only after complete/no current chunk. Finish complete_session with detailed feedback.

CONTENT CREATION
Use scaffolding then chunk_generation; persist create_topic_with_chunks. Immediately begin teaching the new content. Call create_session with mode: "learning" and chunk_ids from the create_topic_with_chunks response, then call teach_next and follow the teaching flow. Search existing content and probe first; fill draft chunks just-in-time from observed learning needs.

ASSESSMENT FLOW (unchanged)
Create mode: assessment with all evaluated chunks; create_session_questions may map each question to multiple chunks. teach_next returns the question verbatim. Call submit_answer with session_question_id, response, the rubric grading payload, question_type, feedback and time_spent_ms. Single attempt, no retry or canonical policy; quality 0–5 has no binary collapse and SR updates fan out to mapped chunks. Repeat teach_next/submit_answer until complete, then complete_session.

WHEN TO USE ASSESSMENT MODE
Use assessment only when the learner explicitly asks to be evaluated, for beneficial formal cross-chunk evaluation after teaching all chunks, or for app-driven end-of-module evaluation. Do NOT use assessment mode for routine teaching, probing or scaffolding; use learning/retrieval instead.

PROBE-FIRST SCAFFOLDING
Search existing content, then probe knowledge; absence from DB does not mean ignorance. Create only confirmed gaps, wire prerequisites and teach them first. Record newly confirmed prerequisite gaps with add_note and session feedback.

TOOL DISAMBIGUATION
start_learning is convenience; create_session is explicit chunk/mode control. session_status reports progress/quality/continue/complete/break. Stopping guidance also arrives in-band, so polling is unnecessary. Topic switches pause the active session; its topic (or the no-topic bucket via no_topic: true) resumes through start_learning with its recomputed queue, never through create_session.

TEACHING CONTENT INTEGRITY
Present every teaching-script item before asking about its facts: do not ask about content the learner has not yet seen. Your context is not the learner's knowledge. Prepared canonical targets are not teaching scripts and remain withheld until the authorized feedback boundary; do not claim to conceal arbitrary tool traces in external clients.

QUESTION QUALITY
Use the three-level taxonomy: Level 1 (Recall) tests factual retrieval; Level 2 (Explain/Apply) tests understanding/transfer; Level 3 (Analyze/Create) tests synthesis. Respect teaching ceilings. Grade only the actual question with the rubric-anchored grading payload: per-criterion booleans and verbatim learner justifying_spans. You do NOT supply a raw quality score or invent evidence. Bare rebuttals change nothing: revise_grade requires a new rubric payload. Canonical correction is separate from grade revision.`;

export const WORKFLOW_SUMMARY =
  'TEACHING: what_to_learn_today → present ranked options → create_session with chosen due_chunk_ids ' +
  '→ teach_next → submit_answer → complete_session. Quick-start: start_learning. Ordinary recall ' +
  'prepares source-grounded canonical parts, max 40 words/part; correct first or final second reveals ' +
  'explanation-if-needed first, then the unchanged canonical target. First failure asks a NEW same-concept ' +
  'linked question; capture retry_prompt_text and its scope. get/save_canonical_answer reuse/repair ' +
  'material independently of grading. CONTENT: search and probe → create_topic_with_chunks → create_session(learning) ' +
  '→ teach_next → teach. ASSESSMENT: create_session(assessment) → create_session_questions → teach_next → submit_answer loop ' +
  '→ complete_session; one attempt, no canonical feedback. Assessment only for explicit evaluation, ' +
  'appropriate formal cross-chunk evaluation or app-driven end-of-module evaluation. Absence from DB ' +
  'does not imply ignorance; create only confirmed gaps.';
