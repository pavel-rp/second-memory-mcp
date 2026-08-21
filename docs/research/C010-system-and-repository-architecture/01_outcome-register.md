# 01 — Outcome Register (`OUT-1` … `OUT-12`)

**Task:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-21
**Model:** claude-opus-5[1m]
**Status:** deferred — this register restates outcomes; it discharges none of them.

## Why this file exists

The charter of record lives in a gitignored tree. `_local/` is ignored at `.gitignore:100` and `docs/wf-plans/*` at `.gitignore:78`, so **a reader with a fresh checkout cannot open the charter at all**. Without this file, every traceability row in the package would resolve into a path that does not exist for its reader, and `OUT-12`'s standalone requirement would fail on the first hop.

**This register is therefore the package's own copy of its outcomes, and it is what traceability rows resolve to.** The twelve entries below are restated verbatim-faithfully from the charter with their ids preserved. Where the charter's wording pointed at material only readable inside an ignored tree, the substance is carried here and the pointer is dropped.

**A bare `OUT-n` anywhere in this package means an entry in this file.** Program-level outcomes are always written owner-attached — `C005's OUT-8`, `NEU-850's OUT-7` — because the C005 program charter also numbers its outcomes from 1 and the two sets are not the same set. See `00_method-and-provenance.md` §2.5.

**This file is owned outright by SUB-1 and is not append-only.** No sub-task adds an outcome; the outcome set is the charter's, and changing it is a charter-level change. A sub-task records *coverage* of an outcome in `traceability/`, never by editing a row here.

**Sub-task coverage** is recorded in the charter's decomposition and audited by `NEU-985 (SUB-11)`. It is deliberately **not** duplicated per row below: a coverage column here would be a second source of truth that drifts against `traceability/` the moment one sub-task's scope shifts.

---

## OUT-1 — System-context and responsibility-boundary model

**Outcome.** A system-context and responsibility-boundary model: every component, every trust boundary, and every data and control flow across them.

**Success measure.** Every component in the selected system is named with one responsibility statement; every boundary between them is classified as a **trust** boundary (browser ↔ server, web tier ↔ MCP core, our infrastructure ↔ external source sites, our infrastructure ↔ AI provider), a **process** boundary, or neither; each data flow states what crosses it, in which direction, and under whose authority; the model is traced back to the upstream requirement or codebase fact that forced each boundary, with no component present that no requirement demands. The browser/server split states **what the browser is trusted with — nothing gate-bearing, given that the mastery gates are server-evaluated — as a trust property that holds under every rendering model**; *which* learner-facing surfaces render where is `OUT-8`'s rendering-model decision and is deliberately not stated here. **Content-orchestration placement is named here explicitly rather than left implicit in the generic component model:** the authoring pipeline, the quality-gate battery and the content serve path are each placed as named components carrying a responsibility statement, a boundary classification and the direction and authority of the flows between them — this is the *content* half of the brief's "content and AI orchestration placement" item, whose *AI* half is decided as an architecture-material technology choice in `OUT-8` and whose out-of-band citation-drift component arrives from `OUT-9`.

**Verified by.** Boundary-to-requirement traceability audit; a walkthrough of the three C005 benchmark journey shapes across the diagram showing each hop's authority; a cold-read by an independent implementation agent who must name each boundary's owner without asking; a presence check that the authoring pipeline, the quality-gate battery and the content serve path each appear as a placed component with an owner, rather than being implied by the model.

---

## OUT-2 — Complete state-category inventory

**Outcome.** A complete inventory of state categories, spanning what exists today and what the upstream packages newly require.

**Success measure.** The inventory covers, at minimum: the 10 `public` tables and 2 Drizzle-defined `infrastructure` tables in `src/infrastructure/db/schema.ts`; the two raw-SQL log tables `infrastructure.mcp_request_log` and `infrastructure.operation_event_log`; per-chunk SM-2 scheduling state; the four NEU-844 pre-review scheduling-snapshot columns on `session_question_attempts` — `snapshot_band`, `snapshot_predicted_recall`, `snapshot_interval_days`, `snapshot_days_overdue` (`src/infrastructure/db/schema.ts:217`–`:220`); grade revisions; notes; context tokens; content-audit verdicts in `validator_report`; the linter corpus and per-rule validation reports; **all process-local in-memory state** (MCP transport map, subject-binding map, rate-limit windows, Tier-2 circuit-breaker set, correlation-id storage); **derived-never-persisted state** (`mastery`, `LearnerContext`, analytics KPIs); and the categories the upstream packages introduce that have no store today — the corpus-neutral assessment-evidence record, the problem-citation record (currently `stable_id` + `canonical_url` only, pending ledger challenge `CH-F5-1`), the cached citation-drift verdict, tutoring/hint state, web-session and UI state, and handoff/authorization state. Each entry records its current store or "none", its lifecycle, its volatility, whether it is derived, and whether it is learner-scoped, and each is marked as **existing**, **required-by-upstream**, or **assumed** with the standing-in assumption cited by number. Completeness is argued, not asserted: the inventory states the method by which it claims to be exhaustive and what would falsify it.

**Verified by.** Schema-and-code walk asserting every table, column group and in-memory structure appears exactly once; a cross-check that every state category named by NEU-887, NEU-888, NEU-889 and NEU-890 has an entry; an omission probe in which an independent reader is asked to name a state category the inventory misses.

---

## OUT-3 — All-MCP versus hybrid state ownership, resolved into a per-state authority matrix

**Outcome.** A comparison of all-MCP against hybrid state ownership, resolved into a per-state authority matrix in which every category has exactly one authority.

**Success measure.** Both models — and any third the comparison surfaces — are evaluated against one traceable criteria set covering consistency, recovery, isolation, compatibility, latency, operability, product delivery, deployment and testing, with each criterion's weight and its source stated before the scoring rather than after. The selected model carries evidence, consequences, a migration path and its residual uncertainty; the rejected models carry the same. The resulting matrix gives every `OUT-2` category exactly one named authority and, per category, its reads, writes, consistency requirement, freshness requirement, concurrency behaviour, conflict handling, recovery behaviour, migration path and observability. **An exactly-one-authority audit runs mechanically over the matrix** — zero categories with none, zero with two — and a category that cannot be given a single authority is reported as a finding with a named owner, never smoothed into a shared one. Each authority assignment is shown to satisfy `OUT-4`'s isolation invariant.

**Verified by.** Mechanical exactly-one-authority audit over the matrix, reported as counts; scenario evidence for divergence, conflicting concurrent writes, mid-operation interruption and recovery, walked against the matrix and producing a defined outcome in each case rather than an undefined one; an audit that every `OUT-2` row appears in the matrix and every matrix row appears in `OUT-2`.

---

## OUT-4 — The isolation invariant, over a consumed learner-identity placement, plus the NEU-893 split contract

**Outcome.** The isolation invariant every state category must satisfy, over a learner-identity placement consumed from C003/NEU-850, plus an explicit contract splitting this decision from NEU-893's.

**Success measure.** **Placement is consumed, not re-decided.** C003/**NEU-850's** OUT-2 already commits learner ownership to the **MCP core database schema, keyed to the JWT subject** (`user_id` NOT NULL on every table, threaded through the 9 row-owning repository ports); this package records that as a **consumed constraint with its source cited** and does not re-run a placement trade study. Its own work is therefore: **the isolation invariant**, stated as a testable property rather than a principle; the threat cases the consumed placement leaves open — the `sub`-versus-`azp` conflation (an OAuth client can *be* the authenticated subject, and a client_credentials grant has no human behind it at all) and the unauthenticated STDIO path; and the disjointness contract with NEU-893. It records the codebase facts the invariant must survive: no ownership column exists on any table today, `getActiveSession()` has no scoping predicate, `createSession` rejects on any globally-active learning session, `context_tokens` carries no authenticated subject, and `infrastructure.mcp_request_log` has no principal field, so no logged request can be attributed today. **The split with NEU-893 is stated as a contract:** an explicit list of the isolation questions this package closes and an explicit list it hands on (identity mapping to the production Rauthy IdP, migration of existing global rows, staged rollout, rollback), such that no question appears on both lists and none appears on neither. Because the consumed placement puts ownership in the core database schema, the change is shown to be reusable, backward-compatible and non-DP-specific with a stated regression boundary. **The amendment right is bounded:** where this package's own evidence *actively contradicts* the consumed constraint, it routes a recorded amendment to NEU-850 naming the contradicting evidence — it never silently diverges and never re-decides on preference.

**Verified by.** Application of the isolation invariant to every row of the `OUT-3` matrix, with any row that cannot satisfy it reported as a finding; a disjointness audit over the two question lists (no overlap, no gap); a C003-reconciliation record for **NEU-850's OUT-2** naming it as consumed, citing its source, and recording either no amendment or a routed amendment with the contradicting evidence named; a threat walk of the `sub`-versus-`azp` and STDIO-unauthenticated cases against the invariant.

---

## OUT-5 — The general web API's scope, its negative boundary, and a resource-level inventory

**Outcome.** The general web API's scope, its negative boundary, and a resource-level inventory that doubles as the authority proof surface.

**Success measure.** The package defines what the web API is responsible for, **what it must never own** — stated as explicitly as what it owns, since the negative boundary is the direct control against the Critical "MCP and web-owned state diverge or permit conflicting writes" risk — its relationship to MCP and to production learning state, and its auth and trust boundary. It carries a **resource-level inventory** naming every capability the API exposes with the single `OUT-3` authority backing each; **the inventory and the authority matrix are cross-checked against each other** rather than written independently, so every inventory entry maps to exactly one authority and every learner-facing authority appears in the inventory or is stated as deliberately unexposed. The package **stops short of endpoint paths, payload schemas and error catalogues and says so**, so a downstream charter knows the wire contract is genuinely open rather than accidentally missing.

**Verified by.** Bidirectional cross-check between the resource inventory and the authority matrix, reported as unmatched counts in both directions; a negative-boundary review asserting that for every state category the API does not own, the inventory says so; a scope audit confirming zero endpoint paths, payload schemas or error catalogues are specified.

---

## OUT-6 — The application-versus-core rule, the compatibility contract, and the regression boundary

**Outcome.** The rule that separates application-specific behaviour from reusable MCP-core capability, plus the backward-compatibility contract and regression boundary for any core evolution this architecture implies.

**Success measure.** A stated, applicable rule — not a list — that classifies a proposed capability as application-specific or reusable core behaviour, demonstrated by applying it to every core change this architecture implies, and to at least one capability from NEU-890's server-side enforcement points that the rule sends **each** way. **The rule states the licensing and distribution consequence of a misclassification, not only the architectural one:** with the DP course application private/closed and the MCP core public MIT, putting application behaviour in the core publishes it under MIT to every self-hoster, and putting reusable core behaviour in the application withholds it from the public package — so each classification records which side of the distribution line it places the capability on. The compatibility contract fixes the existing public surface as the regression boundary: **45 registered tools across 16 `src/server/*-tools.ts` modules and 3 registered prompts** (`scaffolding`, `chunk_generation`, `chunk_management`), the snake_case tool-schema convention, the `toolData`/`toolError` response shape, and the `content_quality` error type as the only channel that carries structured per-item findings. Every implied core change states its backward-compatibility obligation and how a regression would be detected. STDIO mode — which has no auth, no origin check and no rate limiting — is covered by the contract rather than assumed away. **Where the architecture implies carrying identity per call, the contract prices what the codebase actually costs rather than a migration it does not require:** **all 42 gated tool schemas already declare `context_token`** (40 through shapes in `src/domain/types/*.ts`, 2 inline in `src/server/`), so a per-call identity slot exists on every gated tool and **no bulk schema migration is implied**. What the contract must price instead is (a) the **semantic** change of reusing or widening an argument already declared to every client as required on every call — a change that shifts meaning without shifting shape, so the contract names a detection method a schema diff would miss; (b) the **3 exempt tools**, whose empty input schemas would need a genuine schema addition, **recorded as a separate decision the contract must state** rather than folded silently into the cost; and (c) the **STDIO gate that does not exist**, on which a declared identity argument is caller-asserted and unenforced. Because `context_tokens` stores only `id`, `created_at` and `expires_at`, the contract also assesses the alternative the existing slot makes available — binding a principal to the token at issue time rather than carrying identity per call — and states which of the two it obligates.

**Verified by.** Application of the rule to each implied core change with the classification recorded; a regression-boundary audit naming, for each of the 45 tools and 3 prompts, whether the architecture changes its contract and how a break would be caught; **a stated cost for any per-call identity argument that separates a semantic change to the already-declared `context_token` from a genuine schema addition, reports the tool count in each class against the verified 42-gated / 3-exempt split, and names the STDIO gate that does not exist**; a recorded assessment of the token-bound alternative against the per-call one; confirmation that no DP-specific concept appears in any proposed core surface.

---

## OUT-7 — The repository topology decision

**Outcome.** The repository topology decision, made against evidence rather than preference, over an alternative set the confirmed distribution facts have already narrowed.

**Success measure.** Monorepo, separate-application and any other credible model this package surfaces are evaluated against one traceable criteria set covering build, ownership, versioning, compatibility, testing, deployment, observability, local development and release. **The criteria set explicitly cites the three inputs the brief did not name and the evidence now settles:** (a) a single maintainer and operator; (b) the already-decided intent that the MCP core be publicly distributed under MIT (`LICENSE`; C003/**NEU-850's** OUT-6 removes `package.json`'s `"private": true` and publishes to a public registry); and (c) the confirmed decision that **the DP course application is private/closed while the general-purpose MCP core stays public MIT** — an open-core arrangement extending the one NEU-850 established. **That third input materially narrows the alternatives: a single fully-public monorepo is no longer credible**, leaving a separate repository or a split-visibility arrangement as the live options; every eliminated option still carries a recorded rationale rather than silent elimination. **NEU-850's OUT-7 is consumed as a constraint, and its overlap is stated as partial:** it binds the **cloud tenant/billing/dashboard business layer** to a separate private repo ("zero cloud-business code lands in this MIT repo") and does **not** name the DP course application, whose placement remains this package's to decide. The selected topology and every rejected one carry explicit evidence, consequences, a migration path and their residual uncertainty; a preference-based conclusion fails. Current repository facts are consumed rather than treated as precedent: a single package (`pnpm-workspace.yaml` has no `packages:` key), 165 TypeScript source files, ~25,200 lines, 197 test files, 25 Drizzle migrations, and no `apps/`, `packages/` or web directory of any kind.

**Verified by.** Side-by-side alternative-comparison matrix over the traceable criteria with each score's evidence cited, the DP application's private/closed status appearing as a cited criterion input; a migration-path walk for the selected topology from today's single-package repository; a rejected-alternatives record with the consequence that decided each, including the eliminated fully-public monorepo; a C003-reconciliation record for **NEU-850's OUT-6 and OUT-7** naming them as consumed, stating the overlap as partial, and recording either no amendment or a routed amendment with the contradicting evidence named.

---

## OUT-8 — Architecture-material technology selections, and the rule that decides what counts

**Outcome.** The architecture-material technology selections, and the stated rule that decides what counts as architecture-material.

**Success measure.** The package gives **the rule it used** — approximately "a choice is architecture-material when changing it would move a boundary, an authority, or a compatibility contract" — stated so a downstream reader can classify a choice this charter did not anticipate, and demonstrated on at least one in-scope and one out-of-scope example. In scope and each decided with evidence and recorded rejected alternatives: the web tier's runtime and language (**argued, not inherited** — NEU-890 settled TypeScript/Node as the language for authored solutions, proofs and tests, which does not by itself decide the web tier), API protocol style, rendering model, data-store topology (share the production Postgres or run a separate store), deployment shape, AI-orchestration placement, and **make-or-reuse decisions at architectural granularity** — for each architecture-material capability the selected system needs (identity and web-session handling, the AI-orchestration layer, the out-of-band citation-drift component, the deployment and observability substrate), whether it is **built here, reused from the existing MCP core, or adopted from an external service or provider**, each answered against the same criteria and carrying its rejected alternatives; a reuse answer additionally states the compatibility obligation it inherits from `OUT-6`. Framework and library picks are out of scope and stated as such. The deployment-shape decision is made against the real constraints: a single-instance VPS with an unversioned compose stack, no Dockerfile in the repo, no IaC, no rollback path, automatic migration-on-boot, and process-local in-memory state that a second replica would break. The AI-orchestration decision is made against the existing placement rather than greenfield: server-side AI already runs in the core behind `EmbeddingPort` and `ContentClassifierPort` (`src/adapters/langchain/`), optional and degrading to disabled when unconfigured.

**Verified by.** A decision record per in-scope choice with rejected alternatives and the evidence that decided it, including one build-versus-reuse-versus-adopt record per architecture-material capability; an application of the classification rule to a sample of choices, including at least one the charter did not enumerate; a production-compatibility assessment of the deployment-shape choice against the single-instance and in-memory-state facts.

---

## OUT-9 — The execution-environment question is closed, not inherited

**Outcome.** The execution-environment question is closed, not inherited.

**Success measure.** The package **resolves whether an in-app execution environment is an architectural component at all**, and records which NEU-890 decisions it relied on. The evidence it must reconcile is on file: the learner solves on the source site and the pasted-back solution is stored, persisted and graded through `mapRubricToQuality`, never executed, and NEU-890 "selects no runtime, no compiler, no sandbox and no execution environment" for the learner path — **but** its `automated` gate class is defined as requiring "an execution environment, and a re-run budget", and gate `EQ-S4-6` runs an authored approach over authored fixtures at authoring time. The package therefore decides separately, and states each conclusion: whether a **learner-facing** judge or sandbox exists (and if not, says so, closing the brief's presupposition), and whether an **authoring-time** execution environment is an architectural component, with its isolation, trust and resource boundary if it is. It also places the one serve-time obligation NEU-890 imposes: the citation-drift verdict must be computed **out of band** and read from cache on the serve path, with a stale or absent verdict quarantining the unit rather than blocking the learner's request — an asynchronous component with egress to external sources, whose placement and authority this package assigns. This resolves the execution-environment half of C005 open question #1.

**Verified by.** A reconciliation record citing the specific NEU-890 decisions relied on for each of the three conclusions; confirmation that no requirement anywhere in the package assumes an in-app judge or captured keystrokes; placement of the drift-verdict component in the `OUT-1` component model and its verdict store in the `OUT-3` authority matrix.

---

## OUT-10 — A spike register in which every spike is first-class, quarantined and expiring

**Outcome.** A spike register in which every spike is a first-class, quarantined, expiring record.

**Success measure.** Each spike records the question it tests, why the question could not be settled by reading the codebase or an upstream package, the method, the result, the confidence, and an **expiry date** after which its conclusion is stale and must be re-run or re-labelled. **Quarantine is structural:** the package names the path spikes live under and states that nothing there is product code; scratch routes to `_local/scratch/` per the project constitution's temp-file article, and anything a later charter must read lands in the `docs/research/` package instead of the scratch path. No spike writes to `src/`, and none is merged as product code. Every claim marked uncertain **and** material either carries a spike record or is recorded as a cap with a named owner — asserting it is not an available third option. A spike result cited anywhere in the package cites its record by id.

**Verified by.** A repository audit proving no spike artifact landed in `src/` or in any tracked path other than the package; a justification review of each spike against the "could this have been read instead?" test; an audit that every uncertain-and-material claim resolves to a spike record or a caps-register entry, with the count of each reported.

---

## OUT-11 — Numbered, tolerance-bounded stand-in assumptions handed to NEU-896

**Outcome.** The stand-in assumptions for the four unbuilt upstream packages are individually numbered, tolerance-bounded, and handed to NEU-896 as an explicit reconciliation list.

**Success measure.** Every assumption standing in for NEU-891 (tutoring), NEU-892 (UI), NEU-893 (production integration) or NEU-894 (handoff) is its own numbered entry with `[unconfirmed]` status, the package it stands in for, and a **named re-validation obligation that fires when that package lands**. An architecture decision resting on one **says so at the decision**, not only in an appendix. Where a decision would swing on an unbuilt package's outcome, the package states the **envelope of outcomes the selected architecture tolerates and names the outcome that would invalidate it**, rather than picking one guess and presenting it as grounded — this applies in particular to AI-orchestration latency, privacy and cost budgets, which C005 routes to the unbuilt NEU-891. NEU-896 receives an explicit list of assumptions to reconcile, so convergence does not rediscover them. **The NEU-893 circularity is recorded as a finding in its own right** — that **C005's OUT-8** (this package) ran ahead of **C005's OUT-9** (NEU-893), and which of its inputs were assumed rather than derived — and so is the C003/NEU-850 decision-ownership collision, recorded with its settled disposition (**NEU-850's** OUT-2 and OUT-7 consumed as constraints) and with any amendment this package routed back to NEU-850, so NEU-896 converges over a stated ownership split rather than rediscovering a contested one.

**Verified by.** A completeness audit that every stand-in assumption carries a package reference, a re-validation trigger and a tolerance envelope; a decision-level check that every decision resting on a stand-in names it in place; the NEU-896 handoff list reviewed for coverage against the assumptions table; presence of both the circularity and the C003-collision findings as named records.

---

## OUT-12 — The package ships in the C005 house style, standalone and cold-readable

**Outcome.** The package ships in the C005 house style, standalone and cold-readable.

**Success measure.** The package is published under tracked `docs/research/` in the shape the delivered upstream packages use — `C005-product-foundation`, `C005-instructional-model`, `C005-dp-map-package` and `C009-course-content-quality` as the named reference set: a README, per-topic documents, decision records with rejected alternatives, a traceability set, an open-items / provisional register, a caps-and-incomplete-scope register with a single named owner, and a package-completeness gate answered item by item with cited evidence — any item that cannot be so answered recorded as a cap with a named owner rather than marked passing. It carries a risk register with severity and mitigation status, success measures, and evolution paths for the selected architecture. Every claim about the codebase cites a real file path, and every claim inherited from an upstream package cites that package's version or compilation date so staleness is detectable. **It is standalone:** a reader with access to nothing but this repository's tracked tree — no gitignored working notes, no untracked charter folders, the C005 program charter among them — can reconstruct every decision, its evidence and its rejected alternatives from the package alone.

**Verified by.** Package-completeness gate answered item by item with cited evidence; a cold-read review by an independent implementation agent working only from the published package, who must reach the boundaries, authorities and topology without asking a question; a citation audit that every codebase claim resolves to a real path and every upstream claim carries a version or date.

---

## Restatement note

Twelve entries, `OUT-1` … `OUT-12`, complete. Two restatement edits were made under `00_method-and-provenance.md` §3, and no others:

1. **`OUT-4` and `OUT-8`** — the charter's bare `session` and `schema` are written in their qualified forms (`learning session`, `web-session handling`, `database schema`) per `00_method-and-provenance.md` §4. The referents are unchanged.
2. **`OUT-12`** — the charter's success measure names the two ignored trees by path to define "standalone". Restated here as "nothing but this repository's tracked tree", which states the same requirement without asking a reader to resolve a path they cannot open.

Every other entry is the charter's wording, with ids preserved and program-level outcomes written owner-attached.
