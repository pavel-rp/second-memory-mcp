# DR-M01 — Sequencing

- **Record id / mechanism:** DR-M01 · Sequencing · cluster §C-ACQ · author NEU-918 · 2026-07-13
- **Learning-critical:** no  (source: template §3 — ordering mis-tuning degrades acquisition efficiency; it does not corrupt or gate the mastery/retention signal. C1 lives in M10/M09 gating, not M01 ordering.)

Authored against `00_decision-record-template.md` (§1 fields, §2 enforceable-control rule, §5 conformance checklist). Evidence: `../mechanisms/M01_sequencing.md`, register `../traceability/01_instructional-evidence-register.md` §C-ACQ · M01, framing `../02_cognitive-load-desirable-difficulty-transfer.md`, tension logic `../framework/00_durable-vs-speed-framework.md`. **Status: provisional. Settles nothing.**

## Decision (observable behavior)

The system presents DP concepts in **prerequisite-first order** and advances a learner to a dependent concept only after the learner has **demonstrated** — not merely been exposed to — the prerequisite. Concretely, a reviewer or test can watch three observable behaviors:

1. **Prerequisite-before-dependent ordering.** For any concept pair where B declares A as a prerequisite (chunk→chunk prerequisite edge, F-M01-5), A is taught in an earlier position than B in the learner's teaching order. A held-out ordering can be checked against the prerequisite graph: no dependent is scheduled ahead of an unmet prerequisite.
2. **Stale-prerequisite re-injection.** When a previously-taught prerequisite has decayed below its retrievability threshold, it is re-surfaced **before** its dependent is next taught, rather than the initial teaching order being rebuilt (matches the deployed "review micro-interleaves prerequisite skills" pattern, F-M01-4; existing behavior F-M01-5).
3. **Advance-on-demonstration, not exposure.** The transition from prerequisite to dependent is conditioned on a demonstrated-competence signal (the *strength/threshold* of that gate is owned by M10 progression / the mastery-model sub-task, not decided here), never on a single exposure or `repetitions > 0`.

Sequencing here governs **order**; it does **not** assert a monotone easy→medium→hard difficulty ramp as the ordering principle, and it takes **no** position on the interleaving axis (that is C5, owned by NEU-919).

## Cited evidence + class

- **F-M01-1** [class 1, theoretical/CLT] — prerequisite-first ordering manages **intrinsic** load by reducing the number of novel interacting elements a novice holds at once; supports behavior 1. (CLT prescribes managing element interactivity; it fixes no specific DP order — see Uncertainty.)
- **F-M01-2** [class 1, framework / quasi-experimental (Bloom)] — mastery-learning traditions sequence on *demonstrated* prerequisite competence, not exposure; supports behavior 3. (The 90% figure is illustrative practice, not a DP-specific or causally-optimized threshold; the gate value is deferred, not asserted.)
- **F-M01-4** [class 1, practitioner report — directional] — deployed systems micro-interleave prerequisite review into later sessions rather than reordering initial teaching; supports behavior 2. (Non-academic source; directional only.)
- **F-M01-5** [class 2, code-fact] — the existing system already encodes prerequisite edges, topological+author ordering, and stale-prerequisite (R<0.5) re-injection; supports **compatibility** of behaviors 1–2 with the current engine. *Class-2 supports compatibility only — it is not a pedagogical endorsement.*
- **F-M01-3** [class 1, review / absence-of-evidence] — difficulty-level ("easy→hard") ordering is **not** the evidenced interleaving construct; grounds the decision's explicit refusal to treat a difficulty ramp as the ordering principle (see Rejected alternative).
- Framing carried: **F-CL-1/2** [class 1, theoretical] (load partition), **F-DD-2** [class 1, mechanistic] (difficulty forfeits immediate success), **F-TR-3** [class 1 / inherited-risk] (DP transfer unmeasured).

*No causal claim is made that a specific DP concept order improves DP problem-solving transfer — no causal finding supports that, and none is cited for it (see Uncertainty).*

## Mastery signal

Objective met when the learner **correctly derives or applies the dependent concept** given only the prerequisite scaffold — i.e. the demonstrated-competence signal that licenses the prerequisite→dependent transition fires. The **observable signal shape** is stated here (successful unaided application of the prerequisite in the dependent's context); its **calibrated threshold/value is UNRESOLVED → LINK-I2** (mastery-model sub-task; jointly bounded with M10 progression). No threshold value is invented in this record (template field 4 / no-invented-value).

## Constraints

- **Cognitive-load / desirable-difficulty:** Sequencing is primarily an **intrinsic-load** management lever — prerequisite-first ordering lowers element interactivity for novices (F-M01-1). It removes **no** extraneous load (that is M02's lever) and spends **no** germane load of its own. **Desirable difficulty is deliberately preserved at the boundary:** the decision does **not** over-protect by advancing only after a prerequisite is over-practiced — doing so would forfeit the desirable difficulty of retrieving a partially-consolidated prerequisite (M03/M04, F-DD-2). It is preserved by conditioning the advance on *demonstrated* competence (behavior 3), not on saturation.
- **Privacy gate:** no class-6 operational-log signal is used by this decision; aggregate-only gate is therefore not engaged (stated explicitly, not omitted).
- **Caps / conflicts not to contradict:** **C1** (prerequisite mastery gate — `repetitions>0` vs high/probabilistic bar; characterization flagged stale, HIGH, non-downgradable) is **not resolved here**; behavior 3 defers the gate *strength* to M10 / reconciliation and must not pre-empt it. **C5** (interleaving axis) is not resolved here; the decision stays off the difficulty-ramp-as-interleaving construct (F-M01-3). DP-transfer cap (G1/INC-I1) carried below.

## Uncertainty

- **DP-transfer: INC-I1** — no cited source measures a specific DP concept ordering against DP problem-solving transfer (F-M01-1 limitation; F-TR-3). The claim that a particular prerequisite graph produces better *DP mastery* is unmeasured; DP-specific ordering effectiveness stays **provisional**. What would settle it: in-domain (class-7 / measured) DP-ordering-vs-transfer comparison.
- **Gaps provisional-on: G1** (DP-domain transfer unmeasured, controlling). The demonstrated-competence *threshold* is unmeasured for DP (deferred to LINK-I2, jointly with M10).
- This record presents **no** DP-domain sequencing effectiveness as established.

## Rejected alternative

- **Exposure-based advancement** (teach a prerequisite once, advance the dependent on first exposure / `repetitions>0`) — **rejected** because F-M01-2 (mastery-learning sequences on *demonstrated* competence, not exposure) and because F-M01-6/C1 flags one-success gating as stale. Exposure-based advancement would let a dependent be taught atop an unconsolidated prerequisite, inflating downstream failure.
- **Monotone easy→medium→hard difficulty ramp as the ordering principle** — **rejected** because F-M01-3 (a difficulty ramp is *not* the evidenced construct; it conflates sequencing with interleaving, C5) — adopting it here would silently pre-empt a conflict this cluster does not own.

## Enforceable control   (REQUIRED if learning-critical)

- **— (not learning-critical:** sequencing mis-tuning degrades acquisition *efficiency*, not the integrity of the mastery/retention signal; the prerequisite-mastery gate that *could* corrupt the signal (C1) lives in M10 progression / M09 remediation, not in M01 ordering — template §3. A downstream reviewer can see ordering errors from output; they do not silently falsify a grade. This mechanism therefore carries the field with an explicit not-applicable rationale, per template §2.**)**

## Durable-mastery-vs-contest-speed (framework `../framework/00_…`)

**Immateriality certification (§2.1-B) — trigger T2 fails.** No register finding of **causal or directional** type evidences an opposing durable-vs-speed gradient on the sequencing/ordering dial. The M01 evidence base is intrinsic-load management (F-M01-1) and demonstrated-prerequisite ordering (F-M01-2); neither pits durable DP mastery against contest speed. F-M01-3 is an **explicit absence-of-evidence** for treating difficulty-ordering as a tradeoff axis. Moreover, the only defensible directional reading has the gradients **aligned**, not opposing: a durable prerequisite schema built first is the *precondition* for durable-then-fast performance, since fast-but-shallow is fragile (F-TR-2) — so prerequisite-first ordering serves both goals rather than trading them. Any speed-first-vs-foundations-first ordering tradeoff is therefore **latent**, recorded as a gap (G1 / INC-I1 — DP-domain unmeasured), and is **not** resolved with a fabricated tradeoff (no-invented-value; framework A2/A4-safe). No material-tension resolution is authored because none is warranted; this is a recorded, evidenced immateriality, not a silence.

## Traceability back-links

- **Register findings consumed:** F-M01-1, F-M01-2, F-M01-3, F-M01-4, F-M01-5; F-CL-1/2, F-DD-2, F-TR-3.
- **Conflicts addressed (not resolved):** C1 (deferred to M10 / reconciliation — gate strength), C5 (deferred to NEU-919 — interleaving axis).
- **INC markers carried:** INC-I1 (DP transfer, open).
- **LINK slots bound:** **LINK-I1 = this record (DR-M01)** — INC-I2 (missing `DR-M01`) is thereby resolved for M01. LINK-I2 = demonstrated-competence threshold (deferred, jointly with M10 mastery-model).

## Ledger status

- **provisional** — mirrored into `../adjudication/01_instructional-decision-ledger.md` §C-ACQ (M01 row). Empirical decision resting on class-1/2 evidence with DP transfer unmeasured (class-7 absent project-wide); `settled`/`accepted` is firewall-reserved and **not** claimed. Revision trigger: in-domain DP-ordering measurement (INC-I1), or the M10/reconciliation verdict on the C1 gate strength.
