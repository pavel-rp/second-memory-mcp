# `DR-C10-S2-1` — No learner-facing execution environment is a component of this system

**Task:** NEU-972 (SUB-2) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-9`, first of its three conclusions.
**Chapter:** `../03_execution-environment-and-citation-drift-component.md` §2

---

## Decision

**No component of the selected system executes, judges, sandboxes or runs anything a learner submits, and no component captures a learner's keystrokes or infers authorship from input timing.**

The learner solves on the source site. The pasted-back solution is stored, persisted and graded by a deterministic mapping over a rubric-anchored payload. The umbrella brief's presupposition that this programme has "execution-environment needs established by upstream packages" is **false for the learner path and is closed here**, not carried into the fourteen sub-tasks that follow.

The decision is published as an **auditable rule**, not only as a conclusion: five search terms — *in-app judge*, *sandbox*, *runner*, *captured keystrokes*, *keystroke- or timing-based authorship inference* — with the disposition of a hit fixed in advance as **a finding routed to the chapter that introduced the requirement**. `NEU-985 (SUB-11)` runs the sweep over the finished package; this record does not.

## Rationale

`OUT-9`'s success measure requires the learner-facing and authoring-time cases to be answered **separately**, with neither inferred from the other. The criteria this decision is scored against, weighted **before** the scoring:

| Criterion | Weight | Why it carries that weight |
| --- | --- | --- |
| **Fidelity to a consumed upstream decision** | **Highest.** NEU-890 is built and published; `00_method-and-provenance.md` §1.2 permits amending a `consumed` constraint only by routing a recorded amendment to its owner. | Re-deciding it here would be silent divergence from a delivered package — the one failure mode the `consumed` label exists to prevent. |
| **Auditability over the finished package** | High. `OUT-9`'s verified-by line requires *"confirmation that no requirement anywhere in the package assumes an in-app judge or captured keystrokes."* | A conclusion nobody can mechanically check over fourteen unwritten chapters is an assertion with a citation attached. |
| **Independence from the authoring-time answer** | High — it is `OUT-9`'s explicit requirement. | Inferring either direction produces a nameable error (chapter §1.1): one deletes `EQ-S4-6`, the other re-opens a settled decision. |
| Implementation cost of the component | **Zero weight, deliberately.** | The component is not being weighed against alternatives on cost; the question is whether the upstream decision admits it at all. It does not. |

Scored against those criteria, the evidence is unanimous and one-directional. Three independent NEU-890 statements — the graded-not-executed pasted solution, the explicit refusal of authorship inference, and the explicit non-selection of a runtime, compiler, sandbox or execution environment — all say the same thing, and none of them is about authoring. The repository agrees: a scan of `src/` for `child_process`, `worker_threads`, `vm`, `vm2`, `isolated-vm`, `execSync` and `spawnSync` returns **zero** hits at this cutoff.

## Rejected alternatives

| Alternative | Why it was rejected |
| --- | --- |
| **Place a learner-facing runner anyway, "for later"** — reserve the component now so a future charter need not re-architect. | It re-opens a decision NEU-890 made deliberately and would be silent divergence from a `consumed` constraint. Concretely: NEU-890's entire assessment design exists *because* there is no in-app judge (`../C009-course-content-quality/06_assessment-evidence-out-of-band.md:6`, `:409`). A reserved runner would make that design's premise conditional, and every evidence class SUB-6 assigned would have to be re-derived against a system that might execute after all. |
| **Leave the question open and let `SUB-4 (NEU-974)` decide it when it builds the component model.** | `OUT-9` exists precisely to prevent this. The question is not a component-model question — it is a reconciliation between two upstream statements, and deferring it means fourteen sub-tasks each inherit an unresolved presupposition and each decide it differently in passing. The cost is not delay; it is fourteen silent, divergent answers. |
| **State the conclusion in prose without the sweep terms** — a citation-backed paragraph, no auditable rule. | It fails `OUT-9`'s verified-by line, which asks for *confirmation across the package*, not a claim in one chapter. Without fixed terms and a fixed disposition, SUB-11's sweep would have to re-derive the conclusion from NEU-890 in order to know what to search for — which is the re-derivation the published rule exists to make unnecessary. |
| **Run the sweep now, in this sub-task.** | Two of the sixteen chapters exist at this cutoff. A sweep run now would report a clean result about a package that is one-eighth written, and that clean result would then read, to a later reader, as though the whole package had been checked. A misleading pass is worse than a deferred one with a named owner. |
| **Treat the `automated` gate class as evidence that a learner-facing runner exists** — the reading the umbrella brief's presupposition implies. | The class is defined over gates that run at authoring time on creator-authored artifacts (`../C009-course-content-quality/09_enforceable-quality-system.md:70`, `:216`, `:325`). Applying it to the learner path conflates *the creator's approach* with *the learner's solution*. This alternative is named rather than silently dropped because it is the reading this whole chapter exists to correct. |

## Consequences

- **Committed:** every later sub-task may treat "no learner-submitted code is ever executed" as settled, and cite this record rather than re-deriving it from NEU-890.
- **Foreclosed:** in-app grading by execution; any evidence class that would require running a learner's submission; any authorship signal derived from input dynamics. A later charter wanting one of these must reopen this record via its revision trigger, and must route an amendment to NEU-890.
- **Made more expensive:** assessment. Removing the judge is what forces NEU-890's out-of-band evidence design, and this record inherits that cost knowingly rather than re-litigating it.
- **No migration path is implied** — nothing exists to migrate. There is no execution machinery in `src/` and no serve surface.

## Evidence

- `../C009-course-content-quality/06_assessment-evidence-out-of-band.md:6`, `:54`, `:330`, `:409` (NEU-890, compiled 2026-08-10) — the pasted solution is *"submitted, persisted and graded by us"*; no stylometric, timing-based or similarity-based authorship inference is proposed; *"It implements no grader, judge, or submission surface."*
- `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92` (NEU-890, compiled 2026-08-10) — *"it selects no runtime, no compiler, no sandbox and no execution environment."*
- `src/domain/algorithms/grade-mapper.ts:71`; `src/orchestration/teaching-workflows.ts:1213,1475,1971` — the deterministic mapper and its three call sites, **confirmed** against the branch under review at the 2026-08-21 cutoff.
- Repository scan of `src/` for seven execution primitives — **zero** hits, 2026-08-21. An **automated check** under `../00_method-and-provenance.md` §1.1: it proves the check ran over `src/`, and nothing about what a future charter might add.
- `F-S2-1` — the finding this decision files.

## Revision trigger

**A learner-facing surface charter (NEU-891 or NEU-892) publishes a requirement that a learner's submitted artifact be executed by this system.** That is the observable event: a published requirement in a tracked package, not an intention and not a discussion. It reopens this record and obliges a routed amendment to NEU-890, because the evidence design in `06_…` rests on the opposite.

A second, independent trigger: **`NEU-985 (SUB-11)`'s sweep returns a hit that its owning chapter declines to remove** — meaning a chapter in this package genuinely requires learner-facing execution. That, too, is an observable event with a recorded outcome.
