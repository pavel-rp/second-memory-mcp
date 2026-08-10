# 05 — Per-Cluster Conceptual Obligation × Discharge Split × Routing Matrix

**Task:** NEU-961 (SUB-5) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Covers:** OUT-6 · **Status:** **deferred — this file SETS no status.** Status lives in a ledger; the map-side half is `D-R6` in `../../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.11
**Model:** claude-opus-5[1m]

The machine-checkable face of `../05_per-cluster-conceptual-obligation.md`. One row per cluster; the prose lives in the topic document and is not restated here.

---

## 1. The 4/4 per-cluster conceptual-coverage check

**Addressed: 4 of 4. Unaddressed: 0. Discharged content-side: 1. Routed map-side: 3.**

| # | Cluster | Obligation stated | Non-root `conceptual` nodes today | Content-form half | Map-side half | Routed to | Ledger id | Residual entry |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **CL-1** Foundational / linear-sequence | `../05_…` §4.1 — the joint DP-admissibility judgment | **1** — `cl-1.judge-dp-applicability` | **Complete**: lesson, example, visualization, reflection, retrieval, assessment on `cl-1.judge-dp-applicability` | **none** | — | — | `OI-S5-4` (coverage rests on one node) |
| 2 | **CL-2** Combinatorial / structural | `../05_…` §4.2 — whether a combinatorial structure indexes a state space at all | **0** | **Empty** — no attachment point exists | **Whole obligation** | the map's owner | **`D-R6`** | `OI-S5-1` |
| 3 | **CL-3** State-compression / specialized-domain | `../05_…` §4.3 — whether a state is compressible, and what a state *is* in the domain | **0** | **Empty** — no attachment point exists | **Whole obligation** | the map's owner | **`D-R6`** | `OI-S5-1` |
| 4 | **CL-4** DP-optimization (mainstream + frontier, jointly) | `../05_…` §4.4 — whether a slow recurrence's cost is structural at all · **mapped members only** | **0** (0 mainstream + 0 frontier) | **Empty** — no attachment point exists | **Whole obligation** | the map's owner | **`D-R6`** | `OI-S5-1`, `OI-S5-3` |

**Reading the "Content-form half" column.** *Empty* is a structural statement, not an effort statement: SUB-2's placement matrix keys the REQUIRED form set off the node's `skill_type`, and every template requires `node_id` to be an exact id copied from the map. A cluster with no `conceptual` node offers no `node_id` a conceptual form set could carry. See `../05_…` §3.

---

## 2. The REQUIRED form set for a `conceptual` node — consumed verbatim from SUB-2

Reproduced so **SUB-9 (NEU-965)** binds without translation. Source: `../02_content-and-exercise-forms.md` §6.3 (placement matrix) and §4 (the discriminative pair).

| Form | Obligation on a `conceptual` node | Discriminative | REQUIRED pair carried |
| --- | --- | --- | --- |
| `lesson` | **R** | no | — |
| `example` | **R** | **yes** | `misconception_or_edge_case` + `separating_distractor_or_boundary_input` |
| `visualization` | **R** | **yes** | `misconception_or_edge_case` + `separating_distractor_or_boundary_input` |
| `reflection` | **R** | **yes** | `misconception_or_edge_case` + `separating_distractor_or_boundary_input` |
| `retrieval` | **R** | **yes** | `misconception_or_edge_case` + `separating_distractor_or_boundary_input` |
| `assessment` | **R** | **yes** | `misconception_or_edge_case` + `separating_distractor_or_boundary_input` |
| `problem-reference` | O | no | — |
| `solution` | O | no | — |
| `proof` | O | no | — |
| `test` | — | — | — |

**Neither field of the pair is ever optional**, and a submission omitting either is rejected by the form definition itself. The field names above are SUB-2's exact strings.

---

## 3. Evidence class per assertion

| Assertion | Source | Evidence class | Machine-verified? |
| --- | --- | --- | --- |
| `conceptual` is instantiated by exactly 3 nodes, all CL-1 (2 frozen roots + 1 non-root) | `../../C005-dp-map/nodes/cl-1-foundational.yaml`; `../../C005-dp-map-integrity/02_skill-type-union-completeness.md` §1, §3 | 2 `[code-evidence]` | Yes — read from committed YAML at the 2026-08-10 cutoff |
| CL-2, CL-3, CL-4 instantiate `conceptual` zero times | `../../C005-dp-map/nodes/cl-2-combinatorial.yaml`, `cl-3-state-compression.yaml`, `cl-4-optimization/mainstream.yaml`, `cl-4-optimization/frontier.yaml`; audit §2 absence table | 2 `[code-evidence]` | Yes |
| Each named near-candidate's current `skill_type` and its recorded rationale | the same node files, per-node `skill_type` / `skill_type_rationale` | 2 `[code-evidence]` | Yes |
| Cluster ids, names and defining contributions | `../../C005-dp-map/manifest.yaml` | 2 `[code-evidence]` | Yes |
| The `S1→S8` cascade, `settled` as `D-S1`, and its `>10` revision trigger (**not fired — count is 1**) | `../../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §2; `../../C005-dp-map-schema/01_node-and-edge-schema.md` §3 | 1 `[literature]` | Read, not re-derived |
| OUT-2's criterion is union-completeness, explicitly not per-cluster | `../../C005-dp-map-integrity/02_…` §4 | 1 `[literature]` | Read, not re-derived |
| `F-939-A`, `F-939-B` are confirmed genuine gaps under `INC-C1` | `../../C005-dp-map-integrity/05_findings-register.md` | 1 `[literature]` | Read, not re-derived |
| Cluster citation coverage is `0/4`; `CAP-2` closure declined | `../03_problem-citation-verification-and-access-paths.md` §11, §12; `D-R5`; `CAP-S3-1` | 1 `[literature]` | Read, not re-derived |

**No assertion in this package's SUB-5 output rests on a network fetch, because none was made.** No problem id, URL or identifier-shaped string appears in either file.

---

## 4. Non-mutation check

| Check | Expected | How it is verified |
| --- | --- | --- |
| No map node, edge, stage or difficulty value authored or altered | `docs/research/C005-dp-map/` shows **zero** changed files | `git diff --stat <base> -- docs/research/C005-dp-map/` is empty |
| The schema ledger is append-only | **0 deletions** | `git diff --numstat <base> -- …/01_schema-decision-ledger.md` |
| Both shared registers are append-only | **0 deletions** each | `git diff --numstat <base> -- …/90_…md …/91_…md` |
| `D-R5` and `### 3.10` survive intact; exactly one `D-R6` is added | `D-R5` count unchanged; `### 3.11` present once | `grep -c` on the ledger |
| `D-R7` onward left free for NEU-963 | no `D-R7` anywhere | `grep -c "D-R7"` is 0 |

---

## 5. What this matrix does not assert

- It does **not** assert that any cluster's conceptual coverage is **achieved**. Three rows are *routed*, and a routed row is pending until the map's owner acts.
- It does **not** assert that `F-943-2` is closed. It is **decided; closure pending the routed map-side change.**
- It does **not** cover the 10 `INC-C1` techniques. CL-4's row is scoped to **mapped** members, and the unmapped residual is `OI-S5-3` — deliberately **not** folded into row 4, because folding it would misreport an unmapped gap as a mapped one.
- It sets **no status.**
