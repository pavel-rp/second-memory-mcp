# C005 — The DP Knowledge-and-Skill Map

**Program:** C005 (AI-backed dynamic-programming course) · **Charter:** NEU-889 · **Map version:** `0.1.0` · **Schema version:** `1.0.0` · **Status:** scaffold

**This is the map itself** — the graph artifact. It is the *one hop* a cold-context agent starts from.

- **The schema, the reasoning, and the registers** live next door in [`../C005-dp-map-schema/`](../C005-dp-map-schema/) (NEU-933).
- **The format, the taxonomies, the corpora, and the four-cluster partition** were fixed by NEU-932 in [`../C005-dp-map-foundations/`](../C005-dp-map-foundations/).

---

## ▶ Which file do you want?

| You are… | Read |
| --- | --- |
| **A family mapper** (SUB-3/4/5/6/13) | Your own node file's header, then [`../C005-dp-map-schema/03_per-node-record-template.md`](../C005-dp-map-schema/03_per-node-record-template.md). Copy the template; do not improvise fields. |
| **The integration pass** (SUB-12) | [`edges/cross-cluster.yaml`](edges/cross-cluster.yaml)'s header — especially **R5**, which tells you what is *not* your input. |
| **An audit** (OUT-6/OUT-7, SUB-9…11) | [`manifest.yaml`](manifest.yaml) — cluster registry and terminal floor. **Count clusters as `len(clusters)`. It is 4. Never count node files; that number is 5.** |
| **A cold agent, orienting** | This README, then `manifest.yaml`. |
| **Anyone wondering why** | [`../C005-dp-map-schema/`](../C005-dp-map-schema/) — every decision with its rejected alternatives. |

## What exists right now

The map is a **scaffold**: the floor is built, the technique space is not.

| Present | Count | Authored by |
| --- | --- | --- |
| DP first-principle **root** nodes | 8 (4 knowledge + 4 skill) | NEU-933 |
| Assumed-knowledge **boundary anchors** | 5 | NEU-933 |
| DP **technique** nodes | **0** | the five mappers, next |
| Cross-cluster **edges** | **0** | SUB-12, after the mappers |

**Zero technique nodes is the correct state, not a gap.** NEU-933 authors no family node by design — it builds the scaffolding the mapping sub-tasks fill.

## The layout

```
docs/research/C005-dp-map/
  manifest.yaml                    # map_version, CLUSTER REGISTRY, schema version, status legend
  README.md                        # you are here — the prompt entry point
  boundary-register.yaml           # the 5 sanctioned non-DP anchors  [FROZEN]
  nodes/
    cl-1-foundational.yaml         # SUB-3 (NEU-934) — plus the FROZEN 8-root block
    cl-2-combinatorial.yaml        # SUB-4 (NEU-935)
    cl-3-state-compression.yaml    # SUB-5 (NEU-936)
    cl-4-optimization/             # CL-4 is ONE cluster, two disjoint files
      mainstream.yaml              #   SUB-6  (NEU-937)
      frontier.yaml                #   SUB-13 (NEU-938)
  edges/
    cross-cluster.yaml             # SUB-12 (NEU-939) — empty during mapping
  index/
    00_technique-index.md          # GENERATED — never hand-edited
```

**Exactly one sub-task writes each file.** That is what lets the five mappers run in parallel, and it is a hard requirement, not a convenience (NEU-932 D-F3 §4).

## The four clusters

| Id | Name | Defining contribution | Mapper |
| --- | --- | --- | --- |
| **CL-1** | Foundational / linear-sequence | DP first principles; state is a plain index tuple over a linear domain. The **confident residual**. | SUB-3 |
| **CL-2** | Combinatorial / structural | State indexed over a nontrivial combinatorial structure. | SUB-4 |
| **CL-3** | State-compression / specialized-domain | A non-tuple **state encoding**, or a specialized domain. The **indeterminate sink**. | SUB-5 |
| **CL-4** | DP-optimization (mainstream + frontier, **jointly**) | Reducing the cost of an **already-correct** recurrence. | SUB-6 + SUB-13 |

> **CL-4 is ONE cluster across TWO files.** SUB-6 and SUB-13 split its *work* for one-PR sizing — a work split, not a partition split. `manifest.yaml` registers both files under the single `CL-4` id so **OUT-6's per-cluster path count counts four clusters, not five.** NEU-932's dry-run caught this exact failure mode; the one-cluster-id/many-files shape is load-bearing.

Assignment is by **defining contribution**, as an ordered first-match-wins cascade (CL-4 → CL-3 → CL-2 → CL-1). Two techniques over the same objects can land in different clusters — that is the rule working. Full rule: NEU-932 [`04_family-cluster-partition.md`](../C005-dp-map-foundations/04_family-cluster-partition.md).

## The terminal floor — where a chain is allowed to stop

Every prerequisite chain bottoms out on **exactly one of two** things. Anything else is an **unexplained jump** and fails the floor audit.

1. **A DP first-principle root** — `role: "root"` in `nodes/cl-1-foundational.yaml`. The 8 frozen nodes covering optimal substructure, overlapping subproblems, state/transition/base-case formulation, and memoization vs tabulation.
2. **A registered boundary anchor** — `boundary-register.yaml` `1.0.0`. The 5 sanctioned **non-DP** anchors: segment trees, Li Chao trees, convex-hull/envelope geometry, modular arithmetic, linear algebra.

Anchors are **named and versioned, never decomposed** — their internals are a general-algorithms concern outside this charter's audience line. Below the anchors sits NEU-887's elementary-data-structures floor, which is out of scope.

## 🔴 The one distinction everything else depends on

Three downstream clusters and the integration pass turn on this. Get it wrong and either the graph grows fake terminals or SUB-12 cannot resolve anything.

| | **Sanctioned non-DP prerequisite** | **Cross-cluster prerequisite** |
| --- | --- | --- |
| Target | A registered **boundary anchor** | A **sibling cluster's node** |
| Action | **DRAWN directly**, by the mapper, now | **DECLARED** as a named attachment point |
| Field | `prerequisites.boundary_anchors` | `cross_cluster_attachments` |
| Why | The anchor **exists in the shared floor from the start** — nothing to resolve | The sibling's file **doesn't exist yet** — the mapper can't see its ids |
| Who draws it | The mapper | **SUB-12**, later |
| Example | SOS DP → modular/linear algebra; CHT → envelope geometry | Knuth optimization → the interval DP it accelerates |

**Roots are the third case, and they are DRAWN too** (`prerequisites.roots`): like anchors, they are a shared frozen floor that exists before any mapper starts, so there is nothing for SUB-12 to resolve — even though root ids carry a `cl-1.` prefix and therefore *look* cross-cluster to a naive endpoint-span test. **SUB-12 must not re-draw them** (`edges/cross-cluster.yaml` R5), or every floor edge is duplicated.

**Neither is ever faked as a DP root edge.** Laundering a real cross-cluster or non-DP dependency into the DP floor to make a chain bottom out is the single failure the floor audit exists to catch.

## Standing caveats

- **Status flips only in the adjudication ledger** ([`../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`](../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md)). A mapper may **not** promote its own node from `provisional` to `settled` by editing YAML. NEU-887's discipline, inherited — not re-derived.
- **Conflicts are carried, not smoothed.** SOS DP's CL-4/CL-3 dispute (`X-D1`) is live and logged `provisional` with a named U4 challenge route. Do not resolve it locally.
- **Difficulty dimensions are `{}` and must stay that way** until SUB-7 (OUT-3) lands the dimension set. **Do not invent dimensions.**
- **`javascript_materiality.assessed` is `false` everywhere.** OUT-5 (SUB-8) owns the verdict; mappers record observations, never verdicts. NEU-932 records that OUT-5 has **no reference support** — every selected reference assumes the C++ competitive default.
- **`coverage.status` is `unaudited` everywhere.** OUT-7 owns it.
- **No class-7 evidence exists** anywhere in C005 — no external-user, expert, or market validation. Every node is class 1 `[literature]` or class 2 `[code-evidence]`.
- **Codeforces corpus ids are unverified** (`CAP-2`: HTTP 403 to automated fetching on 2026-07-16). Do not assert one as verified.
- **Topic volume is never coverage.** A long node list is not a mapped map.
