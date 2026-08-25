# The enforcement point that confines every read and write

**Sub-task:** SUB-5 (NEU-997) · **Covers:** OUT-8
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `cc38cc9`
**Depends on:** SUB-2 (NEU-994), published at `02_identity-the-learner-key-and-principal-kind.md`; SUB-4 (NEU-996), published at `04_the-stdio-identity-gate-and-the-bound-context-token.md`
**Consumes:** `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md` (`DR-C10-S5-1` — the invariant, checks `I1`–`I5`, §3.4.1's asymmetry, §3.5's ownership table), `../C010-system-and-repository-architecture/04_state-category-inventory.md` (`SC-S3-12`), `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md` (`A-28`), `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md` (`CAP-S5-1`), `../C010-system-and-repository-architecture/02_findings-register.md` (`F-S5-2`, `F-S5-4`), `../C010-system-and-repository-architecture/decision-records/DR-C10-S6-1_state-ownership-model.md` (`M-A`) — all published 2026-08-22
**Decision records:** `DR-C11-S5-1`, `DR-C11-S5-2` · **Traceability:** `traceability/S5_the-enforcement-point.md`

---

## 0. What this chapter is

This chapter names **one place** where confinement is mechanically implemented, states what that
place confines and what escapes it, and carries **one** state category through C010's five ordered
checks to verdict `holds` — the first positive instance the isolation invariant has ever had.

**Three things it deliberately does not do.**

1. **It does not re-decide the transport gate or what the context-token row carries.** Those are
   SUB-4's (`DR-C11-S4-1`, `DR-C11-S4-2`), taken at position 4. This chapter consumes them and adds
   the layer below.
2. **It does not author DDL.** The ownership key is consumed as `NEU-850`'s `OUT-2`, a converged
   upstream decision. SUB-13 (OUT-19) later realizes it and re-verifies this chapter's derivation
   against what it writes. **No precondition of the derivation in §8 traces to SUB-13's artifact.**
3. **It does not claim `CAP-S5-1` is lifted, and it does not claim any category `holds` on the
   deployment as it stands.** `F-S5-4` (C010) remains true of production. §8's verdict is against a
   **composed** target state whose four assumed changes are enumerated, and §9 states the landing
   condition under which the cap would actually lift.

**No file under `src/` or `drizzle/` changes** (§14).

---

## 1. The starting position, re-counted at this chapter's own cutoff

Every quantity below was re-derived by reading the files at cutoff `cc38cc9`, not inherited from the
charter. **Three of the charter's own figures did not survive the re-count**, and each is registered
as a finding rather than silently corrected in passing.

### 1.1 The port surface — 13 ports, but only 7 are row-owning

The count of **13** is confirmed: `src/ports/` holds exactly thirteen files, each declaring exactly
one **port** interface. (Several also export supporting input, filter and row types — those are not
ports and are not counted.) The charter's composition is not. It states *"the 9 row-owning repositories (chunk,
topic, session, session-question, notes, context-token, review-persistence, tier2-blocking-stats,
linter-validation)"*. Two of those nine own no rows:

- **`Tier2BlockingStatsRepository` owns no table.** Its single method reads a raw aggregate over
  `infrastructure.operation_event_log` (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:32`–`:47`)
  and its own port doc says so: *"This port intentionally returns aggregated weekly bins rather than
  raw events"* (`src/ports/tier2-blocking-stats-repository.ts:10`–`:11`). It is an **aggregate
  read-path**, and it is the one port whose entire contract is an aggregate — which makes it the case
  §6.3's aggregate rule rules on, rather than a row-owning port. (It is **not** an instance of
  `LD-S3-32`, which is SUB-6's not-yet-existing aggregate result set; §6.3 keeps the two apart.)
- **`ReviewPersistencePort` owns no table either.** Its one write method writes into
  `learning_chunks` — the table `ChunkRepository` owns
  (`src/adapters/drizzle/review-persistence-adapter.ts:78`–`:82`). Its other methods are cross-table
  reads and aggregates over `session_question_attempts` joined to `session_question_chunks`. **It is
  a second write path into a chunk-owned table**, which is load-bearing here: a confinement design
  that scopes `ChunkRepository` and forgets this port leaves `learning_chunks` writable through an
  unscoped route.

Registered as **`F-S5-1`**.

`EmbeddingPort` and `ContentClassifierPort` are excluded from the row-confinement blast radius, and
the charter's justification for excluding them is also wrong. They are **not** pure-compute: both
are outbound-network adapters to external LLM and embedding providers (`src/adapters/langchain/`),
and they are the only two optional (`?`) members of `AppPorts` (`src/composition-root.ts:130`–`:131`).
The exclusion still holds — they own no rows, so no ownership predicate can attach to them — but the
correct reason is *owns no persistent state*, not *performs no I/O*. The difference matters, because
being outbound-network makes them a **data-egress path** that the enforcement point does not confine
(§6.1). Registered as **`F-S5-2`**.

**Corrected composition, and the one used throughout this chapter:** 7 row-owning · 1 cross-table
write-and-read (`ReviewPersistencePort`) · 1 aggregate read-path (`Tier2BlockingStatsRepository`) ·
1 read-path (`SearchPort`) · 1 transactional composer (`UnitOfWorkPort`) · 2 external-service
(`EmbeddingPort`, `ContentClassifierPort`) = **13**.

### 1.2 `AppContext` is 57 members, not 56

The charter states *"all **56** `AppContext` members (`src/composition-root.ts:516`–`:631`) are
subject-less"*, split *"52 closures, 2 shorthand references to pure imported functions
(`mapChunkRowToLearningItem` at `:606`, `applyBatchSessionChunkOperations` at `:622`), the
`contextTokens` port handle and the `contextTokenTtlMs` scalar (`:601`–`:602`, declared at
`:285`–`:286`)"*.

Re-read member by member at this cutoff, the object literal `const ctx: AppContext = {` opens at
`src/composition-root.ts:518` and closes at `:636`, and carries **57** members. The declaring
interface `AppContext` spans `:136`–`:314` and declares the same 57.

| Claim | Charter | At cutoff `cc38cc9` |
| --- | --- | --- |
| Member count | 56 | **57** |
| Literal line range | `:516`–`:631` | **`:518`–`:636`** |
| Closures | 52 | **53** |
| Shorthand references to pure imported functions | 2 | 2 — confirmed |
| `mapChunkRowToLearningItem` | `:606` | **`:608`** (import at `:92` — confirmed) |
| `applyBatchSessionChunkOperations` | `:622` | **`:627`** (import at `:102` — confirmed) |
| `contextTokens` handle + `contextTokenTtlMs` scalar | `:601`–`:602` | **`:603`–`:604`** |
| Interface declaration of those two | `:285`–`:286` | `:285`–`:286` — confirmed |

**This is a miscount, not drift.** `src/composition-root.ts` was last modified on 2026-08-04 by
commit `aa56c05`, three weeks before the charter was written and before every C011 chapter landed.
The file the charter counted is byte-for-byte the file counted here. Registered as **`F-S5-3`**.

The corrected split is **53 closures + 2 shorthand references + 1 port handle + 1 scalar = 57**, and
that is the arithmetic §5 reports. The charter's structural point is unaffected and is confirmed:
**every one of the 57 is subject-less, and they are not all closures.**

### 1.3 There is a third unscoped active-session path, and the charter names two

The charter names two write-path invariants. A grep for every query that reaches
`public.learning_sessions` without an owner predicate returns a third:

`DrizzleSessionRepository.listSessions()` (`src/adapters/drizzle/session-repository.ts:105`–`:118`)
applies a status filter only when one is passed (`:111`) and applies **no owner predicate under any
argument**. It has exactly one production call site —
`src/orchestration/learner-context-workflows.ts:100`, in the same `Promise.all` fan-out as
`getActiveSession` at `:99` — and that caller passes `{ status: 'completed', limit: 1 }`.

**What that caller actually gets today is another learner's most recent completed session**, folded
into the learner-context aggregate. That is the live exposure, and it is a read of a *completed*
session rather than an active one.

Two further shapes the method admits and **no caller reaches today** are stated separately, because
the difference between a live exposure and an available one matters to whoever fixes it: called with
`{ status: 'active' }` it would be a second unscoped active-session read, and called with no options
it would return every session row in the database. Neither invocation exists in `src/` or `tests/`
at this cutoff.

Removing only the two named invariants would leave this one. Registered as **`F-S5-4`**.

> **Id collision, stated once and covering all four cases, because this is the sharpest namespace
> clash in the package.** C010 has its own SUB-5, and it allocated **`F-S5-1`, `F-S5-2`, `F-S5-3` and
> `F-S5-4`** (`../C010-system-and-repository-architecture/02_findings-register.md:226`, `:237`,
> `:249`, `:262`). This chapter allocates C011 findings in the same shape, because the charter's id
> scheme fixes findings at `F-S<sub-task>-<k>` and this is SUB-5 of C011. **Three of the four C010 ids
> are actively cited in this package**, and all three are cited in this very chapter:
> C010's `F-S5-2` (the guard above the port boundary) in §4, §10 and §13; C010's `F-S5-4` (zero
> categories reach `holds`) in §8, §9 and §13; and C010's `F-S5-3` (the tool-surface correction) in
> §1.5.
>
> **The rule that resolves it is an extension of the package's existing one, and the extension is
> registered rather than presented as pre-existing.** What already exists covers two narrower cases:
> `README.md` § "Id conventions" fixes the form for **C010 sub-task references**, and `F-S2-2`
> (`91_findings-register.md:200`–`:207`) fixes it for **cross-package open items**, ruling that *a
> cross-package id is always written qualified, and a bare id always means this package's own*.
> Neither ranges over **findings, caps or decision records** — which is precisely the collision this
> chapter faces. This chapter therefore **extends** the same rule to those id classes: **a bare
> `F-S5-<k>` in this package is C011's**; C010's is **always** written with its full package path and
> its line, as `../C010-system-and-repository-architecture/02_findings-register.md:237`. **One
> deliberate exception, named here so it is not read as a violation:** `CAP-S5-1` is written bare
> throughout this chapter and is **always C010's** — C011 mints no cap of that id, as
> `94_caps-and-incomplete-scope.md` § SUB-5 records, so the bare form is unambiguous for that id
> alone.
>
> SUB-4 met the same clash on C010's `F-S4-5` and resolved it the same way, in the namespace note at
> `04_the-stdio-identity-gate-and-the-bound-context-token.md:694`. No id is renumbered to dodge the
> collision, because renumbering would break the scheme for one chapter's convenience and SUB-14
> would have to undo it. **The README amendment that would make the extension part of the package's
> stated conventions is routed to SUB-14 (NEU-1007)** under OUT-20, which owns house-style assembly;
> it is not made here, because `README.md` is another sub-task's artifact.
>
> **A note on the shorthand this package writes elsewhere.** Predecessor chapters often cite a
> sibling as `` 06_…md ``. That form is **invisible to the citation checker** — `scripts/citation-paths/checker.ts:121`
> discards any candidate containing `…` or `...` before it is ever counted — so a clean run says
> nothing about it. This chapter writes every reference as a full filename with its line, and the
> same applies to any backticked reference containing a space, which `scripts/citation-paths/checker.ts:123`
> also discards. Recorded as `F-S5-7`.

### 1.4 The identity code contradicts the settled identity rule today

`DR-C11-S2-1` fixes the learner key as the OIDC `sub` verbatim and rules that `azp` is **never** a
learner key. The deployed transport does the opposite:

```ts
const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;
```

`src/transport/jwt-middleware.ts:127`. When `sub` is absent the resolved subject **is** `azp`, and
`res.locals.auth.sub` is then populated with it (`:133`–`:136`) under a field name that asserts it is
a `sub`. Every downstream reader — the rate limiter's per-subject key
(`src/transport/rate-limit-middleware.ts:76`–`:79`), the session-binding check
(`src/transport/http.ts:52`–`:72`) — consumes the merged value.

This is the merge `R-S4-1` warns will reappear below the transport edge. It is recorded here not as
a new decision but as the **starting condition the enforcement point must not inherit**: an
enforcement point that takes its principal from `res.locals.auth.sub` as that field stands today
would confine `client`-kind principals as though they were learners. Registered as **`F-S5-5`**.

### 1.5 What is true, and is confirmed

- **Zero ownership columns exist.** No table in `src/infrastructure/db/schema.ts` carries a
  `user_id`, owner, tenant or principal column, and a grep for one across all 25 files in `drizzle/`
  returns only the *academic-subject* text column of `learning_topics` and `learning_chunks`. The
  closest thing to an actor column anywhere is `notes.author` (`src/infrastructure/db/schema.ts:296`),
  constrained to `IN ('agent', 'user')` (`:308`) — **a role enum, not an identity**, and §5 keeps
  the two apart.
- **The tool surface is 46 registered / 43 gated / 3 exempt**, re-derived at this cutoff: 46
  `server.registerTool(` call sites across 16 files in `src/server/`, and exactly three names in
  `EXCLUDED_TOOLS` (`src/transport/context-token-middleware.ts:5`–`:9`). This reproduces the settled
  figure that C010's `F-S5-3`
  (`../C010-system-and-repository-architecture/02_findings-register.md:249`) fixed and C010's
  `F-S8-1` diagnosed, with no divergence. **Both ids are C010's**, not this chapter's `F-S5-3`,
  which is the `AppContext` miscount at §1.2.
- **The context-token row carries no principal.** `public.context_tokens` has exactly three columns
  — `id`, `created_at`, `expires_at` (`src/infrastructure/db/schema.ts:312`–`:321`). It is a bare
  bearer nonce with a TTL, which is the gap `DR-C11-S4-2` closes.
- **The gate is mounted on HTTP only.** `createContextTokenMiddleware` is attached at
  `src/transport/http.ts:184`–`:187`; the STDIO branch (`src/transport/main.ts:55`–`:59`) constructs
  the server and connects a `StdioServerTransport` with no middleware chain of any kind. This
  reproduces SUB-4's `OUT-7` starting position and is cited, not re-decided.

> **One disclosure the package's own convention requires.** The Postgres pool's `max: 4` is at
> `src/infrastructure/db/client.ts:42`. That is a `file:line` citation whose line number is 42; it
> is a line number and not a tool count, and the superseded tool-surface miscount appears nowhere in
> this chapter as a codebase fact.

---

## 2. Decision — the enforcement point

**`DR-C11-S5-1`. Confinement is implemented in the Drizzle adapter, bound at construction to an
indivisible principal pair, and the adapter instances are constructed per request.**

Five clauses.

**Clause 1 — the point is the adapter, not the orchestration layer and not the tool layer.**
The confinement predicate is written **inside** each row-owning adapter method, in the query the
method already issues. It is not applied by a wrapper above the port interface, not applied in
`src/orchestration/`, and not applied in `src/server/`. This is what puts it *at or below the port
boundary* and therefore inside `A-28`'s envelope (§10) and able to satisfy `I3` (§8).

**Clause 2 — the principal is a constructor argument, and it is an indivisible pair.**
Every row-owning adapter takes the principal as `(principal_id, principal_kind)` **as one value**,
alongside the `db` handle it already takes (`constructor(private db: SqlDb = getSql())`, the uniform
pattern at `src/adapters/drizzle/chunk-repository.ts:93`, `session-repository.ts:35`,
`notes-repository.ts:10` and seven others). It is **not** a method argument: a method argument can
be varied per call by any caller in orchestration, and orchestration is above the boundary. It is
**not** `principal_id` alone: that is exactly the failure `R-S4-1` names, and taking the pair as one
value is the structural fix `R-S4-1` routes to this sub-task. **This clause settles `R-S4-1`'s named
residual.**

**Clause 3 — `principal_kind` decides whether a predicate exists at all, not merely its value.**

| `principal_kind` | Row-owning adapter behaviour |
| --- | --- |
| `user` | Every read and write carries `learner_key = <principal_id>`; every insert **sets** the column from the principal and ignores any caller-supplied value. |
| `client` | Every row-owning operation is **refused**. Not an empty result set. |
| `none` | Every row-owning operation is **refused**. |

The refusal for `client` is `DR-C11-S2-2`'s rule applied one layer down: an empty result is
indistinguishable from a learner with no data, so returning one converts an authorization failure
into a plausible answer. Because the kind travels with the identifier under clause 2, the adapter
can make this distinction without re-deriving anything from a token that no longer exists at this
depth.

**Which `principal_kind` domain this reads, because the package currently has two.** SUB-4's
`context_tokens` column is **two-valued** — `user | client`
(`04_the-stdio-identity-gate-and-the-bound-context-token.md:248`). SUB-16's log-table column is
**three-valued** and `NOT NULL` — `user | client | none`
(`decision-records/DR-C11-S16-1_the-attribution-carrier.md:14`). Both are handed to this outcome as
the enforcement point's input, and **no predecessor reconciles them**. Registered as **`F-S5-6`**.

The enforcement point reads the **three-valued** domain, and the reason is not a preference between
two authors. A two-valued domain has no representation for *a principal was not determined at all*,
and the adapter must be able to refuse that case distinctly from refusing a service principal —
otherwise an unauthenticated path and an authenticated machine path collapse into one refusal and
the operator cannot tell an outage from an authorization boundary. The two-valued column is not
wrong for its own purpose: a `context_tokens` row only exists because a principal *was* determined,
so `none` is unreachable there by construction. The reconciliation is therefore **`none` is
unreachable on the token row and reachable at the enforcement point**, and it is stated here rather
than left for a reader to infer from two tables that disagree. The routing is to SUB-13 (OUT-19),
which authors the DDL for both columns and is the party that would otherwise emit two contradictory
`CHECK` constraints; co-named SUB-14 (OUT-20) for the cross-register consistency check.

**Clause 4 — the adapter instances are request-scoped.**
Today `createProductionPorts` runs once (`src/composition-root.ts:317`–`:334`), calling `getSql()`
once at `:318` and passing the one handle into nine of the ten adapters — `DrizzleUnitOfWorkAdapter` (`:328`) takes none, resolving the handle itself, and `createAppContext` returns
`Object.freeze(ctx)` (`src/composition-root.ts:638`) — **one frozen context, shared by every MCP
session**. That is exactly C010's finding
`../C010-system-and-repository-architecture/02_findings-register.md:226`: *"One frozen `AppContext`
is shared by every MCP session, and it carries no principal field."* **This clause is what resolves
it.** Under this decision the same factory takes the resolved principal and runs **per request**. The
shared `pg.Pool` is untouched and is still constructed once
(`src/infrastructure/db/client.ts:37`–`:53`); what becomes per-request is the adapter objects, which
are plain allocations. §12 checks this against `OBJ-1`.

This clause is what makes §5's walk answerable: it is the reason 53 closures need no change.

**Why the adapter and not the existing gate, stated because the gate is the obvious place.**
A reader may reasonably ask why confinement is not simply added to the context-token middleware,
which already runs on every gated call. Three reasons, each from the deployed code:

1. **The gate is mounted on HTTP only** (`src/transport/http.ts:184`–`:187`); STDIO has no middleware
   chain (`src/transport/main.ts:55`–`:59`). Enforcement there would fail `I4` by construction.
2. **The gate fails open on internal error.** `src/transport/context-token-middleware.ts:83`–`:86`
   catches an exception, logs it, and calls `next()` — admitting the call ungated. SUB-16 records
   this as one of three fail-open sites (`F-S16-3`, `91_findings-register.md:347`). A confinement
   whose failure mode is *admit* is not a confinement.
3. **`I3` requires enforcement at or below the port boundary**, and the middleware is above it. This
   is the same placement objection C010's
   `../C010-system-and-repository-architecture/02_findings-register.md:237` raises against the
   orchestration guard.

The gate remains necessary — it is what establishes the principal — but it is not where confinement
is decided.

**Clause 5 — the database is a second, independent defence, and it is not the primary one.**
A row-level-security policy on each owned table, keyed to a per-transaction setting, is
**recommended** as defence in depth. It is deliberately **not** named as the enforcement point,
because on this deployment it cannot be the primary one without a change this chapter is not
prepared to assert is free: the `pg.Pool` is shared and connections are reused across requests
(`max: 4`, `src/infrastructure/db/client.ts:42`), so a session-level setting leaks between requests
unless every row-owning read runs inside a transaction using a transaction-local setting. Most
adapter reads are **not** in transactions today. The residual — whether that transaction requirement
is acceptable against `OBJ-1` — is raised as **`OI-S5-1`** and is not assumed away.

**What the enforcement point is, in one sentence:** *a principal-scoped adapter instance, whose
scope is a `(principal_id, principal_kind)` pair fixed at construction and compiled into every SQL
statement the adapter issues, with the database as an independent second layer.*

---

## 3. The per-port enforcement-point table

All **13** ports. Eleven are in the blast radius; two are excluded with a justification. Zero ports
unaddressed.

| # | Port | Class | Enforcement point | Mechanism |
| --- | --- | --- | --- | --- |
| 1 | `ChunkRepository` | row-owning (`learning_chunks`) | **Port layer + DB** | Predicate on all 18 methods; `create` sets the key from the principal. Aggregates (`countByTopicIds` `:216`, `listWithContent`'s count `:241`, `getMaxOrderIndex` `:334`) take the predicate **below** the aggregation — see §6.3. |
| 2 | `TopicRepository` | row-owning (`learning_topics`) | **Port layer + DB** | Predicate on all 8 methods; `create` sets the key. `list()` is unfiltered today and becomes owner-filtered. |
| 3 | `SessionRepository` | row-owning (`learning_sessions`, `session_chunks`) | **Port layer + DB** | Predicate on all 18 methods. Carries the two named invariant removals and the third found here (§4). `session_chunks` inherits ownership through its session rather than carrying its own key — stated as a DDL requirement for SUB-13, not authored here. |
| 4 | `SessionQuestionRepository` | row-owning (4 tables) | **Port layer + DB** | Predicate on all 12 methods. The three child tables inherit ownership through `session_questions`; `getMinPriorQuality` (`:251`) is an aggregate and takes the predicate below it. |
| 5 | `NotesRepository` | row-owning (`notes`) | **Port layer + DB** | Predicate on all 4 methods. **This is the category carried to `holds` in §8**, and its access-path set is enumerated there. |
| 6 | `ContextTokenRepository` | row-owning (`context_tokens`) | **Port layer, no owner predicate** | Deliberately different. The token row is what *carries* the principal (`DR-C11-S4-2`); it cannot be confined by the principal it establishes without a circularity. Confinement here is by **unguessable id plus expiry**, which is the existing mechanism, plus `DR-C11-S4-3`'s cutover rejection of unbound rows. `deleteExpired` is a maintenance sweep and is principal-independent by design. |
| 7 | `LinterValidationRepository` | row-owning (2 `infrastructure` tables) | **Excluded from owner scoping, justified** | Its two tables hold rule-validation corpus and reports keyed to a **rule id**, not to a learner. It is operator-facing machinery. Stated explicitly rather than omitted, because "no ownership column" and "not learner-scoped" are different claims and only the second justifies exclusion. If a corpus entry is ever found to quote learner content verbatim, this row is wrong and the route is a finding back to this chapter. |
| 8 | `ReviewPersistencePort` | cross-table write + read | **Port layer, scoped as `learning_chunks`** | **The row `F-S5-1` exists for.** It writes into a table it does not own (`review-persistence-adapter.ts:78`–`:82`), so it must carry `ChunkRepository`'s predicate, not one of its own. Its six read methods take the same predicate: one plain row read of `learning_chunks` (`getChunk`), one date-range row read (`getReviewsByDateRange`), and four aggregates over the attempt tables, which take it **below** the aggregation. Scoping `ChunkRepository` alone leaves this route open. |
| 9 | `Tier2BlockingStatsRepository` | aggregate read-path | **Not confinable here — named as escaping** | Its one method aggregates `infrastructure.operation_event_log`, which has **no ownership key and no port-level learner scoping**, so no predicate can be pushed below its aggregation. It returns weekly counts, never rows. Routed to the log-table caps `CAP-S3-3` / `CAP-S4-1` (owner `NEU-986`, co-named `NEU-896`) rather than resolved here. See §6.3. |
| 10 | `SearchPort` | read-path | **Port layer + DB** | Both methods (`searchByQuery`, `searchByVector`) read chunk and topic rows and take the same predicate as ports 1 and 2. A vector search is a read like any other; similarity ranking does not exempt it. |
| 11 | `UnitOfWorkPort` | transactional composer | **Inherits, and must be constructed with the principal** | It composes **only three** tx-scoped instances — `chunks`, `topics`, `sessions` (`src/adapters/drizzle/unit-of-work-adapter.ts:17`–`:21`) — by constructing fresh adapters on the transaction handle. Under clause 2 those constructions must pass the principal through; a tx-scoped adapter built without it is an unscoped adapter with a shorter lifetime. |
| 12 | `EmbeddingPort` | external-service | **Excluded, justified** | Owns no persistent state, so no ownership predicate can attach. **Not excluded for being pure** (`F-S5-2`): it is an outbound-network call, and the content it sends leaves the deployment. That egress is named in §6.1 as escaping the enforcement point. |
| 13 | `ContentClassifierPort` | external-service | **Excluded, justified** | Same as 12: owns no rows; outbound-network; content egress named in §6.1. |

**Counts.** 13 addressed · 11 in the blast radius · **2 excluded with justification** (`EmbeddingPort`,
`ContentClassifierPort`) · 1 further port named as **not confinable by this mechanism and routed**
(`Tier2BlockingStatsRepository`) · 1 confined by a **different** mechanism and stated as such
(`ContextTokenRepository`) · 1 excluded from owner scoping on a **not-learner-scoped** justification
(`LinterValidationRepository`). **Zero ports unaddressed.**

The last three are the reason this table is not a column of identical cells. A design that wrote
"port layer + DB" thirteen times would be asserting confinement over a log aggregate with no
ownership key, over the token row that establishes the principal, and over two network calls that
hold nothing — and each of those assertions would be false.

---

## 4. The write-path invariants, removed rather than shadowed

C010's finding at `../C010-system-and-repository-architecture/02_findings-register.md:237` is the
reason this section exists and the reason it is not satisfied by adding a predicate: the
single-learner guard *"sits in orchestration, above the port boundary and therefore outside `A-28`'s
tolerance envelope, so a port-boundary mechanism scopes the repository reads and leaves the guard
adjudicating 'any'."* A design that scoped the adapter and stopped would produce exactly that
outcome. The test applied below is therefore mechanical: **after the change, does the global
statement still exist anywhere in `src/`?**

### 4.1 `getActiveSession()` — the unscoped read

As it stands (`src/adapters/drizzle/session-repository.ts:73`–`:80`):

```ts
async getActiveSession(): Promise<LearningSession | null> {
  const [row] = await this.db
    .select()
    .from(learningSessions)
    .where(eq(learningSessions.status, 'active'))
    .orderBy(desc(learningSessions.createdAt));
  return row || null;
}
```

The sole predicate is `status = 'active'`. There is no owner predicate and no `LIMIT`: the statement
fetches **every** active session row in the database and returns the newest by `created_at`.

**Seven call sites invoke the repository method directly** — `src/orchestration/session-workflows.ts:39`
and `:185`, `src/orchestration/teaching-workflows.ts:157`, `:860`, `:930`, `:1901`, and
`src/orchestration/learner-context-workflows.ts:99`. Two further sites reach it **indirectly**, and
are counted separately rather than folded into the seven: `src/orchestration/teaching-workflows.ts:1741`
calls the orchestration wrapper `getActiveSession(deps)` whose body is the call at `:185`, and the
`get_active_session` tool handler at `src/server/session-lifecycle-tools.ts:178` reaches it through
`AppContext`. (`src/orchestration/session-workflows.ts:184` is that wrapper's `export async function`
line; the call itself is `:185`.)

**Removal.** The `where` clause becomes a conjunction of the status predicate and the owner
predicate, written **inside this method**, from the constructor-bound principal. The unscoped
statement does not survive anywhere: after the change **no SQL statement in `src/` selects
`learning_sessions` rows without an owner predicate**, and that is a grep, not an opinion. It is a
removal rather than a shadowing precisely because the change is to the query that runs, not to a
caller that consumes its result — all seven call sites and the tool handler are untouched and
inherit the scoping, which is the property clause 4 of `DR-C11-S5-1` buys.

### 4.2 `createSession`'s global-conflict guard — the orchestration read-then-write

As it stands (`src/orchestration/session-workflows.ts:39`–`:46`):

```ts
const activeSession = await deps.sessions.getActiveSession();
if (activeSession) {
  return serviceFail({
    type: 'conflict',
    message:
      'Active session already exists. Please complete the current session before creating a new one.',
  });
}
```

**Scoping `getActiveSession()` alone would leave this guard in place and it would then read
correctly — and that is precisely the shadowing this outcome forbids.** The guard would become a
per-learner rule *by consequence of a change somewhere else*, with its own text still saying "an
active session exists" and its own location still above the port boundary, which is where
`../C010-system-and-repository-architecture/02_findings-register.md:237` puts it outside `A-28`'s
envelope. A reader auditing the guard in isolation could not tell whether it was confined.

**Removal.** The guard is **deleted from orchestration.** The one-active-session-per-learner rule,
where it is still wanted, is re-expressed as a **partial unique index** on the ownership key
restricted to active rows — a database-level constraint, which is *below* the port boundary and
inside `A-28`'s envelope. `createSession` then produces its `conflict` result by handling the
constraint violation rather than by pre-reading.

Three things follow, and the third is a defect the current code already has:

1. The rule moves from a place the envelope excludes to a place it admits.
2. The rule becomes enforced rather than advisory: an orchestration guard can be bypassed by any
   future caller that does not run it; a unique index cannot be.
3. **The current guard is a time-of-check-to-time-of-use race.** Two concurrent `createSession`
   calls both read `null` at `:39` and both proceed to insert, because nothing between the read and
   the write is atomic. The guard does not prevent two active sessions; it prevents two active
   sessions *when the calls are serialized*. A unique index closes the race as a side effect of
   closing the placement problem. Registered as **`F-S5-8`**.

**The DDL requirement this states, and does not author.** A partial unique index over
`(owner, status)` restricted to `status = 'active'` is a schema object. This chapter states the
requirement; **SUB-13 (OUT-19) authors it** and re-verifies this section against what it writes.
Nothing in §8's derivation depends on that DDL existing.

### 4.3 The third invariant, which the charter does not name

`DrizzleSessionRepository.listSessions()` (`src/adapters/drizzle/session-repository.ts:105`–`:118`)
applies a status filter only when one is supplied (`:111`) and **no owner predicate under any
argument**. Its sole production call site is
`src/orchestration/learner-context-workflows.ts:100`, which passes `{ status: 'completed', limit: 1 }`
— so what it returns today is **another learner's most recent completed session**, folded into the
learner-context aggregate.

It takes the same removal as §4.1 — the owner predicate becomes unconditional, and only the status
predicate remains optional. It is called out separately because **a change set that implemented
exactly the charter's two named removals would ship with this one intact.**

**It is a sibling of charter risk `R1` rather than an instance of it, and the distinction is
recorded rather than blurred.** `R1` is worded as *"an ownership column lands while the unscoped
`getActiveSession()` … still permits access"* — an **active**-session read. This path is an unscoped
**completed**-session read on the only invocation any caller makes. It belongs to the same exposure
class (an unscoped `learning_sessions` query surviving an ownership column) and is named inside
`R1`'s entry for that reason, but calling it *"`R1` with a different method name"* would misdescribe
what it returns. Registered as `F-S5-4`.

---

## 5. The `AppContext` walk — 53 + 4 = 57

Every member of `const ctx: AppContext` (`src/composition-root.ts:518`–`:636`) is subject-less at
this cutoff. The walk below states, for each, how it obtains a principal or why it needs none.

### 5.1 The 53 closures — one mechanism, stated once, and why that is an answer and not an evasion

**Every one of the 53 closures obtains its principal the same way: it does not obtain one. It
inherits one, because the `deps` object it closes over holds principal-scoped port instances.**

This is the whole purpose of clause 4 of `DR-C11-S5-1`. Each closure is a thin binding of a workflow
function to a `deps` object assembled at `src/composition-root.ts:480`–`:516` — for example
`createChunkWithTopic: input => chunkWorkflows.createChunkWithTopic(input, chunkDeps)` at `:520`, and
`createNote: input => notesWorkflows.createNote(input, notesDeps)` at `:575`. Those `deps` objects
hold port handles (`notes: ports.notes` at `:486`, `:496`, `:500`, `:506`, `:571`). When
`createProductionPorts` is constructed per request from the resolved principal, every port handle in
every `deps` object is already scoped, and therefore so is every closure over it.

**Why this is a real answer to the closure question, member by member, rather than one answer
substituted for 53.** The closure question is *"how does this member obtain a principal?"* Answered
individually, 53 times, the answer would be 53 signature changes — a `principal` parameter threaded
through `AppContext`, every workflow function, and every tool handler. That design is rejected here
for a stated reason: **a principal passed as an argument is caller-asserted at the point of use**,
and check `I5` (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`)
tests exactly for that. Orchestration is above the port boundary; a principal it can name is a
principal it can vary. So the 53 closures are answered structurally *because answering them
individually would fail `I5`*, not because 53 answers were tedious to write.

**The mechanical consequence, which is what makes the walk checkable:** the change set touching the
53 closures is **empty**. Not one of their bodies, signatures or bindings changes. The change is at
`src/composition-root.ts:317`–`:334` (the factory) and inside the adapters. A reviewer can verify
the claim by confirming that a diff implementing this design touches zero lines in `:518`–`:636`
other than any needed to thread the principal into the factory call.

The 53, by group and line: chunk orchestration 7 (`:520`, `:521`, `:522`, `:524`, `:525`, `:527`,
`:528`) · topic 3 (`:532`, `:533`, `:534`) · leech 2 (`:537`, `:538`) · session 12 (`:542`, `:543`,
`:545`, `:546`, `:547`, `:549`, `:551`, `:553`, `:555`, `:556`, `:557`, `:558`) · teaching 5
(`:562`, `:563`, `:564`, `:565`, `:566`) · notes 3 (`:575`, `:576`, `:577`) · recommendation 1
(`:580`) · search 1 (`:584`) · query 7 (`:593`, `:595`, `:596`, `:597`, `:598`, `:599`, `:600`) ·
context-token mint 1 (`:605`) · domain and analytics 9 (`:613`, `:615`, `:616`, `:618`, `:619`,
`:620`, `:623`, `:625`, `:626`) · remediation 1 (`:630`) · learner context 1 (`:634`). **7+3+2+12+5+3+1+1+7+1+10+1 = 53.**

Two of those 53 warrant a word, because inheriting a principal is not the same as needing one:

- **`getActiveSession` (`:546`)** is the closure over the method §4.1 rewrites. It changes not at
  all; its behaviour changes entirely.
- **`createContextToken` (`:605`)** mints the row that *carries* the principal. It is a closure and
  it is asked the closure question, and its answer is that it receives the principal from the
  transport that resolved it, per `DR-C11-S4-2` — not from a port scope, because the row it writes
  is what establishes the scope. It is the one closure whose principal flows in the other direction.

### 5.2 The four non-closures — classified by name, not asked a closure question

| Member | Line | What it is | Classification |
| --- | --- | --- | --- |
| `contextTokens` | `:603` | **Port handle** — `contextTokens: ports.contextTokens`, a direct re-export of the `ContextTokenRepository` instance | Not asked a closure question. It is **the same port row 6 of §3's table already scopes**, surfaced on `AppContext`. Whatever confinement that port has, this handle has; it adds no path and needs no separate answer. |
| `contextTokenTtlMs` | `:604` | **Scalar** — `contextTokenConfig.ttlMs`, a number | Not asked a closure question. **Configuration carries no subject and needs none.** A TTL is the same integer for every principal; scoping it would be meaningless. |
| `mapChunkRowToLearningItem` | `:608` | **Shorthand reference** to a pure imported function (import at `:92`) — a bare identifier, no colon, no arrow | Not asked a closure question. It is a **direct binding of a pure function**: it transforms a row already fetched, performs no I/O, reaches no port, and **has no injection point to receive a subject**. Its input is a row the caller already had the right to hold. |
| `applyBatchSessionChunkOperations` | `:627` | **Shorthand reference** to a pure imported function (import at `:102`) | Same. A pure computation over values supplied by the caller, with no injection point. |

**No scalar, no port handle and neither shorthand reference is asked a closure question**, because
the closure question presupposes a body that could receive and use a principal, and none of these
four has one. Asking it anyway would produce four answers of the form "not applicable" dressed as
findings.

**53 + 4 = 57.** The walk is complete and the arithmetic is reported so it can be checked. The
charter's figure of 56 (52 + 4) is a miscount of the same file, recorded as `F-S5-3` in §1.2; the
structural claim it was making — that the members are subject-less and are not all closures — is
confirmed exactly.

---

## 6. What the enforcement point does not confine

A confinement design that named only what it covers would be the same defect as a green check that
did not run. Four things escape, and each is named with its route.

### 6.1 Content egress to external providers

`EmbeddingPort` and `ContentClassifierPort` are outbound-network calls to external LLM and embedding
providers (§1.1, `F-S5-2`). Chunk content and classifier prompts **leave the deployment** through
them. The enforcement point confines which rows a principal may read; it does not and cannot confine
what happens to a row's content after a principal has legitimately read it.

This is not a cross-learner exposure — a principal only sends content it was entitled to read — so
it is **not** an isolation failure and is not represented as one. It is a **data-protection**
surface: learner free text reaching a third-party processor is a lawful-basis and
controller/processor question, which is `OI-S3-1`'s (owner: the creator as sole operator) and
SUB-8's (OUT-11) rather than this outcome's. Named here because the per-port table excludes these
two ports, and an exclusion that did not say *what the excluded thing does instead* would read as
"nothing to see". Routed to **SUB-8 (NEU-1002)** under OUT-11, co-named the owner of `OI-S3-1`.

### 6.2 `LD-S3-31` — the class with zero members and terms that exist anyway

`03_learner-data-inventory-and-classification.md:431`–`:455` inventories the sixth copy class:
C011's own captures of real learner-derived production data. **Membership at revision 1 is none**
(`:446`), because SUB-1 executed zero of nine designed spikes for want of any production credential.

**The enforcement point does not confine this class, and could not.** Its quarantine path is
`_local/scratch/` — recorded at `:451` as *"gitignored, outside `src/`, `tests/` and `drizzle/`"*. **That it is also outside the database, reached by no port and by no SQL
statement, is this chapter's own observation rather than SUB-1's wording.** There is no row for a predicate to attach to. Its confinement is by the terms SUB-1 set:
a named owner, a retention bound, a destruction condition tied to this package's publication, and a
redaction discipline.

**Empty membership is not absent terms, and this section exists to keep those apart.** SUB-9
(OUT-12) must propagate a data right *through* this class, and a class the enforcement point
silently omitted would read to SUB-9 as a class with no confinement statement at all. The statement
is: *out of scope for the enforcement point, by construction, with confinement supplied by
`LD-S3-31`'s own recorded terms.* Zero members today means nothing to confine today; it does not
mean nothing to say.

### 6.3 `LD-S3-32` and the aggregate rule

`03_learner-data-inventory-and-classification.md:468`–`:471` inventories the aggregate result set
*"for what it is: per-disposition counts and dirty-data pathology probe results, never rows"*, and
classifies it as **not personal data** at `:475`–`:476`: *"Counts over rows are not the rows."*

That classification is correct and it is **not** a confinement argument. The rule this chapter adds:

> **An aggregate is confined if and only if the confinement predicate is applied to the row set
> *before* aggregation. Returning no rows is not confinement.** A `COUNT(*)` over an unconfined row
> set discloses a true fact about another learner's data while returning no learner data at all.

Applied to the aggregates that exist today, all of which take the predicate **below** the
aggregation under §3's table: `chunk-repository.ts:216` (`countByTopicIds`), `:241`
(`listWithContent`'s total-count query), `:334` (`getMaxOrderIndex`);
`review-persistence-adapter.ts:90` (`countAttempts`), `:114`–`:115` (`getReviewObservations`),
`:208`–`:213` (`getWeakAreas`), `:283`–`:285` (`getFirstAttemptObservations`);
`session-question-repository.ts:251` (`getMinPriorQuality`). Existence probes take the same rule:
`session-repository.ts:432`–`:453` (`validateChunkIds`, which already fails **closed** on error at
`:451` and is the one place the current code has the right default) and
`notes-repository.ts:60`–`:63` (`deleteNote`'s boolean, derived from an affected-row count).

**The one aggregate that cannot take the rule** is
`tier2-blocking-stats-repository.ts:32`–`:47`, which aggregates `infrastructure.operation_event_log`
— a table with **no ownership key**, sitting behind no port that `NEU-850`'s `OUT-2` reaches
(`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:202`, C010's
`OI-S5-1`). There is no predicate to push below its aggregation, so its weekly counts span every
learner. It is named as escaping and routed to the log-table caps `CAP-S3-3` and `CAP-S4-1` (owner
`NEU-986`, co-named `NEU-896`), not resolved here. Registered as **`F-S5-9`**.

`LD-S3-32` proper — OUT-2's read-only aggregate step — does not exist at this position and is
SUB-6's to produce. The rule above is stated so SUB-6 inherits it rather than deriving it.

### 6.4 The non-retroactive boundary, and the failure mode that runs the other way

`16_attribution-and-detection.md:279`–`:285` establishes that attribution is not retroactive: rows
written before the carrier lands carry no key and **can never be given one**, because the only
structure that ever held the binding is the process-local map at `src/transport/http.ts:83`, emptied
by every restart. `R-S16-1` states the consequence for erasure: a `DELETE` predicated on the learner
key *"reports success while provably missing every pre-cutover row"* (`92_risk-register.md:326`).

**Confinement over the same mixed population fails in the opposite direction, and this chapter is
where that has to be said.** A read predicated on the ownership key **excludes** every unowned row
from **every** principal. Where erasure misses pre-cutover rows, confinement **hides** them: they
become unreachable to everyone, including the learner who created them. That is not a leak — it is
the safe direction — but it is **data loss by predicate**, and a design that only checked for
over-exposure would score it as a success.

Two consequences the confinement rule must therefore not assume away:

1. **The rule does not assume a backfill has happened.** Its correctness does not depend on every
   existing row having an owner; its *usefulness* does. The disposition of the existing unowned
   population is **SUB-6's (OUT-2)** and is out of scope here.
2. **`user_id NOT NULL` cannot be added to a populated table without a backfill or a default.**
   `NEU-850`'s `OUT-2` specifies `NOT NULL`
   (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`).
   The ordering constraint that follows — the column, the backfill and the predicate cannot all land
   in one step — is a **rollout** fact and belongs to **SUB-7 (OUT-3)**, stated here as a dependency
   rather than sequenced here. Registered as **`F-S5-10`**.

---

## 7. The integration-test design

The claim to be proved is `R1`'s negation: **subject A cannot read, mutate or delete subject B's
rows through any tool path.** The design below is a design; **no test file is written by this
sub-task** (§14).

### 7.1 Why it must be a DB-backed integration test

The project's own rule (`CLAUDE.md`, Test Authoring Rules) makes integration tests non-negotiable
for DB-mutating blocking paths, on the ground that *unit tests with stubbed ports cannot prove the
rollback actually rolls back*. The same reasoning applies with more force here: the confinement
predicate **is** SQL. A unit test with a stubbed `NotesRepository` proves that the stub returns what
the stub was told to return. Only a real Postgres round-trip can show that a `WHERE` clause excludes
a row that genuinely exists.

### 7.2 Fixture shape, against the harness that exists

`tests/helpers/db-setup.ts` supplies the lifecycle: `setupTestDb()` (idempotent per process, taking
`pg_advisory_lock` to serialize schema setup across workers), `cleanupTestDb()` (a single
`TRUNCATE … CASCADE` over the fixed table list at `src/infrastructure/db/client.ts:78`), and
`teardownTestDb()`. The canonical suite shape is `beforeAll(setupTestDb)` → `beforeEach(cleanupTestDb)`
→ `afterAll(teardownTestDb)`, with `fileParallelism: false` for the integration project.

The new suite adds one thing the harness does not have: **two principals**. `createAppContext` is
called twice, once per principal, producing two `AppContext` instances over the same database —
`ctxA` and `ctxB`. This is possible only because of clause 4 of `DR-C11-S5-1`; under today's
process-singleton wiring there is no way to hold two differently-scoped contexts at once, which is
itself a reason the clause is shaped that way.

### 7.3 The matrix

For each row-owning port, and for each of A's rows, four assertions:

| # | Assertion | What a failure means |
| --- | --- | --- |
| **T1** | `ctxB` **read** of A's row id returns not-found — **not** A's row | Cross-learner read |
| **T2** | `ctxB` **update** of A's row id affects **0** rows, and A's row is byte-identical afterwards | Cross-learner write |
| **T3** | `ctxB` **delete** of A's row id affects **0** rows, and A's row still exists afterwards | Cross-learner delete |
| **T4** | `ctxB` **list/search** returns only B's rows, and A's row count in the result is **0** | Enumeration leak |
| **T5** | `ctxA` performs T1–T4 against its **own** rows successfully | The predicate is not simply refusing everything |

**T5 is not padding.** A predicate that returns nothing to anybody passes T1–T4 perfectly. Without
T5 the suite cannot distinguish confinement from breakage, which is the same error as reading an
empty result as an authorization success — the error `DR-C11-S2-2` rejects at the transport, applied
to the test suite.

Two further assertions that are not per-row:

| # | Assertion |
| --- | --- |
| **T6** | A `client`-kind principal performing any row-owning operation is **refused** — an explicit refusal, asserted as a structured error, **not** an empty result set. This is the assertion that would catch `R-S4-1` materialising. |
| **T7** | An aggregate or count issued by `ctxB` over a table containing A's rows returns a value computed over B's rows only (§6.3's rule). Asserted on the number, because T4 does not see it — an aggregate returns no rows to inspect. |

### 7.4 The paths it covers, and the paths it does not

**Covered.** The MCP tool paths, driven through the tool layer rather than the port layer, following
the existing precedent at `tests/integration/server/persistence-tools.test.ts:12`–`:18` (a fresh
`CaptureServer` with tools re-registered inside `beforeEach`). Driving at the tool layer rather than
calling adapters directly is deliberate: it is the layer an attacker reaches, and it exercises
`AppContext`, the workflows and the adapters together. The 43 gated tools are the surface; the 3
exempt tools — `init_agent_context`, `get_server_info` and `get_server_workflow`, listed at
`src/transport/context-token-middleware.ts:5`–`:9` — touch no learner-owned row and carry a T6-style
assertion only.

**Not covered, stated rather than omitted:**

1. **The STDIO transport.** `src/transport/main.ts:55`–`:59` constructs the server and connects a
   `StdioServerTransport` with no middleware; there is no in-process harness for it, and
   `vitest.config.ts:23` already excludes `mcp-stdout-validation.test.ts` from the integration
   project. Under SUB-4's gate the STDIO principal is a **per-process singleton** (`R-S4-3`), so a
   two-principal test cannot be written in one process **by construction** — not merely for want of
   a harness. What *can* be asserted on STDIO is the refusal-when-unconfigured path. Owner:
   **SUB-12 (NEU-1005)** under OUT-17, whose per-path matrix is where an untestable path must still
   carry an invariant.
2. **Operator and maintenance paths.** `clearAllTables` (`src/infrastructure/db/client.ts:65`–`:80`)
   and `deleteExpired` are principal-independent by design. Direct `psql` access by the operator is
   outside every port and therefore outside the enforcement point entirely. Modelled rather than
   exempted is **SUB-12's** obligation under OUT-17; this chapter names the paths.
3. **The two external-service ports** (§6.1) — nothing to assert, no rows.
4. **Concurrency.** T1–T7 are single-threaded. The TOCTOU race at §4.2 needs a concurrent test to
   demonstrate, and a partial unique index needs one to prove it closes. Named as required, and its
   design is bound to the DDL, which is SUB-13's.

### 7.5 What a green run would and would not prove

A green run over T1–T7 across the row-owning ports would establish confinement **on the HTTP path,
for the tables covered, at the tool layer, under the five changes §8.1 enumerates**. It would not
establish it on STDIO (path 1), for operator paths (path 2), or under concurrency (path 4), and it
would not lift `CAP-S5-1`, because a test proves a mechanism behaves as designed and the cap is
about a mechanism being **applied**. §9 states the distinction.

---

## 8. The worked `holds` derivation — `SC-S3-12`, Notes

This is the isolation invariant's **first published positive instance**. C010 published it with
zero (`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:185`), and both of
C010's censuses returned `holds: 0`
(`../C010-system-and-repository-architecture/09_authority-matrix-validation.md:398`).

### 8.1 The target state, stated first because a verdict without one is not a result

`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:156`–`:164`
is explicit: *"A verdict quoted without its target state is not a result."* Three forms are
legitimate; this derivation uses form **(c), composed**, which *"must list"* the outstanding changes
it assumes landed — *"'assume isolation is implemented' is not a target state and an evaluation
against it is void."*

**The system at `origin/develop` @ `cc38cc9`, plus exactly these five changes assumed landed. Nothing
else.**

| # | Assumed landed | Source, and its status |
| --- | --- | --- |
| **C1** | `public.notes` carries the ownership key `user_id NOT NULL`, keyed to **the resolved principal identifier** — the OIDC `sub` on HTTP, the configured transport-principal identifier on STDIO, per `DR-C11-S4-1` clause 2 | `NEU-850`'s `OUT-2`, reproduced at `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`. **Converged upstream decision**, explicitly *"never an existing schema fact"* (`:65`–`:66`). |
| **C2** | The enforcement point of §2 applied to `NotesRepository` — principal-scoped adapter, constructor-bound indivisible pair, request-scoped construction | **This outcome, OUT-8, designed in this chapter.** |
| **C3** | SUB-4's STDIO identity gate and bound context token | `DR-C11-S4-1`, `DR-C11-S4-2`, published at position 4 in `04_the-stdio-identity-gate-and-the-bound-context-token.md`. |
| **C4** | SUB-2's identity rule — learner key is `sub` verbatim, kind determined by `sub`-presence, `azp` never a learner key; the `sub \|\| azp` merge at `src/transport/jwt-middleware.ts:127` removed | `DR-C11-S2-1`, `DR-C11-S2-2`, published at position 2 in `02_identity-the-learner-key-and-principal-kind.md`. |
| **C5** | **The column is reachable on a populated table**: either `public.notes` is empty at cutover, or the column lands nullable with the predicate live and is tightened to `NOT NULL` only after every row carries an owner | Forced by this chapter's own §6.4 — `NOT NULL` cannot be added to a populated table without a backfill or a default. Enumerated because **C1** is otherwise unreachable under the *not assumed* list. |

**Two notes on the enumeration, because both are load-bearing.**

**Why `C1` says *resolved principal identifier* rather than *JWT subject*.** `NEU-850`'s `OUT-2` is
worded *"keyed to the JWT subject"*. On STDIO there is no JWT and no `sub` — the principal comes from
server-held configuration (`DR-C11-S4-1` clause 2). Taken literally, the upstream wording would give
`I4` no column to write into on one of the two transports, and the *"same code, same predicate"*
argument at §8.4 would fail on exactly the transport `C3` exists to gate. **C1** therefore takes the
wider reading — the key is whatever the resolved principal identifier is — and records that this is a
widening of the upstream wording rather than a quotation of it. The narrowing at §8.1's next
paragraph is about *which stores* `OUT-2` reaches, and is a separate question.

**Why `C5` is enumerated rather than folded into `C1`.** `C1` is a statement about the schema; `C5`
is a statement about the *transition* to it, and the two have different owners. Without `C5` the
enumeration is incomplete and C010's rule at
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:156`–`:158`
would **void** the evaluation — *"A composed state must list them"* — since `C1` cannot be reached
from the *not assumed* list on its own. `C5` does **not** import SUB-6's migration: it assumes only
that *some* reachable transition exists, and states the two shapes it could take. Which one is
chosen is SUB-6's (OUT-2) and SUB-7's (OUT-3), and neither is assumed here.

**Not assumed:** SUB-13's DDL, **SUB-6's disposition of the existing unowned rows** (`C5` assumes a
transition exists, not which one), SUB-7's rollout sequence, the partial unique index of §4.2, the
RLS layer of clause 5, and any test having been run.

**Which scoping of `OUT-2` **C1** assumes, because the corpus states two.**
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`
says *"every core table"*; C010's own Census B narrows it to *"every learner-scoped **durable
`public`-schema** store, threaded through the row-owning repository ports"*
(`../C010-system-and-repository-architecture/09_authority-matrix-validation.md:127`–`:128`). Which is
meant for the two port-less log tables is C010's `OI-S5-1`, owner `NEU-850`, and this package
carries its reading as `A-S3-1` rather than deciding it.

**The ambiguity does not reach this derivation.** `public.notes` is a durable `public`-schema store
sitting behind a row-owning repository port, so it is covered under **both** readings. **C1** takes
the narrower one — C010's Census B wording — because a derivation that needed the wider reading
would be resting on an open item owned by another package. Nothing in §8.4 depends on the wider
reading being correct.

### 8.2 Why `SC-S3-12` and not another category

The candidate set is the fifteen categories that reach `fails-confinement` under C010's Census B —
the rows where `I1` and `I2` already pass once `OUT-2` is assumed, so `I3` is the only open check.
`SC-S3-12` is one of them: `../C010-system-and-repository-architecture/10_republished-authority-matrix.md:744`
records `| SC-S3-12 | Notes | CMP-S4-9 | CMP-S4-7 | 5 | existing | carried | not-evaluable | fails-confinement |`.

It is chosen over the other fourteen on the check that actually governs. §3.4.1 of C010's chapter
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:237`–`:240`)
rules that **`holds` requires an enumerated access-path set** and *"may not return `holds` by failing
to find a counter-example"*. The binding question is therefore not which category is most important
but **which category's access-path set can be enumerated exhaustively and shown to be closed.**
`SC-S3-12`'s can, and §8.3 does it.

The alternatives, and why each costs more:

- **`SC-S3-13` (context tokens)** — superficially the strongest, since SUB-4 already designed its
  enforcement. But it is enforced **at the transport gate**, which is *above* the port boundary, so
  `I3`'s placement clause has to be argued rather than satisfied; and the token row is what
  *establishes* the principal, so confining it by that principal is circular (§3, row 6).
- **`SC-S3-11` (grade-revision audit trail)** and **`SC-S3-10` (pre-review snapshot)** — both are
  append-only with narrow write sets, and both are good candidates. Their access paths run through
  `SessionQuestionRepository`, which spans **four** tables and twelve methods, so the enumeration is
  wider and its closure harder to demonstrate.
- **`SC-S3-3` (per-chunk SM-2 state)** — C010's own §3.6 case 5 walked it furthest, so it is the
  symbolically obvious pick. It lives on `learning_chunks`, which is reachable through `SearchPort`
  **and** through `ReviewPersistencePort`'s second write path (`F-S5-1`), so its enumeration is the
  widest of all.
- **`SC-S3-5` (learning-session record)** — the category the two named write-path invariants live
  on. Reaching `holds` here additionally requires §4.2's guard removal to be complete, which depends
  on a DDL object this chapter does not author. Deliberately **not** the first instance, so the
  first instance does not rest on an unauthored artifact.
- **`SC-S3-28`/`-29`/`-30`, `SC-S3-19`/`-20`, `SC-S3-16`/`-17`, `SC-S3-45`** — excluded on C010's own
  reasoning: derived above the port boundary, process-local and HTTP-only, unreachable by `OUT-2`,
  or failing on the model rather than the residue.

`SC-S3-12` is also exactly the shape C010 predicted its first positive instance would take: *"a
durable learner-scoped category on the HTTP path"*
(`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:189`). Its **volatility**
cell reads `durable`
(`../C010-system-and-repository-architecture/04_state-category-inventory.md:89`); its *lifecycle*
cell, a different column of the same row, reads *"created → never updated in place → deleted and
re-added"* — which is the property that makes the write set two statements rather than three.

### 8.3 The enumerated access-path set for `public.notes` — and the proof that it is closed

This is the artifact `I3` requires and that has never existed for any category. It is presented as a
closure argument, because an enumeration nobody can check is not better than none.

**Every SQL statement that reaches `public.notes`. There are four, and all four are in one file.**

| # | Kind | Statement | Location |
| --- | --- | --- | --- |
| **W1** | write | `INSERT INTO notes … RETURNING id, created_at` | `src/adapters/drizzle/notes-repository.ts:15`–`:25` |
| **R1** | read | `SELECT … WHERE target_type = $1 AND target_id = $2 ORDER BY created_at DESC, id DESC` | `src/adapters/drizzle/notes-repository.ts:38`–`:40` |
| **R2** | read | `SELECT … WHERE target_type = 'chunk' AND target_id IN (…) ORDER BY created_at DESC, id DESC` | `src/adapters/drizzle/notes-repository.ts:54`–`:56` |
| **W2** | write | `DELETE FROM notes WHERE id = $1` | `src/adapters/drizzle/notes-repository.ts:61` |

**Four facts that close the set.** Each is a mechanical check a reviewer can re-run.

1. **The `notes` table object is imported in exactly one file.** A search for an import of `notes`
   from the schema module across all of `src/` returns a single hit:
   `src/adapters/drizzle/notes-repository.ts:4`. No other module can name the table through Drizzle.
2. **No raw SQL on any production path names the table.** A case-insensitive search for `from notes`,
   `into notes`, `update notes`, `delete from notes` and `public.notes` across `src/` returns
   nothing. The raw-SQL escape hatch this codebase uses elsewhere is
   `this.db.execute(sql\`…\`)`, as at
   `src/adapters/drizzle/tier2-blocking-stats-repository.ts:34`. **There is exactly one such call
   that names `notes`, and it is the test-only truncate fact 4 covers** — no other, and none on a
   production path.
3. **`UnitOfWorkPort` does not compose it.** `src/adapters/drizzle/unit-of-work-adapter.ts:17`–`:21`
   constructs exactly three tx-scoped adapters — `chunks`, `topics`, `sessions`. There is no
   tx-scoped `NotesRepository`, so there is no second, differently-constructed instance of it
   anywhere in the process.
4. **The only other reference on a data path in `src/` is a test-only truncate.**
   `src/infrastructure/db/client.ts:78` lists `notes` in `clearAllTables`'s single
   `TRUNCATE … CASCADE`, and `src/infrastructure/db/client.ts:16`–`:32` throws unless the database
   name contains `_test`. It is not a production path.

   **Three further references exist and are not access paths**, stated so the closure claim is not
   read as wider than it is: the table's own definition at `src/infrastructure/db/schema.ts:288`,
   and its `CREATE TABLE` / `ALTER TABLE` DDL in `drizzle/0006_safe_major_mapleleaf.sql` and
   `drizzle/0021_add_gap_note_type.sql`. A schema declaration and a migration define the table; they
   do not read or write a row at request time, so `I3` — which quantifies over *"every read path and
   every write path that reaches the category"* — does not range over them.

**Therefore the set {W1, R1, R2, W2} is complete**, and the enumeration is *closed by the module
boundary* rather than by exhaustive search — which is what makes it checkable rather than merely
diligent. This is the object
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:242`–`:246`
says nobody owed and that `CAP-S5-1` cites as a reason satisfiability was untested.

**The port-level callers**, for completeness, all reaching the four statements above and no others:
`src/orchestration/notes-workflows.ts:14`, `:22`, `:27`; `src/orchestration/remediation-workflows.ts:217`
(a **second** `createNote` write path); `src/orchestration/teaching-workflows.ts:571` (a read) and
`:2073` (a **third** `createNote` write path). Exposed by three MCP tools at
`src/server/notes-tools.ts:33`, `:68`, `:101`, and reached indirectly through the teaching and
remediation tools. **That there are three distinct write paths and not one is exactly why
enforcement is placed in the adapter and not in `notes-workflows.ts`** — two of the three do not go
through that file.

### 8.4 The five checks, in order

Run in order; the first failing check names the verdict and the evaluation stops
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:207`).

---

**`I1` — In domain. Is the category learner-scoped?**
*Answered from the `Learner-scoped` column of
`../C010-system-and-repository-architecture/04_state-category-inventory.md` §3, read off the row.*

`../C010-system-and-repository-architecture/04_state-category-inventory.md:89` reads
`| SC-S3-12 | **Notes** — immutable annotations attached to a chunk, topic or learning session | public.notes (:288) | … | durable | no | **question — open** | existing |`.

The `Learner-scoped` cell is **`question — open`**. C010's rule at `:176`–`:177` is explicit: *"a row
whose `Learner-scoped` cell reads `question — open` is **in domain**. Only an explicit `no` takes a
category out."*

> **`I1` — PASS (in domain).** Not by interpretation: the rule exists precisely to stop an unanswered
> question functioning as an exemption.

---

**`I2` — Principal attribution. Does every instance resolve to exactly one authenticated principal,
expressed as a value the server holds?**
*Answered from the `Store` column plus the schema it cites.*

Today: **fails.** `public.notes` (`src/infrastructure/db/schema.ts:288`–`:310`) has seven columns —
`id`, `target_type`, `target_id`, `note_type`, `content`, `author`, `created_at` — and none is an
owner. This is why C010's Census A returns `not-evaluable` for this row.

Under **C1**, the table carries `user_id NOT NULL`, keyed to the JWT subject. Under **C4** that
subject is the OIDC `sub` verbatim. Every row therefore resolves to exactly one principal, and the
value is held by the server in its own column.

**One distinction that has to be made explicitly, because the table invites the error.** `notes`
already has a column called `author`, constrained to `IN ('agent', 'user')`
(`src/infrastructure/db/schema.ts:296`, `:308`). It is a **role enum, not an identity**: it records
whether a note was written by the agent or by the human, and it is identical across every learner in
the deployment. It is not an ownership key, it cannot become one, and its value `'user'` is unrelated
to `principal_kind = 'user'`. A design that mistook it for attribution would satisfy `I2` on paper
with a column that distinguishes nobody. Recorded as **`F-S5-11`**.

> **`I2` — PASS under the composed state** (fails under form (a); the difference is `C1`).

---

**`I3` — Confinement. Is that principal a predicate on **every** read path and **every** write path
that reaches the category, enforced at or below the port boundary?**
*Answered from the category's enumerated access-path set.*

The set is **{W1, R1, R2, W2}**, enumerated at §8.3 and closed by the four checks there.

| Path | Under **C2** | At or below the port boundary? |
| --- | --- | --- |
| **W1** `INSERT` | `user_id` is **set from the constructor-bound principal**, and any caller-supplied value is ignored | Yes — inside `DrizzleNotesRepository`, below `NotesRepository` |
| **R1** `SELECT` by target | `AND user_id = <principal>` conjoined to the existing predicate | Yes — same |
| **R2** `SELECT` by chunk ids | `AND user_id = <principal>` conjoined | Yes — same |
| **W2** `DELETE` by id | `AND user_id = <principal>` conjoined to `id = $1`. **This is the sharpest single change in the chapter:** as it stands the statement deletes by primary key alone, so any caller holding any note id deletes that note | Yes — same |

All four paths carry the predicate; the predicate is written in the adapter, which is below the port
interface; and under clause 2 the principal is fixed at construction, so no caller above the boundary
can vary it. Under clause 3 a `client`-kind or `none`-kind principal is refused rather than scoped to
an empty set.

**Three closure conditions that would each falsify this answer, checked:**

- *A path outside the enumeration.* Excluded by §8.3 facts 1 and 2 — one import site, zero raw SQL.
- *A second, unscoped instance of the adapter.* Excluded by §8.3 fact 3 — `UnitOfWorkPort` composes
  three ports and `notes` is not among them.
- *A cross-table route into `notes`.* Unlike `learning_chunks`, which `ReviewPersistencePort` writes
  without owning (`F-S5-1`), no other port touches `notes`: the enumeration in §8.3 is over the
  table, not over the port, so a cross-table writer would have appeared as an import or as raw SQL.

> **`I3` — PASS under the composed state.** And it passes **legitimately** rather than by absence of
> a counter-example: the enumerated access-path set exists, is closed by a module boundary, and every
> member of it carries the predicate. This is the check
> `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:239`
> forbids passing any other way.

---

**`I4` — Transport invariance. Does `I3`'s enforcement hold identically on both transports?**
*Answered from the transport wiring in `src/transport/` plus
`../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md`
§4.2's boundary rows.*

The enforcement is the adapter predicate. The adapter is constructed from a resolved principal, and
under **C3** both transports resolve one:

- **HTTP** — the principal comes from the bound context token (`DR-C11-S4-2`), itself written at mint
  time from the signature-verified token.
- **STDIO** — the principal comes from server-held deployment configuration read at start-up
  (`DR-C11-S4-1` clause 2), and **where none is configured every gated tool is refused and nothing is
  minted** (clause 3). Inert, not open.

The confinement decision is **the same code on both paths**: the same adapter, the same predicate,
the same refusal rule. It depends on nothing mounted on only one transport — which is the precise
failure that made C010's `F-S5-4` a statement about the *system*
(`../C010-system-and-repository-architecture/02_findings-register.md:265`: *"a column cannot supply a
principal the transport never produced"*). Under **C3** the transport produces one.

> **`I4` — PASS under the composed state.**

**Two residuals, named and deliberately not folded into the verdict:**

1. **`R-S4-3` — the configured STDIO principal is a per-process singleton.** Two learners sharing one
   STDIO process are confined to one identity. SUB-4 established this is **not** an `I4` failure —
   the confinement *decision* is identical on both transports — and it is not represented as one
   here. It is a deployment-shape limit owned by `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`.
2. **`R-S4-4` — audit parity is a rewrite, not a mount.** A refusal on STDIO leaves no record. SUB-4
   established that audit parity is **not** required for `I4`, so this verdict does not rest on it
   and may not be used to argue it away. Owner: SUB-16 (NEU-999).

Stating both is the difference between a verdict and a claim.

---

**`I5` — Principal integrity. Is the principal server-derived rather than caller-asserted, and is its
*kind* determined rather than assumed?**
*Answered from the identity-resolution site plus any open item recording what is unverified.*

**Server-derived.** On HTTP the principal is read from a signature-verified token at the transport
edge and written into the token row at mint time; the caller supplies a token id, not an identity. On
STDIO it is read from server-held configuration and is *"never influenced by the caller"*
(`DR-C11-S4-1` clause 2). Neither `session_id` nor `correlation_id` carries it — both are
caller-asserted and `DR-C11-S16-1` forecloses their use
(`decision-records/DR-C11-S16-1_the-attribution-carrier.md:25`–`:38`).

**Kind determined, not assumed.** Under **C4** the kind is determined by `sub`-presence and is
*"not inferred from the audience shape"* — which matters concretely here, because `F-S2-1` establishes
that production authenticates with the static client `claude-web`, so **every learner presents the
same bare audience and the audience carries zero learner information**. The kind is then **persisted**
on the token row as `principal_kind` (`DR-C11-S4-2`) rather than re-derived below the transport, where
the token no longer exists.

**And the kind is *used*, which is what `I5`'s second limb actually tests.** Clause 2 of
`DR-C11-S5-1` makes the enforcement point take `(principal_id, principal_kind)` as an **indivisible
pair**, so an adapter cannot select on the identifier while ignoring the kind. This is the structural
fix `R-S4-1` routes to this sub-task by name
(`92_risk-register.md:264`), and **it is settled here**: the enforcement point takes the pair, not a
value and a flag.

**Also required, and part of C4:** the `sub || azp` merge at `src/transport/jwt-middleware.ts:127`
(`F-S5-5`) is removed. Left in place it would deliver an `azp` under the field name `sub`, and the
enforcement point would confine a service principal as though it were a learner — passing `I5`'s
letter while violating its purpose.

> **`I5` — PASS under the composed state.**

---

### 8.5 Verdict

> ## `SC-S3-12` — **`holds`**
>
> **Target state:** composed, form (c) — `origin/develop` @ `cc38cc9` plus **C1**, **C2**, **C3**,
> **C4** and **C5** as enumerated at §8.1, and nothing else.
> **`I1`** in domain · **`I2`** attributed · **`I3`** confined on all four enumerated access paths, at
> the adapter · **`I4`** identical on both transports · **`I5`** server-derived, kind determined and
> used as an indivisible pair. **All five checks pass.**

**This is the isolation invariant's first published positive instance.** It establishes that the
invariant is **satisfiable** — that some reachable state of this system returns `holds` for some
category — which is the one thing C010 could not establish and explicitly recorded that it could not
(`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:185`).

**What it does not establish, stated with equal weight:**

- **It is not a verdict on the deployment.** Under target state (a), *as it stands*, `SC-S3-12`
  returns `not-evaluable` — `I2` fails, there is no ownership column, and the remaining checks have
  nothing to run against. C010's `F-S5-4`
  (`../C010-system-and-repository-architecture/02_findings-register.md:262`) **remains true of
  production in full**, and success for this outcome is measured as movement against that census, not
  as its replacement.
- **One category is one category.** Fourteen other Census-B `fails-confinement` rows are untouched
  here, and the twenty-six in-domain categories are not claimed. Nothing in §8 generalises by itself: each
  would need its own enumerated access-path set, and `SC-S3-12` was chosen *because* its set closes
  most cleanly (§8.2).
- **Nothing is applied.** No file under `src/` or `drizzle/` changes (§14). The verdict is against a
  design.

---

## 9. `CAP-S5-1` — discharged, not lifted

The cap is `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:182`–`:189`.
It is **co-owned**: `:188` names `NEU-986 (SUB-12)` of C010 *"alongside **NEU-893**, which is the
party positioned to produce the first positive instance and for which this cap is the standing
definition of done."*

### 9.1 The three preconditions, each traced to something already settled

The cap's own text at `:186` names them: *"an ownership key on the store … the reaching query bodies
scoped at or below the port boundary … and an identity gate on the STDIO transport."*

| # | Precondition | Traced to | Settled when this derivation was written? |
| --- | --- | --- | --- |
| **1** | **An ownership key on the store** | `NEU-850`'s `OUT-2` — `user_id NOT NULL` keyed to the JWT subject, reproduced at `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53` — as made concrete by **SUB-2's identity rule** (`DR-C11-S2-1`), which fixes *what the key is keyed to*. | **Yes.** A converged upstream decision (position 0) consumed through a decision taken at position 2. |
| **2** | **Reaching query bodies scoped at or below the port boundary** | **OUT-8 — this outcome, designed in §2 and §3, and demonstrated for `SC-S3-12` in §8.3.** | **Yes.** Authored here. |
| **3** | **An identity gate on the STDIO transport** | **OUT-7 — SUB-4's `DR-C11-S4-1`**, taken at position 4, published at `04_the-stdio-identity-gate-and-the-bound-context-token.md`. This is why this sub-task depends on SUB-4. | **Yes.** Taken two positions earlier. |

> **Zero preconditions are traced to an artifact that does not yet exist when this derivation is
> written.** In particular, **none traces to SUB-13's OUT-19 DDL.** SUB-13 sits at position 14 and its
> artifact is unauthored at position 5. Precondition 1 traces to `NEU-850`'s `OUT-2` — the *decision*
> — not to the DDL that will later realize it.

**SUB-13's role, stated so the direction cannot be misread.** SUB-13 (OUT-19) later **realizes** the
ownership key as DDL and runs its own consistency check against this derivation, routing any
divergence back here as a finding. That is a **forward re-verification of a derivation already
standing on a settled decision**, not the supply of one of its preconditions. The arrow runs
SUB-5 → SUB-13, and SUB-13's check runs back the other way.

### 9.2 Discharge, and the lifting condition

**Discharged, under OUT-8, here.** What the discharge consists of: the cap said the invariant was
*"shown well-formed, never shown satisfiable"*. §8 shows it satisfiable — one category, all five
checks, a real enumerated access-path set, a stated target state. That is the thing the cap said no
package had.

**The cap is NOT lifted, and this chapter does not claim it is.** The cap's own lifting text at
`:189` is *"**One state category evaluating to `holds`** — which requires all three preconditions
above to land together"*. **Land** is the operative word. §8's verdict is against target state (c),
composed of five changes *assumed* landed; none has landed.

> **Lifting condition, stated as a landing condition on applied work.** `CAP-S5-1` lifts when
> `SC-S3-12` — or any category — evaluates to `holds` against target state **(a), as it stands**, at
> a named cutoff, with:
>
> 1. `NEU-850`'s `OUT-2` ownership key **applied** to the category's table in `drizzle/` (SUB-13's
>    OUT-19 realizes it; SUB-6's OUT-2 dispositions the existing unowned rows);
> 2. the enforcement point of §2 **applied** in `src/` for that category's enumerated access-path set;
> 3. SUB-4's STDIO identity gate **applied** in `src/transport/`;
> 4. the enumerated access-path set **re-verified at that cutoff**, because §8.3's closure argument is
>    a statement about the code at `cc38cc9` and a new import site would break it.
>
> The party that observes all four is the implementation charter `NEU-896` hands the work to. **It is
> not this package**, which may change no file under `src/` or `drizzle/`. Recorded as **`OI-S5-2`**
> — and note that **C010 also has an `OI-S5-2`**, a different item, closed by SUB-2
> (`02_identity-the-learner-key-and-principal-kind.md:355`); per `F-S2-2`'s rule a bare `OI-S5-2` in
> this package means this package's own.

**Co-ownership is unchanged.** `NEU-986` remains the cap's owner at C010's package-completeness gate.
This package supplies the positive instance it was positioned to supply; it does not take the cap
over, and it does not close it on `NEU-986`'s behalf.

---

## 10. The `A-28` envelope check

`A-28` is `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`.
**This package's publication is its re-validation trigger** (`:115`), so the check below is the
trigger firing, not a courtesy.

**The envelope** (`:111`, verbatim): *"The architecture tolerates isolation enforced at the
repository-port layer, in the database schema (row-level or predicate-based), or at both."*

| The design | Inside the envelope? |
| --- | --- |
| Enforcement in the Drizzle adapter, below the port interface (§2 clauses 1–4) | **Yes** — this is *"the repository-port layer"*, the envelope's first named form. |
| RLS / a per-transaction predicate as a second layer (§2 clause 5) | **Yes** — *"in the database schema (row-level or predicate-based)"*, the second named form. |
| Both together | **Yes** — *"or at both"* is named explicitly. |
| The partial unique index replacing the orchestration guard (§4.2) | **Yes** — a schema-level constraint, the second form again. |

> **Verdict: the design sits inside `A-28`'s tolerance envelope, and inside it under two of the three
> forms the envelope names. No breach.**

**The invalidating outcome did not fire.** `A-28`'s named invalidating outcome (`:113`) is *"A finding
that **safe isolation requires a separate deployment or a separate datastore**."* This chapter finds
the opposite: confinement is achievable on the existing single deployment and the existing single
Postgres, at the port boundary, with no relocation of any authority assignment. **No amendment is
routed to `NEU-895`, and none is routed to `NEU-896`.** The finding OUT-8 is required to report if the
enforcement point could not be placed inside the envelope is **checked and not filed**, because the
condition did not arise — recorded that way rather than by silence, so a reader can tell a check that
passed from a check that was never run.

**One thing the check moves, which is the check having content.** C010's
`../C010-system-and-repository-architecture/02_findings-register.md:237` establishes that the
single-learner guard at `src/orchestration/session-workflows.ts:39`–`:46` sits in orchestration,
*above* the port boundary, and is therefore **outside** `A-28`'s envelope today. §4.2 deletes it and
re-expresses the rule as a schema constraint. **The design therefore moves a mechanism from outside
the envelope to inside it** — which is why "removed, not shadowed" is an envelope requirement and not
a style preference. Had this chapter merely scoped the repository read and left the guard standing,
the guard would have remained outside the envelope and this verdict would have been wrong.

**Consistency with the two prior envelope checks in this package.** SUB-2
(`02_identity-the-learner-key-and-principal-kind.md:357`) recorded that it *"names a key and a kind
and enforces nothing; **SUB-5 places the enforcement**"* — this chapter is that placement, and it
places it inside the envelope as SUB-2 anticipated. SUB-4
(`04_the-stdio-identity-gate-and-the-bound-context-token.md:644`) recorded a disposition the envelope
does not name (deletion of unbound token rows) and argued it was nonetheless not a breach; nothing
here contradicts that reasoning or depends on it.

---

## 11. The deploy pipeline's smoke run — for SUB-7

**The enforcement point is a second, independent cause of a break SUB-4 already identified, and SUB-7
needs both.**

SUB-4 established the first cause (`R-S4-2`, `92_risk-register.md:269`–`:278`; `F-S4-3`,
`91_findings-register.md:260`): the CD workflow mints a `client_credentials` token on every
production deploy and runs the smoke suite with it as a deploy step; the suite calls gated
learner-state tools; under `DR-C11-S2-2` that principal is `client`-kind and those calls are refused.
*"The enforcement stage therefore breaks the pipeline that would ship it, and it breaks it every time,
not once."*

**What this chapter adds.** SUB-4's break is at the **transport gate**. The enforcement point of §2
refuses the same principal again, one layer lower, at the **adapter** — clause 3 refuses every
row-owning operation for a `client`-kind principal, and that refusal is not conditional on any
middleware being mounted.

The consequence SUB-7 must sequence around, stated plainly:

> **Relaxing, deferring or unmounting the transport gate does not unbreak the smoke run.** The two
> refusals are independent. A rollout stage that ships the enforcement point but holds back the
> transport gate — a natural-looking way to de-risk the sequence — still fails the smoke suite, and it
> fails it inside the adapter where the failure is harder to attribute. Any stage that ships §2's
> clause 3 breaks the deploy gate, on its own.

**Three routes exist and none is this package's to take** — this package may change no file under
`.github/`, `src/` or `tests/`. SUB-4 names them and this chapter does not add a fourth: re-scope the
smoke suite to the three gate-exempt tools plus a service-principal-appropriate path that touches no
learner-owned row; re-provision the smoke principal as a `user`-kind static client with a real `sub`;
or accept a known-failing smoke step for the duration. **Softening the refusal to an empty result is
not on the list** — `DR-C11-S2-2` rejects it, and §2 clause 3 rejects it again at the adapter for the
same reason.

**What SUB-7 (NEU-1001) inherits from this section**, under OUT-3: the ordering constraint that the
smoke-principal fix must precede **the enforcement stage**, not merely the transport-gate stage; and
the fact that the two stages cannot be separated as a mitigation. Registered as **`F-S5-12`**.
Owner of the fix itself remains **the creator, as sole maintainer and sole operator**, per `R-S4-2`.

---

## 12. Consistency with SUB-15's `OBJ-*`

The relevant objective is **`OBJ-1`** — *"Concurrent DB-bound tool calls served without queueing:
**≤ 4**"* (`15_operational-objectives-for-the-real-platform.md:248`), derived from the pool's `max: 4`
at `src/infrastructure/db/client.ts:42`, which SUB-15 identifies as **the first thing that breaks**
(`15_operational-objectives-for-the-real-platform.md:131`) over a band of **2–200 concurrently active
learners** (`:161`–`:163`).

**The question that matters: does the enforcement point add DB work per request?**

| Element of the design | Pool cost |
| --- | --- |
| The confinement predicate itself | **None.** It is an additional `WHERE` conjunct on a query that is already issued. No extra statement, no extra connection acquisition. |
| Resolving the principal | **None additional.** The principal is read from the bound context-token row (`DR-C11-S4-2`), and the gate **already** reads that row on every gated call — `validateWithStatus` at `src/adapters/drizzle/context-token-repository.ts:39`–`:55`. Binding the principal to the row the gate already fetches means the enforcement point **rides an existing round-trip** rather than adding one. |
| Request-scoped adapter construction (clause 4) | **None.** Constructing ten adapter objects is allocation. `getPool()` is unchanged and still returns the one module-level pool (`src/infrastructure/db/client.ts:37`–`:53`); adapters take the handle, they do not open connections. |
| RLS second layer (clause 5) | **Potentially non-zero, and this is why clause 5 is not the primary point.** A transaction-local setting requires row-owning reads to run inside transactions; most do not today. A transaction holds a connection for longer than a single statement, which consumes directly from the four. |

> **Verdict: the enforcement point as specified in clauses 1–4 is consistent with `OBJ-1` and does not
> move the 2–200 band.** It adds zero round-trips and zero connection acquisitions per request.

**The conflict that is registered rather than argued away.** Clause 5's RLS layer, *if implemented by
wrapping every row-owning read in a transaction*, would increase connection hold time against a pool
of four and could move the band. That is a real interaction with `OBJ-1` and it is **not** resolved
here: it is raised as **`OI-S5-1`**, owned by SUB-13 (NEU-1006) under OUT-19 as the party that would
author the RLS DDL, co-named the creator as sole operator for the pool configuration. Clause 5 is
labelled *recommended, second, and not primary* precisely so that this open item cannot block the
enforcement point.

**Three further SUB-15 facts checked, none breached.** `OBJ-2` (≤ 120 admitted requests per
authenticated subject per 60 000 ms) already keys on a per-subject value at
`src/transport/rate-limit-middleware.ts:76`–`:79`, so a determined principal makes that limiter
*more* correct, not less — though note it **fails open** when the subject is absent (`:79`), which is
the same fail-open shape as the session binding at `src/transport/http.ts:57` that `R1` names.
`OBJ-12` (exactly one concurrent boot-time migrator, *"the platform cannot currently guarantee this"*)
is untouched by this design, which adds no migration. `F-S15-3`'s unbounded process-local maps are
untouched: **the enforcement point introduces no new process-local per-principal cache**, deliberately,
because such a cache would inherit exactly that leak shape.

**No production quantity is asserted anywhere in this section.** `t_db` is unobserved (`OI-S15-3`),
the band is 2–200 and is not narrowed here, and every statement above is a statement about *round-trip
counts in the design*, which is a property of the code and not a measurement of the deployment.

---

## 13. Consistency checks against C010

Every C010 decision this chapter consumes, checked against the chapter's own content. **The check ran
and returned empty: no contradiction with C010 was found, and no amendment is routed.**

| C010 item | Consumed as | Consistent? |
| --- | --- | --- |
| `DR-C10-S5-1` — the invariant, `I1`–`I5`, the ordering rule | §8 applies all five in order, first-failure-names-the-verdict, and answers each from a cited artifact | **Yes.** Nothing is re-derived; the procedure is applied as published. |
| §3.4.1 — `I3`'s asymmetry, `holds` requires an enumerated access-path set | §8.3 authors that set for `SC-S3-12` and closes it by module boundary | **Yes**, and this is the clause the chapter exists to satisfy rather than to work around. |
| §3.2 — a verdict without a target state is not a result | §8.1 states form (c) and enumerates its four assumed changes | **Yes.** |
| C010's `F-S5-4` (`../C010-system-and-repository-architecture/02_findings-register.md:262`) — no category reaches `holds` | Consumed as the census this outcome's movement is measured against; §8.5 states it remains true of the deployment | **Yes.** §8's verdict is against a composed state and is not offered as a counter-example to it. |
| C010's `F-S5-2` (`../C010-system-and-repository-architecture/02_findings-register.md:237`) — the guard is above the port boundary, outside the envelope | Consumed in §4.2 as the reason the guard must be **deleted** rather than scoped | **Yes**, and §10 records that the design moves it inside the envelope. |
| `A-28` — the tolerance envelope | §10, checked; inside, under two of three named forms | **Yes.** Invalidating outcome did not fire. |
| `CAP-S5-1` — zero positive instances | §9, discharged and explicitly **not** lifted | **Yes.** |
| `DR-C10-S6-1` — `M-A`, the MCP core is the exclusive writing **tier** | The enforcement point sits inside the MCP core and creates no new writing tier; the web tier gains no credential | **Yes.** Note the quantifier ranges over **tiers**, not components, per the `NEU-987` / `F-S10-6` amendment — this chapter's per-adapter placement is a statement about components inside the core and does not touch `M-A`. |
| `NEU-850`'s `OUT-2` | Consumed as a converged decision, never as a schema fact (§8.1 **C1**) | **Yes.** §1.5 confirms zero ownership columns exist. |
| `DR-C10-S8-2` — token-bound identity | Consumed through SUB-4; the enforcement point reads the token-bound principal rather than a per-call argument (§2 clause 2) | **Yes.** A method-argument principal is explicitly rejected on this ground. |
| The authority matrix — `../C010-system-and-repository-architecture/08_per-state-authority-matrix.md` as revised by `../C010-system-and-repository-architecture/10_republished-authority-matrix.md`, revision `post-validation` | `SC-S3-12`'s row read from `../C010-system-and-repository-architecture/10_republished-authority-matrix.md:744` | **Yes.** The post-validation revision is the one read, per charter assumption 26. |
| `../C010-system-and-repository-architecture/09_authority-matrix-validation.md` §4.3 — the purposive reading of `I3`'s placement clause for the 15 port-less categories | **Not relied on.** `SC-S3-12` sits behind a port, so the literal reading of clause (c) is satisfied and the purposive reading is not needed | **Yes** — recorded so that this chapter's `holds` cannot be read as depending on that ruling. |

### 13.1 Two obligations SUB-16 routed here by name, both discharged

`16_attribution-and-detection.md` names SUB-5 under OUT-8 as the owner of two of its seven **missing
emissions** — data its detection matrix needs that the deployment does not emit:

| Missing emission | What SUB-16 needs | Discharged by |
| --- | --- | --- |
| **`ME-S16-3` — no refusal event.** `DR-C11-S2-2` decision 3 requires learner access under a `client` principal to be refused, and *"nothing emits it"* | An observable refusal, so `SIG-S16-1` limb 1b has an input | **§2 clause 3.** The adapter refuses a `client`- or `none`-kind principal explicitly rather than returning an empty set, which is what makes the event observable at all. A refusal that returned no rows would emit nothing to detect. |
| **`ME-S16-4` — no per-row ownership column** to compare a returned row against | Something to compare, so `SIG-S16-1` limb 1a — the direct cross-learner signal — has an input | **§8.1 `C1` plus §3's per-port table.** The ownership key is named as a precondition and the column is named per port; **SUB-13 realizes it as DDL**. This chapter supplies the requirement and the placement, not the DDL. |

Neither is *implemented* here — nothing is. What is supplied is the design commitment each emission
depends on, which is what SUB-16 routed rather than an artifact.

**An addition is not a contradiction.** §2 clause 3 refuses `client`-kind principals at the adapter,
which is a mechanism C010 does not describe. It does not contradict any C010 decision; it extends
`DR-C11-S2-2`'s transport-level rule downward. Per the charter's rule, an addition to a C010 pricing
is not a contradiction and routes nothing.

---

## 14. Source-change confirmation

**No file under `src/` or `drizzle/` is modified by this sub-task.** `git diff --name-only origin/develop`
lists files only under
`docs/research/C011-safe-production-integration-and-learner-isolation/` and `docs/GLOSSARY.md`.

Every code reference in this chapter is a **read** at cutoff `origin/develop` @ `cc38cc9`. The
integration-test design in §7 is a design: **no file under `tests/` is created or modified either.**

**One package-hygiene defect observed in passing, reported rather than fixed.** Five files in this
package end with a stray `</content>` tag on their last line — an authoring artifact, not content:
`15_operational-objectives-for-the-real-platform.md`,
`traceability/S15_operational-objectives.md`,
`decision-records/DR-C11-S15-1_objective-basis-and-evidence-labels.md`,
`decision-records/DR-C11-S15-2_first-break-ranking.md`, and
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`. No other file in this package or
in C010 carries one. **It is not fixed here**: the registers are append-only and a chapter is another
sub-task's artifact, so editing them would breach the no-rewrite rule for a cosmetic gain. Registered
as **`F-S5-13`** and routed to **SUB-14 (NEU-1007)** under OUT-20, which owns house-style assembly
and is the party permitted to touch another sub-task's file.

---

## 15. Ids allocated by this sub-task

All scoped to `S5`, computed from the charter's id scheme and not continued from any shared sequence.

| Register | Ids |
| --- | --- |
| Findings (`91_findings-register.md`) | `F-S5-1` … `F-S5-13` |
| Risk (`92_risk-register.md`) | **`R1`** (charter § Risks row 1), plus `R-S5-1`, `R-S5-2`, `R-S5-3` |
| Open items (`93_open-items-and-provisional-register.md`) | `OI-S5-1`, `OI-S5-2` |
| Caps (`94_caps-and-incomplete-scope.md`) | none filed; `CAP-S5-1` is **C010's**, discharged here under OUT-8 and recorded, not re-filed |
| Stand-ins (`95_stand-in-assumption-register.md`) | `A-S5-1` |
| Spikes (`96_spike-register.md`) | none filed |
| Completeness gate (`97_package-completeness-gate.md`) | `G-S5-1` … `G-S5-21` |
| Outcome (`90_outcome-register.md`) | `OUT-8`'s row |
| Decision records | `DR-C11-S5-1`, `DR-C11-S5-2` |

**One charter `R<n>` row, correctly.** Charter § Risks row **1** names OUT-8 as its owning outcome
and SUB-5 as its author (charter assumption 48), and `92_risk-register.md:24` records the same
allocation. It is the only one of the fifteen that names OUT-8.

**No spike is filed**, so the package total stays at seventeen designed / zero executed. Nothing in
this chapter turns on a production quantity: the design's costs are round-trip counts, which are read
off the code.

**Namespace note — and it is sharper here than for any other sub-task.** These `S5` ids belong to
**SUB-5 of C011**. **C010 has its own SUB-5**, and it allocated nine ids of the same shape:
`F-S5-1` … `F-S5-4`, `OI-S5-1` … `OI-S5-3`, `CAP-S5-1`, and the two decision records
`DR-C10-S5-1` / `DR-C10-S5-2` (whose `DR-C10-` prefix makes them unambiguous). Six of the seven
collision-prone ids were already cited across this package before this chapter, and **three are
cited in this chapter**: C010's `F-S5-2`, `F-S5-4` and `F-S5-3`.

**No occurrence count is asserted, deliberately.** A grep cannot produce one: since this chapter
mints C011 ids of the same strings, a search for `F-S5-2` now returns both packages' and no
mechanical count can separate them. What *is* countable, and is the useful number, is that **275
fully-qualified `../C010-system-and-repository-architecture/…md` citations** exist across the
package — the form the rule requires.

The rule that resolves every case is the one §1.3 states and **extends**: `README.md` §
"Id conventions" covers C010 *sub-task* references and `F-S2-2` (`91_findings-register.md:207`)
covers cross-package *open items*; this chapter extends the same discipline to findings, caps and
decision records — **a C010 record is always cited with its full package path and line; a bare id
always means this charter's own**, with `CAP-S5-1` the one named exception, always C010's because
C011 mints no cap of that id. The README amendment is routed to **SUB-14 (NEU-1007)**. No id is
renumbered to avoid the clash. `G-S5-<k>` follows SUB-2 and SUB-4's sub-task-scoped gate ids rather
than SUB-1 and SUB-3's global `G-<n>` sequence, for the collision reason `DR-C11-S15-3` gives.

---

## 16. What this chapter does not establish

- **That any category `holds` on the deployment as it stands.** §8's verdict is against a composed
  target state with five enumerated assumptions. Under target state (a) `SC-S3-12` is
  `not-evaluable`. C010's `F-S5-4` is unchanged. Owner of the applied result: the implementation
  charter `NEU-896` hands the work to.
- **That `CAP-S5-1` is lifted.** It is discharged — a positive instance now exists — and its lifting
  condition is stated as a landing condition in §9.2. Owner: `NEU-986`, co-named `NEU-893`.
- **That the other fourteen Census-B `fails-confinement` categories reach `holds`.** Each needs its
  own enumerated access-path set. Owner: SUB-12 (NEU-1005) under OUT-17 for the per-path matrix;
  SUB-13 (NEU-1006) for the DDL each would need.
- **That the enforcement point performs acceptably.** §12 establishes it adds no round-trips, which is
  a structural claim about the design. It is **not** a latency measurement; `t_db` is unobserved
  (`OI-S15-3`) and `OBJ-5` is unsettable. No production quantity in this chapter is observed.
- **That the integration-test suite passes.** §7 is a design. No test file exists, and
  `CAP-S1-3`'s QA no-op applies here as everywhere: the `qa-execution:engine` surface is unconfigured,
  so no QA pass exists and none is claimed.
- **That STDIO confinement is testable in-process.** §7.4 path 1 establishes it is not, by
  construction, under a per-process singleton principal. Owner: SUB-12 (NEU-1005) under OUT-17.
- **That existing unowned rows have a disposition.** §6.4 states the boundary; the disposition is
  SUB-6's (NEU-1000) under OUT-2.
- **That the DDL exists.** §4.2's partial unique index and §8.1's **C1** ownership key are stated
  requirements. Owner: SUB-13 (NEU-1006) under OUT-19.
- **That `principal_kind`'s two domains are reconciled in the schema.** §2 states which domain the
  enforcement point reads and why; the two `CHECK` constraints are SUB-13's to write consistently
  (`F-S5-6`).

---

## What this chapter hands forward

| Id | What it is | Who consumes it |
| --- | --- | --- |
| `DR-C11-S5-1` | The enforcement point: adapter-placed, constructor-bound indivisible principal pair, request-scoped construction, refusal for non-`user` kinds, DB as second layer | **SUB-13** (OUT-19, the DDL that realizes it), **SUB-12** (OUT-17, the per-path matrix), **SUB-11** (OUT-16, the compatibility contract), the implementation charter |
| `DR-C11-S5-2` | The `holds` derivation for `SC-S3-12`, its enumerated access-path set, and `CAP-S5-1`'s landing condition | **SUB-13** (re-verifies it against its DDL), **SUB-14** (OUT-20, the split-fidelity record), **SUB-17** (the completeness audit), `NEU-986` (the cap's owner) |
| The per-port table (§3) | Where confinement is implemented for each of the 13 ports, with 2 justified exclusions and 3 named non-standard cases | **SUB-13**, **SUB-12**, **SUB-6** (which ports its migration must satisfy) |
| §4's three invariant removals | `getActiveSession()`, `createSession`'s guard (**deleted**, re-expressed as a schema constraint), and `listSessions()` | **SUB-13** (the index DDL), **SUB-7** (OUT-3, the stage that lands them), the implementation charter |
| §6.3's aggregate rule | An aggregate is confined iff the predicate applies before aggregation; a count over an unconfined set leaks | **SUB-6** (OUT-2's aggregate step), **SUB-12** (OUT-17), **SUB-16**'s count-based signals |
| §6.4's non-retroactive boundary | Confinement over a mixed population hides pre-cutover rows from everyone — data loss by predicate, the inverse of `R-S16-1` | **SUB-6** (OUT-2, the disposition), **SUB-7** (OUT-3, the ordering) |
| §7's integration-test design | The T1–T7 matrix, the two-principal fixture, and the four uncovered paths named | **SUB-12** (OUT-17), **SUB-13** (the runbook's verification step), the implementation charter |
| §11 | The enforcement point is a **second, independent** cause of the smoke-run break; unmounting the transport gate does not unbreak it | **SUB-7** (NEU-1001) under OUT-3 — the sequencing obligation |
| `R1` | The Critical charter § Risks row, authored here | **SUB-14** (aggregates, authors nothing), **SUB-17** (audits) |
| `F-S5-1`, `F-S5-3`, `F-S5-4`, `F-S5-6` | Four corrections to figures the charter and predecessors carry: 7 row-owning ports not 9; 57 `AppContext` members not 56; a third unscoped session path; two `principal_kind` domains | **SUB-14** (OUT-20, reconciliation), **SUB-13**, **SUB-17** |
| **Settled: `R-S4-1`** | The enforcement point takes `(principal_id, principal_kind)` as an **indivisible pair** at the port boundary. SUB-4 routed this residual here by name; it is closed | **SUB-4**'s entry at `92_risk-register.md:267`, **SUB-13** (which makes it structural in DDL) |
| **Settled: `I3`** | C010's `I3` clause, and the enumerated-access-path-set obligation `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:242`–`:246` says nobody owed | **`NEU-895`** (owner of `DR-C10-S5-1`), **SUB-12**, **SUB-13** |
