# What authoring the first content unit found

**Model:** claude-opus-5
**Date:** 2026-08-12
**Unit:** `cl-1/judge-dp-applicability.yaml` — six required forms for a `conceptual` node
**Method:** author against the C009 specification exactly as written, refuse rather than invent,
and record every place the specification could not be followed.

The C009 package specifies how to author content across ~40 documents and had never been used to
author any. This is the first use. Four findings, in descending order of how much they cost.

---

## 1. The shipped grader cannot score most nodes' assessments

`assessment` is **R — required — for all eight skill types** (`02_` §6.3). Every one of the 179
non-root nodes must carry a gate-bearing assessment whose `rubric_payload` is
*"structured, rubric-anchored … never a self-report"*.

`src/domain/algorithms/grade-mapper.ts` types the payload as exactly four required booleans:

```
correct_recurrence · correct_base_case · correct_iteration_order · complexity_stated
```

`mapRubricToQuality` reads no other key, and the weights sum to the 0–5 ceiling.

**Those four criteria grade a DP solution.** `cl-1.judge-dp-applicability` is judged *before any
recurrence exists* — a learner who correctly answers "DP does not apply here" produces no
recurrence, no base case and no iteration order. Graded through the shipped criteria, a fully
correct conceptual judgement scores **0**.

The failure is not specific to one node. The four criteria fit assessments whose task is
"write a DP solution". By skill type:

| Type | Count | Does "write a DP solution" describe its assessment? |
| --- | ---: | --- |
| `implementation` | 23 | Yes |
| `optimization` | 11 | Yes |
| `procedural` | 9 | Probably |
| `knowledge` | 71 | No — recall and discrimination, not production |
| `strategic` | 22 | Partly — selection, not derivation |
| `proof` | 20 | No — the artifact is an argument |
| `debugging` | 10 | No — the artifact is a diagnosis |
| `transfer` | 12 | No — the artifact is a recognition |
| `conceptual` | 1 | No — the artifact is a judgement |

**On the order of 130 nodes require a gate-bearing assessment the shipped mapper cannot score**,
and the gate is what unlocks dependents. The exact figure needs a per-type review; the direction
does not.

This unit's assessment therefore carries the four criteria the node actually needs —
`substructure_judged`, `overlap_judged`, `joint_conclusion`, `failure_direction_named` — and is
explicitly marked ungradeable by the mapper as shipped. Supplying the shipped keys anyway, by
mapping "named the property" onto `correct_recurrence`, would have produced a unit that passes
every check and grades nonsense. That is the laundering `02_` §7 forbids, and it is the specific
thing a first authoring run exists to catch.

**Route:** either `RubricCriteria` becomes per-skill-type, or `conceptual` / `proof` / `debugging`
/ `transfer` / `knowledge` nodes cannot carry gate-bearing assessments. Both are decisions; the
current state is neither, and it reads as working because no content existed to exercise it.

## 2. Sixty-eight of 179 nodes cannot be authored at all today

`problem-reference` is **REQUIRED** for four skill types (`02_` §6.3), and no problem citation
exists — all twelve sources carry access disposition `Restricted`, zero requests were issued, and
`02_` §7 requires refusing rather than inventing an identifier.

| Type requiring `problem-reference` | Count |
| --- | ---: |
| `implementation` | 23 |
| `strategic` | 22 |
| `transfer` | 12 |
| `optimization` | 11 |
| **Total blocked** | **68** |
| **Authorable today** | **111** |

This is why `cl-1.judge-dp-applicability` was authorable: `conceptual` carries
`problem-reference` as OPTIONAL. The unit omits it by explicit refusal rather than silently.

**This makes the rights re-verification pass the highest-leverage unblocked item in the program.**
It is not only ~11 caps; it is 38% of the map's authorable surface. The route is already named and
owned: a dated re-verification that reads each source's own terms, robots directives and rate
limits and re-dates the `01_` §3 rows. Network capability exists; authority is what is missing.

## 3. Content had nowhere to live

No content directory existed, and no C009 document names a storage location — the package
specifies forms, not persistence. `content/<cluster>/<node-slug>.yaml` is a choice made here, not
a spec compliance. It mirrors the eventual DB shape (one row per form instance) closely enough to
migrate, and is the smallest decision that unblocked authoring.

## 4. Two small spec frictions, recorded not fixed

- **`prerequisite_recall` is singular in the template** (`02_` §7.1: *"node id of the assumed prior
  node"*) but this node has two prerequisite roots, and multi-prerequisite nodes are the norm. The
  unit emits a list. The field definition says "which already-unlocked node the lesson assumes",
  which reads as one; nothing states whether a list is conforming.
- **The `example` form's `problem_ref` is OPTIONAL, and the three settings used here are described
  in the unit's own words** — dominoes on a 2×n board, mergesort, longest simple path. These are
  generic algorithmic settings, not references to hosted problems: no identifier, no address, no
  external statement text. Nothing in `01_` prohibits this, but nothing explicitly permits it
  either, and a later pass must not convert any of them into a citation.

---

## What this unit is not

It is **class 4 `[ai-critique]`** — authored by an agent, `author_kind: agent`. It sits at
workflow state **`draft`**, not `authored`: `08_` §6 makes form review a separate role, and `A4`
bars a producing party from promoting its own artifact. Nothing here reviews itself.

It also produces **no class 3 `[dogfooding]` evidence** and closes no cap. What it does is make
class 3 evidence *possible* for the first time — there is now one unit a creator could actually
work through as a learner, which is the precondition `OI-S7-1`'s creator review has been waiting
on since it was filed.
