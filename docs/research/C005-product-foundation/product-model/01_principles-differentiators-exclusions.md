# Product Principles, Differentiators, Exclusions, Risks, Decisions & Rejected Alternatives

**Task:** NEU-898 · **Compiled:** 2026-07-11 · **Sole evidence source:** NEU-897 package (`../`).
Everything here stays at **product altitude**. Where the bounded evidence does not support a position, it is recorded as **provisional** with the evidence that would settle it — never asserted as validated.

---

## 1. Product principles (P)

A principle is a standing product constraint that later chapters must honor. Each is either evidence-backed (with class + limitation) or an explicit charter/discipline decision.

| ID | Principle | Basis | Class / status |
| --- | --- | --- | --- |
| **P1** | **Optimize for durable retention + transfer, not solve-count.** Progress is measured toward J4, not volume. | RQ1 F1.1–F1.3; contrast with volume-culture RQ3 F3.1 | [literature]. The *mechanism* is backed; the DP-domain effect size is a gap (G1.1) — so P1 is a **direction**, not a quantified target. |
| **P2** | **Treat retention and transfer as two mechanisms, not one.** Scheduling retrieval (FM1) and building schemas (FM2) are distinct and both required. | RQ1 vs RQ2; conflict X1; gap G2.3 | [literature]. Prohibits a "flashcards-for-DP" model that assumes retention mechanics transfer to problem-solving. |
| **P3** | **Every learner-facing mastery signal is evidence-labeled and provisional.** No signal is presented to the learner (or to downstream specs) as validated mastery without its class and limitation. | `../01_evidence-taxonomy.md`; RQ5 F5.1–F5.3 | Discipline decision (DEC2). Grounded by AI-grading unreliability (FM4). |
| **P4** | **Measure only what the system can actually compute; verify per signal.** Do not assume a signal exists because a field or metric name exists. | RQ4 F4.1–F4.3 (`averageQuality` declared, uncomputed) | [code-evidence]. Capability ≠ pedagogical validity; feasibility is per-signal. |
| **P5** | **Never expose raw learner payloads; log-derived evidence is aggregate-only.** | RQ4 F4.4; `../00_method-and-provenance.md` §5 (`src/shared/logger.ts` leaves responses unredacted) | [code-evidence] + OUT-4 privacy gate. Binding on all downstream measurement work. |
| **P6** | **Keep unresolved evidence gaps visible in the product model.** A gap that could change a material element keeps that element provisional rather than being silently resolved. | NEU-887 OUT-4 claim discipline; acceptance scenario 3 | Discipline decision (DEC3). |

## 2. Differentiators (D)

A differentiator is a candidate reason this product differs from documented alternatives. **None is a market claim.** Each states the evidence gap that keeps it provisional and the class-7 evidence that would confirm it.

| ID | Differentiator (provisional) | Basis vs. landscape | Status / what would confirm |
| --- | --- | --- | --- |
| **D1** | **A built-in retention model for algorithmic practice** (spaced retrieval over solved patterns), which major CP platforms do not document. | RQ3 F3.1–F3.2 (platforms optimize volume; SR exists only as niche bolt-ons) | **Provisional differentiator.** The *gap in the landscape* is documented [literature/tool-doc]; that learners *want* it is **not** — "an empty niche is not demand evidence" (RQ3 F3.3). Confirmation is class-7. |
| **D2** | **Transfer-oriented schema building, not just retention.** Combines retrieval scheduling with subgoal/worked-example schema formation. | RQ2 F2.1–F2.3 + RQ1 | **Provisional.** Both literatures are supported but largely disjoint (G2.3); their *interaction* is unstudied — the differentiator rests on an untested combination. |
| **D3** | **Evidence-labeled, gap-honest mastery signals** (P3/P6) as a product property, contrasting with opaque "AI tutor" claims. | RQ5 F5.1–F5.3; taxonomy | **Provisional.** Defensible as a discipline; its value *to learners* is a class-7 preference claim. |
| **D4** | **Reuse of existing Second Memory SR + memory-graph substrate** as the practice vehicle. | RQ4 F4.1–F4.3 (per-attempt data already persisted) | **Provisional / capability-only.** Codebase *can* measure per-attempt outcomes [code-evidence]; that this yields a superior learning product is unproven (assumption in NEU-897: existing workflows remain *candidate* vehicles, not a preselected experience). |

## 3. Explicit exclusions (EX)

Exclusions are firm scope walls. They are **product decisions** (charter-fixed) — recorded so downstream chapters cannot quietly re-include them.

| ID | Excluded | Rationale | Trace |
| --- | --- | --- | --- |
| **EX1** | **Absolute beginners** (need language/first-algorithm instruction). | Below the fixed prerequisite boundary; a different product. | Charter §2 / DEC1. |
| **EX2** | **General all-algorithms product.** Depth in the program's chosen domain (DP first), not breadth across every algorithm topic. | Fixed audience; avoids diluting the mastery thesis. | Charter §2 / DEC1. |
| **EX3** | **Market / demand / willingness-to-pay claims as validated fact.** | No class-7 evidence exists; RQ3 F3.3 warns explicitly. | `../01_evidence-taxonomy.md` #3; RQ3. |
| **EX4** | **Selecting pedagogy, curriculum, tutoring, UI, architecture, provider, telemetry, or production behavior.** | Product-foundation altitude only; these belong to later chapters. | NEU-898 out-of-scope; parent charter. |
| **EX5** | **New research or exceeding NEU-897 caps.** No fresh queries, no candidate/inclusion cap expansion inside this task. | NEU-898 out-of-scope; NEU-897 §1 caps. | `../04_caps-and-incomplete-scope.md`. |
| **EX6** | **Raw operational-log payloads / un-gated log evidence.** | Privacy gate (P5). | RQ4 F4.4. |

## 4. Risks (R) — with severity and the non-downgrade rule

Severity ∈ {Low, Medium, High, Critical}. **Materiality rule interaction (binding):** *changing or omitting a **High** or **Critical** risk can never be classified non-material* (`02_…`). A High/Critical risk may be **mitigated** or **accepted with rationale**, but not dropped from the inventory or downgraded without new correctly-classed evidence.

| ID | Risk | Severity | Basis | Disposition |
| --- | --- | --- | --- | --- |
| **R1** | The core mechanism (retrieval+spacing) **does not transfer to DP** as assumed; the product optimizes a metric that doesn't move real algorithmic skill. | **High** | Gap G1.1; conflict X1 | Held open; product-side measurement required downstream (NEU-900/906). Cannot be downgraded until measured. |
| **R2** | **Retention without transfer** — learners recall solutions but don't gain problem-solving skill (FM2). | **High** | Conflict X1; gap G2.3 | Addressed in principle by P2; realization risk stays High until schema-formation efficacy is measured in-domain. |
| **R3** | **AI-graded mastery is unreliable in-domain** → false confidence (FM4) corrupts every downstream signal. | **High** | RQ5 F5.1–F5.3; gap G5.1 | Bounded by P3; measurement deferred to automated-eval protocol (NEU-887 OUT-7 / NEU-900+). |
| **R4** | **No demand** — the differentiators (D1–D4) address a gap nobody will pay attention to. | **High** | RQ3 F3.3 ("absence of a competitor is not evidence of demand") | Explicitly a class-7 question (EX3). Held open; not resolvable in this program stage. |
| **R5** | **Adherence collapse** (FM5) — learners abandon scheduled review before mastery forms. | **High** | RQ6 §class-7 | Gap; cannot be downgraded (no class-1–6 evidence bounds it). |
| **R6** | **Signal feasibility gap** — desired metrics (e.g. per-pattern mastery) aren't computable without new telemetry (P4). | Medium | RQ4 F4.1–F4.3; gap G4.2 | Per-signal verification required before any metric is promised. |
| **R7** | **Mis-scheduling** for hierarchical skills (FM3) degrades retention. | Medium | Gap G1.2 (incomplete scope) | Element marked incomplete; schedule design routed downstream. |
| **R8** | **Over-reliance on the existing codebase** as if it were a validated learning product (D4). | Medium | NEU-897 assumption (workflows are *candidate* vehicles) | Kept as capability-only claim; no product-fit asserted. |

## 5. Decisions taken at product altitude (DEC)

These are decisions this task is *entitled* to make (they define the product foundation), as distinct from downstream decisions it must not pre-empt (EX4).

| ID | Decision | Rationale | Kind |
| --- | --- | --- | --- |
| **DEC1** | Fix the prerequisite boundary and audience (§`00_…`1); exclude EX1/EX2. | Charter-carried; enables a focused mastery product. | Product-scope decision (not an evidence finding). |
| **DEC2** | Adopt evidence-labeling + provisional-by-default for all mastery signals (P3). | Required by OUT-4 discipline and FM4. | Discipline decision. |
| **DEC3** | Propagate every material NEU-897 gap into the model as provisional/incomplete rather than resolving it (P6). | Acceptance scenario 3. | Discipline decision. |
| **DEC4** | Treat differentiators D1–D4 as **provisional**, not settled, and record the class-7 evidence each needs. | Acceptance scenario 4; EX3. | Product-positioning decision. |
| **DEC5** | Adopt one feature-wide materiality rule (`02_…`) governing the full candidate inventory. | NEU-898 in-scope; acceptance scenario 2. | Process decision. |

## 6. Material rejected alternatives (RA)

Positions considered and **not** adopted, each with the evidence that rejected it (or the provisional status + what would reopen it). Recording these is required by acceptance scenario 4.

| ID | Rejected alternative | Why rejected / provisional | Reopen when |
| --- | --- | --- | --- |
| **RA1** | **"Flashcards for DP"** — model DP mastery as fact retention with spaced flashcards alone. | Rejected: retention mechanics ≠ problem-solving transfer (conflict X1; RQ2 F2.1–F2.3; gap G2.3). Would leave FM2 uncovered. | Never on current evidence; would need in-domain evidence that retrieval alone yields DP transfer. |
| **RA2** | **Volume/grind optimization** (mirror LeetCode/Codeforces contest-grind culture). | Rejected as the *primary* model: documented culture (RQ6 F6.1) diverges from evidence-supported practice (conflict X3); optimizes solve-count over J4 (contra P1). | Retained only as a *documented behavior* to design against, not a target. |
| **RA3** | **Broaden to a general all-algorithms product** to enlarge the audience. | Rejected: violates fixed audience (EX2); no demand evidence for either scope (RQ3 F3.3), so breadth adds risk without evidence. | Class-7 demand evidence showing breadth is wanted. |
| **RA4** | **Lower the prerequisite to include beginners** (EX1) for a bigger funnel. | Rejected: pedagogy evidence for the target mechanisms is on *competent/adult* learners; worked-example evidence even shows a possible expertise-reversal boundary (conflict X2) — mixing populations weakens the model. | Would need beginner-population evidence and a separate product thesis. |
| **RA5** | **Trust AI grading as the mastery signal of record.** | Rejected: documented LLM-judge bias and tutor-context over-validation (RQ5 F5.1–F5.3, FM4); DP-domain reliability unmeasured (G5.1). | In-domain automated-eval showing bounded reliability (NEU-887 OUT-7). |
| **RA6** | **Claim the uncrowded "AI tutor + memory graph" niche as validated market opportunity.** | Rejected: explicitly an unsupported market claim (EX3; RQ3 F3.3). Kept as a *provisional differentiator* (D1/D3), not a validated opportunity. | Class-7 user/market evidence. |
