# Schema-Usability Dry-Run

**Task:** NEU-933 · **Compiled:** 2026-07-16 · **Evidences:** `D-S1`, `D-S2`, `D-S3` · **Status:** see `../adjudication/01_schema-decision-ledger.md`

**What this is.** The spec's first verification-evidence item: *"a schema-usability check confirming a cold downstream sub-task can author a compliant typed node and declare a cross-cluster attachment point without drawing the edge."*

**⚠ What this is NOT, stated before any result.** This is a **desk-check against a constructed specimen**, run by the same task that authored the schema, before any real mapper exists. It is class-1/2 evidence about the schema's **expressiveness** — **not** class-4 evidence that a cold agent **succeeded**. Inherited as `INC-D1` / `CAP-4` from NEU-932, carried undiminished, **not** re-derived and **not** quietly upgraded. NEU-932's dry-run made exactly this disclosure; this one repeats it because the limitation is unchanged.

The honest framing: *"I wrote a schema, then I checked my own schema against a node I wrote."* That catches **expressiveness gaps** — a field that cannot hold what it must — and it genuinely did catch things (§4). It cannot catch **comprehension gaps**: what a cold agent misreads. Only OUT-9's cold-context handoff can, and it supersedes this.

---

## 1. Method

A specimen node is authored **using only** what a cold mapper would have: `03_per-node-record-template.md`, `01_node-and-edge-schema.md`, the frozen roots, `boundary-register.yaml`, and its own cluster file's header. The specimen is deliberately the **hardest case available**: `cl-4.knuth-optimization` — a node that must exercise a drawn root edge, a declared cross-cluster attachment, a skill-type cascade with a real rival, and the one-technique-many-nodes split, all at once.

Then eight requirements are checked. The specimen is in `03_per-node-record-template.md` §6.

## 2. Requirement checks

| # | Requirement | Result |
| --- | --- | --- |
| **DR-1** | A cold sub-task can author a **compliant node** from the template alone. | **Pass.** Every required field has a value derivable from the template's inline guidance without reading any other file. The 8 frozen roots are a copy-able worked example of every field. |
| **DR-2** | The node **distinguishes knowledge from skill**. | **Pass.** `node_kind: "skill"` is required and has no default; the specimen's `skill_type` is present because it is a skill, and **V-2** makes the iff-condition mechanically checkable. |
| **DR-3** | Every skill node is typed as **exactly one of eight**. | **Pass.** `skill_type` is single-valued, the vocabulary is closed at eight, and the S1→S8 cascade resolves multi-match deterministically. The specimen genuinely multi-matched (`proof` and `optimization` both fire) and the cascade resolved it — **by splitting into two nodes**, which is §1.1's rule working. |
| **DR-4** | A cross-cluster prerequisite can be **declared without drawing the edge**. | **Pass.** The specimen declares `xc.cl-4.knuth-optimization->cl-2.interval-dp` with `status: "declared"`. **No edge exists.** `edges/cross-cluster.yaml` stays empty; SUB-12 realizes it later. The mapper writes only its own file. |
| **DR-5** | A prerequisite chain **terminates on a root or a registered anchor**, at map time. | **Pass.** The specimen draws `roots: ["cl-1.root.formulate-state-transition-base-case"]` directly. The chain bottoms out **while mapping**, not after integration — which is why `D-S4` draws root edges rather than declaring them. |
| **DR-6** | A **sanctioned non-DP prerequisite** is drawn directly, and reads differently from a cross-cluster declaration. | **Pass.** Different **fields**, not different conventions: `prerequisites.boundary_anchors` (drawn) vs `cross_cluster_attachments` (declared). A mapper cannot confuse them without writing into the wrong field, which **V-5**/**V-7** catch. |
| **DR-7** | **Settled reads differently from provisional**, per the charter's binding requirement. | **Pass.** The specimen is `"provisional"` (no ledger entry); the roots are `"settled"` (`D-S2`). Both carry `adjudicated_at_map_version`. The legend is in `manifest.yaml`; the authority is the ledger. |
| **DR-8** | A **real cold agent** authors a compliant node unaided. | **⚠ NOT TESTED — `INC-D1`.** This dry-run cannot test it: the author of the check is the author of the schema. **Deferred to OUT-9's cold-context handoff, which supersedes this.** Recorded as a **gap**, not a pass. |

**7 pass, 1 not tested and declared.** The one that is not tested is the one that matters most, and it is named rather than quietly folded into the other seven.

## 3. The specimen, walked

`cl-4.knuth-optimization` (full YAML in `../03_per-node-record-template.md` §6). What each part demonstrates:

- **The cascade did real work.** Knuth's optimization plausibly answers **S1 `proof`** (the quadrangle inequality is a genuine proof obligation) and **S2 `optimization`** (it accelerates a correct recurrence). The order says S1 fires first — but §1.1 says a technique needing two skills is **two nodes**. So: `cl-4.knuth-optimization` (`optimization`, the application) and `cl-4.quadrangle-inequality-proof` (`proof`, the argument). **This is the schema's central rule working on its hardest case**, and it is the exact analogue of `D-F4` §3.2's "LIS O(n²) is CL-1, LIS O(n log n) is CL-4 — different nodes".
- **The root edge is drawn** straight from CL-4 onto a `cl-1.` id. Not a declaration.
- **The base DP is declared.** SUB-6 cannot see `cl-2-combinatorial.yaml` — SUB-4 hasn't written it. `to_node: "cl-2.interval-dp"` is a **prediction**; `to_name: "Interval DP"` is what SUB-12 actually resolves on.
- **`status: "provisional"`**, because no ledger entry adjudicated it. A mapper cannot self-promote.
- **`difficulty_dimensions: {}`**, because the dimension set is `INC-S3`, owner SUB-7. The mapper does not invent.

## 4. What the dry-run actually changed

**A dry-run that changes nothing was not run honestly.** Three things it caught, all fixed before landing:

1. **Root edges would have been cross-cluster declarations.** The first pass followed NEU-932 `03_…` §4 rule 4 literally: any cluster-spanning edge goes to SUB-12. Authoring the specimen exposed the consequence — **DR-5 fails**, because the chain would not bottom out until integration, so the floor audit could not run on the mappers' own output and *"the graph has a defined floor"* would be false during the entire mapping phase. Fixed by `D-S4` (draw roots directly), with the cost recorded as `X-S1` and the SUB-12 duplicate-edge warning shipped as **R5**.
2. **`to_node` alone is not resolvable.** The first attachment shape had `to_node` and no `to_name`. Writing the specimen made the problem obvious: **SUB-6 cannot look up CL-2's ids, because CL-2's file does not exist yet.** `to_node` is a *guess*. An exact-id-match resolver would silently drop real dependencies. Fixed by making **`to_name` required** and telling SUB-12 (R2, and the file header) to resolve on `to_name` + `to_cluster` + `rationale`, and to report unresolvables as gaps rather than deleting them.
3. **The specimen was going to be one node.** The natural first draft was a single `cl-4.knuth-optimization` typed `"optimization"`, with the quadrangle inequality mentioned in the summary. That is **exactly the topic-list failure the charter forbids**, produced accidentally, by the schema's own author, on the first try. It is now §1.1's headline rule, the template's self-check item #2, and this specimen's main lesson — because if the schema's author defaults to it, five mappers under time pressure certainly will.

**Point 3 is the most valuable output of this dry-run**, and it is the strongest argument that a desk-check is worth running even though it cannot replace a real handoff.

## 5. What this dry-run cannot tell you

Stated plainly, so no downstream reader over-reads it:

- **It is not a cold handoff.** Author and checker are the same task. `INC-D1` / `CAP-4`, inherited from NEU-932 and carried undiminished. **OUT-9 supersedes this.**
- **It tests one specimen.** Chosen as the hardest available case, but one. The schema is stress-tested, **not exhaustively exercised** — the same limitation NEU-932 recorded as `CAP-5` for its partition rule (19 examples, not the full space).
- **It cannot test comprehension.** It proves the schema **can express** the required distinctions. Whether a cold mapper **reads** `roots`-vs-`cross_cluster_attachments` correctly under time pressure is unmeasured. The mitigation is redundancy — the distinction is stated in the map README, `manifest.yaml`'s `edge_disposition`, the schema, the template's §4, every cluster file's header, and the template's self-check. **Redundancy is a mitigation, not evidence.**
- **It measures no learning.** `X-D3` (the DP-transfer gap, non-downgradable High) is untouched. Nothing in C005 measures DP learning, and a prerequisite edge remains a **structural claim, not a validated learning claim**.

## 6. The one thing most likely to be wrong

Recorded explicitly rather than left for a reader to discover — mirroring NEU-932 `06_caps` §4.

**`D-S4` — drawing root edges directly instead of declaring them — is the load-bearing judgment call in this package.**

It refines a literal reading of a NEU-932 rule (`X-S1`), and the argument (§4.2) rests on *what rule 4 is for* rather than what it says. If the judgment is wrong, **the symptom will be an audit reporting a flood of "missing cross-cluster edges" that are really root edges**, or SUB-12 re-drawing them and duplicating every floor edge in the graph.

**The detection mechanisms are live and shipped**: **R5** in `edges/cross-cluster.yaml` (SUB-12's most likely wrong turn, named at the point of use), `manifest.yaml`'s `edge_disposition` block (so an audit classifies by **field, not endpoint span**), and check **V-7**. Named here so the signal is recognized as **`D-S4` being wrong** rather than as a scatter of individual audit failures.

**The runner-up:** the eight-type cascade's **S2/S5 boundary** (`optimization` vs `strategic`). It is deliberately the same test as `D-F4`'s T1 so that a CL-4 node's skill type and cluster agree by construction — which means **if `D-F4`'s T1 ordering is wrong (NEU-932's own "most likely to be wrong"), this schema inherits the error**. The coupling is deliberate and is recorded here rather than discovered later: the symptom would be `D-S1a` entries **and** U4 challenges concentrating on the same CL-3/CL-4 boundary at once.
