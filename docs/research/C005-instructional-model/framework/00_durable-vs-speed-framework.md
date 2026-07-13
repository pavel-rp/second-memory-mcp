# Durable-Mastery-vs-Contest-Speed Decision Framework

**Program:** C005 · **Umbrella:** NEU-888 (OUT-3) · **Task:** NEU-917 · **Depends on:** NEU-915 synthesis (this package) and NEU-916 scaffolding (this package) · **Compiled:** 2026-07-13

**What this is.** The reusable **decision logic** every mechanism-decision sub-task (NEU-918…921) applies when a mechanism's pursuit of *durable dynamic-programming mastery* and its pursuit of *competitive-programming speed* pull apart. It defines (§2) when that tension is **material**, (§3) the shape of a **staged** resolution (a sequence over time) versus a **measured** resolution (a blend weighted by a signal), (§4) the **evidence and trace requirements** each resolution must satisfy, and (§5) the invariant that guarantees no mechanism can silently optimize one goal. §6 is a worked walkthrough on one contested mechanism; §7 is the framework's own adversarial review.

**What it is not — it makes no mechanism-specific decision.** This framework prescribes *resolution logic*, not mechanism behavior. It authors **no** `DR-Mxx` decision record, settles **no** mechanism, and picks **no** threshold, weight, or interleaving axis. The ten mechanism decisions are owned by the cluster sub-tasks (NEU-918…921, per `../SCAFFOLDING.md`); the §6 walkthrough is a *demonstration of applying this framework*, not a binding decision. This task flips **nothing** to `settled` in the ledger.

**Inheritance (referenced, never rebuilt).** Evidence classes and claim discipline: `../01_evidence-labeling.md` → NEU-887 `../../C005-product-foundation/01_evidence-taxonomy.md`. Record shape and the enforceable-control rule: `../decision-records/00_decision-record-template.md`. Finding ids (`F-*`), conflicts (`C1–C6`), gaps (`G1–G8`): `../03_synthesis.md` and `../traceability/01_instructional-evidence-register.md`, reused verbatim. Cross-cutting framing (cognitive load · desirable difficulty · transfer): `../02_cognitive-load-desirable-difficulty-transfer.md`. Status vocabulary and the settled-forbidden firewall: `../../C005-product-foundation/adjudication/00_adjudication-method-and-rule-versions.md`.

---

## 1. The two goals and why they pull apart

The audience is **fixed feature-wide** (NEU-888 constraint): mastery-oriented programmers with basic programming/algorithm competence who ultimately need competitive-programming **breadth and speed**. Both goals are therefore always in play; the framework never resolves the tension by narrowing the audience.

| Goal | Operational meaning (observable) | Evidence axis it reads |
| --- | --- | --- |
| **Durable DP mastery** | Weeks later, on a *structurally novel* problem, the learner recognises DP applicability, derives the recurrence / state / transition, and justifies correctness. | Long-term **retention & transfer**. |
| **Contest speed** | Under a clock, the learner *rapidly* recognises a standard formulation, recalls it at low latency, and sustains high throughput. | **Immediate performance / fluency**. |

**Why the goals oppose on the same dial.** The learning-science base establishes that difficulty which builds durability *depresses immediate performance*: "lowering difficulty (e.g. to recognition) protects success but forfeits the largest potential gain" (F-DD-2 `[class 1, mechanistic]`), and desirable difficulties improve long-term retention precisely by making the moment harder (F-DD-1 `[class 1, causal-as-principle]`). Conversely, retention-optimised mechanics do **not** automatically yield problem-solving transfer (F-TR-2 `[class 1, empirical, magnitude UNVERIFIED]`), so a mechanism can be immediate-fluency-optimal yet leave the schema shallow. The controlling uncertainty (F-TR-3 `[class 1 / inherited-risk]`, `INC-I1`, gap `G1`): **none of this is measured on dynamic-programming problem-solving** — durable→speed transfer for DP is an analogy, not a result. Every resolution below inherits that uncertainty and is provisional because of it.

---

## 2. When is the tension *material*? (trigger rules)

A mechanism's durable-vs-speed tension is **material** — and therefore must be *resolved* rather than silently optimised — iff **all three** triggers hold. Each trigger is stated so a reviewer can check it against the register.

- **T1 — Opposing gradient.** The mechanism exposes a tunable dial *d* (fading rate, interleaving degree, retrieval-difficulty tier, hint depth, spacing interval, mastery-gate strictness, attempt budget). There is a direction of *d* that **increases** the durable-mastery objective and the **same** direction that **decreases** the contest-speed objective (or vice versa): the two goals' gradients on *d* have **opposite sign**. *Fails if* every feasible move of *d* improves (or leaves unchanged) both goals — aligned gradients, no tradeoff.
- **T2 — Evidenced, non-negligible.** The opposing effect on **at least one** goal is supported by ≥1 register finding (`F-*`) of **causal or directional** type, class-labeled — not merely asserted. *Fails if* the opposing effect is only conjecture; then the tension is **latent** and is recorded as a **gap**, never resolved with a fabricated tradeoff.
- **T3 — Both goals in-objective.** Both objectives are actually pursued for this mechanism given the fixed audience. Because the audience is fixed, this holds whenever the mechanism touches learner performance at all; the trigger's job is to force the author to **state which phase/objective each goal serves**, not to assume it.

**Material ⟺ T1 ∧ T2 ∧ T3.**

### 2.1 The no-third-exit rule (the anti-silence device)

For **every** mechanism that exposes a durable-vs-speed dial, its decision record must contain **exactly one** of:

- **(A) a material-tension resolution** — staged (§3.1) or measured (§3.2) — citing evidence for **both** goals (§4.1); or
- **(B) an immateriality certification** — naming **which** trigger (T1, T2, or T3) fails and citing the `F-*` finding or `G*` gap that justifies the failure.

Any record that advances one goal without (A) or (B) is **non-conformant** — it is precisely the *silent single-goal optimisation* the charter forbids. **There is no third exit.** Even "no tension here" is a *recorded, evidenced* statement (B), not a silence. This is the property §7's adversarial review attacks and §5 states as the invariant.

---

## 3. Staged vs measured resolution logic

Both resolution shapes are legitimate; the framework chooses between them by the structure of the two goals, not by preference.

### 3.1 Staged resolution — sequence over time
`R_staged` = an **ordered sequence of phases**, each phase optimising one goal (or a different blend), advanced by **stage-transition triggers** — *observable gate signals* that move the learner from phase to phase. It serves goals in a **readiness / prerequisite** relation: e.g. *durability first* because contest speed built on a shallow schema is fragile (a fast-but-shallow learner has no durable schema to be fast *about*, F-TR-2), then a *speed* phase once a readiness signal fires. A staged resolution is defined by: the ordered phases, each phase's goal, and the **observable** gate signal (with its calibrated value possibly deferred to `LINK-I2`).

### 3.2 Measured resolution — weight by a signal
`R_measured` = a **simultaneous blend** weighting the two goals by a **continuous signal** at each item/session, the weight **shifting as the signal moves**. It serves goals that **coexist at every moment** with no clean ordering, or whose optimal balance is **per-item** and better tracked by a live measure than by a phase gate. A measured resolution is defined by: the signal, the weighting function (direction and monotonicity), and how the weight shifts with the signal.

### 3.3 The choice rule
1. Is there a defensible **readiness/prerequisite ordering** (one goal's pursuit is fragile or wasteful until the other clears a bar) **and** an **observable discrete gate signal** for that bar? → **staged**.
2. Else, do the goals **coexist continuously** with a **per-item/graded** optimal balance, **and** is there an **observable continuous signal** to weight by? → **measured**.
3. Else — neither a gate nor a graded signal exists, or the ordering is asserted without evidence → **UNRESOLVED**: defer with an explicit `INC`/`LINK` marker **naming the missing signal**. Do **not** invent a threshold or a weight (no-invented-value, inherited NEU-887 discipline). A deferred resolution *still satisfies the no-third-exit rule* as long as it is recorded as **(A)-deferred**, never silently collapsed to one goal.

---

## 4. Evidence & trace requirements every resolution must satisfy

Written against the decision-record template (`../decision-records/00_…`), a durable-vs-speed resolution is **conformant** iff:

1. **Dual-goal evidence (template field 3).** It cites ≥1 register `F-*` finding for the **durable-mastery** side **and** ≥1 for the **contest-speed** side, each with its class. A resolution citing evidence for only one goal **fails** — that is a silent single-goal optimisation by omission. Causal behavioural claims cite causal findings; class-2 `[code-evidence]` supports compatibility only, never pedagogical endorsement (inherited firewall).
2. **Observable trigger / signal (template fields 2 & 8).** The stage-gate (staged) or weighting signal (measured) is stated as an **observable/testable** signal. "Eventually" or "when ready" with no signal is non-conformant. The *calibrated value* may be `UNRESOLVED → LINK-I2` (mastery-model sub-task); the signal's **shape and enforcement point** may not be deferred.
3. **DP-transfer carry (template field 6).** `INC-I1` / `F-TR-3` is carried: durable↔speed transfer for DP is unmeasured (`G1`), so the resolution is **at most provisional** and may never present DP durability *or* DP speed transfer as established.
4. **Trigger evaluation recorded (template field 5).** T1/T2/T3 pass/fail is stated with the cited finding (materiality certificate) or the failed-trigger justification (immateriality certificate, §2.1-B).
5. **Learning-critical coupling (template field 8).** If the mechanism is learning-critical (M03, M04, M06, M08, M09, M10 — template §3), the resolution's gate/signal is backed by that mechanism's **enforceable control**: the framework *feeds* field 8, it does not replace it, and the resolution must not contradict the mechanism's cited conflict (`C1–C6`).
6. **Ledger mirror (template field 10).** Status is mirrored into `../adjudication/01_…`; empirical resolutions are **≤ `provisional`** (class-7 absent project-wide) — **never `settled`**.

---

## 5. The framework's guarantee (invariant)

> **Anti-silent-single-goal invariant.** Every mechanism that exposes a durable-vs-speed dial exits with either (A) a material-tension resolution citing evidence for **both** goals, or (B) an immateriality certification naming the failed trigger and its evidence. No record advances one goal without (A) or (B); such a record is non-conformant and detectable at authoring time.

The invariant is enforced by the conjunction of §2.1 (no third exit), §4.1 (dual-goal evidence), and §4.2 (observable trigger). §7 attempts to break it.

---

## 6. Worked walkthrough — M05 Interleaving (staged; illustrative & provisional)

**Scope guard (read first).** This walkthrough **demonstrates the framework**; it produces an **illustrative, non-binding, provisional** resolution. It does **not** author `DR-M05`, does **not** settle M05, and does **not** pick the interleaving axis (that is `C5`, owned by **NEU-919**). Only the §C-FRAME ledger row is touched by NEU-917. M05 is chosen because interleaving is the paradigmatic durable-vs-speed case: it *reliably depresses immediate performance while improving long-term retention/transfer* — the two goals literally invert on one dial.

**Dial.** *d* = interleaving degree (blocked practice per DP technique ↔ interleaved practice across techniques).

**Trigger evaluation.**
- **T1 — Opposing gradient: PASS.** Dialing *d* **up** (more interleaving) increases durable discrimination/transfer (F-M05-1 `[class 1, causal, d=1.34]`; F-M05-2 `[class 1, meta-analytic, g=0.42]`) but **decreases** immediate fluency/throughput — interleaved practice feels slower and performs worse in the moment (F-M05-4 `[class 1, causal-directional]`, metacognitive illusion; F-DD-2 `[class 1, mechanistic]`, difficulty forfeits immediate success). Opposite-sign gradients on the same dial.
- **T2 — Evidenced, non-negligible: PASS (asymmetric).** Durable side is causal (F-M05-1/2); the immediate-cost side is directional (F-M05-4, F-DD-2). Evidenced on both sides; the speed side is directional-not-magnitude → feeds provisional status.
- **T3 — Both goals in-objective: PASS.** The CP audience needs durable technique-*selection* (which DP pattern applies — durability) **and** fast in-contest recognition (speed). Durable side serves the *learning* phase; speed side serves the *contest* phase.

→ **Material.** A resolution is required (no immateriality certificate available).

**Shape choice (§3.3).** Is there a readiness ordering + an observable discrete gate? Interleaving's discrimination benefit presupposes the learner already holds minimal per-technique schemas to discriminate *between* — the "blocking-first for novices" caveat (F-M05-2 limitation, **UNVERIFIED**; cf. F-M01-3 `[class 1, absence-of-evidence]`). That is a readiness ordering, and a **per-technique fluency signal** (accuracy/latency per DP technique crossing a bar) is an observable discrete gate → **branch 1 → staged**.

**Staged resolution (illustrative).**
- **Stage 1 — blocked acquisition per technique** (low *d*; speed-friendly baseline fluency), **gated by** an observable per-technique fluency signal (per-technique accuracy/latency ≥ bar). Gate **threshold value = `UNRESOLVED → LINK-I2`** (mastery-model owns the calibration; the framework fixes the *shape*, not the number).
- **Stage 2 — interleaved consolidation across techniques** (high *d*; durable discrimination/transfer).

**Conformance against §4.** Dual-goal evidence: durable = F-M05-1/2; speed = F-M05-4 / F-DD-2 ✓ (§4.1). Observable gate = per-technique fluency signal, value deferred to `LINK-I2` ✓ (§4.2). DP-transfer carried: `INC-I1` / F-TR-3 — DP interleaving transfer *and* the immediate-cost magnitude are unmeasured ✓ (§4.3). Trigger evaluation recorded above ✓ (§4.4). M05 is **not** learning-critical (C5 MEDIUM), so no enforceable-control coupling is required; the resolution must not contradict `C5` — it does not, because it takes **no** position on the interleaving *axis*, only on the durable-vs-speed *sequencing* ✓ (§4.5). Ledger mirror: §C-FRAME, **provisional**, not settled ✓ (§4.6).

**Why provisional — and the explicit revision trigger (charter Assumption #10).** The readiness ordering rests on the **UNVERIFIED** blocking-first caveat, and DP transfer is unmeasured. As an autonomous agent, the **creator is not available in this run** to walk the staged resolution through; per Assumption #10 the walkthrough is performed **analytically** and the resolution ships **provisional pending creator walkthrough**. It is to be revised when **any** of:
- **(a)** the creator walkthrough validates or rejects the blocking-first → interleave ordering *(primary trigger — pending creator)*;
- **(b)** in-domain DP interleaving transfer / immediate-cost measurement lands (`INC-I1` / `G1`), converting directional evidence to measured;
- **(c)** **NEU-919** authors the binding `DR-M05`, which **supersedes** this illustrative resolution (this walkthrough does not author `DR-M05`).

---

## 7. Framework adversarial self-review (always runs — non-deferrable)

Per the charter, the framework's own adversarial review is **never deferrable** and runs **regardless of creator availability**. It attempts to construct a *silent single-goal outcome* that passes the framework; each attempt must be caught.

| # | Attack (attempted silent single-goal exit) | Caught by |
| - | --- | --- |
| A1 | Author optimises one goal and ignores the other, saying nothing. | §2.1 no-third-exit + §4.1 dual-goal evidence: a resolution citing evidence for only one goal is non-conformant. |
| A2 | Author declares the tension "immaterial" to dodge resolving it. | §2.1-(B): immateriality requires naming **which** trigger (T1/T2/T3) fails **and** citing the `F-*`/`G*` that justifies it. A bare "immaterial" is non-conformant. |
| A3 | Author invents a signal / threshold to fake a measured resolution. | §3.3-3 + §4.2 + no-invented-value: the signal must be **observable**; an unknown calibrated value is **deferred** (`UNRESOLVED → LINK-I2`), never fabricated. |
| A4 | Author claims durable→speed DP transfer is established, justifying a single stage. | §4.3 mandatory `INC-I1` / F-TR-3 carry: DP transfer is unmeasured (`G1`); the resolution is provisional and may not assert established DP transfer. |
| A5 | Staged resolution with no gate — just "speed comes later". | §3.1 + §4.2: staged **requires** an observable transition trigger; "later" is not a signal → non-conformant; author must supply a signal or defer as **(A)-deferred** (§3.3-3), not collapse to one goal. |

**Result:** every attempted silent single-goal exit is caught by an existing rule; the framework admits **no** path that advances one goal without a resolution (A) or a certified-immateriality (B). **PASS.** The §6 walkthrough itself was run through this review: it cites both goals, its gate is observable with a deferred value, it carries `INC-I1`, and it is marked provisional — **no silent single-goal outcome**.

---

## 8. Ledger & traceability touch-points (what NEU-917 changes)

- **`../adjudication/01_instructional-decision-ledger.md` §C-FRAME** — the **Durable-mastery-vs-contest-speed** row is updated: `INC-I4` (the framework) is now **bound** to this file; decision status moves `unresolved → provisional` (the framework is delivered but rests on provisional transfer evidence and carries a provisional walkthrough); a walkthrough-provisional note records the M05 illustrative resolution and its Assumption #10 revision trigger. **Nothing is flipped to `settled`.** The `cognitive-load framing` and `desirable-difficulty framing` rows (framing *evidence*) are **not** changed; the per-mechanism M05 row in §C-PRAC is **not** touched (owned by NEU-919).
- **`INC-I4`** (`../traceability/00_trace-extension-schema.md` §4) — its owning artifact, the durable-mastery-vs-contest-speed framework, now exists (this file). `INC-I1` (DP measurement) remains open.
- **`../SCAFFOLDING.md`** — a pointer to this framework is added under the cluster map.
- **No `F-*` finding is re-classed; no gap is filled with an invented value; no `DR-Mxx` is authored.**

---

## 9. Acceptance-scenario self-check (NEU-917)

- **Scenario 1** — *Given a mechanism where durable mastery and contest speed conflict, applying the framework yields a staged or measured resolution with an explicit trigger and cited evidence.* → §6 applies the framework to M05 and yields a **staged** resolution with an **observable per-technique fluency gate** and evidence cited for **both** goals (durable F-M05-1/2; speed F-M05-4 / F-DD-2). **PASS by demonstration.**
- **Scenario 2** — *Given the creator available … the resolution is explicit and traceable, no silent single-goal.* → The creator is **not available** in this autonomous run; this scenario is superseded by Scenario 3 under Assumption #10. (Recorded, not silently skipped.)
- **Scenario 3** — *Given the creator unavailable, the walkthrough defers and the affected resolution ships provisional with an explicit revision trigger (Assumption #10), while the adversarial review still runs and still finds no silent single-goal outcome.* → §6 ships the M05 resolution **provisional pending creator walkthrough** with an explicit three-part revision trigger; §7 adversarial review **ran** and found **no silent single-goal exit** (PASS). **PASS.**
- **Constraint checks** — every resolution's evidence is labelled with one of the seven classes (§1, §6); the framework prescribes resolution logic, **not** mechanism-specific decisions (§ "What it is not", §6 scope guard); no ledger status is `settled` (§8); the framework's own adversarial review is not deferred (§7). **PASS.**
