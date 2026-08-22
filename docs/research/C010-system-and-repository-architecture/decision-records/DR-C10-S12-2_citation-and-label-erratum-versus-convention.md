# `DR-C10-S12-2` — Erratum versus convention: the citation and label defects are decided by a standing rule, not repaired in place

**Written by:** NEU-986 (SUB-12) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-12`
**Written:** 2026-08-22
**Model:** claude-opus-5[1m]
**Carried in:** `../17_package-closure-and-neu-896-handoff.md` §7.1; `../94_package-completeness-gate.md` §2 (`G-42`), §6

---

## Decision

`NEU-985 (SUB-11)` routed four findings here naming this sub-task as the party positioned to decide
**erratum versus convention** — `F-S11-1` (161 non-resolving citations), `F-S11-2` (two upstream
documents cited by bare filename), `F-S11-4` (38 label↔id mis-pairings) and `F-S11-7` (one correct
cross-charter label written without its charter). `F-S11-6` (four coined terms with no glossary row) is
routed here as the only remaining party that can add a row without rewriting a merged chapter.

**Five decisions.**

**1 — The citation convention is published as a standing rule, stated positively.** Within
`docs/research/`:

- A **package-root** file cites a **package-root sibling** by bare filename — `01_outcome-register.md` —
  never `../01_outcome-register.md`.
- A file in **`decision-records/`** or **`traceability/`** cites a package-root sibling with **one**
  `../`, and a file in **another package** with **two** — `../../C005-product-foundation/README.md`.
- Every **upstream** reference carries its **package directory**, never a bare filename: a same-numbered
  sibling in another package is a plausible wrong resolution that fails silently and confidently.
- Every **cross-charter** sub-task label carries its charter — `NEU-890's SUB-10 (NEU-966)`, never a bare
  `SUB-10 (NEU-966)` in a chapter that also uses `SUB-10` for this charter's.

**2 — The 161 non-resolving citations and the 38 label↔id mis-pairings are *not* repaired.** No erratum
pass is run over any merged file. The convention above governs what is written from here; the existing
occurrences stand as SUB-11 measured them.

**3 — The enforcement is routed, not asserted.** A mechanical link check over `docs/research/` that fails
on a non-resolving citation is filed as **`OI-S12-1`**, owner `NEU-896`, and published as success measure
`SM-7` — whose value today is **161 failing**. A convention with no check is how the 159 were written in
the first place.

**4 — `F-S11-4`'s and `F-S11-7`'s recoverability is stated rather than repaired.** The tracker truth map
is published in full at `../16_mechanical-audits.md` §8.1, and every mis-pairing is individually located
in `F-S11-4`. A reader who meets a wrong pair has a one-hop correction inside the package.

**5 — `F-S11-6` is discharged by action: four rows are added to `docs/GLOSSARY.md`** for **`state
category`**, **`read-projection`**, **`write-intent`** and **`split-visibility workspace`**. This is the
**one** repair this sub-task performs, and it is permitted precisely where the others are not — see
Rationale (5).

---

## Rationale

**On the convention being derivable (1).** The rule is not invented here; it is read off the tree. 1,248
of 1,420 citations already follow it, and the 159 defects are the same rule applied at the wrong depth in
two opposite directions — 129 with a spurious `../` from a package-root file, 30 one `../` short from a
subfolder. Publishing the rule turns a majority practice into a checkable one. Stating it **positively**
matters: "don't write `../` from the package root" is a rule a writer must first know they are at the
package root to apply, whereas "a package-root file cites a sibling bare" is applicable without knowing
the failure mode.

**On not repairing (2).** Four grounds, in descending order of force.

**(i) Every occurrence is in a merged sibling chapter or register entry**, and this sub-task is barred
from editing one. The bar is not procedural fastidiousness — it is what makes a sixteen-sub-task
append-only package auditable at all. A closing sub-task that rewrites fifteen predecessors' files
produces a package no one reviewed.

**(ii) Repair destroys the evidence.** `F-S11-1`'s most valuable output is not the number 161; it is the
finding that **159 of them are one mechanism**, which is what makes the defect a *convention gap* rather
than 161 acts of carelessness. A repaired citation is byte-identical to one that was never broken. Repair
the 159 and the finding becomes unverifiable, and the calibration it supports — that this is one
mechanical defect, not 161 independent ones — becomes an assertion.

**(iii) A repair pass is exactly the wrong shape of work for the party doing it.** 159 depth changes and
38 id changes across ten merged files, executed by the sub-task with no reviewer after it, is a high-count
low-attention edit on the package's most citation-dense surface. The realistic outcome is a smaller
number of *new* defects introduced silently into files their authors can no longer check.

**(iv) The cost of not repairing is bounded and measured, and SUB-11 measured it.** `F-S11-1` §5.3
records what the defect actually costs a reader: a wrong path fails **loudly** — the file is not there —
which is recoverable, unlike a path that resolves to the wrong file. The one genuinely dangerous class is
`F-S11-2`'s bare upstream filenames, which resolve **plausibly and wrongly**, and there are **two** of
them; the convention's third clause is aimed squarely at that class.

**On routing the enforcement (3).** The convention is the necessary half and the check is the sufficient
half. `OI-S12-1`'s resolving event is deliberately conjunctive — a check that *runs* over a tree with 161
known-broken citations and *passes* is a check that is not looking at them.

**On stating recoverability (4).** `F-S11-4`'s 38 mis-pairings are a real defect and a bounded one: each
is a label paired with the wrong tracker id, in a package that publishes the correct map twice. The
thirty-eighth is the worst-placed — `09_…md:1342` writes `SUB-7 (NEU-982)`, mis-delivering a warning
against conflating two audits to the sub-task that did not write either — and it is filed and located.
SUB-11's own restraint on `F-S11-7` is carried forward rather than re-inflated: three of the four
`SUB-10 (NEU-966)` occurrences carry their charter and are correct, and filing all four as drift *"would
have been a manufactured finding."* This gate does not manufacture one either.

**On the glossary being the one exception (5).** Four properties separate it from every other repair
considered and rejected, and all four have to hold.

- It is an **addition to a tracked file outside the package**, not an edit to a merged chapter or a
  register entry. Nothing another sub-task wrote is changed.
- It **destroys no audit evidence**. `F-S11-6` records that the four rows were missing at cutoff
  `ecf88c5`; adding them does not make that record unverifiable, because the finding names the cutoff and
  the rows are new lines rather than altered ones.
- It **repairs a live breakage**, not a stylistic one: `docs/GLOSSARY.md`'s existing `isolation invariant`
  row lists `state category` in its Cross-refs cell, **so the glossary already points at a term it does
  not define**. That is a dangling pointer in the repository's stated one-hop lookup.
- **No other party can act.** All four coining sub-tasks — `SUB-3 (NEU-973)`, `SUB-7 (NEU-980)` twice,
  `SUB-9 (NEU-983)` — are merged and closed. Routing the finding to them would be routing it to nobody,
  which `OI-S6-2` records as this package's characteristic failure mode.

The project's standing rule — a change that introduces a domain term adds its glossary row in the same
change — is satisfied late rather than not at all. `state category` is the package's most-used domain
noun (45 ids), and `split-visibility workspace` names the **selected** topology, so it is the term a
downstream implementation charter meets first and is least likely to guess correctly.

---

## Rejected alternatives

**Run an erratum pass over all 161 citations and all 38 label pairs.** Rejected on the four grounds in
Rationale (2). It is the alternative with the most surface appeal — it would move gate item `G-42` from
*fail* to *pass* — and it is rejected because a gate that repairs what it grades is grading its own work,
and because the repair would erase the single-mechanism finding that makes the defect legible.

**Publish an erratum table inside the package — 161 rows of "written X, means Y" — without touching the
merged files.** Rejected, though it is the closest runner-up. It preserves the evidence and edits
nothing. It is rejected because it adds a 161-row appendix that a reader must consult on **every**
citation to know whether the one in front of them is affected, which is a higher ongoing cost than the
defect itself; because it duplicates information `F-S11-1` already carries in structured form (per-class,
per-owner, per-target-count); and because it would be the largest single artifact in the package,
devoted entirely to a defect SUB-11 measured as one mechanism.

**Repair only the two `F-S11-2` bare-filename citations, as the one genuinely dangerous class.**
Rejected, narrowly. Two edits are small and the class is the worst one. It is rejected because both live
in `04_…md`, a merged chapter, and because a rule that permits editing a merged sibling "when the defect
is bad enough" has no stable boundary — the next sub-task's judgement of "bad enough" is not this one's.
The convention's third clause covers the class going forward, and both occurrences are located in
`F-S11-2` for any reader who meets them.

**Repair the 38 label↔id pairs only, since a wrong tracker id is a wrong fact rather than a wrong
path.** Rejected. It is the same class of edit to the same merged files, and it would destroy the
comparison that makes `F-S11-4` valuable: that `F-S3-2`'s 13 and `F-S16-1`'s 24 **reproduce exactly**,
which is what establishes the three sightings as one class rather than three unrelated slips.

**Add the four glossary rows to a package file instead of `docs/GLOSSARY.md`, to avoid touching a file
outside the package.** Rejected. `docs/GLOSSARY.md` is the repository's declared one-hop lookup; a
glossary row published somewhere else is not a glossary row, and it would leave the existing dangling
cross-reference dangling.

**Route `F-S11-6` to its four coining sub-tasks and add nothing.** Rejected. All four are merged and
closed; the route would resolve to nobody, and the package would ship with its most-used domain noun
undefined and its glossary pointing at a term it does not carry.

---

## Consequences

**Gate item `G-42` fails, and it fails on the record rather than being repaired into passing.** 161
citations do not resolve at cutoff `3352c00`, and the gate says so.

**The convention binds forward, not backward.** Every citation this sub-task writes — in
`../17_package-closure-and-neu-896-handoff.md`, `../94_package-completeness-gate.md`, this record,
`DR-C10-S12-1` and `../traceability/S12_package-closure-coverage.md` — follows it, including from the two
subfolder files, which use `../` for package-root siblings.

**`SM-7` is published with its true starting value.** *Zero citations in `docs/research/` fail a
mechanical link check* — **161 fail today**. A success measure published at its aspirational value is
not a measure.

**`F-S11-6` is closed by action and the glossary's dangling cross-reference is repaired.** Four rows
added; `isolation invariant` now resolves to a defined `state category`.

**Every other routed finding stays open with a named owner.** `F-S11-1`, `F-S11-2`, `F-S11-4`, `F-S11-5`
and `F-S11-7` each keep their residual route to a merged author and are co-named to `NEU-896`. This
record decides *how* they are treated; it does not close them.

**One consequence worth naming plainly:** this decision means the package ships knowing it has 161 broken
citations and 38 wrong tracker ids, and leaving them. That is the trade — audit evidence and the
append-only guarantee, against a tidier tree. `F-S12-4` records that the same trade produced this
package's characteristic defect, and the trade is stated in both directions rather than only the
favourable one.

---

## Evidence

- `../02_findings-register.md` § SUB-11 — `F-S11-1` (1,420 extracted / 1,248 resolve / 11 by-design
  non-claims / **161 genuine**, **159 one mechanism**; C1 129, C2 30, C3 2; per-owner tally across twelve
  sub-tasks; 0 overruns; 7/7 commit refs resolve), `F-S11-2` (two bare upstream filenames in `04_…md`),
  `F-S11-4` (843 pairs / 61 mismatches → 19 corrective quotations, 3 correct cross-charter, 1 ambiguity,
  **38 genuine**), `F-S11-6` (four coined terms, with the exclusion list published so the check is
  distinguishable from one not run), `F-S11-7` (four `SUB-10 (NEU-966)` occurrences, three qualified).
- `../16_mechanical-audits.md` §5.2 (the two directions), §5.3 (what the defect costs a reader), §5.7
  (upstream references and short-form filenames), §8.1 (the tracker truth map in full), §8.3 (the
  thirty-eighth), §9.1–§9.2 (the glossary check and its published exclusions).
- `docs/GLOSSARY.md` — the C010 section, 17 rows verified present and well-formed before this change;
  the `isolation invariant` row's Cross-refs cell naming `state category`, which had no row.
- The independent cold read — `../17_package-closure-and-neu-896-handoff.md` §2.7, which recorded the
  citation defect and, separately, that ~60 legitimately-outward `../C005-*` / `../C009-*` references are
  **indistinguishable to a cold reader** from the 161 broken ones. Evidence class: **proxy signal**.

---

## Revision trigger

1. **A link check lands and runs over `docs/research/`.** `OI-S12-1` closes, `SM-7` becomes measurable
   continuously, and the convention stops being a rule that relies on authors remembering it.
2. **A reconciliation pass on `origin/develop` repairs the 159 or the 38.** The decision not to repair is
   this sub-task's, made under its own constraints; a party that may edit merged files is not bound by
   it, and this record should then be revised to record what was repaired and when.
3. **The package gains a file at a third depth** — a subfolder inside `decision-records/` or
   `traceability/`, or a nested package directory. The convention's two stated depths would no longer
   cover the tree, and the rule must be extended rather than inferred.
4. **A fifth coined term appears with no glossary row.** The exception granted here is scoped to
   `F-S11-6`'s four; a fifth is a new decision, and the four properties in Rationale (5) must be shown to
   hold again rather than assumed.
