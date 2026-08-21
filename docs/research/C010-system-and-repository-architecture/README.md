# C010 System and Repository Architecture — Boundaries, State Authority, Topology, and the Decision Package

**Task:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-21 · **Verification cutoff:** 2026-08-21 · **Status:** deferred — this package records decisions in its own decision records; no topic document promotes its own status
**Model:** claude-opus-5[1m]

## The package path is `docs/research/C010-system-and-repository-architecture/`

**That exact string is the package name.** Not `C010-architecture`, not `C010-system-architecture`, not `C010-system-and-repository-architecture-package`, not `c010-…` in lower case, not a `NEU-895-` prefixed variant. **Fifteen sibling sub-tasks (SUB-2 … SUB-16, NEU-972 … NEU-986) read this directory name off `origin/develop` and write into it**, several of them concurrently and none of them able to see another's working tree. A variant spelling does not produce a merge conflict — it produces a second package that nobody's cross-references resolve into, and the failure is silent until the completeness gate runs. **The name is fixed by this sub-task and must not be renamed after it lands.** Any proposal to rename it is a charter-level change affecting fifteen open work items, not a tidy-up.

**Charter:** C010, *Select the system and repository architecture* — umbrella **NEU-895**. **This sub-task:** **SUB-1** / **NEU-971**, covering **OUT-11** (the stand-in assumption register and the NEU-893 circularity finding), **OUT-10** (the spike discipline), and **OUT-12** (the house-style package skeleton), plus — as enabling scaffolding that traces to no outcome — the creation of this package itself.

---

## What this package is

The C010 decision package: the architecture an implementation charter needs before it writes a line of the web tier, moves a row of state, or splits a repository. It fixes **what the components are and where the trust boundaries fall**, **which single component is the authority for each category of state**, **what isolation invariant every category must satisfy**, **what the general web API owns and must never own**, **what separates application behaviour from reusable MCP-core capability**, **what the repository topology is**, **which technology choices are architecture-material**, and **whether an execution environment is an architectural component at all**.

It is published under `docs/research/` in the **C005 house style** — the same shape as `../C005-product-foundation/`, `../C005-instructional-model/`, `../C005-dp-map-package/` and `../C009-course-content-quality/`: a README entry point, numbered topic documents, `decision-records/`, `traceability/`, shared registers, and a package-completeness gate. That style is **matched, not invented**; where this package needs a convention an upstream package already has, it references that package rather than re-deriving it.

## What this package is not

- **It is not an implementation.** It builds nothing that ships. No `src/` file changes, no schema changes, no deployed change. It selects and justifies.
- **It is not a product surface.** No learner touches anything it produces, and it specifies no endpoint path, no payload schema and no error catalogue — see `01_outcome-register.md`'s `OUT-5`, which states that stopping point deliberately so a downstream charter knows the wire contract is genuinely open rather than accidentally missing.
- **It does not re-decide what NEU-850 already decided.** Learner-ownership **placement** (`user_id` on every core table, keyed to the JWT subject) and the cloud-business-layer repository split are **consumed as constraints with their source cited**. Where this package's own evidence *actively contradicts* a consumed constraint, it routes a recorded amendment back to NEU-850 — never a silent divergence, never a preference-based re-decision.
- **It does not derive the four unbuilt upstream packages' requirements.** NEU-891, NEU-892, NEU-893 and NEU-894 are stood in for by the five numbered, tolerance-bounded assumptions in `93_stand-in-assumption-register.md`, never invented.
- **It runs no spike itself.** SUB-1 publishes the spike discipline; it executes nothing under it.

---

## ▶ Start here (reading order)

| Step | File | What it gives you | Owner |
| --- | --- | --- | --- |
| 1 | **This README** | The package name, the numbering convention, the shared-register append convention, the id-citation rules, and what the package is and is not. | SUB-1 |
| 2 | **`00_method-and-provenance.md`** | The evidence-labelling rule (what counts as a proxy signal versus external validation), the citation discipline, the real-path and version/date citation rules, the vocabulary disambiguation, and the `qa-execution:engine` no-op. | SUB-1 |
| 3 | **`01_outcome-register.md`** | **`OUT-1` … `OUT-12` restated inside the package** — id, outcome statement, success measure — so no traceability row resolves into the gitignored `_local/` tree. | SUB-1 |
| 4 | **`02_findings-register.md`** | Package-level findings, beginning with **`F-S1-1`**, the NEU-893 circularity. **Append-only, keep both sides.** | all sub-tasks |
| 5 | **`93_stand-in-assumption-register.md`** | **`A-25` … `A-29`** — the five assumptions standing in for the four unbuilt upstream packages, each with a tolerance envelope, an invalidating outcome and a re-validation trigger. **Closed, not append-only.** | SUB-1 (closed) |
| 6 | **`92_spike-register.md`** | The spike discipline: the record template, the mandatory expiry field, the quarantine path, the justification test, and the rule that every exit condition is an **observable event**. Complete in rules, empty of results. | SUB-1 (rules) / any sub-task (records) |
| 7 | **`03_…`–`89_…`** | The remaining topic documents — the component model, the state inventory, the authority matrix, the isolation invariant, the API boundary, the core/application rule, the topology decision, the technology selections, the execution-environment resolution — landing as SUB-2 … SUB-16 ship. | SUB-2 … SUB-16 |
| 8 | **`90_open-items-and-provisional-register.md`** | Every open item and provisional reliance that is **not** a stand-in for one of the four unbuilt packages, each with an owner and a resolving event. **Append-only, keep both sides.** | all sub-tasks |
| 9 | **`91_caps-and-incomplete-scope.md`** | Every cap and honest statement of incomplete scope. **Append-only, keep both sides**; reconciled once at the end. | all sub-tasks; reconciled by **NEU-986 (SUB-12)** |
| 10 | **`94_package-completeness-gate.md`** | The gate that answers the charter's completeness checklist item by item with cited evidence. Not runnable until the package is complete. | **NEU-986 (SUB-12)** |
| 11 | **`decision-records/`, `traceability/`** | The decision records with their rejected alternatives, and the traceability set that resolves each outcome to the evidence discharging it. | each sub-task writes its own files; **NEU-985 (SUB-11)** owns the mechanical audit rows |

---

## Numbering convention (load-bearing — fifteen sub-tasks allocate against it)

| Range | Meaning | Who writes it |
| --- | --- | --- |
| **`00`–`89`** | **Per-sub-task topic documents.** Each sub-task allocates its own numbers in this range and owns those files outright. **SUB-1 owns `00`, `01` and `02`.** No sub-task renumbers another's file, because a renumber breaks every cross-reference a concurrent sibling already wrote against the old number. | the owning sub-task |
| **`90`–`99`** | **Reserved for shared package-level registers and the completeness gate.** No sub-task may allocate a topic document in this range. Currently: `90_open-items-and-provisional-register.md`, `91_caps-and-incomplete-scope.md`, `92_spike-register.md`, `93_stand-in-assumption-register.md`, `94_package-completeness-gate.md`. `95`–`99` stay free for further package-level registers, not for topic content. | all sub-tasks (registers, by append) / **NEU-986 (SUB-12)** (gate) |

The split exists so a reader can tell, from the filename alone, whether a document is **one sub-task's finding** or **the package's aggregate state** — and so that concurrently-in-flight siblings never contend for the same number.

`02_findings-register.md` is the one deliberate exception to "`00`–`89` is per-sub-task": it is numbered in the topic range because SUB-1 owns and seeds it, but it is **append-only and shared**, and it carries the same convention as the `90`-range registers. Read its own header, not its number, for its rules.

## Shared-register append convention (quoted verbatim in every shared register)

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Why it is stated this bluntly.** Sibling sub-tasks run concurrently, and **all sixteen** may write into `02_findings-register.md`, `90_open-items-and-provisional-register.md`, `91_caps-and-incomplete-scope.md` and `92_spike-register.md`. That makes those files merge-conflict magnets, and the default conflict resolution — pick one side — silently deletes a sibling's open item, cap, finding or spike record. An open item that is silently deleted is worse than one never filed: the package then reads as complete while carrying an unowned gap. **Keep both sides** makes the failure mode a visible duplicate rather than an invisible omission.

Duplicates are expected and are **not** cleaned up in flight. **NEU-986 (SUB-12) is the declared single owner that reconciles the caps register at the end.** Until SUB-12 runs, a duplicate entry is correct-by-convention, and any other sub-task that "tidies" one is destroying evidence, not helping.

**The append convention is part of SUB-1's deliverable, not an unstated assumption.** It is restated in full in each shared register's own header, so a sub-task that opens only that register still finds the rule without reading this README.

Every shared register is created **well-formed and empty apart from SUB-1's own entries**. SUB-1 pre-populates no sibling's rows; a `### SUB-<n>` heading appears only when the sub-task that owns it writes into it.

## Id-citation rules

Later sub-tasks **cite an id instead of re-arguing the point**. Five id families exist, and each is namespaced so two concurrent appends can never collide:

| Family | Shape | Lives in | Allocated by |
| --- | --- | --- | --- |
| Stand-in assumption | `A-<n>` (`A-25` … `A-29`) | `93_stand-in-assumption-register.md` | **SUB-1 only** — the register is closed |
| Open item / provisional | `OI-S<n>-<k>` | `90_open-items-and-provisional-register.md` | the appending sub-task, within its own `S<n>` namespace |
| Cap | `CAP-S<n>-<k>` | `91_caps-and-incomplete-scope.md` | the appending sub-task, within its own `S<n>` namespace |
| Spike | `SPK-S<n>-<k>` | `92_spike-register.md` | the appending sub-task, within its own `S<n>` namespace |
| Finding | `F-S<n>-<k>` | `02_findings-register.md` | the appending sub-task, within its own `S<n>` namespace |

`<n>` is the sub-task number (SUB-4 writes `OI-S4-1`, `OI-S4-2`, …) and `<k>` restarts at `1` inside each sub-task's own section. **There is no global counter anywhere in this package**, precisely so that appending a section never obliges anyone to renumber another's entries.

**Program-level ids are always written owner-attached.** `C005's OUT-8`, `NEU-850's OUT-7`, `NEU-890's OI-S6-5` — never a bare `OUT-8`. **A bare `OUT-n` in this package always means this package's own outcome**, as listed in `01_outcome-register.md`. The C010 charter and the C005 program charter both number outcomes from 1, and conflating them is the exact error the owner-attached form exists to prevent.

## What this package hands on

**To NEU-893 (safe production integration).** Two things, both as explicit lists rather than prose: the **isolation invariant** stated as a testable property, and the **disjointness contract** — the isolation questions this package closes and the ones it hands on (identity mapping to the production Rauthy IdP, migration of existing global rows, staged rollout, rollback), such that no question appears on both lists and none appears on neither. `OI-S1-2` in `90_open-items-and-provisional-register.md` is named as an input NEU-893 must confirm against a live token.

**To NEU-896 (convergence).** The **reconciliation list**: `93_stand-in-assumption-register.md`'s five entries, each with the package it stands in for and the re-validation obligation that fires when that package lands — so convergence does not rediscover them one by one. Plus the two named findings NEU-896 converges over rather than relitigates: the **NEU-893 circularity** (`F-S1-1`, filed by this sub-task) and the **C003/NEU-850 decision-ownership collision with its settled disposition**, which **SUB-12 (NEU-986)** files.

## Verification note — `qa-execution:engine` is unconfigured

This repository's capability registry resolves to **`git, linear`** only; **no `qa-execution:engine` provider is registered**. The automated QA-execution phase is therefore a genuine **no-op** for this package, not a skipped step, and **no QA pass is claimed, fabricated, or implied anywhere in it**. That is the correct outcome for a documentation deliverable: this package contains no runtime behaviour, so there is nothing a browser or engine could exercise. Verification here is by **file inspection and `git diff`** against the named success criteria — see `94_package-completeness-gate.md` when it lands.

## Provenance

**Binding upstream inputs, cited by version or compilation date:** `../C009-course-content-quality/` (NEU-890, compiled 2026-08-10) for the enforceable-quality system, the out-of-band citation-drift obligation and the permitted-field restriction; `../C005-dp-map-package/` (NEU-889, v1.0.0); `../C005-instructional-model/` (NEU-888); `../C005-product-foundation/` (NEU-897) for NEU-887's seven-class evidence taxonomy. **Consumed as constraints, not re-decided:** C003/**NEU-850's** OUT-2 (learner-ownership placement) and OUT-6/OUT-7 (public MIT distribution; the cloud-business repository split) — converged but unimplemented, so OUT-2 is a decision to honour, never an existing schema fact.

**Consumers:** every C010 sub-task; **NEU-893**, which receives the disjointness contract; and **NEU-896**, which receives the reconciliation list.
