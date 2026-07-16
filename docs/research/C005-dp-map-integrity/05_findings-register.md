# 05 — Findings Register

**Author:** NEU-943 (SUB-9). Every finding is **flagged and routed** — none is smoothed,
none is repaired here. **This audit edited no node file and no edge file.**

---

## 1. Findings raised by this audit

| id | Severity | Kind | Summary | Owner / route | Status |
| -- | -------- | ---- | ------- | ------------- | ------ |
| **F-943-1** | 🔴 **High** | annotation-vs-graph inconsistency | NEU-940's `progression_stage` + `prerequisite_depth` were computed against the **pre-NEU-939** graph. **26/179** nodes under-report depth (0 over-report); **6** stage inversions. Isolated to the cross-cluster layer: **293 intra-cluster edges → 0 inversions; 25 cross-cluster edges → 6.** | NEU-940's dimension values (26 nodes, CL-3 + CL-4) | **open** |
| **F-943-2** | 🟡 Low | coverage fragility | `conceptual` **is** instantiated (union-completeness PASSES) but by **1 non-root node** (`cl-1.judge-dp-applicability`); its other 2 instances are frozen roots. Absent from CL-2, CL-3, CL-4. | charter / final package — a criterion question, not a repair | **open** |
| **F-943-3** | 🟡 Low | dimension redundancy | `entry_gate` is a **deterministic function** of `progression_stage` (PS-1↔gate-a ×20, PS-2/3/4↔gate-c ×159, zero exceptions), so it carries no independent information. Gates B and D instantiated by no node. | NEU-940 / NEU-888 | **open** |

## 2. Findings inherited from NEU-939 — adjudicated here

| id | Verdict | Detail |
| -- | ------- | ------ |
| **F-939-A** (SOS DP) | 🔴 **GENUINE GAP — confirmed** | Re-verified independently across all **187** nodes by id, name, and summary: **zero** matches for SOS / sum-over-subsets / zeta / Möbius. Not a naming miss. **Concurs with NEU-942**, which owns the coverage verdict and assigned **`INC-C1`** (creator, CL-4 completion), gated on **`INC-C2`** (`D-F4a`). Recorded here as the **orphan / missing-prerequisite** face. **No node minted, no edge faked, `D-F4a` not re-decided.** |
| **F-939-B** (bitset / word-parallel) | 🔴 **GENUINE GAP — confirmed** | Re-verified at both scopes: absent from CL-4-mainstream's 23, CL-4-frontier's 18, and all 187. CL-2's exclusion note **E4 correctly routes it to CL-4; neither CL-4 file received it.** Same routing as F-939-A. |
| **F-939-1** (altitude) | ✅ **Edge stands; reservation upheld as open** | Resolving a *shape* request to CL-1's family-level node is correct. Both readings ground cleanly, so structure cannot discriminate — it is a pedagogical call. Low severity, **open**. A repointing if ever changed, never a re-mapping. |
| **F-939-2** (cluster drift) | ✅ **Resolutions correct; signal upheld and sharpened** | Both cross-boundary resolutions are right — the plug-DP one followed the mapper's **own written instruction** to retry against CL-1. The T3/T4 drift signal is real, and this audit adds a third data point: `cl-4.divide-and-conquer-optimization` is *also* an F-943-1 stage inversion. **F-939-2 and F-943-1 are the same blindness in two annotations.** |

## 3. Structural checks — all clean (0 findings)

Recorded because a clean negative on a laundering probe is evidence, not filler.

| Check | Result |
| ----- | ------ |
| Acyclicity over all 187 nodes / 572 edges | ✅ **0 cycles** — no cycle retained, none needs justification |
| Every non-root chain reaches root or registered anchor | ✅ **179/179**, 0 unexplained jumps |
| Faked root edges (laundering a real dependency) | ✅ **0 of 223** |
| Locally invented anchors (`AR-1` forbidden) | ✅ **0 of 31** — all 5 anchors registered |
| Root/anchor edges re-drawn in `cross-cluster.yaml` | ✅ **0** (NEU-939's `R5` confirmed) |
| `intra_cluster` edges crossing clusters | ✅ 0 of 293 |
| Dangling endpoints / duplicate ids | ✅ 0 / 0 |
| Eight-skill-type union-completeness | ✅ **8/8 instantiated** |
| `len(clusters)` = 4 (never node files = 5) | ✅ 4 |
| OUT-6 path criterion (4 clusters + research-tier) | ✅ **5/5** |
| Roots frozen (`{}` dimensions, unedited) | ✅ 8/8 |

**27/27 structural checks pass.**

## 4. Ledger discipline

**This audit writes no adjudication-ledger rows.** Status flips only in the ledger, on
correctly-classed evidence; findings here are *records for adjudication*, not status
flips. Nothing in this package promotes, demotes, or re-decides any node's `status`.

Recorded explicitly: had rows been written, the rule is **UNION — never replace.** Nodes
reference AR-1 rows **by id**; clobbering the register turns their notes into false
claims. NEU-942 already demonstrated this hazard — it found the AR-1 register **provably
incomplete (7 claims, 2 in ledger)** and repaired it **by unioning** the blocked filings.
`EXC-11` is **RESOLVED** by that same pass (`D-S1a` count = 1, so `D-S1`'s `>10` threshold
does not fire). Both are consumed here as settled, not re-derived.

## 5. What a consumer should do with this today

1. **Trust the edges. Do not trust `progression_stage` across a cluster boundary.**
   The 25 cross-cluster edges are audited and correct; the stages on 6 of them are
   inverted. Sequence from the **graph's topological order** — which exists, because the
   graph is acyclic — not from the stage labels, until **F-943-1** is closed.
2. **Treat `prerequisite_depth` as advisory.** 26 values under-report by 1–4 hops. It is
   a pure function of the graph; `validator/audit-graph-integrity.mjs` computes it
   correctly from source.
3. **Do not read F-939-A/B as audit failures.** They are *known, owned, adjudicated*
   holes (NEU-942, `INC-C1`), and the graph is honest about them precisely because nobody
   faked a terminal to hide them.
4. **DP-transfer effectiveness remains provisional** — nothing here presents the transfer
   order as measured for DP (NEU-887 R1).
