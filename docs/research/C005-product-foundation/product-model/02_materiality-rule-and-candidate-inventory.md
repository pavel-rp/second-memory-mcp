# Feature-Wide Materiality Rule & Complete Candidate Inventory

**Task:** NEU-898 · **Compiled:** 2026-07-11 · **Sole evidence source:** NEU-897 package (`../`).
This file states the one materiality rule the whole feature uses, then inventories **every** research-discovered candidate (requirement, decision, hypothesis, benchmark state, alternative, risk, prototype, evaluation) with its inclusion criterion or a reviewable non-material rationale.

---

## 1. The feature-wide materiality rule (DEC5)

A candidate is **material** when, if it were changed, added, or omitted, it could plausibly change any of:

1. the target-learner definition, a learner **job (J)**, **motivation (M)**, or **failure mode (FM)**;
2. a product **principle (P)**, **differentiator (D)**, or **exclusion (EX)**;
3. a **decision (DEC)** or a material **rejected alternative (RA)**;
4. a **benchmark-state cell (BM-*)** the downstream benchmark suite must cover;
5. an **evidence class or its limitation**, a documented **conflict (X*)**, or an **unresolved gap (G*)**;
6. a **High or Critical risk (R*)**, a binding requirement, or a success metric/threshold.

Otherwise the candidate is **non-material for the product foundation** and carries a one-line reviewable rationale — most often *"routed to a downstream chapter"* (it is material *there*, not here) or *"aggregator/anecdote below the evidence bar"*.

**Binding guardrails on the rule:**
- **G-a (severity floor).** *Changing or omitting a **High** or **Critical** risk can never be classified non-material.* R1–R5 (all High) are therefore permanently material; they may be mitigated or accepted-with-rationale but never dropped or downgraded without new correctly-classed evidence (acceptance scenario 2).
- **G-b (gap propagation).** If a candidate is material **and** depends on an unresolved NEU-897 gap that could change it, its inclusion is recorded as **provisional/incomplete**, not resolved (acceptance scenario 3; P6/DEC3).
- **G-c (no validation laundering).** A candidate may not be included on the basis of an external-user/expert/market claim; only class-1–6 evidence with its limitation, or an explicit class-7 gap marker (`../01_evidence-taxonomy.md` #3).

## 2. Complete candidate inventory (CAND-*)

Every candidate surfaced by NEU-897 (RQ1–RQ6, synthesis, conflict register, gap inventory, caps register) and by the intake framing. **Type** ∈ requirement / decision / hypothesis / benchmark-state / alternative / risk / prototype / evaluation. **Disposition** ∈ Included (→ where) / Provisional / Routed (→ chapter) / Non-material.

### 2.1 Learner & mechanism candidates

| ID | Candidate | Type | Trace | Disposition |
| --- | --- | --- | --- | --- |
| CAND-1 | Retrieval+spacing produce durable retention (mechanism). | hypothesis→requirement | RQ1 F1.1–F1.3 | **Included** → P1, J4, FM1. Material (rule 1,2). |
| CAND-2 | Retention effects exceed transfer effects (retention ≠ transfer). | hypothesis | RQ1 conflict X1 | **Included (provisional)** → P2, FM2, R2. Material (rule 5,6); gap G1.1. |
| CAND-3 | DP-domain effect of retrieval/spacing (vs. math analogy). | hypothesis/gap | RQ1 G1.1 | **Included as gap** → R1 (High), BM axis. Material; provisional (G-b). |
| CAND-4 | Subgoal-labeled worked examples + schema formation for problem-solving. | requirement | RQ2 F2.1–F2.3 | **Included** → P2, D2, J2, FM2. Material. |
| CAND-5 | Expertise-reversal boundary for competent learners. | hypothesis/gap | RQ2 conflict X2, gap G2.1 | **Included as gap** → FM2 limitation, RA4. Provisional (G-b). |
| CAND-6 | Interaction of retrieval scheduling × worked-example study. | hypothesis/gap | RQ2 G2.3 | **Included as gap** → D2 provisional. Material (differentiator rests on it). |
| CAND-7 | Optimal spacing schedule for hierarchical multi-month skills. | requirement/gap | RQ1 G1.2 (incomplete scope) | **Included as incomplete** → FM3, R7. Material; incomplete (EX5 bars new research). |

### 2.2 Landscape & positioning candidates

| ID | Candidate | Type | Trace | Disposition |
| --- | --- | --- | --- | --- |
| CAND-8 | CP platforms optimize volume/contest, no built-in retention model. | benchmark-state/alternative | RQ3 F3.1–F3.2 | **Included** → D1, RA2, FM1 context. Material. |
| CAND-9 | SR-for-CP exists only as niche bolt-on tooling. | alternative | RQ3 F3.2 | **Included** → D1. Material. |
| CAND-10 | "AI tutor + memory graph" niche is uncrowded — **but empty niche ≠ demand**. | hypothesis | RQ3 F3.3 | **Included as provisional differentiator** → D1/D3, EX3, R4 (High), RA6. Material; class-7 gap. |
| CAND-11 | Willingness-to-pay / pricing depth. | requirement | `../04_…` (not declared, question cap) | **Routed** → monetization chapter; also class-7 (EX3). Non-material *here*. |
| CAND-12 | DP curriculum sequencing (which patterns, what order). | decision | `../04_…` (routed) | **Routed** → curriculum chapter (EX4). Non-material here. |
| CAND-13 | UI modality (chat vs IDE vs web). | decision | `../04_…` (routed) | **Routed** → UI chapter (EX4). Non-material here. |

### 2.3 Measurement & signal candidates

| ID | Candidate | Type | Trace | Disposition |
| --- | --- | --- | --- | --- |
| CAND-14 | Per-attempt data (pass/fail, quality, type, time) is persisted. | requirement/evaluation | RQ4 F4.1–F4.3 | **Included** → D4, P4. Material (feasibility). |
| CAND-15 | `averageQuality` declared but uncomputed — verify signals per-name. | risk/requirement | RQ4 F4.2 | **Included** → P4, R6. Material. |
| CAND-16 | Learner response text unredacted in logs → aggregate-only evidence. | requirement | RQ4 F4.4 | **Included** → P5, EX6. Material (privacy). |
| CAND-17 | No per-DP-pattern mastery signal in the schema today. | gap | RQ4 G4.2 | **Included as gap** → R6, BM axis. Provisional; content-model work is downstream (NEU-898+ per NEU-897, realized as R6 here). |
| CAND-18 | Reliability of `time_spent_ms` in real usage. | evaluation/gap | RQ4 G4.1 | **Included as gap** → R6; needs privacy-gated log query (OUT-4). Provisional. |
| CAND-19 | LLM grading carries documented biases; over-validates hard cases. | risk/requirement | RQ5 F5.1–F5.3 | **Included** → P3, D3, FM4, R3 (High), RA5. Material. |
| CAND-20 | DP-domain LLM-grading reliability. | evaluation/gap | RQ5 G5.1 | **Included as gap** → R3, FM4 limitation. Provisional; routed to automated-eval (OUT-7). |
| CAND-21 | Trustworthy-AI-grading measurement design. | requirement/gap | RQ5 G5.2 | **Routed** → measurement-contract chapter (NEU-899+). Material *there*. |

### 2.4 Jobs / motivations / failure-mode candidates

| ID | Candidate | Type | Trace | Disposition |
| --- | --- | --- | --- | --- |
| CAND-22 | Documented jobs: rating, pattern mastery, interview prep. | requirement | RQ6 F6.1 | **Included** → J1–J3. Material. |
| CAND-23 | Population-general forgetting failure mode. | requirement | RQ6 F6.2 | **Included** → FM1, J4. Material. |
| CAND-24 | Documented practice = high-volume grinding (culture vs evidence). | benchmark-state | RQ6 F6.1; conflict X3 | **Included** → RA2, BM conflict axis. Material. |
| CAND-25 | Motivation *distribution/ranking* (mastery vs rating vs interview). | hypothesis | RQ6 §class-7 | **Included as provisional (M1–M4)**; class-7 gap. Material (rule 1); cannot be settled (G-c). |
| CAND-26 | Adherence to scheduled review. | risk/hypothesis | RQ6 §class-7 | **Included** → FM5, R5 (High). Material; class-7 gap, non-downgradable (G-a). |
| CAND-27 | Direct jobs/motivations study of mastery-seeking CP learners. | evaluation/gap | RQ6 G6.1 (incomplete) | **Included as incomplete** → M-provisionality. EX5 bars new research here. |
| CAND-28 | Persona / benchmark-journey construction. | prototype | RQ6 G6.2 | **Included** → this task's `03_…` matrix (partially discharges G6.2 at *state* level, not journey-suite selection, which is NEU-900). |

### 2.5 Cross-cutting discipline candidates

| ID | Candidate | Type | Trace | Disposition |
| --- | --- | --- | --- | --- |
| CAND-29 | Evidence taxonomy + claim discipline (7 classes). | requirement | `../01_evidence-taxonomy.md` | **Included** → P3, DEC2, all traces. Material. |
| CAND-30 | Caps discipline (≤6/≤5/≤3), no silent expansion. | requirement | `../00_…` §1; `../04_…` | **Included** → EX5. Material (bounds this task). |
| CAND-31 | Existing Second Memory workflows as *candidate* research vehicles. | prototype/assumption | NEU-897 assumptions | **Included as provisional** → D4, R8. Material; not a preselected product experience. |
| CAND-32 | Reuse of prior repo research (`docs/research/results/*`) as labeled candidate sources. | evaluation | `../README.md` §Relation | **Included** (provenance inheritance, cutoff 2026-07-07). Non-material as a *new* claim; material as provenance. |

## 3. Non-material register (explicit, reviewable)

Candidates recorded **non-material for the product foundation**, with the one-line reason (all reviewable; none is a High/Critical risk, per G-a):

- **CAND-11** WTP/pricing → routed to monetization chapter + class-7.
- **CAND-12** curriculum sequencing → routed to curriculum chapter (EX4).
- **CAND-13** UI modality → routed to UI chapter (EX4).
- **CAND-21** trustworthy-grading *measurement design* → routed to measurement-contract chapter (NEU-899+).
- **Community sub-jobs** (contest logistics, editorial reading, team practice) from RQ6 F6.1 → workflow/UI scope (EX4); no product-foundation element depends on them.
- **Aggregator/anecdote sources** excluded by NEU-897 (e.g. `brandon-gong/grind` n≈1, Medium/GeeksforGeeks listicles; RQ6 C4/C5) → below the evidence bar; never included.

**Audit hook:** the inventory is complete against NEU-897's findings (F1.1–F6.3), conflicts (X1–X4), and gaps (G1.1–G6.2). The traceability index in `04_…` §1 lists each of those NEU-897 items and the CAND/model element that consumes it, so an auditor can confirm nothing was dropped.
