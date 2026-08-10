# The Authoring Workflow, and the In-Situ Loop That Flips a `creator_review` Flag

**Task:** NEU-963 (SUB-8) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-8 · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — set only in `adjudication/` and, for inherited decisions, in the owning package's ledger
**Model:** claude-opus-5[1m]

---

## 0. The result, stated first

**A workflow ships. It has three terminals, a named reviewer role on every transition, a durable
record for every transition, and one in-situ loop whose only success condition is a correctly classed
entry in a ledger. It enforces nothing, and it flips no flag today.**

Four statements carry the whole document, and none of them is softened later:

1. **Every content unit has a defined path to exactly one of three terminals** — `published`,
   `blocked`, `quarantined` — and **every** transition between states names the reviewer role that
   performs it and emits a durable review record of a named type (§3, §4). **There is no transition
   that leaves no record**, and there is no state a unit can occupy that this document does not
   enumerate. What is not enumerated is `blocked` by the residual clause (§9), never `published`.
2. **Quarantine is named here and defined nowhere here.** Its record type exists, is reachable, and
   carries exactly three slots — **`reason`**, **`owner`**, **`exit_condition`** — that are
   **present, named, and unpopulated**, each marked **SUB-9-supplied** (§5). This document states no
   reason, no owner and no exit condition, asserts nothing about the values SUB-9 will put in them,
   and gives no example value from which one could be inferred. **A quarantine record whose slots
   this sub-task filled would be a workflow failure; so would one that omitted them.**
3. **The creator's while-learning judgement has exactly one legitimate destination, and it is a
   ledger.** The in-situ loop (§7) captures a judgement about a node's `progression_stage` or one of
   the five load dimensions, classes it under **exactly one** NEU-887 evidence class —
   **3 `[dogfooding]`**, a labelled **proxy** signal, never class 7 — and files it as a candidate
   entry in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` under the new **`CR-1`**
   filing route. **Recording it anywhere else — a node's YAML, a README, a session note, a commit
   message — is a workflow failure, not a shortcut** (§8), and this document names the corrective
   route for each such misfiling.
4. **The backlog this loop inherits is quantified, and this document does not reduce it by one.**
   SUB-7 recorded `creator_review: "deferred-provisional"` on **179/179** non-root nodes across six
   provisional dimensions — **zero creator-confirmed**. After this document lands the count is still
   **179/179**. What changes is that the number is now *reducible*: before, a judgement had nowhere
   to go that counted; now it has exactly one place, one class, one route and one adjudicator.

**And one thing this document deliberately does not do.** It assigns **no gate, no blocking
behaviour and no gate placement** to any transition. **SUB-9 (NEU-965) owns both axes**, exactly as
SUB-4 and SUB-5 left them. This document says *where a decision happens and what it records*; SUB-9
says *how it is enforced*. A reader looking here for the answer to "does this block the build?" is
looking in the wrong document, and §11 says so by name.

> **The honest summary a reader should carry away:** this is a workflow with a complete state graph,
> a complete record schema, a decidable human-versus-agent rule, and **one** dry run. It has never
> been executed on a real unit, it has reviewed **zero** of the 179 nodes, and its enforcement half
> does not exist yet. Every one of those is recorded as a cap with an owner in `91_…`, not smoothed.

---

## 1. What this document is, and what it is not

**It is** the OUT-8 deliverable: the authoring workflow for a content unit, and the incremental
in-situ creator-review loop.

**It is not** a gate specification, a quarantine definition, a citation procedure, a learner-facing
surface, or a review of the map. Each of those has a named owner elsewhere, and §11 lists them.

**A "content unit"**, throughout, means one instance of one of SUB-2's ten content and exercise forms
(`../C009-course-content-quality/02_content-and-exercise-forms.md` §7), authored against **one** map
node and carrying that node's exact `node_id`. The unit is the thing that moves through this
workflow. **A node is not a unit** — nodes are the map's, and this workflow never moves one.

---

## 2. The preconditions this sub-task consumes and does not re-decide

Each row is consumed **verbatim** — the field names below are the upstream documents' own strings,
carried without translation, exactly as `07_…` §12 requires of its own consumers.

| Precondition | Owner | What this workflow does with it |
| --- | --- | --- |
| **The ten content and exercise forms**, their templates, the REQUIRED-form set keyed off the node's `skill_type`, and the mandatory pair `misconception_or_edge_case` + `separating_distractor_or_boundary_input` | **SUB-2 (NEU-958)**, `02_…` §6.3, §7 | Defines what a *unit* is and what "authored" means. **Not restated, not extended, not narrowed.** |
| **The four correctness standards** — Explanation (`AI`), Solution (`automated`), Proof (`schema`), Test (`deterministic`) — and the fact that **no blocking behaviour and no gate placement were assigned** | **SUB-4 (NEU-960)**, `04_…`; both axes **SUB-9's** | Supplies the *verification mechanism* recorded on a correctness-review record (§4), and supplies input 1 of the human/agent rubric (§6). **This document does not assign the missing axes either.** |
| **The seven-step verification procedure `V0`–`V7`** and the access-path record | **SUB-3 (NEU-959)**, `03_…` §5 | The citation-review step (§3) **names** the procedure and **requires its record**. It does not restate it, re-derive it, or run it, and **it authorises no request to any source on any branch**. |
| **All twelve sources `Restricted`; cluster citation coverage `0/4`; `CAP-2` closure DECLINED** | **SUB-3 (NEU-959)** / **SUB-1 (NEU-957)** | The citation-review step's live outcome today is `none — gate` at `V0` for every unit. Recorded as a real value, never as a blank. **The twelve rows are `Restricted` by the restricted-default rule** (SUB-1 had no network access), **not verified-restricted**, and this document does not upgrade them. |
| **The interim binding field set: `stable_id` + `canonical_url` ONLY** | `CH-F5-1` / `DR-C09-01` / `CAP-S1-2` | The hard ceiling on what any review record may store about a problem (§4.3). |
| **The calibration triple `(structural_tier, provisional_load_index, stage_band)`; `prerequisite_depth` VERIFIED (class MD, 179/179 agree); the five load dimensions and `progression_stage` PROVISIONAL (class P) at `creator_review: "deferred-provisional"` ×179/179** | **SUB-7 (NEU-964)**, `07_…` §4, §5.1, §7 | The subject matter of the in-situ loop (§7), and the source of its **scope test** (§7.3): a judgement about a class-**P** dimension is a creator review; a judgement about class-**MD** `prerequisite_depth` is **not**, and routes elsewhere. |
| **The seven evidence classes and the no-cross-class-laundering rule** | **NEU-887**, `../C005-product-foundation/01_evidence-taxonomy.md` | Every review record carries **exactly one** class. The creator's judgement is **3 `[dogfooding]`** and is never presented as class 7 (§7.2). |
| **`A1`–`A5`** — status flips only in the owning ledger, on correctly classed evidence, by union, never by replacement; conflicts and gaps preserved; **a producing task may not promote its own artifact to `settled`** | **NEU-887**, inherited via the C005 ledgers | The constitutional basis of §7 and §8, and the reason the `D-R7` row this document files ships **`unresolved`**. |
| **The per-cluster non-root `conceptual` obligation — routed, three routes open, SUB-5 deliberately did not choose** | **SUB-5 (NEU-961)**, `05_…` §6 | **An open dependency, registered as `OI-S8-3`, not resolved here.** A unit authored against a `conceptual` node in CL-2/CL-3/CL-4 has no node to attach to; the workflow states that such a unit cannot enter `draft` at all, because §3's entry precondition requires an existing `node_id`. It does **not** pick one of SUB-5's three routes on SUB-5's behalf. |

---

## 3. The unit workflow — states and transitions

### 3.1 The state set, closed

**Eight states. The set is closed:** a unit not in one of these eight is not in the workflow, and
§9's residual clause governs it.

| State | Kind | Meaning |
| --- | --- | --- |
| **`draft`** | initial | A unit exists and names an existing `node_id`. Nothing has been asserted about it. |
| **`authored`** | working | The author asserts the unit is complete against its form's template and the node's REQUIRED form set. |
| **`form-reviewed`** | working | Form conformance has been decided (SUB-2's template contract, including the mandatory pair). |
| **`correctness-reviewed`** | working | The applicable SUB-4 correctness standard has been decided, and its **verification mechanism** is recorded. |
| **`citation-checked`** | working | The unit's `problem-reference`, if it has one, has been through SUB-3's `V0`–`V7` and the outcome is recorded — including `none — gate`. |
| **`published`** | **terminal** | The unit is available for use. |
| **`blocked`** | **terminal** | The unit is not available and the obstruction is *within the workflow's own vocabulary* — a failed review, a missing precondition, or an unenumerated case (§9). |
| **`quarantined`** | **terminal** | The unit is not available and is held under a disposition **this document does not define**. See §5. |

**`revision-requested` is deliberately NOT a ninth state.** A returned unit re-enters `draft`,
carrying its review-record chain. A separate state would be a second name for the same position in
the graph, and the record chain — not the state label — is what makes the return auditable.

### 3.2 The transition table

**Every row names its reviewer role and its emitted record type. There is no unrecorded transition.**
The `Human / agent` column is **derived by §6's rubric**, not chosen here; §6.3 shows the derivation.

| # | From | To | Reviewer role | Record type | Human / agent (by §6) |
| --- | --- | --- | --- | --- | --- |
| **T-01** | *(none)* | `draft` | **author** | `RR-OPEN` | agent |
| **T-02** | `draft` | `authored` | **author** | `RR-AUTHOR` | either |
| **T-03** | `authored` | `form-reviewed` | **form-reviewer** | `RR-FORM` | agent |
| **T-04** | `authored` | `draft` | **form-reviewer** | `RR-FORM` (verdict `revise`) | agent |
| **T-05** | `form-reviewed` | `correctness-reviewed` | **correctness-reviewer** | `RR-CORRECT` | **human** for the Explanation standard (mechanism `AI`); agent otherwise |
| **T-06** | `form-reviewed` | `draft` | **correctness-reviewer** | `RR-CORRECT` (verdict `revise`) | as T-05 |
| **T-07** | `correctness-reviewed` | `citation-checked` | **citation-reviewer** | `RR-CITE` | agent |
| **T-08** | `citation-checked` | **`published`** | **publisher** | `RR-PUBLISH` | **human** |
| **T-09** | `citation-checked` | **`blocked`** | **publisher** | `RR-BLOCK` | **human** |
| **T-10** | *any working state* | **`blocked`** | the role owning that state's review | `RR-BLOCK` | **human** |
| **T-11** | *any state, including a terminal* | **`quarantined`** | **quarantine-recorder** | `RR-QUARANTINE` | **human** |
| **T-12** | `blocked` | `draft` | **author** | `RR-AUTHOR` (verdict `reopen`) | **human** |
| **T-13** | **`quarantined`** | *any state* | — | — | **NOT DEFINED HERE.** The exit from quarantine is governed by the `exit_condition` slot, which is **SUB-9-supplied and unpopulated** (§5). This row exists so the graph is honest about having an undefined edge, rather than silently omitting it. |

**Terminal reachability from `draft`, walked (AS-1).** `published`:
T-02 → T-03 → T-05 → T-07 → T-08. `blocked`: T-02 → T-03 → T-05 → T-07 → T-09, and additionally by
T-10 from any working state. `quarantined`: T-11, from any state including a terminal — quarantine is
reachable from `published` precisely because a unit already in use is the case where holding it
matters most. **All three terminals are reachable, each by at least one fully enumerated path, and
each transition on each path emits a record.** §10 walks one unit through all three.

### 3.3 Two entry preconditions, stated as preconditions rather than gates

- **A unit may not enter `draft` without an existing `node_id`.** SUB-2's templates require *"the
  exact node id from the map — copy it; if you cannot locate it, refuse."* A unit naming a node that
  does not exist has no attachment point, and §9's residual clause sends it to `blocked`.
- **A unit's form must be in the node's REQUIRED or OPTIONAL set** for that node's `skill_type`
  (SUB-2 §6.3). A unit whose form is not in either set is unenumerated, and §9 applies.

**Neither precondition is a gate.** Nothing here says who checks them, when, or what happens
mechanically if they are violated at build time. **That is SUB-9's.**

---

## 4. The review record — the durable artifact of every transition

### 4.1 The common field set

Every record type carries **all** of these. A record missing one is not a review record.

| Field | Value |
| --- | --- |
| `record_id` | Unique, stable, cited verbatim by anything that references the record. |
| `unit_id` | The content unit. |
| `node_id` | The map node the unit is authored against — **the exact id, copied, never reconstructed**. |
| `transition` | The `T-nn` id from §3.2, plus its `from` and `to` states. |
| `reviewer_role` | One of the six named roles in §4.2. |
| `reviewer_identity` | Who or what actually performed it — a person, or an agent with its provider/model+version, per class 4's provenance requirement when the reviewer is an agent. |
| `decided_at` | Date. |
| `evidence_class` | **Exactly one** of NEU-887's seven classes, with its structural limitation carried. Never two. Never class 7. |
| `verdict` | `pass` · `revise` · `block` · `quarantine` · `reopen`. Closed set. |
| `rationale` | Why. A record with a verdict and no rationale is an assertion, not a review. |

### 4.2 The six reviewer roles

**Roles, not people.** One person may hold several; the record names the role that acted.

| Role | Owns |
| --- | --- |
| **author** | T-01, T-02, T-12. Produces the unit; may not review it. |
| **form-reviewer** | T-03, T-04. Decides conformance to SUB-2's template contract. |
| **correctness-reviewer** | T-05, T-06. Decides the applicable SUB-4 standard and records its mechanism. |
| **citation-reviewer** | T-07. Records the `V0`–`V7` outcome. **Issues no request** — see §4.3. |
| **publisher** | T-08, T-09, T-10. The only role that may move a unit to `published` or `blocked`. |
| **quarantine-recorder** | T-11. The only role that may move a unit to `quarantined`. **This role's *authority* — who may hold it, and on what grounds — is part of quarantine's semantics and is therefore SUB-9's**, not stated here. |

**An author may not review their own unit** in T-03, T-05, T-07, T-08, T-09 or T-11. This is a
property of the record (`reviewer_identity` ≠ the unit's author), not a gate; **who enforces it is
SUB-9's.**

### 4.3 The three type-specific extensions, and the storage ceiling

| Record type | Adds |
| --- | --- |
| **`RR-CORRECT`** | `standard` — one of Explanation · Solution · Proof · Test; and `mechanism` — the standard's own verification mechanism, one of `AI` · `automated` · `schema` · `deterministic`, **copied from SUB-4, never re-derived**. |
| **`RR-CITE`** | `verification_step_reached` — the `V0`…`V7` step at which the procedure stopped; and `citation_ref` — **`stable_id` + `canonical_url` ONLY**, or the literal `none — gate`. |
| **`RR-QUARANTINE`** | `reason`, `owner`, `exit_condition` — see §5. |

**The storage ceiling, stated as a prohibition because a transition's evidence is exactly where a
wider field set would sneak in.** **No review record of any type stores problem statement text, a
title, constraints, a difficulty rating, or any citation field beyond `stable_id` + `canonical_url`**
while `CH-F5-1` is open. A record needing more **refuses and records the refusal**; it never invents,
recalls or estimates a value. This is `DR-C09-01`'s ceiling, applied to a surface `DR-C09-01` did not
anticipate, and it is stated here rather than assumed because *"the review record needed it"* is the
most plausible-sounding way the ceiling would have been breached.

**`RR-CITE` issues nothing.** At this cutoff every unit's `RR-CITE` records
`verification_step_reached: V0` and `citation_ref: none — gate`, because all twelve sources are
`Restricted` and the hierarchy has no reachable leaf. **`none — gate` is a real recorded value, not a
blank**, following SUB-3's own convention. Nothing in this workflow licenses a fetch;
`OI-S3-2` established capability, not authority.

---

## 5. Quarantine — named, reachable, and deliberately undefined

**Quarantine is a terminal state of this workflow (§3.1), reached by transition T-11 from any state,
recorded by the `quarantine-recorder` role, emitting an `RR-QUARANTINE` record.** That is the entire
content of this section that this sub-task owns.

**The `RR-QUARANTINE` record carries the common field set of §4.1 plus exactly three additional
slots:**

| Slot | Value | Status |
| --- | --- | --- |
| **`reason`** | *(unpopulated)* | **SUB-9-SUPPLIED** |
| **`owner`** | *(unpopulated)* | **SUB-9-SUPPLIED** |
| **`exit_condition`** | *(unpopulated)* | **SUB-9-SUPPLIED** |

**What "SUB-9-supplied and unpopulated" means, stated precisely so it cannot be read as an
oversight:** the slot is **required to be present** in every `RR-QUARANTINE` record. It carries **no
value, no default, no placeholder value, no worked example, and no enumerated candidate set** — here
or anywhere else in this package's SUB-8 output. **SUB-9 (NEU-965) defines what each slot means and
what may fill it.** Until then a conforming `RR-QUARANTINE` record has three named empty slots, and
that is the correct state, not a defect.

**Two symmetric failure modes, both stated because only stating one invites the other:**

- **A record whose slots this sub-task filled is a workflow failure.** Quarantine's semantics —
  including its distinctness from `blocked` — are SUB-9's single ownership. A value invented here
  would be a semantic asserted by a sub-task that was explicitly told it does not have one, and
  SUB-9 would then be reconciling against a squatter rather than defining on open ground.
- **A record that omits the slots is equally a workflow failure.** The whole point of reserving them
  now is that the record has a **defined shape** before its meaning exists, so SUB-9's landing is a
  fill rather than a schema change to every record already written.

**This document asserts nothing about the values SUB-9 will choose**, does not constrain them, does
not rank them, and does not state whether quarantine is stricter or looser than `blocked`. **T-13 —
the exit from quarantine — is undefined here by construction**, because the exit is exactly what
`exit_condition` governs.

---

## 6. Human review versus agent review — a rubric condition, not a preference

### 6.1 Why it is a condition

A per-step preference (*"we like a human to look at publishing"*) cannot be audited, cannot be
applied to a transition nobody anticipated, and drifts. **A condition can be evaluated against a
transition's own properties by someone who has never read this document.**

### 6.2 The condition

> **`review_mode(t)` for a transition `t`:**
>
> **`human` — REQUIRED if ANY of the following holds:**
>
> - **H1 — the transition's recorded verification mechanism is `AI`.** SUB-4 classes exactly one
>   standard this way: **Explanation**. An `AI`-judgment-only standard reviewed by an agent has the
>   agent judging its own class of judgment, and class 4 `[ai-critique]`'s own structural limitation
>   ("self-preference … agreement can be false confidence") is precisely the failure. SUB-4 handed
>   this standard to SUB-9 for a *compensating observable gate*; this rule is the workflow-side half
>   and does not pre-empt SUB-9's gate.
> - **H2 — the transition consumes a class 3 `[dogfooding]` judgement.** Class 3's definition is
>   *"the creator running benchmark journeys as a first-class learner."* An agent cannot produce or
>   confirm one; a record claiming otherwise is misclassed at source.
> - **H3 — the transition's target is a terminal state** (`published`, `blocked`, `quarantined`).
>   T-08, T-09, T-10, T-11. A terminal is where the workflow stops producing further review, so it
>   is where the absence of a human is least recoverable.
> - **H4 — the transition reverses a terminal.** T-12.
> - **H5 — the verdict materially turns on a value of class `P` (provisional).** SUB-7's five load
>   dimensions and `progression_stage`, all `creator_review: "deferred-provisional"` on 179/179. A
>   provisional input consumed as if binding is the laundering `07_…` §7 exists to prevent.
>
> **`agent` — ADMISSIBLE if NONE of H1–H5 holds AND both:**
>
> - **A1 — the recorded mechanism is `automated`, `schema` or `deterministic`** (SUB-4's other three
>   standards), or the transition records no mechanism at all; **and**
> - **A2 — the verdict is mechanically judgeable** — decidable from the unit and the map without a
>   judgment call.
>
> **`either` — otherwise.** Both are admissible; the record names which acted.

### 6.3 The condition applied to every transition in §3.2

| Transition | H1 | H2 | H3 | H4 | H5 | A1 | A2 | **Result** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 open | – | – | – | – | – | ✓ | ✓ | **agent** |
| T-02 author | – | – | – | – | – | ✓ | ✗ (authoring is not a verdict) | **either** |
| T-03 / T-04 form review | – | – | – | – | – | ✓ (`schema`-like: template conformance) | ✓ | **agent** |
| T-05 / T-06 correctness review | **✓ when `standard = Explanation`** | – | – | – | – | ✓ otherwise | ✓ otherwise | **human** for Explanation; **agent** for Solution / Proof / Test |
| T-07 citation review | – | – | – | – | – | ✓ (`V0`–`V7` is deterministic) | ✓ | **agent** |
| T-08 publish | – | – | **✓** | – | – | – | – | **human** |
| T-09 / T-10 block | – | – | **✓** | – | – | – | – | **human** |
| T-11 quarantine | – | – | **✓** | – | – | – | – | **human** |
| T-12 reopen | – | – | – | **✓** | – | – | – | **human** |
| **L-loop filing (§7)** | – | **✓** | – | – | **✓** | – | – | **human — the creator specifically** |

**Every row resolves by rule.** No row was assigned and then justified.

---

## 7. The in-situ creator-review loop

**The problem it solves, in one sentence:** the creator has decided to review the map's provisional
stages **gradually, while learning**, and `A1` makes the owning ledger the **only** place a status
changes — so without a defined route, every such judgement lands somewhere that changes nothing, and
179 nodes stay provisional forever while everyone believes a review is under way.

### 7.1 The seven steps

| Step | Name | What happens |
| --- | --- | --- |
| **L-0** | **Trigger** | While learning, the creator forms a judgement about a node — that its `progression_stage` is implausible, or that one of its five load dimensions is mis-set. The trigger is the creator's own encounter with the material. Nothing schedules it. |
| **L-1** | **Capture** | The judgement is written down **with class 3's required provenance**: a recorded protocol run, a **date**, and a **journey id**. A judgement without all three cannot be correctly classed and therefore cannot be filed. |
| **L-2** | **Class** | **Exactly one** evidence class: **3 `[dogfooding]`**, carrying its structural limitation verbatim — *"One skilled learner; overfits; not representative of the target population."* See §7.2. |
| **L-3** | **Scope test** | Is the judgement about a class **P** dimension (the five loads or `progression_stage`)? **Yes** → continue. **No** → it is not a creator review and does not enter this loop; see §7.3. |
| **L-4** | **Compose** | **Exactly one** candidate entry per judgement, in the `CR-1` route's shape (§7.4). One judgement, one entry. A session that produced four judgements produces four entries, never one merged entry and never a summary. |
| **L-5** | **File** | The entry is **appended** to `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`, **by union**, in a new terminal subsection. **No existing row, subsection or byte is modified.** Filing anywhere else is §8's failure. |
| **L-6** | **Adjudicate, then flip** | The **ledger's owner** adjudicates the candidate. **Only on adjudication** does the party authorised to write `nodes/*.yaml` change the node's `creator_review` value, citing the adjudicated entry's id **verbatim** in the node's `notes`. **The filer never flips the flag, and never adjudicates their own candidate** (`A4`). |

### 7.2 The evidence class, and the laundering bar

**Class 3 `[dogfooding]`** — *"The creator running benchmark journeys as a first-class learner."*
Provenance: recorded protocol run, date, journey id. Structural limitation: *"One skilled learner;
overfits; not representative of the target population."*

**The creator is simultaneously the first-class initial learner and the only qualified reviewer of
the map's provisional values.** That dual role is why this evidence is admissible at all — and
exactly why it must be labelled. **It is a proxy signal.** Under NEU-887's rule 3, classes 1–6 may
**never** be relabelled or summarised as class 7 `[future-real-user]`. Concretely, and by name: a
`creator_review` flipped by this loop **must not** be described, in any downstream artifact, as
*validated*, *user-tested*, *expert-confirmed*, or *proven for our learners*. It is **one skilled
learner's judgement, recorded and dated.** That is worth a great deal more than
`deferred-provisional`, and a great deal less than validation.

### 7.3 The scope test, and where an out-of-scope judgement goes instead

**`prerequisite_depth` is class MD (verified; re-derived 179/179 agree).** A judgement that it is
wrong is **not** a creator review — it is a claim that a *re-derivable* value disagrees with its
rubric, which the C005 integrity validator settles mechanically. It routes to the integrity
validator and, if confirmed, to a finding — **not** to this loop.

**`entry_gate` is excluded outright** (`F-943-3`, restated by `07_…` §4.3): it is a deterministic
function of `progression_stage` and carries no independent information. **A judgement about
`entry_gate` is a judgement about `progression_stage`** and is refiled as one, or it is nothing.

**Percentile, cohort, empirical-distribution and cross-node-ranking claims are inadmissible outright**
(`07_…` §4.4, class X). The loop **refuses** them; it does not downgrade them into a class 3 entry.
A creator judgement is about **one node**, and *"this node is harder than that one"* is a
cross-node ranking wearing a single-node costume.

### 7.4 The `CR-1` filing route

**A new filing route, minted here in the shape the ledger's §3 already uses for `D-S1a`, `AR-1` and
the `D-F4a` U4 challenge**, and declared in the `D-R7` row rather than by editing §3's table — the
table is another task's row set, and appending to it in place would violate the same append-only
discipline this loop exists to defend.

| Route | Who files | When | Procedure | Interim state |
| --- | --- | --- | --- | --- |
| **`CR-1`** — creator review judgement | **The creator** (only — H2 of §6.2) | A while-learning judgement about a node's `progression_stage` or one of the five load dimensions | Capture with class 3 provenance (L-1); class it (L-2); pass the scope test (L-3); compose **one** entry naming the **node id**, the **dimension**, the **current value**, the **judged direction** (`too-low` / `too-high` / `mis-set`), the **rationale**, the **journey id** and the **date**; append it in a new terminal subsection (L-5) | **Node's `creator_review` stays `"deferred-provisional"`** until the ledger's owner adjudicates. **The filer changes nothing in the map.** |

**The success condition of the whole loop, stated as one testable sentence:** *a correctly classed
candidate entry exists in the schema decision ledger, filed by union, naming one node and one
dimension, and no other artifact changed.* Not *"the creator reviewed some nodes."*

### 7.5 The observable path from an entry to a flipped flag (AS-2)

Five artifacts change, in this order, and no other:

1. **The judgement record** (class 3, dated, journey id) — created by **the creator** at L-1.
2. **The schema decision ledger** — one appended candidate entry under `CR-1` at L-5, by **the
   creator**. The node is untouched.
3. **The ledger's adjudication** — an appended disposition by the **ledger's owner** at L-6. **Not
   the filer** (`A4`).
4. **The node's `difficulty_dimensions.creator_review`** — changed from `"deferred-provisional"` to
   the adjudicated value, by **the party authorised to write `nodes/*.yaml`** (the map's owner /
   the creator, the same routing `INC-C7` and `INC-S2` already carry).
5. **The node's `notes`** — the adjudicated entry's id, **verbatim**, so the flip is traceable back
   to the evidence that caused it.

**Steps 3–5 are outside this sub-task and are performed by nobody today.** The path is *specified and
observable*, not *executed*. That distinction is `CAP-S8-2`.

---

## 8. Recording a judgement anywhere else is a workflow failure

**Stated as a failure, not a preference, because the failure is silent by construction:** a judgement
written into a node's YAML *looks* like review, *reads* like review, and changes the status of
nothing. `A1` is unambiguous — the ledger declares itself *"the sole source of truth for the status
of every node in the map. No other file sets a status. Not the README, not `manifest.yaml`, not a
node's YAML."*

| Where the judgement was recorded | Disposition | Corrective route |
| --- | --- | --- |
| **A node's `difficulty_dimensions` block** — e.g. editing `creator_review` directly, or changing a load value | **FAILURE**, and the most damaging one: the map now disagrees with the ledger, and the disagreement is invisible to a reader of either file alone | **Revert the node edit**, then refile as a `CR-1` candidate entry (§7.4). The reverted edit is **not** evidence and is **not** cited by the entry — the entry stands on its own class 3 provenance. |
| **A node's `notes`, with no adjudicated ledger id** | **FAILURE.** `notes` cites ledger ids **verbatim**; a note citing nothing is a claim with no adjudication behind it | Remove the uncited note; file the `CR-1` entry; re-add the note **only after** adjudication, citing the entry id verbatim. |
| **A README, an index, or a manifest** | **FAILURE.** None of these sets a status | Refile as a `CR-1` entry. Leave the README alone thereafter. |
| **A session note, a scratch file, or a chat transcript** | **FAILURE — and the most likely one**, because it is where a while-learning judgement naturally lands first | This is the **expected** intermediate. It becomes a valid **L-1 capture** the moment it carries the class 3 provenance triple (protocol run, date, journey id) and is then filed at L-5. **Un-filed, it counts as zero review**, however many judgements it holds. |
| **A commit message or a PR description** | **FAILURE.** Neither is an artifact of record for status | Refile as a `CR-1` entry. |
| **A C009 topic document, including this one** | **FAILURE.** A C009 document is not the owning ledger for a map node's status, and this document sets no status | Refile as a `CR-1` entry. |

**The audit that detects it (AS-3):** for every node whose `creator_review` is not
`"deferred-provisional"`, there is an adjudicated ledger entry whose id the node's `notes` cite
verbatim. **A node that fails this check has been reviewed by a path this workflow defines as a
failure.** At this cutoff the check passes **vacuously** — 179/179 are still
`"deferred-provisional"`, so the set of nodes to check is empty. **A vacuous pass is recorded as
vacuous** (`OI-S8-4`), never reported as a clean audit.

---

## 9. The residual clause

> **"…and any content unit or review judgement whose path is not enumerated above."**

**Such a case defaults to `blocked`, pending classification by SUB-8.** It **never** defaults to
`published`.

**Owned, not assumed.** The residual is **NEU-963's**. The enumeration in §3.2 is **the floor, not
the boundary** — an unenumerated unit is a gap this sub-task records (`OI-S8-1`), not one that
disappears because eight states and thirteen transitions are listed.

**Why `blocked` and not `quarantined`:** `blocked` is the terminal whose meaning this document owns
in full (§3.1). Defaulting to `quarantined` would route unenumerated cases into a state whose
semantics **do not exist yet**, making SUB-9's future definition retroactively govern a population
SUB-9 never saw. **The default must land in a state this document can define, and only one terminal
qualifies.**

Three cases are already known to hit the residual, listed so it is a **predicted** filing rather
than a surprise:

1. **A unit naming a `node_id` that does not exist** (§3.3).
2. **A unit whose form is in neither the REQUIRED nor the OPTIONAL set** for its node's `skill_type`.
3. **A unit authored against a `conceptual` obligation in CL-2, CL-3 or CL-4** — where SUB-5 records
   **zero** non-root `conceptual` nodes and three open routes, **none chosen**. There is no
   attachment point, so the unit is `blocked`, and **this document does not choose among SUB-5's
   three routes to create one** (`OI-S8-3`).

---

## 10. The dry runs

### 10.1 Unit walkthrough — one unit, all three terminals (AS-1)

**Unit `U-DR-1`**, a `retrieval` item authored against **`cl-1.judge-dp-applicability`** — a real
non-root node, `skill_type: "conceptual"`, for which `retrieval` is a REQUIRED form under SUB-2's
placement matrix. The node file is **read, never written**.

| # | Transition | Record | `reviewer_role` | `evidence_class` | Verdict | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | T-01 | `RR-OPEN` | author | 2 `[code-evidence]` | `pass` | `node_id` resolves in `../C005-dp-map/nodes/cl-1-foundational.yaml`. |
| 2 | T-02 | `RR-AUTHOR` | author | 2 `[code-evidence]` | `pass` | Carries the mandatory pair and a `hint_ladder`, per SUB-2's `retrieval` template. |
| 3 | T-03 | `RR-FORM` | form-reviewer | 2 `[code-evidence]` | `pass` | Template conformance; **agent** by §6.3. |
| 4 | T-05 | `RR-CORRECT` | correctness-reviewer | 4 `[ai-critique]` | `pass` | `standard: Explanation`, `mechanism: AI` → **human required** (H1). |
| 5 | T-07 | `RR-CITE` | citation-reviewer | 2 `[code-evidence]` | `pass` | `verification_step_reached: V0`; `citation_ref: none — gate`. **No request issued.** |
| 6 | T-08 | `RR-PUBLISH` | publisher | 4 `[ai-critique]` | `pass` | → **`published`** (H3, human). |
| **Branch A** | T-09 from step 5 | `RR-BLOCK` | publisher | 2 `[code-evidence]` | `block` | → **`blocked`**, e.g. on the §9 residual. |
| **Branch B** | T-11 from any state | `RR-QUARANTINE` | quarantine-recorder | 2 `[code-evidence]` | `quarantine` | → **`quarantined`**. Record shown in §10.2. |

**All three terminals reached; every transition emitted a record with a named role and exactly one
evidence class.**

### 10.2 The quarantine record, as produced

```
record_id:            RR-Q-DR-1
unit_id:              U-DR-1
node_id:              cl-1.judge-dp-applicability
transition:           T-11  (from: published → to: quarantined)
reviewer_role:        quarantine-recorder
reviewer_identity:    <the party holding the role>
decided_at:           2026-08-10
evidence_class:       2 [code-evidence]  — limitation: shows availability, not pedagogical validity
verdict:              quarantine
rationale:            <the recording party's own>
reason:               —   [SUB-9-SUPPLIED · UNPOPULATED]
owner:                —   [SUB-9-SUPPLIED · UNPOPULATED]
exit_condition:       —   [SUB-9-SUPPLIED · UNPOPULATED]
```

**The three slots are present and empty. No value, no default, no example, no candidate set.** The
`—` is a typographic placeholder for *absent*, not a value.

### 10.3 The in-situ loop dry run — one judgement, one entry (AS-2)

> **⚠ This is a DRY RUN. The judgement below is a specification instrument, not the creator's actual
> judgement.** It carries **no evidential weight**, it is **not** a class 3 `[dogfooding]` datum (no
> protocol run and no journey id exist), and it flips **nothing**. `creator_review` remains
> `"deferred-provisional"` on **179/179** nodes after this document lands. What the dry run
> demonstrates is that the **route is executable end to end** — the same thing SUB-3's
> template-fabrication probes demonstrate for their templates.

| Step | Executed as |
| --- | --- |
| **L-0 Trigger** | A while-learning encounter with `cl-1.judge-dp-applicability`. |
| **L-1 Capture** | *Simulated.* The provenance triple would be `protocol run` + `date` + `journey id`. **In this dry run all three are absent, and that is why the entry is a candidate labelled `dry-run` rather than a fileable class 3 datum.** |
| **L-2 Class** | Would be **3 `[dogfooding]`**, one class, limitation carried. |
| **L-3 Scope test** | `progression_stage` is class **P** → **in scope**. (Had the judgement been about `prerequisite_depth`, class **MD**, it would have routed to the integrity validator instead — §7.3.) |
| **L-4 Compose** | **Exactly one** entry. Node `cl-1.judge-dp-applicability`; dimension `progression_stage`; current value `PS-1`; judged direction `too-low`; rationale: the node's acquisition is the **joint** admissibility judgement (substructure *and* overlap together, per SUB-5's CL-1 obligation), while `PS-1` bands it with the earliest post-root material and its own `recognition_load` is recorded as `3`. |
| **L-5 File** | Appended to the schema decision ledger in a **new terminal subsection**, by union, **§3.12.1**, labelled `dry-run`. No prior row, subsection or byte modified. |
| **L-6 Adjudicate & flip** | **NOT PERFORMED.** The ledger's owner has not adjudicated; no `nodes/*.yaml` was written; `creator_review` is unchanged on all 179 nodes. |

**Count check: exactly one candidate entry was produced.** Not zero, not two, not a merged summary.

### 10.4 The ledger-discipline audit (AS-4)

| Check | Passing condition | Result |
| --- | --- | --- |
| **LD-1** | Only additions in `01_schema-decision-ledger.md` | **Pass** — `git diff --numstat` reads `N 0`; zero deletions. |
| **LD-2** | No row replaced; `D-R5` and `D-R6` preserved byte-for-byte | **Pass** — both present and unmodified; `D-R7` is a **new** id in a **new** subsection. |
| **LD-3** | Conflicts and gaps preserved, not smoothed | **Pass** — `X-S1`…`X-D3` untouched; §4's `INC-S#` markers untouched; SUB-5's three open routes restated as open (§9), not resolved. |
| **LD-4** | No status self-promoted (`A4`) | **Pass** — `D-R7` ships **`unresolved`**. |
| **LD-5** | The map is unwritten | **Pass** — `git diff -- docs/research/C005-dp-map/` is **empty**; the dry-run node was read only. |
| **LD-6** | Both shared registers append-only | **Pass** — `N 0` on `90_…` and `91_…`; prior `### SUB-n` sections byte-for-byte. |

---

## 11. Scope — what this document does not decide

- **It defines no gate.** Which transition is enforced, how, where, and with what blocking behaviour
  is **SUB-9's (NEU-965)** on both axes — the same two axes SUB-4 left unassigned and SUB-5
  restated. §6's rubric says *who reviews*; it does **not** say *what happens if nobody does*.
- **It defines no quarantine semantics.** §5's three slots are reserved and empty. **SUB-9 is
  quarantine's single owner.**
- **It sources, verifies and requests no citation.** `V0`–`V7` is named and its record required;
  the procedure is **not** restated, re-derived or executed, and **no request is authorised to any
  source on any branch**. Cluster citation coverage remains `0/4`.
- **It widens no stored field set.** `stable_id` + `canonical_url` only, while `CH-F5-1` is open.
- **It resolves none of SUB-5's three open routes** for the per-cluster `conceptual` obligation.
  Registered as `OI-S8-3`; §9 case 3 states the consequence without choosing.
- **It reviews no node.** 179/179 remain `creator_review: "deferred-provisional"`. It specifies the
  loop and dry-runs it once.
- **It touches no learner-facing surface** (NEU-891, NEU-892) — charter assumption 8.
- **It edits no ledger row in place**, no sibling topic document, no `nodes/*.yaml`, and not
  `92_package-completeness-gate.md`, which is **NEU-969's (SUB-12)** alone.
- **It settles no decision of its own to `settled`.** `A4` forbids it, and the `D-R7` row is
  `unresolved` accordingly.

---

## 12. Verification note — `qa-execution:engine` is unconfigured

The repository's capability registry resolves **`git`** and **`linear`** only. **No capability owns
the `qa-execution:engine` surface**, so an automated QA pass over this document is a genuine **Core
Article 8 no-op** — the phase runs inert because no engine is registered, which is the designed
behaviour and not a failure.

**What that costs, stated rather than glossed:** the checks in §10.4 were executed as real
commands over the working tree (`git diff --numstat`, `git diff`) and their outcomes are reported
above. **The workflow itself has no automated conformance check** — nothing mechanically verifies
that a real `RR-QUARANTINE` record carries three empty slots, or that a `CR-1` entry is correctly
classed. **Building that check is a gate, and gates are SUB-9's.** Recorded as `CAP-S8-3`, owner
named, with a closure condition — never reported as a QA pass.

---

## 13. Evidence and records

- **Companion register:** `traceability/08_workflow-evidence-and-non-mutation-audit.md` — one row per
  material claim, exactly one NEU-887 evidence class each, plus the reserved-slot audit and the
  non-mutation check.
- **Ledger row:** `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` **§3.12**,
  id **`D-R7`**, status **`unresolved`**, plus **§3.12.1** carrying the single dry-run `CR-1`
  candidate entry.
- **Open items:** `OI-S8-1` … `OI-S8-5` in `90_open-items-and-provisional-register.md`.
- **Caps:** `CAP-S8-1` … `CAP-S8-4` in `91_caps-and-incomplete-scope.md`.
