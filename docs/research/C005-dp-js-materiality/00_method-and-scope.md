# JavaScript-Materiality Audit — Method and Scope

**Task:** NEU-941 (SUB-8) · **Covers:** OUT-5 · **Compiled:** 2026-07-16 · **Map version audited:** `0.1.0`

---

## 1. What this audit is

The competitive-programming default is C++. Every taxonomy and corpus NEU-932 selected assumes it
(`C005-dp-map-foundations/06_caps-and-incomplete-scope.md` §2). C005's reference implementation
language is **JavaScript**. If the map inherits C++ feasibility silently, it will assert that a
technique is implementable and performant when JavaScript's recursion limits, number semantics,
container library, and performance envelope materially change or block it.

This audit reaches a **verdict on every one of the 179 mapped technique nodes** and writes it into
the `javascript_materiality` field the NEU-933 template reserved for OUT-5.

It is an audit of **language semantics against mapped techniques**. It is not a benchmark.

## 2. What "material" means here

Inherited from NEU-887's feature-wide materiality rule
(`C005-product-foundation/product-model/02_materiality-rule-and-candidate-inventory.md` §1, DEC5):
a candidate is material when, if it were changed, added, or omitted, it could plausibly change a
requirement, decision, or rejected alternative.

Specialized to this audit, and applied literally to all 179 nodes:

> **A JavaScript effect is material on a node when it would change what a downstream C005
> curriculum-production agent WRITES for that node** — the code, the guard, the sentinel, the
> container, the encoding, or the failure list — **relative to the C++ competitive default.**

Two corollaries do most of the discriminating work:

- **A node whose contribution is what a recurrence *is*, or *that* it is correct, is almost always
  JavaScript-neutral.** Language does not touch "is this a knapsack", "prove the quadrangle
  inequality", or "an interval DP is evaluated by increasing length". Knowledge, proof, strategic,
  conceptual, and transfer nodes are neutral by default, and the audit says so explicitly rather
  than leaving them unassessed.
- **The effect lands on the node that writes the thing.** Where a technique has both a concept node
  and an implementation node, the material effect is recorded on the implementation node and the
  concept node carries an explicit neutral verdict that **cross-references** it. This keeps a single
  finding from being smeared across four nodes, and keeps the concept node from carrying an
  implementation claim it does not make. A cross-referencing neutral is **not** a silent C++
  assumption — the reader is routed to the node that holds the verdict in one hop.

### 2.1 The rule that prevents dilution (`JS-M1`)

**A uniform effect distinguishes nothing.** JavaScript's constant-factor disadvantage versus
optimized C++ (`JS-E6`) applies, to some degree, to *every* technique in the map. Recording it on
all 179 nodes would satisfy the letter of "no node silently assumes C++ feasibility" while
destroying the field's information content, and would burden 179 nodes with a claim that
distinguishes none of them — the exact failure the third acceptance scenario forbids.

Therefore:

> **`JS-E6` is never recorded alone**, except on a node whose *raison d'être* is the constant factor
> itself (the LARSCH/SMAWK class, where the technique is chosen *for* its constant). Everywhere else
> `JS-E6` is recorded only in combination with a specific, mitigable idiom — a typed array, a
> preallocated ring buffer, an avoided `Map`.

This is a deliberate, reviewable choice. It is recorded as `JS-D1` in §5.

## 3. Scope boundaries

**In scope:** the 179 mapped technique nodes across CL-1…CL-4, judged from JavaScript language
semantics against the C++ competitive default.

**Out of scope, and why:**

| Excluded | Why |
| --- | --- |
| **The 8 frozen roots** (`cl-1.root.*`) | Frozen by `DR-S02`. This audit does not write them. One of them — `cl-1.root.implement-memoization-and-tabulation` — already carries a mapper *observation* foreseeing exactly this audit's recursion-depth finding, and the verdict it invites cannot be written onto a frozen node. Recorded as **`JS-U1`** in `03_caps-and-uncertainties.md`, not smoothed. |
| **Boundary anchors** (`anchor.*`) | The register is versioned and frozen, and `DR-S03` forbids decomposing an anchor's internals. An anchor is a *sanctioned terminal*. Several anchors (SCC condensation, Aho–Corasick construction, shortest-path relaxation) have JavaScript realizations that plainly inherit `JS-E1`, but auditing them means decomposing them. Recorded as **`JS-U4`**. |
| **Benchmarking; picking a runtime or sandbox** | Explicitly out of scope per the NEU-941 spec (later curriculum-production charters own it). Every performance-class verdict here is therefore **directional, not quantified** — see `JS-U2`. |
| **Problem-level citations** | `CAP-2`: Codeforces automated fetching 403'd and no problem-level corpus id is verified. This audit cites **no problem ids and no benchmark numbers**. Where a threshold is named (2^53, 2^31, ~10^4 frames) it is a *language-specification or engine-architecture fact*, not a measurement. |
| **The 10 adjudicated coverage gaps** (`INC-C1`) | SOS DP, LIS O(n log n), bounded-knapsack binary splitting, bitset/word-parallel and six more are mapped by nobody; NEU-942 adjudicated them with named owners. **Those nodes do not exist.** This audit does not invent them. Two of them are places where JavaScript materiality would have been unusually high — recorded as **`JS-U3`**, routed to their existing owners, not smoothed. |
| `difficulty_dimensions`, `coverage`, `status`, edges, manifest | Other owners. Untouched. |

## 4. How the verdict is written

Every one of the 179 nodes now carries:

```yaml
    javascript_materiality:
      assessed: true
      rule_version: "1.0.0"
      material: false
      effects: []
      rationale: >-
        ...why JavaScript does not change what is written here...
```

or, where material:

```yaml
    javascript_materiality:
      assessed: true
      rule_version: "1.0.0"
      material: true
      effects: ["JS-E2"]
      severity: "blocking"
      rationale: >-
        ...the effect, the C++ default it departs from, and the JavaScript consequence...
```

| Field | Values | Meaning |
| --- | --- | --- |
| `assessed` | `true` on all 179 | OUT-5 reached a verdict. No mapped node is left unassessed. |
| `rule_version` | `"1.0.0"` | The effect catalogue version this verdict was reached under. |
| `material` | `bool` | `false` **is** the explicit "JavaScript-neutral" marking the second acceptance scenario requires. |
| `effects` | `list<JS-Ex>` | Ids from `01_effect-catalogue.md`. Empty iff `material: false`. |
| `severity` | `"blocking"` \| `"correctness-risk"` \| `"idiom-shift"` \| `"performance"` | Present iff `material: true`. See below. |
| `rationale` | string | **Required on every node, both verdicts.** A neutral verdict without a rationale is an unaudited node wearing an audit's clothes. |
| `uncertainty` | `JS-Ux` | Optional. Present where the verdict's *magnitude* could not be established without work this task is barred from doing. |

**Severity vocabulary:**

| Severity | Test |
| --- | --- |
| `"blocking"` | The direct JavaScript translation of the C++ idiom is **silently wrong or crashes**. A JavaScript-specific technique is *required*, not preferred. |
| `"correctness-risk"` | Correct for the sizes the technique usually meets, but a reachable input range makes it silently wrong. |
| `"idiom-shift"` | Feasible and correct, but the JavaScript realization **differs materially** from the C++ default — a different container, sentinel, encoding, or failure signature. |
| `"performance"` | Correct and feasible; the constant factor decides whether it clears a time bound, and a specific JavaScript idiom recovers it. |

## 5. Decisions this audit made

| Id | Decision | Rationale |
| --- | --- | --- |
| `JS-D1` | `JS-E6` (constant factor) is never recorded alone except on the constant-factor-defined class. | §2.1. Prevents a uniform effect from being recorded as 179 distinguishing ones. |
| `JS-D2` | Concept/proof/strategic/transfer nodes carry an explicit neutral verdict with a cross-reference, not a copied material claim. | §2 corollary 2. Keeps one finding to one node. |
| `JS-D3` | Every node carries a rationale, including neutral ones. | An unexplained `material: false` is indistinguishable from an unaudited node. |
| `JS-D4` | Verdicts are reached from **language semantics**, never from remembered benchmarks or problem ids. | `CAP-2`; benchmarking out of scope. Every named threshold is a spec fact. |
| `JS-D5` | Where JavaScript *removes* a C++ hazard, that is recorded as material too. | Materiality is symmetric. A downstream agent authoring the all-negative Kadane boundary in JavaScript writes a *different, simpler* guard than the C++ `INT_MIN` one — that changes what is written, so it is material. |

**Status.** Every verdict is `provisional` at the node level in the sense that `status` is untouched
and remains the mapper's. No verdict here promotes any node. This audit writes exactly one field.
