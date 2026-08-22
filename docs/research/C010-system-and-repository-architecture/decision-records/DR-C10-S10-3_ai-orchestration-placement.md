# `DR-C10-S10-3` — AI orchestration stays in the MCP core behind the existing ports, decided on the one clause of `A-26` that is not budget-dependent

**Task:** NEU-984 (SUB-10) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `03efe1d`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-8` (`../01_outcome-register.md`) in part — the AI-orchestration placement decision, published as `../15_substrate-decisions-and-make-or-reuse-records.md` §7. This is the *AI* half of the paired item whose *content* half SUB-4 placed.

---

## Decision

**AI orchestration is owned by the MCP core process and reached only through the existing
`EmbeddingPort` and `ContentClassifierPort`. The web tier makes no AI provider call and holds no
AI provider credential.**

Four clauses are part of the decision and not commentary:

1. **Ownership is the MCP core process.** Not "the core package" as a distribution question —
   the running process that holds the provider credential and makes the outbound call.
2. **The port pair is the only interface.** `src/ports/embedding-port.ts` and
   `src/ports/content-classifier-port.ts`. No component calls a provider SDK directly.
3. **The posture is retained: optional, and degrades to disabled when unconfigured.**
   `src/composition-root.ts:387`–`:398` leaves `ports.embedding` and `ports.classifier`
   **undefined** when the provider environment variable is unset, and every call site is guarded
   and fail-open. This is the baseline `../00_…md` names, and this decision keeps it rather than
   re-deriving it.
4. **Where on the timeline the call happens is *not* decided here.** Today it is on the request
   path, awaited, outside the transaction. Moving it off the synchronous path later is explicitly
   **not** a re-decision of this record — see the decisive criterion.

---

## Rationale

### In-scope basis under SUB-15's rule

Applying `../13_…md` §4.2's three-step test to clause 1:

| Leg | Would changing which component owns the AI call, on its own, do this? |
| --- | --- |
| **B — boundary** | **Yes.** An AI call is an **egress** carrying learner-derived content to a third party. Placing it in the web tier creates a `web tier ↔ AI provider` pair, with its own trust class and its own credential, that no `BND-S4-*` row carries today. That is the existence leg. |
| **A — authority** | No. No state category's authority moves; the AI output is consumed by the same component that owns the state it annotates. |
| **C — compatibility contract** | No. The gated-tool surface is unchanged. |

One yes suffices. **In scope** — and note it is in scope on the *boundary* leg alone, which is why
clause 4 can leave the timeline question outside: moving a call from synchronous to asynchronous
**within one process** moves no boundary and is therefore not architecture-material by the rule as
published. Applying the rule rather than restating it is what produces that split.

### The decisive criterion — `A-26`'s tolerance envelope, clause (b)

`A-26` ("No AI latency, privacy or cost budget exists yet") is `[unconfirmed]` and stands in for
NEU-891. Its tolerance envelope tolerates any budget under which:

- (a) **≥1 AI provider call may be made server-side with learner-derived content**;
- (b) **AI work may move off the synchronous path without changing which component owns it**;
- (c) **cost is bounded per call**.

Clause (b) is the decisive one, and it is decisive because of what it separates. It states, as a
property of the tolerated envelope, that **ownership and timeline are independent** — the budget
may move the work off the request path, and doing so does not change the owner. So the only part of
AI placement that a substrate decision can settle without a budget is **ownership**, and the part
that genuinely needs the budget — where on the timeline — is exactly the part clause 4 leaves open.

This is the strongest available criterion precisely because it does not depend on the budget's
contents. Any tolerated budget preserves it. A criterion that *did* depend on the budget's contents
would be an assertion about a document that does not exist.

Ownership then follows from evidence: the ports, adapters, prompts, breaker and every call site
are in the core today, the core is the only credential holder under `DR-C10-S10-1`, and clause (a)
requires the call be server-side — which the core process already is.

### `A-26`'s invalidating outcome, and what it would do

`A-26` is invalidated by a budget under which **learner-derived content may not leave our
infrastructure at all**, or under which **no server-side AI call may be made on any path**. Either
outcome removes the AI-orchestration component rather than relocating it, so it does not select a
different alternative from the set below — it empties the set. Recorded so a reader does not
mistake the invalidating outcome for a rejected alternative in disguise.

### Why the fail-open posture is retained rather than re-decided

`src/ports/content-classifier-port.ts:19`–`:21` states the guarantee in the port's own words:
`classify()` "never throws. On total adapter unavailability it returns an all-null verdict; on
per-field failure it returns a verdict with that field set to `null` and the others populated."
The call sites hold the same line: `src/orchestration/topic-workflows.ts:297`–`:322` runs the
Tier-2 pass **outside** the transaction with an explicit comment that "any throw inside
`unitOfWork.execute` would roll back topic creation, breaking the fail-open contract", and catches
even so because "a bugged adapter must not poison creation". `src/orchestration/chunk-workflows.ts`
repeats the pattern at `:425`–`:450` and `:1161`–`:1182`. The Tier-2 circuit breaker is itself
fail-open on its own stats-query failure (`src/orchestration/tier2-circuit-breaker.ts:91`–`:112`).

`../00_…md` names this posture as the baseline any AI-placement change is measured against.
Retaining it is therefore the null hypothesis, and nothing in evidence displaces it.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **AI orchestration in the web-tier process** | **The boundary leg, and `A-26`'s own invalidating outcome.** It creates a second egress carrying learner-derived content and a second holder of an AI provider credential. `A-26` is invalidated by a budget under which learner-derived content may not leave our infrastructure — a shape with two egress points is strictly harder to satisfy under any such budget, and it doubles the surface that would have to be withdrawn. It also contradicts `DR-C10-S10-1` clause 4: the web tier's reach is the tool surface, and an AI call is not a tool call. |
| 2 | **A dedicated AI-orchestration service, third process** | **Priced against a floor that does not exist.** `F-S15-2` records `SPK-S6-1`'s ≤0.02% as an in-process transport floor with no network hop; `CAP-S15-1` records that the *first* hop is unmeasured. Introducing a second hop to reach the AI layer would rest on an unmeasured cost twice over. It also splits ownership of the prompt pack from ownership of the state it annotates, with no recorded requirement asking for that split. |
| 3 | **Move AI work off the request path now**, as part of this decision | **It is a budget decision, and `A-26` records that no budget exists.** Clause (b) of the tolerance envelope explicitly permits this move *later* without changing ownership — so making it now buys nothing this record needs and spends a decision on a document that has not been written. Deciding it would be the "assertion dressed as a finding" this package rejects. |
| 4 | **Make AI mandatory rather than optional** — fail closed when unconfigured | **Reverses a posture `../00_…md` fixes as the baseline**, and would turn every AI provider outage into a creation-blocking failure, which the breaker at `src/orchestration/tier2-circuit-breaker.ts:1`–`:16` exists specifically to prevent ("The breaker may not amplify a partial outage into a creation-blocking failure"). Rejected on the codebase's own recorded contract. |
| 5 | **Adopt an external AI-orchestration platform** (a hosted agent/pipeline product) | **Rejected as a make-or-reuse answer at `../15_…md` §8.2**, not here — but recorded in this set because a reader would expect it. It would place learner-derived content in a third party beyond the provider itself, widening exactly the surface `A-26`'s invalidating outcome contracts, and would add a runtime dependency to a package whose value is being embeddable. |

---

## Consequences

1. **`A-26` is cited with its envelope and its invalidating outcome, as `OUT-8` requires.** Both
   appear above in full rather than by reference, because the decisive criterion is a clause of the
   envelope and a reader cannot check the reasoning without it.

2. **The AI layer's make-or-reuse answer splits along SUB-8's application-versus-core rule.**
   `EmbeddingPort`'s shape is generic and reusable; the classifier's verdict vocabulary
   (`rendering_clarity`, `vocabulary_appropriate`, `math_notation_rendering_risk`,
   `definition_constructive`, `epistemic_consistency`, `overall_fit`) and the prompt pack at
   `src/shared/prompts/classifier-prompts.ts` are course-specific. The record is at `../15_…md`
   §8.2; this decision fixes only the *process* that owns the call.

3. **No latency, privacy or cost claim is made anywhere in this record.** None could be supported:
   `A-26` records that no budget exists, and no provider credential was reachable in this run to
   measure against one. The AI-latency envelope was evaluated as a spike candidate and **capped
   rather than executed** — disclosed at `../92_…md` `### SUB-10`.

4. **Clause 4 is a real limit, not a hedge.** This record does not say when the AI call happens; it
   says who owns it. A downstream charter that moves the call off the request path is *implementing
   within* this decision, not amending it — and one that moves it to another process *is* amending
   it and must re-decide rather than patch.

5. **Nothing was created.** No port, adapter, prompt, provider configuration, credential or process
   exists as a result of this decision, and no file under `src/` was changed.

---

## Evidence

| Claim | Source |
| --- | --- |
| `A-26`'s tolerance envelope clauses (a), (b), (c) and its invalidating outcome | `../93_…md` `A-26` (`[unconfirmed]`, stands in for NEU-891) |
| The architecture-material rule and its three-step test | `../13_…md` §4.1, §4.2; `DR-C10-S15-1` |
| AI is optional and degrades to disabled when unconfigured — the stated baseline | `../00_…md`; `src/composition-root.ts:387`–`:398` |
| `ports.embedding` / `ports.classifier` are left `undefined` when the provider env var is unset | `src/composition-root.ts:387`–`:398` |
| The port pair | `src/ports/embedding-port.ts`; `src/ports/content-classifier-port.ts` |
| `classify()` never throws; all-null verdict on total unavailability, per-field null otherwise | `src/ports/content-classifier-port.ts:19`–`:21` |
| Tier-2 runs outside the transaction so a throw cannot roll back creation; caught anyway | `src/orchestration/topic-workflows.ts:297`–`:322` |
| Same fail-open pattern on chunk create and update | `src/orchestration/chunk-workflows.ts:425`–`:450`, `:1161`–`:1182` |
| The breaker may not amplify a partial outage into a creation-blocking failure; it is fail-open on its own stats query | `src/orchestration/tier2-circuit-breaker.ts:1`–`:16`, `:91`–`:112` |
| The classifier verdict fields are course-specific | `src/ports/content-classifier-port.ts`; `.env.example:332`–`:335` |
| The prompt pack | `src/shared/prompts/classifier-prompts.ts`; `src/shared/prompts/prompt-pack.ts` |
| Provider and model are environment configuration, not hardcoded | `.env.example:216`–`:336` |
| The AI adapters | `src/adapters/langchain/embedding-adapter.ts`; `src/adapters/langchain/content-classifier-adapter.ts` |
| The MCP core is the only database credential holder | `DR-C10-S10-1` clause 2 |
| The web tier's reach is the gated tool surface, not the store | `DR-C10-S10-1` clause 4; `F-S8-1` |
| The ≤0.02% figure is an in-process floor with no network hop | `F-S15-2`; `SPK-S6-1` |
| The deployed round-trip is unmeasured | `CAP-S15-1` |
| No background, queue or cron runner exists anywhere in `src/` | worktree-wide search at `03efe1d` |

---

## Revision trigger

1. **NEU-891 publishes a budget** — `A-26` moves off `[unconfirmed]`. If the budget is inside the
   tolerance envelope, this record stands and the timeline question clause 4 left open becomes
   answerable at the implementation charter. If it is the invalidating outcome, the
   AI-orchestration component is withdrawn rather than relocated and this record is **re-decided,
   not patched**.
2. **A requirement appears for an AI call the web tier must make itself** — the boundary leg
   changes and alternative 1 is re-scored against a requirement it currently lacks.
3. **The fail-open posture is reversed at its owner** — clause 3 rests on `../00_…md`'s baseline;
   a change there propagates here rather than being absorbed.
4. **`CAP-S15-1` is lifted with a measured distribution** — alternative 2's rejection basis was the
   absence of a measurement, not a measured verdict against it. With a number, the third-process
   shape is re-scored on evidence.
5. **`DR-C10-S10-1` clause 2 changes** — a second credential holder appears. Ownership of the AI
   call was derived in part from the core being the only credential holder; if that stops being
   true the derivation is re-run.
