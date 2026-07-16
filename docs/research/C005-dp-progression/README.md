# C005 — DP Progression Stages & Difficulty Dimensions (OUT-3)

**Task:** NEU-940 (SUB-7) · **Umbrella:** NEU-889 · **Compiled:** 2026-07-16
**Status: provisional.** Settles nothing. Resolves no conflict. Promotes no node to `settled`.

This package defines, **once**, the two things a prerequisite graph does not say by itself:

1. **Which stage a technique sits in** — `01_progression-stages.md`
2. **How hard it is, along named dimensions** — `02_difficulty-dimensions.md`

and applies both to every mapped technique node in `../C005-dp-map/nodes/*.yaml`.

## The one-line claim

> A progression stage is a **prerequisite-depth stratum** whose entry is governed by a **named NEU-888 mastery gate** — it is **not** a difficulty ramp, and difficulty is **not** collapsed into a single number.

Both halves of that sentence are load-bearing and both are *interpreted from* NEU-888
(`../C005-instructional-model/`), never invented here. The grounding trace is
`03_grounding-trace.md` — read it before trusting any stage.

## Read order

| File | What it gives you |
| --- | --- |
| `00_method-and-scope.md` | What this sub-task decides, what it must not touch, how it reads NEU-888 |
| `01_progression-stages.md` | **PS-0 … PS-4** — the stage set, each with its NEU-888 gate |
| `02_difficulty-dimensions.md` | The **five load dimensions + prerequisite_depth** and the scoring rubric |
| `03_grounding-trace.md` | Stage → NEU-888 source, one row each. **Ungrounded stages are flagged here.** |
| `04_consistency-check.md` | The applied-to-every-node check, with every flagged node |
| `decision-records/DR-P01…P03` | The three decisions, with rejected alternatives |

## What this package does NOT do

- **Does not re-derive NEU-888.** The mastery model, the mastery signals, and M10 are *consumed*. (Out of scope, per the NEU-940 spec.)
- **Does not map a node, draw an edge, or realize a cross-cluster attachment.** SUB-3/4/5/6/13 and SUB-12 own those.
- **Does not write `javascript_materiality`** (SUB-8/NEU-941), **`edges/cross-cluster.yaml`** (SUB-12/NEU-939), **`manifest.yaml`**, **`boundary-register.yaml`**, or **the adjudication ledger** (SUB-10/NEU-942; reconciliation SUB-11/NEU-944).
- **Does not present the graph order as measured for DP.** Inherited NEU-887 **R1** / `INC-I1` / F-TR-3. See `00_method-and-scope.md` §4.
- **Does not promote any node to `settled`.** Only the ledger promotes.

## Standing uncertainty — read before using a stage

Every stage assignment and every difficulty score in this package is a **class-1-transported
judgement applied to an UNMEASURED domain**. No class-7 `[future-real-user]` evidence exists
anywhere in C005. The progression order is **not** presented as measured for DP, and the
creator's progression-plausibility review is **deferred** (charter Assumption #11) — see
`decision-records/DR-P03_creator-review-deferral.md` for the explicit revision trigger.
