# The CL-4 Work-Split Seam — A Systematic Gap Class

**Task:** NEU-942 (SUB-10) · **Compiled:** 2026-07-16 · **Map version:** `0.1.0` · **Severity:** the charter's named highest-severity failure class — a material gap that would otherwise ship with no owner

**This is the material finding of the coverage audit.** Nine of the ten genuine gaps are one defect, not nine.

---

## 1. The finding in one paragraph

`D-F4`'s cascade assigns a technique to a **cluster**. CL-4 is one cluster, mapped by **two sub-tasks** whose scopes are defined not by the cascade but by **enumerated lists** — SUB-6 by five named technique areas, SUB-13 by its named frontier families plus an "exotic tail." **A technique that the cascade sends to CL-4, but which appears in neither enumeration, is owned by the cluster and by no mapper.** It falls through the seam between the two halves. Ten techniques did. **Every mapper behaved correctly at every step; the composition of correct local decisions produced holes.** The map is honest — the decomposition has a seam.

## 2. Why it happened — the mechanism, precisely

Three individually sound decisions compose into the defect:

**1. `D-F4` §2.1 makes CL-4 one cluster and says so for a good reason.** *"Splitting them into two partition clusters would require a principled boundary between 'mainstream' and 'research-tier,' and no such boundary exists — the distinction is popularity and recency, which drift, not structure, which doesn't. A partition whose boundary drifts is not a partition."* **This is right.** The partition is sound and this audit does not challenge it.

**2. The work split is therefore *not* defined by a rule.** It is defined by two enumerations, precisely because no rule exists to define it — that is the direct consequence of (1). `D-F4` §2.1 discharges the *file-collision* problem (CL-4 owns a directory; SUB-6 and SUB-13 own disjoint files) but **not the scope-coverage problem**: disjoint files guarantee no double-claim, and guarantee nothing about exhaustiveness.

**3. Each mapper correctly refused to exceed its enumeration.** Exceeding it risks an id collision in a shared namespace with a concurrently-writing sibling — a real hazard the mappers named explicitly (`RX-2` mainstream: *"absorbing it would risk an id collision with SUB-13 in the shared CL-4 namespace and would exceed the spec's enumeration"*).

**The gap between (1) and (2) is the whole defect.** The cascade is **exhaustive over clusters** — `D-F4` §5 proves it: *"the cascade is a total function from the technique space onto {CL-1, CL-2, CL-3, CL-4}."* The work split is **not exhaustive over CL-4**. Nothing in the charter ever required it to be, and nothing checked that it was. `D-F4`'s exhaustiveness proof is valid and does not reach this: **it proves every technique has an owning cluster; it does not prove every technique has an owning mapper.**

**The seam was foreseen — by the mappers, not by the decomposition.** Three of them predicted this exact failure and flagged it for this audit:

- `RX-2` (mainstream): LIS O(n log n) is *"a material residual exclusion of the CL-4 work split rather than of the cluster: the technique is CL-4's, but neither half's enumerated scope names it."* **This audit's finding is `RX-2` generalized.**
- `E3` (CL-2): the bounded-knapsack accelerations *"are knapsack-flavoured and may read as CL-2's from CL-4's side — they fall through the fan-out."*
- `RX-13` (frontier): its trigger is *"OUT-7 surfaces a material technique the cascade assigns to CL-4 that is neither mapped here nor in mainstream.yaml nor excluded above."*

## 3. The membership test

A technique is in this class iff **all four** hold:

1. **The `D-F4` cascade assigns it to CL-4** — T1 fires: it takes an already-correct recurrence and reduces the cost of evaluating it without changing what the states mean.
2. **It is not among SUB-6's five enumerated areas** — CHT/Li Chao, D&C optimization, Knuth–Yao, monotonic-queue/sliding-window, matrix-exponentiation.
3. **It is not among SUB-13's named frontier families** — slope trick, Lagrangian/Aliens, kinetic segment tree, broken-profile (itself `RX-1`'d to CL-3) — nor its exotic tail.
4. **It is material** under NEU-887's rule at the charter's competitive-DP audience line.

Condition 4 is what separates this class from `RX-7`…`RX-12`. **Those are also CL-4-by-cascade and also in neither enumeration — and they are correctly excluded, because they fail condition 4.** The exotic tail is not a gap; it is a bounded decision. Every instance below **passes** condition 4, most of them overwhelmingly: rolling-array compression and prefix-sum acceleration are taught in every canonical reference.

## 4. The instances — swept, not assumed

**Three instances were known before this audit. The sweep of all 52 exclusions and 12 reference columns found seven more.**

| # | Technique | T1 fires because | Excluded by | Corpus/taxonomy support | Materiality |
| --- | --- | --- | --- | --- | --- |
| 1 | **SOS DP** (`CV-1`) | Accelerates a subset-indexed transition 3ⁿ → 2ⁿ·n **(contested — see §5)** | CL-3 `E1`, CL-2 `E8`, mainstream `RX-1`, frontier `RX-3` | T4, T5, T6; C3, C4, C5, C6 | **High** — standard Div1 |
| 2 | **LIS in O(n log n)** (`CV-2`) | Patience/tails makes an already-correct O(n²) recurrence affordable | CL-1 `EXC-5`, mainstream `RX-2` | T1, T2, T3, T4; C1, C2, C4 | **High** — `D-F4`'s own worked example |
| 3 | **Bounded-knapsack binary splitting** (`CV-3`) | Powers-of-two multiplicity splitting reduces cost, states unchanged | CL-2 `E3` | T4; C2, C4 | **High** — how bounded knapsack is written in practice |
| 4 | **Bitset / word-parallel optimization** (`CV-5`) | Machine-word parallelism divides the constant; recurrence identical | CL-2 `E4`, CL-3 `E4` | T4; C4, C6 | **High** — CL-3 declares an attachment to it |
| 5 | **Prefix-sum acceleration of a transition** (`CV-11`) | Collapses a range-summing transition O(n) → O(1); recurrence already correct | CL-1 `EXC-2` | T1, T2, T3, T4; C1, C2, C4 | **High** — canon |
| 6 | **Rolling-array / memory compression** (`CV-12`) | Reduces memory of an already-correct recurrence | CL-1 `EXC-3` | T1, T2, T3, T4; C2, C4 | **High** — canon |
| 7 | **Hirschberg; bit-parallel edit distance** (`CV-13`) | Both reduce cost of the correct edit-distance recurrence | CL-1 `EXC-6` | T4, T5, T6; C4, C5 | **Medium-high** |
| 8 | **Small-to-large / DSU on tree** (`CV-14`) | Reorganizes an already-correct child merge to beat its bound | CL-2 `E5` | T3, T4, T5; C4, C5 | **High** |
| 9 | **Segment-tree-accelerated digit/automaton transitions** (`CV-15`) | Accelerates an unchanged transition | CL-3 `E6` | T4; C4 | **Medium** |
| 10 | **Profile-hashing acceleration of broken-profile DP** (`CV-16`) | Accelerates the mapped encoding's transition | CL-3 `E7` | T5; C4, C5 | **Medium** |

**Not in the class, checked and excluded from it** — recorded so the sweep's boundary is auditable:

- **Bounded-knapsack monotonic-deque evaluation** — *is* SUB-6's enumerated "monotonic-queue / sliding-window optimization" and **is mapped**, with `to_name: "Bounded knapsack DP"` declared from it. Fails condition 2. `CV-4` **ME**. `E3` bundled it with binary splitting; **this audit splits `E3`** rather than report a mapped technique as a gap.
- **Matrix-exponentiation of an expectation DP** (`E5`) — matrix-exponentiation **is** enumerated and mapped. Fails condition 2. `CV-24` **ME**.
- **Monotone minima** (`RX-6`) — **is** the mechanism of the enumerated D&C optimization, mapped. Fails condition 2. `CV-23` **ME**.
- **Knuth, D&C, CHT, slope trick, Aliens, kinetic** — all enumerated and mapped. Fail condition 2.
- **`RX-7`…`RX-12`** — pass 1–3, **fail condition 4** (no corpus instance). Correctly excluded, not gaps. `CV-29`.
- **Segment tree beats, centroid decomposition** — **fail condition 1** (cascade fires nothing; not DP). `CV-9`, `CV-7`.

## 5. SOS DP is in the class but is blocked on a prior question

Instance 1 differs from the other nine and must not be lumped with them.

The other nine have **settled, uncontested** cluster assignments; only the work split lacks an owner, so naming the owner is mechanical. **SOS DP's cluster is itself live** (`D-F4a` provisional, `X-D1` carried, CL-3's claim explicitly open with a U4 route). Its gap therefore has **two** owners in sequence:

1. **`D-F4a`'s adjudication** — a creator decision in NEU-932's ledger (`CV-1a`, **UU**). This audit does not own that ledger and **does not flip it**; it records a reasoned recommendation (`CV-1a` §A) that the ordering rationale for T1-first is genuinely weaker for SOS DP than for any other T1 member, because SOS DP is the **only** CL-4 member whose accelerated base is mapped nowhere and is not a technique anyone uses in its own right. That asymmetry is real evidence for CL-3's live claim and is offered to `D-F4a`'s owner as such.
2. **Then the winning cluster's mapper**, via `INC-C1`.

**Recorded plainly:** if `D-F4a` resolves to CL-3, SOS DP is **not** in this class at all — it becomes a CL-3 mapping gap and CL-3's declared attachment `xc.cl-3.bitmask-state-encoding->cl-4.sos-dp` becomes wrong in a different way. **The coverage verdict is the same either way** — SOS DP is unmapped and needs an owner — which is why `CV-1` ships as a settled GAP while `CV-1a` ships as UU. **The gap does not wait on the dispute.**

## 6. The verdict, and what it is *not*

**Verdict: a systematic gap class — ten genuine gaps, all with named owners.**

**This is not a partition defect, and must not be treated as one.** Three independent grounds:

- **Convention U1 already covers it**: *"If T1, T2, or T3 answers confidently, that test's cluster owns it. Its absence from the reference taxonomies is irrelevant to ownership; it is a **coverage question for the audit sub-task, not a partition question**."* Every instance has a confident T1. **The partition already assigns all ten.** The rule works.
- **`RX-13`'s trigger says so explicitly**: a technique the cascade assigns to CL-4 that is unmapped and unexcluded is *"a coverage finding against this file and a **MINOR bump of the scope boundary — NOT a partition finding**."*
- **`D-F4` §5's exhaustiveness holds.** Nothing here is orphaned, double-claimed, or grounds for a fifth cluster. **No amendment to `D-F4` is needed or recommended.** The `scope_boundary` (frontier.yaml, `version: 1.0.0`) is the object that must move — which is exactly why NEU-938 versioned it, *"so that widening it later is a visible, dated event rather than drift."* **That versioning decision is what makes this finding cheap to fix, and it should be recorded as having paid off.**

**Nor is it a mapper defect.** Ten techniques, five files, four mappers writing blind and concurrently — and **every cascade judgment is correct**. Each mapper faced the same choice: silently absorb a technique outside its enumerated scope (risking a double-claim and an id collision with a concurrent sibling), or record the exclusion with a rationale and an owner. **All five chose to record.** That is the charter's discipline working exactly as designed — and it is the only reason this audit could find the class at all. **A map whose mappers had smoothed these would have shipped ten silent holes and passed a naive audit.**

## 7. The remedy — a creator decision, named

**This audit may not fill these gaps.** NEU-942 out-of-scope: *"mapping or repairing nodes (routed back to the family clusters if a genuine gap must be filled in-charter)."* Minting ten nodes here would be the exact category error the mappers correctly refused. **The gaps are named, owned, and routed. They are not filled.**

**The routing problem is that both CL-4 mappers are merged and Done.** There is no running sub-task to route these back to. So this is a **creator decision**, and it is `INC-C1`:

> **`INC-C1` — CL-4 work-split coverage completion.** Ten material techniques the `D-F4` cascade assigns to CL-4 are enumerated by neither CL-4 half and are mapped by nobody. **Owner: the creator**, to choose one of the dispositions below. **Blocking:** OUT-7 cannot close these as covered; SUB-11 (NEU-944) must carry them into the final package as open. **Trigger: now.**

**Recommended disposition — Option A**, offered with the alternatives recorded per the charter's bar:

| Option | What it is | Assessment |
| --- | --- | --- |
| **A. A follow-up CL-4 completion task** (**recommended**) | One new sub-task, scoped **by the cascade rather than by an enumeration** — "every T1 technique material at the audience line and not already mapped" — mapping instances 2–10, with 1 (SOS DP) gated on `D-F4a`. MINOR-bumps `scope_boundary` to `1.1.0`. | **The seam's cause is enumerated scope; only a cascade-scoped task removes it.** No partition change, no new cluster, `D-F4` untouched. Both CL-4 files exist, so the id-collision hazard that forced the mappers' restraint **is gone** — the original reason for enumerating is spent. Discharges `RX-2`, `RX-13`, `E3`, `EXC-2`, `EXC-6` exactly as their triggers specify. |
| **B. Widen SUB-6's enumeration and re-run it** | Amend the NEU-937 spec to name the ten, re-open the sub-task. | Same nodes, worse shape: it re-opens a merged, verified sub-task and **rebuilds the enumeration that caused the seam**, so the next un-enumerated T1 technique falls through identically. Treats the symptom. |
| **C. Accept as documented residual exclusions** | Rule all ten immaterial and close them. | **Rejected — this audit cannot honestly recommend it.** Five of the ten (LIS O(n log n), prefix-sum acceleration, rolling-array compression, bitset, bounded-knapsack splitting) are carried by the canonical taxonomies and exercised across C1/C2/C4. Ruling them immaterial would fail NEU-887's materiality rule against its own audience line, and would make the charter's "complete = the maximal known competitive DP technique space" claim indefensible. **Recorded as considered and rejected**, not omitted. |
| **D. Amend `D-F4`** | Split CL-4 into two partition clusters with a principled boundary. | **Rejected.** `D-F4` §2.1 already argues no such boundary exists, and U1 already assigns all ten. It would manufacture the unowned-boundary problem `D-F4` was written to avoid, and fix nothing — the seam is in the *work split*, not the partition. |

**A cheap structural mitigation, recommended alongside A and independent of it:** whenever a single partition cluster is split across sub-tasks for sizing, **one half must be designated the cluster's residual owner** — scoped "everything the cascade assigns to this cluster that the other half does not enumerate." That is the work-split analogue of `D-F4`'s T4 residual and `U2` sink, and it is precisely the property the CL-4 split lacked. **The partition's own design already contains the fix; the work split just never inherited it.** Routed to SUB-11 (NEU-944) as a charter-level lesson.

## 8. Bottom line

- **10 genuine gaps, 1 class, 0 unexplained.** Every instance has a named owner: `INC-C1` (creator) for all ten, gated on `CV-1a` (NEU-932's `D-F4a` owner) for SOS DP alone.
- **No partition change is needed.** Convention U1 already owns every instance; `D-F4` is sound and is not challenged.
- **No mapper erred.** Thirty-one blind cross-cluster hand-offs, every cascade judgment correct. The seam is structural.
- **The map is honest.** Every one of these gaps was *findable* only because five mappers recorded rather than smoothed. The charter's no-smoothing discipline is what produced this finding — it is the discipline paying for itself.
