# 06 — Caps and Incomplete Scope (NEU-944)

**Task:** NEU-944 (SUB-11) · **Package version:** `1.0.0` · **Compiled:** 2026-07-16

**What this task did not do, could not do, and deliberately declined to do.** Namespaced `-P` so these
never collide with NEU-887's `INC-1…5`, NEU-888's `INC-I#`, NEU-932's `INC-D#`, NEU-933's `INC-S#`, or
NEU-942's `INC-C#`. **Each names a missing artifact with an owner — reported, never invented** (NEU-899
rule 4, inherited).

---

## 1. This task's own incomplete-state markers

| Marker | Missing artifact | Owner |
| --- | --- | --- |
| **`INC-P1`** | **The JSON Schema validator over the schema's 18 structural checks** (`../C005-dp-map-schema/01_node-and-edge-schema.md` §6). **NEU-944 did not build it and does not pretend `INC-S2` is closed.** **Why:** NEU-943's `validator/audit-graph-integrity.mjs` already enforces the invariants a consumer depends on — acyclicity, grounding, referential integrity, union-completeness, OUT-6 — and **passes 28/28**. A second, schema-shaped validator would duplicate it under an assembly spec. **What NEU-944 DID build** is the index-class half: a **generated** 187-node cross-reference view + the package gate. **`INC-S2` is therefore closed to a PARTIAL, and the unbuilt half is named here.** | The `INC-C1` CL-4 completion task, or a later map-maintenance charter — **whichever next writes the graph** |
| **`INC-P2`** | **`index/00_technique-index.md` is still stale** — it reads *"scaffold — no DP family node exists yet"* over a **187-node** map. **NEU-944 did NOT overwrite it:** its `sole_writer` is `"generator only"` and its regeneration is `INC-S2`'s to close, not an assembler's to seize. **`01_cross-reference-view.md` supersedes it FOR CONSUMERS** (it is a strict superset: every node, plus six facets the index never carried). **The stale file remains a live trap for anyone who opens it first** — which is why the package README routes readers to the view and says the index is stale. | `INC-S2`'s owner |
| **`INC-P3`** | **A node-level coverage verdict** (`INC-C7` in the ledger). All **179** nodes read `coverage.status: "unaudited"`. **Nobody erred** — NEU-942 adjudicated coverage at the **map** level and correctly wrote no node file. **NEU-944 invented no per-node verdict**: producing a coverage verdict is out of scope, and 179 verdicts minted by an assembler is precisely the fabrication the status discipline forbids. **Consequence, stated plainly: one-hop recovery of the COVERAGE facet is thinner than the other six** — the consumer recovers an *explanation*, not a *verdict*. | A coverage write-back pass — the creator, or the `INC-C1` completion task |
| **`INC-P4`** | **A second reader.** The cold-context dry-run (`05`) was **run by the same agent that built the package**. **This is a real weakness and is not dressed up:** an author simulating a cold reader shares the author's blind spots by construction. **Mitigation, not a fix:** `PG-6c` makes one-hop recovery a **mechanical** property (1253 facet checks) rather than a judgment, so the *structural* claim does not rest on the simulation. **The judgment calls — is the warning prominent enough? is the prose actually clear cold? — remain unvalidated by an independent reader.** | The first real downstream curriculum-production agent. **Its handoff experience is the real test** |

---

## 2. Caps inherited and NOT closed here

**None of these is closable by an assembly task. Listed so the package's limits are not mistaken for
the map's limits.**

| Cap | Why it does not close here |
| --- | --- |
| **`R1` / `X-D3`** — DP-transfer effectiveness | **Non-downgradable High. Nothing in C005 measures DP learning.** No corpus is ordered by *learning* dependency. **Carried undiminished. This package does not present the graph order as measured for DP** and says so in `02_…` §3.3 and `05` §10. |
| **`CAP-2`** — problem-level citations unverified | **Codeforces 403'd.** Refs are **corpus-level only**. **NEU-944 invented no citation** and upholds the two mappers' withdrawals. **Cannot close without corpus access.** |
| **`JS-U2`** — performance verdicts directional | No benchmark was run. **An assembler cannot benchmark its way out of this**; it can only refuse to present a directional verdict as measured, which `01`'s per-node JS block does explicitly. |
| **`JS-U1`**, **`JS-U3`**, **`JS-U5`** | `JS-U1`'s natural home is a **frozen root** NEU-944 may not write either. `JS-U3` is unassessable **because the nodes do not exist** (`INC-C1`). |
| **`INC-S1`** — register not asserted complete | **6 `AR-1` requests are open.** Adjudicating them is `D-S3`'s owner's, not an assembler's. |
| **`X-S1`** — `D-S4` vs NEU-932's rule 4 | **Carried, not settled-by-silence.** Only NEU-932's author can resolve it. The live cost — an audit classifying by **endpoint span** reports **223 false positives** — is restated as a binding consumer rule (`02_…` §3.1 `S3`). |

---

## 3. What NEU-944 deliberately DECLINED to do

**Each of these was available, would have made the package look more finished, and was rejected on a
named ground.** Recorded because a decision not to act is still a decision.

| Declined | Why |
| --- | --- |
| **Repair `F-943-1`** | **The fix is a re-run of NEU-940's depth computation over the edge-complete graph — and producing a progression stage or difficulty value is explicitly OUT of SUB-11's scope.** Every input needed is present and it would have been easy. **That is what makes the restraint load-bearing:** an assembler minting 26 difficulty values under an assembly spec is the exact category error the charter's ownership rules exist to prevent. **Bound as `D-P2` (unresolved, owner NEU-940) instead.** |
| **Decide `INC-C2` / `D-F4a`** | **No standing.** `D-F4a` lives in **NEU-932's** ledger, and Convention **U4 forbids local re-decision**. NEU-942 declined on exactly this ground; NEU-944 does not overturn that restraint by fiat. **The coverage verdict is identical either way — `INC-C2` only decides who fills the gap**, so deciding it would buy nothing and cost the discipline. |
| **Mint the 10 `INC-C1` nodes** | Out of scope, and **`INC-C2` has not decided which cluster owns SOS DP.** Minting them would invent nodes, stages, difficulties, prerequisites and materiality assessments wholesale. |
| **Delete the two dangling declarations** | **They are the map pointing at its own gap.** `05` §9.3 shows Scenario C **only passes because they are there** — deleting them would have made a known hole invisible and led a cold agent straight into inventing SOS DP. **The tidier map is the more dangerous one.** |
| **Rename the colliding `AR-1` ids** | **Map nodes cite `AR-1/a` and `AR-1/b` verbatim in `notes`.** A rename turns every citing note into a false claim (`CV-33`). **Fixed by ADDING a convention (`D-P4`), preserving both label pairs as aliases.** |
| **Overwrite `index/00_technique-index.md`** | `sole_writer: "generator only"`; its staleness is `INC-S2`'s. **Superseded for consumers, not seized.** (`INC-P2`) |
| **Mint 179 node-level coverage verdicts** | Out of scope, and it would fabricate 179 verdicts to make `INC-P3` look closed. **Filed as `INC-C7` instead.** |
| **Promote any node to `settled`** | **A mapper may not promote its own node, and an assembler may not promote 179.** The correct default for a mapped node is `provisional` — **the map's honesty, not a weakness.** **8 `settled` (the frozen roots), 179 `provisional`** is the accurate state and it ships that way. |
| **Write a second integrity validator** | The spec says **confirm, not re-derive**. A second implementation proves only that two scripts agree, and would quietly make an assembly task the author of an integrity claim it does not own. **The gate spawns NEU-943's validator instead.** |

---

## 4. Self-assessment — where this package is weakest

**Ranked. Stated because the charter's discipline is that the honest cost is live.**

1. **`INC-P4` — the dry-run had no independent reader.** The strongest claim in the package
   (*"a cold agent recovers a technique in one hop"*) was tested by the agent that built it.
   `PG-6c` mechanises the structural half; **the judgment half is unvalidated.**
2. **`F-943-1` shipped open on the field consumers reach for first.** The package mitigated in five
   places. **Mitigation was not repair, and a consumer that ignored all five would have mis-sequenced
   6 dependencies.** **NEU-954 has since repaired it and `F-943-1` is closed** (`D-R4`) — the
   weakness recorded here is that the package shipped mitigating a defect it could not fix, and that
   remains an accurate account of this package.
3. **`INC-P3` — the coverage facet is an explanation, not a verdict.** Six of OUT-9's seven facets
   resolve to a value. **The seventh resolves to a reason.**
4. **The package's value is entirely derivative.** It creates no knowledge. **If any of NEU-932…943 is
   wrong, this package binds the error faithfully and confidently** — `PG-4b` couples it to NEU-943 on
   purpose, and that coupling cuts both ways.
5. **`INC-P2` — a stale index still sits in the map** and a consumer who opens it first sees
   *"no DP family node exists yet"* over a 187-node graph. Routed around, not removed.
