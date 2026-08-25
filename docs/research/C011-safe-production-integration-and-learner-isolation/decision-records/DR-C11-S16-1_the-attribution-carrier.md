# `DR-C11-S16-1` — Attribution is a new server-derived column pair, because both existing candidate columns are caller-asserted, and the pair is three-valued so the service principal is a state and not a silence

**Task:** NEU-999 (SUB-16) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-15 (`../90_outcome-register.md`) — the clause *"it resolves the attribution gap directly"*. Consumed by SUB-8 (OUT-11), SUB-9 (OUT-12), SUB-12 (OUT-17) and SUB-13 (OUT-19).

## Decision

1. **Attribution is carried by a new column pair, written at the transport boundary from the
   signature-verified token**, on each of the two log tables:

   | Column | Type | Nullability | Value |
   | --- | --- | --- | --- |
   | `principal_kind` | `TEXT` | `NOT NULL` | exactly one of `user`, `client`, `none` |
   | `learner_key` | `TEXT` | `NULL` | the OIDC `sub` claim **verbatim**, non-null **if and only if** `principal_kind = 'user'` |

   `principal_kind` reproduces `DR-C11-S2-2`'s determined kind unchanged, with a third value `none`
   for a record written where no principal was determined at all. `learner_key` reproduces
   `DR-C11-S2-1`'s learner key unchanged. **Neither value is re-derived here**; both are carried.

2. **`azp` is never written to `learner_key`.** A `client`-kind row carries
   `principal_kind = 'client'` and `learner_key = NULL`. This is `DR-C11-S2-1`'s rule applied at the
   log layer, not a new rule.

3. **Neither `session_id` nor `correlation_id` may be reused as the carrier**, because both are
   **caller-asserted**:
   - `mcp_request_log.session_id` is lifted verbatim out of the tool call's own arguments —
     `src/transport/audit-middleware.ts:94`–`:99` reads `params.arguments.session_id` and
     `String()`s it. It is cross-checked against nothing: not the verified subject, not the MCP
     transport session, not `context_tokens`.
   - `correlation_id` on **both** tables echoes a caller-supplied header —
     `src/transport/http.ts:154`–`:157` takes `x-correlation-id`, sanitizes it to printable ASCII
     capped at 128 characters, and mints a `randomUUID()` **only when the header is absent**.

   Writing attribution into either would make the principal caller-asserted, which is exactly what
   `DR-C10-S8-2` forecloses and what C010's check `I5` tests for
   (`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`).
   Recorded as `F-S16-1`.

4. **Three values, not two.** `client` and `none` are distinct states and must never be folded
   together. A `client`-kind row is *a determined service principal that owns no learner state*; a
   `none` row is *no determination was made*. Collapsing them recreates, at the log layer, precisely
   the failure `DR-C11-S2-2` rejected at the query layer (its rejected alternative 5): a
   misconfiguration becomes indistinguishable from ordinary emptiness. The whole reason attribution
   is worth adding is that it makes a state observable; a two-valued carrier would add the column and
   keep the silence.

5. **The carrier is indifferent to the audience shape, and that is what makes it correct on this
   deployment.** Per `F-S2-1` (`../91_findings-register.md`), ADR-0001's NEU-909 amendment records
   that *"the claude.ai connector in production authenticates with a manually provisioned static
   client (`claude-web`) rather than DCR"*
   (`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`). The production
   human-learner path is therefore **principal shape 2, the static client** — not the DCR `dyn$`
   shape. A carrier that read the audience would misclassify the actual learner. This carrier reads
   `sub` off the verified token and never looks at `aud`, so it is correct on the static-client path,
   on the DCR path, and on any fourth shape that appears.

6. **This record proposes a shape; it performs no change.** Nothing under `src/` or `drizzle/`
   changes in this sub-task. The DDL is **SUB-13**'s (NEU-1006) under OUT-19; the enforcement point
   is **SUB-5**'s (NEU-997) under OUT-8; the sequencing is **SUB-7**'s (NEU-1001) under OUT-3.

7. **STDIO cannot be attributed by this carrier, because STDIO writes no row to attribute.**
   `src/transport/main.ts:55`–`:58` constructs the server and a bare `StdioServerTransport`; the
   audit middleware, the JWT middleware and the context-token gate are all constructed only inside
   the `mode === 'http'` branch at `:46`–`:54`. Attribution on STDIO is therefore a **two-step**
   problem — emission first, then attribution — and this record supplies only the second step. The
   first is named as a missing emission with an owner in
   `../16_attribution-and-detection.md` §4.

## Rationale

**The gap is not "no column"; it is "two columns that look like they would do".** A reader coming to
`infrastructure.mcp_request_log` sees `session_id` and `correlation_id` and reasonably concludes that
attribution is a matter of joining one of them to something. Both are dead ends, and they are dead
ends for the *same* reason, which is why this record states the reason once rather than twice: the
value arrives from the caller. `correlation_id` is the more dangerous of the two precisely because it
is *usually* a server-minted `randomUUID()` — it is trustworthy on every request where the client
declines to set the header, and untrustworthy on exactly the requests where a client chose to. A
carrier that is sound most of the time is not sound; it is a carrier whose failures are selected by
the adversary.

**Why the learner key is copied rather than referenced.** The alternative is a foreign key to a
principal table. That table does not exist, and the log tables are raw-SQL `infrastructure` tables
outside the Drizzle schema
(`drizzle/0010_create_infrastructure_mcp_request_log.sql`, `drizzle/0012_extend_mcp_request_log.sql`,
`drizzle/0013_create_operation_event_log.sql`), so a reference would create the package's first
cross-schema constraint for no gain. It would also be *wrong under erasure*: the audit row must
remain interpretable as evidence of what happened, and a foreign key to a row an erasure deletes
either blocks the erasure or leaves a dangling reference. Copying the key verbatim keeps the erasure
predicate simple — `WHERE learner_key = $1` — which is the whole point.

**Why `principal_kind` is `NOT NULL`.** A nullable kind would give the column four states, the
fourth being *the writer did not say*, which is a silence dressed as data. `none` is an explicit
determination that no principal was determined, and it is a value a signal can count.

**Why not wait for the ownership column OUT-8 obligates.** The two carriers are different objects.
OUT-8's column records *who owns a row of learner state*; this pair records *who made a request*.
They coincide on the common case and diverge on exactly the cases detection cares about — a request
by principal A that returned a row owned by B. Deriving one from the other would erase the
comparison the cross-learner-access signal is built on
(`../16_attribution-and-detection.md` §3, `SIG-S16-1`).

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Reuse `session_id` as the principal.** | It is the *learning* session id read out of the tool call's own arguments (`src/transport/audit-middleware.ts:94`–`:99`), unverified against anything. Attribution built on it is attribution the caller writes. It also already means something else, so overloading it would collide with the domain's own `session` term — the vocabulary risk SUB-17 owns. |
| 2 | **Reuse `correlation_id`.** | The strongest-looking alternative, and the worst. It is present on **both** tables, already indexed (`drizzle/0012_extend_mcp_request_log.sql:5`, `drizzle/0013_create_operation_event_log.sql:14`), and usually a server-minted UUID — so it would work in testing and fail selectively in production, on precisely the requests where a caller set `X-Correlation-ID` deliberately (`src/transport/http.ts:154`–`:157`). A carrier whose soundness is chosen by the caller is not a carrier. |
| 3 | **A single `learner_key` column, null for everything that is not a learner.** | Simplest schema, and it folds `client` into `none`. That is `DR-C11-S2-2` rejected alternative 5 re-created one layer down: a machine principal wired into a learner path becomes indistinguishable from an unauthenticated request. The chapter would then owe a detection design for a signal it had just deleted. |
| 4 | **Write `azp` into `learner_key` for `client`-kind principals**, so every row has a key. | Contradicts `DR-C11-S2-1` outright — *"`azp` is never a learner key"*. It would also make a `client` row match a `WHERE learner_key = $1` erasure predicate if a client id ever collided with a `sub`, which is a cross-principal deletion. |
| 5 | **Derive attribution at read time** by joining `correlation_id` (or the MCP session id) against the in-memory subject-binding map. | The map is process-local: `src/transport/http.ts:83` declares it inside `startHttpTransport`, and `F-S15-3` establishes that its only eviction path is a clean session close (`:212`–`:218`) plus shutdown drain. After any redeploy it is empty — and the measured deploy cadence is **≥3.29 restarts/day over the most recent 7 days** (`../15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`). The join would be empty for most of the log's history. It also fails open at `src/transport/http.ts:57`–`:58`, where a missing binding returns `true`. |
| 6 | **Determine attribution from the audience shape** — `dyn$` means a learner, a static audience means a machine. | False on this deployment. `F-S2-1` establishes the production learner arrives on the **static client** `claude-web`, so this rule misclassifies the actual learner as a machine. It is the same rule `DR-C11-S2-2` rejected as its alternative 4, and it fails here for the same evidence. |
| 7 | **Add a foreign key to a new principals table** rather than copying the key. | Creates the package's first cross-schema constraint between `infrastructure` and `public`, and makes the erasure predicate depend on a row the erasure is trying to delete. Rejected on both counts; see § Rationale. |

## Consequences

1. **SUB-13 (NEU-1006) receives a fully specified column pair** — names, types, nullability and the
   `iff` invariant — rather than a requirement to invent one. **SUB-5 (NEU-997)** receives the point
   at which the values are read (the verified token, at the transport boundary).
2. **The service principal becomes a countable state.** `R-S2-2`'s exposure — the smoke principal
   silently acquiring a `sub` and beginning to own rows — becomes observable as a change in the
   `principal_kind` distribution rather than as nothing at all. `DR-C11-S2-2` handed that detection
   gap to this sub-task by name; this column pair is what closes it, and the signal built on it is
   `SIG-S16-1`.
3. **A cost, and the sharpest one in this chapter: attribution creates a mixed-population table.**
   Rows written before the carrier lands carry no key, and **they can never be given one** — the only
   structure that ever held the binding is the process-local map, and it is already gone
   (`src/transport/http.ts:83`; `F-S15-3`). A per-learner erasure over either table is therefore
   provably incomplete for all pre-cutover rows. Carried as `F-S16-5` and `R-S16-1`, and handed to
   **SUB-9** (NEU-1003), which must give the pre-cutover population a disposition rather than a key.
4. **A second cost: the tables grow a column whose value is `none` for every row on STDIO** — and
   under consequence 7 of the decision, no STDIO row exists to carry it. The `none` value is
   therefore populated only by HTTP requests that reached the audit middleware without a determined
   principal, which is itself the failed-confinement signal (`SIG-S16-2`).
5. **Nothing is routed back to SUB-2.** This record consumes `DR-C11-S2-1` and `DR-C11-S2-2`
   unchanged and adds only a persistence site for values they already fixed.

## Evidence

| Claim | Source |
| --- | --- |
| `session_id` is lifted verbatim from the tool call's arguments and verified against nothing. | `src/transport/audit-middleware.ts:94`–`:99`; emitted at `:107` |
| `correlation_id` echoes a caller-supplied header and mints a UUID only in its absence. | `src/transport/http.ts:154`–`:157` |
| `correlation_id` is persisted to both log tables. | `drizzle/0012_extend_mcp_request_log.sql:2`; `drizzle/0013_create_operation_event_log.sql:4` |
| Neither log table has any principal, subject, user or learner column. | `drizzle/0010_create_infrastructure_mcp_request_log.sql`; `drizzle/0012_extend_mcp_request_log.sql`; `drizzle/0013_create_operation_event_log.sql` |
| The learner key is the `sub` claim verbatim, and `azp` is never a learner key. | `DR-C11-S2-1_the-persisted-learner-key.md`; `../02_identity-the-learner-key-and-principal-kind.md` §3 |
| Principal kind is determined by `sub`-presence, never by the audience shape, and a `client` principal is admitted holding no learner state with learner access refused rather than empty-scoped. | `DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` decisions 1–3 |
| The production learner path is the static client `claude-web`, not DCR. | `../91_findings-register.md` § `F-S2-1`; `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67` |
| The principal must be server-derived, never caller-asserted. | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md`; check `I5` at `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` |
| The subject-binding map is process-local, its only eviction path is a clean close, and it fails open on a missing binding. | `src/transport/http.ts:83`, `:57`–`:58`; `../91_findings-register.md` § `F-S15-3` |
| STDIO reaches no audit, JWT or context-token middleware. | Branch split at `src/transport/main.ts:46`–`:54` (HTTP) and `:55`–`:58` (STDIO); the three are mounted only inside `startHttpTransport`, at `src/transport/http.ts:164` (JWT), `:180` (audit) and `:186` (context-token gate), which the STDIO branch never calls. C010 records the same fact at `../../C010-system-and-repository-architecture/02_findings-register.md:266` (`F-S5-4`). |
| Deploy cadence is ≥3.29 restarts/day over the most recent 7 days. | `../15_operational-objectives-for-the-real-platform.md` §2.2 (`C-17`) |

## Revision trigger

1. **A principal column is added to either log table by any route**, with a shape other than this
   pair — the carrier is then settled by that change and this record is superseded rather than
   applied.
2. **`DR-C11-S2-1` or `DR-C11-S2-2` is revised** — the carrier copies both verbatim, so any change to
   the learner key or to the kind domain propagates here directly.
3. **A fourth `principal_kind` value becomes necessary**, which would mean a principal shape appeared
   that `sub`-presence cannot classify (`DR-C11-S2-2` revision trigger 5).
4. **`correlation_id` stops being caller-settable** — if `src/transport/http.ts:154`–`:157` is
   changed to ignore the inbound header, rejected alternative 2's disqualifying ground disappears and
   the reuse option is worth re-taking on cost grounds.
5. **STDIO begins emitting an audit record**, at which point decision 7's two-step framing collapses
   to one step and the carrier applies to both transports uniformly.
