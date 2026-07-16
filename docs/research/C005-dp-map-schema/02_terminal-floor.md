# The Terminal Floor — DP Roots and the Assumed-Knowledge Boundary Register

**Task:** NEU-933 · **Decisions:** `D-S2` (roots), `D-S3` (boundary register) · **Compiled:** 2026-07-16 · **Status:** see `adjudication/01_schema-decision-ledger.md` — this file sets none

This file defines **where the graph bottoms out**. It has two limbs, and the pair is the whole floor:

1. **The DP first-principle root nodes** — `../C005-dp-map/nodes/cl-1-foundational.yaml` (8 nodes, frozen)
2. **The assumed-knowledge boundary register** — `../C005-dp-map/boundary-register.yaml` (5 anchors, version `1.0.0`)

> **A legitimate prerequisite chain terminates on exactly one of: an explicit DP root node, or a registered boundary anchor. Anything else that bottoms out is an unexplained jump.**

---

## 1. Why a floor is needed at all

Without a defined floor, "what does this depend on?" has no stopping rule, and each of five parallel mappers invents its own. Two failure modes follow, and they are opposites:

- **Bottomless.** A mapper chases prerequisites downward forever — bitmask DP needs bitwise ops, which need binary representation, which needs… The map silently becomes a general CS curriculum, which is not this charter's audience line.
- **Jumpy.** A mapper stops wherever it feels done, and the graph is full of nodes whose chains just *end*, with no way to tell "this is the bottom" from "somebody got tired". **An audit cannot distinguish a deliberate terminal from an omission**, so the coverage claim is worthless.

The floor fixes both by making termination **explicit and enumerable**. A chain ending on a registered thing is *sanctioned*. A chain ending anywhere else is a *defect* — and now detectably so.

## 2. Limb 1 — the DP first-principle roots (`D-S2`)

The charter names four DP first principles. Each is represented as **two nodes**: the knowledge and the skill it licenses. **Eight roots, all `status: "settled"`, all `frozen: true`.**

| Principle | Knowledge node | Skill node | Skill type |
| --- | --- | --- | --- |
| Optimal substructure | `cl-1.root.optimal-substructure` | `cl-1.root.recognize-optimal-substructure` | `conceptual` |
| Overlapping subproblems | `cl-1.root.overlapping-subproblems` | `cl-1.root.recognize-overlapping-subproblems` | `conceptual` |
| State/transition/base-case formulation | `cl-1.root.state-transition-base-case-formulation` | `cl-1.root.formulate-state-transition-base-case` | `strategic` |
| Memoization vs tabulation | `cl-1.root.memoization-vs-tabulation` | `cl-1.root.implement-memoization-and-tabulation` | `implementation` |

### 2.1 Why each principle is two nodes, not one

The schema forces a knowledge/skill distinction on every node (`01_…` §1). **If the roots ducked it, the distinction would be decorative** — the floor every mapper reads first would model four principles as undifferentiated blobs, and mappers would reasonably copy that.

The distinction is also *true* here, not ceremonial. Knowing what optimal substructure **is** and being able to **spot it in a problem statement** are different acquisitions that fail differently: a learner who can recite the definition and still cannot tell whether a given problem has the property is the single most common DP failure. One node cannot represent both, because a learner can have one and not the other.

**The roots are therefore the schema's worked specimen**: 4 knowledge + 4 skill, exercising three of the eight skill types, each with a `skill_type_rationale` stating its cascade path. A mapper that reads them before writing has seen every required field filled in correctly.

### 2.2 Why these four principles and no others

They are the charter's, verbatim, and this sub-task does not extend the set. Adding a fifth would be a **family-mapping decision** — explicitly out of scope. The four are also non-arbitrary as a set: **optimal substructure** and **overlapping subproblems** are the two properties that make DP *applicable*; **state/transition/base-case** is the vocabulary a formulation is *expressed* in; **memoization vs tabulation** is how a formulation is *evaluated*. Applicability, expression, evaluation. Everything in every cluster is a variation on one of those three.

**Recorded rejected alternative:** *roots as a single "DP fundamentals" node.* Rejected because it gives every cluster the same terminal, which makes the floor audit vacuous — every chain would bottom out identically and the audit would prove nothing beyond "the chain reached the bottom node". Eight distinct roots mean a chain's terminal **says something**: a CL-4 optimization node bottoming out on `formulate-state-transition-base-case` asserts something real and falsifiable.

**Recorded rejected alternative:** *deriving the root skills' prerequisites down to programming fundamentals.* Rejected as the "bottomless" failure of §1 and as out of scope — that is NEU-887's elementary floor, below this map.

### 2.3 Root-internal edges — deliberately minimal

Roots depend only on other roots (a small DAG), never on a technique, an anchor, or a cross-cluster target. The edges drawn are only the ones that are hard to dispute: **each skill requires its own knowledge node**, plus `formulate-…` requires the two recognition skills, and `implement-memoization-and-tabulation` requires `formulate-…`.

**This is not a progression.** Ordering the roots into a *teaching sequence* is SUB-7's (OUT-3), through NEU-888's mastery semantics. A prerequisite edge is a **structural claim** ("you cannot acquire A without B"); a progression is a **pedagogical claim** ("teach B, then A"). They are different artifacts and this file makes only the first. The edges here are kept minimal precisely to avoid smuggling a progression in through the floor.

### 2.4 The roots are frozen

`frozen: true`. **SUB-3 appends its CL-1 family nodes below the marker and does not edit, reorder, or remove a root.** A root changes only via a ledger challenge against `D-S2`.

**Why the roots live in CL-1's file at all:** NEU-932 `D-F4` §1 makes the first principles CL-1 members — *"These are cluster members (CL-1 owns them) but are roots, not techniques."* So this is where they belong. **This is not a shared file**: SUB-2 wrote the root block and landed it *before* SUB-3 starts, so SUB-3 remains the sole writer for the whole mapping phase. Sequential authorship, not concurrent — per-cluster file ownership is intact and the five mappers still run in parallel.

**Recorded rejected alternative:** *a separate `nodes/roots.yaml`.* It would keep SUB-3's file pristine, but it changes the file layout `D-F3` fixed and that four other sub-tasks are already scoped to — a local redesign where the sanctioned route is a ledger challenge. It would also register CL-1 as a two-file cluster, adding a second instance of the many-files shape for no gain. The frozen-block-plus-marker achieves the same isolation inside the layout as given. **Cost, recorded:** the isolation is a comment and a convention rather than a filesystem boundary, so a careless SUB-3 *could* edit a root. Mitigated by `frozen: true` being machine-checkable (**V-17**) and by the marker being impossible to miss.

## 3. Limb 2 — the assumed-knowledge boundary register (`D-S3`)

**Version `1.0.0`. Five anchors. Frozen during mapping.**

| Anchor | Kind |
| --- | --- |
| `anchor.segment-tree` | data-structure |
| `anchor.li-chao-tree` | data-structure |
| `anchor.convex-hull-envelope-geometry` | mathematics |
| `anchor.modular-arithmetic` | mathematics |
| `anchor.linear-algebra` | mathematics |

Exactly the anchors the NEU-933 spec sanctions — segment / Li Chao trees, convex-hull / envelope geometry, modular and linear algebra. **The register invents none.**

### 3.1 What an anchor is, and where the boundary sits

An anchor is a **non-DP** prerequisite that a DP technique genuinely needs, sitting **at or above NEU-887's elementary-data-structures floor** and **outside NEU-932's DP technique-space partition**.

```
        ┌─────────────────────────────────────────┐
        │   The DP partition — CL-1 … CL-4        │   mapped by SUB-3/4/5/6/13
        ├─────────────────────────────────────────┤
        │   DP first-principle roots (8)          │   ← floor limb 1  [FROZEN]
        ├─────────────────────────────────────────┤
        │   Boundary anchors (5)                  │   ← floor limb 2  [FROZEN]
        │   NOT DP · named + versioned · NOT decomposed
        ├─────────────────────────────────────────┤
        │   NEU-887 elementary data structures    │   out of scope for this charter
        └─────────────────────────────────────────┘
```

NEU-932 `D-F4` §1 already routes these outward: *"A mapper that finds itself wanting to assign a cluster to 'segment tree' has crossed the boundary and should register an anchor instead."* This register is the other side of that instruction.

**Membership test** (all three must hold): the thing is **not DP**; it is a **real prerequisite** of at least one technique in the partition; and it is **above the elementary floor** — not something NEU-887 already assumes.

### 3.2 The point: a registered anchor is a sanctioned terminal, not a jump

**This is the entire reason the register exists.** Without it, a CHT node's dependency on envelope geometry is a chain that *stops* — indistinguishable from a mapper who quit early. With it, the same edge is a **positive assertion**: *this dependency is real, it is non-DP, it is deliberately outside our audience line, and here is its name and version.*

**Registration converts "this chain just ends" into "this chain bottoms out somewhere we deliberately don't go."** The first is an omission; the second is a decision. The floor audit can tell them apart — which is the property the whole floor exists to buy.

### 3.3 Anchors are named and versioned, never decomposed

**Non-negotiable, and machine-checkable.** Every anchor asserts `decomposed: false`. There is **no `prerequisites` field on an anchor**, and adding one is out of scope.

Decomposing `anchor.segment-tree` into its internals — build, query, lazy propagation, and *their* prerequisites — is a **general-algorithms concern outside this charter's audience line**. That way lies the "bottomless" failure of §1: the map quietly becomes a general CS curriculum and the DP map it was supposed to be is diluted into it.

**Versioning matters and is not ceremony.** Anchor references are **version-pinned** (`anchor.modular-arithmetic@1.0.0`). If an anchor's scope later changes, **every dependent's terminal shifts meaning** — a node that terminated on "modular arithmetic" meaning modular inverses now terminates on something else. That is a MAJOR bump of `register_version`, and the pin is what makes it **detectable rather than silent**. Adding an anchor is a MINOR bump: existing terminals are unaffected.

### 3.4 Why Li Chao is registered separately from segment tree

The spec writes "segment / Li Chao trees" as one phrase, so folding them into one anchor was the obvious reading. **Rejected, and recorded:** a CHT node depending on `anchor.segment-tree` says materially less than one depending on `anchor.li-chao-tree` — the Li Chao structure is the specific thing it needs. Folding costs a real distinction **in every dependent**; splitting costs one extra register row. The distinction was kept. Recorded so a reviewer sees the choice was made rather than assumed.

### 3.5 Anchors are DRAWN, never declared

A mapper draws straight onto an anchor from its own file:

```yaml
prerequisites:
  boundary_anchors: ["anchor.modular-arithmetic@1.0.0"]
```

**Not** a `cross_cluster_attachments` entry. Anchors exist in the shared floor **from the start**, so there is nothing for SUB-12 to resolve — the spec is explicit that they are *"drawn directly by family sub-tasks, never declared for the integration pass."* A mapper that declares an anchor as an attachment point will have it reported unresolvable, because SUB-12 resolves against sibling **clusters** and an anchor is not in one.

This is the same mechanic as roots, for the same reason (`01_…` §4.2): **draw to what exists; declare what doesn't.**

### 3.6 The register is not asserted complete — route AR-1

**The register is exactly the spec's sanctioned set. It is not claimed to cover the technique space**, because that space does not exist yet (NEU-932 `INC-D3`). Recorded as **`INC-S1`** rather than papered over.

A mapper hitting a real non-DP prerequisite with no anchor:

> **AR-1.** File a ledger request against `D-S3` naming the anchor, the dependent node, and why the prerequisite is genuinely non-DP (i.e. why NEU-932's cascade does not own it). Meanwhile: record it in the node's `notes` and set `status: "provisional"`.
>
> **Never:** invent an anchor locally (invisible to every other mapper and to the audit); fake it as a `roots` edge (**launders a non-DP dependency into the DP floor — exactly what the floor audit hunts**); declare it as cross-cluster (anchors aren't sibling nodes; SUB-12 will report it unresolvable); or drop it silently (a smoothed gap — forbidden).

**A concrete case is already foreseen, and is recorded so SUB-5 is not surprised** (`INC-S1`): **automaton DP** (incl. Aho–Corasick DP) is assigned to CL-3 by `D-F4` §3.2. Its non-DP prerequisite — Aho–Corasick construction / string-matching automata — **is not in the register**, because the spec does not name it and the register does not invent anchors. SUB-5 will hit this and should run AR-1.

Naming the gap now, with its owner and its route, is the honest move. The alternative — quietly adding an anchor the spec did not sanction — would be inventing scope under cover of helpfulness, and would make the register's boundary a matter of each mapper's judgment rather than a decision.

## 4. The floor in use — all four clusters

| Chain | Terminates on | Disposition |
| --- | --- | --- |
| CL-1 family node → `cl-1.root.formulate-…` | Root | **DRAWN.** Intra-cluster *and* a root. |
| CL-2 interval DP → `cl-1.root.formulate-…` | Root | **DRAWN.** Root ids are `cl-1.` but this is **not** a cross-cluster declaration (`01_…` §4.2). |
| CL-3 SOS DP → `anchor.modular-arithmetic@1.0.0` | Anchor | **DRAWN.** Sanctioned terminal. |
| CL-4 CHT → `anchor.convex-hull-envelope-geometry@1.0.0` | Anchor | **DRAWN.** Sanctioned terminal. |
| CL-4 matrix-exp DP → `anchor.linear-algebra@1.0.0` | Anchor | **DRAWN.** `D-F4` §3.2 routes it here explicitly. |
| CL-4 Knuth opt → CL-2's interval DP | **Neither** | **DECLARED.** Not a terminal at all — a sibling's node. SUB-12 realizes it; the chain continues through CL-2 and bottoms out on a root there. |
| CL-3 automaton DP → Aho–Corasick | **Nothing yet** | **`INC-S1`.** Run AR-1. `status: "provisional"`, recorded in `notes`. **Not** faked as a root edge. |

**The last two rows are the ones that matter.** A cross-cluster attachment is *not* a terminal — it is a chain **continuing** into a sibling cluster, and it bottoms out over there. And an unregistered anchor is an **open request**, not an excuse to fake a terminal.

## 5. Floor self-check (the spec's root-floor verification evidence)

| Check | Passing condition | Result |
| --- | --- | --- |
| **FC-1** | Every DP first principle the charter names has an explicit root node. | **Pass** — 4/4, each as a knowledge + skill pair. |
| **FC-2** | Every root is **typed**: `node_kind` present; every skill root carries exactly one of the eight `skill_type`s. | **Pass** — 8/8. 4 knowledge (no `skill_type`), 4 skill (`conceptual` ×2, `strategic`, `implementation`). |
| **FC-3** | Every skill root states its cascade path, not just its answer. | **Pass** — 4/4 carry `skill_type_rationale` naming the rejected tests. |
| **FC-4** | The boundary register is **versioned**. | **Pass** — `register_version: "1.0.0"`; anchor refs version-pinned; MAJOR/MINOR rules stated. |
| **FC-5** | The register names **every** sanctioned non-DP anchor the spec lists. | **Pass** — 5/5: segment tree, Li Chao tree, convex-hull/envelope geometry, modular arithmetic, linear algebra. |
| **FC-6** | The register **decomposes no** anchor's internals. | **Pass** — `decomposed: false` on 5/5; no anchor has a `prerequisites` field; the schema defines none. |
| **FC-7** | Anchors sit **outside** the DP partition and **above** NEU-887's elementary floor. | **Pass** — membership test §3.1; consistent with `D-F4` §1 and `PC-6`. |
| **FC-8** | A prerequisite edge ending on a registered anchor is a **sanctioned terminal**, distinguishable from a jump. | **Pass** — registration is the distinguisher (§3.2); an edge to an unregistered target fails **V-5**. |
| **FC-9** | Both floor limbs are **drawn**, not declared, and reachable at **map time**. | **Pass** — `prerequisites.roots` / `prerequisites.boundary_anchors`; `D-S4` argues it; **R5** warns SUB-12 off re-drawing. |
| **FC-10** | The floor makes **no** family-mapping or progression decision. | **Pass** — no technique node authored; root-internal edges minimal and structural, explicitly not a progression (§2.3). |
| **FC-11** | The register's incompleteness is **declared**, with a route and an owner — not implied complete. | **Pass** — `INC-S1`, route AR-1, Aho–Corasick named as the foreseen case. |
| **FC-12** | No root or anchor is asserted on evidence it doesn't have. | **Pass** — all class 1 `[literature]`. No class-7 claim anywhere. |
