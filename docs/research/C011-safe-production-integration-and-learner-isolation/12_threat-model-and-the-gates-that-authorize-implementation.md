# 12 — Threat-modelling every path, and the gates that authorize implementation

**Sub-task:** SUB-12 (NEU-1005) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-17
**Written:** 2026-08-26 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `57aeba3`
**Depends on:** SUB-5 (NEU-997), position 5 — merged, at `05_the-enforcement-point-that-confines-every-read-and-write.md`; SUB-15 (NEU-998), position 6 — merged, at `15_operational-objectives-for-the-real-platform.md`; SUB-16 (NEU-999), position 7 — merged, at `16_attribution-and-detection.md`; SUB-9 (NEU-1003), position 11 — merged, at `09_proving-a-data-right-reaches-every-copy.md`
**Also consumes:** `../C010-system-and-repository-architecture/decision-records/DR-C10-S5-1_isolation-invariant-as-a-decision-procedure.md` (the five checks, as given); `../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md` (the web API's scope and negative boundary, consumed and not re-decided)
**Decision records:** `decision-records/DR-C11-S12-1_closing-the-threat-set-over-ingress.md`, `decision-records/DR-C11-S12-2_the-unconfined-aggregate-as-a-control-input.md`, `decision-records/DR-C11-S12-3_gate-thresholds-without-a-production-observation.md`
**Traceability:** `traceability/S12_threat-model-and-gates.md`

---

## 0. What this chapter is, and the two things it must not be

**It is** four things. A **threat enumeration** closed over *ingress* with a stated falsifier (§2).
A **path-by-path invariant matrix** in which every path carries an explicit isolation or lifecycle
invariant and **zero paths carry none** (§4), including the operator path modelled rather than
exempted (§5). A **gate register** in which every critical gap resolves to a control, a threshold, an
owner and an evidence source, and a gap without a measurable control is a **blocking finding** rather
than an accepted risk (§8). And a **bidirectional cross-check** reporting coverage as two counts in
both directions (§9).

**It must not be either of the two failures this package has already produced.**

The first is **paper completeness** — SUB-9's name for a matrix that is complete because every cell
has been filled. A threat model is worth exactly the completeness of the path set it ranges over, and
a path set assumed complete is the same defect with better formatting. §2 therefore closes the set
with an argument that can be attacked, *before* §4 fills anything in.

The second is **false self-certification**, which this package's adversarial passes have caught three
times, and which its own record describes as its most-repeated failure class
(`09_proving-a-data-right-reaches-every-copy.md:156`–`:160`). This chapter reproduced it once, live,
during its own preparation, and §2.4 publishes that rather than smoothing it away.

**It is not measured.** No production credential exists. `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and
`VPS_*` were re-probed at this cutoff and are all unset, independently reproducing
`91_findings-register.md` § `F-S1-2`. **The evidence label `observed-in-production` is used zero
times in this chapter, and no gate below claims a production observation.** `DR-C11-S12-3` records
what "measurable" is therefore permitted to mean.

---

## 1. Where each predecessor's remit ended, and what this chapter composes

Eleven chapters precede this one and each solved a slice. This chapter asks the composed question
none of them could: **given all of them, what can still go wrong, on which path, and what number
would tell us?**

| Sub-task | What it settled | What it explicitly left to OUT-17 |
| --- | --- | --- |
| **SUB-5** (position 5) | The enforcement point: an adapter-placed predicate, a constructor-bound indivisible `(principal_id, principal_kind)` pair, request-scoped adapters, refusal for non-`user` kinds, the database as an independent second layer (`05_the-enforcement-point-that-confines-every-read-and-write.md:224`–`:225`) | **The STDIO path's invariant**, since a two-principal test cannot be written in one process by construction (`:711`–`:718`), and **the operator and `psql` paths**, named at `:719`–`:722` as *"outside every port and therefore outside the enforcement point entirely"*, with *"modelled rather than exempted"* stated as **SUB-12's** obligation |
| **SUB-15** (position 6) | Fourteen numeric objectives against the platform that exists, nine of them carrying a number (`15_operational-objectives-for-the-real-platform.md:246`–`:265`) | The thresholds this chapter's gates are set against |
| **SUB-16** (position 7) | Four failure modes, four signals, seven named missing emissions (`16_attribution-and-detection.md:141`–`:146`, `:228`–`:236`) | The signals this chapter's gates read; `DR-C11-S16-3` is handed to SUB-12 **by name** *"as a measurable gate"* (`:449`) |
| **SUB-9** (position 11) | Six copy classes, the `W-1a`…`W-8` egress partition, and **three copy locations no class claims** (`09_proving-a-data-right-reaches-every-copy.md:599`) | All three routed here as threat paths: the external-provider egress, the stderr sink, and the STDIO host's own state |
| **C010's `11_…`** | The prospective general web API's scope and its negative boundary — it *"holds zero of the forty-five state categories"* and under `M-A` *"holds **no database credential at all**"* (`../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md:113`, `:123`–`:125`) | **Consumed, never re-decided.** §4.9 covers the API *at* that boundary |

**One naming hazard, disclosed once.** Both packages have a chapter `11_`. C011's
`11_the-client-compatibility-contract.md` says nothing about a web API — a full-text search of it for
"web" returns zero hits. The web-API boundary this chapter consumes is **C010's**
`../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md`, and every
reference to it below is written with its full package path. A bare `11_…` in this package means
SUB-11's compatibility contract.

---

## 2. Closing the threat set: an argument over ingress

### 2.1 Why ingress, and why not a survey of tools

Enumerating *tools* and asserting the list is complete is unfalsifiable in exactly the way SUB-9
identified for stores: a tool nobody thought of is invisible to a survey of tools somebody thought
of. It is also the wrong shape — the 46-tool surface is one ingress among several, and the paths that
matter most in this chapter (the operator's, the migrator's) are not tools at all.

**SUB-9 closed its copy set over egress** — *"a copy exists only where a write put it, and the write
set is bounded by the source tree"* (`09_proving-a-data-right-reaches-every-copy.md:96`–`:97`). This
chapter closes its threat set over the mirror quantity:

> **A learner-state access occurs only where a request entered.** The ingress set is bounded by the
> process's own entry points, plus the paths that reach the state *without* entering the process.

The second clause is the one that makes this different from SUB-9's. SUB-9's partition is over what
leaves a **process**, and it is therefore closed by the source tree. A threat model cannot be: the
operator does not enter the process at all. `DR-C11-S12-1` records why the partition is drawn where
it is, and the two alternatives rejected.

### 2.2 The ingress partition

Enumerated statically at cutoff `57aeba3`.

| # | Ingress surface | How it is reached | Reaches learner state by | Inside `src/`? |
| --- | --- | --- | --- | --- |
| `IN-1` | **HTTP transport** — Express with the middleware chain | `src/transport/http.ts`, entered from `src/transport/main.ts:46`–`:54` | MCP tool and prompt dispatch through `AppContext` | Yes |
| `IN-2` | **STDIO transport** — a bare `StdioServerTransport`, no middleware chain | `src/transport/main.ts:55`–`:59` | The same tool dispatch, with no gate, no JWT middleware and no audit middleware | Yes |
| `IN-3` | **Boot-time migrator** — runs unconditionally, before any transport | `src/transport/main.ts:27` → `src/infrastructure/db/migrate.ts:38`–`:50` | Schema DDL against every learner table | Yes |
| `IN-4` | **A direct database session** — any holder of the connection string | `psql`, a GUI client, or any process with `DATABASE_URL` | Arbitrary SQL, below every port | **No** |
| `IN-5` | **The host shell** — SSH to the single VPS, or the container runtime | Charter assumption 21; `VPS_HOST` secret | The database, the container's log files, the environment, the compose stack | **No** |
| `IN-6` | **The delivery pipeline** — a merge to `develop` auto-deploys on green CI | `.github/workflows/cd-prod.yml`; charter assumption 21 | Whatever the merged code does, including removing a confinement predicate | **No** (the pipeline); yes (its payload) |
| `IN-7` | **Operator-run repository scripts** — reviewable, in-repo, not wired to any transport | `pnpm db:seed` (`package.json:43`), `scripts/retention-cleanup.sql` | Direct writes and deletes against learner tables, with no principal | Partly |
| `IN-8` | **The prospective general web API** | C010's `../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md` | **Only by calling the MCP core** — it holds no database credential and zero of the 45 categories | Does not exist yet |

**`IN-8` is not a new ingress to the database, and saying so is the whole content of consuming
C010's boundary rather than re-deciding it.** Under `M-A` the API is a *client of `IN-1`*. Its threat
paths are therefore `IN-1`'s threat paths with a different caller, plus the two access modes C010
admits — read-projection and write-intent — and nothing else. §4.9 says what that implies and stops
there.

### 2.3 The falsifier, and what shape of search would extend it

> **The claim is false if anyone exhibits a read or write of learner state that enters through none
> of `IN-1` … `IN-8`.**

The falsification procedure is the enumeration re-run: **name the entry points and show each
terminates in an enumerated surface.** It is deliberately **not** stated as a fixed number of greps.
SUB-9's §4.2.1 is the reason — three enumerations there returned green and were each extended by a
differently-shaped search, and the common defect was *"a grep written from a mental list of APIs,
whose green result was then read as a property of the system rather than a property of the pattern"*
(`09_proving-a-data-right-reaches-every-copy.md:156`–`:158`).

**So this chapter states, in advance, the five shapes of search that would extend its own
enumeration**, rather than waiting to be corrected:

| # | What would extend it | Why this enumeration cannot rule it out | Routing |
| --- | --- | --- | --- |
| `X-1` | **A second transport branch** added to `src/transport/main.ts`'s `if/else` | The partition is read off one conditional at one cutoff. A third arm is a new ingress with, by precedent, no middleware | `R-S12-2`; detection is `SIG-S16-4`'s rollout-regression comparison |
| `X-2` | **A second process sharing the database** — a worker, a cron container, a sidecar | Nothing in **this repository** can see a process defined in the off-repo compose stack. The stack is unversioned and outside the repository (charter assumption 21) | **`SPK-S12-1`**, method and expiry in `96_spike-register.md` |
| `X-3` | **A database-side execution path** — a trigger, a rule, a view with a function, a foreign data wrapper, or a logical-replication slot | These are invisible to **every** search over `src/` and `drizzle/`, because they can be created by `IN-4` and leave no repository artifact. **No search of this repository can ever return evidence about them** | **`SPK-S12-2`**; this is the sharpest instance of the gap and is stated as such |
| `X-4` | **A scheduled job** | `scripts/retention-cleanup.sql` is the one known candidate and SUB-8 records that *"the cron registration exists only as a comment, so whether it runs is not establishable"* (exception #4, `08_consent-and-what-a-learner-can-export-and-erase.md:490`). An unregistered second job is the same shape | `SPK-S12-1` (same observation closes both) |
| `X-5` | **A new outbound SDK client** | SUB-9's `W-3` was extended once already because `new OpenAI` does not match `new OllamaEmbeddings`. The general shape is `await import(...)` of a package that opens a socket — the site where a new client first appears | `R-S12-3`; re-run on every dependency bump |

`X-3` deserves a sentence of its own, because it is the one an enumeration over a source tree is
**structurally** unable to close. A trigger on `learning_chunks` created through `IN-4` would read
and write learner rows on every insert, forever, and no reading of this repository at any cutoff
would show it. This is not a diligence gap; it is a property of where the enumeration is drawn.
`SPK-S12-2` states the one query that would settle it (`\dft` and a `pg_trigger` / `pg_publication`
sweep), and it is **not executed**, for the same reason none of the package's other spikes are.

### 2.4 What a differently-shaped search already found, during this chapter's own preparation

Published rather than smoothed away, because it is evidence about how much a green check is worth —
and because it happened *while writing the section that warns about it*.

A delegated enumeration of registered entry points searched `src/server/*.ts` — the directory where
tools are registered — and returned **46 tools and zero MCP prompts**, concluding that no prompts
exist. **Three prompts do exist**, registered at `src/transport/create-server.ts:25`, `:45` and
`:80`. The search was not wrong about `src/server/`; it was wrong about the system, because prompts
are registered in the transport layer and tools in the server layer, and the search's shape encoded
an assumption about where registration lives.

The settled figure is therefore unchanged and is restated here as **46 registered tools / 43 gated /
3 exempt, plus 3 prompts = 49 registered entry points**, matching SUB-11's re-derivation
(`11_the-client-compatibility-contract.md` §1.5). The three exempt tools are named literally at
`src/transport/context-token-middleware.ts:5`–`:9`.

**The lesson this chapter takes from its own error** is the reason §2.3 exists in the form it does: a
falsifier that lists what would extend the enumeration is worth more than a green result, because the
green result is a property of the pattern and the list is a property of the argument.

---

## 3. The invariant vocabulary

OUT-17 requires that every path carry *"an explicit isolation or lifecycle invariant"*. Two families
are used, and the distinction is load-bearing rather than decorative — a path can satisfy one and
breach the other, and several below do.

| Family | Form | Breach means |
| --- | --- | --- |
| **`ISO`** — isolation | *A principal reaches only state it owns; a principal that owns none is refused, not empty-scoped.* | One learner's state is reachable by, disclosed to, or **influenced by** another |
| **`LIFE`** — lifecycle | *State reaching this path is bounded by a stated retention window and reachable by a stated erasure predicate.* | Data outlives its basis, or an erasure completes while a copy survives |

Three verdicts are used per path, and they are deliberately weaker than C010's six because this
matrix is about *paths*, not about state categories reaching `holds`:

- **`held-by-design`** — the invariant is satisfied under the C011 mechanism as designed by SUB-5,
  SUB-8 and SUB-9. Never a claim about the deployment.
- **`gap`** — the invariant is stated and is **not** satisfied, by design or by omission. Every `gap`
  resolves to a gate in §8 or to a blocking finding.
- **`out-of-reach`** — the invariant is stated and this deployment has no mechanism that could
  satisfy it. These are not exemptions: an `out-of-reach` path still carries its invariant, still
  carries an owner, and still appears in the cross-check.

**`out-of-reach` is the category that keeps the operator path honest.** Exempting the operator would
have been the easy move, and it is precisely what OUT-17 forbids. Naming the invariant and then
recording that no mechanism reaches it is a different statement, and it is the true one.

---

## 4. The path-by-path invariant matrix

Thirty-nine paths across nine classes. **Every path carries an invariant. Zero paths carry none** —
the count is reported in §9.

### 4.1 Class A — the MCP read path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-1` | `IN-1`, gated tool, `user` principal, reads own rows | **ISO:** every read carries `learner_key = <principal_id>`, applied inside the query the adapter already issues | `held-by-design` | `05_the-enforcement-point-that-confines-every-read-and-write.md:229`–`:233` (clause 1), `:249` |
| `TP-S12-2` | `IN-1`, gated tool, `client` principal, attempts a row-owning read | **ISO:** refused explicitly, **not** empty-scoped | `held-by-design` | `05_…:250`; the refusal is what makes `SIG-S16-1` limb 1b observable at all |
| `TP-S12-3` | `IN-1`, gated tool, gate **fails open** on internal error and admits the call ungated | **ISO:** a gate whose failure mode is *admit* provides no confinement; the adapter must refuse a `none` principal independently | `gap` → `GATE-S12-1` | `src/transport/context-token-middleware.ts:83`–`:86`; `91_findings-register.md` § `F-S16-3` |
| `TP-S12-4` | `IN-1`, gate **not mounted** because the context-token repository is null | **ISO:** an unmounted gate is an absent gate; the deployment must be able to tell the two apart | `gap` → `GATE-S12-1` | `src/transport/http.ts:184`–`:187` |
| `TP-S12-5` | `IN-2`, **any** of the 46 tools — all ungated on STDIO | **ISO:** the STDIO principal is server-held configuration, and an unconfigured deployment **refuses** every gated tool rather than degrading to today's behaviour | `gap` → `GATE-S12-2` | `04_the-stdio-identity-gate-and-the-bound-context-token.md:189`–`:194`; today: `src/transport/main.ts:55`–`:59` |
| `TP-S12-6` | `init_agent_context` — a **gate-exempt** tool that is nonetheless **row-owning** | **ISO:** the six port reads it fires are each subject to the adapter predicate, and the fail-open must not convert a refusal into a `null` that reads as "no data" | `gap` → `GATE-S12-3` | Six parallel row-owning reads at `src/orchestration/learner-context-workflows.ts:95`–`:103`; the fail-open at `src/server/server-context-tools.ts:28`–`:31` |
| `TP-S12-7` | A **prompt** invocation — 3 of the 49 entry points, outside the 46/43/3 tool arithmetic | **ISO:** a prompt that reaches learner state is subject to the same predicate as a tool; one that reaches none carries the invariant vacuously and is recorded as doing so | `held-by-design` | `src/transport/create-server.ts:25`, `:45`, `:80`; the pack is static content (`src/shared/prompts/prompt-pack.ts`) |

**`TP-S12-6` is the path most likely to be misfiled, and it has been misfiled once already.** It is
exempt from the *gate* and row-owning in *fact*. Under `DR-C11-S5-1` clause 3 every one of its six
reads is refused for a `client`-kind principal — but the caller sees `null`, not a refusal, because
`src/server/server-context-tools.ts:28`–`:31` catches, logs and returns `null`. A refusal that
presents as an empty context is the exact failure `DR-C11-S2-2` rejected at the transport, arriving
one layer down and behind a fail-open. `GATE-S12-3` is set on it.

### 4.2 Class B — the MCP write path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-8` | `IN-1` write, `user` principal | **ISO:** the insert **sets** the ownership column from the principal and ignores any caller-supplied value | `held-by-design` | `05_…:249` |
| `TP-S12-9` | `getActiveSession()` — an unscoped global read feeding a write | **ISO:** the global statement must be **removed**, not shadowed by an added predicate | `gap` → `GATE-S12-4` | `05_…:360`–`:368`, §4.1 |
| `TP-S12-10` | `createSession`'s global-conflict guard — a read-then-write in orchestration, above the port boundary | **ISO:** deleted and re-expressed as a schema constraint; a guard adjudicating "any" is outside `A-28`'s envelope | `gap` → `GATE-S12-4` | `05_…` §4.2; C010's `../C010-system-and-repository-architecture/02_findings-register.md:237` |
| `TP-S12-11` | The **third** unscoped session path the charter does not name | **ISO:** as above | `gap` → `GATE-S12-4` | `05_…` §4.3, `:449` |
| `TP-S12-12` | `IN-2` write under a **per-process singleton** principal | **ISO:** one STDIO process serves one principal; two learners sharing one process are confined to **one** identity, which is the wrong identity for one of them | `out-of-reach` → `GATE-S12-2` | `04_…:507`–`:513`, `R-S4-3`; owner `SUB-10 of C010` (NEU-984), co-named `NEU-896` |
| `TP-S12-13` | A write racing another write — the TOCTOU at `05_…` §4.2 | **ISO:** closed by a partial unique index, which needs a concurrent test to prove | `gap` → `GATE-S12-5` | `05_…:724`–`:726` (path 4, named as required and unwritten) |

### 4.3 Class C — the session path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-14` | Session-binding verification with **no binding found** | **ISO:** an unknown session is refused, not admitted | `gap` → `GATE-S12-6` | `src/transport/http.ts:57`–`:58` returns `true` when no binding is found — a fail-open |
| `TP-S12-15` | A session surviving a restart — the binding map's **only** eviction path is a clean close | **LIFE:** the binding either survives a restart or the session is re-authenticated; it may not silently become unbound-and-admitted | `gap` → `GATE-S12-6` | `91_findings-register.md` § `F-S15-3`; the deployment restarts ≥3.29×/day (`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`) |
| `TP-S12-16` | `session_id` in an audit row, lifted verbatim from the tool call's own arguments | **ISO:** a caller-asserted value may never carry attribution | `held-by-design` (as a **rule**; the emission is `ME-S16-1`) | `16_attribution-and-detection.md:49`; `src/transport/audit-middleware.ts:94`–`:99` |
| `TP-S12-17` | `correlation_id`, echoing a caller-supplied `X-Correlation-ID` header | **ISO:** as above | `held-by-design` (as a rule) | `16_…:49`; `src/transport/http.ts:154`–`:157` |
| `TP-S12-18` | Unbounded growth of the transport and binding maps from abandoned sessions | **LIFE:** process-local learner state carries a bound; today the only bound is the deploy cadence | `gap` → `GATE-S12-7` | `F-S15-3`; `R-S15-2` — *"contained only by release cadence"* |

**`TP-S12-14` and `TP-S12-15` are one exposure, not two, and the composition is worse than either.**
The binding map is emptied by every restart, and the verifier admits a request whose binding is
missing. So after each of ≥3.29 daily deploys, **every pre-existing session is admitted unverified**
— not as an edge case but as the steady state for the lifetime of those sessions. Neither predecessor
states the composition, because each owned one half: `F-S15-3` owns the eviction, `R1` owns the
fail-open. It is stated here as **`F-S12-2`**.

### 4.4 Class D — the retrieval path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-19` | `SearchPort.searchByQuery` / `searchByVector` over chunk and topic rows | **ISO:** *"a vector search is a read like any other; similarity ranking does not exempt it"* — the same predicate as ports 1 and 2 | `held-by-design` | `05_…:342` (per-port table, port 10) |
| `TP-S12-20` | The **search query itself** is embedded, so the learner's query text egresses to an external provider before any row is read | **LIFE:** query text is learner-derived content and carries the same lawful-basis question as chunk content | `out-of-reach` → `GATE-S12-8` | `src/orchestration/search-workflows.ts:48`, `:85` reach `EmbeddingPort`; §6.1 |
| `TP-S12-21` | A ranked result set that returns **no rows** but whose ranking was computed over an unconfined corpus | **ISO:** SUB-5's aggregate rule — confined **iff** the predicate applies before the ranking | `held-by-design` | `05_…:591`–`:593` |

**`TP-S12-20` is a path no predecessor placed.** SUB-9's `W-3` enumerated the *embedding call sites*
and correctly found chunk text; it did not separate the **query** from the **corpus**. The
distinction matters for lifecycle rather than isolation: a chunk is stored learner content with a
retention window, whereas a search query is transient, is never persisted by this deployment, and
still leaves the process. It is an addition to SUB-9's enumeration, not a contradiction of it, and
it is filed as **`F-S12-3`** and routed to SUB-8's lawful-basis question (`OI-S3-1`) rather than
re-raised as a copy class.

### 4.5 Class E — the context-token path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-22` | Token creation and validation | **ISO:** the token row is confined by **unguessable id plus expiry**, not by the principal it establishes — confining it by that principal would be circular | `held-by-design` | `05_…:338` (per-port table, port 6) |
| `TP-S12-23` | **Unbound legacy tokens** already live in production at cutover | **ISO:** rejected at cutover rather than honoured | `held-by-design` | `DR-C11-S4-3` |
| `TP-S12-24` | The token row carries `principal_id` and a consumer reads it **without** `principal_kind` | **ISO:** the pair is indivisible — reading the id alone rebuilds the `sub \|\| azp` collapse one layer down | `held-by-design` (settled) | `04_…:255`–`:256` (`R-S4-1`); settled by `05_…:235`–`:243` clause 2 |
| `TP-S12-25` | The two `principal_kind` domains disagree — two-valued on the token row, three-valued on the log tables | **ISO:** the enforcement point reads the **three-valued** domain; `none` is unreachable on the token row by construction | `held-by-design` (routed) | `05_…:259`–`:276`, `F-S5-6`; DDL owner SUB-13 |
| `TP-S12-26` | Token expiry sweep — `deleteExpired`, principal-independent by design | **LIFE:** a maintenance sweep bounded by the 2-hour TTL; it deletes no learner-owned row | `held-by-design` | `05_…:338`; TTL `C-11` at `src/config/resolve-context-token-config.ts:8`–`:9` |

### 4.6 Class F — the analytics and aggregate path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-27` | Aggregates that **can** take the predicate below the aggregation — eleven named sites | **ISO:** confined **iff** the predicate applies before aggregation; returning no rows is not confinement | `held-by-design` | `05_…:591`–`:603` |
| `TP-S12-28` | `Tier2BlockingStatsRepository`'s weekly counts over a table with **no ownership key** | **ISO:** an unconfined `COUNT` discloses a true fact about another learner's data while returning none of it | `out-of-reach` → `GATE-S12-9` | `05_…:605`–`:611`, `F-S5-9`; the query at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`–`:42` carries no principal predicate |
| `TP-S12-29` | **That same unconfined aggregate consumed as a *control input* by the Tier-2 circuit breaker** | **ISO:** state derived from one learner's activity may not alter the controls applied to another | **`gap` — blocking** → `GATE-S12-10` | §7. **New in this chapter, filed as `F-S12-1`** |
| `TP-S12-30` | The breaker's trip set is process-lifetime and cleared only by restart | **LIFE:** a control that disables itself carries a stated re-enable condition; today the only one is a deploy | `gap` → `GATE-S12-10` | `src/orchestration/tier2-circuit-breaker.ts:65`–`:68`, `:148`–`:151` |

### 4.7 Class G — the migration path

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-31` | The boot migrator runs **unconditionally**, with no environment guard and no repository-owned lock | **LIFE:** exactly one migrator runs per schema transition | `gap` (registered) | `OBJ-12`; `R-S15-3` — **cited, not re-raised**, per the charter's one-record rule |
| `TP-S12-32` | The archive sweep of the pre-cutover population runs at boot and cannot be deferred | **LIFE:** a migration step's duration is bounded by the availability budget | `gap` (registered) | `R-S6-2` — **cited, not re-raised**; §11 |
| `TP-S12-33` | Ordering: the column, the backfill and the predicate **cannot all land in one step** | **ISO:** confinement is not enabled before the rows it confines have owners | `held-by-design` (routed) | `05_…:636`–`:641`, `F-S5-10`; sequencing is SUB-7's |
| `TP-S12-34` | Confinement over the mixed population **hides** every unowned row from **every** principal, including its creator | **ISO/LIFE:** data loss by predicate — the safe direction, and still a loss | `gap` → `GATE-S12-11` | `05_…:624`–`:629`; `R-S5-1` |

### 4.8 Class H — the operator path

Nine paths, all of them modelled in §5 rather than tabulated twice: `TP-S12-35` … `TP-S12-43`.

### 4.9 Class I — the prospective general web API

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-44` | **Read-projection** — the API renders learner state it obtained by calling the MCP core | **ISO:** the API inherits the core's predicate and adds none of its own; it is a caller of `IN-1`, so `TP-S12-1`…`TP-S12-4` apply to it unchanged | `held-by-design` | `../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md:120`–`:121`, `:128` |
| `TP-S12-45` | **Write-intent** — the API forwards a learner action as an MCP tool call; the mutation is performed by the core's authority | **ISO:** the API performs no write and, under `M-A`, **holds no database credential at all** | `held-by-design` | `../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md:123`–`:125` |
| `TP-S12-46` | The API's **own** session — it terminates the learner's web session | **ISO:** the web session is not the MCP session and may not be used as one; the principal presented to the core is derived from the verified token, never from the web session id | `gap` → `GATE-S12-12` | The negative boundary at `:113` — *"The API holds zero of the forty-five state categories"* |

**`TP-S12-46` is the only web-API path that is not simply `IN-1`'s, and it is a gap rather than a
decision this chapter may take.** C010 fixed *what* the API may reach; it did not fix how the web
session maps to a principal, because under `M-A` there was no server-side web state for it to map to.
The invariant is stated and the mechanism is `NEU-896`'s at convergence. **This is not a re-decision
of C010's boundary** — it is the boundary consumed, with the one thing it does not answer named
rather than assumed.

### 4.10 Class J — the egress paths no class claims

SUB-9 routed three copy locations to this chapter **by name**
(`09_proving-a-data-right-reaches-every-copy.md:599`–`:603`). Each carries an invariant here.

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-47` | Chunk text to **OpenAI** embeddings | **LIFE:** learner content leaving the deployment carries a lawful basis and a processor position | `out-of-reach` → `GATE-S12-8` | `src/adapters/langchain/embedding-adapter.ts:89`; `F-S9-1`; `F-S5-2` |
| `TP-S12-48` | The same chunk text to **Ollama**, at an **operator-configurable** destination | **LIFE + ISO:** the destination of learner content is a declared, reviewable value, not an unaudited environment variable | `out-of-reach` → `GATE-S12-8`, `GATE-S12-13` | `src/adapters/langchain/embedding-adapter.ts:118`; `OLLAMA_BASE_URL` at `src/config/resolve-embedding-config.ts:34` |
| `TP-S12-49` | **Classifier prompts** over learner content to `ChatOpenAI` | **LIFE:** as `TP-S12-47`, and this is the **largest** learner-content egress by volume | `out-of-reach` → `GATE-S12-8` | `src/adapters/langchain/content-classifier-adapter.ts:199`, invoked at `:145` |
| `TP-S12-50` | **Process stderr** — pino's sink, carrying learner free text unredacted | **LIFE:** every copy of learner content has a retention bound and a deletion owner | `out-of-reach` → `GATE-S12-14` | `src/shared/logger.ts:65`; redaction is credentials-only, `:39`–`:54`; `F-S9-5` |
| `TP-S12-51` | The **STDIO host's own application state** — a transcript, a cache, a log on the peer | **LIFE:** a propagation action into a class the deployment cannot reach is an *instruction*, and its limits are stated rather than implied | `out-of-reach` | `09_…` §4.6; carried within `F-S9-4` |

**On STDIO, `TP-S12-50` is not a duplicate — it is the sole copy**, and §6.1 states what that does to
the whole model.

### 4.11 Class K — the package's own captured production evidence

| Id | Path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-52` | `LD-S3-31` — this package's own captures of real learner-derived production data, quarantined at `_local/scratch/` | **LIFE:** confined by SUB-1's recorded terms — named owner, retention bound, destruction condition at publication, redaction discipline, quarantine path — because there is no row for a predicate to attach to | `out-of-reach` → `GATE-S12-21` | `05_the-enforcement-point-that-confines-every-read-and-write.md:564`–`:582` (§6.2); `01_production-evidence-and-the-access-audit.md:151`–`:159` |

**Membership at this cutoff is zero**, because zero of the package's designed spikes have executed
for want of a credential. **Zero members is not absent terms**, which is exactly why the path is
enumerated rather than omitted: a class the threat model silently skipped would read to a later
reader as a class with no invariant, and SUB-3 refused to collapse that distinction for the same
reason (`03_learner-data-inventory-and-classification.md:431`–`:437`).

---

## 5. The operator path, modelled rather than exempted

This is the section OUT-17 exists for. The operator has SSH access to the single VPS and direct
database access, and **no chapter in either package has modelled that path at all**. Exempting it
would be the natural move — the operator is the creator, is trusted, and is the only party who could
fix anything. That is precisely why the charter forbids it: *"Operator access is modelled, not
exempted"* (`01_charter.md:220`, OUT-17's own acceptance text).

**The framing this section uses, stated first.** Modelling the operator is *not* an accusation of
malice, and treating it as one is why it gets skipped. Three things make it a real threat path
regardless of intent: **(a)** an operator action is indistinguishable from an attacker who has
obtained operator credentials, and this deployment has one host, one credential set and no second
party to notice; **(b)** an operator mistake at this level has the same blast radius as an attack;
and **(c)** every isolation guarantee the other eleven chapters build is enforced *inside a process
the operator can bypass entirely*. A confinement that holds for all 49 entry points and not for
`psql` is a confinement with a stated scope, and that scope has never been written down.

| Id | Operator path | Invariant | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| `TP-S12-35` | **Direct `psql`** against the production database | **ISO:** operator access to learner rows is *authorized, attributed and bounded* — the enforcement point cannot apply, so the invariant must be met by a different layer or recorded as unmet | `out-of-reach` → `GATE-S12-15` | `05_…:719`–`:722`; the enforcement point is *"inside each row-owning adapter"* (`:229`–`:230`), and `psql` is below it |
| `TP-S12-36` | **SSH to the VPS**, reading the container's log files | **LIFE:** learner free text on disk carries a retention bound and a deletion owner | `out-of-reach` → `GATE-S12-14` | `F-S9-5`; log-driver retention is *"a deployment arrangement outside the repository"* |
| `TP-S12-37` | **`clearAllTables()`** — `TRUNCATE … CASCADE` over ten tables including every learner table | **LIFE:** a destructive maintenance operation is gated on a property of the **target**, not on a property of the **caller's environment** | **`gap` — blocking** → `GATE-S12-16` | §5.1. **Filed as `F-S12-4`** |
| `TP-S12-38` | **`pnpm db:seed`** — inserts into `learning_topics`, `learning_chunks`, `learning_sessions`, `session_chunks` | **ISO:** every write to a learner table carries a principal; a write with none creates an unowned row of exactly the kind SUB-6 spent a chapter dispositioning | `gap` → `GATE-S12-17` | `package.json:43`; the script is imported by nothing under `src/` — it is an operator path, not a runtime one |
| `TP-S12-39` | **`scripts/retention-cleanup.sql`**, run by hand or by an unregistered cron | **LIFE:** the retention window is enforced by a mechanism whose execution is observable | `gap` → `GATE-S12-18` | SUB-8 exception #4: the cron registration *"exists only as a comment"* (`08_…:490`) |
| `TP-S12-40` | **Setting `OLLAMA_BASE_URL`** — redirects learner content to any host | **ISO:** the destination of learner content is declared and reviewable | `gap` → `GATE-S12-13` | `src/config/resolve-embedding-config.ts:34`; default `http://localhost:11434` at `src/domain/config/embedding-defaults.ts:11` |
| `TP-S12-41` | **Unsetting `AUDIT_DATABASE_URL` / `DATABASE_URL`** for the audit writer — silently disables all audit emission | **LIFE:** the audited state of the deployment is observable; an unaudited deployment is distinguishable from a silent one | `gap` → `GATE-S12-19` | `src/transport/http.ts:176`–`:182`; `ME-S16-7`; `OI-S16-1` |
| `TP-S12-42` | **Merging to `develop`** — auto-deploy on green CI, `git reset --hard`, no rollback step | **ISO:** a change that removes or weakens a confinement predicate is detected at the deploy boundary | `gap` → `GATE-S12-20` | Charter assumption 21; `SIG-S16-4` is the signal shaped for exactly this |
| `TP-S12-43` | **Restoring or reading a backup** — existence unestablished | **LIFE:** every copy is reachable by the erasure predicate | `out-of-reach` (cited) | `OI-S1-8` — **cited, not re-recorded**; this chapter raises no second record of the backups fact |

### 5.1 `F-S12-4` — the destructive maintenance path whose guard is caller-asserted

`clearAllTables()` issues `TRUNCATE context_tokens, notes, session_question_attempts,
session_questions, session_chunks, learning_sessions, learning_chunks, learning_topics,
infrastructure.linter_validation_corpus, infrastructure.linter_rule_validation_report CASCADE`
(`src/infrastructure/db/client.ts:77`–`:79`). It is the single most destructive statement in the
repository, and it is a **raw SQL template executed via `db.execute`** — invisible to a `.insert(`- or
`.delete(`-shaped search, which is the same enumeration defect SUB-9 published against itself.

Its guard is at `:66`–`:73`:

```
const isTestEnv =
  process.env.NODE_ENV === 'test' ||
  process.argv.some(arg => arg.includes('vitest')) ||
  !!process.env.VITEST;
if (!isTestEnv) { throw new Error('clearAllTables can only be called in a test environment'); }
```

**Every one of the three disjuncts is a property of the caller's own environment**, not of the
database being truncated. `NODE_ENV`, `argv` and `VITEST` are all under the control of whoever starts
the process. The guard answers *"does this process believe it is a test?"* — never *"is this a test
database?"*.

There **is** a target-shaped guard in the same file: `getDatabaseUrl()` at `:17`–`:32` requires that
**if** `isTestEnv` is true, the database name must contain `_test`. Read together the pair looks
sound. Three things weaken it, and all three are properties of the code rather than speculation:

1. **The two guards are evaluated at different times, against a memoized value.** `getDatabaseUrl()`
   runs only inside `getPool()` and only when `poolInstance` is undefined (`:38`–`:39`). Once the
   pool exists, the `_test` check never runs again. `clearAllTables` resolves its handle through
   `getSql()` and re-checks only `isTestEnv`. **A process that built its pool while `NODE_ENV` was
   not `test`, and then had `NODE_ENV` set to `test`, satisfies `clearAllTables`'s guard against a
   pool that was never subject to the `_test` check.**
2. **The `_test` check is a substring test** (`dbName.includes('_test')`, `:25`). A production
   database whose name happens to contain that substring passes it.
3. **Neither guard is a property the database enforces.** The database will execute the `TRUNCATE`
   from any session holding the privilege, which is `IN-4`'s whole point.

**What keeps this safe today is that `clearAllTables` is reachable from nothing but the test harness**
— its only call sites are `tests/helpers/db-setup.ts:62`, `tests/integration/db/client.test.ts:47`
and `tests/integration/db/migrate.test.ts:40`. That is a real mitigation and it is stated as one.
It is also **not an invariant**: it is a fact about the current call graph, enforced by nothing, and
the gate in §8 is set on keeping it true rather than on hoping it stays true.

This is filed as **`F-S12-4`**, severity high, and it is a **blocking finding** under OUT-17's rule
only if no measurable control exists. One does — `GATE-S12-16` — so it is filed as a finding with a
gate rather than as a blocking finding. The distinction is applied deliberately and is not a
softening: OUT-17's blocking rule attaches to gaps **without** a measurable control, and this gap has
one that a reader can check mechanically.

### 5.2 What the operator path does to the other eleven chapters

Stated plainly, because it is the most over-trusted conclusion a reader could draw from this package:

> **Every isolation guarantee in C011 is scoped to `IN-1` and `IN-2`.** The enforcement point is a
> predicate inside an adapter method; `IN-4` and `IN-5` do not execute adapter methods. No chapter
> claims otherwise, and none says so either. It is said here.

That is not a defect in SUB-5's design — a port-boundary mechanism *cannot* reach below the port
boundary, and placing it there is what `A-28`'s envelope requires. It is a **scope statement that was
missing**, and its absence is what would let a reader carry "confinement is enforced" out of this
package without the qualifier that makes it true. Carried as **`R-S12-1`**.

---

## 6. The five things the enforcement point does not confine, as threat paths

SUB-5 §6 names **four** escapes, and SUB-9 corrected a brief that had merged a fifth into them
(`09_proving-a-data-right-reaches-every-copy.md:626`–`:633`). **That correction is confirmed here
against the file, independently.** `05_…` §6 contains exactly four sub-sections — §6.1 content
egress, §6.2 `LD-S3-31`, §6.3 the aggregate, §6.4 the non-retroactive boundary — and the operator /
`psql` path is named separately at §7.4 (`:719`–`:722`) as an uncovered **test** path. Operator is a
fifth thing in a different section. SUB-9 is right, and a model that folded it into the four would
misattribute SUB-5's own structure.

| # | Escape | SUB-5's id | Threat path here | Gate |
| --- | --- | --- | --- | --- |
| 1 | Content egress to external providers | `F-S5-2` | `TP-S12-47`, `TP-S12-48`, `TP-S12-49`, and **`TP-S12-20`** (the query, new here) | `GATE-S12-8`, `GATE-S12-13` |
| 2 | `LD-S3-31` is not confinable — it lives at `_local/scratch/`, behind no port | cross-reference | Zero members; confined by SUB-1's recorded terms. **`TP-S12-52`** | `GATE-S12-21` |
| 3 | The unkeyed Tier-2 aggregate | `F-S5-9` | `TP-S12-28` (disclosure) **and `TP-S12-29` (actuation — §7)** | `GATE-S12-9`, `GATE-S12-10` |
| 4 | The non-retroactive boundary | `F-S5-10` | `TP-S12-33`, `TP-S12-34` | `GATE-S12-11` |
| **5** | **Operator / `psql`** — §7.4, a fifth thing | (no id; named, not registered) | `TP-S12-35` … `TP-S12-43` | `GATE-S12-15` … `GATE-S12-20` |

### 6.1 What the STDIO no-audit-record finding does to this model

SUB-9 established that under STDIO the database log transports are never wired, so the event stream
goes to stderr and **no audit rows exist at all** (`09_…:219`–`:229`). **This chapter re-verified that
claim against `src/transport/` independently, and it holds — in a stronger form than stated.**

The DB transports are constructed at exactly one site, inside `startHttpTransport`
(`src/transport/http.ts:176`–`:182`), guarded by `auditDbUrl`. The STDIO branch at
`src/transport/main.ts:55`–`:59` never calls `startHttpTransport`. So the condition is not *"the
environment variable happens to be unset"* — **the code path that reads that variable and constructs
the transports is structurally unreachable from the STDIO branch.** `eventPinoLogger` stays `null`
for the process lifetime and `logEvent` takes its stderr fallback arm
(`src/shared/logger.ts:247`–`:250`). Setting `AUDIT_DATABASE_URL` on a STDIO deployment changes
nothing.

**The consequence for this model is structural, and it is the reason `GATE-S12-2` is set the way it
is.** Every count-based gate in §8 reads a row in `infrastructure.mcp_request_log`. On STDIO that
table receives nothing, ever. So:

- Every count-based gate is **unsettable on STDIO** — not zero, *undefined*. SUB-16 makes exactly
  this point for `SIG-S16-2` and refuses to record it as zero (`16_…:192`–`:196`); this chapter
  applies the same refusal to the entire gate register rather than to one signal.
- A threat model that assumed audit coverage on the STDIO path would be modelling a system that does
  not exist. **This one does not**, and the `Transport` column in §8 is there to make that visible
  per gate instead of in a footnote.
- **Attribution on STDIO is a two-step problem** and only the second step has an owner. First a
  record must exist (SUB-7, under OUT-3); then it can carry a principal (C010's `OI-S8-2`, owner
  `SUB-10 of C010` / NEU-984). `GATE-S12-2` names both.

---

## 7. `F-S12-1` — an unconfined aggregate consumed as a control input

This is the failure mode this chapter found that no predecessor states, and it is the substance of
the amendment in §10. `DR-C11-S12-2` records it in full.

### 7.1 The mechanism, from the code

Four facts, each read at cutoff `57aeba3`:

1. **The aggregate carries no principal predicate.** `DrizzleTier2BlockingStatsRepository`
   aggregates `infrastructure.operation_event_log` filtered to
   `event = 'classifier.tier2_blocked'` and bounded to `NOW() - INTERVAL '5 weeks'`
   (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`–`:42`). There is no learner column
   on that table and no predicate in that query. The counts **span every learner**. This is `F-S5-9`.
2. **The breaker is one per process, shared by every learner.** *"callers should create exactly one
   breaker per process and reuse it across requests"* (`src/orchestration/tier2-circuit-breaker.ts:59`).
3. **The breaker trips on a threshold over those counts.** For each verdict field it computes
   `mean + 2σ` of prior weekly buckets and trips when the current week exceeds it
   (`:124`–`:128`, `SIGMA_MULTIPLIER = 2` at `:40`). The trip is **one-shot per process and field**,
   held in a `Set` that is cleared only by restart (`:65`–`:68`, `:148`–`:151`).
4. **Tripping a field removes it from the blocking set for every subsequent caller.** `applyTo`
   returns the input set **minus** the tripped fields (`:182`–`:187`).

### 7.2 The chain, stated as a threat

> Learner **A** submits content that the Tier-2 classifier rejects on field **F**, repeatedly.
> Those rejections are counted in an aggregate that **does not distinguish A from anyone else**.
> When the week's count crosses `mean + 2σ`, the breaker trips **F**.
> From that moment, for **every other learner in the process**, field **F** stops blocking content
> creation — until the next restart.

**Learner A can therefore durably disable a content-quality control that applies to learner B, by
volume of their own rejected submissions, with no access to B's data of any kind.**

### 7.3 Why it is a distinct finding and not a restatement of `F-S5-9`

`F-S5-9` is a **disclosure** finding: *"an unconfined `COUNT` discloses a true fact about another
learner's data while returning no learner data at all"* (`05_…:592`–`:593`). SUB-9 read it the same
way and correctly concluded it *"bounds disclosure, not copies"*
(`09_…:623`). Both are right about disclosure.

**This is not disclosure. It is actuation.** The aggregate is not returned to anyone; it is consumed
as the input to a control decision. Nobody learns anything about A. What happens instead is that the
system's behaviour toward B changes because of A. That difference is not rhetorical — it changes
every property that matters:

| | Disclosure (`F-S5-9`) | Actuation (`F-S12-1`) |
| --- | --- | --- |
| What crosses the boundary | A true fact about A's data, to a reader | A change in the controls applied to B |
| Detected by `SIG-S16-1` | In principle, once limb 1a has a comparison | **No.** No row's owner differs from the requester's key — there is no row |
| In SUB-9's copy matrix | No copy is created | **No copy is created either**, so it is outside all six classes for the same reason |
| Closed by `DR-C11-S5-1` | No — the port is named as not confinable | **No.** Port 9 is routed to the log-table caps, and the caps are about *retention and deletion* |
| Direction of harm | Confidentiality | **Integrity of a quality control, and availability of the control** |

**The routing `F-S5-9` carries does not close this half.** SUB-5 routes port 9 to `CAP-S3-3` and
`CAP-S4-1` — the log-table caps, owner `NEU-986`, co-named `NEU-896` — which are
retention-and-deletion caps. Adding a retention bound or a deletion owner to
`operation_event_log` does nothing whatever about a breaker reading it as a control input. **A
disposition aimed at the right table can still miss the failure mode**, and that is the whole reason
this is filed separately rather than as a note under `F-S5-9`.

### 7.4 Severity, honestly bounded

Three things bound it, and they are stated rather than left for a reader to discover:

- **The harm direction weakens a quality gate rather than exposing data.** `applyTo` *shrinks* the
  blocking set. No learner reads another's content through this channel.
- **The exposure window is bounded by restart cadence.** The trip set clears on restart, and the
  deployment restarts at ≥3.29 times per day over the most recent 7 days (`C-17`). **That is a
  dependency on an accident, not a control** — the same shape `R-S15-2` registers for the session
  maps, and it fails in exactly the case where it matters most: a deployment that has stabilised and
  stopped shipping daily.
- **It requires volume, not privilege.** The threshold is `mean + 2σ` over an aggregate spanning all
  learners, so at `n = 1` the single learner is trivially the whole population, and at larger `n` the
  cost to A rises. **No number is offered for how much volume**, because the arrival rate is
  unobserved (`OI-S15-3` is SUB-15's distinct `t_db` question and is **not** claimed to answer this
  one) and the prior-week distribution has never been seen. `SPK-S12-3` states the observation that
  would settle it.

Severity is recorded as **high, not critical**: it is a genuine cross-learner failure with no
confidentiality impact and a bounded window. Recording it as critical would overstate it; recording
it as medium would let it be deferred past the gate. **`GATE-S12-10`** is the control.

---

## 8. The gate register

**The rule this register is written under** (OUT-17, charter `:220`): every critical gap resolves to
a *measurable control with a named owner and a threshold that gates implementation authorization*;
**a gap without a measurable control is recorded as a blocking finding rather than accepted.**

**What "measurable" is permitted to mean here.** No production credential exists, so no threshold
below is a production measurement. `DR-C11-S12-3` fixes the three admissible provenances, following
the pattern SUB-15 set for its `OBJ-*` and SUB-9 for its falsifier:

- **`D` — derived**, from a cited non-production source: a repository constant, an upstream
  objective, or arithmetic over them, with the derivation shown.
- **`S` — stand-in**, a registered assumption with a named owner and a re-validation trigger.
- **`K` — deferred spike**, with a method and a mandatory expiry, recorded `not executed`.

**`observed-in-production` is a fourth label this register is entitled to use and uses zero times.**

**`Transport`** records where the gate can be evaluated, because §6.1 makes that a per-gate fact
rather than a footnote: `H` = HTTP only, `H+S` = both, `—` = neither (evaluated outside the running
process).

| Id | Gap it closes | Control | Threshold | Prov. | Transport | Owner | Evidence source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GATE-S12-1` | `TP-S12-3`, `TP-S12-4` — the gate fails open and can be absent | The adapter refuses a `none`-kind principal **independently of the gate**, so an admitted ungated call still reaches no row | **Zero** admitted `tools/call` on a gated tool with `principal_kind = 'none'`, per 24 h | D — `SIG-S16-2`'s zero-tolerance threshold, `16_…:144` | H | **SUB-7** (NEU-1001) for the emission; **SUB-5**'s clause 3 for the refusal | `mcp_request_log` + `ME-S16-1`'s carrier |
| `GATE-S12-2` | `TP-S12-5`, `TP-S12-12` — STDIO is ungated and unrecorded | An audit **record** on STDIO, then a principal on it; until both, STDIO refuses every gated tool when no principal is configured | Record: **exists / does not exist** — binary, not a count. Principal: **zero** gated calls admitted with no configured principal | D — `04_…:189`–`:194`; `ME-S16-2` | S (unsettable today) | **Record:** SUB-7 (NEU-1001). **Principal:** C010's `OI-S8-2`, owner `SUB-10 of C010` (NEU-984), co-named `NEU-896` | §6.1 |
| `GATE-S12-3` | `TP-S12-6` — `init_agent_context` is exempt and row-owning behind a fail-open | The fail-open distinguishes *refused* from *empty*; a refusal is logged as a refusal and is not returned as `null` | **Zero** occurrences of a caught `buildLearnerContext` error being returned as an empty context without a corresponding refusal event | D — `ME-S16-3`; `src/server/server-context-tools.ts:28`–`:31` | H | **SUB-5** (NEU-997) for the refusal event; **SUB-7** for the emission | `operation_event_log` |
| `GATE-S12-4` | `TP-S12-9`…`TP-S12-11` — three unscoped global statements | The global statement **does not exist anywhere in `src/`** after the change | **Zero** occurrences — a mechanical grep, which is why SUB-5 chose it | D — `05_…:367`–`:368`, the test stated as mechanical | — (static) | **SUB-13** (NEU-1006) DDL; **SUB-7** sequencing | The source tree at the landing cutoff |
| `GATE-S12-5` | `TP-S12-13` — the TOCTOU race | A partial unique index, proved by a **concurrent** integration test | Test **exists and is green**; `T1`–`T7` extended with a concurrency case | D — `05_…:724`–`:726` | — | **SUB-13** (the DDL binds the test's design) | `tests/integration/` |
| `GATE-S12-6` | `TP-S12-14`, `TP-S12-15`, `F-S12-2` — the fail-open binding over an evaporating map | `verifySessionBinding` **refuses** an unknown session instead of returning `true` | **Zero** requests admitted with no binding found | D — `src/transport/http.ts:57`–`:58`; the composition is `F-S12-2` | H | **SUB-7** (NEU-1001) under OUT-3 | `mcp_request_log` |
| `GATE-S12-7` | `TP-S12-18` — unbounded session-map growth | A TTL or size bound on the transport and binding maps | A bound **exists**; entry count stays under it. **No entry count is stated** — the per-entry footprint is unmeasured | S — `A-S12-1`, resting on `OI-S15-4`; owner the creator | H | **The creator**, as sole operator; **SUB-4** (NEU-996) for the design | `F-S15-3`; `R-S15-2` |
| `GATE-S12-8` | `TP-S12-20`, `TP-S12-47`…`TP-S12-49` — learner content egresses to third parties | A stated lawful basis and processor position per provider, before the mechanism ships | **Every** egress destination has a named basis and a named processor role; count of destinations without one is **zero** | D — `OI-S3-1`; `F-S9-1`; `F-S5-2` | — | **The owner of `OI-S3-1`** (the creator, as sole operator); **SUB-8** (NEU-1002) under OUT-11 | The four call sites in §4.10 + `TP-S12-20` |
| `GATE-S12-9` | `TP-S12-28` — the unkeyed aggregate discloses | The predicate applies **before** aggregation, or the table acquires an ownership key | Count of aggregates over learner-derived tables with **no** pre-aggregation predicate: target **zero**; **today it is one** | D — `05_…:591`–`:593`, `:605`–`:611` | — (static) | **`NEU-986`** (`SUB-12 of C010`), owner of `CAP-S3-3`/`CAP-S4-1`, co-named `NEU-896` | `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`–`:42` |
| `GATE-S12-10` | **`TP-S12-29`, `TP-S12-30`, `F-S12-1`** — the aggregate as a control input | **Either** the breaker's input is confined to the acting principal, **or** the breaker is a per-learner rather than per-process control, **or** the field set it may shrink is fixed by configuration and not by a learner-influenced statistic | Count of **cross-learner control inputs** — a control whose input aggregates over more than one learner: target **zero**; **today it is one** | D — §7, from the four code facts at `:39`–`:42` and `:59`, `:124`–`:128`, `:182`–`:187` | — (static) | **`NEU-896`** at convergence: the breaker is a product-behaviour decision, not a confinement mechanism this package may redesign. Co-named **SUB-13** (NEU-1006) if the answer is schema-shaped | §7; `DR-C11-S12-2` |
| `GATE-S12-11` | `TP-S12-34` — confinement hides unowned rows from everyone | Every row has an owner **before** the predicate is enabled; the stage order is authored, not assumed | Count of learner-table rows with a null owner at the instant the predicate lands: **zero** | D — `05_…:636`–`:641` (`F-S5-10`); the disposition is SUB-6's | — | **SUB-7** (NEU-1001) under OUT-3 | The migration plan (SUB-13) |
| `GATE-S12-12` | `TP-S12-46` — the web session's mapping to a principal is unfixed | The principal presented to the core is derived from the verified token, never from the web session id | The mapping is **stated in a decision record** before the API is built; count of unspecified mappings: **zero** | D — C010's negative boundary, `../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md:113` | — | **`NEU-896`** at convergence — the API does not exist and no package owns it yet | C010's `11_…` |
| `GATE-S12-13` | `TP-S12-40`, `TP-S12-48` — the egress destination is an unaudited env var | The configured destination of learner content is recorded and reviewed as a declared value | Count of learner-content egress destinations whose value is not recorded anywhere: target **zero**; **today it is at least one** (`OLLAMA_BASE_URL`) | K — **`SPK-S12-4`**: read the deployed value; **not executed** | — | **The creator**, as sole operator | `src/config/resolve-embedding-config.ts:34` |
| `GATE-S12-14` | `TP-S12-36`, `TP-S12-50` — learner free text on stderr and in host log files | A log-driver retention bound and a named deletion owner for the container's logs | A retention bound **exists and is stated**; today **none is established** | K — **`SPK-S12-5`**: read the compose stack's logging configuration; **not executed** | H+S | **The creator**, as sole operator; escalates to `NEU-896` | `F-S9-5`; `src/shared/logger.ts:65`, `:39`–`:54` |
| `GATE-S12-15` | `TP-S12-35` — direct `psql` is below every port | Operator database access is a **named, separate credential** whose sessions are attributable, distinct from the application's | Count of operator database sessions indistinguishable from application sessions: target **zero**; **today it is unmeasurable** — one credential is known and no session-level attribution exists | K — **`SPK-S12-6`**: enumerate database roles and their grants; **not executed** | — | **The creator**, as sole operator; escalates to `NEU-896` | `05_…:719`–`:722`; §5.2 |
| `GATE-S12-16` | `TP-S12-37`, `F-S12-4` — `TRUNCATE … CASCADE` behind a caller-asserted guard | The guard tests a property of the **target database**, evaluated at the moment of the statement, not a property of the caller's environment memoized at pool construction | **Zero** call sites of `clearAllTables` outside `tests/`; **and** the target-shaped check is re-evaluated at call time | D — `src/infrastructure/db/client.ts:66`–`:73`, `:17`–`:32`, `:38`–`:39` | — (static) | **The creator**, as sole operator, for the deployment; the implementation charter `NEU-896` hands OUT-19 to, for the guard | §5.1 |
| `GATE-S12-17` | `TP-S12-38` — the seed script writes unowned learner rows | The seed script either sets an owner or is refused against a database holding real rows | **Zero** rows created by `db:seed` without an owner, once the ownership column exists | D — `package.json:43`; `NEU-850`'s `OUT-2` `NOT NULL` requirement | — | **SUB-13** (NEU-1006) under OUT-19 — it authors the DDL that makes the column `NOT NULL` | `src/infrastructure/db/seed.ts` |
| `GATE-S12-18` | `TP-S12-39` — the retention window's enforcement is unobservable | The cleanup runs on a registered schedule and **emits** its run | Count of retention windows with no observable enforcement: target **zero**; **today it is two** (both log tables) | D — SUB-8 exceptions #4 and #5, `08_…:490`–`:491`; `R-S8-4` | — | **The creator**, as sole operator; **`NEU-986`** for the caps | `scripts/retention-cleanup.sql` |
| `GATE-S12-19` | `TP-S12-41` — audit emission is conditional and silently disableable | The deployment reports whether the audit writer is mounted | The mounted state is **observable**; today it is unobserved | K — **`SPK-S16-1`**, SUB-16's spike, **cited not re-filed**; `OI-S16-1` | H | **The creator**, as sole operator | `src/transport/http.ts:176`–`:182`; `ME-S16-7` |
| `GATE-S12-20` | `TP-S12-42` — a deploy silently reverses a confinement gain | The paired before/after comparison across each deploy boundary | `principal_kind = 'none'` share **does not increase** across a deploy boundary; refusal rate **does not fall to zero** where the prior window was non-zero | D — `SIG-S16-4`, both limbs, `16_…:146` | H | **SUB-7** (NEU-1001) for the stages; the creator for the channel | `mcp_request_log.response_status`, which exists today |
| `GATE-S12-21` | `TP-S12-52` — `LD-S3-31`, the class with zero members and terms that exist anyway | SUB-1's recorded terms: named owner, retention bound, destruction condition at publication, redaction discipline, quarantine path | Membership **zero**, or every member destroyed at its quarantine path by publication | D — `01_production-evidence-and-the-access-audit.md:151`–`:159`; `09_…` §7.4 | — | **The creator**, as sole operator | SUB-1's terms, read not authored |
| `GATE-S12-22` | The **`LIFE` limb** of `TP-S12-34` and `TP-S12-47` … `TP-S12-51` — the paths whose lifecycle invariant needs a completion proof to be checkable at all. `SIG-S16-3` is handed here **by name** as a measurable gate | A `propagation_proof` row per copy class per request, conforming to `DR-C11-S16-3`'s nine fields | **Fewer than 6** distinct `copy_class` values with a complete proof at `t ≥ deadline_at` fires the signal; `deadline_at` = **30 days** (`A-S8-1`) makes it evaluable | S — `A-S8-1`, *"not observed, not calibrated, not a legal determination"*, owner SUB-8 | — | **SUB-9** (NEU-1003) for the design; the implementation charter for the store | `16_…:449`; `09_…:610`–`:612` (declared cardinality **6**) |

**Twenty-two gates.** Provenance: **fifteen `D`**, **three `S`**, **four `K`**. **Zero claim a
production observation.**

### 8.1 The gaps with no measurable control — the blocking findings

OUT-17's rule requires these to be named rather than accepted. **Two qualify**, and both are recorded
as blocking findings rather than as gates:

| Id | Gap | Attaches to | Why no measurable control exists | Owner |
| --- | --- | --- | --- | --- |
| **`F-S12-5`** | **A database-side execution path** — a trigger, a rule, a function-backed view, an FDW, or a logical-replication slot | **`X-3`** — the *enumeration's own boundary*, not an enumerated path. It is the one extension shape §2.3 names that no reading of this repository can close | A control requires something to measure, and **no observation of this repository at any cutoff can produce evidence either way.** The only measurement is a query against the production database, for which no credential exists. This is not a threshold that is merely unset — it is a gap whose control is structurally unavailable to this package | **The creator**, as sole operator, for the observation; escalates to **`NEU-896`**, since a second writer to the database is a program-level fact. Spike `SPK-S12-2` |
| **`F-S12-6`** | **The STDIO host's own application state** — a propagation instruction to an MCP host this package has never enumerated | **`TP-S12-51`** — an enumerated path | The action is an *instruction* to a peer, and the deployment has no channel to observe compliance. A threshold over an unobservable population is not a measurement | **`NEU-896`**, which converges the client surface. Carried within `F-S9-4` by SUB-9 and named here as a gate-less gap rather than re-filed as a copy finding |

**Two blocking findings, both with owners, neither accepted as a risk.** They are the honest output of
applying OUT-17's rule strictly: where a control could be constructed, §8 constructs it; where one
cannot, the gap is blocking rather than dressed as a gate with an unsettable threshold.

**The `Attaches to` column exists because the two are not the same kind of object, and collapsing
them would inflate the path count.** `F-S12-6` attaches to a path inside the enumeration.
**`F-S12-5` attaches to the enumeration's boundary** — it is the blocking finding that §2.3's
falsifier generates, and it is counted in §9 as a finding against the argument rather than as one of
the 52 paths. A model that quietly promoted it to a path would be claiming to have enumerated
something it explicitly cannot see.

---

## 9. The bidirectional cross-check

OUT-17 requires *"every gate traces to a threat and every critical threat traces to a gate, reported
as counts in both directions"*. Both directions are reported, and the counts are computed from §4,
§5 and §8 rather than asserted.

### 9.1 Direction 1 — gate → threat

| Measure | Count |
| --- | --- |
| Gates in §8 | **22** |
| Gates naming at least one `TP-S12-*` threat path | **22** |
| Gates naming no threat path | **0** |

Every gate's *"Gap it closes"* column names one or more paths. There is no gate in this register that
exists for its own sake.

### 9.2 Direction 2 — threat → gate

| Measure | Count |
| --- | --- |
| Threat paths enumerated (`TP-S12-1` … `TP-S12-52`) | **52** |
| Paths carrying an explicit invariant | **52** |
| **Paths carrying no invariant** | **0** — this is OUT-17's first acceptance scenario, and it is the count it asks for |
| Paths whose verdict is `held-by-design` (no gap, so no gate owed) | **17** |
| Paths whose verdict is `gap` or `out-of-reach` | **35** |
| … of which resolve to a `GATE-S12-*` in §8 | **31** |
| … of which resolve to a **registered upstream** risk, cited not re-raised | **2** — `TP-S12-31` (`R-S15-3`), `TP-S12-32` (`R-S6-2`) |
| … of which resolve to a **blocking finding** because no measurable control exists | **1** — `TP-S12-51` (`F-S12-6`) |
| … of which resolve to a **registered upstream open item**, cited not re-recorded | **1** — `TP-S12-43`, the backups path (`OI-S1-8`) |
| **Gap paths resolving to nothing** | **0** |

17 + 35 = 52, and 31 + 2 + 1 + 1 = 35. **Both directions close.**

**One finding is deliberately outside both counts.** `F-S12-5` — the database-side execution path —
attaches to `X-3`, the enumeration's own boundary, not to any of the 52 paths (§8.1). It is therefore
**not** counted as a gap path resolving to a blocking finding, because it is not a path. Counting it
as one would inflate the enumeration by an item the enumeration explicitly cannot see, which is the
precise move §2 exists to prevent. **Blocking findings total two; gap paths resolving to a blocking
finding total one.** The two numbers differ, and the difference is the point.

### 9.3 What the two zeros mean, and what they do not

Stated because C010's own record warns that a zero can be definitional rather than empirical, and
this chapter's zeros are exactly that in one direction and not the other.

- **"Zero paths carry no invariant" is empirical over the enumerated set** — it is a property of §4
  and §5, mechanically checkable by reading the Invariant column, and it would be falsified by a
  single blank cell.
- **It is definitional with respect to the set itself.** A path outside `IN-1`…`IN-8` has no
  invariant here and does not appear in the count. **The zero is therefore only as strong as §2's
  ingress argument**, which is why §2.3 lists the five shapes that would extend it rather than
  claiming closure. This is the same honesty C010 applies to its own two zeros
  (`../C010-system-and-repository-architecture/decision-records/DR-C10-S5-2_the-neu-893-split-contract.md:96`–`:99`),
  and it is stated here for the same reason.

---

## 10. The amendment routed to `DR-C10-S5-1`

### 10.1 Which trigger fires, and why this one

`DR-C10-S5-1`'s revision triggers include, verbatim:

> *"**A sixth failure mode is found that none of I1–I5 detects**, or two of the five turn out never
> to discriminate between any two categories in the domain. Either would mean the check set is wrong,
> not merely incomplete."*
> (`../C010-system-and-repository-architecture/decision-records/DR-C10-S5-1_isolation-invariant-as-a-decision-procedure.md:165`–`:167`)

**That trigger fires.** This chapter surfaces **two** failure modes the five ordered checks — `I1`
in-domain, `I2` principal attribution, `I3` confinement, `I4` transport invariance, `I5` principal
integrity — do not generate.

### 10.2 The two failure modes

**Amendment item 1 — cross-learner *actuation*, `F-S12-1`.**
A control input derived from an aggregate spanning every learner lets one learner change the controls
applied to another. Run the five checks against `SC-S3-*` for the classifier's blocking behaviour and
every one of them passes or is silent: the category is in domain (`I1`); the acting principal is
attributed (`I2`); no row of A's is read by B, so confinement is not breached (`I3`); the behaviour is
identical on both transports (`I4`); the principal's provenance is intact (`I5`). **The procedure
returns `holds`, and the failure is real.** The five checks range over *which rows a principal may
reach*. They have no limb for *shared derived state that mediates between principals*.

**Amendment item 2 — the verdict set is one-sided.**
The closed verdict set is six: `not-applicable`, `not-evaluable`, `fails-confinement`,
`fails-transport`, `fails-principal`, `holds`. **There is no verdict for confining too much.** A
category in which the predicate excludes every row from every principal — including the learner who
created them, which is precisely what `F-S5-10` and `R-S5-1` establish happens over the mixed
pre-cutover population — passes `I3` perfectly and reaches `holds`. SUB-5 named the phenomenon
(`05_…:624`–`:629`, *"data loss by predicate"*) and observed that *"a design that only checked for
over-exposure would score it as a success"*. **The procedure is that design.** This is not a defect
SUB-5 could route: SUB-5's remit was the enforcement point, and it correctly recorded *"no
contradiction with C010 was found, and no amendment is routed"* (`05_…:1284`–`:1285`) because nothing
in its own content contradicted the procedure. It takes a model that runs the procedure over paths,
rather than over one category, for the asymmetry to become visible.

### 10.3 The amendment record, in the form SUB-17 can consume

`DR-C11-S12-2` holds it in full. Its consumable summary:

| Field | Value |
| --- | --- |
| **Record amended** | `DR-C10-S5-1` — the isolation invariant as a decision procedure |
| **Trigger fired** | Revision trigger 3 — *"a sixth failure mode is found that none of I1–I5 detects"* (`:165`–`:167`) |
| **Fired by** | SUB-12 of C011 (NEU-1005), under OUT-17 |
| **Failure modes** | **(1)** cross-learner actuation via shared derived state (`F-S12-1`); **(2)** the verdict set admits no over-confinement outcome |
| **Proposed shape** | Not authored here. Item 1 suggests a sixth check between `I3` and `I4` — *does any control input to this category aggregate over more than one principal?* Item 2 suggests a seventh verdict, `fails-availability-to-owner`. **Both are suggestions to the record's owner, not decisions**; C010's procedure is consumed as given and this package may not rewrite it |
| **Routed to** | **`NEU-895`**, which owns `DR-C10-S5-1`; co-named **`NEU-896`** as the live recipient of C010's residual |
| **Recipient within this package** | **SUB-17** (NEU-1008), which holds the inherited-universe risk record and reports whether the amendment route fired |
| **Effect on C010's two zeros** | The *"on neither list"* zero in `DR-C10-S5-2` is **not** falsified — this is not a lost question about ownership. What is affected is `DR-C10-S5-2:96`–`:99`'s stated cost: *"if `DR-C10-S5-1`'s check set is missing a failure mode, this contract inherits the gap in exactly the same place."* **That cost has now been incurred, once, concretely.** The inherited-universe risk is no longer hypothetical |

**The last row is the one SUB-17 needs.** The charter's inherited-universe risk records that whether
the amendment route fires is to be reported (`01_charter.md:587`). **It fired.** SUB-17's acceptance
is to report that; this chapter's acceptance is only to have routed it in a consumable form, which
acceptance scenario 5 states explicitly.

### 10.4 What is *not* routed

Three things were checked against C010 and returned consistent; recorded so SUB-17's audit sees the
check ran rather than meeting silence.

| C010 item | Checked against | Result |
| --- | --- | --- |
| `DR-C10-S6-1` — `M-A`, the MCP core is the exclusive writing **tier** | §4.9's web-API paths; the API holds no credential and writes nothing | **Consistent.** No amendment |
| C010's `../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md` — the negative boundary | §4.9 consumes it and re-decides nothing; `TP-S12-46` names what it does not answer rather than answering it | **Consistent.** Naming an unanswered question is not a contradiction |
| C010's `F-S5-3` / `F-S8-1` — the 46 / 43 / 3 tool surface | §2.4 re-derived it at this cutoff and it holds; 3 prompts bring registered entry points to 49 | **Consistent.** No amendment |

**An addition is not a contradiction, and a naming collision is not one either.** `F-S12-1` *extends*
the failure-mode universe; it does not contradict a C010 decision, which is why it routes as an
amendment under trigger 3 rather than under the charter's contradiction clause.

---

## 11. Consistency with the numeric objectives, and the conflicts registered

Every `OBJ-*` this model touches was checked against SUB-15's chapter at this cutoff.

| Objective | This model's interaction | Result |
| --- | --- | --- |
| `OBJ-1` — ≤ 4 concurrent DB-bound calls; first break at the 2–200 learner band | No gate in §8 adds a round-trip. `GATE-S12-9`/`GATE-S12-10` would *remove* an aggregate query or narrow it; `GATE-S12-1`, `GATE-S12-6` are refusals, which are strictly cheaper than the admitted call | **Consistent.** No conflict registered |
| `OBJ-8` — availability, ≤ 13 s / 99.9%, ≤ 65 s / 99.5%, ≤ 131 s / 99% | Already in registered conflict as **`R-S6-2`** — the boot migration cannot be deferred, and batching converts one long breach into several short ones. `TP-S12-32` **cites** it | **Cited, not re-raised.** The charter's one-record rule applies |
| `OBJ-10` — audit loss ≤ 60 s per open window, **a lower bound** per `F-S16-2` | Every count-based gate in §8 therefore reads a lower bound. A dropped entry can **hide** a gate breach but cannot manufacture one, so a zero-tolerance threshold yields false negatives, never false positives | **Consistent, and load-bearing.** This is why every count threshold in §8 is zero-tolerance rather than a rate. `R-S16-3` is cited for the position |
| `OBJ-11` — ≤ 65 536-byte body cap | No gate reads `response_body` content, so truncation does not affect any threshold here | **Consistent.** Not re-derived |
| `OBJ-12` — exactly one concurrent boot migrator | `TP-S12-31` cites **`R-S15-3`** | **Cited, not re-raised**, per the brief this sub-task works under and the charter's one-record rule |
| **`F-S9-6`** — the 30-day retention window sits **five days below** the Tier-2 gate's own five-week (35-day) horizon | **This chapter cites it and it becomes materially sharper here.** §7 establishes that the five-week window is not merely a *reporting* input but a **control** input. So `F-S9-6` is not only "the gate under-reports" — it is "**the control's input is truncated by a retention policy nobody compared it against**." SUB-9 filed `F-S9-6` deliberately unresolved and it stays unresolved | **Cited, not re-raised**, and its consequence is extended in §11.1 |

### 11.1 One conflict this chapter does register: `R-S12-4`

`F-S9-6` records a conflict between two merged positions — SUB-8's 30-day window and the gate's
35-day query horizon. §7 adds a fact neither side had: **the horizon feeds a control, not a report.**

A 30-day window truncates the breaker's prior-week buckets to roughly four of the five weeks its
threshold arithmetic assumes. The breaker computes `mean + 2σ` over `priorWeeksCounts`
(`src/orchestration/tier2-circuit-breaker.ts:116`–`:127`) and explicitly skips a field when priors
are empty or all-zero (`:117`, `:123`). **Deleting the oldest bucket changes the mean, changes σ, and
therefore changes when — and whether — the breaker trips.** A retention policy set for
storage-limitation reasons silently retunes a production control.

This is registered as **`R-S12-4`**, severity medium, owner **`NEU-986`** (`SUB-12 of C010`) as owner
of the log-table caps, co-named **`NEU-896`**. **`F-S9-6` is not re-raised** — SUB-9 owns that
finding and filed it deliberately unresolved. What is new is the consequence, and a consequence of
another sub-task's finding is a risk of this one rather than a second copy of theirs.

---

## 12. Movement against `F-S5-4`

C010's census is the position this outcome's movement is measured against: **no state category
reaches `holds`**, and every in-domain category fails at `I4` before confinement is ever assessed,
because STDIO produces no authenticated principal
(`../C010-system-and-repository-architecture/02_findings-register.md:262`, `:265`). 45 categories,
zero `holds`.

**This chapter changes that number by nothing, and says so plainly.** It is a threat model, not a
mechanism. What it contributes to the movement is different and is stated in its own terms:

| Measure | Before this chapter | After |
| --- | --- | --- |
| State categories reaching `holds` on the deployment | 0 of 45 | **0 of 45** — unchanged, and no claim otherwise |
| Paths carrying an explicit invariant | **No path-level enumeration existed** | **52 of 52** |
| Operator paths modelled | **0** | **9**, none exempted |
| Critical gaps with a control, a threshold, an owner and an evidence source | 0 | **22** |
| Gaps with no measurable control, named as blocking findings with owners | (not asked) | **2** |
| Failure modes routed as amendments to `DR-C10-S5-1` | **0** across eleven chapters | **1 record, 2 items** |

**The honest headline is the last row and not the third.** Eleven chapters each recorded *"no
amendment routed"*. That was correct for each of them, and it is the kind of unbroken run that starts
to read as evidence the check does not fire. It fires here.

---

## 13. Source-change confirmation

**No file under `src/` or `drizzle/` is modified by this sub-task.** `git diff --name-only
origin/develop` lists paths only under
`docs/research/C011-safe-production-integration-and-learner-isolation/` and `docs/GLOSSARY.md`.
Every code reference in this chapter is a **read** at cutoff `57aeba3`. No test file is created or
modified.

### 13.1 The `42` disclosure, and a false certification this chapter caught in its own draft

**`42` does not appear as a codebase fact anywhere in this chapter.** The superseded miscount is
referred to by description only, never by numeral, and the arithmetic `46 − 3 = 43` is *not* how the
43 is obtained — it comes from the 13-row registration mapping at `src/server/tools.ts:17`–`:31`, per
`F-S8-1`'s diagnosis. The two happen to agree.

**But six citations in this sub-task's output do resolve to a line 42, and an earlier draft of this
very paragraph certified that none did.** That draft sentence read *"no citation in this chapter
resolves to a line 42"*. It was false. Extracting every `:NN` token mechanically — rather than
asserting it, which is exactly how the previous four false certifications were produced — returns six
occurrences:

| Where | Citation |
| --- | --- |
| §4.6 `TP-S12-28`; §7.1 item 1; §8 `GATE-S12-9` (twice, in the threshold and evidence columns) | `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`–`:42` |
| `decision-records/DR-C11-S12-2_the-unconfined-aggregate-as-a-control-input.md:42` | the same range |
| `traceability/S12_threat-model-and-gates.md:23` | the same range |

**All six are the same citation**, and it is the one this chapter's headline finding rests on: the
Tier-2 aggregate query, whose `WHERE` clause runs from line 39 to line 42. **The line number is
benign** — a range that happens to end at 42 is not a tool-surface assertion, and the charter's rule
requires it to be disclosed rather than avoided. It is disclosed here.

**The reason this is published rather than quietly fixed** is that it is the package's most common
defect class occurring in the one paragraph written to guard against it. The check that caught it was
mechanical; the sentence it replaced was an assertion. That is the whole difference, and §2.4 records
the same lesson from the other direction.

### 13.2 The `…md` citation shorthand, counted rather than characterised

The shorthand form `05_…md` is **invisible to `scripts/check-citation-paths.ts`** — such refs are
silently exempt, so a `0 non-resolving` result over a file full of them is true but is **not
evidence**. A predecessor carried 23 of them, each of which had to be resolved by a separate
verifier.

**This chapter contains 46 abbreviated references**, counted mechanically rather than described as
"a few": 3 × `04_…`, 28 × `05_…`, 2 × `08_…`, 5 × `09_…`, 3 × `11_…`, 5 × `16_…`. That is a real
number and it is stated rather than glossed.

Two things make them safe, and both are checkable:

1. **Every one of the six abbreviated prefixes is also cited at least once in full, in this same
   file** — verified by grep, one full-filename form per prefix. An abbreviation whose expansion
   appears nowhere would be the genuine hazard; none here is.
2. **Every *cross-package* citation is written in full**, with its `../C010-…/` prefix. These are the
   refs the checker actually resolves, and they are what makes this chapter's `0 non-resolving`
   result load-bearing rather than vacuous. Four of them were wrong in the first commit — bare
   `11_web-api-scope-and-resource-inventory.md` refs, class `C3-bare-upstream` — and were found by
   running the checker against a temporarily-gated C011 rather than by reading. C011's baseline was
   **0**, so all four were introduced by this sub-task and all four are fixed.

**The `11_…` abbreviation is the one that could still mislead**, because both packages have a
chapter `11_`. Every occurrence of it above is either written `C010's 11_…` or is the sentence in §1
that defines the rule.

---

## 14. Ids allocated by this sub-task

| Register | Ids |
| --- | --- |
| Outcomes (`90_outcome-register.md`) | OUT-17's row |
| Findings (`91_findings-register.md`) | `F-S12-1` … `F-S12-7` |
| Risks (`92_risk-register.md`) | `R-S12-1` … `R-S12-4`. **No charter `R<n>` row** — see below |
| Open items (`93_open-items-and-provisional-register.md`) | `OI-S12-1` |
| Caps (`94_caps-and-incomplete-scope.md`) | `CAP-S12-1` |
| Stand-ins (`95_stand-in-assumption-register.md`) | `A-S12-1` |
| Spikes (`96_spike-register.md`) | `SPK-S12-1` … `SPK-S12-6` |
| Completeness gate (`97_package-completeness-gate.md`) | `G-S12-1` … `G-S12-12` |
| Decision records | `DR-C11-S12-1`, `DR-C11-S12-2`, `DR-C11-S12-3` |
| Chapter content | `TP-S12-1` … `TP-S12-52`; `GATE-S12-1` … `GATE-S12-22`; `IN-1` … `IN-8`; `X-1` … `X-5` |
| Document numbers | `12_` only |

**No charter `R<n>` entry is authored here, and that is a computed result rather than an omission.**
All fifteen rows of the charter's § Risks table were read at `01_charter.md:581`–`:597` and their
owning-outcome column checked: OUT-8, OUT-12, OUT-3, OUT-4, OUT-20, OUT-20, OUT-20, OUT-18, OUT-2,
OUT-9, OUT-16, OUT-9, OUT-18, OUT-18, OUT-20. **OUT-17 appears zero times**, which is charter
assumption 48. The inherited-universe risk is **not** this sub-task's: the charter owns that row to
OUT-20 and SUB-17 authors it; this chapter supplies only the amendment record it consumes.

**Two id families are introduced by this chapter** and are recorded in `docs/GLOSSARY.md` in the same
change: **`TP-S12-*`** for threat paths and **`GATE-S12-*`** for measurable production gates. The
second exists because `G-S12-*` is already the package-completeness-gate family in the `90`–`97`
band; a measurable production gate and a package-completeness-gate row are different objects, and
reusing one prefix for both would make the cross-check in §9 unreadable.

**Namespace note, and it is a real collision this time.** **C010 has its own sub-task 12**
(`NEU-986`), and it already owns `F-S12-1` … `F-S12-4`, `CAP-S12-1` … `CAP-S12-5`, `OI-S12-1` and the
decision records `DR-C10-S12-1` / `DR-C10-S12-2`. So `F-S12-1` and `CAP-S12-1` exist in **both**
packages, denoting different things. The package rule applies unchanged and is the same one SUB-9
restated for `-S9-` and SUB-5 for `-S5-`: **a bare `-S12-` id in this package is C011's own; C010's
is always cited with its full package path and line.** Every C010 reference in this chapter is
written that way. No id is renumbered to avoid the clash — renumbering would break the rule that an
id is computed from the charter alone.

**The collision is sharper here than for `-S5-` or `-S9-` in one specific way**, and it is worth a
sentence because a reader could be misled: `NEU-986` — C010's SUB-12 — is also the **named owner** of
`CAP-S3-3` and `CAP-S4-1`, which this chapter routes `GATE-S12-9` and `GATE-S12-18` to. So the string
`SUB-12` appears in this chapter both as *this sub-task* and as *the owner of a cap it hands work to*.
Every occurrence of the second is written `SUB-12 of C010` or `NEU-986`.

---

## 15. What this chapter does not establish

1. **Nothing about production.** No threshold here is a measurement. Zero production credentials
   exist, zero spikes have executed package-wide, and `observed-in-production` is used zero times.
   `CAP-S1-1` caps this for the package; **`CAP-S12-1`** records the threat-model-specific form.
2. **That any gate is implemented.** All 22 are specifications. Nothing in §8 runs, and the four `K`
   spikes are recorded `not executed`.
3. **That the ingress set is closed in fact.** §2.3 names five shapes that would extend it, and
   `X-3` — a database-side execution path — is structurally unobservable from this repository at any
   cutoff. **That is `F-S12-5`, a blocking finding, not a caveat.**
4. **That `F-S12-1` has ever occurred.** The chain in §7.2 is derived from four code facts. Whether
   any field has ever tripped in production is unobserved (`SPK-S12-3`, not executed), and no claim
   is made that it has.
5. **That the operator has ever done any of the nine things in §5.** The section models a path, not
   an event. Every row is a statement about what the deployment permits, read off the code and the
   platform facts.
6. **A design for any gate's mechanism.** §8 states control, threshold, owner and evidence source.
   How the control is built is the implementation charter's, and where a mechanism would be
   schema-shaped the owner column names SUB-13.
7. **That C010's procedure should be changed in the way §10.3 suggests.** The amendment routes a
   *finding* and offers a *suggestion*. `NEU-895` owns `DR-C10-S5-1` and this package may not rewrite
   it.
8. **No QA pass.** The `qa-execution` surface is unconfigured, so the automated QA phase is a genuine
   Core Article 8 no-op. **This chapter cites `F-S11-5` for that position, not `CAP-S1-3`:** SUB-11
   established that `CAP-S1-3` is referenced package-wide but **has no register entry at all**
   (`94_caps-and-incomplete-scope.md:271`–`:281`), and citing a phantom id would be exactly the kind
   of unchecked inheritance this chapter is about. The no-op is real; the cap id for it is not, yet.

---

## What this chapter hands forward

| Id | What it is | Who consumes it |
| --- | --- | --- |
| `TP-S12-1` … `TP-S12-52` | The path-by-path invariant matrix — 52 paths, 52 invariants, zero blanks | **SUB-13** (NEU-1006), which builds the DDL and runbook each gap implies; **SUB-14** (NEU-1007) aggregation; **SUB-17** (NEU-1008) audit; the implementation charter |
| `GATE-S12-1` … `GATE-S12-22` | The gate register — control, threshold, owner, evidence source and transport per critical gap | **`NEU-896`** as the convergence gate that authorizes implementation; **SUB-7** (NEU-1001) and **SUB-13** as named owners of eleven of them |
| **`F-S12-1`** | **The unconfined aggregate consumed as a control input** — a cross-learner actuation channel that survives the entire C011 mechanism | **`NEU-896`**; **`NEU-895`** via the amendment; **`NEU-986`** as owner of the log-table caps |
| `F-S12-2` | The composition of the fail-open binding with the map that empties on every restart | **SUB-7** (NEU-1001) under OUT-3 |
| `F-S12-3` | The search **query** as a fourth learner-content egress, distinct from the corpus | **SUB-8** (NEU-1002) under OUT-11; the owner of `OI-S3-1` |
| `F-S12-4` | `TRUNCATE … CASCADE` behind a caller-asserted, memoization-sensitive guard | **The creator**, as sole operator; the implementation charter |
| **`F-S12-5`, `F-S12-6`** | The two gaps with **no measurable control**, named as blocking findings with owners | **`NEU-896`**; **SUB-17** (NEU-1008), which audits that blocking findings were not quietly accepted |
| `F-S12-7` | A package-hygiene defect observed in passing: `docs/GLOSSARY.md`'s `write-path closure` row carries the *"four greps"* phrasing its own defining chapter explicitly repudiates. **Reported, not fixed** — the row is another sub-task's | **SUB-14** (NEU-1007) under OUT-20, the only party permitted to touch another sub-task's file; co-named **SUB-9** (NEU-1003) as the row's author |
| `DR-C11-S12-2` | **The amendment to `DR-C10-S5-1`** — trigger 3, two failure modes, in the form the inherited-universe risk record consumes | **`NEU-895`** (owner of the record), co-named **`NEU-896`**; **SUB-17** (NEU-1008) as the named recipient within this package |
| `R-S12-1` … `R-S12-4` | Residual exposures with severity, mitigation, owner and escalation route | **SUB-14** (aggregation, authors none); **SUB-17** (gate) |
| §9's two counts | The bidirectional cross-check, both directions closing | **SUB-17**; **SUB-14** |
| OUT-17's outcome-register row | The outcome, its resolving evidence and its **authored success measure** | **SUB-14** (NEU-1007), which aggregates and authors none |

**The direction is forward-only.** This chapter publishes these ids; whether SUB-13, SUB-14 or SUB-17
in fact cites them is each of their own acceptances, at positions 14, 15 and 16.
