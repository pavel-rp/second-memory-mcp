# 09 — Enforcement Classification and Gap Register

**Task:** NEU-965 (SUB-9) · **Charter:** C009 (umbrella NEU-890) · **Companion to:** `../09_enforceable-quality-system.md` · **Compiled:** 2026-08-11 · **Verification cutoff:** 2026-08-11 · **Status:** **deferred — this document SETS no status**
**Model:** claude-opus-5[1m]

---

## 0. What this register is

The evidence side of SUB-9. The topic document states the quality system; this file carries the per-requirement audit trail, the gate-failure tests, the payload inspections, the two probe records, the prototype record, and the non-mutation audit.

**Three things it is not.**

- **Not a gate run.** No gate specified in `../09_…` §4 or §7 has been executed against a content unit, because no content unit exists (`CAP-S8-4`). The tests in §3 are **desk-executed against constructed bad units**, in the shape of `../../C005-product-foundation/measurement-contracts/03_requirement-decision-mapping-gate.md` §4 — a reasoning trace over a rule, not an execution trace from a runner. **The distinction is stated here rather than left to be inferred from the tables' confidence.**
- **Not a QA report.** `qa-execution:engine` is unconfigured (`../09_…` §14). No engine verdict is claimed.
- **Not a status.** `A4`: a producing task may not promote its own artifact.

---

## 1. Per-requirement anchors

Every `EQ-` row in `../09_…` §4 resolves to a section of an upstream C009 document. This table is the resolution, so a reader can check any classification against the sentence it was made from without re-reading eight documents.

| Rows | Upstream anchor | Read at |
| --- | --- | --- |
| `EQ-S1-1` … `EQ-S1-14` | `../01_provenance-and-rights.md` §2, §3, §3.1, §4, §4.1, §5, §5.1, §6, §7.1, §7.2, §7.3, §8 | 2026-08-11 |
| `EQ-S2-1` … `EQ-S2-9` | `../02_content-and-exercise-forms.md` §3, §4, §5.1, §5.2, §6.3, §6.4 | 2026-08-11 |
| `EQ-S3-1` … `EQ-S3-16` | `../03_problem-citation-verification-and-access-paths.md` §3, §5, §5.1, §6.1, §6.2, §6.3, §7.1 | 2026-08-11 |
| `EQ-S4-1` … `EQ-S4-11` | `../04_correctness-standards-and-authoring-languages.md` §2.1, §2.2, §2.3, §2.4, §3.1, §3.2 | 2026-08-11 |
| `EQ-S5-1` … `EQ-S5-5` | `../05_per-cluster-conceptual-obligation.md` §5, §6, §9, §10 | 2026-08-11 |
| `EQ-S6-1` … `EQ-S6-12` | `../06_assessment-evidence-out-of-band.md` §3.3, §3.4, §4, §4.0, §4.1, §5.2, §5.3, §6.1, §8, §9, §10 | 2026-08-11 |
| `EQ-S7-1` … `EQ-S7-10` | `../07_difficulty-calibration.md` §4, §4.2, §4.3, §4.4, §5.1, §5.2, §5.3, §5.4, §9.2, §9.3, §9.4 | 2026-08-11 |
| `EQ-S8-1` … `EQ-S8-12` | `../08_authoring-workflow-and-in-situ-review-loop.md` §3.1, §3.2, §4.1, §4.2, §4.3, §5, §6.3, §7, §8, §9, §10.2 | 2026-08-11 |
| `MC-4 v1.0` | `../../C005-product-foundation/measurement-contracts/01_measurement-contract-register.md` | 2026-08-11 |
| Gate-failure test shape | `../../C005-product-foundation/measurement-contracts/03_requirement-decision-mapping-gate.md` §4 | 2026-08-11 |

**Coverage arithmetic, restated so it is checkable against `../09_…` §4.9:** 14 + 9 + 16 + 11 + 5 + 12 + 10 + 12 = **89 rows**, **0 unclassified**, **15 classified `AI`**, **16 enforcement-gap entries** (the sixteenth, `OI-S9-15`, is the classification pass itself and is not an upstream requirement).

---

## 2. The mechanism assignment, audited against its own rule

`../09_…` §3.1 assigns the **weakest sufficient mechanism, first match** in the order `deterministic` → `schema` → `server-side` → `automated` → `AI`. A classification scheme that publishes an assignment rule and then does not follow it is worse than one that publishes none, so the rule was re-applied to every row that reached `AI` — the direction where a mis-assignment silently manufactures a residual — and to every row assigned `automated` or `server-side`, where a mis-assignment silently manufactures enforceability.

| Check | Result |
| --- | --- |
| Rows reaching `AI` where a cheaper mechanism was **not** tried and rejected in writing | **0.** Each of the 15 carries its rejection in the `../09_…` §11 row's *"what the gate does not catch"* cell, which names the cheaper gate that was tried. |
| Rows assigned `automated` that a `deterministic` reading would have decided | **0.** Each of the 10 requires an execution or a re-run: `G-ENUM-SCAN`, `G-NOTEXT-SCAN`, `G-DRIFT`, `G-MATCH`, `G-TRANSPORT`, `G-BOUNDARY`, `G-DISCRIMINATION`, `G-UNDEF-TERM`, `G-MISFILING`, `G-CITE-RESOLVE`'s resolution limb. |
| Rows assigned `server-side` that the artifact's own bytes would have decided | **0.** Each of the 14 reads the node record, sibling units, or a persisted chain. |
| Rows where two separable obligations were collapsed into one mechanism | **0 remaining.** Three were found and split: SUB-4's solution standard into `EQ-S4-4`/`EQ-S4-5`/`EQ-S4-6`; SUB-4's proof standard into `EQ-S4-8`/`EQ-S4-9`/`EQ-S4-10`; SUB-1 §6 into `EQ-S1-6` (artifact side, `automated`) and `EQ-S1-7` (context side, `AI`). |
| **Rows where the compensating gate is described as discharging the obligation** | **0.** Enforced by the mandatory *"what the gate does not catch"* column; a row with that cell empty is inadmissible by `../09_…` §3.4. |

**The one direction this audit cannot check itself.** Whether a row assigned `automated` *should* have been `AI` is the same judgement the row is about, made by the same pass. That is `OI-S9-15`, and no table in this file closes it.

---

## 3. Gate-failure tests — five constructed bad units

**Shape**, from `03_requirement-decision-mapping-gate.md` §4: inject a bad unit → run the gate rule → verdict → aggregate → **and then attempt to fabricate a pass, and show which second rule that trips.** The fourth step is the one that matters: a gate whose only defence is the check itself is defeated by whoever writes the unit, and every test below is scored on whether the cheapest evasion is also caught.

### BU-1 — a fabricated citation

1. **Inject.** A `problem-reference` carrying `stable_id: "CF-1547-E"` and a plausible `canonical_url`, with **no dated resolution record** in `03_access-path-and-verification-record.md`.
2. **Run `G-CITE-RESOLVE`** (`EQ-S1-10`, `EQ-S3-4`, `server-side`). No row resolves the id to a dated verification observation. ⇒ **Verdict = BLOCK.**
3. **Aggregate.** One BLOCK on a citation-record gate ⇒ the unit does not advance; `T-09` to `blocked`, `RR-CITE` carries `verification_step_reached: V3`.
4. **Fabricate a pass.** Write a resolution row asserting the id was fetched. ⇒ Trips the **SUB-3 §9.1 request-pattern audit**, whose per-source request ledger records **zero requests to any of the twelve sources**, and `G-FETCH-CLAIM` (`EQ-S1-11`, MAY NEVER 2), which blocks a verification date against a source no request was made to. ⇒ **still FAIL.**

**Also demonstrated:** the evasion is *cheaper* than the honest path today, because the honest path is shut by `G-ACCESS-GATE`. That is the argument for `G-FETCH-CLAIM` existing as a separate `deterministic` gate rather than as a clause of `G-CITE-RESOLVE`.

### BU-2 — a solution with a hidden failing case

1. **Inject.** A `solution` whose `approach_class: greedy` and whose `reasoning.invariant` reads *"the locally optimal choice is globally optimal"* — for a node whose `test` set contains an instance whose `separating_distractor_or_boundary_input` is exactly the input where the greedy choice fails.
2. **Run `G-BOUNDARY`** (`EQ-S4-6`, `automated`). Confront the approach with every `test` instance on the node. The approach produces a result differing from that instance's `expected_behavior`. ⇒ **Verdict = BLOCK.**
3. **Aggregate.** One BLOCK ⇒ `T-09` to `blocked` with `RR-CORRECT` carrying `standard: Solution`, `mechanism: automated` (`../09_…` §5.1).
4. **Fabricate a pass.** Delete the failing `test` instance from the node so nothing confronts the invariant. ⇒ Trips **`G-TEST-COVERAGE`** (`EQ-S4-11`, `server-side`), which requires the node's `test` set to carry at least one `kind: edge` **and** one `kind: misconception`; the deletion drops the set below the floor. ⇒ **still FAIL.**

**And what is *not* demonstrated, stated because this is the test most likely to be over-read:** if the node's `test` set never contained the failing input, `G-BOUNDARY` passes a wrong invariant cleanly and no second rule fires. That is `OI-S9-3`'s *"what the gate does not catch"* cell, reached here by construction rather than by assertion.

### BU-3 — a proof missing a required slot

1. **Inject.** A `proof` whose `argument` carries `overlapping_subproblems` and `recurrence_justification` but **no `optimal_substructure`**.
2. **Run `G-ARGUMENT-SLOTS`** (`EQ-S4-8`, `schema`). A declared slot is absent. ⇒ **Verdict = BLOCK.**
3. **Aggregate.** `T-09` to `blocked`; the finding names the slot, not the prose.
4. **Fabricate a pass.** Paste the text of `overlapping_subproblems` into `optimal_substructure` so all three slots are present and non-empty. ⇒ Trips the **pairwise-distinctness limb** of `G-ARGUMENT-SLOTS` — the one addition SUB-9 makes to SUB-4's standard, declared as a gate-design decision with its reason in `../09_…` §5.3. ⇒ **still FAIL.**
5. **Fabricate harder.** Write three distinct but vacuous slots. ⇒ **PASSES `G-ARGUMENT-SLOTS`.** `G-CLOSURE-LINK` (`EQ-S4-9`) fires only if the boundary instance's case label is absent from `recurrence_justification`; a fabricated matching label clears it too. **What remains is `OI-S9-2` — the exchange step's soundness — which no gate decides.** Recorded as a **failed** fabrication defence, not smoothed into a pass.

### BU-4 — a schema-invalid discriminative form

1. **Inject.** A `retrieval` item carrying `misconception_or_edge_case` but **no `separating_distractor_or_boundary_input`**.
2. **Run `G-FORM-REQUIRED`** / **`G-PAIR`** (`EQ-S2-1`, `EQ-S2-2`, `schema`). `retrieval` is one of the seven discriminative forms and the REQUIRED pair is incomplete. ⇒ **Verdict = BLOCK.** SUB-2 §4: *"a submission that omits either is rejected by the form definition itself."*
3. **Aggregate.** `T-03` returns `revise`; the unit re-enters `draft`.
4. **Fabricate a pass.** Fill the field with `"n/a"`. ⇒ Non-empty, so `G-PAIR` passes — and the unit meets **`G-DISCRIMINATION`** (`EQ-S6-4`, `automated`), SUB-6 §5.2 condition 2: substitute the named misconception's method and evaluate it on the named input. `"n/a"` is not an input, the substitution cannot be run, and an unrunnable discrimination check is a **BLOCK**, not a pass. ⇒ **still FAIL.**

**The residue, named:** a *plausible but non-separating* distractor — a real input on which the misconception's method happens to fail — passes both gates while failing SUB-6 §5.2 condition 1's *"names a specific wrong model"*. That is `OI-S9-10`.

### BU-5 — a calibrated value published without its label

1. **Inject.** A node publishing `calibrated_difficulty` as the triple, with `provisional_load_index` populated, and **without** the SUB-7 §9.4 verbatim label.
2. **Run `G-CALIB-LABEL`** (`EQ-S7-8`, `deterministic`). Every calibrated output produced at this cutoff must carry the label — SUB-7 §9.2: *"Not some — all 179."* ⇒ **Verdict = BLOCK.**
3. **Aggregate.** `T-09` to `blocked`.
4. **Fabricate a pass.** Add an external rating to the node so the label no longer applies. ⇒ Trips **`G-RATING-PROV`** (`EQ-S7-7`, `server-side`), which requires a class-X value to resolve to a **dated verification observation** with its access path; `07_calibration-input-traceability.md` records **0 external observations** and `G-ACCESS-GATE` shuts every source, so no such observation can exist. ⇒ **still FAIL.**
5. **Fabricate differently.** Re-class the load dimensions from P to MD so the triple reads as verified. ⇒ Trips **`G-CLASS-MONO`** (`EQ-S7-3`): *a provisional input is never re-classed upward by any pass.* ⇒ **still FAIL.**

### 3.1 Roll-up

| Bad unit | Primary gate | Verdict | Fabrication defence |
| --- | --- | --- | --- |
| **BU-1** fabricated citation | `G-CITE-RESOLVE` | **BLOCK** | **HELD** — request-pattern audit + `G-FETCH-CLAIM` |
| **BU-2** hidden failing case | `G-BOUNDARY` | **BLOCK** | **HELD** for the deletion evasion; **not held** where the node's tests never reached the case (`OI-S9-3`) |
| **BU-3** missing proof slot | `G-ARGUMENT-SLOTS` | **BLOCK** | **HELD** for copy-paste; **FAILED** for vacuous-but-distinct prose (`OI-S9-2`) |
| **BU-4** incomplete discriminative pair | `G-PAIR` | **BLOCK** | **HELD** for `"n/a"`; **not held** for a plausible non-separating distractor (`OI-S9-10`) |
| **BU-5** unlabelled calibrated value | `G-CALIB-LABEL` | **BLOCK** | **HELD** on both evasions |

**Five BLOCKs, five fabrication attempts, two clean holds and three partial ones.** The three partials are not defects of the tests; they are the same three residuals `../09_…` §11 already names, reached from the attacking side. **A roll-up reading five-for-five would have been the laundered version of this table**, and the difference between the two is one sentence per row that a less careful pass would have omitted.

---

## 4. Findings-payload inspection, per gate

**The two constraints every gate's payload is inspected against:**

1. **`src/server/topic-tools.ts` serializes the structured `findings` array only on `error.type === 'content_quality'`.** On every other error type the array is **silently dropped** — no warning, no partial. **A gate that emits its findings under `validation` emits nothing**, which fails invisibly and would read as a clean pass.
2. **`src/shared/logger.ts`'s `LOG_REDACT` set is `password`, `token`, `apiKey`, `api_key`, `authorization`, `secret`.** Learner `response` text is **not** in it, and the module's own doc comment records that it is *"intentionally NOT redacted."* SUB-6 §10 files this as `OI-S6-5`. **The consequence for gate design is a design constraint, not a warning:** no gate may place learner `response` text in any field that reaches a log.

**The canonical payload shape, for every gate in `../09_…` §7:**

```
{ unit_id, node_id, field_or_slot, rule_id, verdict }
```

**Five identifiers and a verdict. No prose, no excerpt, no learner text, no source text.**

| Gate family | Payload carries | Excluded, and why |
| --- | --- | --- |
| Rights gates — `G-ACCESS-GATE`, `G-ENUM-SCAN`, `G-NOTEXT-SCAN`, `G-FIELDSET`, `G-RIGHTS-CITE`, `G-FETCH-CLAIM`, `G-ATTRIB-RECORD` | `source_id`, `access_row_ref`, the **offset pair** of the scan hit | **The matched text.** A no-text-scan finding that quoted its match would store the protected statement in the finding — the exact harm the gate exists to prevent. The offset pair locates it for the author without retaining it. |
| Form and placement gates — `G-FORM-REQUIRED`, `G-PAIR`, `G-PLACEMENT`, `G-ANCHOR`, `G-EDGE-FIELD` | `form`, `skill_type`, the missing field's **name** | Field **values**. A missing-field finding needs the field's name, never its neighbours' contents. |
| Citation gates — `G-CITE-RESOLVE`, `G-DRIFT`, `G-MATCH`, `G-V-ALL`, `G-PRESELECT`, `G-BUDGET` | `stable_id`, `canonical_url`, `verification_step_reached` | Title, constraints, difficulty, page body. `V5` reads them **only to confirm the match** and stores none; a finding that carried them would store through the gate what the procedure refuses to store through the record. |
| Correctness gates — `G-LESSON-FLOOR`, `G-INVARIANT-SLOT`, `G-BOUNDARY`, `G-ARGUMENT-SLOTS`, `G-CLOSURE-LINK`, `G-TEST-COVERAGE`, `G-UNDEF-TERM` | slot name, `approach_class`, the **failing test's `unit_id`**, and for `G-UNDEF-TERM` the candidate **term list** | The solution body, the proof prose, the produced-vs-expected **values**. `G-BOUNDARY` reports *which* test instance mismatched, never the mismatching output — which may embed a problem's input. |
| **Learner-content gates — `G-DISCRIMINATION`, `G-EDGECASE-SET`, `G-RECORD-KEY`** | `node_id`, `skill_type`, `learner_id`, `session_ref`, `observed_at`, and a **span offset pair into the persisted submission** | **The span text, and every byte of the learner's `response`.** Because `LOG_REDACT` would not redact it if it reached a log, these three gates carry offsets only. This is the one place where a live code-level fact (`OI-S6-5`) changes a gate's payload rather than merely being noted. |
| Calibration gates — `G-CALIB-SHAPE`, `G-CLASS-MONO`, `G-NO-ENTRYGATE`, `G-INADMISSIBLE`, `G-XCHECK-ROLE`, `G-RATING-PROV`, `G-CALIB-LABEL` | the triple's three components, `class`, `observed_at` | Nothing further is needed; the triple is already the published shape. |
| Workflow gates — `G-RECORD-SHAPE`, `G-SELF-REVIEW`, `G-QUARANTINE-SLOTS`, `G-HUMAN-REQUIRED`, `G-MISFILING`, `G-ESCALATION-COUNT`, `G-WARN-COUNT` | `record_id`, `transition`, `reviewer_role`, `reviewer_identity`, `evidence_class` | `rationale` prose. A self-review finding needs two identities, not two arguments. |
| Residual gates — `G-RESIDUAL`, `G-CLASS-ONE`, `G-CLASS7`, `G-EDGE-SET`, `G-REFUSAL-OK` | the unclassified id and the rule it failed | — |

**Inspection results:**

| Check | Result |
| --- | --- |
| Gates whose payload carries raw learner response text | **0 of 59** |
| Gates whose payload carries problem statement text, title, or constraints | **0 of 59** |
| Gates required to emit under `error.type === 'content_quality'` | **59 of 59** — stated as a design rule, since any other type drops the array silently |
| Gates whose payload changed because of a live code-level fact | **3** — `G-DISCRIMINATION`, `G-EDGECASE-SET`, `G-RECORD-KEY`, from `OI-S6-5` |

**The limitation of this inspection.** It inspects **specified** payloads. No gate is implemented, so nothing here was observed emitting anything. `CAP-S9-1`.

---

## 5. The three probe and prototype records

### 5.1 The contamination probe (`../09_…` §10.3)

| Field | Value |
| --- | --- |
| **Probe** | `C-3` — a model may not review an artifact it authored |
| **Population** | The one recorded AI correctness review of a C009 content unit: `../08_…` §10.1 row 4, `T-05`, `RR-CORRECT`, `evidence_class: 4 [ai-critique]`, `standard: Explanation`, `mechanism: AI` |
| **Method** | Compare the reviewing model id against the authoring model id, across the package's `**Model:**` attribution lines |
| **Observation** | All C009 markdown documents carry `**Model:** claude-opus-5[1m]`. The only files naming a different model name it as a **probe subject**, not an author: `dry-run/02_…` and `dry-run/03_…`, both `claude-sonnet (cold agent, no prior context)` |
| **Result** | **FAIL on the only instance available.** Author model = reviewer model. `C-3` violated. |
| **Corollary (`C-2`)** | **No independent AI confirmation exists anywhere in C009.** Any two documents agreeing is one observation, not two |
| **Evidence class** | **2 `[code-evidence]`** — an operational fact about committed documents. Limitation: model attribution is self-declared; the probe checks declared identity, not training-corpus overlap (`C-5`, `OI-S9-14`) |
| **Not executed** | The tautological-invariant probe of `../09_…` §10.3. Running it would require the reviewing agent to be the authoring model — the `C-3` violation the probe detects — producing a result of zero evidential value. **`CAP-S9-4`.** **Not run, and not reported as a pass.** |

### 5.2 The bounded prototype against `MC-4 v1.0`

| Field | Value |
| --- | --- |
| **Contract** | `MC-4`, **v1.0**, cited by id and version; **not redefined** |
| **Label** | `PROXY-BOUNDING`; decision rule **BOUNDING**; `RA5` retained (AI grading is not the signal of record) |
| **Executed** | 2026-08-10, local `vitest` binary invoked directly (not via a package script) |
| **Collection** | **2 files, 10 tests — non-zero, checked before any verdict was read.** A zero-collection run is a false green |
| **Outcome** | 2 passed / 2 · 10 passed / 10 |
| **Metric** | known-incorrect fixtures `ki-01`…`ki-10` scored `quality ≥ 3`: **0 of 10** ⇒ **false-accept rate 0.000** |
| **Ceiling** | `overValidationCeiling: 0.1` — `src/domain/config/algorithm-defaults.ts`, NEU-929 / `MM-T5` |
| **Verdict** | `evaluateOverValidation` ⇒ **within ceiling** |
| **Counter-direction** | valid-but-unusual `vu-01`…`vu-05` falsely rejected: **0 of 5** |
| **SCOPE — the part that must not be dropped when this is quoted** | The fixture feeds **hand-encoded rubric payloads** to the **deterministic mapper** `mapRubricToQuality`. **The AI-grading stage is stubbed.** This bounds **only `MC-4`'s downstream deterministic half** and says nothing about whether a live AI grader would emit over-validating rubric payloads. **It is a bounded prototype, not a harness, and not an end-to-end `MC-4` measurement.** |
| **Cap** | **`CAP-S9-2`**, owner **the creator**, closes when the batch runs with the AI-grading stage live |
| **Evidence class** | **2 `[code-evidence]`** |
| **Environment note** | Executed in the shared checkout rather than the worktree, after `git diff --stat` proved the five target files byte-identical to `origin/develop`. Disclosed rather than presented as a worktree run |

### 5.3 The `qa-execution` record

| Field | Value |
| --- | --- |
| **Registry** | `git`, `linear` |
| **`qa-execution:engine`** | **unconfigured** |
| **Consequence** | The QA-execution phase is a genuine **Core Article 8 no-op** — the extension point runs inert by design |
| **Claimed** | **Nothing.** No engine ran; no engine verdict is reported, implied, or summarised |
| **Actually run** | The §5.2 `vitest` batch; a direct `tsc --noEmit` whose green is **vacuous** here (this change touches no TypeScript); the §6 shell checks |

---

## 6. Non-mutation audit

**The claim under audit:** this sub-task changed exactly four files, appended to two shared registers without touching another sub-task's bytes, and modified nothing owned by anyone else.

| # | Check | Method | Result |
| --- | --- | --- | --- |
| 1 | Exactly four files in the diff | `git diff --stat` against the merge base | **PASS** — `09_enforceable-quality-system.md`, `traceability/09_enforcement-classification-and-gap-register.md` (both new), `90_…`, `91_…` (both appended) |
| 2 | **Both registers are append-only** | `git diff --numstat` — the deletions column must read **0** | **PASS** — `N 0` on both. **Zero deleted lines is the mechanical proof that no prior section was reflowed, renumbered or rewritten.** |
| 3 | Eight prior `### SUB-n` sections byte-for-byte unchanged | The `0` deletions of check 2, plus `grep -c "^### SUB-"` reading **9** per register with `### SUB-9` last | **PASS** |
| 4 | No file owned by another sub-task modified | The four-file diff of check 1 | **PASS** — `01_`…`08_` and every `traceability/01_`…`08_` untouched |
| 5 | **`92_package-completeness-gate.md` untouched** | Same | **PASS** — SUB-12's alone; no result read into it, no partial recorded |
| 6 | No `src/`, `tests/`, schema, or migration file changed | Same | **PASS** — this sub-task specifies gates and builds none |
| 7 | `docs/GLOSSARY.md` not changed | Same | **PASS** — deliberate, recorded in the plan in advance, following the SUB-2 / SUB-7 / SUB-8 precedent: this package's terms are defined at their point of use in the package, and the glossary indexes the running system's vocabulary |
| 8 | `pnpm-workspace.yaml` unmutated | Same | **PASS** — no `pnpm run` was invoked at any point; it rewrites the file on this machine |
| 9 | `09_` was free in both the package root and `traceability/` before writing | Directory listing at the merge base | **PASS** |
| 10 | No status set outside a ledger; no self-promotion to `settled` | Read of both new documents' status lines | **PASS** — both read `deferred`; `A4` respected |
| 11 | No class-7 `[future-real-user]` claim | Read of both new documents | **PASS** — class 7 appears only where it is named as forbidden |
| 12 | Every `**Model:**` attribution present | Read of both new documents | **PASS** — Article 4 |

---

## 7. What this register does not establish

- **That any gate works.** None is built, none has run, and the §3 tests are desk-executed reasoning traces over rules, not executions. **`CAP-S9-1`.**
- **That the classification is right.** One pass, one model, no independent review. **`OI-S9-15`** — the residual most likely to be wrong and least likely to announce itself, since a misclassified row reads as enforced and never triggers the residual clause.
- **That `MC-4` is measured.** §5.2 bounds its deterministic half. **`CAP-S9-2`.**
- **That contamination is absent.** §5.1 reports a **failure** on the one instance that exists, and `C-5` states that detection in general is not claimed. **`OI-S9-14`, `CAP-S9-4`.**
- **That the residual list is complete.** It is the floor, not the boundary. Unenumerated requirements are **blocked until classified** (`../09_…` §3.5), which fails safe for what is *missing* and does nothing for what is *mis-assigned*.
