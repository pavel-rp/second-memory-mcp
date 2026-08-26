# `DR-C11-S13-1` — Two carriers keep two different `principal_kind` domains, the `iff` rule is written as a database `CHECK`, and the token row's learner key becomes a generated column

**Task:** NEU-1006 (SUB-13) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `fd05ca1`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-19 (`../90_outcome-register.md`) — the constraint shape of the schema DDL, and the routing `F-S5-6` and `R-S4-1` each left open

---

## Decision

1. **The two attribution carriers keep two different `principal_kind` domains, and the two `CHECK`
   constraints are written to be consistent rather than identical.** `public.context_tokens` takes
   `CHECK (principal_kind IN ('user','client'))`; the two log tables take
   `CHECK (principal_kind IN ('user','client','none'))`. This is SUB-5's own reconciliation —
   *"`none` is unreachable on the token row and reachable at the enforcement point"*
   (`../05_the-enforcement-point-that-confines-every-read-and-write.md:266`–`:276`) — realized rather
   than re-argued. `F-S5-6` is discharged.

2. **The `iff` rule is a database constraint wherever the row holds the facts it needs.** On both log
   tables, `CHECK ((principal_kind = 'user') = (learner_key IS NOT NULL))`. Both operands are
   non-`NULL` by construction — `principal_kind` is `NOT NULL` and `IS NOT NULL` never yields `NULL`
   — so the biconditional is total and has no three-valued-logic escape.

3. **On `context_tokens` the rule is made structural by a generated column**, not by a `CHECK`:
   `learner_key TEXT GENERATED ALWAYS AS (CASE WHEN principal_kind = 'user' THEN principal_id END)
   STORED`. A consumer reading `learner_key` cannot obtain a service principal's identifier, because
   the database consulted the kind when it computed the value. This is what SUB-5 meant by SUB-13
   *"mak[ing] it structural in DDL"*
   (`../05_the-enforcement-point-that-confines-every-read-and-write.md:1436`).

4. **A token row is wholly bound or wholly unbound.**
   `CHECK (num_nonnulls(principal_id, principal_kind, principal_claim_source) IN (0, 3))`, plus a
   constraint pairing `token:sub` with `user` and `token:azp` with `client` while leaving
   `configured:transport-principal` compatible with either, because on STDIO the kind is the
   operator's **declared** kind (`DR-C11-S4-1` clause 2).

5. **What the schema cannot enforce is named, not implied.** The ten owned tables store `user_id`
   with no `principal_kind` beside it, so no constraint there can check that the writer was a `user`.
   That guarantee is upstream, at the adapter (`DR-C11-S5-1` clause 3), and the residual is
   registered as `R-S13-4`.

6. **The ownership column is `user_id TEXT`**, from `NEU-850`'s `OUT-2` verbatim, carrying SUB-5's
   widening of the *value* to *"the resolved principal identifier"* so the key is well-defined on
   STDIO. The widening is SUB-5's and is cited as SUB-5's.

---

## Rationale

**Two domains looked like a contradiction and are not one.** `DR-C11-S4-2` gives the token row a
two-valued kind and `DR-C11-S16-1` gives the log tables a three-valued one; `F-S5-6` records that no
predecessor reconciled them and routes the reconciliation here, naming this sub-task as *"the party
that would otherwise emit two contradictory `CHECK` constraints"*. The temptation is to pick one
domain and impose it on both, and both directions are wrong. Widening the token row to admit `none`
would create a representable state that cannot occur — a token row exists only because a principal
was determined — and a constraint that permits an impossible value is a constraint that stops
catching the bug it was written for. Narrowing the log tables to two values is the failure
`DR-C11-S16-1` decision 4 rejects outright: it would fold *a determined service principal* together
with *no determination was made*, recreating at the log layer exactly what `DR-C11-S2-2` rejected at
the query layer. Two domains, both correct for their own table, is the answer; what was missing was
someone writing both and saying so in one place.

**The `iff` rule had to become a constraint somewhere, or `R-S4-1` stays a note.** `R-S4-1` is the
risk that a consumer reads the identifier without the kind. SUB-4 registered it *"because a rule
whose violation is invisible is not a mitigation"*; SUB-5 closed it at the port boundary by making
the principal an indivisible pair. Neither closes it in the database, and the database is where the
rows outlive every process that wrote them. On the log tables the closure is easy, because
learner-key-ness *is* nullability there. On the token row it is not, because `principal_id` is
non-null under both kinds — the property is about how the column is *read*.

**The generated column is the move that makes it structural.** It adds no asserted state: it is a
pure function of two columns `DR-C11-S4-2` already fixes, so it contradicts nothing and re-decides
nothing. What it changes is the failure mode. Before it, "read `principal_id` and ignore
`principal_kind`" is a mistake a reasonable engineer makes and no test catches. After it, the
learner key is a column whose value is `NULL` for every non-`user` row, and the mistake requires
deliberately reading the raw identifier instead of the key. It also aligns the vocabulary: the same
concept is now spelled `learner_key` on all three carrier tables, which is the sort of thing that
prevents the next collapse rather than merely documenting the last one.

**The honest limit is stated because the strong claim is available and wrong.** It would be easy to
write that this chapter "closes `R-S4-1`". It closes it on the two carriers and cannot close it on
the ten owned tables, where the fact a constraint would need is not in the row. Saying so is
`R-S13-4`.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **One `principal_kind` domain across all three tables, three-valued.** | Genuinely tempting — one constraint, one vocabulary, no asymmetry to explain. It admits `none` on a table where `none` cannot occur, which turns a constraint that would catch a partially-written binding into one that permits it. The asymmetry is a property of the two tables' domains, not a defect. |
| 2 | **One domain, two-valued.** | The failure `DR-C11-S16-1` decision 4 rejects by name: `client` and `none` are distinct states, and folding them recreates the `sub \|\| azp` collapse at the log layer. |
| 3 | **A Postgres `ENUM` type instead of `CHECK` constraints.** | An enum is one type shared by both tables, which forces alternative 1 or 2. It also makes adding a value a catalog migration with its own locking behaviour, against a `CHECK` that is a one-line `ALTER`. The repository already uses `CHECK` for exactly this — **twenty-four** `check(` declarations across `schema.ts`, counted at this cutoff — so `CHECK` is also the convention. |
| 4 | **Enforce the `iff` rule by application convention only, as `R-S4-1`'s mitigation already does at the port boundary.** | It is what SUB-5 already did, and SUB-5 nonetheless handed the DDL job forward — because the port boundary protects the process, not the rows. A row written by a future migration, a psql session or a second service bypasses the port entirely. The database constraint is the only one that binds all writers. |
| 5 | **A `learner_key` column on `context_tokens` written by the application rather than generated.** | Same shape, one more thing to get wrong: an application-written copy can disagree with `principal_kind` on a row, which is the exact state the constraint exists to forbid. A generated column cannot disagree with its own inputs. |
| 6 | **Put the ownership column on nine tables and let `session_chunks` inherit through its session, per `../05_the-enforcement-point-that-confines-every-read-and-write.md:335`.** | Closest to a real fork. It loses because OUT-2 owns the dispositions and gives `session_chunks` `backfill-by-join`, which by SUB-6's own vocabulary means the row *receives* a key; because `T7`'s and `T9`'s exit conditions are stated over **ten** tables and would be unsatisfiable over nine; and because a table with no key of its own cannot carry the adapter's predicate without a join the predicate does not have. Registered as `F-S13-1` and routed to SUB-5 rather than resolved by preference. |
| 7 | **Name the column `principal_id` on the ten tables, matching the token row.** | More internally consistent, and it contradicts `NEU-850`'s `OUT-2`, which says `user_id` in as many words. A contradiction of a converged upstream decision would route an amendment to `NEU-895` for a naming preference. The value's widening is SUB-5's and is already carried; the name is not this chapter's to change. |

---

## Consequences

1. **`F-S5-6` is discharged.** The two domains are written once, in one place, with the reason. SUB-14's
   cross-register consistency check has a single artifact to check against rather than two chapters
   that disagree.
2. **`R-S4-1` is closed structurally on both carriers and explicitly open on the ten owned tables.**
   The residual has an id (`R-S13-4`) and an owner instead of being implied by silence.
3. **The DDL now depends on PostgreSQL 12 or later**, in two places: the generated column here and the
   `SET NOT NULL` scan-skip in the migration plan. The repository's compose pins `pg16`; production is
   off-repo and unobserved. `SPK-S13-1`.
4. **A divergence with a merged sibling is on the record.** `F-S13-1` routes to SUB-5. This chapter
   made a choice in order to be executable and named the choice as a choice; SUB-5 owns the
   resolution.
5. **What becomes harder:** the generated column cannot be altered in place. Changing its expression
   means dropping and re-adding the column, which on a populated table is a rewrite. Acceptable here
   only because `T5` empties the table wholesale four stages before the column is tightened.
6. **Nothing is verified.** No constraint in this record has been applied to any database. Every claim
   about what Postgres does is a claim about documented behaviour, not an observation.

---

## Evidence

| Claim | Source |
| --- | --- |
| The token row's three columns, their values per transport, and their staged nullability | `DR-C11-S4-2_what-the-context-token-row-carries.md`; `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §4 |
| The log carrier's two columns, `TEXT NOT NULL` / `TEXT NULL`, and `learner_key` non-null iff kind is `user` | `DR-C11-S16-1_the-attribution-carrier.md` decision 1 |
| `client` and `none` must never be folded together | `DR-C11-S16-1_the-attribution-carrier.md` decision 4 |
| The two domains are unreconciled by any predecessor, and the reconciliation routes to SUB-13 | `../05_the-enforcement-point-that-confines-every-read-and-write.md:262`–`:276` (`F-S5-6`) |
| `R-S4-1` is settled at the port boundary as an indivisible pair, and SUB-13 makes it structural in DDL | `../05_the-enforcement-point-that-confines-every-read-and-write.md:1436`; `DR-C11-S5-1_the-enforcement-point.md` clause 2 |
| The enforcement point refuses `client` and `none`; a refusal, never an empty result set | `DR-C11-S5-1_the-enforcement-point.md` clause 3 |
| `user_id`, `NOT NULL`, on every core table, keyed to the JWT subject | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53` |
| That decision is converged but unimplemented — *"never an existing schema fact"* | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:65`–`:66` |
| `session_chunks` inherits ownership through its session rather than carrying its own key | `../05_the-enforcement-point-that-confines-every-read-and-write.md:335` |
| `session_chunks` takes `backfill-by-join`, and `backfill-by-join` means the row receives a key | `../06_the-disposition-of-every-unowned-row.md` §2.1, §3 row 4 |
| `T7` and `T9` state their exit conditions over ten tables | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:358`, `:378`–`:379` |
| `CHECK` is the repository's existing convention for a value domain | `src/infrastructure/db/schema.ts:118`–`:122`, `:303`–`:308` |
| `context_tokens` has three columns and no principal today | `src/infrastructure/db/schema.ts:312`–`:321` |
| The two log tables are raw SQL with no Drizzle definition | `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`; `drizzle/0013_create_operation_event_log.sql:1` |
| `learning_sessions.status` is `NOT NULL` and constrained to `active`/`completed`, so the partial index's predicate is well-defined | `src/infrastructure/db/schema.ts:107`, `:122` |

---

## Revision trigger

- **SUB-5 resolves `F-S13-1`.** If `session_chunks` is confirmed to carry no key of its own, clause 6's
  table set drops to nine and `T7`/`T9`'s exit conditions must be restated by their owner.
- **`SPK-S13-1` returns a PostgreSQL major version below 12.** Clause 3's generated column is
  unavailable and `R-S4-1`'s structural closure on the token row is lost; the fallback is an
  application-written column plus a `CHECK`, which is rejected alternative 5 and is strictly weaker.
- **`NEU-850`'s `OUT-2` is amended** — the column name or the `NOT NULL` obligation changes. Clause 6
  is re-derived; this record does not own that decision.
- **A third carrier appears.** Any new table that stores a principal must state which of the two
  domains it takes and why, or clause 1's reconciliation stops being complete.
- **`DR-C11-S4-2` gains a fourth column or drops one.** Clause 4's `num_nonnulls(...) IN (0, 3)` is
  arity-dependent and must be re-derived, not merely edited.
