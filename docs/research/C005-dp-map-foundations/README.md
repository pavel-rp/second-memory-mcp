# C005 DP Map Foundations — Selected References, Representation, and Family-Cluster Partition

**Program:** C005 (AI-backed dynamic-programming course) · **Charter:** NEU-889 (Map the complete dynamic-programming learning progression) · **Task:** NEU-932 (SUB-1, covers OUT-1 and the OUT-6 cluster set) · **Package version:** `dp-map-foundations/1.0.0` · **Verification cutoff:** 2026-07-16

**What this is.** The setup package for the NEU-889 DP knowledge-and-skill map. It fixes the four things every later sub-task builds on, and it fixes nothing else:

1. **The reference DP taxonomies** actually selected (`01_taxonomy-selection.md`), each with the comparison it won and the alternatives that were rejected and why.
2. **The representative problem corpora** actually selected (`02_corpus-selection.md`), same discipline, each with its provenance and rights disposition.
3. **The map's representation format** (`03_representation-format.md`) — decided here per charter Assumption #3, and demonstrated versioned-and-prompt-ready by the dry-run in `dry-run/00_representation-dry-run.md`.
4. **The DP-family-cluster partition** (`04_family-cluster-partition.md`) — the fixed set of exactly **four** clusters the family-mapping sub-tasks are scoped to, with the partition rule and the unassigned-technique convention that lands every DP technique in exactly one of them.

**What it is not — it maps no DP.** This package names no DP node, draws no prerequisite edge, authors no graph schema, and enumerates no technique inventory. Every technique named anywhere in it appears only as a **worked example of the partition rule**, never as a claim of coverage. Topic volume is never coverage (NEU-889 constraint); this package's job is the partition and the references, and a long list here would be a failure, not a feature.

It also authors no graph schema, node-type template, or skill-type vocabulary — that is SUB-2, which builds on the representation format decided here. It extends, and never re-derives, NEU-887's evidence taxonomy, materiality rule, traceability register, and adjudication ledger.

## ▶ Start here (reading order)

| Step | File | What it gives you |
| --- | --- | --- |
| 1 | **This README** | The map: what is decided, what is open, the four clusters at a glance, the standing caveats. |
| 2 | **`00_method-and-provenance.md`** | How the selection was made: the candidate sweep, the inclusion tests, cutoffs, the inherited NEU-887 machinery, and what was not attempted. |
| 3 | **`01_taxonomy-selection.md`** | The selected reference taxonomies (`T1…T6`), the comparison matrix, and the recorded rejected alternatives. |
| 4 | **`02_corpus-selection.md`** | The selected problem corpora (`C1…C6`), the comparison matrix, and the recorded rejected alternatives. |
| 5 | **`03_representation-format.md`** | The chosen representation format, the four alternatives weighed against it, and the per-cluster file-ownership property the parallel mapping sub-tasks depend on. |
| 6 | **`04_family-cluster-partition.md`** | **The highest-blast-radius file.** The four clusters, the ordered partition rule, the unassigned/un-enumerated convention, and the disjointness-and-exhaustiveness argument. |
| 7 | **`05_provenance-and-rights.md`** | Per-source provenance and rights disposition; which corpora are **inform-only** and what that forbids. |
| 8 | **`dry-run/00_representation-dry-run.md`** | The cold-context dry-run proving the representation is versioned and prompt-ready and that settled reads differently from provisional. |
| 9 | **`decision-records/DR-F01…DR-F05`** | One record per material decision: the decision, its rationale, its rejected alternatives, its status, and its revision trigger. |
| 10 | **`traceability/`, `adjudication/`** | The NEU-887 register and ledger extended to this package's decisions — the only place a status flips. |
| 11 | **`06_caps-and-incomplete-scope.md`** | The caps this selection ran under and the honest statement of what it does not cover. |

## The four family clusters (fixed — this is the cluster set OUT-6 counts against)

| Cluster | Name | Owns (defining contribution) | Owning sub-task |
| --- | --- | --- | --- |
| **CL-1** | Foundational / linear-sequence | DP first principles and DP whose state is a plain index tuple over a linear domain. The **confident residual** of the partition rule. | SUB-3 |
| **CL-2** | Combinatorial / structural | DP whose state is indexed over a nontrivial combinatorial structure (trees, graphs, intervals, subsets-as-structure). | SUB-4 |
| **CL-3** | State-compression / specialized-domain | DP whose defining contribution is a non-tuple **state encoding**, or which is bound to a specialized problem domain. The **indeterminate sink** (see convention below). | SUB-5 |
| **CL-4** | DP-optimization (mainstream + research-tier frontier, jointly) | Techniques whose defining contribution is reducing the cost of evaluating an **already-correct** recurrence. | SUB-6 + SUB-13 (one cluster, split across two PRs for sizing only) |

**The cluster set is exactly four, and each has an owning mapper.** CL-4 is deliberately one cluster carrying both the mainstream optimizations and the research-tier frontier; it is split across two sub-tasks purely for one-PR sizing, which is a *work* split, not a *partition* split. No fifth cluster exists, and the partition rule cannot produce one — see `04_…` §5.

**Assignment is by defining contribution, not by topic area**, evaluated as an ordered first-match-wins cascade (CL-4 → CL-3 → CL-2 → CL-1). Two techniques over the same objects can land in different clusters, and that is the rule working, not failing.

**Unassigned / un-enumerated convention (the part that matters most):** a technique nobody enumerated — plug DP, automaton DP, or something invented after this cutoff — is not a gap and never opens a new cluster. Run the cascade on it. If tests 1–3 answer confidently, that test's cluster owns it. If the defining contribution is **indeterminate**, **CL-3 owns it** by convention, provisionally, with a logged re-adjudication trigger. CL-1 is the residual only on a *confident* "no" to tests 1–3 — it is not a dumping ground. Full statement and worked examples in `04_…` §3–§4.

## Decision status at a glance

Status is set **only** in `adjudication/01_selection-decision-ledger.md`. Nothing in this README overrides it.

| Decision | What it fixes | Status |
| --- | --- | --- |
| **D-F1** | The six selected reference taxonomies | settled |
| **D-F2** | The six selected problem corpora | settled |
| **D-F3** | The representation format (per-cluster YAML under a versioned manifest + markdown entry point) | settled |
| **D-F4** | The four-cluster partition, its rule, and its unassigned convention | settled |
| **D-F5** | The provenance-and-rights dispositions (inform-only marking) | settled |
| **D-F4a** | Placement of *specific* indeterminate techniques via the CL-3 convention | provisional — re-adjudicated on a mapper's challenge |
| **D-F3a** | The node-level schema inside the chosen format | **unresolved here by design** — owned by SUB-2 |

Downstream sub-tasks inherit **D-F1…D-F5 as binding**. They may challenge any of them, but only through the ledger, and only with correctly-classed evidence — never by locally re-deciding.

## Standing caveats (true of everything in this package)

- **This is a selection, not a curriculum.** The reference taxonomies and corpora are research inputs. Where two selected references disagree about what counts as DP, this package does **not** adjudicate — that is the coverage-audit sub-task's job, and the disagreement is preserved for it, not smoothed here.
- **No class-7 evidence exists.** Nothing here is external-user, expert, or market validation. Every finding is class 1 `[literature]` or class 2 `[code-evidence]`, labeled per NEU-887's taxonomy, which this package references rather than re-derives.
- **Rights-sensitive corpora are inform-only.** They shape the taxonomy; their content is never reproduced. `05_…` names each one and what "inform-only" forbids. The USACO Guide's reproduction bar is a **verified** finding, not an assumption.
- **The partition is justified, not derived.** Per the NEU-932 spec, the four clusters are given by the charter; this package's contribution is the rule that makes them disjoint and exhaustive and the convention that keeps them that way under un-enumerated techniques. If the rule is wrong, the fix is a ledger entry, not a fifth cluster.
- **Provisional by default.** Every decision is revisable by a downstream sub-task with stronger evidence, through the ledger.

## Provenance

Downstream consumers: SUB-2 (graph schema, builds on D-F3), the five family-mapping sub-tasks SUB-3/4/5/6/13 (each scoped to exactly one cluster of D-F4), the coverage-audit sub-task (compares against D-F1/D-F2), the representative-path sub-task (OUT-6 counts one path per cluster of D-F4), and the final adjudicated package. This package extends the NEU-887 product-foundation package (`docs/research/C005-product-foundation/`) — its seven-class evidence taxonomy, materiality rule, traceability register, and adjudication ledger — and consumes, without re-deriving, the NEU-888 instructional-and-mastery package (`docs/research/C005-instructional-model/`).
