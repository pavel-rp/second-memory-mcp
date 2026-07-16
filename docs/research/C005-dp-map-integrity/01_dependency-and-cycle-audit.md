# 01 — Dependency and Cycle Audit

**Deliverable 1 of 4** · **Covers:** OUT-2 · **Verdict: PASS**
**Scope:** all 187 nodes, all 572 edges, including the NEU-939 cross-cluster layer.

---

## 1. Verdict

| Check | Result |
| ----- | ------ |
| **Acyclic?** | ✅ **YES — 0 cycles.** No cycle is retained, so none requires justification. |
| Every non-root chain reaches the sanctioned floor? | ✅ **YES — 0 ungrounded nodes.** |
| Non-root nodes with zero prerequisites? | ✅ **0** |
| Chains ending anywhere other than a root or a registered anchor? | ✅ **0** |
| Dangling edge endpoints? | ✅ **0** of 572 |

> **The graph is acyclic.** The acyclic-**or**-every-cycle-justified obligation is
> discharged on the first limb: there is no cycle to justify. This is a stronger result
> than the disjunction required, and it is the one that lets downstream traversal be a
> topological order rather than a negotiated one.

## 2. Cycle audit — method

Three-colour DFS (white/grey/black) over the **whole** edge-complete graph. A grey→grey
back-edge is a cycle and the stack slice is reported verbatim. Both limbs matter:

- **Boundary anchors are excluded as vertices**, and correctly so. An anchor is a
  *terminal*, never decomposed (`decomposed: false` asserted on all 5). Adding anchors as
  vertices could not create a cycle — they have no outgoing edges — but modelling them as
  graph nodes would misrepresent the floor.
- **The cross-cluster layer is included.** Excluding it would make the audit vacuous:
  NEU-939's `R1` deliberately refuses to merge two opposing declarations into one edge
  *precisely so* a mutual dependency surfaces here as a visible cycle.

### 2.1 Result: 0 cycles

NEU-939 reported it introduced no 2-cycle, and explicitly declined to call that a
clearance: whole-graph acyclicity (`V-18`) spans intra-cluster and root edges too and was
left to OUT-2. **This audit closes `V-18`:** the whole graph — 293 intra-cluster + 223
root + 25 cross-cluster edges — is acyclic. NEU-939's narrower claim is confirmed and
subsumed.

The cluster-pair census corroborates the shape: all 25 cross-cluster edges point *down*
the dependency order (optimization → base formulation; compressed encoding → ordinary
encoding). **Nothing points out of CL-1, and CL-1 declares no attachments at all** — the
foundational cluster is a strict sink of the cross-cluster relation. A cycle would have
required an edge out of CL-1; there is none.

## 3. Floor audit — where chains are allowed to bottom out

A legitimate chain terminates on **exactly one of**:

1. a DP first-principle **root** (`role: "root"`, 8 of them, frozen); or
2. a **registered boundary anchor** (5, in `boundary-register.yaml`).

Anything else is an **unexplained jump**. Reachability from all 179 non-root nodes:

| Outcome | Count |
| ------- | ----- |
| Reaches a root and/or a registered anchor | **179 / 179** |
| **Unexplained jumps** | **0** |
| Nodes terminating on a registered anchor (clean terminals) | 23 |

### 3.1 Anchors scored as clean terminals — not gaps

The 31 anchor edges from 23 nodes land on all 5 registered anchors. Per `D-S3` each is a
**sanctioned terminal**. This audit scores them clean and does **not** report them as
gaps. Recording it explicitly because the opposite error — treating a legitimately
undecomposed anchor as a missing prerequisite — would manufacture 23 phantom findings and
pressure someone into decomposing a boundary the charter deliberately draws.

### 3.2 The laundering check — the one thing this audit exists to catch

The named failure mode is faking a real cross-cluster or non-DP dependency as a **root or
anchor edge** so a chain bottoms out. Verified negative on both limbs:

- **223/223** `prerequisites.roots` edges point at an actual `role: "root"` node. No
  roots-field edge targets a non-root.
- **31/31** `boundary_anchors` edges name an anchor **registered** in
  `boundary-register.yaml`. **No locally invented anchor exists** — the `AR-1` forbidden
  action `invent-locally` did not occur.
- **0** root/anchor edges re-drawn in `cross-cluster.yaml`, so no floor edge is
  duplicated and neither the dependency nor the path audit is corrupted.

## 4. Referential and structural integrity

| Check | Result |
| ----- | ------ |
| Node ids unique across all 5 files | ✅ 187/187, 0 duplicates |
| Every edge endpoint resolves to a real node or registered anchor | ✅ 572/572 |
| `intra_cluster` edges stay inside their own cluster | ✅ 293/293 |
| Cross-cluster edges genuinely cross (`from_cluster != to_cluster`) | ✅ 25/25 |
| Roots carry `difficulty_dimensions: {}` (frozen, `DR-S02`) | ✅ 8/8 |
| No `knowledge` node carries a `skill_type` | ✅ 75/75 |
| Anchors registered vs `anchor_count` | ✅ 5 = 5 |

The knowledge/skill split is **75 knowledge / 112 skill**. The schema's knowledge/skill
distinction is honoured at the floor itself: each of the 4 first principles appears twice,
once as knowledge and once as skill.

## 5. What this audit does NOT claim

- **Acyclicity is not coverage.** A graph can be perfectly acyclic and still miss a
  technique entirely — as this one does, twice (`F-939-A`, `F-939-B`, §`04`). Structure
  and coverage are different properties; only the latter is NEU-942's, and it is settled
  there.
- **Grounding is not correctness of altitude.** Every chain reaches the floor; whether
  each individual edge attaches at the *right* altitude is a separate judgment —
  see `F-939-1` in `05_findings-register.md`.
- **Acyclicity does not validate the annotations.** The graph's *structure* is clean while
  its *stage/depth annotation* is measurably not (**F-943-1**, `04`). A topological order
  exists; NEU-940's `progression_stage` does not currently agree with it across 6
  cross-cluster edges.
