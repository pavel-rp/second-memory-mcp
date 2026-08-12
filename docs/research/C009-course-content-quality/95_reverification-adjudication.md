# 95 — Adjudication of the independent gate re-verification

**Task:** NEU-970 — adjudication of `94_independent-gate-reverification.md`
**Model:** claude-opus-5
**Date:** 2026-08-12
**Base:** `origin/develop` @ `7e82017`

## 0. The result, stated first

**The independence condition is satisfied. The gate's `C-3` failure is discharged. Neither of
`94_`'s two cross-reference failures survives, so its headline verdict does not stand.**

`94_` was produced by `gpt-5.6-sol[1m]`, a model that authored nothing in this package, which is
precisely the condition `91_…` §R.2 set when it re-owned nine caps at `OI-S12-2` *"to a reader
whose model id differs"*. That much is unambiguous and is the artifact's principal value.

Its substantive claims divide three ways. Its independent re-derivations and register parses
**stand and strengthen the package**. Its two reported cross-reference failures are **both
refuted** on evidence recorded in §4 below. Its three "stale figure" disagreements are
**timestamp deltas, not defects** — each is the arithmetic consequence of `93_…` landing after
`92_…` ran.

**This record closes no cap and sets no status.** It records an adjudication; the ledger owner
decides what that discharges.

## 1. What this record is, and what it is not

**It is not independent, and it must not be read as a second independent verification.** This
record is authored by `claude-opus-5` — the same model family as `claude-opus-5[1m]`, which
authored every document in the package — and by the party that wrote the brief `94_` executed.
Under `C-3` this is an interested adjudication, not a fresh gate run.

That is survivable only because **every claim below is checkable from the file and line evidence
it cites, without trusting its author.** Where this record asserts a refutation it quotes the
text that refutes; where it asserts a count it names the parse. A third party who disagrees can
disagree from the same evidence. Nothing here rests on the adjudicator's judgement alone.

## 2. `94_` lands verbatim, and is not corrected

`94_` is committed exactly as `gpt-5.6-sol[1m]` produced it, including the two findings this
record refutes. **Editing it was refused,** on the precedent this package set for itself when
`13_…` §5 declined to correct `11_…` §10.2 in place:

> A unilateral edit of another sub-task's published table — even a correct one — is the failure
> mode the append-only convention exists to prevent.

The identical reasoning protects an external reviewer's report at least as strongly. An
adjudication that silently rewrites the artifact it adjudicates destroys the only property that
made the artifact worth commissioning: that it was produced without this package's authors in
the loop. **The disagreement is routed here, in a separate record, and `94_` stays as filed.**

## 3. Finding-by-finding disposition

| `94_` claim | Disposition | Basis |
| --- | --- | --- |
| Model independence satisfied; 45 attribution lines, all `claude-opus-5[1m]`, vs its `gpt-5.6-sol[1m]` | **Stands** | Verified; discharges `C-3` — §7 |
| §7 failure 1 — `93_`:87 cites an unresolvable `../01_provenance-and-rights.md` | **Refuted** | The path is quoted data in a corrections table, not a reference — §4.1 |
| §7 failure 2 — `13_`:59 cites `08_…` §0.2, which does not exist | **Refuted** | `08_` §0 statement 2 is the quarantine statement `DEC-11` cites; resolvable under `94_`'s own stated rule — §4.2 |
| Re-derivation A — §10.1 is `deterministic 15 / schema 4`, contradicting §10.2's `14 / 5` | **Stands**, sequencing claim qualified | Independently reproduced here; but the run was not blind — §5 |
| Re-derivation B — 64 caps, agreeing with `91_…` §R.1 | **Stands** | Agreement between independent parses |
| Register integrity — 112/112 open items, 64/64 caps, zero dangling both directions | **Stands, and is new** | Stronger than `92_…` §5's figures; mechanically checkable — §7 |
| Class-7 discipline — 28 occurrences, all prohibitive/definitional, zero actual claims | **Stands** | Full independent re-adjudication of every occurrence |
| Rights scans — 40 fenced blocks and 14 endpoint hits, all benign | **Stands** | Independent adjudication, not deference to a prior one |
| §4 node audit passes vacuously, denominator 0, 179/179 `deferred-provisional` | **Stands** | Correctly labelled vacuous rather than passing |
| File count 38 → 39; class-7 25 → 28; `92_` §5's 103/63 → 112/64 | **Reclassified** — timestamp deltas, not defects | §6 |
| `93_`:127 "Status: applied" is avoidably ambiguous wording | **Stands** as an observation | Correct; it is not a governed decision state |

## 4. The two cross-reference failures, refuted

### 4.1 `93_` line 87 — a quoted path, not a reference

`94_` §7 resolves `../01_provenance-and-rights.md` from `93_`'s own location, obtains
`docs/research/01_provenance-and-rights.md`, finds nothing there, and files a failure. The line
it read is row 13 of the corrections table in `93_…` §2:

> \| 13 \| `traceability/03_` §1 \| `01_provenance-and-rights.md` cited without `../` from inside
> `traceability/` \| `../01_provenance-and-rights.md` \|

The four cells are **#**, **Location**, **Was**, **Now**. The `../01_…` occupies the *Now*
column: it is the corrected text that this pass wrote **into `traceability/03_`**, where it
resolves to `docs/research/C009-course-content-quality/01_provenance-and-rights.md` and exists.
The Location cell names the file the path belongs to. `93_` is not citing that document; it is
recording a string it wrote elsewhere.

**This is the same category error `93_…` §1 exists to overturn.** That section rejected a review
finding that six `grep -E` scans were broken because their patterns contained `\|`, on the
grounds that the reviewer *"read the raw markdown source as if it were the command."* Reading a
path in a correction record as if it were a live reference is that error applied to a different
column of the same table.

**Disposition: not a defect. No change to `93_`.**

### 4.2 `13_` line 59 — resolvable under `94_`'s own rule

`DEC-11` cites `08_authoring-workflow-and-in-situ-review-loop.md` **§0.2, §5**. `94_` confirms
`08_`'s headings run `## 0. The result, stated first` → `## 1.` with no `### 0.2` between, and
files a failure.

`08_` §0 contains **four numbered statements**, and statement **2** reads:

> **Quarantine is named here and defined nowhere here.** Its record type exists, is reachable,
> and carries exactly three slots — **`reason`**, **`owner`**, **`exit_condition`** — that are
> **present, named, and unpopulated**, each marked **SUB-9-supplied** (§5).

`DEC-11`'s subject is *"the quarantine slot vocabularies are closed"* and its rationale is that
SUB-8 refused to supply example values. Statement 2 is that refusal, stated by SUB-8 itself, and
it points at §5 — the second half of the same citation. The target is unique, and no other
reading is available.

**`94_` §7 states the rule that governs this case and then does not apply it:**

> There are also imprecise but human-resolvable section labels: `§Decision.3` refers to the
> `## Decision` → `### 3. The selection rule` hierarchy … I did not count those as missing
> because the named hierarchy/text is uniquely locatable.

`§0.2` is a `§`-plus-ordinal label denoting an enumerated item within a numbered section, which
is what `§Decision.3` is. Under the report's own standard it resolves.

**Disposition: not a defect.** The citation is imprecise in the same way the package's other
hierarchy labels are, and the observation is worth carrying as a house-form nicety — a numbered
statement is not a heading, and citing it with heading syntax invites exactly this parse. It
does not make the reference unresolvable.

**Consequence: `92_…` §7's cross-reference pass stands.** `94_`'s §7 FAIL, and the "does not
currently satisfy its completeness gate" verdict that rests on it, do not.

## 5. Re-derivation A stands; the blindness claim does not

`94_` §A reports counting `11_…` §10.1's rows before reading §10.2, obtaining
`deterministic 15 / schema 4` against the published `14 / 5`, and publishing the row ids behind
each count.

**The counts are correct.** An independent parse for this record — extracting every §10.1
mechanism cell between the §10.1 and §10.2 headings — returns `deterministic 15 · schema 4 ·
server-side 1 · automated 1` over 23 data rows, matching `94_`'s tally row for row. `11_…`
§10.2's published roll-up is wrong, on a fourth independent count (SUB-13's, `92_…` §9.2's,
`94_`'s, and this one).

**The sequencing claim cannot be sustained.** `OI-S13-1` is defined at `90_…` line 891 under a
heading that states the finding in full — *"`11_…` §10.2's mechanism roll-up disagrees with its
own §10.1 rows"* — and `94_` §5 reports parsing `90_…`'s `#### \`<id>\`` definition headings
mechanically, section by section, as part of the same run. The finding's existence and direction
were available before the count.

**Why it survives anyway:** `94_` published **enumerated row ids**, not bare totals. A
pre-informed reasoner can echo a total; producing a row-level partition that an independent
parser reproduces exactly is a different act. The result is confirmed on its evidence. What is
withdrawn is the claim that it was reached blind.

## 6. The three "stale figures" are timestamp deltas

| Figure | `92_…` | `94_` | Why they differ |
| --- | ---: | ---: | --- |
| Markdown files | 38 | 39 | `93_review-correction-pass.md` landed after `92_…` ran |
| `[future-real-user]` occurrences | 25 in 20 files | 28 in 21 files | Same cause — `93_` discusses the class-7 rule |
| Open items / caps | 103 / 63 | 112 / 64 | `92_…` counted before SUB-12 — the gate itself — filed its own nine open items and one cap |

**A count that was correct when taken is not a defect.** `94_` labels these "disagreement with
the published gate"; they are the ordinary consequence of a register that grows monotonically
being counted at two different commits. `91_…` §R.1 already publishes both the pre- and
post-SUB-12 cap figures (63 and 64) and `94_` §B agrees with both, which is the same fact
appearing as agreement in one section and disagreement in another.

The **underlying** register result is not stale and is the more valuable finding: **112 defined /
112 cited and 64 defined / 64 cited, with zero duplicates, zero collisions, zero numbering gaps
and zero dangling references in either direction**, independently parsed. That is a stronger
integrity statement than the package had before.

## 7. What `94_` establishes

1. **`C-3` is discharged for the completeness gate's subject matter.** 45 attribution lines
   across 39 files carry one author model id, `claude-opus-5[1m]`; `94_` carries
   `gpt-5.6-sol[1m]` and authored none of them. This is the condition `91_…` §R.2 and
   `CAP-S12-1` both name.
2. **The eight gate areas were re-executed, not reviewed.** Each carries the command or parse
   that produced its result, and the rights adjudications were made afresh rather than inherited.
3. **`OI-S13-1` is confirmed by a party outside the package**, on enumerated row evidence.
4. **The registers are mechanically complete** at 112/112 and 64/64, resolved both directions.
5. **The vacuous passes are labelled vacuous** — items 1, 2, 3 and 8 of the §8 checklist, and the
   §4 node audit at denominator 0 — rather than reported as substantive passes.

## 8. What remains open

1. **`94_`'s attribution line names `gpt-5.6-sol[1m]` alone**, while the run was executed by a
   fleet — `gpt-5.6-sol[1m]` orchestrating `gpt-5.6-terra` and `gpt-5.6-luna`. Constitution
   Article 4 requires the artifact to record which model produced it, and six of the eight areas
   were executed by subagents. **This is incomplete provenance, not a routed finding**, and is
   the one amendment `94_`'s author may properly make to its own header. It does not affect
   `C-3`: every model in the fleet differs from `claude-opus-5[1m]`.
2. **The eleven caps are not closed here.** `94_` correctly closes none, and neither does this
   record. Closing them is the ledger owner's act on the evidence in `94_`; `A4` forbids the
   producing party from promoting its own artifact.
3. **`OI-S13-1` remains unrepaired.** Four counts now agree that `11_…` §10.2 is wrong. The
   repair is a single edit to `11_…`, owned by SUB-11, and is still routed rather than made.
4. **`93_…` line 127's `Status: applied`** reads as a governed status to a mechanical parser
   while meaning "these corrections were applied." Worth rewording; harmless as it stands.
5. **The creator-review backlog is untouched.** 179/179 nodes remain
   `creator_review: "deferred-provisional"`. A cross-model pass is NEU-887 class 4
   `[ai-critique]` and never class 3 `[dogfooding]`; `OI-S7-1` names the creator as the only
   qualified reviewer, and no volume of independent model review substitutes for that.
