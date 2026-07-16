# 02 — Eight-Skill-Type Union-Completeness Check

**Deliverable 2 of 4** · **Covers:** OUT-2 · **Verdict: PASS, with one flagged fragility**

The charter's eight-type spine must be **produced**, not merely permitted. A skill type
instantiated by **no** node is a flagged finding, never a silent absence.

---

## 1. Verdict — all eight instantiated

| Skill type | Total | Non-root | Roots | Clusters instantiating it |
| ---------- | ----- | -------- | ----- | ------------------------- |
| conceptual | **3** | **1** | 2 | CL-1 only |
| procedural | 9 | 9 | 0 | CL-1, CL-2, CL-3, CL-4 |
| strategic | 23 | 22 | 1 | CL-1, CL-2, CL-3, CL-4 |
| implementation | 24 | 23 | 1 | CL-1, CL-2, CL-3, CL-4 |
| proof | 20 | 20 | 0 | CL-1, CL-2, CL-3, CL-4 |
| debugging | 10 | 10 | 0 | CL-1, CL-2, CL-3, CL-4 |
| optimization | 11 | 11 | 0 | CL-4 only |
| transfer | 12 | 12 | 0 | CL-1, CL-2, CL-3, CL-4 |

> ✅ **All 8 named skill types are instantiated by ≥1 node. No type is missing.**
> **112 skill nodes**, every one declaring a `skill_type`; **0** carry a type outside the
> named eight; **0** knowledge nodes wrongly carry one.

**No node was retyped to reach this result.** The per-cluster absences NEU-937 and
NEU-938 recorded are reproduced below exactly as they left them.

## 2. CL-1 is confirmed as the guaranteed producer

The union-completeness check was assumed to rest on CL-1 producing the six types no other
cluster guarantees. **Confirmed, and it is load-bearing for exactly one type.** Absences,
per cluster:

| Cluster | Types absent |
| ------- | ------------ |
| CL-1 | optimization |
| CL-2 | **conceptual**, optimization |
| CL-3 | **conceptual**, optimization |
| CL-4 | **conceptual** |

`conceptual` is absent from **three of the four clusters**. CL-1 is its sole producer —
so had CL-1 not produced it, the type would have been missing graph-wide. The assumption
held, and this is the check that would have caught it if it had not.

`optimization` is CL-4-only, which is **by construction, not a defect**: CL-4 is *defined*
as the cluster whose contribution is reducing the cost of an already-correct recurrence.
An `optimization` skill node in CL-1 would be a partition violation. Recorded so a later
reader does not "fix" it.

## 3. 🚩 F-943-2 — `conceptual` is instantiated, but by one non-root node

**Severity: low (fragility, not a gap). Union-completeness PASSES.** Recorded because
the margin is one node, and NEU-887's discipline is that a thin margin is stated, not
discovered later.

`conceptual` has **3** instances. **Two are frozen roots** —
`cl-1.root.recognize-optimal-substructure` and
`cl-1.root.recognize-overlapping-subproblems` — authored by NEU-933, frozen under
`DR-S02`, and **not** products of the mapping phase. Excluding the frozen floor, the
entire mapped graph instantiates `conceptual` **once**:

> `cl-1.judge-dp-applicability` — *"Judge whether a problem admits a DP formulation"*

Why this is worth flagging rather than smoothing:

1. **The criterion is met.** ≥1 node instantiates the type; three do. This is a **PASS**.
   Nothing is retyped and no finding is manufactured.
2. **The margin is one mapped node.** Every other type has ≥9 non-root instances across
   ≥1 cluster; `conceptual` has 1, in 1 cluster. If `cl-1.judge-dp-applicability` were
   ever retyped or removed, the type would survive **only** on frozen roots that were
   never mapped from the corpus.
3. **It is a predictable artifact of the cascade, not carelessness.** The skill-type
   cascade (schema §3) reaches `conceptual` (S8) only as a *confident residual* — after
   proof, optimization, debugging, transfer, strategic, implementation, and procedural
   have all declined. Mapped technique nodes almost always fire an earlier step. So the
   cascade structurally suppresses `conceptual` outside the first-principles layer. That
   is arguably correct pedagogy — but it means the type's instantiation is **an emergent
   property of where the roots were drawn**, not something the mapping phase produced.

**Route:** not a repair for this audit. If the eight-type spine is meant to be
*load-bearing per cluster* rather than *union-complete graph-wide*, that is a **criterion
change** — it would tighten OUT-2's bar — and belongs to the charter, not to SUB-9
unilaterally. Recorded for the final package.

## 4. The criterion, stated exactly

OUT-2's criterion is **union-completeness over the graph**: ≥1 node per named type,
graph-wide. It is **not** per-cluster completeness. This distinction is load-bearing —
under a per-cluster reading the graph would fail **7 times** (3× conceptual, 3×
optimization from CL-1/2/3, and CL-4's conceptual). Under the actual criterion it passes.

This audit applies **the criterion as written** and does not silently tighten it. The
per-cluster absences are surfaced in §2 so a reader can see what the stricter reading
would cost, and `F-943-2` records the one place the looser reading is doing real work.

## 5. Consumed, not re-derived

NEU-937 (CL-4-mainstream) and NEU-938 (CL-4-frontier) both recorded `conceptual` as
deliberately absent in their clusters, and NEU-937 recorded `debugging` as absent from
mainstream. NEU-935 recorded zero `conceptual` in CL-2. Each declined to manufacture a
node to fill a type it did not own, and routed the absence here instead.

**That was the correct call and this audit confirms it.** Their absences are real, they
are reproduced in §2, and the union is complete anyway — because CL-1 produced what they
declined to fake. A manufactured `conceptual` node in CL-4 would have hidden the very
fragility recorded as `F-943-2`.
