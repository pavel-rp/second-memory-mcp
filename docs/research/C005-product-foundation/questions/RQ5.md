# RQ5 — Reliability of LLM-based grading/critique of learner answers

**Declared:** 2026-07-11 (see `../02_research-questions.md`) · **Search cutoff:** 2026-07-11
**Status:** Answered within caps (5 candidates reviewed, 3 included).

## Search record

| Field | Value |
| --- | --- |
| Interface | `WebSearch` (Claude Code tool, US region), 2026-07-11 |
| Exact query | `LLM as judge grader reliability bias evaluating answers limitations 2024 2025` |
| Supplementary interface | Repo corpus: `docs/research/results/03-pedagogy-evidence-audit.md` (Q3, LLM self-grading), verification cutoff 2026-07-07 |
| Selection method | Per method §3: systematic/large-scale evaluations over single anecdotes; peer-reviewed or arXiv-with-scale over vendor blogs. |

## Candidate ledger (5 reviewed / cap 5)

| # | Candidate | Decision | Rationale |
| - | --- | --- | --- |
| C1 | *Reliability without Validity: A Systematic, Large-Scale Evaluation of LLM-as-a-Judge Models Across Agreement, Consistency, and Bias* (arXiv 2606.19544) | **INCLUDED** (S1) | Largest-scale systematic evaluation surfaced; directly addresses reliability vs. validity. |
| C2 | *Evaluating Scoring Bias in LLM-as-a-Judge* (arXiv 2506.22316) | **INCLUDED** (S2) | Focused specifically on *scoring* bias — the grading use-case this product would exercise. |
| C3 | Repo prior research: `docs/research/results/03-pedagogy-evidence-audit.md` Q3 (LLM self-grading reliability, tutor over-validation) | **INCLUDED** (S3) | Existing-project research; already adjudicated tutor-context grading with live-verified citations. |
| C4 | Galileo.ai blog *LLM-as-a-Judge vs Human Evaluation* | EXCLUDED | Vendor marketing content; claims duplicative of S1/S2 without primary data. |
| C5 | *Judge Reliability Harness: Stress Testing the Reliability of LLM Judges* (arXiv 2603.05399) | EXCLUDED | Methodology-tooling focus; adds a harness, not new reliability findings beyond S1; 3-inclusion cap. |

## Included sources & findings

All claims below: **[literature]** unless marked as existing-project research.

- **F5.1** LLM judges exhibit documented systematic biases: self-preference (favoring own generations, with correlation between self-recognition and bias strength), positional bias (verdicts flip when answer order swaps), verbosity bias (longer ≠ better answers preferred), and reference/rubric anchoring effects. Cutoff 2026-07-11. *(S1, S2)*
- **F5.2** Point-estimate agreement with human raters on small validation sets does **not** guarantee robustness: judge behavior shifts under realistic input variation (formatting, paraphrase, verbosity, sampling parameters), and consistency across prompts/runs is a recurring failure mode. Cutoff 2026-07-11. *(S1)*
- **F5.3 [existing-project research]** In the tutoring context specifically, the prior pedagogy audit found LLM-judge consistency can swing substantially on incidental framing and that LLM tutors over-validate incorrect answers precisely in the hardest cases — where grading matters most — and that Second Memory's only in-place guardrail (session-scoped quality cap) cannot catch uniformly-lenient grading. `docs/research/results/03-pedagogy-evidence-audit.md` §1 finding 3 and Q3, cutoff 2026-07-07. *(S3)*
- **F5.4** Mitigations exist (aggregation/ensembling, variance-based detection, bias-aware rubrics) with strong reported agreement in specific setups, but chain-of-thought rationales are not always faithful and naive sampling can amplify bias — mitigation is configuration-specific, not a property of "using an LLM judge". Cutoff 2026-07-11. *(S1, S2)*

## Implication for the evidence taxonomy (this task's own artifact)

These findings are the basis for the limitation fields of classes 4 ([ai-critique]) and 5 ([automated-eval]) in `../01_evidence-taxonomy.md`: AI judgments require recorded conditions (model/version, prompt, exposure), independent initialization, and can never substitute for human/expert validation. This is a taxonomy-limitation input, **not** a provider or architecture decision.

## Conflicts

- Reported mitigation efficacy (S1/S2's high-agreement configurations) vs. tutor-context over-validation findings (S3): mitigation results come from benchmark-style evaluation, not tutoring dialogs; whether they transfer to grading DP problem-solving answers is unestablished.

## Unresolved gaps

- **G5.1** No included source measures LLM grading reliability on *algorithmic problem solutions* (code or recurrence derivations) specifically. [unverified for the DP domain]
- **G5.2** The measurement design that would make AI-graded mastery signals trustworthy for *this* product (independent judges, anchoring, drift monitoring) is a later-chapter measurement-contract question (NEU-899+); this record only bounds what the evidence class can claim.
