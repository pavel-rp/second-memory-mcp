# JNY-F1 / BM-1 + BM-7 — Retrospective Evidence (revised vehicle v1.1)

**Task:** NEU-905 · **Journey:** JNY-F1 → BM-1 (first DP pattern; risk of memorizing the surface solution instead of a transferable schema — FM2 + X1) + BM-7 (already-competent learner studies worked examples for a harder pattern; possible expertise reversal — FM2 under X2) · **Hypothesis:** H-F1 · **Contract:** MC-2 (frozen `v1.0`, `PROXY-DIRECTIONAL` transfer / INCOMPLETE reversal), transfer proxy MC-9 (`INC-1`).
**Vehicle:** v1.1 revised (`01_vehicle-revision.md` §2) — retrospective, privacy-gated production aggregates + informal creator testimony, substituting for the declined live CONTENT-CREATION→TEACHING-FLOW transfer-probe run. This file records **raw evidence only**; it sets **no** BM-cell status, computes **no** metric/threshold, and draws **no** market/prevalence claim (NEU-906 owns adjudication via `LINK-4`). Records are **append-only** and **payload-free** (`PLA-1…3`).

**Load-bearing honesty note (read first).** The core BM-1 claim is *transfer*, not recall (X1: "retention ≠ transfer"). The retrospective aggregates contain **no novel-instance transfer probe** — the one instrument that could separate schema transfer from surface memorization. Therefore this vehicle **cannot isolate the BM-1 transfer claim** and **cannot exercise the BM-7 expertise-reversal boundary** at all (n=1 cannot un-know a pattern; BM-7 is cap-bound INCOMPLETE, G2.1). The evidence below is recorded for what it *can* honestly show — that the surface-vs-schema **failure surface exists in real use** (non-trivial failed-attempt volume on a single learner) — and is explicitly carried as **insufficient-evidence / INCOMPLETE** for the transfer and reversal claims, not as coverage.

**Class purity (897 discipline #1).** Two evidence classes, recorded as **separate** labeled records, never fused:
- **`OBS-JNY-F1#RETRO`** — class-3 `[dogfooding]` **RETROSPECTIVE** (the creator's own learning-table behavior).
- **`OPLOG-JNY-F1`** — class-6 `[operational-log]` (request/operation-log aggregates).

**These use NEW run-ids.** The reserved live-run ids `JNY-F1#R1/R2` (`../benchmark-suite/`) are **left un-filled**: they name the v1.0 transfer-probe vehicle that never ran, and populating them would relabel a non-executed vehicle as executed.

---

## Shared provenance & authorization (both records)

- **Snapshot source:** `neu904-retrospective-evidence.md` — orchestrator-collected read-only aggregates from the production Postgres DB, **collected 2026-07-12**. No raw response/content payload copied (`PLA-1…3`, P5/EX6/BX-5).
- **Creator authorization (verbatim, 2026-07-12):** *"use dbhub to find any evidence, you can use the 'prod' db sparingly, just not destructively."* Least-privilege, read-only, aggregate-only; the snapshot is the authorized extract and is **not** re-queried by NEU-905.
- **Coverage note (from snapshot):** request/operation logging exists only since **2026-03-24**; learning tables reach back to **2025-10-17**. The two windows overlap but are not identical.
- **Noise exclusion (from snapshot):** `qa-test*` / `qa` subjects (~13 topics) are tool-testing artifacts and are excluded/labeled out of creator-learning claims.

---

## Record 1 — `OBS-JNY-F1#RETRO` (class-3 `[dogfooding]`, RETROSPECTIVE)

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-F1#RETRO` (revised-vehicle v1.1; distinct from the reserved, un-filled `JNY-F1#R1/R2`). |
| **`OBS-journey`** | JNY-F1 → BM-1 (surface memorization vs transferable schema, FM2/X1) + BM-7 (expertise reversal, FM2/X2). |
| **`OBS-datetime`** | Collection 2026-07-12 (aggregate over sessions 2025-10-17 … 2026-07-05). |
| **`OBS-vehicle`** | v1.1 retrospective aggregate of production learning tables (`learning_topics`, `learning_chunks`, `learning_sessions`, `session_question_attempts`). **No live teaching-flow run; no transfer probe; not pre-registered.** |
| **`OBS-prereq-position`** | Intended cell prereqs are **A1** (BM-1 first pattern) and **A2** (BM-7 harder pattern for a competent learner). Retrospective: the creator is a single historical learner; A1/A2 are **not independently controllable** in an aggregate — noted as a fidelity hit, not asserted. Never A0/A4 (BX-1/BX-2). |
| **`OBS-content-ref`** | Subject `Algorithms` dominant (33 topics) plus adjacent DSA subjects; `qa-test*`/`qa` (~13 topics) **excluded** as tool-testing noise. Aggregate only — no `session_id`/`chunk_ids` enumerated (payload-free). |
| **`OBS-creator-role`** | `learner` (retrospective — the historical learner behavior captured in the product's own tables). |
| **`OBS-held-constant`** | Target cells BM-1/BM-7; the creator (n=1); the production dataset as of the snapshot. |
| **`OBS-varied`** | `—` (retrospective aggregate; the varied dimension the v1.0 vehicle would have controlled — prerequisite position A1 vs A2, and trained-instance vs novel-instance probe — was **not** controllable retrospectively; see `OBS-fidelity-hit`). |
| **`OBS-prompts`** | `—` (no live prompts; no probe items were administered). |
| **`OBS-server-signals`** | **Read from aggregate query results, not fabricated.** (a) Attempt quality distribution (SM-2 0–5): **failed** q0=3, q1=33, q2=10, q=null=15 (**61 failed attempts total**); **passed** q3=33, q4=45, q5=181 (259 passed); i.e. ~19% of the 320 attempts were graded failing. (b) Content-authoring in real use (`operation_event_log`): `create_topic_with_chunks`=125, `create_learning_item`=45, `update_chunk_content`=22 — the worked-example/content-authoring flow the vehicle presupposes was exercised at scale. (c) Repetition ladder (context): reps=1→57 chunks, reps=2→42, reps=3→11, tail to reps=9. |
| **`OBS-failure-signal`** | For **BM-1 (surface memorization vs transferable schema, FM2/X1):** **`inconclusive`** as a transfer signal. Rationale grounded in `OBS-server-signals`: the 61 failed attempts (incl. 46 at q0–q2) show the *failure surface* — answers graded deficient — is real in this learner's history; **but** without a novel-instance transfer probe, a failed or passed attempt cannot be attributed to transfer vs recall (X1). The aggregate therefore **cannot** show FM2 (surface memorization) `present` *as a transfer failure*, nor schema transfer `present`. For **BM-7 (expertise reversal, FM2/X2):** **`inconclusive` / not-exercised** — n=1 retrospective cannot separate A1 from A2 trajectories; the reversal boundary is not surfaced (cap-bound INCOMPLETE, G2.1). |
| **`OBS-boundary-check`** | ✅ No `BX-*` crossed: DP/DSA-subject scope; A-axis stayed in-audience (never A0/A4); **no market/demand/prevalence claim** (n=1); **no raw-log payload** (aggregate counts only); no mastery threshold invented (`INC-2`/SUB-4 authority, `OC-5`); the X1 transfer≠recall conflict is **preserved, not adjudicated**. |
| **`OBS-fidelity-hit`** | Hits every v1.0 fidelity caveat **plus** revised-vehicle caveats (`01_…` §3): n=1; **no transfer probe** (the decisive instrument is absent → BM-1 transfer not isolable); A1/A2 not controllable → **BM-7 reversal not exercised** (INCOMPLETE, G2.1); retrospective, not pre-registered; pooled across chunks; no sealed-conclusion ordering; non-standard class-3 provenance (DB aggregate + authorization quote). Transfer validity remains `INC-1` UNRESOLVED. |
| **`OBS-creator-conclusion`** | `—` **No sealed creator conclusion** (informal testimony only; below). The AI reviews (`03_…`) received the raw aggregates + verbatim testimony **without** any orchestrator interpretation. |

**Verbatim creator testimony (recorded as evidence, not interpreted here):** *"i have learnt dozens of dsa problems with it"* (2026-07-12, in-conversation, informal). **Limitation:** informal, unstructured, self-reported, n=1; it speaks to *volume learned*, **not** to transfer vs recall or to an expertise-reversal boundary; **no structured interview** was conducted; it does not substitute for the absent transfer probe.

---

## Record 2 — `OPLOG-JNY-F1` (class-6 `[operational-log]`)

| Field | Value |
| --- | --- |
| **`OPLOG-run-id`** | `JNY-F1` (operational-log record; separate class from Record 1). |
| **`OPLOG-journey`** | JNY-F1 → BM-1 (operational context: is the content-authoring→teaching flow the vehicle presupposes a real usage path?). |
| **`OPLOG-query-scope`** | `infrastructure.operation_event_log` `GROUP BY tool`; `infrastructure.mcp_request_log` whole-table aggregate. **No `params`/`response_body` read** (privacy gate). |
| **`OPLOG-time-range`** | 2026-03-24 … 2026-07-12 (request/event log window; narrower than the learning-table window — coverage note above). |
| **`OPLOG-field-allowlist`** | Aggregate counts, tool name, request count, active-day count, avg duration, error-response count. **No payload fields.** |
| **`OPLOG-aggregates`** | By tool: `create_topic_with_chunks`=125, `create_learning_item`=45, `update_chunk_content`=22, `delete_chunk`=20 (the authoring flow), `teach_next`=217, `submit_answer`=285 (the teaching/answer loop). Global: total_requests=5603 over 101 active days; error_responses(≥400)=98 (1.7%); **zero error-level events on all learning tools.** |
| **`OPLOG-failure-signal`** | For **BM-1 vehicle reality:** `present` — the content-authoring tools (125+45+22 events) and the teach→submit loop (502 combined) confirm the CONTENT-CREATION→TEACHING-FLOW path the v1.0 vehicle presupposes is a real, exercised usage path. **This corroborates that the *vehicle path* exists in real use; it says nothing about transfer vs recall or expertise reversal** (Record 1 carries those as inconclusive/INCOMPLETE). Rationale grounded only in `OPLOG-aggregates`. |
| **`OPLOG-boundary-check`** | ✅ Payload-free (`PLA-1…3`, P5/EX6/BX-5); aggregate/query-scope/field-list provenance only; no payload exported; no threshold invented; no market/prevalence claim. |
| **`OPLOG-fidelity-hit`** | Operational logs describe **observed system behavior, not intent or generalizable preference** (class-6 structural limitation, NEU-897 taxonomy #6). Window (from 2026-03-24) does not cover the earliest learning history. n=1 tenant (the creator). Corroborates path existence only, not the BM-1/BM-7 claims. |
| **`OPLOG-conclusion`** | `—` (no interpretation set here; input to NEU-906). |

---

## Reproduction & discipline note

Another operator, given the authorized snapshot and the same query scopes, obtains the identical aggregates (deterministic over a fixed snapshot). This package **does not** re-run the queries (the snapshot is the authorized extract). Both records are payload-free; class-3 and class-6 are kept separate; the reserved v1.0 run-ids remain un-filled. **BM-1 transfer stays UNRESOLVED via `INC-1`; BM-7 reversal stays INCOMPLETE (G2.1)** — no status set here, and the absence of a transfer probe is carried as a first-class limitation, not smoothed. Whether this evidence `supports`/`contradicts`/is `insufficient` for H-F1 is the AI reviewers' call (`03_…`) and NEU-906's adjudication, not this file's.
