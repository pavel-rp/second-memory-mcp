# Coverage-and-Gap Adjudication — Method and Scope

**Task:** NEU-942 (SUB-10) · **Covers:** OUT-7, OUT-4 (residual-exclusion adjudication) · **Compiled:** 2026-07-16 · **Map version audited:** `0.1.0` · **Status:** see `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` (this file sets no status)

This package is the coverage audit the NEU-889 charter names as its highest-severity failure if skipped: *"if a disagreement is silently smoothed rather than adjudicated, the map ships a coverage claim it cannot defend."*

It compares the **mapped graph** against the **multiple NEU-932 references** and issues an explicit verdict on every coverage disagreement. It maps nothing, repairs nothing, and mints no node.

---

## 1. What is being audited, against what

**The audited object** — the node-complete graph at `map_version 0.1.0`, 179 nodes across the four D-F4 clusters:

| Cluster | File | Nodes | Mapper |
| --- | --- | --- | --- |
| CL-1 foundational / linear-sequence | `../C005-dp-map/nodes/cl-1-foundational.yaml` | 46 (+8 frozen roots) | NEU-934 (SUB-3) |
| CL-2 combinatorial / structural | `../C005-dp-map/nodes/cl-2-combinatorial.yaml` | 61 | NEU-935 (SUB-4) |
| CL-3 state-compression / specialized-domain | `../C005-dp-map/nodes/cl-3-state-compression.yaml` | 31 | NEU-936 (SUB-5) |
| CL-4 optimization — mainstream | `../C005-dp-map/nodes/cl-4-optimization/mainstream.yaml` | 23 | NEU-937 (SUB-6) |
| CL-4 optimization — research-tier frontier | `../C005-dp-map/nodes/cl-4-optimization/frontier.yaml` | 18 | NEU-938 (SUB-13) |

**The references** — `D-F1`'s six taxonomies (T1…T6) and `D-F2`'s six corpora (C1…C6). Six taxonomy columns and six corpus columns, not one: *"a matrix with one column is a copy"* (`../C005-dp-map-foundations/01_taxonomy-selection.md` §1).

**Edges are out of scope here.** This audit judges **node/technique coverage** against the references. It does not require SUB-12's cross-cluster edges to be drawn first (NEU-942 constraint), and it makes no dependency, cycle, or path finding — those are SUB-9's (OUT-2/OUT-6). Where this audit's finding *causes* an edge to be unresolvable, it says so and routes it; it does not adjudicate the edge.

## 2. The verdict vocabulary (the hard acceptance bar)

Every coverage disagreement gets exactly one of four verdicts. A fifth outcome — a **silently smoothed difference** — fails the audit. This is the NEU-942 constraint stated verbatim, and it is the whole point of the package.

| Verdict | Means | Bar it must clear |
| --- | --- | --- |
| **intentional exclusion** | The map deliberately does not contain it, and says why. | A **documented rationale**. Materiality judged by NEU-887's rule (referenced, never re-derived), against the charter's competitive-DP audience line. |
| **mapped equivalence** | The reference and the map contain the same thing under different names, granularities, or cluster addresses. | A **named identity**: which reference item corresponds to which node(s), and why the difference is presentation and not content. `X-D2` (naming instability) makes this the *expected* verdict, not a suspicious one — `F-T-4` states outright that the audit "must not read a naming difference as a coverage gap." |
| **unresolved uncertainty** | The audit cannot settle it on the evidence available at this cutoff. | A **named owner** and a **named revision trigger**. Never a value invented to close the row. |
| **genuine gap with a named owner** | The map is missing something it should have. | A **named owner** — a person, sub-task, or a creator decision. OUT-7 forbids shipping a gap without one. |

**A gap's owner is never "the audit."** This sub-task may not map or repair nodes (NEU-942 out-of-scope: *"routed back to the family clusters if a genuine gap must be filled in-charter"*). Where the correct owner is a creator decision or a follow-up task, this package says so **explicitly and by name** rather than absorbing the work.

## 3. What counts as a disagreement

Three sources, swept in this order:

1. **Reference → map.** A technique a selected taxonomy or corpus carries that the mapped graph does not. This is the coverage matrix's job (`01_coverage-matrix.md`).
2. **Map → reference.** A node the map carries that no selected reference names. `D-F1` §6 permits this explicitly — *"the map may include a technique no reference lists"* — and Convention U1 makes it a coverage question, never a partition question.
3. **Mapper → mapper.** A residual exclusion one cluster recorded, whose named owner is another cluster (or nobody). 52 such entries exist across five files; consolidating and adjudicating them is `03_residual-exclusion-consolidation.md` and is OUT-4's half of this sub-task.

Source 3 is where this audit's material findings actually came from. **Every mapper behaved correctly** — each declined to silently claim or smooth a contested or unenumerated technique and recorded it with a rationale instead. The map is honest. The findings in `04_…` are about the **decomposition**, not about any mapper's work.

## 4. Standing rules this audit operates under

- **Topic volume is never coverage.** A reference's table of contents is not a technique space (`F-T-1`). A technique is *covered* when it is mapped as typed node(s) whose prerequisite chain reaches the sanctioned floor — not when its name appears somewhere.
- **References are research inputs, not authoritative curricula.** The map is not obliged to agree with any of them (`D-F1` §6). A technique in every reference may be excluded with a rationale; a technique in none may be mapped.
- **Status flips only in the adjudication ledger, on correctly-classed evidence.** This package proposes; `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` records. No file here sets a status.
- **Rights-sensitive corpora inform without being copied.** Five of six corpora and five of six taxonomies are inform-only (`F-C-2`, `D-F5`). No corpus content, problem statement, or reference text is reproduced anywhere in this package.
- **No problem-level citation is invented.** See `05_caps-and-incomplete-scope.md` `CAP-2` and finding `CF-1`. This audit **inherits** the caps; it does not fix them and does not paper over them.
- **This audit writes no node file.** `nodes/*.yaml` are the mappers' files (NEU-940 is writing difficulty fields concurrently); `edges/cross-cluster.yaml` is SUB-12's (NEU-939). This package writes its own files plus **union-only** additions to the SUB-2 ledger.

## 5. Package contents

| File | What it is |
| --- | --- |
| `00_method-and-scope.md` | This file. |
| `01_coverage-matrix.md` | The mapped graph against T1…T6 and C1…C6. Per-area coverage with the disagreements it surfaces. |
| `02_disagreement-adjudication.md` | Every coverage disagreement, one verdict each (`CV-#`). |
| `03_residual-exclusion-consolidation.md` | All 52 residual exclusions from the five mappers, consolidated and adjudicated (OUT-4). |
| `04_work-split-seam.md` | **The material finding.** A systematic gap class: CL-4-by-cascade, enumerated by neither CL-4 half. 10 instances. |
| `05_caps-and-incomplete-scope.md` | What this audit could not settle, with owners (`CAP-#`, `INC-C#`). |

## 6. What this audit does not do

- It does **not** run the dependency/cycle audit, the representative-path walkthroughs, the eight-skill-type union check, or the adversarial prerequisite analysis (SUB-9 / NEU-943).
- It does **not** integrate cross-cluster edges or adjudicate unresolvable attachments (SUB-12 / NEU-939).
- It does **not** define progression stages or difficulty values (SUB-7 / NEU-940), or judge JavaScript materiality (SUB-8 / NEU-941).
- It does **not** assemble the final package or reconcile the ledger into one binding view (SUB-11 / NEU-944).
- It does **not** map, repair, or retype any node, and it does not mint a node to close a gap it found.
