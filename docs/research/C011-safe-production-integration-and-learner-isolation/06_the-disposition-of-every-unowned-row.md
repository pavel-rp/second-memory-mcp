# The disposition of every unowned row already in production

**Sub-task:** SUB-6 (NEU-1000) · **Covers:** OUT-2
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `35f92ba`
**Depends on:** SUB-2 (NEU-994), published at `02_identity-the-learner-key-and-principal-kind.md`; SUB-3 (NEU-995), published at `03_learner-data-inventory-and-classification.md`; SUB-5 (NEU-997), published at `05_the-enforcement-point-that-confines-every-read-and-write.md`
**Also consumes:** `08_consent-and-what-a-learner-can-export-and-erase.md` (SUB-8 — the `unreachable` disposition and `F-S8-2`), `16_attribution-and-detection.md` (SUB-16 — the attribution carrier and its non-retroactivity), `15_operational-objectives-for-the-real-platform.md` (SUB-15 — `OBJ-1`, `OBJ-7`, `OBJ-8`, `OBJ-12`), `../C010-system-and-repository-architecture/04_state-category-inventory.md` (the 45 `SC-S3-*` categories), `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md` (`A-28`), `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md` (`NEU-850`'s `OUT-2`, reproduced at `:50`–`:53`)
**Decision records:** `DR-C11-S6-1`, `DR-C11-S6-2`, `DR-C11-S6-3` · **Traceability:** `traceability/S6_the-disposition-of-unowned-rows.md`

---

## 0. What this chapter is

Every row in the production database is unowned. This chapter decides what happens to each of them,
table by table, and it does so under a constraint that shapes the whole answer: **no production
credential exists in this environment**, so the counts that would size each population cannot be
taken. The chapter therefore publishes the query set that would take them, states plainly that it
has not been run, and never reports an absence of evidence as a zero.

It settles four things and refuses a fifth.

1. **A disposition for each of the 14 tables**, justified per table (§3), organised by a three-way
   split on *what evidence can attribute the rows* (§2).
2. **What happens to the pre-cutover population** — the rows that erasure cannot reach and that
   confinement hides from everyone (§4). This is the hard part of the chapter and the reason the
   sub-task is L.
3. **The evidence SUB-3 named this sub-task to supply** for the dry-run dataset's exclusion from the
   sixth copy class (§7).
4. **The staging and the reversal position per stage** (§9).

It refuses to decide **what a data right does when it reaches the pre-cutover population.** That is
SUB-9's, by name, under `F-S8-2` and `R-S16-1`. §4.3 states the boundary exactly, because the two
questions are about the same rows and are easy to conflate.

---

## 1. The starting position, re-counted at this chapter's own cutoff

### 1.1 There are 14 tables, and this chapter re-counted them

Twelve are declared in `src/infrastructure/db/schema.ts` — ten in the default `public` schema and
two inside the `pgSchema('infrastructure')` block declared at `src/infrastructure/db/schema.ts:331`.
Two more exist only as raw SQL and are deliberately not Drizzle-managed, a decision the schema file
itself documents in the comment block at `src/infrastructure/db/schema.ts:323`–`:330`.

| # | Table | Schema | Declared at |
| --- | --- | --- | --- |
| 1 | `learning_topics` | `public` | `src/infrastructure/db/schema.ts:21` |
| 2 | `learning_chunks` | `public` | `src/infrastructure/db/schema.ts:49` |
| 3 | `learning_sessions` | `public` | `src/infrastructure/db/schema.ts:99` |
| 4 | `session_chunks` | `public` | `src/infrastructure/db/schema.ts:126` |
| 5 | `session_questions` | `public` | `src/infrastructure/db/schema.ts:156` |
| 6 | `session_question_chunks` | `public` | `src/infrastructure/db/schema.ts:179` |
| 7 | `session_question_attempts` | `public` | `src/infrastructure/db/schema.ts:197` |
| 8 | `session_question_attempt_revisions` | `public` | `src/infrastructure/db/schema.ts:250` |
| 9 | `notes` | `public` | `src/infrastructure/db/schema.ts:288` |
| 10 | `context_tokens` | `public` | `src/infrastructure/db/schema.ts:312` |
| 11 | `linter_validation_corpus` | `infrastructure` | `src/infrastructure/db/schema.ts:333` |
| 12 | `linter_rule_validation_report` | `infrastructure` | `src/infrastructure/db/schema.ts:364` |
| 13 | `mcp_request_log` | `infrastructure` | `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`, extended by `drizzle/0012_extend_mcp_request_log.sql:1`–`:3` |
| 14 | `operation_event_log` | `infrastructure` | `drizzle/0013_create_operation_event_log.sql:1` |

Ten plus two plus two. The figure agrees with SUB-3's §3 walk and with C010's §3.1–§3.3 split, and
is re-derived here from the files rather than inherited.

### 1.2 Zero ownership columns, re-verified at this cutoff

A grep over `src/infrastructure/db/schema.ts` and the three log-table migrations for `user_id`,
`userId`, `learner_id`, `learnerId`, `owner_id`, `ownerId`, `tenant_id`, `tenantId`, `principal` and
a word-bounded `sub` returns **zero matches**. Charter assumption 13 holds at `35f92ba`, and C010's
own re-verification of the same fact at
`../C010-system-and-repository-architecture/04_state-category-inventory.md:442`–`:443` agrees.

Two near-misses are worth naming so a later reader does not mistake either for an ownership column.
`notes.author` (`src/infrastructure/db/schema.ts:296`) is a two-value enum constrained to `'agent'`
or `'user'` by `chk_note_author` at `src/infrastructure/db/schema.ts:308` — it records *what kind of
actor* wrote a note, never *which* one. And `mcp_request_log.session_id`
(`drizzle/0012_extend_mcp_request_log.sql:3`) is a *learning*-session id read out of tool arguments
at `src/transport/audit-middleware.ts:94`–`:99`, not a principal.

### 1.3 One structural fact the schema gives this chapter for free

Every foreign key in the schema is declared, and every declared FK carries an action — `ON DELETE
CASCADE` on nine of them, `ON DELETE SET NULL` on one (`learning_sessions.topic_id`, at
`src/infrastructure/db/schema.ts:103`). Postgres enforces declared FKs, so for those relationships a
referential orphan cannot exist while the constraint is valid.

**There is exactly one exception, and it matters twice over.** `notes.target_id`
(`src/infrastructure/db/schema.ts:294`) is a polymorphic reference — its target table is selected at
runtime by `notes.target_type`, and **no foreign key is declared for it**. It is therefore the one
place in this schema where a genuine referential orphan is structurally possible, and it is also the
one table whose rows cannot be attributed by joining to a parent. Both consequences are carried
forward: to the disposition in §3 row 9, and to the probe set in §6.

### 1.4 What the four predecessors settled

- **SUB-2** fixed the persisted learner key as the OIDC `sub` claim verbatim, ruled that `azp` is
  never a learner key, and established `principal_kind = 'client'` with `learner_key = NULL` as a
  third state distinct from `none`. `F-S2-1` records that production authenticates through the
  static client `claude-web` rather than DCR, so every learner presents the same bare `aud` and the
  audience carries no learner information at all.
- **SUB-3** inventoried 32 `LD-S3-*` categories, recorded the exclusion of this sub-task's dry-run
  dataset from the sixth copy class on a derivation test
  (`03_learner-data-inventory-and-classification.md:484`–`:501`), and classified the aggregate
  result set `LD-S3-32` as **not personal data**, noting it "does not exist at position 3"
  (`03_learner-data-inventory-and-classification.md:474`).
- **SUB-5** placed the enforcement point in the Drizzle adapter, bound to an indivisible
  `(principal_id, principal_kind)` pair at construction
  (`05_the-enforcement-point-that-confines-every-read-and-write.md:224`–`:225`), and supplied the
  rule that **an aggregate is confined if and only if the predicate is applied before aggregation**
  (`05_the-enforcement-point-that-confines-every-read-and-write.md:591`–`:593`) — a rule written
  there expressly for this chapter to inherit.
- **SUB-8** made `unreachable` a real value in its erasure-disposition enum
  (`08_consent-and-what-a-learner-can-export-and-erase.md:398`) and raised blocking finding
  `F-S8-2`.

### 1.5 The contradiction between two of them, stated before it is resolved

SUB-8 and SUB-5 describe the same rows and point in opposite directions.

> **SUB-8: the mechanism under-reaches them.** A `DELETE … WHERE learner_key = $1` "returns success
> and a row count while the entire pre-cutover population survives"
> (`08_consent-and-what-a-learner-can-export-and-erase.md:450`–`:452`). Those rows "cannot be given
> a learner-scoped retention bound at all … the only bound available to it is time-based and
> population-wide" (`:459`–`:463`).
>
> **SUB-5: the mechanism over-reaches them.** "Where erasure misses pre-cutover rows, confinement
> **hides** them: they become unreachable to everyone, including the learner who created them. That
> is not a leak — it is the safe direction — but it is **data loss by predicate**"
> (`05_the-enforcement-point-that-confines-every-read-and-write.md:624`–`:629`).

Both are true, and neither is a defect in the other's design. They are two consequences of a single
fact SUB-16 established: **attribution is not retroactive.** Rows written before the carrier lands
"carry no key and **can never be given one**", because the only structure that ever held the binding
is the process-local map at `src/transport/http.ts:83`, emptied by every restart
(`16_attribution-and-detection.md:279`–`:283`).

A disposition that assumed the key could be backfilled onto those rows would dissolve the
contradiction by contradicting SUB-16. This chapter does not take that route. §4 resolves it a
different way.

---

## 2. Decision — three populations, split by what evidence can attribute them

**`DR-C11-S6-1`. The 14 tables are partitioned by the evidence available to attribute their rows,
and each partition takes a different disposition. The split is by evidence, not by schema, not by
table size, and not by data class.**

The charter forbids a uniform rule and requires a per-table justification. The reason a uniform rule
fails here is not stylistic: the tables genuinely differ in what can be known about who wrote their
rows, and that difference — not any property of the data itself — is what determines which
dispositions are honestly available.

| Population | What can attribute its rows | Disposition | Tables |
| --- | --- | --- | --- |
| **A — attributable by uniformity** | Nothing per row, but the population has exactly one human principal, so every row has the same owner regardless of which row it is | **`backfill`** / **`backfill-by-join`** | 1–9, 11 (ten tables) |
| **B — non-attributable and ephemeral** | Nothing, and the rows are already void under a consumed decision | **`purge`** | 10 (`context_tokens`) |
| **C — non-attributable and durable** | Nothing, and nothing ever will | **`archive`** | 13, 14 (the two log tables) |
| **—** | Not applicable: the table carries no learner-derived value | **`no-key-owed`** | 12 (`linter_rule_validation_report`) |

### 2.1 The migration-disposition vocabulary, and why it is not SUB-8's

Five values, and they are deliberately **not** the five SUB-8 defined at
`08_consent-and-what-a-learner-can-export-and-erase.md:392`–`:398`. SUB-8's enum answers *what an
erasure request does to a category*; this one answers *what the one-time migration does to a table's
existing rows*. They are different axes over the same rows, and collapsing them is the exact
conflation §4.3 exists to prevent.

| Value | Meaning |
| --- | --- |
| `backfill` | Existing rows receive the verified target subject directly |
| `backfill-by-join` | Existing rows receive the key derived from a parent row across a declared, `NOT NULL` foreign key |
| `purge` | Existing rows are deleted at cutover |
| `archive` | Existing rows are moved intact to a closed, retained store outside the confined surface — **not** deleted |
| `no-key-owed` | The table carries no learner-derived value; attaching a learner key would be false attribution |

### 2.2 The premise that licenses population A, stated as the load-bearing assumption it is

Population A's disposition rests on one claim: **the pre-cutover learning-domain population has
exactly one human principal — the creator.** If that is true, backfilling every row to a single
verified subject is not a guess; it is the only correct answer, and it is precisely the "existing
global rows backfilled to a single owner" that `A-28`'s envelope names.

The claim is not this chapter's invention — it is the charter's own standing `n = 1` evidence label,
carried as risk `R13` (owned by SUB-1, OUT-18) and stated in the charter's § Risks table as "the
whole design is validated against `n = 1` evidence — the creator — because no multi-learner evidence
exists anywhere upstream."

**It is nonetheless an assumption, it is load-bearing, and this chapter registers it as
`A-S6-1` rather than absorbing it.** If a second human ever used the deployment, the backfill
commingles two people's data under one identity — which is the *opposite* of the isolation this
package exists to deliver, and is worse than leaving the rows unowned.

**And it cannot be falsified by any aggregate probe.** No column in any of the ten tables
distinguishes one principal from another (§1.2), so there is no query — no count, no grouping, no
distinct — that would return a different answer under one human than under two. The probe set of §6
is written to look for dirty data; this is not dirty data, it is absent data, and no probe reaches
it. That is registered as **`F-S6-2`**, and it is one of the two findings OUT-2 requires. The only
party who can settle it is the creator, as sole operator, from knowledge that is not in the
database.

---

## 3. The per-table disposition table

Fourteen rows, zero unaddressed. The `SC-S3-*` column is C010's category id, carried here so §8's
cross-check is mechanical rather than narrative.

| # | Table | `SC-S3-*` | Disposition | Justification — why this table, not the uniform rule |
| --- | --- | --- | --- | --- |
| 1 | `learning_topics` | `SC-S3-1` | `backfill` | The root entity. It has no parent to derive a key from — `learning_topics` declares no outbound FK — so the key must be written directly from the verified target subject. |
| 2 | `learning_chunks` | `SC-S3-2`, `-3`, `-4` | `backfill-by-join` | `topic_id` is `NOT NULL` with `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:53`–`:55`). Ownership is already totally determined by the parent topic, so deriving it is strictly safer than re-asserting it. Carries three C010 categories (content, scheduling state, audit verdict) that share one row and therefore one disposition. |
| 3 | `learning_sessions` | `SC-S3-5` | `backfill` | **Deliberately not by join.** `topic_id` is **nullable** with `ON DELETE SET NULL` (`src/infrastructure/db/schema.ts:103`), so a join to `learning_topics` is not total — a session whose topic was deleted would receive no key and violate the `NOT NULL` target. Direct backfill is the only complete option. |
| 4 | `session_chunks` | `SC-S3-6` | `backfill-by-join` | `session_id` `NOT NULL`, `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:130`–`:132`). |
| 5 | `session_questions` | `SC-S3-7` | `backfill-by-join` | `session_id` `NOT NULL`, `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:160`–`:162`). |
| 6 | `session_question_chunks` | `SC-S3-8` | `backfill-by-join` | `session_question_id` `NOT NULL`, `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:183`–`:185`). A pure join table; it carries no learner content of its own, but it carries the *fact of an association*, which is learner-derived. |
| 7 | `session_question_attempts` | `SC-S3-9`, `-10` | `backfill-by-join` | `session_question_id` `NOT NULL`, `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:201`–`:203`). Carries two C010 categories — the attempt and the pre-review scheduling snapshot — in one row. |
| 8 | `session_question_attempt_revisions` | `SC-S3-11` | `backfill-by-join` | `attempt_id` `NOT NULL`, `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:254`–`:256`). Two joins from the session, but the chain is total at every link. |
| 9 | `notes` | `SC-S3-12` | `backfill` | **The one table where no join is available.** `target_id` is polymorphic with no declared FK (§1.3), so there is no constraint-backed parent to derive from, and `author` is a two-value kind enum carrying no identity. A note written by the `'agent'` about the operator's chunk is still the operator's data, so the `author` value does not change the disposition. |
| 10 | `context_tokens` | `SC-S3-13` | `purge` | Three columns — `id`, `created_at`, `expires_at` (`src/infrastructure/db/schema.ts:312`–`:320`) — and no principal. The population is **provably mixed**: every deploy's smoke job calls `init_agent_context` under a `client_credentials` grant and mints a row (§10), so a uniform backfill would pin non-learner rows to a human, which is exactly the `sub`-versus-`azp` mis-pinning `NEU-850`'s risk register names. And it is moot: `DR-C10-S8-2`, consumed by OUT-13, already rejects rather than grandfathers pre-existing unbound tokens, so every one of these rows is void at cutover regardless. Purging destroys nothing that survives the cutover anyway. |
| 11 | `linter_validation_corpus` | `SC-S3-14` | `backfill-by-join` | `chunk_id` `NOT NULL`, `ON DELETE CASCADE` to `learning_chunks` (`src/infrastructure/db/schema.ts:338`–`:340`). Its rows point at learner content and already die with it; deriving the key across the same edge keeps the two consistent. |
| 12 | `linter_rule_validation_report` | `SC-S3-15` | `no-key-owed` | Keyed by `rule_id` (`src/infrastructure/db/schema.ts:367`), and every other column is a model-evaluation metric — precision, recall, F1, counts, a blocking-eligibility flag. It is a statement about a **rule**, not about a learner. Attaching a learner key would assert an ownership that does not exist. §12 shows this stays inside `A-28`'s envelope under either reading of it. |
| 13 | `mcp_request_log` | `SC-S3-16` | `archive` | Population C. Holds whole unredacted learner free text in `response_body` (`F-S3-1`), has no principal column, and its rows can never be given one (§1.5). §4 is the argument. |
| 14 | `operation_event_log` | `SC-S3-17` | `archive` | Population C, on the same argument. Additionally it is the table the one unconfinable aggregate reads — `DrizzleTier2BlockingStatsRepository` at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:34`–`:47`, registered by SUB-5 as `F-S5-9` — which §4.4 addresses. |

**Zero tables are unaddressed.** OUT-2 additionally requires that *a table for which no disposition
can be justified is reported as a finding with a named owner*. The check was run against all
fourteen and **no such table was found**, so the finding is recorded as *checked and not filed*
rather than omitted — the same disposition SUB-5 recorded for the equivalent conditional at
`05_the-enforcement-point-that-confines-every-read-and-write.md` §10.

---

## 4. The pre-cutover population: un-erasable, invisible, and what to do about it

### 4.1 The two failure directions are one fact seen twice

§1.5 set out the contradiction. Restated as a single claim: **the pre-cutover log population is
addressable only as a whole.** Erasure needs a per-learner predicate and there is none, so it
under-reaches (SUB-8). Confinement applies a per-learner predicate and the rows match nobody's, so
it over-reaches (SUB-5). Both mechanisms fail because both are *per-learner* mechanisms and the
population has no per-learner structure.

The failures look opposite because one is a write and the other is a read. They are the same
absence.

### 4.2 The decision, and why the alternatives lose

**`DR-C11-S6-2`. The pre-cutover rows of both log tables are `archive`d: moved intact, at the
cutover instant, into a retained store outside the confined surface. They are not deleted, not
backfilled, and not de-identified by this migration.**

The move does one thing that nothing else on the table does: **it closes the population.** Before
the cutover the set of unowned log rows is open and grows with every request. After it, the set is
finite, has an end timestamp, and is separately addressable as a whole. That is the only property
any of the three broken things actually needs.

- **Against erasure's under-reach.** Archiving does not make the rows per-learner selectable —
  nothing can, and this chapter does not pretend otherwise. What it does is convert the only bound
  SUB-8 said was available — "time-based and population-wide"
  (`08_consent-and-what-a-learner-can-export-and-erase.md:459`–`:463`) — from a bound over an
  unbounded, still-growing set into a bound over a closed, countable one. `F-S8-2` stays blocking
  and stays SUB-9's; a population-wide bound is still not a learner-scoped bound, and this chapter
  does not claim to have discharged it. But the thing SUB-9 must dispose of is now finite.
  `DR-C11-S8-2`'s own revision trigger 3 anticipated exactly this event: the carrier landing
  "converts `unreachable` from a standing property into a bounded, countable population for the
  first time" (`decision-records/DR-C11-S8-2_export-erasure-and-the-completion-deadline.md:169`).
- **Against confinement's over-reach.** After the move, the live log tables contain only
  post-cutover rows, every one of which carries the attribution carrier. Confinement over the live
  tables is then complete and correct, and **nothing is hidden by predicate** — because nothing
  unowned remains in the confined surface for a predicate to hide. The archived rows are outside
  that surface by construction, reachable only by the operator. SUB-5's "data loss by predicate"
  stops being an accident of a `WHERE` clause and becomes a **declared access boundary with a named
  owner**. The same rows are equally unreadable; the difference is that now it is a decision, and it
  is written down.

That is the resolution: the two failures are not fixed separately. Closing the population and moving
it out of the confined surface converts both accidental properties into one deliberate, bounded,
owned quarantine.

**The rejected alternatives, and why each loses.**

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Backfill the log rows to the target subject** | Contradicts SUB-16 outright (`16_attribution-and-detection.md:279`–`:283`) and is provably wrong for a subset: `mcp_request_log` records every request, including the deploy smoke job's `client_credentials` calls, so a uniform human key would be false for those rows specifically. |
| 2 | **Delete the pre-cutover population now** | Pre-empts SUB-9. `F-S8-2` routes the population's disposition to SUB-9 with three options — bulk deletion, bulk anonymization, or an accepted and named residual (`08_consent-and-what-a-learner-can-export-and-erase.md:464`–`:466`). Deleting removes two of the three before SUB-9 is reached. It is also irreversible, and §9 will not accept an irreversible step that a later sub-task could have chosen differently. |
| 3 | **De-identify the free text in place** | Not mechanically achievable at this cutoff. `response_body` is stored whole and unredacted, and `redactParams` is a credentials-only denylist (`src/shared/redact-params.ts:1`) — there is no mechanism that identifies learner-authored free text inside it. Proposing it would be proposing an unbuilt component as a mitigation. |
| 4 | **Leave them in place, unowned** | The status quo, and the failure both SUB-8 and SUB-5 describe. It also leaves the population open, so it grows for as long as the decision is deferred. |

**Archive preserves every one of SUB-9's three options** — the archive can still be dropped, still be
anonymized, or still be named as an accepted residual — while removing the one property that made
all three harder, namely that nobody knew how many rows there were or when the set stopped growing.
That is a strict improvement to SUB-9's position, not a constraint on it.

### 4.3 Exactly where this chapter's remit ends and SUB-9's begins

The two questions are about the same rows, which is why they get conflated. They are on different
axes.

| | **This chapter (SUB-6, OUT-2)** | **SUB-9 (NEU-1003, OUT-12)** |
| --- | --- | --- |
| **Question** | What does the one-time migration *do to these rows* at cutover? | What does a *data right* do when it reaches them, thereafter? |
| **Answer** | `archive` — close the population, move it out of the confined surface, delete nothing | Bulk deletion, bulk anonymization, or an accepted and named residual — **open, and not decided here** |
| **When** | Once, at the cutover instant | Per request, on every erasure or withdrawal after it |
| **Owns** | `DR-C11-S6-2`, and the reversal position in §9 | `F-S8-2`, `R-S16-1`, and the sixth column of the propagation matrix |

Stated as two sentences, because the distinction is the point:

> **This chapter decides where the rows live. SUB-9 decides what a learner's request does to them.**
> A migration disposition is not a propagation action, and `archive` is not an answer to "what
> happens when someone asks to be erased."

Three things follow, and they are stated so neither a gap nor a duplicate can hide between the two
sub-tasks.

1. **`F-S8-2` is not discharged here.** It remains blocking, its named owner is unchanged — SUB-9
   for the disposition, the creator for the population and the decision to delete or retain it
   (`91_findings-register.md:435`) — and this chapter neither re-raises it nor re-dispositions it.
   What this chapter changes is the *shape of the thing SUB-9 must dispose of*, from open to closed.
2. **This chapter sets no retention bound, no owner and no destruction condition for the archive.**
   Those are terms on a copy of learner data, and terms are SUB-9's under OUT-12 and the
   retention-and-deletion caps `CAP-S3-3` / `CAP-S4-1`, whose owner is `NEU-986` and which this
   package supplies a mechanism to rather than absorbing. Setting a bound here would be this
   chapter absorbing another party's cap.
3. **The gap that would otherwise open is named.** If SUB-9 concludes "accepted residual", the
   archive persists with a population-wide bound and no learner-scoped one — which is `F-S8-2`
   unresolved, correctly recorded, not silently closed by the archive's existence. This chapter
   explicitly does **not** treat archiving as a discharge of the erasure duty. That is registered as
   **`R-S6-1`**.

### 4.4 The aggregate that reads the archived table

`DrizzleTier2BlockingStatsRepository` aggregates `infrastructure.operation_event_log` over a
five-week window (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:34`–`:47`). Its query
does carry a `WHERE` clause, at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:40`–`:42`,
but it filters only on event type, a time window and a not-null guard — there is **no ownership
predicate, because the table has no ownership column**. SUB-5 registered it as `F-S5-9`, the one
aggregate that cannot take the rule that a predicate must apply before aggregation
(`05_the-enforcement-point-that-confines-every-read-and-write.md:591`–`:593`).

The archive interacts with it in a way worth stating rather than discovering later. Its window is
five weeks, so **once five weeks have elapsed after the cutover the aggregate reads only
post-cutover rows**, every one of which carries the carrier — and at that point a predicate *can* be
pushed below the aggregation and `F-S5-9` becomes fixable. In the five weeks immediately after
cutover the aggregate would read a truncated window, under-reporting counts, because the
pre-cutover rows it would otherwise have summed now live in the archive.

That is a real, bounded, one-time behavioural change to a live code path, and it is not this
chapter's to fix — nothing here touches `src/`. It is registered as **`F-S6-3`** and handed to
SUB-7, which sequences the cutover, and to SUB-13, which writes the migration.

**Note on scope, because SUB-5 was explicit about it:** this aggregate is *not* an instance of
`LD-S3-32`. SUB-5 says so directly at
`05_the-enforcement-point-that-confines-every-read-and-write.md:54`–`:55`. `LD-S3-32` is *this*
sub-task's aggregate result set, and §6.4 records what became of it.

---

## 5. The target-subject verification procedure

The middleware resolves a principal as `payload.sub || azp` at `src/transport/jwt-middleware.ts:127`
— a fallback SUB-2 replaced with a rule. Under that rule the learner key is the OIDC `sub` verbatim
and `azp` is never a learner key. A backfill that took the wrong branch of that fallback would pin
every existing row to the client identifier, orphaning the operator's own data behind an identity
they cannot authenticate as. That is the failure this procedure exists to prevent, and it is why
OUT-2 requires the target be *verified against a real token*, never inferred.

### 5.1 The procedure

| Step | Action | Pass condition |
| --- | --- | --- |
| V1 | Obtain a token from the production Rauthy IdP through the **authorization-code** flow the human learner actually uses — not `client_credentials`. | A token is returned. |
| V2 | Decode the payload and read `sub` and `azp` as separate values. | Both are read independently; neither is derived from the other. |
| V3 | Assert `sub` is present and non-empty. | Present. **If absent, the procedure stops and the backfill does not run** — an absent `sub` means the learner flow does not yield a human subject, which is `H5`, and it would invalidate population A's disposition, not merely delay it. |
| V4 | Assert `sub ≠ azp`. | Distinct. Equality would mean the two claims cannot be told apart on this deployment, and the fallback at `:127` would be unfalsifiable in production. |
| V5 | Assert `azp` is the static client `claude-web`, consistent with `F-S2-1`. | Matches. Confirms the deployment is the pre-registered-client shape and not DCR. |
| V6 | Record the `sub` value, redacted per OUT-18's discipline, as the migration's target subject, with the date and the token's issuer. | Recorded in the spike register. |
| V7 | Re-run V1–V6 immediately before the backfill stage executes. | Same `sub`. A changed value between verification and execution means the key is not stable and the backfill must abort. |

### 5.2 Execution status — not obtained

**This procedure has not been run, and it cannot be run from this environment.** There is no
`SMOKE_PROD_*` secret, no `AUTH_*` variable, no `DATABASE_URL` and no `.env` — only
`.env.example:13`, which carries a local-development placeholder pointing at `localhost`. Across
eight merged chapters of this package, zero spikes have executed.

The consequence is stated plainly rather than worked around: **OUT-2's target-subject criterion is
not met by this chapter.** It is registered as spike **`SPK-S6-1`** with its method above, its
owner, and an expiry; and the backfill stage in §9 carries V1–V7 as a hard entry condition, so the
unverified target cannot reach production through this design. What is delivered is the procedure
and the gate. What is not delivered is the observation.

No value is proposed for the target subject anywhere in this chapter. A chapter that guessed one and
labelled it provisional would be supplying exactly the wrong artifact — an inferred target is the
failure mode, not a weaker form of success.

---

## 6. The aggregate query set and its pathology probes

Per-disposition row counts come from read-only aggregate queries against production — counts, never
rows, and therefore inside the read-only inspection OUT-18 authorizes. The query set is published
here so a reader can see **what was looked for** as well as what was found.

### 6.1 The counting queries

One per disposition, over the tables §3 assigns to it. Each returns a single integer.

```sql
-- Q1  population A, direct backfill
SELECT 'learning_topics'   AS t, COUNT(*) FROM public.learning_topics
UNION ALL SELECT 'learning_sessions', COUNT(*) FROM public.learning_sessions
UNION ALL SELECT 'notes',             COUNT(*) FROM public.notes;

-- Q2  population A, backfill-by-join
SELECT 'learning_chunks'   AS t, COUNT(*) FROM public.learning_chunks
UNION ALL SELECT 'session_chunks',                     COUNT(*) FROM public.session_chunks
UNION ALL SELECT 'session_questions',                  COUNT(*) FROM public.session_questions
UNION ALL SELECT 'session_question_chunks',            COUNT(*) FROM public.session_question_chunks
UNION ALL SELECT 'session_question_attempts',          COUNT(*) FROM public.session_question_attempts
UNION ALL SELECT 'session_question_attempt_revisions', COUNT(*) FROM public.session_question_attempt_revisions
UNION ALL SELECT 'linter_validation_corpus',           COUNT(*) FROM infrastructure.linter_validation_corpus;

-- Q3  population B, purge
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE expires_at < (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint) AS already_expired
FROM public.context_tokens;

-- Q4  population C, archive
SELECT 'mcp_request_log'   AS t, COUNT(*), MIN("timestamp"), MAX("timestamp") FROM infrastructure.mcp_request_log
UNION ALL
SELECT 'operation_event_log', COUNT(*), MIN("timestamp"), MAX("timestamp") FROM infrastructure.operation_event_log;

-- Q5  no-key-owed
SELECT COUNT(*) FROM infrastructure.linter_rule_validation_report;
```

### 6.2 The pathology probes

Five classes, each probed explicitly, per table. The **Structurally possible?** column is the part
that makes this set honest: for most table-and-class pairs a constraint already forecloses the
pathology, and saying so is more useful than running a probe that can only return zero.

| Probe | Class | Target | Structurally possible? | Query |
| --- | --- | --- | --- | --- |
| `P-ORPHAN-1` | Orphaned FK | `notes.target_id` | **Yes** — no FK declared (§1.3) | `SELECT COUNT(*) FROM public.notes n WHERE (n.target_type='chunk' AND NOT EXISTS (SELECT 1 FROM public.learning_chunks c WHERE c.id=n.target_id)) OR (n.target_type='topic' AND NOT EXISTS (SELECT 1 FROM public.learning_topics t WHERE t.id=n.target_id)) OR (n.target_type='session' AND NOT EXISTS (SELECT 1 FROM public.learning_sessions s WHERE s.id=n.target_id));` |
| `P-ORPHAN-2` | Orphaned FK | the 9 declared FKs | **No** — Postgres enforces them | Published as a validity check, not a discovery probe: `SELECT conname, convalidated FROM pg_constraint WHERE contype='f' AND NOT convalidated;` A non-empty result means a constraint was added `NOT VALID`, which is a different fault class from an orphan. |
| `P-ENC-1` | Encoding anomaly | every `jsonb` column | **Yes** — Postgres rejects invalid UTF-8 on `text` at insert, but ` ` inside a JSON string literal is accepted and breaks `jsonb ->> text` conversion | `SELECT COUNT(*) FROM public.learning_chunks WHERE prerequisites_json::text LIKE '% %' OR tags_json::text LIKE '% %';` and the same over `learning_sessions.chunk_ids`, `session_question_attempts` has none, `mcp_request_log.params`, `operation_event_log.data`. |
| `P-ENC-2` | Encoding anomaly | free-text columns | **Partly** — lone surrogates and replacement characters survive insertion | `SELECT COUNT(*) FROM infrastructure.mcp_request_log WHERE response_body LIKE '%' || U&'\FFFD' || '%';` and the same over `notes.content`, `learning_chunks.content`. |
| `P-NULL-1` | Unexpected null | nullable columns the migration reads | **Yes** | `SELECT COUNT(*) FILTER (WHERE topic_id IS NULL) FROM public.learning_sessions;` — the count that decides whether row 3's direct-backfill justification actually binds. Plus `learning_chunks.content`, `learning_topics.summary`, `mcp_request_log.method`. |
| `P-NULL-2` | Unexpected null | join keys | **No** — all seven join columns are `NOT NULL` | Published so the reader can see it was considered; a non-zero result is impossible while the constraints hold. |
| `P-DUP-1` | Duplicate | `notes` | **Yes** — no unique constraint of any kind | `SELECT COUNT(*) FROM (SELECT target_type, target_id, content, created_at FROM public.notes GROUP BY 1,2,3,4 HAVING COUNT(*)>1) d;` |
| `P-DUP-2` | Duplicate | `learning_topics` | **Yes** — `title`/`subject` carry no unique index | `SELECT COUNT(*) FROM (SELECT title, subject FROM public.learning_topics GROUP BY 1,2 HAVING COUNT(*)>1) d;` |
| `P-DUP-3` | Duplicate | the 4 tables with unique indexes | **No** — `uq_session_questions_session_index`, `uq_session_question_chunks`, `uq_session_question_attempts_question_number`, `uq_linter_validation_corpus_rule_chunk` | Validity check only, as `P-ORPHAN-2`. |
| `P-RANGE-1` | Out of range | `learning_chunks` SM-2 columns | **Yes** — `difficulty`, `ease_factor`, `repetitions`, `interval_days` and `consecutive_failures` carry **no** `CHECK` constraint | `SELECT COUNT(*) FROM public.learning_chunks WHERE difficulty NOT BETWEEN 1 AND 5 OR ease_factor < 1.3 OR ease_factor > 3.0 OR repetitions < 0 OR interval_days < 0 OR consecutive_failures < 0;` |
| `P-RANGE-2` | Out of range | timestamp columns | **Yes** — `bigint` epochs with no bound | `SELECT COUNT(*) FROM public.learning_chunks WHERE created_at <= 0 OR updated_at < created_at OR next_review_at <= 0;` and the same shape over the other `bigint` timestamp pairs. |
| `P-RANGE-3` | Out of range | the CHECK-constrained columns | **No** — 17 `CHECK` constraints already foreclose these | Validity check only. |

### 6.3 Results — not executed

| Query | Result |
| --- | --- |
| `Q1` … `Q5` | **not executed — no credential** |
| `P-ORPHAN-1`, `P-ORPHAN-2`, `P-ENC-1`, `P-ENC-2`, `P-NULL-1`, `P-NULL-2`, `P-DUP-1`, `P-DUP-2`, `P-DUP-3`, `P-RANGE-1`, `P-RANGE-2`, `P-RANGE-3` | **not executed — no credential** |

**No cell reads `0`, and none may be read as one.** An unexecuted probe and a probe that returned
zero are different states, and conflating them is precisely how a pathology reaches a real migration
believed absent. Registered as spike **`SPK-S6-2`**, with the same expiry discipline as `SPK-S6-1`.

The residual — that a pathology nobody probed for survives into the real migration — is the
charter's own OUT-2-owned § Risks row, authored as **`R9`** in `92_risk-register.md`, carrying the
pre-flight re-run and the abort condition the real migration must therefore include.

**The pathology class for which no probe could be written** is the second finding OUT-2 requires,
and it is **`F-S6-2`**: mis-ownership is undetectable by aggregate because no column distinguishes
principals (§2.2). It is a class of latent wrongness that the probe set structurally cannot reach,
and it is reported here rather than left as an unstated limit of the set.

### 6.4 What became of `LD-S3-32`

SUB-3 inventoried the aggregate result set as `LD-S3-32`, classified it *not personal data*, and
recorded that it "does not exist at position 3"
(`03_learner-data-inventory-and-classification.md:474`). SUB-5 restated the same at
`05_the-enforcement-point-that-confines-every-read-and-write.md:613`–`:614`, naming it as SUB-6's to
produce.

**It does not exist at position 8 either.** The queries above are its specification; its values are
what a credential would supply. SUB-3's classification was correct and remains correct — it is a
classification of an artifact that has still not been brought into being, and the party that was to
produce it could not. Registered as **`F-S6-4`** and as open item **`OI-S6-1`**, so the package does
not carry a classified artifact that silently never appeared.

---

## 7. The synthetic dry-run, and the evidence SUB-3 named this sub-task to supply

SUB-3 recorded the dry-run dataset's exclusion from the sixth copy class at position 3 and named
**SUB-6, at position 8**, as the party that evidences it — "with its generation record and its
no-copied-rows audit. That evidence is SUB-6's acceptance, not this chapter's"
(`03_learner-data-inventory-and-classification.md:500`–`:501`). This section supplies it.

### 7.1 The generation record

The generator's inputs are enumerated exhaustively, because §7.2's argument depends on the
enumeration being complete.

| Input | What it is | Source | Carries learner data? |
| --- | --- | --- | --- |
| `G-IN-1` | The table and column definitions — names, types, nullability, defaults, constraints | `src/infrastructure/db/schema.ts`; `drizzle/0010_create_infrastructure_mcp_request_log.sql`; `drizzle/0012_extend_mcp_request_log.sql`; `drizzle/0013_create_operation_event_log.sql` | **No.** Tracked source; contains no rows. |
| `G-IN-2` | Per-table row counts | `Q1`–`Q5` (§6.1) | **No.** Scalar counts. |
| `G-IN-3` | Per-pathology incidence counts | `P-*` (§6.2) | **No.** Scalar counts. |
| `G-IN-4` | Timestamp extents — `MIN`/`MAX` only | `Q4` | **No.** Two scalars per table. |
| `G-IN-5` | Pseudo-random values for every content column | The generator's own PRNG, seeded from a recorded constant | **No.** Synthesized. |

Every synthetic distribution ties back to the aggregate it came from: row cardinality per table to
`G-IN-2`; the incidence of each reproduced pathology to its `G-IN-3` probe; the time axis to
`G-IN-4`; every string, number and JSON body to `G-IN-5`.

**The record's honest state.** `G-IN-1` and `G-IN-5` are available now. `G-IN-2`, `G-IN-3` and
`G-IN-4` are the unexecuted aggregates of §6.3. **The dataset therefore has not been generated**, the
dry-run has not been run, and no unclaimed-row count is reported — because reporting one would mean
reporting a count over a dataset that does not exist. Registered as **`OI-S6-2`**.

### 7.2 The no-copied-rows audit — an input-closure argument

An empirical audit — generate the dataset, then diff every row against production — is impossible
here twice over: the dataset does not exist, and the comparison would itself require extracting the
production rows that the charter does not authorize. The audit is therefore performed as a
**closure argument over the generator's inputs**, which is available now and is strictly stronger
than the empirical form.

> **Claim.** No dataset the generator can produce contains a row copied out of production.
>
> **Argument.** A copied row can only appear in an output if a row entered an input. §7.1 enumerates
> the generator's complete input set as five items. `G-IN-1` is tracked source text. `G-IN-2`,
> `G-IN-3` and `G-IN-4` are the results of `COUNT`, `MIN` and `MAX` — aggregate functions whose
> return type is a scalar, and which therefore cannot carry a row even in principle. `G-IN-5` is
> synthesized locally. No input has row type. Therefore no output contains a copied row. ∎
>
> **Why it is stronger than the empirical audit.** It quantifies over *every* dataset the generator
> can emit, not over the one instance that happened to be produced. An empirical diff confirms one
> sample; this confirms the construction.
>
> **Its falsifier, stated so the claim is falsifiable.** The argument fails the moment any generator
> input is a **row-valued** query rather than a scalar aggregate — a `SELECT *`, a `LIMIT 10`
> sample, a `DISTINCT` over a content column, or any extract of real values "for realism". Any such
> input admits a copied row and overturns the exclusion. This is exactly the event
> `DR-C11-S3-3`'s revision trigger names at
> `decision-records/DR-C11-S3-3_package-own-copies-and-the-derivation-test.md:103`–`:105`.

**The exclusion is therefore evidenced.** The dataset is **not** a member of the sixth copy class,
on the derivation test SUB-3 recorded at position 3 — *does this artifact contain data derived from
real learner rows?* — and the answer is no by construction. Note the precision the test requires:
the dataset is derived *from aggregates of* learner rows, which is not the same as containing data
derived from learner rows in the sense the test means; SUB-3 classified those aggregates separately
as `LD-S3-32`, *not personal data*, exactly so this distinction holds.

**Consistent with SUB-3's boundary, this chapter sets no owner, no retention bound and no
destruction condition for the dataset**, and does not audit its contents beyond the above. Those are
terms, and SUB-3 recorded that no term attaches. The data flow is forward-only and unchanged: SUB-3
records the exclusion → SUB-6 evidences it → SUB-9 states it in the matrix. Nothing here is owed
back to SUB-3, and SUB-3 is not re-run on account of it.

### 7.3 The throwaway SQL

The dry-run SQL is scratch verification code: written to run once against the synthetic dataset and
be discarded. **It is explicitly not the OUT-19 migration artifact** — SUB-13 (NEU-1006) authors the
executable, reviewed migration plan at implementation fidelity from the dispositions settled here.
Because the dataset does not exist, the throwaway SQL has not been written; had it been, it would be
published only as dry-run evidence and would land nowhere under `src/` or `drizzle/`.

### 7.4 Production counts and generated counts are never the same number

Stated as a standing rule for any reader of a future revision: the counts in §6.1 would be counts
**of production**, taken by aggregate. Any count the dry-run produces is a count **of the generated
dataset**. At this revision both sets are empty for different reasons — the first for want of a
credential, the second for want of the first — and neither may be presented as the other.

---

## 8. The C010 45-category cross-check, in both directions

C010's inventory holds exactly 45 categories, `SC-S3-1` … `SC-S3-45`, across seven sub-tables in §3
of `../C010-system-and-repository-architecture/04_state-category-inventory.md`, with the roll-up at
`:528`–`:535`. Of those, **17 are backed by a persisted database row** (`SC-S3-1` … `SC-S3-17`) and
**28 are not** — ten process-local in-memory (`SC-S3-18` … `-27`), three derived-never-persisted
(`-28` … `-30`), eleven required-by-upstream with no store (`-31` … `-41`), and four assumed
(`-42` … `-45`).

**Direction 1 — every persisted category maps to a disposition.** All 17 appear in §3's table. The
mapping is not one-to-one with tables, because three tables carry more than one category:
`learning_chunks` carries `SC-S3-2`, `-3` and `-4` (content, scheduling state, audit verdict) and
`session_question_attempts` carries `SC-S3-9` and `-10` (attempt, pre-review snapshot). The
arithmetic closes: 14 tables + 2 surplus categories on `learning_chunks` + 1 on
`session_question_attempts` = **17**. **Unmatched: 0.**

**Direction 2 — every table maps to a category.** All 14 tables in §1.1 carry an `SC-S3-*` id in
§3's table. **Unmatched: 0.**

**Both zeros are derived, and the method is stated so the reader can check rather than trust.** Each
of the 17 persisted categories was resolved to a table by reading C010's own entry, and each of the
14 tables to a category by the same walk in reverse; the two counts were then reconciled by the
arithmetic above. The zeros are the result of that walk, not an assertion of completeness — and the
walk's falsifier is that C010's 45 is itself only as complete as its own six named falsifiers at
`../C010-system-and-repository-architecture/04_state-category-inventory.md:508`–`:521`, which this
chapter did not re-derive.

**One category is worth naming for what it becomes.** `SC-S3-45` — "Learner-identity → owner
mapping" — is one of C010's four *assumed* categories, with no store today, and it is the category
whose stand-in is `A-28` itself. It is the one category this migration **brings into existence**:
the backfill of population A is the first time that mapping is persisted anywhere. It is not a gap
in the cross-check; it is the cross-check's forward edge, and it is recorded here rather than left
to be noticed later.

---

## 9. Staging, and the reversal position per stage

### 9.1 The migration is staged, and that is forced rather than chosen

SUB-5 already established that `user_id NOT NULL` cannot be added to a populated table in one step —
`F-S5-10`, evidenced at `91_findings-register.md:596` against `NEU-850`'s `OUT-2` as reproduced at
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`.
A single-step migration is therefore not among the options `A-28`'s envelope leaves open in
practice, notwithstanding that the envelope's text permits one. This chapter consumes that finding
rather than re-deriving it, and states the consequence: **staged**, in five stages.

### 9.2 The stages and their reversal positions

| Stage | Action | Reversal | What is lost on reversal | What cannot be recovered at all |
| --- | --- | --- | --- | --- |
| **S1** | Archive: move pre-cutover rows of both log tables to the retained store; live tables continue from empty | Move them back | Nothing, provided the archive is retained | **Nothing** — the rows are moved, never deleted. This is the whole reason `archive` beat `delete`. |
| **S2** | Purge `context_tokens` | None — the rows are gone | The rows | **The rows.** But every one of them is already void under `DR-C10-S8-2`'s reject-don't-grandfather rule, consumed by OUT-13, so the loss is entailed by a decision already taken rather than caused here. This is the **only irreversible step in the set.** |
| **S3** | Add the ownership column to the ten population-A tables, **nullable** | Drop the column | Nothing | Nothing |
| **S4** | Backfill: direct for rows 1, 3, 9; by join for rows 2, 4, 5, 6, 7, 8, 11. **Entry condition: V1–V7 of §5 pass.** | Set the column back to `NULL` | Nothing | **Nothing** — and this is a property of the uniformity, not a lucky accident. A backfill that wrote one value everywhere carries no information that could be lost by unwriting it; the value is re-derivable from the same verification. The premise that makes S4 risky (§2.2) is the same premise that makes it perfectly reversible. |
| **S5** | Set the column `NOT NULL` | Drop the constraint | Nothing | Nothing |

**Four of five stages are fully reversible with nothing lost.** The fifth destroys only rows that a
consumed upstream decision has already voided. No stage in this migration destroys learner data, and
that is a deliberate property of the disposition set rather than an outcome of it: alternative 2 in
§4.2 was rejected partly on exactly this ground.

**What the reversal does not give back.** Reversing S1 restores the rows to the live tables, but the
window in which the aggregate of §4.4 under-reported is not replayed, and any post-cutover row
written during the reversed period sits alongside pre-cutover rows again — re-creating the mixed
population S1 existed to end. Reversal is therefore a containment step, not a return to the prior
state, and SUB-7 owns the distinction between containment and full reversal under OUT-4.

---

## 10. The deploy pipeline's smoke run — is there a third cause?

`F-S5-12` records that the smoke-run break has **two independent causes**: SUB-4's transport gate,
and SUB-5's enforcement point, whose clause 3 refuses every row-owning operation for a `client`-kind
principal one layer lower — so "relaxing, deferring or unmounting the transport gate does not
unbreak the smoke run"
(`05_the-enforcement-point-that-confines-every-read-and-write.md:1217`–`:1221`).

The pipeline is real and its shape is not in dispute: `.github/workflows/cd-prod.yml:156`–`:160`
performs a `client_credentials` grant against the production IdP, and
`.github/workflows/cd-prod.yml:170`–`:174` runs the smoke suite against production, whose
`init_agent_context` scenario at `tests/smoke/smoke.test.ts:163`–`:196` mints a real
`context_tokens` row through `src/adapters/drizzle/context-token-repository.ts:17`.

**This chapter's disposition adds no third standing cause, and the reasoning is stated per stage
rather than asserted.**

- **S2, purging `context_tokens`** — operates once, at cutover, on rows that already exist. The
  smoke run does not present a pre-existing token; it *mints a new one* on every run. Deleting old
  rows cannot affect a subsequent insert. **No cause.**
- **S3–S5, the population-A column work** — touches ten tables, none of which the
  `init_agent_context` path reads or writes. The smoke suite's other two scenarios do exercise
  learning-domain reads, but they fail for the two causes already recorded, not for a new one: the
  refusal happens at the adapter before any predicate over the new column is evaluated. **No cause.**
- **S1, the archive** — the log tables are written by the audit and event transports at
  `src/transport/pg-audit-transport.ts:117`–`:118` and
  `src/transport/pg-event-transport.ts:109`–`:110`. Moving the tables creates a window in which
  those writes can fail. That is a **transient write-unavailability window during the migration**,
  not a standing refusal that persists after it, so it is not a third cause of the break `F-S5-12`
  describes. It is nonetheless a new sequencing input SUB-7 does not otherwise have, and both
  transports buffer and drop rather than crash (`OBJ-10`), so the failure mode is lost audit
  entries, not a failed deploy. Recorded as **`F-S6-5`** and handed to SUB-7.

**Conclusion: two causes, unchanged.** One new transient window, named and routed.

---

## 11. Consistency with SUB-15's `OBJ-*`

A one-time sweep over production rows is exactly the kind of operation SUB-15's objectives constrain,
and the check returns one real conflict rather than a clean pass.

| Objective | Value | This migration against it |
| --- | --- | --- |
| `OBJ-1` (`15_operational-objectives-for-the-real-platform.md:248`) | ≤ 4 concurrent DB-bound calls without queueing; pool `max: 4` at `src/infrastructure/db/client.ts:42` | **Consistent, with a constraint.** A bulk `UPDATE` holds one of four connections for its duration. The sweep must be **batched** with a bounded statement time so it never holds more than one connection or blocks the other three. |
| `OBJ-7` (`:254`) | ≥ 7 unannounced restarts per day, tolerated with no operator action | **Consistent, with a constraint.** At that cadence the sweep will be interrupted. It must be **idempotent and resumable** — every stage in §9.2 re-runnable to the same end state. S3–S5 are naturally idempotent; S1 and S2 must be written to be. |
| `OBJ-8` (`:255`) | Planned unavailability per restart ≤ 13 s for 99.9%, ≤ 65 s for 99.5%, ≤ 131 s for 99% | **CONFLICT.** Migrations run at boot, unconditionally, with no environment guard (`15_operational-objectives-for-the-real-platform.md:30`, citing `src/transport/main.ts:27` and `src/infrastructure/db/migrate.ts:38`–`:50`). A sweep over the log tables extends boot by its own duration, and there is no deploy-independent way to defer it. Any run exceeding 13 s breaches the 99.9% objective on that boot. **Registered as `R-S6-2`.** |
| `OBJ-12` (`:259`) | Exactly 1 concurrent boot-time migrator — and SUB-15 records that **the platform cannot currently guarantee this** | **Consistent by inheritance, and the residual is cited, not re-raised.** Two overlapping migrators running S1 or S4 concurrently is a real hazard, but it is SUB-15's `R-S15-3`, already registered with an owner. This chapter adds the requirement that every stage be safe under concurrent execution, and cites rather than duplicates. |
| `OBJ-10` (`:257`) | ≤ 60 s of audit traffic lost per circuit-open window | **Consistent.** Named above as the reason S1's transient window degrades to lost audit entries rather than a crash. |

`R-S6-2`'s mitigation is bounded honestly: the sweep can be batched so that **each boot** does a
bounded slice, keeping any single boot inside `OBJ-8` while the whole migration spans several boots.
That converts a single long breach into many short ones, which is better but is not "no breach", and
the design cannot do better while a schema change and its deployment are not separable events. The
residual is owned and escalates to `NEU-896`.

---

## 12. The `A-28` envelope check

`A-28`'s tolerance envelope, at
`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:111`, tolerates the
migration "being staged, reversible, or run in a single step" and tolerates "existing global rows
being backfilled to a single owner, quarantined, or archived."

| Disposition | Envelope clause it exercises | Inside? |
| --- | --- | --- |
| `backfill` / `backfill-by-join` | "backfilled to a single owner" | **Yes**, and precisely — a single owner is exactly what §2.2's premise supplies. |
| `purge` | None of the three by name | **Yes, by entailment.** The rows are void under a consumed C010 decision (`DR-C10-S8-2`), so their removal is that decision's consequence, not a fourth migration action the envelope has to tolerate. |
| `archive` | "archived" | **Yes**, verbatim. |
| `no-key-owed` | None of the three by name | **Yes, under either reading.** Either the envelope ranges only over rows carrying learner data, in which case `linter_rule_validation_report` is outside its subject matter; or it ranges over every existing row, in which case `no-key-owed` **coincides in effect with "quarantined"** — no learner path reaches the table before or after, so the two readings produce the same end state. The disposition is inside the envelope on both, and no amendment routes. |
| Staging | "staged" | **Yes** — and forced by `F-S5-10` (§9.1). |

**The invalidating outcome did not fire.** `A-28`'s named invalidator is a finding that safe
isolation requires a *separate deployment or a separate datastore*
(`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:113`). Nothing here
requires either: the archive is a store in the same database, outside the confined surface by
predicate and access rule rather than by relocation. **No amendment is routed to `NEU-895`.**

**One note this chapter owes and no predecessor could give.** `A-28`'s re-validation trigger is
"**NEU-893 lands** — its package is published under `docs/research/`"
(`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:115`). This chapter
is part of that package, so publishing it is part of the event that fires the trigger. The chapter
does not perform the re-check — that is the trigger's owner's — but it records that the disposition
set above is what the re-check will be run against for OUT-2's half.

---

## 13. Consistency checks against C010

Every C010 item this chapter touches was checked one by one. The check returned **empty** — no
contradiction, and **no amendment is routed to `NEU-895`**.

| C010 item | How this chapter touches it | Result |
| --- | --- | --- |
| `A-28` | Envelope check, §12 | Inside, under every disposition. Consistent. |
| `SC-S3-1` … `SC-S3-17` | Bidirectional cross-check, §8 | 0 unmatched both ways. Consistent. |
| `SC-S3-45` | Named as the category this migration creates, §8 | An **addition**, not a contradiction. |
| `NEU-850`'s `OUT-2` | Consumed as the ownership-key constraint; cited at `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53` | Honoured. The backfill writes the key that decision requires. |
| `OI-S5-1` (owner `NEU-850`) | Whether "every core table" ranges over the two log tables | **Not resolved here, and deliberately not needed.** The `archive` disposition does not add an ownership column to either log table, so it is correct under *both* readings of `OI-S5-1`. This chapter cites SUB-3's stand-in `A-S3-1` for the reading the package adopted, and takes no reading of its own. |
| `DR-C10-S8-2` | Consumed for `context_tokens`' purge justification | Consistent; the purge is the rule's consequence. |
| `F-S5-3` / `F-S8-1` (the 46 / 43 / 3 surface) | Re-counted independently at this cutoff | **Confirmed: 46 registered, 43 gated, 3 exempt.** Counted from the 12 registration calls in `src/server/tools.ts:18`–`:30` and the exempt set at `src/transport/context-token-middleware.ts:5`–`:9`. Consistent with the settled figure. |

**On `42`:** the corrected surface is 46 / 43 / 3 and `42` is not a codebase fact. No line number
cited in this chapter lands on line 42 of any file.

---

## 14. Source-change confirmation

No file under `src/` or `drizzle/` is changed by this sub-task. Both trees are read as evidence and
cited throughout; neither is edited. Nothing is applied, no migration is executed, and no DDL is
authored here — the DDL is SUB-13's, from the dispositions settled above. The package `README.md` is
SUB-14's and is not touched.

---

## 15. Ids allocated by this sub-task

| Register | Ids |
| --- | --- |
| Outcome (`90_outcome-register.md`) | `OUT-2` |
| Findings (`91_findings-register.md`) | `F-S6-1` … `F-S6-5` |
| Risk (`92_risk-register.md`) | **`R9`** (charter § Risks row 9), plus `R-S6-1`, `R-S6-2` |
| Open items (`93_open-items-and-provisional-register.md`) | `OI-S6-1`, `OI-S6-2` |
| Caps (`94_caps-and-incomplete-scope.md`) | none filed |
| Stand-ins (`95_stand-in-assumption-register.md`) | `A-S6-1` |
| Spikes (`96_spike-register.md`) | `SPK-S6-1`, `SPK-S6-2` |
| Completeness gate (`97_package-completeness-gate.md`) | `G-S6-1` … `G-S6-12` |
| Decision records | `DR-C11-S6-1`, `DR-C11-S6-2`, `DR-C11-S6-3` |

**One charter `R<n>` row, correctly.** Charter § Risks row **9** is the only one of the fifteen
naming OUT-2 as its owning outcome, and `92_risk-register.md:32` pre-allocates it to SUB-6 by name.

---

## 16. What this chapter does not establish

- **It asserts no production quantity.** No row count, no population size, no probe result. Every
  count in §6 reads *not executed — no credential*, and no cell reads `0`.
- **It does not confirm the target subject.** §5 publishes the procedure and gates the backfill on
  it; the observation was not obtainable. OUT-2's target-subject criterion is **not met**, and is
  recorded as such rather than hedged.
- **It does not decide what a data right does to the pre-cutover population.** That is SUB-9's, and
  §4.3 draws the line explicitly. `F-S8-2` remains blocking and remains SUB-9's.
- **It sets no owner, retention bound or destruction condition** for either the archive or the
  dry-run dataset. Both are terms, and both belong to other parties.
- **It does not prove the single-principal premise.** `A-S6-1` is `[unconfirmed]`, and `F-S6-2`
  records that no aggregate can settle it.
- **It authors no DDL and applies nothing.** SUB-13 writes the migration; SUB-7 sequences it.
- **It does not claim a QA pass.** No `qa-execution` engine is registered, so the automated QA phase
  is a genuine Core Article 8 no-op, already carried at package level as `CAP-S1-3`.
- **It does not re-derive C010's 45.** §8's two zeros are the result of a stated walk, and inherit
  C010's own falsifiers.

---

## What this chapter hands forward

| Id | What it is | Who consumes it |
| --- | --- | --- |
| `DR-C11-S6-1` | The three-population split and the five-value migration-disposition vocabulary, distinct from SUB-8's erasure enum | **SUB-13** (NEU-1006) authors DDL from it; **SUB-7** (NEU-1001) sequences it; **SUB-14**, **SUB-17** |
| `DR-C11-S6-2` | `archive` for the pre-cutover log population — close it, move it out of the confined surface, delete nothing | **SUB-9** (NEU-1003), whose three propagation options it preserves and whose target population it makes finite; **SUB-13**; **SUB-7** |
| `DR-C11-S6-3` | The aggregate-then-generate derivation, the generation record, and the input-closure exclusion argument | **SUB-9** (states the exclusion in the matrix at position 11); **SUB-3**'s recorded exclusion, now evidenced |
| The §3 disposition table | 14 tables, 14 justified dispositions, zero unaddressed | **SUB-13** — the direct input to OUT-19's migration plan |
| §5's procedure V1–V7 | The target-subject verification, and the entry condition it imposes on the backfill stage | **SUB-13** (the runbook's gate), **SUB-7** (the stage's entry condition), **SUB-1** (`SPK-S6-1`'s method) |
| §6's query set | 5 counting queries, 12 named probes, and the structural analysis of which pathologies are foreclosed by constraint | **SUB-13**, which must re-run it pre-flight; the implementation charter, via `NEU-896` |
| §9.2's five stages | The reversal position per stage, and the identification of S2 as the only irreversible one | **SUB-7** (NEU-1001) under OUT-3 and OUT-4 |
| `R9` | The High charter § Risks row, authored here, with its pre-flight re-run and abort condition | **SUB-14** (aggregates, authors nothing), **SUB-17** (audits), `NEU-896` (inherits the obligations) |
| `F-S6-2` | Mis-ownership is undetectable by aggregate — the pathology class with no writable probe | **SUB-9**, **SUB-17**, and the creator as the only party who can settle it |
| `F-S6-3` | The Tier-2 aggregate under-reports for five weeks after cutover, then becomes fixable | **SUB-7** (sequencing), **SUB-13** (the migration) |
| `F-S6-4` / `OI-S6-1` | `LD-S3-32` does not exist at position 8 either — a classified artifact that still has not been produced | **SUB-14** (OUT-20's band reconciliation), **SUB-17** |
| `F-S6-5` | S1's transient write-unavailability window — a new sequencing input, **not** a third cause of the smoke-run break | **SUB-7** (NEU-1001) |
| `R-S6-2` | The `OBJ-8` conflict: a boot-time sweep cannot be deferred and extends boot past the 99.9% budget | **SUB-7**, **SUB-15**'s objectives, `NEU-896` |
| **Confirmed: two causes** | This chapter's disposition adds **no third standing cause** to `F-S5-12`'s smoke-run break | **SUB-7**, which sequences around both |
