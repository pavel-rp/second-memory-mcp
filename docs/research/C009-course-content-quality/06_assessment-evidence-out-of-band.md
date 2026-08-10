# Assessment Evidence for a Learner Who Solves Out of Band

**Task:** NEU-962 (SUB-6) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Covers:** OUT-5 · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

The product sends the learner to the source platform to solve. That single decision removes the in-app judge and the captured keystrokes the instructional model's assessment control assumes, and it leaves behind a learner who returns saying *"I solved it."* This document answers what that sentence is worth — signal by signal, gate by gate, threshold by threshold.

The answer is mostly **nothing**, and the interesting work is in saying precisely where the nothing stops. A learner who solves out of band produces **no in-system attempt trail**: the ordinary chain `exposure_precondition` → attempt sequence → `solution` never runs, because none of its steps happened here. So this document does two jobs of equal weight. It names which signals survive that absence and which gates they may legitimately open — and it names, by gate letter and by threshold id, **the gates that cannot be opened at all without fabricating evidence.** The second list is a deliverable, not a caveat. A design that only enumerates what it can infer is a design that will infer something it cannot.

Nothing here is re-decided. The route was settled upstream (charter assumption 22, **confirmed**); this document specifies and proves it. The gates, thresholds and mechanisms are consumed from `../C005-instructional-model/`, the evidence classes from `../C005-product-foundation/01_evidence-taxonomy.md`, and the form field names from `02_content-and-exercise-forms.md` — **verbatim, never translated.** SUB-9 (NEU-965) has to merge this mapping into one enforceable quality system without a translation layer, so every field name below is spelled exactly as SUB-2 defined it.

---

## 1. Summary — the five rules this document establishes

**Read this section before any table.** Everything after it is the derivation.

| # | Rule | Where it is proved |
| --- | --- | --- |
| **R1** | **Bare self-report feeds no gate.** `self_report_outcome` has an **empty** may-feed list. Gates A, B, C, D and E all appear in its may-not-feed list, and no `MM-T*` threshold appears in its may-feed list. | §3, §4.1 |
| **R2** | **Only in-app artifacts the system owns are gate-bearing** — the `retrieval` item result, the `assessment` item result, and the **pasted-back solution**, which *is* an in-app artifact, so the real solving work still counts. | §4, `decision-records/DR-C09-02_dr-m08-routing.md` |
| **R3** | **A happy-path-only item may not carry a gate.** Every gate-bearing `retrieval` and `assessment` item names the misconception it separates in `misconception_or_edge_case` and the input that separates it in `separating_distractor_or_boundary_input`. | §5 |
| **R4** | **The evidence record is corpus-neutral.** Its identity is the graph node id plus the skill type. The cited problem is a **replaceable attribute** and is never any part of the key, so retiring a citation changes exactly two subfields and strands no mastery history. | §6, `dry-run/06_corpus-swap-verification.md` |
| **R5** | **Gates D and E cannot be opened by out-of-band evidence at all**, and Gate C cannot be opened *directly* by any signal. Where the evidence does not exist, the correct outcome is **refusal, not inference**. | §8 |

**What this document is not.** It specifies evidence; it enforces nothing. No runtime gate exists yet — that seam is SUB-9's, and `CAP-S2-4` already names it. Every `MM-T*` value quoted below is **binding in shape, open in value**: this design may cite a provisional value, and may never lower one.

---

## 2. The tension, stated exactly

`DR-M08` requires a **structured, rubric-anchored payload** graded deterministically, and names **bare self-report a rejected alternative**. It does not permit self-report for out-of-band solving; it simply never contemplated the case. Out-of-band solving is an **unaddressed** case there, not a permitted one, so the design has to be re-derived against what is actually observable rather than read off an existing permission.

What is actually observable, for a learner who solved on the source platform:

- **Not** the attempt sequence. There were no in-app attempts, so there is no first attempt, no `hint_ladder` rung consumed, no second attempt, and no recorded failure.
- **Not** the `exposure_precondition`. `solution`'s `exposure_precondition` names *"the attempt state after which the learner may see this"*. An out-of-band solver never produced that state. **Evidence that depends on `exposure_precondition` is therefore unavailable for the out-of-band path — and no gate-bearing evidence in this design depends on it** (§7.4).
- **Not** the solve latency. We observe when the learner *returned*, never when they started or finished. The gap between those is unbounded and unobserved.
- **What is** observable: whatever the learner subsequently does **inside the app** — the solution they paste back, the `retrieval` items they answer, the `assessment` items they answer, the `reflection` they write — plus their unverified assertion about what happened elsewhere.

The design's whole content follows from that split. The last item feeds nothing. The others feed what their own grading supports, and no more.

---

## 3. The signal enumeration

Every observable signal, with its reliability class under the seven-class taxonomy and its failure mode. **One class per signal.** Composite signals are split rather than averaged.

### 3.1 The signals

| Signal id | What it is | In-app artifact the system owns, or learner assertion? | Reliability class | Failure mode — **dishonest** / **mistaken** / **drifted-problem** |
| --- | --- | --- | --- | --- |
| **`self_report_outcome`** | A bare *"I solved it"* acknowledgement. No artifact, no content, no rubric. | **Learner assertion.** Nothing about the external solve is captured. | **6 `[operational-log]`** — an unverified assertion captured as an operational event; nothing is computed from it and no oracle checks it. | **Dishonest:** the learner never attempted the problem and asserts success to clear a gate; the assertion is indistinguishable from a true one because there is nothing to compare it against. **Mistaken:** the learner solved a *different* problem, or believes a wrong solution was accepted, or misread which node the problem was cited under. **Drifted:** the learner truly solved the problem *as it now stands* after the source changed its constraints, so the success is real but is evidence about a different problem than the node cites. |
| **`pasted_solution`** | The learner's own solution text, pasted back into the app and graded through `rubric_payload` → the deterministic mapper. | **In-app artifact the system owns.** The pasted text is submitted, persisted and graded by us. | **2 `[code-evidence]`** — the quality is *computed* by `mapRubricToQuality` from a rubric-anchored payload, deterministically and fail-closed. | **Dishonest:** the learner pastes a solution they did not write (copied from an editorial, another learner, or a model). The content may be perfectly correct — correctness is exactly what this failure mode does **not** disprove. **Mistaken:** the learner pastes an earlier, superseded draft, or a solution to an adjacent problem. **Drifted:** the pasted solution is correct for the problem's *former* constraints and wrong for its current ones (or the reverse), so the grade measures the learner against a specification the node no longer cites. |
| **`retrieval_item_result`** | The graded result of an in-app **`retrieval`** item — `stem`, `expected_response`, the REQUIRED pair, `hint_ladder`, `spacing_eligible`. | **In-app artifact the system owns.** Authored by us, answered here, graded here. | **2 `[code-evidence]`** — the item, the expected response and the grading are all ours. | **Dishonest:** the learner looks the answer up mid-item; `hint_ladder` bounds but does not eliminate this, and the item is answerable without the source in view precisely to raise its cost. **Mistaken:** the learner holds a misconception that happens to produce the expected response on this stem — which is what `separating_distractor_or_boundary_input` exists to prevent (§5). **Drifted:** the item's stem was authored against a cited problem whose constraints have since changed, so a correct answer about the *current* problem reads as wrong (or vice versa). |
| **`assessment_item_result`** | The graded result of an in-app **`assessment`** item — `task`, `rubric_payload`, the REQUIRED pair, `gate_relevance`. | **In-app artifact the system owns.** | **2 `[code-evidence]`** — the 0–5 quality is derived deterministically from the rubric payload by a non-LLM mapper; no free judgement enters it. | **Dishonest:** the learner submits work that is not theirs; the rubric payload measures the *text*, and the text's authorship is not observable. **Mistaken:** the learner's model is wrong in a way the rubric's four criteria do not separate — bounded by requiring a justifying span per credited criterion (§5.4). **Drifted:** the `task` references a problem whose constraints moved, so a criterion is graded against a stale specification. |
| **`post_hoc_reflection`** | The learner's response to an in-app **`reflection`** item — `prompt`, `target_articulation`, the REQUIRED pair, `remediation_hook`. | **In-app artifact the system owns** (the item is ours; the *content* is a learner narrative). | **2 `[code-evidence]`** for the item and its routing; the narrative content is not an oracle-checked signal and is never scored as one. | **Dishonest:** the learner writes what they think the prompt wants; a reflection is the easiest signal in the system to say the right words into. **Mistaken:** the learner sincerely articulates a wrong model in fluent language, which reads as insight. **Drifted:** the reflection is about a problem whose constraints changed, so a correct articulation describes a specification the node no longer cites. |
| **`return_timing`** | Our own timestamps: when the problem was cited, and when the learner returned to the app. | **Observed by us** — but it is **not** solve latency (see the composite note below). | **6 `[operational-log]`** — an operational timestamp pair, subject to `P5`/`EX6` aggregate-only handling. | **Dishonest:** the learner returns quickly with a copied solution, producing a *fast* signal that reads as fluency. **Mistaken:** the learner solved on paper days earlier and pasted late, producing a *slow* signal that reads as struggle. **Drifted:** irrelevant to drift — the timestamps are ours and are correct about themselves; they are simply not about solving. |

### 3.2 The composite that must be split

**`outcome_and_timing` is not one signal, and this design refuses to record it as one.** It is `self_report_outcome` (an assertion about an outcome we did not observe) glued to `return_timing` (a timestamp pair we did observe about something other than solving). Averaging them produces a number that looks like a measured solve time and is not one.

They are therefore **split into the two rows above**. Neither half feeds a gate, and the composite as such does not exist in the record shape.

**Why `return_timing` is not solve latency, stated so it cannot be quietly reused as one.** We observe *citation time* and *return time*. Between them the learner may have solved immediately and gone to lunch, or thought for three days, or never solved at all. The elapsed interval bounds nothing. `MM-T15` (Gate E) is defined on **median solve latency on durable items against a reference** — a quantity this signal does not approximate, and the difference between "we did not measure it" and "we measured something else" is exactly the difference between a gap and a fabrication.

### 3.3 The residual clause

> **…and any observable signal not enumerated above**

defaults to reliability class **`unclassified`** and **may feed no gate** until classified by this sub-task. It is a **standing** clause: it is not discharged by this document, and it is filed as an owned open item (`OI-S6-1`) with a named owner and a revision trigger, not as a closed one.

### 3.4 Class discipline

Each signal above carries **exactly one** class. **No signal is assigned class 7 `[future-real-user]`** — that class does not yet exist for this package, and no class 1–6 signal here is relabelled as class 7 anywhere. That prohibition is the taxonomy's **no-cross-class-laundering** rule, and it is the same shape as this document's own central rule: a weak signal is not promoted by being restated in stronger words.

---

## 4. The signal → gate mapping

For every signal: an explicit **may-feed** list and an explicit **may-not-feed** list, over gates **A–E** and thresholds **`MM-T1`…`MM-T15`**, named by id. Neither list is ever elided as "the rest"; together they account for all five gates.

### 4.0 How the fidelity thresholds are mapped

**`MM-T4`, `MM-T5`, `MM-T6` and `MM-T7` are mapped as preconditions, not as gate outputs, and no signal feeds them.** They are properties of the *grading and feedback system* — assessment agreement, the over-validation ceiling, rebuttal-invariance, correct-answer-exposure detection — measured over a held-out adversarial fixture, not accumulated from one learner's answers. A per-learner signal that "fed" `MM-T5` would be a category error: the ceiling is a bound on the grader, not a score for the learner. They appear in every signal's may-not-feed list for that reason, and they gate every other threshold by sitting upstream of them (§9).

### 4.1 `self_report_outcome` — the empty row

| | |
| --- | --- |
| **May feed** | **Nothing. The list is empty.** |
| **May not feed** | **Gate A**, **Gate B**, **Gate C**, **Gate D**, **Gate E** — all five. `MM-T1`, `MM-T2`, `MM-T3`, `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7`, `MM-T8`, `MM-T9`, `MM-T10`, `MM-T11`, `MM-T12`, `MM-T13`, `MM-T14`, `MM-T15` — all fifteen. |

**Stated as a rule, not only as a table cell:** *a bare acknowledgement that the learner solved something elsewhere is not evidence about the learner's model, and it advances nothing.* It may be recorded — it is useful for placement, sequencing and for knowing what to ask about next — and recording it is not the same as counting it. **No gate anywhere in this design is reachable by `self_report_outcome`, alone or in combination.** In combination is the important half: a signal that feeds nothing cannot become gate-bearing by being averaged with one that does.

### 4.2 `pasted_solution`

| | |
| --- | --- |
| **May feed** | **Gate A** via `MM-T9` (≥1 unaided correct application) — **only** subject to the unaidedness caveat below. **Gate B** via `MM-T1` (counts as **one** non-massed success toward K) and `MM-T3` (the derived quality must clear q ≥ 3). Remediation `MM-T13` (a trustworthy-graded failure counts toward the leech trigger) and `MM-T14` (post-lapse savings, applied off-ladder). |
| **May not feed** | **Gate C** directly, and `MM-T8` — Gate C is server-evaluated from persisted multi-session history and reads Gate B's *output*; no single artifact reaches it (§9). **Gate D**, `MM-T11`, `MM-T12` — one external problem is not ≥3 mixed problem types under interleaving, and category discrimination cannot be evidenced by a single solve. **Gate E**, `MM-T15` — the solve was not timed by us (§3.2). `MM-T2` **on its own** — session separation is a property of the sequence of counted successes, not of one artifact; a `pasted_solution` contributes its session reference to that sequence but cannot satisfy the separation criterion by itself. `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7` — preconditions (§4.0). `MM-T10` — worked-example fade is acquisition-side and is driven by in-app unaided-success rate on faded examples. |

**The unaidedness caveat, recorded rather than assumed.** `MM-T9` requires an **unaided** correct application. Whether the *external* solve was unaided is **not observable** — the learner may have read an editorial first. This design therefore does **not** treat a `pasted_solution` as self-certifying for Gate A. The residual exposure is recorded (`OI-S6-3`) with its **compensating in-app signal**: Gate A is opened by a `retrieval_item_result` on the same node, answered in-app without the source in view, whose unaidedness *is* observable because we control the surface. The `pasted_solution` supplies quality; the in-app item supplies unaidedness.

### 4.3 `retrieval_item_result`

| | |
| --- | --- |
| **May feed** | **Gate A** via `MM-T9` (unaided correct application — the surface is ours, so unaidedness is observable). **Gate B** via `MM-T1` (one counted success), `MM-T2` (session separation — carried by the item's own **`spacing_eligible`** field, which declares whether the item may count toward the spaced criterion at all) and `MM-T3` (quality floor). **Gate D** via `MM-T11` and `MM-T12`, **but only** for items in the interleaved pool answered under mixed-type presentation (§8.2). Remediation `MM-T13`, `MM-T14`. |
| **May not feed** | **Gate C** directly, and `MM-T8` — server-evaluated composite only. **Gate E**, `MM-T15` — a retrieval item is not a solve-latency reference and its response time is not a contest-speed measurement. `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7` — preconditions. `MM-T10` — fade is driven by worked-example exposure, not retrieval. |

**`hint_ladder` is load-bearing here.** `M03` requires a real hint-scaffolded second attempt **before a failure is recorded**. An item whose `hint_ladder` was consumed still produces a valid result; what it does not produce is an **unaided** one, so a hint-assisted success may feed `MM-T1` and `MM-T3` but **may not** feed `MM-T9`, which names unaidedness explicitly.

### 4.4 `assessment_item_result`

| | |
| --- | --- |
| **May feed** | **Gate A** via `MM-T9` (when unaided). **Gate B** via `MM-T1` and `MM-T3` — the 0–5 quality derived deterministically from `rubric_payload`, never binary-collapsed. Remediation `MM-T13`, `MM-T14`. |
| **May not feed** | **`MM-T2`** — and this is a contract consequence, not a preference: **`spacing_eligible` is a field of the `retrieval` form, not of the `assessment` form.** An `assessment` item carries no declaration that it may count toward the spaced criterion, so it cannot supply one. Session separation for Gate B is evidenced by `retrieval` items. **Gate C** directly, and `MM-T8`. **Gate D**, `MM-T11`, `MM-T12` — an assessment item is not an interleaved-discrimination trial. **Gate E**, `MM-T15`. `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7` — preconditions. `MM-T10`. |

### 4.5 `post_hoc_reflection`

| | |
| --- | --- |
| **May feed** | **Remediation only, off-ladder:** `MM-T13` (routing a flagged leech to reformulation via **`remediation_hook`**) and `MM-T14` (post-lapse handling). |
| **May not feed** | **Gate A**, **Gate B**, **Gate C**, **Gate D**, **Gate E** — all five. `MM-T1`, `MM-T2`, `MM-T3`, `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7`, `MM-T8`, `MM-T9`, `MM-T10`, `MM-T11`, `MM-T12`, `MM-T15`. |

**Why a reflection is not gate-bearing even though the form is discriminative.** `reflection` carries the REQUIRED pair and is discriminative in SUB-2's sense — its job is to surface a wrong model. Surfacing a wrong model is diagnostic, and **diagnosis is not durability**. Letting a fluent narrative contribute to `MM-T1` would launder articulation into mastery, which is the same failure as laundering a weak grade into an unlock, one layer up. Its home is remediation routing, which is exactly where `remediation_hook` points. `M09` requires a flagged leech to emit a **reformulation action, not a silent suspend**, and this routing is how that requirement is met without touching a gate.

### 4.6 `return_timing`

| | |
| --- | --- |
| **May feed** | **Nothing gate-bearing. The list is empty for gate purposes.** It may inform scheduling and placement, which are not gates. |
| **May not feed** | **Gate A**, **Gate B**, **Gate C**, **Gate D**, **Gate E**. `MM-T1`…`MM-T15` — all fifteen, and **`MM-T15` emphatically** (§3.2, §8.1). |

### 4.7 Any signal not enumerated

Class **`unclassified`**; **may-feed empty**; may-not-feed **A, B, C, D, E and `MM-T1`…`MM-T15`**. It becomes gate-bearing only by being classified here, in this document, by amendment — never by being used.

### 4.8 The mapping at a glance

| Signal | Gate A | Gate B | Gate C | Gate D | Gate E | Off-ladder remediation |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| `self_report_outcome` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `pasted_solution` | ✓ (with §4.2 caveat) | ✓ | ✗ (only via B) | ✗ | ✗ | ✓ |
| `retrieval_item_result` | ✓ | ✓ | ✗ (only via B) | ✓ (pool only) | ✗ | ✓ |
| `assessment_item_result` | ✓ | ✓ (not `MM-T2`) | ✗ (only via B) | ✗ | ✗ | ✓ |
| `post_hoc_reflection` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `return_timing` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| *any signal not enumerated* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Two columns are entirely empty of out-of-band evidence: Gate D and Gate E.** That is §8's subject, and it is a finding, not an omission.

---

## 5. Discriminating design of gate-bearing items

`CAP-S2-4` assigns "the discriminating design of gate-bearing items" to this sub-task. SUB-2 decided *which* form holds a misconception and *in which field*; this section decides *what goes in the field* for an item that carries a gate.

### 5.1 The binding rule

> **An item that only probes the happy path may not carry a gate.**

`gate_relevance` records which dependent an item's result can contribute to unlocking. An item may carry a non-empty `gate_relevance` **only if** it satisfies the mechanical check in §5.2. An item that fails the check is still a perfectly good item — it simply carries no gate, and its result feeds only the off-ladder remediation thresholds.

### 5.2 The mechanical check for "happy-path-only"

An item is **happy-path-only** — and therefore may not carry a gate — if **any** of the following holds. Each is decidable by inspection, not by taste:

1. **`misconception_or_edge_case` is empty, or names no specific wrong model** — a value like *"misunderstanding the algorithm"* names a category, not a misconception, and fails.
2. **`separating_distractor_or_boundary_input` is empty, or its value does not change the correct answer.** The test is concrete: *substitute the named misconception's method into the item and evaluate it on the named input.* If it produces the `expected_response` (or credits the same rubric criteria), the input does not separate, and the item fails.
3. **No edge case from §5.3's required set is probed.**
4. **The item's correct answer is reachable by the named misconception on every input the item presents.** This is condition 2 generalised over multi-part items and is the condition that actually catches a plausible-but-wrong model.

Condition 2 is the one that matters, and it is stated as an executable procedure precisely so that "does this item discriminate?" is not answered by the item's author's confidence.

### 5.3 The edge cases every gate-bearing item must probe

At minimum, and named in `misconception_or_edge_case` or in the item's own inputs:

| Edge case | Why it is required |
| --- | --- |
| **Empty / degenerate input** | The zero-size case is where an off-by-one in the base case is visible and nowhere else. |
| **The base case itself** | A learner can carry a correct recurrence and a wrong base case indefinitely; only a direct probe separates them. |
| **The boundary at which the recurrence stops holding** | The single most valuable probe: it is where a locally-correct method and a globally-correct one part company, and it is the input a happy-path item never contains. |

### 5.4 The worked demonstration — greedy substitution for an overlapping-subproblem recurrence

The named misconception this design must discriminate, at minimum, is **greedy substitution for an overlapping-subproblem recurrence**: the learner believes that taking the locally best choice at each step yields the global optimum, and has never met an input where it does not.

**Why it survives ordinary items.** On a canonical coin system the greedy method and the correct recurrence agree on *every* input. An item built on such a system credits the greedy learner in full. That item is happy-path-only by §5.2 condition 4, and under this design it may not carry a gate — which is the whole point of the rule.

**The item, in SUB-2's fields.**

| Field | Value |
| --- | --- |
| `misconception_or_edge_case` | *Greedy substitution for an overlapping-subproblem recurrence: the learner selects the largest admissible denomination at each step and asserts the result is optimal.* |
| `separating_distractor_or_boundary_input` | *A non-canonical coin system — denominations `{1, 3, 4}` with target `6`. The greedy method yields `4 + 1 + 1` (three coins); the correct recurrence yields `3 + 3` (two coins). The distractor answer offered is the greedy one, so the misconception has a home to go to rather than being forced into a blank.* |
| `task` (assessment) / `stem` (retrieval) | *State the recurrence for minimum-coin-count over this denomination set, evaluate it at the target, and justify why the locally-largest choice is not optimal here.* |
| `gate_relevance` | *Contributes to unlocking dependents of this node.* (Relevance only — **never a threshold value.**) |

**What the greedy learner's answer scores, computed against the shipped mapper.** `mapRubricToQuality` credits a criterion only when it is claimed `true` **and** a non-empty justifying span accompanies it; weights are `correct_recurrence` 2, `correct_base_case` 1, `correct_iteration_order` 1, `complexity_stated` 1, summing to 5.

| Criterion | Weight | Credited? | Why |
| --- | :-: | :-: | --- |
| **`correct_recurrence`** | 2 | **No** | The answer contains no span stating a recurrence over overlapping subproblems — it states a selection rule. Even if a grader claimed the criterion `true`, **no justifying span exists to accompany it**, and the mapper is fail-closed on exactly that: an unaccompanied claim is not credited. |
| **`correct_iteration_order`** | 1 | **No** | A greedy walk has no subproblem table, so there is no order over subproblems to justify. No span exists. |
| `correct_base_case` | 1 | Yes | The learner correctly states that a target of zero costs zero coins. |
| `complexity_stated` | 1 | Yes | The learner states a complexity for their own method. |

**Derived quality = 1 + 1 = 2.** `MM-T3` requires **q ≥ 3**. **2 < 3, so the item is not passed and the gate threshold is not satisfied.** The misconception is **detected rather than passed** — and it is detected by the criterion whose weight is 2, which is why the recurrence criterion carries double weight in the first place.

**The uncredited criterion is named, as required:** **`correct_recurrence`** (with `correct_iteration_order` following from it).

### 5.5 The rule generalised to every gate-bearing item

Every gate-bearing `retrieval` and `assessment` item on a dynamic-programming node repeats this shape: the `separating_distractor_or_boundary_input` is chosen as an input on which the *named* wrong method and the correct one **disagree**, the distractor offered is the wrong method's own answer, and the rubric criterion the wrong method cannot justify is the one carrying the weight. An item that cannot name such an input does not discriminate, and by §5.1 it does not carry a gate.

---

## 6. The corpus-neutral evidence record

### 6.1 Identity, and what is not identity

> **The record's identity is the graph node id and the skill type. The cited problem is never any part of it.**

That sentence is the whole design. Everything below is its consequences.

| Field | Obligation | Meaning | In the key? |
| --- | --- | --- | :-: |
| **`node_id`** | **REQUIRED** | The graph node the evidence is about, in the map's node-id grammar. | **Yes** |
| **`skill_type`** | **REQUIRED** | Exactly one of the eight fixed literals: `proof`, `optimization`, `debugging`, `transfer`, `strategic`, `implementation`, `procedural`, `conceptual`. | **Yes** |
| **`learner_id`** | **REQUIRED** | Whose evidence this is. Scopes the record; carries no problem content. | **Yes** |
| **`session_ref`** | **REQUIRED** | The session this observation belongs to. Supplies `MM-T2` separation. | **Yes** |
| **`observed_at`** | **REQUIRED** | When we observed it (never when the learner claims they solved). | **Yes** |
| **`signal`** | **REQUIRED** | One of the enumerated signal ids in §3.1, or `unclassified`. | No |
| **`reliability_class`** | **REQUIRED** | Exactly one of the seven classes, or `unclassified`. Never class 7. | No |
| **`item_form`** | **REQUIRED** for an item-derived record | One of `retrieval`, `assessment`, `solution`, `reflection` — SUB-2's form names, unchanged. | No |
| **`rubric_payload`** | **REQUIRED** for a graded artifact | The structured rubric-anchored payload, as `assessment` defines it. Never a self-report. | No |
| **`derived_quality`** | **REQUIRED** for a graded artifact | The 0–5 value the deterministic mapper produced. Never binary-collapsed. | No |
| **`gate_relevance`** | **REQUIRED** for a gate-bearing record | Which dependent this result can contribute to unlocking. Relevance, **never** the threshold. | No |
| **`citation`** | **OPTIONAL, REPLACEABLE** | `{ stable_id, canonical_url }` — **and nothing else** while `CH-F5-1` is open. | **No — never** |

**`citation` is the only replaceable attribute, and it is deliberately outside the key.** A record with a retired citation is still a complete, addressable record about a node and a skill type. A record keyed *by* its citation would be a record that ceases to exist when the citation does — which is precisely the stranding this design prevents.

### 6.2 The field set, under both dispositions of `CH-F5-1`

The citation attribute holds **`stable_id` + `canonical_url` and nothing else**, per `DR-C09-01` and the interim set that binds every C009 sub-task while ledger challenge **`CH-F5-1`** is open against **`D-F5`**. `CAP-S1-2` records that the question is **filed, not decided**, and this document **does not widen the set locally**.

**This design's position, recorded for both dispositions:**

| If `CH-F5-1` resolves… | What changes in this design |
| --- | --- |
| **In favour of the wider set** (`title`, numeric `constraints`, difficulty signal, curriculum placement become admissible) | The `citation` attribute may carry more subfields. **The record shape, the swap procedure, and the list of what survives a swap are unchanged.** No key changes, no gate result changes, no history changes. |
| **Against the wider set** (the interim set stands) | **Nothing changes.** The design is already written against `stable_id` + `canonical_url`. |

**Therefore SUB-6 carries no field-set cap of its own on this axis** — and that is a derivation, not a convenience. The shape is invariant under the challenge's outcome *because identity is the node plus the skill type and never the citation*. A design whose record shape depended on the field set would have to carry the cap; this one does not, and `91_…`'s `### SUB-6` section accordingly asserts no wider field set.

**What this design must therefore never do:** store the external problem's text, or the learner's out-of-band submission, as a *problem-reference* field. The pasted-back solution is stored as **the learner's own in-app artifact** under `rubric_payload` / the graded record — it is the learner's expression, not the source's, and it is not a problem-reference field. That distinction is what keeps the pasted solution admissible without widening anything. Where any evidence this design wanted would have required a wider stored set, it was **refused, not invented** (§10).

### 6.3 The swap procedure

When a cited problem is retired, drifts, or is replaced:

1. **Select** every evidence record whose `citation.stable_id` equals the retiring identifier. The selection is by attribute, never by key — the key does not mention the citation.
2. **Write** the replacement `{ stable_id, canonical_url }` into `citation`. Both subfields are replaced together; a half-swapped citation is not a valid value.
3. **Write nothing else.** No other field is read, recomputed, or touched. This is a constraint on the procedure, not a description of it.
4. **Recompute nothing.** No quality is re-derived, no counted success is re-counted, no gate is re-evaluated — because **no gate input changed**. Every gate input (`derived_quality`, `session_ref`, `observed_at`, `node_id`, `skill_type`) sits outside the citation.
5. **Degrade the placement, not the history.** What the retired citation *was* — a suggested problem at a node — becomes unavailable, and that placement is refilled by the normal citation route. The learner's accumulated evidence at that node is untouched by both steps.

### 6.4 What survives a swap, and what does not

| **Survives — intact, unrecomputed** | **Does not survive** |
| --- | --- |
| `node_id`, `skill_type`, `learner_id`, `session_ref`, `observed_at` — the entire key | `citation.stable_id` — replaced |
| `derived_quality` and `rubric_payload` for every graded artifact | `citation.canonical_url` — replaced |
| Counted successes toward **`MM-T1`** (Gate B's K) | The *placement* that offered the retired problem at that node |
| Session separation toward **`MM-T2`** | |
| Quality-floor determinations against **`MM-T3`** | |
| Gate **A** results (`MM-T9`), Gate **B** results, and the Gate **C** composite (`MM-T8`) computed from them | |
| Gate **D** pool membership (`MM-T11`, `MM-T12`) | |
| Remediation counters — **`MM-T13`** consecutive-failure count, **`MM-T14`** post-lapse state | |
| `signal`, `reliability_class`, `item_form`, `gate_relevance` | |

**Nothing in the left column is derived from the citation, which is why the right column is two subfields long.** The executed run of this swap — against a specimen record with a **placeholder** citation, needing no verified citation and therefore no SUB-3 output — is recorded in `dry-run/06_corpus-swap-verification.md`. That is the package's **single execution** of this check; **SUB-10 cites it rather than re-running it against a second record shape.**

---

## 7. The three adversarial scenarios

Each scenario is run against the design above. Each resolves to **what stops the advance** or to a **residual exposure recorded with its compensating in-app signal** — never to neither. Every residual named here is also filed in `90_…` or `91_…`, so none lives only in this prose.

### 7.1 A learner who reports success falsely

**The scenario.** The learner never attempted the problem, returns, and asserts *"I solved it."*

**What stops the advance.** **`self_report_outcome` has an empty may-feed list** (§4.1). There is no gate, and no threshold, that this assertion can reach — alone or combined with any other signal. The advance is stopped not by detecting the lie but by **never having routed the signal anywhere it could do damage.** That is the stronger property: it does not depend on detection working.

**What the learner must do instead to advance.** Answer the node's in-app `retrieval` and `assessment` items. Those are gate-bearing, they are ours, and §5's discrimination requirement means answering them without the model is not appreciably easier than having the model.

**Residual exposure:** none at the gate. The false report still pollutes *placement* (the system may stop offering that problem), which is a scheduling cost, not a mastery claim. Filed as **`OI-S6-2`**.

### 7.2 A learner who reports success on a problem whose constraints have drifted

**The scenario.** The learner genuinely solved the problem as it now stands. The source changed the constraints after the citation was recorded, so the problem the learner solved is not the problem the node cites.

**What stops the advance.** Partially: the report itself feeds nothing (§4.1), and the `pasted_solution`, if any, is graded against **our** rubric criteria — `correct_recurrence`, `correct_base_case`, `correct_iteration_order`, `complexity_stated` — which are properties of the *learner's method*, not of the source's current constraint text. A method that is correct for an overlapping-subproblem recurrence is graded as such regardless of which bounds the source now prints.

**The residual exposure, recorded plainly.** Drift can still make a gate-bearing **item** wrong: a `retrieval` item authored against the old constraints may now have a stale `expected_response`, and a learner reasoning correctly about the *current* problem would be marked incorrect. **This design does not detect drift** — detection is SUB-10's (NEU-966), explicitly out of scope here.

**The compensating in-app signal.** Because the evidence record is **corpus-neutral** (§6), a drifted citation is survivable rather than corrupting: when drift *is* detected downstream, the swap procedure (§6.3) replaces the citation and **every accumulated gate result stands**, since none of them was computed from the citation. The compensation is structural — the design guarantees the *blast radius* of drift is two subfields and one placement, and never a learner's mastery history. Filed as **`OI-S6-4`**, owner SUB-10.

### 7.3 A learner who pastes back a solution they did not write

**The scenario.** The learner copies a correct solution from an editorial, another learner, or a model, and pastes it in.

**What partially stops the advance.**

- The `pasted_solution` alone **cannot open Gate A**: `MM-T9` requires an unaided application, and this design does not treat a pasted solution as self-certifying for unaidedness (§4.2).
- It **cannot open Gate C**: `MM-T8` is server-evaluated from persisted multi-session history and reads Gate B's output; one artifact does not reach it.
- It **cannot open Gate B by itself**: `MM-T1` requires **K = 3** non-massed successes and `MM-T2` requires **≥ 2 separated sessions, ≥ 1 day apart**. A single paste satisfies neither. Copying once buys one counted success at most.
- It **cannot open Gates D or E at all** (§8).

**The residual exposure, stated without softening.** **Authorship is not observable.** A learner who copies a correct solution *and* answers the node's gate-bearing items correctly across separated sessions will clear Gate B — and at that point the design's honest position is that they have demonstrated the thing the gate measures, whatever happened on the source platform. The exposure that remains is narrower and real: **one counted success toward `MM-T1` may be obtained by copying.**

**The compensating in-app signal.** The remaining two of K = 3 must come from **`retrieval_item_result`** and **`assessment_item_result`** on our own items, in **separated sessions** (`MM-T2`), each of which must **discriminate the node's named misconception** (§5). A copied solution transfers no ability to answer a discriminating item, and `MM-T2`'s day-apart separation removes the option of copying everything in one sitting. Filed as **`OI-S6-3`**, with `CAP-S6-2` recording that no in-app signal closes the authorship gap.

**What was deliberately not done.** No stylometric, timing-based, or similarity-based authorship inference is proposed. Each would manufacture a confident-looking signal out of evidence that does not support one, and `RA5` already forbids the closest analogue — AI judgement as the signal of record.

---

## 8. What cannot be opened at all

**This section is a required output.** For these gates, on out-of-band evidence, the correct response is **refusal, not inference** — the same discipline the package applies to an unverifiable citation: *refuse rather than invent.*

### 8.1 Gate E — contest-speed (`MM-T15`). Not openable by any out-of-band signal.

`MM-T15` is defined on **median solve latency ≤ 1.5× a reference on durable items**. For an out-of-band solve we hold **no solve latency at all** — only `return_timing`, which measures the interval between citing a problem and the learner coming back, an interval containing arbitrary amounts of not-solving (§3.2). There is no transformation of `return_timing` into a solve latency that is not a fabrication.

**Consequence:** **no out-of-band signal may feed `MM-T15`, and Gate E may not be opened on out-of-band evidence.** Gate E remains reachable — but only from in-app timed items on already-durable chunks, which is a *different evidence source*, not this one. And per the mastery model, Gate E **may not relax any of A–C** regardless.

### 8.2 Gate D — interleaved pool entry (`MM-T11`, `MM-T12`). Not openable by out-of-band evidence.

`MM-T11` requires the **last N = 3 unaided attempts correct**; `MM-T12` requires **accuracy ≥ 0.8 across ≥ 3 mixed problem types**, where the axis is **category, not difficulty**. A single external problem solved out of band is one item of one type, with unaidedness unobservable. Neither threshold has an out-of-band form.

**Consequence:** Gate D is opened **only** by in-app `retrieval_item_result`s presented under mixed-type interleaving. `pasted_solution` may not feed `MM-T11` or `MM-T12`.

### 8.3 Gate C — not openable *directly* by any signal (`MM-T8`).

This is not an out-of-band limitation; it is the model's own architecture, restated so that nobody routes around it. `MM-T8` requires **Gate B cleared and a retrievability posterior ≥ B\***, **server-evaluated from persisted multi-session history**, and it explicitly **rejects `repetitions > 0`** as a proxy. No individual signal — including every in-app one — feeds Gate C directly. Gate C reads Gate B's output. §9 is the check.

### 8.4 `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7` — not fed by any signal.

Preconditions on the grading and feedback system, measured over a held-out fixture (§4.0). No learner signal, in-app or out, feeds them.

### 8.5 `MM-T10` — not reachable from this path.

Worked-example fade is acquisition-side and driven by unaided success on faded worked examples. An out-of-band solve produces no fade evidence.

### 8.6 The summary of refusals

| Gate / threshold | Openable on out-of-band evidence? | The evidence that does not exist |
| --- | --- | --- |
| **Gate E** / `MM-T15` | **No — not at all** | Solve latency. We hold return time, which is not it. |
| **Gate D** / `MM-T11`, `MM-T12` | **No — not at all** | ≥3 mixed-type in-app trials, and observable unaidedness. |
| **Gate C** / `MM-T8` | **Not directly, by any signal** | A multi-session server-evaluated composite cannot come from one artifact. |
| `MM-T4`, `MM-T5`, `MM-T6`, `MM-T7` | **Not fed by any signal** | These bound the grader, not the learner. |
| `MM-T10` | **No** | Faded worked-example exposure. |
| **Gate A** / `MM-T9` | **Only via an in-app item** | Unaidedness of the *external* solve — never observable (§4.2). |
| **Gate B** / `MM-T1`, `MM-T2`, `MM-T3` | **Yes, through in-app artifacts** | — (this is the one gate the design genuinely serves) |

---

## 9. The composition invariant, checked for gates B and C

The invariant, reproduced in its binding wording from `../C005-instructional-model/mastery-model/00_operational-mastery-model.md:55`:

> **Composition invariant:** Gate C reads the *output* of Gate B, which reads the *output* of the fidelity precondition. A weak grade (fidelity) therefore cannot be laundered into an unlock (durability) — this is why C4 (assessment) is a stated **precondition** of C1 (progression), exactly as DR-M10 and DR-M08 require, and why neither is resolved here.

**The check, against this design.**

| Claim | Holds? | Why |
| --- | :-: | --- |
| A weak grade cannot be laundered into an unlock. | **Yes** | Gate C's only input is Gate B's output (`MM-T8`), and Gate B's counted successes are admitted only at `derived_quality ≥ 3` (`MM-T3`), which is itself produced by the deterministic mapper under the fidelity precondition (`MM-T4`–`MM-T7`). **No signal in §4 feeds Gate C directly** — every may-not-feed list says so explicitly. There is no edge in this design from any artifact to `MM-T8`. |
| A signal that feeds no gate cannot acquire one by composition. | **Yes** | `self_report_outcome`, `return_timing`, `post_hoc_reflection` and any unclassified signal have empty gate may-feed lists (§4.1, §4.5, §4.6, §4.7). Nothing in §4 combines a non-feeding signal with a feeding one to produce a gate input; the record shape gives each observation its **own** `signal` and `reliability_class` (§6.1), so there is no field in which an average could be stored. |
| Contest-speed evidence never lowers an unlock bar. | **Yes** | Gate E may not be opened on out-of-band evidence at all (§8.1), and where it *is* opened from in-app timed items it sits **after** Gate C and **may not relax any of A–C**. No `MM-T15` value appears in any may-feed list for `MM-T1`, `MM-T2`, `MM-T3` or `MM-T8`. |
| C4 (assessment) remains a precondition of C1 (progression). | **Yes** | Restated, not resolved. |

**Neither C4 nor C1 is resolved here, and this document resolves neither.** It consumes the invariant and demonstrates conformance to it.

---

## 10. Privacy, and the live exposure this design must not rely on

- **No signal defined here exposes a raw learner payload.** `P5` binds: raw learner payloads are never exposed, and log-derived evidence is **aggregate-only**. `EX6` excludes un-gated operational-log payloads outright.
- The two class-6 signals — `self_report_outcome` and `return_timing` — are **the two that feed no gate**, which is convenient but not accidental: a signal whose evidentiary route is aggregate-only cannot carry a per-learner mastery claim, and the mapping says so independently in §4.1 and §4.6.
- **The live exposure, stated rather than relied on.** `src/shared/logger.ts`'s `LOG_REDACT` redacts only `password`, `token`, `apiKey`, `api_key`, `authorization` and `secret`, and its own doc comment records that learner `response` text is **intentionally not redacted**. Any signal in this design that carries learner content — a `pasted_solution`, an `assessment` answer, a `reflection` — therefore travels through a logging path that does not redact it today. **This design does not fix that** (no `src/` change is in scope) and **does not lean on redaction it does not have**: it is filed as **`OI-S6-5`** with a named owner and a revision trigger.
- **`RA5` is retained: AI grading is not the signal of record.** The signal of record is the **deterministic mapping** of a rubric-anchored payload, already shipped in `src/domain/algorithms/grade-mapper.ts`. `MC-4`'s over-validation metric is labelled **`PROXY-BOUNDING`** and its ceiling is enforced by the held-out check in `src/domain/algorithms/over-validation-guard.ts` (`MM-T5`). **This document proposes no change to either**, and none is made.
- **Refuse rather than invent.** Where a signal would have required storing external problem text, an out-of-band submission as a problem-reference field, or an inferred attempt trail, it was **refused** — not approximated. §8 is the list of those refusals.

---

## 11. What this document does not do

Restated explicitly, mirroring `02_content-and-exercise-forms.md` §9's shape, so no reader mistakes a boundary for an omission:

- **It implements no grader, judge, or submission surface.** No `src/`, `tests/`, schema or migration change of any kind is made here.
- **It does not weaken `DR-M08`'s deterministic rubric→quality mapping or `MC-4`'s over-validation ceiling.** Both are already implemented; both are honoured; neither is touched.
- **It does not reopen the `DR-M08` route, re-decide it locally, or file an instructional-ledger challenge for it.** The route was decided upstream; a local re-decision is inadmissible. See `decision-records/DR-C09-02_dr-m08-routing.md`.
- **It does not carry SUB-2's forms-side misconception treatment** — which form holds a misconception and in which field is SUB-2's, already landed. This document designs the *discriminating content* of gate-bearing items.
- **It defines no learner-facing review or tutoring surface** (NEU-891, NEU-892).
- **It builds no gate.** The gates that *enforce* this design are SUB-9's (NEU-965), which is why every field name here is SUB-2's own, untranslated.
- **It does not detect drift.** Drift detection is SUB-10's (NEU-966). This document supplies only the corpus-neutral record shape that makes a drifted citation survivable, plus the single executed corpus-swap verification SUB-10 cites.
- **It sets no status.** Status lives in a ledger, and a producing task may not promote its own artifact.
