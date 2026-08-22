# 16 — The package's mechanical audits: traceability, citations, quarantine and the no-in-app-judge sweep

**Task:** NEU-985 (SUB-11) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-22
**Model:** claude-opus-5[1m]
**Covers:** `OUT-12` (its *citation audit* verification clause, and the standalone clause of `00_method-and-provenance.md` §3) · `OUT-11` (its *completeness audit* verification clause) · the coverage audit spanning `OUT-1` … `OUT-12`
**Consumes:** every merged file of this package — all 61 of them — plus `docs/GLOSSARY.md` and the repository's tracked tree
**Consumers:** SUB-12 (NEU-986) at the package-completeness gate; each sub-task named in §11; NEU-896

---

## 1. What this chapter is, and what it is not

**It is four mechanical audits over the merged package, and a list of what they found.**

**It repairs nothing.** Every defect below is a **routed finding naming an owning sub-task**, never
an edit. Three reasons, and the third is the one that matters:

1. The registers are **append-only**, and no sub-task rewrites a sibling's merged entries
   (`02_findings-register.md` preamble; `00_method-and-provenance.md` §2.5).
2. Twelve of the thirteen topic chapters are merged; an audit that edits its subject changes the
   thing it is measuring.
3. **A repair destroys the audit's own evidence.** The reflex on finding a dangling citation is to
   fix the path. Had this sub-task done that, the *systematic* character of §5's defect — 159
   citations wrong by exactly one directory level, in two opposite directions, across twelve
   sub-tasks — would have been invisible, and the package would have shipped with the generating
   mechanism intact and no record that it existed. The finding is worth more than the fix, and the
   fix is not this sub-task's to make.

**It is not a review.** No judgement is offered here on whether a decision is correct, whether a
boundary is well drawn, or whether an authority is well assigned. The audits ask only mechanical
questions: does this path resolve, does this outcome have a row, does this id name a record, does
this term appear where the rule says it must not.

**It is not the completeness gate.** `94_package-completeness-gate.md` is owned solely by
**`SUB-12 (NEU-986)`**. This chapter is one of the inputs that gate reads; it does not run it, does
not pre-empt its verdict, and is not touched by this sub-task.

**It does not re-derive frozen figures.** §2 lists what is consumed rather than re-measured. An
audit that re-derives what the package has already frozen would contradict its own subject.

### 1.1 Why every audit publishes counts, not verdicts

Three of the four audits below were expected to return **zero**, and two of them did. That is the
problem: **an audit that reports zero is textually indistinguishable from an audit that was never
run.** A reader has no way to tell "swept 61 files against 5 terms, 120 occurrences examined, 0
violations" from "swept nothing, found nothing" if both are published as the word *clean*.

So every audit here reports its **surface** — how many files, how many rows, how many candidate
occurrences — before it reports its result, and reports **unmatched counts in both directions** where
a matching is involved. The counts are the evidence. The verdict alone is not evidence of anything.

---

## 2. The revisions and cutoff this audit resolved against

| Input | Revision resolved against |
| --- | --- |
| The package | All **61** `.md` files under `docs/research/C010-system-and-repository-architecture/` as merged at this branch's base |
| The repository | Cutoff **`ecf88c5`** ("chore: bump version to 0.1.253 (#759)"), the `develop` head this branch was cut from |
| The authority matrix | `08_…md` + `10_…md`, revision **`post-validation`** (SUB-16 / NEU-979). Never SUB-13's pre-validation revision |
| The compatibility surface | **46 tools / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`). The charter's "45 / 42" is a **miscount, not staleness** |
| The repository facts | **169 TypeScript source files, 26,816 lines, 202 test files, 25 Drizzle migrations, 720 / 468 / 252 commits** (SUB-9 / NEU-983's re-measurement, superseding earlier figures) |
| The sweep's term list | `03_…md` §2.4's five terms, and its disposition rule, as SUB-2 published them |
| The tracker's child map | NEU-895's children, read at the 2026-08-22 cutoff and restated in full at §8.1 |
| Node runtime for the audit scripts | **v22.23.1** |

**Consumed, not re-derived.** The tool split, the repository facts and the matrix revision are read
from the package and the tracker; this sub-task re-measured none of them. Where a naive grep over
the package contradicts one of them — and one does; see §5.5 — the contradiction is a **finding
about the citing chapter**, not a correction to the frozen figure.

### 2.1 Two false positives this audit was warned about, and declined to report

Recording these is part of the result. An audit's credibility rests as much on the hits it *did not*
manufacture as on the ones it published.

- **`DP` tokens in `src/`.** A grep-based leakage or quarantine audit looking for course-application
  identifiers in the public core finds exactly **two** `DP` tokens in `src/`
  (`src/domain/types/teaching.ts:285`, `src/domain/algorithms/grade-mapper.ts:10`). **Both are
  Dynamic Programming**, the subject matter, and neither is a distribution-line leak. `F-S8-4`
  already records this; §6.4 confirms it independently and reports **zero** leakage hits.
- **Missing spike records for withdrawn candidates.** SUB-10 disclosed four spike candidates,
  withdrew three under the read test and capped one, producing a package-wide `SPK-S10-*` count of
  **zero**. Reporting an absent spike record for a candidate that was *correctly withdrawn* would be
  a defect in the audit, not in the package. §6.2 reports zero `SPK-S10-*` and zero `OI-S10-*` as
  the **expected and correct** state.

---

## 3. The surface: what was swept

Every audit below ran over the same enumerated surface, so the counts are comparable.

| Surface | Count |
| --- | --- |
| Package `.md` files | **61** |
| — topic chapters (`00_`–`16_`, incl. `README.md`) | 18 |
| — shared registers (`02_`, `90_`, `91_`, `92_`, `93_`, `94_`) | 6 |
| — decision records (+ its `README.md`) | 25 |
| — traceability files (+ its `README.md`) | 14 |
| Backticked path citations extracted and resolved | **1,420** |
| Traceability rows | **259** |
| Boundary rows (`BND-S4-*`) | 17 ids over 34 table lines |
| Decision records audited against the six required sections | **24** |
| Distinct register ids: findings / open items / caps / spikes | **60 / 26 / 22 / 4** |
| Label↔id pairs extracted | **843** |
| Sweep term occurrences examined | **120** |
| Tracked repository files at cutoff | **817** (of which `src/` = 169, this package = 61) |
| `docs/GLOSSARY.md` rows | **120** total, **17** added by this package |

**The subject is the package as merged at this branch's base — 61 files.** This chapter and
`traceability/S11_outcome-coverage-audit.md` are the 62nd and 63rd and are **excluded from the
subject by construction**: an audit cannot be part of what it measures. Both are nevertheless
self-checked against the same rules, and the results are recorded in place — §5.4 for the citations
they quote in order to report them, §8.2 for the label↔id pairs they quote in order to correct them.

Scripts were written under `_local/scratch/S11/` per the constitution's article 9 and are **not**
part of the deliverable; the tree is gitignored. Every count above is reproducible from the merged
package by the procedure each section states. **No count in this chapter depends on reading
`_local/` or `docs/wf-plans/`** — that is `00_…md` §3's standalone rule, and an audit chapter is the
last place that could be allowed to break it.

---

## 4. Audit A — traceability and outcome coverage

**The question.** For each of `OUT-1` … `OUT-12`: is there a traceability row that discharges it,
and does every row's evidence resolve into `docs/research/`?

**The procedure.** Enumerate `traceability/S*.md`; extract each file's declared outcomes and each
row; match the union against `01_outcome-register.md`'s twelve; match in the reverse direction from
each topic chapter's front matter; and separately count rows whose evidence resolves into a
gitignored tree.

### 4.1 The result

| Measure | Count | Expected | Verdict |
| --- | --- | --- | --- |
| Traceability files | **13** | — | — |
| Traceability rows | **259** | — | — |
| Rows naming an outcome explicitly | **234** | — | the remaining 25 inherit the outcome from their section heading |
| Outcomes covered by at least one row | **10** (`OUT-1` … `OUT-10`) | 12 | **FAIL** |
| **Unmatched, outcome → traceability** | **2** (`OUT-11`, `OUT-12`) | 0 | **FAIL** — `F-S11-3` |
| **Unmatched, chapter → outcome** | **0** | 0 | **PASS** |
| **Rows resolving outside `docs/research/`** | **0** | 0 | **PASS** |
| Decision records with all six required sections | **24 / 24** | 24 / 24 | **PASS** |
| Boundary rows with a populated "Forced by" cell | **17 / 17** | 17 / 17 | **PASS** |
| Stand-in entries with package ref + envelope + trigger + status | **5 / 5**, 4 packages | 5 / 5 | **PASS** |

**The zero that matters most is real.** `traceability/README.md` makes "**Zero rows resolve into
`_local/` or `docs/wf-plans/`**" the set's binding constraint and assigns the count to this
sub-task. Scanning all 259 rows for references into either tree returns **4 matches, all in the
prose of the constraint's own assertion** — a file *stating* that no row resolves there. Under
`00_…md` §3's own rule ("naming `_local/` … in order to state that they are unreadable … is not a
violation"), those are not rows. **The count of traceability rows resolving into a gitignored tree
is 0**, and it is 0 because the rule was followed, not because nothing was checked: 259 rows were
read.

Package-wide, **54** lines name a gitignored tree; every one is an assertion *about* the trees'
unreadability, in `00_…md` §3, `01_…md`, or a chapter restating the rule. Zero require a reader to
follow a path into them.

### 4.2 `OUT-11` and `OUT-12` have no traceability row — and are not uncovered

This is the audit's one substantive coverage result, and it must be stated precisely, because the
naive reading is wrong.

`traceability/README.md:7` records the cause plainly: *"**This folder is empty of registers.** SUB-1
declared the shape and wrote none — it discharged no outcome's content."* `OUT-11` (stand-in
assumptions handed to NEU-896) and `OUT-12` (the C005 house style, standalone and cold-readable) are
**SUB-1's own outcomes**. Every other outcome was picked up by a sub-task that wrote a traceability
file for it; these two were not, because SUB-1 wrote none.

**Both are nevertheless substantively discharged**, and the audit says so:

- **`OUT-11`** — `93_stand-in-assumption-register.md` is **closed** with exactly five entries
  (`A-25` … `A-29`) covering four packages (NEU-891 ×2, NEU-892, NEU-893, NEU-894). Audited here
  against `OUT-11`'s verification clause: all five carry a package reference, a tolerance envelope,
  an invalidating outcome, a named re-validation trigger and `[unconfirmed]` status — **5/5, zero
  missing fields**. The clause's second half — *"a decision-level check that every decision resting
  on a stand-in names it in place"* — also passes: each of the five is cited outside the register, in
  **22, 9, 39, 26 and 21** files respectively. Not one is appendix-only. `OUT-11` passes its audit
  clause with no row to record it.
- **`OUT-12`** — its house-style and standalone halves are discharged by `00_…md` §3, the README and
  the package's shape. Its **citation-audit** clause is discharged by §5 of this chapter, and it
  **fails** — see §5.6.

So the finding is not *"two outcomes nobody covered."* It is: **two outcomes are discharged with no
traceability row, and the gate at `94_…md:29` reads the traceability set to establish that every one
of `OUT-1` … `OUT-12` is covered.** Read mechanically, that gate item fails on a package whose
content does not. Filed as **`F-S11-3`**, routed to **`SUB-1 (NEU-971)`** as the author of both the
outcomes and the empty folder, and to **`SUB-12 (NEU-986)`**, which is the only party that can
record how the gate's twelve-of-twelve item is answered without renumbering or rewriting a merged
sibling.

### 4.3 `OUT-3` and `OUT-5` carry two same-shaped cross-checks — **PASS**

Two different audits in this package have nearly the same shape, and crediting one for both would
silently leave an outcome unverified. They are:

| Outcome | Cross-check | Owner | Inventory it walks |
| --- | --- | --- | --- |
| `OUT-3` | The **state-inventory ↔ matrix** audit | SUB-13 (NEU-977) | `04_…md`'s 45 state categories `SC-S3-1` … `SC-S3-45` |
| `OUT-5` | The **resource-inventory ↔ matrix** cross-check | SUB-7 (NEU-980) | `11_…md` §9's sixteen-entry web-API resource inventory |

**They are named distinctly in every place both appear** — 8 locations, including
`09_authority-matrix-validation.md` §17, which spends a handoff row on saying so explicitly:
*"SUB-7's **resource**-inventory↔matrix cross-check under `OUT-5` is a **different audit over a
different inventory** than the state-inventory↔matrix audit SUB-13 already ran. Named distinctly here
so the two are never conflated."* `traceability/S13_…md` declares `OUT-3`/`OUT-5`/`OUT-9` and
`traceability/S7_…md` declares `OUT-5`; each names its own inventory.

**Verdict: PASS.** No chapter credits one cross-check for both outcomes. This audit re-checked it
rather than assuming it, because the assumption is exactly the near-miss the check exists to catch —
and §8.3 records that the *one row in the package that states the distinction most clearly* is also
the one carrying a mis-paired tracker id, so the notice would be delivered to the wrong sub-task by
any consumer routing on ids.

### 4.4 `F5.9` is undischarged, and this audit does not discharge it

`F5.9` — the authoring-time execution environment's build/reuse/adopt decision — is left **visibly
undischarged** by SUB-10, whose make-or-reuse set closed at four records. No sub-task owns it. The
traceability audit touches it (it is a make-or-reuse question inside `OUT-8`'s reach) and therefore
records it: **`F5.9` is undischarged at this cutoff, by design, and is for `SUB-12 (NEU-986)`'s
gate.** This sub-task does not discharge it, does not assign it an owner, and does not treat its
absence as a traceability gap — SUB-10 disclosed it rather than omitting it, which is the opposite
failure mode.

---

## 5. Audit B — citations

**The question.** Does every path this package cites resolve on the branch under review?
`00_…md` §2 states the rule and names the auditor: *"A path that does not resolve on the branch under
review is a defect, not a typo — `NEU-985 (SUB-11)` checks this mechanically."*

**The procedure.** Extract every backticked token that looks like a path from all 61 files; resolve
each **relative to the citing file's own directory**, not to the package root; for a bare
package-internal name, also try the package root; record the rest as unresolved; then classify each
unresolved citation by hand.

> **A note on the audit's own first attempt, because it changes how the numbers should be read.**
> The first pass resolved every relative path against the package root regardless of where the citing
> file sat, and reported **396** unresolvable citations. That figure was an artifact of the audit,
> not a property of the package: `decision-records/` and `traceability/` files legitimately write
> `../05_…md`. After correcting the resolver to use the citing file's directory the count fell to
> **172** — and the residue turned out to be two genuine, systematic defect classes rather than
> noise. The correction is recorded because a reader re-running this audit must resolve
> file-relatively or they will reproduce the 396 and conclude the package is broken.

### 5.1 The result

| Measure | Count |
| --- | --- |
| Path citations extracted | **1,420** |
| Resolving on the branch | **1,248** |
| Not resolving | **172** |
| — of which **by-design non-claims** (§5.4) | **11** |
| — of which **genuine defects** | **161** |
| Citations pointing past a file's end (line-number overrun) | **0** |
| Commit refs cited | **7** distinct, **7 resolve**, **0 dangling** |
| Upstream-package references | **98**, of which **30** carry no version or compilation date at the point of citation |
| `[unconfirmed]` markers present and legible | **yes**, package-wide |

### 5.2 The 161 genuine defects are one mechanism, in two directions

159 of the 161 are the **same error**: a relative path whose depth was computed against the package
root rather than against the citing file's own directory. It appears in two mirror-image forms.

| Class | Count | Shape | Citing files | Distinct targets |
| --- | --- | --- | --- | --- |
| **C1** — spurious `../` | **129** | A **package-root** file writes `../04_…md` for a package-root sibling. Resolves to `docs/research/04_…md`, which does not exist. Correct form is the bare name | `02_` ×47, `90_` ×37, `91_` ×24, `92_` ×19, `13_` ×2 | 21 |
| **C2** — one `../` short | **30** | A file in `decision-records/` or `traceability/` writes `../C009-…/…` for an **upstream package**. Resolves to a sibling of this package's root, which does not exist. Correct form needs `../../` | `traceability/S2_` ×11, `S3_` ×6, `S4_` ×1; `DR-C10-S2-1` ×4, `-S2-2` ×5, `-S2-3` ×3 | 11 |
| **C3** — bare upstream filename | **2** | `04_…md` cites `01_evidence-taxonomy.md` and `09_enforceable-quality-system.md` with no directory at all; both live in `../C009-course-content-quality/` | `04_` ×2 | 2 |

**Every one of the 159 is off by exactly one directory level**, and the two classes are off in
opposite directions — the root files add a level they do not need, the subfolder files omit one they
do. That is a single generating mechanism, and it is the reason this was published as a finding
rather than fixed: the mechanism is mechanically detectable and mechanically repairable in one pass,
and would have been invisible had the paths been quietly corrected.

**Owner tally** (attributed by file ownership, or for the shared registers by the nearest preceding
`### SUB-<n>` section heading):

| Owner | Count | | Owner | Count |
| --- | --- | --- | --- | --- |
| SUB-2 (NEU-972) | 43 | | SUB-7 (NEU-980) | 6 |
| SUB-6 (NEU-976) | 32 | | SUB-9 (NEU-983) | 5 |
| SUB-3 (NEU-973) | 23 | | SUB-14 (NEU-978) | 3 |
| SUB-13 (NEU-977) | 17 | | SUB-16 (NEU-979) | 3 |
| SUB-4 (NEU-974) | 14 | | SUB-10 (NEU-984) | 1 |
| SUB-5 (NEU-975) | 7 | | | |
| SUB-15 (NEU-982) | 7 | | **Total** | **161** |

**Twelve of the sixteen sub-tasks are represented.** A defect distributed across twelve independent
authors is a package property — a missing convention and a missing check — not twelve independent
slips, which is why `F-S11-1` routes the *class* to `SUB-12 (NEU-986)` for the erratum-or-convention
decision as well as naming each owner.

### 5.3 What the defect actually costs a reader

Both classes degrade gracefully for a reader who is *inside* the package: `../04_state-category-inventory.md`
is obviously the sibling `04_state-category-inventory.md`, and a human recovers in one step.

The cost lands on the two consumers `OUT-12` was written for: **a link checker**, which reports 161
broken references and cannot distinguish them from real dangling citations; and **the cold reader
working only from the published package**, for whom C2 is materially worse than C1 — the target of a
C2 citation is an *upstream package* the reader may not know exists, so a failed resolution reads as
"this evidence is missing" rather than "this path is one level short."

### 5.4 The 11 by-design non-claims, itemised

An audit that counted these as defects would be wrong, so each is named and its reason given.

| Location | Cited token | Why it is not a defect |
| --- | --- | --- |
| `94_…md:17` | `95_completeness.md`, `traceability/gate.md` | Names two filenames that **must not exist** — locations a sibling might otherwise invent for the gate |
| `decision-records/README.md:32` | `DR-C10-S<n>-<k>_<slug>.md`, `DR-C10-S7-1_repository-topology.md` | Naming-convention template and an illustrative example |
| `traceability/README.md:43` | `S4_isolation-invariant-coverage.md`, `S11_outcome-coverage-audit.md` | Illustrative naming examples. **The second resolves as of this chapter** — it is the file this sub-task publishes |
| `14_…md:518`, `90_…md:504` | `03_review-log.md` | Both name the bare form **in order to say it must not be resolved against this folder** |
| `92_…md:288` | `src/index.ts`, `index.js` | The entry point of `SPK-S9-1`'s gitignored stand-in core, and Node's implied fallback in the abstract — neither is this repository's `src/` |
| `02_…md:687`, `:698` | `01_charter.md` | Names the gitignored charter of record; the figures it carries are **restated in full on the same line**, so no reader must open it |

**This chapter and `F-S11-1`/`F-S11-2` add a twelfth case of the same kind**, recorded here so the
next run of this audit is self-documenting rather than reporting its own auditor. `16_…md` §5.2,
§5.4 and `02_…md`'s `### SUB-11` section quote `../04_state-category-inventory.md`,
`01_evidence-taxonomy.md`, `09_enforceable-quality-system.md`, `03_review-log.md`, `src/index.ts`,
`95_completeness.md`, `traceability/gate.md` and the two `DR-C10-S…` templates **in order to report
them as defective or as non-claims**. Under the rule `14_…md:518` and `90_…md:504` already set —
naming a bare form in order to say it must not be resolved is not a violation — none is a citation.
**7 such quotations in `16_…md` and 5 in `02_…md`'s `### SUB-11` section.** Likewise §8's ten
label↔id quotations are corrective by construction, and §8.2's own classification is what
distinguishes them.

### 5.5 Superseded figures published without a forward pointer

`01_outcome-register.md` carries the charter's original figures in two success measures:

- **`OUT-6`** (`:77`) — *"each of the **45** tools and 3 prompts"*, and `OUT-6`'s body's "42 gated".
  The frozen figure is **46 / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`). **The charter's
  count is a miscount, not staleness** — the divergence is one tool that was always there.
- **`OUT-7`** (`:85`) — *"165 TypeScript source files, ~25,200 lines, 197 test files"*. The frozen
  figures are **169 / 26,816 / 202** (SUB-9 / NEU-983's re-measurement).

**11 occurrences** across the file. This is **not** a correction to make here — the register is
merged and `00_…md` §3 permits SUB-1 exactly two restatement edits, both already made and both
recorded. It is a **citation-audit finding**: a reader who resolves `OUT-6`'s success measure against
`src/` today finds 46 tools and concludes the outcome is unmet, with nothing in `01_…md` pointing to
`F-S8-1` where the discrepancy is resolved. Filed as **`F-S11-5`**, routed to **`SUB-1 (NEU-971)`**
and **`SUB-12 (NEU-986)`**.

**Any chapter still asserting 45 / 42 as a live figure would be a citation-audit finding routed to
its author.** Checked: **none does.** Every live use of the surface figure in `11_`, `12_`, `13_` and
`15_` writes 46 / 43 / 3 / 49 and cites `F-S8-1`. The only 45/42 occurrences are `01_…md`'s
restatement of the charter, and `02_…md`'s finding that records the miscount.

### 5.6 The matrix revision marker — **PASS**

`08_…md` + `10_…md` at revision **`post-validation` (SUB-16 / NEU-979)** is the marker every consumer
must cite; citing SUB-13's pre-validation marker is a finding.

**19 revision-marker occurrences** across the package. **18 cite `post-validation`.** The single
`pre-validation` occurrence is `10_republished-authority-matrix.md:69` — a row in the chapter's own
**revision-history table** (*"Assigned | SUB-13 (NEU-977) | Applied SUB-6's rule to 45 categories.
Revision `pre-validation`."*), which records the superseded revision as history rather than citing it
as current. **Correct usage. Zero violations.**

### 5.7 Upstream references, and short-form filenames

- **98 upstream-package references**; **30** carry no version or compilation date within two lines
  of the citation. This is **mitigated but not fully discharged**: `00_…md` §7 publishes the
  provenance table (C009 compiled 2026-08-10, `C005-dp-map-package` v1.0.0, and the rest), so a
  reader can date any upstream claim in one hop. `OUT-12`'s clause asks that *"every upstream claim
  cites that package's version or compilation date"*; a package-level table satisfies the intent and
  not the letter. **Reported as a measured observation, not filed as a finding** — the information is
  present and reachable, and filing it would be filing against a convention the package deliberately
  adopted.
- **218 bare-filename short forms** (e.g. `pnpm-workspace.yaml`, `schema.ts`,
  `session-management-tools.ts`), of which **52** have no full path elsewhere in the same file.
  Every one names a file that **exists in the tracked tree**. Recorded as a discipline observation,
  **not** a finding: the citations resolve, and the house style admits a short form once a full path
  is established.

---

## 6. Audit C — the spike register and the quarantine

**The question, in two halves.** (a) Does every spike record carry all thirteen template fields, is
any expired, and does every spike cited by id name a record that exists? (b) Did any spike artifact
escape quarantine into the tracked tree?

### 6.1 Spike records — **PASS**

| Measure | Count | Expected | Verdict |
| --- | --- | --- | --- |
| Spike records | **4** — `SPK-S2-1`, `SPK-S6-1`, `SPK-S9-1`, `SPK-S15-1` | — | — |
| Records carrying all 13 template fields | **4 / 4** | 4 / 4 | **PASS** |
| Records expired at 2026-08-22 | **0** (expiries 2027-04-30, 2027-08-21) | 0 | **PASS** |
| Spike citations by id outside the register | **136** | — | — |
| — citing a **nonexistent** record | **0** | 0 | **PASS** |
| Caps with a named owner | **22 / 22** | 22 / 22 | **PASS** |

**One near-miss, recorded because it is the exact false-positive class this audit was warned about.**
A first pass flagged `SPK-S2-3` as a spike citation with no matching record. Inspection shows it is
a **format example** in `00_method-and-provenance.md:50` §2.4, illustrating how a spike id is
written — not a citation of a spike. Excluded. Had it been reported, the audit would have filed a
finding against SUB-1 for a defect that does not exist.

### 6.2 Spikes versus caps — the zero is the correct answer

**Package-wide `SPK-S10-*` count: 0. Package-wide `OI-S10-*` count: 0.** Both are the **expected and
correct** state, not an omission. SUB-10 disclosed **four** spike candidates, withdrew **three**
under the read test — the question was settled by reading rather than by experiment — and **capped**
the fourth. A cap is what the register's own rules require when no bounded experiment settles a
question and no observable event closes it (`91_…md`, `CAP-S5-1`'s reasoning, applied identically).

**An audit reporting a missing spike record for a withdrawn candidate would be reporting the read
test working as designed as though it were a failure.** No such finding is filed.

**Caps still open and not lifted at this cutoff:** `CAP-S4-1`, `CAP-S6-1`, `CAP-S15-1`. This audit
lifts none and adds no sighting to any. In particular, **this sub-task does not file a further
sighting of the deletion-owner gap** (`F-S3-3` → `CAP-S3-3` → `CAP-S4-1`, at its seventh sighting in
`91_…md:297`): the four audits do not reach it, and following SUB-5's and SUB-6's precedent, the
register admits second sightings as signal without obliging one per direction.

### 6.3 Quarantine — **PASS, zero escapes**

`92_…md` requires every spike to run on a **quarantine path** and leave nothing behind in the tracked
tree. Checked against `git ls-files` at cutoff `ecf88c5`:

| Measure | Count |
| --- | --- |
| Tracked files | **817** |
| `src/` files | **169** |
| Spike-shaped tracked paths in `src/` | **0** |
| Spike-shaped tracked paths anywhere outside a research package | **0** |
| Regex matches over the whole tracked tree | **2**, both accounted for |

The two matches are `docs/research/C010-system-and-repository-architecture/92_spike-register.md` —
the register itself — and `docs/research/C009-course-content-quality/dry-run/02_template-fabrication-probe.md`,
which belongs to **NEU-890** and is that package's own published artifact, not a C010 spike residue.
Neither is an escape. **Zero spike artifacts reached the tracked tree.**

### 6.4 Distribution-line leakage — **PASS, zero**

The public reusable core must not carry course-application identifiers (`12_…md` §5). Sweeping
`src/` for `DP` returns **exactly 2 occurrences**, both Dynamic Programming as subject matter:

- `src/domain/types/teaching.ts:285` — *"Per-criterion booleans for the DP grading rubric"*
- `src/domain/algorithms/grade-mapper.ts:10` — *"Rubric (illustrative DP rubric per EXP-03 `ECS-3`)"*

`F-S8-4` records this already; it is confirmed independently here rather than re-litigated. **Zero
leakage hits.** A grep-based audit reporting these two would be reporting a false positive, and this
one does not.

---

## 7. Audit D — the no-in-app-judge sweep

**The question.** Does any chapter in this package **claim** a component this product does not have —
an in-app judge, a sandbox for learner code, an exercise runner on the learner path, captured
keystrokes, or keystroke- or timing-based authorship inference?

**The terms** are SUB-2's, published at `03_…md` §2.4 with their disposition rule, which this audit
applies verbatim: *"A hit is a **finding routed to the chapter that introduced the requirement** … A
hit is **not** automatically a defect: a chapter may legitimately use the word *sandbox* while
**denying** that one exists."*

### 7.1 The result

| Measure | Count |
| --- | --- |
| Files swept | **61 / 61** |
| Files containing at least one term occurrence | **29** |
| Term occurrences examined | **120** |
| — *runner* | 81 |
| — *sandbox* | 19 |
| — *in-app judge* | 7 |
| — *captured keystrokes* | 7 |
| — *keystroke- or timing-based authorship inference* | 6 |
| **Violations — a term used to CLAIM the thing exists** | **0** |

### 7.2 Every one of the 120, dispositioned

| Disposition | Count | What it is |
| --- | --- | --- |
| **Denial or rule statement** | **61** | The chapter uses the term while **denying** the component exists, quoting NEU-890's finding that the learner solves on the source site, or stating the sweep rule itself |
| **Matched exception — the kept component** | **34** | Names SUB-2's kept `authoring-time gate runner` (`CMP-S4-15`), which executes **creator**-authored approaches at **authoring** time only and never anything a learner submits (`03_…md` §3.5). Every one of the 34 is a legitimate reference to a component the package deliberately retains |
| **Out-of-system tooling** | **17** | CI test runners, job runners, coverage runners, and the absence of a scheduler — development and operations tooling, no learner-path claim (e.g. `14_…md:381`, `:383` on topology) |
| **Definitional** | **4** | `03_…md:78`–`:81` — the five-term table itself, defining what a hit would be |
| **Lexical false positive** | **4** | *"runner-up"* in a criteria comparison — `07_…md:371`, `:376`, `DR-C10-S3-1:100`, `DR-C10-S6-1:137` |

**The matched exceptions named:** the 34 are the `authoring-time gate runner` (`CMP-S4-15`) as
specified in `03_…md` §3.5 and glossed in `docs/GLOSSARY.md`. This is the **one** component whose
name matches a sweep term and whose existence the package affirms; it is affirmed with the
qualification that makes it not a violation — *"**Never** executes anything a learner submits; there
is no in-app judge, sandbox or exercise runner in this product."*

**Verdict: 0 hits, and the zero is genuine.** 61 files were read, 120 occurrences were individually
dispositioned, and the two dispositions that could have concealed a violation — the 34 kept-component
references and the 17 tooling references — are enumerated above by class with locations, so a reader
can re-check any of them. This is the shape of a run check rather than an unrun one.

---

## 8. Sub-audit — label↔id pairing across the package

Two prior findings record that this package pairs sub-task labels with the wrong tracker ids:
`F-S3-2` (13 places, SUB-2's) and `F-S16-1` (24 places, SUB-14's). Both hand the **mechanical
package-wide check** to this sub-task. It was run.

### 8.1 The tracker truth map, restated in full

Restated here rather than cited, because the map lives in the tracker and the standalone rule
forbids a published file requiring an unreachable source. The charter's children are **deliberately
non-sequential**, which is precisely why the drift is plausible-looking:

| | | | | | | | |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SUB-1 → **NEU-971** | SUB-2 → **NEU-972** | SUB-3 → **NEU-973** | SUB-4 → **NEU-974** | SUB-5 → **NEU-975** | SUB-6 → **NEU-976** | SUB-7 → **NEU-980** | SUB-8 → **NEU-981** |
| SUB-9 → **NEU-983** | SUB-10 → **NEU-984** | SUB-11 → **NEU-985** | SUB-12 → **NEU-986** | SUB-13 → **NEU-977** | SUB-14 → **NEU-978** | SUB-15 → **NEU-982** | SUB-16 → **NEU-979** |

**Every label↔id pair written in this chapter, in `traceability/S11_outcome-coverage-audit.md`, and
in this sub-task's register appends was checked against this map before publication.**

### 8.2 The result

843 pairs were extracted and checked. **61 occurrences do not match the map** — but a raw mismatch
count is not a drift count, and reporting 61 as the drift figure would have been wrong three times
over.

| Class | Count | What it is |
| --- | --- | --- |
| **Corrective quotation** | **19** | A file quoting the wrong pairing **in order to name it as wrong**. `F-S16-1`'s own entry (`02_…md:503`–`:504`), `10_…md` §5.7's citation of the wrong pairings (which states outright that they appear "*only* inside §5.7's citation of…"), `08_…md:1432`, `90_…md:269`, `traceability/S16_…md:46`. **Correct usage** |
| **Correct cross-charter reference** | **3** | *"**NEU-890's** SUB-10 (NEU-966)"* — a child of a **different** charter, explicitly qualified. `03_…md:255`, `DR-C10-S2-3:30`, `:62`. **Correct usage** |
| **Genuine mis-pairing** | **38** | An id used to **attribute** work, naming the wrong sub-task |
| **Ambiguity, not error** | **1** | `03_…md:189` writes *"consumed from SUB-10 (NEU-966)"* **without** the `NEU-890's` qualifier, in a chapter that 63 lines later correctly writes `SUB-10 (NEU-984)` for **this** charter's SUB-10. Not a wrong id — an unqualified one |

**Of the 38 genuine mis-pairings, 37 are already filed:**

- **13** are `F-S3-2`'s `SUB-13 (NEU-987)`. This audit reproduces `F-S3-2` **exactly — location for
  location**, all 13, across the same 6 files. SUB-13 is NEU-977; NEU-987 is not a child of this
  charter at all.
- **24** are `F-S16-1`'s three families: `SUB-16 (NEU-980)` ×16, `NEU-983 (SUB-11)` / `SUB-11
  (NEU-983)` ×7, `SUB-12 (NEU-985)` ×1, across the same 5 files. Reproduced exactly.

That both prior counts reproduce to the instance is itself a result: it means `F-S3-2` and `F-S16-1`
counted correctly, and that the mechanical check they each asked for confirms rather than revises
them.

### 8.3 The thirty-eighth — `F-S16-1` undercounts by one, and the missed one is the worst-placed

`09_authority-matrix-validation.md:1342`, in SUB-14's §17 handoff table, reads:

> `| **SUB-7 (NEU-982)** | Nothing from this chapter directly — SUB-7's **resource**-inventory↔matrix
> cross-check under OUT-5 is a **different audit over a different inventory** … Named distinctly here
> so the two are never conflated |`

**SUB-7 is NEU-980. NEU-982 is SUB-15.** This is a **fourth** mis-paired family, in the same table
and the same file as the three `F-S16-1` records, and `F-S16-1` does not name it — its count of
"24 places across 5 merged files" is 25, and its three families are four.

**The consequence is the sharpest of the whole class**, which is why it is filed separately rather
than folded in. This is the one row in the package that states the `OUT-3`/`OUT-5` cross-check
distinction most explicitly — the notice written *"so the two are never conflated."* A consumer
routing by tracker id delivers that notice to **SUB-15 (NEU-982)**, whose chapter is the
architecture-material rule and the web tier, and **SUB-7 (NEU-980)**, the party whose `OUT-5`
cross-check the notice is about, never receives it. A warning against conflating two audits,
mis-delivered by the same defect class the warning sits beside.

Filed as **`F-S11-4`**, routed to **`SUB-14 (NEU-978)`** as author, **`SUB-16 (NEU-979)`** whose
`F-S16-1` undercounts, **`SUB-7 (NEU-980)`** as the actual addressee of the row, and
**`SUB-12 (NEU-986)`** at the gate.

### 8.4 Why this is now a three-sighting class

`F-S3-2` called it a first sighting; `F-S16-1` called itself the second and noted that *"a class with
two independent sightings and no mechanical check is a package property, not an author's slip."*
The mechanical check has now been run. It confirms both sightings exactly, adds a fourth family
neither recorded, and finds the class confined to **two authors** (SUB-2 and SUB-14) across **10
files** — it did **not** spread to the other fourteen sub-tasks, all of which pair correctly. That is
the useful shape of the result: bounded, attributable, and mechanically detectable in one pass.

**Not repaired here**, for the reasons in §1, and — recorded explicitly because it is the specific
trap this sub-task was cautioned about — **the drift did not mis-route any finding in this chapter.**
`NEU-983 (SUB-11)` appears 7 times in merged files and names *this* sub-task; SUB-11 is NEU-985 and
NEU-983 is SUB-9. Every routing in §11 was resolved against §8.1's map, not against the label written
in the file that raised the item.

---

## 9. The glossary check

`00_…md` §4.1 states the rule: *"This package adds no row to `docs/GLOSSARY.md`, and that is a
decision rather than an omission"* — for **governance** vocabulary. **Genuine product-domain terms
do get rows.** The package added **17**, under `## Architecture components (C010 system & repository
architecture)` at `docs/GLOSSARY.md:194`. All 17 verified present, each with a definition, an owning
module and a defining file.

### 9.1 Four coined product-domain terms with no row — routed

| Term | Where coined | Usage | Routed to |
| --- | --- | --- | --- |
| `state category` | `04_state-category-inventory.md` | 45 ids `SC-S3-1` … `SC-S3-45`; the package's most-used domain noun. **Cross-referenced from the existing `isolation invariant` row**, so the glossary already points at a term it does not define | **`SUB-3 (NEU-973)`** |
| `read-projection` | `11_…md` §9 | 10 files | **`SUB-7 (NEU-980)`** |
| `write-intent` | `11_…md` §9 | 10 files | **`SUB-7 (NEU-980)`** |
| `split-visibility workspace` | `14_…md` — the **selected** topology `T2` | 8 files | **`SUB-9 (NEU-983)`** |

Filed as **`F-S11-6`**. Each is a project-local coinage a reader will meet before its definition, and
`CLAUDE.md`'s standing rule is that introducing a domain term adds its glossary row in the same
change.

### 9.2 Considered and deliberately **not** routed

Publishing this list is part of the check: it distinguishes terms that were examined and correctly
excluded from terms nobody looked at.

- `architecture-material`, `tolerance envelope`, `open item`, `cap`, `spike`, `stand-in assumption`,
  `package-completeness gate`, `invalidating outcome` — **governance vocabulary**, excluded by
  `00_…md` §4.1 and by the glossary section's own preamble, which names four of them explicitly.
- `trust boundary`, `process boundary`, `negative boundary`, `make-or-reuse` — charter and outcome
  vocabulary the package **consumes** rather than coins.
- `authority`, `target state` — these **do** have rows, written with qualifiers
  (`` `authority` (of a state category) ``, `` `target state` (of an isolation evaluation) ``). A
  naive exact-match check reports them missing; they are not.

---

## 10. What this audit did not check, and what it could not determine

Stated plainly, because an audit's boundary is part of its result.

1. **The cold read.** `OUT-1` and `OUT-12` each require an **independent cold-read by an
   implementation agent working only from the published package**. This sub-task cannot perform it:
   it read the gitignored brief, and `94_…md:42` requires the reader be independent of the package.
   `05_…md:632` and `traceability/S4_…md:21` both note the gap; **neither registers it**. Filed here
   as **`CAP-S11-1`**, owner `SUB-12 (NEU-986)`.
2. **Correctness of any decision.** No boundary, authority, topology or classification was reviewed
   for whether it is *right*. Mechanical questions only.
3. **`F5.9`.** Left undischarged, per §4.4. Not discharged here.
4. **`F-S10-6`.** The upstream authority conflict routed to SUB-6 — `DR-C10-S6-1`'s "exclusive
   writer of all 45 categories" against the republished matrix assigning `SC-S3-33`/`-34` to
   `CMP-S4-17` — is an **open routed finding**, not a contradiction this audit resolves. Recorded as
   open; untouched.
5. **`OI-S9-4` / `F5.8`.** Answered **No**, with `F-S10-1` recording that SUB-9's structural premise
   is contradicted by `cd-prod.yml:62`–`:65`, so the No now rests on the clone being private.
   Consumed as published; not re-adjudicated.
6. **NEU-983's open PARTIAL.** SUB-9 landed with one unidentified PARTIAL. A chapter that landed with
   open findings is audited **as published**; its open findings go to SUB-12's open-items register
   and do not block anything here.
7. **Could not determine:** whether the 30 undated upstream references (§5.7) were intended to rely
   on `00_…md` §7's provenance table or were simply undated. The distinction changes whether it is a
   convention or an omission, and nothing in the package states which. Reported as an observation
   rather than filed against an author.

---

## 11. Findings and caps published by this sub-task

Appended to `02_findings-register.md` under a new `### SUB-11` section and to
`91_caps-and-incomplete-scope.md` under `### SUB-11`, **append-only, with zero deletions and zero
reflows of another sub-task's entries.**

| Id | One line | Routed to (verified against §8.1) |
| --- | --- | --- |
| **`F-S11-1`** | 159 citations wrong by exactly one directory level, in two opposite directions, across 12 sub-tasks — one mechanism, mechanically detectable | 12 named owners (§5.2 tally) · **`SUB-12 (NEU-986)`** for the erratum-or-convention decision |
| **`F-S11-2`** | 2 upstream filenames cited bare, with no directory, in `04_…md` | **`SUB-3 (NEU-973)`** |
| **`F-S11-3`** | `OUT-11` and `OUT-12` have no traceability row; both are substantively discharged, but the gate reads the set | **`SUB-1 (NEU-971)`** · **`SUB-12 (NEU-986)`** |
| **`F-S11-4`** | `F-S16-1` undercounts by one: `SUB-7 (NEU-982)` at `09_…md:1342` is a fourth mis-paired family, on the row carrying the `OUT-3`/`OUT-5` distinctness notice | **`SUB-14 (NEU-978)`** · **`SUB-16 (NEU-979)`** · **`SUB-7 (NEU-980)`** · **`SUB-12 (NEU-986)`** |
| **`F-S11-5`** | `01_…md` publishes the charter's superseded 45/42 and 165/25,200/197 in 11 places with no pointer to `F-S8-1` or SUB-9's re-measurement | **`SUB-1 (NEU-971)`** · **`SUB-12 (NEU-986)`** |
| **`F-S11-6`** | Four coined product-domain terms have no `docs/GLOSSARY.md` row; one of them is cross-referenced from an existing row | **`SUB-3 (NEU-973)`** · **`SUB-7 (NEU-980)`** ×2 · **`SUB-9 (NEU-983)`** |
| **`F-S11-7`** | `03_…md:189` writes `SUB-10 (NEU-966)` unqualified in a chapter that also writes `SUB-10 (NEU-984)` for this charter's SUB-10 — ambiguity, not a wrong id | **`SUB-2 (NEU-972)`** |
| **`CAP-S11-1`** | The independent cold read `OUT-1` and `OUT-12` both require is performed by no sub-task, and this one is disqualified from performing it | **`SUB-12 (NEU-986)`** |

**Id classes this sub-task publishes none of, and why:**

- **`OI-S11-*` — none.** An open item requires an **observable resolving event** within the package's
  reach (`90_…md`'s own rule). Every gap found is either a defect in a **merged** file, which the
  append-only discipline makes a finding rather than an item, or has no resolving event this package
  can observe, which makes it a cap. Nothing found sits in between.
- **`SPK-S11-*` — none.** A spike answers a question reading cannot settle. All four audits are
  reading. No question arose that a bounded experiment would have settled.
- **`DR-C10-S11-*` — none.** **An audit reports; it does not decide.** The classification rules this
  audit applied — what counts as a citation, what counts as a by-design non-claim (§5.4), what
  separates a corrective quotation from genuine drift (§8.2) — are *method*, published in this
  chapter so every count is reproducible. Recording them as decision records would give this sub-task
  a decision it does not have.

**Register append discipline:** entries added **7** findings + **1** cap; lines deleted from any
register: **0**; entries of another sub-task reflowed, renumbered or amended: **0**.
`93_stand-in-assumption-register.md` (CLOSED) and `94_package-completeness-gate.md` (SUB-12's):
**untouched**.

---

## 12. Handoff

| Consumer | What it takes from here | Where |
| --- | --- | --- |
| **`SUB-12 (NEU-986)`** | The consolidated routed list of §11; the traceability gate item that fails on `OUT-11`/`OUT-12` while the outcomes themselves pass; `CAP-S11-1`; and the erratum-or-convention decision now owed on **two** mechanically-detectable classes — the 159 path defects and the 38 id mis-pairings | §4.2, §5.2, §8, §11 |
| **`SUB-1 (NEU-971)`** | `F-S11-3` and `F-S11-5` | §4.2, §5.5 |
| **`SUB-2 (NEU-972)`** | 43 path defects; `F-S11-7`; and confirmation that the sweep it specified returns **0** violations over 120 occurrences | §5.2, §7, §8.2 |
| **`SUB-3 (NEU-973)`** | 23 path defects; `F-S11-2`; the `state category` glossary row | §5.2, §9.1 |
| **`SUB-7 (NEU-980)`** | 6 path defects; the `read-projection` / `write-intent` rows; and — by name rather than by the id in the file — the `OUT-5` distinctness notice at `09_…md:1342` | §5.2, §8.3, §9.1 |
| **`SUB-9 (NEU-983)`** | 5 path defects; the `split-visibility workspace` glossary row | §5.2, §9.1 |
| **`SUB-14 (NEU-978)`**, **`SUB-16 (NEU-979)`** | `F-S11-4`, and the exact reproduction of `F-S3-2` and `F-S16-1`'s counts | §8.2, §8.3 |
| **SUB-4, SUB-5, SUB-6, SUB-10, SUB-13, SUB-15** | Their path-defect counts from §5.2's tally | §5.2 |
| **NEU-896** | Four audits with published surfaces and counts, so a convergence pass can re-run any of them and compare, rather than re-deriving them | §3 |

**The four audits' one-line verdicts:** traceability **PARTIAL** (2 outcomes without a row, 0 rows
resolving outside `docs/research/`, 0 chapters unmatched); citations **FAIL** (161 genuine defects of
1,420, one mechanism); spike register and quarantine **PASS** (4/4 records complete, 0 expired, 0
dangling citations, 0 escapes, 0 leakage); the no-in-app-judge sweep **PASS** (61 files, 120
occurrences, 0 violations, 34 matched exceptions named).
