# The Coverage Matrix — Mapped Graph vs. the Selected References

**Task:** NEU-942 (SUB-10) · **Compiled:** 2026-07-16 · **Map version:** `0.1.0` · **Verification cutoff:** 2026-07-16

The mapped graph against `D-F1`'s six taxonomies and `D-F2`'s six corpora. **This is not an inventory of the technique space** — no such object exists (`INC-D3`) — it is a comparison whose only purpose is to surface disagreements for `02_disagreement-adjudication.md` to rule on.

---

## 1. How to read the matrix

**Rows** are *technique areas*, not nodes and not reference chapters. A technique area is the unit at which the references and the map can actually be compared: `D-F1`'s sources disagree about granularity (`X-D2`), and the map deliberately splits one technique into several nodes (schema §1.1 — *"'Bitmask DP' is 6 nodes, not 1"*). Comparing node-to-heading would manufacture hundreds of false disagreements out of a presentation difference.

**Reference columns** record whether the reference *reaches* the area:

| Mark | Means |
| --- | --- |
| ● | The reference carries the area substantively. |
| ○ | The reference touches it in passing or as a subordinate case. |
| — | The reference does not reach it. **Not a defect** — the set was selected for complementary blind spots (`D-F1` §1); T1/T2 stopping at the canon is the *designed* behaviour, and is why T4/T5/T6 exist. |
| ? | Cannot be verified at this cutoff. See `CAP-2`. |

**Map column** records what the graph actually contains. **`MAPPED` requires typed nodes with a prerequisite chain to the sanctioned floor** — not a name appearing anywhere. Bare presence is exactly the "topic volume is never coverage" failure.

**Every non-`MAPPED` cell carries a `CV-#`** — a verdict id resolved in `02_…`. There are no unexplained cells.

## 2. CL-1 — Foundational / linear-sequence (46 nodes + 8 frozen roots)

| Technique area | T1 | T2 | T3 | T4 | T5 | T6 | C1 | C2 | C3 | C4 | C5 | C6 | Map | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DP first principles (optimal substructure, overlapping subproblems, state/transition/base case, memo vs. tabulation) | ● | ● | ● | ○ | — | — | ○ | ● | — | — | — | — | **MAPPED** — 8 frozen roots (`D-S2`) | — |
| Linear / sequence DP (1D) | ● | ● | ● | ● | — | — | ● | ● | — | ● | ○ | — | **MAPPED** | — |
| Linear / sequence DP (2D, grid / path) | ● | ● | ● | ● | — | — | ● | ● | — | ● | ○ | — | **MAPPED** | — |
| Prefix-aggregate recurrence + range-difference identity | ● | ● | ● | ○ | — | — | ● | ● | — | ● | — | — | **MAPPED** | — |
| Prefix-sum **acceleration** of a DP transition | ○ | ○ | ○ | ● | — | — | ○ | ○ | — | ● | — | — | **UNMAPPED** | `CV-11` gap |
| Maximum subarray (Kadane) and kin | ● | ● | ● | ○ | — | — | ● | ● | — | ○ | — | — | **MAPPED** | — |
| Longest increasing subsequence — O(n²) recurrence | ● | ● | ● | ● | — | — | ● | ● | — | ● | ○ | — | **MAPPED** | — |
| **Longest increasing subsequence — O(n log n)** | ● | ● | ● | ● | — | — | ● | ● | — | ● | ○ | — | **UNMAPPED** | **`CV-2` gap** |
| Edit distance / string alignment | ● | ● | ● | ● | — | — | ● | ● | — | ● | ○ | — | **MAPPED** | — |
| Hirschberg linear-space alignment; bit-parallel edit distance | ○ | — | — | ● | ○ | ○ | — | — | — | ○ | ○ | — | **UNMAPPED** | `CV-13` gap |
| State-machine over a sequence | ○ | ○ | ● | ● | — | — | ○ | ● | — | ● | — | — | **MAPPED** | `CV-20` equivalence (alias collision with CL-3 automaton DP) |
| Sequence-partition DP (split into k parts) | ● | ○ | ● | ● | — | — | ○ | ● | — | ● | ○ | — | **MAPPED** | — |
| Rolling-array / memory compression | ● | ● | ● | ● | — | — | ○ | ● | — | ● | — | — | **UNMAPPED** | `CV-12` gap |

## 3. CL-2 — Combinatorial / structural (61 nodes)

| Technique area | T1 | T2 | T3 | T4 | T5 | T6 | C1 | C2 | C3 | C4 | C5 | C6 | Map | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0/1 knapsack | ● | ● | ● | ● | — | — | ● | ● | ○ | ● | ○ | — | **MAPPED** | — |
| Unbounded knapsack / coin change | ● | ● | ● | ● | — | — | ● | ● | ○ | ● | — | — | **MAPPED** | — |
| Bounded-knapsack multiplicity recurrence | ● | ● | ○ | ● | — | — | ○ | ● | ○ | ● | — | — | **MAPPED** | — |
| **Bounded-knapsack binary / powers-of-two splitting** | ○ | ○ | ○ | ● | ○ | — | — | ○ | — | ● | ○ | — | **UNMAPPED** | **`CV-3` gap** |
| Bounded-knapsack monotonic-deque evaluation | ○ | ○ | ○ | ● | ○ | — | — | ○ | — | ● | ○ | — | **MAPPED** — `cl-4.monotonic-queue-optimization` | **`CV-4` equivalence** |
| Subset-sum feasibility | ● | ● | ● | ● | — | — | ● | ● | ○ | ● | — | — | **MAPPED** | — |
| Bitset-accelerated subset sum / word-parallel optimization | ○ | ○ | — | ● | ○ | — | — | — | — | ● | ○ | ○ | **UNMAPPED** | **`CV-5` gap** |
| Counting DP | ● | ● | ● | ● | — | — | ● | ● | ○ | ● | ○ | — | **MAPPED** | — |
| Interval / range DP (incl. optimal BST) | ● | ● | ● | ● | ○ | ● | ○ | ● | ● | ● | ● | — | **MAPPED** | — |
| Tree DP | ● | ● | ● | ● | ○ | — | ○ | ● | ● | ● | ● | — | **MAPPED** | — |
| Tree DP — rerooting | ○ | ○ | ● | ● | ○ | — | — | ● | ○ | ● | ● | — | **MAPPED** | — |
| Tree knapsack / child-merge | ○ | ○ | ● | ● | ○ | — | — | ● | ○ | ● | ● | — | **MAPPED** | — |
| Small-to-large merging / DSU on tree | ○ | — | ● | ● | ● | — | — | — | ○ | ● | ● | — | **UNMAPPED** | `CV-14` gap |
| DAG / graph-shaped DP | ● | ● | ● | ● | — | — | ● | ● | ○ | ● | ○ | — | **MAPPED** | — |
| Centroid-decomposition path counting | ○ | — | ● | ● | ● | — | — | — | ○ | ● | ● | — | **EXCLUDED — not DP** | **`CV-7`** intentional exclusion (settles `E9`) |

## 4. CL-3 — State-compression / specialized-domain (31 nodes)

| Technique area | T1 | T2 | T3 | T4 | T5 | T6 | C1 | C2 | C3 | C4 | C5 | C6 | Map | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bitmask / subset DP (incl. TSP-over-subsets) | ● | ● | ● | ● | ○ | — | ● | ● | ● | ● | ● | — | **MAPPED** — 6 nodes | — |
| **SOS DP / zeta–Möbius / subset-sum convolution** | — | — | — | ● | ○ | ○ | — | — | ○ | ● | ○ | ○ | **UNMAPPED** | **`CV-1` gap + `CV-1a` unresolved (`D-F4a`)** |
| Ranked zeta / fast subset convolution beyond SOS | — | — | — | ○ | — | ● | — | — | — | ○ | ○ | ○ | **EXCLUDED** | `CV-30` intentional exclusion |
| Digit DP | ○ | ● | ● | ● | ○ | — | ○ | — | ● | ● | ○ | — | **MAPPED** — 5 nodes | — |
| Probability / expectation DP | ○ | ● | ● | ● | ○ | — | ○ | ● | ● | ● | ○ | — | **MAPPED** — 5 nodes | — |
| Game DP / Sprague–Grundy (impartial) | ○ | ● | ● | ● | ○ | — | ○ | ● | ● | ● | ○ | — | **MAPPED** — 7 nodes | — |
| Partizan / surreal-number combinatorial game theory | — | — | — | ○ | ○ | ● | — | — | — | — | ○ | — | **EXCLUDED** | `CV-8` intentional exclusion |
| **Plug DP / broken-profile DP** | ● | — | — | ● | ● | — | ○ | — | ● | ● | ● | — | **MAPPED** — 3 nodes | **`CV-6` equivalence** (charter-wording vs `D-F4`) |
| Broken-profile DP accelerated by profile hashing | — | — | — | ○ | ● | — | — | — | ○ | ● | ● | — | **UNMAPPED** | `CV-16` gap |
| Automaton DP (incl. Aho–Corasick DP) | ○ | ○ | ● | ● | ○ | — | — | — | ● | ● | ● | — | **MAPPED** — 3 nodes | `CV-21` equivalence |
| Segment-tree-accelerated digit / automaton transitions | ○ | — | — | ● | ○ | — | — | — | ○ | ● | ○ | — | **UNMAPPED** | `CV-15` gap |
| Steiner-tree DP (Dreyfus–Wagner) | — | — | ○ | ● | ● | ● | — | — | ○ | ● | ● | — | **MAPPED** — 2 nodes | `CV-22` equivalence |

## 5. CL-4 — Optimization, mainstream half (23 nodes, NEU-937)

| Technique area | T1 | T2 | T3 | T4 | T5 | T6 | C1 | C2 | C3 | C4 | C5 | C6 | Map | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Convex Hull Trick | ○ | — | ● | ● | ● | ● | — | — | ○ | ● | ● | ○ | **MAPPED** | — |
| Li Chao tree | — | — | ○ | ● | ● | ○ | — | — | — | ● | ● | ● | **MAPPED** | — |
| Divide-and-conquer optimization (monotone minima) | ● | — | ● | ● | ● | ● | — | — | ○ | ● | ● | — | **MAPPED** | **`CV-23` equivalence** (`RX-6` trigger does not fire) |
| Knuth–Yao / quadrangle-inequality optimization | ● | — | ● | ● | ● | ● | — | — | ○ | ● | ● | — | **MAPPED** | — |
| Monotonic-queue / sliding-window optimization | ○ | ○ | ● | ● | ● | — | — | ○ | ○ | ● | ● | — | **MAPPED** | — |
| Matrix-exponentiation DP | ○ | ● | ● | ● | ○ | — | ○ | ● | ● | ● | ● | — | **MAPPED** | — |
| Matrix-exponentiation applied to an expectation DP | — | — | — | ● | ○ | — | — | — | ○ | ● | ○ | — | **MAPPED** (as the technique) | `CV-24` equivalence |

## 6. CL-4 — Optimization, research-tier frontier (18 nodes, NEU-938)

| Technique area | T1 | T2 | T3 | T4 | T5 | T6 | C1 | C2 | C3 | C4 | C5 | C6 | Map | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Slope trick | — | — | — | ● | ● | ○ | — | — | — | ● | ● | ○ | **MAPPED** — 6 nodes | `CV-25` equivalence |
| Slope trick on trees | — | — | — | ● | ● | — | — | — | — | ● | ● | — | **MAPPED** | — |
| Lagrangian relaxation / "Aliens trick" | — | — | — | ● | ○ | ● | — | — | — | ● | ● | — | **MAPPED** — 5 nodes | `CV-26` equivalence (naming) |
| Kinetic segment tree ↔ DP interplay | — | — | — | ● | ● | ○ | — | — | — | ● | ● | ○ | **MAPPED** | `CV-27` equivalence |
| SMAWK / LARSCH | — | — | — | ○ | ○ | ● | — | — | — | ○ | ○ | ○ | **MAPPED** | `CV-28` — Convention U1 map-beyond-reference |
| Segment tree beats | — | — | — | ● | ● | — | — | — | — | ● | ● | ● | **EXCLUDED — not DP** | `CV-9` intentional exclusion |
| L♮- / M-convex discrete convex analysis | — | — | — | ○ | ○ | ● | — | — | — | — | ○ | — | **EXCLUDED** | `CV-29` intentional exclusion |
| Multi-parameter Lagrangian relaxation | — | — | — | ○ | — | ● | — | — | — | — | ○ | — | **EXCLUDED** | `CV-29` intentional exclusion |
| Sub-quadratic (min,+) convolution (non-convex) | — | — | — | ○ | — | ● | — | — | — | — | — | ○ | **EXCLUDED** | `CV-29` intentional exclusion |
| Quantum / parallel / streaming / approximate DP | — | — | — | ○ | — | ● | — | — | — | — | — | — | **EXCLUDED** | `CV-29` intentional exclusion |
| Composed frontier techniques | — | — | — | ● | ● | ○ | — | — | — | ● | ● | — | **EXCLUDED as nodes** | `CV-10` intentional exclusion (`F-C-4`-grounded) |

## 7. What the matrix shows

**1. The canon is covered, and covered as chains rather than headings.** Every technique area T1 and T2 carry is mapped, with one exception (LIS O(n log n), `CV-2`) that is not a canon failure but an instance of the gap class in `04_…`. The 179 nodes across 12+ areas are not one-node-per-name: `X-D2`-driven multi-node splits are the norm and are the schema's §1.1 requirement.

**2. The maximalist bar holds, and T4/T5/T6 are why.** Every frontier area — slope trick, Aliens trick, kinetic segment tree, plug DP, SMAWK — is reachable *only* through T4/T5/T6, exactly as `F-T-3` predicted. Had `D-F1` selected only the canonical tier, the matrix's frontier rows would all read `—` and the map would have silently capped at the canon. **The reference selection is vindicated by this matrix, which is the strongest available evidence that `D-F1` was right.**

**3. `SMAWK` is mapped and is in essentially no taxonomy.** Convention U1 working as designed (`CV-28`): absence from the references is a coverage question, not a partition question, and here the coverage answer is "the map is ahead of its references," which `D-F1` §6 explicitly permits.

**4. Every unmapped row but one is the same shape.** Nine of the ten `UNMAPPED` cells are **T1-fires → CL-4 → enumerated by neither CL-4 half**. That is not nine independent oversights. It is one systematic defect in the work split, and it is `04_work-split-seam.md`.

**5. Coverage is not symmetric with reference density.** SOS DP (`CV-1`) is carried by four references and by four corpora including C4 and C6 — it is one of the best-attested rows in the matrix — and it is mapped by nobody. Reference density does not produce coverage; an owner does.

## 8. Matrix caveats (binding)

- **`CAP-2` applies to every C4 cell.** Codeforces returned HTTP 403 to automated fetching at the cutoff (`F-T-5`), so **no C4 cell is a verified entry id** — C4 marks record the *tradition* that the tag intersection covers the area, which is well-attested, and nothing more. No C4 problem id is asserted anywhere in this package.
- **No cell is a problem-level citation.** `F-C-1` verified only the CSES section counts. Two mappers independently wrote problem-level refs from memory and withdrew them (`EXC-1`, `E0`); this audit does not reintroduce what they correctly retracted. See `CV-17`.
- **`F-C-4` bounds the corpus columns.** Frontier techniques appear in corpora predominantly as *compositions*, so a frontier corpus mark means "an instance exists inside a composition," never "a clean isolated instance exists."
- **`F-C-5` bars any progression reading.** No corpus is ordered by learning dependency. Nothing in this matrix is evidence of a prerequisite or a difficulty claim; `X-D3` (the DP-transfer gap) is carried undiminished.
- **Reference marks are class 1 `[literature]` survey judgments at the 2026-07-16 cutoff**, not measured frequencies, and each is falsifiable by re-inspection. `CAP-1` (a reference reaching the frontier alone may exist outside the sweep) is inherited and unresolved.
