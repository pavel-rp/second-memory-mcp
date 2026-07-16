# Progression Stages — Interpreted Through NEU-888

**Task:** NEU-940 (SUB-7) · **Decision:** `D-P1` (`decision-records/DR-P01_progression-stages.md`)
**Status: provisional.** Creator progression-plausibility review **deferred** (Assumption #11, `DR-P03`).

---

## 1. What a "stage" is — and the trap it must not fall into

NEU-888 supplies **two different staged structures**, and conflating them is the single
easiest way to invent a stage. They must be kept apart:

| NEU-888 structure | What it stages | Per-what? |
| --- | --- | --- |
| **The mastery ladder** — mastery model §4, Gates **A–E** | a learner's grip on **one chunk**, over time | per **learner × node** — a *lifecycle* |
| **Prerequisite-first ordering** — DR-M01 behavior 1 | which concept is met **before** which | per **node** — a *position* |

**A per-node stage field cannot be the mastery ladder.** Every node passes through Gates A–E
eventually; "which gate is this node in?" has no node-level answer — it has a learner-level
answer that changes hourly. Writing Gate B into a YAML node would be a category error.

**So a stage here is a position, and NEU-888 fixes the ordering principle for positions:**

> **DR-M01, Decision behavior 1** — *"For any concept pair where B declares A as a prerequisite
> (chunk→chunk prerequisite edge, F-M01-5), A is taught in an earlier position than B in the
> learner's teaching order. A held-out ordering can be checked against the prerequisite graph:
> no dependent is scheduled ahead of an unmet prerequisite."*

The map's expression of that ordering is **prerequisite depth over the frozen root floor**.
That is the whole of the stage definition. The mastery ladder is not discarded — it re-enters
as the **entry gate**: the NEU-888 gate that governs *crossing into* a stage (§3).

### 1.1 🔴 The stage set is NOT a difficulty ramp — and NEU-888 forbids making it one

This is a **hard constraint**, not a stylistic preference. NEU-888 rejects difficulty ordering
twice, explicitly:

- **F-M01-3** `[class 1, review/absence-of-evidence]` — *"Difficulty-level ordering ('easy→hard')
  is not the same construct as interleaving, and the evidence base for sequencing is about
  element/topic structure, not a monotone difficulty ramp… 'no research literature was found
  treating difficulty-level (easy/medium/hard) sequencing as the interleaving manipulation.'"*
- **DR-M01, Rejected alternative** — *"**Monotone easy→medium→hard difficulty ramp as the
  ordering principle** — **rejected** because F-M01-3… adopting it here would silently
  pre-empt a conflict this cluster does not own"* (**C5**, owned by NEU-919).

**Consequences this package obeys, mechanically:**

1. **Stage is computed from prerequisite depth, never from difficulty.** A PS-4 node is not
   "harder" than a PS-1 node; it is *deeper*. (`04_consistency-check.md` verifies stage and the
   load scores are not rank-correlated by construction — they are independent axes.)
2. **No aggregate/scalar difficulty is emitted.** `difficulty_dimensions` carries five separate
   load dimensions and **no** `overall_difficulty` key. Collapsing them would re-create the
   rejected ramp through the back door, and would additionally pre-empt **C5**.
3. **Ordering a curriculum by these stages is prerequisite-first ordering.** Ordering it by the
   load scores would be the rejected ramp. Downstream consumers: use `progression_stage`.

---

## 2. The stage set — PS-0 … PS-4

**Definition (mechanical).** `prerequisite_depth` is the longest path from the node back to the
frozen root floor, over **DP-technique prerequisite edges only**:

```
depth(root)            = 0
depth(boundary anchor) = 0            # sanctioned non-DP terminal, not a DP step (D-S3)
depth(node)            = 1 + max(depth(p) for p in DP-technique prerequisites of node)
                       = 1            # if the node has no DP-technique prerequisite
                                      #   (i.e. it rests only on roots and/or anchors)
```

Inputs: `prerequisites.intra_cluster` (**drawn**) and `cross_cluster_attachments` with
`relation: "requires"` **only where the mapper's own `to_node` hint resolves exactly to an
existing node** (see §5.2 — resolving the rest is SUB-12's grant, not ours). Roots and boundary
anchors bottom out at 0: a root is the floor, and by **D-S3** an anchor is a *sanctioned
terminal*, not a DP prerequisite, so neither adds a DP step.

| Stage | Depth | The stratum | Entry gate (NEU-888) |
| --- | --- | --- | --- |
| **PS-0** | 0 | **First-principles floor.** The 8 frozen roots. Terminal by construction. | — (floor; nothing precedes it) |
| **PS-1** | 1 | **Foundational acquisition.** Rests only on roots and/or anchors. The learner's first real DP techniques. | **Gate A** (`MM-T9`) — *advance* off the floor |
| **PS-2** | 2 | **Dependent consolidation.** Rests on ≥1 PS-1 technique. | **Gate C** (`MM-T8`) — *unlock* |
| **PS-3** | 3 | **Composite application.** Rests on ≥1 PS-2 technique. | **Gate C** (`MM-T8`) — *unlock* |
| **PS-4** | ≥4 | **Deep composite.** Rests on ≥1 PS-3 technique. Typically a technique's own implementation/debugging/selection skills, or a refinement presupposing an already-durable base. | **Gate C** (`MM-T8`) — *unlock*; Gate E (`MM-T15`) pursued here but **never lowers** A–C |

### 2.1 ⚠️ FLAGGED — the PS-2/PS-3/PS-4 boundaries are NOT grounded in NEU-888

Stated plainly, because the acceptance criterion requires it: **NEU-888 grounds the *principle*
(order by prerequisite depth, DR-M01 b1) and the *gates* (A vs C, §3). It does not ground a
depth granularity.** NEU-888 contains nothing that says a curriculum has five stages, or that the
ceiling belongs at 4 rather than 3 or 6.

- **What IS grounded:** the **PS-1 / PS-2+** split. That boundary is NEU-888's own
  *advance* (`MM-T9`) vs *unlock* (`MM-T8`) distinction — a real, cited change of gate (§3).
- **What is NOT grounded:** the subdivision of depth ≥2 into **PS-2 / PS-3 / PS-4**, and the
  **ceiling at depth ≥4**. All three strata are entered under the *identical* Gate C. The
  subdivision is a **presentation choice about granularity**, made so the field is usable for
  curriculum sequencing, and it is recorded as such — **not** as an interpreted NEU-888 semantic.

**This is a flagged unmet requirement, carried openly rather than dressed up as grounding**
(`03_grounding-trace.md` §3, row `PS-GRAN`; `04_consistency-check.md` §4). **Owner:** the
creator's progression-plausibility review — **deferred** under Assumption #11 (`DR-P03`).
**Revision trigger:** the creator (or in-domain calibration) judging the granularity wrong —
which would re-bucket stages **without touching `prerequisite_depth`**, since depth is preserved
losslessly per node and the stage is a pure function of it (§2). Re-bucketing is therefore a
cheap, mechanical change, which is *why* the exact depth is stored alongside the stage.

**Observed distribution** (`04_consistency-check.md` §2): PS-1 20 · PS-2 32 · PS-3 36 · PS-4 91.
**PS-4 holds 51% of the graph** — the ceiling's cost, reported rather than tuned away. The
depth range is 1–9 and the depth histogram is preserved in full in `04_consistency-check.md`.

---

## 3. Entry gates — where the mastery ladder legitimately re-enters

The stage says *where* a node sits; the **entry gate** says *what NEU-888 requires to cross into
it*. `entry_gate` takes exactly **two** values, because NEU-888 draws exactly one gate
distinction that a node's graph position determines:

| `entry_gate` | Applies to | NEU-888 source | Rule (verbatim shape) | Threshold |
| --- | --- | --- | --- | --- |
| `"gate-a"` | **PS-1** | mastery model §4 Gate A · `DR-M01` behavior 3 | *"≥1 **unaided** correct application of the prerequisite (demonstration, not exposure, not `repetitions>0`)"* | `MM-T9` |
| `"gate-c"` | **PS-2, PS-3, PS-4** | mastery model §4 Gate C · `DR-M10` Stage 1 | *"prerequisite composite ≥ **durability bar B\*** (Gate B cleared **and** retrievability posterior ≥ B\*), server-evaluated from persisted multi-session history"* | `MM-T8` (prov. 0.90, band 0.85–0.95) |

**Why PS-1 is Gate A but PS-2+ is Gate C — NEU-888's own distinction, not ours.** `MM-T9` is
*advance*; `MM-T8` is *unlock*; the mastery model states the difference explicitly:
*"MM-T9 keeps **advance** (single demonstration) distinct from **unlock** (MM-T8). No single
success unlocks."* PS-0→PS-1 is an **advance within a path** off the frozen floor — the
prerequisite is a *root*, and Gate A is `DR-M01`'s prerequisite→dependent transition. Every
deeper crossing is a **dependent unlock** across a real technique prerequisite edge, which
`DR-M10`'s durability gate governs. **Using Gate A for a PS-2+ crossing would be precisely the
`repetitions>0` rule `DR-M10` rejects as C1** — the highest-severity conflict in NEU-888.

### 3.1 Gates D and E are NOT entry gates — and are deliberately not written as one

Both appear on the mastery ladder, and it would be easy (and wrong) to bolt them onto a stage:

- **Gate D** (`MM-T11`/`MM-T12`, `DR-M05`) governs *"technique enters interleaved pool"* —
  **blocked acquisition → interleaved review**. That is a **transition in a chunk's lifecycle**,
  not a crossing into a graph position. A node does not "sit in" Gate D. Its per-node signal is
  carried where it belongs: **`recognition_load`** is `DR-M05`'s category/discrimination axis, so
  a node scoring `recognition_load ≥ 4` is where interleaved discrimination practice earns most
  (`02_difficulty-dimensions.md` §3.5). **Gate D is read off that dimension, not off the stage.**
- **Gate E** (`MM-T15`, `DR-M10` Stage 2) governs contest speed. `DR-M10` is emphatic: speed
  *"may **not** be used to relax Stage 1"* and *"**Speed alone never unlocks**."* Making it an
  entry gate anywhere would invert that invariant. PS-4 is where speed work concentrates, but
  PS-4's entry gate is **`gate-c`**, identical to PS-2/PS-3. §4.1 covers the conflation this
  avoids.

**Net:** `entry_gate ∈ {"gate-a", "gate-c"}` and is a pure function of depth
(`depth == 1 → gate-a`, `depth ≥ 2 → gate-c`). `04_consistency-check.md` §3 verifies that
invariant mechanically on all 179 nodes.

---

## 4. The three conflations this stage set refuses

Each is a way a plausible-looking stage set would silently assert something NEU-888 does not.

### 4.1 PS-4 ≠ "the contest-speed phase"

Tempting, because CL-4 is the *optimization* cluster and `DR-M10` Stage 2 is the *speed* phase.
**Refused: these are different subjects.** Gate E's criterion is *"median solve **latency** ≤1.5×
reference"* (`MM-T15`) — the **learner's** speed. A DP optimization technique (CHT, Knuth,
divide-and-conquer opt) makes the **program** asymptotically faster. A learner can be slow at
CHT and fast at knapsack. Mapping "optimization cluster" onto "learner-speed stage" would assert
a correspondence NEU-888 nowhere makes.

**Therefore: stage is never assigned from `cluster`.** A CL-4 node whose depth is 2 is PS-2. A
CL-1 node whose depth is 4 is PS-4. `04_consistency-check.md` verifies cluster and stage are not
in bijection, precisely to demonstrate no cluster→stage shortcut was taken.

### 4.2 Stage ≠ skill type

`skill_type` (the eight) is **SUB-2's cascade**, owned by the mappers; stage is depth. They
correlate loosely — `transfer` and `strategic` nodes tend to sit deeper — but the correlation is
an *observation*, never an input. Deriving stage from skill type would (a) invent an ordering
NEU-888 does not supply and (b) silently retype nodes, corrupting **SUB-9/NEU-943**'s
eight-type union-completeness check, which is not this sub-task's to touch.

### 4.3 Stage ≠ difficulty

Covered in §1.1. Restated because it is the charter's named **High** risk.

---

## 5. Uncertainty carried, not smoothed

1. **DP-transfer stays provisional — the graph order is NOT presented as measured for DP.**
   Inherited NEU-887 **R1** / `INC-I1` / F-TR-3. `DR-M01`'s own Uncertainty section is the
   binding statement: *"no cited source measures a specific DP concept ordering against DP
   problem-solving transfer… The claim that a particular prerequisite graph produces better DP
   mastery is unmeasured."* The stages therefore assert a **prerequisite order**, which the graph
   evidences, and **not** a **learnability order**, which nothing measures. CL-1's two `transfer`
   nodes carry this uncertainty already; this package does not weaken it.

2. **Declared cross-cluster attachments feed depth only on the mapper's own exact hint — the
   rest are SUB-12's, and are flagged, not guessed.** Depth counts drawn intra-cluster edges plus
   `relation: "requires"` attachments **whose `to_node` resolves exactly to an existing node**
   (15 of 27). Ignoring attachments entirely would badly understate depth for the nodes most
   likely to be deep (a CL-4 optimization requiring a CL-2 base DP would score depth 1 —
   "foundational" — which is plainly wrong). But `03_per-node-record-template.md` §3 is explicit
   that `to_node` is *"A PREDICTION"*, resolved by **SUB-12 on `to_name`**.

   For the **12 attachments that do not resolve exactly**, this package **does not guess**. Their
   `to_name`s point at nodes that exist under different names, in different clusters, or not at
   all (`cl-4.sos-dp` and `cl-4.bitset-word-parallel-optimization` do not exist — the known
   `D-F4a` / AR-1 open items, left alone per the charter). Resolving them is
   **SUB-12/NEU-939's grant**, being executed concurrently; pre-empting it would both exceed
   OUT-3's scope and risk contradicting `edges/cross-cluster.yaml`.

   **Consequence, carried openly:** the **9 affected nodes** carry a depth that is a **LOWER
   BOUND**, and are listed in `04_consistency-check.md` §5. **Revision trigger:** when SUB-12
   realizes `edges/cross-cluster.yaml`, any attachment resolving to a real node **revises that
   node's `prerequisite_depth` and may move its stage** (recompute is the mechanical §2 formula).
   This is a genuine, named dependency — not a smoothed one.

3. **The gate thresholds themselves are provisional.** `MM-T8`'s 0.90 is *"a provisional starting
   point, not a measured optimum"* with band 0.85–0.95 (mastery model §2). This package inherits
   that band wholesale and adds no precision to it. It **cites** gates; it **sets** no threshold.

4. **`repetitions>0` / C1 is NOT resolved here.** Gate C is cited as `DR-M10` fixes its *shape*.
   Whether the live code matches is `INC-I3` / **NEU-923**, and **C1** stays `unresolved` ·
   non-downgradable. Citing a gate is not adjudicating it.

5. **Creator progression-plausibility review: DEFERRED.** The creator is unavailable in this
   unattended run. Per charter **Assumption #11**, `D-P1` ships **provisional** with an explicit
   revision trigger rather than fabricating a judgement or blocking the map. Every node carries
   `creator_review: "deferred-provisional"`. Full terms: `DR-P03`.

---

## 6. Where the stages live

Per-node, in `difficulty_dimensions.progression_stage` and `.entry_gate`, in
`../C005-dp-map/nodes/*.yaml`. The NEU-933 template routes both here: `difficulty_dimensions` is
typed `map<string, string|number|null>` and is the **only** node field whose value set OUT-3 owns
(`01_node-and-edge-schema.md` §5.2). The NEU-940 spec directs progression to *"the NEU-933
per-node template's difficulty fields"* — this map is that field. No new top-level node field is
minted: the schema's required-field list is SUB-2's, and extending it is not OUT-3's grant.

**The 8 frozen roots (PS-0) keep `difficulty_dimensions: {}`** — they are `frozen: true` and
changeable *"only via a ledger challenge against D-S2"*, and this sub-task must not write the
ledger. PS-0's semantics are defined above and the exception is **flagged, with an owner**, in
`04_consistency-check.md` §4. Flagged-not-forced is the sanctioned route; forcing values into a
frozen block would be the actual violation.
