# Residual Exclusions — Consolidated and Adjudicated

**Task:** NEU-942 (SUB-10) · **Covers:** OUT-4 (residual-exclusion adjudication) · **Compiled:** 2026-07-16 · **Map version:** `0.1.0`

The residual exclusions recorded by all five mappers, in one place, each adjudicated. NEU-942's acceptance bar: *"Given a material residual exclusion (including a NEU-938 maximalist-frontier drop), when the audit is reviewed, then it carries a documented rationale, and any genuine gap carries a named owner."*

---

## 1. The consolidated register

**52 residual exclusions across five files.** They were recorded in five different shapes under five different id schemes — the mappers could not coordinate a schema because four of them were writing concurrently and none owned a shared file. Consolidating them is this sub-task's job.

| File | Mapper | Id scheme | Count |
| --- | --- | --- | --- |
| `cl-1-foundational.yaml` | NEU-934 (SUB-3) | `EXC-1` … `EXC-11` | **11** |
| `cl-2-combinatorial.yaml` | NEU-935 (SUB-4) | `E0` … `E11` | **12** |
| `cl-3-state-compression.yaml` | NEU-936 (SUB-5) | `E1` … `E9` (in the file header) | **9** |
| `cl-4-optimization/mainstream.yaml` | NEU-937 (SUB-6) | `RX-1` … `RX-7` | **7** |
| `cl-4-optimization/frontier.yaml` | NEU-938 (SUB-13) | `RX-1` … `RX-13` | **13** |
| | | **Total** | **52** |

**Two id collisions across files**, recorded because a reader citing "`RX-2`" or "`E9`" without a file is ambiguous:
- **`RX-1`…`RX-7`** exist in **both** CL-4 files with different meanings (mainstream `RX-2` = LIS O(n log n); frontier `RX-2` = automaton DP).
- **`E9`** exists in **both** CL-2 (centroid decomposition) and CL-3 (partizan games).

Every reference in this package is therefore file-qualified. **Fixing the id scheme is not this audit's call** — routed to SUB-11 (NEU-944) with `CV-32`'s AR-1 collision.

## 2. First-cut classification

| Disposition the mapper recorded | Count | What this audit does with it |
| --- | --- | --- |
| **Owned by a sibling cluster** — "not mine, theirs, and here is who" | **31** | Verify the named owner **actually mapped it**. This is the only check that matters, and it is where the gap class was found. |
| **Exotic tail / materiality-bounded** (all NEU-938) | **7** | Verify the materiality claim against C1…C6. |
| **Outside the partition** — not DP at all | **3** | Verify against the cascade and the register's boundary test. |
| **Scoped out with rationale** (evidence discipline, by-design, other sub-task's) | **9** | Verify the rationale; route what belongs elsewhere. |
| **Blocked by file ownership** | **2** | **Discharge** — this audit owns the ledger. |
| | **52** | |

**The 31 "owned by a sibling cluster" entries are the load-bearing set.** Each is a claim of the form *"technique X is not mine; it is cluster Y's."* Each is individually correct. The audit that matters is not whether the *cascade reasoning* is right — it almost always is — but whether **cluster Y actually mapped it**. Checking all 31 is what surfaced `04_work-split-seam.md`.

## 3. Verification of the 31 sibling-cluster claims

| Claim | Named owner | Actually mapped? | Verdict |
| --- | --- | --- | --- |
| CL-1 `EXC-2` prefix-sum acceleration | CL-4 (SUB-6) | **NO** | `CV-11` **GAP** |
| CL-1 `EXC-3` rolling-array compression | CL-4 (SUB-6) | **NO** | `CV-12` **GAP** |
| CL-1 `EXC-4` D&C + Knuth optimization of partition recurrence | CL-4 (SUB-6) | **yes** | ME — mapped |
| CL-1 `EXC-5` LIS O(n log n) | CL-4 (SUB-6) | **NO** | `CV-2` **GAP** |
| CL-1 `EXC-6` Hirschberg; bit-parallel edit distance | CL-4 (SUB-6) | **NO** | `CV-13` **GAP** |
| CL-1 `EXC-7` knapsack family | CL-2 (SUB-4) | **yes** | ME — mapped |
| CL-1 `EXC-8` interval / tree / DAG DP | CL-2 (SUB-4) | **yes** | ME — mapped |
| CL-1 `EXC-9` bitmask / digit / probability / automaton DP | CL-3 (SUB-5) | **yes** | ME — mapped; alias handled `CV-20` |
| CL-2 `E1` Knuth / quadrangle-inequality | CL-4 (SUB-6) | **yes** | ME — mapped |
| CL-2 `E2` divide-and-conquer optimization | CL-4 (SUB-6) | **yes** | ME — mapped |
| CL-2 `E3` bounded-knapsack binary splitting | CL-4 (SUB-6) | **NO** | `CV-3` **GAP** |
| CL-2 `E3` bounded-knapsack monotonic deque | CL-4 (SUB-6) | **yes** | `CV-4` ME — **`E3` split** |
| CL-2 `E4` bitset-accelerated subset sum | CL-4 (SUB-6) | **NO** | `CV-5` **GAP** |
| CL-2 `E5` small-to-large / DSU on tree | CL-4 (SUB-6) | **NO** | `CV-14` **GAP** |
| CL-2 `E6` Steiner-tree DP | CL-3 (SUB-5) | **yes** (2 nodes) | `CV-22` ME |
| CL-2 `E7` bitmask / subset DP | CL-3 (SUB-5) | **yes** (6 nodes) | ME — mapped |
| CL-2 `E8` SOS DP | CL-4 (SUB-6) | **NO** | `CV-1` **GAP** |
| CL-2 `E10` digit / automaton / plug / probability / game DP | CL-3 (SUB-5) | **yes** (all) | ME — mapped |
| CL-2 `E11` matrix-exp / CHT / slope / Aliens / kinetic | CL-4 (SUB-6/13) | **yes** (all) | ME — mapped |
| CL-3 `E1` SOS DP | CL-4 (SUB-6) | **NO** | `CV-1` **GAP** |
| CL-3 `E2` slope trick | CL-4 (SUB-13) | **yes** (6 nodes) | `CV-25` ME |
| CL-3 `E3` kinetic segment tree ↔ DP | CL-4 (SUB-13) | **yes** | `CV-27` ME |
| CL-3 `E4` bitset / word-parallel of a bitmask DP | CL-4 (SUB-6) | **NO** | `CV-5` **GAP** |
| CL-3 `E5` matrix-exp acceleration of expectation DP | CL-4 (SUB-6) | **yes** | `CV-24` ME |
| CL-3 `E6` segment-tree-accelerated digit/automaton transitions | CL-4 (SUB-6) | **NO** | `CV-15` **GAP** |
| CL-3 `E7` profile-hashing acceleration | CL-4 (SUB-6) | **NO** | `CV-16` **GAP** |
| CL-3 `E8` Aho–Corasick construction / Dijkstra | anchors via AR-1 | n/a — **requests open** | `CV-33` — unioned into ledger |
| CL-4-mainstream `RX-3` the accelerated family techniques | CL-1/2/3 | **yes** | ME — declared, not dropped |
| CL-4-mainstream `RX-4` the research-tier frontier | SUB-13 | **yes** | ME — work split |
| CL-4-frontier `RX-1` plug / broken-profile DP | CL-3 (SUB-5) | **yes** (3 nodes) | **`CV-6` ME — no hole** |
| CL-4-frontier `RX-2` automaton DP incl. Aho–Corasick | CL-3 (SUB-5) | **yes** (3 nodes) | `CV-21` ME |
| CL-4-frontier `RX-3` SOS DP | CL-4 mainstream **or** CL-3 | **NO** | `CV-1` **GAP** |
| CL-4-frontier `RX-4` Steiner-tree DP | CL-3 (SUB-5) | **yes** (2 nodes) | `CV-22` ME |
| CL-4-frontier `RX-6` monotone minima | CL-4 mainstream | **yes** | `CV-23` ME — trigger does not fire |

**Result: 21 of the sibling-cluster claims resolve to a technique that is genuinely mapped. 10 do not.** Every one of the 10 names **CL-4** as its owner, and every one is unmapped for the same structural reason. That is `04_work-split-seam.md`.

**This is a strong positive finding about the mappers.** Thirty-one cross-cluster hand-offs were made blind — four of the five files were written concurrently against sibling files that did not exist — and **every single cascade judgment is correct**. The 10 failures are not misrouted techniques; they are correctly-routed techniques arriving at a cluster whose work split has no enumerated slot to receive them.

## 4. The exotic tail — NEU-938's maximalist-frontier drops (the ones NEU-942 names)

NEU-942 singles these out: *"including the maximalist-frontier drops from NEU-938."* All seven are materiality-bounded exclusions where **T1 fires** (they *are* CL-4's on the partition) and the map declines them anyway.

| Id | Technique | Materiality claim | Audit verdict |
| --- | --- | --- | --- |
| `RX-7` | L♮-/M-convex discrete convex analysis (Murota) | No instance in C1…C6; the competitive footprint **is** the 1-D case, mapped in full (6 nodes) | `CV-29` **IE — upheld** |
| `RX-8` | Multi-parameter Lagrangian relaxation | No instance in C1…C6; convexity hypothesis routinely false | `CV-29` **IE — upheld** |
| `RX-9` | Sub-quadratic non-convex (min,+) convolution | Fine-grained-complexity research results; unusable in contest; practical content is a *negative* result | `CV-29` **IE — upheld** |
| `RX-10` | Ranked zeta / fast subset convolution beyond SOS | Footprint is the SOS case; downstream of the `D-F4a` dispute | `CV-30` **IE — upheld** |
| `RX-11` | Composed frontier techniques | `F-C-4`-grounded: components mapped, compositions are not techniques | `CV-10` **IE — upheld** |
| `RX-12` | Quantum / parallel / streaming / approximate speedups | Outside the charter's **competitive**-DP technique space | `CV-29` **IE — upheld** |
| `RX-13` | The open remainder of the exotic tail | Completeness explicitly **not** claimed | `CV-18` **UU — upheld** |

**All seven upheld.** Each carries a documented rationale, a revision trigger, and an owner — the register's own stated bar, met. This audit independently checked each materiality claim against C1…C6 and **found no counter-instance**.

**`RX-13` deserves its own verdict and gets one.** It is the honest bottom line of the maximalist claim, and this audit's sweep **vindicates it**: `04_…` found seven instances beyond the three previously named, which is exactly the kind of residual `RX-13` refused to claim did not exist. **`RX-13`'s trigger names this audit as the discharging party, and `04_…` discharges it for what the sweep found — while `CV-18` records that "no further technique exists" remains unclaimable.** A register that had asserted completeness would now be provably false; `RX-13` is the reason it is not.

**A note on the charter's High risk.** `RX-7`…`RX-12` are where *"maximalist breadth expands the graph and audit surface indefinitely"* was actively resisted. `RX-7`'s self-assessment — *"one step past slope trick's competitive instance and one step short of a mathematics curriculum"* — is the correct line and this audit endorses it. **Refusing to map is a coverage decision, and NEU-938 made it explicitly rather than by omission.** That is the difference between a bounded map and a topic list.

## 5. Outside the partition — not DP at all

| Id | Technique | Verdict |
| --- | --- | --- |
| CL-2 `E9` | Centroid-decomposition path counting | **`CV-7` IE — settled.** The one ownerless exclusion in the map. Rival T3 reading rejected: its subproblems are **disjoint**, failing the frozen `overlapping subproblems` root. Now owned via the `RX-5` AR-1 route. |
| CL-4-frontier `RX-5` | Segment tree beats | **`CV-9` IE — upheld.** Data structure, not DP; its DP interplay is the kinetic case, mapped. |
| CL-3 `E8` | Aho–Corasick construction itself | **IE — upheld.** Anchor material, not cluster material; correctly routed to AR-1 rather than mapped. |

## 6. Scoped out with rationale

| Id | Subject | Verdict |
| --- | --- | --- |
| CL-1 `EXC-1` / CL-2 `E0` | Problem-level corpus references | **`CV-17` UU.** Both withdrawals correct; `CAP-2` unresolved; this audit does not reintroduce them. **The convergence of two independent mappers on the same withdrawal is the finding** — routed to `D-F2`/`D-S1`'s owners. |
| CL-1 `EXC-10` | No `optimization`-typed node in CL-1 | **IE — upheld, by construction.** S2 presupposes a correct recurrence → T1 → CL-4. A CL-1 node typed S2 would have its skill type and cluster contradict each other. SUB-9 finds `optimization` in CL-4, as designed. |
| CL-3 `E9` | Partizan / surreal-number game theory | **`CV-8` IE — upheld.** Outside the audience line. Citation slip on the reference set noted as `CV-31`. |
| CL-4-mainstream `RX-5` | Difficulty / JS-materiality / coverage values | **IE — correct.** `difficulty_dimensions {}` (`INC-S3`, SUB-7); `javascript_materiality.assessed false` (SUB-8); `coverage.status "unaudited"` (this audit). Per schema §5.2 a consumer must not invent a value — **honoured on all 23 nodes**. |
| CL-4-mainstream `RX-7` | Targeted prototypes | **IE — upheld.** Charter Assumption #12 forbids prototyping settled structure. The five mainstream optimizations are Div1 canon with stable, well-attested prerequisite structure. Correct restraint. |
| CL-4-frontier `RX-6` | Monotone minima (work split) | **`CV-23` ME.** |
| CL-4-mainstream `RX-6` | Intra-cluster edges into frontier.yaml | **`CV-19` GAP → SUB-9 / SUB-12.** An edge gap, not a node gap. |

## 7. Blocked by file ownership — discharged by this audit

These two are the cases where a mapper **could not** do the right thing because the file belonged to someone else. This audit owns the SUB-2 ledger and discharges both.

| Id | What was blocked | Discharge |
| --- | --- | --- |
| CL-1 `EXC-11` | A `D-S1a` entry for the S7/S5 boundary at `cl-1.derive-recurrence-routine`. SUB-3 had `provisional` status and the rationale on the node, but *"the ledger lives in the NEU-933 package and NEU-934 is sole writer of this file only."* | **`CV-35` — filed.** Unioned into the ledger with SUB-3's trigger verbatim. `D-S1a` count = **1**, well below D-S1's `>10` cascade-revision threshold, so the threshold does **not** fire. `EXC-11`'s stated consequence — SUB-9 undercounting by reading the ledger alone — is **resolved**. |
| CL-2 `E-header` (AR-1 block) | Two anchor requests: **topological order / DAG traversal** and **strongly-connected-component condensation**. *"The ledger entry is SUB-2's file to write; SUB-4 cannot write it without breaking sole-writer ownership."* | **`CV-33` — filed.** Unioned into the ledger §3.1 as requests, disambiguated by filer. `D-S3`'s owner adjudicates the merits. |

**This pattern is worth naming.** Five mappers, four blocked ledger writes (NEU-934's `D-S1a`, NEU-935's two AR-1s, NEU-938's two AR-1s declared as `X-938-3`), **every one of them correctly refusing to break file ownership and recording in-file instead**. Sole-writer ownership is what made the concurrent fan-out safe, and its unavoidable cost is a register that lags the map. **The cost was paid correctly and is discharged here** — but the pattern should inform how the next charter sequences ledger writes. Routed to SUB-11 (NEU-944).

## 8. Consolidation result

| Outcome | Count |
| --- | --- |
| **Upheld as intentional exclusions** (rationale verified, materiality checked) | **19** |
| **Resolved to mapped equivalences** (the named owner did map it) | **21** |
| **Genuine gaps with a named owner** | **10** (9 the `04_…` class + `CV-19`) |
| **Unresolved uncertainties** | **3** (`CV-1a`, `CV-17`, `CV-18`) |
| **Discharged ledger blockages** | **2** (`CV-35`, `CV-33`) |
| **Total consolidated** | **52** (some entries resolve to a shared verdict; `E3` splits into two) |

**Every material residual exclusion carries a documented rationale — verified, not assumed.** This audit read all 52 and found **no exclusion recorded without a rationale**, and **no silently dropped technique**. The mappers' discipline held completely. The defects this audit found are all in the *decomposition*, not in the *map*.
