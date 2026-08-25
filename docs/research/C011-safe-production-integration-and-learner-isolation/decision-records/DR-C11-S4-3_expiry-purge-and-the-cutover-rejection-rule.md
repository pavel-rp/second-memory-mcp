# `DR-C11-S4-3` — The dead purge is wired at the mint path, and every pre-existing token is rejected and deleted rather than grandfathered

**Task:** NEU-996 (SUB-4) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-13 (`../90_outcome-register.md`) — the purge path, and the operational consequence of the reject-don't-grandfather rule at cutover

---

## Decision

**`deleteExpired()` is wired at the token-mint path as a bounded opportunistic sweep, and at cutover
every pre-existing row is rejected on presentation and deleted, with a one-shot purge to remove the
rows that are never presented.** Five clauses.

1. **`deleteExpired()` is wired.** The call site is the mint path `init_agent_context` already
   uses — `ctx.createContextToken()`, reached from `src/server/server-context-tools.ts:33`. Today
   the method is declared at `src/ports/context-token-repository.ts:6`, implemented at
   `src/adapters/drizzle/context-token-repository.ts:61`, and called from **nowhere** in `src/`.
2. **The per-row delete that already runs is not a purge and must not be counted as one.**
   `validate()` and `validateWithStatus()` (`src/adapters/drizzle/context-token-repository.ts:39`–`:55`)
   delete the single row they were asked about when it is expired. That removes only rows that are
   **presented**; an abandoned or leaked row is never presented and is never removed.
3. **A periodic sweep in the long-lived HTTP process is a recommended addition, never the
   primary.** A STDIO process that exits when its client disconnects may never fire a timer, so a
   timer-only design is transport-dependent — the exact property check `I4` measures.
4. **At cutover every pre-existing row is rejected, not grandfathered**, per `DR-C10-S8-2` clause 4.
   Four rejection classes are named in `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §8.
5. **A one-shot purge of all unbound rows is part of the cutover, not an optimisation.** Rejection
   on presentation alone leaves behind exactly the rows clause 2 describes, and clause 5 of
   `DR-C11-S4-2` cannot set the columns `NOT NULL` until they are gone.

---

## Rationale

**The mint path is chosen for three properties, and the third is the decisive one.** It needs no new
infrastructure — there is no scheduler anywhere in the composition root, so a timer is a new
component rather than a wiring change. Its frequency is bounded by the thing that creates the rows,
so the sweep cost is proportional to the growth it is offsetting. And it is **transport-agnostic**:
it runs identically on STDIO and HTTP, which is precisely the property the existing middleware
mounting lacks. A purge mounted only where the gate is mounted today would be a second HTTP-only
mechanism in a chapter whose whole subject is transport parity.

**Clause 2 exists because the codebase looks self-cleaning and is not.** There is a delete in the
hot path, it removes expired rows, and it runs in production. A reader who finds it will reasonably
conclude the table maintains itself. It does not, in the one case that matters: the token whose
client crashed, and the token minted by a CI run that ended. Those rows are never presented again
and nothing removes them. Stating the distinction is the point of the clause; without it, "wire the
purge" reads as redundant work.

**The purge is wired rather than declined because binding a principal changes what the table is.**
The charter admits either answer. SUB-3's inventory classifies `context_tokens` as *not* personal
data at this cutoff and records that it becomes learner-identifying the moment a principal is bound
(`../03_learner-data-inventory-and-classification.md`, `LD-S3-13`). Unbounded retention of a
learner-identifying table is a retention position, and this package has not taken one for
`context_tokens`. Wiring the purge means the identity decision does not open a retention question as
a side effect. Declining it would have been defensible only by taking the retention position, which
is outside this sub-task.

**Grandfathering is rejected as a consumed constraint, not re-argued.** `DR-C10-S8-2` clause 4 is
unambiguous, and C010 separately warns against softening the STDIO change *"with a permissive mode,
which would reproduce the current gap under a new name"*
(`../../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:552`).
A grace window is the same softening applied to the token limb.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Leave `deleteExpired()` unwired and rely on the existing per-row delete** | The per-row delete only reaches presented rows (clause 2), so abandoned rows accumulate without bound. It is also the alternative most likely to be chosen by accident, by a reader who mistakes the hot-path delete for a sweep — which is why the distinction is stated rather than assumed |
| 2 | **A periodic timer in the composition root as the primary mechanism** | Transport-dependent in exactly the way this chapter is trying to eliminate: a short-lived STDIO process may exit before any interval elapses. Retained as a recommended addition for the long-lived HTTP process (clause 3), where it strictly helps |
| 3 | **Backfill existing rows to a single owner at cutover** | Grandfathering under another name, forbidden by `DR-C10-S8-2` clause 4. It is also actively harmful rather than merely non-compliant: it would attribute every pre-existing learner's tokens to whichever principal was chosen |
| 4 | **Grandfather with a time-boxed grace window** | The clause admits no window. A window is a permissive mode with an expiry date, and it reproduces the current gap for its duration — the softening C010 named |
| 5 | **Let expired rows accumulate and revisit retention later** | Defers a question this decision would have created. Once a principal is bound the table is learner-identifying, and "revisit later" is a retention position taken by omission. Cheaper to wire the existing, tested method than to owe a position |
| 6 | **Purge at cutover only, with no ongoing sweep** | Fixes the migration and not the mechanism; the table resumes accumulating abandoned rows the day after cutover, and the same decision has to be taken again with a larger table |

---

## Consequences

1. **A dead method becomes live code with a named call site.** `deleteExpired()` moves from
   declared-and-untested-in-production to part of the mint path.
2. **The cutover is a two-part operation**, not one: reject on presentation *and* purge the
   residue. A plan that does only the first cannot satisfy `DR-C11-S4-2` clause 5's `NOT NULL` step.
3. **Every learner loses at most one in-flight call at cutover** and re-mints on the next
   `init_agent_context`. There is no data loss, because a context token owns no state.
4. **The deploy pipeline's smoke run is affected on a different axis and is counted there.** Its
   token is rejected for learner-state tools by the service-principal rule rather than by the
   unbound rule, so it is not fixed by re-minting. `R-S4-2`.
5. **The sweep's cost is unbounded in principle at the first mint after cutover**, when the whole
   accumulated backlog is swept at once. Whether that matters depends on a population nobody has
   observed — `A-S4-1`, resolving through `OI-S1-7` / `SPK-S1-7` — so the one-shot purge in clause 5
   is placed in the migration rather than left to the first unlucky mint.
6. **What becomes harder:** the mint path acquires a database write that can fail independently of
   the mint itself. Whether the sweep's failure may fail the mint is an implementation question
   OUT-19 inherits; the safe reading, consistent with the project's fail-open logging discipline, is
   that a failed sweep must not fail a mint — but that is stated as a reading, not decided here.

---

## Evidence

| Claim | Source |
| --- | --- |
| `deleteExpired()` is declared, implemented, and called from nowhere in `src/` | `src/ports/context-token-repository.ts:6`; `src/adapters/drizzle/context-token-repository.ts:61`; exhaustive search of `src/` at `5111841` returns zero call sites |
| The per-row delete runs inside validation and reaches only presented rows | `src/adapters/drizzle/context-token-repository.ts:39`–`:55` |
| The mint path and its reachable call site | `src/server/server-context-tools.ts:33`; `src/transport/context-token-middleware.ts:5`–`:9` for the exemption that lets it be reached unauthenticated |
| `expires_at` and its index | `src/infrastructure/db/schema.ts:316`–`:321`; `drizzle/0014_create_context_tokens.sql` |
| The deploy pipeline mints a `client_credentials` token every deploy and runs the smoke suite with it | `.github/workflows/cd-prod.yml:145`–`:168`, `:170`–`:174` |
| The smoke suite calls gated learner-state tools with the context token it captured | `tests/smoke/smoke.test.ts:192`, `:207`, `:239` |
| Reject, do not grandfather | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` clause 4 |
| The warning against a permissive mode | `../../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:552` |
| `context_tokens` becomes learner-identifying once a principal is bound | `../03_learner-data-inventory-and-classification.md`, entry `LD-S3-13` |
| The production population of `context_tokens` is unobserved | `../93_open-items-and-provisional-register.md` § `OI-S1-7`; `../96_spike-register.md` § `SPK-S1-7` |

---

## Revision trigger

- **A scheduler lands in the composition root**, which makes rejected alternative 2 available as a
  primary rather than an addition.
- **`OI-S1-7` closes** with a population large enough that a single sweep at mint time is a
  latency problem, which would move the sweep to a bounded batch or to the timer.
- **A retention position for `context_tokens` is taken** by whichever sub-task owns it, which may
  set a shorter bound than `expires_at` and supersede clause 1's timing.
- **`init_agent_context` stops being the sole mint path**, which would leave the sweep attached to
  only one of several and reopen the choice of call site.
