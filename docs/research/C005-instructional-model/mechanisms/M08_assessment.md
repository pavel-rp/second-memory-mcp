# M08 — Assessment (including graded quality signal)

**Mechanism:** Measuring learner performance to produce a quality/mastery signal — here, delegated to an AI grader. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, assessment is how the system scores an attempt into a signal that drives scheduling and progression. Because grading is delegated to an LLM that also generates and judges its own interaction, assessment is a **learning-critical** behavior (NEU-888). This file collects the evidence on grading reliability and on the quality signal's fidelity. It selects no grading policy or control.

## Labeled findings

**F-M08-1** — `[literature]` · A quality scale encodes *difficulty of successful recall*, not just correct/incorrect; collapsing it to binary discards load-bearing information. SM-2's grades run 0–5 ("5 – perfect response ... 3 – correct response recalled with serious difficulty ... 0 – complete blackout"), and FSRS's current best algorithm takes the raw grade directly rather than going binary. *Provenance:* https://www.supermemo.com/en/archives1990-2015/english/ol/sm2; https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm (reused, audit Q2). *Cutoff:* 2026-07-07. *Evidence type:* algorithm specification. *Limitation:* About scheduler input fidelity, not learning outcomes directly.

**F-M08-2** — `[literature]` · **Delegated LLM grading is only human-agreement-reliable at best and carries baked-in biases:** strong LLM judges "achieve over 80% agreement, the same level of agreement between humans," with documented "position, verbosity, and self-enhancement biases." *Provenance:* Zheng et al. (2023), NeurIPS, https://arxiv.org/abs/2306.05685 (reused, audit Q3). *Cutoff:* 2026-07-07. *Evidence type:* empirical. *Limitation:* Best-case; not superhuman; self-grading one's own generated interaction compounds self-enhancement bias.

**F-M08-3** — `[literature]` · **LLM graders over-validate incorrect answers exactly where grading matters most:** F1 94–99% for optimal solutions but "0–76%" for valid alternatives and "4–55%" for incorrect solutions; some models "over-validated incorrect solutions up to **71%** of the time." *Provenance:* https://arxiv.org/html/2605.16207 (reused, audit Q3). *Cutoff:* 2026-07-07. *Evidence type:* empirical (closest analogue to this system's mechanism). *Limitation:* Not DP-specific; the 71% is a per-model worst case.

**F-M08-4** — `[literature]` · **Sycophancy under learner rebuttal flips grades indiscriminately:** conversational rebuttal flipped a correct answer "45.2% of the time"; a casually assertive rebuttal reached "84.5% persuasion but only 17.1% correction rate." *Provenance:* "Challenging the Evaluator," https://arxiv.org/html/2509.16533 (reused, audit Q3). *Cutoff:* 2026-07-07. *Evidence type:* empirical. *Limitation:* Analogous to a learner pushing back on a live score; not measured in this product.

## Cognitive-load / desirable-difficulty note

Assessment does not itself manage learner load, but its *fidelity* gates every other mechanism: an over-lenient grade (F-M08-3) removes desirable difficulty invisibly (the learner is advanced before mastery), while a binary-collapsed signal (F-M08-1) corrupts the scheduler that spaces desirable-difficulty retrieval (M04). A corrupted assessment signal silently defeats the load/difficulty calibration of the whole model.

## DP-transfer uncertainty

LLM-grading reliability figures are from general or non-DP tutoring tasks; grading fidelity on *DP-specific* correctness (a valid-but-unusual recurrence, an off-by-one base case) is unmeasured and plausibly worse given F-M08-3's "valid alternatives" weakness. DP grading reliability stays provisional and is a standing risk.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M08-5** — `[code-evidence]` · The AI client generates the question, judges the answer, and self-reports quality 0–5 (`passed` defaults q≥3). A session-scoped quality cap limits inflation *after* an early low score (0–1 caps later at 3; 2 caps at 4) — but does **not** catch uniform leniency from the first turn (the dominant failure mode in F-M08-3). Assessment mode forces binary (pass→5, fail→1), the exact collapse F-M08-1 warns against. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q2/Q3; `src/orchestration/teaching-workflows.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability; the enforceable-control requirement (NEU-888) for this learning-critical behavior is evidence here, a downstream decision there. The prior audit's specific self-preference-bias percentages are UNVERIFIED and not asserted.
