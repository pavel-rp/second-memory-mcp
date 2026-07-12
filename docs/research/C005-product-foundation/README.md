# C005 Product Foundation — Consolidated, Prompt-Ready Decision Package

**Program:** C005 (AI-backed dynamic-programming course) · **Umbrella:** NEU-887 · **Consolidated by:** NEU-907 · **Date:** 2026-07-12

**What this is.** A single, standalone, prompt-ready **product-foundation package**: a bounded, reproducible, evidence-labeled foundation (learner model, benchmark evidence, measurement contracts, automated evaluation, and a single mutable-status adjudication ledger) that a downstream chapter agent can consume as its complete context.
**What it is not.** It selects no pedagogy, curriculum, UI, architecture, provider, telemetry, or production behavior, and contains **no external-user, expert, or market validation** — class-7 evidence does not exist yet. Every claim is evidence-labeled and either accepted (audit-settled discipline only), provisional, or unresolved.

## ▶ Start here (primary agent context)

1. **`00_vocabulary.md` — READ FIRST.** The ubiquitous-language artifact: every term and identifier family (domain + machinery) with a one-line definition, owning package, defining file, and cross-references. Any identifier you hit anywhere in the corpus resolves here in one hop. Load it as your primary context before reading anything else.
2. **This README** — the map: reading order, per-package summaries, what is binding vs provisional vs unresolved, frozen rules vs mutable statuses, risks, and revision rules.
3. **`00_gates-report.md`** — the gate battery (9 PASS · 2 CONDITIONAL-PASS · 0 FAIL) and the accounting of the five open holes.
4. **`00_hypothesis-reformulations.md`** — the one sanctioned new hypothesis (H-F3.1), versioned against the contradicted H-F3.
5. **`00_dry-run-handoff.md`** — a cold-context downstream-agent dry-run and the repairs it prompted.

## Read the substance in this order

| Step | Package | One-paragraph summary | Owner |
| --- | --- | --- | --- |
| 1 | **Research synthesis** (root `00_…`–`04_…`, `questions/`) | The reproducible evidence base: the seven-class evidence taxonomy, six predeclared research questions (RQ1–6) each with search record + candidate ledger + labeled findings (F*), the cross-question conflict register (X1–4), the unresolved-gap inventory (G*), and the hard caps. No decisions here. | NEU-897 |
| 2 | **`product-model/`** | The learner/product model built on that base: fixed prerequisite boundary + target learner, jobs (J1–4), motivations (M1–4), product-critical failure modes (FM1–5), principles (P1–6), differentiators (D1–4), exclusions (EX1–6), risks (R1–8), decisions (DEC1–5), rejected alternatives (RA1–6), the feature-wide materiality rule + candidate inventory (CAND-1…32), and the benchmark-state matrix (BM-1…8 material cells, BX-1…5 exclusion walls). | NEU-898 |
| 3 | **`traceability/`** | The trace structure over the model: one bidirectional trace record per element (TR-*), typed relation edges (REL:*), the closed completeness lattice (SETTLED/PROVISIONAL/INCOMPLETE/UNRESOLVED), incomplete-artifact markers (INC-1…5), deferred link slots (LINK-1…5), and the orphan audit (OC-1…7, all PASS). | NEU-899 |
| 4 | **`measurement-contracts/`** | The measurement authority: frozen contracts MC-1…11 (v1.0), the requirement-decision mapping gate (GATE-STATE=PASS), per-signal feasibility (FEAS-*, in `02_feasibility-and-telemetry-inventory.md` — the canonical "which learner metrics are collectible today" inventory), proxy-replacement contracts (PRX-1…8, the INC-4 artifact), and the operational-log privacy gate (PLA-1…3, all PASS). Binds LINK-2. | NEU-901 |
| 5 | **`benchmark-suite/`** | The benchmark design: five journeys (JNY-B1/B2/F1/F2/F3) with vehicles + hypotheses (H-*), two disjoint batches (BATCH-BASELINE, BATCH-FAILURE), the creator-dogfooding (OBS-*) and AI-review-independence (AIR-*) protocols, and BM-cell coverage (8/8). Partially binds LINK-1. | NEU-900 |
| 6 | **`baseline-batch/`** | Executed BATCH-BASELINE: JNY-B1 (BM-8 live class-2; BM-2 retrospective) and JNY-B2 (BM-6 retrospective) under the v1.1 vehicle revision, with class-6 `OPLOG-*` aggregates and AI reviews. | NEU-904 |
| 7 | **`failure-batch/`** | Executed BATCH-FAILURE: JNY-F1 (BM-1/BM-7) and JNY-F2 (BM-3/BM-4) retrospective under v1.1, plus JNY-F3 (BM-5) bound to the automated evidence. Includes the v1.1 vehicle-revision record. | NEU-905 |
| 8 | **`automated-evaluation/`** | The automated-eval protocol: automation classification (ACL-1…10 → one automatable, ACL-4), the protocol block (AEP-1), the frozen 12-case set (ACS-1 v1.0), and the clean-context-repeat/isolation conditions (CCR-1…7). Partially binds LINK-3. | NEU-902 |
| 9 | **`autoeval-batch/`** | The executed automated batch (BATCH-AUTOEVAL): the 12 ACS-1 cases across three isolated runs (RUN-1/2/3), reproduced **12/12 identical**, with the over-validation flag on the three INCOMPLETE cases. | NEU-903 |
| 10 | **`adjudication/`** | The single mutable-status authority (LINK-4 ledger): every executed evidence item and decision adjudicated under frozen MC-* v1.0 rules; zero unadjudicated elements; the privacy admissibility, proxy-replacement dry-run, and adversarial unsupported-claims audits. **This is where any status actually flips.** | NEU-906 |

## Binding vs provisional vs unresolved — surfaced up front

The package draws a hard line between what it is entitled to settle and what it is not. Read this before treating any element as decided.

- **Binding / accepted (settled at product altitude, audit-verified — never empirical).** Reserved for the **MC-11 NON-MEASURED-SETTLED** set only: the decisions **DEC1–DEC5**, the exclusions **EX1–EX6** and boundary walls **BX-1…BX-5**, the discipline principles **P3/P5/P6**, and the rejected alternatives **RA1–RA6**. These are scope/process/privacy decisions the foundation is entitled to make; **no class-1–6 (empirical) element is ever "accepted."**
- **Provisional (evidence present but insufficient to settle).** H-B1/BM-2 (retention direction), H-B2/BM-6 (adherence *shape*), R2, R8, the D-family positioning, and principles P1/P2/P4. Supported only by class-1–6 evidence and/or class-4↔class-3 corroboration — **which is not external validity.** Needs class-7 or in-domain measurement to move.
- **Unresolved (depends on a downstream artifact that does not yet exist).** R1/BM-1/BM-4/transfer (INC-1), R6/BM-8/signals (INC-2), R3/BM-5/FM4-reliability (INC-3), R4/D1-demand/R5-prevalence/M1–4 (INC-5). Each carries an INC-* marker and is never filled with an invented value.
- **Contradicted (as literally worded).** **H-F3 only** — "AI grading over-validates a shallow/wrong DP answer" — the shallow/wrong cases were correctly failed. The real, bounded over-validation on the INCOMPLETE archetype is carried forward as **H-F3.1** (`00_hypothesis-reformulations.md`); it changes no status.

## Frozen rules vs mutable statuses — kept separate

- **Frozen (versioned; change ⇒ new version + rerun, never in-place edit):** all measurement contracts **MC-1…11 at v1.0**, the automated case set **ACS-1 v1.0**, and the journey vehicles (v1.0, superseded by v1.1 **by pointer**, append-only). Freezing predates any run; results are never rescored under a changed rule.
- **Mutable (may flip, in exactly one place):** element **decision statuses**, adjudicated only in the **LINK-4 ledger** (`adjudication/`). No other file — including this README and the vocabulary — is a status authority. The traceability INC/LINK rows carry additive binding notes (dated 2026-07-12); where a file's prose and its table disagree, **the table rows are current truth**.

## Risks (explicit; High risks are non-downgradable)

R1 mechanism may not transfer to DP · R2 retention without transfer · R3 AI-graded mastery unreliable → false confidence · R4 no demand · R5 adherence collapse — **all High, all open, none downgradable** (OC-7 severity floor). R6 signal-feasibility gap · R7 mis-scheduling hierarchical skills · R8 over-reliance on the codebase as if validated — Medium. Definitions and current statuses: `00_vocabulary.md` §3 and `adjudication/03_decision-status-register.md`.

## Revision rules (how this package is allowed to change)

1. **Caps are hard.** 6 questions / 5 candidates / 3 included (research); ≤6 automatable hypotheses / ≤18 cases / 1 batch (automated). Exceedance is recorded as incomplete scope, never silently expanded.
2. **Every claim is evidence-labeled** (one of seven classes) with provenance and cutoff. No class-1–6 evidence may be presented as external-user, expert, or market validation.
3. **Conflicts and gaps are preserved, not smoothed over.** A gap keeps its element provisional or unresolved.
4. **Status flips only in the LINK-4 ledger**, only on correctly-classed new evidence, only under the frozen rules. A frozen rule changes only by issuing a new version and re-running — the prior version and result are retained by pointer.
5. **No raw operational-log payloads, ever.** Log-derived evidence is aggregate-only through the OUT-4 privacy gate (PLA-*).

## Provenance

Downstream consumers: later C005 chapters (pedagogy, curriculum, measurement implementation, reliability) consume this package as prompt-ready input. This package binds **LINK-5** (the consolidated product-decision package). The routed **H-F3.1** reformulation is handed to the reliability chapter (INC-3, owner NEU-902/OUT-7). Prior repo research (`docs/research/results/`, `docs/research/SYNTHESIS.md`) is reused as labeled candidate sources where its questions still apply, inheriting its 2026-07-07 verification cutoff.
