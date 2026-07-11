# C005 Product Foundation — Evidence-Backed Learner & Product Model

**Task:** NEU-898 (SUB-3 of NEU-887 · program C005, AI-backed dynamic-programming course) · **Covers:** OUT-1, OUT-4 · **Compiled:** 2026-07-11
**Depends on / built on:** NEU-897 bounded research synthesis (`../` — files `00_…`–`04_…`, `questions/RQ1…RQ6`).

**What this is:** the single product model that converts the bounded NEU-897 evidence package into a fixed prerequisite boundary, the target-learner definition, learner jobs / motivations / failure modes, product principles, differentiators, explicit exclusions, risks, decisions, material rejected alternatives, a complete candidate inventory under one materiality rule, and an auditable benchmark-state matrix.
**What it is not:** a decision document for anything downstream of the product foundation. It selects **no** pedagogy, curriculum, tutoring protocol, UI, architecture, provider, telemetry, or production behavior; it runs **no** new research and exceeds none of NEU-897's caps; it contains **no** external-user, expert, or market validation (class-7 evidence does not exist yet).

## How to read this package

| File | Contents |
| --- | --- |
| `00_learner-and-prerequisite-model.md` | The fixed prerequisite boundary; the target-learner definition; learner jobs (J), motivations (M), and product-critical failure modes (FM) — each traced to NEU-897 evidence or marked provisional/gap. |
| `01_principles-differentiators-exclusions.md` | Product principles (P), differentiators (D), explicit exclusions (EX), risks (R), decisions (DEC), and material rejected alternatives (RA). High/Critical risks and their non-downgrade rule. |
| `02_materiality-rule-and-candidate-inventory.md` | The feature-wide materiality rule and the complete candidate inventory (CAND-*) — every research-discovered requirement, decision, hypothesis, benchmark state, alternative, risk, prototype, and evaluation candidate with its inclusion criterion or a reviewable non-material rationale. |
| `03_benchmark-state-matrix.md` | The auditable benchmark-state matrix across six axes (prerequisite position × learner job/motivation × journey stage × product-critical failure mode × evidence-conflict state × exclusion boundary); enumerated material cells (BM-*) with rationale; non-material regions with reasons. |
| `04_traceability-and-gap-propagation.md` | The evidence-trace index (every model element → NEU-897 finding + evidence class + limitation), the propagated unresolved-gap inventory, provisional-status register, and the adversarial self-check. |

## Trace-identifier conventions (inherited and extended)

This package **reuses** NEU-897's identifiers verbatim when it cites them: findings `F1.1…F6.3`, conflicts `X1…X4`, gaps `G1.1…G6.2`, sources `S1…S3` (per question), evidence classes `[literature] [code-evidence] [dogfooding] [ai-critique] [automated-eval] [operational-log] [future-real-user]` (definitions in `../01_evidence-taxonomy.md`).

It **introduces** these NEU-898 identifiers, each prompt-ready and stable for downstream siblings (NEU-899…907):

| Prefix | Element | Defined in |
| --- | --- | --- |
| `J#` | Learner job | `00_…` |
| `M#` | Learner motivation | `00_…` |
| `FM#` | Product-critical failure mode | `00_…` |
| `P#` | Product principle | `01_…` |
| `D#` | Differentiator | `01_…` |
| `EX#` | Explicit exclusion | `01_…` |
| `R#` | Risk (with severity) | `01_…` |
| `DEC#` | Decision taken at product altitude | `01_…` |
| `RA#` | Material rejected alternative | `01_…` |
| `CAND-#` | Candidate-inventory item | `02_…` |
| `BM-#` | Material benchmark-state cell | `03_…` |

## Rules this package obeys (inherited from NEU-897, extended by NEU-898)

1. **Evidence discipline is inherited unchanged.** Every material claim traces to a NEU-897 source with an evidence class and its structural limitation. Creator / AI / automated / literature / code / operational-log / real-user evidence stay separately labeled. **No class-1–6 claim is presented as external-user, expert, or market validation** (`../01_evidence-taxonomy.md` §Claim-labeling discipline).
2. **The bounded package is the only input.** No new research is run; NEU-897's question (≤6), candidate (≤5), and inclusion (≤3) caps are not exceeded; where NEU-897 recorded a gap, this model marks the dependent element **provisional** or **incomplete** rather than filling it.
3. **The prerequisite boundary is fixed, not re-litigated.** Programmers with language and basic-algorithm competence seeking durable mastery and competitive-programming breadth. Absolute beginners and a general all-algorithms product are **out of audience** (EX1, EX2).
4. **The materiality rule is feature-wide** (`02_…`). Every candidate carries an inclusion criterion or a reviewable non-material rationale; **changing or omitting a High or Critical risk can never be classified non-material.**
5. **Conflicts and gaps propagate, they are not smoothed.** NEU-897 conflicts `X1…X4` and gaps `G*` are carried into the affected model elements and the benchmark matrix; this model adjudicates none of them (that is downstream, NEU-906+).

## Relation to other artifacts

- **Upstream input:** NEU-897 package (`../`) — sole evidence source.
- **Downstream consumers:** NEU-899 (evidence/decision traceability), NEU-900 (bounded benchmark suite + review protocol), NEU-906 (evidence adjudication under frozen measurement rules), NEU-907 (complete prompt-ready decision package) and the remaining siblings. Each model element is prompt-ready and addressable by its trace id.
- **Not consumed here:** the C005 charter's later chapters (pedagogy, curriculum, UI, architecture, providers, telemetry) — this model deliberately stops at product altitude.
