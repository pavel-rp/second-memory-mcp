# Bidirectional Walk Index

**Task:** NEU-899 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-897 (`../`).
This file makes every trace **followable in both directions** (acceptance scenario 1). §1 is the **forward** index (element → evidence). §2 is the **reverse** index (evidence item → element). §3 is the **reverse-anchor** index that lets a reviewer start from an intended learner behavior, a metric/signal, a decision rule, or a rejected alternative and reach the governing element. Every entry restates a link already present in NEU-898; no new link is invented. The edges are the closed `REL:*` set from `00_…` §3, so each direction is the mechanical inverse of the other.

---

## 1. Forward index (element → evidence · class · limitation)

Consolidated from the trace records (`01_…`). Read: "to check element X's support, go here."

| Element | Evidence source(s) | Class | Structural limitation carried |
| --- | --- | --- | --- |
| J1, J3 | RQ6 F6.1 (S1) | 1 | Community documentation, not a measured motivation study. |
| J2 | RQ6 F6.1 + RQ2 F2.1–F2.3 | 1 | DP-specific worked-example evidence is gap G2.2. |
| J4 | RQ1 F1.1–F1.3 + RQ6 F6.2 | 1 | J4-ranking is class-7 (G6.1). |
| M1–M4 | RQ6 §class-7 (+ F6.1/F6.2 mechanism) | 1/7 | Motivation weighting is class-7; not a finding. |
| FM1 | RQ6 F6.2 + RQ1 F1.1–F1.3 | 1 | Population-general; dominance is class-7 (G3.1/G6.1). |
| FM2 | RQ2 F2.1–F2.3 + X1 | 1 | Novice-biased; expertise-reversal unverified (X2, G2.1). |
| FM3 | RQ1 G1.2 + repo F1.4 | 1 | Cap-bound; optimal hierarchical schedule unanswered. |
| FM4 | RQ5 F5.1–F5.3 | 1 + existing-project | DP-domain grading reliability unmeasured (G5.1). |
| FM5 | RQ6 §class-7 | 7 (n/a) | No class-1–6 evidence bounds prevalence. |
| P1 | RQ1 F1.1–F1.3 vs RQ3 F3.1 | 1 | Direction, not a quantified target (G1.1). |
| P2 | RQ1 vs RQ2 + X1 + G2.3 | 1 | Interaction untested (G2.3). |
| P3 | taxonomy + RQ5 F5.1–F5.3 | discipline (DEC2) | — |
| P4 | RQ4 F4.1–F4.3 | 2 | Capability ≠ validity; feasibility per-signal. |
| P5 | RQ4 F4.4 + method §5 | 2 | Aggregate-only via OUT-4 gate. |
| P6 | OUT-4 discipline | discipline (DEC3) | — |
| D1 | RQ3 F3.1–F3.2 (+F3.3) | 1/tool-doc | Empty niche ≠ demand; confirmation class-7. |
| D2 | RQ2 F2.1–F2.3 + RQ1 | 1 | Literatures disjoint; interaction untested (G2.3). |
| D3 | RQ5 F5.1–F5.3 + taxonomy | 1 | Value to learners is class-7. |
| D4 | RQ4 F4.1–F4.3 | 2 | Capability-only; product-fit unproven. |
| R1 | G1.1 + X1 | 1 | **High**; DP transfer unmeasured. |
| R2 | X1 + G2.3 | 1 | **High**; in-domain schema efficacy unmeasured. |
| R3 | RQ5 F5.1–F5.3 + G5.1 | 1 | **High**; grading reliability unmeasured. |
| R4 | RQ3 F3.3 | 1 | **High**; class-7 demand question. |
| R5 | RQ6 §class-7 | 7 (n/a) | **High**; adherence unbounded. |
| R6 | RQ4 F4.1–F4.3 + G4.2 | 2 | Medium; per-signal feasibility. |
| R7 | G1.2 | 1 | Medium; cap-bound. |
| R8 | NEU-897 assumption | — | Medium; capability-only. |
| DEC1 | Charter §2 | product-scope decision | Not an evidence finding. |
| DEC2–DEC5 | OUT-4 discipline / NEU-898 in-scope | discipline/process decisions | — |
| RA1 | X1 + RQ2 F2.1–F2.3 + G2.3 | 1 | Would leave FM2 uncovered. |
| RA2 | RQ6 F6.1 + X3 | 1 | Culture diverges from evidence. |
| RA3 | EX2 + RQ3 F3.3 | 1 | No demand evidence for either scope. |
| RA4 | X2 + RQ2 | 1 | Evidence is on competent/adult learners. |
| RA5 | RQ5 F5.1–F5.3 + G5.1 | 1 | DP-domain reliability unmeasured. |
| RA6 | EX3 + RQ3 F3.3 | 1 | Unsupported market claim. |
| EX1, EX2 | Charter §2 / DEC1 | product decision | — |
| EX3 | taxonomy #3 + RQ3 F3.3 | product decision | No class-7 evidence exists. |
| EX4 | NEU-898 out-of-scope | product decision | — |
| EX5 | NEU-897 §1 caps | product decision | — |
| EX6 | RQ4 F4.4 | product decision (privacy) | — |
| BM-1 | RQ2 F2.1–F2.3 + X1 | 1 | G1.1, G2.3. |
| BM-2, BM-4 | RQ1 F1.1–F1.3 + RQ6 F6.2 | 1 | G1.1. |
| BM-3 | RQ1 G1.2 | 1 | Cap-bound. |
| BM-5 | RQ5 F5.1–F5.3 + X4 | 1 | G5.1. |
| BM-6 | RQ6 F6.1 + X3 | 1 | G6.1 (adherence). |
| BM-7 | RQ2 X2 + G2.1 | 1 | Expertise-reversal unverified. |
| BM-8 | RQ4 F4.1–F4.3 + G4.2 | 2 | Signal not yet computable. |
| BX-1…BX-5 | EX1/EX2/EX3/EX4/EX6 | product decision | Walls, not coverage targets. |

## 2. Reverse index (evidence item → element)

Every NEU-897 finding / conflict / gap → the element(s) that consume it. This is the inverse of §1 and reconciles 1:1 with NEU-898 `04_…` §1 (the reconciliation is audited in `04_…` OC-2). Read: "this evidence is cited by / this evidence, if it moved, would change…"

### 2.1 Findings

| NEU-897 finding | Consumed by |
| --- | --- |
| F1.1–F1.3 retrieval+spacing retention/transfer | P1, P2, J4, FM1, BM-2, BM-4, R1, R2, D2 |
| F1.4 repo pedagogy audit (thresholds diverge) | FM3, R7 |
| F2.1–F2.3 worked examples / subgoals / schema | P2, D2, J2, FM2, BM-1, BM-7, RA1, RA4 |
| F3.1–F3.2 CP platforms volume, SR niche | D1, RA2, BM-6 (context) |
| F3.3 uncrowded niche ≠ demand | D1, D3, EX3, R4, RA3, RA6 |
| F4.1–F4.3 per-attempt data; `averageQuality` uncomputed | P4, D4, R6, BM-8 |
| F4.4 responses unredacted in logs | P5, EX6 |
| F5.1–F5.3 LLM-judge bias; over-validation | P3, D3, FM4, R3, RA5, BM-5 |
| F6.1 documented jobs, grind culture | J1–J3, RA2, BM-6 |
| F6.2 population-general forgetting | FM1, J4, BM-2, BM-4 |
| F6.3 positioning frame; "no demand evidence" | D1, EX3, R4 |

### 2.2 Conflicts (preserved, not adjudicated — NEU-906 owns adjudication)

| NEU-897 conflict | Carried into |
| --- | --- |
| X1 retention ≠ transfer | P2, FM2, R2, BM-1/2/4 |
| X2 expertise-reversal | FM2, RA4, BM-7 |
| X3 documented culture vs evidence practice | RA2, FM5 (context), BM-6 |
| X4 AI-judge transfer to DP grading | FM4, R3, BM-5 |

### 2.3 Gaps (each keeps its element PROVISIONAL/INCOMPLETE/UNRESOLVED — see `03_…`)

| NEU-897 gap | Carried into | State it forces |
| --- | --- | --- |
| G1.1 DP-domain retrieval/spacing effect | R1, BM-1/2/4, P1 | PROVISIONAL (R1 UNRESOLVED via INC-1) |
| G1.2 hierarchical spacing schedule | FM3, R7, BM-3 | INCOMPLETE (EX5) |
| G2.1 expertise-reversal boundary | FM2, RA4, BM-7 | PROVISIONAL/INCOMPLETE |
| G2.2 worked-example evidence for DP | J2, D2 | PROVISIONAL |
| G2.3 retrieval × worked-example interaction | P2, D2, BM-1 | PROVISIONAL |
| G3.1 no outcome data for CP methods | R1 (context), FM1 | PROVISIONAL |
| G3.2 demand for SR-for-CP unmeasured | R4, EX3, D1 | UNRESOLVED (class-7) |
| G4.1 `time_spent_ms` reliability | R6 | UNRESOLVED (OUT-4 gate, INC-2) |
| G4.2 no per-DP-pattern mastery signal | R6, BM-8 | UNRESOLVED (INC-2) |
| G5.1 LLM grading reliability on DP | R3, FM4, BM-5 | UNRESOLVED (INC-3) |
| G5.2 trustworthy-AI-grading measurement design | (routed → SUB-4/measurement-contract) | UNRESOLVED (routed) |
| G6.1 no direct jobs/motivations study | M1–M4, FM5, R5, BM-6 | PROVISIONAL/INCOMPLETE |
| G6.2 persona/benchmark-journey construction | `../product-model/03_…` (state-level) | discharged at state level; journey → NEU-900 |

## 3. Reverse-anchor index (behavior / metric / decision rule / rejected alternative → element)

The other reverse handle acceptance scenario 1 requires: start from *what the product is trying to do or decide* and reach the governing element and thence its evidence (via §1).

| Anchor kind | Anchor | Governing element(s) |
| --- | --- | --- |
| **Intended learner behavior** | Retain & transfer over months | J4, P1, FM1 |
| | Form transferable pattern schemas | J2, P2, FM2, BM-1 |
| | Adhere to scheduled review | M4, FM5, R5, BM-6 |
| | Recover a decayed pattern | BM-4, FM1 |
| **Metric / signal** | Per-attempt pass/fail/quality/time persisted | P4, D4, R6, BM-8 (via F4.1–F4.3) |
| | `averageQuality` (declared, uncomputed) | P4, R6, CAND-15 → **UNRESOLVED**, INC-2 |
| | `time_spent_ms` reliability | R6, CAND-18 → **UNRESOLVED**, INC-2 (OUT-4 gate) |
| | Per-DP-pattern mastery signal | R6, BM-8, CAND-17 → **UNRESOLVED**, INC-2 |
| | AI-grading reliability score | FM4, R3, BM-5 → **UNRESOLVED**, INC-3 |
| **Decision rule** | Any threshold / schedule / decision rule / revision trigger | **UNRESOLVED** — owned by SUB-4 (measurement contracts); represented by INC-1/2/3, never invented here |
| | Fix prerequisite boundary & audience | DEC1 (SETTLED) |
| | Evidence-label + provisional-by-default | DEC2/P3 (SETTLED) |
| | Propagate gaps as provisional | DEC3/P6 (SETTLED) |
| **Rejected alternative** | Flashcards-for-DP | RA1 (rejected; ← X1, G2.3) |
| | Volume/grind primary model | RA2 (rejected; ← X3) |
| | General all-algorithms breadth | RA3 (rejected; ← EX2, F3.3) |
| | Lower prerequisite to beginners | RA4 (rejected; ← X2) |
| | Trust AI grading as signal of record | RA5 (rejected; ← F5.1–F5.3, G5.1) |
| | Claim niche as validated market | RA6 (rejected; ← EX3, F3.3) |

**Walkability guarantee.** From any anchor above → the element → (via §1) its evidence + class + limitation; and from any evidence item (§2) → the element → (via `01_…`) its reverse anchor. No step requires undocumented context, satisfying acceptance scenario 1 in both directions.
