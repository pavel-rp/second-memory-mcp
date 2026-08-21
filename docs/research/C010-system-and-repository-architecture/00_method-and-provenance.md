# 00 — Method and Provenance

**Task:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-21 · **Verification cutoff:** 2026-08-21
**Model:** claude-opus-5[1m]
**Status:** deferred — this document sets rules; it decides no architecture question.

This document is the standard every later sub-task's evidence is judged by. It is written **before** any architecture decision precisely so that no decision gets to choose the bar it is measured against. `NEU-985 (SUB-11)` audits against these rules mechanically; `NEU-986 (SUB-12)` answers the completeness gate against them.

---

## 1. The evidence-labelling rule

**Every claim in this package carries a label, and the label is chosen from a fixed set.** The rule exists because this programme has exactly one operator, one maintainer and no users, so the *strongest* evidence available to it is still weaker than a single external validation — and a package that does not say so reads as better-grounded than it is.

### 1.1 Proxy signals versus external validation

**These are proxy signals. None of them is external validation, and none may be described as if it were:**

| Signal | What it is | What it is not |
| --- | --- | --- |
| **Creator dogfooding** | The creator using the system and reporting what happened. `n=1`, and the `1` is the person who designed it. | Evidence about anyone else's behaviour. |
| **Structured AI review** | A model applying a stated rubric to an artifact. | An expert opinion. A model's confidence is not calibration. |
| **Adversarial evaluation** | A model or a person trying to break a claim on purpose. | A guarantee that no other break exists. Absence of a found break is not evidence of absence. |
| **Automated checks** | A script, a type-checker, a linter, a test suite, a mechanical audit over a register. | Evidence about anything outside the check's own scope. A green line proves the check ran, nothing more. |

**External validation would be:** a user who is not the creator, an independent domain expert with no stake in the design, or a production measurement over a population greater than one. **This package has none.** Where a decision would be better made with external validation, the package says so and files a cap (`91_caps-and-incomplete-scope.md`) rather than promoting a proxy signal to fill the gap.

This is the shape of NEU-887's seven-class evidence taxonomy as published in `../C005-product-foundation/01_evidence-taxonomy.md`; where a sub-task needs a finer class than the four rows above, it uses that taxonomy's class name and cites it, rather than inventing a new one here.

### 1.2 The three labels every claim carries

| Label | Meaning | Obligation it creates |
| --- | --- | --- |
| **confirmed** | Verified against a named artifact at a named cutoff — a real file path, a real command output, a real upstream document. | Cite the artifact. A `confirmed` claim with no citation is a defect. |
| **`[unconfirmed]`** | Believed, load-bearing, and not verified. | It must be a numbered entry — a stand-in in `93_…`, an open item in `90_…`, or a cap in `91_…` — and the decision resting on it must name it **at the decision**, not only in an appendix. |
| **consumed** | Decided elsewhere and adopted here without re-deciding. | Cite the owner and the outcome id, owner-attached (`NEU-850's OUT-2`). A consumed constraint may be amended only by routing a recorded amendment to its owner with the contradicting evidence named — never by silent divergence. |

**A claim that is both uncertain and material has exactly two honest resolutions:** a spike record (`92_spike-register.md`) or a cap with a named owner (`91_caps-and-incomplete-scope.md`). **Asserting it is not an available third option.**

---

## 2. Citation discipline

**2.1 Every claim about this codebase cites a real path.** `src/transport/jwt-middleware.ts:127`, not "the JWT middleware". A line number is required where the claim is about a specific line; a bare path is sufficient where the claim is about the file as a whole. A path that does not resolve on the branch under review is a defect, not a typo — `NEU-985 (SUB-11)` checks this mechanically.

**2.2 Every claim inherited from an upstream package cites that package's version or compilation date**, so staleness is detectable. `../C009-course-content-quality/09_enforceable-quality-system.md:70` (compiled 2026-08-10). A citation with no version and no date cannot be told apart from a stale one.

**2.3 Every claim resting on a stand-in assumption names it at the decision.** `A-28` appears in the body of the decision that rests on it — in the sentence, not in a footnote and not only in a summary table. A decision whose only mention of its stand-in is in an appendix fails `OUT-11`'s decision-level check.

**2.4 Every id is cited in its namespaced form.** `OI-S5-2`, `CAP-S12-1`, `SPK-S2-3`, `F-S1-1`, `A-27`. Never a bare `OI-2`.

**2.5 Program-level ids are always owner-attached.** `C005's OUT-8`, `NEU-850's OUT-7`, `NEU-890's OI-S6-5`. **A bare `OUT-n` in this package always means this package's own outcome**, as listed in `01_outcome-register.md`. The C010 charter and the C005 program charter both number from 1; the owner-attached form is what keeps them apart.

**2.6 A spike result cited anywhere in the package cites its record by id, and the citation inherits the record's expiry.** Citing `SPK-S2-1` past its expiry date without re-running or re-labelling it is a defect in the *citing* document, not only in the register.

---

## 3. The standalone rule

**No published file in this package may require a reader to open `_local/` or `docs/wf-plans/` to understand it.**

Both trees are unreadable from a fresh checkout: `_local/` is gitignored (`.gitignore:100`) and `docs/wf-plans/*` is gitignored (`.gitignore:78`) with two tracked exceptions at `:79`–`:80` that do **not** include the C005 program charter. A cross-reference into either tree is therefore a dangling pointer for every reader but its author.

The consequence is concrete and is discharged by `01_outcome-register.md`: **the twelve charter outcomes are restated inside the package**, so a traceability row resolves to `01_outcome-register.md` and never to a charter file nobody can open. Where a sub-task needs to cite material that exists only in an unreadable tree, it **carries the substance into the package** and drops the pointer.

Naming `_local/` or `docs/wf-plans/` in order to *state that they are unreadable* — as this section does — is not a violation. Requiring a reader to *follow* a path into them is.

---

## 4. Vocabulary disambiguation

Three words this package needs already mean something else in this codebase. **Each is disambiguated at first occurrence in every document that uses it**, using the qualified forms below.

| Word | This project's existing meaning (`docs/GLOSSARY.md`) | The architecture sense | Required qualified form |
| --- | --- | --- | --- |
| **subject** | A chunk's academic category. | The authenticated principal a token resolves to (`payload.sub \|\| azp`). | **authenticated subject** / **JWT subject** for the identity sense; **chunk subject** for the academic one. |
| **session** | A learning run — explicitly **not** an HTTP or auth session. | A browser-held, authenticated web session. | **learning session** for the domain sense; **web session** for the transport sense. |
| **schema** | A learner's mental problem-pattern. | A database schema (`public`, `infrastructure`) or a tool input schema. | **learner schema** for the domain sense; **database schema** / **tool input schema** otherwise. |

An unqualified use of any of the three is a defect. The qualified forms above are the only ones this package uses; a sub-task does not coin a fourth.

### 4.1 Glossary position (stated, not assumed)

**This package adds no row to `docs/GLOSSARY.md`, and that is a decision rather than an omission.**

The project's rule is that a new **domain** term gets a glossary row in the same change. The vocabulary this package introduces — *stand-in assumption*, *open item*, *cap*, *spike*, *package-completeness gate*, *architecture-material*, *tolerance envelope*, *invalidating outcome* — is **package-governance vocabulary**, not product-domain vocabulary. It describes how this decision package is written and audited; it names nothing a learner, a chunk, a review or a scheduler ever touches. Adding it to the product glossary would dilute a lookup whose value is that every row resolves to a product concept with an owning module and a defining file.

The three words in §4 are handled the other way round for the same reason: they **are** product-domain terms, they already have rows, and this package therefore **disambiguates against the existing rows rather than adding competing ones**.

**This position binds SUB-2 … SUB-16 with one exception:** a sub-task that introduces a genuine *product-domain* term — a component, a state category or a boundary that becomes part of the product's own vocabulary — adds its `docs/GLOSSARY.md` row in the same change, per the project rule. Governance vocabulary stays here.

---

## 5. Verification method

**This is a documentation deliverable, so verification is by file inspection and `git diff` against named, countable success criteria** — not by executing anything. The criteria that can be counted are counted: register entry counts, required-field presence, id-namespace collisions, dangling paths, and outcome coverage. `NEU-985 (SUB-11)` runs those audits mechanically and reports counts, not adjectives.

**Type-check and lint are no-regression checks only.** Neither tool's scope includes `docs/`, so a green line from either says this change broke nothing — it is not evidence about the content of this package. A sub-task that cites a green build as evidence for a documentation claim has mislabelled it under §1.1.

### 5.1 `qa-execution:engine` is unconfigured — a genuine no-op

This repository's capability registry resolves to **`git, linear`** only; **no `qa-execution:engine` provider is registered**. The automated QA-execution phase is therefore a genuine no-op for every sub-task in this package, not a skipped step and not a deferred one.

**Nothing. No QA pass is claimed, fabricated, or implied anywhere in this package.** A sub-task whose QA phase produced no execution records that fact and moves on; it does not report a pass it did not obtain, and it does not file a cap for a check that was never applicable. This package contains no runtime behaviour, so there is nothing an engine could exercise.

---

## 6. What SUB-1 verified, and what it did not

**Verified at the 2026-08-21 cutoff:**

- `docs/research/` is tracked; `_local/` and `/docs/wf-plans/*` are gitignored at `.gitignore:100` and `.gitignore:78`, with tracked exceptions at `:79`–`:80`.
- `../C009-course-content-quality/` exists on `origin/develop` and supplies the house-style conventions this package mirrors.
- The twelve charter outcomes and the charter's numbered assumptions were read directly from the charter of record and restated here and in `01_outcome-register.md`.

**Not verified by SUB-1, and deliberately so:**

- **No codebase fact in the charter's assumption table was re-counted by this sub-task.** The tool counts, file counts, commit tallies and deployment facts are carried as **consumed** from the charter, which records its own verification method and date for each. A sub-task that *depends* on one of those numbers re-verifies it against `src/` at its own cutoff and cites its own command — it does not inherit SUB-1's word for it.
- **No architecture question was examined.** SUB-1 opened the package; it decided nothing inside it.
- **No spike was run.** SUB-1 published the spike discipline (`92_spike-register.md`) and executed nothing under it.

## 7. Provenance

**Binding upstream inputs, cited by version or compilation date:** `../C009-course-content-quality/` (NEU-890, compiled 2026-08-10); `../C005-dp-map-package/` (NEU-889, v1.0.0); `../C005-instructional-model/` (NEU-888); `../C005-product-foundation/` (NEU-897, NEU-887's seven-class evidence taxonomy). **Consumed constraints:** C003/**NEU-850's** OUT-2, OUT-6 and OUT-7 — converged but unimplemented, so each is a decision to honour and never an existing codebase fact.

**Stood in for, not derived:** NEU-891, NEU-892, NEU-893, NEU-894 — see `93_stand-in-assumption-register.md`.
