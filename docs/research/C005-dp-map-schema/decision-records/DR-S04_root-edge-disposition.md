# DR-S04 — Root Edges Are Drawn, Not Declared

**Decision:** `D-S4` · **Task:** NEU-933 · **Status:** settled (see `../adjudication/01_schema-decision-ledger.md` — this record does not set status) · **Carried as:** `X-S1` · **Compiled:** 2026-07-16

> **⚠ This is the highest-blast-radius record in the package, the load-bearing judgment call, and the thing most likely to be wrong (`../05_caps-and-incomplete-scope.md` §4). It refines a literal reading of a NEU-932 rule. It is recorded loudly rather than slipped in.**

---

## The decision

> **A prerequisite edge onto a DP root node is DRAWN directly, by every mapper, from its own file, via `prerequisites.roots` — even though roots carry `cl-1.` ids and therefore span clusters by a naive endpoint test. Root edges are NOT declared as cross-cluster attachment points and are NOT SUB-12's to draw.**

## The tension, stated fairly

The roots live in `nodes/cl-1-foundational.yaml` and carry `cl-1.` ids. So the edge

```
cl-3.plug-dp → cl-1.root.formulate-state-transition-base-case
```

**spans two clusters.** And NEU-932 `03_representation-format.md` §4 rule 4 reads, literally:

> *"Edges whose endpoints span clusters go in `edges/cross-cluster.yaml`, owned solely by the integration sub-task."*

**Read literally, every root edge in CL-2, CL-3, and CL-4 would be a declaration for SUB-12 to resolve.** That reading is coherent, it is what the words say, and this record rejects it. So the rejection needs an argument, not an assertion.

## The argument — four parts

**1. Rule 4 solves a VISIBILITY problem that roots do not have.**
SUB-12 exists because parallel mappers **cannot see each other's nodes**. That is the entire content of the constraint: resolve references to things that didn't exist when they were referenced. When SUB-6 declares an attachment onto CL-2's interval DP, SUB-4 has not written that file — there is no id to point at, so the reference must be **deferred**. **Roots do exist**: frozen, authored before any mapper starts, with stable published ids. **There is nothing to defer.** Routing them through SUB-12 would be ceremony that buys zero coordination and costs a whole integration hop.

**2. The floor would not exist until integration — which breaks the acceptance bar.**
The spec's acceptance scenario: *"when a mapping sub-task attaches a prerequisite chain downward, then it terminates on either an explicit DP root node or a registered boundary anchor."* That is a claim about **map time**. If root edges were declarations, **no chain would bottom out until SUB-12 ran** — the floor audit could not run on the mappers' own output, and *"the graph has a defined floor"* would be **false for the entire mapping phase**. **A floor that isn't reachable while mapping isn't a floor.** This is the decisive argument, and the dry-run found it by failing **DR-5** on the first pass.

**3. It breaks no file ownership.**
The edge is written in the **depending node's own file**, pointing at a frozen id. CL-3's mapper writes only `cl-3-state-compression.yaml`. **Nobody touches CL-1's file.** NEU-932 `03_…` §4 rule 1 — *"a sub-task writes only its own file"* — holds **exactly**. The parallelism guarantee is untouched.

**4. It is symmetric with anchors, and the asymmetry would be arbitrary.**
Anchors are unambiguously **drawn** — the spec says so directly. Roots have **identical mechanics**: shared, frozen, present from the start, stable published ids, nothing to resolve. The *only* difference is that a root id happens to carry a `cl-1.` prefix while an anchor id carries `anchor.`. **Treating two mechanically identical situations differently because of a naming prefix would be arbitrary** — and it would teach mappers that the drawn/declared line tracks *id shape* rather than *existence*, which is exactly the wrong lesson.

**The underlying principle, which both roots and anchors obey:** *draw an edge to anything that already exists; declare an attachment to anything that doesn't.*

## Rejected alternative

| Alternative | Why it was plausible | Why rejected |
| --- | --- | --- |
| **Route root edges through SUB-12 as cross-cluster declarations** (the literal reading of rule 4) | It is **what rule 4 literally says**. It needs no refinement, no carried item, and no argument. It keeps one simple mechanical test — "do the endpoints span clusters?" — instead of a rule about existence. It is the conservative reading, and conservatism about a sibling task's decisions is usually right. | Rejected on **argument 2, which is decisive**: the floor would not exist until integration, so the spec's acceptance scenario would be false during the whole mapping phase and the floor audit could not run on the mappers' output. Also rejected on cost: it would push **every root edge in three clusters** — likely the majority of all edges in the map — through a single integration bottleneck, to resolve references that were never ambiguous. And it would make SUB-12's input a mix of genuinely-deferred references and trivially-resolvable ones, obscuring the real integration work. |

## The honest cost, recorded rather than hidden

**A naive audit that classifies edges by ENDPOINT SPAN will see root edges as cross-cluster edges SUB-12 failed to draw, and report false positives.** This is a real cost of the decision, not a hypothetical.

**Three mitigations, all shipped, none aspirational:**

1. **`edges/cross-cluster.yaml` R5** — warns SUB-12, **at the point of use**, not to re-draw root edges, and states the consequence: **re-drawing duplicates every floor edge in the graph** and corrupts the dependency and path audits. Placed in the file SUB-12 opens first.
2. **`manifest.yaml`'s `edge_disposition` block** — states the drawn/declared classification in **machine-readable** form, so an audit classifies **by FIELD** (`prerequisites.roots` vs `cross_cluster_attachments`) rather than by endpoint span. **Classify by field, not by span.**
3. **Check `V-7`** — no `prerequisites.*` target may be in a different, non-root cluster, so a genuinely-drawn cross-cluster edge (which *would* be a violation) is still caught.

## Why this is a refinement and not an overreach

NEU-932 `03_…` §5 explicitly grants SUB-2 **"the edge schema and prerequisite-edge semantics"** (`D-F3a`, left unresolved *by design*). Edge disposition is squarely inside that grant. **But** rule 4 sits in `D-F3`'s own file, in the section that discharges the parallelism constraint — so the grant and the rule overlap, and this decision reads the overlap in favour of rule 4's **purpose** over its **wording**.

**That is a judgment, and judgments get recorded, not assumed.** Hence `X-S1` in the ledger's carried-conflicts table rather than a silent implementation. **If NEU-932's author or an audit disagrees, the route is a ledger challenge against `D-S4` — not a local redesign**, because five sub-tasks are scoped to this schema.

## Status and revision trigger

**Status:** settled. Set only in the ledger.

**Revision trigger:** NEU-932's author, or an audit, rejects the refinement. **Carried as `X-S1`** so it is visible to the audits rather than discovered by them.

**Predicted failure signal** (`../05_caps` §4): an audit reporting a **flood** of "missing cross-cluster edges" that are really root edges, **or** SUB-12 re-drawing them and duplicating every floor edge. Named here so the signal is recognized as **`D-S4` being wrong** rather than as a scatter of unrelated audit failures.

## Evidence and its honest class

None of the empirical kind — and that is stated rather than dressed up.

**Declared at `SOC-7-S2`: `D-S4` is a DESIGN DECISION.** It rests on an argument about **what a sibling task's rule is for**, plus the dry-run's **DR-5** failure on the first pass (`dry-run/00_…` §4, finding 1) — which is class-2 `[code-evidence]` about **this package's own specimen**, not evidence about the world. No `F-S-*` row claims otherwise. Its justification is the four-part argument above, and it is auditable **as argument**.
