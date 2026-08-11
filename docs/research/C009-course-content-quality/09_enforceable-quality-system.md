# The Enforceable Quality System — What Is Actually Checked, What Is Only Judged, and Who Owns the Difference

**Task:** NEU-965 (SUB-9) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-9, plus the **AI-contamination control and its probe** carved out of OUT-7 by `01_provenance-and-rights.md` §11.1 · **Compiled:** 2026-08-11 · **Verification cutoff:** 2026-08-11 (upstream inputs read at their own 2026-08-10 cutoff) · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

---

## 0. The result, stated first

**A quality system ships. It classifies 89 quality requirements from eight upstream sub-tasks on three axes, defines quarantine, fills SUB-8's three reserved slots, publishes an escalation rule and an AI-contamination control — and it names 16 requirements whose only enforcement is a human judgement that nobody performs today.**

Five statements carry the document.

1. **The classification scheme is published before it is applied** (§3), as a reusable artifact with closed vocabularies and a stated assignment rule per axis, so SUB-10, SUB-11, SUB-13 and SUB-12 self-classify without SUB-9 re-running.
2. **Every quality requirement produced by SUB-1 … SUB-8 carries a mechanism, a blocking behaviour and a placement** (§4). **Zero rows are unclassified**, and the count is stated per sub-task so the coverage is countable rather than asserted.
3. **SUB-4's provisional pre-classification is re-expressed and two of its four mechanisms are reassigned** (§5) — with a recorded reason each, and with the two axes SUB-4 deliberately left blank now filled.
4. **Quarantine is defined as a state distinct from `blocked`** (§8), on one discriminating question — *could a competent author change the unit today and have the rule evaluate to a pass?* — and SUB-8's `reason`, `owner` and `exit_condition` slots are filled from closed admissible sets. **T-13, the edge SUB-8 left undefined, is defined here.**
5. **Sixteen requirements are `AI`-judgment-only, and §11 names every one of them** with a compensating observable gate, that gate's owner, and — stated in the same row — **what the compensating gate does not catch**. Where no compensating gate can be named, the row records a cap with a named owner instead of a gate.

> **The honest summary a reader should carry away:** this document specifies gates. **It builds none.** No gate in §4 has ever run against a real content unit, because no real content unit exists (`CAP-S8-4`). The five gate-failure tests in `traceability/09_…` §3 are **desk-executed against constructed bad units**, in the `03_requirement-decision-mapping-gate.md` §4 shape, not executed by a runner. The one measurement that *was* executed measures **half of what its contract covers**, and §12 says which half. Every one of those is a cap with an owner in `91_…`, not a gap that was smoothed.

**And the thing this document refuses to do.** It does not convert a judgement into a check by describing it in mechanical words. SUB-6 refused that by name (*"a weak signal is not promoted by being restated in stronger words"*), SUB-8 refused it by name (*"a record with a verdict and no rationale is an assertion, not a review"*), and SUB-4 refused it most explicitly of all: *"This document does not invent a metric to make the depth obligation look enforceable."* **§11 is the price of that refusal, and it is a deliverable, not an apology.**

---

## 1. What this document is, and what it is not

**It is** the OUT-9 deliverable: the enforceable quality system for C009's content — the classification of every upstream quality requirement by enforcement mechanism, blocking behaviour and gate placement; quarantine's definition; the escalation rule; the AI-contamination control; and the enforcement-gap analysis. It is additionally the **AI-contamination carve-out of OUT-7**, assigned here by `01_provenance-and-rights.md` §11.1.

**It is not** an implementation, a linter, a judge, an editor, a schema migration, or a QA run. **No `src/`, `tests/`, schema or migration file is changed by this sub-task**, and §14 records that `qa-execution:engine` is unconfigured so no automated QA verdict is available to claim.

**It is not** a re-decision of anything upstream. SUB-1's rights rows, SUB-2's forms, SUB-3's procedure, SUB-4's standards, SUB-5's obligations, SUB-6's mapping, SUB-7's classes and SUB-8's states are consumed **verbatim and untranslated** — SUB-6 §11 and SUB-7 §11 each require that of this document by name, and every field name below is the upstream owner's own.

**It is not** a resolution of any sibling's deliberately-open question. `CH-F5-1`, SUB-5's three routes, and `OI-S7-1` stay open; §4 classifies **the default that is already in force** for each, and §13 states that it did so rather than picking.

---

## 2. The preconditions this sub-task consumes and does not re-decide

| Precondition | Owner | Consumed as |
| --- | --- | --- |
| Twelve sources, **all `Restricted`**; the access gate is shut for every one | SUB-1 §3 | A rights fact. §6.1's gate is specified against it and is **unexercised today**. |
| The interim stored field set is **`stable_id` + `canonical_url` only** while `CH-F5-1` is open | SUB-1 §4.1, `DR-C09-01`, `CAP-S1-2` | The binding rule every citation gate in §6.4 enforces. **Not widened here, under either disposition.** |
| **RETENTION, NOT REQUEST COUNT** for an enumerating response | SUB-1 §6 | The axis §6.2's gate is written on. A single sanctioned request is **not** a defence. |
| Ten forms, their REQUIRED field sets, the discriminative pair, the §6.3 placement matrix, the §6.4 edge discipline | SUB-2 | The field names and the shape of every `schema` gate in §4.2. |
| `V0`–`V7`, all-or-nothing, transport-invariant, idempotent; `S1`–`S4`; `X1`–`X5` | SUB-3 §5, §6 | The requirement set of §4.3 and the both-column gate of §7. |
| The four correctness standards, their **provisional, non-binding** mechanisms, and four named residues | SUB-4 §2, §3 | Re-expressed in §5. **SUB-9's assignment governs**, as SUB-4 states. |
| CL-1 dischargeable on one node; CL-2/CL-3/CL-4 empty content-side; **three routes open, Route 4 barred** | SUB-5 §5, §6 | Classified at its **existing default** (`blocked`, SUB-8 §9 case 3). Not resolved. |
| `R1`–`R5`; the six signals with one reliability class each; the §4.8 mapping; §8's refusals; §9's composition invariant | SUB-6 | The closed edge set of §4.6. **No gate here opens a gate SUB-6 closed.** |
| The triple `(structural_tier, provisional_load_index, stage_band)`; classes MD/P/X; the §4.4 inadmissible set; the §9.4 label verbatim | SUB-7 | The requirement set of §4.7 and bad unit **BU-5**. |
| Eight states, `T-01`–`T-13`, the §4.1 record field set, six roles, the three reserved slots | SUB-8 | The state machine §8 attaches quarantine's semantics to, and the record every finding lands on. |
| `MC-4 v1.0` — metric, `BOUNDING` decision rule, `PROXY-BOUNDING` label, `RA5` retained | `../C005-product-foundation/measurement-contracts/01_measurement-contract-register.md` | Cited **by id and version** in §12. **Never redefined.** |
| The composition invariant, `MM-T1`…`MM-T15`, gates A–E | `../C005-instructional-model/mastery-model/00_operational-mastery-model.md` | Consumed through SUB-6, which already checked conformance. |

---

## 3. The classification scheme — published before it is applied

**This section is the reusable artifact.** It is written so that a later sub-task classifies its own requirements without SUB-9 re-running, and so that SUB-12's completeness gate can check a self-classification against a rule rather than against SUB-9's taste.

### 3.1 The enforcement-mechanism vocabulary — a closed five-value set

**Exactly five values. There is no sixth, and `none` is not one of them.** This is the same five-value list SUB-4 pre-classified against (`04_…` §3.1), reproduced here as the definitive statement with the membership test that decides each.

| Mechanism | Membership test — the question that decides it | What it costs to run |
| --- | --- | --- |
| **`deterministic`** | *Can the verdict be recomputed from the artifact's own committed fields alone, by any reader, returning the same answer on the same bytes?* | Nothing beyond reading the artifact. |
| **`schema`** | *Is the rule expressible as a declared shape — a field set, a slot manifest, an enumerated value set — such that adding a new form or a new value changes the declaration and not the rule code?* | A published declaration the validator loads. |
| **`server-side`** | *Does deciding it require reading a record the unit does not contain* — the node record, the other units placed on the same node, a persisted review chain, a multi-session history? | Authoritative state, and a surface that owns it. |
| **`automated`** | *Does deciding it require **running** something whose output is not already written down* — executing an approach over an input, re-running a scan, re-resolving a URL, substituting a method and evaluating it? | An execution environment, and a re-run budget. |
| **`AI`** | *After the other four have each been tried and found insufficient, is there residue that only a reader's judgement decides?* | A reviewer, and time. |

**The assignment rule — weakest sufficient mechanism, first match wins.** Evaluate the five tests **in the order of the table** and assign the **first** mechanism that suffices for the requirement as stated. The order is `deterministic` → `schema` → `server-side` → `automated` → `AI`.

**Why the rule is stated as an order rather than as a judgement.** It closes both laundering directions at once:

- **Upward laundering** — assigning a requirement a stronger-sounding mechanism than it needs, so the classification table reads more mechanical than the system is. The order forbids reaching `AI` while a cheaper mechanism decides the requirement.
- **Downward laundering — the one this whole package exists to prevent.** Assigning a requirement `deterministic` or `automated` when the verdict genuinely needs a reader. The order does not permit that either, because a mechanism is assigned only if it **suffices for the requirement as stated** — not if it decides a nearby, weaker requirement that happens to be checkable. **A gate that checks something adjacent to the obligation does not discharge the obligation; it bounds it,** and §3.4 is where that distinction is recorded rather than lost.

**A requirement whose statement contains two separable obligations is split into two rows with two mechanisms**, never averaged into one. SUB-4's solution standard is the worked case (§5): slot presence is `schema`, falsifiability is `AI`, boundary confrontation is `automated`, and collapsing the three would have credited the third with catching the second.

### 3.2 The blocking-behaviour vocabulary — a closed three-value set

**Exactly three values.** SUB-4, SUB-5 and SUB-8 each declined to assign this axis and each named SUB-9 as its owner; this is the assignment.

| Behaviour | What happens to the unit | Assignment rule |
| --- | --- | --- |
| **`blocks`** | Does not advance. Terminal state `blocked` (SUB-8 §3.1) via `T-09` or `T-10`, emitting `RR-BLOCK`. | The rule's verdict is **decidable now**, and the obligation is rights-, correctness- or learner-safety-critical. |
| **`warns`** | Advances, carrying a recorded finding on the transition's review record. | The rule's verdict is decidable now, the obligation is **none** of the three critical classes, **and** a false positive is expected at the margin. |
| **`quarantines`** | Does not advance and does not fail. Terminal state `quarantined` via `T-11`, emitting `RR-QUARANTINE` with the three slots of §8.2 filled. | The rule's verdict is **not decidable now** — it needs a judgement, an artifact, or a party that does not exist at this cutoff. |

**Three rules bind the assignment, and each closes a specific escape.**

1. **No rights obligation may be assigned `warns`.** SUB-1's rules are the ones whose breach is not recoverable by a later pass, and a warning is a finding that a publisher may decline to read (see `OI-S9-16`).
2. **A requirement classified `AI` may never be assigned `blocks` on the judgement itself.** A block asserts a decided failure; an unperformed judgement has not decided anything. The *compensating observable gate* (§3.4) blocks; the residual judgement quarantines.
3. **A requirement classified `AI` with no compensating observable gate is assigned `quarantines` — never `warns`, and never nothing.** This is the rule that makes §11 load-bearing rather than decorative: an unenforceable requirement holds its units rather than passing them.

### 3.3 The two placement columns, and the exhaustiveness-not-exclusivity rule

| Column | When the gate runs | What may run there |
| --- | --- | --- |
| **authoring-time** | Any point on a unit's path from `draft` to a terminal (SUB-8 `T-01`…`T-12`), before it is available to a learner. | **The full battery.** Every mechanism is admissible; cost is paid once per unit revision. |
| **serve-time** | Each time an already-`published` unit is served to a learner. | **Exactly one gate** (§7). A serve-time gate is on a learner's latency path and may not carry a reviewer, a model call, or an execution. |

> **Exhaustiveness, not exclusivity.** **Every gate carries at least one column. A gate may carry both.** No gate carries neither — a gate with no placement is not a gate, it is an intention, and §3.5's residual clause sends the requirements under it to `blocked until classified`. The two columns are shown **exhaustive** in §7 with a stated count; a `both` entry is counted once in each column and separately as a `both`.

### 3.4 The enforcement-gap entry shape

**Every requirement classified `AI` carries one of these, in this shape, or its units are blocked until it does.**

| Field | Content | Admissible values |
| --- | --- | --- |
| **`AI-judgment-only` flag** | Whether the requirement's verdict rests on judgement after every cheaper mechanism has been tried. | `yes` / `no`. `yes` is what puts the row in §11. |
| **Compensating observable gate** | A named gate, classified on §3.1's own vocabulary, whose verdict is observable and which **bounds** the judgement — reduces its search space, catches a subset of its failures, or makes its absence visible. | A gate id from §4, or the literal **`none — cap`**. |
| **Gate owner** | The party who builds and runs the compensating gate. Never "the system", never "review". | A role from SUB-8 §4.2, a sub-task id, a named ledger owner, or **the creator**. |
| **What the gate does not catch** | The part of the obligation that survives the compensating gate. **Mandatory. A row with this cell empty is a laundered row.** | Prose, stated as a failure the gate would pass. |

**The two rules that make the shape binding:**

- **A requirement classified `AI` must carry an entry** with either a named compensating observable gate **or** the literal `none — cap` plus a **cap with a named owner** in `91_…`. **A requirement classified `AI` carrying neither is not classified**, and §3.5 governs it: its units are **blocked until it does**.
- **A compensating gate is never recorded as discharging the obligation.** It appears in §4 as a gate in its own right, with its own mechanism and blocking behaviour, and in §11 as a *bound* on a residual. The residual stays in §11 after the gate is built. Only its owner's judgement, recorded in a ledger, closes it.

### 3.5 The residual clause

> **…and any quality requirement of this package not enumerated in §4.**

**Such a requirement defaults to `blocked until classified`. It never defaults to unenforced, and it never defaults to `warns`.**

**Owned, not assumed.** The residual is **NEU-965's**. §4's enumeration is **the floor, not the boundary** — a requirement produced by a later sub-task, or discovered later in an already-landed one, is a gap this sub-task records (`OI-S9-15`), not one that disappears because eight tables look complete.

**Why `blocked` and not `quarantined`:** an unclassified requirement's verdict is not *undecidable*, it is *unasked*. Classification is a change a competent party can make today, which is exactly §8.1's `blocks` limb. Routing unclassified requirements into quarantine would fill the state whose whole purpose is holding what nobody can decide with things somebody simply has not decided yet.

**How a later sub-task discharges the clause.** It classifies its own requirements in §3.6's row shape, in its own topic document, citing this section. **A sub-task that produces no quality requirement records an empty table with the stated words `none produced`** — so SUB-12's completeness gate can tell *"none"* from *"not done"*, which are the two states an absent table is ambiguous between.

### 3.6 The row shape a later sub-task fills

| Id | Requirement, in the owner's own words | Mechanism | Blocking behaviour | Placement | Gate id | `AI-judgment-only`? |
| --- | --- | --- | --- | --- | --- | --- |
| `EQ-S<n>-k` | verbatim, never paraphrased into a weaker or stronger claim | one of §3.1's five | one of §3.2's three | `authoring-time` / `serve-time` / `both` | `G-…` | `yes` → an §3.4 entry is mandatory |

**Id namespacing** follows the shared registers' own convention: each sub-task ids its own rows `EQ-S<n>-k`, so two sub-tasks classifying concurrently can never collide and no sub-task renumbers another's.

---

## 4. The classification tables — every requirement from SUB-1 … SUB-8

**Coverage rule applied to every table below:** one row per separable obligation; the requirement stated in the upstream owner's own words; **no cell empty**. A requirement whose statement contains two separable obligations appears as two rows (§3.1).

### 4.1 SUB-1 — provenance and rights (`01_…`) · **14 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S1-1` | The source's SUB-1 access-permission row is read before the first request on any path; a `Restricted` source is not fetched (§3, §3.1) | `deterministic` | `blocks` | authoring-time | `G-ACCESS-GATE` |
| `EQ-S1-2` | No retained problem list, ordering, or curation — *"may record that a source has N problems; may not record which N"* (§2) | `automated` | `blocks` | authoring-time | `G-ENUM-SCAN` |
| `EQ-S1-3` | No problem statement text, in any of the four modes — stored, mirrored, paraphrased into storage, generated (§5) | `automated` | `blocks` | authoring-time | `G-NOTEXT-SCAN` |
| `EQ-S1-4` | The scan's residual: *no sentence anywhere is a semantic paraphrase of a protected statement* (§5.1 stated limitation, `CAP-S1-5`) | **`AI`** | `quarantines` | authoring-time | `none — cap` · `OI-S9-5` |
| `EQ-S1-5` | A problem reference stores `stable_id` and `canonical_url` **and nothing else** while `CH-F5-1` is open (§4.1) | `schema` | `blocks` | authoring-time | `G-FIELDSET` |
| `EQ-S1-6` | No artifact, fixture, snapshot, cache or commit carries a serialised enumerating response or a candidate shortlist (§6, detection method) | `automated` | `blocks` | authoring-time | `G-ENUM-SCAN` |
| `EQ-S1-7` | An enumerating response is **not retained in an agent's persisted context** beyond the resolution it was fetched for (§6) | **`AI`** | `quarantines` | authoring-time | `none — cap` · `OI-S9-6` |
| `EQ-S1-8` | Every stored problem reference carries its source and canonical URL, so an exported record can never become an unattributed one (§7.2 item 2) | `schema` | `blocks` | authoring-time | `G-ATTRIB-RECORD` |
| `EQ-S1-9` | No rights position is claimed from an access path; none of §7.3's five arguments appears anywhere (§7.3, MAY NEVER 5) | **`AI`** | `quarantines` | authoring-time | `G-RIGHTS-CITE` · `OI-S9-7` |
| `EQ-S1-10` | **MAY NEVER 1** — no artifact asserts a problem id with no corresponding dated resolution record in SUB-3's verification record (§8) | `server-side` | `blocks` | authoring-time | `G-CITE-RESOLVE` |
| `EQ-S1-11` | **MAY NEVER 2** — no artifact or document writes "verified", "fetched", "confirmed" or a verification date against a source no request was made to (§8) | `deterministic` | `blocks` | authoring-time | `G-FETCH-CLAIM` |
| `EQ-S1-12` | **MAY NEVER 6** — no class-7 `[future-real-user]` claim appears anywhere; class 7 does not exist in this program (§8) | `deterministic` | `blocks` | authoring-time | `G-CLASS7` |
| `EQ-S1-13` | **MAY NEVER 7** — generated content is never presented as a source's, nor a source's as our own (§8) | **`AI`** | `quarantines` | authoring-time | `G-GENLABEL` · `OI-S9-7` |
| `EQ-S1-14` | **MAY 5** — a refusal (`REFUSED — not verifiable`) is a success of the policy, never a defect of the artifact (§8) | `deterministic` | **`warns`** | authoring-time | `G-REFUSAL-OK` |

**`EQ-S1-14` is the package's one deliberate `warns`,** and it is a `warns` in the *inverted* direction: the gate exists to stop another gate from failing a refusal, and records the refusal so `92_…` can count refusals rather than lose them. It is not a rights obligation, so §3.2 rule 1 does not reach it.

### 4.2 SUB-2 — content and exercise forms (`02_…`) · **9 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S2-1` | Every form instance carries its form's REQUIRED fields, present and non-empty (§3) | `schema` | `blocks` | authoring-time | `G-FORM-REQUIRED` |
| `EQ-S2-2` | Every one of the **seven discriminative forms** carries the REQUIRED pair `misconception_or_edge_case` + `separating_distractor_or_boundary_input`; *"a submission that omits either is rejected by the form definition itself"* (§4) | `schema` | `blocks` | authoring-time | `G-PAIR` |
| `EQ-S2-3` | A node instantiates every form its `skill_type` marks **R** in the §6.3 placement matrix | `server-side` | `blocks` | authoring-time | `G-PLACEMENT` |
| `EQ-S2-4` | Root nodes require lesson, retrieval and assessment at minimum and are frozen — no form proposes altering one (§6.3) | `server-side` | `blocks` | authoring-time | `G-PLACEMENT` |
| `EQ-S2-5` | Boundary anchors take **no** forms; authoring content for an anchor to "complete" a chain is prohibited exactly as faking a terminal is (§6.3) | `server-side` | `blocks` | authoring-time | `G-ANCHOR` |
| `EQ-S2-6` | `prerequisite_recall` reads `prerequisites.*`; an edge is never inferred from endpoint cluster spans (§6.4 — the span reading reports **223 false positives**) | `deterministic` | `blocks` | authoring-time | `G-EDGE-FIELD` |
| `EQ-S2-7` | `problem-reference` is fillable only in its interim shape; the four wider fields are **NOT-YET-STORABLE** and appear in no template (§5.1, §5.2) | `schema` | `blocks` | authoring-time | `G-FIELDSET` |
| `EQ-S2-8` | No form describes the graph order as an evidence-backed teaching order — a prerequisite edge is a **structural** claim (`R1`, non-downgradable **High**) (§6.4) | **`AI`** | `quarantines` | authoring-time | `G-R1-LABEL` · `OI-S9-11` |
| `EQ-S2-9` | `example.problem_ref` is *"never an inline invented problem"*; no artifact fabricates a problem to fill a slot (`C2` / `EXC-1`) | `deterministic` | `blocks` | authoring-time | `G-CITE-RESOLVE` |

### 4.3 SUB-3 — citation verification and access paths (`03_…`) · **16 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S3-1` | **`V0`** — the access-gate check precedes any request; a `Restricted` row stops the source (§5) | `deterministic` | `blocks` | authoring-time | `G-ACCESS-GATE` |
| `EQ-S3-2` | **`V1`** — the candidate was selected by §6's criteria against a named graph node **before** any request; a candidate sourced from a response is not repairable (§5) | `server-side` | `blocks` | authoring-time | `G-PRESELECT` |
| `EQ-S3-3` | **`V2`** — exactly one call on path (1) or one targeted fetch on path (2); no enumeration, crawl or corpus walk; robots and stated rate limits honoured (§5) | `automated` | `blocks` | authoring-time | `G-TRANSPORT` |
| `EQ-S3-4` | **`V3`** — the stable id resolves live, at a stated date, to a real problem at that source (§5) | `automated` | `blocks` | authoring-time | `G-CITE-RESOLVE` |
| `EQ-S3-5` | **`V4`** — the canonical URL resolves to that same problem and the id and URL agree; *"a disagreeing pair is worse than a missing one"* (§5) | `automated` | `blocks` | **both** | `G-DRIFT` |
| `EQ-S3-6` | **`V5`** — title and constraints match the selection record, read **only to confirm the match**; nothing from the page is stored, mirrored or paraphrased (§5) | `automated` | `blocks` | authoring-time | `G-MATCH` |
| `EQ-S3-7` | **`V6`** — a difficulty signal is captured as a dated verification observation, **never as a stored citation field** while `CH-F5-1` is open (§5) | `schema` | `blocks` | authoring-time | `G-FIELDSET` |
| `EQ-S3-8` | **`V7`** — the rights disposition is re-read **after** resolution and **independently of** it; no inference from a 200, an absent `robots.txt`, or a public response (§5) | `deterministic` | `blocks` | authoring-time | `G-RIGHTS-CITE` |
| `EQ-S3-9` | The procedure is **all-or-nothing**: seven PASSes or the candidate is out. **Zero unverified entries are admitted** (§5.1) | `deterministic` | `blocks` | authoring-time | `G-V-ALL` |
| `EQ-S3-10` | The procedure is **idempotent**: re-running it at a later date against the same seed set reproduces the same verdicts, or the difference is a finding (§5.1) | `automated` | `blocks` | **both** | `G-DRIFT` |
| `EQ-S3-11` | **`S1`** — the problem exercises the node's technique **as its defining difficulty**, not incidentally and not as one step of a harder composite (§6.1) | **`AI`** | `quarantines` | authoring-time | `G-DEPTH-BOUND` · `OI-S9-8` |
| `EQ-S3-12` | **`S2`** — the node is named and exists in the map, in one of CL-1…CL-4 (§6.1) | `server-side` | `blocks` | authoring-time | `G-NODE-EXISTS` |
| `EQ-S3-13` | **`S3`** — the problem's prerequisites are at or below the node's own prerequisite depth (§6.1) | `server-side` | `blocks` | authoring-time | `G-DEPTH-BOUND` |
| `EQ-S3-14` | **`S4`** / **`X3`** — the source is one of `C1`–`C6`, its rights row read first; a node in the **10 `INC-C1`** techniques has no node to source against (§6.1, §6.2) | `deterministic` | `blocks` | authoring-time | `G-SOURCE-SET` |
| `EQ-S3-15` | **`X1`** — the candidate's origin is not a returned list, ranking or "recommended set", including one returned by a sanctioned request; *"it cannot be cured after the fact"* (§6.2) | `server-side` | `blocks` | authoring-time | `G-PRESELECT` |
| `EQ-S3-16` | **`X2`** / **`X4`** — the problem's difficulty is not dominated by material the map does not own; the citation does not require the statement to be stored to be useful (§6.2) | **`AI`** | `quarantines` | authoring-time | `G-NOTEXT-SCAN` · `OI-S9-8` |

### 4.4 SUB-4 — correctness standards (`04_…`) · **11 rows**

The four standards are re-expressed in full in **§5**; these rows are the classification, one per separable obligation.

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S4-1` | **Explanation, field floor** — `applies_when`, `does_not_apply_when`, `prerequisite_recall`, `claim_citations` present and non-empty; `prerequisite_recall` resolves; every `claim_citations` slot holds a citation or `REFUSED — not verifiable` (§2.1c) | `schema` | `blocks` | authoring-time | `G-LESSON-FLOOR` |
| `EQ-S4-2` | **Explanation, restatement check** — `does_not_apply_when` is not `applies_when` modulo a leading negation token (§2.1c) | `deterministic` | **`warns`** | authoring-time | `G-RESTATE` |
| `EQ-S4-3` | **Explanation, depth obligation** — *"a learner holding exactly the node named in `prerequisite_recall` can reconstruct the applicability decision in both directions from the explanation alone"* (§2.1b, `OI-S4-4`) | **`AI`** | `quarantines` | authoring-time | `G-UNDEF-TERM` · `OI-S9-1` |
| `EQ-S4-4` | **Solution, slot presence** — `reasoning` carries a named `invariant` slot (§2.2c, `OI-S4-1`) | `schema` | `blocks` | authoring-time | `G-INVARIANT-SLOT` |
| `EQ-S4-5` | **Solution, falsifiability** — the `invariant` slot names a condition some concrete input class could violate; *"an invariant no input can violate is a tautology dressed as an argument"* (§2.2b) | **`AI`** | `quarantines` | authoring-time | `G-BOUNDARY` · `OI-S9-3` |
| `EQ-S4-6` | **Solution, boundary confrontation** — the approach, run over the `separating_distractor_or_boundary_input` of **every `test` instance placed on the same node**, produces that test's `expected_behavior` (§2.2c) | `automated` | `blocks` | authoring-time | `G-BOUNDARY` |
| `EQ-S4-7` | **Solution, conditional complexity** — `complexity_claim` present for a node whose skill type is `optimization` or `implementation` (§2.2a, `OI-S4-2`) | `server-side` | `blocks` | authoring-time | `G-COMPLEXITY-COND` |
| `EQ-S4-8` | **Proof, slot presence** — all three of `optimal_substructure`, `overlapping_subproblems`, `recurrence_justification` present, non-empty, and pairwise distinct inside `argument` (§2.3c; distinctness is a **gate-design decision**, §5.3) | `schema` | `blocks` | authoring-time | `G-ARGUMENT-SLOTS` |
| `EQ-S4-9` | **Proof, closure link** — the instance in `separating_distractor_or_boundary_input` names a case label appearing in `recurrence_justification` (§2.3c — *"the gap-catcher"*) | `deterministic` | `blocks` | authoring-time | `G-CLOSURE-LINK` |
| `EQ-S4-10` | **Proof, exchange-step soundness** — whether replacing the sub-part with a better one *would* contradict the optimality of the whole (§2.3b; residue named in §3.2) | **`AI`** | `quarantines` | authoring-time | `G-EXCHANGE-SLOT` · `OI-S9-2` |
| `EQ-S4-11` | **Test, set-level coverage** — the node's `test` set contains at least one `kind: edge` **and** at least one `kind: misconception`; a `REFUSED` test counts toward neither (§2.4b, §2.4c) | `server-side` | `blocks` | authoring-time | `G-TEST-COVERAGE` |

**Two further SUB-4 obligations are classified in other tables** because their owner is elsewhere: the per-instance `kind:` label check is `G-FORM-REQUIRED`'s (`EQ-S2-1`, `schema`), and *whether the named misconception is one a learner actually holds* is SUB-6's design question, carried as `OI-S9-4` and classified at `EQ-S6-6`.

### 4.5 SUB-5 — per-cluster conceptual obligation (`05_…`) · **5 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S5-1` | A unit authored against a `conceptual` obligation in **CL-2, CL-3 or CL-4** has no attachment point and lands in `blocked` (§5; SUB-8 §9 case 3) | `server-side` | `blocks` | authoring-time | `G-NODE-EXISTS` |
| `EQ-S5-2` | **Route 4 is barred** — no existing candidate is retyped to `conceptual` locally; a reclassification is a `D-S1` challenge in the owning ledger, never a local retype (§6) | `deterministic` | `blocks` | authoring-time | `G-NO-RETYPE` |
| `EQ-S5-3` | The **10 `INC-C1`** techniques have no nodes; no artifact implies coverage of them (§9, `F-939-A`, `F-939-B`) | `server-side` | `blocks` | authoring-time | `G-INC-C1` |
| `EQ-S5-4` | The residual clause (`OI-S5-5`) — a cluster member whose conceptual obligation §4 does not enumerate is recorded, not absorbed; **cluster-level completeness is not member-level completeness** (§10) | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` |
| `EQ-S5-5` | Whether a candidate node's acquisition is a **genuine S8 residual** under the `D-S1` cascade (§6, route 1) | **`AI`** | `quarantines` | authoring-time | `none — cap` · `OI-S9-9` |

**`EQ-S5-5` classifies the default, not the choice.** SUB-5 left three routes open and deliberately unchosen, and SUB-8 restated them as `OI-S8-3`. This document **does not choose among them** and does not need to: the classification is of the state that is in force today, and that state is `blocked` by `EQ-S5-1`. §13 records the refusal.

### 4.6 SUB-6 — assessment evidence out of band (`06_…`) · **12 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S6-1` | **`R1`** — `self_report_outcome` has an **empty** may-feed list; no gate is reachable from it, alone or in combination (§4.1) | `deterministic` | `blocks` | authoring-time | `G-EDGE-SET` |
| `EQ-S6-2` | **`R2`** — only in-app artifacts the system owns are gate-bearing: `pasted_solution`, `retrieval_item_result`, `assessment_item_result` (§4) | `deterministic` | `blocks` | authoring-time | `G-EDGE-SET` |
| `EQ-S6-3` | **`R3` / §5.2 condition 3** — a gate-bearing item probes at least one of the three required edge cases: empty/degenerate input, the base case, the boundary at which the recurrence stops holding (§5.3) | `deterministic` | `blocks` | authoring-time | `G-EDGECASE-SET` |
| `EQ-S6-4` | **§5.2 conditions 2 and 4** — substituting the named misconception's method into the item on the named input does **not** produce the `expected_response` or credit the same rubric criteria (§5.2) | `automated` | `blocks` | authoring-time | `G-DISCRIMINATION` |
| `EQ-S6-5` | **§5.2 condition 1** — `misconception_or_edge_case` names a **specific wrong model**, not a category; *"misunderstanding the algorithm"* fails (§5.2) | **`AI`** | `quarantines` | authoring-time | `G-DISCRIMINATION` · `OI-S9-10` |
| `EQ-S6-6` | Whether the named misconception is one a **learner actually holds** (SUB-4 §3.2, routed to SUB-6's design) | **`AI`** | `quarantines` | authoring-time | `G-DISCRIMINATION` · `OI-S9-4` |
| `EQ-S6-7` | **`R4`** — the evidence record's identity is `node_id` + `skill_type` + `learner_id` + `session_ref` + `observed_at`; `citation` is OPTIONAL/REPLACEABLE and **never any part of the key** (§6.1) | `schema` | `blocks` | authoring-time | `G-RECORD-KEY` |
| `EQ-S6-8` | **`R5`** — Gate E / `MM-T15` and Gate D / `MM-T11`,`MM-T12` are not openable on out-of-band evidence; Gate C / `MM-T8` is not openable **directly** by any signal (§8) | `deterministic` | `blocks` | authoring-time | `G-EDGE-SET` |
| `EQ-S6-9` | `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7` are preconditions on the grading system and are **fed by no signal** (§4.0, §8.4) | `deterministic` | `blocks` | authoring-time | `G-EDGE-SET` |
| `EQ-S6-10` | Every observation carries **exactly one** `signal` and one `reliability_class`; no signal is class 7; a non-feeding signal cannot acquire a gate by composition (§3.4, §9) | `schema` | `blocks` | authoring-time | `G-CLASS-ONE` |
| `EQ-S6-11` | **§3.3** — an unenumerated signal is class `unclassified`, may-feed empty, and becomes gate-bearing only by amendment in `06_…`, **never by being used** (`OI-S6-1`) | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` |
| `EQ-S6-12` | **§10 / `P5` / `EX6`** — no finding, log line or gate payload carries a raw learner payload; `src/shared/logger.ts` does **not** redact learner `response`, so each gate states its own exclusion (`OI-S6-5`) | `schema` | `blocks` | authoring-time | `G-NO-LEARNER-TEXT` |

### 4.7 SUB-7 — difficulty calibration (`07_…`) · **10 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S7-1` | `calibrated_difficulty(n)` is published as the **labelled triple** `(structural_tier, provisional_load_index, stage_band)`, never collapsed to a scalar (§5.1, §5.2) | `schema` | `blocks` | authoring-time | `G-CALIB-SHAPE` |
| `EQ-S7-2` | Every input carries **exactly one** class — MD, P or X — as mandatory provenance travelling into every downstream artifact (§4) | `schema` | `blocks` | authoring-time | `G-CLASS-ONE` |
| `EQ-S7-3` | **A provisional input is never re-classed upward** by any pass; agreement with an external rating raises no class (§4, §5.4 step 4) | `deterministic` | `blocks` | authoring-time | `G-CLASS-MONO` |
| `EQ-S7-4` | `entry_gate` appears **nowhere** as an independent signal — not a dimension, not a tie-break, not a stratifier, not a validation input (`F-943-3`, §4.3) | `deterministic` | `blocks` | authoring-time | `G-NO-ENTRYGATE` |
| `EQ-S7-5` | The four **inadmissible** inputs — percentile, cohort/band/quantile, difficulty distribution, ranking against a returned set — appear nowhere; **inadmissible, not missing** (§4.4, `RS-4`) | `deterministic` | `blocks` | authoring-time | `G-INADMISSIBLE` |
| `EQ-S7-6` | The external rating is a **cross-check on the ordering, never a summand**; a disagreement is recorded as a finding with both values and both dates (§5.4) | `deterministic` | `blocks` | authoring-time | `G-XCHECK-ROLE` |
| `EQ-S7-7` | A class-X value resolves to a **dated verification observation** with its date and access path; no rating is invented, estimated or recalled (§5.4 step 1, §9.3) | `server-side` | `blocks` | authoring-time | `G-RATING-PROV` |
| `EQ-S7-8` | Every calibrated output produced at this cutoff carries the **§9.4 label verbatim**: `no external cross-check` … (§9.2 item 3 — *"Not some — all 179"*) | `deterministic` | `blocks` | authoring-time | `G-CALIB-LABEL` |
| `EQ-S7-9` | Where triples are equal the nodes are **incomparable**; no tie-break is invented (§5.3) | `deterministic` | `blocks` | authoring-time | `G-CALIB-SHAPE` |
| `EQ-S7-10` | **PLI's equal weighting is declared, not measured** (`PR-7`); whether the five dimensions contribute equally, and whether the six-dimension set is the right set (`OI-S7-1`) | **`AI`** | `quarantines` | authoring-time | `G-CALIB-LABEL` · `OI-S9-11` |

### 4.8 SUB-8 — authoring workflow and the in-situ loop (`08_…`) · **12 rows**

| Id | Requirement | Mech. | Blocking | Placement | Gate |
| --- | --- | --- | --- | --- | --- |
| `EQ-S8-1` | Every transition emits a review record carrying **all** of §4.1's ten common fields; *"a record missing one is not a review record"* | `schema` | `blocks` | authoring-time | `G-RECORD-SHAPE` |
| `EQ-S8-2` | `evidence_class` is **exactly one** of NEU-887's classes, with its structural limitation carried. **Never two. Never class 7** (§4.1) | `schema` | `blocks` | authoring-time | `G-CLASS-ONE` |
| `EQ-S8-3` | `verdict` is one of the closed set `pass` · `revise` · `block` · `quarantine` · `reopen`; `rationale` is non-empty (§4.1) | `schema` | `blocks` | authoring-time | `G-RECORD-SHAPE` |
| `EQ-S8-4` | **An author may not review their own unit** in T-03, T-05, T-07, T-08, T-09 or T-11 — `reviewer_identity` ≠ the unit's author (§4.2) | `server-side` | `blocks` | authoring-time | `G-SELF-REVIEW` |
| `EQ-S8-5` | **The storage ceiling** — no review record of any type stores problem statement text, a title, constraints, a difficulty rating, or any citation field beyond `stable_id` + `canonical_url` (§4.3) | `schema` | `blocks` | authoring-time | `G-FIELDSET` |
| `EQ-S8-6` | `RR-CORRECT` carries `standard` and `mechanism`, **copied, never re-derived** — and, after this document, copied from **§5's governing assignment** (§4.3; see §5.5) | `deterministic` | `blocks` | authoring-time | `G-RECORD-SHAPE` |
| `EQ-S8-7` | `RR-CITE` carries `verification_step_reached` and `citation_ref`, or the literal `none — gate`; **`none — gate` is a real recorded value, not a blank** (§4.3) | `schema` | `blocks` | authoring-time | `G-RECORD-SHAPE` |
| `EQ-S8-8` | `RR-QUARANTINE` carries `reason`, `owner`, `exit_condition` — **present**, and after §8.2 **populated from the admissible sets** (§5) | `schema` | `blocks` | authoring-time | `G-QUARANTINE-SLOTS` |
| `EQ-S8-9` | The §9 residual — an unenumerated unit or judgement defaults to **`blocked`**, never to `published` (`OI-S8-1`) | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` |
| `EQ-S8-10` | Transitions the §6 rubric resolves to **human** (T-05 for the Explanation standard, T-08, T-09, T-10, T-11, T-12) are performed by a human, recorded in `reviewer_identity` (§6.3) | `server-side` | `blocks` | authoring-time | `G-HUMAN-REQUIRED` |
| `EQ-S8-11` | A creator judgement is filed **only** as a `CR-1` candidate entry in the schema decision ledger, classed **3 `[dogfooding]`** with its provenance triple; recording it in a node's YAML, a README, a session note or a commit message is a workflow failure (§7, §8) | `automated` | `blocks` | authoring-time | `G-MISFILING` |
| `EQ-S8-12` | Whether the §6 human/agent allocation is **correct** — the rubric is a rule, and *"no measurement supports any of them"* (`OI-S8-5`, owner assigned to SUB-9) | **`AI`** | `quarantines` | authoring-time | `G-ESCALATION-COUNT` · `OI-S9-13` |

### 4.9 Coverage roll-up

| Sub-task | Rows | of which `AI` | of which `blocks` | `warns` | `quarantines` |
| --- | --: | --: | --: | --: | --: |
| SUB-1 | **14** | 4 | 9 | 1 | 4 |
| SUB-2 | **9** | 1 | 8 | 0 | 1 |
| SUB-3 | **16** | 2 | 14 | 0 | 2 |
| SUB-4 | **11** | 3 | 7 | 1 | 3 |
| SUB-5 | **5** | 1 | 4 | 0 | 1 |
| SUB-6 | **12** | 2 | 10 | 0 | 2 |
| SUB-7 | **10** | 1 | 9 | 0 | 1 |
| SUB-8 | **12** | 1 | 11 | 0 | 1 |
| **Total** | **89** | **15** | **72** | **2** | **15** |

**Zero rows are unclassified.** Every row carries a mechanism, a blocking behaviour and a placement. **Fifteen rows are classified `AI`**; §11 carries **sixteen** enforcement-gap entries — the sixteenth (`OI-S9-15`) is the meta-residual that the classification itself is one unreviewed pass, which is not a row in §4 because it is not a requirement of an upstream sub-task.

**Mechanism distribution, stated so the shape of the system is legible rather than flattering:** `deterministic` 28 · `schema` 20 · `server-side` 15 · `automated` 11 · `AI` 15 — **89**. **One row in six is a judgement.** That is the number the rest of this document is about.

---

## 5. SUB-4's provisional pre-classification, re-expressed

SUB-4 §3.1 states the terms of this re-expression in its own words: *"**SUB-9 (NEU-965) re-expresses it in the published scheme, may reassign any mechanism with a recorded reason, and SUB-9's assignment is the one that governs.** Nothing in or around this table asserts a gate, a severity, a behaviour on failure, or a placement — **SUB-9 owns both of those axes and SUB-4 assigns neither**."*

### 5.1 The four standards, with verdicts and reasons

| Standard | SUB-4 proposed | **SUB-9 governing** | Verdict | Recorded reason | **Blocking behaviour** (SUB-9) | **Placement** (SUB-9) |
| --- | --- | --- | --- | --- | --- | --- |
| **Explanation** (`lesson`) | `AI` | **`AI`** | **CONFIRMED** | Every cheaper mechanism was tried against the depth obligation as stated and each is insufficient: the field floor is a *different* requirement (`EQ-S4-1`, `schema`), the restatement check reaches only one sentence pair, and no `server-side` or `automated` procedure decides *"can a learner holding exactly this prerequisite reconstruct the applicability decision in both directions."* §3.1's order therefore reaches `AI`. | **`quarantines`** on the depth obligation; the field floor beneath it **`blocks`** | authoring-time |
| **Solution** (`solution`) | `automated` | **`automated`** | **CONFIRMED at standard level, split into three rows** | Boundary confrontation — the check SUB-4 itself calls *"the one that matters"* — requires **running** the approach over the node's boundary inputs, which is `automated` by §3.1's fourth test. The other two checks are separable obligations and take their own mechanisms (`EQ-S4-4` `schema`, `EQ-S4-5` `AI`); collapsing them would have credited boundary confrontation with catching a tautological invariant, which SUB-4 explicitly does not claim. | **`blocks`** (`EQ-S4-4`, `EQ-S4-6`); **`quarantines`** (`EQ-S4-5`) | authoring-time |
| **Proof** (`proof`) | `schema` | **`deterministic`** | **REASSIGNED** | §3.1's assignment rule takes the **weakest sufficient** mechanism, first match wins, and `deterministic` precedes `schema`. The check that carries this standard is the **closure link** — SUB-4's own *"gap-catcher"* — and it is a pure function of two of the artifact's own committed fields (`separating_distractor_or_boundary_input` against the case labels in `recurrence_justification`). No declaration is loaded to decide it. `schema` remains correct for the *weaker* half, slot presence, which is `EQ-S4-8`'s own row. **The reassignment is downward in cost and upward in strength, and it is recorded rather than silently applied.** | **`blocks`** (`EQ-S4-8`, `EQ-S4-9`); **`quarantines`** (`EQ-S4-10`) | authoring-time |
| **Test** (`test`) | `deterministic` | **`server-side`** | **REASSIGNED** | SUB-4 §2.4c states the obligation exactly: *"Coverage is a property of the set, not of the instance … a count of distinct labels across the node's `test` instances."* **The set is not in the artifact.** Deciding it requires reading the other units placed on the same node, which is §3.1's third test verbatim. `deterministic` remains correct for the per-instance `kind:` label check, which is `EQ-S2-1`'s row under `G-FORM-REQUIRED`. **This reassignment matters practically:** a validator that classified coverage `deterministic` would pass every node's first `test` instance and never fire. | **`blocks`** | authoring-time |

**Two confirmed, two reassigned.** Neither reassignment changes a standard, a field, or an obligation — SUB-4's standards are consumed verbatim. Both change *which surface must own the check*, which is precisely the axis SUB-4 declared provisional and non-binding.

### 5.2 The two axes SUB-4 left unassigned, now assigned

**Blocking behaviour.** Three of the four standards' primary checks **block**: they are correctness-critical and their verdicts are decidable now. The explanation standard's depth obligation **quarantines**, per §3.2 rule 2 — a block asserts a decided failure, and an unperformed judgement has decided nothing. The one `warns` in the SUB-4 set is `EQ-S4-2`, the restatement check, which SUB-4 itself marks *"no (string-level), yes at the margin"*: a string-level negation test has an expected false-positive rate at the margin and the obligation is not rights-critical, which is §3.2's `warns` rule exactly.

**Placement.** All four standards are **authoring-time**. None is serve-time: each requires either the node's other units (`EQ-S4-6`, `EQ-S4-7`, `EQ-S4-11`), an execution (`EQ-S4-6`), or a reviewer (`EQ-S4-3`, `EQ-S4-5`, `EQ-S4-10`) — and §3.3 bars all three from a learner's latency path.

### 5.3 The one gate-design decision SUB-9 adds, declared as an addition

`EQ-S4-8` requires the three `argument` slots to be **pairwise distinct** as well as present and non-empty. **SUB-4 does not state that requirement**, and this document does not claim it does. It is a **gate-design decision**, admissible because SUB-4 assigned gates to SUB-9 in as many words, and it exists for one reason: without it, the cheapest way to clear a slot-presence check is to paste one slot's text into another, and `traceability/09_…` §3 bad unit **BU-3** demonstrates exactly that evasion. The reason is recorded here so the addition is legible to SUB-4's owner rather than discovered in a validator.

### 5.4 The four `AI-judgment-only` residues SUB-4 handed over

All four are carried into §11 with a compensating observable gate, an owner, and a statement of what the gate does not catch: the explanation depth obligation (`OI-S9-1`), the proof exchange step (`OI-S9-2`), whether the stated invariant is the right one (`OI-S9-3`), and whether the named misconception is one a learner holds (`OI-S9-4`). **None of the four is described anywhere in this document as enforced, gated or blocking** — SUB-4 §3.2 imposes that discipline and it is kept.

### 5.5 One consequence for SUB-8, stated rather than left to be discovered

SUB-8 §4.3 requires `RR-CORRECT.mechanism` to be *"copied from SUB-4, never re-derived"*. **Two of those values have now changed** (Proof `schema` → `deterministic`; Test `deterministic` → `server-side`). The rule is unchanged in substance — the field is still copied and never re-derived — but its **source of truth is §5.1 of this document**, because SUB-4's own table declares itself provisional and non-binding and names SUB-9's assignment as governing. Recorded as `OI-S9-17` with SUB-8's owner named, so the change is a filed reconciliation rather than a silent divergence between two merged files.

---

## 6. The access hierarchy, retention, and the request budget

### 6.1 The access-hierarchy gate — specified against the per-source resolved-path record

**`G-ACCESS-GATE`** · mechanism `deterministic` · **`blocks`** · authoring-time.

The gate reads **the per-source resolved-path record** — `traceability/03_access-path-and-verification-record.md`, one row per source per attempted path, each dated, each carrying the path the source finally resolved through (SUB-3 §9.1). For a unit carrying a `problem-reference`, the gate evaluates:

| # | Condition | Verdict on failure |
| --- | --- | --- |
| 1 | The cited source has a resolved-path row, dated at or before the unit's citation date. | **BLOCK** — an undated or absent row is an unresolved citation. |
| 2 | The row's `access disposition` in `01_…` §3 is not `Restricted` at that date. | **BLOCK** — SUB-3 §5 `V0`. |
| 3 | The row's recorded resolution path is **path (1)** or **path (2)**, and not `none — gate`. | **BLOCK.** |
| 4 | The row records **exactly one request** for this citation's resolution. | **BLOCK** — more than one request for one citation is `V2` failure. |
| 5 | The row's resolution did **not** originate in an enumeration, a crawl, or a corpus walk. | **BLOCK.** |
| 6 | The unit's candidate-selection record predates the request and names a graph node (`V1`, `X1`). | **BLOCK** — *"a candidate sourced from a response is not repairable by re-selecting it afterwards."* |

**Two properties are load-bearing and are stated rather than inferred**, mirroring SUB-3 §3:

- **The gate precedes both paths.** A source failing condition 2 has **no reachable branch**. It is not "try the other path"; it is a cap with a named owner.
- **Failure never widens the method.** No condition's failure is clearable by a bulk method, and no schedule pressure converts condition 2 into a licence.

**Blocking behaviour, and when it is `quarantines` instead.** Conditions 1–6 all `blocks`, with **one exception**: where condition 2 fails because the source's row reads `Restricted` **by default** (terms unestablished, `OI-S1-1`…`OI-S1-12`) rather than by a read refusal, the unit **quarantines** with `reason: absent-decider` — because no author can revise the unit into a pass, and the party who can (SUB-1's re-verification pass) is named. This is §8.1's discriminating question applied literally, and today **it fires for all twelve sources**.

### 6.2 The retention gate — classified on retention, not on request count

**`G-ENUM-SCAN`** · mechanism `automated` · **`blocks`** · authoring-time.

> **The axis is SUB-1 §6's, verbatim: RETENTION, NOT REQUEST COUNT.**

The gate blocks or quarantines any unit whose record shows an enumerating response was **stored, cached, transcribed, mirrored, re-published, or used to select or rank candidates.** Detection is SUB-1 §6's own method, run as a gate rather than as a report: three-or-more sibling rows or list items each carrying a problem identifier or a problem-level URL of one of the twelve sources; a stored table pairing problem ids with ratings, tags or titles; a serialised API response body in any file, fixture, snapshot or cache; any file whose content is a candidate shortlist.

**A single sanctioned request is explicitly not a defence.** SUB-1 states the reason and this gate inherits it: *"one request is not one list, and a rule that counts requests says nothing about what a single request returned or what happens to it afterwards."* Concretely, a unit whose access record shows **exactly one** call to `problemset.problems` and whose repository carries an id/rating table **blocks on this gate**, and the compliant request count is not raised in its defence.

**The `AI` half is separated, not absorbed.** The scan reaches artifacts. It does not reach an agent's persisted context, which SUB-1 §6 names in the same breath. `EQ-S1-7` carries that half as `AI`, `quarantines`, `OI-S9-6` — because a gate that claimed to enforce the whole of §6 would be claiming to read a context window.

### 6.3 The request-budget rule — a rate, over two parameters it reads and does not choose

**`G-BUDGET`** · mechanism `deterministic` · **`blocks`** · authoring-time.

A re-check of an **already-verified** citation is a sanctioned scheduled re-check, and not a scaled-up fetch, if and only if **both** hold:

> **(a)** `now − last_verified_at ≥ per_citation_staleness_window` · **and** · **(b)** the source's re-check count within the current budget period `< per_source_revalidation_budget`.

**The two parameters, and where each is read from:**

| Parameter | Read from | **Not chosen here because** |
| --- | --- | --- |
| `per_citation_staleness_window` | **SUB-10's drift-detection policy (NEU-966)** — the sub-task that owns when a citation is stale. | Choosing it would decide drift's cadence on SUB-10's behalf, and cadence *is* most of drift detection. |
| `per_source_revalidation_budget` | **The source's own stated rate limits, recorded in `01_…` §3** — which read **`unestablished at cutoff ⇒ restricted`** for all twelve sources today. | Choosing it would be this package inventing a rate limit for a source whose terms nobody has read — a §7.3 invented-authority failure in the retention direction. |

**Demonstrated against a declared placeholder pair.** The values below are **declared placeholders, used to demonstrate that the rule discriminates. They are not chosen values, they bind nothing, and no artifact anywhere in this package carries them.**

Placeholders: `per_citation_staleness_window = 90 days` · `per_source_revalidation_budget = 1 per source per day` · evaluation date `2026-08-11`.

| Case | `last_verified_at` | Elapsed | (a) | Source re-checks today | (b) | **Verdict** |
| --- | --- | --: | :-: | --: | :-: | --- |
| **A — a dated re-check past the window and within budget** | 2026-04-01 | 132 d | ✅ ≥ 90 | 0 | ✅ < 1 | **PASS** — a sanctioned scheduled re-check |
| **B — a re-check inside the window** | 2026-07-20 | 22 d | ❌ < 90 | 0 | ✅ < 1 | **BLOCK** — a scaled-up fetch, regardless of remaining budget |

**Case B blocks on (a) alone**, and that is the point of stating the rule as a conjunction: an unused budget is never an argument for an early re-check, because the harm the rule bounds is request *pattern*, not request *count*. **Today both cases are moot in practice** — `G-ACCESS-GATE` condition 2 shuts every source before `G-BUDGET` is reached, so this rule has never been exercised against a real citation. Recorded as `CAP-S9-5`.

### 6.4 The both-dispositions clause, for every citation-record gate

`CH-F5-1` is **unresolved and open** at this cutoff. Every gate in §4 that reads a citation record is therefore specified for **both** dispositions, and enforces the narrow one.

| | **Interim disposition — in force now** | **Wider disposition — if `CH-F5-1` resolves in favour** |
| --- | --- | --- |
| Enforced field set | `stable_id` + `canonical_url` **only** | the four `NOT-YET-STORABLE` fields become storable |
| `G-FIELDSET` | **Blocks** any citation record carrying a field beyond the pair | Widens by declaration; **the gate's rule does not change**, only the declaration it loads (`schema`) |
| `G-CITE-RESOLVE`, `G-DRIFT`, `G-MATCH` | Read the pair; `V5`/`V6` values live as **dated verification observations**, never as stored fields | Unchanged. SUB-3 §7.2: the migration is *"a promotion of existing observations into stored fields, not a re-verification"* — **no citation is re-resolved and no gate is rewritten** |
| `G-RATING-PROV` | A class-X rating resolves to a dated observation | A class-X rating may resolve to a stored field **and is still class X** (SUB-7 §4.2 — the classification does not move with the storage location) |
| If `CH-F5-1` resolves **against** the wider set | **Nothing changes at all** — the narrow record is already the produced shape (SUB-3 §7.3) | — |

**No gate in §4 requires a field the restricted set does not store.** That is a design constraint on this system, not a coincidence: every gate above was written against the two admitted fields plus the package's own dated observations. **The inherited field-set cap is cited by id — `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` — and is neither restated nor re-decided here**, and this sub-task's need for a wider set (there is none) is not offered as an argument for widening it.

---

## 7. Gate placement — the two columns, shown exhaustive

**Fifty-nine named gates.** Every one carries at least one column; one carries both; **none carries neither**.

| Gate | Mechanism | Requirements it decides | authoring-time | serve-time |
| --- | --- | --- | :-: | :-: |
| `G-ACCESS-GATE` | `deterministic` | `EQ-S1-1`, `EQ-S3-1` | ✅ | — |
| `G-ENUM-SCAN` | `automated` | `EQ-S1-2`, `EQ-S1-6` | ✅ | — |
| `G-NOTEXT-SCAN` | `automated` | `EQ-S1-3`, `EQ-S3-16` | ✅ | — |
| `G-FIELDSET` | `schema` | `EQ-S1-5`, `EQ-S2-7`, `EQ-S3-7`, `EQ-S8-5` | ✅ | — |
| `G-ATTRIB-RECORD` | `schema` | `EQ-S1-8` | ✅ | — |
| `G-RIGHTS-CITE` | `deterministic` | `EQ-S1-9`, `EQ-S3-8` | ✅ | — |
| `G-CITE-RESOLVE` | `server-side` | `EQ-S1-10`, `EQ-S2-9`, `EQ-S3-4` | ✅ | — |
| `G-FETCH-CLAIM` | `deterministic` | `EQ-S1-11` | ✅ | — |
| `G-CLASS7` | `deterministic` | `EQ-S1-12` | ✅ | — |
| `G-GENLABEL` | `schema` | `EQ-S1-13` | ✅ | — |
| `G-REFUSAL-OK` | `deterministic` | `EQ-S1-14` | ✅ | — |
| `G-FORM-REQUIRED` | `schema` | `EQ-S2-1` | ✅ | — |
| `G-PAIR` | `schema` | `EQ-S2-2` | ✅ | — |
| `G-PLACEMENT` | `server-side` | `EQ-S2-3`, `EQ-S2-4` | ✅ | — |
| `G-ANCHOR` | `server-side` | `EQ-S2-5` | ✅ | — |
| `G-EDGE-FIELD` | `deterministic` | `EQ-S2-6` | ✅ | — |
| `G-R1-LABEL` | `deterministic` | `EQ-S2-8` | ✅ | — |
| **`G-DRIFT`** | **`automated`** | **`EQ-S3-5`, `EQ-S3-10`** | **✅** | **✅** |
| `G-PRESELECT` | `server-side` | `EQ-S3-2`, `EQ-S3-15` | ✅ | — |
| `G-TRANSPORT` + `G-BUDGET` | `automated` / `deterministic` | `EQ-S3-3`, §6.3 | ✅ | — |
| `G-MATCH` | `automated` | `EQ-S3-6` | ✅ | — |
| `G-V-ALL` | `deterministic` | `EQ-S3-9` | ✅ | — |
| `G-DEPTH-BOUND`, `G-NODE-EXISTS`, `G-SOURCE-SET`, `G-INC-C1`, `G-NO-RETYPE` | `server-side` / `deterministic` | `EQ-S3-11`…`EQ-S3-14`, `EQ-S5-1`…`EQ-S5-3` | ✅ | — |
| `G-LESSON-FLOOR`, `G-RESTATE`, `G-UNDEF-TERM`, `G-INVARIANT-SLOT`, `G-BOUNDARY`, `G-COMPLEXITY-COND`, `G-ARGUMENT-SLOTS`, `G-CLOSURE-LINK`, `G-EXCHANGE-SLOT`, `G-TEST-COVERAGE` | all five | `EQ-S4-1`…`EQ-S4-11` | ✅ | — |
| `G-EDGE-SET`, `G-EDGECASE-SET`, `G-DISCRIMINATION`, `G-RECORD-KEY`, `G-CLASS-ONE`, `G-NO-LEARNER-TEXT` | `deterministic` / `automated` / `schema` | `EQ-S6-1`…`EQ-S6-12` | ✅ | — |
| `G-CALIB-SHAPE`, `G-CLASS-MONO`, `G-NO-ENTRYGATE`, `G-INADMISSIBLE`, `G-XCHECK-ROLE`, `G-RATING-PROV`, `G-CALIB-LABEL` | `deterministic` / `schema` / `server-side` | `EQ-S7-1`…`EQ-S7-10` | ✅ | — |
| `G-RECORD-SHAPE`, `G-SELF-REVIEW`, `G-QUARANTINE-SLOTS`, `G-HUMAN-REQUIRED`, `G-MISFILING`, `G-ESCALATION-COUNT` | `schema` / `server-side` / `automated` | `EQ-S8-1`…`EQ-S8-12` | ✅ | — |
| `G-RESIDUAL` | `deterministic` | `EQ-S5-4`, `EQ-S6-11`, `EQ-S8-9`, §3.5 | ✅ | — |
| `G-WARN-COUNT` | `deterministic` | `OI-S9-12`'s compensating gate — the unresolved-warning count on `RR-PUBLISH` | ✅ | — |

### 7.1 The counts

| | Count |
| --- | --: |
| Distinct named gates | **59** |
| Gates with an **authoring-time** entry | **59** |
| Gates with a **serve-time** entry | **1** |
| Gates with **both** | **1** |
| Gates with **neither** | **0** |
| Mechanisms represented in the authoring-time column | **5 of 5** — `deterministic` (`G-ACCESS-GATE`), `schema` (`G-FORM-REQUIRED`), `server-side` (`G-PLACEMENT`), `automated` (`G-NOTEXT-SCAN`), `AI` (`G-UNDEF-TERM`'s residual route, §11) |

### 7.2 The single serve-time entry, and why it is the only legitimate one

**`G-DRIFT` — the citation-drift re-check — is the only serve-time gate, and it is the single legitimate `both`.**

- **Why it must be serve-time.** Every other gate decides a property of the unit's own bytes, of its node, or of a review record. Those cannot change between publication and service. **A citation can:** the source may retire the problem, change its constraints, or move its URL — after the unit passed every authoring-time check. SUB-3 §5.1 property 4 states the same fact from the other end: *"re-running it at a later date against the same seed set must reproduce the same verdicts, or the difference is itself a finding (drift — **SUB-10's**)."*
- **Why it is also authoring-time.** Its authoring-time form is `V3` + `V4`: the id and the URL resolve and agree. Its serve-time form is the same comparison against the stored pair. **Same rule, two moments** — which is exactly what a `both` entry means, and why one gate appears in two columns rather than two gates appearing in one each.
- **Why nothing else may join it.** §3.3 bars a reviewer, a model call and an execution from a learner's latency path. `G-DRIFT` is an execution — so it is admitted at serve-time only in a **cached, asynchronous** form: the serve path reads a drift verdict computed out of band, and a stale-or-absent verdict **quarantines** the unit with `reason: retracted-input` rather than blocking the learner's request. **This document specifies the placement. It does not design the detection — that is SUB-10's (NEU-966), and the gate's owner is SUB-10.**
- **Attribution is deliberately not a serve-time gate.** SUB-1 §7.2 item 1 requires attribution *"visible without interaction"* on every artifact that reaches a learner. That is a **surface obligation**, owned by the learner-facing surfaces (NEU-891, NEU-892), and this document declines to place a gate on a surface that does not exist and whose owner is another charter's. The record-side half is enforced at authoring time by `G-ATTRIB-RECORD`; the render-side half is `CAP-S9-6`, with a named owner. **Recorded rather than quietly counted as covered.**

---

## 8. Quarantine — defined, and SUB-8's three slots filled

SUB-8 §5 reserved this definition in its entirety: *"Quarantine is named here and defined nowhere here … **SUB-9 (NEU-965) defines what each slot means and what may fill it.**"* This is that definition.

### 8.1 `quarantined`, distinct from `blocked`

| | **`blocked`** | **`quarantined`** |
| --- | --- | --- |
| What it says about the unit | A named rule was evaluated and **returned a failure**. | A named rule **could not be evaluated to a verdict** at this cutoff. |
| Who can clear it | **The unit's author**, by revising the unit. | **A third party named in `owner`**, by causing the `exit_condition` to become observable. |
| What a revision achieves | A re-run of the rule that can pass. | **Nothing.** No revision of the unit changes whether the rule is evaluable. |
| Exit transition | `T-12` (`blocked` → `draft`, verdict `reopen`) | `T-13`, defined in §8.4 |

> **The discriminating question, asked of every failing rule, in this form:**
> **Could a competent author change this unit today and have the rule evaluate to a pass?**
> **Yes → `blocks`. No → `quarantines`.**

**Why the question is about *evaluability* and not about *severity*.** The tempting alternative is to make quarantine the stricter state — "worse than blocked" — which would make it a punishment tier and would put the two states on one axis. They are not on one axis. `blocked` is a **decided failure**; `quarantined` is an **undecided obligation**. A unit that is perfect except that the only rule it still owes is `EQ-S4-3` is not worse than a unit with a missing REQUIRED field; it is in a different epistemic position, and the entire value of a second terminal is being able to tell those apart in a reviewer's queue. **SUB-8 declined to state which is stricter; this document does not make one stricter either. It makes them different.**

**One consequence, stated because it is the reading a reviewer will reach for.** A quarantined unit is **not** published-pending and **not** permanently blocked. It is held, with a named party who can release it and a named observable event that releases it. A quarantine with neither is not a quarantine — see §8.2's admissibility rules.

### 8.2 Admissible values for the three slots

**`reason` — a closed set of exactly five values. Not free text.**

| Value | When it applies |
| --- | --- |
| **`ai-judgment-residual`** | The unit's only outstanding failure is a requirement classified `AI` (§4) whose compensating observable gate does not reach this failure. |
| **`undecided-upstream`** | The unit depends on a decision recorded `unresolved` in an owning ledger — `CH-F5-1`, `D-R6`, `OI-S7-1`. |
| **`absent-decider`** | The rule names a party, role or artifact that does not exist at this cutoff — SUB-8 §7.5 steps 3–5 (`CAP-S8-2`), the shut access gate (`CAP-S3-1`). |
| **`contaminated-evidence`** | The unit's only passing evidence failed the §10 contamination probe or violates §10's `C-3`. |
| **`retracted-input`** | An input the unit was authored against has since changed or been withdrawn — a drifted citation, a re-classed dimension, a retired node. |

**Exactly one value per record.** **A case fitting none of the five is not quarantined under a stretched reason — it is `blocked` by §3.5's residual clause and recorded as an unenumerated case.** That inversion is deliberate: the failure mode of a state defined by "we could not decide" is that it becomes the drawer everything undecided is swept into, and a closed reason set with a `blocked` fallback is the only structural defence against it.

**`owner` — a closed set of six, and one prohibition.**

`the creator` · `the map's owner` · `the ledger's owner (C005 schema)` · `the ledger's owner (C005 foundations)` · a named work-item id (`NEU-…`) · a named reviewer role from SUB-8 §4.2.

> **The `owner` is the party who can satisfy the `exit_condition`. It is never the party who recorded the quarantine.**

**This closes SUB-8 §4.2's open question about the `quarantine-recorder` role's authority**, which SUB-8 explicitly deferred here: **the `quarantine-recorder`'s authority is to *record*, and it carries no authority to *release*.** The role may be held by any party who can evaluate the failing rule — including an agent, where the failing rule is one an agent may evaluate under SUB-8 §6's rubric. Recording is not a discretionary act, so it needs no elevated authority; **releasing is, and it is deliberately given to a different party.** A `RR-QUARANTINE` whose `owner` equals its `reviewer_identity` is inadmissible.

**`exit_condition` — a named observable event, in one of four shapes.**

| Shape | Example form |
| --- | --- |
| `ledger:<decision-id> resolves` | `ledger:CH-F5-1 resolves` |
| `register:<OI-… \| CAP-… id> closes` | `register:CAP-S3-1 closes` |
| `gate:<gate-id> becomes evaluable` | `gate:G-UNDEF-TERM becomes evaluable` |
| `evidence:<class> artifact exists for <named claim>` | `evidence:3 [dogfooding] artifact exists for progression_stage on <node>` |

**Three prohibitions, each closing a way the slot would otherwise become decorative:**

1. **The exit condition may not be the passage of time.** A date is not an event; a quarantine that expires is a publication on a timer.
2. **It may not be a party's satisfaction** — *"until the reviewer is happy"* names no observable.
3. **It may not be the word "review".** Every one of the four shapes names an artifact or a register state that a third party can check without asking anyone.

### 8.3 The slot-reconciliation record, against SUB-8 §5 and §10.2

| Check | Result |
| --- | --- |
| All three slots **present** in the record shape | **Yes** — unchanged from SUB-8 §5. This document adds no fourth slot and removes none. |
| All three **populated** by the definitions above | **Yes** — §8.2 gives each a closed admissible set. `G-QUARANTINE-SLOTS` (`EQ-S8-8`) blocks a record with any slot empty. |
| Any slot left **unpopulated** after this document | **None.** |
| Does any value **predate** this definition? | **No.** SUB-8 §5 states it *"carries no value, no default, no placeholder value, no worked example, and no enumerated candidate set — here or anywhere else in this package's SUB-8 output."* Verified by reading `08_…` §5 and §10.2: the three cells read `— [SUB-9-SUPPLIED · UNPOPULATED]` and the `—` is declared *"a typographic placeholder for absent, not a value."* **No value in §8.2 is inherited, adapted, or inferred from a SUB-8 candidate, because SUB-8 offered none.** |
| `OI-S8-2`'s genuinely-unknown — *"whether three slots are the right three"* | **Three are sufficient, and the judgement is recorded rather than assumed.** `reason` carries why, `owner` carries who, `exit_condition` carries what would change it — which is the same triple every entry in `90_…` and `91_…` is required to carry, so quarantine's record shape is deliberately isomorphic to the package's own register discipline. **`owner` is not a property of the transition** (SUB-8 raised that possibility): the recorder and the releaser are different parties by §8.2's prohibition, so a transition-level owner field would name the wrong one. **No fourth slot is added.** |

**The §10.2 record, re-produced with the slots filled.** The unit, node, transition and evidence class are SUB-8's own from its dry run; only the three slots change, and the `reason` chosen is the one that actually applies to `U-DR-1` — a `retrieval` item on `cl-1.judge-dp-applicability` reviewed under `standard: Explanation`, `mechanism: AI`.

```
record_id:            RR-Q-DR-1
unit_id:              U-DR-1
node_id:              cl-1.judge-dp-applicability
transition:           T-11  (from: published → to: quarantined)
reviewer_role:        quarantine-recorder
reviewer_identity:    <the party holding the role>
decided_at:           2026-08-11
evidence_class:       2 [code-evidence]  — limitation: shows availability, not pedagogical validity
verdict:              quarantine
rationale:            <the recording party's own>
reason:               ai-judgment-residual
owner:                the correctness-reviewer role   (SUB-8 §4.2)
exit_condition:       gate:G-UNDEF-TERM becomes evaluable
```

**This is a reconciliation, not a re-run of SUB-8's dry run.** No transition was executed, no unit exists, and `U-DR-1` remains SUB-8's constructed instrument. What is demonstrated is that a conforming record's three slots take admissible values from the sets above — nothing more.

### 8.4 `T-13`, defined

SUB-8 §3.2 left `T-13` — `quarantined` → *any state* — **NOT DEFINED HERE**, stating *"the exit from quarantine is governed by the `exit_condition` slot, which is SUB-9-supplied and unpopulated."* It is now populated, so:

> **`T-13`: when the record's `exit_condition` is observed, the `quarantine-recorder` emits a second `RR-QUARANTINE` carrying verdict `reopen` and citing the original `record_id` verbatim, and the unit re-enters **`draft`**.**

| Property | Value |
| --- | --- |
| Reviewer role | **quarantine-recorder** (records); the slot's **`owner`** is the party whose action made the condition observable |
| Record type | `RR-QUARANTINE`, verdict `reopen` — a **second** record, never an edit of the first |
| Destination state | **`draft`, and only `draft`** |
| Human / agent | **human**, by SUB-8 §6's H3 limb (a terminal is being left) |

**Why `draft` and only `draft`.** A quarantined unit was held because a rule could not be evaluated. When it becomes evaluable, the rule has still **never been run against this unit**. Returning the unit to `published`, or to the working state it was quarantined from, would advance it on a verdict nobody has recorded — the exact laundering §3.2 rule 2 exists to prevent. Re-entering `draft` costs the unit its review chain's re-execution and buys a real verdict. **The chain is carried, not discarded** (SUB-8 §3.1's `revision-requested` reasoning applies identically).

---

## 9. Escalation — a rule that preserves disagreement

**The trigger.** Two review records exist for the same `unit_id` and the same `transition` with **different verdicts**, or a rule's mechanism is `AI` and two reviewers return opposing judgements.

**The rule, in four clauses:**

1. **Both verdicts are retained verbatim.** A third record, `RR-ESCALATE`, is emitted carrying **both** original `record_id`s, both `verdict`s, both `rationale`s and both `reviewer_identity`s, unedited. **Neither original record is modified, superseded, or deleted.**
2. **The unit does not advance.** It moves to **`quarantined`** with `reason: ai-judgment-residual` (for a judgement disagreement) or `undecided-upstream` (where the disagreement is about which upstream rule governs), `owner` = the escalation owner below, `exit_condition` = `evidence:<class> artifact exists for <the disputed claim>` or `register:<id> closes`. **There is no merged middle result, and the unit never advances on one.**
3. **No averaging, no dropping, no defaulting.** A numeric verdict pair is never averaged. A verdict is never dropped for being the minority of two. **And a human/agent disagreement does not resolve in the human's favour by default, nor in the agent's** — stated in both directions because *"the human wins"* is the plausible shortcut that would silently discard a class-2 `[code-evidence]` finding, and *"the check wins"* is the plausible shortcut that would silently discard the judgement the check was only ever bounding.
4. **The escalation owner rules in a third record, not by replacing either.** The ruling is itself a review record with its own `evidence_class` and `rationale`, and it cites both originals.

**The escalation owner, per disagreement class:**

| Disagreement about | Escalation owner |
| --- | --- |
| A correctness standard (SUB-4) | **the creator** — the correctness-reviewer role is a party to the disagreement |
| A rights disposition or an access path (SUB-1, SUB-3) | **SUB-1 (NEU-957)** as OUT-7's residual owner; **the creator** by default |
| A map fact — node existence, type, obligation (SUB-2, SUB-5) | **the map's owner** |
| A calibration class or value (SUB-7) | **the creator**, via `OI-S7-1` |
| A workflow state, role or record (SUB-8) | **SUB-8 (NEU-963)** for classification; **the creator** thereafter |
| **This classification itself** — whether a requirement is `AI` or mechanical | **SUB-11** at standards-conformance review; **SUB-12 (NEU-969)** at package reconciliation |

**`RR-ESCALATE` is the missing measurement instrument, and that is deliberate.** SUB-8 `OI-S8-5` records that the human/agent rubric is *"a rule, not a measured allocation"*, that what would discriminate is *"a recorded comparison — the same set of transitions reviewed by both, with disagreements counted"*, and that **SUB-9 owns it**. Every `RR-ESCALATE` record **is** one such recorded comparison. The escalation register therefore accumulates the exact artifact `OI-S8-5` names as missing, starting from zero, as a by-product of running the workflow rather than as a study somebody must fund. **The count today is zero, and zero is not evidence** — carried as `OI-S9-13` with `G-ESCALATION-COUNT` as its compensating observable gate.

---

## 10. The AI-contamination control

**Assigned here by `01_provenance-and-rights.md` §11.1** as the one explicitly carved-out part of OUT-7: *"contamination rules for AI-generated solutions and AI graders whose training may already contain a problem's editorial solution."*

### 10.1 The policy

| # | Rule |
| --- | --- |
| **`C-1`** | **An AI grader or AI reviewer may not be the sole evidence for a unit's correctness.** `RA5` already establishes that AI grading is not the signal of record; this extends it from grading to **review**, because a reviewer whose training corpus may contain a cited problem's editorial solution is in the same evidential position as a grader. |
| **`C-2`** | **Agreement between two AI reviewers over the same artifact is *one* observation, not two.** A second AI review carries class **4 `[ai-critique]`**, inherits the first's structural limitation, and **raises no class and adds no count**. |
| **`C-3`** | **A model may not review an artifact it authored.** This is the AI form of SUB-8 §4.2's *"an author may not review their own unit"*, and it is checked the same way: `reviewer_identity` carries provider + model + version (SUB-8 §4.1), and the check is `reviewer_identity.model ≠ author_identity.model` on `T-03`, `T-05`, `T-07`. |
| **`C-4`** | **No unit's correctness rests on a claim the reviewing model could have memorised.** Concretely: a `solution` whose only correctness evidence is an AI reviewer's agreement **blocks**; the observable substitute is boundary confrontation (`EQ-S4-6`), which runs the approach over inputs rather than asking a model whether it looks right. |
| **`C-5`** | **Contamination is not detectable in general, and this control does not claim it is.** What is enforceable is the **accounting** — reviewer identity, evidence class, and observation count. `C-5` is stated as a limit so that `C-1`–`C-4` are not read as a detection capability. |

### 10.2 The evidence-class rule

> **A contaminated agreement is never recorded as independent confirmation.**

Operationally: where two reviews of the same artifact share a model id, or where one reviewer authored the artifact, the second review's `evidence_class` is recorded as **4 `[ai-critique]`, same-model**, and **the observation count for that claim does not increase.** It is not relabelled class 5, and under no circumstance class 7 — that is NEU-887's **no-cross-class-laundering** rule, which SUB-6 §3.4 states in the same shape: *"a weak signal is not promoted by being restated in stronger words."*

### 10.3 The probe

**Shape.** The probe follows SUB-2's and SUB-3's template-fabrication-probe pattern, which already established the cold-agent method in this package (`dry-run/02_…`, `dry-run/03_…`, both run against **`claude-sonnet` (cold agent, no prior context)** as probe subject).

**Procedure.** Present a cold reviewing agent with a `solution` artifact whose `invariant` slot states a **tautology** — a condition no input can violate — for a node whose technique is well represented in public editorial material, and ask for a correctness verdict **against SUB-4 §2.2's stated rule**. Contaminated behaviour is a **pass** justified by the approach being *"the standard solution"* or *"correct for this problem"* rather than by the artifact's own fields; uncontaminated behaviour is a **fail** on falsifiability. Record the reviewing model id, the verdict, and the justification's referent (artifact fields vs. recalled knowledge).

**The probe result on the AI review path, at this cutoff — reported, not asserted.**

| Observation | Result | How it is checkable |
| --- | --- | --- |
| **The `C-3` check, applied to the only recorded AI review of a C009 content unit** | **FAIL** | `08_…` §10.1 row 4 records `T-05`, `RR-CORRECT`, `evidence_class: 4 [ai-critique]`, `standard: Explanation`, `mechanism: AI` — an AI review of a unit produced within a package every one of whose 33 documents carries `**Model:** claude-opus-5[1m]`. **Author model and reviewer model are the same id.** `C-3` is violated on the one instance that exists. |
| **The `C-2` check, applied package-wide** | **No independent AI confirmation exists anywhere in C009** | Single-model authorship across all thirteen sub-tasks. Any two C009 documents agreeing is one observation under `C-2`, not two. |
| **The cross-model path is not hypothetical** | **Available and already exercised for a different purpose** | `dry-run/02_…` and `dry-run/03_…` each ran a **`claude-sonnet` cold agent** as probe subject. The method for a `C-3`-conforming review therefore exists in this package; it has simply never been pointed at a correctness review. |
| **The tautological-invariant probe itself** | **NOT EXECUTED** | Executing it here would require the reviewing agent to be the authoring model — precisely the `C-3` violation the probe exists to detect — and a probe whose subject is its own author produces a result of zero evidential value. **Recorded as `CAP-S9-4` with a named owner, not run and reported as a pass.** |

**The honest statement.** The contamination control's **accounting half is specified and its detection half is not run**. What the probe has established is a real, checkable, negative finding: **the AI review path as currently constituted fails `C-3` on the only instance available**, and the package contains no independent AI confirmation of anything. That is a more useful thing to hand SUB-11 and SUB-12 than a green probe would have been.

---

## 11. The enforcement-gap analysis — every AI-judgment-only residual

**Sixteen residuals. This is the deliverable.**

Each row carries §3.4's four fields. **The "what the gate does not catch" column is mandatory and no row leaves it empty** — a compensating gate that is not stated to be partial is a gate presented as a discharge, which is the laundering this package exists to prevent.

| Id | Residual — the obligation whose verdict is judgement | Rows | Compensating observable gate | Mech. | Gate owner | **What the gate does NOT catch** |
| --- | --- | --- | --- | --- | --- | --- |
| **`OI-S9-1`** | **The explanation depth obligation** — *"a learner holding exactly the node named in `prerequisite_recall` can reconstruct the applicability decision in both directions"* (SUB-4 §2.1b, `OI-S4-4`) | `EQ-S4-3` | **`G-UNDEF-TERM`** — enumerate every term in the lesson body appearing neither in the `prerequisite_recall` node's own vocabulary nor in the lesson's own defined-term list, and **emit the candidate list**; a non-empty list **quarantines** pending the reviewer's verdict | `automated` | **correctness-reviewer role**; build owner **the creator** | **It produces a search space, not a verdict.** It cannot decide *"explained in place"*, so a term correctly explained inline still appears on the list. And it reaches **only the deep-enough limb**: the *not-deeper* limb — re-teaching an unlocked prerequisite — has **no gate at all**, and no metric is proposed for it. SUB-4's refusal stands: a word count is not depth. |
| **`OI-S9-2`** | **Proof — soundness of the exchange step in `optimal_substructure`** (SUB-4 §2.3b, §3.2) | `EQ-S4-10` | **`G-EXCHANGE-SLOT`** — `optimal_substructure` must name **the sub-part that is exchanged** and **the contradiction that follows**, as two identified spans; absence **blocks** | `schema` | **correctness-reviewer role** | **Whether the contradiction actually follows.** The gate confirms an exchange argument was *stated*; it has no view on whether it is valid. A fluent, wrong exchange step passes it cleanly. |
| **`OI-S9-3`** | **Solution — whether the stated invariant is the *right* invariant for `approach_class`**, and whether it is falsifiable (SUB-4 §2.2b, §3.2) | `EQ-S4-5` | **`G-BOUNDARY`** — boundary confrontation over **every `test` instance on the node** (`EQ-S4-6`); a mismatch **blocks** | `automated` | **correctness-reviewer role** | **A wrong invariant that no boundary input on the node reaches.** SUB-4 states the bound in its own words: *"boundary confrontation catches a wrong invariant that a node's own boundary inputs reach, and nothing beyond that is claimed."* SUB-6 §5.3's three required edge cases raise the floor **only for gate-bearing items**, not for `test` instances generally — so a node whose tests are all happy-path leaves this gate with nothing to run. |
| **`OI-S9-4`** | **Test — whether the named misconception is one a learner actually holds** (SUB-4 §3.2; design routed to SUB-6) | `EQ-S6-6` | **`G-DISCRIMINATION`** — SUB-6 §5.2 condition 2: substitute the misconception's method and evaluate on the named input; if it produces the `expected_response`, the item **blocks** | `automated` | **SUB-6 (NEU-962)** for the design; **the creator** for held-ness | **It proves the misconception is *separable*, never that it is *held*.** A perfectly separable misconception nobody has still passes. Closing this needs in-app item statistics over real learners — class 5/6 evidence that does not exist and that **may never be laundered into class 7**. |
| **`OI-S9-5`** | **Semantic paraphrase of a protected statement** (SUB-1 §5.1 stated limitation, `CAP-S1-5`) | `EQ-S1-4` | **`G-NOTEXT-SCAN`** + **`G-ENUM-SCAN`** — the two lexical scan families, run as gates; a hit **blocks** | `automated` | **SUB-1 (NEU-957)** as OUT-7's residual owner; **the creator** | **Semantic paraphrase.** SUB-1 says it plainly: the scans *"prove the structural absence of stored statements and stored lists"* and *"cannot prove that no sentence anywhere is a disguised paraphrase, which no grep can prove."* The residual is a review obligation on every sub-task and is not a claim of mechanical completeness. |
| **`OI-S9-6`** | **In-flight retention** — an enumerating response *"not retained in an agent's persisted context beyond the resolution it was fetched for"* (SUB-1 §6) | `EQ-S1-7` | **`G-ENUM-SCAN`** (artifact side) + the **request-pattern audit** (SUB-3 §9.1) | `automated` | **the creator** | **Everything that never becomes an artifact.** A scan reads files; it cannot read an agent's context window, and no gate in this system can. The compensating gates catch retention **after** it lands somewhere durable — which is the harm's usual endpoint, not its whole. |
| **`OI-S9-7`** | **MAY NEVER 5 and MAY NEVER 7** — claiming permission from an access path; presenting generated content as a source's or a source's as our own (SUB-1 §8 Enforcement, which already names these two as *"review obligations … an obligation whose only enforcement is judgment is named as one"*) | `EQ-S1-9`, `EQ-S1-13` | **`G-RIGHTS-CITE`** — every rights-disposition assertion resolves to a dated `01_…` §1/§3 row id, and no rights claim cites an access-path fact; **blocks**. Plus **`G-GENLABEL`** — every artifact carries its `generated` label and every source-attributed statement resolves to a §7.1 attribution row; **blocks** | `deterministic` / `schema` | **SUB-1 (NEU-957)**; **the creator** | **A rights argument made in other words**, and **prose that reads as a source's without citing it.** The gates check that assertions *resolve*; they do not read tone. §7.3's five named phrasings are the shapes we know; the sixth is why this row is here. |
| **`OI-S9-8`** | **`S1` — the problem exercises the node's technique as its *defining difficulty*** (SUB-3 §6.1); and **`X2`** — difficulty dominated by unowned material | `EQ-S3-11`, `EQ-S3-16` | **`G-DEPTH-BOUND`** — `S3`'s prerequisite-depth bound, `server-side`, **blocks** | `server-side` | **correctness-reviewer role**; **the creator** | **"Defining".** A problem within the node's prerequisite depth whose actual difficulty lies elsewhere passes the depth bound and fails the criterion. SUB-3 states the cost: *"a problem where the node's technique is a minor step teaches the learner that the node is easy or irrelevant."* |
| **`OI-S9-9`** | **Whether a candidate node's acquisition is a genuine S8 residual** under the `D-S1` cascade (SUB-5 §6, route 1) | `EQ-S5-5` | **`none — cap`** | — | **the map's owner** — the creator, and whichever task next writes `nodes/*.yaml` | **Everything.** No gate is proposed, and none is possible from this side: the judgement is about whether S1–S7 genuinely decline, which requires the map owner's view of the cascade. `G-NO-RETYPE` blocks the *wrong* answer (a local retype) without producing the right one. **`CAP-S9-3`.** |
| **`OI-S9-10`** | **SUB-6 §5.2 condition 1** — `misconception_or_edge_case` names a **specific wrong model**, not a category | `EQ-S6-5` | **`G-DISCRIMINATION`** — condition 2's substitution procedure, `automated`, **blocks** | `automated` | **SUB-6 (NEU-962)**; **the creator** | **A vague misconception that happens to survive substitution.** Condition 2 tests the *input*, not the *naming*; an item whose misconception reads *"misunderstanding the algorithm"* but whose distractor genuinely separates will pass the mechanical check and fail the stated rule. |
| **`OI-S9-11`** | **PLI's equal weighting, and the dimension set itself** — *"equal-weight because no evidence discriminates a weighting, not because the five dimensions were found to contribute equally"* (SUB-7 §5.2, `PR-7`, `OI-S7-1`); and **`R1`/`X-D3`** — the ordering is not a claim about learning order | `EQ-S7-10`, `EQ-S2-8` | **`G-CALIB-LABEL`** — the §9.4 label verbatim on **every** calibrated output; absence **blocks**. Plus **`G-R1-LABEL`** — the `R1` structural-claim label on any artifact describing graph order | `deterministic` | **the creator** — the only qualified reviewer of the map's provisional values | **Whether the weighting is right.** The label makes the un-measured weighting **visible on every value**; it does not validate it, and a reader who ignores labels is not reached by it. Closing needs the creator's plausibility review of the 179 deferred values — `OI-S7-1`, not this gate. |
| **`OI-S9-12`** | **Whether a `warns` verdict is ever acted on.** A warning nobody reads is an unenforced requirement wearing an enforcement's clothes | `EQ-S1-14`, `EQ-S4-2` | **`G-WARN-COUNT`** — the `RR-PUBLISH` record carries the count of unresolved warnings at publication; a non-zero count is **recorded**, not blocked | `deterministic` | **the publisher role** (SUB-8 §4.2) | **Whether anybody reads the count.** The gate makes the warning population countable, which is strictly more than nothing and strictly less than enforcement. This document declines to escalate the two `warns` rows to `blocks` to make the table look stronger — §3.2's rule assigned them for a reason. |
| **`OI-S9-13`** | **Whether SUB-8 §6's human/agent allocation is correct** — *"the rule's limbs are defensible on their face, but no measurement supports any of them"* (`OI-S8-5`, owner assigned to SUB-9) | `EQ-S8-12` | **`G-ESCALATION-COUNT`** — every `RR-ESCALATE` record (§9) is one recorded human/agent comparison with its disagreement; the register accumulates the exact artifact `OI-S8-5` names as missing | `deterministic` | **SUB-9 (NEU-965)** for the instrument; **the creator** for the reading | **Everything, today.** The count is **zero**, and zero disagreements over zero reviews is not evidence of agreement. The instrument exists; the measurement does not. |
| **`OI-S9-14`** | **Contamination itself** — `C-5`: whether a reviewing model's verdict rests on memorised editorial material (§10) | §10 `C-1`–`C-4` | **`G-SELF-REVIEW`** extended to model identity (`C-3`), plus the §10.3 probe | `server-side` | **the creator** | **Contamination by a *different* model that saw the same material.** `C-3` catches identity overlap, which is a proxy for corpus overlap and a weak one. **`C-5` says so in the policy rather than in a footnote**, and the probe is not run (`CAP-S9-4`). |
| **`OI-S9-15`** | **The classification in §4 is one unreviewed pass by one model.** Whether a given row is genuinely `AI` rather than `automated` — or genuinely `automated` rather than `AI` — is itself a judgement, made 89 times here, reviewed zero times | §4 entire | **`G-RESIDUAL`** — an unenumerated requirement is **blocked until classified** (§3.5), so a missed requirement fails safe | `deterministic` | **SUB-11** at standards-conformance review; **SUB-12 (NEU-969)** at package reconciliation | **A *mis*classified requirement, as opposed to a missing one.** A row wrongly assigned `automated` reads as enforced and is not; the residual clause does not fire, because the requirement is enumerated. **This is the residual most likely to be wrong and least likely to announce itself.** |
| **`OI-S9-16`** | **Every gate in §4 is specified and none is built.** Whether a specified gate is *buildable as specified* is a judgement no reader of this document can settle | §4, §7 entire | **`none — cap`** | — | **the creator**, and whichever task first implements a gate | **Everything.** `CAP-S9-1`. A specification that has never been compiled against a real artifact has an unknown defect rate, and this row exists so that unknown is filed rather than implied away by the confidence of the tables above. |

**Read the column that matters.** Ten of the sixteen rows carry a compensating observable gate that is `automated` or `deterministic` — real, runnable-in-principle checks. **Two carry `none — cap`.** All sixteen carry a statement of what survives. **The list did not get shorter by being written carefully, and it was not supposed to.**

---

## 12. The one bounded prototype, against `MC-4 v1.0`

**`MC-4` is cited by id and version and is not redefined here.** Its metric is the over-validation rate on deliberately shallow or wrong adversarial answers scored pass / `quality ≥ 3`; its decision rule is **BOUNDING**; its label is **`PROXY-BOUNDING`**; `RA5` is retained.

**What was executed.** The committed adversarial batch in this repository, run on 2026-08-10 against the working tree, via the local `vitest` binary directly:

```
✓ |unit| tests/unit/domain/algorithms/over-validation-guard.test.ts (5 tests) 6ms
✓ |unit| tests/unit/domain/algorithms/adversarial-grading.test.ts (5 tests) 5ms
 Test Files  2 passed (2)
      Tests  10 passed (10)
```

**Collection was non-zero and was checked before any verdict was read** — 2 files, 10 tests. A zero-collection run is a false green, not a pass.

| Quantity | Value |
| --- | --- |
| Known-incorrect fixtures (`ki-01` … `ki-10`) scored `quality ≥ 3` | **0 of 10** |
| **Measured false-accept rate** | **0.000** |
| `overValidationCeiling` (`src/domain/config/algorithm-defaults.ts`, NEU-929 / `MM-T5`) | **0.1** |
| `evaluateOverValidation` verdict | **within ceiling** |
| Valid-but-unusual fixtures (`vu-01` … `vu-05`) falsely rejected | **0 of 5** |

**What this is, stated precisely, because the over-claim is available and easy.** The fixture feeds **hand-encoded rubric payloads** directly to the **deterministic mapper** `mapRubricToQuality`. **The AI-grading stage is stubbed.** The measurement therefore bounds **only the downstream deterministic half** of `MC-4`'s path — the half `RA5` already designates as the signal of record — and says **nothing** about whether an AI grader upstream of the mapper would emit rubric payloads that over-validate.

> **This is a bounded prototype, not a harness, and it is not an end-to-end `MC-4 v1.0` measurement.** Recorded as **`CAP-S9-2`**, owner **the creator**, closing when the batch is run with the AI-grading stage live.

**Why it was run before §11 rather than after.** Whether the `AI` residual over-validates beyond `MC-4`'s ceiling is an *input* to the enforcement-gap analysis, not a footnote to it. The honest answer turned out to be that **the available measurement does not reach the `AI` stage at all** — which is itself the finding, and it is why `OI-S9-14` and `CAP-S9-2` read as they do rather than citing a 0.000 as reassurance about a judgement the run never touched.

---

## 13. Scope — what this document does not decide

- **It builds no gate.** Every gate in §4 and §7 is specified; **none is implemented, and none has run against a real content unit.** `CAP-S9-1`.
- **It resolves none of SUB-5's three routes**, does not rank them, and does not treat any as more likely. §4.5 classifies the **existing default** (`blocked`, SUB-8 §9 case 3) and stops. **Stated explicitly rather than silently picked**, because a quality system that needed the routes resolved would have been a reason to resolve them, and this one does not.
- **It does not close `CH-F5-1`, widen the field set, or argue for widening it.** §6.4 specifies every citation gate for both dispositions and enforces the narrow one. `CAP-S1-2` is cited by id and not re-owned.
- **It does not resolve `OI-S7-1`.** §4.7 classifies SUB-7's outputs as SUB-7 published them, label and all.
- **It does not detect drift.** `G-DRIFT`'s **placement** is decided here; its **detection** is SUB-10's (NEU-966), and SUB-10 is named as its owner.
- **It does not run SUB-11's standards-conformance review**, and does not write `92_package-completeness-gate.md`, which is **SUB-12's (NEU-969)** alone.
- **It re-decides nothing upstream.** SUB-4's mechanism reassignments (§5.1) are the one axis SUB-4 declared provisional and assigned to SUB-9 by name; no standard, field, obligation or form is changed.
- **It sets no status.** Status lives in a ledger, and a producing task may not promote its own artifact (`A4`).
- **It claims no QA pass.** See §14.

---

## 14. Verification note — `qa-execution:engine` is unconfigured

The repository's capability registry resolves **`git` and `linear` only**. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase over this deliverable is a genuine **Core Article 8 no-op** — the phase runs inert by design.

**What was refused: reporting a QA pass.** No engine ran, so no engine's verdict is claimed, implied, or summarised. The checks that were executed are real and are recorded for what they are: one `vitest` run of a committed adversarial batch (§12, non-zero collection, honestly scoped), a direct `tsc --noEmit` invocation whose green result is **vacuous** with respect to this change because this change touches no TypeScript, and shell-level `git diff --numstat` and grep checks over the working tree, recorded in `traceability/09_…` §6. **Mechanical, hand-run, and narrow.** `CAP-S8-3` names this gap and assigns it here; §4 discharges the specification half of it and `CAP-S9-1` carries the execution half.

---

## 15. Evidence and records

| Artifact | What it carries |
| --- | --- |
| `traceability/09_enforcement-classification-and-gap-register.md` | Per-requirement rows with upstream anchors; the five gate-failure tests in the `03_requirement-decision-mapping-gate.md` §4 shape; the per-gate findings-payload inspections; the slot-reconciliation record; the contamination-probe record; the `MC-4 v1.0` prototype record; and the non-mutation audit. |
| `90_open-items-and-provisional-register.md` § `SUB-9` | `OI-S9-1` … `OI-S9-17`, each with an owner and a revision trigger. |
| `91_caps-and-incomplete-scope.md` § `SUB-9` | `CAP-S9-1` … `CAP-S9-7`, each with an owner and a closure condition. |

**Evidence classes carried by this document.** The classification, the vocabularies, the quarantine definition, the escalation rule and the contamination policy are **specification**, not measurement, and are claimed as such. The `MC-4` prototype result and the `C-3` probe finding are class **2 `[code-evidence]`** — an operational fact about committed code and committed documents, with the limitations stated in §12 and §10.3. **No class 3 `[dogfooding]` evidence was collected and no class 7 `[future-real-user]` claim appears anywhere.**
