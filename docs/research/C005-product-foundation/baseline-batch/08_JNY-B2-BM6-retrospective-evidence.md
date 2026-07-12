# JNY-B2 / BM-6 — Retrospective Evidence (revised vehicle v1.1)

**Task:** NEU-904 · **Journey:** JNY-B2 → BM-6 (a rating-driven learner grinds volume and abandons spaced review; documented culture diverges from evidence practice — FM5 adherence-collapse *shape* + X3 conflict) · **Hypothesis:** H-B2 · **Contract:** MC-5 (frozen `v1.0`, `CLASS-7-DEFERRED` prevalence + `PROXY-DIRECTIONAL` failure-shape).
**Vehicle:** v1.1 revised (`06_vehicle-revision.md` §2) — retrospective, privacy-gated production aggregates + informal creator testimony, substituting for the declined simulated-week role-play. This file records **raw evidence only** — **no** BM-cell status, **no** metric/threshold, and **strictly no market / demand / preference / prevalence conclusion** (EX3/BX-3, the wall most at risk in this journey; R5 High, non-downgradable). Records are **append-only** and **payload-free** (`PLA-1…3`).

**Class purity (897 discipline #1).** Separate labeled records:
- **`OBS-JNY-B2#RETRO-BM6`** — class-3 `[dogfooding]` **RETROSPECTIVE** (creator's own month-by-month behavior + review debt).
- **`OPLOG-JNY-B2#BM6`** — class-6 `[operational-log]` (request-log activity aggregates).

**NEW run-ids.** The reserved role-play ids `JNY-B2#R1/R2` (`03_…`) are **left un-filled** — they name the v1.0 simulated-week role-play that never ran (declined by the creator).

---

## Shared provenance & authorization

- **Snapshot source:** `neu904-retrospective-evidence.md`, read-only production aggregates, **collected 2026-07-12**; payload-free (`PLA-1…3`).
- **Creator authorization (verbatim, 2026-07-12):** *"use dbhub to find any evidence, you can use the 'prod' db sparingly, just not destructively."*
- **Declined original vehicle (verbatim, 2026-07-12):** *"I'm not gonna roleplay a week lol"* — the simulated-week role-play (v1.0) was explicitly declined; real behavioral aggregates substitute (`06_…`).
- **Coverage note:** request/operation logging exists only since 2026-03-24; learning tables reach back to 2025-10-17 — so the **2025-12 … 2026-01 zero-activity gap is *before* the log window** and is visible only in the learning tables.
- **Noise exclusion:** `qa-test*`/`qa` subjects excluded as tool-testing artifacts.

---

## Record 1 — `OBS-JNY-B2#RETRO-BM6` (class-3 `[dogfooding]`, RETROSPECTIVE)

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-B2#RETRO-BM6` (revised-vehicle v1.1; distinct from the reserved, un-filled `JNY-B2#R1/R2`). |
| **`OBS-journey`** | JNY-B2 → BM-6 (grind-vs-review adherence *shape*: FM5 + X3). |
| **`OBS-datetime`** | Collection 2026-07-12 (aggregate over 2025-10-17 … 2026-07-05). |
| **`OBS-vehicle`** | v1.1 retrospective aggregate of production learning tables (monthly session-mode mix; current review-debt aggregate). **No role-play; not pre-registered.** |
| **`OBS-prereq-position`** | Intended cell prereq is **A3** (rating-driven learner). Retrospective: the creator is the single historical learner; A3 is not independently controllable in a retrospective aggregate — noted as a fidelity hit, not asserted. Never A0/A4 (BX-1/BX-2). |
| **`OBS-content-ref`** | `learning_sessions` monthly mode mix; `learning_chunks` scheduling aggregate. Aggregate only; `qa-test*` excluded; payload-free. |
| **`OBS-creator-role`** | `learner` (retrospective historical behavior). |
| **`OBS-held-constant`** | Target cell BM-6; the creator (n=1); the production dataset as of snapshot. |
| **`OBS-varied`** | `—` (retrospective; the controlled grind-pressure dimension the v1.0 role-play would have varied is not present — `06_…` §3). |
| **`OBS-prompts`** | `—`. |
| **`OBS-server-signals`** | **Read from aggregate results, not fabricated.** Monthly session mix (learning / review+retrieval / assessment+scaffolding): 2025-10 = **90 / 14 / 8** (grind-heavy onboarding); 2025-11 = 5 / 3 / 2; **2025-12 & 2026-01 = zero activity (real usage lapse)**; 2026-02 = 1 / 0 / 0; 2026-03 = 18 / **23** / 2 (review-heavy comeback); 2026-04 = 7 / 4 / 2; 2026-05 = 1 / 1 / 25; 2026-06 = 5 / 0 / 0; 2026-07 = 2 / 0 / 0. Current review debt: **overdue_now = 266 of scheduled_total = 271 (98% overdue)** as of 2026-07-12; avg_consecutive_failures = 0.03, max = 1. |
| **`OBS-failure-signal`** | For **BM-6 / FM5 adherence-collapse *shape* + X3**: `present`-leaning as a retrospective proxy — the trajectory shows a grind-heavy onboarding (Oct: 90 new-learning vs 14 review), a multi-month lapse (Dec–Jan zero), a brief review-heavy comeback (Mar: 23 review), then relapse, ending in **98% overdue review debt (266/271)** while the most recent months skew back toward new-learning over review. This is the grind-over-scheduled-review adherence *shape* the cell describes. Rationale grounded only in `OBS-server-signals`. **Failure *shape* only — never prevalence.** |
| **`OBS-boundary-check`** | ✅ **EX3/BX-3 wall enforced:** **no market / demand / preference / prevalence conclusion** is drawn from n=1 (R5 High, non-downgradable, `G6.1`). DP scope; no raw-log payload; no threshold invented. |
| **`OBS-fidelity-hit`** | n=1 cannot represent a population adherence distribution (the journey probes *shape*, not *prevalence* — prevalence is `CLASS-7-DEFERRED`/`INC-5`). Retrospective, not pre-registered; A3 not independently controllable; non-standard class-3 provenance (DB aggregate + authorization quote); no sealed conclusion. |
| **`OBS-creator-conclusion`** | `—` No sealed conclusion; informal testimony only (below). AI reviews (`10_…`) saw raw aggregates + verbatim testimony, no orchestrator interpretation. |

**Verbatim creator testimony (evidence, not interpreted here):** *"I'm not gonna roleplay a week lol"* (2026-07-12) — declining the simulated-week vehicle; the real behavioral aggregates above are the substitute. **Limitation:** informal, unstructured, self-reported, n=1; no structured interview.

---

## Record 2 — `OPLOG-JNY-B2#BM6` (class-6 `[operational-log]`)

| Field | Value |
| --- | --- |
| **`OPLOG-run-id`** | `JNY-B2#BM6`. |
| **`OPLOG-journey`** | JNY-B2 → BM-6 (operational context for the adherence *shape*). |
| **`OPLOG-query-scope`** | `infrastructure.mcp_request_log` whole-table aggregate; `infrastructure.operation_event_log` `GROUP BY tool`. No `params`/`response_body` read. |
| **`OPLOG-time-range`** | 2026-03-24 … 2026-07-12 (log window; **does not cover** the 2025-12/2026-01 lapse, which is learning-table-only). |
| **`OPLOG-field-allowlist`** | Aggregate counts, tool name, active-day count, avg duration, error-response count. No payload fields. |
| **`OPLOG-aggregates`** | total_requests=5603 over 101 active days (avg 74ms, 1.7% ≥400 errors). By tool: `submit_answer`=285, `teach_next`=217 dominate the learning-loop volume; **`recommend_remediation`=16** and `review`-mode sessions exist but are a minority of the learning-loop volume. |
| **`OPLOG-failure-signal`** | For **BM-6 context**: `inconclusive` on its own — the request log corroborates active, sustained learning-loop usage but the log window post-dates the sharpest grind-vs-review swings; it neither establishes nor refutes the adherence *shape* by itself. Rationale grounded only in `OPLOG-aggregates`. Provided as context, not as the load-bearing BM-6 signal (which is Record 1). |
| **`OPLOG-boundary-check`** | ✅ Payload-free; aggregate/query-scope only; no market/prevalence claim; no threshold invented. |
| **`OPLOG-fidelity-hit`** | Class-6 describes observed system behavior, not intent/preference; window narrower than the behavioral history; n=1 tenant. |
| **`OPLOG-conclusion`** | `—`. |

---

## Reproduction & discipline note

Deterministic over the fixed authorized snapshot; **not re-queried** by NEU-904. Class-3 and class-6 kept separate; reserved v1.0 role-play ids un-filled; **EX3/BX-3 enforced (no market/prevalence claim)**; BM-6 prevalence stays **`CLASS-7-DEFERRED`/`INC-5`**, R5 (High) non-downgradable; no status set here (NEU-906 via `LINK-4`).
