# DR-C10-N990-1 — Re-grade the ten self-graded rows blind and additively, rather than sighted, in place, or by a context-inheriting reader

**Task:** NEU-990 · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-23
**Model:** claude-opus-5[1m]
**Discharges:** no `OUT-*`. This record is a **verification method** applied to the closed package's own gate, not an architecture decision inside it — see "A note on the id namespace" below.
**Cites:** `../94_package-completeness-gate.md` §1.2, §5, §7; `../17_package-closure-and-neu-896-handoff.md` §2.2, §2.3, §3, §8, §13; `../93_stand-in-assumption-register.md` (`A-25`, `A-26`); `../traceability/S11_outcome-coverage-audit.md`; `../traceability/S12_package-closure-coverage.md`; `../02_findings-register.md` § NEU-990 (`F-N990-1` … `F-N990-4`), `F-S12-2`, `F-N987-1`, `F-N988-1`.

---

## A note on the id namespace

The naming rule in `README.md` is `DR-C10-S<n>-<k>`, where `<n>` is the **sub-task number**.
**NEU-990 is not a C010 sub-task** — the sixteen are `NEU-971` … `NEU-986` and the package closed on
2026-08-22. Minting an `S17` would assert a seventeenth sub-task that does not exist, and a flat
`DR-C10-<nn>` would introduce exactly the global counter this package's id namespacing exists to
prevent. This record therefore allocates in an **`N990` namespace keyed to its own tracker id**,
following the precedent `DR-C10-N988-1` and `DR-C10-N987-1` already set. Cite it as
**`DR-C10-N990-1`**.

---

## Decision

**The ten `†` rows of `../94_package-completeness-gate.md` are re-graded by a freshly-spawned reader
that inherits none of the shipping run's context, is blinded to the dispositions under review, and
grades against the item wording plus the gate's own four-disposition rubric — and the result is
**appended beside** each original self-grade rather than written over it.**

Four sub-decisions, each of which has a wrong answer:

1. **Blind, not sighted.** The reader is barred from `94_…md` for the nine rows gradable without it,
   and is given the item wording and rubric but **not** SUB-12's dispositions or evidence cells.
2. **Staged, not single-pass.** `G-40` is a claim *about* `94_…md` and cannot be graded blind, so it
   is graded **last**, after the other nine verdicts are written and frozen.
3. **Non-inheriting, not a fork.** The reader is a fresh agent. A context-inheriting fork would carry
   this run's reading of the package and would not be an independent reader in any sense.
4. **Additive, not corrective.** The original disposition, the `†` marker and the `† count: 10 of 61`
   line are preserved exactly; a divergence is recorded as a second verdict and, where it is a
   downgrade, as a re-disposition stated alongside — never as an edit to the original cell.

---

## Rationale

The criteria and their weights, stated before the scoring rather than reverse-engineered:

| Criterion | Weight | Why it carries that weight |
| --- | --- | --- |
| **K1 — the verdict must be capable of differing from the self-grade** | **Decisive** | The whole commission is to settle whether self-grading was generous. A method that cannot produce a different answer measures nothing, and would be worse than no re-grade because it would look like confirmation. |
| **K2 — the original grade must survive** | **Decisive** | The delta *is* the evidence about the gate's calibration. Overwriting the self-grade destroys the only thing this task produces that the package did not already have. |
| **K3 — the isolation claimed must equal the isolation enforced** | **High** | The subject of this task is grading integrity. Overstating the isolation would refute the artifact that contained the overstatement. `../17_…md` §2.3 set the standard by disclosing its own limit unprompted. |
| **K4 — no merged sibling chapter is amended** | **High** | `F-N987-1` records that every C010 sub-task that met a cross-chapter defect stopped at the boundary correctly. This task holds no more licence than they did. |
| **K5 — cost** | **Low** | A single reader over a 63-file corpus is cheap either way; cost did not decide anything here. |

**K1 decides sub-decisions 1–3.** A reader shown `pass †` in the cell it is grading is anchored, and
the resulting agreement is uninformative — the failure mode is silent, because an anchored reader
produces exactly the output a rigorous one would produce when the original happened to be right.
Blinding is the only mechanism that makes disagreement *possible*, and disagreement is what actually
occurred: two of ten rows diverged, one in each direction. Staging (`G-40`) is the minimum
concession to a row that is self-referential by construction, and confining the un-blinding to that
single row keeps K1 intact for the other nine. A fork fails K1 outright.

**K2 decides sub-decision 4**, and is reinforced by `K4`: this package's whole convention is additive
co-naming, published by SUB-12 itself at `../90_open-items-and-provisional-register.md` — *"The
original owner is not overwritten; the co-naming is additive"* — and followed by `DR-C10-N988-1` when
it declined an amend authority it had actually been granted.

**K3 shapes what is published rather than what is done.** The isolation achieved is *by instruction
over an unrestricted tool surface*. Three leaks are recorded at `../94_…md` §7.1 — a self-disclosed
staging slip that exposed `G-61`'s original disposition, a structural leak in which
`../traceability/S12_package-closure-coverage.md` republishes the gate's aggregate tally, and harness
injection of repository instruction files and tool listings. One of them is materially **weaker than
SUB-12's own pattern**: `F-S12-2` records that its cold reader was pointed at *"a filesystem copy
holding only the 63 published package files"*, whereas this reader was pointed at the package **in
place** in a live worktree. That is stated plainly at §7.1 rather than glossed, because K3 outranks
looking rigorous.

**Where a divergence lands is decided by the gate's own §1.1 rule, not by a new one.** A downgrade
that is still answered with a citation is a `pass-with-qualification`; only an item that cannot be
answered with cited evidence at all becomes a cap with one named owner. `G-38` is answered, so it is
re-dispositioned and **no cap is filed** — and `../91_caps-and-incomplete-scope.md` is consequently
absent from the change set, stated rather than omitted.

**The asymmetry on `G-60` is deliberate.** Where the independent verdict is *harsher*, it is adopted;
where it is *more lenient* than the author's own grade, the author's grade is kept. Upgrading a row
because an outside reader was kinder to it than its writer was is the one direction in which this
exercise could manufacture an unevidenced pass, which the brief and §1.1 both forbid.

---

## Rejected alternatives

- **A context-inheriting fork of the shipping agent as the reader.** Cheapest, and it would have had
  the package already loaded. **Rejected because it fails K1 absolutely**: a fork carries this run's
  own reading of `94_…md`, including every disposition, so its "independent" verdict is the shipping
  agent's verdict wearing a second name. This is not a marginal weakness — it voids the deliverable.
- **A sighted re-grade — hand the reader the full `94_…md` row, self-grade included, and ask it to
  confirm or challenge.** Simpler, needs no staging, and grades all ten uniformly. **Rejected on K1:**
  confirmation bias is strongest precisely where the original is defensible-but-thin, which is the
  class this task exists to test. `G-38` is the proof — it was graded `pass` by its author, is
  contradicted by an independently-authored artifact (`../traceability/S11_outcome-coverage-audit.md`
  says the check *"is **not** run … no C010 sub-task performs it"*), and a sighted reader shown
  `pass †` would very likely have confirmed it.
- **A single un-staged blind pass covering all ten, with `G-40` graded from the item wording alone.**
  Avoids the un-blinding entirely. **Rejected because it would produce an unevidenced verdict:**
  `G-40` asks whether 61 rows each carry a citation, which is not answerable without reading the 61
  rows. Grading it blind would mean asserting a structural property no one checked — the exact defect
  §1.1 forbids.
- **Repair the downgraded row's underlying defect in place** — correct `../17_…md` §3's two lossy
  envelopes so `G-38` can stand as a plain `pass`. Tempting, small, and it would leave the package
  strictly better. **Rejected on K4**, and for the reason `F-N987-1` states: the licence to amend a
  merged sibling chapter did not exist for SUB-10, SUB-14 or SUB-16, was not granted to this task, and
  editing away a defect is also how the delta this task exists to record gets destroyed. It routes to
  `NEU-896` as `F-N990-2` instead.
- **Overwrite each self-grade with the independent verdict, leaving one clean column.** Produces a
  tidier file. **Rejected on K2:** it destroys the calibration evidence, and it would silently
  convert `G-60` — where the independent read was *more lenient* — into an upgrade nobody decided.
- **Re-grade all 61 rows, not just the ten.** More thorough. **Rejected as out of scope and
  actively harmful here**: the 51 non-`†` rows are not the weakest evidence class, several were
  graded by sibling sub-tasks rather than by SUB-12, and diluting a ten-row blind re-grade into a
  61-row sweep would have made each verdict shallower without answering the question asked.
- **File a cap for the `G-38` downgrade anyway, to give it an owner.** Superficially safer.
  **Rejected because it misapplies §1.1:** a cap is for an item that *cannot be answered with cited
  evidence at all*, and `G-38` is answered. Filing one would inflate the cap register and misdescribe
  the defect, which is a lossy restatement — a finding — not a scope limit.

---

## Consequences

**What this commits the programme to.** `../94_package-completeness-gate.md` now carries two
dispositions for ten of its rows, and any later reader must read §5 and §7.7 together — §5 is not
superseded and is deliberately not rewritten. The tally moves by exactly one row: **pass 40 → 39,
pass-with-qualification 15 → 16**, with fails, caps, and the count of items answered with a citation
(55) all unchanged.

**What it forecloses.** `../94_…md` §1.2's standing instruction that a converging reader *"should
check the ten `†` rows directly rather than take them"* is discharged; NEU-896 inherits the check
rather than the obligation. It also forecloses the cheap reading in either direction — the gate can
no longer be dismissed as self-serving (eight of ten hold), nor cited as independently validated (the
isolation was not hermetic, and `G-61`'s confirmation is contaminated).

**What it makes more expensive.** Any future re-grade of this or a sibling package now inherits
`F-N990-3`: the corpus leaks its own answer through the traceability set, so a genuinely blind
re-grade of a published gate is not achievable by file-exclusion alone. Whoever repeats the method
pays for either a curated corpus or an honest disclosure.

**Migration path, where one is implied.** None for the package. For NEU-896: `F-N990-2` (read
`../93_…md` for the envelopes, not `../17_…md` §3) and `F-N990-4` (one line in `../17_…md` §8's rollup)
fold into the single reconciliation pass `F-S12-4` already scopes — they add two items to it and
create no new pass.

---

## Evidence

- `../94_package-completeness-gate.md` §1.2 (the ten `†` rows and the instruction to check them),
  §1.1 (the four dispositions and the never-an-unevidenced-pass rule), §5 (the original tally), §7
  (this re-grade, its isolation statement, the side-by-side table, and the second tally).
- `../17_package-closure-and-neu-896-handoff.md` §2.2 and §2.3 (the isolation-disclosure standard this
  record matches), §3 (the reconciliation surface whose two restatements are lossy), §8 (the risk
  rollup behind `F-N990-4`), §13 (the four consumed audit verdicts and the QA no-op).
- `../93_stand-in-assumption-register.md:66` (`A-25`'s three tolerated modes) and `:81`, `:83`
  (`A-26`'s three concrete limbs and its concrete invalidating outcome) — the source side of the diff
  behind `F-N990-2`. The register is **closed at five entries, `A-25` … `A-29`**, is named in this
  rationale rather than only cited, and is untouched by this task.
- `../traceability/S11_outcome-coverage-audit.md:65` — SUB-11's verbatim record that the `G-38` review
  *"is **not** run here … no C010 sub-task performs it."*
- `../traceability/S12_package-closure-coverage.md` — the file that republishes the gate's aggregate
  tally, and so the source of the structural leak recorded as `F-N990-3`.
- `../02_findings-register.md` § NEU-990 (`F-N990-1` … `F-N990-4`); `F-S12-2` (SUB-12's cold-read
  isolation, including the filesystem copy this task did **not** reproduce); `F-N987-1` (no C010 party
  held a licence to amend a merged chapter); `F-N988-1` and `F-N988-2` (the owner-liveness weakening
  that reaches `G-40` after the fact).
- **Stand-ins relied on: none.** This record rests on no `A-2x` entry; it reads two of them as
  evidence rather than assuming either.
- **Spike records relied on: none.** No code was written, no artifact quarantined, no expiry
  incurred. A re-grade is a review, not a spike — the same distinction `../17_…md` §12 draws for the
  cold read, and for the same reason.
- **Capability registry**, read mechanically during this task: exactly **`git`** and **`linear`**.
  Neither owns `qa-execution`, so QA is a Core Article 8 no-op and **no QA pass is claimed**.

---

## Revision trigger

**The observable event that reopens this decision:** *a party that authored none of this package —
and none of this re-grade — publishes a re-grade of the same ten rows under an isolation contract
that closes the `F-N990-3` corpus leak (a curated corpus that excludes the traceability set's tally),
and reaches a verdict differing from `../94_…md` §7.2 on any row.*

That event would establish that the leak recorded at §7.1 moved the verdicts materially, which this
record explicitly declines to claim either way. **Not** a date, **not** anyone's satisfaction with the
result, and **not** the mere arrival of NEU-896's reconciliation pass — reading these findings is not
re-deciding the method that produced them.

A secondary trigger, narrower: *`../17_…md` §3 is amended so that all five tolerance envelopes restate
`../93_…md` without loss.* That would discharge `F-N990-2` and would make `G-38`'s downgrade
reviewable on its merits again — it does not by itself restore the row to a plain `pass`, because the
`S11` record that no sub-task performed the review would still stand.
