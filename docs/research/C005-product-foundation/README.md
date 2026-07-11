# C005 Product Foundation — Bounded Reproducible Research Synthesis

**Task:** NEU-897 (SUB-2 of NEU-887 · program C005, AI-backed dynamic-programming course) · **Compiled:** 2026-07-11
**What this is:** a bounded, reproducible, evidence-labeled research synthesis for the product/learner foundation. **What it is not:** a decision document — it selects no pedagogy, curriculum, UI, architecture, provider, telemetry, or production behavior, and contains **no external-user, expert, or market validation** (none exists yet).

## How to read this package

| File | Contents |
| --- | --- |
| `00_method-and-provenance.md` | The reproducible method: caps (6 questions / 5 reviewed / 3 included), search interfaces, source-selection rule, cutoff policy, provenance conventions, privacy gate. |
| `01_evidence-taxonomy.md` | The seven evidence classes with definitions, required provenance, and structural limitations; the claim-labeling discipline. |
| `02_research-questions.md` | The six predeclared material research questions (RQ1–RQ6), with materiality rationale — declared before findings. |
| `questions/RQ1.md` … `RQ6.md` | One record per question: search record (interface + exact query + cutoff), candidate ledger (≤5) with inclusion/exclusion rationale, included sources (≤3), labeled findings, conflicts, gaps. |
| `03_synthesis.md` | Cross-question findings, the conflict register, the unresolved-gap inventory, and the adversarial self-check. |
| `04_caps-and-incomplete-scope.md` | The caps ledger (auditable counts) and everything that was **not** done because a cap would have been exceeded. |

## The six questions at a glance

| ID | Question (short) | Outcome |
| -- | --- | --- |
| RQ1 | Durable mastery via retrieval practice + spacing in adult, competent learners | Answered; mechanism strong, DP-domain extension is an analogy (gaps G1.1, G1.2). |
| RQ2 | Pedagogy for algorithmic problem-solving (worked examples, subgoals, schemas) | Answered; supported in computing/algorithm domains, novice-population caveat (gaps G2.1–G2.3). |
| RQ3 | Existing CP practice tools: approaches and gaps | Answered; volume/contest culture, no built-in retention models, niche SR bolt-ons; no demand evidence. |
| RQ4 | Learner-state signals collectible from the existing codebase | Answered; per-attempt data persisted, some exposed metrics uncomputed, logs payload-bearing (privacy gate). |
| RQ5 | Reliability of LLM grading/critique of learner answers | Answered; documented biases; bounds evidence classes 4–5; DP-domain reliability unmeasured. |
| RQ6 | Learner jobs/motivations/failure modes: supportable now vs. class-7 | Answered conservatively; most population claims reserved for future real-user evidence. |

## Rules this package obeys (and downstream consumers inherit)

1. **Caps are hard.** 6 questions / 5 candidates reviewed / 3 included, per question. Exceedance is recorded as incomplete scope (`04_…`), never silently expanded.
2. **Every claim is labeled** with one of seven evidence classes and carries provenance and a cutoff date (`01_…`).
3. **No class-1–6 evidence may be presented as external-user, expert, or market validation.** Class 7 (real users) does not exist yet.
4. **No raw operational-log payloads, ever.** `src/shared/logger.ts` leaves learner response text unredacted, so log-derived claims must use query-scope/time-range/field-list/aggregate provenance through the NEU-887 OUT-4 privacy gate. This package used no log evidence at all.
5. **Conflicts and gaps are preserved, not smoothed over** (`03_…` §2–3). Downstream chapters adjudicate; this package does not.

## Relation to other artifacts

- Prior repo research (`docs/research/results/01–04`, `docs/research/SYNTHESIS.md`) is **reused as labeled candidate sources** where its questions still apply (RQ1, RQ3, RQ5, RQ6); its own verification cutoff (2026-07-07) is inherited by claims sourced from it.
- Downstream consumers: NEU-898 (learner/product model) and siblings NEU-899…907 — this package is their prompt-ready evidence input.
- **NEU-898 product model** (built directly on this package) lives in `product-model/` — the fixed prerequisite boundary, target learner, jobs/motivations/failure modes, principles, differentiators, exclusions, risks, decisions, rejected alternatives, the feature-wide materiality rule + complete candidate inventory, the benchmark-state matrix, and the evidence-trace/gap-propagation audit. Start at `product-model/README.md`.
