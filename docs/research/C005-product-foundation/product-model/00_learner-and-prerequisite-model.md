# Target Learner & Prerequisite Model

**Task:** NEU-898 · **Compiled:** 2026-07-11 · **Sole evidence source:** NEU-897 package (`../`).
Every statement below carries its NEU-897 trace, evidence class, and structural limitation, or is explicitly marked **provisional** / **gap**. No statement is presented as external-user, expert, or market validation.

---

## 1. The fixed prerequisite boundary (not re-litigated)

The target audience is carried unchanged from the intake and the NEU-887 parent charter (`../00_method-and-provenance.md` §2). This model **fixes** it and does not re-open it.

**In audience:** a programmer who already has
- **language competence** — can read and write correct code in at least one general-purpose language without tutoring on syntax; and
- **basic-algorithm competence** — understands arrays, recursion, complexity notation, and elementary data structures well enough to implement a straightforward solution unaided.

…and who **seeks durable mastery and competitive-programming breadth** — durable retention and transfer of algorithmic problem-solving skill (dynamic programming as the program's initial domain), not one-off puzzle completion.

**The boundary is a boundary, not a spectrum to be widened.** Two positions sit *outside* it and are formalized as exclusions in `01_…` (EX1, EX2):
- **below the boundary** — absolute beginners who still need language/first-algorithm instruction; and
- **above/orthogonal to the domain** — learners wanting a *general all-algorithms* product rather than depth in the program's chosen domain.

**Evidence status of the boundary itself.** The boundary is a *charter-fixed product decision*, not an evidence finding — it is recorded as decision **DEC1** in `01_…`, not as a supported claim. NEU-897 supplies evidence about *learners inside* the boundary (RQ1, RQ2, RQ6); it supplies **no** class-1–6 evidence that this boundary maximizes market size or demand — that is a class-7 question and stays open (gap **G6.2**, and NEU-897 RQ3 F3.3's "absence of a competitor is not evidence of demand").

## 2. Target-learner definition (one paragraph, traceable)

The target learner is an **already-competent adult programmer** for whom the well-established retention and transfer mechanisms of retrieval practice and spacing are *applicable in principle* (RQ1 F1.1–F1.3, **[literature]**), but for whom the *domain* extension to competitive-programming / algorithm-design tasks is an **analogy, not a measured result** (gap **G1.1**). The skill they want to build is **problem-solving skill**, whose supported pedagogy (subgoal-labeled worked examples, schema formation) is *distinct from* fact retention (RQ2 F2.1–F2.3, **[literature]**) and only partially overlapping with it (conflict **X1**; gap **G2.3**). Their publicly **documented** goals are contest rating, pattern mastery, and interview preparation, pursued predominantly through high-volume problem grinding (RQ6 F6.1, **[literature]** community documentation) — a practice culture that **diverges** from the evidence-supported practice structure (conflict **X3**). Whether this learner in fact *prioritizes* durable mastery over short-term contest/interview outcomes, and whether they will *adhere* to scheduled review, are **not supportable now** and are reserved for future real-user evidence (RQ6 §class-7; **[future-real-user]**, does not yet exist).

## 3. Learner jobs (J)

Jobs are what the learner is trying to get done. Only jobs with a NEU-897 trace are asserted; motivation *weighting* among them is a gap (see §4).

| ID | Job | Trace | Class | Limitation / status |
| --- | --- | --- | --- | --- |
| **J1** | Raise measured competitive-programming performance (contest rating). | RQ6 F6.1 (S1) | [literature] (community documentation) | Documents the practice culture participants publicly state, **not** a measured motivation study. |
| **J2** | Master recognized problem patterns / schemas (the program's DP domain being the first). | RQ6 F6.1 (S1); RQ2 F2.1–F2.3 (schema formation is the supported mechanism) | [literature] | Schema-formation pedagogy is supported in computing/algorithm domains; DP-specific worked-example evidence is a **gap** (G2.2). |
| **J3** | Prepare for technical interviews. | RQ6 F6.1 (S1) | [literature] (community documentation) | Same community-documentation limit as J1. |
| **J4** | Retain and transfer what was learned over months — durable mastery rather than forget-after-solve. | RQ1 F1.1–F1.3 (mechanism); RQ6 F6.2 (forgetting is population-general) | [literature] | This is the product's thesis job. Mechanism is evidence-backed; that *this learner ranks J4 above J1/J3* is a **class-7 gap** (§4, provisional M-priority). |

**Non-material / routed jobs.** Contest logistics, editorial/solution reading, and social/team-practice jobs surfaced in the community documentation are **non-material** to the product foundation (they select workflow/UI, a downstream chapter's scope) — recorded in `02_…` as CAND items with non-material rationale.

## 4. Learner motivations (M) — mostly provisional

NEU-897 RQ6 explicitly reserves the *distribution and ranking* of learner motivations for class-7 evidence. This model therefore lists motivations as **provisional hypotheses**, never as findings, and forbids any downstream element from treating a motivation weighting as settled.

| ID | Motivation (hypothesis) | Status | Trace / why not settled |
| --- | --- | --- | --- |
| **M1** | Achievement / measurable progress (rating, streaks, solved counts). | **Provisional** | Consistent with documented practice culture (RQ6 F6.1) but the *strength* relative to M4 is unmeasured (RQ6 §class-7). |
| **M2** | Career / interview outcomes. | **Provisional** | Documented job (J3) implies the motivation; weighting is class-7. |
| **M3** | Mastery / intrinsic understanding of algorithmic thinking. | **Provisional** | The motivation the product is *designed for*; that real learners hold it dominantly is exactly the unmeasured class-7 claim (RQ6 §class-7, first bullet). |
| **M4** | Efficiency — spending study time so it *sticks* rather than re-grinding. | **Provisional** | Follows from F6.2 at the mechanism level; that learners *feel* this need strongly enough to change behavior is a class-7 adherence question (RQ6 §class-7, second bullet; conflict X3). |

**Materiality note.** Because motivation weighting is unresolved, any downstream differentiator or feature that *depends on a specific motivation ranking* inherits **provisional** status until class-7 evidence exists (propagated in `04_…`). Omitting this provisionality would be an unsupported market/preference claim — prohibited by the taxonomy (`../01_evidence-taxonomy.md` §Claim-labeling discipline #3).

## 5. Product-critical failure modes (FM)

A failure mode is **product-critical** when, if unaddressed, it would defeat job **J4** (durable mastery) — the job that distinguishes this product from a plain problem set. Each is traced; population-*dominance* claims are held as gaps.

| ID | Failure mode | Trace | Class | Product-critical because | Limitation / status |
| --- | --- | --- | --- | --- | --- |
| **FM1** | **Forgetting after grind** — solved problems decay without spaced re-exposure. | RQ6 F6.2; RQ1 F1.1–F1.3 | [literature] | Directly defeats J4; it is the mechanism the product exists to counter. | Population-*general* mechanism is supported; that it *dominates in this product's population* is a class-7 gap (G3.1/G6.1). |
| **FM2** | **Shallow / misgeneralized schema** — learner memorizes surface solutions without forming transferable pattern schemas. | RQ2 F2.1–F2.3; conflict X1 (retention ≠ transfer) | [literature] | Retention mechanics alone (FM1's fix) do not produce transfer; a "flashcards-for-DP" model would leave this uncovered (gap G2.3). | Worked-example evidence is strongest on *novices*; expertise-reversal boundary for competent learners is **unverified** (conflict X2, gap G2.1). |
| **FM3** | **Mis-scheduled review** — spacing intervals wrong for hierarchical, multi-month DP skill dependencies. | RQ1 G1.2 (cap-bound); repo research F1.4 (thresholds diverge from reference systems) | [literature] | Wrong scheduling erodes J4 even when the mechanism is right. | Optimal schedules for hierarchical skills were **not answerable within NEU-897 caps** — element is **incomplete** (G1.2). |
| **FM4** | **False confidence from AI grading** — an AI critique validates a wrong/shallow answer, so the learner believes they have mastery they lack. | RQ5 F5.1–F5.3 (LLM-judge biases; tutor-context over-validation) | [literature] + existing-project research | Corrupts the mastery signal J4 depends on; over-validation appears in exactly the hard cases. | DP-domain grading reliability is **unmeasured** (gap G5.1); this bounds evidence classes 4–5, it does not resolve them. |
| **FM5** | **Motivation collapse / adherence drop** — learner stops doing scheduled review before durable mastery forms. | RQ6 §class-7 (adherence) | [future-real-user] — **does not yet exist** | If it dominates, J4 is unreachable regardless of mechanism quality. | **Gap, not finding.** No class-1–6 evidence bounds its prevalence; held provisional (G6.1). Cannot be downgraded (see risk R-severity rule, `01_…`). |

## 6. What this model deliberately does not decide here

Per the parent charter's altitude rule, this file defines *who the learner is and what can defeat their mastery* — it does **not** choose the retrieval schedule, the worked-example format, the grading protocol, the UI, or the curriculum sequence that would address FM1–FM5. Those route to their owning chapters (curriculum, pedagogy, tutoring, measurement) and are listed as routed candidates in `02_…`. The benchmark-state matrix (`03_…`) enumerates the *states* these failure modes create so downstream benchmark-suite work (NEU-900) can cover them, without selecting the suite here.
