# `DR-C10-N989-1` — The citation paths are repaired, and the evidence the non-repair protected is preserved by restatement

**Written by:** NEU-989 (not a sub-task) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `F-S11-1`, `F-S11-2`, `OI-S12-1`
**Written:** 2026-08-23
**Model:** claude-opus-5[1m]
**Carried in:** `../02_findings-register.md` § NEU-989; `../90_open-items-and-provisional-register.md` § NEU-989

---

## Decision

`DR-C10-S12-2` decided **not** to repair the 161 non-resolving citations, and named the condition
under which that decision should be revised: its Revision trigger (2) — *"A reconciliation pass on
`origin/develop` repairs the 159 or the 38. The decision not to repair is this sub-task's, made
under its own constraints; **a party that may edit merged files is not bound by it**, and this
record should then be revised to record what was repaired and when."*

**This is that party, and this is that record.** Four decisions.

**1 — All 189 in-scope non-resolving citations are repaired.** Re-measured against the current tree
rather than inherited from the finding: **207** non-resolving, of which **18** are by-design
non-claims, leaving **189** genuine. Every one now resolves from the directory of the file that
contains it, per `DR-C10-S12-2`'s convention.

**2 — The repair is token-scoped and append-free.** Only the text inside a backtick span or a
markdown link target changed. No prose, claim, verdict, id, grade or tally was altered; no line was
added, removed, reflowed or renumbered. Every changed file's diff is **equal insertions and
deletions** — 146 / 146 across 30 files — which is the mechanical statement of that constraint.

**3 — The single-mechanism evidence is preserved by restatement, not by leaving the defect in
place.** `DR-C10-S12-2` Rationale (ii) objected that *"a repaired citation is byte-identical to one
that was never broken"*, so repairing the 159 would make `F-S11-1`'s most valuable output — that
they are **one mechanism**, not 161 acts of carelessness — unverifiable. That objection is answered
rather than overridden: `F-S11-1`'s original entry is **untouched**, and the class counts, the two
directions and the per-owner distribution are restated in the closure entry. The evidence now lives
in the register, where it is durable, instead of in the defect, where it was hostage.

**4 — Eighteen by-design non-claims are excluded by name, and the exclusion is mechanical.** They
are listed below with a reason each, and the checker verifies every one is still present at the line
it was declared on. A stale key is a hard error, so the exclusion list can never quietly become a
way of hiding a real defect.

---

## Rationale

**On repairing at all (1).** The three grounds `DR-C10-S12-2` gave for not repairing were all
grounds about **the party**, not about the repair. (i) *Every occurrence is in a merged sibling's
chapter and this sub-task is barred from editing one* — NEU-989 is not barred; the authority is
granted in its brief. (ii) *Repair destroys the evidence* — answered by decision 3. (iii) *A repair
pass is the wrong shape of work for the party doing it: 159 depth changes across ten merged files by
a sub-task with no reviewer after it is a high-count low-attention edit* — answered by making the
edit mechanical rather than manual, and by putting a re-runnable check on both sides of it. The
fourth ground, (iv), was that the cost of not repairing is bounded and a wrong path fails *loudly*.
That remains true, and it is why this was a low-priority item rather than an urgent one; it is not an
argument that the cost is zero.

**On measuring again rather than trusting 161 (1).** Four PRs landed into the package after
`F-S11-1`'s cutoff `ecf88c5` — `NEU-988` (#764), `NEU-987` (#768), `NEU-991` (#766, which added an
entire chapter) and `NEU-990` (#770). Several hundred lines of citations existed that the original
measurement never saw. Re-measurement is also what makes the repair auditable: the per-file tallies
reproduce `F-S11-1`'s exactly where they overlap — C1 `02_…md` ×47, `90_…md` ×37, `92_…md` ×19,
`13_…md` ×2; C2 `traceability/S2` ×11, `S4` ×1, `DR-C10-S2-2` ×5, `DR-C10-S2-3` ×3 — which
establishes that the two runs are measuring the same population rather than two different ones. The
excess over 161 is those four PRs plus a slightly wider extractor that also resolves bare folder
citations and comma-separated line-ref suffixes (`:6,54,330,409`).

**On what was deliberately left alone.** Three classes are measured and **not** repaired, each for a
stated reason rather than by omission:

- **1,151 repo-root-relative citations of source and non-research docs** (`src/…`, `drizzle/…`, `docs/GLOSSARY.md`, `CLAUDE.md`). A uniform corpus-wide convention, not part of `F-S11-1`'s 1,420-citation universe, and not governed by `DR-C10-S12-2`, whose convention is scoped *"Within `docs/research/`"*. Rewriting them to `../../../src/…` would be a revision of every chapter, not a link repair.
- **83 repo-root-relative intra-corpus references**, the large majority of which are the prose noun `` `docs/research/` `` naming the tree rather than citing a file. That the class is dominated by non-citations is itself the evidence that it is not a citation class.
- **199 abbreviated shorthand references** carrying the same spurious `../` (`` `../90_…md` ``). The `…` is not a filename, so the token resolves to nothing whether or not the prefix is removed; stripping it would change 199 lines of prose and make zero citations resolvable. Filed as `F-N989-2`.

**On resolvability being necessary and not sufficient.** A path can be made to resolve and still
point at the wrong file, which would be a worse outcome than the defect — `F-S11-2` establishes that
a *plausible wrong resolution* fails silently and confidently, unlike a dangling one, which fails
loudly. The repair therefore never guesses: a citation is repaired only when the corrected path is
**unambiguous** (exactly one corpus document matches), and a sample across all three classes was
checked semantically against what the citing sentence claims. That sample caught a real error —
`F-N989-1`, where `F-S11-2` names both bare filenames as C009 documents and one of them
(the `01_` target, `../../C005-product-foundation/01_evidence-taxonomy.md`) exists only in C005.
Repairing to the location the finding named would
have produced a path resolving to nothing.

**On the eighteen non-claims (4).** `16_…md` §5.4 itemises 11 by-design non-claims and its closing
paragraph adds a twelfth class: passages that quote a defective or non-existent path **in order to
report it as defective**. These are the one place where repairing a citation genuinely does destroy
evidence, because the quotation *is* the evidence. The chapter states its own count — *"7 such
quotations in `16_…md` and 5 in `02_…md`'s `### SUB-11` section"* — and the checker independently
found exactly 7 in `16_…md`, which is the corroboration that the exclusion list is the right one
rather than a convenient one.

| File | Lines | Count | Why excluded |
| --- | --- | --- | --- |
| `../16_mechanical-audits.md` | 274, 302, 319, 326, 327 | 7 | §5.2 / §5.4 quote the C1 and bare-upstream forms *as* the defects being reported |
| `../02_findings-register.md` | 808, 809, 819, 821 | 6 | `### SUB-11` quotes the forms `F-S11-1` / `F-S11-2` report, and lists citing filenames as audit data |
| `DR-C10-S12-2_…md` | 23, 25, 213, 214 | 5 | The convention statement's own illustrative token, plus `` `decision-records/` `` and `` `traceability/` `` used as prose nouns |

Separately, **seven distinct targets resolve nowhere and are not repaired**, because none is a path
bug: `95_completeness.md` and `traceability/gate.md` name locations that *must not* exist;
`DR-C10-S7-1_repository-topology.md` and `S4_isolation-invariant-coverage.md` are naming-convention
examples; `03_review-log.md` is named bare precisely to say it must **not** be resolved against this
folder; `01_charter.md`, `04_verify.md` and `_local/NEU-982/01_spec.md` are real but **gitignored**.
Pointing any of them at "the nearest plausible file" would manufacture a citation.

---

## Rejected alternatives

**Repair everything that does not resolve, including the 1,151 `src/…` references.** Rejected. It
would make the package internally inconsistent with every other package in `docs/research/`, it is
outside `DR-C10-S12-2`'s scope, and it is a revision of every chapter rather than a link repair. The
brief's constraint — *change citation paths, not prose, not claims, not verdicts* — is what draws
the line, and this alternative crosses it 1,151 times.

**Repair the 18 non-claims too, so the checker needs no exclusion list.** Rejected, and it is the
alternative with the most surface appeal because it would make the gate unconditional. It is
rejected because those tokens are quotations of defects: repairing them would delete `F-S11-1`'s and
`F-S11-2`'s own evidence and make `16_…md` §5 report a defect it no longer demonstrates. An
exclusion list that is itemised, reasoned and mechanically verified is strictly better than a clean
gate that has eaten its own evidence.

**Strip the spurious `../` from the 199 abbreviated shorthand tokens for consistency.** Rejected.
It repairs no link — neither form resolves — and it is exactly the high-count low-attention edit
`DR-C10-S12-2` Rationale (iii) predicts will introduce new defects silently. Recorded as `F-N989-2`
and left to `NEU-896` as a presentational choice.

**Declare `OI-S12-1` satisfied.** Rejected, firmly. The checker is not CI enforcement: it is
gitignored, on-demand, and scoped to one package. Closing the item on the strength of a script that
does not run on `origin/develop` would be the failure the item's own conjunctive resolving event was
written to prevent.

**Amend `F-S11-2`'s Evidence field to correct the C005/C009 attribution.** Rejected. It is a claim
change in a merged sub-task's finding, not a path change. Filed as `F-N989-1` and routed to
`NEU-896`.

---

## Consequences

**`F-S11-1` and `F-S11-2` close.** Both closure records are in `../02_findings-register.md` §
NEU-989, alongside their original entries, which are unamended.

**`OI-S12-1` stays open and its resolving event is restated.** The original event was conjunctive —
a check must run *and fail* — which was correct calibration against a tree with 161 known-broken
citations and is **unsatisfiable** against the repaired tree, where a correct check passes. Restated
at `../90_…md` § NEU-989: the check must run in CI over `docs/research/`, and must be demonstrated
to fail on a **seeded** non-resolving citation. Owner `NEU-896`, unchanged.

**`SM-7` moves from 161 failing to 0 failing for this package, and is unmeasured elsewhere.** The
success measure spans all of `docs/research/`; this task swept C010 only. Stating it as "met" would
overclaim across four other packages nobody measured.

**Gate item `G-42` in `../94_package-completeness-gate.md` is now factually stale in the favourable
direction.** It fails on the record, citing *"161 citations do not resolve at cutoff `3352c00`"*.
That is still a true statement about that cutoff, and **this task changes no grade, verdict or tally
in `94_…md`** — NEU-990 re-graded that chapter and re-grading it again here would be a third party
overwriting a second party's independent assessment. A reader converging the package should read
`G-42` together with this record.

**One consequence worth naming plainly:** the package no longer ships knowing it has 161 broken
citations. `DR-C10-S12-2` stated that trade in both directions — audit evidence and the append-only
guarantee, against a tidier tree — and this record closes it by taking the tidier tree **and**
keeping the evidence, which was only possible because a later party had authority the earlier one
did not. The 38 wrong tracker ids of `F-S11-4` are a **different** defect and are **not** touched
here.

---

## Evidence

- Repair commit `f91f747` — 30 files, 189 tokens, **146 insertions / 146 deletions**, equal on every file.
- Mechanical checker, before: **207** in-scope non-resolving (C1 133, C2 57, C3 17); after: **0**, with `resolve from own dir` rising **920 → 1109**, exactly +189. All 18 declared non-claims verified still present.
- Semantic spot-check across all three classes: `04_…md:318` → the evidence taxonomy at `../../C005-product-foundation/01_evidence-taxonomy.md:12`–`:18` (one `../` as written from `04_…md`'s own directory, two from this record's), whose §1 is titled *"Evidence Taxonomy & Claim Discipline"* and whose lines 12–18 carry the seven classes the citing sentence names; `04_…md:345` → `../../C005-instructional-model/mastery-model/00_operational-mastery-model.md`; `traceability/S3_…md:22` where `../04_…md` was correctly left alone while the four `../C005-*` / `../C009-*` siblings each gained a second `../`; `traceability/S9_…md:51` → `../94_package-completeness-gate.md`.
- `../02_findings-register.md` § SUB-11 — `F-S11-1` and `F-S11-2`, unamended.
- `DR-C10-S12-2_citation-and-label-erratum-versus-convention.md` § Decision (1) (the convention), Rationale (ii)–(iii), and Revision trigger (2), which authorises this record.

---

## Revision trigger

1. **A CI link check lands over `docs/research/`.** `OI-S12-1` closes, `SM-7` becomes continuously measurable, and the exclusion list in this record becomes the check's own fixture rather than a one-run artifact.
2. **Another `docs/research/` package is swept.** `SM-7`'s scope is the whole tree; this record covers C010 only, and its "unmeasured elsewhere" statement should then be narrowed.
3. **`NEU-896` acts on `F-N989-1` or `F-N989-2`.** The first corrects `F-S11-2`'s Evidence field; the second decides the abbreviated-shorthand question either way. Both are routed, neither is decided here.
4. **A sixth by-design non-claim class appears.** The eighteen excluded tokens are enumerated exhaustively against the tree at this cutoff; a new chapter that quotes a defective path in order to report it adds to the list, and the list must be extended rather than the gate loosened.
