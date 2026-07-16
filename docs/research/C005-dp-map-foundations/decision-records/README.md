# Decision Records

**Task:** NEU-932 · **Compiled:** 2026-07-16

One record per material NEU-932 decision: the decision, its rationale, its rejected alternatives, its consequences, its evidence, and its revision trigger. Follows the NEU-888 decision-record shape (`../../C005-instructional-model/decision-records/00_decision-record-template.md`), referenced rather than re-derived.

**Status is not set here.** It is set in `../adjudication/01_selection-decision-ledger.md` and nowhere else.

## The records

| Id | Decision | Record of record | Status |
| --- | --- | --- | --- |
| **D-F1** | The six selected reference taxonomies | `../01_taxonomy-selection.md` (§2 selection, §3 comparison, §4 rejected alternatives, §5 findings) | settled |
| **D-F2** | The six selected problem corpora | `../02_corpus-selection.md` (§2, §3, §4, §5) | settled |
| **D-F3** | The map representation format | `../03_representation-format.md` (§1 decision, §2 rejected alternatives, §3 honest costs, §4 file ownership) + `../dry-run/00_representation-dry-run.md` | settled |
| **D-F4** | The four-cluster partition, its rule, and Convention U | **`DR-F04_family-cluster-partition.md`** (this folder) + `../04_family-cluster-partition.md` | settled |
| **D-F4a** | Placement of specific contested/indeterminate techniques | `../04_…` §4.2; ledger row | provisional |
| **D-F5** | Provenance-and-rights dispositions | `../05_provenance-and-rights.md` | settled |
| **D-F3a** | The node-level schema | — (SUB-2 authors it) | unresolved by design |

## Why only D-F4 has a standalone record

The NEU-932 acceptance bar is *"any material choice carries a documented rationale and the rejected alternatives weighed against it."* For D-F1, D-F2, D-F3, and D-F5, the topic file **is** that record — each carries its selection, comparison matrix, rejected-alternatives table, and findings in one place. Duplicating them into parallel decision records would create two documents that drift, and the second one would be the one a reader trusts wrongly.

**D-F4 gets a standalone record because it is the charter's highest-blast-radius decision**: SUB-2's schema, five parallel mapping sub-tasks' scopes, and OUT-6's path count all key off it. It earns a record that states the decision without the surrounding exposition, so a downstream agent can read the *decision and its alternatives* in one screen without reading the full justification.

Every record and topic file defers status to the ledger.
