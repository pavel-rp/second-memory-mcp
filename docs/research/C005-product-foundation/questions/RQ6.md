# RQ6 — Target-learner jobs, motivations, and failure modes: what is supportable now vs. reserved for real-user evidence

**Declared:** 2026-07-11 (see `../02_research-questions.md`) · **Search cutoff:** 2026-07-11 (web), 2026-07-07 (repo research)
**Status:** Answered within caps (5 candidates reviewed, 3 included). Deliberately conservative: most learner-population claims land in the gap inventory.

## Search record

| Field | Value |
| --- | --- |
| Interfaces | Reuse of the RQ1 and RQ3 web queries' candidate pools (no additional query issued — the cap discipline favors reusing already-recorded searches when their result sets bear on the question); repo corpus `docs/research/SYNTHESIS.md` + `docs/research/results/04-monetization-market-research.md`. |
| Exact queries (reused) | `retrieval practice spacing effect durable learning meta-analysis expert learners transfer` (RQ1); `competitive programming practice platforms LeetCode Codeforces spaced repetition mastery skill acquisition patterns` (RQ3). Both 2026-07-11. |
| Selection method | Per method §3; candidates re-screened against *this* question (learner jobs/motivations/failure modes), not their original question. |

## Candidate ledger (5 reviewed / cap 5)

| # | Candidate | Decision | Rationale |
| - | --- | --- | --- |
| C1 | Codeforces community resource threads (from RQ3 pool) | **INCLUDED** (S1) | Primary practitioner-culture documentation of goals (rating, contest success) and prevailing practice behaviors. |
| C2 | Repo prior research: `docs/research/SYNTHESIS.md` + `04-monetization-market-research.md` (audience/differentiator sections) | **INCLUDED** (S2) | Existing-project research documenting the positioning frame and its explicit demand-evidence limits. |
| C3 | Carpenter et al., Nature Reviews Psychology 2022 (from RQ1 pool) | **INCLUDED** (S3) | Grounds the *failure-mode* side: forgetting under massed practice is population-general. |
| C4 | `brandon-gong/grind` repo (from RQ3 pool) | EXCLUDED | Single practitioner's tool; motivation evidence is anecdotal (n≈1 author); weaker than S1's community-scale documentation. |
| C5 | Medium/GeeksforGeeks listicles (from RQ3 pool) | EXCLUDED | Aggregator class; no primary learner-population data. |

## Included sources & findings

- **F6.1 [literature]** (community documentation) Documented practitioner jobs in the CP community: raising contest rating, mastering recognized problem patterns, and interview preparation; the documented dominant method is high-volume problem grinding over curated lists. This describes the practice culture participants publicly document — it is **not** a measured motivation study. Cutoff 2026-07-11. *(S1)*
- **F6.2 [literature]** A population-general failure mode is well-established: without spaced re-exposure, learned material is forgotten (forgetting-curve lineage; spacing counteracts it). It is *supportable* that a learner who grinds problems without revisiting them will retain less than one who spaces retrieval — at the mechanism level, not as a claim about any specific product's users. Cutoff 2026-07-11. *(S3)*
- **F6.3 [existing-project research]** The prior research frames the product's candidate audience via the SR-literate segment and cross-client portability, and explicitly warns that no demand evidence exists for the specific bundle ("absence of a competitor is not evidence of demand"). `docs/research/results/04-monetization-market-research.md` Exec Summary #4, `SYNTHESIS.md` §Monetization, cutoff 2026-07-07. *(S2)*

## What must wait for future real-user evidence (class 7)

The following learner-model statements are **not supportable** by any class-1–6 evidence available in this pass and are reserved for future real-user evidence:

- That target learners *want* durable mastery more than short-term contest/interview outcomes (motivation distribution).
- That target learners will tolerate SR-style scheduled review workloads for CP practice (behavioral adherence).
- Any market-size, willingness-to-pay, or preference claim about this product's actual users.
- Which failure modes (forgetting vs. misgeneralized patterns vs. motivation collapse) dominate *in this product's population*.

## Conflicts

- F6.1 (documented practice culture optimizes for volume/rating) vs. F6.2 + RQ1 (durable mastery favors spaced retrieval): the same conflict recorded in RQ3 — the target learner's *documented* behavior and the *evidence-supported* behavior diverge. Whether learners will change behavior is a class-7 question.

## Unresolved gaps

- **G6.1** No direct study of jobs/motivations of *mastery-seeking competitive programmers* was found within the reused candidate pools; a dedicated query was not affordable within the six-question/five-candidate discipline without displacing a stronger candidate. Recorded in `../04_caps-and-incomplete-scope.md` as an incomplete slice of RQ6.
- **G6.2** The entire benchmark-journey/persona construction is downstream work (NEU-898); this record supplies only the evidence boundary.
