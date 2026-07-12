# C005 Product-Foundation — Ubiquitous Language (Vocabulary)

**Task:** NEU-907 (final consolidation · OUT-2/OUT-4/OUT-6) · **Compiled:** 2026-07-12
**Purpose:** the single **primary agent-context artifact** for the whole package. Every term of the project language — domain terms, machinery terms, and every identifier family — resolves here to *definition + owning package + defining file + cross-references* in **one hop**. A downstream agent that hits any identifier anywhere in the corpus should be able to land here, read one row, and reach the material that defines and uses it without a second search.

**How to read a row.** Each entry gives: the id/term, a one-line definition, the **owning package**, the **defining file** (path relative to this folder, `docs/research/C005-product-foundation/`), and **cross-refs** to related identifiers, contracts, evidence records, and adjudication entries.

**Reading discipline this file inherits (and re-states, does not re-decide).** Nothing here is a validated, proven, market, expert, or external-user claim; class-7 evidence does not yet exist. Statuses shown are *as adjudicated by NEU-906* (`adjudication/03_decision-status-register.md`); frozen rule versions are separated from mutable statuses throughout. Where a term's status could move, the mutable-status authority is the LINK-4 ledger (`adjudication/`), never this file.

**One-hop map of owning packages** (each is a directory with its own `README.md`):

| Package | Owner task | Directory | What it owns |
| --- | --- | --- | --- |
| Research synthesis | NEU-897 | *(root)* `00_…`–`04_…`, `questions/` | Evidence classes, RQ1–6, F/X/S/G/C |
| Product model | NEU-898 | `product-model/` | Learner model, J/M/FM/P/D/EX/R/DEC/RA, CAND, BM/BX |
| Traceability | NEU-899 | `traceability/` | TR/REL/INC/LINK/OC, completeness lattice |
| Measurement contracts | NEU-901 | `measurement-contracts/` | MC/RDM/PRX/PLA/FEAS, gate schema |
| Automated evaluation | NEU-902 | `automated-evaluation/` | ACL/AEP/ACS/CCR, ENV/RET |
| Autoeval batch | NEU-903 | `autoeval-batch/` | Executed 12-case run, RUN-1/2/3, FIX-* |
| Benchmark suite | NEU-900 | `benchmark-suite/` | JNY, H-*, BATCH-*, OBS/AIR protocols |
| Baseline batch | NEU-904 | `baseline-batch/` | JNY-B1/B2 executed evidence, OPLOG-* |
| Failure batch | NEU-905 | `failure-batch/` | JNY-F1/F2 executed, JNY-F3 bound |
| Adjudication | NEU-906 | `adjudication/` | LINK-4 ledger, decision statuses |
| Consolidation | NEU-907 | *(root)* `00_vocabulary.md`, `README.md`, `00_gates-report.md`, `00_hypothesis-reformulations.md`, `00_dry-run-handoff.md` | This package assembly |

---

## 1. Evidence classes (class-1 … class-7)

The seven-class taxonomy every claim in the corpus is labeled against. **Owner:** NEU-897. **Defining file:** `01_evidence-taxonomy.md`.

| Class | Label | One-line meaning | Cross-refs |
| --- | --- | --- | --- |
| class-1 | `[literature]` | Published research / meta-analyses / standards / vendor docs external to the project. | F1–F6 findings, S1–S3 sources |
| class-2 | `[code-evidence]` | Facts about what the Second Memory codebase declares, computes, or exposes. | F4.*, FEAS-*, BM-8 |
| class-3 | `[dogfooding]` | Creator running a benchmark journey as a first-class learner (n=1). Includes **RETRO** (retrospective) variants. | OBS-*, JNY-*, `baseline-batch/`, `failure-batch/` |
| class-4 | `[ai-critique]` | An AI reviewer's judgment of an artifact; never validation. | AIR-*, `*-ai-reviews.md` |
| class-5 | `[automated-eval]` | Deterministic / versioned automated eval against an oracle. | ACS-1, AEP-1, `autoeval-batch/` |
| class-6 | `[operational-log]` | Evidence from production request/operation logs, aggregate-only, privacy-gated. | OPLOG-*, PLA-1…3 |
| class-7 | `[future-real-user]` | Evidence from real external users. **Does not yet exist.** The only class that supports market/external generalization. | INC-5, EX3/BX-3, CLASS-7-DEFERRED |

Related discipline term — **RETRO (retrospective evidence):** class-3 records derived from production-DB aggregates of the creator's own historical behavior, held to the payload-free class-6 standard; a fidelity **downgrade** (n=1, retrospective, not pre-registered, pooled-across-chunks). **Defining file:** `adjudication/02_operational-log-admissibility.md`.

---

## 2. Research questions & synthesis id families (NEU-897)

**Owner:** NEU-897. **Defining files:** `02_research-questions.md`, `questions/RQ1.md`…`RQ6.md`, `03_synthesis.md`.

### RQ1 … RQ6 — the six material research questions

| ID | Question (short) | Outcome | Defining file |
| --- | --- | --- | --- |
| RQ1 | Durable mastery (retention+transfer) via retrieval practice + spacing in adult competent learners. | Answered; mechanism strong, DP extension is math-analogy (gaps G1.1, G1.2). | `questions/RQ1.md` |
| RQ2 | Pedagogy for algorithmic problem-solving (worked examples, subgoals, schemas). | Answered; supported in computing/algorithm domains, novice-population caveat (G2.1–G2.3). | `questions/RQ2.md` |
| RQ3 | Existing competitive-programming (CP) practice tools: approaches and gaps. | Answered; volume/contest culture, no built-in retention model; empty niche ≠ demand. | `questions/RQ3.md` |
| RQ4 | Learner-state signals actually collectible from the existing codebase. | Answered; per-attempt data persisted, some exposed metrics uncomputed, logs payload-bearing. | `questions/RQ4.md` |
| RQ5 | Reliability of LLM grading/critique of learner answers. | Answered; documented biases; bounds classes 4–5; DP reliability unmeasured (G5.1). | `questions/RQ5.md` |
| RQ6 | Learner jobs/motivations/failure modes supportable now vs. reserved for class-7. | Answered conservatively; most population claims reserved. | `questions/RQ6.md` |

### F* — Findings (labeled evidence statements)

**Family:** `F<rq>.<n>` — one set per RQ, each a class-labeled evidence statement. **Defining file:** each `questions/RQ*.md` ("Included sources & findings"); indexed in `product-model/04_traceability-and-gap-propagation.md` §1.1. Examples: F1.1–F1.4 (retrieval/spacing retention & transfer), F2.1–F2.4 (subgoal/worked-example schema formation), F3.1–F3.4 (CP landscape), F4.1–F4.5 (codebase signals; F4.3 `averageQuality` uncomputed, F4.4 unredacted log text), F5.1–F5.4 (LLM-judge biases), F6.1–F6.3 (documented jobs; no demand evidence).

### X* — Conflicts (preserved, not adjudicated at synthesis)

**Family:** `X1…X4`. **Defining file:** `03_synthesis.md` §2. X1 retention vs transfer effect sizes; X2 worked-example evidence is on novices vs competent target learners (expertise-reversal); X3 CP grind culture vs learning-science practice; X4 LLM-judge mitigation vs tutor-context over-validation. **Cross-refs:** X1→BM-1/2/4, X2→BM-7, X3→BM-6, X4→BM-5.

### S* / C* — Sources & candidates (per question)

**Family:** `S1…S3` = included sources per question (≤3); `C1…C5` = reviewed candidates per question (≤5). Scoped **per RQ**, not global. **Defining file:** each `questions/RQ*.md` candidate/inclusion ledger. (Note: there is no global "S*" finding family — findings are `F*`; `S*` are per-question sources.)

### G* — Unresolved gaps

**Family:** `G<rq>.<n>`. **Defining file:** `03_synthesis.md` §3; propagated in `product-model/04_…` §2.

| Gap | Meaning | Cross-refs |
| --- | --- | --- |
| G1.1 | Retrieval/spacing effect sizes unmeasured in CP/algorithm tasks (DP rests on math analogy). | R1, P1, BM-1/2/4, INC-1 |
| G1.2 | Optimal spacing for hierarchical multi-month skill dependencies (cap-bound). | FM3, BM-3, R7, INC-2 |
| G2.1 | Expertise-reversal boundary for already-competent programmers (cap-bound). | BM-7, R2 |
| G2.2 | Worked-example evidence for DP specifically. | J2, D2 |
| G2.3 | Interaction of retrieval scheduling × worked-example study. | P2, D2, BM-1 |
| G3.1 | No outcome data for any CP practice method. | RQ3 |
| G3.2 | Demand for SR-for-CP tooling unmeasured. | R4, INC-5 |
| G4.1 | `time_spent_ms` reliability in real usage (needs privacy-gated log query). | MC-8, PLA-3 |
| G4.2 | No per-DP-pattern mastery signal in the schema. | BM-8, MC-6, INC-2 |
| G5.1 | LLM grading reliability on algorithmic solutions unmeasured. | R3, FM4, BM-5, MC-4, INC-3 |
| G5.2 | Trustworthy-AI-grading measurement design. | R3, INC-3 |
| G6.1 | No direct jobs/motivations study of mastery-seeking CP learners (cap-bound). | M1–M4, R4, INC-5 |
| G6.2 | Persona/benchmark-journey construction (downstream). | NEU-898/900 |

### Caps — the hard research limits

**Definition:** ≤6 material questions, ≤5 candidates reviewed per question, ≤3 included per question. Exceedance is recorded as incomplete scope, never silently expanded. **Owner:** NEU-897. **Defining files:** `00_method-and-provenance.md` §1, `04_caps-and-incomplete-scope.md`.

---

## 3. Product-model domain terms (NEU-898)

**Owner:** NEU-898. **Directory:** `product-model/`.

### Target learner & fixed prerequisite boundary

**Definition:** in-audience = a programmer with language competence + basic-algorithm competence seeking durable mastery + CP breadth (DP as the first domain). The boundary is a **charter-fixed decision (DEC1)**, not an evidence finding. **Defining file:** `product-model/00_learner-and-prerequisite-model.md` §1–2. **Cross-refs:** DEC1, EX1/EX2 (walls), BX-1/BX-2.

### J* — Learner jobs
**Defining file:** `product-model/00_…` §3. J1 raise measured CP performance (rating); J2 master recognized problem patterns/schemas (DP first); J3 prepare for technical interviews; J4 retain & transfer over months — **durable mastery (the thesis job)**. **Cross-refs:** TR-J1…J4; J4→MC-1/MC-9, INC-1; adjudicated provisional (`adjudication/03_…` §2.1).

### M* — Learner motivations (all provisional)
**Defining file:** `product-model/00_…` §4. M1 achievement/measurable progress; M2 career/interview outcomes; M3 mastery/intrinsic understanding; M4 efficiency (study that sticks). **Cross-refs:** TR-M1…M4; MC-5/MC-10; **unresolved** (class-7, INC-5); G6.1.

### FM* — Product-critical failure modes (FM1–FM5)
**Defining file:** `product-model/00_…` §5.

| ID | Failure mode | Cross-refs |
| --- | --- | --- |
| FM1 | Forgetting after grind — solved problems decay without spaced re-exposure. | MC-1/MC-3, BM-2/BM-4, provisional (INC-1) |
| FM2 | Shallow / misgeneralized schema — surface memorization, no transferable pattern. | MC-2, BM-1, R2, unresolved (INC-1) |
| FM3 | Mis-scheduled review — spacing wrong for hierarchical multi-month DP dependencies. | MC-3, BM-3, R7, G1.2 |
| FM4 | False confidence from AI grading — AI over-validates a wrong/shallow answer. | MC-4, BM-5, R3, RA5; **unresolved (present-bounded on INCOMPLETE archetype)**, INC-3; see `00_hypothesis-reformulations.md` |
| FM5 | Motivation collapse / adherence drop before mastery forms. | MC-5, BM-6, R5; provisional (shape), prevalence class-7 (INC-5) |

### P* — Product principles (P1–P6)
**Defining file:** `product-model/01_principles-differentiators-exclusions.md` §1. P1 optimize durable retention+transfer, not solve-count; P2 retention & transfer are two distinct both-required mechanisms; P3 every mastery signal is evidence-labeled and provisional; P4 measure only what the system can compute, verify per signal; P5 never expose raw learner payloads, logs aggregate-only; P6 keep unresolved gaps visible. **Cross-refs:** TR-P1…P6; P3/P5/P6 **accepted** (MC-11), P1/P2/P4 **provisional** (`adjudication/03_…` §2.3).

### D* — Differentiators (D1–D4, all provisional, none a market claim)
**Defining file:** `product-model/01_…` §2. D1 built-in retention model for algorithmic practice; D2 transfer-oriented schema building; D3 evidence-labeled gap-honest mastery signals; D4 reuse of existing SR + memory-graph substrate. **Cross-refs:** TR-D1…D4; MC-2/MC-4/MC-10/MC-11; D1 demand **unresolved** (INC-5), D4 **provisional** (capability-only, R8).

### EX* — Explicit exclusions (EX1–EX6)
**Defining file:** `product-model/01_…` §3. EX1 absolute beginners; EX2 general all-algorithms product; EX3 market/demand/WTP claims as validated fact; EX4 selecting pedagogy/curriculum/UI/architecture/provider/telemetry/production behavior; EX5 new research or exceeding NEU-897 caps; EX6 raw operational-log payloads / un-gated log evidence. **Cross-refs:** TR-EX1…EX6; BX-1…BX-5 (the walls); all **accepted** (MC-11).

### R* — Risks (R1–R8; R1–R5 High and non-downgradable)
**Defining file:** `product-model/01_…` §4. Non-downgrade rule (**G-a**): High/Critical risk can never be reclassified non-material or SETTLED-as-closed.

| ID | Sev | Risk | Status (adjudicated) | INC |
| --- | --- | --- | --- | --- |
| R1 | High | Core mechanism (retrieval+spacing) may not transfer to DP. | unresolved, non-downgradable | INC-1 |
| R2 | High | Retention without transfer. | provisional, non-downgradable | INC-1 |
| R3 | High | AI-graded mastery unreliable → false confidence. | unresolved (reinforced by MC-4 finding), non-downgradable | INC-3 |
| R4 | High | No demand for the differentiators. | unresolved, non-downgradable | INC-5 |
| R5 | High | Adherence collapse before mastery. | provisional (shape) / prevalence unresolved, non-downgradable | INC-5 |
| R6 | Med | Signal-feasibility gap — desired metrics not computable. | unresolved | INC-2 |
| R7 | Med | Mis-scheduling for hierarchical skills. | unresolved | INC-2/G1.2 |
| R8 | Med | Over-reliance on the codebase as if a validated product. | provisional | — |

**Cross-refs:** TR-R1…R8; severity floor enforced by OC-7 (`adjudication/03_…` §3, `traceability/04_…`).

### DEC* — Product-altitude decisions (DEC1–DEC5)
**Defining file:** `product-model/01_…` §5. DEC1 fix prerequisite boundary/audience; DEC2 evidence-labeling + provisional-by-default; DEC3 propagate every gap as provisional/incomplete; DEC4 treat D1–D4 as provisional with recorded class-7 needs; DEC5 adopt one feature-wide materiality rule. **Cross-refs:** TR-DEC1…DEC5; all **accepted** (MC-11, `adjudication/03_…` §2.4).

### RA* — Material rejected alternatives (RA1–RA6)
**Defining file:** `product-model/01_…` §6. RA1 "flashcards for DP" (retention ≠ transfer); RA2 volume/grind optimization as primary model; RA3 broaden to general all-algorithms; RA4 lower prerequisite to include beginners; RA5 trust AI grading as the mastery signal of record; RA6 claim "AI tutor + memory graph" as validated market opportunity. **Cross-refs:** TR-RA1…RA6; all **accepted** (rejected-and-recorded); **RA5 reaffirmed** by the MC-4 over-validation finding (`adjudication/03_…` §1, `00_hypothesis-reformulations.md`).

### CAND-1 … CAND-32 — candidate inventory & the materiality rule
**Definition:** the feature-wide inventory of every candidate element; the **materiality rule (DEC5)** decides in/out. **Defining file:** `product-model/02_materiality-rule-and-candidate-inventory.md`. Groups: CAND-1–7 learner/mechanism, CAND-8–13 landscape/positioning, CAND-14–21 measurement/signal, CAND-22–28 jobs/motivations/failure-mode, CAND-29–32 cross-cutting discipline. Guardrails **G-a** (severity floor), **G-b** (gap propagation → provisional/incomplete), **G-c** (no validation laundering). **Cross-refs:** each CAND inherits its governing element's status (`adjudication/03_…` §2.7, `traceability/01_…` §5); CAND-16/29/30/32 **accepted**; CAND-11/12/13/21 non-material/routed.

**Materiality rule (the criterion).** A candidate is *material* if changing/adding/omitting it could plausibly change: (1) target-learner / J / M / FM; (2) P / D / EX; (3) DEC / RA; (4) a BM-* cell; (5) an evidence class/limitation, conflict X*, or gap G*; (6) a High/Critical risk, binding requirement, or success metric/threshold. Otherwise non-material with a one-line rationale. **Defining file:** `product-model/02_…` §1.

### BM-1 … BM-8 — benchmark-state matrix cells (material)
**Definition:** the 8 material cells surviving materiality-pruning of a 6-axis (A–F) benchmark-state grid; coordinates `A·B·C·D·E·F`. **Defining file:** `product-model/03_benchmark-state-matrix.md` §3.

| Cell | Subject | State (model) | Journey | Contract | Adjudicated |
| --- | --- | --- | --- | --- | --- |
| BM-1 | First DP pattern: surface memorization vs schema. | Provisional (G1.1/G2.3) | JNY-F1 | MC-2 | unresolved (INC-1) |
| BM-2 | Spaced retrieval holds a pattern over weeks. | Provisional (G1.1) | JNY-B1 | MC-1 | provisional (INC-1) |
| BM-3 | Consolidating interdependent patterns; hierarchical scheduling. | Incomplete (G1.2) | JNY-F2 | MC-3 | unresolved (INC-2/G1.2) |
| BM-4 | Post-gap decay / relapse / re-learning. | Provisional (G1.1) | JNY-F2 | MC-3 | unresolved (INC-1) |
| BM-5 | AI grading over-validates a wrong/shallow answer → false confidence. | Provisional (G5.1) | JNY-F3 | MC-4 | unresolved (present-bounded on INCOMPLETE archetype), INC-3 |
| BM-6 | Rating-driven learner grinds volume, abandons review. | Gap (G6.1), non-downgradable | JNY-B2 | MC-5 | provisional (shape) / prevalence unresolved (INC-5) |
| BM-7 | Competent learner studies worked examples; possible expertise reversal. | Provisional/incomplete (G2.1) | JNY-F1 | MC-2 | unresolved (INC-2/G2.1) |
| BM-8 | Product wants per-pattern mastery signal; schema computes none. | Provisional (G4.2) | JNY-B1 | MC-6 | unresolved (INC-2) |

### BX-1 … BX-5 — exclusion-boundary states (walls, not coverage targets)
**Defining file:** `product-model/03_…` §4. BX-1 absolute-beginner (EX1); BX-2 all-algorithms coverage (EX2); BX-3 market/demand/WTP/external-validation assertion (EX3); BX-4 pedagogy/curriculum/UI/architecture/provider/telemetry design fix (EX4); BX-5 raw learner-log payload (EX6/P5). **Cross-refs:** TR-BX-1…BX-5; all **accepted**; EX3/BX-3 actively enforced (`adjudication/05_…`).

---

## 4. Traceability machinery (NEU-899)

**Owner:** NEU-899. **Directory:** `traceability/`.

### TR-* — Trace records
**Definition:** exactly one record per material NEU-898 element, keyed by the element's own id (`TR-<elementId>`), carrying a forward trace (→ evidence source + class + limitation) and a reverse anchor (→ behavior/metric/decision-rule/rejected-alternative it governs). **Defining files:** schema `traceability/00_trace-schema-and-conventions.md` §2; register `traceability/01_material-element-trace-register.md` (60 material records per OC-1). **Id families covered:** TR-J*/M*/FM*/P*/D*/DEC*/R*/RA*/EX*/BM-*/BX-* and CAND cross-map. **Schema fields:** trace id · element(+family) · forward trace · reverse anchor · REL edges · materiality clause · inclusion status · completeness state · blocking artifact (INC-*).

### REL:* — Trace-relation edges
**Definition:** typed, closed, directional edges between elements, each with an implied inverse so the reverse index generates mechanically. **Defining file:** `traceability/00_…` §3. Verbs: `evidenced-by`/`evidences`, `mitigates`/`mitigated-by`, `realizes-job`/`served-by`, `covers`/`covered-by`, `excludes`/`excluded-by`, `rejects`/`rejected-for`, `provisional-on`/`keeps-provisional`, `incomplete-on`/`keeps-incomplete`, `blocked-by-artifact`/`unblocks`, `routed-to`/`owns`.

### Completeness lattice — SETTLED / PROVISIONAL / INCOMPLETE / UNRESOLVED
**Definition:** the closed 4-value status set attached to every trace record. **Defining file:** `traceability/00_…` §4; register `traceability/03_completeness-states-and-incomplete-markers.md` §1.
- **SETTLED** — a decision this tier is entitled to make; not gated on any open gap or downstream artifact ("settled at this altitude," not evidence-closed).
- **PROVISIONAL** — supported by class-1–6 evidence *insufficient to settle*; needs class-7 or in-domain measurement.
- **INCOMPLETE** — materially needed but unanswerable within NEU-897 caps (barred by EX5).
- **UNRESOLVED** — depends on an authoritative downstream artifact that does not yet exist; recorded as an `INC-*`, never filled with a locally invented value.
Key distinction: PROVISIONAL/INCOMPLETE = *evidence* limitation; UNRESOLVED = *contract/artifact* dependency owned elsewhere. Derivation order (first match wins): SETTLED → UNRESOLVED(+INC) → INCOMPLETE → PROVISIONAL.

### INC-1 … INC-5 — incomplete-state markers (missing downstream artifacts)
**Definition:** an explicit hole (never a value) naming a missing authoritative downstream artifact, its owner, and the LINK slot that will carry it. **Defining file:** `traceability/03_…` §2. *(Status column = current, per the additive binding notes dated 2026-07-12; where the file's prose intro and its table disagree, the **table rows are current truth**.)*

| Marker | Missing artifact | Owner | Fills | Status |
| --- | --- | --- | --- | --- |
| INC-1 | DP-domain transfer/retention benchmark evidence. | NEU-900 | LINK-1 | **UNRESOLVED** (holds R1, P1 effect size, BM-1/2/4) |
| INC-2 | Validated measurement contract (computable signals, thresholds, decision-rules). | NEU-901 (SUB-4) | LINK-2 | **BOUND** → `measurement-contracts/` (values still uncollectible) |
| INC-3 | DP-domain AI-grading reliability bound. | NEU-902 (OUT-7) | LINK-3 | **UNRESOLVED** (holds R3, FM4/BM-5 reliability, RA5 reopen) |
| INC-4 | Revision rules & production replacement signals. | SUB-4 | LINK-2 | **BOUND** → `measurement-contracts/` (PRX-1…8) |
| INC-5 | Class-7 evidence (real-user / market / adherence prevalence). | none yet (EX3) | LINK-5 | **UNRESOLVED** (holds R4, R5 prevalence, D1 demand, M1–M4 weighting) |

### LINK-1 … LINK-5 — deferred authoritative-artifact link slots
**Definition:** empty binding points reserving an address so a later sub-task attaches its artifact without renumbering. **Defining file:** `traceability/03_…` §3.

| Slot | Binds | Owner | Status | Bound to |
| --- | --- | --- | --- | --- |
| LINK-1 | Bounded benchmark suite + journeys + results. | NEU-900 | **PARTIALLY BOUND** | `benchmark-suite/` + `baseline-batch/` + `failure-batch/` (INC-1 stays UNRESOLVED) |
| LINK-2 | Validated measurement contract + thresholds + revision rules. | SUB-4 (NEU-901) | **BOUND** | `measurement-contracts/` (MC-1…11 v1.0, GATE-STATE=PASS, PRX-*, PLA-*) |
| LINK-3 | Automated-eval reliability protocol + DP results. | NEU-902/903 | **PARTIALLY BOUND** | `automated-evaluation/` + `autoeval-batch/` + JNY-F3 binding (INC-3 stays UNRESOLVED) |
| LINK-4 | Evidence/decision **STATUS adjudication ledger** — the *only* place any element's status may flip. | NEU-906 | **BOUND** | `adjudication/` |
| LINK-5 | Consolidated prompt-ready product-decision package. | NEU-907 | **BOUND (this task)** | *(root)* `README.md` + this file + `00_gates-report.md` + `00_hypothesis-reformulations.md` + `00_dry-run-handoff.md` |

### OC-1 … OC-7 — orphan checks
**Definition:** audit rules; any item failing one is reported and cannot silently count toward approval. **Defining file:** definitions `traceability/00_…` §6; run/results `traceability/04_orphan-and-inventory-reconciliation-audit.md` §1. **All seven PASS.** OC-1 forward-orphan (element→evidence); OC-2 reverse-orphan (evidence→element); OC-3 candidate-orphan (every CAND included or routed); OC-4 decision-orphan (DEC/RA link to basis + governed target); OC-5 metric/signal-orphan & invented-authority (no UNRESOLVED metric carries a locally invented value); OC-6 exclusion-orphan (EX/BX carry rationale + guarded boundary); OC-7 risk severity-floor (every High R1–R5 present, material, non-downgradable).

### Bidirectional walk — trace conventions
**Definition:** every record carries a forward trace and a reverse anchor ("bidirectional or it is an orphan"), materialized as walkable indices. **Defining file:** `traceability/02_bidirectional-walk-index.md` (§1 forward index, §2 reverse index, §3 reverse-anchor index). **Excluded-candidate register:** `traceability/05_excluded-candidate-register.md`.

---

## 5. Measurement contracts machinery (NEU-901)

**Owner:** NEU-901. **Directory:** `measurement-contracts/`. All contracts **frozen v1.0 (2026-07-11)**; post-run change ⇒ new version + rerun, never in-place edit.

### MC-1 … MC-11 — measurement-contract register
**Definition:** one frozen contract per measured requirement/decision; binds an intended learner behavior → metric → collection method → threshold/decision rule → nondeterminism tolerance → evidence-status label → replacement signal (PRX-*) → blocking marker (INC-*). **Defining files:** schema `measurement-contracts/00_contract-schema-and-versioning.md` §2; register `measurement-contracts/01_measurement-contract-register.md`.

| MC | Governs | Evidence-status label | Cross-refs |
| --- | --- | --- | --- |
| MC-1 v1.0 | Spaced retention of a learned DP pattern. | PROXY-DIRECTIONAL | P1/FM1/BM-2/J4; PRX-1; INC-1 |
| MC-2 v1.0 | Schema transfer vs surface memorization; expertise-reversal. | PROXY-DIRECTIONAL | P2/FM2/D2/BM-1/BM-7/R2; PRX-2; INC-1 |
| MC-3 v1.0 | Long-horizon decay/relapse & hierarchical scheduling. | PROXY-DIRECTIONAL / COLLECTION-GAP | FM1/FM3/BM-3/BM-4/R7; PRX-3; INC-2 |
| MC-4 v1.0 | AI-grading over-validation / false confidence (BOUNDING). | PROXY-BOUNDING | FM4/R3/BM-5/RA5/D3/P3; PRX-4; INC-3; AEP-1/ACS-1 |
| MC-5 v1.0 | Motivation & adherence under grind culture. | CLASS-7-DEFERRED / PROXY-DIRECTIONAL | FM5/R5/BM-6/M1–M4/RA2; PRX-5; INC-5 |
| MC-6 v1.0 | Per-DP-pattern mastery signal (core of INC-2). | COLLECTION-GAP | BM-8/R6/CAND-17; PRX-6; INC-2 |
| MC-7 v1.0 | `averageQuality` session-summary signal. | COLLECTION-GAP | CAND-15/P4/R6; PRX-7; INC-2 (hardcoded `0`, FEAS-5) |
| MC-8 v1.0 | `time_spent_ms` reliability. | COLLECTION-GAP | CAND-18/R6; PRX-7; INC-2 (PLA-3, G4.1) |
| MC-9 v1.0 | DP-domain retention→transfer effect (High-risk umbrella). | PROXY-DIRECTIONAL | R1/P1 effect/BM-1/2/4/CAND-3; INC-1 |
| MC-10 v1.0 | Demand for the differentiators. | CLASS-7-DEFERRED | R4/D1 demand/RA6/CAND-10/EX3; PRX-8; INC-5 |
| MC-11 v1.0 | Non-measured settled decisions (measured by audit, not metric). | NON-MEASURED-SETTLED | DEC1–5; P3/P5/P6; EX1–6; BX-1–5; RA1/RA3/RA4; D4/R8 |

**Evidence-status labels** (`measurement-contracts/00_…` §3.1): PROXY-DIRECTIONAL, PROXY-BOUNDING, COLLECTION-GAP, CLASS-7-DEFERRED, NON-MEASURED-SETTLED. **Nondeterminism-tolerance vocab** (§3.2): DET, GRADER-VAR, REVIEWER-VAR, MODEL-VERSION-BOUND.

### FEAS-1 … FEAS-9 — per-signal feasibility findings
**Definition:** per-signal feasibility checked against real code; verdict vocab COMPUTABLE / COMPUTABLE-UNVALIDATED / UNCOMPUTED / UNAVAILABLE. **Defining file:** `measurement-contracts/02_feasibility-and-telemetry-inventory.md`. Key verdicts: `averageQuality` UNCOMPUTED (hardcoded `0`), per-pattern mastery UNAVAILABLE (no schema field), `time_spent_ms` COMPUTABLE-UNVALIDATED.

### RDM — Requirement-Decision Mapping gate
**Definition:** the pre-evidence gate that inventories every material requirement/decision and maps each to ≥1 testable hypothesis + a frozen MC-* contract (or explicit NON-MEASURED-SETTLED / CLASS-7-DEFERRED / COLLECTION-GAP disposition). Any unmapped material item or hypothesis-without-frozen-contract ⇒ `Verdict=BLOCK` ⇒ `GATE-STATE=FAIL` ⇒ all downstream evidence collection blocked. **Result:** `GATE-STATE = PASS` at freeze v1.0; unmapped items 0; High risks in NON-MEASURED-SETTLED 0. **Defining file:** `measurement-contracts/03_requirement-decision-mapping-gate.md`. **Cross-refs:** RDM-* rows per element family + journey-closure rows.

### PRX-1 … PRX-8 — proxy-replacement contracts (the INC-4 artifact)
**Definition:** for each accepted proxy, the production/external-user replacement signal, its confirmation trigger, revision trigger (⇒ new contract version + rerun), and discoverable affected set. Sets no mutable status. **Defining file:** `measurement-contracts/04_proxy-replacement-contracts.md`. PRX-1 (MC-1) cohort retention curve (PLA-1); PRX-2 (MC-2) novel-problem transfer rate; PRX-3 (MC-3) long-horizon retention/schedule telemetry; PRX-4 (MC-4) class-5 DP-grading reliability bound (INC-3); PRX-5 (MC-5) production adherence rate; PRX-6 (MC-6) production per-pattern mastery signal; PRX-7 (MC-7/8) session-quality + time-on-task aggregates (PLA-2/3); PRX-8 (MC-10) external-user demand/adoption (INC-5).

### PLA-1 … PLA-3 — operational-log privacy gate (OUT-4)
**Definition:** a least-privilege, time-bounded, minimized, retention-bounded, **payload-free** access record for any payload-bearing log use; every condition must hold or the use BLOCKS. Enforces P5/EX6/BX-5. **Defining file:** `measurement-contracts/05_operational-log-privacy-gate.md`. PLA-1 cohort retention aggregate (serves PRX-1/MC-1); PLA-2 session-quality aggregate (PRX-7/MC-7); PLA-3 `time_spent_ms` reliability aggregate (PRX-7/MC-8). **All three Verdict PASS.** Grounded by `src/shared/logger.ts` leaving learner `response` text unredacted (F4.4).

---

## 6. Automated-evaluation machinery (NEU-902) & executed batch (NEU-903)

**Owners:** NEU-902 (`automated-evaluation/`), NEU-903 (`autoeval-batch/`).

### ACL-1 … ACL-10 — automation-classification records
**Definition:** one record per hypothesis-carrying contract MC-1…MC-10, classifying each AUTOMATABLE / NON-AUTOMATABLE via a 5-clause deterministic test (oracle / session-sizable / signal-exists / class-fit / config-control). **Defining file:** `automated-evaluation/01_hypothesis-automation-classification.md`. **Result:** 10/10 classified; exactly **1 automatable — ACL-4 (MC-4 / H-F3)**. (MC-11 carries no hypothesis, so no ACL row.)

### AEP-1 — automatable-evaluation protocol block
**Definition:** the full protocol block for the sole automatable hypothesis (H-F3/MC-4): system-under-test = real `submit_answer` grading path; class-5; case set ACS-1 v1.0; references frozen MC-4 v1.0 BOUNDING rule; tolerance GRADER-VAR + MODEL-VERSION-BOUND. **Defining file:** `automated-evaluation/02_automatable-evaluation-definitions.md`.

### ACS-1 (v1.0) — automated case set
**Definition:** frozen set of **12 cases** = 3 DP patterns (0/1 Knapsack, LCS, Coin-Change) × 4 archetypes (SHALLOW, WRONG, INCOMPLETE, CONTROL); 9 adversarial (oracle NOT-pass) + 3 CONTROL (oracle pass, `quality ≥ 3`). Cases `ACS-1-01`…`ACS-1-12`. Frozen before first run. **Defining file:** `automated-evaluation/02_…` §1; fixtures `autoeval-batch/01_case-fixtures-and-inputs.md`. **Archetypes:** SHALLOW (restates problem, no recurrence); WRONG (plausible-but-incorrect transition/greedy); **INCOMPLETE** (correct core idea, missing base case / complexity / correctness argument); CONTROL (fully correct, oracle-validity guard). The over-validation finding lands on `ACS-1-03/-07/-11` (the INCOMPLETE cases).

### CCR-1 … CCR-7 — clean-context-repeat / isolation conditions
**Definition:** the seven auditable isolation conditions each repeat run must record; a repeat missing any field is rejected and cannot count toward the ≥2-repeat requirement. **Defining file:** `automated-evaluation/03_clean-context-repeat-and-isolation.md`. CCR-1 baseline restoration; CCR-2 identical input snapshot (hash); CCR-3 newly initialized isolated run; CCR-4 cleared/namespaced caches; CCR-5 identical versioned config (digest); CCR-6 recorded seed or explicit UNSUPPORTED + tolerance; CCR-7 prior-output isolation (commit-before-compare, no verdict leakage).

### The executed batch — RUN-1/2/3, ENV, RET, FIX-*, BATCH-AUTOEVAL, 12/12 result
**Owner:** NEU-903. **Defining files:** `autoeval-batch/02_run-conditions-and-env.md`, `03_per-case-results.md`, `04_repeat-comparison-and-integrity.md`.
- **RUN-1/RUN-2/RUN-3** — three separately-initialized isolated grader runs (grader = Claude Opus 4.8 `claude-opus-4-8`, minimal grading-harness since the live path was unreachable). Baseline id `BASE-ACS1v1.0`.
- **ENV** — per-run environment-identity record (model+version, harness version, runtime, data/schema base, config digest, sampling params, seed status). **RET** — retained-result requirement (immutable per-case per-run artifact). **FIX-KNAP / FIX-LCS / FIX-COIN** — the three DP-pattern topic fixtures.
- **BATCH-AUTOEVAL** — the single bounded execution batch (12 cases × ≥2 clean-context repeats) allocated to NEU-903. **Caps:** ≤6 automatable hypotheses, ≤18 cases, 1 batch.
- **12/12 result:** per-case PASS/NOT-pass verdict **reproduced 12/12 identical across all 3 runs**; over-validation flag set `{ACS-1-03, ACS-1-07, ACS-1-11}` identical every run; 3 CONTROLs passed every run; only sub-threshold GRADER-VAR jitter on two FAIL cases (no verdict change); incomplete-run register: none.

---

## 7. Benchmark suite & executed journeys (NEU-900 / 904 / 905)

**Owners:** NEU-900 (`benchmark-suite/`), NEU-904 (`baseline-batch/`), NEU-905 (`failure-batch/`).

### JNY-B1/B2/F1/F2/F3 — the five journeys
**Definition:** the five benchmark journeys (≤6 cap), each a scenario exercising specific BM cells via a chosen vehicle, carrying one hypothesis H-*. **Defining files:** `benchmark-suite/00_selection-and-coverage.md` (coverage), `benchmark-suite/01_journey-vehicles-and-fidelity.md` (per-journey records).

| Journey | Scenario | BM cells | Hypothesis | Batch | Execution |
| --- | --- | --- | --- | --- | --- |
| JNY-B1 | Spaced-retention baseline + measurement-feasibility inspection. | BM-2, BM-8 | H-B1 | BATCH-BASELINE | BM-8 executed live (class-2); BM-2 executed **retrospective** v1.1 (`baseline-batch/07_…`) |
| JNY-B2 | Motivation & adherence under grind culture (boundary-respecting). | BM-6 | H-B2 | BATCH-BASELINE | v1.0 role-play declined; executed **retrospective** v1.1 (`baseline-batch/08_…`) |
| JNY-F1 | Schema formation vs surface memorization; expertise-reversal boundary. | BM-1, BM-7 | H-F1 | BATCH-FAILURE | executed **retrospective** v1.1 (`failure-batch/02_…`); transfer not isolable → `incomplete`; BM-7 not exercisable |
| JNY-F2 | Long-horizon decay/relapse & hierarchical scheduling. | BM-3, BM-4 | H-F2 | BATCH-FAILURE | executed **retrospective** v1.1 (`failure-batch/04_…`); BM-4 decay shape only → `incomplete`; BM-3 INCOMPLETE |
| JNY-F3 | AI grading over-validation / false confidence. | BM-5 | H-F3 | BATCH-FAILURE | **bound-not-run**; evidence executed by NEU-903 BATCH-AUTOEVAL, bound in `failure-batch/06_…` |

### H-B1/B2/F1/F2/F3 — journey hypotheses
**Definition:** one testable hypothesis per journey. **Defining files:** `benchmark-suite/01_…` (wording); adjudicated status `adjudication/03_decision-status-register.md` §1.

| ID | Hypothesis (one-line) | Adjudicated status |
| --- | --- | --- |
| H-B1 | Spaced retention holds a learned DP pattern. | **provisional** (retention direction present; DP transfer/effect half unresolved, INC-1) |
| H-B2 | Rating-driven learner abandons spaced review (adherence collapse). | **provisional** (failure shape present; prevalence unresolved, INC-5) |
| H-F1 | Schema transfer beats surface memorization (+ expertise-reversal boundary). | **unresolved** (INSUFFICIENT-EVIDENCE, INC-1; BM-7 INCOMPLETE) |
| H-F2 | Long-gap decay/relapse + hierarchical scheduling. | **unresolved** (INSUFFICIENT-EVIDENCE, INC-1; BM-3 INCOMPLETE) |
| H-F3 | AI grading over-validates a shallow/wrong DP answer → false confidence. | **contradicted (as literally worded)**; FM4 present-bounded on the INCOMPLETE archetype. See reformulation **H-F3.1** in `00_hypothesis-reformulations.md`. |

### BATCH-BASELINE / BATCH-FAILURE — the two batches
**Definition:** the two disjoint, independently-shippable execution batches. **Defining file:** `benchmark-suite/02_batch-allocation.md` §1.
- **BATCH-BASELINE** (owner NEU-904) — baseline/prerequisite/motivation/exclusion journeys; ≤3 journeys; **no targeted prototype permitted**. Allocation: JNY-B1, JNY-B2.
- **BATCH-FAILURE** (owner NEU-905) — product-critical-failure/evidence-conflict journeys; ≤3 journeys; **≤1 targeted prototype** with a why-lower-fidelity-insufficient rationale. Allocation: JNY-F1, JNY-F2, JNY-F3.
- **Disjoint rule:** every journey belongs to exactly one batch; no BM cell, vehicle instance, or observation record is shared; batches are independently shippable.

### Vehicle revision (v1.0 → v1.1) — the "sequential-vs-revised" rule
**Definition:** a **versioned, reviewable** substitution of a journey's research vehicle from v1.0 (the original NEU-900 selection) to v1.1 (a lower-fidelity substitute), recorded as a distinct version that **supersedes by pointer, never by overwrite** (append-only). There is no separately-named "sequential-vs-revised batch" rule — this **versioning rule is that rule**: a re-selection may never silently change a vehicle. **Defining files:** `failure-batch/01_vehicle-revision.md` (JNY-F1/F2), `baseline-batch/06_vehicle-revision.md` (JNY-B1/B2).
- **Why it happened:** at execution the human creator was unavailable for live/paper runs and the live Second Memory MCP tools were unreachable; the creator declined the original vehicles and authorized a retrospective production-DB-aggregate substitute.
- **What changed:** v1.0 live-MCP loop / role-play / paper timeline → v1.1 retrospective privacy-gated production-DB aggregates + informal verbatim creator testimony, as separate class-3 RETRO and class-6 operational-log records. A fidelity **downgrade, not coverage**.
- **JNY-F3 exception:** its vehicle was **not** revised; its reserved-prototype gate opened under NEU-903, which built/ran the single ≤1 prototype grading-harness; NEU-905 **binds** that evidence rather than re-running it.
- **Infeasibility-routing rule** (never add a 4th journey, build a 2nd prototype, drop/downgrade a material cell, or relabel a BX-* wall): `benchmark-suite/02_…` §4.

### OBS-* — creator-dogfooding observation records
**Definition:** the fixed, append-only, payload-free observation record, one per journey run; run-id scheme `OBS-<JNY-id>#<n>` (or `#RETRO`/`#BIND`). Creator conclusion field written LAST and sealed until AI verdicts commit. **Defining file:** schema `benchmark-suite/03_creator-dogfooding-protocol.md` §1; instances in `baseline-batch/`, `failure-batch/`. **Field family** includes `OBS-run-id`, `OBS-journey`, `OBS-vehicle`, `OBS-held-constant`, `OBS-varied`, `OBS-server-signals`, `OBS-failure-signal`, `OBS-boundary-check`, `OBS-fidelity-hit`, `OBS-creator-conclusion`. Concrete examples: `OBS-JNY-B1#1/#2`, `OBS-JNY-B1#RETRO-BM2`, `OBS-JNY-B2#RETRO-BM6`, `OBS-JNY-F1#RETRO`, `OBS-JNY-F2#RETRO`, `OBS-JNY-F3#BIND`.

### OPLOG-* — class-6 operational-log records
**Definition:** class-6 aggregate operational-log records supporting v1.1 retrospective journeys, payload-free per the PLA gate. **Defining files:** `baseline-batch/07_…`, `08_…`, `failure-batch/02_…`, `04_…`. Field ids: `OPLOG-run-id/-journey/-query-scope/-time-range/-field-allowlist/-aggregates/-failure-signal/-boundary-check/-fidelity-hit/-conclusion`. Examples: `OPLOG-JNY-B1#BM2`, `OPLOG-JNY-B2#BM6`, `OPLOG-JNY-F1`, `OPLOG-JNY-F2`.

### AIR-* — independent AI-review reproduction records
**Definition:** one record per AI review; ≥2 separately-initialized AI reviews per journey, each committing an isolated verdict (append-only, timestamped) **before** exposure to the creator's conclusion or any other reviewer; closed verdict set `supports` / `contradicts` / `insufficient-evidence`; disagreement → journey `conflicted` → routed to NEU-906 (never averaged). Class-4 evidence, never validation. **Defining file:** protocol `benchmark-suite/04_ai-review-independence-protocol.md`; instances in `*-ai-reviews.md` files. Id scheme `AIR-<JNY-id>/R<k>`.

### Creator-dogfooding protocol / AI-review-independence protocol
**Definitions** above; **defining files** `benchmark-suite/03_…` and `benchmark-suite/04_…`. Both enforce class-3/class-4 discipline (never class-7 validation) and the aggregate-only privacy gate (P5/EX6/BX-5).

---

## 8. Adjudication machinery (NEU-906)

**Owner:** NEU-906. **Directory:** `adjudication/`. Binds **LINK-4**, the sole mutable-status authority.

### LINK-4 ledger — decision statuses
**Definition:** the mutable evidence/decision STATUS ledger; the only place any element's status may flip, always under frozen MC-* v1.0 rules (no rule changed, no v1.0 result rescored). **Defining files:** vocabulary `adjudication/00_adjudication-method-and-rule-versions.md` §4; register `adjudication/03_decision-status-register.md`; binding `adjudication/06_link4-binding-and-self-check.md`. **Status set {accepted, provisional, unresolved, contradicted, withheld}:**

| Status | Meaning | Applied to |
| --- | --- | --- |
| accepted | Settled at product altitude, audit-verified — reserved for the MC-11 NON-MEASURED-SETTLED set only; no empirical (class-1–6) element reaches it. | DEC1–5, EX1–6, BX-1–5, P3/P5/P6, RA1–6, D4 (capability-only) |
| provisional | Directional/bounded/shape proxy present (class-4↔class-3 corroboration only, not external validity); cannot settle. | H-B1/BM-2, H-B2/BM-6 (shape), R2, R8, D-family positioning, P1/P2/P4 |
| unresolved | Depends on a missing downstream artifact; carries an INC-* marker. | R1/BM-1/BM-4 (INC-1); R6/BM-8/signals (INC-2); R3/BM-5/FM4-reliability (INC-3); R4/R5-prevalence/M1–4 (INC-5) |
| contradicted | The claim **as literally worded** is not matched by its evidence. | **H-F3 only** |
| withheld | Not used as a positive signal — defined in the vocabulary; not applied to any element this stage. | (none exercised) |

Ledger tally (approx., per `adjudication/06_…`): ~25 accepted, ~20 provisional, ~25 unresolved, 1 contradicted, 0 withheld; **zero unadjudicated** (OC-1/OC-2 of `adjudication/05_…`). Class-6 log admissibility: all OPLOG-* + class-3 RETRO items PASS the PLA-1…3 gate; zero privacy rejections; no raw payload anywhere.

### present-bounded (PROXY-BOUNDING-PRESENT)
**Definition:** an evidence status meaning bounded presence for the specific probed items under the recorded grader model/version only — **never a rate, reliability, prevalence, or effect size**. Applied to FM4/BM-5/H-F3 ("unresolved, present-bounded on the INCOMPLETE archetype"). **Defining files:** `adjudication/03_…` §2.2/§2.6, `adjudication/01_evidence-item-adjudication.md` §5, `adjudication/04_proxy-replacement-dry-run.md` §2.

### Other adjudication files
- `adjudication/01_evidence-item-adjudication.md` — per-item adjudication of every executed evidence item (BM-8, BM-2, BM-6, JNY-F1/F2/F3).
- `adjudication/02_operational-log-admissibility.md` — class-6/RETRO PLA-gate pass records.
- `adjudication/04_proxy-replacement-dry-run.md` — MC-1 + MC-4 proxy-replacement dry-run with history preservation.
- `adjudication/05_orphan-and-unsupported-claims-audit.md` — orphan re-check (7/7 PASS) + adversarial unsupported-claims audit (clean; no external-user/expert/market claim).

---

## 9. Consolidation deliverables (NEU-907 — this package)

**Owner:** NEU-907. **Directory:** *(root)*.
- **`README.md`** — master package index / entry point; reading order, per-package summaries, binding-vs-provisional-vs-unresolved up front, frozen-vs-mutable separation, risks, revision rules.
- **`00_vocabulary.md`** — this file; the primary agent-context ubiquitous-language artifact.
- **`00_gates-report.md`** — the gate-battery results (PASS / CONDITIONAL-PASS / FAIL) with the INC-1…5 accounting.
- **`00_hypothesis-reformulations.md`** — the routed H-F3 reformulation recorded as new provisional hypothesis **H-F3.1**, versioned against contradicted H-F3 v1.0.
- **`00_dry-run-handoff.md`** — the cold-context downstream-agent dry-run record and any repairs.

---

## 10. Cross-cutting gate & discipline terms (index)

| Term | Meaning | Defining file |
| --- | --- | --- |
| RDM gate / GATE-STATE | Pre-evidence requirement-decision mapping gate; PASS at v1.0. | `measurement-contracts/03_…` |
| Operational-log privacy gate (OUT-4) | PLA-* gate over payload-bearing logs; per-use PASS/BLOCK. | `measurement-contracts/05_…` |
| Reserved-prototype gate | ≤1 targeted prototype for BATCH-FAILURE; opened under NEU-903 for JNY-F3. | `benchmark-suite/02_…`, `failure-batch/00_…` |
| Freeze / versioning discipline | All MC frozen v1.0; post-run change ⇒ new version + rerun. | `measurement-contracts/00_…` §4 |
| Materiality rule (DEC5) | In/out criterion for the candidate inventory. | `product-model/02_…` §1 |
| Clean-context repeat | Independent grader re-run in a fresh isolated context to test stability. | `automated-evaluation/03_…` |
| Caps | Hard research/eval limits; exceedance ⇒ incomplete scope. | `00_method-and-provenance.md`, `automated-evaluation/00_…` |
| Severity floor (G-a) | High/Critical risk never non-material or SETTLED-as-closed. | `product-model/02_…`, OC-7 |
