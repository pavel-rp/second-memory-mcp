# Operational Mastery Model — Integrative, Cross-Mechanism (binds `LINK-I2`)

- **Program:** C005 (AI-backed dynamic-programming course) · **Umbrella:** NEU-888 · **Task:** NEU-922 (integrate the operational mastery model with explicit uncertainty bands)
- **Depends on:** the ten decision records `../decision-records/DR-M01…DR-M10` (each fixes a per-mechanism mastery-signal *shape* and defers its *value* to `LINK-I2`), the evidence register `../traceability/01_instructional-evidence-register.md`, the framing `../02_cognitive-load-desirable-difficulty-transfer.md`, and the durable-vs-speed framework `../framework/00_durable-vs-speed-framework.md`.
- **Compiled:** 2026-07-13 · **Status: provisional. Settles nothing. Resolves no conflict. Flips nothing to `settled`/`accepted`.**

---

## 1. What this is — and is not

**Is.** The single integrative model that consolidates the ten decision records' per-mechanism mastery signals into **one operational mastery model**: the cross-mechanism signal spine, the promotion/progression decision rules that compose those signals, and — the load-bearing deliverable — a **threshold table that binds `LINK-I2`**. Every `DR-Mxx` fixed the *observable shape* of its mastery signal and deferred the calibrated *number* to `LINK-I2` (the mastery-signal contract). This file is where those deferred numbers receive a **provisional value, an explicit uncertainty band, an evidence class, and the signal that would revise them.**

**Is not.** It makes **no reconciliation verdict** (whether the live coded rule matches these shapes is `INC-I3`, owned by NEU-923); it **resolves no conflict** (C1 and C4 stay `unresolved`·non-downgradable — providing a *target* bar is not adjudicating the live rule); it runs **no experiment**; it introduces **no new mechanism behavior** and **contradicts no `DR-Mxx` invariant**. It sets the SM-2/FSRS interval algorithm nowhere — the interval *math* is NEU-923; this model fixes only mastery-*criterion* counts and bars. Nothing here is `settled`/`accepted`.

## 2. Standing validity statement — the value firewall (read before any number below)

Every value in §5 is a **provisional starting point**, not a measured optimum. Three constraints bind all of them, without exception:

1. **No class-7 evidence exists — no threshold claims external validity.** Not one number below is validated on this product's learners or on the dynamic-programming (DP) domain. Class-7 `[future-real-user]` evidence does not exist project-wide (`../01_evidence-labeling.md`); phrases like "proven for our learners" / "the market validates" are prohibited and absent. Each value is transported from **class-1 convention** (published mastery-learning / spacing / grading conventions) or **class-2 default** (an existing Second Memory code constant, a *compatibility* fact, never a pedagogical endorsement) into a domain where its effect is **UNMEASURED** (`INC-I1` / F-TR-3, the single largest standing gap).
2. **The bands are epistemic, not statistical.** A band like `[0.85, 0.95]` is *"the defensible range given how little we know,"* not a sampling confidence interval. It marks the span across which reasonable class-1 conventions disagree and inside which the provisional value sits until in-domain evidence narrows it. Several values rest on gaps the synthesis flagged as having **no evidence for an exact number** (G5, G6) — those carry the widest bands and say so.
3. **Population validity is UNEARNED.** These values become *calibrated* — not before — when class-3 `[dogfooding]` (creator benchmark journeys), then class-6 `[operational-log]` (privacy-gated production aggregates), then eventually class-7 evidence lands. Until then every row is `provisional` and every progression gate below is a **hypothesis to be measured**, not a settled rule. This is the standing revision path for **all** thresholds; §5's per-row "revision signal" names the *specific* observation on top of it.

## 3. Cross-mechanism mastery signals — the unified signal spine

The ten `DR-Mxx` mastery signals are not ten independent bars; they are **orthogonal dimensions of one composite "durable-mastery" signal** on a chunk. Each dimension is fixed in shape by its DR; this model only states how they compose.

| Dimension | Fixed shape (from DR) | Source DR | Role in the composite |
| --- | --- | --- | --- |
| **Production** | unaided reconstruction/derivation, not recognition | DR-M03 | a countable success must be *produced from memory*, never recognized |
| **Distribution** | success counts only on a **non-massed** retrieval, across **separated sessions** | DR-M03, DR-M04 | de-duplicates same-session repeats; a burst in one sitting is one datum, not many |
| **Fidelity** | grade from a **deterministic mapper** over a rubric-anchored payload, not LLM self-report; rebuttal-invariant | DR-M08 | every success is only as trustworthy as the grade behind it; corrupt grade ⇒ corrupt composite |
| **Correction-closure** | terminal failures resolved with **correct-answer exposure** before the outcome is recorded | DR-M06 | a "pass" cannot follow an uncorrected terminal failure |
| **Discrimination** | on mixed problem types, learner **selects the correct DP technique** | DR-M05 | category-axis interleaving accuracy, the transfer-relevant dimension |
| **Fading** | worked-support monotonically **faded as expertise rises** | DR-M02 | acquisition-phase scaffold, not a gate dimension; withdrawn before durable counting begins |
| **Savings** | on lapse, schedule is **penalized-not-zeroed** (bounded by prior stability) | DR-M09 | preserves the composite across a lapse instead of discarding it |
| **Durability gate** | dependent unlocks iff prerequisite composite ≥ a **durability bar**, server-evaluated from persisted multi-session history, monotonic, never on one success | DR-M10 | the integration point — the composite is read here to gate progression |

**The spine, in one sentence:** a chunk is *durably mastered* when the learner **produces** it unaided, on **non-massed** retrievals **spaced across separated sessions**, graded by a **trustworthy fidelity-gated** signal, with terminal failures **corrected** — and progression **reads that composite at a durability bar**, never a single success and never raw throughput.

## 4. Integrated promotion / progression decision rules

The composite drives a **staged ladder**. Durability is always gated *before* speed; speed is a later phase and **never a lower unlock bar** (DR-M10 Stage-2 invariant; DR-M07 staged resolution). Each gate cites the thresholds it reads (§5, `MM-T#`).

| Gate | Transition | Rule (composite dimensions) | Thresholds |
| --- | --- | --- | --- |
| **A — Advance within a path** | prerequisite → teach dependent | ≥1 **unaided** correct application of the prerequisite (demonstration, not exposure, not `repetitions>0`) | MM-T9 |
| **B — Chunk reaches durable mastery** | practice → durable | **K** non-massed, trustworthy-graded successes at quality ≥ **Q**, spanning **≥S separated sessions** | MM-T1, MM-T2, MM-T3 |
| **C — Prerequisite unlocks dependents** | durable → unlock | prerequisite composite ≥ **durability bar B\*** (Gate B cleared **and** retrievability posterior ≥ B\*), server-evaluated from persisted multi-session history | MM-T8 |
| **D — Technique enters interleaved pool** | blocked acquisition → interleaved review | per-technique **fluency gate** fires (Stage-1→Stage-2, DR-M05/M07) | MM-T11, MM-T12 |
| **E — Contest-speed phase (later, non-lowering)** | durable → fluent | after Gate C, a **latency** criterion is pursued; it may **not** relax any of A–C | MM-T15 |
| **Fidelity precondition (all gates)** | — | every counted success passes the assessment fidelity control (agreement ≥ A, over-validation ≤ V, rebuttal-invariant); every terminal failure is correction-closed | MM-T4, MM-T5, MM-T6, MM-T7 |
| **Remediation (off-ladder)** | lapse / leech | lapse → penalized-not-zeroed reschedule (savings floor); **N** consecutive genuine failures → reformulate | MM-T13, MM-T14 |
| **Fade (acquisition-side)** | novice → unaided | worked-support faded as the expertise proxy rises | MM-T10 |

**Composition invariant:** Gate C reads the *output* of Gate B, which reads the *output* of the fidelity precondition. A weak grade (fidelity) therefore cannot be laundered into an unlock (durability) — this is why C4 (assessment) is a stated **precondition** of C1 (progression), exactly as DR-M10 and DR-M08 require, and why neither is resolved here.

## 5. Threshold table — the `LINK-I2` binding (provisional values + uncertainty bands)

**How to read a row.** *Provisional value* = the starting number a first build would use. *Band* = the epistemic range (§2.2). *Basis + class* = the evidence the value is transported from, with its NEU-887 class. *Revision signal* = the specific observation that would move the value off its provisional point (on top of the standing class-3→6→7 path, §2.3). *Guard* = the `DR-Mxx` invariant or conflict the row must not contradict/resolve.

| Id | Threshold (mechanism / DR) | Provisional value | Band (epistemic) | Basis + class | Revision signal | Guard |
| --- | --- | --- | --- | --- | --- | --- |
| **MM-T1** | Durable-mastery success count **K** per chunk (M03/M04) | **3** non-massed successes | 2–4 | F-M04-3 "no benefit beyond ~3, typically 1/session" [class 1, causal/definitional]; successive-relearning convention | in-domain DP retention curve (dogfooding/production, `INC-I1`) showing K too low (post-unlock lapses) or too high (over-practice waste) | G6 (exact count unsupported); interval math is NEU-923 — this is the *criterion count* only |
| **MM-T2** | Spaced-session separation **S** (M04) | **≥2** separated sessions, ≥1 counted success per session, sessions ≥1 day apart | S 2–3; separation 1–N days | F-M04-2 (spaced 68% vs massed 26%) [class 1, causal]; F-M04-3 [class 1] | production inter-session-interval calibration (FSRS-style fit, `INC-I1`) | **DR-M04 inter-session gate**: counter advances ≤once/session — do not contradict; does not set the SM-2 interval (NEU-923) |
| **MM-T3** | Grade quality floor **Q** for a counted success (M08/M03) | **q ≥ 3** on the 0–5 scale | 3–4 | class-2 code default (SM-2 `q≥3`; server retry-guidance `quality≥3`) — *compatibility fact, not endorsement* | DP grading/dogfooding evidence that q=3 answers do not durably retain | keep 0–5 granularity (no binary collapse, DR-M08) |
| **MM-T4** | Assessment agreement bar **A** vs held-out reference (M08) | **≥0.80** agreement | 0.75–0.85 (a **trust ceiling**, not a floor to extrapolate past) | F-M08-2 (strong LLM judges ≈ human-level ~80% agreement, with baked-in biases) [class 1, empirical] | DP grading-fixture measurement of rubric-derived-vs-reference agreement | **does NOT resolve C4** (non-downgradable; live-rule verdict = NEU-923) |
| **MM-T5** | Over-validation ceiling **V** on the known-incorrect adversarial set (M08) | false-accept rate **≤0.10**, fail-closed above | 0.05–0.15 | target set well below observed over-validation (up to **71%**, F-M08-3) and incorrect-diagnosis 4–55% (F-M06-4) [class 1, empirical] — a *control tolerance*, not this product's measured rate (G7) | adversarial DP fixture false-accept rate in CI / dogfooding | **does NOT resolve C4**; fixture shape fixed by DR-M08, value only here |
| **MM-T6** | Rebuttal-invariance (M08) | **0** upward flips without a *new* rubric-anchored payload (binary invariant) | none (binary) | F-M08-4 (sycophancy flips correct→incorrect 45.2%; assertive 84.5%) [class 1, empirical] | n/a — invariant, not a tunable | DR-M08 rebuttal-invariance assertion |
| **MM-T7** | Correct-answer-exposure detection rate **X** on seeded-incorrect fixture (M06) | **≥0.90** detection (equivalently ≤0.10 false-accept, ties to MM-T5) | 0.85–0.95 | F-M06-4 (LLM diagnoses incorrect 4–55%, valid-alternatives 0–76%) [class 1, empirical] | DP adversarial-fixture detection rate | DR-M06 outcome gate (no pass/mastered after uncorrected terminal failure) |
| **MM-T8** | Prerequisite-unlock **durability bar B\*** (M10) | Gate B cleared **and** retrievability posterior **≥0.90** at unlock | 0.85–0.95 | F-M10-1 (90% mastery-learning bar) [class 1, framework/quasi-exp]; F-M10-2 (BKT P≥0.95 convention) [class 1, modeling convention] | in-domain DP progression calibration (`INC-I1`); C1 live-rule reconciliation (NEU-923) | **does NOT resolve C1** (non-downgradable); explicitly **rejects `repetitions>0`**; multi-observation, server-evaluated, monotonic — matches DR-M10 invariant |
| **MM-T9** | Demonstrated-competence transition, within-path (M01) | **≥1** unaided correct application (advance, not unlock) | shape only (no number) | F-M01-2 (mastery-learning sequences on *demonstrated* competence) [class 1, framework] | same as MM-T8 (jointly bounded with M10) | must not pre-empt C1; advance ≠ unlock (unlock = MM-T8) |
| **MM-T10** | Worked-example fade step trigger — expertise proxy (M02) | fade one scaffold level at unaided-success rate **≥0.67** (2 of last 3) on the DP sub-skill | 0.6–0.8 | F-M02-4 (adaptive > fixed fading) [class 1, causal]; F-M02-3 (expertise reversal) [class 1, causal]; proxy candidate = retrievability tier / unaided-success rate, F-M02-5 [class 2] | DP fading study; per-learner expertise-signal calibration | not learning-critical; monotone-decreasing scaffold in the signal (DR-M02) |
| **MM-T11** | Per-technique fluency gate — interleaving entry (M05/M07) | last **N=3** unaided attempts correct (accuracy ≥0.8) | accuracy 0.75–0.9; N 2–4 | F-M05 staged resolution; F-M07 per-item fluency gate [class 1] | DP discrimination/fluency measurement | not learning-critical; gate integrity backed by M03/M04/M10 controls, not a new one |
| **MM-T12** | Interleaved-discrimination threshold (M05) | technique-selection accuracy **≥0.8** across ≥3 mixed types | 0.75–0.9 | F-M05-1 (d=1.34 single study) / F-M05-2 (g=0.42 meta-analytic, moderate) [class 1, causal] | DP problem-type-discrimination measurement | axis = **category** (DR-M05), not difficulty |
| **MM-T13** | Leech trigger — consecutive genuine failures **N** (M09) | **3** consecutive **trustworthy-graded** failures → reformulate | 3–5 consecutive | F-M09-2 (thresholds are product defaults, counting-rule-dependent; "8" is *lifetime*, not comparable) [class 1, deployed spec]; F-M09-5 current 3-consecutive default [class 2] | DP leech-rate from production (`INC-I1`) | consecutive ≠ lifetime (do not import Anki's 8); dead `leechFailureThreshold=6` mismatch is a NEU-923 reconciliation item, not resolved here |
| **MM-T14** | Post-lapse **savings floor / cap** (M09) | `post_lapse_interval ∈ [ max(1d, 0.2 × prior_stability), prior_interval ]` — floor = 20% of prior stability, never `repetitions→0` | floor coefficient 0.1–0.3 | F-M09-3 (FSRS caps-not-zeros; Ebbinghaus faster relearning) [class 1, algorithm design + causal replication] | DP relearning-savings measurement | **matches DR-M09 invariant** `floor(prior_stability) ≤ post_lapse ≤ prior_interval`; scheduler choice = NEU-923 |
| **MM-T15** | Contest-speed / fluency criterion — Stage 2 (M07/M10) | median solve latency **≤1.5×** reference on already-durable items | 1.25–2× | F-DD-2 (immediate fluency is the speed side, directional) [class 1, mechanistic]; pacing numbers unanchored (G5) | contest-outcome data (class-7, **absent**) — widest uncertainty | **never lowers** an unlock bar (DR-M10 Stage 2; DR-M07 staged) |

**Deferred-value coverage check.** Every `LINK-I2` deferral named across the ten DRs is bound above: M01 demonstrated-competence (MM-T9) · M02 expertise/fade (MM-T10) · M03 count/quality (MM-T1, MM-T3) · M04 spaced count (MM-T1, MM-T2) · M05 fluency-gate + discrimination (MM-T11, MM-T12) · M06 detection rate + graded pass (MM-T7, via MM-T1/T3) · M07 per-item fluency (MM-T11, MM-T15) · M08 agreement + over-validation (MM-T4, MM-T5, MM-T6) · M09 leech count + savings floor (MM-T13, MM-T14) · M10 durability bar (MM-T8). None is left as a bare `UNRESOLVED`; each is now `provisional`-with-band.

## 6. Non-contradiction cross-check (against the DR invariants and the frozen conflicts)

| Constraint | How this model honors it |
| --- | --- |
| **DR-M10 durability-gate invariant** (multi-observation, server-evaluated, monotonic, not `repetitions>0`) | MM-T8 reads the Gate-B composite + posterior, server-side, monotonic; MM-T9 keeps *advance* (single demonstration) distinct from *unlock* (MM-T8). No single success unlocks. |
| **DR-M04 inter-session gate** (counter advances ≤once/session) | MM-T2 requires ≥2 *separated* sessions and treats a same-session burst as one datum; MM-T1's K are explicitly *non-massed*. |
| **DR-M08 deterministic grade mapper** (rubric payload → mapper, no self-report, rebuttal-invariant, 0–5 preserved) | MM-T3 counts only mapper-derived grades; MM-T4/T5/T6 pin agreement, over-validation, and rebuttal-invariance; MM-T3 keeps 0–5 granularity (no binary collapse). |
| **C1 / C4 non-downgradable, NEU-923 territory** | MM-T8 (C1) and MM-T4/T5 (C4) supply *target* bars only; each row states it **does not resolve** the conflict — the live-rule reconciliation verdict (`INC-I3`) stays with NEU-923. Providing a provisional target is the mastery-model's chartered job (DR-M10/M08 deferred it here), not adjudication. |
| **INC-I1 / DP-transfer uncertainty** | Every row is transported from class-1/2 evidence into an **unmeasured** DP domain; every revision signal is in-domain DP measurement; the whole model is `provisional`. |
| **Seven-class evidence discipline** | Every value cites its class (1 or 2); no class-3/4/5/6-fresh/7 is invoked; no number is presented as external validation (§2.1). |
| **DR-M05 axis / DR-M07 staged / DR-M02 measured** | MM-T12 keeps the category axis; MM-T11/T15 keep struggle-then-fluency staging; MM-T10 keeps monotone expertise-weighted fading. No mechanism resolution is re-opened. |

## 7. §SELF-CHECK-922

- **Consolidation, not re-derivation.** The ten `DR-Mxx` mastery-signal *shapes* are reused verbatim (§3); this model adds only their *composition* (§4) and their *provisional values + bands* (§5). No `DR-Mxx` decision, behavior, or invariant is contradicted (§6). **PASS.**
- **`LINK-I2` bound, provisionally.** Every DR-deferred `LINK-I2` value is now `provisional`-with-band and a named revision signal (§5 coverage check). The register binding note (`../traceability/01_…`, NEU-922 block) and the ledger rows (`../adjudication/01_…` §C-MASTERY) mirror this. **PASS.**
- **Every threshold carries an uncertainty band and a revision signal.** No row is a bare point estimate; each has a band (or is explicitly a binary invariant) and the specific observation that would revise it. **PASS.**
- **No external validity claimed; population validity UNEARNED.** Every value is class-1 convention or class-2 default transported into an unmeasured DP domain; no class-7 evidence is invoked; §2 states the firewall explicitly. **PASS.**
- **No conflict resolved; nothing settled.** C1/C4 stay `unresolved`·non-downgradable (reconciliation = NEU-923); DP-transfer (`INC-I1`) stays open; no ledger status is `settled`/`accepted` — the mastery-model rows are `provisional`. **PASS.**
- **No invented value laundered as evidence.** Provisional numbers are labeled provisional and tied to their class-1/2 basis or to an open gap (G5/G6/G7) with a widened band; none is asserted as measured or DP-established (OC-5 respected). **PASS.**
