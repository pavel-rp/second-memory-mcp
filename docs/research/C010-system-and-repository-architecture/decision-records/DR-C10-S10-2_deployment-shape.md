# `DR-C10-S10-2` — Two processes on one self-managed host, built by the maintainer's own CI, with migration exclusive to the MCP core

**Task:** NEU-984 (SUB-10) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `03efe1d`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-8` (`../01_outcome-register.md`) in part — the deployment shape decision and its production-compatibility assessment, published as `../15_substrate-decisions-and-make-or-reuse-records.md` §6 and §9.

---

## Decision

**The system deploys as two processes — the MCP core process and the web-tier process — as
separate services from artifacts the maintainer's own CI produces, onto a single self-managed
host, with exactly one instance of each.**

Five clauses are part of the decision and not commentary:

1. **Two processes, not one.** The web tier does not run inside the MCP core process. This is
   `DS-1` as `../14_…md` §6 already assumed it, and `../13_…md` §6.4 alternative 3 already records
   that a single-process web tier would collapse `BND-S4-2`.
2. **One instance of each.** Not "at least one". The instance count is part of the decision
   because every conclusion about the process-local state below depends on it, and because
   `../08_…md` §8.4's single-instance consequence is stated per row across the matrix.
3. **The MCP core is the only process that runs migrations.** The web-tier process must not call
   the migrator on boot, and no second replica of the MCP core may exist during a pending-migration
   window. This clause is forced by measured behaviour, not by preference — see the decisive
   criterion.
4. **Built by the maintainer's own CI; deployed by push to a host that holds a private clone.**
   No platform builds directly from a hosted repository, and no public repository is required.
5. **The MCP core is the only credential holder for the database** — carried from
   `DR-C10-S10-1` clause 2, restated here because it is a property of the deployment shape and not
   only of the store.

---

## Rationale

### In-scope basis under SUB-15's rule

Applying `../13_…md` §4.2's three-step test:

| Leg | Would changing the deployment shape, on its own, do this? |
| --- | --- |
| **B — boundary** | **Yes.** Clause 1 fixes whether a `CMP` pair exists at all between the tiers, and clause 3 determines which component may hold the write edge to the migration table. `../13_…md` §6.4 alternative 3 records the single-process form collapsing `BND-S4-2` — the existence leg, exactly as §4.1 states it. |
| **A — authority** | **Yes**, through clause 5: a shape in which the web-tier process holds a database credential reassigns authority in all 45 cells at once. |
| **C — compatibility contract** | **Yes.** With clause 1 in force, the gated-tool surface is the web tier's *only* reach into state, which is what `CC-S8-*` is a contract about. |

Three yeses; one suffices. **In scope.**

### The decisive criterion — the migrator has no serialization, and this was read rather than assumed

Clause 3 is the clause a reader is most likely to think is over-specified, so its evidence is given
in full. `src/transport/main.ts:27` makes `await initializeDatabase();` the **first** statement of
`bootstrap()`, with no environment guard anywhere; `src/infrastructure/db/migrate.ts:38`–`:50`
calls drizzle's `migrate()`. The installed migrator is `drizzle-orm` **0.45.1**, and
`node_modules/drizzle-orm/pg-core/dialect.js:44`–`:72` shows what it does:

- It creates `drizzle.__drizzle_migrations` with `id SERIAL PRIMARY KEY, hash text NOT NULL,
  created_at bigint` — **no unique constraint on `hash` or `created_at`**, so nothing at the schema
  level prevents a duplicate row for the same migration.
- It decides what is pending with a plain `select … order by created_at desc limit 1` issued
  **before** the transaction opens — no `FOR UPDATE`, no `pg_advisory_lock`, no `LOCK TABLE`.
- It then wraps the *entire* pending-migration loop in one transaction.

That is a genuine time-of-check-to-time-of-use race with **no lock of any kind**. Against this
repository's actual migration SQL — which uses bare `CREATE TABLE` with no `IF NOT EXISTS`
(`drizzle/0000_strong_tarantula.sql:1`) — two concurrent boots during a pending-migration window
resolve as follows: Postgres catalog locking serializes the two DDL statements, the first
transaction commits, the second fails with `relation "…" already exists`, its whole transaction
aborts, `initializeDatabase()` rejects, and `src/transport/main.ts:62`–`:65` logs and calls
`process.exit(1)`. The failure is a **crash on boot**, not a silent double-application — but it is
a crash, and it is reachable from any shape that boots two migrators.

**This was settled by reading the installed source, so it is a finding and not a spike** — filed
as `F-S10-2`, and disclosed among the withdrawn spike candidates at `../92_…md` `### SUB-10`.
Clause 3 follows directly: a shape that permits two migrators is a shape with a known crash, and
the deployment path has **no rollback step** to recover from one.

### `OI-S9-4` — the check SUB-9 handed over, answered explicitly

`OI-S9-4`'s question, as SUB-9 posed it: does the selected deployment shape require the application
to be **built by a platform that builds directly from a hosted repository and that requires that
repository to be public**? Its resolving event requires SUB-10's record to **answer explicitly**;
`../14_…md` §6 records that "the item does **not** close on SUB-10 merely choosing a shape without
addressing the question."

**Answer: No.**

Clause 4 selects the shape already in use: `.github/workflows/cd-prod.yml` triggers on a
`workflow_run` completion of CI for branch `develop`, gated on `conclusion == 'success' && event ==
'push'`, then connects to a single `secrets.VPS_HOST` and builds on that host. No hosted-repository
build platform is involved at any point, and nothing in the shape requires any repository to be
public. **`DR-C10-S9-1` stands. `T2` is not reversed and is not re-decided.**

### But SUB-9's stated structural reason is wrong, and the correction is filed rather than absorbed

`../14_…md` §6.4 argues the point structurally, from "push-based SSH deployment to a self-managed
host **that never sees the repository**". That premise is false at the verification cutoff.
`cd-prod.yml:62`–`:65` runs, on the deployment target:

```
cd "$REPO_DIR"
git fetch origin
git reset --hard "$SHA"
git clean -fd
```

The host holds a clone and fetches into it. The **conclusion** is unaffected — the clone is of a
*private* repository, so no public-repository requirement arises from it — but the argument's
margin is narrower than published: the shape does not avoid the question structurally, it answers
it on the repository's visibility. Filed as **`F-S10-1`** and routed to SUB-9, which is merged;
this follows the accepted `F5.7` residual pattern rather than being absorbed into residual
uncertainty.

### Why one host and not two

Two hosts would put a network hop between the tiers. `F-S15-2` records that `SPK-S6-1`'s ≤0.02%
figure is an **in-process transport floor** carrying no network hop, TLS, connection setup or
inter-host latency, and `CAP-S15-1` records that the real deployed round-trip is unmeasured and
that all three SUB-15 decisions were priced against that floor. Choosing two hosts would add a
second unmeasured hop on top of an unmeasured first one. One host is the cheapest shape that
satisfies clause 1, and it is the shape the existing single `secrets.VPS_HOST` already provides.
Stated without over-claiming: **one host does not make the hop free, and it does not lift
`CAP-S15-1`.**

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **One process serving both the MCP surface and the web tier** | **Contradicts `DS-1`**, which `../14_…md` §6 states as "The web tier is deployed as a **process separate from the MCP core process**", and which three of SUB-9's criterion scores (`K6`, `K7`, `K9`) already rest on. `../13_…md` §6.4 alternative 3 independently records that this collapses `BND-S4-2`. Reversing it here would re-decide `DR-C10-S9-1` from a sub-task that consumes it. |
| 2 | **Two hosts, one process each** | **Adds a second unmeasured cost to an unmeasured first one** (`CAP-S15-1`, `F-S15-2`), doubles the operational surface where `OI-S1-3` records that hosting, TLS, backup and monitoring are already not discoverable, and nothing in evidence demands it. Rejected on cost-of-unknowns, not on a measured number — the measurement does not exist, which is the point. |
| 3 | **Horizontal replication of either process** | **Breaks four separate pieces of process-local state, all self-documented.** Session transports and identity (`src/transport/http.ts:82`–`:83`), rate-limit windows (`src/transport/rate-limit-middleware.ts:58`, whose own comment reads "State is per-instance and in-memory: the deployment assumption is a single server instance"), the Tier-2 breaker (`src/orchestration/tier2-circuit-breaker.ts:68`–`:76`), and the audit/event buffers. There is no Redis or shared store anywhere in `src/`. A second replica rejects any in-flight session it did not create — `404` with JSON-RPC `-32000` on POST, `400` on GET/DELETE (`src/transport/http.ts:226`–`:232`, `:245`–`:250`). Filed as `F-S10-3`. |
| 4 | **A managed platform that builds from the hosted repository** | **This is the alternative `OI-S9-4` exists to exclude.** Where such a platform requires the repository to be public it is incompatible with charter assumption 32 and would reverse `DR-C10-S9-1` to `T1`. Rejected, and the rejection is what makes the `OI-S9-4` answer "No" rather than "not applicable". |
| 5 | **Web-tier process running its own boot migrator** | **The measured TOCTOU.** `drizzle-orm` 0.45.1 takes no lock and reads pending-ness outside the transaction, and this repository's DDL is not idempotent; two migrators mean one process exits 1 with no rollback path to recover. Rejected on read evidence, and clause 3 is its negation. |
| 6 | **Defer the deployment shape to the implementation charter** | **Rejected on the resolving events it would strand.** `OI-S9-4`, `OI-S1-3`, `OI-S2-1` and `OI-S13-1` all name SUB-10 as owner and all resolve on this record landing. SUB-11 audits and SUB-12 gates without re-deciding; deferring would leave four items with no scheduled answer and `DR-C10-S9-1`'s three deployment-coupled scores permanently conditional. |

---

## Consequences

1. **The production-compatibility assessment is part of this decision, not an appendix.** All ten
   named facts are assessed at `../15_…md` §9, each returning **operable today**, **not operable
   today**, or **cannot be determined from the repository**. Three return *not operable* or
   *cannot be determined* in ways that bear directly on the shape, and they are stated as results
   rather than smoothed over.

2. **The absent rollback path is the sharpest incompatibility, and it is not repaired here.**
   `.github/workflows/cd-prod.yml` contains no rollback step, and no match for one exists anywhere
   in `.github/` or `scripts/`. Combined with unconditional boot migration, a bad migration is not
   revertible by the deploy path: the health poll fails and `exit 1` leaves the failed state in
   place. Writing a rollback step is a CI change, which this sub-task places out of scope — so this
   is recorded as **not operable today** and left visible.

3. **`/health` is not a readiness signal for this shape.** `src/transport/http.ts:91` returns a
   static `{ status: 'ok' }` with no dependency probe, while the deploy gate polls
   `docker inspect` for three consecutive healthy results. A two-process shape wants each process to
   report whether its dependency is reachable; today neither does. Recorded as **not operable**,
   with no endpoint written.

4. **`OI-S1-3` (charter assumption 31) is discharged by the route it names.** Hosting region,
   provider, TLS termination, backup and monitoring are not discoverable in the repository, and no
   operator answer is available in this run. Its resolving event permits conversion to a
   `CAP-S10-<k>`; that conversion is **`CAP-S10-1`**, which states which facts remain unknown and
   which decisions they leave unsupported. This is the permitted path, not a workaround.

5. **`OI-S2-1` is discharged by its own permitted cap route.** The scheduling mechanism for the
   citation-drift verdict producer is **not selected**; `CAP-S10-2` records that and what it
   leaves unsupported. `OI-S2-1`'s resolving event reads: "SUB-10 publishes its substrate document
   naming the scheduling mechanism — **or filing a `CAP-S10-<k>` stating that it does not select
   one and what that leaves unsupported**… whichever way it goes. A plausible guess at a mechanism
   is not a resolution." No guess is offered. What *is* decided is narrower and evidence-backed:
   the producer runs **outside the serve path's process** (consequence 6), which is a placement,
   not a scheduler.

6. **The drift producer gets a process placement but not a scheduler.** `DR-C10-S2-3` requires that
   "the serve path reads a verdict; it never computes one", and the producer needs egress. Under
   clause 2 the MCP core is a single instance whose event loop already carries the serve path, so
   the producer is placed **outside it**. Which mechanism dequeues is `CAP-S10-2`.

7. **The instance count is assumed, not verified.** `.env.example:79`–`:81` documents the
   single-instance assumption, one `secrets.VPS_HOST` exists, and `docker compose ps -q app`
   expects one container — but the actual running instance count and the process supervisor are
   **not discoverable from the repository**. Every conclusion in alternative 3 rests on clause 2
   holding in reality. Filed as **`CAP-S10-3`**.

8. **`CAP-S15-1` is not lifted; its first precondition is now satisfied.** The cap requires "a
   selected deployment topology (process boundaries, host placement, network path) **together
   with** a harness reporting a distribution". This record supplies the topology. The harness half
   is not supplied and cannot be: no two-process topology is deployed to measure. The cap stays
   open with one half discharged, stated rather than quietly closed.

9. **Nothing was created and nothing was deployed.** No Dockerfile, compose file, IaC file, CI
   change, host, process, service definition or configuration exists as a result of this decision.
   The scope check at `../15_…md` §12 records this against the charter's own out-of-scope list.

---

## Evidence

| Claim | Source |
| --- | --- |
| `DS-1` — the web tier is a process separate from the MCP core, both built by the maintainer's own CI | `../14_…md` §6 |
| A single-process web tier would collapse `BND-S4-2` | `../13_…md` §6.4 alternative 3; `../05_…md` §4.2 |
| `OI-S9-4` does not close on a shape chosen without addressing the question | `../14_…md` §6; `OI-S9-4` |
| Deploy triggers on `workflow_run` CI success for `develop`, gated on `conclusion == 'success' && event == 'push'` | `.github/workflows/cd-prod.yml` |
| The deployment target holds a clone and fetches into it — contradicting "never sees the repository" | `.github/workflows/cd-prod.yml:62`–`:65`; `F-S10-1` |
| Production build is `docker compose up -d --build` in an off-repo compose directory | `.github/workflows/cd-prod.yml` |
| No `Dockerfile` anywhere in the repository | worktree-wide search at `03efe1d`, zero results |
| Root `docker-compose.yml` is a dev-only `pgvector/pgvector:pg16` service with no `app` and no `build:` | `docker-compose.yml` |
| No IaC (terraform, pulumi, ansible, helm, k8s) and no reverse-proxy config (nginx, caddy, traefik, haproxy) | worktree-wide search at `03efe1d`, zero results |
| No rollback step anywhere | `.github/`, `scripts/` at `03efe1d`, zero matches |
| Health gate polls `docker inspect` for three consecutive `running` + `healthy`, then `exit 1` | `.github/workflows/cd-prod.yml` |
| Migrations run unconditionally as the first statement of `bootstrap()`, no env guard | `src/transport/main.ts:27`; `src/infrastructure/db/migrate.ts:38`–`:50` |
| `PgDialect.migrate()` takes no advisory lock, no `FOR UPDATE`, no `LOCK TABLE`; pending-ness read outside the transaction | `node_modules/drizzle-orm/pg-core/dialect.js:44`–`:72` (drizzle-orm 0.45.1) |
| `__drizzle_migrations` has no unique constraint on `hash` or `created_at` | `node_modules/drizzle-orm/pg-core/dialect.js:47`–`:53` |
| Migration DDL is not idempotent — bare `CREATE TABLE` | `drizzle/0000_strong_tarantula.sql:1` |
| A failed boot logs and calls `process.exit(1)` | `src/transport/main.ts:62`–`:65` |
| `/health` returns a static `{ status: 'ok' }` with no dependency probe | `src/transport/http.ts:91` |
| Session transports and identity are process-local `Map`s | `src/transport/http.ts:82`–`:83` |
| An unknown session returns `404` / JSON-RPC `-32000` on POST and `400` on GET/DELETE | `src/transport/http.ts:226`–`:232`, `:245`–`:250`; `F-S10-3` |
| Rate-limit state is per-instance, and the file says so | `src/transport/rate-limit-middleware.ts:58`; `.env.example:79`–`:81` |
| Tier-2 breaker state is process-local | `src/orchestration/tier2-circuit-breaker.ts:68`–`:76` |
| Audit and event log buffers and breakers are process-local | `src/transport/pg-audit-transport.ts:45`, `:48`–`:52`; `src/transport/pg-event-transport.ts:15`–`:38` |
| No Redis or shared state store anywhere in `src/` | worktree-wide search at `03efe1d`, zero results |
| No metrics exporter, tracing SDK or alerting configuration | worktree-wide search at `03efe1d`, zero results |
| Single `secrets.VPS_HOST`; `docker compose ps -q app` expects one container | `.github/workflows/cd-prod.yml` |
| The ≤0.02% figure is an in-process floor with no network hop, TLS or connection setup | `F-S15-2`; `SPK-S6-1` |
| The deployed web-tier↔MCP round-trip is unmeasured; lifting needs a topology *and* a harness | `CAP-S15-1` |
| Hosting, TLS, backup and monitoring are not discoverable in the repository | `OI-S1-3` (charter assumption 31) |
| The serve path reads a drift verdict and never computes one; the dequeue is unselected | `DR-C10-S2-3`; `OI-S2-1` |
| No scheduler, queue or job runner exists anywhere in `src/` | worktree-wide search at `03efe1d`; only in-process flush timers and local BFS queues |

---

## Revision trigger

1. **A rollback step lands in the deploy path** — consequence 2's *not operable* verdict is
   re-assessed. The verdict is a statement about the repository at `03efe1d`, not a permanent
   property.
2. **A dependency-probing readiness endpoint lands** — consequence 3 is re-assessed on the same
   basis.
3. **The migrator acquires serialization** — drizzle-orm gains an advisory lock or the project
   adopts an externally-locked migration step. Clause 3's *reason* disappears; the clause itself
   is then re-argued rather than assumed still-needed, because a shape with two migrators has other
   costs this record did not have to weigh.
4. **The single-instance premise is contradicted by an operator answer** — `CAP-S10-3` is lifted
   with a count greater than one, which invalidates alternative 3's rejection basis by making the
   rejected shape the actual one. The record is then re-decided, not patched, because the
   process-local state findings become live defects rather than rejection reasons.
5. **A hosted-repository build platform is adopted** — the `OI-S9-4` answer changes from No to
   Yes, `DR-C10-S9-1` reverses to `T1`, and both records are re-decided together.
6. **`OI-S1-3` is answered by the operator** — `CAP-S10-1` is lifted and the facts it holds open
   are recorded with the operator's answer cited, per that item's primary resolving route.
