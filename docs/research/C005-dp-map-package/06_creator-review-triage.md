# 06 — Creator review triage

**Model:** claude-opus-5
**Date:** 2026-08-12
**Generator:** `generator/triage-difficulty.mjs` (re-runnable, no install step)
**Status:** this document decides nothing. It narrows what the creator is asked to decide.

`02_authoring-requirements.md` §4.3 records 179/179 non-root nodes at
`creator_review: "deferred-provisional"` across six dimensions, owner **the creator**. That is
roughly a thousand judgements. This narrows it to **two rule decisions and twenty nodes.**

## 1. Two of the six dimensions carry no judgement

Mechanically verified over all 179 nodes, no exceptions:

| Dimension | Identity | Holds |
| --- | --- | ---: |
| `progression_stage` | `PS-min(prerequisite_depth, 4)` | 179/179 |
| `entry_gate` | `prerequisite_depth === 1 ? gate-a : gate-c` | 179/179 |

`prerequisite_depth` is **class MD** — machine-derived, explicitly outside the creator review,
routed to the integrity validator. A dimension that is a total function of it carries no
independent information, whatever class it is filed under.

`entry_gate` was already known to be derived — `F-943-3`, *"a deterministic function of
`progression_stage` — NO independent information."* **That `progression_stage` is itself derived
was not recorded anywhere.** `02_` §4.2 says only that `PS-2/3/4` granularity is "UNGROUNDED",
which understates it: `PS-4` is a saturation bucket holding **107 of 179** nodes, meaning
"depth ≥ 4".

**So the creator is not asked for 179 `progression_stage` judgements.** They are asked one
question: *is "stage = prerequisite depth, capped at 4" the right rule, or should stage carry
pedagogical judgement that depth cannot express?* Answer it once and the dimension is settled or
re-opened wholesale.

The same question, separately, for `entry_gate` — where the answer is likely that a field with
two instantiated values out of five (`gate-b`, `gate-d`, `gate-e` are used by no node) should be
dropped rather than reviewed.

**This routes to the integrity validator, not to `CR-1`.** A creator judgement that a stage is
wrong is a judgement that a *depth* is wrong, and depth is machine-derived.

## 2. Twenty nodes the map contradicts itself about

The five load dimensions do carry judgement — 119 distinct vectors across 179 nodes is real
resolution, not copy-paste. So the triage looks for **internal inconsistency** rather than
opinion: a node rated no harder than something it depends on, or far from its peers.

Nodes are compared **only against prerequisites of the same skill type.** An `implementation`
node rated lighter than the `strategic` node whose recurrence it implements is expected, not
anomalous; 28 such pairs are suppressed and listed under `--json` rather than dropped.

Vector order is `[state_formulation, transition_derivation, proof_obligation, implementation, recognition]`.

| # | Node | Type | Vector | Why it is flagged | Your call |
| ---: | --- | --- | --- | --- | --- |
| 1 | `cl-1.lcs-dp` | knowledge | `[3,2,1,2,2]` | Rated no harder than **both** its prerequisites, `edit-distance-dp` and `linear-sequence-dp-2d`, each `[3,3,1,2,2]` | |
| 2 | `cl-1.diagnose-empty-subarray-and-all-negative-boundary` | debugging | `[1,1,1,2,4]` | ≤ `diagnose-wrong-state-transition-base-case` `[2,3,1,3,4]` on every axis | |
| 3 | `cl-1.difference-array-and-range-update` | knowledge | `[1,1,1,2,3]` | ≤ `range-aggregate-by-difference` `[1,2,2,2,3]` | |
| 4 | `cl-1.formulate-1d-sequence-dp` | strategic | `[2,2,1,1,3]` | ≤ `select-linear-dp-pattern` `[3,2,1,1,3]` | |
| 5 | `cl-1.formulate-edit-distance-recurrence` | strategic | `[3,3,1,1,3]` | ≤ `formulate-2d-sequence-dp` `[3,3,1,2,3]` | |
| 6 | `cl-1.formulate-grid-path-dp` | strategic | `[2,2,1,2,3]` | ≤ `formulate-2d-sequence-dp` `[3,3,1,2,3]` | |
| 7 | `cl-1.grid-path-dp` | knowledge | `[2,2,1,2,2]` | ≤ `linear-sequence-dp-2d` `[3,3,1,2,2]` | |
| 8 | `cl-1.maximum-subarray-kadane` | knowledge | `[2,2,1,1,2]` | ≤ `best-ending-at-index-state-pattern` `[2,2,1,1,3]` | |
| 9 | `cl-1.prefix-aggregate-recurrence` | knowledge | `[1,1,1,1,2]` | ≤ `linear-sequence-dp-1d` `[1,2,1,1,2]` | |
| 10 | `cl-1.prove-kadane-recurrence` | proof | `[2,2,3,1,2]` | ≤ `prove-recurrence-correctness` `[2,3,3,1,2]` | |
| 11 | `cl-1.prove-prefix-state-sufficiency` | proof | `[2,2,3,1,2]` | ≤ `prove-recurrence-correctness` `[2,3,3,1,2]` | |
| 12 | `cl-2.counting-paths-in-a-dag` | knowledge | `[1,2,1,2,2]` | ≤ `counting-vs-optimizing-objective` `[1,3,2,2,2]` | |
| 13 | `cl-2.exclude-one-child-aggregate` | knowledge | `[2,4,2,2,3]` | ≤ `rerooting-principle` `[4,4,2,2,3]` | |
| 14 | `cl-2.implement-counting-dp-under-a-modulus` | implementation | `[1,2,0,3,1]` | ≤ `implement-counting-dp-loop-nesting` `[1,2,0,3,2]` | |
| 15 | `cl-2.interval-state-with-boundary-context` | knowledge | `[4,4,2,2,4]` | total 16 vs CL-2 knowledge median 10 (+6, n=30) | |
| 16 | `cl-2.rerooting-principle` | knowledge | `[4,4,2,2,3]` | total 15 vs median 10 (+5) | |
| 17 | `cl-2.tree-knapsack-merge` | knowledge | `[4,4,1,2,4]` | total 15 vs median 10 (+5) | |
| 18 | `cl-3.broken-profile-state-encoding` | knowledge | `[5,3,2,2,3]` | total 15 vs CL-3 knowledge median 10 (+5, n=11) | |
| 19 | `cl-3.plug-dp-connectivity-encoding` | knowledge | `[5,3,2,2,4]` | total 16 vs median 10 (+6) | |
| 20 | `cl-4.slope-trick-convex-function-representation` | knowledge | `[5,2,1,2,3]` | total 13 vs CL-4 knowledge median 8 (+5, n=9) | |

**Rows 1–14 are the real ask.** Each is a node rated no harder than something the map says it
depends on. That is either a wrong value or a wrong edge, and both are worth knowing.

**Rows 15–20 are the weaker ask** — the hardest topics in the map flagged as unusually hard,
which is probably correct. They are listed so the ranking is not silently truncated. Confirming
them is cheap; skipping them costs little.

**Row 1 may be an edge problem, not a value problem.** `lcs-dp` depending on `edit-distance-dp`
inverts the usual teaching order. If the edge is wrong, the value is fine.

## 3. Recording an answer

Per `08_authoring-workflow-and-in-situ-review-loop.md` §7, a creator judgement goes to exactly
one place: a candidate entry in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`
under the `CR-1` route, classed **NEU-887 evidence class 3 `[dogfooding]`**, naming one node and
one dimension. Recording it in a node's YAML, a README or a commit message is a workflow failure,
not a shortcut.

Class 3 requires the judgement to arise from the creator running the material as a learner. **A
verdict formed by reading this table is not class 3** — it is class 4 `[ai-critique]` wearing the
creator's name, and `08_` §7.2 calls that laundering. The honest use of this sheet is as a
*worklist*: it says which twenty nodes to pay attention to next time you are actually working a
problem, not which twenty to rule on now.

## 4. What this does not do

- **An unflagged node is not a confirmed node.** This finds values the map contradicts itself
  about. A value that is uniformly and consistently wrong is invisible to it, and 159 nodes
  remain `deferred-provisional` with no evidence either way.
- **It closes no cap.** `CAP-S8-1`, `CAP-S8-2` and `OI-S7-1` close on real `CR-1` entries and
  real flag flips, not on a shorter list.
- **It reviews no `prerequisite_depth`.** That is class MD and belongs to the integrity validator.
