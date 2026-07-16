# Difficulty Dimensions — Named Once, Applied to Every Node

**Task:** NEU-940 (SUB-7) · **Decision:** `D-P2` (`decision-records/DR-P02_difficulty-dimensions.md`)
**Dimension set version:** `1.0.0` · **Status: provisional** · Resolves `INC-S3`.

This file names the dimension set the NEU-933 schema left unresolved (`INC-S3`:
*"the dimension **set itself** is unresolved — owner SUB-7 (OUT-3). Do not invent dimensions."*).
It is the **only** place the set is defined; every node cites it via `dimension_set_version`.

---

## 1. Where the dimensions come from — the load partition, not a difficulty scale

NEU-888's framing file supplies the partition, and it names DP's intrinsic load *in the source
text itself*:

> **F-CL-2** `[class 1, theoretical framework]` — *"**Intrinsic** load is 'the effort associated
> with a specific topic' (the inherent difficulty of the material — **for DP, the
> recurrence/state/transition structure itself**). **Extraneous** load is 'the way information or
> tasks are presented to a learner' (avoidable burden from poor design). **Germane** load is 'the
> work put into creating a permanent store of knowledge (a schema)'."*

That parenthetical is the grounding. NEU-888 does not say "DP problems are hard"; it says DP's
intrinsic load **is the state/transition/recurrence structure**. So the dimensions decompose
*that*, plus the element-interactivity constraint that makes it matter:

> **F-CL-1** — *"Human working memory is sharply capacity-limited… 'seven plus or minus two
> units'."* → **F-M01-1** — *"prerequisite-first ordering reduces the **number of novel
> interacting elements** a novice holds at once."*

**A dimension is therefore a count of interacting elements a learner must hold at once, in one
named part of the DP structure.** Not an opinion about hardness. That is what makes the five
dimensions *derived* rather than invented, and it is what makes them scorable consistently by
different authors across five files.

---

## 2. The dimension set

Every mapped technique node carries **all ten keys**. No key is optional; a missing key is a
**flagged** finding (`04_consistency-check.md`), never a silent default.

| Key | Type | Load kind (F-CL-2) | What it counts |
| --- | --- | --- | --- |
| `dimension_set_version` | `string` | — | `"1.0.0"` — pins the node to *this* rubric |
| `progression_stage` | `string` | — | `PS-0`…`PS-4` — see `01_progression-stages.md` |
| `entry_gate` | `string` | — | `gate-a` \| `gate-c` \| `gate-c+gate-d` — the NEU-888 gate governing entry |
| `prerequisite_depth` | `int` | — | Longest DP-technique path back to the floor |
| `state_formulation_load` | `int 1–5` | **intrinsic** | Interacting elements in *choosing the state* |
| `transition_derivation_load` | `int 1–5` | **intrinsic** | Interacting elements in *deriving the recurrence* |
| `proof_obligation_load` | `int 0–5` | **intrinsic** | Strength of the *correctness argument* the technique demands |
| `implementation_load` | `int 1–5` | **extraneous** | Burden of *realizing it in code* |
| `recognition_load` | `int 1–5` | **germane** | Difficulty of *seeing that it applies* |
| `creator_review` | `string` | — | `"deferred-provisional"` — Assumption #11 (`DR-P03`) |

### 2.1 🔴 There is deliberately no `overall_difficulty`

The five loads are **not summed, averaged, or ranked into a scalar.** Emitting one would:

1. **Re-create the ordering principle NEU-888 rejected.** F-M01-3 / `DR-M01` Rejected
   alternative — *"Monotone easy→medium→hard difficulty ramp as the ordering principle —
   **rejected**."* A scalar difficulty is an easy→hard ramp with extra steps.
2. **Pre-empt C5**, the interleaving-axis conflict owned by **NEU-919**, which `DR-M01`
   explicitly declines to touch.
3. **Destroy the information the dimensions exist to carry.** A node at
   `proof=5, implementation=1` and one at `proof=1, implementation=5` are pedagogically
   opposite and would average identical. The whole point of *dimensions* is that DP difficulty
   is not one-dimensional.

**Downstream consumers:** to order a curriculum, use `progression_stage` (prerequisite-first,
`DR-M01` behavior 1). To calibrate one lesson's difficulty against a learner, read the
dimensions **separately** and target the region of proximal learning per dimension (F-DD-3).
Do not synthesize a scalar; if you need one, that is a new decision requiring its own grounding
and a C5 resolution.

---

## 3. The scoring rubric — anchored, so five authors score alike

The scale is **ordinal, not measured** (§5). Each anchor names an *element count*, not a vibe.
When a node falls between anchors, **score down** and record why in `notes` — inflation is the
failure mode a rubric exists to prevent.

### 3.1 `state_formulation_load` (1–5) — intrinsic
*How many interacting elements must be held to decide what a state IS?*

| | Anchor |
| --- | --- |
| **1** | State is given by the problem statement. One index. *(prefix sums; 1-D "best up to i")* |
| **2** | One index + one small bounded attribute. *(0/1 knapsack `dp[i][w]`; simple LIS)* |
| **3** | Two interacting indices, or an index + a derived quantity that must be invented. *(interval DP `dp[l][r]`; edit distance)* |
| **4** | A non-obvious encoding of the state space itself. *(bitmask over a subset; digit DP with tight/started flags)* |
| **5** | State requires a representational insight — the natural state is intractable and must be re-conceived. *(broken-profile/plug DP; DP over the SOS/subset lattice; state as a convex hull / function)* |

### 3.2 `transition_derivation_load` (1–5) — intrinsic
*How many interacting elements must be held to derive and justify the recurrence, given the state?*

| | Anchor |
| --- | --- |
| **1** | One-line transition, directly readable off the state. |
| **2** | A small fixed set of cases (2–3), each obvious. |
| **3** | Case analysis whose exhaustiveness must be actively checked, or a transition over a variable-size set. |
| **4** | Transition depends on an auxiliary structure or a non-local quantity computed elsewhere. |
| **5** | Transition is algebraically restructured — the naive form is abandoned for an equivalent one. *(min-plus convolution; CHT as a transition rewrite; matrix-exponentiated transitions)* |

### 3.3 `proof_obligation_load` (0–5) — intrinsic
*How strong is the correctness argument this node genuinely demands?* **0 is real and common** —
most application nodes inherit correctness from the technique they apply.

| | Anchor |
| --- | --- |
| **0** | No proof obligation. Correctness is inherited or immediate. **The default for `implementation`/`procedural` nodes.** |
| **1** | Informal justification — an argument a learner states in a sentence. |
| **2** | A stated invariant, checked but not formally proved. |
| **3** | A real argument with a named structure: exchange argument, induction on the DP order, cut-and-paste optimal-substructure. |
| **4** | A named non-obvious property must be *verified for this problem* before the technique is licensed. *(quadrangle inequality; monotonicity of the optimal split; Monge)* |
| **5** | A research-grade argument — the proof is the contribution. |

> **Typing note (do not cross this line).** Per `03_per-node-record-template.md` §6, a technique's
> *application* and the *proof licensing it* are **separate nodes**. So `cl-4.knuth-optimization`
> (the application) scores **`proof_obligation_load: 1`** — it inherits — while
> `cl-4.quadrangle-inequality-proof` scores **4–5**. **Scoring the application high because a
> proof exists somewhere would smear the two nodes together and quietly relitigate a mapper's
> typing decision, which is not OUT-3's grant.** Score the obligation *this node* carries.

### 3.4 `implementation_load` (1–5) — extraneous
*Burden of realizing it in code, once the recurrence is known.* This is **extraneous** load —
F-CL-2's *"avoidable burden from poor design"* — so it is the one dimension good authoring is
expected to **reduce**. Score the *technique's inherent* coding burden, not any language's.

| | Anchor |
| --- | --- |
| **1** | A loop and an array. |
| **2** | Nested loops, careful bounds/base cases. |
| **3** | Non-trivial iteration order, in-place rolling arrays, or a standard auxiliary structure. |
| **4** | A custom data structure, or delicate index/bit manipulation where an off-by-one is silent. |
| **5** | A substantial structure implemented from scratch, with the DP interleaved into it. *(Li Chao tree; kinetic segment tree; slope trick with heaps)* |

> **Language neutrality.** Score the technique, not the runtime. Whether **JavaScript** materially
> changes feasibility or idiom (recursion limits, BigInt, typed arrays) is **OUT-5 / SUB-8 /
> NEU-941**'s verdict, recorded in `javascript_materiality` — a field this sub-task does not
> touch. A JS-specific burden must **not** be smuggled into this score; that would double-count
> 941's finding and corrupt both fields.

### 3.5 `recognition_load` (1–5) — germane
*How hard is it to see, from a cold problem statement, that THIS technique applies?* This is the
**discrimination** dimension — `DR-M05`'s **category axis** (`MM-T12`: *"technique-selection
accuracy ≥0.8 across ≥3 mixed types"*), which Gate D reads. It is the transfer-relevant one.

| | Anchor |
| --- | --- |
| **1** | The statement names it, or the mapping is a template. |
| **2** | A standard cue with few rivals. *("count the ways" → counting DP)* |
| **3** | Recognizable, but a plausible rival technique competes and must be ruled out. |
| **4** | Requires reformulating the problem before the cue appears. |
| **5** | Recognition is the hard part; the technique is invisible until a non-obvious reframing. *(seeing a DP as min-plus convolution; recognizing slope-trick structure)* |

**Germane, therefore not to be minimized.** F-DD-2: *"the lower the retrieval strength… the
greater the boost."* A high `recognition_load` marks a node where interleaved discrimination
practice (`DR-M05`) earns the most — it is a **signal to Gate D**, not a defect to design away.

---

## 4. Independence — the property that keeps this honest

The five loads are **orthogonal by construction**, and `progression_stage` is orthogonal to all
five. That is the mechanical guarantee that §2.1's refusal is real and not decorative:

- A **PS-1** node can score `state=5` (a foundational technique resting only on roots can still
  demand a representational insight).
- A **PS-4** node can score `state=1, transition=1` (a deep refinement of an already-formulated
  recurrence changes neither).
- `proof=0` coexists with `implementation=5`, and `proof=5` with `implementation=1`.

`04_consistency-check.md` §3 reports the observed stage↔load rank correlation. **A strong
positive correlation would be evidence the ramp crept back in** and is reported as a finding
rather than tuned away.

---

## 5. What these numbers are — and are NOT

**The value firewall, inherited verbatim from the mastery model §2:**

1. **No class-7 evidence exists.** Not one score below is validated on this product's learners or
   on the DP domain. `[future-real-user]` evidence does not exist project-wide. Phrases like
   "proven for our learners" are prohibited and absent.
2. **These are ordinal judgements, not measurements.** `state_formulation_load: 4` means *"more
   interacting elements than a 3, by the §3.1 anchors"* — **not** "4 units of load", not "twice a
   2". They are not interval-scaled; **do not do arithmetic on them** (§2.1).
3. **Population validity is UNEARNED.** These become calibrated when class-3 `[dogfooding]`, then
   class-6 `[operational-log]` evidence lands. Until then every score is **provisional** and the
   whole set is a **hypothesis to be measured**.
4. **DP-transfer is the controlling gap.** F-TR-3 / `INC-I1`: the load framework is studied on
   facts and well-structured problems, **not** DP. Applying it to DP is an *analogy*
   (`02_cognitive-load…` §3), not a measurement.

**Revision signal for the set (`D-P2`):** a dimension that no node ever varies (dead axis), a
dimension two authors cannot score consistently from §3's anchors (ambiguous axis), a node that
cannot be expressed in the set (**flag it — do not force it**, `04_consistency-check.md` §4), or
in-domain DP difficulty calibration from dogfooding. Any of these revises the set and bumps
`dimension_set_version`.
