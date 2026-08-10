# C009 Course Content Quality — Provenance, Rights, Standards, and the Assessment Package

**Task:** NEU-957 (SUB-1) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — set only in `adjudication/` and, for inherited C005 decisions, in `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`
**Model:** claude-opus-5[1m]

## The package path is `docs/research/C009-course-content-quality/`

**That exact string is the package name.** Not `C009-content-quality`, not `C009-course-content`, not `c009-course-content-quality`, not a `NEU-890-` prefixed variant. **Twelve sibling sub-tasks (SUB-2 … SUB-13, NEU-958 … NEU-969) read this directory name off `origin/develop` and write into it,** several of them concurrently and none of them able to see another's working tree. A variant spelling does not produce a merge conflict — it produces a second package that nobody's cross-references resolve into, and the failure is silent until the completeness gate runs. **The name is fixed by this sub-task and must not be renamed after it lands.** Any proposal to rename it is a charter-level change affecting twelve open work items, not a tidy-up.

**Charter:** C009, *Specify the course content, problem sourcing and assessment package* — umbrella **NEU-890**. **This sub-task:** **SUB-1** / **NEU-957**, covering **OUT-7** (provenance, attribution, rights, generated-content policy) and, as enabling scaffolding that traces to no outcome, the creation of this package skeleton.

---

## What this package is

The C009 decision package: the specification a course-production charter needs before it records a single problem citation, authors a single lesson, or grades a single learner artifact. It fixes **what may be stored** about an external problem, **what standards our own generated artifacts must meet**, **how difficulty is calibrated honestly**, **how assessment works for a learner who solves out of band**, and **what quality obligations are enforceable versus AI-judgment-only**.

It is published under `docs/research/` in the **C005 house style** — the same shape as `../C005-dp-map-foundations/` and `../C005-dp-map-package/`: a README entry point, numbered topic documents, `adjudication/`, `decision-records/`, `traceability/`, `dry-run/`, shared registers, and a package-completeness gate. That style is **matched, not invented**; where this package needs a convention that C005 already has, it references C005 rather than re-deriving it.

## What this package is not

- **It is not a course.** It authors no lesson, no exercise, no solution, and no assessment item. It specifies the standards those artifacts will be held to.
- **It is not a corpus.** It stores no problem statement text, no problem list, and no enumerated candidate set. See `01_provenance-and-rights.md` §5, §6 and §10.
- **It does not re-select or re-license the corpora.** `C1`–`C6` are already selected by `D-F2` (`../C005-dp-map-foundations/02_corpus-selection.md`). This package **re-verifies** their dispositions at a new cutoff; it does not reopen the selection, and commercial licensing is out of scope charter-wide.
- **It does not edit the C005 packages.** `../C005-dp-map-foundations/05_provenance-and-rights.md` is referenced and never modified. Where a C005 decision must change, this package **files a ledger challenge** in the owning package's adjudication ledger, by append, never by editing a row in place.
- **It sets no status locally.** Status lives in a ledger. A topic file that appears to assert one is deferring, not deciding.

---

## ▶ Start here (reading order)

| Step | File | What it gives you | Owner |
| --- | --- | --- | --- |
| 1 | **This README** | The package name, the numbering convention, the shared-register append convention, and what the package is and is not. | SUB-1 |
| 2 | **`00_method-and-provenance.md`** | The verification cutoffs (2026-08-10 current, 2026-07-16 prior), the evidence classes used, what was and was **not** machine-verified, and the open statement of the no-network limitation that makes this pass documentary. | SUB-1 |
| 3 | **`01_provenance-and-rights.md`** | **The OUT-7 deliverable.** The dated 12-source re-verification, the per-source access-permission precondition, the permitted-field decision, the no-text rule, the enumerating-response retention disposition, per-source attribution, the generated-content policy, the extended rights-check self-check, and the repository-scan result. | SUB-1 |
| 4 | **`decision-records/DR-C09-01_permitted-field-set.md`** | The permitted-field decision as a house-shape record: decision, rationale, rejected alternatives, consequences, evidence, revision trigger. | SUB-1 |
| 5 | **`traceability/01_rights-evidence-register.md`** | One row per rights claim: class, evidence type, cutoff, provenance, structural limitation. | SUB-1 |
| 6 | **`02_…`–`89_…`** | The remaining topic documents, one or more per sub-task, landing as SUB-2 … SUB-13 ship. | SUB-2 … SUB-13 |
| 7 | **`90_open-items-and-provisional-register.md`** | Every open item and provisional reliance in the package, each with an owner and a revision trigger. **Append-only, keep both sides.** | all sub-tasks |
| 8 | **`91_caps-and-incomplete-scope.md`** | Every cap and honest statement of incomplete scope. **Append-only, keep both sides**; reconciled once at the end. | all sub-tasks; reconciled by **NEU-969 (SUB-12)** |
| 9 | **`92_package-completeness-gate.md`** | The gate that checks the package against the charter's §8 checklist. Not runnable until the package is complete. | **NEU-969 (SUB-12)** |
| 10 | **`adjudication/`, `decision-records/`, `traceability/`, `dry-run/`** | The status ledger, the decision records, the evidence register, and the cold-context dry-runs. **The only place a status flips is the ledger.** | each sub-task writes its own files |

---

## Numbering convention (load-bearing — twelve sub-tasks allocate against it)

| Range | Meaning | Who writes it |
| --- | --- | --- |
| **`00`–`89`** | **Per-sub-task topic documents.** Each sub-task allocates its own numbers in this range and owns those files outright. **SUB-1 owns `00` and `01`.** No sub-task renumbers another's file, because a renumber breaks every cross-reference a concurrent sibling already wrote against the old number. | the owning sub-task |
| **`90`–`99`** | **Reserved for shared package-level registers and the completeness gate.** No sub-task may allocate a topic document in this range. Currently: `90_open-items-and-provisional-register.md`, `91_caps-and-incomplete-scope.md`, `92_package-completeness-gate.md`. `93`–`99` stay free for further package-level registers, not for topic content. | all sub-tasks (registers, by append) / **NEU-969 (SUB-12)** (gate) |

The split exists so a reader can tell, from the filename alone, whether a document is **one sub-task's finding** or **the package's aggregate state** — and so that the three concurrently-in-flight siblings never contend for the same number.

## Shared-register append convention (quoted verbatim in both registers)

> Each sub-task appends its own `### <SUB-id>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Why it is stated this bluntly.** Up to **three of the thirteen sibling sub-tasks are in flight concurrently**, and **all thirteen** write into `90_open-items-and-provisional-register.md` and `91_caps-and-incomplete-scope.md`. That makes both files merge-conflict magnets, and the default conflict resolution — pick one side — silently deletes a sibling's open item or cap. An open item that is silently deleted is worse than one never filed: the package then reads as complete while carrying an unowned gap. **Keep both sides** makes the failure mode a visible duplicate rather than an invisible omission.

Duplicates are expected and are **not** cleaned up in flight. **NEU-969 (SUB-12) is the declared single owner that reconciles the caps register at the end** — it merges duplicate entries, resolves cross-references, and publishes the reconciled register alongside the completeness gate. Until SUB-12 runs, a duplicate entry is correct-by-convention, and any other sub-task that "tidies" one is destroying evidence, not helping.

`90_…` and `91_…` are created **well-formed and empty apart from the creating sub-task's own entries**. SUB-1 pre-populates no sibling's rows; a `### SUB-<n>` heading appears only when the sub-task that owns it writes into it.

## Status discipline (inherited, not redefined)

Inherited from NEU-887 via `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md` §1: **settled** / **provisional** / **unresolved**; union rows, never replace; **a producing task may not promote its own artifact to `settled`**; status flips only in a ledger. Every topic document in this package defers its status in its header line, exactly as the C005 topic documents do.

## Verification note — `qa-execution:engine` is unconfigured

This repository's capability registry resolves to **`git, linear`** only; **no `qa-execution:engine` provider is registered**. The automated QA-execution phase is therefore a genuine **no-op** for this package, not a skipped step, and **no QA pass is claimed anywhere in it**. That is the correct outcome for a documentation deliverable: this package contains no runtime behaviour, so there is nothing a browser or engine could exercise. Verification here is by **file inspection and `git diff`** against the named success criteria — see `92_package-completeness-gate.md` when it lands.

## Provenance

**Binding upstream inputs, cited by version:** the NEU-889 DP-map package `../C005-dp-map-package/` (v1.0.0, gate 38/38); `../C005-dp-map-foundations/` (NEU-932 — `D-F1`…`D-F5`, `D-F3a`, verification cutoff 2026-07-16); `../C005-instructional-model/package/` (NEU-888 — mechanisms `M01`–`M10`, mastery gates A–E); NEU-887's seven-class evidence taxonomy at `../C005-product-foundation/01_evidence-taxonomy.md` and its frozen measurement-contract register `v1.0`.

**Consumers:** every C009 sub-task. **SUB-3 (NEU-959)** in particular consumes `01_provenance-and-rights.md` §3's access-permission record and §6's retention disposition as **preconditions** before it issues its first citation request, and re-decides neither.
