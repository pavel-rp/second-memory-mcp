# Per-Cluster Non-Root Conceptual Obligation — and the Routing of its Map-Side Half

**Task:** NEU-961 (SUB-5) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Covers:** OUT-6 · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: for the map-side half, `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.11 (`D-R6`), filed by union and **not self-promoted to `settled`** (`A4`)
**Model:** claude-opus-5[1m]

---

## 0. The result, stated first

**Four clusters have an obligation. One of them can be discharged by this package's content forms. Three cannot be discharged by content of any kind, by anybody, until the map changes.**

- **CL-1** — obligation stated; **fully dischargeable content-side**, on exactly one non-root node, `cl-1.judge-dp-applicability`. Map-side requirement: **none**.
- **CL-2, CL-3, CL-4** — obligation stated; **content-side share is empty**; the whole obligation is map-side.

The reason the content-side share is *empty* rather than *small* is mechanical and is the single most important sentence in this document: **SUB-2's placement matrix keys the required form set off the node's `skill_type`, and every form template requires `node_id` to be an exact id copied from the map.** A cluster with no node typed `conceptual` therefore offers **no attachment point** for a conceptual form set. Attaching a lesson, a reflection or a retrieval item to a node typed `strategic` produces coverage of `strategic`. It does not produce conceptual coverage, and no amount of care in writing it would.

**Nothing here is reported as coverage achieved.** This sub-task's completion condition is **specified and routed**, exactly as charter assumption 9 states. `F-943-2` is **not** closed by this document and must not be read as closed. The residual is recorded in `90_open-items-and-provisional-register.md` § `SUB-5` with a named owner, and the map-side half is routed in the owning ledger as **`D-R6`**.

**This package authored no map content.** No node, edge, `progression_stage`, `entry_gate`, difficulty value, `manifest.yaml` entry or boundary-register entry was created, retyped, reclassified or edited by this sub-task. That is verifiable by diff and is stated as a success criterion rather than as a promise.

---

## 1. The measured baseline — consumed, not re-derived

Measured against `../C005-dp-map/nodes/` and cross-checked against the union-completeness audit `../C005-dp-map-integrity/02_skill-type-union-completeness.md` §1–§3. **No count here is new work**; where this document and that audit could disagree, the audit governs.

`conceptual` is instantiated by **exactly three nodes, all of them in CL-1**:

| Node id | `role` | Origin | Counts toward the spread bar? |
| --- | --- | --- | --- |
| `cl-1.root.recognize-optimal-substructure` | `root` | Frozen by NEU-933 under `D-S2`; a product of the first-principles floor, **not** of the mapping phase | **No** — the bar is *non-root* |
| `cl-1.root.recognize-overlapping-subproblems` | `root` | Frozen by NEU-933 under `D-S2` | **No** — the bar is *non-root* |
| `cl-1.judge-dp-applicability` | `technique` | Mapped by NEU-934 | **Yes — and it is the only node in the entire graph that does** |

Per-cluster instantiation of `conceptual`, **non-root**:

| Cluster | Cluster name (`manifest.yaml`) | Skill nodes | Non-root `conceptual` |
| --- | --- | --- | --- |
| **CL-1** | Foundational / linear-sequence | 29 | **1** |
| **CL-2** | Combinatorial / structural | 31 | **0** |
| **CL-3** | State-compression / specialized-domain | 20 | **0** |
| **CL-4** | DP-optimization (mainstream + research-tier frontier, jointly) | 32 (18 mainstream + 14 frontier) | **0** |

`F-943-2` records this as a **fragility, not a gap**, and records that union-completeness **PASSES**: three nodes instantiate the type, which is `≥1`. That verdict is not disturbed here. What is stated here is the consequence of the charter having since raised the bar.

---

## 2. The bar — spread supersedes union-completeness for `conceptual`

**OUT-2's criterion is union-completeness over the graph**: `≥1` node per named skill type, graph-wide. It is explicitly **not** per-cluster completeness (`../C005-dp-map-integrity/02_…` §4). `F-943-2` routed the question of a stricter bar to the charter rather than deciding it, on the grounds that tightening OUT-2 is a criterion change and belongs to the charter.

**The charter took that route and closed the decision by requiring spread**: every cluster must carry non-root `conceptual` coverage. That is a **strictly higher bar** than OUT-2's, and this document records the supersession explicitly because the two criteria disagree in the most dangerous possible way — **the looser one returns PASS on today's graph while the stricter one fails three of four clusters.**

| | Union-completeness (OUT-2, as written) | Spread (the charter's `F-943-2` closure) |
| --- | --- | --- |
| Unit of the check | the whole graph | each cluster |
| Roots admissible as evidence? | yes | **no — non-root only** |
| Today's verdict for `conceptual` | **PASS** (3 instances) | **FAIL 3/4** (CL-2, CL-3, CL-4 at zero) |

**What this implies for every future coverage audit, stated so nobody re-derives it.** An audit that runs OUT-2's check unmodified will report a green `conceptual` row and will be **correct about the criterion it ran and silent about the criterion that now governs**. A coverage audit under the spread bar must therefore:

1. count **non-root** instances only — a frozen root is a floor artifact and is not evidence that the mapping phase produced the type;
2. count **per cluster**, not by union; and
3. report the routed owner named in `D-R6` rather than filing a fresh finding, because the gap is already known, owned and routed. **A duplicate finding filed against an already-routed obligation is noise that makes the routed one harder to see.**

`F-943-2`'s own status is untouched by this document. It is **decided (spread is required); closure pending the routed map-side change.**

---

## 3. Why the split falls where it does — the discharge mechanism

This section is the derivation behind §0's headline. It rests entirely on SUB-2's frozen contract (`02_content-and-exercise-forms.md`) and re-decides none of it.

**3.1 The placement matrix reads the node's type, not the form's subject matter.** `02_…` §6.3 gives, for a node typed `conceptual`:

| Form | Obligation for a `conceptual` node | Discriminative? |
| --- | --- | --- |
| **lesson** | **R** | no |
| **example** (worked) | **R** | **yes** |
| **visualization** | **R** | **yes** |
| **reflection** | **R** | **yes** |
| **retrieval** | **R** | **yes** |
| **assessment** | **R** | **yes** |
| problem-reference | O | no |
| solution | O | no |
| proof | O | no |
| test | — (not applicable) | — |

Every discriminative form in that set carries the REQUIRED pair **`misconception_or_edge_case`** and **`separating_distractor_or_boundary_input`** — **never optional**, and a submission omitting either is rejected by the form definition itself (`02_…` §4). Those are the exact field names, reproduced verbatim so that **SUB-9 (NEU-965) merges this obligation into one enforceable quality system without translation.**

**3.2 A form instance cannot invent its own attachment point.** Every one of the ten templates in `02_…` §7 specifies `node_id` as *"the exact node id from the map — copy it; if you cannot locate it, refuse."* A form is placed **on a node**; it does not create one, and the refusal instruction is explicit rather than implied.

**3.3 Therefore the two halves are:**

- **The content-form half** — for a cluster that already contains at least one **non-root** node typed `conceptual`: author the six REQUIRED forms against that node id, with the REQUIRED pair on all five discriminative ones. This is real, complete, and needs nothing from the map.
- **The map-side half** — for a cluster that contains **no** non-root node typed `conceptual`: there is nothing to attach to. **The obligation cannot be reduced, partially discharged, or approximated by content.** Writing a beautifully targeted reflection item and attaching it to `cl-3.recognize-bitmask-state-applicability` yields a reflection on a `strategic` node; the matrix records `reflection` as **R** for `strategic` too, so the artifact is *valid* — it simply is not, and cannot be made into, evidence of conceptual coverage.

**3.4 The failure mode this section exists to prevent.** The tempting move is to author conceptual-*flavoured* content in CL-2/CL-3/CL-4 and report the clusters covered. That would produce a package in which every cluster row reads green while the map still instantiates `conceptual` exactly once — the precise fragility `F-943-2` was filed to keep visible, now hidden behind our own output. **It is refused here explicitly, not merely omitted.**

---

## 4. The per-cluster obligation

Each obligation below is written deliberately in the shape of a **property judgment** — *what does this hold or fail to hold, and how do I see it* — rather than as a selection among known alternatives or as recognition of a known technique under an unfamiliar surface. That shape is not stylistic. It is what the settled `D-S1` cascade requires of anything that legitimately reaches `conceptual` at S8 (see §6). **Whether a given obligation actually clears the cascade is the map owner's adjudication, not this package's**; the obligations are written so that the adjudication is *possible*, not so that its outcome is presumed.

### 4.1 CL-1 — Foundational / linear-sequence

**The cluster's defining contribution** (`manifest.yaml`): *"DP first principles, and DP whose state is a plain index tuple over a linear/rectangular domain and whose difficulty is the recurrence itself."*

**The conceptual obligation.** The learner must be able to make the **joint admissibility judgment**: given a problem statement, decide whether optimal substructure **and** overlapping subproblems hold **together**, and therefore whether DP is the right tool at all. The acquisition is the *joint* judgment, and its two failure directions are what make it non-trivial — substructure without overlap is divide-and-conquer, and overlap without substructure is a search problem that memoization cannot rescue. It is the first judgment a learner makes about any problem and the first that fails silently: a learner who cannot make it writes a correct-looking DP for a problem that does not have one.

**Carrier:** `cl-1.judge-dp-applicability` — *"Judge whether a problem admits a DP formulation"* — a non-root `technique` node already typed `conceptual`.

**Discharge split.**
- *Content-form half:* **the whole obligation.** The six REQUIRED forms attach directly to `cl-1.judge-dp-applicability`, each discriminative one carrying `misconception_or_edge_case` + `separating_distractor_or_boundary_input`. The misconceptions are available without invention: "any problem with a recursive decomposition is a DP problem" (separated by a divide-and-conquer instance whose subproblems are disjoint), and "recurring subproblems are enough" (separated by an instance where the optimum does not decompose).
- *Map-side half:* **empty.** No map change is required for CL-1.

**Recorded fragility, not smoothed.** CL-1's compliance rests on **one** node. Its two frozen roots do **not** count toward a non-root bar. If `cl-1.judge-dp-applicability` were ever retyped or removed, CL-1 would fall to zero and the graph would instantiate non-root `conceptual` **nowhere**. That is `F-943-2`'s original point and it survives this document unchanged; it is filed as `OI-S5-4`.

### 4.2 CL-2 — Combinatorial / structural

**The cluster's defining contribution:** *"DP whose state is indexed over a nontrivial combinatorial structure — the structure, not the encoding, is what makes it hard."*

**The conceptual obligation.** The learner must be able to judge **whether a combinatorial structure indexes a state space at all** — that is, whether the objects a statement describes admit a decomposition boundary along which optima compose, as opposed to a collection the problem merely enumerates. The two failure directions: a structure with **no decomposition boundary**, so no subproblem exists to be optimal; and a structure whose decomposition **double-counts or double-commits**, so composition across the boundary is not well-defined even though subproblems exist. This is a property judgment about the structure, prior to and independent of which structural technique is eventually run on it.

**Why the cluster cannot borrow CL-1's node.** `cl-1.judge-dp-applicability` judges the two DP properties over a **plain index tuple** reading of a statement. It does not, and by its own summary does not claim to, judge whether a *tree*, an *interval*, a *subset-with-order* or an *implicit DAG* carries a composable decomposition. A learner who has CL-1's judgment and enters CL-2 has no acquired means of telling a structure that indexes a state space from one that does not.

**Discharge split.**
- *Content-form half:* **empty.** CL-2 contains **no** node typed `conceptual`.
- *Map-side half:* **the whole obligation.** Routed as `D-R6`.

**Nearest existing nodes, and why each is not the carrier** (quoted with their current types, so the map owner adjudicates against real ids rather than a description):

| Node id | Current `skill_type` | Why it is not this obligation |
| --- | --- | --- |
| `cl-2.select-knapsack-variant` | `strategic` | A **choice among known variants**. The cascade stops at S5; the judgment that a state space exists at all is prior to any variant existing. |
| `cl-2.recognize-rerooting-applicability` | `strategic` | Its own recorded rationale reads *"choosing the formulation under a cost constraint, which is the definition"* of S5. Technique-specific, and a selection. |
| `cl-2.recognize-knapsack-under-an-unfamiliar-surface` | `transfer` | S4 — recognition of a **known** technique wearing an unfamiliar surface. Presupposes the state space; does not judge whether one exists. |
| `cl-2.recognize-interval-dp-under-an-unfamiliar-surface` | `transfer` | S4, same reason. |
| `cl-2.recognize-tree-dp-under-an-unfamiliar-surface` | `transfer` | S4, same reason. |
| `cl-2.recognize-an-implicit-dag` | `transfer` | S4, same reason — the closest candidate, and still a recognition of a known shape rather than a property judgment. |
| `cl-2.counting-vs-optimizing-objective` | — (`node_kind: knowledge`) | A **knowledge** node. Knowledge nodes carry no `skill_type` at all and cannot instantiate a skill type. |
| `cl-2.combination-vs-permutation-loop-order` | — (`node_kind: knowledge`) | Same. |

### 4.3 CL-3 — State-compression / specialized-domain

**The cluster's defining contribution:** *"DP whose defining contribution is a non-tuple state encoding, or which is bound to a specialized problem domain with its own semantics. The INDETERMINATE SINK of Convention U2."*

**The conceptual obligation.** The learner must be able to judge **whether a state is compressible** — whether the information a transition actually consumes is bounded and enumerable, independently of how large the state *appears*. The two failure directions: a state that looks compressible but whose transition genuinely consumes unbounded history (so no encoding is faithful); and a state whose **domain semantics** silently redefine what "the state" is — a probability and an expectation are not the same object, and a game position's value is defined by who moves rather than by what is on the board. In the cluster the schema itself designates the *indeterminate sink*, the judgment "is this actually one state space, and what is a state in this domain" is the acquisition most likely to be assumed and least likely to be taught.

**Discharge split.**
- *Content-form half:* **empty.** CL-3 contains **no** node typed `conceptual`.
- *Map-side half:* **the whole obligation.** Routed as `D-R6`.

**Nearest existing nodes, and why each is not the carrier:**

| Node id | Current `skill_type` | Why it is not this obligation |
| --- | --- | --- |
| `cl-3.recognize-bitmask-state-applicability` | `strategic` | Encoding-specific and a selection under a cost constraint (S5). "Does this want a bitmask" presupposes that a compressible state exists. |
| `cl-3.formulate-game-dp` | `strategic` | Formulating — choosing what a position *is* — not judging whether the domain admits a state at all. |
| `cl-3.recognize-digit-dp-under-unfamiliar-surface` | `transfer` | S4 recognition of a known technique. |
| `cl-3.recognize-impartial-game-under-unfamiliar-surface` | `transfer` | S4, same reason. |
| `cl-3.probability-vs-expectation-dp-semantics` | — (`node_kind: knowledge`) | A knowledge node: it **states** the distinction the obligation requires the learner to **judge with**. Knowledge nodes carry no `skill_type` and cannot instantiate one. **This is the sharpest illustration in the document that the gap is structural: the content exists as knowledge; the skill it licenses does not exist as a node.** |
| `cl-3.win-lose-position-semantics` | — (`node_kind: knowledge`) | Same. |

### 4.4 CL-4 — DP-optimization (mainstream + research-tier frontier, jointly)

**The cluster's defining contribution:** *"Techniques whose defining contribution is reducing the cost of evaluating an ALREADY-CORRECT recurrence — the recurrence is given; the contribution is making it affordable."*

**Scope of this analysis, stated before the obligation.** It covers CL-4's **mapped** members only — the 23 mainstream and 18 frontier nodes across the cluster's two files, one cluster. It asserts **nothing** about the 10 `INC-C1` techniques, which have no nodes. See §9.

**The conceptual obligation.** The learner must be able to judge **whether a too-slow recurrence's cost is structural** — whether its transition possesses an exploitable property at all (convexity, monotonicity of an optimal split point, envelope structure, low effective rank, a decomposable aggregate) — **before and independently of choosing which optimization to apply.** The failure direction that matters is the one the cluster's own framing invites: *the recurrence is slow, therefore an optimization exists.* It does not follow. A recurrence can be correct, slow, and carry no exploitable structure whatever, and a learner who cannot make that judgment searches indefinitely for a speed-up that is not there — or, worse, applies one whose precondition silently fails and ships a fast wrong answer.

**Discharge split.**
- *Content-form half:* **empty.** CL-4 contains **no** node typed `conceptual` in either file.
- *Map-side half:* **the whole obligation.** Routed as `D-R6`.

**Nearest existing nodes, and why each is not the carrier:**

| Node id | File | Current `skill_type` | Why it is not this obligation |
| --- | --- | --- | --- |
| `cl-4.select-mainstream-optimization` | mainstream | `strategic` | The canonical S5 selection — *"selecting a mainstream optimization for a too-slow DP"*. It **presupposes** that one applies, which is exactly the judgment the obligation names. |
| `cl-4.recognize-envelope-structured-transition` | mainstream | `transfer` | S4 recognition of a known structure. |
| `cl-4.recognize-window-constrained-transition` | mainstream | `transfer` | S4, same reason. |
| `cl-4.recognize-matrix-exponentiable-dp` | mainstream | `transfer` | S4, same reason. |
| `cl-4.recognize-hidden-convexity-for-slope-trick` | frontier | `transfer` | S4 — the nearest of all the candidates, and still scoped to *one* named optimization's licence rather than to whether any structure exists. |

---

## 5. The discharge split — the 4/4 check

**Every cluster is addressed. Zero clusters are unaddressed. One is discharged; three are routed.**

| Cluster | Obligation stated? | Content-form half | Map-side half | Routed to | Residual entry |
| --- | --- | --- | --- | --- | --- |
| **CL-1** | ✅ §4.1 | **Complete** — 6 REQUIRED forms on `cl-1.judge-dp-applicability` | **none** | — | `OI-S5-4` (single-node fragility) |
| **CL-2** | ✅ §4.2 | **Empty** — no `conceptual` node exists | **Whole obligation** | the map's owner, via **`D-R6`** | `OI-S5-1` |
| **CL-3** | ✅ §4.3 | **Empty** — no `conceptual` node exists | **Whole obligation** | the map's owner, via **`D-R6`** | `OI-S5-1` |
| **CL-4** | ✅ §4.4 (mapped members; §9 for `INC-C1`) | **Empty** — no `conceptual` node exists | **Whole obligation** | the map's owner, via **`D-R6`** | `OI-S5-1`, `OI-S5-3` |

The same matrix, with the routing target and evidence class per row, is carried at `traceability/05_conceptual-obligation-and-routing-matrix.md`.

---

## 6. Why the map-side half is an adjudication, not a retype

**This is the finding that changes what is being routed**, and it is stated separately because the obvious reading of §5 — *"three clusters just need a node retyped"* — is wrong and would produce a false type in the map.

The eight-type assignment is governed by the **ordered, first-match-wins cascade `S1→S8`**, settled as **`D-S1`**. `conceptual` sits at **S8** and is reached only as a **confident residual**, after proof (S1), optimization (S2), debugging (S3), transfer (S4), strategic (S5), implementation (S6) and procedural (S7) have each declined. The union-completeness audit already records the consequence: *"the cascade structurally suppresses `conceptual` outside the first-principles layer"* — the type's instantiation is an emergent property of where the roots were drawn, not something the mapping phase produced.

Every near-candidate listed in §4.2–§4.4 carries its **own recorded `skill_type_rationale`** stating why the cascade stopped earlier — at S5 for the selection nodes, at S4 for the `recognize-…-under-an-unfamiliar-surface` family. Those rationales are node-local, they are already committed, and `D-S1` is `settled`.

**Therefore three routes exist, and choosing among them is the map owner's, not ours:**

1. **Mint a new non-root node per cluster whose acquisition is a genuine S8 residual.** §4.2–§4.4 are written in exactly that shape to make this route assessable. It requires the map owner to satisfy itself that the cascade genuinely declines S1–S7 for each — which this package cannot do on the map's behalf, because minting a node is out of scope charter-wide.
2. **Amend the cascade** so that `conceptual` is reachable per cluster. `D-S1`'s own revision trigger is *">10 `D-S1a` entries accrue at the coverage audit — signals the cascade needs revision rather than `conceptual` absorbing drift"*, or *"a mapper cannot express a real node in the schema."* **The `>10` threshold has NOT fired — the count is 1.** This route therefore requires the second limb, and the map owner must decide whether the spread bar constitutes it.
3. **Decline the spread bar** and revert to union-completeness, recording that CL-2/CL-3/CL-4 learners are taught no non-root conceptual skill. That is a charter-level reversal and is named here only so the routed decision is complete rather than leading.

**Route 4 — reclassifying an existing candidate — is barred, and is recorded as barred rather than merely unattractive.** Retyping `cl-3.recognize-bitmask-state-applicability` or `cl-4.select-mainstream-optimization` to `conceptual` would contradict that node's own committed rationale under a `settled` decision, and would install a type the cascade does not produce. The result would be a green spread row over a map that instantiates `conceptual` by fiat — the same concealment §3.4 refuses, executed one layer down. **If the map owner nonetheless judges a reclassification correct, the route is a `D-S1` challenge in the owning ledger, never a local retype.**

---

## 7. What is routed, and where

The map-side half is filed as **`D-R6`** in **`../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.11** — the sole source of truth for the status of every node in the map — **by union**: a new terminal subsection appended immediately before `## 4. Incomplete-state markers (INC-S#)`, with no prior row, subsection or byte modified. `D-R7` onward remain free for NEU-963, which appends below this one.

`D-R6` carries, in one place: the spread bar and its supersession of union-completeness; the measured 0/3 non-root state across CL-2/CL-3/CL-4; the four per-cluster obligations by reference to §4 here; the reclassification bar of §6 and the three routes that remain open; and the statement that the filing task **created no node, edge or status change**. Its status is **`unresolved`** — known open, with a named owner and a stated closure condition — and it is **not self-promoted to `settled`**, because a producing task may not promote its own artifact (`A4`).

**Owner.** The map's owner — the creator, and whichever task next writes `nodes/*.yaml` — for the map-side half. **This sub-task routes the obligation and does not resolve it on the map's behalf**; which party ultimately satisfies a map-side conceptual obligation is a charter open question, recorded as such rather than answered here.

---

## 8. The obligation rests on no verified problem citation — stated, not assumed

**There are zero verified problem-level citations in this package, and none anywhere in C009's output.** SUB-3 (NEU-959) **declined** to close `CAP-2` — not closed, and not partially closed — because all twelve sources carry access disposition `Restricted` in `01_provenance-and-rights.md` §3, the sanctioned hierarchy has no reachable leaf, and **zero requests were issued** (`D-R5`; `03_problem-citation-verification-and-access-paths.md`). **Cluster citation coverage is `0/4`** (`CAP-S3-1`). Outbound network capability was separately observed against a **neutral, non-source endpoint**, firing `CAP-S1-1`'s revision trigger via `OI-S3-2` — **capability is not authority, and the rights gate stays shut.** Nothing in this document may be read as licence to fetch a source.

**This document therefore does not assume citation coverage, and says so rather than staying silent.** The per-cluster conceptual obligation is nevertheless statable in full, for a reason that is a property of SUB-2's matrix and not a convenience:

- For a node typed `conceptual`, **`problem-reference` is `O`** and **`solution` is `O`**. Neither is required.
- The six REQUIRED forms — lesson, example, visualization, reflection, retrieval, assessment — **carry no required citation-bearing field**. `example`'s `problem_ref` is OPTIONAL and is explicitly *"never an inline invented problem."*

So the obligation is **citation-independent by construction**. That is a genuine property, and it is deliberately **not** presented as making the obligation dischargeable: three clusters remain blocked on the map, which no citation would unblock. And where a citation would be used, the interim field set is **`stable_id` + `canonical_url` only** (`CH-F5-1`, `DR-C09-01`, `CAP-S1-2`), and **an unverifiable value is refused, never invented.** No id, URL or identifier-shaped string appears anywhere in this document.

---

## 9. CL-4 and `INC-C1` — the unmapped techniques are stated missing, not covered

CL-4's analysis in §4.4 covers the cluster's **mapped** members. **The 10 `INC-C1` techniques have no nodes**, and this document neither authors them, mints them, nor implies any coverage of them.

Two are confirmed by name in `../C005-dp-map-integrity/05_findings-register.md`, and **both dangling declarations are left standing exactly as they are**:

- **`F-939-A` (SOS DP / sum-over-subsets)** — *"🔴 GENUINE GAP — confirmed"*, re-verified across all 187 nodes by id, name and summary; zero matches. Owned by NEU-942 as `INC-C1`, gated on `INC-C2` (`D-F4a`).
- **`F-939-B` (bitset / word-parallel)** — *"🔴 GENUINE GAP — confirmed"*, absent from CL-4-mainstream's 23, CL-4-frontier's 18, and all 187. CL-2's exclusion note `E4` routes it to CL-4; neither CL-4 file received it.

**No node is minted, no edge is faked, and `D-F4a` is not re-decided.** These are known, owned, adjudicated holes, and the graph is honest about them precisely because nobody filled them.

**The consequence for the spread bar, stated rather than left to inference.** Even if the map owner discharges CL-4's routed obligation in full, **the conceptual obligation of the 10 unmapped techniques remains entirely unaddressed**, because a technique with no node has no place for a conceptual obligation to attach or to be checked. That residual is filed as **`OI-S5-3`** and is **not** folded into the CL-4 row, which would misreport an unmapped gap as a mapped one.

---

## 10. The residual clause — owned, not assumed

> **…and any cluster member whose conceptual obligation is not enumerated above.**

**SUB-5 (NEU-961) owns this clause.** The four-cluster enumeration in §4 is **the floor, not the boundary.** If a cluster member — a technique node, a member added by a later mapping pass, or one of the `INC-C1` techniques once mapped — carries a conceptual obligation that §4 does not enumerate, that omission is **this sub-task's to record**, not one that disappears because the enumeration looked complete.

The clause is **standing and, at this cutoff, exercised exactly once**: §9's `INC-C1` residual is a member set whose conceptual obligation §4 does not and cannot enumerate. It is filed as `OI-S5-3`. The clause itself is kept live as **`OI-S5-5`** so that it is not read as discharged by the fact that §4 addresses 4/4 clusters. **Cluster-level completeness is not member-level completeness**, and conflating the two is the specific error this clause exists to prevent.

---

## 11. What this document does not do

- It does **not** author, mint, reclassify, retype or edit any map node, edge, `progression_stage`, `entry_gate` or difficulty value. Nothing under `../C005-dp-map/` is written by this sub-task.
- It does **not** discharge the routed map-side half, and does **not** report the coverage as achieved. The completion condition is *specified and routed*.
- It does **not** close `F-943-2`, and must not be cited as closing it.
- It does **not** re-decide `D-S1`'s cascade, `D-F4a`, `CH-F5-1`, `CAP-2`, or any access-permission row.
- It does **not** author the conceptual content itself — SUB-11's exemplars demonstrate, and bulk authoring is charter-wide out of scope.
- It does **not** specify which gate enforces any of this, nor any severity tier or linter rule — that is **SUB-9 (NEU-965)**, which consumes §3's form set and field names verbatim.
- It sets **no status.** Status lives in a ledger.

**No QA-engine run is claimed.** `qa-execution:engine` is unconfigured in this project's capability registry, so the QA-execution phase is a genuine **Core Article 8 no-op**. No QA pass, scenario, verdict or report is asserted or implied anywhere by this sub-task (`CAP-S5-3`, consistent with `CAP-S1-3` and `CAP-S2-2`).

---

## 12. Evidence and records

| Record | Path |
| --- | --- |
| Per-cluster obligation × discharge split × routing matrix (the 4/4 check) | `traceability/05_conceptual-obligation-and-routing-matrix.md` |
| The routed map-side half (`D-R6`, status `unresolved`) | `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.11 |
| Open items filed by this sub-task | `90_open-items-and-provisional-register.md` § `SUB-5` |
| Caps and incomplete scope declared by this sub-task | `91_caps-and-incomplete-scope.md` § `SUB-5` |
| The consumed form contract, placement matrix and required field pair | `02_content-and-exercise-forms.md` §3, §4, §6.3, §7 |
| `F-943-2`, the per-cluster absence table, and the union criterion as written | `../C005-dp-map-integrity/02_skill-type-union-completeness.md` §2–§4 |
| `F-939-A`, `F-939-B` | `../C005-dp-map-integrity/05_findings-register.md` |
| The cascade `S1→S8` and its revision trigger (`D-S1`, `settled`) | `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §2; `../C005-dp-map-schema/01_node-and-edge-schema.md` §3 |
| Cluster definitions (`CL-1`…`CL-4`) | `../C005-dp-map/manifest.yaml` |
| The rights gate, the declined `CAP-2` closure, and 0/4 cluster citation coverage | `01_provenance-and-rights.md` §3 · `03_problem-citation-verification-and-access-paths.md` §11, §12 · `D-R5` |

**Evidence classes.** The node counts, types and ids in §1 and §4 are class 2 `[code-evidence]` — read directly from the committed node YAML at the 2026-08-10 cutoff. The criterion statements in §2 and the cascade reasoning in §6 are class 1 `[literature]` in the register's sense: read from the committed schema and audit documents, not re-derived. **No claim in this document is class 3 or below, and none rests on a network fetch, because none was made.**
