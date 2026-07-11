# RQ1 — Durable mastery via retrieval practice and spacing in adult, competent learners

**Declared:** 2026-07-11 (see `../02_research-questions.md`) · **Search cutoff:** 2026-07-11
**Status:** Answered within caps (5 candidates reviewed, 3 included).

## Search record

| Field | Value |
| --- | --- |
| Interface | `WebSearch` (Claude Code tool, US region), 2026-07-11 |
| Exact query | `retrieval practice spacing effect durable learning meta-analysis expert learners transfer` |
| Supplementary interface | Repo corpus: `docs/research/results/03-pedagogy-evidence-audit.md` (verification cutoff 2026-07-07) |
| Selection method | Per method §3: primary/meta-analytic sources over aggregators; adult/education-general populations over mismatched (child, L2-vocabulary) populations; systematic reviews preferred. |

## Candidate ledger (5 reviewed / cap 5)

| # | Candidate | Decision | Rationale |
| - | --- | --- | --- |
| C1 | Carpenter et al., *The science of effective learning with spacing and retrieval practice*, Nature Reviews Psychology (2022), nature.com/articles/s44159-022-00089-1 | **INCLUDED** (S1) | Peer-reviewed integrative review of both effects; population breadth includes adults; primary venue. |
| C2 | *A Meta-analytic Review of the Effectiveness of Spacing and Retrieval Practice for Mathematics Learning*, Educ. Psychol. Review (2025), link.springer.com/article/10.1007/s10648-025-10035-1 | **INCLUDED** (S2) | Most recent meta-analysis in a *problem-solving-adjacent* domain (mathematics), closer to DP than vocabulary studies. |
| C3 | *Effects of retrieval practice on retention and application of complex educational concepts*, Learning & Instruction (2025), sciencedirect.com/science/article/pii/S0959475225001434 | **INCLUDED** (S3) | Directly addresses the transfer/application boundary condition for *complex* material — the contested edge for DP. |
| C4 | *Retrieval practice enhances learning in real primary school settings…* (PMC12372469) | EXCLUDED | Primary-school population — mismatched with the adult, already-competent target learner. |
| C5 | *The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis* (ResearchGate) | EXCLUDED | L2-vocabulary domain — fact retention, not problem-solving skill; weaker relevance than C2 in the same slot. |

## Included sources & findings

All claims below: **[literature]** — external studies; populations/tasks are not this product's learners; nothing here validates the DP product with real users.

- **F1.1** Retrieval practice and spacing are among the most robust findings in learning science: meta-analytic effect sizes for retrieval practice vs. restudy are medium-to-large (Rowland 2014 g ≈ 0.50; Adesope et al. 2017 g ≈ 0.61, as summarized in S1's review lineage). Cutoff 2026-07-11. *(S1)*
- **F1.2** The benefits extend beyond verbatim retention: distributed/retrieval practice supports application and generalization of concepts in authentic adult educational contexts — but transfer effect sizes run **smaller** (small-to-medium) than retention effect sizes. Cutoff 2026-07-11. *(S1, S3)*
- **F1.3** In mathematics learning specifically — the closest meta-analyzed domain to algorithmic problem-solving — spacing and retrieval practice remain effective, supporting cautious extension of these mechanisms beyond fact recall toward procedural/problem domains. Cutoff 2026-07-11. *(S2)*
- **F1.4** (Corroborating repo research, separate provenance) The prior pedagogy audit graded Second Memory's retrieval-practice core as evidence-aligned while flagging that several load-bearing scheduling thresholds diverge from reference systems — i.e., mechanism-level support does not certify parameter-level choices. `docs/research/results/03-pedagogy-evidence-audit.md` §1, cutoff 2026-07-07. *(repo research, [literature] class via that report's own sourcing)*

## Conflicts

- Retention vs. transfer: S1's lineage reports medium-to-large retention effects, while transfer-focused syntheses (S1, S3) report small-to-medium — the literature does **not** guarantee that retention-optimized mechanics produce problem-solving transfer. Recorded as a live conflict for the learner-model task, not resolved here.

## Unresolved gaps

- **G1.1** No included source measures retrieval/spacing effects in *competitive-programming* or algorithm-design tasks specifically; the DP-domain extension rests on the mathematics analogy (S2). [unverified beyond analogy]
- **G1.2** Optimal spacing schedules for multi-month mastery of hierarchical skills (DP pattern dependencies) were not answerable within the 5-candidate cap; recorded in `../04_caps-and-incomplete-scope.md`.
