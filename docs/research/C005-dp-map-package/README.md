# C005 — The Adjudicated DP Knowledge-and-Skill Map Package

**Version `1.0.0`** · **Task:** NEU-944 (SUB-11), charter NEU-889 · **Compiled:** 2026-07-16
**Covers:** OUT-8 (authoring requirements) + OUT-9 (the bound package)
**Status:** **prompt-ready** · package gate **36/36 PASS** · NEU-943 integrity validator **28/28 PASS**

---

## You are a cold-context agent. Start here.

**This package is complete context. You do not need to reconstruct intent, and you do not need to read
NEU-932…NEU-943 to use the map.**

| I want to… | Open | Hops |
| --- | --- | ---: |
| **Look up ONE technique — everything about it** | **`01_cross-reference-view.md`** — grep its id or name | **1** |
| **Know what is NOT settled** | **`03_open-items-and-provisional-register.md`** | **1** |
| **Author a curriculum against this map** | **`02_authoring-requirements.md`** | **1** |
| See the completeness gate | `04_package-completeness-gate.md` | 1 |
| See the cold-handoff test | `05_cold-context-dry-run.md` | 1 |
| Know this package's own limits | `06_caps-and-incomplete-scope.md` | 1 |
| Check any element's **status** | `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` — **the one ledger. Nothing else sets status.** | 1 |

**`01_cross-reference-view.md` is the load-bearing file.** For **any** of the 187 nodes it resolves, in
**one lookup**: **node type · prerequisites** (intra-cluster, cross-cluster, and any registered
boundary-anchor terminal) **· progression stage · difficulty · JavaScript materiality · coverage
verdict · audit findings**, and **whether each is binding or open**. It is **generated** — mechanically
fresh, never hand-edited.

> **⚠ Do NOT use `../C005-dp-map/index/00_technique-index.md`. It is STALE** — it still reads
> *"scaffold — no DP family node exists yet"* over a **187-node** map (`INC-P2`). **`01_` supersedes it.**

---

## 🔴 Read this before you sequence anything

### The map's structure is SETTLED. Its stage annotations are DEFECTIVE.

**`F-943-1` (HIGH, OPEN) — an open defect in the shipped map.**

**NEU-940's `progression_stage` and `prerequisite_depth` were computed against the pre-NEU-939 graph —
before the cross-cluster edges existed. 26 of 179 depths are wrong. 6 dependencies order backwards.**

> **A downstream agent sequencing by `progression_stage` today would teach 6 dependencies before their
> own prerequisites.**

**The binding consumer rule (NEU-943 `05` §5):**

> **Trust the edges. Do NOT trust `progression_stage` across a cluster boundary.** The 25
> cross-cluster edges are audited and correct; the stages on 6 of them are inverted. **Sequence from
> the graph's topological order — which exists, because the graph is acyclic — not from the stage
> labels.** Treat `prerequisite_depth` as **advisory**; recompute it from the graph.

**Owner:** NEU-940's owner. **Revision trigger:** a re-run of NEU-940's depth-and-stage computation
over the edge-complete graph. **Repairing it is out of SUB-11's scope** — this package **binds** the
defect (`D-P2`), flags it on **all 26** affected nodes, and does not repair it.

**And independently: no stage or difficulty value is binding at all.** The **creator plausibility
review never ran** (Assumption #11) — all 179 nodes carry `creator_review: "deferred-provisional"`
(`D-P3`). **Two independent reasons not to trust a stage.**

**Full detail, owners, and triggers: `03_open-items-and-provisional-register.md`.**

---

## What the map is — the settled facts, cite rather than re-derive

| Fact | Value |
| --- | --- |
| **Nodes** | **187** = **179** mapped techniques + **8** frozen roots |
| **Edges** | **572** — 293 intra-cluster · 223 root · 31 boundary-anchor · **25 cross-cluster** |
| **Clusters** | **4**. **CL-4 is ONE cluster across TWO files.** Count `len(clusters)` = 4. **Never count node files — that is 5 and it is not the cluster count.** |
| **Acyclicity** | **0 cycles** — a topological order exists and is computable |
| **Floor** | **179/179** chains reach a DP root or a registered anchor · **0 unexplained jumps** |
| **Laundering probes** | **0 of 223** faked root edges · **0 of 31** invented anchors |
| **Skill types** | **8/8 instantiated** (112 skill nodes) — union-completeness **holds** |
| **OUT-6 paths** | **5/5** — one per each of the 4 clusters + research-tier, all grounded; the research-tier chain verified **hop-by-hop** |
| **JavaScript** | **179/179 assessed** — **47 material**, **132 neutral**, **19 blocking**. Headline hazard: **2^53 modmul silently rounds to a plausible wrong residue** |
| **Coverage** | **30 disagreements adjudicated, ZERO smoothed** · 52 exclusions consolidated · **10 known gaps, all owned** |
| **Boundary anchors** | **5**, `register_version 1.0.0` — named, versioned, **never decomposed** |

---

## What ships OPEN — the short list

**Nothing here is binding. Each has an owner and a revision trigger in `03_…`.**

| Element | Status | Owner |
| --- | --- | --- |
| **`F-943-1`** — 26/179 depths wrong, 6 inversions | **unresolved** | **NEU-940** |
| **Deferred creator progression review** — all 179 | **provisional** | **the creator** |
| **`INC-C1`** — 10 unmapped CL-4 techniques | **unresolved** | **the creator** (CL-4 completion task) |
| **`INC-C2`** — `D-F4a`: SOS DP, CL-4 vs CL-3 | **unresolved** | **NEU-932** |
| **`PS-2/3/4` granularity** — ungrounded vs NEU-888 | **provisional** | NEU-940 / NEU-888 |
| **`R1`** — DP-transfer effectiveness | **provisional**, **non-downgradable** | NEU-887 |
| **`CAP-2`** — problem-level citations unverified | **provisional** | the creator |
| **6 `AR-1` anchor requests** — dependents provisional | **open** | `D-S3`'s owner |
| `F-943-2`, `F-943-3`, `F-939-1`, `JS-U1/2/3/5`, `D-S1a-1`, `INC-S1`, `INC-C7`, `X-S1`, `X-D1`, `X-D2` | open / carried | see `03_…` §9 |

---

## The three rules that keep this map honest

1. **Status flips ONLY in the ledger**, on correctly-classed evidence. Not in a node's YAML, not in a
   README, not in this package.
2. **UNION ledger rows, NEVER replace.** **Map nodes cite ledger ids verbatim in their `notes`** —
   clobbering a row turns those notes into false claims.
3. **Preserve conflicts and gaps. Never smooth them.** **This is not ceremony — it is why this
   charter's real defects are visible.** `F-943-1`, `INC-C1` and the provably-incomplete `AR-1`
   register were all found because somebody wrote down an inconvenient fact instead of tidying it
   away. **30 coverage disagreements were adjudicated with ZERO smoothed.**

---

## What this package does NOT build

**No lessons. No problems. No graph editor. No exercise runner.** All routed to later
curriculum-production charters. Mechanically verified: `PG-12` — **the only executables are the view
generator and the gate, both projections; the package contains no YAML at all**, so it cannot have
minted a node, edge, stage, difficulty value, materiality finding, integrity finding, or coverage
verdict.

**It also does not claim the map teaches DP well.** **Nothing in C005 measures DP learning** (`R1`).
**The graph order is structural, not measured.**

---

## Regenerate / re-verify

```
node docs/research/C005-dp-map-package/generator/build-cross-reference.mjs      # regenerate 01
node docs/research/C005-dp-map-package/generator/package-completeness-gate.mjs  # gate: 36/36
node docs/research/C005-dp-map-integrity/validator/audit-graph-integrity.mjs    # NEU-943: 28/28
```

**Any change to the map requires regenerating `01_` and re-running the gate.** `PG-5` fails on drift.

---

## Provenance

| Package | Task | Contributes |
| --- | --- | --- |
| `../C005-dp-map-foundations/` | NEU-932 | references, corpora, representation, **`D-F4` four-cluster partition + cascade**, rights |
| `../C005-dp-map-schema/` | NEU-933 | node/edge schema, terminal floor, per-node template, `V-1`…`V-18`, `D-S*`, **the ledger** |
| `../C005-dp-map/` | NEU-934–941 | **the artifact** — `manifest.yaml`, `boundary-register.yaml`, `nodes/*`, `edges/cross-cluster.yaml` |
| `../C005-dp-progression/` | NEU-940 | `PS-0`…`PS-4`, `entry_gate`, difficulty dimension set `1.0.0` |
| `../C005-dp-js-materiality/` | NEU-941 | nine-effect catalogue `rule_version 1.0.0`, audit register, caps |
| `../C005-dp-map-coverage/` | NEU-942 | coverage matrix, 30 adjudicated disagreements, 52 exclusions, **work-split seam** |
| `../C005-dp-map-integrity/` | NEU-943 | cycle audit, skill-type union, representative paths, adversarial analysis, findings register, **the validator this package reuses** |
| **`.` (this package)** | **NEU-944** | **the binding** — cross-reference view, authoring requirements, gate, dry-run, ledger rows `D-P1`…`D-P4` |
