# Synthesis — Findings, Conflicts, and Unresolved Gaps

**Task:** NEU-897 · **Compiled:** 2026-07-11
**This synthesis makes no product, pedagogy, curriculum, UI, architecture, provider, telemetry, or production decision.** It aggregates the labeled findings of RQ1–RQ6 (see `questions/`) so the downstream learner/product-model task (NEU-898) and its siblings receive evidence, conflicts, and gaps — not conclusions. Every statement carries its evidence class and traces to a question record.

---

## 1. Cross-question findings (labeled, provisional)

**Mechanism-level learning science is strong; domain-level extension to DP is an analogy.**
Retrieval practice and spacing have medium-to-large retention effects and extend into mathematics — the closest meta-analyzed neighbor to algorithmic problem-solving (RQ1 F1.1–F1.3, [literature]). But no included source measures these effects on competitive-programming or algorithm-design tasks (RQ1 G1.1). Downstream chapters may treat the mechanism as evidence-backed while treating its DP application as a hypothesis needing product-side measurement.

**Problem-solving skill has its own pedagogy evidence, distinct from fact retention.**
Subgoal-labeled worked examples and schema formation are the supported mechanisms for algorithmic problem-solving (RQ2 F2.1–F2.3, [literature]). Retention mechanics alone (RQ1) do not cover the skill DP mastery requires; the two literatures are largely disjoint (RQ2 G2.3). Any learner model that assumes "flashcards for DP" without a schema-formation component would be leaning past the evidence.

**The competitive-programming tool landscape optimizes for volume, not durable mastery.**
Major platforms document contest/grind practice with no retention model; spaced repetition exists only as bolt-on niche tooling (RQ3 F3.1–F3.2, [literature] tool documentation). Prior project research found the "AI tutor + memory graph" position uncrowded while explicitly warning that an empty niche is not demand evidence (RQ3 F3.3, existing-project research).

**The existing codebase can measure more than it currently does — and its logs are payload-bearing.**
Per-attempt data (pass/fail, quality, question type, time spent) is persisted, but at least one exposed metric is declared and uncomputed (`averageQuality` TODO), so metric feasibility must be verified per signal, never inferred from a field name (RQ4 F4.1–F4.3, [code-evidence]). Learner response text is intentionally unredacted in logs, so all future operational-log evidence must pass the OUT-4 privacy gate and use aggregate provenance (RQ4 F4.4).

**AI grading is usable only as a labeled, conditioned evidence class.**
LLM judges carry documented systematic biases and configuration-sensitive reliability; tutor-context studies show over-validation in exactly the hard cases (RQ5 F5.1–F5.3, [literature] + existing-project research). This bounds classes 4–5 of the taxonomy: recorded conditions, independent initialization, and no substitution for human validation.

**Learner-population claims are mostly gaps.**
What can be said now: documented practitioner jobs (rating, patterns, interviews) and a population-general forgetting failure mode (RQ6 F6.1–F6.2). Motivation distribution, adherence to scheduled review, willingness-to-pay, and dominant failure modes in this product's population are all reserved for future real-user evidence (RQ6 §class-7 list).

## 2. Conflict register (preserved, not adjudicated)

| # | Conflict | Between | Where recorded |
| - | --- | --- | --- |
| X1 | Retention effect sizes (medium-large) vs. transfer effect sizes (small-medium) — retention-optimized mechanics don't guarantee problem-solving transfer. | RQ1 S1/S3 internal | RQ1 §Conflicts |
| X2 | Strongest worked-example deployment evidence is on novices; target learners are competent — possible expertise-reversal boundary unverified within caps. | RQ2 S2 vs. [unverified] boundary literature | RQ2 §Conflicts |
| X3 | Documented CP practice culture (volume/rating grinding) vs. learning-science-supported practice structure (spaced retrieval, schema formation). | RQ3 S1/S2 vs. RQ1/RQ2 findings | RQ3 §Conflicts, RQ6 §Conflicts |
| X4 | LLM-judge mitigation efficacy in benchmark settings vs. tutor-context over-validation findings — transfer to grading DP answers unestablished. | RQ5 S1/S2 vs. S3 | RQ5 §Conflicts |

## 3. Unresolved-gap inventory

| Gap | From | What would close it | Earliest owner |
| --- | --- | --- | --- |
| G1.1 Retrieval/spacing effects unmeasured in CP/algorithm-design tasks | RQ1 | Domain-specific study or product-side measurement | later chapters / class-7 |
| G1.2 Optimal spacing schedules for hierarchical multi-month skill dependencies | RQ1 (cap-bound) | Additional literature pass (recorded as incomplete scope) | future research batch |
| G2.1 Expertise-reversal boundary for competent programmers | RQ2 (cap-bound) | One additional focused literature review | future research batch |
| G2.2 Worked-example evidence for DP specifically | RQ2 | Domain study or product measurement | later chapters |
| G2.3 Interaction of retrieval scheduling with worked-example study | RQ2 | Cross-literature review | future research batch |
| G3.1 No outcome data for any CP practice method | RQ3 | Platform data (unavailable) or product measurement | class-7 |
| G3.2 Demand for SR-for-CP tooling unmeasured | RQ3 | Real-user evidence | class-7 |
| G4.1 Reliability of `time_spent_ms` population in real usage | RQ4 | Privacy-gated operational-log query (OUT-4 gate) | later chapters |
| G4.2 No per-DP-pattern mastery signal in the schema | RQ4 | Content-model design (later chapter) | NEU-898+ |
| G5.1 LLM grading reliability on algorithmic solutions unmeasured | RQ5 | Domain-specific evaluation (automated-eval protocol, NEU-887 OUT-7) | later chapters |
| G5.2 Trustworthy-AI-grading measurement design | RQ5 | Measurement-contract work | NEU-899+ |
| G6.1 No direct jobs/motivations study of mastery-seeking CP learners | RQ6 (cap-bound) | Dedicated search batch or real-user research | future batch / class-7 |
| G6.2 Persona/benchmark-journey construction | RQ6 | Learner-model task | NEU-898 |

## 4. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, per method §6:

- **Caps:** 6/6 questions; per-question reviewed counts 5,5,5,5,5,5 (≤5); included counts 3,3,3,3,3,3 (≤3). Tally cross-checked against `04_caps-and-incomplete-scope.md`.
- **Labels:** every finding in `questions/` carries an evidence-class tag; classes 3 (dogfooding), 4 (ai-critique), 5 (automated-eval), 6 (operational-log), 7 (real-user) contributed **zero** findings in this package, by design.
- **Forbidden phrasing scan:** searched package files for external-validation phrasing ("users want", "market validates", "experts confirm", "proven with users", "validated by"); none present as assertions — occurrences exist only inside prohibition statements and this check's own description.
- **Privacy scan:** no raw log payloads, learner responses, or payload excerpts anywhere in the package; RQ4 cites source code only.
- **Decision scan:** no sentence selects a pedagogy, curriculum, UI, architecture, provider, or telemetry design; implication notes route decisions to their owning chapters.
