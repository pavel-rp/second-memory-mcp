# Method & Provenance

**Task:** NEU-915 (SUB-1 of NEU-888, OUT-1) · **Compiled:** 2026-07-13
**Verification cutoff:** 2026-07-13 for fresh literature searched in this task; 2026-07-07 inherited for reused prior in-repo research.

This file records exactly how the synthesis was produced so a downstream agent can reproduce or challenge any finding.

## 1. Purpose and boundary

The task is to produce a **bounded synthesis** of instructional evidence covering the ten named mechanisms plus the cognitive-load / desirable-difficulty / transfer framing, with every finding labeled against NEU-887's seven-class evidence taxonomy. The synthesis **makes no instructional decision** — it does not choose a mechanism behavior, set a mastery threshold, issue a reconciliation verdict, or run an experiment. Those belong to later NEU-888 sub-tasks.

It also does not build scaffolding (traceability-register extension, adjudication ledger, decision-record template) — that is the separate follow-on scaffolding sub-task and is explicitly out of scope for NEU-915.

## 2. Inputs and their provenance

### 2.1 Reused machinery (NEU-887 product foundation — referenced, not re-derived)

- **Evidence taxonomy** — `docs/research/C005-product-foundation/01_evidence-taxonomy.md`. The seven classes and the claim-labeling discipline are inherited verbatim and applied here (see `01_evidence-labeling.md`). Not re-derived.
- **Materiality rule and caps** — `docs/research/C005-product-foundation/README.md` (revision rules) and `product-model/02_materiality-rule-and-candidate-inventory.md`. Inherited; see `04_caps-and-incomplete-scope.md`.
- **Inherited risks** — chiefly R1 (mechanism-level science may not transfer to DP) and conflict X1, carried as explicit per-mechanism uncertainty.

### 2.2 Prior in-repo research (labeled candidate input, cutoff 2026-07-07)

| File | Present? | Role |
| --- | --- | --- |
| `docs/research/results/03-pedagogy-evidence-audit.md` | **Yes** | Primary reused source. A 14-question learning-science audit of the existing Second Memory teaching system, live-verified with URLs + verbatim datapoints, cutoff 2026-07-07. Its findings are reused as `[literature]` (for the cited studies) and `[code-evidence]` (for its recon of the codebase). |
| `docs/research/03-pedagogy-evidence-audit.md` | **Yes** | The audit's prompt/brief, including the recon facts about the implemented system. Reused as `[code-evidence]` provenance for the existing-system description. |
| `docs/research/SYNTHESIS.md` | **Yes** | Repo-wide synthesis (2026-07-07) consolidating the pedagogy audit into a roadmap. Reused for cross-mechanism context and the existing-system reconciliation pointers. |
| `docs/research/ai-tutored-srs-research.md` | **No — absent** | Named in the NEU-915 / NEU-888 spec as an input, but **not present in the repository** at the compilation cutoff. Recorded as a provenance gap (see §5). |
| `docs/research/cognitive-science-foundations-learning-chunking.md` | **No — absent** | Same: named in the spec, **not present** in the repo. Recorded as a provenance gap. |
| `docs/research/graduated-reteaching-parameters.md` | **No — absent** | Same: named in the spec, **not present** in the repo. Recorded as a provenance gap. |

The three absent files were searched for by exact name and by glob over `docs/research/` and `docs/research/results/`; only the four `NN-*.md` reports, `SYNTHESIS.md`, and `CHARTER-SCRIPTS.md` exist under `docs/research/`. Their absence is carried as an honest scope limitation, not silently ignored: where those files would have supplied evidence (AI-tutored SRS specifics, chunking-capacity numbers, graduated-reteaching parameters), this synthesis relies on fresh literature search and the reused pedagogy audit instead, and flags any residual gap in `03_synthesis.md`.

### 2.3 Existing coded learning model (class-2 `[code-evidence]`, base commit = develop @ compile time)

Read as a **compatibility fact**, not adopted pedagogy — the reconciliation verdict is deferred to the later reconciliation sub-task. Files referenced (not modified): `src/domain/algorithms/sr-calculator.ts`, `src/domain/algorithms/classify-chunk.ts`, `src/domain/algorithms/resolve-stale-prerequisites.ts`, `src/domain/config/algorithm-defaults.ts`, `src/orchestration/teaching-workflows.ts`, `src/shared/instructions.ts`. The recon facts are taken from the pedagogy-audit brief (`docs/research/03-pedagogy-evidence-audit.md`), which the audit itself spot-checked against the live tree; where the umbrella (NEU-888) flags a recon fact as stale (the `repetitions > 0` prerequisite-gating characterization — current gating is retrievability-threshold-based), this synthesis carries **both** the prior characterization and the umbrella's correction, and marks the point for re-verification by the reconciliation sub-task rather than resolving it here.

### 2.4 Fresh primary literature (class-1 `[literature]`, cutoff 2026-07-13)

For mechanisms the prior audit covered only thinly (notably worked examples and explicit instructional sequencing, and the cognitive-load-theory core), fresh web searches were run in this task. Every fresh citation carries a URL and, where possible, a verbatim datapoint or effect size, matching the discipline of the reused audit. Searches were bounded (see caps, `04_…`): a small number of anchor sources per thin mechanism rather than an exhaustive sweep. Any claim that could not be confirmed against a fetched source is marked **UNVERIFIED** and treated as a gap, never asserted.

## 3. Labeling protocol

Every finding is written as `F-Mxx-n` (mechanism file) or `F-Sn` (synthesis) and carries: **(class)** one of the seven NEU-887 classes; **(provenance)** URL for `[literature]`, repo path for `[code-evidence]`, report section for reused audit findings; **(cutoff)** the verification date; **(limitation)** what the finding cannot establish. One class per claim — a statement leaning on two classes is split or labeled with the weaker class. No class-1–6 finding is presented as class-7 external-user validation.

## 4. Causal-vs-correlational discipline

Each finding states whether its underlying evidence is **causal** (randomized/controlled manipulation) or **correlational/observational**. A causal instructional claim ("mechanism X improves retention") is only made where the cited evidence is causal; correlational evidence supports only correlational statements ("X is associated with Y"). The causal-vs-correlational status of every load-bearing finding is collected in `03_synthesis.md`.

## 5. Known provenance gaps (honest, not smoothed)

1. **Three spec-named input files are absent** from the repo (§2.2): `ai-tutored-srs-research.md`, `cognitive-science-foundations-learning-chunking.md`, `graduated-reteaching-parameters.md`. Their intended contribution is partially recovered from fresh literature and the reused audit; residual gaps are flagged per mechanism.
2. **No class-3/4/5/6/7 evidence is generated here.** Dogfooding, AI-critique, automated-eval, operational-log, and external-user evidence are out of scope for a synthesis; where the existing audit reused class-6 aggregates they are cited as such, but this task collects none.
3. **DP-domain transfer is unmeasured** for every mechanism (inherited R1 / X1). No fresh source measuring a named mechanism specifically on dynamic-programming problem-solving transfer was sought or found within caps; this is the single largest standing gap and is repeated per mechanism.
4. **Reused audit `UNVERIFIED` items are carried as gaps**, not upgraded. Where the audit could not fetch a primary source (e.g. specific self-preference-bias percentages, the "20–30% fewer reviews" FSRS figure from a primary table), the item is either omitted or explicitly re-flagged UNVERIFIED here.
