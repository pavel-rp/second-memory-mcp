# `95` — Stand-in assumption register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Nothing in this register is confirmed. That is what makes it this register.**

## What this register records

| # | Literal label | What it records |
| --- | --- | --- |
| 1 | `**Status:**` | Always `[unconfirmed]`. |
| 2 | `**Stands in for:**` | The observation that would have settled it, cited by id. |
| 3 | `**Assumption:**` | The claim itself, as the charter states it. |
| 4 | `**Owner:**` | The named party accountable for the assumption. |
| 5 | `**Tolerance envelope:**` | The range of outcomes the design tolerates without being invalidated. |
| 6 | `**Invalidating outcome:**` | The specific, named outcome that breaks the decisions resting on this entry. |
| 7 | `**Re-validation trigger:**` | The **observable event** that fires the re-check — never a date, never a party's satisfaction. |

**A note on the `Owner` field.** C010's equivalent register carries no owner column. C011's charter
requires one — a stand-in with no named owner is an assumption nobody is accountable for — so the
field is added here at position 1 rather than left for SUB-14 to fill. This is the only deliberate
divergence from C010's entry shape, and it is an addition, not a removal.

## Id convention

`A-<n>` continues **this charter's own assumption numbering**: `A-33` is the stand-in for charter
assumption 33. It does not restart at 1. C010's `A-25` … `A-29` are C010's and keep their source —
in particular **`A-28` is C010's stand-in for NEU-893, this very charter**, and it is never
renumbered or restated here. See `README.md` § "What this package hands on".

---

### SUB-1

## `A-33` — Backups exist for the production database

**Status:** `[unconfirmed]`
**Stands in for:** `OI-S1-8` in `93_open-items-and-provisional-register.md` — the single register
record of the backups fact — and `SPK-S1-8` in `96_spike-register.md`, the spike designed to close it
and not executed.

**Assumption:** *"Backups exist for the production database. Nothing in the repository establishes
this, and the adopted issue requires erasure to propagate into backups. Treated as unverified until
closed by production read-only evidence (OUT-18) or recorded as an owned open item."* (Charter
assumption 33, verbatim. Source: inferred; repository sweep 2026-08-24 found no arrangement.
Independently re-swept at cutoff `546ee90`, 2026-08-25, with the same negative result.)

**Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only
party who can state whether a backup arrangement exists, since none is discoverable in the
repository.

**Tolerance envelope:** The design tolerates backups that are full or incremental; held on the same
host or off it; rotated daily, weekly or on any stated period; and restored by any documented
procedure. It tolerates backups that have never been restore-tested, provided the absence of a test
is stated. It tolerates there being **no backups at all**, provided that is recorded as a decision
with its consequence rather than discovered later — in which case SUB-15's RPO/RTO objective becomes
"unbounded data loss on host failure" and SUB-7's rollback actions may not assume a restore.

**Invalidating outcome:** A finding that backups exist **and contain learner-derived data that the
erasure design cannot reach** — because that makes the GDPR-shaped erasure duty undischargeable by
the mechanism OUT-12 designs, and turns a retention exception into an unbounded one. The four-part
retention-exception rule (justification, bound, owner, stated basis) could then not be satisfied for
the backup copy.

**Re-validation trigger:** **`OI-S1-8` closes** — the operator states whether backups exist and, if
so, their contents, location, rotation and restore behaviour, and that statement is appended to
`96_spike-register.md`. On that event, SUB-15's RPO/RTO objective, SUB-7's rollback actions and
SUB-9's backups column are each re-checked against what was actually stated.

---

## `A-34` — Production hosting, TLS, monitoring and log-shipping arrangements are not discoverable in the repository

**Status:** `[unconfirmed]`
**Stands in for:** `OI-S1-9` in `93_open-items-and-provisional-register.md` and `SPK-S1-9` in
`96_spike-register.md`, the spike designed to close it and not executed.

**Assumption:** *"Production hosting region, provider, TLS termination, monitoring and log-shipping
arrangements are not discoverable in the repository. The only signals are a `deploy` VPS user, an
`.ee` domain on the Rauthy AS, and the compose stack path. Anything the package needs from these is
closed by spike or marked `[unconfirmed]` with an owner."* (Charter assumption 34, verbatim. Source:
repository sweep 2026-08-24: no IaC, no reverse-proxy config, no monitoring config. Independently
re-swept at cutoff `546ee90`, 2026-08-25, with the same negative result, and corroborated by C010's
`CAP-S10-1` / `OI-S1-3`.)

**Owner:** The creator, as sole maintainer and sole operator of the production deployment.

**Tolerance envelope:** The design tolerates any single-host or managed hosting arrangement in any
region; TLS terminated at a reverse proxy, at the container, or at a provider edge; monitoring that
is external, self-hosted, or absent; and logs that are shipped anywhere or nowhere beyond the two
Postgres tables. It tolerates all five facts remaining unknown, provided every objective that
depends on one is stated as conditional on it rather than asserted.

**Invalidating outcome:** A finding that the deployment spans **more than one host or more than one
region**, or that **logs are shipped to a third party outside the EU**. The first breaks the
single-writer premise that C010's `M-A` all-MCP ownership rests on and changes what isolation must
be enforced across; the second creates a cross-border transfer of learner-derived log content, which
is a lawful-basis question the package would then have to answer rather than note.

**Re-validation trigger:** **`OI-S1-9` closes** — the operator states provider, region,
TLS-termination point, monitoring/alerting arrangement and log-shipping destination, each as a named
value or an explicit "none", and that statement is appended to `96_spike-register.md`. On that
event, SUB-15's numeric objectives and SUB-16's detection design are re-checked against the platform
that actually exists.

---

**SUB-1 register totals at revision 1:** two stand-in entries, `A-33` and `A-34`. Both carry a named
owner and an observable re-validation trigger. **Neither carries a blank owner or a blank trigger
for SUB-14 to fill.**

SUB-1 authors **only** these two. The residual human-`sub` shape is **SUB-2's** entry to write, and
`OI-S5-1`'s reading is **SUB-3's**; neither is SUB-1's to author, and their absence here is correct
rather than a gap.

---

### SUB-3

## `A-S3-1` — The two raw-SQL log tables are in scope for `NEU-850`'s "every core table"

**Status:** `[unconfirmed]`
**Stands in for:** **`OI-S5-1`**, owned by **`NEU-850`** and recorded in C010 — the question of
whether `NEU-850`'s *"every core table"* ranges over the two port-less log tables. C011 raises **no
open item of its own** for this question: it is another party's record, consumed by citation, and
this entry is the assumption the design provisionally rests on while it is open.

**Why this entry is `A-S3-1` and not a charter-continued `A-<n>`.** The id is **sub-task-scoped**,
matching the scheme SUB-15 adopted and recorded in
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`. The charter-continued scheme —
where `A-<n>` names the charter assumption the stand-in stands in for — **is not safe under
concurrency**: several sub-tasks run at once, each would compute "the next charter assumption
number" independently, and because register conflicts resolve by keeping **both** sides, two
sub-tasks picking the same number would land two rows sharing one id. A sub-task-scoped id cannot
collide, because `S3` is this sub-task's alone.

**What this entry stands in for is unchanged and is stated rather than encoded in the number:** it is
the stand-in for **charter assumption 36**, whose subject is `OI-S5-1`'s reading. Recording that in
prose rather than in the id is the whole point of the change — the number no longer has to carry it.

`A-33` and `A-34` keep the charter-continued form SUB-1 gave them; **reconciling the two schemes is
SUB-14's** assembly job at position 15, and this sub-task renumbers nothing of anyone else's.

**Assumption:** *"The two raw-SQL log tables are in scope for `NEU-850`'s 'every core table'.
Unverified: C010 routed exactly this question to `NEU-850` as `OI-S5-1` and it is not this package's
to decide, but OUT-12's propagation matrix needs the answer. Consumed as a dependency with its owner
named."* (Charter assumption 36, verbatim. Source: C010 `06_…md` §5.4; `OI-S5-1`.)

**The reading this package adopted, stated plainly:** the two tables **are** in scope — they are
treated as core tables for the purposes of this inventory, which is why `LD-S3-16` and `LD-S3-17` are
full first-class entries carrying every classification field rather than being noted as
out-of-frame. The adopted reading is the **more inclusive** of the two available, chosen deliberately:
if it is wrong, the cost is two entries in an inventory that did not need them, whereas the opposite
error omits the two categories holding the most exposed learner free text in the system.

**Owner:** **`NEU-850`** — the party C010 routed the question to, and the only one that can settle
what its own *"every core table"* ranges over. Not this package, and not SUB-14, which aggregates
this entry without authoring it.

**Tolerance envelope:** The design tolerates `NEU-850` reading *"every core table"* as including both
log tables, as including neither, or as including one and not the other. It tolerates the answer
arriving at any time before the propagation matrix is implemented. It tolerates `NEU-850` declining
to range over them **explicitly**, provided the exclusion is stated — because a stated exclusion
still resolves the two entries' conditional classification, just in the other direction. What the
inventory itself does not change under any of these outcomes is the six classification fields:
`LD-S3-16` and `LD-S3-17` hold what they hold regardless of which obligation reaches them.

**Invalidating outcome:** A finding that `NEU-850`'s *"every core table"* **excludes** the two log
tables **and** that no other obligation reaches them — because that leaves the two categories holding
unredacted learner free text with **no** ownership column obligated from any direction, and
`LD-S3-16`/`LD-S3-17`'s attributed reading becomes unreachable rather than merely undetermined. SUB-9's
propagation matrix would then have two cells it cannot resolve to an action with a deadline and an
owner, which OUT-12 forbids outright, and the *"no unowned copy"* claim would fail against precisely
the copy `F-S3-1` identifies as the worst-positioned in the inventory.

**Re-validation trigger:** **`OI-S5-1` closes** — `NEU-850` states whether *"every core table"* ranges
over `infrastructure.mcp_request_log` and `infrastructure.operation_event_log`, as a named inclusion
or a named exclusion for each. On that event, `LD-S3-16` and `LD-S3-17`'s conditional classification
in `03_learner-data-inventory-and-classification.md` §5 is re-read, SUB-9's propagation matrix cells
for both tables are re-checked, and SUB-16's attribution determination is checked against whichever
reading landed.

---

**SUB-3 register totals at revision 1:** one stand-in entry, `A-S3-1`, carrying a named owner
(`NEU-850`), a tolerance envelope, an invalidating outcome and an observable re-validation trigger.
**No field is left blank for SUB-14 to fill.**

SUB-3 authors **only** this one. The residual human-`sub` shape (charter assumption 35) is **SUB-2's**
entry to author under its own sub-task-scoped id, and its absence here is correct rather than a gap.
### SUB-15

**Id shape in this section, and what SUB-15 does not renumber.** The two entries below are stand-ins
for assumptions that are **not** charter assumptions, so the register's `A-<n>` mapping — *"`A-33` is
the stand-in for charter assumption 33"* — yields no number for them. They take the sub-task-scoped
form **`A-S15-<k>`**, matching the convention five of the package's eight registers already use and
collision-free by construction against the sub-tasks authoring concurrently; the decision, its
rejected alternatives and **SUB-14 (NEU-1007) as its adjudicator** are recorded in
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`.

SUB-15's platform assumptions that **are** charter assumptions already have entries here and are
**cited, never restated or renumbered**: charter assumption 33 (backups) is **`A-33`** and charter
assumption 34 (hosting, TLS, monitoring, log shipping) is **`A-34`**, both SUB-1's. Charter
assumptions 21 and 22 are recorded `confirmed` in the charter and are consumed by SUB-15 as
repository-verified facts in `15_operational-objectives-for-the-real-platform.md` §1, not as
stand-ins — a confirmed assumption does not belong in a register whose every `Status` is
`[unconfirmed]`.

## `A-S15-1` — The deployment is sized for a learner population small enough that a single instance is the right shape

**Status:** `[unconfirmed]`
**Stands in for:** `OI-S15-2` in `93_open-items-and-provisional-register.md` — the unstated target
concurrent-learner population — and `SPK-S15-2` in `96_spike-register.md`, the spike designed to
close it and not executed.

**Assumption:** That the concurrent-learner population this deployment must serve sits inside the
capacity the single instance provides, so that the objectives in
`15_operational-objectives-for-the-real-platform.md` §4 are ceilings the product will not routinely
press against. Nothing states this. It is the assumption implicit in every decision to set objectives
against a single VPS rather than to design past it, and it is recorded here rather than left as the
silent premise of the whole chapter.

**Owner:** The creator, as sole maintainer and sole operator of the production deployment, for the
population figure; **`NEU-896`** at convergence for the adequacy judgement, which no party inside
this package can make.

**Tolerance envelope:** The design tolerates any target population **at or below the lower bound of
the published capacity band — 2 concurrently active learners at the worst-case service time** —
without any change of shape, since that is the point the model can defend without further evidence.
It tolerates a target anywhere inside the band (2–200) provided `OI-S15-3` closes first and confirms
the service time that puts the target below the ceiling. It tolerates the target being **stated as
`n = 1`**, the position all product-foundation evidence actually supports, in which case every
objective in §4 has very large headroom and the first-break analysis is precautionary rather than
operative.

**Invalidating outcome:** A stated target **above the upper bound of the band — more than 200
concurrently active learners** — or any target that requires more than one instance. Either breaks
the single-instance premise that charter assumption 22 rests on and that the entire objective set is
set against: the rate limiter's per-instance state would multiply by the replica count (the effect
`.env.example:79`–`:81` names explicitly), the transport and subject-binding maps would no longer be
authoritative for a session, and the objectives in §4 would have to be re-derived against a shape
this package never analysed. It would also reopen C010's `M-A` all-MCP single-writer premise.

**Re-validation trigger:** **`OI-S15-2` closes** — a target concurrent-learner population is stated
for the deployment and appended to `96_spike-register.md`, or `NEU-896` records that no target is
being set. On that event the objective set in §4, the first-break band in §3 and SUB-7's rollout
staging are each re-checked against the population that was actually stated.

---

## `A-S15-2` — Release cadence continues at or above its measured rate, and keeps containing the session-map leak

**Status:** `[unconfirmed]`
**Stands in for:** the absent measurement in `OI-S15-4` in
`93_open-items-and-provisional-register.md` — the per-entry session footprint — and `SPK-S15-4` in
`96_spike-register.md`, the spike designed to close it and not executed. The exposure it stands over
is `F-S15-3`; the risk it feeds is `R-S15-2`.

**Assumption:** That deploys continue to fire at or above the measured rate — **≥1.36 per day over
the last 90 days, ≥3.29 per day over the last 7** — and therefore keep restarting the process often
enough that the unevicted entries in the `transports` / `sessionIdentity` maps never accumulate to a
harmful level. This is an assumption the current operational position rests on **by accident rather
than by design**: nothing guarantees the cadence, and nothing in the code bounds the maps.

**Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only
party who controls the release cadence and the only one who can observe process memory on the host.

**Tolerance envelope:** The design tolerates any cadence **at or above roughly one restart per day**,
the 90-day measured floor, since that is the rate under which the maps have demonstrably not caused a
known incident. It tolerates the cadence varying widely week to week — the 7-day rate is already 2.4×
the 90-day rate — and it tolerates deliberate quiet periods of a few days. It tolerates the leak
existing at all, provided that is recorded as a dependency rather than reported as a bound, which is
what `F-S15-3` and `R-S15-2` do.

**Invalidating outcome:** A **sustained period of more than roughly a week without a deploy** — a
feature freeze, a stabilisation period, a holiday, or a CI outage that blocks the pipeline — during
which the containment simply stops and nothing replaces it. Equally invalidating: a **measured
per-entry footprint large enough that even the current cadence is insufficient**, which `OI-S15-4`
would reveal. Either outcome converts `R-S15-2` from a named dependency into a live exposure with no
mitigation, on a platform where no monitoring is established that would show it happening
(`OBJ-9`, citing `OI-S1-9`).

**Re-validation trigger:** **`OI-S15-4` closes** — a heap sample is taken against a known live-session
count and the per-entry footprint appended to `96_spike-register.md` — **or** the deploy cadence
measured over any trailing 30-day window falls below one per day, which is observable from
`git rev-list --count origin/develop` and needs no production access at all. On either event
`F-S15-3`, `R-S15-2` and the first-break ranking in §3.2 are re-checked.

---

**SUB-15 register totals at revision 1:** two stand-in entries, `A-S15-1` and `A-S15-2`. Both carry a
named owner, a tolerance envelope, an invalidating outcome and an observable re-validation trigger.
**Neither carries a blank owner or a blank trigger for SUB-14 to fill**, and **neither restates
`A-33` or `A-34`**, which are SUB-1's and are cited where SUB-15 depends on them.

---

### SUB-2

**Id family — sub-task-scoped, diverging from the charter-continued convention above.** The
convention this register opens with (`A-<n>` continues the charter's assumption numbering, so a
stand-in for charter assumption 33 is `A-33`) is **not collision-free under parallel authoring**:
two sub-tasks standing in for two different charter assumptions at the same time cannot both compute
"the next number" without seeing each other's work, and because a merge conflict in this file
resolves by **keeping both sides**, a collision would land two rows sharing one id rather than
failing loudly. SUB-2 therefore files **`A-S2-<k>`**, scoped to the authoring sub-task exactly as
`F-S<n>-<k>`, `OI-S<n>-<k>`, `CAP-S<n>-<k>` and `SPK-S<n>-<k>` already are. The entry still records
**which charter assumption it stands in for**, in its `Assumption:` field, so nothing is lost —
`A-S2-1` stands in for charter assumption 35.

**SUB-1's `A-33` and `A-34` are not renumbered**, and neither is the convention text above:
reconciling the two schemes across the package is **SUB-14's** (NEU-1007), not SUB-2's. Recorded in
`decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`.

## `A-S2-1` — The production learner flow yields a human `sub`

**Status:** `[unconfirmed]`
**Stands in for:** **C010's `OI-S1-2`**
(`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:74`–`:83`),
whose evidence half this package could not close; and, in this package,
`93_open-items-and-provisional-register.md` § `OI-S1-1`, § `OI-S1-2`, § `OI-S1-3` and § `OI-S2-2`,
with `96_spike-register.md` § `SPK-S1-1`, § `SPK-S1-2`, § `SPK-S1-3` and § `SPK-S2-2` — the spikes
designed to close them, **none executed**.

**Assumption:** *"The production learner flow yields a human `sub`. Unverified: the middleware
resolves `payload.sub || azp`, and the only production authentication visible in the repository is a
client_credentials grant where Rauthy sets `sub = null`. This is `H5` / `OI-S1-2`, and OUT-5 exists
to close it on observed evidence rather than carry it forward again."* (Charter assumption 35,
verbatim.)

> **One clause of the charter's own text is superseded by evidence, and is recorded rather than
> silently corrected.** The assumption says *"the only production authentication visible in the
> repository is a client_credentials grant"*. That is no longer accurate: ADR-0001's NEU-909
> amendment (`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`) makes a
> **second** production authentication visible in the repository — the manually provisioned static
> client `claude-web`, which is the claude.ai connector's path and therefore the actual learner
> path. Registered as `F-S2-1` in `91_findings-register.md`. The assumption's *substance* is
> unchanged and still unverified; what changed is that the repository now names the shape on which
> it would be verified, which is why the re-validation trigger below is `OI-S2-2` rather than a
> generic "any token".

**Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the
only party holding a credential for any principal shape and the only party with an authenticated
claude.ai connector session. No party inside this package can close it; SUB-1 established that
directly by probing for every credential and finding none (`91_findings-register.md` § `F-S1-2`).

**Tolerance envelope:** The design tolerates **every possible answer**, and this is a deliberate
property rather than good luck. Because principal kind is determined by the *presence* of `sub`
rather than by the audience shape (`decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md`),
the identity rule is total: it tolerates a human `sub` on all three shapes, on some, or on none; it
tolerates the answer differing per shape; and it tolerates the answer changing after a Rauthy
upgrade, at the cost of re-running the re-check below. It tolerates the question remaining open
indefinitely **provided every design resting on it states its conclusion as conditional** — which
`02_identity-the-learner-key-and-principal-kind.md` §3 and §10 do, per shape.

What the envelope does **not** tolerate is the population remaining unknown **at the moment SUB-6
executes a backfill**: choosing a target subject for existing production rows requires knowing which
value the operator actually authenticates as, and OUT-2 already requires that target to be
*"explicitly verified against a real token before it is written"*.

**Invalidating outcome:** Either of two findings breaks the decisions resting on this entry.

1. **No principal shape yields a human `sub`.** Then no production principal is ever kind `user`, no
   learner key is ever issued, per-principal confinement is definitively not per-learner
   confinement, and OUT-2's backfill has no target to verify. The ownership design would need a
   learner identity sourced from somewhere other than the token, which is outside `A-28`'s envelope
   and routes a recorded amendment to `NEU-895` rather than proceeding.
2. **The same human presents different `sub` values on different shapes** — for example arriving
   once through `claude-web` and once through a DCR client, with distinct subjects. Then one person
   holds two learner keys, the key is not per-learner, and `DR-C11-S2-1`'s choice fails on its own
   terms. This is the sharper of the two, because it is invisible at `n = 1` and would surface only
   after a second access path is used.

**Re-validation trigger:** **`OI-S2-2` closes** — a decoded, redacted claim set is captured from a
real authenticated `claude-web` connector session and appended to `96_spike-register.md`, with `sub`
recorded as present-and-human-identifying, present-and-opaque, or absent, and the grant type stated.
`OI-S1-1` or `OI-S1-3` closing fires a partial re-check for its own shape. On any of these events,
re-check: this entry's status; `02_identity-the-learner-key-and-principal-kind.md` §3's second table
and §10's per-shape answer; OUT-5's outcome-register row, whose measured result is currently
**not met**; C010's `OI-S1-2`, which may then close; and `R-S2-2`, whose severity depends on what the
`client_credentials` grant actually returns.

---

**SUB-2 register totals at revision 1:** one stand-in entry, `A-S2-1`. It carries a named owner and
an observable re-validation trigger, and **neither is left blank for SUB-14 to fill**.

**The residual is not confined to one shape, and is not narrowed to look tidier.** The charter
anticipated a stand-in *"confined to the shape that could not be obtained"*. **Zero** of the three
shapes were obtained, so this entry spans all three. Narrowing it to fewer than the evidence supports
would be a fabrication in the opposite direction from the one the discipline usually guards against,
and it is declined for the same reason.

---

### SUB-4

## `A-S4-1` — The live `context_tokens` population at cutover is non-empty and is entirely unbound

**Status:** `[unconfirmed]`
**Stands in for:** The production population of `context_tokens` at the moment the enforcement stage
lands — the set that cutover rejection class **C1** ranges over
(`04_the-stdio-identity-gate-and-the-bound-context-token.md` §8).

**Assumption:** That some rows exist, and that **every one of them is unbound**. The second half is
close to derivable rather than assumed: the table declares no column that could carry a binding
(`src/infrastructure/db/schema.ts:312`–`:321`; `drizzle/0014_create_context_tokens.sql`), so an
already-bound pre-existing row is not a state the declared schema admits. What is genuinely assumed
is only that the deployed schema **matches** the declared one — which is `OI-S1-4` / `SPK-S1-4`,
still open — and that the population is not empty.

**Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only
party who can query the table.

**Tolerance envelope:** **The cutover procedure is correct for any population, including zero.**
Every row is rejected on presentation and the residue is purged in one shot, and neither step's
correctness depends on the count. What the count changes is operational visibility — how many
learners notice a single failed in-flight call — and the cost of the first post-cutover sweep, which
`DR-C11-S4-3` clause 5 removes from the mint path by putting the one-shot purge in the migration.
**No claim anywhere in this sub-task's output states, estimates or bounds the number**, and
`observed-in-production` is used **zero** times.

**Invalidating outcome:** A finding that some pre-existing row **already carries a principal
binding** — which would mean the deployed schema has drifted from the declared one, and would make
the reject-everything rule over-broad by rejecting a row that did not need rejecting. Not possible
on the declared schema; observable only through `OI-S1-4`.

**Re-validation trigger:** **`OI-S1-7` closes** — the production `context_tokens` population and its
age distribution are recorded in `96_spike-register.md` under `SPK-S1-7`. `OI-S1-4` closing fires a
partial re-check of the second limb alone. On either event, re-check: this entry's status;
`04_the-stdio-identity-gate-and-the-bound-context-token.md` §8's class C1; `DR-C11-S4-3` clause 5's
placement of the one-shot purge; and OUT-13's measured result, whose clause (3) currently reports
met **with zero quantities stated**.

## `A-S4-2` — The STDIO edge is reachable in the production deployment

**Status:** `[unconfirmed]`
**Stands in for:** C010's own deployment-shape question, which C010 deliberately declines to answer
and routes to `SUB-10 of C010 (NEU-984)`
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485`).

**Assumption:** That a STDIO client can reach the production deployment. This is the **conservative**
answer and it is recorded as the one this sub-task planned against, per the charter's requirement
that the sub-task state which answer it planned against.

**Owner:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`** — the deployment-shape owner. Not
the creator directly, because the record C010 opened names that sub-task.

**Tolerance envelope:** **The decision is unchanged under either answer, and C010 says so in the same
passage:** *"a transport that produces no principal fails I4 whether or not anyone can currently
reach it."* What varies is only the **urgency of the staging** that SUB-7 reads off it, and the size
of the broken compatibility class in `04_the-stdio-identity-gate-and-the-bound-context-token.md` §9 row 4 — which is already the largest class under
either answer, because `TRANSPORT` defaults to `stdio`
(`src/config/resolve-transport-config.ts:35`). The envelope tolerates *reachable*, *unreachable
today*, and *unreachable and intended to stay so*.

**Invalidating outcome:** There is, strictly, **none available from the reachability answer alone**,
and saying so is more useful than inventing one. Invalidating this entry would require both that
STDIO is unreachable **and** that the invariant's verdict is thereby conditional on reachability —
and C010 contradicts the second conjunct directly. The entry is therefore a **planning** assumption
whose falsification changes scheduling, not a load-bearing one whose falsification changes the
decision. It is registered anyway, because a planning assumption left unregistered is how a
scheduling choice gets read as a finding.

**Re-validation trigger:** **The deployment-shape answer lands** — `SUB-10 of C010 (NEU-984)` or the
operator states whether the production deployment exposes a STDIO edge, or `SPK-S4-1` is executed
and its result appended to `96_spike-register.md`. On that event, re-check: this entry's status;
`04_the-stdio-identity-gate-and-the-bound-context-token.md` §12; and SUB-7's staging urgency. **Do not re-check the decision itself** — that is the
point of the envelope.

---

**SUB-4 register totals at revision 1:** two stand-in entries, `A-S4-1` and `A-S4-2`. Each carries a
named owner and an observable re-validation trigger, and **neither is left blank for SUB-14 to
fill**.

**One entry records that it has no available invalidating outcome, rather than manufacturing one.**
`A-S4-2`'s falsification would change scheduling and not the decision, because C010 has already
ruled the verdict unconditional on it. Writing a plausible-sounding invalidating outcome there would
have made the register look uniform and would have misreported a planning assumption as a
load-bearing one.

---

### SUB-16

**Why this entry carries an `A-S16-<k>` id and not an `A-<n>` one.** `A-<n>` continues the charter's
own assumption numbering and is reserved for a stand-in that stands in for a **numbered charter
assumption** — `A-33` for assumption 33, `A-34` for assumption 34. The entry below stands in for no
charter assumption. It is an assumption this sub-task's own detection design had to make in order to
state an alert route at all, so it takes the sub-task-scoped form on the rule
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` fixed for exactly this case.

## `A-S16-1` — The operator's own direct inspection is the only observation channel a detection signal can reach

**Status:** `[unconfirmed]`
**Stands in for:** No charter assumption. It stands in for the unanswered half of `OI-S1-9` in
`93_open-items-and-provisional-register.md` — the single register record of hosting, monitoring and
log-shipping arrangements, owned by the creator as sole operator and cited here rather than
re-raised.

**Assumption.** Every alert route in `16_attribution-and-detection.md` §3 is written `[unconfirmed]`,
but a matrix cannot state a route of *nothing* and remain readable. The reading the chapter proceeds
on, stated once here rather than four times there, is: **the only channel a signal can currently
reach is the operator inspecting the deployment directly** — a query run by hand against the audit
database, or the container's `stderr`. No push channel, no paging, no aggregation, no retention of
the signal itself. **Detection under this reading is therefore pull-only and unbounded in latency:**
a signal is "delivered" whenever the operator next happens to look.

**Owner.** **The creator, as sole maintainer and sole operator of the production deployment** — the
only party who knows what channels exist and the only party who is currently the channel.

**Tolerance envelope.** The design tolerates any channel that is **at least as capable** as direct
inspection: any arrangement that surfaces a fired signal to a human, at any latency, with or without
aggregation. Every signal in §3 is specified as a *query over persisted state* rather than as an
event stream precisely so that it survives this envelope — a query can be run by hand, by a cron, or
by a monitoring agent without changing its definition. The envelope holds while `n = 1`, where the
sole learner and the sole operator are the same person and a pull-only channel has an unbounded but
*self-interested* latency.

**Invalidating outcome.** **A second learner exists.** At `n > 1` the operator is no longer the
affected party, and a pull-only channel with unbounded latency cannot satisfy any of the four
signals: `SIG-S16-1` exists to catch a cross-learner leak *before a learner notices it*, which is
the actor this sub-task is written for, and a channel whose latency is "whenever someone looks"
inverts that ordering by construction. The stand-in also breaks if a signal is ever specified as an
event stream rather than as a query, since a stream cannot be pulled.

**Re-validation trigger.** **`OI-S1-9` closes** — the operator states the monitoring and alerting
arrangement as a named value or an explicit "none". On that event every route in
`16_attribution-and-detection.md` §3 is re-read against the answer, and `92_risk-register.md` §
`R-S16-2` is re-assessed. **Additionally: a second authenticated learner is observed on the
deployment**, which fires the invalidating outcome directly rather than merely the re-check.

---

**SUB-16 register totals at revision 1:** one stand-in, `A-S16-1`, carrying a named owner, a stated
tolerance envelope, a named invalidating outcome and an observable re-validation trigger. **Zero
charter-continued `A-<n>` ids**, correctly: this sub-task stands in for no numbered charter
assumption. **Zero second records** — `OI-S1-9` is the single register record of the underlying fact
and is cited, not restated.

---

### SUB-5

*`NEU-997`, covering `OUT-8`. One entry, taking the sub-task-scoped form `DR-C11-S15-3` fixes: it is
not a stand-in for one of the charter's own numbered assumptions, so it does not continue the
`A-<n>` sequence.*

## `A-S5-1` — Every access path to a state category is reachable through the Drizzle table object or through raw SQL, so a module-boundary search enumerates them all

**Status:** `[unconfirmed]`

**Stands in for:** The completeness of the **enumerated access-path set** for `SC-S3-12`
(`05_the-enforcement-point-that-confines-every-read-and-write.md` §8.3) — the artifact check `I3`
requires before any category may return `holds`, and therefore the load-bearing assumption beneath
this package's only positive instance.

**Assumption:** That the four searches performed constitute a **complete** enumeration of the ways
application code can reach `public.notes` — that is, that every read and every write must go through
either the Drizzle table object imported from the schema module, or a raw SQL string naming the
table, and that a tx-scoped instance or a test-only path is the only other shape. The searches
returned: one import site (`src/adapters/drizzle/notes-repository.ts:4`), zero raw SQL naming the
table anywhere in `src/`, no composition by `UnitOfWorkPort`, and one test-only `TRUNCATE`
(`src/infrastructure/db/client.ts:78`). The **conclusion** that the set is closed follows from those
results only if the search space is exhaustive.

**Owner:** **SUB-13 (NEU-1006)** under OUT-19, whose consistency check re-verifies this derivation
against the DDL it writes and is the nearest scheduled re-read; co-named **the implementation
charter `NEU-896` hands the work to**, which performs the re-verification at the landing cutoff that
is clause 4 of `CAP-S5-1`'s stated lifting condition.

**Tolerance envelope:** The assumption tolerates a new **caller** of any of the four statements — the
port-level caller set is enumerated separately at §8.3 and a new caller reaches no new statement, so
`I3` is unaffected. It tolerates a change to the **body** of any of the four statements, provided the
predicate is preserved. It tolerates the table gaining columns, gaining indexes, or being renamed,
since the enumeration is over statements rather than over schema shape. It tolerates a **second
adapter class** implementing `NotesRepository`, provided that adapter imports the table object and is
therefore visible to the same search. It does **not** tolerate a reachability mechanism outside the
two searched: a dynamic table reference built at runtime, a database view or trigger reaching the
table, a stored procedure, or direct `psql` access by an operator — the last of which
`05_the-enforcement-point-that-confines-every-read-and-write.md` §7.4 already names as outside the
enforcement point entirely.

**Invalidating outcome:** **Any path to `public.notes` that reaches it without importing the Drizzle
table object and without naming the table in a SQL string.** A database view, trigger or rule over
`notes`; a dynamically constructed table identifier; an ORM escape hatch; or any second process
holding a credential to the same database. Reaching this outcome does **not** merely weaken the
`holds` verdict — it **falsifies it**, because `I3`'s answer would then rest on an enumeration that
was never complete, which is exactly the failure
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:239`
forbids. The verdict would revert to `fails-confinement` or the evaluation would stop, and
`DR-C11-S5-2` would need re-deriving rather than amending.

**Re-validation trigger:** **A new import of the `notes` table object, or any raw SQL naming the
table, lands in `src/`** — the observable event, and the one `DR-C11-S5-2`'s revision trigger names.
Additionally: **SUB-13 (NEU-1006) publishes its DDL**, at which point the consistency check re-runs
the four searches at that cutoff; and **the landing cutoff of clause 4 of `CAP-S5-1`'s lifting
condition**, where the re-verification is mandatory rather than advisory. The trigger is deliberately
an event in the repository rather than a date, because the assumption is about code and not about
time.

---

**SUB-5 register totals at revision 1:** one entry, `A-S5-1`, `[unconfirmed]`, carrying a named
owner, a tolerance envelope, an invalidating outcome and an observable re-validation trigger, with
no blank field. **Zero charter-continued `A-<n>` entries**, correctly: this stand-in is not a
stand-in for one of the charter's numbered assumptions, so it takes the sub-task-scoped form per
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`.

**One assumption is deliberately not filed here, because it is a finding instead.** That the charter's
`AppContext` count of 56 and port composition of 9 are correct was **not** assumed — both were
re-derived and both were wrong, and they are recorded as `F-S5-3` and `F-S5-1`. A stand-in records
something the design rests on pending confirmation; a figure that has been checked and refuted is a
finding, not a stand-in.

**`A-28` is not restated here.** C010's stand-in bounds this outcome's enforcement point and its
re-validation trigger fires on this package's publication; the envelope check is performed at
`05_the-enforcement-point-that-confines-every-read-and-write.md` §10 and the entry is cited from its
single owning record at `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`,
never duplicated.
