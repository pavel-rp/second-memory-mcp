# `DR-C11-S13-2` — The sweep's resume cursor is its own target predicate, and the batch is bounded by a clock rather than by a row count nobody has

**Task:** NEU-1006 (SUB-13) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `fd05ca1`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-19 (`../90_outcome-register.md`) — the migration plan's execution contract, and the batched-idempotent-resumable obligation `R-S6-2` states and `DR-C11-S7-2` clause 5 makes hard

---

## Decision

1. **Every sweep is idempotent at the statement level.** Each statement's `WHERE` clause excludes the
   rows it has already acted on. Re-running a completed sweep affects zero rows and raises no error.
   This is not a nicety: the boot migrator runs unconditionally on every restart
   (`src/infrastructure/db/migrate.ts:45`–`:49`) and `OBJ-7` puts that at **≥ 7 times a day**.

2. **The resume cursor is the sweep's own target predicate.** `WHERE user_id IS NULL` for `S4`,
   `WHERE "timestamp" < :cutover` for `S1`, the table's own emptiness for `S2`. **No separate
   progress ledger is written**, because a ledger must be updated transactionally with each batch and
   a ledger that can disagree with the data is a second thing that can be wrong.

3. **The batch is bounded by a wall clock, with a row ceiling as a secondary guard.** Each boot runs
   slices until `SM_MIGRATION_SLICE_MS` elapses or the predicate returns zero rows;
   `SM_MIGRATION_SLICE_ROWS` caps one statement so a single slow batch cannot overrun a clock that is
   only checked between statements.

4. **A time box needs no row count to be safe, and that is the whole answer to `CAP-S7-1`'s
   objection.** `CAP-S7-1` records that `T2` and `T7` scale with counts that were never taken, so no
   stage is shown to fit `OBJ-8`. A bound expressed in *rows* would require the count. A bound
   expressed in *time* does not: it stops when the clock says so, whatever the table holds.

5. **What a time box cannot bound is total completion, and that is stated rather than hidden.** The
   number of boots still scales with the row count and the row count is still unknown.
   **`CAP-S7-1`'s residual is unchanged.** What changes is its shape: from *"a boot may breach
   `OBJ-8` by an unknown amount"* to *"the migration may take an unknown number of days"*. Carried as
   `R-S13-1`.

6. **Every batch selects `FOR UPDATE … SKIP LOCKED`**, so two overlapping boot migrators divide the
   work rather than blocking or double-writing. `R-S15-3` and `F-S7-6` are cited, not re-raised.

7. **The two slice defaults are stand-ins, not derivations** — `5000` ms and `10000` rows, registered
   as `A-S13-1` with an owner and a re-validation trigger (`SPK-S6-2` or `SPK-S15-1`). Neither is
   claimed to be correct; the argument is for the *shape* of the bound, not for the number.

---

## Rationale

**The obligation was already hard before this record.** `R-S6-2` requires the sweep to be batched,
idempotent and resumable. `DR-C11-S7-2` clause 5 sharpens it: because every disable path is read at
boot and every restart re-runs the migrator, *"a sweep that is not resumable cannot be paused by this
control class at all"* — so resumability is what makes the containment control exist on `T2`, `T3`
and `T7`. It is not a robustness preference; it is the precondition of four of SUB-7's six real
disable paths.

**The interesting choice is where the resume state lives.** The instinctive design is a progress
table: last id processed, per sweep, per table. It reads as more auditable, and it is worse. It must
be written in the same transaction as the batch or the two can diverge; if it diverges, it either
re-processes rows (harmless here, but only because these particular sweeps happen to be idempotent)
or skips them (silent data loss, and invisible — a backfill that skipped a range leaves `NULL`s that
`T9`'s `SET NOT NULL` discovers as a failed migration on a production boot). It is also a new schema
object with its own migration, its own retention question and its own place in the disposition table
that SUB-6 never inventoried.

Using the target predicate as the cursor removes the whole category. `WHERE user_id IS NULL` is
exactly the set of rows still to do, by definition, at every instant, with no bookkeeping. It is
correct after a crash, after a kill mid-batch, after two concurrent migrators, and after an operator
runs the statement by hand. The sweep's completion condition — the predicate returns zero rows — is
the same expression as its progress condition, so the two cannot disagree. This is the same property
SUB-4 relied on when it observed that `deleteExpired`'s predicate selects on expiry rather than on
the binding: **the predicate is the design**, and choosing the right one removes state rather than
tracking it.

**Batch sizing was the part that looked impossible and was not.** `CAP-S7-1` is correct that no stage
is shown to fit. The trap is to read that as "therefore pick a row count and hope", which is what
inventing a batch size would be — and the package has been bitten twice by numbers that looked
derived. The way out is to notice that the impossibility is specific to *row-denominated* bounds. A
slice of 10 000 rows has an unknown duration, because rows-per-second is unmeasured; a slice of
5 000 ms has a known duration by construction and an unknown row throughput. The unknown does not go
away — it moves to a place where it costs a longer migration instead of a longer outage. That is a
strictly better place for it, and it is the most this chapter can honestly do.

**The defaults are the weakest part of this record and are labelled as such.** 5 000 ms is under half
of `OBJ-8`'s tightest published allowance on a stage-landing day (11.4 s,
`../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:548`), which leaves margin for the
baseline boot duration — a quantity that has never been measured (`OI-S15-1`, `SPK-S15-1`). So the
argument is *"it leaves margin"*, not *"the margin is enough"*, and the difference is the whole
reason this is `A-S13-1` and not a derivation.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **A progress-ledger table recording the last processed id per sweep per table.** | The closest alternative and the one most likely to be reached for. It introduces a second source of truth that must be transactional with the batch; when it diverges it either re-processes (harmless only by luck) or silently skips, and a skipped range surfaces as a failed `SET NOT NULL` on a production boot four stages later. It is also a new table SUB-6 never dispositioned. |
| 2 | **A row-denominated batch — "10 000 rows per boot" and nothing else.** | It is the bound `CAP-S7-1` forecloses: its duration is unknown because rows-per-second is unmeasured, so it cannot be checked against `OBJ-8` even in principle. It converts an unknown into a *hidden* unknown, which is the failure mode the cap exists to prevent. |
| 3 | **Run the whole sweep in one boot and accept the outage.** | Honest, simple, and it makes `T2`'s and `T7`'s duration unbounded on a platform where boot precedes traffic. `R-S6-2` exists to reject exactly this, and `DR-C11-S7-2` clause 5 would leave four stages with no working containment control. |
| 4 | **Defer the sweep out of the boot migrator entirely — a cron job, a one-off script, `pg_cron`.** | It is the design that would actually solve the availability problem, and it is unavailable: migrations run on boot, unconditionally, with no guard and no lock (`src/infrastructure/db/migrate.ts:45`–`:49`), the compose stack is off-repo, and introducing a scheduler is a `src/` change this sub-task is out of scope to make. Recorded because it is what a later charter should reconsider, not because it was close. |
| 5 | **`SELECT … FOR UPDATE` without `SKIP LOCKED`.** | Two overlapping migrators then block on each other for the duration of a batch, on a platform that cannot guarantee exactly one concurrent boot migrator (`R-S15-3`). `SKIP LOCKED` makes the overlap a division of labour instead of a stall, at no cost when there is only one. |
| 6 | **Make the archive move a `INSERT … SELECT` followed by a separate `DELETE`.** | Two statements, two transactions, and a window in which a row exists in both tables — or, if the process dies between them, in both permanently. The `WITH … DELETE … RETURNING … INSERT` form makes the move atomic per batch, so a row is in exactly one place at every instant. |
| 7 | **Pick the slice defaults by benchmarking against a synthetic dataset.** | SUB-6 already built a synthetic dry-run and was explicit that its throwaway SQL *"is explicitly not the OUT-19 migration artifact"*. A number measured against synthetic data of unknown resemblance to production would look derived and would not be, which is worse than a stand-in that says what it is. |

---

## Consequences

1. **`R-S6-2`'s batched-idempotent-resumable requirement is discharged as a design**, and not as an
   execution: nothing has been run. Its residual — that several short breaches are still breaches —
   is unchanged and still escalates to `NEU-896`.
2. **Four of SUB-7's six disable paths become operable.** `T2`, `T3` and `T7`'s batch-pause control
   works only against a resumable sweep; before this record it had nothing to pause.
3. **`CAP-S7-1` is not lifted.** It is re-shaped: the unbounded quantity is now the number of boots
   rather than the duration of one. `R-S13-1` carries it.
4. **The migration's completion date is unknowable from here**, and an operator must therefore watch
   the unkeyed-row count fall rather than plan against a date.
5. **The sweeps are safe to run by hand.** Because the cursor is the predicate, an operator who runs
   a batch statement in `psql` neither corrupts state nor confuses the next boot. That was not a goal;
   it is a consequence of removing the ledger, and it is worth having on a platform where the operator
   is the only recovery mechanism.
6. **What becomes harder:** there is no artifact to inspect to answer *"how far along is it?"* other
   than running the count query. A ledger would have given a dashboard. The count query is the
   dashboard.

---

## Evidence

| Claim | Source |
| --- | --- |
| The sweep must be batched, idempotent and resumable, and SUB-13 chooses its batching | `../92_risk-register.md` § `R-S6-2` |
| A sweep that is not resumable cannot be paused by the disable-path control class at all | `DR-C11-S7-2_the-deploy-independent-disable-path.md` clause 5 |
| Every disable path is read at boot and every restart re-runs the migrator | `DR-C11-S7-2_the-deploy-independent-disable-path.md` clause 4 (`F-S7-2`) |
| Migrations run on boot, unconditionally, through the same pool as the application | `src/infrastructure/db/migrate.ts:45`–`:49`; `src/infrastructure/db/client.ts:37`–`:53` |
| Configuration resolves after the migrator | `src/transport/main.ts:27`, `:42`–`:43`; `src/composition-root.ts:379` |
| `T2` and `T7` scale with row counts that were never taken; no stage is shown to fit | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:560`–`:563` (`CAP-S7-1`, `OI-S6-1`) |
| `OBJ-8`'s allowance is 13.1 s at baseline and 11.4 s on a day one stage lands | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:545`–`:550` |
| ≥ 7 unannounced restarts per day | `../15_operational-objectives-for-the-real-platform.md:254` (`OBJ-7`) |
| Restart duration is unobserved | `../96_spike-register.md` § `SPK-S15-1`; `OI-S15-1` |
| The per-disposition counts and the twelve probes have never been executed | `../96_spike-register.md` § `SPK-S6-2` |
| The platform cannot guarantee exactly one concurrent boot migrator, and cd-prod's serialisation narrows but does not close the window | `../92_risk-register.md` § `R-S15-3`; `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:581`–`:589` (`F-S7-6`) |
| The dry-run SQL is not the OUT-19 artifact | `../06_the-disposition-of-every-unowned-row.md` §7.3 |
| The four-wave intra-`S4` order, and `P-ORPHAN-2` as a hard entry condition | `../06_the-disposition-of-every-unowned-row.md` §9.3 |

---

## Revision trigger

- **`SPK-S6-2` executes and the counts exist.** `A-S13-1`'s defaults can be checked against a real
  completion horizon, and clause 5's "unknown number of days" becomes a number. `R-S13-1` narrows.
- **`SPK-S15-1` executes and the baseline boot duration is observed.** The 5 000 ms default stops being
  *"leaves margin"* and becomes derivable; `A-S13-1` retires.
- **A migration path outside the boot migrator is introduced.** Rejected alternative 4 becomes
  available, and this record's whole time-boxing apparatus is superseded by simply not running the
  sweep on the boot clock.
- **A sweep is added whose target predicate is not self-shrinking.** Clause 2 stops being sufficient
  and that sweep needs its own resume design — the ledger this record rejects may be right for it.
- **`R-S15-3` closes**, or cd-prod's `concurrency` block is removed. Clause 6's `SKIP LOCKED` becomes
  unnecessary or becomes essential, respectively.
