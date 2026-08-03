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

### 8.1 The counting unit, declared

**§8 counts register entries** — one entry is one row of one mapper's `residual_exclusions` block. **A figure on any other unit does not enter this summation**; the verdict-id figures live in §8.4, separately labelled.

**One independent confirmation of 52, not two.** §1's per-file partition (`11+12+9+7+13 = 52`) is on this unit and **is confirmed** — the ledger in §8.6 reproduces it file by file. §2's `31+7+3+9+2 = 52` reaches the right total but **is not a sound partition of the register**, and this section does not lean on it: its "blocked by file ownership = **2**" counts CL-2's `E-header` block, which §8.3 shows is **not one of the 52**; its "scoped out with rationale = **9**" resolves to **eight** entries in §6; and mainstream `RX-1` and `RX-2` are register entries that appear in **none** of its five classes (§8.7). Those errors happen to cancel. **Correcting §2 is a §§1–7 restructuring this task does not undertake** — it is recorded here so no later reader mistakes §2 for a second independent attestation.

This has to be stated because it is exactly what an earlier revision of this table got wrong. It published `19 + 21 + 10 + 3 + 2` under a stated total of **52**, and those five figures sum to **55**. The gap was never a miscount of exclusions — it was **three different units added together**: two entry counts, two verdict-id counts, and one subtraction across the two. §8.3 walks the correction figure by figure.

### 8.2 The result

| Outcome | Register entries |
| --- | --- |
| **Upheld as intentional exclusions** (IE — rationale verified, materiality checked) | **13** |
| **Resolved to mapped equivalences** (ME — the named owner did map it) | **20** |
| **Genuine gaps with a named owner** (GAP) | **16** |
| **Unresolved uncertainties** (UU) | **3** |
| **Discharged ledger blockages** | **1** |
| **Verdict assignments** | **53** |
| *less* `E3`'s split — one entry carrying two verdicts (§8.5) | **−1** |
| **Total consolidated** | **52** |

The column adds to 53 and the single named adjustment brings it to 52. **The total is read off the ledger in §8.6, not asserted ahead of it.**

### 8.3 How the published 55 became 52 — figure by figure

Each line below is a correction of *unit*, not of any adjudication. Every verdict in §§3–7 stands exactly as recorded.

| Published | Corrected | What was actually being counted, and why it moved |
| --- | --- | --- |
| **19** upheld | **13** | The 19 was §2's `7 + 3 + 9` — entries *classified outside §3*, not entries whose **verdict** is IE. Six of the 19 do not belong, and they are two different kinds of error. **Five carry a non-IE verdict:** `EXC-1`, `E0` and frontier `RX-13` are **UU**; frontier `RX-6` is **ME** (`CV-23`); mainstream `RX-6` is **GAP** (`CV-19`). **The sixth is an over-count inside §2 itself:** its "scoped out with rationale = **9**" resolves to only **eight** entries when §6's rows are counted (§6's first row covers two entries, `EXC-1` / `E0`, and the remaining six rows one each). So the real population is 18, of which 13 are IE. **−6** |
| **21** mapped | **20** | The 21 was `31 − 10` — §3's sibling-claim count minus the *distinct gap verdict ids*. Subtracting a verdict-id count from an entry count yields neither unit. **No single entry "moved" here**, and none can be named: the 21 was never an entry count to begin with, so the `−1` is not a reassignment but the difference between a mixed-unit subtraction and a direct count. Counted as entries off the ledger, the ME verdicts are **20**. **−1** |
| **10** gaps | **16** | The 10 was a count of **distinct `CV-*` ids**, not entries. **Three** gap verdicts are shared across several entries — `CV-1` (SOS DP) excludes **4**, `CV-2` (LIS) **2**, `CV-5` (bitset) **2**, so 3 ids cover **8** entries — and the remaining **eight** gap-carrying entries are one-to-one (`CV-3`, `CV-11`, `CV-12`, `CV-13`, `CV-14`, `CV-15`, `CV-16`, `CV-19`). `8 + 8 = 16`. **+6** |
| **3** unresolved | **3** | Unchanged in size, but not for the reason the old table implied. It listed three *verdict ids* — `CV-1a`, `CV-17`, `CV-18`. On the entry unit `CV-17` covers **two** entries (`EXC-1`, `E0`), `CV-18` covers **one** (frontier `RX-13`), and **`CV-1a` covers none at all** — it is a `D-F4a` ledger question, not a residual exclusion. Two counts that were previously double-counted inside the 19 are removed there, not here. **±0** |
| **2** discharged | **1** | `CV-35` discharges CL-1 `EXC-11`, a register entry. `CV-33` discharges CL-2's **`E-header` AR-1 block**, which sits above `E0`…`E11` as a separate top-level block and is **not one of the 52**. It is still discharged (§7) — it is simply not a member of this register. **−1** |
| **55** | **53** | Verdict assignments. |
| | **52** | Less `E3`'s split (§8.5). |

**The net is derived, not fitted.** Note that the corrections run in both directions — `+6` on gaps against `−6/−1/−1` elsewhere — so `55 − 52 = 3` is a **net** figure that no single adjustment produces. Reading it as "three double-counted entries" is what the old parenthetical invited and is wrong.

### 8.4 The verdict-id unit, kept separate

Counted as **distinct `CV-*` ids** rather than entries, the gap verdicts are: `CV-1`, `CV-2`, `CV-3`, `CV-5`, `CV-11`, `CV-12`, `CV-13`, `CV-14`, `CV-15`, `CV-16` — the `04_work-split-seam.md` class, whose §4 enumerates and numbers **ten** instances and whose §6 and §8 both say "ten genuine gaps" — plus **`CV-19`**, the mainstream `RX-6` intra-cluster *edge* gap, which `04_…` §4 does not list because it is not a node gap.

**One cross-file discrepancy is recorded here rather than smoothed.** `02_disagreement-adjudication.md` §17/§23 tallies **10** GAP verdicts by heading its `CV-11`…`CV-16` section *"the sweep's five further instances · GAP ×5 (six rows, five owners)"* — while that section's own table carries **six** rows and its closing line reads *"Named owner for all **six**"*. `04_…` §4's numbered table and `03_…` §3's row-by-row verification both support **six**. **This audit does not resolve the discrepancy here** — re-deriving verdict identity is outside this consolidation's remit, and the entry-unit total in §8.2 does not depend on it either way. **Routed to SUB-11 (NEU-944)** with `CV-32`'s id-hygiene items. Recorded because a register that silently picked one number would be asserting exactly the kind of unverified tally §8 exists to eliminate.

### 8.5 The one entry that is not one verdict

**CL-2 `E3` — bounded-knapsack accelerations.** `E3` bundles two techniques under one id, and §3 adjudicates them differently: **binary / powers-of-two splitting** is a **GAP** (`CV-3`), while the **monotonic-deque evaluation** is **ME** (`CV-4`) — it is SUB-6's enumerated "monotonic-queue / sliding-window optimization" and is mapped. `04_…` §4 records the reason plainly: this audit splits `E3` *"rather than report a mapped technique as a gap."*

`E3` is therefore **one register entry carrying two verdicts** — the sole such case in the register, and the only reason the verdict-assignment column (53) exceeds the entry total (52). Every other one of the 51 entries resolves to exactly one bucket.

### 8.6 The per-entry ledger — all 52, each to exactly one bucket

Every id is file-qualified (§1's collision note applies). "Adjudicated in" names the section carrying the reasoning.

| # | Entry | Verdict | Bucket | Adjudicated in |
| --- | --- | --- | --- | --- |
| 1 | `cl-1` `EXC-1` | `CV-17` UU | Unresolved | §6 |
| 2 | `cl-1` `EXC-2` | `CV-11` GAP | Gap | §3 |
| 3 | `cl-1` `EXC-3` | `CV-12` GAP | Gap | §3 |
| 4 | `cl-1` `EXC-4` | ME | Mapped | §3 |
| 5 | `cl-1` `EXC-5` | `CV-2` GAP | Gap | §3 |
| 6 | `cl-1` `EXC-6` | `CV-13` GAP | Gap | §3 |
| 7 | `cl-1` `EXC-7` | ME | Mapped | §3 |
| 8 | `cl-1` `EXC-8` | ME | Mapped | §3 |
| 9 | `cl-1` `EXC-9` | ME (`CV-20` alias) | Mapped | §3 |
| 10 | `cl-1` `EXC-10` | IE | Upheld | §6 |
| 11 | `cl-1` `EXC-11` | `CV-35` discharged | Discharged | §7 |
| 12 | `cl-2` `E0` | `CV-17` UU | Unresolved | §6 |
| 13 | `cl-2` `E1` | ME | Mapped | §3 |
| 14 | `cl-2` `E2` | ME | Mapped | §3 |
| 15 | `cl-2` `E3` **(split)** | `CV-3` GAP **and** `CV-4` ME | Gap **+** Mapped | §3, §8.5 |
| 16 | `cl-2` `E4` | `CV-5` GAP | Gap | §3 |
| 17 | `cl-2` `E5` | `CV-14` GAP | Gap | §3 |
| 18 | `cl-2` `E6` | `CV-22` ME | Mapped | §3 |
| 19 | `cl-2` `E7` | ME | Mapped | §3 |
| 20 | `cl-2` `E8` | `CV-1` GAP | Gap | §3 |
| 21 | `cl-2` `E9` | `CV-7` IE | Upheld | §5 |
| 22 | `cl-2` `E10` | ME | Mapped | §3 |
| 23 | `cl-2` `E11` | ME | Mapped | §3 |
| 24 | `cl-3` `E1` | `CV-1` GAP | Gap | §3 |
| 25 | `cl-3` `E2` | `CV-25` ME | Mapped | §3 |
| 26 | `cl-3` `E3` | `CV-27` ME | Mapped | §3 |
| 27 | `cl-3` `E4` | `CV-5` GAP | Gap | §3 |
| 28 | `cl-3` `E5` | `CV-24` ME | Mapped | §3 |
| 29 | `cl-3` `E6` | `CV-15` GAP | Gap | §3 |
| 30 | `cl-3` `E7` | `CV-16` GAP | Gap | §3 |
| 31 | `cl-3` `E8` | IE (anchor route, `CV-33`) | Upheld | §5 *(also rowed §3)* |
| 32 | `cl-3` `E9` | `CV-8` IE | Upheld | §6 |
| 33 | `cl-4/mainstream` `RX-1` | `CV-1` GAP | Gap | §3 *(unrowed — §8.7)* |
| 34 | `cl-4/mainstream` `RX-2` | `CV-2` GAP | Gap | §3 *(unrowed — §8.7)* |
| 35 | `cl-4/mainstream` `RX-3` | ME | Mapped | §3 |
| 36 | `cl-4/mainstream` `RX-4` | ME | Mapped | §3 |
| 37 | `cl-4/mainstream` `RX-5` | IE | Upheld | §6 |
| 38 | `cl-4/mainstream` `RX-6` | `CV-19` GAP | Gap | §6 |
| 39 | `cl-4/mainstream` `RX-7` | IE | Upheld | §6 |
| 40 | `cl-4/frontier` `RX-1` | `CV-6` ME | Mapped | §3 |
| 41 | `cl-4/frontier` `RX-2` | `CV-21` ME | Mapped | §3 |
| 42 | `cl-4/frontier` `RX-3` | `CV-1` GAP | Gap | §3 |
| 43 | `cl-4/frontier` `RX-4` | `CV-22` ME | Mapped | §3 |
| 44 | `cl-4/frontier` `RX-5` | `CV-9` IE | Upheld | §5 |
| 45 | `cl-4/frontier` `RX-6` | `CV-23` ME | Mapped | §6 *(also rowed §3)* |
| 46 | `cl-4/frontier` `RX-7` | `CV-29` IE | Upheld | §4 |
| 47 | `cl-4/frontier` `RX-8` | `CV-29` IE | Upheld | §4 |
| 48 | `cl-4/frontier` `RX-9` | `CV-29` IE | Upheld | §4 |
| 49 | `cl-4/frontier` `RX-10` | `CV-30` IE | Upheld | §4 |
| 50 | `cl-4/frontier` `RX-11` | `CV-10` IE | Upheld | §4 |
| 51 | `cl-4/frontier` `RX-12` | `CV-29` IE | Upheld | §4 |
| 52 | `cl-4/frontier` `RX-13` | `CV-18` UU | Unresolved | §4 |

**Bucket totals read off the ledger:** Upheld **13** (rows 10, 21, 31, 32, 37, 39, 44, 46–51) · Mapped **20** (rows 4, 7, 8, 9, 13, 14, 15b, 18, 19, 22, 23, 25, 26, 28, 35, 36, 40, 41, 43, 45) · Gap **16** (rows 2, 3, 5, 6, 15a, 16, 17, 20, 24, 27, 29, 30, 33, 34, 38, 42) · Unresolved **3** (rows 1, 12, 52) · Discharged **1** (row 11). **13 + 20 + 16 + 3 + 1 = 53 assignments over 52 entries**, the surplus being row 15 alone.

**Not in this register, and why:** CL-2's **`E-header` AR-1 block** (§7, `CV-33`) is a top-level block above `E0`…`E11`, not a member of `residual_exclusions`; and **`CV-1a`** (§8.3) adjudicates a `D-F4a` ledger question, not an exclusion. Both are real adjudications; neither is one of the 52.

### 8.7 Two entries §3's table does not row

Mainstream **`RX-1`** (SOS DP) and mainstream **`RX-2`** (LIS in O(n log n)) are register entries whose verdicts are established in `04_work-split-seam.md` §4 — which names them as excluding `CV-1` and `CV-2` respectively — but which §3's verification table never gives a row of its own. They are **GAP** either way, and rows 33–34 place them explicitly so no entry of the 52 is left unresolved. **This is a presentation gap in §3, not a missing adjudication**; both techniques are fully adjudicated in `02_…` and `04_…`.

---

**Every material residual exclusion carries a documented rationale — verified, not assumed.** This audit read all 52 and found **no exclusion recorded without a rationale**, and **no silently dropped technique**. The mappers' discipline held completely. The defects this audit found are all in the *decomposition*, not in the *map* — **and, as §8.1–8.3 record, one was in this section's own arithmetic.**
