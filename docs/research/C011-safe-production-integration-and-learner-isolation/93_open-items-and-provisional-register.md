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

---

### SUB-3

#### `OI-S3-1` — Controller/processor role, and the lawful basis each processing purpose rests on

- **Id:** `OI-S3-1`
- **Item:** Two halves of **one** question. Whether the operator of this deployment is a controller, a processor, or a joint controller with respect to learner data; and, following from that, which lawful basis each processing purpose stated in `03_learner-data-inventory-and-classification.md` §4–§8 actually rests on. The inventory states a **position** per category — contract for the learning-service categories, legitimate interests for the operational and quality categories — but a position is an engineering judgement about which basis *would* apply, not a determination that it does. **This package cannot make that determination and does not.**
- **Status:** `[unconfirmed]`
- **Source:** `03_learner-data-inventory-and-classification.md` §1 (field 3 of the entry shape, named *"Lawful basis (position)"*), §0 and §15 (the framing constraint, stated and repeated); charter intake Q4's ratified GDPR-shaped baseline, which requires any duty turning on a legal determination to be recorded as a named open item with an owner.
- **Consumer:** **SUB-8** (NEU-1002), which defines what consent covers and what learners can export and erase, and which **cites this id rather than raising a second record of the same question** — keeping its own distinct cross-border-transfer determination as a separate open item with its own id and owner. **SUB-9** (NEU-1003), whose propagation matrix rests on which duties actually attach. **SUB-12** (NEU-1004) for the threat model's regulatory assumptions.
- **Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can obtain or commission a legal determination about a deployment they alone run, and the only party with standing to state the controller/processor role. This is the owner that `R10`'s escalation route in `92_risk-register.md` points at; that entry could not carry a route at all unless this item named someone, which is why this sub-task is the record-holder.
- **Resolving event:** The owner states, in a record appended to this register or to `96_spike-register.md`, (a) the controller/processor role for learner data on this deployment, and (b) for each processing purpose the inventory names, the lawful basis relied on — each as a named value or an explicit "not determined". On that event, every entry's field 3 in the inventory is re-read against the determination, and SUB-8's consent and erasure design is checked against it.
- **Why not a stand-in:** It is an unanswered question with an obtainable answer, and the architecture does not provisionally rest on any particular answer — the inventory is written so that **the classification survives whichever basis is determined**, because a category's data class, personal-data status, purpose, minimization position and derivation do not change with its lawful basis. There is no tolerance envelope to state and no invalidating outcome that would break the inventory, so this is an open item and not a stand-in. What *would* change is what SUB-8 may build on it, which is why SUB-8 is the named consumer.

**One question, one id, one owner.** This sub-task raises **exactly one** open item, and deliberately does **not** raise a second record of anything already owned elsewhere. In particular: whether the two log tables actually hold learner-derived content in production is **`OI-S1-5`** and **`OI-S1-6`**, already owned by SUB-1 — cited in `03_learner-data-inventory-and-classification.md` §0, §5 and §12 rather than re-asked here; whether the live schema matches `drizzle/` is **`OI-S1-4`**; whether `NEU-850`'s *"every core table"* ranges over the two port-less log tables is **`OI-S5-1`**, owned by `NEU-850`, whose adopted reading is carried as the stand-in **`A-S3-1`** rather than as an open item of this package's own; and what the `context_tokens` row must carry beyond its three columns is **`OI-S8-1`**, owned by `NEU-984` (`SUB-10 of C010`). Each is consumed by citation. The same-id-in-two-registers check SUB-14 runs cannot catch two ids for one question, which is why the discipline is stated here explicitly.

---

**SUB-3 register totals at revision 1:** one open item, `OI-S3-1`, carrying a named owner and an
observable resolving event, and zero blank fields. **Zero second records** of a question already
owned by another sub-task or another package.
### SUB-15

**What is deliberately absent from this section.** SUB-15 raises **no open item about whether
production database backups exist**, and **no open item about hosting, region, TLS termination,
monitoring or log shipping**. Both are already recorded exactly once, by SUB-1, at `OI-S1-8` and
`OI-S1-9` above. SUB-15 **cites** those ids — in `15_operational-objectives-for-the-real-platform.md`
§1, §5 and §6, and in `F-S15-1` — and raises no second record of either fact. The four items below
are questions SUB-15's own capacity model raised and nobody else has recorded.

#### `OI-S15-1` — The unavailability duration of a single deploy restart is unmeasured

- **Id:** `OI-S15-1`
- **Item:** How long the service is unavailable across one `docker compose up -d --build` deploy, including image rebuild, container replacement, boot-time migration and the health poll reaching green, has never been measured. The deploy workflow polls for health, so the duration is in principle observable at deploy time, but no measurement is recorded anywhere.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S15-1` — designed, not executed; no access to the host or to a deploy run. Deploy shape from charter assumption 21 and `.github/workflows/cd-prod.yml`.
- **Consumer:** **SUB-15** itself — `OBJ-8` in `15_operational-objectives-for-the-real-platform.md` §4 states what each availability target *would require* of this number and asserts **no availability percentage** without it. **SUB-16** (NEU-999), whose detection design needs to know what a normal restart looks like before it can flag an abnormal one.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** One deploy is timed from container stop to health-poll green, and the duration is appended to the spike register.
- **Why not a stand-in:** It is a duration with an obtainable answer and no tolerance envelope — the design does not rest on the restart being any particular length; it simply cannot state an availability percentage until the number exists.

#### `OI-S15-2` — The concurrently active learner population the objectives are sized for is unstated

- **Id:** `OI-S15-2`
- **Item:** How many learners the deployment is intended to serve concurrently has never been stated by anyone. All product-foundation evidence is single-tenant (`n = 1`, the creator), and C011's own production-evidence base is `n = 0` (`F-S1-2`). Without a target population, the capacity model can compute where the platform breaks but cannot say whether that is enough.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S15-2`. Paired with the stand-in `A-S15-1` in `95_stand-in-assumption-register.md`, which carries what the design provisionally assumes while this is open, with its tolerance envelope and invalidating outcome.
- **Consumer:** **SUB-15** — every objective in §4 is a *ceiling*, and whether a ceiling is adequate is a question only a target population answers. **SUB-7** (NEU-1001), whose rollout stages are checked against these objectives. **`NEU-896`** at convergence, where the adequacy question actually belongs.
- **Owner:** The creator, as sole maintainer and sole operator — and, for the adequacy decision rather than the number, `NEU-896` at convergence.
- **Resolving event:** A target concurrent-learner population is stated for the deployment and appended to the spike register, or `NEU-896` records that no such target is being set.
- **Why not a stand-in:** The **question** is unanswered and is recorded here; the **assumption the model provisionally rests on** while it stays open is separately carried as `A-S15-1`, which is where the tolerance envelope and invalidating outcome live. The two are the pairing this register's own preamble describes, not one fact recorded twice.

#### `OI-S15-3` — Mean per-call database service time in production is unobserved, and it is the term the whole capacity band turns on

- **Id:** `OI-S15-3`
- **Item:** The mean time a tool call holds a Postgres connection (`t_db`) is unobserved in production. It is the single unobserved term in the first-break threshold `N ≥ 2 / t_db`, and it is why the capacity band spans **2 to 200** concurrently active learners rather than resolving to a value.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S15-3`. The nearest cited bound is non-production: `tests/performance/content-retrieval.test.ts:85,145,230,306`, which are single-request, concurrency-1 regression guards against a real test database, i.e. **upper bounds the code is known to satisfy** rather than measurements of typical service time.
- **Consumer:** **SUB-15** — `OBJ-3` (the aggregate ceiling that has no value), `OBJ-5` (concurrent latency, unsettable) and the entire §3 band. **SUB-16** (NEU-999), which cannot set a detection threshold on a quantity with a two-order-of-magnitude range.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** Per-call database service time is sampled from production over a bounded window and its distribution appended to the spike register.
- **Why not a stand-in:** It is a measurable quantity with an obtainable answer. The design does not rest on `t_db` having any particular value — it rests on knowing it, and until then publishes a band rather than a number.

#### `OI-S15-4` — The per-entry memory footprint of a live session, and the host RAM it would be measured against, are unknown

- **Id:** `OI-S15-4`
- **Item:** How much memory one entry in the `transports` / `sessionIdentity` pair holds is unmeasured, so the entry count at which the eviction gap recorded in `F-S15-3` becomes a real memory problem cannot be stated. The host RAM figure it would be compared against is separately unknown and is **cited from `OI-S1-9`**, not re-recorded here.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S15-4`; the maps and their single eviction path at `src/transport/http.ts:82-83`, `:212-218`.
- **Consumer:** **SUB-15** — §3.2 names the break mode and states **no entry count**; `R-S15-2` carries the residual. **SUB-16** (NEU-999), for detection; **SUB-4** (NEU-996), which touches the same session lifecycle.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** A heap sample is taken from the running process with a known live-session count, and the per-entry footprint is appended to the spike register.
- **Why not a stand-in:** A footprint is an observation, not an assumption the architecture rests on. The design tolerates any footprint; it cannot state a threshold without one.

---

**SUB-15 register totals at revision 1:** four open items, `OI-S15-1` … `OI-S15-4`, every one
carrying a named owner and an observable resolving event. **Zero carry a blank owner.** Four of four
correspond one-to-one with the four spike entries `SPK-S15-1` … `SPK-S15-4` in
`96_spike-register.md`. **Zero restate the backups fact or the hosting facts** — those are `OI-S1-8`
and `OI-S1-9`, cited and not duplicated.

---

### SUB-2

**Cross-package id disambiguation.** `OI-S1-2` denotes **two different facts** — C010's human-`sub`
question and C011's static-client claim set. Registered as `F-S2-2` in `91_findings-register.md`.
The rule adopted here and used below: a cross-package open item is always written **qualified**
(*C010's `OI-S1-2`*); a bare `OI-S1-2` always means this package's own.

#### Disposition of **C010's `OI-S1-2`** — owned here; design half discharged; evidence half **not closable** at this revision

- **Item:** `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:74`–`:83` — *"The authenticated subject a token yields may be an OAuth client, not a human learner."* List B question `H5`.
- **Ownership:** **`NEU-893`** — this package. `SUB-12 of C010 (NEU-986)` moved it at C010's completeness gate: *"Owner moves to `NEU-893`; it is List B question `H5`"* (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615`). The original entry's `Owner:` line at `:81` still reads `SUB-5 (NEU-975)` **only** because no C010 sub-task edits another's entry under C010's append-only convention. **That is a convention artefact, noted once here and once in `02_identity-the-learner-key-and-principal-kind.md` §9 so a reader of the entry alone is not misled — and no ownership finding is routed against it.**
- **Design half — discharged.** *What does the system do when the authenticated subject is an OAuth client rather than a human?* Answered: kind `client`, admitted as a service principal, owns no learner state, refused on any learner read or write (`decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md`; `02_identity-the-learner-key-and-principal-kind.md` §3). No downstream sub-task carries this as an open question.
- **Evidence half — not closable.** The item's own resolving event (`:82`) is *"A live production token is inspected and its `sub` claim recorded."* **No token was inspected, for any shape** — `SPK-S1-1` … `SPK-S1-3` all record `Result: not executed` (`96_spike-register.md`), and no production credential exists (`91_findings-register.md` § `F-S1-2`; `94_caps-and-incomplete-scope.md` § `CAP-S1-1`).
- **Status:** **`[unconfirmed]`, owned here, open.** It is **not** recorded as closed, because there is no observed value to close it with. The gap between the acceptance condition that asked for a closure and the evidence base available at this position is registered as **`F-S2-3`**, not absorbed.
- **What now closes it:** C011's `OI-S1-1`, `OI-S1-2` or `OI-S2-2` closing with a decoded claim set — `OI-S2-2` most directly, since it covers the shape the production learner actually arrives on.
- **Stand-in:** `A-S2-1` in `95_stand-in-assumption-register.md` carries the assumption resting on it, with a named owner and a re-validation trigger.

#### Disposition of **`OI-S5-2`** — **CLOSED**

- **Item:** `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:213`–`:222` — *"Whether the resolved identity will carry its `sub`-versus-`azp` provenance, so check `I5` is answerable at all."* Status was `provisional`. Owner (`:220`): **`NEU-893`** — *"it is a property of the identity mechanism, and this package decides the invariant, not the mechanism."*
- **Its resolving event** (`:221`): *"NEU-893 publishes its identity mapping stating whether the resolved principal carries its kind — and what the system does with a principal of kind `client`: reject it, map it to a learner, or admit it as a service principal holding no learner state. Any of the three closes the item; leaving the kind undetermined does not."*
- **Discharged, clause by clause:** an identity mapping is published (`02_identity-the-learner-key-and-principal-kind.md` §3); it states that the resolved principal **does** carry its kind, with storage site, readership and entitlement (§6; `decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`); it selects **the third** of the three named dispositions for a `client`-kind principal — admitted as a service principal holding no learner state (`decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md`); and the kind is **determined**, from `sub` presence, with three exhaustive outcomes.
- **Status:** **closed.**
- **Why it closed with zero production observations:** it was always a **design** question. C010 routed it to `NEU-893` because the identity *mechanism* had no owner, not because an observation was missing — its resolving event names three design acts and asks for no evidence. That is the exact contrast with C010's `OI-S1-2` above, which asks for a token and therefore stays open.

#### `OI-S2-1` — Rauthy's `sub` stability, uniqueness, re-issue behaviour and format are unestablished

- **Id:** `OI-S2-1`
- **Item:** Whether the `sub` claim is stable for one principal across sessions and token re-issues; whether a released `sub` is ever re-assigned to a different principal; and whether its format is an opaque identifier or a human-meaningful value such as an email address. **Nothing in the repository states any of the four** — ADR-0001 addresses `iss` and `aud` only, and `sub` does not appear in it.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S2-1` — designed, not executed; no credential and no operator channel. `02_identity-the-learner-key-and-principal-kind.md` §5 records the four properties and their dispositions.
- **Consumer:** **SUB-6** (NEU-1000), whose backfill needs a stable target; **SUB-5** (NEU-997), whose confinement predicate is keyed to it; **SUB-3** (NEU-995) and **SUB-8** (NEU-1002), for which the *format* answer decides whether the ownership column is itself personal data; **SUB-13** (NEU-1006), which must choose the column's type and width.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party who can inspect a token or state the IdP's configuration.
- **Resolving event:** A decoded, redacted claim set is obtained for at least one principal across **two** separate token issuances and appended to the spike register, together with the operator's statement of Rauthy's subject-recycling behaviour.
- **Why not a stand-in:** Four concrete properties with obtainable answers and no tolerance envelope — a `sub` claim value is either stable or it is not, and the design does not accommodate a range. The *exposure* resting on the re-use limb is carried separately as `R-S2-1` in `92_risk-register.md`, which is where the severity and mitigation live.

#### `OI-S2-2` — Whether the named production static client `claude-web` issues tokens carrying a human `sub`, and under which grant

- **Id:** `OI-S2-2`
- **Item:** ADR-0001 names `claude-web` as the production claude.ai connector's manually provisioned static client, so this — not the DCR shape — is the production learner path (`91_findings-register.md` § `F-S2-1`). What remains unobserved is whether its tokens carry a `sub`, whether that `sub` identifies a natural person, and which grant type it uses. **The repository establishes the client's identity but not its claim set**, and the inference "a connector flow has a human at it" is an inference about the flow's shape, not a reading of a token.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S2-2`. `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67` establish the client's identity; `.env.example:63` corroborates. **This narrows C011's `OI-S1-2`**, whose first limb — *which client is it* — is now answered from the repository; the claim-set limb survives here.
- **Consumer:** **SUB-2** itself (this chapter, which labels its shape-2 expectation `[unconfirmed]` against it); **SUB-6** (NEU-1000), which needs the operator's real learner key as its backfill target; and it is the **most direct closer of C010's `OI-S1-2`**, since it covers the shape the human actually arrives on.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party with an authenticated claude.ai connector session.
- **Resolving event:** A decoded, redacted claim set captured from a real authenticated `claude-web` connector session is appended to the spike register, with `sub` recorded as present-and-human-identifying, present-and-opaque, or absent, and the grant type stated.
- **Why not a stand-in:** A question with an obtainable answer and no tolerance envelope. The assumption resting on it — that the production learner flow yields a human `sub` — is separately carried as the stand-in `A-S2-1`.

#### `OI-S2-3` — Whether the DCR (`dyn$`) path carries any production traffic at all

- **Id:** `OI-S2-3`
- **Item:** ADR-0001's NEU-909 amendment records that the production connector authenticates as the static client `claude-web` *"rather than DCR"*. Whether any principal reaches the deployment on the `dyn$` path today is therefore unknown: the middleware still admits it (`src/transport/jwt-middleware.ts:80`, `:83`), but no evidence shows it is used. The question is not which rule applies — the rule is total over both — but **how load-bearing the DCR branch is**.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S2-3`; `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`; `91_findings-register.md` § `F-S2-1`. Raised by SUB-2 because SUB-1's `OI-S1-3` presumes the DCR shape is the load-bearing learner path, which the amendment puts in doubt.
- **Consumer:** **SUB-7** (NEU-1001), whose rollout stages need to know which client paths a transport change can break; **SUB-11** (NEU-1005), whose backward-compatibility contract is written over the clients that actually exist; **SUB-12** (NEU-1004), whose threat model covers the admitted-but-unused `dyn$` acceptance rule as a standing surface.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **Resolving event:** The operator states whether any `dyn$`-prefixed client is registered with the production Rauthy instance and whether any has authenticated, or a read-only inspection of the IdP's registered clients is recorded in the spike register.
- **Why not a stand-in:** A question of fact about the deployment with an obtainable answer. **It does not gate the identity rule** — §3's mapping is total over both paths — so nothing here rests on it as an assumption; it changes only the priority of `OI-S1-3` and the scope of SUB-7's and SUB-11's contracts.

---

**SUB-2 register totals at revision 1:** three new open items, `OI-S2-1` … `OI-S2-3`, each with a
named owner and an observable resolving event; **zero** carry a blank owner. Two dispositions of
inherited C010 items recorded: **`OI-S5-2` closed**, **C010's `OI-S1-2` owned here and open** on its
evidence half. **Three of three** new items correspond one-to-one with the three spike entries
`SPK-S2-1` … `SPK-S2-3` in `96_spike-register.md`, on the same rule SUB-1 applied.

---

### SUB-4

*`NEU-996`, covering `OUT-7` and `OUT-13`. Three new open items, plus five dispositions of C010
records this sub-task touches — one **resolved here**, three **supplied-to**.*

#### Disposition of **`BND-S4-17`** — **RESOLVED HERE**

- **Item:** C010's record of the STDIO trust boundary that meets the trust-boundary test and that **nothing enforces** — class *trust — unenforced*, owner recorded as **`nobody`** (`../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:197`).
- **Disposition:** **Resolved here.** `OI-S8-2`'s resolving event, at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`, admits three parties who may name an owner for `BND-S4-17` — `NEU-893`, `SUB-10 (NEU-984)` and `NEU-896`. This chapter is `NEU-893`'s, and the decision at `04_the-stdio-identity-gate-and-the-bound-context-token.md` §3 **is** that naming. The owner named is **`SUB-10 of C010 (NEU-984)`, co-named `NEU-896`** — the party that already owns `OI-S8-2`, `OI-S8-1` and `CC-S8-3`. The boundary now has the owner its own blocking open item has.
- **The classification is `resolved here`, not `owned and resolved here`.** `BND-S4-17` was never C011's to own; what this sub-task supplies is the naming act. **SUB-17** (NEU-1008) records the classification in the resolved-here class, and `04_the-stdio-identity-gate-and-the-bound-context-token.md` §11 is the source it rests on.
- **The citation is `OI-S8-2`'s, never `OI-S8-1`'s.** `OI-S8-1`'s resolving event is a different event at `:418` — *a migration adding a principal column landing on `origin/develop`*. Charter rounds 1–5 mis-attributed `:429`; charter assumption 51 records the correction, and this entry applies it.
- **Which limb fired:** limb **one**, a party is named. Limb two — a STDIO identity mechanism landing on `origin/develop` — has **not** fired and cannot fire from this package, which writes no file under `src/` or `drizzle/`.

#### Disposition of **`OI-S8-2`** and **`CC-S8-3`** — **supplied-to**, open, not claimed

- **Items:** *"STDIO has no gate to extend, and `CC-S8-3` has no owner"* (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:421`–`:430`), and the named, classified and priced core change it records (`../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:233`, `:552`).
- **Disposition:** **Supplied-to.** `04_the-stdio-identity-gate-and-the-bound-context-token.md` §3 supplies the gate mechanism and §9.1 supplies the breaking-change position with its stage set. Neither is claimed: both stay with **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`** (`:428`, `:614`).
- **Whether `OI-S8-2` now closes** on limb one of its own resolving event is **that owner's to record**, not this sub-task's. Firing another package's resolving event is an act this sub-task can perform; closing another package's open item on its behalf is not.

#### Disposition of **`OI-S8-1`** — **supplied-to**, and it **remains open**

- **Item:** *"`context_tokens` names no principal, so the obligated identity binding has nothing to bind to"* (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:410`–`:419`). Owner **`SUB-10 of C010 (NEU-984)`** (`:417`), co-named `NEU-896` (`:614`).
- **Disposition:** **Supplied-to, and open.** `04_the-stdio-identity-gate-and-the-bound-context-token.md` §4 and `decision-records/DR-C11-S4-2_what-the-context-token-row-carries.md` supply the mechanism — three columns, the mint-time write, the staged nullability. Its resolving event (`:418`) requires *a migration landing on `origin/develop` together with a mint path that binds and refuses to mint unbound*, and this package writes no file under `src/` or `drizzle/` by constraint. **It therefore remains open, and that is the correct outcome rather than a shortfall.**

#### Disposition of **C010's deployment-shape question on STDIO reachability** — planned against, not answered

- **Item:** Whether the unenforced STDIO edge is reachable in the production deployment. C010 declines to decide it and routes it to `SUB-10 of C010 (NEU-984)` (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485`).
- **Disposition:** **Not answered here, and not needed here.** `04_the-stdio-identity-gate-and-the-bound-context-token.md` §12 states which answer the decision planned against — **reachable**, the conservative one — and why the decision stands either way: C010 states the invariant's verdict is unconditional on reachability, and `TRANSPORT` defaults to `stdio` (`src/config/resolve-transport-config.ts:35`) so unreachability is one unset variable from being false. Carried as **`A-S4-2`** and **`SPK-S4-1`**, never as a closed question.

#### `OI-S4-1` — The STDIO principal identifier and its declared kind are unstated, and no operator has been asked

- **Id:** `OI-S4-1`
- **Item:** `DR-C11-S4-1` clause 2 requires a STDIO process to be launched with a principal identifier and an **explicitly declared** principal kind. Neither value exists anywhere — not in `.env.example`, not in any deployment artifact in this repository, and not in any statement by the operator. What is open is not whether the mechanism works but **whether the party who would operate a STDIO deployment accepts a configured principal at all**, and if so what identifier they would use and which kind they would declare it.
- **Status:** `provisional`
- **Source:** The design at `04_the-stdio-identity-gate-and-the-bound-context-token.md` §3, §5. No configuration surface for it exists at `5111841`.
- **Consumer:** **SUB-7** (NEU-1001), whose rollout has to include the configuration step, and **OUT-19**, whose runbook has to name the value.
- **Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can state it.
- **Resolving event:** **The operator states the STDIO principal identifier and its declared kind**, or states that no STDIO deployment will be operated. Either is observable and either closes the item; the second closes it by making `A-S4-2`'s tolerance the operative reading rather than by answering the question.
- **Why not a stand-in:** Nothing rests on a particular answer. The mechanism is total over both — a declared `user` kind yields a learner key, a declared `client` kind yields a service principal refused learner state — so this changes what a deployment *does*, never whether the design holds.

#### `OI-S4-2` — Whether the deploy pipeline's smoke suite can be re-scoped without losing its regression value

- **Id:** `OI-S4-2`
- **Item:** `F-S4-3` establishes that the CD smoke run calls gated learner-state tools with a `client_credentials` token and will be refused once the service-principal rule is enforced. Three routes out are named in `R-S4-2`. What is open is **which of them is actually available**: whether a suite restricted to the three exempt tools plus a service-principal path still detects the regressions the current suite detects, or whether the smoke principal must instead be re-provisioned as a `user`-kind static client.
- **Status:** `provisional`
- **Source:** `.github/workflows/cd-prod.yml:145`–`:174`; `tests/smoke/smoke.test.ts:195`, `:206`, `:237`. Read at `5111841`.
- **Consumer:** **SUB-7** (NEU-1001), which must sequence the fix before the enforcement stage, and **SUB-11** (NEU-1003), whose compatibility contract covers the tool surface the suite exercises.
- **Owner:** **The creator, as sole maintainer and sole operator** — owner of the workflow, the `SMOKE_PROD_*` credentials and the suite.
- **Resolving event:** **A re-scoped smoke suite lands on `origin/develop`** exercising only exempt tools plus a service-principal-appropriate path, **or** the smoke principal is re-provisioned as a `user`-kind static client and its claim set is recorded in `96_spike-register.md`. Either is observable; the item closes when one occurs and names which.
- **Why not a stand-in:** It is a question of fact about an artifact in this repository with an obtainable answer, and nothing in the identity rule is assumed on it. It gates a **release**, not a decision.

#### `OI-S4-3` — Whether audit logging can be made transport-invariant without an Express dependency

- **Id:** `OI-S4-3`
- **Item:** `DR-C11-S4-1` clause 4 obligates audit parity across transports. `F-S4-4` establishes that both the audit and gate middlewares are Express `RequestHandler`s and that no STDIO transport module exists to attach either to. What is open is whether a transport-neutral seam is extractable at acceptable cost, or whether audit parity has to be achieved some other way — or descoped with an argument.
- **Status:** `provisional`
- **Source:** `src/transport/audit-middleware.ts:23`; `src/transport/context-token-middleware.ts:43`; `src/transport/main.ts:55`–`:59`. Read at `5111841`.
- **Consumer:** **SUB-16** (NEU-999), which owns request attributability, and **SUB-11** (NEU-1003) for the core-change contract.
- **Owner:** **SUB-16 (NEU-999)**, co-named **`NEU-896`** at convergence, since an unattributable transport spans this package's boundary.
- **Resolving event:** **A transport-neutral middleware seam lands on `origin/develop`**, or SUB-16 publishes a stated position that audit parity is achieved by another means or is descoped with its reason and owner. Either is observable.
- **Why not a cap:** An available party settles it and the event is observable. It is not the invariant's unprovability, which is `CAP-S5-1`'s and, for this sub-task's transport limb, `CAP-S4-1`'s.

---

**SUB-4 register totals at revision 1:** three new open items, `OI-S4-1` … `OI-S4-3`, each with a
named owner and an observable resolving event; **zero** carry a blank owner. **Five** dispositions
of C010 records recorded: **`BND-S4-17` resolved here**; **`OI-S8-2`**, **`CC-S8-3`** and
**`OI-S8-1`** each **supplied-to and open**; and C010's own deployment-shape question on STDIO
reachability recorded as **planned-against rather than answered** — the fifth, and deliberately in
none of the four split-fidelity classes, because it is a question C010 declined to answer rather
than a residual id this package touches.

**The one-to-one open-item-to-spike rule SUB-1 applied is deliberately not met here, and the
divergence is stated rather than left to look like an omission.** Three new open items correspond to
**two** spikes. `OI-S4-2` has no spike because it fails the *"could this have been read instead?"*
test that `R14` and `DR-C11-S1-2` impose: it was settled as a fact by reading
`tests/smoke/smoke.test.ts:206` and `:237`, and what remains open is a **judgement about regression
value**, which no bounded read-only experiment against production can produce. Filing a spike for it
would have been a spike standing in for a decision.

---

### SUB-16

**What is deliberately absent from this section.** SUB-16 raises **no open item about where a signal
can be observed** — no monitoring, alerting or log-shipping question of its own. That is recorded
exactly once, by SUB-1, at **`OI-S1-9`** above, which names SUB-16 as a consumer by name. SUB-16
**cites** it — in `16_attribution-and-detection.md` §3, §4 (`ME-S16-5`) and §9, and in
`92_risk-register.md` § `R-S16-2` — and raises no second record. Likewise: whether either log table
holds learner-derived content in production is **`OI-S1-5`** / **`OI-S1-6`**, cited in
`16_attribution-and-detection.md` §5.3 and in
`decision-records/DR-C11-S16-2_the-audit-log-privacy-determination.md` decision 7; the audit-entry
arrival rate is **`OI-S15-3`** (SUB-15); the controller/processor role and the lawful basis each
purpose rests on is **`OI-S3-1`** (SUB-3), cited in `R-S16-4`'s escalation route; and what a normal
restart looks like is **`OI-S15-1`**, which already names SUB-16 as a consumer. Each is consumed by
citation. The single item below is a question SUB-16's own detection design raised and nobody else
has recorded.

#### `OI-S16-1` — Whether the audit writer is mounted in production at all is unobserved

- **Id:** `OI-S16-1`
- **Item:** The audit middleware is mounted only when an audit database URL resolves — `src/transport/http.ts:177`–`:182` guards the mount with `if (auditDbUrl)`. Whether `AUDIT_DATABASE_URL` or `DATABASE_URL` is in fact set in the production environment is not discoverable from the repository. If neither is, **no audit row is written at all**, and the resulting empty table is indistinguishable from one belonging to a deployment that served no traffic.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S16-1` — designed, **not executed**; no access to the host, the deploy secrets or a running container. Guard site at `src/transport/http.ts:177`–`:182`; the writer itself at `src/transport/pg-audit-transport.ts`. Recorded as a finding at `91_findings-register.md` § `F-S16-4`.
- **Consumer:** **SUB-16** itself — every count-based signal in `16_attribution-and-detection.md` §3 has **no input** if the writer is unmounted, and fails silently rather than reporting that it has none. **SUB-7** (NEU-1001), whose rollout stages depend on a signal having an input before the stage they gate. **SUB-12** (NEU-1004), for which *"the audit writer is mounted"* is a production gate rather than an assumption.
- **Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party with access to the deployed environment.
- **Resolving event:** The operator states whether an audit database URL is set on the running production container — as a named value's *presence or absence*, never the value itself, which is a credential — recorded in the spike register. A row count from `infrastructure.mcp_request_log` would also settle it, and that count is already sought by `OI-S1-5`, so the two close together if `SPK-S1-5` is ever executed.
- **Why not a stand-in:** It is a binary fact about a deployed configuration, with an obtainable answer and no tolerance envelope — the writer is mounted or it is not, and there is no band of partial mounting the design could accommodate.
- **Why this is not a second record of `OI-S1-9`:** `OI-S1-9` asks **where a signal can be observed** once emitted — hosting, region, TLS termination, monitoring, log shipping. `OI-S16-1` asks whether anything is **emitted at all**. They have different resolving events (an operator statement about arrangements versus an operator statement about one container's environment), different failure consequences (an unrouted signal versus a signal with no input), and closing either leaves the other open. The one-question-one-id contract is satisfied by keeping them apart, and the distinction is written out here so SUB-14's cross-register check has something to check rather than a judgement to make.

---

**SUB-16 register totals at revision 1:** one open item, `OI-S16-1`, carrying a named owner and an
observable resolving event, and zero blank fields. **Zero second records** of a question already
owned by another sub-task or another package — six inherited items are consumed by citation and
named above. **One of one** corresponds to the single spike entry `SPK-S16-1` in
`96_spike-register.md`, on the same rule SUB-1 applied.

---

### SUB-8

**What is deliberately absent from this section.** SUB-8 raises **no open item about the
controller/processor role or the lawful basis each processing purpose rests on.** That is recorded
exactly once, by SUB-3, at **`OI-S3-1`** above, which names SUB-8 as its consumer by name and states
that SUB-8 *"cites this id rather than raising a second record of the same question"*. SUB-8 cites it
— in `08_consent-and-what-a-learner-can-export-and-erase.md` §0, §5 (field 3), §9 (the exception
table's basis column) and §15, and in `decision-records/DR-C11-S8-1_the-consent-record-and-the-consent-boundary.md`
and `decision-records/DR-C11-S8-2_export-erasure-and-the-completion-deadline.md` — and raises **no
second record**.

Likewise, and each consumed by citation from its single owning record: whether either log table holds
learner-derived content in production is **`OI-S1-5`** / **`OI-S1-6`** (SUB-1); whether the live
schema matches `drizzle/` — which bounds the export's completeness claim — is **`OI-S1-4`** (SUB-1);
the `context_tokens` population that `deleteExpired()`'s unwired status lets accumulate is
**`OI-S1-7`** (SUB-1); whether the audit writer is mounted at all is **`OI-S16-1`** (SUB-16); and
where production runs, together with whether the 30-day cleanup script is in fact scheduled there, is
**`OI-S1-9`** (SUB-1). The single item below is a question SUB-8's own consent and export design
raised and nobody else has recorded.

#### `OI-S8-1` — Whether learner content leaves the deployment to a third-party model provider, and into which jurisdiction

- **Id:** `OI-S8-1` — **this package's own.** See the collision note below.
- **Item:** Two halves of **one** question, which resolve on the same event. **(a)** Which model provider the production deployment actually uses. Both adapters select one at runtime — `src/config/resolve-embedding-config.ts:25` reads `EMBEDDING_PROVIDER` and `src/config/resolve-classifier-config.ts:80` reads `CLASSIFIER_PROVIDER` — and each has an OpenAI branch that transmits learner content to an external service (`src/adapters/langchain/embedding-adapter.ts:88`–`:91`; `src/adapters/langchain/content-classifier-adapter.ts:191`, `:199`–`:201`) and a non-OpenAI branch that does not. **Which value production sets is not discoverable from the repository.** **(b)** Following from that, whether a cross-border transfer of learner data occurs at all, and into which jurisdiction — which depends on the provider's own processing region as well as on the deployment's.
- **Status:** `[unconfirmed]`
- **Source:** `96_spike-register.md` § `SPK-S8-1` — designed, **not executed**; no access to the deployed environment. The two config sites and the two adapter branches above, read at cutoff `d2e2b55`. `08_consent-and-what-a-learner-can-export-and-erase.md` §3 (`CP-S8-3`), where the consent purpose this gates is defined.
- **Consumer:** **SUB-8** itself — `CP-S8-3`, the third consent purpose, is **severable only if a local provider is available**, so whether consent may be offered for it at all turns on (a). **SUB-9** (NEU-1003), whose propagation matrix must know whether a copy of learner content exists outside the deployment before it can claim to have enumerated the copies. **SUB-12** (NEU-1004), for which an external processor receiving unbounded learner free text is a threat-model input and a gate.
- **Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can read the deployed environment, and the only party with standing to state the transfer position for a deployment they alone run.
- **Resolving event:** The operator states, for the running production container, the value of `EMBEDDING_PROVIDER` and `CLASSIFIER_PROVIDER` — the **provider name**, never any key material — and, where either is a hosted provider, that provider's stated data-processing region. Recorded in the spike register. On that event, `CP-S8-3`'s severability is settled, and the transfer determination either becomes unnecessary (no hosted provider) or acquires the facts it needs.
- **Why not a stand-in:** Two concrete facts about a deployed configuration, each with an obtainable answer and **no tolerance envelope** — a provider is one thing or the other, and the design does not accommodate a range. What the design *does* do while it is open is decline to assert either branch: `08_…md` §3 states the rule and does **not** claim which branch the deployment is on.
- **Why this is not a second record of `OI-S1-9`, `OI-S3-1` or `OI-S16-1`:** three different questions with three different resolving events, and closing any one leaves the others open. **`OI-S1-9`** asks where the *deployment* runs — hosting, region, TLS, monitoring, log shipping; it says nothing about whether data leaves that deployment for a third party, and a fully answered `OI-S1-9` would not tell you which model provider is configured. **`OI-S3-1`** asks the *legal* questions — controller/processor role and lawful-basis selection; this item asks a **factual** one about a configuration value, and its answer is an input to that determination rather than part of it. **`OI-S16-1`** asks whether the audit writer is mounted. The distinction is written out here so SUB-14's cross-register check has something to check rather than a judgement to make.

**The `OI-S8-1` id collides in shape with a C010 record, and the collision is disclosed rather than
renumbered.** **C010's `OI-S8-1`** is *"`context_tokens` names no principal, so the obligated identity
binding has nothing to bind to"*
(`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:410`–`:419`),
owned by **`SUB-10 of C010` (NEU-984)**. It is a different record on a different subject with a
different owner. This is the same class of hazard `91_findings-register.md` § `F-S2-2` records for
`OI-S1-2`, and it is handled by the rule that finding established and this package applies: **a
cross-package open item is always written qualified — *C010's `OI-S8-1`* — and a bare `OI-S8-1`
always means this package's own.** Renumbering was declined because the id is computed from the
charter's own sub-task-scoped scheme, and picking a different number to dodge a cross-package shape
collision would break the property that makes the scheme collision-safe among concurrently authored
siblings.

**Three prior bare uses, and one of them is in this very file.** SUB-3 cites a bare `OI-S8-1` twice —
in `03_learner-data-inventory-and-classification.md` §4, in `LD-S3-13`'s minimization field, and in
this register's own SUB-3 closing note as *"`OI-S8-1`, owned by `NEU-984` (`SUB-10 of C010`)"*. Both
predate `F-S2-2`'s rule and both name the owner parenthetically, so both resolve unambiguously to
C010's item. **Third and most importantly: SUB-4's section above carries a heading
*"Disposition of `OI-S8-1`"*** — also unqualified, and also correct when written, because a bare id
means this package's own **only where this package has one**, and until this entry it did not.

**From this entry onward it does, so this file now carries both.** A reader meeting SUB-4's
disposition and then this entry is meeting **two different items with one id shape**: SUB-4 disposes
of **C010's** — `context_tokens` having no principal column to bind to, owner `SUB-10 of C010`
(NEU-984), still open — while the entry above is **C011's**, the third-party-model-provider and
cross-border question, owner the creator. The two share nothing but four characters.

**No revision of SUB-3 or SUB-4 is produced, requested or owed on this ground, and no finding is
routed against either.** Both were correct at their own positions and the append-only rule holds;
the party positioned to normalise the two headings at assembly is **SUB-14** (NEU-1007).

---

**SUB-8 register totals at revision 1:** one open item, `OI-S8-1`, carrying a named owner and an
observable resolving event, and zero blank fields. **Zero second records** of a question already
owned by another sub-task or another package — seven inherited items are consumed by citation and named
above — `OI-S3-1`, `OI-S1-4`, `OI-S1-5`, `OI-S1-6`, `OI-S1-7`, `OI-S1-9` and `OI-S16-1` — `OI-S3-1` most load-bearingly. **One of one** corresponds to the single spike entry `SPK-S8-1`
in `96_spike-register.md`, on the same rule SUB-1 applied.
### SUB-5

*`NEU-997`, covering `OUT-8`. Two items. **A namespace warning:** C010 has `OI-S5-1`, `OI-S5-2` and
`OI-S5-3`, and this package cites the first two heavily. Per `F-S2-2`'s rule, **a bare `OI-S5-<k>`
here is C011's**; C010's is always written with its full package path. C010's `OI-S5-2` was closed by
SUB-2 and is a different item from the one below entirely.*

#### `OI-S5-1` — Whether the RLS second layer's transaction requirement is acceptable against `OBJ-1`'s pool of four

- **Id:** `OI-S5-1`
- **Item:** `DR-C11-S5-1` clause 5 recommends row-level security as an independent second defence. On this deployment the `pg.Pool` is shared and connections are reused, so a session-level setting leaks between requests and a **transaction-local** one is required — meaning every row-owning read must run inside a transaction, and most do not today. A transaction holds a connection longer than a single statement, against a pool whose `max` is 4 and which SUB-15 identifies as the first thing that breaks. **Whether that cost is acceptable is undecided**, and it cannot be decided here: pricing it needs `t_db`, which is unobserved.
- **Status:** **Open.**
- **Source:** `05_the-enforcement-point-that-confines-every-read-and-write.md` §2 clause 5, §12; `decision-records/DR-C11-S5-1_the-enforcement-point.md` clause 5 and rejected alternative 4. Platform facts: `src/infrastructure/db/client.ts:42`; `15_operational-objectives-for-the-real-platform.md:248` (`OBJ-1`), `:131`, `:161`–`:163`.
- **Consumer:** **SUB-13 (NEU-1006)** under OUT-19, which would author the RLS DDL and the transaction discipline together; **SUB-7 (NEU-1001)** under OUT-3, if the second layer becomes a stage of its own.
- **Owner:** **SUB-13 (NEU-1006)**, co-named **the creator, as sole maintainer and sole operator**, for the pool configuration itself.
- **Resolving event:** **SUB-13 publishes its DDL and states whether the RLS layer is included and under what transaction discipline** — or, earlier, `OI-S15-3` closes with an observed `t_db`, which makes the cost calculable and lets the question be answered on a number rather than a judgement. Either closes it; deferring the RLS layer indefinitely does not, because the recommendation would still stand unpriced in a published record.
- **Why not a stand-in:** A stand-in records an assumption the design provisionally rests on, with a tolerance envelope and an invalidating outcome. **This design rests on nothing here** — clause 5 is explicitly the *second* layer and the enforcement point is complete without it, which is why it was written that way. There is no assumption to carry, only an unanswered question about an optional addition.

#### `OI-S5-2` — Who observes the four-part landing condition under which `CAP-S5-1` lifts

- **Id:** `OI-S5-2`
- **Item:** `05_the-enforcement-point-that-confines-every-read-and-write.md` §9.2 states the condition under which C010's `CAP-S5-1` lifts: a category evaluating to `holds` against target state **(a), as it stands**, at a named cutoff, with the ownership key applied, the enforcement point applied, the STDIO gate applied, and **the enumerated access-path set re-verified at that cutoff**. **Which party performs that observation and records it is undecided.** It is not this package, which may change no file under `src/` or `drizzle/` and can therefore never observe target state (a) with the changes landed. It is not `NEU-986`, the cap's owner, which sits at C010's completeness gate and has already published. The implementation charter `NEU-896` hands the work to is the natural party, but no such charter exists yet and none is named anywhere.
- **Status:** **Open.**
- **Source:** `05_the-enforcement-point-that-confines-every-read-and-write.md` §9.2; `decision-records/DR-C11-S5-2_the-first-holds-derivation.md` consequence 3 and its revision trigger; the cap itself at `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:189`.
- **Consumer:** **`NEU-986` (`SUB-12 of C010`)**, the cap's owner, which must eventually weigh whether it lifted; **SUB-13 (NEU-1006)** under OUT-19, whose runbook is where a verification step of this shape would live; **SUB-14 (NEU-1007)** under OUT-20, whose `NEU-896` boundary statement is where an unassigned downstream obligation belongs.
- **Owner:** **`NEU-896`** at convergence, as the party that hands implementation-ready packages to an implementation charter and is therefore the only one positioned to name a party that does not yet exist.
- **Resolving event:** **`NEU-896` names the implementation charter that receives OUT-19's artifacts**, at which point the landing-condition observation attaches to it — or **SUB-13 writes the re-verification into its runbook as an executable step with a named performer**, which closes it earlier and more concretely.
- **Why not a stand-in:** Nothing in this chapter rests on the observation happening. The `holds` verdict is against a composed target state and is complete without it, and the cap is explicitly **not** claimed lifted. This is an unanswered question about a future act, with no tolerance envelope and no invalidating outcome — exactly the open-item shape.

---

**SUB-5 register totals at revision 1:** two open items, `OI-S5-1` and `OI-S5-2`, both **open**, each
with a named owner and an observable resolving event, neither blank. **Zero dispositions of another
package's items are recorded here** — C010's `OI-S5-1` is consumed by citation inside `F-S5-9`, and
C010's `OI-S5-2` was closed by SUB-2 and is not re-dispositioned. **Zero second records:**
`OI-S15-3` (the `t_db` observation) and `OI-S3-1` (controller/processor and lawful basis) are cited
from their single owning records rather than re-raised, on the same rule SUB-16 applied. **Zero of
two correspond to a spike entry** — SUB-5 files no spike, because neither question is settled by a
bounded experiment against production: `OI-S5-1` needs a measurement another item already owns, and
`OI-S5-2` needs a party to be named.

---

### SUB-6

*Namespace note: `OI-S5-1` in this package is SUB-5's entry. C010 also has an `OI-S5-1`, a different
item with a different owner (`NEU-850`), and the two are qualified wherever both appear — the
six-way `S<n>` collision between C010's and C011's same-numbered sub-tasks applies here as
elsewhere.*

#### `OI-S6-1` — `LD-S3-32`, the aggregate result set, has now failed to appear at two consecutive positions

- **Id:** `OI-S6-1`
- **Item:** SUB-3 inventoried the aggregate result set as `LD-S3-32` and recorded that it "does not
  exist at position 3". SUB-5 restated it as SUB-6's to produce. SUB-6 could not produce it either,
  for want of a production credential. The package therefore carries an inventoried, classified
  category with **no producing artifact**, and the question of when it comes into existence is open.
- **Status:** **open**
- **Source:** `03_learner-data-inventory-and-classification.md:473`–`:476`;
  `05_the-enforcement-point-that-confines-every-read-and-write.md:613`–`:614`;
  `06_the-disposition-of-every-unowned-row.md` §6.4 and §6.5.
- **Consumer:** **SUB-14 (NEU-1007)** under OUT-20, whose band reconciliation would otherwise find an
  inventoried category with no artifact and no explanation; **SUB-17 (NEU-1008)** at the completeness
  gate.
- **Owner:** **The creator, as sole maintainer and sole operator** — the only party with the
  credential the queries need. The specification is complete and published; only execution is
  missing.
- **Resolving event:** The queries `Q1`–`Q5` and the twelve probes at
  `06_the-disposition-of-every-unowned-row.md` §6 are executed against production and their results
  recorded. `LD-S3-32` comes into existence at that instant, and `F-S6-4` closes with it.
- **Why not a stand-in:** Nothing is being assumed in its place. No count, no distribution and no
  probe result is used anywhere in this package; the artifact is simply absent, and every consumer of
  it reads *not executed — no credential* rather than a substituted value.

#### `OI-S6-2` — The synthetic dry-run dataset was never generated, so no unclaimed-row count exists

- **Id:** `OI-S6-2`
- **Item:** The dry-run dataset's generator has five enumerated inputs, three of which are the
  unexecuted aggregates of `OI-S6-1`. The dataset was therefore not generated, the throwaway
  verification SQL was not written, the dry-run did not run, and **no unclaimed-row count is
  reported**. OUT-2's clause that "every row of the dataset is claimed by a disposition or surfaced
  as a finding" is consequently unevaluated.
- **Status:** **open**
- **Source:** `06_the-disposition-of-every-unowned-row.md` §7.1 and §7.3;
  `decision-records/DR-C11-S6-3_aggregate-then-generate-and-the-exclusion-evidence.md` consequence 4.
- **Consumer:** **SUB-13 (NEU-1006)** under OUT-19, which would otherwise inherit a set of
  dispositions that had been exercised against a dataset and instead inherits a set that has not
  been; **SUB-17 (NEU-1008)**.
- **Owner:** **The creator, as sole maintainer and sole operator**, for the credential; **SUB-13**
  for deciding whether the implementation charter re-runs the dry-run before executing.
- **Resolving event:** `OI-S6-1` resolves, the dataset is generated from the resulting aggregates, and
  the dry-run reports an unclaimed-row count over it.
- **Why not a stand-in:** No generated count is assumed, quoted or reasoned from anywhere. This item
  is distinct from `OI-S6-1` because the two close in sequence rather than together: a credential
  alone resolves `OI-S6-1`, but the dataset must then be generated and the dry-run run before this
  one closes.

---

**SUB-6 register totals at revision 1:** two open items, `OI-S6-1` and `OI-S6-2`, both **open**, each
with a named owner and an observable resolving event, neither blank. **Both correspond to the same spike
entry** — `SPK-S6-2`, whose unexecuted aggregates block `OI-S6-1` directly and `OI-S6-2` transitively,
since the dataset cannot be generated until the counts exist. `SPK-S6-1` (the target-subject
verification) blocks neither: it gates the backfill stage, not dataset generation. This is the
inverse of SUB-5's position and correct for the same reason: SUB-5's two items needed a measurement
already owned and a party to be named, whereas both of these are settled by a bounded, read-only
experiment against production and by nothing else.

**Zero dispositions of another package's items are recorded here.** C010's `OI-S5-1` — whether
`NEU-850`'s *"every core table"* ranges over the two raw-SQL log tables — is **consumed by citation**,
and this sub-task takes no reading of its own, citing SUB-3's stand-in `A-S3-1` for the reading the
package adopted. It is deliberately not needed: the `archive` disposition adds no ownership column to
either log table, so it is correct under **both** readings, which is why this sub-task does not wait
on `NEU-850`.

**Zero second records.** `OI-S15-3` (the `t_db` observation) is cited from its single owning record
inside the `OBJ-1` check rather than re-raised, and the single-principal question is filed as the
stand-in `A-S6-1` plus the finding `F-S6-2` rather than additionally as an open item — one id per
fact, and that fact is already carried twice for two different reasons (what is assumed, and why no
probe can settle it) rather than three times.

---

### SUB-7

> **Id-collision disclosure.** **`OI-S7-1` also exists in C010**, where sub-task 7 is a different
> sub-task about a different subject. Under `F-S2-2`'s rule a bare `OI-S7-1` means **this** package's;
> C010's is always written qualified. The full six-id set this sub-task collides on is listed once, at
> `94_caps-and-incomplete-scope.md` § SUB-7.

#### `OI-S7-1` — Which of `R-S4-2`'s three routes stage `T0` takes has not been chosen

- **Id:** `OI-S7-1`
- **Item:** `R-S4-2` names three mutually exclusive routes for the deploy pipeline's smoke run — re-scope the suite, re-provision the smoke principal as a user-kind principal, or accept a known-failing step. They have materially different consequences: the first two preserve `SIG-S16-4`'s only automated limb, the third leaves it dark for four subsequent stages. **No party has chosen.** Stage `T0` cannot be entered until one is chosen and recorded, and `T0` gates the two stages that break the suite (`T6` and `T8`).
- **Status:** Open.
- **Source:** `92_risk-register.md:269`–`:278` (`R-S4-2`, which names the three routes); `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §5 and §6, where `T0`'s entry condition is the choice.
- **Consumer:** SUB-13 (NEU-1006), which cannot write `T0`'s runbook step without knowing which route it describes. OUT-3 and OUT-4.
- **Owner:** **The creator**, as sole operator — the only party who can re-scope the smoke suite, re-provision its principal in the IdP, or accept a standing red step. The same owner `R-S4-2` names.
- **Resolving event:** The operator records a route, and a cd-prod run completes with its smoke job green under that route (or, on the third route, with the two affected scenarios explicitly marked expected-failing).
- **Why not a stand-in:** It is an unmade decision with three named, obtainable answers, not an assumption the architecture provisionally rests on. The sequence does not assume any particular route — it is correct under all three, and only the observability consequence differs, which is why the exposure is carried separately as `R-S7-1` rather than as a tolerance envelope here.
- **Why this is not a second record of `OI-S4-2`:** SUB-4's `OI-S4-2` asks *whether the smoke suite can be re-scoped without losing regression value* — a question about the merits of **one** of the three routes, and an input to this decision. This item is the **decision itself**, which exists whether or not `OI-S4-2` resolves: even a definitive "yes, it can be re-scoped safely" leaves the operator to actually choose and record a route before `T0` can be entered. `OI-S4-2` is cited here and not restated, and it keeps its own owner and resolving event.

---

**SUB-7 register totals at revision 1:** one open item, `OI-S7-1`, **open**, with a named owner and
an observable resolving event. One item rather than several because this sub-task's other unknowns
are not questions of its own: the backups question is **`OI-S1-8`** (cited by id in
`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §7 as the reason no reversal may assume
a restore, with **no second record raised**), the unrouted-alert question is **`OI-S1-9`** under
stand-in `A-S16-1`, the missing row counts that leave two stages' durations unbounded are
**`OI-S6-1`**, and whether the Drizzle migrator takes an internal advisory lock is the bounded reading
gap **`R-S15-3`** already records. Each is consumed by citation and none is re-raised.

**Zero dispositions of another package's items are recorded here.** This sub-task consumes C010's
§4.3 sequencing consequence as a binding constraint and honours it (`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §4);
it takes no reading of any C010 residual id and closes none.
### SUB-11

#### `OI-S11-1` — Nothing keeps the gate's exclusion set and the empty-schema tool set in agreement, so the exempt figure of 3 is true at a cutoff rather than enforced

- **Id:** `OI-S11-1`
- **Item:** The exempt set is derivable two independent ways — the three tools declaring `z.object({}).shape` (`src/server/server-info-tools.ts:13`, `server-context-tools.ts:21`, `server-workflow-tools.ts:15`) and the three names hard-coded in `EXCLUDED_TOOLS` (`src/transport/context-token-middleware.ts:5`–`:9`). At cutoff `35f92ba` they name the same three tools, and `11_the-client-compatibility-contract.md` §1.2 reports that agreement as evidence. **What is open is that nothing in the repository enforces it.** A fourth empty-schema tool would not add itself to `EXCLUDED_TOOLS`, and a name removed from `EXCLUDED_TOOLS` would not gain a schema. The two can diverge in either direction, and the directions are not symmetric: a tool in `EXCLUDED_TOOLS` without an empty schema is **ungated but declares an argument nobody checks**, while an empty-schema tool absent from `EXCLUDED_TOOLS` is **gated on a token its schema does not accept** — which is a hard failure for every caller of it. Neither is detectable by a tool-manifest diff.
- **Status:** open
- **Source:** `11_the-client-compatibility-contract.md` §1.2 and §4.2; the six repository locations cited above, read at `35f92ba`.
- **Consumer:** **SUB-13 (`NEU-1006`)** under OUT-19, which authors the DDL and the runbook's verification steps and is the nearest scheduled party positioned to add a set-equality assertion; **SUB-12 (`NEU-1005`)** under OUT-17, for which an exemption that can drift silently is a threat-model input rather than a fixed boundary.
- **Owner:** **SUB-13 (`NEU-1006`)** for the assertion; **the implementation charter `NEU-896` hands the work to**, for the re-check at the landing cutoff.
- **Resolving event:** A test or lint rule asserting that the set of registered tools declaring an empty input schema equals `EXCLUDED_TOOLS` lands on `origin/develop`. **This package cannot produce it** — it would be a `tests/` or `src/`-adjacent change, out of scope by constraint — so the item is opened rather than closed, which is the correct outcome and not a shortfall.
- **Why not a stand-in:** Because nothing is being assumed. The current state is **observed** at a stated cutoff and reported as observed; what is missing is a mechanism, not a fact. A stand-in would imply this chapter had guessed the exempt set, and it did not.

#### `OI-S11-2` — If the gate extraction wraps handlers rather than the server, the compatibility contract acquires a detection obligation it does not otherwise have

- **Id:** `OI-S11-2`
- **Item:** `11_the-client-compatibility-contract.md` §6.2 establishes that a transport-neutral gate must interpose between *"a `tools/call` arrives"* and *"the registered handler runs"*, and that the MCP SDK offers no documented hook at that layer — `createMcpServer` returns a bare `McpServer` whose tools are attached by 46 individual `registerTool` calls (`src/transport/create-server.ts:17`–`:23`). The extraction can therefore land in one of two places: **option A**, one adapter wrapping the server or the message stream, touching `src/transport/` only; or **option B**, a decorator applied at each registration site, touching all 46 across 16 modules. **What is open is which.** It is not decidable here, because it depends on the SDK's actual interposition surface at the version the implementation charter builds against, and this package designs rather than implements.
- **Status:** open
- **Source:** `11_the-client-compatibility-contract.md` §6.2, and `91_findings-register.md` § `F-S4-4` for the underlying fact that no seam exists.
- **Consumer:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`**, as `CC-S8-3`'s owner — the fork is the thing that sizes the work it owns; **SUB-13 (`NEU-1006`)** under OUT-19, which inherits the verification step if option B is taken; **SUB-7 (`NEU-1001`)** under OUT-3, because a 46-site change and a one-site change stage differently.
- **Owner:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`**.
- **Resolving event:** The extraction's design is settled — either an interposition adapter lands in `src/transport/`, or a decorator lands at the registration sites. On option B the item resolves **with a consequent obligation**: an assertion that the wrapped-handler set equals the non-exempt registered set, because a forgotten decorator on one of 46 sites yields a tool that is registered, believed gated, and ungated — a failure §1.3's schema mapping cannot catch, since that mapping checks *declarations*, not *wrapping*.
- **Why not a stand-in:** Because no branch is assumed. The chapter prices **both** and states the consequence of each; nothing downstream of it depends on which is chosen, so there is no assumption to register a tolerance envelope against.

#### `OI-S11-3` — The core-change clause this package measures DP-specificity against resolves to no file, and this sub-task is its only citer

- **Id:** `OI-S11-3`
- **Item:** The constraint *"core changes must be reusable, backward-compatible, non-DP-specific and fail safely"* reaches this sub-task as **`C005 charter :61`** — via `01_charter.md` § Constraints and this sub-task's tracker description. **The reference names no file, and no C005 charter exists in this repository**: nothing under `docs/research/` and nothing in `_local/` carries one, and **no other C011 chapter cites C005 at all**. It is additionally invisible to the citation gate, which discards any candidate beginning with `:` (`scripts/citation-paths/checker.ts:122`), so a green checker run says nothing about it. What is open is where the clause is actually written, and therefore whether the wording this package measures against is the wording that was ratified.
- **Status:** open
- **Source:** `11_the-client-compatibility-contract.md` §9; `_local/C011__resolve-safe-production-integration-and-learner-isolation/01_charter.md` § Constraints (gitignored); `scripts/citation-paths/checker.ts:122`.
- **Consumer:** **SUB-17 (`NEU-1008`)** under OUT-20, whose citation audit requires every codebase and upstream claim to resolve to a real path or carry a version and date — this one does neither; **SUB-14 (`NEU-1007`)**, which assembles the package a cold reader receives and for which an unresolvable authority is a house-style defect.
- **Owner:** **`NEU-896`** at convergence, as the party holding the cross-package charter set and the only one positioned to say where C005 lives; **SUB-14 (`NEU-1007`)** for the package-side disposition — cite it resolvably, restate the clause with a real source, or record it as an inherited-by-charter standard.
- **Resolving event:** A resolvable citation for the clause lands — a path plus a line, or a named document with a date — or the package records explicitly that the standard is inherited on the charter's authority and is not independently verifiable from the repository.
- **Why not a stand-in:** Because nothing here rests on the clause's *wording* being one thing rather than another. `F-S11-2`'s substance — that four dynamic-programming criterion keys are required fields in core tool schemas — is an observation about `src/` that holds under any phrasing of a non-DP-specificity rule. What is missing is a verifiable **authority**, not a load-bearing **belief**, so this is an open item and not an assumption with a tolerance envelope.

---

**SUB-11 register totals at revision 1:** three open items, `OI-S11-1`, `OI-S11-2` and `OI-S11-3`,
all open at this revision. Each carries a named owner and an observable resolving event, neither
blank. **Zero dispositions of another package's items are recorded here.** **Zero second records:**
C010's `OI-S8-1` — that `context_tokens` names no principal — is cited from its single owning record
inside `11_the-client-compatibility-contract.md` §2 rather than re-raised; `OI-S3-1`
(controller/processor and lawful basis) is cited in §8's escape table on the same rule; and
**`OI-S1-1`** — whether a production `client_credentials` token carries a `sub` — is cited from its
single owning record in §7.1 and carried as the stand-in `A-S11-2`, **not** re-raised as a fourth
open item here.

**Zero of three correspond to a spike entry**, and the reason is uniform: none is settled by an
experiment against production. `OI-S11-1` needs a test written, `OI-S11-2` needs a design decision
taken, and `OI-S11-3` needs a document located — all settled by work rather than by observation. The
two questions this sub-task *does* need production to answer are registered elsewhere: whether any
existing client exists at all is **`SPK-S11-1`**, with `CAP-S11-1` as its standing cap; and whether
the smoke principal's token carries a `sub` is **`SPK-S1-1`**, cited rather than re-designed, with
`A-S11-2` carrying the assumption this chapter makes in its absence.
