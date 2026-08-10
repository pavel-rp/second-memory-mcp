# Correctness Standards and Authoring Languages — the Bar Our Own Explanations, Solutions, Proofs and Tests Must Meet

**Task:** NEU-960 (SUB-4) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Covers:** OUT-2 (residual owner) · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

`02_content-and-exercise-forms.md` §9 states the deferral in its own words: *"It does not set the correctness bar for solution, proof or test — that is **SUB-4**. This document defines the fields; SUB-4 defines the standard they must meet."* This document is that bar.

It answers one question per artifact class: **what must be in it, what makes it correct, and how a reviewer fails it on a stated rule rather than on taste.** Four standards are published — **explanation**, **solution**, **proof**, **test** — each with a required structure, a correctness obligation, a violation-detection method, and a proposed mechanism value. Nothing here is enforcement: **SUB-9 (NEU-965) owns gates, blocking behaviour and placement**, and this document assigns none of the three.

---

## 1. The constrained-payload discipline — read this before any standard

**SUB-2's ten-form catalogue is frozen and merged. This document adds no field to any of them and promotes no `OPTIONAL` field to `REQUIRED`.** Every structural obligation below is expressed as a **constrained payload inside an existing REQUIRED field**.

The discipline exists because the alternative is worse in a specific, recoverable way. A standard that quietly mints a field produces artifacts that validate against a schema nobody published, cross-references that resolve into a second catalogue, and a merge in which SUB-2's owner discovers a field they never defined. A standard that instead constrains a payload inside a field SUB-2 already made REQUIRED is **checkable today, against the catalogue that is actually on `origin/develop`**, and any pressure to promote it to a real field leaves a written trace.

| Obligation | Where it lives | What it is **not** | Open item |
| --- | --- | --- | --- |
| The proof's three-part correctness argument | A three-slot payload inside the existing REQUIRED `argument` field: `optimal_substructure` / `overlapping_subproblems` / `recurrence_justification` | Three new form fields. `argument` is one field and stays one field. | `OI-S4-3` |
| The solution's invariant | A **named slot inside the existing REQUIRED `reasoning` field** | A new `invariant` field on the `solution` form | `OI-S4-1` |
| The solution's complexity statement | The existing `complexity_claim` field, which is **`OPTIONAL` in SUB-2's form and stays `OPTIONAL`** | A promotion of `complexity_claim` to `REQUIRED` | `OI-S4-2` |
| The test's coverage label | A `kind:` label inside the existing REQUIRED `misconception_or_edge_case` field | A new `case_kind` field on the `test` form | `OI-S4-3` |
| The hatch-authored JavaScript-failure note | A stated note inside the artifact's existing REQUIRED body-bearing fields | A new `forced_by_effects` field | `OI-S4-5` |

**The `complexity_claim` tension is named, not hidden.** `complexity_claim` is `OPTIONAL` at form level (`02_…` §3.5). The **solution standard** below fails a solution authored for a node whose skill type is `optimization` or `implementation` when it omits a complexity statement. **That is a standard-level obligation on an `OPTIONAL` field — a real tension, and it is left standing rather than resolved locally.** SUB-4 does not own the form, so it does not promote the field; it records the tension as **`OI-S4-2`**, addressed to SUB-2's owner (NEU-958) and SUB-9 (NEU-965), who may between them decide on a dedicated field, a conditional REQUIRED, or a rejection of the obligation. Until then the standard fails on it and the form does not — and this document says so out loud rather than implying the form was amended.

**Every place a standard wants a field SUB-4 does not own is cross-referenced to an `OI-S4-k`.** The ids are minted in `90_open-items-and-provisional-register.md` § `SUB-4`; this document references them and files none of them itself.

| Id | Subject |
| --- | --- |
| `OI-S4-1` | Solution invariant carried as a named slot inside `reasoning`; proposes a dedicated field for SUB-2's owner and SUB-9 to consider. |
| `OI-S4-2` | `complexity_claim` is `OPTIONAL` at form level while the standard fails on its absence for two skill types — the conditional-REQUIRED question. |
| `OI-S4-3` | Within-field slot payloads (`argument`'s three slots, `misconception_or_edge_case`'s `kind:` label) have no addressable identity a validator can name without a slot manifest. |
| `OI-S4-4` | The explanation standard's depth obligation is `AI-judgment-only`; SUB-9 owes a compensating observable gate. |
| `OI-S4-5` | The hatch-authored JavaScript-failure note is carried as a payload; whether it deserves a field is SUB-2's and SUB-9's to decide. |
| `OI-S4-6` | Pressure to widen the escape hatch beyond NEU-941's 19 ids — filed, never absorbed. |
| `OI-S4-7` | Inherited reliance on SUB-1's **restricted-by-default** source rows and the interim `stable_id` + `canonical_url` field set (`CH-F5-1`, `DR-C09-01`, `CAP-S1-2`). |

---

## 2. The four standards

Each standard states, separately and explicitly: **(a) required structure**, **(b) correctness obligation**, **(c) how a violation is detected**, **(d) proposed mechanism value**. Field names are SUB-2's, verbatim. Skill types, where named, are drawn from `02_…` §6.2's exactly eight literals — `proof`, `optimization`, `debugging`, `transfer`, `strategic`, `implementation`, `procedural`, `conceptual` — and there is no ninth.

### 2.1 The explanation standard — attaches to the `lesson` form

**(a) Required structure.** The `lesson` form's four REQUIRED fields carry the whole obligation: `applies_when`, `does_not_apply_when`, `prerequisite_recall`, `claim_citations`. `worked_pointer` is `OPTIONAL` and stays `OPTIONAL`; nothing below reads its absence as a defect.

- `applies_when` — the condition under which the technique is the right choice, stated as a condition a learner could test against a situation in front of them.
- `does_not_apply_when` — the condition under which it is the wrong choice. **It must name a situation that is not the negation-by-restatement of `applies_when`.** "Use it when X" / "do not use it when not X" is one condition written twice and teaches nothing switchable.
- `prerequisite_recall` — the already-unlocked node id the explanation assumes, read from `prerequisites.*` and never inferred from an endpoint span (`02_…` §6.4).
- `claim_citations` — one slot per non-obvious empirical claim. **A slot carries either a verified citation or the literal `REFUSED — not verifiable`.** A slot carrying neither is not an unfinished lesson; it is a defect.

**(b) Correctness obligation — the depth obligation.** An explanation is correct when **a learner holding exactly the node named in `prerequisite_recall` can reconstruct the applicability decision in both directions from the explanation alone.** That fixes the depth in both directions:

- **Deep enough:** the explanation must not bottom out in a term that is neither named in `prerequisite_recall` nor explained in place. The first such term is the point at which the explanation stopped explaining and started asserting.
- **Not deeper:** it must not re-derive what `prerequisite_recall` already guarantees. Re-teaching an unlocked prerequisite is not rigour; it displaces the applicability content that is the lesson's actual job.

**(c) How a violation is detected.** Two layers, and **only the first is mechanical**.

| Layer | Rule a reviewer fails the artifact on | Judgment required? |
| --- | --- | --- |
| Field floor | `applies_when`, `does_not_apply_when`, `prerequisite_recall`, `claim_citations` are present and non-empty; `prerequisite_recall` resolves to an existing node id reachable through `prerequisites.*`; every `claim_citations` slot holds a citation or `REFUSED — not verifiable`. | no |
| Restatement check | `does_not_apply_when` is not `applies_when` modulo a leading negation token. | no (string-level), yes at the margin |
| **Depth check** | **"Name the first term in the lesson body that is neither in `prerequisite_recall` nor explained in place."** If such a term exists, the explanation is inadequate and is failed on that term. | **yes — this is judgment** |

**The depth check is a stated rule, but its application is judgment, and no mechanical proxy for it is proposed here.** A word count is not depth. A readability score is not depth. Counting defined terms rewards padding. **This document does not invent a metric to make the depth obligation look enforceable.**

**(d) Proposed mechanism value: `AI`. Flagged `AI-judgment-only`.** See §3.1 for the flag and §3.2 for the hand-off.

### 2.2 The solution standard — attaches to the `solution` form

**(a) Required structure.** The `solution` form's REQUIRED fields are `approach_class`, `reasoning`, `exposure_precondition` and `problem_ref`; `complexity_claim` is `OPTIONAL`. **A solution must contain an approach, an invariant, and a complexity statement**, mapped onto those fields as follows and adding none:

- **Approach** → `approach_class`, naming one technique class. Not a paraphrase of the problem; a class.
- **Invariant** → a **named `invariant` slot inside the existing REQUIRED `reasoning` field** (`OI-S4-1`). The rest of `reasoning` states why the approach applies; the slot states the property that must hold at every step for the approach to produce the claimed result.
- **Complexity** → `complexity_claim`, marked as a claim and never as an observation. **REQUIRED by this standard for a node whose skill type is `optimization` or `implementation`; `OPTIONAL` at form level regardless** (`OI-S4-2`).
- `exposure_precondition` states the attempt state after which the learner may see this, preserving `M06`'s correct-answer-exposure step.
- `problem_ref` is a `problem-reference` instance carrying **`stable_id` and `canonical_url` only** — the interim set governed by `CH-F5-1` (`DR-C09-01`, `CAP-S1-2`), **consumed here and never widened**. A value that cannot be verified is written `REFUSED — not verifiable`, never invented.

**(b) Correctness obligation.** A solution is correct when the property in the `invariant` slot, **if maintained at every step `reasoning` describes, forces the result `approach_class` produces** — and when that property is **falsifiable**: it names a state condition that some concrete input class could violate. An invariant no input can violate is a tautology dressed as an argument, and it fails.

**(c) How a violation is detected — and how a hidden failing case is caught.** Three checks, in order of increasing strength.

| Check | What it fails | Catches |
| --- | --- | --- |
| Slot presence | `reasoning` present but carrying no `invariant` slot | A solution that never stated an invariant at all |
| Falsifiability | The `invariant` slot names no condition an input could violate | A tautological invariant |
| **Boundary confrontation** | The approach in `approach_class`, run over the `separating_distractor_or_boundary_input` of **every `test` instance placed on the same node**, produces something other than that test's `expected_behavior` | **A hidden failing case** |

**The third check is the one that matters, and it needs no new field.** SUB-2 already makes `separating_distractor_or_boundary_input` and `expected_behavior` REQUIRED on the `test` form (`02_…` §3.7). The solution standard therefore reuses the node's own already-required boundary inputs as the adversarial set the solution must survive. **A solution whose stated invariant silently assumes an unstated precondition fails on the boundary input that violates it — observably, and without a reviewer having to guess what the author left out.** That is the difference between a standard that catches a hidden failing case and one that merely asks the author to have thought about it.

The conditional `complexity_claim` obligation is evaluated against the node's recorded skill type, which is an attribute of the node record rather than of the artifact — **a conditional requirement resolved where the node record lives** (§6).

**(d) Proposed mechanism value: `automated`.**

### 2.3 The proof standard — attaches to the `proof` form

**(a) Required structure.** The `proof` form's REQUIRED fields are `claim`, `argument`, `misconception_or_edge_case` and `separating_distractor_or_boundary_input`; `depends_on_claims` is `OPTIONAL`. The `argument` field carries a **three-slot payload** and remains one field (`OI-S4-3`):

```
argument:
  optimal_substructure:     <what an optimal whole decomposes into, and why the sub-part is itself optimal>
  overlapping_subproblems:  <the state space, and why distinct paths arrive at the same state>
  recurrence_justification: <the labelled case set, and why the case disjunction is total>
```

`claim` states exactly one statement. `misconception_or_edge_case` states the boundary at which the claim stops holding, and `separating_distractor_or_boundary_input` gives the instance at that boundary that shows it — the REQUIRED pair SUB-2 fixed in §4.

**(b) Correctness obligation.** **An adequate correctness argument is optimal substructure plus overlapping subproblems plus the recurrence's justification. All three. Any one absent and the artifact is not a proof of the claim it states.**

- `optimal_substructure` must exhibit the decomposition **and the exchange step** — why replacing the sub-part with a better one would contradict the optimality of the whole. A decomposition with no exchange step is a description of an algorithm, not a justification of it.
- `overlapping_subproblems` must name the state space and why distinct paths reach the same state. This is the slot that justifies the memoized realization rather than the claim.
- `recurrence_justification` must **label its cases** and assert that the labelled disjunction is **total** over what `claim` admits. **Case exhaustiveness is where gaps live**, so this is where the standard looks for them.

**(c) How a violation is detected — and how a gap is caught.**

| Check | What it fails | Catches |
| --- | --- | --- |
| Slot presence | Any of the three slots absent or empty inside `argument` | **The skipped slot — a gap by omission** |
| **Closure link** | The instance in `separating_distractor_or_boundary_input` names no case label appearing in `recurrence_justification` | **A gap by non-coverage** — a boundary the author stated but the case set does not reach |
| Dependency resolution | A claim consumed in `argument` that is neither justified in place nor listed in `depends_on_claims` | An argument leaning on an unstated prior |

**The closure link is the gap-catcher.** The author has already been made to state a boundary in `misconception_or_edge_case` and an instance of it in `separating_distractor_or_boundary_input`. Requiring that instance to name a case label present in `recurrence_justification` turns two REQUIRED fields the author filled independently into a **cross-reference that fails when the case enumeration is not closed** — mechanically, on a stated rule, with no view into whether the mathematics is any good.

**What this does not catch is stated plainly:** whether the exchange step in `optimal_substructure` is *sound* is judgment. That residue is named in §3.2 and handed to SUB-9; it is not counted as detected here.

**(d) Proposed mechanism value: `schema`.**

### 2.4 The test standard — attaches to the `test` form

**(a) Required structure.** All five of the `test` form's fields are REQUIRED — `subject`, `input_class`, `expected_behavior`, `misconception_or_edge_case`, `separating_distractor_or_boundary_input` — and the standard adds none. It constrains one of them:

- `input_class` is a **class**, not a prose description of one.
- `expected_behavior` is **derived independently of the artifact under test**. An expectation read off the learner's own output is a self-oracle: it passes incorrect work by construction. Unknown expectation → the test is refused, per SUB-2's own template line.
- `misconception_or_edge_case` carries a **`kind:` label reading exactly `edge` or `misconception`** as a payload inside the existing field (`OI-S4-3`). SUB-2 made the field REQUIRED and left its two senses fused; the label separates them without touching the form.

**(b) Correctness obligation — coverage.** **The set of `test` instances placed on a node must contain at least one `kind: edge` case and at least one `kind: misconception` case. Both. Not either.** They fail differently and they catch differently: an edge case pins behaviour where the input class runs out; a misconception case pins behaviour where a *specific wrong understanding* produces a different answer from the correct one. A node covered only at its edges passes a learner who holds a coherent wrong model that happens to agree at the boundaries. A node covered only for misconceptions passes an implementation that is right in principle and wrong at zero, at one, and at the maximum.

**(c) How a violation is detected.**

| Check | What it fails | Catches |
| --- | --- | --- |
| Label presence | `misconception_or_edge_case` carries no `kind:` label, or a label outside `{edge, misconception}` | An unclassifiable case |
| **Set-level coverage count** | The node's `test` set does not contain **both** labels | **Insufficient coverage** |
| Refusal accounting | A `test` whose `expected_behavior` reads `REFUSED — not verifiable` is **not counted** toward either label | Coverage claimed by an unauthored test |
| Self-oracle | `expected_behavior` derived from the artifact named in `subject` | A test that cannot fail |

**Coverage is a property of the set, not of the instance** — which is why the check is a **count of distinct labels across the node's `test` instances**, and why an individually flawless test can still leave a node uncovered. This is a counting rule over a constrained payload: no judgment enters it.

**(d) Proposed mechanism value: `deterministic`.**

---

## 3. Provisional mechanism pre-classification

### 3.1 The table

> **PROVISIONAL and NON-BINDING.** This table assigns the **mechanism axis only**. **SUB-9 (NEU-965) re-expresses it in the published scheme, may reassign any mechanism with a recorded reason, and SUB-9's assignment is the one that governs.** Nothing in or around this table asserts a gate, a severity, a behaviour on failure, or a placement — **SUB-9 owns both of those axes and SUB-4 assigns neither**. The `Mechanism` cell is exactly one of SUB-9's five published values: `deterministic`, `schema`, `server-side`, `automated`, `AI`. The `Governed form` cell names the SUB-2 form the standard's obligations attach to; it is **not** a placement rule — form-to-node placement is `02_…` §6.3 and belongs to SUB-2.

| Standard | Governed form | Mechanism | `AI-judgment-only`? | Non-prose constraint it rests on (SC-10) |
| --- | --- | --- | --- | --- |
| **Explanation** | `lesson` | `AI` | **yes — `AI-judgment-only`** (depth obligation) | **Residual for SUB-9** on the depth obligation (`OI-S4-4`); the field floor beneath it is `deterministic validation` over `applies_when`, `does_not_apply_when`, `prerequisite_recall`, `claim_citations` |
| **Solution** | `solution` | `automated` | no | `constrained payload` (the `invariant` slot inside `reasoning`) + `observable gate` (boundary confrontation against the node's `separating_distractor_or_boundary_input` / `expected_behavior` set) |
| **Proof** | `proof` | `schema` | no | `constrained payload` (the three slots inside `argument`) + `deterministic validation` (the closure link to `separating_distractor_or_boundary_input`) |
| **Test** | `test` | `deterministic` | no | `deterministic validation` (set-level label count) + `constrained payload` (the `kind:` label inside `misconception_or_edge_case`) |

**Zero cells are empty. No correctness-critical requirement in this document rests on prompt prose alone** — each standard either names a non-prose constraint or is explicitly marked a residual for SUB-9, and the one standard that is a residual says so in the same cell rather than borrowing credit from the field floor beneath it.

### 3.2 `AI-judgment-only` flags and residues, with their hand-offs

**A standard flagged `AI-judgment-only` is never described in this document as enforced, gated, or blocking — not in the table, not in the walkthrough, not in the prose.** It is described as *detected by judgment*, which is what it is.

| Item | Flagged at | Hand-off |
| --- | --- | --- |
| **Explanation standard — depth obligation** | Standard level, `AI-judgment-only` | **SUB-9 (NEU-965) owns the compensating observable gate.** SUB-4 states the rule a reviewer applies and refuses to propose a proxy metric for it. Filed as `OI-S4-4`. |
| Proof — soundness of the exchange step in `optimal_substructure` | Residue inside a standard whose own mechanism is `schema` | **SUB-9 owns any compensating observable gate.** The slot-presence and closure-link checks stand on their own and are not credited with catching this. |
| Solution — whether the stated invariant is the *right* invariant for `approach_class` | Residue inside a standard whose own mechanism is `automated` | **SUB-9 owns any compensating observable gate.** Boundary confrontation catches a wrong invariant that a node's own boundary inputs reach, and nothing beyond that is claimed. |
| Test — whether the named misconception is one a learner actually holds | Residue inside a standard whose own mechanism is `deterministic` | **SUB-9 owns any compensating observable gate**; the misconception's *design* is SUB-6's (NEU-962). |

**The honest statement:** the explanation standard is the weakest of the four, and it is weak in the place that matters most to a learner. Naming that is more useful to SUB-9 than a fabricated metric would be.

---

## 4. Authoring languages

### 4.1 The standard authoring language is TypeScript on a Node runtime

**Settled charter-wide. Recorded here, not reopened.** Every artifact for every node outside the escape-hatch set is authored in TypeScript. This document records the setting; the reasoning and the rejected alternatives live in **`decision-records/DR-C09-04_authoring-languages.md`**.

### 4.2 The escape-hatch language is C++17, and the hatch is entered by id

**The full decision, its rationale and its rejected alternatives are in `decision-records/DR-C09-04_authoring-languages.md` (decision id `DR-C09-04`), authored in parallel with this document. It is referenced here by path and id and its rationale is not restated.**

The one thing this document carries is **the attachment rule**:

| For a node whose id is one of **NEU-941's 19 blocking ids** at `rule_version: 1.0.0` | Language |
| --- | --- |
| `solution` artifact | **C++17** |
| `test` artifact | **C++17** |
| Any code inside an `example` artifact | **C++17** |
| `lesson` prose | **language-neutral** |
| `proof` prose | **language-neutral** |

**Prose stays neutral because the justification of a technique is not a property of a compiler.** A `proof` whose `argument` slots are written against a language's type widths has confused the claim with its realization.

**Every hatch-authored artifact carries a stated JavaScript-failure note citing the forcing `JS-E*` id(s)** — the effect ids defined in `../C005-dp-js-materiality/01_effect-catalogue.md`, cited by id and never re-derived. The note answers one question: *which enumerated effect made the standard realization wrong or unreachable here?* It is carried as a payload inside the artifact's existing REQUIRED body-bearing fields (`OI-S4-5`), not as a new field.

**Detection is a presence-and-id-membership check** — the note is present, and every id it cites is one of `JS-E1`…`JS-E9`. **Proposed mechanism value: `schema`.**

### 4.3 The hatch cannot widen

- **Membership is by node id, and only by node id.** A technique is authored in C++17 **iff** its node id is one of the 19 at `rule_version: 1.0.0`.
- **An effect-based argument does not admit a technique.** "This technique also carries `JS-E2`" is not an admission argument. It is an observation about an effect, and the 19 are the set NEU-941 adjudicated, not a set of symptoms anyone may re-derive.
- **Anything outside the 19 is authored in TypeScript.** Without exception, and without a "similar to" clause.
- **The hatch cannot widen by precedent.** A widening arrives through NEU-941's own `rule_version`, never through a downstream reading. **Pressure to widen is filed as `OI-S4-6` and never absorbed.**

**One directional note, labelled as such.** Any statement anywhere in this package about the relative speed, cost or constant-factor behaviour of JavaScript, TypeScript or C++17 is **directional only** and cites **`JS-U2`**: NEU-941 implemented nothing, selected no runtime and no sandbox, and produced no quantity. The scope audit at `traceability/04_standards-evidence-and-scope-audit.md` lists every such statement across this sub-task's files with that label attached.

---

## 5. Evidence inherited, not re-derived

| Inherited fact | Consumed as | Never |
| --- | --- | --- |
| The interim problem-reference field set is **`stable_id` + `canonical_url` only**, governed by open challenge `CH-F5-1` (`DR-C09-01`, `CAP-S1-2`); the wider set is **NOT-YET-STORABLE** | A cap this document works inside | Widened; an unverifiable value is **refused, never invented** |
| SUB-1's twelve source access-permission rows resolve to `restricted` **by the restricted-default rule** — NEU-957 had **no network access** and issued **zero requests** | A restricted-by-default disposition (`OI-S4-7`) | Presented as **verified**-restricted |
| NEU-941's 19 blocking node ids, nine effects `JS-E1`…`JS-E9`, `rule_version: 1.0.0` | Binding input, cited by id | Re-assessed, re-derived, or extended |
| **`JS-U2`** — nothing implemented, nothing quantified | The reason every performance verdict here is **directional** | Converted into a quantity |
| The eight skill types (`02_…` §6.2) | The only skill-type vocabulary used here | Extended to a ninth |

---

## 6. The server-side enforcement surface, described generically

**Second Memory is and remains a general-purpose MCP server for spaced-repetition learning.** Nothing in this document proposes a subject-specific field, tool or schema for it. What the standards above imply, at most, is a **reusable, backward-compatible required-slot validation surface**, described here in terms that carry no course-domain vocabulary at all:

- **Input:** a form name, the set of field names that form marks REQUIRED, and an **optional slot manifest** naming the labelled slots a given field's payload must carry.
- **Behaviour:** check presence and non-emptiness of the required fields; where a slot manifest exists for a field, check that each named slot appears in that field's payload and that any enumerated label value is one of the manifest's permitted literals; where a conditional obligation names a record attribute, evaluate it against the stored record rather than against the submission, because the submission is the party with an interest in the answer.
- **Output:** structured per-item findings — item id, field, slot, and the rule that failed. In this codebase that shape already exists and already has exactly one route: structured `findings` flow through `error.type === 'content_quality'` and are dropped on every other error type, so a per-item structural failure is reported as `content_quality` or it is not reported at all.
- **Backward compatibility:** a form with **no slot manifest validates exactly as it does today.** The manifest is additive and defaults to empty; an existing stored item is never retroactively invalid because a manifest was later added, and adding one changes no existing field's meaning.
- **Reusability:** none of the above names a subject, a topic, a technique family or a curriculum. It is a generic constrained-payload validator that any content type in this server could be given a manifest for.

**Nothing here is a decision to build it.** SUB-9 (NEU-965) decides what is implemented, and this section exists so that the implied surface is legible as general-purpose infrastructure rather than as a special case smuggled in behind a standard.

---

## 7. Three-artifact violation-detection walkthrough

**This is SUB-4's own end-to-end check, and it is runnable with no exemplar at all.** Three non-conforming artifacts are constructed here and walked to a failure that names **the standard**, **the exact field or payload slot that fails**, and **the mechanism value that catches it**. It requires no authored content, no node, and no citation to run.

**It is explicitly not SUB-11's standards-conformance review of the package's exemplars.** That review is owned and run by **SUB-11 (NEU-967)**, a sibling of SUB-9 (NEU-965). **SUB-4 cites it and never waits on it, never produces it, and never claims its result.** A standard that could only be checked by first authoring an exemplar would be a standard nobody could apply until the exemplars existed; that is precisely the coupling this walkthrough removes.

> **`C2` / `EXC-1` — the anti-fabrication rule, applied to the constructed artifacts below.** They contain **zero invented identifiers, addresses or citations**. Every `problem_ref` reads exactly `REFUSED — not verifiable`. Every node id is a **withheld angle-bracket placeholder**, because a plausible-looking node id in a document like this one is the exact failure mode incident `EXC-1` recorded: two independent mappers copied a template's own illustration as if it were data. **A non-example that teaches fabrication has cost more than it taught.** The placeholders are also the point — the check runs without them being filled.

### 7.1 Artifact A — a `solution` with no stated invariant

```
form: solution
node_id:                <withheld — a real node id is not needed to run this check, and inventing one is refused>
problem_ref:            REFUSED — not verifiable
approach_class:         a locally-best-choice class
reasoning:              The approach applies because processing the input in the stated order
                        arrives at the same answer as considering it in any other order.
exposure_precondition:  after the learner's bounded attempt sequence completes
```

| | |
| --- | --- |
| **Standard** | Solution (§2.2) |
| **Exact failure site** | `reasoning` → the **`invariant` named slot** is absent |
| **Mechanism that catches it** | `schema` — slot presence inside a constrained payload |
| **Walk** | `reasoning` is present and non-empty, so **SUB-2's `solution` form definition is satisfied and does not reject this artifact.** The solution *standard* fails it: the constrained payload inside `reasoning` requires a named `invariant` slot, and there is none. The prose asserts an order-independence property without ever stating it as the invariant, so there is nothing for the boundary-confrontation check (`automated`) to confront. Failing at slot presence is the correct and cheapest outcome — the stronger check is not reached, and does not need to be. |
| **What the failure does *not* say** | Nothing about severity, and nothing about what happens to the artifact next. **SUB-9 owns that axis.** |

### 7.2 Artifact B — a `proof` skipping optimal substructure

```
form: proof
node_id:  <withheld — inventing one is refused>
claim:    the stated bound is attained by the described evaluation order
argument:
  overlapping_subproblems:  distinct prefixes arrive at the same state, so the state count stays polynomial
  recurrence_justification: each state takes the best value over the transitions listed above
misconception_or_edge_case:              the boundary at which the claim stops holding
separating_distractor_or_boundary_input: an instance at that boundary
```

| | |
| --- | --- |
| **Standard** | Proof (§2.3) |
| **Exact failure site** | `argument` → the **`optimal_substructure` slot** is absent |
| **Mechanism that catches it** | `schema` — slot presence inside the three-slot payload |
| **Walk** | `argument` is present and non-empty, so **the form definition is satisfied.** The proof *standard* is not: the three-slot payload requires `optimal_substructure`, `overlapping_subproblems` and `recurrence_justification`, and the first is missing. The artifact justifies why the memoized realization is efficient and never justifies why the decomposition is valid — the most common shape of an inadequate correctness argument, and the reason all three slots are REQUIRED rather than "at least one". |
| **Second, independent failure** | The **closure link** also fails: `separating_distractor_or_boundary_input` names no case label appearing in `recurrence_justification`, whose "the transitions listed above" is not a labelled case set. Mechanism: `deterministic`. **Two independent checks fail this artifact**, which is the intended redundancy — padding the missing slot with a sentence would still leave the closure link failing. |
| **Residue** | Whether an `optimal_substructure` slot, once supplied, contains a *sound* exchange step is judgment (§3.2), and no check here is credited with deciding it. |

### 7.3 Artifact C — a `test` with no edge case

```
form: test
node_id:                                 <withheld — inventing one is refused>
subject:                                 the learner's implementation of this node's technique
input_class:                             the nominal class named in the lesson's applies_when condition
expected_behavior:                       the value the node's independently derived worked example produces
misconception_or_edge_case:              kind: misconception — the learner takes a sum where the technique takes a maximum
separating_distractor_or_boundary_input: an input on which the sum and the maximum differ
```

| | |
| --- | --- |
| **Standard** | Test (§2.4) |
| **Exact failure site** | The node's `test` set → the **`kind:` label payload inside `misconception_or_edge_case`** yields `{misconception}` and not `{edge, misconception}` |
| **Mechanism that catches it** | `deterministic` — a count of distinct labels across the node's `test` instances |
| **Walk** | **This artifact is individually valid against SUB-2's form and individually valid against the test standard.** Every REQUIRED field is filled, the `kind:` label is present and permitted, `expected_behavior` is derived independently of the artifact named in `subject`, and the separating input genuinely separates the named misconception. It fails anyway — **because coverage is a property of the set and this node's set contains no `kind: edge` instance.** A learner whose implementation is right in principle and wrong at the boundary of `input_class` passes every test on this node. |
| **Why this case is in the walkthrough** | It is the one failure a per-artifact review structurally cannot find. Stating the coverage obligation over the set, and detecting it by counting labels, is what makes it findable at all. |

**All three walks completed with no exemplar, no citation, no node id and no external reference.** That is the property this section exists to demonstrate.

---

## 8. Evidence and records

| Record | Path |
| --- | --- |
| Scope audit of the 19 escape-hatch ids, the `JS-U2` directional-statement audit, and the walkthrough evidence trace | `traceability/04_standards-evidence-and-scope-audit.md` |
| The standard-language and escape-hatch-language decision, its rationale, its rejected alternatives and the membership-by-id selection rule | `decision-records/DR-C09-04_authoring-languages.md` |
| Open items filed by this sub-task (`OI-S4-1` … `OI-S4-7` and the further entries of § `SUB-4`) | `90_open-items-and-provisional-register.md` § `SUB-4` |
| Caps and incomplete scope declared by this sub-task | `91_caps-and-incomplete-scope.md` § `SUB-4` |
| The forms, fields and REQUIRED/OPTIONAL marks every standard above attaches to | `02_content-and-exercise-forms.md` §3, §4, §6.2 |
| The `JS-E1` … `JS-E9` effect definitions, cited by id and never re-derived | `../C005-dp-js-materiality/01_effect-catalogue.md` |
| The interim problem-reference field set and its open challenge `CH-F5-1` | `decision-records/DR-C09-01_permitted-field-set.md` |

---

## 9. What this document does not do

- It does **not** define the forms or their fields — that is **SUB-2** (NEU-958). This document sets the bar those existing fields must meet, adds no field, and promotes no `OPTIONAL` field to `REQUIRED`.
- It does **not** implement a gate, assign a blocking behaviour, or assign a placement — **SUB-9** (NEU-965) owns both axes. The pre-classification in §3 is **provisional and non-binding**, and SUB-9's assignment governs.
- It does **not** build or select an exercise runner, an editor, or a judge.
- It does **not** re-decide the standard authoring language. TypeScript on a Node runtime is settled charter-wide and is recorded, not reopened.
- It does **not** widen the escape hatch, and it does **not** re-assess JavaScript materiality for any node — **NEU-941** owns that assessment at `rule_version: 1.0.0`. Widening pressure is filed as `OI-S4-6`.
- It does **not** run the standards-conformance review over the package's exemplars — that is **SUB-11** (NEU-967), cited here and **never produced and never waited on**. §7 is SUB-4's own end-to-end check and is not a substitute for it.
- It does **not** design which misconception a discriminative item must detect — that is **SUB-6** (NEU-962).
- It makes **no claim about an external problem's own solution or editorial**, and stores no external statement text.
- It sets **no status.** Status lives in a ledger.

**No QA-engine run is claimed.** `qa-execution:engine` is **unconfigured** in this project's capability registry, which resolves to **`git, linear`** only. The QA-execution phase is therefore a genuine **Core Article 8 no-op** — not a skipped step, not a deferred one. **No QA pass, scenario, verdict or report is asserted or implied anywhere in this document** (consistent with `CAP-S1-3` and `CAP-S2-2`).
