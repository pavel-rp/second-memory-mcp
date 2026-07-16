# Caps and Incomplete Scope

**Task:** NEU-932 · **Compiled:** 2026-07-16

The honest statement of what this selection ran under and what it does not cover. Inherits NEU-887's caps and status discipline: gaps are recorded, never smoothed.

---

## 1. Caps this selection ran under

| Id | Cap | Consequence | Owner |
| --- | --- | --- | --- |
| **CAP-1** | The candidate sweep was **bounded by prior domain knowledge plus targeted verification**, not an exhaustive survey of every DP reference in existence. | F-T-3's claim ("no single reference reaches the maximalist bar alone") is an argument from the surveyed set, **not a proof of non-existence**. A better single reference may exist. Mitigated by the stratified six-source set: a missed reference is likely covered by some tier. | Coverage-audit sub-task |
| **CAP-2** | **Codeforces returned HTTP 403** to automated fetching on 2026-07-16. | T4 is selected on its well-attested tradition, but its **specific entry ids are unverified**. Recorded as `INC-D4`; must be resolved by hand before any specific entry is relied on. Not asserted as verified anywhere. | Coverage-audit sub-task |
| **CAP-3** | T2's (CPH) license is **asserted from the work's stated terms, not machine-verified**. | Does not change the disposition — inform-only is already the most conservative usable treatment. Recorded rather than hidden. | This task |
| **CAP-4** | The representation dry-run is a **desk-check against a constructed specimen**, run before any map nodes exist. | Proves the format *can* express the required distinctions; does **not** prove a real cold agent reads them correctly. `INC-D1`; superseded by OUT-9's cold-context handoff. | Final packaging sub-task |
| **CAP-5** | The partition rule was stress-tested against **19 worked examples**, chosen as hard cases — not against the full technique space, which does not yet exist. | The rule is validated, not exhaustively exercised. `INC-D3`. The `>10 U2 entries` trigger on `D-F4` exists precisely to catch a rule that survives the hard cases but fails at scale. | The five family-mapping sub-tasks |

## 2. What this package does not cover

- **The DP technique space itself.** Not enumerated here, deliberately. Every technique named is a worked example of the partition rule. A list would be topic volume masquerading as coverage — the charter's standing anti-goal.
- **The node schema** (`D-F3a`, `INC-D2`) — SUB-2's.
- **Any prerequisite edge, any node, any cross-cluster link** — the mapping and integration sub-tasks'.
- **Progression stages, difficulty dimensions** — OUT-3's, through NEU-888's semantics. This package supplies difficulty *inputs* (T3's tiering, C4's ratings) with their limitations attached (F-C-3: ratings measure contest performance, not learning difficulty) and makes no progression claim.
- **JavaScript-materiality** (OUT-5) — not a selection concern. Noted forward: no selected reference or corpus assumes JavaScript; all assume the C++ competitive default. The JS-materiality audit therefore has **no reference support** and must be done from first principles — recorded here so OUT-5 is not surprised.
- **Adjudicating reference disagreements** — OUT-7's. Disagreements found during the sweep (F-T-4's naming instability) are preserved for it.
- **Problem licenses** — a later curriculum-production charter's.

## 3. Inherited gaps carried undiminished

| Inherited | From | Status here |
| --- | --- | --- |
| **R1 / X1 — the DP-transfer gap** | NEU-887 (non-downgradable High) | Carried as `X-D3`. Reinforced by F-C-5: no selected corpus is ordered by *learning* dependency, so the map cannot import any corpus's ordering as a prerequisite claim. Nothing in this package measures DP learning. |
| **The class-7 evidence gap** | NEU-887 | Absolute. **No external-user, expert, or market validation exists** anywhere in C005. No claim in this package is or implies one. |

## 4. The one thing most likely to be wrong

Recorded explicitly rather than left for a reader to discover: **the ordering of T1 before T2 in the partition cascade** (`04_…` §3.1) is the load-bearing choice, and it is a judgment call.

It means an optimization technique is owned by CL-4 **even when its state encoding is exotic** — which is why SOS DP is contested (`X-D1`) and why Steiner-tree DP's assignment to CL-3 depends on T1 *not* firing for it. If that judgment is wrong, the symptom will be CL-4 accreting techniques whose real difficulty is their encoding, and SUB-5 will feel under-scoped while SUB-6/SUB-13 feel over-scoped.

**The detection mechanism exists**: U4 challenges concentrating on the CL-3/CL-4 boundary, and the `>10 U2 entries` trigger on `D-F4`. This is named here so the signal is recognized as *the rule failing* rather than as individual mis-assignments.
