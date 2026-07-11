# Trace-Record Schema, Relation Vocabulary & Completeness Lattice

**Task:** NEU-899 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 product model (`../product-model/`) + NEU-897 package (`../`).
This file defines the *structure* the rest of the package instantiates: the trace-record schema, the typed relation edges, the completeness-state lattice, the ID conventions, and the orphan-check definitions. It decides no product content and adjudicates no status.

---

## 1. Design constraints (why the structure looks like this)

1. **Non-destructive wrapping.** NEU-898 already assigned every material element a stable id and an evidence class + limitation. This task must make each element *independently traceable in both directions* without renumbering, duplicating, or contradicting it. Therefore a trace record is keyed **by the element's own id** (`TR-<elementId>`); it introduces no second numbering for the element.
2. **Bidirectional by construction.** A reviewer must be able to start from an element and reach its evidence, *and* start from an evidence item, an intended learner behavior, a metric, a decision rule, or a rejected alternative and reach the element — with no undocumented context (acceptance scenario 1). The schema therefore records a **forward** trace and a **reverse anchor** on every record, and `02_…` materializes both as walkable indices.
3. **Completeness is explicit, not implied.** NEU-898 marked elements provisional / incomplete / settled in prose. This task promotes that to a closed 4-value lattice (§4) attached to every record, and separates *evidence-insufficiency at this tier* (PROVISIONAL/INCOMPLETE) from *a missing downstream authoritative artifact* (UNRESOLVED + an `INC-*` marker), because acceptance scenario 3 requires the latter to be reported as incomplete rather than filled with a locally invented value.
4. **Orphans cannot count toward approval.** Anything that fails a direction of trace, or a candidate/evidence/decision/exclusion with no link, must surface in an audit (acceptance scenario 4). The orphan checks (§6, run in `04_…`) are the enforcement surface.

## 2. The trace-record schema

Every material element gets exactly one record with these fields. Absent or not-yet-existing values are written explicitly (`—`, `UNRESOLVED`, or an `INC-*`/`LINK-*` reference), never left blank.

| Field | Meaning | Source of truth |
| --- | --- | --- |
| **Trace id** | `TR-<elementId>` (e.g. `TR-P1`, `TR-BM-2`, `TR-CAND-4`). The element id is reused verbatim. | NEU-898 |
| **Element** | The element and its family (principle / differentiator / failure mode / job / motivation / risk / decision / rejected-alternative / exclusion / benchmark-state / boundary-wall / candidate). | NEU-898 |
| **Forward trace → evidence** | The NEU-897 finding/conflict/gap source id(s) (`F*`,`X*`,`G*`,`S*`), the **evidence class** (1–7 label), and the **structural limitation** carried from that source. | NEU-897 via NEU-898 `04_…` §1 |
| **Reverse anchor** | The intended-learner-behavior / metric-or-signal / decision-rule / rejected-alternative the element governs — the handle a reviewer walks *back* from. | NEU-898 |
| **Relation edges** | Typed edges to other elements (`REL:*`, §3). | NEU-898 |
| **Materiality** | The materiality-rule clause (`DEC5`, rule 1–6 / guardrail G-a/G-b/G-c) that makes it material, or — for excluded records in `05_…` — the non-material rationale. | NEU-898 `02_…` |
| **Inclusion status** | Included / Provisional / Incomplete / Routed / Non-material (verbatim from NEU-898 disposition). | NEU-898 `02_…` |
| **Completeness state** | One of SETTLED / PROVISIONAL / INCOMPLETE / UNRESOLVED (§4). | this task (derived, §5) |
| **Blocking artifact** | For UNRESOLVED records: the `INC-*` marker and its owning sub-task. Otherwise `—`. | this task `03_…` |

## 3. Trace-relation (edge) vocabulary

A typed, closed set of edges. Each is directional and has an implied inverse, so the reverse index (`02_…`) can be generated mechanically. No edge asserts new content; each restates a relationship already stated in NEU-898.

| Edge (`REL:`) | Meaning | Inverse |
| --- | --- | --- |
| `evidenced-by` | element ← NEU-897 source | `evidences` |
| `mitigates` | principle/decision → failure mode / risk it addresses | `mitigated-by` |
| `realizes-job` | element → learner job (J) it serves | `served-by` |
| `covers` | benchmark-state cell → failure mode / conflict it exercises | `covered-by` |
| `excludes` | exclusion (EX) / wall (BX) → the position it walls off | `excluded-by` |
| `rejects` | rejected alternative (RA) → the element/position it was weighed against | `rejected-for` |
| `provisional-on` | element → the open gap (`G*`) / conflict (`X*`) / class-7 question keeping it provisional | `keeps-provisional` |
| `incomplete-on` | element → the cap-bound gap (EX5) it cannot close here | `keeps-incomplete` |
| `blocked-by-artifact` | element → the `INC-*` missing downstream artifact | `unblocks` |
| `routed-to` | non-material-here candidate → the downstream chapter/sub-task that owns it | `owns` |

## 4. The completeness-state lattice

A closed 4-value set attached to every record. It **subsumes** NEU-898's prose terms (mapping below) and adds the UNRESOLVED value the traceability audit needs; it does **not** re-adjudicate any element (NEU-906 owns mutable STATUS).

| State | Definition | This-tier authority | NEU-898 term it maps from |
| --- | --- | --- | --- |
| **SETTLED** | A product-foundation decision this tier is entitled to make; not gated on any open gap or downstream artifact. | Final at this altitude. | "Settled at product altitude" (`04_…` §3) |
| **PROVISIONAL** | Supported by class-1–6 evidence that is *insufficient to settle* (needs class-7 real-user evidence or in-domain measurement). | Held open; not a finding. | "Provisional" (`04_…` §3) |
| **INCOMPLETE** | Materially needed but **unanswerable within NEU-897's caps**; barred from resolution here by EX5. | Recorded, not started. | "Incomplete (cap-bound)" (`04_…` §3) |
| **UNRESOLVED** | Depends on an **authoritative downstream artifact that does not yet exist** (benchmark result, measurement contract, decision rule, production replacement signal). Its absence is recorded as an `INC-*` marker with a named owner. | **Must be reported as incomplete; never filled with a locally invented value.** | (new — the acceptance-scenario-3 surface) |

**Distinction that matters (acceptance scenario 3):** PROVISIONAL/INCOMPLETE describe an *evidence* limitation at this tier; UNRESOLVED describes a *contract/artifact* dependency owned elsewhere. A metric, threshold, decision rule, or revision trigger that is not yet defined is **UNRESOLVED**, never PROVISIONAL — because inventing it here would usurp SUB-4's sole authority. The audit (`04_…` OC-5) enforces that no UNRESOLVED item carries a locally invented value.

**Severity floor interaction (G-a).** A record whose element is a High/Critical risk (R1–R5) may be PROVISIONAL/UNRESOLVED but is **never** SETTLED-as-closed and never downgraded off the inventory; its completeness state can only change on new correctly-classed evidence (NEU-898 `02_…` guardrail G-a). This is checked by `OC-7`.

## 5. How the completeness state is derived (deterministic)

For each element, apply in order (first match wins), reading only NEU-898's recorded disposition/status:

1. If NEU-898 lists it under "Settled at product altitude" (DEC1–DEC5, EX1–EX6, the prerequisite boundary, the materiality rule) → **SETTLED**.
2. Else if its blocking dependency is a *missing downstream artifact* (a metric/threshold/decision-rule/benchmark-result/replacement-signal owned by NEU-900 / SUB-4 / NEU-906) → **UNRESOLVED** (+ `INC-*`).
3. Else if NEU-898 marks it "Incomplete (cap-bound)" (EX5 bars closing the gap) → **INCOMPLETE**.
4. Else if NEU-898 marks it "Provisional" (class-1–6 evidence insufficient / class-7-dependent) → **PROVISIONAL**.

This derivation is mechanical and auditable: every state in `01_…`/`03_…` cites the NEU-898 line it came from, so an independent reviewer can reproduce it. It introduces **no** new judgement about the evidence itself.

## 6. Orphan-check definitions (enforced in `04_…`)

| Id | Check | Passing condition |
| --- | --- | --- |
| **OC-1** | Forward-orphan (element → evidence) | Every material element has ≥1 `REL:evidenced-by` (or an explicit charter/discipline-decision basis for SETTLED elements). |
| **OC-2** | Reverse-orphan (evidence → element) | Every NEU-897 `F*`/`X*`/`G*` item is consumed by ≥1 element (reconciled against NEU-898 `04_…` §1). |
| **OC-3** | Candidate-orphan | Every CAND-1…32 is either Included with a materiality criterion or Non-material/Routed with a retained rationale — none absent. |
| **OC-4** | Decision-orphan | Every DEC and RA links both to its basis and to what it governs/was weighed against. |
| **OC-5** | Metric/signal-orphan & invented-authority | Every metric/signal referenced (`averageQuality`, `time_spent_ms`, per-pattern mastery, any threshold/decision-rule) ties to a material element **and** to a completeness state; no UNRESOLVED metric carries a locally invented value. |
| **OC-6** | Exclusion-orphan | Every EX and BX carries its rationale and names the boundary it guards. |
| **OC-7** | Risk severity-floor | Every High risk (R1–R5) is present, material, and non-downgradable; none is SETTLED-as-closed. |

An item failing any check is **reported** in `04_…` and **cannot silently count toward approval** — this is the enforcement of acceptance scenario 4.
