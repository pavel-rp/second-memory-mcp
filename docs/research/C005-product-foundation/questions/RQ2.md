# RQ2 — Pedagogy for algorithmic problem-solving skill acquisition (worked examples, subgoal labeling, schemas)

**Declared:** 2026-07-11 (see `../02_research-questions.md`) · **Search cutoff:** 2026-07-11
**Status:** Answered within caps (5 candidates reviewed, 3 included).

## Search record

| Field | Value |
| --- | --- |
| Interface | `WebSearch` (Claude Code tool, US region), 2026-07-11 |
| Exact query | `worked examples subgoal labeling algorithm problem solving pedagogy dynamic programming learning` |
| Selection method | Per method §3: programming/algorithm-domain studies preferred over primary-school or generic-math populations; venue quality; direct relevance to *procedural problem-solving* skill. |

## Candidate ledger (5 reviewed / cap 5)

| # | Candidate | Decision | Rationale |
| - | --- | --- | --- |
| C1 | Margulieux, Catrambone et al., *Subgoals, Context, and Worked Examples in Learning Computing Problem Solving* (ICER lineage; ResearchGate 300116921) | **INCLUDED** (S1) | Foundational subgoal-labeling work in the *computing* domain specifically. |
| C2 | *Reducing withdrawal and failure rates in introductory programming with subgoal labeled worked examples*, Int. J. STEM Education (2020), link.springer.com/article/10.1186/s40594-020-00222-7 | **INCLUDED** (S2) | Semester-scale programming-course deployment; longitudinal outcome data. |
| C3 | *AlgoSolve: Supporting Subgoal Learning in Algorithmic Problem-Solving* (CHI 2022), xiameng.org/2022_CHI_AlgoSolve.pdf | **INCLUDED** (S3) | The only candidate targeting *algorithmic* (not just introductory-syntax) problem-solving — closest to DP. |
| C4 | *Impact of Subgoal Labeling on Online Worked Example Learning in Mathematics for Primary School Students*, Frontiers in Education (2022) | EXCLUDED | Primary-school mathematics population — mismatched audience. |
| C5 | *Improving problem solving with subgoal labels in expository text and worked examples*, Learning & Instruction (ScienceDirect S095947521530044X) | EXCLUDED | Overlaps S1's authors/paradigm with less computing-domain specificity; the 3-inclusion cap forces the more domain-relevant set. |

## Included sources & findings

All claims below: **[literature]**.

- **F2.1** Subgoal-labeled worked examples improve problem-solving performance in computing learners by chunking solution steps into meaningful, transferable units and reducing cognitive load; the effect is repeatedly demonstrated in programming courses. Cutoff 2026-07-11. *(S1, S2)*
- **F2.2** The mechanism is *schema formation*: labels help learners separate structural information from incidental detail, which is precisely the pattern-recognition skill DP mastery requires (identifying the recurrence structure beneath surface stories). Cutoff 2026-07-11. *(S1, S3)*
- **F2.3** Subgoal support scales to *algorithm-design* tasks, not only code-writing: AlgoSolve (CHI 2022) shows learner-facing subgoal scaffolds aiding algorithmic problem decomposition. Cutoff 2026-07-11. *(S3)*
- **F2.4** Deployment-scale evidence exists: subgoal-labeled instruction reduced early assessment failure in semester-long intro programming courses — evidence of durability of the instructional effect across a course, though in a *novice* population, below this product's target competence floor. Cutoff 2026-07-11. *(S2)*

## Conflicts

- Population mismatch tension: the strongest deployment evidence (S2) is on novices, while the target learner is already competent. Worked-example research elsewhere predicts an **expertise-reversal effect** (worked examples can lose value or invert for higher-prior-knowledge learners) — that specific boundary was not verifiable within this question's candidate cap and is recorded as a gap rather than asserted. [unverified]

## Unresolved gaps

- **G2.1** Expertise-reversal boundary for already-competent programmers: not answerable within the 5-candidate cap (would require a sixth source). Recorded in `../04_caps-and-incomplete-scope.md`.
- **G2.2** No included source tests subgoal/worked-example pedagogy on *dynamic programming specifically*; the closest is algorithmic problem-solving generally (S3).
- **G2.3** Interaction between retrieval-practice scheduling (RQ1) and worked-example study for the same skill is not covered by any included source — the two literatures are largely separate.
