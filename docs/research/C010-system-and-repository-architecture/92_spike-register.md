# 92 — Spike Register

**Task:** NEU-971 (SUB-1) opens it and sets its rules · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Owner of the rules:** SUB-1 (NEU-971). **Owner of each record:** the sub-task that ran the spike. **Audited by:** `NEU-985 (SUB-11)`.

**This register is complete in rules and empty of results.** SUB-1 published the discipline and ran no spike under it. The first record is written by the first sub-task that needs one.

---

## 1. What a spike is here

A spike is a **bounded, throwaway experiment** run to settle one question that reading could not settle. It may write and run **real code**. It is never product code, it is never merged, and its conclusion **expires**.

A spike is not a prototype, not a proof of concept that graduates, and not "implementation done early". The moment a spike's output is something anyone wants to keep and extend, it has stopped being a spike and has become unreviewed implementation wearing a spike's label.

## 2. Who may run one

**Any sub-task may run a spike.** SUB-2 … SUB-16 all have the same standing under this register; so does any later charter reading this package.

This is stated explicitly because the charter *anticipated* spikes in a few places — the execution-environment question and the deployment-shape question among them — and an anticipation is not a permission list. **A sub-task that finds a claim of its own that is both uncertain and material is permitted to run a spike under this template and this quarantine path, without asking anyone**, whether or not spikes were anticipated for it.

**A cap is available only where a spike is infeasible.** The three-way rule:

| The uncertain, material claim… | Resolution |
| --- | --- |
| could be settled by a bounded experiment | **Run the spike.** Record it here. |
| could not be settled by any experiment available to this package (needs an unbuilt package, an external party, production data that does not exist, or the operator) | **File a cap** in `91_caps-and-incomplete-scope.md`, with a named owner. |
| could be settled by *reading* | **Read it.** Neither a spike nor a cap. See §3. |

**Asserting it is not an available fourth option.** Every claim that is uncertain **and** material resolves to a spike record, a cap, or a citation. `NEU-985 (SUB-11)` audits for exactly that and reports the count in each class.

## 3. The justification test — "could this have been read instead?"

**Before** a spike is run, its record states **why the question could not be settled by reading** — the codebase, an upstream package, a decision record, or the operator's answer. The test is applied against named sources, not in the abstract:

> *Which files did you read, which upstream package did you check, and what specifically did they fail to answer?*

A spike whose record cannot name what it read and what that reading failed to answer **fails the justification review** regardless of how good its result is. This is the single control against a spike becoming disguised implementation: the cheapest way to smuggle implementation in is to skip the reading that would have made the experiment unnecessary.

`NEU-985 (SUB-11)` runs the justification review over every record in this register.

## 4. Quarantine — structural, not a promise

**Working files live under `_local/scratch/`**, per the project constitution's temp-and-scratch article. That tree is gitignored (`.gitignore:100`), so quarantine is enforced by the repository rather than by anyone's discipline.

The hard rules:

- **Nothing under `src/`.** No spike writes to `src/`, `tests/`, `drizzle/`, or any other product path. Ever.
- **Nothing merged as product code.** A spike's code does not become a pull request. If the answer implies code should exist, that code is written later, by the charter that owns it, from the decision — not lifted from the scratch tree.
- **Nothing in the scratch tree is readable by a later reader.** `_local/scratch/` is gitignored and therefore invisible to everyone but its author. **Anything a later charter must be able to read lands in this package** — as the spike record below, with its result stated in full. A record that says "see the scratch output" has recorded nothing.
- **A spike that needs to touch production data does not run.** It is a cap.

`NEU-985 (SUB-11)` audits the repository to prove no spike artifact landed in `src/` or in any tracked path other than this package.

## 5. Exit conditions are observable events

**This is the register's load-bearing rule, and it is not negotiable.**

> **Every exit condition is an observable event. The passage of time is never an exit condition, and neither is anyone's satisfaction.**

A spike's exit condition is stated **before it runs**, and it names something a third party could later check actually happened:

| Not an exit condition | An exit condition |
| --- | --- |
| "until the end of the week" | "until the query returns a row with a non-null `user_id`" |
| "when we're comfortable with the approach" | "when the migration has been applied and rolled back once, with both results recorded" |
| "after enough investigation" | "when the harness has been run against both topologies and the two outputs are recorded side by side" |
| "when SUB-7 is happy with it" | "when SUB-7's decision record citing this spike lands on `origin/develop`" |
| "in two weeks" | "when NEU-891's package is published under `docs/research/`" |

**Why this rule is stated this bluntly.** The preceding C009 package's equivalent contract learned it the hard way: a condition phrased as a date or as a party's judgment cannot be checked by anyone who was not in the room, so it silently never fires, and the thing it gated stays open forever while reading as though it is under control. `"the passage of time is never an exit condition"` is that package's settled rule, and it is carried here unchanged rather than re-derived.

A record whose exit condition is a date or a satisfaction **fails the audit**, and the remedy is to restate it as an event — not to argue that everyone knew what was meant.

## 6. Expiry is mandatory — and it is not an exit condition

**Every record carries an expiry date. The field is mandatory and may not be left blank, "N/A", or "none".**

Expiry and exit are different things and the register keeps them apart:

- The **exit condition** ends the spike. It is an observable event (§5).
- The **expiry date** marks the spike's *conclusion* **stale**. On expiry the conclusion must be **re-run** or **re-labelled** — it does not close, resolve, expire-away, or quietly become true.

**Expiry never closes anything by itself.** A spike whose expiry has passed with no re-run has a stale conclusion, and anything citing it is citing a stale conclusion. That is a defect in the **citing** document as much as in the record.

**Citing a spike inherits its expiry.** `…confirmed by SPK-S7-2…` in a decision record means that decision is only as fresh as `SPK-S7-2`. `00_method-and-provenance.md` §2.6 states the citation rule; this section states the obligation it creates.

**Choosing the date.** Set it from what would make the answer wrong — a dependency version, an upstream package landing, a deployment change — and record that reasoning in the **Expiry rationale** field. An expiry with no rationale is a guess with a date on it.

## 7. Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Do not tidy duplicates in flight.** A duplicate record is correct-by-convention until the package is complete.

## 8. Id namespacing (there is no global counter in this file)

Ids are **`SPK-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-2 allocates `SPK-S2-1`, `SPK-S2-2`, …; SUB-9 allocates `SPK-S9-1`, … — concurrently, without coordination, and without collision.

A global counter would oblige an appending sub-task to know what every concurrent sibling had already allocated, and a merge would then oblige someone to renumber — breaking every citation already written against the old numbers, in a register whose whole value is that citations resolve. Cite a spike in its full form (`SPK-S9-1`), never as a bare `SPK-1`.

---

## 9. Record template (copy this; every field is required)

```markdown
#### `SPK-S<n>-<k>` — <one line: the question, as a question>

- **Id:** `SPK-S<n>-<k>`
- **Sub-task:** SUB-<n> (NEU-…)
- **Question:** <the single question this spike settles, stated so it has a wrong answer>
- **Why reading could not settle it:** <the files, upstream packages and decision records that
  were read by name, and what specifically each failed to answer — see §3>
- **Exit condition:** <the OBSERVABLE EVENT that ends the spike, stated before it ran.
  Never a date. Never a party's satisfaction. See §5>
- **Method:** <what was built and run, in enough detail that someone else could repeat it>
- **Quarantine path:** `_local/scratch/<path>` — <confirmation that nothing landed under `src/`,
  `tests/` or `drizzle/`, and nothing was merged as product code>
- **Result:** <what was observed — stated IN FULL here, because the scratch tree is gitignored
  and no later reader can open it>
- **Confidence:** <high | medium | low> — <and what would raise or lower it>
- **Expiry:** <YYYY-MM-DD> — MANDATORY. Never blank, never "N/A".
- **Expiry rationale:** <what would make this answer wrong, and why that date>
- **On expiry:** re-run, or re-label the conclusion. The record does not close on this date;
  see §6.
- **Cited by:** <the decisions resting on this record, added as they land>
```

---

## 10. Records

**None. This register holds no spike results.**

SUB-1 set the rules above and ran no spike under them. The first `### SUB-<n>` heading appears when the first sub-task writes into it.

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment, containing one
`#### SPK-S<n>-<k>` block per spike, copied from the §9 template with every field filled.
Do not edit any section above your own. On conflict, keep both sides.
-->

### SUB-2

*One record — the first written into this register. SUB-1 published the rules above and ran nothing under them; this is the first exercise of them.*

#### `SPK-S2-1` — Does an authoring-time execution of a creator-authored approach need an isolation and resource boundary, or is it an unremarkable in-process function call?

- **Id:** `SPK-S2-1`
- **Sub-task:** SUB-2 (NEU-972)
- **Question:** When the authoring-time gate battery executes a creator's approach — `EQ-S4-6`, boundary confrontation — **can a bound be enforced without an isolation boundary?** Concretely: if the executed unit does not terminate, can a guard armed inside the same process fire, report a verdict, and let the pipeline continue? A **yes** makes the execution an unremarkable function call inside whatever process the authoring pipeline occupies, with no component to place. A **no** makes it a component with a boundary, a failure mode and a resource budget, which `SUB-4 (NEU-974)` must place and `SUB-13 (NEU-987)` must give an authority. The question has a wrong answer either way.
- **Why reading could not settle it:** Four sources were read at the 2026-08-21 cutoff and each failed on the same point.
  - `../C009-course-content-quality/09_enforceable-quality-system.md:70` (NEU-890, compiled 2026-08-10) names the `automated` class's cost as *"An execution environment, and a re-run budget"* — and **stops**. It establishes that an execution is required; it says nothing about whether that execution needs a boundary or what enforces the budget.
  - `../C009-course-content-quality/09_enforceable-quality-system.md:216`, `:325` establish that `EQ-S4-6` is `automated`, **`blocks`**, and authoring-time, and that all four standards are authoring-time. They fix **when** the execution runs, not **how it is contained**.
  - `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92` states in as many words that NEU-890 *"selects no runtime, no compiler, no sandbox and no execution environment"* — an explicit refusal to answer, not an answer.
  - `../C009-course-content-quality/06_assessment-evidence-out-of-band.md:409` states NEU-890 *"implements no grader, judge, or submission surface"*, so there is no upstream implementation to inspect either.
  - **The repository was read too, and had nothing to offer:** a scan of `src/` for `child_process`, `worker_threads`, `vm`, `vm2`, `isolated-vm`, `execSync` and `spawnSync` returns **zero** hits. There is no existing execution machinery whose shape could have answered the question by precedent.
  - `OI-S1-1` records exactly this gap and names SUB-2 as its owner. **What every source failed to answer is the same thing: whether the guard the budget implies can be enforced from inside the executing process.** That is an empirical property of a runtime, not a claim in a document.
- **Exit condition:** *(stated before the harness was written)* **When the harness has been run once in each of the three arrangements and the three outcomes — host survived, guard fired, control reclaimed — are recorded side by side in this register.** Three runs, three recorded triples. Not a date, not anyone's judgement about whether the answer feels settled.
- **Method:** A throwaway Node harness, five `.mjs` files, run under **Node v22.23.1** on the development host. A stand-in authored unit exposes two approaches: a well-behaved one that returns, and a non-terminating one whose loop increments only under a condition that is never true — an **ordinary authoring mistake**, chosen deliberately over an adversarial construct because no adversary supplies code to this component (`DR-C10-S2-1`). Three arrangements, each with a **1000 ms guard armed before the unit started**:
  - **A** — the well-behaved unit, called in-process.
  - **B** — the non-terminating unit, called in-process, guard armed as a same-thread `setTimeout`. Run under an external 6000 ms `SIGKILL` so the experiment itself could not hang.
  - **C** — the **same** non-terminating unit inside a `worker_threads` `Worker`; at 1000 ms the host calls `worker.terminate()` and awaits it.
  Repeatable by anyone with Node: two approaches, three call sites, one timer per arrangement.
- **Quarantine path:** `_local/scratch/NEU-972/` — five files, gitignored at `.gitignore:100`. Confirmed after the runs: `git status --untracked-files=all` returned **empty**, so **nothing landed under `src/`, `tests/` or `drizzle/`**, nothing was staged, and **nothing is merged as product code**. The harness is not a prototype and does not graduate; if code like it is ever needed, the charter that owns the gate runner writes it from `DR-C10-S2-2`, not from this tree.
- **Result:** *Stated in full, because `_local/scratch/` is gitignored and no later reader can open it.*

  | Arrangement | Observed output | Host survived | Guard fired | Control reclaimed |
  | --- | --- | --- | --- | --- |
  | **A** — well-behaved, in-process | `A: result=499500` then `A: HOST SURVIVED=yes GUARD FIRED=no CONTROL RECLAIMED=yes`. Exit 0. | **yes** | not needed | **yes** |
  | **B** — non-terminating, in-process, same-thread guard | `B: guard armed at 1000ms; entering authored unit` — **and nothing further.** No `GUARD FIRED` line was ever printed. The process produced no more output and was killed by the external `SIGKILL` at 6000 ms; the shell reported **exit 137**. | **no** | **no** | **no** |
  | **C** — non-terminating, inside a terminable worker | `C: guard armed at 1000ms; worker started`, then `C: GUARD FIRED; worker.terminate() resolved code=1 at 1007ms`, then `C: HOST SURVIVED=yes GUARD FIRED=yes CONTROL RECLAIMED=yes`, then `C: node=v22.23.1`. Exit 0. | **yes** | **yes** | **yes** — at **1007 ms**, 7 ms after the deadline |

  **The answer is no: a bound cannot be enforced without an isolation boundary.** Arrangement B is the finding. The runaway holds the very thread the guard would run on, so the guard is not merely late — **it never runs at all**, and the gate runner cannot even *observe* the failure it exists to report. The process must be killed from outside, and every gate queued behind it dies with it. Arrangement C shows the boundary is sufficient as well as necessary: a host-side `terminate()` reclaimed a tight synchronous loop within 7 ms of the deadline.

  **What the result does not show.** It does not show that the failure is frequent (`CAP-S2-2`), it does not establish a value for the bound (`CAP-S2-1`), and it does not select `worker_threads` as the primitive — that was the cheapest way to get an isolate, not a technology selection (`SUB-10 (NEU-984)` owns the substrate).
- **Confidence:** **high** — for the qualitative conclusion, and only that. The mechanism is not subtle: a synchronous loop starves the event loop the timer lives on, which is a property of the runtime's execution model rather than of this harness. Three runs agreed with no ambiguity, and arrangement C's `terminate()` resolved on the first attempt. **What would lower it:** a substrate on which a host-side terminate of a running isolate is unavailable or does not preempt a tight loop — which is precisely `DR-C10-S2-2`'s third revision trigger. **What would raise it:** re-running the three arrangements on the substrate `SUB-10 (NEU-984)` actually selects.
- **Expiry:** **2027-04-30** — mandatory field, and a real date.
- **Expiry rationale:** What would make this answer wrong is a change in the runtime, not the passage of time. The result was observed on **Node v22.23.1**, and the published Node release schedule ends the 22.x line at the end of April 2027, after which this repository will be on a later major. `Worker.terminate()`'s ability to preempt a tight synchronous loop, and the same-thread timer's inability to fire, are both behaviours of a specific runtime's execution model — stable in practice, but not guaranteed across a major-version boundary. The date is therefore set at the point where the observed runtime stops being the one the project runs on.
- **On expiry:** re-run, or re-label the conclusion. **The record does not close on this date**, and the item it resolved (`OI-S1-1`) does not reopen; what goes stale is every document citing it — see §6.
- **Cited by:**
  - `../decision-records/DR-C10-S2-2_authoring-time-execution-boundary.md` — the decision rests on this record and states the inherited expiry in place.
  - `../03_execution-environment-and-citation-drift-component.md` §3.3, §3.4 — the chapter's authoring-time conclusion.
  - `../90_open-items-and-provisional-register.md` `### SUB-2` — the disposition of `OI-S1-1`.
  - `../traceability/S2_execution-environment-and-drift-coverage.md` — `OUT-9` and `OUT-10` coverage rows.

### SUB-6

*One record. `SUB-6 (NEU-976)` owns `OUT-10` — spike execution — and applied §2's three-way rule to every claim its scored comparison rests on. Two claims were uncertain and material. One was settled by **reading** (`../07_state-ownership-model-selection.md` §3.1, eight cited facts) and therefore needed no spike, per §3's justification test. One was **measured**, and is recorded below. One could not be measured at all and is filed as `CAP-S6-1` in `../91_caps-and-incomplete-scope.md` rather than asserted.*

#### `SPK-S6-1` — Does routing a learner-path state read through the MCP tool boundary consume a material share of the sub-second budget `A-25` predicates?

- **Id:** `SPK-S6-1`
- **Sub-task:** SUB-6 (NEU-976)
- **Question:** Measured against a direct in-process call of the same handler, what per-call overhead does the MCP tool boundary — JSON-RPC framing, transport dispatch, tool input schema validation and result-envelope construction — add to a single state read; and is that overhead a material share of the **1000 ms** sub-second read budget `A-25` predicates for per-learner, per-node tutoring interaction state? *(It has a wrong answer: if the boundary costs tens or hundreds of milliseconds, the criterion `C5` discriminates strongly against the all-MCP model and the comparison's outcome may change.)*
- **Why reading could not settle it:** `../93_stand-in-assumption-register.md`'s `A-25` states a **sub-second** requirement and names its invalidating outcome, but records no measured figure and no budget breakdown — `../93_…` is a register of assumptions, not of measurements. `../05_system-context-and-responsibility-boundaries.md` §7 characterises the serve path as thin but gives no timing. `src/transport/http.ts` and `src/transport/main.ts` establish which transports exist, not what they cost. The upstream package `@modelcontextprotocol/sdk` at version **1.27.1** publishes no latency characteristic for a tool call in its types or its shipped documentation. **What every one of those failed to answer is the same thing: the per-call cost of the boundary, in milliseconds, on a real runtime.** That is an empirical property of an implementation, not a claim recoverable from any document.
- **Exit condition:** *(stated before the harness was written)* **When both arms — a direct in-process call of the handler, and the same handler invoked through a registered MCP tool by a real MCP client — have been measured in the same run at both payload sizes, and the boundary's per-call p50 and p95 overhead is recorded as a number in this register.** Two arms, two payload sizes, one recorded overhead figure per size. Not a date, and not anyone's judgement about whether the number feels acceptable.
- **Method:** A throwaway Node harness, one `.mjs` file, run under **Node v22.23.1** against **`@modelcontextprotocol/sdk` 1.27.1**. A real `Server` registers one `read_state` tool with a tool input schema requiring two string properties; a real `Client` connects to it over the SDK's own `InMemoryTransport.createLinkedPair()`, so the measurement includes JSON-RPC framing, transport dispatch, schema validation and envelope construction, and **excludes any network hop by construction**. Both arms return the identical payload from the identical handler. The baseline arm performs the same `JSON.parse(JSON.stringify(...))` round trip the tool result envelope performs, so the reported delta isolates protocol, validation and dispatch rather than re-counting serialization the caller would pay in either model. 200 warm-up iterations then **2000 measured iterations per arm**, timed with `process.hrtime.bigint()`. Two payload sizes: a **714-byte** stand-in for a `SC-S3-42` tutoring/hint read (node id, skill type, hint level, ten attempt records), and a **29,715-byte** stand-in for a `SC-S3-29` `LearnerContext` aggregate (200 due-chunk records with their scheduling fields). Repeatable by anyone with Node and the SDK: one server, one client, one linked transport pair, two loops.
- **Quarantine path:** `_local/scratch/SPK-S6-1/mcp-boundary-overhead.mjs` — a single file under the gitignored scratch tree, deleted before staging. **Nothing landed under `src/`, `tests/` or `drizzle/`; nothing was merged as product code; no dependency was added.** The harness imports only `@modelcontextprotocol/sdk`, which is already a production dependency of this repository.
- **Result:** *(stated in full here, because the scratch tree is gitignored and no later reader can open it)*
  - **714-byte payload (`SC-S3-42` tutoring/hint read), n = 2000 per arm.** Direct in-process call: mean 0.0078 ms, p50 0.0051 ms, p95 0.0100 ms, p99 0.0354 ms, max 1.0833 ms. Through the MCP tool boundary: mean 0.1177 ms, p50 0.0820 ms, p95 0.1992 ms, p99 0.6889 ms, max 5.8712 ms. **Boundary overhead: mean 0.1099 ms, p50 0.0769 ms, p95 0.1892 ms, p99 0.6535 ms** — **0.008% of a 1000 ms budget at p50 and 0.019% at p95**.
  - **29,715-byte payload (`SC-S3-29` `LearnerContext` aggregate), n = 2000 per arm.** Direct in-process call: mean 0.1673 ms, p50 0.1456 ms, p95 0.2286 ms, p99 0.6108 ms, max 2.3429 ms. Through the MCP tool boundary: mean 0.1878 ms, p50 0.1238 ms, p95 0.2917 ms, p99 1.9054 ms, max 9.0614 ms. **Boundary overhead: mean 0.0205 ms, p50 −0.0218 ms, p95 0.0631 ms** — at p50 the boundary is **indistinguishable from the baseline and measures slightly negative**, which is the honest reading of two noisy distributions whose difference is smaller than their jitter, not a claim that the boundary is free.
  - **The answer to the question, stated so it could have been otherwise: no.** At both payload sizes the MCP tool boundary consumes **at most 0.02%** of the budget `A-25` predicates. The boundary is not the cost, and the intuition that an all-MCP model is disqualified by read latency does not survive measurement. Larger payloads *narrow* the relative overhead rather than widening it, because serialization dominates and both arms pay it.
- **Confidence:** **high** for what was measured — two arms, one run, 2000 iterations each, a three-orders-of-magnitude margin against the budget, on a real client/server pair rather than a mock. It is high precisely because the margin is enormous: a measurement error would have to be off by a factor of a thousand to change the conclusion. **Two things would lower it, and neither was measured:** (1) the harness uses `InMemoryTransport`, so **no network hop is included** — the figure is a *floor* on a real deployment's cost, not a prediction of it; (2) the figure is **per call**, so a web view assembling *k* reads pays *k* crossings, and an N+1 access pattern across the boundary is not bounded by this result. Both residuals are properties of deployment topology and access-pattern design, owned by `SUB-10 (NEU-984)` and `SUB-7 (NEU-980)` respectively, and neither is a property of the ownership model — which is why neither moves the `C5` score this record decided.
- **Expiry:** **2027-08-21** — MANDATORY.
- **Expiry rationale:** The figure is bound to two moving artifacts: `@modelcontextprotocol/sdk` **1.27.1** and Node **v22.23.1**. A major SDK version could change the framing or validation path, and a Node major transition could change the JSON and timer characteristics the measurement rests on. One year is the horizon over which the probability that **both** have moved approaches certainty. The date is not a judgement that the answer decays gradually — it does not; it is a point at which the runtime it describes should be assumed to no longer be the runtime in use. Per §6, the record does **not** close on this date.
- **On expiry:** **Re-run** the harness — the Method above is sufficient to rebuild it — or **re-label** the conclusion from *measured* to *measured on a superseded runtime*. Re-running is cheap: one file, two loops, under a minute. A conclusion that keeps citing this record past its expiry without either action is a defect `NEU-985 (SUB-11)` should catch.
- **Cited by:**
  - `../07_state-ownership-model-selection.md` §3.3 — criterion `C5`, where it is the reason all three models score 4 and `C5` discriminates between none of them.
  - `../07_state-ownership-model-selection.md` §8 — `F-S6-4`, the finding that the latency argument for a hybrid does not survive measurement.
  - `../decision-records/DR-C10-S6-1_state-ownership-model.md` — Rationale (the spike removed a criterion's discriminating power) and Revision trigger 5 (a re-measurement above 50 ms p95 would move `C5` from non-discriminating to decisive).
  - `../traceability/S6_state-ownership-model-selection.md` — the two `OUT-10` rows.
