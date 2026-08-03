# 03 — Representative Path Set vs OUT-6's Fixed Criterion

**Deliverable 3 of 4** · **Covers:** OUT-6 · **Verdict: PASS (5/5)**

---

## 1. The criterion, counted

OUT-6 fixes the bar **before** the walk, so the path set is measured, not curated:

| # | Requirement | Result |
| - | ----------- | ------ |
| 1 | ≥1 foundation-to-advanced path in **CL-1** (foundational / linear) | ✅ |
| 2 | ≥1 in **CL-2** (combinatorial / structural) | ✅ |
| 3 | ≥1 in **CL-3** (state-compression / specialized) | ✅ |
| 4 | ≥1 in **CL-4** (DP-optimization — **ONE** cluster, both files) | ✅ |
| 5 | ≥1 path reaching a **maximalist / research-tier** endpoint | ✅ |
| — | every path reaches the sanctioned floor with **no unexplained jump** | ✅ 5/5 |

> **`len(clusters)` = 4.** The count is against the **four-cluster** partition. CL-4's
> mainstream/frontier split is one-PR sizing; the manifest registers both files under a
> single `CL-4` id. Counting node files (5) would fabricate a fifth cluster and silently
> break this criterion. Verified in the manifest, not assumed.

Endpoints were selected **mechanically** — the deepest node in each cluster by computed
prerequisite depth — not hand-picked to flatter the result.

## 2. The four per-cluster walkthroughs

Each path is written **dependent → prerequisite**, i.e. reading downward is descent toward
the floor. A learner traverses it bottom-up. Every hop is an edge that exists in the
graph; **no hop is narrated into existence.**

### 2.1 CL-1 — Foundational / linear-sequence · 7 hops → ROOT

```
cl-1.formulate-sequence-partition-dp        PS-4
 -> cl-1.range-aggregate-by-difference      PS-4
 -> cl-1.build-prefix-aggregate             PS-4
 -> cl-1.prefix-aggregate-recurrence        PS-3
 -> cl-1.linear-sequence-dp-1d              PS-2
 -> cl-1.linear-dp-pattern-catalogue        PS-1
 -> cl-1.root.state-transition-base-case-formulation   [ROOT — frozen]
```

**Terminal: DP root.** Stage sequence PS-4→PS-1 descends monotonically. Clean.

### 2.2 CL-2 — Combinatorial / structural · 10 hops → ROOT

```
cl-2.debug-overcounting-from-loop-nesting   PS-4
 -> cl-2.implement-counting-dp-loop-nesting PS-4
 -> cl-2.combination-vs-permutation-loop-order  PS-4
 -> cl-2.counting-vs-optimizing-objective   PS-4
 -> cl-1.counting-dp-over-linear-domain     PS-4   [cross-cluster: CL-2 -> CL-1]
 -> cl-1.grid-path-dp                       PS-4
 -> cl-1.linear-sequence-dp-2d              PS-3
 -> cl-1.linear-sequence-dp-1d              PS-2
 -> cl-1.linear-dp-pattern-catalogue        PS-1
 -> cl-1.root.state-transition-base-case-formulation   [ROOT — frozen]
```

**Terminal: DP root.** The longest path in the graph. The CL-2→CL-1 hop is a **realized
NEU-939 edge** (`xce.cl-2.counting-vs-optimizing-objective->cl-1.counting-dp-over-linear-domain`),
not an assumed jump. Non-increasing in stage. Clean.

### 2.3 CL-3 — State-compression / specialized-domain · 9 hops → ROOT

```
cl-3.implement-steiner-tree-dp              PS-4
 -> cl-3.steiner-tree-dp-state-encoding     PS-4
 -> cl-3.subset-cover-transition-correctness PS-4
 -> cl-3.submask-enumeration                PS-4
 -> cl-3.bitmask-state-encoding             PS-4
 -> cl-2.subset-sum-feasibility             PS-3   [cross-cluster: CL-3 -> CL-2]
 -> cl-2.zero-one-knapsack-recurrence       PS-2
 -> cl-2.item-selection-state-space         PS-1
 -> cl-1.root.optimal-substructure                 [ROOT — frozen]
```

**Terminal: DP root. Structurally clean — every hop exists, no unexplained jump.**

**And now stage-consistent too.** As walked at the audit, `cl-3.bitmask-state-encoding` was
annotated **PS-1** while its prerequisite `cl-2.subset-sum-feasibility` is **PS-3** — a
learner following the stages would have met the dependent *two stages before* the thing it
requires. The **edge** was right; the **annotation** was wrong. That was **F-943-1**
(§`04`), a defect in the annotation layer and not in the graph, and **NEU-954 repaired it**:
the node reads **PS-4**, the descent is non-increasing, and the path carries no inversion.
**`F-943-1` is CLOSED** (ledger `D-R4`).

### 2.4 CL-4 — DP-optimization (mainstream + frontier, jointly) · 8 hops → ROOT

```
cl-4.implement-modular-matrix-power         PS-4
 -> cl-4.construct-transfer-matrix          PS-4
 -> cl-4.matrix-exponentiation-dp           PS-4
 -> cl-3.formulate-automaton-dp             PS-4   [cross-cluster: CL-4 -> CL-3]
 -> cl-1.linear-sequence-dp-2d              PS-3
 -> cl-1.linear-sequence-dp-1d              PS-2
 -> cl-1.linear-dp-pattern-catalogue        PS-1
 -> cl-1.root.state-transition-base-case-formulation   [ROOT — frozen]
```

**Terminal: DP root.** Traverses CL-4 → CL-3 → CL-1 — the only CL-4→CL-3 edge in the
graph — and demonstrates that the optimization cluster grounds through a *specialized*
cluster, not only through CL-1. Structurally clean; it carried one **F-943-1** stage
inversion at the CL-3→CL-1 hop, and after NEU-954's re-derivation
(`cl-3.formulate-automaton-dp` **PS-2 → PS-4**) it carries none.

`cl-4.matrix-exponentiation-dp` also draws `anchor.linear-algebra`, a **registered
anchor** — a second, equally sanctioned terminal on the same node. Its non-DP
prerequisite bottoms out cleanly rather than being laundered into the DP floor.

## 3. The research-tier path — verified hop-by-hop, not assumed

NEU-938 supplies a maximalist endpoint. The instruction was to **verify it, not assume
it**. Verified — every node exists and **every hop is a real edge**:

```
cl-4.larsch-online-smawk-implementation     PS-4   [frontier — research-tier]
 -> cl-4.smawk-application                  PS-4     edge PRESENT
 -> cl-4.total-monotonicity                 PS-3     edge PRESENT
 -> cl-4.quadrangle-inequality              PS-2     edge PRESENT
 -> cl-1.root.optimal-substructure                   edge PRESENT  [ROOT — frozen]
```

| Check | Result |
| ----- | ------ |
| All 5 nodes exist | ✅ |
| All 4 hops are real edges | ✅ **no unresolved hop** |
| Terminates on a DP root | ✅ `cl-1.root.optimal-substructure` |
| Stage-monotone (PS-4→PS-4→PS-3→PS-2→root) | ✅ **no inversion** |
| Endpoint is research-tier | ✅ Larsch's online SMAWK, from `frontier.yaml` |

**This is the cleanest path in the set** — and, at the time of the audit, the only one of
the five walked in full that was *both* structurally and stage-consistently clean. It
descends from an online linear-time SMAWK implementation to *optimal substructure* in four
hops with no jump. **Since NEU-954's re-derivation all five are stage-consistent** (§4);
this one needed no correction to get there.

The frontier file holds **18** research-tier nodes (PS-1 ×3, PS-2 ×4, PS-3 ×1, PS-4 ×10 —
**re-counted against the repaired map, unchanged**),
so the maximalist endpoint is representative of a populated tier, not a lone spike.

## 4. Consistency with NEU-940's stages and dimensions — the honest result

**The verdict was split when this audit ran. It is no longer:**

| Property | Result |
| -------- | ------ |
| Every path reaches the sanctioned floor | ✅ **5/5** |
| Every path free of unexplained jumps | ✅ **5/5** |
| Every path consistent with NEU-940's `progression_stage` | ✅ **5/5** — was **3/5**; the CL-3 and CL-4 inversions are gone |
| Every path consistent with NEU-940's `difficulty_dimensions` key-set | ✅ 179/179 share one key-set |
| Declared `prerequisite_depth` matches the walked depth | ✅ **179/179** — was **153/179**, 26 under-reporting |

OUT-6 requires each path be *"consistent with the NEU-940 progression stages and
difficulty dimensions."* **Two of the five walked paths were not**, and the depth
annotation disagreed with the graph on 26 nodes. Both defects had **one** root cause and
were recorded as **F-943-1** (§`04`).

That was reported as a **flagged finding against the annotation layer, not as a path
failure**: the paths themselves were structurally sound — every hop exists and every
terminal is sanctioned. What failed was NEU-940's labelling of nodes those paths cross.
Smoothing it here — by quietly re-staging the six nodes — would have edited node files this
task does not own, concurrently with NEU-941, to hide a defect NEU-940 explicitly routed
here. **The route did the work instead: NEU-954 re-derived both fields over the
edge-complete graph, and `F-943-1` is CLOSED** (ledger `D-R4`). The per-hop stage labels in
§2 are restated against the repaired map.

## 5. Scope note — representative, not exhaustive

Five paths satisfy a **minimum-count** criterion. They are **not** a claim that every
foundation-to-advanced route in the graph is clean. The exhaustive guarantee is
`01_dependency-and-cycle-audit.md`'s: **all 179 non-root nodes reach the sanctioned
floor**, which is the whole-graph statement these five illustrate. Topic volume is never
coverage, and neither is path count — the five are witnesses to a criterion, and the
reachability audit is the proof.
