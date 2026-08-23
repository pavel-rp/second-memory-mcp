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
  - `decision-records/DR-C10-S2-2_authoring-time-execution-boundary.md` — the decision rests on this record and states the inherited expiry in place.
  - `03_execution-environment-and-citation-drift-component.md` §3.3, §3.4 — the chapter's authoring-time conclusion.
  - `90_open-items-and-provisional-register.md` `### SUB-2` — the disposition of `OI-S1-1`.
  - `traceability/S2_execution-environment-and-drift-coverage.md` — `OUT-9` and `OUT-10` coverage rows.

### SUB-6

*One record. `SUB-6 (NEU-976)` owns `OUT-10` — spike execution — and applied §2's three-way rule to every claim its scored comparison rests on. Two claims were uncertain and material. One was settled by **reading** (`07_state-ownership-model-selection.md` §3.1, eight cited facts) and therefore needed no spike, per §3's justification test. One was **measured**, and is recorded below. One could not be measured at all and is filed as `CAP-S6-1` in `91_caps-and-incomplete-scope.md` rather than asserted.*

#### `SPK-S6-1` — Does routing a learner-path state read through the MCP tool boundary consume a material share of the sub-second budget `A-25` predicates?

- **Id:** `SPK-S6-1`
- **Sub-task:** SUB-6 (NEU-976)
- **Question:** Measured against a direct in-process call of the same handler, what per-call overhead does the MCP tool boundary — JSON-RPC framing, transport dispatch, tool input schema validation and result-envelope construction — add to a single state read; and is that overhead a material share of the **1000 ms** sub-second read budget `A-25` predicates for per-learner, per-node tutoring interaction state? *(It has a wrong answer: if the boundary costs tens or hundreds of milliseconds, the criterion `C5` discriminates strongly against the all-MCP model and the comparison's outcome may change.)*
- **Why reading could not settle it:** `93_stand-in-assumption-register.md`'s `A-25` states a **sub-second** requirement and names its invalidating outcome, but records no measured figure and no budget breakdown — `../93_…` is a register of assumptions, not of measurements. `05_system-context-and-responsibility-boundaries.md` §7 characterises the serve path as thin but gives no timing. `src/transport/http.ts` and `src/transport/main.ts` establish which transports exist, not what they cost. The upstream package `@modelcontextprotocol/sdk` at version **1.27.1** publishes no latency characteristic for a tool call in its types or its shipped documentation. **What every one of those failed to answer is the same thing: the per-call cost of the boundary, in milliseconds, on a real runtime.** That is an empirical property of an implementation, not a claim recoverable from any document.
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
  - `07_state-ownership-model-selection.md` §3.3 — criterion `C5`, where it is the reason all three models score 4 and `C5` discriminates between none of them.
  - `07_state-ownership-model-selection.md` §8 — `F-S6-4`, the finding that the latency argument for a hybrid does not survive measurement.
  - `decision-records/DR-C10-S6-1_state-ownership-model.md` — Rationale (the spike removed a criterion's discriminating power) and Revision trigger 5 (a re-measurement above 50 ms p95 would move `C5` from non-discriminating to decisive).
  - `traceability/S6_state-ownership-model-selection.md` — the two `OUT-10` rows.

### SUB-14

**No new spike record.** Stated explicitly rather than by omission, so the completeness gate can tell an empty section from a missing one.

`SUB-14 (NEU-978)` shares `OUT-10` and applied §2's three-way rule — **read it, spike it, or cap it with a named owner** — to every uncertain claim the four scenario walks surfaced. Six were settled by **reading**; three are covered by **existing caps with named owners** and are cited in `91_caps-and-incomplete-scope.md`'s `### SUB-14` section rather than re-filed. **Nothing was asserted in place of a spike or a cap**, and no `SPK-S14-*` id is taken.

**The one claim that looked like a spike, and the disclosure that goes with it.**

- **The claim.** `SC-S3-35`'s Recovery cell asserts that *"a terminated or crashed run leaves the unit **without** a verdict"*, never a partial one — which underwrites the whole mid-operation-interruption walk for the gate-battery rows. It rests on the gate runner's **terminable isolate under a host-enforced wall-clock bound** (`../05_…md` `FL-S4-15`, `BND-S4-9`). It is **material**, and it looked **unreadable**: `CMP-S4-15` does not exist in this codebase, and Node's contract for `worker.terminate()` says execution stops *"as soon as possible"*, which is not a guarantee about a tight synchronous loop with no yield point.
- **It was already measured, in this register.** **`SPK-S2-1` arrangement C** is exactly this question — the same non-terminating unit inside a `worker_threads` `Worker`, `worker.terminate()` called at the 1000 ms deadline — and its recorded result is `C: GUARD FIRED; worker.terminate() resolved code=1 at 1007ms` with `HOST SURVIVED=yes`, on **Node v22.23.1**. Applying §3's justification test honestly: **this claim could have been read instead**, one section above.
- **Disclosed rather than smoothed over: SUB-14 ran the probe before re-reading SUB-2's record in full**, and so measured a question already answered. The run is therefore reported as what it is — an **independent replication of a merged result** — and **no record is filed for it**. Filing one would put a duplicate in this register and misrepresent `OUT-10`'s coverage; the owner of the underlying question is **SUB-2**, whose record stands unchanged.
- **The replication, for the record, since `_local/scratch/` is gitignored.** Two files under `_local/scratch/NEU-978-spike/` — `worker-spin.mjs` (an unbounded synchronous `for (;;)` loop, no `await`, no I/O, no yield point) and `probe.mjs` (spawns the worker, calls `terminate()` at t = 1000 ms, records the resolution time and the worker's exit code, confirms the host event loop is alive 200 ms later, and arms a 6000 ms watchdog that exits non-zero if `terminate()` never resolves). **Five runs, 5/5 terminated**: `terminate()` resolved **4–9 ms** after the call (t ≈ 1006–1009 ms), the worker reported `EXIT code=1`, the host was alive at t ≈ 1207 ms in every run, and the watchdog never fired. Runtime **Node v22.23.1** — the same runtime SUB-2 measured, which is why this is a replication and not an extension. SUB-2 recorded 7 ms on one run; SUB-14 recorded 4–9 ms across five. **The two agree**, and the only thing the repeats add is that the 7 ms was not a fortunate scheduling artifact.
- **Quarantine, unchanged by the reclassification.** `_local/scratch/NEU-978-spike/`, gitignored and swept at task-finish. **Nothing landed under `src/`, `tests/` or `drizzle/`; nothing was staged; nothing is merged as product code.** The probe is not a prototype and does not graduate.
- **Expiry.** None is set here, because no record is filed. Every citation of the conclusion in `09_authority-matrix-validation.md` §10 and §14.2 inherits **`SPK-S2-1`'s expiry of 2027-04-30** unchanged, and §6's staleness rule applies to those citations exactly as it does to SUB-2's own.

**One claim was uncertain, material, and could *not* be measured — and is capped, not asserted.** Two-writer divergence against a live Postgres remains unobserved: five connection probes refused or timed out at SUB-6's cutoff, and no `DATABASE_URL` is reachable in this environment either. **`CAP-S6-1`** already carries it, with **`SUB-10 (NEU-984)`** as named owner alongside **NEU-896**, and its lifting condition — a two-process harness against a reachable Postgres exercising `getChunk → compute → persistReviewUpdate` concurrently — is unchanged. **Re-running a probe already recorded as unrunnable would produce no evidence, so it was not re-run and no duplicate cap was filed.** `09_authority-matrix-validation.md` §9.1 states what the matrix *requires* and what the code *fails to prevent*, and asserts nothing about what was observed.

---

### SUB-8

**No new spike record.** Stated explicitly rather than by omission, so the completeness gate can tell an empty section from a missing one — following `SUB-14 (NEU-978)`'s precedent above, and for the same reason.

`NEU-981` covers `OUT-6` and applied §2's three-way rule — **read it, spike it, or cap it with a named owner** — to every uncertain claim in `12_application-versus-core-rule-and-compatibility-contract.md`. **No `SPK-S8-*` id is taken**, and nothing was asserted in place of a spike or a cap.

**Where each uncertain claim went, so the absence is auditable rather than merely declared:**

- **Settled by *counting*, not by reading — the tool surface.** 46 registrations / 43 gated / 3 exempt / 43-of-43 declaring `context_token`, re-derived at cutoff `ad5eebb` by resolving every registration's `inputSchema` to its defining shape. `SUB-5`'s frozen contract instructed `SUB-8` to *re-run the command rather than cite any figure*, and it did. **A count is not a spike**: §3's justification test asks whether reading could settle it, and enumerating a tree is reading. The one thing the re-run added beyond `F-S5-3`'s figures — that `src/server/` last changed at `6efd9fe`, **2026-08-04**, seventeen days before the charter's recorded re-verification — is likewise a read of the log, and is filed as `F-S8-1`.
- **Settled by reading — the authority driver's effect.** Whether any tool contract changes under the republished matrix was answered by reading all 45 rows of `../10_…md` §8 for their Authority column: `CMP-S4-3` appears **zero** times. Corroborated from two directions already in the package (`../10_…md` §11; `../11_…md` §9.3). Filed as `F-S8-3` because the result is a vacuous discharge and must not read as an unfinished check.
- **Settled by reading — the identity plumbing.** That per-request principal resolution already exists, HTTP-only and decoupled from both the gate and the schema, was read from `src/transport/jwt-middleware.ts` and `rate-limit-middleware.ts`. **No finding filed**: `../06_…md` §4.1 and `F-S5-4` already publish it, and a duplicate would have been less precise than the original.
- **Capped, with a named owner — everything that would have needed a running system.** The five regression-detection methods `12_…md` §8.2 specifies are **not run**, and cannot be: every obligation they police is on unwritten code, and no test host exists. That is **`CAP-S8-1`** in `../91_…md`, owner **`SUB-10 (NEU-984)`** with **`NEU-896`** co-named.

**The one claim that looked like a spike, and why it is not.** `RD-S8-4` (golden manifest snapshot) is the single detection method **runnable today** — it needs no unwritten code, only the current tree. Applying §3's justification test honestly: running it here would serialize the present manifest and confirm it equals itself. Its entire value is in the **second** run, after a change this package does not make, so a run now would produce a record with no exit condition and no falsifiable result. **A measurement whose outcome is fixed in advance is not a spike**, and filing one would misrepresent `OUT-6`'s coverage. It is carried as part of `CAP-S8-1`'s unsupported list instead, where the cost is visible.

**Nothing was quarantined and nothing was swept, because nothing was run.** No file was written under `src/`, `tests/` or `drizzle/`; the only scratch artifacts were two throwaway enumeration scripts under `_local/scratch/`, which is gitignored, and they measured the repository rather than the system's behaviour.

---

### SUB-15

*Appended by `NEU-982` (SUB-15) on 2026-08-22. Verification cutoff `229e8f4`. Nothing above this heading was edited.*

#### `SPK-S15-1` — Is `src/domain/` actually portable to a non-Node runtime, or does its transitive import closure bind it to Node?

- **Id:** `SPK-S15-1`
- **Sub-task:** SUB-15 (NEU-982)
- **Question:** Does the code a web tier would plausibly reuse — the pure domain layer — carry a transitive dependency on Node built-in modules, or is it runtime-portable? Stated so it has a wrong answer: **if any of the 65 `src/domain/` entry points transitively reaches a `node:*` builtin, the domain layer is Node-bound and the "share the runtime to reuse the core" argument is sound.** If none does, that argument proves nothing and the runtime must be decided on other grounds.
- **Why reading could not settle it:** Four things were read first, by name, and each failed for a stated reason. **(i) `src/domain/`'s own import statements** — a direct grep returns 0 imports of `pg`, `drizzle-orm`, `node:*`, `fs` or `path` across 65 files, but a *direct* import survey says nothing about what `zod`, `compromise` or `markdown-it` drag in, and the whole question is transitive. **(ii) `CLAUDE.md`'s hexagonal-architecture description** — it states `src/domain/` is "pure computation — zero I/O" as a **design intent**, and the question is whether the tree honours it; citing the guide to answer it would be citing the claim as its own evidence. **(iii) `tsconfig.json`** — it declares `"types": ["node"]` *project-wide*, which is a compile-time ambient type inclusion covering `src` and `tests` together. It neither establishes nor refutes a runtime dependency for any particular module, and reading it either way would have been an over-read. **(iv) `../12_…md` §6.1 `CC-S8-5`** — it settles the *contract* half (the web tier reaches state only through tool calls) but is silent on portability, which is a property of the code rather than of the contract. No merged artifact in the package walks a transitive import closure, so the answer was not available to read.
- **Exit condition:** Stated before the run: **the transitive import closure of all 65 `src/domain/` entry points is enumerated and its Node-builtin count is reported**, together with a control arm whose closure is known to contain builtins. The spike ends when both numbers exist, whichever way they come out. Not a date; not anyone's satisfaction. A closure that could not be enumerated would have ended the spike as **failed**, not as a zero.
- **Method:** Two parts, run against the built tree at `229e8f4` on **Node v22.23.1**, both under `_local/scratch/NEU-982/`. **Part 1 (`probe.mjs`) — dynamic.** Monkey-patched `net.Socket.prototype.connect` and `dns.lookup` to record any invocation, then dynamically imported each arm and counted IO events. **Part 2 (`closure.mjs`) — static.** Walked the transitive import closure over the compiled `dist/` tree: starting from each entry point, parsed the emitted ESM import specifiers, resolved relative specifiers to files and followed them, and classified every non-relative specifier as either a Node builtin (`node:*` or a bare builtin name) or an external package. Reported, per arm: files reached, distinct external packages, distinct builtins. **Five arms**, chosen so the control would discriminate: **A** `domain/algorithms/grade-mapper.js` (single pure module), **B** `domain/types/teaching.js` (single schema module, known `zod` consumer), **C** `infrastructure/db/client.js` (**control** — must show builtins), **D** all 65 `domain/` entry points (the actual question), **E** `composition-root.js` (upper bound — the whole wired system).
- **Quarantine path:** `_local/scratch/NEU-982/` — holding `probe.mjs` and `closure.mjs`. Confirmed: **nothing was written under `src/`, `tests/` or `drizzle/`**, nothing was merged as product code, no dependency was added to `package.json`, `pnpm-workspace.yaml` is unmodified, and both scripts are read-only with respect to the repository — they import and parse, and write no file. `_local/` is gitignored, so neither script survives this task; that is why the Result field below states the numbers in full rather than pointing at them.
- **Result:** Stated in full, because no later reader can open the scratch tree. **Part 2 (decisive):** **A** `domain/algorithms/grade-mapper.js` → **1 file**, external: **none**, builtins: **none**. **B** `domain/types/teaching.js` → **1 file**, external: **`zod`**, builtins: **none**. **D** all 65 `domain/` entry points → **65 entries**, external: **`zod`, `compromise`, `markdown-it`**, builtins: **none**. **C** (control) `infrastructure/db/client.js` → **3 files**, external: **`drizzle-orm`, `pg`, `pino`**, builtins: **6**. **E** `composition-root.js` → **103 files**, external: **6 packages**, builtins: **7**. The control discriminated: arms C and E return builtins, arms A/B/D return zero. **Answer: the domain layer is runtime-portable — 65 of 65 entry points reach zero Node builtins.** **Part 1 (inconclusive, disclosed rather than dropped):** all three arms imported with **0 IO events**, but the control arm C also showed **0**, because `infrastructure/db/client.js` establishes its connection lazily and merely importing it opens no socket. **The detector did not discriminate, so part 1 supports no conclusion in either direction** and is recorded here only so the record is complete. Part 2 was added *because* part 1 failed this way. **One harness artifact is disclosed:** part 2's specifier-classification regex captured the string `" must be a valid calendar date"` as an external package name in one arm. It is a defect of the extractor — a quoted validation message parsed as a specifier — and not a dependency; no package of that name exists and it is excluded from the counts above.
- **Confidence:** **high** for part 2's result; **none** for part 1, which is reported as inconclusive. What would raise it: an independent walk over `dist/` by a different tool (a bundler's dependency graph, say) reproducing the 65/0 result. What would lower it: discovery of a dynamic `import()` behind a computed specifier, a runtime-only `require`, or a native binding pulled in by `zod`, `compromise` or `markdown-it`'s own internals — **the walk is static and covers this repository's closure, not its dependencies' internals**, and the disclosed regex artifact shows the extractor is not flawless. A conditional-export or `package.json` `"browser"` field re-mapping was not modelled.
- **Expiry:** **2027-04-30** — MANDATORY.
- **Expiry rationale:** The result is a property of the closure **as it stands**, and two things would make it wrong: a new import in `src/domain/` reaching a builtin (a code change, unbounded in time), or a dependency upgrade introducing one transitively. The date is pinned to **Node 22.x reaching end-of-line in April 2027**, because a runtime migration is the single most likely event to force a dependency-version sweep across the tree, and a sweep is exactly what silently changes a transitive closure. The chosen date is the last point at which this measurement can be assumed to describe the runtime it was taken on.
- **On expiry:** re-run `closure.mjs`'s method against the then-current tree, or re-label the conclusion as historical. The record does not close on this date; see §6.
- **Cited by:** `DR-C10-S15-2` (web-tier runtime and language) — the measurement that removed code reuse from the argument; `02_findings-register.md` `F-S15-1`; `13_…md` §5 (evidence base) and §6 (the runtime decision). Not cited by `DR-C10-S15-3` or `DR-C10-S15-4`, which rest on other evidence.

**One spike candidate was considered and withdrawn under §3, and it is disclosed rather than omitted.** The candidate: *can a rendering model satisfy the trust property without a server round trip on a gate-bearing read?* It looked like a spike — it names a falsifiable outcome and a rendering model is a real thing to prototype. Applying §3's justification test honestly, **it could have been read instead, and was**: `../05_…md` §6.2 point 3 and rules `R-1` and `R-4` answer it **by construction**, since a gate the client evaluates is not the gate, and no measurement changes that. Building a prototype would have produced a working artifact that demonstrates the already-published rule rather than testing it, and §3 rejects a spike whose outcome is fixed in advance. This follows **SUB-14's precedent** for disclosing a withdrawn candidate in place of silently dropping it, so the coverage of `OUT-10` is legible: **one spike run, one candidate withdrawn with its reason, none omitted.**

---

### SUB-9

*Appended by `NEU-983` (SUB-9) on 2026-08-22. Verification cutoff `0962279`. Nothing above this heading was edited.*

#### `SPK-S9-1` — Can the core be consumed as a package without breaking local development, and does it matter whether the consumer resolves built output or source?

- **Id:** `SPK-S9-1`
- **Sub-task:** SUB-9 (NEU-983)
- **Question:** Under this repository's own compiler configuration, what does a consumer actually get when it resolves the core as a package — and does a core source edit remain visible to that consumer without a build step? Stated so it has a wrong answer: **if a consumer resolves the core successfully under the manifest as it stands today, then "consume the core as a published package" costs nothing and the separate-repository topology loses nothing on build, testing or local development.** If resolution depends on an entry-point declaration the core does not have, and if live visibility depends on whether that entry point points at built output or at source, then the two live topologies differ **mechanically** on exactly those criteria and the difference is measurable rather than a matter of taste.
- **Why reading could not settle it:** Four things were read first, by name, and each failed for a stated reason. **(i) `package.json` at `0962279`** — it shows `main`, `exports`, `types` and `bin` are all absent, which establishes the *inputs* to resolution but not its *outcome*; Node and TypeScript both carry documented fallbacks (an implied `index.js`, directory resolution, `@types` lookup) and whether any of them rescues this manifest is a behaviour, not a field. **(ii) `tsconfig.json`** — it sets `module`/`moduleResolution` to `Node16` with `verbatimModuleSyntax: true`, which tells you *which* resolution algorithm applies and nothing about what that algorithm returns for this manifest. **(iii) `13_…md` §6.5** — it publishes that a pnpm workspace and a shared base `tsconfig` are *available* under the decided shared runtime, which is the necessary precondition for the question but is silent on whether a workspace link preserves live source visibility; "available" is not "equivalent to a published dependency". **(iv) The npm and TypeScript documentation for `exports`/`main`** — it describes the fields' semantics in general and does not answer what happens for a manifest that declares **none** of them under `Node16` specifically, which is the actual case here. No merged artifact in the package resolves a consumer against this core, and the repository itself has never done so (`F-S9-3`), so the answer was not available to read.
- **Exit condition:** Stated before the run: **a consumer typecheck is executed against the core under each of five manifest-and-build shapes, and each run's exit status and diagnostic code is recorded**, whichever way they come out. The spike ends when all five results exist. Not a date; not anyone's satisfaction. A harness in which even the known-good shape failed to resolve would have ended the spike as **failed**, not as a finding about the core — which is why variants B and C exist as positive controls.
- **Method:** Built a two-package workspace under `_local/scratch/SPK-S9-1/` — a stand-in core at `packages/core` and a consumer at `apps/web` — and linked the core into the consumer's `node_modules` by symlink, which is the arrangement a pnpm workspace link produces. The stand-in core reproduces this repository's **resolution-relevant** configuration exactly: package name `second-memory-learning`, `"type": "module"`, `"private": true`, `"license": "MIT"`, and a tsconfig with `target ES2022`, `module`/`moduleResolution` **`Node16`**, `verbatimModuleSyntax: true`, `strict: true`, emitting declarations to `dist`. The consumer's tsconfig carries the same compiler settings with `noEmit`. The consumer imports both a **value** and a **type** from the core by bare package specifier. Ran `tsc` (the repository's own installed **TypeScript 5.9.3**) over the consumer under five variants: **A** core manifest exactly as `0962279`'s — `private: true`, no `main`/`exports`/`types` — core not built; **B** `main` + `types` added pointing at `dist`, core built; **C** `exports` map (`types` + `import` conditions) pointing at `dist`, core built, `main`/`types` removed; **D** as C, with a **new export appended to the core's source** and the core deliberately **not** rebuilt; **E** `exports` map pointing at the core's **`src/index.ts` source**, with `dist` deleted entirely. Variants D and E are the ones that answer the local-development half; A/B/C answer the resolution half.
- **Quarantine path:** `_local/scratch/SPK-S9-1/` — holding `packages/core/` and `apps/web/`. Confirmed: **nothing was written under `src/`, `tests/` or `drizzle/`**, nothing was merged as product code, no dependency was added to the repository's `package.json`, **`pnpm-workspace.yaml` is unmodified**, and the repository's own `tsc` binary was invoked read-only against the scratch tree. `_local/` is gitignored, so the harness does not survive this task; that is why the Result field below states every number in full rather than pointing at it.
- **Result:** Stated in full, because no later reader can open the scratch tree. **A** (manifest exactly as today, core unbuilt) → **fails**, exit **2**, `error TS2307: Cannot find module 'second-memory-learning' or its corresponding type declarations` — **twice**, once for the value import and once for the type import. **B** (`main` + `types` → `dist`, core built) → **passes**, exit **0**. **C** (`exports` map → `dist`, core built) → **passes**, exit **0**. **D** (as C; core source gained a new exported function, core **not** rebuilt) → **fails**, exit **2**, `error TS2305: Module '"second-memory-learning"' has no exported member 'newSymbol'` — the consumer sees the **stale** built contract, not the current source. Rebuilding the core and re-running the identical consumer check → **passes**, exit **0**. **E** (`exports` map → **source**, `dist` deleted) → **passes**, exit **0**, *including the symbol from variant D that was never built*. **Three answers.** (1) **The core is not consumable as a dependency today**: the absent entry-point declaration is fatal, not degraded. (2) **`"private": true` is not the cause** — variants B, C and E all resolved cleanly with the flag still set; it blocks publication, not resolution. (3) **Live local development is a property of what the entry point points at, not of the topology's name**: an entry point resolving to **source** keeps a core edit visible to the consumer with no build step (E), and one resolving to **built output** does not (D). A workspace link can do the former; a published dependency can only do the latter, because what it ships is the built output.
- **Confidence:** **high** for all three answers. The variants are mutually controlled — B and C are positive controls proving the harness resolves at all, so A's failure is attributable to the manifest rather than to the setup; D and E differ in exactly one field and bracket the local-development question from both sides. What would raise it: running the same five variants against the **real** 169-file core rather than the stand-in. What would lower it: discovery that the real core's file layout changes the outcome — it should not, since Node16 resolution is a function of the manifest and the referenced paths rather than of module count, but this was **not** executed against the real tree. **Runtime resolution (`node`) was not tested separately from type resolution (`tsc`)**; the two agree on `exports` under Node16 by design, but a runtime-only failure mode would not have been observed here. A published tarball was not produced, so variant E's inapplicability to a *published* dependency is reasoned from what `pack` ships rather than measured.
- **Expiry:** **2027-04-30** — MANDATORY.
- **Expiry rationale:** The result is a property of **TypeScript's `Node16` resolution semantics**, which track Node's own resolution algorithm by design. The single most likely event to change that algorithm's behaviour underneath this measurement is a runtime major-version migration, and the date is pinned to **Node 22.x reaching end-of-line in April 2027** — the same anchor `SPK-S15-1` uses, chosen for the same reason and deliberately kept consistent so the two records expire together rather than drifting apart. Note what does **not** expire this record: the core acquiring an entry point would make variant A's *scenario* obsolete, but that is the migration this spike recommends, not a refutation of its result.
- **On expiry:** re-run the five variants against the then-current compiler and manifest, or re-label the conclusion as historical. The record does not close on this date; see §6.
- **Cited by:** `DR-C10-S9-1` (repository topology) — at criterion `K4` (compatibility detection reach) and criterion `K8` (local development), which it decided; `14_…md` §5.3 (`K3`, variant A), §5.4 (`K4`, variants D and E), §5.8 (`K8`, variants D and E), §8 migration steps `M5` and `M7`; `02_findings-register.md` `F-S9-3` and `F-S9-4`. Per `../00_…md` §2.6 each of those citations inherits this record's **2027-04-30** expiry.

**Two spike candidates were considered and withdrawn under §3, and both are disclosed rather than omitted.** **(1)** *Does this repository declare a pnpm workspace today?* — applying §3's justification test, it **could have been read instead, and was**: `pnpm-workspace.yaml` at `0962279` carries only `onlyBuiltDependencies: [esbuild]` and **no `packages:` key**. A spike would have measured a fact sitting on disk in one file. **(2)** *Is there a publish workflow?* — likewise read instead: a search for `publish`, `registry`, `NPM_TOKEN` and `npmjs` across all four files under `.github/workflows/` (`ci.yml`, `cd-prod.yml`, `cd-test.yml`, `claude.yml`) returns **zero matches**. Both questions are material to the topology comparison and neither is uncertain, which is precisely the combination §3 excludes.

**A third question was neither spiked nor withdrawn, and the distinction is recorded so the count is honest.** *Does `"private": true` prevent the core from being consumed?* was **not** separately justified as a spike — it rode along inside `SPK-S9-1` as a sub-result of variants B, C and E, and is reported at `F-S9-3`. It is not counted as a spike run and not counted as a candidate withdrawn.

**Coverage of `OUT-10` for this sub-task, stated so it is legible: one spike run, two candidates withdrawn with their reasons, one sub-result disclosed, none omitted.** One further uncertain-and-material claim — whether one maintainer can operate a split-visibility release pipeline on the current CI — was **capped rather than spiked**, at `91_caps-and-incomplete-scope.md` `CAP-S9-1`, because settling it requires the CI pipeline design `14_…md` §1 is scoped out of. Per `../00_…md` §1.2 that is the second of the two honest resolutions, and asserting it was not taken as a third.

---

### SUB-10

*Appended by `NEU-984` (SUB-10) on 2026-08-22. Verification cutoff `03efe1d`. Nothing above this heading was edited.*

**This sub-task filed no spike.** That is a result rather than an absence of coverage, and it is stated first so no reader has to infer it. `OUT-10` assigns spike execution to this sub-task; §3's justification test is what decides whether a question earns one, and applying it honestly to four candidates returned **three withdrawals and one cap**. Following SUB-14's and SUB-15's precedent, every candidate is disclosed with its reason rather than dropped, so the coverage is legible.

**Three candidates were considered and withdrawn under §3, and all three are disclosed rather than omitted.**

**(1)** *Do two concurrent boot migrators serialize, double-apply, or deadlock?* — genuinely material: `src/transport/main.ts:27` runs `initializeDatabase()` as the first statement of `bootstrap()` with no environment guard, and the selected deployment shape has to say whether more than one process may do that. It looked like a spike, and a plausible harness existed (two processes, one database, a pending migration). Applying §3's justification test, **it could have been read instead, and was.** The installed migrator is `drizzle-orm` **0.45.1**, and `node_modules/drizzle-orm/pg-core/dialect.js:44`–`:72` answers the question with certainty: `drizzle.__drizzle_migrations` is created with **no unique constraint** on `hash` or `created_at`; pending-ness is decided by a plain `select … order by created_at desc limit 1` issued **before** the transaction opens, with **no `pg_advisory_lock`, no `FOR UPDATE`, no `LOCK TABLE`**; and the whole pending loop is then wrapped in one transaction. There is **no serialization mechanism to measure** — the absence is in the source, and an experiment could only have re-demonstrated it. Combined with this repository's non-idempotent DDL (`drizzle/0000_strong_tarantula.sql:1`, a bare `CREATE TABLE`), the failure mode follows. Reported at **`F-S10-2`** and decisive for `DR-C10-S10-2` clause 3. **Disclosed limit:** the resulting crash sequence was **not executed** — no Postgres and no container runtime was reachable in this run (`docker` absent, `127.0.0.1:5432` `ECONNREFUSED`) — so the step from "no lock exists" to "the second process exits 1" rests on Postgres's documented DDL catalog-locking behaviour rather than on an observed transcript. That limit is carried in `F-S10-2`'s own *What is assumed rather than derived* field. It does not reopen the spike: the uncertain part was whether a lock exists, and reading settled that.

**(2)** *Can a second replica serve an MCP session it did not create?* — material to the rejection of horizontal replication and to three of `OI-S13-1`'s four cross-category interactions. Applying §3's test, **it could have been read instead, and was.** `src/transport/http.ts:82`–`:83` declares `transports` and `sessionIdentity` as `Map`s scoped to the `startHttpTransport()` closure, and a search across `src/` returns no Redis or shared state store of any kind — so a process that did not create a session cannot know it exists. Both miss paths are explicit handler code rather than emergent behaviour: `:226`–`:232` returns **HTTP 404** with JSON-RPC **`-32000`** on POST, and `:245`–`:250` returns **HTTP 400** on GET/DELETE. A spike would have stood up two replicas to observe two `if` statements. Reported at **`F-S10-3`**.

**(3)** *Can a separate store satisfy a cross-category consistency requirement?* — the question behind `DR-C10-S10-1`'s decisive criterion. Applying §3's test, **it could have been read instead, and was.** The seven rows requiring cross-category same-transaction atomicity are enumerated in `../10_…md` §8 and `../08_…md` §8; `src/ports/unit-of-work-port.ts:26`–`:28` shows the unit of work does not span components; and `../09_…md` §7 records that premise as one of the two conditions under which SUB-14's row-walks terminate at all. The answer is **no**, and it follows from published artifacts plus one interface file. Building a two-store harness would have demonstrated that a transaction cannot span two databases — a fact whose outcome is fixed in advance, which §3 excludes.

**One candidate was capped rather than spiked, and the distinction matters.** *What is the AI latency, privacy and cost envelope?* — material to `DR-C10-S10-3`, and genuinely uncertain, so §3's test does **not** withdraw it. It is infeasible on two independent grounds. **(i)** No AI provider credential was reachable in this run, so no call could be made. **(ii)** More decisively, **`A-26` records that no budget exists to test against** — a latency or cost measurement with no acceptance threshold answers no question anyone can act on, and §3 rejects a measurement whose result answers no question anyone will ask. The second ground would hold even with a credential, which is why the candidate is capped rather than deferred: it is not waiting on access, it is waiting on NEU-891. `A-26` is therefore cited at `DR-C10-S10-3` with its tolerated envelope and its invalidating outcome, and **no latency, privacy or cost claim is made anywhere in this sub-task's artifacts**. Per `../00_…md` §1.2 that is the second of the two honest resolutions; asserting an envelope was not taken as a third.

**A fifth question was neither spiked nor withdrawn, and the distinction is recorded so the count is honest.** *Does two-writer divergence actually occur?* is `CAP-S6-1`'s subject, and that cap names this sub-task as the party that "must therefore stand up a store to reason about one". **No store could be stood up** — the same `ECONNREFUSED` and absent container runtime recorded above — so the cap is **carried forward unlifted** at `91_caps-and-incomplete-scope.md`, not converted into a spike candidate this sub-task then withdrew. Its subject additionally has **no instance** under the selected substrate, since `DR-C10-S10-1` selects a single-writer topology; that narrows the cap's practical reach and does not close it, and closing it is not this sub-task's to do.

**No quarantine path is recorded, because no harness was built.** `_local/scratch/` holds no `SPK-S10-*` artifact. Confirmed at `03efe1d`: **nothing was written under `src/`, `tests/` or `drizzle/`**, nothing was merged as product code, no dependency was added to `package.json`, and `pnpm-workspace.yaml` is unmodified. Every file this sub-task created or changed lives under `docs/research/C010-system-and-repository-architecture/`.

**No expiry is inherited by any citation in this sub-task's records**, because no spike record exists to carry one. Where an upstream spike's number is *cited* — `SPK-S6-1`'s ≤0.02%, at `DR-C10-S10-1` and `DR-C10-S10-2` — it is cited through **`F-S15-2`**, which records it as an in-process transport floor rather than a deployed cost, and it inherits `SPK-S6-1`'s own **2027-08-21** expiry per `../00_…md` §2.6.

**Coverage of `OUT-10` for this sub-task, stated so it is legible: zero spikes run, three candidates withdrawn with their reasons, one candidate capped, one adjacent cap carried forward unlifted, none omitted.**
