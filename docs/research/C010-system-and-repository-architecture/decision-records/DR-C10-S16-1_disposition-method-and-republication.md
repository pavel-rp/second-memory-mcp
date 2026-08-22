# `DR-C10-S16-1` — How a routed validation finding is dispositioned, and what a republication may and may not change

**Written by:** NEU-979 (SUB-16) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-3`, `OUT-4`
**Written:** 2026-08-22
**Model:** claude-opus-5[1m]
**Carried in:** `../10_republished-authority-matrix.md` §2, §5, §6, §7

---

## Decision

**Four decisions, all methodological. This record decides nothing about who owns what — no authority in
the matrix is originated, changed or re-scored by it.**

1. **A disposition is a published statement with a named owner, never a silent absorption.** Every one
   of SUB-14's eleven routed findings is answered in a register at `../10_…md` §5 that states, per
   finding: its cause **as SUB-14 named it**, the disposition, the **owner**, and the row(s) affected.
   **A "no change" disposition carries its reason.** A disposition without an owner is itself a finding.
   **Received and dispositioned are published as equal counts** — 11 and 11 — taken independently at two
   locations (`../09_…md` §15.3 and `../02_findings-register.md` `### SUB-14`) that agree.

2. **A row is revised only by re-running SUB-6's published assignment rule against it — never by fresh
   judgement.** `../07_…md` §6.1's six clauses are first-match-wins; re-running them is a mechanical
   derivation whose steps are published at the row. Where the rule cannot resolve a row, the residue is
   a **model-cause finding re-routed to SUB-6** and, where no answer can arrive, **carried as a cap with
   a named owner** — never re-decided here. Every revised row **cites the clause** that produced it and
   repopulates **all nine** `OUT-3` attributes or explicitly carries a finding at the missing one.

3. **Both of SUB-13's mechanical audits are re-proved over the republished revision, never inherited.**
   Exactly-one-authority and state-inventory↔matrix are each re-run by parsing `../10_…md`'s own §8
   table and `../04_…md` §3 afresh, and every count is published — including the unmatched counts in
   **both** directions. Reproducing SUB-13's numbers is the *result*, not the method: an audit that
   quoted SUB-13's counts would prove nothing about this revision.

4. **A discrepancy in a merged sibling's chapter is corrected by naming and dispositioning it, not by
   editing the chapter.** The direction of every discrepancy is stated — which side says what — and
   neither side is silently reconciled. `../05_…md`, `../08_…md` and `../09_…md` are byte-identical
   after this pass.

---

## Rationale

**On the disposition register (1).** `OUT-4` asks for *the disposition of every isolation-invariant
failure SUB-14 routed*, and the failure mode it exists to prevent is a republication that quietly
absorbs a finding into a revised cell, leaving no way to tell an answered finding from a forgotten one.
Publishing the count on both sides is the cheapest possible check against that: a reader who does not
trust the register can count the inputs themselves in two places and compare. The **owner** requirement
is the other half — nine of the eleven dispositions are *"no change here; owned there"*, and a
no-change disposition without a named party is indistinguishable from a shrug.

**On revision by rule (2).** This sub-task's boundary is explicit: *you disposition and republish; you
originate no authority assignment and re-score no model*. The rule is the mechanism that makes those
compatible. Re-running a published, ordered, first-match-wins rule is not a judgement — it is a
derivation any reader can repeat and disagree with at a specific clause. The two findings that looked
most like assignment defects both dissolved this way: `F-S14-7`'s "inconsistency" between `SC-S3-26`
and `SC-S3-45` is **clause order**, not two different judgements (clause 1 fires on the process-local
row, so clause 4 is never reached; clause 1 falls through on the other, so clause 4 fires); and
`F-S14-9` resolves by clause 2 with tie-break (c) straight back to `CMP-S4-17`. Had either been settled
by fresh judgement, the answer might have been the same and the *basis* would have been unauditable.

The escape hatch matters as much as the rule. `F-S14-3` is genuinely unresolvable by re-running
anything: `SC-S3-45`'s authority is external, so no access-path set can be enumerated for it under any
target state. The rule produced the right answer and the obstruction is downstream of the answer. That
is exactly the case the charter calls a **model-cause finding** — re-routed as `F-S16-2`, carried as
`CAP-S16-1`, and not re-decided here.

**On re-proving the audits (3).** SUB-13 proved exactly-one-authority over *its* table. A republication
that changed a row and inherited the proof would be publishing an unproven property. The audits are
therefore run as a parse of the republished document itself, with the parse rule stated so SUB-11 can
repeat it. Two mechanical details are worth carrying: the row filter must require the **full nine-column
shape**, because §5's and §6.4's tables also carry `SC-S3-<n>` in their first cell and over-match by six
rows; and the `../04_…md` extraction must filter the bare template token `SC-S3-<k>` in §2, which
`F-S13-4` already records as a trap for a naive extractor.

**On not editing a merged sibling (4).** This is the load-bearing decision of the whole pass, and it is
made against an apparent instruction to the contrary. SUB-14 hands `F-S14-8` to SUB-16 as *"the only
party that can amend `05_…md` without violating the append convention"*. Three reasons say that assigns
**ownership of the outcome**, not a licence to rewrite a merged chapter:

- **The package's discipline is append-only**, and every register and chapter in it is written on that
  premise. A pass that edits a sibling's merged chapter to remove a contradiction destroys the evidence
  that the contradiction existed.
- **`../09_…md` §12 forbids it in its own words** — reconciling the two sides *"would destroy the record
  of which one was written first and on what evidence"*.
- **SUB-14 amended neither artifact itself.** `05_…md` and `08_…md` are not in its changed-file set.
  Its practice is the better guide to its meaning than a single clause read in isolation.

So the correction *is* the finding plus its disposition. `F-S16-4` carries all three `05_…md` residues
to `SUB-4 (NEU-974)`, each with its direction named, and `../10_…md` §6.3 publishes the reasoning where
a reader hits the contradiction rather than only in a register.

---

## Rejected alternatives

**Reconcile `05_…md` by editing it.** Rejected on the three grounds above. It would have produced a
tidier package and a worse record: two of the three residues are **intra-document** contradictions,
the first found in this package, and an edit would erase the only evidence that a merged document
contradicted itself — which is a fact about the authoring process, not just about the flows.

**Decide the model questions locally.** `F-S16-2` and `F-S16-3` both have a defensible answer that this
sub-task could have written in a sentence. Rejected because the charter forbids it and because the
prohibition is right: a matrix that answers its own model questions is no longer an application of a
selected model, and the next pass has no way to tell which parts of the model were selected and which
were improvised downstream. The cost is real and is recorded — `OI-S16-1` states plainly that the
correct owner is closed and no scheduled pass will answer them.

**Publish one merged census.** Rejected. Census A (target state (b)) and Census B (composed state (c))
answer different questions and are **not summable**; collapsing them would produce a number that means
nothing and would let a reader take a composed-state verdict as a statement about the system as it
stands. Both are carried as separate columns on every row.

**Re-run SUB-14's invariant census over the republished revision.** Rejected as unnecessary, and the
reasoning is published rather than assumed (`../10_…md` §8.1): no authority, clause, `Learner-scoped`
value or status marking changed; no row was split, merged, added or removed; and the write path a
durable append is issued from is an input to **none** of `I1`–`I5`. A re-run would have reproduced the
same 90 verdicts at the cost of implying the record was revision-dependent in a way it is not.

**File a second cap for the deletion-owner gap, or for the QA no-op.** Rejected. `CAP-S4-1`,
`CAP-S5-1`, `CAP-S6-1` and `CAP-S1-3` already carry these; they are **cited at the point of use and
none is re-filed or closed**. A structural gap does not become more owned by being filed again.

---

## Consequences

- **The matrix's content is unchanged and its status is not.** All 45 authorities, clauses and status
  markings are identical to `08_…md`'s. What the republication adds is a **post-validation revision
  marker**, eleven published dispositions, two revised rows' non-authority attributes, two re-proved
  audits and a residual statement. Consumers cite the marker, not the pre-validation revision.
- **Two rows are `revised`, six are `noted`, thirty-seven are `carried`.** The `Rev` column makes this
  machine-readable, so a consumer can diff intent rather than text.
- **`OI-S14-1` closes** on the strength of decision 3's mechanical check, and `09_…md` §15's verdicts
  stand over this revision without re-validation.
- **`SC-S3-45` is permanently unimprovable**, and any downstream "rows remaining to fix" count that
  includes it overstates the remaining work. `CAP-S16-1` exists to make that visible.
- **Three `05_…md` residues stay unrepaired by design.** A later pass reconciles a *stated* discrepancy
  with a named direction, which is strictly more information than a silently-reconciled document.
- **The two model questions have a correct owner that cannot act.** This is the second occurrence of the
  backwards-routing structure `OI-S6-1` first recorded, and it is now recorded from the opposite end as
  `OI-S16-1`. The package should expect its completeness gate to absorb both.
- **Twenty-four wrong identifiers stay in five merged files.** `F-S16-1` names them; `../10_…md` writes
  only correct ids. A consumer routing by tracker id rather than sub-task label mis-delivers three of
  SUB-14's four handoffs until the gate reconciles them.

---

## Evidence

- **The rule:** `../07_state-ownership-model-selection.md` §6.1 (six ordered clauses, first-match-wins;
  the four tie-breaks), §6.3 (the presentation-exception list, **empty** under `M-A`).
- **The invariant:** `../06_isolation-invariant-and-the-neu-893-split.md` §3 (`I1`–`I5`, the closed
  six-verdict set, the first-failing-check rule), §3.2 (target-state forms (b) and (c)), §3.4.1 (the
  asymmetry rule).
- **The inputs:** `../08_per-state-authority-matrix.md` §5, §9, §10; `../09_authority-matrix-validation.md`
  §12, §15, §16, §17; `../04_state-category-inventory.md` §3; `../05_system-context-and-responsibility-boundaries.md`
  §3.2, §5.
- **The audits, re-run:** `../10_republished-authority-matrix.md` §7. Exactly-one-authority — **45 rows,
  0 with none, 0 with two or more, 45 with exactly one, 45 distinct ids, 0 duplicates, 0 non-`CMP-S4-*`**.
  State-inventory↔matrix — **45 inventory ids (min 1, max 45, no gaps), 0 unmatched in both directions**.
  Clause distribution 1→13, 2→3, 3→**0**, 4→1, 5→20, 6→8; status distribution 30 / 11 / 4.
- **The disposition counts:** 11 received, 11 dispositioned, 0 undispositioned, 11 of 11 with a named
  owner. `../10_…md` §4.1 and §5.
- **Stand-ins cited at the verdicts they decided, not re-filed:** `A-25` (`SC-S3-42`), `A-27`, `A-28`
  (`SC-S3-45`), `A-29`. `../93_stand-in-assumption-register.md` is **closed at five entries** and was
  not appended to.

---

## Revision trigger

This record is revised if any of the following lands:

- **`SUB-6 (NEU-976)` — or `NEU-896` at convergence — answers `F-S16-2` or `F-S16-3`.** Either answer
  changes what "re-running the rule" produces for a projection-of-external-state row, and `SC-S3-45`'s
  place in the invariant's domain along with it.
- **`SUB-4 (NEU-974)` amends `05_…md`** in response to `F-S16-4`. Decision 4's *outcome* changes even
  though its *method* does not: the residues would then be reconciled at their source, and `../10_…md`
  §6.3's disposition becomes historical rather than operative.
- **`SUB-10 (NEU-984)` publishes the store topology.** `OI-S13-1`'s eighteen shapes resolve to
  destinations, `F-S14-5`'s indeterminacy at `SC-S3-31` closes, and the revised write path for
  `SC-S3-16`/`SC-S3-17` acquires a destination it does not have here.
- **`NEU-850`'s `OUT-2` ships.** Census B stops being a composed hypothetical and becomes an
  observation, at which point the two censuses collapse into one **by fact** rather than by an
  authoring choice — which is the only way this record ever permits them to be collapsed.
- **`SUB-12 (NEU-986)` reconciles the tracker-id drift** and decides whether an erratum chapter or a
  standing convention is the repair. `F-S16-1`'s instance count is a snapshot at this cutoff.
