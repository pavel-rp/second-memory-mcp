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

### SUB-8

**Why this entry carries an `A-S8-<k>` id and not an `A-<n>` one.** `A-<n>` continues the charter's
own assumption numbering and is reserved for a stand-in that stands in for a **numbered charter
assumption** — `A-33` for assumption 33, `A-34` for assumption 34. The entry below stands in for no
charter assumption. It is a value this sub-task had to choose in order to discharge a term another
sub-task's contract left open, so it takes the sub-task-scoped form on the rule
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` fixed for exactly this case, and
already used by SUB-15, SUB-2, SUB-3 and SUB-16.

## `A-S8-1` — Thirty days is the completion deadline a data-subject request is answered within

**Status:** `[unconfirmed]`
**Stands in for:** No charter assumption. It stands in for the unanswered half of `OI-S3-1` in
`93_open-items-and-provisional-register.md` — the single register record of the controller/processor
role and lawful-basis selection, owned by the creator as sole operator and **cited here rather than
re-raised**. A statutory response period is a consequence of a lawful-basis and role determination,
and this package makes neither.

**Assumption.** That **30 days from an authenticated, verified request** is the right completion
deadline for both export and erasure, and that **7 days** is the right bound on purging
already-collected copies after a withdrawal, with the withdrawal's own processing switch taking
effect on the next request. The value is **derived from the one-month response norm of the
GDPR-shaped baseline the charter ratified at intake** — a product-and-engineering position, stated so
that `SIG-S16-3` has a threshold at all. **It is not observed, not calibrated, and not a legal
determination.** No request has ever been made on this deployment and no propagation has ever been
timed, so the number is a policy choice rather than the centre of any distribution
(`94_caps-and-incomplete-scope.md` § `CAP-S8-1`).

**Owner.** **The creator, as sole maintainer and sole operator of the production deployment** — the
only party who can commission the determination that would replace the position with a duty, and the
only party who would have to meet the deadline.

**Tolerance envelope.** The design tolerates **any deadline the propagation can be *proved* complete
within**. Nothing in the mechanism depends on the number's magnitude: `DR-C11-S16-3`'s contract
carries `deadline_at` **on the proof**, so a different value changes a field's contents and no
structure. Concretely the envelope holds for any value from the propagation's true duration — which
is unmeasured — up to and including 30 days, and it tolerates **different values for export and
erasure**, and a shorter one for withdrawal, which is why §9.1 already states three. It also
tolerates the deadline being *shortened by determination*, provided the shortening happens before an
emission exists to breach it.

**Invalidating outcome.** **A determination that fixes a deadline shorter than the propagation can be
proved complete within.** That is the specific outcome that breaks the design rather than merely
adjusting it: `SIG-S16-3` fires when a copy-class proof is missing at `t ≥ deadline_at`, so a
deadline below the achievable propagation time makes the signal fire on **every** request by
construction — at which point the signal is switched off in practice and the detection capability
`16_attribution-and-detection.md` §3 records is lost rather than tightened. A **longer** determined
deadline does not invalidate anything; it merely makes this position conservative. Secondarily, the
entry is invalidated if a determination establishes that no fixed deadline applies at all, since the
threshold would then have no basis to rest on.

**Re-validation trigger.** **`OI-S3-1` closes** — the owner states the controller/processor role and
the lawful basis each processing purpose rests on. On that event, re-check: this entry's status;
`08_consent-and-what-a-learner-can-export-and-erase.md` §9.1's four deadline rows; OUT-11's
outcome-register row, whose fifth measure limb is stated against this value; and
`92_risk-register.md` § `R-S8-3`, whose severity depends on how far the determined deadline sits from
the achievable propagation time. **Additionally: SUB-9 (NEU-1003) publishes its completion-proof
design with a copy-class cardinality**, which is the first point at which the achievable propagation
time becomes estimable at all and therefore the first point at which the envelope can be checked
rather than assumed.

---

**SUB-8 register totals at revision 1:** one stand-in, `A-S8-1`, carrying a named owner, a stated
tolerance envelope, a named invalidating outcome and an observable re-validation trigger — **none
left blank for SUB-14 to fill**. **Zero charter-continued `A-<n>` ids**, correctly: this sub-task
stands in for no numbered charter assumption. **Zero second records** — `OI-S3-1` is the single
register record of the underlying determination and is cited, not restated.
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

---

### SUB-6

## `A-S6-1` — The pre-cutover learning-domain population has exactly one human principal

**Status:** `[unconfirmed]`

**Stands in for:** A per-row attribution of the ten population-A tables. No such attribution exists
or can be constructed: zero ownership columns exist anywhere
(`06_the-disposition-of-every-unowned-row.md` §1.2), and no durable structure ever held a
session-to-subject binding (`16_attribution-and-detection.md:279`–`:283`).

**Assumption:** *"Every human-authored row in `learning_topics`, `learning_chunks`,
`learning_sessions`, `session_chunks`, `session_questions`, `session_question_chunks`,
`session_question_attempts`, `session_question_attempt_revisions`, `notes` and
`infrastructure.linter_validation_corpus` was written by a single human principal — the creator.
Unverified: the charter's own standing `n = 1` evidence label (`R13`) says no multi-learner evidence
exists anywhere upstream, and no query available against this schema can confirm or refute it."*

**Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the
only party who knows whether any second human ever authenticated against it. This cannot be
delegated to a later sub-task, because the knowledge is not in the database.

**Tolerance envelope:** The assumption tolerates any number of **non-human** principals having
written rows elsewhere in the database, because **no population-A table is written by the
`client_credentials` smoke principal**: that principal mints a `context_tokens` row (disposition
`purge`) and generates rows in both log tables (disposition `archive`), none of which is in
population A. It is the *population-A membership* that carries the assumption, not any claim that the
smoke principal writes to only one table — it writes to three. It tolerates the human
principal having authenticated through more than one client, more than one session or more than one
device, because the learner key is the OIDC `sub` and `azp` is never a learner key (SUB-2), so
multiple clients still resolve to one key. It tolerates rows written by the `'agent'` author value
in `notes`, because a note the agent wrote about the operator's chunk is still the operator's data.
**It does not tolerate a second human `sub`** having authored any row in any of the ten tables.

**Invalidating outcome:** **Evidence that a second human principal wrote any pre-cutover row in a
population-A table.** Reaching this outcome does not weaken the disposition — it **inverts** it.
Backfilling to a single subject would then commingle two people's data under one identity, which is
worse than the unowned status quo and is the exact opposite of what this package exists to deliver.
`DR-C11-S6-1` would need re-deriving rather than amending, and the ten tables would fall back to a
disposition in the shape of population C's, because they would have become non-attributable in the
same way.

**Re-validation trigger:** Three events, any of which fires it. **The creator states the answer** —
the direct route, and the only one that closes it affirmatively. **The target-subject verification
of `SPK-S6-1` runs** and the production IdP returns more than one distinct human `sub`, or an
audit-log inspection under OUT-18 shows more than one — the observable falsifier. And **immediately
before the backfill stage executes**, where V7 already requires re-running the verification: this
assumption is re-checked at the same moment, because a premise that was true when the chapter was
written and false when the migration runs would fail silently and irreversibly.

---

## `A-S6-2` — Stage S1 executes at or after the instant the attribution carrier lands

**Status:** `[unconfirmed]`

**Stands in for:** A sequencing decision this sub-task does not own. The stage order is SUB-7's
(NEU-1001) under OUT-3, and is not authored at position 8.

**Assumption:** *"The archive stage S1 runs at or after the moment the attribution carrier of
`DR-C11-S16-1` lands and begins being written. Unverified: the stage sequence does not exist yet."*

**Owner:** **SUB-7 (NEU-1001)**, which authors the stage sequence and is the only party that can
place S1 relative to the carrier.

**Tolerance envelope:** The assumption tolerates any gap between the two events, in either
magnitude — S1 may run in the same deploy as the carrier, or many deploys later. A later S1 simply
means the archived population is larger. It tolerates S1 being split into batches across several
boots, which `R-S6-2` requires anyway, provided the **first** batch begins no earlier than the
carrier. It tolerates the carrier landing and S1 never running at all: the population is then closed
but not relocated, which loses the archive's benefit without creating a new exposure.

**Invalidating outcome:** **S1 executes before the carrier lands.** The live log tables would then
begin re-accumulating unowned rows the moment the archive completed, so
`06_the-disposition-of-every-unowned-row.md` §4.2's claim that "nothing unowned remains in the
confined surface" would be false; `F-S6-3`'s five-week window would have no defined start; and the
archive would hold a population that is *not* the whole pre-cutover set, which is the one property
`DR-C11-S6-2` exists to deliver. The decision would need re-deriving against a two-population
archive rather than amending.

**Re-validation trigger:** **SUB-7 publishes its stage sequence.** On that event, S1's position is
read against the carrier's, and this entry either closes as confirmed or fires its invalidating
outcome. Additionally: **any change to `DR-C11-S16-1`'s carrier that alters when it begins being
written**, since the anchor is the write, not the schema change.

---

## `A-S6-3` — The dry-run generator, when built, takes exactly the five inputs enumerated at §7.1

**Status:** `[unconfirmed]`

**Stands in for:** Inspection of a generator that does not exist. The no-copied-rows audit at
`06_the-disposition-of-every-unowned-row.md` §7.2 is a closure argument over an **enumerated input
set**, and no artifact exists whose actual inputs could be inspected instead.

**Assumption:** *"A future implementer builds the dry-run generator taking only `G-IN-1` … `G-IN-5`
— schema text, per-table counts, per-pathology counts, timestamp extents, and a locally seeded PRNG
— and adds no sixth input. Unverified: the generator has not been written."*

**Owner:** **SUB-13 (NEU-1006)** under OUT-19, as the party that specifies what an implementer
executes; jointly **the implementation charter `NEU-896` hands the work to**, as the party that
actually writes it.

**Tolerance envelope:** The assumption tolerates any implementation language, any PRNG, any seed, and
any distribution shape fitted to the aggregates. It tolerates additional inputs that are **scalar or
schema-derived** — a row-count multiplier, a target dataset size, a fixed date offset — because none
of those has row type and the closure argument survives them unchanged. It tolerates the generator
never being built at all, in which case the exclusion stands unexercised rather than falsified.

**Invalidating outcome:** **Any generator input that is row-valued** — a `SELECT *`, a `LIMIT`
sample, a `DISTINCT` over a content column, or any extract of real values "for realism". The closure
argument fails at exactly that point, the derivation test admits the dataset to the sixth copy class,
and the exclusion SUB-3 recorded at position 3 is overturned by this sub-task's own evidence — which
is precisely the event
`decision-records/DR-C11-S3-3_package-own-copies-and-the-derivation-test.md:103`–`:105` names.

**Re-validation trigger:** **The generator is written**, at which point its actual input set is read
against the five and this entry closes or fires. Additionally: **SUB-13 publishes its migration
plan**, if that plan specifies the generator's inputs — the enumeration is then checkable against a
specification rather than against code.

---

**SUB-6 register totals at revision 1:** three entries, `A-S6-1`, `A-S6-2` and `A-S6-3`, all
`[unconfirmed]`, each carrying a named owner, a tolerance envelope, an invalidating outcome and at
least one observable re-validation trigger, with no blank field. **Zero charter-continued `A-<n>` entries**, correctly: this stand-in is not a
stand-in for one of the charter's numbered assumptions, so it takes the sub-task-scoped form per
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`.

**`A-S6-1` is the most load-bearing stand-in this package has filed, and it is stated as such.** Ten of
the fourteen dispositions rest on it. A reader who rejects it must reject population A's disposition
with it, and the chapter says so at §2.2 rather than leaving the dependency to be inferred. It is
filed here rather than absorbed into the chapter's prose precisely because a premise this
consequential going unlisted is the defect class that voids a chapter's central derivation.

**Its unfalsifiability is a separate record, and deliberately so.** That **no aggregate probe can
settle this assumption** — because no column distinguishes principals — is `F-S6-2`, a finding, not
part of this entry. The distinction matters: this entry records *what the design assumes*, and the
finding records *why the probe set structurally cannot reach it*. One id per fact, and these are two
facts.

**`A-28` is not restated here**, on the same rule SUB-5 applied. C010's stand-in bounds this
outcome's disposition set; the envelope check is performed at
`06_the-disposition-of-every-unowned-row.md` §12 and the entry is cited from its single owning
record at `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`,
never duplicated. One thing is noted in passing rather than filed: `A-28`'s re-validation trigger is
this package's publication, so this chapter is part of the event that fires it.

**`A-S3-1` is not restated here either.** SUB-3's stand-in for the reading of `OI-S5-1` — whether
`NEU-850`'s *"every core table"* covers the two raw-SQL log tables — is cited, not re-raised, and
this sub-task takes no reading of its own. The `archive` disposition is correct under both readings,
so nothing here rests on which one holds.

**Why three entries and not one.** The three are load-bearing in different places and fail
independently, so folding them together would hide which part of the chapter a refutation reaches.
`A-S6-1` is about the **data** and its refutation breaks ten dispositions. `A-S6-2` is about the
**sequence** and its refutation breaks one stage's benefit while leaving every disposition intact.
`A-S6-3` is about an **unbuilt artifact** and its refutation overturns a recorded exclusion in
another sub-task's inventory. A single combined entry would have one owner; these have three
different ones — the creator, SUB-7, and SUB-13 with the implementation charter.

---

### SUB-7

## `A-S7-1` — Each rollout stage costs exactly one deploy and therefore exactly one container restart

**Status:** `[unconfirmed]`

**Stands in for:** An observation of how many deploys a schema-plus-code stage actually takes on this
deployment, which would require executing one. No production credential exists (`F-S1-2`), and
`OI-S15-1` records that restart duration on a `docker compose up -d --build` with a boot-time
migration is itself unobserved.

**Assumption:** Every one of the ten stages `T0` … `T9` is delivered by a single merge to `develop`,
producing a single cd-prod run and a single container restart. The availability arithmetic at
`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §10.2 rests on this: it adds **ten**
planned restarts to `OBJ-8`'s cadence denominator and derives the tightened per-restart allowance
from that number.

**Owner:** **SUB-13 (NEU-1006)**, which writes the migrations and therefore fixes how many deploys
each stage actually takes, co-named **the creator** as the party who performs the merges.

**Tolerance envelope:** The design tolerates a stage taking **more than one** restart. Every
conclusion drawn from this assumption is directional rather than exact — the §10.2 finding is that
adding restarts *tightens* the per-restart allowance and that compressing the rollout concentrates
its cost, and both hold a fortiori if a stage takes two deploys instead of one. The envelope also
tolerates two adjacent stages being merged together, which is what `T3` and `T9` already do
internally: `T3` combines gate stage `A` with `S3`, and `T9` combines `S5`, gate stage `D` and the
carrier's own tightening, precisely to spend one restart rather than three.

**Invalidating outcome:** A stage that requires an **unbounded or indeterminate** number of restarts
— specifically, the batched stages `T2` and `T7`, whose slice count is a function of row counts that
were never taken (`OI-S6-1`). For those two the assumption is already known not to hold as a fixed
number, which is why §10.2 names them as the two stages whose duration cannot be shown to fit
`OBJ-8` and routes that conflict to `R-S6-2` rather than pricing it. If a *non-batched* stage turns
out to need an indeterminate number of restarts, the ten-restart figure and every allowance derived
from it must be re-derived.

**Re-validation trigger:** SUB-13 publishes the migration set, at which point the number of deploys
per stage becomes a property of a real artifact rather than an assumption — or `OI-S6-1` closes and
the two batched stages acquire a bounded slice count.

---

**SUB-7 register totals at revision 1:** one stand-in, `A-S7-1`, `[unconfirmed]`, carrying all seven
fields including the owner this register adds at position 1. One entry rather than several because
this sub-task's other provisional reliances are already registered by their owners and are consumed
by citation: that `S1` executes at or after the carrier lands is **`A-S6-2`** — which this sub-task
**discharges** rather than restates, by placing the carrier at `T1` and the archive at `T2`.

> **`A-S6-2`'s re-validation trigger has now fired, and the status change is routed rather than
> assumed.** Its trigger is *"SUB-7 publishes its stage sequence"*, on which the entry *"either closes
> as confirmed or fires its invalidating outcome"* (`95_stand-in-assumption-register.md:778`–`:779`).
> This chapter is that publication, and the sequence satisfies it: carrier at `T1`, `S1` at `T2`. But
> `A-S6-2`'s own `Status:` line still reads `[unconfirmed]`, and **this sub-task does not edit it** —
> no sub-task rewrites another's entry under the append-only rule. **The status change is therefore
> handed to SUB-14 (NEU-1007)** as an aggregation action, with SUB-6 (NEU-1000) as the entry's author.
> Recording the hand-off here is the difference between a trigger that fired and a trigger that fired
> and was noticed.

That the
operator's own direct inspection is the only observation channel a detection signal can reach is
**`A-S16-1`**, which is why stage `T4`'s exit condition is written as a human read; and that the
pre-cutover learning-domain population has exactly one human principal is **`A-S6-1`**, which ten of
the fourteen dispositions rest on and which this sub-task inherits unchanged when it sequences the
backfill at `T7`.

**One assumption was considered and deliberately not filed here.** That the operator merges the
stages in the published order is **not** a stand-in: nothing in the platform enforces the order
(`F-S7-5`), so it is not an assumption the architecture provisionally rests on with a tolerance
envelope — it is a residual of `R3`, recorded there with its owner, because an out-of-order merge is
an exposure rather than a premise.
### SUB-11

*`NEU-1004`, covering `OUT-16`. One entry, taking the sub-task-scoped `A-S<n>-<k>` form
`DR-C11-S15-3` fixes. **It is not charter-continued**: it stands in for no numbered charter
assumption, so the `A-<n>` form would be wrong.*

## `A-S11-1` — That the charter's § Risks table has not been reordered between SUB-3's read and this one

- **Status:** `[unconfirmed]`, and **unconfirmable from inside this package**
- **Stands in for:** A diff between two readings of the charter's § Risks table — SUB-3's, at cutoff `86fb38a`, and this sub-task's, at `35f92ba`. No such diff can be taken.
- **Assumption:** The fifteen rows of the charter's § Risks table sit in the same order now as when SUB-3 read them, so a row position computed here is the same row position SUB-3 computed against. **This is what `R11` rests on.** The rule fixed in `README.md` § Id conventions and at `92_risk-register.md:17` is that `R<n>` is the row's position in that table; this sub-task read the table at its own cutoff, found the OUT-16 row at position **11**, and authored `R11` on that basis (`11_the-client-compatibility-contract.md` §10).
- **Owner:** **SUB-14 (`NEU-1007`)** under OUT-20, which aggregates the risk register, owns the reconciliation `F-S3-3` routes to it, and is the only party that may touch another sub-task's entries. **Not this sub-task**, which states a position and its derivation and resolves nothing.
- **Tolerance envelope:** The assumption tolerates the table being **edited** — rows reworded, severities adjusted, mitigations extended — without invalidating anything, because the rule keys on position alone. It tolerates rows being **appended** after position 15. What it does **not** tolerate is a **reordering, insertion or deletion at or before position 11**, any of which would move the OUT-16 row and make `R11` name a different risk than the one authored under it.
- **Invalidating outcome:** SUB-14 establishes that the two readings differ — that is, that `F-S3-3`'s discrepancy is explained by the charter having moved rather than by the forward-allocation table at `92_risk-register.md:33`–`:35` having been written wrong. In that case `R11`'s **id** is wrong while its **content** stays correct, and the remedy is a renumber SUB-14 performs, not a rewrite this sub-task owes.
- **Re-validation trigger:** **SUB-14's aggregation pass.** It is the first moment at which one party holds every authored `R<n>` entry at once and can check the set against the charter for collisions and holes. The check is cheap and mechanical: fifteen rows, fifteen ids, no duplicates and no gaps.
- **Why it is a stand-in rather than a finding:** Because nothing has been checked and refuted. `F-S3-3` is the finding — it records that two sources disagree at rows 10–12 as read at their respective cutoffs, and it explicitly declines to assert that SUB-1 erred. This entry records the one thing the design here **rests on** and cannot verify: `_local/` is gitignored and unversioned, so the two readings genuinely cannot be diffed. **Seven independent cross-checks were run and all seven agree** — `R1`, `R8`, `R9`, `R10`, `R12`, `R13` and `R14`, each already authored, each matching charter position rather than the allocation table (`11_the-client-compatibility-contract.md` §10) — which is strong corroboration and is **not** the same as confirmation.

## `A-S11-2` — That the production `client_credentials` token carries no `sub`, so the CD smoke principal resolves to kind `client`

- **Status:** `[unconfirmed]`, and **unconfirmable from this environment**
- **Stands in for:** An observation of a real production `client_credentials` token's claim set. None exists. `SPK-S1-1` is the spike designed to take it — **not executed, confidence `none`** — and no production credential is available here (`SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*`, `VPS_*` all unset).
- **Assumption:** A `client_credentials` grant from the production Rauthy IdP yields a token with **no `sub`**. Under `DR-C11-S2-2` the principal kind then resolves to `client`, the learner key is `NULL`, and `DR-C11-S5-1` clause 3 refuses every row-owning operation for it. **This is what the whole of `11_the-client-compatibility-contract.md` §7 rests on**, and it is the belief `src/transport/jwt-middleware.ts:116` records in a code comment.
- **Owner:** **The creator, as sole maintainer and sole operator** — the only party who can mint a token against the production IdP; `OI-S1-1` is the owning open item and `SPK-S1-1` the owning spike, both **cited from their single owning records rather than re-raised here**.
- **Tolerance envelope:** The assumption tolerates anything that leaves the token `sub`-less — a Rauthy version change, a client re-provisioning, a scope change. It does **not** tolerate the token acquiring a `sub` by any route. **It is deliberately not load-bearing outside §7 and one row of §6.3:** `CH-1` … `CH-5` and `CH-7` are stated over principal *kinds* rather than over any particular principal, so they hold on both branches. Only §7's scenario walk, `CH-6`'s "which existing clients break" clause, and §6.3's row 6 depend on it.
- **Invalidating outcome:** The token carries a `sub`. Then the smoke principal is kind `user`, clause 3 does not fire, **§7's walk inverts to 8 of 8 passing**, `CH-6` breaks no existing client this package knows of, and §6.3 row 6 is wrong. The complementary hazard is already registered as SUB-2's **`R-S2-2`** — that the smoke principal silently *becomes* a learner owning production rows — so the invalidating branch is not unowned; it lands on an existing entry rather than needing a new one.
- **Re-validation trigger:** **Execution of `SPK-S1-1`**, or equivalently one run of §4.1's `P3` probe (authenticate with `client_credentials`, call a row-owning tool, observe whether the result is a refusal). Either settles it in one action. It also fires on any Rauthy upgrade or smoke-client re-provisioning, which is `R-S2-2`'s own trigger.
- **Why it is a stand-in rather than a finding:** Because nothing has been checked and refuted — the branch is chosen, not established. **SUB-4 kept both branches live** (`92_risk-register.md:279`: *"Both are live because `OI-S1-1` / `SPK-S1-1` are open and no token has been observed"*) and this sub-task narrows to one in order to state a compatibility obligation at all. Recording that narrowing as a stand-in, rather than letting §7 read as observed fact, is the whole point of the entry.

---

**SUB-11 register totals at revision 1:** two entries, `A-S11-1` and `A-S11-2`, both `[unconfirmed]`,
each with a named owner, a stated tolerance envelope, a named invalidating outcome and a
re-validation trigger that is a scheduled or single-action event rather than a hope.

**`A-S11-2` was added at revision 1 after an adversarial pass**, which found §7's premise stated as
flat fact with no evidence label while two sibling records (`R-S2-2`, `SPK-S1-1`) carry it as an
explicitly unobserved belief. The chapter now labels it at the point of use and this entry carries
it. The defect is recorded here rather than silently repaired, because *"an unlisted assumption that
voids a central derivation"* is precisely the class this register exists to catch, and a package
whose stand-in register only ever shows the assumptions its authors noticed unaided is not evidence
of much.

**Nothing else in this sub-task is registered as a stand-in, and each exclusion has a reason.** The
three surface figures were **re-derived**, not assumed, so 46 / 43 / 3 is an observation at a stated
cutoff. The unobserved client population is a **cap** (`CAP-S11-1`), because the chapter rests on no
assumption about its size — it states the size is unknown and makes no claim that needs it. The
`F-S4-4` pricing rests on a *rollout shape* (that `CH-5`–`CH-7` might ship while `CH-1` is cut),
which is named inside `F-S11-4` as the branch being priced rather than assumed away, and whose
complement needs no entry. `A-28` is not restated: it is C010's, it bounds SUB-5's enforcement point
rather than this contract, and it is cited from its single owning record where relevant.

---

### SUB-9

## `A-S9-1` — Ninety days is an acceptable bound on the archived pre-cutover population's survival, where no rollback window is set

**Status:** `[unconfirmed]`

**Stands in for:** **`OI-S9-1`** — the rollback window, owned by SUB-7 (NEU-1001) under OUT-3 /
OUT-4, which runs at position 9 and ships concurrently with this sub-task. `DR-C11-S9-1` clause 5
binds the deletion to the close of that window; this entry stands in for the window's length **only
where SUB-7 sets none**. It is not a stand-in for SUB-7's figure, and **SUB-7's in-flight output was
deliberately not read** — a bound taken from an unmerged sibling would be a number with no citable
source.

**Assumption:** That the archived pre-cutover log population may survive **no more than 90 days
after cutover** before bulk deletion, and that 90 days is long enough for any rollback that will
actually be attempted. The figure is chosen as a round bound comfortably above the one hard floor
that is derived rather than assumed — the Tier-2 blocking gate's five-week window at
`src/adapters/drizzle/tier2-blocking-stats-repository.ts:41` — and comfortably above `A-S8-1`'s
30-day request deadline, so a disposal cannot come due before a request that triggers it. **It is
not observed, not calibrated, and not a legal determination**, and it rests on no production fact:
the population's size is unknown, and no restore has ever been shown to have been exercised.

**Owner:** **SUB-7** (NEU-1001) where it publishes a rollback window, which supersedes this entry.
**The creator, as sole maintainer and sole operator**, where none is published — as the only party
who can execute the deletion and the only party who would attempt a rollback.

**Tolerance envelope:** Any bound between **five weeks and twelve months** leaves every decision in
`09_proving-a-data-right-reaches-every-copy.md` and `DR-C11-S9-1` intact. The lower end is the
Tier-2 gate's floor — below it the archive's deletion would begin interacting with a running gate
input, which §6.6 relies on it not doing. The upper end is where a "bounded disposal" stops being
distinguishable from the indefinite retention OUT-11 exists to end. The disposition itself — bulk
deletion under storage limitation — does **not** turn on the figure; only its date does.

**Invalidating outcome:** **A rollback window longer than the disposal bound.** That is the specific
outcome that breaks the design rather than merely adjusting it: it would mean the archive must
survive past the date on which it is required to be deleted, so the rollback capability and the
storage-limitation duty become directly incompatible and one of them has to give. `DR-C11-S9-1`
clause 5 subordinates the default to SUB-7's window precisely so this conflict surfaces as a
reconciliation rather than as a silently missed deletion. A **shorter** window does not invalidate
anything — it merely makes this position conservative. Separately invalidating: a lawful-basis
determination closing `OI-S3-1` that fixes a statutory disposal period **shorter than five weeks**,
which would put the required disposal below the Tier-2 gate's floor and make the two
irreconcilable without a code change.

**Re-validation trigger:** **SUB-7 (NEU-1001) publishes a rollback window** for the migration
stages — the observable event that either supersedes this entry or confirms it. **Additionally:
`OI-S3-1` closes**, fixing the lawful basis from which any statutory disposal period follows.
**Additionally: the literal at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:41`
changes**, which moves the tolerance envelope's lower bound, since that bound is read from code
rather than chosen.

## `A-S9-2` — By the time the archive is disposed of, no operational reader of the pre-cutover population remains

**Status:** `[unconfirmed]`

**Stands in for:** No charter assumption, and no observation that could have been taken here — it
stands in for the **absence of a reader census** over `infrastructure.operation_event_log` and
`infrastructure.mcp_request_log`. `09_proving-a-data-right-reaches-every-copy.md` §4.2 enumerates
every **write** path in `src/` mechanically; **no equivalent enumeration of read paths was
performed**, and this entry exists so that gap is a registered premise rather than a silent one.

**Assumption:** That at the moment the archived pre-cutover population is bulk-deleted
(`DR-C11-S9-1` clause 5), **nothing still reads it**. The one reader known to exist is the Tier-2
blocking gate, which aggregates `operation_event_log` over a rolling five-week window
(`src/adapters/drizzle/tier2-blocking-stats-repository.ts:41`) and therefore stops reading
pre-cutover rows five weeks after cutover — comfortably before the 90-day disposal bound. **The
assumption is that this reader is the only one**, which is exactly what an unperformed read-path
census cannot establish.

**Owner:** **The creator, as sole maintainer and sole operator** — the only party who can confirm
what queries the deployment actually runs, including any outside `src/` (an operator's `psql`
session, a dashboard, a scheduled report). **SUB-12** (NEU-1005) under OUT-17 inherits it as a
modelled path.

**Tolerance envelope:** The design tolerates **any reader whose horizon is shorter than the disposal
bound**, because such a reader has stopped reading before the deletion runs. It also tolerates a
reader of the **live** tables that never touches the archive, since the archive is a separate store
by `DR-C11-S6-2`'s construction. What it does not tolerate is a reader of the **archive itself**, or
a reader of the live tables with a horizon longer than the disposal bound.

**Invalidating outcome:** **A reader of the archived population with an unbounded or long horizon** —
most plausibly a compliance, forensic or billing query that reaches back further than five weeks, or
an operator process outside `src/` that the write-path enumeration could never have seen. That would
mean bulk deletion destroys data something still depends on, which converts `DR-C11-S9-1` from a
disposal into an outage. It does **not** invalidate the *duty* analysis in clause 3 — storage
limitation still has no per-learner alternative — but it reopens the choice between deletion and
`R-S6-1`'s accepted residual.

**Re-validation trigger:** **A read-path census over both log tables is performed** — the
observation this entry stands in for — or, sooner, **`SUB-12` (NEU-1005) publishes OUT-17's threat
model**, which enumerates operator and `psql` paths that `05_…md:719`–`:722` places outside every
port and which this sub-task's write-path enumeration cannot reach. Either event replaces the
assumption with a fact.

---

**SUB-9 register totals at revision 1:** **two stand-ins**, `A-S9-1` and `A-S9-2`, each with an
owner, a tolerance envelope, a named invalidating outcome and an observable re-validation trigger.

**One of the two exists because an earlier revision of this section certified that it did not.**
That revision stated that `A-S9-1` was *"the only assumption this sub-task's own decisions rest
on"* and that the disposition rested on *"no assumption at all"*, enumerating two derived premises.
**It rested on a third** — that no reader of the population remains — which `DR-C11-S9-1`'s own
revision trigger already conceded in the same commit, and which was registered nowhere. That is
precisely the *unregistered premise the argument rests on* defect class this package's reviews keep
naming, committed inside the register whose purpose is to catch it. `A-S9-2` is the correction, and
the false certification is recorded rather than deleted.

**Why one entry and not three.** The obvious candidates for two further entries are both declined,
for the reason this register draws its own admission line. That **backups exist** is charter
assumption 33 and is already carried as **`A-33`**, with the *fact* separately carried as `OI-S1-8`;
this sub-task cites both and restates neither, so the package keeps one id per fact. That
**`deadline_at` is 30 days** is **`A-S8-1`**, authored by SUB-8 at position 10 and consumed here by
citation; the matrix in `09_…md` §7 carries that value throughout and states no deadline of its own.
Re-raising either would give SUB-14's cross-register consistency check two ids for one assumption,
which is the failure the one-id-per-fact rule exists to prevent.

**The disposition rests on three premises, and the split between derived and assumed is what
matters.** Two are **derived** from merged findings: that no per-learner predicate selects a
pre-cutover row (`16_attribution-and-detection.md:279`–`:285`) and that confinement hides those rows
from every principal (`05_the-enforcement-point-that-confines-every-read-and-write.md:616`–`:641`).
The third — that nothing still reads the population when it is disposed of — is **assumed**, and is
`A-S9-2`. Only the **date** rests on `A-S9-1`.

The separation is load-bearing for a reader deciding what a refutation costs: refuting `A-S9-1`
moves a deadline and leaves the disposition standing; refuting `A-S9-2` reopens the choice between
deletion and an accepted residual; and neither touches the two derived premises, which would need a
merged finding overturned instead.

**`A-S9-1` is not charter-continued.** It stands in for no charter assumption, so it takes the
sub-task-scoped `A-S9-<k>` form rather than continuing the charter's own `A-<n>` numbering — the
same allocation SUB-8 made for `A-S8-1`, and for the same reason recorded in
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`: a bare global sequence cannot be
computed safely while sibling sub-tasks write into the same register concurrently, and two of them
are in flight against it now.

---

### SUB-12

One stand-in.

#### `A-S12-1` — That a bound on the session maps can be set without knowing the per-entry footprint

- **The assumption.** `GATE-S12-7` requires the transport and subject-binding maps to carry a TTL or a
  size bound. **This sub-task assumes such a bound can be specified and enforced as a control without
  first knowing the per-entry memory footprint or the host's RAM** — that is, that the gate is
  satisfiable by *the existence of a bound* rather than by a particular numeric ceiling.
- **Why a stand-in rather than a number.** SUB-15 established that the entry-count threshold cannot be
  stated: the per-entry footprint has never been measured (`C-25`, `OI-S15-4`) and the host's RAM is
  unknown (`C-26`, citing `OI-S1-9`). SUB-15 therefore **states no entry count**, and this sub-task
  does not invent one. `GATE-S12-7`'s threshold is consequently *"a bound exists; entry count stays
  under it"*, which is a real control with an unset constant rather than a number with no provenance.
- **Tolerance envelope.** The assumption tolerates any bound that is (a) enforced in-process, (b)
  independent of deploy cadence, and (c) observable. It does **not** tolerate the current state, where
  the only bound is the restart rate — `R-S15-2` records that as *"a dependency on an accident"*, and
  this stand-in explicitly does not adopt it as the bound.
- **Invalidating outcome.** If `OI-S15-4` closes and shows that the per-entry footprint is large
  enough that a *useful* bound would evict live sessions at realistic learner counts, then a bound is
  not a control but a denial-of-service, and `GATE-S12-7` must be re-specified rather than tuned.
- **Owner.** **The creator, as sole maintainer and sole operator**, for the host facts; **SUB-4**
  (NEU-996) for the session-lifecycle design.
- **Re-validation trigger.** `OI-S15-4` closes, or `SPK-S15-4` executes, or the deployment's release
  cadence falls materially below `C-17`'s measured floor — at which point the accidental mitigation
  that currently masks the leak stops operating and the bound's absence becomes load-bearing.
- **Status:** **carried.**

#### `A-S12-2` — That Tier-2 blocking is, or will be, enabled on the deployment

- **The assumption.** `F-S12-1` describes a channel that only exists when the Tier-2 circuit breaker
  is constructed, and it is constructed **only** when `blockingFields` is non-empty
  (`src/composition-root.ts:418`–`:421`). The shipped default is an **empty set** with `enable: false`
  (`src/domain/config/classifier-defaults.ts:31`, `:28`). **This sub-task assumes the finding is worth
  gating on anyway** — that is, that an operator has enabled Tier-2 blocking, or will.
- **Why it is carried as a stand-in rather than resolved.** Whether `CLASSIFIER_BLOCKING_FIELDS` is
  set in production is unobserved, like every other production fact in this package. The alternative
  to a stand-in was to either drop `F-S12-1` (which would discard a real defect on an unverified
  guess that the feature is off) or assert the feature is on (which would be the invention the
  charter forbids).
- **Tolerance envelope.** The finding, the gate and the amendment all hold under **either** answer.
  If blocking is off today, `F-S12-1` is a latent defect that activates with a documented procedure;
  if it is on, the channel is live. What the answer changes is **urgency**, not validity — which is
  why the severity is high rather than critical and why `GATE-S12-10` is written as a count of
  cross-learner control inputs rather than as an incident threshold.
- **Invalidating outcome.** If the Tier-2 blocking mechanism is **removed** from the product rather
  than configured, `F-S12-1` becomes moot rather than resolved, and `DR-C11-S12-2`'s revision trigger
  says it must be recorded that way rather than as a fix. `F-S12-9` is unaffected — it is live by
  default and does not depend on this assumption.
- **Owner.** **The creator**, as sole maintainer and sole operator.
- **Re-validation trigger.** `SPK-S12-3` executes and reports whether Tier-2 blocking is enabled, or
  the mechanism is removed from the product.
- **Status:** **carried.**

**Neither `A-S12-1` nor `A-S12-2` is charter-continued.** It stands in for no charter assumption, so it takes the
sub-task-scoped `A-S12-<k>` form rather than continuing the charter's `A-<n>` numbering — the same
allocation SUB-8, SUB-9, SUB-15 and SUB-16 each made, for the reason recorded in
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`.

**Three stand-ins this sub-task consumes by citation and does not restate.** `A-S8-1`, the 30-day
completion deadline, makes `SIG-S16-3` evaluable and is what `GATE-S12-22`'s threshold rests on; it
is *"not observed, not calibrated, and not a legal determination"* and remains SUB-8's. `A-S16-1`,
the reading the alert routes rest on, is what makes every `[unconfirmed]` route in `GATE-S12-1`'s
family navigable, and remains SUB-16's. `A-33`, the backups stand-in, underlies `TP-S12-43`. **No
second record of any of the three is raised here**, so the package keeps one id per assumption.

### SUB-13

## `A-S13-1` — The migration sweep's per-boot slice is five seconds and ten thousand rows

- **Id:** `A-S13-1`
- **Stand-in:** `SM_MIGRATION_SLICE_MS = 5000` and `SM_MIGRATION_SLICE_ROWS = 10000` — the wall-clock budget one boot spends on a migration sweep, and the ceiling on a single batch statement (`DR-C11-S13-2` clause 3; `13_the-ddl-the-migration-plan-and-the-runbook.md` §3.3).
- **Why a value is needed at all:** `R-S6-2` requires the sweeps to be batched, and `DR-C11-S7-2` clause 5 makes resumability the precondition of the batch-pause control — on **`T2`, `T5` and `T7`**, the three stages that are sweeps once `F-S13-9` is applied. The clause itself says *"the two batched stages"*, counting `T3` and `T7` from a model in which the sweeps were migration files; `F-S13-11` records the re-mapping and routes it to SUB-7. A batch needs a bound, and a runbook an implementer executes without asking a question cannot leave the bound blank.
- **What it stands in for:** Two measurements that do not exist. The **row counts** per table were never taken — SUB-6's aggregate probes were published and not executed for want of a credential (`OI-S6-1`, `SPK-S6-2`). The **baseline boot duration** of a `docker compose up -d --build` with a boot-time migration is unobserved (`OI-S15-1`, `SPK-S15-1`). Without either, the throughput that would convert a slice budget into a completion horizon is unknown in both of its factors.
- **The argument for the shape, which is not an argument for the value:** `OBJ-8`'s tightest published allowance on a day one rollout stage lands is **11.4 s** (`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:548`). 5 000 ms is under half of that, leaving margin for the baseline boot the deployment spends before the migrator even starts. **The claim is that it leaves margin, not that the margin is enough** — the quantity the margin must cover is precisely the one that is unmeasured. The row ceiling is a **secondary** guard, not a throughput target: the clock is checked only *between* statements, so a ceiling exists so that one pathologically slow batch cannot overrun the check. 10 000 is chosen to be small enough that the clock is consulted often, and no tighter justification is available or claimed, because row width and write rate are both unknown.
- **What is deliberately **not** assumed:** That the slice completes any sweep, that any stage fits `OBJ-8`, or that the total migration finishes in any particular number of boots. `DR-C11-S13-2` clause 5 states the opposite explicitly, and `CAP-S7-1` is not lifted.
- **Tolerance envelope — how wrong it can be before the design changes:** Wide in one direction and narrow in the other, which is why the *form* of the bound matters more than the number. **Too large** is bounded by construction: the worst case is one boot exceeding `OBJ-8`, and the correction is a parameter change between boots with no bookkeeping to reconcile, because the sweeps are self-cursoring. **Too small** is the direction that actually bites: `T7` failing to complete blocks `T8` indefinitely, since a confinement predicate over a partly-keyed population is `R-S5-1`. **The design itself does not change under any value** — only the schedule does — which is what makes this a stand-in rather than a load-bearing premise. If it were load-bearing, a wrong value would invalidate the sweep contract; it does not.
- **Owner:** **The creator**, as sole operator and the only party who can execute the aggregates that would supply the counts — the same owner `CAP-S7-1` names.
- **Re-validation trigger:** **`SPK-S6-2` executes** and the per-table counts exist, **or** **`SPK-S15-1` executes** and the restart duration is observed. Either converts *"leaves margin"* into arithmetic; both together make each stage's slice count computable and retire this entry. It additionally expires on any change to the deployment's host sizing or database instance class, either of which changes throughput without any repository change.
- **Exposure if it is wrong:** `R-S13-1`, severity High, escalating to `NEU-896`.
- **Id convention:** `A-S13-1`, **not** a charter-continued `A-<n>`. `DR-C11-S1-3` clause 3 fixes `A-<n>` for a stand-in that stands in for a **numbered charter assumption**; this stands in for two absent measurements, which no charter assumption asserts. The same allocation SUB-8 made for `A-S8-1` and SUB-15 for `A-S15-1`, and for the reason recorded in `decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`.

---

**SUB-13 register totals at revision 1:** one stand-in, `A-S13-1`, carrying two numeric defaults, with
a named owner, a stated tolerance envelope and two independent re-validation triggers. One rather than
several because this sub-task's other unknowns are not things its design provisionally rests on —
they are things it declines to state. The chapter writes **no** retention window (so it cannot
override `F-S9-6`'s conflict by accident), **no** stage duration, **no** row count, **no** completion
date, and **no** claim about the production database role. Each of those is an open item, a spike or
another sub-task's stand-in, and none is quietly assumed here.

**One thing that would look like a stand-in and is filed as an open item.** That the production
database role may be an owner or a superuser, which would make the published RLS layer inert, is
**`OI-S13-2`** — the design does not rest on an answer, because the RLS appendix is published
explicitly unrecommended until it resolves. A stand-in is a value the architecture proceeds on; this
is a precondition the architecture refuses to proceed without.

**One thing that would look like a stand-in and is a consumed upstream one.** That thirty days is the
data-subject completion deadline is **`A-S8-1`**, SUB-8's, and it is neither restated nor adjusted
here — the chapter writes no retention statement at all, precisely so that `F-S9-6`'s unresolved
30-days-versus-five-weeks conflict cannot be silently settled by this artifact.
