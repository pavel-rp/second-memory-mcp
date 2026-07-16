# The Map's Representation Format

**Task:** NEU-932 · **Decision:** `D-F3` · **Compiled:** 2026-07-16 · **Status:** settled (see `adjudication/01_selection-decision-ledger.md`)

The NEU-889 charter delegates the map's representation format to this sub-task (Assumption #3) and binds exactly one requirement regardless of what is chosen: **versioned and prompt-ready** — a cold-context downstream agent must consume the package as complete context and tell settled decisions from provisional ones.

This file chooses the format, records the alternatives it was weighed against, and discharges the per-cluster file-ownership constraint the parallel mapping sub-tasks depend on. It does **not** author the node schema — that is SUB-2, which builds inside this format.

---

## 1. The decision

> **The map is a set of per-cluster YAML node files under a versioned manifest, with a generated markdown index as the prompt entry point.**

```
docs/research/C005-dp-map/
  manifest.yaml              # map_version, cluster registry, schema version, status legend
  README.md                  # prompt entry point — the one hop a cold agent starts from
  nodes/
    cl-1-foundational.yaml         # SUB-3 owns — sole writer
    cl-2-combinatorial.yaml        # SUB-4 owns — sole writer
    cl-3-state-compression.yaml    # SUB-5 owns — sole writer
    cl-4-optimization/             # CL-4 is ONE cluster; two sub-tasks, disjoint files
      mainstream.yaml              #   SUB-6  owns — sole writer
      frontier.yaml                #   SUB-13 owns — sole writer
  edges/
    cross-cluster.yaml       # integration sub-task owns — sole writer
  boundary-register.yaml     # assumed-knowledge anchors (charter Assumption #14)
  index/
    00_technique-index.md    # generated one-hop view; never hand-edited
```

Four properties, each traceable to a binding requirement:

| Property | How it is delivered | Requirement it discharges |
| --- | --- | --- |
| **Versioned** | `map_version` (semver) in `manifest.yaml`, plus git history. Every node carries the `map_version` it was last adjudicated under. | Charter: "artifacts are versioned" |
| **Prompt-ready** | YAML is high-signal plain text an LLM reads natively; `README.md` + the generated technique index give the one-hop entry. | Charter: cold-context agent consumes as complete context |
| **Settled vs provisional legible** | Every node carries a required `status: settled \| provisional \| unresolved` field, defined once in the manifest's legend, driven by the adjudication ledger. | Charter: "distinguish settled from provisional" |
| **Per-cluster file ownership** | One cluster → one file (CL-4: one directory, two disjoint files). Exactly one sub-task writes each file. | **Five family mappers run in parallel** |

## 2. Alternatives considered and rejected

Recorded per the NEU-932 acceptance bar: every material choice carries its rejected alternatives.

| Alternative | Why it was plausible | Why rejected |
| --- | --- | --- |
| **A single JSON/YAML graph file** (`map.yaml` with all nodes) | Simplest possible thing; one file to load; trivially consistent; no cross-file id resolution. | **Disqualifying: it serializes the five parallel family mappers.** Five agents writing one file collide on every write, and merge conflicts on a hand-edited graph file are resolved by hand at exactly the moment the content is least understood. This alternative alone would have forced the orchestrator to run SUB-3/4/5/6/13 sequentially. Rejected on the parallelism constraint before any other criterion was applied. |
| **Pure markdown registers** (the NEU-887 / NEU-888 house style) | Strong series precedent; maximally prompt-ready; the two prior C005 packages are exactly this and are Done. | Rejected on **machine-checkability**. NEU-889's acceptance rests on audits that are graph algorithms, not prose reviews: a cycle audit (OUT-2), a coverage matrix (OUT-7), and per-cluster path counting (OUT-6). Running a cycle detector over prose means re-parsing intent from tables — the exact "reconstruct the domain analysis" failure the charter forbids. Markdown is retained where it is strongest (the entry point and the generated index) rather than discarded; this is the one place this package deviates from series precedent, and it deviates *because* the deliverable is a graph and the precedents were not. Recorded as a deliberate, justified divergence. |
| **JSON with a JSON Schema** | Ubiquitous tooling; schema validation out of the box; no YAML ambiguity footguns. | Rejected on **prompt-readiness and reviewability**: JSON has no comments, so a node's rationale must become a data field or be lost, and JSON's punctuation density makes diffs noisy for human review. YAML keeps the comment channel *and* is still validated by JSON Schema (schemas are format-agnostic over the data model), so this alternative's only real advantage is retained without its costs. |
| **A graph database / dedicated graph tool** (Neo4j, TigerGraph) | Native graph queries; cycle detection and traversal for free. | Rejected on **versioning and scope**. The artifact must be diffable, reviewable in a PR, and readable by a cold agent with no infrastructure. A database is not versioned by git, cannot be read as prompt context, and would make the map depend on a running service — while NEU-889 explicitly modifies no source and ships no runtime. |
| **DOT / Mermaid graph source** | Renders visually; purpose-built for graphs; readable. | Rejected on **attribute capacity**. Nodes must carry skill type (eight of them), status, difficulty dimensions, JavaScript-materiality notes, provenance, and evidence class. DOT/Mermaid attributes are presentation-oriented and degrade into stringly-typed blobs under that load. Mermaid remains available as a *rendered view* generated from the YAML, which costs nothing and is not the source of truth. |

## 3. Why YAML specifically (and the honest cost)

YAML was chosen over the alternatives above for the combination no single alternative offers: git-diffable, comment-bearing, schema-validatable, natively LLM-readable, and splittable across files.

**The honest cost, recorded rather than hidden:** YAML has real footguns — the Norway problem (`no` → `false`), significant whitespace, and version-dependent type coercion. These are mitigated, not waved away: SUB-2's schema (`D-F3a`) must **quote all string-typed enum values** and pin the schema's expected YAML version. This is a live constraint handed to SUB-2, not a defect discovered later.

**Second recorded cost:** the generated `index/00_technique-index.md` can drift from the YAML if regeneration is not enforced. It is marked `never hand-edited` in the manifest, and the coverage-audit sub-task is the natural place to assert regeneration-freshness. Recorded as an open item on `D-F3` rather than assumed solved.

## 4. Per-cluster file ownership (the constraint the orchestrator's parallelism depends on)

**This is the property that lets the five family-mapping sub-tasks run in parallel, and it is a hard requirement of the layout above, not an incidental benefit.**

| Cluster | File(s) | Sole writer |
| --- | --- | --- |
| CL-1 | `nodes/cl-1-foundational.yaml` | SUB-3 |
| CL-2 | `nodes/cl-2-combinatorial.yaml` | SUB-4 |
| CL-3 | `nodes/cl-3-state-compression.yaml` | SUB-5 |
| CL-4 | `nodes/cl-4-optimization/mainstream.yaml` | SUB-6 |
| CL-4 | `nodes/cl-4-optimization/frontier.yaml` | SUB-13 |

Rules that make ownership real rather than aspirational:

1. **A sub-task writes only its own file.** Five concurrent mappers touch five disjoint paths, so no two ever write the same file. Git merges are trivial by construction, not by care.
2. **CL-4 is one cluster across two files.** Per `04_…` §2.1, the partition has four clusters; SUB-6 and SUB-13 split CL-4's *work* for one-PR sizing. Giving CL-4 a directory with two disjoint files lets both run in parallel without making CL-4 two clusters. The manifest registers both files under the single `CL-4` cluster id, so OUT-6 still counts four clusters.
3. **Nobody writes `manifest.yaml` during mapping.** It is set here and amended only through the ledger. Otherwise it becomes the shared file the layout exists to avoid.
4. **Cross-cluster edges are not a mapper's job.** A mapper writing an edge into another cluster's file would break rule 1. Edges whose endpoints span clusters go in `edges/cross-cluster.yaml`, owned solely by the integration sub-task, which runs *after* the mappers. A mapper that needs to link outward records the intent in its own file; integration resolves it.
5. **Node ids are namespaced by cluster** (`cl-3.plug-dp`), so two mappers cannot mint colliding ids without touching each other's files.

**Answer to the orchestrator's question: yes — per-cluster file ownership is fully supported, and SUB-3/4/5/6/13 can run in parallel.** No shared node file exists. The only shared artifacts (`manifest.yaml`, `edges/cross-cluster.yaml`) are written by nobody during the mapping phase.

## 5. Where the schema boundary sits (what SUB-2 owns)

This package fixes the **container**; SUB-2 fixes the **contents**. The line:

| This package (`D-F3`, settled) | SUB-2 (`D-F3a`, unresolved here **by design**) |
| --- | --- |
| YAML as the node-data format | The node schema: field names, types, required/optional |
| The file layout and per-cluster ownership | The node-type and skill-type vocabulary (the eight skill types) |
| The manifest, `map_version`, and semver discipline | The edge schema and prerequisite-edge semantics |
| That every node has a `status` field, and its three legal values | Difficulty-dimension and JavaScript-materiality field shapes |
| Markdown entry point + generated index | The generator itself, and the JSON Schema that validates the YAML |

SUB-2 is **bound** by the left column and **free** in the right. If SUB-2 finds the container unworkable, the route is a ledger challenge against `D-F3` — not a local redesign, because four other sub-tasks are already scoped to this layout.

## 6. Versioning discipline

- **`map_version` is semver** in `manifest.yaml`. **Major**: a node's meaning or the schema changes incompatibly. **Minor**: nodes/edges added. **Patch**: rationale, prose, or provenance corrected with no graph change.
- **Every node records the `map_version` at which its status was last adjudicated**, so a reader can tell a settled-and-current node from one settled long ago under an older schema.
- **Status flips only in the adjudication ledger.** A mapper may not promote its own node from `provisional` to `settled` by editing the YAML — the ledger is the source of truth and the YAML reflects it. This is NEU-887's status discipline, inherited, not re-derived.
- **The package version and the map version are distinct.** This selection package is `dp-map-foundations/1.0.0`; the map it describes is versioned separately and starts at `0.1.0` when SUB-2 lands the schema — deliberately below `1.0.0` until the graph is adjudicated.
