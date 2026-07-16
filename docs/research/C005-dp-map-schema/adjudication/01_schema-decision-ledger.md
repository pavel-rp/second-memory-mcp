# Schema Decision Ledger

**Task:** NEU-933 · **Compiled:** 2026-07-16 · **Extends (references, never rebuilds):** `../../C005-product-foundation/adjudication/` (NEU-887 adjudication method and status discipline), following NEU-932's `../../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`

**This file is the sole source of truth for the status of every NEU-933 decision — and for the status of every node in the map.** No other file sets a status. Not the README, not `manifest.yaml` (which carries the legend but adjudicates nothing), not a node's YAML.

**A downstream sub-task that wants a status changed files a challenge here. It never re-decides locally.**

---

## 1. Status values (inherited from NEU-887 — not redefined)

| Status | Meaning for a downstream consumer |
| --- | --- |
| **settled** | Binding. Adjudicated on correctly-classed evidence. Consume it; do not re-derive it. Change requires a ledger entry. |
| **provisional** | Recorded and usable but **not binding**. Carries a named revision trigger. A consumer relying on it must surface that reliance. |
| **unresolved** | Known open, with a named owner. A consumer **must not invent a value**. |

## 2. The ledger

| Id | Decision | Status | Evidence | Rejected alternatives recorded | Revision trigger | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| **D-S1** | **The node/edge schema** — `node_kind` (knowledge/skill), the eight-value closed `skill_type` vocabulary, the ordered first-match-wins typing cascade S1→S8, prerequisite-edge semantics free across knowledge/skill, and the four prerequisite fields (three drawn, one declared). **Resolves NEU-932's `D-F3a`.** | **settled** | `../01_node-and-edge-schema.md`; demonstrated by the 8 worked roots; desk-checked by `../dry-run/00_schema-usability-dry-run.md` (7/8 pass, 1 deferred as `INC-D1`, inherited) | ✅ 4 recorded — multi-valued `skill_type`; an open/extensible skill vocabulary; an unordered set of type definitions with no cascade; edges constrained by node kind | **>10 `D-S1a` entries accrue** at the coverage audit — signals the cascade needs revision rather than `conceptual` absorbing drift (mirrors `D-F4`'s `>10 U2` trigger). Or a mapper cannot express a real node in the schema. | This task; challenges via any mapper |
| **D-S1a** | Skill-type assignment for **specific indeterminate skill nodes** (Convention S). **No entries yet** — the map has no technique node. | **provisional (open slot)** | — | — | Filed by a mapper when a skill node's type cannot be confidently determined. **See §3 for the filing route.** | SUB-3/4/5/6/13 |
| **D-S2** | **The 8 DP first-principle root nodes** — the charter's four principles, each as a knowledge node + the skill node it licenses, typed, frozen, in `nodes/cl-1-foundational.yaml`. | **settled** | `../02_terminal-floor.md` §2, self-check FC-1…FC-3, FC-10; class 1 `[literature]` | ✅ 3 recorded — a single "DP fundamentals" node; one node per principle (no knowledge/skill split); a separate `nodes/roots.yaml` outside CL-1's file | A mapper demonstrates a DP technique whose prerequisite chain **cannot** terminate on any of the 8 roots and is not a boundary-anchor case. Or the charter's principle set changes. | This task; challenges via any mapper |
| **D-S3** | **The assumed-knowledge boundary register** `1.0.0` — 5 sanctioned non-DP anchors (segment tree, Li Chao tree, convex-hull/envelope geometry, modular arithmetic, linear algebra), named and versioned, **none decomposed**. | **settled** | `../02_terminal-floor.md` §3, self-check FC-4…FC-8, FC-11…FC-12; class 1 `[literature]` | ✅ 2 recorded — folding Li Chao into `anchor.segment-tree`; pre-emptively registering anchors the spec does not name (would invent scope) | **An AR-1 request is filed** (§3) — the register is **not asserted complete** (`INC-S1`). Or an anchor's scope needs changing (a MAJOR `register_version` bump, because every dependent's terminal shifts meaning). | This task; requests via any mapper |
| **D-S4** | **Root edges are DRAWN directly by every mapper**, via `prerequisites.roots`, not declared for SUB-12 — even though roots carry `cl-1.` ids and therefore span clusters by a naive endpoint test. | **settled** | `../01_node-and-edge-schema.md` §4.2 — a four-part argument from what NEU-932's rule 4 is *for* (a visibility problem roots do not have) | ✅ recorded — routing root edges through SUB-12 as cross-cluster declarations (**rejected: the floor would not exist until integration, so the floor audit could not run on the mappers' own output**) | NEU-932's author, or an audit, rejects the refinement. **Carried as `X-S1`** rather than treated as settled-by-silence. | This task; SUB-12 and the dependency audit are affected parties |
| **D-S5** | **The register extension** — NEU-887's taxonomy, materiality rule, status values, relation vocabulary, and marker discipline extended by reference to the DP map; only `-S`-namespaced ids added. | **settled** | `../04_register-extension.md`, self-check RE-1…RE-12; `../traceability/01_schema-evidence-register.md` | ✅ 2 recorded — a DP-specific evidence class; a DP-specific materiality rule (**both considered and declined**, §2.1 there) | An audit finds NEU-887 machinery re-derived rather than referenced. | This task; the register-completeness audit |

## 3. Open filing routes — seeded for the sub-tasks that come next

**This is the skeleton SUB-11 later drives.** Each route names its owner and its procedure **in advance**, so a mapper never has to invent one mid-task. A route that exists is a route that gets used; an unnamed one becomes a silent local decision.

| Route | Who files | When | Procedure | Interim state |
| --- | --- | --- | --- | --- |
| **`D-S1a`** — indeterminate skill type (Convention S) | Any mapper | A skill node's type cannot be confidently determined by the S1→S8 cascade | Assign the **best candidate** (the type is mandatory), state the indeterminacy and name the rival type in `skill_type_rationale`, add a `D-S1a` row here with a **named re-adjudication trigger** | Node `status: "provisional"` |
| **`AR-1`** — anchor request | Any mapper | A real non-DP prerequisite has no registered anchor | File against `D-S3` naming: the anchor, the dependent node, and **why the prerequisite is genuinely non-DP** (why NEU-932's cascade doesn't own it) | Node `status: "provisional"`; dependency recorded in `notes`. **Never** invent an anchor, fake a root edge, declare it cross-cluster, or drop it |
| **`D-F4a` U4 challenge** — cluster misassignment | Any mapper | A technique is believed misassigned across clusters | File against `D-F4a` (or `D-F4`) in **NEU-932's** ledger — not this one. Convention U4: **the existing assignment stands until adjudicated, and the technique stays mapped.** The map never has a hole while an argument is in progress | Existing assignment holds |
| **`D-S1`/`D-S2`/`D-S3` challenge** — the schema itself | Any mapper | The schema cannot express a real node; a chain cannot reach the floor | File here with the **specific node** that cannot be expressed. **Never** locally redesign — five sub-tasks are scoped to this schema | Node `status: "provisional"` |

**Known request already foreseen** (`INC-S1`): SUB-5 is expected to file **AR-1** for Aho–Corasick / string-matching automata, the non-DP prerequisite of automaton DP (CL-3 by `D-F4` §3.2). Named here in advance so it is a **predicted filing, not a surprise**.

## 4. Incomplete-state markers (`INC-S#`)

Namespaced `-S` so they never collide with NEU-887's `INC-1…5`, NEU-888's `INC-I#`, or NEU-932's `INC-D#`. Each names a **missing artifact with an owner** — reported, never invented (NEU-899 rule 4, inherited).

| Marker | Missing artifact | Owner |
| --- | --- | --- |
| **INC-S1** | **A boundary register complete over the technique space.** The register is exactly the spec's sanctioned 5 anchors; the technique space does not exist yet (`INC-D3`), so completeness is unprovable now. Route **AR-1** exists precisely for this. **Foreseen case: Aho–Corasick** (automaton DP's non-DP prerequisite) is not registered — the spec doesn't name it and the register invents nothing. | The five mappers, via AR-1 |
| **INC-S2** | **The JSON Schema validator and the index generator.** NEU-932 `D-F3` §5 assigns both to SUB-2; deferred because a validator over **zero technique nodes** is tested only against the specimens that authored it — the weakest possible evidence. The 18 checks it must enforce are specified (`../01_…` §6) so the deferral loses no content. Index-drift is already an open cost on `D-F3`. | Coverage-audit sub-task (OUT-7) — the first consumer needing mechanical validation and index freshness |
| **INC-S3** | **The difficulty-dimension set.** The schema fixes the *shape* (`difficulty_dimensions: map<string, string\|number\|null>`); the dimension set itself is **unresolved**. Mappers write `{}` and **must not invent dimensions** (NEU-887: a consumer must not invent a value). | SUB-7 (OUT-3) |

## 5. Carried conflicts (preserved, not smoothed)

| Id | Conflict | Disposition |
| --- | --- | --- |
| **X-S1** | **`D-S4` refines NEU-932's `03_…` §4 rule 4.** Read literally, rule 4 sends every root edge (which spans CL-1) to `edges/cross-cluster.yaml`. `D-S4` rejects that reading and draws root edges directly. | **Carried, not treated as settled-by-silence.** The argument is `../01_…` §4.2. **The honest cost is live**: an audit classifying edges by *endpoint span* will report root edges as false-positive missing cross-cluster edges. Two mitigations shipped: **R5** in `edges/cross-cluster.yaml` warns SUB-12 that re-drawing them **duplicates every floor edge**, and `manifest.yaml`'s `edge_disposition` block lets an audit classify by **field, not span**. If NEU-932's author disagrees, the route is a challenge against `D-S4`. |
| **X-D1** | **SOS DP: CL-4 vs CL-3** (inherited from NEU-932). T1 and T2 both plausibly fire. | **Carried undiminished.** Adjudicated to CL-4 by rule order, logged `D-F4a` **provisional**, CL-3's claim live, U4 route named. NEU-933 **does not touch it** — no cluster assignment is NEU-933's to make. Surfaced in the three places a mapper will actually look: CL-3's file header, CL-4's mainstream file header, and §3's U4 route. |
| **X-D2** | **Naming instability across references** (inherited). The same technique carries different names by tradition. | **Carried.** Not resolved here. The schema's optional `aliases` field gives mappers a place to record synonyms so **OUT-7 does not read a naming difference as a coverage gap** — a mitigation, not a resolution. |
| **X-D3** | **Inherited NEU-887 R1 — the DP-transfer gap.** No selected corpus is ordered by *learning* dependency. Non-downgradable High. | **Carried undiminished.** Directly binding on this schema: **a prerequisite edge is a structural claim, not a validated learning claim.** Nothing in C005 measures DP learning. The map must not import any corpus's ordering as a prerequisite claim, and `coverage.corpus_refs` is a **reference**, never evidence of a prerequisite. |

## 6. Node status discipline (what this ledger means for the map)

**The map's YAML reflects this ledger; it never overrides it.**

- **A mapper may not promote its own node to `"settled"`.** The correct default for a mapped node is **`"provisional"`** — not a weakness, but the map's honesty.
- **`"settled"` today: the 8 roots (`D-S2`), and nothing else.** No technique node exists.
- **`adjudicated_at_map_version`** records the `map_version` at which a node's status was last adjudicated, so a reader tells settled-and-current from settled-long-ago-under-an-older-schema.
- **`"unresolved"` names an owner and invents no value.**

## 7. Self-check

| Check | Passing condition | Result |
| --- | --- | --- |
| **AC-1-S2** | Every material NEU-933 decision has exactly one ledger row. | **Pass** — 6 rows (`D-S1`…`D-S5`, `D-S1a`). |
| **AC-2-S2** | Every settled decision records its rejected alternatives. | **Pass** — 5/5 settled rows. |
| **AC-3-S2** | Every non-settled item names an owner and a trigger. | **Pass** — `D-S1a` (open slot), `INC-S1`…`INC-S3`. |
| **AC-4-S2** | No status is set outside this file. | **Pass** — every topic file's header defers here; `manifest.yaml` carries the legend but adjudicates nothing. |
| **AC-5-S2** | No NEU-887/NEU-888/NEU-932 machinery is re-derived. | **Pass** — `../04_register-extension.md` RE-1…RE-12; only `-S`-namespaced ids added. |
| **AC-6-S2** | Conflicts are carried, not smoothed. | **Pass** — `X-S1`, `X-D1`, `X-D2`, `X-D3`, §5. |
| **AC-7-S2** | No class-1–6 evidence is presented as class 7. | **Pass** — no external-user, expert, or market claim anywhere. |
| **AC-8-S2** | `D-F3a` — assigned to SUB-2 by NEU-932 — is resolved. | **Pass** — resolved by `D-S1`. NEU-932's constraints on it are all honoured: `status` required with three legal values; `adjudicated_at_map_version` required; string enums quoted; no field holds verbatim external content (`D-F5`). |
| **AC-9-S2** | NEU-933 makes no family-mapping and no progression decision. | **Pass** — zero technique nodes authored; root-internal edges minimal and structural, explicitly not a progression (`../02_…` §2.3); `difficulty_dimensions` left `{}` for SUB-7. |
| **AC-10-S2** | The filing routes SUB-11 drives are seeded with owners and procedures. | **Pass** — §3: `D-S1a`, `AR-1`, U4, schema challenge. |
