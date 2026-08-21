# `DR-C10-S13-1` — Each of the 45 state categories is assigned exactly one authority by mechanical application of SUB-6's rule, with under-determination routed rather than repaired

**Written by:** NEU-977 (SUB-13) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-3`, and `OUT-9`'s second half
**Written:** 2026-08-21
**Model:** claude-opus-5[1m]
**Carried in:** `../08_per-state-authority-matrix.md` §5–§13

---

## Decision

**Every one of the 45 state categories in `../04_state-category-inventory.md` §3 is assigned exactly one
authority — a `CMP-S4-*` component id from `../05_…md` §3 — by applying `../07_…md` §6.1's six-clause
first-match-wins rule mechanically, row by row, and every row publishes the clause number that produced
it.**

The decision has three parts, and each has a wrong answer:

1. **The assignment is mechanical, not curated.** No row's authority is chosen on its merits. Where the
   rule's output looks surprising — `SC-S3-43`, where all four of clause 3's tests pass and the exception
   still does not fire because `../07_…md` §6.3's list is empty under `M-A` — **the rule's output is
   recorded and the surprise is explained**, not overridden.
2. **Where the rule under-determines a row, the rule's own tie-breaks resolve it and a finding is routed
   to SUB-6.** The rule is never patched locally, and the matrix never records a shared authority, a
   split authority, or a row deferred to a later sub-task. Two rows required this: `SC-S3-33`/`SC-S3-34`
   (`F-S13-1`) and `SC-S3-45` (`F-S13-2`).
3. **A category that cannot be assigned would be a named finding with a named owner — and there are
   none.** All 45 took exactly one authority. The exactly-one-authority audit reports **0** rows with
   zero authorities and **0** with two or more.

**The wrong answer this decision forecloses**, stated plainly: any row in the published matrix carrying
two authorities, a role name instead of a component id, a blank authority, or an authority reached by a
judgement call the document cannot show its work for.

---

## Rationale

`OUT-3` names the criteria this decision is scored against, and they are stated here **before** the
scoring rather than reconstructed from it:

| Criterion (from `OUT-3`) | Weight | How the decision scores |
| --- | --- | --- |
| **Exactly one authority per category, mechanically auditable** | **Decisive** — this is the Critical risk the charter names. Any approach that cannot be audited mechanically fails outright. | Satisfied. Each row's authority is a single parseable `CMP-S4-*` marker; §10.1's audit is a parse over §8's blocks, not a reading. |
| **Every `OUT-2` row appears in the matrix, and every matrix row in `OUT-2`** | **Decisive** | Satisfied, in both directions, zero unmatched (§10.2). |
| **All nine attributes populated per category** | **High** — a matrix of authorities without consistency, freshness and concurrency is not usable by an implementation charter. | Satisfied for all 45 rows. A cell that cannot be answered from merged inputs says so and cites the finding or item that owns the gap; none is blank or guessed. |
| **Reproducible by a later sub-task** | **High** — SUB-14 must be able to re-derive the assignment, not merely read it. | Satisfied. The clause is published per row; clause 2's `../05_…md` lookup is written out as a by-id membership test (§6); both audits and both distributions publish counts. |
| **Does not re-open a settled upstream decision** | **High** | Satisfied. `M-A` is consumed, not re-scored; the two rule defects are routed to SUB-6, not repaired here. |

**On mechanicality being decisive rather than merely desirable.** The charter's Critical risk is two
implementation charters writing the same category from different components and discovering it in
production. A curated matrix — one where each row's authority was chosen thoughtfully — would be
*persuasive* but not *checkable*: a reader disagreeing with a row would have no way to establish whether
the row was wrong or merely differently judged. A mechanical matrix converts every disagreement into a
question with a determinate answer: which clause fired, and does the row's own inventory cells satisfy
it. That is what makes SUB-14's validation possible at all, and it is why mechanicality is weighted
decisive rather than traded off against elegance.

**On routing rather than repairing.** Two rows exposed genuine gaps in `../07_…md` §6.1. The tempting
repair — adding a seventh clause locally, or amending tie-break (b) in this chapter — would produce a
matrix that no longer applies the published rule, which destroys the reproducibility criterion above and
silently forks the rule into two versions. Routing to SUB-6 keeps one rule and one matrix, at the cost of
leaving two rows whose reasoning is longer than the others'. That cost is paid explicitly and at the row.

**On `A-25`, `A-27`, `A-28` and `A-29`, named here in the rationale and not only in Evidence.** Four
assignments rest on stand-ins, and each names its stand-in at the assignment with its tolerance envelope
and its invalidating outcome. **`A-27` is the one that carries this decision's weight.** Its envelope
tolerates arbitrarily rich client state *provided the server re-evaluates every gate from server-held
state*; its invalidating outcome is offline-capable or client-authoritative learning state. Assigning
`SC-S3-43` to `CMP-S4-9` rather than to the web tier is what makes that proviso **structurally true
rather than a convention** — and it is the row where a curated approach would most plausibly have gone
the other way, since all four of clause 3's tests pass on the merits. `A-28` bears on `SC-S3-45`, whose
literal clause-4 reading would hand identity to a third party — `A-29`'s invalidating outcome by another
door. `A-25` bears on `SC-S3-42`, whose sub-second requirement `SPK-S6-1` measures at ≤0.02% of budget.
`A-29` bears on `SC-S3-44`, whose expiry and revocability are preconditions of the assignment rather than
later features.

---

## Rejected alternatives

**One authority per *table* rather than per category.**
Rejected because `../04_state-category-inventory.md` `DR-C10-S3-1` already established the opposite and
the consequence is concrete: `public.learning_chunks` alone yields three categories with three different
writers — author-written content, scheduler-written SM-2 state, audit-written validator report — and
`session_question_attempts` yields two, one mutable and one write-once. A per-table matrix would hand
`OUT-3`'s exactly-one audit rows needing two or three authorities, which is the failure the audit exists
to detect. **Cost of rejecting:** a larger matrix, and the §11.2 observation that two rows in one table
can take different authorities, which reads as an inconsistency until explained.

**Split authority between the writer and the gate that reads the value.**
Rejected because it is the Critical risk restated as a design. A category with a "primary" and a
"secondary" authority has two writers the moment anyone implements the secondary, and the matrix would
have licensed it. `../07_…md`'s tie-break (d) makes this explicit — two producing components is *"not a
tie, a defect in the inventory"* — and this decision extends the same discipline to every
under-determined case. **Cost of rejecting:** `SC-S3-33` and `SC-S3-34` needed a disclosed tie-break to
reach one authority, and the disclosure is longer than an assignment would have been.

**Rewrite or extend SUB-6's clause list locally to cover the two under-determined rows.**
Rejected because it forks the rule. A seventh clause published in `../08_…md` would mean the matrix
applies a rule that `../07_…md` does not contain, and every future application — SUB-14's validation,
SUB-16's republication — would have to know which version to use. It also violates the package's
append-only discipline in spirit: a sibling's merged decision is not this sub-task's to amend. **Cost of
rejecting:** the rule ships with two known defects, and a reader of `../07_…md` alone will not see them.
`F-S13-1` and `F-S13-2` are the mitigation, and both name SUB-6 as the party who can act.

**Defer the two under-determined rows to SUB-14 as open questions.**
Rejected because `OI-S2-2`'s closure condition forbids it in terms: *"a matrix that omits one of the
three, or names two owners for one, does not close it."* Deferring `SC-S3-33` and `SC-S3-34` would leave
`OI-S2-2` open, `FL-S4-16` undetermined and `F-S4-3` undischarged, and would hand SUB-14 a validation task
with nothing to validate for those rows. A deferred row is not a smaller commitment than a wrong one — it
is a matrix that does not do its job. **Cost of rejecting:** this chapter takes a position on two rows
where the rule was silent, and may be overturned.

**Assert resolved `Learner-scoped` values to close `OI-S3-1`.**
Rejected because `../04_…md` §2 defines the column as recording the scoping **question**, §6 establishes
by search that **no ownership column exists on any table today**, and `NEU-850`'s `OUT-2` is a decision to
honour rather than an existing fact. Closing the item would have required writing a schema fact that is
false. **Cost of rejecting:** `OI-S3-1` stays open and its closure condition is contested as unsatisfiable
(`F-S13-3`) — an uncomfortable outcome that is nonetheless the only honest one.

**Trim the inventory to the charter's 25–30 categories.**
Rejected because the merged artifact publishes 45 and a matrix that covers 30 of them fails §10.2's
inventory→matrix direction by 15 rows. The charter's sizing is stale, not authoritative. **Cost of
rejecting:** 450 authored cells against a 250–300 estimate, recorded as `F-S13-4` so the surplus is not
later mistaken for scope creep.

---

## Consequences

**What this commits the programme to.**

- **Twelve of `../05_…md`'s twenty components hold authority over nothing**, including every `Z-EXT`
  component, the web tier, the STDIO edge, the MCP tool surface, the authoring pipeline, the gate runner,
  the content serve path, the drift-verdict cache and the derived-extract producer. Several appear
  repeatedly as write *paths*. An implementation charter that gives any of them a write authority is
  contradicting this record, not extending it.
- **`CMP-S4-9` is authority for 21 of 45 categories** — nearly half — which makes the persistence-adapter
  boundary the single highest-traffic authority in the system and the place a violation would be most
  costly to detect late.
- **`OI-S2-2` and `OI-S4-1` are closed**, `FL-S4-16`'s undetermined authority is resolved, and `F-S4-3` is
  discharged. `OUT-9`'s second half is satisfied.
- **A re-import of the DP-map copy is `CMP-S4-7`'s write, executed through `CMP-S4-13`.** Any other
  component refreshing that copy is a second writer.

**What this forecloses.**

- **The web tier can never acquire gate authority, and under `M-A` it acquires no authority at all.**
  `SC-S3-43` is the only row that would move under a reversal to `M-C`, and it would move because
  `../07_…md` §6.3's list gained an entry — not because this matrix was re-judged.
- **A hybrid ownership model is not merely unselected but unrepresented.** `F-S4-4` records that a hybrid
  would owe a disjointness demonstration between web-written and core-written categories; §11's
  distribution shows the web tier's set is **empty**, so no such demonstration is owed and none is
  provided. A later hybrid would have to produce one from scratch.

**What this makes more expensive.**

- **Changing any row's authority now costs a validation cycle.** SUB-14 validates against this revision
  and SUB-16 republishes; a change after SUB-16 invalidates whatever SUB-7, SUB-8 and SUB-10 built on it.
  This is intended — the matrix is meant to be expensive to contradict — but it means the pre-validation
  window (§2) is the cheap time to object.
- **Eighteen categories carry a migration *shape* without a destination** (`OI-S13-1`, owner SUB-10). Each
  names preconditions that are cheap now and expensive later: a principal field for the log tables, a
  retention window and named deletion owner for the `PLA-*` extract, expiry and revocability for the
  handoff envelope, persistence rather than derivation for the mastery-gate composite.

**Migration path implied.** For 27 `existing` rows: none — the category is already in the store the model
places it in, under the authority the model assigns, so `M-A` is confirmed as a description of the system
as built for those rows rather than a change to it. For the 18 store-`none` rows: the path is a shape
until `OUT-8` lands. **The single highest-leverage item is `SC-S3-45` acquiring a store** — it is what
turns the deletion owner for `SC-S3-16`/`SC-S3-17` from unassignable into merely unassigned, at which
point `CAP-S4-1` becomes liftable.

---

## Evidence

- **The row domain:** `../04_state-category-inventory.md` §3 (45 entries), §8 (counts: 30 + 11 + 4 = 45),
  §9 (*"receives 45 rows"*). Verified mechanically at the 2026-08-21 cutoff: 45 distinct `SC-S3-<n>` ids,
  minimum 1, maximum 45, no gaps. `../04_…md` §3's heading reads "41" and is stale — **`F-S4-2`**, cited
  and not re-filed.
- **The authority vocabulary:** `../05_system-context-and-responsibility-boundaries.md` §3.1 (zones), §3.2
  (`CMP-S4-1` … `CMP-S4-20`), §4.2 (`BND-S4-*`), §5 (`FL-S4-*`), §7.3 (the serve-path walk and the
  four-row quarantine disposition), §8.1–§8.2 (state placement), §9.2 (the deletion-owner gap), §12
  (*"SUB-13 is NEU-977"*).
- **The assignment rule:** `../07_state-ownership-model-selection.md` §6.1 (six clauses, four tie-breaks),
  §6.2 (the `SC-S3-3` and `SC-S3-37` demonstrations, both reproduced at their rows), §6.3 (the exception
  set, **empty** under `M-A`, retained rather than deleted); `DR-C10-S6-1` (the model itself).
- **The drift contracts:** `../03_execution-environment-and-citation-drift-component.md` §3.5 (one gate
  verdict per executed unit, in a terminable isolate under a host-enforced wall-clock bound), §4.2 (the
  producer is the only writer; exactly one request per citation; corpus walk prohibited;
  `per_citation_staleness_window` **90 days, declared not measured**; `per_source_revalidation_budget`
  **0 for all twelve sources**; a re-check that cannot complete yields **`verdict stale`**, a recorded
  state and never a partial verdict), §4.3 (the cache is internal, keyed-read-only, no egress, computes
  nothing), §4.4 (the four-row disposition; the learner's request always completes).
- **The stand-ins, by id, named in the Rationale above and not only here:** `A-25`, `A-27`, `A-28`,
  `A-29` — `../93_stand-in-assumption-register.md`, which is **closed at five entries**. `A-26`
  introduces no category, which is why five stand-ins map to four assumed rows.
- **The spike, inheriting its expiry:** `SPK-S6-1` — MCP tool boundary p50 **0.077 ms** / p95
  **0.189 ms** at 714 B, ≤0.02% of `A-25`'s 1000 ms budget. Residuals inherited: excludes the network hop,
  and is per-call, so *k* reads pay *k* crossings. **Expiry 2027-08-21.**
- **The caps this decision is bounded by, cited and not re-filed:** `CAP-S4-1` (structural; **stays
  open**), `CAP-S3-1`, `CAP-S1-3`, `CAP-S6-1` — `../91_caps-and-incomplete-scope.md`.
- **The inbound findings reconciled at their rows:** `F-S3-2` (the `NEU-987` mapping error), `F-S3-3`
  (retention and deletion gap on both log tables), `F-S4-3`, `F-S4-4`, `F-S4-6`, `F-S6-3` (the
  one-active-learning-session rule is not database-enforced) — `../02_findings-register.md`.
- **The findings this decision raises:** `F-S13-1`, `F-S13-2`, `F-S13-3`, `F-S13-4`. **The open item it
  raises:** `OI-S13-1`. **The items it closes:** `OI-S2-2`, `OI-S4-1`.
- **The independent cross-check:** `../06_isolation-invariant-and-the-neu-893-split.md` §3.3's census —
  19 `no` / 18 `question — open` / 8 `yes` = 45, **26 in-domain** — reconciles exactly with clause 5's
  count of 20 (26 − 5 taken first by clause 1 − 1 by clause 4). Reproduced at `../08_…md` §11.1.

---

## Revision trigger

**Any one of the following observable events reopens this decision.** None is a date, and none is a
party's satisfaction.

1. **`SUB-14 (NEU-978)` publishes a validation finding against a row's authority** — that is, a row whose
   cited clause does not reproduce its recorded authority when re-applied to `../04_…md`'s cells, or a row
   the isolation invariant rejects. The affected row's assignment reopens; the method does not.
2. **`SUB-6 (NEU-976)` amends `../07_…md` §6.1** in response to `F-S13-1` or `F-S13-2` — a seventh clause,
   an amended tie-break (b), or a corrected clause-4 component id. `SC-S3-33`, `SC-S3-34` and `SC-S3-45`
   are re-derived under the amended rule.
3. **`../07_…md` §6.3's exception set becomes non-empty**, which is what a reversal from `M-A` to `M-C`
   under `OI-S6-1` would produce. `SC-S3-43` moves to `CMP-S4-3`; nothing else in the matrix changes.
4. **`SC-S3-45` acquires a store, or a principal field lands on `SC-S3-16`/`SC-S3-17`.** `CAP-S4-1` becomes
   liftable and the deletion owner for both log tables becomes assignable — an assignment this matrix
   currently cannot make.
5. **`SUB-3 (NEU-973)` publishes a revised inventory whose entry set differs from these 45 ids** — a
   category added, removed, merged or split. §10.2's audit fails in one direction and the affected rows
   are authored, removed or re-derived accordingly.
6. **A component is added to or removed from `../05_…md` §3.2's inventory.** Clause 1's "the component
   whose process computes it" and clause 2's `../05_…md` lookup both resolve against that inventory, so a
   change to it can change a clause's output without any change to the rule or to `../04_…md`.
