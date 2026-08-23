# `DR-C10-S6-1` — The MCP core is the exclusive writing **tier** for every state category (all-MCP)

**Written by:** NEU-976 (SUB-6) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-3`
**Written:** 2026-08-21
**Model:** claude-opus-5[1m]
**Carried in:** `../07_state-ownership-model-selection.md` §2–§7

---

## Decision

**`M-A` — all-MCP — is the state-ownership model.** The MCP core is the **exclusive writing tier
for all 45 categories** in `../04_state-category-inventory.md` §3. The web tier (`CMP-S4-3`) holds
no write authority over any category and no database credential; every web mutation is an MCP
tool call across `CMP-S4-4`, and every web read is an MCP tool call or a projection the core
produced.

**Scope of the quantifier — amended by NEU-987 (`F-S10-6`).** This claim ranges over **deployment
tiers**, not over the components inside the MCP core. It says that no tier outside the core writes
any of the 45 categories; it does **not** say that one component writes all 45. *Which* component
inside the core is the single authority for each category is settled by the per-state authority
matrix — `../08_per-state-authority-matrix.md`, republished at
`../10_republished-authority-matrix.md` — and this record defers to it wholesale.

So the matrix assigning `SC-S3-33`/`SC-S3-34` to `CMP-S4-17`, and `FL-S4-13` calling `CMP-S4-17` the
drift cache's *only writer*, are **inside** this decision, not against it. `CMP-S4-17` is on the
operator's server side of the boundary this decision draws:
`../05_system-context-and-responsibility-boundaries.md` §3.1 places it in zone **`Z-CONT`**, *"the
operator's content-orchestration path"* (`CMP-S4-13` … `CMP-S4-19`) — one of the three operator-side
zones (`Z-CORE`, `Z-CONT`, `Z-MEAS`) that sit behind the MCP tool surface. The tier this decision
excludes from writing is **`Z-WEB`** (`CMP-S4-3`), and `CMP-S4-17` is not in it. The pre-amendment headline
read *"the exclusive writer of all 45 categories"* with no stated quantifier, which a reader with
only this package in hand reasonably took component-wise. Nothing about the selection, its weights,
its scores, or its margin changes — only the scope of the sentence is made explicit. See
`DR-C10-N987-1_state-writer-adjudication.md`.

Three things follow, and are part of the decision rather than commentary on it:

1. **`BND-S4-16` is resolved as "the write edge does not exist."** `../05_…md` §4.2 left the
   web tier ↔ persistence edge undecided with its class fixed as *process, not trust*, and
   §4.4 made disjointness a condition SUB-6 must demonstrate rather than assume. Under `M-A`
   there is no second writer, so no disjointness obligation arises to discharge.
2. **The assignment rule of `../07_…md` §6 is part of this decision**, not a separate one:
   six ordered first-match-wins clauses, an explicit tie-break, and a closed exception set that
   is **empty** under `M-A`.
3. **The selection is stable across both store assumptions** — `M-A` wins by 74/500 under a
   shared production Postgres and by 50/500 under a separate web store — and the exact
   three-clause condition that would reverse it is published for `SUB-10 (NEU-984)`.

## Rationale

**The weights were fixed before the scoring, and the ordering is a checkable artifact rather
than a claim.** `../07_…md` §1 — the eight criteria, their weights summing to 100, and a
package-artifact source for each — was committed alone as **`f08339f`**, in a commit that
contains no score. The scoring landed afterwards. A reader verifies it with
`git log --follow` on the chapter path and `git show f08339f:<path>`; the earliest commit for
the path contains §1 and no score table. This matters because `OUT-3`'s acceptance bar is that
a conclusion reducing to preference fails, and a weight reverse-engineered from a score is
indistinguishable from a preference. §1.5 records that **no weight was revised**; had one been,
it would appear there as a numbered revision with its reason and the score set it invalidated,
never as an edit to the table.

**The weights encode the charter's own risk ordering, not a taste.** `C1` (22) is the
program's Critical risk stated verbatim. `C2` (18) is the only other outcome in the package
carrying a stated invariant, and a model that forecloses isolation cannot be migrated out of.
`C4` (14) is weighted third because `A-28` is a **constraint on the answer** — a model
requiring the existing production deployment to stop is outside the envelope C010 may select
from — and `C7` (12) fourth because a model that scores perfectly on risk and cannot deliver
the product is not a candidate.

**Two scoring rules were stated before the scores, because each changes what a score means.**
`C1` scores the *additional* conflict surface: the read-modify-write baseline is common to all
three models, so scoring it would inflate every model equally and change no ordering; it is
recorded as `F-S6-1` instead. `C2` scores *reachability*, because `F-S5-4` makes present-tense
isolation identically `fails-transport` for every model — and per `../06_…md` §3.4.1 no `C2`
score above 4 rests on failing to find a counter-example.

**The decisive margin is `C1` + `C2` + `C4` = 54 points of weight**, and `M-A` takes the
maximum on all three by construction rather than by enforcement: with one writer there is
nothing to enforce. `M-A`'s one genuine weakness, `C7` at 2 of 5, costs it 36 points of the 60
available and is not enough to close a 74- or 50-point gap.

**`SPK-S6-1` removed a criterion's discriminating power, and that is recorded as a result
rather than buried.** The standing argument for a hybrid is that routing reads through MCP is
too slow for `A-25`'s sub-second budget. Measured, the boundary costs at most **0.02%** of that
budget. `C5` scores 4 for all three models and changes no ordering. Had the spike gone the
other way it would have moved 8 points of weight toward `M-B`/`M-C` — not enough to reverse the
selection either, which is itself worth knowing.

## Rejected alternatives

Each rejected model carries the same treatment as the selected one: evidence, consequences, a
migration path and its residual uncertainty. A record with no rejected alternatives is an
announcement, not a decision.

### `M-B` — shared-store hybrid (co-authority by convention) — **rejected, and disqualified**

- **Score:** 212/500 (shared Postgres), 172/500 (separate store). Last under both.
- **Evidence that decided against it.** `M-B` falsifies a premise the repository states about
  itself: *"Acceptable for single-user MCP"* (`src/orchestration/review-workflows.ts:190`–
  `:191`), guarding a read-modify-write scheduling path (`review-workflows.ts:35`, `:60`–`:89`,
  `:99`) with **no** optimistic concurrency control anywhere in `src/` (zero `FOR UPDATE`, zero
  `pg_advisory`, zero `xmin`, no compare-and-set; `contentVersion` at
  `src/infrastructure/db/schema.ts:70` is a display counter never used in a `WHERE`) and **no**
  isolation level set on any transaction (`src/infrastructure/db/operations.ts:21`–`:24`, so
  READ COMMITTED applies). The concrete mechanism is `F-S6-3`: the one-active-**learning
  session**-per-learner invariant is enforced only in application code across two round trips
  (`src/orchestration/session-workflows.ts:39`–`:46`, `:68`–`:78`) with no partial unique index
  behind it (`src/infrastructure/db/schema.ts:99`–`:124`), so a second writer process creates
  two concurrently active sessions with nothing in the database rejecting it.
- **Additionally disqualified on the durability property.** `../07_…md` §7: `M-B` cannot
  *show* that a retired citation degrades a placement without stranding mastery history,
  because its partition line is open and it supplies nothing that fails loudly if the line is
  drawn with `SC-S3-32` on the web side and `SC-S3-31` on the core side. The bar is *show*, not
  *promise*. This disqualification is independent of the score.
- **Consequences had it been selected.** Two writers to one store with no shared transaction;
  the exactly-one-authority audit reducible to a document nothing enforces; `CAP-S4-1`'s
  deletion-owner gap acquiring a second producer; and its central correctness claim — *the two
  writers do not conflict* — unobservable without a live database and a two-process harness
  (`CAP-S6-1`).
- **Migration path had it been selected.** Grant the web tier direct database credentials;
  replicate the core's write semantics for its partition; retrofit optimistic concurrency
  control or atomic-SQL writes onto the shared rows — the pattern exists in this codebase
  already (`src/adapters/drizzle/chunk-repository.ts:149`–`:160`, `:347`;
  `src/adapters/drizzle/linter-validation-repository.ts:41`–`:49`, `:84`–`:97`) but is applied
  to corpus and ordering data, never to learner state. **Rollback is the problem:** once the
  web tier has written rows the core did not, reverting requires a data reconciliation with no
  owner and no mechanism.
- **Residual uncertainty.** Whether a *carefully* drawn `M-B` partition would in practice
  diverge was not observed — `CAP-S6-1` records that no Postgres was reachable at this cutoff.
  The rejection rests on the readable facts above, which establish that **nothing prevents**
  divergence; it does not rest on having watched divergence happen. That distinction is the
  cap, and it is why the cap has a named owner rather than being absorbed here.

### `M-C` — namespace-disjoint delegated surface — **rejected, and the runner-up under both store assumptions**

- **Score:** 364/500 (shared Postgres), 388/500 (separate store). Second under both.
- **Evidence that decided against it.** Under a shared production Postgres, `M-C`'s
  disjointness is structural at the table level but the web tier still holds a credential to
  the same instance, and **no artifact in this package establishes that table- or schema-level
  grants confine it** — anchor 3, "mitigation not established by any artifact at this cutoff".
  Scoring it 4 there would have been an assertion, which `../92_spike-register.md` §2 forbids.
  Under a separate store that reservation dissolves and `C1`/`C2` rise to 4 — but `C6` and `C8`
  fall, because a second store is a second retention, backup, migration and monitoring surface
  and `CAP-S4-1`'s gap must then be answered twice. `M-C` cannot reach 5 on `C2` in either
  case: two principals still resolve independently, a real I5 surface that `../06_…md` §3.4.1
  forbids scoring away by not finding a counter-example.
- **Consequences had it been selected.** One row would enter §6's exception set —
  `SC-S3-43`, **web session** and UI interaction state, classification `assumed`, stand-in
  `A-27`, store `none`. The `BND-S4-16` disjointness demonstration would then be owed, and
  §6.3's enumeration is what would discharge it.
- **Migration path had it been selected.** Create a namespace — separate database schema or
  separate store — writable only by the web tier; leave every existing table untouched; route
  all web reads of learning state through MCP tools. Rollback is clean: drop the namespace, the
  core is unchanged. This is a materially better rollback story than `M-B`'s and is the main
  reason `M-C` is the runner-up rather than a co-loser.
- **Residual uncertainty, and why it is not dismissed.** `M-C` loses by 50 points under a
  separate store, and `../07_…md` §5.3 shows a three-clause conjunction that closes that gap
  and reverses the selection **by 2 points out of 500**. A 2-point reversal is a tie, not a
  defeat. If all three clauses come to hold, the two models should be treated as equivalent on
  this criteria set and re-decided on evidence this package does not have.

### `M-A` without a third model — **rejected as a method, before any scoring**

Running the comparison as the two-way the charter names (all-MCP against hybrid) was
considered and rejected. `../05_…md` §4.4 requires SUB-6 to *demonstrate* disjointness rather
than assume it, and a two-way comparison has nowhere to put the distinction between structural
and conventional disjointness — it would have forced `M-C`'s properties to be scored under
`M-B`'s label, flattering the hybrid case on `C1`/`C2` and concealing the fact that `M-B`'s
weakness is *the partition being unenforced*, not *the partition existing*. The third model was
surfaced by the comparison and scored on the same eight criteria.

## Consequences

**For `SUB-13 (NEU-977)`.** Its 45-row authority matrix is a mechanical application of
`../07_…md` §6, not 45 judgement calls. Clause 6 is terminal for every row clauses 1, 2, 4 and
5 do not claim, and the exception set is empty — so **the MCP core is the answer for every row
that is not `n/a — non-durable` or IdP-authored**. The exactly-one-authority audit is then a
check that the rule was applied, not a search for conflicts.

**For `SUB-14 (NEU-978)`.** Every in-domain row has one writer, so the invariant's I3
(confinement) has a single enforcement point to evaluate. `F-S5-4` still applies: no category
reaches `holds` at this cutoff and the binding constraint is the transport.

**For `SUB-7 (NEU-980)`.** The web API is a client surface over MCP tools, and its negative
boundary is now sharp: **no resource in that inventory writes the database directly.** SUB-7
also owns clause **R3** of the reversal condition.

**For `SUB-10 (NEU-984)`.** It runs `../07_…md` §5.3's three-clause check against its selected
topology and files any reversal as a finding routed to **SUB-6, the named owner** (`OI-S6-1`).

**The cost this decision accepts, stated plainly.** `M-A` scores **2 of 5** on product
delivery. Every write of non-gate-bearing **web session** and UI state becomes an MCP tool
call, so the tool surface must grow presentation-shaped tools and `A-27`'s explicitly
non-gate-bearing state acquires the gating of the tool that carries it. This is the single
largest concession in the decision and it is not a rounding error; it is bounded only by the
fact that `C1 + C2 + C4` outweigh `C7` by 54 to 12.

**Migration path.** No database schema change to any existing table. The web tier is built as
an MCP client over `CMP-S4-4` (the HTTP transport edge). New presentation state enters as new
MCP tools. **One sequencing constraint is binding:** `F-S5-4` records that the transport, not
the database schema, is what stops any category reaching `holds` — so NEU-893's isolation
mechanism must land before any multi-learner web surface does, and closing the STDIO gap
(`BND-S4-17`, owner `nobody`) will *surface* the `sub`/`azp` defect rather than resolve it
(`../06_…md` §4.3). Rollback is trivial in the sense that matters: the web tier is a client, so
removing it removes nothing from the core.

**A fourth sighting of the deletion-owner gap — deliberately not filed as a fourth entry.**
`C6`'s scoring turns on `CAP-S4-1` (no component can be the deletion owner for `SC-S3-16` /
`SC-S3-17`; the obstruction is structural) and `F-S3-3` (both log tables hold learner payload
with no retention window, no deletion owner, no principal field). This decision adds a
consequence to that gap: **under `M-A` the gap is frozen exactly as `CAP-S4-1` describes it** —
no new log producer is introduced, so the gap neither widens nor acquires an owner, and a
model that would have widened it (`M-B`) is rejected partly for that reason. Following the
precedent SUB-4 and SUB-5 set, this is recorded here as a consequence rather than as a fourth
register entry: a structural gap does not become more owned by being filed again.

## Evidence

- **Scored comparison:** `../07_…md` §3.2 and §4.1 — six score sets, three models × eight
  criteria × two store assumptions, each cell's reasoning in §3.3 and §4.2.
- **Criteria pre-registration:** commit `f08339f`, containing `../07_…md` §1 and no score.
- **Codebase facts, read at the 2026-08-21 cutoff on `origin/develop`,** re-verified at this
  sub-task's own cutoff under `CAP-S1-2` rather than inherited: `../07_…md` §3.1, eight rows,
  each cited to a path and line range.
- **Measured:** `SPK-S6-1` in `../92_spike-register.md` — MCP tool boundary overhead, p95
  0.19 ms at 714 bytes and 0.06 ms at 29,715 bytes, 2000 iterations per arm, Node v22.23.1,
  `@modelcontextprotocol/sdk` 1.27.1.
- **Consumed, not re-derived:** `A-25`, `A-27`, `A-28`, `A-29` from `../93_…md` (closed);
  `F-S5-4`, `../06_…md` §3.3 and §3.4.1; `CAP-S4-1`, `BND-S4-4`, `BND-S4-16`, `BND-S4-17`,
  `CMP-S4-2`/`3`/`7`/`9`/`14`/`15`/`19` from `../05_…md`; `SC-S3-*` rows and their
  classification from `../04_…md` §3.
- **Not evidence:** a green type-check or lint line. `../00_method-and-provenance.md` §5 makes
  those no-regression checks only; none appears in `../traceability/S6_…md`.

## Revision trigger

Any **one** of the following observable events reopens this decision:

1. `SUB-10 (NEU-984)` publishes a data-store record satisfying **all three** clauses `R1`,
   `R2` and `R3` of `../07_…md` §5.3 — the selection reverses to `M-C` by 2 points and must be
   re-decided on evidence this package does not have.
2. `SUB-10` selects a topology `../07_…md` §5.2's table marks as raising a finding: a second
   credential holder on the shared production Postgres, or the MCP core's own state moving to a
   separate store. Neither was scored.
3. `SUB-7 (NEU-980)` publishes a resource inventory containing a required web-surface state
   item that cannot be expressed as an MCP tool without making non-gate-bearing state
   gate-bearing — clause `R3` alone, which does not reverse the selection but does invalidate
   the `C7 = 2` cell it was scored on.
4. A sub-task establishes that a `04_…md` §3 row satisfies all four tests of §6's clause 3.
   The exception set is closed and enumerated; a new member is a finding routed to SUB-6, not a
   matrix-time judgement call.
5. `SPK-S6-1` reaches its expiry (2027-08-21) without re-measurement, or a re-measurement on a
   later SDK or runtime returns a p95 boundary overhead above 50 ms — a thousandfold change,
   which would move `C5` from non-discriminating to decisive.
