# M03 — Retrieval Practice

**Mechanism:** Prompting the learner to recall/produce from memory rather than re-study, including retrieval that fails. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused, live-verified in prior audit). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, retrieval practice is any prompt to reconstruct a concept, derive a recurrence, or solve a problem from memory. This file collects the evidence on retrieval's benefit and on errorful retrieval. It selects no drill format or cadence.

## Labeled findings

**F-M03-1** — `[literature]` · Practice testing (retrieval) is rated **high utility** — the top tier alongside distributed practice — in the canonical techniques review. *Provenance:* Dunlosky, Rawson, Marsh, Nathan & Willingham (2013), *Psychological Science in the Public Interest* 14(1):4–58, https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html (reused, audit Q10). *Cutoff:* 2026-07-07. *Evidence type:* causal (review of controlled studies). *Limitation:* "High utility" is across domains studied; DP problem-solving transfer not specifically established.

**F-M03-2** — `[literature]` · **Errorful/unsuccessful retrieval still enhances learning** — a causal result directly supporting real attempts before answers are shown. "Unsuccessful retrieval attempts enhanced learning ... taking challenging tests—instead of avoiding errors—may be one key to effective learning." *Provenance:* Kornell, Hays & Bjork (2009), *J. Exp. Psych: LMC*, https://pubmed.ncbi.nlm.nih.gov/19586265/ (reused, audit Q4). *Cutoff:* 2026-07-07. *Evidence type:* causal. *Limitation:* Studied on verbal materials; the benefit depends on subsequent correct-answer exposure (see M06).

**F-M03-3** — `[literature]` · The retrieval *attempt* carries most of the benefit, and a correct-answer exposure after it adds a little more: final retention Control (single study) 18%, Restudy-only 57%, Test-without-feedback 78%, **Test-with-feedback 80%**. *Provenance:* test-potentiated-encoding study, https://pmc.ncbi.nlm.nih.gov/articles/PMC10157468/ (reused, audit Q4). *Cutoff:* 2026-07-07. *Evidence type:* causal (condition comparison). *Limitation:* Percentages are study-specific; the feedback increment (78→80) is small in this study, larger in others (see M06 Pashler +494%).

**F-M03-4** — `[literature]` · Retrieval strength at attempt time predicts the learning gain: "the lower the retrieval strength at that moment, the greater the boost in storage strength (i.e., learning)" — *if the retrieval succeeds* (see `02_…` F-DD-2). *Provenance:* https://www.learningscientists.org/blog/2016/5/10-1 (Bjork, reused, audit Q11). *Cutoff:* 2026-07-07. *Evidence type:* mechanistic/theoretical. *Limitation:* Synthesis, not a single controlled study; the success condition is the design tension.

## Cognitive-load / desirable-difficulty note

Retrieval is the archetypal **germane-load / desirable-difficulty** spend: it is effortful by design and that effort is where durable encoding happens (F-M03-2, F-M03-4). Its interaction with intrinsic load matters for DP — a retrieval prompt over a high-element-interactivity DP derivation can exceed working memory; the desirable difficulty must stay accomplishable (`02_…` F-DD-1).

## DP-transfer uncertainty

Retrieval-practice effects are established on facts and well-structured items; **far transfer of retrieval benefits is not automatic** and is an active research question (`02_…` F-TR-2). Whether retrieval drills on DP concepts transfer to solving novel DP problems is unmeasured (F-TR-3); DP effectiveness stays provisional.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M03-5** — `[code-evidence]` · The existing system is retrieval-centric: teaching is drill-based with the AI client eliciting recall, retrievability tiers select drill format, and a 2-attempt-with-hint structure gives a real second retrieval attempt before recording failure. It does **not** currently expose the correct answer after a second failure. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q4; `src/orchestration/teaching-workflows.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability; the "no correct-answer exposure after 2nd failure" gap is evidence for the reconciliation/feedback sub-tasks (see M06), not a verdict here.
