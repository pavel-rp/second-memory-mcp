# 15 — Substrate decisions: data-store topology, deployment shape, AI-orchestration placement, and the make-or-reuse records

**Task:** NEU-984 (SUB-10) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-22
**Model:** claude-opus-5[1m]
**Verification cutoff:** `03efe1d`, 2026-08-22 — every repository fact in this chapter was read at this commit.
**Covers:** `OUT-8` (substrate half) and `OUT-10` (spike execution) of `01_outcome-register.md`.

---

## 1. What this chapter decides, and what it deliberately does not

Three substrate choices, each published as a decision record with evidence and rejected
alternatives, each classified in scope by **SUB-15's published architecture-material rule** rather
than by a rule restated here:

| Record | Decision |
| --- | --- |
| `DR-C10-S10-1` | One shared Postgres instance for every core-authority category, MCP core the sole credential holder |
| `DR-C10-S10-2` | Two processes on one self-managed host, built by the maintainer's own CI, migration exclusive to the MCP core |
| `DR-C10-S10-3` | AI orchestration owned by the MCP core process behind the existing ports |

Plus four make-or-reuse records (§8), a ten-fact production-compatibility assessment (§9), the
spike and cap dispositions (§10), and the reconciliations and checks this sub-task inherited (§11).

**Not decided here**, and stated up front so no reader mistakes silence for an answer: the
architecture-material rule itself and SUB-15's three client-tier decisions (consumed as decided
inputs); framework and library selection; any Dockerfile, compose file, IaC or CI change; any
deployment; repository topology; endpoint or schema design; hosting region, provider, TLS
termination, backup and monitoring. NEU-890's settled decisions are consumed, not reopened. §12
records the scope check against this list.

**One capability's make-or-reuse decision is left visibly undischarged.** §8.6 states which, why,
and on whose authority the list stayed closed at four. It is a declared gap, not an oversight.

---

## 2. Inputs consumed as decided

| Input | Source | Used for |
| --- | --- | --- |
| The architecture-material rule and its three-step test | `DR-C10-S15-1`; `13_…md` §4.1–§4.2 | The in-scope basis of all three decisions (§3) |
| The three client-tier decisions | `DR-C10-S15-2`, `-3`, `-4` | Consumed; none is re-argued |
| `M-A` all-MCP state ownership | `DR-C10-S6-1`; `07_…md` §5.1 | The single-writer premise; the reversal check (§5.3) |
| The `post-validation` authority matrix, 45 rows `SC-S3-1`…`SC-S3-45` | `10_…md` §8 (authority, clause, status) and `08_…md` §8 (the nine attributes), revision `post-validation` (SUB-16 / NEU-979) | The decisive criterion (§5.2) and the eighteen-row reconciliation (§5.4) |
| 180 row-walks — 178 defined, 2 undefined | `09_…md`; `F-S14-4`, `F-S14-5` | The termination premise a store split would break |
| Repository topology `T2`, decisive criterion `K4` | `DR-C10-S9-1`; `14_…md` | The `OI-S9-4` check (§6.2) |
| Deployment-shape assumption `DS-1` | `14_…md` §6 | The two-process clause (§6.1) |
| Compatibility surface — 46 tools / 43 gated / 3 exempt / 49 audit entries | `F-S8-1` | The web tier's reach; the reuse obligations (§8) |
| `CC-S8-2`, `CC-S8-3` | `12_…md` | The inherited obligation on every reuse answer (§8) |
| `SC-S3-37` holds one imported copy; `SC-S3-40` holds none | `05_…md` §8, discharging `OI-S3-2` | Two rows of the reconciliation (§5.4) |

**Two rows carry a revision.** `SC-S3-16` and `SC-S3-17` were re-authored in `10_…md` §6 and are
cited from there, not from `08_…md` §8. Neither is among the eighteen of §5.4.

**`F-S16-1`'s 24 label/id mis-pairings** in SUB-14's merged files are neither repaired nor
propagated by this chapter. Every id in this chapter was matched on the id, never on a label used
as a proxy.

---

## 3. Applying SUB-15's rule — the in-scope screening

`13_…md` §4.1 states the rule: a choice is architecture-material when changing it, **on its own**,
would move a **boundary**, reassign an **authority**, or alter a **compatibility contract**. One
yes suffices. The rule is applied here, not restated, demonstrated or amended; a choice believed
misclassified would be a finding routed to SUB-15, and none was found.

| Choice | B — boundary | A — authority | C — contract | Verdict |
| --- | --- | --- | --- | --- |
| Data-store topology | **Yes** — a second store adds a `web tier ↔ store` pair no `BND-S4-*` row carries, and changes the class of the link `BND-S4-16` leaves `undecided` | **Yes** — a second credential holder is a second writer, which `07_…md` §5.2 records as contradicting `M-A` itself | No | **Architecture-material** |
| Deployment shape | **Yes** — `13_…md` §6.4 alternative 3 records a single-process web tier collapsing `BND-S4-2`; and the migration clause fixes which component holds a write edge | **Yes** — a web-tier database credential reassigns all 45 cells at once | **Yes** — with two processes, the gated-tool surface is the web tier's only reach into state | **Architecture-material** |
| AI-orchestration placement | **Yes** — an AI call is egress carrying learner-derived content; placing it in the web tier creates a `web tier ↔ AI provider` pair that does not exist today | No | No | **Architecture-material** |

**The screening also decides what stays out**, and this is where applying the rule rather than
restating it earns its keep. Moving the AI call from the synchronous path to an asynchronous one
**within one process** moves no boundary, reassigns no authority and alters no contract — so by the
rule as published it is **not** architecture-material, and `DR-C10-S10-3` clause 4 leaves it open
rather than spending a decision on it. Likewise record shape (`SC-S3-31`'s aggregate-versus-append)
and build tooling: `13_…md` §4.7 already records the latter as failing the rule.

---

## 4. Summary of the three decisions

| | `DR-C10-S10-1` | `DR-C10-S10-2` | `DR-C10-S10-3` |
| --- | --- | --- | --- |
| **Decision** | One shared Postgres for core-authority categories; MCP core sole credential holder | Two processes, one host, one instance each; migration exclusive to the MCP core | AI owned by the MCP core process behind `EmbeddingPort` / `ContentClassifierPort` |
| **Decisive criterion** | Seven rows require cross-category same-transaction atomicity, and `UnitOfWorkPort` does not span components | `drizzle-orm` 0.45.1's migrator takes **no lock** and reads pending-ness outside the transaction | `A-26`'s envelope clause (b) — AI may move off the synchronous path **without changing which component owns it** |
| **Rejected** | Separate web store; separate core store; read replica; polyglot persistence; defer | One process; two hosts; horizontal replication; hosted-repository build platform; web-tier migrator; defer | AI in the web tier; a third AI service; move off-path now; fail-closed; adopt-external |
| **Cited caps / items** | `CAP-S6-1`, `OI-S6-1`, `OI-S13-1`, `F-S14-5` | `OI-S9-4`, `OI-S1-3`, `OI-S2-1`, `CAP-S15-1`, `F-S15-2` | `A-26`, `CAP-S15-1` |

---

## 5. Data-store topology

### 5.1 The decision

Full text at `decision-records/DR-C10-S10-1_data-store-topology.md`. In brief: one Postgres
instance holds every state category whose authority is the MCP core, across the `public` and
`infrastructure` schemas; the MCP core process is the only credential holder; the web tier reaches
state only through the gated tool surface; and `SC-S3-33`/`SC-S3-34` are a required carve-out
sitting in the drift component's own store under `CMP-S4-17`.

**One upstream disagreement surfaced while writing this and is routed rather than resolved.**
`DR-C10-S6-1`'s headline reads "the MCP core is the exclusive writer of **all 45** categories",
while the republished matrix assigns `SC-S3-33`/`SC-S3-34` to `CMP-S4-17` (`10_…md:741`–`:742`)
and calls `CMP-S4-17` that cache's "only writer" (`:227`). This chapter takes the **matrix**
reading — later, republished, validated — and files the conflict as **`F-S10-6`**, routed to
**SUB-6 (NEU-976)**. The carve-out itself does not depend on the answer, because `08_…md` §8.6's
prohibition holds under either reading; what depends on it is one ground of the reversal argument,
and `DR-C10-S10-1` states that dependency and its contingency in full rather than resting on it
silently.

### 5.2 The decisive criterion

Seven rows require an atomic commit spanning **more than one state category** — `SC-S3-3` (with
`-9`, `-10`), `SC-S3-7`↔`SC-S3-8`, `SC-S3-9` (with `-11`, `-3`), `SC-S3-10`, `SC-S3-11`, and
`SC-S3-39` with the attempt. `SC-S3-11` carries what `10_…md` §8 calls **"the strongest consistency
requirement in the `public` schema"**. `SC-S3-29` is the borderline case — **"the one genuine
consistency requirement among the derived rows"**, exposed to a five-way torn read.

`09_…md` §7 records that SUB-14's row-walks terminate on two premises: exactly one authority per
category, and `UnitOfWorkPort` **not** spanning components (`src/ports/unit-of-work-port.ts:26`–`:28`).
A physical split places at least one atomicity pair across a boundary the unit of work cannot
cross. The requirement stops being satisfiable, and defined walk outcomes become undefined.

This is why the topology is **forced by the matrix**, not chosen on preference. It is also why no
latency argument appears anywhere in the record: `F-S15-2` establishes that `SPK-S6-1`'s ≤0.02%
figure is an in-process transport floor carrying no network hop, and `CAP-S15-1` establishes that
the real deployed round-trip is unmeasured. Scoring a store topology on a figure that excludes the
hop the topology would introduce would be an assertion dressed as a finding.

### 5.3 The store-reversal check `OI-S6-1` handed over — result

`OI-S6-1` requires this check to be **run and its result recorded**, and states why recording
matters: "a store record that nobody checks against §5.3 leaves exactly the exposure this item
exists to surface."

`07_…md` §5.2 records **"Route taken: Route A"** — every model was scored under **both** store
assumptions — and therefore "does **not** rest on a single undeclared store assumption". §5.1:
**"`M-A` — all-MCP — is selected, and the selection is stable across both store assumptions."**
§5.3: **"No single store outcome reverses this selection."** Reversal requires the **conjunction**
`R1 ∧ R2 ∧ R3`; any two leave `M-A` ahead, and all three give `M-C` 428 against `M-A` 426 — a
two-point margin out of 500 that §5.3 itself calls "real but fragile".

| Conjunct | Requires | Status under `DR-C10-S10-1` |
| --- | --- | --- |
| `R1` | A separate **web** store with no shared credential path (+22 to `M-C` C1) | **Not satisfied** — one shared store; the web tier owns no state and holds no credential |
| `R2` | NEU-893's isolation mechanism resolving one authenticated subject at a single enforcement point spanning both tiers (+18 to `M-C` C2) | Not established; moot once `R1` fails |
| `R3` | SUB-7 establishing ≥1 required web-surface state item unexpressible as an MCP tool without making non-gate-bearing state gate-bearing (−12 to `M-A` C7) | **Already NOT ESTABLISHED** — `11_…md` §13 |

**`R3`'s disposition, carried forward exactly as SUB-7 left it.** `11_…md` §13's verdict:
**"`R3` = NOT ESTABLISHED. The conjunction `R1 ∧ R2 ∧ R3` therefore does not fire on `R3`'s
account, and `M-A` stands undisturbed by this chapter."** It inherits `A-27`'s `[unconfirmed]`
status and is re-openable only if `A-27` is invalidated. This chapter neither strengthens nor
weakens it.

The selected topology matches **row 1** of §5.2's lookup table — "Shared production Postgres, MCP
core the only credential holder" — whose recorded effect is **"None. §3.2 applies; `M-A` by 74"**
and whose recorded action for SUB-10 is **"None. Record the match."**

> **Result: the selected store is not the one SUB-6 named as selection-reversing. The selection is
> stable. No finding is routed to SUB-6.**

The two topologies §5.2 marks as finding-raising — a second credential holder on the shared store,
and a separate store for MCP core state — are both in the rejected set, and were rejected on the
matrix rather than to avoid raising a finding. The `SC-S3-33`/`SC-S3-34` carve-out is neither of
them; `DR-C10-S10-1` §"Why the carve-out does not reopen the reversal" gives the three grounds.

### 5.4 Reconciling the eighteen store-`none` categories — discharging `OI-S13-1`

`OI-S13-1`'s resolving event is **conjunctive**: the store record landing **and** the eighteen
being reconciled against it, "at which point each of the eighteen shapes resolves to a destination
or is recorded as still unplaced". Its own warning: "a store record that names stores without
saying which of these categories land in them leaves exactly the gap this item exists to surface."

All eighteen — `SC-S3-28` through `SC-S3-45` — reconciled below. Groups: 3 derived-never-persisted
(`08_…md` §8.5), 11 required-by-upstream (§8.6), 4 assumed (§8.7).

| Row | Group | Authority | **Destination under `DR-C10-S10-1`** | Stated precondition, carried forward |
| --- | --- | --- | --- | --- |
| `SC-S3-28` Mastery level | derived | `CMP-S4-7` | **None, by construction** — "a derived value has nothing to migrate" | Caching it would create a new category needing its own row |
| `SC-S3-29` `LearnerContext` | derived | `CMP-S4-7` | **None, by construction** | Materialising it would be a new row with its own freshness bound. Its five-way torn read is satisfiable only because all five sources share one store |
| `SC-S3-30` Analytics KPIs | derived | `CMP-S4-8` | **None, by construction** | Named the most likely future materialisation candidate; would be a new row |
| `SC-S3-31` Assessment-evidence record | required-by-upstream | `CMP-S4-9` via `CMP-S4-7` | **Shared store, `public`** | Record **shape** is not settled by the store — see `F-S10-4` |
| `SC-S3-32` Problem-citation record | required-by-upstream | `CMP-S4-7` via `CMP-S4-9` | **Shared store, `public`** | "The field set may not be widened on the way" |
| `SC-S3-33` Cached drift verdict | required-by-upstream | `CMP-S4-17` | **Drift component's own store** — `DR-C10-S10-1` clause 5 | Read by `CMP-S4-16` across `BND-S4-11`; no new write edge crosses into the core |
| `SC-S3-34` Drift-verdict store | required-by-upstream | `CMP-S4-17` | **Drift component's own store** — clause 5, forced by its prohibition | "Must **not** be co-located under an authority that would give any other component a write path to it" |
| `SC-S3-35` Gate-verdict record | required-by-upstream | `CMP-S4-14` via `CMP-S4-15` | **Shared store**, authoring side | "Tier-2 remains post-commit" — preserved by `DR-C10-S10-3` clause 3 |
| `SC-S3-36` Quarantine record | required-by-upstream | `CMP-S4-14` | **Shared store**, authoring side | Its interaction with `SC-S3-33` now crosses the clause-5 line — see the note below |
| `SC-S3-37` DP-map nodes and edges | required-by-upstream | `CMP-S4-7` via `CMP-S4-13` | **Shared store**, as one imported copy (`05_…md` §8) | **Import mechanism not selected** — `CAP-S10-4` |
| `SC-S3-38` Per-learner progression | required-by-upstream | `CMP-S4-9` via `CMP-S4-7` | **Shared store, `public`** | Same store as `SC-S3-37`, so the referential constraint is expressible — see §5.5 |
| `SC-S3-39` Per-learner mastery-gate state | required-by-upstream | `CMP-S4-9` via `CMP-S4-7` | **Shared store, `public`** | "Must be persisted, not materialised as a view over `SC-S3-28`"; one of the seven atomicity rows |
| `SC-S3-40` Measurement-contract register | required-by-upstream | `CMP-S4-7` | **None, by decision** — `05_…md` §8: no copy held, read in place; only the version identifier crosses | Holding a copy would create a second source of truth |
| `SC-S3-41` Operational-log derived extract | required-by-upstream | `CMP-S4-9` via `CMP-S4-20` | **Shared store, `infrastructure`** | Retention window and a **named deletion owner** are "the reason the category exists" — the owner is unsupplied; see the note below |
| `SC-S3-42` Tutoring / hint state | assumed — `A-25` | `CMP-S4-9` via `CMP-S4-7` | **Shared store, `public`** | "The AI call must stay outside a gate-bearing write path" — held by `DR-C10-S10-3`. Divergence outcome remains undefined (`F-S14-4`) |
| `SC-S3-43` Web-session and UI state | assumed — `A-27` | `CMP-S4-9` via `CMP-S4-7` | **Shared store, `public`** | `08_…md` §8.7 names this "the row that moves — and it is the only one" under an `M-C` reversal. **No reversal fires (§5.3), so it does not move.** |
| `SC-S3-44` Handoff authorization envelope | assumed — `A-29` | `CMP-S4-9` via `CMP-S4-7` | **Shared store, `public`** | "Expiry and revocability are not features to add in a later iteration" |
| `SC-S3-45` Learner-identity → owner mapping | assumed — `A-28` | `CMP-S4-10` | **Shared store** | "The migration path that unblocks the most other rows." Absent today: zero `user_id`/`userId` in `src/infrastructure/db/schema.ts` or any of the 25 migrations |

**Totals: 12 to the shared store, 2 to the drift component's own store, 3 with no destination by
construction, 1 with no destination by decision. Eighteen accounted for, none left silently
unplaced.**

Three notes the table cannot carry:

- **`SC-S3-36` now interacts across a store boundary.** Its migration path names an interaction
  with `SC-S3-33`, and clause 5 puts the two in different stores. Quarantine is a *reaction* to a
  drift verdict rather than a same-transaction commit with one, so no atomicity requirement is
  broken — but the interaction is now cross-store where the matrix wrote it cross-category, and
  that is recorded here rather than glossed.
- **`SC-S3-41` arrives with an unmet precondition.** Its stated reason for existing includes a
  named deletion owner. `CAP-S4-1` records that no component in the published model can be the
  operational logs' deletion owner, and that cap is **open at its eighth sighting — this one — and
  is not closed here**. `../91_…md` §`CAP-S4-1` records SUB-9's as the seventh (SUB-3, SUB-4,
  SUB-6, SUB-13, SUB-14, SUB-16, SUB-9); this pass is the next. Whether `SC-S3-41`'s own owner is assignable when `SC-S3-16`/`SC-S3-17`'s is not
  is **not settled by a store decision**, and no claim either way is made. The destination is
  supplied; the precondition is not.
- **`SC-S3-45` is unblocked in one sense and not another.** The store supplies its destination, but
  `F-S5-4` records that no state category can reach `holds` because STDIO produces no authenticated
  principal — "a column cannot supply a principal the transport never produced" — and `CAP-S5-1`
  records the invariant as well-formed but never satisfiable, with zero positive instances. Adding
  the column does not fix the transport. `OI-S8-1` (no principal column on `context_tokens`,
  `src/infrastructure/db/schema.ts:312`–`:321`) and `OI-S8-2` (STDIO has no gate to extend) both
  remain open; see §11.

### 5.5 The four cross-category interactions `OI-S13-1` names

`08_…md` §8.4 is, in `04_…md`'s words, **"the section that makes the current deployment
single-instance"**. It offered two options per interaction. `DR-C10-S10-2` clause 2 resolves the
first three by a third route §8.4 did not enumerate — **one instance of each process**, which makes
the divergence unreachable rather than mitigated.

| Interaction | `08_…md` §8.4's options | Resolution |
| --- | --- | --- |
| `SC-S3-20` rate-limit windows — "per-process counters mean *n* processes multiply the effective limit by *n*" | Shared store, or divide the configured limit by instance count | **One instance** — `n` = 1, so the multiplier is 1. Evidence: `src/transport/rate-limit-middleware.ts:58`, `.env.example:79`–`:81` |
| `SC-S3-21` Tier-2 breaker trip set — "*n* processes can hold *n* different opinions" | Shared store, or accept divergence | **One instance** — one opinion exists. Evidence: `src/orchestration/tier2-circuit-breaker.ts:68`–`:76` |
| `SC-S3-18` MCP session affinity — "a second process makes an MCP session usable only on the instance that created it" | Sticky sessions at the load balancer, or move the registry to a shared store | **One instance** — no second process to miss on. `F-S10-3` records exactly what breaks otherwise: `404` with JSON-RPC `-32000` on POST, `400` on GET/DELETE (`src/transport/http.ts:226`–`:232`, `:245`–`:250`) |
| `SC-S3-38` against `SC-S3-37` — "a re-import that removes a node leaves progression rows pointing at nothing" | To be resolved "with the store shape" | **Both land in the same store** (§5.4), so a referential constraint is **expressible**. Whether one is declared is schema design and out of scope. A split store would have made it **inexpressible** — that is the part the topology decides |

Stated without over-claiming: the first three are resolved **conditionally on clause 2 holding in
reality**, and `CAP-S10-3` records that the actual instance count is not discoverable from the
repository. The resolution is as strong as that premise and no stronger.

---

## 6. Deployment shape

### 6.1 The decision

Full text at `decision-records/DR-C10-S10-2_deployment-shape.md`. Two processes — MCP core and web
tier — as separate services from artifacts the maintainer's own CI produces, onto a single
self-managed host, one instance of each, with migration exclusive to the MCP core and the database
credential held only by it.

The two-process clause is `DS-1` as `14_…md` §6 states it; `13_…md` §6.4 alternative 3 independently
records that a single-process web tier would collapse `BND-S4-2`.

### 6.2 The `OI-S9-4` check — answered explicitly

`OI-S9-4`'s question: does the selected deployment shape require the application to be **built by a
platform that builds directly from a hosted repository and requires that repository to be public**?
`14_…md` §6 records that "the item does **not** close on SUB-10 merely choosing a shape without
addressing the question", so an answer is given rather than implied.

> **Answer: No.** The maintainer's own CI builds; deployment is a push to a host the maintainer
> controls. No hosted-repository build platform is involved, and no repository is required to be
> public. **`DR-C10-S9-1` stands; `T2` is not reversed and not re-decided.**

**But SUB-9's stated structural reason is contradicted by the repository**, and this is filed
rather than absorbed. `14_…md` §6.4 argues from "push-based SSH deployment to a self-managed host
**that never sees the repository**". At `03efe1d`, `.github/workflows/cd-prod.yml:62`–`:65` runs on
the deployment target:

```
cd "$REPO_DIR"
git fetch origin
git reset --hard "$SHA"
git clean -fd
```

The host holds a clone and fetches into it. The **conclusion** survives — the clone is of a
*private* repository **under charter assumption 32, which this sub-task consumes and does not
verify** (repository visibility is a platform fact, not readable in the repository) — so no
public-repository requirement arises; but the argument now rests on
the repository's **visibility** rather than on the host never seeing it, which is a weaker and
differently-conditioned premise. Filed as **`F-S10-1`** and routed to SUB-9, which is merged; this
follows the accepted `F5.7` residual pattern. Accepted warning **`F5.8`** is thereby answered:
`K6`, `K7` and `K9` were scored against `DS-1`, `DS-1` holds, and the one reversal condition
`14_…md` §6 declared does not fire.

### 6.3 Why migration exclusivity is a decision clause and not advice

`src/transport/main.ts:27` makes `await initializeDatabase();` the first statement of `bootstrap()`
with no environment guard; `src/infrastructure/db/migrate.ts:38`–`:50` calls drizzle's `migrate()`.
Reading the installed `drizzle-orm` 0.45.1 migrator at
`node_modules/drizzle-orm/pg-core/dialect.js:44`–`:72` shows:

- `drizzle.__drizzle_migrations` is created with `id SERIAL PRIMARY KEY, hash text NOT NULL,
  created_at bigint` — **no unique constraint** on `hash` or `created_at`;
- pending-ness is decided by a plain `select … order by created_at desc limit 1` issued **before**
  the transaction opens — **no** `FOR UPDATE`, **no** `pg_advisory_lock`, **no** `LOCK TABLE`;
- the entire pending-migration loop is then wrapped in one transaction.

That is a time-of-check-to-time-of-use race with no serialization. This repository's DDL is not
idempotent — `drizzle/0000_strong_tarantula.sql:1` is a bare `CREATE TABLE` — so two concurrent
boots during a pending-migration window resolve as: Postgres catalog locking serializes the DDL,
the first transaction commits, the second fails with `relation "…" already exists`, its transaction
aborts, and `src/transport/main.ts:62`–`:65` logs and calls `process.exit(1)`. A crash on boot, with
**no rollback step anywhere in the deploy path** to recover from it.

**This was settled by reading, so it is a finding and not a spike** — `F-S10-2`, with the withdrawn
candidate disclosed at §10.

---

## 7. AI-orchestration placement

Full text at `decision-records/DR-C10-S10-3_ai-orchestration-placement.md`. AI orchestration is
owned by the MCP core process, reached only through `EmbeddingPort` and `ContentClassifierPort`,
optional and degrading to disabled when unconfigured. The web tier makes no AI call and holds no AI
credential.

**`A-26` is cited with its envelope and its invalidating outcome**, as `OUT-8` requires. `A-26`
("No AI latency, privacy or cost budget exists yet") is `[unconfirmed]` and stands in for NEU-891.
Its envelope tolerates any budget under which (a) at least one AI provider call may be made
server-side with learner-derived content; (b) **AI work may move off the synchronous path without
changing which component owns it**; and (c) cost is bounded per call. It is invalidated by a budget
under which learner-derived content may not leave our infrastructure at all, or under which no
server-side AI call may be made on any path.

Clause (b) is the decisive criterion, and it is decisive because it is the one clause **no
tolerated budget can change**: it states that ownership and timeline are independent. So ownership
is the only part a substrate decision can settle without the budget, and the timeline is exactly
what `DR-C10-S10-3` clause 4 leaves open. That split is produced by applying SUB-15's rule (§3),
not by preference: moving a call from sync to async within one process moves no boundary.

The baseline posture is retained rather than re-derived. `src/composition-root.ts:387`–`:398`
leaves `ports.embedding` and `ports.classifier` **undefined** when the provider environment
variable is unset; `src/ports/content-classifier-port.ts:19`–`:21` guarantees `classify()` "never
throws"; and `src/orchestration/topic-workflows.ts:297`–`:322` runs the Tier-2 pass outside the
transaction because "any throw inside `unitOfWork.execute` would roll back topic creation, breaking
the fail-open contract" — and catches anyway, because "a bugged adapter must not poison creation".

**No latency, privacy or cost claim is made anywhere.** None could be supported: `A-26` records
that no budget exists, and no provider credential was reachable in this run. See §10.

---

## 8. The make-or-reuse records

Four capabilities, each answered **build here / reuse-from-core / adopt-external** against one
shared criteria set, with rejected alternatives. Every reuse answer states the SUB-8 obligation it
inherits and the distribution-line side it lands on.

**The shared criteria**, fixed before any capability was answered: (K-a) does an implementation
exist to reuse, and is it reachable through an interface rather than welded to a transport?
(K-b) does the capability's vocabulary belong to the general-purpose core or to the DP course?
(K-c) what compatibility obligation does reuse inherit, including STDIO coverage? (K-d) does the
answer add a runtime dependency to a package whose value is being embeddable?

`13_…md` §6.6 prices the reuse answer once and for all, and this chapter pays it rather than
re-arguing it: **"reuse-from-core is a separate decision, and taking it inherits SUB-8's
backward-compatibility obligation in full, including STDIO coverage."**

### 8.1 Identity and session handling

**Answer: adopt-external for issuance; reuse-from-core for verification.**

Issuance is already external and this record confirms rather than chooses it: the server points at
`AUTH_ISSUER`, performs OIDC discovery against `${issuer}/.well-known/openid-configuration`, and
resolves `jwks_uri` from it (`src/transport/jwt-middleware.ts:6`–`:51`,
`src/config/resolve-auth-config.ts:108`). No code of ours mints a token.

Verification is reuse-from-core: `jwtVerify` against the discovered JWKS, with the subject resolved
as `sub` falling back to `azp` for client-credentials grants
(`src/transport/jwt-middleware.ts:114`–`:131`).

- **Inherited obligation.** `CC-S8-2` (token-bound identity) **and** `CC-S8-3` (the STDIO gate), in
  full, including STDIO coverage. `OI-S8-2` records that **STDIO has no gate to extend and
  `CC-S8-3` is unowned** — so this reuse answer inherits an obligation whose subject does not
  exist. That is the price, stated rather than discounted.
- **Distribution line.** Public MIT core. `CC-S8-2` and `CC-S8-3` both place token-bound identity
  and the STDIO gate on the reusable-core side.
- **Disclosed precondition.** The reuse has **no surface to reuse today**. Identity is welded to
  Express: `jwt-middleware.ts`, `prm-handler.ts` and `resolve-auth-config.ts` produce
  `res.locals.auth`, consumed directly at `src/transport/http.ts:59`, `:206` and in
  `rate-limit-middleware.ts`. There is no `ports/auth-port.ts`; nothing under `src/ports/` or
  `src/domain/` references identity. Extraction to a transport-neutral form is an implementation
  obligation this answer creates. Filed as **`F-S10-5`**, routed to SUB-8 (merged).
- **Rejected.** *Build a second identity implementation in the web tier* — two verifiers of one
  token is two places for `CC-S8-2`'s meaning-narrowing to diverge, and `13_…md` §6.3 records that
  nothing catches that class. *Adopt an external session product* — adds a runtime dependency
  (K-d) and a third holder of learner identity, for a mechanism the core already implements.

### 8.2 The AI-orchestration layer

**Answer: reuse-from-core for `EmbeddingPort`'s shape; build here (application-side) for the
classifier verdict vocabulary and prompt pack.**

The split is K-b applied directly. `EmbeddingPort` is generic — embed text, embed texts, report
dimensions — and carries no course vocabulary. The classifier's verdict fields
(`rendering_clarity`, `vocabulary_appropriate`, `math_notation_rendering_risk`,
`definition_constructive`, `epistemic_consistency`, `overall_fit`) are a pedagogy rubric, and
`src/shared/prompts/classifier-prompts.ts` holds their prompt text.

- **Inherited obligation.** The `EmbeddingPort` half inherits `CC-S8-2`'s and `CC-S8-3`'s reach
  over the gated-tool surface only insofar as an embedding is reachable through a gated tool; no
  new clause is created. The application half inherits none, because it is not published.
- **Distribution line.** `EmbeddingPort` → **public MIT core**. Verdict vocabulary and prompt pack
  → **private application package**. This is `DR-C10-S8-1`'s rule applied, not a new line.
- **Rejected.** *Publish the classifier vocabulary with the core* — it would put a DP-course rubric
  in a general-purpose package and oblige the core to keep course-specific field names
  backward-compatible under `CC-S8-2`. *Build a fresh embedding abstraction application-side* —
  duplicates a working generic port for no gain (K-a).

### 8.3 The out-of-band citation-drift component

**Answer: build here (application-side).**

- **K-a returns nothing.** No implementation exists: a search for citation, drift, canonical-URL
  or stable-id handling across `src/` at `03efe1d` returns only incidental English uses of the word
  "drift" in unrelated comments. And **no scheduler, queue or job runner exists anywhere** — the
  only matches are in-process flush timers in the audit and event transports and local BFS queues
  in `session-workflows.ts` and `dependency-resolver.ts`. There is nothing to reuse and no
  infrastructure to host it.
- **Inherited obligation.** **None** — the answer is application-side, so no `CC-S8-*` clause is
  inherited and no STDIO coverage is owed. This is deliberate: placing it in the core would oblige
  a general-purpose MIT package to carry egress and scheduling, and would inherit `CC-S8-3` for a
  component STDIO cannot run.
- **Distribution line.** Private application package.
- **What it does not decide.** The component's **process placement** is decided —
  `DR-C10-S10-2` consequence 6 places the producer outside the serve path's process, following
  `DR-C10-S2-3`'s "the serve path reads a verdict; it never computes one". The **scheduling and
  dequeue mechanism is not selected**: `CAP-S10-2`, which is `OI-S2-1`'s own permitted route. Its
  store is the clause-5 carve-out (§5.4).
- **Rejected.** *Adopt an external product* — link-checkers answer reachability, not whether a
  cited source still says what was cited; the question has no off-the-shelf answer. *Reuse from
  core* — nothing exists there (K-a). *Place it in the MCP core process* — it needs egress and a
  long-running pass, and under one instance that shares the serve path's event loop.

### 8.4 The deployment and observability substrate

**Answer: adopt-external for the runtime substrate; reuse-from-core for logging, audit and events.**

- **Adopt-external.** A container runtime driven by `docker compose up -d --build` from an off-repo
  compose directory — **that half is already true and readable** (`.github/workflows/cd-prod.yml`).
  The **supervision** half is *not*: which supervisor restarts a died process is an off-repo fact
  `CAP-S10-3` records as not discoverable, the same cap §9 fact 10 routes the instance count to.
  It is named here as an adopted component whose identity is unknown, **not** as something
  confirmed. This record confirms the shape rather than selecting a product, and writes no compose
  file, Dockerfile or IaC.
- **Reuse-from-core:** the Pino logger (`src/shared/logger.ts`) with its redaction list and
  `AsyncLocalStorage` correlation-id propagation, and the Postgres audit and event transports.
- **Inherited obligation.** The audit path carries `F-S8-1`'s **49 audit entries** across the
  46-tool surface; reuse means the entry set stays backward-compatible under `CC-S8-2`. STDIO
  coverage is owed and, per `OI-S8-2`, undeliverable — the same unmet inheritance as §8.1, sighted
  a second time.
- **Distribution line.** The logger is generic → **public MIT core**. The audit and event
  transports are schema-coupled to `infrastructure.mcp_request_log` and `operation_event_log` and
  Express-mounted → **private application package**.
- **What is out of scope, and where it went.** Metrics, tracing, alerting, uptime monitoring, TLS
  termination, backup and hosting are all excluded by the charter. There is no metrics exporter, no
  tracing SDK and no alerting configuration in the repository. `OI-S1-3` (charter assumption 31)
  owns these, and its conversion is **`CAP-S10-1`**.
- **Rejected.** *Build a fresh observability layer* — a working one exists (K-a). *Adopt an
  external APM or log platform* — a monitoring selection the charter excludes, and it would be made
  against `OI-S1-3`'s unknowns rather than against evidence.

### 8.5 Summary

| # | Capability | Answer | Distribution line | Obligation inherited |
| --- | --- | --- | --- | --- |
| 1 | Identity and session handling | adopt-external (issuance) + **reuse-from-core** (verification) | Public MIT core | `CC-S8-2` + `CC-S8-3`, incl. STDIO — **unmet**, `OI-S8-2` |
| 2 | AI-orchestration layer | **reuse-from-core** (`EmbeddingPort`) + build here (vocabulary, prompts) | Core / private app, split | `CC-S8-2` over the gated surface; none for the app half |
| 3 | Citation-drift component | **build here** (application-side) | Private application package | None — deliberately |
| 4 | Deployment and observability substrate | adopt-external (runtime) + **reuse-from-core** (logging, audit, events) | Logger core; transports private app | `CC-S8-2` over 49 audit entries, incl. STDIO — **unmet** |

### 8.6 `F5.9` — the fifth capability, left visibly undischarged

The charter carried accepted warning `F5.9`: the make-or-reuse set is a **closed four**, but if
SUB-2 concluded that an **authoring-time execution environment** is an architectural component,
then its isolation, trust and resource boundary make it architecture-material by SUB-15's own rule,
and **no sub-task owns its build/reuse/adopt decision**.

**SUB-2 kept it.** `DR-C10-S2-2`'s decision reads: **"An authoring-time execution environment is an
architectural component of the selected system."** It carries "an **isolation boundary the host
can terminate**, one isolate per executed unit" and "a **wall-clock resource bound**", with a trust
boundary of `first-party, creator-authored code`. This is not the learner-facing environment —
`DR-C10-S2-1` eliminated that, and the two must not be conflated. SUB-2 §7 defers the isolation
**primitive and substrate** to SUB-10 and the scheduling mechanism to SUB-10 as `OI-S2-1`.

Applying SUB-15's rule honestly: an isolation boundary the host can terminate is a **boundary**, so
the capability is architecture-material and a make-or-reuse record is owed.

> **Disposition: the list stays closed at four, as published. `OUT-8`'s make-or-reuse requirement
> is left undischarged for the authoring-time execution environment. This is declared, not
> absorbed.**

Why the list stayed closed rather than being extended to five: the four are what `OUT-8` names, and
adding a fifth here would silently repair a warning the charter accepted rather than surfacing that
it fired. The gap is now a stated fact for **SUB-12's completeness gate** to dispose of. What is
*not* claimed: that the gap is harmless, that a downstream charter will notice it, or that the
isolation substrate can be inferred from the three decisions made here. It cannot — no decision in
this chapter selects an isolation primitive, and none should be read as doing so.

---

## 9. Production-compatibility assessment

Ten named facts, each read at `03efe1d`, each returning **operable today**, **not operable today**,
or **cannot be determined from the repository**. The charter's four named facts — the
single-instance assumption, the process-local in-memory state, auto-migrate-on-boot and the absent
rollback path — are facts 10, 8, 1 and 7.

| # | Fact | Evidence | Verdict |
| --- | --- | --- | --- |
| 1 | **Auto-migrate on boot, unconditional.** `await initializeDatabase();` is the first statement of `bootstrap()`; no env guard exists anywhere | `src/transport/main.ts:27`; `src/infrastructure/db/migrate.ts:38`–`:50` | **Operable, with a decision clause.** `DR-C10-S10-2` clause 3 makes migration exclusive to the MCP core; without that clause the shape carries the `F-S10-2` crash |
| 2 | **Auto-deploy from `develop` on green CI**, real SSH deploy to one host | `.github/workflows/cd-prod.yml` | **Operable.** A schema change and its deployment remain one event; the shape does not change that and does not need to |
| 3 | **No Dockerfile in the repository**, yet the deploy runs `--build` — build inputs are off-repo | worktree-wide search, zero results | **Cannot be determined.** Whether the off-repo compose stack can host a second service is not readable here → `CAP-S10-1` |
| 4 | **Root `docker-compose.yml` is dev-only** — a single `pgvector/pgvector:pg16` service, no `app`, no `build:` | `docker-compose.yml` | **Operable**, and correctly identified: it is not the production stack, so it neither supports nor contradicts the two-process shape |
| 5 | **No IaC** — no terraform, pulumi, ansible, helm or k8s | worktree-wide search, zero results | **Cannot be determined.** The second process's provisioning is unexpressed anywhere in the repository → `CAP-S10-1` |
| 6 | **No reverse-proxy config** — no nginx, caddy, traefik or haproxy | worktree-wide search, zero results | **Cannot be determined.** A two-process shape needs a front door and the repository does not describe one → `CAP-S10-1` |
| 7 | **No rollback step** anywhere | `.github/`, `scripts/`, zero matches | **Not operable today.** With fact 1, a bad migration is not revertible by the deploy path: the health poll fails and `exit 1` leaves the failed state in place. Writing one is a CI change, out of scope — so this is left visible, not repaired |
| 8 | **Process-local in-memory state** — session transports and identity, rate-limit windows, the Tier-2 breaker, audit and event buffers; no Redis or shared store anywhere | `src/transport/http.ts:82`–`:83`; `rate-limit-middleware.ts:58`; `tier2-circuit-breaker.ts:68`–`:76`; `pg-audit-transport.ts:45`, `:48`–`:52`; `pg-event-transport.ts:15`–`:38` | **Cannot be determined.** The state is process-local as a matter of repository fact, so the verdict turns entirely on the running instance count — which fact 10 records as not discoverable → `CAP-S10-3`. Conditionally: operable at one instance per service, **not** operable under replication, and `F-S10-3` records that failure precisely — an unknown session gets `404`/`-32000` on POST and `400` on GET/DELETE. The condition is stated rather than resolved because resolving it needs an off-repo fact |
| 9 | **Non-probing `/health`**; no metrics exporter, no tracing SDK | `src/transport/http.ts:91`; worktree-wide search | **Not operable** as a readiness signal for a two-process shape. The deploy gate polls `docker inspect` for three consecutive healthy results, which reports process liveness, not dependency reachability. No endpoint is written here → `CAP-S10-1` |
| 10 | **Single-instance VPS**, self-documented: one `secrets.VPS_HOST`, `docker compose ps -q app` expects one container, and `.env.example:79`–`:81` states the assumption in prose | `.github/workflows/cd-prod.yml`; `.env.example:79`–`:81` | **Cannot be determined.** The actual running instance count and the process supervisor are not discoverable from the repository. Every §5.5 resolution and alternative-3 rejection rests on this → `CAP-S10-3` |

**Summary: 3 operable (facts 1, 2, 4), 2 not operable today (facts 7, 9), 5 cannot be determined
(facts 3, 5, 6, 8, 10).** The buckets are named so the count is checkable against the table rather
than taken on trust; every verdict cell carries exactly one of the three labels, and fact 8's
conditional sub-result is stated inside its *cannot be determined* verdict rather than standing as
a fourth category. The two *not operable*
verdicts (facts 7 and 9) are real incompatibilities between the selected shape and the repository
as it stands, and neither is repaired here because repairing either is a CI or source change this
sub-task places out of scope. They are recorded so an implementation charter meets them as stated
work rather than as a surprise.

---

## 10. Spikes and caps

### 10.1 Spikes filed: none. Four candidates evaluated.

`OUT-10` assigns spike execution to this sub-task, and the honest result is that **no spike was
needed and none is filed**. SUB-1's test — "could this have been read instead?" — is the gate, and
`13_…md` §11.4's withdrawn-spike precedent is the disclosure obligation. Every candidate is
disclosed rather than dropped.

| # | Candidate | Disposition |
| --- | --- | --- |
| 1 | Do two concurrent boot migrators serialize, double-apply, or deadlock? | **Withdrawn — the read test passed.** Answered with certainty by reading `node_modules/drizzle-orm/pg-core/dialect.js:44`–`:72` (drizzle-orm 0.45.1) and `drizzle/0000_strong_tarantula.sql:1`: no lock exists, and the DDL is not idempotent. → `F-S10-2` |
| 2 | Can a second replica serve a session it did not create? | **Withdrawn — the read test passed.** Answered by reading `src/transport/http.ts:82`–`:83`, `:226`–`:232`, `:245`–`:250`: the maps are closure-scoped, and both miss paths are explicit. → `F-S10-3` |
| 3 | Can a separate store satisfy a cross-category consistency requirement? | **Withdrawn — the read test passed.** Answered by reading the seven atomicity rows in `10_…md` §8 / `08_…md` §8 against `src/ports/unit-of-work-port.ts:26`–`:28` and `09_…md` §7's termination premise |
| 4 | What is the AI latency, privacy and cost envelope? | **Capped, not executed.** Infeasible on two independent grounds: no AI provider credential was reachable in this run, and `A-26` records that **no budget exists to test against** — a measurement with no acceptance threshold answers nothing. `A-26` is cited at `DR-C10-S10-3` instead |

A fifth question — the two-writer divergence of `CAP-S6-1` — is treated in §10.3 rather than as a
candidate here, because its owner is a cap that already exists.

### 10.2 Caps filed

| Id | Cap | What it leaves unsupported | Owner |
| --- | --- | --- | --- |
| `CAP-S10-1` | Hosting region, provider, TLS termination, backup and monitoring are not discoverable in the repository, and no operator answer was available in this run | The two-process shape's front door, provisioning and readiness signalling are unspecified; facts 3, 5, 6 and 9 of §9 return *cannot be determined* on its account | The operator, reconciled at **NEU-896** |
| `CAP-S10-2` | The citation-drift verdict producer's **scheduling and dequeue mechanism is not selected** | `DR-C10-S2-3`'s producer has a process placement but nothing that triggers it; no scheduler, queue or job runner exists in the repository to adopt | **NEU-896** |
| `CAP-S10-3` | The **actual production instance count and process supervisor** are not discoverable in the repository; the single-instance premise is self-documented, not verified | Every §5.5 resolution of `SC-S3-20`, `SC-S3-21` and `SC-S3-18`, and the rejection of horizontal replication, hold only while the premise does | The operator, reconciled at **NEU-896** |
| `CAP-S10-4` | The **`SC-S3-37` DP-map import mechanism is not selected** — `08_…md` §8.6 records the mechanism as SUB-10's and SUB-8's, and SUB-8 is merged | `SC-S3-37`'s destination is named (§5.4) but nothing performs the import; the same root cause as `CAP-S10-2` — no scheduler exists and none is selected | **NEU-896** |

**`CAP-S10-1` discharges `OI-S1-3` by the route that item names**, which permits conversion "to a
`CAP-S10-<k>` entry stating which fact remains unknown and what decision it leaves unsupported".
**`CAP-S10-2` discharges `OI-S2-1` by the route that item names**: "or filing a `CAP-S10-<k>`
stating that it does not select one and what that leaves unsupported… whichever way it goes. **A
plausible guess at a mechanism is not a resolution.**" No guess is offered.

### 10.3 Caps inherited and not lifted

| Cap | Status after this chapter |
| --- | --- |
| `CAP-S6-1` | **Not lifted.** It records that SUB-10 "must therefore stand up a store to reason about" two-writer divergence, and that "asserting is not an available third option". **No store could be stood up**: no container runtime is present in the execution environment and `127.0.0.1:5432` refuses connections — the same `ECONNREFUSED` class the cap itself recorded. Nothing is asserted in its place. Noted: `DR-C10-S10-1` selects a **single-writer** topology, so the divergence has no configuration in which to arise under the selected substrate — which narrows the cap's practical reach without closing it |
| `CAP-S15-1` | **Not lifted; one of two preconditions now satisfied.** It requires "a selected deployment topology (process boundaries, host placement, network path) **together with** a harness reporting a distribution". `DR-C10-S10-2` supplies the topology. The harness is not supplied and cannot be — no two-process topology is deployed to measure |
| `CAP-S15-2` | Unchanged. All three SUB-15 decisions rest on `A-27` and go stale **together**; nothing here touches `A-27` |
| `CAP-S8-1` | Unchanged. `RD-S8-1`…`RD-S8-5` remain specified and never executed |
| `CAP-S4-1` | **Untouched and not closed** — the operational-log deletion owner remains unassignable. §5.4 records `SC-S3-41`'s adjacent precondition as an **eighth sighting** without claiming the cap covers it |
| `CAP-S5-1` | Unchanged. The isolation invariant is well-formed and never satisfiable, zero positive instances |
| `CAP-S16-1` | Unchanged. `SC-S3-45`'s verdict remains permanently unimprovable |

---

## 11. Dispositions of inherited items

| Item | Disposition |
| --- | --- |
| `OI-S1-3` (assumption 31) | **Discharged by conversion** → `CAP-S10-1`, the route the item names |
| `OI-S2-1` | **Discharged by cap** → `CAP-S10-2`. Process placement decided (`DR-C10-S10-2` consequence 6); mechanism not selected, and not guessed |
| `OI-S3-2` | **Already discharged by SUB-4** at `05_…md` §8, by publication and not by cap. Consumed here as an input: `SC-S3-37` holds one imported copy, `SC-S3-40` holds none |
| `OI-S6-1` | **Discharged** — the §5.3 check was run and its result recorded: selection stable, no finding to SUB-6 |
| `OI-S8-1` | **Remains open.** `context_tokens` still has only `id`, `created_at`, `expires_at` (`src/infrastructure/db/schema.ts:312`–`:321`). Its resolving event is code landing, which this chapter does not produce |
| `OI-S8-2` | **Remains open**, and is now **sighted twice more** — §8.1 and §8.4 each inherit an STDIO obligation that has no gate to extend. Recorded rather than silently carried |
| `OI-S9-4` | **Discharged** — answered explicitly **No** (§6.2). `DR-C10-S9-1` stands. `F5.8` is answered; `F-S10-1` corrects SUB-9's stated reason |
| `OI-S13-1` | **Discharged by reconciliation** — all eighteen rows resolved to a destination or explicitly recorded unplaced (§5.4), and all four named cross-category interactions dispositioned (§5.5) |
| `OI-S16-1` | **No action owed.** SUB-10 is named consumer, not owner; the owner is SUB-12. Consumed as-is: the rows in §5.4 are resolved against a model carrying two unanswered questions, and that is stated rather than hidden |
| `F-S2-2`, `F-S4-5`, `F-S6-1`, `F-S6-4`, `F-S15-1` | Consumed as constraints. `F-S15-1` in particular: **no decision here is justified by the application reusing core code** — §8's answers rest on vocabulary and obligation, never on reuse convenience |
| `F-S5-4` | Consumed. No state category can reach `holds`; "a column cannot supply a principal the transport never produced". Cited at `SC-S3-45` (§5.4) |
| `F-S6-2` | Inherited unrepaired — `reviewPersistence` is absent from `UnitOfWorkPort`'s `TransactionPorts`, so `SC-S3-3`'s read-compute-write is unwrapped. One store makes the fix available; it does not perform it |
| `F-S14-5` | **Premise does not hold; routed rather than answered.** See below |
| `F-S15-2` | Carried forward unchanged, and load-bearing: it is why no latency argument appears in `DR-C10-S10-1` and why two hosts were rejected in `DR-C10-S10-2` |

**`F-S14-5` in full.** Its core is `SC-S3-31`'s Concurrency cell: two assessments of the same
`node_id` + `skill_type` "must serialize **if the record is an aggregate**; append-per-event has
**no race**. Which of the two shapes applies is not determined by any merged input — **SUB-10
decides it with the store**."

Selecting one Postgres instance does **not** decide it. Both shapes are expressible in one store,
and record shape is schema design, which `OUT-8` places out of scope. The store supplies
`SC-S3-31`'s **destination** (§5.4) and not its shape. Filed as **`F-S10-4`** and routed, rather
than answered by assertion. **SUB-14's walk counts are preserved unchanged: 180 walks, 178 defined,
2 undefined.** Note also that `F-S14-5` was handed to SUB-16 as NEU-980, which is a mis-pairing —
an `F-S16-1` instance — and this chapter neither repairs nor propagates it.

---

## 12. Scope check

| Excluded by `OUT-8` | Result |
| --- | --- |
| The architecture-material rule and SUB-15's three client-tier decisions | **Consumed as decided.** §3 applies the rule; no clause of it is restated as this chapter's own, amended or demonstrated. No finding routed to SUB-15 |
| Framework and library selection | **None made.** No framework, library, package, product or vendor is selected anywhere in this chapter or in the three decision records. `drizzle-orm` 0.45.1 and Pino are read as *existing facts*, never chosen |
| Writing any Dockerfile, compose file, IaC or CI change | **None written.** `git diff --numstat` for this change touches only `docs/research/C010-system-and-repository-architecture/**` |
| Deploying anything | **Nothing deployed.** No host, process, service, database or configuration exists as a result |
| Repository topology | **Not decided.** `DR-C10-S9-1`'s `T2` is consumed; `OI-S9-4` is answered, which confirms it rather than re-deciding it |
| Endpoint or schema design | **None.** No table, column, index, constraint, route or payload is specified. Record shape is explicitly left open (§11) |
| Hosting region, provider, TLS, backup and monitoring | **Not decided** → `CAP-S10-1` |
| NEU-890's settled decisions | **Consumed, not reopened** |
| Spike artifacts in `src/` or merged as product code | **None.** No harness was built; no file outside `docs/` was created or modified |

---

## 13. What this chapter leaves open

Stated plainly, because a reader acting on this chapter needs the boundary as much as the content.

1. **The authoring-time execution environment has no make-or-reuse record** (§8.6), and no
   isolation primitive or substrate is selected for it. `F5.9` fired.
2. **No scheduler exists and none is selected** — `CAP-S10-2` (drift dequeue) and `CAP-S10-4`
   (DP-map import) share one cause.
3. **Four operational facts about the running deployment are unknown** — `CAP-S10-1`,
   `CAP-S10-3`.
4. **Two production incompatibilities are recorded and unrepaired** — no rollback path, and a
   non-probing `/health` (§9, facts 7 and 9).
5. **`SC-S3-31`'s record shape is undecided**, and `SC-S3-42`'s and `SC-S3-31`'s two undefined walk
   outcomes remain undefined.
6. **`OI-S8-1` and `OI-S8-2` remain open**, and the STDIO obligation two reuse answers inherit has
   no gate to extend.
7. **The deployed round-trip cost is still unmeasured** — `CAP-S15-1` has one of two preconditions.

None of these is left for SUB-11 or SUB-12 to decide. SUB-11 audits; SUB-12 gates. Each item above
is either owned by a named cap, routed as a finding, or declared as a gap for the completeness gate
to dispose of.
