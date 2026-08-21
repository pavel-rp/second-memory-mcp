# 02 — Findings Register

**Task:** NEU-971 (SUB-1) opens it · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Entries owned by:** each appending sub-task. **Consumer:** **NEU-896** (convergence).

---

## What belongs here

A **finding** is a fact about the programme's own shape that a later reader must know and would otherwise have to rediscover: a circularity, an ownership collision, a decision made in the wrong order, a gap between what a charter assumed and what the evidence shows.

A finding is **not** an open item (which has a resolving event and an owner who closes it), **not** a cap (which is an admission of a scope limit), and **not** a decision (which belongs in `decision-records/`). It is a **first-class record of something that is true about how this work happened**, published so that NEU-896 converges over a stated situation instead of rediscovering a contested one.

**A finding is recorded in its own right, not as an aside.** The charter is explicit about this for the two it names: the NEU-893 circularity and the C003/NEU-850 decision-ownership collision are each "recorded as a finding in its own right", carrying an id, not mentioned in passing inside a document about something else.

## Why this register is numbered `02` and not `9x`

It sits in the `00`–`89` per-sub-task range because SUB-1 owns and seeds it, but it behaves like a `90`-range shared register: **append-only, `F-S<n>-<k>` namespaced, keep both sides.** Read these rules, not the filename, for how to write into it. The README states the same exception.

## Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Do not tidy duplicates in flight.** Two sub-tasks independently finding the same thing is evidence that it is visible from two directions; collapsing it early throws that away.

## Id namespacing (there is no global counter in this file)

Ids are **`F-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-12 allocates `F-S12-1`, `F-S12-2`, … concurrently with SUB-4's `F-S4-1`, without coordination and without collision. Cite a finding in its full form (`F-S1-1`), never as a bare `F-1`.

## Stable field set (the same fields on every entry, in this order)

| Field | What it records |
| --- | --- |
| **Id** | `F-S<n>-<k>` |
| **Finding** | The fact, stated as a fact. |
| **Evidence** | What establishes it — a real path, an upstream package with its version or date, or a tracker record with its read date. |
| **Consequence** | What is weaker, riskier or differently-shaped because this is true. |
| **What is assumed rather than derived** | Where the finding is about an inverted dependency, the specific inputs that were assumed, each cited by id. |
| **Handed to** | Who must act on it, and what they receive. |

---

## Entries

### SUB-1

*One entry. `F-S1-1` is the circularity the charter required to be published as a finding in its own right. The C003/NEU-850 decision-ownership collision is the other named finding this charter requires; it is **SUB-12 (NEU-986)**'s to file, together with its settled disposition, and it is deliberately not pre-filed here.*

#### `F-S1-1` — This package ran ahead of NEU-893, and the dependency between them is circular

- **Id:** `F-S1-1`
- **Finding:** **C005's OUT-9** (NEU-893, safe production integration and learner isolation) presupposes an application architecture, and **C005's OUT-8** — this package — needs the ownership model that NEU-893 would settle. The dependency runs both ways, so one of the two had to proceed on assumptions, and **it is this one.** NEU-893 is Backlog and unbuilt at this package's cutoff.

  *(Both ids in that sentence are **program-level C005 outcomes**, not this package's own `OUT-8`/`OUT-9`. See `00_method-and-provenance.md` §2.5 — a bare `OUT-n` in this package always means an entry in `01_outcome-register.md`.)*

- **Evidence:** The C010 charter records the circularity as a confirmed decision of its intake, sourced to the intake's first question and to a host finding. NEU-891, NEU-892, NEU-893 and NEU-894 were all Backlog and unstarted at the 2026-08-19 tracker read. The choice to proceed rather than block was made deliberately and recorded, not defaulted into.

- **Consequence:** Every decision in this package that touches learner isolation, the production deployment or the data-store topology rests on assumptions about NEU-893's output rather than on NEU-893's output. Those decisions are **not** thereby wrong — they are bounded by a stated tolerance envelope and carry a named invalidating outcome — but they are **assumed, not derived**, and NEU-893 must be chartered knowing which ones.

  The affected outcomes are `OUT-3` (the authority matrix), `OUT-4` (the isolation invariant and the NEU-893 disjointness contract) and `OUT-8` (the deployment-shape and data-store-topology selections).

- **What is assumed rather than derived:**

  | Input | Id | Status |
  | --- | --- | --- |
  | Learner isolation will be enforced **server-side at or below the port boundary** | `A-28` | **assumed** — `[unconfirmed]` stand-in |
  | The **existing production deployment continues to back the product** | `A-28` | **assumed** — `[unconfirmed]` stand-in |
  | A **backward-compatible migration path for existing global rows** exists | `A-28` | **assumed** — `[unconfirmed]` stand-in |
  | The authenticated subject a production token yields is a **human learner** rather than an OAuth client | `OI-S1-2` | **unverified** — no live token has been inspected |

  **And, equally important, what is *not* assumed:** learner-ownership **placement** is **consumed** from **NEU-850's** OUT-2 (`user_id` NOT NULL on every core table, keyed to the JWT subject, threaded through the 9 row-owning repository ports) with its source cited — it is a decision to honour, not a guess, and NEU-850 is converged though unimplemented. Likewise the deployment facts (single self-hosted VPS, unversioned compose stack outside the repository, no Dockerfile, no IaC, no rollback, automatic migration on boot, process-local in-memory state) are **confirmed against the repository**, not assumed from NEU-893.

  **The circularity is therefore narrower than it first appears**, and stating its exact boundary is the point of this record: three clauses of one stand-in plus one unverified transport fact — not the whole isolation question.

- **Handed to:**
  - **NEU-893**, which is chartered knowing exactly which of this package's inputs were assumed rather than derived — the four rows above — and which receives `OUT-4`'s two-list disjointness contract naming what this package closed and what it handed on.
  - **NEU-896**, which receives this finding alongside `93_stand-in-assumption-register.md`, so convergence reconciles a **stated** inversion rather than rediscovering it. The second named finding NEU-896 expects — the C003/NEU-850 decision-ownership collision with its settled disposition and any routed amendment — arrives from **SUB-12 (NEU-986)**.

---

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment. Do not edit any
section above your own. On conflict, keep both sides.
-->

### SUB-2

*Two entries. Both are facts about how the programme's own evidence is shaped — one about a presupposition that was true of one path and false of another, one about a class label that mis-sizes a component by about five times. Neither is an open item: nobody closes them, and there is nothing to resolve. They are things a later reader must know.*

#### `F-S2-1` — The umbrella brief's execution-environment presupposition was path-specific, and reading it as a single claim is what made it look contradictory

- **Id:** `F-S2-1`
- **Finding:** The C010 umbrella brief presupposes *"execution-environment needs established by upstream packages"*. That presupposition is **false for the learner path and true for the authoring path**, and NEU-890 says both things plainly in the same package. `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92` states that NEU-890 *"selects no runtime, no compiler, no sandbox and no execution environment"*; `../C009-course-content-quality/09_enforceable-quality-system.md:70` states that the `automated` gate class costs *"An execution environment, and a re-run budget."* **The two statements never contradicted each other.** One scopes what happens to a solution a **learner** writes; the other scopes what happens to an approach a **creator** writes, before any learner sees the node. Read as one claim about one system, they look irreconcilable, and that reading is what produced the presupposition rather than a decision.
- **Evidence:** `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92`; `../C009-course-content-quality/09_enforceable-quality-system.md:70`, `:216`, `:315`, `:325`; `../C009-course-content-quality/06_assessment-evidence-out-of-band.md:6`, `:54`, `:409` (NEU-890, compiled 2026-08-10). All read on `origin/develop` at the 2026-08-21 cutoff.
- **Consequence:** Any later reader who resolves the tension by picking **one** of the two statements gets a wrong architecture in a specific, predictable way. Picking `DR-C09-04:92` deletes the component that runs `EQ-S4-6` — an `automated`, **`blocks`** gate — leaving a quality system that specifies a gate nothing can run. Picking `09_…:70` re-introduces a learner-facing runner into a system whose entire assessment design exists because there is none. **The failure mode is not "getting it wrong"; it is getting it half-right and not noticing**, because either half is fully citable.
- **What is assumed rather than derived:** Nothing. Both limbs are `consumed` from a **built and published** upstream package and are cited by file and line; neither rests on a stand-in, and this finding introduces no new assumption of its own.
- **Handed to:**
  - **Every sub-task SUB-3 … SUB-16**, which may now cite `../03_execution-environment-and-citation-drift-component.md` §2 and §3 instead of re-deriving the split from NEU-890 — and which should treat any single-limb citation of the execution question as a defect.
  - **NEU-896**, which converges over a **stated** reconciliation rather than rediscovering an apparent contradiction inside a delivered package.

#### `F-S2-2` — The `automated` gate-class label over-sizes the execution component by about five times

- **Id:** `F-S2-2`
- **Finding:** NEU-890's mechanism distribution puts **11 of 89** requirement rows in the `automated` class. Only **2 of those 11 execute authored code**: `EQ-S4-6` (runs the creator's approach over the node's boundary inputs) and `EQ-S6-4` (substitutes a named misconception's method into an item and evaluates it). The other nine are a lexical scan over artifacts (`EQ-S1-2`, `EQ-S1-3`, `EQ-S1-6`, `EQ-S8-11`), a URL or id resolution at an external source (`EQ-S3-3`, `EQ-S3-4`, `EQ-S3-5`, `EQ-S3-6`), or an idempotence re-run (`EQ-S3-10`). **The class label is not wrong — all eleven require *running something* — but "running a grep" and "running a creator's algorithm over an adversarial input" are the same class and different components.**
- **Evidence:** `../C009-course-content-quality/09_enforceable-quality-system.md:302` (the distribution: `deterministic` 28 · `schema` 20 · `server-side` 15 · `automated` 11 · `AI` 15 = 89) and the eleven rows themselves at `:154`, `:155`, `:158`, `:190`, `:191`, `:192`, `:193`, `:197`, `:216`, `:244`, `:283` (NEU-890, compiled 2026-08-10). Counted row-by-row at the 2026-08-21 cutoff rather than inherited, per `CAP-S1-2`'s owner rule.
- **Consequence:** Two distinct sizing errors, both of which a reader makes silently. **First**, a reader who provisions the authoring-time execution component from the class label provisions it for eleven rows rather than two — roughly a five-fold over-provision of an isolation substrate that, per `DR-C10-S2-2`, needs no containment at all. **Second and worse**, the four `EQ-S3-*` rows are not gate-runner work: they are **egress to external source sites** and belong to the citation-drift producer of `../03_execution-environment-and-citation-drift-component.md` §4.2, which carries a completely different trust boundary, a completely different retention rule, and a budget of zero. Folding them into the gate runner would put the system's only externally-facing egress inside a component specified to have none.
- **What is assumed rather than derived:** Nothing about the counts — they are read from the published tables. The *classification* of each row as "executes authored code" or not is this sub-task's reading of the row text, not a label NEU-890 assigns; a reader who disagrees with a particular row's placement can re-read it at the line cited.
- **Handed to:**
  - **`SUB-4 (NEU-974)`**, which places both components and must not merge them: the two-row gate runner and the four-row egress producer are separate components with contradictory egress fields.
  - **`SUB-10 (NEU-984)`**, which sizes the substrate and should size it from two rows, not eleven.

### SUB-3

*Three entries. Two are citation-hygiene hazards that a mechanical audit can find and a human reader reliably cannot — one a namespace collision between two packages that both number their sub-tasks, one a wrong tracker id repeated across six merged files. The third is an upstream requirement that is unmet in the codebase today. None is an open item in the sense of needing a decision; all three are things a later reader must know before trusting a grep.*

#### `F-S3-1` — `S3` denotes two different sub-tasks in two live packages, and the `EQ-S3-*` ids are C009's

- **Id:** `F-S3-1`
- **Finding:** `F-S2-2` names `EQ-S3-3`, `EQ-S3-4`, `EQ-S3-5`, `EQ-S3-6` and `EQ-S3-10` as egress rows. Those ids are **NEU-890's**, defined in `../C009-course-content-quality/09_enforceable-quality-system.md`, where the `S3` segment denotes **C009's own sub-task 3**. They are **not** ids in this package's namespace and have nothing to do with C010's SUB-3 (NEU-973). Two live packages both namespace ids by sub-task number, both are cited in the same documents, and the segments collide exactly. **A reader — or a script — that resolves `S3` against the wrong package gets a confident, wrong answer rather than a miss.**
- **Evidence:** `../C009-course-content-quality/09_enforceable-quality-system.md:190`–`:193` and `:197` (NEU-890, compiled 2026-08-10) define the five rows. `../README.md` declares this package's id families as exactly five — `A-`, `OI-S<n>-<k>`, `CAP-S<n>-<k>`, `SPK-S<n>-<k>`, `F-S<n>-<k>` — and `EQ-` is not among them. `../00_method-and-provenance.md` §2.5 requires a program-level id to be owner-attached. Read on `origin/develop` at the 2026-08-21 cutoff.
- **Consequence:** The five rows are **not** carried as `SC-S3-*` inventory entries. Doing so would mint a sixth id family in a package that declares five, and would bind a foreign package's requirement ids into this package's namespace at the exact point the two collide. `../04_state-category-inventory.md` §5.5 carries a cross-walk instead, mapping each row to the entry that holds its state — and recording that `EQ-S3-6` maps to **no** entry by design, because NEU-890 specifies that nothing from the page is stored. The live hazard is that **any future citation of a bare `S3` id in either direction is ambiguous on its face**, and the ambiguity is invisible to a reader who happens to resolve it correctly.
- **What is assumed rather than derived:** Nothing. Both id sets are read from published files at cited lines, and the collision is a property of the two naming schemes, not an inference about intent.
- **Handed to:**
  - **`NEU-985 (SUB-11)`**, whose citation audit can check this mechanically: every `EQ-` id in this package must resolve to C009, and every `S<n>-` id in a C010 family must resolve to a C010 sub-task. Neither direction is currently enforced.
  - **Every sub-task SUB-4 … SUB-16**, which should attach the owner when citing a cross-package id (`NEU-890's EQ-S3-4`), never the bare form.

#### `F-S3-2` — SUB-13 is NEU-977, and a merged sibling cites it as NEU-987 in thirteen places

- **Id:** `F-S3-2`
- **Finding:** SUB-2's merged output refers to `SUB-13` as **NEU-987** in **13 places across 6 files**. The umbrella's actual child mapping puts **SUB-13 at NEU-977**; **NEU-987 is not a child of NEU-895 at all.** The charter's children are deliberately non-sequential — SUB-7…SUB-16 are NEU-980, 981, 983, 984, 985, 986, 977, 978, 982, 979 — so the number cannot be inferred from the sub-task index, and a transposition produces a plausible-looking id that resolves to nothing in this charter.
- **Evidence:** The child mapping is read from the umbrella NEU-895's own children at the 2026-08-21 cutoff. The 13 occurrences are `../92_spike-register.md:152`; `../03_execution-environment-and-citation-drift-component.md:150`, `:179`, `:192`, `:205`, `:223`, `:252`; `../90_open-items-and-provisional-register.md:136`, `:137`; `../traceability/S2_execution-environment-and-drift-coverage.md:20`; `../decision-records/DR-C10-S2-3_out-of-band-citation-drift-component.md:47`, `:51`; `../decision-records/DR-C10-S2-2_authoring-time-execution-boundary.md:57`.
- **Consequence:** **`SUB-13 (NEU-977)` grepping the package for its own id will not find any of the thirteen rows addressed to it** — including `OI-S2-2`, an open item filed with SUB-13 as its named owner, which will therefore appear ownerless to the sub-task that owns it. This is precisely the silent-omission failure the package's id discipline exists to prevent, and it is invisible to a reader who does not already know the mapping. **Nothing here is corrected in place:** the registers are append-only and no sub-task rewrites a sibling's merged entries, so the correction is this finding, not an edit.
- **What is assumed rather than derived:** Nothing about the occurrences — each is cited by file and line. The mapping itself is read from the tracker rather than from a file in this package, so a reader re-verifying it queries NEU-895's children rather than re-reading `docs/`.
- **Handed to:**
  - **`SUB-13 (NEU-977)`**, which must read the thirteen cited locations directly rather than trusting a grep for `NEU-977`, and in particular must pick up `OI-S2-2`.
  - **`NEU-985 (SUB-11)`**, whose citation audit should resolve every `NEU-9xx` id appearing in this package against the umbrella's actual child set and report any that resolve outside it.
  - **`NEU-986 (SUB-12)`**, which reconciles the completeness gate over a package containing a known-wrong id it may not silently repair.

#### `F-S3-3` — Both operational log tables hold learner payload with no retention window, no deletion owner and no principal field

- **Id:** `F-S3-3`
- **Finding:** NEU-887's operational-log privacy gate classifies `mcp_request_log.response_body` and `mcp_request_log.params` as **learner payload** — learner-facing text and learner free-text answers, credential-redacted only — and `operation_event_log.data` as potentially payload. That gate requires every raw result and every minimized derivative to carry a **stated retention window** and a **named deletion owner**. **The codebase implements neither, for either table.** Compounding it, neither table carries any principal field, so the payload cannot be attributed to a learner even in principle.
- **Evidence:** `../C005-product-foundation/measurement-contracts/05_operational-log-privacy-gate.md:19`–`:23` (the per-column payload classification), `:37` (the retention-limit and deletion-owner requirement), `:54` (`PLA-retention`) — NEU-887, dated 2026-07-12. Against the codebase at the 2026-08-21 cutoff: `drizzle/0010_create_infrastructure_mcp_request_log.sql:1`–`:19` and `drizzle/0012_extend_mcp_request_log.sql:1`–`:6` create and extend the first table; `drizzle/0013_create_operation_event_log.sql:1`–`:16` creates the second; neither defines a retention or expiry column, and a search of `src/infrastructure/db/schema.ts` for `user_id`/`userId`/`learner_id`/`learnerId` returns zero matches. Writers are `src/transport/pg-audit-transport.ts:117` and `src/transport/pg-event-transport.ts:109`.
- **Consequence:** Two `existing` categories — `SC-S3-16` and `SC-S3-17` — hold learner payload that **cannot be deleted per learner, because there is nothing to key the deletion on**. Any ownership model `SUB-6` selects, and any authority `SUB-13` assigns, has to confront a store where the learner-scoping question is not merely unanswered but currently unanswerable. `SUB-14`'s per-row isolation test applied to these two rows has no column to test. **This finding does not fix the gap, design a retention column, or name the deletion owner** — all three are outside SUB-3's scope, which enumerates and classifies.
- **What is assumed rather than derived:** Nothing about the schema or the requirement — both are read at cited lines. What is **not** established here is whether any learner payload has in fact been written to either table in any deployment; the finding is about what the schema permits and what the gate requires, not about a measured data population.
- **Handed to:**
  - **`SUB-13 (NEU-977)`**, which assigns authority over `SC-S3-16` and `SC-S3-17` and must record that the rows are learner-payload-bearing.
  - **`SUB-14 (NEU-978)`**, which applies `SUB-5`'s isolation invariant per row and will find no column to apply it to on either.
  - **`NEU-986 (SUB-12)`**, via `CAP-S3-3`, which carries the unmet requirement to the package completeness gate.

### SUB-4

*Six entries. Two are numbers a later sub-task would otherwise inherit stale — one re-verified against `src/` under `CAP-S1-2`'s own obligation, one an internal inconsistency inside a merged sibling's file that append-only discipline forbids repairing in place. Four come out of walking the model: two hops whose authority is genuinely undetermined, one trust boundary that meets the test and that nothing enforces, and one authority that is determined only under an ownership model nobody has selected. None is a decision this sub-task declined to take.*

#### `F-S4-1` — The registered tool count is 46 across 16 modules, not the 45 the charter consumed

- **Id:** `F-S4-1`
- **Finding:** The charter's consumed figure is **45 tools (42 gated / 3 exempt)**. Counted against `src/` at this sub-task's own cutoff, the figure is **46 registered tools across 16 non-empty modules**, which with the three exempt tools makes the current split **43 gated / 3 exempt**. The divergence is one tool, in the gated half. `CAP-S1-2` obliges the sub-task that depends on the number to re-verify it against `src/` at its own cutoff and cite its own command; this entry is that re-verification.
- **Evidence:** `grep -rc "server.registerTool(" src/server/` on `origin/develop` at the **2026-08-21** cutoff returns per-file counts summing to 46 over 20 scanned files, 16 of them non-zero: session-lifecycle 4, session 1, server-context 1, analytics 3, teaching 5, remediation 1, spaced-repetition 7, query 3, topic 3, server-workflow 1, search 1, session-progress 3, server-info 1, notes 3, content 3, chunk 6; `tools.ts`, `persistence-tools.ts`, `session-management-tools.ts` and `tool-helpers.ts` register none. The three exempt tools are `init_agent_context`, `get_server_info` and `get_server_workflow`, fixed at `src/transport/context-token-middleware.ts:5`–`:9`.
- **Consequence:** Any sub-task sizing a surface, an audit or a migration from the charter's 45 sizes it one tool short, and — more importantly — sizes it against a number that has already moved once and will move again. **The count is a moving target, not a constant**, and the right treatment downstream is to re-run the command rather than to cite either figure. `SUB-8 (NEU-981)`, whose work is keyed to the tool surface, is the sub-task most exposed to inheriting a stale value.
- **What is assumed rather than derived:** Nothing about the count — it is one command over one tree at one cutoff, reported per file so it can be re-run and disagreed with. What is **not** established is that the count is stable, or that the divergence from 45 reflects a deliberate addition rather than a miscount upstream; this entry does not adjudicate which figure was right when the charter was written.
- **Handed to:**
  - **`SUB-8 (NEU-981)`**, which must re-run the command at its own cutoff rather than citing 45 or 46.
  - **`NEU-986 (SUB-12)`**, which reconciles the package against a charter figure that no longer matches the tree.

#### `F-S4-2` — `04_state-category-inventory.md` announces 41 entries and counts 45

- **Id:** `F-S4-2`
- **Finding:** The inventory's §3 heading reads *"The inventory — **41 entries**, each appearing exactly once"*, while §8's own count table totals **45** (30 `existing` + 11 `required-by-upstream` + 4 `assumed`), and the entry ids run continuously from `SC-S3-1` to `SC-S3-45`. **45 is the correct figure**; the 41 in the heading is stale. The document is internally inconsistent in the one place a reader is most likely to stop reading.
- **Evidence:** `../04_state-category-inventory.md:70` (the heading) against `:528`–`:534` (the count table) and `:194`–`:205` (`SC-S3-42` … `SC-S3-45`, the four `assumed` entries). Read on `origin/develop` at the 2026-08-21 cutoff. The §4.5 walk result and §8's per-class rows agree with 45; only the §3 heading does not.
- **Consequence:** A reader who takes the heading at face value concludes four entries are missing and either re-derives the inventory or files a spurious gap. **Nothing here is corrected in place:** `../04_state-category-inventory.md` is a merged sibling's file, the registers and topic documents are append-only, and no sub-task rewrites another's entries — so the correction is this finding, not an edit. The practical rule for every downstream reader is: **§8's table is the count; §3's heading is not.**
- **What is assumed rather than derived:** Nothing. Both figures are read at cited lines and the id range is continuous and checkable. This entry does not infer *why* the heading is stale — a late-added §3.7 is the obvious explanation and is not asserted.
- **Handed to:**
  - **`SUB-13 (NEU-977)`** and **`SUB-14 (NEU-978)`**, which iterate the entry set and must iterate 45 rows.
  - **`NEU-985 (SUB-11)`**, whose cross-cutting audit can check announced-versus-actual counts mechanically across every package document.

#### `F-S4-3` — The gate-verdict write is the one flow in the model with no authoritative side

- **Id:** `F-S4-3`
- **Finding:** Of the 22 flows in `../05_system-context-and-responsibility-boundaries.md` §5, exactly one — `FL-S4-16`, the gate verdict travelling from the authoring-time gate runner through the battery onto the unit's record — **has no named authoritative side.** It is also the one undetermined hop in the `JNY-F1` walkthrough (hop F1-5). The model records it as a finding rather than narrating past it or nominating a plausible owner.
- **Evidence:** `../05_…` §5 (`FL-S4-16`), §10.2 (hop F1-5), §10.4 (the walk result: 21 of 23 hops with a named authority). The underlying gap is `../90_open-items-and-provisional-register.md` `OI-S2-2`, whose resolving event is **SUB-13** publishing the `OUT-3` authority matrix with exactly one authority for each of the gate-verdict record, the drift-verdict store and the drift-verdict cache. Note that `OI-S2-2` names its consumer and owner as `NEU-987` — the wrong id recorded by `F-S3-2`; the owner is **SUB-13 (NEU-977)**.
- **Consequence:** A component-and-boundary model with one unattributed write is exactly as useful as one with none *provided the gap is visible*, and invisible-and-plausible is the failure mode this entry exists to prevent. Concretely: an implementation charter reading §5 and finding no authority for `FL-S4-16` must go to `OI-S2-2`, not invent one. **This sub-task does not assign the authority**; assigning it here would put two owners on one state category, which is the precise thing `OUT-3` forbids.
- **What is assumed rather than derived:** Nothing. The absence is a property of the published flow table, checkable by reading it, and the underlying open item is cited by id.
- **Handed to:**
  - **`SUB-13 (NEU-977)`**, which closes it by publishing the authority matrix, and which must reach `OI-S2-2` through `F-S3-2`'s cited locations rather than by grepping its own id.

#### `F-S4-4` — Three walked hops have an authority that is determined only under an unselected ownership model

- **Id:** `F-S4-4`
- **Finding:** Hops B1-1, B1-2 and F3-1 have a determined authoritative side **today**, under the reading in which the MCP core is the only writer of learning state. That reading is not a selected ownership model — the all-MCP-versus-hybrid selection belongs to `SUB-6 (NEU-976)` and has not been made. **If SUB-6 selects hybrid, those three hops acquire a second candidate authority** and `BND-S4-16` (web tier ↔ Postgres) turns from an undecided edge into a real boundary row.
- **Evidence:** `../05_…` §10.1 (hops B1-1, B1-2), §10.3 (hop F3-1), §4.4 (`BND-S4-16` and the constraint its resolution must satisfy), §10.4 (the rider). The state facts the today-reading rests on are `../04_state-category-inventory.md` §4.1's fourteen tables, all written from `src/adapters/drizzle/`.
- **Consequence:** The three hops must not be cited as settled authority in a document that outlives SUB-6's selection. The model states the constraint instead of the answer: **whichever way SUB-6 decides, `OUT-3` requires exactly one authority per category, so a hybrid selection owes a demonstration that the categories the web tier writes are disjoint from those the MCP core writes.** Disjointness is a condition to be demonstrated, not assumed. This entry is not an open item — `OI-S3-1` and the `OUT-3` matrix already carry the resolving event — it is the placement-side consequence of that open item, recorded where a reader of the walkthrough will hit it.
- **What is assumed rather than derived:** That the MCP core is today the only writer of the durable learning-state tables. That is read from `src/` at the 2026-08-21 cutoff and is a statement about the code as it stands, not a commitment about what SUB-6 may select.
- **Handed to:**
  - **`SUB-6 (NEU-976)`**, which selects the ownership model and, if it selects hybrid, owes the disjointness demonstration and a classified `BND-S4-16` row.
  - **`SUB-13 (NEU-977)`**, whose authority matrix is where the second candidate authority would have to be resolved.

#### `F-S4-5` — STDIO is a trust boundary nothing enforces, and all three benchmark journeys are walked across it

- **Id:** `F-S4-5`
- **Finding:** The STDIO transport edge meets the trust-boundary test — it is reachable by a principal other than the operator — and **no component enforces it.** `src/transport/main.ts:46` mounts origin checking, JWT verification, per-JWT-subject rate limiting, MCP-session-to-subject binding, the context-token gate and audit capture; the `else` branch at `:55`–`:59` connects a bare `StdioServerTransport` with none of them. The model publishes it as `BND-S4-17`, classified **trust — unenforced**, owner **nobody**. Compounding it: the three C005 benchmark journeys that have an Existing-MCP vehicle are dogfooded through a local MCP client, i.e. through exactly this edge — **so every observation made while running them is an observation of the unprotected transport.**
- **Evidence:** `src/transport/main.ts:46`, `:55`–`:59`; `src/transport/http.ts:99`–`:111` (origin allowlist), `:48`–`:65` (MCP-session-to-subject binding), `:167`–`:170` (per-JWT-subject rate limiting, mounted only when auth is enabled); `src/transport/context-token-middleware.ts` (the gate, mounted on the HTTP path). Vehicle assignment: `../C005-product-foundation/benchmark-suite/01_journey-vehicles-and-fidelity.md:62`, `:64`, `:66` (NEU-900, compiled 2026-07-11). Read at the 2026-08-21 cutoff.
- **Consequence:** Two things a later sub-task must not do. **First**, write "the tool surface is authenticated" without a transport qualifier — it is false for half the surface, which is why `DR-C10-S4-2` makes the qualifier part of the decision rather than a note. **Second**, read "the journey ran fine" as evidence about the gated path; the journeys' hypotheses are pedagogical and are untouched by this, but no protection claim can be supported by them. This is a **finding about the system as it stands**, not a design proposal: this sub-task neither hardens STDIO nor recommends removing it.
- **What is assumed rather than derived:** Nothing about the mounting — each middleware is cited at its line and the two branches are read directly. Not established: whether any deployment actually exposes the STDIO path to a principal other than the operator. The finding is about what the code permits, not about a measured exposure.
- **Handed to:**
  - **`SUB-7 (NEU-980)`**, whose web-API resource inventory and negative boundary must not assume a uniformly gated surface.
  - **`SUB-10 (NEU-984)`**, which selects the deployment shape and therefore decides whether the unenforced edge is reachable in practice.
  - **`NEU-985 (SUB-11)`**, whose audit can check mechanically that every protection claim in the package carries a transport qualifier.

#### `F-S4-6` — No component is authoritative for a per-DP-pattern mastery signal, and the journey that needs one has nowhere to read it

- **Id:** `F-S4-6`
- **Finding:** `JNY-B1`'s BM-8 half requires reading a per-DP-pattern mastery signal. Walking it across the model, that hop (B1-10) has **no authoritative side**: the durable multi-session mastery composite is `SC-S3-39`, a `required-by-upstream` category with **no store**, and no component in the twenty-component inventory holds it. C005 reached the same wall from the other direction and marked it `INC-2`, UNRESOLVED. **The gap in the state inventory and the gap in the journey are the same gap seen from two sides.**
- **Evidence:** `../05_…` §10.1 (hop B1-10), §10.4; `../04_state-category-inventory.md:175` (`SC-S3-39`, store `none`, `required-by-upstream`), and its §5.2 provenance in NEU-888's operational mastery model; `../C005-product-foundation/benchmark-suite/01_journey-vehicles-and-fidelity.md:16` (the BM-8 half is *"capability inspection only"*, `INC-2` UNRESOLVED) and `:62`. Read at the 2026-08-21 cutoff.
- **Consequence:** `JNY-B1`'s BM-8 half cannot be walked to a named authority, and a sub-task that assumed it could would have to invent either a component or a store. It also means the mastery signal is one of the categories `SUB-13`'s authority matrix must assign to a component **that does not exist yet** — which is a different and harder case than assigning an existing category, and worth flagging before the matrix is written. This entry neither designs the component nor selects a store.
- **What is assumed rather than derived:** Nothing. Both the empty store and the journey's own incompleteness marker are read at cited lines. Not asserted: that `SC-S3-39` *should* be held by any particular component — that is precisely what is undetermined.
- **Handed to:**
  - **`SUB-13 (NEU-977)`**, which must assign an authority for `SC-S3-39` and will be assigning it to a component that has to be created rather than located.
  - **`NEU-986 (SUB-12)`**, at the completeness gate, as an upstream-required category with neither a store nor a holder.
