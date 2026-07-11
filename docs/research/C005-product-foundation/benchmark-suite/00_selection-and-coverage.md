# Journey Selection & Benchmark-State Coverage

**Task:** NEU-900 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-899 (`../traceability/`) + NEU-897 (`../`).
This file selects the bounded journey suite and proves it covers every material benchmark-state cell. It **selects journeys, it runs none** (execution → NEU-904/NEU-905). Journey records (hypothesis, vehicle, fidelity) are in `01_…`; batch allocation and caps are in `02_…`.

---

## 1. The selection rule (materiality-preserving, cap-bounded)

The benchmark-state matrix (`../product-model/03_…`) enumerated the **material** learner states `BM-1…BM-8` (in-audience, interior, exercising a product-critical failure mode `FM1–FM5` or a documented conflict `X1–X4`, or gating measurement — R6). Selection converts those *states* into the smallest set of *executable journeys* under three hard bounds carried from NEU-900's charter:

1. **Full material coverage.** Every `BM-1…BM-8` maps to ≥1 selected journey; **zero uncovered material cells at selection exit** (§3). Exclusion-boundary walls `BX-1…BX-5` are **not** coverage targets — they are guards a journey must not silently cross (§4).
2. **Suite size ≤ 6 journeys**, split into two zero-overlap batches of **≤ 3 each** (`02_…`).
3. **Smallest sufficient vehicle per journey**, fidelity recorded, **≤ 1 targeted prototype** across the whole suite (`01_…`, `02_…`).

A journey may cover **more than one** BM cell when the cells share a mechanism, a vehicle, and a coherent single hypothesis — this is how eight material cells collapse into a suite of five journeys without dropping a cell. A cell is never covered by *bundling away* its distinct failure mode or conflict: each bundled cell keeps its own row in the coverage audit (§3) and its own status inheritance (`01_…`).

## 2. The selected suite (five journeys)

| Journey | Short name | Cells covered | Batch | Vehicle class | Prototype |
| --- | --- | --- | --- | --- | --- |
| **JNY-B1** | Spaced-retention baseline + measurement feasibility | BM-2, BM-8 | `BATCH-BASELINE` (→ NEU-904) | Existing MCP + schema inspection | No |
| **JNY-B2** | Motivation & adherence under grind culture (boundary-respecting) | BM-6 | `BATCH-BASELINE` (→ NEU-904) | Paper / Wizard-of-Oz | No |
| **JNY-F1** | Schema formation vs surface memorization; expertise-reversal boundary | BM-1, BM-7 | `BATCH-FAILURE` (→ NEU-905) | Existing MCP | No |
| **JNY-F2** | Long-horizon decay/relapse & hierarchical scheduling | BM-3, BM-4 | `BATCH-FAILURE` (→ NEU-905) | Paper / Wizard-of-Oz | No |
| **JNY-F3** | AI grading over-validation / false confidence | BM-5 | `BATCH-FAILURE` (→ NEU-905) | Existing MCP (`submit_answer`) | No (1 reserved) |

**Suite totals:** 5 journeys (≤ 6 ✔); `BATCH-BASELINE` = 2 (≤ 3 ✔); `BATCH-FAILURE` = 3 (≤ 3 ✔); targeted prototypes used = 0 (≤ 1 ✔, one reserved to `BATCH-FAILURE` — `02_…` §3). Full per-journey records are in `01_…`; the batch rationale and caps proof are in `02_…`.

**Why five and not eight (smallest-suite justification).** BM-2+BM-8 share one spaced-consolidation session (you cannot judge retention without inspecting the signals that would score it — R6/BM-8 gates BM-2's scoring), so they are one journey. BM-1+BM-7 are the same FM2 schema-formation mechanism at two prerequisite positions (A1 first pattern; A2 harder pattern) probing the X2 expertise-reversal boundary — one worked-example vehicle. BM-3+BM-4 are the same long-horizon retention problem (decay after a gap; scheduling multi-month dependencies) that only a paper/WoZ timeline can exercise — one vehicle. BM-5 (AI over-validation) is the only cell whose failure lives in the grading path itself and is exercised in isolation. No further bundling is taken because each remaining journey carries a **distinct hypothesis, vehicle, and fidelity boundary**; collapsing them would conflate hypotheses and hide a fidelity caveat.

## 3. Coverage audit — zero uncovered material cells (acceptance scenario 1)

Every material cell maps to exactly one journey in exactly one batch. The failure mode / conflict each cell must exercise (from `../product-model/03_…` §6) is carried so the audit also shows FM/X coverage is preserved.

| Material cell | Coordinate `A·B·C·D·E·F` | Must exercise | Covered by | Batch | Cell status inherited |
| --- | --- | --- | --- | --- | --- |
| **BM-1** | A1·B4·C2·D2·E1·F0 | FM2 + X1 | JNY-F1 | FAILURE | PROVISIONAL (G1.1, G2.3) |
| **BM-2** | A1·B4·C3·D1·E1·F0 | FM1 (+ X1) | JNY-B1 | BASELINE | PROVISIONAL (G1.1) |
| **BM-3** | A2·B2·C4·D3·E0·F0 | FM3 | JNY-F2 | FAILURE | **INCOMPLETE** (G1.2, EX5) |
| **BM-4** | A2·B4·C5·D1·E1·F0 | FM1 + X1 | JNY-F2 | FAILURE | PROVISIONAL (G1.1) |
| **BM-5** | A1·B3·C2·D4·E4·F0 | FM4 + X4 | JNY-F3 | FAILURE | PROVISIONAL (G5.1) → UNRESOLVED `INC-3` |
| **BM-6** | A3·B1·C4·D5·E3·F0 | FM5 + X3 | JNY-B2 | BASELINE | PROVISIONAL/**Gap** (G6.1); R5 High non-downgradable |
| **BM-7** | A2·B2·C2·D2·E2·F0 | FM2 under X2 | JNY-F1 | FAILURE | PROVISIONAL/**INCOMPLETE** (G2.1) |
| **BM-8** | A2·B4·C3·D0·E0·F0 | Measurement feasibility (R6) | JNY-B1 | BASELINE | PROVISIONAL → UNRESOLVED `INC-2` (SUB-4) |

**Result:** 8 / 8 material cells covered; 0 uncovered. Each cell appears under exactly one journey and one batch (no overlap). Inherited FM/X coverage from the matrix is preserved: FM1 (BM-2/BM-4), FM2 (BM-1/BM-7), FM3 (BM-3), FM4 (BM-5), FM5 (BM-6); X1 (BM-1/BM-2/BM-4), X2 (BM-7), X3 (BM-6), X4 (BM-5); measurement feasibility (BM-8). No status is upgraded by selection — every cell keeps the PROVISIONAL/INCOMPLETE/UNRESOLVED state NEU-899 assigned; NEU-900 selects the vehicle that *could* produce evidence, it does not produce or adjudicate it.

## 4. Boundary walls the suite must respect (guards, not targets)

`BX-1…BX-5` are exclusion-boundary walls (`../product-model/03_…` §4). No journey covers them as a target; every journey must refuse to cross them. This is an execution constraint carried into both batches:

| Wall | The journey must not… | Enforced primarily in |
| --- | --- | --- |
| **BX-1** (EX1) | drift into teaching an absolute beginner language/first-algorithm content | JNY-B2, JNY-F1 (prerequisite position is fixed A1–A3, never A0) |
| **BX-2** (EX2) | expand into a general all-algorithms exercise | all journeys (DP domain only) |
| **BX-3** (EX3) | draw any market/demand/WTP or external-validation conclusion from creator/AI evidence | JNY-B2 especially; all journeys (`03_…`, `04_…` evidence-class discipline) |
| **BX-4** (EX4) | fix a pedagogy/curriculum/UI/architecture/provider/telemetry design | all journeys (vehicles are research instruments, not the product experience — CAND-31) |
| **BX-5** (EX6/P5) | export or quote raw learner-log payloads | `03_…` observation record (aggregate-only privacy gate) |

Crossing any wall during execution is a **defect of the run**, recorded and rejected — it cannot count as coverage (mirrors NEU-899 `OC-6`).
