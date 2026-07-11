# Benchmark-State Coverage Matrix

**Task:** NEU-898 · **Compiled:** 2026-07-11 · **Sole evidence source:** NEU-897 package (`../`).
An **auditable** coverage model of the learner states a downstream benchmark suite (NEU-900) must be able to cover. This file **enumerates states, not journeys** — it selects no benchmark journey suite (out of scope; EX4). Each material cell is explicit and traceable; the full cartesian product is pruned by the materiality rule (`02_…`) with the pruning recorded.

---

## 1. The six axes

| Axis | Values |
| --- | --- |
| **A — Prerequisite position** | `A0` below boundary (absolute beginner — *excluded*, EX1); `A1` at boundary (competent programmer, no DP yet); `A2` within domain, partial (some DP patterns, gaps); `A3` breadth-seeking (consolidating many patterns for CP breadth); `A4` orthogonal (general all-algorithms — *excluded*, EX2). |
| **B — Learner job / motivation** | `B1` rating (J1 / M1); `B2` pattern mastery (J2 / M3); `B3` interview prep (J3 / M2); `B4` durable mastery (J4 / M3–M4). Motivation weighting is provisional (M1–M4). |
| **C — Journey stage** | `C1` encounter/onboarding; `C2` first-pattern acquisition; `C3` spaced consolidation; `C4` breadth expansion; `C5` retention-under-decay / relapse. |
| **D — Product-critical failure mode** | `D0` none (baseline); `D1` forgetting (FM1); `D2` shallow schema (FM2); `D3` mis-scheduled review (FM3); `D4` false confidence from AI grading (FM4); `D5` adherence collapse (FM5). |
| **E — Evidence-conflict state** | `E0` none; `E1` retention≠transfer (X1); `E2` expertise-reversal (X2); `E3` documented-culture vs evidence-practice (X3); `E4` AI-judge transfer (X4). |
| **F — Exclusion boundary** | `F0` interior (in-audience, in-scope); `F1` near-EX1 (beginner); `F2` near-EX2 (general algorithms); `F3` near-EX3 (market/validation claim); `F4` near-EX4 (downstream design decision); `F6` near-EX6 (raw-log evidence). |

## 2. Materiality filter for cells (why this is not a cartesian dump)

The raw grid is 5×4×5×6×5×6 = 9,000 cells. Per the materiality rule (`02_…`), a cell is a **material coverage target** only when **all** hold:

1. **A ∈ {A1,A2,A3}** — in-audience (A0/A4 are excluded regions, §5);
2. **F = F0** — interior (a cell on an exclusion boundary is a *wall to respect*, not a coverage target — enumerated separately in §4);
3. it exercises **a product-critical failure mode (D1–D5) or a documented conflict (E1–E4)** — a `D0/E0` baseline cell is *supporting*, not a hard coverage target; and
4. the state is **reachable** for the target learner given the fixed prerequisite boundary.

This yields the enumerated material cells **BM-1…BM-8** (§3). Every failure mode FM1–FM5 and every conflict X1–X4 appears in at least one BM cell (coverage audit, §6). Cells failing (1) or (2) are recorded as exclusion-boundary states (§4); cells failing (3) are the non-material baseline region (§5).

## 3. Material benchmark-state cells (BM-*)

Each row is a concrete, reachable learner state. Coordinates are `A·B·C·D·E·F`. **Status** flags provisional/incomplete inheritance from the gap it sits on.

| ID | State (one line) | A·B·C·D·E·F | Why material | Trace | Status |
| --- | --- | --- | --- | --- | --- |
| **BM-1** | Competent learner meets their **first DP pattern**; risk is memorizing the surface solution instead of forming a transferable schema. | A1·B4·C2·D2·E1·F0 | Core thesis cell: tests transfer, not recall (P2). FM2 + X1. | RQ2 F2.1–F2.3; RQ1 X1 | **Provisional** — DP-domain transfer unmeasured (G1.1, G2.3). |
| **BM-2** | Learner has acquired a pattern; **spaced retrieval must hold it** over weeks. | A1·B4·C3·D1·E1·F0 | Home cell of the retention mechanism (P1). FM1. | RQ1 F1.1–F1.3; RQ6 F6.2 | **Provisional** — effect size in DP is analogy-only (G1.1). |
| **BM-3** | Learner consolidates **multiple interdependent patterns**; review scheduling for hierarchical, multi-month dependencies is uncertain. | A2·B2·C4·D3·E0·F0 | FM3; scheduling for hierarchical skills. | RQ1 G1.2 | **Incomplete** — optimal schedule not answerable within NEU-897 caps (EX5). |
| **BM-4** | After a **long gap**, a previously mastered pattern has decayed; relapse/re-learning state. | A2·B4·C5·D1·E1·F0 | The decay/relapse state J4 exists to serve. FM1. | RQ1 F1.1–F1.3; RQ6 F6.2 | **Provisional** (G1.1). |
| **BM-5** | Learner submits a **wrong/shallow answer that AI grading over-validates**, producing false confidence. | A1·B3·C2·D4·E4·F0 | FM4 corrupts the mastery signal; R3 (High). Over-validation strikes hard cases. | RQ5 F5.1–F5.3; X4 | **Provisional** — DP-domain grading reliability unmeasured (G5.1). |
| **BM-6** | **Rating-driven** learner grinds volume for contest score and **abandons spaced review**; documented culture diverges from evidence practice. | A3·B1·C4·D5·E3·F0 | FM5 (adherence) + X3; R5 (High). | RQ6 F6.1; X3 | **Gap** — adherence prevalence is class-7 (G6.1); non-downgradable (R5). |
| **BM-7** | **Already-competent** learner studies worked examples for a harder pattern; the novice-derived worked-example benefit may not hold (possible expertise reversal). | A2·B2·C2·D2·E2·F0 | FM2 under X2; tests the expertise-reversal boundary. | RQ2 X2; G2.1 | **Provisional/incomplete** — expertise-reversal boundary unverified (G2.1). |
| **BM-8** | Product wants a **per-pattern mastery signal** to score any of the above, but the schema does not compute one today. | A2·B4·C3·D0·E0·F0 | Measurement-feasibility state gating BM-1…BM-7 scoring; R6. | RQ4 F4.1–F4.3; G4.2 | **Provisional** — signal not yet computable (G4.2); no external telemetry decided here (EX4). |

## 4. Exclusion-boundary states (walls — recorded, not coverage targets)

These sit on axis-F boundaries or excluded axis-A positions. They are **material as boundaries** (they define what the product and its benchmark suite must *not* silently absorb) and **non-material as coverage targets**. A benchmark suite should treat them as out-of-scope guards.

| ID | Boundary state | Coordinate | Wall / rule |
| --- | --- | --- | --- |
| **BX-1** | Absolute beginner needs language/first-algorithm instruction. | A0·—·C1·—·—·F1 | **EX1** — below prerequisite boundary; out of audience. |
| **BX-2** | Learner wants coverage across *all* algorithm topics, not domain depth. | A4·—·—·—·—·F2 | **EX2** — general all-algorithms product excluded. |
| **BX-3** | A cell is used to assert *market/demand/WTP or external validation*. | —·—·—·—·—·F3 | **EX3** — prohibited; only class-7 evidence could support it, and it does not exist. |
| **BX-4** | A cell is used to *fix* a pedagogy/curriculum/UI/architecture/provider/telemetry design. | —·—·—·—·—·F4 | **EX4** — downstream chapter scope; product foundation does not decide it. |
| **BX-5** | A cell references *raw learner log payloads*. | —·—·—·—·—·F6 | **EX6 / P5** — aggregate-only provenance through the OUT-4 privacy gate. |

## 5. Non-material region (baseline, explicit)

Cells with **A ∈ {A1,A2,A3}, F0, and D0·E0** (in-audience, interior, no failure mode, no conflict) are **supporting baseline states**, not hard coverage targets — a benchmark suite may include a healthy-path baseline but omitting a specific D0·E0 cell changes no product-foundation element (materiality rule fails condition 3). They are recorded here as a region, not enumerated cell-by-cell, precisely because none is individually material. This pruning is the reason §3 lists 8 cells rather than thousands; the pruning rule (§2) makes the omission auditable.

## 6. Coverage audit (every failure mode & conflict is covered)

| Must-cover item | Covered by | 
| --- | --- |
| FM1 forgetting | BM-2, BM-4 |
| FM2 shallow schema | BM-1, BM-7 |
| FM3 mis-scheduled review | BM-3 |
| FM4 false confidence (AI grading) | BM-5 |
| FM5 adherence collapse | BM-6 |
| X1 retention≠transfer | BM-1, BM-2, BM-4 |
| X2 expertise-reversal | BM-7 |
| X3 culture vs evidence practice | BM-6 |
| X4 AI-judge transfer | BM-5 |
| Measurement feasibility (R6) | BM-8 |
| EX1/EX2/EX3/EX4/EX6 walls | BX-1…BX-5 |

**Result:** all five product-critical failure modes, all four NEU-897 conflicts, the measurement-feasibility constraint, and all five exclusion walls appear in an explicit, traced cell. Gaps G1.1, G1.2, G2.1, G2.3, G4.2, G5.1, G6.1 each keep their dependent cell **provisional/incomplete** (status column), so no cell is asserted as settled. Journey-suite selection and any scoring protocol are **not** performed here (routed to NEU-900).
