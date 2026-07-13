# Per-Mechanism Decision-Record Template & Schema

**Task:** NEU-916 · **Compiled:** 2026-07-13 · **Consumes:** the instructional evidence register (`../traceability/01_instructional-evidence-register.md`) and the NEU-915 synthesis (`../`). **Referenced schemas (never rebuilt):** NEU-887 evidence taxonomy (`../../C005-product-foundation/01_evidence-taxonomy.md`) and adjudication status vocabulary (`../../C005-product-foundation/adjudication/00_adjudication-method-and-rule-versions.md`).

This file is the **template every mechanism-decision sub-task (NEU-917…921) authors a record against.** It defines the record *shape* and the *authoring rules* that make a non-compliant record (e.g. a learning-critical mechanism with a prose-only control) detectable as an unmet requirement **at authoring time**. **NEU-916 authors this template and fills in no record** — it makes no instructional decision. A filled record is `DR-Mxx` (e.g. `DR-M08`), owned by the mechanism-decision sub-task.

---

## 1. Required fields (the schema)

Every `DR-Mxx` record has exactly these fields, in this order. A field that does not apply is written explicitly (`— (rationale)`), never omitted.

| # | Field | What it must contain | Validation (fails if…) |
| - | --- | --- | --- |
| 1 | **Record id + mechanism** | `DR-Mxx`, mechanism name, cluster (§C-ACQ/PRAC/FBK/ASSESS/FRAME), authoring sub-task, date, and **learning-critical: yes/no** (from §3). | id/mechanism/learning-critical flag missing. |
| 2 | **Decision (observable behavior)** | The concrete instructional behavior the system will exhibit, stated as an **observable** (what a reviewer or a test can watch happen), not an intention. | Behavior is not observable/testable, or restates the mechanism name without a behavior. |
| 3 | **Cited evidence + class** | The register finding ids (`F-*`) the decision rests on, **each with its evidence class**. A **causal** behavioral claim must cite ≥1 causal-typed finding; a `code-evidence` (class-2) finding may support a compatibility claim but **never** a pedagogical-endorsement claim. | Any cited finding is not in the register; a causal claim rests only on non-causal evidence; a class-1–6 finding is used as external-user validation. |
| 4 | **Mastery signal** | What observable signal indicates the mechanism's objective is met (or `UNRESOLVED → LINK-I2` if the mastery-model sub-task owns it). | A signal value/threshold is invented here when it is the mastery-model sub-task's authority (`OC-5` / no-invented-value). |
| 5 | **Constraints** | The inherited constraints the decision honors: the CL/desirable-difficulty framing rule (`../02_…` — must state which load it spends/spares), the privacy gate (aggregate-only, class-6), the caps, and any cited conflict (`C1–C6`) it must not contradict. | The load/difficulty framing statement is absent (mechanism under-specified per `../02_…`). |
| 6 | **Uncertainty** | The carried DP-transfer uncertainty (`INC-I1`, always) plus every gap (`G*`) the decision is provisional on. States the decision is **provisional** and names what would settle it (class-7 / in-domain measurement). | DP-transfer uncertainty omitted; or the record presents DP effectiveness as established. |
| 7 | **Rejected alternative** | ≥1 alternative behavior weighed and **why** it was rejected, with the evidence/gap that decides against it. | No rejected alternative recorded (a decision with no considered alternative is incomplete). |
| 8 | **Enforceable control** | **REQUIRED for learning-critical mechanisms (§3); optional-with-rationale otherwise.** A machine-checkable control — see §2. | Learning-critical record has a missing or prose-only control (§2). |
| 9 | **Traceability back-links** | Register findings consumed; conflicts (`C*`) addressed; `INC-I#` markers carried; `LINK-I#` slots this record binds (e.g. `DR-M08` binds `LINK-I1` for M08). | A cited conflict/gap has no back-link; a bound `LINK-I#` is left UNBOUND. |
| 10 | **Ledger status** | The `settled / provisional / unresolved` status this record claims, mirrored into `../adjudication/01_…`. Empirical decisions are at most `provisional` (class-7 absent). | Status set to `settled`/`accepted` on class-1–6 evidence (reserved; forbidden by the inherited firewall). |

## 2. The enforceable-control field (the load-bearing requirement)

NEU-916 acceptance scenario 3: *"Given a learning-critical mechanism, when the template is inspected, then it requires an enforceable-control field so a prose-only decision is detectable as an unmet requirement at authoring time."*

An **enforceable control** is a control that a machine or a test can check — **not** a statement of intent. To be valid it must name **all three** of:

1. **The failure mode it prevents** — the specific way the mechanism silently corrupts the mastery/retention signal (cite the conflict `C*` or finding `F-*`, e.g. C4 "LLM over-validates incorrect answers").
2. **The mechanical check** — the gate, assertion, test, metric threshold, invariant, or schema constraint that detects the failure. It must be evaluable without human judgement in the loop (e.g. "a held-out adversarial grading fixture must fail-closed at ≥X detection", "the scheduler rejects a mastery signal derived from same-session massed recalls", "a CI test asserts a correct-answer exposure step exists after the 2nd failed attempt").
3. **The enforcement point** — where the check lives and runs (code path, test file, CI gate, runtime invariant), so its absence is detectable.

**Prose-only failure (the detectable unmet requirement).** A control that states only an aspiration ("the grader should be reliable", "we will monitor over-validation") without a mechanical check and enforcement point is **INVALID**. A conformance check over a learning-critical record MUST flag: *field 8 present but contains no mechanical check / no enforcement point → control is prose-only → requirement unmet.* This makes a prose-only decision detectable at authoring time, satisfying acceptance scenario 3. The threshold *value* inside the check may be `UNRESOLVED → LINK-I2` (deferred to the mastery-model sub-task) without making the control prose-only — what is required now is the **check's shape and enforcement point**, not its calibrated constant.

**Non-learning-critical mechanisms** may record `Enforceable control: — (not learning-critical: this mechanism does not gate or produce the mastery signal; mis-tuning degrades efficiency, not signal integrity)`. That explicit rationale is required; a blank field is invalid even for non-learning-critical records.

## 3. Learning-critical designation (inherited, not decided here)

A mechanism is **learning-critical** when mis-controlling it **silently corrupts the mastery/retention signal or gates progression on a corrupted signal** — the class of failure a downstream reviewer cannot see from output alone. This designation is **inherited** from the NEU-915 synthesis conflict-register severities and the charter's explicit labels; NEU-916 records it as scaffolding metadata (it is itself provisional and a downstream task may re-designate with cause). Each row cites its source.

| Mechanism | Learning-critical | Source (why) |
| --- | --- | --- |
| M01 Sequencing | no | Ordering mis-tuning degrades efficiency; does not corrupt the mastery signal. (C1 lives in M10/M09 gating, not M01 ordering.) |
| M02 Worked examples | no | Expertise-reversal mis-tuning wastes load; does not gate or falsify the signal. |
| M03 Retrieval | **yes** | Synthesis **C2** (HIGH): roadblock same-session massed recalls feed a *performance-inflated* signal to the scheduler. |
| M04 Spacing | **yes** | Synthesis **C2** (HIGH): the massed-vs-spaced recovery gate corrupts the scheduling signal (F-M04-2/6). |
| M05 Interleaving | no | Wrong-axis/absent interleaving is an efficiency/transfer loss (C5, MEDIUM); it does not falsify the signal. |
| M06 Feedback | **yes** | Synthesis **C6** + **F-M06-4**: AI-delivered diagnostic feedback is explicitly a learning-critical behavior needing an enforceable control. |
| M07 Productive struggle | no | Struggle mis-calibration wastes germane load; coupled to M06 but does not itself produce the graded signal. |
| M08 Assessment | **yes** | Synthesis **C4** (HIGH, explicitly "learning-critical"): LLM self-grading over-validates incorrect answers up to 71%; requires an enforceable control beyond prose. |
| M09 Remediation | **yes** | Synthesis **C3** (HIGH): unconditional lapse reset (repetitions→0, interval→1d) discards real prior learning, corrupting the retention model vs. savings. |
| M10 Progression | **yes** | Synthesis **C1** (HIGH): the prerequisite mastery gate decides advancement; a corrupted/too-weak gate advances on a false signal. |

**Six learning-critical mechanisms** (M03, M04, M06, M08, M09, M10) therefore carry a **required** enforceable-control field; **four** (M01, M02, M05, M07) carry the field with an explicit not-applicable rationale.

## 4. Blank record template (copy per mechanism → `DR-Mxx`)

> Downstream authors: copy the block below into `decision-records/DR-Mxx_<mechanism>.md`, fill every field, and mirror the status into `../adjudication/01_…`. Do not delete a field; write `— (rationale)` if it does not apply.

```
# DR-Mxx — <Mechanism name>

- **Record id / mechanism:** DR-Mxx · <mechanism> · cluster <§C-…> · author <NEU-9xx> · <date>
- **Learning-critical:** <yes | no>  (source: <C*/F*/charter>)

## Decision (observable behavior)
<The concrete, observable/testable instructional behavior the system will exhibit.>

## Cited evidence + class
- F-<…> [class N, <evidence type>] — <what it supports>
- … (a causal behavioral claim cites ≥1 causal finding; class-2 supports compatibility only)

## Mastery signal
<The observable signal that indicates the objective is met, or "UNRESOLVED → LINK-I2 (mastery-model sub-task)">.

## Constraints
- Cognitive-load / desirable-difficulty: <which load this spends / spares — required, per ../02_…>
- Privacy gate: <aggregate-only if any class-6 signal is used>
- Caps / conflicts not to contradict: <C*, cap refs>

## Uncertainty
- DP-transfer: INC-I1 — <unmeasured in DP; provisional>
- Gaps provisional-on: <G*, what would settle it (class-7 / in-domain measurement)>

## Rejected alternative
- <alternative> — rejected because <evidence/gap>.

## Enforceable control   (REQUIRED if learning-critical)
- Failure mode prevented: <C*/F*>
- Mechanical check: <gate / assertion / test / threshold / invariant — machine-checkable; threshold value may be UNRESOLVED → LINK-I2>
- Enforcement point: <code path / test file / CI gate / runtime invariant>
  (non-learning-critical: "— (not learning-critical: <rationale>)")

## Traceability back-links
- Register findings consumed: <F-*>
- Conflicts addressed: <C*>
- INC markers carried: <INC-I*>
- LINK slots bound: <LINK-I1 = this DR; LINK-I2 = mastery contract, if applicable>

## Ledger status
- <settled | provisional | unresolved> — mirrored into ../adjudication/01_… §<cluster>. (Empirical decisions ≤ provisional; `settled`/`accepted` reserved for audit-settled discipline decisions only.)
```

## 5. Authoring conformance checklist (a record is compliant iff all pass)

1. All ten fields present; none blank (non-applicable → `— (rationale)`).
2. Every cited `F-*` exists in the register; causal claims rest on causal findings; no class-7 laundering.
3. The cognitive-load / desirable-difficulty framing statement is present (field 5).
4. DP-transfer uncertainty (`INC-I1`) is carried (field 6).
5. ≥1 rejected alternative (field 7).
6. **If learning-critical:** the enforceable control names failure mode + mechanical check + enforcement point, and is **not prose-only** (§2). If non-learning-critical: the field carries the explicit not-applicable rationale.
7. No status is `settled`/`accepted` on class-1–6 evidence.
8. Every bound `LINK-I#` is actually bound; every carried `INC-I#`/`C*` is back-linked.

A record failing any item is **non-compliant** and cannot count as a settled mechanism decision — the enforcement surface for NEU-916's acceptance scenarios 1 and 3.
