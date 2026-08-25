# `15` — Numeric operational objectives for the platform the product actually runs on

**Task:** NEU-998 (SUB-15) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-14 · **Written:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]

**What this chapter is.** The capacity, availability, latency, failure and recovery objectives for the
single self-hosted instance this product deploys to — each one numeric, each one set against the
platform that exists rather than an idealized one, and each input carrying an explicit label saying
where its number came from.

**What this chapter is not.** It is not a measurement. **Not one number below was observed in
production**, because no production credential exists in this environment. Every figure is either
read out of this repository, computed from this repository's own git history, cited from an upstream
package's own measured spike, or explicitly marked `[unconfirmed]` and routed to an owner. Section 6
audits that claim exhaustively.

---

## 1. The platform these objectives are set against

Stated first, because an objective is only meaningful against a named platform, and every objective
below was checked against this list rather than against a cloud-shaped default.

| Platform fact | Evidence |
| --- | --- |
| A single self-hosted VPS reached by SSH; host named only by a `VPS_HOST` secret | Charter assumption 21 (confirmed 2026-08-24); `SPK-S1-9` in `96_spike-register.md` |
| An unversioned `docker compose` stack living **outside this repository** | Charter assumption 21 |
| **No Dockerfile and no infrastructure-as-code** anywhere in the tree | Charter assumption 21; independently re-confirmed at this cutoff — no `Dockerfile` at the repository root or at depth 2 |
| Deploy fires **automatically** from `develop` on green CI; deploy step is `git reset --hard "$SHA"` + `docker compose up -d --build`, with a health poll and **no rollback step** | Charter assumption 21; `.github/workflows/cd-prod.yml` |
| Database migrations run **unconditionally at boot**, with no environment guard and no repository-owned lock | `src/transport/main.ts:27`; `src/infrastructure/db/migrate.ts:38-50` |
| Process-local, in-memory state: transport map, subject-binding map, rate-limit windows, circuit-breaker set | `.env.example:76`–`:81`; charter assumption 22 (confirmed 2026-08-24) |
| The shipped configuration states the assumption in its own words: *"State is per-instance and in-memory: the deployment assumption is a single instance — running multiple replicas multiplies the effective limit by the replica count."* | `.env.example:79`–`:81` (the quoted sentence begins on line 79 and the words *"the deployment assumption is a single instance"* fall on line 80) |
| Node runtime floor `>=20.19.0`; **no heap limit flag** (`--max-old-space-size`) set anywhere | `package.json:65-67`; repository sweep at this cutoff |
| Hosting provider, region, TLS-termination point, monitoring, alerting and log-shipping destination — **all unknown** | `OI-S1-9` in `93_open-items-and-provisional-register.md`; stand-in `A-34` in `95_stand-in-assumption-register.md` |
| Whether production database backups exist — **unestablished** | `OI-S1-8` in `93_open-items-and-provisional-register.md`. **This chapter cites that record and does not restate the fact.** See §5. |

**Four things this platform does not have**, named explicitly because an objective that quietly
assumes one of them would be unmeetable: an image registry, a replica set, an IaC revert path, and a
managed database. Every objective in §4 carries a reality-check column asserting it depends on none
of them.

**Tool surface at this cutoff.** 46 registered / 43 gated / 3 exempt. Re-derived here rather than
inherited: 46 `server.registerTool(...)` registrations across `src/server/*.ts`, reached through the
13 registration functions at `src/server/tools.ts:17-31`; the 3 gate-exempt tools are the members of
`EXCLUDED_TOOLS` at `src/transport/context-token-middleware.ts:5-9` (`init_agent_context`,
`get_server_info`, `get_server_workflow`), leaving 43 gated. This agrees with the settled figure
fixed by C010's `F-S5-3` and diagnosed by `F-S8-1`
(`../C010-system-and-repository-architecture/02_findings-register.md`), so **no contradiction with
C010 is found and no amendment is routed to NEU-895** on this point.

---

## 2. The capacity model and its inputs

### 2.1 The evidence-label vocabulary

Four labels, used on every input below and nowhere used loosely. **No input is unlabelled, and no
input is labelled `observed` at all** — because nothing in production was observed.

| Label | Means | Admissible because |
| --- | --- | --- |
| `observed-in-repository` | Read directly out of this repository at cutoff `86fb38a`, cited `file:line`. A fact about the **shipped code**, not about production behaviour. | It is a verifiable, re-readable constant. |
| `derived` | Computed from one or more `observed-in-repository` inputs, or measured from this repository's own git history. The derivation is shown. | The arithmetic is reproducible and the inputs are cited. |
| `cited` | Taken from an upstream package's own measured result, by id. Never restated, never re-derived. | The upstream owns the measurement and its expiry. |
| `[unconfirmed]` | Not establishable from any of the above. Carries a named owner and a routing id. | Charter § Constraints requires exactly this rather than an assumed value. |

**`observed-in-production` is a fifth label this chapter is entitled to use and uses zero times.**
Its emptiness is the honest headline of the whole chapter, and it is stated here rather than left to
be inferred from the absence of the word.

### 2.2 Inputs

| Id | Input | Value | Label | Source / routing |
| --- | --- | --- | --- | --- |
| `C-1` | Main Postgres pool size | **4** connections | `observed-in-repository` | `src/infrastructure/db/client.ts:42` |
| `C-2` | Pool connection-acquisition timeout | **5 000 ms** | `observed-in-repository` | `src/infrastructure/db/client.ts:44` |
| `C-3` | Pool idle timeout | **30 000 ms** | `observed-in-repository` | `src/infrastructure/db/client.ts:43` |
| `C-4` | Additional pools in the same process | **2 further `pg.Pool` instances**, each at library defaults rather than the tuned config above | `observed-in-repository` | `src/transport/pg-audit-transport.ts:44`; `src/transport/pg-event-transport.ts:40` |
| `C-5` | Per-subject admitted request ceiling | **120 requests / 60 000 ms** = 2 req/s per subject | `observed-in-repository` | `src/config/resolve-rate-limit-config.ts:24-25`; documented at `.env.example:83`–`:88` |
| `C-6` | Aggregate admitted request ceiling | **none exists** — the limiter is keyed on the JWT subject, so N subjects admit N × the per-subject ceiling | `observed-in-repository` | `src/transport/rate-limit-middleware.ts:58` (`windows` keyed by subject); `.env.example:76`–`:78` |
| `C-7` | Audit-writer batch size / flush interval | **100 entries / 5 000 ms** | `observed-in-repository` | `src/transport/pg-audit-transport.ts:30-33` |
| `C-8` | Audit-writer breaker threshold / reset | **5 consecutive failures / 60 000 ms** | `observed-in-repository` | `src/transport/pg-audit-transport.ts:34-35` |
| `C-9` | Audit-writer response-body cap | **65 536 bytes** | `observed-in-repository` | `src/transport/pg-audit-transport.ts:36` |
| `C-10` | Event-writer batch / flush / threshold / reset | **100 / 5 000 ms / 5 / 60 000 ms** | `observed-in-repository` | `src/transport/pg-event-transport.ts:15-32` |
| `C-11` | Context-token TTL | **2 hours**, with a **300 000 ms** floor | `observed-in-repository` | `src/config/resolve-context-token-config.ts:8-9` |
| `C-12` | Tier-2 breaker cache TTL | **60 000 ms** | `observed-in-repository` | `src/orchestration/tier2-circuit-breaker.ts:43` |
| `C-13` | Transport + subject-binding map eviction | **on clean `onclose` only** — no TTL, no idle sweep, no size bound | `observed-in-repository` | `src/transport/http.ts:82-83` (declaration), `:212-218` (the only eviction path), `:304-311` (shutdown drain) |
| `C-14` | Rate-limit window eviction | **lazy sweep, at most once per 60 000 ms window**; no size bound | `observed-in-repository` | `src/transport/rate-limit-middleware.ts:63-68`, `:85` |
| `C-15` | OIDC discovery fetch timeout | **5 000 ms** | `observed-in-repository` | `src/transport/jwt-middleware.ts:10` |
| `C-16` | Instance count | **1** | `observed-in-repository` | `.env.example:79`–`:81`; charter assumption 22 |
| `C-17` | Deploy-triggering pushes to `develop` | **≥120 in 88 days** (2026-05-29 → 2026-08-25) = **≥1.36/day**; **≥62 in 30 days** = **≥2.07/day**; **≥23 in 7 days** = **≥3.29/day** | `derived` | `git rev-list --count origin/develop --grep="chore: bump version"` at cutoff `86fb38a`. Each version-bump commit follows a merge to `develop` that passed CI, and CD fires on green CI on `develop`. Lower bound, not exact — see §2.3. |
| `C-18` | Single-request latency for the content-retrieval class | **≤1 000 ms** (15 items), **≤2 000 ms** (5 × 10 KB items), **≤1 500 ms** (50-item pagination), **≤1 000 ms** (20-item mixed) | `derived` from a cited non-production source | `tests/performance/content-retrieval.test.ts:85,145,230,306`. DB-backed against a real Postgres test database, **single-process, single-request, concurrency 1**. These are regression guards, i.e. upper bounds the code is known to satisfy — not measurements of typical service time. |
| `C-19` | MCP-boundary framing overhead per tool call | **p50 0.0769 ms / p95 0.1892 ms** (714-byte payload, n = 2000/arm) | `cited` | C010 `SPK-S6-1`, `../C010-system-and-repository-architecture/92_spike-register.md`. A micro-benchmark of SDK framing, **not** end-to-end request latency. Negligible against `C-18` by three orders of magnitude. |
| `C-20` | Tool surface | **46 registered / 43 gated / 3 exempt** | `observed-in-repository` | §1 above |
| `C-21` | Node runtime floor; heap cap | **`>=20.19.0`**; **no heap flag set** | `observed-in-repository` | `package.json:65-67` |
| `C-22` | **Per-restart unavailability duration** | **unknown** | `[unconfirmed]` | `OI-S15-1`. Owner: the creator, as sole maintainer and sole operator. Spike `SPK-S15-1`. |
| `C-23` | **Concurrently active learner population** | **unknown** | `[unconfirmed]` | `OI-S15-2`. Owner: the creator. Stand-in `A-S15-1`. Spike `SPK-S15-2`. All product-foundation evidence is single-tenant (`n = 1`, the creator) — and C011's own evidence base is `n = 0`, per `F-S1-2`. |
| `C-24` | **Mean per-call database service time in production** | **unknown** | `[unconfirmed]` | `OI-S15-3`. Owner: the creator. Spike `SPK-S15-3`. `C-18` is the only cited bound and is a non-production single-request guard. |
| `C-25` | **Per-entry memory footprint of a live session** | **unknown** | `[unconfirmed]` | `OI-S15-4`. Owner: the creator. Spike `SPK-S15-4`. |
| `C-26` | **Host CPU, RAM and disk; Postgres `max_connections`** | **unknown** | `[unconfirmed]` | Cites `OI-S1-9` (SUB-1's record for the hosting facts) and stand-in `A-34`. Owner: the creator. No second record is raised here. |
| `C-27` | **Whether production database backups exist** | **unestablished** | `[unconfirmed]` | Cites **`OI-S1-8`** — SUB-1's single register record of this fact. **This row is a citation, not a record.** See §5. |

Twenty-seven inputs. **Sixteen `observed-in-repository`, two `derived`, one `cited`, eight
`[unconfirmed]`** — and every one of the eight carries a named owner and a routing id. Zero inputs
are silently assumed, which is the first of OUT-14's acceptance conditions.

### 2.3 Why `C-17` is a lower bound and not an exact count

The count is of version-bump commits on `origin/develop`, which stand in for merges that passed CI.
It understates deploys in one direction and may overstate them in another, and both are stated
rather than smoothed:

- **Understates:** a push to `develop` that produced no version bump still fires CD. 255 commits
  reached `develop` in the 90-day window against 120 bumps.
- **May overstate the distinctness:** the version-bump commit is itself a push to `develop`, so it
  may fire CD a second time for the same logical change. If it does, the true restart rate is up to
  **2×** the figures in `C-17`.

The objectives in §4 therefore use `C-17` as a **floor** and carry the 2× case explicitly, rather
than picking a midpoint that no evidence supports.

---

## 3. First-break analysis under multi-learner load

**The question.** As the learner population grows from the single tenant the product has today,
which process-local structure gives way first, and at what threshold?

### 3.1 The answer

**The shared Postgres connection pool breaks first, at `max: 4`** (`src/infrastructure/db/client.ts:42`).
It is a module-level, process-local singleton and it carries the **smallest hard numeric ceiling
anywhere in the process** — smaller than any of the four structures the charter enumerates, by two
orders of magnitude.

**Threshold, exactly.** The pool saturates when the number of concurrently in-flight DB-bound calls
reaches 4. By Little's law, with `λ` the aggregate arrival rate of DB-bound tool calls and `t_db`
the mean per-call database service time:

```
saturation  ⇔  λ · t_db  ≥  4
```

With `N` learners each active at the per-subject admitted ceiling of 2 req/s (`C-5`), `λ = 2N`, so:

```
N  ≥  2 / t_db
```

`t_db` is the unobserved term (`C-24`, `OI-S15-3`). **The structure is named with certainty; the
learner count at which it breaks is stated as a formula and a bounded band, not as a fabricated point
value:**

| `t_db` | Learners at saturation (`N = 2 / t_db`) | Basis for the `t_db` value |
| --- | --- | --- |
| 1.00 s | **2** | The repository's own worst-case single-request guard for the retrieval class (`C-18`, `tests/performance/content-retrieval.test.ts:85`) |
| 0.50 s | 4 | interpolation |
| 0.10 s | 20 | interpolation |
| 0.01 s | **200** | a plausible floor for a simple indexed read; **not measured** |

**The band is 2 to 200 concurrently active learners, spanning two orders of magnitude, and it cannot
be narrowed without `OI-S15-3`.** Publishing the band rather than a midpoint is deliberate: a single
number here would be the exact failure mode charter assumption 49 and this sub-task's brief forbid.

**Degradation versus failure.** Saturation alone means queueing, not errors. The pool's
`connectionTimeoutMillis` is **5 000 ms** (`C-2`), so a call that waits longer than five seconds for
a connection **fails acquisition** rather than merely running slowly. The failure threshold is
therefore the point at which mean queue wait exceeds 5 000 ms, which is strictly beyond saturation
and depends on the same unobserved `t_db`.

**A second-order pool fact, stated because it bites at a different ceiling.** The process opens
**three** pools, not one (`C-1`, `C-4`): the tuned `max: 4` pool plus one each inside the audit and
event transports at library defaults. The process can therefore hold materially more server
connections than 4 in total. Whether that total collides with the Postgres server's own
`max_connections` cannot be answered — the host and its database configuration are unknown
(`C-26`, citing `OI-S1-9`).

### 3.2 The four charter-named structures, ranked

The charter enumerates four process-local structures. The pool is not among them, so they are ranked
separately here rather than the lower ceiling being suppressed to fit the list. `DR-C11-S15-2`
records why both are reported.

**First of the four — the rate-limit windows, and it breaks as a *protection*, not as a *structure*.**

`src/transport/rate-limit-middleware.ts:58` keys `windows` on the JWT subject. The map itself is in
no danger: it is swept lazily once per 60 000 ms window (`C-14`) and in steady state holds one entry
per subject active in the last minute. What gives way is what it is for. **The limiter is
per-subject and provides exactly zero aggregate protection**, so admitted load grows *linearly* with
the learner population while the resource it would have to protect — the pool — stays fixed at 4.

Threshold, derived from `C-1` and `C-5` alone:

```
aggregate admitted rate = 2N req/s,  which exceeds what 4 connections serve whenever  2N · t_db ≥ 4
```

At **N = 3** subjects the aggregate admitted rate is 6 req/s, which saturates 4 connections at any
`t_db ≥ 0.667 s`. **The limiter cannot defend the pool at any learner count, by construction** — it
was designed to stop one subject monopolising the instance, and the shipped comment says exactly
that (`.env.example:76`–`:78`). This is the first-break finding that matters operationally, and it is
raised as `F-S15-2`.

**Second — the transport map and the subject-binding map, which break together.**

`src/transport/http.ts:82-83` declares `transports` and `sessionIdentity` side by side, keyed on the
same MCP session id, and `:212-218` is the **only** eviction path: `transport.onclose`. There is no
TTL, no idle sweep and no size bound; the remaining drain at `:304-311` runs on process shutdown.
The break mode is therefore **not** a learner-count threshold at all — it is **monotonic memory
growth from sessions abandoned without a clean close**, which a restart resets and nothing else does.

Because the two maps share a key and a lifecycle, the subject-binding map cannot break before the
transport map; they are one exposure, not two. The threshold in entries requires a per-entry memory
footprint that has never been measured (`C-25`) and a host RAM figure that is unknown (`C-26`), so
**no entry count is stated**; it is routed to `OI-S15-4` and `SPK-S15-4`. What *can* be stated
numerically is the mitigation cadence: at the measured deploy rate (`C-17`), the process restarts at
least 1.36 times a day and at least 3.29 times a day in the most recent week, and **each restart
empties both maps**. The leak is real and is currently masked by deployment churn — which is a
dependency on an accident, and is raised as `R-S15-2`.

**Fourth — the circuit-breaker set, which does not break under learner load at all.**

`src/orchestration/tier2-circuit-breaker.ts:68` declares `tripped` as a `Set` keyed by
`VerdictFieldName`, a small fixed enum. It cannot grow with the learner population and has no
load-driven threshold. Its exposure is of a different kind and is recorded rather than dismissed:
`tripped` is **process-lifetime and never cleared except by restart** (file header, `:6-11`), so a
field tripped once stays tripped until the next deploy — which, at `C-17`'s cadence, is on average
within a day.

### 3.3 Ranking, in one line each

| Rank | Structure | Ceiling | Threshold | Break mode |
| --- | --- | --- | --- | --- |
| **1** | Postgres pool (`max: 4`) — *not one of the charter's four* | **4** | `N ≥ 2 / t_db`; band **2–200** learners | queueing, then acquisition failure past 5 000 ms |
| **2** | Rate-limit windows — *first of the charter's four* | none (per-subject) | **N ≥ 3** at `t_db ≥ 0.667 s` | protection fails; aggregate load unbounded |
| **3** | Transport map + subject-binding map | none | not learner-count-driven; `[unconfirmed]` (`OI-S15-4`) | unbounded memory growth from abandoned sessions |
| **4** | Circuit-breaker set | fixed enum | **does not break under load** | process-lifetime trip, cleared only by restart |

---

## 4. The numeric objective set

Every objective is numeric, and the reality-check column asserts that it assumes no image registry,
no replica set, no IaC revert and no managed database.

| Id | Objective | Value | Provenance | Platform reality check |
| --- | --- | --- | --- | --- |
| `OBJ-1` | Concurrent DB-bound tool calls served without queueing | **≤ 4** | `derived` from `C-1` | Single instance, single tuned pool. Assumes none of the four absent capabilities. |
| `OBJ-2` | Admitted requests per authenticated subject | **≤ 120 per 60 000 ms**; HTTP 429 with `Retry-After` beyond | `observed-in-repository` (`C-5`) | Enforced in-process. Correct on one instance by construction; the shipped comment states it multiplies by replica count, which is why it holds only here. |
| `OBJ-3` | Aggregate admitted request rate | **must be ≤ 4 / `t_db` req/s** — a ceiling that **does not exist today** | `derived` from `C-1` + `C-24`; numeric value **unsettable** pending `OI-S15-3` | The mechanism to enforce it does not exist on this platform (`C-6`). Stated as an objective with a named gap, not as a satisfied constraint. Raised as `F-S15-2`. |
| `OBJ-4` | Per-tool-call latency, content-retrieval class, **at concurrency 1** | **p95 ≤ 1 000 ms** | `derived` from a cited non-production source (`C-18`), consistent with C010's 1 000 ms design budget `A-25` (`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md`) | Holds on this platform because it is already a green CI guard against a real database. **It is not a measured production p95 and must not be cited as one.** |
| `OBJ-5` | Per-tool-call latency **under concurrency** | **unsettable** | `[unconfirmed]` — `OI-S15-3` | Degrades by pool queueing above `OBJ-1`; the curve cannot be stated without `t_db`. |
| `OBJ-6` | MCP framing overhead per call | **p95 ≤ 0.19 ms** | `cited` — C010 `SPK-S6-1` (`C-19`) | Platform-independent; ~0.02% of `OBJ-4`'s budget. Negligible and stated so it is not re-litigated. |
| `OBJ-7` | Unannounced restarts the deployment must tolerate with no operator action | **≥ 7 per day** | `derived` from `C-17` — the 7-day rate of ≥3.29/day, doubled for the bump-fires-CD case (§2.3), rounded up | Auto-deploy from `develop` on green CI is the platform's actual behaviour; this objective describes it rather than wishing it away. |
| `OBJ-8` | Planned unavailability per restart, to meet a stated availability target | **≤ 13 s for 99.9%**, **≤ 65 s for 99.5%**, **≤ 131 s for 99%** | `derived` — daily unavailability budget ÷ `OBJ-7`; e.g. 86 400 s × 0.001 = 86.4 s/day ÷ 6.58 restarts/day = 13.1 s | Restart duration on a `docker compose up -d --build` with a boot-time migration is **`[unconfirmed]`** (`C-22`, `OI-S15-1`), so **no availability percentage is asserted** — the table states what each target *would require*. |
| `OBJ-9` | Unplanned availability | **no objective can be set** | `[unconfirmed]` — cites `OI-S1-9` | No monitoring or alerting is known to exist, so unplanned downtime is not merely unmeasured, it is **unmeasurable** on this platform today. Recorded, not blank. Detection is SUB-16's (NEU-999). |
| `OBJ-10` | Audit-log entries lost per circuit-open event | **≤ 60 s of audit traffic per 60 000 ms open window**; entries buffered at the moment of opening are **dropped, not retried** | `derived` from `C-7`, `C-8` | Bounded **in time** absolutely. **Unbounded in entry count** until the arrival rate is observed (`OI-S15-3`). The breaker opens after 5 consecutive failures and resets after 60 000 ms. |
| `OBJ-11` | Audit-log response-body retained per entry | **≤ 65 536 bytes**, truncated beyond | `observed-in-repository` (`C-9`) | A retention-relevant bound; handed to SUB-16 (NEU-999) and SUB-9 (NEU-1003) as a stated fact rather than re-derived there. |
| `OBJ-12` | Concurrent boot-time migrators | **exactly 1** | `derived` from `src/transport/main.ts:27` + `src/infrastructure/db/migrate.ts:38-50` | **The platform cannot currently guarantee this.** The migrator runs unconditionally with no repository-owned lock, and deploys are not serialized. At `OBJ-7`'s cadence the overlap window is small but non-zero. Raised as `R-S15-3`. |
| `OBJ-13` | **RPO** (maximum tolerable data loss) | **cannot be set** | **blocking finding `F-S15-1`**, citing `OI-S1-8` | See §5. |
| `OBJ-14` | **RTO** (maximum tolerable time to restore) | **cannot be set** | **blocking finding `F-S15-1`**, citing `OI-S1-8` | See §5. |

**Fourteen objectives. Nine carry a number. Five do not** — `OBJ-3` (mechanism absent, value pending
an observation), `OBJ-5` and `OBJ-9` (`[unconfirmed]` with owners), and `OBJ-13`/`OBJ-14` (a blocking
finding). **None is blank, and none was given an invented number to avoid being one.**

---

## 5. Recovery tabletop, and the objective that cannot be set

### 5.1 The tabletop

The scenario is the one this platform makes most likely: **the single host is lost, or its database
is corrupted by a partially applied boot-time migration.**

| Step | What the platform can actually do | Evidence |
| --- | --- | --- |
| Detect | Unknown. No monitoring or alerting is established to exist. | `OI-S1-9`; `OBJ-9` |
| Stop the bleeding | No deploy-independent disable path is established. CD fires automatically from `develop`. | Charter assumption 21 |
| Roll back the code | **No rollback step exists.** The deploy is `git reset --hard "$SHA"` against an off-repo compose stack; re-deploying an earlier SHA is possible in principle but is not a rollback path the pipeline provides. | Charter assumption 21 |
| Roll back the schema | **No down-migrations.** The migrator runs forward, unconditionally, at boot. | `src/infrastructure/db/migrate.ts:38-50` |
| Restore the data | **Unestablished.** — see §5.2 | `OI-S1-8` |
| Verify the restore | Cannot be planned until the previous row is answered. | — |

Four of six rows resolve to a capability the platform is not established to have. That is the
tabletop's result, and it is the reason `OBJ-13` and `OBJ-14` have no numbers.

### 5.2 The backups fact is cited here, not recorded here

Whether production database backups exist is **one fact with exactly one register record in this
package: `OI-S1-8`, in `93_open-items-and-provisional-register.md`.** SUB-1 owns it, SUB-7 and SUB-9
cite the same id, and this chapter **cites it and does not restate it**. The assumption resting on it
is separately carried as SUB-1's stand-in `A-33` in `95_stand-in-assumption-register.md`.

**No open item, finding or register entry authored by SUB-15 restates that fact.** What SUB-15
records instead is a distinct thing: a blocking finding about an **objective it cannot set**.

### 5.3 `F-S15-1` — the blocking finding

**`F-S15-1` — no RPO or RTO position can be set while the backups question is open.**

Recorded in full in `91_findings-register.md` with its owner and its citation. In summary: the two
records are deliberately distinct — `OI-S1-8` is *an unanswered production question*; `F-S15-1` is
*an operational objective that cannot be stated without the answer*. A later reader meets one record
for the fact and one for the objective, never two competing records of the same question.

### 5.4 The two conditional positions

Stated so that closing `OI-S1-8` yields an objective immediately rather than requiring this analysis
to be redone. **Neither is asserted; each is conditional on an answer nobody has given.** Both fall
inside the tolerance envelope `A-33` already states.

| If `OI-S1-8` closes as… | Then `OBJ-13` (RPO) becomes | And `OBJ-14` (RTO) becomes |
| --- | --- | --- |
| **No backups exist** | **Unbounded** — total loss of all learner data on host failure. This is the outcome `A-33`'s tolerance envelope explicitly admits, *"provided that is recorded as a decision with its consequence rather than discovered later."* | **Unbounded** — there is nothing to restore from; recovery means re-creating the data, not restoring it. |
| **Backups exist, rotating on period `P`, restore untested** | **≤ `P`**, plus the replication lag of the copy | **Unsettable numerically** until a restore is exercised once and timed. A restore that has never been performed yields no RTO, only a hope. |

Under the second branch, the **erasure obligation** in the data-lifecycle half acquires a target it
does not have today: a backup holding learner-derived data is a copy the erasure design must reach,
which is precisely the invalidating outcome `A-33` names. That consequence is handed to SUB-9
(NEU-1003) and SUB-12; this chapter states the recovery objective, not the erasure mechanism.

---

## 6. Audit — every operational claim this model rests on

OUT-14's final acceptance condition: *every operational claim is either closed by a SUB-1 spike or
marked `[unconfirmed]` with an owner — never assumed.* The audit is exhaustive over §2's twenty-seven
inputs and §4's fourteen objectives.

| Class | Count | Disposition |
| --- | --- | --- |
| Inputs read directly from this repository at `86fb38a`, cited `file:line` | **16** | Closed by reading. Not a production claim — a claim about shipped code, and labelled as such. |
| Inputs derived from repository facts or this repository's git history, derivation shown | **2** (`C-17`, `C-18`) | Closed by derivation, with the derivation and its bounds published. |
| Inputs cited from an upstream package's own measured spike | **1** (`C-19`) | Closed by citation to C010 `SPK-S6-1`. Not re-derived. |
| Inputs `[unconfirmed]`, each with a named owner and a routing id | **8** | `C-22`→`OI-S15-1`; `C-23`→`OI-S15-2`; `C-24`→`OI-S15-3`; `C-25`→`OI-S15-4`; `C-26`→ cites `OI-S1-9`; `C-27`→ cites `OI-S1-8`. Owner in every case: the creator, as sole maintainer and sole operator. |
| Inputs assumed without a label | **0** | — |
| **Claims closed by production observation** | **0** | No production credential exists. `DATABASE_URL`, `SMOKE_PROD_CLIENT_ID`, `SMOKE_PROD_CLIENT_SECRET`, `AUTH_*` and `VPS_*` were re-probed at this cutoff and are **all unset** — independently reproducing SUB-1's `F-S1-2`. |

**16 + 2 + 1 + 8 = 27**, matching §2.2 exactly, so no input is silently absent.

**Four new spikes** are registered in `96_spike-register.md` — `SPK-S15-1` … `SPK-S15-4` — each
carrying a question, a method, and a mandatory expiry. **None is executed**, for the same reason
SUB-1's nine were not, and each records `Result: not executed` rather than a substituted answer.
**No spike result is invented and no upstream spike's conclusion is restated** — `SPK-S1-8` and
`SPK-S1-9` are referred to by id only.

**Every one of the four new spikes first fails the "could this have been read from the repository
instead?" test**, which is why the model's many readable constants became `observed-in-repository`
rows rather than spikes.

---

## 7. Constraint checks

| Constraint | Result | Evidence |
| --- | --- | --- |
| No change to `src/` | **Met** | `git diff --name-only origin/develop` lists no path under `src/` |
| No change to `drizzle/` | **Met** | as above, no path under `drizzle/` |
| No change to deployment configuration | **Met** | as above |
| Tool surface stated as 46 / 43 / 3 | **Met** | §1, re-derived at `86fb38a` |
| The superseded miscount appears nowhere as a codebase fact | **Met** | It is referred to by description only, never by numeral, so a grep over this chapter returns zero hits |
| Multi-learner load claims carry the single-tenant evidence label | **Met** | `C-23`; §3 states the band rather than a point value throughout |
| C010 consumed with the source cited; contradictions routed to NEU-895, not resolved here | **Met — no contradiction found** | §1 (tool surface, agrees with `F-S5-3`); `C-19` (`SPK-S6-1`); `OBJ-4` (`A-25`). **No amendment routed.** The check is recorded so SUB-17 can see that it ran and returned empty. |
| The backups fact carries no second record | **Met** | §5.2; a search of SUB-15's register entries returns zero restatements |
| Every objective is numeric or a recorded finding — never a blank | **Met** | §4, fourteen rows, zero blanks |

---

## 8. What this chapter does not establish

Stated plainly, because an objective set is exactly the kind of artifact a later reader will over-trust.

1. **Nothing about how production actually behaves.** Zero production observations back any number
   here. The whole chapter is a model over repository constants plus eight owned unknowns. `CAP-S1-1`
   caps this for the package; `CAP-S15-1` records the objective-specific form of it.
2. **No availability percentage.** `OBJ-8` states what each target *would require* of a restart
   duration nobody has measured. A reader must not quote "99.9%" from this chapter.
3. **No entry-count threshold for the session maps.** §3.2 names the break mode and routes the
   number to `OI-S15-4`. The maps leak; how long that takes to matter is unknown.
4. **No RPO and no RTO.** `F-S15-1`, not a number, and not a blank.
5. **No detection design.** Whether a breach of any objective here would ever be noticed is SUB-16's
   (NEU-999), and `OBJ-9` states that today the answer appears to be no.
6. **No rollout sequencing.** SUB-7 (NEU-1001) consumes §5's recovery position; this chapter does not
   stage anything.
7. **A bounded reading gap.** `OBJ-10` bounds audit-log loss from the constants at
   `src/transport/pg-audit-transport.ts:30-36` and the drop at `:83-90`. The behaviour of entries
   arriving *during* an already-open 60 000 ms window was not traced line by line at this cutoff.
   It is readable from the repository, so it is **not** made a spike — it is recorded here as a
   reading gap for whoever needs the entry-count bound, alongside `OI-S15-3`.
8. **No claim that these objectives are the right ones.** They are the objectives this platform's
   own constants imply. Whether the product should accept a 2-to-200-learner ceiling is a program
   decision for NEU-896 at convergence, and `R-S15-1` routes it there.

---

## What this chapter hands forward

| Id | What it is | Who consumes it |
| --- | --- | --- |
| `F-S15-1` | The blocking RPO/RTO finding, citing `OI-S1-8` for the fact | **SUB-7** (NEU-1001) rollback tabletop; **SUB-9** (NEU-1003) backups column |
| `F-S15-2` | The rate limiter provides zero aggregate protection | **SUB-16** (NEU-999); **SUB-7** |
| `F-S15-3` | The session maps have no eviction path but a clean close | **SUB-16**; **SUB-4** (NEU-996) |
| `OBJ-1`…`OBJ-14` | The objective set the rollout stages are checked against | **SUB-7** (named in charter § Risks row 4's mitigation as the consumer of these objectives) |
| `OBJ-10`, `OBJ-11` | Audit-log loss bound and body cap | **SUB-16**; **SUB-9** |
| §5.4 | The two conditional RPO/RTO positions, ready the moment `OI-S1-8` closes | **SUB-7**; **SUB-9**; **SUB-12** |
| `R-S15-1`…`R-S15-3` | Residual exposures with owners and escalation routes | **SUB-14** (aggregation); **SUB-17** (gate) |

**The direction is forward-only.** This chapter publishes these ids; whether SUB-7 or SUB-9 in fact
cites them is that sub-task's acceptance, not this one's.
</content>
