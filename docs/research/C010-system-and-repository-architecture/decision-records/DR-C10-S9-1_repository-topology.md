# `DR-C10-S9-1` — The repository topology is a split-visibility workspace, decided on the compatibility contract's detection reach

**Task:** NEU-983 (SUB-9) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `0962279`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-7` (`../01_outcome-register.md`) — the repository topology decision, its scored alternative comparison, its migration path and its C003 reconciliation, published as `../14_repository-topology-decision.md`.

---

## Decision

**The DP course application and the general-purpose MCP core live in one private repository organised
as a workspace, whose core tree is published publicly under MIT and whose application tree is never
published.** Visibility is split **by publication**, not by repository boundary.

Three clauses are part of the decision and not commentary:

1. **The repository itself is private.** That is how the confirmed private/closed status of the DP
   course application (charter assumption 32) is held.
2. **The core member is published publicly under MIT**, which is how NEU-850's `OUT-6` is honoured. The
   published artifact is the **core member's**, not the workspace root's.
3. **The cloud tenant/billing/dashboard business layer does not move.** NEU-850's `OUT-7` keeps it in
   its own separate private repository; this decision neither relocates it nor re-decides it.

---

## Rationale

### The criteria, and their weights, fixed before any topology was scored

The weights are derived from the four criterion inputs recorded at `../14_…md` §3, and were not adjusted
after any score was seen.

| # | Criterion | Weight |
| --- | --- | --- |
| `K1` | Build | high |
| `K2` | Ownership and the visibility boundary | **decisive** |
| `K3` | Versioning | high |
| `K4` | **Compatibility — detection reach over the 43 gated tool schemas** | **decisive** |
| `K5` | Testing | high |
| `K6` | Deployment | medium |
| `K7` | Observability | medium |
| `K8` | Local development | high |
| `K9` | Release | high |

### The four criterion inputs, with weights and sources

| # | Input | Status | Weight | Source |
| --- | --- | --- | --- | --- |
| (a) | Exactly one maintainer and operator | **confirmed** | **decisive** | Charter assumption 11; re-measured at `F-S9-1` |
| (b) | The MCP core is intended for public MIT distribution | **confirmed** | high | Charter assumption 12; NEU-850's `OUT-6` |
| (c) | The DP course application is private/closed, the core public MIT | **confirmed** | **decisive** | Charter assumption 32 |
| (d) | The web tier is TypeScript on Node, sharing the core's runtime | **decided** | **decisive** | `DR-C10-S15-2`, `../13_…md` §6.2 and §6.5 |

Input (c) is a **confirmed** input and never an `[unconfirmed]` assumption; `../93_…md` is closed and takes
no entry from this decision. Assumptions 11, 12, 16, 24 and 32 are all confirmed and are cited at this
decision.

### The decisive criterion — detection reach, not developer convenience

This extends `DR-C10-S15-2`'s decisive criterion by exactly one hop. That record made **mechanical
contract-sharing over the 43 gated tool schemas** decisive for the web tier's runtime; this record asks
*when* a change to one of those schemas becomes visible to the application that consumes it, which is a
property of where source lives and how it resolves.

`SPK-S9-1` measured the mechanism rather than assuming it, under this repository's own compiler
configuration (`Node16` resolution, `verbatimModuleSyntax`, TypeScript 5.9.3):

- Under the **selected workspace**, the application resolves the core's declared types **from source, in
  the same tree, at the same commit** — variant **E** passes with `dist` deleted and **no build step**. A
  gated-schema change **breaks the application's typecheck in the commit that makes it**.
- Under the rejected **separate repositories**, the application resolves those types **from the last
  published version it installed** — variant **D** is decisive: a core source edit is invisible to the
  consumer until the core is rebuilt, and under a genuinely published dependency the cycle is longer
  still. Between a core schema change and the next publish-bump-install, **the application typechecks
  green against a contract that is no longer true.**

**Two limits, stated rather than glossed.** (i) This covers the **shape** class only. Per `../13_…md`
§6.3, shared types do **not** catch `CC-S8-2`'s meaning-narrowing — **nothing does** — so both topologies
are equally uncovered for the semantic class. (ii) `CAP-S8-1` records `RD-S8-1`…`RD-S8-5` as specified
and never executed; this criterion is scored on **typechecker** behaviour and assumes none of them runs.

### Why the two decisive criteria did not deadlock

`K2` favours the rejected separate-repository alternative and `K4` favours the selected one. The
resolution is a property of how `K2` was defined at the outset, not a re-weighting applied afterwards:

> **`K2` is decisive as an *eliminator* and high as a *discriminator*.** Its decisive weight is spent
> removing the fully-public monorepo — the only option that cannot hold the distribution line at all.
> Among the survivors, all of which *can* hold it, `K2` compares the **strength** of a guarantee every
> survivor already provides. `K4` has no such split: it discriminates at full decisive weight.

### Why code reuse is not the argument

`F-S15-1` filed the reuse argument as unsound on this codebase, and this record does not resurrect it.
`../13_…md` §5.3 measured **zero Node builtins across all 65 `src/domain` entries**, and §5.4 records the
web tier reaching state **only through tool calls** — so it is architecturally an MCP client, not a
library consumer. **No score in this decision is justified by the application reusing core code.** The
argument is about **contract detection latency**, which is a different claim resting on different
evidence.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **A single fully-public monorepo** | **Eliminated by input (c) before scoring, not beaten in it.** The DP course application is confirmed private/closed; this topology's tree is public by construction, so it cannot hold the distribution line `../12_…md` drew — structurally, not by degree. Recorded as eliminated with rationale rather than dropped silently. It is **not** eliminated on the ports-and-adapters boundary or on MCP tool compatibility, which are facts to evaluate against and not reasons to preselect against a monorepo. |
| 2 | **Two separate repositories**, the application consuming the core as a published package | **`K4`.** The application resolves the core's gated-schema types from the last published version it installed, so a core schema change leaves it **typechecking green against a contract that is no longer true** until the next publish-bump-install cycle (`SPK-S9-1` variant D). Detection is deferred and invisible while deferred, on the exact surface the compatibility contract is about. **This alternative genuinely won `K2` and `K3`** — a structural rather than configured visibility guarantee, and forced consumption of the published artifact — and it was beaten on evidence rather than dismissed: both wins are carried forward as obligations `OI-S9-2` and `OI-S9-1`. |
| 3 | **A public repository with a private overlay** (private submodule or separately-held application tree) | **`K9`, compounded by `K1`.** The deployed artifact is composed from two trees that nothing releases atomically, so no single commit identifies a release. It takes alternative 2's duplication without alternative 2's structural separation, and loses to it on `K2` — the one criterion where that separation was supposed to be its advantage. |
| 4 | **Defer the topology until the deployment shape is known at SUB-10** | **Rejected on ordering and on dependency direction.** SUB-10 depends on this sub-task, so deferring would deadlock the package. It is also unnecessary: the decisive criterion `K4` is a **source-resolution** property, and no deployment shape moves a line of source between trees. `../14_…md` §6.4 names the one shape outcome that would reverse this decision and shows why it does not realistically fire, which is a stronger result than a deferral would have produced. |

---

## Consequences

1. **The migration path** from today's single-package repository is `../14_…md` §8, `M1`–`M10`, stated
   against facts measured at `0962279`. Every step names what must become true; none specifies the
   configuration that would make it true, because build tooling and package-manager configuration fail
   the architecture-material rule (`../13_…md` §4.7).

2. **NEU-850's `OUT-6` becomes a larger change than its wording implies.** `F-S9-3` measured that the
   core declares no `main`, `exports`, `types` or `bin`, so removing `"private": true` would make it
   publishable and still unusable. `M5` states the entry-point declaration as part of `OUT-6`'s
   execution. `"private": true` is **not** what blocks consumption — it blocks publication, not
   resolution.

3. **The distribution line becomes a configured guarantee.** `F-S9-4` measured no `files` field, so a
   publish today would ship everything not gitignored. `OI-S9-2` obligates an explicit allowlist **before
   the first publish** (`M6`). Stated without over-claiming: an allowlist **reduces** the risk the
   separate-repository alternative **eliminates**; it does not make the guarantee structural, and `K2`'s
   score is not revised by the obligation.

4. **The maintainer stops consuming their own published artifact**, which the rejected alternative 2
   would have forced. `OI-S9-1` obligates a gate that resolves the core from its published or packed
   artifact. `F-S9-3` shows the failure mode this guards is **already latent and already undetected**.

5. **Three criterion scores carry a declared deployment-shape assumption.** Accepted warning `F5.8`
   couples `K6`, `K7` and `K9` to a shape SUB-10 decides afterwards, and it **cannot** be repaired by
   reordering because SUB-10 depends on this sub-task. The three scores are stated **unconditionally**;
   the assumption `DS-1` and the single reversal condition are declared at `../14_…md` §6, and the check
   is handed to SUB-10 as `OI-S9-4`. Making the scores conditional was considered and rejected — it
   would have handed SUB-10 an unresolved conditional, which is what ordering SUB-15 first was meant to
   avoid.

6. **Whether one maintainer can operate the resulting release pipeline is capped, not asserted**
   (`CAP-S9-1`, owner NEU-896). The cap covers `K9`'s **margin**, not its direction, and the decision does
   not rest on it.

7. **No amendment is routed to NEU-850.** `OUT-6` and `OUT-7` are consumed; the `OUT-7` overlap is
   **partial** — it binds the cloud business layer and does not name the DP course application, whose
   placement this decision makes. One mechanical note is filed as `OI-S9-3`.

8. **No finding is routed to SUB-15.** Both live alternatives are compatible with the decided
   TypeScript/Node runtime, so `../13_…md` §6.5's routing rule did not fire.

9. **Nothing was created.** No repository, workspace file, directory or scaffold exists as a result of
   this decision, and no `package.json` was changed.

---

## Evidence

| Claim | Source |
| --- | --- |
| The web tier is TypeScript on Node, sharing the core's runtime | `DR-C10-S15-2`; `../13_…md` §6.2, §6.5 |
| A workspace, shared base `tsconfig`, one test runner and one CI pipeline are *available*, not conditional | `../13_…md` §6.5 |
| Code reuse is not a sound basis for a runtime or topology argument here | `F-S15-1`; `../13_…md` §5.3, §5.4 |
| Shared types catch shape changes, never `CC-S8-2`'s meaning-narrowing | `../13_…md` §6.3 |
| The compatibility surface is 46 tools / 43 gated / 3 exempt, 49 audit entries | `F-S8-1`; `../12_…md` §7.1–§7.2 |
| Detection methods are specified, never executed | `CAP-S8-1` |
| The core is not consumable as a dependency today; `private` is not the cause | `F-S9-3`; `SPK-S9-1` variants A/B/C/E |
| Live local development depends on whether the entry point resolves to source or to built output | `SPK-S9-1` variants D and E |
| No `files` field; a publish would ship everything not gitignored | `F-S9-4` |
| One maintainer: 720 commits at `0962279`, 468 human on one address, 252 automated | `F-S9-1` |
| 169 source files, 26,816 lines, 202 test files, 25 migrations; no workspace `packages:` key; no `apps/`/`packages/`/web directory | `F-S9-2` |
| No publish workflow; single-repository checkout with no cross-repository token or registry auth | `.github/workflows/` at `0962279`, all four files |
| Production deploys by SSH to one host running `docker compose up -d --build` from an off-repo compose directory; no `Dockerfile` in the repository, no IaC, no rollback | `.github/workflows/cd-prod.yml` at `0962279` |
| A single-process web tier would collapse `BND-S4-2` | `../13_…md` §6.4 alternative 3; `../05_…md` §4.2 |
| NEU-850's `OUT-7` overlap is partial | Charter assumption 24; `../01_outcome-register.md` `OUT-7` |

---

## Revision trigger

1. **`CAP-S15-2` fires** — `A-27` is weakened or withdrawn and `DR-C10-S15-2`'s runtime is re-decided
   divergently. Criterion input (d) is one of the three correlated decisions, and `K1`, `K5`, `K8` and
   `K9` inherit that dependency. A divergent runtime removes `SPK-S9-1` variant E's mechanism entirely —
   a non-TypeScript consumer cannot read the core's source — and changes `K4`'s shape. **This record is
   re-decided, not patched.**
2. **SUB-10 answers `OI-S9-4` with "yes"** — the chosen deployment shape requires the application to be
   built from a public repository. The selected topology becomes impossible rather than merely worse, and
   the selection reverses to rejected alternative 2. **Re-decided, not patched.**
3. **Charter assumption 32 changes status** — the DP course application ceases to be private/closed, or
   the core ceases to be public MIT. Input (c) is the eliminator that removed the fully-public monorepo;
   if it moves, the alternative set is re-opened and re-scored.
4. **Charter assumption 11 changes status** — a second maintainer joins. Input (a) is weighted decisive
   and is **two-sided**: it strengthens the rejected alternative at `K2` and the selected one at `K1`,
   `K5` and `K9`. A second maintainer supplies the reviewer whose absence made a structural guarantee
   worth more than a configured one, which narrows `K2`'s residual gap in the rejected alternative's
   favour while also reducing the operational load that `CAP-S9-1` caps. The record is re-scored rather
   than reversed on sight.
5. **NEU-850 amends `OUT-6` or `OUT-7`** such that the cloud business layer's placement or the core's
   publication changes. Both are consumed constraints here; a change at their owner propagates rather
   than being absorbed silently.
