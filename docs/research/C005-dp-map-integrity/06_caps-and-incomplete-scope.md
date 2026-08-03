# 06 — Caps and Incomplete Scope

**Author:** NEU-943 (SUB-9). What this audit does **not** license. Named, with owners —
never papered over. An audit that states only what it proved overstates itself.

---

## INC-9.1 — This audit proves **structure**, not **pedagogy**

The graph is acyclic, grounded, and union-complete. **None of that says the map teaches
DP well.** Specifically not proven:

- that the prerequisite relation matches how a learner actually acquires these techniques;
- that a technique's stated prerequisites are *sufficient*, only that they exist and ground;
- that the eight skill types carve the space usefully — only that all eight are instantiated.

**Coverage is proven by the audits, not by taxonomy size** (charter risk #1). 187 nodes is
**not** evidence of coverage, and this audit makes no such claim. Neither is 572 edges,
nor 5 walked paths.

## INC-9.2 — The stage set is checked for **consistency**, never **grounded**

`04` §7 states this and it is repeated here because it is the easiest thing in this package
to over-read.

This audit checks `progression_stage` for **internal consistency with the graph** —
does a dependent ever sit earlier than its prerequisite? It does **not** validate the
stage boundaries themselves against evidence. **NEU-940 flags `PS-2/3/4` granularity as
`ungrounded` against NEU-888, and that flag stands untouched.**

> A stage set can be perfectly monotone over every edge **and still be ungrounded.**
> Closing **F-943-1** achieved the former and said nothing about the latter.

**That conditional has now fired.** `F-943-1` is closed (`D-R4`) and the stage set is
monotone over all 318 checked edges — **and the `PS-2/3/4` granularity flag stands exactly
as it did.** The two were never the same question.

**Owner:** NEU-940 / NEU-888. **Not** closed by this audit, and not closed by the repair.

## INC-9.3 — `creator_review: "deferred-provisional"` on all 179 nodes

**No creator has reviewed any dimension value.** This audit is a consistency check and is
**not a substitute** for that review. A value can be perfectly consistent and simply wrong:
`state_formulation_load: 3` is unfalsifiable by any check in this package. Only the 26
depth values and 6 stage values that **contradict the graph** are caught — the rest are
consistent, which is weaker than correct.

**Owner:** Assumption #11 / `DR-P03`. Unchanged by this audit.

## INC-9.4 — AI-review independence is **partial**

Recorded plainly under NEU-887's protocol. The adversarial analysis (`04`) was run by the
**same agent, in the same context**, as the mechanical audits. It is independent of the
**mappers** (SUB-9 authored no node, edge, or dimension value) but **not** independent of
the auditor.

**Mitigation actually used:** every adversarial claim is backed by a scripted, re-runnable
check — F-943-1's diagnosis is an executed counterfactual, not an impression. **Residual
risk:** a defect this auditor is blind to would be missed by both the script it wrote and
the review it ran. A genuinely independent reviewer is **not** substituted for by this
package.

## INC-9.5 — The representative path set is 5 paths, not a traversal proof

`03` walks **five** paths against a **minimum-count** criterion. This is **not** a claim
that every foundation-to-advanced route is clean. Path count is no more coverage than
topic volume is.

The exhaustive guarantee is the reachability audit's — **all 179 non-root nodes reach the
sanctioned floor** — and *that* is the whole-graph statement the five paths illustrate.
Read the five as witnesses; read `01` §3 as the proof.

## INC-9.6 — Two known holes remain in the map

**F-939-A** (SOS DP) and **F-939-B** (bitset / word-parallel) are **genuine gaps**, and
this audit closes neither. "Edge-complete" means **nothing is pending resolution** — it
does **not** mean the map has no holes. It has these two, plus the 8 further instances in
NEU-942's 10-instance gap class.

**Owner:** `INC-C1` (creator, CL-4 completion), gated on `INC-C2` (`D-F4a`).
**`D-F4a` is untouched by this audit.**

## INC-9.7 — Coverage was **not** re-adjudicated

NEU-942 (OUT-7) owns coverage: 30 disagreements adjudicated (10 GAP / 11 mapped
equivalence / 6 intentional exclusion / 3 unresolved uncertainty), 52 residual exclusions
consolidated, gap class = 10 instances, all with named owners. **Consumed as settled.
Deliberately not re-derived.** Where this audit touches a gap (F-939-A/B) it records the
**orphan/missing-prerequisite** face and **points at 942's verdict**.

**`INC-C6`** — NEU-942 explicitly re-routed a validator to SUB-9. Discharged:
`validator/audit-graph-integrity.mjs` is checked in, re-runnable from source, and
produces every number in this package. **28/28 structural checks pass.**

## INC-9.8 — The map is `map_version: 0.1.0` and this audit does not promote it

Deliberately `< 1.0.0` until the graph is adjudicated (`D-F3` §6). This audit **writes no
adjudication-ledger rows** and therefore promotes nothing. Note the `manifest.yaml`
still reads `status: "scaffold"` — stale against a node- and edge-complete graph, but
correcting it means editing a file this task does not own. **Recorded, not repaired.**

## INC-9.9 — F-943-1 was flagged here, not fixed — and that was a deliberate cost

The single highest-value repair this audit identified — re-deriving 26 nodes' stage and
depth values against the edge-complete graph — is **not performed here.**

**Why:** SUB-9's spec puts *"mapping or repairing nodes/edges"* out of scope. Repair means
editing node files owned by the family clusters, **concurrently with NEU-941**, to fix a
defect **NEU-940 explicitly routed here for flagging**. Doing it would trade a clean
audit boundary and a safe merge for a fix that is not this task's to make.

**The cost was real and was stated rather than hidden:** until an owner acted, the map
shipped with **26 under-reported depths and 6 stage inversions**, and any consumer
sequencing by `progression_stage` across a cluster boundary would get 6 dependencies
backwards. `05` §5 told consumers what to do in the meantime. **The remedy was cheap** —
`prerequisite_depth` is a pure function of the graph and this package's validator already
computed it correctly.

**An owner acted.** NEU-954 re-derived both fields over the edge-complete graph — 26 depth
corrections, 16 stage changes, 1 `entry_gate` change — and **`F-943-1` is CLOSED** (ledger
`D-R4`). **The scoping decision recorded above is unchanged and stays true: SUB-9 was right
not to make the repair itself.** The deliberate cost was paid for the length of one
hand-off, and the flag-and-route discipline is what made the repair findable.

## INC-9.10 — JavaScript materiality is untouched

**NEU-941** owns `javascript_materiality` and was writing the node files concurrently with
this audit. This package asserts **nothing** about that field and edited **no** node file.
Any `javascript_materiality` value in the graph is NEU-941's, unreviewed here.
