# C005 Instructional Model — Bounded Instructional Evidence Base (Synthesis)

**Program:** C005 (AI-backed dynamic-programming course) · **Umbrella:** NEU-888 (Define the science-backed instructional and mastery model) · **Task:** NEU-915 (SUB-1, OUT-1) · **Verification cutoff:** 2026-07-13 (this task's fresh literature) inheriting 2026-07-07 (reused prior in-repo research)

**What this is.** A single, bounded, reproducible, **evidence-labeled synthesis** of current primary learning-science research plus applicable prior in-repo research, covering the ten named instructional mechanisms — sequencing, worked examples, retrieval, spacing, interleaving, feedback, productive struggle, assessment, remediation, progression — plus the feature-wide **cognitive-load / desirable-difficulty / transfer** framing that later NEU-888 sub-tasks apply. Every finding carries exactly one of NEU-887's seven evidence classes, its provenance, a cutoff, and an explicit limitation.

**What it is not — it makes no instructional decision.** This package selects no mechanism behavior, no mastery signal, no threshold, no reconciliation verdict against the existing Second Memory code, and runs no experiment. Those are the jobs of the later NEU-888 sub-tasks (mechanism-decision, mastery, reconciliation, experiment, adjudicated package). It also does **not** build the scaffolding — extending NEU-887's traceability register and adjudication ledger, or authoring the decision-record template — which is the separate follow-on scaffolding sub-task. This synthesis presents evidence; downstream tasks decide on it.

It contains **no external-user, expert, or market validation** — NEU-887's class-7 (`[future-real-user]`) evidence does not exist yet. Every finding here is one of classes 1–6 and is labeled as such.

## ▶ Start here (reading order)

| Step | File | What it gives you |
| --- | --- | --- |
| 1 | **This README** | The map: what the package is, reading order, how to consume a mechanism, the standing caveats. |
| 2 | **`00_method-and-provenance.md`** | How the synthesis was produced: inputs and their cutoffs, the fresh-search protocol, the inherited caps, and the exact discrepancy between the spec's named inputs and the files actually present in the repo. |
| 3 | **`01_evidence-labeling.md`** | The seven-class evidence taxonomy **as inherited from NEU-887** (referenced, not re-derived) and the labeling discipline applied to every finding below. |
| 4 | **`02_cognitive-load-desirable-difficulty-transfer.md`** | The feature-wide **cognitive-load / desirable-difficulty / transfer** framing authored here for later sub-tasks to apply per mechanism. |
| 5 | **`mechanisms/M01…M10`** | One file per named mechanism: labeled findings (`F-Mxx-n`), the cognitive-load / desirable-difficulty note, the DP-transfer uncertainty, and pointers to the prior in-repo reconciliation evidence — **no decisions**. |
| 6 | **`03_synthesis.md`** | The cross-mechanism view: the evidence-quality summary, the conflict register (C1…), the unresolved-gap inventory (G1…), and the causal-vs-correlational ledger. |
| 7 | **`04_caps-and-incomplete-scope.md`** | The hard caps inherited from NEU-887, what fell outside them, and the honest statement of what this synthesis does not cover. |

## The ten mechanisms

| ID | Mechanism | File |
| --- | --- | --- |
| M01 | Sequencing | `mechanisms/M01_sequencing.md` |
| M02 | Worked examples | `mechanisms/M02_worked-examples.md` |
| M03 | Retrieval practice | `mechanisms/M03_retrieval.md` |
| M04 | Spacing | `mechanisms/M04_spacing.md` |
| M05 | Interleaving | `mechanisms/M05_interleaving.md` |
| M06 | Feedback | `mechanisms/M06_feedback.md` |
| M07 | Productive struggle | `mechanisms/M07_productive-struggle.md` |
| M08 | Assessment | `mechanisms/M08_assessment.md` |
| M09 | Remediation | `mechanisms/M09_remediation.md` |
| M10 | Progression | `mechanisms/M10_progression.md` |

## How to consume a mechanism (for a downstream decision agent)

Each `mechanisms/Mxx_*.md` file is self-contained and gives you, in one hop:

1. **What the mechanism is** — a one-paragraph scope statement fixed to this feature's combined audience (mastery-oriented programmers who ultimately need competitive-programming breadth and speed).
2. **Labeled findings** — each `F-Mxx-n` is a single claim with its evidence class, provenance (URL / repo path / prior-report section), verification cutoff, and an explicit limitation. Causal claims rest on causal evidence; correlational evidence supports only correlational statements.
3. **Cognitive-load / desirable-difficulty note** — how the mechanism bears on cognitive load and where it preserves or removes desirable difficulty, per `02_…`.
4. **DP-transfer uncertainty** — the explicit statement that mechanism-level effects are **not measured in the dynamic-programming domain** (inherited NEU-887 risk R1 / conflict X1); DP effectiveness is never presented as established.
5. **Prior in-repo reconciliation evidence** — pointers to what the existing Second Memory code does and what the prior pedagogy audit found, presented as `[code-evidence]` / `[literature]` **evidence only**. This synthesis records the evidence; the reconciliation *verdict* belongs to the later reconciliation sub-task.

You will **not** find a decision, a chosen threshold, or a required behavior here. If you need one, you are the sub-task that authors it — read this synthesis as your evidence base, not as a settled answer.

## Standing caveats (true of every finding in this package)

- **No class-7 evidence exists.** Nothing here is external-user, expert, or market validation. Phrases like "users want", "proven to work for our learners", or "the market validates" are prohibited and absent.
- **DP transfer is an analogy, not a measurement.** The learning-science base is largely strong in its own studied domains; its extension to dynamic-programming problem-solving is unmeasured and carried as explicit per-mechanism uncertainty (NEU-887 R1 / X1).
- **Prior in-repo research is labeled input, not fresh ground truth.** The reused reports inherit their stated cutoffs (2026-07-07); some of their `UNVERIFIED` items are carried forward as gaps, not asserted.
- **Provisional by default.** Every finding is revisable by a downstream sub-task with stronger, correctly-classed evidence. Conflicts and gaps are preserved, not smoothed.

## Provenance

Downstream consumers: the NEU-888 mechanism-decision sub-tasks (per-mechanism decision records), the mastery-model sub-task, the reconciliation sub-task, the experiment sub-task, and the final adjudicated package — plus the C005 curriculum, content/assessment, and tutoring chapters. This synthesis extends the NEU-887 product-foundation package (`docs/research/C005-product-foundation/`) to instructional evidence: it reuses that package's evidence taxonomy, materiality rule, and caps rather than rebuilding them. Prior in-repo research (`docs/research/results/03-pedagogy-evidence-audit.md`, `docs/research/SYNTHESIS.md`) is reused as labeled candidate evidence inheriting its 2026-07-07 cutoff.
