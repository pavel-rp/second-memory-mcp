# 14 — The repository topology, decided against the alternative set the distribution facts have narrowed

**Task:** NEU-983 (SUB-9) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-22
**Model:** claude-opus-5[1m]
**Covers:** `OUT-7` · `OUT-10` (spike execution)
**Consumes:** `12_…md` (SUB-8 / NEU-981), `13_…md` (SUB-15 / NEU-982), `07_…md` (SUB-6 / NEU-976), `10_…md` (SUB-16 / NEU-979)
**Consumers:** SUB-10 (NEU-984), SUB-11 (NEU-985), SUB-12 (NEU-986), NEU-850, NEU-896

---

## 1. What this chapter is, and what it is not

This chapter decides **where the DP course application's code lands relative to the MCP core** — the
repository topology — and it decides it by scoring a fixed criteria set against a narrowed alternative
set, not by preference.

It is **not** a decision about build tooling, package-manager configuration or CI pipeline design; not
a decision about the web tier's runtime or language (`13_…md` decided that, and this chapter *consumes*
it); not a decision about deployment shape, data-store topology or AI-orchestration placement (SUB-10 /
NEU-984 decides those); and not a re-decision of NEU-850's `OUT-6` or `OUT-7`. No repository, workspace
file, directory or scaffold is created here, and `package.json` is not changed.

Two constraints are named at the top because they are *inputs to evaluation*, not arguments for an
answer. The ports-and-adapters boundary and MCP tool compatibility are **facts this comparison scores
against**. Neither is a reason to preselect a monorepo, and neither is a reason to preselect a reuse
strategy — `F-S15-1` already filed the reuse argument as unsound, and §3.4 below inherits that filing
rather than reopening it.

---

## 2. The revisions this chapter resolved against

| Input | Revision / marker | Where it is used here |
| --- | --- | --- |
| Web-tier runtime and language | `13_…md` §6, `DR-C10-S15-2` (SUB-15 / NEU-982) | Criterion input **(d)**, §3.4 |
| Application-versus-reusable-core rule, incl. the distribution-line finding | `12_…md` (SUB-8 / NEU-981) | The criterion for what may live alongside the core, §3.5 |
| Compatibility surface | **46 tools / 43 gated / 3 exempt**, and **49 audit entries** (46 tools + 3 prompts) — `F-S8-1` | Criterion `K4`, §5.4 |
| Authority matrix | `08_…md` + `10_…md`, revision **`post-validation`** (SUB-16 / NEU-979) | Not re-resolved here; no Authority cell moves, §9.2 |
| Ownership model | `M-A` (all-MCP), `07_…md` (SUB-6 / NEU-976) | Background to `K2`; not re-decided |
| Repository facts | This checkout at **`0962279`**, measured 2026-08-22 | §6, §8 |

**Verification cutoff:** `0962279`, 2026-08-22. Every repository number in this chapter was measured at
that commit in a dedicated worktree, and every number that differs from the brief's is filed as a
finding rather than rounded to the brief's (`F-S9-1`, `F-S9-2`).

---

## 3. The four criterion inputs, with their weights and their sources

These four are **criterion inputs carrying weights**, not background narrative. Each one is named again
at every criterion it drives, in §5.

| # | Input | Status | Weight | Source |
| --- | --- | --- | --- | --- |
| **(a)** | There is exactly one maintainer and operator | **confirmed** | **decisive** | Charter assumption 11; re-measured here as `F-S9-1` |
| **(b)** | The MCP core is intended for public MIT distribution | **confirmed** | **high** | Charter assumption 12; NEU-850 `OUT-6` |
| **(c)** | The DP course application is private/closed while the core stays public MIT | **confirmed** | **decisive** | Charter assumption 32 |
| **(d)** | The web tier is written in TypeScript and runs on Node, sharing the core's runtime and language | **decided** | **decisive** | `13_…md` §6.2, `DR-C10-S15-2` (SUB-15 / NEU-982) |

Charter assumptions **11, 12, 16, 24 and 32 are all confirmed** and cited at this decision. **None of
them belongs in SUB-1's stand-in register**, and in particular **assumption 32 appears here as a
confirmed input and never as an `[unconfirmed]` assumption** — the distribution line it draws is the
constraint that narrows the alternative set in §4, and a topology comparison resting on it as a
provisional stand-in would be a different, weaker comparison.

### 3.1 Input (a) — the sole maintainer and operator, re-measured

Charter assumption 11 states the creator authored **431 of this checkout's 648 commits** under two git
names on one address (415 + 16), the remaining **217 automated** (215 `github-actions[bot]`, 2
`Copilot`), so **every non-bot commit in the repository is the creator's**.

Re-measured at `0962279`:

| Author | Commits | Address |
| --- | --- | --- |
| `Pavel Kalabin` | 452 | `recky.ru@gmail.com` |
| `recky-ru` | 16 | `recky.ru@gmail.com` |
| **Human subtotal** | **468** | **one address** |
| `github-actions[bot]` | 250 | `…@users.noreply.github.com` |
| `Copilot` | 2 | `…@users.noreply.github.com` |
| **Automated subtotal** | **252** | — |
| **Total** | **720** | — |

The counts differ from the charter's and the difference reconciles exactly: **+37 human** (415 → 452,
all under `Pavel Kalabin`) and **+35 automated** (215 → 250, all `github-actions[bot]`) sum to the
**+72** commits between the charter's checkout and `0962279` (648 → 720). Filed as **`F-S9-1`**.

**The structural claim the criterion actually rests on is unchanged and is what carries the weight:**
every non-bot commit in the repository is the creator's, across two git names resolving to one email
address, with **zero third-party human commits**. The input is `decisive` because it is two-sided —
§5.2 and §5.9 record it cutting *against* the selected topology, and saying so is the point of giving it
a weight rather than a mention.

### 3.2 Input (b) — the intended public MIT distribution

Charter assumption 12, and NEU-850's `OUT-6`, which removes `"private": true` and publishes the core.

Verified at `0962279`: `package.json` carries `"private": true`, `"license": "MIT"`, and **no `bin`,
`main`, `exports` or `publishConfig`**; a `grep` for `publish`, `registry`, `NPM_TOKEN` and `npmjs`
across all four workflows (`ci.yml`, `cd-prod.yml`, `cd-test.yml`, `claude.yml`) returns **zero
matches**. **Second Memory is not distributed today.** The repository is private on GitHub and
MIT-licensed in file. The general-purpose claim is architectural, not distributional, and this chapter
does not treat it as evidence of distribution.

Weight `high` rather than `decisive`: publication intent constrains what the core's tree must be able
to emit, but by itself it does not discriminate between the two live alternatives — both can publish a
public MIT core.

### 3.3 Input (c) — the DP course application is private/closed, the core public MIT

Charter assumption 32, **confirmed**. This is the input that narrows the alternative set, and it is
`decisive` because it operates as an eliminator before it operates as a discriminator: it removes an
option from the set outright (§4.1) rather than merely scoring against it.

### 3.4 Input (d) — the web tier's runtime and language, consumed from SUB-15

`13_…md` §6.2 decides:

> **The web tier is written in TypeScript and runs on Node, sharing the core's runtime and language.**

Recorded as `DR-C10-S15-2`, with weighted criteria `C1`–`C5` fixed before scoring and four rejected
alternatives. `13_…md` §6.5 publishes the criterion input for this chapter in the exact form this
chapter consumes it:

> **The web tier shares the core's TypeScript/Node runtime. SUB-9 may therefore score a pnpm
> workspace, a shared base `tsconfig`, one test runner and a single CI pipeline as *available*, not
> conditional.**

**There is no residual conditional to close.** The package ordered SUB-15 before this sub-task
precisely so that the build, testing, local-development and release criteria could be scored against a
decided runtime rather than around an undecided one. Accordingly **every score at `K1`, `K5`, `K8` and
`K9` names the runtime it was scored under and cites `DR-C10-S15-2` as its source, and none of them is
stated as conditional.**

Three things about that input are consumed exactly as `13_…md` published them, and are **not**
re-derived here:

1. **It was argued, not inherited, and code reuse was explicitly rejected as its basis** (`F-S15-1`).
   `13_…md` §5.3 measured the domain layer's transitive import closure and found **zero Node builtins
   across all 65 `src/domain` entries**, reaching only three portable npm packages; §5.4 records that the
   web tier reaches state **only through tool calls**, making it architecturally an MCP client rather
   than a library consumer. **No score in this chapter is justified by "the web tier reuses core
   code."** That argument is filed as unsound and this chapter does not resurrect it.
2. **The decisive criterion was mechanical contract-sharing on the 43 gated tool schemas** — a
   compatibility-contract argument, not developer convenience. §5.4 below extends that same argument
   one hop, and is scored as a compatibility criterion for the same reason.
3. **The caveat is inherited without over-claiming.** `13_…md` §6.3: shared types catch a *shape*
   change mechanically; they do **not** catch `CC-S8-2`'s meaning-narrowing — **nothing does**. Every
   detection claim in §5.4 is therefore stated for the shape class only, and the semantic class is
   left uncovered for every topology equally.

**The routing rule, honoured.** `13_…md` §6.5 states that if this chapter's topology comparison
concluded that a preferred topology **required a different runtime**, that is a **finding routed back
to SUB-15 (NEU-982)** — never a re-decision made here. It did not: both live alternatives in §4 are
scored under, and are compatible with, the decided TypeScript/Node runtime. **No finding is routed to
SUB-15.**

`13_…md` also carries **`CAP-S15-2`**: all three of SUB-15's decisions rest on `A-27`,
**`[unconfirmed]`**, and go stale together if NEU-892 lands requiring offline-capable or
client-authoritative learning state. Input (d) is one of those three. **This chapter's scores at `K1`,
`K5`, `K8` and `K9` inherit that dependency** rather than presenting the runtime as settled beyond its
own recorded caveat — see §9.3.

### 3.5 SUB-8's rule, consumed as the criterion for what may live alongside the core

`12_…md` (SUB-8 / NEU-981) published the application-versus-reusable-core rule together with its
**distribution-line finding** — public MIT core, private closed application. This chapter **consumes**
that rule as the criterion for what may live alongside the core at all, and does not restate or
re-derive it. Its practical effect here is that the topology question is never "may the application's
code sit near the core's" in the abstract; it is "which arrangement keeps the distribution line SUB-8
drew intact under a sole maintainer."

Where a tool-surface figure is cited in this chapter it is **46 tools / 43 gated / 3 exempt**, with
**49 audit entries** (46 tools + 3 prompts), per **`F-S8-1`** — the charter's **45 / 42 / 40** are a
**miscount**, not staleness, which `F-S8-1` filed after re-deriving the surface across 16 registering
modules and which two independent derivations corroborated. All 43 gated tools already declare
`context_token`. `12_…md` further obligates **`CC-S8-2` token-bound identity**
(the per-call alternative rejected on forgeability), and specifies detection methods `RD-S8-1`…`RD-S8-5`
which **`CAP-S8-1`** records as **specified, never executed**. §5.4's detection argument is scored
inside that recorded limit and does not assume any `RD-S8-*` method is running.

### 3.6 The architecture-material rule, applied rather than restated

`13_…md` §4.1 states the rule; this chapter applies it and does not restate its derivation. The
topology choice passes the test at limb **C**: the two live alternatives differ in whether a change to
one of the **43 gated schemas** is detectable at the application's typecheck in the same commit or only
after a publish-and-install cycle (§5.4). That is a difference in the compatibility contract's
detection reach, so the choice is architecture-material and this package makes it.

The rule also explains three of this chapter's scope exclusions rather than merely asserting them:
**framework and library picks, build tooling and package-manager configuration fail the test** and are
therefore not decided here — which is why §8's migration path **names** each step at the level of what
must become true, and never specifies the configuration that would make it true.

---

## 4. The alternative set, after input (c) narrows it

### 4.1 The eliminated option, with its recorded rationale

**`T0` — a single fully-public monorepo.** Today's repository made public, with the DP course
application added inside it.

**Eliminated. Rationale, recorded rather than left silent:** input (c) is a confirmed decision that the
DP course application is **private/closed**. `T0` places the application's source in a tree whose
visibility is public by construction, so it cannot hold the distribution line `12_…md` drew at all —
not weakly, not by configuration, but structurally. The elimination is **by input (c) alone** and does
not depend on any score; `T0` is therefore removed from the set *before* scoring rather than scored and
beaten, and it appears in the matrix at §5.10 marked **eliminated** so that a later reader can see it was
considered and why it went.

Two things this elimination does **not** claim, stated so it is not over-read: it does not claim a
monorepo is a poor topology in general, and it does not eliminate `T0` on the ports-and-adapters
boundary or on MCP tool compatibility — those are facts to evaluate against, not reasons to preselect
against a monorepo. `T0` falls to the distribution line and to nothing else.

### 4.2 The live alternatives

| Id | Topology | Shape |
| --- | --- | --- |
| **`T1`** | **Two separate repositories** | A public MIT repository holding the core and publishing it to npm; a **separate private repository** holding the DP course application, consuming the core as a **published package dependency**. |
| **`T2`** | **Split-visibility workspace** | **One private repository** containing a workspace: a public-MIT core tree that publishes to npm, and a private application tree that never publishes. Split visibility is achieved **by publication**, not by repository boundary. |
| **`T3`** | **Public repository with a private overlay** | A public repository holding the core, with the private application tree carried outside it (private submodule, or a private repository consuming the public one) and composed at build time. |

`T3` is carried into the scoring rather than dropped, because it is the arrangement a reader reaches
for when they want `T2`'s single-tree convenience with `T1`'s structural visibility guarantee, and it
deserves a recorded consequence rather than silence.

**A note on the third tree.** NEU-850's `OUT-7` already places the **cloud tenant/billing/dashboard
layer** in its own separate private repository. That tree is **not** an alternative here and is not
scored; it is a consumed constraint (§7) that sits alongside whichever of `T1`/`T2`/`T3` is selected.

---

## 5. The criteria, their weights fixed before scoring, and the scores

**The criteria set and its weights were fixed before any alternative was scored**, following the
precedent `DR-C10-S15-2` set. The weights are derived from the four criterion inputs of §3 — which is
what makes those inputs *criterion inputs with weights* rather than scene-setting — and the derivation
column below records which input sets each weight.

| # | Criterion | Weight | Set by input |
| --- | --- | --- | --- |
| `K1` | **Build** | high | (d) |
| `K2` | **Ownership and the visibility boundary** | **decisive** | (b), (c) |
| `K3` | **Versioning** | high | (b) |
| `K4` | **Compatibility** — detection reach over the 43 gated schemas | **decisive** | (d), and `12_…md` |
| `K5` | **Testing** | high | (d) |
| `K6` | **Deployment** | medium | — (see §6, `F5.8`) |
| `K7` | **Observability** | medium | — (see §6, `F5.8`) |
| `K8` | **Local development** | high | (d) |
| `K9` | **Release** | high | (b), (c), (d) |

Scores are `++` (clearly better), `+` (better), `−` (worse), `−−` (clearly worse), on the criterion, not
overall.

### 5.1 `K1` Build — weight high

**Scored under the web-tier runtime decided by `DR-C10-S15-2`: TypeScript on Node, shared with the
core.** Under that decided runtime — and not conditionally on it — `13_…md` §6.5 makes a pnpm
workspace, a shared base `tsconfig` and a single CI pipeline **available** rather than conditional.

Measured at `0962279`: the repository builds with `tsc -p tsconfig.build.json`; `tsconfig.json` sets
`module`/`moduleResolution` to `Node16` with `verbatimModuleSyntax: true`, includes
`["src", "tests", "drizzle.config.ts"]`, and declares **no project references**. There is one CI job,
`build-test-lint`, on a single-entry Node matrix `[20.x]`.

- **`T2` `++`** — one build graph, one base `tsconfig`, one toolchain install. The application's build
  is a second project in the same graph; nothing is duplicated.
- **`T1` `−`** — two build graphs, two toolchain installs, two lockfiles. Nothing is impossible; the
  cost is duplication, and under input (a) it is duplication carried by one person.
- **`T3` `−−`** — one logical build graph split across two physical trees composed at build time: the
  duplication of `T1` without its separation.

### 5.2 `K2` Ownership and the visibility boundary — weight decisive

This criterion carries two distinct jobs, and separating them is what keeps the comparison honest.

**As an eliminator, it is decisive and it fires once:** can the topology hold "core public MIT,
application private/closed" at all? `T0` **cannot** (§4.1). `T1`, `T2` and `T3` all can. Having
eliminated `T0`, **`K2` stops discriminating on feasibility.**

**As a discriminator between the survivors it compares the *strength of the guarantee*, and here `T1`
is genuinely better:**

- **`T1` `++`** — the guarantee is **structural**. The public repository contains no private code
  because private code is not in it. There is no filter to misconfigure.
- **`T2` `−`** — the guarantee is **configured**. One private repository publishes a public subtree, and
  the correctness of the visibility line rests on the publish filter being right. Evidence that this is
  a live risk rather than a theoretical one: `package.json` at `0962279` declares **no `files` field**,
  so a publish today would ship **everything not gitignored** (`F-S9-4`).
- **`T3` `+`** — structural for the core, but it inverts the risk: the *private* tree is the one carried
  outside, and the composition step is the thing that can leak.

**Input (a) strengthens `T1` here, and this chapter records that rather than burying it.** A sole
maintainer has no reviewer; a structural guarantee that cannot be misconfigured is worth more to one
person than to a team that would catch a bad filter in review. `T1` wins `K2` on the merits.

The tie this creates against `K4` is resolved in §5.10 — explicitly, and not by re-weighting after the
fact.

### 5.3 `K3` Versioning — weight high

Set by input (b): a publicly distributed MIT core owes external consumers real version discipline.

- **`T1` `++`** — the application consumes the core **as a published artifact at a pinned version**. The
  maintainer necessarily consumes their own published package, so a broken published surface is caught
  by the maintainer's own build before any external consumer meets it.
- **`T2` `−`** — the application tracks the core's tree, not its published artifact. **The maintainer
  never eats their own published dogfood.** `F-S9-3` shows this failure mode is already latent and
  already undetected: at `0962279` the core declares no `main`, `exports` or `types`, so a consumer
  resolving `second-memory-learning` **fails outright** (`SPK-S9-1` variant A, `TS2307`) — and nothing in
  the repository notices, because nothing consumes it as a dependency.
- **`T3` `+`** — the core is published and consumed across a tree boundary, so some dogfooding occurs,
  but the composition step can shortcut it.

**`T1` wins `K3`, and the reason is evidence measured in this chapter rather than a general
preference.** Because this is a real advantage that the selected topology does not inherit, §9.1 records
**`OI-S9-1`** as an obligation `T2` must carry to recover it. A close alternative's best argument is
carried forward, not dismissed.

### 5.4 `K4` Compatibility — weight decisive

Set by input (d) and by `12_…md`. This is the criterion that selects, and it is the same argument
`DR-C10-S15-2` made decisive, extended exactly one hop.

**Scored under the web-tier runtime decided by `DR-C10-S15-2`: TypeScript on Node, shared with the
core.** The question is the **detection reach of the compatibility contract over the 43 gated tool
schemas** (`F-S8-1`: 46 tools, 43 gated, 3 exempt, 49 audit entries) — specifically, *when* a change to
a gated schema becomes visible to the application that consumes it.

`SPK-S9-1` measured the mechanism rather than assuming it (§6 of the spike register; full method and
results at `92_spike-register.md`):

| Variant | Core package shape | Core built? | Consumer typecheck |
| --- | --- | --- | --- |
| A | exactly `0962279`'s (`private: true`, no `main`/`exports`/`types`) | no | **fails**, `TS2307` ×2 |
| B | `+ main` + `types` → `dist` | yes | passes |
| C | `exports` map (`types`+`import`) → `dist` | yes | passes |
| D | as C, core **source** edited, **not** rebuilt | stale | **fails**, `TS2305` — consumer sees the stale contract |
| E | `exports` map → **source**, `dist` deleted | n/a | **passes** — live source resolution, no build step |

**The decisive difference, read off variants D and E:**

- Under **`T2`**, the application resolves the core's declared schema types **from source, in the same
  tree, at the same commit** (variant E: passes with no build step and with `dist` absent). A change to
  a gated schema **breaks the application's typecheck in the commit that makes it**. Detection is
  immediate and mechanical.
- Under **`T1`**, the application resolves the core's schema types **from the last published version it
  installed** (variants B/C, and decisively D). Between a core schema change and the application's next
  publish-bump-install cycle, **the application typechecks green against a contract that is no longer
  true** — a false green on the exact surface `12_…md` made the compatibility contract about. Detection
  is not absent; it is **deferred and invisible until deferred**.

- **`T2` `++`** · **`T1` `−−`** · **`T3` `−`** (`T3` resolves across a composed boundary: better than a
  publish cycle, worse than one tree).

**Two limits on this claim, stated rather than glossed:**

1. **Shape class only.** Per `13_…md` §6.3, shared types catch a **shape** change mechanically; they do
   **not** catch `CC-S8-2`'s meaning-narrowing — **nothing does**. `T2`'s advantage is over the shape
   class and **`T2` and `T1` are equally uncovered for the semantic class.** This chapter does not claim
   otherwise, and a reader who takes `K4` as covering semantic drift has over-read it.
2. **No `RD-S8-*` method is assumed to be running.** `CAP-S8-1` records `RD-S8-1`…`RD-S8-5` as
   **specified, never executed**. `K4` is scored on what the *typechecker* does under each topology,
   which is independent of whether any detection method has been implemented.

**This is a compatibility-contract argument, not a developer-convenience argument** — the same
distinction `DR-C10-S15-2` drew at its own decisive criterion. It is scored under a shared TypeScript/Node
runtime because that is what SUB-15 decided; §9.3 records what happens to it if `CAP-S15-2` fires.

### 5.5 `K5` Testing — weight high

**Scored under the web-tier runtime decided by `DR-C10-S15-2`: TypeScript on Node, shared with the
core** — under which `13_…md` §6.5 makes **one test runner** available, not conditional.

Measured at `0962279`: **202 test files**, a single Vitest installation, `test:unit` on
`vitest.unit.config.ts` and `test:ci` running build-then-coverage, with the CI job providing one Postgres
`pgvector/pgvector:pg16` service and one `DATABASE_URL` for the DB-backed suites.

- **`T2` `++`** — one runner, one coverage report, one Postgres service, and cross-tree tests (an
  application test exercising a core behaviour) are ordinary in-repo tests.
- **`T1` `−`** — two runners, two coverage reports, two CI services; a cross-tree test must either be
  duplicated or written against a published version, which reintroduces `K4`'s deferral inside the test
  suite.
- **`T3` `−`** — as `T1`, with the composition step additionally standing between the test and the code.

### 5.6 `K6` Deployment — weight medium

**Scored honestly and unconditionally.** The deployment-shape assumption these scores rest on, and the
outcome that would reverse the selection, are declared in **§6** — that declaration is this chapter's
handling of accepted warning `F5.8` and is **not** a hedge attached to the score.

- **`T2` `+`** — both processes are built from one checkout, which is how the existing `cd-prod.yml`
  already deploys.
- **`T1` `+`** — each process deploys from its own repository on its own cadence, which is cleaner when
  the cadences genuinely differ.
- **`T3` `−`** — the deployed artifact is composed from two trees, so a deployment cannot be identified
  by a single commit.

`T1` and `T2` are **level** here. That is a real result: deployment does not discriminate between the
two live alternatives, which is precisely why §6 can conclude what it concludes.

### 5.7 `K7` Observability — weight medium

**Scored honestly and unconditionally**; see §6 for the declared coupling.

- **`T2` `+`** — one source tree means a trace or a log line resolves to one commit across both
  processes.
- **`T1` `−`** — correlating an application-side symptom with a core-side cause crosses a repository and
  a version boundary; the correlating key is the published core version, not a commit.
- **`T3` `−`** — as `T1`.

### 5.8 `K8` Local development — weight high

**Scored under the web-tier runtime decided by `DR-C10-S15-2`: TypeScript on Node, shared with the
core.** This is the criterion where the shared runtime is most load-bearing, and `SPK-S9-1` measured it
rather than assuming it.

- **`T2` `++`** — variant **E** passed with **`dist` deleted and no build step**: a workspace link whose
  entry points resolve to source gives the application live visibility of a core edit. Edit core, typecheck
  application, done.
- **`T1` `−−`** — variant **D** is the measured counter-case: with the core consumed as a built package,
  a core source edit is **invisible** to the consumer until the core is rebuilt (`TS2305`), and under a
  genuinely *published* dependency the cycle is longer still — build, version, publish, install.
- **`T3` `−`** — between the two, and dependent on how the composition step is wired.

**The runtime dependency is explicit:** variant E works **because** consumer and core are the same
language and runtime, so the consumer's compiler can read the core's `.ts` source directly. Under a
divergent runtime variant E is impossible and this criterion's gap closes almost entirely — which is
exactly the sensitivity `13_…md` §6.5 identified when it published the runtime **before** this chapter
scored. **This score is not conditional on that runtime; it is scored under it, because it is decided.**

A second measured result, recorded because it corrects a natural misreading: **`"private": true` was not
what blocked resolution.** Variants B, C and E all resolved cleanly with `"private": true` still set. It
blocks **publication**, not **resolution** (`F-S9-3`).

### 5.9 `K9` Release — weight high

**Scored under the web-tier runtime decided by `DR-C10-S15-2`: TypeScript on Node, shared with the
core** — under which `13_…md` §6.5 makes a **single CI pipeline** available, not conditional. See §6 for
the declared deployment-shape coupling.

Measured at `0962279`: one CI workflow with one `build-test-lint` job and a `version-bump` job that
bumps the patch version on `develop`, opens its own PR and auto-merges it — the mechanism behind **250 of
the 720 commits** (`F-S9-1`). `actions/checkout@v4` is invoked with **no `repository:` and no
cross-repository token**, and there is **no publish step anywhere**.

- **`T2` `+`** — one release pipeline emits two things: a published public core package and a deployed
  private application. The single `version-bump` apparatus is retargeted, not duplicated.
- **`T1` `−`** — two pipelines, two version-bump loops, and a **release ordering constraint**: a
  cross-cutting change must be published from the core repository and only then consumed in the
  application repository. Under input (a) that ordering is enforced by one person's memory.
- **`T3` `−−`** — two pipelines plus a composition step that must be released atomically across trees,
  which nothing enforces.

**Input (a) cuts against `T2` here too and it is recorded, not suppressed:** `T2`'s single pipeline must
learn to publish one subtree publicly while never publishing another, and a sole maintainer configures
that alone. Whether the *current* CI can be operated that way by one maintainer is **not settled in this
chapter** — it is capped, with a named owner, at **`CAP-S9-1`** (§9.2), because settling it requires the
CI pipeline design this chapter is explicitly scoped out of.

### 5.10 The matrix, and the selection

| Criterion | Weight | `T0` | `T1` | `T2` | `T3` |
| --- | --- | --- | --- | --- | --- |
| `K1` Build | high | — | `−` | **`++`** | `−−` |
| `K2` Ownership / visibility | **decisive** | **eliminated** | **`++`** | `−` | `+` |
| `K3` Versioning | high | — | **`++`** | `−` | `+` |
| `K4` Compatibility | **decisive** | — | `−−` | **`++`** | `−` |
| `K5` Testing | high | — | `−` | **`++`** | `−` |
| `K6` Deployment | medium | — | `+` | `+` | `−` |
| `K7` Observability | medium | — | `−` | **`+`** | `−` |
| `K8` Local development | high | — | `−−` | **`++`** | `−` |
| `K9` Release | high | — | `−` | **`+`** | `−−` |

`T0` is marked **eliminated** rather than scored, per §4.1: it is removed by input (c) before scoring,
not beaten in it.

**The two decisive criteria point in opposite directions, and the tie-break is stated rather than
engineered.** `K2` favours `T1`; `K4` favours `T2`. The resolution is a property of `K2` itself, not a
re-weighting applied after the scores were seen:

> **`K2` is decisive as an *eliminator* and high as a *discriminator*.** Its decisive weight is spent
> removing `T0` from the set — the only option that cannot hold the distribution line at all. Among the
> survivors, all of which *can* hold it, `K2` compares the **strength** of a guarantee that every
> survivor already provides. `K4` has no such split: it discriminates between the survivors at full
> decisive weight, and it is the criterion `12_…md` and `DR-C10-S15-2` both made decisive.

**Selected: `T2` — the split-visibility workspace.** Decisive criterion: **`K4`, compatibility —
detection reach over the 43 gated schemas.**

**Rejected alternatives, each with the consequence that decided it:**

| Alternative | Deciding consequence |
| --- | --- |
| **`T0`** single fully-public monorepo | **Eliminated by input (c) before scoring.** The DP course application is confirmed private/closed; `T0`'s tree is public by construction, so it cannot hold the distribution line `12_…md` drew — structurally, not by degree. |
| **`T1`** two separate repositories | **`K4`.** The application resolves the core's gated-schema types from the last published version it installed, so between a core schema change and the next publish-bump-install cycle the application **typechecks green against a contract that is no longer true** (`SPK-S9-1` variant D). Detection is deferred and invisible while deferred, on the exact surface the compatibility contract is about. `T1`'s genuine wins at `K2` and `K3` are recorded and carried forward as obligations `OI-S9-1` and `OI-S9-2`, not dismissed. |
| **`T3`** public repository with a private overlay | **`K9`, compounded by `K1`.** The deployed artifact is composed from two trees that nothing releases atomically, so no single commit identifies a release; it takes `T1`'s duplication without `T1`'s structural separation, and is beaten by `T1` on the one criterion (`K2`) where that separation was supposed to be its advantage. |

**The weights in §5 were fixed before any alternative was scored**, derived from the four criterion
inputs of §3, and were not adjusted afterwards. The tie-break in this section resolves a **conflict
between two decisive criteria** by reference to how `K2` was defined at the outset — as an eliminator
whose decisive weight is spent on feasibility — and **not** by changing any weight.
