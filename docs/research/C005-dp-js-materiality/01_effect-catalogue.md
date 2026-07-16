# The JavaScript Effect Catalogue

**Task:** NEU-941 (SUB-8) · **`rule_version`: `1.0.0`** · **Compiled:** 2026-07-16

Nine effect classes. Every `javascript_materiality.effects` entry in the map is an id from this
file. Each is a **language-specification or engine-architecture fact**, stated against the C++
competitive default it departs from. **No entry here rests on a benchmark or a problem id**
(`JS-D4`; `CAP-2`).

The NEU-941 spec names four axes — recursion-depth limits, BigInt for large-integer counting DP,
typed arrays for performance-bound tables, and general performance-bound techniques. Those are
`JS-E1`, `JS-E3`, `JS-E5`, and `JS-E6`. The other five are effects the mapped technique set forced
into view and which the spec's "e.g." list does not close off.

---

## `JS-E1` — The call stack is capped, and there is no `ulimit -s`

**The fact.** JavaScript engines cap recursion at a fixed stack size and throw
`RangeError: Maximum call stack size exceeded`. The reachable depth is on the order of **10^4
frames** and varies with frame size, engine, and build — it is not a language constant.

**The C++ default it departs from.** A C++ recursion runs on the process stack (commonly 8 MB by
default), reaching depth on the order of 10^5–10^6 for a small frame; competitive judges routinely
raise it further, and a solver can raise it themselves. **JavaScript exposes no equivalent knob a
solution can rely on** — V8's `--stack-size` is a host flag, not something a submitted program sets.

**Why it is material.** The competitive input sizes DP meets — `n` up to 2·10^5 for a tree, a DAG,
or a linear chain — sit *above* the JavaScript cap and *below* the C++ one. A path-shaped tree is
the standard adversarial case and it is not exotic. So the recursive realization that is the C++
default is not a style choice in JavaScript: **deep top-down DP must be converted to an explicit
stack or an iterative order.**

**Where it does not apply, and this audit says so:** recursion whose depth is `O(log n)` (segment
trees, divide-and-conquer optimization, SMAWK's reduce) is ~20 frames deep and nowhere near the cap.
Digit DP recurses once per digit — at most 19 frames for a 10^18 bound. These are recorded as
explicit neutral verdicts, not as `JS-E1` findings.

## `JS-E2` — `Number` is exact only to 2^53, and there is no 64-bit integer

**The fact.** All JavaScript arithmetic outside `BigInt` is IEEE-754 **binary64**. Integers are
exact only up to `Number.MAX_SAFE_INTEGER` = 2^53 − 1 ≈ 9.01·10^15. Beyond it, arithmetic
**silently rounds**. There is no 64-bit integer type.

**The C++ default it departs from.** `long long` is exact to ~9.22·10^18 — three orders of magnitude
further — and `__int128` extends it again. Both are reached for reflexively in competitive C++.

**Why it is the single highest-impact effect in this map.** Modular multiplication is the load-bearing
case. With the standard `M = 10^9 + 7`, two residues below `M` have a product up to ~10^18. That is
**≈ 111× past 2^53**. So the direct translation of the C++ one-liner:

```js
c = (a * b) % 1000000007;   // silently wrong for most a, b
```

is silently wrong — not by a wraparound that flips a sign and announces itself, but by a **rounding
that returns a plausible, wrong residue**. C++'s `(a * b) % M` in `long long` is exact. A correct
JavaScript modmul requires `BigInt`, or a split multiply that keeps every partial product under
2^53 (decomposing one operand around 2^26 and folding with `Math.imul`).

The same 2^53 ceiling binds the **cross-multiplication comparisons** that decide a convex-hull
"bad" test and a kinetic segment tree's certificate: slopes and intercepts at 10^9 give products at
10^18. C++ uses `long long` or `__int128` there for exactly this reason.

**Note the failure signature differs, not just the threshold.** C++ integer overflow wraps; JS
rounds. A wrapped value is often obviously wrong. A rounded one is often *nearly* right — which is
worse for a learner, and changes the debugging taxonomy (see `JS-E1`/`JS-E2` on the diagnosis nodes).

## `JS-E3` — `BigInt` is the only exact path above 2^53

**The fact.** `BigInt` gives arbitrary-precision integers. It is a **separate type**: it does not mix
with `Number` in arithmetic without an explicit conversion, it cannot index an array, and its
operations are substantially more expensive than native `Number` arithmetic.

**The C++ default it departs from.** A count that fits in 64 bits needs nothing special in C++ —
`unsigned long long` carries it exactly and at full speed. In JavaScript the *same* count needs
`BigInt`, with the cost and the type-discipline that implies.

**Why it is material.** The interesting range is **2^53 to 2^64** — counts that are free in C++ and
require a different type in JavaScript. This is the gap the NEU-941 spec means by "BigInt for
large-integer counting DP". Above 2^64 both languages need a bignum and the effect is *not*
differential, so this audit does not claim it there.

`BigInt` is also the straightforward correct answer to `JS-E2`'s modmul — at a real cost, which is
why the split-multiply alternative exists.

## `JS-E4` — Bitwise operators are 32-bit signed

**The fact.** `&`, `|`, `^`, `~`, `<<`, `>>` coerce both operands to **int32**, operate, and return
int32. `>>>` returns uint32. Consequences that bite:

- `1 << 31` is **−2147483648**, not 2147483648.
- **Shift counts are taken mod 32**: `1 << 32` is `1`, not 2^32. It does not throw. It does not
  saturate. It silently wraps to a completely different mask.
- A mask with bit 31 set is a **negative number**, so it cannot index an array and compares wrongly.
- `>>> 0` is the idiom that reinterprets an int32 as uint32, recovering bit 31 at the cost of
  breaking `<<`/`&` composition afterwards.

So a bitmask built with JavaScript's bitwise operators has **31 safely usable bits**, or 32 with
`>>> 0` discipline throughout.

**The C++ default it departs from.** `unsigned long long` gives **64** bits with no ceremony, and
competitive bitmask code assumes it freely.

**Why it is material.** For the common bitmask DP (`n` ≤ 20, because 2^n memory binds first) the
31-bit ceiling is **not** reached — and this audit says so explicitly on the nodes where that is the
honest answer, rather than inventing a hazard. The ceiling **is** reached where the encoding packs
**multiple bits per position**: plug DP carries 2–4 bits per column, so a width-12 grid needs 24–48
bits and a 4-bits-per-plug encoding **exceeds 31 bits at width 8**. There, the C++ default is
outright infeasible in JavaScript's bitwise operators and the encoding must move to `BigInt` masks,
a base-k digit array, or a string key.

## `JS-E5` — Typed arrays are the performance-bound table; plain arrays are not

**The fact.** A JavaScript `Array` is a polymorphic, boxed, resizable object. Engines optimize
packed-SMI arrays well, but the representation is not guaranteed, is lost on a single out-of-range
or non-SMI write, and carries per-element overhead far above 4 bytes. `Int32Array` / `Float64Array`
/ `Uint8Array` are **contiguous, unboxed, fixed-width** buffers.

**The C++ default it departs from.** `vector<int>` **is** the contiguous unboxed buffer, by default,
with no choice to make. A C++ solver gets `JS-E5`'s payoff for free and never thinks about it.

**Why it is material.** It is a real decision a JavaScript author must make and a C++ author does
not, and it is the largest single lever on DP table performance and on memory. It compounds:

- A 2D table as an array-of-arrays is a pointer chase per row; the JavaScript idiom for a hot table
  is a **flat typed array with manual index arithmetic** (`i * W + j`).
- Memory is where it decides MLE outright: 2^20 boxed numbers cost multiples of the 4 MB an
  `Int32Array(1 << 20)` costs.
- **It changes the uninitialized-cell semantics**, which changes debugging (see `JS-E9`).

## `JS-E6` — The constant-factor envelope

**The fact.** JIT-compiled JavaScript is slower than optimized C++ on the tight numeric loops DP is
made of. It is also **not uniformly** slower: the ratio depends on typed-array use, megamorphic
sites, allocation, and whether the loop stays in optimized code.

**Why this audit records it sparingly.** Per `JS-D1`/`JS-M1`, a uniform effect distinguishes nothing.
`JS-E6` is recorded only (a) together with a specific mitigable idiom, or (b) alone, on a technique
whose *reason to exist* is the constant factor — where a constant-factor penalty attacks the point
of the technique rather than merely taxing it.

**Its magnitude is not quantified here.** Benchmarking and runtime selection are out of scope
(`JS-U2`). Every `"performance"` verdict in this map is **directional**.

## `JS-E7` — Composite-key memoization has no cheap form

**The fact.** JavaScript object and `Map` keys are strings or object identities. There is **no value
type**: a `Map` cannot be keyed on a tuple by value. Memoizing on a composite state therefore means
either a **string key** (`` `${i},${j},${mask}` `` — allocates a string per lookup) or **manual
packing into a single number** — which drops back into `JS-E4`'s 31-bit ceiling and `JS-E2`'s 2^53
ceiling.

**The C++ default it departs from.** `unordered_map<long long, T>` or `map<tuple<...>, T>` is stdlib,
keyed by value, and fast. Packing into a `long long` gives 64 bits with no ceiling anxiety.

**Why it is material.** Sparse and hash-keyed DP — plug DP's live-state map above all — depends on
this operation in its innermost loop, and every JavaScript option for it is materially worse or
materially different from the C++ default.

## `JS-E8` — There is no standard ordered set and no standard priority queue

**The fact.** JavaScript's standard library ships `Array`, `Map`, and `Set`. **`Set` is
insertion-ordered, not sorted.** There is **no** binary heap, no priority queue, no ordered map, no
multiset, and no `lower_bound`. There is also no `deque`: `Array.prototype.shift()` is a front
removal on a structure that is not a deque.

**The C++ default it departs from.** `priority_queue`, `set`, `multiset`, `map`, and `deque` are
stdlib, and competitive C++ reaches for them without a thought. Slope trick in particular is
*written in terms of* `priority_queue`; slope trick on trees is written in terms of mergeable
`multiset`s.

**Why it is material.** Every DP technique whose canonical formulation names one of these containers
requires **hand-rolling it** in JavaScript. That is not a performance footnote — it changes what a
downstream agent writes, how long the exercise is, and what the prerequisites are. It is the largest
*idiom* gap in this map, and it lands hardest on CL-4's frontier.

## `JS-E9` — Out-of-bounds and uninitialized reads have defined, container-dependent values

**The fact.** Reading past the end of a JavaScript `Array`, or reading a hole, yields `undefined` —
which becomes **`NaN`** in arithmetic and then **propagates** through every subsequent operation and
comparison (`NaN < x` is `false`, always). Reading past the end of a **typed** array yields
`undefined` too, but an *uninitialized in-range* typed-array cell is **`0`** — indistinguishable
from a legitimately computed zero.

**The C++ default it departs from.** An out-of-range `vector` read is **undefined behaviour** —
usually garbage, sometimes a crash, never a defined sentinel. A `vector<int>(n)` is zero-initialized,
matching the typed-array case.

**Why it is material.** It changes the **guard idiom** (a JavaScript grid DP can lean on `undefined`/
`NaN` where C++ must pad with sentinels to avoid UB) and, more sharply, it changes the **failure
signature** that the map's debugging nodes teach: in JavaScript, "this DP read a state it had not
computed yet" surfaces as a spreading `NaN` in a plain `Array` and as a **silent, plausible `0`** in
an `Int32Array`. The container choice — `JS-E5` — decides which. That is a JavaScript-specific
differential a C++-derived debugging taxonomy does not contain.

### `JS-E9a` — the `long double` escape hatch does not exist

Filed under `JS-E9` as a sibling fact rather than as a tenth class, because it is the same shape:
a *defined* difference in numeric behaviour rather than a limit.

**JavaScript floating point is not weaker than C++'s.** `Number` **is** binary64, exactly as C++
`double` is. Probability and expectation DP are therefore **JavaScript-neutral on precision**, and
this audit says so explicitly rather than inventing a floating-point hazard — a real risk, since
"JavaScript numbers are imprecise" is folklore that is *false* at this boundary.

The one real difference: **C++ on x86 offers `long double` (80-bit extended)**, which competitive
solutions reach for when an elimination is ill-conditioned or when two near-equal candidates must be
separated. **JavaScript has no wider float.** That is narrow, real, and material exactly twice in
this map — expectation-DP self-loop resolution, and Aliens-trick tie-breaking.
