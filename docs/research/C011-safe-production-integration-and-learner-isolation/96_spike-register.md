# `96` — Spike register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]
**Content owner:** SUB-1 (NEU-993) owns every entry in this register outright. SUB-14 (NEU-1007) owns
only where the register sits in the band and how it reconciles with the other seven — never what an
entry says.

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

## What this register records

| Field | What it records |
| --- | --- |
| **Id** | `SPK-S<n>-<k>` |
| **Question** | The single question this spike settles, stated so it has a wrong answer. |
| **Why reading could not settle it** | Why the repository cannot answer it. Every spike must first fail the *"could this have been read from the repository instead?"* test. |
| **Exit condition** | The observable event that ends the spike, stated before it ran. Never a date, never a party's satisfaction. |
| **Method** | What was to be run, in enough detail that someone else could repeat it. |
| **Quarantine path** | Confirmation that nothing landed under `src/`, `tests/` or `drizzle/`, and nothing was merged as product code. |
| **Date** | When the spike was run, or when its execution was determined to be impossible. |
| **Result** | What was observed — stated in full here, because a scratch tree is gitignored and no later reader can open it. |
| **Confidence** | `high` / `medium` / `low` / `none`, and what would raise or lower it. |
| **Expiry** | Mandatory. Never blank, never "N/A". |
| **Expiry rationale** | What would make this answer wrong, and why that date. |
| **Routes to** | The open item carrying the unclosed claim, where the spike did not close it. |

## Reading this register at revision 1

**Every one of SUB-1's nine spikes was designed and none was executed.** No production credential of
any kind was present in the authoring environment, so no token could be minted for any principal
shape and no read-only inspection of the production database, its metrics or its logs could be
performed. Each entry therefore records a **designed, repeatable method** and an honest
`Result: not executed`, and routes its claim to an owned open item in
`93_open-items-and-provisional-register.md`.

This is the path SUB-1's brief prescribes for evidence unobtainable under the read-only constraint —
not a shortfall dressed up, and not a substitute observation. **No entry below reports a result that
was not observed, and no principal shape is represented by a capture taken from a different flow.**

The consequence is stated where it belongs rather than softened: see `F-S1-2` in
`91_findings-register.md`, and the counts in
`01_production-evidence-and-the-access-audit.md` §4.

**Claims closed by observation: 0. Claims routed as owned open items: 9.** The two counts sum to the
nine entries below.

---

### SUB-1

#### `SPK-S1-1` — What claim set does a real `client_credentials` token from the production Rauthy IdP actually carry?

- **Id:** `SPK-S1-1`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** For the CI smoke principal, what are the exact decoded claims — specifically, is `sub` genuinely absent or null, is `azp` present and equal to the client id, and what is the literal `aud` and `iss`?
- **Why reading could not settle it:** The repository fixes the *request*, not the *response*. `.github/workflows/cd-prod.yml` shows the grant is a `POST` of `grant_type=client_credentials` to `https://auth.neurasphere.ee/auth/v1/oidc/token`, and `src/transport/jwt-middleware.ts` records the developer's belief that Rauthy sets `sub = null` for this grant and falls back to `azp`. A belief recorded in a code comment is not an observation of the IdP, and OUT-1's identity rule cannot rest on it.
- **Exit condition:** A decoded claim set for this grant is in hand and its `sub`, `azp`, `aud` and `iss` fields are each recorded as present-with-value or absent.
- **Method:** Issue the exact request `cd-prod.yml` issues, using the `SMOKE_PROD_CLIENT_ID` / `SMOKE_PROD_CLIENT_SECRET` credentials under the project's existing GitHub-Actions-secrets convention. Decode the returned JWT's payload segment only — never the signature. Record the claim names and, for each, either its value or a redaction marker. This is the **single registered exception** to the zero-mutation constraint: it mints a token and writes an IdP audit record, both outside the production database, the running MCP server and the deployment.
- **Quarantine path:** Not applicable — nothing was executed, so no scratch tree exists. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** `SMOKE_PROD_CLIENT_ID` and `SMOKE_PROD_CLIENT_SECRET` are unset in the authoring environment, and no other route to the credential exists within the read-only constraint. The registered exception was therefore **not exercised**. No claim set was obtained and none is reported.
- **Confidence:** `none`. Confidence becomes `high` the moment the grant is run by a party holding the credential and the decoded payload is recorded.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** The unobtainability is a property of the authoring environment, not of the deployment. Three months is long enough for the credential-holder to run the grant and short enough that a reader does not mistake a stale "not obtainable" for a standing property of the system.
- **Routes to:** `OI-S1-1`.

#### `SPK-S1-2` — What claim set does a real pre-registered static client token carry?

- **Id:** `SPK-S1-2`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** For the statically registered client the deployment configures, what is the literal `aud`, and is it the OAuth `client_id` as ADR-0001 states rather than the resource URL?
- **Why reading could not settle it:** `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` states that Rauthy hardcodes `aud` to the OAuth `client_id` for a static client, and that admitting it requires the opt-in `AUTH_ADDITIONAL_AUDIENCES`. Whether the deployment in fact configures such a client, and what value it actually carries, is deployment configuration — not repository content. `cd-prod.yml` never names it.
- **Exit condition:** A decoded claim set for the static client is in hand, with `aud` recorded against the configured `AUTH_ADDITIONAL_AUDIENCES` value.
- **Method:** A grant against the statically registered client using that client's own credentials under the project's existing secret conventions — **a distinct acquisition method from `SPK-S1-1`**, using a different principal's credentials, not the smoke principal's. Decode the payload segment only.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No credential for the static client is present, and the repository does not name which static client the deployment registers. Both the credential and the client's identity are needed and neither is available.
- **Confidence:** `none`. Confidence becomes `high` once the operator names the configured static client and the grant is run.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Same basis as `SPK-S1-1`. Additionally, the static client's configuration can change without any repository change, so even a successful capture would need re-validation on a deployment-configuration change.
- **Routes to:** `OI-S1-2`.

#### `SPK-S1-3` — What claim set does a real DCR client token with `aud = dyn$<random>` carry?

- **Id:** `SPK-S1-3`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** For a dynamically registered connector client, what is the literal `aud`, is `azp` the same `dyn$`-prefixed id, is `sub` present, and does it identify a human?
- **Why reading could not settle it:** ADR-0001 establishes the *form* — a random non-URL `client_id` of the shape `dyn$<random>` — and states plainly that **a DCR client can therefore never obtain `aud = <resource URL>` on Rauthy**. It does not establish what a real connector session's token carries, and in particular whether `sub` is present and human-identifying. That is the single most load-bearing unknown for OUT-1 and OUT-5.
- **Exit condition:** A decoded claim set from an existing authenticated remote-connector session is in hand, with `sub` recorded as present-and-human-identifying, present-and-opaque, or absent.
- **Method:** **This shape is not obtainable from the `client_credentials` endpoint** — it is issued through the remote connector's dynamic-client-registration plus authorization-code flow. The only read-only acquisition method is **capturing the decoded claim set from an existing authenticated connector session**: a third distinct method, sharing nothing with `SPK-S1-1` or `SPK-S1-2`. Registering a fresh DCR client would be a mutation of the IdP beyond the single registered exception and is **not** an admissible substitute.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No authenticated connector session was available to the authoring environment, and the capture cannot be performed within the read-only, non-mutating constraint from here. **This shape is explicitly not substituted with a `client_credentials` capture** — the brief forbids it and the substitution would be silently wrong, because the two shapes differ in exactly the field OUT-1 turns on.
- **Confidence:** `none`. Confidence becomes `high` only from a capture taken from a genuine connector session.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Same basis as `SPK-S1-1`. This entry additionally expires on any change to the connector's registration flow or to ADR-0001's audience-binding rule, either of which would change the shape being asked about.
- **Routes to:** `OI-S1-3` — the item OUT-1 and OUT-5 most need, and the one whose absence they must state an explicit assumption against.

#### `SPK-S1-4` — Does the production database schema match the repository's migration set?

- **Id:** `SPK-S1-4`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** Is the live schema exactly what `drizzle/` produces when replayed, or has it drifted — extra columns, missing indexes, a partially applied migration?
- **Why reading could not settle it:** The repository establishes what the migrations *would* produce. It cannot establish what the production database *is*. Drift is possible by construction here: `src/transport/main.ts` runs the migrator unconditionally as the first statement of `bootstrap()`, with no environment guard and no lock, so a boot during a pending-migration window is a real path — a shape C010 already recorded (see `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`).
- **Exit condition:** A dump of the live schema's tables, columns, types, nullability and indexes is in hand and has been diffed against a replay of `drizzle/`.
- **Method:** A read-only connection to the production database; `information_schema` queries only; no write, no DDL, no `init_agent_context`. Diff against a local replay of the migration set.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** `DATABASE_URL` is unset in the authoring environment and the production value is supplied by an on-host `.env` outside repository visibility.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Schema drift is a function of deploys, not of time; any deploy invalidates a prior answer. The date is a floor, and the real trigger is the next production deploy.
- **Routes to:** `OI-S1-4`.

#### `SPK-S1-5` — Does `infrastructure.mcp_request_log` actually hold learner-derived content in production?

- **Id:** `SPK-S1-5`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** Do the `params` and `response_body` columns, in real production rows, contain learner-derived content — and if so, of which categories?
- **Why reading could not settle it:** The schema is repository-known (`drizzle/0010_create_infrastructure_mcp_request_log.sql`, extended by `drizzle/0012_extend_mcp_request_log.sql`), and `src/transport/pg-audit-transport.ts` shows it writes whole request params and up to 65,536 bytes of response body. What those free-form columns *actually contain* for real traffic is a property of the data, not of the code, and it is exactly what a privacy classification turns on.
- **Exit condition:** A redacted sample of real rows is in hand, sufficient to say for each column whether learner-derived content is present, and of which categories.
- **Method:** A read-only connection; `SELECT` over a bounded recent window; redact before recording. No write of any kind.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No `DATABASE_URL` was available.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Log contents change with the tool surface and with what clients send; a conclusion older than a quarter should not be relied on for a privacy classification.
- **Routes to:** `OI-S1-5`. **Determining the classification is SUB-16's**, not SUB-1's — this entry supplies only the observation SUB-16 would classify.

#### `SPK-S1-6` — Does `infrastructure.operation_event_log` actually hold learner-derived content in production?

- **Id:** `SPK-S1-6`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** Does the `data` JSONB column, in real production rows, contain learner-derived content — and if so, of which categories?
- **Why reading could not settle it:** As with `SPK-S1-5`: `drizzle/0013_create_operation_event_log.sql` fixes the schema and `src/transport/pg-event-transport.ts` fixes the writer, but neither fixes the contents of a free-form JSONB column under real traffic.
- **Exit condition:** A redacted sample of real rows is in hand, sufficient to say whether `data` carries learner-derived content and of which categories.
- **Method:** A read-only connection; `SELECT` over a bounded recent window; redact before recording. No write of any kind.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No `DATABASE_URL` was available.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** As `SPK-S1-5`.
- **Routes to:** `OI-S1-6`. Classification is SUB-16's.

#### `SPK-S1-7` — Is `context_tokens` populated in production, and with what age distribution?

- **Id:** `SPK-S1-7`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** How many rows does `context_tokens` hold, what is their age and expiry distribution, and are expired rows ever removed?
- **Why reading could not settle it:** The table's shape is repository-known and startlingly small — `id`, `createdAt`, `expiresAt` and nothing else (`src/infrastructure/db/schema.ts`). Whether it is populated at all, whether expired rows accumulate without bound, and what a realistic volume looks like are properties of the running system.
- **Exit condition:** A row count, a min/max `createdAt`, and a count of rows already past `expiresAt` are in hand.
- **Method:** A read-only connection; three aggregate `SELECT`s. **`init_agent_context` is specifically not called** — it mints a `context_tokens` row and is therefore a mutation of the production database, outside the single registered exception.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No `DATABASE_URL` was available.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Row population is a function of live traffic and changes continuously; a count is stale almost immediately, and only the *presence or absence of unbounded accumulation* has a quarter-long shelf life.
- **Routes to:** `OI-S1-7`.

#### `SPK-S1-8` — Do production database backups exist, and if so what do they contain, where do they live, how often do they rotate, and has a restore ever been performed?

- **Id:** `SPK-S1-8`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** Does any backup of the production database exist at all — and if so, its contents, location, rotation and restore behaviour?
- **Why reading could not settle it:** An exhaustive repository sweep found no backup configuration, policy, script or scheduled job anywhere. C010 recorded the same negative result at its own cutoff (`../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`), which is why this is asked of the operator rather than re-derived from the tree. A negative repository result cannot distinguish *no backups* from *backups arranged outside the repository*.
- **Exit condition:** The operator states whether backups exist; if they do, their contents, location, rotation period and whether a restore has ever been exercised are recorded.
- **Method:** A read-only question to the operator, plus inspection of any backup artefact or scheduled job they name. No change to any backup arrangement.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** The question requires the operator, who was not reachable from the authoring environment.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** A backup arrangement can be added or removed at any time without a repository change, so any answer here is a point-in-time observation with a short useful life.
- **Routes to:** `OI-S1-8` — **the single register record of the backups fact.** SUB-15 (position 6), SUB-7 (position 9) and SUB-9 (position 11) each cite `OI-S1-8`; none raises a second record of the same question, so the package never carries four ids for one fact. What this sub-task asserts is only that its own entry exists and carries a stable id; whether each of those three in fact cites it is each of their own acceptances.

#### `SPK-S1-9` — What are the hosting region, provider, TLS termination, monitoring and log-shipping arrangements?

- **Id:** `SPK-S1-9`
- **Sub-task:** SUB-1 (NEU-993)
- **Question:** Where does production physically run, under which provider and region; where is TLS terminated; what monitoring and alerting exist; and where, if anywhere, are logs shipped?
- **Why reading could not settle it:** The repository reveals an SSH-plus-`docker compose` deploy to a single host named only by the `VPS_HOST` secret, and nothing else. No Dockerfile, no infrastructure-as-code, no reverse-proxy configuration, no metrics exporter, no tracing SDK, no alerting configuration and no external log sink appear anywhere in the tree. C010 already recorded this as a cap and an open item (`CAP-S10-1` / `OI-S1-3` in `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`); C011 cites that rather than re-deriving it.
- **Exit condition:** Provider, region, TLS-termination point, monitoring/alerting arrangement and log-shipping destination are each recorded as a named value or as an explicit "none".
- **Method:** A read-only question to the operator, plus read-only inspection of any monitoring surface they name. No configuration change.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** The question requires the operator, who was not reachable from the authoring environment.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Hosting and monitoring arrangements change without repository changes; a stale answer here would silently mislead SUB-15's numeric objectives and SUB-16's detection design.
- **Routes to:** `OI-S1-9`.

---

**SUB-1 register totals at revision 1:** nine spikes designed, **zero executed**, nine claims routed
to owned open items `OI-S1-1` … `OI-S1-9`. Every entry carries a mandatory expiry. The single
registered exception to the zero-mutation constraint — IdP token issuance — was **registered and not
exercised**; see `01_production-evidence-and-the-access-audit.md` §3.

---

### SUB-15

**Reading this section.** SUB-15 designed four spikes and **executed none**, for the same reason
SUB-1's nine were not executed: no production credential of any kind is present in the authoring
environment. `DATABASE_URL`, `SMOKE_PROD_CLIENT_ID`, `SMOKE_PROD_CLIENT_SECRET`, `AUTH_*` and
`VPS_*` were **re-probed independently at cutoff `86fb38a`** and are all unset, reproducing
`F-S1-2`'s finding rather than citing it blind.

**Every one of the four first fails the *"could this have been read from the repository instead?"*
test** — which is exactly why the capacity model's many readable constants became
`observed-in-repository` rows in `15_operational-objectives-for-the-real-platform.md` §2.2 and not
spikes. **No entry below reports a result that was not observed**, and **no upstream spike's
conclusion is restated** — `SPK-S1-8` and `SPK-S1-9` are referred to by id only.

**Claims closed by observation: 0. Claims routed as owned open items: 4.** The two counts sum to the
four entries below.

#### `SPK-S15-1` — How long is the service unavailable across one deploy restart?

- **Id:** `SPK-S15-1`
- **Sub-task:** SUB-15 (NEU-998)
- **Question:** From container stop to the health poll returning green, how many seconds is the service unavailable during one `docker compose up -d --build` deploy — including image rebuild, container replacement and the boot-time migration?
- **Why reading could not settle it:** The repository fixes the deploy *procedure*, not its *duration*. `.github/workflows/cd-prod.yml` shows the SSH deploy and the health poll; `src/transport/main.ts:27` shows the migrator runs first at boot. Neither establishes how long any of it takes on the real host, which depends on host CPU, image-layer cache state and the pending-migration set — none of which is repository content.
- **Exit condition:** One deploy is timed from container stop to health-poll green, and the duration is recorded.
- **Method:** Observe one deploy that is happening anyway — read the CD workflow run's own timestamps for the deploy step and the health-poll step, which the pipeline already records. **No deploy is triggered for the purpose**, and nothing is changed on the host; this is a read of an existing run's metadata. Where the workflow's granularity is insufficient, time one deploy from the host with `docker compose ps` polling, read-only.
- **Quarantine path:** Not applicable — nothing was executed, so no scratch tree exists. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No access to the production host or to the deployment's workflow-run history was available from the authoring environment; `VPS_HOST` and `VPS_SSH_KEY` are unset. No duration was obtained and none is reported.
- **Confidence:** `none`. Confidence becomes `high` the moment one real deploy is timed.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Restart duration is a function of image size, migration set and host capacity, all of which drift with the codebase. A quarter is long enough for the operator to catch one deploy and short enough that a reader does not treat a stale duration as a standing property. Aligned with SUB-1's nine entries so the register expires as one set.
- **Routes to:** `OI-S15-1`.

#### `SPK-S15-2` — What concurrent-learner population is this deployment meant to serve?

- **Id:** `SPK-S15-2`
- **Sub-task:** SUB-15 (NEU-998)
- **Question:** What is the target number of concurrently active learners the deployment must support — and is that target at, below, or above the capacity band the single instance provides?
- **Why reading could not settle it:** No document in the repository states a target population. C010 does not; this charter does not; the product foundation is single-tenant throughout. A number that has never been written down cannot be read out, and inferring one from the code would be inventing the requirement the code was built to.
- **Exit condition:** A target concurrent-learner population is stated for the deployment, or it is explicitly recorded that no target is being set.
- **Method:** A read-only question to the operator, and to `NEU-896` at convergence for the adequacy judgement. No system access of any kind. This is the only one of the four spikes that needs no production credential — it needs a decision that nobody has yet made.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** The question requires the operator and, for the adequacy limb, `NEU-896` at convergence; neither was reachable from the authoring environment. **No target population is assumed in its absence** — the objectives in `15_operational-objectives-for-the-real-platform.md` §4 are stated as ceilings, and the assumption the model provisionally rests on is carried openly as the stand-in `A-S15-1`.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** A target population is a product decision that can change at any time and without any repository change. It additionally expires on any change to the product's tenancy model.
- **Routes to:** `OI-S15-2`, paired with the stand-in `A-S15-1`.

#### `SPK-S15-3` — What is the mean per-call database service time in production?

- **Id:** `SPK-S15-3`
- **Sub-task:** SUB-15 (NEU-998)
- **Question:** How long does a tool call hold a Postgres connection in production, at p50 and p95 — the term `t_db` on which the first-break threshold `N ≥ 2 / t_db` and the entire 2–200 capacity band turn?
- **Why reading could not settle it:** The repository fixes the pool's *shape* (`src/infrastructure/db/client.ts:40-47`) but not the *service time* of real queries against real data volumes. `tests/performance/content-retrieval.test.ts` is the nearest thing in the tree and is explicitly not an answer: it is single-request, concurrency-1, against a small synthetic test database, and its assertions are upper-bound regression guards rather than measurements of typical service time. Service time under production data volumes and production concurrency is a property of the running system.
- **Exit condition:** A p50 and p95 per-call connection-hold time are in hand, sampled over a bounded recent window.
- **Method:** A read-only connection to the production database; query `pg_stat_statements` for `mean_exec_time` and `calls` over the statement set the application issues — no write, no DDL, no `init_agent_context`. Where `pg_stat_statements` is not enabled, sample the two existing log tables instead: `infrastructure.mcp_request_log` already records per-request timing, so a bounded `SELECT` over a recent window yields the distribution with **no new instrumentation and no mutation**.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** `DATABASE_URL` is unset in the authoring environment and the production value is supplied by an on-host `.env` outside repository visibility. No service time was obtained and **none is reported** — the capacity band in `15_operational-objectives-for-the-real-platform.md` §3.1 is published as a band precisely because this entry is empty.
- **Confidence:** `none`. Confidence becomes `high` from one bounded sample.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Service time drifts with data volume, index health and the tool surface, all of which change continuously. This is the shortest-lived of the four answers in practice, and the date is a ceiling rather than a guarantee of freshness.
- **Routes to:** `OI-S15-3` — the single most load-bearing unknown in this sub-task's model, and the one whose absence widens the capacity band by two orders of magnitude.

#### `SPK-S15-4` — What does one live session entry cost in memory, and against what host RAM?

- **Id:** `SPK-S15-4`
- **Sub-task:** SUB-15 (NEU-998)
- **Question:** How many bytes does one entry in the `transports` / `sessionIdentity` pair hold, and how many such entries would the host's memory allow before the absent-eviction gap recorded in `F-S15-3` becomes a real failure?
- **Why reading could not settle it:** `src/transport/http.ts:82-83` fixes the maps' *types* and `:212-218` fixes their *only* eviction path, both readable. Neither fixes the retained footprint of a live `StreamableHTTPServerTransport`, which depends on the SDK's own buffering and on the runtime's heap layout. The host RAM figure it would be compared against is separately unknown and is **cited from `OI-S1-9`**, not re-asked here.
- **Exit condition:** A per-entry retained size is in hand alongside a known live-session count, and the host's available memory is known.
- **Method:** Take a heap snapshot of the running process at a known live-session count and read the retained size of the two maps — read-only, no restart, no configuration change. Pair with the host memory figure once `OI-S1-9` closes. **`init_agent_context` is specifically not called** to create sessions for the purpose: it mints a `context_tokens` row and is a mutation of the production database, outside the single registered exception.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No access to the production host was available; `VPS_HOST` and `VPS_SSH_KEY` are unset. No footprint was obtained and **no entry-count threshold is reported** in `15_operational-objectives-for-the-real-platform.md` §3.2 as a consequence.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** The footprint changes with any upgrade of `@modelcontextprotocol/sdk` or of the Node runtime, either of which can land without a change to the two lines that declare the maps. The date is a floor; the real trigger is the next SDK or runtime bump.
- **Routes to:** `OI-S15-4`.

---

**SUB-15 register totals at revision 1:** four spikes designed, **zero executed**, four claims routed
to owned open items `OI-S15-1` … `OI-S15-4`. Every entry carries a mandatory expiry. **No production
operation of any kind was performed by SUB-15**, so the zero-mutation constraint is discharged
vacuously and **no exception — registered or otherwise — was exercised**.

---

### SUB-2

**Content owner:** SUB-2 (NEU-994) owns the three entries below outright. They extend SUB-1's set
rather than revising it; **no `SPK-S1-*` entry is edited, and none is contradicted.** Like SUB-1's,
all three were designed and **none executed** — no production credential exists and no operator
channel was reachable from the authoring environment (`91_findings-register.md` § `F-S1-2`).

**Claims closed by observation: 0. Claims routed as owned open items: 3.**

#### `SPK-S2-1` — Is the Rauthy `sub` claim stable per principal, unique over time, and opaque in format?

- **Id:** `SPK-S2-1`
- **Sub-task:** SUB-2 (NEU-994)
- **Question:** For a single principal, is `sub` identical across two separate token issuances? Is a released `sub` ever re-assigned to a different principal? And is its value an opaque identifier (a UUID) or a human-meaningful string such as an email address?
- **Why reading could not settle it:** The repository is silent on `sub` entirely. `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` decides issuer matching and audience binding and does not mention the claim; `src/transport/jwt-middleware.ts` consumes `sub` without asserting anything about its lifetime, uniqueness or shape. These are properties of the IdP's configuration and of its behaviour over time, neither of which is repository content. The identity rule turns on the first two and OUT-9's personal-data classification turns on the third.
- **Exit condition:** Two decoded claim sets for the same principal, taken at different times, are in hand and their `sub` values compared; and the operator has stated whether Rauthy ever recycles a subject identifier.
- **Method:** Obtain a token for one principal under the registered IdP-token-issuance exception, decode the **payload segment only** — never the signature — and record `sub` as a redaction marker plus its *shape* (length, character class, whether it parses as a UUID, whether it contains an `@`); never its literal value, since a human-meaningful `sub` would itself be personal data. Repeat after a fresh issuance and compare. Separately, put the recycling question to the operator as a read-only question. No write of any kind; no configuration change.
- **Quarantine path:** Not applicable — nothing was executed, so no scratch tree exists. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No production credential is present for any principal shape, and the operator was not reachable from the authoring environment. No claim set was obtained and none is reported.
- **Confidence:** `none`. Confidence becomes `high` for the stability and format limbs once two issuances are compared, and `high` for the recycling limb only on an operator statement — recycling cannot be established by observing two tokens.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Same three-month basis as `SPK-S1-1`: the unobtainability is a property of the authoring environment, not of the deployment. This entry additionally expires on **any Rauthy upgrade or IdP configuration change**, either of which can change subject issuance without any repository change.
- **Routes to:** `OI-S2-1`. The exposure resting on the recycling limb is carried separately as `R-S2-1` in `92_risk-register.md`.

#### `SPK-S2-2` — What claim set does a real token from the named production static client `claude-web` carry, and under which grant?

- **Id:** `SPK-S2-2`
- **Sub-task:** SUB-2 (NEU-994)
- **Question:** For the manually provisioned static client `claude-web` — the claude.ai connector's production principal — is `sub` present, does it identify a natural person, what is the literal `aud`, and which grant type issues the token?
- **Why reading could not settle it:** `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67` **names** the client and records that production sets it in `AUTH_ADDITIONAL_AUDIENCES`, and `.env.example:63` corroborates. That fixes the client's *identity* — which is more than `SPK-S1-2` had, and is why this entry exists rather than a restatement of it. It does not fix the *claim set*: what a real `claude-web` token carries is IdP behaviour, not repository content. The inference *"a connector flow has a human at it"* is an inference about the flow's shape, not a reading of a token, and OUT-5 may not rest on it.
- **Exit condition:** A decoded claim set from a real authenticated `claude-web` connector session is in hand, with `sub` recorded as present-and-human-identifying, present-and-opaque, or absent, and with the grant type stated.
- **Method:** **Capture the decoded claim set from an existing authenticated claude.ai connector session** — the same acquisition class `SPK-S1-3` uses for the DCR shape, and for the same reason: an authorization-code connector token is not obtainable from the `client_credentials` endpoint. **This is a distinct principal from `SPK-S1-1`'s smoke client and from any `dyn$` client**, and no capture from either is an admissible substitute. Decode the payload segment only; record each claim name with its value or a redaction marker. Provisioning a fresh static client would be an IdP mutation beyond the single registered exception and is **not** admissible.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** No authenticated claude.ai connector session was available to the authoring environment. **No substitution was made**: the shape was not represented by a `client_credentials` capture, for the reason `91_findings-register.md` § `F-S1-3` records — the shapes differ in exactly the field the identity rule turns on.
- **Confidence:** `none`. Confidence becomes `high` only from a capture taken from a genuine `claude-web` connector session.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Same basis as `SPK-S1-2`. This entry additionally expires on any change to the production `AUTH_ADDITIONAL_AUDIENCES` value or to the connector's registration, either of which changes the principal being asked about — and both of which can happen without any repository change.
- **Routes to:** `OI-S2-2`, and it is **the most direct closer of C010's `OI-S1-2`**, because it covers the shape the production learner actually arrives on. It narrows, and does not supersede, this package's own `OI-S1-2`.

#### `SPK-S2-3` — Does any `dyn$` DCR client exist in production, and has any authenticated?

- **Id:** `SPK-S2-3`
- **Sub-task:** SUB-2 (NEU-994)
- **Question:** Is any dynamically registered client registered with the production Rauthy instance, and has any ever presented a token to the deployment?
- **Why reading could not settle it:** The middleware still admits the `dyn$` path (`src/transport/jwt-middleware.ts:80`, `:83`), so the *capability* is repository-known. Whether the path is *used* is a property of the running IdP's client registry and of production traffic. ADR-0001's NEU-909 amendment puts it in genuine doubt by recording that the production connector authenticates as a static client *"rather than DCR"* — so the DCR path may be an admitted-but-unused surface, which is a different thing from a live learner path.
- **Exit condition:** The operator states whether any `dyn$`-prefixed client is registered, and whether any has authenticated; or a read-only listing of the IdP's registered clients is recorded, redacted of any secret material.
- **Method:** A read-only question to the operator, plus read-only inspection of the Rauthy admin surface if one is offered. **No client is registered to find out** — a DCR registration would be an IdP mutation beyond the single registered exception, and it would also destroy the very evidence being sought by creating the first such client.
- **Quarantine path:** Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`.
- **Date:** 2026-08-25 — the date execution was determined to be impossible.
- **Result:** **Not executed.** The question requires the operator, who was not reachable from the authoring environment.
- **Confidence:** `none`.
- **Expiry:** 2026-11-25.
- **Expiry rationale:** Client registration is a live property of the IdP that changes without any repository change — a single connector re-authorization could create the first `dyn$` client. A negative answer therefore has a short useful life, and **a stale negative is the dangerous direction here**: it would license SUB-7 and SUB-11 to write contracts over a path they believe unused.
- **Routes to:** `OI-S2-3`. **It gates nothing in the identity rule** — `02_identity-the-learner-key-and-principal-kind.md` §3 is total over both paths — and changes only the priority of `OI-S1-3` and the scope of SUB-7's rollout and SUB-11's compatibility contract.

---

**SUB-2 register totals at revision 1:** three spikes designed, **zero executed**, three claims
routed to owned open items `OI-S2-1` … `OI-S2-3`. Every entry carries a mandatory expiry. The single
registered exception to the zero-mutation constraint was **not exercised by SUB-2 either**: zero
tokens minted, zero IdP audit records created, zero production operations of any kind.

**Cumulative across SUB-1 and SUB-2: twelve spikes designed, zero executed.** That the count has
grown while the executed count has not is itself the fact `R13` names, and it is reported here
rather than left for a reader to compute.

---

### SUB-4

*`NEU-996`, covering `OUT-7` and `OUT-13`. Two spikes, both read-only, both routed to owned open
items. A third candidate was designed and then **dropped** for failing the
"could this have been read instead?" test — see the totals note below.*

#### `SPK-S4-1` — Does the production deployment expose a STDIO edge, and if so, to whom?

- **Id:** `SPK-S4-1`
- **Sub-task:** SUB-4 (NEU-996)
- **Question:** Is the STDIO transport reachable in the production deployment at all — is any process started with `TRANSPORT` unset or `stdio`, and if so who or what can connect to its standard input?
- **Why reading could not settle it:** The compose stack and the VPS are outside this repository entirely, and `TRANSPORT` is an environment variable set at deploy time. The tracked tree shows only that `stdio` is the **default** when the variable is unset (`src/config/resolve-transport-config.ts:35`); it cannot show what the deployment actually sets. C010 reached the same conclusion and routed the question rather than answering it (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485`).
- **Exit condition:** A statement, recorded here, of whether any production process runs on the STDIO transport, and if so what may connect to it — or an explicit statement that none does and none is intended.
- **Method:** **Read-only, non-mutating.** A question to the operator, plus a read-only inspection of the compose stack and the deployed process environment **if the operator offers one**. No process is started, no variable is changed, no connection is attempted. This is the same acquisition class as `SPK-S2-3`.
- **Quarantine path:** Nothing is written to `src/`, `drizzle/` or any deployment configuration; no product code is produced; the result is a statement appended to this register and nothing else.
- **Date:** —
- **Result:** **Not executed.**
- **Confidence:** —
- **Expiry:** **2026-11-25.**
- **Expiry rationale:** Three months, matching the package's standing expiry discipline. The deployment shape is the kind of fact that changes when hosting changes, and a stale "no STDIO edge exists" would be worse than no answer, because it would justify relaxing the staging urgency on evidence that had quietly expired.
- **Routes to:** **`A-S4-2`**, and C010's deployment-shape question owned by `SUB-10 of C010 (NEU-984)` co-named `NEU-896`. **It gates nothing in the gate decision** — `04_the-stdio-identity-gate-and-the-bound-context-token.md` §12 states the decision stands under either answer, and C010 makes the invariant's verdict unconditional on it. It changes only SUB-7's staging urgency.

#### `SPK-S4-2` — What identifier and declared kind would an operator give a configured STDIO principal?

- **Id:** `SPK-S4-2`
- **Sub-task:** SUB-4 (NEU-996)
- **Question:** Would the party operating a STDIO deployment accept a server-held configured principal (`DR-C11-S4-1` clause 2), and if so what identifier would they use and which principal kind would they declare it — `user`, yielding a learner key, or `client`, yielding a service principal refused learner state?
- **Why reading could not settle it:** No configuration surface for it exists at `5111841` — the value is not in `.env.example`, not in any deployment artifact in this repository, and not in any recorded operator statement. It is a decision nobody has yet been asked to take, not a fact hiding in the tree.
- **Exit condition:** A recorded operator statement giving the identifier's **shape** and the declared kind, or a recorded statement that no STDIO deployment will be operated and the question is moot.
- **Method:** **Read-only, non-mutating.** A question to the operator. Nothing is provisioned, nothing is configured, no process is started. If the identifier is a value with any sensitivity, its **shape** is recorded and never its literal value, on the same discipline `SPK-S2-1` applies to `sub`.
- **Quarantine path:** Nothing written to `src/`, `drizzle/` or any deployment configuration; the result is a statement appended to this register.
- **Date:** —
- **Result:** **Not executed.**
- **Confidence:** —
- **Expiry:** **2026-11-25.**
- **Expiry rationale:** Three months, matching the package's discipline. An operator's intention about a deployment they have not yet configured is exactly the kind of answer that goes stale, and a rollout built on an intention already past its expiry would be building on a preference rather than a commitment.
- **Routes to:** **`OI-S4-1`**. **It gates nothing in the design** — `04_the-stdio-identity-gate-and-the-bound-context-token.md` §3 and §5 are total over both declared kinds, so the mechanism holds whichever answer comes back. It determines what a specific deployment *does*, and it is a prerequisite for OUT-19's runbook naming a concrete value.

---

**SUB-4 register totals at revision 1:** two spikes designed, **zero executed**, two claims routed
to owned open items `OI-S4-1` and `SPK-S4-1`'s target `A-S4-2`. Both carry a mandatory expiry. The
registered exception to the zero-mutation constraint was **not exercised by SUB-4 either**: zero
tokens minted, zero IdP audit records created, zero production operations of any kind. **This
sub-task applies the `observed-in-production` label to zero claims** — it is named to record its
emptiness and attached to nothing.

**A third spike was designed and dropped, and the drop is recorded rather than silent.** The
candidate — *would the existing smoke suite pass against a `client`-kind principal under the
refusal rule?* — failed the *"could this have been read instead?"* test that `R14` and
`DR-C11-S1-2` impose. Its factual half **was** settled by reading: `tests/smoke/smoke.test.ts:206`
and `:237` call gated learner-state tools with the captured context token, and
`.github/workflows/cd-prod.yml:145`–`:174` shows the token is `client_credentials`. Its remaining
half is a **judgement about regression value**, which no bounded read-only experiment against
production can produce, and it is filed as `OI-S4-2` instead. Filing it as a spike would have been a
spike standing in for a read and then for a decision.

**Cumulative across every sub-task that had written to this register when SUB-4 authored — SUB-1
(9), SUB-15 (4), SUB-2 (3) and SUB-4 (2): eighteen spikes designed, zero executed.** The count has
grown again while the executed count has not. That is `R13`'s fact and it is reported here rather
than left for a reader to compute.

**SUB-16's section landed concurrently, so the package total is nineteen, not eighteen.** SUB-4 and
SUB-16 were authored in parallel and merged in that order; SUB-16 contributes `SPK-S16-1`, which
this paragraph could not have counted. **9 + 4 + 3 + 2 + 1 = 19 designed, zero executed.** The
figure is stated here rather than left to a reader who would otherwise find two totals and no rule
for combining them.

**Neither this total nor SUB-16's matches SUB-2's, and the mismatch is reported rather than
reconciled in place.** SUB-2's closing note reads *"Cumulative across SUB-1 and SUB-2: twelve spikes
designed"* — 9 + 3, omitting SUB-15's four, which sit in this register between SUB-1's section and
SUB-2's. **SUB-16 records the same correction independently**, from its own position and without
sight of this section; two sub-tasks reaching it separately is corroboration, not a duplicate defect.
No sub-task edits another's entries (`README.md` § "Shared-register append convention"), so SUB-2's
line is left exactly as written and the discrepancy is registered as **`F-S4-6`** for SUB-14 to
reconcile at assembly.

---

### SUB-16

#### `SPK-S16-1` — Is the audit writer mounted on the production deployment at all?

| Field | Value |
| --- | --- |
| **Id** | `SPK-S16-1` |
| **Question** | Is an audit database URL set on the running production container — that is, does `src/transport/http.ts:177`–`:182`'s `if (auditDbUrl)` guard evaluate true there, so that `infrastructure.mcp_request_log` receives rows at all? It has a wrong answer: if the guard is false, every count-based signal in `16_attribution-and-detection.md` §3 has no input, and an empty table is indistinguishable from a deployment that served no traffic. |
| **Why reading could not settle it** | The guard is readable; the **value it reads** is not. `auditDbUrl` resolves from the process environment of a container deployed by SSH plus `docker compose` to a host named by a repository secret. `.env.example` shows the variable's *shape*, never the deployed value, and `.github/workflows/cd-prod.yml` passes secrets it does not print. No repository artifact records what is set on the running host. This is the same class of unreadability `OI-S1-9` records for hosting and monitoring, narrowed to one variable. |
| **Exit condition** | The operator states, for the running production container, whether an audit database URL is **present or absent** — the presence, never the value, which is a credential — and the statement is appended here. **Alternatively**, a single read-only `SELECT count(*) FROM infrastructure.mcp_request_log` returning any value settles it directly: a non-zero count proves the writer is mounted. |
| **Method** | Two routes, either sufficient, both read-only. **(a)** On the deployment host, inspect the running container's environment for the *presence* of `AUDIT_DATABASE_URL` or `DATABASE_URL` and report a boolean — the value is never transcribed, copied or appended anywhere. **(b)** Against the production database, run one read-only aggregate: `SELECT count(*) AS n, min(timestamp) AS first_seen, max(timestamp) AS last_seen FROM infrastructure.mcp_request_log;`. Route (b) is preferred because it needs no host access and because it **also** advances `SPK-S1-5` (whether the table holds rows), so the two can be taken in one connection. **No mutation of any kind**, no `init_agent_context` call, no token minted. |
| **Quarantine path** | Nothing landed under `src/`, `tests/` or `drizzle/`, and nothing was merged as product code. This sub-task changed **zero** files under `src/` and **zero** under `drizzle/`, checked mechanically with `git diff --name-only origin/develop` before every commit. (The task's own spec artifact, which also states the constraint, lives under `_local/` and is gitignored, so it is described rather than cited as a resolvable path.) No scratch tree was created, because the spike was not executed. |
| **Date** | 2026-08-25 — the date execution was determined to be **impossible**. No production credential of any kind was present in the authoring environment: `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` are all unset, so neither route (a) nor route (b) could be attempted. |
| **Result** | **Not executed.** No observation of any kind was taken. Nothing about the deployed configuration is reported here, and no value is inferred from the guard's presence in the source — a guard that exists says nothing about the variable it reads. |
| **Confidence** | **`none`** — there is no result to hold a confidence in. What would raise it: executing either route once. Nothing available in the repository can raise it, because the question is definitionally about state outside the repository. |
| **Expiry** | **2027-02-25** — six months from the design date, or **immediately upon any change to `src/transport/http.ts`'s mount guard or to the deploy workflow's environment handling**, whichever is sooner. |
| **Expiry rationale** | The question is about a deployed environment variable, which can change on any deploy — and the deployment auto-deploys from `develop` on green CI at a measured ≥3.29 restarts/day (`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`). Six months is not a claim that the answer is stable for six months; it is the outer bound at which an unexecuted design should be re-read against a codebase that will have moved, and the mount-guard clause is what actually protects a future reader from citing a stale method. |
| **Routes to** | `93_open-items-and-provisional-register.md` § `OI-S16-1`, which carries the unclosed claim with its named owner. The finding it grounds is `91_findings-register.md` § `F-S16-4`. |

---

**SUB-16 register totals at revision 1:** one spike, `SPK-S16-1`, **designed and not executed**,
carrying a stated method, a stated exit condition, a mandatory expiry with its rationale, and a route
to an owned open item. **One of one** corresponds to the single new open item `OI-S16-1` in
`93_open-items-and-provisional-register.md`, on the same rule SUB-1 applied.

**Cumulative across SUB-1, SUB-2, SUB-15 and SUB-16: seventeen spikes designed, zero executed** —
nine (`SPK-S1-1` … `SPK-S1-9`), four (`SPK-S15-1` … `SPK-S15-4`), three (`SPK-S2-1` … `SPK-S2-3`) and
one (`SPK-S16-1`). **SUB-15's four are counted here.** The preceding SUB-2 note's *"twelve across
SUB-1 and SUB-2"* is accurate for those two sub-tasks and is not amended; this line states the
package total, which is the figure a reader of the evidence base wants. The
`observed-in-production` evidence label has still been used **zero times** anywhere in this package.
This sub-task adds a spike and no observation, which is the same arithmetic SUB-2 reported, and it is
stated here rather than left for a reader to compute. `R13` carries the risk; `CAP-S16-1` caps what
this sub-task's own thresholds may be read to mean in consequence.

**No second record is raised.** `SPK-S16-1`'s route (b) overlaps `SPK-S1-5`'s method deliberately —
one connection settles both — but the **question** is distinct (is the writer mounted, versus does
the table hold learner content), the items are distinct (`OI-S16-1` versus `OI-S1-5`), and neither
spike restates the other's question. The overlap is recorded so that whoever executes either knows
they can close two items in one read-only query.

---

### SUB-8

#### `SPK-S8-1` — Which model provider does production use, and does learner content therefore leave the deployment?

| Field | Value |
| --- | --- |
| **Id** | `SPK-S8-1` |
| **Sub-task** | SUB-8 (NEU-1002) |
| **Question** | What are `EMBEDDING_PROVIDER` and `CLASSIFIER_PROVIDER` set to on the running production container, and — where either resolves to a hosted provider — what is that provider's stated data-processing region? It has a wrong answer in both directions. If a hosted provider is configured, learner chunk content is transmitted outside the deployment on every embedding and every classification, which is a copy `03_learner-data-inventory-and-classification.md` inventories only as data *in transit* and which no erasure in this package reaches. If a local provider is configured, the consent purpose `CP-S8-3` is genuinely severable and may be offered; if not, it is **inseparable from the service** and offering consent for it would capture a consent that cannot be withdrawn — the defect `91_findings-register.md` § `F-S8-1` reports for a different purpose. |
| **Why reading could not settle it** | The **branches** are readable; the **value that selects between them** is not. `src/config/resolve-embedding-config.ts:25` and `src/config/resolve-classifier-config.ts:80` each read a variable from the process environment, and each adapter has a hosted branch (`src/adapters/langchain/embedding-adapter.ts:88`–`:91`; `src/adapters/langchain/content-classifier-adapter.ts:191`, `:199`–`:201`) and a non-hosted one. The container is deployed by SSH plus `docker compose` to a host named by a repository secret; `.env.example` shows the variables' *shape*, never the deployed value, and `.github/workflows/cd-prod.yml` passes secrets it does not print. **No repository artifact records what is set on the running host.** The provider's own processing region is not a repository fact at all. This is the same class of unreadability `OI-S1-9` records for hosting and monitoring, narrowed to two variables — and it is **not** answered by closing `OI-S1-9`, which establishes where the deployment runs and says nothing about where its outbound calls terminate. |
| **Exit condition** | The operator states, for the running production container, the resolved value of `EMBEDDING_PROVIDER` and of `CLASSIFIER_PROVIDER` — **the provider name only, never any key material, which is a credential** — and, for each that names a hosted provider, that provider's stated data-processing region. The statement is appended here. |
| **Method** | **One read-only question to the operator**, plus, if offered, read-only inspection of the running container's environment for the *presence and value of those two variable names only*. `OPENAI_API_KEY` and every other secret is **never** read, transcribed, copied or appended. **No mutation of any kind**: no tool call, no `init_agent_context` (which would mint a `context_tokens` row), no token minted, no request issued to any model provider. A second, weaker route exists and is **declined**: inferring the provider from whether `learning_topics.summary_embedding` is populated would establish only that *some* embedder ran, never which one, and would require a production read for an answer it cannot give. |
| **Quarantine path** | Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`, and nothing was merged as product code. This sub-task changed **zero** files under `src/` and **zero** under `drizzle/`, checked mechanically with `git diff --name-only origin/develop` before every commit. No scratch tree was created, because the spike was not executed. |
| **Date** | 2026-08-25 — the date execution was determined to be **impossible**. No production credential of any kind was present in the authoring environment: `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` are all unset, re-probed at this cutoff, and the operator was not reachable from it. |
| **Result** | **Not executed.** No observation of any kind was taken. Nothing about the deployed configuration is reported, and **no value is inferred from the presence of either branch in the source** — a branch that exists says nothing about which one runs. `08_consent-and-what-a-learner-can-export-and-erase.md` §3 accordingly states `CP-S8-3`'s severability **as a condition** and does not assert which branch the deployment is on. |
| **Confidence** | **`none`** — there is no result to hold a confidence in. What would raise it: executing the single question once. Nothing available in the repository can raise it, because the question is definitionally about state outside the repository. |
| **Expiry** | **2027-02-25** — six months from the design date, or **immediately upon any change to either `resolve-*-config.ts` provider-selection site, to either adapter's provider branching, or to the deploy workflow's environment handling**, whichever is sooner. |
| **Expiry rationale** | The question is about two deployed environment variables, either of which can change on any deploy — and the deployment auto-deploys from `develop` on green CI at a measured ≥3.29 restarts/day (`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`). Six months is not a claim that the answer is stable for six months; it is the outer bound at which an unexecuted design should be re-read against a codebase that will have moved. **The dangerous stale direction here is a negative:** a recorded *"no hosted provider"* would license SUB-9 to close its copy-class enumeration and SUB-12 to drop an external processor from its threat model, and a single environment-variable change would silently falsify both. The code-change clause is what protects against that, not the date. |
| **Routes to** | `93_open-items-and-provisional-register.md` § `OI-S8-1`, which carries the unclosed claim with its named owner. It gates the consent purpose `CP-S8-3` in `08_consent-and-what-a-learner-can-export-and-erase.md` §3, and is consumed by **SUB-9** (NEU-1003) for copy enumeration and **SUB-12** (NEU-1004) for the threat model. |

---

**SUB-8 register totals at revision 1:** one spike, `SPK-S8-1`, **designed and not executed**,
carrying a stated method, a stated exit condition, a mandatory expiry with its rationale, and a route
to an owned open item. **One of one** corresponds to the single new open item `OI-S8-1` in
`93_open-items-and-provisional-register.md`, on the same rule SUB-1 applied.

**Cumulative across SUB-1, SUB-2, SUB-15, SUB-16, SUB-4 and SUB-8: twenty spikes designed, zero
executed** — nine (`SPK-S1-1` … `SPK-S1-9`), four (`SPK-S15-1` … `SPK-S15-4`), three
(`SPK-S2-1` … `SPK-S2-3`), one (`SPK-S16-1`), **two (`SPK-S4-1`, `SPK-S4-2`)** and one (`SPK-S8-1`).
**SUB-4's two are counted here.** The preceding SUB-16 note's *"seventeen"* was the package total at
the moment SUB-16 shipped and is not amended; SUB-4 (NEU-996) landed on `develop` between that note
and this one, so a reader adding one to seventeen would undercount by two. The
`observed-in-production`
evidence label has still been used **zero times** anywhere in this package. This sub-task adds a
spike and no observation, which is the same arithmetic SUB-2 and SUB-16 each reported, and it is
stated here rather than left for a reader to compute. `R13` carries the risk; `CAP-S8-1` caps what
this sub-task's own duties may be read to mean in consequence.

**No second record is raised.** `SPK-S8-1` asks about two environment variables, as `SPK-S16-1` does
about a third — but the **questions** are distinct (which model provider is selected, versus whether
the audit writer is mounted), the items are distinct (`OI-S8-1` versus `OI-S16-1`), the resolving
events are different operator statements, and closing either leaves the other open. The overlap is
recorded so that whoever reaches the operator knows **three** environment facts can be settled in one
conversation.
### SUB-5

**No spike is designed or filed by this sub-task, and the package total is therefore unchanged at
seventeen designed, zero executed.**

This is a result rather than an omission, and it is recorded so SUB-17's audit can see that the
question was asked. A spike is for a question that a bounded, read-only experiment against the real
platform would settle and that no reading can. Every question this sub-task raised fails the first
half of that test:

- **The port surface, the `AppContext` membership, the access-path set for `public.notes`, the two —
  in fact three — write-path invariants, the pool configuration and the tool-surface count** were all
  settled by **reading the repository** at cutoff `cc38cc9`. Each therefore fails the spike
  register's own admission test: *could this have been read instead?* It could, and it was. Three of
  those reads refuted a charter figure (`F-S5-1`, `F-S5-3`, `F-S5-4`), which is precisely the value a
  read delivers and a spike would not.
- **`OI-S5-1`** — whether the RLS second layer's transaction requirement is acceptable against
  `OBJ-1` — would be settled by an observed `t_db`. That measurement is **already owned** by
  `OI-S15-3` and by SUB-15's `SPK-S15-*` entries. Designing an eighteenth spike to measure the same
  quantity would be a second record of a question another sub-task owns, which this register
  forbids.
- **`OI-S5-2`** — who observes `CAP-S5-1`'s landing condition — is settled by a **party being
  named**, not by an experiment. No production access answers it.
- **The `holds` derivation itself** is a design derivation over settled decisions. It could not be
  spiked even in principle: the four changes it composes are unimplemented, so there is nothing
  deployed to observe, and observing the deployment would return the negative result C010 already
  published as `F-S5-4`.

**The one thing that would have been worth a spike, and why it is not one.** Whether any admitted
production token lacks a `sub` — which decides whether `F-S5-5`'s `sub || azp` merge is reachable in
practice rather than merely present in the code — is a real, bounded, read-only question. It is
**already designed** as `SPK-S1-1` and owned by SUB-1, and is tracked as `OI-S1-1` / `OI-S2-2`.
`F-S5-5` cites it rather than re-raising it.

**No production quantity is asserted anywhere in this sub-task's output.** No credential exists in
this environment, no spike was executed, and every cost statement in
`05_the-enforcement-point-that-confines-every-read-and-write.md` §12 is a **round-trip count read
off the code**, never a measurement.

---

**SUB-5 register totals at revision 1:** **zero spikes.** SUB-5 adds none, so the cumulative package
figure is unchanged by this section.

**The cumulative figure itself is reconciled here, because two published totals disagree.** Counting
the entry headings in this register at cutoff `cc38cc9` gives **twenty designed, zero executed**:
SUB-1 nine (`SPK-S1-1` … `SPK-S1-9`), SUB-2 three, SUB-4 two, SUB-15 four, SUB-16 one, SUB-8 one —
9 + 3 + 2 + 4 + 1 + 1 = **20**. SUB-16's totals paragraph states *"seventeen"*, which was the total
with SUB-4's two omitted and before SUB-8 landed; SUB-4's own section already corrected the arithmetic
of its day to **nineteen** and explained why. **This section restates the count rather than repeating
either figure**, because a cumulative total that is only correct on the day it was written is the
defect SUB-4 recorded, not a convention to continue. No predecessor's text is edited — this register
is append-only — and the reconciliation is routed to **SUB-14 (NEU-1007)** under OUT-20, which
aggregates the band.

**Zero second records:** `SPK-S1-1` and `OI-S15-3` are cited from their single owning records rather
than re-designed here.

---

### SUB-6

#### `SPK-S6-1` — Which subject does a real production learner token actually carry, and is it distinct from `azp`?

- **Id:** `SPK-S6-1`
- **Question:** For a token obtained through the **authorization-code** flow the human learner
  actually uses, what is the value of `sub`; is it present and non-empty; and is it distinct from
  `azp`? This is the target subject the backfill of ten tables would write.
- **Why reading could not settle it:** The middleware resolves a principal as `payload.sub || azp`
  at `src/transport/jwt-middleware.ts:127`. The code shows both branches exist; it cannot show which
  one a production token takes. A wrong target silently orphans the operator's own data behind an
  identity they cannot authenticate as, which is exactly why OUT-2 requires the target be *verified
  against a real token*, never inferred.
- **Exit condition:** V1–V7 of `06_the-disposition-of-every-unowned-row.md` §5 all pass, and the
  `sub` value is recorded redacted with its date and issuer. **If `sub` is absent, the spike exits
  with that as its result and the backfill does not run** — an absent `sub` is `H5`'s negative
  answer and invalidates population A's disposition rather than merely delaying it.
- **Method:** Obtain one token from the production Rauthy IdP through the authorization-code flow.
  Decode the payload; read `sub` and `azp` independently. Assert presence, non-emptiness,
  distinctness, and that `azp` is the static client `claude-web` consistent with `F-S2-1`. This is
  the **one registered state-creating exception** OUT-18 permits — issuing a token necessarily mints
  one and writes an IdP audit record — and the residue lands outside the systems this package
  protects. **`init_agent_context` is specifically not covered by that exception** and is not called.
- **Quarantine path:** `_local/scratch/` — gitignored, outside `src/`, `tests/` and `drizzle/`.
- **Date:** — (not executed)
- **Result:** **Not executed.** No `SMOKE_PROD_*`, `AUTH_*` or `VPS_*` credential exists in this
  environment; `.env.example:13` carries only a `localhost` development placeholder.
- **Confidence:** n/a — no result.
- **Expiry:** 90 days from execution.
- **Expiry rationale:** The subject is an IdP configuration fact, which changes only on a
  deliberate change to client registration or claim mapping. Ninety days bounds the window in which
  such a change could go unnoticed; **V7 additionally requires the verification be re-run immediately
  before the backfill executes**, so the expiry is a backstop rather than the primary control.
- **Routes to:** **SUB-13 (NEU-1006)** under OUT-19, which carries V1–V7 as the backfill stage's
  entry condition in its runbook; **SUB-7 (NEU-1001)** under OUT-3, which sequences that stage.
  Tracked against OUT-2's unmet target-subject criterion.

#### `SPK-S6-2` — What do the per-disposition counts and the twelve pathology probes actually return?

- **Id:** `SPK-S6-2`
- **Question:** What are the per-disposition row counts of the 14 production tables, and what does
  each of the twelve published pathology probes return — orphaned foreign keys, encoding anomalies,
  unexpected nulls, duplicates and out-of-range values, per table?
- **Why reading could not settle it:** Counts and data pathologies are properties of the **rows**,
  and no row is readable from this repository. The schema tells you which pathologies are
  structurally foreclosed by a constraint — that analysis is done and published — but it cannot tell
  you which of the remaining ones are actually present.
- **Exit condition:** `Q1`–`Q5` and all twelve `P-*` probes at
  `06_the-disposition-of-every-unowned-row.md` §6 have run and their results are recorded, replacing
  every *not executed — no credential* cell.
- **Method:** Execute the published SQL read-only against production. **Counts and aggregates only,
  never rows** — every statement returns scalars or grouped counts by construction, which is what
  keeps this inside OUT-18's read-only inspection authorization and what makes the no-copied-rows
  closure argument hold. No `SELECT *`, no `LIMIT` sample, no `DISTINCT` over a content column: any
  of those would make an input row-valued and overturn the dataset's exclusion from the sixth copy
  class.
- **Quarantine path:** `_local/scratch/` — gitignored, outside `src/`, `tests/` and `drizzle/`.
- **Date:** — (not executed)
- **Result:** **Not executed.** No `DATABASE_URL` and no production credential of any kind exists in
  this environment.
- **Confidence:** n/a — no result. **No cell may be read as `0`:** an unexecuted probe and a probe
  that returned zero are different states, and conflating them is how a pathology reaches a real
  migration believed absent.
- **Expiry:** 30 days from execution.
- **Expiry rationale:** Deliberately shorter than `SPK-S6-1`'s. Counts and pathology incidence are
  properties of a **live, growing** dataset — the log tables gain rows on every request — so a
  result ages far faster than an IdP configuration fact. Thirty days is also why `R9` requires the
  real migration to **re-run the whole probe set pre-flight** rather than cite this one: by execution
  time the result will almost certainly be stale, and the abort condition keys on the re-run, not on
  this record.
- **Routes to:** **SUB-13 (NEU-1006)** under OUT-19, which inherits the pre-flight re-run and the
  abort condition; **`NEU-896`**, to which `R9` escalates a pathology found at execution time.
  Closes `OI-S6-1` and unblocks `OI-S6-2`.

---

**SUB-6 register totals at revision 1:** **two spikes designed, zero executed** — `SPK-S6-1` and
`SPK-S6-2`.

**The cumulative figure at this sub-task's cutoff is twenty-two designed, zero executed.** SUB-5's
section reconciled the count to **twenty** at cutoff `cc38cc9` by counting entry headings —
SUB-1 nine, SUB-2 three, SUB-4 two, SUB-15 four, SUB-16 one, SUB-8 one. Adding this section's two
gives 20 + 2 = **22** at cutoff `35f92ba`. The figure is stated as a count taken at a named cutoff
rather than as a standing total, for the reason SUB-4 recorded and SUB-5 restated: a cumulative total
is only correct on the day it is written. No predecessor's text is edited — this register is
append-only — and the reconciliation is routed to **SUB-14 (NEU-1007)** under OUT-20.

**Zero executed remains the package-wide figure, and it is the single most consequential fact about
this sub-task's output.** Four of OUT-2's twenty-five traced claims are unmet, and all four are
unmet for this one reason. `observed-in-production` is used **zero** times in
`06_the-disposition-of-every-unowned-row.md`, and no production quantity is asserted anywhere in it.

**Zero second records:** `SPK-S1-1` — whether any admitted production token lacks a `sub` — overlaps
`SPK-S6-1`'s territory and is **cited, not re-designed**. The two are distinct questions and both are
kept: `SPK-S1-1` asks whether the `sub || azp` merge is reachable *at all* across principal shapes,
which is a question about the code path; `SPK-S6-1` asks what the human learner's `sub` *is*, which
is the value a migration writes. A run of either would inform the other, and whoever executes one
should execute both in the same session.

**One divergence in this register is noted rather than resolved.** The front matter records SUB-1 as
owning "every entry in this register outright", but SUB-2, SUB-4, SUB-8, SUB-15 and SUB-16 have each
appended their own entries, and this section follows that established practice. The note is left for
**SUB-14 (NEU-1007)**, which owns how the register reconciles with the band; no predecessor's text is
edited here.
### SUB-11

#### `SPK-S11-1` — Which MCP clients have actually authenticated against the production deployment, by transport and by principal kind?

| Field | Value |
| --- | --- |
| **Id** | `SPK-S11-1` |
| **Sub-task** | SUB-11 (NEU-1004) |
| **Question** | Over a bounded recent window, which distinct MCP clients have authenticated against the production deployment — and for each, **which transport** it arrived on and **which principal kind** its token resolves to under SUB-2's rule (`sub` present → `user`; `sub` absent with `azp` present → `client`)? It has a wrong answer in both directions and the directions cost differently. If the population is **HTTP-only and `user`-kind apart from the CD smoke principal**, then `CH-1`'s STDIO break has no live victims, path 4 of `11_the-client-compatibility-contract.md` §6.3 is large only by construction, and the migration cost of the gate is close to zero. If **any STDIO client exists**, or **any additional `client`-kind principal** holds learner rows, then the break has a named population, the enforcement point's clause-3 refusal has more subjects than the smoke run, and the rollout acquires a communication obligation nothing in the package currently sizes. |
| **Why reading could not settle it** | The repository establishes the **shape** of every path and none of their **occupancy**. `src/config/resolve-transport-config.ts:35` shows STDIO is the default mode; it cannot show whether any process was launched in it. `src/transport/jwt-middleware.ts` shows how a token is admitted; it cannot show which tokens arrived. The one artifact that would carry the answer — `infrastructure.mcp_request_log` — is a **production table**, and whether it is even written is itself unresolved (`OI-S16-1` / `SPK-S16-1`: is the audit writer mounted at all). This is the occupancy half of the same unreadability `CAP-S1-1` states package-wide, narrowed to one question this outcome specifically needs. **It is not answered by closing `SPK-S4-1`**, which asks whether the STDIO edge is *reachable* — a property of the deployment's shape — where this asks whether anyone *used* it. |
| **Exit condition** | For a stated window, a count of distinct authenticated principals broken down by transport and by principal kind, **with no principal identifier and no token material transcribed** — counts and kinds only. Where the audit writer turns out to be unmounted and no such count can be produced, **that** is the recorded result, and it resolves the spike as *unanswerable by this method* rather than leaving it open. The statement is appended here. |
| **Method** | **Read-only.** Either one question to the operator, or a single read-only `SELECT` against `infrastructure.mcp_request_log` aggregating to counts by transport and principal kind over a bounded window. **No mutation of any kind**: no tool call, no `init_agent_context` (which would mint a `context_tokens` row and add to the very population being counted), no token minted, no write to any table. **No identifier is read, transcribed or appended** — the query returns counts, never `sub` values, which are learner keys under `DR-C11-S2-1` and are precisely what a redaction audit exists to catch. A weaker route is **declined**: inferring occupancy from the deploy pipeline's own smoke traffic would measure this package's own instrumentation and nothing else. |
| **Quarantine path** | Not applicable — nothing was executed. Nothing landed under `src/`, `tests/` or `drizzle/`, and nothing was merged as product code. This sub-task changed **zero** files under `src/` and **zero** under `drizzle/`, checked mechanically with `git diff --name-only origin/develop` before every commit. No scratch tree was created, so `LD-S3-31`'s sixth copy class gains **no member** from this sub-task and its membership stays at zero. |
| **Date** | 2026-08-25 — the date execution was determined to be **impossible**. No production credential of any kind was present in the authoring environment: `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` are all unset, re-probed at this cutoff, and the operator was not reachable from it. |
| **Result** | **Not executed.** No observation of any kind was taken. **No client count is asserted anywhere in this sub-task**, in either direction — `11_the-client-compatibility-contract.md` §6.3 classifies paths without claiming any is occupied, and §8 states the population's size and composition as unknown. In particular, path 4 is called *"the largest class"* strictly because it is what happens when nobody chooses — a property of the default at `src/config/resolve-transport-config.ts:35` — and **not** because any census supports it. |
| **Confidence** | **`none`** — there is no result to hold a confidence in. What would raise it: executing the question once. Nothing available in the repository can raise it, because occupancy is definitionally state outside the repository. |
| **Expiry** | **2027-02-25** — six months from the design date, or **immediately upon the STDIO transport gaining a gate, upon any change to `src/config/resolve-transport-config.ts`'s default, or upon the CD smoke principal being re-provisioned**, whichever is sooner. |
| **Expiry rationale** | Six months is not a claim that the client population is stable for six months; it is the outer bound at which an unexecuted design should be re-read against a codebase and a deployment that will both have moved — the deployment auto-deploys from `develop` at a measured ≥3.29 restarts/day (`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`). **The dangerous stale direction is the reassuring one:** a recorded *"no STDIO clients"* would license SUB-7 to sequence `CH-1` as low-risk and a reader to treat `CAP-S11-1` as effectively lifted, and a single new self-hosted installation would silently falsify both without any repository change. The three event clauses are what protect against that, not the date — and the first of them fires precisely when the answer stops being measurable in the old terms. |
| **Routes to** | `94_caps-and-incomplete-scope.md` § `CAP-S11-1`, which carries the unobserved-population limit with its named owner and its lifting condition. It bounds `11_the-client-compatibility-contract.md` §6.3's path classification and §8's negative guarantee, and is consumed by **SUB-7** (`NEU-1001`) under OUT-3, whose stage sequencing depends on the size of the broken class, and by **SUB-12** (`NEU-1005`) under OUT-17, whose threat model ranges over the same paths. |

---

**SUB-11 register totals at revision 1:** one spike, `SPK-S11-1`, **designed and not executed**,
carrying a stated question, a stated exit condition, a read-only method with an explicitly declined
weaker route, a mandatory expiry with its rationale, and a route to an owned cap.

**One of one corresponds to a cap rather than to an open item**, and the departure from the usual
rule is deliberate. SUB-1's convention routes a spike to the open item it would close; this spike's
question cannot be closed by any party inside the package or by any work in the repository, which is
the definition of a cap rather than an open item. Its two open items (`OI-S11-1`, `OI-S11-2`) are
correspondingly **not** spiked, because each is settled by work — a test written, a design decision
taken — and not by observation.

**Cumulative, re-derived by enumerating this register's own section headings — and stated at two
moments, because the register moved between this sub-task's cutoff and its merge.**

- **At cutoff `35f92ba`, plus this sub-task: twenty-one designed, zero executed** — nine
  (`SPK-S1-1` … `SPK-S1-9`), four (`SPK-S15-1` … `SPK-S15-4`), three (`SPK-S2-1` … `SPK-S2-3`), one
  (`SPK-S16-1`), two (`SPK-S4-1`, `SPK-S4-2`), one (`SPK-S8-1`) and **one (`SPK-S11-1`)**. SUB-5
  filed zero and is counted at zero.
- **In the merged register: twenty-three designed, zero executed** — the above plus **SUB-6's two**
  (`SPK-S6-1`, `SPK-S6-2`), which landed on `develop` after this sub-task's cutoff and before its
  merge. **A reader counting the register gets 23**, and that is the figure to cite for the package.

**Both are stated deliberately.** Publishing only 21 would leave a figure a reader can falsify by
counting; publishing only 23 would present as re-derived here a number this sub-task's own
enumeration never saw. **Neither is carried forward by adding to a predecessor's note** — which is
the method `F-S4-6` prescribes after this same total was reported as twelve, sixteen, seventeen,
eighteen and twenty by five authors on four different bases, and the reason a cumulative figure in
this register is worth re-deriving rather than incrementing. No predecessor's text is edited; this
register is append-only, and reconciling the running notes across authors stays routed to **SUB-14
(NEU-1007)** under OUT-20.

**The `observed-in-production` evidence label has still been used zero times anywhere in this
package**, and this sub-task adds a spike and no observation. `R13` carries the `n = 1` evidence
risk and is cited rather than restated; `CAP-S11-1` caps what this sub-task's own contract may be
read to mean in consequence.

**Zero second records:** `SPK-S4-1` (is the STDIO edge reachable) and `SPK-S16-1` (is the audit
writer mounted) are cited from their single owning records rather than re-designed here, even though
all three questions would be settled by reaching the same operator. The overlap is recorded so that
whoever reaches them knows **four** production facts can be settled in one conversation — the two
above, `SPK-S8-1`'s provider question, and this one.

---

### SUB-9

#### `SPK-S9-1` — Which external provider actually receives learner content in production, and on what retention and deletion terms?

- **Id:** `SPK-S9-1`
- **Question:** For the two outbound call sites that carry learner content — the embedding adapter and the content classifier — **which provider endpoint does the production deployment actually reach, and what are that provider's retention, deletion and sub-processing terms for the content it receives?** The question has a wrong answer: a provider that retains submitted content for training, or that offers no deletion path, makes `F-S9-1`'s exposure materially worse than one with a zero-retention API tier.
- **Why reading could not settle it:** Reading settles the *client libraries* and **rules one thing in that a first pass missed** — there are **two** embedding branches, not one: `new OpenAIEmbeddings` (`src/adapters/langchain/embedding-adapter.ts:89`) and `new OllamaEmbeddings` (`:118`), selected by `provider` at `:71`–`:72`, plus the classifier's `new ChatOpenAI` (`content-classifier-adapter.ts:199`). What reading **cannot** settle is which branch production runs and where it points. Both resolve from environment variables that are **unset in this environment**; the Ollama branch's `baseUrl` comes from `OLLAMA_BASE_URL` (`src/config/resolve-embedding-config.ts:34`) with a **self-hosted default** of `http://localhost:11434` (`src/domain/config/embedding-defaults.ts:11`), so the answer to *"does learner content leave the deployment at all"* is configuration-dependent and could legitimately be **no**. A base URL override, a proxy or a self-hosted compatible endpoint all read identically in the source. Contractual retention terms are not in the repository at all, under any reading.
- **Exit condition:** The production configuration is read and the receiving endpoint identified for both adapters, **and** the corresponding provider's data-retention terms for API submissions are recorded — or the operator states that no such content is sent because the feature is disabled in production.
- **Method:** Read the production environment's classifier and embedding configuration (endpoint, model, account tier) from the deployment's compose environment, without invoking either adapter. Record the resolved endpoint per adapter. Then record the provider's published API data-retention policy for that tier, with its retrieval date. **No learner content is submitted, and no call is made through either adapter** — this is a configuration read plus a document read, and the spike must not exercise the egress path it exists to characterise.
- **Quarantine path:** Nothing lands under `src/`, `tests/` or `drizzle/`; nothing is merged as product code. Any captured configuration is redacted of key material and held at `_local/scratch/`, under `LD-S3-31`'s recorded terms. **If any capture is taken, the sixth copy class acquires its first member** and `09_proving-a-data-right-reaches-every-copy.md` §7.5's routing applies — the class's terms attach at that instant.
- **Date:** **Not executed.** Determined impossible to execute on 2026-08-26: no production credential, configuration access or deployment access of any kind exists in this environment.
- **Result:** **None.** No endpoint is identified and no retention term is recorded. `F-S9-1` therefore names the exposure and its owner without characterising its severity, and **no claim about which provider production actually uses, or on what terms, appears anywhere in this sub-task's output.** The *existence* of the three learner-content call sites is a code fact and is asserted (`F-S9-1`); their *destination and terms* are not.
- **Confidence:** **none.** Confidence would be raised to `high` by reading the production configuration directly; it cannot be raised at all by any further reading of the repository, which is what makes this a spike rather than an open item about the code.
- **Expiry:** **2027-02-26**, six months from design. Also expires immediately on any change to either adapter's client construction or configuration resolution.
- **Expiry rationale:** Provider retention terms and account tiers change on the provider's schedule, not this package's, and a term quoted long after it was read is a claim about the past presented as a claim about the present. Six months is the shortest interval over which the answer is likely to remain true and the longest over which the question stays worth asking unchanged. The adapter-change clause is separate because a configuration change can invalidate the endpoint answer overnight while leaving the terms answer intact.
- **Routes to:** **`F-S9-1`** in `91_findings-register.md`, which carries the unclosed exposure. **It routes to no new open item** — `F-S9-1` already carries the owner and the escalation route, and a second record would give SUB-14's cross-register check two ids for one gap.

---

**SUB-9 register totals at revision 1:** **one spike designed, zero executed** — `SPK-S9-1`.

**The cumulative figure is given at two named points, because this sub-task's chapter and its branch
sit at different ones and one number for both would be wrong at one of them.**

| Point | Distinct `SPK-` ids | `####` headings | `##` headings | Executed |
| --- | --- | --- | --- | --- |
| Cutoff `ee0a750` — this chapter's cutoff, before this section's own entry | **22** | 20 | 2 | **0** |
| This branch at HEAD, after merging `origin/develop` @ `7450bfb` and adding `SPK-S9-1` | **24** | 21 | 3 | **0** |

The 22 decomposes as SUB-1 nine, SUB-2 three, SUB-4 two, SUB-15 four, SUB-16 one, SUB-8 one, SUB-6
two, agreeing with SUB-6's arithmetic at `:673`–`:679`. The 24 adds SUB-11's `SPK-S11-1`, merged from
`develop` while this sub-task was in flight, and this section's `SPK-S9-1`.

**The two methods disagree by exactly the number of `##`-level entries, and that number is not
stable:** it was two at `ee0a750` (`SPK-S16-1` at `:447`, `SPK-S8-1` at `:491`) and is three at HEAD,
SUB-11's entry being the third. A heading-count therefore undercuts the id-count by three today and
by more tomorrow. Registered as **`F-S9-2`** and routed to **SUB-14 (NEU-1007)**, which owns register
reconciliation and is the only party that may normalise a heading level in a merged file. **No
predecessor's text is edited here** — this register is append-only, and repairing the three headings
in place would mean rewriting SUB-16's, SUB-8's and SUB-11's sections.

The figure is stated as a count taken at a named cutoff rather than as a standing total, for the
reason SUB-4 recorded and SUB-5 and SUB-6 each restated: a cumulative total is only correct on the
day it is written. The running chain is eighteen → nineteen → twenty → twenty-two → twenty-three,
and every step was a real correction rather than drift.

**Zero executed remains the package-wide figure, and it is what forces this sub-task's proof into
the form it takes.** Propagation cannot be demonstrated against a real copy, so
`09_proving-a-data-right-reaches-every-copy.md` §4 argues it instead — a closure over write paths
with a stated falsifier — and registers `SPK-S9-1` as the deferred observation for the one thing the
argument cannot reach. `observed-in-production` is used **zero** times in `09_…md`, and **no
production quantity is asserted anywhere in it**: no row count, no population size, no backup fact.

**Zero second records.** `SPK-S8-1` — which model provider does production use, and does learner
content therefore leave the deployment — overlaps `SPK-S9-1`'s territory and is **cited, not
re-designed**. The two are distinct questions and both are kept: `SPK-S8-1` asks *whether* content
leaves the deployment, which is a question about the code path and which this sub-task has now
answered statically in the affirmative at `09_…md` §4.4; `SPK-S9-1` asks *what happens to it after
it arrives*, which is a question about a third party and which no reading of this repository can
settle. A run of either would inform the other, and whoever executes one should execute both in the
same session.

---

### SUB-12

**Eight spikes. None executed.** Every one first fails the *"could this have been read from the
repository instead?"* test, which is why the threat model's many readable constants became cited
`file:line` facts rather than spikes. Each carries a question, a method, a mandatory expiry and
`Result: not executed` rather than a substituted answer.

#### `SPK-S12-1` — Does any second process share the production database?

- **Question.** Does the off-repo `docker compose` stack define any container besides the MCP server
  and Postgres that holds a database credential — a worker, a cron container, a sidecar, a log
  shipper?
- **Why it cannot be read.** The compose stack is unversioned and **lives outside this repository**
  (charter assumption 21). No reading of this repository at any cutoff can enumerate it. This is
  extension shape `X-2`, and it also closes `X-4` (an unregistered scheduled job).
- **Method.** Read-only: `docker compose config` on the host, plus `docker ps`. Non-mutating; no
  database access required.
- **Owner.** The creator, as sole maintainer and sole operator. **Expiry:** 90 days from execution, or
  on any change to the compose stack, whichever is sooner.
- **Result:** **not executed.** No `VPS_*` credential exists in this environment.

#### `SPK-S12-2` — Does the production database carry any server-side execution object?

- **Question.** Does any trigger, rule, function-backed view, foreign data wrapper, publication or
  logical-replication slot read or write a learner table?
- **Why it cannot be read.** Such an object is created through a direct database session and leaves
  **no artifact under `src/` or `drizzle/`**. This is the one extension shape (`X-3`) that
  `DR-C11-S12-1`'s ingress argument is structurally unable to close, and it is the reason `F-S12-5`
  is a **blocking finding** rather than a caveat.
- **Method.** Read-only catalogue queries: `pg_trigger` joined to `pg_class` over the learner tables;
  `pg_rules`; `pg_proc` for functions referenced by views; `pg_foreign_table`; `pg_publication` and
  `pg_replication_slots`. **A negative result is a result and must be recorded as one.**
- **Owner.** The creator, as sole maintainer and sole operator. Escalates to **`NEU-896`**, since a
  second writer to the production database is a program-level fact. **Expiry:** 90 days.
- **Result:** **not executed.** No `DATABASE_URL` exists in this environment.
- **Open item:** `OI-S12-1`.

#### `SPK-S12-3` — Has any Tier-2 verdict field ever tripped in production?

- **Question.** Has `tier2.circuit_breaker_tripped` ever been emitted, for which field, and what were
  the prior-week counts at the time?
- **Why it matters and what it does not decide.** It would establish whether `F-S12-1`'s channel has
  ever been *exercised*. **`F-S12-1` does not depend on the answer** — the finding is about what the
  deployment permits, which is read off four code facts. What the spike would settle is the volume
  required to trip a field, which this chapter deliberately states no number for.
- **Method.** Read-only: `SELECT` over `infrastructure.operation_event_log` where
  `event = 'tier2.circuit_breaker_tripped'`, plus the `classifier.tier2_blocked` weekly distribution.
  **Note the retention interaction** — a 30-day window (`F-S9-6`) may already have deleted the
  evidence, and a null result must therefore be reported as *inconclusive*, not as *never tripped*.
- **Owner.** The creator, as sole maintainer and sole operator. **Expiry:** 60 days — shorter than the
  others because the retention window is actively destroying the evidence.
- **Result:** **not executed.**

#### `SPK-S12-4` — What is the deployed value of `OLLAMA_BASE_URL`, and which embedding provider does production actually run?

- **Question.** Is the embedding provider OpenAI or Ollama in production, and if Ollama, does
  `OLLAMA_BASE_URL` point at a local host or an external one?
- **Relation to `SPK-S8-1` and `SPK-S9-1`, stated so no second record is raised.** `SPK-S8-1` asks
  *which provider* production uses and `SPK-S9-1` asks *what the provider retains*. **Both are cited,
  not re-designed.** This spike asks a third, narrower thing that neither covers: **the configured
  destination value**, which is what `GATE-S12-13` measures. Whoever executes any of the three should
  execute all three in the same session.
- **Method.** Read-only: read the effective environment of the running container.
- **Owner.** The creator, as sole maintainer and sole operator. **Expiry:** 90 days, or on any change
  to the deployment's environment.
- **Result:** **not executed.**

#### `SPK-S12-5` — What is the container log driver, and what is its retention?

- **Question.** Which logging driver does the production container use, what rotation and retention
  does it apply, and who can read the resulting files?
- **Why it matters.** `F-S9-5` establishes that learner free text reaches stderr unredacted, and that
  under STDIO stderr is the **sole** copy. The retention of that copy is the one thing that would make
  `GATE-S12-14` settable, and SUB-9 explicitly declined to claim anything about it.
- **Method.** Read-only: `docker inspect` the running container's `LogConfig`, plus the daemon's
  default. Non-mutating.
- **Owner.** The creator, as sole maintainer and sole operator; escalates to **`NEU-896`**.
  **Expiry:** 90 days.
- **Result:** **not executed.**

#### `SPK-S12-6` — How many database roles exist, and can an operator session be distinguished from an application session?

- **Question.** Does the production database have a separate operator role, or does the operator
  connect as the application's own role? What grants does each hold?
- **Why it matters.** `GATE-S12-15` requires operator database access to be attributable. If one role
  serves both, operator activity is **indistinguishable from application activity at the database
  level**, and the gate's threshold is not merely unmet but unmeasurable.
- **Method.** Read-only: `\du`, plus `information_schema.role_table_grants` over the learner tables.
- **Owner.** The creator, as sole maintainer and sole operator. **Expiry:** 90 days.
- **Result:** **not executed.**

#### `SPK-S12-7` — Does any `linter_validation_corpus` row quote learner content verbatim?

- **Question.** SUB-5 excludes `LinterValidationRepository` from owner scoping because its tables are
  *"keyed to a rule id, not to a learner"*, and states the falsifying condition: *"If a corpus entry
  is ever found to quote learner content verbatim, this row is wrong and the route is a finding back
  to this chapter"* (`05_the-enforcement-point-that-confines-every-read-and-write.md:339`). Does any
  row meet it?
- **Why it cannot be read.** The corpus's `chunk_id` foreign key to `learning_chunks.id` is
  establishable from the schema and **is** established (`F-S12-9`). Whether a row's *content* columns
  reproduce learner text is a property of the rows, not the schema, and no credential exists.
- **Method.** Read-only `SELECT` over `infrastructure.linter_validation_corpus`, sampling content
  columns and comparing against the referenced `learning_chunks` rows. **Non-mutating.** A negative
  result is a result.
- **Owner.** The creator, as sole operator, for the observation; the finding routes to **SUB-5**
  (NEU-997) as author of the exclusion. **Expiry:** 90 days.
- **Result:** **not executed.**

#### `SPK-S12-8` — What production credential files exist on the host, and who holds them?

- **Question.** `package.json:29` ships `db:studio:prod`, which reads `.env.prod`. What credential
  files exist on the deployment host, what do they grant, and who can read them?
- **Why it cannot be read.** `.gitignore:18` excludes `.env.*`, so no such file is in the repository,
  and **an environment-variable probe cannot see a credential file** — which is the specific
  limitation §5.3 records against this chapter's own `F-S1-2` re-probe.
- **Method.** Read-only: list `.env*` files on the host and in the deploy directory, and report their
  ownership and mode. **Do not read or transcribe their contents** — the redaction discipline of
  `LD-S3-31` applies, and a transcribed credential would create the exposure the spike exists to
  measure.
- **Owner.** The creator, as sole maintainer and sole operator; escalates to **`NEU-896`**.
  **Expiry:** 90 days. **Gate:** `GATE-S12-23`.
- **Result:** **not executed.**

**Package spike total at this cutoff.** Counted mechanically over this file rather than inherited:
**24 designed before this section, 8 added here, 32 designed in total, zero executed.** The figure has
moved four times across the package's history — the register narrates the drift as a recurring
self-correction (`F-S4-6`, `F-S9-2`) rather than as an error — and **each figure is only correct on
the day it is written**. This one is correct at `57aeba3` on this branch, and a reader should recount
rather than cite it forward.

**Zero spike results are invented and no upstream spike's conclusion is restated.** `SPK-S8-1`,
`SPK-S9-1`, `SPK-S15-3`, `SPK-S15-4` and `SPK-S16-1` are referred to by id only. In particular
**`SPK-S16-1` is cited, not re-filed**, as the evidence source for `GATE-S12-19`: whether the audit
writer is mounted in production is SUB-16's question and keeps SUB-16's id.

### SUB-13

#### `SPK-S13-1` — What PostgreSQL major version does the production deployment run?

- **Id:** `SPK-S13-1`
- **Question:** The major version of the PostgreSQL server the production `DATABASE_URL` connects to.
- **Why reading could not settle it:** The repository's own compose pins `pgvector/pgvector:pg16` (`docker-compose.yml:3`), and that file describes the **local development** stack. The production compose stack is **outside this repository** — `.github/workflows/cd-prod.yml:15` and `:26`–`:30` deploy by SSH into `/home/deploy/docker-services/second-memory-mcp`, whose contents are not in the tree — so nothing in the repository fixes the production image tag, and the local tag is not evidence about it. `drizzle.config.ts` names a dialect, not a version.
- **Why it matters, specifically:** Two constructs in the published DDL require **PostgreSQL 12 or later**, and each has a materially worse fallback. **(a)** The generated column `context_tokens.learner_key` (`13_the-ddl-the-migration-plan-and-the-runbook.md` §2.2), which is what closes `R-S4-1` structurally on the token row; without it the fallback is an application-written column plus a `CHECK`, which is `DR-C11-S13-1` rejected alternative 5 and is strictly weaker, because an application-written copy can disagree with `principal_kind` on a row. **(b)** The scan-skipping three-step `SET NOT NULL` at §3.6, whose absence makes `S5` a scan under `ACCESS EXCLUSIVE` per table plus a second implicit scan, on the boot clock, ten times (`F-S13-5`).
- **Method:** **Read-only, one statement, no mutation.** `SELECT version();` against the production database, or equivalently `SHOW server_version_num;`. Alternatively, and needing no database connection at all, the image tag recorded in the off-repo compose file, reported by the operator. Either route answers it. Nothing is created, altered or deleted; no token is minted; no row is read.
- **Result:** **Not executed.** No production credential exists in the authoring environment — `DATABASE_URL` and `VPS_*` were probed and are unset (`F-S1-2`).
- **Expiry:** **2026-11-26.**
- **Expiry rationale:** The same basis as `SPK-S1-1` — the unobtainability is a property of the authoring environment, not of the deployment. This entry additionally expires on **any change to the off-repo compose stack's image tag**, which can happen with no repository change at all and which is exactly the event that would invalidate a previously-captured answer.
- **Owner:** **The creator**, as the only party with access to the production database and to the off-repo compose stack.
- **Why this is not a second record of an existing spike:** `SPK-S1-4` asks *whether the production schema matches the repository's migration set* — a question about applied migrations, answerable in full without knowing the engine version, and unchanged by it. `SPK-S1-9` asks about **hosting region, provider, TLS termination, monitoring and log-shipping** — the deployment's surroundings, not its database engine. Neither asks for the server version and neither's answer contains it. The overlap is in the **access** each needs, not in the question: whoever runs `SPK-S1-4` is already connected and should run this in the same session, exactly as `SPK-S16-1`'s route (b) was noted to advance `SPK-S1-5`.

---

**SUB-13 register totals at revision 1:** one spike, `SPK-S13-1`, **not executed**, with a read-only
method, a mandatory expiry, an expiry rationale and a named owner. One rather than several, and
deliberately so: this sub-task needed three production facts and **two of them were already
registered by predecessors**, so it cites them by id and raises no competing record. The per-table row
counts that would price `T2` and `T7` are **`SPK-S6-2`** — *"What do the per-disposition counts and
the twelve pathology probes actually return?"* — SUB-6's, and the exact question `A-S13-1`'s first
re-validation trigger names. The restart duration that would convert the slice budget into an
`OBJ-8` check is **`SPK-S15-1`** — *"How long is the service unavailable across one deploy
restart?"* — SUB-15's, and the second trigger. Designing an eighteenth or nineteenth entry to ask
either again would have given SUB-14's cross-register check two ids for one question, which is the
failure the one-id-per-fact rule exists to prevent.

**The register's running total is already owned, and this entry adds one to it rather than
re-counting it.** SUB-9 records the current figure as **twenty-four at its branch's HEAD**, and
twenty-two at cutoff `ee0a750`, as **`F-S9-2`** (`09_proving-a-data-right-reaches-every-copy.md:85`)
— together with the standing fact that **zero spikes have executed**. `SPK-S13-1` makes it
**twenty-five**, all still unexecuted, and that increment is the only count this sub-task states.
It raises **no second record of the total**: a re-derived tally here would give SUB-14's
cross-register consistency check two ids for one quantity, which is the failure the one-id-per-fact
rule exists to prevent, and `F-S9-2` is the id.

Two things follow that are worth naming for **SUB-14** (NEU-1007), which aggregates. First, this file carries **several** earlier cumulative tallies — twenty, twenty-one, twenty-two and
twenty-three among them — and **none of them is an error**. Each is scoped to the sub-tasks that had
landed when it was written, and appending to an append-only register does not falsify a historical
statement. They are simply easy to misread as current, and there is more than one of them, which is
why naming a single figure would itself have been misleading. **`F-S9-2` is the entry that is
current**, and this entry adds one to it. Second, `observed-in-production` remains applied to **zero** claims package-wide,
and this sub-task applies it to none.
