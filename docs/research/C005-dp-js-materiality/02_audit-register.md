# The JavaScript-Materiality Audit Register

**Task:** NEU-941 (SUB-8) · **`rule_version`: `1.0.0`** · **Map version audited:** `0.1.0` · **Compiled:** 2026-07-16

**179 of 179 mapped technique nodes assessed.** No mapped node is left unassessed; the 8 frozen
roots (`DR-S02`) are out of scope (`JS-U1`). This file is a **navigation index** — the authoritative
verdict, with its rationale, lives on each node in `javascript_materiality`.

---

## 1. Headline

| | Count |
| --- | ---: |
| Nodes assessed | **179** |
| Carry a **material** JavaScript effect | **47** (26%) |
| Explicitly marked **JavaScript-neutral** | **132** (74%) |
| Frozen roots (out of scope) | 8 |
| Mapper observations preserved as `mapper_note` | 34 |
| Mapper observations that **overturned** this audit's first verdict | **4** |

**Severity of the 47:**

| Severity | Count | Meaning |
| --- | ---: | --- |
| `blocking` | **19** | The direct C++ translation is **silently wrong or crashes**. |
| `idiom-shift` | 11 | Feasible and correct, but the JavaScript artifact **differs materially**. |
| `performance` | 11 | Correct; the constant factor decides, and a specific idiom recovers it. |
| `correctness-risk` | 6 | Correct at usual sizes; a **reachable** range breaks it silently. |

**Effect frequency** (a node may carry several):

| Effect | Nodes | |
| --- | ---: | --- |
| `JS-E5` typed arrays | 18 | The most widespread — but never recorded alone. |
| `JS-E2` 2^53 / no int64 | **15** | **The most damaging.** 9 of the 19 blocking verdicts. |
| `JS-E6` constant factor | 12 | Never alone except `cl-4.larsch-online-smawk-implementation` (`JS-D1`). |
| `JS-E1` recursion cap | 10 | 7 blocking. Concentrated in CL-2's tree/DAG work. |
| `JS-E9` OOB / no `long double` | 8 | Mostly debugging nodes — the failure *signature* differs. |
| `JS-E3` BigInt | 8 | Always alongside `JS-E2` or `JS-E4` — it is the remedy, not the hazard. |
| `JS-E4` 32-bit bitwise | 6 | Blocking only where the encoding packs multiple bits per position. |
| `JS-E8` no heap/ordered set | 5 | The widest *idiom* gap; lands on CL-4's frontier. |
| `JS-E7` composite keys | 1 | Only plug DP's live-state map genuinely depends on it. |

**By cluster** — materiality concentrates where the charter predicted, on
implementation/optimization/procedural/debugging nodes:

| Cluster | Material | Neutral | Note |
| --- | ---: | ---: | --- |
| CL-1 foundational | 8 | 38 | Neutral-heavy: mostly formulation and proof. |
| CL-2 combinatorial | 12 | 49 | **Every `JS-E1` blocking verdict but one.** Tree and DAG work. |
| CL-3 state-compression | **11 / 31** | 20 | **Densest cluster (35%)** — bitmask, digit, plug DP. |
| CL-4 mainstream | 8 | 15 | `JS-E2` on every envelope and matrix technique. |
| CL-4 frontier | 8 | 10 | **Densest by ratio (44%)** — `JS-E8`'s container gap. |

## 2. The material 47

| Node | Cluster | Type | Effects | Severity |
| --- | --- | --- | --- | --- |
| `cl-1.dp-failure-modes` | CL-1 | knowledge | `JS-E1`, `JS-E2`, `JS-E9` | **idiom-shift** |
| `cl-1.diagnose-wrong-state-transition-base-case` | CL-1 | debugging | `JS-E2`, `JS-E9` | **idiom-shift** |
| `cl-1.formulate-1d-sequence-dp` | CL-1 | strategic | `JS-E1` | **blocking** |
| `cl-1.order-2d-table-evaluation` | CL-1 | implementation | `JS-E5`, `JS-E6` | **performance** |
| `cl-1.build-prefix-aggregate` | CL-1 | procedural | `JS-E2` | **correctness-risk** |
| `cl-1.handle-grid-boundaries-and-obstacles` | CL-1 | implementation | `JS-E9`, `JS-E5` | **idiom-shift** |
| `cl-1.counting-dp-over-linear-domain` | CL-1 | knowledge | `JS-E2`, `JS-E3` | **blocking** |
| `cl-1.diagnose-empty-subarray-and-all-negative-boundary` | CL-1 | debugging | `JS-E9` | **idiom-shift** |
| `cl-2.pseudo-polynomial-complexity` | CL-2 | knowledge | `JS-E5`, `JS-E6` | **performance** |
| `cl-2.implement-knapsack-in-place-capacity-loop` | CL-2 | implementation | `JS-E5`, `JS-E6` | **performance** |
| `cl-2.implement-counting-dp-under-a-modulus` | CL-2 | implementation | `JS-E2`, `JS-E3` | **blocking** |
| `cl-2.implement-interval-dp-length-loop` | CL-2 | implementation | `JS-E5`, `JS-E6` | **performance** |
| `cl-2.debug-interval-order-violation` | CL-2 | debugging | `JS-E9`, `JS-E5` | **idiom-shift** |
| `cl-2.root-an-unrooted-tree` | CL-2 | procedural | `JS-E1` | **blocking** |
| `cl-2.implement-tree-dp-post-order-dfs` | CL-2 | implementation | `JS-E1` | **blocking** |
| `cl-2.debug-tree-dp-recursion-depth` | CL-2 | debugging | `JS-E1` | **blocking** |
| `cl-2.implement-rerooting-two-pass-dfs` | CL-2 | implementation | `JS-E1` | **blocking** |
| `cl-2.impose-topological-evaluation-order` | CL-2 | procedural | `JS-E1` | **blocking** |
| `cl-2.condense-sccs-to-recover-a-dag` | CL-2 | strategic | `JS-E1` | **blocking** |
| `cl-2.debug-cyclic-state-dependency` | CL-2 | debugging | `JS-E1` | **idiom-shift** |
| `cl-3.bitmask-state-encoding` | CL-3 | knowledge | `JS-E4` | **correctness-risk** |
| `cl-3.submask-enumeration` | CL-3 | procedural | `JS-E4`, `JS-E6` | **correctness-risk** |
| `cl-3.implement-bitmask-dp` | CL-3 | implementation | `JS-E4`, `JS-E5`, `JS-E6` | **performance** |
| `cl-3.diagnose-bitmask-state-blowup` | CL-3 | debugging | `JS-E5`, `JS-E6` | **performance** |
| `cl-3.implement-digit-dp` | CL-3 | implementation | `JS-E2`, `JS-E3` | **blocking** |
| `cl-3.resolve-expectation-dp-self-loops` | CL-3 | implementation | `JS-E2`, `JS-E3`, `JS-E9` | **blocking** |
| `cl-3.broken-profile-state-encoding` | CL-3 | knowledge | `JS-E4` | **correctness-risk** |
| `cl-3.plug-dp-connectivity-encoding` | CL-3 | knowledge | `JS-E4`, `JS-E3` | **blocking** |
| `cl-3.implement-plug-dp` | CL-3 | implementation | `JS-E4`, `JS-E7`, `JS-E3` | **blocking** |
| `cl-3.implement-aho-corasick-dp` | CL-3 | implementation | `JS-E5`, `JS-E6` | **performance** |
| `cl-3.implement-steiner-tree-dp` | CL-3 | implementation | `JS-E8`, `JS-E5` | **idiom-shift** |
| `cl-4.convex-hull-trick-monotonic` | CL-4 m | optimization | `JS-E2` | **blocking** |
| `cl-4.li-chao-tree-dp-application` | CL-4 m | optimization | `JS-E2` | **blocking** |
| `cl-4.implement-cht-deque-and-li-chao` | CL-4 m | implementation | `JS-E2`, `JS-E8`, `JS-E5` | **blocking** |
| `cl-4.implement-divide-and-conquer-optimization` | CL-4 m | implementation | `JS-E5`, `JS-E6` | **performance** |
| `cl-4.knuth-yao-optimization` | CL-4 m | optimization | `JS-E5`, `JS-E6` | **performance** |
| `cl-4.monotonic-deque-maintenance` | CL-4 m | procedural | `JS-E8`, `JS-E5` | **idiom-shift** |
| `cl-4.matrix-exponentiation-dp` | CL-4 m | optimization | `JS-E2`, `JS-E3` | **blocking** |
| `cl-4.implement-modular-matrix-power` | CL-4 m | procedural | `JS-E2`, `JS-E3`, `JS-E5` | **blocking** |
| `cl-4.slope-trick-heap-implementation` | CL-4 f | implementation | `JS-E8`, `JS-E2` | **idiom-shift** |
| `cl-4.slope-trick-on-trees` | CL-4 f | optimization | `JS-E8`, `JS-E1` | **idiom-shift** |
| `cl-4.aliens-trick-application` | CL-4 f | optimization | `JS-E2` | **correctness-risk** |
| `cl-4.aliens-trick-tie-breaking-implementation` | CL-4 f | implementation | `JS-E9` | **correctness-risk** |
| `cl-4.debug-aliens-trick-failure` | CL-4 f | debugging | `JS-E9` | **idiom-shift** |
| `cl-4.kinetic-segment-tree-implementation` | CL-4 f | implementation | `JS-E2`, `JS-E5` | **blocking** |
| `cl-4.smawk-application` | CL-4 f | optimization | `JS-E5`, `JS-E6` | **performance** |
| `cl-4.larsch-online-smawk-implementation` | CL-4 f | implementation | `JS-E6`, `JS-E5` | **performance** |

## 3. The findings that change feasibility

The 19 `blocking` verdicts reduce to **four** underlying facts. Each is a place where the map, left
alone, would have asserted C++ feasibility.

### 3.1 `JS-E2` — modular multiplication is silently wrong (9 blocking nodes)

**The most damaging finding in the audit**, because it is invisible: `(a * b) % (1e9+7)` is the most
reflexively written line in competitive DP, it is exact in C++ `long long`, and in JavaScript it
**silently rounds** — no throw, no wraparound, no `NaN`. A plausible, wrong residue. Products of
two residues below 1e9+7 reach ~1e18, **~111× past 2^53**.

`cl-1.counting-dp-over-linear-domain` · `cl-2.implement-counting-dp-under-a-modulus` ·
`cl-4.matrix-exponentiation-dp` · `cl-4.implement-modular-matrix-power` ·
`cl-3.resolve-expectation-dp-self-loops`

The same 2^53 ceiling breaks **cross-multiplication comparisons** — chosen by C++ authors
*precisely to avoid floating point*, and in JavaScript landing back in it:
`cl-4.convex-hull-trick-monotonic` · `cl-4.li-chao-tree-dp-application` ·
`cl-4.implement-cht-deque-and-li-chao` · `cl-4.kinetic-segment-tree-implementation`

And it breaks digit DP **at the input boundary**, before the DP starts: a 1e18 bound cannot be read
into a `Number` at all (`cl-3.implement-digit-dp`).

### 3.2 `JS-E1` — the recursion cap is an order of magnitude below the input sizes (7 blocking nodes)

JavaScript throws at ~10^4 frames with **no raisable limit**; C++ absorbs 10^5–10^6 and judges raise
it further. Competitive tree/DAG sizes (n = 2·10^5) sit **between** the two, and a path-shaped tree
is the *standard adversarial input*.

`cl-2.implement-tree-dp-post-order-dfs` · `cl-2.debug-tree-dp-recursion-depth` ·
`cl-2.root-an-unrooted-tree` · `cl-2.implement-rerooting-two-pass-dfs` ·
`cl-2.impose-topological-evaluation-order` · `cl-2.condense-sccs-to-recover-a-dag` ·
`cl-1.formulate-1d-sequence-dp`

Two consequences beyond "rewrite it iteratively":
- **It changes which algorithm is chosen.** Recursive-DFS vs Kahn's topological sort is *stylistic*
  in C++ and a **feasibility choice** in JavaScript (`cl-2.impose-topological-evaluation-order`).
- **It makes one diagnosis ambiguous.** A cyclic memoized DP and a correct-but-deep one throw the
  *same error at the same threshold* (`cl-2.debug-cyclic-state-dependency`) — C++'s far-deeper
  segfault nearly identifies the cause by itself.

### 3.3 `JS-E4` — 32-bit bitwise breaks multi-bit-per-position encodings (2 blocking nodes)

The ordinary bitmask DP is **fine** (n ≤ 20 ≪ 31) and the audit says so rather than inventing a
hazard. It breaks where the encoding packs **2–4 bits per column**: plug DP at width 8+ needs 33–52
bits against JavaScript's 31, so the bitwise operators **cannot hold the mask at all** — the high
bits are gone before the shift happens. C++'s `unsigned long long` carries it without comment.

`cl-3.plug-dp-connectivity-encoding` · `cl-3.implement-plug-dp`

### 3.4 `JS-E8` — the missing containers (idiom, not blocking)

`priority_queue`, `set`, `multiset`, `deque` are C++ stdlib and JavaScript ships **none** of them
(`Set` is insertion-ordered, not sorted). Slope trick is *defined in terms of* two heaps; slope
trick on trees needs a **mergeable** heap or an ordered multiset — the widest gap in the map.

`cl-4.slope-trick-heap-implementation` · `cl-4.slope-trick-on-trees` ·
`cl-4.monotonic-deque-maintenance` · `cl-4.implement-cht-deque-and-li-chao` ·
`cl-3.implement-steiner-tree-dp`

### 3.5 Typed arrays and performance (11 nodes)

`JS-E5` is the most widespread effect but **never blocking**: C++'s `vector<int>` *is* the
contiguous unboxed buffer, so the JavaScript author must **decide** what the C++ author gets free.
It decides MLE outright on bitmask DP, and it interacts with sentinels
(`-Infinity` cannot live in an `Int32Array`) and with debugging (`JS-E9`: an uninitialized typed
cell is a **silent 0**, a plain-`Array` hole is a **spreading NaN**).

All 11 are **directional, not quantified** (`JS-U2`).

## 4. Where the mappers overturned this audit

Four verdicts were **reversed or materially rewritten** on mapper evidence carried in
`javascript_materiality.note`. All 34 notes are preserved as `mapper_note`; they are the evidence
these verdicts answer, not decoration. **This is the audit's most important quality signal: its
first reading was wrong four times, and the map itself caught it.**

| Node | Audit's first verdict | Mapper's evidence | Final |
| --- | --- | --- | --- |
| `cl-3.resolve-expectation-dp-self-loops` | material / `JS-E9` (no `long double`), correctness-risk | NEU-936: competitive expectation problems demand a **modular rational** (`p·q⁻¹ mod 998244353`) — the elimination runs over a **finite field, not floats** | **blocking**, `JS-E2`+`JS-E3`+`JS-E9`. The mapper identified the *dominant* path; the audit had recorded only the rare one. |
| `cl-1.formulate-1d-sequence-dp` | neutral — "formulation is pre-code" | NEU-934: a 1D DP at n = 1e5–1e6 is the **first place** the recursion ceiling bites, since top-down recurses once per index | **blocking**, `JS-E1`. Neutral would have stranded the map's highest-frequency hazard behind a frozen root (`JS-U1`). |
| `cl-2.condense-sccs-to-recover-a-dag` | neutral — SCC is an anchor, `DR-S03` bars decomposing it | NEU-935: the act **commits the learner** to Tarjan/Kosaraju, both recursive | **blocking**, `JS-E1`. Anchor caveat preserved (`JS-U4`); the verdict sits on the DP-side act, not the anchor. |
| `cl-4.aliens-trick-application` | neutral — "penalized values ~2e14, comfortably inside 2^53" | NEU-938: the penalised objective **routinely exceeds** `MAX_SAFE_INTEGER` | **correctness-risk**, `JS-E2`. The audit could not stand behind its own bound — both factors are problem-scaled, not capped. |

Three further verdicts were **enriched** by mapper evidence without reversing:
`cl-3.implement-bitmask-dp` (**no native popcount** — C++ has `__builtin_popcount`);
`cl-2.implement-knapsack-in-place-capacity-loop` (**the sentinel constrains the container** —
`-Infinity` coerces to `0` in an `Int32Array`); `cl-4.slope-trick-heap-implementation` (the **lazy
accumulator** can exceed `MAX_SAFE_INTEGER`); `cl-4.smawk-application` (reversed to material — the
matrix is implicit but the **column-index arrays are real**).

## 5. Notable non-claims

Under-claiming and over-claiming both fail. These are places the audit **declined** to record an
effect, deliberately and with the check stated on the node — a reviewer can see the boundary was
examined rather than skipped.

| Node(s) | The claim not made |
| --- | --- |
| `cl-3.probability-vs-expectation-dp-semantics` | **"JavaScript numbers are imprecise" is folklore, and false here.** `Number` **is** binary64 — bit-identical to C++ `double`. Probability/expectation DP is neutral *on precision*. This is the invented claim a reviewer would most expect to find. |
| `cl-4.divide-and-conquer-optimization`, `cl-4.smawk-application`, `cl-4.kinetic-segment-tree-implementation`, `cl-3.implement-digit-dp` | **`JS-E1` does not follow from "it recurses".** The cap binds on *depth*: `O(log n)` ≈ 20 frames, and digit DP ≈ 19. Nowhere near 10^4. |
| `cl-3.compute-grundy-values` | Grundy XOR is a 32-bit signed op — *checked*, and exact: Grundy values sit far below 2^31. |
| `cl-3.steiner-tree-dp-state-encoding` | One bit per terminal, k ≈ 10–12 ≪ 31. Unlike plug DP, the ceiling is not approached. |
| `cl-1.max-product-subarray-two-value-state` | Products exceed 2^53 fast — **but they exceed C++'s `long long` just as fast**. Not *differential*, so not material. |
| `cl-4.select-mainstream-optimization` | The selection is driven by transition *structure*; the JavaScript tax applies to the realization of whichever technique structure already chose. |
| `JS-E6` on 167 nodes | `JS-D1`: a uniform effect distinguishes nothing. Recorded alone only on `cl-4.larsch-online-smawk-implementation`. |

## 6. Reading a verdict

```yaml
    javascript_materiality:
      assessed: true            # OUT-5 reached a verdict. True on all 179.
      rule_version: "1.0.0"     # 01_effect-catalogue.md version.
      material: true            # false IS the explicit "JavaScript-neutral" marking.
      effects: ["JS-E2"]        # ids from 01_effect-catalogue.md. Empty iff material: false.
      severity: "blocking"      # present iff material: true.
      rationale: >-             # required on BOTH verdicts (JS-D3).
        ...
      uncertainty: "JS-U2"      # optional; see 03_caps-and-uncertainties.md.
      mapper_note: >-           # PRESERVED VERBATIM from the mapper. Evidence, not decoration.
        ...
```

- **Method and the materiality rule:** `00_method-and-scope.md`
- **The nine effects:** `01_effect-catalogue.md`
- **What was not settled:** `03_caps-and-uncertainties.md`
