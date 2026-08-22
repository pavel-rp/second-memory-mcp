# `DR-C10-S15-2` — The web tier is TypeScript on Node, decided on contract-sharing rather than on code reuse

**Task:** NEU-982 (SUB-15) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `229e8f4`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-8` (`../01_outcome-register.md`) — the web tier's runtime and language, published as `13_architecture-material-rule-and-web-tier-decisions.md` §6.

---

## Decision

**The web tier (`CMP-S4-3`) is written in TypeScript and runs on Node, sharing the core's runtime and
language.**

Three clauses are part of the decision and not commentary:

1. **The basis is contract-sharing, not code reuse.** The web tier is an MCP **client**
   (`CC-S8-5`; `../11_…md` §13.2), and the contract between it and the core is the **43 gated tool
   schemas**. A shared language puts the client inside `RD-S8-4`'s reach for the shape class of
   change. Code reuse is explicitly **not** the argument — see Rationale.
2. **This record permits the shared runtime; it does not authorise library-level reuse of the core.**
   Reuse becomes *available* under a shared runtime, and taking it inherits SUB-8's
   backward-compatibility obligation in full, including STDIO coverage. Priced below; not taken.
3. **The decision is published as a criterion input to SUB-9 (NEU-983)**, with the routing rule that
   a topology conclusion requiring a different runtime is a **finding routed to SUB-15 (NEU-982)**,
   never a local re-decision.

**Architecture-material under `DR-C10-S15-1`** on the compatibility-contract limb: no `BND-S4-*` row
and no Authority cell moves, but `CC-S8-5`'s premise and `RD-S8-4`'s reach do (`13_…md` §4.3).

---

## Rationale

### The criteria, and their weights, fixed before any runtime was scored

| # | Criterion | Weight |
| --- | --- | --- |
| **C1** | The client stays inside the compatibility contract's **detection** reach for changes to the 43 gated schemas. | **decisive** |
| **C2** | The choice is argued from this system's own evidence, **not** inherited from NEU-890's decision for authored solutions, proofs and tests. | **decisive** |
| **C3** | It is publishable as a criterion input SUB-9 can score build, testing, local development and release against, without a conditional. | high |
| **C4** | It does not, by itself, extend any `CC-S8-*` obligation — any extension must be a separate, priced decision. | high |
| **C5** | It costs no new component boundary. | medium |

### Why code reuse is not the argument — the measured result that removes it

The intuitive case for sharing the core's runtime is "so the web tier can reuse core code". **On this
codebase that argument is unsound twice over, and it is set aside on evidence rather than on taste.**

- **`SPK-S15-1` measured the domain layer's transitive import closure** over the built output at
  `229e8f4`. Across **all 65 `src/domain` entries** the closure reaches **zero Node builtins** and
  only three portable npm packages (`zod`, `compromise`, `markdown-it`). By contrast
  `infrastructure/db/client.js` closes over `pg`, `drizzle-orm`, `pino` and six builtins, and
  `composition-root.js` over 103 files, six packages and seven builtins. **The domain layer is
  runtime-portable**, so reuse of it would not require *Node* specifically — it would run on any
  modern JavaScript runtime. Reuse therefore cannot select between the candidates.
- **And reuse is not how the web tier consumes the core.** `CC-S8-5` records the web tier reaching
  state *"only through existing tool calls"*, adding no tool and changing no schema, and therefore
  carrying *"no obligation on the MCP surface"* (`../12_…md` §8.3).

Filed as **`F-S15-1`**, because a later reader reconstructing this decision will reach for the reuse
argument first, and it does not hold.

### What does decide it — C1

Because the web tier is an MCP client, the contract is the tool schemas: 43 gated tools whose input
shapes are Zod objects across **13 modules** under `src/domain/types/` (`zod ^3.23.8`). Under a
shared TypeScript runtime those schemas are consumable as the web tier's own types, so a change to a
gated tool's input shape is a **compile error at the client**. Under a foreign language the 43 schemas
are re-expressed by hand and drift is detectable only by someone noticing.

This is a compatibility-contract property, not a convenience: `../12_…md` §8.2 defines `RD-S8-4` as
the schema-delta detection method, and a same-language client is inside its reach while a
foreign-language client is outside it.

**The claim is deliberately narrow.** `../12_…md` §9.1 names a change class that is invisible to
`RD-S8-4`, to generated client types and to review — a declared field whose *meaning* narrows while
its *shape* is unchanged, which is exactly what `CC-S8-2` does to `context_token`. Shared types do
**not** catch that either. The honest claim is: a shared runtime covers the shape class and leaves the
semantic class uncovered for everyone equally. Overstating it would have made the decision look
better-supported than it is.

### C2 — argued, not inherited

NEU-890 settled TypeScript on Node for the course's **own solutions, proofs and tests**. That decision
is **consumed, not reopened**, and it is a decision about a different artefact class. This record does
not cite it as a reason. The reasoning above runs entirely on `CC-S8-5`, `RD-S8-4`, the measured
closure in `SPK-S15-1`, and the declared configuration at `13_…md` §5.2 — none of which is NEU-890.

That the conclusion **coincides** with NEU-890's is expected and is not evidence of inheritance; the
test is whether the argument would survive NEU-890 being absent, and it does.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **A different language entirely** — Python, Go, Elixir, or any non-JavaScript stack | **Fails C1, decisively.** All 43 gated schemas must be re-expressed by hand and kept in sync with no mechanical detection, placing the client outside `RD-S8-4` for the one class of change detection actually covers. Secondary, not decisive: the only MCP client implementation on this repository's dependency list is `@modelcontextprotocol/sdk ^1.27.1`, a TypeScript package. Fails **C3** as well — SUB-9 would score two toolchains on all four criteria. |
| **2** | **TypeScript on a non-Node JavaScript runtime** — Deno, Bun, or an edge worker | **The genuinely close alternative, and the one that had to be beaten on evidence rather than dismissed**, because it keeps the type-sharing property that decides C1. It loses on **C3**, not on capability: `tsconfig.json` declares `"module": "Node16"`, `"moduleResolution": "Node16"` and `"types": ["node"]`, so a second runtime needs a divergent compiler configuration; `package.json` `engines.node: ">=20.19.0"` and `.github/workflows/ci.yml`'s `node-version: [20.x]` matrix pin one runtime, so a second runtime is a second CI lane. **Stated plainly: it would probably work. It buys nothing this package can name, while costing all four of SUB-9's criteria.** That is the whole of the reason, and it is recorded rather than dressed up as a technical impossibility. |
| **3** | **No separate web-tier runtime — serve the learner surface from the existing MCP process** (`src/transport/http.ts`) | **Fails C5, and is disqualified by this chapter's own rule.** It collapses `BND-S4-2` (`CMP-S4-3` ↔ `CMP-S4-4`), which `../05_…md` §4.2 records as a **trust** boundary owned by `CMP-S4-4` where the core re-verifies the JWT itself. Removing a `BND-S4-*` row is the boundary limb of `DR-C10-S15-1` firing — so this is not a deployment convenience but an architecture-material change that **deletes a trust boundary**. |
| **4** | **Defer the runtime to SUB-9, deciding it alongside the topology** | Rejected on ordering, which is the sub-task's own problem slice. SUB-9's build, testing, local-development and release scores **move sharply** on this answer — a pnpm workspace, a shared `tsconfig`, one test runner and a single CI pipeline are credible only under a shared runtime. Deciding the runtime after the topology would leave that comparison resting on an undeclared assumption, and would make SUB-9 score a conditional on an undecided runtime, which `../01_outcome-register.md`'s acceptance criterion for `OUT-8` forbids. |

---

## Consequences

### 1. The criterion input handed to SUB-9 (NEU-983)

> **The web tier shares the core's TypeScript/Node runtime. SUB-9 may therefore score a pnpm
> workspace, a shared base `tsconfig`, one test runner and a single CI pipeline as *available*, not
> conditional.**

| SUB-9 criterion | Today (at `229e8f4`) | Under this decision | Under a split runtime |
| --- | --- | --- | --- |
| **Build** | one `tsconfig.json` over `src`, `tests`, `drizzle.config.ts`; no workspace packages | the web tier is a workspace package extending a shared base `tsconfig` — **one build graph** | two compiler configurations, two build systems |
| **Testing** | five vitest configs | the web tier adds a config to that set — **one runner** | a second runner with its own conventions |
| **Local development** | one `eslint.config.js`, one prettier scope, pnpm 10 | extends unchanged — **one lint and format pass** | a second toolchain, separately enforced |
| **Release** | one `build-test-lint` job, `node-version: [20.x]` | more steps in that job, or a matrix entry — **one lane** | a second lane with its own runtime install and cache |

**Routing rule:** a topology conclusion that would require a different runtime is a **finding routed
to SUB-15 (NEU-982)**, never a local re-decision in SUB-9.

### 2. The reuse consequence, priced and declined

A shared runtime makes library-level consumption of the core **available**. This record does not take
it, because the price is concrete:

- `CC-S8-5`'s *"no obligation on the MCP surface"* holds **because** the web tier reaches state only
  through tool calls. Library reuse voids that premise — the web tier becomes a consumer of the core's
  internals rather than its published surface.
- Every `CC-S8-*` obligation extends to that import surface. In particular **`CC-S8-3`'s STDIO gate,
  which has no owner (`OI-S8-2`)**, would need one: reused code must behave under both transports, and
  `BND-S4-17` is a trust boundary **nothing enforces, owner nobody**.
- Nothing would catch a break. `RD-S8-1`…`RD-S8-5` are **specified, never executed**, with no
  implementation to run them against and no regression suite to host them (**`CAP-S8-1`**).

**Reuse-from-core is therefore a separate decision that inherits SUB-8's backward-compatibility
obligation in full, including STDIO coverage.** A downstream charter takes it deliberately, or not at
all.

### 3. Transport qualification

The web tier reaches the core **over HTTP**, so every security-adjacent claim resting on this decision
is **HTTP-qualified**, per `../12_…md` §11's `AC-9`. The context-token gate is mounted only on the
HTTP path (`src/transport/http.ts:185`–`:186`); `src/transport/main.ts` and `create-server.ts` carry
no reference to it. **This decision does not close STDIO** and must not be read as doing so.

### 4. No new component and no new boundary

`CMP-S4-3` already exists in the component model and already sits behind `BND-S4-1` and `BND-S4-2`.
This decision gives it a runtime; it creates nothing and moves nothing (**C5** satisfied).

---

## Evidence

| Claim | Source |
| --- | --- |
| The web tier reaches state only through tool calls; no obligation on the MCP surface | `../12_…md` §8.3 (`CC-S8-5`) |
| All sixteen inventory entries are forwarded across `CMP-S4-4` | `../11_…md` §13.2 |
| 43 gated tools; the gated/exempt split; 46 / 43 / 3 | `../12_…md` §7.1–§7.2; `F-S8-1` |
| `RD-S8-4` is the schema-delta detection method | `../12_…md` §8.2 |
| The meaning-narrowing change class is invisible to `RD-S8-4` and to generated client types | `../12_…md` §9.1 |
| Detection methods specified but never executed | `CAP-S8-1`; `../12_…md` §14.2 |
| `CC-S8-3`'s STDIO gate is unowned | `OI-S8-2`; `../12_…md` §9.3, §14.2 |
| STDIO is a trust boundary nothing enforces, owner nobody | `../05_…md` §4.2 (`BND-S4-17`) |
| `BND-S4-2` is a trust boundary owned by `CMP-S4-4` | `../05_…md` §4.2 |
| Domain layer's transitive closure: 65 entries, zero Node builtins | `SPK-S15-1` (`../92_spike-register.md`), Node v22.23.1, cutoff `229e8f4` |
| `engines.node >= 20.19.0`; ESM; MIT | `package.json` |
| `module: Node16`, `moduleResolution: Node16`, `types: ["node"]`; one root project | `tsconfig.json` |
| `@modelcontextprotocol/sdk ^1.27.1`, `zod ^3.23.8`; 13 modules under `src/domain/types/` import zod | `package.json`; `src/domain/types/` |
| One CI job `build-test-lint`, `node-version: [20.x]`, pnpm 10 | `.github/workflows/ci.yml` |
| No web tier exists in the repository | `src/transport/` at `229e8f4` — MCP transports and middleware only |

---

## Revision trigger

1. **A topology conclusion in SUB-9 (NEU-983) that requires a different runtime** — routed here as a
   finding, and this record is re-decided rather than overridden there.
2. **The web tier's consumption mode changes from tool calls to library import** — `CC-S8-5`'s premise
   fails and Consequence 2's pricing becomes live rather than hypothetical. This record then needs an
   explicit reuse decision alongside it, and `OI-S8-2` becomes urgent.
3. **`RD-S8-4` is replaced or a contract-detection method is added that reaches a foreign-language
   client** — C1 weakens, and alternative 1 should be re-scored on its merits rather than on
   detection reach.
4. **`SPK-S15-1` expires (2027-04-30) without re-run** — the measured portability result goes stale,
   and `F-S15-1`'s second limb with it. The decision itself does not turn on portability (portability
   is what *removes* the reuse argument), so this is a re-labelling trigger rather than a reversal.
5. **`A-27` is invalidated by NEU-892 landing outside its envelope** — recorded as `CAP-S15-2`; all
   three of this chapter's decisions go stale together.
