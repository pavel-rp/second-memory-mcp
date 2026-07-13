# M05 — Interleaving

**Mechanism:** Mixing different problem types/categories within a practice session versus blocking one type at a time. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, interleaving would mix distinct DP problem types/patterns (e.g. knapsack vs. LIS vs. interval DP) within a session so the learner must first *identify* which applies. This file collects the evidence on interleaving vs. blocking and on which axis "interleaving" means. It selects no session-composition policy.

## Labeled findings

**F-M05-1** — `[literature]` · Interleaving produces a delayed-test advantage over blocking, sometimes large: Rohrer & Taylor (2007) geometric-solids task reported **d = 1.34** at a one-week retention test for the interleaved group over blocked. *Provenance:* https://pmc.ncbi.nlm.nih.gov/articles/PMC10658001/ (secondary confirmation; primary PDF not rendered — reused, audit Q10). *Cutoff:* 2026-07-07. *Evidence type:* causal (single study, secondary-confirmed). *Limitation:* One task/domain; large effect not necessarily representative (see F-M05-2).

**F-M05-2** — `[literature]` · Meta-analytically the effect is **moderate**, not uniformly large: Brunmair & Richter (2019) report an overall **Hedges' g = 0.42** for interleaved learning; Dunlosky et al. (2013) rate interleaving **moderate utility** (not high). *Provenance:* https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf; Dunlosky et al. 2013 (reused, audit Q10). *Cutoff:* 2026-07-07. *Evidence type:* meta-analytic (causal studies pooled). *Limitation:* Effect varies by material; low-achieving learners may need initial blocking (audit UNVERIFIED Hwang 2025 — carried as a gap, not asserted).

**F-M05-3** — `[literature]` · The evidenced axis is **category/problem-type mixing, not difficulty ordering.** "No research literature was found treating difficulty-level (easy/medium/hard) sequencing as the 'interleaving' manipulation"; the benefit is attributed to practicing *discrimination* between problem types. *Provenance:* audit Q10, `docs/research/results/03-pedagogy-evidence-audit.md`. *Cutoff:* 2026-07-07. *Evidence type:* review/absence-of-evidence. *Limitation:* An easy-medium-hard ramp is not the evidenced construct; see M01 F-M01-3.

**F-M05-4** — `[literature]` · Interleaving is a desirable difficulty learners systematically *misjudge*: in Kornell & Bjork (2008) interleaving beat blocking on a transfer/induction test "even though participants consistently believed that blocking ... had been more helpful." *Provenance:* audit Q10 (search-synthesis; primary PDF 403'd — carried as directional). *Cutoff:* 2026-07-07. *Evidence type:* causal (directional here). *Limitation:* Primary not re-fetched; the metacognitive-illusion point is well-replicated in the broader literature.

## Cognitive-load / desirable-difficulty note

Interleaving is a **desirable difficulty**: mixing raises retrieval and discrimination difficulty within a session, improving durable category learning and transfer (F-M05-1/2/4) at the cost of higher moment-to-moment load and lower apparent fluency. For high-intrinsic-load DP problems, unrestricted interleaving of first-exposure material could exceed working memory; the literature and practice suggest interleaving *review* of already-unlocked material rather than initial teaching (M01 F-M01-4).

## DP-transfer uncertainty

Interleaving's benefit is often measured *as* a transfer/induction effect in its studied domains, which makes it the most transfer-relevant mechanism — but still not measured on DP problem-type discrimination specifically (F-TR-3). DP effectiveness stays provisional; the discrimination-transfer analogy to DP pattern-recognition is promising but unmeasured.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M05-5** — `[code-evidence]` · **No interleaving is implemented.** Ordering is topological + author order; the `interleaveStrategy:'easy-medium-hard'` config and session-composition caps (maxNew=3 etc.) are **dead code** — and the dead config names the *wrong axis* (difficulty, not category) per F-M05-3. Stale-prerequisite re-injection is the closest existing behavior to review-interleaving. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q10; `src/domain/algorithms/resolve-stale-prerequisites.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability/absence; whether to add category-interleaving and on which material is a downstream decision, not made here.
