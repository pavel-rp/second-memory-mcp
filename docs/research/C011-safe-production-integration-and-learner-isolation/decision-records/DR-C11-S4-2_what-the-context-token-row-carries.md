# `DR-C11-S4-2` — The `context_tokens` row carries an identifier, a determined kind and a claim provenance, and the identifier is a learner key only when the kind says so

**Task:** NEU-996 (SUB-4) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-13 (`../90_outcome-register.md`) — what the row carries beyond `id` / `created_at` / `expires_at`, and how `init_agent_context` obtains a principal on each transport

---

## Decision

**`context_tokens` gains three columns — `principal_id`, `principal_kind`, `principal_claim_source`
— written at mint time and never afterwards. `principal_id` is a learner key if and only if
`principal_kind = 'user'`.** Six clauses.

1. **`principal_id`** holds the identifier the token authorizes: on HTTP with a `sub`, the `sub`
   claim **verbatim** — which is the learner key; on HTTP without a `sub`, the `azp` value, which is
   an identifier and **explicitly not** a learner key; on STDIO, the configured principal identifier.
2. **`principal_kind`** holds `user` or `client`, **determined** per `DR-C11-S2-2`'s three-outcome
   table and **never inferred from the audience shape**.
3. **`principal_claim_source`** holds the provenance — `token:sub`, `token:azp`, or
   `configured:transport-principal`. It is a separate field and is never encoded into the identifier
   string, per `DR-C11-S2-3`.
4. **The binding rule is that `principal_id` is a learner key if and only if `principal_kind` is
   `user`.** A consumer reading the identifier without the kind has re-created the
   `payload.sub || azp` collapse at `src/transport/jwt-middleware.ts:127` one layer lower.
5. **All three columns are added nullable, and are set `NOT NULL` only after the unbound rows are
   purged.** A `NOT NULL` column cannot be added to a table holding live unbound rows without
   backfilling them — which is grandfathering, forbidden by `DR-C10-S8-2` clause 4 — or deleting
   them first. Until then the gate treats a NULL binding as **reject**.
6. **No tool input schema changes.** All 43 gated tools already declare `context_token`; zero
   schemas newly declare an identity argument. What changes is the argument's *meaning* —
   `DR-C10-S8-2` clause 3, consumed unchanged.

---

## Rationale

**Three columns rather than one, because one cannot express the distinction the enforcement point
has to make.** The enforcement point must be able to tell three states apart: *this token belongs to
a learner and here is the key*, *this token belongs to a service principal and learner access must
be refused*, and *this token is unbound and must be rejected outright*. A single nullable identifier
column collapses the second and third into one — a `client`-kind token would look exactly like an
unbound one — and `DR-C11-S2-2` requires the second to be **refused** rather than silently reduced
to nothing. Two of the three columns exist to keep those states distinguishable; the third exists
because `DR-C11-S2-3` obligated recording which claim the identity came from, and named this row as
the at-rest site for it.

**Clause 4 is the whole decision's load-bearing sentence, and it is the one most likely to be
violated.** The deployed code today computes `subject = (typeof payload.sub === 'string' &&
payload.sub) || azp` at `src/transport/jwt-middleware.ts:127` — a single value with the two kinds
already merged. `DR-C11-S2-1` unmerges them at the transport edge. If a later consumer reads
`principal_id` and treats it as an owner key without consulting `principal_kind`, the merge is
simply reintroduced further down, where there is no token left to re-derive the kind from. That is
why the kind is stored on the row rather than recomputed, and why the failure mode is registered as
a risk with an owner rather than left as an instruction.

**Clause 5 is forced by clause 4 of the decision above it.** The natural schema instinct — declare
the binding `NOT NULL`, since an unbound token is meaningless — cannot be executed in one step
against a table with live rows. The only two ways to satisfy `NOT NULL` immediately are to backfill
the existing rows with some principal, which is grandfathering under a different name and would
attribute one learner's tokens to whichever principal was chosen, or to delete them, which is
correct but must happen after the enforcing code is live so that nothing re-creates unbound rows
behind the migration. So the nullability is staged and the ordering constraint is stated. The DDL
itself is OUT-19's artifact, not this record's.

**Clause 6 is what makes the change cheap on the surface and expensive in meaning.** No schema
diff will show anything: the 43 gated tools already declare `context_token`. What changes is that
the argument stops being a session handle and becomes a principal-bearing capability. C010 already
named this as a change a structural diff cannot see, and SUB-11's contract inherits the detection
obligation.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **One column holding the `sub` only, NULL for a service principal** | Collapses two states the enforcement point must separate: a `client`-kind token becomes indistinguishable from an unbound one, so the gate cannot refuse learner access for the first while rejecting the second outright. Directly contradicts `DR-C11-S2-2`'s refuse-don't-empty-scope rule |
| 2 | **Store the whole verified claim set as JSON on the row** | Stores far more learner-derived data than any consumer needs, and widens SUB-3's inventory: `LD-S3-13` classifies `context_tokens` as *not* personal data at this cutoff, and a claim-set blob would make it personal data in a much larger way than three narrow columns do. No named consumer needs a claim the three columns omit |
| 3 | **Bind to a hash of the `sub` rather than the value** | `DR-C11-S2-1` fixes the learner key as the `sub` **verbatim**, with no hash, prefix or normalization, precisely so it joins to the `user_id` column `NEU-850`'s `OUT-2` establishes. A hash on the token row would not join to an unhashed owner column, and hashing both would put this package in the business of re-deciding `NEU-850`'s key format |
| 4 | **Bind at first use rather than at mint** | `DR-C10-S8-2` clauses 1–2 fix mint time, and the reason survives re-examination: a token that exists unbound between mint and first use is a token any caller can claim by being the first to present it. First-use binding turns a race into an authorization mechanism |
| 5 | **A second table mapping token id to principal**, leaving `context_tokens` untouched | No second consumer justifies the join, and it reintroduces the unbound token as a *legal* state — a row in `context_tokens` with no row in the mapping table — which is exactly the state clauses 4–5 exist to make illegal |
| 6 | **Reuse `id` as the principal**, one long-lived token per principal | Destroys the TTL semantics the table already implements (`expires_at`, and the index on it at `src/infrastructure/db/schema.ts:320`), and makes a single leaked identifier a permanent credential rather than a bounded one |

---

## Consequences

1. **The enforcement point receives exactly what it needs and nothing more:** one identifier, one
   determined kind, one provenance. SUB-5 designs against that shape.
2. **Check `I5` becomes answerable from stored state**, not only at the transport edge where the
   token still exists. `principal_claim_source` is what makes the derivation legible after the fact.
3. **`I2` becomes satisfied for `context_tokens` itself** — each row resolves to exactly one
   principal expressed as a server-held value — and is unchanged for every other category, where it
   still turns on `NEU-850`'s `OUT-2` ownership column.
4. **The migration acquires a mandatory ordering**: add nullable → enforce → purge → set `NOT NULL`.
   A plan that sets `NOT NULL` earlier must grandfather, and grandfathering is forbidden.
5. **A silent-violation risk is created and named.** Clause 4's rule cannot be enforced by the
   schema; a consumer that ignores `principal_kind` produces wrong answers that look right.
   `R-S4-1`, owner **SUB-5 (NEU-997)**, escalating to `NEU-895` (C010), which owns check `I5`,
   co-named `NEU-896`.
6. **`OI-S8-1`'s mechanism is supplied and the item stays open.** Its resolving event is a migration
   landing on `origin/develop`
   (`../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:418`),
   which this package may not produce.
7. **What becomes harder:** `context_tokens` stops being an anonymous three-column table the moment
   this lands. SUB-3's `LD-S3-13` already records that it becomes learner-identifying when a
   principal is bound, so a retention position it currently does not need becomes something the
   package will eventually owe. `DR-C11-S4-3` wires the purge so that this decision does not *open*
   that question as a side effect, but it does not answer it.

---

## Evidence

| Claim | Source |
| --- | --- |
| `context_tokens` declares exactly `id`, `created_at`, `expires_at` and one index | `src/infrastructure/db/schema.ts:312`–`:321`; `drizzle/0014_create_context_tokens.sql` |
| The gate checks existence and expiry only | `src/transport/context-token-middleware.ts:43`–`:88`; `src/adapters/drizzle/context-token-repository.ts:39`–`:55` |
| The token is read from a per-call argument | `src/transport/context-token-middleware.ts:62` |
| The deployed code merges `sub` and `azp` into one subject value | `src/transport/jwt-middleware.ts:127`; the 401 path at `:129`–`:131`; the response-local at `:133`–`:136` |
| `init_agent_context` is exempt, takes an empty schema, and mints the token | `src/transport/context-token-middleware.ts:5`–`:9`; `src/server/server-context-tools.ts:21`, `:33` |
| The learner key is the `sub` verbatim; `azp` is never one | `DR-C11-S2-1_the-persisted-learner-key.md` |
| Kind is determined by `sub`-presence; a `client` principal is refused, not empty-scoped | `DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` |
| Provenance is a separate field, stored at rest on the `context_tokens` binding | `DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md` |
| Bind at mint; no schema change; reject-not-grandfather; the obligation is on unwritten code | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` clauses 1–4, 7 |
| `OI-S8-1` — the row has nothing to bind to — and its resolving event | `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:410`–`:419` |
| `context_tokens` becomes learner-identifying once a principal is bound | `../03_learner-data-inventory-and-classification.md`, entry `LD-S3-13` |
| The learner key is written to `user_id` unchanged | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:51` |

---

## Revision trigger

- **`NEU-850`'s `OUT-2` changes its key format** — anything other than the JWT subject written
  verbatim invalidates clause 1 and re-opens rejected alternative 3.
- **A second consumer of the token binding appears** that needs a claim the three columns omit,
  which would re-open rejected alternative 2 on a real requirement rather than a speculative one.
- **`OI-S2-1` closes with a finding that `sub` is not stable per principal** — the identifier would
  then need a stability story the three columns do not carry, and `R-S2-1` would escalate.
- **A migration adding a principal column lands on `origin/develop`** with a shape other than this
  one, which would make this record a description of a road not taken and route a finding.
