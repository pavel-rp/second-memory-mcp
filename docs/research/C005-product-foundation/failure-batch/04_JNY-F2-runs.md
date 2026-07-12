# JNY-F2 / BM-3 + BM-4 — Retrospective Evidence (revised vehicle v1.1)

**Task:** NEU-905 · **Journey:** JNY-F2 → BM-4 (after a long gap a previously mastered pattern has decayed; relapse / re-learning — FM1 + X1) + BM-3 (consolidating multiple interdependent patterns; review scheduling for hierarchical multi-month dependencies is uncertain — FM3) · **Hypothesis:** H-F2 · **Contract:** MC-3 (frozen `v1.0`, `PROXY-DIRECTIONAL` BM-4 / `COLLECTION-GAP` BM-3), decay proxy MC-9 (`INC-1`).
**Vehicle:** v1.1 revised (`01_vehicle-revision.md` §2) — retrospective, privacy-gated production aggregates + informal creator testimony, substituting for the declined paper / Wizard-of-Oz decay timeline. This file records **raw evidence only** — **no** BM-cell status, **no** metric/threshold, **no** invented interval/schedule rule (`INC-2`, SUB-4), and **no** market/prevalence claim. Records are **append-only** and **payload-free** (`PLA-1…3`).

**Load-bearing honesty note (read first).** BM-4 (decay/relapse) is the half the retrospective vehicle can address at low fidelity: the creator's **real** usage history contains a multi-month lapse and a large current review-debt — genuine decay-in-the-wild, arguably *higher* fidelity than a simulated paper timeline because the forgetting is real, but **pooled, uncontrolled, and not a per-pattern decay curve** (no effect size, G1.1). BM-3 (the **optimal hierarchical schedule** for interdependent multi-month DP patterns) is **cap-bound INCOMPLETE** (`COLLECTION-GAP`, G1.2, EX5): no retrospective aggregate can produce it, and NEU-905 **invents no interval/schedule rule**. BM-3 is carried as INCOMPLETE, not as coverage.

**Class purity (897 discipline #1).** Separate labeled records:
- **`OBS-JNY-F2#RETRO`** — class-3 `[dogfooding]` **RETROSPECTIVE** (the creator's month-by-month behavior + review debt).
- **`OPLOG-JNY-F2`** — class-6 `[operational-log]` (request-log activity aggregates).

**NEW run-ids.** The reserved paper-timeline ids `JNY-F2#R1/R2` (`../benchmark-suite/`) are **left un-filled** — they name the v1.0 paper decay-timeline that never ran.

---

## Shared provenance & authorization

- **Snapshot source:** `neu904-retrospective-evidence.md`, read-only production aggregates, **collected 2026-07-12**; payload-free (`PLA-1…3`).
- **Creator authorization (verbatim, 2026-07-12):** *"use dbhub to find any evidence, you can use the 'prod' db sparingly, just not destructively."*
- **Coverage note:** request/operation logging exists only since 2026-03-24; learning tables reach back to 2025-10-17 — so the **2025-12 … 2026-01 zero-activity gap is *before* the log window** and is visible only in the learning tables.
- **Noise exclusion:** `qa-test*`/`qa` subjects excluded as tool-testing artifacts.

---

## Record 1 — `OBS-JNY-F2#RETRO` (class-3 `[dogfooding]`, RETROSPECTIVE)

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-F2#RETRO` (revised-vehicle v1.1; distinct from the reserved, un-filled `JNY-F2#R1/R2`). |
| **`OBS-journey`** | JNY-F2 → BM-4 (decay/relapse, FM1/X1) + BM-3 (hierarchical scheduling uncertainty, FM3). |
| **`OBS-datetime`** | Collection 2026-07-12 (aggregate over 2025-10-17 … 2026-07-05). |
| **`OBS-vehicle`** | v1.1 retrospective aggregate of production learning tables (monthly session mix; current review-debt aggregate; repetition/interval ladder). **No paper timeline; not pre-registered.** |
| **`OBS-prereq-position`** | The learner is the single historical in-audience learner (A1/A2 range). Retrospective — the A-axis is not independently controllable; noted as a fidelity hit. Never A0/A4 (BX-1/BX-2). |
| **`OBS-content-ref`** | `learning_sessions` monthly mode mix; `learning_chunks` scheduling + repetition aggregate. Aggregate only; `qa-test*` excluded; payload-free. |
| **`OBS-creator-role`** | `learner` (retrospective historical behavior). |
| **`OBS-held-constant`** | Target cells BM-3/BM-4; the creator (n=1); the production dataset as of snapshot. |
| **`OBS-varied`** | `—` (retrospective; the elapsed-interval dimension the v1.0 timeline would have laid out per tracked pattern is not independently present — `01_…` §3). |
| **`OBS-server-signals`** | **Read from aggregate results, not fabricated.** (a) **Usage lapse:** monthly learning-session activity runs 2025-10 (grind-heavy onboarding) → 2025-11 (light) → **2025-12 & 2026-01 = zero activity (real multi-month gap)** → 2026-02 (1 session) → 2026-03 (review-heavy comeback) → tail to 2026-07. (b) **Current review debt:** `overdue_now = 266 of scheduled_total = 271 (98% overdue)` as of 2026-07-12; avg_consecutive_failures = 0.03, max = 1. (c) **Repetition/interval ladder** (`learning_chunks WHERE repetitions>0`): reps=1→57 (avg interval 1.0d), reps=2→42 (5.8d), reps=3→11 (45.1d), reps=4→4 (125.3d), tail reps=7/8/9 at 111/137/141d — spaced intervals stretch to multi-month scale for a handful of chunks. |
| **`OBS-failure-signal`** | For **BM-4 (decay/relapse, FM1/X1):** **`present`-leaning** as a retrospective proxy. Rationale grounded in `OBS-server-signals`: a real **multi-month usage gap** (Dec-2025/Jan-2026 zero) sits inside a schedule where intervals had stretched to weeks/months (ladder (c)), and the current state is **98% overdue review debt (266/271)** — i.e. mastered/scheduled patterns lapsed past their review windows without re-review, the decay-then-relapse failure shape the cell describes. **Caveat carried, not hidden:** this is **pooled across chunks** and shows the *shape* of decay/relapse in real use, **not** a measured per-pattern decay curve and **no** effect size (G1.1). For **BM-3 (optimal hierarchical schedule, FM3):** **`inconclusive` / not-answerable** — the aggregate shows scheduling *exists and produced large debt*, but the *optimal* hierarchical schedule for interdependent multi-month patterns is **cap-bound INCOMPLETE** (`COLLECTION-GAP`, G1.2); NEU-905 invents no interval/schedule rule. |
| **`OBS-boundary-check`** | ✅ No `BX-*` crossed: DP/DSA scope; no market/demand/prevalence claim (n=1); no raw-log payload (aggregate counts only); **no interval/schedule rule invented** (`INC-2`/SUB-4 authority, `OC-5`); X1 preserved, not adjudicated; EX5 respected (no new scheduling research started). |
| **`OBS-fidelity-hit`** | n=1; **pooled across chunks, not a single tracked pattern's decay curve**; time-compressed vs real — here *real* history but **retrospective and uncontrolled**, not pre-registered; A-axis not controllable; BM-3 optimum cap-bound INCOMPLETE; non-standard class-3 provenance (DB aggregate + authorization quote); no sealed conclusion. Decay effect size stays `INC-1` UNRESOLVED. |
| **`OBS-creator-conclusion`** | `—` No sealed conclusion; informal testimony only (below). AI reviews (`05_…`) saw raw aggregates + verbatim testimony, no orchestrator interpretation. |

**Verbatim creator testimony (evidence, not interpreted here):** *"i have learnt dozens of dsa problems with it"* and (declining the simulated vehicle) *"I'm not gonna roleplay a week lol"* (2026-07-12). **Limitation:** informal, unstructured, self-reported, n=1; the real behavioral aggregates above substitute for the simulated timeline; **no structured interview.**

---

## Record 2 — `OPLOG-JNY-F2` (class-6 `[operational-log]`)

| Field | Value |
| --- | --- |
| **`OPLOG-run-id`** | `JNY-F2`. |
| **`OPLOG-journey`** | JNY-F2 → BM-4 (operational context for the decay/relapse shape). |
| **`OPLOG-query-scope`** | `infrastructure.mcp_request_log` whole-table aggregate; `infrastructure.operation_event_log` `GROUP BY tool`. No `params`/`response_body` read. |
| **`OPLOG-time-range`** | 2026-03-24 … 2026-07-12 (log window; **does not cover** the 2025-12/2026-01 lapse, which is learning-table-only — coverage note above). |
| **`OPLOG-field-allowlist`** | Aggregate counts, tool name, active-day count, avg duration, error-response count. No payload fields. |
| **`OPLOG-aggregates`** | total_requests=5603 over 101 active days (avg 74ms, 1.7% ≥400 errors). By tool: `submit_answer`=285, `teach_next`=217 dominate the learning-loop volume; `recommend_remediation`=16; `review`-mode sessions exist but are a minority of loop volume. |
| **`OPLOG-failure-signal`** | For **BM-4 context:** `inconclusive` on its own — the request log corroborates active, sustained learning-loop usage but **post-dates the sharpest usage gap** (Dec-2025/Jan-2026), so it neither establishes nor refutes the decay/relapse shape by itself. Provided as context; the load-bearing BM-4 signal is Record 1. Rationale grounded only in `OPLOG-aggregates`. |
| **`OPLOG-boundary-check`** | ✅ Payload-free; aggregate/query-scope only; no market/prevalence claim; no threshold invented. |
| **`OPLOG-fidelity-hit`** | Class-6 describes observed system behavior, not intent/preference; window narrower than the behavioral history (misses the key lapse); n=1 tenant. |
| **`OPLOG-conclusion`** | `—`. |

---

## Reproduction & discipline note

Deterministic over the fixed authorized snapshot; **not re-queried** by NEU-905. Class-3 and class-6 kept separate; reserved v1.0 timeline ids un-filled; **BM-4 stays UNRESOLVED via `INC-1`** (decay effect size G1.1); **BM-3 optimum stays cap-bound INCOMPLETE (G1.2, `COLLECTION-GAP`)**; R7 and R1 (High) untouched, non-downgradable; no status set here (NEU-906 via `LINK-4`). Whether the BM-4 decay/relapse aggregates `support`/`contradict`/are `insufficient` for H-F2, and whether BM-3 is carried `incomplete`, is the AI reviewers' call (`05_…`) and NEU-906's adjudication.
