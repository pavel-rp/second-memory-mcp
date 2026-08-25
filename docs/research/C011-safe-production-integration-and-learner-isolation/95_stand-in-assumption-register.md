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
