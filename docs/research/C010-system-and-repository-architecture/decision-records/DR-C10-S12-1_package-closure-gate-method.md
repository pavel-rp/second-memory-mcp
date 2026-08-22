# `DR-C10-S12-1` — How the package-completeness gate derives its item set and disposes of each item

**Written by:** NEU-986 (SUB-12) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-12`
**Written:** 2026-08-22
**Model:** claude-opus-5[1m]
**Carried in:** `../94_package-completeness-gate.md` §1, §1.1, §1.2, §5; `../17_package-closure-and-neu-896-handoff.md` §1

---

## Decision

**Four decisions, all methodological. This record decides nothing about the architecture — no boundary,
authority, topology, classification or substrate is settled or revised here.**

**1 — The gate's item set is *derived* from three published sources, and the derivation is published
before the items.** The set is the twelve outcomes' **"Verified by"** clauses in
`../01_outcome-register.md` (one item per named verification, **42**), plus `OUT-12`'s own
house-style artifact enumeration (**10**, after excluding the two elements Group A already carries),
plus the eight reads `../94_package-completeness-gate.md`'s reservation stub enumerates and the QA
no-op it requires be recorded (**9**). **61 items, `G-1` … `G-61`.** The count is a consequence of the
derivation, not a target.

**2 — Every item resolves to exactly one of four dispositions**, and the four are stated before the
table so a reader can tell what each answer claims:

- **pass** — answered, with a citation resolving into `docs/research/`.
- **pass-with-qualification** — answered with a citation, **and the evidence is thinner than the item's
  own wording**; the shortfall is stated in the row and never silently upgraded.
- **fail** — answered with cited evidence, **and the answer is negative**; routed to a named owner.
- **capped** — **not answerable with cited evidence at all** from inside this charter; recorded as a
  `CAP-S12-*` entry with **one** named owner.

**3 — A performed check that returns a negative answer is a *fail*, not a cap.** The distinction is
load-bearing and is the reason there are four dispositions rather than three: a cap says *we could not
find out*; a fail says *we found out, and the answer is no*. Recording the cold read's negative verdict
as a cap would have understated it, because a cap reads as absence of evidence where this is evidence of
absence.

**4 — Items discharged by SUB-12's own artifacts are marked `†` and counted, and the count is published
as the gate's own weakest evidence class.** Ten of the 61 carry it. The gate does not decline to answer
whether the handoff list exists merely because it wrote the handoff list; it answers, marks the answer
self-graded, and tells a reader to check those rows directly. **The one item where self-grading was
categorically barred — the cold read — was not self-graded**: it was performed by an independent reader,
and it failed.

---

## Rationale

**On deriving the item set (1).** A completeness gate is only as trustworthy as its item set: a gate
that invents its own items can pass by choosing easy ones, and no reader can detect it. Deriving the
set from the outcome register's own "Verified by" clauses makes the item set **checkable against a
merged artifact this sub-task did not write**. Publishing the derivation before the table means a reader
who disagrees with an answer can first check whether the question was the right one. The three sources
are not arbitrary: the outcome register is the charter's own statement of what verification each outcome
requires; `OUT-12` is the outcome that specifies the package's shape; and the reservation stub is SUB-1's
frozen instruction to this sub-task, which a gate that ignored it would be answering a different question
than the one asked.

**On four dispositions rather than a score (2).** A percentage or a pass mark compresses away the only
information the gate carries. "90 % complete" is unactionable; "`G-27` fails, owner `NEU-896`, lifting
condition stated" is a work item. The four labels are chosen so that each answer states its own
epistemic status, and so that the two weakest — qualified and capped — cannot be read as the strongest.

**On pass-with-qualification specifically.** Fifteen items are answered by evidence that exists but is
thinner than the criterion's wording, and each thinning has a different cause: a criterion whose own
figure is a miscount (`G-19`, `G-20`), a check whose result is definitional rather than empirical
(`G-12`), a check that ran and passed while merged artifacts contest three of its rows (`G-8`), an
assessment three of whose facts return *cannot be determined* (`G-29`). Collapsing all fifteen into
*pass* would publish fifteen claims stronger than their evidence; collapsing them into *fail* would
manufacture severity where the criterion is substantially met. Neither is honest, so the label exists.

**On fail versus cap (3).** This decision was forced by the cold read. `CAP-S11-1` recorded the cold read
as unperformable; it was performed; it returned negative. Three shapes were available — mark it capped
(the plan's original three-disposition scheme), mark it passing because the exercise was completed, or
mark it failed. Only the third is true. A gate that reported *"cold read: capped, could not be
performed"* over a package where it **was** performed and **did** find seven blocking contradictions
would be hiding its most valuable single result behind its second-weakest label.

**On the `†` marker (4).** `../94_package-completeness-gate.md`'s reservation forbids SUB-12 from
promoting its own work to passing. Read literally and maximally, that would leave ten items unanswerable
and the gate structurally incomplete — which is worse, because an unanswered item is indistinguishable
from an unnoticed one. Read in context, the clause is about substituting the author's own reading for
the independent cold read, which is exactly what was **not** done. The marker resolves the tension
without weakening either half: the items are answered, the self-grading is disclosed per row and counted
in aggregate, and the reader is told plainly that these ten are the weakest evidence in the package.

---

## Rejected alternatives

**A percentage score, or a single pass/fail mark for the package.** Rejected. Both destroy the routing
information that is the gate's entire product. A reader converging this package needs to know *which*
six items do not pass and *who owns each*; "55 of 61" without the table tells them nothing they can act
on, and a single FAIL over a package where 55 items pass with cited evidence would be as misleading in
one direction as an all-pass gate would be in the other. The tally is published **after** the table and
as a summary of it, never in place of it.

**Three dispositions — pass, pass-with-qualification, capped — as originally planned.** Rejected once
the cold read returned. See Rationale (3). The three-label scheme has no way to express *a check was
performed and the answer is no*, and five of the 61 items are exactly that.

**Re-running `NEU-985 (SUB-11)`'s four mechanical audits to produce fresh figures for the gate.**
Rejected on three grounds. **(i)** It is explicitly out of scope: the audits are consumed as input.
**(ii)** A second unreconciled set of counts, produced by the closing sub-task and reviewed by nobody, is
strictly worse than one set produced by a sub-task that had a reviewer. **(iii)** Where the two would
disagree, the package would ship with a contradiction at the exact point it is supposed to stop
producing them — and `F-S12-4` records that unreconciled contradictions are already this package's
characteristic defect.

**Repairing the defects the gate finds, so that more items pass.** Rejected, and this is the decision
most likely to be second-guessed. Repairing `F-S11-1`'s 159 citation defects, `F-S11-4`'s 38 label↔id
mis-pairings, `F-S4-2`'s count and `F-S12-3`'s transposition would have moved `G-42` and parts of `G-3`
into passing, and would have made the gate look better. It is rejected because **(i)** every one of them
lives in a **merged sibling chapter**, which this sub-task is barred from editing; **(ii)** the repairs
would destroy the audit evidence that located them — a repaired citation is indistinguishable from one
that was never broken, and `F-S11-1`'s single-mechanism finding is only visible while the 159 remain;
and **(iii)** a gate that repairs what it grades is grading its own work at scale, which is the one thing
the reservation stub names. The alternative taken is `DR-C10-S12-2`: publish the convention, route the
enforcement, repair nothing merged. The single exception — four rows added to `docs/GLOSSARY.md` — is
decided there and is an addition to a file **outside** the package, not an edit to a merged chapter.

**Answering the ten self-graded items by omission — leaving them blank or marking them "not gradeable
here".** Rejected. See Rationale (4). It would leave the gate with ten holes that a reader cannot
distinguish from oversights, and would give the false impression that SUB-12 refused to grade its own
work when in fact it graded it and disclosed the conflict.

**Deduplicating the derived set — merging `G-41` with `G-52`, and `G-53`–`G-58` with their Group A
counterparts.** Rejected. The overlaps are a property of the three published sources, and a set that
silently merged them would be smaller, tidier, and no longer checkable against its sources. The overlaps
are stated at `../94_package-completeness-gate.md` §1 instead.

---

## Consequences

**The gate ships with 6 of 61 items not passing, and that is the intended shape.** 40 pass, 15 pass with
a stated qualification, 5 fail, 1 is capped. Five caps are filed, `CAP-S12-1` … `CAP-S12-5`, each with
one named owner, all `NEU-896`.

**The failures cluster, and the cluster is itself a result.** `G-3`, `G-41` and `G-52` are one finding
seen three times — the independent reader was blocked. `G-27` and `G-42` are long-standing filed defects
no pass repaired. **Not one failure is an analytical error in an architecture decision**: every decision
this package makes survives its own gate item.

**A reader can check the gate rather than trust it.** The item set is derivable from
`../01_outcome-register.md` and this file's reservation stub; each row carries a citation or a cap id;
the tally is arithmetic over the table; and the ten weakest rows are marked and counted.

**Severity is not manufactured, and the gate says so where the evidence says so.** The package's largest
defect by count — 161 unresolvable citations — is recorded as **159 occurrences of one mechanical error
in two directions**, which is genuinely less serious than 161 independent ones. A gate that reported
"161 citation failures" without that structure would be technically accurate and materially misleading.

**The `†` count is a standing invitation to re-check.** Ten items rest on SUB-12 grading SUB-12. If any
later pass wants one number in this gate to re-derive first, those ten are it.

**One consequence this record does not create:** the gate's dispositions bind nothing. A `fail` routes a
finding; it does not block a merge, invalidate a decision, or reopen a closed sub-task. The gate is a
statement of what is and is not evidenced, addressed to `NEU-896`.

---

## Evidence

- **Item set, Group A** — `../01_outcome-register.md`, the "Verified by" clause of each of `OUT-1` …
  `OUT-12`, read verbatim at cutoff `3352c00`; 42 named verifications.
- **Item set, Group B** — `../01_outcome-register.md` `OUT-12`'s success measure, which enumerates the
  C005 house-style artifact set and the standalone property; 13 elements, two of which (`G-40`, `G-42`)
  are already Group A items.
- **Item set, Group C** — `../94_package-completeness-gate.md`'s reservation stub, § "The gate reads, at
  minimum" (eight reads) and its `qa-execution:engine` no-op paragraph.
- **Consumed audit verdicts** — `../16_mechanical-audits.md`: traceability **PARTIAL** (§4.1), citations
  **FAIL** (§5.1), spike register and quarantine **PASS** (§6.1, §6.3), no-in-app-judge sweep **PASS**
  (§7). None re-run.
- **The cold read** — `../17_package-closure-and-neu-896-handoff.md` §2, including the isolation enforced
  (§2.2), the reader's verbatim self-disclosure (§2.3), its verbatim verdict (§2.5) and the seven
  blocking questions (§2.6). Evidence class: **proxy signal**, per `../00_method-and-provenance.md` §1.1
  — never external-user or expert validation.
- **Self-grading constraint** — `../94_package-completeness-gate.md`'s reservation, § "What SUB-12 must
  not do here", first bullet.

---

## Revision trigger

This record is revised if any of the following becomes true.

1. **The outcome register's "Verified by" clauses change.** The item set is derived from them; a change
   there changes the set, and the derivation must be re-run rather than the table patched.
2. **A later pass repairs a defect the gate recorded as failing.** The disposition is a statement about
   the package at cutoff `3352c00`; a repair on `origin/develop` makes the row stale and the gate must
   be re-answered for that item rather than annotated.
3. **A second independent cold read is performed against a reconciled package.** `G-3`, `G-41` and `G-52`
   would all be re-dispositioned on its result, and `CAP-S12-1`'s lifting condition names the
   reconciliation as the precondition for that read being informative.
4. **Any of the ten `†` items is independently graded.** The self-graded marker exists to be removed;
   a row graded by another party stops being `†` and its disposition should be re-derived from that
   party's finding rather than from this one.
