# DR-S02 — The Foundational Root Nodes

**Decision:** `D-S2` · **Task:** NEU-933 · **Status:** settled (see `../adjudication/01_schema-decision-ledger.md` — this record does not set status) · **Compiled:** 2026-07-16

---

## The decision

> **The charter's four DP first principles are represented as EIGHT root nodes — each principle as a knowledge node plus the skill node it licenses — all typed, all `status: "settled"`, all `frozen: true`, seeded into `nodes/cl-1-foundational.yaml` before any mapper starts.**

| Principle | Knowledge | Skill | Skill type |
| --- | --- | --- | --- |
| Optimal substructure | `cl-1.root.optimal-substructure` | `cl-1.root.recognize-optimal-substructure` | `conceptual` |
| Overlapping subproblems | `cl-1.root.overlapping-subproblems` | `cl-1.root.recognize-overlapping-subproblems` | `conceptual` |
| State/transition/base-case | `cl-1.root.state-transition-base-case-formulation` | `cl-1.root.formulate-state-transition-base-case` | `strategic` |
| Memoization vs tabulation | `cl-1.root.memoization-vs-tabulation` | `cl-1.root.implement-memoization-and-tabulation` | `implementation` |

Full statement: `../02_terminal-floor.md` §2.

## Rationale

**Two nodes per principle, because the distinction is true here — not ceremonial.** Knowing what optimal substructure *is* and being able to *spot it in a problem statement* are different acquisitions that fail differently. A learner who recites the definition and still cannot tell whether a given problem has the property is **the most common DP failure there is**. One node cannot represent both, because a learner can have one without the other.

**And because the roots are the schema's worked specimen.** They are the first thing every mapper reads. If the floor ducked the knowledge/skill distinction the schema mandates, the distinction would be decorative — and mappers would reasonably copy what the floor did. 4 knowledge + 4 skill, exercising three of the eight types, each skill carrying a `skill_type_rationale` that states its cascade path.

**These four principles and no others**, because they are the charter's, verbatim. Adding a fifth would be a **family-mapping decision** — explicitly out of scope. They are also non-arbitrary as a set: **optimal substructure** and **overlapping subproblems** are the two properties that make DP *applicable*; **state/transition/base-case** is the vocabulary a formulation is *expressed* in; **memoization vs tabulation** is how a formulation is *evaluated*. Applicability, expression, evaluation — everything in every cluster is a variation on one of those three.

**They live in CL-1's file** because NEU-932 `D-F4` §1 makes the first principles CL-1 members: *"These are cluster members (CL-1 owns them) but are roots, not techniques."* **This is not a shared file** — SUB-2 wrote the block and landed it *before* SUB-3 starts, so SUB-3 is sole writer for the whole mapping phase. **Sequential authorship, not concurrent.** Per-cluster file ownership is intact.

**Frozen, because they are a shared floor.** Every cluster draws onto them. A mapper editing a root would silently change what every other cluster's chains terminate on.

## Rejected alternatives

| Alternative | Why it was plausible | Why rejected |
| --- | --- | --- |
| **A single "DP fundamentals" node** | Simplest possible floor. One terminal, trivially reachable, impossible to get wrong. | Rejected because **it makes the floor audit vacuous.** Every chain would bottom out identically, and the audit would prove nothing beyond "the chain reached the bottom node" — which is true by construction and therefore says nothing. Eight distinct roots mean a chain's terminal **carries information**: a CL-4 optimization node bottoming out on `formulate-state-transition-base-case` asserts something real and falsifiable. A floor you cannot fail is not a floor. |
| **One node per principle** (no knowledge/skill split) | Four roots, matching the charter's four principles exactly. Less to read. No risk of over-reading the charter. | Rejected on two grounds. **(1) It is false to the domain** — reciting the definition and recognizing the property are separately-failing acquisitions (`F-S-5`). **(2) It would make the schema's central distinction decorative at the exact place mappers learn it.** The floor is the worked example; a floor that skips the distinction teaches mappers to skip it. |
| **A separate `nodes/roots.yaml`** outside CL-1's file | Keeps SUB-3's file pristine; gives roots a home no mapper owns; makes the frozen boundary a **filesystem** boundary rather than a comment. | Rejected: it **changes the file layout `D-F3` fixed** and that four other sub-tasks are already scoped to — a local redesign where the sanctioned route is a ledger challenge. It would also register CL-1 as a two-file cluster, adding a second instance of the many-files shape for no gain. The frozen-block-plus-marker achieves the same isolation **inside the layout as given**. **Cost, recorded honestly:** the isolation is now a convention rather than a filesystem fact, so a careless SUB-3 *could* edit a root. Mitigated by `frozen: true` being machine-checkable (**V-17**) and by the marker being impossible to miss. |
| **Deriving the root skills' prerequisites down to programming fundamentals** | Completeness: every chain would bottom out in something genuinely atomic. | Rejected as the **"bottomless" failure** (`../02_…` §1) and as out of scope. That is NEU-887's elementary-data-structures floor, **below** this map. Chasing it turns the DP map into a general CS curriculum and dilutes the thing the charter asked for. |

## What this decision does NOT do

- **It sets no progression.** Root-internal edges are deliberately minimal — each skill requires its own knowledge node, `formulate-…` requires the two recognition skills, `implement-…` requires `formulate-…`. **A prerequisite edge is a structural claim** ("you cannot acquire A without B"); **a progression is a pedagogical claim** ("teach B, then A"). SUB-7 (OUT-3) owns the second, through NEU-888's mastery semantics. The edges are kept minimal precisely to avoid smuggling a progression in through the floor.
- **It maps no family node.** SUB-3 owns CL-1's families.
- **It reaches no JavaScript verdict.** `implement-memoization-and-tabulation` carries an *observation* about recursion depth and the absence of a tunable stack in JS, explicitly labelled **not a verdict**. SUB-8 (OUT-5) owns the verdict, and NEU-932 records that OUT-5 has **no reference support** — every selected reference assumes the C++ competitive default.

## Status and revision trigger

**Status:** settled. Set only in the ledger.

**Revision trigger:** a mapper demonstrates a DP technique whose prerequisite chain **cannot** terminate on any of the 8 roots and is not a boundary-anchor case. Or the charter's principle set changes.

**Challenge route:** file against `D-S2` in the ledger. A root is never edited in place.

## Evidence and its honest class

`F-S-1` (class 1 `[literature]` — the charter's named principles) and `F-S-5` (class 1, the practitioner observation motivating the split). `F-S-4` (class 2 `[code-evidence]`) is the roots themselves as a specimen.

**Recorded limitation, from `F-S-1`:** that these four are *the* DP first principles is well-attested in the literature; that they are **the right floor for this audience** is a **judgment**. And per `X-D3` (non-downgradable High), **nothing in C005 measures DP learning** — so the knowledge/skill split is *motivated* by practitioner observation, **not validated** by evidence.
