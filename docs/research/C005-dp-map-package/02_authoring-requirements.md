# 02 — Authoring Requirements (OUT-8)

**Task:** NEU-944 (SUB-11) · **Spec version:** `1.0.0` · **Compiled:** 2026-07-16
**Consumers:** **SUB-4 of the parent program** and **later curriculum-production charters**.

---

## 0. What this spec is, and what it is NOT

**This spec states the REQUIREMENTS a curriculum-production charter must author against. It authors no
curriculum.**

**Explicitly NOT built here, by scope:**

| Not built | Routed to |
| --- | --- |
| **Lessons** — no lesson, outline, script, or worked example | later curriculum-production charters |
| **Problems** — no problem, exercise, test case, or solution | later curriculum-production charters |
| **A graph editor** | later curriculum-production charters |
| **An exercise runner** | later curriculum-production charters |
| Final problem-license selection | later charters |
| Detailed content templates and quality gates | later charters |

**Nothing in this package is a course.** It is the **map** a course is authored against, plus the
**rules** that authoring must obey.

**This spec creates no node, edge, stage, difficulty value, materiality finding, integrity finding or
coverage verdict.** Every requirement below is a **constraint derived from an inherited, adjudicated
result**, and cites the result it derives from.

---

## 1. The prime directive

> **Author against the GRAPH. The STAGE LABELS now agree with it — they are still not binding.**

**This started as a defect workaround with a named owner.** `F-943-1` (HIGH) meant **26 of 179
`prerequisite_depth` values were wrong** and **6 dependencies ordered backwards by
`progression_stage`**. **NEU-954 re-derived both fields over the edge-complete graph and `F-943-1` is
CLOSED** (ledger `D-R4`) — 26 depth corrections, 16 stage changes, 1 `entry_gate` change, **0
inversions remaining**. NEU-943's consumer instruction (`05` §5), as it now reads:

> *"Trust the edges, and you may now trust `progression_stage` across a cluster boundary too. The 25
> cross-cluster edges are audited and correct, and the 6 stages that were inverted across them were
> re-derived — 0 inversions remain. The graph's topological order is still the authority where the
> two could ever disagree."*

**The graph supports this.** It is **acyclic** (187 nodes, 572 edges, 0 cycles), so **a topological
order exists and is computable**. `../C005-dp-map-integrity/validator/audit-graph-integrity.mjs`
re-derives `prerequisite_depth` from source; **it now agrees with the declared field on all 179, and
re-running it is the check after any edge change.**

**The directive has therefore relaxed, but only on the defect axis** — **the stages remain
`provisional`**, because the creator review never ran (§4.3). **Re-read
`03_open-items-and-provisional-register.md` before relying on any stage.**

---

## 2. Required coverage

### 2.1 The authoring surface

| | Count | Requirement |
| --- | ---: | --- |
| **Mapped technique nodes** | **179** | Every node in `01_cross-reference-view.md` is **in the authoring surface**. |
| **Frozen roots** | **8** | **Assumed, never authored as new content.** They are the DP first principles and the terminal floor (`D-S2`). A curriculum may *teach* them; it may **not re-decide or re-decompose** them. |
| **Registered boundary anchors** | **5** | **ASSUMED KNOWLEDGE — OUT OF SCOPE FOR AUTHORING.** `anchor.segment-tree`, `anchor.li-chao-tree`, `anchor.convex-hull-envelope-geometry`, `anchor.modular-arithmetic`, `anchor.linear-algebra`. **Named and versioned, never decomposed** (`register_version 1.0.0`). A chain terminating here has terminated **legitimately**. |
| **Known unmapped gaps** | **10** | **`INC-C1`. DO NOT AUTHOR THESE — THEY HAVE NO NODES.** See §2.3. |

**Below the floor** — NEU-887's elementary-data-structures floor — is **out of scope for this charter
and for any curriculum authored from it.**

### 2.2 Coverage is required over all four clusters

**A curriculum authored from this map MUST cover all four clusters.** `CL-4 IS ONE CLUSTER ACROSS TWO
FILES` — count `len(clusters)` = **4**, never node files (**5**, and it is not the cluster count).

| Cluster | Defining contribution |
| --- | --- |
| **CL-1** Foundational / linear-sequence | State is a plain index tuple over a linear/rectangular domain; the difficulty **is the recurrence**. The partition's **confident residual** — never the indeterminate sink. |
| **CL-2** Combinatorial / structural | State indexed over a nontrivial combinatorial structure — **the structure, not the encoding**, is what makes it hard. |
| **CL-3** State-compression / specialized-domain | A **non-tuple state encoding**, or bound to a specialized domain. The **indeterminate sink** of Convention U2. |
| **CL-4** DP-optimization (mainstream + research-tier frontier, **jointly**) | Reducing the cost of evaluating an **already-correct** recurrence — the recurrence is given; the contribution is making it **affordable**. |

**Skill-type coverage: all 8 types are instantiated and MUST remain reachable** — `conceptual`,
`procedural`, `strategic`, `implementation`, `proof`, `debugging`, `optimization`, `transfer`
(NEU-943, union-complete).

**⚠ `F-943-2`, binding on curriculum design:** `conceptual` is union-complete but **rests on ONE
non-root node** — `cl-1.judge-dp-applicability`. Its only other instances are frozen roots, and it is
**absent from CL-2, CL-3 and CL-4 entirely**. **A curriculum that skips that single node teaches zero
non-root `conceptual` skill.** Whether spread (not just instantiation) is required is **an open
criterion question for the charter**, not a repair.

### 2.3 The 10 gaps — do not author, do not invent

**`INC-C1` (unresolved, creator-owned).** These techniques are **CL-4-by-cascade, in neither CL-4
half's enumerated scope, and mapped by nobody**:

**SOS DP · LIS O(n log n) · bounded-knapsack binary splitting · prefix-sum acceleration ·
rolling-array compression · Hirschberg/bit-parallel edit distance · small-to-large/DSU-on-tree ·
segment-tree-accelerated transitions · profile-hashing · bitset/word-parallel**

**Requirements:**

1. **DO NOT author content for them.** They have **no nodes**, therefore no prerequisites, no stage,
   no difficulty, no assessed JS materiality. **Authoring against a node that does not exist means
   inventing all of it.**
2. **DO NOT mint the nodes yourself.** They are owned by a **CL-4 completion task** the creator must
   commission. **Scope it BY THE CASCADE, NOT BY AN ENUMERATION** (§6).
3. **DO NOT delete the two dangling declarations** (`F-939-A` `cl-4.sos-dp`, `F-939-B`
   `cl-4.bitset-word-parallel-optimization`). They are the map **being honest about a hole**. Deleting
   them launders a known gap into silence.
4. **Five of the ten are canon** (carried by T1/T2/T3, exercised in C1/C2/C4). **A curriculum shipped
   without them is materially incomplete, and must say so** rather than imply coverage it lacks.

**⚠ `JS-U3`:** these gaps are **exactly where JavaScript materiality would be highest** — `JS-E4`
(32-bit bitwise) is the most material effect for both SOS DP and bitset/word-parallel — **and the
nodes do not exist to assess.** The JS audit's coverage is complete over what exists and **structurally
blind to what does not.**

---

## 3. Sequencing and prerequisite constraints

### 3.1 The binding rules

| # | Rule | Basis |
| --- | --- | --- |
| **S1** | **Never teach a node before every one of its prerequisites.** All four prerequisite fields bind equally: `intra_cluster`, `roots`, `boundary_anchors`, and the **realized cross-cluster edges**. | The graph; `D-S1` |
| **S2** | **Derive order from a TOPOLOGICAL SORT of the graph.** `progression_stage` now agrees with it on every edge, but the sort is the authority and the stages remain `provisional`. | **`F-943-1`** (closed, `D-R4`); NEU-943 `05` §5 |
| **S3** | **Classify edges BY FIELD, never by endpoint span.** Root edges carry `cl-1.` ids and *look* cross-cluster under a naive endpoint test; they are **not**. An audit classifying by span reports **223 false positives**. `manifest.yaml`'s `edge_disposition` block exists for exactly this. | **`D-S4` / `X-S1`** |
| **S4** | **A `boundary_anchor` terminal is a SANCTIONED STOP, not a gap and not a to-do.** Do not author the anchor's content; do not decompose it. **Assume it.** | `D-S3` |
| **S5** | **A root is a terminal.** Chains bottom out on a root **or** a registered anchor. **Anything else that bottoms out is an unexplained jump** — and there are **0 of them** in this map (179/179). If you create one, you have broken the map. | `D-S2`; NEU-943 floor audit |
| **S6** | **Never fake a terminal.** Do not launder a real dependency into a root edge or an anchor edge to make a chain bottom out. **This is the single failure the floor audit exists to catch** — and the map is clean (**0 of 223** faked root edges, **0 of 31** invented anchors). |
| **S7** | **A prerequisite edge is a STRUCTURAL claim, not a validated LEARNING claim.** See §3.3 — this is non-negotiable and non-downgradable. | **`R1` / `X-D3`** |
| **S8** | **Need a non-DP prerequisite with no registered anchor? File `AR-1`. Never invent an anchor**, fake a root edge, declare it cross-cluster, or drop it. | Route `AR-1` |

### 3.2 The 6 known-bad orderings — REPAIRED

**These 6 came out backwards if you sequenced by `progression_stage`.** Kept, with the repaired
values, so no downstream agent rediscovers them the hard way and so the closure can be checked:

| Dependent (stage as shipped) | Requires (stage) | Dependent's stage now |
| --- | --- | --- |
| `cl-3.bitmask-state-encoding` (`PS-1`) | `cl-2.subset-sum-feasibility` (`PS-3`) | **`PS-4`** ✅ |
| `cl-3.formulate-digit-dp` (`PS-2`) | `cl-1.counting-dp-over-linear-domain` (`PS-4`) | **`PS-4`** ✅ |
| `cl-3.formulate-automaton-dp` (`PS-2`) | `cl-1.linear-sequence-dp-2d` (`PS-3`) | **`PS-4`** ✅ |
| `cl-4.divide-and-conquer-optimization` (`PS-2`) | `cl-1.sequence-partition-dp` (`PS-4`) | **`PS-4`** ✅ |
| `cl-4.divide-and-conquer-optimization` (`PS-2`) | `cl-2.formulate-interval-dp` (`PS-4`) | **`PS-4`** ✅ |
| `cl-4.knuth-yao-optimization` (`PS-3`) | `cl-2.formulate-interval-dp` (`PS-4`) | **`PS-4`** ✅ |

**All 6 were cross-cluster. All 293 intra-cluster edges were clean.** A curriculum that never crosses
a cluster boundary would never have hit this — which is exactly why the defect survived to here.
**All 6 now order correctly** (`F-943-1` closed, `D-R4`).

### 3.3 🔴 The transfer constraint — `R1`, non-downgradable

> **A prerequisite edge in this map is a claim about the STRUCTURE of the mathematics. It is NOT a
> validated claim about the ORDER IN WHICH A HUMAN LEARNS BEST.**

**Nothing in C005 measures DP learning.** No selected corpus is ordered by *learning* dependency.
**`R1` is carried undiminished at non-downgradable High, and nothing in this charter can close it.**

**Binding on authoring:**

- **The graph order is NOT presented as measured for DP.** Do not claim, imply, or market it as a
  validated learning sequence.
- **Do not import any corpus's ordering as a prerequisite claim.** `coverage.corpus_refs` is a
  **reference**, never evidence of a prerequisite.
- **A curriculum relying on the graph order as a pedagogical sequence MUST surface that reliance** as
  a provisional assumption with `R1` named.

**The graph is the best available structural scaffold and it is honest about being only that.**

---

## 4. Difficulty-calibration inputs

### 4.1 The dimension set — `dimension_set_version 1.0.0`

Applied to all **179** non-root nodes; **one key-set map-wide, zero key drift** (NEU-943-verified).
Roots carry `{}` **by design** (frozen, `DR-S02`).

| Dimension | What it is | Trust |
| --- | --- | --- |
| `progression_stage` | `PS-0`…`PS-4` | ⚠ **`F-943-1` CLOSED (`D-R4`) — the 6 bad orderings are repaired. `PS-2/3/4` granularity still UNGROUNDED. Still `provisional`.** |
| `entry_gate` | `gate-a` / `gate-c` | ⚠ **`F-943-3` (still open): a deterministic function of `progression_stage` — NO independent information. `gate-b`, `gate-d` and `gate-e` instantiated by no node.** |
| `prerequisite_depth` | Longest DP-technique path back to the floor | ✅ **`F-943-1` CLOSED — all 179 agree with the graph. Still a pure function of the graph, so recomputing it is always valid.** |
| `state_formulation_load` | Cost of formulating the state | `provisional` (creator review deferred) |
| `transition_derivation_load` | Cost of deriving the transition | `provisional` |
| `proof_obligation_load` | Weight of the correctness obligation | `provisional` |
| `implementation_load` | Cost of getting it correct in code | `provisional` |
| `recognition_load` | Cost of recognizing the technique applies | `provisional` |
| `creator_review` | `"deferred-provisional"` on **all 179** | **The review never ran.** See §4.3. |

### 4.2 How to consume them

1. **`prerequisite_depth`: readable, and still recomputable.** It is a **pure function of the graph**,
   NEU-943's validator re-derives it, and since `F-943-1`'s repair the declared field agrees with the
   derivation on **all 179**. Re-derive after any edge change.
2. **The five load dimensions are the usable calibration signal** — but they are **`provisional`**
   (§4.3) and were **not** implicated in `F-943-1`, which touched only the two graph-derived fields.
3. **`entry_gate` adds nothing.** Derive it from the stage or ignore it (`F-943-3`).
4. **Difficulty is NOT a learning-time estimate.** No dimension is calibrated against learner outcome
   data. **Nothing in C005 measures DP learning** (`R1`).

### 4.3 🔴 Every difficulty value is provisional — the creator review never ran

**Charter Assumption #11: the creator plausibility review was DEFERRED because the creator was
unavailable in an unattended run.** Recorded per-node as `creator_review: "deferred-provisional"` on
**all 179**.

| | |
| --- | --- |
| **Status** | **provisional** — recorded and usable, **NOT binding** |
| **Owner** | **the creator** |
| **Revision trigger** | **The creator reviews the progression assignment for plausibility.** |

**A curriculum charter calibrating against these values MUST surface that reliance.** This is
**independent of `F-943-1`** — the re-run has landed, and the values remain unreviewed until the
creator reviews them. **Two defects stacked on the same field; the repair cleared one and this is the
one that is left.**

---

## 5. Citation and evidence requirements

| # | Rule | Basis |
| --- | --- | --- |
| **C1** | **🔴 INVENT NO PROBLEM-LEVEL CITATION.** Codeforces 403'd; **all `corpus_refs` are CORPUS-LEVEL ONLY** and problem-level ids are **unverified**. | **`CAP-2`** |
| **C2** | **This is a recorded incident, not a style note.** **Two mappers invented problem-level citations from memory and withdrew them**, tracing the cause to **the schema template's own `"C1:1635"` illustration**, which invited an unsupportable claim. **A template that shows a fabricable example invites fabrication** — do not repeat the pattern in curriculum templates. | `EXC-1`, `E0`, flagged for `D-F2`/`D-S1` |
| **C3** | **You may cite a corpus. You may not cite a problem id from this map** — the map contains no verified one. Sourcing problems is a **later charter's** job, with real corpus access. | `CAP-2` |
| **C4** | **Class evidence correctly.** NEU-887's taxonomy is inherited, not re-derived. **No class-1–6 evidence may be presented as class 7.** | `D-S5` |
| **C5** | **Do not present a JS performance verdict as measured.** **Every one is DIRECTIONAL, never quantified** — no benchmark was run. | **`JS-U2`** |

---

## 6. Work-decomposition requirements — the rule that would have prevented `INC-C1`

**Binding on any charter that splits this map's work.** Both rules below are **derived from defects
this charter actually produced**, not from theory.

### 6.1 🔴 One half must be the residual owner

> **WHEN A CLUSTER IS SPLIT FOR SIZING, ONE HALF MUST BE THE RESIDUAL OWNER.**

**This is the work-split analogue of `D-F4`'s T4 residual.** The *partition* has a residual owner
precisely so that nothing falls out of it. **CL-4's WORK SPLIT lacked one — and that single missing
rule produced all 10 gaps of `INC-C1`.**

**The mechanism, exactly:** `D-F4`'s cascade assigns a technique to the **CL-4 cluster**. CL-4's two
mappers were scoped by **enumerated lists**. **A technique that is CL-4-by-cascade but in neither
enumeration is owned by the cluster and by no mapper.**

**Corollaries:**

- **Scope a completion or remediation task BY THE CASCADE, NOT BY AN ENUMERATION.** Re-enumerating
  rebuilds the seam. (NEU-942's explicit recommendation for the `INC-C1` task.)
- **A work split is not a partition split.** It changes **who writes**, never **what exists**.
  `cluster_count` stays **4**.
- **Give every split half a residual clause**: *"…and any member of this cluster not enumerated
  above."*

### 6.2 🔴 File-disjointness is not data-disjointness

> **TWO TASKS THAT CANNOT COLLIDE IN GIT CAN STILL COLLIDE IN THE GRAPH.**

**This is `F-943-1`'s root cause.** The orchestrator dispatched NEU-939 (edges) and NEU-940 (stages)
**concurrently because their FILE targets were disjoint** — but their **DATA** was not. NEU-940
computed against a graph NEU-939 had not finished drawing. **The charter's own SUB-7 assumption —
*"progression … does not require the cross-cluster edges to be drawn first"* — is EMPIRICALLY FALSE.**

**Corollaries:**

- **A task that DERIVES values from the graph must run AFTER the graph is edge-complete.** Sequence on
  the **data dependency**, not the file map.
- **A derived annotation must record the graph version it was derived from**, so staleness is
  detectable rather than silent. **`F-943-1` was invisible for two sub-tasks precisely because no such
  record existed.**

---

## 7. Status discipline — inherited, binding, not re-derived

| Status | What an authoring agent must do |
| --- | --- |
| **settled** | **Consume it. Do not re-derive it.** Change requires a ledger entry. |
| **provisional** | **Usable but NOT binding.** Carries a named revision trigger. **A consumer relying on it MUST surface that reliance.** |
| **unresolved** | **Known open, with a named owner. DO NOT INVENT A VALUE.** |

| # | Rule |
| --- | --- |
| **A1** | **Status flips ONLY in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`, on correctly-classed evidence.** Not in a node's YAML, not in a README, not in this package. |
| **A2** | **Never locally re-decide.** A cluster assignment you dispute → file the **U4 challenge** against `D-F4a` in **NEU-932's** ledger. **The existing assignment stands until adjudicated, and the technique stays mapped — the map never has a hole while an argument is in progress.** |
| **A3** | **UNION ledger rows, NEVER REPLACE.** **Map nodes cite ledger ids verbatim in their `notes`; clobbering a row turns those notes into false claims.** |
| **A4** | **Preserve conflicts and gaps. Never smooth them.** **That discipline is what made this charter's real defects visible** — `F-943-1`, `INC-C1`, and the incomplete AR-1 register were all found because somebody wrote down an inconvenient fact instead of tidying it away. **30 coverage disagreements were adjudicated with ZERO smoothed.** Honour it. |
| **A5** | **A mapper may not promote its own node to `settled`.** The correct default for a mapped node is **`provisional`** — **the map's honesty, not a weakness.** |

---

## 8. Acceptance checklist for a consuming charter

A curriculum-production charter consuming this package should be able to answer **yes** to all:

- [ ] Sequences from the **graph's topological order** — the authority, even now that
      `progression_stage` agrees with it (`F-943-1` closed, `D-R4`).
- [ ] Classifies edges **by field**, never by endpoint span (`X-S1`).
- [ ] Treats every `boundary_anchor` terminal as **assumed knowledge**, authoring none of it.
- [ ] Authors **none** of the 10 `INC-C1` gaps, and **states the incompleteness** rather than implying
      coverage.
- [ ] Leaves the two dangling declarations (`F-939-A`/`F-939-B`) **in place**.
- [ ] **Re-derives** `prerequisite_depth` from the graph after any edge change — the declared field
      now agrees on all 179, and staying derivable is what keeps it that way.
- [ ] **Surfaces its reliance** on every `provisional` value it consumes — stages, difficulty loads,
      AR-1 dependents.
- [ ] **Invents no problem-level citation** (`CAP-2`).
- [ ] Presents no JS performance verdict as **measured** (`JS-U2`).
- [ ] Presents the graph order as **structural, never as measured DP-learning order** (`R1`).
- [ ] Gives every split half a **residual owner** (§6.1).
- [ ] Sequences derived work on **data** dependency, not file disjointness (§6.2).
- [ ] Flips status **only in the ledger**, and **unions** rather than replaces.

---

**Read `03_open-items-and-provisional-register.md` before authoring anything. It is the list of what
this map does not know.**
