# 04 — AI Adversarial Gap-and-Prerequisite Analysis

**Deliverable 4 of 4** · **Covers:** OUT-2
**Protocol:** NEU-887's AI-review-independence protocol
(`../C005-product-foundation/benchmark-suite/04_ai-review-independence-protocol.md`)

**Posture:** actively hunt for unexplained jumps, missing prerequisites, missing skill
types, and unresolvable attachments. Assume the graph is hiding something. **7 findings
recorded.** Nothing found is smoothed.

---

## 1. Independence declaration

Per NEU-887's protocol this analysis states its own position. **It is not independent of
the artifact in the strong sense:** the same agent that ran the mechanical audits ran this
one, in one context. It is independent of the **mappers** — SUB-9 authored none of the
187 nodes, none of the 25 edges, and none of the dimension values it attacks.

The mitigation actually used: **every adversarial claim below is backed by a scripted
check, not by the reviewer's impression.** F-943-1's diagnosis is an executed
counterfactual (re-compute depth with the cross-cluster layer removed and see what
matches), not a reading. Where a check could not settle a question, it is recorded as
unresolved (§6) rather than argued to a conclusion. Residual bias risk is recorded as a
cap in `06`.

## 2. 🔴 F-943-1 — NEU-940's dimension values were computed against the pre-NEU-939 graph

**Severity: HIGH. The most consequential finding in this audit.**
**Status: CLOSED — repaired by NEU-954, discharged by ledger entry `D-R4`.**

NEU-940 shipped its per-node dimension values **asserted-present, not reviewed for
consistency**, and its own V-1..V-18 run never completed. It routed this check here. The
check found a real, systematic defect — with a single root cause. The analysis below is the
diagnosis as made; §2.5 records the repair that discharged it.

### 2.1 The two symptoms

**Symptom A — 26 of 179 nodes under-reported `prerequisite_depth`.**
The rubric (`02_difficulty-dimensions.md` §2) defines it as *"Longest DP-technique path
back to the floor"*. Re-computing that definition against the edge-complete graph:
**153/179 agreed exactly; 26 disagreed.** All 26 have since been corrected — **179/179
agree.**

**Symptom B — 6 `progression_stage` inversions.** A dependent sat at an *earlier* stage
than its own prerequisite — the learner would have met the technique before the thing it
requires. **All 6 are resolved; the graph carries 0 inversions.**

### 2.2 The root cause — isolated, not guessed

Three independent probes converge on one cause:

**Probe 1 — the direction is unanimous.** All 26 depth mismatches **under**-report. Zero
over-report. A rubric misread, transcription noise, or judgment drift would scatter in
both directions. A **missing edge set** can only ever under-report — an absent edge can
shorten a longest path but never lengthen it. Unanimity across 26 nodes is not noise.

**Probe 2 — the counterfactual matches.** Re-computing each node's depth with the 25
NEU-939 cross-cluster edges **removed** reproduces the declared value **exactly** on
**20 of the 26**. The remaining 6 (the matrix-exponentiation family and SMAWK) sit
strictly *between* the pre-939 and edge-complete values — partial cross-cluster crediting.
And **all 26** have their longest path running through a cross-cluster edge.

**Probe 3 — the defect is confined to exactly the cross-cluster layer.** Testing stage
monotonicity **by edge class** is decisive:

| Edge class | Edges checked | Stage inversions |
| ---------- | ------------- | ---------------- |
| `intra_cluster` | 293 | **0** — clean |
| `roots` | 0 applicable (roots carry `{}`) | 0 |
| **`cross_cluster`** | **25** | **6** ← every defect is here |

> **293 intra-cluster edges, zero inversions. 25 cross-cluster edges, six inversions.**
> NEU-940's stage assignments are internally consistent **within** every cluster and
> break down **only** where a dependency leaves its cluster.

**Conclusion:** NEU-940 assigned stages and depths **cluster-locally**, against a graph in
which the cross-cluster layer was absent or unconsumed. Both symptoms are one defect.
This is not carelessness — it is the predictable consequence of the pipeline's own
sequencing, and it is exactly what NEU-940's caveat warned might be there.

### 2.3 The six inversions, in full — as found, and as repaired

| Dependent | Stage as found | requires | Stage | Dependent's stage now |
| --------- | -------------- | -------- | ----- | --------------------- |
| `cl-3.bitmask-state-encoding` | PS-1 | `cl-2.subset-sum-feasibility` | PS-3 | **PS-4** ✅ |
| `cl-3.formulate-digit-dp` | PS-2 | `cl-1.counting-dp-over-linear-domain` | PS-4 | **PS-4** ✅ |
| `cl-3.formulate-automaton-dp` | PS-2 | `cl-1.linear-sequence-dp-2d` | PS-3 | **PS-4** ✅ |
| `cl-4.divide-and-conquer-optimization` | PS-2 | `cl-1.sequence-partition-dp` | PS-4 | **PS-4** ✅ |
| `cl-4.divide-and-conquer-optimization` | PS-2 | `cl-2.formulate-interval-dp` | PS-4 | **PS-4** ✅ |
| `cl-4.knuth-yao-optimization` | PS-3 | `cl-2.formulate-interval-dp` | PS-4 | **PS-4** ✅ |

**All six now order correctly** — no prerequisite stage exceeds its dependent's.

The pattern was legible: CL-3 and CL-4 each staged their *entry-level* techniques as PS-1/2
**relative to their own cluster** — reasonable in isolation — while the CL-1/CL-2 base DP
those techniques stand on is genuinely PS-3/PS-4 work. `cl-4.divide-and-conquer-optimization`
at PS-2 requiring two separate PS-4 nodes was the sharpest case: it was annotated as early
material that in fact presupposes two pieces of advanced material.

### 2.4 Why this matters downstream

Consumers of this map — the C005 curriculum-production agents — are expected to sequence
by `progression_stage`. **A consumer trusting the stages as shipped would have ordered 6
dependencies backwards** and would have under-estimated the prerequisite burden of 26
techniques by 1–4 hops. The graph's *structure* would have carried them correctly; its
*annotation* would not.

This is precisely the failure OUT-6's "consistent with the progression stages" clause
exists to catch, and it was caught by the check NEU-940 asked for.

### 2.5 Route — not repaired here, repaired by the owner

**Owner: NEU-940's dimension values (the `progression_stage` / `prerequisite_depth`
fields on 26 nodes across CL-3 and CL-4).** SUB-9 audits; it does not repair. Repair means
editing node files this task explicitly does not own, concurrently with NEU-941. Recorded
and routed. Recommended remedy, for the owner to weigh rather than for SUB-9 to impose:
re-derive both fields against the **edge-complete** graph, and treat `prerequisite_depth`
as **computed** rather than hand-asserted — it is a pure function of the graph, and the
validator in this package already computes it.

**The route completed.** NEU-954 took ownership and applied exactly that remedy: both
fields re-derived over the edge-complete graph — **26 depth corrections, 16 stage changes
(all to `PS-4`), 1 `entry_gate` change** (`cl-3.bitmask-state-encoding`, `gate-a` →
`gate-c`) — leaving **0 stage inversions** and **179/179** depths agreeing with the graph.
**`F-943-1` is CLOSED**, discharged by ledger entry **`D-R4`**. Six residual `cl-4` values
(the matrix-exponentiation family and SMAWK) were corrected with the rest, but their
declared values matched **neither** the pre-939 nor the post-939 graph; NEU-954 records
that residual cause as **`unestablished`**, and it stays recorded rather than explained
away.

**Consumers:** the edges are audited and correct, and the stages and depths now agree with
them. The validator re-derives both from source — re-run it after any edge change.

## 3. F-939-A — SOS DP · verdict: **GENUINE GAP, orphan attachment. Confirmed.**

**Declaration:** `xc.cl-3.bitmask-state-encoding->cl-4.sos-dp` · `required-by` · `named`.

**Independently re-verified, not taken on trust.** Searched all **187** nodes — 179
technique nodes across all five files *and* the 8 frozen roots — by id, by name, and by
summary, for `sos`, `sum-over-subset`, `zeta`, `moebius`, `mobius`:

> **Zero matches. No node named or resembling SOS DP exists anywhere in the graph.**

This is **not** a naming miss that `to_name` resolution could rescue — the technique is
genuinely unmapped. NEU-939's report is confirmed exactly.

**Root cause (NEU-939's, confirmed):** SOS DP fell through the partition. Four
independent declines, zero owners: CL-3 declined it as link-not-own and declared *this*
attachment instead; CL-4-mainstream declined it as outside its five nominated areas;
CL-4-frontier declined it under RX-3; CL-2's exclusion note E9 pushed it out
(*"cl-2.subset-sum-feasibility is over integer totals, SOS DP is over a subset lattice"*).

**Verdict: GENUINE GAP.** This audit **concurs with NEU-942**, which already adjudicated
it and assigned owner **`INC-C1`** (creator — a CL-4 completion task), gated on **`INC-C2`**
(`D-F4a`). Coverage is NEU-942's call, not SUB-9's; this audit records the **orphan /
missing-prerequisite** face of it and **points at 942's verdict** rather than re-deciding.

**Explicitly not done:** no node minted, no edge faked, **`D-F4a` not re-decided.**
Whether SOS DP is CL-3 or CL-4 is the live dispute; an audit picking a side would settle
an open adjudication by fait accompli. The declaration stands as the only surviving
evidence in the graph that the dependency and the technique exist at all — which is
exactly why NEU-939's `R2` forbids deleting it.

## 4. F-939-B — Bitset / word-parallel optimization · verdict: **GENUINE GAP. Confirmed.**

**Declaration:** `xc.cl-3.implement-bitmask-dp->cl-4.bitset-word-parallel-optimization`
· `required-by` · `conjectured`.

Same re-verification at both scopes the claim needs. Searched all 187 nodes for `bitset`
and `word-parallel` by id, name, and summary:

> **Zero matches. Neither CL-4-mainstream's 23 nodes nor CL-4-frontier's 18 contain it,
> and nothing anywhere else does.**

**Root cause: the same partition hole, a different technique.** CL-2's exclusion note E4
routes it *to* CL-4 explicitly and correctly (*"Bitset-accelerated subset sum is NOT
here: it fires T1 — same states, same recurrence, lower constant"*) — and **neither CL-4
file received it.** The `conjectured` confidence was well-placed: the mapper believed a
target should exist, and it does not. Per `R3` that is a coverage finding, not a mapper
error.

**Verdict: GENUINE GAP.** Concurs with NEU-942's adjudication. Same routing as F-939-A.

**The asymmetry worth naming:** the exclusion notes and the cluster files **disagree about
who owns this technique**. E4 says CL-4; CL-4 says nothing. That disagreement — not the
missing node itself — is the structural signal.

### 4.1 Both gaps share NEU-942's root cause

NEU-942 found the gap class is **10 instances**, all CL-4-by-cascade, in neither CL-4
half's enumerated scope, **all with named owners**. Its root cause:

> *"When a cluster is split for sizing, one half must be the residual owner."*

F-939-A and F-939-B are two of those ten, and they are the two the **edge layer**
independently surfaced. That is corroboration from a different direction: the cross-cluster
integration pass rediscovered, from declared dependencies alone, a hole the coverage audit
found from the corpus. **Two independent methods, same hole.** This audit adds nothing to
the coverage verdict — it confirms the mechanism reaches the same place twice.

**CL-4's split created a residual-ownership vacuum.** Neither half was designated the
residual owner, so techniques that are CL-4 by cascade but outside both halves' enumerated
scope have no home. Recorded here because it is the same structure that makes `optimization`
CL-4-only (`02` §2) and the same one `F-943-2` touches: **the partition is sound; the
work-split of CL-4 is where things fall through.**

## 5. F-939-1 and F-939-2 — inherited soft findings · adjudicated

### 5.1 F-939-1 — altitude reservation · verdict: **edge STANDS. Reservation upheld as open.**

`xce.cl-3.formulate-automaton-dp->cl-1.linear-sequence-dp-2d` resolved CL-3's *"String /
sequence DP"* to CL-1's **family-level** node rather than to the exemplar-level
`cl-1.edit-distance-dp` / `cl-1.lcs-dp` its rationale names.

**Adjudication: the edge is correct and stands.** The declaration asks for a *shape*
("the ordinary string DP indexed by position"), and `cl-1.linear-sequence-dp-2d` is the
family-level node over exactly that shape, with edit-distance and LCS as its instances.
Resolving a shape request to the shape node is right.

**But the reservation is real and stays open.** Both readings ground correctly, so the
floor audit cannot discriminate — this is a **pedagogical** question (does a learner need
the general 2D shape, or the two concrete instances?) that structure cannot settle.
Recorded as **open**, low severity. It is a repointing, not a re-mapping, if ever changed.

### 5.2 F-939-2 — cluster-prediction drift · verdict: **resolutions CORRECT. Signal upheld.**

Two declarations named `to_cluster: "CL-2"` for targets living in CL-1
(`cl-4.divide-and-conquer-optimization->cl-1.sequence-partition-dp`,
`cl-3.implement-plug-dp->cl-1.grid-path-dp`).

**Both resolutions are correct.** For the plug-DP edge, the mapper *called its own
coin-flip and left standing instructions* — *"If it resolves to nothing in CL-2, SUB-12
should retry against CL-1 before reporting a gap."* NEU-939 followed that written
instruction. CL-2 owns no grid node at all, so there was no rival candidate. Reporting a
gap there would have been a **silent drop of a real dependency against the mapper's own
instruction**. The D&C edge is corroborated independently: SUB-13, which *did* rebase,
attached three frontier siblings of the same technique family onto
`cl-1.sequence-partition-dp` by id.

**NEU-939's signal is upheld and sharpened.** Both mis-predictions run the **same
direction** — a mapper judging a base DP "combinatorial" (T3) where CL-1 judged the same
recurrence "a plain index tuple" (T4). Two independent mappers drifting the same way at
the same cascade boundary is a signal about the **T3/T4 cascade step**, not an error by
either mapper. **This audit adds a third data point:** `cl-4.divide-and-conquer-optimization`
was *also* one of the six F-943-1 stage inversions. The same node was mis-predicted on
cluster **and** mis-staged — both because CL-4 reasoned about a CL-1 base DP without
seeing it. **F-939-2 and F-943-1 were the same blindness in two annotations.** F-943-1's
half is now repaired and closed (`D-R4`); **the cluster-prediction signal F-939-2 records is
untouched by that repair and remains open**, routed to the partition audit as a cascade
signal.

## 6. Adversarial probes that found nothing — recorded so absence is evidence

A hunt that only reports hits is not a hunt. These probes were run and came back **clean**;
each could have failed:

| Probe | Hypothesis it could have confirmed | Result |
| ----- | ---------------------------------- | ------ |
| Whole-graph 3-colour DFS | a retained cycle needing justification | **0 cycles** |
| Zero-prerequisite non-root nodes | a technique floating with no grounding | **0** |
| Reachability of all 179 to the floor | an orphaned advanced node | **0 ungrounded** |
| `roots`-field edges → non-root targets | a **faked root edge** laundering a real dependency | **0 of 223** |
| `boundary_anchors` → unregistered anchor | a **locally invented anchor** (AR-1 forbidden) | **0 of 31** |
| Root/anchor edges re-drawn in the xc file | duplicated floor edges corrupting both audits | **0** |
| `intra_cluster` edges crossing clusters | a mislabelled cross-cluster dependency | **0 of 293** |
| Duplicate node ids across the 5 files | two mappers colliding on an id | **0 of 187** |
| Dangling edge endpoints | an edge to a node that does not exist | **0 of 572** |
| Dimension key-set drift across 179 nodes | mappers diverging on the rubric | **1 key-set — uniform** |
| `skill_type` outside the named eight | taxonomy drift | **0** |
| `knowledge` nodes carrying `skill_type` | the knowledge/skill distinction rotting | **0** |
| Roots carrying non-empty dimensions | the frozen root block being edited | **0 of 8** |

**The laundering probes are the load-bearing negatives.** The single failure the floor
audit exists to catch is a real dependency faked as a root or anchor edge to make a chain
bottom out. **223/223 root edges and 31/31 anchor edges are honest.** Nobody laundered
anything — which is what makes F-939-A/B *visible* as gaps rather than buried as fake
terminals. The mappers who declined to own SOS DP declared an attachment instead of faking
a terminal, and that discipline is why this audit can see the hole at all.

## 7. Unresolved — named, not argued away

- **F-939-1's altitude** — structure cannot discriminate; a pedagogical call. Open.
- **`D-F4a`** (SOS DP: CL-3 or CL-4?) — live dispute, gated on `INC-C2`. **Not touched.**
- **`PS-2/3/4` stage granularity** — NEU-940 flags it `ungrounded` against NEU-888. This
  audit checks stages for **internal consistency with the graph**; it does **not** validate
  the stage boundaries themselves against evidence. A stage set can be perfectly
  monotone and still be ungrounded. Both remain true. Carried to `06`.
- **`creator_review: "deferred-provisional"` on all 179** — no creator has reviewed any
  dimension value. This audit is a *consistency* check, not a substitute for that review.
  A value can be consistent and wrong.
- **`entry_gate` restricted to `gate-a`/`gate-c`** — confirmed: **19 gate-a** (all PS-1) and
  **160 gate-c** (all PS-2+). **`gate-b`, `gate-d` and `gate-e` are instantiated by no node.**
  Whether that is correct is NEU-940's/NEU-888's, not SUB-9's. The crosstab is
  perfectly clean — PS-1↔gate-a, PS-2/3/4↔gate-c, with **zero** exceptions — which means
  the field is a **deterministic function of `progression_stage`** and carries no
  independent information. **Re-measured after NEU-954's repair: still zero exceptions**,
  so the redundancy is exactly as it was and **`F-943-3` stays open (Low)** even though
  `F-943-1`, which it once inherited, is closed. Recorded as an observation for the owner.
