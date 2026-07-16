# DR-S01 — The Node and Edge Schema

**Decision:** `D-S1` · **Task:** NEU-933 · **Status:** settled (see `../adjudication/01_schema-decision-ledger.md` — this record does not set status) · **Compiled:** 2026-07-16

**Resolves NEU-932's `D-F3a`**, which NEU-932 left unresolved *by design* and assigned to this sub-task.

---

## The decision

> **Every node declares `node_kind` (`knowledge` | `skill`). Every skill node declares exactly one `skill_type` from a closed eight-value vocabulary, resolved by an ordered first-match-wins cascade (S1→S8). Prerequisite edges may cross knowledge and skill freely. Prerequisites live in four fields — three DRAWN (`intra_cluster`, `roots`, `boundary_anchors`), one DECLARED (`cross_cluster_attachments`).**

Full statement: `../01_node-and-edge-schema.md`. Template: `../03_per-node-record-template.md`.

## Rationale

**The charter forces the shape.** The map is a knowledge-and-skill graph, not a topic list, and *topic volume is never coverage*. A schema carrying only names and links would let a mapper satisfy every audit with a list of technique names. So the two distinctions are **structural, not advisory**: `skill_type` is required iff `node_kind == "skill"` and must be **absent** otherwise (not `null`), because a knowledge node carrying a skill type means the mapper didn't make the distinction.

**A mandatory single-valued type needs a tiebreak.** Real skills answer several tests — Knuth's optimization is genuinely both a proof obligation and a cost reduction. Without an order, mappers disagree and the vocabulary stops being shared. The cascade runs **most-specific-claim first**: `proof` and `optimization` presuppose a correct DP already exists (the strongest available precondition, so they cannot be residuals); `debugging` and `transfer` presuppose a specific trigger; `strategic`→`implementation`→`procedural` runs down the pipeline from deciding to doing to executing; `conceptual` is last because "understanding what it means" is weakly true of almost every skill node, and **a test that is almost always true must never be asked first**.

**The cascade is deliberately the same pattern as NEU-932's `D-F4` §3.** Reusing a shape the mappers have already internalized costs nothing and buys consistency. The S2/S5 boundary is deliberately the **same test as `D-F4`'s T1**, so a CL-4 node's skill type and its cluster agree by construction rather than coincidence. **The cost of that coupling is recorded** (`../05_caps` §4): if T1's ordering is wrong, this schema inherits the error.

**Edges must cross knowledge/skill freely** — required, not merely permitted. It is the whole reason the two kinds are worth distinguishing. A schema forbidding knowledge→skill would force mappers to launder real dependencies, the exact thing this map exists to prevent.

**Three fields draw, one declares, and the principle is one line:** *draw an edge to anything that already exists; declare an attachment to anything that doesn't.* Roots and anchors are a shared frozen floor present before any mapper starts. A sibling's node is not — the five mappers run **concurrently**, so when SUB-6 wants to link Knuth's optimization to CL-2's interval DP, that file does not exist and there is no id to point at.

## Rejected alternatives

| Alternative | Why it was plausible | Why rejected |
| --- | --- | --- |
| **Multi-valued `skill_type`** (a node carries several) | Honest about reality: bitmask DP genuinely needs conceptual understanding *and* implementation facility. No forced choice, no tiebreak needed. | **Disqualifying: it collapses the graph into a topic list.** The spec requires "exactly one of the eight" — but the deeper reason is that those are **different acquisitions that fail separately**. A learner can understand a bitmask state and be unable to write the submask loop. One multi-typed node cannot represent that; **two nodes can**. Multi-valuing would let a mapper emit one node per technique name and call it mapped — the charter's anti-goal, reached by a schema that permitted it. Rejected in favour of §1.1's rule: **one technique is usually several nodes.** |
| **An open / extensible skill vocabulary** (mappers add types as needed) | Survives techniques nobody anticipated — the same maximalist concern that drove NEU-932's Convention U. | Rejected on **cross-mapper consistency**, which is the vocabulary's entire purpose. Five mappers running in parallel cannot see each other's additions; they would mint overlapping types (`coding` vs `implementation`) and no audit could compare across clusters. NEU-932's answer to un-enumerated *techniques* was a **convention**, not an open cluster set — its codomain is fixed at four. This mirrors it: the vocabulary is closed at eight and indeterminacy is handled by **Convention S** (best candidate + `provisional` + a logged `D-S1a`), never by inventing a type. |
| **An unordered set of type definitions** (define the eight, no cascade) | Simpler. Trusts mappers to read definitions and apply judgment. | Rejected on the same ground NEU-932 rejected an unordered partition: **the order IS the disjointness argument.** Multi-match is not an edge case — Knuth's optimization multi-matches on the *first specimen anyone tried*. Without an order, two mappers type the same skill differently, both defensibly, and the vocabulary stops being shared exactly when it matters. |
| **Edges constrained by node kind** (e.g. skill→knowledge only) | Cleaner-looking layering: knowledge underneath, skills on top. Easy to validate. | Rejected as **false**. Understanding *why* Knuth's optimization applies can genuinely require being able to *formulate* the interval DP first — a knowledge node depending on a skill node. A schema that forbade it would force mappers to launder that dependency into a shape the schema accepts. **The spec is explicit that edges "may cross knowledge and skill freely."** |
| **`conceptual` as the indeterminate sink** | The natural residual; a place for skills nobody could type. | Rejected on NEU-932 `04_…` §4.1's argument, applied one level down: **a rule's residual and a fallback's sink are different jobs and must not be the same bucket**, or the residual rots into "miscellaneous". `conceptual` is the **confident residual** (S1–S7 all confidently "no"); there is **no sink type**. Indeterminacy goes through Convention S — logged, `provisional`, countable — so drift is always visible rather than absorbed. |

## Status and revision trigger

**Status:** settled. Set only in `../adjudication/01_schema-decision-ledger.md`.

**Revision trigger:** **>10 `D-S1a` entries accrue** at the coverage audit — signalling the cascade needs revision rather than `conceptual` absorbing drift (mirrors `D-F4`'s `>10 U2` trigger). Or a mapper cannot express a real node in the schema.

**Challenge route:** file against `D-S1` in the ledger, **naming the specific node that cannot be expressed**. Never locally redesign — five sub-tasks are scoped to this schema.

## Evidence and its honest class

`F-S-4` (class 2 `[code-evidence]`, the 8 worked roots), `F-S-5` (class 1 `[literature]`, the practitioner observation motivating the knowledge/skill split), and the dry-run's 7/8 desk-check.

**Declared at `SOC-7-S2`: `D-S1` is a DESIGN DECISION, not an empirical finding.** It rests on argued constraints — five parallel mappers, a floor reachable at map time, the charter's mandated distinctions — **not** on class-1 evidence about how DP is learned. **No such evidence exists anywhere in C005** (`X-D3`, non-downgradable High). Manufacturing `F-S-*` rows to make it look evidenced would launder a choice as a discovery. Its justification is **argument**, and it is auditable as argument.
