# 11 — What an existing MCP client is guaranteed, over a surface re-counted at this cutoff

**Charter:** C011 (umbrella `NEU-893`) · **Sub-task:** SUB-11 (`NEU-1004`) · **Covers:** OUT-16
**Cutoff:** `35f92ba`, 2026-08-25 · **Branch:** `feat/NEU-1004-client-compatibility-contract`, cut from `origin/develop` at `35f92ba`
**Model:** claude-opus-5[1m]

---

## 0. What this chapter is

A **backward-compatibility contract**. It tells the operator of an existing MCP client three things:
what this package's mechanism guarantees them, what it takes away, and how they would find out
either had happened. It is written over a tool surface **re-counted here**, at the ref and date
above, by a derivation shown in §1 so a reader can re-run it and disagree.

It is also written with a stated ceiling. **A client's guarantee cannot exceed what the enforcement
point actually confines**, and SUB-5 named four things it does not. §8 is that ceiling, and it is
the half of this contract most likely to be skipped.

**Three things this chapter consumes rather than decides.** SUB-4's STDIO gate and bound context
token (`DR-C11-S4-1`, `DR-C11-S4-2`); SUB-5's enforcement point (`DR-C11-S5-1`); and C010's
compatibility rule and regression boundary (`DR-C10-S8-1`, and
`../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md`
§8). None is re-derived here. What is new is the **whole-surface** consequence of all three
together, and the **price** of the one cost SUB-4 left unpriced.

---

## 1. The surface, re-counted at this cutoff

The charter fixes the settled figure at **46 registered / 43 gated / 3 exempt** and forbids
inheriting it. This section does not restate it on the charter's authority, on C010's, or on a
sibling chapter's. It derives each of the three numbers from `src/` at this cutoff and only then
compares.

### 1.1 Registered — 46

Every tool reaches the server through one call shape, `server.registerTool(`, and every registering
module is reached from a single aggregator, `registerServerTools` (`src/server/tools.ts:17`–`:30`).
Counting the call sites therefore counts the surface.

```
grep -rc "server.registerTool(" src/
```

| Module (`src/server/`) | Sites |
| --- | --- |
| `spaced-repetition-tools.ts` | 7 |
| `chunk-tools.ts` | 6 |
| `teaching-tools.ts` | 5 |
| `session-lifecycle-tools.ts` | 4 |
| `analytics-tools.ts` | 3 |
| `query-tools.ts` | 3 |
| `session-progress-tools.ts` | 3 |
| `content-tools.ts` | 3 |
| `notes-tools.ts` | 3 |
| `topic-tools.ts` | 3 |
| `session-tools.ts` | 1 |
| `remediation-tools.ts` | 1 |
| `search-tools.ts` | 1 |
| `server-info-tools.ts` | 1 |
| `server-context-tools.ts` | 1 |
| `server-workflow-tools.ts` | 1 |
| **Total** | **46** |

**Sixteen registering modules.** Three further files in `src/server/` register nothing and are pure
aggregators or helpers — `tools.ts`, `persistence-tools.ts` (`:10`–`:13`),
`session-management-tools.ts` (`:9`–`:11`) — and `tool-helpers.ts` registers nothing either. A
count that treated all twenty files as registering modules, or that missed the two intermediate
aggregators, would be wrong in opposite directions; both are checked here.

**No second registration path exists.** A search for any other registration call shape
(`server.tool(`, or `.registerTool` reached other than through `server.`) returns nothing across
`src/`, so 46 is the whole surface and not the part of it that happens to use one idiom.

### 1.2 Exempt — 3, derived twice and cross-checked

The exempt set is derivable two independent ways, and this chapter runs both because a single
derivation of an exemption is exactly the shape of claim that goes wrong quietly.

**By schema shape.** Exactly three registered tools declare an empty input schema:

```
grep -rn "z.object({}).shape" src/
```

`src/server/server-info-tools.ts:13` (`get_server_info`), `src/server/server-context-tools.ts:21`
(`init_agent_context`), `src/server/server-workflow-tools.ts:15` (`get_server_workflow`).

**By the gate's own exclusion set.** The middleware carries a hard-coded three-name set at
`src/transport/context-token-middleware.ts:5`–`:9`:

```ts
export const EXCLUDED_TOOLS = new Set([
  'init_agent_context',
  'get_server_info',
  'get_server_workflow',
]);
```

**The two derivations name the same three tools.** They are independent — one is a property of the
schema, the other a literal in the transport — so their agreement is evidence rather than a
restatement. Nothing in the tree keeps them in step: a fourth empty-schema tool would not add itself
to `EXCLUDED_TOOLS`, and a name removed from `EXCLUDED_TOOLS` would not gain a schema. That they
agree **at this cutoff** is a fact about this cutoff, and §4 gives it a detection method.

### 1.3 Gated — 43, derived as a mapping and not as a subtraction

`46 − 3 = 43` is arithmetic, not evidence. The gated figure is derived here as a **mapping**: every
gated tool must declare `context_token` in its input schema, so the declarations should map
one-to-one onto the non-exempt registrations, module by module.

```
grep -rn "context_token:" src/
```

Forty-three schema declarations, reconciled against the registration counts of §1.1:

| Registering module | Registered | Exempt | Gated | Where the `context_token` declarations live |
| --- | --- | --- | --- | --- |
| `chunk-tools.ts` + `topic-tools.ts` + `query-tools.ts` | 12 | 0 | 12 | `src/domain/types/persistence-tools.ts` ×12 |
| `spaced-repetition-tools.ts` | 7 | 0 | 7 | `src/domain/types/spaced-repetition-tools.ts` ×6; `src/domain/types/recommendations.ts:118` ×1 |
| `session-lifecycle-tools.ts` + `session-progress-tools.ts` | 7 | 0 | 7 | `src/domain/types/session-management-tools.ts` ×6; `src/server/session-progress-tools.ts:131` ×1 |
| `teaching-tools.ts` | 5 | 0 | 5 | `src/domain/types/teaching.ts` ×4; `src/server/teaching-tools.ts:35` ×1 |
| `analytics-tools.ts` | 3 | 0 | 3 | `src/domain/types/analytics.ts` ×3 |
| `content-tools.ts` | 3 | 0 | 3 | `src/domain/types/content-tools.ts` ×3 |
| `notes-tools.ts` | 3 | 0 | 3 | `src/domain/types/notes-tools.ts` ×3 |
| `session-tools.ts` | 1 | 0 | 1 | `src/domain/types/session.ts:208` |
| `remediation-tools.ts` | 1 | 0 | 1 | `src/domain/types/remediation.ts:17` |
| `search-tools.ts` | 1 | 0 | 1 | `src/domain/types/search-tools.ts:30` |
| `server-info-tools.ts` | 1 | 1 | 0 | — |
| `server-context-tools.ts` | 1 | 1 | 0 | — |
| `server-workflow-tools.ts` | 1 | 1 | 0 | — |
| **Total** | **46** | **3** | **43** | **43 declarations** |

**Every row balances.** The mapping is exact in both directions: no gated tool lacks a declaration
and no declaration lacks a gated tool. Three `context_token` occurrences are deliberately excluded
from the count because they are not schema declarations — `src/domain/types/teaching.ts:391` and
`:492` are destructuring targets inside `.transform()` bodies, and
`src/server/server-context-tools.ts:39` is a **response** field, the token `init_agent_context`
mints.

**The claim that survives the count.** `F-S5-3` of C010 states the durable form and this chapter
adopts it verbatim: *the set of gated tools lacking `context_token` is empty*. That claim does not
go stale the next time a tool is registered; `43` does.

### 1.4 Reconciliation against C010's `F-S5-3`

| Figure | C010 `F-S5-3` | Re-derived here at `35f92ba` | Verdict |
| --- | --- | --- | --- |
| Registered | 46, across 16 registering modules | 46, across 16 registering modules | **agrees** |
| Gated | 43 | 43 | **agrees** |
| Exempt | 3 | 3 | **agrees** |
| Named `*InputShape` declarations | 41 imported from `src/domain/types/` + 1 module-local | 41 in `src/domain/types/` + 1 module-local at `src/server/session-progress-tools.ts:131` | **agrees** |
| Genuinely inline declarations | 1 (`teach_next`) | 1 — `src/server/teaching-tools.ts:35`, inside the `z.object({` at `:34` | **agrees** |

**The named-declaration row is deliberately written as a sum and not as its total.** `41 + 1` is a
count of *named `*InputShape` constants* — a different quantity from the tool surface — but its total
is numerically identical to the superseded tool-surface miscount. Writing that numeral here, in a
column headed *"Re-derived here"*, would put it in the package as a re-derived codebase fact and
would be picked up by exactly the grep that exists to keep it out. The split is the useful form in
any case: it is the granularity at which C010's own figure went wrong, and it is what a reader
re-running the derivation actually compares. C010's `F-S5-3` states the total in its own text; this
chapter reproduces the split without restating the total.

`F-S5-3` lives at
`../C010-system-and-repository-architecture/02_findings-register.md:249`–`:254`, and `F-S8-1` — its
miscount-not-staleness diagnosis — at `:604`–`:609`.

**The reconciliation agrees at the finest granularity C010 published**, not merely on the three
headline numbers: the 41/1/1 split of *where* the declarations live is reproduced independently.
That is the level at which C010's own charter figure went wrong — its `40 named` omitted three
declarations, so a reader doing the arithmetic would have been wrong about *which* tools needed
work, not just about how many. **No finding is routed to `NEU-895`.** The re-count corroborates the
settled correction; the escalation route in `R11` stays live but did not fire.

**What `F-S8-1` means for this chapter's own method.** `F-S8-1`'s diagnosis is that C010's figures
were not *stale* — they were produced by running the verification procedure itself, and still came
out wrong. A re-count is therefore not made trustworthy by being recent. It is made trustworthy by
being **re-runnable and disaggregated**, which is why §1.1–§1.3 publish the per-module tables and
the exact commands rather than three numbers.

### 1.5 The prompt surface — counted separately, and deliberately not folded in

`createMcpServer` registers **three prompts** alongside the 46 tools —
`scaffolding` (`src/transport/create-server.ts:25`), `chunk_generation` (`:45`) and
`chunk_management` (`:80`). The **registered MCP entry-point surface is therefore 49: 46 tools plus
3 prompts.**

They are counted separately and never added to the tool figure, because the settled 46 / 43 / 3 is a
*tool* figure and a package that quietly widened it would reproduce exactly the propagation defect
this outcome exists to prevent.

The prompts matter to a compatibility contract for one reason: **the gate cannot see them.** The
middleware's first predicate is `body?.method !== 'tools/call'`
(`src/transport/context-token-middleware.ts:51`), so `prompts/list`, `prompts/get`, `tools/list` and
the initialize handshake all pass it untouched, on both transports. On HTTP the JWT middleware
covers all methods at `/mcp` (`src/transport/http.ts:164`) and is the real boundary — **but only when
auth is configured**, since the mount is guarded by `if (authConfig)` at `:163`. On STDIO there is no
boundary at all.

**This is not an isolation leak, and the chapter says so rather than implying it.** All three prompt
handlers call `promptPack.getPrompt(...)` on caller-supplied arguments alone; none takes `ctx`, none
reads the database, and none can return learner content. The finding is about the **completeness of
the counted surface**, not about exposure. Recorded as `F-S11-3`.

### 1.6 The `42` disclosure

**`42` appears nowhere in this chapter as a codebase fact.** The superseded miscount is named only
as the thing that was superseded. Two things in this chapter come close enough that stating the bare
claim and stopping would be the same false self-certification the claim exists to prevent, so both
are disclosed.

**First, one citation resolves to a line 42.** §4 (the `CH-7` row) and §8 cite
`src/infrastructure/db/client.ts:42` — the connection pool's `max: 4`, SUB-15's `C-1` input
(`15_operational-objectives-for-the-real-platform.md:75`). That is a line number that happens to be
42; it is not a tool count.

**Second, one genuine re-derived quantity in this chapter totals 42 — and its total is therefore
deliberately not written.** The named `*InputShape` declarations are 41 imported plus 1 module-local
(§1.4). That is a count of named constants, not of tools, and it is written as a sum precisely so the
numeral does not enter the package as a re-derived codebase fact.

Both disclosures are made here so SUB-17's citation audit meets the explanation rather than the
anomaly — exactly as `08_consent-and-what-a-learner-can-export-and-erase.md` §11 records having had
to correct when an earlier revision of that chapter claimed no citation in it resolved to a line 42.
That correction is the precedent for making the disclosure positively rather than asserting an
absence.

---

## 2. What "gated" actually means — four qualifications the word hides

The contract below is unreadable without these. Three are consumed from siblings and one is derived
here; none is re-litigated.

1. **"Gated" is HTTP-only today — and conditional even there.** The gate is Express middleware
   (`src/transport/context-token-middleware.ts:43`) mounted at `src/transport/http.ts:186`, under an
   `if (contextTokenRepo)` guard at `:185`; the JWT layer above it is likewise guarded by
   `if (authConfig)` at `:163`. Neither is unconditional, so *"gated"* means *gated on a deployment
   that configured the thing that gates*. The STDIO limb of the transport switch
   (`src/transport/main.ts:55`–`:59`) connects
   `createMcpServer(ctx)` to a bare `StdioServerTransport` with nothing interposed. Consumed from
   `F-S16-3`, whose hand-forward asks this chapter to **meet** the qualification rather than
   rediscover it.
2. **The gate fails open on internal error.** `catch (err) { … next(); }`
   (`src/transport/context-token-middleware.ts:83`–`:86`). A gate that admits the request when its
   own validation throws is not a gate under fault. Also `F-S16-3`.
3. **The gate checks validity, not identity.** It calls `repo.validateWithStatus(...)` (`:73`) and
   nothing else. The token names no principal — that is C010's `OI-S8-1`, for which SUB-4's
   `DR-C11-S4-2` supplies the mechanism and which remains open because its resolving event is a
   migration this package may not produce.
4. **STDIO is the default, not the exception.** `resolveTransportConfig` defaults `TRANSPORT` to
   `'stdio'` (`src/config/resolve-transport-config.ts:35`). Every process launched without an
   explicit choice takes the ungated limb.

---

## 3. The changes this package's mechanism implies

Seven, drawn from the three consumed decisions. Each is a change to the *core* surface; none is an
application concern.

| Id | Change | Source |
| --- | --- | --- |
| `CH-1` | The STDIO transport gains an identity gate; a gated tool is refused when no principal is configured | `DR-C11-S4-1` clauses 2–3 |
| `CH-2` | `context_token` stops meaning *"you called `init_agent_context`"* and starts meaning *"you are this principal"* | `DR-C11-S4-2`; `F-S4-5` |
| `CH-3` | The `context_tokens` row carries a principal identifier, a determined kind and a claim provenance | `DR-C11-S4-2` |
| `CH-4` | Every pre-existing context token is rejected and deleted rather than grandfathered | `DR-C11-S4-3` |
| `CH-5` | Every row-owning read and write is confined by a predicate bound to the principal, inside the query the adapter already issues | `DR-C11-S5-1` clauses 1–2 |
| `CH-6` | A `client`- or `none`-kind principal is **refused**, not empty-scoped, on every row-owning operation | `DR-C11-S5-1` clause 3 |
| `CH-7` | Adapter instances become request-scoped rather than process-scoped | `DR-C11-S5-1` clause 4 |

---

## 4. The contract

For each change: the **obligation** on whoever ships it, the **breaking verdict**, and a **detection
method** — the thing a client operator or a CI job could actually run to discover the change had
occurred.

| Id | Compatibility obligation | Breaking? | Detection method |
| --- | --- | --- | --- |
| `CH-1` | Ship behind a stated version boundary with an operator configuration step documented before the boundary, not after. No permissive mode. | **Breaking** — unavoidably so, and already priced by C010's `CC-S8-3` as *"breaking, and unavoidably so"* (`../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:552`) | **Behavioural probe, not schema diff.** Call any gated tool over STDIO with no principal configured and assert a refusal carrying a named reason. A schema diff sees nothing: no input schema changes. |
| `CH-2` | State the changed *meaning* of an argument whose *shape* is unchanged. Every gated tool already declares `context_token` (§1.3), so **zero schemas newly declare it** and a schema diff is empty by construction. | **Breaking in effect, invisible in shape** | **Semantic probe.** Mint a token as principal A, present it on a tool call that reads principal B's rows, assert refusal. Before `CH-2` the same sequence succeeds. This is the class §4.1 exists for. |
| `CH-3` | Additive columns, nullable at **stage A**, tightened to `NOT NULL` at **stage D** — SUB-4's four-stage set, `04_the-stdio-identity-gate-and-the-bound-context-token.md:441`–`:446`, consumed here and named so a reader of this chapter alone can resolve the labels. Publish the row's meaning, since the token becomes learner-identifying and inherits a retention question it did not have. | **Non-breaking.** SUB-4 classifies stage A and stage D both `No`, and this chapter adopts that verdict unchanged; the stage-D tightening acts on rows the stage-D purge has already removed, never on a client | **Schema diff** — this is the one change a schema diff does see, and it sees the database schema, not the tool schema. |
| `CH-4` | Announce token invalidation as a one-time event at the version boundary. Every live client re-mints on its next call. | **Breaking, briefly** — every client's in-flight token stops working exactly once | **Behavioural probe.** Present a token minted before the boundary; assert the documented rejection rather than a generic failure. |
| `CH-5` | Confinement must be a predicate inside the query the method already issues — not a filter applied after, and not a guard above the port boundary. | **Non-breaking for a correctly-scoped client; breaking for any client relying on cross-learner reads** | **Differential-result probe.** Two principals, disjoint fixtures, assert A's call returns none of B's rows. Note the T5 limb of SUB-5's test design: a predicate that refuses *everyone* also passes a naive isolation test, so the probe must assert A sees A's rows, not merely that A sees none of B's. |
| `CH-6` | Refusal must be distinguishable from an empty result. `DR-C11-S2-2` rejects empty-scoping on the ground that a silent empty result is indistinguishable from a learner with no data. | **Breaking for every `client`-kind principal.** Whether the deploy pipeline's smoke principal is one is **`[unconfirmed]`** — see §7 and `A-S11-2` | **Behavioural probe.** Authenticate with `client_credentials`, call a row-owning tool, assert a *refusal* and specifically **not** a `200` with an empty array. This probe also settles the `[unconfirmed]` premise, which is why it is worth running before the change rather than after. |
| `CH-7` | Per-request construction must not add a database round-trip or a connection acquisition. SUB-5 §12 reports zero of each for clauses 1–4. | **Non-breaking** | **Load probe against `OBJ-1`.** Concurrency > 4 against the pool at `max: 4` (`src/infrastructure/db/client.ts:42`) is the first thing that breaks; assert no regression in queueing behaviour. |

### 4.1 The class a schema diff cannot see, stated as its own class

`CH-2`, `CH-5` and `CH-6` change **semantics without changing schema shape**. This is the acceptance
criterion the outcome names specifically, and it is worth stating why the class is dangerous rather
than merely listing it.

The obvious compatibility check for an MCP server is a **tool-manifest diff**: capture `tools/list`
before and after, diff the names and the JSON schemas, and report the delta. Against this package's
mechanism that check returns **empty**. All 46 names are unchanged. All 43 gated input schemas are
unchanged — `context_token` was already required on every one of them, so nothing is added and
nothing is widened. The three exempt schemas are unchanged. A team whose compatibility gate is a
manifest diff would ship `CH-1` through `CH-7` and see a green check.

**The detection method that does work is a behavioural conformance suite**, and its distinguishing
property is that it asserts on *refusals and row visibility*, not on shapes. Concretely, four probes
that a manifest diff cannot express:

| Probe | Asserts | Catches |
| --- | --- | --- |
| `P1` no-principal STDIO call | refusal with a named reason | `CH-1` |
| `P2` cross-principal read | A's call returns none of B's rows **and** returns A's own | `CH-2`, `CH-5` |
| `P3` service-principal call | refusal, **not** `200` + empty | `CH-6` |
| `P4` stale-token call | documented rejection | `CH-4` |

`P2`'s second limb and `P3`'s negative form are the load-bearing parts. Each exists because the
failure it catches **presents as success**: a predicate that refuses everyone passes `P2`'s first
limb, and an empty-scoped service principal passes a naive `P3`.

### 4.2 The 3 gate-exempt tools — a stated decision, not a silent inclusion

`get_server_info`, `get_server_workflow` and `init_agent_context` stay exempt, and this is recorded
as a decision because the alternative is defensible.

**Why they stay exempt.** `init_agent_context` is the mint path — gating it on possession of a token
is circular. `get_server_info` and `get_server_workflow` return build metadata and a static workflow
description; neither takes `ctx` (`src/server/tools.ts:27`–`:28` pass the server alone), so neither
can read learner state.

**What the exemption costs, stated.** An unauthenticated caller on STDIO can enumerate the server's
identity, its version and its intended workflow, and can mint a context token. Under `CH-1` the mint
becomes principal-bound, so the third of those stops being free; the first two remain free by
design.

**Exemption is a transport property and does not reach the enforcement point.** An exempt tool
bypasses the context-token gate; it does **not** bypass `DR-C11-S5-1` clause 3, which sits at the
adapter, below both transports. `init_agent_context` is the case that proves it — it is gate-exempt
and nonetheless issues six row-owning port reads, every one of which clause 3 refuses for a
`client`-kind principal (§7.3). A reader who generalises *"exempt tools are unaffected"* from this
section to confinement will get that wrong, and the generalisation is the natural one, so it is
blocked here explicitly.

**What is not claimed.** That three is the right number *forever*. §1.2 established that the two
derivations of the exempt set agree at this cutoff and that nothing in the tree keeps them in step.
The detection method for that drift is a **set-equality assertion** between the empty-schema tools
and `EXCLUDED_TOOLS` — one test, not a review. It does not exist today; recorded as `OI-S11-1`.

---

## 5. The two-transport check

Every implied core change, checked on both transports. A divergence is named with an owner rather
than averaged away.

| Id | HTTP | STDIO | Holds on both? |
| --- | --- | --- | --- |
| `CH-1` | Already gated (`src/transport/http.ts:186`) | Requires the gate to reach STDIO — a **rewrite**, not a mount (`F-S4-4`) | **Divergent in cost, convergent in outcome.** Owner of the extraction: `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`. Priced in §6 |
| `CH-2` | Holds | Holds | **Yes** — the meaning is a property of the row, not the transport |
| `CH-3` | Holds | Holds | **Yes** — a database schema change is transport-independent |
| `CH-4` | Holds | Holds | **Yes** |
| `CH-5` | Holds | Holds | **Yes** — the enforcement point is the adapter, below both transports. This is the principal virtue of SUB-5's placement |
| `CH-6` | Holds | Holds | **Yes**, and unconditionally on any middleware being mounted (`F-S5-12`) |
| `CH-7` | Holds | Holds | **Yes** |
| *(audit parity)* | Audit middleware mounted (`src/transport/http.ts:180`) | **No** — `createAuditMiddleware` returns an Express `RequestHandler` (`src/transport/audit-middleware.ts:23`) and there is nothing to attach it to | **No. Named divergence.** A refusal on STDIO leaves no record. Owner: SUB-16 (`NEU-999`) for the audit-parity limb; carried as `R-S4-4` |

**Six of seven hold on both transports unconditionally.** The seventh (`CH-1`) converges in outcome
and diverges in cost. The one genuine divergence is **audit parity**, and it is not one of the seven
changes — it is a clause-4 obligation of `DR-C11-S4-1` that no check in the isolation invariant
measures. SUB-4 states this at §10.1 non-claim 3: audit parity is not required for `I4`, so
descoping it must be argued as an observability decision and cannot be justified by pointing at a
green `I4`. This chapter adds only that a compatibility contract cannot promise **equal
reconstructability** across transports while it stands.

---

## 6. Pricing `F-S4-4`'s unpriced cost

`F-S4-4` establishes that the gate cannot be *mounted* on STDIO because there is nothing to mount it
on, and closes: *"this finding states that it exists, not what it costs."* Pricing it is this
chapter's work.

### 6.1 The units, re-derived at this cutoff

The `/mcp` pipeline has **seven mounted layers** before the route handler:

| # | Layer | Mount | Conditional on | Transport-neutral? |
| --- | --- | --- | --- | --- |
| 1 | Origin / DNS-rebinding guard | `src/transport/http.ts:108` | auth configured, non-wildcard allowlist | **No** — browser-specific |
| 2 | CORS | `:123` | always | **No** — HTTP-specific |
| 3 | Correlation id | `:153` | always | **Yes**, but declared **inline** and therefore unextractable as it stands |
| 4 | JWT | `:164` | auth configured | Concept yes, mechanism no — reads an `Authorization` header |
| 5 | Per-subject rate limiter | `:173` | auth + limit configured | Concept yes — but keys on the JWT subject |
| 6 | Audit | `:180` | audit DB URL present | Concept yes — needs a response object |
| 7 | Context-token gate | `:186` | token repo present | Concept yes — needs a short-circuiting response writer |

**Layers 3–7 are the five a STDIO equivalent would have to carry.** Layers 1–2 have no STDIO
analogue and are correctly HTTP-only.

The code the extraction ranges over, in units that can be counted:

- **Four Express-typed middleware modules**, in four files totalling **480 lines**:
  `jwt-middleware.ts` (150), `rate-limit-middleware.ts` (113), `audit-middleware.ts` (129),
  `context-token-middleware.ts` (88). *(File totals, not middleware-body totals — stated so the unit
  is not mistaken for a more precise measurement than it is.)* All four are Express-typed, but **not
  uniformly**, and the seam has to absorb all three shapes: `createAuditMiddleware` returns
  `RequestHandler` (`audit-middleware.ts:23`) and so does `createContextTokenMiddleware`
  (`context-token-middleware.ts:46`); `createJwtMiddleware` returns **`Promise<RequestHandler>`**
  (`jwt-middleware.ts:87`), so its mount is `await`ed; and `createRateLimiter` returns a
  **`RateLimiter` object** (`rate-limit-middleware.ts:21`, `:57`) whose `middleware` property is the
  `RequestHandler` (`:70`), mounted as `createRateLimiter(cfg).middleware` (`http.ts:173`).
- **Three inline anonymous middlewares** in `http.ts` (`:108`, `:123`, `:153`), roughly 47 lines,
  one of which (correlation) is transport-neutral in concept and inline in fact.
- **The STDIO limb to attach them to: three statements** at `src/transport/main.ts:56`–`:58`, inside
  a five-line `else` block spanning `:55`–`:59` whose first and last lines are the braces. The two
  figures describe different spans and are stated separately so they are not read as one.
- **`createPrmHandler` (`src/transport/prm-handler.ts:4`) is excluded** — it is an HTTP route
  handler serving protected-resource metadata, not a pipeline layer, and has no STDIO analogue.

### 6.2 What the seam must supply — and why this is not a refactor of `src/transport/`

Each of layers 4–7 depends on an affordance the MCP STDIO path does not have. JWT reads a request
header; STDIO has no headers. The rate limiter keys on the JWT subject; STDIO has no subject until a
principal is configured. Audit reads a request and a response and writes a response body bounded at
65 536 bytes (`OBJ-11`, `15_operational-objectives-for-the-real-platform.md:258`); STDIO has no
response object. The gate reads `body.params.arguments.context_token` and short-circuits with
`res.json(...)`; STDIO has no response writer.

So the seam must supply three things: **a request-like carrier holding the JSON-RPC envelope, a
response writer that can short-circuit, and an ordered chain with a `next()`.** That is an
MCP-level middleware abstraction.

**The load-bearing consequence: the MCP SDK offers no such interposition point at the layer that
needs it.** `createMcpServer` (`src/transport/create-server.ts:17`–`:23`) constructs a bare
`McpServer` and hands it to a single `registerServerTools(server, ctx)` call at `:23`; that call
fans out through `src/server/tools.ts:17`–`:30` to the 46 individual `server.registerTool(` sites
enumerated in §1.1. There is no documented hook
between "a `tools/call` arrives" and "the registered handler runs". The extraction must therefore
land in one of two places, and this is the real fork in the price:

| Option | Where it lands | Blast radius | Consequence for the compatibility contract |
| --- | --- | --- | --- |
| **A — wrap the server** | One adapter around `McpServer`/transport connection, interposing on the JSON-RPC message stream before dispatch | `src/transport/` only; the 46 registration sites are untouched | The contract's surface figures stay valid. Preferred |
| **B — wrap the handlers** | A decorator applied at each `registerTool` call site | **All 46 registration sites**, across 16 modules | Every tool's registration changes. A manifest diff still shows nothing, but the change set is 16× wider and the risk of a missed site is real — a *missed* site is an ungated tool |

**Option B's failure mode is silent and is the reason this fork is priced rather than noted.** A
forgotten decorator on one of 46 sites produces a tool that is registered, believed gated, and
ungated. Nothing in §1.3's mapping would catch it, because the mapping checks *schema declarations*,
not *handler wrapping*. If the extraction takes option B, the compatibility contract acquires a
detection obligation it does not otherwise have: an assertion that the wrapped-handler set equals
the non-exempt registered set. Recorded as `OI-S11-2`.

### 6.3 The price, expressed as three delivery tiers — and what each does to the seven paths

**This is the substance.** SUB-4's seven paths are classified *under the assumption that the gate
reaches STDIO*. That assumption has a price, and an unpaid price does not leave the seven paths as
they are — **it silently re-classifies them.** Three tiers:

- **Tier F (full extraction).** Layers 3–7 reach STDIO. Cost: option A or B above, plus the
  correlation layer extracted from inline. Audit parity achieved.
- **Tier G (gate only).** Layer 7 alone reaches STDIO; audit does not. The `R-S4-4` outcome — the
  refusal happens and leaves no record.
- **Tier N (none).** The extraction is cut. `CH-1` does not ship. `CH-5`–`CH-7` still ship, because
  the enforcement point is the adapter and is below both transports.

| # | Path (SUB-4 §9) | Tier F | Tier G | Tier N |
| --- | --- | --- | --- | --- |
| 1 | Exempt-tool caller | unaffected | unaffected | unaffected |
| 2 | Gated tools, no principal configured | **broken by design** | **broken by design**, unlogged | **unaffected — and the guarantee is silently absent** |
| 3 | Gated tools, principal configured | degraded (one-time config) | degraded, unlogged | **unaffected — no principal is read, so nothing confines** |
| 4 | `TRANSPORT` unset — the default | **broken until configured** | **broken until configured**, unlogged | **unaffected — the largest class stays ungated** |
| 5 | Harness constructing `createMcpServer(ctx)` directly | unaffected | unaffected | unaffected |
| 6 | Deploy-pipeline smoke run (HTTP) | broken by `CH-6` | broken by `CH-6` | **still broken by `CH-6`** — see §7. Tier-independent, but **conditional on `A-S11-2`**: the whole row assumes the smoke principal resolves to kind `client` |
| 7 | STDIO client presenting a bearer token | unaffected (accepted) | unaffected (accepted) | unaffected (still ignored) |

**Three readings, and the third is the one that matters.**

1. **Tier N is not "the change didn't happen".** Paths 2, 3 and 4 read *unaffected* under Tier N —
   the same word row 1 carries — and that is precisely the danger. A reader scanning the column sees
   five unaffected rows and concludes STDIO came through the change well. What actually happened is
   that **the STDIO transport kept its current property of admitting every caller as nobody**, while
   the rest of the package shipped and the schema grew an ownership column. `R-S5-1` and `R1` both
   name the general form of this: an ownership column present in the schema is the strongest
   available evidence *to a reader* that confinement exists.

2. **Tier N is not safe-by-default; it is asymmetrically unsafe.** `CH-5`–`CH-7` land regardless,
   so under Tier N the adapter confines by a principal that the STDIO path never supplies. What a
   STDIO caller gets is the `none` kind — and clause 3 refuses it. So Tier N does not leave STDIO
   working *and* unconfined; it leaves STDIO **refused at the adapter with no gate to explain why**.
   Path 2, 3 and 4's "unaffected" is unaffected *by the gate*, not unaffected in outcome. Row 6's
   independence (`F-S5-12`) is the same fact seen from the HTTP side. **This is the pricing's
   principal result and it is recorded as `F-S11-4`.**

3. **The gap between Tier F and Tier G is exactly one property: reconstructability.** Both refuse
   identically, so `I4` passes under either. What Tier G loses is the ability to answer *"who was
   refused, and when"* on STDIO — which is why `R-S4-4` warns that work priced as a mount and
   discovered to be a rewrite is the work most likely to be cut, and why a green `I4` may not be
   cited as the argument for cutting it.

4. **The table itself is now the exposure, and it is registered as one.** Once a tier determines
   what three of the seven rows mean, the seven-path table stops being tier-independent — and it is
   the artifact a rollout planner will actually consult, in SUB-4's chapter, where no tier column
   exists. A planner reading it after the extraction is cut sees five *unaffected* rows and concludes
   STDIO came through the change well. That is a distinct hazard from `R-S4-4`'s (which is about the
   audit limb being cut) and from `F-S11-4`'s (which is the technical fact), so it is carried as its
   own risk entry, **`R-S11-2`**, owned by SUB-7 (`NEU-1001`) for the tier choice and by
   `SUB-10 of C010 (NEU-984)` for the extraction's scope, escalating to `NEU-896`.

**What this pricing does not do.** It does not give a number of hours or a line count for the
extraction itself. The tree supports counting *what must be ranged over* (§6.1) and *where it must
land* (§6.2); it does not support estimating effort, and no estimate is offered. `F-S4-4` said the
cost exists; this section says **what it is a cost of, which fork determines its size, and what
happens to each of the seven paths if it is not paid**. Recorded as `F-S11-4`.

---

## 7. The deploy-pipeline smoke run, walked as the existing client it is

The CD pipeline's smoke job (`.github/workflows/cd-prod.yml:110`–`:174`) is an MCP client that runs
against production on every release. It authenticates with `grant_type=client_credentials` (`:158`)
and runs `pnpm run test:smoke` (`:174`), which executes `tests/smoke/smoke.test.ts`. It is read from
those two files, **not observed running** (`CAP-S11-1`) — so it is a client this chapter can
establish exists in the pipeline, not one whose behaviour anyone here has watched.

### 7.1 The premise this walk rests on, stated before the walk

**`[unconfirmed]`.** The whole of §7 assumes the production `client_credentials` token carries **no
`sub`**, so that SUB-2's rule resolves the smoke principal to kind `client` and `DR-C11-S5-1` clause
3 refuses its row-owning operations. **That is a belief, not an observation.** It is recorded in a
code comment at `src/transport/jwt-middleware.ts:116`, registered as C011's `OI-S1-1` with
`SPK-S1-1` as the spike that would settle it — **not executed, confidence `none`** — and SUB-2
carries its complement as `R-S2-2`, the risk that the smoke principal acquires a `sub` and silently
becomes a learner owning production rows.

**SUB-4 kept both branches live** (`92_risk-register.md:279`: *"Both are live because `OI-S1-1` /
`SPK-S1-1` are open and no token has been observed"*), and this chapter does **not** close either.
It walks the branch where the belief holds, because that is the branch that produces a compatibility
obligation. **On the other branch the walk inverts: 8 of 8 scenarios pass, `CH-6` breaks no existing
client, and §6.3 row 6 is wrong.** Registered as **`A-S11-2`**, with the `P3` probe of §4.1 as the
one action that settles it.

### 7.2 The walk, on the branch where the premise holds

| # | Scenario | Line | Row-owning? | Under this contract |
| --- | --- | --- | --- | --- |
| 1 | `GET /health` | `:104` | no | **passes** — not on `/mcp`, no middleware |
| 2 | `GET /version` | `:111` | no | **passes** — same |
| 3 | MCP `initialize` handshake | `:128` | no | **passes** — not `tools/call` |
| 4 | `initialized` notification | `:152` | no | **passes** |
| 5 | `init_agent_context` returns a token | `:163` | **yes — six of them** | **passes, but not for the reason gate-exemption suggests** — see §7.3 |
| 6 | `list_learning_items` | `:200` | **yes** | **FAILS** — refused at the adapter |
| 7 | `session_status` for a nonexistent id | `:231` | **yes** | **FAILS** — refused at the adapter, and the test asserts a *specific* error, so a refusal fails it even though it expects an error |
| 8 | session `DELETE` cleanup | `:263` | no | **passes** |

**Six of eight pass; two fail, and both fail for the reason the design intends.** The deploy gate
therefore fails on every release from the moment `CH-6` lands.

### 7.3 Scenario 5 is row-owning, and it survives on a fail-open rather than on its exemption

Gate exemption is a **transport** property and the enforcement point is the **adapter**, so an exempt
tool is not thereby exempt from confinement — the distinction §6.3 reading 2 turns on. Scenario 5 is
the case that makes it concrete, and classifying it *not row-owning* would have been wrong.

`init_agent_context` calls `ctx.buildLearnerContext()` (`src/server/server-context-tools.ts:27`),
which fires **six row-owning port queries in parallel**
(`src/orchestration/learner-context-workflows.ts:95`–`:103`): `chunks.batchFetchMinimal()`,
`topics.batchFetchMinimal()`, `sessions.getActiveSession()`, `sessions.listSessions(...)`,
`reviewPersistence.getWeakAreas()` and `reviewPersistence.getReviewsByDateRange(...)`. Under
`DR-C11-S5-1` clause 3 every one of them is refused for a `client`-kind principal.

**The scenario still passes — because the call is wrapped in a fail-open.**
`src/server/server-context-tools.ts:28`–`:31` catches any error from `buildLearnerContext`, logs a
warning and returns `null`; the smoke assertion at `tests/smoke/smoke.test.ts:191`–`:194` accepts
`learner_context: null` as *"graceful degradation"*. So the verdict is *passes*, and the mechanism is
a swallowed refusal rather than an absence of row-owning work.

**Two consequences worth stating.** The smoke suite would go green while silently losing the entire
learner-context payload, which is a degradation no assertion in it detects — the same shape as
`R-S5-1`, where a safe-direction failure passes every test anyone runs. And a reader who generalises
*"gate-exempt tools are unaffected"* from §4.2 to the enforcement point will get this wrong; §4.2 is
about the transport gate only. Not routed as a new finding: it is a property of the smoke suite and
of `CH-6`, both already owned, and it is stated here rather than absorbed.

**Three things this chapter adds to what `F-S4-3` and `F-S5-12` already establish.**

1. **The break is scoped, not total.** Two scenarios, both row-owning, both in the same class. The
   smoke suite does not need rewriting; it needs **two scenarios re-scoped or its principal
   re-provisioned**. That is a materially smaller obligation than "the smoke run breaks" suggests,
   and stating the size is this chapter's contribution.
2. **Scenario 7 fails in the way most likely to be misread.** It already expects an error, so a
   maintainer skimming a red run may read the refusal as the expected failure and "fix" the
   assertion. The failure to look for is a **refusal**, not the nonexistent-session error.
3. **Path 6 of SUB-4's table stays correct.** SUB-4 classifies it *unaffected here* because the
   STDIO limb does not touch it, counting it under the binding limb instead. That remains right:
   under **all three** tiers of §6.3 the smoke run is broken by `CH-6` alone, which is exactly
   `F-S5-12`'s point that the two causes are independent. Unmounting the gate does not unbreak it.

**The obligation, and its owner.** The two scenarios must be re-scoped, or the smoke principal
re-provisioned as a `user`-kind static client, **before** the enforcement stage lands. Owner: **the
creator, as sole maintainer and sole operator**, who owns `cd-prod.yml`; sequencing owner: **SUB-7
(`NEU-1001`)** under OUT-3. Both are already named by `F-S4-3` and `F-S5-12` and neither is re-opened
here.

---

## 8. What an existing client is **not** guaranteed

A client's guarantee cannot exceed what the enforcement point confines. SUB-5 enumerates **four
escapes** at `05_the-enforcement-point-that-confines-every-read-and-write.md:547` — *"Four things
escape, and each is named with its route"* — as §6.1, §6.2, §6.3 and §6.4. The table below carries
**three of SUB-5's four** and substitutes SUB-5's §7.4, and the substitution is deliberate rather
than a miscount:

- SUB-5's **§6.4** is the non-retroactive boundary. It is a *population* limit rather than a *path*
  outside the enforcement point, and it cuts in both directions, so it is carried below the table
  with its complement (`F-S8-2` under-reaching, `R-S5-1` over-reaching) rather than flattened into a
  one-line row that could only state one direction.
- SUB-5's **§7.4** names the operator and maintenance paths — `clearAllTables`, `deleteExpired` and
  direct `psql` access, *"outside every port and therefore outside the enforcement point entirely"*.
  That is a genuine path escape and belongs in a table of what the contract may not promise, even
  though SUB-5 reaches it while enumerating test coverage rather than in §6.

**So this is not SUB-5's four re-stated; it is four path escapes, three of them SUB-5's §6 rows.**
The bound is stated positively rather than left to inference.

| Escape | What the contract may not promise | Owner |
| --- | --- | --- |
| **Content egress via two external-service ports** (§6.1) — `EmbeddingPort`, `ContentClassifierPort` | That learner content stays inside the deployment. Chunk content and classifier prompts leave it, to an external provider. Not a cross-learner exposure; a data-protection surface | SUB-8 (`NEU-1002`) / `OI-S3-1`; the provider identity is `SPK-S8-1`, **not executed** |
| **`LD-S3-31`, the sixth copy class** (§6.2) — captures at `_local/scratch/` | That every copy of learner content is behind a port. This one is behind none, reached by no SQL statement. Membership at revision 1 is **zero** | The creator; destroyed on this package's publication |
| **`Tier2BlockingStatsRepository`** (§6.3, `F-S5-9`) — aggregates `infrastructure.operation_event_log`, a table with no ownership key sitting behind no port that **`NEU-850`'s `OUT-2`** reaches (qualified, per SUB-5's own wording at `05_the-enforcement-point-that-confines-every-read-and-write.md:590`; C011 has its own OUT-2 and a bare id would read as that one) | That every aggregate is confined. No predicate can be pushed below this one's aggregation | C010's `CAP-S3-3` / **C010's** `CAP-S4-1`, owner `NEU-986`, co-named `NEU-896` — cited qualified because C011 has a `CAP-S4-1` of its own (`94_caps-and-incomplete-scope.md:117`) |
| **Operator and `psql` paths** (§7.4) — `clearAllTables`, `deleteExpired`, and direct database access | That the operator is confined. Direct `psql` access is outside every port and therefore outside the enforcement point entirely | The creator, as sole operator; modelled by SUB-12 (`NEU-1005`) under OUT-17 |

**Two further limits on the guarantee, from elsewhere in the package.**

- **Attribution is not retroactive, and it cuts both ways.** Erasure **under-reaches** the
  pre-cutover population (`F-S8-2`, blocking) while confinement **over-reaches** it — a predicate on
  the ownership key excludes every row that has no owner, hiding pre-cutover rows from *everyone*,
  including the learner who created them (`R-S5-1`). A client guarantee about data access must
  assume neither problem away. **No row count is asserted**; the population's size is unobserved.
- **Concurrency.** Nothing in this contract implies a higher concurrency ceiling. `OBJ-1` fixes
  concurrent DB-bound tool calls at **≤ 4**, the pool at `max: 4`
  (`src/infrastructure/db/client.ts:42`) being the first structure that breaks, over a band of
  **2–200** concurrently active learners
  (`15_operational-objectives-for-the-real-platform.md:248`, `:131`, `:161`–`:163`). `CH-7` adds
  zero round-trips and zero connection acquisitions (SUB-5 §12), so it does not move the band —
  **but neither does it raise it.** A compatibility promise that implied more concurrency would
  contradict `OBJ-1`; none is made.

**And the honest ceiling on the whole document.** **No existing client's behaviour was observed.**
No production credential exists in this environment — `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and
`VPS_*` are all unset. Across the package, **twenty-one spikes are designed and zero have been
executed** once this sub-task's own entry is counted (§12 shows the enumeration). The client
population this contract is written for has **unknown size and unknown composition** — including the
smoke run of §7, which is established from `cd-prod.yml` and `smoke.test.ts` rather than observed
running. Recorded as `CAP-S11-1`, with `SPK-S11-1` as the bounded experiment that would close it.

---

## 9. The DP-specificity review

**The review's scope.** The constraint is that core changes be reusable, backward-compatible,
**non-DP-specific** and fail safely. The outcome asks whether *this package's mechanism* lets a
course-specific concept into the core surface.

**A note on the constraint's own provenance, because it is weaker than it looks.** The clause reaches
this sub-task as *"C005 charter `:61`"*, via the charter and this task's tracker description. **That
reference resolves to no file in this repository** — no C005 charter exists under `docs/research/` or
in `_local/`, the citation names no path, and no other C011 chapter cites C005 at all. It is also
invisible to the citation checker, which discards any candidate beginning with `:`
(`scripts/citation-paths/checker.ts:122`). So the clause is carried here **as the charter states it**,
and a reader cannot verify its wording against a source. That does not weaken the finding below —
`F-S11-2` is an observation about `src/`, true independently of which document phrases the rule — but
it does mean the *standard* is inherited on the charter's authority rather than read. Registered as
`OI-S11-3`.

**Verdict on this package's changes: clean.** Every one of `CH-1` … `CH-7` is expressed in
vocabulary that is either transport-generic (principal, principal kind, context token, transport) or
persistence-generic (ownership key, predicate, adapter). None names a subject, a course, a
curriculum or a rubric. The vocabulary check runs over the seven changes and returns **zero**
course-specific concepts introduced.

**But the review, run honestly over the surface it was pointed at, found one already there.** This
is reported rather than absorbed, because a compatibility contract that promised a non-DP-specific
core over a surface that already is not would be false.

`GradingPayloadShape` (`src/domain/types/teaching.ts:275`–`:287`) hard-codes four **required**
boolean criterion keys into a core MCP tool input schema:

```
correct_recurrence · correct_base_case · correct_iteration_order · complexity_stated
```

and its own `.describe()` names them — across `:285`–`:286`, the string being a two-line
concatenation — as *"Per-criterion booleans for the **DP** grading rubric. Each is true only if the
learner's answer demonstrably satisfies that criterion. All four are required."* These are
dynamic-programming concepts. A self-hoster teaching anything else cannot supply a meaningful
`correct_recurrence`, and cannot omit it.

**It reaches three of the 46 registered tools — and, separately, the prompt surface §1.5 counted:**

| Entry point | Registered at | Carries the rubric via |
| --- | --- | --- |
| `submit_answer` (tool) | `src/server/teaching-tools.ts:111` | `SubmitAnswerInputShape` (`src/domain/types/teaching.ts:306`), `grading:` at `:330` — **input schema** |
| `revise_grade` (tool) | `src/server/teaching-tools.ts:198` | `ReviseGradeInputShape` (`:467`), `grading:` at `:472` — **input schema** |
| `teach_next` (tool) | `src/server/teaching-tools.ts:19` | the `nextStep` guidance string at `:62` and `:88`, which spells the four keys out — **response payload** |
| The prompt surface | `src/transport/create-server.ts:25`, `:45`, `:80` | `formatQualityRubric()` (`src/shared/prompts/prompt-pack.ts:837`, `:855`, `:857`) names the same four keys and is spliced into seven prompt builders (`:247`, `:281`, `:319`, `:687`, `:731`, `:774`, `:818`) — **prompt text** |

**The fourth row exists because this chapter added the prompt surface to the counted set (§1.5,
`F-S11-3`), so a review that ranged only over the 46 tools would have been narrower than the surface
this chapter itself defined.** Three-of-46 is a floor for the tool surface, not a statement about the
49 registered entry points. The prompt reach is a distinct instance rather than a second copy of the
same one: `GradingPayloadShape` constrains what a client may *send*, while `formatQualityRubric()`
shapes what the server *tells* a client to send, and removing one would not remove the other.

**Three qualifications, so the finding is not over-read.**

1. **It is pre-existing.** Nothing in this package introduces it, and no amendment is routed to
   `NEU-895` on its account — it is not a C010 decision and does not contradict one.
2. **It is out of scope to fix here.** The remedy is a `src/` change, which this sub-task may not
   make by constraint.
3. **It is not an isolation or privacy defect.** It is a **reusability** defect, against the
   *reusable* and *non-DP-specific* limbs of the core-change clause the charter cites as C005 `:61`
   — whose own reference does not resolve to a file here (`OI-S11-3`, above). The observation about
   `src/` stands on its own reading; only the phrasing of the standard is inherited.

Recorded as `F-S11-2`, with `R-S11-1` for the residual exposure and `NEU-896` as the escalation
route, since a core-reusability breach is a program-level surface.

---

## 10. Position on `F-S3-3`'s risk-allocation conflict

**This chapter does not resolve `F-S3-3`. SUB-14 does.** What follows is the position this chapter
takes and the derivation behind it, stated because this sub-task is **co-named** in the finding and
because an unstated choice would leave SUB-14 with one more unknown rather than one fewer.

**The conflict.** `92_risk-register.md:33`–`:35` — SUB-1's forward-allocation table — assigns
`R10` = stale tool count (OUT-16, SUB-11), `R11` = lifecycle-no-upstream, `R12` = legal
determination. The charter's own § Risks table, read at this cutoff, has those three rows in the
order legal determination (Medium, OUT-9), **stale tool count (High, OUT-16)**, greenfield lifecycle
half (High, OUT-9). `F-S3-3` records the discrepancy and hands it to SUB-14, co-naming this
sub-task, whose *"own id is directly affected"*.

**The position: this chapter authors `R11`, computed from the charter alone.**

The rule is stated identically in two places — `README.md` § Id conventions and
`92_risk-register.md:17`: *"`R<n>` is the row's position in the charter's § Risks table."* Applying
it to an independent read of the charter's fifteen rows at this cutoff puts the OUT-16 row at
**position 11**.

**The derivation is cross-checked against six ids already claimed**, every one of which agrees with
charter position rather than with the allocation table:

| Claimed id | Author | Charter row content at that position | Agrees? |
| --- | --- | --- | --- |
| `R1` | SUB-5 | row 1 — mechanism ships, cross-learner exposure remains (Critical, OUT-8) | yes |
| `R8` | SUB-1 | row 8 — production access incident or capture leak (High, OUT-18) | yes |
| `R10` | SUB-3 | row 10 — legal determination asserted (Medium, OUT-9) | yes |
| `R12` | SUB-3 | row 12 — greenfield lifecycle half (High, OUT-9) | yes |
| `R13` | SUB-1 | row 13 — `n = 1` evidence (Medium, OUT-18) | yes |
| `R14` | SUB-1 | row 14 — spike becomes implementation (Medium, OUT-18) | yes |

`R11` is **unclaimed** — the hole `F-S3-3` predicted for the charter-computed branch. Taking `R10`
instead would collide with SUB-3's legal-determination entry, which is the other outcome `F-S3-3`
names. **Only one of the two branches is available**, and it is the one the stated rule produces.

**What is left to SUB-14, unchanged.** Whether SUB-1's allocation table at `:33`–`:35` should be
corrected, and if so by whom; and whether the two sources disagree because the charter moved or
because the table was written wrong. Neither is decidable here: `_local/` is gitignored and
unversioned, so the two readings cannot be diffed. `F-S3-3` explicitly declines to assert SUB-1
erred, and **this chapter declines with it**. SUB-1's entries are untouched. Carried as `A-S11-1`.

---

## 11. Consistency checks against C010

Run item by item; each returns a verdict rather than an assurance.

| C010 item | Check | Result |
| --- | --- | --- |
| `F-S5-3` — 46 / 43 / 3 | Re-derived independently at `35f92ba` (§1.4) | **Consistent**, to the 41/1/1 granularity |
| `F-S8-1` — miscount, not staleness | Method adopted: the re-count is published disaggregated and re-runnable rather than asserted as recent (§1.4) | **Consistent** |
| `DR-C10-S8-1` `R8-4` — reusable-core rule | Each of `CH-1` … `CH-7` checked for course-specific vocabulary (§9) | **Consistent for this package's changes.** One pre-existing breach found in the surface (`F-S11-2`) — not a C010 decision, so **no amendment routed** |
| `CC-S8-3` — *"breaking, and unavoidably so"* | Adopted unchanged for `CH-1` (§4) | **Consistent.** §6 is an **addition** to its pricing, as `F-S4-4` already established — not a contradiction |
| `DR-C10-S8-2` — token-bound over per-call identity | The gate reads a per-call *argument*, but a server-minted one (`F-S4-5`) | **Consistent** — `F-S4-5` records why this is not the contradiction it resembles, and this chapter cites it rather than re-deriving it |
| `../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md` §8 — regression boundary and detection-method tables | Consumed as constraints; §4's obligations are applied to this package's changes, not re-derived | **Consumed, not re-derived** |

**No amendment is routed to `NEU-895` by SUB-11.** `R11`'s escalation route is conditional on the
re-count contradicting 46 / 43 / 3; it agrees, so the condition did not arise. The route is recorded
because it remains live for any later re-count, not because it fired.

**One namespace note.** `F-S5-3` and `F-S8-1` are **C010's** ids and are cited qualified throughout.
This package has its own `F-S5-*` series (SUB-5's, `F-S5-1` … `F-S5-13`) and its own `F-S8-*` series
(SUB-8's) — both cited bare. C010 also has a sub-task 8, so **any `S<n>`-scoped id may collide**, and
the collision is not hypothetical inside this package either: **C011 has its own `CAP-S4-1`**
(`94_caps-and-incomplete-scope.md:117`) alongside C010's, and §8's escape table cites the C010 one,
so it is written qualified there.

**The disambiguating rule, stated precisely rather than generalised.** `README.md` § Id conventions
fixes it for **sub-tasks** — *"A C010 sub-task is always cited qualified … A bare `SUB-n` is always
this charter's own"* — and does **not** state a general rule for `F-`, `OI-`, `CAP-` or `R-` records.
This chapter applies the same convention to record ids by analogy, and says so rather than citing the
README for a clause it does not contain. `F-S2-2` records the underlying hazard for `OI-S1-2`, which
denotes different facts in the two packages.

---

## 12. Evidence posture and register integrity

**No spike in this package has been executed.** Enumerated directly from `96_spike-register.md`'s own
section headings at this cutoff: SUB-1 nine (`SPK-S1-1` … `SPK-S1-9`), SUB-15 four, SUB-2 three,
SUB-4 two, SUB-16 one, SUB-8 one, SUB-5 zero — **twenty before this sub-task**, and **twenty-one
designed, zero executed** once `SPK-S11-1` is counted. Both figures are stated because they answer
different questions, and every other statement of the total in this sub-task's own output uses
**twenty-one**.

The figure is stated here because it was wrong repeatedly in this package: `F-S4-6` records a
cumulative total of "twelve" that omitted SUB-15's four, and the correction was then computed on
different bases by three authors (sixteen, seventeen, eighteen). **It is re-derived here by
enumeration, not carried from `F-S4-6` or from SUB-8's note.**

**The tracker ids this package uses for SUB-11 and SUB-12 are inconsistent, and every hand-forward
addressed to this sub-task is misaddressed.** Three ids are used for two sub-tasks across merged
chapters: SUB-11 appears as `NEU-1003` (at `04_the-stdio-identity-gate-and-the-bound-context-token.md:735`,
`91_findings-register.md:258`, `:276`, `:285`, `93_open-items-and-provisional-register.md:350`,
`:361`) and as `NEU-1005` (at `91_findings-register.md:109`, `:356`,
`93_open-items-and-provisional-register.md:289`), while `NEU-1004` — this sub-task's own id — is used
for **SUB-12** in a dozen places. **The tracker settles it**: `NEU-1003` is SUB-9, `NEU-1004` is
SUB-11, `NEU-1005` is SUB-12, reproducing the decomposition's own publication table. Two of the
misaddressed hand-forwards are load-bearing for this outcome — `F-S4-4`'s unpriced cost (`:276`) and
`F-S4-5`'s changed-meaning obligation (`:285`) — and both are nonetheless discharged here, because
routing by `SUB-<n>` is unambiguous throughout and only the parenthetical id is wrong. Recorded as
**`F-S11-1`** and handed to SUB-14, which is the only party permitted to correct another sub-task's
entries; **nothing is corrected in place.**

**No claim in this chapter carries the `observed-in-production` evidence label.** Every codebase
claim is `observed-in-repository` at `35f92ba`; every claim about production behaviour is a
derivation from a repository fact, and is labelled as such where it appears.

**No QA pass is claimed, and the record that was supposed to carry that fact is missing.** The
capability registry resolves to `git, linear`; no capability owns the `qa-execution` surface, so the
autonomous QA phase is a genuine **Core Article 8 no-op** rather than a skipped gate. Four places in
the package rest that position on **`CAP-S1-3`** — one of them declining to file a per-sub-task cap
on its authority (`94_caps-and-incomplete-scope.md:197`), one answering a completeness-gate row *not
applicable* by pointing at it (`97_package-completeness-gate.md:232`), and two stating plainly that
it applies (`05_the-enforcement-point-that-confines-every-read-and-write.md:1408`;
`traceability/S5_the-enforcement-point.md:67`). **`CAP-S1-3` is not filed in
`94_caps-and-incomplete-scope.md`** — SUB-1 filed two caps, not three. The QA fact is unaffected and
undisputed; the routing is not, and the no-op is presently carried at package level by `README.md`
§ *"Verification note"* as prose rather than by any cap-register entry. Recorded as `F-S11-5` and
handed to SUB-14, and this chapter **also** declines to file a duplicate rather than resolving an
assembly-level gap with a per-sub-task record.

---

## 13. Source-change confirmation

**No file under `src/`, `drizzle/` or `tests/` changes in this sub-task**, and no test file is
written. Verified by `git diff --name-only origin/develop`.

The changed set is this chapter, the eight register appends, one decision record, one traceability
file, the two folder-index rows, three `docs/GLOSSARY.md` rows — **and `.current-task`**, a one-line
status breadcrumb at the repository root that the project's own convention writes
(`CLAUDE.md` § Status Breadcrumb). It is named here rather than glossed as *"only this package
directory"*, because it is the one path in the change set that sits outside `docs/` and the one line
in it that carries a deletion.

---

## 14. Ids allocated by this sub-task

| Register | Ids | Where each is derived |
| --- | --- | --- |
| Findings | `F-S11-1` … `F-S11-5` | §12 (`F-S11-1`, `F-S11-5`), §9 (`F-S11-2`), §1.5 (`F-S11-3`), §6.3 (`F-S11-4`) |
| Risks | **`R11`** (charter row 11), `R-S11-1`, `R-S11-2` | §10 (`R11`), §9 (`R-S11-1`), §6.3 reading 4 (`R-S11-2`) |
| Open items | `OI-S11-1`, `OI-S11-2`, `OI-S11-3` | §1.2 and §4.2 (`OI-S11-1`), §6.2 (`OI-S11-2`), §9 (`OI-S11-3`) |
| Caps | `CAP-S11-1` | §8 |
| Stand-ins | `A-S11-1`, `A-S11-2` | §10 (`A-S11-1`), §7.1 (`A-S11-2`) |
| Spikes | `SPK-S11-1` | §8 |
| Decision records | `DR-C11-S11-1` | the whole chapter |
| Gate rows | `G-S11-1` … `G-S11-21` | `97_package-completeness-gate.md` § SUB-11 |

**Every id is derived in a numbered section of this chapter**, not merely allocated here — the
right-hand column exists so a reader can check that, and so an id with no derivation is visible as a
gap rather than as a table row.

Every id is computed from the charter and this sub-task's own number. **No id is derived from "the
next number in a shared sequence"**, and no concurrent sibling's output was read to pick one — which
is the discipline `F-S3-3` exists to enforce.

---

## 15. What this chapter does not establish

- **That any existing client exists.** The population is unobserved. `CAP-S11-1`, `SPK-S11-1`.
- **That the extraction is affordable.** §6 prices what the cost is a cost *of* and which fork sizes
  it. It offers no hours and no line estimate.
- **That the behavioural conformance suite exists.** §4.1 specifies four probes. None is written;
  writing them is a `tests/` change out of scope here.
- **That the exempt set will stay at three.** §1.2 shows the two derivations agree at this cutoff
  and that nothing enforces it. `OI-S11-1`.
- **A remedy for the DP rubric.** §9 finds it and scopes it. Removing it is a `src/` change.
- **Whether the STDIO edge is reachable in production.** C010's question — `A-S4-2`, `SPK-S4-1`.
- **The rollout sequence.** SUB-7's (OUT-3). §7 names an ordering obligation, not a schedule.
- **The resolution of `F-S3-3`.** SUB-14's. §10 states a position and its derivation only.
- **The threat model.** SUB-12's (OUT-17). §8's escapes are consumed from SUB-5, not re-enumerated.

---

## What this chapter hands forward

- **To SUB-14 (`NEU-1007`), OUT-20.** `R11` authored and OUT-16's outcome row with its success
  measure, in the shape SUB-14 aggregates without authoring; this chapter's position on `F-S3-3`
  (§10) as one fewer unknown; **`F-S11-1`**, the tracker-id drift across the SUB-11 / SUB-12 block;
  and **`F-S11-5`**, four citations to a `CAP-S1-3` that is not filed. Both are register-assembly
  corrections only SUB-14 may make, and neither is corrected in place here.
- **To SUB-12 (`NEU-1005`), OUT-17.** §8's four escapes as a bounded starting set for the path
  matrix; §4.1's four probes as gate candidates; and `F-S11-4` — that a cut extraction leaves STDIO
  refused at the adapter with no gate to explain why, which is a path the threat model should carry.
- **To SUB-7 (`NEU-1001`), OUT-3 / OUT-4.** §7's scenario-level scoping of the smoke break — **two
  scenarios, not the suite** — and §6.3's three tiers, which determine what the STDIO stage actually
  delivers.
- **To SUB-13 (`NEU-1006`), OUT-19.** `OI-S11-2` — if the extraction takes option B, the DDL-adjacent
  work acquires a wrapped-handler-set assertion.
- **To SUB-17 (`NEU-1008`), OUT-20.** §1.6's line-42 disclosure, so the citation audit meets the
  explanation; §11's C010 check results; and §12's re-derived spike total.
- **To `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`.** §6's pricing of `F-S4-4`, as `CC-S8-3`'s
  owner — specifically §6.2's option A / option B fork, which is the part that sizes the work.
- **To `NEU-896` at convergence.** `F-S11-2` / `R-S11-1` — a pre-existing breach of C005 `:61`'s
  non-DP-specific limb in the core tool surface, which no charter in flight owns.
- **To the creator, as sole operator.** §7's obligation on `cd-prod.yml`, already owned via
  `R-S4-2`; and `CAP-S11-1` — that this contract is written for a client population of unknown size.
