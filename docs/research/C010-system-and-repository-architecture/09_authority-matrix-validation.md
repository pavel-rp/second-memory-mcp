# 09 — Validation of the per-state authority matrix: the isolation invariant per row, four scenario walks, and the flow cross-check

**Written by:** NEU-978 (SUB-14) · **Charter:** C010 (umbrella NEU-895)
**Written:** 2026-08-22
**Model:** claude-opus-5[1m]
**Validates:** `08_per-state-authority-matrix.md` at its **`pre-validation`** revision (NEU-977, PR #744)
**Covers:** `OUT-4` (the invariant applied per row), `OUT-3` (scenario evidence), `OUT-10` (spikes)
**Topic number:** `09` — the lowest free number in the `03`–`89` band. `03` is SUB-2's, `04` SUB-3's,
`05` SUB-4's, `06` SUB-5's, `07` SUB-6's, `08` SUB-13's. No `README.md` row is added: row 7 there is a
generic `03_`–`89_` range row owned "SUB-2 … SUB-16", written by SUB-1 and modified by no sibling.

---

## 1. What this chapter is, and what it is not

**It is.** The validation record for SUB-13's matrix: SUB-5's isolation invariant run as a decision
procedure over all 45 rows under two named target states; four scenario walks — divergence, conflicting
concurrent writes, mid-operation interruption, recovery — each producing a defined outcome per row; a
cross-check of all 22 of SUB-4's flow-level authority annotations against the matrix's authority for the
same category; NEU-890's durability property applied to the four rows it runs over; and a spike or a
named-owner cap for every uncertain-and-material claim the walks surfaced.

**It is not.** It assigns nothing, re-assigns nothing, and amends nothing. **Every failure below is a
routed finding, never an edit.** `SUB-16` dispositions those findings and republishes the matrix, and
`SUB-7`, `SUB-8` and `SUB-10` consume **that** post-absorption revision, not the pre-validation one this
chapter reads. It does not re-derive the invariant (SUB-5's), re-score the ownership model (SUB-6's),
re-run the exactly-one-authority or state-inventory↔matrix audits (SUB-13's, already run, all zero), or
perform SUB-7's **resource**-inventory↔matrix cross-check under `OUT-5` — a different audit over a
different inventory that does not exist yet, named distinctly here so the two are never conflated. It
decides no data-store topology (SUB-10) and no isolation **mechanism** (NEU-893). It touches no file
under `src/`, `tests/` or `drizzle/`.

**The honest headline, stated before the evidence rather than after it.** The matrix is sound. **Zero
rows fail because SUB-13 assigned the wrong authority.** What the per-row application returns instead is
a large number of rows that cannot satisfy the invariant for reasons SUB-5 already recorded — no
principal attribution exists, no confinement predicate exists, and the STDIO transport has no identity
gate. `F-S5-4` states it: at this cutoff **no state category can reach `holds`, and the binding
constraint is the transport, not the schema.** This chapter reproduces that result at census scale and
counts it. Reporting those rows as assignment defects would be wrong, and this chapter does not.

---

## 2. Vocabulary, disambiguated at first use

- **`session`** — throughout this chapter, unqualified `session` is **never** used. A **learning
  session** (or **learning run**) is `SC-S3-5`: a bounded run of teaching and drilling. An **MCP
  session** is the transport-level connection `SC-S3-18` and `SC-S3-19` key on. A **web session** is
  `SC-S3-43`, `A-27`'s browser-held surface state. The three are different things and are always
  written out.
- **Authority** — the component the matrix names as the category's single writer. **Not** the component
  that executes the write; the matrix records that separately in its `W` annotation and states that
  `W` "is an annotation, never a second authority" (`08_…md` §9).
- **Verdict** — one of SUB-5 §3.4's **closed six**: `not-applicable`, `not-evaluable`,
  `fails-confinement`, `fails-transport`, `fails-principal`, `holds`. **No seventh verdict is invented
  anywhere in this chapter**, and no verdict is stated without its target state.
- **Cause** — why a row failed. The vocabulary is fixed in §6.3 and deliberately distinguishes the
  transport/attribution/confinement residue SUB-5 already recorded from a defect in SUB-13's assignment
  or SUB-6's model. Collapsing them would misroute the work.
- **Routed finding** — a `F-S14-<k>` entry in `02_findings-register.md` naming an owning sub-task. **A
  finding without an owner is itself a finding**, and none below is missing one.

---

## 3. The row domain, verified independently

**45 rows. 450 authored cells. The brief's sizing is stale, and this chapter's own count says so.**

The C010 charter and this sub-task's tracker item size the validation load at *"the same roughly
250–300 cells (25–30 rows)"*. That is wrong, and it was already wrong for SUB-13, which filed it as
**`F-S13-4`**. It is re-verified here rather than inherited:

| Measure | Method | Count |
| --- | --- | --- |
| `####` category blocks in `08_…md` §8 | Mechanical parse of every line matching ``^#### `SC-S3-\d+` — `` | **45** |
| Distinct `SC-S3-<n>` ids among them | Set of the parsed ids | **45**, min 1, max 45, no gaps |
| Rows in `08_…md` §9's summary table | Parse of the table body | **45** |
| Attribute cells parsed per block | The nine `OUT-3` attributes | **9 × 45 = 405**, plus the authority/clause/status line = **450 authored cells** |
| Blocks missing any of Concurrency / Conflict handling / Recovery | Same parse, filtered | **0** |
| Blocks missing Consistency or Freshness | Same parse, filtered | **0** |

**Every one of the 45 was evaluated. None was sampled, and none was omitted.** The count agrees with
`04_…md` §8 (30 + 11 + 4 = 45) and with `06_…md` §3.2, which states that `04_…md` §3's *"41 entries"*
heading is stale (`F-S4-2` — a different staleness from `F-S13-4`; two documents, two numbers, and
citing one would leave the other uncorrected).

A mechanical caveat for anyone re-running the parse, carried forward from SUB-13: `04_…md` §2 contains
the bare template token `SC-S3-<k>`, which a naive `SC-S3-` extraction picks up as a valueless match and
which corrupts a numeric sort. Filter to the strictly numeric form.

---

## 4. How the invariant was applied

### 4.1 The procedure, consumed rather than restated

`06_…md` §3 publishes the invariant as a decision procedure and this chapter consumes it exactly:
ordered checks **`I1`** (in domain) → **`I2`** (principal attribution) → **`I3`** (confinement at or
below the port boundary) → **`I4`** (transport invariance) → **`I5`** (principal integrity); the closed
six-verdict set; and the adjudication rule — **run the checks in order, the first failing check names
the verdict, stop there.** Nothing about the procedure is re-derived here.

Two of SUB-5's rules are load-bearing for this census and are reproduced so no reader has to take the
result on trust:

- **`I1`'s rule.** A row whose `Learner-scoped` cell reads `question — open` is **in domain**. Only an
  explicit `no` takes a category out. *"18 of the 26 in-domain categories would exempt themselves by
  default if an unanswered question counted as a `no`."*
- **`I3`'s asymmetry (§3.4.1).** `I3` can be **failed** from a single counter-example but can only be
  **passed** from an enumerated access-path set covering reads *and* writes. Until one exists, **`I3`
  must return `fails-confinement` or the evaluation must stop — it may not return `holds` by failing to
  find a counter-example.** SUB-13's matrix bounds the **write** set by construction (exactly one
  authority) but does not oblige itself to enumerate **read** paths, and `I3` covers both. **No row in
  either census below returns `holds`, and none returns a pass on `I3` by absence of a counter-example.**

### 4.2 Target states — named, because a verdict without one is not a result

`06_…md` §3.2 admits three forms and warns that *"the same category returns different verdicts under
each"*. **Two censuses are published, each with its form stated at every verdict.**

**Census A — form (b), *assigned*.** The category's `04_…md` §3 row **plus SUB-13's named authority and
the nine `OUT-3` attributes**, evaluated against the system as it stands at **2026-08-22**. This is the
census `OUT-4` actually owes: `OI-S5-3` records that SUB-5's procedure was *"unexercised against a real
matrix"* and resolves when SUB-14 publishes. **`OI-S5-3` is discharged by Census A.**

**Census B — form (c), *composed*.** Census A's inputs **plus exactly one enumerated assumed change**:

> **NEU-850's `OUT-2` implemented in full** — an ownership key (`user_id NOT NULL`) on every
> learner-scoped **durable `public`-schema** store, threaded through the row-owning repository ports.

**And nothing else.** Enumerated explicitly, because §3.2 voids an evaluation against an unenumerated
composed state: Census B does **not** assume any query body scoped, any identity gate mounted on STDIO,
any principal *kind* determined, any store created for a `store: none` category, or any port introduced
in front of the two raw-SQL log tables. Census B exists because Census A leaves the frontier at `I2` for
almost every in-domain row, which would hide where the invariant actually breaks.

**Neither census asserts that an ownership column exists.** `04_…md` §6 establishes by a four-term
search (`user_id`, `userId`, `learner_id`, `learnerId`) that **zero** matches exist across all twelve
Drizzle tables and both raw-SQL log tables, and `NEU-850`'s `OUT-2` is *"a decision to honour, not an
existing fact"*. Census A treats its absence as fact; Census B treats its presence as an **enumerated
assumption**, labelled at every verdict it changes. **No verdict in this chapter rests on an ownership
column being present today.**

### 4.3 One ruling, disclosed rather than made silently

**`I3` requires confinement "enforced at or below the port boundary". Fifteen categories sit behind no
port at all** — the thirteen clause-1 process-local rows (`SC-S3-18` … `SC-S3-30`) and the two raw-SQL
log rows (`SC-S3-16`, `SC-S3-17`), which `OI-S5-1` already records as unreachable by `OUT-2`'s
port-threaded mechanism. Read literally, `I3`'s condition is unsatisfiable for them, and an unsatisfiable
check would silently manufacture failures.

**The ruling applied here:** the clause is read **purposively**. `06_…md` §3.6 case 3 introduces it to
exclude a guard sitting *above* the ports that a port-scoping mechanism would leave untouched
(`session-workflows.ts:39`–`:46`). Where no port mediates the category, there is no port-scoping
mechanism for a guard to sit above, so server-side enforcement at the category's own access sites
satisfies the clause's purpose.

**The ruling is routed as `F-S14-1`, not absorbed.** It is SUB-5's clause and SUB-16's to disposition.
**It changes no verdict's disposition:** in every affected row the verdict is a failure under **both**
readings, and both readings are recorded at the row. That is stated so the ruling cannot be mistaken for
a thumb on the scale.

---

## 5. Census A — target state (b), assigned, 2026-08-22

`I1` is read off `04_…md` §3's `Learner-scoped` column, re-counted here independently of `06_…md` §3.3
by parsing all 45 cells: **19 explicit `no`, 18 `question — open`, 8 explicit `yes` → 26 in domain.**
That reproduces SUB-5's census exactly, from the same source, without copying its numbers.

### 5.1 Out of domain — `I1` answers `no` → `not-applicable` (19 rows)

| Id | Category | Authority | Why out of domain |
| --- | --- | --- | --- |
| `SC-S3-4` | Content-audit verdict | `CMP-S4-7` | `Learner-scoped: no` — a verdict about a content version, not about a learner. |
| `SC-S3-8` | Question→chunk assessment mapping | `CMP-S4-7` | `no` — the mapping is a property of the question, not of who answered it. |
| `SC-S3-14` | Linter validation corpus | `CMP-S4-7` | `no` — a maintainer-curated asset. |
| `SC-S3-15` | Per-rule validation report | `CMP-S4-7` | `no` — a measurement about a rule. |
| `SC-S3-18` | MCP transport registry | `CMP-S4-4` | `no` — keyed by MCP session id, not by learner. |
| `SC-S3-21` | Tier-2 breaker trip set + stats cache | `CMP-S4-14` | `no` — process-wide gate state. |
| `SC-S3-22` | Request context and correlation id | `CMP-S4-4` | `no` — transport-level correlation. |
| `SC-S3-23` | Database client singletons | `CMP-S4-9` | `no` — a connection handle, not data. |
| `SC-S3-24` | Event-logger sink toggle | `CMP-S4-19` | `no` — boot configuration. |
| `SC-S3-25` | Transport batch buffers + per-sink breakers | `CMP-S4-19` | `no` — a buffer, not a learner record. |
| `SC-S3-26` | JWKS remote key set | `CMP-S4-4` | `no` — issuer key material. |
| `SC-S3-27` | Classifier per-field model cache | `CMP-S4-14` | `no` — a seeded runnable. |
| `SC-S3-32` | Problem-citation record | `CMP-S4-7` | `no` — corpus metadata; `stable_id` + `canonical_url` only. |
| `SC-S3-33` | Cached citation-drift verdict | `CMP-S4-17` | `no` — a verdict about a citation. |
| `SC-S3-34` | Citation-drift verdict store | `CMP-S4-17` | `no` — same. |
| `SC-S3-35` | Gate-verdict record | `CMP-S4-14` | `no` — a verdict about a content version. |
| `SC-S3-36` | Quarantine record | `CMP-S4-14` | `no` — a requirement's state. |
| `SC-S3-37` | DP-map node + prerequisite-edge records | `CMP-S4-7` | `no` — *"the graph is learner-independent by construction"*; SUB-5 §3.6 case 1 walks it. |
| `SC-S3-40` | Measurement-contract register | `CMP-S4-7` | `no` — a frozen contract register. |

**`not-applicable` is not a pass.** The invariant makes no claim about these 19; it does not certify
them. Six of them (`SC-S3-33`, `SC-S3-34`, `SC-S3-35`, `SC-S3-36`, `SC-S3-32`, `SC-S3-37`) nonetheless
carry learner-*derived* consequences through the categories that read them, which is why they still
appear in the four scenario walks.

### 5.2 In domain, `I2` fails → `not-evaluable` (24 rows)

`I2` asks whether every instance resolves to exactly one authenticated principal **expressed as a value
the server holds**. Under target state (b) the answer is no for 24 of the 26 in-domain rows, for three
structurally distinct reasons — all three named, because collapsing them would misroute the work.

**(i) Durable `public`-schema rows with no ownership column — 11 rows.**

| Id | Category | Authority | `I2` evidence |
| --- | --- | --- | --- |
| `SC-S3-1` | Topic record | `CMP-S4-9` | `public.learning_topics` (`schema.ts:21`) carries no principal field; `04_…md` §6's four-term search returns zero across all tables. |
| `SC-S3-2` | Chunk content record | `CMP-S4-9` | `public.learning_chunks` content group (`:49`) — same. |
| `SC-S3-3` | Per-chunk SM-2 scheduling state | `CMP-S4-9` | `public.learning_chunks` (`:59`–`:65`) — same. SUB-5 §3.6 case 5 reaches this row only under a state that assumes `I2`–`I4` discharged. |
| `SC-S3-5` | Learning-session record | `CMP-S4-9` | `public.learning_sessions` (`:99`) — same. |
| `SC-S3-6` | Session-chunk teaching state | `CMP-S4-9` | `public.session_chunks` (`:126`) — same. |
| `SC-S3-7` | Session question | `CMP-S4-9` | `public.session_questions` (`:156`) — same. |
| `SC-S3-9` | Attempt and grade record | `CMP-S4-9` | `public.session_question_attempts` (`:197`) — same. |
| `SC-S3-10` | Pre-review scheduling snapshot | `CMP-S4-9` | same table (`:213`–`:220`) — same. |
| `SC-S3-11` | Grade-revision audit trail | `CMP-S4-9` | `public.session_question_attempt_revisions` (`:250`) — same. |
| `SC-S3-12` | Notes | `CMP-S4-9` | `public.notes` (`:288`) — same. |
| `SC-S3-13` | Context tokens | `CMP-S4-9` | `public.context_tokens` (`:312`–`:321`) holds `id`, `createdAt`, `expiresAt` **and nothing else** — the row's own cell says the table *"carries no authenticated subject"*. |

**No server-held mapping substitutes.** The one learner-identity binding that exists anywhere in the
system is `SC-S3-19`, and it is keyed on a **live MCP session** and dropped with the transport
(`04_…md:126`); it cannot attribute a durable row that outlives the connection. **Cause: attribution
residue.** Owner: `NEU-850`'s `OUT-2`, per `06_…md` §3.5's ordering table (`I2` → an ownership key on
the store). **Not SUB-13's, and not SUB-6's.**

**(ii) The two raw-SQL log rows — 2 rows.**

| Id | Category | Authority | `I2` evidence |
| --- | --- | --- | --- |
| `SC-S3-16` | MCP request log | `CMP-S4-9` (W `CMP-S4-19`) | No principal field. Created `drizzle/0010_…sql:3`–`:15`, extended `drizzle/0012_…sql:1`–`:3`; neither adds one. SUB-5 §3.6 case 2 walks this row to the same verdict. |
| `SC-S3-17` | Operation event log | `CMP-S4-9` (W `CMP-S4-19`) | *"`SC-S3-17` walks identically"* — `06_…md` §3.6 case 2. |

These are **separated from (i) on purpose.** `OI-S5-1` records that both sit behind **no port**, so
`OUT-2`'s port-threaded mechanism *cannot reach them* — which is why they stay `not-evaluable` in
Census B as well, where (i) moves. `F-S3-3`'s deletion-owner gap and `CAP-S4-1`'s structurally
unassignable owner are the same underlying gap seen from two other directions. **This chapter records
the consequence and files no new cap** — the gap is at its fifth sighting, and SUB-4, SUB-5 and SUB-6
each declined to re-file it for the same reason: a structural gap does not become more owned by being
filed again.

**(iii) Categories with no store at all — 11 rows** (3 derived-never-persisted, 8 `store: none`).

| Id | Category | Authority | `I2` evidence |
| --- | --- | --- | --- |
| `SC-S3-28` | Mastery level | `CMP-S4-7` | Store `none`; computed at `teaching-workflows.ts:602` from `SC-S3-3`, which carries no principal. The instance inherits its inputs' unattributability. |
| `SC-S3-29` | `LearnerContext` aggregate | `CMP-S4-7` | Store `none`; built from five reads (`learner-context-workflows.ts:95`–`:103`) over `SC-S3-3`/`5`/`9`, none attributed. |
| `SC-S3-30` | Analytics KPIs and window rollups | `CMP-S4-8` | Store `none`; computed over attempt and learning-session data, none attributed. |
| `SC-S3-31` | Assessment-evidence record | `CMP-S4-9` | Store `none`. No schema, table, query or migration implements it (`04_…md` §3.6). |
| `SC-S3-38` | Per-learner per-node progression | `CMP-S4-9` | Store `none`. |
| `SC-S3-39` | Per-learner mastery-gate state | `CMP-S4-9` | Store `none`. |
| `SC-S3-41` | Operational-log derived extract `PLA-*` | `CMP-S4-9` (W `CMP-S4-20`) | Store `none`; `CMP-S4-20` is itself `[unconfirmed]` — no implementation exists. |
| `SC-S3-42` | Tutoring / hint interaction state | `CMP-S4-9` | Store `none`; `assumed` under **`A-25`**. |
| `SC-S3-43` | Web-session / UI interaction state | `CMP-S4-9` | Store `none`; `assumed` under **`A-27`**. |
| `SC-S3-44` | Handoff authorization envelope | `CMP-S4-9` | Store `none`; `assumed` under **`A-29`**. |
| `SC-S3-45` | Learner-identity → owner mapping | `CMP-S4-10` | Store `none` — *"no ownership column exists on any table today"*; `assumed` under **`A-28`**. |

**Cause: the category does not exist yet.** `I2`'s input is *"the `Store` column plus the schema or
migration it cites; or a named server-held mapping"*, and for these eleven there is none of either. This
is **not** an assignment defect and is **not** routable to SUB-13 — the matrix is required to name an
authority for a category the system does not hold yet, and `OI-S13-1` already carries the destination
question with SUB-10 as its owner. **Recording these as failures would be dishonest**; `not-evaluable` is
their correct verdict and is exactly what SUB-5 §3.4 defines it for.

**Three stand-ins are cited at the verdicts they decided, with envelope and invalidating outcome:**

- **`SC-S3-42` rests on `A-25`** (per-learner interaction state, **sub-second read latency on the
  learner path**). *Envelope:* any hint model whose AI call sits **outside a gate-bearing write path**,
  at any learner/node granularity, as a new category or an extension of an existing one. *Invalidating
  outcome:* a hint model requiring **synchronous multi-turn AI orchestration inside a gate-bearing write
  path**. The verdict `not-evaluable` holds anywhere in that envelope, because none of it creates a
  principal attribution. `SPK-S6-1` bounds the latency half — the MCP tool boundary costs p50 0.077 ms /
  p95 0.189 ms at 714 B, ≈0.019 % of `A-25`'s 1000 ms budget, **expiry 2027-08-21** — so the crossing is
  not what would move this verdict.
- **`SC-S3-43` rests on `A-27`** (a rich authenticated **web session** whose state is **not
  gate-bearing**). *Envelope:* any rendering model, arbitrarily rich client state, arbitrary client-side
  caching of read data, **provided the server re-evaluates every gate from server-held state**.
  *Invalidating outcome:* a UI direction requiring **offline-capable or client-authoritative learning
  state**. Note the interaction the matrix flags and this chapter confirms: `SC-S3-43` satisfies all four
  of clause 3's tests **on the merits** and still does not take the presentation exception, because
  `07_…md` §6.3's list is **empty** under `M-A`. If `A-27` is invalidated, this row becomes the one
  category the web tier could hold — and `06_…md` §3.1's confinement property would then be decided
  off-server, which is `A-27`'s invalidating outcome arriving in the invariant rather than in the UI.
- **`SC-S3-45` rests on `A-28`** (isolation enforced **server-side at or below the port boundary**;
  existing deployment retained; a backward-compatible migration path for existing global rows).
  *Envelope:* enforcement at the repository-port layer, in the schema, or both; staged, reversible or
  single-step migration; existing global rows backfilled, quarantined or archived. *Invalidating
  outcome:* a finding that **safe isolation requires a separate deployment or a separate datastore**.
  `A-28`'s envelope is what `I3`'s "at or below the port boundary" clause encodes, and `F-S5-2` already
  lands on it: the guard that makes the system single-learner sits **above** the ports
  (`session-workflows.ts:39`–`:46`), so a port-scoping mechanism leaves it untouched.

### 5.3 In domain, `I2` passes → the two rows that reach `I3` and beyond (2 rows)

Exactly two categories in the whole inventory have a principal the server holds today. Both are
process-local and both live on the HTTP transport.

**`SC-S3-19` — subject-binding map. Authority `CMP-S4-4`. Clause 1.**

- **`I1`.** `Learner-scoped: yes` — *"the only server-side learner-identity binding that exists anywhere
  in the system"*. In domain.
- **`I2`. Passes.** The map binds a live MCP session to a **JWT subject**, held in process memory at
  `src/transport/http.ts:83` with the `SessionIdentity` shape at `:32`–`:35`. Every instance resolves to
  exactly one subject, and the subject is a value the server holds.
- **`I3`.** This is the **only** category in the inventory with a genuinely **enumerated access-path
  set**: written at `onsessioninitialized` (`:204`–`:210`), read at `verifySessionBinding` (`:52`–`:72`),
  removed at `onclose` (`:212`–`:218`) and at shutdown (`:304`–`:311`) — four sites, one file, no other
  reader. The subject is a predicate on the read. **Under §4.3's disclosed purposive ruling, `I3`
  passes; under the literal reading it fails**, because no port mediates the category. Both are recorded.
- **`I4`. Fails.** `verifySessionBinding` is mounted only on the HTTP transport. `src/transport/main.ts`
  (`:55`–`:59`) mounts nothing — `CMP-S4-5`'s own responsibility statement is *"no auth, origin check,
  rate limit or audit middleware mounted"*, and `BND-S4-17` records STDIO as **a trust boundary nothing
  enforces, owner `nobody`**. The confinement depends on a component that exists on one transport only.

**Verdict: `fails-transport`** under the §4.3 ruling; **`fails-confinement`** under the literal reading.
**Both are failures, so the disposition is unchanged either way.** `I5` is never reached — which matters,
because `I5` is where the `sub`-versus-`azp` conflation (`jwt-middleware.ts:127`) would have fired.
**HTTP qualification, stated rather than implied:** the binding exists and is enforced **on HTTP only**.
On STDIO the category has no instances and no equivalent binding exists. **Any statement that this
category is confined is an HTTP-only statement and is never made unqualified.**
**Cause: transport residue.** Owner: **NEU-893** (`06_…md` §3.5: `I4` → an identity gate on the
transport that has none). **Not SUB-13's assignment** — `CMP-S4-4` is the correct authority under clause
1, and no other assignment would change the verdict.

**`SC-S3-20` — rate-limit windows. Authority `CMP-S4-4`. Clause 1.**

- **`I1`.** `Learner-scoped: yes` — keyed per JWT subject (`rate-limit-middleware.ts:76`–`:77`). In
  domain.
- **`I2`. Passes.** The counters are keyed **on the principal itself** (`:58`–`:59`), so attribution is
  the data structure's key.
- **`I3`.** Enumerated: the map (`:58`–`:59`), the lazy sweep (`:63`–`:68`), the keyed increment
  (`:76`–`:77`). The principal is the key, so it is a predicate on every access **by construction** —
  the strongest form of confinement evidence available anywhere in the inventory. Same §4.3 ruling and
  same literal-reading caveat.
- **`I4`. Fails.** Rate limiting is HTTP-edge middleware; STDIO has none.

**Verdict: `fails-transport`** (`fails-confinement` under the literal reading). **HTTP qualification:**
per-subject rate limiting exists on HTTP only. **Cause: transport residue.** Owner: **NEU-893**.
A consequence worth carrying to the interruption walk: `SC-S3-20`'s recovery cell records that a restart
*"resets every learner's window to zero"*, so **a restart loop is a rate-limit bypass** — and on STDIO
there is no window to reset in the first place.

### 5.4 Census A distribution

| Verdict | Rows | Ids |
| --- | --- | --- |
| `not-applicable` | **19** | §5.1 |
| `not-evaluable` | **24** | §5.2 (i) 11 + (ii) 2 + (iii) 11 |
| `fails-confinement` | **0** | — (see §5.3: reached only under the literal reading of `I3`) |
| `fails-transport` | **2** | `SC-S3-19`, `SC-S3-20` |
| `fails-principal` | **0** | — see §6.2 |
| `holds` | **0** | — see §6.1 |
| **Total** | **45** | |

---

## 6. Census B — target state (c), composed, with `OUT-2` assumed landed

The assumed set is §4.2's, enumerated and nothing more. Census B is published because it moves the
frontier and shows **which** party the next piece of work belongs to — `06_…md` §3.5's ordering table is
what makes that mapping non-arbitrary.

### 6.1 What moves, and what does not

| Rows | Census A | Census B | Why it moved, or did not |
| --- | --- | --- | --- |
| 19 out-of-domain | `not-applicable` | `not-applicable` | `I1` reads a table cell; no target state changes it. |
| §5.2 (i) — 11 durable `public` rows | `not-evaluable` | **`fails-confinement`** | `I2` **passes** (the ownership key exists under the assumed set). `I3` then fails: the assumed set adds a column and threads it through the ports, and **scopes no query body**. `06_…md` §3.6 case 3 supplies the counter-example for `SC-S3-5` — `getActiveSession()` carries no scoping predicate (`session-repository.ts:73`–`:80`) and the single-learner guard sits **above** the port at `session-workflows.ts:39`–`:46`. For the other ten, §3.4.1's rule alone decides it: **no enumerated read-path set exists, so `I3` must return `fails-confinement`** — the verdict is reached by the rule, never by absence of a counter-example. |
| §5.2 (ii) — `SC-S3-16`, `SC-S3-17` | `not-evaluable` | **`not-evaluable`** | **`OUT-2` cannot reach them.** `OI-S5-1`: both tables sit behind no port, and the assumed set threads the key *through the ports*. This is the single most consequential result in Census B: **the decision C010 is honouring does not, as scoped, make the two categories that hold learner payload evaluable at all.** |
| §5.2 (iii) — `SC-S3-28`/`29`/`30` | `not-evaluable` | **`fails-confinement`** | `I2` **passes**: their inputs (`SC-S3-3`, `SC-S3-5`, `SC-S3-9`) now carry the key, so each computed instance attributes to one principal. `I3` fails — all three are computed in orchestration, **above** the port boundary, over ports the assumed set did not scope. `SC-S3-29`'s five parallel reads are an enumeration of *its own* reads, not of the underlying categories' access paths, so §3.4.1 still bars a pass. |
| §5.2 (iii) — `SC-S3-31`, `38`, `39`, `41`, `42`, `43`, `44` | `not-evaluable` | **`not-evaluable`** | `OUT-2` puts a key on stores that exist. These seven have none, and the assumed set creates none. |
| §5.2 (iii) — `SC-S3-45` | `not-evaluable` | **`fails-confinement`** | Under the assumed set **`OUT-2` implemented in full is this category**, so its store exists. `I2` passes — the row's own consistency cell requires the mapping to *"resolve every authenticated principal to exactly one owner"*. `I3` fails, and **for a reason no other row shares**: see §6.4. |
| `SC-S3-19`, `SC-S3-20` | `fails-transport` | **`fails-transport`** | Process-local, transport-resident; `OUT-2` touches neither, and the STDIO gap is outside the assumed set. |

### 6.2 Census B distribution — and why `fails-principal` is zero

| Verdict | Rows | Ids |
| --- | --- | --- |
| `not-applicable` | **19** | §5.1 |
| `not-evaluable` | **9** | `SC-S3-16`, `17`, `31`, `38`, `39`, `41`, `42`, `43`, `44` |
| `fails-confinement` | **15** | `SC-S3-1`, `2`, `3`, `5`, `6`, `7`, `9`, `10`, `11`, `12`, `13`, `28`, `29`, `30`, `45` |
| `fails-transport` | **2** | `SC-S3-19`, `SC-S3-20` |
| `fails-principal` | **0** | — |
| `holds` | **0** | — |
| **Total** | **45** | |

**`fails-principal: 0` must not be read as "the principal is sound".** It is zero because **`I5` is
never reached**: adjudication stops at the first failing check, and `I3` or `I4` fails first for every
in-domain row under both censuses. The principal *is* defective — `jwt-middleware.ts:127` resolves
`const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;` into one opaque
string that carries no record of which claim produced it, and nothing downstream re-derives the
distinction, so the principal's **kind** is undetermined system-wide (`OI-S1-2`, `F-S5-4`). SUB-5 reaches
`fails-principal` for `SC-S3-3` only under a state that assumes `I1`–`I4` **all discharged**. **This
chapter does not construct that state**, because doing so would require assuming scoped query bodies and
a STDIO identity gate — neither of which any C010 sub-task builds, and §3.2 voids an evaluation against
an unenumerated assumption. Recorded as **`F-S14-2`** so the zero is never quoted as a clean bill.

**`holds: 0` in both censuses**, reproducing `CAP-S5-1`: this package establishes the invariant is
well-formed, **never that it is satisfiable**. No row was passed by failing to find a counter-example.

### 6.3 The cause tally — the number the brief asks for, with the vocabulary it requires

| Cause | Census A | Census B | Owner of the next piece of work |
| --- | --- | --- | --- |
| **Out of domain** — not a failure | 19 | 19 | — |
| **Attribution residue** — no ownership key exists; `NEU-850`'s `OUT-2` is a decision, not a fact | 11 | 0 | `NEU-850`'s `OUT-2` (`06_…md` §3.5, `I2` row) |
| **Portless attribution residue** — `OUT-2`'s port-threaded mechanism cannot reach the category | 2 | 2 | `CAP-S4-1` / `OI-S5-1`; unblocked only by a principal field on both log tables or by `SC-S3-45` gaining a store |
| **Category does not exist yet** — store `none`, nothing to evaluate | 11 | 7 | The upstream package that specifies it, plus **SUB-10** for the store (`OI-S13-1`) |
| **Confinement residue** — no scoping predicate; guards above the port boundary | 0 | 14 | **SUB-8 (NEU-981)** — `06_…md` §3.5, `I3` row, and §6's blast radius |
| **Transport residue** — no identity gate on STDIO (`F-S5-4`, `BND-S4-17`) | 2 | 2 | **NEU-893** — `06_…md` §3.5, `I4` row |
| **SUB-13's assignment** | **0** | **0** | — |
| **SUB-6's model** | **0** | **1** (`SC-S3-45`, §6.4) | **SUB-6 (NEU-976)** via the already-filed `F-S13-2`; **SUB-16** to disposition |
| **Total** | 45 | 45 | |

**Read this table before reading any other number in this chapter.** Of the 26 in-domain categories,
**not one fails because SUB-13 assigned it to the wrong component.** The failures are the residue three
merged predecessors already recorded, reproduced at census scale and counted. Routing any of them to
SUB-13 as an assignment defect would be wrong, and this chapter does not.

### 6.4 The one row whose failure traces to the model rather than the residue

**`SC-S3-45` — learner-identity → owner mapping. Authority `CMP-S4-10`, clause 4 via `F-S13-2`.**

Under Census B the store exists and `I2` passes. `I3` then asks whether the principal is a predicate on
every read and write path that reaches the category. **`CMP-S4-10` is the identity provider, which
`05_…md` §3.1–§3.2 place in `Z-IDP` — outside this system's trust boundary.** Its own responsibility
statement is *"asserts identity and nothing else"*, and the matrix's own cells say the mapping is
*"projected, never authored"* here and that concurrency and conflict handling are *"not this system's
concern"*.

**The consequence, which is new and is this chapter's to record:** a category whose authority is an
external component can **never** produce the in-system enumerated access-path set §3.4.1 requires,
because the authoritative paths are not in this system to enumerate. `SC-S3-45` is therefore
**structurally incapable of reaching `holds`** under `I3`, under any target state this charter can name
— and `SC-S3-45` is the category on which every other row's `I2` depends. **The invariant's satisfiability
bottoms out on a row that cannot satisfy it from inside the system.**

**Cause: SUB-6's model** — specifically clause 4, whose id error `F-S13-2` already routes to SUB-6.
SUB-13's assignment is **correct given the rule**: clause 4 says the row is authored in `Z-IDP`, and
`CMP-S4-10` is `Z-IDP`'s only component. The routable half is the clause's, not the assignment's.
Filed as **`F-S14-3`**, routed to **SUB-6** (which owns clause 4) and **SUB-16** (which dispositions).
This is the **only** row in 45 whose failure is not residue, and it is filed as one finding, not
inflated into several.

---

## 7. The four scenario walks — how they were run

Each walk is run against **the matrix's own attribute cells**, not against a fresh reading of the code:
that is the point of the exercise. Divergence is decided by **Consistency** and **Freshness**;
a conflicting concurrent write by **Concurrency** and **Conflict handling**; interruption and recovery
by **Recovery** (with Consistency naming what a partial state would violate). All 45 rows carry all
five cells — verified mechanically in §3 — so no walk is short of an input.

**A defined outcome means the matrix determines what happens, including "nothing happens" and "the
operation is refused".** It does **not** mean the outcome is desirable, and it does not mean the running
system achieves it: several rows define an outcome as a *requirement* on a category that does not exist
yet, and those are labelled. **An undefined outcome is a routed finding, not a narration** — there are
**two** in 180 row-walks, both in §8 and §9, both routed.

**One structural result decides most of the walks and is stated once here rather than 45 times.** Under
the selected model `M-A` every category has **exactly one** authority (SUB-13's audit: 45/45, zero with
two). A conflicting write between **two authorities** is therefore **unrepresentable by construction**,
and every conflict below reduces to two *instances of the same authority* racing — two processes, or two
in-flight requests inside one. That is precisely the property `07_…md` §7 disqualifies `M-B` for lacking,
and it is what makes these walks terminate at all: a two-authority row would have a mid-interruption
state spanning two owners with **no shared transaction** (`src/ports/unit-of-work-port.ts:26`–`:28` — the
unit of work does not span components).

**Two bounds are honoured throughout and neither is argued past.**

- **`CAP-S6-1`.** Two-writer divergence *"was never observed against a live database"* — five Postgres
  probes (`127.0.0.1:5432`, `:5433`, `localhost:5432`, `postgres:5432`, `db:5432`) all refused or timed
  out. The cap is on **evidence strength, not on the conclusion**. §9 below therefore states what the
  matrix *requires* and what the code *fails to prevent* — and asserts nothing about what was observed.
- **`SPK-S2-1`.** A 1000 ms same-thread guard armed before a non-terminating unit **never fired**; the
  process needed an external `SIGKILL` (exit 137). **An authoring-time bound is a liveness boundary, not
  containment.** §10 turns on this and does not assume past it — see `SPK-S14-1`, which settles the
  remaining half of the question.

**And one piece of evidence is explicitly not used.** `F-S4-5` records that all three benchmark journeys
are dogfooded across STDIO, where `BND-S4-17` places a trust boundary **nothing enforces, owner
`nobody`**. **"The journey ran fine" is not evidence about the gated path**, and no outcome in §10 or §11
rests on a journey walk.

---

## 8. Walk 1 — divergence

**Scenario.** Two components hold different views of one category. The row's **Consistency** and
**Freshness** attributes determine the outcome; a row whose attributes cannot determine it is a routed
finding.

| Id | Defined outcome under divergence |
| --- | --- |
| `SC-S3-1` | The stored row wins; `summaryVersion` identifies which summary a reader saw. No cross-run staleness bound applies — a topic summary is authored content, not a scheduling input. |
| `SC-S3-2` | The current committed version wins. **No read-through cache exists between `CMP-S4-16` and the store**, so a serve-path reader cannot diverge from it by construction; a chunk whose embedding describes a superseded body is a **defect**, not a tolerated divergence. |
| `SC-S3-3` | **No divergence is tolerated.** "Strictly current at read… no caching layer may be introduced between the store and the scheduler." A diverging view changes what the learner is asked next, so divergence here is a correctness failure, not a staleness window. |
| `SC-S3-4` | The verdict is valid **only for the `contentVersion` it names**. A content edit invalidates it immediately; a divergent (stale) verdict against an edited chunk is a defect. |
| `SC-S3-5` | Read-your-writes within the run; nothing outside the run requires sub-second visibility, so cross-run divergence is tolerated and bounded by the run. |
| `SC-S3-6` | Read-your-writes within the run. Neither the parent run nor the chunk reference may dangle, so a divergent child is a referential defect. |
| `SC-S3-7` | Strictly current within the run — the status governs whether the question may be answered, so a divergent status is refused by the state machine, not reconciled. |
| `SC-S3-8` | **Divergence is unrepresentable**: immutable once written, in the same transaction as `SC-S3-7`. |
| `SC-S3-9` | Strictly current — the grade is the scheduler's input. A divergent read is a scheduling defect. |
| `SC-S3-10` | Not applicable: *"a historical record of a prediction, correct forever by construction."* Divergence would mean the record changed, which the write-once property forbids. |
| `SC-S3-11` | Not applicable — append-only history. |
| `SC-S3-12` | Read-your-writes; no downstream consumer can be misled, so a divergent view is inert. |
| `SC-S3-13` | Strictly current: *"a token read after its expiry must be rejected even if the sweep has not run."* Expiry is evaluated at read, so a sweeper's divergent view of what still exists changes nothing. |
| `SC-S3-14` | No bound — a slowly-curated asset, not a runtime input. Divergence is tolerated indefinitely. |
| `SC-S3-15` | Valid until the rule or the corpus changes; either change invalidates the report. Divergence resolves to "the report names its corpus version or it is not evidence". |
| `SC-S3-16` | No bound; nothing reads it synchronously. Divergence between what happened and what the log says is **expected**, because the log is lossy by design (§10). |
| `SC-S3-17` | **60 seconds** — the Tier-2 breaker's tolerance, which is `SC-S3-21`'s cache window and *"the only freshness requirement any consumer places on this table"*. Divergence beyond it changes gate strictness. |
| `SC-S3-18` | Defined and **deliberate**: *"Across processes it is **not shared**, which is the single-instance constraint stated plainly."* Two processes hold disjoint registries; a client's transport lives in exactly one. |
| `SC-S3-19` | Always current in-process; the binding must exist before the first non-`initialize` request, so there is **no window in which a session is live and unbound**. Across processes the map is not shared — same single-instance consequence as `SC-S3-18`. |
| `SC-S3-20` | Current by construction in-process. Across replicas, **`n` processes hold `n` windows**, so the effective limit is `n ×` the configured one — recorded at `OI-S13-1` as a topology question, owner SUB-10. |
| `SC-S3-21` | The trip set is *"deliberately **not** kept consistent with its source"* — a trip is sticky for the process's life. Across replicas **`n` processes hold `n` opinions** about whether Tier-2 blocking is tripped. Defined, and its **cost** is capped evidence (`CAP-S6-1`), not a measured quantity. |
| `SC-S3-22` | Divergence unrepresentable — each async context is private. |
| `SC-S3-23` | Divergence not representable: *"a connection handle, not data."* |
| `SC-S3-24` | Set once at boot and never changes during the process's life. Two processes may hold different toggles; each fails open to stderr independently. |
| `SC-S3-25` | Bounded by the flush interval and batch size — the delay between an event happening and its being visible in `SC-S3-16`/`SC-S3-17`. |
| `SC-S3-26` | The issuer's set wins. *"A stale set rejects valid tokens after a key rotation."* The refresh policy is `Z-IDP`'s, **an inherited dependency, not a local guarantee** — named at the row rather than assumed away. |
| `SC-S3-27` | Not applicable in-process. Across a deploy, a model or prompt change takes effect only on restart — the intended release mechanism. |
| `SC-S3-28` | Cannot diverge — recomputed per call from `SC-S3-3`'s current values; a pure function, so consistency is entirely inherited. |
| `SC-S3-29` | **The one genuine divergence among the derived rows.** Five parallel reads are **not a snapshot**: due counts, overdue topics, streak and leech count can each reflect a different instant. A torn read is a real, low-severity defect — defined as such, not tolerated. |
| `SC-S3-30` | Inherited from the reads `CMP-S4-7` performs; the same torn-read caveat as `SC-S3-29`. |
| `SC-S3-31` | Read-your-writes for progression computation. Identity is `node_id` + `skill_type`; **a record whose citation changes is the same record**, so a citation-level divergence is not a record-level divergence. |
| `SC-S3-32` | Defined by **separation**: the `canonical_url`'s freshness *"is not this record's property — it is `SC-S3-34`'s verdict about it."* That separation is why the two are different categories. |
| `SC-S3-33` | **The defining row.** Fresh only within `per_citation_staleness_window` — **90 days, declared not measured** (`03_…md` §4.2). Beyond it the entry is **stale**, a recorded state and never a partial verdict, and stale-or-absent **quarantines the unit while the learner's request still completes**. |
| `SC-S3-34` | Governed by the same 90-day window and by `per_source_revalidation_budget` = **0 for all twelve sources**. At budget 0 **no re-check is admitted**, so in steady state the store does not refresh: divergence from the world is **permanent by specification**, and quarantine-for-stale is the **ordinary** serve path, not an error path. |
| `SC-S3-35` | Valid only for the content version it names; a content edit invalidates every verdict against the prior version. Divergence resolves to "re-gate or quarantine". |
| `SC-S3-36` | Read-your-writes on the authoring path. All three slots commit together, so a half-diverged quarantine (a reason without an owner or an exit condition) is **unrepresentable** by the record's shape. |
| `SC-S3-37` | The in-system copy **may** lag NEU-889's artifact; the upstream artifact wins, and **the copy's version must be identifiable** or nothing downstream can say which graph a progression decision was made against. |
| `SC-S3-38` | Read-your-writes. *"A progression read that misses the learner's last completed node re-serves work already done"* — a defined, bounded, user-visible consequence. |
| `SC-S3-39` | Read-your-writes **across learning runs**; a per-run cache would defeat the property being measured. A composite not updated in the same unit of work as the advancing attempt means *"a mastery claim exists that no recorded attempt supports"* — defined as a defect. |
| `SC-S3-40` | Freshness of the register is **irrelevant**; identifiability of the **version** is everything. Contracts are frozen and superseded, never edited in place, so two readers naming the same version cannot diverge. |
| `SC-S3-41` | Derived on a schedule; the window it covers **must be stated with the extract**. Nothing reads it synchronously, so divergence is bounded by the stated window. |
| `SC-S3-42` | **UNDEFINED — routed.** See below. |
| `SC-S3-43` | Loose, and **inside `A-27`'s envelope**, which *"explicitly tolerates arbitrary client-side caching of read data"*. A stale read here is not a defect. Nothing downstream is invalidated by a stale scroll position. |
| `SC-S3-44` | Strictly current at check: *"a revoked envelope must be rejected on the next request, not at the next sweep."* Stronger than `SC-S3-13`'s, because revocation is an explicit security action rather than passive expiry. A divergent view that still accepts a revoked envelope is a security failure, not staleness. |
| `SC-S3-45` | Defined **as a requirement with a named external dependency**: a revoked or re-assigned identity must take effect on the next request, and a principal resolving to two owners or to none *"breaks isolation rather than degrading it."* But the only thing this system caches from `Z-IDP` is `SC-S3-26`, whose refresh policy is the issuer's — so the freshness of identity **facts** is an **inherited dependency, not a local guarantee**. Recorded as a defined outcome with the dependency named at the row, not as an undefined one. |

### 8.1 The one undefined divergence outcome

**`SC-S3-42` — tutoring / hint interaction state.** Its Consistency cell requires the hint state and the
attempt it relates to (`SC-S3-9`) to be *"attributable to each other, or hint usage cannot be excluded
from — or included in — a mastery judgement"*, and then says plainly: **"Which of those it is, is
NEU-891's decision, not this matrix's."** So when the hint state and the mastery judgement diverge about
whether a hint was used, **the matrix cannot determine the outcome** — the two candidate resolutions
(exclude the attempt from mastery; include it unchanged) produce opposite mastery verdicts and the rule
that picks between them does not exist in any merged input.

This is **not** narrated past. Filed as **`F-S14-4`**, routed to **NEU-891** (which owns the hint model
and is the only party that can state the inclusion rule) and to **SUB-16** (to disposition and to record
the residual at the row when it republishes). Cited at the verdict: `A-25`'s envelope tolerates *"any
number of escalation levels"* and any granularity, so **no point inside the envelope resolves this** —
the envelope is about where the AI call sits, not about whether a hint taints an attempt. `A-25`'s
invalidating outcome (synchronous multi-turn AI orchestration inside a gate-bearing write path) would
make it worse, not better, by putting the undetermined interaction inside the mastery transaction.

**Walk 1 result: 44 of 45 rows produce a defined outcome; 1 undefined, routed.**

---

## 9. Walk 2 — conflicting concurrent writes

**Scenario.** Two writes to one category race, or disagree. The row's **Concurrency** and **Conflict
handling** attributes determine the outcome. Per §7, a two-**authority** conflict is unrepresentable
under `M-A`; every case below is two instances of the one authority.

| Id | Defined outcome under a conflicting concurrent write |
| --- | --- |
| `SC-S3-1` | Last-writer-wins on the row; **no merge**. `summaryVersion` makes the loss **detectable after the fact**, and the remedy is re-running the authoring step — nothing is reconciled field-by-field. |
| `SC-S3-2` | Last-writer-wins per row. Two editors of one chunk is **not a modelled scenario** at this cutoff — content editing is a single-authoring-pipeline activity. `contentVersion` identifies which body a downstream artifact was computed against. |
| `SC-S3-3` | **Must serialize.** Concurrent application of two SM-2 updates *"silently loses one interval advance — the loss is invisible afterwards because the state is a running aggregate, not a log."* No merge is meaningful: SM-2 is order-dependent, and **the transaction boundary is the whole answer, not the field.** See §9.1. |
| `SC-S3-4` | Last-writer-wins; **benign** unless the content changed between the two audits, since both compute against the same content version. The whole jsonb report is replaced. |
| `SC-S3-5` | One writer per run in practice; two concurrent terminal transitions are last-writer-wins and benign (both write the same terminal status). Status is a small state machine and an illegal transition is **rejected, not reconciled**. **The one-active-learning-run rule is not database-enforced** — `F-S6-3`: the check and the insert run on separate round trips in different transactions with no partial unique index behind them. |
| `SC-S3-6` | Single-writer per run in practice; concurrent time-spent accumulation from two in-flight tool calls **would lose one increment**. No merge; last write wins. |
| `SC-S3-7` | One answering path per question; **a double-submit must be idempotent at the status transition, not additive.** The state machine rejects illegal transitions. |
| `SC-S3-8` | **No race exists** — single write at creation, no second write. |
| `SC-S3-9` | A revision and a fresh attempt must serialize (the revision reads the row it rewrites). The revision replaces the graded fields wholesale and **preserves the prior values in `SC-S3-11`**. |
| `SC-S3-10` | **None possible.** Single write; the write-once property is the point — *"a revised snapshot would destroy the evidence that the scheduler's prediction was wrong."* |
| `SC-S3-11` | **None possible.** Appends do not conflict; there is no update path. |
| `SC-S3-12` | Creates do not conflict, but **a delete-and-re-add pair from two callers can interleave into a lost note; there is no compare-and-set.** The last add wins and the intermediate content is simply gone. Defined, and lossy. |
| `SC-S3-13` | Mint and sweep do not conflict — the sweep only removes rows already past `expiresAt`. No update path. |
| `SC-S3-14` | Maintainer-serial in practice; two re-labellings are last-writer-wins, label replaced. |
| `SC-S3-15` | One run at a time in practice; concurrent runs are last-writer-wins and the report row is superseded wholesale. |
| `SC-S3-16` | Appends do not conflict; append-only with no update path. |
| `SC-S3-17` | Appends do not conflict. **The breaker's read is a snapshot query and does not coordinate with writers** — so the gate reads a consistent instant, not a consistent state. |
| `SC-S3-18` | **None possible** — Node's single-threaded event loop serializes access; one process, one map. No lock is needed or present. |
| `SC-S3-19` | **None possible** in-process (event-loop serialized). **A re-bind of a live MCP session is not a modelled operation** — which is the property the binding exists to enforce. |
| `SC-S3-20` | **None possible** in one process (event-loop serialized). Across processes, see §8's `n`-windows result. |
| `SC-S3-21` | Two concurrent gate evaluations during a cache miss can both issue the underlying query: **duplicate work, not an incorrect verdict**, since both compute the same trip state from the same query. |
| `SC-S3-22` | **None possible** — each async context is private; `AsyncLocalStorage` isolates concurrent calls **by construction**, and that is what makes concurrent requests loggable at all. |
| `SC-S3-23` | None — the pool **is** the concurrency mechanism, not a subject of it. |
| `SC-S3-24` | None — single write at boot. |
| `SC-S3-25` | None — per-worker-thread, so no cross-thread contention on one buffer. |
| `SC-S3-26` | Concurrent first verifications may each trigger a fetch: **duplicate fetches, not an incorrect verification** — all fetches return the same issuer-published set. |
| `SC-S3-27` | Concurrent first classifications may each seed a runnable: **duplicate initialisation**, nothing more. |
| `SC-S3-28` | **None possible** — no shared state; each call computes its own. |
| `SC-S3-29` | **None possible** — no shared state. The hazard here is the torn read of §8, not contention; the two are named separately on purpose. |
| `SC-S3-30` | **None possible** — pure computation over supplied values. |
| `SC-S3-31` | **UNDEFINED — routed.** See §9.2. |
| `SC-S3-32` | Keyed on `stable_id`; a re-admission of the same citation is an **upsert on that key, not a second row**. No merge — the two fields are replaced together. |
| `SC-S3-33` | **None possible** — single writer by specification (`FL-S4-13`: `CMP-S4-17` is *"the cache's only writer"*), keyed replacement, and reads never block. |
| `SC-S3-34` | **None possible** — single writer, keyed on `citation_id`. **Exactly one request per citation; a corpus walk is prohibited**, and that prohibition constrains the producer's writes as much as its reads. |
| `SC-S3-35` | One runner per unit per run. **A unit terminated by the wall-clock bound produces no verdict, not a partial one.** No merge; a re-run supersedes. Whether prior verdicts are retained is a store-shape question — `OI-S13-1`, owner SUB-10 — which is a **residual on retention, not on the conflict outcome**. |
| `SC-S3-36` | One quarantine per requirement; re-quarantining an open record **updates** it rather than opening a second. **A close and a re-open must serialize, or the exit condition of one is lost.** |
| `SC-S3-37` | One import at a time. Two concurrent imports of different upstream versions *"would interleave into a graph that never existed upstream"* — the whole-unit commit is what prevents it. A re-import **replaces**; it does not reconcile node-by-node. |
| `SC-S3-38` | Two concurrent completions against one node **must serialize, or a progression advance is lost** — the same running-aggregate hazard as `SC-S3-3`. No merge; progression is order-dependent. |
| `SC-S3-39` | Serialized per learner per gate. No merge; order-dependent, like `SC-S3-3` and `SC-S3-38`. |
| `SC-S3-40` | **None possible** under append-and-supersede — a new version is a new row, never an update. |
| `SC-S3-41` | Single producer. **Overlapping derivation runs would double-count, so runs must not overlap for a given window.** Each run produces its own extract for its own window. |
| `SC-S3-42` | Escalations are serial per learner per node by nature; **a race would only duplicate a level.** No merge; last write wins on the level. |
| `SC-S3-43` | Two browser tabs for one learner is **the ordinary case**; last-writer-wins is acceptable and expected. Inside `A-27`'s envelope. |
| `SC-S3-44` | Mint and revoke must serialize, and **a revoke that races a refresh must lose the refresh, not the revoke.** **Revocation is terminal and beats every concurrent operation** — the sharpest conflict rule in the inventory, and the correct one for a security primitive. |
| `SC-S3-45` | **Not this system's concern** — the mapping is authored upstream and *"a projection never merges."* Defined by delegation, and the delegation is named. |

### 9.1 What this walk asserts, and what `CAP-S6-1` stops it asserting

**Asserted, because it is readable.** Nine of the 32 durable-write rows state a **serialization
requirement** (`SC-S3-3`, `9`, `31`, `36`, `37`, `38`, `39`, `41`, `44`), and nothing in the codebase
supplies one: no optimistic concurrency control exists anywhere in `src/`, no transaction sets an
isolation level (`src/infrastructure/db/operations.ts:21`–`:24`), and `F-S6-2` records that
`reviewPersistence` is **absent from `UnitOfWorkPort`'s `TransactionPorts`**
(`src/ports/unit-of-work-port.ts:26`–`:28`), so `SC-S3-3`'s read-compute-write has **no transactional
envelope under any ownership model**. The codebase's own comment states its single-writer premise
(`src/orchestration/review-workflows.ts:190`–`:191`), and `F-S6-1` records that the premise is already
false for any horizontally-scaled MCP deployment **before any web tier exists**.

**Not asserted, because `CAP-S6-1` caps it.** That two independent writer processes racing this pattern
against a live Postgres **do in fact lose an update** was **never observed** — five connection probes all
refused or timed out at SUB-6's cutoff, and no `DATABASE_URL` is present in this environment either.
**This chapter does not re-assert it, does not re-run the failed probe, and files no duplicate cap.**
`CAP-S6-1`'s named owner is **SUB-10 (NEU-984)**, alongside **NEU-896**, and what would lift it is
unchanged: a two-process harness against a reachable Postgres exercising
`getChunk → compute → persistReviewUpdate` concurrently. The distinction matters: the matrix's
conflict-handling rules are **requirements**, they are **defined**, and whether the running system meets
them is **capped evidence, not a validated fact**.

### 9.2 The one undefined conflicting-write outcome

**`SC-S3-31` — corpus-neutral assessment-evidence record.** Its Concurrency cell reads: *"Two
assessments of the same `node_id` + `skill_type` must serialize **if the record is an aggregate**;
append-per-event has **no race**. **Which of the two shapes applies is not determined by any merged
input** — SUB-10 decides it with the store."*

The two shapes give **opposite** outcomes — a mandatory serialization requirement versus no race at all —
and the matrix cannot pick between them, because the choice is a store-shape decision no merged artifact
makes. This is a genuine undefined outcome and it is material: `SC-S3-31` is the load-bearing row of the
durability property (§13).

Filed as **`F-S14-5`**, routed to **SUB-10 (NEU-984)** — which selects the data-store topology under
`OUT-8` and is the only party that can settle the shape — and to **SUB-16**, to disposition and to carry
the residual at the row. It is **not** routed to SUB-13: the matrix records the indeterminacy honestly
and names the deciding party, which is the correct behaviour for a cell that cannot be answered from
merged inputs.

**Walk 2 result: 44 of 45 rows produce a defined outcome; 1 undefined, routed.**

---

## 10. Walk 3 — mid-operation interruption

**Scenario.** The process holding the authority is terminated part-way through an operation on the
category. The question is **what state is left behind**, and whether it is a state the system models.
Decided by the row's **Recovery** cell, with **Consistency** naming what a partial state would violate.

**The transactional premise this walk depends on, stated once.** Every durable-write outcome below that
says "the row is left at its last committed state" rests on Postgres's write atomicity, which is
readable and therefore not spiked. **What is *not* covered by it is a multi-statement operation whose
statements are not inside one transaction** — and `F-S6-2` records exactly such a hole:
`reviewPersistence` is **absent** from `UnitOfWorkPort`'s `TransactionPorts`
(`src/ports/unit-of-work-port.ts:26`–`:28`), so `SC-S3-3`'s read-compute-write is **not** wrapped. That
is named at `SC-S3-3` below rather than assumed away.

**And the liveness/containment distinction is honoured throughout.** `SPK-S2-1` measured a 1000 ms
same-thread guard armed before a non-terminating unit and found it **never fired** — the process needed
an external `SIGKILL` (exit 137). **An authoring-time bound is a liveness boundary, not containment.**
The complementary half — whether a *worker-thread* isolate is terminable mid-synchronous-CPU-loop — was
unreadable and material, so it was **measured**: `SPK-S14-1` (§14). Both are cited at the rows they
decide, and no interruption outcome below assumes a bound fires that was not shown to fire.

| Id | Defined outcome under mid-operation interruption |
| --- | --- |
| `SC-S3-1` | Row left at its last committed state. **No delete path exists in the repository**, so an interrupted authoring run leaves an orphan topic that only re-authoring resolves — no in-system remediation. |
| `SC-S3-2` | Last committed state. Chunks are deleted with their topic, so an interrupted partial insert leaves a topic with fewer chunks than intended — visible and re-runnable. |
| `SC-S3-3` | **The one durable row where the interruption outcome is not clean.** The read-compute-write has **no transactional envelope** (`F-S6-2`), so an interruption between the read and the write leaves the scheduling state **un-advanced while the attempt (`SC-S3-9`) may already be recorded** — a learner who answered and whose schedule did not move. The state is nonetheless **reconstructible in principle** by replaying `SC-S3-9` + `SC-S3-10` in order, which is exactly what NEU-844's snapshot quad exists for. Defined, and defective; the defect is `F-S6-2`'s, already routed. |
| `SC-S3-4` | Last committed state; the verdict is either present for its `contentVersion` or absent. Fully recomputable by re-running the audit — **loss is recoverable at cost, not fatal**. |
| `SC-S3-5` | **A non-terminal learning run persists indefinitely: there is no reaper in the inventory.** Combined with `F-S6-3` — the one-active-run rule is enforced only in application code across two round trips with no partial unique index — an interrupted run can block the learner's next run until a later write closes it. Defined, and it is a live operational hazard rather than a modelling gap. |
| `SC-S3-6` | Row left at its last committed state, which *"is a correct partial record"* — teaching progress up to the interruption is exactly what happened. |
| `SC-S3-7` | Last committed state; the status machine's states are all legal resting places, so an interrupted question is simply un-answered. |
| `SC-S3-8` | Written in the same transaction as `SC-S3-7`, so **a half-written mapping is unrepresentable**. |
| `SC-S3-9` | Last committed state. Either the attempt is recorded or it is not; the `SC-S3-11` trail means no revision is silently lost. |
| `SC-S3-10` | Present or absent — never partial. **Absent is permanent**: the scheduler state that produced the quad has since advanced, so an interrupted write leaves a permanent hole in the prediction record. Defined, and irrecoverable by design. |
| `SC-S3-11` | Append-only; an interrupted append leaves the trail short by one entry, and **the pre-revision values then exist nowhere else** — the same permanence as `SC-S3-10`. |
| `SC-S3-12` | Last committed state. The delete-and-re-add hazard of §9 becomes worse here: an interruption **between** the delete and the add loses the note outright, with no compare-and-set to detect it. |
| `SC-S3-13` | Last committed state. Expiry is evaluated **at read**, so an interrupted sweep leaves expired rows present-but-rejected — inert, not dangerous. |
| `SC-S3-14` | Last committed state. Loss is **not recomputable** — the labels are human judgement — so an interrupted bulk re-label leaves a partially-relabelled corpus that only a human can reconcile. |
| `SC-S3-15` | Last committed state; fully recomputable by re-running validation. Interruption costs a re-run. |
| `SC-S3-16` | **Lossy by design.** Entries buffered in `SC-S3-25` and not yet flushed are **lost**, and dropped outright while that sink's breaker is open. *"The log is evidence, not a ledger, and must not be treated as complete."* Defined — and the definition is that the record is incomplete. |
| `SC-S3-17` | Lossy on the same terms, and **it matters more here**: a gap biases the Tier-2 blocking statistics computed from it, **and the bias is silent**. Defined, and this is the most consequential interruption outcome in the inventory, because a gate reads it. |
| `SC-S3-18` | Lost on restart. Clients re-`initialize`; a reconnect, not data loss. |
| `SC-S3-19` | Lost on restart **together with `SC-S3-18`** — *"the session dies with it, so the binding and the thing it protects are lost atomically. That coupling is what makes the loss safe."* The single cleanest interruption outcome in the inventory. |
| `SC-S3-20` | Lost on restart, which **resets every learner's window to zero**. **A restart loop is a rate-limit bypass.** Defined, and a security-relevant consequence rather than a data one. |
| `SC-S3-21` | Re-derived after restart — so **a restart un-trips a tripped breaker**. Deliberate, and it makes restart frequency a hidden input to gate strictness. |
| `SC-S3-22` | Lost with the call, which is its whole lifetime. Nothing to recover. |
| `SC-S3-23` | Re-established on restart. **A pool exhausted or broken mid-life has no in-process reset path outside tests**, so recovery *is* the restart — an interruption is the remedy, not the problem. |
| `SC-S3-24` | Set once at boot; an interruption cannot leave it half-set. |
| `SC-S3-25` | **The mechanism behind two rows' lossiness**: unflushed entries are lost on crash and dropped while a breaker is open. Defined, deliberate, and the reason neither log is a complete record. |
| `SC-S3-26` | Re-fetched on restart. **An issuer outage during a cold start means no token verifies until it returns** — a defined, total, external-dependency failure mode, and the one place `Z-IDP`'s availability is this system's availability. |
| `SC-S3-27` | Re-initialised on restart; an interrupted first classification simply re-runs. |
| `SC-S3-28` | Nothing to interrupt — recomputed on the next call. |
| `SC-S3-29` | Nothing durable to interrupt. An interrupted aggregate is simply not returned; the torn-read hazard of §8 is a *successful* read's problem, not an interrupted one. |
| `SC-S3-30` | Nothing to interrupt — recomputed. |
| `SC-S3-31` | Last committed state. **Reconstructible only from `SC-S3-9` if the assessment events are themselves retained** — the retention condition is stated at the row, not assumed. |
| `SC-S3-32` | Last committed state; recoverable by re-import from the authoring source. |
| `SC-S3-33` | **Loss is safe by construction**: a lost cache degrades to *verdict absent*, which the disposition already handles by quarantining. An interruption therefore cannot produce an unsafe serve. This is the strongest argument for the cache being a separate category from `SC-S3-34`. |
| `SC-S3-34` | A re-check that cannot complete produces **`verdict stale` — a recorded state, never a partial verdict.** There is no half-written verdict to recover from. |
| `SC-S3-35` | A terminated or crashed run leaves the unit **without** a verdict, which `SC-S3-36`'s quarantine path already handles: **absence is a modelled state, so there is nothing to repair.** This outcome is exactly what `SPK-S14-1` was run to underwrite — see §14: a `worker_threads` isolate **was** terminable mid-synchronous-CPU-loop (5/5, 4–9 ms), so "a terminated unit produces no verdict" is measured rather than asserted. `SPK-S2-1` is cited alongside it: the **same-thread** authoring bound never fired, so the isolate is doing the work the timer cannot. |
| `SC-S3-36` | Last committed state, and **all three slots commit together**, so a half-written quarantine is unrepresentable. **An open quarantine is the safe state**, so an interruption that leaves one open is safe; the dangerous direction is loss-toward-closed. |
| `SC-S3-37` | An interrupted import leaves the last committed graph. **The whole-unit commit is what prevents a graph that never existed upstream**, and re-import from NEU-889's committed artifact restores it. |
| `SC-S3-38` | Last committed state. An interruption between the attempt and the progression advance loses the advance — the same non-transactional hazard as `SC-S3-3` — but it is **reconstructible from `SC-S3-31` if the evidence records are retained**, which is the argument for retaining them. |
| `SC-S3-39` | Last committed state. **Partly derived but persisted**, so it is reconstructible from `SC-S3-9` and `SC-S3-31` **only if those are retained across the full window the gate spans** — a stronger retention condition than `SC-S3-38`'s, and stated as such. |
| `SC-S3-40` | Append-and-supersede; an interrupted append leaves the prior version authoritative, which is correct. The register's authoritative copy is committed in NEU-887's package. |
| `SC-S3-41` | An interrupted derivation leaves no extract for that window, and **the window is re-derivable from `SC-S3-16`/`SC-S3-17` only while those rows still exist**. They have **no retention window** (`F-S3-3`), so today they always do. **If a retention window is ever added upstream, re-derivation stops being available and the extract becomes the record of last resort** — a conditional that must travel with the row. |
| `SC-S3-42` | Last committed state; loss re-starts the learner at hint level zero. Recoverable, mildly annoying, **not a correctness failure** — inside `A-25`'s envelope, which tolerates any number of escalation levels. Note this is a *different* question from §8.1's undefined one: **where the hint state lands is defined; what it means for mastery is not.** |
| `SC-S3-43` | Loss costs a re-orientation, nothing more — squarely inside `A-27`'s envelope (*"UI interaction state is not gate-bearing"*), whose invalidating outcome would be a gate that reads UI state. None does. |
| `SC-S3-44` | Last committed state. **Loss of the store means every envelope is unverifiable, which must fail closed** — the explicit opposite of `SC-S3-24`'s fail-open logging posture. Defined **as a requirement on a category that does not exist yet**; see §11. |
| `SC-S3-45` | **Not this system's to interrupt** — the authority is external and the mapping is authored upstream. What *is* this system's concern is that a projection failure **fails closed rather than defaulting to an unowned row.** Defined, by delegation plus a local obligation, and the delegation is named. |

**Walk 3 result: 45 of 45 rows produce a defined outcome; 0 undefined.**

Three of those defined outcomes are operational hazards rather than clean behaviours, and they are
listed here so a reader of the consolidated record (§15) does not have to re-read the table to find
them: **`SC-S3-5`** (no reaper — a permanently non-terminal learning run, interacting with `F-S6-3`),
**`SC-S3-20`** (a restart loop is a rate-limit bypass), and **`SC-S3-21`** (a restart un-trips a tripped
breaker). None of the three is a matrix defect — the matrix names all three correctly — so none is
routed to SUB-13. They are recorded as **consequences of the assignment**, which is what a validation
chapter owes its consumers.

---

## 11. Walk 4 — recovery

**Scenario.** After the interruption of §10, the category is brought back. The question is **from what**,
and **what the system is obliged to do if it cannot be**. Decided by the same **Recovery** cell read
forwards rather than backwards.

Five recovery classes cover all 45 rows, and every row is assigned to exactly one. The classes are the
result of the walk, not a taxonomy imposed before it.

| Class | Meaning | Rows | Count |
| --- | --- | --- | --- |
| **R1 — recovered with the database** | Durable, restored by a database restore, nothing further required | `SC-S3-1`, `2`, `5`, `6`, `7`, `8`, `9`, `12`, `13`, `31`, `32`, `36`, `38`, `39`, `42`, `43`, `44` | 17 |
| **R2 — recomputable** | Can be regenerated from inputs that survive | `SC-S3-3`, `4`, `15`, `28`, `29`, `30`, `41` | 7 |
| **R3 — re-established on restart** | Process-local; comes back by being rebuilt, and the rebuild is the design | `SC-S3-18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27` | 10 |
| **R4 — re-imported from an external source of truth** | Recovered from an artifact this system does not own | `SC-S3-33`, `34`, `35`, `37`, `40`, `45` | 6 |
| **R5 — not recoverable** | Once lost, gone; no input reconstructs it | `SC-S3-10`, `11`, `14`, `16`, `17` | 5 |

17 + 7 + 10 + 6 + 5 = **45**. Every row is classified; none is in two classes.

**R1 — recovered with the database (17 rows).** The outcome is uniform and uninteresting, which is the
point: a Postgres restore returns each row to its last committed state, and §10 established that every
such state is a legal resting place. Two rows carry a rider. **`SC-S3-5`** recovers into a
**non-terminal run** if it was interrupted mid-run, so recovery does not by itself clear the
`F-S6-3` interaction. **`SC-S3-44`** recovers only if the store survived; if it did not, §10's
fail-closed obligation applies and **every envelope is unverifiable** — recovery of the *store* is the
only recovery path, and there is no degraded mode.

**R2 — recomputable (7 rows).** `SC-S3-28`, `29` and `30` are recomputed on the next call and have no
recovery step at all. `SC-S3-4` and `15` recover by re-running their producer — **loss is recoverable at
cost**. `SC-S3-41` recovers by re-deriving from the logs, **conditionally**, per §10's retention rider.
`SC-S3-3` is the interesting one: it is R1 in practice (durable) and R2 in principle — *"reconstructible
by replaying `SC-S3-9` + `SC-S3-10` in order"*. It is classed **R2** here deliberately, because the
replay path is the only remedy for §10's non-transactional gap, and classing it R1 would hide that. **No
code implements the replay**; it is a property of the data, not a facility. Recorded as such rather than
presented as a recovery mechanism that exists.

**R3 — re-established on restart (10 rows).** The recovery is the restart, and for `SC-S3-23` the
restart is the *only* reset path outside tests. Three rows recover into a **materially different state**
than they left, and these are recovery outcomes, not merely interruption ones: **`SC-S3-20`** recovers
with **every window at zero**; **`SC-S3-21`** recovers **un-tripped**; **`SC-S3-26`** recovers only if
the issuer is reachable, and until it is, **nothing verifies**. Recovery here is not restoration — it is
re-initialisation, and the matrix says so.

**R4 — re-imported from an external source of truth (6 rows).** `SC-S3-37` is *"the only
`required-by-upstream` row with a trustworthy external source of truth"* — NEU-889's committed,
gate-verified artifact — and `SC-S3-40` recovers from NEU-887's package on the same terms. `SC-S3-33`,
`34` and `35` recover by **not needing to**: absence is a modelled state that the quarantine path
already handles, so the recovery obligation is discharged by the disposition rather than by a restore.
`SC-S3-45` is recovered upstream entirely; this system's only obligation is the fail-closed projection.

**R5 — not recoverable (5 rows), and this is the walk's most important result.** `SC-S3-10` and
`SC-S3-11` are permanently lost because the state that produced them has advanced — the audit trail's
whole purpose is to hold values that exist nowhere else. `SC-S3-14`'s labels are **human judgement**, so
recovery means re-labelling from scratch. **`SC-S3-16` and `SC-S3-17` are the ones that matter**: they
are not merely lossy on crash, they are **unrecoverable by construction**, because the only source that
could reconstruct them is themselves. And `SC-S3-17` is **read by a gate**. So the Tier-2 blocking
statistic is computed from a record that is silently incomplete and cannot be made complete — a
property the matrix states plainly and which no ownership decision, in any model, changes.

**Two rows must fail closed and one must fail open, and the contrast is deliberate.** `SC-S3-44` and
`SC-S3-45` **must fail closed** on a recovery failure — an unverifiable envelope and an unresolvable
owner are both isolation failures. `SC-S3-24` **must fail open** — a logging-sink misconfiguration falls
back to stderr and *"a logging outage never becomes a serve outage"*. The matrix gets both directions
right, and the pairing is worth stating because getting either backwards is a single-line change with
opposite consequences.

**A qualification that must travel with most of this walk.** Only **30** of the 45 categories are
`existing`. **11** are `required-by-upstream` (`SC-S3-31`…`SC-S3-41`) and **4** are `assumed`
(`SC-S3-42`…`SC-S3-45`, each `[unconfirmed]` and each carrying its own re-validation trigger). So the
fail-closed pair `SC-S3-44` / `SC-S3-45` are **assumed** categories and the whole R4 class except
`SC-S3-45` is `required-by-upstream`: **a recovery walk over these is a walk over a specification, not
over behaviour.** The fail-**open** counterpart `SC-S3-24` is the exception — it is `existing`, and its
stderr fallback is readable at `:247`–`:250`, so that half of the contrast is observed rather than
specified. Every outcome above that concerns a non-`existing` category is a **requirement this chapter
records as defined**, never a behaviour it claims to have seen. That is the same distinction §6 draws
for the `not-evaluable` rows, drawn the same way here on purpose.

**Walk 4 result: 45 of 45 rows produce a defined outcome; 0 undefined.**

---

## 11.1 The four walks, totalled

| Walk | Rows walked | Defined | Undefined | Routed to |
| --- | --- | --- | --- | --- |
| §8 Divergence | 45 | 44 | **1** — `SC-S3-42` | `F-S14-4` → NEU-891, SUB-16 |
| §9 Conflicting concurrent writes | 45 | 44 | **1** — `SC-S3-31` | `F-S14-5` → SUB-10 (NEU-984), SUB-16 |
| §10 Mid-operation interruption | 45 | 45 | 0 | — |
| §11 Recovery | 45 | 45 | 0 | — |
| **Total** | **180** | **178** | **2** | both routed, neither narrated |

**Both undefined outcomes are undefined for the same structural reason and it is not a matrix defect.**
Each is a cell where SUB-13 correctly recorded that the answer is **not determined by any merged input**
and **named the party that decides it** — NEU-891 for the hint/mastery rule, SUB-10 for the
assessment-record shape. A matrix that guessed at either would be worse. They are routed because OUT-3
requires a defined outcome and these two are not defined *yet* — **not because the matrix was wrong to
leave them open.** That distinction is carried into the finding text so SUB-16 dispositions them as
pending decisions rather than as defects.
