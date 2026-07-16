# DR-F04 — The Four-Cluster DP-Family Partition

**Task:** NEU-932 · **Decision id:** `D-F4` (+ `D-F4a`) · **Status:** settled (`../adjudication/01_selection-decision-ledger.md`) · **Compiled:** 2026-07-16

Follows the NEU-888 decision-record shape (`../../C005-instructional-model/decision-records/00_decision-record-template.md`), referenced rather than re-derived.

---

## Decision

The DP technique space is partitioned into **exactly four** family clusters — **CL-1** foundational/linear-sequence, **CL-2** combinatorial/structural, **CL-3** state-compression/specialized-domain, **CL-4** DP-optimization (mainstream + research-tier frontier, jointly) — assigned by an **ordered, first-match-wins cascade on defining contribution** (T1→CL-4, T2→CL-3, T3→CL-2, T4→CL-1 residual), with **Convention U** governing un-enumerated techniques and **CL-3 as the indeterminate sink**.

Full statement: `../04_family-cluster-partition.md`.

## Rationale

- **The clusters were given; the rule was not.** The NEU-932 spec fixes the four clusters and instructs this sub-task to *justify rather than derive* them. The real work — and the actual deliverable — is a rule that makes four labels into a genuine partition: disjoint, exhaustive, and stable under techniques nobody has enumerated.
- **Ordering is the disjointness proof.** Many techniques answer several tests (CHT is an optimization over a linear DP; bitmask DP is an encoding over a structure). Unordered tests double-claim them and two mappers write the same node. First-match-wins makes double-claiming impossible by construction rather than by care.
- **T1 first because optimizations are parasitic.** "Optimizes an already-correct recurrence" presupposes a base DP owned elsewhere. Putting T1 first cleanly separates *the optimization node* (CL-4's) from *the base DP it accelerates* (its own cluster's) — two nodes, not one contested node.
- **T4 is a true residual**, so exhaustiveness is structural: nothing can traverse the cascade without an owner.
- **CL-4 stays one cluster** because "mainstream vs research-tier" is a distinction of popularity and recency, which drift. A partition boundary that drifts is not a partition. The SUB-6/SUB-13 split is a *work* split for one-PR sizing, which is why CL-4 gets one manifest id and two files.

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| **Five clusters** — split the research-tier frontier from mainstream optimization. | Manufactures an unowned boundary problem (where does "mainstream" end?), makes OUT-6's per-cluster path count ambiguous, and contradicts the spec's four. The frontier/mainstream distinction is real but is about *work sizing*, not *structure*. |
| **CL-1 as the indeterminate sink** (residual and sink unified). | The most tempting alternative, and wrong. CL-1 is *foundational*: dumping exotic research-tier techniques there corrupts the cluster learners start in, distorts its difficulty ramp, and hands SUB-3 — the mapper least equipped for frontier material — nodes it cannot map. The residual of a *rule* and the sink of a *fallback* are different jobs. Convention U3 now forbids this explicitly. |
| **Unordered tests with a tie-break table.** | Requires enumerating every multi-match pair in advance — impossible over a space that includes un-enumerated techniques, which is the exact case the partition must survive. |
| **Assignment by topic area** (trees / strings / numbers / graphs). | Intuitive and familiar, but it double-claims relentlessly: a tree-shaped bitmask optimization belongs to three areas at once. Topic areas describe *problems*; clusters must describe *techniques*. |
| **A fifth "miscellaneous / unassigned" cluster.** | Directly violates the spec's no-unowned-fifth-cluster bar. It would also have no owning mapper, so its nodes would ship unmapped — the orphaning the partition exists to prevent. Convention U4 routes this impulse into a ledger challenge instead. |

## Consequences

- **Five family-mapping sub-tasks are each scoped to exactly one cluster** (CL-4 shared by SUB-6/SUB-13 over disjoint files). No cluster ships without an owning mapper.
- **OUT-6 counts against four clusters** — at least one representative path each.
- **The representation must support per-cluster file ownership**, and CL-4's one-id/two-file shape must not read as a fifth cluster. Discharged by `D-F3` (`../03_…` §4) and verified by the dry-run's Q7.
- **CL-3 will accrete the odd ones.** Accepted with mitigations: every U2 use is logged (so drift is countable) and provisional (so it gets revisited). `>10 U2 entries` is a revision trigger on this decision.
- **Disagreements are carried in-band.** `X-D1` (SOS DP: CL-4 vs CL-3) is live and recorded in the map itself via `contested_by`, not smoothed.

## Evidence

This is a **design decision, not an empirical finding**, and is declared as such in `../traceability/01_selection-evidence-register.md` SOC-7 rather than dressed in manufactured `F-*` rows. Its justification is the disjointness/exhaustiveness argument and the PC-1…PC-7 self-check (`../04_…` §5.1), all passing, including the spec's named hard cases (plug DP, automaton DP) landing by rule without invoking the fallback.

## Revision trigger

More than 10 `D-F4a` indeterminate (U2) entries accrue — indicating the cascade, not the sink, needs revision. Or a mapper's U4 challenge succeeds against the rule itself. The most likely failure is named in `../06_…` §4: T1-before-T2 concentrating encoding-hard techniques in CL-4.
