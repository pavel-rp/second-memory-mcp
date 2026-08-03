# 00 — Method and Scope

**Author:** NEU-943 (SUB-9) · **Covers:** OUT-2 (audit), OUT-6
**Audited artifact:** `../C005-dp-map/` at `map_version: 0.1.0`

---

## 1. What was audited

The **edge-complete** graph — every node file plus the NEU-939 cross-cluster edge layer:

| Source | Content |
| ------ | ------- |
| `nodes/cl-1-foundational.yaml` | 54 nodes = 46 mapped + **8 frozen roots** |
| `nodes/cl-2-combinatorial.yaml` | 61 |
| `nodes/cl-3-state-compression.yaml` | 31 |
| `nodes/cl-4-optimization/mainstream.yaml` | 23 |
| `nodes/cl-4-optimization/frontier.yaml` | 18 |
| `edges/cross-cluster.yaml` | 25 realized edges + 2 unresolvable declarations |
| `boundary-register.yaml` | 5 registered anchors |
| **Total** | **187 nodes** (179 non-root + 8 roots) |

Counts are re-derived by the validator, not copied from the files' own prose. All agree.

## 2. Method: scripted, not asserted

Coverage is proven **by the audits, not by taxonomy size** — the charter's #1 High risk.
Topic volume is never coverage. Accordingly every claim in this package is produced by
`validator/audit-graph-integrity.mjs`, which parses the YAML and re-derives the result.
**28/28 structural checks pass.** Where this prose and the script disagree, the script wins.

Three method rules did real work:

### 2.1 Classify edges by FIELD, never by endpoint span (`D-S4` / `X-S1`)

A `prerequisites.roots` edge points from any cluster **into CL-1**, so an endpoint-span
test misreads all 223 of them as "cross-cluster". They are not: roots and anchors are a
**shared frozen floor** drawn directly by each mapper. The validator classifies by the
field an edge was declared in. Census:

| Field | Count | Drawn by |
| ----- | ----- | -------- |
| `prerequisites.intra_cluster` | 293 | the owning mapper |
| `prerequisites.roots` | 223 | the owning mapper (floor) |
| `prerequisites.boundary_anchors` | 31 | the owning mapper (floor) |
| `edges/cross-cluster.yaml` | 25 | NEU-939 (SUB-12) |
| **Total** | **572** | |

Confirmed independently: **zero** root/anchor edges are re-drawn in `cross-cluster.yaml`,
so NEU-939's `R5` claim holds and no floor edge is double-counted.

### 2.2 `len(clusters)` = 4. Never node files (5).

CL-4 is **one** cluster carried across two files; the mainstream/frontier split is
one-PR sizing only. The manifest registers both under a single `CL-4` id precisely so
this cannot be miscounted. **Verified: `len(clusters)` = 4, `cluster_count` = 4, and
CL-4 holds exactly 2 files.** OUT-6's per-cluster path count is therefore counted
against **4**, and a fifth "cluster" is never manufactured from the file list.

### 2.3 A registered boundary anchor is a CLEAN TERMINAL, never a gap

23 nodes bottom out on one of the 5 registered anchors. Registration is exactly what
converts *"this chain just stops"* into *"this chain bottoms out somewhere we
deliberately don't go."* These are scored **clean**, and a chain ending anywhere other
than a DP root or a registered anchor is a flagged finding. **There are none.**

## 3. Scope

**In:** dependency/cycle audit; floor audit; eight-skill-type union-completeness;
OUT-6 representative path set; adversarial gap-and-prerequisite analysis; adjudication of
NEU-939's unresolvable attachments (F-939-A/B) and soft findings (F-939-1/2) as
orphan/missing-prerequisite records.

**Out:** coverage/gap adjudication (**NEU-942**, merged — consumed, never re-decided);
mapping or repairing nodes/edges; progression-stage definition (NEU-940 — consumed);
JavaScript materiality (NEU-941); package assembly; authoring lessons or problems.

### 3.1 🔴 The audit/repair boundary

SUB-9 **audits; it does not repair.** A structural defect routes back to a family cluster
(nodes) or SUB-12 (edges) as a **finding**, or to a follow-up. This package therefore
edited **zero** node files, **zero** edge files, and neither `manifest.yaml` nor
`boundary-register.yaml`. NEU-941 held concurrent write on the node files (adding
`javascript_materiality`) throughout; not editing them was a correctness rule **and** a
merge-safety one.

This is why **F-943-1** — a genuine, measured defect in 179 nodes' annotations — was
recorded and routed rather than fixed here. Fixing it would have meant editing 26 node
records in files this task does not own, concurrently with their actual owner. The route
worked: **NEU-954 took ownership and repaired it, and `F-943-1` is CLOSED** (ledger
`D-R4`).

## 4. Inherited status discipline

- **Defects are flagged, never smoothed** (NEU-887). Nothing here is retyped, repointed,
  or minted to make a check pass. In particular **no node was retyped to paper over a
  skill-type gap** — NEU-937/938 deliberately left `conceptual`/`debugging` absent in
  their clusters and recorded it; that record is honoured, not overwritten.
- **DP-transfer effectiveness stays provisional.** No claim here presents the transfer
  order as measured for DP (NEU-887 R1).
- **Status flips only in the adjudication ledger**, on correctly-classed evidence.
  This audit writes **no** ledger rows and therefore clobbers none. Nodes reference AR-1
  rows *by id*; had rows been written, the rule is **UNION, never replace**.
- **NEU-940's caveats are consumed, not smoothed:** `PS-2/3/4` stage granularity is
  flagged `ungrounded` against NEU-888, entry gates are restricted to A/C, and
  `creator_review` is `deferred-provisional` on all 179. All three are confirmed present
  and carried forward as caps (`06`), not quietly resolved.
