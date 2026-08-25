# `DR-C11-S5-2` — `SC-S3-12` is carried to `holds` against an enumerated access-path set and a composed target state, giving the isolation invariant its first positive instance without lifting `CAP-S5-1`

**Task:** NEU-997 (SUB-5) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `cc38cc9`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-8 (`../90_outcome-register.md`) — the clause requiring *"at least one named state category all the way to verdict `holds`"* and the discharge of `CAP-S5-1`, which this package co-owns.

## Decision

**Four clauses.**

1. **The category carried is `SC-S3-12` (Notes),** whose store is `public.notes`
   (`src/infrastructure/db/schema.ts:288`). It is one of the fifteen categories at
   `fails-confinement` under C010's Census B
   (`../../C010-system-and-repository-architecture/10_republished-authority-matrix.md:744`), so `I1`
   and `I2` are already discharged under the composed state and `I3` is the sole open check.

2. **The target state is form (c), composed, with exactly five enumerated assumed changes** — the
   ownership key from `NEU-850`'s `OUT-2` keyed to the **resolved principal identifier** (the OIDC
   `sub` on HTTP, the configured identifier on STDIO, since STDIO has no JWT); this chapter's
   enforcement point applied to `NotesRepository`; SUB-4's STDIO identity gate and bound context
   token; SUB-2's identity rule including removal of the `sub || azp` merge; and **a reachable
   transition to the column on a populated table** — either the table is empty at cutover or the
   column lands nullable and is tightened afterwards. **And nothing else.**

3. **`I3` is answered from a published enumerated access-path set, not from a failed search for a
   counter-example.** The set is four SQL statements, all in
   `src/adapters/drizzle/notes-repository.ts` — `:15`–`:25`, `:38`–`:40`, `:54`–`:56`, `:61` — and it
   is **closed by the module boundary**: the `notes` table object is imported in exactly one file
   (`:4`), no raw SQL anywhere in `src/` names the table, `UnitOfWorkPort` does not compose the port,
   and the only other reference is a test-only `TRUNCATE` (`src/infrastructure/db/client.ts:78`).

4. **The verdict is `holds`, and `CAP-S5-1` is discharged but not lifted.** The lifting condition is
   stated as a landing condition on applied work against target state (a).

## Rationale

**Why a positive instance was worth producing at all.** `CAP-S5-1`
(`../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:185`) records that
C010 established the invariant *"well-formed"* but not *"satisfiable"*, with *"no positive instance
… anywhere in the package"*. `:187` states the honest converse: *"nothing here shows the invariant is
**un**satisfiable either; the honest statement is that satisfiability is untested in both
directions."* An invariant that six merged chapters cite as the isolation contract, and that nothing
has ever been shown to be able to satisfy, is a contract nobody can plan against. One worked instance
changes that, and it is the only thing that does.

**Why the enumerated access-path set is the whole of the work.**
`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:237`–`:240`
is categorical: *"A verdict of `holds` requires an **enumerated access-path set** for the category.
Until one exists, I3 must return `fails-confinement` or the evaluation must stop — **it may not
return `holds` by failing to find a counter-example.** Absence of a found unscoped path is not
evidence of absence."* `:242`–`:246` records that **nobody owed the enumeration** — SUB-13's authority
matrix is *"the natural carrier"* but *"does not oblige itself to enumerate read paths, and I3 covers
both"* — and names that gap as *"one of the reasons `CAP-S5-1` states that satisfiability is
untested."* Producing the set is therefore not a supporting step; it is the thing that was missing.

**Why `SC-S3-12` and not the alternatives.** The binding criterion is not importance but whether the
access-path set can be **closed**, and closure is a property of the module structure rather than of
diligence. `public.notes` is the one learner-owned table in the codebase whose Drizzle table object
is imported in exactly one file and which no raw SQL and no transactional composer touches. The
alternatives each widen the enumeration or weaken the placement:

- `SC-S3-13` (context tokens) is enforced at the transport gate, **above** the port boundary — so
  `I3`'s placement conjunct must be argued rather than satisfied — and the token row is what
  *establishes* the principal, making confinement by that principal circular.
- `SC-S3-11` and `SC-S3-10` run through `SessionQuestionRepository`, spanning four tables and twelve
  methods.
- `SC-S3-3` lives on `learning_chunks`, reachable through `SearchPort` **and** through
  `ReviewPersistencePort`'s second write path.
- `SC-S3-5` additionally requires §4.2's guard removal, which depends on a DDL object this package
  does not author.

`SC-S3-12` is also the shape C010 predicted: *"a durable learner-scoped category on the HTTP path"*
(`../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:189`).

**Why the target state must be composed, and enumerated.**
`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:156`–`:158`
voids an unenumerated composed evaluation outright: *"A composed state must list them; 'assume
isolation is implemented' is not a target state and an evaluation against it is void."* Five changes
are listed because five are needed; listing fewer would misrepresent, and listing more would import
assumptions the derivation does not use. **`C5` is in the list for exactly that reason:** `C1`
specifies a `NOT NULL` column, the chapter's own §6.4 establishes that such a column cannot be added
to a populated table without a backfill or a default, and SUB-6's disposition is on the *not
assumed* list — so without `C5` naming a reachable transition, `C1` is unreachable from the stated
set and the whole evaluation would be void rather than merely optimistic.

**Why the cap is not lifted.** Its own text says the preconditions must *"land together"*. Nothing has
landed. The distinction between *satisfiable in principle* and *satisfied on the deployment* is the
distinction between discharging the cap's subject matter and clearing its condition, and collapsing
them would be the over-claim the cap was written against.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Carry `SC-S3-13` (context tokens) instead** — the category SUB-4 already designed enforcement for | Its enforcement sits at the transport gate, above the port boundary, so `I3`'s third conjunct is argued rather than met; and confining the row that *establishes* the principal by that same principal is circular. SUB-4 itself deferred the placement question: *"Where that refusal is enforced is SUB-5's (`OUT-8`)"*. Choosing it would answer `I3` with the very question `I3` asks. |
| 2 | **Carry `SC-S3-5` (learning-session record)** — C010's own worked `fails-confinement` demonstration | The strongest statement available, and deliberately declined **as the first instance**. It additionally requires §4.2's guard removal to be complete, and that rests on a partial unique index which is SUB-13's DDL — an artifact that does not exist when this derivation is written. The charter forbids exactly that dependency. A second, ambitious carry of `SC-S3-5` remains open to a later sub-task once the DDL exists. |
| 3 | **Carry `SC-S3-19` (subject-binding map)** — the only category C010 calls genuinely enumerated | Process-local, non-durable, HTTP-only, and **fail-open** (`src/transport/http.ts:57`–`:58` returns `true` when no binding is found). Its `I3` passes only under `F-S14-1`'s purposive reading; under the literal reading it fails. A `holds` on a category emptied by every restart — at a measured ≥3.29 restarts/day — would be the over-claim `CAP-S5-1` guards against. |
| 4 | **Carry all fifteen Census-B `fails-confinement` categories** | Each needs its own enumerated access-path set, and thirteen of the fifteen have wider ones. Producing fifteen shallow enumerations would reproduce the defect §3.4.1 names — a `holds` asserted from not having found a counter-example — fifteen times instead of once. One closed enumeration is worth more than fifteen open ones. |
| 5 | **Evaluate against target state (a), *as it stands*** | Returns `not-evaluable`: no ownership column exists, so `I2` fails and the remaining checks have nothing to run against. This is a true statement and it is the one C010 already published; it produces no positive instance. |
| 6 | **Evaluate against a composed state described as "isolation implemented"** | Void by `:158`, explicitly. |
| 7 | **Declare `CAP-S5-1` lifted on the strength of this derivation** | Forbidden by the charter and wrong on the merits: the cap's condition is three preconditions *landing*, and nothing here is applied. It would also make the cap's owner, `NEU-986`, the recipient of a closure it cannot verify. |

## Consequences

1. **The isolation invariant has its first published positive instance.** It is now known to be
   satisfiable — a fact neither C010 nor any prior C011 chapter could assert in either direction.
2. **The enumerated-access-path-set obligation is discharged for one category and demonstrated as a
   method.** The closure argument — one import site, no raw SQL, no transactional composer, one
   test-only reference — is reusable, and any later category's enumeration can be judged against it.
3. **`CAP-S5-1` remains open, with a landing condition it did not previously have.** Its owner
   `NEU-986` receives a stated four-part condition against target state (a) rather than an open-ended
   precondition.
4. **`F-S5-4` of C010 is unchanged.** No category `holds` on the deployment; success under OUT-8 is
   movement against that census, not its replacement.
5. **SUB-13 (OUT-19) inherits a re-verification obligation** — its DDL is checked against this
   derivation, and a divergence routes a finding back here rather than a change made there.
6. **The closure argument is cutoff-bound.** It is a statement about the code at `cc38cc9`; a new
   import of the `notes` table object would break it. Re-verification at the landing cutoff is clause
   4 of the lifting condition, not an optional check.

## Evidence

| Claim | Source |
| --- | --- |
| `holds` requires an enumerated access-path set and may not be reached by absence of a counter-example | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:237`–`:240` |
| Nobody owed the enumeration, and that is a reason `CAP-S5-1` stands | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:242`–`:246` |
| A composed target state must enumerate its assumptions or the evaluation is void | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:156`–`:158` |
| The five checks and the first-failure-names-the-verdict rule | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:170`–`:174`, `:207` |
| `question — open` is in domain; only an explicit `no` exempts | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:176`–`:177` |
| `SC-S3-12`'s row: `durable`, `question — open`, store `public.notes` | `../../C010-system-and-repository-architecture/04_state-category-inventory.md:89` |
| `SC-S3-12` is `fails-confinement` under Census B | `../../C010-system-and-repository-architecture/10_republished-authority-matrix.md:744` |
| Census B returns `holds: 0` | `../../C010-system-and-repository-architecture/09_authority-matrix-validation.md:398` |
| `CAP-S5-1`'s cap, three preconditions, owner and lifting condition | `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:185`, `:186`, `:188`, `:189` |
| `NEU-850`'s `OUT-2`, converged but unimplemented | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`, `:65`–`:66` |
| The narrower `OUT-2` scoping used by **C1** | `../../C010-system-and-repository-architecture/09_authority-matrix-validation.md:127` |
| The four SQL statements reaching `public.notes` | `src/adapters/drizzle/notes-repository.ts:15`–`:25`, `:38`–`:40`, `:54`–`:56`, `:61` |
| The `notes` table object is imported in exactly one file | `src/adapters/drizzle/notes-repository.ts:4` |
| `UnitOfWorkPort` composes only chunks, topics and sessions | `src/adapters/drizzle/unit-of-work-adapter.ts:17`–`:21` |
| The only other reference is a test-only truncate | `src/infrastructure/db/client.ts:78`, guarded at `:16`–`:32` |
| `notes.author` is a role enum, not an identity | `src/infrastructure/db/schema.ts:296`, `:308` |
| The STDIO gate and its refusal-when-unconfigured rule | `DR-C11-S4-1_the-stdio-identity-gate.md:11`–`:13` |
| The learner key is `sub` verbatim; `azp` never a learner key | `../02_identity-the-learner-key-and-principal-kind.md:107`, `:111` |
| The `sub || azp` merge that **C4** removes | `src/transport/jwt-middleware.ts:127` |
| `R-S4-3` is not an `I4` failure | `../92_risk-register.md:287` |

## Revision trigger

- **SUB-13 (NEU-1006) publishes its DDL** and its consistency check finds the ownership key it writes
  is not the key this derivation assumes — the divergence routes back here as a finding.
- **A new import of the `notes` table object, or any raw SQL naming it, lands in `src/`** — the
  closure argument in clause 3 fails and the `I3` answer must be re-derived.
- **`SC-S3-12`'s `Learner-scoped` cell changes from `question — open` to an explicit `no`** in
  `../../C010-system-and-repository-architecture/04_state-category-inventory.md`, which would take
  the category out of domain and make `I1` return `not-applicable`.
- **Any of the four composed changes lands**, which moves the derivation one step toward target state
  (a) and requires the verdict to be restated against the new baseline.
- **`CAP-S5-1` is lifted by an observed `holds` against target state (a)** — this record's landing
  condition is met and the record becomes historical.
- **A later sub-task carries `SC-S3-5` to `holds`** once the partial unique index exists, superseding
  this record as the strongest instance while leaving it as the first.
