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
