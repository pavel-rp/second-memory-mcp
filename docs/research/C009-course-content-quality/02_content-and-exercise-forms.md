# Content and Exercise Forms — the Ten Forms and their Non-Fabricable Templates

**Task:** NEU-958 (SUB-2) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Covers:** OUT-1 (residual owner) · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

This document answers one question the program had never answered: **what a content or exercise unit actually *is*.** Not what makes it good — that bar is SUB-4's (correctness) and SUB-9's (gates). What it *is*: which fields it must carry, what an author may and may not fill them with, which instructional mechanism it serves, and where on the map it belongs.

Ten forms are defined. Each has a required-field definition, exactly one authoring template, at least one `M01`–`M10` mechanism trace, and a placement rule stated against the map's node-id grammar and the eight skill types. **Zero forms are untraced.**

---

## 1. Summary — the ten forms and their template contracts

**This is the contract every downstream sub-task builds on.** SUB-4's correctness standards, SUB-6's assessment evidence, SUB-9's quality gates and SUB-11's exemplars all attach to the names and obligations in this table. Read it before reading anything else.

| # | Form | What it is | Template contract — the obligation the template enforces | Discriminative? |
| --- | --- | --- | --- | --- |
| 1 | **lesson** | The expository unit that introduces one node's idea and the conditions under which it applies. | Must state the node's applicability condition and its **non**-applicability condition. Refuses invented empirical claims; every non-obvious assertion carries a citation slot the author must fill or leave explicitly refused. | no |
| 2 | **example** (worked example) | A fully derived instance, worked end to end, with the reasoning steps visible rather than implied. | Must show every derivation step, must declare its scaffold-fade level, and **must carry the required misconception/edge-case field** with the separating input. Refuses an invented problem it cannot cite. | **yes** |
| 3 | **visualization** | A rendering that makes an otherwise invisible state, transition or invariant directly observable. | Must name the exact state object it renders and the invariant the learner should see hold or break, and **must carry the required misconception/edge-case field**. Refuses a decorative rendering with no named invariant. | **yes** |
| 4 | **problem-reference** | A citation record pointing at an externally hosted problem. **It is not content.** | **Fillable fields are `stable_id` and `canonical_url` only.** Every wider field exists solely in the not-yet-storable variant (§5). No template offers a wider field as fillable. An id or URL that cannot be verified is **refused, never invented**. | no |
| 5 | **solution** | A correct approach to a referenced problem, written as the post-attempt exposure artifact. | Must be reachable only after the attempt sequence the learner actually owns, and must state its own approach class. Refuses to restate a problem statement (no external text is stored). | no |
| 6 | **proof** | The justification that a recurrence, bound or transformation is correct. | Must state the claim, the argument, **and the boundary at which the claim stops holding** — the boundary is the required misconception/edge-case field. Refuses an asserted bound with no argument. | **yes** |
| 7 | **test** | An executable check that a learner's artifact behaves correctly, including at its boundaries. | Must carry at least one boundary case as the required misconception/edge-case field, expressed as a concrete input class rather than a description. Refuses an invented expected output. | **yes** |
| 8 | **reflection** | A prompt that makes the learner articulate *why* an approach applied, surfacing a wrong model if one is held. | **Must carry the required misconception/edge-case field**: the specific wrong model the prompt is built to surface, and the response that reveals it. Refuses an open-ended "what did you learn?" with no target. | **yes** |
| 9 | **retrieval** | A short item answered from memory, before any answer is shown, whose result feeds the mastery signal. | **Must carry the required misconception/edge-case field** with its separating distractor. Must be answerable without the source in view. Refuses an item whose answer is visible in its own stem. | **yes** |
| 10 | **assessment** | A gate-bearing item whose graded result can unlock a dependent node. | **Must carry the required misconception/edge-case field** with its separating distractor, and must emit a structured rubric-anchored payload rather than a self-report. Refuses a bare self-report as evidence. | **yes** |

**Seven of the ten forms are discriminative** (§4). Every discriminative form carries **one REQUIRED field pair** — `misconception_or_edge_case` and `separating_distractor_or_boundary_input` — and **a submission that omits either is rejected by the form definition itself**, not accepted with a note and not warned.

**The highest-priority constraint on this document is `C2`.** Incident `EXC-1` established that a template which displays a fabricable example citation *causes* fabrication: two independent mappers invented problem citations from a schema template's own illustration. This document therefore contains **no example citation of any kind** — no id, no URL, no plausible-looking identifier a reader could copy as if it were real. Every placeholder in every template is visibly non-data instruction text in angle brackets, and **every one of the ten templates carries its own refuse-rather-than-invent line** rather than relying on a single global statement.

---

## 2. How a form definition is read

Each definition in §3 lists its fields with an explicit **REQUIRED** or **OPTIONAL** mark. Nothing is left to inference.

- **REQUIRED** — a submission omitting the field is **not a valid instance of the form**. The form definition rejects it. This document specifies the rejection as a property of the form; it specifies no gate, severity tier or linter rule to enforce it — enforcement is SUB-9's (NEU-965).
- **OPTIONAL** — the field may be absent without affecting validity.

**Provisionality is surfaced, never laundered.** Any field reading a node's stage or difficulty inherits `creator_review: "deferred-provisional"` from the map (all 179 mapped nodes carry it) and says so. A form never presents provisional upstream data as settled.

**Mechanisms are binding in shape, open in value.** The learning-critical set is **M03** (Retrieval Practice), **M04** (Spacing), **M06** (Feedback), **M08** (Assessment), **M09** (Remediation) and **M10** (Progression); **M01** (Sequencing), **M02** (Worked Examples), **M05** (Interleaving) and **M07** (Productive Struggle) are not learning-critical (`../C005-instructional-model/package/00_per-mechanism-index.md`). **No form below weakens a learning-critical control.** Calibrated numbers are open; observable behaviour and the control are not.

---

## 3. The ten required-field definitions

Fields shared by every form, listed once and not repeated per form: `form` (REQUIRED — one of the ten names), `node_id` (REQUIRED — see §6 placement), `title` (REQUIRED), `body` (REQUIRED), `author_kind` (REQUIRED — human or agent), `provenance_note` (OPTIONAL).

### 3.1 lesson

| Field | Obligation | Meaning |
| --- | --- | --- |
| `applies_when` | **REQUIRED** | The condition under which this node's technique is the right choice. |
| `does_not_apply_when` | **REQUIRED** | The condition under which it is the wrong choice. A lesson that only says when a technique works teaches a rule the learner cannot switch off. |
| `prerequisite_recall` | **REQUIRED** | Which already-unlocked node the lesson assumes, referenced by node id. A **structural** reference only (§6.4). |
| `claim_citations` | **REQUIRED** | One slot per non-obvious empirical claim. An unverifiable claim is refused or the assertion is removed — never cited to an invented source. |
| `worked_pointer` | OPTIONAL | Node-local reference to the example form that follows. |

### 3.2 example (worked example)

| Field | Obligation | Meaning |
| --- | --- | --- |
| `derivation_steps` | **REQUIRED** | Ordered steps, each showing the reasoning, not only the result. |
| `scaffold_fade_level` | **REQUIRED** | Where this example sits on the fade band — full derivation, partial, or completion-only. `M02` fades scaffolding monotonically as the expertise signal rises; an example that does not declare its level cannot be faded correctly. |
| `misconception_or_edge_case` | **REQUIRED** | See §4. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4. |
| `problem_ref` | OPTIONAL | A problem-reference form instance (§3.4) — **never an inline invented problem**. |

### 3.3 visualization

| Field | Obligation | Meaning |
| --- | --- | --- |
| `renders_state` | **REQUIRED** | The exact state object rendered — the table, the mask, the interval, the layer. |
| `invariant_shown` | **REQUIRED** | The invariant the learner should observe holding, or visibly breaking. |
| `misconception_or_edge_case` | **REQUIRED** | See §4. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4. |
| `interaction` | OPTIONAL | Whether the learner may step, scrub or perturb the state. |

### 3.4 problem-reference

**This form's field set is fixed by SUB-1 and is consumed here, never re-decided.** The cap is cited by id: **`CH-F5-1`** (the open ledger challenge against `D-F5`), **`DR-C09-01`** (the reasoned decision record, which sets no status of its own), **`CAP-S1-2`** (the C009 register entry). §5 states both dispositions in full.

| Field | Obligation | Meaning |
| --- | --- | --- |
| `stable_id` | **REQUIRED** | The externally assigned, stable identifier of the problem. |
| `canonical_url` | **REQUIRED** | The canonical address of the problem on its host. |

**That is the entire fillable field set.** The form gains **no** access-path field, **no** resolution-route field and **no** fetch-date field — that record belongs to SUB-3 (NEU-959) and lives in the package's own verification record, not here. It stores **no** problem statement text (`D-F3a`: no field holds verbatim external content).

### 3.5 solution

| Field | Obligation | Meaning |
| --- | --- | --- |
| `approach_class` | **REQUIRED** | The named technique class the solution instantiates. |
| `reasoning` | **REQUIRED** | Why the approach applies to the referenced problem. |
| `exposure_precondition` | **REQUIRED** | The attempt state after which the learner may see this. `M06` requires a correct-answer-exposure step **before** a chunk outcome is recorded on a path with a failed attempt; a solution that is reachable before the attempt sequence completes would weaken that control. |
| `problem_ref` | **REQUIRED** | The problem-reference instance this solves. |
| `complexity_claim` | OPTIONAL | Stated bound. Where present it is a claim, not a measurement, and is marked as such. |

### 3.6 proof

| Field | Obligation | Meaning |
| --- | --- | --- |
| `claim` | **REQUIRED** | The exact statement being justified. |
| `argument` | **REQUIRED** | The justification. An asserted bound with no argument is not a proof form. |
| `misconception_or_edge_case` | **REQUIRED** | See §4 — for this form, the boundary at which the claim stops holding. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4. |
| `depends_on_claims` | OPTIONAL | Prior claims consumed, by node id. |

### 3.7 test

| Field | Obligation | Meaning |
| --- | --- | --- |
| `subject` | **REQUIRED** | What artifact the test checks. |
| `input_class` | **REQUIRED** | The concrete class of inputs exercised, expressed as a class rather than a prose description. |
| `expected_behavior` | **REQUIRED** | What correct behaviour is. Refused rather than guessed when unknown. |
| `misconception_or_edge_case` | **REQUIRED** | See §4 — for this form, the boundary case. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4. |

### 3.8 reflection

| Field | Obligation | Meaning |
| --- | --- | --- |
| `prompt` | **REQUIRED** | The question posed. Open-ended prompts with no target are not instances of this form. |
| `target_articulation` | **REQUIRED** | What a correct articulation contains. |
| `misconception_or_edge_case` | **REQUIRED** | See §4 — the wrong model the prompt exists to surface. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4 — the response that reveals the wrong model is held. |
| `remediation_hook` | **REQUIRED** | Which reformulation follows when the wrong model surfaces. `M09` requires a flagged leech to emit a reformulation action, **not a silent suspend**. |

### 3.9 retrieval

| Field | Obligation | Meaning |
| --- | --- | --- |
| `stem` | **REQUIRED** | The cue. Must not contain its own answer. |
| `expected_response` | **REQUIRED** | What counts as production from memory. |
| `misconception_or_edge_case` | **REQUIRED** | See §4. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4. |
| `hint_ladder` | **REQUIRED** | The hint-scaffolded second attempt offered before a failure is recorded. `M03` requires a real second attempt before failure is recorded; omitting the ladder would weaken a learning-critical control. |
| `spacing_eligible` | **REQUIRED** | Whether this item may count toward the spaced criterion. `M04` counts a correct recall only in a session separated from the prior counted recall; the field records eligibility, never the schedule. |

### 3.10 assessment

| Field | Obligation | Meaning |
| --- | --- | --- |
| `task` | **REQUIRED** | What the learner must produce. |
| `rubric_payload` | **REQUIRED** | The **structured, rubric-anchored** payload a grader returns. `M08` names bare self-report a rejected alternative and forbids binary collapse; a self-report field would weaken a learning-critical control. |
| `misconception_or_edge_case` | **REQUIRED** | See §4. |
| `separating_distractor_or_boundary_input` | **REQUIRED** | See §4. |
| `gate_relevance` | **REQUIRED** | Which dependent this item's result can contribute to unlocking. `M10` evaluates the durability gate server-side from persisted multi-observation history — **never a single success or an in-session spike.** The field records relevance, never the threshold. |

---

## 4. The discriminative decision and its required field pair

**A form is discriminative when its learning function is to separate a correct understanding from a specific wrong one.** Every discriminative form carries this REQUIRED pair:

- **`misconception_or_edge_case`** — the specific misconception or edge case the instance targets.
- **`separating_distractor_or_boundary_input`** — the distractor or boundary input that separates that misconception from correct understanding.

**Both are REQUIRED. Neither is ever optional.** No template offers either as a "consider adding" note. **A submission that omits either is rejected by the form definition itself** — it is not a valid instance of the form. It is not accepted with a note; it is not warned; it does not pass with a flag.

**The task's enumeration — retrieval, assessment, reflection, test and the worked example — is the floor, not the boundary.** Two further forms are decided discriminative here:

| Form | Discriminative? | Rationale |
| --- | --- | --- |
| **retrieval** | **yes** (floor) | Its result feeds the mastery signal; an item that discriminates nothing produces a signal that means nothing. |
| **assessment** | **yes** (floor) | Gate-bearing. An item that cannot separate a misconception can unlock a dependent on a corrupted signal. |
| **reflection** | **yes** (floor) | Its entire function is surfacing a held wrong model. |
| **test** | **yes** (floor) | Boundary behaviour is what a test exists to pin. |
| **example** (worked) | **yes** (floor) | A worked example that never shows where the approach breaks teaches an unswitchable rule. |
| **visualization** | **yes** (**added here**) | A rendering's instructional value is precisely that a wrong mental model becomes visibly wrong. A visualization with no named invariant to break is decoration; requiring the pair is what distinguishes the two. |
| **proof** | **yes** (**added here**) | A proof's edge case *is* the boundary at which the claim stops holding. A justification with no stated boundary invites over-application of the bound — the same failure the pair exists to prevent. |
| **lesson** | no | Its function is presentation, not separation. Its `does_not_apply_when` field already carries the applicability boundary as a REQUIRED field under a different name; duplicating the pair would dilute the rejection rule without adding a check. |
| **problem-reference** | no | A citation record. It carries no learning function of its own and its fillable field set is fixed by `CH-F5-1` — adding any field is forbidden here. |
| **solution** | no | Its function is post-attempt exposure (`M06`), not discrimination. **Recorded as reviewable:** whether a solution should carry the pair is filed as `OI-S2-2` rather than silently settled. |

---

## 5. The problem-reference form in both `D-F5` dispositions

`CH-F5-1` is **open** at this cutoff. The form is therefore specified for **both** dispositions, and only one of them is fillable.

### 5.1 Interim disposition — **this is the current form, and the only fillable one**

A problem reference stores **`stable_id` and `canonical_url` — and nothing else.** This is the shape an author may actually fill. The template in §7.4 offers exactly these two fields and no others.

### 5.2 Wider disposition — **not-yet-storable, not a form an author may fill**

Should `CH-F5-1` resolve in favour of the wider set, these fields would become storable. **They are listed here so the dependency is legible, not so they can be filled.** Each is marked **NOT-YET-STORABLE**; none appears in any template as a fillable field; none is presented as the current form.

| Field | State at this cutoff |
| --- | --- |
| `title` | **NOT-YET-STORABLE** — challenged by `CH-F5-1`. |
| `constraints` (numeric) | **NOT-YET-STORABLE** — challenged by `CH-F5-1`. |
| difficulty signal | **NOT-YET-STORABLE** — challenged by `CH-F5-1`. |
| curriculum placement | **NOT-YET-STORABLE** — challenged by `CH-F5-1`. |

**The dependency is recorded by citing SUB-1's cap by id — `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` — and is not restated or re-decided here.** This form resolves only when the foundations ledger records a disposition for `CH-F5-1`. It does not resolve by this sub-task deciding it needs the fields.

**Inherited provisional-data caveat.** SUB-1's twelve source access-permission rows are **restricted by default**, not verified-restricted: no network access was available and **zero requests were issued**. Anything this form is used to reference inherits that caveat.

---

## 6. Placement rules — which forms a node requires

### 6.1 Reading the node id

Placement is stated against the map's id grammar (`../C005-dp-map-schema/01_node-and-edge-schema.md` §5.1): a **technique node** is `<cluster-lowercase>.<kebab-name>`; a **root node** is `cl-1.root.<kebab-name>`; a **boundary anchor** is `anchor.<kebab-name>`; an **anchor reference in an edge** is `anchor.<kebab-name>@<version>`; a **cross-cluster attachment** is `xc.<from-id>-><to-id>`.

### 6.2 The eight skill types

Exactly eight, spelled exactly, with no ninth value: `proof`, `optimization`, `debugging`, `transfer`, `strategic`, `implementation`, `procedural`, `conceptual`.

### 6.3 The placement matrix

**R** = required for a node of this type · **O** = optional · **—** = not applicable.

| Form | conceptual | procedural | implementation | strategic | proof | debugging | optimization | transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lesson | R | R | R | R | R | R | R | R |
| example | R | R | R | R | O | R | R | R |
| visualization | R | O | O | O | O | O | O | O |
| problem-reference | O | O | R | R | O | O | R | R |
| solution | O | O | R | R | O | R | R | R |
| proof | O | O | — | O | R | — | R | O |
| test | — | O | R | O | — | R | O | O |
| reflection | R | O | O | R | O | O | O | R |
| retrieval | R | R | R | R | R | R | R | R |
| assessment | R | R | R | R | R | R | R | R |

**Root nodes** (`cl-1.root.<kebab-name>`) require lesson, retrieval and assessment at minimum; they are frozen, so no form may propose altering one.

**Boundary anchors** (`anchor.<kebab-name>`) take **no** forms. An anchor is a **sanctioned stop** — assumed, never decomposed, never faked. Authoring content for an anchor to "complete" a chain is prohibited exactly as faking a terminal is.

### 6.4 Edge discipline, binding wherever a placement rule reads the graph

**Classify edges by field, never by endpoint span.** The span-based reading reports **223 false positives** (`S1`–`S8`). Prerequisite edges are carried in `prerequisites.intra_cluster`, `prerequisites.roots` and `prerequisites.boundary_anchors` (all **DRAWN**); `cross_cluster_attachments` is **DECLARED ONLY**. A form's `prerequisite_recall` field reads the `prerequisites.*` fields; it never infers an edge from the endpoints' cluster spans.

**A prerequisite edge is a *structural* claim.** It is nowhere in this catalogue worded, implied or presented as a validated learning sequence (`R1`, non-downgradable **High**). No form may describe the graph order as an evidence-backed teaching order.

---

## 7. The ten authoring templates

**Read this before filling any template below.**

Every placeholder is instruction text in angle brackets. **A placeholder is not data and must never be submitted as though it were.** No template on this page contains an example identifier, address or citation of any kind, and none ever will — that is `C2`, and it is the direct lesson of incident `EXC-1`. If a value cannot be verified, **refuse it**: leave the field explicitly refused and say why. **Inventing a plausible value is the specific failure this catalogue exists to prevent.**

### 7.1 lesson

```
form: lesson
node_id:                <the exact node id from the map — copy it; if you cannot locate it, refuse>
title:                  <the lesson's title>
applies_when:           <the condition under which this technique is correct>
does_not_apply_when:    <the condition under which it is wrong>
prerequisite_recall:    <node id of the assumed prior node, read from prerequisites.* — never inferred from cluster span>
claim_citations:        <one slot per non-obvious claim; if a claim cannot be sourced, DELETE THE CLAIM>
body:                   <the exposition>
```
**Refuse rather than invent.** Any claim you cannot source is removed, not attributed. Do not supply an identifier or address you have not verified.

### 7.2 example (worked example)

```
form: example
node_id:                             <the exact node id from the map>
title:                               <what this example demonstrates>
scaffold_fade_level:                 <full derivation | partial | completion-only>
derivation_steps:                    <ordered steps; show reasoning, not only results>
misconception_or_edge_case:          <REQUIRED — the specific wrong understanding this example separates>
separating_distractor_or_boundary_input: <REQUIRED — the input at which the wrong understanding gives the wrong answer>
problem_ref:                         <a problem-reference instance, or omit; never inline an invented problem>
```
**Both misconception fields are REQUIRED. An example omitting either is rejected by the form definition — it is not a worked example.**
**Refuse rather than invent.** If you cannot name a real misconception this example separates, refuse the example; do not manufacture one to fill the field.

### 7.3 visualization

```
form: visualization
node_id:                             <the exact node id from the map>
title:                               <what is rendered>
renders_state:                       <the exact state object rendered>
invariant_shown:                     <the invariant the learner should see hold — or visibly break>
misconception_or_edge_case:          <REQUIRED — the wrong mental model this rendering makes visibly wrong>
separating_distractor_or_boundary_input: <REQUIRED — the configuration at which the wrong model visibly fails>
interaction:                         <step | scrub | perturb | none>
```
**Both misconception fields are REQUIRED. A visualization omitting either is rejected by the form definition — it is decoration, not a visualization form.**
**Refuse rather than invent.** A rendering with no invariant you can actually name is refused, not padded.

### 7.4 problem-reference — **interim disposition, the only fillable shape**

```
form: problem-reference
stable_id:     <the problem's externally assigned stable identifier, copied from the host — never constructed, never guessed>
canonical_url: <the problem's canonical address on its host — copied, never assembled from a pattern>
```
**These two fields are the entire form.** Do not add a title, constraints, a difficulty signal or a curriculum placement: those are **NOT-YET-STORABLE** while `CH-F5-1` is open (§5.2). Do not add an access path, a resolution route or a fetch date — that record is SUB-3's, not this form's. Do not store any problem statement text.

**Refuse rather than invent — this field is the exact site of incident `EXC-1`.** If you do not have the identifier and address in front of you, **write `REFUSED — not verifiable` in both fields and stop.** Do not reconstruct an identifier from a pattern you have seen. Do not assemble an address from a host name and a number. A value that *looks* like a citation but was produced from memory is the failure this template is built to prevent, and it is worse than an empty field because it is not detectable downstream.

### 7.5 solution

```
form: solution
node_id:                <the exact node id from the map>
problem_ref:            <the problem-reference instance this solves>
approach_class:         <the named technique class instantiated>
reasoning:              <why the approach applies>
exposure_precondition:  <the attempt state after which the learner may see this>
complexity_claim:       <stated bound, marked as a claim — or omit>
```
**Refuse rather than invent.** Do not restate the problem's text — no field stores external statement text. Do not present a stated bound as a measured one.

### 7.6 proof

```
form: proof
node_id:                             <the exact node id from the map>
claim:                               <the exact statement being justified>
argument:                            <the justification>
misconception_or_edge_case:          <REQUIRED — the boundary at which this claim stops holding>
separating_distractor_or_boundary_input: <REQUIRED — the instance at that boundary that shows it>
depends_on_claims:                   <node ids of prior claims consumed, or omit>
```
**Both misconception fields are REQUIRED. A proof omitting either is rejected by the form definition — an unbounded claim is not a proof form.**
**Refuse rather than invent.** If you cannot supply the argument, refuse the proof; do not assert the bound and move on.

### 7.7 test

```
form: test
node_id:                             <the exact node id from the map>
subject:                             <the artifact under test>
input_class:                         <the concrete class of inputs exercised>
expected_behavior:                   <what correct behaviour is>
misconception_or_edge_case:          <REQUIRED — the boundary case this test pins>
separating_distractor_or_boundary_input: <REQUIRED — the boundary input itself, as a class>
```
**Both misconception fields are REQUIRED. A test omitting either is rejected by the form definition.**
**Refuse rather than invent.** If you do not know the expected output, **refuse the test.** A guessed expectation is worse than no test: it fails correct work and passes incorrect work.

### 7.8 reflection

```
form: reflection
node_id:                             <the exact node id from the map>
prompt:                              <the question posed>
target_articulation:                 <what a correct articulation contains>
misconception_or_edge_case:          <REQUIRED — the wrong model this prompt exists to surface>
separating_distractor_or_boundary_input: <REQUIRED — the response that reveals the wrong model is held>
remediation_hook:                    <the reformulation that follows when it surfaces>
```
**Both misconception fields are REQUIRED. A reflection omitting either is rejected by the form definition — an untargeted prompt is not a reflection form.**
**Refuse rather than invent.** Do not convert this into an open-ended prompt to avoid naming the target.

### 7.9 retrieval

```
form: retrieval
node_id:                             <the exact node id from the map>
stem:                                <the cue — must not contain its own answer>
expected_response:                   <what production from memory looks like>
misconception_or_edge_case:          <REQUIRED — the misconception this item detects>
separating_distractor_or_boundary_input: <REQUIRED — the distractor that separates it from correct understanding>
hint_ladder:                         <the hint-scaffolded second attempt offered before failure is recorded>
spacing_eligible:                    <whether this item may count toward the spaced criterion>
```
**Both misconception fields are REQUIRED. A retrieval item omitting either is rejected by the form definition — it would feed the mastery signal while discriminating nothing.**
**Refuse rather than invent.** If you cannot name the misconception the item detects, refuse the item.

### 7.10 assessment

```
form: assessment
node_id:                             <the exact node id from the map>
task:                                <what the learner must produce>
rubric_payload:                      <the structured, rubric-anchored payload the grader returns — never a self-report>
misconception_or_edge_case:          <REQUIRED — the misconception this item detects>
separating_distractor_or_boundary_input: <REQUIRED — the distractor that separates it from correct understanding>
gate_relevance:                      <which dependent this result can contribute to unlocking>
```
**Both misconception fields are REQUIRED. An assessment omitting either is rejected by the form definition — it is gate-bearing, and a non-discriminating gate item unlocks on a corrupted signal.**
**Refuse rather than invent.** Do not substitute a self-report for a rubric payload. Do not collapse the graded signal to pass/fail.

---

## 8. Form → mechanism trace

**Zero forms are untraced.** LC = learning-critical.

| Form | Mechanisms served | LC? | What the form contributes |
| --- | --- | --- | --- |
| lesson | `M01` Sequencing | no | Presents a node only after its prerequisite, and states applicability both ways. |
| example | `M02` Worked Examples · `M07` Productive Struggle | no · no | Full derivations at entry; `scaffold_fade_level` makes monotonic fading expressible. |
| visualization | `M02` Worked Examples | no | Makes the derivation's state observable rather than described. |
| problem-reference | `M05` Interleaving | no | Carries the category/problem-type identity interleaving is organised on. |
| solution | `M06` Feedback | **yes** | `exposure_precondition` preserves the correct-answer-exposure step before an outcome is recorded. |
| proof | `M07` Productive Struggle | no | The justification withheld through the bounded attempt sequence. |
| test | `M08` Assessment | **yes** | Produces structured, non-binary evidence of behaviour at boundaries. |
| reflection | `M09` Remediation | **yes** | `remediation_hook` emits a reformulation action rather than a silent suspend. |
| retrieval | `M03` Retrieval Practice · `M04` Spacing | **yes** · **yes** | Production from memory with a real hint-scaffolded second attempt; `spacing_eligible` expresses separated-session counting. |
| assessment | `M08` Assessment · `M10` Progression | **yes** · **yes** | Rubric-anchored payload; `gate_relevance` feeds a server-side durability gate, never a single success. |

### 8.1 Reverse check — every mechanism is served

| Mechanism | Served by | Status |
| --- | --- | --- |
| `M01` Sequencing | lesson | served |
| `M02` Worked Examples | example, visualization | served |
| `M03` Retrieval Practice | retrieval | served |
| `M04` Spacing | retrieval | served |
| `M05` Interleaving | problem-reference | served |
| `M06` Feedback | solution | served |
| `M07` Productive Struggle | example, proof | served |
| `M08` Assessment | test, assessment | served |
| `M09` Remediation | reflection | served |
| `M10` Progression | assessment | served |

**All ten mechanisms are served by an enumerated form. No mechanism is quietly omitted.** The reverse check is recorded so that a later mechanism revision which strands a mechanism is visible as a regression rather than an absence.

### 8.2 The residual clause — owned, not assumed

> **…and any content or exercise form required by a mechanism `M01`–`M10` that is not one of the ten enumerated above.**

**SUB-2 (NEU-958) is OUT-1's residual owner.** If a mechanism requires an observable behaviour that no enumerated form carries, that omission is **this sub-task's to record and resolve** — filed as an `OI-S2-k` open item with an owner and a revision trigger, never left as a silent gap in the trace table. The absence of exactly this clause upstream produced all ten `INC-C1` gaps. At this cutoff the clause is **standing and unexercised**: §8.1 shows no mechanism unserved. It is recorded as `OI-S2-1` so that it remains live rather than being read as discharged.

---

## 9. What this document does not do

- It does **not** set the correctness bar for solution, proof or test — that is **SUB-4**. This document defines the fields; SUB-4 defines the standard they must meet.
- It does **not** source or verify any citation — that is **SUB-3** (NEU-959), which also owns the access-path record and re-runs the fabrication probe against a real verification procedure.
- It does **not** specify which gate validates a form, nor any severity tier or linter rule — that is **SUB-9** (NEU-965).
- It does **not** design which misconception each gate-bearing item must detect or how its distractors are built — that is **SUB-6**'s assessment-design half. This document requires the field; SUB-6 designs its content.
- It does **not** fill any template with real content beyond structural illustration — exemplars are **SUB-11**'s.
- It does **not** author any of the ten `INC-C1` techniques or mint their nodes.
- It sets **no status**. Status lives in a ledger.

**No QA-engine run is claimed.** `qa-execution:engine` is unconfigured in this project's capability registry, so the QA-execution phase is a genuine **Core Article 8 no-op**. No QA pass, scenario, verdict or report is asserted or implied anywhere in this package by this sub-task (`CAP-S2-2`, consistent with `CAP-S1-3`).

---

## 10. Evidence and records

| Record | Path |
| --- | --- |
| Form × mechanism × placement matrix, probe result, structural-check result | `traceability/02_form-mechanism-placement-matrix.md` |
| Cold-agent fabrication probe, verbatim per-template output | `dry-run/02_template-fabrication-probe.md` |
| Open items filed by this sub-task | `90_open-items-and-provisional-register.md` § `SUB-2` |
| Caps and incomplete scope declared by this sub-task | `91_caps-and-incomplete-scope.md` § `SUB-2` |
