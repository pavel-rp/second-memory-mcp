# 13 — The architecture-material rule, and the web tier's runtime, protocol style and rendering model

**Task:** NEU-982 (SUB-15) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-22
**Model:** claude-opus-5[1m]
**Covers:** `OUT-8` (its rule-and-client-tier half) · `OUT-10` (spike execution)
**Consumes:** `05_…md` (SUB-4 / NEU-974), `10_…md` (SUB-16 / NEU-979), `11_…md` (SUB-7 / NEU-980), `12_…md` (SUB-8 / NEU-981)
**Consumers:** SUB-9 (NEU-983), SUB-10 (NEU-984), SUB-11 (NEU-985), SUB-12 (NEU-986), NEU-896

---

## 1. What this chapter is, and what it is not

It is two things that had to arrive together.

**First, a classification rule** — a test a reader applies to a technology choice to decide whether
this package should make it. The rule has to exist before any technology record is written, because
without it the package either over-reaches into framework picks or stops so short that a downstream
charter has to invent a boundary. It is stated as an **applicable test**, not as a list, so a reader
can classify a choice this package never anticipated.

**Second, the three client-tier decisions the rule admits**: the web tier's runtime and language, the
API's protocol style, and the rendering model. These are **one trade rather than three**. The runtime
narrows the credible protocol styles; the rendering model constrains the protocol style; all three
argue from the same evidence base. Each interaction is recorded **at the decision it constrains**
(§9), not asserted afterwards.

**It is not** a wire contract, a framework selection, a substrate selection, or a repository
topology. §10 audits those stops as counts.

**It does not restate SUB-8's rule.** `12_…md` §5 publishes `R8-1`…`R8-5`, which classify *where a
capability lives* — public reusable core or private closed application, with a distribution
consequence. This chapter's rule classifies *whether a choice belongs in this package at all*. They
are different rules over different domains and they can both apply to one choice; §4.5 states the
relationship and works an example where they do.

---

## 2. The revisions this chapter resolved against

| Input | Revision resolved against |
| --- | --- |
| The authority matrix | `08_…md` + `10_…md`, revision **`post-validation`** (SUB-16 / NEU-979). Never SUB-13's pre-validation revision. |
| The component and boundary model | `05_…md` as merged (SUB-4 / NEU-974). **Not amended here** — see §11.2. |
| The web API's resource inventory | `11_…md` §9 as merged (SUB-7 / NEU-980). |
| The application-versus-core rule and compatibility contract | `12_…md` as merged (SUB-8 / NEU-981). |
| The codebase | Cutoff **`229e8f4`**, the `develop` head this branch was cut from. |
| Node runtime for the spike | **v22.23.1** (`SPK-S15-1`). |

**The compatibility surface is 46 tools / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`,
refining `F-S5-3`). The charter's "45 / 42" is a miscount. Every figure below that touches the tool
surface uses 46 / 43 / 3 / 49.

---

## 3. Vocabulary, disambiguated at first use

| Term | As used here |
| --- | --- |
| **Architecture-material** | The property this chapter's rule tests for. Defined in §4.1 and nowhere else. |
| **Web tier** | `CMP-S4-3` — the component that terminates the learner's web session, serves the learner-facing surface, and calls the MCP core. It does not exist in the repository today (§5.1). |
| **Runtime** | The execution environment a process runs in (here: Node, or an alternative), *together with* the language compiled for it. Not a framework. |
| **Protocol style** | The *shape* of the API's read and write surface — resource-addressed, procedure-named, or client-composed. **Not** an endpoint path, a payload schema, an error catalogue, a versioning scheme or a pagination model, none of which this package sets. |
| **Rendering model** | Where the learner-facing surface's markup is composed — on the server, in the browser, or in a mix — and what the browser is permitted to hold between compositions. |
| **Session** (qualified, per `00_…md` §4) | Always **web session** (`SC-S3-43`, the browser-held authenticated session) or **learning session** (`SC-S3-5`). Never bare. |
| **Gate-bearing** | `05_…md` §6.1's definition, consumed: a value that, if changed, changes whether the system permits something. |

---

## 4. The rule

### 4.1 The statement

> **A choice is architecture-material when changing it, on its own, would move a boundary, reassign
> an authority, or alter a compatibility contract.**
>
> **A choice reversible without any of those three moving is not architecture-material, and this
> package does not make it.**

This is the rule's canonical wording. `DR-C10-S15-1`'s Decision states it identically, word for word,
and any paraphrase elsewhere in this package is a paraphrase — the two authoritative statements are
this one and the decision record's.

The rule is only applicable if its three terms are bound to things a reader can look up. They are:

| Term | Resolves to | Where |
| --- | --- | --- |
| **a boundary** | A `BND-S4-*` row — its **existence**, its **pair**, or its **class** (`trust` / `process` / `neither` / `undecided`) | `05_…md` §4.2 |
| **an authority** | An **Authority cell** among the 45 rows `SC-S3-1`…`SC-S3-45` | `10_…md` §8, revision `post-validation` |
| **a compatibility contract** | A `CC-S8-*` clause, **or** the public tool surface it bounds (46 tools / 43 gated / 3 exempt) | `12_…md` §6.1, §7 |

Binding the terms is what makes this a test rather than a slogan. A reader who does not know whether
a choice is architecture-material does not have to interpret the phrase — they open three named
tables and look.

### 4.2 The test procedure

For a candidate choice **C**:

1. State the system **with C**, and with **C's most plausible alternative**. Both must be stated;
   a choice with no alternative is not a choice.
2. Ask the three questions:
   - **B.** Does any `BND-S4-*` row differ between the two statements — does a boundary exist in one
     and not the other, hold between a different pair, or carry a different class?
   - **A.** Does any of the 45 Authority cells differ?
   - **C.** Does any `CC-S8-*` clause differ, or does the gated-tool count or any gated tool's
     declared contract differ?
3. **One yes → architecture-material.** All three no → **not** architecture-material.

Two properties of the procedure are worth stating because they are what stop it drifting:

- **"On its own" is load-bearing.** The test asks what changing *this* choice moves, holding the
  rest fixed. Almost any choice can be made to move a boundary if it is bundled with other changes;
  the rule tests the choice, not the bundle.
- **A "yes" does not make the choice *this chapter's*.** Architecture-material means the *package*
  should decide it. Which sub-task decides it is a separate question, answered by the charter's
  decomposition. §4.4's second demonstration is a case where the rule returns in-scope and the
  correct action is to route, not to decide.

### 4.3 Demonstration — in scope

**The choice: the web tier's runtime and language.** Alternative: a web tier written in a language
other than TypeScript.

- **B — boundary?** No. `BND-S4-1` (`CMP-S4-1` ↔ `CMP-S4-3`) and `BND-S4-2` (`CMP-S4-3` ↔
  `CMP-S4-4`) exist, pair identically and carry the same class under either. The runtime does not
  move them.
- **A — authority?** No. `CMP-S4-3` holds **zero of 45** rows by construction under `M-A`
  (`10_…md` §11; corroborated at `11_…md` §9.3, 0 of 16 inventory entries naming `CMP-S4-3`). A
  component holding no authority cannot reassign one by changing language.
- **C — compatibility contract?** **Yes.** Two ways, and only the second is decisive:
  1. `CC-S8-5` records that the web tier reaches state **only through existing tool calls** and
     therefore carries *"no obligation on the MCP surface"* (`12_…md` §8.3). The runtime choice
     determines whether that stays true — a shared runtime makes **library-level consumption of the
     core available**, and library consumption is a second consumption mode the contract does not
     currently cover. Whether a compatibility contract *can be extended to a new consumption mode*
     is a property of the contract.
  2. `RD-S8-4`, the schema-delta detection method, sees a client inside the same type system as the
     43 gated schemas and cannot see one outside it. The runtime therefore changes **what the
     compatibility contract is able to detect**, which is part of the contract, not an accident of
     tooling.

**One yes → architecture-material.** The package decides it. §6 does.

### 4.4 Demonstration — a choice the charter never enumerated

The charter enumerates runtime, protocol style, rendering model, and the substrate set. It never
enumerates the following, and a downstream reader will meet it early.

**The choice: does the web tier keep a server-side store of web-session state, or re-derive web
session state from the bearer token on every request?**

- **B — boundary?** **Yes.** A server-side web-session store owned by the web tier is a durable
  store `CMP-S4-3` writes. `BND-S4-16` (`CMP-S4-3` ↔ `CMP-S4-9`) is the boundary that governs
  whether the web tier reaches durable storage at all, and `05_…md` §4.4 records it as
  **`undecided`** — *"Whether this edge exists at all is the all-MCP-versus-hybrid ownership
  selection"*. Choosing a server-side store presupposes that edge exists; choosing token re-derivation
  presupposes it does not. The two statements differ in whether a `BND-S4-*` row exists.
- **A — authority?** **Yes, potentially.** `SC-S3-43` (*Web-session / UI interaction state*) is
  authored by `CMP-S4-9` with a write path through `CMP-S4-7`, clause 5, `assumed — A-27`
  (`F-S8-3`'s reading of `10_…md` §8). A web-tier-owned session store would make `CMP-S4-3` a writer
  of it.

**Result: architecture-material — and *not this chapter's*.** The rule returns in-scope for the
package and the correct action is to **route**: `BND-S4-16` is SUB-6's (NEU-976) by `05_…md` §4.4,
and a category's authority is SUB-13's (NEU-977) by `12_…md`'s `R8-2`. This chapter therefore makes
no web-session-storage decision and files the routing as **`OI-S15-2`** (`90_…md` § SUB-15).

**`OI-S15-2` is a distinct item from `OI-S15-1`, and the two must not be conflated.** `OI-S15-1` is
about the read surface's **entry count** and depends on SUB-13's disposition of `F-S7-1`/`F-S7-2`;
`OI-S15-2` is about **where web-session state lives** and depends on `BND-S4-16`. They share an owner
in part and nothing else. `OI-S7-1` is the closest prior item — it records that the web tier is
*assumed* to hold no server-side session binding — and `OI-S15-2` is the demonstration that the
assumption is **architecture-material** rather than incidental, which is what this section adds.

This is the demonstration the acceptance criterion asks for: a choice the charter never enumerated,
classified **without further interpretation**, by opening two named tables.

### 4.5 The relationship to SUB-8's rule, on a choice where both apply

Take the same choice. SUB-8's `R8-1`…`R8-5` and this rule both fire, and they answer **different
questions**:

| Rule | Question | Answer for a web-session store |
| --- | --- | --- |
| **This chapter's** | Should the *package* decide it? | **Yes** — it moves `BND-S4-16` and may reassign `SC-S3-43`. Route to SUB-6 / SUB-13. |
| **`12_…md` §5** | If it is built, which *side of the distribution line* does it live on? | `R8-4` fires — an operator with no relationship to any course of ours wants web-session handling, and it is describable in published vocabulary → **reusable core, public MIT**. |

Neither answer substitutes for the other. A choice can be architecture-material and public
(this one), architecture-material and private, or neither. The rules compose; they do not overlap.

### 4.6 Demonstration — out of scope, and a choice the charter never enumerated

**The choice: does the web tier render the learner surface in the learner's locale on the server, or
ship translation catalogues to the browser and localise there?**

- **B — boundary?** No. `BND-S4-1`'s pair and class are identical either way; the browser is under
  the learner's control in both, and neither statement adds or removes a `BND-S4-*` row.
- **A — authority?** No. Locale is not among the 45 categories, and a translation catalogue is not
  gate-bearing — `A-27`'s envelope explicitly tolerates *"arbitrary client-side caching of read
  data"*. No Authority cell differs.
- **C — compatibility contract?** No. No `CC-S8-*` clause mentions presentation, the gated-tool count
  is unchanged at 43, and no gated tool's declared contract differs.

**All three no → not architecture-material.** This package does not decide it, and a downstream
charter that picks either way is not contradicting anything published here. It is a good test case
precisely because localisation *feels* architectural — it touches every surface — and the rule still
returns a determinate answer.

### 4.7 The framework-and-library exclusion, derived

The charter names five: **router, ORM, component kit, test runner, styling approach**. They are out
of scope **because they fail the test**, and the derivation is shown per item rather than asserted.

| Pick | B — boundary | A — authority | C — contract | Verdict |
| --- | --- | --- | --- | --- |
| **Router** | No. Routing selects *which* projection is requested; it neither adds nor reclasses a `BND-S4-*` row. | No. An entry's authority is fixed by `11_…md` §9, not by what dispatches the request. | No. `11_…md` §12.1 sets **0 endpoint paths**, so there is no wire contract a router could change. | **not material** |
| **Component kit** | No. A component library lives entirely inside `CMP-S4-1`'s render output. `05_…md` §4.2's rows are pairs between components; a kit adds no component and therefore no pair, and reclasses none — swapping kit A for kit B leaves the same `CMP-S4-*` set with the same edges between them. | No. Authority is held over a **state category**, and `10_…md` §8 assigns all 45 rows to components, none of which is a rendering library. A kit renders values it is handed; it holds none, so no Authority cell has a different occupant under either kit. | No. The compatibility contract is the tool surface (46 / 43 / 3) and the `CC-S8-*` clauses. A component kit is not reachable from either: it appears in no tool name, no input schema and no clause, and `RD-S8-4`'s golden manifest would return an identical snapshot under either kit. | **not material** |
| **Styling approach** | No, and for a narrower reason than the component kit's. Styling produces presentation output only; it does not even reach the render-output *structure*, let alone a `BND-S4-*` pair. There is no candidate row for it to move — no boundary in `05_…md` §4.2 is a styling edge. | No. Styling holds no state at all, derived or stored, so there is no category over which it could be authoritative. It cannot appear in an Authority cell because it never satisfies the cell's subject condition. | No. Nothing in the tool surface or in `CC-S8-1`…`CC-S8-6` is expressible in styling terms; a stylesheet change is invisible to every one of the five `RD-S8-*` detection methods, including `RD-S8-1`, which is the one specified to catch what a schema diff misses. | **not material** |
| **Test runner** | No, and note the limb is answered about the *system*, not the repository. A test runner executes outside the running system entirely — it is not a `CMP-S4-*` component, so it terminates no `BND-S4-*` pair and cannot change one's existence or class. | No. It holds no state category at runtime; `10_…md` §8's 45 rows describe the system under test, and none of them is written by the harness that runs the tests. No Authority cell changes occupant under either runner. | No. `12_…md` §8.1's regression boundary `B-1`…`B-7` is the **public tool surface** — names, input schemas, the snake_case convention, the envelope, `content_quality` routing, prompt names, the exempt list. A runner swap changes none of the seven, and produces a byte-identical `RD-S8-4` manifest. | **not material** — but see the note below. |
| **ORM** | **Depends — and the rule cuts the case in two.** See below. | | | **not material, once separated** |

**The ORM is the case worth working, because it is the one that looks material and is not.**

An ORM *in the web tier* presupposes that the web tier talks to Postgres — that is, that
`BND-S4-16` exists. So there are two distinct choices bundled inside "which ORM":

1. **Does the web tier reach durable storage at all?** Changing this changes whether a `BND-S4-*` row
   exists. **Architecture-material** — and it is `BND-S4-16`, `undecided`, SUB-6's, exactly as §4.4
   found by a different route.
2. **Given that edge, which ORM sits on it?** Holding the edge fixed, swapping ORM A for ORM B moves
   no `BND-S4-*` row, no Authority cell, and no `CC-S8-*` clause. **Not architecture-material.**

The rule's "on its own" clause (§4.2) is what performs the separation. This is the strongest evidence
that the rule is a test rather than a list: applied to a bundled item it does not return "it
depends" — it identifies which component of the bundle carries the materiality and hands that one to
its owner.

**A note the test runner makes necessary.** The test runner is *not* architecture-material, and it is
simultaneously a **criterion input** to SUB-9 (NEU-983), whose topology comparison scores "one test
runner or two". Being a criterion input is not the same as being architecture-material: SUB-9 scores
the *consequence* of this chapter's runtime decision (§6.5), not the runner itself. Conflating the
two would pull every tooling choice into this package through SUB-9's back door.

### 4.8 What the rule does not do

- **It does not prioritise.** A material choice may still be deferred; the rule says who decides, not
  when.
- **It does not name an owner.** It returns in-scope or out-of-scope for the package. The charter's
  decomposition names the owner, as §4.4 shows.
- **It does not settle a choice whose materiality is contested by the tables themselves.** Where a
  table cell is `undecided` — `BND-S4-16` — the rule returns *material* and routes. It never resolves
  an undecided cell to get an answer.

---

## 5. The evidence base, established once for all three decisions

The three decisions argue from one body of evidence, set out here so §6–§8 cite rather than repeat.

### 5.1 There is no web tier

At cutoff `229e8f4`, `src/transport/` contains `main.ts`, `http.ts`, `create-server.ts`,
`prm-handler.ts` and five middleware modules — the MCP STDIO and HTTP transports and their gates.
There is **no browser-facing surface, no view layer and no router anywhere in `src/`**. Every
decision below is therefore a decision about a component that does not yet exist, argued from the
core's shape and the package's published constraints, not from an existing web codebase.

### 5.2 The core's runtime, as declared

| Fact | Value | Evidence |
| --- | --- | --- |
| Node engine floor | `>=20.19.0` | `package.json` `engines.node` |
| Module system | ESM (`"type": "module"`) | `package.json` |
| Licence | MIT | `package.json` — the public side of `12_…md`'s distribution line |
| TypeScript target / module | `ES2022` / `Node16`, `moduleResolution: Node16` | `tsconfig.json` |
| Ambient types | `"types": ["node"]` | `tsconfig.json` |
| Compilation scope | `["src", "tests", "drizzle.config.ts"]` — one root project, no workspace packages | `tsconfig.json` |
| MCP SDK | `@modelcontextprotocol/sdk ^1.27.1` | `package.json` |
| Schema library | `zod ^3.23.8`; **13 modules** under `src/domain/types/` import it | `package.json`; `src/domain/types/` |
| Lint | one `eslint.config.js` | repository root |
| Test | five vitest configs (`vitest.unit.config.ts`, `.integration`, `.smoke`, `.embedding`, root) | repository root |
| CI | **one** workflow job, `build-test-lint`, matrix `node-version: [20.x]`, pnpm 10 | `.github/workflows/ci.yml` |

### 5.3 The domain layer is runtime-portable — measured, not assumed

`CMP-S4-8` is characterised as *"pure computation, zero I/O"* (`05_…md` §3.2). **`SPK-S15-1`
measured what that means for a consumer**, because a grep over function bodies does not establish
what a module graph drags in.

Over the built output at `229e8f4`, the **transitive import closure of all 65 `src/domain` entries
reaches zero Node builtins** and only three portable npm packages (`zod`, `compromise`,
`markdown-it`). By contrast `infrastructure/db/client.js` closes over `pg`, `drizzle-orm` and `pino`
plus six builtins (`node:async_hooks`, `node:crypto`, `node:fs`, `node:module`, `node:path`,
`node:url`), and `composition-root.js` over 103 files, six external packages and seven builtins.

**The consequence is the opposite of the intuitive one, and it is why `F-S15-1` exists.** The domain
layer's portability means *any* modern JavaScript runtime could execute it. **Code reuse therefore
cannot carry the runtime decision** — it does not select Node. §6 argues the runtime on something
else. Full record, including the method's disclosed limits: `SPK-S15-1` in `../92_spike-register.md`,
which carries **expiry 2027-04-30**. Per `00_…md` §2.6 this section inherits that expiry: after that
date the portability measurement is historical, and `F-S15-1`'s refutation of the reuse argument must
be re-run or re-labelled. The runtime decision itself does not expire with it — §6 rests on
contract-sharing reach, not on portability.

### 5.4 The web tier consumes the core over the tool surface, not as a library

`CC-S8-5` records the web tier reaching state *"only through existing tool calls"*, adding no tool
and changing no schema, and therefore carrying **"no obligation on the MCP surface"** (`12_…md`
§8.3). `11_…md` §13.2 states the same from the other side: all sixteen inventory entries are
read-projections or write-intents **forwarded across `CMP-S4-4`**.

So the web tier is, architecturally, an **MCP client**. That is the single most consequential fact
for all three decisions and it is consumed from SUB-8 and SUB-7, not originated here.

### 5.5 The inventory, as SUB-7 published it

**16 entries — 11 read-projections, 5 write-intents; 16 of 16 name exactly one authority; 0
authorities originated** (`11_…md` §9). Three distinct authorities are used: `CMP-S4-9` ×13,
`CMP-S4-7` ×2, `CMP-S4-8` ×1. `CMP-S4-3` is named **zero** times.

Four properties of that set do work in §7:

1. **Write-intents are named actions, not resource mutations.** *"the API accepts a learner action and
   forwards it as an MCP tool call across `CMP-S4-4`. The listed authority performs the write. The
   API performs none."* (§9.2)
2. **The write set has no CRUD symmetry.** Five intents over four categories, and `W5` (notes) is
   *"Create and delete only: `04_…md` records **no update path**, so no update intent is published."*
3. **Three of eleven reads have no store to be a resource of.** `SC-S3-28` mastery — *"derived on read
   with no store … structurally unwritable by anyone, the API included"*; `SC-S3-29` `LearnerContext`
   — *"Derived on read from **five parallel repository reads**. No store"*; `SC-S3-30` analytics —
   *"Computed per request and discarded. No store."*
4. **One read composes across two authorities.** `R7` — *"the derived quality shown is `CMP-S4-8`'s
   (`grade-mapper.ts:71`); the record is `CMP-S4-9`'s."*

And the individuation rule, which constrains any surface built over the set: *"One inventory entry =
one (state category, access mode) pair"*, with per-screen, per-view and per-operation individuation
explicitly rejected because *"any unit finer than the state category creates entries with no matrix
counterpart"* (§6; `DR-C10-S7-1`).

### 5.6 The serve path's ordinary operating mode

`DR-C10-S4-3` decides that the full gate battery runs at authoring time and **exactly one gate sits
at serve time** — `CMP-S4-16` performs *one keyed read* of `CMP-S4-18` and applies a four-row
disposition: quarantine on `blocked`, on `quarantined`, on a **stale** verdict and on an **absent**
verdict; serve otherwise. And:

> **Stale-or-absent is the serve path's ordinary operating mode**, not its exceptional one, because
> the per-source revalidation budget is zero. A serve path that is only correct when a fresh verdict
> exists is mis-built.

This is a fact about *content disposition changing between one serve and the next*, in the ordinary
case. It is **not** the trust property, and §8 uses it precisely because `05_…md` §6.3 **R-5**
forbids using the trust property here.

### 5.7 The constraints handed over, consumed not re-derived

`05_…md` §6.3 hands five constraints to this chapter as **inputs**:

| Id | Constraint (consumed verbatim in substance) |
| --- | --- |
| **R-1** | No rendering model may evaluate a mastery gate, a scheduling decision or an authorization decision in the browser. |
| **R-2** | Any client-held copy of server state is a cache with no authority; a model requiring optimistic client-side writes to be authoritative is outside the envelope. |
| **R-3** | An offline-capable learner surface is outside the envelope. |
| **R-4** | No rendering model may make the browser a direct reader of `CMP-S4-18`. |
| **R-5** | **The trust property must not be cited as an argument for or against any rendering model.** It is satisfied by all of them. |

**R-5 is honoured throughout §8**, and §11.3 records the check. `05_…md` supplied the trust property
and no selection; this chapter supplies the selection and does not re-derive the property.

### 5.8 The transport asymmetry

Every security claim below names the transport it holds for, per `12_…md` §11's `AC-9` and
`BND-S4-17` — the `CMP-S4-5` ↔ `CMP-S4-6` trust boundary that **nothing enforces, owner nobody**.
The context-token gate is mounted only on the HTTP path (`src/transport/http.ts:185`–`:186` — the
`contextTokenRepo` guard and the `app.use('/mcp', …)` mount), and `src/transport/main.ts` and
`create-server.ts` carry zero references to it. **The web tier reaches the core over HTTP**, so
claims below are HTTP-qualified; none of them closes STDIO, and `CC-S8-3` remains unowned
(`OI-S8-2`).

---

## 6. Decision 1 — the web tier's runtime and language

### 6.1 What is *not* the argument

**NEU-890 settled TypeScript on a Node runtime for the course's own solutions, proofs and tests.
That decision is consumed, not reopened — and it does not decide this.** The web tier is a different
component with a different job, and inheriting the runtime because an adjacent decision went that
way would leave SUB-9's topology comparison resting on an undeclared assumption, which is exactly
what this sub-task exists to prevent.

**Nor is code reuse the argument.** §5.3 measured the domain layer's transitive closure and found
zero Node builtins across all 65 entries; §5.4 records that the web tier reaches state only through
tool calls. So the reuse argument is unsound twice over — reuse would not require *Node*, and reuse
is not currently how the web tier consumes the core at all. Filed as **`F-S15-1`**, because a later
reader who reconstructs this decision from intuition will reach for exactly that argument.

### 6.2 The decision

> **The web tier is written in TypeScript and runs on Node, sharing the core's runtime and language.**

Recorded as **`DR-C10-S15-2`** (`decision-records/DR-C10-S15-2_web-tier-runtime-and-language.md`),
which carries the weighted criteria `C1`–`C5` fixed before scoring, the four rejected alternatives,
and the revision triggers. This section states the decision and its decisive criterion; the record is
authoritative for the alternatives and the scoring.

### 6.3 The decisive criterion — mechanical contract-sharing on the 43 gated schemas

Because the web tier is an MCP client (§5.4), the contract between it and the core **is the tool
schemas**: 43 gated tools, whose input shapes are Zod objects declared across 13 modules under
`src/domain/types/` (`zod ^3.23.8`). Every one of the sixteen inventory entries crosses that surface.

Under a shared TypeScript runtime the web tier consumes those schemas **as its own types**. A change
to a gated tool's input shape becomes a **compile error in the web tier**. Under any other language
the 43 schemas are re-expressed by hand, and drift between the two expressions is detectable only by
someone noticing.

This is not a developer-convenience argument; it is a **compatibility-contract** argument, and it is
what made the choice architecture-material under §4.3:

- `12_…md` §8.2 defines `RD-S8-4` as the schema-delta detection method. A same-language client is
  inside its reach; a foreign-language client is outside it.
- `12_…md` §9.1 names the hazard that detection exists for — a declared field that **changes meaning
  without changing shape**, *"invisible to `RD-S8-4`, invisible to any client's generated types,
  invisible in review to anyone reading the diff."* `CC-S8-2` is precisely such a change: the
  `context_token` argument's meaning narrows from a session handle to a principal-bearing capability
  while its shape is unchanged. A web tier inside the same type system is the only configuration in
  which that class of change has any mechanical chance of surfacing at the client.
- **Caveat, stated rather than glossed:** shared types catch a *shape* change mechanically. They do
  **not** catch `CC-S8-2`'s meaning-narrowing either — nothing does, which is why `12_…md` calls it
  invisible. The honest claim is narrower: a shared runtime puts the client inside `RD-S8-4`'s reach
  for the shape class and leaves the semantic class uncovered for everyone equally.

### 6.4 Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **A different language entirely** (e.g. Python, Go, Elixir) | Loses mechanical contract-sharing across all 43 gated schemas; every schema change becomes a manual re-expression with no detection, placing the client outside `RD-S8-4`. **Decisive.** Secondary: the repository's only MCP client implementation is `@modelcontextprotocol/sdk ^1.27.1`, a TypeScript package already on the dependency list. |
| **2** | **TypeScript on a non-Node JavaScript runtime** (Deno, Bun, an edge worker) | **The genuinely close alternative**, because it keeps the type-sharing property that decided §6.3 — so it has to be beaten on evidence, not dismissed. It loses on cost, not capability: `tsconfig.json` declares `"module": "Node16"`, `"moduleResolution": "Node16"` and `"types": ["node"]`, so a second runtime needs a divergent compiler configuration; `engines.node: ">=20.19.0"` and CI's `node-version: [20.x]` matrix pin a single runtime, so a second runtime is a second CI lane. **It buys nothing this package can name while costing all four of SUB-9's criteria.** Stated plainly: it would probably work. That is not a reason to take it. |
| **3** | **No separate web-tier runtime — serve the learner surface from the existing MCP process** (`src/transport/http.ts`) | Rejected **by this chapter's own rule**. It collapses `BND-S4-2` (`CMP-S4-3` ↔ `CMP-S4-4`), which `05_…md` §4.2 records as a **trust** boundary owned by `CMP-S4-4` where the core re-verifies the JWT itself. Removing a `BND-S4-*` row is the boundary limb of §4.1 firing — so this is not a deployment convenience but an architecture-material change, and one that deletes a trust boundary. |

Alternative 3 is worth noting as the chapter's fourth demonstration of the rule: the rule does not
only mark this chapter's territory, it **disqualifies an option inside it**.

### 6.5 What this means for SUB-9's four criteria — the criterion input, stated once

SUB-9 (NEU-983) scores repository topology on build, testing, local development and release. Those
four scores move on this decision, so it is published in the form SUB-9 consumes:

> **The web tier shares the core's TypeScript/Node runtime. SUB-9 may therefore score a pnpm
> workspace, a shared base `tsconfig`, one test runner and a single CI pipeline as *available*, not
> conditional.**

Concretely, against the state recorded at §5.2:

| SUB-9 criterion | Today | Under this decision | Under a split runtime |
| --- | --- | --- | --- |
| **Shared build** | one `tsconfig.json` over `src`, `tests`, `drizzle.config.ts`; no workspace packages | the web tier becomes a workspace package extending a shared base `tsconfig` — **one build graph** | two compiler configurations and two build systems to score |
| **Shared test runner** | five vitest configs | the web tier adds a config to that set — **one runner** | a second runner, with its own conventions and reporters |
| **Shared tooling** | one `eslint.config.js`, one prettier scope, pnpm 10 | extends unchanged — **one lint and format pass** | a second toolchain, separately configured and separately enforced |
| **Single CI pipeline** | one `build-test-lint` job, `node-version: [20.x]` | more steps in that job, or a matrix entry — **one lane** | a second lane with its own runtime install and cache |

**Routing rule, so SUB-9 never has to re-decide.** If SUB-9's topology comparison concludes that a
preferred topology requires a different runtime, that is a **finding routed to SUB-15 (NEU-982)** —
never a local re-decision there. This mirrors the out-of-scope line in this sub-task's own brief and
is restated here so it is visible from the artifact SUB-9 actually reads.

### 6.6 The reuse consequence, and the obligation it would inherit

A shared runtime makes **library-level consumption of the core available**. This record **permits the
shared runtime; it does not authorise library-level reuse**, and the distinction matters because the
price is concrete:

- `CC-S8-5` currently records *"no obligation on the MCP surface"* **because** the web tier reaches
  state only through tool calls. Library reuse voids that premise: the web tier would become a
  consumer of the core's internals, not just its published tool surface.
- Every `CC-S8-*` obligation would extend to that import surface. In particular **`CC-S8-3`'s STDIO
  gate — which has no owner (`OI-S8-2`)** — would need one, because reused code must behave under
  both transports and `BND-S4-17` is a trust boundary **nothing enforces**.
- There is nothing to catch a break: `RD-S8-1`…`RD-S8-5` are **specified, never executed**, with no
  implementation to run them against and no regression suite to host them (**`CAP-S8-1`**).

**So: reuse-from-core is a separate decision, and taking it inherits SUB-8's backward-compatibility
obligation in full, including STDIO coverage.** Recorded here with its price so that a downstream
charter takes it deliberately or not at all.

---

## 7. Decision 2 — the API's protocol style

### 7.1 The decision

> **A resource-oriented read surface over the eleven read-projections, and named-intent writes over
> the five write-intents. Writes are never verb-mutations on a read resource.**

Recorded as **`DR-C10-S15-3`** (`decision-records/DR-C10-S15-3_api-protocol-style.md`), which carries
the weighted criteria `P1`–`P5` fixed before scoring, the five rejected alternatives — including
GraphQL, rejected on authority visibility rather than on the trust property — and the revision
triggers.

### 7.2 Why the inventory's own shape decides it

The evidence base is `11_…md` §9 — cited rather than a hypothetical resource set — and specifically
the four properties at §5.5.

**The read side is resource-shaped.** Eleven projections, each individuated by (state category,
access mode), each naming exactly one authority, 16 of 16. That is precisely the structure an
addressable read surface expresses well: one addressable projection per inventory entry, and the
exactly-one-authority property stays visible on the wire, where SUB-11 (NEU-985) can audit it against
`10_…md` §8 without reconstructing anyone's screen design.

**The write side is not.** The five write-intents are defined as *named learner actions forwarded as
MCP tool calls*, where *"the API performs none"* of the writes. That is named-action forwarding.
Forcing it into resource verbs would misdescribe what the API does — it does not mutate a resource,
it relays an intent to the authority that does. And the set has **no CRUD symmetry** to express
anyway: `W5` is create-and-delete only, because `04_…md` records **no update path** for notes.

**So the two halves take the two shapes their evidence supports**, which is the whole argument. The
asymmetry is not a compromise; it is a faithful rendering of an inventory that is itself asymmetric.

### 7.3 Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **Uniform REST/CRUD over resources, writes included** | Fails on two counted facts. (i) The write set has no CRUD symmetry — five intents over four categories, notes create/delete with **no update path**, so a uniform verb model offers verbs the domain has no meaning for. (ii) **Three of eleven reads have no store to be a resource of** (`SC-S3-28`, `SC-S3-29`, `SC-S3-30` — all derived on read, no store). Forcing them into resources invents entities the matrix does not have, which is the same error `DR-C10-S7-1` rejected at a finer grain. |
| **2** | **Uniform RPC, reads included** | Discards the one strong structural property the inventory has: each read-projection is individuated by state category and names exactly one authority. A resource-shaped read surface keeps that one-to-one **visible on the wire**; flattening every read to a named procedure hides it and leaves SUB-11's exactly-one-authority audit with nothing on the surface to reproduce it from. |
| **3** | **GraphQL, or any client-composed query language** | The tempting one, because three of eleven reads are aggregates — `SC-S3-29` is *five parallel repository reads*. Rejected **on authority visibility, not on the trust property**: a client-composed query has no fixed entry to map back to a matrix row, so exactly-one-authority becomes unverifiable from the surface, and the composition of an aggregate passes to the client when the server is what performs it. It also **expands the surface beyond the sixteen entries SUB-7 published**, which this chapter has no authority to do. |
| **4** | **Typed RPC with a generated shared client (tRPC-style)** | Rejected as a *protocol-style* selection because **it is not one** — it is a framework and library pick, and this chapter's own rule (§4.1) classifies it out of scope: swapping it moves no `BND-S4-*` row, no Authority cell and no `CC-S8-*` clause. A downstream charter may well adopt it *underneath* the style selected here. Recording it as rejected-at-this-level rather than silently omitting it is what keeps the rule honest — the exclusion is derived, not assumed. |

### 7.4 The two dependencies this decision carries — recorded here, at the decision they constrain

- **From Decision 1 (runtime → protocol style).** The shared TypeScript runtime is what lets the tool
  schemas serve as the web tier's own contract types (§6.3). That is the reason the protocol style can
  stay **thin** — a projection/intent split with no schema-negotiation layer. Had the runtime gone the
  other way, alternative 3's self-describing schema would have become materially more attractive,
  because a foreign-language client has no other mechanical grip on 43 schemas. **The runtime choice
  narrowed the credible protocol styles, and this is where that narrowing is recorded.**
- **From Decision 3 (rendering model → protocol style).** Because the server composes every
  gate-bearing read (§8), the read surface needs **whole-projection reads**, not client-selected
  fields — the composition happens server-side by construction. That is an independent reason
  alternative 3 loses, and it is recorded here rather than in §8 because it constrains *this*
  decision.

### 7.5 The stop, honoured

This record specifies **no endpoint path, no payload schema, no error catalogue, no versioning scheme
and no pagination model**. `11_…md` §12.2 states the stop and it is not crossed: a reader who finds
no endpoint path here should conclude the contract is **open, not missing**. The counts are audited
at §10.1.

The constraint this record *does* impose on whoever writes that contract is inherited unchanged from
`11_…md` §12.2: **no resource may be authoritative for any of the forty-five categories, and every
resource must resolve to exactly one of the authorities §9 names.**

---

## 8. Decision 3 — the rendering model

### 8.1 The decision

> **The learner-facing surface is server-rendered and server-composed on every gate-bearing read.
> Client-side enhancement is permitted and expected, confined to interaction state that is not
> gate-bearing.**

Recorded as **`DR-C10-S15-4`** (`decision-records/DR-C10-S15-4_rendering-model.md`), which carries the
weighted criteria `D1`–`D5` fixed before scoring — `D2` being the `R-5` constraint that forbids
arguing this decision from the trust property — the five rejected alternatives, and the revision
triggers.

Which surfaces render where, concretely: every one of the eleven read-projections is composed on the
server for the render that displays it; the five write-intents are submitted as intents and their
outcome re-rendered from the server's response; interaction state that is nobody's authority —
scroll, focus, draft text, expand/collapse, optimistic display of an intent already accepted — lives
in the browser.

### 8.2 The decisive criterion — the serve path's ordinary operating mode

**`R-5` forbids citing the trust property for or against a rendering model, so it is not cited here.**
The argument is independent, and it is `DR-C10-S4-3`'s (§5.6):

The serve path applies a four-row quarantine disposition on **every serve**, and **stale-or-absent is
its ordinary mode**, because the per-source revalidation budget is zero. That means the disposition
for a given content unit **can differ between one serve and the next** in the normal case — not the
exceptional one.

A rendering model that composes content once and re-renders from a durable client-side copy therefore
displays content under a disposition that may since have changed, and it has no way to know: the
disposition is `CMP-S4-16`'s, applied at serve, and **`R-4`** forbids the browser reading
`CMP-S4-18` directly to find out. **So the content path must be composed server-side per serve.** That
conclusion follows from the serve path's operating mode and `R-4` — neither of which is the trust
property.

Given that the content path is server-composed, everything else follows cheaply, and §8.4 explains
why the remaining freedom is used rather than spent.

### 8.3 `A-27`, cited at the decision it supports

**This decision rests on stand-in assumption `A-27`** — that the learner-facing surface is a rich,
stateful, authenticated web surface whose interaction state is not gate-bearing — and `A-27` is
`[unconfirmed]`, standing in for **NEU-892**, which is unbuilt.

- **Its tolerance envelope**, which this decision sits inside: the architecture *"tolerates any
  rendering model — server-rendered, client-rendered, or a mix"*, and tolerates *"arbitrarily rich
  client-side interaction state, arbitrary client-side caching of read data, and optimistic UI,
  **provided the server re-evaluates every gate from server-held state**."* The selection at §8.1 is
  well inside that envelope, and §8.4's client-side enhancement is explicitly what the envelope
  permits.
- **Its invalidating outcome**, named here so the reader knows what would break this record: *"A UI
  direction requiring **offline-capable or client-authoritative learning state**."* If NEU-892 lands
  requiring either, this decision and the two it interacts with go stale together — recorded as
  **`CAP-S15-2`**.
- **Its re-validation trigger:** NEU-892 lands and its package is published under `docs/research/`.

No sixth entry is added to `93_…md`; the register is **closed** and is cited, not extended.

### 8.4 Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **Client-rendered SPA holding a durable client-side store of learner state** | Rejected on §8.2's mechanism — content composed once and re-rendered from a client copy can display a unit whose quarantine disposition has since changed, and `R-4` forbids the browser checking. Additionally outside `A-27`'s envelope via `R-2`, which makes any client-held copy a cache with **no authority**. **Explicitly not rejected on the trust property** (`R-5`). |
| **2** | **Offline-capable / local-first learner surface** | Rejected as `A-27`'s **named invalidating outcome**, restated at `05_…md` §6.3 **R-3** as outside the envelope. This is the cheapest rejection in the chapter and is recorded as such rather than dressed up — it is settled by a published constraint, not by analysis here. |
| **3** | **Fully server-rendered with no client-side enhancement — a full page composition per interaction** | The genuine competitor on the *other* side, and the one a naive reading of §8.2 would land on. Rejected because `A-27` describes a **rich, stateful** surface and its envelope explicitly tolerates *"arbitrarily rich client-side interaction state"* and *"optimistic UI"*. Since the server re-evaluates every gate either way, forbidding enhancement **costs interactivity and buys nothing** the envelope requires. Decisive criterion: no constraint in the package asks for it. |
| **4** | **A mixed model in which the browser reads the drift-verdict cache and decides display** | **Not this chapter's rejection to claim.** `DR-C10-S4-3` already rejected it — *"The quarantine decision is gate-bearing, so this violates §6.1 and the R-4 constraint handed to SUB-15"* — and `05_…md` §6.3 hands it here as constraint **R-4**. It is consumed, not re-decided, and is listed only so a reader does not think it was overlooked. |

### 8.5 The two dependencies this decision carries — recorded here, at the decision they constrain

- **From Decision 1 (runtime → rendering model).** Server-side composition in the same language as the
  tool schemas means the composed projections are typed end-to-end from the tool response to the
  rendered output. A foreign-language web tier would re-express the shape of all eleven projections at
  the composition boundary — the same re-expression cost §6.3 identified, paid a second time at
  render. **The runtime choice narrowed the credible rendering models, and this is where that is
  recorded.**
- **From Decision 2 (protocol style → rendering model).** Named-intent writes map one-to-one onto
  learner actions. That is what makes §8.1's confinement of client state coherent: the browser
  **submits an intent** rather than applying a mutation locally, so optimistic display is a display
  concern and never an authority claim — which is exactly the line `R-2` draws. Under alternative 1 of
  §7.3 (verb-mutations on resources) the same optimism would be much harder to keep on the safe side
  of that line.

### 8.6 The round-trip consequence, and what is not known about it

Every gate-bearing read is a **server round trip**, by construction of the published component model:
`05_…md` §6.2 point 3 records that every gate evaluator sits behind `BND-S4-2` and *"None of them is
reachable from the browser except as a request"*. **This was established by reading, not measured** —
see §11.4 on the spike candidate withdrawn for exactly that reason.

What that round trip *costs* is a different question, and it is not settled here:

- **`SPK-S6-1`** (SUB-6 / NEU-976) measured routing a learner-path state read through the MCP tool
  boundary at **≤0.02% of the sub-second budget `A-25` predicates** — cited by id, and this citation
  inherits its expiry of **2027-08-21**.
- **But that figure is a floor, not a prediction.** `SPK-S6-1`'s own residual records that the harness
  used `InMemoryTransport`, so **no network hop is included**.
- The real cost depends on the deployment shape, which is **SUB-10 (NEU-984)**'s and is not chosen
  here. Recorded as **`CAP-S15-1`**, owner SUB-10 — and as **`F-S15-2`**, because a consumer who cites
  `SPK-S6-1`'s 0.02% as a *deployment* round-trip cost is over-reading it.

---

## 9. The interaction between the three, gathered

Each dependency is recorded at the decision it constrains; this section is the index, not the record.

| Constrains → | Recorded at | The dependency |
| --- | --- | --- |
| Runtime → protocol style | **§7.4** | Shared TypeScript makes the 43 gated schemas serve as the client's own contract types, so the protocol style can stay thin; a foreign runtime would have made a self-describing schema layer materially more attractive. |
| Runtime → rendering model | **§8.5** | Server composition in the core's language keeps the eleven projections typed end-to-end; a foreign runtime re-expresses them at the render boundary. |
| Rendering model → protocol style | **§7.4** | Server composition on every gate-bearing read means whole-projection reads, not client-selected fields — an independent reason client-composed querying loses. |
| Protocol style → rendering model | **§8.5** | Named-intent writes let the browser submit intents rather than apply mutations, which is what keeps optimistic display on the safe side of `R-2`. |

**Why this is one trade.** Run the counterfactual: had the runtime gone to a foreign language, the
protocol style's alternative 3 gains its strongest argument (a self-describing schema is the only
mechanical grip a foreign client has on 43 schemas), and a client-composed query surface pulls
composition toward the browser, which sits worse with §8.2's per-serve disposition requirement. The
three would not merely have been *different*; they would have moved **together**. Deciding them
serially and asserting consistency afterwards would have concealed that.

---

## 10. The scope audit

### 10.1 The stop, counted

| Thing this chapter might have specified | Count |
| --- | --- |
| Endpoint paths | **0** |
| Payload schemas | **0** |
| Error catalogues | **0** |
| Versioning schemes | **0** |
| Pagination models | **0** |
| Frameworks or libraries selected | **0** |

### 10.2 No substrate choice was made here

| Substrate decision | Made here? | Owner |
| --- | --- | --- |
| Data-store topology | **No** | SUB-10 (NEU-984) |
| Deployment shape | **No** — and `CAP-S15-1` records a residual that depends on it | SUB-10 (NEU-984) |
| AI-orchestration placement | **No** | SUB-10 (NEU-984) |
| The four make-or-reuse records | **No** — §6.6 prices *one* reuse consequence without taking it | SUB-10 (NEU-984) |
| Production-compatibility assessment | **No** | SUB-10 (NEU-984) |
| Repository topology | **No** — §6.5 supplies the criterion input only | SUB-9 (NEU-983) |

`M-A` is not re-opened, no authority is originated, and no row of `10_…md` §8 is altered.

---

## 11. What this chapter closes, and what it does not

### 11.1 Closes

1. **The architecture-material rule** — stated as an applicable test with its terms bound to named
   artifacts (§4.1–§4.2), demonstrated on four choices, two of which the charter never enumerated
   (§4.3, §4.4, §4.6, and §6.4 alternative 3).
2. **The framework-and-library exclusion**, derived per item rather than asserted (§4.7).
3. **The web tier's runtime and language** (§6), published as a criterion input for SUB-9 (§6.5).
4. **The API's protocol style** (§7), against SUB-7's published inventory.
5. **The rendering model** (§8), with the selection supplied here and the trust property consumed as
   a constraint under `R-5`.

### 11.2 Does not close, explicitly

- **`CAP-S4-1`** — the operational-log deletion-owner gap. Untouched and **not closed**; it remains
  SUB-13's (NEU-977) to assign once its schema precondition holds.
- **`BND-S4-16`** — remains **`undecided`** in `05_…md`, which this chapter **does not amend**.
  §4.4 and §4.7 both route to it rather than resolving it.
- **`OI-S8-2`** — `CC-S8-3`'s STDIO gate remains unowned. §6.6 states what would make it urgent; it
  does not assign it.
- **`CAP-S8-1`** — `RD-S8-1`…`RD-S8-5` remain specified and unexecuted.
- **`F-S7-1` / `F-S7-2`** — the two unmatched inventory items remain SUB-13's; **`OI-S15-1`** records
  that the read surface's shape moves if they are dispositioned by adding a category.
- **Whether the web tier keeps a server-side web-session store** — classified architecture-material
  at §4.4 and **routed**, not decided; filed as **`OI-S15-2`**, owner `SUB-6 (NEU-976)` for the
  `BND-S4-16` limb, co-named `SUB-13 (NEU-977)` for the `SC-S3-43` authority limb.
- **Library-level reuse of the core** — §6.6 permits the runtime that makes it available and
  explicitly does not authorise it.

### 11.3 The `R-5` check

`05_…md` §6.3 **R-5** forbids citing the trust property as an argument for or against any rendering
model. §8's argument runs on `DR-C10-S4-3`'s stale-or-absent operating mode, on `R-4`, on `R-2`/`R-3`
as envelope constraints traceable to `A-27`'s invalidating outcome, and on `A-27`'s tolerance
envelope. **The trust property appears in this chapter only as a consumed constraint and never as a
premise of the rendering selection.**

**The two remaining citations of `05_…md` §6.2 point 3 are checked explicitly, since `R-5` is about
*use* rather than about mention.** §5.7 cites it when listing the constraints this chapter consumes,
and §11.4 cites it as the reason the rendering spike candidate was **withdrawn** — that is, as
evidence that the question was already answered by reading. Neither citation argues for or against a
rendering model; the first records an inherited constraint and the second explains a
non-measurement. **`R-5` is satisfied at both sites**, and they are named here so a reader auditing
compliance does not have to decide for themselves whether a mention is a use.

### 11.4 The spike candidate withdrawn under the "could this have been read instead?" test

One candidate was considered and **withdrawn**: *can a chosen rendering model satisfy the browser
trust property without a server round trip on a gate-bearing read?*

It was withdrawn because it **could** have been read instead, and was: `05_…md` §6.2 point 3 records
that every gate evaluator sits behind `BND-S4-2` and none is *"reachable from the browser except as a
request"*, while §6.3 `R-1` forbids browser-side gate evaluation and `R-4` forbids the browser reading
`CMP-S4-18`. The answer — **no; a gate-bearing read always requires a server round trip** — follows
from the published component model by construction. A spike would have measured a question the package
already answers. Disclosed here and in `../92_spike-register.md` rather than filed, following SUB-14's
precedent.

**What was genuinely unsettleable by reading was a different question** — whether the domain layer's
zero-I/O characterisation survives as a property of the *module graph* a separate consumer resolves —
and that one was run as **`SPK-S15-1`** (§5.3).

---

## 12. Handoff

| To | What it receives |
| --- | --- |
| **SUB-9 (NEU-983)** | §6.5's criterion input: the web tier shares the core's TypeScript/Node runtime, so a pnpm workspace, a shared base `tsconfig`, one test runner and a single CI pipeline are **available, not conditional** — with the per-criterion comparison table and the routing rule that a topology needing a different runtime is a finding routed **here**, never a local re-decision. |
| **SUB-10 (NEU-984)** | The rule at §4.1–§4.2 **to apply, not to restate**, to its substrate choices; `CAP-S15-1` (the deployment-dependent round-trip residual, owner SUB-10); `F-S15-2` (`SPK-S6-1` is an in-memory floor, not a deployment prediction); §6.6's pricing of the one reuse consequence this chapter declines to take. |
| **SUB-13 (NEU-977)** | `OI-S15-1` — the read surface's shape depends on how `F-S7-1` / `F-S7-2` are dispositioned. Also co-named on **`OI-S15-2`** for its authority limb, since `SC-S3-43`'s Authority cell is SUB-13's to move. |
| **SUB-6 (NEU-976)** | **`OI-S15-2`** — §4.4's routed web-session-storage question, material on `BND-S4-16`'s existence. §4.7's ORM split routes to the same edge. `BND-S4-16` remains **`undecided`** and is not resolved here. |
| **SUB-11 (NEU-985)** | §10.1's and §10.2's counts as audit rows; §7.2's note that the resource-shaped read surface is what keeps exactly-one-authority reproducible from the surface. |
| **SUB-12 (NEU-986)** | Four register sections at the completeness gate — `F-S15-1`/`-2`, `OI-S15-1`/`-2`, `CAP-S15-1`/`-2`, `SPK-S15-1`. `93_…md` (closed) and `94_…md` are untouched. |
| **NEU-896** | `CAP-S15-2` — all three decisions rest on `A-27`, `[unconfirmed]`, and go stale together if NEU-892 lands outside its envelope. |

---

## 13. Verification note

| Claim | How to check it | Expected |
| --- | --- | --- |
| The rule is a test, not a list | Read §4.1–§4.2; each of the three terms resolves to a named table | Three bindings, one procedure |
| Demonstrated on an unanticipated choice | §4.4 (web-session storage) and §4.6 (localisation) | Neither appears in the charter's enumeration |
| The framework exclusion is derived | §4.7 — each of the five run through the test | Five derivations, plus the ORM split |
| The runtime is argued, not inherited | §6.1 names NEU-890 and sets it aside; §6.3 supplies an independent criterion | Reuse explicitly rejected as the basis (`F-S15-1`) |
| Rejected alternatives are real | §6.4, §7.3, §8.4 | 3 + 4 + 4, each with a decisive criterion |
| Protocol style cites SUB-7's inventory | §5.5, §7.2 | Four cited properties of the 16 entries |
| No wire contract | §10.1 | 0 / 0 / 0 / 0 / 0 |
| No substrate choice | §10.2 | Six rows, all "No" |
| `A-27` cited at the decision | §8.3 — named in the decision's own section with envelope and invalidating outcome | Present |
| `R-5` honoured | §11.3; grep §8 for the trust property | Appears only as consumed constraint |
| Spike or cap, never assertion | §5.3 (`SPK-S15-1`), §8.6 (`CAP-S15-1`), §8.3 (`CAP-S15-2`), §11.4 (withdrawal) | One spike, two caps, one disclosed withdrawal |
| Registers appended, not rewritten | `git diff --numstat` on `02_`, `90_`, `91_`, `92_` | **0 deletions** on each |

Per `00_…md` §5, verification here is by **file inspection**, not execution. The repository's
type-check and lint runs are no-regression checks only and are **not** evidence about any claim in
this chapter. `qa-execution:engine` is unconfigured, so **no QA pass is claimed** anywhere in it.
