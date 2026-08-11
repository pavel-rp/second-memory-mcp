# 92 — Package Completeness Gate

**Package:** C009 course content quality · **Charter:** C009 (umbrella NEU-890) · **Stub created:** 2026-08-10 by **NEU-957 (SUB-1)** · **Gate run:** 2026-08-11 by **NEU-969 (SUB-12)**, the final packaging sub-task · **Commit base:** `4f89f2f` · **Status:** **this file SETS no status.** Status lives in a ledger
**Model:** claude-opus-5[1m]

---

## 0. The result, stated before the evidence

| | Verdict |
| --- | --- |
| **The `C005-dp-map-package/02_authoring-requirements.md` §8 13-item acceptance checklist** | **PASS — 13 PASS · 0 FAIL · 0 UNVERIFIABLE.** Four of the thirteen pass **vacuously** and are labelled so in §8. |
| **This package-completeness gate, over its own eight declared areas** | **FAIL — 6 PASS · 2 FAIL.** |

**The two failures, named up front:**

1. **Register integrity — `11_package-end-to-end-proof-and-exemplars.md` §10.2 publishes a mechanism roll-up that contradicts its own §10.1 rows.** This gate's independent re-derivation returns `deterministic` **15** · `schema` **4**; §10.2 publishes `deterministic` **14** · `schema` **5**. Filed at `OI-S13-1` by SUB-13 and **confirmed here by a second, independent parse**. §9.2.
2. **Evidence discipline — this gate run does not satisfy the independence condition that nine caps depend on.** `CAP-S1-4`, `CAP-S2-5`, `CAP-S3-7`, `CAP-S4-6`, `CAP-S5-5`, `CAP-S6-4`, `CAP-S7-5`, `CAP-S10-5` and `CAP-S11-2` each name this gate run as their closing occasion **under the condition that an independent reader re-runs the checks**. This gate carries `**Model:** claude-opus-5[1m]` — the same model id as every document it audits — so the package's own contamination check `C-3` fails for it exactly as it fails for the AI correctness review (`CAP-S9-4`, `OI-S9-14`). **The gate does not close any of the nine.** §3.2.

**A third material finding is not a gate failure but is the reason this file is worth reading:** `OI-S11-1` resolves **against** its author's provisional position — the charter's seven observable elements and `11_` §2.3's `E1`–`E7` **are not the same list** (§9.1).

**A gate that passes because it is last is worthless.** This one is last, and it does not pass.

---

## 1. File-set and layout completeness — **PASS**

**Method:** directory read of `docs/research/C009-course-content-quality/` recursive; **38 markdown files**.

| Check | Result |
| --- | --- |
| Package directory name is still the exact string twelve siblings read off `origin/develop` | **PASS** — `docs/research/C009-course-content-quality/` |
| Every file sits in the `00`–`89` per-sub-task range or the reserved `90`–`99` package-level range | **PASS** |
| Nothing squatting in the reserved `90`–`99` range | **PASS** — exactly `90_`, `91_`, `92_`; `93`–`99` free |
| No sub-task's file renumbered or renamed by another | **PASS** — every topic number is claimed by exactly one sub-task |
| Every charter outcome allocated to C009 has a landed topic document with a named owning sub-task | **PASS** — `00_`/`01_` SUB-1 · `02_` SUB-2 · `03_` SUB-3 · `04_` SUB-4 · `05_` SUB-5 · `06_` SUB-6 · `07_` SUB-7 · `08_` SUB-8 · `09_` SUB-9 · `10_` SUB-10 · `11_` SUB-11 · `13_` SUB-13 |

**`12_` is unallocated, and that is this sub-task's own choice, not a hole.** SUB-12's free topic number is deliberately
not used: this sub-task's output is package-level and belongs in the `90`–`99` range. Recorded so a later reader does not
read `12_`'s absence as a missing deliverable. Twelve topic numbers, twelve topic documents, thirteen sub-tasks — the
thirteenth wrote here.

**Supporting folders present:** `adjudication/`, `decision-records/`, `traceability/`, `dry-run/`, `README.md`.

---

## 2. House-form conformance — **PASS**, with four recorded exceptions

| Check | Result |
| --- | --- |
| Every file carries a `**Model:** <id>` attribution line (constitution Article 4) | **PASS — 38 of 38.** Zero missing. |
| Distinct model ids across the package | **One** — `claude-opus-5[1m]`. The single exception, `dry-run/02_template-fabrication-probe.md`, additionally records `**Probe subject model:** claude-sonnet (cold agent, no prior context)`, which is the probe's *subject*, not its author. |
| Every document carries a house header with a status that **defers** rather than decides | **PASS — 34 of 38.** |

**The four exceptions:** `adjudication/README.md`, `decision-records/README.md`, `dry-run/README.md` and
`traceability/README.md` carry no `**Status:**` field in their header. Each is a **folder index**, not a topic document,
and none asserts a status — so none of them *sets* a status outside a ledger, which is the obligation that matters.
**Recorded as a house-form nonconformance rather than waved through**, and filed at `OI-S12-1`.

---

## 3. Evidence discipline — **FAIL**

### 3.1 Class 7 — **PASS**

> **No class-7 `[future-real-user]` claim appears anywhere.** Class 7 does not exist for this package, and this gate
> treats a single one as a failure rather than a note.

**Result: zero class-7 claims.** The literal token `[future-real-user]` occurs **25 times across 20 files**, and **every
occurrence is prohibitive or definitional** — the taxonomy's own statement that the class does not exist, or a rule
forbidding a lower class from being laundered into it (`13_` §6: *"under NEU-887's rule 3 it may never be relabelled or
summarised as class 7"*). **No claim in the package is assigned class 7.**

**Stated limitation:** that determination is a **reading judgement over 25 occurrences**, not a lexical result. A lexical
scan can find the token; only a reader can tell a prohibition from a claim. Recorded rather than presented as mechanical.

### 3.2 Independence — **FAIL**

**Nine caps name this gate run as their closing occasion**, each under the condition
*"an **independent** reader re-runs the checks and reviews the judgment calls"*:

`CAP-S1-4` · `CAP-S2-5` · `CAP-S3-7` · `CAP-S4-6` · `CAP-S5-5` · `CAP-S6-4` · `CAP-S7-5` · `CAP-S10-5` · `CAP-S11-2`

**This gate is not an independent reader.** Every document in this package carries `**Model:** claude-opus-5[1m]`; so
does this file. The package's own contamination check `C-3` — *`reviewer_identity.model ≠ author_identity.model`* — is
the test, and it **fails** here on exactly the ground it fails for the AI correctness review (`CAP-S9-4`, `OI-S9-14`).

**Therefore this gate closes none of the nine.** Closing them would be the precise failure the package spends thirteen
sub-tasks refusing: presenting a same-model re-read as an independent confirmation. **All nine remain open**, and their
closing occasion is now **a re-run by a different reader**, not "the completeness gate", because the completeness gate
has run and could not discharge the condition. Recorded at `OI-S12-2`.

### 3.3 The package's evidence ceiling — recorded, not scored

Class 3 `[dogfooding]` sits at **n = 1** (`13_` §6, `PROTO-2`, a proxy signal). **Classes 4, 5 and 6 are absent
package-wide.** `CAP-S8-1`'s *"zero class-3 evidence"* is scoped to **SUB-8's creator-review loop**, not to the package,
and this gate does not widen it.

---

## 4. Status discipline — **PASS**, vacuously, and the vacuity is the finding

| Check | Result |
| --- | --- |
| No status is set outside a ledger | **PASS** — every topic document defers in its header; both registers state *"this file SETS no status"* |
| No producing task has promoted its own artifact to `settled` (`A4`) | **PASS** — no promotion occurred anywhere |
| Every ledger interaction was a **union**, never a replacement | **PASS** — exactly one interaction was made, and it is a union |
| Every challenge filed against another package's ledger is resolved there or carried here with a named owner | **PASS** — `CH-F5-1` is carried at `OI-S1-13` with owner NEU-932 |

**The one ledger interaction, verified at source.** `CH-F5-1` was appended to
`../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md` §6 as a **new row**, with `D-F5` left
**settled** and unchanged in §2, and the appended section stating in its own words:
*"§1–§5 above are unchanged — no existing decision, marker, conflict or self-check row is edited, renamed, reordered or
removed by it."* **Confirmed by reading the merged foundations ledger, not by reading C009's claim about it.**

**The vacuity, stated plainly.** `adjudication/` in this package contains **`README.md` and nothing else** — **no ledger
file was ever created**. Every one of the 38 documents defers its status to a folder that holds no ledger. Nothing
*violates* the discipline, because nothing flipped a status at all; but **the package ships with no local status of
record**, and "no status was set outside a ledger" is true here only because no status was set. Recorded at `OI-S12-3`;
this gate does not create the ledger, because creating one and populating it would be this producing task promoting
artifacts it did not author.

---

## 5. Register integrity — **FAIL**

### 5.1 Structural integrity — **PASS**

**Method:** `node -e` parse of both registers, resolving each `#### \`<id>\`` heading (expanding inclusive runs) and each
entry row, then diffing the defined set against every id cited anywhere in the package.

| Check | `90_` open items | `91_` caps |
| --- | --: | --: |
| `### SUB-<n>` sections | **12** | **12** |
| Entries defined | **103** | **63** |
| Distinct ids cited package-wide | **103** | **63** |
| **Dangling references** (cited, never defined) | **0** | **0** |
| **Orphans** (defined, never cited) | **0** | **0** |
| Cross-section id collisions | **0** | **0** |
| Numbering gaps within any sub-task's run | **0** | **0** |
| Entries lost to a merge | **0** — every section is present and every run is dense |
| Duplicate entries surviving from the keep-both-sides convention | **0** |

**Per-section counts.** `90_`: SUB-1 **15**, SUB-2 **8**, SUB-4 **9**, SUB-3 **5**, SUB-6 **9**, SUB-5 **5**, SUB-7 **8**,
SUB-8 **5**, SUB-9 **17**, SUB-10 **6**, SUB-11 **8**, SUB-13 **8** = **103**.
`91_`: SUB-1 **6**, SUB-2 **6**, SUB-4 **6**, SUB-3 **7**, SUB-6 **6**, SUB-5 **5**, SUB-7 **6**, SUB-8 **4**, SUB-9 **7**,
SUB-10 **6**, SUB-11 **3**, SUB-13 **1** = **63**.

**The keep-both-sides convention cost this package nothing.** Thirteen writers, two merge-conflict magnets, zero
duplicates to merge and zero entries lost. The convention was insurance that did not have to pay out — which is the
outcome it was written for, and is worth stating because a reconciliation that finds nothing to reconcile reads like a
reconciliation that was not performed.

### 5.2 Arithmetic integrity — **FAIL**

**One published roll-up in a merged artifact contradicts its own rows.** See §9.2. This is a register-integrity failure
in the strict sense the stub named — *"every entry traces back to the document that raised it"* holds, but a document's
own summary does not trace to its own table.

---

## 6. The rights obligations, re-checked over the whole package — **PASS**, with SUB-1 §10 superseded

**Scan date:** 2026-08-11 · **Scope:** `docs/research/C009-course-content-quality/`, recursive, all 38 files ·
**Commit base:** `4f89f2f` · **Evidence class:** 2 `[code-evidence]`

Both obligations of `01_provenance-and-rights.md` were re-run: the **§5.1 no-text scan** and the **§6 retained-list
scan**. Commands are recorded as executed, with alternation expressed as repeated `-e` patterns.

| # | Checks for | Command (paths absolute in execution; shown package-relative) | Outcome at 2026-08-11 | SUB-1's outcome at 2026-08-10 |
| --- | --- | --- | --- | --- |
| **A** | Statement-section markers at line start | `grep -rnE -e '^Input\b' -e '^Output\b' -e '^Constraints\b' -e '^Sample Input\b' -e '^Sample Output\b' <pkg>` | **0 matches** | 0 matches |
| **B** | Problem-level URLs of the twelve sources | `grep -rnE -e 'codeforces\.com/problemset/problem' -e 'codeforces\.com/contest/' -e 'cses\.fi/problemset/task/' -e 'atcoder\.jp/contests/[A-Za-z0-9_-]+/tasks/' -e 'usaco\.org/index\.php\?page=viewproblem' -e 'judge\.yosupo\.jp/problem/' <pkg>` | **0 matches** | 0 matches |
| **C** | An enumerated candidate set — source-native problem identifiers in list items or table rows | `grep -rnE` over the eight `[-*]`/`\|` × `abc\|arc\|agc\|dp` row-start patterns, `<pkg>` | **0 matches** | 0 matches |
| **D** | Fenced code blocks — where a sample case, an example, or a serialised API response body would sit | `grep -rn '^```' <pkg>` | **80 delimiters — 40 blocks across 10 files** | **0 matches**; *"the package contains no fenced block at all"* |
| **E** | The enumerating endpoint by name | `grep -rniE -e 'problemset\.problems' -e 'api\.codeforces\.com' <pkg>` | **14 matches across 8 files** | 3 matches |

### 6.1 Scan D fired, and every one of the 40 blocks was adjudicated

**§5.1 says a hit is a failure to fix, not a note to add.** Scan D produced 40 hits, so the gate opened each one rather
than reporting a count. §5.1(b) states what the scan is *for*: *"verbatim-quote blocks and fenced code blocks **that
would carry** an example, a sample case, or a statement excerpt."*

| Block class | Count | Content | Carries statement text, a sample case, or a response body? |
| --- | --: | --- | --- |
| Form field-name skeletons (`form: lesson`, `form: solution`, …) | **21** | `02_` ×10, `04_` ×4, `11_` ×4, `dry-run/03_` ×2, `04_` argument slot ×1 | **No** — field names and slot labels only |
| Quarantine record shapes (`record_id: RR-Q-DR-1`) | **2** | `08_`, `09_` | **No** |
| Dry-run probe transcripts | **10** | `dry-run/02_` ×9, `dry-run/03_` ×1 | **No** — every one is a `REFUSED — …` response |
| Derivation and validator output (counts, `PASS` lines, id/field tuples) | **6** | `traceability/07_` ×2, `traceability/09_` ×1, `traceability/11_` ×3 | **No** |
| Local test-runner output | **1** | `09_` §12, the `MC-4 v1.0` prototype run | **No** — repository unit-test output |

**Verdict: the rule holds; the scan's proxy fired.** **Zero blocks carry problem statement text, a sample case, an
example from a source, or a serialised API response body.** The no-text rule (§5) and the retention disposition (§6) are
**not breached**. **Scan E's 14 matches are likewise all policy prose** — the endpoint named as the subject of a
prohibition, in `01_` ×3, `03_` ×3, `07_` ×1, `09_` ×1, `11_` ×1, `90_` ×1, `91_` ×2, `traceability/03_` ×1 and
`traceability/03_`'s access record — **none carries, quotes or summarises a response.**

### 6.2 SUB-1 §10's recorded outcome is superseded at this date, and `OI-S1-15` is discharged

`OI-S1-15` filed exactly this: *"the §10 repository scan was recorded against the file set present when it ran"*, with
revision trigger *"the completeness gate re-runs both scans over the whole package"*. **That trigger has now fired.**

SUB-1's §10 scan ran at commit base `c558ff9` over SUB-1's own files. Its **D row** and **E row** outcomes — *"0 matches …
the package contains no fenced block at all"* and *"3 matches"* — **describe a smaller file set than the package now has
and are stale at this cutoff.** The rows **A**, **B** and **C** reproduce exactly.

**§10 is not edited by this gate.** It is a dated scan result, and rewriting its counts to match a later file set would
present a re-run that did not happen as though it had — which is `OI-S1-15`'s own stated reason for filing rather than
patching. **This section is the re-run, with its own date and its own commit base.** `OI-S1-15` is **discharged with a
changed outcome**, recorded at `OI-S12-4`.

### 6.3 Stated limitation

These are **lexical scans**. They prove the structural absence of stored statements, stored problem-level URLs,
enumerated id lists, and example or response blocks. **They do not prove that no sentence anywhere is a semantic
paraphrase of a protected statement, which no grep can prove** — and the block-by-block adjudication in §6.1 is a
**reading judgement over 40 blocks**, not a mechanical result. That residual is a review obligation on every sub-task,
named here rather than papered over, and is the same limitation `CAP-S1-5` and `CAP-S2-6` carry.

---

## 7. Cross-reference resolution — **PASS**

| Reference class | Distinct cited | Resolving | **Dangling** |
| --- | --: | --: | --: |
| `OI-S<n>-k` open items | 103 | 103 | **0** |
| `CAP-S<n>-k` caps | 63 | 63 | **0** |
| `EQ-S<n>-k` classification rows | 146 | 146 | **0** |
| `G-*` gate ids | 59 | 59 | **0** |
| `DR-C09-NN` decision records | 4 cited | **3** | **1** — `DR-C09-03`, see §9.3 |

**Total dangling references across every id namespace this gate cites: 1**, and it is the one SUB-13 filed at
`OI-S13-2`. Every id this gate itself cites resolves — **dangling-reference count for `92_`: 0**.

---

## 8. The §8 acceptance checklist — 13 items, item by item

**Source:** `../C005-dp-map-package/02_authoring-requirements.md` §8 (lines 302–323). **Consumed, not re-derived.**

| # | Item | Verdict | Evidence |
| --: | --- | --- | --- |
| **1** | Sequences from the **graph's topological order** (`F-943-1` closed, `D-R4`) | **PASS** | `07_` §9: `F-943-1` recorded **closed**, discharged by `D-R4`, and **independently re-confirmed by SUB-7's own validator run — 0 depth mismatches, 0 stage inversions**; `traceability/07_` rows 29, 46, 102 |
| **2** | Classifies edges **by field**, never by endpoint span (`X-S1`) | **PASS (vacuous)** | The package **authors no edge**. Where it touches edge semantics it does so by field (`02_` §—, `traceability/02_` row 55); `X-S1` is carried as a consumed constraint (`08_`:519, `traceability/07_`:44) |
| **3** | Treats every `boundary_anchor` terminal as **assumed knowledge**, authoring none of it | **PASS (vacuous)** | The package authors no node content. `boundary_anchor` appears only as a consumed constraint (`02_`:242, `11_`:109, `traceability/02_`:55, `traceability/07_`:35) |
| **4** | Authors **none** of the 10 `INC-C1` gaps, and **states the incompleteness** | **PASS** | 31 citations across 8 files; `05_` §— routes the obligation; `13_` `RK-11`: *"The residual `INC-C1` techniques themselves remain unmapped, so their conceptual obligation cannot be enumerated at all"*; `CAP-S5-2` |
| **5** | Leaves the two dangling declarations (`F-939-A`/`F-939-B`) **in place** | **PASS** | Both cited and left standing at `05_`:252–253, 295; `09_`:231; `90_`:405; `traceability/05_`:56. No map file is edited by any sub-task |
| **6** | **Re-derives** `prerequisite_depth` from the graph after any edge change | **PASS** | **No edge change was made** by this package, and SUB-7 re-derived anyway: `07_` §9 records 0 depth mismatches, which is why `prerequisite_depth` is class **MD** rather than class **P** |
| **7** | **Surfaces its reliance** on every `provisional` value it consumes — stages, difficulty loads, AR-1 dependents | **PASS** | `traceability/07_calibration-input-traceability.md` is a dedicated per-input reliance register; `AR-1` dependents recorded at `08_`:361 and `traceability/07_`:35 |
| **8** | **Invents no problem-level citation** (`CAP-2`) | **PASS** | Scan B returns **0 problem-level URLs package-wide** (§6). All twelve sources are `Restricted`, the hierarchy halts at **V0**, **zero requests were issued** and **zero problems are cited** — `03_` §—, `CAP-S3-1`, `CAP-S3-2` |
| **9** | Presents no JS performance verdict as **measured** (`JS-U2`) | **PASS** | 34 citations; `04_` §— carries the verdict as unmeasured with `DR-C09-04_authoring-languages.md` as its record; carried as a cap in `91_` |
| **10** | Presents the graph order as **structural, never as measured DP-learning order** (`R1`) | **PASS** | Enforced by a named gate — `G-R1-LABEL` over `EQ-S2-8`, `blocks` — and carried as an AI-judgment residual at `OI-S9-11` with its bound stated |
| **11** | Gives every split half a **residual owner** (§6.1) | **PASS** | Every sub-task carries a residual clause with a named owner: `09_` §3.5 (NEU-965), `10_` §7.4, `11_` §10.4, `13_` §7.4; `13_` `RK-11` records the mechanism firing in practice |
| **12** | Sequences derived work on **data** dependency, not file disjointness (§6.2) | **PASS** | `13_` `RK-11`: *"every derived sub-task records the version of the input it derived from. The mechanism worked: SUB-9's reassignment of SUB-4's mechanisms (`DEC-10`) was caught **because** SUB-4 recorded its table as provisional and named its successor"* |
| **13** | Flips status **only in the ledger**, and **unions** rather than replaces | **PASS (vacuous)** | §4. The one ledger interaction (`CH-F5-1`) is a verified union with `D-F5` left unchanged. **Vacuous because no status was flipped anywhere** — and this package holds no local ledger at all |

### 8.1 Counts

| Verdict | Count |
| --- | --: |
| **PASS** | **13** — of which **4** are **vacuous** (items 2, 3, 13, and item 6's *"after any edge change"* limb) |
| **FAIL** | **0** |
| **UNVERIFIABLE** | **0** |

**Read the vacuity column, not the PASS column.** Four of thirteen items pass because the package **did not do the thing
the item constrains** — it authored no edge, no node content, and flipped no status. That is the correct outcome for a
specification package that deliberately authors no map content (`13_` `RK-12`: *"This package authored no map content …
verifiable by diff"*), and it is **not** evidence that the constraints were exercised and held.

---

## 9. The items this gate was named to resolve

### 9.1 `OI-S11-1` — **RESOLVED, and the lists differ**

**The question.** `11_` §2.3 fixes the charter's *"seven observable elements"* as `E1`–`E7`, stating: *"the charter …
does not enumerate them in a form this sub-task could copy verbatim … **the act of fixing them is filed as `OI-S11-1`**
so SUB-12 can reconcile if the charter's own list differs."* Owner: **SUB-12**. Compensating gate: **`none — cap`**
(`CAP-S11-1`, `EQ-S11-22`).

**The durable source.** `_local/` is gitignored and is **never a citable source of record**. The charter body's durable
home is the **published NEU-890 umbrella**, per assumption 25 and `OI-S13-4`. **The NEU-890 body was read for this gate
and it carries the enumeration twice.**

- **OUT-11's success measure:** *"At least one complete exemplar per cluster (CL-1…CL-4) carries **purpose, curriculum
  placement, verified provenance, difficulty evidence, correctness checks, review record and assessment signal**, all
  observable."*
- **OUT-9's first acceptance scenario:** *"…then its **purpose, curriculum placement, provenance, difficulty evidence,
  correctness checks, review record, and assessment signal** are observable and meet the rubric."*

**`OI-S11-1`'s premise is contradicted.** The charter *does* enumerate the seven, in a form that could have been quoted
verbatim, in two places.

**The mapping.**

| # | The charter's element | `11_` §2.3 | Disposition |
| --: | --- | --- | --- |
| 1 | **purpose** | — | **NOT carried as a named element** |
| 2 | curriculum placement | `E1` Node identity | covered |
| 3 | verified provenance | `E4` Provenance | covered |
| 4 | difficulty evidence | `E6` Calibrated difficulty | covered |
| 5 | correctness checks | `E5` Standards conformance | covered |
| 6 | review record | `E7` Workflow position | covered |
| 7 | **assessment signal** | folded inside `E2` The REQUIRED form set | **covered, but not named** |
| — | — | **`E3` The discriminative pair** | **an addition** — not one of the charter's seven |

**Verdict: six of the seven are substantively covered; `purpose` is not carried as a named element; `assessment signal`
is folded inside `E2` rather than named; and `E3` is an addition.** The two lists are **not the same list**.

**The consequence, in `OI-S11-1`'s own words:** *"If the lists differ, every rubric row in §5 is mislabelled — the
**elements** would be wrong even though the **observations** stand, because each observation is independently recorded."*
**That is exactly the disposition.** The observations `11_` §5 records stand; their **labelling against the charter's
seven does not**. Re-labelling `11_` §5 is not this gate's write — `11_` is SUB-11's file and this gate rewrites no
sub-task's entries — so the residual is carried forward at `OI-S12-5` with SUB-11 (NEU-967) named as owner.

**`CAP-S11-1` does not close clean.** It closes as *"resolved with a recorded difference"*: the reconciliation the cap
was waiting for has been performed, and it returned a difference rather than a match.

### 9.2 `OI-S13-1` — **CONFIRMED by independent re-derivation**

**Method.** `_local/scratch/classify.cjs` parses every row of all five classification tables out of the merged blobs at
commit base `4f89f2f`, splitting each row on `|` and reading the mechanism, blocking and placement cells positionally.
**Neither SUB-13's number nor SUB-11's was taken on trust.**

| `11_` §10.1's 23 `EQ-S11-*` rows | Derived here | Published at `11_` §10.2 | |
| --- | --: | --: | --- |
| `deterministic` | **15** | **14** | **DISAGREES** |
| `schema` | **4** | **5** | **DISAGREES** |
| `server-side` | 1 | 1 | matches |
| `automated` | 1 | 1 | matches |
| `AI` | 2 | 2 | matches |
| **Total** | **23** | **23** | matches |

**`deterministic` rows:** `EQ-S11-1, 2, 4, 5, 6, 8, 12, 13, 14, 15, 16, 17, 18, 20, 23` — **15**.
**`schema` rows:** `EQ-S11-3, 7, 11, 19` — **4**.

**Exactly one row is summarised as `schema` that its own row cell classifies `deterministic`.** SUB-13's finding is
**confirmed by a second, independent parse**. `11_` §10.2's **blocking** roll-up (`blocks` 19 · `warns` 1 ·
`quarantines` 3) and **placement** roll-up (authoring-time 23 · serve-time 0 · both 0) **both reproduce exactly** — the
defect is confined to the mechanism line.

**Which row is mis-summarised is not established, and is not guessed at here.** An aggregate roll-up does not record
which row it counted wrongly, and naming one on a hunch would replace a known error with an invented fact. `11_` is not
edited by this gate. Carried at `OI-S12-6`, owner **SUB-11 (NEU-967)**.

### 9.3 `OI-S13-2` — **RESOLVED: `DR-C09-03` was never allocated**

`decision-records/` holds `DR-C09-01_permitted-field-set.md`, `DR-C09-02_dr-m08-routing.md`,
`DR-C09-04_authoring-languages.md` and `README.md`. **`DR-C09-03` is absent.**

**Established by search rather than assumed:** the string `DR-C09-03` occurs **nowhere in the package except inside
`OI-S13-2`'s own entry** — three occurrences, all of them the filing itself. **No artifact anywhere cites `DR-C09-03`.**

**Verdict: it was never allocated.** No sub-task claimed it, published against it, or referenced it. The band is sparse
by accident of concurrent numbering, not by a lost record, and **no cross-reference is broken** — which is why §7 counts
it as the package's single dangling reference and simultaneously as one that costs nothing. `OI-S13-2` is **closed**;
the band is left sparse, because renumbering `DR-C09-04` to close the hole would break every reference already written
against it, for cosmetic gain.

---

## 10. SUB-12's self-classification, in SUB-9's published scheme

Per `09_` §3.5, a later sub-task discharges the residual clause by classifying its own quality requirements in §3.6's row
shape. This sub-task produces **four**.

### 10.1 The classification table

| Id | Quality requirement this sub-task creates | Mechanism | Blocking | Placement | Gate id | `AI-judgment-only`? |
| --- | --- | --- | --- | --- | --- | --- |
| **`EQ-S12-1`** | **Every figure this gate publishes is derived by this gate from the merged blob at a stated commit base**, never restated from a predecessor's roll-up. | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` | no |
| **`EQ-S12-2`** | **Every id this gate cites resolves to a definition in the package.** | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` | no |
| **`EQ-S12-3`** | **No cap whose closure condition names an independent reader is closed by a run that is not independent.** | `deterministic` | `blocks` | authoring-time | `G-SELF-REVIEW` | no |
| **`EQ-S12-4`** | **Whether a scan hit is a genuine breach of the obligation the scan proxies for**, as opposed to a benign match on the shape the scan looks for. | **`AI`** | `quarantines` | authoring-time | **`none — cap`** · `OI-S12-7` | **yes** |

**Serve-time placement is `—` on every row**, and that is a finding rather than an omission: **no serve surface exists**
to place any of them on (`CAP-S9-6`).

### 10.2 Roll-up

| Axis | Distribution |
| --- | --- |
| **Mechanism** | `deterministic` **3** · `schema` 0 · `server-side` 0 · `automated` 0 · `AI` **1** — total **4** |
| **Blocking** | `blocks` **3** · `warns` 0 · `quarantines` **1** — total **4** |
| **Placement (rows)** | authoring-time **4** · serve-time **0** · both **0** — total **4** |

### 10.3 Enforcement-gap entry — the one `AI` row

| Row | The `AI`-judgment residual | Compensating observable | Owner | **What it does not catch** |
| --- | --- | --- | --- | --- |
| **`EQ-S12-4`** | Whether a scan hit is a genuine breach. §6.1 adjudicated 40 fenced blocks and found none carried statement text — **that adjudication is a reading judgement, and it is the judgement the whole no-text rule ultimately rests on.** | **None that is observable today.** Carried as **`CAP-S12-1`**. | — (no gate can be named; the cap carries it) | **Everything.** A gate that decided whether a match is benign would be a gate that decided the semantic question the scan exists precisely because it cannot decide. Recorded as a gap with no compensating gate rather than assigned to one that would not detect it — the same honesty `CAP-S9-3` and `CAP-S13-1` apply to their uncompensated residuals. |

### 10.4 Residual clause

> **"…and any quality requirement this sub-task creates that is not classified in §10.1."**
> An unclassified requirement is **blocked until classified**, never admitted by default. Filed at `OI-S12-8`.

### 10.5 No new gate id

**Zero new gate ids (`G-*`) are introduced by this document.** `EQ-S12-1`–`EQ-S12-3` map to gates that already exist in
SUB-9's namespace (`G-RESIDUAL`, `G-SELF-REVIEW`); `EQ-S12-4` names none and carries a cap. **The package's distinct
gate-id count is unchanged at 59.** SUB-10, SUB-11, SUB-13 and SUB-12 have each introduced **zero**.

---

## 11. The reconciled classification, across all five tables

**Method:** one parse, all five tables, at commit base `4f89f2f`. Retained at `_local/scratch/classify.cjs`.

| Table | Rows | `deterministic` | `schema` | `server-side` | `automated` | `AI` |
| --- | --: | --: | --: | --: | --: | --: |
| `09_` §4 (SUB-1…SUB-8) | 89 | 28 | 20 | 15 | 11 | 15 |
| `10_` §7.1 (SUB-10) | 23 | 7 | 4 | 3 | 7 | 2 |
| `11_` §10.1 (SUB-11) | 23 | **15** | **4** | 1 | 1 | 2 |
| `13_` §7.1 (SUB-13) | 11 | 7 | 1 | 0 | 0 | 3 |
| **`92_` §10.1 (SUB-12)** | **4** | **3** | **0** | **0** | **0** | **1** |
| **Package total** | **150** | **60** | **29** | **19** | **19** | **23** |

**Package total before this document: 146** — `deterministic` **57** · `schema` **29** · `server-side` **19** ·
`automated` **19** · `AI` **22**. **This gate's parse reproduces `13_` §7.2's published 146-row totals exactly, on every
axis**, including the corrected `11_` figures. SUB-13's package roll-up is **confirmed**.

| Axis | Before SUB-12 (146) | After SUB-12 (150) |
| --- | --- | --- |
| **Blocking** | `blocks` 119 · `warns` 4 · `quarantines` 23 | `blocks` **122** · `warns` **4** · `quarantines` **24** |
| **Placement (rows)** | authoring-time 146 · serve-time 14 · both 14 · neither 0 | authoring-time **150** · serve-time **14** · both **14** · neither **0** |

### 11.1 The three required outcomes

| Required outcome | Result |
| --- | --- |
| **Zero unclassified rows** | **PASS** — all 150 rows carry a mechanism from the closed five-value set, a blocking behaviour from the closed three-value set, and a placement |
| **Zero conflicting duplicate rows** | **PASS** — no `EQ-S<n>-k` id is defined twice; the id-namespacing convention held across five concurrently-authored tables |
| **Zero missing table** | **PASS** — five tables for five requirement-producing sub-tasks. SUB-1…SUB-8 are classified by SUB-9 rather than self-classifying, by SUB-9's own design. **No table is absent, and no table is empty**, so the `none produced` / *not done* ambiguity never arises |

### 11.2 The placement audit

| Check | Result |
| --- | --- |
| Every gate carries at least one column | **PASS** — 59 of 59 |
| No gate carries neither | **PASS** — 0 |
| **Serve-time gate count is exactly 1** | **PASS** — **`G-DRIFT`**, the single legitimate `both` |
| Rows carrying a serve-time placement | **14** — `EQ-S3-5`, `EQ-S3-10`, and `EQ-S10-1`…`EQ-S10-9`, `EQ-S10-17`…`EQ-S10-19`. **Every one routes to `G-DRIFT`** |
| Distinct gate ids package-wide | **59**, all defined in `09_`; **gate ids appearing in `10_`/`11_`/`13_`/`92_` and absent from `09_`: 0 (the empty set)** |

**The exhaustiveness rule holds and the serve-time count is exactly 1** — 14 rows, one gate. `CAP-S9-6` records that
**no serve surface exists** for that gate to run on, so serve-time enforcement is **specified at 1 and built at 0**.

### 11.3 The enforcement-gap reconciliation — **PASS, 23 of 23**

**Every row classified `AI` carries a §3.4 entry with all four fields, or the literal `none — cap` plus a cap with a
named owner cited by id.** **Zero rows carry neither.**

| Source | `AI` rows | Covered by |
| --- | --: | --- |
| `09_` §4 | 15 | `09_` §11's sixteen residuals `OI-S9-1`…`OI-S9-16` |
| `10_` §7.1 | 2 | `10_` §7.3 — `OI-S10-1`, `OI-S10-2` (`none — cap`, `CAP-S10-1`) |
| `11_` §10.1 | 2 | `11_` §10.3 — `OI-S11-7`, `OI-S11-1` (`none — cap`, `CAP-S11-1`) |
| `13_` §7.1 | 3 | `13_` §7.3 — `EQ-S13-5`, `EQ-S13-7` (`none — cap`, `CAP-S13-1`), `EQ-S13-11` |
| **`92_` §10.1** | **1** | **§10.3 — `EQ-S12-4` (`none — cap`, `CAP-S12-1`)** |
| **Total** | **23** | **23 — complete** |

**Rows carrying `none — cap` package-wide: 5** — `EQ-S5-5` (`CAP-S9-3`), `EQ-S10-22` (`CAP-S10-1`), `EQ-S11-22`
(`CAP-S11-1`), `EQ-S13-7` (`CAP-S13-1`), `EQ-S12-4` (`CAP-S12-1`). **Five obligations in this package have no gate at
all** and say so, each with a named owner. `OI-S9-16` adds a sixth uncompensated residual that is not an `EQ` row.

### 11.4 One reconciliation finding of this gate's own

**`OI-S9-12`'s residual was written over two `warns` rows; the package now has four.** `09_` §11 files
*"whether a `warns` verdict is ever acted on"* against `EQ-S1-14` and `EQ-S4-2`, compensated by `G-WARN-COUNT`. Since
then `10_` and `11_` each added one `warns` row (`warns` = **4** package-wide). **The two later rows are inside the
residual's reasoning and outside its stated scope.** This is not a gate failure — only `AI` rows require an
enforcement-gap entry — but the residual **under-describes the population it covers**. Recorded at `OI-S12-9`, owner
**SUB-9 (NEU-965)**, by id and without editing `09_`.

---

## 12. Honest residuals — ranked

**Ranked by how much of the package's claimed value they remove, not by how easy they are to state.**

1. **Nothing is built.** **59 gates specified, 0 implemented, 0 run against a real content unit** (`CAP-S9-1`,
   `OI-S9-16` — which carries `none — cap`). **Serve-time enforcement: specified 1, built 0, surface 0** (`CAP-S9-6`).
   Every number in §11 describes a **specification**, and this gate's own PASS on the classification reconciliation is a
   statement about a table, not about a system. **This is the residual that generalises over all the others.**
2. **The gate is not independent** (§3.2). Nine caps that named this run as their closing occasion remain open, and the
   one AI correctness review in the package fails `C-3` on the same ground (`CAP-S9-4`).
3. **The 179/179 provisional set has not moved.** SUB-7's six dimensions remain provisional on **179 of 179** with
   **zero creator-confirmed**; SUB-8's flip path is specified end to end and **performed by nobody** (`CAP-S8-2`);
   SUB-10's revalidation budget is **0** and its corpus is **empty**.
4. **`CAP-2` is declined and the gate stays shut.** All twelve sources `Restricted`, the hierarchy halts at **V0**,
   **zero requests, zero citations, cluster coverage 0/4 on real problems** (`CAP-S3-1`, `CAP-S3-2`, `D-R5`). Outbound
   network capability was confirmed against a neutral endpoint, firing `CAP-S1-1`'s trigger (`OI-S3-2`) — and
   **capability is not authority.**
5. **Aggregate-green over per-cluster-red.** SUB-5's OUT-2 union-completeness returns PASS while the charter's
   per-cluster spread bar fails **3 of 4** (`CAP-S5-1`, `D-R6`). An aggregate that passes while its parts fail is the
   shape this package exists to refuse, and it is present in this package.
6. **The evidence ceiling.** Class 3 at **n = 1**; classes 4, 5 and 6 **absent package-wide**; class 7 does not exist and
   is not claimed (§3.1).
7. **`EQ-S13-7` is uncompensated**, owner **SUB-12** (`CAP-S13-1`), and **this gate cannot compensate it either** — the
   boundary between *derived and reported* and *defined* is the same reading judgement `EQ-S12-4` files against itself.
8. **`OI-S9-15` — the classification is one unreviewed pass by one model**, made 89 times and reviewed zero times.
   **This gate is the second pass, and it is the same model** (§3.2), so it bounds that residual without closing it.
9. **The mislabelled element set** (§9.1) and **the mis-summarised roll-up** (§9.2), both carried forward with owners.
10. **This gate's own limitations.** Its scans are **lexical** and **cannot establish the absence of semantic
    paraphrase**; §6.1's adjudication of 40 blocks and §3.1's adjudication of 25 class-7 occurrences are **reading
    judgements**, recorded as such; and every number it publishes was derived by **one parser, written by the same model
    that wrote the tables it parses**.

---

## 13. Owner

**NEU-969 (SUB-12)** — the final packaging sub-task, and the declared single owner that reconciles both shared registers.
**Reconciliation and the gate run are one job, in that order.**

**No other sub-task runs this gate**, marks it satisfied, or records a partial result in it. A sub-task that believes its
own contribution is complete says so in its own topic document; completeness of the **package** is a single owner's
judgment, made once, at the end. **This is that judgment, and it is a FAIL** — recorded here rather than smoothed into a
green, because a completeness gate that reports a green it did not earn is worth less than no gate at all.
