# `DR-C10-S10-1` — One shared Postgres instance with the MCP core as sole credential holder, decided on cross-category transactional atomicity

**Task:** NEU-984 (SUB-10) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `03efe1d`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-8` (`../01_outcome-register.md`) in part — the data-store topology decision, published as `../15_substrate-decisions-and-make-or-reuse-records.md` §5.

---

## Decision

**One Postgres instance holds every state category whose authority is the MCP core — the `public`
learning schema and the `infrastructure` operational schema alike — and the MCP core process is the
only process holding a credential to it.** The web tier holds no database credential and reaches
state only through the gated MCP tool surface.

Five clauses are part of the decision and not commentary:

1. **One physical store for the core-authority categories.** Not one *logical* store behind a
   proxy, and not a primary with a read replica handed to a second consumer. A single instance,
   one connection pool (`src/infrastructure/db/client.ts:5`, `max: 4`).
2. **One credential holder for that store.** The MCP core process. This is the clause `M-A`
   actually rests on: under `DR-C10-S6-1` every state category's authority is the MCP core, and a
   second credential holder would be a second writer regardless of what it intended to write.
3. **Two schemas, not two stores.** `public` and `infrastructure` are namespaces inside the one
   instance. The audit and event transports already resolve `AUDIT_DATABASE_URL ?? DATABASE_URL`
   to the same database through a distinct pool object; that is one store with two pools, and this
   decision keeps it that way.
4. **The web tier's reach is the tool surface, not the store.** 46 tools, 43 gated, 3 exempt
   (`F-S8-1`). This clause is what makes `R3` load-bearing at SUB-7 and what keeps `CC-S8-*`
   the only contract between the tiers.
5. **The citation-drift verdict store is the one carve-out, and it is required rather than
   tolerated.** `SC-S3-33` and `SC-S3-34` are the only inventoried categories whose authority is
   **not** the MCP core — it is `CMP-S4-17`, the drift-verdict producer — and `../08_…md` §8.6
   records their migration path as arriving "inside the drift component's own deployment", with
   `SC-S3-34` carrying an explicit prohibition: **"It must not be co-located under an authority
   that would give any other component a write path to it, because that would put egress-derived
   state under a writer with no egress discipline."** Placing them in the clause-1 store would
   give the MCP core exactly that write path. They therefore sit in the drift component's own
   store, under `CMP-S4-17`'s credential, and the MCP core holds no credential to it.

Clause 5 is a carve-out from clause 1's *scope*, not an exception to its reasoning — see
"Why the carve-out does not reopen the reversal" below.

---

## Rationale

### In-scope basis under SUB-15's rule

`../13_…md` §4.1 makes a choice architecture-material when changing it, on its own, would move a
**boundary**, reassign an **authority**, or alter a **compatibility contract**. Applying §4.2's
three-step test to this choice returns yes on two of the three legs:

| Leg | Would changing the store topology, on its own, do this? |
| --- | --- |
| **B — boundary** | **Yes.** A second store introduces a `web tier ↔ store` pair that no `BND-S4-*` row carries, and it changes the class of the existing `CMP-S4-3 ↔ CMP-S4-9` link that `BND-S4-16` already leaves `undecided`. |
| **A — authority** | **Yes.** A second credential holder is a second writer. `../07_…md` §5.2 states the consequence in its own words: a second credential holder on a shared store means "a second **writer** contradicts `M-A` itself." |
| **C — compatibility contract** | No. The gated-tool surface is unchanged by where the bytes live. |

One yes suffices; this returns two. **In scope.**

### The decisive criterion — cross-category same-transaction atomicity

Seven rows of the `post-validation` authority matrix require an atomic commit that spans **more
than one state category**. Cited from `../10_…md` §8 for authority, clause and status, and
`../08_…md` §8 for the nine attributes:

| Row | Must commit atomically with |
| --- | --- |
| `SC-S3-3` | `SC-S3-9`, `SC-S3-10` |
| `SC-S3-7` | `SC-S3-8` |
| `SC-S3-8` | `SC-S3-7` |
| `SC-S3-9` | `SC-S3-11`, `SC-S3-3` |
| `SC-S3-10` | `SC-S3-9` |
| `SC-S3-11` | `SC-S3-9` — recorded as **"the strongest consistency requirement in the `public` schema"** |
| `SC-S3-39` | the attempt |

Borderline and counted as such: `SC-S3-29` (LearnerContext), **"the one genuine consistency
requirement among the derived rows"**, exposed to a five-way torn read.

`UnitOfWorkPort` does not span components — that premise is stated at `../09_…md` §7 and is one of
the two conditions under which SUB-14's row-walks terminate at all. A physical store split
therefore places at least one of these pairs on opposite sides of a boundary the unit of work
cannot cross, and the requirement stops being satisfiable. This is not a performance argument or a
preference: it is the observation that **a split makes a recorded requirement unmeetable and turns
defined walk outcomes undefined**, which `../00_…md`'s own constraint routes as a finding rather
than a local reinterpretation.

The decision is therefore forced by the matrix in the revision SUB-16 republished, not chosen from
among live options on taste.

### Why the seven rows are the criterion and latency is not

A latency criterion would be unsupportable here and is deliberately not used. `F-S15-2` records
that `SPK-S6-1`'s ≤0.02% figure is an **in-process transport floor** with no network hop, TLS,
connection setup or inter-host latency in it, and `CAP-S15-1` records that the real deployed
round-trip is unmeasured. Scoring a store topology on a number that excludes the hop the topology
would introduce would be exactly the "assertion dressed as a finding" this package rejects. No
score in this record is justified by latency.

### Why the carve-out does not reopen the reversal

Clause 5 puts two categories in a store that is not the clause-1 store, so a reader is entitled to
ask whether that is `R1` arriving by another door. It is not, on three independent grounds:

1. **`R1` names a *web* store.** Its text is "`OUT-8` selects a **separate web store** with no
   shared credential path". `SC-S3-33` and `SC-S3-34` are not web-tier state and the web tier is
   not their authority; `CMP-S4-17` is. The conjunct's subject is absent.
2. **It is not a second credential holder on the shared store.** §5.2 row 2's condition is a
   second credential holder on the *shared production Postgres*. `CMP-S4-17` holds a credential to
   its own store and none to the clause-1 store, so the shared store still has exactly one writer.
3. **It is not "a separate store for MCP core state"** — §5.2's fourth row, the one marked "not
   evaluated". These two categories are not MCP core state under `DR-C10-S6-1`; they are the only
   inventoried rows whose authority sits elsewhere.

The carve-out is also not this record's invention. `../08_…md` §8.6 already places both rows in the
drift component's own deployment and states the prohibition; clause 5 records that the store
decision **honours** an existing constraint rather than overriding it. Had the decision instead
pulled them into the clause-1 store, that would have been a contradiction of a merged migration-path
cell and would have required a finding routed to the matrix's owner — which is precisely the
outcome `../00_…md`'s constraint exists to force, and precisely what reconciling all eighteen
store-`none` rows against the topology is for.

**Neither `SC-S3-33` nor `SC-S3-34` appears in any of the seven cross-category atomicity pairs**,
so the carve-out costs the decisive criterion nothing.

### The store-reversal check SUB-6 handed over

`../07_…md` §5.2 records: **"Route taken: Route A"** — every model was scored under **both** store
assumptions, and **"This chapter therefore does not rest on a single undeclared store
assumption."** §5.1: **"`M-A` — all-MCP — is selected, and the selection is stable across both
store assumptions."** §5.3: **"No single store outcome reverses this selection."**

Reversal requires the conjunction `R1 ∧ R2 ∧ R3` — all three, and §5.3 records that any two leave
`M-A` ahead, with all three yielding `M-C` 428 to `M-A` 426, a two-point margin out of 500 that
§5.3 itself calls "real but fragile".

| Conjunct | What it requires | Status under this decision |
| --- | --- | --- |
| `R1` | `OUT-8` selects a separate web store with no shared credential path (+22 to `M-C` C1) | **Not satisfied.** One shared store is selected. |
| `R2` | NEU-893's isolation mechanism resolves the same authenticated subject at a single enforcement point spanning both tiers (+18 to `M-C` C2) | Not established. Moot once `R1` fails. |
| `R3` | SUB-7 establishes ≥1 required web-surface state item unexpressible as an MCP tool without making non-gate-bearing state gate-bearing (−12 to `M-A` C7) | **Already NOT ESTABLISHED** — `../11_…md` §13 |

The selected topology matches **row 1** of §5.2's lookup table — "Shared production Postgres, MCP
core the only credential holder" — whose recorded effect is **"None. §3.2 applies; `M-A` by 74"**
and whose recorded action for SUB-10 is **"None. Record the match."**

**Result: the selected store is not the one SUB-6 named as selection-reversing. The selection is
stable. No finding is routed to SUB-6.** Recorded explicitly rather than by silence, because §5.2
prescribes recording the match as the action itself.

The two topologies §5.2 marks as finding-raising are both in the rejected set below and were
rejected on the matrix, not to avoid the finding.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **A separate store for web-tier state**, MCP core keeping its own | **Nothing to hold.** Under `DR-C10-S6-1` the web tier is the authority for no state category, so a store provisioned for it would be empty of anything the inventory names. This is also `R1`, the first conjunct of SUB-6's reversal — and it is rejected on the emptiness, not to keep the conjunction from firing; `R3` is independently NOT ESTABLISHED, so the conjunction could not fire either way. |
| 2 | **A separate store for MCP core state** | **`../07_…md` §5.2 records this outcome as "not evaluated"** and its action for SUB-10 as raising a finding to SUB-6. Selecting an outcome whose effect on the selection was never scored would make `DR-C10-S6-1` rest on an unscored premise — the precise failure Route A was taken to avoid. Rejected on that, and additionally on the decisive criterion: every one of the seven atomicity pairs is *within* the core's own categories, so this split breaks them all. |
| 3 | **Primary plus a read replica handed to the web tier** | **The authority leg.** A replica credential is still a credential, and §5.2 row 2 records that a second credential holder on a shared store means a second writer contradicting `M-A`. Read-only intent is a configuration, not a boundary — `BND-S4-17`'s class is already **trust — unenforced** with owner **nobody**, so this package has direct evidence that intent-based restraint is not a boundary it can rely on. |
| 4 | **Polyglot persistence** — a second store class (document, key-value or cache) for a subset of categories | **No recorded requirement demands it.** No row in the 45-row matrix states a freshness, concurrency or recovery attribute that Postgres does not already satisfy, and the seven atomicity pairs argue directly against splitting the categories that would move. It also adds an operational surface against `CAP-S10-1`, where the existing operational facts are already unknown. |
| 5 | **Defer the store topology to the implementation charter** | **Rejected on the dependency direction.** `../07_…md` §5.2 assigns SUB-10 the action; `OI-S6-1` names SUB-10 the consumer; and SUB-11 audits and SUB-12 gates without re-deciding anything left open. Deferring would leave `DR-C10-S6-1` resting on an unrecorded store premise indefinitely — and the answer is available from the matrix now, so a deferral would be a choice not to read the evidence. |

---

## Consequences

1. **`DR-C10-S6-1` is confirmed, not disturbed.** `../07_…md` §5.2 row 1's prescribed action is
   "Record the match", and this record is where it is recorded. `M-A` stands at its 74-point
   margin under the shared-store scoring.

2. **`CAP-S6-1` is not lifted, and its subject has no instance under this decision.** The cap
   records that two-writer divergence was never observed, that five connection probes returned
   `ECONNREFUSED`, and that "asserting is not an available third option" — SUB-10 "must therefore
   stand up a store to reason about one." **No store could be stood up here**: no container runtime
   is present in the execution environment and `127.0.0.1:5432` refuses connections, so the cap is
   carried forward unlifted and honestly. Separately: this decision selects a **single-writer**
   topology, so the divergence the cap describes has no configuration in which to occur under the
   selected substrate. That narrows the cap's practical reach; it does not close it, and closing it
   is not this record's to do.

3. **`F-S14-5`'s premise does not hold, and the shape it names is not asserted.** The cell records
   that `SC-S3-31`'s aggregate-vs-append shape "is not determined by any merged input — **SUB-10
   decides it with the store**." Selecting one Postgres instance does **not** decide it: both
   shapes are expressible in one store, and record shape is schema design, which this sub-task
   places out of scope. Filed as `F-S10-4` and routed rather than answered by assertion. **SUB-14's
   walk counts are preserved unchanged at 180 walks, 178 defined, 2 undefined.**

4. **`OI-S13-1` is discharged by reconciliation, not by naming a store.** That item's resolving
   event is conjunctive: the record landing **and** the eighteen store-`none` categories being
   reconciled against it, because "a store record that names stores without saying which of these
   categories land in them leaves exactly the gap this item exists to surface." All eighteen —
   `SC-S3-28` through `SC-S3-45` — are reconciled row by row at `../15_…md` §5.4, each resolved to
   a destination or **explicitly recorded as still unplaced**, with its stated precondition carried
   forward. The four cross-category interactions `OI-S13-1` names (`SC-S3-20`, `SC-S3-21`,
   `SC-S3-18`, and `SC-S3-38` against `SC-S3-37`) are dispositioned there too. What record *shape*
   each category takes on arrival is schema design and remains out of scope; three of the eighteen
   resolve to **no destination by construction** and one to **no destination by decision**, and
   those are results rather than omissions.

5. **A schema change and its deployment remain one event.** Migrations run unconditionally at boot
   (`src/transport/main.ts:27` is the first statement of `bootstrap()`; `src/infrastructure/db/migrate.ts:38`–`:50`),
   and every green push to `develop` deploys. One store does not change that; it means the single
   store is migrated by the single deploy, which `DR-C10-S10-2` clause 3 then makes exclusive to
   one process for a reason measured rather than assumed.

6. **`F-S6-2` is inherited unrepaired.** `reviewPersistence` is absent from `UnitOfWorkPort`'s
   `TransactionPorts`, leaving `SC-S3-3`'s read-compute-write unwrapped. One store makes the fix
   *available*; it does not perform it. Recorded so the implementation charter does not read
   "single store" as "already atomic".

7. **Nothing was created.** No database, instance, schema, migration, connection string or
   configuration file exists as a result of this decision.

---

## Evidence

| Claim | Source |
| --- | --- |
| `M-A` all-MCP selected; stable across both store assumptions | `DR-C10-S6-1`; `../07_…md` §5.1 |
| Route A — both store assumptions scored; no undeclared store premise | `../07_…md` §5.2 |
| Reversal is the conjunction `R1 ∧ R2 ∧ R3`; any two leave `M-A` ahead; all three give `M-C` 428 vs `M-A` 426 | `../07_…md` §5.3 |
| Shared-store scores `M-A` 438 / `M-C` 364 / `M-B` 212, margin 74 | `../07_…md` §3.2, §5.1 |
| Row 1 of the lookup table — "None. Record the match." | `../07_…md` §5.2 |
| `R3` = NOT ESTABLISHED; the conjunction does not fire on its account | `../11_…md` §13 |
| Seven rows require cross-category same-transaction atomicity | `../10_…md` §8; `../08_…md` §8 |
| `SC-S3-11` carries the strongest consistency requirement in the `public` schema | `../10_…md` §8 |
| `SC-S3-29` is the one genuine consistency requirement among the derived rows | `../09_…md` |
| The walks terminate on exactly-one-authority plus `UnitOfWorkPort` not spanning components | `../09_…md` §7; `src/ports/unit-of-work-port.ts:26`–`:28` |
| 180 walks, 178 defined, 2 undefined | `../09_…md`; `F-S14-4`, `F-S14-5` |
| `reviewPersistence` absent from `TransactionPorts` | `F-S6-2` |
| One module-level pool, `max: 4`, sole `DATABASE_URL` | `src/infrastructure/db/client.ts:5`, `:7`–`:35`, `:37`–`:53` |
| Audit/event transports resolve `AUDIT_DATABASE_URL ?? DATABASE_URL` — same database, distinct pools | `src/transport/pg-audit-transport.ts`; `src/transport/pg-event-transport.ts` |
| Migrations run unconditionally at boot, first statement of `bootstrap()`, no env guard | `src/transport/main.ts:27`; `src/infrastructure/db/migrate.ts:38`–`:50` |
| Compatibility surface is 46 tools / 43 gated / 3 exempt, 49 audit entries | `F-S8-1` |
| `BND-S4-17` is class **trust — unenforced**, owner **nobody** | `../05_…md`; `src/transport/main.ts:55`–`:59` |
| `BND-S4-16` (`CMP-S4-3 ↔ CMP-S4-9`) remains `undecided` | `../05_…md` |
| The ≤0.02% figure is an in-process floor with no network hop | `F-S15-2`; `SPK-S6-1` |
| The deployed round-trip cost is unmeasured | `CAP-S15-1` |
| No store could be stood up: no container runtime, `127.0.0.1:5432` `ECONNREFUSED` | `CAP-S6-1`; this run's own probes |

---

## Revision trigger

1. **A second credential holder is introduced** — any process other than the MCP core acquires a
   connection string to this instance, read-only or not. `../07_…md` §5.2 row 2 makes that a
   contradiction of `M-A` itself, and the required action is a finding routed to SUB-6, **not** a
   quiet amendment here.
2. **The matrix is republished with an atomicity requirement removed from all seven rows** — the
   decisive criterion would lose its force and the alternative set is re-opened and re-scored. A
   change to fewer than all seven does not fire this trigger; one surviving pair is enough to
   decide the record.
3. **`R1` and `R2` both become satisfied *and* `A-27` is invalidated so that `R3` re-opens and is
   then established** — the full conjunction fires, `M-C` overtakes by two points, and
   `DR-C10-S6-1` is re-decided at its owner. This record follows that re-decision; it does not
   anticipate it. `../11_…md` §13 records `R3` as re-openable only if `A-27` is invalidated.
4. **A state category is added whose recorded attributes Postgres cannot satisfy** — the polyglot
   alternative acquires the requirement it currently lacks and is re-scored.
5. **`OUT-8`'s scope is amended to include schema design** — consequence 3's disposition of
   `F-S14-5` was made on the scope boundary as published; moving the boundary re-opens it.
