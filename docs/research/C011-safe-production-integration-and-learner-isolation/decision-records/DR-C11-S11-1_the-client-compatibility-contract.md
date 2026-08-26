# `DR-C11-S11-1` — The compatibility contract is written over a surface re-derived at this cutoff, states a detection method per change rather than relying on a schema diff, and is bounded by what the enforcement point confines

**Task:** NEU-1004 (SUB-11) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `35f92ba`, 2026-08-25
**Model:** claude-opus-5[1m]

**Discharges:** OUT-16 (`../90_outcome-register.md`).

---

## Decision

The backward-compatibility contract for existing MCP clients is published as
`../11_the-client-compatibility-contract.md` under five clauses.

1. **The surface is re-derived, disaggregated, and published as commands.** The registered, gated
   and exempt figures are obtained from `src/` at this sub-task's own cutoff on a branch containing
   C010, and published as a sixteen-row per-module registration table, a two-way independent
   derivation of the exempt set, and a thirteen-row mapping of the `context_token` declarations onto
   the non-exempt registrations. **The gated figure is a mapping, not `46 − 3`.** The charter's
   figure is read only afterwards, to reconcile.

2. **The durable claim is carried alongside the number.** *The set of gated tools lacking
   `context_token` is empty* is the form downstream consumers are directed to cite; `43` is recorded
   with its cutoff and is expected to go stale.

3. **Every implied change carries an obligation, a breaking verdict and a detection method**, and
   the **semantics-without-schema-shape** class is separated out and given detection methods a
   tool-manifest diff cannot express — four behavioural probes asserting on refusals and row
   visibility, two of them in the negative form (*a refusal, not an empty result*; *A sees A's own
   rows, not merely none of B's*).

4. **The guarantee is stated with its negative half, bounded by the enforcement point.** What a
   client is **not** guaranteed is published as a table of **four path escapes** — three of SUB-5's
   §6 rows plus its §7.4 operator paths, with SUB-5's §6.4 non-retroactive boundary carried below the
   table because it is a *population* limit that cuts both ways rather than a path outside the
   enforcement point — plus the `OBJ-1` concurrency ceiling. **A client's guarantee may not exceed
   what the enforcement point actually confines.**

5. **`F-S4-4`'s cost is priced as a fork and three delivery tiers, not as an estimate.** The
   extraction is priced by naming what a transport-neutral seam must carry, identifying the
   **option A / option B** fork that determines its blast radius, and tabulating three delivery
   tiers against all seven of SUB-4's classified paths. **No effort estimate is given.**

---

## Rationale

**On clause 1.** C010's `F-S8-1` establishes that the charter's figures were not stale — they were
produced by *running the verification procedure itself*, seventeen days after the last change to
`src/server/`, and still came out wrong. That is a method-reliability defect, and it has a direct
methodological consequence: **a re-count is not made trustworthy by being recent.** A figure asserted
by a fresh author is the same artefact that failed before. What distinguishes a trustworthy count is
that a reader can re-run it and disagree at the level where the error actually occurred — which for
C010 was not the headline `43` but the `40 named` breakdown beneath it, the error that would have
told a reader the wrong *set* of tools needed work. Hence per-module tables rather than three
numbers, and hence a mapping rather than a subtraction: `46 − 3 = 43` would have reproduced the
arithmetic without touching the evidence.

**On clause 2.** A count is a property of a moving tree. `F-S5-3` already carried the emptiness claim
for this reason and this chapter adopts it rather than reinventing it. The point is not modesty about
the number; it is that the two claims have different lifetimes and downstream consumers need the
longer-lived one.

**On clause 3.** This is the acceptance criterion the outcome names specifically, and it is the one
with real teeth. The obvious compatibility check for an MCP server is a tool-manifest diff, and
against this package's mechanism it returns **empty** — all 46 names unchanged, all 43 gated schemas
unchanged, because `context_token` was already required on every gated call. A team whose
compatibility gate is a manifest diff ships every one of `CH-1` … `CH-7` and sees green. Stating this
as a class, and naming what does detect it, is the difference between a contract and a description.
The negative forms matter for the same reason: the failures they catch **present as success**. A
predicate that refuses everyone passes a naive isolation test, and an empty-scoped service principal
passes a naive refusal test.

**On clause 4.** SUB-5 named four escapes and stated them plainly. A compatibility contract that
listed only what improves would be read — reasonably — as a claim that the improvements are the whole
story, and the reader most likely to make that inference is the self-hoster deciding whether to
upgrade. `DR-C11-S2-2`'s reasoning generalises: a silent absence is indistinguishable from a
guarantee. The four escapes are therefore published in the contract itself rather than left in
SUB-5's chapter for a reader to find.

**On clause 5.** `F-S4-4` closes with *"this finding states that it exists, not what it costs"*, so
the pricing is genuinely owed. But the repository supports two kinds of pricing and only one of them
honestly. It supports counting **what must be ranged over** and identifying **which decision sizes
the work**; it does not support estimating effort, and an estimate offered from here would be
invented. The tier framing is what makes the pricing load-bearing rather than descriptive: it turns
out that an unpaid extraction does **not** leave SUB-4's seven paths as classified. It re-reads three
of them as *unaffected* — the same word the genuinely unaffected row carries — while what has
actually happened is that the adapter clauses shipped and every STDIO caller is refused as kind
`none` with no gate to name the reason. That is a fact about the seven-path table's readership, not
about the extraction, and it is only visible once the cost is decomposed into tiers.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Adopt the settled 46 / 43 / 3 on the charter's authority and skip the re-derivation.** The figure is already corrected by `F-S5-3` and diagnosed by `F-S8-1`; re-counting looks like ceremony. | It is the specific thing the outcome forbids, and `F-S8-1` explains why the ceremony is the substance: the last figure that reached this package was produced by a verification procedure that had itself been run. Adopting a settled figure is how `42` propagated from C010's charter into `NEU-975` and into this charter's intake. A settled figure adopted without derivation is indistinguishable, at the point of use, from a stale one. |
| 2 | **Derive the gated figure as `46 − 3`.** Both operands are independently derived, so the subtraction is sound and far cheaper than a thirteen-row mapping. | Sound, and it proves nothing. The subtraction is true whatever the `context_token` declarations actually say — it cannot detect a gated tool whose schema omits the argument, which is precisely the class of error C010's `40 named` breakdown embodied. The mapping balances in both directions and would fail loudly on exactly that defect. |
| 3 | **Prescribe a tool-manifest diff as the detection method**, since it is the standard MCP compatibility check and requires no new machinery. | It returns **empty** against every change this package implies. Prescribing it would publish a compatibility gate guaranteed to pass, which is worse than prescribing none — a green check is read as evidence. |
| 4 | **Fold the 3 prompts into the surface count and publish 49.** It is the true count of registered MCP entry points, and a contract over "the surface" should cover all of it. | Widening a settled, hard-won figure is exactly how a miscount propagates; a later reader meeting `49` against C010's `46` has no way to tell a correction from an error. The prompts are counted and published **separately** (`F-S11-3`), which delivers the completeness without touching the tool figure. |
| 5 | **Give the extraction an effort estimate** — even a rough band — so the rollout has something to plan against. | Nothing in the repository supports one, and the environment cannot reach the deployment. An invented band would be the highest-leverage wrong number in the chapter: it feeds directly into whether the limb is cut, which is `R-S4-4`'s named hazard. Naming the option A / option B fork gives a planner the thing that actually determines the size, without asserting the size. |
| 6 | **Price `F-S4-4` under the assumption the extraction happens**, treating SUB-4's seven-path table as the delivered outcome and adding only a cost note. | This is the reading that produces the defect. SUB-4's classification is conditional on the gate reaching STDIO, and the whole content of the pricing turns out to be what happens when it does not. Pricing under the happy path would have priced the cost while missing the consequence. |
| 7 | **Report the DP-rubric breach in prose, or omit it** — it is pre-existing, out of scope to repair, and the review's verdict on *this package's* changes is clean. | The review would then have returned a clean verdict over a surface that fails the clause the verdict is about, which is a false statement of the contract's own premise. `README.md`'s house rule and SUB-17's audit both require a finding rather than absorbed prose. The two verdicts are reported **separately** so neither is read as the other. |
| 8 | **Author `R10`, following SUB-1's forward-allocation table**, which explicitly pre-assigns the tool-count row to SUB-11. | `R10` is already authored by SUB-3, for the legal-determination risk, computed from the charter as the stated rule requires. Taking it would collide. The rule in `README.md` and at `../92_risk-register.md:17` keys on charter position, an independent read puts this row at 11, and six already-claimed ids all agree with charter position. `F-S3-3` named both branches and only one is available. |
| 9 | **Resolve `F-S3-3` here**, since this sub-task holds the last of the three disputed ids and could state the whole allocation. | Resolution requires diffing two readings of a gitignored, unversioned file, which cannot be done from here, and requires editing SUB-1's entries, which the append-only rule forbids. `F-S3-3` routes it to SUB-14 for exactly these reasons. A position is stated and its premise registered as `A-S11-1`; nothing is re-allocated. |

---

## Consequences

1. **A reader can re-run the count and disagree with it.** Three commands and three tables, at a
   named ref. That is the property `F-S8-1`'s diagnosis actually demands, and it is stronger than
   the count being right.

2. **A compatibility gate built on a schema diff is explicitly disqualified.** Anyone adopting one
   for this change now has to meet §4.1's argument for why it returns empty. The cost is that the
   four probes must be written, and they are not — no test file is created here, and `tests/` is
   out of scope.

3. **The contract's negative half is as long as its positive half**, which makes it harder to quote
   selectively — and harder to read. This is deliberate; §8 is the section most likely to be skipped
   and the one that bounds every promise above it.

4. **`SUB-10 of C010 (NEU-984)` receives a fork rather than a number.** The option A / option B
   question is now the thing to answer first, and option B carries a consequent detection obligation
   (`OI-S11-2`) that option A does not.

5. **SUB-7's stage sequencing acquires a visible dependency on the tier.** Which of Tier F / G / N
   ships determines what three of SUB-4's seven paths actually mean, so the stage plan can no longer
   treat the seven-path table as tier-independent.

6. **A pre-existing charter-constraint breach is now on the record with an escalation route**
   (`F-S11-2`, `R-S11-1`, → `NEU-896`). What becomes harder: nobody can now describe the core as
   non-DP-specific without meeting it, including in materials that have nothing to do with this
   package.

7. **Two register-integrity defects are handed to SUB-14 rather than fixed** (`F-S11-1`,
   `F-S11-5`). What becomes harder: SUB-14's assembly pass now has three id reconciliations to run
   (with `F-S3-3`) rather than one, and none of them can be resolved by a sub-task that finds them.

8. **The chapter claims no QA pass and no executed spike**, and says so in the same place it reports
   its evidence posture, so a reader cannot mistake twenty-three designed spikes for twenty-three
   answers.

---

## Evidence

| Claim | Source |
| --- | --- |
| 46 registered tools across 16 registering modules | `grep -rc "server.registerTool(" src/` at `35f92ba`; aggregated by `src/server/tools.ts:17`–`:30` |
| 3 exempt, derived by empty schema | `src/server/server-info-tools.ts:13`; `src/server/server-context-tools.ts:21`; `src/server/server-workflow-tools.ts:15` |
| 3 exempt, derived independently by the gate's own literal | `src/transport/context-token-middleware.ts:5`–`:9` |
| 43 gated, mapped module by module onto 43 schema declarations | `grep -rn "context_token:" src/` at `35f92ba`; 41 in `src/domain/types/`, one module-local at `src/server/session-progress-tools.ts:131`, one genuinely inline at `src/server/teaching-tools.ts:35` |
| The settled figure and its miscount diagnosis | `../../C010-system-and-repository-architecture/02_findings-register.md:249`–`:254` (`F-S5-3`); `:604`–`:609` (`F-S8-1`) |
| The gate is HTTP-only, covers `tools/call` only, fails open, and checks validity not identity | `src/transport/context-token-middleware.ts:43`, `:51`, `:73`, `:83`–`:86`; mounted at `src/transport/http.ts:186` |
| STDIO has no interposed middleware, and is the default mode | `src/transport/main.ts:55`–`:59`; `src/config/resolve-transport-config.ts:35` |
| The seven-layer HTTP pipeline | `src/transport/http.ts:108`, `:123`, `:153`, `:164`, `:173`, `:180`, `:186` |
| Four Express-typed middleware factories | `src/transport/jwt-middleware.ts:87`; `src/transport/rate-limit-middleware.ts:70`; `src/transport/audit-middleware.ts:23`; `src/transport/context-token-middleware.ts:46` |
| No SDK interposition point between dispatch and handler | `src/transport/create-server.ts:17`–`:23` constructs the server and makes a single `registerServerTools(server, ctx)` call at `:23`, which fans out through `src/server/tools.ts:17`–`:30` to the 46 `registerTool` sites — the 46 calls are not in `create-server.ts` |
| 3 prompts registered | `src/transport/create-server.ts:25`, `:45`, `:80` |
| The DP rubric also reaches the prompt surface | `src/shared/prompts/prompt-pack.ts:837`, `:855`, `:857` (`formatQualityRubric()`), spliced at `:247`, `:281`, `:319`, `:687`, `:731`, `:774`, `:818` |
| `init_agent_context` is row-owning and survives on a fail-open | `src/server/server-context-tools.ts:27`, `:28`–`:31`; `src/orchestration/learner-context-workflows.ts:95`–`:103`; `tests/smoke/smoke.test.ts:191`–`:194` |
| The smoke principal's `sub`-absence is believed, not observed | `src/transport/jwt-middleware.ts:116` (a code comment); `../92_risk-register.md:221` (`R-S2-2`), `:279`; `../96_spike-register.md` § `SPK-S1-1`, **not executed** |
| The DP rubric in the core surface | `src/domain/types/teaching.ts:275`–`:287` (`:285` for the description), `:306`, `:330`, `:467`, `:472`; `src/server/teaching-tools.ts:19`, `:62`, `:88`, `:111`, `:198` |
| The smoke run's grant and its eight scenarios | `.github/workflows/cd-prod.yml:110`–`:174` (`:158` for `client_credentials`); `tests/smoke/smoke.test.ts:104`, `:111`, `:128`, `:152`, `:163`, `:200`, `:231`, `:263` |
| The consumed decisions | `DR-C11-S4-1`, `DR-C11-S4-2`, `DR-C11-S4-3`, `DR-C11-S5-1`; the seven paths at `../04_the-stdio-identity-gate-and-the-bound-context-token.md:413`–`:421` |
| The four escapes | `../05_the-enforcement-point-that-confines-every-read-and-write.md` §6.1, §6.2, §6.3, §7.4 |
| The concurrency ceiling | `src/infrastructure/db/client.ts:42`; `../15_operational-objectives-for-the-real-platform.md:248`, `:131`, `:161`–`:163` |
| `R11`'s position, cross-checked | The charter's § Risks table read 2026-08-25 (gitignored `_local/`), against `../92_risk-register.md` §§ `R1`, `R8`, `R10`, `R12`, `R13`, `R14` |
| Twenty-one spikes designed, zero executed | `../96_spike-register.md`, section headings enumerated at `35f92ba` |

---

## Revision trigger

This record is reopened by any of the following observable events.

1. **A `registerTool` call site is added or removed**, or a tool's input schema gains or loses
   `context_token` — the surface figures move and §1's derivation must be re-run at the new cutoff.
   This is expected, not exceptional; clause 2 exists because of it.
2. **`EXCLUDED_TOOLS` and the empty-schema set stop agreeing** (`OI-S11-1`). The exempt decision of
   §4.2 rests on their agreement, and either direction of divergence has a distinct failure mode.
3. **The gate extraction's design settles on option A or option B** (`OI-S11-2`). Option B adds a
   detection obligation this record does not currently impose.
4. **A tier is chosen for the STDIO gate.** §6.3's three-column table collapses to one, and three of
   SUB-4's seven paths take a settled classification.
5. **Any spike in `../96_spike-register.md` is executed** — in particular `SPK-S11-1`,
   `SPK-S4-1` or `SPK-S16-1`. `CAP-S11-1` currently bounds every path classification to *would*
   rather than *does*; an executed spike lifts part of that bound and the contract can then say more.
6. **`GradingPayloadShape` is generalised or removed** — §9's DP-specificity verdict changes and
   `R-S11-1` closes.
7. **SUB-14 resolves `F-S3-3`.** If the resolution establishes that the charter moved rather than
   that the allocation table was wrong, `R11`'s id changes while its content does not, and
   `A-S11-1`'s invalidating outcome has fired.
8. **C011 is added to the citation checker's `GATED` list** (`CAP-S1-2`). The gate applies
   retroactively, and §1.6's disclosure plus the shorthand grep become CI-enforced rather than
   locally attested.
