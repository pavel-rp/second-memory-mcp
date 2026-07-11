# JNY-B1 — Observation Records (`OBS-*`)

**Task:** NEU-904 · **Journey:** JNY-B1 (Spaced-retention baseline BM-2 + measurement-feasibility inspection BM-8) · **Hypothesis:** H-B1 · **Contracts:** MC-1, MC-6 (inspect), MC-9 (all frozen `v1.0`).
Records follow the fixed `OBS-*` schema (`../benchmark-suite/03_creator-dogfooding-protocol.md` §1), are **append-only**, and are **payload-free** (`PLA-1…3`). This file records **raw evidence only** — no BM-cell status, no metric, no threshold (NEU-906 owns adjudication via `LINK-4`).

**Split by evidence class (see `README.md` disclosure).** JNY-B1 has two halves with different vehicles and therefore different honest evidence classes:
- **BM-8 measurement-feasibility inspection** — vehicle is *static schema/code inspection*; result is **class-2 `[code-evidence]`**, operator-independent. **Executed by the NEU-904 agent** (the protocol's `inspector` role, discharged truthfully as code-evidence — **not** relabeled as class-3 creator dogfooding).
- **BM-2 spaced-retention runs** — vehicle is the *live MCP teaching/rolling-session loop* exercised by the human creator as a first-class learner across `≥2` SM-2 spaced intervals; this is inherently **class-3 `[dogfooding]`** and **cannot** be produced by an agent. **Recorded INCOMPLETE / pending-creator** (§ below), per the incomplete-run mechanism (`../benchmark-suite/04_ai-review-independence-protocol.md` §4; acceptance scenario 5).

---

## Part A — BM-8 measurement-feasibility inspection (EXECUTED, class-2 `[code-evidence]`)

### `OBS-JNY-B1#1` — per-attempt & session signals inspection

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-B1#1` |
| **`OBS-journey`** | JNY-B1 → BM-8 (per-DP-pattern mastery signal wanted but not computed today), R6 (signal-feasibility gap). |
| **`OBS-datetime`** | 2026-07-11T14:05Z (single-point static inspection). |
| **`OBS-vehicle`** | Static schema/source inspection of Second Memory MCP (commit base `origin/develop 3714e43`). **No live MCP flow.** |
| **`OBS-prereq-position`** | `—` (inspection, no learner trajectory; BX-1/BX-2 not applicable — no A-axis exercised). |
| **`OBS-content-ref`** | `src/infrastructure/db/schema.ts` (tables `sessionQuestionAttempts`, session tables); `src/orchestration/learner-context-workflows.ts`; `src/domain/services/session-analyzer.ts`; `src/server/session-lifecycle-tools.ts`. No `session_id` / `chunk_ids` — no session was run. |
| **`OBS-creator-role`** | `inspector` (schema inspection for BM-8) — **discharged by the NEU-904 agent as class-2 code-evidence**, not as class-3 dogfooding. |
| **`OBS-held-constant`** | Target cell BM-8; commit base `3714e43`; inspection scope = "is a per-DP-pattern mastery signal persisted or computed?". |
| **`OBS-varied`** | Signal under inspection = the **quality / pass-fail** family (this record). |
| **`OBS-prompts`** | `—` (no learner prompts; static inspection). |
| **`OBS-server-signals`** | Read from source, not from a live response: `sessionQuestionAttempts.quality` = nullable integer (schema.ts:208; "teaching: agent-provided, assessment: server-derived pass=4/fail=2"); `agentQuality` smallint 0-5 nullable (:209); `timeSpentMs` integer NOT NULL (:211). SR-scheduler state `consecutiveFailures` (:62, "quality < 3"). |
| **`OBS-failure-signal`** | For **BM-8 / R6 signal-feasibility gap**: **`present`** — the persisted quality signals are per-*attempt* (nullable, heterogeneously sourced) and none is keyed to a DP pattern; no per-DP-pattern mastery estimate is persisted. Rationale grounded in `OBS-server-signals` above. |
| **`OBS-boundary-check`** | ✅ No `BX-*` crossed: DP-only scope; no market claim; **no raw-log payload** read (structure only); capability inspection did not compute or invent a mastery threshold (respects `INC-2`/SUB-4 authority, `OC-5`). |
| **`OBS-fidelity-hit`** | "BM-8 half is *capability inspection only*: whether a signal is computable ≠ whether it is a **validated** mastery signal" (`../benchmark-suite/01_journey-vehicles-and-fidelity.md` JNY-B1). Owned by SUB-4 (`INC-2`, UNRESOLVED). |
| **`OBS-creator-conclusion`** | `—` **SEALED / pending-creator.** No class-3 creator conclusion is written by the agent (evidence-integrity rule). The AI reviews (`02_…`) reviewed the class-2 evidence with **no** creator conclusion exposed. |

### `OBS-JNY-B1#2` — aggregate / per-pattern signal inspection (varied dimension = signal under inspection)

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-B1#2` (repeat run; per `03_…` §2 the varied dimension for the inspection half is **the signal under inspection**). |
| **`OBS-journey`** | JNY-B1 → BM-8, R6. |
| **`OBS-datetime`** | 2026-07-11T14:12Z. |
| **`OBS-vehicle`** | Static schema/source inspection (commit base `3714e43`). |
| **`OBS-prereq-position`** | `—`. |
| **`OBS-content-ref`** | `src/orchestration/learner-context-workflows.ts:170`; `src/domain/services/session-analyzer.ts:63`; `src/server/session-lifecycle-tools.ts:331-344`. |
| **`OBS-creator-role`** | `inspector` (agent, class-2 code-evidence). |
| **`OBS-held-constant`** | Target cell BM-8; commit base; inspection question. |
| **`OBS-varied`** | Signal under inspection = the **`averageQuality` aggregate** and **per-DP-pattern** dimension. |
| **`OBS-prompts`** | `—`. |
| **`OBS-server-signals`** | `averageQuality` is **hardcoded `0`** on the learner-context surface (`learner-context-workflows.ts:170`, inline TODO "not yet computed — quality lives in sessionQuestionAttempts, not sessionChunks"); it **is** derivable as a per-**session** mean elsewhere (`session-analyzer.ts:63`; `session-lifecycle-tools.ts:331-344` aggregates `totalQuality/allAttempts`) — but that is a per-session aggregate, **not** a per-DP-pattern signal. No schema column or computed field keyed to a DP pattern was found. |
| **`OBS-failure-signal`** | **BM-8 / R6: `present`** — even where an aggregate exists it is per-session, and the learner-context surface exposes a **stub `0`** (the exact P4 "measure only what is computable" trap MC-7 flags). No per-DP-pattern mastery signal is computed today. |
| **`OBS-boundary-check`** | ✅ No `BX-*` crossed; no threshold invented; `INC-2`/SUB-4 authority respected. |
| **`OBS-fidelity-hit`** | Capability-only; presenting the stubbed `0` as a real signal is explicitly forbidden (MC-7 `COLLECTION-GAP`). Validity/threshold owned by SUB-4 (`INC-2`). |
| **`OBS-creator-conclusion`** | `—` SEALED / pending-creator (as `#1`). |

**Repeat-run sufficiency (`03_…` §2):** two inspection runs, core conditions held constant (cell BM-8, commit base, question), **one** dimension varied (the signal family under inspection) — quality/pass-fail (`#1`) → aggregate/per-pattern (`#2`). Another operator given these records can re-open the same source at `3714e43` and reproduce the identical `OBS-server-signals`. Result is **deterministic** (source facts, `DET`), no `GRADER-VAR`.

---

## Part B — BM-2 spaced-retention runs (INCOMPLETE / pending-creator)

Per `../benchmark-suite/04_…` §4, a journey result is **`incomplete`** when "the vehicle could not exercise the cell." Both required BM-2 retention runs are carried as incomplete — **not** as coverage.

| `OBS-run-id` (reserved) | Target | Required vehicle | Why INCOMPLETE / pending-creator |
| --- | --- | --- | --- |
| `JNY-B1#R-BM2-1` | BM-2 (spaced retrieval holds a learned DP pattern over `≥1` re-review) | Live MCP teaching/rolling-session loop (`start_learning`→`submit_answer`→`teach_next`) over one DP-pattern topic, **class-3 creator dogfooding**, learner role. | (a) The human **creator is AFK** — class-3 dogfooding cannot be authentically produced by an agent (evidence-integrity rule; `../01_evidence-taxonomy.md` class 3 requires "the creator running benchmark journeys as a first-class learner"). (b) The live Second Memory MCP learning tools were **not reachable** in this environment. **Not fabricated.** |
| `JNY-B1#R-BM2-2` | BM-2 second spaced re-review; varied dimension = **elapsed `interval_days`** (read from server, never hardcoded — `03_…` §2). | Same live MCP loop at the next SM-2 interval; separate `OBS-*` record. | Same as above **plus** requires a real spaced gap (weeks-not-months window) that cannot be compressed. Pending-creator. |

**Consequence for the fidelity-limited claim:** the BM-2 retention half — the directional retrieval+spacing signal for `H-B1` / `MC-1` (`PROXY-DIRECTIONAL`) and the R1/`INC-1` DP-transfer proxy (`MC-9`) — has **no executed evidence** in this batch. It remains **UNRESOLVED** with its authoritative artifact pending (`INC-1`, owned by the NEU-900 suite / adjudicated NEU-906), and its creator runs are listed in the pending-creator action list (`05_…` §5). No status is set here.
</content>
