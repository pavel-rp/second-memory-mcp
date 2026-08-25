# `93` — Open items and provisional register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

## What this register records

| Field | What it records |
| --- | --- |
| **Id** | `OI-S<n>-<k>` |
| **Item** | The `[unconfirmed]` claim or provisional reliance, stated as a claim rather than a topic. |
| **Status** | `[unconfirmed]` or `provisional`. |
| **Source** | The citation that establishes the item exists. |
| **Consumer** | The sub-task that must act on it. |
| **Owner** | Who is accountable for resolving it. |
| **Resolving event** | The observable event that closes it. Never a date. |
| **Why not a stand-in** | The admission-rule check: a stand-in records an assumption the architecture provisionally rests on, with a tolerance envelope and an invalidating outcome. An open item records an unanswered question. |

## An open item and a stand-in are not the same record

Two of the items below — `OI-S1-8` (backups) and `OI-S1-9` (hosting, TLS, monitoring, log shipping)
— are paired with a stand-in entry (`A-33`, `A-34`) in `95_stand-in-assumption-register.md`. **This
is not the same fact recorded twice.**

- The **open item** is the unanswered question, and is the single record of the *fact*. It is what
  SUB-15, SUB-7 and SUB-9 cite.
- The **stand-in** is what the architecture provisionally *assumes* while the question is open,
  with its tolerance envelope, its invalidating outcome and its re-validation trigger.

The stand-in's re-validation trigger is the open item's resolving event, so the two close together.
Neither register carries a second record of the other's content.

---

### SUB-1

#### `OI-S1-1` — The `client_credentials` principal's real claim set is unobserved

- **Id:** `OI-S1-1`
- **Item:** For the CI smoke principal, `sub` is believed absent-or-null and `azp` believed to carry the client identity, but no decoded claim set from the production Rauthy IdP has been observed. The belief rests on a code comment in `src/transport/jwt-middleware.ts`, not on an observation.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-1` — designed, not executed; no credential available.
- **Consumer:** SUB-2 (NEU-994), which must decide which claim becomes the persisted learner key and whether it identifies a human. OUT-1 and OUT-5 rest on it.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party holding `SMOKE_PROD_CLIENT_ID` / `SMOKE_PROD_CLIENT_SECRET`.
- **Resolving event:** The grant in `SPK-S1-1`'s method is run and its decoded, redacted claim set is appended to the spike register.
- **Why not a stand-in:** It is a question with an obtainable answer and no tolerance envelope — the claim set is whatever it is, and the identity rule turns on the actual value rather than on a range the architecture could tolerate.

#### `OI-S1-2` — The pre-registered static client's real claim set is unobserved, and the client is unnamed

- **Id:** `OI-S1-2`
- **Item:** The deployment is believed to configure a statically registered client whose `aud` is hardcoded by Rauthy to the OAuth `client_id` and admitted via `AUTH_ADDITIONAL_AUDIENCES`, but neither which client that is nor what its token carries has been observed.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-2`; `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` establishes the form but not the deployment's configuration.
- **Consumer:** SUB-2 (NEU-994). OUT-1 and OUT-5.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** The operator names the configured static client and the grant in `SPK-S1-2`'s method is run, with the decoded claim set appended to the spike register.
- **Why not a stand-in:** Two concrete unknowns with obtainable answers — an identity and a value. Neither admits a tolerance envelope.

#### `OI-S1-3` — The DCR client's real claim set is unobserved, and it is the shape OUT-1 and OUT-5 most need

- **Id:** `OI-S1-3`
- **Item:** For a dynamically registered connector client carrying `aud = dyn$<random>`, whether `sub` is present, and whether it identifies a human, is unobserved. ADR-0001 establishes only that such a client can never carry `aud = <resource URL>`.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-3` — the shape is **not obtainable from the `client_credentials` endpoint** and requires capture from an existing authenticated connector session.
- **Consumer:** SUB-2 (NEU-994), directly and load-bearingly. OUT-1 and OUT-5.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party with an authenticated connector session.
- **Resolving event:** A decoded, redacted claim set captured from a real connector session is appended to the spike register.
- **Why not a stand-in:** It is the single most load-bearing unknown in the identity half and has an obtainable answer. **What OUT-1 and OUT-5 must assume in its absence** is stated rather than left implicit: that a DCR principal may present with **no `sub` at all**, so the identity rule must be total over the `sub`-absent case and must not treat `azp` as human-identifying without evidence. That assumption is SUB-2's to carry and state; SUB-1 records only that it is required.

#### `OI-S1-4` — Whether the production schema matches the repository's migration set is unobserved

- **Id:** `OI-S1-4`
- **Item:** The live schema may have drifted from a replay of `drizzle/`. Drift is a live possibility rather than a theoretical one, because the migrator runs unconditionally at every boot with no guard and no lock.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-4`. The unguarded boot-time migration is C010's finding, cited not re-derived: `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`.
- **Consumer:** SUB-13 (NEU-1006), which authors the DDL and migration plan; SUB-6 (NEU-1000), whose dry-run is generated from the real schema.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** A read-only `information_schema` dump is taken and diffed against a migration replay, with the diff appended to the spike register.
- **Why not a stand-in:** A schema either matches or it does not; there is no envelope of tolerable drift stated anywhere, and any drift found would be acted on rather than accommodated.

#### `OI-S1-5` — Whether `infrastructure.mcp_request_log` holds learner-derived content in production is unobserved

- **Id:** `OI-S1-5`
- **Item:** The `params` and `response_body` columns are free-form and the writer stores whole request params and up to 65,536 bytes of response body, but what real production rows actually contain is unobserved.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-5`; writer at `src/transport/pg-audit-transport.ts`; schema at `drizzle/0010_create_infrastructure_mcp_request_log.sql` and `drizzle/0012_extend_mcp_request_log.sql`.
- **Consumer:** SUB-16 (NEU-999), which determines the two log tables' privacy classification. SUB-3 (NEU-995) records the classification as conditional and names SUB-16 as its resolver.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** A redacted sample of real rows is taken read-only and appended to the spike register.
- **Why not a stand-in:** **Determining the classification is SUB-16's, not SUB-1's.** This item carries only the missing observation, and an observation has no tolerance envelope.

#### `OI-S1-6` — Whether `infrastructure.operation_event_log` holds learner-derived content in production is unobserved

- **Id:** `OI-S1-6`
- **Item:** The `data` JSONB column is free-form; what real production rows contain is unobserved.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-6`; writer at `src/transport/pg-event-transport.ts`; schema at `drizzle/0013_create_operation_event_log.sql`.
- **Consumer:** SUB-16 (NEU-999). SUB-3 (NEU-995) records the classification as conditional.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** A redacted sample of real rows is taken read-only and appended to the spike register.
- **Why not a stand-in:** As `OI-S1-5`.

#### `OI-S1-7` — `context_tokens` population in production is unobserved

- **Id:** `OI-S1-7`
- **Item:** Whether `context_tokens` holds rows at all, their age and expiry distribution, and whether expired rows accumulate without bound, are all unobserved.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-7`; schema at `src/infrastructure/db/schema.ts`.
- **Consumer:** SUB-4 (NEU-996), which binds the context token to a principal; SUB-13 (NEU-1006), which must migrate the table.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** Three read-only aggregate queries are run and their results appended to the spike register. **`init_agent_context` is not used to probe this** — it would mint a row and is a mutation.
- **Why not a stand-in:** A count is an observation, not an assumption the architecture rests on.

#### `OI-S1-8` — Whether production database backups exist is unestablished

- **Id:** `OI-S1-8`
- **Item:** No backup of the production database has been shown to exist. Nothing in the repository establishes one, and a negative repository result cannot distinguish *no backups* from *backups arranged outside the repository*. Contents, location, rotation and restore behaviour are all consequently unknown.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-8`. C010 recorded the same negative repository result at its own cutoff: `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`.
- **Consumer:** **SUB-15** (NEU-998), which cannot set an RPO/RTO objective without it; **SUB-7** (NEU-1001), for every rollback action that assumes a restore; **SUB-9** (NEU-1003), which populates its backups column by citation.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** The operator states whether backups exist and, if so, their contents, location, rotation period and whether a restore has ever been exercised — recorded in the spike register.
- **Why not a stand-in:** The *fact* is a question with an obtainable answer. The *assumption resting on it* — charter assumption 33, "backups exist for the production database" — is separately carried as the stand-in `A-33`, which is where the tolerance envelope and invalidating outcome live.

> **This is the single register record of the backups fact.** SUB-15, SUB-7 and SUB-9 each cite
> `OI-S1-8`; none raises a second record of the same question, so the package never carries four ids
> for one fact. SUB-1 asserts only that its own entry exists and carries a stable id — whether each
> of those three in fact cites it rather than restating it is each of their own acceptances, at
> positions 6, 9 and 11.

#### `OI-S1-9` — Hosting region, provider, TLS termination, monitoring and log-shipping arrangements are unestablished

- **Id:** `OI-S1-9`
- **Item:** Where production runs, under which provider and region, where TLS is terminated, what monitoring and alerting exist, and where logs are shipped, are all unknown. The repository reveals only an SSH-plus-`docker compose` deploy to a host named by a secret.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S1-9`. C010 recorded the same as `CAP-S10-1` / `OI-S1-3` in `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`; C011 cites that rather than re-deriving it.
- **Consumer:** **SUB-15** (NEU-998), which sets numeric operational objectives against the platform the product actually runs on; **SUB-16** (NEU-999), whose detection design needs to know where signals can be observed; **SUB-7** (NEU-1001) and **SUB-9** (NEU-1003).
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** The operator states provider, region, TLS-termination point, monitoring/alerting arrangement and log-shipping destination, each as a named value or an explicit "none" — recorded in the spike register.
- **Why not a stand-in:** The *facts* are questions with obtainable answers. The *assumption resting on them* — charter assumption 34 — is separately carried as the stand-in `A-34`.

---

**SUB-1 register totals at revision 1:** nine open items, `OI-S1-1` … `OI-S1-9`, every one carrying a
named owner and an observable resolving event. Zero carry a blank owner. Nine of nine correspond
one-to-one with the nine spike entries in `96_spike-register.md`.
