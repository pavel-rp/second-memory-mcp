# Technique Index — GENERATED, NEVER HAND-EDITED

> **⚠ This file is generated from the YAML node files. Do not hand-edit it.**
> A hand edit here is invisible to the graph and will be silently overwritten by the
> next regeneration. If something is wrong in this index, fix the **YAML**.
>
> Marked `hand_edited: false` in `../manifest.yaml`.

**Map version:** `0.1.0` · **Status:** scaffold — no DP family node exists yet.

---

## Current state

The map is at its **scaffold** stage. NEU-933 (SUB-2) has landed the schema, the
terminal floor, and the registers. The technique inventory does not exist yet: it is
the deliverable of the five family-mapping sub-tasks (NEU-934/935/936/937/938), which
run next, in parallel.

So this index currently lists the **floor only**:

### DP first-principle roots (8) — `../nodes/cl-1-foundational.yaml`

| Node | Kind | Skill type |
| --- | --- | --- |
| `cl-1.root.optimal-substructure` | knowledge | — |
| `cl-1.root.recognize-optimal-substructure` | skill | conceptual |
| `cl-1.root.overlapping-subproblems` | knowledge | — |
| `cl-1.root.recognize-overlapping-subproblems` | skill | conceptual |
| `cl-1.root.state-transition-base-case-formulation` | knowledge | — |
| `cl-1.root.formulate-state-transition-base-case` | skill | strategic |
| `cl-1.root.memoization-vs-tabulation` | knowledge | — |
| `cl-1.root.implement-memoization-and-tabulation` | skill | implementation |

### Assumed-knowledge boundary anchors (5) — `../boundary-register.yaml` `1.0.0`

| Anchor | Kind |
| --- | --- |
| `anchor.segment-tree` | data-structure |
| `anchor.li-chao-tree` | data-structure |
| `anchor.convex-hull-envelope-geometry` | mathematics |
| `anchor.modular-arithmetic` | mathematics |
| `anchor.linear-algebra` | mathematics |

### Techniques (0)

None. The four clusters' node files are stubs awaiting their mappers.

---

## The generator

**The generator does not exist yet.** Recorded honestly as `INC-S2` rather than
implied: NEU-932 D-F3 §3 already records index-drift as an open cost on `D-F3`, and
generating an index over zero technique nodes would be ceremony. The regeneration and
its freshness assertion belong with the coverage audit (OUT-7), which is the first
consumer that needs the index to be trustworthy and complete.

Until then this file is maintained by hand **by SUB-2 only**, and says so. That is a
deliberate, temporary, and logged exception to `hand_edited: false` — not a licence
for mappers to edit it. The moment the generator lands, this file becomes generated
output and the exception ends.
