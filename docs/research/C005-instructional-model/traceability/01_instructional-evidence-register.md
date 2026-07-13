# Instructional Evidence Register (NEU-887 traceability register, extended)

**Task:** NEU-916 · **Compiled:** 2026-07-13 · **Schema:** `00_trace-extension-schema.md` · **Sole content input:** the NEU-915 synthesis in this package (`../`). **Extends** `../../C005-product-foundation/traceability/01_material-element-trace-register.md` (NEU-899) to instructional evidence — reusing its schema, not rebuilding it.

One row per NEU-915 finding, keyed by the finding's own id. Each row carries the four NEU-916 acceptance-bar fields (**class, provenance, cutoff, structural limitation**) plus the reverse-walk anchor, the carried gap/conflict, and the instructional incomplete marker. **No status is adjudicated here** (that is `../adjudication/01_…`); **no finding is re-classed, and no gap is filled with an invented value.** Class shorthand: `1 [literature]`, `2 [code-evidence]`, `6 [operational-log]` — the only classes NEU-915 produced (no class-3/4/5-fresh, and the hard rule: **no class-7**).

Provenance column points to the source-of-record file in `../`; the finding there carries the full URL / repo path / effect size, not duplicated here (to keep the finding the single source of truth). DP-transfer uncertainty (`INC-I1`, inherited NEU-887 R1 / X1) is the standing limitation on every mechanism finding; the row's limitation names its *additional* limitation.

Sections are delimited per cluster and per mechanism so downstream NEU-888 siblings append to their own block without colliding.

---

## §C-ACQ — Acquisition / sequencing cluster (NEU-918)

### M01 — Sequencing (`../mechanisms/M01_sequencing.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M01-1** | 1 | theoretical / CLT | 2026-07-13 | M01 findings | CLT prescribes managing element interactivity; fixes no specific DP order; optimal DP order unmeasured. | M01 | — | INC-I1 |
| **F-M01-2** | 1 | framework / quasi-exp (Bloom) | 2026-07-07 | M01 findings | 90% figure illustrative, not DP-specific or causally-optimized; shared with M10. | M01, M10 | — | INC-I1 |
| **F-M01-3** | 1 | review / absence-of-evidence | 2026-07-07 | M01 findings | Absence-of-evidence for difficulty-as-interleaving, **not** proof a difficulty ramp is harmful. | M01, M05 | C5 | — |
| **F-M01-4** | 1 | practitioner report | 2026-07-07 | M01 findings | Non-academic source; directional only. | M01, M05 | — | — |
| **F-M01-5** | 2 | code-fact | 2026-07-07 | M01 recon | Availability, not pedagogical validity; reconciliation verdict deferred. | M01 | — | INC-I3 |
| **F-M01-6** | 2 (contested) | contested code-fact | mixed | M01 recon | Must be re-verified against live code; carried as open conflict, not resolved. | M01, M10 | C1 | INC-I3 |

**LINK-I1 bound (M01)** → `../decision-records/DR-M01_sequencing.md` (NEU-918). The per-mechanism decision record now exists, so `INC-I2` is resolved for M01; `INC-I1` (DP transfer) remains open. No M01 finding is re-classed by this binding.

### M02 — Worked examples (`../mechanisms/M02_worked-examples.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M02-1** | 1 | causal (many controlled), synthesized | 2026-07-13 | M02 findings | Strongest for novices / well-structured domains; "transfer" here is within-topic, not DP. | M02 | — | INC-I1 |
| **F-M02-2** | 1 | meta-analytic (magnitudes partly UNVERIFIED) | 2026-07-13 | M02 findings | Pooled numbers not verbatim-confirmed; direction supported, precise magnitude not. | M02 | G4 | INC-I1 |
| **F-M02-3** | 1 | causal (expertise×treatment interaction) | 2026-07-13 | M02 findings | "Expertise" is domain-specific and unmeasured for DP sub-skills. | M02 | — | INC-I1 |
| **F-M02-4** | 1 | causal (fading experiments) | 2026-07-13 | M02 findings | Adaptive fading needs a per-learner expertise estimate; DP feasibility unaddressed. | M02 | — | INC-I1 |
| **F-M02-5** | 2 | code-fact | 2026-07-07 | M02 recon | Availability only; tiered-instruction-as-fading-proxy is a reconciliation verdict. | M02 | — | INC-I3 |

**LINK-I1 bound (M02)** → `../decision-records/DR-M02_worked-examples.md` (NEU-918). The per-mechanism decision record now exists, so `INC-I2` is resolved for M02; `INC-I1` (DP transfer) and `G4` (pooled magnitude UNVERIFIED) remain open. No M02 finding is re-classed by this binding.

---

## §C-PRAC — Practice / review cluster (NEU-919)

### M03 — Retrieval practice (`../mechanisms/M03_retrieval.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M03-1** | 1 | causal (review of controlled studies) | 2026-07-07 | M03 findings | "High utility" across studied domains; DP problem-solving transfer not established. | M03 | — | INC-I1 |
| **F-M03-2** | 1 | causal | 2026-07-07 | M03 findings | Verbal materials; benefit depends on subsequent correct-answer exposure (M06). | M03, M07 | — | INC-I1 |
| **F-M03-3** | 1 | causal (condition comparison) | 2026-07-07 | M03 findings | Percentages study-specific; feedback increment small here, larger elsewhere. | M03, M06 | — | INC-I1 |
| **F-M03-4** | 1 | mechanistic / theoretical | 2026-07-07 | M03 findings | Synthesis, not a single controlled study; the success condition is the design tension. | M03 | — | INC-I1 |
| **F-M03-5** | 2 | code-fact | 2026-07-07 | M03 recon | Availability; "no correct-answer exposure after 2nd failure" is evidence for feedback/reconciliation. | M03, M06 | C6 | INC-I3 |

### M04 — Spacing (`../mechanisms/M04_spacing.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M04-1** | 1 | causal (large meta-analysis, 317 experiments) | 2026-07-07 | M04 findings | Optimal inter-study interval not independently pulled or asserted; retention, not DP transfer. | M04 | — | INC-I1 |
| **F-M04-2** | 1 | causal (direct comparison) | 2026-07-07 | M04 findings | Verbal materials; about *when* correct recalls occur (spaced) — bears on massed follow-ups. | M04, M07, M09 | C2 | INC-I1 |
| **F-M04-3** | 1 | causal / definitional | 2026-07-07 | M04 findings | Criterion counts weakly constrained by evidence; typically 1 correct recall per spaced session. | M04, M07, M09 | G6 | — |
| **F-M04-4** | 1 / 2 | large observational benchmark | 2026-07-07 | M04 findings | Observational (not a controlled learning-outcome trial); calibration superiority, not retention gain. | M04 | — | INC-I1 |
| **F-M04-5** | 2 | code-fact | 2026-07-07 | M04 recon | Availability; SM-2-vs-FSRS materiality and missing-fuzz materiality are reconciliation verdicts. | M04 | — | INC-I3 |
| **F-M04-6** | 2 / 1 | code-fact vs. causal literature | 2026-07-07 | M04 recon | Alignment concern surfaced as evidence; reconciliation verdict deferred. | M04, M03, M09 | C2 | INC-I3 |

### M05 — Interleaving (`../mechanisms/M05_interleaving.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M05-1** | 1 | causal (single study, secondary-confirmed) | 2026-07-07 | M05 findings | One task/domain; large effect not necessarily representative (see F-M05-2). | M05 | — | INC-I1 |
| **F-M05-2** | 1 | meta-analytic (causal studies pooled) | 2026-07-07 | M05 findings | Effect varies by material; low-achiever blocking-first is UNVERIFIED, carried as a gap. | M05 | — | INC-I1 |
| **F-M05-3** | 1 | review / absence-of-evidence | 2026-07-07 | M05 findings | An easy-medium-hard ramp is **not** the evidenced construct (category mixing is). | M05, M01 | C5 | — |
| **F-M05-4** | 1 | causal (directional here) | 2026-07-07 | M05 findings | Primary PDF not re-fetched; metacognitive-illusion point well-replicated. | M05 | — | INC-I1 |
| **F-M05-5** | 2 | code-fact | 2026-07-07 | M05 recon | Availability/absence; dead config names the wrong axis; adding interleaving is a downstream decision. | M05 | C5 | INC-I3 |

**§C-PRAC binding note (NEU-919).** The practice/review decision records now consume these findings and bind `LINK-I1` (`REL:blocked-by-artifact` `INC-I2` → resolved) for their mechanisms — no finding is re-classed and no row is added: `DR-M03_retrieval.md` consumes F-M03-1…5 (+ F-M04-2, F-DD-2); `DR-M04_spacing.md` consumes F-M04-1…6 (+ F-DD-2); `DR-M05_interleaving.md` consumes F-M05-1…5 (+ F-M01-4, F-DD-2). `INC-I1` (DP transfer) and `INC-I3` (reconciliation verdict on the class-2 code-facts) remain open on the rows that carry them; class-2 findings are consumed for compatibility context only, never as pedagogical endorsement. `LINK-I2` (mastery-signal contract) stays UNBOUND. Row count is unchanged (IOC-1 holds).

---

## §C-FBK — Feedback / struggle / remediation cluster (NEU-920)

### M06 — Feedback (`../mechanisms/M06_feedback.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M06-1** | 1 | causal | 2026-07-07 | M06 findings | Verbal materials; "494%" relative to a low baseline — direction robust, magnitude study-specific. | M06 | — | INC-I1 |
| **F-M06-2** | 1 | causal | 2026-07-07 | M06 findings | Origin attribution not re-fetched; persistence findings confirmed. | M06 | — | INC-I1 |
| **F-M06-3** | 1 | causal (condition comparison) | 2026-07-07 | M06 findings | Right generalization is "some correct-answer exposure after the attempt," not a fixed increment. | M06, M03 | — | INC-I1 |
| **F-M06-4** | 1 | empirical (LLM evaluation) | 2026-07-07 | M06 findings | **Learning-critical:** makes AI-delivered diagnostic feedback need an enforceable control; the control is decided in `DR-M06` (constrained payload + adversarial grading fixture). | M06, M08 | C4, C6 | INC-I2 ✓ → `DR-M06` |
| **F-M06-5** | 2 | code-fact | 2026-07-07 | M06 recon | Availability/absence; records failure and moves on; self-grading implicates F-M06-4. | M06 | C6 | INC-I3 |

### M07 — Productive struggle (`../mechanisms/M07_productive-struggle.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M07-1** | 1 | causal | 2026-07-07 | M07 findings | Benefit requires subsequent correct-answer exposure (M06); struggle without resolution not endorsed. | M07, M06 | — | INC-I1 |
| **F-M07-2** | 1 | principle over causal base | 2026-07-07 | M07 findings | No domain-general boundary for "too difficult"; unmeasured for DP. | M07 | — | INC-I1 |
| **F-M07-3** | 1 | Metcalfe causal / Challenge Point analogical | 2026-07-07 | M07 findings | Motor-learning generalization to DP is an analogy. | M07 | — | INC-I1 |
| **F-M07-4** | 1 | causal (structure) + empirical caveat | 2026-07-07 | M07 findings | No study pins the optimal number of attempts; "2" is not evidence-derived. | M07 | G6 | INC-I1 |
| **F-M07-5** | 2 | code-fact | 2026-07-07 | M07 recon | Availability; whether the tier structure tracks the moving challenge point is a downstream verdict. | M07 | — | INC-I3 |

### M09 — Remediation (`../mechanisms/M09_remediation.md`)

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M09-1** | 1 | deployed-system practice | 2026-07-07 | M09 findings | Practice conventions, not controlled outcome studies; no academic ITS "leech" literature. | M09 | — | INC-I1 |
| **F-M09-2** | 1 | deployed-system spec | 2026-07-07 | M09 findings | No causal basis for any specific threshold; "8" is a product default, not an optimum. | M09 | G6 | — |
| **F-M09-3** | 1 | algorithm design + causal replication | 2026-07-07 | M09 findings | FSRS formula is a fitted model; savings magnitude varies by material. | M09 | — | INC-I1 |
| **F-M09-4** | 1 | causal | 2026-07-07 | M09 findings | Recovery-count parameters have "no evidence either way" for exact numbers. | M09, M04 | C2, G6 | INC-I1 |
| **F-M09-5** | 2 | code-fact | 2026-07-07 | M09 recon | Availability; full-reset-vs-savings conflict is evidence for reconciliation. | M09 | C3 | INC-I3 |

---

## §C-ASSESS — Assessment / progression cluster (NEU-921)

### M08 — Assessment (`../mechanisms/M08_assessment.md`) — **learning-critical**

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M08-1** | 1 | algorithm specification | 2026-07-07 | M08 findings | About scheduler input fidelity, not learning outcomes directly. | M08 | C4 | INC-I1 |
| **F-M08-2** | 1 | empirical | 2026-07-07 | M08 findings | Best-case, not superhuman; self-grading one's own interaction compounds self-enhancement bias. | M08 | G7 | INC-I1 |
| **F-M08-3** | 1 | empirical (closest analogue to this mechanism) | 2026-07-07 | M08 findings | Not DP-specific; the 71% is a per-model worst case. | M08 | C4 | INC-I1 |
| **F-M08-4** | 1 | empirical | 2026-07-07 | M08 findings | Analogous to a learner pushing back on a live score; not measured in this product. | M08 | — | INC-I1 |
| **F-M08-5** | 2 | code-fact | 2026-07-07 | M08 recon | **Learning-critical:** enforceable-control requirement is evidence here, decision downstream; prior audit's bias percentages UNVERIFIED. | M08 | C4, G7 | INC-I2 |

**M08 binding (NEU-921):** `INC-I2` discharged for M08 → `DR-M08` (`../decision-records/DR-M08_assessment.md`) authored; **`LINK-I1` bound** to `DR-M08`. `LINK-I2` (agreement + over-validation thresholds) still UNBOUND (mastery-model). No M08 finding is re-classed; classes, provenance, cutoffs, and limitations above are unchanged (IOC-2/3/4 hold).

### M10 — Progression (`../mechanisms/M10_progression.md`) — **learning-critical**

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-M10-1** | 1 | framework / quasi-exp | 2026-07-07 | M10 findings | 90% illustrative and domain-general; not causally optimized, not DP-specific. | M10, M01 | — | INC-I1 |
| **F-M10-2** | 1 | modeling convention (secondary-confirmed) | 2026-07-07 | M10 findings | 0.95 is a convention, not a proven optimum; needs a fitted knowledge-tracing model this product lacks. | M10 | — | INC-I1 |
| **F-M10-3** | 1 | review / meta-analytic | 2026-07-07 | M10 findings | General ITS effectiveness, not progression-rule-specific; not DP-specific. | M10 | — | INC-I1 |
| **F-M10-4** | 1 | methodological | 2026-07-07 | M10 findings | Discipline constraint, not an empirical effect; bounds how confidently any threshold may be stated. | M10 | — | INC-I1 |
| **F-M10-5** | 2 (contested) | contested code-fact | mixed | M10 recon | Highest-severity open reconciliation conflict; the live rule must be re-verified. | M10, M01 | C1 | INC-I3 |

**M10 binding (NEU-921):** `INC-I2` discharged for M10 → `DR-M10` (`../decision-records/DR-M10_progression.md`) authored; **`LINK-I1` bound** to `DR-M10`. `LINK-I2` (durability bar / uncertainty band) still UNBOUND (mastery-model). C1/`INC-I3` (live-rule re-verify) remain open — reconciliation NEU-923. No M10 finding is re-classed (IOC-2/3/4 hold).

---

## §C-FRAME — Cross-cutting framing (cognitive load · desirable difficulty · transfer) → durable-mastery-vs-contest-speed (NEU-917)

Findings from `../02_cognitive-load-desirable-difficulty-transfer.md`. These inform **every** mechanism (the framing rule each mechanism file applies) and feed the durable-mastery-vs-contest-speed framework.

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation (additional) | Informs | Gap/Conflict | INC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F-CL-1** | 1 | theoretical / foundational synthesis | 2026-07-13 | `02_…` §1 | Exact capacity number contested (Cowan ~4 UNVERIFIED); principle established, precise limit not load-bearing. | all mechanisms | G8 | — |
| **F-CL-2** | 1 | theoretical framework | 2026-07-13 | `02_…` §1 | Germane/intrinsic distinction is theory-internal and debated; no per-learner load measurement exists. | all mechanisms | — | — |
| **F-DD-1** | 1 | causal (underlying manipulations) framed as principle | 2026-07-07 | `02_…` §2 | "Desirable" is relative to learner state; no domain-general threshold, none measured for DP. | M03, M04, M05, M07 | — | INC-I1 |
| **F-DD-2** | 1 | mechanistic / theoretical | 2026-07-07 | `02_…` §2 | The "if it succeeds" condition is the whole design problem; blog synthesis, not a single controlled study. | M03, M07 | — | INC-I1 |
| **F-DD-3** | 1 | Metcalfe causal / Challenge Point motor-learning | 2026-07-07 | `02_…` §2 | Challenge Point is from motor learning; application to conceptual DP is an analogy. | M07, M10 | — | INC-I1 |
| **F-TR-1** | 1 | review / taxonomy | 2026-07-13 | `02_…` §3 | A 2002 taxonomy; structures the problem rather than resolving transfer rates for any domain. | all (C-FRAME) | G1 | INC-I1 |
| **F-TR-2** | 1 | empirical (magnitude UNVERIFIED) | 2026-07-13 | `02_…` §3 | Not measured on dynamic programming; full text not fetched. | all (C-FRAME) | G1 | INC-I1 |
| **F-TR-3** | 1 / inherited-risk | inherited risk | 2026-07-13 | `02_…` §3 | **The single largest standing gap** — every mechanism repeats it; no mechanism may present DP-domain effectiveness as established. | all mechanisms | G1 | INC-I1 |

---

## §LINK-I2 binding (NEU-922) — mastery-signal contract, provisional

The integrative operational mastery model (`../mastery-model/00_operational-mastery-model.md`) **binds `LINK-I2`** — the mastery-signal contract deferred by every `DR-Mxx`. Each DR-deferred value now has a **provisional value + explicit uncertainty band + evidence class + revision signal** (`MM-T1…MM-T15`), consolidated across M01–M10. This binding **re-classes no finding, adds no register row, and asserts no gap value**: MM-T# values are transported from the already-registered class-1 findings (e.g. F-M04-2/3, F-M08-2/3/4, F-M10-1/2, F-M02-3/4, F-M05-1/2, F-M06-4, F-M09-2/3) and class-2 defaults (F-M08-5, F-M02-5, F-M09-5) cited **for compatibility context only, never as pedagogical endorsement** (inherited firewall). `INC-I1` (DP transfer) stays open on every row; G5/G6/G7 stay carried (widened bands, no invented value); `LINK-I2` moves UNBOUND → bound-`provisional`. No `MM-T#` claims external validity (class-7 absent; population validity UNEARNED). Row count unchanged (IOC-1 holds); no class re-assigned (IOC-2 holds). C1/C4 target bars (MM-T8, MM-T4/T5) are provisional only — the reconciliation verdict stays `INC-I3` / NEU-923.

---

## 7. Register-completeness self-attestation (IOC checks)

| Check | Result | Basis |
| --- | --- | --- |
| **IOC-1** finding-completeness | **PASS** | 60 rows = full NEU-915 inventory (52 mechanism + 8 cross-cutting). Per-mechanism counts match the mechanism files (M01: 6, M02–M03: 5, M04: 6, M05–M10: 5) and `../03_synthesis.md`. |
| **IOC-2** class fidelity | **PASS** | Every row's class is the finding's own NEU-887 class; only classes 1, 2 (and a contested code-fact) appear; **no class-7**, no class-1–6 presented as external validation. |
| **IOC-3** provenance + cutoff | **PASS** | Every row carries a source pointer and an unmodified cutoff (fresh 2026-07-13 / reused 2026-07-07 / mixed for contested). |
| **IOC-4** limitation present | **PASS** | Every row carries a structural limitation; every mechanism finding carries or inherits DP-transfer uncertainty via `INC-I1`. |
| **IOC-5** reverse-walk | **PASS** | Every finding names the mechanism(s)/axis it informs; M01–M10 and every cross-cutting axis are each reachable from ≥1 finding. |
| **IOC-6** no invented value | **PASS** | Gap-entangled findings (G1, G4, G6, G7, G8) carry the `G*` id and, where artifact-bound, an `INC-I#`; **no row asserts a value for any open gap.** |
| **IOC-7** no re-derivation | **PASS** | No row re-defines a taxonomy class, materiality clause, or completeness-lattice value; each references the product-foundation schema (`00_…`). |

The independent register-completeness audit named in NEU-916's verification evidence is a downstream step; this attestation is the by-construction self-check.
