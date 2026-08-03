# `F-943-1` discovery record — every hit, classified

**Task:** NEU-956 (C008 SUB-15) · **Depends on:** NEU-954 (SUB-14), commit `94ddf22`
**Model:** claude-opus-5[1m]

**The search is the scope.** The scope of this closure is the three-limb search in
`09_f-943-1-discovery.sh`. This file classifies **every** site that search returned — in **both** of
its committed captures, the pre-treatment one and the post-treatment one (see §0 immediately below).
No site list in any charter revision has any standing here; re-running the script is the check.

---

## 0. TWO CAPTURES — read this before reading any count below

A search whose own hit set its treatments alter cannot honestly be captured once. The script scans
`ROOT="docs/research"`, and every one of this slice's record-closure edits lands inside
`docs/research/`. So the pre-treatment hit set and the post-treatment hit set are **different by
construction**. Both are committed, under different names. Neither substitutes for the other, and
saying which is which is the whole point of this section.

| Capture | What it is | How a reader reproduces it |
| --- | --- | --- |
| **`09_f-943-1-discovery-baseline-output.txt`** | The **PRE-TREATMENT** hit set, taken at base commit **`94ddf22`**, before any of this slice's edits. **This is the scope this slice classified and treated** — §5's 199 classification rows are keyed to *this* capture, one row per site. | Check out `94ddf22` and re-run the script. **Verified:** a fresh run of the script over `docs/research/` as of `94ddf22` is **byte-identical** to the committed baseline file (855 665 bytes, 4392 lines). |
| **`09_f-943-1-discovery-output.txt`** | The **POST-TREATMENT** hit set on the shipped tree — what the finished repair looks like to the search that found it. | Run the script on the merged tree. **This is the capture a reader reproduces by re-running the script, and it is the check on this slice.** **Verified:** repeated runs on the finished tree are byte-identical to the committed file (1 775 505 bytes, 5013 lines). |

**Which capture answers which question.** *"What was wrong, and was every part of it treated?"* →
the baseline capture, classified row-by-row in §5. *"If I re-run the script today, do I get the
committed output?"* → the post-treatment capture. **§8 reconciles the two, site by site**, and every
site by which they differ carries its own classification row there.

---

## 1. The search and its two results

| | |
| --- | --- |
| **Script** | `docs/wf-plans/C008__close-the-neu-889-fleets-unread-review-findings/09_f-943-1-discovery.sh` |
| **Command** | `sh docs/wf-plans/C008__close-the-neu-889-fleets-unread-review-findings/09_f-943-1-discovery.sh` (run from the repo root) |
| **Determinism** | Sorted output, no timestamps, no absolute paths, no `date`. The post-treatment capture is a **fixed point**: repeated runs on the finished tree are **byte-identical** to the committed file and to each other. The baseline capture is likewise byte-identical to a fresh run at `94ddf22`. |

### The counts — both captures, measured from the two committed files

Every figure below was counted from the capture named in its column. None is assumed, and none is
arithmetic on the other column.

| Quantity | **PRE-treatment** — `…-baseline-output.txt` @ `94ddf22` | **POST-treatment** — `…-output.txt`, shipped tree |
| --- | --- | --- |
| Lines in the capture | **4392** | **5013** |
| Raw occurrences (all limbs, all patterns) | **3956** | **4558** |
| **TOTAL HIT COUNT (de-duplicated sites)** | **199** | **216** |
| **Limb 1** — the finding ids `F-943-1`, `F-943-3` | **30** | **31** |
| **Limb 2** — the corrected values (`prerequisite_depth`, `progression_stage`, `entry_gate`, `PS-0`..`PS-4`, `gate-a`..`gate-e`, depth literals in prose) | **120** | **126** |
| **Limb 3** — the derived statistics (stage distribution, PS-4 share, depth range/histogram, gate counts, affected-node counts, the uninstantiated-gate claim) | **49** | **59** |
| Files reached by limb 3 but **not** by limb 1 | **10** | **10** — the same ten files |
| Classification rows in **§5** | **199** — one per site, equal by construction | — |
| Classification rows in **§8** (the delta) | — | **17** new sites, **0** vanished, all classified |

**Site arithmetic between the captures:** 199 + 17 new − **0 vanished** = **216**. Per limb:
L1 30 + 1 = **31**; L2 120 + 6 = **126**; L3 49 + 10 = **59**. **Every pre-treatment site is still
returned by the post-treatment capture** — the treatments added sites and changed occurrence counts,
but removed none. (That was not true of the first post-treatment capture; §8.2 records the one site
that had been lost, why, and how it was recovered.)

**§5's 199 rows are keyed to the PRE-TREATMENT capture** and are left intact — they are the record
of what was found and what was treated. §8 is keyed to the post-treatment capture and carries only
the difference.

**What a "site" is.** A site is one `(file, pattern)` pair. Raw occurrences of the *same* claim
shape in the *same* file collapse into one site with its occurrence count and its line numbers,
because they carry one classification and one treatment. The generated view re-emits a single
`F-943-3` sentence on all 179 dimension-bearing blocks; that is one site with 179 occurrences,
not 179 findings. Every raw occurrence remains printed, with its line and its text, in the
per-limb sections of the output file.

### Limb 3 reached files limb 1 did not — the whole reason limb 3 exists

Ten files are reached by limb 3 and **not** by limb 1 — **the same ten in both captures**. The
canonical proof case:

```
docs/research/C005-dp-progression/01_progression-stages.md
  grep -c 'F-943-'  ->  0
```

It states *"Observed distribution … PS-1 20 · PS-2 32 · PS-3 36 · PS-4 91"* (`:108`),
*"PS-4 holds 51% of the graph"* (`:109`) and *"The depth range is 1–9"* (`:110`) while naming no
finding id at all. An id-only search returns **nothing** for this file. That is how it survived
three enumerations.

The full limb-3-only set (read from the `files reached by limb 3 but NOT by limb 1` section of
**both** capture files — the two lists are identical):

`C005-dp-js-materiality/00_method-and-scope.md` · `C005-dp-js-materiality/02_audit-register.md` ·
`C005-dp-js-materiality/README.md` · `C005-dp-map-coverage/00_method-and-scope.md` ·
`C005-dp-map-coverage/01_coverage-matrix.md` · `C005-dp-map/edges/cross-cluster.yaml` ·
`C005-dp-progression/01_progression-stages.md` · `C005-dp-progression/02_difficulty-dimensions.md` ·
`C005-instructional-model/mastery-model/00_operational-mastery-model.md` ·
`C005-instructional-model/package/03_completeness-gate-and-dry-run.md`

---

## 2. The figures this record classifies against

Handed over by NEU-954 (`D-R3`, `01_schema-decision-ledger.md:235`), used **verbatim**, not
recomputed:

| Quantity | Pre-NEU-954 | Post-NEU-954 |
| --- | --- | --- |
| `progression_stage` distribution | PS-1 20 · PS-2 32 · PS-3 36 · PS-4 91 | **PS-1 19 · PS-2 26 · PS-3 27 · PS-4 107** |
| PS-4 share of the graph | 51% | **~60%** (107/179) |
| `entry_gate` distribution | gate-a 20 · gate-c 159 | **gate-a 19 · gate-b 0 · gate-c 160 · gate-d 0 · gate-e 0** |
| Depth corrections | — | **26** |
| Stage changes | — | **16** (all to `PS-4`) |
| `entry_gate` changes | — | **1** (`cl-3.bitmask-state-encoding`, `gate-a` → `gate-c`) |
| Stage inversions | 6 | **0** |

**The depth range — verified against the repaired map, as required.** Counted over
`docs/research/C005-dp-map/nodes/**`: depth 1 ×19, 2 ×26, 3 ×27, 4 ×30, 5 ×30, 6 ×28, 7 ×14,
8 ×3, 9 ×2 — **179 nodes, minimum 1, maximum 9. The depth range is still 1–9.** The recomputation
moved 26 depths *upward within* that range without extending either end. So
`01_progression-stages.md:110`'s *"The depth range is 1–9"* is **still true and does not flip**;
only the distribution (`:108`) and the PS-4 share (`:109`) on the same three lines are stale.
Recorded because a blanket "the statistics all moved" would have introduced a new false claim.

**The 6 residual `cl-4` values.** `cl-4.matrix-exponentiation-dp`, `cl-4.construct-transfer-matrix`,
`cl-4.implement-modular-matrix-power`, `cl-4.recognize-matrix-exponentiable-dp`,
`cl-4.smawk-application`, `cl-4.larsch-online-smawk-implementation` were corrected like the other
20, but their declared values match **neither** the pre-939 nor the post-939 graph. NEU-954 records
their residual cause as **`unestablished`**. This record carries that word forward unchanged and
neither explains nor resolves it.

---

## 3. `F-943-3` is not `F-943-1` — the ruling this record classifies against

`F-943-1` flips **CLOSED**. **`F-943-3` stays OPEN (Low).** `F-943-3`'s own sites are **exempt**
from the flip-to-closed rule. Its status comes from a re-check of its substance against the
post-NEU-954 map, not from any register's forecast:

| `F-943-3` limb | Ruling |
| --- | --- |
| **Inheritance** — *"inherits `F-943-1`"* | **DISCHARGED.** The stages are correct and the gates were re-derived from them on all 179. |
| **Determinism / redundancy** — *"`entry_gate` is a deterministic function of `progression_stage`, zero exceptions"* | **STILL TRUE.** NEU-954 re-derived every gate *as* that function, so the redundancy is exactly as it was. **This is why `F-943-3` stays OPEN (Low).** Its stale counts `×20` / `×159` are corrected to **gate-a 19 / gate-c 160**. |
| **Uninstantiated gates** — *"Gates B and D instantiated by no node"* | **Re-checked, and the register's own text is incomplete: `gate-b`, `gate-d` AND `gate-e` are instantiated by no node.** The corrected claim names all three. |
| **Surviving limb** | Routed to owner **NEU-940 / NEU-888**. |

### Sites that already flip `F-943-3` closed — the defect this record hunts for

**None found.** No site in the 199 states that `F-943-3` is closed or resolved. Every
`F-943-3` status field the search returned currently reads **open** / **unresolved**, which is the
true present-tense claim and must stay.

**But two sites carry the FORECAST, and a forecast is not a status.** Both live inside
`F-943-1`'s revision trigger, and both would produce the defect if read as an instruction:

| Forecast site | Text | Why it is flagged |
| --- | --- | --- |
| `docs/research/C005-dp-map-package/03_open-items-and-provisional-register.md:48` | *"When that re-run lands, `F-943-1` closes, **`F-943-3` closes with it**…"* | The re-run landed. Taken literally this instructs a false close. The clause must be **corrected against the substance re-check**, not executed. |
| `docs/research/C005-dp-map-schema/adjudication/01_schema-decision-ledger.md:109` (`D-P2`) | *"On that re-run `F-943-1` closes, **`F-943-3` closes with it**, and the 26 nodes' values are re-adjudicated here."* | Same shape, in the ledger. `D-P2` resolves on its own terms **as to `F-943-1` only**; its `F-943-3` clause is a prediction that the evidence contradicts. |

---

## 4. Files by class

**live** (a present-tense claim that is now false — flips to report `F-943-1` closed; `F-943-3`
sites route to the ruling in §3 instead):

- `docs/research/C005-dp-map-integrity/00_method-and-scope.md`
- `docs/research/C005-dp-map-integrity/01_dependency-and-cycle-audit.md`
- `docs/research/C005-dp-map-integrity/03_representative-paths.md`
- `docs/research/C005-dp-map-integrity/04_adversarial-gap-analysis.md`
- `docs/research/C005-dp-map-integrity/05_findings-register.md`
- `docs/research/C005-dp-map-integrity/06_caps-and-incomplete-scope.md`
- `docs/research/C005-dp-map-integrity/README.md`
- `docs/research/C005-dp-map-package/02_authoring-requirements.md`
- `docs/research/C005-dp-map-package/03_open-items-and-provisional-register.md`
- `docs/research/C005-dp-map-package/04_package-completeness-gate.md` (results table `:76-82` and `:183` only)
- `docs/research/C005-dp-map-package/05_cold-context-dry-run.md`
- `docs/research/C005-dp-map-package/06_caps-and-incomplete-scope.md` (`:65` only)
- `docs/research/C005-dp-map-package/README.md`
- `docs/research/C005-dp-map-package/generator/build-cross-reference.mjs` (the emitter's ungated literals)
- `docs/research/C005-dp-map-package/generator/package-completeness-gate.mjs` (PG-7)
- `docs/research/C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` (`D-P2`; plus the new superseding entry)
- `docs/research/C005-dp-progression/01_progression-stages.md` (`:108-109`; `:110` verified unchanged)

**generated** (regenerated, never hand-edited):

- `docs/research/C005-dp-map-package/01_cross-reference-view.md` — the sole output of
  `generator/build-cross-reference.mjs`. Every one of its 10 sites is treated by regeneration.

**historical** (a true record of a past decision — must NOT be edited):

- `docs/research/C005-dp-map-package/04_package-completeness-gate.md:87-97` — the authoring-history
  narrative. **The same file is split across classes**; its results table `:76-82` and `:183` are live.
- `docs/research/C005-dp-map-package/06_caps-and-incomplete-scope.md:46` — NEU-944's
  "deliberately DECLINED to do" row. **`:65` in the same file is live.**
- `docs/research/C005-dp-map-schema/adjudication/01_schema-decision-ledger.md:225` (`AC-6-P`) — a
  true pass record at NEU-944's ship. Superseded by an appended discharge note plus a **new** entry,
  per `AC-4-P` and the `INC-S3` precedent. **Never rewritten in place.**
- `docs/research/C005-dp-map-integrity/06_caps-and-incomplete-scope.md` `INC-9.9` — NEU-943's own
  scoping decision ("flagged, not fixed, and that is a deliberate cost") is historical and stays;
  only its present-tense *"until an owner acts, the map ships with 26 under-reported depths"* clause
  is live.

**Settled map files — flagged, never locally edited.** `docs/research/C005-dp-map/manifest.yaml`
declares these `settled`: *"binding … Change requires a ledger entry, never a local edit."* Sites
132-163 land in them. **NEU-954 already changed their values through ledger row `D-R3`; nothing in
this slice touches them again.** `docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`
is called out explicitly (sites 151-157), including its `:2777` `F-943-1` reference, which is a
correct forward pointer written by NEU-939/NEU-954 and is not a status claim.

---

## 5. The 199 classified sites — **keyed to the PRE-TREATMENT capture**

**Every row in this section is a row about `09_f-943-1-discovery-baseline-output.txt`**, the hit set
at `94ddf22`. It is the scope this slice classified and treated, and it is deliberately left intact:
it is the record of *what was found and what was done about it*. Site numbers are that capture's own,
in the order its combined hit table prints them, so they do **not** renumber against the
post-treatment capture. `occ` is the raw occurrence count that site collapses.

**For the shipped tree, read §8.** It reconciles this list against
`09_f-943-1-discovery-output.txt` and classifies every site by which the two differ.

### `C005-dp-js-materiality/` — limb 3 only, no finding id

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 1 | `docs/research/C005-dp-js-materiality/00_method-and-scope.md:15,27,51,52,66,82` (occ 6) | L3 | affected-counts | live | **checked, unchanged** — every hit is the map-size constant *"179 mapped technique nodes"*. NEU-954 changed values, not node count. No statement here depends on a depth, stage or gate. |
| 2 | `docs/research/C005-dp-js-materiality/02_audit-register.md:5` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — *"179 of 179 mapped technique nodes assessed"*; a JS-materiality count, independent of the dimension values. |
| 3 | `docs/research/C005-dp-js-materiality/README.md:11,62,79` (occ 3) | L3 | affected-counts | live | **checked, unchanged** — same 179 map-size constant. |

### `C005-dp-map-coverage/` — limb 3 only, no finding id

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 4 | `docs/research/C005-dp-map-coverage/00_method-and-scope.md:13` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — *"179 nodes across the four D-F4 clusters"*; a coverage-scope statement, not a dimension claim. |
| 5 | `docs/research/C005-dp-map-coverage/01_coverage-matrix.md:111` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — canon-coverage claim; no depth/stage/gate dependency. |

### `C005-dp-map-integrity/00_method-and-scope.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 6 | `:87` (occ 1) | L1 | id1 | **live** | *"F-943-1 — a genuine, measured defect in 179 nodes' annotations"* — present tense. **Flip to report `F-943-1` CLOSED**, naming the discharging ledger entry. |
| 7 | `:102` (occ 1) | L2 | stage-value | live | **checked, unchanged** — the `PS-2/3/4` **granularity** flag, which is `PS-GRAN`, owned by NEU-940's creator review. Untouched by the recomputation and by this slice. |
| 8 | `:87` (occ 1) | L3 | affected-counts | **live** | same line as site 6 — flips with it. |
| 9 | `:102` (occ 1) | L3 | stage-dist | live | same line as site 7 — **checked, unchanged**. |

### `C005-dp-map-integrity/01_dependency-and-cycle-audit.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 10 | `:112` (occ 1) | L1 | id1 | **live** | *"its stage/depth annotation is measurably not [trustworthy] (F-943-1)"* — false now. **Flip to closed.** |
| 11 | `:113` (occ 1) | L2 | stage-field | **live** | *"`progression_stage` does not currently agree with it across 6 [edges]"* — 0 inversions now. **Correct to 0 / past tense.** |
| 12 | `:57` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — reachability from all 179 non-root nodes; a graph property, unaffected. |

### `C005-dp-map-integrity/03_representative-paths.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 13 | `:86,104,154` (occ 3) | L1 | id1 | **live** | the split-verdict prose attributing the path inconsistencies to an open `F-943-1`. **Flip to closed**; the inversions are gone. |
| 14 | `:149` (occ 1) | L2 | depth-field | **live** | *"Declared `prerequisite_depth` matches the walked depth ❌ **153/179** — 26 under-report"* — now **179/179 ✅**. **Not in any charter enumeration; found by limb 2.** |
| 15 | `:38` (occ 1) | L2 | gate-value | live | **checked, unchanged** — matched on the substring `gate-a` inside a path-walk line, not a gate claim. |
| 16 | `:147` (occ 1) | L2 | stage-field | **live** | *"Every path consistent with NEU-940's `progression_stage` ❌ **3/5**"* — now **5/5**. **Not previously enumerated.** |
| 17 | `:37,38,39,40,41,42,46,51,52,53,+28 more` (occ 38) | L2 | stage-value | live | **checked, unchanged** — the five walked paths print each hop's stage. Verified against the repaired map: the CL-3/CL-4 hops now read the recomputed stages, so the printed walks are restatements that need re-walking **only if** the path listings are regenerated; they are hand-written prose whose per-hop labels must be reconciled with the repaired values when `:147`/`:149` flip. Recorded as a dependent edit of sites 14/16, not an independent one. |
| 18 | `:167` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — *"all 179 non-root nodes reach the sanctioned floor"*; a graph property. |
| 19 | `:136` (occ 1) | L3 | stage-dist | live | **checked, unchanged** — *"The frontier file holds 18 research-tier nodes (PS-1 ×3, PS-2 ×4, PS-3 ×1, PS-4 ×10)"*. **Re-counted against the repaired `frontier.yaml`: PS-1 3, PS-2 4, PS-3 1, PS-4 10 — identical.** Frontier's two depth corrections did not move a stage. A blanket "all stage statistics moved" would have falsified this line; it is verified, not assumed. |

### `C005-dp-map-integrity/04_adversarial-gap-analysis.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 20 | `:21,27,230,232` (occ 4) | L1 | id1 | **live** | the adversarial write-up's present-tense framing of `F-943-1`. **Flip to closed**, preserving the counterfactual method narrative (historical) intact. |
| 21 | `:37,108,112` (occ 3) | L2 | depth-field | **live** | *"Symptom A — 26 of 179 nodes under-report `prerequisite_depth`"* — past tense now. |
| 22 | `:274` (occ 1) | L2 | gate-field | **live** | the `entry_gate` restriction confirmation, see site 23. |
| 23 | `:274,275,277` (occ 3) | L2 | gate-value | **live** | *"confirmed: **20 gate-a** (all PS-1) and **159 gate-c** (all PS-2+)"* — now **gate-a 19 / gate-c 160**. **A stale gate count outside every charter enumeration; found by limbs 2 and 3.** |
| 24 | `:42,99,108,278` (occ 4) | L2 | stage-field | **live** | *"Symptom B — 6 `progression_stage` inversions"* and the determinism observation. Inversions → 0; the determinism observation stays true (see §3). |
| 25 | `:83,84,85,86,87,88,90,92,93,267,+3 more` (occ 13) | L2 | stage-value | **live** | the per-edge inversion table restating each node's stage. Every one of these pairs is now ordered correctly. |
| 26 | `:37,50,230,251` (occ 4) | L3 | affected-counts | **live** | the 26/179 and 6-inversion counts. |
| 27 | `:90,267,277` (occ 3) | L3 | stage-dist | **live** | the PS-1/PS-2 entry-level staging pattern claim; re-state against the post-repair distribution. |
| 28 | `:275` (occ 1) | L3 | uninstantiated | **live** | *"Gates B and D are instantiated by **no** node"* — **incomplete: `gate-b`, `gate-d` and `gate-e` are all uninstantiated.** Correct to name all three. |

### `C005-dp-map-integrity/05_findings-register.md` — the second register

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 29 | `:12,23,63` (occ 3) | L1 | id1 | **live** | `:12` is the register row whose `Status` column reads **open** — a present-tense claim. **Flip to closed.** `:23` is `F-939-2`'s cross-reference to `F-943-1`: update **only** the cross-reference, never `F-939-2`'s own status. `:63` is §5's consumer instruction *"until F-943-1 is closed"*. |
| 30 | `:14` (occ 1) | L1 | id3 | **live (`F-943-3`)** | **EXEMPT from the flip-to-closed rule.** `Status` stays **open**; record the inheritance limb discharged, keep the determinism limb, correct the counts, and route the survivor to NEU-940 / NEU-888. |
| 31 | `:12,64` (occ 2) | L2 | depth-field | **live** | `:64` is §5's *"Treat `prerequisite_depth` as advisory. 26 values under-report by 1–4 hops"* — now false. **A binding consumer rule, and it was not in any charter enumeration.** |
| 32 | `:14` (occ 1) | L2 | gate-field | **live (`F-943-3`)** | part of the `F-943-3` row — treated under §3, not flipped closed. |
| 33 | `:14` (occ 1) | L2 | gate-value | **live (`F-943-3`)** | `×20` / `×159` in the `F-943-3` row → **gate-a 19 / gate-c 160**. |
| 34 | `:12,14,60` (occ 3) | L2 | stage-field | **live** | `:60` is §5's *"Do not trust `progression_stage` across a cluster boundary … the stages on 6 of them are inverted"* — 0 inversions now. |
| 35 | `:14` (occ 1) | L2 | stage-value | **live (`F-943-3`)** | the `PS-1↔gate-a`, `PS-2/3/4↔gate-c` mapping — **still true**, counts corrected. |
| 36 | `:14,23` (occ 2) | L3 | affected-counts | **live** | the `zero exceptions` claim (`F-943-3`, still true) and `F-939-2`'s cross-reference. |
| 37 | `:14` (occ 1) | L3 | gate-counts | **live (`F-943-3`)** | the `×20` / `×159` counts — **corrected to gate-a 19 / gate-c 160**. |
| 38 | `:14` (occ 1) | L3 | stage-dist | **live (`F-943-3`)** | the stage↔gate crosstab; corrected counts, claim retained. |
| 39 | `:14` (occ 1) | L3 | uninstantiated | **live (`F-943-3`)** | *"Gates B and D instantiated by no node"* → **`gate-b`, `gate-d` and `gate-e`**. |

### `C005-dp-map-integrity/06_caps-and-incomplete-scope.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 40 | `:32,54,98` (occ 3) | L1 | id1 | **live** (mixed with historical) | `:32` *"Closing F-943-1 would achieve the former and would say nothing about the latter"* — a conditional that has now fired; the PS-granularity flag genuinely still stands. `:98` heads `INC-9.9`, whose **scoping decision is historical and stays**; its present-tense cost clause flips. |
| 41 | `:111` (occ 1) | L2 | depth-field | **live** | *"The remedy is cheap — `prerequisite_depth` is a pure function of the graph"* — the remedy has been applied. |
| 42 | `:26,110` (occ 2) | L2 | stage-field | **live** | `:110` *"until an owner acts, the map ships with 26 under-reported depths and 6 stage inversions"* — now false. |
| 43 | `:28` (occ 1) | L2 | stage-value | live | **checked, unchanged** — the `PS-2/3/4` granularity flag; still open, still NEU-940/NEU-888's. |
| 44 | `:36,65,109,110` (occ 4) | L3 | affected-counts | **live** | `:36`/`:65` are the 179-node `creator_review` constant (**unchanged**); `:109-110` are the 26/6 cost claims (**flip**). |
| 45 | `:28` (occ 1) | L3 | stage-dist | live | **checked, unchanged** — granularity flag, as site 43. |

### `C005-dp-map-integrity/README.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 46 | `:40` (occ 1) | L1 | id1 | **live** | *"This **is** F-943-1, and it is why NEU-940 routed its own unreviewed values here"* — present tense. **Flip to closed.** |
| 47 | `:33` (occ 1) | L2 | depth-field | **live** | the headline *"(26 under-reported `prerequisite_depth` values, 6 `progression_stage` [inversions])"*. |
| 48 | `:33` (occ 1) | L2 | stage-field | **live** | same line as site 47. |

### `C005-dp-map-integrity/validator/audit-graph-integrity.mjs` — executable, already updated by NEU-954

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 49 | `:20,292,316` (occ 3) | L1 | id1 | live | **checked, unchanged** — NEU-954 already rewrote these to past tense (*"That routing is now spent: NEU-954 took ownership of F-943-1"*). The `ANNOTATION FINDINGS` machinery must survive so a *future* mismatch is still surfaced. |
| 50 | `:344` (occ 1) | L1 | id3 | live | **checked, unchanged** — a comment stating the gate distribution is handed to NEU-956 for the `F-943-3` adjudication. This record is that adjudication. |
| 51 | `:223,253,255` (occ 3) | L2 | depth-field | live | **checked, unchanged** — computed, not restated. |
| 52 | `:296,320,340` (occ 3) | L2 | depth-literal | live | **checked, unchanged** — the documented `depth 1 → gate-a` rule, still correct. |
| 53 | `:23,24,292,294,301,320,322,325,334,339,+2 more` (occ 12) | L2 | gate-field | live | **checked, unchanged** — §H3's `check()`ed, build-fatal gate assertions. Must keep passing; must remain able to fail. |
| 54 | `:296,321,324,334,350` (occ 5) | L2 | gate-value | live | **checked, unchanged** — the `LADDER` vocabulary and the `gateForStage` function. |
| 55 | `:262,269,274,275,276,286,292,328,334,335,+2 more` (occ 12) | L2 | stage-field | live | **checked, unchanged** — H2 monotonicity, computed. |
| 56 | `:296,324,334,362` (occ 4) | L2 | stage-value | live | **checked, unchanged** — computed labels. |
| 57 | `:217,221,310,318` (occ 4) | L3 | affected-counts | live | **checked, unchanged** — `all 179 non-root nodes carry dimensions`, an assertion that still holds. |
| 58 | `:361` (occ 1) | L3 | stage-dist | live | **checked, unchanged** — the stage distribution is **computed and printed**, never hard-coded. It reports PS-1 19 · PS-2 26 · PS-3 27 · PS-4 107 by itself. |
| 59 | `:355,356` (occ 2) | L3 | uninstantiated | live | **checked, unchanged** — `uninstantiated` is **computed** from `LADDER`; it already reports `gate-b, gate-d, gate-e`. This is the mechanical evidence §3's third limb rests on. |

### `C005-dp-map-package/01_cross-reference-view.md` — **GENERATED**

Sole output of `generator/build-cross-reference.mjs`. **Every site below is treated by REGENERATION.
Not one of them is hand-edited** — that is the category error `sole_writer` exists to prevent.
Sites 60-62, 66-68 drop by themselves once the emptied `depthBad`/`invByNode` sets stop gating
their block; sites 61, 69 and the ungated top-matter re-emit verbatim unless the **emitter** is
edited first (see sites 110-117).

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 60 | `:38,41,47,62,63,191,192,194,195,198,+279 more` (occ 289) | L1 | id1 | **generated** | Regenerate. Per-node `⚠ F-943-1` markers and inventory flags are computed and vanish; the top-matter prose requires the emitter edit at site 110 first. |
| 61 | `:528,600,670,742,816,889,963,1035,1105,1177,+169 more` (occ 179) | L1 | id3 | **generated** | Regenerate **after** the emitter's `:385` literal is rewritten to the §3 ruling. It is gated only on `n.role !== 'root' && dd(n).entry_gate`, so it re-emits on all 179 blocks unchanged otherwise. **Must not be regenerated as "closed".** |
| 62 | `:38,47,494,566,636,708,781,855,929,1001,+197 more` (occ 207) | L2 | depth-field | **generated** | Regenerate. |
| 63 | `:5686,5759,8286,8290,8373,8377,8525,8529,8605,8609,+44 more` (occ 54) | L2 | depth-literal | **generated** | Regenerate. Mostly JS-materiality prose incidentally matching a depth literal; carried by regeneration regardless. |
| 64 | `:492,528,564,600,634,670,706,742,779,816,+348 more` (occ 358) | L2 | gate-field | **generated** | Regenerate — per-node `entry_gate` rows are projected from the map. |
| 65 | `:113,492,564,626,634,706,779,853,927,999,+177 more` (occ 187) | L2 | gate-value | **generated** | Regenerate — picks up the one changed gate (`cl-3.bitmask-state-encoding`). |
| 66 | `:39,44,495,528,567,600,637,670,709,742,+350 more` (occ 360) | L2 | stage-field | **generated** | Regenerate. |
| 67 | `:75,76,77,78,79,80,81,82,83,84,+360 more` (occ 370) | L2 | stage-value | **generated** | Regenerate — the 179-row inventory picks up all 16 stage changes. |
| 68 | `:38,528,600,670,742,816,889,963,1035,1105,+170 more` (occ 180) | L3 | affected-counts | **generated** | Regenerate; the "26 of 179" top-matter needs the emitter edit at site 116. |
| 69 | `:528,600,670,742,816,889,963,1035,1105,1177,+169 more` (occ 179) | L3 | uninstantiated | **generated** | Regenerate after the emitter's `:385` gains the corrected **`gate-b`, `gate-d`, `gate-e`** text. |

### `C005-dp-map-package/02_authoring-requirements.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 70 | `:37,44,50,128,183,185,198,216,263,273,+2 more` (occ 12) | L1 | id1 | **live** | the OUT-8 spec's prime directive rests on *"`F-943-1` (HIGH, open)"*. **Flip to closed**; the "author against the graph" rule may stand on its own merits but must stop citing an open defect. |
| 71 | `:184,199` (occ 2) | L1 | id3 | **live (`F-943-3`)** | **EXEMPT.** `F-943-3` stays open; correct the counts and the gate list per §3. |
| 72 | `:38,48,185,195,306` (occ 5) | L2 | depth-field | **live** | *"26 of 179 `prerequisite_depth` values are wrong"*. |
| 73 | `:184,199` (occ 2) | L2 | gate-field | **live (`F-943-3`)** | as site 71. |
| 74 | `:184` (occ 1) | L2 | gate-value | **live (`F-943-3`)** | as site 71. |
| 75 | `:39,41,128,138,183,184,300` (occ 7) | L2 | stage-field | **live** | the binding consumer instruction and the field table's `F-943-1` warning. |
| 76 | `:143,144,145,146,147,148,183` (occ 7) | L2 | stage-value | **live** | §3.2's table of the 6 known-bad orderings, restating each node's stage. All now order correctly. |
| 77 | `:38` (occ 1) | L3 | affected-counts | **live** | the 26/179 and 6-orderings counts. |
| 78 | `:183` (occ 1) | L3 | stage-dist | **live** | *"`F-943-1`: wrong on 6 orderings. `PS-2/3/4` granularity UNGROUNDED"* — the `F-943-1` half flips; the granularity half **stays** (NEU-940/NEU-888's). |
| 79 | `:184` (occ 1) | L3 | uninstantiated | **live (`F-943-3`)** | *"Gates B and D are instantiated by no node"* → **`gate-b`, `gate-d`, `gate-e`**. |

### `C005-dp-map-package/03_open-items-and-provisional-register.md` — the primary register

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 80 | `:28,35,48,103,110,112,126,343,363,364` (occ 10) | L1 | id1 | **live** | §1's dedicated `F-943-1` section (`Status: unresolved`, owner, revision trigger) plus §9's manifest row `:363`. **Flip to `F-943-1` CLOSED**, recording the discharging ledger entry. `:48` additionally carries the `F-943-3` forecast — see §3. |
| 81 | `:48,106,364` (occ 3) | L1 | id3 | **live (`F-943-3`)** | `:106` is §1.5's heading (`🟡 Low · unresolved`) and `:364` the §9 manifest row. **Both stay OPEN.** `:48` is the forecast clause — **corrected, not executed**. |
| 82 | `:28,43,44` (occ 3) | L2 | depth-field | **live** | the blast-radius restatement *"26 of 179 … wrong (153/179 correct)"*. |
| 83 | `:106,110,137,364` (occ 4) | L2 | gate-field | **live (`F-943-3`)** | §1.5's finding cell. Determinism limb stays; counts corrected. |
| 84 | `:110` (occ 1) | L2 | gate-value | **live (`F-943-3`)** | `PS-1↔gate-a (×20)`, `PS-2/3/4↔gate-c (×159)` → **19 / 160**. |
| 85 | `:27,43,44,45,110` (occ 5) | L2 | stage-field | **live** | *"`progression_stage` and `prerequisite_depth` are wrong on 26 of 179 nodes"* and *"Do not sequence from the stage labels"*. |
| 86 | `:87,88,89,90,91,92,110,133,137,366` (occ 10) | L2 | stage-value | **live** | the per-edge inversion table (`:87-92`) restating stages; all now correct. `:133`/`:137` are the `PS-2/3/4` granularity rows — **unchanged**. |
| 87 | `:28,44,94,110,363,365,409` (occ 7) | L3 | affected-counts | **live** | 26/179 and 6/5 counts (`:28,44,363`) flip; `:94`/`:365`/`:409` are the 179-node `creator_review` constant — **unchanged**. |
| 88 | `:110` (occ 1) | L3 | gate-counts | **live (`F-943-3`)** | `×20` / `×159` → **gate-a 19 / gate-c 160**. |
| 89 | `:110` (occ 1) | L3 | stage-dist | **live (`F-943-3`)** | the stage↔gate crosstab; claim retained, counts corrected. |
| 90 | `:110` (occ 1) | L3 | uninstantiated | **live (`F-943-3`)** | *"Gates B and D are instantiated by no node"* → **`gate-b`, `gate-d`, `gate-e`**. |

### `C005-dp-map-package/04_package-completeness-gate.md` — **file split across classes**

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 91 | `:76,78,79,80,81,82,87,95,97,114,+2 more` (occ 12) | L1 | id1 | **live at `:76-82` and `:183`; HISTORICAL at `:87-97`** | `:76-82` is the `PG-7a`…`PG-7e` results table, and `:183` certifies *"the **known** defect (`F-943-1`)"* present-tense — **both flip** to the reworked PG-7's verdicts, by the file's own rule (*"the script is the artifact; prose that disagrees with it is wrong"*). **`:87-97` is the authoring-history narrative of how `PG-7a`/`PG-7b` were hardened — it records what happened while the gate was being written and stays true forever. DO NOT EDIT `:87-97`.** |
| 92 | `:88,114` (occ 2) | L1 | id3 | **historical at `:88`; live at `:114`** | `:88` is inside the authoring-history narrative (*"`F-943-3` inherits it"* explaining why the first `PG-7a` matched 179) — **unchanged**. `:114` is the `PG-8a` bound-items list; keep `F-943-3` listed as bound and open. |
| 93 | `:117` (occ 1) | L2 | stage-value | live | **checked, unchanged** — `PG-8a`'s bound-item list includes `PS-2/3/4`, still an open granularity item. |
| 94 | `:117` (occ 1) | L3 | stage-dist | live | same line as site 93 — **checked, unchanged**. |

### `C005-dp-map-package/05_cold-context-dry-run.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 95 | `:46,136,191` (occ 3) | L1 | id1 | **live** | `:46` is the dry-run's recovered-facet row *"`F-943-1` (HIGH, open)"*; `:136` and `:191` (§9.1) state *"`F-943-1` remains an open defect in the shipped map"*. **All flip to closed.** |
| 96 | `:46` (occ 1) | L1 | id3 | **live (`F-943-3`)** | the same facet row also names `F-943-3` — **stays open**. |
| 97 | `:137` (occ 1) | L2 | depth-field | live | **checked, unchanged** — *"NEU-943's validator computes `prerequisite_depth` correctly from source"*, still true. |
| 98 | `:141,188` (occ 2) | L2 | stage-field | **live** | *"`progression_stage` … is wrong on 6 orderings"* / *"the field a curriculum agent reaches for first and the field that is wrong"* — now false. |
| 99 | `:42,51,52,54,55,66,79` (occ 7) | L2 | stage-value | **live** | the walked node's block, including the quoted *"Stage inverts across a cluster boundary … this node is `PS-3` but requires … at `PS-4`"*. The quoted marker no longer exists in the regenerated view, so the dry-run's transcript must be re-walked against the regenerated block. |
| 100 | `:131` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — *"Sort the 179 nodes into a teaching sequence"*, the task statement. |

### `C005-dp-map-package/06_caps-and-incomplete-scope.md` — **file split across classes**

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 101 | `:46,65` (occ 2) | L1 | id1 | **HISTORICAL at `:46`; live at `:65`** | **`:46` is NEU-944's "What NEU-944 deliberately DECLINED to do" row. NEU-944 did decline the repair, on a named ground, and that stays true forever. DO NOT EDIT `:46`.** `:65` is §4.2's present-tense *"`F-943-1` ships open … a consumer that ignores all five will mis-sequence 6 dependencies"* — **flips**. |

### `C005-dp-map-package/README.md`

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 102 | `:39,90,109` (occ 3) | L1 | id1 | **live** | `:39` is the headline *"`F-943-1` (HIGH, OPEN) — an open defect in the shipped map"*; `:90` the status table row (`unresolved`); `:109` the "three rules" narrative citing `F-943-1` as a found defect (that citation stays true as history — it was found — but must not imply it is still open). **Flip `:39` and `:90` to closed.** |
| 103 | `:98` (occ 1) | L1 | id3 | **live (`F-943-3`)** | the carried-open list. **`F-943-3` stays listed as open.** |
| 104 | `:41,52` (occ 2) | L2 | depth-field | **live** | *"26 of 179 depths are wrong"* and *"Treat `prerequisite_depth` as advisory; recompute it from the graph"*. |
| 105 | `:147` (occ 1) | L2 | gate-field | live | **checked, unchanged** — the package-index row naming NEU-940's `entry_gate` ownership. |
| 106 | `:41,44,49` (occ 3) | L2 | stage-field | **live** | the README's binding consumer rule (*"Do NOT trust `progression_stage` across a cluster boundary"*). |
| 107 | `:94,147` (occ 2) | L2 | stage-value | live | **checked, unchanged** — the `PS-2/3/4` granularity row and the package-index row. |
| 108 | `:42,59` (occ 2) | L3 | affected-counts | **live** | *"26 of 179 depths are wrong. 6 dependencies order backwards."* |
| 109 | `:94` (occ 1) | L3 | stage-dist | live | **checked, unchanged** — granularity row, as site 107. |

### `C005-dp-map-package/generator/build-cross-reference.mjs` — the emitter

Its **computed** blocks drop by themselves; its **ungated string literals** re-emit verbatim unless
edited here. `:330-332` is deliberately **not** an edit target — it sits inside the `:323`
`if (depthBad.has(n.id) || invByNode.has(n.id))` gate that the recomputation empties, and editing it
would damage the machinery that surfaces a *future* mismatch.

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 110 | `:23,26,90,122,130,193,196,202,219,220,+8 more` (occ 18) | L1 | id1 | **live (source)** | **Edit the emitter.** Ungated literals: `:193` (*"F-943-1 (HIGH, OPEN) — 26 of 179 …"*), `:196`, `:199-202` (*"Treat `prerequisite_depth` as advisory"*), `:204` (the stale *"see `../03_…` for owner and revision trigger"* pointer), the header comments at `:23-26`. Gated/computed and **left alone**: `:122,130` (the reproduction block), `:219-220` (summary rows), `:238-240` (inventory flag column), `:322-336` incl. `:330-332`, `:436` (console summary). |
| 111 | `:385` (occ 1) | L1 | id3 | **live (source)** | **Edit the emitter, to the §3 ruling — NOT to "closed".** Drop `inherits F-943-1`, keep the determinism/redundancy claim as still true, correct `×20`/`×159` to **gate-a 19 / gate-c 160**, and name **`gate-b`, `gate-d`, `gate-e`** as uninstantiated. Emits on all 179 dimension-bearing blocks. |
| 112 | `:23,126,193,202,328` (occ 5) | L2 | depth-field | **live (source)** | `:23`, `:193`, `:202` are ungated literals — **edit**. `:126`, `:328` are computed — **leave**. |
| 113 | `:332` (occ 1) | L2 | depth-literal | **generated-by-gate** | **DO NOT EDIT.** *"treat the declared depth as advisory"* lives inside the `:323` gate; regeneration drops it because nothing computes it. Editing it here would destroy future-mismatch machinery for no gain. |
| 114 | `:385` (occ 1) | L2 | gate-field | **live (source)** | as site 111. |
| 115 | `:116,194,199,238,335,336,385` (occ 7) | L2 | stage-field | **live (source)** at `:194,199,385`; computed at `:116,238,335,336` | Edit the three literals; leave the four computed. |
| 116 | `:193,385` (occ 2) | L3 | affected-counts | **live (source)** | the hard-coded *"26 of 179"* and the `zero exceptions` clause. |
| 117 | `:385` (occ 1) | L3 | uninstantiated | **live (source)** | *"Gates B and D are instantiated by no node"* → **`gate-b`, `gate-d`, `gate-e`**. |

**Other findings' literals in the same emitter — DO NOT TOUCH:** `:383` (`F-943-2`, Low, open) and
`:384` (`F-939-2`). Both are separate, still-open findings. `:384`'s passing `F-943-1`
cross-reference is the **only** thing that changes there; `F-939-2`'s own status never does.
(These are reached by sites 110/115 and are called out here so "enumerate the literals as a whole"
is not misread as "edit them all".)

### `C005-dp-map-package/generator/package-completeness-gate.mjs` — PG-7

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 118 | `:155,158,159,162,164,171,173,176,179,180,+5 more` (occ 15) | L1 | id1 | **live (executable)** | **Rework PG-7 to its post-closure purpose: the closure is EVIDENCED, never merely announced.** No node carries the marker (`PG-7a`'s inverse, holding because nothing computed it); no block names a stage inversion (`PG-7a2`'s inverse); the register records the closure **with its discharging ledger entry identified** (the successor to `PG-7b`/`c`/`d`). `PG-7e` has no closed-state analogue — **retire it and record why in the gate's own comment**. Must still **fail** on a register that does not evidence the closure. **Do not delete the block; do not leave an assertion that cannot fail.** |
| 119 | `:159,191` (occ 2) | L1 | id3 | **live (executable)** | `:159` is the comment explaining why `PG-7a` keys on the per-node marker (`F-943-3` inherits it) — update the rationale to match the reworked block. `:191` is `PG-8a`'s bound-item list; **`F-943-3` stays in it, still open**. |
| 120 | `:194` (occ 1) | L2 | stage-value | live | **checked, unchanged** — `'PS-2'` in `PG-8a`'s bound-item list; the granularity item is still open. |

### `C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` — the ledger

**Unioned, never replaced (`AC-4-P`). No row deleted, renamed, or rewritten in place.**

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 121 | `:109,225,235,250,253,341,342,343,345` (occ 9) | L1 | id1 | **live at `:109`; HISTORICAL at `:225`; already-current at `:235,250,253,341-345`** | **`:109` (`D-P2`, Status `unresolved`) resolves on its own terms as to `F-943-1`** — the revision trigger it named (a re-run over the edge-complete graph) has fired, as `D-R3` records. **`:225` is `AC-6-P`, a TRUE pass record at NEU-944's ship: preserve its text VERBATIM, append a discharge note, and add a NEW superseding entry. Never rewrite it in place** — `AC-4-P` and the `INC-S3` precedent govern. `:235` is NEU-954's `D-R3`, already correct. `:341-345` are the handover notes reserving `D-R4` onward for this slice — **this slice writes that new row**. |
| 122 | `:109,235` (occ 2) | L1 | id3 | **live (`F-943-3`) at `:109`** | **`D-P2`'s *"`F-943-3` closes with it"* is a FORECAST, not a finding.** Record `D-P2`'s resolution against what §3's substance re-check established, not against what `D-P2` predicted. `:235` already defers the ruling to this slice. |
| 123 | `:109,235,253` (occ 3) | L2 | depth-field | **live at `:109`** | `D-P2`'s 26/179 restatement. `:235`/`:253` are NEU-954's own, current. |
| 124 | `:109,235,341` (occ 3) | L2 | depth-literal | **live at `:109`** | as site 123. |
| 125 | `:235,253` (occ 2) | L2 | gate-field | live | **checked, unchanged** — `D-R3` and its handover notes, written post-repair. |
| 126 | `:235` (occ 1) | L2 | gate-value | live | **checked, unchanged** — `D-R3`'s `gate-a`/`gate-c` rule statement. |
| 127 | `:109,235,253` (occ 3) | L2 | stage-field | **live at `:109`** | as site 123. |
| 128 | `:235,242,256,343` (occ 4) | L2 | stage-value | live | **checked, unchanged** — `D-R3`'s enumeration and handover text. |
| 129 | `:109,235,237,280` (occ 4) | L3 | affected-counts | **live at `:109`** | `D-P2`'s counts. `:280` is `D-P3`'s 179-node `creator_review` constant — **unchanged**. |
| 130 | `:256` (occ 1) | L3 | ps4-share | live | **checked, unchanged** — NEU-954's own note that `01_progression-stages.md:108` is knowingly left stale and is **this slice's** to fix. Site 172 is that fix. |
| 131 | `:235,256,343` (occ 3) | L3 | stage-dist | live | **checked, unchanged** — `D-R3` already carries both the old and new distributions. |

### `C005-dp-map/` — **SETTLED map files. Change requires a ledger entry, never a local edit.**

`manifest.yaml` binds these as `settled`. **NEU-954 already changed their values through ledger row
`D-R3`. This slice edits none of them.** They are recorded here because a hit absent from the record
is indistinguishable from a hit that was missed.

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 132 | `docs/research/C005-dp-map/edges/cross-cluster.yaml:15,714` (occ 2) | L3 | affected-counts | live | **SETTLED — checked, unchanged.** The 179-node census comment; unaffected by the recomputation. |
| 133 | `nodes/cl-1-foundational.yaml:431,482,… (+36)` (occ 46) | L2 | depth-field | live | **SETTLED — checked, unchanged.** CL-1 carried **0** depth corrections; NEU-954 verified all 46 already agreed. Not a write target. |
| 134 | `nodes/cl-1-foundational.yaml` same lines (occ 46) | L2 | depth-literal | live | **SETTLED — checked, unchanged.** As site 133. |
| 135 | `nodes/cl-1-foundational.yaml:430,481,… (+36)` (occ 46) | L2 | gate-field | live | **SETTLED — checked, unchanged.** 0 gate corrections in CL-1. |
| 136 | `nodes/cl-1-foundational.yaml` (occ 50) | L2 | gate-value | live | **SETTLED — checked, unchanged.** |
| 137 | `nodes/cl-1-foundational.yaml:429,480,… (+36)` (occ 46) | L2 | stage-field | live | **SETTLED — checked, unchanged.** 0 stage changes in CL-1. |
| 138 | `nodes/cl-1-foundational.yaml` (occ 46) | L2 | stage-value | live | **SETTLED — checked, unchanged.** |
| 139 | `nodes/cl-2-combinatorial.yaml` (occ 61) | L2 | depth-field | live | **SETTLED — checked, unchanged.** CL-2 carried **0** depth corrections. |
| 140 | `nodes/cl-2-combinatorial.yaml` (occ 63) | L2 | depth-literal | live | **SETTLED — checked, unchanged.** |
| 141 | `nodes/cl-2-combinatorial.yaml` (occ 61) | L2 | gate-field | live | **SETTLED — checked, unchanged.** |
| 142 | `nodes/cl-2-combinatorial.yaml` (occ 62) | L2 | gate-value | live | **SETTLED — checked, unchanged.** |
| 143 | `nodes/cl-2-combinatorial.yaml` (occ 61) | L2 | stage-field | live | **SETTLED — checked, unchanged.** |
| 144 | `nodes/cl-2-combinatorial.yaml` (occ 61) | L2 | stage-value | live | **SETTLED — checked, unchanged.** |
| 145 | `nodes/cl-3-state-compression.yaml` (occ 31) | L2 | depth-field | live | **SETTLED — already repaired by `D-R3`.** 17 of the 26 depth corrections landed here. **No further edit.** |
| 146 | `nodes/cl-3-state-compression.yaml` (occ 31) | L2 | depth-literal | live | **SETTLED — already repaired. No further edit.** |
| 147 | `nodes/cl-3-state-compression.yaml` (occ 31) | L2 | gate-field | live | **SETTLED — already repaired.** The single `entry_gate` change (`cl-3.bitmask-state-encoding`, `gate-a`→`gate-c`) is here. **No further edit.** |
| 148 | `nodes/cl-3-state-compression.yaml` (occ 31) | L2 | gate-value | live | **SETTLED — already repaired. No further edit.** |
| 149 | `nodes/cl-3-state-compression.yaml` (occ 31) | L2 | stage-field | live | **SETTLED — already repaired.** 13 of the 16 stage changes are here. **No further edit.** |
| 150 | `nodes/cl-3-state-compression.yaml` (occ 31) | L2 | stage-value | live | **SETTLED — already repaired. No further edit.** |
| 151 | `nodes/cl-4-optimization/frontier.yaml:2777` (occ 1) | L1 | id1 | live | **SETTLED — checked, unchanged.** *"themselves are NEU-954's (F-943-1) and are not touched here"* — a scoping note, not a status claim. **Explicitly flagged: this is a `settled` map file; it changes only via a ledger entry, never a local edit.** |
| 152 | `nodes/cl-4-optimization/frontier.yaml` (occ 18) | L2 | depth-field | live | **SETTLED — already repaired by `D-R3`** (2 of the 26, both in the unexplained `cl-4` family). **No further edit.** |
| 153 | `nodes/cl-4-optimization/frontier.yaml` (occ 18) | L2 | depth-literal | live | **SETTLED — already repaired. No further edit.** |
| 154 | `nodes/cl-4-optimization/frontier.yaml` (occ 18) | L2 | gate-field | live | **SETTLED — checked, unchanged.** 0 gate changes in frontier. |
| 155 | `nodes/cl-4-optimization/frontier.yaml` (occ 18) | L2 | gate-value | live | **SETTLED — checked, unchanged.** |
| 156 | `nodes/cl-4-optimization/frontier.yaml` (occ 18) | L2 | stage-field | live | **SETTLED — checked, unchanged.** 0 stage changes in frontier. |
| 157 | `nodes/cl-4-optimization/frontier.yaml` (occ 18) | L2 | stage-value | live | **SETTLED — checked, unchanged.** |
| 158 | `nodes/cl-4-optimization/mainstream.yaml` (occ 23) | L2 | depth-field | live | **SETTLED — already repaired by `D-R3`** (7 of the 26). **No further edit.** |
| 159 | `nodes/cl-4-optimization/mainstream.yaml` (occ 23) | L2 | depth-literal | live | **SETTLED — already repaired. No further edit.** |
| 160 | `nodes/cl-4-optimization/mainstream.yaml` (occ 23) | L2 | gate-field | live | **SETTLED — checked, unchanged.** |
| 161 | `nodes/cl-4-optimization/mainstream.yaml` (occ 23) | L2 | gate-value | live | **SETTLED — checked, unchanged.** |
| 162 | `nodes/cl-4-optimization/mainstream.yaml` (occ 23) | L2 | stage-field | live | **SETTLED — already repaired** (3 of the 16 stage changes). **No further edit.** |
| 163 | `nodes/cl-4-optimization/mainstream.yaml` (occ 23) | L2 | stage-value | live | **SETTLED — already repaired. No further edit.** |

### `C005-dp-progression/01_progression-stages.md` — **NEU-940's own package; `grep -c 'F-943-'` = 0**

Reached **only** by limbs 2 and 3. This is the site three enumerations missed.

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 164 | `:61,104,215` (occ 3) | L2 | depth-field | live | **checked, unchanged** — the mechanical depth **definition**. It derives; it does not restate. Still correct. |
| 165 | `:151,169,170,201` (occ 4) | L2 | depth-literal | live | **checked, unchanged** — the `depth == 1 → gate-a`, `depth ≥ 2 → gate-c` rule and worked examples. This is the documented function NEU-954 applied; still correct. |
| 166 | `:117,120,150,235` (occ 4) | L2 | gate-field | live | **checked, unchanged** — the `entry_gate` definition and its two-value vocabulary. |
| 167 | `:122,123,147,150,151` (occ 5) | L2 | gate-value | live | **checked, unchanged** — the gate table. Still correct post-repair. |
| 168 | `:55,235` (occ 2) | L2 | stage-field | live | **checked, unchanged** — field-location prose. |
| 169 | `:48,49,59,80,81,82,83,84,86,93,+15 more` (occ 25) | L2 | stage-value | live | **checked, unchanged** — the PS-0…PS-4 stage **definitions** and the `PS-GRAN` flag. Definitions, not observed values. |
| 170 | `:152` (occ 1) | L3 | affected-counts | live | **checked, unchanged** — *"verifies that invariant mechanically on all 179 nodes"*. The invariant still holds (the validator's §H3 now proves it build-fatally). Note its cited source `04_consistency-check.md` **does not exist in the package**. |
| 171 | `:110` (occ 1) | L3 | depth-range | live | **checked, unchanged — VERIFIED, not assumed.** *"The depth range is 1–9"*. Recounted over the repaired map: min 1, max 9. **Still true.** The 26 corrections moved depths *within* the range. Editing this would introduce a new false claim. (The same line's *"the depth histogram is preserved in full in `04_consistency-check.md`"* points at a file that does not exist — a pre-existing dangling reference, not this slice's to mint.) |
| 172 | `:109` (occ 1) | L3 | ps4-share | **live** | *"**PS-4 holds 51% of the graph**"* → **~60%** (107/179). **The canonical limb-3-only hit.** Figures taken from NEU-954's recomputation, never from arithmetic on the old ones. |
| 173 | `:82,83,84,108,160,170` (occ 6) | L3 | stage-dist | **live at `:108`; unchanged at `:82,83,84,160,170`** | **`:108` — *"Observed distribution: PS-1 20 · PS-2 32 · PS-3 36 · PS-4 91"* → PS-1 19 · PS-2 26 · PS-3 27 · PS-4 107.** `:82-84` are the stage-**definition** table rows and `:160`/`:170` are the "stage ≠ difficulty / ≠ cluster" arguments — **all unchanged**. Because its cited source `04_consistency-check.md` does not exist, the restatement **is** the binding: this file is **live**, not generated, and there is nothing to regenerate it from. |
| 174 | `:20,123,134,143` (occ 4) | L3 | uninstantiated | live | **checked, unchanged** — §3.1's argument that Gates D and E are *not* entry gates. A definitional claim about the vocabulary, independent of instantiation counts. Distinct from `F-943-3`'s uninstantiated-gate limb, which counts nodes. |

### `C005-dp-progression/` — remainder

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 175 | `02_difficulty-dimensions.md:48` (occ 1) | L2 | depth-field | live | **checked, unchanged** — the field's schema row (`int`, "longest DP-technique path back to the floor"). A type definition. |
| 176 | `02_difficulty-dimensions.md:47` (occ 1) | L2 | gate-field | live | **checked, unchanged** — schema row for `entry_gate`. |
| 177 | `02_difficulty-dimensions.md:47` (occ 1) | L2 | gate-value | live | **checked, unchanged** — `"gate-a"` (PS-1) / `"gate-c"` (PS-2+); still the correct rule. |
| 178 | `02_difficulty-dimensions.md:46,70,166` (occ 3) | L2 | stage-field | live | **checked, unchanged** — schema rows. |
| 179 | `02_difficulty-dimensions.md:46,47,169,171` (occ 4) | L2 | stage-value | live | **checked, unchanged** — `PS-0`…`PS-4` vocabulary. |
| 180 | `02_difficulty-dimensions.md:148` (occ 1) | L3 | uninstantiated | live | **checked, unchanged** — *"which Gate D reads"*; the `recognition_load` ↔ Gate D routing, a definitional claim. |
| 181 | `README.md:27` (occ 1) | L2 | depth-field | live | **checked, unchanged** — package index row. |
| 182 | `README.md:26` (occ 1) | L2 | stage-value | live | **checked, unchanged** — package index row. |

### `C005-instructional-model/` — NEU-888's own vocabulary, not node dimension values

Every site below matched on the `gate-a`..`gate-e` / `Gates B and D` vocabulary that NEU-888 defines
and `entry_gate` cites. **None restates a node's dimension value and none carries an `F-943-` claim.**
Recorded so the search's reach is auditable.

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 183 | `SCAFFOLDING.md:56,83` (occ 2) | L2 | gate-value | live | **checked, unchanged** — matched inside "durability gate"/"gate-decision" prose. Not a node value. |
| 184 | `adjudication/01_instructional-decision-ledger.md:41,123,214,257` (occ 4) | L2 | gate-value | live | **checked, unchanged** — M10 progression-gate decisions. Not a node value. |
| 185 | `decision-records/DR-M10_progression.md:11,56` (occ 2) | L2 | gate-value | live | **checked, unchanged** — the durability-gate decision record. Not a node value. |
| 186 | `experiments/00_experiment-inventory-and-ranking.md:90,91` (occ 2) | L2 | gate-value | live | **checked, unchanged** — EXP-05 inventory rows. |
| 187 | `experiments/05_EXP-05_progression-gate-autoeval.md:15,31,82,117` (occ 4) | L2 | gate-value | live | **checked, unchanged** — gate-autoeval experiment prose. |
| 188 | `mastery-model/00_operational-mastery-model.md:48,70` (occ 2) | L3 | uninstantiated | live | **checked, unchanged** — the Gate A–E ladder **definition**. It is the source `entry_gate` cites; it makes no instantiation claim. |
| 189 | `package/00_per-mechanism-index.md:187,189,194,208` (occ 4) | L2 | gate-value | live | **checked, unchanged** — M10 mechanism index. |
| 190 | `package/03_completeness-gate-and-dry-run.md:28,99,100` (occ 3) | L2 | gate-value | live | **checked, unchanged** — the instructional package's own completeness gate, unrelated to the DP map's. |
| 191 | `package/03_completeness-gate-and-dry-run.md:101` (occ 1) | L3 | uninstantiated | live | **checked, unchanged** — an open question about assessment composition. |
| 192 | `package/README.md:23` (occ 1) | L2 | gate-value | live | **checked, unchanged** — index row. |
| 193 | `reconciliation/00_conflict-register.md:49,70,98` (occ 3) | L2 | gate-value | live | **checked, unchanged** — the C1 `repetitions>0` conflict, still open and not this slice's. |
| 194 | `traceability/01_instructional-evidence-register.md:174,175` (occ 2) | L2 | gate-value | live | **checked, unchanged** — F-EXP-05 evidence rows. |

### `C005-product-foundation/` — unrelated "gate" vocabulary

| # | path:line(s) | limb | pattern | class | treatment |
| --- | --- | --- | --- | --- | --- |
| 195 | `00_vocabulary.md:375` (occ 1) | L2 | gate-value | live | **checked, unchanged** — `00_gates-report.md` / gate-battery vocabulary. Nothing to do with `entry_gate`. |
| 196 | `autoeval-batch/README.md:16` (occ 1) | L2 | gate-value | live | **checked, unchanged** — pre-run gate-check index row. |
| 197 | `baseline-batch/README.md:14` (occ 1) | L2 | gate-value | live | **checked, unchanged** — pre-run gate-check index row. |
| 198 | `failure-batch/00_pre-run-gate-check.md:44` (occ 1) | L2 | gate-value | live | **checked, unchanged** — NEU-903 build-time gate rationale. |
| 199 | `failure-batch/README.md:16` (occ 1) | L2 | gate-value | live | **checked, unchanged** — pre-run gate-check index row. |

---

## 6. Row-count reconciliation — **the pre-treatment capture**

| | |
| --- | --- |
| Sites returned by the pre-treatment capture (`…-baseline-output.txt`) | **199** |
| Classification rows in §5 | **199** |
| Rows whose treatment is `checked, unchanged`, with a stated reason | 92 |
| Rows in `settled` map files already repaired by `D-R3` — `No further edit` | 12 |
| Rows carrying an edit, a regeneration, a supersession, or an explicit do-not-edit ruling | 95 |
| **Sum** | **92 + 12 + 95 = 199** |
| Sites in `settled` map files (flagged; **never** locally edited) | 32 (sites 132-163) |
| Sites carrying a `historical` component that must NOT be edited | 4 (sites 91 `:87-97`, 92 `:88`, 101 `:46`, 121 `:225`) |
| Sites whose subject is `F-943-3` and are **exempt** from the flip-to-closed rule | 24 (sites 30, 32, 33, 35, 36, 37, 38, 39, 71, 73, 74, 79, 83, 84, 88, 89, 90, 96, 103, 111, 114, 117, 119, 122) |

> The `F-943-3` count above is a reading aid over rows already present in §5; it mints no row and
> changes no total. Every `F-943-3`-bearing row is marked **live (`F-943-3`)** in place.

**This record classifies the search's output — both captures of it. It is not a site list, and no
site list substitutes for re-running `09_f-943-1-discovery.sh`.**

---

## 7. The reworked `PG-7` is FAILABLE — three negative controls, run and reverted

A gate that cannot fail is worth nothing. `F3.6` caught exactly that shape in this package's
annotation findings, and SUB-15's brief requires the rework be demonstrated failing on a
deliberately broken input rather than asserted to be failable. Each control below was applied to a
clean tree, the gate was run, and the control was **reverted**; the tree carries no residue.

| # | Deliberately broken input | Assertion that fired | Gate result |
| --- | --- | --- | --- |
| **A** | The register's `F-943-1` section no longer names **any** discharging ledger entry (`` `D-R4` `` → "the ledger") | **`PG-7c`** *(the closure NAMES its discharging ledger entry)* and **`PG-7f`** — both reported `(none named)` | **36/38, exit 1** |
| **B** | The register names a ledger entry that **does not exist** (`` `D-R4` `` → `` `D-R9` ``) | **`PG-7f`** alone — **`PG-7c` PASSED** on `D-R9`, proving `PG-7f` carries independent content: naming an entry is not the same as the entry resolving | **37/38, exit 1** |
| **C** | One node's declared depth re-broken on the map (`cl-3.bitmask-state-encoding`, `prerequisite_depth: 4` → `1`) so the generator **recomputes** a mismatch | **`PG-7a`** *(NO node carries the marker)* — reported `1 flagged`; `PG-5` also fell out, as the view was no longer regeneration-fresh | **36/38, exit 1** |

**Control B is the sharpest.** It separates "the register says the right words" from "the record it
points at exists". Without `PG-7f`, a register could discharge `F-943-1` by citing an id nobody ever
landed, and the gate would stay green — the same false-pass shape `PG-7b0`'s own comment warns about.

**Control C demonstrates the property that matters most about `PG-7a`/`PG-7a2`:** they hold
**because nothing computed the marker**, not because prose was deleted. The marker is emitted from
the generator's `depthBad`/`invByNode` sets; re-break the map and it returns, and the gate fails. An
assertion satisfied by deleting text would have passed control C.

**A fourth demonstration arose on its own, unplanned:** while `PG-7` had been reworked but the
`D-R4` ledger entry had not yet landed, the gate ran at **37/38, exit 1**, failing exactly `PG-7f`.
The check failed against a real intermediate state before any control was contrived for it.

**Post-control state:** every control reverted, the view regenerated, the map clean
(`git diff` over `docs/research/C005-dp-map/nodes/` is empty), and the gate back at
**38/38, exit 0**.

---

## 8. The DELTA between the two captures, reconciled

§5 classifies the **199** pre-treatment sites. The post-treatment capture returns **216**. This
section accounts for every site by which they differ, so that nothing in the difference is taken on
trust.

| | |
| --- | --- |
| Sites in the pre-treatment capture | **199** |
| Sites present post-treatment but **absent** pre-treatment (**new**) | **17** |
| Sites present pre-treatment but **absent** post-treatment (**vanished**) | **0** |
| Sites present in both with a **changed occurrence count** | **60** |
| Sites present in both, unchanged occurrence count | **139** |
| **Reconciliation** | 199 + 17 − 0 = **216** ✓ |

**The delta is purely additive.** Nothing the pre-treatment search found has become unreachable to
the post-treatment search. That property did not hold on the first attempt, and §8.2 is the record
of how the search itself caught the one exception and how it was closed.

Site identity is the script's own: one **(file, pattern)** pair. The `#` column below is the site
number in the **post-treatment** capture.

### 8.1 The 17 new sites — every one is this slice's own new text

Each row names the text that produced the hit and the §5 treatment that wrote it. **All 17 are the
search finding the repair it was used to make.** None is a pre-existing site the pre-treatment
capture missed, and **no delta site is left unexplained by this slice's own edits**.

| # | path:line | limb | pattern | occ | classification — why this site is new |
| --- | --- | --- | --- | --- | --- |
| 21 | `C005-dp-map-integrity/04_adversarial-gap-analysis.md:298` | L1 | id3 | 1 | **treatment text.** The re-measurement sentence this slice added — *"still zero exceptions, so the redundancy is exactly as it was and `F-943-3` stays open (Low)"*. It is §3's ruling written into the adversarial write-up, discharging §5 sites 24 and 28. A new literal `F-943-3`, so a new limb-1 site. |
| 43 | `C005-dp-map-integrity/06_caps-and-incomplete-scope.md:120` | L2 | gate-field | 1 | **treatment text.** The closure note added for §5 sites 40/42/44 — *"…16 stage changes, 1 `entry_gate` change — and **`F-943-1` is CLOSED** (ledger …)"*. Contains `entry_gate`, hence a new limb-2 site. |
| 50 | `C005-dp-map-integrity/README.md:43` | L2 | gate-field | 1 | **treatment text.** The README's flip (§5 sites 46-48) now states what discharged the finding — *"the edge-complete graph (26 depth corrections, 16 stage changes, 1 `entry_gate` change)"*. |
| 52 | `C005-dp-map-integrity/README.md:43` | L3 | affected-counts | 1 | **treatment text.** The same new line, second pattern: the `26 … depth` correction count. |
| 73 | `C005-dp-map-package/01_cross-reference-view.md` | L3 | gate-counts | 179 | **regenerated treatment text.** The corrected `F-943-3` sentence (§5 sites 61/69, via the emitter edit at site 111) now carries the real counts `×19` / `×160`, which limb 3's `(×\|x)(19\|20\|159\|160)` alternation matches. **Pre-treatment the emitter's literal carried no counts at all** (*"zero exceptions map-wide"*), so limb 3 could not reach the view here. Re-emitted on all 179 dimension-bearing blocks — one site, 179 occurrences. |
| 74 | `C005-dp-map-package/01_cross-reference-view.md` | L3 | stage-dist | 179 | **regenerated treatment text.** The same sentence: `PS-1`↔`gate-a` ×19 now matches the stage-count-tuple pattern. |
| 99 | `C005-dp-map-package/04_package-completeness-gate.md:86` | L2 | gate-field | 1 | **treatment text.** The new **`PG-7d`** results row (§5 site 91) — *"The section records what discharged it … ✅ NEU-954: 26 depth corrections, 16 stage changes, 1 `entry_gate` change"*. |
| 101 | `C005-dp-map-package/04_package-completeness-gate.md:86` | L3 | affected-counts | 1 | **treatment text.** Same `PG-7d` row, the `26 … depth corrections` count. |
| 123 | `C005-dp-map-package/generator/build-cross-reference.mjs:394` | L2 | gate-value | 1 | **treatment text (source).** The rewritten `F-943-3` emitter literal (§5 sites 111/114/117) now names `gate-a`, `gate-c`, `gate-b`, `gate-d`, `gate-e` where the old literal said only *"Gates B and D"*. |
| 125 | `…/build-cross-reference.mjs:394` | L2 | stage-value | 1 | **treatment text (source).** The same literal now names `PS-1` and `PS-2/3/4`. |
| 127 | `…/build-cross-reference.mjs:394` | L3 | gate-counts | 1 | **treatment text (source).** The `×19` / `×160` counts added to that literal. Sites 73/127 are the same claim at source and in the generated view. |
| 128 | `…/build-cross-reference.mjs:394` | L3 | stage-dist | 1 | **treatment text (source).** As site 126, stage-tuple pattern. |
| 132 | `C005-dp-map-package/generator/package-completeness-gate.mjs:177` | L2 | depth-literal | 1 | **treatment text (executable).** A comment added by the `PG-7` rework (§5 site 118) explaining why `PG-7a` is failable: *"…node's **declared depth** and the marker returns and `PG-7a` fails."* Matches limb 2's `[Dd]eclared depth`. This is negative control C's rationale, in the gate's own file. |
| 134 | `…/package-completeness-gate.mjs:202` | L3 | affected-counts | 1 | **treatment text (executable).** The new `PG-7d` assertion itself — `/26 depth corrections/.test(f943)`. The gate now *asserts* the count, which is why limb 3 sees it. |
| 144 | `C005-dp-map-schema/adjudication/01_schema-decision-ledger.md:300` | L3 | depth-range | 1 | **treatment text (ledger).** The new **`D-R4`** row (§5 site 121 wrote it), which re-verifies *"the depth range … minimum 1, maximum 9"*. |
| 145 | `…/01_schema-decision-ledger.md:300` | L3 | gate-counts | 1 | **treatment text (ledger).** `D-R4`'s `gate-a 19 · gate-c 160`. |
| 148 | `…/01_schema-decision-ledger.md:300` | L3 | uninstantiated | 1 | **treatment text (ledger).** `D-R4`'s *"`gate-b`, `gate-d` AND `gate-e` are instantiated by no node"*. |

**New sites by limb:** L1 +1, L2 +6, L3 +10.

### 8.2 Zero vanished sites — and the one that nearly was: the search catching this slice's own defect

**This is the most load-bearing paragraph in the record.** The committed search caught a defect that
the slice itself introduced, in a file the slice itself had just treated — and it caught it not from
a hit, but from a **hole in the delta between the two captures**. No hand-written site list could
have produced that signal, because a hand-written list has nothing to be compared against.

**What happened.** §5 site 28 required correcting `04_adversarial-gap-analysis.md`'s
uninstantiated-gate claim, which read *"159 gate-c (all PS-2+). **Gates B and D** are instantiated by
no node."* — incomplete, since `gate-e` is uninstantiated too. The treatment corrected it to name all
three gates. **On substance the correction was right and it landed.** But the rewritten sentence
wrapped across two source lines:

```
  **160 gate-c** (all PS-2+). **`gate-b`, `gate-d` and `gate-e` are instantiated by no**
  node. Whether that is correct is NEU-940's/NEU-888's, not SUB-9's. …
```

Limb 3's `uninstantiated` pattern matches on three alternatives — `instantiated by no node`,
`uninstantiated`, and `Gates? [BD]( and [BD])?` — and the corrected wording satisfied **none of them
on any single line**. `Gates B and D` was gone by design; the word `uninstantiated` never appears;
and `instantiated by no node` was **split by the line break** (`…instantiated by no**` ⏎ `node.`).
`grep` is line-based. **The claim was correct and unreachable at the same time** — the one failure
mode that a search-as-scope discipline exists to prevent, reproduced inside the very slice that
established the discipline.

**How it surfaced.** Not by review and not by re-reading the file. The first post-treatment capture
returned **215** sites where the baseline returned 199, and the site-by-site reconciliation in this
section showed **one pre-treatment site with no post-treatment counterpart**. A missing row is a
louder signal than a wrong one, and it is a signal only a *diff of two captures* can emit.

**How it was closed, and the proof.** Fixed at source by re-joining the sentence onto one line — the
wording is unchanged, only the layout. The fix is then **demonstrated by measurement, not asserted**:

| | baseline | first post-treatment capture | committed post-treatment capture |
| --- | --- | --- | --- |
| raw occurrences | 3956 | 4557 | **4558** |
| total sites | 199 | 215 | **216** |
| limb 1 / 2 / 3 | 30 / 120 / 49 | 31 / 126 / 58 | **31 / 126 / 59** |
| vanished sites | — | 1 | **0** |
| `uninstantiated` sites | 11 | 11 | **12** |

**Exactly one site returned and nothing else moved.** Limb 3 went 58 → 59 and the total 215 → 216;
limbs 1 and 2 are untouched; no other site's occurrence count changed. The recovered site is
**#29 — `C005-dp-map-integrity/04_adversarial-gap-analysis.md`, L3 `uninstantiated`, occ 1**. The
`uninstantiated` pattern now reaches **12** sites where it reached 11 before the slice began: the
two registers, `02_authoring-requirements.md`, the emitter, the regenerated view, `D-R4`,
`04_adversarial-gap-analysis.md`, the four definitional sites in `C005-dp-progression/` and
`C005-instructional-model/`, and — decisively —
**`validator/audit-graph-integrity.mjs:355-356`, where `uninstantiated` is *computed* from `LADDER`
and printed**, which is the mechanical evidence §3's third limb rests on and cannot go stale by
rewording.

> **For a future maintainer — the general lesson, which is not about this sentence.**
> **A line-wrapped claim is invisible to a line-based search.** The reachability of a claim by this
> discovery is a property of the text's **layout**, not only of its wording. A correct edit that
> happens to wrap a matched phrase silently removes that claim from the search's reach, and the
> search will then report the file as clean. When editing a claim this script is meant to find, keep
> the matched phrase on one line — and if the site count ever *falls* between two captures, treat it
> as a defect until proven otherwise, never as tidying.

### 8.3 The 60 changed occurrence counts — one class, one explanation

Every one of the 60 is the same shape: **a site that existed before and still exists, whose file was
edited by this slice's own treatment, so the number of lines matching that pattern moved.** No
changed count introduces or removes a classification; §5's rows govern all 60 unchanged. Rises are
the closure sentences, the `D-R4` row and the `AC-6-P` discharge note adding new matching lines;
falls are `PG-7e`'s retirement (`package-completeness-gate.mjs` L1-id1 15→13, L1-id3 2→1) and the
per-node markers the regeneration dropped.

**Two of the 60 are worth naming, because they are the mechanical evidence of the repair:**

- **`01_cross-reference-view.md` limb-2 `depth-literal`: 54 → 2.** Pre-treatment those 54 were
  26 × *"Declared `prerequisite_depth: N`; the graph, walked under…"* + 26 × *"Treat the declared
  depth as **advisory**"* + 2 lines of JS-materiality prose that match incidentally. Post-treatment
  **only the 2 incidental lines survive.** The 52 are gone **because nothing computed them** — the
  `depthBad` set is empty — exactly the property negative control C in §7 demonstrates. A closure
  achieved by deleting prose would not have produced this number.
- **`01_cross-reference-view.md` limb-1 `id1`: 289 → 184, while limb-2 `gate-value` rises 187 → 366
  and `stage-value` 370 → 537.** The fall is the 26 per-node `⚠ F-943-1` markers and their inventory
  flags vanishing; the rises are the corrected `F-943-3` sentence, now carrying `gate-a`/`gate-c`
  and `PS-1`/`PS-2/3/4` literals, re-emitted on all 179 blocks. Both movements come from the same
  single emitter edit, and neither was made by hand in the view.

### 8.4 `D-R4` restates no capture count — resolved, not deferred

A first pass at `D-R4` still carried two capture-keyed figures: it described the output file as
*"**4392 lines**, committed verbatim; run twice, `diff` empty"* and limb 3's reach as *"the
uninstantiated-gate claim (**49 sites**)"*. Both numbers were true **of the pre-treatment capture**,
which now lives under a different filename — correct figures attached to the wrong file. Worse, they
were the exact shape `D-R4` itself warns against: **a count hard-coded inside the tree the search
scans, which the search's own next run perturbs.**

**Both are removed.** `D-R4` now names the two captures **by their roles and carries no count at
all** — the post-treatment file as the one a reviewer reproduces by re-running the script, the
baseline file as the pre-treatment hit set at `94ddf22` that the slice classified and treated, and
the observation that a capture taken before the edits cannot be reproduced after them. Verified:
`grep -c '4392'` and `grep -c '(49 sites)'` over the ledger both return **0**.

**This record is therefore the single home for every capture count**, exactly as `D-R4` claims —
§1's two-column table is authoritative, and nothing in `docs/research/` competes with it. No
follow-up is outstanding.

`D-R4`'s one surviving quantitative claim about the search, *"**Limb 3 reached 10 files limb 1 did
not**"*, is **true of both captures** — verified, the two lists are identical file-for-file, and it
is a claim about the search's shape rather than about either capture's size.

### 8.5 A note for anyone grepping the artefacts for the retired escape clause

The escape clause that let an incomplete enumeration be shipped as a lower bound — the
*"…floor, not the …ceiling"* formula the three prior charter revisions leaned on — is **retired**.
It is **not restated anywhere in this record, in any form, operative or quoted.** That is
deliberate: this section does not reproduce the phrase verbatim, precisely so that a reviewer's
`grep` for it over the record returns **0** and means something. The same grep returns **0** for
`09_f-943-1-discovery.sh` and for `09_f-943-1-discovery-baseline-output.txt`.

**It returns 13 for `09_f-943-1-discovery-output.txt`, and that is expected rather than a
regression.** All 13 are the *same two lines* of
`docs/research/C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` — `:294`, and `D-R4` at
`:300` — reprinted once per limb-2/limb-3 pattern that matches those lines. In both places the
clause appears **only inside its own obituary**: the ledger quotes it in order to record that it is
retired and that re-running the script is now the check. It is cited as a dead thing, never invoked
as a live one.

**Provenance, measured:** the phrase occurs **nowhere** in `docs/research/` at base commit
`94ddf22` — it exists solely because this slice wrote the retirement notice. The post-treatment
capture, being verbatim, prints what the tree says. A capture that suppressed it would not be a
capture.
