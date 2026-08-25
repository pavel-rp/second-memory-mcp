# `DR-C11-S6-3` — The dry-run dataset's exclusion is evidenced by a closure argument over the generator's inputs, not by an empirical diff

**Task:** NEU-1000 (SUB-6) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `35f92ba`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-2 (`../90_outcome-register.md`) — the aggregate-in-place derivation, the published probe set, the generation record, and the no-copied-rows audit that evidences the exclusion SUB-3 recorded at position 3.

---

## Decision

1. **Per-disposition row counts are taken by read-only aggregate query against production** —
   counts, never rows — and the dry-run dataset is **generated** from the real schema and those
   aggregates, never extracted. The query set is published with its probes enumerated, at the
   chapter's §6.

2. **The no-copied-rows audit is performed as a closure argument over the generator's input set,
   not as an empirical row-by-row diff.** The generator's inputs are enumerated exhaustively as five
   items; none has row type; therefore no output can contain a copied row.

3. **The argument's falsifier is stated:** the closure fails the moment any generator input is a
   **row-valued** query rather than a scalar aggregate — a `SELECT *`, a `LIMIT` sample, a `DISTINCT`
   over a content column, or any extract of real values "for realism".

4. **The exclusion is thereby evidenced.** The dataset is not a member of the sixth copy class on
   the derivation test SUB-3 recorded at position 3. Consistent with SUB-3's stated boundary, this
   record sets **no owner, no retention bound and no destruction condition** for the dataset.

5. **No probe result and no count is reported.** No credential exists in this environment; every
   cell reads *not executed — no credential*, and **no cell reads `0`**.

6. **The throwaway dry-run SQL is scratch verification code**, explicitly not the OUT-19 migration
   artifact, which SUB-13 authors.

---

## Rationale

SUB-3 recorded the exclusion and named this sub-task as the party that evidences it — "with its
generation record and its no-copied-rows audit. That evidence is SUB-6's acceptance, not this
chapter's" (`../03_learner-data-inventory-and-classification.md:500`–`:501`). The obligation is
therefore to *evidence*, and the question is what counts as evidence when the aggregates cannot be
run.

The empirical form of the audit — generate the dataset, diff every row against production — is
unavailable twice over. The dataset cannot be generated, because three of its five inputs are the
unexecuted aggregates. And the diff would itself require extracting the production rows the charter
does not authorize, so the empirical audit is *self-defeating*: performing it would create exactly
the copy it exists to disprove.

The closure argument avoids both problems and is stronger than the form it replaces. `COUNT`, `MIN`
and `MAX` are aggregate functions whose return type is a scalar; a scalar cannot carry a row even in
principle. If every input to the generator is either tracked source text, a scalar, or locally
synthesized, then no output can contain a copied row — and this holds for **every** dataset the
generator can emit, not merely for the one instance an empirical diff would have sampled. The
empirical audit confirms a sample; the closure confirms the construction.

The argument is only as good as the enumeration of inputs, which is why the generation record
enumerates them exhaustively and why the falsifier is stated in terms of input *type* rather than
input *value*. A reader checking this record checks one thing: that the input list is complete and
that every member is row-free.

One precision the derivation test demands: the dataset is derived *from aggregates of* learner rows.
That is not the same as containing data derived from real learner rows in the sense the test means,
and the distinction holds because SUB-3 classified those aggregates separately, as `LD-S3-32`, *not
personal data* (`../03_learner-data-inventory-and-classification.md:473`–`:476`). Without that
separate classification the argument would be circular; with it, it is not.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Empirical row-by-row diff of the dataset against production** | Self-defeating: the comparison requires extracting the rows whose extraction is unauthorized, creating the copy it exists to disprove. Also impossible here — the dataset does not exist. |
| 2 | **Extract real rows and dry-run against them** | Not authorized by the charter (intake Q6) and explicitly not an available alternative. It is the option that would have eliminated `R9`'s residual, and its unavailability is why that residual is accepted rather than mitigated away. |
| 3 | **Sample a few real values "for realism" in the generator** | The precise falsifier of the closure argument. It would admit a copied row and overturn the exclusion. |
| 4 | **Report probe results as `0` because nothing was found** | Nothing was *looked for*. An unexecuted probe and a probe returning zero are different states, and conflating them is how a pathology reaches a real migration believed absent. |
| 5 | **Defer the exclusion evidence to whenever a credential appears** | SUB-3 named this sub-task at position 8, and the closure argument is available now without one. Deferring would leave a recorded exclusion unevidenced for the life of the package on a dependency it does not actually have. |
| 6 | **Assert the exclusion on the word "synthetic"** | The exact error charter assumption 44's round-3 finding corrected: "production-shaped" was never a statement about derivation. Membership turns on the derivation test, so the evidence must be about derivation too. |

---

## Consequences

1. **SUB-3's recorded exclusion is evidenced**, and the forward-only flow closes as designed: SUB-3
   records → SUB-6 evidences → SUB-9 states it in the matrix. Nothing is owed back to SUB-3 and
   SUB-3 is not re-run.
2. **The evidence does not depend on a credential**, so the exclusion is discharged at this revision
   rather than carried as an open item. What *is* carried as an open item is the dataset's
   non-existence (`OI-S6-2`) — a different fact.
3. **`LD-S3-32` still does not exist at position 8.** The query set is its specification; a
   credential would supply its values. SUB-3's classification remains correct and remains a
   classification of an artifact never produced. Registered as `F-S6-4` / `OI-S6-1`.
4. **No unclaimed-row count is reported**, because there is no dataset over which to count. Reporting
   one would be reporting a count over something that does not exist.
5. **`R9`'s residual is accepted, not mitigated.** The probe set narrows the exposure to pathologies
   nobody thought to probe for and cannot eliminate it, so the real migration inherits a pre-flight
   re-run of the same set and an abort condition when a probe returns a shape the dry-run never saw.
6. **`F-S6-2` names the limit of the whole approach**: mis-ownership is undetectable by aggregate,
   because no column distinguishes principals. No probe set of any size reaches it.

---

## Evidence

| Claim | Source |
| --- | --- |
| SUB-3 recorded the exclusion and named SUB-6 as the evidencing party | `../03_learner-data-inventory-and-classification.md:484`–`:501`, esp. `:500`–`:501` |
| SUB-3 sets no owner, retention bound or specification for the dataset | `DR-C11-S3-3_package-own-copies-and-the-derivation-test.md:73`–`:74` |
| The derivation test is "does this artifact contain data derived from real learner rows?" | `../03_learner-data-inventory-and-classification.md:484`–`:501` |
| `LD-S3-32` is classified *not personal data* and "does not exist at position 3" | `../03_learner-data-inventory-and-classification.md:473`–`:476` |
| SUB-5 restates `LD-S3-32` as SUB-6's to produce | `../05_the-enforcement-point-that-confines-every-read-and-write.md:613`–`:614` |
| An aggregate is confined iff the predicate applies before aggregation | `../05_the-enforcement-point-that-confines-every-read-and-write.md:591`–`:593` |
| A failed no-copied-rows audit overturns the exclusion | `DR-C11-S3-3_package-own-copies-and-the-derivation-test.md:103`–`:105` |
| No production credential exists in this environment | `.env.example:13` carries a `localhost` placeholder; no `DATABASE_URL`, `SMOKE_PROD_*` or `AUTH_*` is set at `35f92ba` |
| The schema the generator reads carries no rows | `src/infrastructure/db/schema.ts`; `drizzle/0010_create_infrastructure_mcp_request_log.sql`; `drizzle/0012_extend_mcp_request_log.sql`; `drizzle/0013_create_operation_event_log.sql` |
| `notes.target_id` has no declared FK, making it the one probeable orphan surface | `src/infrastructure/db/schema.ts:293` |
| The SM-2 columns carry no `CHECK`, making out-of-range values structurally possible | `src/infrastructure/db/schema.ts:89`–`:95`, the table's complete constraint list, where no `chk_` constraint covers `difficulty`, `ease_factor`, `repetitions`, `interval_days` or `consecutive_failures` |

---

## Revision trigger

1. **A production credential becomes available** — the aggregates run, `LD-S3-32` comes into
   existence for the first time, the dataset is generated, and the dry-run reports a real
   unclaimed-row count. `F-S6-4`, `OI-S6-1` and `OI-S6-2` all close on that event.
2. **Any generator input becomes row-valued** — the closure argument fails at its stated falsifier,
   the derivation test admits the dataset, and the exclusion SUB-3 recorded is overturned by this
   sub-task's own evidence, exactly as `DR-C11-S3-3`'s revision trigger anticipates.
3. **A probe in §6 is found to be unsound** — the published SQL is the artifact; a query that does
   not detect what it claims to detect is a finding against this record, not a detail.
4. **A sixth generator input is discovered** — the enumeration is the argument's only load-bearing
   premise, so an input outside the five invalidates the closure until it is classified.
