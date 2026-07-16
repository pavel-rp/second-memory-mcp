# C005 — DP Map Coverage-and-Gap Adjudication (OUT-7)

**Task:** NEU-942 (SUB-10) of the NEU-889 charter · **Covers:** OUT-7, OUT-4 (residual-exclusion adjudication) · **Compiled:** 2026-07-16 · **Map version audited:** `0.1.0`

The coverage audit of the mapped DP knowledge-and-skill graph against the multiple NEU-932 references. **No unexplained gap.**

---

## Read this first

| Question | Answer | Where |
| --- | --- | --- |
| **Is the map complete?** | **No — and it says so precisely.** 10 genuine gaps, all with named owners. 9 of the 10 are **one systematic defect**, not nine oversights. | `04_work-split-seam.md` |
| **What is the defect?** | `D-F4`'s cascade assigns techniques to the **CL-4 cluster**; CL-4's two mappers are scoped by **enumerated lists**. A technique that is CL-4-by-cascade but in neither enumeration is **owned by the cluster and by no mapper**. Ten fell through. | `04_…` §1–4 |
| **Did anyone do this wrong?** | **No.** 31 blind cross-cluster hand-offs, every cascade judgment correct. All five mappers recorded rather than smoothed. **The map is honest; the decomposition has a seam.** | `03_…` §3, `04_…` §6 |
| **Is the partition broken?** | **No, and no amendment is recommended.** Convention U1 already assigns all ten to CL-4. This is a **coverage** finding, not a partition finding — exactly as `RX-13`'s trigger specifies. | `04_…` §6 |
| **What must the creator decide?** | **`INC-C1`** — commission a CL-4 completion task (recommended: scoped **by the cascade**, not by an enumeration). **`INC-C2`** — adjudicate `D-F4a` (SOS DP: CL-4 vs CL-3). | `05_…` §1 |
| **Was anything smoothed?** | **No.** 30 disagreements, 30 verdicts, 0 silent differences. | `02_…` |

## Package

| File | What it is |
| --- | --- |
| `00_method-and-scope.md` | Method, the four-verdict vocabulary, the standing rules. **Start here.** |
| `01_coverage-matrix.md` | The mapped graph vs. T1…T6 and C1…C6. Every non-`MAPPED` cell carries a verdict id. |
| `02_disagreement-adjudication.md` | **The core.** Every disagreement, one verdict each (`CV-1`…`CV-35`). |
| `03_residual-exclusion-consolidation.md` | All **52** mapper exclusions, consolidated and adjudicated (OUT-4). |
| `04_work-split-seam.md` | **The material finding.** The gap class, its mechanism, its 10 instances, the remedy. |
| `05_caps-and-incomplete-scope.md` | What this audit could not settle, with owners (`INC-C1`…`INC-C6`). |

**Verdicts are recorded in the SUB-2 ledger** — `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.2 (`D-C1`…`D-C4`). **No file in this package sets a status.**

## The verdicts at a glance

| Verdict | Count |
| --- | --- |
| **Genuine gap with a named owner** | **10** |
| **Mapped equivalence** | **11** |
| **Intentional exclusion** | **6** |
| **Unresolved uncertainty** | **3** |
| **Total** | **30** |

Residual exclusions consolidated: **52** → 19 upheld as intentional exclusions · 21 resolved to mapped equivalences · 10 genuine gaps · 3 unresolved · 2 ledger blockages discharged.

## The three headline verdicts

1. **SOS DP** (`CV-1`) — **GAP.** Carried by 4 taxonomies and 4 corpora; **mapped by nobody.** Four mappers each correctly declined. Owner: `INC-C1`, gated on **`CV-1a`/`INC-C2`** (`D-F4a`'s owner — a creator decision) since CL-3's claim is live. CL-3 declares an attachment to it, so **SUB-12 will report an unresolvable target — that is a symptom of this gap, not a separate defect.**
2. **LIS in O(n log n)** (`CV-2`) — **GAP.** The technique `D-F4` §3.2 uses to *demonstrate that the partition works* is unmapped. Uncontested; owner `INC-C1`.
3. **Bounded-knapsack accelerations** (`CV-3`/`CV-4`) — **SPLIT.** Binary/powers-of-two splitting is a **GAP**; the monotonic-deque half **is mapped** (`cl-4.monotonic-queue-optimization`, with `"Bounded knapsack DP"` declared from it). `E3` bundled them; this audit splits it rather than report a mapped technique as missing.

**Plus:** **centroid-decomposition path counting** (`CV-7`) — the map's one ownerless exclusion, escalated to OUT-7 — is **SETTLED as an intentional exclusion**. The rival T3 reading fails because centroid decomposition's subproblems are **disjoint**, negating the frozen `overlapping subproblems` root. Nothing is lost: the composition decomposes into centroid decomposition (not DP) + tree DP (CL-2, mapped). It now carries the `RX-5` AR-1 route as its owner. **`E9` is no longer ownerless.**

## Ledger discipline

**Union, never replace.** The ledger had real rows before this audit and is a proven concurrency hazard — **nodes reference AR-1 and `D-S1a` ids by name in their `notes`, so dropping a row turns other nodes' notes into false claims.** All five pre-existing decision rows (`D-S1`…`D-S5`) and both pre-existing AR-1 rows (NEU-936's) are preserved byte-for-byte.

**This audit found the AR-1 register provably incomplete and repaired it** (`CV-33`): seven AR-1/`D-S1a`-class claims existed across the map; **only two were in the ledger.** The other five were recorded in-file only — each because *the ledger was not that mapper's file to write*. Sole-writer ownership working correctly, and producing an incomplete register anyway. All are now unioned in, disambiguated by filer (two mappers minted colliding ids — `CV-32`).

## Scope boundaries observed

- **Wrote:** this package + union-only additions to the SUB-2 ledger.
- **Did not write:** any `nodes/*.yaml` (the mappers'; NEU-940 writing difficulty fields concurrently) · `edges/cross-cluster.yaml` (SUB-12/NEU-939's) · NEU-932's selection ledger (so `D-F4a` is **not** flipped — `CV-1a` is a recommendation to a named owner).
- **Did not do:** map or repair any node · mint a node to close a gap · reintroduce problem-level citations two mappers correctly withdrew · retry the `CAP-2` fetch · assert any C4 problem id.
