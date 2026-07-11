# Batch Allocation, Caps & Infeasibility Routing

**Task:** NEU-900 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-899 (`../traceability/`) + NEU-897 (`../`).
This file allocates the five selected journeys (`00_…`, `01_…`) into two **zero-overlap, independently shippable** execution batches, proves the per-batch and prototype caps, and defines the rule that would route the suite back for scope revision rather than silently expanding a batch (acceptance scenario 4). It **allocates**, it runs nothing.

---

## 1. The two batches

| Batch id | Scope (charter) | Downstream owner | Cap | Prototype rule |
| --- | --- | --- | --- | --- |
| **`BATCH-BASELINE`** | Baseline, prerequisite, motivation, or exclusion-boundary journeys. | **NEU-904** (SUB-7) — run the bounded baseline & boundary journey batch. | ≤ 3 journeys | **No targeted prototype permitted.** |
| **`BATCH-FAILURE`** | Product-critical-failure or evidence-conflict journeys. | **NEU-905** (SUB-8) — run the bounded failure & evidence-conflict journey batch. | ≤ 3 journeys | **≤ 1 targeted prototype**, only with a documented why-lower-fidelity-is-insufficient rationale. |

The batches are **disjoint**: every journey belongs to exactly one batch, and no BM cell is covered in both (verified in `00_…` §3). The two batches are independently shippable — NEU-904 and NEU-905 can execute in parallel with no cross-batch dependency, because their journeys share no cell, no vehicle instance, and no observation record.

## 2. Allocation & rationale

### `BATCH-BASELINE` → NEU-904 (2 journeys, ≤ 3 ✔)

| Journey | Cells | Why baseline-batch |
| --- | --- | --- |
| **JNY-B1** | BM-2, BM-8 | Baseline healthy-path retention + the D0/E0 measurement-feasibility state — the definition of a baseline/measurement journey. |
| **JNY-B2** | BM-6 | Primary axis is learner **motivation** (B1 rating / M1) and adherence — the "motivation" journey the baseline batch is scoped to hold. It exercises FM5/X3 but its selection character is motivation, and it is the boundary-respecting probe (EX3/BX-3 is its dominant guard). |

*Forced-allocation note.* BM-6 must sit in `BATCH-BASELINE`: were it moved to `BATCH-FAILURE`, that batch would hold four journeys (JNY-F1, F2, F3 + BM-6) and breach the ≤ 3 cap. The charter's inclusion of "motivation" journeys in the baseline batch is exactly the slot BM-6 fills; this is a determined allocation, not a discretionary one.

### `BATCH-FAILURE` → NEU-905 (3 journeys, ≤ 3 ✔)

| Journey | Cells | Why failure-batch |
| --- | --- | --- |
| **JNY-F1** | BM-1, BM-7 | Product-critical failure FM2 (shallow schema) under conflicts X1/X2 — a failure/conflict journey. |
| **JNY-F2** | BM-3, BM-4 | Product-critical failures FM3 (mis-scheduled review) + FM1 (decay/relapse) under X1 — a failure journey. |
| **JNY-F3** | BM-5 | Product-critical failure FM4 (false confidence from AI grading) under conflict X4 — a failure/conflict journey. |

## 3. Prototype allowance & reservation

- **Suite maximum:** 1 targeted prototype, `BATCH-FAILURE` only.
- **Used at selection exit:** **0.** Every journey's smallest sufficient vehicle is an existing MCP flow or a paper/WoZ artifact (`01_…`); none *currently* requires prototype fidelity.
- **Reserved slot:** the single permissible prototype is pre-designated to **JNY-F3** (AI grading over-validation) — the journey most likely to need higher fidelity, because isolating FM4 may require holding the grader's prompt/context fixed beyond what the live `submit_answer` path exposes.
- **Authorization gate (must all hold before the reserved prototype is built, during NEU-905):**
  1. the existing `submit_answer` vehicle demonstrably **cannot isolate** FM4 from confounds during execution; **and**
  2. no paper/WoZ artifact can substitute (grading is a runtime behavior); **and**
  3. a written **why-lower-fidelity-is-insufficient** rationale is recorded at build time; **and**
  4. the prototype creates **no** UI, architecture, provider, or production commitment (EX4) and is a throwaway grading harness exposing only the quality-derivation step.
- If a second journey were later found to need a prototype, the suite would **exceed** the allowance and must route back (§4), not build a second prototype.

## 4. Caps proof & infeasibility-routing rule (acceptance scenario 4)

**Caps at selection exit:**

| Constraint | Limit | Actual | Pass |
| --- | --- | --- | --- |
| Total journeys | ≤ 6 | 5 | ✔ |
| `BATCH-BASELINE` journeys | ≤ 3 | 2 | ✔ |
| `BATCH-FAILURE` journeys | ≤ 3 | 3 | ✔ |
| Targeted prototypes (whole suite) | ≤ 1 | 0 (1 reserved) | ✔ |
| Uncovered material cells | 0 | 0 | ✔ |
| Cross-batch cell overlap | 0 | 0 | ✔ |

**This suite is feasible within bounds** — full material coverage was achieved with 5 journeys and 0 prototypes, so **no scope-revision routing is triggered**. The routing rule is nonetheless fixed, so a future re-selection cannot silently expand a batch:

> **Routing rule.** If, at any selection or re-selection, the material matrix (`BM-1…BM-8`, or any cell added by NEU-898 upstream) **cannot** be fully covered by ≤ 6 journeys across the two ≤ 3 batches using ≤ 1 targeted prototype, the suite is declared **INCOMPLETE** and routed back to NEU-898/NEU-887 for scope revision. It is **never** resolved by (a) adding a fourth journey to a batch, (b) building a second prototype, (c) dropping or downgrading a material cell — least of all one carrying a High risk (R1–R5), which is non-downgradable (NEU-898 guardrail G-a; NEU-899 `OC-7`), or (d) relabeling a boundary wall (`BX-*`) as covered.

**Hand-off.** `BATCH-BASELINE` → NEU-904 and `BATCH-FAILURE` → NEU-905 execute the journeys under the protocols in `03_…` (creator dogfooding) and `04_…` (independent AI review). Neither batch sets a BM-cell status; statuses are adjudicated by NEU-906 (`LINK-4`). The measurement contract that would make BM-8/BM-5 scores authoritative is SUB-4's (`INC-2`).
