# M06 — Feedback

**Mechanism:** Information given after a response about correctness and the correct answer/explanation. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, feedback is what the system does after a learner's attempt: confirm/correct, reveal the answer, explain the gap. This file collects the evidence on corrective feedback and its persistence. It selects no feedback policy or timing.

## Labeled findings

**F-M06-1** — `[literature]` · **Corrective feedback after an incorrect response has a very large retention effect:** "Supplying the correct answer after an incorrect response not only improved performance during the initial learning session—it also increased final retention by **494%**." *Provenance:* Pashler, Cepeda, Wixted & Rohrer (2005), *Psychonomic Bulletin & Review*, https://pubmed.ncbi.nlm.nih.gov/15641900/ (reused, audit Q4). *Cutoff:* 2026-07-07. *Evidence type:* causal. *Limitation:* Verbal materials; "494%" is relative to a low no-feedback baseline in that study — direction is robust, the magnitude is study-specific.

**F-M06-2** — `[literature]` · **Errors resurface without reinforced correction** — the case against "record the failure and move on." The hypercorrection effect: "high-confidence errors were more likely than low-confidence errors to be reproduced on the delayed test" when the correction wasn't reinforced; even corrected errors decayed by the delayed test. *Provenance:* Butler, Fazio & Marsh (2011), *Psychonomic Bulletin & Review*, https://pubmed.ncbi.nlm.nih.gov/21989771/ (reused, audit Q4). *Cutoff:* 2026-07-07. *Evidence type:* causal. *Limitation:* Origin attribution (Butterfield & Metcalfe 2001) not re-fetched; persistence findings confirmed.

**F-M06-3** — `[literature]` · Feedback adds a modest increment on top of the retrieval attempt in some designs (Test-without-feedback 78% vs Test-with-feedback 80%, F-M03-3) but a large one in others (F-M06-1) — the increment size depends on whether the attempt alone already exposed the learner to the correct structure. *Provenance:* https://pmc.ncbi.nlm.nih.gov/articles/PMC10157468/ (reused, audit Q4). *Cutoff:* 2026-07-07. *Evidence type:* causal (condition comparison). *Limitation:* The right generalization is "some correct-answer exposure after the attempt," not a fixed increment.

**F-M06-4** — `[literature]` · Feedback *quality* depends on correct diagnosis of the error — and AI tutors are specifically unreliable at this: LLM tutors were reliable at confirming optimal solutions (F1 94–99%) but poor at diagnosing valid alternatives (0–76%) and incorrect solutions (4–55%). *Provenance:* "Confirming Correct, Missing the Rest," https://arxiv.org/html/2605.16207 (reused, audit Q3/Q4). *Cutoff:* 2026-07-07. *Evidence type:* empirical (LLM evaluation). *Limitation:* This makes AI-delivered diagnostic feedback a *learning-critical* behavior needing an enforceable control (NEU-888) — recorded as evidence; the control is a downstream decision.

## Cognitive-load / desirable-difficulty note

Feedback is the **germane-load consolidation** step that follows a desirable-difficulty retrieval attempt: the attempt creates the difficulty, the feedback resolves it into a corrected schema (F-M06-1/2). Withholding feedback preserves difficulty but risks unreinforced errors persisting (F-M06-2). The design tension is timing (immediate vs delayed) and depth (confirm vs explain), both of which trade load against difficulty.

## DP-transfer uncertainty

Corrective-feedback effects are measured on verbal/factual materials, not DP problem-solving. Whether explanatory feedback on a failed DP derivation transfers to novel DP problems is unmeasured (F-TR-3). DP effectiveness stays provisional. AI diagnostic reliability on *DP-specific* errors is additionally unmeasured (extends F-M06-4).

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M06-5** — `[code-evidence]` · After a second failed attempt the existing system **records the failure and moves on** — it does not surface the correct answer/explanation, exactly the condition F-M06-1/2 argue against. Feedback is delivered by the AI client, which also generated and judged the question (self-grading), implicating F-M06-4's diagnostic-reliability concern. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q4; `src/orchestration/teaching-workflows.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability/absence; whether to add a correct-answer exposure step, and what enforceable control the AI feedback needs, are downstream verdicts.
