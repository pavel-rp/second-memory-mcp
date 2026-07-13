# M04 — Spacing (Distributed Practice)

**Mechanism:** Distributing practice of the same material across separated sessions rather than massing it. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, spacing governs the cadence at which a concept or problem type returns for review across days/sessions. This file collects the evidence on distributed vs. massed practice and on spaced criterion practice. It selects no schedule or algorithm.

## Labeled findings

**F-M04-1** — `[literature]` · Distributed practice is **high utility** (top tier with practice testing) and rests on an exceptionally large evidence base: a meta-analysis of **317 experiments across 184 articles**. *Provenance:* Cepeda, Pashler, Vul, Wixted & Rohrer (2006), *Psychological Bulletin* 132(3):354–380, https://pubmed.ncbi.nlm.nih.gov/16719566/; Dunlosky et al. (2013) utility rating (reused, audit Q5/Q10). *Cutoff:* 2026-07-07. *Evidence type:* causal (large meta-analysis). *Limitation:* The specific optimal inter-study-interval ratio was not independently pulled in the prior audit and is not asserted; effects are on retention, not DP transfer.

**F-M04-2** — `[literature]` · **Spaced criterion practice beats massed for the same number of correct recalls:** "One-week retention was better when students had recalled items correctly one time in each of three spaced sessions than when they had correctly recalled each item three times during a single session: **68% vs. 26%** retention respectively." *Provenance:* Rawson & Dunlosky (2022), *Current Directions*, https://journals.sagepub.com/doi/full/10.1177/09637214221100484 (reused, audit Q5). *Cutoff:* 2026-07-07. *Evidence type:* causal (direct comparison). *Limitation:* Verbal materials; the finding is about *when* correct recalls occur (spaced), directly relevant to same-session massed follow-ups (see M07/M09).

**F-M04-3** — `[literature]` · Successive relearning — practicing to a correct-recall criterion, then again in later spaced sessions — is the construct that combines retrieval + spacing: "practicing a task until it is performed correctly and then practicing it again until it is performed correctly during **other spaced practice sessions**." *Provenance:* Rawson & Dunlosky (2022), same URL. *Cutoff:* 2026-07-07. *Evidence type:* causal/definitional. *Limitation:* The criterion counts (how many correct recalls per session) are weakly constrained by evidence: "no benefit of requiring four correct trials ... compared to three," typically **1** correct recall per subsequent spaced session — see M07/M09.

**F-M04-4** — `[literature]`/`[code-evidence]` · Modern schedulers (FSRS) outperform SM-2 on calibrated recall: FSRS-6 showed "99.6% superiority over Anki SM-2" (log loss) across 9,999 collections / ~349.9M reviews; but "there is no way to have a truly fair, no caveats, comparison between FSRS and SM-2." *Provenance:* https://expertium.github.io/Benchmark.html (reused, audit Q1). *Cutoff:* 2026-07-07. *Evidence type:* large observational benchmark. *Limitation:* Observational (not a controlled learning-outcome trial); superiority is in probability calibration, not demonstrated retention gain for this product's learners.

## Cognitive-load / desirable-difficulty note

Spacing is a **desirable difficulty**: the forgetting that accrues between sessions makes the next retrieval harder and therefore more potent (F-M04-2, links to M03 F-M03-4). It does not itself raise intrinsic load within a session; its cost is scheduling complexity and the risk of spacing so wide that retrieval fails outright (the accomplishable-difficulty bound, `02_…` F-DD-1).

## DP-transfer uncertainty

Spacing effects are robust for retention across many materials but were not measured on DP problem-solving transfer; retention-optimized spacing may not produce transfer (`02_…` F-TR-2/3). DP effectiveness stays provisional.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M04-5** — `[code-evidence]` · The existing system schedules with modified SM-2 (intervals 1d, 6d, then ×EF; EF start 2.5, min 1.3, no ceiling; **no fuzz/jitter**), grafts an FSRS-style retrievability power law onto SM-2 interval for tier selection only (not scheduling), and fits/persists no per-item stability/difficulty. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q1/Q8; `src/domain/algorithms/sr-calculator.ts`, `src/domain/config/algorithm-defaults.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability; whether SM-2 vs FSRS matters for this product, and whether missing fuzz is material, are reconciliation-sub-task verdicts (the audit flags batch-teaching clumping as plausibly material) — not decided here.

**F-M04-6** — `[code-evidence]`/`[literature]` · The roadblock gate requires *same-session massed* follow-up correct answers before progression, which is structurally the inferior (26%) condition in F-M04-2. *Provenance:* audit Q5; `src/orchestration/teaching-workflows.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact vs. causal literature. *Limitation:* This is an alignment concern surfaced as evidence (see `03_synthesis.md` C2 and M07/M09); the reconciliation verdict is deferred.
