# `DR-C11-S6-1` — The 14 tables are partitioned by what evidence can attribute their rows, and each partition takes a different migration disposition

**Task:** NEU-1000 (SUB-6) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `35f92ba`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-2 (`../90_outcome-register.md`) — the clause requiring every table in `src/infrastructure/db/schema.ts` and both raw-SQL log tables to carry a stated disposition, "with the choice justified per table rather than applied uniformly".

---

## Decision

1. **The 14 production tables are partitioned into three populations by the evidence available to
   attribute their rows** — not by schema, not by table size, not by data class.

   | Population | Attribution evidence | Disposition | Tables |
   | --- | --- | --- | --- |
   | **A** | None per row; exactly one human principal, so every row has the same owner | `backfill` / `backfill-by-join` | the 9 learning-domain tables + `linter_validation_corpus` |
   | **B** | None, and the rows are already void under a consumed decision | `purge` | `context_tokens` |
   | **C** | None, and none will ever exist | `archive` | `mcp_request_log`, `operation_event_log` |

   `linter_rule_validation_report` falls outside all three and takes `no-key-owed`.

2. **The migration-disposition vocabulary is five values, and it is deliberately not SUB-8's
   erasure enum:** `backfill`, `backfill-by-join`, `purge`, `archive`, `no-key-owed`. SUB-8's five
   values answer *what an erasure request does to a category*; these answer *what the one-time
   migration does to a table's existing rows*.

3. **`backfill-by-join` is preferred over `backfill` wherever a declared, `NOT NULL` foreign key
   makes the derivation total**, because deriving a key across a constraint the database already
   enforces is strictly safer than re-asserting it. Seven tables qualify. Three do not, each for a
   stated structural reason.

4. **The premise licensing population A — that the pre-cutover learning-domain population has
   exactly one human principal — is registered as `A-S6-1`**, `[unconfirmed]`, with a named owner
   and a re-validation trigger. It is not asserted as fact.

---

## Rationale

The charter forbids a uniform rule and requires a per-table justification. That requirement is
usually a style constraint; here it is a correctness one. The tables genuinely differ in what can be
known about who wrote their rows, and a uniform `backfill` would be *provably wrong* for at least
two of them — `context_tokens`, whose population is mixed with the deploy pipeline's
`client_credentials` principal, and the two log tables, which record that same non-learner principal's
requests. Applying one rule everywhere would commit exactly the `sub`-versus-`azp` mis-pinning that
`NEU-850`'s own risk register names.

Partitioning on *evidence* rather than on data class is what makes the split predictive. A data-class
split would put `notes` and `mcp_request_log` together — both hold learner free text — and then have
to explain why they take opposite dispositions. The evidence split separates them on the first cut:
`notes` belongs to a population with one principal, and `mcp_request_log` belongs to one whose rows
can never be attributed at all.

The preference for `backfill-by-join` follows from the same logic. Where `learning_chunks.topic_id`
is `NOT NULL` with `ON DELETE CASCADE` (`src/infrastructure/db/schema.ts:53`–`:55`), the chunk's
owner is already totally determined by the topic's; writing the key by join makes the migration
consistent with a constraint the database enforces, rather than asserting the same fact a second time
from an external source that could disagree with it. Where the FK is nullable — `learning_sessions.topic_id`,
`ON DELETE SET NULL` at `src/infrastructure/db/schema.ts:103` — the join is not total and would leave
orphaned sessions unkeyed against a `NOT NULL` target, so the direct form is the only complete one.
Where no FK is declared at all — `notes.target_id`, polymorphic — the join is unavailable outright.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **One uniform disposition for all 14 tables** | Provably wrong for `context_tokens` and both log tables, whose populations include a non-learner principal. Also forbidden by OUT-2's own text. |
| 2 | **Partition by data class** (personal / operational / derived) | Puts `notes` and `mcp_request_log` in the same bucket though they take opposite dispositions, and would then need a second, evidence-shaped rule to separate them. The evidence split does the work in one cut. |
| 3 | **Partition by schema** (`public` versus `infrastructure`) | Cuts across the real boundary in both directions: `context_tokens` is `public` but takes `purge`, and `linter_validation_corpus` is `infrastructure` but takes `backfill-by-join`. |
| 4 | **Reuse SUB-8's five-value erasure enum** | Different axis. `unreachable` is a statement about a *predicate's* reach over a category; a migration needs a statement about an *action* on a table. Reusing the vocabulary would make §4.3's remit boundary unstateable, because the two sub-tasks would appear to be answering the same question. |
| 5 | **`backfill` everywhere in population A, never by join** | Discards a constraint the database already enforces and re-asserts the same fact from an external source, admitting a class of disagreement that the join form cannot have. |
| 6 | **Defer the whole disposition until a credential exists** | The dispositions are decisions about *which action is correct*, and none of them turns on a row count. Deferring would block SUB-7, SUB-9 and SUB-13 on an observation that changes no answer here. |

---

## Consequences

1. **SUB-13 (NEU-1006) receives a table it can write DDL from directly** — 14 rows, each naming an
   action and a justification, with the join edges named per table.
2. **The backfill is gated, not merely recommended.** `DR-C11-S6-3`'s verification procedure is an
   entry condition on the backfill stage, so an unverified target subject cannot reach production
   through this design even if the gate's result is never obtained.
3. **`A-S6-1` becomes load-bearing for ten of the fourteen tables**, and its unfalsifiability by
   aggregate is registered as `F-S6-2`. A reader who rejects `A-S6-1` must reject population A's
   disposition with it; the dependency is explicit rather than buried.
4. **`no-key-owed` introduces a fifth value the `A-28` envelope does not name.** The envelope check
   shows it is inside under either reading of the envelope's scope, so no amendment routes to
   `NEU-895`.
5. **Nothing is applied.** No file under `src/` or `drizzle/` changes.

---

## Evidence

| Claim | Source |
| --- | --- |
| 12 tables declared in Drizzle, 10 `public` + 2 `infrastructure` | `src/infrastructure/db/schema.ts:21`, `:49`, `:99`, `:126`, `:156`, `:179`, `:197`, `:250`, `:288`, `:312`, `:333`, `:364`; schema block at `:331` |
| 2 further tables exist only in raw SQL | `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`; `drizzle/0013_create_operation_event_log.sql:1`; rationale comment at `src/infrastructure/db/schema.ts:323`–`:330` |
| Zero ownership columns anywhere | Grep over `src/infrastructure/db/schema.ts` and the three log migrations at `35f92ba`; corroborated at `../../C010-system-and-repository-architecture/04_state-category-inventory.md:442`–`:443` |
| `learning_chunks.topic_id` is `NOT NULL` `ON DELETE CASCADE` | `src/infrastructure/db/schema.ts:53`–`:55` |
| `learning_sessions.topic_id` is nullable, `ON DELETE SET NULL` | `src/infrastructure/db/schema.ts:103` |
| `notes.target_id` is polymorphic with no declared FK | `src/infrastructure/db/schema.ts:294`; target selected by `target_type`, constrained at `:303` |
| `notes.author` is a two-value kind enum, not an identity | `src/infrastructure/db/schema.ts:296`, constraint at `:308` |
| The deploy smoke job mints a `context_tokens` row under `client_credentials` | `.github/workflows/cd-prod.yml:156`–`:160`, `:170`–`:174`; `tests/smoke/smoke.test.ts:163`–`:196`; insert at `src/adapters/drizzle/context-token-repository.ts:17` |
| SUB-8's erasure enum is a different axis | `../08_consent-and-what-a-learner-can-export-and-erase.md:392`–`:398` |
| The learner key is the OIDC `sub` verbatim; `azp` never | `../02_identity-the-learner-key-and-principal-kind.md`; `DR-C11-S2-1_the-persisted-learner-key.md` |
| `A-28`'s envelope permits backfill-to-one-owner, quarantine, archive | `../../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:111` |

---

## Revision trigger

1. **`A-S6-1` is refuted** — evidence emerges that more than one human principal wrote pre-cutover
   rows. Population A's disposition is then wrong in the most damaging available direction, and the
   partition must be re-derived rather than amended.
2. **An ownership column lands in `src/` or `drizzle/` by any route before this migration runs** —
   the starting position this record is written against would no longer hold, and the partition
   would be over a schema that no longer exists.
3. **`OI-S5-1` resolves such that the two log tables are in scope for `NEU-850`'s "every core
   table"** — population C's disposition is unaffected, because `archive` adds no ownership column,
   but the record should state the resolution explicitly rather than continue to rely on being
   correct under both readings.
4. **SUB-13 publishes its DDL** — the per-table table is re-verified against the artifact that
   realizes it, and any divergence routes back here as a finding.
