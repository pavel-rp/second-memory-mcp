# DR-M05 — Interleaving

- **Record id / mechanism:** DR-M05 · Interleaving · cluster §C-PRAC · author NEU-919 · 2026-07-13
- **Learning-critical:** no  (source: synthesis **C5** MEDIUM — wrong-axis/absent interleaving is an efficiency/transfer loss, not a corruption of the mastery signal; template §3)

> **Supersedes the illustrative walkthrough.** This record is the **binding `DR-M05`**. It supersedes the *illustrative, non-binding* staged resolution in `../framework/00_durable-vs-speed-framework.md` §6 (authored by NEU-917 as a framework demonstration, explicitly provisional pending this record — its revision trigger (c)). It builds on that walkthrough's staged shape and does **not** contradict it: §6 took **no** position on the interleaving axis, leaving axis choice (C5) to NEU-919; this record now fixes the axis. The NEU-917-owned §C-FRAME walkthrough row is **not** edited here.

## Decision (observable behavior)

Interleaving is implemented on the **category / problem-type axis** (mixing distinct DP problem types — e.g. knapsack vs. LIS vs. interval DP — so the learner must first *identify* which applies), **not** on a difficulty-ordering (easy/medium/hard) axis. Interleaving is applied to **review of already-unlocked material**, not to first-exposure teaching. Resolution is **staged**: **Stage 1** — blocked acquisition per DP technique until an observable per-technique fluency signal fires; **Stage 2** — interleaved review that mixes unlocked techniques. **Observable:** (a) a reviewer/test can watch that a Stage-2 review session presents ≥2 distinct unlocked problem *types* mixed (not one type blocked, and not an easy→hard ramp of one type); (b) first-exposure teaching of a not-yet-unlocked technique is never interleaved; (c) the Stage-1→Stage-2 transition is gated by the per-technique fluency signal, not by a fixed count.

## Cited evidence + class

- F-M05-1 [class 1, causal — single study, secondary-confirmed] — interleaving's delayed-test advantage over blocking (d = 1.34); **durable-mastery side** of the tension.
- F-M05-2 [class 1, meta-analytic] — the effect is **moderate** overall (g = 0.42), not uniformly large; bounds the claim and grounds "provisional, moderate." Its low-achiever blocking-first caveat is **UNVERIFIED** (carried as a gap, not asserted).
- F-M05-3 [class 1, review / absence-of-evidence] — the evidenced axis is **category/problem-type mixing, not difficulty ordering**; the decisive basis for the axis choice (resolves C5's axis question in favour of category).
- F-M05-4 [class 1, causal-directional] — interleaving is a desirable difficulty learners **systematically misjudge** (it beat blocking though participants believed blocking helped more); **contest-speed / immediate-fluency-cost side** of the tension (directional).
- F-DD-2 [class 1, mechanistic] — difficulty that depresses immediate performance is where durable gain sits; supports the speed-side cost of interleaving (directional).
- F-M05-5 [class 2, code-fact] — *compatibility only*: no interleaving is implemented; the dead `interleaveStrategy:'easy-medium-hard'` config names the **wrong axis**. Cited for what exists, **not** as endorsement; motivates choosing the category axis over the dead difficulty config.
- F-M01-4 [class 1, practitioner report — directional] — supports interleaving *review of unlocked* material rather than initial teaching (shared with M01).

## Mastery signal

Observable signal: on **interleaved (mixed-type) review**, the learner **selects the correct DP technique for each problem** — discrimination accuracy across mixed types, the ability interleaving specifically builds. The **calibrated discrimination threshold is UNRESOLVED → LINK-I2** (mastery-model sub-task). The Stage-1→Stage-2 **per-technique fluency gate** value is likewise `UNRESOLVED → LINK-I2`; its *shape* (per-technique accuracy/latency crossing a bar before that technique enters the interleaved pool) is fixed here. Signal shape fixed; numbers deferred.

## Constraints

- **Cognitive-load / desirable-difficulty:** interleaving is a **desirable difficulty** — this decision deliberately **preserves the discrimination difficulty** created by mixing problem types (higher moment-to-moment load, lower apparent fluency, better durable category learning, F-M05-1/2/4). It manages **intrinsic** load by confining interleaving to **already-unlocked** material — mixing first-exposure high-element-interactivity DP derivations could exceed working memory (`../02_…` F-DD-1, F-CL-2); Stage-1 blocked acquisition removes that extraneous overload before mixing begins.
- **Durable-vs-speed resolution (framework §2–4): MATERIAL → staged.** T1 PASS: dialling interleaving up increases durable discrimination/transfer (F-M05-1/2) but decreases immediate fluency/throughput (F-M05-4, F-DD-2) — the paradigmatic opposite-sign case. T2 PASS (asymmetric): durable causal (F-M05-1/2), speed directional (F-M05-4, F-DD-2). T3 PASS: durable technique-*selection* serves learning; fast in-contest recognition serves the contest phase. **Resolution = staged** (§3.3 branch 1): a readiness ordering exists (discrimination presupposes minimal per-technique schemas) with an observable discrete gate (per-technique fluency) → Stage 1 blocked acquisition → Stage 2 interleaved consolidation. Dual-goal evidence: durable F-M05-1/2; speed F-M05-4/F-DD-2. Gate observable; value → LINK-I2. Recorded (A) resolution — **no third exit**.
- **Privacy gate:** no class-6 signal used.
- **Caps / conflicts not to contradict:** **C5** — this record resolves the axis (category, per F-M05-3) and does not revive the dead difficulty config; it does not contradict M01 sequencing (the Stage-1 blocked order is topological acquisition, not an interleaving claim).

## Uncertainty

- **DP-transfer:** INC-I1 — interleaving is the **most transfer-relevant** mechanism (often measured *as* transfer) but is **unmeasured on DP problem-type discrimination specifically** (F-M05-2 limitation, F-TR-3). The discrimination-transfer analogy to DP pattern-recognition is promising but **provisional**.
- **Gaps provisional-on:** G1 (DP transfer, controlling); the **blocking-first-for-novices caveat is UNVERIFIED** (F-M05-2) — the readiness ordering rests on it and is provisional. Per framework Assumption #10, the staged ordering also carries the **creator-walkthrough** revision trigger inherited from §6.
- This decision is **provisional**; no interleaving effect is presented as established for DP.

## Rejected alternative

- **Difficulty-ordering (easy/medium/hard ramp) as the interleaving axis** — rejected: F-M05-3 finds **no research literature** treating difficulty sequencing as the interleaving manipulation; the benefit comes from discriminating between *problem types*. F-M05-5 shows the codebase's dead config names exactly this wrong axis (C5). Adopting it would ship a well-evidenced label over an unevidenced construct.
- **Interleaving first-exposure material** — rejected: mixing not-yet-unlocked high-load DP techniques risks exceeding working memory (F-DD-1, F-CL-2) and the F-M05-2 blocking-first caveat points to novices needing initial blocking; interleaving is confined to unlocked-material review.

## Enforceable control   (REQUIRED if learning-critical)

- **— (not learning-critical:** C5 is MEDIUM; wrong-axis or absent interleaving is an **efficiency/transfer loss, not a corruption of the mastery/retention signal** — it does not gate or falsify the scheduler signal, so mis-tuning degrades efficiency, not signal integrity.) The Stage-1→Stage-2 per-technique fluency gate is an **observable** signal whose integrity is backed by the M03/M04 (retrieval/spacing) and M10 (progression) controls that produce it, **not** by a new control authored here. Per framework §4.5, no enforceable-control coupling is required for a non-learning-critical mechanism.

## Traceability back-links

- Register findings consumed: F-M05-1, F-M05-2, F-M05-3, F-M05-4, F-M05-5, F-M01-4, F-DD-2.
- Conflicts addressed: **C5** (axis resolved = category; dead difficulty config rejected).
- INC markers carried: INC-I1 (DP transfer, open); INC-I3 (F-M05-5 reconciliation verdict — adding interleaving is a downstream build decision).
- LINK slots bound: **LINK-I1 = this DR (DR-M05)**; **LINK-I2 = per-technique fluency gate value + interleaved-discrimination threshold (UNBOUND — mastery-model sub-task).** Supersedes the illustrative §6 walkthrough (framework revision trigger (c)).

## Ledger status

- **provisional** — mirrored into `../adjudication/01_…` §C-PRAC (M05 row). Empirical (class-1/2) evidence only, moderate effect, DP transfer unmeasured; `settled`/`accepted` forbidden by the inherited firewall.
