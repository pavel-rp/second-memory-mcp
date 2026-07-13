# Cross-Mechanism Synthesis

**Task:** NEU-915 · **Cutoff:** 2026-07-13 (fresh) / 2026-07-07 (reused). **Makes no instructional decision.**
This file holds the cross-mechanism view: the evidence-quality summary, the conflict register, the unresolved-gap inventory, the causal-vs-correlational ledger, and the acceptance-scenario self-check. It draws no conclusion a mechanism decision would draw.

## 1. Evidence-quality summary (per mechanism)

| Mechanism | Strongest evidence | Class | Causal? | Standing weakness |
| --- | --- | --- | --- | --- |
| M01 Sequencing | CLT element-interactivity; mastery-learning prerequisite order | 1 | partly (Bloom quasi-exp) | No DP-specific order measured; difficulty-ramp ≠ interleaving |
| M02 Worked examples | Worked-example effect; expertise reversal; fading | 1 | yes (many controlled) | Pooled magnitudes partly UNVERIFIED; DP transfer unmeasured |
| M03 Retrieval | Practice-testing high utility; errorful retrieval | 1 | yes | Far transfer not automatic; DP unmeasured |
| M04 Spacing | Cepeda 317-experiment meta; 68% vs 26% spaced/massed | 1 | yes (large) | Optimal ISI not pulled; DP transfer unmeasured |
| M05 Interleaving | Rohrer d=1.34; Brunmair g=0.42; moderate utility | 1 | yes | Category axis only; DP unmeasured; blocking-first caveat UNVERIFIED |
| M06 Feedback | Pashler +494% corrective feedback; hypercorrection | 1 | yes | Magnitude study-specific; AI diagnosis weak (F-M06-4) |
| M07 Productive struggle | Errorful learning; region of proximal learning | 1 | yes (Metcalfe) | Accomplishable-band boundary unmeasured for DP; "2 attempts" not evidence-derived |
| M08 Assessment | LLM-judge biases; over-validation up to 71%; sycophancy | 1 | yes (empirical) | DP-grading fidelity unmeasured; self-grading compounds bias |
| M09 Remediation | Post-lapse savings; reformulate-not-suspend | 1 | partly (savings causal; thresholds conventional) | No causal threshold; DP-leech semantics differ |
| M10 Progression | Mastery ≈90%; BKT P≥0.95; ITS d=0.76 | 1 | partly | Thresholds conventional not optimized; DP bar unmeasured; false-precision risk |

**Reading:** The mechanism-level evidence is largely strong *in its studied domains*. The uniform weakness across all ten is the same: no measurement on dynamic-programming problem-solving transfer, and no external-user (class-7) validation anywhere.

## 2. Conflict register (evidence tensions — resolution deferred to reconciliation sub-task)

Conflicts between the literature and the existing coded model are **recorded, not resolved** here. Each is `[literature]` vs `[code-evidence]`.

- **C1 — Prerequisite mastery gate (HIGH).** Literature requires a high/probabilistic mastery bar to unlock dependents (M10 F-M10-1/2). The prior audit found `repetitions > 0` (one success), **Contradicted**; NEU-888 flags that characterization as **stale** (current gating retrievability-threshold-based). *Unresolved:* which live rule is in force must be re-verified against code. Owner: reconciliation + mastery-model sub-tasks. See M01 F-M01-6, M10 F-M10-5.
- **C2 — Roadblock recovery = massed (HIGH-ish).** Spaced criterion recalls beat massed 68% vs 26% (M04 F-M04-2); the roadblock gate requires same-session massed follow-ups, feeding the scheduler a performance-inflated signal. Owner: mechanism-decision (retrieval/spacing cluster) + reconciliation. See M04 F-M04-6, M09 F-M09-4.
- **C3 — Lapse full reset vs savings (HIGH).** Post-lapse memory is partially retained and FSRS caps-but-never-zeros stability (M09 F-M09-3); the code unconditionally resets repetitions→0, interval→1d regardless of prior depth. Owner: reconciliation. See M09 F-M09-5.
- **C4 — Assessment fidelity (HIGH, learning-critical).** LLM self-grading over-validates incorrect answers (up to 71%) and is sycophantic under rebuttal (M08 F-M08-3/4); the session cap only catches post-stumble drift, not uniform leniency, and assessment mode binary-collapses the signal (F-M08-1). Requires an enforceable control beyond prose (NEU-888). Owner: reconciliation + mastery-model. See M08 F-M08-5.
- **C5 — Interleaving axis (MEDIUM).** Evidenced interleaving is category/problem-type mixing (M05 F-M05-3); the dead config names difficulty-ordering (wrong axis), and no interleaving is live. Owner: mechanism-decision. See M05 F-M05-5, M01 F-M01-3.
- **C6 — Feedback after failure absent (MEDIUM-HIGH).** Corrective feedback has large retention effects (M06 F-M06-1); the code records a second failure and moves on with no correct-answer exposure. Owner: mechanism-decision (feedback) + reconciliation. See M06 F-M06-5, M03 F-M03-5.

## 3. Unresolved-gap inventory (recorded, never filled with invented values)

- **G1 — DP-domain transfer unmeasured (ALL mechanisms).** The controlling gap; inherited NEU-887 R1 / X1. No source measures any named mechanism on DP problem-solving transfer within caps.
- **G2 — Three spec-named input files absent.** `ai-tutored-srs-research.md`, `cognitive-science-foundations-learning-chunking.md`, `graduated-reteaching-parameters.md` are not in the repo (see `00_method-and-provenance.md` §2.2). Their intended contribution (AI-tutored-SRS specifics, chunking-capacity numbers, graduated-reteaching parameters) is only partially recovered.
- **G3 — No class-3/4/5/6(fresh)/7 evidence.** This synthesis generates no dogfooding, AI-critique, automated-eval, fresh operational-log, or external-user evidence. Class-7 does not exist project-wide.
- **G4 — Worked-example pooled magnitudes UNVERIFIED.** Crissman d=0.52 is search-derived; Barbieri et al. 2023's pooled effect size could not be extracted (PDF not decoded). Direction supported, precise magnitude not (M02 F-M02-2).
- **G5 — Session-length / daily-cap numbers have no evidence either way.** The audit's Q12 found 90-min / 200-review defaults unanchored to any SR-specific study. Not a named mechanism here, but relevant to progression/pacing — carried as a gap.
- **G6 — Exact criterion/recovery counts unsupported.** Roadblock follow-up counts {3,3,2,1,1,0} and "2-attempt" cap have "no evidence either way" for the specific numbers (M04 F-M04-3, M07 F-M07-4).
- **G7 — Specific LLM-bias percentages UNVERIFIED.** Self-preference-bias figures (e.g. "67–82%") and Gemini-leniency claims from the audit were never primary-confirmed; omitted or flagged, not asserted (M08 F-M08-5).
- **G8 — Chunking-capacity precision.** Working-memory capacity beyond Miller's 7±2 (Cowan ~4) not independently fetched; principle used, precise number UNVERIFIED (`02_…` F-CL-1).

## 4. Causal-vs-correlational ledger

Every load-bearing causal claim in this package rests on causal (experimental/controlled) evidence; observational/benchmark evidence is used only for observational statements.

| Finding | Underlying evidence | Statement made |
| --- | --- | --- |
| M02 worked-example effect (F-M02-1/3/4) | Controlled + expertise×treatment interaction | Causal ("improves learning for novices", "reverses with expertise") ✓ |
| M03 retrieval, errorful retrieval (F-M03-1/2/3) | Controlled | Causal ✓ |
| M04 spacing 68/26, Cepeda meta (F-M04-1/2) | Controlled + meta of experiments | Causal ✓ |
| M04 FSRS 99.6% superiority (F-M04-4) | Large **observational** benchmark (log loss) | Stated as calibration/observational only — **not** claimed as a causal retention gain ✓ |
| M05 interleaving d=1.34/g=0.42 (F-M05-1/2) | Controlled + meta | Causal ✓ |
| M06 Pashler +494%, hypercorrection (F-M06-1/2) | Controlled | Causal ✓ |
| M08 LLM-grading biases (F-M08-2/3/4) | Empirical evaluation studies | Stated as observed LLM behavior, not a learning claim ✓ |
| M10 mastery 90% / BKT 0.95 (F-M10-1/2) | Framework/convention (Bloom quasi-exp) | Stated as convention/practice, not proven optimum ✓ |
| M10 ITS d=0.76 (F-M10-3) | Meta-analytic review | Stated as effectiveness of ITS generally, not progression-rule-specific ✓ |

No correlational source is used to make a causal instructional claim. The one large observational item (FSRS benchmark) is explicitly confined to a calibration statement.

## 5. Acceptance-scenario self-check (NEU-915)

- **Zero unlabeled claims / zero class-1–6 presented as external validation.** Every `F-*` finding carries exactly one of the seven classes; the package contains only classes 1, 2, and reused-6, and asserts no external-user/expert/market validation. Prohibited phrases ("users want", "proven for our learners", "the market validates") are absent by construction (`01_evidence-labeling.md` §3). **PASS by self-audit** (independent evidence-label audit is a downstream verification step).
- **Causal claims rest on causal evidence.** See §4; the one observational benchmark is confined to an observational statement. **PASS by self-audit.**
- **Downstream recoverability.** For each of the ten mechanisms a decision agent recovers, in one file: labeled evidence, the cognitive-load / desirable-difficulty note, and the DP-transfer uncertainty needed to author a decision. **PASS by construction** (README "How to consume a mechanism").
- **No instructional decision made.** Every mechanism file and every conflict defers the verdict to a named downstream sub-task. **PASS by construction.**
