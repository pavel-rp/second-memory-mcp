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

## `A-36` — The two raw-SQL log tables are in scope for `NEU-850`'s "every core table"

**Status:** `[unconfirmed]`
**Stands in for:** **`OI-S5-1`**, owned by **`NEU-850`** and recorded in C010 — the question of
whether `NEU-850`'s *"every core table"* ranges over the two port-less log tables. C011 raises **no
open item of its own** for this question: it is another party's record, consumed by citation, and
this entry is the assumption the design provisionally rests on while it is open.

**Why this entry is `A-36` and not `A-35`.** `A-<n>` continues **the charter's own assumption
numbering**, so the number is fixed by which charter assumption the stand-in stands in for — this is
charter assumption **36**. It is not the next integer after SUB-1's `A-34`. Charter assumption 35 —
the human-`sub` shape — is **SUB-2's** entry to author, not this sub-task's, and `A-35` is left for it.

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

**SUB-3 register totals at revision 1:** one stand-in entry, `A-36`, carrying a named owner
(`NEU-850`), a tolerance envelope, an invalidating outcome and an observable re-validation trigger.
**No field is left blank for SUB-14 to fill.**

SUB-3 authors **only** this one. `A-35` is **SUB-2's**, and its absence here is correct rather than a
gap.
