# Package-Completeness Gate & Cold-Context Dry-Run Handoff

- **Program:** C005 · **Umbrella:** NEU-888 (OUT-7) · **Task:** NEU-925 · **Compiled:** 2026-07-13
- **Status: provisional. Verification artifact — asserts the package is complete and one-hop-recoverable; authors no decision.**
- **Verifies:** the acceptance scenario *"Given the assembled package, when the package-completeness gate and cold-context dry-run handoff run, then no element is unlabeled by the adjudication ledger and no undocumented context is required."*

---

## Part 1 — Package-completeness gate

The gate checks four properties. Each is a pass/fail assertion over the assembled package, evaluated here.

### Gate 1 — Every mechanism has a full one-hop unified view

For each of the ten mechanisms, `00_per-mechanism-index.md` must recover all seven axes (evidence+class · observable behavior · mastery signal · reconciliation verdict · uncertainty · rejected alternative · experiment evidence) plus a decision status.

| M | 7 axes present | Decision status | Enforceable control (if LC) |
| --- | --- | --- | --- |
| M01 | ✓ | provisional | — (not LC, rationale present) |
| M02 | ✓ | provisional | — (not LC, rationale present) |
| M03 | ✓ | provisional | ✓ massed-exclusion invariant |
| M04 | ✓ | provisional | ✓ inter-session gate |
| M05 | ✓ | provisional | — (not LC, rationale present) |
| M06 | ✓ | provisional | ✓ outcome gate + adversarial fixture |
| M07 | ✓ | provisional | — (not LC, rationale present) |
| M08 | ✓ | provisional | ✓ payload schema + adversarial fixture + rebuttal-invariance |
| M09 | ✓ | provisional | ✓ savings-floor invariant + provenance gate |
| M10 | ✓ | provisional | ✓ durability gate + single-success test + gate-decision |

**Gate 1: PASS.** Ten mechanisms × seven axes recovered; six learning-critical mechanisms carry a non-prose enforceable control; four non-learning-critical mechanisms carry the explicit not-applicable rationale.

### Gate 2 — No element is unlabeled by the adjudication ledger

Every element the package binds carries an explicit `settled / provisional / unresolved` status in `../adjudication/01_…` (now with the NEU-925 driving pass, §DRIVE + §SELF-CHECK-925).

| Element class | Count | All labeled? |
| --- | --- | --- |
| Mechanism decisions (M01–M10) | 10 | ✓ all provisional |
| Framework / framing rows (cognitive-load, desirable-difficulty, durable-vs-speed) | 3 | ✓ 1 provisional / 2 unresolved |
| Mastery-model integration + `LINK-I2` binding (§C-MASTERY) | 2 | ✓ both provisional |
| Conflicts C1–C6 (§CONFLICTS, with §RECON live-code verdicts) | 6 | ✓ all unresolved |
| Gaps G1–G8 (§GAPS) | 8 | ✓ 2 provisional (G4/G7) / 6 unresolved |

**Gate 2: PASS.** No element is unadjudicated-but-counted. The final tally (§DRIVE): **0 settled · 15 provisional · 14 unresolved** (illustrative superseded M05 walkthrough row excluded — it is not a binding element).

### Gate 3 — Both deferral classes are named, symmetric, and revision-triggered

`02_ships-without-evidence.md` must list the dogfooding-deferred decisions (creator unavailable) and the cap-overflow-deferred decisions symmetrically, each provisional with a revision trigger.

| Deferral class | Entries | Symmetric treatment |
| --- | --- | --- |
| Dogfooding-unavailable (§A) | D-1…D-6 | ✓ named, provisional, revision-triggered |
| Cap-overflow (§B) | O-1, O-2 | ✓ named, provisional, revision-triggered (symmetric to §A) |
| Untestable in-charter (§C) | U-1 | ✓ named, provisional, revision-triggered |

**Gate 3: PASS.** Both "ships without dogfooding evidence" (D-1…D-6) and "ships without cap-covered experiment evidence" (O-1, O-2) lists are present and symmetric; U-1 is the untestable residue.

### Gate 4 — No undocumented context is required (standalone / prompt-ready)

The package must be consumable as complete context without reconstructing intent. Every one-hop cell in `00_…` cites its authoritative source *inside this package*; the package README (`README.md`) fixes the reading order and the standing caveats; every inherited discipline (evidence classes, materiality rule, caps, privacy gate, status vocabulary) is referenced to its NEU-887/NEU-915/NEU-916 owner rather than assumed.

**Gate 4: PASS** — subject to the cold-context dry-run below, which tests the standalone claim empirically rather than by assertion.

**Completeness gate verdict: PASS (4/4).**

---

## Part 2 — Cold-context dry-run handoff (written audit)

**Method.** The spec forbids spawning a background child for the dry-run; instead this is an **explicit written audit** simulating a cold-context downstream chapter agent that has read *only this package* (no upstream conversation, no Linear issue, no repo history) and must recover a mechanism's full picture in **one hop** to do its own chapter work. Two mechanisms are simulated end-to-end; any hop that would force the agent outside the package is a **finding**.

The simulated agent is a **content/assessment chapter agent** for scenario 1 and a **curriculum chapter agent** for scenario 2 — the two hardest consumers (one learning-critical, one progression-gating).

### Dry-run 1 — content/assessment agent recovering M08 (Assessment)

**Task the agent gives itself:** "I am writing the assessment chapter. What grading behavior must I specify, on what evidence, is it binding, and what must I not get wrong?"

| Hop the agent needs | Recovered from | One hop? |
| --- | --- | --- |
| What is the decided grading behavior? | `00_…` M08 §Observable behavior: structured rubric-anchored payload → deterministic non-LLM mapper → 0–5; rebuttal-invariant; no binary collapse | ✓ |
| On what evidence, and how strong? | `00_…` M08 §Evidence+class: F-M08-3 (over-validation up to 71%, empirical), F-M08-4 (sycophancy 45.2%/84.5%), F-M08-2 (~80% agreement ceiling), F-M08-1 (binary-collapse discards scheduler input) | ✓ |
| Is it binding or open? | `00_…` M08 status line: `provisional`, learning-critical; "binding shape / open value" — behavior + control fixed, calibrated value → LINK-I2, C4 unresolved·non-downgradable | ✓ |
| What is the enforceable control I must honor? | `00_…` M08 control block: payload schema + adversarial fail-closed fixture (over-validation ≤ MM-T5) + rebuttal-invariance, at the `submit_answer` grade-derivation boundary | ✓ |
| What does the live code do today (so I know what changes)? | `00_…` M08 §Reconciliation: CONFLICT (C4) — agent-supplied quality, downward cap only, binary-collapse (L6/L7); over-validation behavior **not adopted** | ✓ |
| What number do I use provisionally? | `00_…` points to `../mastery-model/00_…` MM-T4 (A≥0.80, band 0.75–0.85), MM-T5 (V≤0.10, band 0.05–0.15), MM-T6 (0 upward flips) — one hop to the threshold table | ✓ (one hop, into a package file) |
| What is missing / what would change this? | `00_…` M08 §Uncertainty (INC-I1, G7) + `02_ships-without-evidence.md` D-6 (MM-T4/T5 dogfooding calibration) + F-EXP-03 shows the mapper is mechanically realizable | ✓ |

**Finding:** the provisional threshold values (MM-T4/T5/T6) live in the mastery-model file, not in `00_…` itself — the index gives the MM-T *ids* and *bands* inline and points one hop to the calibration table. This is **within the package** and is a single, sign-posted hop, not a reconstruction of intent. **No missing hop; standalone claim holds for M08.**

### Dry-run 2 — curriculum agent recovering M10 (Progression)

**Task the agent gives itself:** "I am sequencing the curriculum. When may a dependent unlock, what gate must I respect, is it settled, and what is the live gap I am closing?"

| Hop the agent needs | Recovered from | One hop? |
| --- | --- | --- |
| When does a dependent unlock? | `00_…` M10 §Observable behavior: only when the prerequisite's mastery signal crosses a durability gate, server-evaluated from persisted multi-observation history; single success stays locked; speed never unlocks | ✓ |
| On what evidence? | `00_…` M10 §Evidence+class: F-M10-1 (90% bar), F-M10-2 (BKT P≥0.95), F-M10-3 (multi-observation), F-M10-4 (false precision is a failure), F-M10-5 (live gate — corrected) | ✓ |
| Is the bar settled? | `00_…` M10 status: `provisional`; bar value → LINK-I2 (MM-T8 posterior ≥0.90, band 0.85–0.95); C1 unresolved·non-downgradable; **rejects `repetitions>0`** | ✓ |
| What is the live gap? | `00_…` M10 §Reconciliation: GAP (C1) — retrievability-reteach at 0.5, no fail-closed unlock lock (L4/L5); single-point retrievability, no gate-decision; too-weak-gate substance **not adopted** | ✓ |
| What control must the build honor? | `00_…` M10 control block: server-side durability gate + fail-closed single-success regression test + observable gate-decision, at the prerequisite-unlock path | ✓ |
| How does this compose with assessment (does the gate trust the grade)? | `00_…` M10 control notes C4 as a precondition; `00_…` cross-cutting pointer + mastery-model §4 composition invariant: Gate C reads Gate B reads the fidelity precondition — a weak grade cannot be laundered into an unlock | ✓ (composition stated in-package) |
| What experiment evidence exists / what is missing? | `00_…` M10 §Experiment: F-EXP-05 (7/7 ×2, C1 GAP verified) + §Uncertainty INC-I1/G5 + `02_…` D-1 (transfer) | ✓ |

**Finding:** the M08↔M10 dependency (a progression gate is only as trustworthy as the grade it reads) is the one place a naive index could force a cross-mechanism hop. The index surfaces it inline in the M10 control block ("+C4 precondition") and again in the cross-cutting pointer to the mastery-model composition invariant — so the curriculum agent recovers the coupling **without leaving the package**. **No missing hop; standalone claim holds for M10.**

### Dry-run verdict

Both simulated cold-context agents recovered their mechanism's full binding picture — behavior, evidence, status, control, live gap, provisional number, and missing evidence — using only this package, in one signposted hop per axis. The **only** hops that leave `00_…` land inside sibling package files (`../mastery-model/00_…`, `../reconciliation/00_…`, `02_ships-without-evidence.md`), each named at the point of use. **No undocumented external context is required. Cold-context dry-run: PASS.**

**Documented residual (not a missing hop — a property of the evidence base):** every recovered picture terminates in the same two open conditions — `INC-I1` (DP effectiveness unmeasured) and the `LINK-I2` calibrated value — which are **stated at every cell**, not hidden. A downstream agent is never surprised by them; it is told, per axis, that the shape is binding and the number/effectiveness is open.

---

## Self-check

- Completeness gate run over the assembled package: **4/4 PASS** (one-hop views, full ledger labeling, symmetric deferral lists, standalone/prompt-ready).
- Cold-context dry-run performed as a written audit (no background child), simulating two downstream agents over two mechanisms (M08 learning-critical assessment, M10 progression-gating), each across all recovery axes: **PASS**, no missing hop.
- No decision, threshold, verdict, or experiment authored here; this file verifies the assembly, it does not extend it. **PASS.**
