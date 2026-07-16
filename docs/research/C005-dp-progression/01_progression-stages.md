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

Inputs: `prerequisites.intra_cluster` + `prerequisites.roots` (**drawn**) and
`cross_cluster_attachments` with `relation: "requires"` (**declared** — see §5 for why declared
edges count and what revises them). Boundary anchors bottom out at 0 by **D-S3**: an anchor is a
*sanctioned terminal*, not a DP prerequisite, so it adds no DP depth.

| Stage | Depth | The stratum | Entry gate (NEU-888) |
| --- | --- | --- | --- |
| **PS-0** | 0 | **First-principles floor.** The 8 frozen roots. Terminal by construction. | — (floor; nothing precedes it) |
| **PS-1** | 1 | **Foundational acquisition.** Rests only on roots and/or anchors. The learner's first real DP techniques. | **Gate A** (`MM-T9`) on its roots |
| **PS-2** | 2 | **Dependent consolidation.** Rests on ≥1 PS-1 technique. | **Gate C** (`MM-T8`) on its prerequisites |
| **PS-3** | 3 | **Composite application.** Rests on ≥1 PS-2 technique; typically requires choosing *which* technique applies. | **Gate C** (`MM-T8`), **+ Gate D** (`MM-T11`/`MM-T12`) where technique selection is material |
| **PS-4** | ≥4 | **Frontier refinement.** Rests on ≥1 PS-3 technique. Presupposes an already-durable base technique it refines or accelerates. | **Gate C** (`MM-T8`); Gate E (`MM-T15`) pursued here but **never lowers** A–C |

**PS-4 is open-ended above** (depth ≥4) rather than minting PS-5, PS-6… per depth. A stage must
carry a distinct *gate semantics* to earn its existence (§3); depth 5 and depth 4 are entered
under the identical gate, so a separate stage would be an **invented** distinction — exactly
what `D-P1` forbids. Depth is preserved losslessly in the `prerequisite_depth` dimension, so
nothing is lost by the ceiling.

---

## 3. Entry gates — where the mastery ladder legitimately re-enters

A stage earns its existence only if **a named NEU-888 gate governs entry into it**. This is the
test that separates an interpreted stage from an invented one, and it is why there are five
stages rather than any other number.

| Gate | NEU-888 source | Rule (verbatim shape) | Threshold |
| --- | --- | --- | --- |
| **Gate A** | mastery model §4 · `DR-M01` behavior 3 | *"≥1 **unaided** correct application of the prerequisite (demonstration, not exposure, not `repetitions>0`)"* | `MM-T9` |
| **Gate C** | mastery model §4 · `DR-M10` Stage 1 | *"prerequisite composite ≥ **durability bar B\*** (Gate B cleared **and** retrievability posterior ≥ B\*), server-evaluated from persisted multi-session history"* | `MM-T8` (prov. 0.90, band 0.85–0.95) |
| **Gate D** | mastery model §4 · `DR-M05` | *"per-technique **fluency gate** fires (Stage-1→Stage-2)"*; technique-selection accuracy across mixed types | `MM-T11`, `MM-T12` |
| **Gate E** | mastery model §4 · `DR-M10` Stage 2 | *"after Gate C, a **latency** criterion is pursued; it may **not** relax any of A–C"* | `MM-T15` |

**Why PS-1 is Gate A but PS-2+ is Gate C.** This is NEU-888's own distinction, not ours:
`MM-T9` is *advance*, `MM-T8` is *unlock*, and the mastery model states the difference
explicitly — *"MM-T9 keeps **advance** (single demonstration) distinct from **unlock** (MM-T8).
No single success unlocks."* PS-0→PS-1 is an **advance within a path** off the frozen floor
(Gate A). PS-1→PS-2 and every deeper crossing is a **dependent unlock** across a real
prerequisite edge, which `DR-M10`'s durability gate governs (Gate C). Using Gate A for a
PS-2 crossing would be exactly the `repetitions>0` rule `DR-M10` rejects as **C1**.

**Gate E never becomes an entry gate.** PS-4 nodes are where contest-speed work concentrates,
but `DR-M10` Stage 2 is emphatic: speed *"may **not** be used to relax Stage 1"* and
*"**Speed alone never unlocks**."* So PS-4's entry gate is **Gate C**, identical to PS-2/PS-3.
Gate E is listed on PS-4 as a *pursued criterion*, never a *lowered bar*. See §4.1 for the
conflation this deliberately avoids.

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

2. **Declared cross-cluster attachments feed depth, and SUB-12 may move them.** Depth is computed
   over drawn edges **plus** `relation: "requires"` attachments that are still `declared`, because
   ignoring them would understate depth for exactly the nodes most likely to be deep (CL-4 nodes
   that require a CL-2 base DP). But `03_per-node-record-template.md` §3 is explicit that
   `to_node` is *"A PREDICTION"* resolved by SUB-12 on `to_name`.
   **Revision trigger:** when **SUB-12 (NEU-939)** realizes `edges/cross-cluster.yaml`, any
   attachment that resolves to a different node, resolves to nothing (a coverage finding), or is
   found to be a cycle **revises the dependent's `prerequisite_depth` and may move its stage.**
   Recompute is mechanical (§2) — `04_consistency-check.md` §5 names the exposed nodes.

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
