# C005 DP Map Schema — Graph Schema, Terminal Floor, and Extended Registers

**Program:** C005 (AI-backed dynamic-programming course) · **Charter:** NEU-889 · **Task:** NEU-933 (SUB-2, covers OUT-1 and OUT-2) · **Package version:** `dp-map-schema/1.0.0` · **Verification cutoff:** 2026-07-16

**What this is.** The reusable scaffolding every later NEU-889 sub-task builds on. It fixes four things and fixes nothing else:

1. **The graph schema** (`01_node-and-edge-schema.md`) — knowledge vs skill nodes, the eight-type closed skill vocabulary with an ordered cascade, prerequisite-edge semantics free across knowledge/skill, and the four prerequisite fields. **Resolves NEU-932's `D-F3a`.**
2. **The terminal floor** (`02_terminal-floor.md`) — the 8 DP first-principle roots **and** the versioned assumed-knowledge boundary register naming the 5 sanctioned non-DP anchors.
3. **The per-node record template** (`03_per-node-record-template.md`) — copy-paste, with the drawn-vs-declared distinction stated at the point of use.
4. **NEU-887's registers extended** (`04_register-extension.md`) — by reference, never re-derived — plus the adjudication skeleton SUB-11 later drives.

**The map itself lives next door: [`../C005-dp-map/`](../C005-dp-map/).** This package is the reasoning; that one is the artifact.

**What it is not — it maps no DP.** Zero technique nodes, zero family decisions, zero progression decisions. Every technique named anywhere here is a **worked example of a schema rule**, never a claim of coverage. `cl-4.knuth-optimization` in the template is a **specimen**; SUB-6 owns whether that node exists.

## ▶ Start here (reading order)

| Step | File | What it gives you |
| --- | --- | --- |
| 1 | **This README** | What is decided, what is open, the standing caveats. |
| 2 | **`00_method-and-scope.md`** | How this was made, the inherited stack, and **the long list of what it deliberately did not attempt**. |
| 3 | **`01_node-and-edge-schema.md`** | **The schema.** Node kinds, the eight skill types, the cascade, edge semantics, the drawn/declared fields, the 18 validation checks. |
| 4 | **`02_terminal-floor.md`** | The roots and the boundary register — where the graph bottoms out, and why a registered anchor is a **sanctioned terminal, not a jump**. |
| 5 | **`03_per-node-record-template.md`** | **Mappers: this is your working file.** Copy the template. |
| 6 | **`04_register-extension.md`** | What was extended and — the actual content — **what was NOT rebuilt.** |
| 7 | **`dry-run/00_schema-usability-dry-run.md`** | The desk-check, its 7/8 result, the **three things it changed**, and what it cannot tell you. |
| 8 | **`decision-records/DR-S01…DR-S05`** | One record per decision, each with its rejected alternatives and revision trigger. **Read `DR-S04` if you read one.** |
| 9 | **`traceability/`, `adjudication/`** | The NEU-887 register and ledger extended — **the only place a status flips**. |
| 10 | **`05_caps-and-incomplete-scope.md`** | The caps, the inherited gaps, and **the one thing most likely to be wrong**. |

## 🔴 If you are a mapper (SUB-3/4/5/6/13), read this box

**The distinction three clusters and the integration pass depend on:**

| Your prerequisite is… | Action | Field |
| --- | --- | --- |
| in **your own cluster** | **DRAW** | `prerequisites.intra_cluster` |
| a **DP root** | **DRAW** | `prerequisites.roots` |
| a **registered non-DP anchor** | **DRAW** | `prerequisites.boundary_anchors` |
| a **sibling cluster's node** | **DECLARE** | `cross_cluster_attachments` |

> **The rule in one line:** *draw an edge to anything that already exists; declare an attachment to anything that doesn't.*

Roots and anchors are a **shared frozen floor** — they exist before you start, so there is nothing for SUB-12 to resolve. A sibling's file **does not exist yet**; you cannot see its ids, so you **declare a named attachment point** and SUB-12 realizes it later.

**Never fake a cross-cluster or unregistered non-DP prerequisite as a root edge** to make a chain bottom out. That launders a real dependency into a fake terminal and is **the single failure the floor audit exists to catch**.

**And the rule you are most likely to break:** *one technique is usually several nodes.* If you emitted exactly one node per technique name, **you wrote a topic list, not a graph** (`01_…` §1.1). The schema's own author defaulted to this on the first specimen (`dry-run/00_…` §4).

## Decision status at a glance

Status is set **only** in `adjudication/01_schema-decision-ledger.md`. Nothing in this README overrides it.

| Decision | What it fixes | Status |
| --- | --- | --- |
| **D-S1** | The node/edge schema, eight skill types, the S1→S8 cascade, edge semantics. **Resolves `D-F3a`.** | settled |
| **D-S2** | The 8 DP first-principle root nodes (4 knowledge + 4 skill), typed, frozen. | settled |
| **D-S3** | The boundary register `1.0.0` — 5 sanctioned non-DP anchors, named, versioned, undecomposed. | settled |
| **D-S4** | Root edges are **drawn** by mappers, not declared for SUB-12. **The load-bearing call.** Carried as `X-S1`. | settled |
| **D-S5** | NEU-887's machinery extended by reference; only `-S`-namespaced ids added. | settled |
| **D-S1a** | Skill-type assignment for **specific indeterminate** skill nodes (Convention S). | **provisional — open slot**, no entries yet |

**Inherited as binding:** NEU-932's `D-F1`…`D-F5` (taxonomies, corpora, format, four-cluster partition). Challenge them **only** through NEU-932's ledger, with correctly-classed evidence — never by locally re-deciding.

## The parallel fan-out is intact

**Five sub-tasks map concurrently right after this one, and nothing in this schema forces a shared-file design.**

- **No shared node file exists.** The roots were seeded into CL-1's file **before** SUB-3 starts — sequential authorship, not concurrent. SUB-3 is sole writer for the whole mapping phase.
- **Nobody writes `manifest.yaml` during mapping.** Set here; amended only via the ledger.
- **Node ids stay cluster-namespaced** (`cl-3.plug-dp`), so two mappers cannot mint colliding ids without touching each other's files.
- **CL-4 remains ONE cluster** across two disjoint files; `manifest.yaml` registers both under the single `CL-4` id, so **OUT-6 counts four clusters, not five**.

## Standing caveats (true of everything here)

- **This is a design artifact, not a finding** (`CAP-S1`, declared at `SOC-7-S2`). The eight skill types, the cascade order, and the knowledge/skill split are **reasoned from constraints, not measured**. Manufacturing evidence rows for them would launder a choice as a discovery.
- **Nothing in C005 measures DP learning** (`X-D3`, non-downgradable High, inherited). **A prerequisite edge is a structural claim, not a validated learning claim.** The map must never be read as implying otherwise, and must not import any corpus's ordering as a prerequisite claim.
- **The dry-run is a desk-check by the schema's own author** (`CAP-S2` / `INC-D1`, inherited). It proves **expressiveness**, not comprehension. **OUT-9's cold-context handoff supersedes it.**
- **The boundary register is not complete** (`CAP-S4` / `INC-S1`) and does not claim to be. Route **AR-1** exists for the gap. **Aho–Corasick is already foreseen** as SUB-5's first request.
- **No validator ships** (`CAP-S5` / `INC-S2`) — a real deviation from NEU-932's grant, logged rather than quiet. Its 18 checks are specified.
- **Conflicts are carried, not smoothed.** SOS DP's CL-4/CL-3 dispute (`X-D1`) is live with a named U4 route; NEU-933 does not touch it. `X-S1` records this package's own refinement of a NEU-932 rule.
- **No class-7 evidence exists** anywhere in C005. No external-user, expert, or market validation. `evidence_class: 7` must never appear in a node.
- **Provisional by default.** A mapper's correct default node status is `"provisional"`, and **status flips only in the ledger** — a mapper may not promote its own node.

## Provenance

**Downstream consumers:** the five family mappers SUB-3/4/5/6/13 (schema + template + floor), SUB-12 (the attachment-point convention and **R5**), SUB-7 (`difficulty_dimensions`' shape, `INC-S3`), SUB-8 (`javascript_materiality`' shape), the audit sub-tasks (the `V-*` checks, the cluster registry, the floor), and SUB-11 (the seeded adjudication skeleton).

This package **extends** NEU-887 (`../C005-product-foundation/`) — its seven-class evidence taxonomy, materiality rule, traceability register, adjudication ledger, and status discipline — **consumes without re-deriving** NEU-888 (`../C005-instructional-model/`), and **builds inside** NEU-932 (`../C005-dp-map-foundations/`), whose `D-F3a` it resolves.
