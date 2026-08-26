# `DR-C11-S9-3` — Every propagation emits one completion-proof row per copy class, conforming field by field to `DR-C11-S16-3`, and a class with nothing to do emits a proof of zero rather than silence

**Task:** NEU-1003 (SUB-9) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-12 (`../90_outcome-register.md`) — the completion-proof design and its conformance assertion against SUB-16's published contract

## Decision

**Clause 1 — the unit of proof is the (request, copy class) pair.** One authenticated data-subject
request emits **exactly six** completion-proof rows, one per copy class, never one row per request
and never one row per affected table. The cardinality is fixed by the copy set, so a missing class
is a missing row rather than an absent detail inside a row.

**Clause 2 — the declared cardinality is 6.** Each propagation declares `copy_class` cardinality =
**6** once, as `DR-C11-S16-3` requires. `SIG-S16-3` therefore fires whenever fewer than six distinct
classes carry a complete proof at `t ≥ deadline_at`.

**Clause 3 — a class with nothing to do emits a proof of zero.** Where a duty is inapplicable to a
class, the propagation emits `action = not-applicable` with `rows_affected = 0`. It does **not**
omit the row. This is `DR-C11-S16-3`'s fourth negative clause applied literally, and it is the whole
mechanism by which the empty class `LD-S3-31` stays monitored rather than assumed
(`../16_attribution-and-detection.md:333`–`:336`).

**Clause 4 — the store.** A dedicated `propagation_proof` relation, satisfying the contract's three
location properties: queryable on `propagation_id` alone; **not** either log table, because both are
subject to the erasure being proved; **not** process-local, because it must survive a restart
(`../16_attribution-and-detection.md:322`–`:325`). It is a new relation, not a column on an existing
one, and it is authored as a specification here — **no DDL is applied and no file under `src/` or
`drizzle/` changes**.

**Clause 5 — `deadline_at` is carried on the proof, and its value is SUB-8's.** The field is written
at emission from the request's own deadline, never recomputed at read time. Its **value** is
`A-S8-1`'s 30 days — a stand-in derived from the GDPR-shaped baseline the charter ratified, "not
observed, not calibrated, and not a legal determination"
(`../95_stand-in-assumption-register.md:567`–`:575`). This record consumes that value and states no
deadline of its own.

**Clause 6 — the emitter is never the caller.** `emitter` names the component that performed the
action. Neither `session_id` nor `correlation_id` may appear anywhere in a proof: both are
caller-asserted — `session_id` is lifted verbatim from the tool call's own arguments and
`correlation_id` echoes a caller-supplied header (`../16_attribution-and-detection.md:49`) — and the
contract's first negative clause forbids relying on a caller-asserted identifier.

**Clause 7 — the learner-visible result is the proof set, not a message.** What a learner is shown
per copy is the six rows themselves, rendered: class, action, count, when, and by what. A
success message that is not backed by six rows is not a result.

## Conformance to `DR-C11-S16-3`, field by field

SUB-16 published the contract at position 7 and stated explicitly that it "neither evaluates nor
predicts SUB-9's design", and that **SUB-9's acceptance asserts the match**
(`../16_attribution-and-detection.md:338`–`:341`). This section is that acceptance.

| # | Contract field | Contract requirement (`../16_attribution-and-detection.md:315`–`:320`) | This design | Conforms |
| --- | --- | --- | --- | --- |
| 1 | `propagation_id` | Required, non-null | Minted once per request; the join key for all six rows | **Yes** |
| 2 | `request_kind` | Required; `erasure` \| `export` \| `withdrawal` \| `rectification` | Carried verbatim. This matrix exercises three of the four; `rectification` is legal and unexercised, not removed | **Yes** |
| 3 | `learner_key` | Required; the `sub` verbatim; never `azp` | The `sub` verbatim, per `DR-C11-S2-1`. `azp` never appears in a proof | **Yes** |
| 4 | `copy_class` | Required, non-null | One of the six; the enumeration is closed by `DR-C11-S9-2` | **Yes** |
| 5 | `action` | Required; `deleted` \| `anonymized` \| `exported` \| `not-applicable` \| `refused` | All five used. `refused` is used for a non-`user` principal, per `DR-C11-S5-1`'s refusal-not-empty-scope rule | **Yes** |
| 6 | `rows_affected` | Non-negative integer; **`0` is legal and must be distinguishable from absent** | Non-null integer on every row, including every `not-applicable` row. Absence is impossible because the row is mandatory | **Yes** |
| 7 | `emitted_at` | Required, non-null | Set when the action becomes durable, never before — the contract's fifth negative clause | **Yes** |
| 8 | `deadline_at` | Required; carried **on the proof** | Written at emission from the request's deadline; never derived at read time. Value is `A-S8-1`'s | **Yes** |
| 9 | `emitter` | Required, non-null | The acting component. Never a caller-asserted identifier | **Yes** |
| — | `copy_class` cardinality | Declared **once** per propagation | Declared as **6**, clause 2 | **Yes** |

**Location properties.**

| Property | Requirement | This design | Conforms |
| --- | --- | --- | --- |
| (a) | Queryable on `propagation_id` alone | `propagation_id` is the leading key of `propagation_proof` | **Yes** |
| (b) | **Not** either log table | A dedicated relation; neither `mcp_request_log` nor `operation_event_log` | **Yes** |
| (c) | **Not** process-local | A database relation, surviving restart — which matters at a measured ≥3.29 restarts/day | **Yes** |

**Timing.** Evaluated at any `t ≥ deadline_at`; fires when distinct classes with a complete proof <
6; idempotent; a late proof closes the signal without un-firing it, its lateness preserved by
`emitted_at > deadline_at`; no grace beyond `deadline_at`
(`../16_attribution-and-detection.md:327`–`:331`). **Conforms** — the design adds no grace period and
no retry window, and emits nothing that would suppress a fire.

**The six negative clauses** (`../16_attribution-and-detection.md:333`–`:336`).

| # | Negative clause | This design | Conforms |
| --- | --- | --- | --- |
| 1 | May not rely on a caller-asserted identifier | Clause 6 bars `session_id` and `correlation_id` outright | **Yes** |
| 2 | May not live only in memory | Clause 4, location property (c) | **Yes** |
| 3 | May not treat absence-of-error as completion | `rows_affected` is written from the statement's own row count; a successful statement affecting nothing yields `0`, not a pass | **Yes** |
| 4 | May not omit a copy class because there was nothing to do | Clause 3 — the emit-zero rule | **Yes** |
| 5 | May not be emitted before the action it proves is durable | Clause 4 field 7 | **Yes** |
| 6 | May not carry a `learner_key` differing from the request's | Single-sourced from the request; not re-resolved per class | **Yes** |

**Result: 9/9 fields, 3/3 location properties, the timing rule, and 6/6 negative clauses conform.
The match is asserted here, as SUB-16 required, and not by SUB-16.**

## Rationale

**Why one row per class rather than one per request.** A single per-request row can record "erasure
completed" while a class was never visited, and nothing in the record distinguishes that from a
class that had nothing to do. Six rows make the two cases different at the level of the data: a
class that was skipped has no row, a class with nothing to do has a row saying so. `SIG-S16-3`'s
fire condition is written against exactly that distinction — it counts distinct classes with a
complete proof — so the per-class shape is the one the published contract already assumed.

**Why the emit-zero rule is the whole answer to the empty class.** `LD-S3-31` has zero members and
terms that exist anyway, and SUB-3 refused to collapse "empty membership" into "no such class"
precisely because SUB-9 must route a data right *through* it
(`../03_learner-data-inventory-and-classification.md:431`–`:437`). The routing is: the request does
not ask the class for members, it requires the class to produce a proof. With zero members the proof
is `action = not-applicable, rows_affected = 0` — and because `rows_affected`'s contract says "`0`
is legal and must be distinguishable from absent", that zero is a positive statement rather than a
silence. An empty class that emits nothing is indistinguishable from a forgotten one; an empty class
that emits a zero is monitored by `SIG-S16-3` on every single request.

**What happens when the class acquires a member.** Membership is created only by taking a capture.
At that instant SUB-1's terms attach unchanged — named owner, retention bound, destruction condition
tied to the package's publication, redaction discipline, and the quarantine path `_local/scratch/`
(`../01_production-evidence-and-the-access-audit.md:151`–`:159`). The propagation action then
becomes **destroy on schedule**, and the reasoning is stated rather than assumed: the class's own
retention bound expires *no later than the package's publication*, which is unconditional and does
not wait for a request. A scheduled destruction therefore has an earlier-or-equal deadline than any
erasure request could set, and covers **every** member rather than one learner's. Destroy-on-schedule
strictly dominates erase-on-request here — which is why the charter permits it for this class alone.

It does not replace erase-on-request, because a request can arrive while a capture is live and
before publication. In that window the action is a **manual operator deletion** at the quarantine
path, owned by the creator as SUB-1 recorded — the class is reached by no port and no SQL statement
(`../05_the-enforcement-point-that-confines-every-read-and-write.md:564`–`:582`), so there is no
mechanism to automate and saying otherwise would be a fiction. Both paths emit the same proof row.

**Why `deadline_at`'s value is consumed and not set.** `A-S8-1` carries the 30 days with an
invalidating outcome — a determined deadline shorter than the provable propagation time, which would
make `SIG-S16-3` fire by construction on every request. Restating the value here would create a
second record of one fact and give SUB-14's cross-register check two ids to reconcile. This record
cites it and states nothing.

**What this design makes evaluable that was not.** `SIG-S16-3` was published "fully specified and
not yet evaluable", because no completion-proof store existed and no propagation emitted anything
(`ME-S16-6`). Clause 4 supplies the store and clause 1 supplies the emission, so the signal becomes
evaluable as a design — **not** as a running system, which no part of this package delivers.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **One proof row per request**, with a per-class breakdown inside it | Makes "class skipped" and "class had nothing to do" indistinguishable, and `SIG-S16-3` counts distinct classes with complete proofs — the contract already assumes per-class rows. |
| 2 | **Omit the row for a class with nothing to do** | Directly violates the contract's fourth negative clause, and un-monitors `LD-S3-31` entirely — the one class the package went to trouble to keep alive. |
| 3 | **Store the proof in `mcp_request_log`** | Violates location property (b): the proof would share the fate of the thing it proves, and this sub-task's own disposition deletes that table's pre-cutover population. |
| 4 | **Derive `deadline_at` at read time** from `emitted_at` plus a policy constant | The contract says the field is *carried on the proof*. A derived deadline changes retroactively when the policy changes, which destroys the lateness evidence `emitted_at > deadline_at` preserves. |
| 5 | **Use `correlation_id` as `propagation_id`** | `correlation_id` echoes a caller-supplied header (`../16_attribution-and-detection.md:49`) and is barred by the first negative clause. |
| 6 | **Set a grace period after `deadline_at`** before firing | Explicitly forbidden: "no grace period beyond `deadline_at`, because `deadline_at` is the grace." |
| 7 | **Assert conformance by citing SUB-16's contract without walking it** | The match is SUB-9's acceptance to assert. A citation is not an assertion, and an unwalked contract is where a field goes missing. |

## Consequences

1. **`SIG-S16-3` becomes evaluable as a design.** The store, the emission and the cardinality all
   exist on paper; `ME-S16-6` is answered in design, not in running code.
2. **`A-S8-1`'s re-validation trigger fires** — its stated trigger is SUB-9 publishing a
   completion-proof design **with a copy-class cardinality**, and clause 2 declares 6.
3. **`LD-S3-31` is monitored rather than assumed**, on every request, by the emit-zero rule.
4. **The conformance assertion is made here and is falsifiable** — any reader can walk the same
   nineteen rows against `../16_attribution-and-detection.md:315`–`:336` and find a mismatch.
5. **No DDL is authored and nothing is applied.** `propagation_proof` is a specification; `src/` and
   `drizzle/` are unchanged.

## Evidence

| Claim | Source |
| --- | --- |
| The contract's nine required fields | `../16_attribution-and-detection.md:315`–`:320` |
| The three location properties | `../16_attribution-and-detection.md:322`–`:325` |
| The timing rule and the no-grace clause | `../16_attribution-and-detection.md:327`–`:331` |
| The six negative clauses | `../16_attribution-and-detection.md:333`–`:336` |
| SUB-16 asserts only its own half; SUB-9's acceptance asserts the match | `../16_attribution-and-detection.md:338`–`:341` |
| `session_id` and `correlation_id` are both caller-asserted | `../16_attribution-and-detection.md:49` |
| `deadline_at`'s value is 30 days, a stand-in, not a determination | `../95_stand-in-assumption-register.md:567`–`:575` |
| `A-S8-1`'s re-validation trigger is SUB-9's cardinality | `../95_stand-in-assumption-register.md:600`–`:608` |
| The sixth class's terms, as SUB-1 recorded them | `../01_production-evidence-and-the-access-audit.md:151`–`:159` |
| Zero captures were produced | `../01_production-evidence-and-the-access-audit.md:128` |
| Empty membership is not absent terms; SUB-9 must route through it | `../03_learner-data-inventory-and-classification.md:431`–`:437` |
| The class is reached by no port and no SQL statement | `../05_the-enforcement-point-that-confines-every-read-and-write.md:564`–`:582` |
| Refusal, not empty scope, for a non-`user` principal | `../05_the-enforcement-point-that-confines-every-read-and-write.md:247`–`:257` |
| The restart rate that rules out a process-local store | `src/transport/http.ts:83` |

## Revision trigger

- **The copy set changes cardinality.** Clause 2's declared 6 is the number `SIG-S16-3` compares
  against; a seventh class admitted anywhere makes every existing proof set incomplete by
  construction.
- **`A-S8-1` is superseded** by a lawful-basis determination closing `OI-S3-1`, which sets
  `deadline_at`'s real value and may trigger `A-S8-1`'s own invalidating outcome.
- **`DR-C11-S16-3` is amended.** The conformance table is asserted against the contract as published
  at position 7; an amended contract requires the nineteen rows to be re-walked, not re-cited.
- **`LD-S3-31` acquires its first member**, at which point the destroy-on-schedule reasoning above
  stops being anticipatory and must be checked against the actual capture's terms.
- **A `propagation_proof` implementation diverges** from clause 4's three location properties, which
  would silently break location property (b) or (c) without breaking any field.
