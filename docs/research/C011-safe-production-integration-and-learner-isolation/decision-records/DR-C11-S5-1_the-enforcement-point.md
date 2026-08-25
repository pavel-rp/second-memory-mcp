# `DR-C11-S5-1` — Confinement is a principal-scoped Drizzle adapter, bound at construction to an indivisible `(principal_id, principal_kind)` pair and constructed per request, with the database as an independent second layer

**Task:** NEU-997 (SUB-5) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `cc38cc9`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-8 (`../90_outcome-register.md`) — the clause naming, per port, where confinement is mechanically implemented, at or below the port boundary.

## Decision

**Five clauses.**

1. **The enforcement point is the Drizzle adapter.** The confinement predicate is written inside each
   row-owning adapter method, in the query that method already issues. It is not applied by a wrapper
   above the port interface, not in `src/orchestration/`, and not in `src/server/`. This places it at
   or below the port boundary, which is what `I3`'s third conjunct requires
   (`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:172`)
   and what `A-28`'s tolerance envelope admits
   (`../../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:111`).

2. **The principal is a constructor argument, and it is an indivisible pair.** Every row-owning
   adapter takes `(principal_id, principal_kind)` **as one value**, alongside the `db` handle it
   already takes. Not a method argument, and not `principal_id` alone.

3. **`principal_kind` decides whether a predicate exists at all.** `user` — every read and write
   carries the owner predicate and every insert sets the column from the principal, ignoring any
   caller-supplied value. `client` — every row-owning operation is **refused**. `none` — refused.
   A refusal, never an empty result set. The enforcement point reads the **three-valued** domain
   (`user | client | none`).

4. **Adapter instances are request-scoped.** `createProductionPorts` (`src/composition-root.ts:317`–`:334`)
   takes the resolved principal and runs per request. The `pg.Pool` is untouched and still constructed
   once (`src/infrastructure/db/client.ts:37`–`:53`); what becomes per-request is the adapter objects.

5. **The database is a second, independent defence, and it is not the primary one.** Row-level
   security keyed to a per-transaction setting is **recommended** as defence in depth and explicitly
   not named as the enforcement point, because the pool is shared and connections are reused, so a
   session-level setting leaks between requests unless every row-owning read runs inside a
   transaction. Most do not today. Carried as `OI-S5-1`.

## Rationale

**Why the adapter and not orchestration.** C010's finding at
`../../C010-system-and-repository-architecture/02_findings-register.md:237` establishes that the
single-learner guard sits in orchestration, above the port boundary, and is therefore **outside**
`A-28`'s envelope — so a port-boundary mechanism scopes the repository reads and leaves the guard
adjudicating "any". Placing new enforcement in the same layer would reproduce the defect the finding
records. The adapter is the lowest point in the process that still sees a typed query.

**Why a constructor argument and not a method argument.** Check `I5`
(`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`)
asks whether the principal is *server-derived rather than caller-asserted*. Orchestration is above the
port boundary; a principal it passes as an argument is a principal it can vary, and a value a caller
can vary is caller-asserted at the point of use. Binding at construction removes the degree of
freedom rather than documenting that it should not be used. It is also the shape
`DR-C10-S8-2`'s token-bound identity already chose one layer up, for the same forgeability reason.

**Why an indivisible pair.** `R-S4-1` (`../92_risk-register.md:259`–`:267`) records that nothing in
the schema can enforce "this column means something different depending on that column", and names
**SUB-5 (NEU-997)** as the party positioned to make the rule structural *"by taking
`(principal_id, principal_kind)` as an indivisible pair at the port boundary rather than a value and
a flag"*. This clause is that fix. An adapter that receives one value cannot select on the identifier
while ignoring the kind, because there is no separate identifier to select on.

**Why refusal rather than an empty scope.** `DR-C11-S2-2` rejects empty-scoping at the transport on
the ground that a silent empty result is indistinguishable from a learner with no data. The same
argument holds one layer down and with more force: at the adapter there is no token left from which
a reader could reconstruct why the result was empty.

**Why request-scoped construction.** It is the single change that lets all 53 `AppContext` closures
inherit a principal without any signature change — see `../05_the-enforcement-point-that-confines-every-read-and-write.md`
§5.1. Answering the closure question individually would mean threading a `principal` parameter through
`AppContext`, every workflow and every tool handler, which is the caller-asserted shape rejected
above. The cost is allocation, not connections, so it does not move `OBJ-1`.

**Why the database is second and not first.** The envelope admits either or both. The pool is shared
at `max: 4` (`src/infrastructure/db/client.ts:42` — a line number, not a tool count) and connections are reused, so a session-scoped
GUC is a correctness hazard across requests. Making RLS primary would therefore require wrapping every
row-owning read in a transaction, which increases connection hold time against a pool of four and
interacts with `OBJ-1` in a way no observation in this environment can settle. Recommending it as a
second layer keeps the benefit without making the primary mechanism depend on an unresolved cost.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Enforce in the orchestration layer**, wrapping each workflow with an ownership check | Reproduces exactly `../../C010-system-and-repository-architecture/02_findings-register.md:237` — above the port boundary, outside `A-28`'s envelope, and failing `I3`'s placement conjunct. It also cannot see the three `createNote` write paths uniformly: two of them do not run through `notes-workflows.ts`. |
| 2 | **Enforce in the tool layer** (`src/server/`), validating ownership before delegating | Higher still, and worse: all 43 gated tools would each need the check, and a new tool added without it silently bypasses confinement. Enforcement whose completeness depends on every future tool author remembering is not enforcement. |
| 3 | **Pass the principal as a method argument on every port method** | Caller-asserted at the point of use, failing `I5`'s first limb. Also a change to all 82 port method signatures and all their call sites, against a change to ten constructors. |
| 4 | **Make RLS the primary and only enforcement point** | Inside the envelope, and genuinely attractive: it cannot be bypassed by any code path. But on a shared pool with reused connections it requires a transaction-local setting and therefore a transaction around every row-owning read, most of which have none today. That is an unpriced cost against `OBJ-1`'s pool of four, and pricing it needs `t_db`, which is unobserved (`OI-S15-3`). Kept as clause 5's second layer rather than discarded. |
| 5 | **A process-local per-principal cache of scoped port instances**, to avoid per-request construction | Would inherit exactly the leak shape `F-S15-3` records for the existing process-local maps, which evict only on a clean close and have no TTL and no size bound. The thing being avoided — object allocation — is not a measured cost, so the trade is a real leak against an imagined saving. |
| 6 | **Take `principal_id` alone and treat the kind as advisory** | The status quo one layer down, and the failure `R-S4-1` exists to name: a predicate selecting on the identifier alone treats a service principal's `azp` as an owner key, silently, returning plausible rows. The whole point of the residual routed to this sub-task was to close this. |
| 7 | **Read the two-valued `principal_kind` domain** (`user \| client`) that `DR-C11-S4-2` fixes for `context_tokens` | Has no representation for *no principal was determined at all*, so an unauthenticated path and an authenticated machine path collapse into one refusal and an operator cannot tell an outage from an authorization boundary. The two-valued column is correct for its own table, where `none` is unreachable by construction. |

## Consequences

1. **`R-S4-1`'s named residual is settled.** The enforcement point takes the pair; the rule is
   structural rather than advisory. SUB-4's entry at `../92_risk-register.md:267` can be read as
   closed on this limb.
2. **The change set touching the 53 `AppContext` closures is empty.** Their bodies, signatures and
   bindings are unchanged; the change is at the factory and inside the adapters. This is mechanically
   checkable on a diff.
3. **`UnitOfWorkPort` must pass the principal through.** It constructs three fresh tx-scoped adapters
   (`src/adapters/drizzle/unit-of-work-adapter.ts:17`–`:21`); an instance built without the principal
   is an unscoped adapter with a shorter lifetime.
4. **Three ports are not covered by the uniform mechanism** and are named individually:
   `ContextTokenRepository` (confined by unguessable id and expiry, because it carries the principal),
   `Tier2BlockingStatsRepository` (aggregates a table with no ownership key — escapes, routed to
   `CAP-S3-3` / `CAP-S4-1`), and `LinterValidationRepository` (keyed to a rule id, not learner-scoped).
5. **`SUB-13` (OUT-19) inherits two DDL requirements** stated here and authored there: the ownership
   key on each owned table, and a `CHECK` constraint set consistent with the three-valued domain
   across both `context_tokens` and the log tables (`F-S5-6`).
6. **The refusal in clause 3 breaks the production deploy pipeline's smoke run independently of the
   transport gate.** Unmounting or deferring the gate does not unbreak it. `SUB-7` (OUT-3) inherits
   the sequencing obligation; see `F-S5-12`.
7. **Nothing here is applied.** No file under `src/` or `drizzle/` changes. The decision is a design.

## Evidence

| Claim | Source |
| --- | --- |
| The guard sits in orchestration, above the port boundary, outside `A-28`'s envelope | `../../C010-system-and-repository-architecture/02_findings-register.md:237` |
| `I3` requires enforcement at or below the port boundary | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:172` |
| `I5` tests server-derived versus caller-asserted, and kind determined versus assumed | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` |
| `A-28` tolerates the repository-port layer, the schema, or both | `../../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:111` |
| `R-S4-1` names SUB-5 and names the indivisible pair as the structural fix | `../92_risk-register.md:264`, `:267` |
| `principal_id` is a learner key iff `principal_kind = 'user'` | `../04_the-stdio-identity-gate-and-the-bound-context-token.md:251`–`:256` |
| A `client` principal is refused, not empty-scoped | `../02_identity-the-learner-key-and-principal-kind.md:108` |
| The three-valued domain | `DR-C11-S16-1_the-attribution-carrier.md:14` |
| The two-valued domain on `context_tokens` | `../04_the-stdio-identity-gate-and-the-bound-context-token.md:248` |
| Adapters take `constructor(private db: SqlDb = getSql())` uniformly | `src/adapters/drizzle/chunk-repository.ts:93`; `src/adapters/drizzle/session-repository.ts:35`; `src/adapters/drizzle/notes-repository.ts:10` |
| Ports are constructed once today | `src/composition-root.ts:317`–`:334` |
| `UnitOfWorkPort` composes exactly three tx-scoped adapters | `src/adapters/drizzle/unit-of-work-adapter.ts:17`–`:21` |
| The pool is a module-level singleton at `max: 4` | `src/infrastructure/db/client.ts:37`–`:53`, `:42` |
| `OBJ-1` is ≤ 4 concurrent DB-bound calls | `../15_operational-objectives-for-the-real-platform.md:248` |
| Process-local maps evict only on clean close | `../91_findings-register.md:160` (`F-S15-3`) |

## Revision trigger

- **SUB-13 (NEU-1006) authors the DDL** and finds the ownership key cannot be added to a table this
  record scopes, or that the two `principal_kind` domains cannot be reconciled — either routes a
  finding back to SUB-5.
- **`OI-S5-1` resolves** — the transaction cost of clause 5's RLS layer is priced against `OBJ-1`,
  which may promote RLS from second layer to co-primary, or rule it out.
- **A row-owning port is added** that does not take a constructor-bound principal, which would break
  the uniformity clause 2 rests on.
- **`t_db` is observed** (`OI-S15-3`), making clause 5's cost calculable rather than open.
- **Anyone proposes enforcing isolation somewhere other than at or below the port boundary** — which
  `DR-C10-S5-1`'s own revision trigger names as falsifying `I3`'s placement clause.
