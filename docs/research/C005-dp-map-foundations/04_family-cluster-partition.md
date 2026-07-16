# The DP-Family-Cluster Partition

**Task:** NEU-932 · **Decision:** `D-F4` (+ `D-F4a`) · **Compiled:** 2026-07-16 · **Status:** settled (see `adjudication/01_selection-decision-ledger.md`; this file does not set status)

This file fixes the **four family clusters** the NEU-889 family-mapping sub-tasks are scoped to, states the **rule** that assigns a DP technique to exactly one of them, and states the **convention** that keeps the partition disjoint and exhaustive when a technique nobody enumerated shows up.

Per the NEU-932 spec, this sub-task **justifies rather than derives** the four clusters: the cluster set is given by the charter, and the contribution here is the rule and the convention that make it a real partition rather than four labels.

---

## 1. What is being partitioned

The partition's domain is the **maximal known competitive DP technique space** (NEU-889 Assumption #4) — the standard Div1/ICPC canon *plus* rare and research-tier techniques. The partition must therefore survive contact with techniques that are not in any selected reference taxonomy, including ones invented after this package's 2026-07-16 cutoff.

Two things are explicitly **outside** the partition's domain and are not assigned a cluster:

- **Non-DP prerequisite anchors** — segment / Li Chao trees, convex-hull / envelope geometry, modular and linear algebra. These live in the charter's versioned **assumed-knowledge boundary register** (NEU-889 Assumption #14), sit outside the DP technique-space partition by construction, and are a *sanctioned terminal* for a prerequisite edge, not a cluster member. A mapper that finds itself wanting to assign a cluster to "segment tree" has crossed the boundary and should register an anchor instead.
- **The DP first principles themselves** as *anchors* — optimal substructure, overlapping subproblems, memoization-vs-tabulation. These are cluster members (CL-1 owns them) but are roots, not techniques; the rule below is not run on them.

**This file enumerates no technique space.** Every technique named below is a worked example of the rule, chosen because it is a *hard case*. The inventory is the family-mapping sub-tasks' deliverable, and a list here would be topic volume masquerading as coverage (NEU-889's standing constraint).

## 2. The four clusters

| Id | Cluster | Owns — the *defining contribution* that lands a technique here | Owning sub-task |
| --- | --- | --- | --- |
| **CL-1** | Foundational / linear-sequence | DP first principles, and DP whose state is a **plain index tuple over a linear/rectangular domain** and whose difficulty is the recurrence itself. | SUB-3 |
| **CL-2** | Combinatorial / structural | DP whose state is **indexed over a nontrivial combinatorial structure** — the structure, not the encoding, is what makes it hard. | SUB-4 |
| **CL-3** | State-compression / specialized-domain | DP whose defining contribution is a **non-tuple state encoding**, or which is bound to a **specialized problem domain** with its own semantics. | SUB-5 |
| **CL-4** | DP-optimization (mainstream + research-tier frontier, **jointly**) | Techniques whose defining contribution is **reducing the cost of evaluating an already-correct recurrence** — the recurrence is given; the contribution is making it affordable. | SUB-6 (mainstream) + SUB-13 (research-tier frontier) |

### 2.1 Why CL-4 is one cluster and not two

The charter names "DP-optimization" and a "research-tier frontier" and the spec fixes them as **one** cluster split across two sub-tasks **for one-PR sizing only**. This distinction is load-bearing and easy to get wrong:

- **The partition has four clusters.** CL-4 is one of them. Its defining contribution (cost-reduction of a given recurrence) is a single, coherent test; Knuth's optimization and the kinetic-segment-tree frontier answer that test identically. Splitting them into two *partition* clusters would require a principled boundary between "mainstream" and "research-tier," and no such boundary exists — the distinction is popularity and recency, which drift, not structure, which doesn't. A partition whose boundary drifts is not a partition.
- **The work has five sub-tasks.** SUB-6 and SUB-13 both write into CL-4. This is a **work split, not a partition split.**
- **Therefore OUT-6 counts against four clusters**, not five: at least one representative path per cluster, over CL-1…CL-4. CL-4's single path may reach a research-tier endpoint and thereby also satisfy OUT-6's maximalist-endpoint requirement.
- **Therefore the file layout must let two sub-tasks write CL-4 without colliding.** This is the one place the partition constrains the representation, and `03_representation-format.md` §4 discharges it: CL-4 owns a *directory*, and SUB-6 and SUB-13 own disjoint files within it.

Recorded rejected alternative: **five clusters, splitting the frontier out.** Rejected because it manufactures an unowned-boundary problem (where exactly does "mainstream" end?), it makes the OUT-6 count ambiguous, and the spec fixes four. Recorded in `decision-records/DR-F04_family-cluster-partition.md`.

## 3. The partition rule (ordered, first-match-wins)

**The rule assigns by *defining contribution*, not by topic area, not by the objects the problem mentions.**

> **Ask, in order. The first test that answers "yes" owns the technique. Stop there.**
>
> - **T1 → CL-4.** Does the technique take an **already-correct recurrence** and reduce the cost of evaluating it, without changing what the states *mean*?
> - **T2 → CL-3.** Is the technique's defining contribution the **encoding of the state** into something that is not a plain index tuple — or is the technique **bound to a specialized problem domain** whose semantics (not whose structure) are the difficulty?
> - **T3 → CL-2.** Is the state **indexed over a nontrivial combinatorial structure**, such that the structure is what the DP must respect?
> - **T4 → CL-1.** Otherwise: the state is a plain index tuple over a linear/rectangular domain, or the item is a DP first principle.

### 3.1 Why this order, and why order is what makes it a partition

Ordering is not a convenience — **it is the entire disjointness argument.** Many techniques answer "yes" to more than one test. Convex Hull Trick is an optimization (T1) applied to a linear-sequence DP (T4). Bitmask DP over subsets is a state encoding (T2) over a combinatorial structure (T3). Without an order, both are double-claimed and two mappers write the same node. With the order, CHT is CL-4 and bitmask DP is CL-3, full stop.

The order runs **most-specific-contribution first**:

1. **T1 first** because "optimizes a given recurrence" is the most specific claim available: it presupposes a correct recurrence already exists elsewhere. An optimization is *parasitic on* a base DP, so it would otherwise be double-claimed by whatever cluster owns its base. Putting T1 first says: **the optimization is owned by CL-4, and the base DP it accelerates is owned by its own cluster.** These are two different nodes, not one contested node.
2. **T2 before T3** because an exotic *encoding* is a stronger signal than the structure it happens to encode. Bitmask DP is about the mask; that its masks describe subsets of a set is incidental to what a learner must acquire.
3. **T3 before T4** because T4 is the residual and must only catch what the earlier tests confidently rejected.

**Multi-match is expected and is the rule working.** When a technique matches several tests, the earliest wins ownership, and the losing cluster's mapper may **link** to the node but must not **own** it. Cross-cluster edges are the integration sub-task's job, not a mapper's.

### 3.2 Worked examples (illustrative, not an inventory)

| Technique | T1? | T2? | T3? | Owner | Why the order matters here |
| --- | --- | --- | --- | --- | --- |
| Longest increasing subsequence (O(n²) recurrence) | no | no | no | **CL-1** | Confident residual: plain index tuple, linear domain. |
| LIS in O(n log n) via a monotone structure | **yes** | no | no | **CL-4** | Same problem as the row above, different node, different cluster. The recurrence was already correct; this makes it affordable. Not a contradiction — a demonstration. |
| Tree DP / rerooting | no | no | **yes** | **CL-2** | The tree is the state's index; respecting it is the difficulty. |
| Interval DP (e.g. optimal BST recurrence) | no | no | **yes** | **CL-2** | Indexed over intervals — a nontrivial structure. |
| Knuth / quadrangle-inequality optimization | **yes** | — | — | **CL-4** | Stops at T1. Its base is an interval DP owned by CL-2; the optimization node is CL-4's. |
| Divide-and-conquer optimization | **yes** | — | — | **CL-4** | Same shape as above. |
| Bitmask / subset DP | no | **yes** | (yes) | **CL-3** | T2 fires before T3. The mask *is* the contribution. |
| Digit DP | no | **yes** | — | **CL-3** | Specialized domain (numeral representation) with its own state semantics. |
| Probability / expectation DP | no | **yes** | — | **CL-3** | Specialized domain: the semantics of the value, not the shape of the state. |
| Game DP / Sprague-Grundy | no | **yes** | — | **CL-3** | Specialized domain semantics. |
| SOS DP (subset-sum convolution / zeta-Möbius) | **yes** | — | — | **CL-4** | Contested; adjudicated below in §4.2. |
| Matrix-exponentiation DP | **yes** | — | — | **CL-4** | Accelerates a fixed linear recurrence. Its non-DP prerequisite (linear algebra) terminates on a boundary anchor, not a cluster. |
| Convex Hull Trick / Li Chao | **yes** | — | — | **CL-4** | T1. Envelope geometry / Li Chao trees are boundary anchors, not cluster members. |
| Slope trick | **yes** | — | — | **CL-4** | T1. |
| Kinetic segment tree ↔ DP interplay | **yes** | — | — | **CL-4** | Research-tier frontier — still CL-4, still one cluster, mapped by SUB-13. |
| Lagrangian relaxation / "Aliens trick" | **yes** | — | — | **CL-4** | T1. |
| **Plug DP / broken-profile DP** | no | **yes** | (yes) | **CL-3** | Un-enumerated by the spec's own example. T2 fires: the *plug/profile encoding* is the contribution. Lands cleanly without invoking the indeterminate convention. |
| **Automaton DP** (incl. Aho–Corasick DP) | no | **yes** | — | **CL-3** | The spec's other named un-enumerated case. T2 fires: the state is an automaton node, not an index tuple. |
| **Steiner-tree DP** | no | **yes** | (yes) | **CL-3** | T2 fires on the subset-of-terminals mask encoding. Its tree structure (T3) loses to T2 by order — CL-2 may link, not own. |

The last four rows are the ones that matter: **every technique the NEU-932 spec named as a hard, un-enumerated case lands in exactly one cluster by the rule alone**, without reaching for the fallback convention.

## 4. The unassigned / un-enumerated technique convention

The rule above is total over techniques whose defining contribution can be identified. The convention covers the remainder — and is what makes the partition **exhaustive** rather than merely disjoint.

> **Convention U.** A DP technique that is not enumerated in any selected reference taxonomy — including one invented after this cutoff — is **never a gap, never unowned, and never grounds for a new cluster.** Run the cascade (§3) on it.
>
> - **U1.** If T1, T2, or T3 answers confidently, that test's cluster **owns** it. Its absence from the reference taxonomies is irrelevant to ownership; it is a coverage question for the audit sub-task, not a partition question.
> - **U2 (the indeterminate sink).** If the defining contribution **cannot be confidently identified** — the technique is too new, too under-described, or genuinely hybrid — **CL-3 owns it**, provisionally, and the assignment is logged in the ledger as a `D-F4a` entry with a named re-adjudication trigger.
> - **U3.** CL-1 is reached **only** by a confident "no" to T1–T3 (i.e. it really is a plain-index linear DP). **CL-1 is not the sink.** An indeterminate technique must never fall to CL-1.
> - **U4.** A mapper that believes a technique is misassigned **may not re-decide locally and may not open a fifth cluster.** It files a ledger challenge against `D-F4a` (or `D-F4`). Until that challenge is adjudicated, the existing assignment stands and the technique stays mapped — the map never has a hole while an argument is in progress.

### 4.1 Why CL-3 is the sink and CL-1 is not

This is the single most consequential choice in the file, so the reasoning is explicit.

The intuitive move is to make the residual and the sink the same cluster — CL-1 catches everything unclaimed. **That is wrong, and it is the failure mode this convention exists to prevent.** CL-1 is *foundational*. An exotic, hard-to-classify research-tier technique dumped into "foundational / linear-sequence" would be actively misleading: it would corrupt the cluster a learner starts in, distort CL-1's difficulty ramp, and hand SUB-3 — the sub-task least equipped for frontier material — a node it cannot map. The residual of a *rule* and the sink of a *fallback* are different jobs and must be different clusters.

CL-3 is the right sink on the merits:

- Its second limb — "**bound to a specialized problem domain**" — is already a semantic catch-all. A technique that resists T1 and T3 is, almost by construction, doing something domain-specific with its state. The sink is an extension of CL-3's actual meaning, not a bolt-on.
- Indeterminacy usually *is* an encoding problem. When a technique is too novel to classify, the reason is normally that its state representation is unfamiliar — which is exactly T2's subject.
- SUB-5 is the mapper most likely to have the context to make sense of an exotic technique, and CL-3 is where a reader would look for one.

**The honest cost, recorded rather than hidden:** CL-3 will accrete the odd ones, and can drift toward "miscellaneous" if U2 is used lazily. Two mitigations: U2 requires an explicit, *logged* indeterminacy finding (it is never silent, so drift is always countable), and every U2 assignment is **provisional** with a re-adjudication trigger, so a technique parked in CL-3 gets moved once someone understands it well enough to answer the cascade. If U2 entries outnumber `10` at the coverage audit, that is a signal the cascade needs revision — recorded as a revision trigger on `D-F4` rather than absorbed silently.

### 4.2 A worked indeterminate case, and one contested case

**Contested — SOS DP.** SOS DP (sum-over-subsets / zeta-Möbius transform) plausibly answers T1 (it accelerates a subset-indexed transition from 3ⁿ to 2ⁿ·n) *and* T2 (it is inseparable from the subset-mask encoding). **Adjudicated to CL-4 by the order**, because its defining contribution is the *cost reduction* of a transition that is already correct if computed naively. Recorded as a `D-F4a` provisional entry: SUB-5 (CL-3) has a real claim here and may challenge via U4. CL-3's mapper may link to it. This case is logged rather than smoothed precisely because the NEU-889 charter forbids silently smoothing a disagreement.

**Indeterminate — a hypothetical post-cutoff technique.** Suppose a 2027 technique maintains a DP over a learned index structure with no clear separation between "the recurrence" and "the acceleration," so T1 cannot be answered confidently, T2 is unclear, and T3 does not fire. Convention U2 assigns it to **CL-3**, provisionally, logged with the trigger "re-adjudicate once a description separating recurrence from acceleration exists." It is mapped, owned, and visible — not orphaned pending a decision.

## 5. Disjointness, exhaustiveness, and no fifth cluster

The three properties the NEU-932 acceptance scenario demands, argued rather than asserted:

- **Disjoint (nothing double-claimed).** The cascade is ordered and first-match-wins. A technique cannot be owned by two clusters because evaluation *stops* at the first match. Multi-match techniques are resolved by order (§3.1), with the losing cluster permitted to link but not own (U4 governs disputes). The one property this relies on: **exactly one mapper writes a given node**, which the per-cluster file ownership in `03_…` §4 enforces mechanically rather than by convention.
- **Exhaustive (nothing orphaned).** T4 is a true residual — it has no predicate to fail, so a technique reaching it is always assigned. A technique that cannot even reach T4 confidently is caught by U2 → CL-3. There is no path through the cascade that terminates without an owner. Formally: the cascade is a total function from the technique space onto `{CL-1, CL-2, CL-3, CL-4}`.
- **No unowned fifth cluster.** The rule's codomain is literally the four-element set `{CL-1, CL-2, CL-3, CL-4}` — it has no expression that produces a new label. The only way to add a cluster is to amend `D-F4` through the ledger, which would also have to name an owning mapper (a cluster without an owning sub-task is prohibited by the spec). U4 routes every "this doesn't fit anywhere" impulse into a ledger challenge instead of a new bucket. **Each of the four clusters has an owning mapper today** (§2), so the cluster set and the owned set are identical, and OUT-6's per-cluster path criterion counts against four clusters that each have one.

### 5.1 Partition-completeness self-check (the NEU-932 verification evidence)

| Check | Passing condition | Result |
| --- | --- | --- |
| **PC-1** | Every enumerated worked example in §3.2 has exactly one owning cluster. | **Pass** — 19/19 rows, one owner each. |
| **PC-2** | Every technique the spec names as un-enumerated (plug DP, automaton DP, Steiner-tree DP) is assigned by the rule. | **Pass** — all land in CL-3 via T2, without invoking U2. |
| **PC-3** | An indeterminate technique has a named owner. | **Pass** — U2 → CL-3, provisional, logged (§4.2). |
| **PC-4** | No technique is double-claimed. | **Pass** — ordered first-match-wins; the two genuine multi-match cases (SOS DP, Steiner-tree DP) are adjudicated and logged, not smoothed. |
| **PC-5** | No cluster lacks an owning mapper; no fifth cluster is producible. | **Pass** — 4 clusters, 4 owners (CL-4 owned jointly by SUB-6 + SUB-13 over disjoint files); codomain is fixed at four. |
| **PC-6** | Non-DP prerequisites are not assigned clusters. | **Pass** — routed to the charter's boundary register (§1). |
| **PC-7** | CL-1 is not the indeterminate sink. | **Pass** — U3 states it explicitly; CL-1 is reached only on a confident residual. |

## 6. What this partition does **not** do

- It does not enumerate the technique space. That is the family-mapping sub-tasks' deliverable.
- It does not rank clusters by difficulty or imply a learning order. Progression is OUT-3's job, interpreted through NEU-888's mastery semantics.
- It does not adjudicate whether a reference taxonomy's disputed item "is DP." That is the coverage-audit sub-task (OUT-7). Where the selected references disagree, the disagreement is preserved for that audit.
- It does not decide the node schema. That is SUB-2.
