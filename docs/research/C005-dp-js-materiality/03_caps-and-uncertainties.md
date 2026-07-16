# Caps, Uncertainties, and What This Audit Did Not Settle

**Task:** NEU-941 (SUB-8) · **Compiled:** 2026-07-16

Five uncertainties. Each is recorded rather than smoothed, and each names where it goes.
**None of them is resolved by asserting something this audit cannot establish.**

---

## `JS-U1` — The map's most common recursion hazard has no unfrozen home

**What.** The node that owns the top-down-versus-bottom-up realization choice is
`cl-1.root.implement-memoization-and-tabulation`. It is a **frozen root** (`DR-S02`), and NEU-941
may not write it. It already carries a NEU-933 mapper observation foreseeing exactly this audit's
recursion-depth finding and explicitly inviting the verdict — a verdict that **cannot be written
onto a frozen node**.

**Why it matters.** Deep top-down memoization is the *single most common* place JavaScript's
recursion cap bites, and the node that is *about* top-down realization cannot record it.

**What this audit did instead.** Recorded the effect on the nearest unfrozen nodes that a downstream
agent actually reaches — `cl-1.formulate-1d-sequence-dp` (blocking, on NEU-934's evidence),
`cl-2.implement-tree-dp-post-order-dfs`, `cl-2.root-an-unrooted-tree`,
`cl-2.implement-rerooting-two-pass-dfs`, `cl-2.impose-topological-evaluation-order`. This is a
deliberate placement decision, not a filing convenience: leaving `cl-1.formulate-1d-sequence-dp`
neutral because "formulation is pre-code" would have stranded the map's highest-frequency
recursion hazard behind a frozen node — a silent C++ assumption of exactly the kind the second
acceptance scenario forbids.

**Owner.** The root's `frozen: true` is `DR-S02`'s. Unfreezing it to carry an OUT-5 verdict is a
**schema-ledger decision (`D-S2`), not this audit's**. Routed there; not smoothed.

## `JS-U2` — Every performance verdict is directional, never quantified

**What.** NEU-941's spec puts *implementing or benchmarking actual JavaScript solutions* and
*selecting a runtime or execution sandbox* **out of scope**. So no verdict carrying
`severity: "performance"` — and no `JS-E6` claim anywhere — rests on a measurement.

**What this means for a reader.** Every performance verdict says **that** an effect exists and
**which direction** it runs. **None says how much.** A reader who needs a threshold
("what nW does a JavaScript knapsack clear?", "is LARSCH worth it in JavaScript?") will not find it
here and **must not infer one** from these verdicts.

**Nodes carrying it:** `cl-1.order-2d-table-evaluation`, `cl-2.pseudo-polynomial-complexity`,
`cl-2.implement-knapsack-in-place-capacity-loop`, `cl-2.implement-interval-dp-length-loop`,
`cl-3.submask-enumeration`, `cl-3.implement-bitmask-dp`, `cl-3.diagnose-bitmask-state-blowup`,
`cl-3.implement-aho-corasick-dp`, `cl-4.implement-divide-and-conquer-optimization`,
`cl-4.knuth-yao-optimization`, `cl-4.implement-modular-matrix-power` (performance component only —
its correctness component is **not** directional), `cl-4.aliens-trick-application`,
`cl-4.smawk-application`, `cl-4.larsch-online-smawk-implementation`.

**The sharpest instance.** `cl-4.larsch-online-smawk-implementation` records that JavaScript's
constant-factor penalty lands precisely on LARSCH's only advantage, and **explicitly declines to
conclude** that LARSCH is not worth using in JavaScript. That conclusion is a quantitative question
about a real runtime on a real workload.

**Owner.** The later curriculum-production charter that owns benchmarking and runtime selection.

## `JS-U3` — Two of the ten adjudicated coverage gaps are where JavaScript materiality would have been highest

**What.** NEU-942 adjudicated 10 genuine coverage gaps (`INC-C1`) with named owners. Those nodes
**do not exist**, and this audit did not invent them. But two of them are, by this audit's own
effect catalogue, places where JavaScript materiality would have been **unusually high** — which is
worth recording precisely *because* the audit could not act on it:

| Unmapped technique | The JavaScript effect that has nowhere to be recorded |
| --- | --- |
| **Bitset / word-parallel DP** (subset-sum, LCS) | The sharpest `JS-E8`+`JS-E4` case in the whole domain. C++'s `std::bitset` is stdlib; JavaScript has **no equivalent at all** and must hand-roll word-parallelism over a `Uint32Array`, in 32-bit words rather than C++'s 64-bit ones — *halving the parallelism the technique exists for*. |
| **LIS in O(n log n)** | Needs `lower_bound` over a sorted tail array. C++ has `std::lower_bound`; JavaScript has **no ordered container and no binary-search primitive** (`JS-E8`). |

Two further gaps (**SOS DP**, **bounded-knapsack binary splitting**) are bitwise-shaped and would
likely have drawn `JS-E4`; the audit does not assert that, having no node to examine.

**What this audit did.** Recorded the observation as a *deliberate non-claim* in the
`javascript_materiality.rationale` of the nearest existing nodes
(`cl-1.longest-increasing-subsequence-quadratic`, `cl-1.lcs-dp`, `cl-2.subset-sum-feasibility`,
`cl-2.bounded-knapsack-multiplicity`), each pointing here. **No node was invented.**

**Owner.** `INC-C1`'s named owners (NEU-942's adjudication; creator). When those nodes are mapped,
they need an OUT-5 pass — this audit's `rule_version: "1.0.0"` catalogue is reusable for it.

## `JS-U4` — Boundary anchors are outside this audit, and some of them plainly inherit `JS-E1`

**What.** `DR-S03` forbids decomposing a boundary anchor's internals; an anchor is a **sanctioned
terminal**. Several anchors have JavaScript realizations that visibly inherit this audit's effects —
SCC condensation (Tarjan/Kosaraju are recursive DFS), Aho–Corasick construction, shortest-path
relaxation — but auditing them means decomposing them, which this audit may not do.

**What this audit did.** Recorded the verdict on the **DP-side act that depends on the anchor**,
where one exists and where the dependency is load-bearing —
`cl-2.condense-sccs-to-recover-a-dag` is marked **material/blocking** on `JS-E1` (on NEU-935's
evidence) because the strategic act *commits the learner to running an SCC algorithm* whose C++
default does not run in JavaScript at 2·10^5 vertices. That is the feasibility of the step the node
prescribes, not an internal of the anchor. The **anchor-side question remains open**.

Several affected nodes are additionally `provisional` pending **AR-1** anchor requests
(Aho–Corasick, shortest-path relaxation, Lagrangian duality, min-plus convolution, topological
order, SCC). A verdict on a provisional node is provisional in the same way.

**Owner.** The boundary-register owner (`D-S3` / AR-1 route). Not smoothed.

## `JS-U5` — LARSCH's recursion depth is not established

**What.** NEU-938's mapper observation on `cl-4.larsch-online-smawk-implementation` describes the
online interleaving as a **deep recursion**. Offline SMAWK's `REDUCE` halves cleanly, giving
`O(log n)` — which this audit *does* assert, on `cl-4.smawk-application`. **LARSCH's online
recursion is not that clean**, and this audit **cannot establish its depth bound from language
semantics alone**: it is a property of the algorithm's interleaving, and settling it would mean
implementing it (out of scope, `JS-U2`).

**What this audit did.** Recorded **neither** a `JS-E1` claim **nor** a `JS-E1` non-claim on that
node. The `effects` list carries `JS-E6` and `JS-E5`, and the rationale states the depth question
as open. This is the one place the audit declines to answer a recursion-depth question it answered
everywhere else — deliberately, because the honest answer is "not established".

**Owner.** The curriculum-production charter that implements it.

---

## Caps inherited, and how they were honoured

| Cap | How this audit honoured it |
| --- | --- |
| **`CAP-2`** — Codeforces 403'd; problem-level corpus ids are **unverified**. Two prior shippers invented problem-level citations from memory and had to withdraw them. | **This audit cites no problem id and no benchmark number, anywhere.** Every threshold it names (2^53, 2^31, 2^64, ~10^4 frames, 10^9+7, 998244353) is a **language-specification or engine-architecture fact**, checkable against ECMA-262 or a V8 build — not a measurement and not a recollection. `coverage.corpus_refs` was not touched. |
| **Benchmarking / runtime selection out of scope** | `JS-U2`. Every performance verdict is directional. No runtime named, no sandbox chosen. |
| **`INC-C1`** — 10 adjudicated coverage gaps, owned elsewhere | `JS-U3`. No node invented. Recorded as non-claims on adjacent nodes. |
| **`DR-S02`** — 8 frozen roots | Untouched, mechanically enforced by the splice and asserted by the validator. `JS-U1`. |
| **`DR-S03`** — anchors are terminals | `JS-U4`. |
| **NEU-887 materiality rule** | Applied literally, in both directions (`JS-D5`), with `JS-D1` guarding against the dilution that would satisfy its letter and destroy its point. |

## What this audit changed, and what it did not

**Wrote:** `javascript_materiality` on **179** nodes, and nothing else.

**Did not touch:** `difficulty_dimensions` (NEU-940's, landed on all 179 and verified intact after
the splice), the **8 frozen roots**, `edges/cross-cluster.yaml`, `manifest.yaml`,
`boundary-register.yaml`, `index/00_technique-index.md`, `coverage`, `status`, or any mapper's
prose. **34 mapper observations were preserved verbatim** as `javascript_materiality.mapper_note` —
they are the evidence these verdicts answer, and four of them **overturned** this audit's first
reading (see `02_audit-register.md` §4).
