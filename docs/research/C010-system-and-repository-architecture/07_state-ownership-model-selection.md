# 07 — The state-ownership model: all-MCP against hybrid, scored on one weighted criteria set

**Written by:** NEU-976 (SUB-6) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-3`, `OUT-10`
**Written:** 2026-08-21 · **Cutoff for every `src/` fact below:** 2026-08-21, on `origin/develop`
**Model:** claude-opus-5[1m]

**Depends on:** `04_state-category-inventory.md` (SUB-3, the 45 categories an ownership model
must assign), `05_system-context-and-responsibility-boundaries.md` (SUB-4, the components that
could own them and the boundaries between them), and
`06_isolation-invariant-and-the-neu-893-split.md` (SUB-5, the invariant a model must not
break). All three merged.

---

## 0. What this chapter is, and the order it is written in

C010's Critical risk is that MCP-owned and web-owned state diverge or permit conflicting
writes. SUB-3 inventoried the state, SUB-4 inventoried the components, SUB-5 stated the
invariant. None of them chose **who writes what**. This chapter does, once, against one
criteria set — so that `SUB-13 (NEU-977)`'s 45-row authority matrix is a mechanical
application of a decided model rather than 45 independent judgement calls.

It does **not** build that matrix (`SUB-13`), apply the invariant per row (`SUB-14`,
NEU-978), inventory the web API (`SUB-7`, NEU-980), or **decide** data-store topology
(`SUB-10`, NEU-984). On the last of those it does something narrower and deliberate: it makes
its own dependence on the store choice explicit, scores every model under **both** store
assumptions, and hands SUB-10 a reversal check.

**This chapter is written in a fixed order, and the order is the evidence.** §1 — the criteria
set, its weights and their sources — is committed to the repository **before any model has
been scored**, in a commit that contains no score at all. The scoring lands in a strictly
later commit. `OUT-3` requires each criterion's weight and source to be stated *before* the
scoring, and an acceptance criterion that a reader cannot check is not a criterion, so the
ordering is recorded as commit history rather than asserted in prose. §1.4 states the exact
command a reader runs to verify it.

> **Status at this commit:** §1 is complete. §2 onward are empty placeholders. **No model has
> been scored.** A reader who finds a score in this file at this commit has found a defect.

---

## 1. The criteria set — weights and sources, fixed before any scoring

### 1.1 The eight criteria

`OUT-3` names the criteria this comparison must cover: *consistency, recovery, isolation,
compatibility, latency, operability, product delivery, deployment and testing*
(`01_outcome-register.md`, `OUT-3`). They are carried one-for-one, with no criterion added
and none dropped, so that the set cannot be accused of having been shaped around a
preferred answer.

| Id | Criterion | What it asks | Weight | Source of the weight |
| --- | --- | --- | ---: | --- |
| `C1` | **Consistency and conflict-freedom** | How much *additional* conflicting-write surface does this model create over the state the categories already have? | **22** | The program's Critical risk — divergence or conflicting writes between MCP-owned and web-owned state — restated at `01_outcome-register.md` `OUT-3`; sharpened by `05_…md` §4.4, which states that `BND-S4-16` creates a second writer and that OUT-3's exactly-one-authority audit then fails unless the written categories are disjoint. This is the risk the charter calls Critical and no other; it therefore carries the largest single weight. |
| `C2` | **Isolation** | How many new I3/I5 failure modes does the model introduce for the isolation invariant, once the transport gap is closed? | **18** | `01_outcome-register.md` `OUT-4`; `06_…md` §3 (the five checks) and `F-S5-4`. Second-largest because `OUT-4` is the only other outcome in the package with a stated invariant, and because a model that forecloses isolation cannot be migrated out of. |
| `C3` | **Recovery** | After a partial or failed write, can the affected state be reconstructed or repaired without loss? | **10** | `OUT-3`'s named criterion, evaluated against `04_…md` `SC-S3-9`/`SC-S3-10` — the review-attempt row and the write-once NEU-844 quad, the one state group in this system with a database-level write-once guard. |
| `C4` | **Compatibility with the existing deployment** | What must change in what already runs, and is there a backward-compatible path? | **14** | `A-28` (`93_stand-in-assumption-register.md`) — *the existing production deployment continues and a backward-compatible migration path exists*. Weighted third because `A-28` is a **constraint on the answer**, not a preference: a model that requires the deployment to stop is outside the envelope the package is allowed to select from. |
| `C5` | **Latency on the learner path** | Does the model put a boundary crossing on a read that has a sub-second budget? | **8** | `A-25` — per-learner, per-node tutoring interaction state **with sub-second read latency on the learner's path**. Weighted at 8 rather than higher because `A-25` is a stand-in, not a measured requirement, and `93_` records its invalidating outcome rather than a number. |
| `C6` | **Operability** | How many independently operated surfaces does the model create, and does it worsen a known operational gap? | **8** | `CAP-S4-1` (no component can be the deletion owner for `SC-S3-16`/`SC-S3-17`; the obstruction is structural) and `F-S3-3` (both log tables hold learner payload with no retention window, no deletion owner, no principal field); `05_…md` `CMP-S4-19` (the logging sinks). |
| `C7` | **Product delivery** | Can the rich authenticated web surface actually be built on this model — and at what cost to the MCP contract? | **12** | `A-27` (a rich authenticated web surface whose state is **not** gate-bearing), together with the charter's own framing that existing MCP session state fitting a rich web application is a **capability to evaluate**, not evidence that it fits. Weighted fourth because a model that scores perfectly on risk and cannot deliver the product is not a candidate — but the charter's Critical risk still outranks it. |
| `C8` | **Deployment and testing** | How many deployables and how much test infrastructure does the model require to be exercised honestly? | **8** | `A-28` (the existing deployment continues) and `05_…md` §4.2 `BND-S4-17` / `F-S4-5` — the STDIO edge is a trust boundary nothing enforces, and all three journeys were dogfooded across it, so "the journey ran fine" is not evidence about the gated path. A model whose correctness can only be observed with infrastructure that does not exist is penalised here rather than silently credited. |
|  | **Total** |  | **100** |  |

**Weights are relative, not absolute.** They express only the ordering and spacing above:
`C1 > C2 > C4 > C7 > C3 > C5 = C6 = C8`. Every source is a package artifact or a register
entry, cited by id — no weight is justified by "judgement" or by an unattributed preference.

### 1.2 The scoring anchors

Each criterion is scored `0`–`5` on the anchor set below, multiplied by its weight; a model's
total is out of **500**. The same anchors apply to every criterion and every model, so a
score is a claim about the anchor, not about the model's general merit.

| Score | Anchor |
| ---: | --- |
| **5** | The model introduces **no** new exposure on this criterion, and the property holds by construction — there is nothing to enforce because there is nothing that could violate it. |
| **4** | The model introduces no new exposure, but the property holds only while a stated structural condition is maintained. The condition is nameable and checkable. |
| **3** | The model introduces new exposure that is bounded and mitigable, but the mitigation is not established by any artifact in this package at this cutoff. |
| **2** | The model introduces new exposure that is material and whose mitigation requires work no charter currently owns. |
| **1** | The model introduces new exposure that directly contradicts a stated premise of the existing system, or that a named finding shows is already unhandled. |
| **0** | The model makes the criterion unsatisfiable. |

### 1.3 Two rules that govern how three of these criteria are scored

Stated here, before the scoring, because each one changes what a score *means* — and
discovering them after the fact would be indistinguishable from a re-weight.

1. **`C1` scores the *additional* conflict surface, not the absolute one.** Every category in
   this system today is written by code with a concurrency posture the codebase itself
   describes as premised on a single writer. That baseline is common to all three models and
   therefore cannot discriminate between them; scoring it would inflate every model equally
   and change no ordering. The baseline is recorded separately as a finding (§8) rather than
   folded into a score.

2. **`C2` scores *reachability*, never present-tense compliance.** `F-S5-4` records that at
   this cutoff **no** state category reaches `holds`, and that the binding constraint is the
   **transport**, not the database schema. Present-tense isolation is therefore identically
   `fails-transport` for all three models, which makes it non-discriminating. `C2` instead
   asks how many **new** I3 (confinement) and I5 (principal-integrity) failure modes a model
   introduces, evaluated against the state the invariant would reach once the transport gap
   is closed. Per `06_…md` §3.4.1, no `C2` score above 4 may rest on failing to find a
   counter-example; a 5 requires that no counter-example is *constructible*.

### 1.4 How a reader verifies that these weights preceded the scoring

The weights above are published in a commit that contains no score. The scoring in §3 and §4
lands in a later commit. To check it:

```
git log --follow --format='%h %ad %s' --date=short \
  -- docs/research/C010-system-and-repository-architecture/07_state-ownership-model-selection.md
git show <the-earliest-sha>:docs/research/C010-system-and-repository-architecture/07_state-ownership-model-selection.md
```

The earliest commit for this path must contain §1 in full and no score table. The scoring
commit records that SHA in §3's opening line.

**If a weight is ever revised after scoring**, it is recorded in §1.5 as a numbered revision
with the reason and the score set it invalidated — never by editing the table above in place.
A silent re-weight is the specific failure `OUT-3` exists to prevent.

### 1.5 Weight revisions

None. The table in §1.1 is the table the scoring in §3 and §4 was run against.

---

## 2. The candidate models

*Empty at this commit. No model has been defined or scored.*

## 3. Scored comparison — under a shared production Postgres

*Empty at this commit.*

## 4. Scored comparison — under a separate web store

*Empty at this commit.*

## 5. The selection, the store-assumption statement, and the reversal check handed to SUB-10

*Empty at this commit.*

## 6. The assignment rule

*Empty at this commit.*

## 7. The durability property NEU-890 requires

*Empty at this commit.*

## 8. What this chapter found on the way

*Empty at this commit.*
