# Material-Element Trace Register

**Task:** NEU-899 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-897 (`../`).
One trace record (`TR-<elementId>`) per material element, per the schema in `00_…` §2. Every record is **bidirectional**: it names the forward evidence (NEU-897 source + class + limitation) and the reverse anchor (the intended learner behavior / metric / decision rule / rejected alternative the element governs), so a reviewer can walk either way (materialized as indices in `02_…`). Completeness state is derived mechanically per `00_…` §5, citing the NEU-898 line it came from. **Nothing here is re-decided or re-classed — this wraps NEU-898.**

Evidence-class shorthand: `1 [literature]`, `2 [code-evidence]`, `3 [dogfooding]`, `4 [ai-critique]`, `5 [automated-eval]`, `6 [operational-log]`, `7 [future-real-user]`. Classes 3/5/6/7 contribute zero findings by design (NEU-897); where an element rests on a class-7 question it is PROVISIONAL/UNRESOLVED, never a finding.

---

## 1. Learner behavior: jobs (J), motivations (M), failure modes (FM)

| Trace id | Reverse anchor (behavior it governs) | Forward trace → evidence (source · class · limitation) | Key edges | Completeness |
| --- | --- | --- | --- | --- |
| **TR-J1** | Learner raises measured contest rating. | RQ6 F6.1 (S1) · 1 · community documentation, **not** a measured motivation study. | `served-by` M1/M2 | PROVISIONAL — documented job, weighting class-7 (`00_…`§00 J1). |
| **TR-J2** | Learner masters recognized problem patterns/schemas (DP first). | RQ6 F6.1 (S1) + RQ2 F2.1–F2.3 · 1 · schema pedagogy supported in computing; DP-specific worked-example evidence is gap G2.2. | `served-by` FM2; `provisional-on` G2.2 | PROVISIONAL. |
| **TR-J3** | Learner prepares for technical interviews. | RQ6 F6.1 (S1) · 1 · same community-doc limit as J1. | `served-by` M2 | PROVISIONAL. |
| **TR-J4** | Learner retains & transfers over months (durable mastery — the thesis job). | RQ1 F1.1–F1.3 + RQ6 F6.2 · 1 · mechanism-backed; that *this learner ranks J4 first* is class-7. | `mitigated-by` P1/FM1; `provisional-on` G6.1 | PROVISIONAL. |
| **TR-M1** | Achievement / measurable progress drives study. | RQ6 F6.1 · 1 · strength vs M4 unmeasured (class-7). | `provisional-on` RQ6 §class-7 | PROVISIONAL. |
| **TR-M2** | Career/interview outcomes drive study. | RQ6 F6.1 (via J3) · 1 · weighting class-7. | `provisional-on` RQ6 §class-7 | PROVISIONAL. |
| **TR-M3** | Mastery / intrinsic understanding drives study. | RQ6 §class-7 · 7 (does not exist) · the exact unmeasured claim the product is designed for. | `provisional-on` RQ6 §class-7 | PROVISIONAL. |
| **TR-M4** | Efficiency — study time that *sticks* drives behavior. | RQ6 F6.2 mechanism + §class-7 adherence · 1/7 · felt-need is class-7 (X3). | `provisional-on` X3, G6.1 | PROVISIONAL. |
| **TR-FM1** | Forgetting after grind defeats J4. | RQ6 F6.2 + RQ1 F1.1–F1.3 · 1 · population-*general* mechanism; dominance in this population is class-7 (G3.1/G6.1). | `mitigated-by` P1; `covered-by` BM-2/BM-4 | PROVISIONAL. |
| **TR-FM2** | Shallow/misgeneralized schema defeats transfer. | RQ2 F2.1–F2.3 + X1 · 1 · worked-example evidence strongest on novices; expertise-reversal boundary unverified (X2, G2.1). | `mitigated-by` P2; `covered-by` BM-1/BM-7 | PROVISIONAL. |
| **TR-FM3** | Mis-scheduled review for hierarchical DP skills erodes J4. | RQ1 G1.2 + repo research F1.4 · 1 · optimal hierarchical schedule **not answerable within NEU-897 caps**. | `incomplete-on` G1.2; `covered-by` BM-3 | INCOMPLETE (EX5). |
| **TR-FM4** | False confidence from AI grading corrupts the mastery signal. | RQ5 F5.1–F5.3 · 1 + existing-project research · not human validation; over-validates hard cases; DP-domain reliability unmeasured (G5.1). | `mitigated-by` P3; `covered-by` BM-5; `blocked-by-artifact` INC-3 | PROVISIONAL. |
| **TR-FM5** | Adherence collapse makes J4 unreachable. | RQ6 §class-7 · 7 (does not exist) · no class-1–6 evidence bounds prevalence. | `covered-by` BM-6; `provisional-on` G6.1 | PROVISIONAL — non-downgradable (tied to R5, G-a). |

## 2. Product constraints: principles (P) & differentiators (D)

| Trace id | Reverse anchor | Forward trace → evidence (source · class · limitation) | Key edges | Completeness |
| --- | --- | --- | --- | --- |
| **TR-P1** | Optimize for durable retention+transfer, not solve-count. | RQ1 F1.1–F1.3 vs RQ3 F3.1 · 1 · mechanism backed; DP effect size is gap G1.1 → **direction, not a quantified target**. | `mitigates` FM1; `provisional-on` G1.1 | PROVISIONAL (effect size). |
| **TR-P2** | Treat retention & transfer as two required mechanisms. | RQ1 vs RQ2 + X1 + G2.3 · 1 · prohibits a "flashcards-for-DP" model. | `mitigates` FM2; `provisional-on` G2.3 | PROVISIONAL. |
| **TR-P3** | Every learner-facing mastery signal is evidence-labeled & provisional. | `../01_evidence-taxonomy.md` + RQ5 F5.1–F5.3 · discipline decision (DEC2), grounded by FM4. | `mitigates` FM4; `evidenced-by` DEC2 | SETTLED (discipline decision). |
| **TR-P4** | Measure only what the system can compute; verify per signal. | RQ4 F4.1–F4.3 · 2 · capability ≠ pedagogical validity; feasibility per-signal. | `mitigates` R6 | SETTLED (discipline) with UNRESOLVED per-signal feasibility (→ INC-2). |
| **TR-P5** | Never expose raw learner payloads; log evidence is aggregate-only. | RQ4 F4.4 + method §5 (`logger.ts` unredacted) · 2 · binding via OUT-4 privacy gate. | `excludes` EX6; `mitigates` R-privacy | SETTLED (privacy gate). |
| **TR-P6** | Keep unresolved gaps visible; a gap keeps its element provisional. | NEU-887 OUT-4 discipline + acceptance scenario 3 · discipline decision (DEC3). | `evidenced-by` DEC3 | SETTLED (discipline decision). |
| **TR-D1** | Built-in retention model for algorithmic practice (vs CP platforms). | RQ3 F3.1–F3.2 · 1/tool-doc · landscape gap documented; that learners *want* it is **not** (F3.3). Confirmation is class-7. | `rejected-for` RA6; `provisional-on` G3.2 | PROVISIONAL (differentiator, DEC4). |
| **TR-D2** | Transfer-oriented schema building, not just retention. | RQ2 F2.1–F2.3 + RQ1 · 1 · literatures largely disjoint (G2.3); interaction untested. | `provisional-on` G2.3, CAND-6 | PROVISIONAL. |
| **TR-D3** | Evidence-labeled, gap-honest mastery signals as a product property. | RQ5 F5.1–F5.3 + taxonomy · 1 · value *to learners* is class-7 preference. | `evidenced-by` P3/P6 | PROVISIONAL. |
| **TR-D4** | Reuse existing Second Memory SR + memory-graph substrate as the vehicle. | RQ4 F4.1–F4.3 · 2 · capability-only; product-fit unproven (NEU-897 assumption). | `provisional-on` R8, CAND-31 | PROVISIONAL (capability-only). |

## 3. Decisions (DEC), risks (R), rejected alternatives (RA), exclusions (EX)

| Trace id | Reverse anchor (decision rule / alternative / wall) | Forward trace → evidence (source · class · limitation) | Key edges | Completeness |
| --- | --- | --- | --- | --- |
| **TR-DEC1** | Fix prerequisite boundary & audience; exclude EX1/EX2. | Charter §2 · product-scope decision (not an evidence finding). | `excludes` EX1/EX2 | SETTLED. |
| **TR-DEC2** | Evidence-labeling + provisional-by-default for mastery signals. | OUT-4 discipline + FM4 · discipline decision. | `keeps-provisional` P3/D3 | SETTLED. |
| **TR-DEC3** | Propagate every material gap as provisional/incomplete, never resolve silently. | Acceptance scenario 3 · discipline decision. | `keeps-provisional` all provisional records | SETTLED. |
| **TR-DEC4** | Treat D1–D4 as provisional, record the class-7 evidence each needs. | Acceptance scenario 4 + EX3 · positioning decision. | `keeps-provisional` D1–D4 | SETTLED. |
| **TR-DEC5** | Adopt one feature-wide materiality rule over the full inventory. | NEU-898 in-scope + acceptance scenario 2 · process decision. | `owns` CAND-1…32 | SETTLED. |
| **TR-R1** | Core mechanism may not transfer to DP → wrong metric optimized. | Gap G1.1 + X1 · 1 · **High**. | `blocked-by-artifact` INC-1 (product-side measurement, NEU-900/906) | UNRESOLVED — non-downgradable (G-a). |
| **TR-R2** | Retention without transfer (FM2). | X1 + G2.3 · 1 · **High**. | `mitigated-by` P2; `provisional-on` G2.3 | PROVISIONAL — non-downgradable (G-a). |
| **TR-R3** | AI-graded mastery unreliable in-domain → false confidence (FM4). | RQ5 F5.1–F5.3 + G5.1 · 1 · **High**. | `blocked-by-artifact` INC-3 (automated-eval, OUT-7/NEU-900+) | UNRESOLVED — non-downgradable (G-a). |
| **TR-R4** | No demand — differentiators address a gap nobody wants. | RQ3 F3.3 · 1 · **High**; explicitly class-7 (EX3). | `provisional-on` G3.2; `excluded-by` EX3 | UNRESOLVED (class-7) — non-downgradable (G-a). |
| **TR-R5** | Adherence collapse (FM5) before mastery forms. | RQ6 §class-7 · 7 (does not exist) · **High**. | `covered-by` BM-6; `provisional-on` G6.1 | PROVISIONAL — non-downgradable (G-a). |
| **TR-R6** | Signal feasibility gap — desired metrics not computable without new telemetry. | RQ4 F4.1–F4.3 + G4.2 · 2 · Medium. | `mitigated-by` P4; `blocked-by-artifact` INC-2 | UNRESOLVED (metric contract → SUB-4). |
| **TR-R7** | Mis-scheduling for hierarchical skills (FM3) degrades retention. | Gap G1.2 · 1 · Medium; cap-bound. | `incomplete-on` G1.2 | INCOMPLETE (EX5). |
| **TR-R8** | Over-reliance on existing codebase as if a validated product (D4). | NEU-897 assumption · Medium · capability-only, no product-fit asserted. | `keeps-provisional` D4 | PROVISIONAL. |
| **TR-RA1** | Reject "flashcards for DP" (retention alone). | X1 + RQ2 F2.1–F2.3 + G2.3 · 1 · would leave FM2 uncovered. | `rejected-for` P2 | SETTLED (rejected) — reopens only on in-domain evidence. |
| **TR-RA2** | Reject volume/grind as the primary model. | RQ6 F6.1 + X3 · 1 · culture diverges from evidence; contra P1. Retained as behavior to design against. | `rejected-for` P1; `covered-by` BM-6 | SETTLED (rejected). |
| **TR-RA3** | Reject broadening to general all-algorithms. | EX2 + RQ3 F3.3 · 1 · no demand evidence for either scope. | `rejected-for` EX2 | SETTLED (rejected) — reopens on class-7 breadth demand. |
| **TR-RA4** | Reject lowering prerequisite to include beginners. | X2 + RQ2 · 1 · pedagogy evidence is on competent/adult learners; expertise-reversal risk. | `rejected-for` EX1; `provisional-on` G2.1 | SETTLED (rejected) — reopens on beginner-population evidence. |
| **TR-RA5** | Reject trusting AI grading as the signal of record. | RQ5 F5.1–F5.3 + FM4 + G5.1 · 1 · DP-domain reliability unmeasured. | `rejected-for` P3; `blocked-by-artifact` INC-3 | SETTLED (rejected) — reopens on bounded in-domain reliability. |
| **TR-RA6** | Reject claiming the "AI tutor + memory graph" niche as validated market. | EX3 + RQ3 F3.3 · 1 · unsupported market claim; kept only as provisional D1/D3. | `rejected-for` D1/D3; `excluded-by` EX3 | SETTLED (rejected). |
| **TR-EX1** | Wall off absolute beginners. | Charter §2 / DEC1 · below prerequisite boundary. | `excludes` A0 region; wall BX-1 | SETTLED. |
| **TR-EX2** | Wall off general all-algorithms product. | Charter §2 / DEC1 · fixed audience. | `excludes` A4 region; wall BX-2 | SETTLED. |
| **TR-EX3** | Wall off market/demand/WTP claims as validated fact. | taxonomy #3 + RQ3 F3.3 · no class-7 evidence exists. | `excludes` F3; wall BX-3 | SETTLED. |
| **TR-EX4** | Wall off selecting pedagogy/curriculum/tutoring/UI/architecture/provider/telemetry. | NEU-898 out-of-scope + parent charter · product-foundation altitude only. | `excludes` F4; wall BX-4; `routed-to` downstream chapters | SETTLED. |
| **TR-EX5** | Wall off new research / exceeding NEU-897 caps. | NEU-898 out-of-scope + NEU-897 §1 caps. | `keeps-incomplete` FM3/R7/CAND-7/CAND-27 | SETTLED. |
| **TR-EX6** | Wall off raw operational-log payloads / un-gated log evidence. | RQ4 F4.4 · privacy gate (P5). | `excludes` F6; wall BX-5 | SETTLED. |

## 4. Benchmark-state cells (BM) & exclusion-boundary walls (BX)

| Trace id | Reverse anchor (state / wall) | Forward trace → evidence (source · class · limitation) | Key edges | Completeness |
| --- | --- | --- | --- | --- |
| **TR-BM-1** | First DP pattern; risk of memorizing surface vs forming schema. `A1·B4·C2·D2·E1·F0` | RQ2 F2.1–F2.3 + X1 · 1 · DP-domain transfer unmeasured (G1.1, G2.3). | `covers` FM2, X1 | PROVISIONAL. |
| **TR-BM-2** | Acquired pattern must be held by spaced retrieval over weeks. `A1·B4·C3·D1·E1·F0` | RQ1 F1.1–F1.3 + RQ6 F6.2 · 1 · DP effect size analogy-only (G1.1). | `covers` FM1, X1 | PROVISIONAL. |
| **TR-BM-3** | Consolidating multiple interdependent patterns; hierarchical scheduling uncertain. `A2·B2·C4·D3·E0·F0` | RQ1 G1.2 · 1 · optimal schedule not answerable within caps. | `covers` FM3; `incomplete-on` G1.2 | INCOMPLETE (EX5). |
| **TR-BM-4** | Long-gap decay / relapse of a mastered pattern. `A2·B4·C5·D1·E1·F0` | RQ1 F1.1–F1.3 + RQ6 F6.2 · 1 · (G1.1). | `covers` FM1, X1 | PROVISIONAL. |
| **TR-BM-5** | Wrong/shallow answer over-validated by AI grading → false confidence. `A1·B3·C2·D4·E4·F0` | RQ5 F5.1–F5.3 + X4 · 1 · DP-domain grading reliability unmeasured (G5.1); R3 High. | `covers` FM4, X4; `blocked-by-artifact` INC-3 | PROVISIONAL → UNRESOLVED on grading reliability. |
| **TR-BM-6** | Rating-driven learner grinds volume, abandons spaced review. `A3·B1·C4·D5·E3·F0` | RQ6 F6.1 + X3 · 1 · adherence prevalence class-7 (G6.1); R5 High, non-downgradable. | `covers` FM5, X3 | PROVISIONAL (adherence gap). |
| **TR-BM-7** | Competent learner studies worked examples for a harder pattern (possible expertise reversal). `A2·B2·C2·D2·E2·F0` | RQ2 X2 + G2.1 · 1 · expertise-reversal boundary unverified. | `covers` FM2, X2; `incomplete-on` G2.1 | PROVISIONAL/INCOMPLETE. |
| **TR-BM-8** | Product wants a per-pattern mastery signal; schema computes none today. `A2·B4·C3·D0·E0·F0` | RQ4 F4.1–F4.3 + G4.2 · 2 · signal not yet computable; no external telemetry decided here (EX4). | `covered-by` R6; `blocked-by-artifact` INC-2 | UNRESOLVED (metric contract → SUB-4). |
| **TR-BX-1** | Wall: absolute beginner needs language/first-algorithm instruction. `A0·—·C1·—·—·F1` | EX1 · out of audience. | `excluded-by` EX1 | SETTLED (wall). |
| **TR-BX-2** | Wall: learner wants coverage across all algorithm topics. `A4·—·—·—·—·F2` | EX2 · general product excluded. | `excluded-by` EX2 | SETTLED (wall). |
| **TR-BX-3** | Wall: cell used to assert market/demand/WTP or external validation. `—·—·—·—·—·F3` | EX3 · only class-7 could support; does not exist. | `excluded-by` EX3 | SETTLED (wall). |
| **TR-BX-4** | Wall: cell used to fix a pedagogy/curriculum/UI/architecture/provider/telemetry design. `—·—·—·—·—·F4` | EX4 · downstream chapter scope. | `excluded-by` EX4 | SETTLED (wall). |
| **TR-BX-5** | Wall: cell references raw learner log payloads. `—·—·—·—·—·F6` | EX6 / P5 · aggregate-only via OUT-4 gate. | `excluded-by` EX6 | SETTLED (wall). |

## 5. Candidate cross-map (Included CAND → model-element trace + completeness)

Each Included CAND already carries its NEU-897 trace and disposition in NEU-898 `02_…`. Here each maps to the model-element trace record(s) that realize it, so the inventory is reconcilable (`04_…` OC-3) without re-tabulating evidence. Excluded/Routed/Non-material candidates are in `05_…`.

| CAND | Realized by trace record(s) | Completeness (inherited) |
| --- | --- | --- |
| CAND-1 | TR-P1, TR-J4, TR-FM1 | PROVISIONAL (G1.1 on effect size) |
| CAND-2 | TR-P2, TR-FM2, TR-R2 | PROVISIONAL (G1.1) |
| CAND-3 | TR-R1, TR-BM-1/2/4 | UNRESOLVED (R1) / PROVISIONAL cells |
| CAND-4 | TR-P2, TR-D2, TR-J2, TR-FM2 | PROVISIONAL |
| CAND-5 | TR-FM2, TR-RA4, TR-BM-7 | PROVISIONAL/INCOMPLETE (G2.1) |
| CAND-6 | TR-D2, TR-BM-1 | PROVISIONAL (G2.3) |
| CAND-7 | TR-FM3, TR-R7, TR-BM-3 | INCOMPLETE (G1.2, EX5) |
| CAND-8 | TR-D1, TR-RA2 | PROVISIONAL (landscape only) |
| CAND-9 | TR-D1 | PROVISIONAL |
| CAND-10 | TR-D1, TR-D3, TR-EX3, TR-R4, TR-RA6 | UNRESOLVED (R4, class-7) |
| CAND-14 | TR-D4, TR-P4 | PROVISIONAL / capability-only |
| CAND-15 | TR-P4, TR-R6 | UNRESOLVED (INC-2) |
| CAND-16 | TR-P5, TR-EX6 | SETTLED (privacy) |
| CAND-17 | TR-R6, TR-BM-8 | UNRESOLVED (INC-2) |
| CAND-18 | TR-R6 | UNRESOLVED (OUT-4 log gate, INC-2) |
| CAND-19 | TR-P3, TR-D3, TR-FM4, TR-R3, TR-RA5 | PROVISIONAL → UNRESOLVED (INC-3) |
| CAND-20 | TR-R3, TR-FM4 | UNRESOLVED (INC-3, routed OUT-7) |
| CAND-22 | TR-J1/J2/J3 | PROVISIONAL |
| CAND-23 | TR-FM1, TR-J4 | PROVISIONAL |
| CAND-24 | TR-RA2, TR-BM-6 | PROVISIONAL (X3) |
| CAND-25 | TR-M1…M4 | PROVISIONAL (class-7) |
| CAND-26 | TR-FM5, TR-R5 | PROVISIONAL — non-downgradable (G-a) |
| CAND-27 | TR-M1…M4 (provisionality) | INCOMPLETE (G6.1, EX5) |
| CAND-28 | `../product-model/03_…` matrix (this-tier discharge) | PROVISIONAL — journey suite → NEU-900 |
| CAND-29 | TR-P3, TR-DEC2 (+ all traces) | SETTLED (discipline) |
| CAND-30 | TR-EX5 | SETTLED (bounds this task) |
| CAND-31 | TR-D4, TR-R8 | PROVISIONAL |
| CAND-32 | provenance inheritance (cutoff 2026-07-07) | SETTLED as provenance; non-material as new claim |
