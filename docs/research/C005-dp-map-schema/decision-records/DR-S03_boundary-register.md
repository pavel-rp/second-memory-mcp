# DR-S03 — The Assumed-Knowledge Boundary Register

**Decision:** `D-S3` · **Task:** NEU-933 · **Status:** settled (see `../adjudication/01_schema-decision-ledger.md` — this record does not set status) · **Compiled:** 2026-07-16

---

## The decision

> **A versioned register (`boundary-register.yaml`, `register_version: "1.0.0"`) naming exactly the five sanctioned non-DP prerequisite anchors the spec lists — `anchor.segment-tree`, `anchor.li-chao-tree`, `anchor.convex-hull-envelope-geometry`, `anchor.modular-arithmetic`, `anchor.linear-algebra`. Named and versioned. NONE decomposed. Drawn directly by mappers, never declared. Not asserted complete — route AR-1 exists for the gap.**

Full statement: `../02_terminal-floor.md` §3.

## Rationale

**A registered anchor is a sanctioned terminal, not a jump. That is the entire point.** Without the register, a CHT node's dependency on envelope geometry is a chain that *stops* — **indistinguishable from a mapper who quit early**. With it, the same edge is a positive assertion: *this dependency is real, it is non-DP, it is deliberately outside our audience line, and here is its name and version.* Registration converts "this chain just ends" (an omission) into "this chain bottoms out somewhere we deliberately don't go" (a decision). **The floor audit can tell those apart — which is the property the whole floor exists to buy.**

**The boundary is the charter's audience line, and it is defended in both directions.** Anchors sit **outside** NEU-932's DP partition and **at or above** NEU-887's elementary floor. NEU-932 `D-F4` §1 already routes them outward — *"A mapper that finds itself wanting to assign a cluster to 'segment tree' has crossed the boundary and should register an anchor instead"* — and this register is the other side of that instruction.

**Named and versioned, never decomposed.** Decomposing `anchor.segment-tree` into build/query/lazy-propagation and *their* prerequisites is a **general-algorithms concern outside the audience line**. That is the "bottomless" failure: the map quietly becomes a general CS curriculum and the DP map dilutes into it. `decomposed: false` is asserted on every anchor so an audit **checks** the boundary held rather than trusting it, and no `prerequisites` field exists on an anchor at all.

**Versioning is not ceremony.** Anchor references are version-pinned (`anchor.modular-arithmetic@1.0.0`). If an anchor's scope later changes, **every dependent's terminal shifts meaning** — a node that terminated on "modular arithmetic" meaning inverses now terminates on something else. MAJOR bump; the pin makes it **detectable rather than silent**. Adding an anchor is MINOR: existing terminals are unaffected.

**Drawn, never declared.** The spec is explicit that anchors are *"drawn directly by family sub-tasks, never declared for the integration pass."* They exist in the shared floor from the start, so **there is nothing for SUB-12 to resolve.** Same mechanic as roots, same reason: *draw to what exists; declare what doesn't.*

## Rejected alternatives

| Alternative | Why it was plausible | Why rejected |
| --- | --- | --- |
| **Folding Li Chao into `anchor.segment-tree`** | The spec writes "segment / Li Chao trees" as one phrase, so one anchor is the obvious reading. A Li Chao tree *is* a segment-tree variant. One fewer row. | Rejected on **lost distinction in every dependent.** A CHT node depending on `anchor.segment-tree` says materially less than one depending on `anchor.li-chao-tree` — the Li Chao structure is the specific thing it needs, and a reader (or an audit) cannot recover which was meant. Folding costs a real distinction **in every dependent**; splitting costs **one register row**. The distinction was kept. Recorded so a reviewer sees the choice was made rather than assumed. |
| **Pre-emptively registering anchors the spec does not name** (Fenwick trees, Aho–Corasick, monotonic deques, number theory at large) | Mappers will hit these — **`F-S-3` already predicts Aho–Corasick.** Registering now avoids a round-trip and looks helpful. | **Rejected: it invents scope under cover of helpfulness.** The spec sanctions a specific set. Adding to it would make the boundary **a matter of each author's judgment rather than a decision** — and the boundary is exactly the thing this register exists to fix in place. It would also be unfalsifiable guessing: without the technique inventory (`INC-D3`), "which anchors are needed" is not knowable, so a pre-emptive list would be **partly wrong and fully authoritative** — the worst combination. Instead: the gap is **declared** (`INC-S1`), the route is **named** (`AR-1`), and the foreseen case is **called out by name** (Aho–Corasick, `F-S-3`) so SUB-5 meets it as a predicted filing rather than a surprise. |
| **Asserting the register complete** | Cleaner. Downstream reads a closed set and never has to file anything. | **Rejected: it would be false, and falsifiably so.** The technique space does not exist yet (`INC-D3`), so completeness is **unprovable now** — and `F-S-3` already names a counterexample. Asserting it would be exactly the "smoothed gap" NEU-887's discipline forbids. `CAP-S4` / `INC-S1` record it instead. |
| **Letting mappers register anchors locally, ad hoc** | Fastest. No round-trip. The mapper knows its own needs best. | Rejected on the **versioning and audit** properties that make the register worth having. Five mappers run in parallel and cannot see each other's files: two would register the same anchor under different names, or one would register something that is actually DP and belongs in a cluster. A local anchor is **invisible to every other mapper and to the floor audit** — which turns the register from a shared boundary into five private ones. AR-1 keeps the boundary a **decision** rather than an accumulation. |

## The forbidden moves (why AR-1 exists)

A mapper needing an unregistered anchor **must not**:

1. **Invent an anchor locally** — invisible to every other mapper and to the audit.
2. **Fake it as a `prerequisites.roots` edge** — **launders a non-DP dependency into the DP floor.** This is precisely what the floor audit hunts, and it is the most tempting shortcut because it makes the chain bottom out and the node *look* finished.
3. **Declare it as `cross_cluster_attachments`** — anchors are not sibling-cluster nodes; SUB-12 resolves against clusters and will report it unresolvable.
4. **Drop it silently** — a smoothed gap. Forbidden by NEU-887's discipline, inherited.

**Instead: AR-1.** File against `D-S3` naming the anchor, the dependent node, and **why the prerequisite is genuinely non-DP** (why NEU-932's cascade doesn't own it). Meanwhile: `notes` records the dependency and the node goes `status: "provisional"`. **The dependency stays visible the whole time.**

## Status and revision trigger

**Status:** settled. Set only in the ledger.

**Revision trigger:** **an AR-1 request is filed** — the register is **not asserted complete** (`INC-S1`), so a request is the register working, not failing. Or an anchor's scope needs changing (a MAJOR `register_version` bump, because every dependent's terminal shifts meaning).

**Expected first exercise:** SUB-5 filing AR-1 for Aho–Corasick / string-matching automata (`F-S-3`, `INC-S1`).

## Evidence and its honest class

`F-S-2` (class 1 `[literature]`) establishes these anchors are **non-DP and outside the partition**, resting on NEU-932 `04_…` §1 and §3.2, which route envelope geometry, Li Chao trees, and linear algebra outside the partition explicitly.

**Recorded limitation:** `F-S-2` establishes the anchors are **correctly outside the partition**. It does **not** establish the register is **complete** over the technique space — that space does not exist (`CAP-S4`, `INC-D3`). `F-S-3` is a **negative result**: it records a *foreseen absence* (Aho–Corasick) rather than asserting the register covers everything, and it is an argument from the spec's enumeration, **not** a proof that no further anchor is needed.
