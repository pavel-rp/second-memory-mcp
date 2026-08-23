# System Context and Responsibility Boundaries

**Sub-task:** SUB-4 (NEU-974) · **Covers:** `OUT-1`, and `OUT-9`'s placement half (the drift-verdict component)
**Written:** 2026-08-21 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `91aa398`
**Consumes:** `00_method-and-provenance.md`, `01_outcome-register.md`, `02_findings-register.md`,
`03_execution-environment-and-citation-drift-component.md`, `04_state-category-inventory.md`,
`93_stand-in-assumption-register.md`, and `docs/research/C005-product-foundation/benchmark-suite/`.
**Decision records:** `DR-C10-S4-1`, `DR-C10-S4-2`, `DR-C10-S4-3` · **Traceability:** `traceability/S4_component-and-boundary-coverage.md`

---

## 0. What this document is

One picture of the system at exactly one altitude: **the altitude where a boundary, an authority or a
compatibility contract is at stake.** It names every component once, gives each a single responsibility
statement and an owner, classifies every interacting pair as a **trust** boundary, a **process** boundary
or **neither**, and states for every flow what crosses it, in which direction, and which side is
authoritative for what crosses.

It is the answer to the program's Critical risk: two implementation charters each assuming their slice
owns the same hop. After this document, a hop that two charters both claim is a contradiction against a
published table rather than a production incident.

**It decides no implementation.** Section 12 lists, by name and owner, everything it deliberately does
not decide.

### 0.1 How to read it

| If you are… | Read |
| --- | --- |
| An implementation charter locating your slice | §3 (find your component), then §4 (find the boundaries it owns) |
| Asking who is authoritative for a hop | §5 (flow table), then §10 (the same hops walked end to end) |
| Building anything learner-facing | §6 (the trust split) and §6.3 (what is handed to SUB-15) |
| Building anything on the content path | §7 (thin serve path, thick authoring path) |
| Asking where a state category lives | §8, then SUB-13 (NEU-977) for its authority |
| Auditing this document | §11 (counts), §13 (verification record) |

---

## 1. Vocabulary and document-local ids

### 1.1 The three ambiguous words

`00_method-and-provenance.md` §4 fixes three words this document uses constantly. They are **never**
used bare here:

- **MCP session** — the Streamable-HTTP transport session identified by the `mcp-session-id` header
  (`src/transport/http.ts:43`). **Web session** — the browser-held authenticated session that does not
  exist today (`SC-S3-43`, `assumed` under `A-27`). **Learning session** — a `learning_sessions` row.
- **Database schema** — a Postgres namespace (`public`, `infrastructure`). **Zod schema** — a tool
  input/output validator. **Cognitive schema** — the pedagogical construct.
- **JWT subject** — the authenticated principal resolved at `src/transport/jwt-middleware.ts:127`.
  Never "subject" bare.

### 1.2 Document-local ids

This document mints three id sets — `CMP-S4-<k>` (components), `BND-S4-<k>` (boundaries),
`FL-S4-<k>` (flows). Following SUB-3's precedent with `SC-S3-<k>`, **these are document-local entry
ids, not new shared-register families.** The package's five register families
(`A-`, `OI-S<n>-<k>`, `CAP-S<n>-<k>`, `SPK-S<n>-<k>`, `F-S<n>-<k>`) are unchanged, and there is still no
global counter anywhere in this package. A downstream sub-task cites `CMP-S4-14` the way it cites
`SC-S3-37`: owner-attached, resolving into this document.

### 1.3 Evidence labels

Per `00_method-and-provenance.md` §1.2: **`confirmed`** — verified against `src/` or `drizzle/` at this
document's cutoff, with the citation in the row. **`consumed`** — taken from a merged sibling sub-task or
an upstream package without re-derivation here. **`[unconfirmed]`** — exists in this model only because a
stand-in assumption predicts it; it carries that assumption's id in the sentence, not in a footnote.

---

## 2. What makes something a component here

**The individuation rule (short form):** something is a component in this model when it has (a) one
responsibility that no other component holds, **and** (b) at least one boundary it owns — a boundary it
must still enforce correctly when the other side misbehaves. Anything failing (b) is a module, not a
component, and does not appear.

The rule and its rejected alternatives are `DR-C10-S4-1`. Two consequences worth stating up front:

- **The hexagonal layering in `src/` is followed, not re-cut.** `transport` → `server` → `orchestration`
  → `domain`, with `ports/` (13 interfaces) and `adapters/` (`drizzle`, `langchain`), already
  individuates most of the existing system along responsibility lines. Re-cutting it would produce a
  model that no downstream charter could map onto the code it edits.
- **The two transport modes are two components, not one.** `src/transport/main.ts:46` mounts the
  protected HTTP path; the `else` branch at `:55`–`:59` connects a bare `StdioServerTransport` with no
  auth, no origin check, no rate limiting and no audit middleware. They own different boundaries, so
  under the rule they are different components. **Every protection claim in this document names the
  transport it holds for.**

---

## 3. Component inventory

### 3.1 Zones

| Zone | Meaning | Components |
| --- | --- | --- |
| **Z-EXT** | Outside the operator's control | `CMP-S4-1`, `CMP-S4-2`, `CMP-S4-11`, `CMP-S4-12` |
| **Z-IDP** | Operated for the operator, trusted only for signed assertions | `CMP-S4-10` |
| **Z-WEB** | The operator's web tier | `CMP-S4-3` |
| **Z-CORE** | The operator's MCP core | `CMP-S4-4` … `CMP-S4-9` |
| **Z-CONT** | The operator's content-orchestration path | `CMP-S4-13` … `CMP-S4-19` |
| **Z-MEAS** | The operator's measurement path | `CMP-S4-20` |

"Owner" below is the **party accountable for the component's responsibility statement**, not a person
and not a downstream sub-task.

### 3.2 The inventory

| Id | Component | Owner | Responsibility (one statement) | Demanded by | Evidence |
| --- | --- | --- | --- | --- | --- |
| `CMP-S4-1` | **Learner browser** | Learner's device | Renders the learner-facing surface and holds web-session and UI interaction state that is **never** gate-bearing. | `A-27`; `SC-S3-43`; `OUT-1`'s browser-trust property | `[unconfirmed]` — `A-27` |
| `CMP-S4-2` | **External MCP client** | Third party | Consumes a bounded, expiring, revocable handoff envelope and calls the operator's gated tool surface under its own authorization. | `A-29`; `SC-S3-44` | `[unconfirmed]` — `A-29` |
| `CMP-S4-3` | **Web tier** | Operator | Terminates the learner's **web session**, serves the learner-facing surface, and calls the MCP core; holds no gate authority of its own. | `A-27` | `[unconfirmed]` — `A-27` |
| `CMP-S4-4` | **HTTP transport edge** | Operator | Admits or rejects a request at the network edge — origin allowlist, JWT verification, per-JWT-subject rate limiting, MCP-session-to-subject binding, context-token gate, correlation id, audit capture — before any tool handler runs. | `src/transport/main.ts:46`; `http.ts:99`–`:111`, `:48`–`:65`, `:167`–`:170` | `confirmed` |
| `CMP-S4-5` | **STDIO transport edge** | Operator | Connects a local MCP client directly to the tool surface with **no** auth, origin check, rate limit or audit middleware mounted. | `src/transport/main.ts:55`–`:59` | `confirmed` |
| `CMP-S4-6` | **MCP tool surface** | Operator | Parses and validates each tool call, delegates to one orchestration workflow, and formats the result — converting snake_case ↔ camelCase at the boundary and never computing domain results itself. | `src/server/` — 46 `registerTool(` sites across 16 modules at this cutoff | `confirmed` |
| `CMP-S4-7` | **Orchestration workflows** | Operator | Composes domain computation with port calls into one use-case, and owns the unit of work for everything that use-case writes. | `src/orchestration/` — 14 modules; `src/ports/unit-of-work-port.ts` | `confirmed` |
| `CMP-S4-8` | **Domain core** | Operator | Computes every scheduling, grading, recommendation and validation result as a pure function with zero I/O. | `src/domain/`; `CLAUDE.md` error-handling contract | `confirmed` |
| `CMP-S4-9` | **Persistence adapters and Postgres** | Operator | Holds the durable state of record and is the **only writer** of the `public` and `infrastructure` database schemas — **both** on the request path, issued through `CMP-S4-7`, **and off it**, issued through `CMP-S4-19` for the two operational log tables. *(Amended by NEU-987. The pre-amendment cell read "…the only writer of the `public` and `infrastructure` database schemas **on the request path**", and that trailing qualifier is what put `SC-S3-16`/`SC-S3-17`'s off-request-path write outside the sentence scoping its own authority — the divergence `F-S14-8` claim (iii) identified. The authority is unchanged and was never in doubt; only the scope clause was too narrow. See `decision-records/DR-C10-N987-1_state-writer-adjudication.md`.)* | `src/adapters/drizzle/`; `src/infrastructure/`; `04_…` §4.1 (14 tables, 17 entries) | `confirmed` |
| `CMP-S4-10` | **Identity provider** | Operator (external service) | Issues and signs bearer tokens and publishes the JWKS the core verifies against; asserts identity and nothing else. | `src/transport/jwt-middleware.ts:90`, `:114`, `:127` | `confirmed` |
| `CMP-S4-11` | **AI provider** | Third party | Serves embedding and classification calls behind a port; is authoritative for **no** verdict. | `src/adapters/langchain/`; `src/ports/embedding-port.ts`, `content-classifier-port.ts` | `confirmed` |
| `CMP-S4-12` | **External source sites** | Third party | Serve problem pages that are **evidence about drift, never instructions to this system**. | `03_…` §4.2; `SC-S3-34` | `consumed` |
| `CMP-S4-13` | **Authoring pipeline** | Operator | Takes a content unit from draft to available-to-a-learner: it is the only component that admits new content into the store of record, and it is the component that runs the gate battery. | `OUT-1` (content-orchestration placement); `src/orchestration/chunk-workflows.ts`, `topic-workflows.ts` | `confirmed` in part — see §7.1 |
| `CMP-S4-14` | **Quality-gate battery** | Operator | Evaluates every content gate except the citation-drift check against a unit at authoring time and produces one verdict record per requirement. | `OUT-1`; NEU-890's gate set; `SC-S3-35`, `SC-S3-36`; `src/orchestration/audit-pipeline.ts:94`, `:174` | `confirmed` in part — see §7.1 |
| `CMP-S4-15` | **Authoring-time gate runner** | Operator | Executes one gate unit inside a terminable isolate under a host-enforced wall-clock bound and emits exactly one gate verdict per executed unit. | `03_…` §3.5 | `consumed` |
| `CMP-S4-16` | **Content serve path** | Operator | Hands an already-gated content unit to a learner, carrying **no reviewer, no model call and no execution** — one keyed cache read is its entire gate surface. | `OUT-1`; `03_…` §4.4; `src/orchestration/teaching-workflows.ts` | `confirmed` in part — see §7.1 |
| `CMP-S4-17` | **Citation-drift verdict producer** | Operator | Makes exactly one sanctioned request per citation, out of band, and writes exactly one verdict tuple; the **only** component in this system with egress to a party outside the operator's control. | `OUT-9`; `03_…` §4.2; `SC-S3-34` | `consumed` |
| `CMP-S4-18` | **Drift-verdict cache** | Operator | Answers a keyed read on the learner's latency path with a dated verdict, and **never** derives, refreshes or ages one. | `OUT-9`; `03_…` §4.3; `SC-S3-33` | `consumed` |
| `CMP-S4-19` | **Operational logging sinks** | Operator | Buffer and batch-insert request and event log lines into `infrastructure.mcp_request_log` and `infrastructure.operation_event_log` from transport worker threads. **This is the *issuing write path* for `SC-S3-16`/`SC-S3-17`, not their authority:** a `W` annotation on `CMP-S4-9`'s authority and **never a second writer**. *(Clarified by NEU-987, adopting `10_…md` §6.2's ruling — "the deviation is in the write path, never in the authority" — into `05_…md` itself. See `decision-records/DR-C10-N987-1_state-writer-adjudication.md`.)* | `src/transport/audit-middleware.ts`, `pg-audit-transport.ts:117`, `pg-event-transport.ts:109`; `SC-S3-16`, `SC-S3-17`, `SC-S3-25` | `confirmed` |
| `CMP-S4-20` | **Operational-log derived-extract producer** | Operator | Derives the minimized, allowlisted, payload-free `PLA-*` aggregate that every log-derived claim must go through, under a named measurement contract version. | `SC-S3-41`; `SC-S3-40`; NEU-887's operational-log privacy gate | `[unconfirmed]` — required by `SC-S3-41`, no implementation exists |

**20 components. 20 carry a demanding requirement in the row.** No component appears that no requirement
demands; §11 reports that direction as a count.

### 3.3 The four components whose responsibility statement is the whole point

`CMP-S4-15`, `CMP-S4-17` and `CMP-S4-18` are SUB-2's three components, placed here with their **egress**
and **isolation** boundaries made explicit (SUB-2 specified the components; placing them is this
sub-task's job — `03_…` §7 row 1). `CMP-S4-14` is where they attach.

| Component | Egress | Isolation | Placed at |
| --- | --- | --- | --- |
| `CMP-S4-15` **authoring-time gate runner** | **None.** It is first-party, creator-authored code; the isolate exists for **liveness, not containment**. | Terminable isolate under a host-enforced wall-clock bound — `BND-S4-9`, a **process** boundary and explicitly **not** a trust boundary. | Subordinate to `CMP-S4-14`, on the authoring path only. Never on the serve path. |
| `CMP-S4-17` **citation-drift verdict producer** | **Yes, and uniquely.** Exactly one request per citation to `CMP-S4-12`; corpus walk prohibited; 90-day staleness window; per-source revalidation budget 0 — `BND-S4-3`, a **trust** boundary. | Out of band by specification: never on a learner request's critical path. | Off both the serve path and the request path. Writes `SC-S3-34`. |
| `CMP-S4-18` **drift-verdict cache** | **None.** Internal, keyed read only. | Same trust zone as `CMP-S4-16`; the read is `BND-S4-11`, **neither** a trust nor a process boundary. | On the learner's latency path, read by `CMP-S4-16`. Holds `SC-S3-33`. |

The three are **three components, not one or two.** `03_…`'s `F-S2-2` hands this sub-task the specific
obligation not to merge them: the two-row gate runner and the four-row egress producer have contradictory
egress fields, and `SC-S3-33`/`SC-S3-34`/`SC-S3-35` are three state categories written by three different
components (`04_…` §9). They stay separate here.

---

## 4. Boundary classification

### 4.1 The classification rule

`DR-C10-S4-2` carries the decision. The rule in one line each:

- A pair is a **trust boundary** when one side must remain correct **while assuming the other side is
  hostile or compromised** — the two sides are under different control, or under the same control but
  reachable by a different principal.
- A pair is a **process boundary** when the two sides are under the **same** control and mutually trusted,
  but a call between them can fail, be delayed, or be lost independently of the caller — so the caller
  must handle absence.
- A pair is **neither** when it is an in-process call between mutually trusted code under one control,
  whose failure mode is the caller's own failure mode.

**Boundary ownership** follows from the trust rule: **the boundary is owned by the side that must still
be correct when the other side misbehaves.** That is always the server side of a trust boundary, and it is
why no boundary in this model is owned by `CMP-S4-1`, `CMP-S4-2`, `CMP-S4-11` or `CMP-S4-12`.

### 4.2 The matrix

| Id | Pair | Class | Owner | Holds for transport | Why | Forced by |
| --- | --- | --- | --- | --- | --- | --- |
| `BND-S4-1` | `CMP-S4-1` ↔ `CMP-S4-3` | **trust** | `CMP-S4-3` | n/a (web tier) | The browser is under the learner's control; any value it returns is an assertion, not a fact. | `OUT-1`; `A-27` (`SC-S3-43` is explicitly not gate-bearing) |
| `BND-S4-2` | `CMP-S4-3` ↔ `CMP-S4-4` | **trust** | `CMP-S4-4` | **HTTP only** | The web tier is reachable by anything that can reach the port; the core re-verifies the JWT itself rather than trusting a web-tier assertion. | `src/transport/jwt-middleware.ts:114`; `http.ts:99`–`:111` |
| `BND-S4-3` | `CMP-S4-17` ↔ `CMP-S4-12` | **trust** | `CMP-S4-17` | n/a (out of band) | A fetched page is evidence about drift; the site is authoritative for its own content and for nothing in this system. | `03_…` §4.2, §5 (three inherited egress constraints) |
| `BND-S4-4` | `CMP-S4-7`/`CMP-S4-14` ↔ `CMP-S4-11` | **trust** | `CMP-S4-7` on the request path; `CMP-S4-14` on the authoring path — **the caller owns its own half** (§5 `FL-S4-10`, §7.1) | both | The provider is a third party on the network; its output is an input to a decision, never the decision. | `src/adapters/langchain/`; `src/orchestration/audit-pipeline.ts:165`–`:191` (fail-open breaker) |
| `BND-S4-5` | `CMP-S4-4` ↔ `CMP-S4-2` | **trust** | `CMP-S4-4` | **HTTP only** | The handoff envelope crosses to a client the operator does not run; it is bounded, expiring and revocable **by `A-29`**, and confers no write authority over any state category. | `A-29`; `SC-S3-44` |
| `BND-S4-6` | `CMP-S4-4` ↔ `CMP-S4-10` | **trust** | `CMP-S4-4` | **HTTP only** | The core trusts a **signature verified against a fetched JWKS under an issuer allowlist** — not the token's contents as presented. | `src/transport/jwt-middleware.ts:90`, `:114` |
| `BND-S4-7` | `CMP-S4-4` ↔ `CMP-S4-6` | **neither** | — | both | In-process middleware chain into in-process handlers. | `src/transport/create-server.ts`; `src/server/` |
| `BND-S4-8` | `CMP-S4-6` ↔ `CMP-S4-7` ↔ `CMP-S4-8` | **neither** | — | both | In-process layering; the domain has zero I/O, so it has no independent failure mode. | `src/domain/` purity contract |
| `BND-S4-9` | `CMP-S4-14` ↔ `CMP-S4-15` | **process** | `CMP-S4-14` | n/a (authoring) | A terminable isolate under a wall-clock bound can be killed mid-gate, so the battery must handle a missing verdict — but both sides are first-party creator-authored code, so this is **liveness, not containment**. | `03_…` §3.5 |
| `BND-S4-10` | `CMP-S4-17` ↔ `CMP-S4-18` | **process** | `CMP-S4-18` | n/a (out of band) | The producer is out-of-band by specification, so the write is asynchronous with respect to every read; the cache must therefore be correct when no write has arrived. Whether it is also a separate OS process is `OI-S2-1`'s to settle and does not change this classification. | `03_…` §4.3; `OI-S2-1` |
| `BND-S4-11` | `CMP-S4-16` ↔ `CMP-S4-18` | **neither** | — | both | Keyed read, same trust zone, same latency path; a miss is not a failure but a defined verdict-absent outcome (§7.3). | `03_…` §4.3, §4.4 |
| `BND-S4-12` | `CMP-S4-7` ↔ `CMP-S4-9` | **process** | `CMP-S4-7` | both | A separate database process over a connection that can fail or time out; the workflow owns the unit of work and therefore owns the rollback. | `src/ports/unit-of-work-port.ts`; `src/adapters/drizzle/` |
| `BND-S4-13` | `CMP-S4-4` ↔ `CMP-S4-19` | **process** | `CMP-S4-19` | **HTTP only** for the request log; both for the event log | The sinks run in transport worker threads with their own buffers and per-sink circuit breakers, and **drop entries outright while a breaker is open** — so log delivery is not guaranteed and the request path must not depend on it. | `src/transport/pg-audit-transport.ts:45`–`:52`; `pg-event-transport.ts:41`–`:48`; `SC-S3-25` |
| `BND-S4-14` | `CMP-S4-20` ↔ `CMP-S4-9` | **process** | `CMP-S4-20` | n/a (measurement) | A batch read against the log tables, off every request path. | `SC-S3-41` |
| `BND-S4-15` | `CMP-S4-13` ↔ `CMP-S4-14` | **process** | `CMP-S4-13` | n/a (authoring) | Today the Tier-2 pass is explicitly **post-commit** (`runTier2AuditPostCommit`), so the unit is already written when part of the battery's verdict arrives; the pipeline must handle a verdict that lands after the write. | `src/orchestration/audit-pipeline.ts:174` |
| `BND-S4-16` | `CMP-S4-3` ↔ `CMP-S4-9` | **undecided — see §4.4** | would be `CMP-S4-9`'s database schema | n/a | Whether this edge exists at all is the all-MCP-versus-hybrid ownership selection, which is SUB-6's (NEU-976). This model states the constraint it must satisfy, not the choice. | `OUT-3`; out-of-scope line of this sub-task |
| `BND-S4-17` | `CMP-S4-5` ↔ `CMP-S4-6` | **trust — unenforced** | nobody | **STDIO only** | A local MCP client reaches the tool surface through a transport that mounts no auth, no origin check, no rate limit and no context-token gate. The pair meets the trust-boundary test — the client is under a different principal's control — and **no component enforces it**. Recorded, not narrated past. | `src/transport/main.ts:55`–`:59`; `context-token-middleware.ts` mounted only on the HTTP path |

**17 boundaries. 17 cite a forcing upstream requirement or codebase fact.** §11 reports it as a count.

### 4.3 Completeness of the pair set

The matrix covers every pair that **interacts**, not every pair in the 20 × 20 grid. The completeness
argument is structural: each component's responsibility statement names the components it calls or is
called by, and every such adjacency appears above exactly once. Pairs absent from the matrix are absent
because **no flow in §5 crosses them** — for example `CMP-S4-1` never touches `CMP-S4-9`, `CMP-S4-11`
never touches `CMP-S4-16`, and `CMP-S4-12` is reachable only from `CMP-S4-17`. A downstream sub-task that
introduces a flow between two components not paired here is introducing a boundary this model did not
classify, and owes it a row.

### 4.4 `BND-S4-16` — the one boundary this model deliberately leaves undecided

Whether the web tier reaches Postgres directly is the ownership-model selection, and it belongs to SUB-6
(NEU-976). What this model fixes, whichever way SUB-6 decides:

1. **If the edge does not exist**, `CMP-S4-3` holds no durable learning state and every learning-state
   write goes through `CMP-S4-4` → `CMP-S4-7`. `BND-S4-2` then carries the entire authority contract.
2. **If the edge does exist**, its classification is already settled: **process, not trust** — same
   operator, same trust zone. But it creates a second writer to a database schema `CMP-S4-7` writes
   today, and `OUT-3`'s exactly-one-authority-per-category audit then fails **unless the categories the
   web tier writes are disjoint from those the MCP core writes.** Disjointness is the condition SUB-6
   must demonstrate, not assume.
3. **Either way**, `BND-S4-1` is unchanged: the browser is on the far side of a trust boundary from
   whichever component turns out to be authoritative.

---

## 5. Flows — what crosses, in which direction, under whose authority

"Authoritative side" means: **if the two sides disagree about this value, whose value is the fact.**

| Id | What crosses | From → To | Boundary | Authoritative side |
| --- | --- | --- | --- | --- |
| `FL-S4-1` | Learner interaction events (answers, navigation, ratings) | `CMP-S4-1` → `CMP-S4-3` | `BND-S4-1` | **`CMP-S4-3`.** The browser reports; it never decides. |
| `FL-S4-2` | Learner-facing content and derived state for display | `CMP-S4-3` → `CMP-S4-1` | `BND-S4-1` | **`CMP-S4-3`.** A browser-side copy is a cache, never an authority. |
| `FL-S4-3` | Bearer token asserting the JWT subject | `CMP-S4-1` → `CMP-S4-3` → `CMP-S4-4` | `BND-S4-1`, `BND-S4-2` | **`CMP-S4-10`** issues it; **`CMP-S4-4`** decides whether it is valid (`jwt-middleware.ts:114`). Neither `CMP-S4-1` nor `CMP-S4-3` is authoritative for identity. |
| `FL-S4-4` | JWKS | `CMP-S4-10` → `CMP-S4-4` | `BND-S4-6` | **`CMP-S4-10`**, and only for signature material under the issuer allowlist. |
| `FL-S4-5` | `tools/call` with arguments and a context token | `CMP-S4-3` → `CMP-S4-4` → `CMP-S4-6` | `BND-S4-2`, `BND-S4-7` | **`CMP-S4-4`.** The context-token gate fires on `tools/call` for all but three exempt tools (`src/transport/context-token-middleware.ts:5`–`:9`). |
| `FL-S4-6` | Tool result | `CMP-S4-6` → `CMP-S4-4` → `CMP-S4-3` → `CMP-S4-1` | `BND-S4-7`, `BND-S4-2`, `BND-S4-1` | **`CMP-S4-6`**, whose value derives from `CMP-S4-8`. |
| `FL-S4-7` | Domain read/write within one unit of work | `CMP-S4-7` ↔ `CMP-S4-9` | `BND-S4-12` | **`CMP-S4-9`** for the stored value; **`CMP-S4-7`** for whether the unit commits. |
| `FL-S4-8` | Request line: method, `redactParams(params)`, raw response body, correlation id, MCP session id, duration | `CMP-S4-4` → `CMP-S4-19` | `BND-S4-13` | **`CMP-S4-9`** for what is stored, **issued through `CMP-S4-19`**; **nobody** for what is retained or deleted — see §9. One-way; never read back on the request path. *(Amended by NEU-987; this cell previously read **`CMP-S4-19`** for what is stored, which contradicted `FL-S4-20` in this same section and gave `SC-S3-16`/`SC-S3-17` two writers — `F-S14-8` / `F-S16-4`. The disposition that named this direction without repairing it is preserved at `10_…md` §6.3.)* |
| `FL-S4-9` | Operation event with a free-form `data` payload | `CMP-S4-7` → `CMP-S4-19` | `BND-S4-13` | **`CMP-S4-9`**, **issued through `CMP-S4-19`**. Read back **only** by the Tier-2 circuit breaker's read-through query (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`). *(Amended by NEU-987 on the same basis as `FL-S4-8`; this cell previously read **`CMP-S4-19`**. This is the row the cold reader stopped on — "I cannot implement a Tier-2 gate against a category with two writers." `SC-S3-17` now has exactly one: `CMP-S4-9`.)* |
| `FL-S4-10` | Embedding / classification request carrying content text | `CMP-S4-7`/`CMP-S4-14` → `CMP-S4-11` | `BND-S4-4` | **The caller.** The provider is authoritative for nothing; a provider failure leaves the blocking set unchanged (`audit-pipeline.ts:165`–`:191`). |
| `FL-S4-11` | One sanctioned page request per citation | `CMP-S4-17` → `CMP-S4-12` | `BND-S4-3` | **`CMP-S4-17`** owns the request budget: exactly one call per citation, no corpus walk, no problem-statement text in any of the four inherited modes (`03_…` §5). |
| `FL-S4-12` | Page response | `CMP-S4-12` → `CMP-S4-17` | `BND-S4-3` | **`CMP-S4-17`.** The response is evidence; the site is never authoritative for the verdict, and stored fields stay limited to `stable_id` + `canonical_url` while `CH-F5-1` is open. |
| `FL-S4-13` | One verdict tuple | `CMP-S4-17` → `CMP-S4-18` | `BND-S4-10` | **`CMP-S4-17`** — the cache's **only** writer. |
| `FL-S4-14` | Keyed verdict read (present / stale / absent) | `CMP-S4-16` → `CMP-S4-18` | `BND-S4-11` | **`CMP-S4-17`** for the stored verdict and its date — `CMP-S4-18` **holds** it and never writes it; **`CMP-S4-16`** for what to do about it (§7.3). *(Amended by NEU-987; this cell previously named **`CMP-S4-18`** for the stored verdict, which made it the outlier against `FL-S4-13` — "the cache's **only** writer" — in this same section. `10_…md` §5.5 named that direction without amending `05_…md`; the holder-versus-authority distinction it turns on is stated at `08_…md` §11 — *"`CMP-S4-18` … holds `SC-S3-33` and has authority over nothing"*.)* |
| `FL-S4-15` | The unit under gate, plus every `test` instance on the same node | `CMP-S4-14` → `CMP-S4-15` | `BND-S4-9` | **`CMP-S4-14`.** It sets the wall-clock bound and decides what a killed isolate means. |
| `FL-S4-16` | One gate verdict per executed unit (`SC-S3-35`) | `CMP-S4-15` → `CMP-S4-14` → the unit's record | `BND-S4-9`, `BND-S4-15` | **Undetermined.** `OI-S2-2` (the gate-verdict authority requirement) is open and owned by SUB-13 (NEU-977). Recorded as `F-S4-3`, not narrated past. |
| `FL-S4-17` | Content unit admitted to the store of record | `CMP-S4-13` → `CMP-S4-9` | via `CMP-S4-7`, `BND-S4-12` | **`CMP-S4-13`**, which is the only component that admits new content. |
| `FL-S4-18` | Gated content unit served to a learner | `CMP-S4-16` → `CMP-S4-7` → `CMP-S4-6` | `BND-S4-8` | **`CMP-S4-16`** for serve-or-quarantine; **`CMP-S4-9`** for the unit's content. |
| `FL-S4-19` | Handoff envelope (bounded, expiring, revocable) | `CMP-S4-4` → `CMP-S4-2` | `BND-S4-5` | **`CMP-S4-4`.** Per **`A-29`** the envelope is revocable, and an external client holding write authority over any state category is that assumption's stated invalidating outcome. |
| `FL-S4-20` | Batch read of `SC-S3-16`/`SC-S3-17` under an allowlist | `CMP-S4-20` → `CMP-S4-9` | `BND-S4-14` | **`CMP-S4-20`** for the extract; **`CMP-S4-9`** for the source rows. |
| `FL-S4-21` | DP-map nodes and prerequisite edges (`SC-S3-37`) | `CMP-S4-13` imports → `CMP-S4-9`; `CMP-S4-16` reads | `BND-S4-12` | **`CMP-S4-13`** for the imported copy's contents at import time; the upstream NEU-889 artifact is authoritative for the graph itself. See §8.1. |
| `FL-S4-22` | Measurement-contract **version identifier** (not the register) | `CMP-S4-20` → the extract it produces | — | **The upstream NEU-887 register.** See §8.2. |

**22 flows, each with a named direction and a named authoritative side, except `FL-S4-16`, which is
recorded as a finding.**

**Amendment note (NEU-987) — the two state-writer contradictions this section used to carry.** Eight
cells in this chapter were amended, and the amendment is disclosed rather than silent because
`10_…md` §6.3 is right that quietly reconciling one merged artifact to another *"would destroy the
record of which one was written first and on what evidence."* Each amended cell therefore names what
it previously said and where the original disposition is preserved. Nothing routed has been deleted.

| Category | Was | Now — exactly one writer | Amended cells |
| --- | --- | --- | --- |
| `SC-S3-16` / `SC-S3-17` | `FL-S4-8`/`FL-S4-9` named `CMP-S4-19`; `FL-S4-20` named `CMP-S4-9` | **`CMP-S4-9`**, issued through `CMP-S4-19` (a `W` annotation, never a second authority) | `FL-S4-8`, `FL-S4-9`, §3.2 `CMP-S4-9`, §3.2 `CMP-S4-19`, §7 `B1-8`, §7 `F3-5` |
| `SC-S3-33` | `FL-S4-14` named `CMP-S4-18`; `FL-S4-13` named `CMP-S4-17` | **`CMP-S4-17`**; `CMP-S4-18` *holds* the cache and never writes it | `FL-S4-14`, §7.3 hop 3 |

`SC-S3-34` was never in dispute here — `CMP-S4-17` writes it on every surface (§3.2, `BND-S4-3`). It
appears in the adjudication only because `DR-C10-S6-1`'s unqualified "exclusive writer of all 45
categories" headline read as a component-level claim; that quantifier is now explicitly tier-scoped.
`FL-S4-16` remains genuinely undetermined and is **not** touched by this amendment: it is `OI-S2-2`'s
open gate-verdict authority question, a different problem from a category with two writers.

Full reasoning: `decision-records/DR-C10-N987-1_state-writer-adjudication.md`.

---

## 6. The browser/server trust split

### 6.1 The property

> **No component running in the learner's browser holds anything gate-bearing.** Every mastery gate,
> scheduling decision, quality gate, quarantine decision and authorization decision is evaluated
> server-side from server-held state. A value the browser holds is a rendering of a server decision or an
> input to one — never the decision.

**"Gate-bearing" means:** a value that, if changed, changes whether the system permits something —
whether a learner advances, whether a content unit is served, whether a call is authorized, or when a
review falls due.

Applied to the motivating case: **a learner-facing surface that would need a mastery gate evaluated in
the browser gets that gate evaluated server-side instead.** The browser sends the interaction
(`FL-S4-1`); the server evaluates and returns the outcome (`FL-S4-2`, `FL-S4-6`).

### 6.2 Why it holds under every rendering model

`OUT-1` states the property as one that must hold **under every rendering model**, and `A-27`'s tolerance
envelope explicitly tolerates any of them — server-rendered, client-rendered, or a mix. The property
survives that range because it rests on three things none of which is a rendering fact:

1. **`BND-S4-1` is a trust boundary regardless of where HTML is produced.** The browser is under the
   learner's control in every rendering model, so `CMP-S4-3` must be correct while assuming the browser
   is hostile — which is exactly what "holds nothing gate-bearing" asserts.
2. **The gate-bearing state categories are all server-held.** The one browser-held category in the entire
   inventory is `SC-S3-43`, and `04_…` records it as **explicitly not gate-bearing**. There is no
   rendering model that moves a different category into the browser without inventing a new one.
3. **The gate evaluators are all behind `BND-S4-2`.** The context-token gate is transport middleware
   (`src/transport/context-token-middleware.ts`), the quality gates are `CMP-S4-14`, the drift gate is
   `CMP-S4-16`'s cache read, and the scheduling decision is `CMP-S4-8`. None of them is reachable from
   the browser except as a request.

**This document therefore states no preference between rendering models**, and nothing above may be cited
as an argument for one. The trust property is satisfied by all of them equally — which is precisely why it
does not select among them.

### 6.3 Rendering constraints handed to SUB-15 (NEU-982) as inputs

These are constraints the trust property **forces on whatever SUB-15 selects**. They are inputs to that
decision, not the decision:

| # | Constraint | Consequence if violated |
| --- | --- | --- |
| R-1 | No rendering model may evaluate a mastery gate, a scheduling decision or an authorization decision in the browser. | Violates §6.1 directly. |
| R-2 | Any client-held copy of server state is a cache with no authority; a model requiring optimistic client-side writes to be authoritative is outside the envelope. | `A-27`'s stated invalidating outcome ("client-authoritative learning state"). |
| R-3 | An offline-capable learner surface is outside the envelope. | `A-27`'s stated invalidating outcome. |
| R-4 | No rendering model may make the browser a direct reader of `CMP-S4-18`. The quarantine decision is a gate and belongs to `CMP-S4-16`. | Moves a gate across `BND-S4-1` (§7.3). |
| R-5 | **The trust property must not be cited as an argument for or against any rendering model.** It is satisfied by all of them. | Would smuggle a SUB-15 selection into this document's authority. |

---

## 7. Content-orchestration placement — thin serve path, thick authoring path

`DR-C10-S4-3` carries the decision. The placement:

### 7.1 The three content-orchestration components, placed

| | `CMP-S4-13` **authoring pipeline** | `CMP-S4-14` **quality-gate battery** | `CMP-S4-16` **content serve path** |
| --- | --- | --- | --- |
| **Owner** | Operator | Operator | Operator |
| **Responsibility** | The only component that admits new content into the store of record, and the component that runs the battery. | Evaluates every content gate except the citation-drift check at authoring time, producing one verdict record per requirement. | Hands an already-gated unit to a learner with no reviewer, no model call and no execution. |
| **Boundaries it owns** | `BND-S4-15` (process, to the battery) | `BND-S4-9` (process, to the gate runner); the calling half of `BND-S4-4` (trust, to the AI provider) | none it owns; it *reads across* `BND-S4-11` |
| **Boundary classification of its own edges** | process ×2 (`BND-S4-15`, `BND-S4-12`) | process ×1, trust ×1 | neither ×2 (`BND-S4-11`, `BND-S4-8`) |
| **Existing today** | Partly — `src/orchestration/chunk-workflows.ts`, `topic-workflows.ts` admit content | Partly — Tier 1 linter (`audit-pipeline.ts:94`) and Tier 2 classifier (`:174`) exist; the full NEU-890 gate set does not | Partly — `src/orchestration/teaching-workflows.ts` serves units; the drift-verdict read does not exist |
| **Evidence label** | `confirmed` for the existing part, `[unconfirmed]` for the rest | same | same |

Each is a **named, placed component with an owner, a responsibility statement and a boundary
classification.** None of them is left as an implication of the generic layering.

### 7.2 The split

**The full gate battery runs at authoring time. Exactly one gate sits at serve time.**

`CMP-S4-16` carries no reviewer, no model call and no execution. Its entire gate surface is one keyed
read of `CMP-S4-18` (`FL-S4-14`) — the citation-drift check, reading SUB-2's cached out-of-band verdict.
Everything else — every content-quality gate, every classifier pass, every isolate execution — sits on
`CMP-S4-13` → `CMP-S4-14` → `CMP-S4-15`.

**One thing today's code already violates and must not be read as endorsement.** `runTier2AuditPostCommit`
is post-commit (`audit-pipeline.ts:174`): the unit is written before that part of the verdict exists. That
is why `BND-S4-15` is a **process** boundary rather than "neither" — the pipeline genuinely must handle a
verdict arriving after the write. This model records the current shape; it does not bless it, and a
charter that makes a blocking gate depend on a post-commit pass owes an explanation.

### 7.3 Walking a content request across the serve path

| Hop | What happens | Authority |
| --- | --- | --- |
| 1 | `CMP-S4-6` receives a serve tool call and delegates. | `CMP-S4-6` |
| 2 | `CMP-S4-7` reads the unit from `CMP-S4-9`. | `CMP-S4-9` for the content |
| 3 | `CMP-S4-16` does **one keyed read** of `CMP-S4-18` for the unit's citations. | **`CMP-S4-17`** for the verdict and its date, **held by `CMP-S4-18`** *(amended by NEU-987 on the same basis as `FL-S4-14`; this cell previously read `CMP-S4-18`, naming the holder in a column that asks for the authority — see `decision-records/DR-C10-N987-1_state-writer-adjudication.md`)* |
| 4 | `CMP-S4-16` applies the four-row disposition below. | `CMP-S4-16` |
| 5 | The result returns via `FL-S4-18` → `FL-S4-6`. | `CMP-S4-16` for serve-or-quarantine |

The four-row disposition is `03_…` §4.4's, consumed unchanged:

| Cache read result | Serve path does | Note |
| --- | --- | --- |
| verdict present, `blocked` | quarantine the unit | the learner's request still completes |
| verdict present, `quarantined` | quarantine the unit | the learner's request still completes |
| verdict present but **stale** | quarantine the unit | at a per-source revalidation budget of 0, this is the **ordinary** path, not the exception |
| verdict **absent** | quarantine the unit | likewise ordinary |

**The learner's request always completes.** Quarantine changes what is served, never whether the request
resolves. And because the budget is zero by specification, `CMP-S4-16` must treat stale-or-absent as its
normal operating mode — a serve path that only works when a fresh verdict exists is mis-built.

---

## 8. State placement — discharging `OI-S3-2`

`OI-S3-2` (owner: SUB-4) asks this model to name, for `SC-S3-37` and `SC-S3-40`, **which component reads
it and whether that component holds a copy**. Both are discharged; neither is capped.

### 8.1 `SC-S3-37` — DP-map node and prerequisite-edge records

**Reading components:** `CMP-S4-13` (to place a content unit on a node at authoring time) and
`CMP-S4-16` (to resolve a unit's node and its prerequisite edges when selecting what to serve).

**Does a component hold a copy? Yes — one copy, imported by `CMP-S4-13`, read by both.**

Reasoning, stated so SUB-6 and SUB-13 can contest it rather than re-derive it:

1. `SC-S3-38` (per-learner per-node progression) is learner-scoped state this system must hold and it
   **references nodes**. A reference from an in-system row to a node that exists only as a committed
   document in another repository is not expressible as a constraint.
2. `CMP-S4-16` is on the learner's latency path and is specified to carry no execution and no egress. It
   cannot read an upstream document in place at serve time. It can read an in-system copy — the same
   affordance that makes `FL-S4-14` admissible.
3. Therefore the graph is **imported** into this system at authoring time. `CMP-S4-13` is the importer
   because it is already the only component that admits content, and importing is admission.

**What this does not decide:** which component is the *authority* over the imported copy, and what
happens when the upstream graph changes after import. Both are SUB-13's (NEU-977) — the imported copy is
a state category that needs exactly one authority like any other. The import-staleness question is filed
as `OI-S4-1`.

### 8.2 `SC-S3-40` — the measurement-contract register

**Reading component:** `CMP-S4-20`, and no other.

**Does it hold a copy? No.** The register is read **in place** as the committed, versioned NEU-887
artifact. What crosses into this system is not the register but the **contract version identifier**,
carried as an attribute of the extract that was derived under it (`FL-S4-22`).

Reasoning: nothing on the learner path and nothing on the authoring path reads `SC-S3-40`. It governs how
a claim is *measured*, and measurement is `CMP-S4-20`'s path, which is off every request path
(`BND-S4-14`). Copying a frozen, never-edited-in-place register into a runtime store would create a
second copy of an artifact whose whole value is that prior versions are retained and never overwritten.

**Consequence for `OUT-1`'s component model:** `CMP-S4-20` exists in the inventory *because* `SC-S3-41`
demands a producer and `SC-S3-40` demands that producer name its contract version. It is
`[unconfirmed]` — nothing implements it today.

---

## 9. Learner content, logging, and the deletion-owner gap

### 9.1 Which placed components carry learner content

| Component | Carries learner content? | Disposition against the unredacted-logging exposure |
| --- | --- | --- |
| `CMP-S4-4` | Yes — every request body and response body passes through it | **Inherits and does not fix.** `redactParams` (`src/shared/redact-params.ts:1`, `:13`) matches only credential-shaped keys, so learner free-text reaches `params` unredacted; the response body is captured raw (`audit-middleware.ts:88`, `:109`). Cites NEU-890's `OI-S6-5`. |
| `CMP-S4-19` | Yes — it is where that content lands durably | **Inherits and does not fix.** `pg-audit-transport.ts:117` inserts `response_body` with no redaction pass at all; the only bound is a byte truncation at `MAX_RESPONSE_BODY_BYTES` (`:142`–`:143`). `SC-S3-16` and `SC-S3-17` both hold learner payload. Cites NEU-890's `OI-S6-5`. |
| `CMP-S4-7`, `CMP-S4-8`, `CMP-S4-9` | Yes — on the domain path | **Inherits and does not fix**; the exposure is in the logging path, not here. Cites NEU-890's `OI-S6-5`. |
| `CMP-S4-11` | Yes — content text crosses `BND-S4-4` | **Constraint stated, not fixed:** the AI provider is a third party and the flow is `FL-S4-10`. What may cross is not decided here (SUB-10, NEU-984). |
| `CMP-S4-17` | **No.** | Not applicable: `03_…` §5's inherited egress constraints forbid problem-statement text in any of four modes and limit stored fields to `stable_id` + `canonical_url` while `CH-F5-1` is open. |
| `CMP-S4-20` | **By construction, no.** | The `PLA-*` extract is minimized, allowlisted and payload-free (`SC-S3-41`). It is the component that *fixes* the exposure for derived claims — and it does not exist. |
| `CMP-S4-1`, `CMP-S4-3` | Yes, in transit | Not applicable to the logging exposure; governed by §6. |

The disposition is uniform and deliberate: **this model inherits the exposure and does not fix it.** It is
NEU-890's `OI-S6-5`, and a component-and-boundary model is not the artifact that closes it.

### 9.2 The `F-S3-3` deletion-owner gap, addressed from the placement direction

`F-S3-3` records that both operational log tables hold learner payload with **no retention window, no
deletion owner and no principal field**, so per-learner deletion is not expressible. SUB-3 capped it as
`CAP-S3-3` and handed it on.

What this model adds is a **placement result, not a restatement**:

> **No component in this inventory can be named the deletion owner for `SC-S3-16` or `SC-S3-17`, and the
> obstruction is structural rather than a matter of assignment.** A deletion owner must be able to
> enumerate one learner's rows in both tables. Neither table carries a principal field (`04_…` §6:
> `SC-S3-16` has none, and the only identity-bearing state in the system is process-local —
> `SC-S3-19`'s subject-binding map at `src/transport/http.ts:83` and `SC-S3-20`'s rate-limit key).
> The mapping that would make enumeration possible, `SC-S3-45`, is itself `assumed` under `A-28` and has
> no store. **Naming any component the deletion owner today would be naming a component that provably
> cannot perform the duty.**

So the gap is **not** discharged by assignment. It is filed as `CAP-S4-1` — a deliberate second sighting
of the same gap from the placement direction, recorded rather than tidied, with the precondition made
explicit: a principal field on both tables (or `SC-S3-45` given a store) is what turns the deletion owner
from unassignable into merely unassigned. Only then can SUB-13 (NEU-977) assign it.

`CMP-S4-20` is the component this eventually attaches to: `SC-S3-41` is the only category in the entire
inventory that already carries "a named deletion owner" as part of its own definition.

---

## 10. Walking the benchmark journeys

### 10.0 Which three — resolving the F5.5 referent in place

`OUT-1`'s "Verified by" requires *"a walkthrough of the three C005 benchmark journey shapes"*, but C005
records **five** journeys. The three are resolved **mechanically, not chosen**: the vehicle-and-fidelity
summary table at
`../C005-product-foundation/benchmark-suite/01_journey-vehicles-and-fidelity.md:60`–`:66` assigns exactly
three of the five an **Existing MCP** vehicle — `JNY-B1` (`:62`), `JNY-F1` (`:64`) and `JNY-F3` (`:66`).
`JNY-B2` (`:63`) and `JNY-F2` (`:65`) are Paper / Wizard-of-Oz artifacts; they exercise no component of
this system, so there is nothing to walk them across. That is the whole referent. It is recorded here so
no later sub-task re-opens it, and the accepted warning F5.5 closes with it.

**Notation.** Each hop names the flow it is, the boundary it crosses, and the side that is authoritative
for what crosses. A hop whose authority is undetermined gets a finding id, never a narration.

### 10.1 `JNY-B1` — spaced-retention baseline and measurement feasibility

Vehicle: the teaching / rolling-session loop `start_learning` → `submit_answer` → `teach_next`
(`src/server/teaching-tools.ts:159`, `:112`, `:20`), plus a static database-schema and code inspection for
the BM-8 half.

| # | Hop | Flow | Boundary | Authoritative side |
| --- | --- | --- | --- | --- |
| B1-1 | The learner acts; the surface reports the action | `FL-S4-1` | `BND-S4-1` (trust) | **`CMP-S4-3`** — `[unconfirmed]`, `A-27`. As the vehicle is *actually run today* this hop is a local MCP client into `CMP-S4-5`, crossing `BND-S4-17` — a trust boundary **no component enforces** (`F-S4-5`). |
| B1-2 | `start_learning` admitted | `FL-S4-5` | `BND-S4-2` (trust, **HTTP only**) | **`CMP-S4-4`** on HTTP. On STDIO: **nobody** — no auth, no origin check, no rate limit, no context-token gate. |
| B1-3 | Parse, validate, delegate | `FL-S4-5` | `BND-S4-7` (neither) | **`CMP-S4-6`** |
| B1-4 | A learning session is opened and its row written | `FL-S4-7` | `BND-S4-12` (process) | **`CMP-S4-7`** for whether the unit of work commits; **`CMP-S4-9`** for the stored row |
| B1-5 | `submit_answer` — the caller supplies a grading rubric, the server derives a quality | `FL-S4-5`, `FL-S4-7` | `BND-S4-2` / `BND-S4-17` | **`CMP-S4-8`** for the derived quality (`src/domain/algorithms/grade-mapper.ts:71`, called at `src/orchestration/teaching-workflows.ts:1213`). The rubric arrives from the far side of the trust boundary — see §10.3. |
| B1-6 | The SM-2 scheduling values are written (`ease_factor`, `interval_days`, `next_review_date`) | `FL-S4-7` | `BND-S4-12` (process) | **`CMP-S4-8`** computes, **`CMP-S4-7`** commits, **`CMP-S4-9`** stores. Gate-bearing and entirely server-held — §6.1 exercised on a real hop. |
| B1-7 | `teach_next` selects the next unit and serves it | `FL-S4-18`, `FL-S4-14` | `BND-S4-8`, `BND-S4-11` (neither) | **`CMP-S4-16`** for serve-or-quarantine. `[unconfirmed]` — the drift-verdict read does not exist on this path today. |
| B1-8 | The request line lands in the log | `FL-S4-8` | `BND-S4-13` (process) | **`CMP-S4-9`** for what is stored, issued through **`CMP-S4-19`**; **nobody** for what is retained or deleted (§9.2). The learner's answer text is stored unredacted. *(Amended by NEU-987, per `FL-S4-8`.)* |
| B1-9 | The loop repeats after the interval read from `interval_days` | `FL-S4-7` | `BND-S4-12` | **`CMP-S4-9`** |
| B1-10 | The BM-8 half: read a per-DP-pattern mastery signal | — | — | **Undetermined.** `SC-S3-39` (the durable multi-session mastery composite) has no store, and no component in this inventory holds it. Recorded as `F-S4-6`. |

**Nine hops with a named authoritative side; one undetermined and filed.**

### 10.2 `JNY-F1` — schema formation versus surface memorization

Vehicle: content creation via `create_topic_with_chunks` (`src/server/topic-tools.ts:32`) → the teaching
flow, run at two fixed prerequisite positions with a transfer probe.

| # | Hop | Flow | Boundary | Authoritative side |
| --- | --- | --- | --- | --- |
| F1-1 | The authoring call is admitted | `FL-S4-5` | `BND-S4-2` / `BND-S4-17` | **`CMP-S4-4`** on HTTP; **nobody** on STDIO |
| F1-2 | `CMP-S4-13` admits the unit into the store of record | `FL-S4-17` | `BND-S4-12` (process) | **`CMP-S4-13`** — the only component that admits content |
| F1-3 | The Tier-1 linter suite runs and its findings are shaped into the unit's validator report | — | `BND-S4-15` (process) | **`CMP-S4-14`** (`src/orchestration/audit-pipeline.ts:94`; tier1a/tier1b split at `:129`–`:137`) |
| F1-4 | A gate unit executes inside a terminable isolate under a wall-clock bound | `FL-S4-15` | `BND-S4-9` (process, **not** trust) | **`CMP-S4-14`** sets the bound and decides what a killed isolate means. `[unconfirmed]` — `CMP-S4-15` does not exist today. |
| F1-5 | The gate verdict is written to the unit's record | `FL-S4-16` | `BND-S4-9`, `BND-S4-15` | **Undetermined.** `OI-S2-2`'s authority requirement is open; owner **SUB-13 (NEU-977)**. Recorded as `F-S4-3`. |
| F1-6 | The Tier-2 classifier pass runs post-commit, crossing to the AI provider | `FL-S4-10` | `BND-S4-4` (trust) | **The caller.** A provider failure leaves the blocking set unchanged (`audit-pipeline.ts:165`–`:191`). The unit is already written by this point (`:174`) — which is exactly why `BND-S4-15` is a process boundary. |
| F1-7 | The teaching flow serves the unit at a fixed prerequisite position | `FL-S4-18`, `FL-S4-21` | `BND-S4-8`, `BND-S4-12` | **`CMP-S4-16`** for serve-or-quarantine; the prerequisite position resolves against the imported `SC-S3-37` copy (§8.1) |
| F1-8 | The transfer probe: a novel instance is served and answered | `FL-S4-5`, `FL-S4-7` | as B1-5 | **`CMP-S4-8`** |

**Seven hops with a named authoritative side; one undetermined and filed.**

### 10.3 `JNY-F3` — AI grading over-validation

Vehicle: the real `submit_answer` grading path with adversarial shallow or wrong answers.

| # | Hop | Flow | Boundary | Authoritative side |
| --- | --- | --- | --- | --- |
| F3-1 | An adversarial answer **and a grading rubric** are submitted | `FL-S4-5` | `BND-S4-2` (HTTP) / `BND-S4-17` (STDIO) | **`CMP-S4-4`** on HTTP; **nobody** on STDIO. Note the shape: the tool takes `input.grading` and the server maps it (`teaching-workflows.ts:1475` → `grade-mapper.ts:71`). |
| F3-2 | The quality is derived from the rubric | — | `BND-S4-8` (neither) | **`CMP-S4-8`** — pure, deterministic, no model call |
| F3-3 | The derived quality drives the scheduling write | `FL-S4-7` | `BND-S4-12` (process) | **`CMP-S4-7`** / **`CMP-S4-9`**. Gate-bearing, server-held. |
| F3-4 | The response returns; the derived quality and `action` are read from it, never fabricated | `FL-S4-6` | `BND-S4-2`, `BND-S4-1` | **`CMP-S4-6`** |
| F3-5 | The raw answer and the raw response body land in `infrastructure.mcp_request_log` | `FL-S4-8` | `BND-S4-13` (process) | **`CMP-S4-9`** stores, issued through **`CMP-S4-19`**; **nobody** retains or deletes (§9.2) *(Amended by NEU-987, per `FL-S4-8`.)* |

**Five hops, all with a named authoritative side.**

**What the walk makes visible.** FM4 — AI grading over-validating a shallow answer — cannot be a defect of
`CMP-S4-8`: that component is pure and deterministic and computes exactly what the rubric it is handed
implies. The failure lives in whatever *produces* `input.grading`, and that producer sits on the far side
of `BND-S4-2` (or, on STDIO, of the unenforced `BND-S4-17`). Applying `BND-S4-4`'s rule — the AI provider
is authoritative for no verdict — to this hop yields: **the grading rubric is an assertion crossing a
trust boundary, not a fact.** C005's retained assumption RA5 ("AI grading is not trusted as the signal of
record") and this model's boundary classification are the same statement reached from two directions.

### 10.4 Walk result, and what a walk is not

| | Hops | With a named authoritative side | Undetermined, filed as a finding |
| --- | --- | --- | --- |
| `JNY-B1` | 10 | 9 | 1 (`F-S4-6`) |
| `JNY-F1` | 8 | 7 | 1 (`F-S4-3`) |
| `JNY-F3` | 5 | 5 | 0 |
| **Total** | **23** | **21** | **2** |

Two riders that are not undetermined hops but must not be lost:

- **`F-S4-4` — conditional authority.** B1-1, B1-2 and F3-1 have a determined authority **today**, under
  the reading in which the MCP core is the only writer of learning state. If SUB-6 (NEU-976) selects a
  hybrid ownership model, those three hops acquire a second candidate authority and `BND-S4-16` becomes
  real. The authority is determined; the *ownership model it is determined under* is not selected.
- **`F-S4-5` — the walked path is the unenforced path.** All three journeys are dogfooded through a local
  MCP client, i.e. through `CMP-S4-5`. Every protection named at B1-2 / F1-1 / F3-1 is mounted only on the
  HTTP path, so an observation made while running these journeys is an observation of the **unprotected**
  transport. This does not invalidate the journeys — their hypotheses are pedagogical — but a later
  sub-task must not read "the journey ran fine" as evidence about the gated path.

**What a walk is.** Walking a journey across a component model is **file inspection**
(`00_method-and-provenance.md` §5). It produces no evidence about any journey's hypothesis, no fidelity
claim, and no status upgrade for any C005 cell. It produces exactly one thing per hop: a named
authoritative side, or a finding.

---

## 11. Traceability, in both directions

| Direction | Question | Count | Where checked |
| --- | --- | --- | --- |
| Boundary → forcing input | Does every boundary cite the upstream requirement or codebase fact that forced it? | **17 / 17** | §4.2, "Forced by" column |
| Component → demanding requirement | Does every component carry a requirement that demands it, so that none appears unbidden? | **20 / 20** | §3.2, "Demanded by" column |

Two supporting counts, reported because a reader will otherwise recompute them:

- **Flows with a named authoritative side: 21 / 22.** The one exception, `FL-S4-16`, is filed as `F-S4-3`.
- **Journey hops with a named authoritative side: 21 / 23** (§10.4), the two exceptions filed as `F-S4-3`
  and `F-S4-6`.

The row-by-row audit is `traceability/S4_component-and-boundary-coverage.md`. Every row there resolves
inside `docs/research/`; none resolves into `_local/` or `docs/wf-plans/`.

---

## 12. What this document does not decide

Sub-task-to-tracker-id mapping is `F-S3-2`'s (`02_findings-register.md:131`); **SUB-13 is NEU-977, and
`NEU-987` is not a child of this charter at all.**

| Question this model deliberately leaves open | Owner |
| --- | --- |
| The per-state-category authority matrix — which single component is the authority for each `SC-S3-*`, including the imported `SC-S3-37` copy and the gate verdict at `FL-S4-16` | **SUB-13 (NEU-977)** |
| The all-MCP-versus-hybrid ownership-model selection, and with it whether `BND-S4-16` exists at all (§4.4) | **SUB-6 (NEU-976)** |
| AI-orchestration placement. This model states only `BND-S4-4`'s classification and `FL-S4-10`'s authority rule — that the provider is authoritative for no verdict — and selects no placement | **SUB-10 (NEU-984)** |
| The web API's resource inventory and its negative boundary | **SUB-7 (NEU-980)** |
| The rendering model. §6.3 hands five forced constraints as **inputs**; no selection is made or implied, and R-5 forbids citing the trust property as an argument for one | **SUB-15 (NEU-982)** |
| Repository topology | **SUB-9 (NEU-983)** |
| Deployment shape, and the **isolation primitive** behind `BND-S4-9` (`03_…` §3.4–§3.5 leaves the primitive unselected) | **SUB-10 (NEU-984)** |
| The scheduling mechanism behind `CMP-S4-17`, which is why `BND-S4-10`'s process classification is stated without naming a mechanism | `OI-S2-1` |
| Whether the post-commit Tier-2 shape (`BND-S4-15`, `audit-pipeline.ts:174`) should change. This model records it; it does not bless it (§7.2) | not this package's |
| What happens to the imported `SC-S3-37` copy when the upstream graph changes | `OI-S4-1` (filed by this sub-task) |
| Detailed component design, endpoint paths, database schemas, and any interface signature | out of scope by the charter |

---

## 13. Verification note

Per `00_method-and-provenance.md` §5, this document's claims are verified by **file inspection** and
`git diff`; the type-check is a no-regression signal only.

| Check | Method | Result |
| --- | --- | --- |
| Every boundary cites a forcing input | Read §4.2 row by row | 17 / 17 |
| Every component cites a demanding requirement | Read §3.2 row by row | 20 / 20 |
| SUB-2's three components appear with egress **and** isolation | Read §3.3 | present, three separate rows, not merged (`F-S2-2` honoured) |
| The three content-orchestration components are **named** components, not implications | Read §7.1 | present, each with owner, responsibility statement and boundary classification |
| The serve path carries no reviewer, no model call, no execution, reads the cached verdict, quarantines on stale-or-absent | Read §7.2–§7.3 | confirmed, four-row disposition consumed from `03_…` §4.4 unchanged |
| No rendering-model selection | Grep the document for rendering vocabulary | every occurrence sits in §6.2's "satisfied by all of them" argument or §6.3's handed-to-SUB-15 list; none in a decision |
| No AI-orchestration placement selection | Read §9.1 and §12 | the boundary and the authority rule are stated; no placement is chosen |
| `NEU-987` is not propagated | Grep across every file this sub-task adds | SUB-13 is cited as **NEU-977** at every point of use. The only occurrences of the wrong id are the two that name it *as wrong* — §12's correction sentence and this row — plus `F-S4-3`'s note that `OI-S2-2` records it. Zero propagated uses. |
| Register changes are pure appends | `git diff --numstat` on the four append-only paths | **0 deletions on every one** — `docs/GLOSSARY.md` `5 0`, `02_findings-register.md` `70 0`, `90_open-items-and-provisional-register.md` `23 0`, `91_caps-and-incomplete-scope.md` `17 0` |
| No regression | the project's type-check | **`tsc --noEmit` exits 0 with no diagnostics.** The `pnpm run type-check` wrapper could not be run to completion in this environment: its dependency preflight aborts on `ERR_PNPM_IGNORED_BUILDS` before reaching the script, an environment condition unrelated to this change. The underlying command the script wraps was run directly and is clean. **Zero TypeScript is touched by this change.** |

**The automated QA phase is a genuine no-op for this sub-task, and no cap is filed for it.** The
`qa-execution:engine` and `qa-execution:host` surfaces are unconfigured in this repository's capability
registry, and per `00_method-and-provenance.md` §5.1 a sub-task does not file a cap for a check that was
never applicable. `CAP-S1-3` already carries the package-level statement; this is the same no-op, not a
second one. The precedent is SUB-2's, which recorded it under "Deliberately not filed here".

**A cold read is the acceptance test this document cannot run on itself.** `OUT-1` requires that an
independent implementation agent name the owner of every boundary unaided. §4.2's "Owner" column and
§4.1's one-line ownership rule are what that read is against; a boundary whose owner a cold reader cannot
name is a defect in §4.2, not in the reader.
