# Instructional Scaffolding — Decision-Record Template, Extended Registers & Ledger

**Program:** C005 · **Umbrella:** NEU-888 · **Task:** NEU-916 (SUB-2, OUT-1 scaffolding) · **Depends on:** NEU-915 synthesis (this package) and NEU-887 machinery (`../C005-product-foundation/`) · **Compiled:** 2026-07-13

**What this is.** The reusable scaffolding every later NEU-888 sub-task consumes. It **extends — does not re-derive** NEU-887's traceability register and adjudication ledger to the instructional evidence base, registers every NEU-915 finding, and authors the per-mechanism decision-record template later sub-tasks write against. **It makes no instructional decision** — no mechanism behavior, no mastery signal, no threshold, no reconciliation verdict. It is the record shape and the evidence machinery, nothing more.

**Why it lives here (not in `../C005-product-foundation/`).** Per NEU-916's constraints, the extension is authored as **new files inside this package that reference the product-foundation schemas**, rather than by editing the product-foundation files. Downstream NEU-888 siblings (SUB-2…SUB-10) append to the register and ledger concurrently, so every register/ledger is split into **clearly-delimited per-mechanism / per-cluster sections** to minimise merge conflicts.

## The three deliverables

| # | Deliverable | File(s) | Consumed by |
| - | --- | --- | --- |
| 1 | **Per-mechanism decision-record template / schema** — fields for cited evidence + class, observable behavior, mastery signal, constraints, uncertainty, rejected alternative, and a **REQUIRED enforceable-control field for learning-critical mechanisms**. | `decision-records/00_decision-record-template.md` · `decision-records/README.md` | Every mechanism-decision sub-task (NEU-917…921) authors a `DR-Mxx` record against this. |
| 2 | **NEU-887 traceability register, extended to instructional evidence** — every NEU-915 finding (`F-*`) registered with its evidence class, provenance, cutoff, and structural limitation, plus the carried gap/conflict linkage. | `traceability/00_trace-extension-schema.md` · `traceability/01_instructional-evidence-register.md` | Any register-completeness audit; every decision record cites finding ids from here. |
| 3 | **Extended adjudication ledger skeleton** — every mechanism, cluster, conflict (C1–C6), and gap (G1–G8) carries a `settled / provisional / unresolved` status, seeded but **undriven** (NEU-916 flips no status to settled). | `adjudication/00_adjudication-extension-method.md` · `adjudication/01_instructional-decision-ledger.md` | The final package sub-task (NEU-925) drives it; each mechanism-decision sub-task updates its own rows. |

## Inheritance — what is reused verbatim, never rebuilt

This package **references** and does not re-author:

- **Evidence taxonomy** (7 classes, claim discipline, privacy gate): `../C005-product-foundation/01_evidence-taxonomy.md`, applied by `01_evidence-labeling.md` in this package. The register carries each finding's class from there; it re-defines nothing.
- **Trace-record schema, relation vocabulary, completeness lattice, orphan checks:** `../C005-product-foundation/traceability/00_trace-schema-and-conventions.md`. The instructional register instantiates this schema for evidence findings.
- **Adjudication method, frozen-rule discipline, status vocabularies, severity floor:** `../C005-product-foundation/adjudication/00_adjudication-method-and-rule-versions.md`. The instructional ledger reuses its `accepted / provisional / withheld / contradicted / unresolved` decision-status vocabulary and its evidence-class firewall.
- **Materiality rule, caps, status discipline** (status flips only in the ledger, on correctly-classed evidence): inherited unchanged.

If this package and a product-foundation file ever disagree, **the product-foundation file is authoritative** (this package extends it).

## New identifier families this task introduces (non-colliding)

| Prefix | Meaning | Defined in |
| --- | --- | --- |
| `DR-Mxx` | A per-mechanism decision record authored against the template (e.g. `DR-M08`). NEU-916 authors the **template**, not the records. | `decision-records/00_…` |
| `INC-I#` | An instructional incomplete-state marker for a missing downstream artifact (namespaced `-I` so it never collides with product-foundation `INC-1…5`). | `traceability/00_…` |
| `LINK-I#` | A deferred authoritative-artifact link slot (a decision record / mastery contract) — currently UNBOUND. | `traceability/00_…` |
| `IOC-#` | An instructional orphan/completeness check over the register. | `traceability/00_…` |
| `IDL-*` | An instructional decision-ledger entry (per mechanism / cluster / conflict / gap). | `adjudication/01_…` |

Finding ids (`F-Mxx-n`, `F-CL-n`, `F-DD-n`, `F-TR-n`), conflict ids (`C1…C6`), and gap ids (`G1…G8`) are **reused verbatim** from the NEU-915 synthesis; this package introduces no competing numbering for them.

## Cluster map (how the ten mechanisms fan out to decision sub-tasks)

| Cluster sub-task | Mechanisms | Ledger section |
| --- | --- | --- |
| NEU-918 — acquisition / sequencing | M01 sequencing, M02 worked examples | `adjudication/01_…` §C-ACQ |
| NEU-919 — practice / review | M03 retrieval, M04 spacing, M05 interleaving | `adjudication/01_…` §C-PRAC |
| NEU-920 — feedback / struggle / remediation | M06 feedback, M07 productive struggle, M09 remediation | `adjudication/01_…` §C-FBK |
| NEU-921 — assessment / progression | M08 assessment, M10 progression | `adjudication/01_…` §C-ASSESS |
| NEU-917 — durable-mastery-vs-contest-speed framework | cross-cutting (F-TR-*, `02_…` §4) | `adjudication/01_…` §C-FRAME |
| NEU-925 — assemble adjudicated package | all | drives the whole ledger |

**NEU-917 framework artifact:** the durable-mastery-vs-contest-speed decision logic (material-tension triggers, staged-vs-measured resolution logic, dual-goal evidence requirements, and the adversarial self-review) lives in `framework/00_durable-vs-speed-framework.md`. The cluster sub-tasks (NEU-918…921) apply it when a mechanism's two goals pull apart; it authors no `DR-Mxx` and settles no mechanism.

**NEU-921 authored records (§C-ASSESS cluster — assessment / progression):**

- `decision-records/DR-M08_assessment.md` — M08 assessment (learning-critical, C4). Enforceable control: constrained rubric-anchored grading payload + deterministic (non-LLM) quality mapper, adversarial fail-closed CI grading fixture, and rebuttal-invariance; enforcement at the server-side `submit_answer` grade-derivation path. Thresholds → `LINK-I2`. Ledger status `provisional` (not settled).
- `decision-records/DR-M10_progression.md` — M10 progression (learning-critical, C1). Enforceable control: server-side durability gate invariant (multi-observation, not `repetitions>0`), fail-closed single-success regression test, and an observable gate-decision; enforcement at the prerequisite-unlock path. Staged durable-vs-speed resolution (durability-first unlock, speed as a later phase) applying `framework/00_…`. Mastery bar → `LINK-I2`; cross-mechanism thresholds → NEU-922; live-rule reconciliation → NEU-923. Ledger status `provisional` (not settled).

**NEU-919 practice/review decision records (§C-PRAC):** the three binding mechanism decisions for the practice/review cluster live in `decision-records/` — `DR-M03_retrieval.md`, `DR-M04_spacing.md`, `DR-M05_interleaving.md`. M03 and M04 are **learning-critical (C2)** and each carries a **non-prose enforceable control** on the same-session-massed vs. spaced mastery signal; M05 resolves the interleaving axis to **category** (C5) with a staged durable-vs-speed resolution that **supersedes** the illustrative `framework/00_…` §6 walkthrough (per that framework's revision trigger (c)). All three are **provisional** — no status is `settled`, `INC-I1` (DP transfer) stays open, and the mastery-signal calibration is deferred to `LINK-I2`. Ledger rows updated in `adjudication/01_…` §C-PRAC (see §SELF-CHECK-919).

## Standing rule inherited from NEU-915 and NEU-887

Every finding registered here is **provisional by default**, carries **no class-7 (external-user) evidence** (none exists project-wide), and repeats the **DP-transfer uncertainty** (`INC-I1`, inherited NEU-887 R1 / conflict X1): mechanism effects are unmeasured on dynamic-programming problem-solving. No status in the ledger is `settled` at instructional altitude by this task.
