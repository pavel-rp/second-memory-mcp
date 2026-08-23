# 03 — The Execution-Environment Question, Closed; and the Out-of-Band Citation-Drift Component

**Task:** NEU-972 (SUB-2) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-21 · **Verification cutoff:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-9` in full. Exercises `OUT-10` for the first time — `SPK-S2-1` is the first record written into `92_spike-register.md`.
**Status:** decided — three conclusions, each carrying its own citations, its own decision record, and its own statement of what it does **not** rest on.

**Vocabulary.** This document uses **learner** for the human being served, and uses none of the three ambiguous words `00_method-and-provenance.md` §4 disambiguates except where qualified in place: **authenticated subject** for the identity sense, **learning session** for the domain sense, **database schema** for the storage sense. An unqualified use of any of the three would be a defect.

---

## 0. The result, stated first

| # | Question | Answer | Rests on | Decision record |
| --- | --- | --- | --- | --- |
| **1** | Is a **learner-facing** judge, sandbox or runner an architectural component of the selected system? | **No.** No component of the selected system executes anything a learner submits, and the umbrella brief's presupposition to the contrary is **closed here, not inherited.** | The learner path as NEU-890 decided it (§1, rows A–C) | `DR-C10-S2-1` |
| **2** | Is an **authoring-time** execution environment an architectural component? | **Yes** — with an **isolation and resource boundary**, and the boundary exists for **liveness**, not for containment of hostile code. | The `automated` gate class and `EQ-S4-6` (§1, rows D–E), plus **`SPK-S2-1`**, which settled the part reading could not | `DR-C10-S2-2` |
| **3** | What does NEU-890's one serve-time gate oblige this architecture to place? | An **out-of-band citation-drift verdict producer** with egress to external source sites, and a **drift-verdict cache** the serve path *reads*. A stale-or-absent verdict **quarantines the unit**; it never blocks the learner's request. | The serve-time gate rule and `G-DRIFT`'s cached-asynchronous admission (§1, rows F–G) | `DR-C10-S2-3` |

**Every component named here is placed `required-by-upstream` and none is described as existing.** NEU-890 specified 59 gates and implemented none, there are no serve surfaces, and there are no content units. This document decides *what the architecture must contain*; it does not report on anything built.

---

## 1. The reconciliation record

The umbrella brief presupposes "execution-environment needs established by upstream packages". That text predates NEU-890's reference-only decision. Seven passages settle the matter between them, and they are reproduced here — with their file, their line and NEU-890's compilation date — so that no later reader has to reconstruct which decision carried which conclusion.

| Row | What NEU-890 decided | Where (NEU-890, compiled 2026-08-10) | Consumed by |
| --- | --- | --- | --- |
| **A** | The learner's pasted-back solution is *"submitted, persisted and graded by us"* through `rubric_payload` → the deterministic mapper — **`mapRubricToQuality`**, *"deterministically and fail-closed"*. It is graded, never run. | `../C009-course-content-quality/06_assessment-evidence-out-of-band.md:54` | Conclusion 1 |
| **B** | *"No stylometric, timing-based, or similarity-based authorship inference is proposed."* | `../C009-course-content-quality/06_assessment-evidence-out-of-band.md:330` | Conclusion 1 |
| **C** | *"Selecting or building an exercise runner, an editor or a judge is explicitly out of scope here … it selects no runtime, no compiler, no sandbox and no execution environment."* | `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92` | Conclusion 1 |
| **D** | The **`automated`** mechanism is the one whose membership test is *"Does deciding it require **running** something whose output is not already written down"*, and whose stated cost is *"An execution environment, and a re-run budget."* | `../C009-course-content-quality/09_enforceable-quality-system.md:70` | Conclusion 2 |
| **E** | **`EQ-S4-6`**, solution boundary confrontation — *"the approach, run over the `separating_distractor_or_boundary_input` of **every `test` instance placed on the same node**, produces that test's `expected_behavior`"* — is `automated`, `blocks`, **authoring-time**. All four standards are authoring-time; none is serve-time, because each needs the node's other units, an execution, or a reviewer, *"and §3.3 bars all three from a learner's latency path."* | `../C009-course-content-quality/09_enforceable-quality-system.md:216`, `:315`, `:325` | Conclusion 2 |
| **F** | A serve-time gate is *"on a learner's latency path and may not carry a reviewer, a model call, or an execution."* **Exactly one** gate is serve-time. | `../C009-course-content-quality/09_enforceable-quality-system.md:103`, `:461` | Conclusion 3 |
| **G** | *"`G-DRIFT` … is the only serve-time gate, and it is the single legitimate `both`."* It **is** an execution, *"so it is admitted at serve-time only in a **cached, asynchronous** form: the serve path reads a drift verdict computed out of band, and a stale-or-absent verdict **quarantines** the unit with `reason: retracted-input` rather than blocking the learner's request."* | `../C009-course-content-quality/09_enforceable-quality-system.md:468`–`:473` | Conclusion 3 |

**The contradiction is only apparent, and naming why is the point of this record.** Row C's *"no execution environment"* and row D's *"An execution environment, and a re-run budget"* are about **two different paths**. Row C scopes the *learner* path — what happens to a solution a learner writes. Row D scopes the *authoring* path — what happens to an approach a **creator** writes, before any learner sees the node. Reading them as one claim is what produced the presupposition this document closes.

### 1.1 Why the two cases are answered separately, and what that costs

`OUT-9` requires the two answers to be **separate**, each citing the NEU-890 decision it relied on, with **neither inferred from the other**. That is not a formatting rule. Inferring either direction produces a specific, nameable error:

- **Inferring "no authoring-time execution" from "no learner-facing execution"** deletes `EQ-S4-6`, which is a `blocks` gate on the solution standard — the check SUB-4 itself calls *"the one that matters"* (`09_…:315`). The architecture would then contain no component able to run it, and the gate would be specified and unrunnable.
- **Inferring "there is a learner-facing runner" from "there is an authoring-time one"** re-opens a decision NEU-890 made deliberately, and would smuggle an in-app judge back into a system whose entire assessment design (`06_…:6`, `:409`) exists because there is none.

So §2 and §3 below each state their own evidence, and each states in its own words what it does not rest on.

---

## 2. Conclusion 1 — no learner-facing execution environment is a component of this system

### 2.1 The statement

> **No component of the selected system executes, judges, sandboxes or runs anything a learner submits, and no component captures a learner's keystrokes or infers authorship from timing.** The learner solves on the source site; the pasted-back solution is stored, persisted and graded by `mapRubricToQuality`, which is a pure deterministic mapping over a rubric-anchored payload. There is no in-app judge, no exercise runner, no learner-facing sandbox, and no submission-execution surface anywhere in this architecture.

**The umbrella brief's presupposition — "execution-environment needs established by upstream packages" — is therefore false for the learner path, and it is closed here rather than carried forward.** No sub-task after this one needs to re-derive it, and any requirement that assumes otherwise is a defect against this section, not a new requirement.

### 2.2 The evidence

Rows A, B and C of §1, in full above. Two further facts, verified against this repository at this document's cutoff rather than inherited:

- **`mapRubricToQuality` is a pure deterministic function**, `src/domain/algorithms/grade-mapper.ts:71`, called from `src/orchestration/teaching-workflows.ts:1213,1475,1971`. It maps a rubric payload to a quality number. It runs nothing.
- **The repository contains no execution machinery at all.** A scan of `src/` for `child_process`, `worker_threads`, `vm`, `vm2`, `isolated-vm`, `execSync` and `spawnSync` returns **zero** hits (verified 2026-08-21). This is a **confirmed** codebase fact under `00_method-and-provenance.md` §1.2 and is re-counted here rather than inherited, per `CAP-S1-2`'s owner rule.

### 2.3 What this conclusion does not rest on

**This conclusion is derived entirely from the learner path, and nothing in it depends on §3's answer.** If §3 had concluded that no authoring-time execution environment were needed either, §2 would be unchanged; if §3 had concluded that one were needed with a far heavier boundary, §2 would still be unchanged. The two sections share no premise: §2's premises are rows A, B and C, which are about a learner's solution; §3's premises are rows D and E, which are about a creator's approach. Neither set entails the other.

### 2.4 The auditable rule — published so SUB-11 can enforce it mechanically

A conclusion nobody can check over the finished package is an assertion with a citation attached. This section therefore publishes the conclusion **as a rule with a search and a disposition**, so that `NEU-985 (SUB-11)` can run it without re-deriving anything.

**Search terms — the five, exactly:**

| # | Term | What a hit would mean |
| --- | --- | --- |
| 1 | **in-app judge** | A component is claimed that decides correctness by running a learner's submission. |
| 2 | **sandbox** | An isolation boundary is claimed for learner-submitted code. |
| 3 | **runner** | An exercise-execution surface is claimed on the learner path. |
| 4 | **captured keystrokes** | A learner-input capture stream is claimed as evidence. |
| 5 | **keystroke- or timing-based authorship inference** | An authorship signal is claimed from input dynamics, which row B forbids. |

**Disposition of a hit — stated once, so it is not re-decided per hit:**

> A hit is a **finding routed to the chapter that introduced the requirement** — not a finding against this chapter, and not a finding against the sweep. The chapter that introduced it either removes the requirement or re-files it as an open item with a named owner. A hit is **not** automatically a defect: a chapter may legitimately use the word *sandbox* while **denying** that one exists, exactly as this section does. The sweep produces candidates; the owning chapter decides.

**Scope of the sweep, and what it excludes.** The sweep runs over the finished `docs/research/C010-system-and-repository-architecture/` package. **This document does not run it**, and it is not deferred work: fourteen of the chapters it would sweep do not exist at this cutoff, so running it now would sweep two documents and report a clean result about a package that is one-eighth written.

**Handed to `NEU-985 (SUB-11)`** — which owns the audit rows, receives the terms and the disposition above, and reports the count in each class alongside its other mechanical audits.

### 2.5 The component consequence

**No component is kept by this conclusion.** There is nothing to specify with the eight fields §3.5 and §4 use, because the conclusion is that the component does not exist. Recording "no component" as a decision — with a decision record and a revision trigger — is what distinguishes a closed question from an unasked one.

---

## 3. Conclusion 2 — an authoring-time execution environment **is** an architectural component, and its boundary is a liveness boundary

### 3.1 What reading settled, before any experiment

Reading NEU-890 settles two things, and it is worth being precise about which, because `92_spike-register.md` §3 requires a spike to name what it read and what that reading failed to answer.

1. **An authoring-time execution is required.** Row D defines `automated` as the class whose verdict requires *running* something, and row E places `EQ-S4-6` — a `blocks` gate — in it, at authoring time. A system with no component able to run an authored approach cannot run `EQ-S4-6`, and `EQ-S4-6` is not optional: it blocks.
2. **The code that runs is first-party and creator-authored.** `EQ-S4-6` runs *the approach* — the creator's own solution artifact — over the node's own `test` instances. Nothing a learner supplies reaches it (§2). There is therefore **no untrusted-code trust boundary** here, and claiming one would over-specify the component.

### 3.2 What reading could not settle

Neither of those settles the question that actually decides whether this is an *architectural component* or an unremarkable build step: **does the execution need an isolation and resource boundary?**

The distinction is not cosmetic. An execution with no boundary is a function call inside whatever process the authoring pipeline already runs in — no component, no placement in `OUT-1`'s component model, no authority question for `OUT-3`. An execution that must be isolated and must be reclaimable is a component with a boundary, a failure mode and a resource budget, and it has to be placed.

Nothing in NEU-890 answers it. `09_…:70` names the cost as *"an execution environment, and a re-run budget"* and stops; `DR-C09-04:92` explicitly *"selects no runtime, no compiler, no sandbox and no execution environment"*; `06_…:409` states NEU-890 *"implements no grader, judge, or submission surface"*. The repository answers it no better: there is no execution machinery in `src/` to inspect (§2.2). `OI-S1-1` records exactly this gap and names SUB-2 as its owner.

**The question is empirical and bounded, so `92_spike-register.md` §2's three-way rule routes it to a spike.** It is not a cap — a bounded experiment settles it — and it is not something to assert.

### 3.3 What the spike found

**`SPK-S2-1`** ran a stand-in authored unit three ways under Node v22.23.1 and recorded, for each, whether the host survived and whether a guard armed *before* the unit started was able to fire. The full result is in `92_spike-register.md`, stated there in full because the working files are gitignored.

| Arrangement | Host survived | Guard fired | Control reclaimed |
| --- | --- | --- | --- |
| **A** — well-behaved unit, in-process | yes | not needed | yes |
| **B** — non-terminating unit, in-process, 1000 ms same-thread timer guard armed first | **no** — required an external `SIGKILL` at 6000 ms | **no** | **no** |
| **C** — the same non-terminating unit inside a `worker_threads` Worker | yes | yes | yes — `worker.terminate()` resolved at **1007 ms** |

**The finding is arrangement B, not arrangement C.** A same-thread guard cannot fire, because the runaway holds the thread the guard would run on. The gate runner cannot even *observe* the failure it is supposed to report, let alone recover from it: the process has to be killed from outside, and every other gate queued behind it dies with it.

**The failing unit is an ordinary authoring mistake, not an attack.** The stand-in's loop increments under a condition that is never true — the kind of error a creator makes and a boundary-confrontation gate exists to catch. That is what makes this conclusion load-bearing: the boundary is needed for the **expected** case, not the adversarial one.

### 3.4 The decision

> **An authoring-time execution environment is an architectural component of the selected system.** It carries an **isolation boundary the host can terminate** and a **wall-clock resource bound per executed unit**. Its trust boundary is *first-party authored code* — **not** untrusted-code containment — and the isolation exists for **liveness and resource reclamation**, because `SPK-S2-1` arrangement B shows a non-terminating authored unit is unrecoverable in-process.

This decision rests on `OI-S1-1` (the tension NEU-890 left open, `[unconfirmed]` and owned by this sub-task) and on `SPK-S2-1`, **named here in the sentence that decides**, per `00_method-and-provenance.md` §2.3 and §2.6. **The citation inherits `SPK-S2-1`'s expiry**: past that date this decision is stale until the spike is re-run or re-labelled.

`OI-S1-1` closes on this document landing on `origin/develop`. Its closure is recorded in **SUB-2's own section** of `90_open-items-and-provisional-register.md`; SUB-1's section is untouched.

### 3.5 Component specification — `authoring-time gate runner`

| Field | Specification |
| --- | --- |
| **Responsibility** | Execute a creator-authored approach over the boundary inputs of every `test` instance placed on the same node, and return `EQ-S4-6`'s verdict. It decides nothing else and grades nothing a learner wrote. |
| **Trigger** | **Authoring-time only** — on a unit's path from `draft` to a terminal state, before it is available to a learner (`09_…:102`). Never on a learner's latency path; never at serve time. |
| **Trust boundary** | **First-party, creator-authored code.** No learner-submitted code crosses it (§2). This is the boundary's *scope*, not a claim that the code is correct — it is expected to be wrong, which is why the gate exists. |
| **Egress** | **None.** The gate runs over the node's own units. A gate runner that reached the network would be a different component with a different specification. |
| **Isolation and resource boundary** | **Required.** A terminable isolate per executed unit, plus a wall-clock bound the host enforces from outside the executing thread. `SPK-S2-1` arrangement B establishes that a same-thread guard cannot enforce it; arrangement C establishes that a host-side terminate can. The specific primitive is a substrate choice, not fixed here (§7). |
| **State read** | The unit under gate, and **every `test` instance placed on the same node** — which is authoritative state the unit does not contain (`09_…:216`). |
| **State written** | One gate verdict per executed unit, on that unit's review record. Nothing else — no artifact of the execution itself is retained. |
| **Authority requirement** | The gate-verdict state must have **exactly one** authority. This document states the requirement; **`SUB-13 (NEU-987)`** assigns it in `OUT-3`'s authority matrix. Filed as **`OI-S2-2`**. |

### 3.6 What this conclusion does not rest on

**Nothing in §3 is inferred from §2.** §2 concerns what happens to a learner's solution and is settled by rows A–C; §3 concerns what happens to a creator's approach and is settled by rows D–E plus `SPK-S2-1`. Had §2 concluded the opposite — that a learner-facing judge existed — §3's argument would be unchanged, because `EQ-S4-6` would still be an `automated`, `blocks`, authoring-time gate, and arrangement B would still show the in-process guard cannot fire. The dependency runs neither way.

### 3.7 The `automated` class label over-sizes this component by about five times

A downstream reader sizing the execution component from the class label alone would size it from **11 rows**. That is the wrong number, and the right one is **2**.

`09_…:302` gives the distribution: `deterministic` 28 · `schema` 20 · `server-side` 15 · **`automated` 11** · `AI` 15 = 89. Reading the eleven `automated` rows individually (`09_…:154`, `:155`, `:158`, `:190`–`:193`, `:197`, `:216`, `:244`, `:283`):

| What the row actually does | Rows | Needs the gate runner? |
| --- | --- | --- |
| **Executes authored code** | `EQ-S4-6` (runs the approach), `EQ-S6-4` (substitutes a misconception's method and evaluates it) | **Yes — 2 rows** |
| Runs a lexical scan over artifacts | `EQ-S1-2`, `EQ-S1-3`, `EQ-S1-6`, `EQ-S8-11` | No |
| Resolves a URL or an id at a source | `EQ-S3-3`, `EQ-S3-4`, `EQ-S3-5`, `EQ-S3-6` | No — this is §4's egress path |
| Re-runs a procedure for idempotence | `EQ-S3-10` | No |

**Two of eighty-nine rows require the component in §3.5.** The class label is not wrong — all eleven require *running something* — but "running a grep" and "running a creator's algorithm over an adversarial input" are the same class and different components. Filed as **`F-S2-2`**, because a reader who sizes from the label over-provisions the isolation substrate roughly five-fold and, worse, may conclude the four `EQ-S3-*` rows belong inside the gate runner when they belong in §4's out-of-band producer.

---

## 4. Conclusion 3 — the out-of-band citation-drift component

### 4.1 The obligation

Row F fixes the constraint: a serve-time gate *"may not carry a reviewer, a model call, or an execution."* Row G fixes the consequence: `G-DRIFT` **is** an execution, and is admitted at serve time only in a **cached, asynchronous** form. NEU-890 states this as a *placement*; it explicitly does not design the detection (*"that is SUB-10's (NEU-966)"*, `09_…:472`), and SUB-10 duly designed it in `../C009-course-content-quality/10_citation-drift-detection-and-revalidation.md`.

**What this package owes, therefore, is neither the placement nor the detection: it is the two components the placement forces into the architecture, specified so `SUB-4 (NEU-974)` can place them and `SUB-13 (NEU-987)` can give their state exactly one authority.**

### 4.2 Component specification — `citation-drift verdict producer`

| Field | Specification |
| --- | --- |
| **Responsibility** | Re-execute SUB-3's verification procedure for **one** cited problem and emit **one dated verdict** for it, against the five signals `D1`–`D5` (`10_…:52`–`:62`). Any observed difference the five do not match defaults to `suspected drift` — never to "unchanged" (`10_…:68`–`:72`). |
| **Trigger** | **Out of band, always.** The serve-time trigger fires **per served citation** and **enqueues**; it never executes inline (`10_…:103`). No trigger of this component is ever on a learner's latency path. |
| **Trust boundary** | **External source sites** — parties outside the operator's control, whose responses are evidence and never instructions. This is the **only** component in the selected system with egress to such a party, which is why its boundary is stated here rather than left to the component model. |
| **Egress** | **Exactly one request for the one cited problem**, on the source's own recorded sanctioned path, which is **inherited per source and never re-chosen** (`10_…:90`, `:96`). A corpus walk is prohibited under every branch — *"the efficient way to re-check a thousand citations against one source is to fetch the source's problem list once and diff locally. That is a corpus walk"* (`10_…:105`). `V0`, the access gate, is re-evaluated first, every time (`10_…:111`). |
| **Isolation and resource boundary** | Bounded by two declared numbers, both consumed from SUB-10 (NEU-966) rather than re-derived: `per_citation_staleness_window` = **90 days**, *declared, not measured* (`10_…:165`), and `per_source_revalidation_budget` = **0 for all twelve sources at NEU-890's cutoff**, derived rather than chosen (`10_…:180`). A re-check that cannot complete every step it re-runs produces **`verdict stale`** — a recorded state, never a partial verdict (`10_…:118`). |
| **State read** | The stored citation pair, and SUB-3's dated `V5`/`V6` observations for that citation. Nothing else. |
| **State written** | **Exactly one tuple per re-check** — `{ citation_id, checked_at, path, verdict, signals_fired, window_admitted_under, budget_admitted_under }` — *"and no part of the source's enumeration"* (`10_…:126`). |
| **Authority requirement** | The verdict store must have **exactly one** authority, and the producer must be the only writer to it. This document states the requirement; **`SUB-13 (NEU-987)`** assigns it. |

### 4.3 Component specification — `drift-verdict cache`

| Field | Specification |
| --- | --- |
| **Responsibility** | Hold the latest dated verdict per citation and answer the serve path's read. It computes nothing. |
| **Trigger** | Written out of band by §4.2's producer; read on **every** serve of a unit carrying a citation. |
| **Trust boundary** | Internal. It holds only verdicts the producer wrote. |
| **Egress** | **None.** A cache with egress would be the producer wearing a cache's name. |
| **Isolation and resource boundary** | It is **on the learner's latency path** and therefore may not carry a reviewer, a model call, or an execution (`09_…:103`). Its only admissible operation is a keyed read. |
| **State read** | Itself. |
| **State written** | The verdict rows the producer supplies. The cache never derives, refreshes, or ages a verdict on its own — *"the serve path **reads a verdict**, it does not **compute** one"* (`10_…:161`). |
| **Authority requirement** | Exactly one authority, assigned by **`SUB-13 (NEU-987)`**; placed in the component model by **`SUB-4 (NEU-974)`**. Filed as the open item this document hands forward. |

### 4.4 The serve-path rule, stated as behaviour

> **A stale or absent verdict quarantines the unit. It never blocks the learner's request.**

| Verdict state at serve | Unit state | What the learner's request does |
| --- | --- | --- |
| `D1` retired / `D2` moved / `D3` restated / `D4` respecified | **`blocked`**, placement suspended (`10_…:231`) | Completes. The node stops offering that problem. |
| Residual — `suspected drift` | **`quarantined`**, `reason: retracted-input` (`10_…:232`) | Completes. |
| **`verdict stale`** — window passed, re-check not issuable | **`quarantined`**, `reason: retracted-input` (`10_…:233`) | **Completes.** |
| **Verdict absent** — never computed | **`quarantined`**, `reason: retracted-input` (`09_…:472`, `10_…:318`) | **Completes.** |

**At a `per_source_revalidation_budget` of zero, the last two rows are the state every citation would be in** (`10_…:221`). That is not a defect in the specification; it is the honest consequence of a corpus in which no source has a resolving access path. The architecture must therefore treat *quarantined-for-stale-verdict* as the **ordinary** path, not the exceptional one — a component sized for the exceptional case will be wrong on day one.

### 4.5 Handed on, by id

- **`SUB-4 (NEU-974)`** receives §4.2 and §4.3 as two components to place in `OUT-1`'s component model, with their trust boundaries already drawn: the producer is the system's only externally-facing egress component; the cache is internal and read-only on the serve path.
- **`SUB-13 (NEU-987)`** receives the authority requirement for both the verdict store and the gate-verdict state of §3.5 — three state categories, each needing **exactly one** authority. **This document states the requirement and assigns no authority**; the matrix is SUB-13's.

---

## 5. What any source-site-egress component inherits

These constraints are **consumed** from NEU-890, not re-decided here, and they bind §4.2 and anything a later sub-task builds that touches a source site.

1. **No problem statement text, in any of the four modes** — stored, mirrored, paraphrased into storage, or generated (`09_…:155`, `EQ-S1-3`). A re-check reads a page *only to confirm or refute a match*; nothing from it is retained (`10_…:115`).
2. **A source's enumerated problem list is never retained.** *"May record that a source has N problems; may not record which N"* (`09_…:154`). The axis is **retention, not request count** (`10_…` §3.3): a component that fetched a list and discarded it still may not persist what it saw, and a verdict cache holding the list its verdict was derived from *"would be `G-ENUM-SCAN`'s exact failure with a cache's name on it"* (`10_…:126`).
3. **Stored citation fields are limited to `stable_id` + `canonical_url`** while ledger challenge **`CH-F5-1`** is open. The permitted set is *"never widened locally"* (`../C009-course-content-quality/03_problem-citation-verification-and-access-paths.md:52`, `:183`). Any sub-task that finds it needs a third field routes an amendment to NEU-890's owner rather than widening the set here — which is `00_method-and-provenance.md` §1.2's `consumed` obligation applied literally.

---

## 6. What this closes

**This document closes the execution-environment half of C005 open question #1.**

That question asked two things jointly: in what language authored artifacts are written, and whether an execution environment is part of the system. **NEU-890 closed the language half** in `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md` — which, in the same record, declined the execution half in as many words (`:92`). This document closes the execution half, in both of its parts: **no** on the learner path (§2), **yes with a liveness boundary** at authoring time (§3).

Nothing about the execution-environment question remains inherited. A later sub-task that needs to know whether execution state exists in this system reads §2, §3 and §4 and has its answer, with the citations attached.

---

## 7. What this document does not decide

| Not decided here | Owner |
| --- | --- |
| The component model as a whole, and the trust-boundary classification of these three components within it | **`SUB-4 (NEU-974)`** |
| Which authority owns the drift-verdict store and the gate-verdict state | **`SUB-13 (NEU-987)`** |
| The isolation **primitive** and the substrate the gate runner executes on — `SPK-S2-1` used `worker_threads` because it was the cheapest way to answer the question, and **that is not a technology selection** | **`SUB-10 (NEU-984)`** for the substrate; **`SUB-15`** for the architecture-material rule that decides whether the choice is architecture-material at all |
| The scheduling mechanism that drives the out-of-band producer | **`SUB-10 (NEU-984)`** — filed as **`OI-S2-1`** |
| The detection design for citation drift — signals, windows, budgets | **NEU-890's SUB-10 (NEU-966)**, already published; consumed here, not re-decided |
| Running the package-wide sweep of §2.4 | **`NEU-985 (SUB-11)`** |

---

## 8. Records this document files

| Register | Ids | What they carry |
| --- | --- | --- |
| `02_findings-register.md` | `F-S2-1`, `F-S2-2` | The presupposition was false only for one of the two paths; and the `automated` class label over-sizes the execution component about five-fold. |
| `90_open-items-and-provisional-register.md` | `OI-S2-1`, `OI-S2-2`, plus the recorded closure of **`OI-S1-1`** | The producer's scheduling mechanism; the gate-verdict authority; and the disposition of the tension this sub-task owned. |
| `91_caps-and-incomplete-scope.md` | `CAP-S2-1`, `CAP-S2-2` | The re-run budget cannot be quantified here; the frequency of the failure mode the spike demonstrates is unmeasurable at `n=1` creator and 0 content units. |
| `92_spike-register.md` | `SPK-S2-1` | The isolation experiment, with its result stated in full. |
| `decision-records/` | `DR-C10-S2-1`, `DR-C10-S2-2`, `DR-C10-S2-3` | One decision each, with rejected alternatives and observable revision triggers. |
| `traceability/` | `traceability/S2_execution-environment-and-drift-coverage.md` | `OUT-9` and `OUT-10` coverage. |
| `docs/GLOSSARY.md` | three rows | The product-domain component terms this chapter introduces, per `00_method-and-provenance.md` §4.1. |

---

## 9. Verification note

**Verification here is by file inspection and `git diff` against named criteria**, per `00_method-and-provenance.md` §5. The countable ones for this document: the three conclusions are in three separately-headed sections, each with its own citation set and its own "does not rest on" statement (§2.3, §3.6); three component specifications carry all eight fields (§3.5, §4.2, §4.3); one spike record carries all thirteen fields of `92_spike-register.md` §9; every register change is a pure append of one `### SUB-2` section.

**`qa-execution:engine` is unconfigured — a genuine no-op.** This repository's capability registry resolves to `git, linear` only. The automated QA-execution phase produced no execution for this sub-task, and **no QA pass is claimed, fabricated, or implied**. Per `00_method-and-provenance.md` §5.1 this is recorded and not filed as a cap: `CAP-S1-3` already carries the package-level statement, and a check that was never applicable is not a gap this sub-task discovered.

**The type-check and lint gates are no-regression checks only** and their scope does not include `docs/`. This change touches zero TypeScript, so a green line from either would be evidence about nothing in this document — `00_method-and-provenance.md` §5 and §1.1 both say so, and this document claims no such line as evidence.
