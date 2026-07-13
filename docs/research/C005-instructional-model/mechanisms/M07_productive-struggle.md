# M07 — Productive Struggle

**Mechanism:** Letting the learner attempt and err before support/answers, within an accomplishable bound. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, productive struggle is the deliberate withholding of scaffolding so the learner wrestles with a DP problem before help arrives — bounded so the task stays achievable. This file collects the evidence on errorful/effortful learning and its bounds. It selects no struggle/scaffold policy.

## Labeled findings

**F-M07-1** — `[literature]` · Effortful, errorful attempts enhance learning relative to error-avoidant study: "taking challenging tests—instead of avoiding errors—may be one key to effective learning" (see M03 F-M03-2). *Provenance:* Kornell, Hays & Bjork (2009), https://pubmed.ncbi.nlm.nih.gov/19586265/ (reused, audit Q4). *Cutoff:* 2026-07-07. *Evidence type:* causal. *Limitation:* The benefit requires subsequent correct-answer exposure (M06); struggle without resolution is not endorsed.

**F-M07-2** — `[literature]` · Struggle is only *productive* within the accomplishable band — the explicit desirable-difficulty bound: "the task must be able to be accomplished. Too difficult a task may dissuade the learner and prevent full processing." *Provenance:* https://en.wikipedia.org/wiki/Desirable_difficulty (reused, audit Q11). *Cutoff:* 2026-07-07. *Evidence type:* principle over causal base. *Limitation:* No domain-general boundary for "too difficult"; unmeasured for DP.

**F-M07-3** — `[literature]` · The productive zone is learner-state-dependent (region of proximal learning / Challenge Point inverted-U): maximal gain from items "close to being learned but ... not yet ... mastered"; "learning is low when functional difficulty is too low or too high" (see `02_…` F-DD-3). *Provenance:* https://pmc.ncbi.nlm.nih.gov/articles/PMC2742428/ (Metcalfe); Challenge Point via audit Q11 (motor-learning, directional). *Cutoff:* 2026-07-07. *Evidence type:* Metcalfe causal; Challenge Point analogical. *Limitation:* Motor-learning generalization to DP is an analogy.

**F-M07-4** — `[literature]` · A real second attempt (with a diagnostic hint) before revealing the answer is supported by errorful-learning evidence; but its value depends on the hint correctly diagnosing the failure — where AI tutors are weak (F-M06-4). *Provenance:* audit Q4 (Kornell 2009 + LLM-tutor reliability paper). *Cutoff:* 2026-07-07. *Evidence type:* causal (structure) + empirical caveat. *Limitation:* No study pins the *optimal number* of attempts; "2" is not evidence-derived.

## Cognitive-load / desirable-difficulty note

Productive struggle is the explicit **desirable-difficulty** management mechanism — it *is* the dial. Its whole design problem is staying inside the accomplishable band (F-M07-2/3): too little struggle wastes the germane-load opportunity, too much exceeds working memory for high-intrinsic-load DP derivations and becomes unproductive. It is tightly coupled to feedback (M06) — struggle must resolve into correction.

## DP-transfer uncertainty

Errorful-learning benefits are established on verbal/well-structured tasks; whether struggling on DP problems transfers to novel DP problem-solving is unmeasured (F-TR-3). DP effectiveness stays provisional; the accomplishable-band boundary for DP is itself unmeasured.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M07-5** — `[code-evidence]` · The existing system operationalizes bounded struggle via the 2-attempt-with-pivot-hint structure and retrievability-tiered scaffolding (degrading to recognition only at R<0.3, keeping open-ended recall above), which broadly tracks the accomplishable-band principle — but the step is a coarse binary flip, not a smooth challenge-point tracker, and offers no in-session re-promotion. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q11; `src/domain/algorithms/classify-chunk.ts`, `src/orchestration/teaching-workflows.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability; whether the tier structure adequately tracks the moving challenge point is a downstream verdict.
