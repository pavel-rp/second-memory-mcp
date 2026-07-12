# JNY-F3 / BM-5 — Evidence Binding to `BATCH-AUTOEVAL` (NEU-903), Journey-Record Layer

**Task:** NEU-905 · **Journey:** JNY-F3 → BM-5 (the learner submits a wrong/shallow answer that AI grading over-validates, producing false confidence — FM4 + X4) · **Hypothesis:** H-F3 · **Contract:** MC-4 (frozen `v1.0`, `PROXY-BOUNDING`).
This file **binds** — it does **not** duplicate — the already-executed NEU-903 `BATCH-AUTOEVAL` (`../autoeval-batch/`) as JNY-F3's evidence per the trace structure, and adds the journey-record layer JNY-F3 requires beyond the eval batch. It sets **no** BM-cell status and invents **no** metric (NEU-906 owns adjudication via `LINK-4`). Payload-free (authored synthetic answers; `PLA-1…3`).

**Why bind, not re-run.** NEU-903 executed exactly the JNY-F3 evaluation: the `submit_answer` grading path's quality-derivation, exercised via the reserved JNY-F3 **minimal grading-harness** (the suite's single ≤1 prototype; gate accounted for in `00_…` §4), across the `ACS-1 v1.0` case set (12 cases: 3 DP patterns × {SHALLOW, WRONG, INCOMPLETE, CONTROL}) under **3 separately-initialized isolated clean-context runs** (`RUN-1/2/3`, all seven `CCR-*` fields each), reading derived `quality`/`action` **from the grader response, never fabricated**. Re-running it would duplicate merged work and risk divergent, non-comparable evidence. NEU-905 therefore **references and reuses** that evidence and adds only (a) this journey-record binding and (b) the class-4 independent AI-review layer (`07_…`).

---

## 1. Bound evidence (source of record: `../autoeval-batch/`)

- **Executed batch:** `BATCH-AUTOEVAL` (NEU-903), committed on develop at `2aaa7d5` (PR #569).
- **Per-case raw results** (`../autoeval-batch/03_per-case-results.md`), reproduced here **as a pointer, read-only** (the source file is authoritative):

| Archetype (hidden from grader) | Oracle | Actual verdict (all 3 runs) | Agreement | Over-validation flag |
| --- | --- | --- | --- | --- |
| SHALLOW ×3 (`-01/-05/-09`) | NOT-pass | FAIL | 3/3 | — (correctly failed) |
| WRONG ×3 (`-02/-06/-10`) | NOT-pass | FAIL | 3/3 | — (correctly failed) |
| **INCOMPLETE ×3 (`-03/-07/-11`)** | NOT-pass | **PASS (q=3)** | 3/3 | **OVER-VALIDATION PRESENT** |
| CONTROL ×3 (`-04/-08/-12`) | pass | PASS (q=5) | 3/3 | n/a (oracle-validity guard OK) |

- **Raw tally:** over-validation flagged on **3 of 9 adversarial cases** — the three **INCOMPLETE** cases (core recurrence correct but base-case/complexity/edge-handling omitted), graded `quality 3` (= pass) **stably across all 3 isolated repeats** (not intermittent `GRADER-VAR`). The 6 SHALLOW/WRONG cases were **correctly failed**; all 3 CONTROLs correctly passed (grader discriminates correct from deficient — the INCOMPLETE PASSes are a genuine signal, not an oracle artifact; `../autoeval-batch/04_…` §2).
- **Reading validity:** bound to the exact grader model/version recorded per run (`MODEL-VERSION-BOUND`, `../autoeval-batch/02_…`); a model change is a new run, not a reinterpretation.

## 2. Journey-record layer (what JNY-F3 adds beyond the eval batch)

The eval batch records per-case grader outputs (class-5 `[automated-eval]`). The JNY-F3 **journey record** situates them against the journey hypothesis and its fidelity boundary, in the `OBS-*`-analogous shape, **without** re-deriving any score:

| Field | Value |
| --- | --- |
| **`OBS-run-id`** | `JNY-F3#BIND` (binding record; the executed run-ids are NEU-903's `RUN-1/2/3`, not re-issued here). |
| **`OBS-journey`** | JNY-F3 → BM-5 (does AI grading over-validate a wrong/shallow DP answer → false confidence? FM4 + X4). |
| **`OBS-vehicle`** | The reserved JNY-F3 **minimal grading-harness** (existing-MCP quality-derivation step in isolation), executed by NEU-903. **No UI/architecture/provider/production commitment** (EX4/BX-4). |
| **`OBS-content-ref`** | `ACS-1 v1.0`: 3 DP-pattern fixtures (KNAP/LCS/COIN) × 4 authored synthetic answer archetypes. Retained in `../autoeval-batch/01_…`. Payload-free (authored, not learner data). |
| **`OBS-server-signals`** | Derived `quality`/`action` read from the grader response (§1 table). Never fabricated. |
| **`OBS-failure-signal`** | For **BM-5 / FM4 over-validation:** **archetype-specific.** `present` for the **INCOMPLETE** archetype (3/3 cases over-validated, stable across repeats — FM4 present *for those items* under the frozen `MC-4` BOUNDING rule). `absent` for the **SHALLOW** and **WRONG** archetypes (correctly failed). **Honest mismatch with H-F3 as literally worded:** H-F3 says "over-validates a deliberately **shallow or wrong** DP answer"; the *shallow/wrong* items were **not** over-validated — only the milder **INCOMPLETE** archetype (correct-core-but-omitted-rigor) was. Whether that satisfies, partially satisfies, or fails H-F3 is **not decided here** — it is the AI reviewers' read (`07_…`) and NEU-906's adjudication. |
| **`OBS-boundary-check`** | ✅ No `BX-*` crossed: authored synthetic answers (no learner payload, `PLA-1…3`); RA5 retained (AI grading **not** the signal of record); no reliability *rate* claimed; no threshold invented beyond the quoted `MC-4` BOUNDING rule (`OC-5`). |
| **`OBS-fidelity-hit`** | Single grader, a few authored items, one grader model/version: this **bounds** classes 4–5 for the specific items; it does **not** establish DP-domain AI-grading **reliability** (G5.1) — that is `INC-3`, owned by OUT-7/NEU-902, adjudicated NEU-906. A green (unflagged) case does not establish reliability; 3 flags do not establish an over-validation *rate*. |
| **`OBS-creator-conclusion`** | `—` No sealed creator conclusion (this is an automated batch, not a creator-dogfooding run). The AI reviews (`07_…`) received the raw archetype × verdict breakdown as neutral facts, with no orchestrator interpretation. |

## 3. Discipline note

- **Class integrity.** The bound evidence is **class-5 `[automated-eval]`** (`../autoeval-batch/`); the review layer NEU-905 adds is **class-4 `[ai-critique]`** (`07_…`). Neither is presented as class-3 dogfooding, class-6 operational-log, or class-7 external-user/expert/market validation. The LLM grader is never called a human learner or expert.
- **No re-adjudication of NEU-903.** NEU-905 does not change any NEU-903 value, oracle, or run condition, and does not re-open its reserved-prototype gate decision (merged, owned by NEU-903).
- **No status set.** BM-5/FM4/R3 stay **UNRESOLVED via `INC-3`**; R3 (High) non-downgradable (`OC-7`). Adjudication is NEU-906's via `LINK-4`.
