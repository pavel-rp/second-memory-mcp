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
