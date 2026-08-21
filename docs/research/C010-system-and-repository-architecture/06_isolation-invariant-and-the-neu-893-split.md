# 06 — The isolation invariant over the consumed identity placement, its threat cases, and the split with NEU-893

**Written by:** NEU-975 (SUB-5) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-4`
**Written:** 2026-08-21 · **Cutoff for every `src/` fact below:** 2026-08-21, on `origin/develop`
**Model:** claude-opus-5[1m]

**Depends on:** `04_state-category-inventory.md` (SUB-3, the 45 state categories this
invariant ranges over) and `05_system-context-and-responsibility-boundaries.md` (SUB-4, the
components, boundaries and flows it is evaluated against). Both merged.

---

## 0. What this chapter is, and the three things it deliberately does not do

This chapter states **one property** — the isolation invariant — in a form that can be
applied to a single state category and return a pass/fail without interpretation, walks the
two threat cases the consumed placement leaves open, and draws the line between what C010
closes and what NEU-893 owns.

It does **not**:

- **Re-decide where learner ownership lives.** That was decided by `NEU-850's OUT-2` and is
  consumed here as a constraint (§1). No placement trade study is run, and none is implied
  by anything below.
- **Apply the invariant to each row of the authority matrix.** That is `SUB-14 (NEU-978)`'s
  work, and the matrix it applies to does not exist yet (`SUB-13 (NEU-977)`). §3.6's worked
  cases are demonstrations that the procedure **terminates**, deliberately hand-picked to
  reach different verdicts — they are not a census, and §3.7 says exactly what they do and
  do not establish.
- **Price the compatibility change or audit the tool surface item by item.** §6 hands
  `SUB-8 (NEU-981)` the obligation and the blast radius; the pricing and the per-item
  regression audit are SUB-8's.

Two notes on reading. First, **`SUB-13` is `NEU-977`.** A merged sibling writes `NEU-987`
for it in thirteen places across six files; `F-S3-2` records each with its line, and `05_…`
§12 states that `NEU-987` is not a child of this charter at all. **This paragraph is the only
place `NEU-987` appears in this chapter, and every occurrence in it names the id as wrong** —
outside this paragraph, every reference to SUB-13 reads `NEU-977`.
Second, per `00_method-and-provenance.md` §4, *JWT
subject* below always means the OIDC `sub`/`azp`-derived principal, never a *chunk subject*;
*learning session* means a bounded learning run (`SC-S3-5`), never an *MCP session*
(`SC-S3-19`'s transport-level session) — the distinction does real work in §4.2.

---

## 1. The consumed placement constraint

### 1.1 What was decided, and by whom

**`NEU-850's OUT-2`** decided that learner ownership lives in **the MCP core database
schema, keyed to the JWT subject**: a `user_id` column, `NOT NULL`, on every core table, with
the JWT subject threaded through the row-owning repository ports rather than resolved
ad hoc at each call site.

**Source and its date.** C010's intake Q6 and a tracker read of NEU-850 on **2026-08-19**,
carried as charter assumption 24 and labelled `confirmed`. The substance is reproduced here
rather than pointed at, because **there is no NEU-850 package under `docs/research/`** — its
charter lives in `docs/wf-plans/`, which is gitignored (`.gitignore:78`, with two tracked
exceptions at `:79`–`:80` that do not include it). Under the standalone rule
(`00_method-and-provenance.md` §3) a published file may not require a reader to open that
tree, so the constraint is carried in and the pointer is dropped.

### 1.2 The status label that changes how it must be read

`NEU-850's OUT-2` is **converged but unimplemented**. It is a decision to honour, **never an
existing schema fact**. Everything in this chapter that reads as though ownership exists is
either explicitly conditional ("under the target state…") or is a statement about what the
invariant *would* return once the change lands.

The corresponding fact about the tree, verified at this chapter's own cutoff: **there is no
ownership, tenancy or principal column anywhere in `src/` or `drizzle/`** (§7). The two
statements are consistent — one is a decision, the other is the tree it has not reached yet.

### 1.3 What this chapter takes from it, and what it adds

It takes the **placement** and treats it as settled. It adds the **property** that placement
is in service of. Those are different things, and §3.6's `SC-S3-5` case is the demonstration
that they are: a category can satisfy the placement in full and still fail the invariant.

---

## 2. The amendment disposition

The consumption right is bounded: where this package's own evidence **actively contradicts**
the consumed constraint, a recorded amendment is routed to NEU-850 through its `OUT-1`
execution-time drift check, naming the contradicting evidence. Silent divergence and
preference-based re-decision are both forbidden, and so is leaving the question open.

### **No amendment is routed.**

Two candidates were examined against the bar and both fell short of it. They are recorded
here rather than dropped, because "no amendment routed" is worth much less if nobody can see
what was tested.

**Candidate A — the two operational log tables are behind no repository port, so OUT-2's
stated mechanism cannot reach them.** `infrastructure.mcp_request_log` (`SC-S3-16`) and
`infrastructure.operation_event_log` (`SC-S3-17`) are created by raw SQL migrations and
written from the pino transports (`src/transport/pg-audit-transport.ts:117`,
`src/transport/pg-event-transport.ts:109`), not through any of the 13 ports. OUT-2 threads
the JWT subject *through the row-owning repository ports*; that mechanism has no path to
either table.

**Rejected as an amendment.** This is a **scope question** — what OUT-2's "every core table"
ranges over — and not a contradiction of what OUT-2 decided. A constraint whose stated
mechanism does not reach two tables is under-specified at its edge, not wrong at its centre.
Routing an amendment on it would spend the bounded right on a clarification. It is filed
instead as **`OI-S5-1`**, owned by NEU-850 through its `OUT-1` drift check, with NEU-893 and
`SUB-12 (NEU-986)` as consumers.

**Candidate B — the placement is insufficient for isolation.** §4.3's result is that the full
OUT-2 change lands and **no state category reaches `holds`**, because the binding constraint
is the transport rather than the database schema.

**Rejected as an amendment.** OUT-2 decides *where ownership lives*. "Necessary but not
sufficient" is not a contradiction of a placement decision — it is a statement about what
else must be true, and every one of those things is on NEU-893's list (§5.3). Amending OUT-2
on this basis would be re-deciding placement under the guise of extending it.

**What would have cleared the bar**, recorded so the disposition is falsifiable: evidence
that the JWT subject is **not** a viable ownership key — for instance, that it is not stable
across a learner's sessions, or that the row-owning ports cannot carry it. Neither was found.
The nearest thing to it is `OI-S1-2`, which says the subject may not identify a *human* —
and that is a threat case for the invariant (§4.1), not a refutation of the key.

---

## 3. The isolation invariant

### 3.1 The property

> **For every state category, every read and every write of that category that a request can
> cause is confined to the instances owned by the request's authenticated principal — and
> that confinement is decided by the server, from state the server holds, identically on
> every transport.**

Stated as prose this is a principle, and a principle is not what SUB-14 can use. The rest of
§3 is the same property written as a **decision procedure**: a named evaluation domain, an
ordered finite set of checks each answerable from a cited artifact, and a closed verdict set
in which every category lands in exactly one place.

### 3.2 The evaluation domain

**One `SC-S3-*` row of `04_state-category-inventory.md` §3.** The domain is the 45 entries
`SC-S3-1` … `SC-S3-45` — 45 is the correct figure and §3's "41 entries" heading is stale
(`F-S4-2`).

The unit matters: the invariant is evaluated **per state category**, not per table, per tool
or per endpoint. One table can carry three categories (`learning_chunks` carries `SC-S3-2`,
`SC-S3-3`, `SC-S3-4`) and they can reach different verdicts.

**Evaluation is against a stated target state.** Three forms are legitimate:

- **(a) As it stands** — the system at a named cutoff.
- **(b) Assigned** — the category's row plus a named ownership assignment (SUB-13's matrix,
  once it exists).
- **(c) Composed** — (a) or (b) **plus an explicitly enumerated set of outstanding changes
  assumed landed**. A composed state must list them; "assume isolation is implemented" is not
  a target state and an evaluation against it is void.

What is never legitimate is leaving the form unstated, because **the same category returns
different verdicts under each** — `SC-S3-13` is `not-evaluable` under (a) and
`fails-transport` under the composed state §3.6 case 4 names. Every application below states
its form and, for (c), enumerates what it assumes. A verdict quoted without its target state
is not a result.

### 3.3 The checks, in order

| # | Check | Answered from |
| --- | --- | --- |
| **I1** | **In domain.** Is the category learner-scoped? | `04_…` §3, the `Learner-scoped` column, read off the row. |
| **I2** | **Principal attribution.** Does every instance of the category resolve to exactly one authenticated principal, expressed as a value the server holds? | The `Store` column plus the schema or migration it cites; or a named server-held mapping. |
| **I3** | **Confinement.** Is that principal a predicate on **every** read path and **every** write path that reaches the category, enforced at or below the port boundary? | The category's **enumerated access-path set**, where one exists. Where it does not, the `Store` and `Lifecycle` columns and `05_…` §5's flow rows bound the paths **from below** — see §3.4.1: enough to fail I3, never enough to pass it. |
| **I4** | **Transport invariance.** Does I3's enforcement hold identically on **both** transports — does it depend on nothing mounted on only one of them? | `05_…` §4.2's boundary rows, plus the transport wiring in `src/transport/`. |
| **I5** | **Principal integrity.** Is the principal server-derived rather than caller-asserted, **and** is its *kind* determined rather than assumed? | The identity-resolution site, plus any open item recording what is unverified about it. |

**I1's rule, stated so it cannot be used as an escape hatch:** a row whose `Learner-scoped`
cell reads **`question — open`** is **in domain**. Only an explicit `no` takes a category out.

**The census of that column, re-counted at this chapter's own cutoff** by parsing the
`Learner-scoped` cell of all 45 rows of `04_…` §3 (method and figure in §7, row 13):

| `Learner-scoped` cell | Rows | I1 |
| --- | --- | --- |
| explicit `no` | **19** | out of domain → `not-applicable` |
| `question — open` | **18** | **in** domain |
| explicit `yes` | **8** | in domain |
| **Total** | **45** | **in-domain: 26** |

So the rule is not academic: **18 of the 26 in-domain categories would exempt themselves by
default** if an unanswered question counted as a `no`, and the invariant would be satisfiable
by declining to answer — which is precisely backwards. §6 of `04_…` states the discipline this
rests on: the column holds a question per entry, never a schema fact.

### 3.4 The verdict set and the adjudication rule

**Closed set of six.** Every category lands in exactly one.

| Verdict | Meaning |
| --- | --- |
| `not-applicable` | I1 answered `no`. The category is learner-independent by construction; the invariant makes no claim about it. |
| `not-evaluable` | In domain, but I2 fails. **The strongest failure**: the remaining checks have nothing to run against. Distinct from failing, and reported distinctly. |
| `fails-confinement` | I3 fails. A principal exists; it is not a predicate on some access path. |
| `fails-transport` | I4 fails. Confinement is real on one transport and absent on the other. |
| `fails-principal` | I5 fails. Confinement is per *authenticated principal*, but the principal is caller-asserted or of undetermined kind. |
| `holds` | All five pass. |

**The adjudication rule: run the checks in order; the first failing check names the verdict;
stop there.** This single rule is what makes the procedure produce *one* answer rather than a
set of them, and it is why the checks are ordered rather than merely listed. Two people
applying it to the same row with the same stated target state get the same verdict or one of
them made an error that can be pointed at.

**Why `not-evaluable` is separated from `fails-*`.** `SC-S3-16` and `SC-S3-17` store learner
payload that cannot be attributed to any learner at all. Collapsing that into "fails" would
report them as broken confinement, when the truth is that there is nothing to confine
*against* — no question about those categories can be answered, including whether they are
already leaking. That distinction is the whole reason `F-S3-3`'s deletion-owner gap and
`CAP-S4-1`'s structurally-unassignable owner exist, and it survives into this chapter
(§3.6, case 2) rather than being flattened by the verdict set.

### 3.4.1 One asymmetry, stated rather than left for a reader to trip over

**I3 is not symmetrically decidable, and I1, I2, I4 and I5 are.**

I1, I2, I4 and I5 each read a bounded artifact — a table cell, a schema, a transport wiring, an
identity-resolution site — and answer in both directions. **I3 asks a universal question**
("is the principal a predicate on *every* path?"), so it can be **failed** from a single
counter-example — one unscoped call site, as in §3.6 case 3 — but it cannot be **passed**
without an exhaustive set of the category's access paths. `04_…` §3's `Store` and `Lifecycle`
columns are a schema line and a lifecycle sentence, not a call-site enumeration, so they bound
the paths from below and no further.

**The consequence, and the rule that follows from it:**

- A verdict of `fails-confinement` is **sound** from any single unscoped path. Nothing more is
  needed and none of the five worked cases needs more.
- A verdict of `holds` requires an **enumerated access-path set** for the category. Until one
  exists, I3 must return `fails-confinement` or the evaluation must stop — **it may not return
  `holds` by failing to find a counter-example.** Absence of a found unscoped path is not
  evidence of absence.

**Who owes the enumeration:** `SUB-13 (NEU-977)`'s authority matrix is the natural carrier —
a category with exactly one authority has a bounded write set by construction — but the matrix
does not oblige itself to enumerate *read* paths, and I3 covers both. This is recorded as a
precondition on the first `holds` verdict rather than as a defect in the procedure, and it is
one of the reasons `CAP-S5-1` states that satisfiability is untested.

**In practice this is currently inert**, and it is worth saying why so nobody over-reads it:
§4.2 establishes that every in-domain category fails **I4**, which is evaluated *after* I3 only
in the sense that I3 comes first — and at this cutoff I3 already fails or is unreachable for
every in-domain category anyway. The frontier sits at I2 and I4, where determinacy is complete.
The asymmetry becomes live only when someone is in a position to claim a `holds`, which is
exactly when it must not be discovered for the first time.

### 3.5 The ordering carries information beyond the verdict

The first failing check names **the owner of the next piece of work**, and it does so
consistently:

| First failing check | What must change | Whose |
| --- | --- | --- |
| I2 | An ownership key on the store | `NEU-850's OUT-2` (§1) |
| I3 | The query bodies and the port signatures that reach the category | `SUB-8 (NEU-981)`'s blast radius (§6) |
| I4 | An identity gate on the transport that has none | NEU-893 (§5.3) |
| I5 | The principal's kind determined at resolution | NEU-893, against `OI-S1-2` (§4.1) |

This is a property of the ordering, not a coincidence: the checks are ordered by what each
one presupposes, and the work is ordered the same way because it is the same dependency.
§5's two-list contract falls out of this table rather than being drawn up by hand — which is
what makes its disjointness structural (§5.1).

### 3.6 Worked applications — five categories, five verdicts

Each case names its target state, walks the checks in order, and stops at the first failure.

---

**Case 1 — `SC-S3-37`, DP-map node and prerequisite-edge records.** Target state: the system
as it stands, 2026-08-21.

- **I1.** The row's `Learner-scoped` cell reads **`no` — the graph is learner-independent by
  construction** (`04_…:173`; the hand-on table repeats it at `:373`). Explicit `no`, not an
  open question.

**Verdict: `not-applicable`.** The invariant makes no claim about the static DP graph. Note
what this does *not* extend to: `SC-S3-38`, the per-learner position against that graph, is a
separate category, and the split between them is NEU-889's own, consumed rather than invented
(`04_…:376`–`:379`). Exempting `SC-S3-37` exempts nothing else.

---

**Case 2 — `SC-S3-16`, the MCP request log.** Target state: the system as it stands,
2026-08-21.

- **I1.** `Learner-scoped: question — open` → in domain (§3.3's rule). The row records that
  it **holds learner payload**: `response_body` and `params` carry learner-facing text and
  learner free-text answers.
- **I2.** The table has **no principal field**. Created `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`–`:15`,
  extended `drizzle/0012_extend_mcp_request_log.sql:1`–`:3`; neither adds one. There is no
  server-held mapping from a log row to a principal either — the correlation id and session
  id it does carry are transport-level, and the one identity binding that exists
  (`SC-S3-19`) is dropped with the transport.

**Verdict: `not-evaluable`.** No question about this category's isolation can be answered,
in either direction. This is the same underlying gap `F-S3-3` records from the retention
direction and `CAP-S4-1` records as a structurally unassignable deletion owner; **this
chapter neither closes nor re-files it** — it establishes that the gap has a second,
distinct consequence. A category that cannot be attributed cannot be deleted for one learner
*and* cannot be shown to be confined to one. `SC-S3-17` walks identically.

---

**Case 3 — `SC-S3-5`, the learning-session record.** Target state: **`NEU-850's OUT-2`
implemented in full** — `user_id NOT NULL` on `public.learning_sessions`, threaded through
the row-owning repository ports.

- **I1.** `question — open` → in domain.
- **I2.** Under the target state the column exists and every row resolves to one principal.
  **Passes.**
- **I3.** It does not. `getActiveSession()` carries **no scoping predicate**
  (`src/adapters/drizzle/session-repository.ts:73`–`:80`) — it reads the active learning
  session globally. And the guard that encodes single-learner behaviour today is **not** in
  the adapter at all: `createSession` (`session-repository.ts:37`–`:66`) contains no such
  check; the rejection is in orchestration, at
  `src/orchestration/session-workflows.ts:39`–`:46`, which calls `getActiveSession()` and
  fails the request if *any* active learning session exists. Adding a column changes neither
  the unscoped read nor the global guard.

**Verdict: `fails-confinement`.**

**This case is why §1.3 draws the line it does.** The placement is satisfied in full and the
category is still not isolated. It is also the reason I3 requires enforcement **at or below
the port boundary**: the guard at `session-workflows.ts:39`–`:46` sits *above* it, so a
mechanism that scopes the ports leaves that guard untouched — and it is precisely the guard
that makes the system single-learner. Filed as **`F-S5-2`**, and it lands directly on
`A-28`'s tolerance envelope, which assumes enforcement at or below the port boundary.

---

**Case 4 — `SC-S3-13`, context tokens.** Target state: `NEU-850's OUT-2` implemented, and the
context-token gate treated as the confinement mechanism for the category it gates.

- **I1.** `question — open` → in domain. The row states plainly that **the table carries no
  authenticated subject** (`public.context_tokens`, `src/infrastructure/db/schema.ts:312`–`:321`
  — `id`, `createdAt`, `expiresAt`, and nothing else).
- **I2.** Under the target state a principal column exists on the table. **Passes.**
- **I3.** Under the target state the token is bound to the principal at mint time and checked
  at use. **Passes**, conditionally on that being how it is built.
- **I4.** It does not hold. The gate is HTTP middleware — mounted at
  `src/transport/http.ts:185`–`:187`, with its exempt-tool bypass at
  `src/transport/context-token-middleware.ts:55`–`:59` — and the STDIO path
  (`src/transport/main.ts:55`–`:59`) mounts nothing. The confinement depends on a component
  that exists on one transport only.

**Verdict: `fails-transport`.** Note the shape of the finding: the gate is **middleware, not
a schema fact**, so no amount of work on the database schema moves this verdict.

---

**Case 5 — `SC-S3-3`, per-chunk SM-2 scheduling state.** Target state: `NEU-850's OUT-2`
implemented, every reaching query scoped at the port boundary, **and** an identity gate
present on both transports — i.e. I1–I4 all discharged. This is a **conditional** case: it
evaluates a state nobody has built, and it is included because I5 is otherwise unreachable
today (§3.7).

- **I1.** `question — open` → in domain. **I2, I3, I4.** Pass by construction of the target
  state.
- **I5.** Fails. The authenticated principal is resolved at
  `src/transport/jwt-middleware.ts:127` as
  `const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;` —
  one opaque string that **carries no record of which claim it came from**, assigned to
  `res.locals.auth` at `:133`–`:136`. Nothing downstream re-derives the distinction, so the
  principal's *kind* — human learner or OAuth client — is not determined anywhere in the
  system. `OI-S1-2` records that the production case is unverified.

**Verdict: `fails-principal`.** Walked in full at §4.1.

---

### 3.7 What §3.6 establishes, and what it does not

**Establishes:** the procedure terminates on a real row of a real inventory, and it reaches
five different verdicts on five categories — so the verdict set is not decorative and the
ordering is doing work.

**Does not establish** three things, each stated so nobody downstream reads more into it:

1. **It is not a census.** The verdict distribution over all 45 rows is `SUB-14 (NEU-978)`'s
   to produce, against `SUB-13 (NEU-977)`'s matrix. Five categories were chosen *because*
   they reach different verdicts; that is a sampling designed to exercise the procedure, and
   it is the opposite of representative.
2. **No case reaches `holds`.** Not one. Case 5 is conditional on a state nobody has built,
   and it still fails. Filed as **`CAP-S5-1`**: this chapter establishes the invariant is
   well-formed, never that it is **satisfiable**. Nothing available here could establish the
   latter, because doing so needs a schema change, scoped query bodies and a transport gate,
   and no C010 sub-task makes any of them.
3. **The procedure is unexercised against a real matrix.** The target state in cases 3–5 is
   named by this chapter, not read from SUB-13's authority assignment, because that
   assignment does not exist yet. Filed as **`OI-S5-3`**, resolving when SUB-14 publishes.

---

## 4. The threat walk

### 4.1 The `sub`-versus-`azp` conflation

**The mechanism.** `src/transport/jwt-middleware.ts:127` resolves the authenticated subject
as `payload.sub || azp`. Under an OAuth **client_credentials** grant there is no human
behind the token and Rauthy sets `sub` to null, so `azp` — the OAuth **client id** — becomes
the authenticated subject. The deployment's own smoke tests use exactly that grant. The
resolved value is written to `res.locals.auth` (`:133`–`:136`) and consumed in exactly two
places: the rate-limit key (`src/transport/rate-limit-middleware.ts:76`–`:77`) and the MCP
session-binding map (`src/transport/http.ts:32`–`:35`, `:52`–`:72`, `:83`, written
`:206`–`:209`). It reaches **nothing else** — `sub` has zero occurrences in
`src/orchestration/`, `src/ports/` and `src/adapters/` (§7).

**Walked against the invariant** (Case 5, §3.6): a category that has cleared I1–I4 reaches
I5, and I5 returns **`fails-principal`**, because the resolved value is a single opaque
string that does not record its own provenance and nothing downstream re-derives it.

**The outcome, stated — this is what the invariant *means* in that case, not an assumption
about it.**

The invariant does **not** assume a human learner. It confines state per **authenticated
principal**. Where the principal is an OAuth client, the consequences are two, and they are
different from each other:

1. **The invariant still holds as a property** — per-principal confinement is well-defined
   whether the principal is a person or a client. It simply is not per-*learner* confinement.
2. **Per-learner confinement is not achieved**, and the failure is invisible to every other
   check. Two humans behind one client_credentials client collapse to **one** principal — so
   `user_id NOT NULL` is populated, every query is scoped, both transports are gated, and
   their state is still shared. This is the case an isolation mechanism can pass its own
   tests on and be wrong about.

**Residue.** `OI-S1-2` — that the production learner flow may yield a non-human subject — is
**carried forward, not closed here.** No live production token was inspected by this
sub-task; nothing in this package can inspect one. It is named as an input NEU-893 must
confirm before its identity mapping is sound, which is also how `README.md`'s hand-on section
already frames it. This sub-task records its disposition in its own section of
`90_…` per the `OI-S1-1`/`OI-S3-2` precedent, and does not edit SUB-1's entry.

**The shape of the remedy is stated; the remedy is not decided here.** For I5 to be
*answerable* at all, the resolved identity must carry its provenance — which claim it came
from — rather than collapsing to one string. Whether a principal of kind `client` is then
rejected, mapped, or admitted as a service principal with no learner state is NEU-893's
decision. Filed as **`OI-S5-2`**.

### 4.2 The unauthenticated STDIO path

**The mechanism.** `src/transport/main.ts:55`–`:59` connects a bare `StdioServerTransport`.
Every protection in the system is HTTP-only and reached only from `main.ts:46`–`:54`: JWT
verification (`src/transport/http.ts:163`–`:165`), the origin check (`:106`–`:120`), the rate
limiter (`:172`–`:174`), and the context-token gate (`:185`–`:187`). `05_…` §4.2 classifies
this as **`BND-S4-17`** — a trust boundary that meets the test and that **nothing enforces**,
with owner recorded as **`nobody`**.

**Walked against the invariant.** I4 asks whether I3's enforcement holds identically on both
transports. On STDIO the question does not even reach the enforcement: **no principal is
produced at all.** `res.locals.auth` is a property of an HTTP response, and on STDIO there is
no HTTP response. So for every in-domain category, whatever I3 establishes on HTTP, **I4
fails on STDIO** — and by the first-failure rule the category's verdict is at best
`fails-transport`.

**The outcome, stated.**

**At this cutoff no state category can reach `holds`, and the binding constraint is the
transport, not the database schema.** This is the sharpest thing in this chapter and it is
worth being precise about why: the full `NEU-850's OUT-2` change — `user_id NOT NULL` on
every core table, threaded through all nine row-owning repository ports — still leaves every
in-domain category at `fails-transport`, because **a column cannot supply a principal the
transport never produced.** Schema work is necessary and is not sufficient, and the STDIO
gate is on the critical path rather than beside it. Filed as **`F-S5-4`**.

**Two things this does not license.**

- It does not license treating STDIO as safe because nothing has gone wrong. `F-S4-5` records
  that all three dogfooded benchmark journeys are walked across STDIO — so the evidence base
  for the system working is evidence from the **ungated** path. "The journey ran fine" says
  nothing about the gated path, and a green benchmark across STDIO is not a signal about
  isolation in either direction.
- It does not license this chapter deciding whether the unenforced edge is *reachable* in the
  production deployment. That is a deployment-shape question and it is `SUB-10 (NEU-984)`'s
  (§5.4). The invariant's answer is unconditional on it: a transport that produces no
  principal fails I4 whether or not anyone can currently reach it.

### 4.3 The two cases together

They fail at **different checks**, and the order matters. STDIO fails I4, which comes first,
so today it **masks** the `sub`/`azp` case entirely: I5 is unreachable while any in-domain
category fails I4. Closing the STDIO gap does not therefore make the system isolated — it
makes the `sub`/`azp` defect *visible*, by advancing the frontier from I4 to I5.

That is a scheduling consequence worth stating plainly for NEU-893: **the two are sequential,
not parallel, and fixing the first surfaces the second.** A rollout that treats the STDIO gate
as the last item will discover the principal-kind problem at the end.

---

## 5. The two-list contract with NEU-893

### 5.1 How the universe is derived

The universe is not a list drawn up by taste. It is **every question that must be answered
before a state category can reach verdict `holds`** — which makes it mechanically derivable
from §3.3's five checks, and makes the disjointness in §5.5 structural rather than asserted.

**One boundary must be stated explicitly, or the "none on neither" count is vacuous.** The
universe covers the questions the **C010 / NEU-893 split** ranges over. Questions owned by a
sibling C010 sub-task, or by a party outside this charter entirely, are outside it by
construction — and §5.4 names each one with its owner rather than letting it drop silently.
The audit therefore reports **three** counts, not two.

### 5.2 List A — closed by C010, in this chapter

| # | Question | Where it is closed |
| --- | --- | --- |
| **C1** | Where does learner ownership live? | §1 — consumed from `NEU-850's OUT-2`, recorded, not re-argued. |
| **C2** | What property must a state category satisfy to be isolated? | §3.1, §3.3 — the statement and checks I1–I5. |
| **C3** | What is the evaluation domain, and what is the unit of evaluation? | §3.2 — one `SC-S3-*` row of the 45. |
| **C4** | How is a category judged, and what may the answer be? | §3.4 — ordered, first-failure-wins, six closed verdicts, exactly one per category. |
| **C5** | Is an ownership column sufficient for isolation? | §3.6 case 3 — no. I3 is independent of I2, demonstrated on `SC-S3-5`. |
| **C6** | May enforcement live above the port boundary? | §3.6 case 3 — no. I4 requires transport invariance; `session-workflows.ts:39`–`:46` is the counter-example. |
| **C7** | May a category be exempted by leaving its scoping question open? | §3.3 — no. `question — open` is in domain; only an explicit `no` exempts. |
| **C8** | What does the invariant mean when the authenticated subject is an OAuth client rather than a human? | §4.1 — I5, verdict `fails-principal`; per-principal confinement holds, per-learner confinement does not. |
| **C9** | What does the invariant mean on a transport that mounts no gate? | §4.2 — I4, verdict `fails-transport`, unconditional on reachability. |
| **C10** | Is an amendment routed against `NEU-850's OUT-2`? | §2 — no amendment routed, with both examined candidates and the bar recorded. |

**Count: 10.**

### 5.3 List B — handed to NEU-893

| # | Question | Why it is NEU-893's | Carried input |
| --- | --- | --- | --- |
| **H1** | Identity mapping to the production Rauthy IdP. | Charter assumption 3: this package decides the invariant, NEU-893 the mechanism. | `OI-S1-2`, `OI-S5-2` |
| **H2** | Migration of the existing global rows. | Same. Every row today is unowned (§7). | §7's zero-ownership-column fact |
| **H3** | Staged rollout. | Same. | §4.3's sequencing consequence |
| **H4** | Rollback. | Same. | — |
| **H5** | Does the production learner flow yield a human `sub`? | The answer C8 is conditional on. Needs a live production token; nothing in this package can inspect one. | `OI-S1-2` |
| **H6** | Will the resolved identity carry its `sub`/`azp` provenance, so I5 is answerable at all? | The design obligation behind H5's fact. | `OI-S5-2` |
| **H7** | An identity gate on the transport that has none, so I4 can pass on both. | `BND-S4-17`, owner `nobody`. The isolation **mechanism** on the transport is squarely the mechanism half. | `F-S4-5`, `F-S5-4` |
| **H8** | Where the enforcement is mechanically implemented, at or below the port boundary. | C6 states the *requirement*; the mechanism satisfying it is NEU-893's. | `A-28`'s envelope, `F-S5-2` |

**Count: 8.** H1–H4 are the four the charter names for NEU-893; each appears here exactly
once and on this list only.

### 5.4 Routed elsewhere — outside the two-list universe, each named

Recorded so that "none on neither" is a real result rather than an artefact of a
conveniently-drawn boundary.

| Question | Owner | Why it is not on either list |
| --- | --- | --- |
| The per-row `Learner-scoped` answers for the 18 rows reading `question — open` | `SUB-13 (NEU-977)`, `OI-S3-1` | An input to I1, not a question about the invariant or the mechanism. |
| Applying the invariant to each matrix row | `SUB-14 (NEU-978)` | Explicitly out of this sub-task's scope; also `OI-S5-3`. |
| Pricing the semantics of reusing or widening `context_token`; the per-item regression audit; the decision on the 3 exempt tools | `SUB-8 (NEU-981)` | §6 hands over the obligation and radius; the pricing is SUB-8's. |
| Whether the unenforced STDIO edge is reachable in the production deployment | `SUB-10 (NEU-984)` | Deployment shape. §4.2 states the invariant's answer is unconditional on it. |
| The operational logs' retention window and deletion owner | `CAP-S3-3`, `CAP-S4-1`; `SUB-12 (NEU-986)` at the completeness gate | A privacy-gate question, not an isolation question. §3.6 case 2 states the isolation-side consequence (`not-evaluable`) and closes nothing else. |
| Whether OUT-2's "every core table" ranges over the two port-less log tables | NEU-850, via its `OUT-1` drift check; `OI-S5-1` | A scope question about the consumed constraint, owned by its author (§2). |
| Whether a second writer of learning state exists at all | `SUB-6 (NEU-976)`, `BND-S4-16` | The ownership-model selection precedes the isolation mechanism; `F-S4-4` records what it moves. |

**Count: 7.**

### 5.5 The disjointness audit, as counts

| Measure | Count |
| --- | --- |
| Universe — questions gating a `holds` verdict, within the C010 / NEU-893 split | **18** |
| On List A (closed by C010) | **10** |
| On List B (handed to NEU-893) | **8** |
| **On both lists** | **0** |
| **On neither list** | **0** |
| Routed elsewhere, outside the split's universe, each named with its owner (§5.4) | **7** |
| NEU-893's four charter questions, each appearing on List B exactly once | **4 / 4** |

10 + 8 = 18, and 18 = the universe, so the two counts of 0 are arithmetic rather than
assertion. The audit was run by walking §3.3's five checks and asking, for each question each
check generates, which list it lands on — the derivation in §5.1, applied.

**One caveat on how much those two zeros prove, stated where a reader stops rather than only
in the decision record.** Because the universe *is defined as* List A ∪ List B, "on neither"
cannot come out non-zero — the zero is **definitional, not empirical**. What is genuinely
checkable, and what was checked, is three things: that no question sits on two lists; that
every question the five checks generate was assigned somewhere; and that the seven questions
falling outside the split are **named with their owners** in §5.4 rather than disappearing.
The protection against a question being lost is §5.4's enumeration, not the `0`. If
`DR-C10-S5-1`'s check set is missing a failure mode, this contract inherits the gap in exactly
the same place and the audit still reports 0 and 0 — a cost recorded in `DR-C10-S5-2`'s
Consequences.

---

## 6. What `SUB-8 (NEU-981)` inherits: the obligation and the blast radius

This section hands over two things and runs no audit.

### 6.1 The obligation

Any core change made in service of the invariant must be **reusable** (not one caller's
private hook), **backward-compatible** (existing callers keep working), **non-DP-specific**
(the DP work is one consumer, not the reason), and it **must hold across both transports,
including STDIO, which has no auth**. The last clause is not decoration: §4.2 is the
demonstration that a change satisfying the first three and not the fourth leaves every
category at `fails-transport`.

### 6.2 The narrow part — the tool surface

Counted against `src/` at this chapter's own cutoff, per `CAP-S1-2`'s re-verification
obligation, and reconciled against `F-S4-1` rather than inherited from the charter (§7):

- **46 registered tools** across **16** registering modules; **43 gated / 3 exempt**.
- **All 43 gated tools already declare `context_token`** — **42** through a named
  `*InputShape` constant (41 imported from `src/domain/types/`, and one declared
  module-locally: `GetHistoricalFeedbackInputShape` at
  `src/server/session-progress-tools.ts:128`–`:138`, `context_token` at `:131`, consumed at
  `:153`), and exactly **one genuinely inline** — `teach_next`, whose `inputSchema:
  z.object({` opens at `src/server/teaching-tools.ts:34` with `context_token` at `:35`.

**Therefore, if identity is carried per call, zero tool input schemas would newly declare it,
and no bulk schema migration is implied.** The right way to hold that claim is
**count-independently**: the load-bearing fact is that the set of gated tools *lacking*
`context_token` is **empty**, and that is stable under the count moving again — which
`F-S4-1` says it will. The charter's 45/42/40 figures are stale in all three positions
(`F-S5-3`); SUB-8 should re-run the count at its own cutoff rather than cite 45, 46, or any
number in this document.

What is left for SUB-8 on this surface is not a migration but a **semantic** question: what it
means to reuse or widen an argument that is already declared **required on every gated call**.
And separately, the **3 exempt empty-schema tools** — `init_agent_context`, `get_server_info`,
`get_server_workflow`, fixed at `src/transport/context-token-middleware.ts:5`–`:9` and
declared with the only three `z.object({}).shape` in `src/server/*-tools.ts`
(`server-context-tools.ts:21`, `server-info-tools.ts:13`, `server-workflow-tools.ts:15`) —
are a **separate decision**, not a rounding error on the 43.

### 6.3 The wide part — the layer above

| Surface | What changes, and the fact that sizes it |
| --- | --- |
| **`AppContext`** | **One** frozen instance, `src/composition-root.ts:136`–`:314` (the type), built at `:518`–`:636`, `Object.freeze` at `:638`, created once at `src/transport/main.ts:41`, and **reused for every MCP session** at `src/transport/http.ts:220`. **57 top-level properties, 53 of them arrow-function closures**, and **no** auth, principal, subject or identity field anywhere in it. The blast-radius fact is the **sharing**, not the count: a per-principal context cannot be a field added to a singleton built once at boot. (`F-S5-1`) |
| **The 9 row-owning repository ports and their Drizzle adapters** | The surface `NEU-850's OUT-2` names for threading the JWT subject. 9 of the 13 ports; the split holds exactly as recorded. |
| **`SearchPort`'s read paths** | Read paths need the same predicate as write paths — I3 makes no distinction between them, and an unscoped read is a full isolation failure, not a lesser one. |
| **The tx-scoped instances `UnitOfWorkPort` composes** | Instances created inside a transaction inherit whatever scoping the composing port carries; missing it there reintroduces the gap under load, invisibly. |
| **The query bodies that assume a single learner** | `getActiveSession()` unscoped at `src/adapters/drizzle/session-repository.ts:73`–`:80`, and the global-rejection guard **above** the port boundary at `src/orchestration/session-workflows.ts:39`–`:46`. The second is the one a port-boundary mechanism will not catch. (`F-S5-2`) |
| **A STDIO gate that does not exist at all** | Not a modification. `src/transport/main.ts:55`–`:59` mounts nothing; there is no component to change. (`H7`, §5.3) |
| **The 2 non-row-owning ports** | `EmbeddingPort` (`src/ports/embedding-port.ts:13`) and `ContentClassifierPort` (`src/ports/content-classifier-port.ts:23`) own no rows and are unaffected as row-owners. **Precisely:** "pure-compute" names their exclusion from row ownership, not an absence of I/O — both call external providers over the network. |

**The tool surface is the narrow part; the port / adapter / `AppContext` layer is the wide
part.** A change sized from the tool schemas alone is sized against the part that needs no
change.

---

## 7. The fact base, re-counted at this chapter's own cutoff

`CAP-S1-2` obliges the sub-task depending on a number to re-verify it against `src/` at its
own cutoff and cite its own command. This chapter did so; the results supersede the charter's
figures where they differ and are reconciled against `F-S4-1` rather than against the charter.

**Method.** Direct inspection of `origin/develop` at **2026-08-21**; counts from
`grep -rc "server.registerTool(" src/server/` and `grep -rn "context_token" src/domain/types/ src/server/`,
each read per file so it can be re-run and disagreed with.

| # | Fact | Citation | vs. inherited |
| --- | --- | --- | --- |
| 1 | Identity is resolved at the edge as `payload.sub \|\| azp`: `const subject = (typeof payload.sub === 'string' && payload.sub) \|\| azp \|\| undefined;` | `src/transport/jwt-middleware.ts:127`; assigned `res.locals.auth` `:133`–`:136` | confirms |
| 2 | It reaches only the rate-limit key and the MCP session-binding map; **zero** occurrences in `src/orchestration/`, `src/ports/`, `src/adapters/` | `src/transport/rate-limit-middleware.ts:76`–`:77`; `src/transport/http.ts:32`–`:35`, `:52`–`:72`, `:83`, `:206`–`:209` | confirms |
| 3 | **No ownership, tenancy or principal column exists anywhere** in `src/` or `drizzle/` | whole-tree grep, 2026-08-21 | confirms |
| 4 | `getActiveSession()` is unscoped | `src/adapters/drizzle/session-repository.ts:73`–`:80` | confirms |
| 5 | The global-active-session rejection is in **orchestration**, not the adapter's `createSession` | `src/orchestration/session-workflows.ts:39`–`:46`; `session-repository.ts:37`–`:66` has no such check | **corrects** the inherited location (`F-S5-2`) |
| 6 | `context_tokens` carries `id`, `createdAt`, `expiresAt` and nothing else | `src/infrastructure/db/schema.ts:312`–`:321` (`:315`, `:316`, `:317`) | confirms |
| 7 | Neither operational log table has a principal column | `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`–`:15`, `drizzle/0012_extend_mcp_request_log.sql:1`–`:3`; `drizzle/0013_create_operation_event_log.sql:1`–`:12` | confirms |
| 8 | Tool surface: **46 registered / 43 gated / 3 exempt**, across 16 registering modules; **all 43 gated declare `context_token`** (42 via a named `*InputShape` constant — 41 imported, 1 module-local — plus 1 genuinely inline) | §6.2's citations | **corrects** charter 45/42/40 (`F-S5-3`); corroborates `F-S4-1`'s 46 |
| 13 | `Learner-scoped` column census over all 45 rows: **19 explicit `no` / 18 `question — open` / 8 explicit `yes`**, so the invariant's in-domain set is **26** | Programmatic parse of the `Learner-scoped` cell of every `SC-S3-*` row in `04_state-category-inventory.md` §3, at the 2026-08-21 cutoff; re-run by re-parsing that column | new figure — the charter carries none |
| 9 | The 3 exempt tools are the only three `z.object({}).shape` in `src/server/*-tools.ts`, and are identical to `EXCLUDED_TOOLS` | `server-info-tools.ts:13`, `server-context-tools.ts:21`, `server-workflow-tools.ts:15`; `src/transport/context-token-middleware.ts:5`–`:9`, mounted `src/transport/http.ts:185`–`:187`, and matched against the incoming tool name at `src/transport/context-token-middleware.ts:55`–`:59` | confirms |
| 10 | STDIO is bare; every protection is HTTP-only | `src/transport/main.ts:55`–`:59` vs `http.ts:163`–`:165`, `:106`–`:120`, `:172`–`:174`, `:185`–`:187`, reached only from `main.ts:46`–`:54` | confirms `F-S4-5`, `BND-S4-17` |
| 11 | `AppContext`: one frozen instance, **57 properties / 53 closures**, no principal field, reused per MCP session | `src/composition-root.ts:136`–`:314`, `:518`–`:636`, `:638`; `main.ts:41`; `http.ts:220` | **corrects** the inherited "~60 closures" and adds the sharing fact (`F-S5-1`) |
| 12 | 13 ports, split 9 row-owning / 1 search / 1 unit-of-work / 2 non-row-owning | `src/ports/`, per-file | confirms; §6.3 refines the "pure-compute" label |

---

## 8. Verification

Per `00_method-and-provenance.md` §5, this chapter's claims are verified by **file inspection
against countable criteria**, not by a test run. Every `src/` and `drizzle/` citation above
was read at the stated line at the 2026-08-21 cutoff; every count was produced by a stated
command over one tree at one cutoff. A green type-check is a no-regression signal about the
repository and **is not evidence about this document's content**.

**`qa-execution:engine` is unconfigured in this repository's capability registry.** The
automated QA-execution phase is therefore a genuine Core Article 8 no-op — it ran inert, no
QA pass is claimed, and none was fabricated. **`CAP-S1-3` already carries the package-level
statement, so no second cap is filed here**, following the precedent SUB-2 and SUB-4 set.

---

## 9. What this chapter hands on

| Receives | What it gets |
| --- | --- |
| **NEU-893** | The invariant as a decision procedure (§3), the two threat outcomes (§4), and List B — the 8 questions it owns (§5.3), including the two the charter did not name: the transport gate (H7) and the principal-provenance obligation (H6). Plus §4.3's sequencing consequence: closing STDIO surfaces the `sub`/`azp` defect rather than resolving it. |
| **`SUB-14 (NEU-978)`** | The per-row evaluable form: one `SC-S3-*` row in, five ordered checks, one of six verdicts out, first failure wins. Each check names the artifact its answer is read from (§3.3), and §3.5 gives the ordering's secondary use — the first failing check names the owner of the next work. |
| **`SUB-8 (NEU-981)`** | The obligation (§6.1) and the blast radius, narrow and wide (§6.2, §6.3), with the count-independent form of the "zero schemas newly declare it" claim and the corrected figures. No per-item audit is run here. |
| **`SUB-13 (NEU-977)`** | I1's rule — `question — open` is **in domain** — so the 18 open rows are questions to answer, never exemptions, and they are 18 of the 26 in-domain categories. |
| **`SUB-10 (NEU-984)`** | §4.2's statement that the invariant's STDIO verdict is unconditional on reachability, so the deployment answer changes the exposure, not the verdict. |
| **NEU-850** | `OI-S5-1`, the one scope question its `OUT-1` drift check must resolve. No amendment (§2). |
| **`SUB-12 (NEU-986)`** | `CAP-S5-1` — the invariant is well-formed and has zero positive instances — and `OI-S5-1`/`OI-S5-3` at the completeness gate. |

## 10. Ids allocated by this sub-task

**Findings:** `F-S5-1` … `F-S5-4` (`02_findings-register.md` § SUB-5).
**Open items:** `OI-S5-1` … `OI-S5-3`, plus the recorded disposition of `OI-S1-2`
(`90_open-items-and-provisional-register.md` § SUB-5).
**Caps:** `CAP-S5-1` (`91_caps-and-incomplete-scope.md` § SUB-5).
**Decision records:** `DR-C10-S5-1`, `DR-C10-S5-2`.
**Stand-ins:** none. `93_stand-in-assumption-register.md` is closed; `A-28` is relied on and
not re-filed.
**Document numbers:** `06_` only.
