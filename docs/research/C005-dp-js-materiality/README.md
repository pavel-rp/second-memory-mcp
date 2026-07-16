# C005 — JavaScript-Materiality Audit of the DP Map

**Task:** NEU-941 (SUB-8 of the NEU-889 charter) · **Covers:** OUT-5 · **Map version audited:** `0.1.0`
· **`rule_version`: `1.0.0`** · **Compiled:** 2026-07-16

---

## What this is

The competitive-programming default is C++. C005's reference implementation language is
**JavaScript**. This audit reaches a verdict on **every one of the 179 mapped technique nodes** —
recording where JavaScript materially changes a technique's feasibility or idiom, and explicitly
marking the rest **JavaScript-neutral** — so downstream curriculum-production agents never inherit
C++ feasibility silently.

> **47 nodes carry a material JavaScript effect. 132 are explicitly JavaScript-neutral.
> 19 of the 47 are blocking: the direct C++ translation is silently wrong or crashes.**

## Start here

| File | What it holds |
| --- | --- |
| **`02_audit-register.md`** | **The index.** Headline counts, the material 47, the feasibility-changing findings, where the mappers overturned this audit, and the notable non-claims. |
| `00_method-and-scope.md` | The materiality rule (NEU-887's, specialized), the anti-dilution rule `JS-M1`/`JS-D1`, scope boundaries, the field shape, decisions `JS-D1`–`JS-D5`. |
| `01_effect-catalogue.md` | The nine effects (`JS-E1`–`JS-E9`), each stated against the C++ default it departs from. **`rule_version: "1.0.0"`.** |
| `03_caps-and-uncertainties.md` | The five uncertainties (`JS-U1`–`JS-U5`), the inherited caps, and what this audit did *not* settle. |

**The authoritative verdict is on the node**, in `javascript_materiality`, in
`../C005-dp-map/nodes/`. This package is the reasoning behind it.

## The four findings that change feasibility

| | Effect | Why it is invisible without this audit |
| --- | --- | --- |
| **1** | **`JS-E2` — modular multiplication** (9 blocking) | `(a * b) % (1e9+7)` is the most reflexively written line in competitive DP. Exact in C++ `long long`. In JavaScript it reaches ~1e18 — **~111× past 2^53** — and **silently rounds**: no throw, no wraparound, a plausible wrong residue. Also breaks CHT/Li Chao/kinetic cross-multiplications (chosen *to avoid* floating point) and digit DP's 1e18 bound *before the DP starts*. |
| **2** | **`JS-E1` — the recursion cap** (7 blocking) | ~10^4 frames, **no raisable limit**; C++ absorbs 10^5–10^6 and judges raise it. Competitive tree sizes (2·10^5) sit **between**. It also *changes which algorithm is chosen* (Kahn's vs recursive DFS) and makes one diagnosis *ambiguous* (a cycle and honest depth throw the same error). |
| **3** | **`JS-E4` — 32-bit bitwise** (2 blocking) | Ordinary bitmask DP is **fine** (n ≤ 20 ≪ 31) — the audit says so rather than inventing a hazard. Plug DP packs **2–4 bits per column**: width 8+ needs 33–52 bits against 31, so the operators **cannot hold the mask at all**. |
| **4** | **`JS-E8` — the missing containers** (idiom) | `priority_queue`/`set`/`multiset`/`deque` are C++ stdlib; JavaScript ships **none**. Slope trick is *defined in terms of* two heaps. The widest idiom gap in the map. |

Plus **`JS-E5` typed arrays** — the most widespread effect (18 nodes) and never blocking: C++'s
`vector<int>` *is* the contiguous unboxed buffer, so a JavaScript author must **decide** what a C++
author gets for free.

## What makes this audit trustworthy

- **It says no as often as yes.** 132 of 179 verdicts are neutral, each with a rationale (`JS-D3`).
  An unexplained `material: false` is indistinguishable from an unaudited node.
- **It refuses the folklore claim.** `Number` **is** binary64, bit-identical to C++ `double` —
  probability/expectation DP is neutral *on precision*. That is the invented claim a reviewer would
  most expect to find, and `02_audit-register.md` §5 lists six more non-claims with the check stated.
- **It guards against dilution.** `JS-D1`: the constant-factor effect applies to everything, so
  recording it everywhere would satisfy the letter of "nothing silently assumes C++" while
  destroying the field's meaning. It is recorded alone exactly once.
- **The map overturned it four times.** Mapper observations reversed or rewrote four verdicts
  (`02_audit-register.md` §4). All 34 are preserved verbatim as `mapper_note`.
- **It invents nothing.** No problem id, no benchmark number, no node (`CAP-2`, `INC-C1`). Every
  threshold named — 2^53, 2^31, 2^64, ~10^4 frames — is a language-specification or
  engine-architecture fact. Five uncertainties are recorded rather than smoothed.

## Scope

**Wrote:** `javascript_materiality` on 179 nodes. Nothing else.

**Did not touch:** `difficulty_dimensions` (NEU-940's — verified intact on all 179 after the
splice), the **8 frozen roots** (`DR-S02` — `JS-U1`), `edges/cross-cluster.yaml`, `manifest.yaml`,
`boundary-register.yaml`, `index/00_technique-index.md`, `coverage`, `status`.

**Out of scope, by NEU-941's own spec:** implementing or benchmarking JavaScript solutions;
selecting a runtime or sandbox. **Every performance verdict is therefore directional, never
quantified** (`JS-U2`) — a reader needing a threshold will not find one here and must not infer one.

## Relation

- **Consumes:** NEU-887's materiality rule (`../C005-product-foundation/product-model/02_…`);
  NEU-933's node template and its reserved `javascript_materiality` field
  (`../C005-dp-map-schema/03_per-node-record-template.md`); NEU-932's caps
  (`../C005-dp-map-foundations/06_caps-and-incomplete-scope.md` §2 — the C++ default every selected
  reference assumes).
- **Audits:** the 179 nodes mapped by NEU-934/935/936/937/938 (`../C005-dp-map/nodes/`).
- **Serves:** downstream C005 curriculum-production agents authoring implementation, optimization,
  and execution-environment content in JavaScript.
