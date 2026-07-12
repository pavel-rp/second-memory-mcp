# JNY-B1 / BM-2 — Retrospective Evidence (revised vehicle v1.1)

**Task:** NEU-904 · **Journey:** JNY-B1 → BM-2 (spaced retrieval must hold a learned DP pattern over `≥2` spaced re-reviews) · **Hypothesis:** H-B1 · **Contract:** MC-1 (frozen `v1.0`, `PROXY-DIRECTIONAL`), transfer proxy MC-9 (`INC-1`).
**Vehicle:** v1.1 revised (`06_vehicle-revision.md` §2) — retrospective, privacy-gated production aggregates + informal creator testimony. This file records **raw evidence only**; it sets **no** BM-cell status, computes **no** metric/threshold, and draws **no** market/prevalence claim (NEU-906 owns adjudication via `LINK-4`). Records are **append-only** and **payload-free** (`PLA-1…3`).

**Class purity (897 discipline #1).** Two evidence classes are present and are recorded as **separate** labeled records, never fused into one claim:
- **`OBS-JNY-B1#RETRO-BM2`** — class-3 `[dogfooding]` **RETROSPECTIVE** (the creator's own learning-table behavior).
- **`OPLOG-JNY-B1#BM2`** — class-6 `[operational-log]` (request/operation-log aggregates).

**These use NEW run-ids.** The reserved live-loop ids `JNY-B1#R-BM2-1/2` (`01_…` Part B) are **left un-filled**: they name the v1.0 live-loop vehicle that never ran, and populating them would relabel a non-executed vehicle as executed.

---

## Shared provenance & authorization (both records)

- **Snapshot source:** `neu904-retrospective-evidence.md` — orchestrator-collected read-only aggregates from the production Postgres DB, **collected 2026-07-12**. No raw response/content payload copied (`PLA-1…3`, P5/EX6/BX-5).
- **Creator authorization (verbatim, 2026-07-12):** *"use dbhub to find any evidence, you can use the 'prod' db sparingly, just not destructively."* Least-privilege, read-only, aggregate-only; the snapshot is the authorized extract and is **not** re-queried by NEU-904.
- **Coverage note (from snapshot):** request/operation logging exists only since **2026-03-24**; learning tables reach back to **2025-10-17**. The two windows overlap but are not identical.
- **Noise exclusion (from snapshot):** `qa-test*` / `qa` subjects (~13 topics) are tool-testing artifacts and are excluded/labeled out of creator-learning claims.

---

## Record 1 — `OBS-JNY-B1#RETRO-BM2` (class-3 `[dogfooding]`, RETROSPECTIVE)

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-B1#RETRO-BM2` (revised-vehicle v1.1; distinct from the reserved, un-filled `JNY-B1#R-BM2-1/2`). |
| **`OBS-journey`** | JNY-B1 → BM-2 (does spaced retrieval hold a learned DP pattern across `≥2` re-reviews?). |
| **`OBS-datetime`** | Collection 2026-07-12 (aggregate over sessions 2025-10-17 … 2026-07-05). |
| **`OBS-vehicle`** | v1.1 retrospective aggregate of production learning tables (`learning_topics`, `learning_chunks`, `learning_sessions`, `session_question_attempts`). **No live loop; not pre-registered.** |
| **`OBS-prereq-position`** | `—` retrospective (no live A-axis exercised at collection time); the creator is the in-audience A1 learner whose historical behavior these tables record. BX-1/BX-2 not exercised. |
| **`OBS-content-ref`** | Subject `Algorithms` dominant (33 topics) plus adjacent DSA subjects; `qa-test*`/`qa` (~13 topics) **excluded** as tool-testing noise. Aggregate only — no `session_id`/`chunk_ids` enumerated (payload-free). |
| **`OBS-creator-role`** | `learner` (retrospective — the historical learner behavior captured in the product's own tables). |
| **`OBS-held-constant`** | Target cell BM-2; the creator (n=1); the production dataset as of the snapshot. |
| **`OBS-varied`** | `—` (retrospective aggregate; the varied dimension the v1.0 loop would have controlled — elapsed `interval_days` on a single tracked pattern — was **not** controllable retrospectively; see `OBS-fidelity-hit`). |
| **`OBS-prompts`** | `—` (no live prompts; aggregate over historical attempts). |
| **`OBS-server-signals`** | **Read from aggregate query results, not fabricated.** (a) Global: 73 topics, 271 chunks, 213 sessions, 320 attempts; 50 active days over 2025-10-17…2026-07-05. (b) Completed sessions by mode: learning=128, review=28, assessment=25, retrieval=17, scaffolding=14 (multi-mode use present). (c) Quality distribution (SM-2 0–5): passed q3=33/q4=45/q5=181 (259 passed) vs failed q0=3/q1=33/q2=10/q?=15 (61 failed). (d) **Spaced-repetition ladder** (`learning_chunks WHERE repetitions>0`): reps=1→57 chunks (avg interval 1.0d), reps=2→42 (5.8d), reps=3→11 (45.1d), reps=4→4 (125.3d), reps=5→1 (11.0d), reps=7→1 (111.0d), reps=8→1 (137.0d), reps=9→1 (141.0d); avg ease 2.58→3.40 up the ladder. |
| **`OBS-failure-signal`** | For **BM-2 (retention holds across re-reviews)**: the **retention-holds** direction is `present`-leaning as a retrospective proxy — chunks advanced to repetitions 2–9 with monotonically growing intervals (1→5.8→45→125→137→141 days), which under SM-2 occurs only when a chunk is **repeatedly re-reviewed and passed** across successive spaced intervals; passed attempts dominate (259 vs 61). One-line rationale grounded in `OBS-server-signals` (d)+(c). **Caveat carried into the record, not hidden:** the ladder is **pooled across chunks**, so it evidences that *spaced re-review-and-pass happened at scale*, not the retention trajectory of a *single tracked* pattern — which only the v1.0 live loop could isolate. |
| **`OBS-boundary-check`** | ✅ No `BX-*` crossed: DP/DSA-subject scope; **no market/demand/prevalence claim** (n=1); **no raw-log payload** (aggregate counts only); no mastery threshold invented (`INC-2`/SUB-4 authority, `OC-5`). |
| **`OBS-fidelity-hit`** | Hits every v1.0 fidelity caveat **plus** revised-vehicle caveats (`06_…` §3): n=1; weeks-not-months → now months-of-real-history but **retrospective, not pre-registered**; pooled-across-chunks (not a single tracked pattern); no sealed-conclusion ordering; **non-standard class-3 provenance** (DB aggregate + authorization quote, not a recorded protocol run). Directional proxy only (`INC-1` UNRESOLVED). |
| **`OBS-creator-conclusion`** | `—` **No sealed creator conclusion** (informal testimony only; see below). The AI reviews (`09_…`) received the raw aggregates + verbatim testimony **without** any orchestrator interpretation. |

**Verbatim creator testimony (recorded as evidence, not interpreted here):** *"i have learnt dozens of dsa problems with it"* (2026-07-12, in-conversation, informal). **Limitation:** informal, unstructured, self-reported, n=1; **no structured interview** was conducted.

---

## Record 2 — `OPLOG-JNY-B1#BM2` (class-6 `[operational-log]`)

| Field | Value |
| --- | --- |
| **`OPLOG-run-id`** | `JNY-B1#BM2` (operational-log record; separate class from Record 1). |
| **`OPLOG-journey`** | JNY-B1 → BM-2 (operational corroboration that the documented teach→submit loop is the real usage path). |
| **`OPLOG-query-scope`** | (Q4a) `infrastructure.mcp_request_log` whole-table aggregate; (Q4b) `infrastructure.operation_event_log` `GROUP BY tool`. **No `params`/`response_body` read** (privacy gate). |
| **`OPLOG-time-range`** | 2026-03-24 … 2026-07-12 (request/event log window; narrower than the learning-table window — coverage note above). |
| **`OPLOG-field-allowlist`** | Aggregate counts, tool name, request count, active-day count, avg duration, error-response count. **No payload fields.** |
| **`OPLOG-aggregates`** | (Q4a) total_requests=5603; active_days=101; avg_duration_ms=74; error_responses(≥400)=98 (1.7%). (Q4b) by tool: submit_answer=285, teach_next=217, create_topic_with_chunks=125, complete_session=49, create_session=49, create_learning_item=45, update_chunk_content=22, delete_chunk=20, recommend_remediation=16, start_learning=6, init_agent_context=2; **zero error-level events on all learning tools.** |
| **`OPLOG-failure-signal`** | For **BM-2 loop reality**: `present` — `teach_next` (217) + `submit_answer` (285) are the two highest-volume learning-tool events (502 combined), i.e. the documented teaching→answer loop is the dominant real usage path, exercised over 101 active days. Rationale grounded only in `OPLOG-aggregates`. |
| **`OPLOG-boundary-check`** | ✅ Payload-free (`PLA-1…3`, P5/EX6/BX-5); aggregate/query-scope/field-list provenance only; no payload exported; no threshold invented; no market/prevalence claim. |
| **`OPLOG-fidelity-hit`** | Operational logs describe **observed system behavior, not intent or generalizable preference** (class-6 structural limitation, NEU-897 taxonomy #6). Window (from 2026-03-24) does not cover the earliest learning history. n=1 tenant (the creator). |
| **`OPLOG-conclusion`** | `—` (no interpretation set here; input to NEU-906). |

---

## Reproduction & discipline note

Another operator, given the authorized snapshot and the same query scopes, obtains the identical aggregates (deterministic over a fixed snapshot). This package **does not** re-run the queries (the snapshot is the authorized extract). Both records are payload-free; class-3 and class-6 are kept separate; the reserved v1.0 run-ids remain un-filled; BM-2 stays **UNRESOLVED via `INC-1`** regardless of the direction above (no status set here).
