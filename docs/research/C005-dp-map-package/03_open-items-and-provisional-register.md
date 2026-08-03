# 03 — Open Items: everything shipping `provisional` or `unresolved`

**Task:** NEU-944 (SUB-11) · **Package version:** `1.0.0` · **Compiled:** 2026-07-16

**This file is the honest half of the package.** `01_cross-reference-view.md` tells you what the map
says; **this file tells you what the map does not know.** Every row names an **owner** and a
**revision trigger**. Nothing here is smoothed, softened, or deferred to a follow-up that does not
exist.

> **This file SETS no status.** Status lives in exactly one place —
> `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`. This file is the **navigation
> index** onto that ledger, assembled so a cold agent does not have to reconstruct it from eight
> packages. Where this file and the ledger disagree, **the ledger wins.**

---

## 0. Read this first

A downstream curriculum-production agent consuming this package **must** be able to tell binding
decisions from open ones. So, plainly:

**The map's structure is SETTLED and you should trust it.** The graph is acyclic (187 nodes, 572
edges, 0 cycles). All 179 non-root chains reach the sanctioned floor with **0 unexplained jumps**.
All 8 skill types are instantiated. The 25 cross-cluster edges are audited and correct. **Sequence
from this graph and you will not go wrong.**

**The map's ANNOTATIONS are still not all binding, but the one outright defect is repaired.**
`progression_stage` and `prerequisite_depth` were wrong on 26 of 179 nodes (`F-943-1`, HIGH) and have
been re-derived over the edge-complete graph — **`F-943-1` is closed** (`D-R4`). What remains is
weaker but real: **the creator plausibility review never ran**, so no stage or difficulty value is
binding. **You may now sequence from the stage labels; you still may not treat them as reviewed.**

**The map has 10 known holes**, all owned, all in one class (`INC-C1`), none faked shut.

---

## 1. `F-943-1` — the defect that shipped open, now REPAIRED  🔴 HIGH · **closed**

**This was the single most important thing in this package, and it is kept first, in full, because a
map whose stage annotations were 26/179 wrong and not flagged would fail this package's own acceptance
gate** (OUT-9: a cold agent must *"tell binding decisions from open ones"*) — **and because a closure
that erases what was closed is no better than a defect that was never recorded.**

| | |
| --- | --- |
| **Finding** | NEU-940's `progression_stage` and `prerequisite_depth` were computed against the **pre-NEU-939 graph** — **before the cross-cluster edges existed**. |
| **Blast radius** | **26 of 179** `prerequisite_depth` values were wrong (153/179 correct). **6** dependencies (across 5 nodes) **ordered backwards by `progression_stage`**. |
| **What it meant** | **A downstream agent sequencing by `progression_stage` would have taught 6 dependencies before their own prerequisites.** |
| **Status** | **closed** — discharged by ledger entry **`D-R4`** |
| **Repair** | **NEU-954** re-ran NEU-940's depth-and-stage computation over the edge-complete graph: **26 depth corrections, 16 stage changes (all to `PS-4`), 1 `entry_gate` change** (`cl-3.bitmask-state-encoding`, `gate-a` → `gate-c`). **0 inversions remain; 179/179 depths agree with the graph.** Six residual `cl-4` values (the matrix-exponentiation family and SMAWK) were corrected with the rest, but their declared values matched **neither** the pre-939 nor the post-939 graph — NEU-954 records that residual cause as **`unestablished`**, and it stays recorded. |
| **Owner** | **NEU-940's owner** — the progression/difficulty dimension values (26 nodes, CL-3 + CL-4). **Discharged by NEU-954.** |
| **Revision trigger — FIRED** | **A re-run of NEU-940's depth-and-stage computation over the edge-complete (post-NEU-939) graph.** That re-run landed. `F-943-1` closes and the 26 nodes' dimension values are re-adjudicated in the ledger. **It did NOT carry `F-943-3` with it** — see §1.5: that forecast was a prediction, not a status, and the substance re-check contradicts it. |
| **Fix was OUT of this task's scope** | Producing any progression stage or difficulty value is explicitly out of scope for SUB-11. **This package bound the defect; it did not repair it.** Repairing it here would have been minting difficulty values under an assembly spec — the exact category error the charter's file-ownership rules exist to prevent. **The binding is what made the repair findable.** |

### 1.1 Why the evidence is decisive, not speculative

Three independent signatures, all reproduced by `../C005-dp-map-integrity/validator/audit-graph-integrity.mjs`
and re-reproduced by this package's own gate:

1. **Direction is unanimous — 26 under-report, `0` over-report.** A missing edge set can *only* shorten
   a longest-path computation. **Unanimity is the tell.** Noise, mapper error, or a rubric
   disagreement would scatter in both directions. This does not.
2. **The counterfactual reproduces the declared value on 20 of 26.** Recompute depth with the
   NEU-939 cross-cluster edges **removed** and 20 of the 26 declared values come back *exactly*. The
   remaining 6 are the transitive tail — nodes downstream of a directly-affected node.
3. **Isolation puts the defect entirely in the cross-cluster layer.** **293 intra-cluster edges → `0`
   inversions. 25 cross-cluster edges → `6`.** NEU-940's work is clean everywhere the pre-939 graph
   was complete, and defective exactly where it was not.

**No other cause fits all three.**

### 1.2 The cause, recorded honestly

**The orchestrator dispatched NEU-939 (cross-cluster edges) and NEU-940 (progression stages)
concurrently, because their FILE targets were disjoint — but their DATA was not.** NEU-940 read a
graph that NEU-939 had not finished drawing.

**The charter's own SUB-7 assumption is empirically false.** It states that progression *"does not
require the cross-cluster edges to be drawn first."* **It does.** This is recorded as a charter
finding, not as a mapper's error: **NEU-940 did nothing wrong** — it computed correctly against the
graph that existed when it ran.

**Generalised, for the parent program:** *file-disjointness is not data-disjointness.* Two tasks that
cannot collide in git can still collide in the graph. This is the same root cause as `INC-C1`'s
work-split seam (§3) in a different guise, and both are routed into `02_authoring-requirements.md`.

### 1.3 The 6 inversions, named — and as they read after the repair

| Dependent | Its stage as shipped | Requires | Prerequisite's stage | Its stage now |
| --- | --- | --- | --- | --- |
| `cl-3.bitmask-state-encoding` | `PS-1` | `cl-2.subset-sum-feasibility` | `PS-3` | **`PS-4`** ✅ |
| `cl-3.formulate-digit-dp` | `PS-2` | `cl-1.counting-dp-over-linear-domain` | `PS-4` | **`PS-4`** ✅ |
| `cl-3.formulate-automaton-dp` | `PS-2` | `cl-1.linear-sequence-dp-2d` | `PS-3` | **`PS-4`** ✅ |
| `cl-4.divide-and-conquer-optimization` | `PS-2` | `cl-1.sequence-partition-dp` | `PS-4` | **`PS-4`** ✅ |
| `cl-4.divide-and-conquer-optimization` | `PS-2` | `cl-2.formulate-interval-dp` | `PS-4` | **`PS-4`** ✅ |
| `cl-4.knuth-yao-optimization` | `PS-3` | `cl-2.formulate-interval-dp` | `PS-4` | **`PS-4`** ✅ |

**All six now order correctly.** The 26 depth-affected nodes carried an individual flag in
`01_cross-reference-view.md` until the repair; regenerating the view drops those flags, because
nothing computes them any more.

### 1.4 Consequences that are NOT separate defects

- **2 of the 5 OUT-6 representative paths (CL-3, CL-4) were structurally sound but inconsistent with
  NEU-940's stages.** The paths were correct; the stage labels along them were not. **OUT-6 passed
  5/5 throughout** — its criterion is grounding, not stage monotonicity. **After the repair all 5 are
  stage-consistent as well.**
- **`F-939-2` was the same blindness in a second annotation.** NEU-943 sharpened it:
  `cl-4.divide-and-conquer-optimization` was *also* an `F-943-1` inversion. **`F-939-2` and `F-943-1`
  were one root cause, surfaced by two audits.** The stage half is repaired; **`F-939-2`'s own
  cluster-prediction signal is untouched by that repair and stays open.**

### 1.5 `F-943-3` — `entry_gate` is redundant  🟡 Low · **unresolved**

**`F-943-3` did NOT close with `F-943-1`.** §1's revision trigger forecast that it would. **A forecast
is not a status**, and the substance re-check against the repaired map contradicts it: the redundancy
`F-943-3` reports is exactly what it was.

| | |
| --- | --- |
| **Finding** | `entry_gate` is a **deterministic function** of `progression_stage` — `PS-1`↔`gate-a` (×19), `PS-2/3/4`↔`gate-c` (×160), **zero exceptions**. It therefore carries **no independent information**. **`gate-b`, `gate-d` and `gate-e` are instantiated by no node.** |
| **Re-checked against the repaired map** | **Inheritance limb — DISCHARGED.** The stages are correct and NEU-954 re-derived every gate *from* them. **Determinism / redundancy limb — RE-MEASURED, STILL TRUE:** 0 exceptions over all 179. Re-deriving the gate *as* that function is precisely what leaves the redundancy intact. **Uninstantiated-gates limb — corrected:** the original text named B and D; measured, **three** gates are instantiated by no node. |
| **Status** | **unresolved** — the surviving limbs are the redundancy and the uninstantiated vocabulary · **Owner** NEU-940 / NEU-888 |
| **Revision trigger** | **`F-943-1`'s re-run no longer qualifies — it has landed and left the finding standing.** What remains: `entry_gate` is given independent content, **or** NEU-888's gate vocabulary is revised to earn `gate-b`, `gate-d` and `gate-e`, **or** the field is retired as derivable. |

---

## 2. The deferred creator progression review — **provisional, map-wide**

**OUT-9's acceptance scenario names this case explicitly, so it is named explicitly here.**

| | |
| --- | --- |
| **Decision** | Every progression stage and difficulty value NEU-940 applied to all **179** mapped nodes. |
| **Status** | **provisional** — recorded and usable, **NOT binding**. |
| **Why** | **Charter Assumption #11: the creator plausibility review did not run — the creator was unavailable in an unattended run.** Recorded per-node as `creator_review: "deferred-provisional"`, on all 179. |
| **Owner** | **The creator.** |
| **Revision trigger** | **The creator reviews the progression assignment for plausibility.** On review, each node's `creator_review` flips and the ledger re-adjudicates. **Until then no stage or difficulty value in this map is binding**, independently of `F-943-1`. |

**Two defects stacked on the same field.** A stage value was *(a)* unreviewed by its only qualified
reviewer **and** *(b)* on 26 nodes, computed against an incomplete graph. **(b) is repaired
(`F-943-1`, `D-R4`); (a) is not, and it was always the more durable of the two.** So
`02_authoring-requirements.md` now permits sequencing from the stage labels and still requires the
consumer to surface its reliance on them.

### 2.1 `PS-2`/`PS-3`/`PS-4` granularity — **UNGROUNDED against NEU-888**

| | |
| --- | --- |
| **Finding** | **NEU-940's own honest finding, preserved.** The `PS-2`/`PS-3`/`PS-4` split is **not grounded** in NEU-888's evidence. `PS-0`/`PS-1` and the `entry_gate` concept are; the upper-stage granularity is a **structural convenience**. Entry gates are restricted to **A and C** for the same reason. |
| **Status** | **provisional** · **Owner** NEU-940 / NEU-888 |
| **Revision trigger** | NEU-888 supplies evidence that discriminates the upper stages, **or** the creator review (§2) collapses or re-cuts them. |

---

## 3. `INC-C1` — the 10-instance CL-4 coverage gap  🔴 · **unresolved**

| | |
| --- | --- |
| **Decision** | **`D-C1` — the CL-4 work-split seam is a systematic gap class.** The gap class itself is **settled**; **who fills it is not.** |
| **Status** | **unresolved** (the remediation) · the **gap class** is **settled** (`D-C1`) |
| **Owner** | **`INC-C1` — the creator**, to commission a **CL-4 completion task**. |
| **Revision trigger** | The CL-4 completion task lands, **or** a further material CL-4-by-cascade technique is surfaced that is neither mapped nor listed — a **MINOR `scope_boundary` bump** per `RX-13`, **not** a partition finding. |

**The ten instances** — all **CL-4-by-cascade, in neither CL-4 half's enumerated scope, mapped by
nobody** (grep-verified across all 187 nodes: **zero** matching node ids):

1. **SOS DP** (sum-over-subsets / zeta–Möbius) — also `F-939-A`, gated on `INC-C2` (§4)
2. **LIS in O(n log n)**
3. **Bounded-knapsack binary splitting**
4. **Prefix-sum acceleration**
5. **Rolling-array compression**
6. **Hirschberg / bit-parallel edit distance**
7. **Small-to-large / DSU-on-tree**
8. **Segment-tree-accelerated digit/automaton transitions**
9. **Profile-hashing acceleration**
10. **Bitset / word-parallel** — also `F-939-B`

**This is NOT a partition finding.** Convention U1 already assigns all ten to CL-4 and **`D-F4` needs
no amendment**. The seam is in the **work split**, not the partition.

### 3.1 The root cause — and the rule that prevents it

**`D-F4`'s cascade assigns a technique to the CL-4 CLUSTER. CL-4's two mappers were scoped by
ENUMERATED LISTS. So a technique that is CL-4-by-cascade but in neither enumeration is owned by the
cluster and by no mapper.** It falls between two halves of one cluster.

**NEU-942's root cause, routed into `02_authoring-requirements.md` §6 as a binding rule:**

> **When a cluster is split for sizing, ONE HALF MUST BE THE RESIDUAL OWNER.**

This is the **work-split analogue of `D-F4`'s T4 residual** — the partition has a residual owner
precisely so nothing falls out of it, and **CL-4's work split lacked one**. **That single missing rule
produced all ten gaps.** NEU-942 recommends the completion task be scoped **by the cascade, not by an
enumeration** — rebuilding the enumeration would rebuild the seam.

**Predicted before it was found.** Three mappers called this in advance — mainstream `RX-2`, CL-2
`E3`, frontier `RX-13` — **and all three triggers fire exactly as written.** The seam was visible to
the people closest to it and was reported, not smoothed. **That is the discipline working.**

### 3.2 Do not "fix" the visible symptom

`cl-3.bitmask-state-encoding` declares `xc.…->cl-4.sos-dp`, and `cl-3.implement-bitmask-dp` declares
`xc.…->cl-4.bitset-word-parallel-optimization`. **Both targets do not exist.** NEU-939 reports them
unresolvable (`F-939-A`, `F-939-B`); NEU-943 re-verified across all 187 nodes by id, name **and**
summary — **zero matches, not a naming miss.**

**These are the SYMPTOM of `INC-C1`, not separate defects. DO NOT close them by deleting the
declaration.** The declaration is the map being honest about a hole. Deleting it would launder a
known gap into silence — and the map's floor audit passes **179/179 with 0 unexplained jumps**
precisely because nobody did that.

---

## 4. `INC-C2` — `D-F4a`: SOS DP, CL-4 vs CL-3  · **unresolved**

| | |
| --- | --- |
| **Decision** | **`D-C3` — the `D-F4a` cluster assignment of SOS DP is NOT flipped.** |
| **Status** | **unresolved** |
| **Owner** | **`INC-C2` — `D-F4`/`D-F4a`'s owner (NEU-932). A creator decision.** Routable by this task at reconciliation, **or** by NEU-936 filing the U4 challenge that `X-D1` has kept live and unfiled. |
| **Revision trigger** | `D-F4a` is adjudicated either way. **Until then `D-F4`'s assignment to CL-4 stands, per Convention U4.** |

**NEU-944 does not decide it either, and says why:** `D-F4a` lives in **NEU-932's** selection-decision
ledger, not the schema ledger this task drives. **Convention U4 forbids local re-decision.** A package
assembler re-deciding a partition entry it does not own is the same category error NEU-942 declined to
make on standing — and a worse defect than the gap it would close.

**⚠ This changes nothing about the coverage verdict. The gap ships SETTLED regardless of how `D-F4a`
goes — `INC-C2` only decides WHO FILLS IT.** `D-C2` explicitly does not wait on `D-C3`.

**The evidence NEU-942 offered `D-F4a`'s owner (a recommendation, not a decision), preserved:** `D-F4`
§3.1 orders T1 first because *"an optimization is parasitic on a base DP"* another cluster owns — **but
SOS DP is the only T1 member whose accelerated base (the naive 3ⁿ transition) is mapped nowhere and is
nobody's technique.** Every other T1 member (CHT, Knuth, D&C, matrix-exp, slope trick) accelerates a
mapped sibling-cluster base. **That asymmetry is real evidence for CL-3's live claim.**

---

## 5. `AR-1` — six open anchor requests · dependents **provisional**

**The assumed-knowledge boundary register (`D-S3`) is SETTLED at `register_version 1.0.0` and is NOT
asserted complete (`INC-S1`, open).** Six requests are filed and open. **Every dependent node below is
`provisional` for exactly this reason** — that is the AR-1 route's interim state working as designed.

| Request | Anchor requested | Filed by | Dependents | Status |
| --- | --- | --- | --- | --- |
| `AR-1-a/936` (= `AR-1/a`) | Aho–Corasick / string-matching automata | NEU-936 | `cl-3.formulate-automaton-dp`, `cl-3.implement-aho-corasick-dp` | **open** |
| `AR-1-b/936` (= `AR-1/b`) | Single-source shortest-path relaxation | NEU-936 | `cl-3.implement-steiner-tree-dp` | **open** |
| `AR-1-a/938` | Lagrangian duality | NEU-938 | `cl-4.lagrangian-relaxation-for-dp`, `cl-4.aliens-trick-application`, `cl-4.aliens-trick-convexity-proof` | **open** |
| `AR-1-b/938` | (min,+) convolution | NEU-938 | `cl-4.slope-trick-application`, `cl-4.slope-trick-convexity-preservation-proof`, `cl-4.slope-trick-on-trees` | **open** · **⚠ the one that could imply a MAJOR bump** |
| `AR-1-c/935` | Topological order / DAG traversal | NEU-935 | recorded in the depending CL-2 node's `notes` | **open** |
| `AR-1-d/935` | SCC condensation | NEU-935 | recorded in the depending CL-2 node's `notes` | **open** |

**Owner: `D-S3`'s owner** (NEU-933's decision, creator-adjudicated).
**Revision trigger:** each request is adjudicated. **Adjudicating any of the six MINOR-bumps the
register** (adding an anchor). **`AR-1-b/938` would MAJOR-bump it** *if* adjudicated by widening
`anchor.convex-hull-envelope-geometry`'s scope instead of adding an anchor — its filer flags this
explicitly and reserves the call to `D-S3`'s owner. A MAJOR bump shifts **every dependent's terminal
meaning**, which is why it is not made casually.

**The register was provably incomplete and was repaired by UNIONING, not replacing.** OUT-7 found
**7 AR-1/`D-S1a`-class claims across the map with only 2 in the ledger** — the rest lived in their
filers' node files. **No filer erred:** each was blocked by the schema's own sole-writer rule and each
recorded the request in-file with its dependent marked `provisional`, exactly as route AR-1 requires.
NEU-942 discharged the backlog by **addition only**. **NEU-944 has done the same** (§8).

**Never invent an anchor, fake a root edge, declare it cross-cluster, or drop it.** All four are
forbidden by route AR-1, and the floor audit's `0 of 223 faked root edges` / `0 of 31 invented anchors`
is the evidence that nobody did.

### 5.1 `CV-32` — the AR-1 id collision · **RESOLVED by NEU-944** ✅

NEU-936 minted `AR-1/a`, `AR-1/b`; NEU-938 independently minted `AR-1-a`, `AR-1-b` — four distinct
requests under two label pairs differing **only by `/` vs `-`**. **Neither mapper erred: route `AR-1`
named no id-minting convention.** NEU-942 recorded the collision, qualified the requests by filer, and
routed the convention fix to **SUB-11 (`INC-C4`)**.

**NEU-944 discharges `INC-C4`.** The convention is now fixed and recorded in the ledger (§8):

> **`AR-1-<letter>/<filer>`** — the filer suffix is **mandatory** and disambiguates. Both original
> label pairs are **preserved as aliases**, never renamed.

**Renaming was rejected:** map nodes cite these ids **verbatim in their `notes`**, so a rename would
turn every citing note into a false claim. **The collision is resolved by ADDING a convention, not by
rewriting history.**

### 5.2 `EXC-11` / `D-S1a` — **RESOLVED, verified not re-broken** ✅

`D-S1a` count = **1** (`D-S1a-1`, `cl-1.derive-recurrence-routine`, S7-vs-S5 typing). **`D-S1`'s
cascade-revision threshold is `>10`, so it does NOT fire.** **NEU-944 re-verified this against the
ledger** (§8, gate check `PG-9`) and confirms `EXC-11` remains resolved: SUB-9 and any later consumer
**may count `D-S1a` entries from the ledger alone**.

**`D-S1a-1`'s own trigger is discharged and recorded:** its filer wrote that if the eight-type audit
found `procedural`'s only instances to be this node plus two others *and judged the drill S5*, it
should be re-typed. **NEU-943's audit found `procedural` instantiated by 9 non-root nodes across all
four clusters** — so **union-completeness does not depend on this node's disposition**, exactly as its
filer predicted. The entry stays **open** (the typing question is real); the *risk* it named is gone.

---

## 6. `CAP-2` — problem-level citations are unverified · **provisional**, non-closable here

| | |
| --- | --- |
| **Cap** | **Codeforces returned HTTP 403.** Problem-level ids could not be verified. **All `corpus_refs` in the map are CORPUS-LEVEL ONLY.** |
| **Status** | **provisional** (inherited from NEU-932) · **Owner** the creator / a later corpus-licensing pass |
| **Revision trigger** | Corpus access is obtained and problem-level ids are verified against the live corpus. |

**🔴 INVENT NO PROBLEM-LEVEL CITATION.** This is not a style note — it is a recorded incident. **Two
mappers invented problem-level citations from memory and withdrew them.** They traced the cause to
**the schema template's own `"C1:1635"` illustration**, which invited a claim the corpus access could
not support. **Flagged for `D-F2`/`D-S1`.** The withdrawals (`EXC-1`, `E0`) are **upheld, not
reversed**, and NEU-942's `AC-8-C` confirms **no C4 problem id is asserted anywhere in the map.**

**For a downstream authoring agent this is binding:** you may cite a corpus. **You may not cite a
problem id from this map, because the map does not contain a verified one.** See
`02_authoring-requirements.md` §5.

---

## 7. Inherited caps that do not close here

| Id | Cap | Status | Owner | Revision trigger |
| --- | --- | --- | --- | --- |
| **`R1` / `X-D3`** | **The DP-transfer gap. No selected corpus is ordered by *learning* dependency. Nothing in C005 measures DP learning.** **Non-downgradable High.** | **provisional** — **carried undiminished** | NEU-887 / the creator | A study or an operational measurement establishes DP-transfer effectiveness. **Nothing in this charter can close it.** |
| **`JS-U1`** | The `JS-E1` recursion-cap hazard's **natural home is a frozen root** (`cl-1.root.implement-memoization-and-tabulation`) **which NEU-941 may not write.** Routed to the schema ledger rather than forced onto a root. | **unresolved** | `D-S2`'s owner | A root-block amendment is sanctioned. |
| **`JS-U2`** | **Every JS performance verdict is DIRECTIONAL, never quantified.** No benchmark was run. | **provisional** | NEU-941 / a later benchmarking pass | Benchmarks are run against real JS implementations. |
| **`JS-U3`** | **The two `INC-C1` gaps (SOS DP, bitset/word-parallel) are exactly where JS materiality would be HIGHEST — and those nodes do not exist to assess.** `JS-E4` (32-bit bitwise) is the single most material effect for both. | **unresolved** | `INC-C1` (creator) | The CL-4 completion task mints the nodes; NEU-941's rule `1.0.0` is then applied to them. |
| **`JS-U5`** | Residual JS uncertainty carried by NEU-941. | **provisional** | NEU-941 | Per NEU-941 `03_caps-and-uncertainties.md`. |
| **`F-943-2`** | `conceptual` **is** union-complete but rests on **ONE non-root node** (`cl-1.judge-dp-applicability`); its other 2 instances are frozen roots. Absent from CL-2/3/4. **Fragility is REPORTED, not a FAIL** — union-completeness is the criterion, not spread. | **open** (Low) | the charter / a criterion decision | The charter decides whether spread, not just instantiation, is required. |
| **`F-939-1`** | Resolving a *shape* request to CL-1's family-level node is correct; the **altitude reservation is upheld as open**. Both readings ground cleanly, so **structure cannot discriminate — it is a pedagogical call.** | **open** (Low) | NEU-939 / a pedagogical call | A repointing, **never a re-mapping**. |
| **`INC-S1`** | The boundary register is **not asserted complete** over the technique space. | **open** | the mappers, via `AR-1` | §5's requests are adjudicated. Completeness stays unprovable while `INC-D3` stands. |
| **`X-S1`** | **`D-S4` refines NEU-932's rule 4** — root edges are **drawn**, not routed through SUB-12. **Carried, not settled-by-silence.** The honest cost is live: **an audit classifying edges by ENDPOINT SPAN will report root edges as false-positive missing cross-cluster edges.** | **carried** | NEU-932's author, via a `D-S4` challenge | NEU-932's author or an audit rejects the refinement. |
| **`X-D2`** | **Naming instability across references** — the same technique carries different names by tradition. The schema's `aliases` field is a **mitigation, not a resolution**. | **carried** | — | — |

**⚠ `X-S1` is operationally binding on any tool that reads this map: CLASSIFY EDGES BY FIELD, NEVER BY
ENDPOINT SPAN.** NEU-943's validator does exactly this, and `manifest.yaml`'s `edge_disposition` block
exists to make it possible. An audit that classifies by span will report **223 false positives**.

---

## 8. What NEU-944 changed in the ledger — **UNIONED, never replaced**

**NEU-944 added rows. It deleted, renamed and rewrote nothing.**

**Why this rule is absolute:** map nodes cite ledger ids **verbatim in their `notes`** (e.g. *"AR-1/a
ANCHOR REQUEST IN FLIGHT — THIS IS INC-S1"*). **A ledger that dropped or renamed a row would turn those
notes into false claims.** NEU-942 established the rule when it repaired the register by unioning;
NEU-943 restated it; NEU-944 follows it.

| Ledger addition | What it does | Kind |
| --- | --- | --- |
| **`D-P1`** | Binds the assembled package itself — the cross-reference view, the authoring requirements, the gate, the dry-run. | **new row** (settled) |
| **`D-P2`** | Records `F-943-1` as an **unresolved** element of the shipped map with owner + revision trigger. **Does not repair it.** **Its trigger has since fired — `D-R4` discharges it as to `F-943-1`.** | **new row** (unresolved → discharged by **`D-R4`**) |
| **`D-P3`** | Records the **deferred creator progression review** as **provisional**, map-wide, per Assumption #11. | **new row** (provisional) |
| **`D-P4`** | **`INC-C4` discharged** — fixes the `AR-1` id convention to `AR-1-<letter>/<filer>`, **preserving both original label pairs as aliases**. | **new row** (settled) |
| **`INC-C6` disposition** | Records what NEU-944 did and did **not** build of the deferred validator/index generator. | **new marker row** |
| **`INC-C7`** | Records that **node-level `coverage.status` is `unaudited` on all 179** and why — reported, not invented. | **new marker row** |
| **§7.2 self-check** | NEU-944's own acceptance checks. | **new subsection** |

**Nothing in `D-S1`…`D-S5`, `D-S1a`, `D-C1`…`D-C4`, §3.1, §3.1a, §3.2, §3.3, §5, or §7.1 was
modified.** Verified by the package-completeness gate (`PG-10`) and by `git diff` — the ledger diff is
**additions only**.

---

## 9. The complete provisional/unresolved manifest — nothing below is binding

**If you are a downstream agent and you rely on ANY row in this table, you must surface that
reliance.** That is NEU-887's status discipline, inherited. **One row is retained after closing** —
`F-943-1`, marked **closed** with its discharging ledger entry — because a manifest that deletes what
it once carried cannot be checked against the record that carried it.

| Element | Status | Owner | Revision trigger |
| --- | --- | --- | --- |
| **`F-943-1`** — 26/179 depths wrong, 6 stage inversions | **closed** — discharged by **`D-R4`** | NEU-940's owner → **repaired by NEU-954** | **Fired.** The re-run over the edge-complete graph landed: 26 depth corrections, 16 stage changes, 1 `entry_gate` change, 0 inversions remaining |
| **`F-943-3`** — `entry_gate` redundant (`gate-b`/`gate-d`/`gate-e` uninstantiated) | **unresolved** | NEU-940 / NEU-888 | **Not `F-943-1`'s re-run — that landed and left this standing.** `entry_gate` gains independent content, NEU-888 revises the gate vocabulary, or the field is retired |
| **Deferred creator progression review** — all 179 nodes | **provisional** | **the creator** | **The creator reviews progression plausibility (Assumption #11)** |
| **`PS-2`/`PS-3`/`PS-4` granularity** — ungrounded vs NEU-888 | **provisional** | NEU-940 / NEU-888 | NEU-888 supplies discriminating evidence, or the creator re-cuts the stages |
| **`INC-C1`** — the 10-instance CL-4 gap class | **unresolved** | **the creator** — commission a CL-4 completion task, **scoped by the cascade, not an enumeration** | The completion task lands, or a further CL-4-by-cascade technique surfaces (MINOR `scope_boundary` bump) |
| **`INC-C2`** — `D-F4a`: SOS DP CL-4 vs CL-3 | **unresolved** | **NEU-932** (`D-F4a`'s owner), a creator decision | `D-F4a` adjudicated either way. **Coverage verdict identical either way** |
| **`AR-1-a/936`** Aho–Corasick | **open** → dependents **provisional** | `D-S3`'s owner | Request adjudicated (MINOR bump) |
| **`AR-1-b/936`** shortest-path relaxation | **open** → dependents **provisional** | `D-S3`'s owner | Request adjudicated (MINOR bump) |
| **`AR-1-a/938`** Lagrangian duality | **open** → dependents **provisional** | `D-S3`'s owner | Request adjudicated (MINOR bump) |
| **`AR-1-b/938`** (min,+) convolution | **open** → dependents **provisional** | `D-S3`'s owner | Request adjudicated. **MAJOR bump if resolved by widening an existing anchor** |
| **`AR-1-c/935`** topological order | **open** → dependents **provisional** | `D-S3`'s owner | Request adjudicated (MINOR bump) |
| **`AR-1-d/935`** SCC condensation | **open** → dependents **provisional** | `D-S3`'s owner | Request adjudicated (MINOR bump) |
| **`D-S1a-1`** — `cl-1.derive-recurrence-routine` S7-vs-S5 | **open** → node **provisional** | SUB-3/4/5/6/13 | The eight-type audit judges the drill S5. **Union-completeness does not depend on it** |
| **`CAP-2`** — problem-level ids unverified | **provisional** | creator / corpus-licensing pass | Corpus access obtained and ids verified |
| **`R1` / `X-D3`** — DP-transfer effectiveness | **provisional**, **non-downgradable** | NEU-887 / creator | **Nothing in this charter can close it** |
| **`JS-U1`** — hazard's home is a frozen root | **unresolved** | `D-S2`'s owner | Root-block amendment sanctioned |
| **`JS-U2`** — performance verdicts directional only | **provisional** | NEU-941 | Benchmarks run |
| **`JS-U3`** — the gaps are where JS matters most | **unresolved** | `INC-C1` (creator) | Completion task mints the nodes |
| **`JS-U5`** — residual JS uncertainty | **provisional** | NEU-941 | Per NEU-941 `03` |
| **`F-943-2`** — `conceptual` rests on 1 non-root node | **open** (Low) | charter | Charter decides if spread is a criterion |
| **`F-939-1`** — altitude reservation | **open** (Low) | NEU-939 | A pedagogical call; a repointing, never a re-mapping |
| **`INC-S1`** — register not asserted complete | **open** | mappers via `AR-1` | §5 adjudicated; unprovable while `INC-D3` stands |
| **`INC-C7`** — node-level coverage `unaudited` ×179 | **open** | NEU-942's route / a later pass | A node-level coverage write-back is commissioned |
| **`X-S1`** — `D-S4` vs NEU-932 rule 4 | **carried** | NEU-932's author | A `D-S4` challenge |
| **`X-D1`** — SOS DP CL-4 vs CL-3 (the conflict) | **carried undiminished** | — | Tracked as `INC-C2` |
| **`X-D2`** — naming instability | **carried** | — | — |

**`INC-D1` is SUPERSEDED.** NEU-932's dry-run was a **desk-check, not a real cold-agent handoff**, and
said so. **`05_cold-context-dry-run.md` is the real one**, and it discharges `INC-D1`.

---

## 10. What is SETTLED — consume these without re-deriving

**So the open list above is not mistaken for the whole picture.** Each of these is adjudicated on
correctly-classed evidence and is **binding**:

| Element | Evidence |
| --- | --- |
| **The graph is ACYCLIC** — 187 nodes, 572 edges, **0 cycles** | NEU-943, validator-reproduced |
| **179/179 chains reach the sanctioned floor — 0 unexplained jumps** | NEU-943 |
| **0 of 223 faked root edges · 0 of 31 invented anchors** | NEU-943 — the laundering probes are clean |
| **All 8 skill types instantiated** (112 skill nodes) | NEU-943 — union-completeness **holds** |
| **OUT-6: 5/5 paths** — one per each of the **4** clusters + research-tier, all grounded | NEU-943; counted against `len(clusters)` = **4** |
| **The research-tier chain verified hop-by-hop** | NEU-938 / NEU-943 |
| **The 25 cross-cluster edges are correct** | NEU-939 / NEU-943 |
| **179/179 nodes JS-assessed** — 47 material, 132 neutral, 19 blocking | NEU-941, `rule_version 1.0.0` |
| **30 coverage disagreements adjudicated — ZERO smoothed** | NEU-942 |
| **52 residual exclusions consolidated — none without a rationale** | NEU-942 |
| **`D-S1`…`D-S5`** — schema, roots, boundary register, root-edge disposition, register extension | NEU-933 |
| **`D-F4`** — the four-cluster partition + cascade | NEU-932 |
| **`D-C1`** (the gap class), **`D-C2`** (SOS is a gap), **`D-C4`** (centroid decomposition excluded) | NEU-942 |
| **The `AR-1` id convention** (`D-P4`) | NEU-944, this task |

**`CL-4 IS ONE CLUSTER ACROSS TWO FILES.` Count `len(clusters)` = 4. Never count node files — that
number is 5 and it is not the cluster count.**
