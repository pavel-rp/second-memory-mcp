# `DR-C11-S8-2` — Export is scoped by the inventory, erasure is dispositioned per category, and `deadline_at` is 30 days from an authenticated request

**Task:** NEU-1002 (SUB-8) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `d2e2b55`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-11 (`../90_outcome-register.md`) — learner-readable export, per-category erasure, the completion deadline, and the four-field retention-exception rule

---

## Decision

**Decision 1 — the inventory is the export's table of contents.** Export completeness is defined as
*one section per category in the union*, and the union is SUB-3's own: **every category
`../03_learner-data-inventory-and-classification.md` marks as anything other than `not personal
data`, plus the consent category this sub-task creates**. That is **24 + 1 = 25** sections. Each
carries an explicit disposition — `exported`, or `not-exported` with a stated reason — so **zero
categories are unaccounted for** without pretending a live socket can be handed to a learner.

**Decision 2 — export is specified by properties, not by an endpoint.** Learner-readable,
self-describing, rendered rather than dumped, labelled where a value is possibly truncated, and
authenticated on the **server-derived** `learner_key` only.

**Decision 3 — erasure carries a per-category disposition of `delete`, `de-identify`,
`cascade`, `not-applicable` or `unreachable`,** each with its reason, in
`../08_consent-and-what-a-learner-can-export-and-erase.md` §8. **`unreachable` is a real value and is
used**, because the alternative is a matrix that claims a completeness it does not have.

**Decision 4 — `deadline_at` is 30 days from an authenticated, verified request**, for both export
and erasure. **Withdrawal's own effect is faster and split in two:** the processing switch takes
effect on **the next request** — there is no window in which a withdrawn purpose may still run — and
the purge of already-collected secondary-use copies is bounded at **7 days**. The value is a
**stated product-and-engineering position derived from the GDPR-shaped baseline the charter
ratified**. It is **not observed, not calibrated, and not a legal determination**, and it is carried
as the stand-in `../95_stand-in-assumption-register.md` § `A-S8-1`.

## Rationale

**On decision 1 — why the inventory and not the schema.** An export scoped by *"walk the tables"*
misses, by construction, everything SUB-3 spent a chapter establishing: the three derived-never-
persisted categories (`LD-S3-28` … `LD-S3-30`, of which `LD-S3-29` is *"the single richest learner
profile the system ever assembles"*), the ten process-local structures, and the two copy classes this
package's own activity creates. Scoping by the inventory inherits all of them for free. It also makes
completeness **checkable by a reader** rather than assertable by the author: the count is 25, the
sections are countable, and a mismatch is visible without leaving the package.

The cost is stated rather than hidden, and it is real: **the export is only as complete as the
inventory.** A store the inventory missed is exported by nobody. SUB-3 published a falsifier for
exactly this and it fired once during SUB-3's own work
(`../03_learner-data-inventory-and-classification.md` §11; `../91_findings-register.md` § `F-S3-2`).
The residual is `../92_risk-register.md` § `R-S8-2`.

**Why 24, and why the arithmetic is shown.** SUB-3's four-value status vocabulary
(`../03_learner-data-inventory-and-classification.md` §2) makes the partition mechanical rather than a
judgement: **eight** of the thirty-two entries are `not personal data` — `LD-S3-13`, `LD-S3-15`,
`LD-S3-21`, `LD-S3-23`, `LD-S3-24`, `LD-S3-26`, `LD-S3-27` and `LD-S3-32` — and the remaining
**twenty-four** are `learner-identifying`, `learner-linked`, `unattributed learner content`, or
pseudonymous. 32 − 8 = 24; 24 + 1 = 25. Stating the subtrahend by id is what makes the count
auditable: a reader who disagrees can name the entry they would move.

**On decision 2 — why no endpoint is named.** There is no delivery surface to name. Naming one would
presuppose a transport decision this package does not own — the web API's scope is C010's
`11_…md`, and this charter's `M-A` constraint puts every write on the MCP tool surface. Specifying
properties instead leaves the design conformable by whichever surface is eventually built, and
`R-S8-4` records that **no surface exists today**, so the export is at this cutoff a specification
rather than a capability.

**The truncation label is not cosmetic.** `response_body` is capped at 65 536 bytes by two separate
constants of the same value (`src/transport/audit-middleware.ts:14`;
`src/transport/pg-audit-transport.ts:36`), and `../16_attribution-and-detection.md` §7 records that a
body of exactly that length must be read as **possibly truncated, never as complete**. An export that
hands a learner a truncated value unlabelled is telling them that is all there was.

**On decision 3 — why `unreachable` is a value.** SUB-16's `F-S16-5` establishes that attribution is
not retroactive: the only structure that ever held a session-to-subject binding is the process-local
map at `src/transport/http.ts:83`, emptied by every restart. A per-learner erasure over either log
table therefore **provably misses the entire pre-cutover population while reporting success**. A
disposition table that recorded those rows as `delete` would be false; one that omitted them would be
worse. `unreachable` names the thing and routes it — **the disposition of that population is SUB-9's
under OUT-12**, and this record asserts nothing about which of bulk deletion, bulk anonymization or
an accepted named residual SUB-9 will choose.

**On the four-field test, and the one exception that fails it.** Every retention exception must carry
a justification, a time bound, an owner and a stated basis. The audit in
`../08_consent-and-what-a-learner-can-export-and-erase.md` §9 applies it to six candidates; five pass
and **one fails**, and it fails in an instructive way: the pre-cutover log population cannot be given
a **learner-scoped** bound at all, because no predicate selects it per learner. The only bound
available to it is time-based and population-wide, which is **a different kind of thing** from a
retention exception and must not be recorded as one. That is the OUT-11 blocking finding,
`../91_findings-register.md` § `F-S8-2`.

**On decision 4 — where 30 days comes from, and what it is not.** `DR-C11-S16-3` fixes that
`deadline_at` exists, is required and is carried on the proof, and leaves the **value** here
(`../16_attribution-and-detection.md` §6). Thirty days is taken from the one-month response norm of
the GDPR-shaped baseline the charter ratified at intake. Three things it is **not**: it is not
observed — no request has ever been made, and `../94_caps-and-incomplete-scope.md` § `CAP-S8-1`
records that; it is not calibrated — nothing has ever measured how long a propagation takes on this
platform; and it is not a legal determination — which deadline actually binds rests on `OI-S3-1`,
owned by SUB-3 and cited rather than restated.

**Why withdrawal is faster than erasure, and why it is split.** They are different acts. Erasure has
to reach every copy, so its deadline has to accommodate a propagation whose duration nobody has
measured. Withdrawal has to *stop a switch*, and a switch that takes thirty days to flip is not a
switch — a learner who withdraws consent and is told the secondary use will continue for a month has
not withdrawn anything. Splitting it means the part that must be instant (**stop collecting**) is
stated as instant, and only the part that genuinely needs a window (**purge what was already
collected**) gets one.

**Why one number rather than "as soon as possible".** `SIG-S16-3` fires when a copy-class proof is
missing at `t ≥ deadline_at`. A qualitative deadline leaves that signal **fully specified and
permanently unevaluable**, which is precisely the state `../16_attribution-and-detection.md` §3
records it in today. Supplying a number is the whole content of what SUB-16 routed here.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Scope export by walking the database schema.** | Misses every non-persisted category by construction — the three derived-transient entries, the ten process-local structures, and both copy classes. `LD-S3-29`, the richest learner profile the system assembles, is computed on read and stored nowhere, so a schema walk exports precisely none of it. |
| 2 | **Export only the categories that are `learner-linked` today.** | At this cutoff that set is **empty** — no ownership column exists on any table (`../03_learner-data-inventory-and-classification.md` §2), so the export would be empty and technically correct. The union is defined over what the inventory marks as the learner's, which is a statement about the data, not about whether a column happens to exist yet. |
| 3 | **Drop the `not personal data` eight from the union without naming them.** | Same set, worse document. Naming the subtrahend by id is what makes 32 − 8 = 24 auditable; an unnamed exclusion is indistinguishable from an omission, which is the failure mode SUB-3's own cross-check exists to prevent. |
| 4 | **Give every category a `delete` disposition and be done.** | False for at least four of them. The in-memory buffers (`LD-S3-25`) are reachable by no `DELETE` whatsoever; the derived-transient trio has nothing stored to delete; the aggregate result set is not personal data; and the pre-cutover log rows cannot be selected per learner at all. A uniform `delete` is the *"erasure completes on paper"* failure the charter's `R2` names, written directly into the design. |
| 5 | **Record the pre-cutover population as an ordinary retention exception with a 30-day bound.** | It would pass the four-field test on paper and mean nothing: a population-wide time bound does not discharge one learner's erasure request, and recording it as an exception would convert an *inability* into a *policy*. It is reported as a blocking finding instead. |
| 6 | **Set `deadline_at` to 72 hours, matching the breach-notification norm.** | Wrong norm — that clock is for notifying a supervisory authority of a breach, not for discharging a data-subject request. Adopting it would also be unachievable against an unmeasured propagation, so the signal would fire on every request by construction and be switched off within a week. |
| 7 | **Leave `deadline_at` unset and route it onward to SUB-9.** | SUB-16 routed it **here** by name (`../16_attribution-and-detection.md` §6), and SUB-9 consumes the value rather than setting it — passing it on would leave `SIG-S16-3` unevaluable for a second consecutive chapter and hand SUB-9 a contract with a hole where its threshold should be. |
| 8 | **State the deadline as a range, mirroring SUB-15's 2–200 capacity band.** | A band is the right answer for a *measured* quantity whose measurement is missing. A deadline is a **policy choice**, not a measurement — there is no distribution it is the uncertain centre of — so a band here would be false modesty and would leave the signal just as unevaluable as no value at all. The honest treatment of a chosen number is a stand-in with a tolerance envelope, which is what `A-S8-1` is. |
| 9 | **One deadline for withdrawal and erasure alike.** | Makes withdrawal meaningless at the only moment it matters. See the rationale: a thirty-day switch is not a switch. |

## Consequences

1. **`SIG-S16-3` becomes evaluable in principle** — the last missing term in `DR-C11-S16-3`'s
   contract now has a value. It remains **unemitted**: `ME-S16-6` records that no propagation emits
   anything and no completion-proof store exists. Evaluable and unemitted is a real advance and is
   not the same as working, and `../92_risk-register.md` § `R-S8-3` carries the difference.
2. **SUB-9 inherits a scope statement rather than a promise.** The pre-cutover population is
   `unreachable` in this chapter's disposition table, with SUB-9 named for its disposition.
3. **The export's completeness is the inventory's completeness.** Inherited strength and inherited
   weakness, both stated; `R-S8-2` carries the weakness.
4. **What becomes harder:** any later chapter that wants to shorten the erasure deadline must first
   show a propagation can be *proved* complete inside the shorter window, because the deadline and
   the proof are now coupled through `SIG-S16-3`.
5. **Neither export nor erasure is implementable at this cutoff.** Only two delete paths are
   reachable from a user-facing tool, and no export surface exists at all — `F-S8-3` and `R-S8-4`.
   This record specifies duties; it does not report capabilities.

## Evidence

| Claim | Source |
| --- | --- |
| The union OUT-11 and OUT-12 read is *"every category the inventory marks as the learner's, plus the consent category SUB-8 creates"* | `../03_learner-data-inventory-and-classification.md` §9 |
| The four-value personal-data status vocabulary that makes the 32 − 8 partition mechanical | `../03_learner-data-inventory-and-classification.md` §2 |
| The eight `not personal data` entries | `../03_learner-data-inventory-and-classification.md` §4 (`LD-S3-13`), §6 (`LD-S3-15`, `LD-S3-21`, `LD-S3-23`, `LD-S3-24`, `LD-S3-26`, `LD-S3-27`), §8 (`LD-S3-32`) |
| `LD-S3-29` is assembled fresh on every read and never stored | `../03_learner-data-inventory-and-classification.md` §7 |
| `LD-S3-25`'s in-memory buffers are reachable by no `DELETE` | `../03_learner-data-inventory-and-classification.md` §6; `../91_findings-register.md` § `F-S3-2` |
| Attribution is not retroactive; a per-learner delete provably misses the pre-cutover population | `../91_findings-register.md` § `F-S16-5`; `../92_risk-register.md` § `R-S16-1`; `src/transport/http.ts:83` |
| Both log tables are `learner-linked` under the carrier, conditional on adoption; the key is per row | `../decision-records/DR-C11-S16-2_the-audit-log-privacy-determination.md`; `../16_attribution-and-detection.md` §5 |
| `deadline_at` exists, is required, is carried on the proof, and its **value** is SUB-8's | `../16_attribution-and-detection.md` §6; `../decision-records/DR-C11-S16-3_the-stalled-propagation-signal-contract.md` |
| `SIG-S16-3` is *"fully specified and not yet evaluable"* pending that value — the quoted wording is §6's; §3's matrix cell reads *"Fully specified; not yet evaluable"* | `../16_attribution-and-detection.md` §6 (quotation), §3 (the matrix cell) |
| A 65 536-byte `response_body` must be read as possibly truncated | `../16_attribution-and-detection.md` §7; `src/transport/audit-middleware.ts:14`; `src/transport/pg-audit-transport.ts:36` |
| No completion-proof store exists and no propagation emits anything | `../16_attribution-and-detection.md` §4 (`ME-S16-6`) |
| `operation_event_log` has no retention bound; the 30-day script covers `mcp_request_log` only | `scripts/retention-cleanup.sql`; `src/orchestration/chunk-workflows.ts:160`–`:161`; `../92_risk-register.md` § `R-S16-4` |
| The lawful basis a retention period would rest on is one question with one record | `../93_open-items-and-provisional-register.md` § `OI-S3-1` |
| `ON DELETE CASCADE` from `learning_chunks` to the linter corpus | `../03_learner-data-inventory-and-classification.md` §6; `src/infrastructure/db/schema.ts:333` |

## Revision trigger

1. **`OI-S3-1` closes** with a determination that fixes a statutory response period different from 30
   days, or that places the erasure duty on a basis this record did not assume.
2. **SUB-9 publishes its propagation matrix** and its copy-class cardinality turns out to require a
   propagation that cannot be *proved* complete within 30 days — at which point the deadline and the
   proof design must be reconciled, and the deadline is the term that moves.
3. **The attribution carrier lands**, fixing a cutover instant — which converts `unreachable` from a
   standing property into a bounded, countable population for the first time.
4. **SUB-3's inventory is superseded** by a later inventory with a different category count, which
   changes the union and therefore the export-completeness arithmetic.
5. **An export surface or an erasure path is actually built**, at which point every property in
   decision 2 becomes testable rather than specified.
6. **A retention-cleanup script covering `operation_event_log` is added**, which is also
   `DR-C11-S16-2`'s fifth revision trigger.
