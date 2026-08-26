# The rollout sequence, and what each stage cannot undo

**Sub-task:** SUB-7 (NEU-1001) · **Covers:** OUT-3, OUT-4
**Written:** 2026-08-26 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `ee0a750`
**Depends on:** SUB-1 (NEU-993), published at `01_production-evidence-and-the-access-audit.md`; **SUB-2 (NEU-994), at `02_identity-the-learner-key-and-principal-kind.md`** — the determined principal kind every later stage reads; SUB-4 (NEU-996), at `04_the-stdio-identity-gate-and-the-bound-context-token.md`; SUB-5 (NEU-997), at `05_the-enforcement-point-that-confines-every-read-and-write.md`; SUB-6 (NEU-1000), at `06_the-disposition-of-every-unowned-row.md`; SUB-15 (NEU-998), at `15_operational-objectives-for-the-real-platform.md`; SUB-16 (NEU-999), at `16_attribution-and-detection.md`
**Consumes:** `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md` (§4.3's `I4`→`I5` sequencing consequence, binding); `../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` (reject-don't-grandfather); `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md` (the deployment shape, cited not re-derived)
**Decision records:** `DR-C11-S7-1`, `DR-C11-S7-2` · **Traceability:** `traceability/S7_the-rollout-sequence.md`

---

## 0. What this chapter is

Four predecessors each hand forward a **partial** order over rollout stages. None of them owns the
global order, and each says so explicitly. This chapter composes those partial orders into **one
total order**, then attaches to every resulting stage the five fields OUT-3 requires, the disable
path OUT-3's feature-control clause requires, and the reversal position OUT-4 requires.

**Three things it deliberately does not do.**

1. **It does not re-decide anything.** The disposition is SUB-6's, the enforcement point is SUB-5's,
   the gate is SUB-4's, the objectives are SUB-15's and the detection matrix is SUB-16's. Where this
   chapter appears to add a constraint, it is composing two existing ones and saying so.
2. **It does not write the runbook.** SUB-13 (NEU-1006) authors the DDL and the executable runbook.
   This chapter supplies the order, the entry and exit conditions and the reversal positions that
   runbook is written against. Nothing under `src/` or `drizzle/` changes here.
3. **It measures nothing.** No production credential exists (`F-S1-2`). Every duration, cadence and
   threshold below is a cited derivation, a registered stand-in, or an explicitly unbounded quantity
   named as such. **The evidence label `observed-in-production` is applied to zero claims in this
   chapter** — this sentence names the label, it does not use it.

---

## 1. The platform the sequence is executed on

Every fact below was read first-hand at this chapter's cutoff, not inherited.

| Fact | Evidence |
| --- | --- |
| Deploys are triggered by **CI completing**, not by the push itself — `workflow_run` on workflow `CI`, `types: [completed]`, `branches: [develop]`. | `.github/workflows/cd-prod.yml:3`–`:7` |
| `deploy-prod` runs only when the triggering CI run concluded `success` and its event was a `push`. | `.github/workflows/cd-prod.yml:19`–`:21` |
| cd-prod is **serialised**: `concurrency: group: cd-prod`, `cancel-in-progress: false`. A second run queues; it does not run alongside the first. | `.github/workflows/cd-prod.yml:9`–`:11` |
| The deploy reaches one VPS by SSH and the compose stack lives **outside this repository**, at `COMPOSE_DIR=/home/deploy/docker-services/second-memory-mcp`. | `.github/workflows/cd-prod.yml:15`, `:26`–`:30` |
| The deploy job ends in a health poll that fails the job after 45 polls. | `.github/workflows/cd-prod.yml:100`–`:104` |
| **`smoke-test` declares `needs: [deploy-prod]`.** The smoke run executes *after* the deploy has landed. | `.github/workflows/cd-prod.yml:110`–`:111` |
| The smoke job mints a `client_credentials` token on every release. | `.github/workflows/cd-prod.yml:145`–`:168` |
| Migrations run **first** in `bootstrap()`, unconditionally, with no environment guard and no repository-owned lock. | `src/transport/main.ts:27`; `src/infrastructure/db/migrate.ts:38`–`:50` |
| Transport and auth configuration are resolved **after** that, at boot. | `src/transport/main.ts:42`–`:43` |
| Application configuration — including the existing feature toggle — is resolved in the composition root, also at boot. | `src/composition-root.ts:377`, `:379` |
| A feature-toggle precedent already exists: `CLASSIFIER_ENABLE`, with a deprecated alias and explicit conflict detection. | `src/config/resolve-classifier-config.ts:22`–`:62` |
| That toggle has an operator runbook — but **its own emergency-disable path is deploy-borne**: step 1 sets `CLASSIFIER_ENABLE=false` *"immediately"* and **step 2 is `Deploy.`** | `docs/runbooks/classifier-blocking-activation.md:261`–`:262` |
| **No path anywhere in that runbook is deploy-independent.** Its other application points route through a deploy too, and the "next deploy" wording at `:167`/`:169` is about a *different* variable, `CLASSIFIER_BLOCKING_FIELDS`. | `docs/runbooks/classifier-blocking-activation.md:131`, `:137`, `:140`, `:167`, `:169`, `:185` |

Two consequences follow immediately, and both are registered rather than left in prose.

**The smoke break does not stop the rollout; it blinds it.** Because `smoke-test` needs
`deploy-prod`, a smoke failure happens when the new code is already running in production. The
deploy is not prevented and the next deploy still fires, because cd-prod is gated on the **CI**
workflow's conclusion (`:19`–`:21`), not on its own previous smoke result. What a standing smoke
failure destroys is the post-deploy verification — which `16_attribution-and-detection.md:146`
records, in the `FM-S16-4` rollout-regression row, as *"the only automated post-deploy signal the
platform has"*. This is **`F-S7-1`**, and it sharpens rather than contradicts `F-S5-12` and
`R-S4-2`, whose wording ("breaking the deploy on every release") describes the workflow going red
rather than the deployment being blocked.

**Stated precisely, because the near-miss here is easy to make.** `SIG-S16-4` has exactly two limbs,
(a) and (b), and **neither of them is the smoke run**. Limb (b) — the 401/403 refusal rate off
`mcp_request_log.response_status` — is a database aggregate, and a red smoke job cannot make it
uninterpretable; `16_attribution-and-detection.md:203`–`:206` records it as *"the only signal in this
entire matrix computable from data the deployment emits today"*, which is a different claim about a
different thing. What the smoke run uniquely supplies is the **automated post-deploy check**, and
that alone is what a standing failure costs.

**Every disable path costs a restart, and every restart re-enters the migration.** Configuration is
read at boot (`src/transport/main.ts:42`–`:43`, `src/composition-root.ts:379`) and boot runs the
migrator first (`src/transport/main.ts:27`). So applying any environment-variable control requires a
container restart, and that restart executes the migrator **before** the new value is read. During a
migration-bearing stage, using the disable path therefore re-enters the migration it is being used to
contain. This is **`F-S7-2`**, and it is the reason §9 below separates containment from reversal
rather than treating the disable path as a cheap step.

---

## 2. The constraint set the order must satisfy

Every partial order the predecessors hand forward, with its source. The total order in §3 is checked
against this table row by row in §4, so the composition is auditable rather than asserted.

| # | Constraint | Source |
| --- | --- | --- |
| **K1** | Gate stages run `A` → `B` → `C` → `D`. `D` cannot precede `C` without grandfathering, and cannot precede `A` at all. | `04_the-stdio-identity-gate-and-the-bound-context-token.md:447`–`:451` |
| **K2** | The transport gate is stages `B` and `C`; SUB-4 states that **"under this stage set"** only bookkeeping follows, and explicitly leaves the schedule's own audit to SUB-7. | `04_the-stdio-identity-gate-and-the-bound-context-token.md:452`–`:454` |
| **K3** | `S1` (archive) executes **at or after** the instant the attribution carrier lands. | `A-S6-2`; `06_the-disposition-of-every-unowned-row.md:274`–`:279` |
| **K4** | The ownership column, its backfill and its `NOT NULL` cannot all land in one step: `S3` → `S4` → `S5`. | `F-S5-10`; `06_the-disposition-of-every-unowned-row.md:668`–`:675` |
| **K5** | Within `S4`, parents are keyed before children, in four waves. | `06_the-disposition-of-every-unowned-row.md:703`–`:721` |
| **K6** | `S4` entry requires V1–V7 to pass **and** `P-ORPHAN-2` to return empty. | `06_the-disposition-of-every-unowned-row.md:684`, `:391`–`:399`, `:718`–`:721` |
| **K7** | The enforcement predicate is live before the column is tightened to `NOT NULL`. **Generalised here**: SUB-5's C5 states this of `public.notes` specifically; it is applied to all ten population-A tables, which follows from `F-S5-10`'s three-step requirement holding for every one of them. | `05_the-enforcement-point-that-confines-every-read-and-write.md:762` (C5, `public.notes`); `:636`–`:641` (`F-S5-10`, general) |
| **K8** | The smoke run's disposition precedes the first stage that ships **either** of `F-S5-12`'s two causes, because neither cause's removal unbreaks the other. | `F-S5-12`; `91_findings-register.md:610`–`:617` |
| **K9** | The transport gate is **not last**. Stated as *"a rollout that treats the STDIO gate as the last item will discover the principal-kind problem at the end"* — the source says **"at the end"**, and says nothing about irreversibility. | `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:494`–`:496`; charter assumption 5 |
| **K10** | `S2` is the only irreversible stage in SUB-6's set. | `06_the-disposition-of-every-unowned-row.md:682`, `:695`–`:697` |
| **K11** | **The two fixes are sequential, not parallel: closing the transport gate surfaces the principal-kind defect, and SUB-2's identity rule is what makes the surfaced kind *answerable* rather than an unanswerable question.** So the identity change lands at or before the first stage that reads a determined kind. | `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:494`–`:496`; `02_identity-the-learner-key-and-principal-kind.md:213`–`:216`, which names SUB-7's rollout directly |
| **K12** | The principal-kind defect must surface **before the migration becomes irreversible**. **This is not C010 §4.3's wording** — §4.3 says "at the end". It is the charter's own § Risks row 3, i.e. this chapter's `R3`, and it is carried as a constraint in its own right rather than folded into `K9`. | Charter § Risks row 3 (`R3`, authored in `92_risk-register.md` § SUB-7) |

---

## 3. The total order

Ten stages, `T0` … `T9`. The rationale column states why the stage sits where it does, not what it
does; §6 carries the full per-stage content.

| # | Stage | Why here |
| --- | --- | --- |
| **T0** | Dispose of the deploy pipeline's smoke run | **K8.** Must precede both `T6` and `T8`. Placed first because it is the only stage that costs no schema change and, until it is done, every later stage lands without a working post-deploy check. |
| **T1** | Land **SUB-2's identity rule** and the attribution carrier | **K3** and **K11.** `S1` cannot run before the carrier, and the carrier cannot write a correct value before the determination exists — `principal_kind` *is* `DR-C11-S2-2`'s determined kind (`16_attribution-and-detection.md:78`), so the rule and its first persistence site land together for the same reason `T3` combines two nullable additions. It is also what makes `SIG-S16-1` limb 1a and `SIG-S16-4` limb (a) computable at all, so it builds the observability every later stage's isolation signal is read through. |
| **T2** | `S1` — archive the pre-cutover log population | **K3** satisfied by `T1`. Placed before the column work so the two log tables are closed and the live tables continue from empty while the schema work proceeds. |
| **T3** | Additive schema, nullable — gate stage `A` **and** `S3` | **K1** (`A` first), **K4** (`S3` first). Both are pure additions with no refusal behaviour, so they share one boot migration and one restart rather than spending two. |
| **T4** | Gate stage `B` — observe-only on both transports | **K1**, **K2**, and **K9**. This is the chapter's answer to §4.3: observe-only records what *would* be refused and refuses nothing, so the `sub`/`azp` principal-kind defect surfaces here — at position 5 of 10, and **before the only irreversible stage**. |
| **T5** | `S2` — purge `context_tokens` | **K10.** The only irreversible stage, deliberately placed *after* `T4` so that nothing is destroyed before the defect §4.3 warns about has been observed. |
| **T6** | Gate stage `C` — enforce | **K1**, **K8**. The transport gate lands here, with three substantive stages still to come. Placed before `T8` on SUB-5's own argument that an adapter-level refusal is "harder to attribute" (`05_the-enforcement-point-that-confines-every-read-and-write.md:1217`–`:1221`) — landing the transport refusal first means the first failures a reader sees are the legible ones. |
| **T7** | `S4` — backfill, in `§9.3`'s four waves | **K4**, **K5**, **K6**. |
| **T8** | Enforcement point live at the Drizzle adapter | **K7**, **K8**. Placed *after* the backfill so the predicate goes live over a population that already carries an owner. Reversing these two would confine a partly-NULL population and hide pre-cutover rows from every principal, which is `R-S5-1`'s exact failure mode. |
| **T9** | Tighten — `S5`, gate stage `D`, and the carrier's own constraint | **K1** (`D` after `C`), **K4** (`S5` last), **K7**. Three tightenings that each require their predecessor and none of which changes behaviour, so they share one restart. |

`DR-C11-S7-1` records this order with its rejected alternatives.

---

## 4. The sequencing audit

Run against §2 row by row. **Twelve constraints, twelve satisfied.**

| Constraint | Where satisfied | Verdict |
| --- | --- | --- |
| K1 `A`→`B`→`C`→`D` | `A` at `T3`, `B` at `T4`, `C` at `T6`, `D` at `T9` | **Satisfied.** `D` follows `C` by three stages and `A` by six. |
| K2 gate is `B` and `C` | `T4` and `T6` | **Satisfied as to identity.** See `F-S7-3` for the "only bookkeeping after it" half, which does not survive composition. |
| K3 `S1` at or after the carrier | carrier `T1`, `S1` `T2` | **Satisfied**, by one stage. |
| K4 `S3`→`S4`→`S5` | `T3`, `T7`, `T9` | **Satisfied.** |
| K5 four waves inside `S4` | `T7`, §6 | **Satisfied**, carried forward verbatim. |
| K6 V1–V7 and `P-ORPHAN-2` gate `S4` | `T7` entry condition | **Satisfied**, both named as hard entry conditions. |
| K7 predicate live before `NOT NULL` | predicate `T8`, `NOT NULL` `T9` | **Satisfied.** |
| K8 smoke disposition first | `T0`, before `T6` and `T8` | **Satisfied**, by six and eight stages respectively. |
| K9 gate not last | gate at `T4`/`T6`; three stages follow `T6` | **Satisfied.** The gate is not "the last item"; the defect is not discovered "at the end". |
| K10 `S2` the only irreversible stage | `T5` | **Satisfied**, and it is the only stage §9 names irreversible. |
| K11 identity rule at or before the first determined-kind read | identity rule at `T1`; first read of a determined kind is `T1`'s own exit | **Satisfied**, and it was **missed by the first draft of this audit** — the order presupposed a determined kind at `T1`, `T6` and `T8` without staging the change that produces it. Recorded as such rather than presented as designed-in. |
| K12 defect before irreversibility | defect surfaces `T4`; only irreversible stage is `T5` | **Satisfied with margin**, on this chapter's own `R3` rather than on §4.3, which does not say this. |
| **S2/S3 order** — not a constraint, a **departure** | SUB-6 numbers `S1`→`S2`→`S3`; this order runs `S1`(`T2`) → `S3`(`T3`) → `S2`(`T5`) | **Licensed, and stated rather than silent.** SUB-6 fixes only the intra-`S4` order and says *"Sequencing is SUB-7's under OUT-3 and is **not fixed here**"* (`06_the-disposition-of-every-unowned-row.md:278`). No constraint governs the `S2`/`S3` relation, so the numbering is presentational, not an ordering. `S2` is moved after the observe-only stage deliberately, per `K12`. |

**On K9 specifically, because it is the binding one.** C010 §4.3's consequence is that the
unauthenticated transport *masks* the `sub`/`azp` principal-kind defect, so closing the gate makes the
defect visible rather than resolving it, and a sequence that schedules the gate last discovers it at
the end. This order does three things about that:

1. **The principal-kind work is not at the end.** It is at `T4`, position 5 of 10.
2. **It is separated from enforcement.** `T4` is observe-only — it *reveals* the defect without
   refusing anything, which is the cheapest possible place to discover it. Enforcement is at `T6`,
   two stages later, by which time the observation exists.
3. **The surfaced defect is answerable, not merely visible.** §4.3's consequence is that *"the two
   are sequential… and fixing the first surfaces the second"*, and SUB-2 states the complement: its
   identity rule is what means that *"when SUB-7's rollout advances the frontier from `I4` to `I5`,
   there is a determined kind to read instead of an unanswerable question"*
   (`02_identity-the-learner-key-and-principal-kind.md:213`–`:216`). That change is staged at `T1`,
   three stages before the observation reads it. **The first draft of this chapter did not stage it
   at all** and presupposed it at `T1`, `T6` and `T8`; `K11` exists because of that omission.
4. **It precedes the only irreversible stage.** `T5` is the single stage that destroys state
   (`K10`), and `T5`'s entry condition requires `T4`'s observation to have been read.

**Two sources, kept separate, because conflating them would misquote one.** §4.3's own words are
*"will discover the principal-kind problem at the end"* — it says nothing about irreversibility, and
neither does charter assumption 5. The irreversibility clause is the charter's **§ Risks row 3**,
which is this chapter's own `R3`. `K9` is discharged against §4.3; `K12` against `R3`. An earlier
draft of this section attributed `R3`'s wording to §4.3 in quotation marks and then reported §4.3 as
discharged by it; that quotation was not in the source and has been removed.

**No amendment is routed to `NEU-895`.** §4.3's consequence is honoured as written; nothing in this
chapter contradicts it, so the recorded-amendment route the charter's § Risks row 3 names is not
taken. What this chapter adds — that observe-only is the right *instrument* for surfacing the defect
early — is an addition to a consumed constraint, not a contradiction of one.

---

## 5. Both smoke-run causes, sequenced around independently

`F-S5-12` is explicit that there are two independent causes and that removing one does not unbreak
the run. Handling them therefore cannot be a single step.

| | Cause 1 — the transport gate | Cause 2 — the enforcement point |
| --- | --- | --- |
| **What refuses** | The gate refuses the `client_credentials` principal under `DR-C11-S2-2`. | The Drizzle adapter refuses every row-owning operation for a `client`-kind principal, at construction, unconditionally on any middleware being mounted. |
| **Source** | `F-S4-3`; `R-S4-2` | `F-S5-12`; `91_findings-register.md:610`–`:617` |
| **Lands at** | `T6` | `T8` |
| **Sequenced around by** | `T0`, six stages earlier | `T0`, eight stages earlier |

**Which smoke scenarios actually break, counted rather than assumed.** The suite has **eight**
scenarios — eight `it()` blocks in `tests/smoke/smoke.test.ts`, at `:104`, `:111`, `:128`, `:152`,
`:163`, `:200`, `:231` and `:263`. **Six survive both causes.** `GET /health` (`:104`) and
`GET /version` (`:111`) are plain HTTP and touch no principal. The MCP `initialize` handshake
(`:128`) and the `initialized` notification (`:152`) are protocol-level. `session DELETE cleans up
gracefully` (`:263`) issues an HTTP `DELETE` against the MCP endpoint (`:266`–`:268`), not a
`tools/call`, and the gate's method predicate covers `tools/call` only (`F-S11-3`), so it is outside
both causes. `init_agent_context` (`:163`, with its tool name at `:168`) is one of the three
gate-exempt tools, and — the part that has to be checked rather than assumed — the enforcement point
deliberately leaves its port unscoped: `ContextTokenRepository` is row 6 of SUB-5's per-port table,
**"Port layer, no owner predicate"**, because the token row is what *carries* the principal and
cannot be confined by the principal it establishes
(`05_the-enforcement-point-that-confines-every-read-and-write.md:338`). So `init_agent_context`
survives both causes.

**Exactly two of the eight break, and both break twice:** `list_learning_items` (`:206`) and
`session_status` (`:237`). Each is refused independently by cause 1 at `T6` and by cause 2 at `T8`.
This is the concrete content of "unmounting one does not unbreak it" — fixing the gate leaves both
scenarios failing at the adapter, and fixing the adapter leaves both failing at the transport.

**Why `T0` is a stage and not a footnote.** `R-S4-2` names three mutually exclusive routes —
re-scope the suite, re-provision the smoke principal as a user-kind principal, or accept a
known-failing step. They have different consequences and one of them must be *chosen* before `T6`.
No party has chosen. That decision is `OI-S7-1`; SUB-4's `OI-S4-2` covers one input to it (whether
re-scoping loses regression value) and is cited rather than restated.

**The third route is not free.** "Accept a known-failing step" leaves `SIG-S16-4`'s only automated
limb permanently red for the remainder of the rollout, which by `F-S7-1` is precisely the signal the
later stages are watched through. That exposure is `R-S7-1`.

---

## 6. The stages

Every stage carries all five of OUT-3's fields. Signals are resolved against SUB-16's matrix
(`FM-S16-1` … `FM-S16-4`, `SIG-S16-1` … `SIG-S16-4`) rather than invented here. **Every alert route in
that matrix is `[unconfirmed]` against `OI-S1-9`, under stand-in `A-S16-1`** — stated once here and
not repeated per stage; the exposure is `R-S16-2`, cited and not re-raised.

### T0 — Dispose of the deploy pipeline's smoke run

- **Entry.** One of `R-S4-2`'s three routes is chosen and recorded (`OI-S7-1`).
- **Exit.** A green cd-prod run whose smoke job passes under the chosen route, with the two affected
  scenarios either re-scoped, re-provisioned, or explicitly marked expected-failing.
- **Isolation signal.** None — this stage changes no access path.
- **Health signal.** `SIG-S16-4` limb (b): the refusal rate computed from
  `mcp_request_log.response_status`, which SUB-16 records as the only signal computable today with no
  schema change. Baseline it here, because every later stage is read against it.
- **Owner.** The creator, as sole operator — `R-S4-2` names no other party.

### T1 — Land SUB-2's identity rule and the attribution carrier

- **Entry.** `T0` exited.
- **Exit.** The `sub || azp` merge at `src/transport/jwt-middleware.ts:127` is gone and a principal's
  kind is **determined** under `DR-C11-S2-2` rather than collapsed; both log tables carry
  `principal_kind` and `learner_key`; and new rows are written with that determined kind.
- **Isolation signal.** `SIG-S16-1` limb 1b becomes computable — `principal_kind = 'client'` on a
  non-exempt tool.
- **Health signal.** Audit-write success rate; a fall indicates the writer is failing rather than the
  gate.
- **Owner.** SUB-2 (NEU-994) for the identity rule; SUB-13 (NEU-1006) for the DDL; the creator to apply.

**Why the identity rule shares this stage rather than getting its own.** It is not bundled for
convenience. `principal_kind` is defined as *"`DR-C11-S2-2`'s determined kind"*
(`16_attribution-and-detection.md:78`), so a carrier that lands before the determination has no
correct value to write and would populate `none` for principals that do have a determinable kind —
polluting exactly the column `T4`'s observation later reads. The determination and its first
persistence site are one landing for the same reason `T3`'s two nullable additions are: they share a
boot and separating them creates an intermediate state worse than either endpoint. The identity
change is non-breaking on its own — it changes what is *recorded*, not what is *refused*; refusal
arrives at `T6` and `T8`.

**A note SUB-13 needs, which is a composition of two existing facts and not a new constraint.**
`principal_kind` is `TEXT NOT NULL` (`16_attribution-and-detection.md:74`), and `F-S5-10` says a
`NOT NULL` column cannot be added to a populated table "without a backfill **or a default**". The
carrier has a correct default available where the ownership column does not: `none` is defined to
mean, among other things, that "the record predates attribution"
(`16_attribution-and-detection.md:89`). So `T1` lands in **one** step with a `'none'` default, while
the ten-table ownership column at `T3`/`T7`/`T9` needs **three**. The asymmetry is a property of the
two columns' domains, not an inconsistency between the two predecessors.

### T2 — `S1`, archive the pre-cutover log population

- **Entry.** `T1` exited — this is `A-S6-2`, discharged.
- **Exit.** Both live log tables contain only post-carrier rows; the pre-cutover population is in the
  retained store, deleted by nothing.
- **Isolation signal.** Every row in the live log tables carries a non-`none` `principal_kind`.
- **Health signal.** Audit and event write success during and after the move — this is where
  `F-S6-5`'s transient write window is watched.
- **Owner.** SUB-13 for the migration; the creator to apply.

**`F-S6-5`'s window, sequenced around as a window.** The two log tables are written by
`src/transport/pg-audit-transport.ts` and `src/transport/pg-event-transport.ts`; moving them opens a
window in which those writes can fail. SUB-6 registered this explicitly as **not** a third standing
cause of the `F-S5-12` break. This chapter treats it accordingly: it is not given a stage of its own
and does not change the order. It is handled **inside** `T2` by three requirements — the move is the
only operation in this stage, so the window is not extended by unrelated work; the stage is scheduled
when the refusal-rate baseline from `T0` is quiet; and both transports buffer and drop rather than
crash, so the failure mode is lost audit entries, not a failed deploy. Whether the loss fits inside
`OBJ-10`'s ≤ 60 s allowance **is not claimed** — SUB-6 declined to claim it because `S1`'s duration is
unbounded, and this chapter does not manufacture a bound SUB-6 declined to state. `OBJ-10` is in any
case a **lower** bound per `F-S16-2`.

### T3 — Additive schema, nullable: gate stage `A` and `S3`

- **Entry.** `T2` exited.
- **Exit.** `context_tokens` carries its three new columns nullable and HTTP mints bind; the ten
  population-A tables carry the ownership column nullable. Nothing refuses.
- **Isolation signal.** None yet — the column exists and confines nothing. Stated rather than left
  blank, because a column present without a predicate is exactly the condition `R1` warns reads as
  evidence of confinement.
- **Health signal.** Boot duration for this migration, against `OBJ-8` (§10).
- **Owner.** SUB-13 for the DDL; the creator to apply.

### T4 — Gate stage `B`, observe-only on both transports

- **Entry.** `T3` exited.
- **Exit.** A stated observation window has elapsed and the record of what *would* have been refused
  has been read by the owner. **This exit condition is a human read, not a metric**, because the
  channel that would deliver it is unconfirmed (`A-S16-1`).
- **Isolation signal.** The would-refuse record itself, partitioned by `principal_kind` — this is the
  first point at which the `sub`/`azp` distribution in production is visible.
- **Health signal.** Unchanged refusal rate. Observe-only must refuse nothing; a change here means it
  is not observe-only.
- **Owner.** The creator.

**This is the stage C010 §4.3 exists to place.** Observe-only "changes no refusal behaviour and
exists only to measure", and SUB-4 states it is **"not a permissive mode"**
(`04_the-stdio-identity-gate-and-the-bound-context-token.md:435`–`:436`; the stage set itself is at
`:440`–`:445`); it is an instrument.
It is the only stage in the sequence whose entire purpose is to produce evidence, and everything
irreversible is downstream of it.

### T5 — `S2`, purge `context_tokens`

- **Entry.** `T4` exited **and** its observation has been read. This is the strongest entry condition
  in the sequence and it exists for one reason: `T5` is the point of no return.
- **Exit.** `context_tokens` is empty; live callers re-mint.
- **Isolation signal.** Every subsequent token carries a binding.
- **Health signal.** Re-mint success rate immediately after the purge.
- **Owner.** SUB-13 for the migration; the creator to apply.

### T6 — Gate stage `C`, enforce

- **Entry.** `T0` exited (K8) and `T5` exited.
- **Exit.** Both transports refuse an absent or NULL binding identically.
- **Isolation signal.** `SIG-S16-2` — the failed-confinement signal, zero-tolerance on HTTP,
  unsettable on STDIO.
- **Health signal.** `SIG-S16-4` limb (b) against `T0`'s baseline. A refusal-rate step change here is
  expected; its **size** is the signal.
- **Owner.** The creator. This is `CC-S8-3`, the breaking change, owned by `NEU-984` and co-named
  `NEU-896`.

### T7 — `S4`, backfill in four waves

- **Entry.** Three hard conditions, all SUB-6's: **V1–V7 pass** (re-run immediately before execution,
  per V7); **`P-ORPHAN-2` returns empty**; and the four-wave order of `§9.3` is respected — the three
  direct backfills first, then `learning_chunks`/`session_chunks`/`session_questions`, then
  `session_question_chunks`/`session_question_attempts`/`linter_validation_corpus`, then
  `session_question_attempt_revisions`.
- **Exit.** Every row in the ten tables carries the verified target subject.
- **Isolation signal.** Count of rows with a NULL ownership key reaches zero.
- **Health signal.** Boot duration per batch, against `OBJ-8`. **This is the one stage whose duration
  scales with row count and whose row count is unknown** (`OI-S6-1`) — see §10.
- **Owner.** SUB-13 for the migration; the creator to apply and to run V1–V7.

### T8 — Enforcement point live at the Drizzle adapter

- **Entry.** `T0` exited (K8) and `T7` exited — the population already carries an owner, so the
  predicate confines correctly from its first request.
- **Exit.** Every row-owning read and write carries the principal predicate; `client` and `none` are
  refused, not empty-scoped.
- **Isolation signal.** `SIG-S16-1` limb 1a — the direct cross-learner-access signal, which becomes
  computable only now, because it needs both the carrier and the ownership column.
- **Health signal.** Refusal rate against `T6`'s post-step baseline.
- **Owner.** SUB-5's design; the creator to apply; the applied result is `NEU-896`'s per `R1`.

### T9 — Tighten: `S5`, gate stage `D`, and the carrier's constraint

- **Entry.** `T8` exited (K7).
- **Exit.** The ownership column is `NOT NULL` on all ten tables; `context_tokens`' NULL-binding rows
  are purged and its columns are `NOT NULL`.
- **Isolation signal.** The schema itself now forbids an unowned row.
- **Health signal.** Boot duration; a failed constraint addition means a row was missed at `T7`.
- **Owner.** SUB-13 for the DDL; the creator to apply.

**`S2` and gate stage `D` are two different purges, and neither subsumes the other** (`F-S7-4`).
`S2` at `T5` empties `context_tokens` wholesale under SUB-6's `purge` disposition. Stage `D` at `T9`
purges rows whose *binding* is NULL — which, after `T5`, can only be rows minted between `T5` and
`T6` on a path that did not bind. Sequencing them six stages apart makes both non-empty and both
necessary; collapsing them would leave the second population unpurged and `NOT NULL` unaddable.

---

## 7. Feasibility against auto-deploy and auto-migrate

Each stage is assessed against the two constraints that make this platform unusual: `develop`
auto-deploys on green CI, and migrations run on boot with no guard.

| Stage | Executable as written? | Method or finding |
| --- | --- | --- |
| T0 | **Yes** | A change to `.github/workflows/cd-prod.yml` or `tests/smoke/smoke.test.ts`. Merging it *is* deploying it, which is acceptable because the stage changes no runtime behaviour. |
| T1, T2, T3, T5, T7, T9 | **Yes, but only as boot migrations** | There is no deploy-independent way to run a migration. Each lands by merge to `develop`, and each is therefore a schema change and its deployment in one event. The consequence is `R-S6-2`'s, cited not re-raised. |
| T4, T6, T8 | **Yes** | Code-only changes. Each still costs a restart, and the migrator still runs at boot and finds nothing pending. |
| **All ten** | **Qualified** | **No stage can be executed at a chosen moment.** A merge to `develop` deploys whenever CI goes green, and `OBJ-7` records ≥ 7 unannounced restarts per day from ordinary version bumps. The operator controls *what* lands, not *when*. This is `F-S7-5`. |

**The one capability check OUT-4 requires.** No rollback action in §9 depends on an image registry,
an IaC revert, a schema down-migration or a backup. That is not a design achievement; it is forced,
because SUB-15's recovery tabletop found four of its six rows resolve to a capability the platform is
not established to have, and the backups question is open as **`OI-S1-8`** — SUB-1's single record of
that fact, cited here by id, with no second record raised. `OBJ-13` (RPO) and `OBJ-14` (RTO) are
**unset**, carried as SUB-15's blocking finding `F-S15-1`. Every reversal below is therefore written
to need none of those four capabilities, and where that is impossible the stage is named irreversible
instead.

---

## 8. The feature-control audit

OUT-3 requires each stage to carry a deploy-independent disable path, or an explicit named exception
with a reason and an owner. **Zero stages are left blank.**

**The mechanism class, first, because all ten stages share it — and one honest correction about its
precedent.** The project already reads behaviour toggles from environment variables at
configuration-resolution time: `CLASSIFIER_ENABLE` at
`src/config/resolve-classifier-config.ts:22`–`:62`, with a deprecated alias and explicit conflict
detection, and an operator runbook at `docs/runbooks/classifier-blocking-activation.md`. **That
precedent establishes the toggle *shape*. It does not establish deploy-independence, and an earlier
draft of this chapter claimed it did.** The runbook's own emergency-disable procedure is
*"1. Set `CLASSIFIER_ENABLE=false` … immediately"* followed immediately by *"2. `Deploy.`"*
(`:261`–`:262`), and every other application point in that runbook routes through a deploy as well
(`:131`, `:137`, `:140`, `:185`). The *"next deploy"* wording at `:167`/`:169` is about a different
variable, `CLASSIFIER_BLOCKING_FIELDS`, not about `CLASSIFIER_ENABLE`.

**So the containment-versus-reversal split OUT-4 asks for is *not* already in house practice.** What
is in house practice is the toggle shape; what is new here is applying it **over SSH directly to the
off-repo compose stack, bypassing the pipeline**. That application has no precedent in this
repository, it depends on a capability only the creator has (SSH to a host outside this repo), and
it is therefore a **specification rather than a demonstrated procedure**. `DR-C11-S7-2` records it
with its rejected alternatives on that honest footing.

Applied to this rollout the control surface is: **an environment variable set on the off-repo compose
stack at `/home/deploy/docker-services/second-memory-mcp`, applied by the operator over SSH,
followed by a container restart.** It is deploy-independent in the sense that matters — it never
traverses `git`, CI or the deploy pipeline — and `DR-C11-S7-2` records it with its rejected
alternatives. **This chapter names the control; it does not build it.** SUB-13 writes it.

| Stage | Control | Operator | Observed how | Position `on` | Position `off` |
| --- | --- | --- | --- | --- | --- |
| T0 | **Named exception.** No runtime control exists, because the stage has no runtime behaviour to disable. Reason: it changes only CI configuration. Owner: the creator. | — | — | — | — |
| T1 | Carrier-write toggle | Creator, by SSH | `SIG-S16-4` limb (b); direct inspection (`A-S16-1`) | Rows carry a determined kind | Rows carry `none`; no write fails |
| T2 | **Named exception for the completed move.** The stage's *action* can be paused mid-flight by the migration toggle below, but once a row is moved there is no toggle that un-moves it. Reason: the archive is a data relocation, not a behaviour. Owner: SUB-13 for the resume logic; the creator to operate. | Creator | Row counts in live vs retained store | Move proceeds | Move pauses, resumable |
| T3 | Migration toggle (batch pause) | Creator, by SSH | Boot duration; column presence | Columns added | Migration deferred to next boot |
| T4 | Observe-only toggle | Creator, by SSH | The would-refuse record's growth | Recording | Not recording; still refusing nothing |
| T5 | **Named exception.** `context_tokens` rows destroyed by the purge cannot be restored by any control. Reason: the stage is irreversible by construction (K10). Owner: the creator. The *entry* to the stage is controllable; its effect is not. | — | — | — | — |
| T6 | Enforcement toggle (gate) | Creator, by SSH | `SIG-S16-2`; refusal rate | Both transports refuse | Gate reverts to observe-only, **not** to open |
| T7 | Migration toggle (batch pause) | Creator, by SSH | NULL-key row count | Batches proceed | Backfill pauses, resumable |
| T8 | Enforcement toggle (adapter) | Creator, by SSH | `SIG-S16-1` limb 1a; refusal rate | Predicate applied | Predicate not applied; **reverts to today's unconfined behaviour** |
| T9 | **Named exception.** A `NOT NULL` constraint is not toggleable; removing it is a migration. Reason: the stage's product is a schema constraint. Owner: SUB-13. | — | — | — | — |

**Four named exceptions, each with a reason and an owner: T0, T2 (partially), T5, T9.** Six stages
carry a real control.

**Two honest qualifications, both registered rather than buried.**

1. **Every "off" position costs a restart, and the restart re-runs the migrator** (`F-S7-2`). On
   `T3` and `T7` this is self-referential: the control that pauses the migration is read only after
   the migration has had another go at running. The pause is therefore *between* batches, never
   *during* one — which is exactly why `R-S6-2`'s batched, idempotent, resumable requirement is load
   bearing, and why this chapter forwards it as a hard obligation on SUB-13 rather than a preference.
2. **`T8`'s "off" position is not neutral.** Disabling the enforcement predicate returns the system
   to today's unconfined behaviour, which is the state the whole package exists to end. It is a
   containment control against a *regression*, not a safe resting place, and the table says so rather
   than presenting `off` as benign.

**The one control that is not per-stage.** The `CD Prod` workflow itself can be disabled in the
GitHub Actions UI, and `SMOKE_PROD_BASE_URL` can be unset — which fails the smoke job hard
(`.github/workflows/cd-prod.yml:140`–`:143`) rather than skipping it. Disabling the workflow stops
*all* deployment. It is a real deploy-independent control and it is recorded here as the
pipeline-level, **all-or-nothing** master switch, credited to no individual stage. It is what an
operator reaches for when the question is "stop everything", and it is the only control in this
chapter that needs no SSH.

---

## 9. The rollback tabletop

Per stage: trigger, action, time bound, owner, data-loss position. **A stage is named irreversible
rather than given a nominal rollback.** Time bounds are expressed in restarts and operator actions,
not in seconds, because no duration on this platform has been measured (`F-S1-2`) and inventing one
would be the failure mode `A-S16-1` guards against.

| Stage | Trigger | Action | Time bound | Data-loss position — **what cannot be recovered at all** |
| --- | --- | --- | --- | --- |
| **T0** | Smoke red for a reason unrelated to the chosen route | Revert the CI change | 1 deploy | **Nothing.** No runtime state is touched. |
| **T1** | Audit-write failure rate rises | Toggle carrier writes off; revert by migration | 1 restart to contain; 1 deploy to reverse | **Nothing irrecoverable.** Rows written while off carry `none`, which is a defined value, not a corruption. |
| **T2** | Write failures persist beyond the move window | Move rows back from the retained store | 1 migration | **Two things, and they are not nothing.** The five-week window in which the Tier-2 aggregate under-reported (`F-S6-3`) is not replayed. And post-cutover rows written while the reversal stood sit alongside pre-cutover rows again, **re-creating the mixed population `S1` existed to end** — the rows return, the timestamp separation does not. |
| **T3** | Boot duration breaches `OBJ-8` | Drop the added columns | 1 migration | **Nothing.** Nullable columns carrying no data. |
| **T4** | Observe-only is found to refuse something | Toggle recording off; revert by deploy | 1 restart to contain; 1 deploy to reverse | **The observation window itself.** Reverting discards the would-refuse record accumulated so far, and `T5`'s entry condition then has no evidence to read. |
| **T5** | — | **None. This stage is irreversible.** | — | **Every `context_tokens` row.** They are destroyed. The loss is bounded by a consumed decision rather than caused here: `DR-C10-S8-2`'s reject-don't-grandfather rule has already voided every one of them, so what is destroyed is rows that would have been refused anyway. It is still destruction, and no control, backup or migration brings them back. Callers re-mint; in-flight sessions holding a pre-purge token fail once. |
| **T6** | Refusal-rate step change larger than the population of `client`-kind callers explains | Toggle the gate back to observe-only | 1 restart | **Nothing persisted.** Requests refused during the window are refused, not corrupted; a refused call wrote nothing. |
| **T7** | A wave aborts, or boot duration breaches `OBJ-8` | Pause batches; to reverse, null the column | 1 restart to contain; 1 migration to reverse | **Nothing** — and this is a property of the uniformity, not luck. A backfill that wrote one value everywhere carries no information that unwriting could lose; the value is re-derivable from V1–V7. |
| **T8** | `SIG-S16-1` limb 1a fires, or a legitimate caller is refused | Toggle the predicate off | 1 restart | **Nothing persisted**, but see §8's qualification: the off position is today's unconfined behaviour, so containment here trades an isolation failure for an isolation absence. |
| **T9** | Constraint addition fails | Drop the constraint | 1 migration | **Nothing.** Dropping a constraint restores the prior state exactly. |

**One stage is irreversible: `T5`.** Every other stage has a real reversal, and none of the ten
depends on an image registry, an IaC revert, a schema down-migration or a backup.

**Three stages have a reversal whose only mechanism is a deploy** — `T3` and `T9` are reversed by
shipping a further migration, and `T0` by shipping a revert. Per OUT-4 this is **stated as the
finding it is** rather than written as a rollback: it is part of `F-S7-5`, and it is the direct
consequence of a platform on which a schema change and its deployment are not separable events.

---

## 10. Containment versus reversal, and what it costs

### 10.1 The two are separately exercisable, and the disable position is stated per stage

| Stage | Which behaviour stops | Which persisted state remains | Can the next stage still be entered? |
| --- | --- | --- | --- |
| T1 | Carrier population | Columns; rows already carrying a kind | **Yes** — `T2` needs the columns, not the writes |
| T2 | The move, between batches | Rows already moved stay moved | **Yes**, on resume; **no**, while paused — `T3` does not depend on `T2`, but the mixed population persists |
| T3 | The migration, between boots | Columns already added stay | **Yes**, once the migration completes |
| T4 | Recording | The record accumulated so far | **No** — `T5`'s entry condition requires a *read* observation, so containing `T4` blocks `T5` by design |
| T5 | — (irreversible) | — | **Yes** — nothing downstream depends on the purged rows |
| T6 | Transport refusal | Bindings written since `T3` | **Yes** — `T7` is a data operation and does not depend on the gate's position |
| T7 | Batching, between boots | Rows already keyed stay keyed | **No** — `T8` over a partly-keyed population is `R-S5-1` |
| T8 | The predicate | Ownership keys stay | **No** — `T9` tightens a constraint the predicate is supposed to be enforcing |
| T9 | — (named exception) | — | — |

**Three stages cannot be entered from their predecessor's disable position: `T5`, `T8` and `T9`.**
That is a designed property, not a gap — in each case entering would mean proceeding on evidence or a
population the disable position has withdrawn.

### 10.2 What the sequence costs against `OBJ-8`

`OBJ-8` allows **≤ 13 s** of planned unavailability per restart for 99.9%, **≤ 65 s** for 99.5% and
**≤ 131 s** for 99% (`15_operational-objectives-for-the-real-platform.md:255`). Its derivation is the
daily budget divided by the restart cadence: 86 400 s × 0.001 = 86.4 s/day ÷ 6.58 restarts/day =
13.1 s, where 6.58 is `C-17`'s 7-day version-bump rate of ≥ 3.29/day doubled for the
bump-fires-CD-twice case. `OBJ-7`'s published **≥ 7 per day** is that figure rounded up.

**This sequence adds ten planned restarts to that baseline, and the arithmetic is not neutral.** The
per-restart allowance is the daily budget divided by the day's *total* restarts, so every rollout
stage that lands on a given day tightens the allowance for every restart that day:

| Rollout stages landing that day | Restarts that day | Per-restart allowance at 99.9% |
| --- | --- | --- |
| 0 (baseline) | 6.58 | **13.1 s** |
| 1 | 7.58 | **11.4 s** |
| 2 | 8.58 | **10.1 s** |
| 10 (all in one day) | 16.58 | **5.2 s** |

**Conclusion, stated as a derivation and not a measurement:** spreading the stages is required by
`OBJ-8`'s own arithmetic, independently of `R-S6-2`'s batching argument. **At most one stage per
day** keeps the per-restart allowance within roughly 13% of the published ≤ 13 s; landing several in
one day degrades it sharply. Compressing the rollout is therefore not a way to reduce its
availability cost — it concentrates it.

**Which stages actually spend the allowance.** `T0`, `T4`, `T6` and `T8` are code-only: the migrator
runs at boot and finds nothing pending, so their cost is a container restart and no table operation.
`T1`, `T3`, `T5` and `T9` perform bounded, size-independent schema operations. **`T2` and `T7` are the
two whose duration scales with row count, and the row counts do not exist** — `OI-S6-1` records that
the aggregates were never executed. So the two stages that could breach `OBJ-8` are exactly the two
that cannot be shown not to.

**That conflict is `R-S6-2`, and this chapter cites it rather than re-raising it.** `R-S6-2` already
records that boot-time migration cannot be deferred, that batching converts one long breach into
several short ones, and that this **is not "no breach"**. `92_risk-register.md:603` names SUB-7
(NEU-1001) as one of its two named owners, and this chapter discharges that ownership in three ways:
by fixing the batch boundary as a per-boot slice in §8's control table; by establishing above that
the cadence between stages is itself an `OBJ-8` variable, which `R-S6-2` did not state; and by
forwarding batched-idempotent-resumable to SUB-13 as a hard obligation rather than a mitigation
preference. The residual — that several short breaches remain breaches — is unchanged and still
escalates to `NEU-896`.

**Two adjacent hazards are deliberately not re-raised here**, because each is already recorded once
and this package carries one id per fact. That the platform cannot guarantee exactly one concurrent
boot-time migrator is **`R-S15-3`** (`OBJ-12`, OUT-14, SUB-15); this chapter multiplies the number of
restarts and therefore the number of opportunities for that overlap, and cites the entry rather than
opening a competing one. That every alert route is unconfirmed is **`R-S16-2`**.

**One correction to `R-S15-3`'s premise, offered as an addition rather than a contradiction.**
`R-S15-3` states that deploys "fire automatically from `develop` on green CI **with no
serialisation**." At this cutoff cd-prod declares `concurrency: group: cd-prod` with
`cancel-in-progress: false` (`.github/workflows/cd-prod.yml:9`–`:11`), which queues a second run
rather than running it alongside the first. The overlap `R-S15-3` describes is therefore **narrower
than "no serialisation"**: it requires the first run's health poll to fail or time out
(`:100`–`:104`) and release the concurrency slot while that container is still executing its boot
migrator. The residual is real and unchanged — `R-S15-3` stays open with its owner — but the window
is conditional rather than continuous. This is **`F-S7-6`**, handed to SUB-15's owner and to SUB-13.

---

## 11. The pre-flight predicate this chapter forwards, re-verified

`R9` escalates to `NEU-896`, "which inherits the pre-flight re-run and abort condition". This chapter
forwards that abort condition into `T7`'s entry condition, so it re-verified it against the codebase
rather than inheriting it — the more so because SUB-6's probe originally bounded chunk difficulty at
`1–5` when the codebase defines `1–10`, which **would have aborted a real migration on healthy
data**.

The current text at `06_the-disposition-of-every-unowned-row.md:476` is correct. Re-verified
independently at this chapter's cutoff:

| Limb | SUB-6's bound | Independent verification |
| --- | --- | --- |
| `difficulty NOT BETWEEN 1 AND 10` | cited to one declaration | **Confirmed, and now over-determined.** `src/domain/types/spaced-repetition-tools.ts:102`, `src/domain/types/session.ts:147` and `src/domain/types/recommendations.ts:78` each declare `.int().min(1).max(10)`; `src/shared/constants/validation.ts:6`–`:7` sets `MIN_DIFFICULTY: 1` / `MAX_DIFFICULTY: 10`, which is what the persistence write path uses; and `src/domain/algorithms/sr-calculator.ts:191` clamps to the same range. `src/infrastructure/db/schema.ts:58` carries no `CHECK`, which is why the probe is needed at all. |
| `ease_factor < 1.3` | cited to the default and the clamp | **Confirmed, and the gap in the derivation is closed.** SUB-6 cited `src/domain/config/algorithm.ts:76` (`clamp(easeFactor, minimumEaseFactor, Infinity)`) and `src/domain/config/algorithm-defaults.ts:7` (`minimumEaseFactor: 1.3`). Neither establishes that the floor cannot be *lowered* by configuration — and if it could, an operator setting a lower floor would produce legitimate rows below 1.3 and this limb would abort a healthy migration, which is exactly the `1–5` defect in a second place. It cannot: `src/config/resolve-algorithm-config.ts:12`–`:14` wraps the override in `Math.max(parseNumber(env.SM_MIN_EASE_FACTOR, …), DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor)`, so `SM_MIN_EASE_FACTOR` can only **raise** the floor. |
| `repetitions < 0` | non-negativity | **Confirmed** on the write path at `src/domain/types/spaced-repetition-tools.ts:63` (`.int().min(0)`), and again on the ranking input at `:101`. |
| `interval_days < 0` | non-negativity | **Confirmed** at `src/domain/types/spaced-repetition-tools.ts:65`, where the tool field is spelled `interval` (`.int().min(0)`); the column it lands in is `interval_days` at `src/infrastructure/db/schema.ts:65`, which is **nullable**, so the probe's `< 0` correctly does not match an unset row. Cited separately because one citation covering three fields is the same shortcut this section exists to catch. |
| `consecutive_failures < 0` | non-negativity | **Confirmed** at `src/domain/types/spaced-repetition-tools.ts:67`–`:70` (`.int().min(0)`). The five SM-2 columns the probe reads sit at `src/infrastructure/db/schema.ts:58` (`difficulty`), `:60` (`ease_factor`), `:61` (`repetitions`), `:62` (`consecutive_failures`) and `:65` (`interval_days`), and **not one carries a `CHECK`** — which is why the probe is needed for all five. |

**The predicate is forwarded unchanged.** The `ease_factor` limb's completeness is an **addition** to
SUB-6's derivation, not a contradiction of it, so no amendment is routed to `NEU-895` and no
correction is routed to SUB-6. It is recorded as `F-S7-7` because a forwarded abort condition whose
safety argument had a hole is worth naming even when the conclusion survives.

---

## 12. What this chapter does not establish

- **It does not establish that any stage fits `OBJ-8`.** Two of ten have unbounded duration and the
  row counts do not exist (`OI-S6-1`). The arithmetic in §10.2 states what the budget *would* allow,
  never what a stage *will* take.
- **It does not establish that any signal reaches anybody.** Every alert route is `[unconfirmed]`
  (`A-S16-1`, `R-S16-2`), so every "observed how" cell in §8 describes a computation, not a
  notification. `T4`'s exit condition is deliberately written as a human read for this reason.
- **It does not establish that the disable paths exist.** They are named, with a cited in-repository
  precedent; none is implemented. SUB-13 builds them, and until it does, every "off" position in §8
  is a specification.
- **It does not choose `T0`'s route.** `OI-S7-1` is open and the creator owns it.
- **It does not discharge `F-S8-2`, `R-S6-1` or anything SUB-9 owns.** `T2` relocates a population;
  what a data right does to it is SUB-9's, concurrently.
- **It changes no code.** Zero files under `src/` or `drizzle/`.

**Two disclosures, made because certifying their absence would be easier than checking.**

1. **Two citations in this chapter land on line 42** — `src/transport/main.ts:42`, cited at §1 and
   again in §1's second consequence. Both are benign: line 42 is
   `const transportConfig = resolveTransportConfig();`, read directly. The tool surface is **46
   registered / 43 gated / 3 exempt** (`01_production-evidence-and-the-access-audit.md` §8,
   re-derived at `546ee90`); `42` is **not** a codebase fact and is not used as one anywhere above.
2. **Every citation in this chapter is written as a full filename — and a clean checker result is
   still not by itself evidence, for two separate reasons.** The first is the one this chapter
   originally named: the checker skips any target containing `…` or `...` as prose shorthand
   (`scripts/citation-paths/checker.ts:121`), so a shorthand reference is silently exempt. This
   chapter contains **zero** such references. **The second was found by this chapter's own
   adversarial pass, after it had already certified the first:** a target that resolves nowhere *and*
   has no unambiguous corpus suffix match is pushed into `excluded` as `MISSING-target`
   (`scripts/citation-paths/checker.ts:247`–`:266`) — counted as neither resolved nor non-resolving,
   and absent from both the summary and the `--json` findings. C011 reported `0 non-resolving` while
   this chapter's own `Consumes:` line carried a filename that does not exist — it named
   `DR-C10-S8-2_token-bound-identity.md`, dropping the `-over-per-call-identity` suffix the real file
   at `../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md`
   carries. **So a plain wrong filename is
   invisible to the gate too**, and the checker's zero is a weaker signal than the first draft of
   this disclosure claimed. C011 is in any case **not** in the checker's gated list
   (`scripts/check-citation-paths.ts:21`) — that is `CAP-S1-2`, owned by SUB-14 — so the checker was
   run by hand rather than relied on through CI.

---

## 13. What this chapter hands forward

| Id | Content | To |
| --- | --- | --- |
| `DR-C11-S7-1` | The ten-stage total order and its rejected alternatives | **SUB-13** (NEU-1006), **SUB-14** (NEU-1007), **SUB-17** |
| `DR-C11-S7-2` | The disable-path mechanism class and what each application costs | **SUB-13** |
| `F-S7-1` | The smoke break blinds the rollout rather than blocking it | **SUB-13**, **SUB-11** (NEU-1004), the creator |
| `F-S7-2` | Every disable path is read at boot and every restart re-runs the migrator | **SUB-13** |
| `F-S7-3` | "Only bookkeeping after the gate" is scoped to SUB-4's own stage set and does not survive composition | **SUB-13**, **SUB-17** |
| `F-S7-4` | `S2` and gate stage `D` are two distinct purges | **SUB-13** |
| `F-S7-5` | No stage can be executed at a chosen moment; three stages' only reversal is a deploy | **SUB-13**, `NEU-896` |
| `F-S7-6` | cd-prod is serialised, so `R-S15-3`'s overlap window is conditional | **SUB-15**'s owner, **SUB-13** |
| `F-S7-7` | The forwarded abort condition's `ease_factor` limb is safe, and why | **SUB-13**, `NEU-896` |
| — | *(withdrawn)* The risk register's id-convention permutation for rows 10–12 is **`F-S3-3`**, already registered by SUB-3. This chapter raises no second record and cites it. | — |
| `R3` | The Critical charter § Risks row, authored here | **SUB-14** (aggregates), `NEU-895` |
| `R4` | The High charter § Risks row, authored here | **SUB-14** (aggregates), `NEU-896` |
| `R-S7-1` | Accepting a known-failing smoke step blinds the rollout for its duration | the creator, `NEU-896` |
| `OI-S7-1` | Which of `R-S4-2`'s three routes `T0` takes | the creator |
| `A-S7-1` | One stage costs one deploy and therefore one restart | **SUB-13** |
| `CAP-S7-1` | This chapter prices no stage's duration | **SUB-13**, `NEU-896` |
| The stage table | `T0` … `T9` with entry, exit, signals, owner, control and reversal | **SUB-13**, which writes the runbook against it |
