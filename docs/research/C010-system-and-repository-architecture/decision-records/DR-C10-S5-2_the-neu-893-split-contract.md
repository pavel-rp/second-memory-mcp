# `DR-C10-S5-2` — The split with NEU-893 is derived from the invariant's checks, not enumerated by hand

**Written by:** NEU-975 (SUB-5) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-4`
**Written:** 2026-08-21
**Model:** claude-opus-5[1m]
**Carried in:** `../06_isolation-invariant-and-the-neu-893-split.md` §5

---

## Decision

The two-list contract with NEU-893 is **derived** rather than drawn up. Three parts:

1. **The universe is defined, not assembled:** every question that must be answered before a
   state category can reach verdict `holds`. Because the verdict is produced by `DR-C10-S5-1`'s
   five ordered checks, the universe is mechanically derivable from those checks.
2. **Its boundary is stated explicitly.** The universe covers the questions the **C010 /
   NEU-893 split** ranges over. Questions owned by a sibling C010 sub-task, or by a party
   outside this charter, are outside it **by construction** — and each is named with its owner
   in `../06_…` §5.4 rather than dropped.
3. **The audit reports three counts, not two:** on List A (10), on List B (8), **on both (0)**,
   **on neither (0)**, and *routed elsewhere within C010* (7), the last enumerated by name.

The universe totals **18**; 10 + 8 = 18, so the two zeros are arithmetic rather than
assertion. NEU-893's four charter questions — identity mapping to the production Rauthy IdP,
migration of existing global rows, staged rollout, rollback — each appear on List B exactly
once and on no other list.

## Rationale

`AC-3` requires that no isolation question appear on both lists and none on neither, **reported
as counts**. The named failure mode is a question silently on both or neither, and the charter's
own diagnosis of the risk is that this package and NEU-893 "will both believe they own the
remaining decision."

A hand-enumerated pair of lists cannot rule that out. Two people writing two lists from the same
brief produce an overlap they will not notice and a gap neither is looking for, and an audit over
those lists checks the lists against each other — never against the thing they are supposed to
cover. **Deriving the universe from the checks makes disjointness structural:** each check
generates its questions, and each question is asked one thing — which list does it land on. The
audit then re-walks the derivation rather than eyeballing two tables.

**The third count is the honest part of this decision.** Several real isolation-adjacent
questions are owned by neither C010's SUB-5 nor NEU-893 — the per-row `Learner-scoped` answers
(`SUB-13`), the per-item regression audit (`SUB-8`), the deployment reachability of the STDIO
edge (`SUB-10`), the logs' deletion owner (`CAP-S3-3` / `CAP-S4-1`, `SUB-12` at the gate), the
ownership-model selection (`SUB-6`), and the scope of `NEU-850's OUT-2` (NEU-850, via
`OI-S5-1`). Two options existed: silently define the universe so they fall outside it, or state
the boundary and name every question that sits beyond it. The first makes "none on neither" true
and worthless. The second makes it true and checkable, at the cost of admitting that the split
does not cover the whole subject — which is the fact a reader most needs.

## Rejected alternatives

**1. Enumerate both lists from the charter brief and audit them against each other.**
Rejected: the audit has no independent reference, so it can only detect an overlap that is
already visible. It cannot detect a gap at all — a question nobody thought of is absent from
both lists and from the audit.

**2. Define the universe as "all isolation questions" with no stated boundary.**
Rejected: unbounded, so "none on neither" is unfalsifiable. Every question a later reader raises
becomes a counter-example, and the count degrades into a claim about the authors' imagination.

**3. Put the C010-sibling questions on List A because C010 owns them.**
Rejected: List A is what **this chapter closes**, and it closes none of them. Listing them would
assert coverage this sub-task does not provide, which is the exact failure the traceability set
exists to prevent — a row with no evidence reads as though the outcome were checked.

**4. Put them on List B because this chapter does not close them.**
Rejected symmetrically: it would hand NEU-893 six questions it does not own and cannot answer,
including two (`SUB-13`'s per-row answers, `SUB-6`'s ownership-model selection) that must be
settled *before* an isolation mechanism can be designed at all. Over-assigning to the mechanism
owner is not a safe default.

**5. Suppress the third count and report only the two required zeros.**
Rejected: the two zeros would then be an artefact of a conveniently drawn boundary, and nothing
in the published record would let a reader tell the difference between a clean split and a
narrow one. The `AC-3` counts are reported *in addition to*, not instead of, the boundary.

## Consequences

- **NEU-893 receives 8 questions, not the 4 the charter named.** The two additions are `H7` —
  an identity gate on the transport that has none (`BND-S4-17`, owner `nobody`) — and `H6` —
  whether the resolved identity carries its `sub`/`azp` provenance so I5 is answerable at all
  (`OI-S5-2`). Both fall out of the derivation; neither was in the brief. `H5` and `H8` restate
  carried inputs (`OI-S1-2`, `A-28`'s envelope) as questions NEU-893 must answer rather than
  facts it may assume.
- **A sequencing consequence NEU-893 must plan around** (`../06_…` §4.3): I4 precedes I5, so
  the STDIO gap currently **masks** the `sub`/`azp` defect. Closing the transport gate does not
  make the system isolated — it makes the principal-kind problem visible. A rollout that
  schedules the transport gate last discovers `H6` at the end.
- **The boundary is now a published artifact**, so a later sub-task that wants to move a
  question across it must say so rather than quietly re-scope.
- **`OI-S5-1` is routed to NEU-850 rather than to either list** — a scope question about the
  consumed constraint belongs to its author, through `OUT-1`'s drift check.
- **A cost, stated:** the universe is only as complete as the five checks. If `DR-C10-S5-1`'s
  check set is missing a failure mode, this contract inherits the same hole in exactly the same
  place, and the audit will still report 0 and 0. The two records share a single point of
  failure, and that is the price of deriving one from the other.

## Evidence

- **The requirement:** the SUB-5 charter's `AC-3` and its four named NEU-893 questions;
  charter assumption 3 (`confirmed`) — this package decides the invariant, NEU-893 the
  mechanism.
- **The derivation source:** `DR-C10-S5-1` and `../06_…` §3.3 (checks I1–I5), §3.5 (the check →
  owner mapping the two lists fall out of).
- **The carried inputs on List B:** `../90_open-items-and-provisional-register.md` `OI-S1-2`
  (charter assumption 30, which names SUB-5 as its consumer and is carried forward, not closed);
  `../93_stand-in-assumption-register.md` `A-28` (the NEU-893 stand-in, its tolerance envelope
  and its invalidating outcome).
- **The routed-elsewhere owners:** `OI-S3-1` and the `OUT-3` authority matrix (`SUB-13`);
  `../91_caps-and-incomplete-scope.md` `CAP-S3-3`, `CAP-S4-1` and `F-S3-3` (the deletion-owner
  gap); `../05_…` §4.2 `BND-S4-16` with `F-S4-4` (`SUB-6`); `F-S4-5` (`SUB-10`).
- **The transport facts behind `H7`:** `../05_…` §4.2 `BND-S4-17` (trust, unenforced, owner
  `nobody`); `src/transport/main.ts:55`–`:59` against `src/transport/http.ts:163`–`:165`,
  `:106`–`:120`, `:172`–`:174`, `:185`–`:187`, read on `origin/develop` at the **2026-08-21**
  cutoff.
- **Evidence class:** register and document citation by id, plus direct file inspection at cited
  lines, per `../00_method-and-provenance.md` §5.
- **Status:** `confirmed` for the derivation and the counts; `consumed` for
  `NEU-850's OUT-2`, `A-28` and charter assumption 3; `[unconfirmed]` for the production-token
  fact behind `H5`, carried as `OI-S1-2`.

## Revision trigger

Revise this record when any of the following becomes observable:

- **`DR-C10-S5-1`'s check set changes.** The universe is derived from it, so a sixth check, a
  removed check, or a reordering changes the universe and both counts. The two records are
  revised together or not at all.
- **NEU-893 publishes a scope that does not match List B** — it declines a question on it, or
  claims one on List A. Either is a real disagreement about the split and must be settled in the
  record rather than absorbed.
- **A question is found that gates a `holds` verdict, is owned by C010 or NEU-893, and is on
  neither list.** That is the `AC-3` failure mode occurring, and it falsifies the `0` in the
  "on neither" row.
- **A question moves across the stated boundary** — e.g. `SUB-10` concludes the STDIO edge is
  unreachable and someone proposes dropping `H7`. The invariant's verdict is unconditional on
  reachability (`../06_…` §4.2), so this would be a change to the contract, not an application
  of it.
- **`SUB-6 (NEU-976)` selects a hybrid ownership model.** A second writer of learning state adds
  a confinement surface the current List B does not mention, and `BND-S4-16` becomes a real
  boundary (`F-S4-4`).
